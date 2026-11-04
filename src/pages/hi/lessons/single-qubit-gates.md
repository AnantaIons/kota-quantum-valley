---
layout: ../../../layouts/Post.astro
lang: hi
title: "Single-qubit gates: X, Y, Z, H, S, T"
description: "हर मानक single-qubit gate: उसकी matrix, वह |0⟩ और |+⟩ के साथ क्या करता है, और Bloch sphere पर कौन-सा घुमाव बनाता है। Pauli gates और उनका algebra, basis बदलने वाला Hadamard, phase gates S और T, और वे identities जो आप पूरे course में इस्तेमाल करेंगे, सब Qiskit में जाँचे हुए।"
date: 2026-11-04
category: lesson
lesson: 9

---

अब आपके पास qubit की दो तस्वीरें हैं: दो amplitudes का vector (पाठ 6) और Bloch sphere पर एक बिंदु (पाठ 7)। यह पाठ काम जोड़ता है। **Gate** एक unitary matrix है (पाठ 4), और Bloch sphere पर **हर single-qubit gate, किसी अक्ष के चारों ओर गोले का घुमाव है।**

सिर्फ़ छह gates रटने लायक हैं: **X, Y, Z, H, S और T।** हर एक की तीन बातें सीखेंगे: उसकी matrix, वह basis states के साथ क्या करता है, और कौन-सा घुमाव बनाता है। फिर उन्हें जोड़ने वाली identities सीखेंगे, क्योंकि असली circuits उन्हीं पर टिकी तरकीबों से भरे होते हैं।

## Pauli gates: तीनों अक्षों के चारों ओर आधा चक्कर

Wolfgang Pauli के नाम पर तीन **Pauli matrices** quantum computing के सबसे ज़रूरी gates हैं। हर एक तीन अक्षों में से किसी एक के चारों ओर Bloch sphere का **180° घुमाव** है।

### X: bit flip

```text
X = [ 0  1 ]        X|0⟩ = |1⟩
    [ 1  0 ]        X|1⟩ = |0⟩
```

X पाठ 1 का quantum NOT gate है। गोले पर यह **x-अक्ष** के चारों ओर 180° घुमाता है: उत्तरी और दक्षिणी ध्रुव अदला-बदली करते हैं। x-अक्ष पर के बिंदु वहीं रहते हैं: X|+⟩ = |+⟩ और X|−⟩ = −|−⟩ (minus चिह्न global phase है, तो |−⟩ वही भौतिक state है)। यह पाठ 4 का eigenvector वाला कथन ही है, तस्वीर की तरह।

### Z: phase flip

```text
Z = [ 1   0 ]       Z|0⟩ =  |0⟩
    [ 0  −1 ]       Z|1⟩ = −|1⟩
```

Z, |0⟩ को छोड़ देता है और |1⟩ पर minus लगाता है। गोले पर यह **z-अक्ष** के चारों ओर 180° घुमाता है, तो ध्रुव नहीं हिलते, लेकिन भूमध्य आधा चक्कर घूमती है: |+⟩ ↔ |−⟩ और |+i⟩ ↔ |−i⟩।

यह ऐसा gate है जिसका **कोई classical जोड़ीदार नहीं।** 0/1 basis में measure करके नहीं बताया जा सकता कि Z लगा या नहीं, क्योंकि यह |α|² या |β|² नहीं बदलता। यह सिर्फ़ relative phase बदलता है, जो amplitudes को interfere कराते ही दिख जाता है (पाठ 10)।

### Y: दोनों एक साथ

```text
Y = [ 0  −i ]       Y|0⟩ =  i|1⟩
    [ i   0 ]       Y|1⟩ = −i|0⟩
```

Y, **y-अक्ष** के चारों ओर 180° घुमाता है। यह X की तरह ध्रुव पलटता है, और phase भी पलटता है। असल में Y = iXZ: phase छोड़कर, यह "पहले Z फिर X" है।

### Pauli algebra

ये तीन matrices कुछ छोटे नियम मानती हैं जो आप बार-बार इस्तेमाल करेंगे:

| नियम | मतलब |
|---|---|
| X² = Y² = Z² = I | एक ही अक्ष पर दो आधे चक्कर कुछ नहीं करते |
| XY = iZ, YZ = iX, ZX = iY | दो का गुणा तीसरा देता है (i गुणा) |
| XZ = −ZX, वग़ैरह | अलग Paulis **anticommute** करते हैं: क्रम बदलने से चिह्न बदलता है |
| तीनों Hermitian और unitary | हर एक gate भी है और observable भी |

