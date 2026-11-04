---
layout: ../../../layouts/Post.astro
lang: hi
title: "कई qubits और tensor product"
description: "Qubits मिलकर एक बड़ी state कैसे बनाते हैं, vectors और matrices का tensor product, n qubits के 2ⁿ amplitudes, Qiskit का उल्टा bit क्रम (शुरुआती लोगों की सबसे आम ग़लती), product और entangled states पहचानने का test, हर qubit पर Hadamard, कुछ ही qubits को measure करना, और 2ⁿ amplitudes का मतलब 2ⁿ जवाब क्यों नहीं।"
date: 2026-11-04
category: lesson
lesson: 12

---

अब तक सब कुछ एक qubit के बारे में था। एक qubit अच्छा खिलौना है, लेकिन वह ऐसा कुछ नहीं गिन सकता जो एक सिक्का न कर सके। Quantum computing की ताक़त तब आती है जब qubits **जुड़ते** हैं, क्योंकि मिली हुई state अकेली states की सूची भर नहीं होती। वह कहीं बड़ी चीज़ है।

यह पाठ qubits जोड़ने का नियम सिखाता है, **tensor product**। नियम आसान है, लेकिन इसके तीन नतीजे पूरे course में चलते हैं: हर qubit के साथ amplitudes की संख्या दोगुनी होती है, कुछ मिली हुई states को वापस अलग qubits में नहीं तोड़ा जा सकता (entanglement), और qubits किस क्रम में लिखे जाते हैं यह मायने रखता है, ख़ासकर Qiskit में।

## दो qubits: चार amplitudes

दो classical bits 00, 01, 10 या 11 हो सकते हैं: चार संभावनाएँ, एक समय में एक। दो qubits के लिए ये चार **basis states** हैं:

> |00⟩, |01⟩, |10⟩, |11⟩

और आम two-qubit state चारों का superposition है:

> |ψ⟩ = a|00⟩ + b|01⟩ + c|10⟩ + d|11⟩ = [a, b, c, d]

जहाँ |a|² + |b|² + |c|² + |d|² = 1। दोनों qubits measure करने पर "00", |a|² probability से मिलता है, "01", |b|² से, वग़ैरह। पाठ 3 के सारे नियम वैसे ही चलते हैं: state एक vector है, अब लंबाई 4 का, और Born rule पहले जैसा काम करता है।

## दो states का tensor product

मान लीजिए पहला qubit state [α₀, α₁] में है और दूसरा [β₀, β₁] में, और दोनों कभी आपस में नहीं मिले। मिली हुई state क्या है?

"पहला 0 और दूसरा 1" की probability, P(पहला 0) × P(दूसरा 1) होनी चाहिए, क्योंकि qubits स्वतंत्र हैं (पाठ 5)। यह तब होता है जब |01⟩ का **amplitude** α₀·β₁ हो। चारों के लिए यही करें:

> **[α₀, α₁] ⊗ [β₀, β₁] = [α₀β₀, α₀β₁, α₁β₀, α₁β₁]**

यह **tensor product** है (Kronecker product भी कहते हैं), ⊗ से लिखा। पहले vector की हर entry को पूरे दूसरे vector से गुणा करें, और नतीजे एक के ऊपर एक रखें।

कुछ उदाहरण, हाथ से हल किए:

```text
|0⟩ ⊗ |1⟩ = [1, 0] ⊗ [0, 1] = [1·0, 1·1, 0·0, 0·1] = [0, 1, 0, 0] = |01⟩

|+⟩ ⊗ |0⟩ = [1/√2, 1/√2] ⊗ [1, 0] = [1/√2, 0, 1/√2, 0] = (|00⟩ + |10⟩)/√2

|+⟩ ⊗ |+⟩ = [½, ½, ½, ½] = (|00⟩ + |01⟩ + |10⟩ + |11⟩)/2
```

छोटा रूप |01⟩ का मतलब बस |0⟩ ⊗ |1⟩ है। इसे |0⟩|1⟩ या |0,1⟩ भी लिखते हैं।

