---
layout: ../../../layouts/Post.astro
lang: hi
title: "Teleportation और superdense coding"
description: "दो classical bits से एक qubit भेजें, और एक qubit से दो classical bits। Entanglement की असली क़ीमत दिखाने वाले दो protocols।"
date: 2026-11-04
category: lesson
lesson: 8
---

Entanglement (पाठ 2) एक संसाधन है जिसे ख़र्च किया जा सकता है। यह पाठ उसे ख़र्च करने के दो क्लासिक तरीके दिखाता है। दोनों में एक साझा Bell pair इस्तेमाल होता है।

## Quantum teleportation

**लक्ष्य:** Alice के पास एक अनजान qubit |ψ⟩ = α|0⟩ + β|1⟩ है। वह चाहती है कि यह Bob के पास पहुँचे। वह इसे measure नहीं कर सकती (α और β नष्ट हो जाएँगे) और copy भी नहीं कर सकती (no-cloning, पाठ 5)।

**तरीका:**

1. **Bell pair बाँटें।** q1 Alice के पास, q2 Bob के पास: (|00⟩ + |11⟩)/√2।
2. **Alice:** q0 (भेजने वाला qubit) से q1 पर CNOT, फिर q0 पर H।
3. **Alice q0 और q1 measure करती है** और दो random bits m0, m1 पाती है।
4. **वह m0, m1 Bob को भेजती है**, साधारण channel से (फ़ोन, इंटरनेट)।
5. **Bob सुधार करता है:** m1 = 1 हो तो X, m0 = 1 हो तो Z।

अब Bob का qubit ठीक |ψ⟩ है।

| Alice के bits (m0 m1) | Bob लगाता है |
|---|---|
| 0 0 | कुछ नहीं |
| 0 1 | X |
| 1 0 | Z |
| 1 1 | X फिर Z |

**Teleportation क्या नहीं है:**

- **पदार्थ भेजना नहीं।** सिर्फ़ *state* जाती है; Bob का qubit पहले से Bob के पास था।
- **रोशनी से तेज़ नहीं।** जब तक दो classical bits नहीं पहुँचते, Bob का qubit पूरी तरह random दिखता है।
- **Copy नहीं।** Alice का original measurement से नष्ट हो जाता है।

## Qiskit में teleportation

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, partial_trace, DensityMatrix
import numpy as np

tp = QuantumCircuit(3)
tp.ry(1.2, 0)            # Alice की "अनजान" state
tp.h(1); tp.cx(1, 2)     # Bell pair: q1 Alice, q2 Bob
tp.cx(0, 1); tp.h(0)     # Alice के operations
tp.cx(1, 2); tp.cz(0, 2) # Bob के सुधार

bob = partial_trace(Statevector(tp), [0, 1])
ref = QuantumCircuit(1); ref.ry(1.2, 0)
print(np.allclose(bob.data, DensityMatrix(Statevector(ref)).data))   # True
```

**True**: Bob का qubit ठीक वही है जिससे Alice ने शुरू किया था।

## Superdense coding

उल्टी तरकीब: **सिर्फ़ 1 qubit भेजकर 2 classical bits भेजें।**

1. Alice और Bob के पास Bell pair है।
2. Alice **सिर्फ़ अपने qubit पर** कुछ नहीं, X, Z या X फिर Z लगाकर दो bits encode करती है।
3. वह अपना qubit Bob को भेजती है।
4. Bob CNOT फिर H लगाकर दोनों qubits measure करता है।

```python
from qiskit.primitives import StatevectorSampler
sampler = StatevectorSampler()

for label, ops in [("nothing", ""), ("X", "x"), ("Z", "z"), ("X then Z", "xz")]:
    sd = QuantumCircuit(2)
    sd.h(0); sd.cx(0, 1)
    if "x" in ops: sd.x(0)
    if "z" in ops: sd.z(0)
    sd.cx(0, 1); sd.h(0)
    sd.measure_all()
    print(label, sampler.run([sd], shots=100).result()[0].data.meas.get_counts())
```

```text
nothing  {'00': 100}
X        {'10': 100}
Z        {'01': 100}
X then Z {'11': 100}
```

हर विकल्प से 100 में से 100 बार एक ही नतीजा।

## यह क्यों मायने रखता है

- भविष्य का **quantum internet** processors और दूर के nodes के बीच qubits teleportation से ही भेजेगा।
- दोनों protocols साबित करते हैं कि entanglement और classical bits मिलकर वह कर सकते हैं जो अकेले कोई नहीं कर सकता।

## ख़ुद आज़माएँ

1. Teleportation कोड में `ry(1.2, 0)` को `h(0)` या `x(0)` से बदलें। क्या नतीजा अब भी True है?
2. `tp.cz(0, 2)` हटा दें। क्या ग़लत होता है?
3. [क्वांटम लैब](/hi/lab/) के circuit builder में "X then Z" वाला superdense circuit बनाएँ।
