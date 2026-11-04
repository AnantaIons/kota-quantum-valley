---
layout: ../../../layouts/Post.astro
lang: hi
title: "Rotations और कोई भी single-qubit gate"
description: "Rotation gates RX, RY और RZ और उनका सूत्र कहाँ से आता है, पूरे चक्कर पर minus चिह्न क्यों आता है, Bloch sphere पर कोई भी state बनाना, Euler कोण और यह तथ्य कि तीन घुमाव हर single-qubit gate बना देते हैं, Qiskit का U gate, और असली superconducting chip असल में क्या चलाता है।"
date: 2026-11-04
category: lesson
lesson: 11

---

पाठ 9 के छह gates तय घुमाव हैं: आधा चक्कर, चौथाई, आठवाँ हिस्सा। असली quantum programs को **कोई भी** कोण चाहिए: 37° घुमाओ, ठीक सही अक्षांश तक झुकाओ, variational algorithm (पाठ 30) में कोई parameter बारीकी से सेट करो। यह पाठ **rotation gates** RX, RY और RZ पेश करता है, जो Bloch sphere को x, y या z अक्ष के चारों ओर किसी भी कोण θ से घुमाते हैं।

फिर यह एक कमाल की बात साबित करता है: **हर संभव single-qubit gate बनाने के लिए तीन घुमाव काफ़ी हैं।** इसीलिए असली quantum chip को बस कुछ भौतिक operations में अच्छा होना होता है, और इसी से आपके circuits उस रूप में बदलते हैं जो हार्डवेयर असल में करता है।

## Rotation gates

कोण θ के लिए तीनों rotation gates:

```text
RX(θ) = [ cos(θ/2)      −i·sin(θ/2) ]
        [ −i·sin(θ/2)    cos(θ/2)   ]

RY(θ) = [ cos(θ/2)   −sin(θ/2) ]
        [ sin(θ/2)    cos(θ/2) ]

RZ(θ) = [ e^(−iθ/2)       0      ]
        [     0       e^(iθ/2)   ]
```

Bloch sphere पर RX(θ), x-अक्ष के चारों ओर θ घुमाता है, RY(θ) y-अक्ष के, और RZ(θ) z-अक्ष के, दाएँ हाथ के नियम से (अँगूठा अक्ष के साथ, उँगलियाँ घुमाव की दिशा में मुड़ें)।

आधे कोण फिर दिखे। पाठ 7 की तरह, गोले पर कोण θ, matrix के अंदर θ/2 के बराबर है। यह भी देखें कि RY में सिर्फ़ **real** entries हैं: यह |0⟩ और |1⟩ वाले समतल में घुमाता है, आधे कोण वाली साधारण 2D rotation matrix की तरह। इसीलिए probabilities सेट करने के लिए यह स्वाभाविक gate है: RY(θ)|0⟩ = cos(θ/2)|0⟩ + sin(θ/2)|1⟩।

### सूत्र कहाँ से आता है

तीनों एक ही छोटे सूत्र से आते हैं:

> **R_P(θ) = e^(−iθP/2)**, जहाँ P, X, Y या Z है

Matrix का exponential उसी power series से परिभाषित है जैसे नंबरों का: e^A = I + A + A²/2! + A³/3! + …। आमतौर पर यह निकालना कठिन है। लेकिन पाठ 9 से Pauli matrices का एक ख़ास गुण है: **P² = I**। तो P की powers बस बदलती रहती हैं: P, I, P, I, …। Series को I वाले और P वाले पदों में बाँटें:

```text
e^(−iθP/2) = I·[1 − (θ/2)²/2! + (θ/2)⁴/4! − …] − i·P·[(θ/2) − (θ/2)³/3! + …]
           = cos(θ/2)·I − i·sin(θ/2)·P
```

दोनों brackets ठीक cos और sin की power series हैं। cos(θ/2)·I − i·sin(θ/2)·P में P = X, Y या Z रखें और ऊपर की तीनों matrices मिलती हैं। (यह पाठ 2 के Euler सूत्र का matrix रूप है।)

घुमाव "e की power minus i गुणा कोण गुणा Pauli" क्यों होना चाहिए? Physics में qubit e^(−iHt/ħ) की तरह बदलता है, जहाँ H उसकी energy (Hamiltonian, पाठ 29) है। x की ओर इशारा करता field, X के अनुपात में energy देता है, तो qubit x के चारों ओर घूमता है। **हर rotation gate, सावधानी से चुनी गई energy का एक छोटा झटका है।** हार्डवेयर इन्हें सचमुच ऐसे ही बनाता है (पाठ 38)।

