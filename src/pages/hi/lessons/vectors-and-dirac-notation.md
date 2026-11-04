---
layout: ../../../layouts/Post.astro
lang: hi
title: "Vectors और Dirac notation"
description: "Complex vectors, inner product और उसमें conjugate क्यों चाहिए, लंबाई और normalisation, orthonormal bases, kets और bras, |0⟩, |1⟩ और |+⟩, |−⟩ के बीच basis बदलना, और outer product। वह भाषा जिसमें आगे का हर पाठ लिखा है।"
date: 2026-11-04
category: lesson
lesson: 3

---

Qubit की state एक vector है। यही एक वाक्य इस पाठ के होने की वजह है। अगर आप complex entries वाले vectors को, और उनके लिए physicists के ख़ास notation को समझ लें, तो course का हर आगे का सूत्र पहेली की जगह एक वाक्य की तरह पढ़ा जाएगा।

हम इसे पाँच क़दमों में बनाएँगे: vectors, inner product, लंबाई, bases, और आख़िर में **Dirac notation** (kets, bras और brackets), जो ऊपर की सब बातों को छोटे में लिखने का तरीका भर है।

## क़दम 1: vectors नंबरों की सूचियाँ हैं

स्कूल में vector एक तीर होता है जिसकी लंबाई और दिशा हो, जैसे velocity। लिखने पर यह नंबरों की सूची है: origin से बिंदु (3, 4) तक का तीर, vector [3, 4] है।

Quantum computing में:

- Vectors **columns** की तरह लिखे जाते हैं (जगह बचाने के लिए हम [3, 4] एक लाइन में लिखेंगे, पर उसे खड़ा सोचें)।
- Entries **complex numbers** हो सकती हैं।
- सूची की लंबाई, measurement के संभव नतीजों की संख्या है: एक qubit के लिए **2**, दो के लिए **4**, n के लिए **2ⁿ**।

दो operations वैसे ही चलते हैं जैसी उम्मीद है, entry-दर-entry:

```text
जोड़ना:              [1, 2] + [3, −1] = [4, 1]
नंबर से गुणा:          2i × [1, 3]  = [2i, 6i]
```

a·[1, 0] + b·[0, 1] = [a, b] जैसे मेल को **linear combination** कहते हैं। Qubit की state हमेशा दोनों बुनियादी states का linear combination होती है, complex भार के साथ। गणित में "superposition" का यही मतलब है।

## क़दम 2: inner product, और उसमें conjugate क्यों चाहिए

साधारण real vectors के लिए **dot product** मिलती-जुलती entries गुणा करके जोड़ता है:

```text
[1, 2] · [3, 4] = 1×3 + 2×4 = 11
```

यह नापता है कि दो vectors कितनी एक ही दिशा में हैं। समकोण पर हों तो यह शून्य है, और किसी vector का अपने साथ dot product उसकी लंबाई का वर्ग है: [3, 4] · [3, 4] = 9 + 16 = 25, तो लंबाई 5।

**Complex** entries के साथ सीधा dot product टूट जाता है। v = [1, i] लें। तब v · v = 1×1 + i×i = 1 + (−1) = 0। एक non-zero vector की "लंबाई शून्य"? यह बेतुका है।

हल है गुणा करने से पहले **पहले vector का conjugate लेना।** यही **inner product** है:

> ⟨a, b⟩ = a₁* b₁ + a₂* b₂ + … (a की हर entry का conjugate)

अब v = [1, i] फिर से:

```text
⟨v, v⟩ = 1*·1 + i*·i = 1·1 + (−i)·i = 1 + 1 = 2
```

हर पद z*·z = |z|² है, जो हमेशा real और कभी negative नहीं होता (पाठ 2)। तो किसी vector का अपने साथ inner product हमेशा real, non-negative नंबर होता है: एक समझदार "लंबाई का वर्ग"।

दो गुण जानने लायक:

- **क्रम थोड़ा मायने रखता है:** ⟨b, a⟩ = ⟨a, b⟩*। अदला-बदली से conjugate मिलता है।
- **शून्य का मतलब लंब:** अगर ⟨a, b⟩ = 0, तो vectors **orthogonal** हैं। Quantum states के लिए इसका भौतिक अर्थ है: दोनों states को एक measurement से पूरी तरह अलग पहचाना जा सकता है।

## क़दम 3: लंबाई और normalisation

Vector की **लंबाई** (या **norm**):

> ‖v‖ = √⟨v, v⟩ = √(|v₁|² + |v₂|² + …)

Quantum state की **लंबाई ठीक 1** होनी चाहिए। क्यों? क्योंकि entries के आकार के वर्ग नतीजों की probabilities हैं (पाठ 8), और probabilities का जोड़ 1 होना चाहिए:

> |v₁|² + |v₂|² + … = 1

लंबाई 1 वाले vector को **normalised** कहते हैं। अगर vector सही दिशा में है पर लंबाई ग़लत है, तो उसकी लंबाई से भाग दें:

```text
v = [1, i]        ‖v‖ = √2
v / ‖v‖ = [1/√2, i/√2]       अब |1/√2|² + |i/√2|² = ½ + ½ = 1 ✓
```

एक और उदाहरण: [3, 4i] की लंबाई √(9 + 16) = 5, तो normalised state [3/5, 4i/5] है। इसकी probabilities 9/25 = 0.36 और 16/25 = 0.64 हैं।

## क़दम 4: bases

**Basis** vectors का वह set है जिससे बाक़ी हर vector बनाया जा सके। एक qubit के लिए आम चुनाव है:

```text
[1, 0]  और  [0, 1]
```

क्योंकि कोई भी [a, b] = a·[1, 0] + b·[0, 1]। ये दोनों **orthonormal** हैं: हर एक की लंबाई 1, और आपस में orthogonal। Quantum computing में इसे **computational basis** कहते हैं, और कंप्यूटर default में इसी में measure करता है।

लेकिन यह अकेला basis नहीं है। एक और orthonormal जोड़ी, जो आपको बार-बार मिलेगी:

```text
[1/√2,  1/√2]   और   [1/√2, −1/√2]
```

जाँचें: हर एक की लंबाई √(½ + ½) = 1। Inner product ½ − ½ = 0। तो ये भी orthonormal हैं, और basis भी बनाते हैं। ये वही दो दिशाएँ हैं, 45° घुमाई हुई।

**अलग bases, qubit से पूछे जा सकने वाले अलग सवाल हैं।** पहले basis में measure करना पूछता है "0 या 1?"। दूसरे में एक अलग सवाल, और जवाब एक basis में पूरी तरह random और दूसरे में पूरी तरह पक्के हो सकते हैं। पाठ 8 इसे आगे बढ़ाता है, और पाठ 41 दिखाता है कि quantum key distribution इसी से जासूस को कैसे पकड़ता है।

## क़दम 5: Dirac notation

ऊपर का सब साधारण linear algebra है। Physicists ने एक notation जोड़ा, जिसे Paul Dirac ने 1939 में बनाया, जिससे यह बहुत जल्दी लिखा जाता है। पूरा यह रहा।

### Kets: column vectors

**Ket** एक column vector है, खड़ी लकीर और कोण-bracket से लिखा: |नाम⟩। अंदर का नाम बस एक label है।

```text
|0⟩ = [1, 0]           |1⟩ = [0, 1]
|+⟩ = [1/√2,  1/√2]    |−⟩ = [1/√2, −1/√2]
```

तो एक आम qubit है

> |ψ⟩ = α|0⟩ + β|1⟩ = [α, β]

(ψ, "psi", आम state का पारंपरिक नाम है।) ध्यान दें: **|0⟩ शून्य vector नहीं है।** यह state "qubit 0 है" है, यानी vector [1, 0]। शून्य vector [0, 0] तो valid state है ही नहीं।

### Bras: conjugate की हुई rows

**Bra**, ket को लिटाकर **और conjugate करके** बनता है:

> अगर |ψ⟩ = [α, β] (column), तो ⟨ψ| = [α*, β*] (row)

इस "लिटाओ और conjugate करो" को **conjugate transpose** या **dagger** कहते हैं, † से लिखा: ⟨ψ| = |ψ⟩†।

### Brackets: inner product

Bra को ket के बग़ल में रखें तो **bra-ket** या **bracket** मिलता है: row गुणा column, जो बस एक नंबर है।

> ⟨φ|ψ⟩ = φ₁*ψ₁ + φ₂*ψ₂

यह ठीक क़दम 2 वाला inner product है, जिसमें conjugate bra ख़ुद लगा देता है। (नाम का मज़ाक यह है कि "bracket" टूटकर "bra" और "ket" बनता है।)

कुछ brackets जो हाथ से निकालने लायक हैं:

```text
⟨0|0⟩ = 1·1 + 0·0 = 1           (normalised)
⟨0|1⟩ = 1·0 + 0·1 = 0           (orthogonal)
⟨+|−⟩ = (1/√2)(1/√2) + (1/√2)(−1/√2) = ½ − ½ = 0
⟨0|+⟩ = 1·(1/√2) + 0·(1/√2) = 1/√2
```

### Amplitudes पढ़ना

Brackets इतने काम के क्यों हैं: |ψ⟩ = α|0⟩ + β|1⟩ के लिए

> ⟨0|ψ⟩ = α  और  ⟨1|ψ⟩ = β

Basis state के साथ bracket **वह amplitude निकाल देता है।** और आम तौर पर:

> **|⟨φ|ψ⟩|² = probability कि state |ψ⟩ वाला qubit, state |φ⟩ में मिले**, जब आप |φ⟩ वाले basis में measure करें।

यह एक सूत्र quantum measurement का दिल है। यह कहता है कि probability, state जहाँ है और आप जो पूछ रहे हैं, उनके बीच के **overlap का वर्ग** है। पाठ 8 इसी पर बनता है।

**हल किया उदाहरण।** |ψ⟩ = (|0⟩ + i|1⟩)/√2। इसके |+⟩ में मिलने की संभावना?

```text
⟨+|ψ⟩ = (1/√2)*·(1/√2) + (1/√2)*·(i/√2)
      = ½ + i/2
|⟨+|ψ⟩|² = (½)² + (½)² = ½
```

तो 50%। (यहाँ ⟨+| का conjugate कुछ नहीं करता क्योंकि उसकी entries real हैं, लेकिन जब bra में complex entries हों तब यह ज़रूरी होता है।)

### Basis बदलना

क्योंकि |+⟩ = (|0⟩ + |1⟩)/√2 और |−⟩ = (|0⟩ − |1⟩)/√2, इन्हें जोड़-घटाकर वापस जा सकते हैं:

```text
|+⟩ + |−⟩ = (2/√2)|0⟩ = √2|0⟩     तो   |0⟩ = (|+⟩ + |−⟩)/√2
|+⟩ − |−⟩ = (2/√2)|1⟩ = √2|1⟩     तो   |1⟩ = (|+⟩ − |−⟩)/√2
```

पहली लाइन को भौतिक रूप से पढ़ें: **|0⟩, जो 0/1 सवाल में पूरी तरह पक्का है, +/− सवाल में 50/50 superposition है।** कोई state अपने आप में "superposition में" या "superposition में नहीं" नहीं होती। यह इस पर निर्भर है कि आप उसे किस basis में बता रहे हैं। यह लगभग सबको हैरान करता है, और इस पर एक मिनट रुककर सोचना चाहिए।

### Outer products: vectors से matrices

Ket गुणा bra, इसी क्रम में, column गुणा row है। इससे **matrix** बनती है:

```text
|0⟩⟨0| = [1] × [1, 0] = [ 1  0 ]
         [0]            [ 0  0 ]
```

इसे **outer product** कहते हैं। |0⟩⟨0|, |0⟩ पर **projector** है: किसी भी state पर लगाएँ, तो |0⟩ वाला हिस्सा रखता है और बाक़ी फेंक देता है।

```text
|0⟩⟨0| (α|0⟩ + β|1⟩) = α|0⟩⟨0|0⟩ + β|0⟩⟨0|1⟩ = α|0⟩·1 + β|0⟩·0 = α|0⟩
```

देखें कि algebra बस brackets को खिसकाकर पास लाने से चलता है: |0⟩⟨0|0⟩ = |0⟩(⟨0|0⟩) = |0⟩·1। Dirac notation की असली ताक़त यही है: अक्सर एक भी matrix लिखे बिना गणना हो जाती है। Projectors measurement बताते हैं (पाठ 8), और हर gate को outer products के जोड़ की तरह लिखा जा सकता है (पाठ 4)।

## कोड: NumPy और Qiskit में inner products

NumPy में `np.vdot(a, b)`, ⟨a|b⟩ निकालता है, पहले vector का conjugate ख़ुद लेकर।

```python
import numpy as np
ket0 = np.array([1, 0])
ket1 = np.array([0, 1])
plus  = (ket0 + ket1) / np.sqrt(2)
minus = (ket0 - ket1) / np.sqrt(2)
psi   = np.array([1, 1j]) / np.sqrt(2)

# np.vdot(a, b) conjugates a first, so it computes <a|b>
print(round(abs(np.vdot(plus, minus)), 6))      # |<+|->|
print(round(abs(np.vdot(plus, plus)), 6))       # |<+|+>|
print(round(abs(np.vdot(psi, psi)), 6))         # |<psi|psi>|
print(round(abs(np.vdot(plus, psi)) ** 2, 6))   # |<+|psi>|^2
print(np.round(np.vdot(plus, psi), 4))          # <+|psi> itself
```

```text
0.0
1.0
1.0
0.5
(0.5+0.5j)
```

आख़िरी लाइन हल किए उदाहरण से मेल खाती है: ⟨+|ψ⟩ = ½ + i/2।

Outer product, projector की तरह:

```python
import numpy as np
ket0 = np.array([1, 0])
psi = np.array([3, 4j]) / 5
P0 = np.outer(ket0, ket0.conj())     # |0><0|
print(P0)
print(P0 @ psi)
print(abs(np.vdot(ket0, psi))**2)
```

