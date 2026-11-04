---
layout: ../../../layouts/Post.astro
lang: hi
title: "Stabilizer codes"
description: "वह भाषा जिसमें लगभग हर quantum error-correcting code लिखा जाता है। States को उन Pauli operators से बताना जो उन्हें नहीं बदलते, syndromes commute और anticommute से कैसे आते हैं, logical operators और code distance, 7-qubit Steane code (जिसका syndrome error की जगह बता देता है), transversal gates और T कठिन क्यों है, और 5-qubit perfect code।"
date: 2026-11-04
category: lesson
lesson: 34
---

पाठ 33 में आपने Shor के 9-qubit code से एक qubit की रक्षा की और पूरा state vector simulate करके उसे जाँचा: 2⁹ = 512 complex amplitudes। 9 qubits के लिए यह ठीक था। लेकिन असली hardware पर इस्तेमाल होने वाले codes में सैकड़ों या हज़ारों physical qubits होते हैं, और 1,000 qubits के state vector में ब्रह्मांड के atoms से ज़्यादा entries हैं। Codes को बताने का बेहतर तरीका चाहिए।

1997 में Daniel Gottesman ने एक ढूँढा। State के amplitudes की सूची के बजाय, उन operations की सूची बनाओ जो **उसे नहीं बदलते**। Error correction में इस्तेमाल होने वाली states के लिए ऐसे operations की छोटी-सी सूची state को पूरी तरह तय कर देती है, और errors को विशाल matrices की जगह सरल हिसाब-किताब से track किया जा सकता है। यह **stabilizer formalism** है, और यही वह भाषा है जिसमें लगभग हर quantum error-correcting code, पाठ 35 के surface code समेत, design, analyse और simulate होता है।

## Pauli strings

बुनियादी ईंटें **Pauli strings** हैं: हर qubit पर एक Pauli matrix (I, X, Y या Z), आपस में गुणा। तीन qubits के लिए Z⊗Z⊗I को सीधे **ZZI** लिखते हैं, मतलब "पहले दो qubits पर Z, तीसरे पर कुछ नहीं"। Pauli string का **weight** उन qubits की संख्या है जिन्हें वह सचमुच छूती है: ZZI का weight 2 है।

(एक convention याद रखें: Qiskit labels में **qubit 0 दाईं ओर** लिखता है, ठीक अपने bitstrings की तरह। तो Qiskit में `Pauli("IZZ")` का मतलब है qubits 0 और 1 पर Z।)

Pauli strings के तीन गुण उन्हें error correction के लिए आदर्श बनाते हैं:

1. **हर measurement का नतीजा ±1 है।** Pauli string का square identity है, तो उसके eigenvalues +1 और −1 हैं। ZZ measure करना एक हाँ-या-ना सवाल पूछता है: "क्या ये दो qubits मेल खाते हैं?" यह ठीक पाठ 33 का parity check है।
2. **कोई भी दो Pauli strings या तो commute करती हैं या anticommute।** या तो AB = BA या AB = −BA, इससे उलझा कुछ नहीं।
3. **कौन-सा, इसका सरल नियम है।** दोनों strings को एक सीध में रखें और उन जगहों को गिनें जहाँ दोनों में non-identity अक्षर है और अक्षर **अलग** हैं। गिनती सम हो तो commute; विषम हो तो anticommute। जैसे ZZI और XXI दो जगह अलग हैं (Z बनाम X, दो बार), तो commute करती हैं। ZZI और XII एक जगह अलग हैं, तो anticommute।

वह तीसरा नियम पूरे formalism का इंजन है। एक पल में आप देखेंगे क्यों।

## State को उससे बताना जो उसे छोड़ दे

Pauli string S, state |ψ⟩ को **stabilize** करती है अगर S|ψ⟩ = |ψ⟩: state eigenvalue +1 वाला eigenvector है। कुछ उदाहरण:

- |0⟩ को Z stabilize करता है, क्योंकि Z|0⟩ = |0⟩। और |1⟩ को −Z।
- |+⟩ को X stabilize करता है।
- Bell state (|00⟩ + |11⟩)/√2 को **XX** stabilize करता है (दोनों qubits पलटना दोनों पदों की अदला-बदली करता है, जो कुछ नहीं बदलता) और **ZZ** भी (दोनों पदों में qubits बराबर हैं)।
- 3-qubit GHZ state (|000⟩ + |111⟩)/√2 को **XXX**, **ZZI** और **IZZ** stabilize करते हैं।

