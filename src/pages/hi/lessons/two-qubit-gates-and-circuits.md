---
layout: ../../../layouts/Post.astro
lang: hi
title: "Two-qubit gates और circuits"
description: "Controlled gates नींव से: CNOT, CZ और controlled-U matrices की तरह, 'control' और 'target' basis पर क्यों निर्भर हैं, phase kickback, तीन CNOTs से SWAP, Toffoli और उसकी लागत, चार Bell states, असली हार्डवेयर के native two-qubit gates, और circuit की width, depth और gate गिनती कैसे पढ़ें।"
date: 2026-11-04
category: lesson
lesson: 13

---

Single-qubit gates (पाठ 9 से 11) हर qubit को उसके Bloch sphere पर कहीं भी घुमा सकते हैं। लेकिन अकेले वे qubits को कभी **आपस में असर** नहीं डालने देते: product state, product ही रहती है। Entanglement बनाने और असली गणना के लिए ऐसे gates चाहिए जो एक साथ दो qubits पर, दोनों पर निर्भर तरीके से काम करें।

व्यवहार में लगभग हर multi-qubit gate एक **controlled gate** है: "एक qubit के साथ कुछ करो, लेकिन सिर्फ़ तब जब दूसरा qubit 1 हो"। यह पाठ उन्हें matrix से बनाता है, उनके बारे में कुछ हैरान करने वाले तथ्य दिखाता है (control और target भूमिकाएँ बदल सकते हैं!), और circuit का आकार पढ़ने और नापने पर ख़त्म होता है।

गणित textbook क्रम में लिखेंगे (पहला qubit बाईं ओर, पाठ 12) और जहाँ Qiskit का क्रम अलग है वहाँ याद दिलाएँगे।

## Controlled-NOT

CNOT से आप पाठ 1 में classical reversible gate की तरह मिल चुके हैं। इसमें एक **control** qubit और एक **target** qubit है: control 1 हो तो target पलटो; वरना कुछ मत करो।

| Input (control, target) | Output |
|---|---|
| \|00⟩ | \|00⟩ |
| \|01⟩ | \|01⟩ |
| \|10⟩ | \|11⟩ |
| \|11⟩ | \|10⟩ |

Matrix की तरह (columns बताते हैं |00⟩, |01⟩, |10⟩, |11⟩ के साथ क्या होता है):

```text
CNOT = [ 1 0 0 0 ]
       [ 0 1 0 0 ]
       [ 0 0 0 1 ]
       [ 0 0 1 0 ]
```

ऊपर-बाएँ 2×2 block I है (control 0: कुछ नहीं) और नीचे-दाएँ block X है (control 1: पलटो)। इस ढाँचे से पाठ 3 के projectors के साथ **कोई भी** controlled gate लिखने का साफ़ तरीका मिलता है:

> **Controlled-U = |0⟩⟨0| ⊗ I + |1⟩⟨1| ⊗ U**

"पहला qubit |0⟩ हो तो दूसरे पर I लगाओ; |1⟩ हो तो U।" U = X से CNOT मिलता है। और क्योंकि यह superpositions पर linearly काम करता है, superposition में control होने पर gate "होता भी है और नहीं भी", और entanglement ऐसे ही पैदा होता है।

Circuit diagrams में control एक भरा बिंदु है और CNOT का target, plus वाला गोला (⊕, "XOR into")।

## Controlled-Z: symmetric वाला

U = Z से **CZ** मिलता है:

```text
CZ = [ 1 0 0  0 ]
     [ 0 1 0  0 ]
     [ 0 0 1  0 ]
     [ 0 0 0 −1 ]
```

यह |11⟩ पर minus चिह्न लगाने के अलावा कुछ नहीं करता। ध्यान दें: minus चिह्न तभी आता है जब **दोनों** qubits 1 हों। तो फ़र्क़ नहीं पड़ता कि control किसे कहें: **CZ symmetric है।** Diagrams में यह एक लकीर से जुड़े दो बिंदुओं की तरह बनता है।

## Control और target basis पर निर्भर हैं

तीन तथ्य जो लगभग सबको हैरान करते हैं। हर एक बस पाठ 9 की H-basis-बदलता-है वाली identity HZH = X है, दो qubits पर लगाई हुई।

**1. CNOT, target के चारों ओर Hadamards वाला CZ है।** क्योंकि HZH = X, target पर H के बीच रखा controlled-Z, controlled-X बन जाता है:

> CNOT = (I ⊗ H) · CZ · (I ⊗ H)

**2. दोनों qubits पर Hadamards, control और target की अदला-बदली करते हैं।** CNOT के पहले और बाद दोनों qubits पर H लगाएँ, तो उल्टी दिशा वाला CNOT मिलता है। +/− basis में "target" ही control कर रहा होता है।