### कोड: सूत्र जाँचना

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Operator, Statevector, SparsePauliOp

X = np.array([[0, 1], [1, 0]])
theta = np.pi / 3
RX_formula = np.cos(theta / 2) * np.eye(2) - 1j * np.sin(theta / 2) * X
qc = QuantumCircuit(1)
qc.rx(theta, 0)
print("RX formula matches Qiskit:", np.allclose(RX_formula, Operator(qc).data))

# RX(pi) is X up to a global phase of -i
qc = QuantumCircuit(1)
qc.rx(np.pi, 0)
print(np.round(Operator(qc).data, 3))
print("RX(pi) equiv X:", Operator(qc).equiv(Operator.from_label("X")))

# A full turn is not "nothing": RX(2 pi) = -I
qc = QuantumCircuit(1)
qc.rx(2 * np.pi, 0)
print(np.round(Operator(qc).data.real, 3))
```

```text
RX formula matches Qiskit: True
[[0.+0.j 0.-1.j]
 [0.-1.j 0.+0.j]]
RX(pi) equiv X: True
[[-1.  0.]
 [ 0. -1.]]
```

दो बातें याद रखें:

**Pauli gates आधे चक्कर हैं।** RX(π) = −i·X। −i global phase है, तो RX(π) और X एक ही gate हैं। इसी तरह RY(π) ≅ Y और RZ(π) ≅ Z। और phase gates z-घुमाव हैं: S ≅ RZ(π/2), T ≅ RZ(π/4)।

**पूरा चक्कर minus चिह्न देता है।** RX(2π) = −I, I नहीं। ठीक identity पर लौटने के लिए **दो बार** (4π) घूमना पड़ता है। अकेले, −I global phase है और अदृश्य। लेकिन जैसा पाठ 10 ने चेताया, इसे controlled gate के अंदर रखें तो यह नापा जा सकने वाला relative phase बन जाता है। यह "4π symmetry" electron spin का असली गुण है, और neutron interference प्रयोगों में देखा जा चुका है।

## किसी भी अक्ष के चारों ओर घुमाव

x, y और z में कुछ ख़ास नहीं। लंबाई 1 वाली किसी भी दिशा n = (n_x, n_y, n_z) के लिए, n के चारों ओर θ घुमाव:

> R_n(θ) = cos(θ/2)·I − i·sin(θ/2)·(n_x X + n_y Y + n_z Z)

जैसे, Hadamard gate तिरछे अक्ष n = (1, 0, 1)/√2 के चारों ओर आधा चक्कर (θ = π) है। रखें: R_n(π) = −i·(X + Z)/√2 = −i·H। तो **H एक घुमाव है**, global phase −i छोड़कर, जैसा पाठ 9 ने बताया।

इससे एक साफ़ ज्यामितीय तथ्य निकलता है:

> **हर single-qubit gate, किसी अक्ष के चारों ओर किसी कोण से Bloch sphere का घुमाव है, गुणा एक global phase।**

पाठ 9 के छह gates, RX, RY, RZ, और कोई भी दूसरा single-qubit unitary जो आपको कभी मिलेगा: सब घुमाव। इसीलिए एक qubit के लिए Bloch sphere की तस्वीर इतनी ताक़तवर है।

## कोई भी state बनाना

Qubit को गोले के किसी ख़ास बिंदु (θ, φ) पर चाहते हैं? उत्तरी ध्रुव |0⟩ से शुरू करें और दो घुमाव करें:

1. **RY(θ)** तीर को ध्रुव से θ नीचे, +x की ओर झुकाता है। अब वह अक्षांश θ पर है।
2. **RZ(φ)** उसे z-अक्ष के चारों ओर φ घुमाता है। अब वह देशांतर φ पर है।

नतीजा cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩ है (global phase छोड़कर): ठीक पाठ 7 की आम state।

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, SparsePauliOp

def prepare(theta, phi):
    """Any point on the Bloch sphere: tilt by theta about y, then turn by phi about z."""
    qc = QuantumCircuit(1)
    qc.ry(theta, 0)
    qc.rz(phi, 0)
    return qc

theta, phi = np.radians(120), np.radians(45)
s = Statevector(prepare(theta, phi))
x, y, z = (float(s.expectation_value(SparsePauliOp(p)).real) for p in "XYZ")
print("measured  :", round(x, 3), round(y, 3), round(z, 3))
print("predicted :", round(np.sin(theta) * np.cos(phi), 3), round(np.sin(theta) * np.sin(phi), 3), round(np.cos(theta), 3))
```