क्योंकि stabilizer का eigenvalue +1 है, state पर उसे measure करने से हमेशा +1 आता है, और उसका expectation value ठीक +1 है। Qiskit से जाँचें:

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, Pauli

bell = QuantumCircuit(2); bell.h(0); bell.cx(0, 1)
ghz = QuantumCircuit(3); ghz.h(0); ghz.cx(0, 1); ghz.cx(1, 2)

for name, qc, checks in [("Bell", bell, ["XX", "ZZ", "YY", "ZI"]),
                         ("GHZ ", ghz, ["XXX", "ZZI", "IZZ", "XXI"])]:
    state = Statevector(qc)
    row = "   ".join(f"⟨{p}⟩ = {state.expectation_value(Pauli(p)).real:+.0f}" for p in checks)
    print(f"{name}:  {row}")
```

```text
Bell:  ⟨XX⟩ = +1   ⟨ZZ⟩ = +1   ⟨YY⟩ = -1   ⟨ZI⟩ = +0
GHZ :  ⟨XXX⟩ = +1   ⟨ZZI⟩ = +1   ⟨IZZ⟩ = +1   ⟨XXI⟩ = +0
```

Stabilizers ठीक +1 आते हैं। जो operators stabilizers नहीं हैं वे कुछ भी दे सकते हैं: ZI 0 देता है, क्योंकि अकेला पहला qubit 50/50 मिश्रण है।

ध्यान दें YY −1 देता है। यह संयोग नहीं। अगर S₁ और S₂ दोनों किसी state को stabilize करें, तो उनका गुणनफल S₁S₂ भी करता है (एक लगाओ, फिर दूसरा; state कभी नहीं बदलती)। Bell state के लिए XX·ZZ = (XZ)⊗(XZ) = (−iY)⊗(−iY) = −YY। तो **−YY** भी stabilizer है, इसीलिए YY −1 नापता है। किसी state के stabilizers एक **group** बनाते हैं, और आपको सिर्फ़ कुछ **generators** लिखने होते हैं; बाक़ी सब उनके गुणनफल हैं।

मुख्य तथ्य: **n-qubit state को n स्वतंत्र, commute करने वाले stabilizer generators अनोखे रूप से तय करते हैं।** Bell state को सिर्फ़ दो चाहिए (XX और ZZ), GHZ state को तीन। हर generator n अक्षरों की string है, तो विवरण 2ⁿ amplitudes के बजाय लगभग n² चिह्न लेता है। 1,000 qubits के लिए यह दस लाख चिह्नों और एक असंभव संख्या का फ़र्क़ है।

## Stabilizer codes

अब वह विचार जो इसे error correction बनाता है। Qubits से **कम** generators इस्तेमाल करो: n qubits पर n − k स्वतंत्र, commute करने वाली Pauli strings चुनो। उन सबसे stabilize होने वाली states अब एक अकेली state नहीं, बल्कि 2ᵏ dimension की पूरी **space** बनाती हैं। वह space **code space** है, और वह k logical qubits रखती है।

पाठ 33 का bit-flip code सबसे सरल उदाहरण है। उसके generators Z₀Z₁ और Z₁Z₂ हैं: n = 3 qubits, n − k = 2 generators, तो k = 1 logical qubit। |000⟩ और |111⟩ दोनों, और हर superposition α|000⟩ + β|111⟩, दोनों जाँचों पर +1 देते हैं। वह दो-dimensional space code space है।

Generators को commute क्यों करना चाहिए? क्योंकि हम उन सबको measure करना चाहते हैं, और दो observables एक-दूसरे को परेशान किए बिना साथ तभी measure हो सकते हैं जब वे commute करें। Commute करने वाले generators यह भी पक्का करते हैं कि ऐसी states मौजूद हैं जो सबके लिए एक साथ +1 हों।

## Commute और anticommute से syndromes

यहाँ commutation नियम का फ़ायदा मिलता है। मान लें Pauli error E एक encoded state |ψ⟩ पर पड़ता है, और फिर हम generator g measure करते हैं।

- अगर E, g से **commute** करे: g(E|ψ⟩) = E(g|ψ⟩) = E|ψ⟩। Measurement **+1** देता है, मानो कुछ हुआ ही नहीं।
- अगर E, g से **anticommute** करे: g(E|ψ⟩) = −E(g|ψ⟩) = −E|ψ⟩। Measurement **−1** देता है।

तो **syndrome बस उन generators की सूची है जिनसे error anticommute करता है।** कोई state vectors नहीं, कोई amplitudes नहीं, बस अक्षर गिनने का नियम। और syndrome |ψ⟩ पर बिल्कुल निर्भर नहीं, इसीलिए उसे measure करना encoded data के बारे में कुछ नहीं बताता।

यहाँ bit-flip code की syndrome table है, सिर्फ़ Pauli algebra से निकाली (1 का मतलब वह जाँच −1 पढ़ती है):

```python
from qiskit.quantum_info import Pauli