> (H ⊗ H) · CNOT₁→₂ · (H ⊗ H) = CNOT₂→₁

**3. तीन CNOTs से SWAP बनता है।** दिशा बदलते हुए, CNOT₁→₂ · CNOT₂→₁ · CNOT₁→₂ दोनों qubits को पूरी तरह अदल-बदल देता है। (यह उस XOR-swap तरकीब का quantum रूप है जिससे programmers बिना temporary variable के दो variables बदलते हैं।)

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Operator

def same(a, b):
    return Operator(a) == Operator(b)

# 1. CZ is symmetric: it doesn't matter which qubit is the control
cz01 = QuantumCircuit(2); cz01.cz(0, 1)
cz10 = QuantumCircuit(2); cz10.cz(1, 0)
print("CZ(0,1) = CZ(1,0):", same(cz01, cz10))

# 2. A CNOT is a CZ with Hadamards on the target
cx = QuantumCircuit(2); cx.cx(0, 1)
hzh = QuantumCircuit(2); hzh.h(1); hzh.cz(0, 1); hzh.h(1)
print("CNOT = (I x H) CZ (I x H):", same(cx, hzh))

# 3. Hadamards on both qubits swap control and target
flipped = QuantumCircuit(2); flipped.h([0, 1]); flipped.cx(0, 1); flipped.h([0, 1])
cx10 = QuantumCircuit(2); cx10.cx(1, 0)
print("(H x H) CNOT(0,1) (H x H) = CNOT(1,0):", same(flipped, cx10))

# 4. Three CNOTs make a SWAP
three = QuantumCircuit(2); three.cx(0, 1); three.cx(1, 0); three.cx(0, 1)
swap = QuantumCircuit(2); swap.swap(0, 1)
print("CNOT CNOT CNOT = SWAP:", same(three, swap))
```

```text
CZ(0,1) = CZ(1,0): True
CNOT = (I x H) CZ (I x H): True
(H x H) CNOT(0,1) (H x H) = CNOT(1,0): True
CNOT CNOT CNOT = SWAP: True
```

(Qiskit में `qc.cx(a, b)` का मतलब control a, target b।) ये identities सिर्फ़ जिज्ञासा नहीं हैं। असली chips सिर्फ़ एक तरह का two-qubit gate देते हैं, अक्सर CZ, और compilers ठीक इन्हीं बदलावों से आपके CNOTs और SWAPs को उसमें बदलते हैं (पाठ 40)।

## Phase kickback: control बदल जाता है

Classically, CNOT का control कभी नहीं बदलता। Quantum में बदल सकता है, और यह quantum computing के सबसे ज़रूरी असरों में से है।

Target को |−⟩ = (|0⟩ − |1⟩)/√2 में रखें। उसे पलटने पर X|−⟩ = −|−⟩: वही state गुणा −1। तो |c⟩|−⟩ पर CNOT:

```text
control |0⟩:  |0⟩|−⟩  →  |0⟩|−⟩           (पलटना नहीं)
control |1⟩:  |1⟩|−⟩  →  |1⟩(−|−⟩) = −|1⟩|−⟩   (पलटना = −1 से गुणा)
```

Target दोनों हालत में नहीं बदला। −1, **control की |1⟩ शाखा** पर चला गया। तो अगर control |+⟩ = (|0⟩ + |1⟩)/√2 था, वह (|0⟩ − |1⟩)/√2 = |−⟩ बन जाता है। Control +/− basis में पलट गया, जबकि target, जिस पर कथित रूप से काम हो रहा था, बिल्कुल नहीं बदला।

आम तौर पर, अगर target, U की eigenstate हो जिसका eigenvalue e^(iθ) है, तो controlled-U, control की |1⟩ शाखा पर phase e^(iθ) लगा देता है। यही **phase kickback** है (पाठ 10 में झलक)। देखें: target |+⟩ हो (eigenvalue +1) तो control 0 पढ़ता है, और |−⟩ हो (eigenvalue −1) तो 1।

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

for target in ["|+>", "|->"]:
    qc = QuantumCircuit(2)
    qc.h(0)                      # control (qubit 0) in |+>
    if target == "|->":
        qc.x(1)
    qc.h(1)                      # target (qubit 1) in |+> or |->
    qc.cx(0, 1)
    qc.h(0)                      # ask the control "+ or -?"
    p = Statevector(qc).probabilities([0])
    print("target", target, "-> control reads 0/1 with", np.round(p, 3))
```

```text
target |+> -> control reads 0/1 with [1. 0.]
target |-> -> control reads 0/1 with [0. 1.]
```

Deutsch–Jozsa और Bernstein–Vazirani (पाठ 22) ठीक इसी से किसी function का जवाब control qubits से पढ़ते हैं। Phase estimation (पाठ 27) इसे आम phases e^(iθ) के साथ इस्तेमाल करता है।