```python
import numpy as np
ket0, ket1 = np.array([1, 0]), np.array([0, 1])
plus = (ket0 + ket1) / np.sqrt(2)

print(np.kron(ket0, ket1))              # |0> (x) |1> = |01>
print(np.round(np.kron(plus, ket0), 3)) # |+> (x) |0> = (|00> + |10>)/sqrt2
print(np.round(np.kron(plus, plus), 3)) # |+> (x) |+> = all four, equally

def is_product(state):
    """A two-qubit state [a, b, c, d] is a product state exactly when ad - bc = 0."""
    a, b, c, d = state
    return np.isclose(a * d - b * c, 0)

bell = np.array([1, 0, 0, 1]) / np.sqrt(2)
print(is_product(np.kron(plus, ket0)), is_product(bell))
```

```text
[0 1 0 0]
[0.707 0.    0.707 0.   ]
[0.5 0.5 0.5 0.5]
True False
```

(`np.kron` NumPy का tensor product है। आख़िरी लाइन अगले हिस्से में समझाई है।)

## Product states और entangled states

जो भी state (एक qubit की state) ⊗ (दूसरे की) की तरह लिखी जा सके, उसे **product state** कहते हैं। हर qubit की अपनी तय state है, और उन्हें अलग-अलग बताया जा सकता है।

लेकिन आम state [a, b, c, d] देखें। इसमें चार amplitudes हैं, जबकि product [α₀β₀, α₀β₁, α₁β₀, α₁β₁] सिर्फ़ दो जोड़ियों से बनता है। हर चार-entry vector को तोड़ा नहीं जा सकता। एक जल्दी वाला test: product state में entries यह मानती हैं

> (α₀β₀)(α₁β₁) = (α₀β₁)(α₁β₀), यानी **ad = bc**

तो दो qubits के लिए: **[a, b, c, d] तभी product state है जब ad − bc = 0।** (यह 2×2 grid [[a, b], [c, d]] का determinant है।)

अब state (|00⟩ + |11⟩)/√2 = [1/√2, 0, 0, 1/√2] लें। यहाँ ad − bc = ½ − 0 = ½, शून्य नहीं। **इसे एक qubit की state गुणा दूसरे की, की तरह नहीं लिखा जा सकता।** किसी qubit की अपनी state नहीं है; सिर्फ़ जोड़ी की है।

ऐसी states को **entangled** कहते हैं, और यह वाली **Bell state** है। कोड output के `False` का यही मतलब है। Entanglement पाठ 14 का विषय है; अभी बस इतना देखें कि यह सीधे tensor product से निकलता है: बड़े space के ज़्यादातर vectors product हैं ही नहीं।

## n qubits: 2ⁿ amplitudes

तीसरा qubit जोड़ें तो हर चार basis states दो में बँट जाती है: |000⟩, |001⟩, …, |111⟩। यानी 8। आम तौर पर:

> **n qubits की 2ⁿ basis states होती हैं, और आम state को 2ⁿ complex amplitudes चाहिए।**

यह पाठ 1 की table वाला दोगुना होना है: 10 qubits को 1,024 amplitudes चाहिए, 50 को लगभग 10¹⁵। n qubits की product state को सिर्फ़ 2n नंबर चाहिए (हर qubit के दो), तो इस विशाल space का भारी बहुमत entangled states से बना है। Quantum computer को काम करने की जगह यहीं से मिलती है।

## Bit क्रम: शुरुआती लोगों की सबसे आम ग़लती

|01⟩ लिखते समय कौन-सा qubit 0 है? दो परंपराएँ हैं, और इन्हें मिलाना व्यावहारिक quantum computing में किसी भी और चीज़ से ज़्यादा उलझन पैदा करता है।

| परंपरा | \|01⟩ का मतलब | कौन इस्तेमाल करता है |
|---|---|---|
| **Textbook** (big-endian) | qubit 0 है 0, qubit 1 है 1 (बाएँ से दाएँ) | ज़्यादातर किताबें, papers और इस course का गणित |
| **Qiskit** (little-endian) | qubit 1 है 0, qubit 0 है 1 (**qubit 0 दाईं ओर**) | Qiskit का output, bitstrings और state vectors |