def syndrome(error, generators):
    """1 where the error anticommutes with a generator (that check reads -1), else 0."""
    return "".join("1" if error.anticommutes(g) else "0" for g in generators)

def on(qubit, p, n):
    """A single-qubit Pauli p on one qubit of n, as a Qiskit Pauli (qubit 0 is the rightmost letter)."""
    label = ["I"] * n
    label[n - 1 - qubit] = p
    return Pauli("".join(label))

bit_flip = [Pauli("IZZ"), Pauli("ZZI")]          # Z0Z1 and Z1Z2 (rightmost letter = qubit 0)
for q in range(3):
    print(f"X on qubit {q}: syndrome {syndrome(on(q, 'X', 3), bit_flip)}    "
          f"Z on qubit {q}: syndrome {syndrome(on(q, 'Z', 3), bit_flip)}")
```

```text
X on qubit 0: syndrome 10    Z on qubit 0: syndrome 00
X on qubit 1: syndrome 11    Z on qubit 1: syndrome 00
X on qubit 2: syndrome 01    Z on qubit 2: syndrome 00
```

X errors वही तीन अलग syndromes देते हैं जो हमने पाठ 33 में circuits simulate करके पाए थे। और Z errors 00 देते हैं: वे दोनों generators से commute करते हैं, तो code उन्हें देख नहीं सकता। इसमें कोई state vector नहीं लगा, तो यही function हज़ारों qubits वाले codes पर भी चलता है।

## Logical operators और distance

कुछ Pauli strings **हर** generator से commute करती हैं, और इसलिए उनका syndrome सब-शून्य है। ये दो क़िस्म की हैं, और फ़र्क़ बहुत अहम है:

- **ख़ुद stabilizers** (generators के गुणनफल)। वे code space पर identity की तरह काम करते हैं, तो **हानिरहित** हैं। इसीलिए पाठ 33 में Shor code के एक ही block में दो Z errors ने कुछ नहीं किया: Z₀Z₁ उसके stabilizers में से एक है।
- **Logical operators**: ऐसी strings जो सभी generators से commute करती हैं लेकिन stabilizer group में **नहीं** हैं। वे code space को ख़ुद में ले जाती हैं, लेकिन encoded जानकारी बदल देती हैं। वे ठीक वे gates हैं जो logical qubit पर काम करते हैं, और ठीक वे errors जिन्हें code देख नहीं सकता।

Bit-flip code के लिए logical X है XXX (वह |000⟩ को |111⟩ में ले जाता है), और एक logical Z है Z₀ (वह |000⟩ को + चिह्न देता है और |111⟩ को −)। वह single-qubit Z₀ ही code की घातक कमज़ोरी है: weight-1 error जो पकड़ा नहीं जाता और data बिगाड़ देता है।

Code का **distance** d किसी भी logical operator का सबसे छोटा weight है। यह उन single-qubit errors की संख्या है जो बिना निशान छोड़े encoded data बदल सकें। आम errors के ख़िलाफ़ bit-flip code का d = 1 है (Z₀ की वजह से), और नीचे के codes का d = 3।

इससे यह जाँचने का साफ़ नियम भी मिलता है कि error correction काम किया या नहीं। Decoder syndrome देखता है और correction C लगाता है (आम तौर पर मेल खाने वाला सबसे कम weight का error)। फिर देखें क्या बचा, C·E:

- अगर C·E एक **stabilizer** है, तो correction काम कर गया, भले C ठीक E न हो।
- अगर C·E एक **logical operator** है, तो correction ने चुपचाप data बिगाड़ दिया: एक **logical error**।

## Steane code: syndrome जो जगह बता देता है

1996 में Andrew Steane ने एक 7-qubit code ढूँढा जो कोई भी single-qubit error ठीक करता है और जिसकी बनावट इतनी साफ़-सुथरी है कि जादू जैसी लगती है। वह classical **Hamming code** से बना है, अब तक बने पहले error-correcting codes में से एक (1950)।

7 qubits को 1 से 7 तक नंबर दें और हर नंबर binary में लिखें: 001, 010, 011, …, 111। हर binary अंक के लिए एक parity check बनाएँ: पहली जाँच हर उस qubit को लेती है जिसके नंबर के आख़िरी अंक में 1 है (1, 3, 5, 7), दूसरी हर उसे जिसके बीच वाले अंक में 1 है (2, 3, 6, 7), तीसरी हर उसे जिसके पहले अंक में 1 है (4, 5, 6, 7)। Steane का code हर जाँच **दो बार** इस्तेमाल करता है: एक बार Z-type stabilizer की तरह (X errors पकड़ने को) और एक बार X-type stabilizer की तरह (Z errors पकड़ने को)। 7 qubits पर 6 generators, तो 7 − 6 = 1 logical qubit।

इस तरह दो classical codes से बने codes, एक X errors के लिए और एक Z errors के लिए, Calderbank, Shor और Steane के नाम पर **CSS codes** कहलाते हैं। व्यवहार में यही सबसे अहम परिवार है। देखें syndrome क्या करता है (Qiskit का qubit q, binary योजना में qubit नंबर q + 1 है):

```python
from itertools import product
from qiskit.quantum_info import Pauli