## Bell states

दो-gate वाला circuit "पहले qubit पर H, फिर CNOT" चारों basis states को चार **Bell states** में बदलता है, दो qubits की सबसे ज़्यादा entangled states:

| Input (textbook) | Output | नाम |
|---|---|---|
| \|00⟩ | (\|00⟩ + \|11⟩)/√2 | Φ⁺ |
| \|10⟩ | (\|00⟩ − \|11⟩)/√2 | Φ⁻ |
| \|01⟩ | (\|01⟩ + \|10⟩)/√2 | Ψ⁺ |
| \|11⟩ | (\|01⟩ − \|10⟩)/√2 | Ψ⁻ |

पहली को क़दम-दर-क़दम देखें। |00⟩ से शुरू। पहले qubit पर H से (|0⟩ + |1⟩)/√2 ⊗ |0⟩ = (|00⟩ + |10⟩)/√2। CNOT |00⟩ को छोड़ता है और |10⟩ को |11⟩ बनाता है। नतीजा: **(|00⟩ + |11⟩)/√2**, जो पाठ 12 का product test पास नहीं करता (ad − bc = ½), तो entangled है।

Qiskit में (labels Qiskit क्रम में, qubit 0 दाईं ओर; H qubit 0 पर है और CNOT 0 → 1 जाता है):

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

bell = QuantumCircuit(2)
bell.h(0)
bell.cx(0, 1)

for label in ["00", "01", "10", "11"]:          # Qiskit order: qubit 1, qubit 0
    out = Statevector.from_label(label).evolve(bell)
    print(label, "->", {str(k): round(float(v.real), 3) for k, v in out.to_dict().items()})
```

```text
00 -> {'00': 0.707, '11': 0.707}
01 -> {'00': 0.707, '11': -0.707}
10 -> {'01': 0.707, '10': 0.707}
11 -> {'01': -0.707, '10': 0.707}
```

चारों Bell states आती हैं (आख़िरी वाली, कुल चिह्न छोड़कर Ψ⁻ है, यानी global phase)। Circuit unitary है, इसलिए इसे **उल्टा** भी चलाया जा सकता है, पहले CNOT फिर H, ताकि हर Bell state एक अलग basis state में लौट आए। इसे **Bell measurement** कहते हैं, और यह teleportation और superdense coding (पाठ 21) का मुख्य क़दम है। पाठ 14 देखता है कि ये states ख़ास क्यों हैं।

## तीन-qubit gates: Toffoli

**Toffoli** gate (CCX) target तभी पलटता है जब **दोनों** controls 1 हों। यह पाठ 1 का reversible AND है, और क्योंकि अकेला Toffoli classical reversible computing के लिए universal है, **कोई भी classical गणना quantum computer पर चल सकती है**: Shor algorithm इसी से modular गणित करता है (पाठ 28) और Grover algorithm इसी से संभावित जवाब जाँचता है (पाठ 24)।

असली chips में native तीन-qubit gate नहीं होता, तो Toffoli छोटे gates से बनाना पड़ता है। मानक तरीका 6 CNOTs और 7 T या T† gates लेता है:

```python
from qiskit import QuantumCircuit, transpile

