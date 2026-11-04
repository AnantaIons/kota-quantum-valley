---
layout: ../../../layouts/Post.astro
lang: hi
title: "आपका पहला error-correcting code"
description: "ऐसे qubit की रक्षा कैसे करें जिसे न copy कर सकते हैं न देख सकते हैं। Classical repetition code और वह क्यों काम करता है, qubits की तीन रुकावटें, parity checks और syndromes वाला 3-qubit bit-flip code, Qiskit में पूरा correct-और-जाँचो cycle, syndrome measure करना बिखरे errors को साफ़ कैसे बनाता है, phase-flip code, और Shor का 9-qubit code जो कोई भी single-qubit error ठीक करता है।"
date: 2026-11-04
category: lesson
lesson: 33
---

पाठ 32 एक कड़वे तथ्य पर ख़त्म हुआ: हर gate पर error rate ε हो, तो आप लगभग 1/ε gates ही चला सकते हैं, उसके बाद जवाब ज़्यादातर noise है। आज के सबसे अच्छे gates कुछ हज़ार देते हैं। काम के algorithms को अरबों चाहिए। अकेला बेहतर hardware यह फ़ासला नहीं पाटेगा।

Classical computers ने दशकों पहले यही समस्या झेली, और उसे **redundancy** से हल किया: जानकारी एक से ज़्यादा बार रखो, और अतिरिक्त प्रतियों से ग़लतियाँ पकड़ो और ठीक करो। आपका phone यह लगातार करता है, अपनी memory, Wi-Fi और storage में। यह पाठ दिखाता है कि qubits के लिए यही कैसे करें, जो हैरान करने वाली हद तक बारीक निकलता है। आप एक असली quantum error-correcting code बनाएँगे, उसे Qiskit में errors ठीक करते देखेंगे, और फिर वह 9-qubit code देखेंगे जिसने पहली बार साबित किया कि quantum error correction संभव है।

## Classical विचार: दोहराओ और vote करो

सबसे सरल classical code **repetition code** है। एक bit भेजने के लिए तीन प्रतियाँ भेजो: 0 बनता है 000, और 1 बनता है 111। अगर noise हर bit को स्वतंत्र रूप से probability p से पलटे, तो पाने वाला **majority vote** लेता है। Vote तभी ग़लत होता है जब दो या तीन प्रतियाँ पलटी हों:

> P(fail) = 3p²(1 − p) + p³ = 3p² − 2p³

उस सूत्र को दस लाख simulated संदेशों से जाँचें:

```python
import numpy as np
rng = np.random.default_rng(1)

print("   p      one bit    3 copies + majority vote   formula 3p² - 2p³")
for p in [0.001, 0.01, 0.1, 0.3, 0.5]:
    flips = rng.random((1_000_000, 3)) < p                # which of the 3 copies got flipped
    fail = np.mean(flips.sum(axis=1) >= 2)                # the vote is wrong if 2 or 3 flipped
    print(f"{p:6.3f}    {p:.4f}         {fail:.6f}                {3 * p**2 - 2 * p**3:.6f}")
```

```text
p      one bit    3 copies + majority vote   formula 3p² - 2p³
 0.001    0.0010         0.000003                0.000003
 0.010    0.0100         0.000298                0.000298
 0.100    0.1000         0.027886                0.028000
 0.300    0.3000         0.216358                0.216000
 0.500    0.5000         0.500064                0.500000
```

पहली पंक्तियाँ देखें। p = 1% पर अकेला bit 1% समय fail होता है, लेकिन encoded bit सिर्फ़ 0.03% समय, 30 गुना से ज़्यादा बेहतर। वजह है **p²**: code को धोखा देने के लिए noise को **दो** bits पर पड़ना होगा, और दो स्वतंत्र दुर्लभ घटनाएँ एक से कहीं ज़्यादा दुर्लभ हैं।

आख़िरी पंक्ति भी देखें। p = 0.5 पर code कुछ नहीं करता, और p के 0.5 से ऊपर होने पर वह हालात **बदतर** करता। Redundancy तभी मदद करती है जब कच्चा error rate किसी **threshold** से नीचे हो। यह विचार पाठ 35 में केंद्रीय बनेगा।

## Qubits की तीन रुकावटें