n = 7
rows = [[0, 2, 4, 6], [1, 2, 5, 6], [3, 4, 5, 6]]       # Hamming code checks: qubit q is in row k if bit k of (q+1) is 1

def pauli_on(qubits, p):
    label = ["I"] * n
    for q in qubits:
        label[n - 1 - q] = p                            # Qiskit labels: qubit 0 is the rightmost letter
    return Pauli("".join(label))

z_checks = [pauli_on(r, "Z") for r in rows]             # catch X errors
x_checks = [pauli_on(r, "X") for r in rows]             # catch Z errors
gens = z_checks + x_checks
print("all 6 generators commute:", all(a.commutes(b) for a in gens for b in gens))

def syndrome(err, checks):
    return "".join("1" if err.anticommutes(c) else "0" for c in reversed(checks))   # read as a binary number

print("qubit:      " + "    ".join(str(q) for q in range(n)))
print("X error →   " + "  ".join(syndrome(pauli_on([q], "X"), z_checks) for q in range(n)))
print("Z error →   " + "  ".join(syndrome(pauli_on([q], "Z"), x_checks) for q in range(n)))
```

```text
all 6 generators commute: True
qubit:      0    1    2    3    4    5    6
X error →   001  010  011  100  101  110  111
Z error →   001  010  011  100  101  110  111
```

Qubit q पर error का syndrome **binary में लिखा नंबर q + 1 है**। Qubit 4 पर error 101 देता है, जो 5 है। Decoder को lookup table नहीं चाहिए: वह बस syndrome को नंबर की तरह पढ़ता है। और X जाँचें और Z जाँचें स्वतंत्र रूप से काम करती हैं, तो एक qubit पर X और दूसरे पर Z दोनों एक साथ ढूँढ लिए जाते हैं।

अब असली logical states बनाएँ और कुछ gates आज़माएँ। Generators से code space का projector बना सकते हैं, क्योंकि (I + g)/2 हर generator g का ठीक +1 हिस्सा रखता है:

```python
import numpy as np
from qiskit.quantum_info import Pauli, Statevector, Operator

n = 7
rows = [[0, 2, 4, 6], [1, 2, 5, 6], [3, 4, 5, 6]]
def pauli_on(qubits, p):
    label = ["I"] * n
    for q in qubits:
        label[n - 1 - q] = p
    return Pauli("".join(label))