Anticommutation का नियम ही error correction चलाता है (पाठ 34): X error को Z-तरह की जाँचों से इसीलिए पकड़ा जा सकता है क्योंकि X और Z anticommute करते हैं।

## Hadamard gate: दोनों bases की अदला-बदली

```text
H = 1/√2 [ 1   1 ]      H|0⟩ = |+⟩      H|+⟩ = |0⟩
         [ 1  −1 ]      H|1⟩ = |−⟩      H|−⟩ = |1⟩
```

H वह gate है जो basis state से **superposition बनाता है**, और लगभग हर quantum algorithm में है। गोले पर यह **x और z के बीचोंबीच के तिरछे अक्ष** के चारों ओर 180° घुमाव है। इससे उत्तरी ध्रुव +x से, और दक्षिणी ध्रुव −x से अदला-बदली करता है।

H को सोचने का सबसे काम का तरीका: **यह 0/1 basis और +/− basis की अदला-बदली करता है।** एक basis के बारे में जो भी पता है, H उसे दूसरे में अनुवाद कर देता है। इससे ये identities मिलती हैं:

```text
HXH = Z      HZH = X      HYH = −Y      HH = I
```

HXH = Z को ऐसे पढ़ें: "Hadamard के चश्मे से देखा गया bit flip, phase flip है"। इसी से आप x-basis में measure करते हैं (पाठ 8), CZ gate, CNOT में बदलता है (पाठ 13), और bit-flip और phase-flip error-correcting codes एक-दूसरे के दर्पण हैं (भाग F)।

## Phase gates: S और T

Z भूमध्य को 180° घुमाता है। z-अक्ष के चारों ओर छोटे घुमाव भी बहुत काम के हैं।

### S: चौथाई चक्कर

```text
S = [ 1  0 ]        S|0⟩ = |0⟩,   S|1⟩ = i|1⟩
    [ 0  i ]        S|+⟩ = |+i⟩   (भूमध्य पर चौथाई चक्कर)
```

S, z-अक्ष के चारों ओर **90°** घुमाता है। दो मिलकर Z बनाते हैं: SS = Z, इसलिए S को कभी-कभी √Z कहते हैं। इसका inverse S† = [[1, 0], [0, −i]] है, जिसे आपने पाठ 8 में y-basis में measure करने के लिए इस्तेमाल किया।

### T: चक्कर का आठवाँ हिस्सा

```text
T = [ 1     0      ]        T|1⟩ = e^(iπ/4)|1⟩
    [ 0  e^(iπ/4)  ]
```

T, z-अक्ष के चारों ओर **45°** घुमाता है। TT = S, और चार T मिलकर Z बनाते हैं। इसका inverse T† है।

T छोटा gate लगता है, लेकिन यह इस क्षेत्र के सबसे ज़रूरी gates में से है। सिर्फ़ H, S और CNOT सब कुछ नहीं कर सकते: सिर्फ़ इनसे बने circuits (जिन्हें **Clifford circuits** कहते हैं) साधारण कंप्यूटर पर आसानी से simulate हो जाते हैं। **T जोड़ने से set universal बनता है** (पाठ 17)। और error-corrected कंप्यूटर में T सबसे महँगा gate है (पाठ 35), इसलिए algorithm बनाने वाले "T gates" ऐसे गिनते हैं जैसे engineers transistors गिनते हैं।

### आम phase gate

S, T और Z एक ही परिवार के सदस्य हैं:

```text
P(λ) = [ 1     0     ]      Z = P(π),  S = P(π/2),  T = P(π/4)
       [ 0  e^(iλ)   ]
```

P(λ), z-अक्ष के चारों ओर λ घुमाता है। पाठ 10 देखता है कि phase घुमाव क्या करते हैं, और पाठ 11 बाक़ी अक्षों के घुमाव जोड़ता है।

## छहों gates एक table में

| Gate | Matrix | Bloch sphere पर घुमाव | \|0⟩ बनता है | \|+⟩ बनता है |
|---|---|---|---|---|
| X | [[0, 1], [1, 0]] | x के चारों ओर 180° | \|1⟩ | \|+⟩ |
| Y | [[0, −i], [i, 0]] | y के चारों ओर 180° | i\|1⟩ | −i\|−⟩ (यानी \|−⟩) |
| Z | [[1, 0], [0, −1]] | z के चारों ओर 180° | \|0⟩ | \|−⟩ |
| H | [[1, 1], [1, −1]]/√2 | (x+z)/√2 के चारों ओर 180° | \|+⟩ | \|0⟩ |
| S | [[1, 0], [0, i]] | z के चारों ओर 90° | \|0⟩ | \|+i⟩ |
| T | [[1, 0], [0, e^(iπ/4)]] | z के चारों ओर 45° | \|0⟩ | भूमध्य पर 45° |