यह विचार qubits पर ले जाएँ, और तुरंत तीन दीवारें आती हैं:

1. **Qubit copy नहीं हो सकता।** No-cloning प्रमेय (पाठ 16) अनजान |ψ⟩ को |ψ⟩|ψ⟩|ψ⟩ बनाने से मना करता है।
2. **आप उसे देख नहीं सकते।** Majority vote को bits पढ़ने होते हैं। Qubit measure करना उसका superposition नष्ट करता है, जो ठीक वही चीज़ है जिसकी हम रक्षा कर रहे हैं।
3. **Errors लगातार (continuous) हैं, और ज़्यादा क़िस्मों के।** Classical bit सिर्फ़ पलट सकता है। Qubit किसी भी axis के गिर्द किसी भी छोटे कोण से घूम सकता है, और उस पर **phase** errors (Z) पड़ सकते हैं जिनका कोई classical जोड़ ही नहीं।

1990 के दशक की शुरुआत में कुछ समय तक कई physicists सोचते थे कि ये रुकावटें quantum error correction को असंभव बनाती हैं। 1995 में Peter Shor ने दिखाया कि वे ग़लत थे। हर रुकावट से बचने का एक सुंदर रास्ता है, और नीचे का 3-qubit code पहली दो दिखाता है।

## Copy नहीं, फैलाना

|ψ⟩ = α|0⟩ + β|1⟩ को copy करने के बजाय, हम उसे दो CNOTs से दो नए qubits के साथ **entangle** करते हैं:

> α|0⟩ + β|1⟩  →  α|000⟩ + β|111⟩

ये तीन प्रतियाँ नहीं हैं। |+⟩ की तीन प्रतियाँ |+⟩|+⟩|+⟩ होतीं, एक product state। इसके बजाय |+⟩ को encode करने से (|000⟩ + |111⟩)/√2 मिलता है, entangled GHZ state। Amplitudes α और β सिर्फ़ **एक बार** आते हैं, तीनों qubits में साझा। No-cloning का पालन होता है।

दो states |000⟩ और |111⟩ को **logical** |0⟩ और |1⟩ कहते हैं, अक्सर |0_L⟩ और |1_L⟩ लिखा जाता है। तीन असली qubits **physical** qubits हैं। एक logical qubit, तीन physical।

## Values नहीं, फ़र्क़ जाँचो

अब मान लें एक X error तीन में से एक qubit को पलटता है, कहें qubit 1। State बनती है α|010⟩ + β|101⟩। α और β जाने बिना कैसे पता करें कि कौन-सा qubit पलटा?

तरकीब है **फ़र्क़** के बारे में पूछना, values के बारे में नहीं। दो हाँ-या-ना सवाल पूछें:

- क्या qubits 0 और 1 **मेल खाते** हैं? (यह parity Z₀Z₁ है: मेल खाएँ तो +1, न खाएँ तो −1।)
- क्या qubits 1 और 2 मेल खाते हैं? (Parity Z₁Z₂।)

ये सवाल सुरक्षित क्यों हैं। α|010⟩ + β|101⟩ में **दोनों** branches में qubit 0 और qubit 1 मेल नहीं खाते। तो पहले सवाल का जवाब पक्का "नहीं" है, α और β जो भी हों। Measurement **error** के बारे में कुछ सीखता है, और **data** के बारे में कुछ नहीं। क्योंकि दोनों branches में जवाब एक है, उसे measure करने से उनके बीच का superposition नहीं टूटता।

जवाबों की जोड़ी को **syndrome** कहते हैं, चिकित्सा से उधार लिया शब्द: वे लक्षण जो बीमारी की ओर इशारा करें।

| Qubits 0, 1 मेल खाते? | Qubits 1, 2 मेल खाते? | निदान | इलाज |
|---|---|---|---|
| हाँ | हाँ | कोई error नहीं | कुछ नहीं |
| **नहीं** | हाँ | qubit 0 पलटा | qubit 0 पर X |
| **नहीं** | **नहीं** | qubit 1 पलटा | qubit 1 पर X |
| हाँ | **नहीं** | qubit 2 पलटा | qubit 2 पर X |