```text
measured  : 0.612 0.612 -0.5
predicted : 0.612 0.612 -0.5
```

Bloch vector ठीक (sin θ cos φ, sin θ sin φ, cos θ) से मेल खाता है। RY-फिर-RZ का यही तरीका किसी नंबर को qubit में कोण की तरह भरने के लिए इस्तेमाल होता है, जो कई quantum machine-learning circuits की शुरुआत है (पाठ 45)।

## Euler कोण: तीन घुमाव कोई भी gate बनाते हैं

State बनाने में दो घुमाव लगे। पूरा **gate** बनाने में ज़्यादा से ज़्यादा तीन। प्रमेय:

> **कोई भी single-qubit unitary U ऐसे लिखा जा सकता है: U = e^(iα)·RZ(β)·RY(γ)·RZ(δ)**

किन्हीं चार कोणों α, β, γ, δ के लिए। (α बस global phase है।) यह **ZYZ Euler decomposition** है, Leonhard Euler के नाम पर, जिन्होंने 1700 के दशक में दिखाया कि किसी ठोस वस्तु की कोई भी दिशा दो अक्षों के चारों ओर तीन घुमावों से पाई जा सकती है। Pilots और game programmers यही विचार इस्तेमाल करते हैं: yaw, pitch, yaw।

यह काम क्यों करता है? सोचें कि U उत्तरी ध्रुव के साथ क्या करता है। RZ(δ) उस पर कुछ नहीं करता; RY(γ) उसे सही अक्षांश तक झुकाता है; RZ(β) सही देशांतर तक घुमाता है। इससे तय होता है कि |0⟩ कहाँ जाता है। पहला घुमाव, RZ(δ), बाक़ी आज़ादी तय करता है: उस बिंदु के चारों ओर गोला कितना मुड़ा है।

Qiskit किसी भी gate के कोण ढूँढ सकता है:

```python
import numpy as np
from qiskit import QuantumCircuit, transpile
from qiskit.quantum_info import Operator, random_unitary
from qiskit.synthesis import OneQubitEulerDecomposer

U = random_unitary(2, seed=42)                 # any single-qubit gate at all
zyz = OneQubitEulerDecomposer(basis="ZYZ")
circ = zyz(U)                                   # find the three angles
print(circ.draw("text"))
print("rebuilt gate equals U:", Operator(circ).equiv(U))

# What a superconducting chip actually runs for a Hadamard
qc = QuantumCircuit(1)
qc.h(0)
native = transpile(qc, basis_gates=["rz", "sx", "x"])
print(native.draw("text"))
```

```text
global phase: 5.664
   ┌───────────────┐┌─────────────┐┌────────────┐
q: ┤ Rz(0.0088291) ├┤ Ry(0.73591) ├┤ Rz(1.5846) ├
   └───────────────┘└─────────────┘└────────────┘
rebuilt gate equals U: True
global phase: π/4
   ┌─────────┐┌────┐┌─────────┐
q: ┤ Rz(π/2) ├┤ √X ├┤ Rz(π/2) ├
   └─────────┘└────┘└─────────┘
```

एक पूरी तरह random gate तीन घुमावों से दोबारा बना (कोण radians में), साथ में एक global phase जिसे Qiskit अलग से दर्ज करता है।

### Qiskit का U gate

क्योंकि तीन कोण कोई भी gate बताते हैं, Qiskit में इसके लिए एक आम gate है: **U(θ, φ, λ)**, global phase छोड़कर RZ(φ)·RY(θ)·RZ(λ) के बराबर। हर single-qubit gate कोई न कोई U है:

| Gate | U(θ, φ, λ) की तरह |
|---|---|
| X | U(π, 0, π) |
| H | U(π/2, 0, π) |
| RY(θ) | U(θ, 0, 0) |
| P(λ) | U(0, 0, λ) |

## हार्डवेयर असल में क्या चलाता है

कोड output का आख़िरी हिस्सा एक व्यावहारिक सवाल का जवाब देता है। असली chip सीधे "कोई भी घुमाव" नहीं कर सकता। जैसे IBM के superconducting processors बस कुछ native operations देते हैं: **RZ(θ)**, **√X** (SX लिखा, x के चारों ओर चौथाई चक्कर, phase छोड़कर RX(π/2) के बराबर) और **X**।

Output दिखाता है कि Hadamard बनता है RZ(π/2), फिर √X, फिर RZ(π/2)। आम तौर पर, **किसी भी single-qubit gate के लिए ज़्यादा से ज़्यादा RZ·√X·RZ·√X·RZ चाहिए**: दो भौतिक pulses और तीन RZ।