Qiskit bitstrings को साधारण binary नंबरों की तरह लिखता है: सबसे दाईं अंक सबसे छोटा है, यानी qubit 0। तो Qiskit में |00⟩ का qubit 0 पलटने पर "01" मिलता है, "10" नहीं:

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

def probs(state):
    """Probabilities of each bitstring, as a tidy dict."""
    return {str(k): round(float(v), 3) for k, v in state.probabilities_dict().items()}

qc = QuantumCircuit(2)
qc.x(0)                         # flip qubit 0 only
print(probs(Statevector(qc)))

a = Statevector.from_label("0")
b = Statevector.from_label("1")
print(probs(a.tensor(b)))       # a.tensor(b): b becomes qubit 0
```

```text
{'01': 1.0}
{'01': 1.0}
```

**इस course का नियम:** text में लिखा गणित textbook क्रम (पहला qubit बाईं ओर) इस्तेमाल करता है, जब तक अलग न कहा जाए। जब भी Qiskit output पढ़ें, qubit 0, 1, 2, … पाने के लिए **bitstring दाएँ से बाएँ पढ़ें।** जब कोई नतीजा "उल्टा" लगे, तो लगभग हमेशा यही वजह होती है।

## Gates के tensor products

जोड़ी के एक qubit पर gate भी tensor product है। "पहले qubit पर A और दूसरे पर B लगाओ" 4×4 matrix A ⊗ B है, ऐसे परिभाषित कि

> (A ⊗ B)(|a⟩ ⊗ |b⟩) = (A|a⟩) ⊗ (B|b⟩)

इसे बनाने के लिए A की हर entry की जगह वह entry गुणा पूरी matrix B रखें। "पहले qubit पर X, दूसरे पर कुछ नहीं" के लिए, यह X ⊗ I है:

```text
X ⊗ I = [ 0·I  1·I ]  =  [ 0 0 1 0 ]
        [ 1·I  0·I ]     [ 0 0 0 1 ]
                         [ 1 0 0 0 ]
                         [ 0 1 0 0 ]
```

यह |00⟩ → |10⟩, |01⟩ → |11⟩ वग़ैरह भेजता है: पहला qubit पलटता है, दूसरा अछूता।

### हर जगह Hadamard: uniform superposition

सबसे ज़रूरी multi-qubit product हर qubit पर H है, H⊗ⁿ लिखा। |00…0⟩ से शुरू करें, तो हर H |+⟩ बनाता है:

> H⊗ⁿ|0…0⟩ = |+⟩ ⊗ |+⟩ ⊗ … ⊗ |+⟩ = (1/√2ⁿ) × (सभी 2ⁿ basis states का जोड़)

n gates से सभी 2ⁿ bitstrings का बराबर superposition बन गया। भाग E का लगभग हर quantum algorithm ऐसे ही शुरू होता है।

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, Operator

qc = QuantumCircuit(3)
qc.h([0, 1, 2])                 # H on every qubit
print(np.round(Statevector(qc).data.real, 4))

X = np.array([[0, 1], [1, 0]])
I = np.eye(2, dtype=int)
print(np.kron(X, I))            # X on the left (first) qubit, nothing on the right
```

```text
[0.3536 0.3536 0.3536 0.3536 0.3536 0.3536 0.3536 0.3536]
[[0 0 1 0]
 [0 0 0 1]
 [1 0 0 0]
 [0 1 0 0]]
```

1/√8 ≈ 0.3536 के आठ बराबर amplitudes, और ऊपर वाली X ⊗ I matrix।

किसी भी basis state |x⟩ पर H⊗ⁿ का एक सूत्र भी है, जिसे पाठ 22 Deutsch–Jozsa और Bernstein–Vazirani समझाने में इस्तेमाल करता है:

> H⊗ⁿ|x⟩ = (1/√2ⁿ) Σ_y (−1)^(x·y) |y⟩

जहाँ x·y उन जगहों की गिनती है जहाँ x और y दोनों में 1 हो। हर amplitude का आकार बराबर है; x की जानकारी सिर्फ़ **चिह्नों** में है। यह विचार याद रखें।

## सिर्फ़ कुछ qubits को measure करना