Data qubits को measure किए बिना parity नापने के लिए, |0⟩ से शुरू होने वाला एक अतिरिक्त qubit लें, जिसे **ancilla** कहते हैं। दोनों data qubits में से हर एक से ancilla पर एक CNOT, |1⟩ वाले हर data qubit के लिए उसे एक बार पलटता है, तो ancilla उनकी parity लिए बैठता है (मेल खाएँ तो 0, न खाएँ तो 1)। Ancilla measure करें, और आपके पास एक syndrome bit है।

## Qiskit में पूरा cycle

यहाँ पूरा error-correction cycle है: एक मनमानी state encode करो, उस पर error मारो, दो ancillas से syndrome measure करो, **classical feed-forward** (`if_test`, पाठ 19) से इलाज लगाओ, decode करो, और नतीजे की मूल state से तुलना करो:

```python
import numpy as np
from qiskit import QuantumCircuit, ClassicalRegister, QuantumRegister
from qiskit.quantum_info import Statevector, state_fidelity
from qiskit_aer import AerSimulator

theta, phi = 1.1, 0.7                        # an arbitrary qubit state to protect
psi = QuantumCircuit(1); psi.ry(theta, 0); psi.rz(phi, 0)
target = Statevector(psi)

def bit_flip_cycle(error_on=None):
    data, anc = QuantumRegister(3, "d"), QuantumRegister(2, "a")
    syn = ClassicalRegister(2, "s")
    qc = QuantumCircuit(data, anc, syn)
    qc.ry(theta, 0); qc.rz(phi, 0)           # the state to protect, on d0
    qc.cx(0, 1); qc.cx(0, 2)                 # encode: α|000⟩ + β|111⟩
    if error_on is not None:
        qc.x(error_on)                       # an X error hits one data qubit
    qc.cx(0, 3); qc.cx(1, 3)                 # a0 = parity of d0, d1
    qc.cx(1, 4); qc.cx(2, 4)                 # a1 = parity of d1, d2
    qc.measure(anc, syn)                     # the syndrome
    with qc.if_test((syn, 0b01)): qc.x(0)    # a0 only      -> d0 flipped
    with qc.if_test((syn, 0b11)): qc.x(1)    # a0 and a1    -> d1 flipped
    with qc.if_test((syn, 0b10)): qc.x(2)    # a1 only      -> d2 flipped
    qc.cx(0, 2); qc.cx(0, 1)                 # decode back onto d0
    qc.save_density_matrix([0])
    return qc

sim = AerSimulator(seed_simulator=1)
for err in [None, 0, 1, 2]:
    res = sim.run(bit_flip_cycle(err), shots=1, memory=True).result()
    s = res.get_memory()[0]
    f = state_fidelity(res.data()["density_matrix"], target)
    print(f"error on {str(err):4s}  syndrome (a1 a0) = {s}   fidelity after correction = {f:.4f}")
```

```text
error on None  syndrome (a1 a0) = 00   fidelity after correction = 1.0000
error on 0     syndrome (a1 a0) = 01   fidelity after correction = 1.0000
error on 1     syndrome (a1 a0) = 11   fidelity after correction = 1.0000
error on 2     syndrome (a1 a0) = 10   fidelity after correction = 1.0000
```

हर syndrome table से मेल खाता है (Qiskit bits दाएँ से बाएँ छापता है, तो a1 पहले आता है), और हर मामले में decoded qubit **ठीक** मूल state है, fidelity 1। Code ने कभी α या β नहीं जाना, कभी कुछ copy नहीं किया, फिर भी error ठीक कर दिया। रुकावटें 1 और 2 हार गईं।

## Syndrome measure करना errors को discrete बनाता है

अब रुकावट 3: असली errors साफ़ X flips नहीं होते। अगर qubit 1 एक छोटे, अनचाहे कोण RX(0.3) से घूम जाए तो? यह continuous error है, थोड़ा-सा "flip" और बहुत सारा "कुछ नहीं":

> RX(0.3) = cos(0.15)·I − i·sin(0.15)·X

इस error के बाद encoded state "कोई error नहीं हुआ" (amplitude cos 0.15) और "qubit 1 पर X हुआ" (amplitude −i sin 0.15) का superposition है। Syndrome measure करना उसे चुनने पर मजबूर करता है। Probability cos²(0.15) ≈ 97.8% से syndrome कहता है "कोई error नहीं", और state वापस perfect encoded state में **collapse** हो जाती है। Probability sin²(0.15) ≈ 2.2% से वह कहता है "qubit 1 पलटा", state एक साफ़ X error में collapse होती है, और इलाज उसे हटा देता है। दोनों तरह से नतीजा perfect है:

```python
import numpy as np
from qiskit import QuantumCircuit, ClassicalRegister, QuantumRegister
from qiskit.quantum_info import Statevector, state_fidelity
from qiskit_aer import AerSimulator

theta, phi = 1.1, 0.7
psi = QuantumCircuit(1); psi.ry(theta, 0); psi.rz(phi, 0)
target = Statevector(psi)

def cycle(error):
    data, anc = QuantumRegister(3, "d"), QuantumRegister(2, "a")
    syn = ClassicalRegister(2, "s")
    qc = QuantumCircuit(data, anc, syn)
    qc.ry(theta, 0); qc.rz(phi, 0)
    qc.cx(0, 1); qc.cx(0, 2)
    error(qc)
    qc.cx(0, 3); qc.cx(1, 3)
    qc.cx(1, 4); qc.cx(2, 4)
    qc.measure(anc, syn)
    with qc.if_test((syn, 0b01)): qc.x(0)
    with qc.if_test((syn, 0b11)): qc.x(1)
    with qc.if_test((syn, 0b10)): qc.x(2)
    qc.cx(0, 2); qc.cx(0, 1)
    qc.save_density_matrix([0])
    return qc

sim = AerSimulator(seed_simulator=3)
res = sim.run(cycle(lambda qc: qc.rx(0.3, 1)), shots=10_000).result()
print("small RX(0.3) error on d1:")
print("  syndromes:", dict(sorted(res.get_counts().items())))
print(f"  predicted: '00' with prob cos²(0.15) = {np.cos(0.15)**2:.4f}, '11' with prob sin²(0.15) = {np.sin(0.15)**2:.4f}")
print(f"  fidelity after correction: {state_fidelity(res.data()['density_matrix'], target):.4f}")
res = sim.run(cycle(lambda qc: qc.z(1)), shots=1000).result()
print("Z error on d1:")
print("  syndromes:", dict(res.get_counts()))
print(f"  fidelity after correction: {state_fidelity(res.data()['density_matrix'], target):.4f}")
```

```text
small RX(0.3) error on d1:
  syndromes: {'00': 9769, '11': 231}
  predicted: '00' with prob cos²(0.15) = 0.9777, '11' with prob sin²(0.15) = 0.0223
  fidelity after correction: 1.0000
Z error on d1:
  syndromes: {'00': 1000}
  fidelity after correction: 0.2057
```

10,000 runs में syndrome लगभग ठीक भविष्यवाणी के मुताबिक़ बँटा, और correction के बाद औसत fidelity 1.0000 है। यह **error discretisation** है, field के सबसे अहम विचारों में से एक: **जो code X errors ठीक कर सकता है, वह X से बने हर छोटे rotation को अपने आप ठीक करता है**, क्योंकि syndrome measurement continuous error को या तो "कुछ नहीं" या "साफ़ X" में बदल देता है।

ज़्यादा आम तौर पर, एक qubit पर कोई भी error, कितना भी बिखरा हुआ, a·I + b·X + c·Y + d·Z के मेल के रूप में लिखा जा सकता है। क्योंकि Y = i·X·Z, जो code किसी qubit पर X और Z दोनों ठीक करे, वह उस qubit पर **हर** संभव error ठीक करता है। हमें सिर्फ़ दो क़िस्म के errors की चिंता करनी है।

लेकिन दूसरा test देखें। Qubit 1 पर **Z** error ने syndrome 00 ("सब ठीक") दिया और data को ख़राब छोड़ दिया, fidelity 0.21। Bit-flip code phase errors के प्रति पूरी तरह अंधा है। किसी एक qubit पर Z, α|000⟩ + β|111⟩ को α|000⟩ − β|111⟩ में बदलता है, जो एक बिल्कुल वैध encoded state है, बस ग़लत वाली। हमें Z से भी सुरक्षा चाहिए।

## Phase-flip code

सुंदर बात यह है: **Hadamard basis में Z, X जैसा दिखता है।** क्योंकि HZH = X, |+⟩ पर phase flip उसे |−⟩ बना देता है, ठीक जैसे bit flip |0⟩ को |1⟩ बनाता है।