और यहाँ चतुर हिस्सा है। जैसा पाठ 10 ने बताया, इन मशीनों पर RZ **virtual** है: यह software में आगे के सभी pulses का reference phase खिसकाकर होता है। इसमें समय नहीं लगता और ग़लती नहीं जुड़ती। तो किसी भी single-qubit gate की असली लागत ज़्यादा से ज़्यादा **दो** √X pulses हैं, हर एक कुछ दसियों nanoseconds का। Engineers को बस एक pulse shape बहुत अच्छा बनाना होता है, और बाक़ी हर gate software से मुफ़्त मिलता है। पाठ 40 पूरे circuits के लिए यह अनुवाद दिखाता है, जिसे **transpiling** कहते हैं।

## ख़ुद करके देखें

1. RY(π/2) की matrix लिखें, और दिखाएँ कि RY(π/2)|0⟩ = |+⟩।
2. RX(π/2)|0⟩ कौन-सी state देता है? Bloch sphere पर वह कहाँ है?
3. RZ(θ) = e^(−iθ/2)·P(θ) से समझाएँ कि S = P(π/2) और RZ(π/2) अकेले एक ही gate क्यों हैं।
4. कौन-सा घुमाव |+⟩ को |−⟩ बनाता है? दो अलग जवाब दें।
5. आपको P(1) = 0.1 चाहिए। |0⟩ से शुरू करके RY(θ) में कौन-सा θ लें?
6. असली chip को सिर्फ़ √X pulses अच्छे बनाने क्यों होते हैं, RZ pulses नहीं?

**जवाब:**

1. RY(π/2) = [[1, −1], [1, 1]]/√2। [1, 0] पर लगाने से [1, 1]/√2 = |+⟩ मिलता है। (उत्तरी ध्रुव को +x की ओर 90° झुकाना।)
2. [cos 45°, −i·sin 45°] = (|0⟩ − i|1⟩)/√2 = **|−i⟩**, −y पर भूमध्य में। (दाएँ हाथ के नियम से +x के चारों ओर ध्रुव घुमाने पर वह −y की ओर झुकता है।)
3. दोनों में सिर्फ़ global phase e^(−iπ/4) का फ़र्क़ है, जो अकेले gate के लिए पकड़ा नहीं जा सकता।
4. RZ(π), जो भूमध्य को आधा चक्कर घुमाता है (phase छोड़कर Z)। और RY(π), जो +x को −x पर पलटता है (phase छोड़कर Y)।
5. sin²(θ/2) = 0.1 → sin(θ/2) ≈ 0.316 → θ/2 ≈ 18.4° → **θ ≈ 36.9°**।
6. RZ, आगे के pulses का phase खिसकाकर software में virtually होता है, तो इसमें न समय लगता है न ग़लती जुड़ती है। हर gate RZ·√X·RZ·√X·RZ है।

## सार

| विचार | सूत्र या तथ्य |
|---|---|
| Rotation gate | R_P(θ) = e^(−iθP/2) = cos(θ/2)·I − i·sin(θ/2)·P |
| आसान क्यों होता है | P² = I, तो power series cos और sin में बँट जाती है |
| RX, RY, RZ | Bloch sphere को x, y, z के चारों ओर θ घुमाते हैं |
| RY | Real matrix; RY(θ)\|0⟩ = cos(θ/2)\|0⟩ + sin(θ/2)\|1⟩ |
| Paulis घुमाव की तरह | RX(π) = −iX, RY(π) = −iY, RZ(π) = −iZ |
| Phase gates घुमाव की तरह | S ≅ RZ(π/2), T ≅ RZ(π/4) |
| पूरा चक्कर | R(2π) = −I; R(4π) = I |
| कोई भी अक्ष | R_n(θ) = cos(θ/2)·I − i·sin(θ/2)·(n·σ) |
| Hadamard | (x+z)/√2 के चारों ओर आधा चक्कर: H = i·R_n(π) |
| हर 1-qubit gate | किसी अक्ष के चारों ओर घुमाव, गुणा global phase |
| कोई भी state बनाना | \|0⟩ से RY(θ) फिर RZ(φ) |
| Euler (ZYZ) | U = e^(iα)·RZ(β)·RY(γ)·RZ(δ) |
| Qiskit U gate | U(θ, φ, λ) ≅ RZ(φ)·RY(θ)·RZ(λ); H = U(π/2, 0, π) |
| IBM native gates | RZ (virtual, मुफ़्त), √X, X |
| हार्डवेयर पर कोई भी gate | ज़्यादा से ज़्यादा RZ·√X·RZ·√X·RZ: दो असली pulses |
