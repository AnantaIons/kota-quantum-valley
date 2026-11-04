---
layout: ../../../layouts/Post.astro
lang: hi
title: "शून्य से क्वांटम: qubit, |0⟩ और |1⟩"
description: "Bit बनाम qubit, quantum state एक vector के रूप में, amplitudes और probabilities, complex numbers क्यों, और चार बड़े विचार, आपके पहले कोड के साथ।"
date: 2026-10-28
category: lesson
lesson: 1
slides: lesson-1
---

यह पाठ course का सबसे ज़रूरी विचार बनाता है: **qubit दो नंबरों का एक vector है।** बाक़ी सब इसी पर बना है।

## Bit बनाम qubit

Classical **bit** 0 या 1 होता है। उसे जितनी बार चाहें पढ़ें; पढ़ने से वह नहीं बदलता।

**Qubit** की एक **state** होती है। दो बुनियादी states:

- `|0⟩`, पढ़ें "ket zero"
- `|1⟩`, पढ़ें "ket one"

## State एक vector है

```
|0⟩ = [1, 0]        |1⟩ = [0, 1]
```

कोई भी qubit state इनका मिश्रण है:

```
|ψ⟩ = α|0⟩ + β|1⟩ = [α, β]
```

α और β को **amplitudes** कहते हैं।

## Amplitudes → probabilities

Qubit **measure** करने पर सीधा 0 या 1 मिलता है:

- P(0) = |α|²
- P(1) = |β|²
- और हमेशा **|α|² + |β|² = 1**

**उदाहरण:** |ψ⟩ = √0.8|0⟩ + √0.2|1⟩। P(0) = 0.8, P(1) = 0.2। 1,000 copies measure करें तो लगभग 800 बार 0 और 200 बार 1।

Measure करने के बाद qubit वही **बन जाता** है जो नतीजा आया। Superposition ख़त्म।

## Complex numbers क्यों?

Amplitudes negative या complex (जैसे i/√2) हो सकते हैं। यह ज़रूरी है क्योंकि amplitudes square होने से पहले **जुड़ते** हैं, इसलिए **cancel** हो सकते हैं:

- (+½) + (+½) = 1, पक्का नतीजा।
- (+½) + (−½) = 0, असंभव नतीजा।

Probabilities कभी cancel नहीं हो सकतीं (वे negative नहीं होतीं)। यही cancelling, यानी **interference**, quantum computing की ताक़त है।

## Gates matrices हैं

Gate, vector को matrix से गुणा करके state बदलता है। Quantum NOT gate, **X**:

```
X = [[0, 1],
     [1, 0]]          X|0⟩ = |1⟩,  X|1⟩ = |0⟩
```

## कितना बड़ा होता है?

| Qubits | Amplitudes |
|---|---|
| 1 | 2 |
| 10 | 1,024 |
| 50 | लगभग 10¹⁵ (supercomputer भी संघर्ष करता है) |
| 300 | लगभग 10⁹⁰ (दिखने वाले ब्रह्मांड के atoms से ज़्यादा) |

लेकिन ये सारे amplitudes पढ़े नहीं जा सकते: एक measurement एक ही n-bit जवाब देता है।

## चार बड़े विचार

1. **Superposition:** एक से ज़्यादा basis states पर non-zero amplitudes।
2. **Measurement:** |amplitude|² की probability से एक नतीजा, और state collapse।
3. **Entanglement:** कई qubits की साझा state जिसे तोड़ा नहीं जा सकता (पाठ 2)।
4. **Interference:** amplitudes जुड़ते या कटते हैं; algorithms इससे ग़लत जवाब दबाते हैं।

## आपका पहला कोड

```python
import numpy as np

ket0 = np.array([1, 0])
X = np.array([[0, 1], [1, 0]])
print(X @ ket0)            # [0 1]  →  |1⟩

psi = np.array([np.sqrt(0.8), np.sqrt(0.2)])
print(np.abs(psi)**2)      # [0.8 0.2]  probabilities
```

Qiskit के साथ (पाठ 7 में install करेंगे), उसी 80/20 state को 1,000 बार measure करना:

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler

qc = QuantumCircuit(1)
qc.ry(2 * np.arcsin(np.sqrt(0.2)), 0)   # √0.8|0⟩ + √0.2|1⟩ बनाता है
qc.measure_all()
print(StatevectorSampler().run([qc], shots=1000).result()[0].data.meas.get_counts())
```

```text
{'1': 202, '0': 798}
```

## ख़ुद आज़माएँ

1. क्या [0.6, 0.8] सही qubit state है? P(0) और P(1) क्या हैं?
2. क्या [1/√2, i/√2] सही है? Probabilities?
3. [0.6, 0.8] पर X लगाएँ।
4. [क्वांटम लैब](/hi/lab/) में **H** दबाकर 1,000 बार measure करें। कौन-सी state बनी?

जवाब: (1) हाँ, 0.36 और 0.64; (2) हाँ, 0.5 और 0.5; (3) [0.8, 0.6]।

## सार

| विचार | Formula |
|---|---|
| Qubit state | \|ψ⟩ = α\|0⟩ + β\|1⟩ = [α, β] |
| Probabilities | P(0) = \|α\|², P(1) = \|β\|² |
| Normalisation | \|α\|² + \|β\|² = 1 |
| Gate | नई state = matrix × पुरानी state |
| n qubits | 2ⁿ amplitudes |