gens = [pauli_on(r, "Z") for r in rows] + [pauli_on(r, "X") for r in rows]

# Projector onto the code space: keep only states with +1 for every generator
P = np.eye(2 ** n)
for g in gens:
    P = P @ (np.eye(2 ** n) + g.to_matrix()) / 2
print("code space dimension:", round(np.trace(P).real))          # 2^(7-6) = 2: one logical qubit

zero_L = Statevector(P @ Statevector.from_label("0" * n).data)
zero_L = zero_L / np.linalg.norm(zero_L.data)
X_L, Z_L = pauli_on(range(n), "X"), pauli_on(range(n), "Z")
one_L = zero_L.evolve(X_L)
print("|0_L⟩ is a mix of", sum(abs(a) > 1e-9 for a in zero_L.data), "basis states with weights",
      sorted({bin(i).count("1") for i, a in enumerate(zero_L.data) if abs(a) > 1e-9}))
print(f"⟨Z_L⟩ on |0_L⟩ = {zero_L.expectation_value(Z_L).real:+.0f},  on |1_L⟩ = {one_L.expectation_value(Z_L).real:+.0f}")

H7 = Operator.from_label("H" * n)
plus_L = Statevector((zero_L.data + one_L.data) / np.sqrt(2))
print(f"H on all 7 qubits: |⟨+_L| H⊗7 |0_L⟩|² = {abs(plus_L.inner(zero_L.evolve(H7))) ** 2:.4f}")

T = np.diag([1, np.exp(1j * np.pi / 4)])
T7 = Operator(T)
for _ in range(n - 1):
    T7 = T7.tensor(Operator(T))
after = zero_L.evolve(T7).data
print(f"T on all 7 qubits: probability of staying in the code space = {np.vdot(after, P @ after).real:.4f}")
```

```text
code space dimension: 2
|0_L⟩ is a mix of 8 basis states with weights [0, 4]
⟨Z_L⟩ on |0_L⟩ = +1,  on |1_L⟩ = -1
H on all 7 qubits: |⟨+_L| H⊗7 |0_L⟩|² = 1.0000
T on all 7 qubits: probability of staying in the code space = 0.5625
```

चार बातें ध्यान दें:

- Code space सचमुच 2-dimensional है: एक logical qubit।
- |0_L⟩, 8 bitstrings का बराबर superposition है: 0000000 और weight 4 की सात strings। ये ठीक classical Hamming code के सम-weight codewords हैं।
- Logical X और Z, **सभी सात** qubits पर X और Z हैं (उनका weight 7 है, लेकिन weight 3 के बराबर रूप भी हैं, जो code का distance है)।
- **हर qubit पर H लगाने से logical H होता है।** वह |0_L⟩ को पूरी तरह |+_L⟩ बना देता है।

उस आख़िरी गुण को **transversal** gate कहते हैं: logical gate जो हर qubit पर अलग-अलग physical gate लगाकर होता है। Transversal gates fault tolerance के लिए शानदार हैं, क्योंकि एक physical gate की गड़बड़ी block के सिर्फ़ एक qubit को बिगाड़ सकती है, जिसे code फिर ठीक कर देता है। Steane code पर H, CNOT (दो code blocks के बीच, qubit-दर-qubit) और S सभी transversal हैं। (S में एक छोटा पेंच है: हर qubit पर S, logical **S†** देता है, तो logical S के लिए हर qubit पर S† लगाते हैं।)

लेकिन T नहीं। सातों qubits पर T लगाना state को **code space से बाहर** धकेल देता है: उसका सिर्फ़ 56% वैध codeword बचता है। यह Steane code की कमी नहीं। **Eastin–Knill प्रमेय** (2009) साबित करता है कि errors पकड़ सकने वाले **किसी भी** quantum code में transversal gates का universal set नहीं होता। हर code में कम से कम एक कठिन gate होता है, और ज़्यादातर व्यावहारिक codes के लिए वह gate T है। पाठ 35 दिखाता है कि fault-tolerant machines इससे कैसे निपटती हैं, **magic state distillation** से।

## एक decoder, और वह कैसे fail होता है

आइए टुकड़े जोड़ें: Steane code के लिए एक decoder जो error का X हिस्सा और Z हिस्सा उनके syndromes से ढूँढता है, correction लगाता है, और फिर बचे हुए C·E को stabilizer group (generators के सभी 2⁶ = 64 गुणनफल) से जाँचता है:

```python
from itertools import product
from qiskit.quantum_info import Pauli