अक्सर आप कुछ qubits measure करते हैं और बाक़ी छोड़ देते हैं। नियम है Born rule और थोड़ा हिसाब-किताब।

**Measure किए qubit पर किसी नतीजे की probability:** उस नतीजे से मेल खाती सभी basis states पर |amplitude|² जोड़ें।

**बाद की state:** सिर्फ़ मेल खाते पद रखें, और फिर से scale करें ताकि लंबाई 1 हो।

**हल किया उदाहरण।** |ψ⟩ = (|00⟩ + |01⟩ + |11⟩)/√3, textbook क्रम में (पहला qubit बाईं ओर), और सिर्फ़ **पहले** qubit को measure करें।

- नतीजा 0: पद |00⟩ और |01⟩, तो P = ⅓ + ⅓ = **⅔**। बाद में: (|00⟩ + |01⟩)/√2 = |0⟩ ⊗ |+⟩। दूसरा qubit |+⟩ में बचता है।
- नतीजा 1: पद |11⟩, तो P = **⅓**। बाद में: |11⟩। दूसरा qubit |1⟩ में बचता है।

ध्यान दें कि एक qubit के नतीजे ने बदल दिया कि दूसरे पर क्या बचा। ऐसा इसलिए क्योंकि यह state entangled है (ad − bc = 1/3 − 0 ≠ 0)।

Qiskit में जाँचें। क्रम का ध्यान रखें: वही amplitudes Qiskit के क्रम में लिखते हैं, जहाँ बायाँ अंक qubit 1 है। तो text का "पहला qubit", Qiskit में qubit 1 है।

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
from qiskit.primitives import StatevectorSampler

# (|00> + |01> + |11>)/sqrt3, with amplitudes in Qiskit's order 00, 01, 10, 11
psi = Statevector(np.array([1, 1, 0, 1]) / np.sqrt(3))
print({str(k): round(float(v), 3) for k, v in psi.probabilities_dict().items()})
print("qubit 0 alone:", np.round(psi.probabilities([0]), 3))    # P(q0 = 0), P(q0 = 1)
print("qubit 1 alone:", np.round(psi.probabilities([1]), 3))