qc = QuantumCircuit(3)
qc.ccx(0, 1, 2)                       # Toffoli
small = transpile(qc, basis_gates=["cx", "h", "t", "tdg"], optimization_level=1)
print(dict(small.count_ops()), "depth", small.depth())
```

```text
{'cx': 6, 't': 4, 'tdg': 3, 'h': 2} depth 11
```

एक "AND" के लिए यह बहुत है। इसीलिए classical गणित के quantum रूप महँगे हैं, और error-corrected मशीनों के लिए T gates गिनना ज़रूरी है (पाठ 35)।

## असली हार्डवेयर के native two-qubit gates

हर हार्डवेयर platform एक two-qubit interaction अच्छे से करता है। बाक़ी सब, ऊपर जैसी identities से, उसी में compile होता है।

| Platform | आम native two-qubit gate |
|---|---|
| IBM superconducting | ECR (echoed cross-resonance) या CZ |
| Google superconducting | CZ, या √iSWAP |
| Trapped ions (Quantinuum, IonQ) | Mølmer–Sørensen (XX घुमाव) या ZZ phase gates |
| Neutral atoms | CZ, Rydberg interactions से |

सब अलग दिखते हैं, लेकिन single-qubit gates छोड़कर हर एक CNOT के बराबर है। Two-qubit gates में आमतौर पर single-qubit से **10 गुना ज़्यादा ग़लतियाँ** होती हैं और ये धीमे होते हैं, इसलिए compilers इन्हें कम करने में बहुत मेहनत करते हैं (पाठ 38–40)।

## Circuit पढ़ना: width, depth और size

तीन नंबर circuit की लागत बताते हैं:

| माप | मतलब | क्यों ज़रूरी |
|---|---|---|
| **Width** | Qubits की संख्या | Chip पर समाना चाहिए |
| **Depth** | Time steps की संख्या, जब अलग qubits के gates साथ चलें | Decoherence से पहले ख़त्म होना चाहिए (पाठ 32) |
| **Size / gate गिनती** | कुल gates, अक्सर तरह के हिसाब से | हर gate ग़लती जोड़ता है |

**अलग** qubits पर gates एक साथ हो सकते हैं, तो वे एक time step साझा करते हैं। ऊपर के Toffoli में 15 gates हैं लेकिन depth 11, क्योंकि कुछ अग़ल-बग़ल चलते हैं। Qiskit में: `qc.num_qubits`, `qc.depth()`, `qc.size()` और `qc.count_ops()`। जब लोग quantum algorithms की तुलना करते हैं, तो आमतौर पर two-qubit gate गिनती और depth ही तय करते हैं कि वह आज के हार्डवेयर पर चल सकता है या नहीं।

## ख़ुद करके देखें

1. ऐसे CNOT की matrix लिखें जिसका control **दूसरा** qubit और target **पहला** हो (textbook क्रम)। यह किन basis states की अदला-बदली करता है?
2. दिखाएँ कि CZ|+⟩|+⟩ entangled है। (लिखकर ad − bc लगाएँ।)
3. Controlled-S gate |1⟩|1⟩ पर लगता है। Output? |+⟩|1⟩ पर?
4. Phase kickback से अनुमान लगाएँ कि CZ, |+⟩|1⟩ के साथ क्या करता है।
5. |11⟩ से कौन-सी Bell state मिलती है, और कौन-सा circuit उसे वापस |11⟩ बनाता है?
6. एक circuit में gates हैं: q0 पर H; q1 पर H; CNOT q0→q1; q2 पर X; CNOT q1→q2। इसकी width, size और depth क्या है?

**जवाब:**

1. यह दूसरा 1 होने पर पहला पलटता है: |01⟩ ↔ |11⟩ बदलता है। Rows/columns 00, 01, 10, 11 क्रम में: [[1,0,0,0], [0,0,0,1], [0,0,1,0], [0,1,0,0]]।
2. |+⟩|+⟩ = [½, ½, ½, ½]; CZ आख़िरी चिह्न पलटता है: [½, ½, ½, −½]। ad − bc = −¼ − ¼ = −½ ≠ 0, entangled।
3. |1⟩ ⊗ S|1⟩ = **i|11⟩**। |+⟩|1⟩ के लिए: (|01⟩ + i|11⟩)/√2 = (|0⟩ + i|1⟩)/√2 ⊗ |1⟩ = **|+i⟩|1⟩**: phase control पर वापस किक हुआ।
4. |1⟩, Z की eigenvalue −1 वाली eigenstate है, तो control की |1⟩ शाखा पर −1 आता है: **|−⟩|1⟩**।
5. Ψ⁻ = (|01⟩ − |10⟩)/√2। Circuit उल्टा चलाएँ: **CNOT, फिर पहले qubit पर H**।
6. Width **3**, size **5**। Depth **3**: step 1 = H, H, X (सब अलग qubits); step 2 = CNOT q0→q1; step 3 = CNOT q1→q2।

## सार

| विचार | सूत्र या तथ्य |
|---|---|
| कोई भी controlled gate | \|0⟩⟨0\| ⊗ I + \|1⟩⟨1\| ⊗ U |
| CNOT | Control 1 हो तो target पलटो; matrix में I और X blocks |
| CZ | सिर्फ़ \|11⟩ पर minus; symmetric |
| CZ से CNOT | CNOT = (I ⊗ H)·CZ·(I ⊗ H) |
| CNOT उलटना | दोनों qubits पर पहले और बाद Hadamards |
| SWAP | तीन बदलते CNOTs |
| Phase kickback | Target eigenstate में: उसका eigenvalue phase control पर |
| Bell circuit | पहले qubit पर H, फिर CNOT |
| Bell states | Φ± = (\|00⟩ ± \|11⟩)/√2, Ψ± = (\|01⟩ ± \|10⟩)/√2 |
| Bell measurement | CNOT, फिर H, फिर दोनों measure |
| Toffoli (CCX) | Reversible AND; 6 CNOTs + 7 T/T† |
| Native gates | ECR/CZ (superconducting), MS/ZZ (ions), CZ (atoms) |
| Two-qubit gate की लागत | Single-qubit से लगभग 10× ग़लती |
| Width / depth / size | Qubits / time steps / कुल gates |
| Qiskit | `cx(c, t)`, `cz`, `swap`, `ccx`, `depth()`, `count_ops()` |