n = 7
rows = [[0, 2, 4, 6], [1, 2, 5, 6], [3, 4, 5, 6]]
def pauli_on(qubits, p):
    label = ["I"] * n
    for q in qubits:
        label[n - 1 - q] = p
    return Pauli("".join(label))
z_checks = [pauli_on(r, "Z") for r in rows]
x_checks = [pauli_on(r, "X") for r in rows]
gens = z_checks + x_checks

def position(err, checks):
    """The Steane syndrome spells the error's position in binary (0 means no error)."""
    return sum(2 ** k for k, c in enumerate(checks) if err.anticommutes(c))

def decode(err):
    """Find the X part and the Z part of the error separately, and undo each."""
    fix = Pauli("I" * n)
    if (q := position(err, z_checks)):
        fix = fix.compose(pauli_on([q - 1], "X"))
    if (q := position(err, x_checks)):
        fix = fix.compose(pauli_on([q - 1], "Z"))
    return fix

stabilizers = set()
for bits in product([0, 1], repeat=len(gens)):
    s = Pauli("I" * n)
    for b, g in zip(bits, gens):
        if b:
            s = s.compose(g)
    stabilizers.add(s.to_label().lstrip("-i"))

def outcome(err):
    leftover = decode(err).compose(err)                 # what remains after the correction
    if leftover.to_label().lstrip("-i") in stabilizers:
        return "fixed"
    return "LOGICAL ERROR" if all(leftover.commutes(g) for g in gens) else "still detectable"

single = [pauli_on([q], p) for q in range(n) for p in "XYZ"]
print("21 single-qubit errors:", {outcome(e) for e in single})
print("X on qubits 0 and 1:  ", outcome(pauli_on([0, 1], "X")))
print("X on 0, Z on 1:       ", outcome(pauli_on([0], "X").compose(pauli_on([1], "Z"))))
```

```text
21 single-qubit errors: {'fixed'}
X on qubits 0 and 1:   LOGICAL ERROR
X on 0, Z on 1:        fixed
```

सभी 21 single-qubit errors (7 qubits में से हर एक पर X, Y या Z) ठीक होते हैं। Y error बस एक ही qubit पर X और Z है, और decoder के दोनों हिस्से एक-एक संभालते हैं।

Qubits 0 और 1 पर दो X errors अलग कहानी हैं। उनका मिला syndrome 001 XOR 010 = 011 है, जो कहता है "qubit 2"। Decoder qubit 2 पर X लगाता है, और बचा X₀X₁X₂ weight-3 का **logical operator** है। Decoder ने ठीक होने लायक़ दिखती स्थिति को logical error में बदल दिया। Distance 3 का यही मतलब है: ग़लत जगहों पर तीन errors code को धोखा देते हैं, और दो errors decoder को तीसरा ख़ुद जोड़ने के लिए भटका सकते हैं।

आख़िरी पंक्ति CSS codes की एक ताक़त दिखाती है: एक qubit पर X error और दूसरे पर Z error फिर भी ठीक होते हैं, क्योंकि X errors और Z errors अलग-अलग decode होते हैं। सिर्फ़ **एक ही क़िस्म** के दो errors मुसीबत लाते हैं।

## 5-qubit perfect code

कोई code कितना छोटा हो सकता है और फिर भी कोई भी single-qubit error ठीक करे? Syndromes गिनें। n qubits पर 3n single-qubit errors हैं (हर एक पर X, Y या Z), और हर एक को अपना syndrome चाहिए, ऊपर से "कोई error नहीं" के लिए एक। n − 1 generators (एक logical qubit के लिए) से 2ⁿ⁻¹ संभव syndromes हैं। तो हमें चाहिए:

> 2ⁿ⁻¹ ≥ 3n + 1

यह **quantum Hamming bound** है। n = 4 पर: 8 ≥ 13 ग़लत है। n = 5 पर: 16 ≥ 16, ठीक बराबर। तो पाँच qubits न्यूनतम है, और 5-qubit code को **हर** syndrome इस्तेमाल करना होगा, एक भी बेकार नहीं। ऐसा code मौजूद है, 1996 में Laflamme, Miquel, Paz और Zurek ने और स्वतंत्र रूप से Bennett, DiVincenzo, Smolin और Wootters ने ढूँढा। उसके generators XZZXI और उसके cyclic shifts हैं:

```python
from qiskit.quantum_info import Pauli