# Measure only qubit 1, many times
qc = QuantumCircuit(2, 1)
qc.initialize(psi, [0, 1])
qc.measure(1, 0)
counts = StatevectorSampler(seed=4).run([qc], shots=3000).result()[0].data.c.get_counts()
print("qubit 1 results:", counts)
```

```text
{'00': 0.333, '01': 0.333, '11': 0.333}
qubit 0 alone: [0.333 0.667]
qubit 1 alone: [0.667 0.333]
qubit 1 results: {'1': 1004, '0': 1996}
```

Qubit 1 (बायाँ अंक) लगभग दो-तिहाई बार 0 देता है, ठीक जैसा निकाला। `probabilities([1])` यह "marginal" probability सीधे निकालता है, दूसरे qubit पर जोड़कर।

## 2ⁿ amplitudes, लेकिन 2ⁿ जवाब नहीं

यह सोचना लुभाता है: "n qubits में 2ⁿ नंबर हैं, तो quantum computer एक साथ 2ⁿ values पर काम करता है और 2ⁿ जवाब देता है"। पहला आधा मोटे तौर पर सही है; दूसरा ग़लत।

n qubits measure करने पर आपको **एक** n-bit string मिलती है। 2ⁿ amplitudes संभावनाएँ तय करते हैं, और फिर चले जाते हैं। Alexander Holevo (1973) का एक प्रमेय इसे सटीक बनाता है: **n qubits ज़्यादा से ज़्यादा n classical bits की जानकारी दे सकते हैं** जो पढ़ी जा सके, चाहे उन्हें कैसे भी बनाया गया हो।

तो 2ⁿ amplitudes काम करने की जगह हैं, भंडार नहीं। Quantum algorithm को interference से ऐसा इंतज़ाम करना होता है कि जो **एक** string आप पढ़ें वह काम की हो, आमतौर पर ग़लत जवाबों को काटकर। यही कठिन हिस्सा है, और इसीलिए quantum computers सिर्फ़ सही ढाँचे वाली समस्याओं में मदद करते हैं (पाठ 31)।

## ख़ुद करके देखें

1. |1⟩ ⊗ |+⟩ को 4-entry vector की तरह निकालें।
2. क्या [½, ½, ½, −½] product state है? और [½, −½, ½, −½]? ad − bc लगाएँ।
3. Matrix I ⊗ X लिखें (पहले qubit पर कुछ नहीं, दूसरे पर X)। यह किन basis states की अदला-बदली करती है?
4. Qiskit में 3-qubit नतीजा "110" है। Qubits 0, 1 और 2 ने क्या दिया?
5. |ψ⟩ = (|00⟩ + |01⟩ + |11⟩)/√3 (textbook क्रम) में **दूसरे** qubit के 1 देने की probability क्या है? अगर दे, तो पहले qubit पर क्या बचता है?
6. 20-qubit state में कितने amplitudes हैं? उससे कितने bits पढ़े जा सकते हैं?

**जवाब:**

1. [0, 1] ⊗ [1/√2, 1/√2] = [0, 0, 1/√2, 1/√2] = (|10⟩ + |11⟩)/√2।
2. पहला: ad − bc = −¼ − ¼ = −½ ≠ 0, **entangled**। दूसरा: (½)(−½) − (−½)(½) = −¼ + ¼ = 0, **product** (यह |+⟩ ⊗ |−⟩ है)।
3. I ⊗ X = [[0,1,0,0], [1,0,0,0], [0,0,0,1], [0,0,1,0]]। यह |00⟩ ↔ |01⟩ और |10⟩ ↔ |11⟩ बदलती है।
4. दाएँ से बाएँ पढ़कर: qubit 0 ने **0**, qubit 1 ने **1**, qubit 2 ने **1** दिया।
5. दूसरा qubit 1 वाले पद: |01⟩ और |11⟩, तो P = **⅔**। बाद में (|01⟩ + |11⟩)/√2 = |+⟩ ⊗ |1⟩, तो पहला qubit **|+⟩** में बचता है।
6. 2²⁰ = **1,048,576** amplitudes, लेकिन ज़्यादा से ज़्यादा **20** bits की पढ़ी जा सकने वाली जानकारी।

## सार

| विचार | सूत्र या तथ्य |
|---|---|
| Two-qubit basis | \|00⟩, \|01⟩, \|10⟩, \|11⟩ |
| States का tensor product | [α₀, α₁] ⊗ [β₀, β₁] = [α₀β₀, α₀β₁, α₁β₀, α₁β₁] |
| छोटा रूप | \|01⟩ = \|0⟩ ⊗ \|1⟩ = \|0⟩\|1⟩ |
| n qubits | 2ⁿ basis states और 2ⁿ amplitudes |
| Product state test (2 qubits) | [a, b, c, d] product ⇔ ad − bc = 0 |
| Entangled | एक state ⊗ दूसरी की तरह नहीं लिखी जा सकती |
| Bell state | (\|00⟩ + \|11⟩)/√2: entangled |
| Textbook क्रम | पहला qubit बाईं ओर |
| Qiskit क्रम | Qubit 0 **दाईं** ओर; bitstrings दाएँ से बाएँ पढ़ें |
| Qiskit tensor | `a.tensor(b)`: b, qubit 0 बनता है |
| कई qubits पर gates | (A ⊗ B)(\|a⟩ ⊗ \|b⟩) = A\|a⟩ ⊗ B\|b⟩ |
| सिर्फ़ पहले qubit पर X | X ⊗ I |
| Uniform superposition | H⊗ⁿ\|0…0⟩ = सभी 2ⁿ strings का बराबर मिश्रण |
| \|x⟩ पर H⊗ⁿ | (1/√2ⁿ) Σ_y (−1)^(x·y) \|y⟩ |
| आंशिक measurement | मेल खाते पदों पर \|amplitude\|² जोड़ें; उन्हें रखें और renormalise करें |
| Holevo bound | n qubits से ज़्यादा से ज़्यादा n पढ़े जा सकने वाले bits |
| कोड में | `np.kron`, `Statevector.tensor`, `.probabilities([qubits])` |