### कोड: Bloch sphere पर हर gate

यह हर gate को |0⟩ और |+⟩ पर लगाकर नतीजे का Bloch vector (x, y, z) छापता है, पाठ 7 के `bloch` function से।

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, SparsePauliOp

def bloch(qc):
    s = Statevector(qc)
    return [round(float(s.expectation_value(SparsePauliOp(p)).real), 3) + 0.0 for p in "XYZ"]

for gate in ["x", "y", "z", "h", "s", "t"]:
    row = []
    for start in ["0", "+"]:
        qc = QuantumCircuit(1)
        if start == "+":
            qc.h(0)
        getattr(qc, gate)(0)            # apply the gate by name
        row.append(bloch(qc))
    print(f"{gate.upper()}:  from |0> -> {row[0]}   from |+> -> {row[1]}")
```

```text
X:  from |0> -> [0.0, 0.0, -1.0]   from |+> -> [1.0, 0.0, 0.0]
Y:  from |0> -> [0.0, 0.0, -1.0]   from |+> -> [-1.0, 0.0, 0.0]
Z:  from |0> -> [0.0, 0.0, 1.0]   from |+> -> [-1.0, 0.0, 0.0]
H:  from |0> -> [1.0, 0.0, 0.0]   from |+> -> [0.0, 0.0, 1.0]
S:  from |0> -> [0.0, 0.0, 1.0]   from |+> -> [0.0, 1.0, 0.0]
T:  from |0> -> [0.0, 0.0, 1.0]   from |+> -> [0.707, 0.707, 0.0]
```

Table को घुमावों से मिलाकर पढ़ें। Z, S और T उत्तरी ध्रुव (0, 0, 1) को वहीं छोड़ते हैं, क्योंकि वे z-अक्ष के चारों ओर घुमाते हैं। |+⟩ = (1, 0, 0) से शुरू करके वे उसे भूमध्य पर 180°, 90° और 45° घुमाते हैं: (−1, 0, 0), (0, 1, 0) और (0.707, 0.707, 0) तक। (कोड में `+ 0.0` बस किसी −0.0 को 0.0 बना देता है ताकि छपाई साफ़ रहे।)

## Identities, जाँची हुई

इस पाठ की identities, हर एक circuit की matrix को अपेक्षित matrix से मिलाकर जाँची हुई। `Operator(a) == Operator(b)` सटीक बराबरी जाँचता है।

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Operator

def op(*gates):
    """The matrix of a one-qubit circuit that applies the named gates in order."""
    qc = QuantumCircuit(1)
    for g in gates:
        getattr(qc, g)(0)
    return Operator(qc)

print("HXH = Z :", op("h", "x", "h") == op("z"))
print("HZH = X :", op("h", "z", "h") == op("x"))
print("SS  = Z :", op("s", "s") == op("z"))
print("TT  = S :", op("t", "t") == op("s"))
print("S Sdg = I:", op("s", "sdg") == op())
print("XY = iZ :", np.allclose(op("y", "x").data, 1j * op("z").data))   # Y first, then X

qc = QuantumCircuit(1)
qc.h(0)
qc.t(0)
qc.h(0)
qc.measure_all()
print(qc.draw("text"))
```

```text
HXH = Z : True
HZH = X : True
SS  = Z : True
TT  = S : True
S Sdg = I: True
XY = iZ : True
        ┌───┐┌───┐┌───┐ ░ ┌─┐
     q: ┤ H ├┤ T ├┤ H ├─░─┤M├
        └───┘└───┘└───┘ ░ └╥┘
meas: 1/═══════════════════╩═
                           0
```

आख़िरी identity की टिप्पणी देखें: circuit "पहले Y फिर X" की matrix X·Y है, क्योंकि पहला gate दाईं ओर जाता है (पाठ 4)। अंत की drawing Qiskit का circuit दिखाने का तरीका है: समय बाएँ से दाएँ चलता है, हर क्षैतिज रेखा एक qubit है, boxes gates हैं, और meter वाला चिह्न measurement है जिसका नतीजा नीचे के classical bit में रखा जाता है। H–T–H वाला यह sandwich आप पाठ 10 में फिर देखेंगे, जहाँ यह phase को नापी जा सकने वाली probability में बदलता है।

## गोले के साथ चलकर circuits पढ़ना