तो phase flips से बचने के लिए सब कुछ Hadamard basis में करें:

- **Encode:** वही दो CNOTs, फिर तीनों qubits पर H। Logical states बनती हैं |+++⟩ और |−−−⟩।
- **जाँच:** Z values की जगह X values की तुलना करें: parities X₀X₁ और X₁X₂। (Circuit में, parity check से पहले और बाद हर data qubit पर एक H।)
- **इलाज:** syndrome जिस qubit की ओर इशारा करे उस पर Z लगाएँ।

Phase-flip code कोई भी एक Z error ठीक करता है, लेकिन अब वह X errors के प्रति अंधा है। हर 3-qubit code सिर्फ़ एक क़िस्म के error से बचाता है। दोनों से बचने के लिए, हम उन्हें जोड़ते हैं।

## Shor का 9-qubit code

1995 में Shor का विचार था दोनों codes को **एक के अंदर एक** रखना, एक तकनीक जिसे **concatenation** कहते हैं:

1. पहले qubit को **phase-flip** code से तीन qubits में encode करो।
2. फिर उन तीनों में से **हर एक** को **bit-flip** code से encode करो।

इससे 3 × 3 = 9 physical qubits मिलते हैं, तीन-तीन के तीन blocks में:

> |0_L⟩ = (|000⟩ + |111⟩)(|000⟩ + |111⟩)(|000⟩ + |111⟩) / 2√2
>
> |1_L⟩ = (|000⟩ − |111⟩)(|000⟩ − |111⟩)(|000⟩ − |111⟩) / 2√2

किसी भी qubit पर **X** error उसके block के अंदर, bit-flip code के parity checks से पकड़ा जाता है। किसी भी qubit पर **Z** error उसके block का चिह्न + से − कर देता है, और वह blocks के चिह्नों की आपस में तुलना से पकड़ा जाता है, जो phase-flip code का काम है। **Y** error एक साथ दोनों है, और दोनों इलाज पाता है।

आइए इस दावे को जाँचें कि यह **कोई भी** single-qubit error ठीक करता है। नीचे का decoder एक बढ़िया shortcut लेता है: syndromes measure करने के बजाय, वह Toffoli gates को अंदरूनी majority votes की तरह इस्तेमाल करता है (Toffoli पहले qubit को तभी पलटता है जब बाक़ी दोनों हाँ कहें)। असली machines इसके बजाय syndromes measure करती हैं, जैसे पिछले उदाहरण में, लेकिन तर्क वही है और यह version जाँचना आसान है:

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, partial_trace, state_fidelity, random_unitary

theta, phi = 1.1, 0.7
psi = QuantumCircuit(1); psi.ry(theta, 0); psi.rz(phi, 0)
target = Statevector(psi)

def shor_encode():
    qc = QuantumCircuit(9)
    qc.ry(theta, 0); qc.rz(phi, 0)            # the state to protect, on qubit 0
    qc.cx(0, 3); qc.cx(0, 6)                  # phase-flip layer: spread over 3 blocks
    qc.h([0, 3, 6])
    for b in (0, 3, 6):                       # bit-flip layer: each block → 3 qubits
        qc.cx(b, b + 1); qc.cx(b, b + 2)
    return qc

def shor_decode(qc):
    for b in (0, 3, 6):                       # undo each block, then a majority vote
        qc.cx(b, b + 1); qc.cx(b, b + 2)
        qc.ccx(b + 2, b + 1, b)               # flip the leader if both others say so
    qc.h([0, 3, 6])
    qc.cx(0, 3); qc.cx(0, 6)
    qc.ccx(6, 3, 0)                           # majority vote across the blocks
    return qc

def fidelity_after(error):
    qc = shor_encode()
    error(qc)
    shor_decode(qc)
    rho0 = partial_trace(Statevector(qc), list(range(1, 9)))   # keep qubit 0 only
    return state_fidelity(rho0, target)