```text
[[1 0]
 [0 0]]
[0.6+0.j 0. +0.j]
0.3600000000000001
```

Projector ने सिर्फ़ |0⟩ वाला हिस्सा रखा (amplitude 3/5 = 0.6), और |0⟩ मिलने की संभावना 0.36 है (आख़िरी अंक rounding हैं)। Qiskit में यही औज़ार पहले से हैं। उसका `Statevector.from_label` आम states को एक अक्षर से पहचानता है: '0', '1', '+', '−' ('-' लिखें), और (|0⟩ ± i|1⟩)/√2 के लिए 'r' और 'l'।

```python
import numpy as np
from qiskit.quantum_info import Statevector
a = Statevector.from_label('+')      # (|0> + |1>)/sqrt(2)
b = Statevector.from_label('r')      # (|0> + i|1>)/sqrt(2)
print(np.round(a.inner(b), 4))       # <a|b>
print(round(abs(a.inner(b)) ** 2, 4))
print(b.probabilities().round(4))    # P(0), P(1) for b
```

```text
(0.5+0.5j)
0.5
[0.5 0.5]
```

## ख़ुद करके देखें

1. v = [2, −i] के लिए ⟨v, v⟩ निकालें और v को normalise करें।
2. दिखाएँ कि ⟨−|−⟩ = 1 और ⟨0|−⟩ = 1/√2।
3. |ψ⟩ = (3|0⟩ − 4i|1⟩)/5 के लिए ⟨1|ψ⟩ और 1 मिलने की probability निकालें।
4. |ψ⟩ = (|0⟩ + i|1⟩)/√2 के लिए ⟨ψ| को row की तरह लिखें। (Conjugate का ध्यान रखें।)
5. |1⟩⟨1| को matrix की तरह लिखें, और जाँचें कि |0⟩⟨0| + |1⟩⟨1| identity matrix है।
6. |−⟩ को |0⟩ और |1⟩ में, और |1⟩ को |+⟩ और |−⟩ में लिखें।

**जवाब:**

1. 2*·2 + (−i)*·(−i) = 4 + (i)(−i) = 4 + 1 = 5। Normalised: [2/√5, −i/√5]।
2. ⟨−|−⟩ = ½ + (−1/√2)(−1/√2) = ½ + ½ = 1। ⟨0|−⟩ = 1·(1/√2) + 0 = 1/√2।
3. ⟨1|ψ⟩ = −4i/5। Probability |−4i/5|² = 16/25 = 0.64।
4. ⟨ψ| = [1/√2, −i/√2]: i बन जाता है −i।
5. |1⟩⟨1| = [[0, 0], [0, 1]]। [[1, 0], [0, 0]] जोड़ने पर [[1, 0], [0, 1]] = I। (इसे **completeness relation** कहते हैं: किसी basis के projectors का जोड़ "कुछ न करना" है।)
6. |−⟩ = (|0⟩ − |1⟩)/√2। |1⟩ = (|+⟩ − |−⟩)/√2।

## सार

| विचार | Notation | मतलब |
|---|---|---|
| Ket | \|ψ⟩ | Column vector: state |
| Basis states | \|0⟩ = [1, 0], \|1⟩ = [0, 1] | Computational basis |
| Hadamard basis | \|±⟩ = (\|0⟩ ± \|1⟩)/√2 | एक और orthonormal basis |
| आम qubit | \|ψ⟩ = α\|0⟩ + β\|1⟩ | Complex भार के साथ superposition |
| Bra | ⟨ψ\| = \|ψ⟩† | Conjugate की हुई row |
| Inner product | ⟨φ\|ψ⟩ = Σ φᵢ* ψᵢ | Overlap; एक नंबर |
| क्रम बदलना | ⟨ψ\|φ⟩ = ⟨φ\|ψ⟩* | Conjugate मिलता है |
| Normalised | ⟨ψ\|ψ⟩ = 1 | हर state के लिए ज़रूरी |
| Orthogonal | ⟨φ\|ψ⟩ = 0 | पूरी तरह पहचाने जा सकते हैं |
| Amplitude | ⟨0\|ψ⟩ = α | Bracket एक हिस्सा निकालता है |
| Probability | \|⟨φ\|ψ⟩\|² | \|ψ⟩ के \|φ⟩ में मिलने की संभावना |
| Outer product | \|ψ⟩⟨φ\| | एक matrix |
| Projector | \|0⟩⟨0\| | सिर्फ़ \|0⟩ वाला हिस्सा रखता है |
| Completeness | \|0⟩⟨0\| + \|1⟩⟨1\| = I | Basis projectors का जोड़ identity |
| NumPy | `np.vdot(a, b)` | ⟨a\|b⟩ |
| Qiskit | `Statevector.from_label('+')`, `.inner()` | तैयार states और brackets |