इन घुमावों को दिमाग़ में रखकर आप छोटे circuits बिना algebra के समझ सकते हैं। यह आज़माएँ: |0⟩ से शुरू करके **H, फिर S, फिर H**।

1. H: उत्तरी ध्रुव → +x, भूमध्य का सामने वाला हिस्सा।
2. S: z के चारों ओर चौथाई चक्कर → +y, दाईं ओर।
3. H: (x+z) वाले तिरछे अक्ष के चारों ओर घुमाव y को उल्टी ओर कर देता है (यही HYH = −Y है) → −y।

तो H·S·H, |0⟩ को |−i⟩ बनाता है, और 0/1 basis में measure करने पर 50/50 मिलता है। [क्वांटम लैब](/hi/lab/) में जाँचें: Bloch sphere पर H, S, H लगाकर तीर देखें।

## ख़ुद करके देखें

1. X, |+i⟩ के साथ क्या करता है? घुमाव की तस्वीर से सोचें, फिर matrix से जाँचें।
2. Matrices गुणा करके दिखाएँ कि ZXZ = −X, और anticommutation से समझाएँ।
3. TTTT किस एक gate के बराबर है? और SSSS?
4. |0⟩ से शुरू करके circuit H, T, T किस बिंदु पर पहुँचता है? क्या यह मुख्य state है?
5. HZH = X से, |0⟩ से शुरू करके H, Z, H के बाद Bloch vector बताएँ।
6. 0/1 basis का measurement यह क्यों नहीं बता सकता कि |0⟩ या |1⟩ पर Z लगा या नहीं? |+⟩ के लिए बता सकता है?

**जवाब:**

1. x के चारों ओर 180° घुमाव +y को −y भेजता है, तो X|+i⟩ = |−i⟩ (global phase छोड़कर)। Matrix: X(|0⟩ + i|1⟩)/√2 = (|1⟩ + i|0⟩)/√2 = i(|0⟩ − i|1⟩)/√2 = i|−i⟩। ✓
2. ZXZ = Z(XZ) = Z(−ZX) = −ZZX = −X। X को एक Z के पार ले जाने पर minus आता है, फिर दोनों Z कट जाते हैं।
3. TTTT = Z। SSSS = I (पूरा चक्कर)।
4. H से |+⟩, और TT = S उसे 90° घुमाकर **|+i⟩** बनाता है: मुख्य state।
5. HZH = X, तो यह X|0⟩ = |1⟩ है: Bloch vector **(0, 0, −1)**।
6. Z सिर्फ़ |1⟩ को −1 से गुणा करता है, जो अकेले |0⟩ या |1⟩ पर global phase है, तो कुछ नहीं बदलता। |+⟩ के लिए यह relative phase है: Z|+⟩ = |−⟩, जिसे 0/1 measurement फिर भी नहीं देख सकता (दोनों 50/50), लेकिन x-basis measurement देख सकता है।

## सार

| Gate | Matrix | Bloch घुमाव | मुख्य बातें |
|---|---|---|---|
| X | [[0, 1], [1, 0]] | x के चारों ओर 180° | Bit flip; quantum NOT |
| Y | [[0, −i], [i, 0]] | y के चारों ओर 180° | Bit और phase flip; Y = iXZ |
| Z | [[1, 0], [0, −1]] | z के चारों ओर 180° | Phase flip; classical जोड़ीदार नहीं |
| H | [[1, 1], [1, −1]]/√2 | (x+z)/√2 के चारों ओर 180° | Superposition बनाता है; 0/1 और +/− बदलता है |
| S | [[1, 0], [0, i]] | z के चारों ओर 90° | SS = Z; S\|+⟩ = \|+i⟩ |
| T | [[1, 0], [0, e^(iπ/4)]] | z के चारों ओर 45° | TT = S; gate sets को universal बनाता है |
| P(λ) | [[1, 0], [0, e^(iλ)]] | z के चारों ओर λ | Z = P(π), S = P(π/2), T = P(π/4) |

| Identity | इस्तेमाल |
|---|---|
| X² = Y² = Z² = H² = I | हर एक ख़ुद को उलटता है |
| XY = iZ, YZ = iX, ZX = iY | Paulis के गुणनफल |
| XZ = −ZX | Paulis anticommute करते हैं (error detection का आधार) |
| HXH = Z, HZH = X | Hadamard, bit flips और phase flips बदलता है |
| HYH = −Y | H के नीचे Y की दिशा पलटती है |
| Clifford gates | H, S, CNOT: classically simulate करना आसान |
| + T | Universal; error correction में T महँगा gate है |