worst = min(fidelity_after(lambda qc, g=g, q=q: getattr(qc, g)(q)) for g in "xyz" for q in range(9))
print(f"all 27 single-qubit X, Y, Z errors: worst fidelity = {worst:.6f}")
U = random_unitary(2, seed=5)
print(f"a random 'messy' error on qubit 4:  fidelity = {fidelity_after(lambda qc: qc.unitary(U, [4])):.6f}")
print(f"X errors on qubits 0 and 1 (same block): fidelity = {fidelity_after(lambda qc: qc.x([0, 1])):.6f}")
print(f"Z errors on qubits 0 and 3 (two blocks):  fidelity = {fidelity_after(lambda qc: qc.z([0, 3])):.6f}")
print(f"Z errors on qubits 0 and 1 (same block): fidelity = {fidelity_after(lambda qc: qc.z([0, 1])):.6f}")
```

```text
all 27 single-qubit X, Y, Z errors: worst fidelity = 1.000000
a random 'messy' error on qubit 4:  fidelity = 1.000000
X errors on qubits 0 and 1 (same block): fidelity = 0.205749
Z errors on qubits 0 and 3 (two blocks):  fidelity = 0.464624
Z errors on qubits 0 and 1 (same block): fidelity = 1.000000
```

नतीजे पंक्ति-दर-पंक्ति पढ़ें:

- **सभी 27** single-qubit Pauli errors (9 qubits में से हर एक पर X, Y या Z) पूरी तरह ठीक होते हैं।
- एक **random unitary** error, पूरी तरह मनमाना बिखरा rotation, भी पूरी तरह ठीक होता है। यह discretisation का कमाल है: वह I, X, Y और Z का मेल है, और वे सब ठीक हो सकते हैं।
- **एक ही block में दो X errors** majority vote को हरा देते हैं, और logical qubit ख़राब होता है। **अलग** blocks में दो **Z** errors block vote को हरा देते हैं। Code **एक** error से बचाता है, दो से नहीं। Classical repetition code की तरह, उसकी विफलता दर p के बजाय लगभग p² है।
- आख़िरी पंक्ति चौंकाती है: **एक ही** block में दो Z errors कोई नुक़सान नहीं करते। Z₀Z₁, (|000⟩ ± |111⟩) को नहीं बदलता, क्योंकि दोनों branches में qubits 0 और 1 बराबर हैं। कुछ errors अदृश्य हैं क्योंकि वे **encoded state को बदलते ही नहीं**। पाठ 34 ठीक-ठीक बताता है कि कौन-से, **stabilizers** की भाषा में।

## इसकी क़ीमत, और आगे क्या

Shor के code ने साबित किया कि quantum error correction संभव है, लेकिन यह महँगा है: एक logical qubit के लिए 9 physical qubits, ऊपर से syndrome measurements के लिए ancillas। Codes को **[[n, k, d]]** संकेतन से बताया जाता है: n physical qubits, k logical qubits, और **distance** d, single-qubit errors की वह सबसे छोटी संख्या जो बिना पकड़े logical error पैदा कर सके। Shor का code [[9, 1, 3]] है, और distance d वाला code (d − 1)/2 तक errors ठीक कर सकता है।

एक गंभीर समस्या भी है जिसे हमने नज़रअंदाज़ किया: syndrome measurement ख़ुद noisy gates इस्तेमाल करता है। ख़राब CNOT एक error को दो में फैला सकता है, या ancilla ग़लत पढ़ा जा सकता है। Error correction ऐसे करना कि हालात बदतर न हों, **fault tolerance** कहलाता है, और यह पाठ 35 का विषय है।

अगले तीन पाठ पूरी कहानी बनाते हैं:

- **पाठ 34, stabilizer codes:** एक संक्षिप्त भाषा जो Shor के code, 7-qubit Steane code, और व्यवहार में इस्तेमाल लगभग हर code को state vectors के बजाय Pauli operators की सूचियों से बताती है।
- **पाठ 35, surface code और fault tolerance:** वह code जो असली hardware इस्तेमाल करता है, threshold प्रमेय, और Google का 2024 का प्रदर्शन कि बड़े codes सचमुच बेहतर logical qubits देते हैं।
- **पाठ 36, error mitigation:** पूरा error correction उपलब्ध होने से पहले आज की machines पर क्या करें।

## आज़माकर देखें

1. 3p² − 2p³ से, p = 2% पर 3-bit repetition code की विफलता दर क्या है? यह एक अकेले bit से कितना बेहतर है?
2. |1⟩ को bit-flip code से encode करें। Encoded state क्या है, और यह किसी परेशान करने वाले अर्थ में "तीन प्रतियाँ" क्यों नहीं है?
3. Bit-flip code के qubit 2 पर X error पड़ता है। कौन-से parity checks fire होते हैं, और syndrome (a1 a0) क्या है?
4. Bit-flip code के qubit 0 पर छोटा rotation RX(0.2) पड़ता है। Syndrome के error बताने की probability क्या है?
5. जब bit-flip code के किसी qubit पर Z पड़ता है तो वह "कोई error नहीं" क्यों बताता है?
6. Shor के code में qubit 4 पर Z error पड़ता है। किस block का चिह्न बदलता है, और code का कौन-सा हिस्सा उसे पकड़ता है?
7. Shor का code [[9, 1, 3]] है। वह कितने errors ठीक कर सकता है, और logical error के लिए कितने चाहिए?

**जवाब:**

1. 3(0.02)² − 2(0.02)³ = 0.0012 − 0.000016 ≈ **0.00118**, लगभग 0.12%। यह 2% से लगभग **17 गुना** बेहतर है।
2. |111⟩। यह एक basis state है, तो इसे copy करना मना नहीं (no-cloning सिर्फ़ **अनजान** states की copy से मना करता है)। Superposition के लिए encoding α|000⟩ + β|111⟩ जैसी entangled state देती है, तीन स्वतंत्र प्रतियाँ नहीं।
3. Qubits 0 और 1 अब भी मेल खाते हैं, लेकिन 1 और 2 नहीं, तो सिर्फ़ a1 fire होता है: syndrome **10**।
4. sin²(0.1) ≈ **0.0100**, लगभग 1%। और जो भी हो, ठीक की गई state perfect है।
5. Z सिर्फ़ |000⟩ और |111⟩ के बीच का **चिह्न** बदलता है। दोनों branches में तीनों qubits अब भी मेल खाते हैं, तो parity checks को कुछ ग़लत नहीं दिखता।
6. Qubit 4 **बीच वाले** block (qubits 3, 4, 5) में है, तो वह block (|000⟩ + |111⟩) से (|000⟩ − |111⟩) बनता है, या उलटा। Block चिह्नों की तुलना करने वाली **phase-flip** परत उसे पकड़ती है।
7. वह (3 − 1)/2 = **1** error ठीक करता है। बिना पकड़े logical error के लिए **3** सही जगह पड़े single-qubit errors चाहिए; 2 errors पकड़े जा सकते हैं लेकिन ग़लत तरह "ठीक" हो सकते हैं।

## सार-सूत्र

| विचार | सूत्र या तथ्य |
|---|---|
| Repetition code | 0 → 000, 1 → 111; majority vote; विफलता 3p² − 2p³ |
| क्यों मदद करता है | Fail होने को 2 errors चाहिए: छोटे p पर p की जगह p² |
| तीन रुकावटें | No-cloning; measurement नष्ट करता है; continuous और phase errors |
| Bit-flip code | α\|0⟩ + β\|1⟩ → α\|000⟩ + β\|111⟩ (दो CNOTs) |
| Parity checks | Z₀Z₁ और Z₁Z₂: qubits की तुलना करो, कभी पढ़ो नहीं |
| Syndrome | जाँच के नतीजे; error की ओर इशारा, α, β के बारे में कुछ नहीं |
| Ancilla | अतिरिक्त qubit जो CNOTs से parity इकट्ठा करता है और measure होता है |
| Discretisation | Syndrome measurement किसी भी छोटे error को "कुछ नहीं" या साफ़ Pauli में बदलता है |
| X और Z ठीक करना काफ़ी | कोई भी एक-qubit error = a·I + b·X + c·Y + d·Z, और Y = iXZ |
| Phase-flip code | Hadamard basis में bit-flip code: \|+++⟩, \|−−−⟩; जाँच X₀X₁, X₁X₂ |
| Shor code | Phase-flip code, जिसका हर qubit bit-flip encoded: 9 qubits, कोई भी एक error ठीक |
| [[n, k, d]] | n physical, k logical, distance d; (d − 1)/2 errors ठीक करता है |
| Fault tolerance | Error correction को अपने noisy gates के बावजूद काम करना चाहिए (पाठ 35) |