gens = [Pauli(s) for s in ["XZZXI", "IXZZX", "XIXZZ", "ZXIXZ"]]     # cyclic shifts of XZZX
print("generators commute:", all(a.commutes(b) for a in gens for b in gens))

def syndrome(err):
    return "".join("1" if err.anticommutes(g) else "0" for g in gens)

seen = set()
print("      q0      q1      q2      q3      q4")
for p in "XYZ":
    row = []
    for q in range(5):
        label = ["I"] * 5
        label[4 - q] = p
        row.append(syndrome(Pauli("".join(label))))
    seen.update(row)
    print(f"{p}   " + "    ".join(row))
print(f"{len(seen)} different syndromes, plus 0000 for 'no error' = {len(seen) + 1} = 2^4: every syndrome is used")
```

```text
generators commute: True
      q0      q1      q2      q3      q4
X   0011    0110    1100    1000    0001
Y   0111    1111    1110    1101    1011
Z   0100    1001    0010    0101    1010
15 different syndromes, plus 0000 for 'no error' = 16 = 2^4: every syndrome is used
```

पंद्रह errors, पंद्रह अलग non-zero syndromes, और 0000 के साथ सभी 16 संभव syndromes इस्तेमाल हुए। इसीलिए इसे **perfect** कहते हैं। लेकिन यह CSS code नहीं है (इसके generators X और Z मिलाते हैं), जिससे इसके logical gates बनाना कठिन है। व्यवहार में थोड़े बड़े CSS codes पसंद किए जाते हैं।

## Stabilizer codes simulate करना आसान क्यों है

Pauli noise वाले error-correction cycle में सब कुछ Clifford operations से बना है: H, S और CNOT से encoding, Pauli errors, और Pauli strings measure करना। Gottesman–Knill प्रमेय (पाठ 17) के मुताबिक़ ऐसे circuits साधारण computer पर कुशलता से simulate हो सकते हैं, amplitudes के बजाय यह track करके कि stabilizer generators कैसे बदलते हैं।

यह बेहद काम का है। Researchers codes और decoders को हज़ारों qubits के साथ लाखों simulated error-correction rounds पर, एक laptop पर, परखते हैं। व्यापक रूप से इस्तेमाल होने वाला open-source simulator **Stim** (Craig Gidney, 2021) ठीक यही करता है। Qiskit Aer यही तरकीब `AerSimulator(method="stabilizer")` से देता है। इसी वजह से error-correction research hardware से बहुत आगे दौड़ सकती है।

## Codes की गैलरी

| Code | [[n, k, d]] | टिप्पणी |
|---|---|---|
| Bit-flip (repetition) | [[3, 1, 1]] | सिर्फ़ X पकड़ता है; अकेले X errors के ख़िलाफ़ distance 3 |
| 5-qubit perfect code | [[5, 1, 3]] | कोई भी एक error ठीक करने वाला सबसे छोटा code |
| Steane code | [[7, 1, 3]] | CSS, Hamming code से; transversal H, S, CNOT |
| Shor code | [[9, 1, 3]] | पहला quantum code (1995) |
| Surface code | [[d², 1, d]] | 2D grid पर सिर्फ़ पड़ोसियों के बीच जाँच; hardware का पसंदीदा (पाठ 35) |
| Bivariate bicycle ("gross") code | [[144, 12, 12]] | नया "qLDPC" code: 144 में 12 logical qubits, लंबी दूरी के connections के साथ (IBM, 2024) |

आख़िरी पंक्ति का रुझान अहम है। Surface code बनाना आसान है लेकिन हर patch में सिर्फ़ एक logical qubit रखता है। नए **qLDPC** (quantum low-density parity-check) codes ज़्यादा कुशलता से कई logical qubits रखते हैं, दूर के qubits के बीच connections की क़ीमत पर। असली hardware पर कौन-सा तरीका जीतेगा, यह field के सबसे सक्रिय सवालों में से एक है।

## आज़माकर देखें

1. XXZ और ZXX commute करती हैं या anticommute?
2. Bell state (|01⟩ + |10⟩)/√2 के दो stabilizer generators क्या हैं?
3. एक code में 12 physical qubits और 10 स्वतंत्र stabilizer generators हैं। वह कितने logical qubits रखता है?
4. Steane code में qubit 5 (Qiskit नंबरिंग) पर Z error पड़ता है। X जाँचें कौन-सा syndrome देती हैं?
5. Bit-flip code में Z₀ एक logical operator है लेकिन Z₀Z₁ एक stabilizer। हर एक α|000⟩ + β|111⟩ के साथ क्या करता है?
6. Quantum Hamming bound से दिखाएँ कि कोई 4-qubit code हर single-qubit error ठीक नहीं कर सकता।
7. Transversal gates fault tolerance के लिए अच्छे क्यों हैं?

**जवाब:**

1. जगह-दर-जगह तुलना करें: X बनाम Z (अलग), X बनाम X (एक), Z बनाम X (अलग)। दो अंतर, सम संख्या, तो वे **commute** करती हैं।
2. **XX** (दोनों qubits पलटना |01⟩ ↔ |10⟩ करता है) और **−ZZ** (दोनों पदों में qubits अलग हैं, तो ZZ −1 देता है)।
3. k = n − (generators की संख्या) = 12 − 10 = **2** logical qubits।
4. Qiskit का qubit 5, binary योजना में qubit नंबर 6 है, तो syndrome **110** है।
5. Z₀ देता है α|000⟩ − β|111⟩: एक अलग, वैध encoded state, तो data बिना किसी syndrome के बिगड़ जाता है। Z₀Z₁ देता है α|000⟩ + β|111⟩ बिना बदले, क्योंकि हर branch दो बराबर चिह्न पाती है।
6. n = 4 और एक logical qubit के साथ 3 generators हैं, तो 2³ = 8 syndromes। लेकिन 3·4 + 1 = 13 स्थितियों को अलग syndromes चाहिए, और 8 < 13।
7. हर physical gate code block के सिर्फ़ एक qubit को छूता है, तो एक ख़राब gate block में ज़्यादा से ज़्यादा एक error करता है, जिसे code ठीक कर सकता है। Non-transversal gate एक गड़बड़ी को कई qubits पर फैला सकता है।

## सार-सूत्र

| विचार | सूत्र या तथ्य |
|---|---|
| Pauli string | हर qubit पर I, X, Y, Z में से एक, जैसे ZZI; weight = non-I अक्षरों की संख्या |
| Commutation नियम | वे जगहें गिनें जहाँ दोनों non-I हैं और अलग: सम → commute, विषम → anticommute |
| Stabilizer | S\|ψ⟩ = \|ψ⟩; stabilizers के गुणनफल भी stabilizers |
| State बताना | n स्वतंत्र commute करते generators एक n-qubit state तय करते हैं |
| Stabilizer code | n qubits पर n − k generators → 2ᵏ-dimensional code space, k logical qubits |
| Syndrome | हर उस generator के लिए 1 जिससे error anticommute करे |
| हानिरहित errors | Stabilizer group के errors identity की तरह काम करते हैं |
| Logical operator | सभी generators से commute, लेकिन stabilizer नहीं |
| Distance d | Logical operator का सबसे छोटा weight; ⌊(d − 1)/2⌋ errors ठीक करता है |
| Decoder सफलता | Correction C काम करता है अगर C·E stabilizer हो; fail अगर C·E logical हो |
| CSS code | दो classical codes से अलग X-type और Z-type जाँचें |
| Steane code | [[7, 1, 3]]; syndrome = binary में error की जगह |
| Transversal gate | हर qubit पर अलग physical gate; errors नहीं फैलाता |
| Eastin–Knill | Error पकड़ने वाले किसी code में universal transversal gate set नहीं |
| 5-qubit code | [[5, 1, 3]]; quantum Hamming bound 2ⁿ⁻¹ ≥ 3n + 1 को ठीक पूरा करता है |
| Simulation | Stabilizer circuits classically आसान (Gottesman–Knill); tools: Stim, Aer `method="stabilizer"` |
