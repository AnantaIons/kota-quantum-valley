---
layout: ../../../layouts/Post.astro
lang: hi
title: "Quantum Fourier transform और phase estimation"
description: "QFT क्या करता है, यह classical version से exponentially सस्ता क्यों है, और phase estimation एक छिपे कोण को bits में कैसे पढ़ता है।"
date: 2026-11-04
category: lesson
lesson: 10
---

Quantum Fourier transform (QFT) Shor algorithm और exponential speed-up वाले ज़्यादातर algorithms का छिपा इंजन है।

## Fourier का विचार, एक पैराग्राफ़ में

Fourier transform किसी pattern से पूछता है: *यह किन दोहराती frequencies से बना है?* जो signal हर 4 samples पर दोहराता है, उसमें "period 4" का मज़बूत हिस्सा होता है। आपका फ़ोन audio और Wi-Fi के लिए यह हर सेकंड लाखों बार करता है।

## QFT

QFT यही काम n qubits के **amplitudes** पर करता है:

```
|x⟩  →  (1/√N) Σ_k  e^(2πi·x·k/N) |k⟩      जहाँ N = 2ⁿ
```

**लागत:** n qubits के लिए लगभग n²/2 gates। 2ⁿ नंबरों पर classical FFT को लगभग n·2ⁿ कदम चाहिए। यही exponential अंतर है।

**शर्त:** आप सभी 2ⁿ amplitudes नहीं पढ़ सकते; measurement एक ही नतीजा देता है। QFT सिर्फ़ उन algorithms में काम का है जो जवाब को सबसे संभावित नतीजा बना देते हैं।

## Phase estimation: एक कोण को bits में पढ़ना

**समस्या:** एक gate U किसी state |u⟩ को सिर्फ़ एक phase से गुणा करता है: U|u⟩ = e^(2πiφ)|u⟩। φ ढूँढिए।

**तरीका:**

1. कुछ "counting" qubits को H से superposition में डालें।
2. Counting qubit k, U को 2ᵏ बार control करे। हर एक φ·2ᵏ phase उठाता है (phase kickback, पाठ 3)।
3. Counting qubits पर **inverse QFT** लगाएँ।
4. Measure करें: bits φ को binary fraction के रूप में लिखते हैं।

## Qiskit में phase estimation

T gate |1⟩ को e^(iπ/4) = e^(2πi·1/8) से गुणा करता है। तो φ = 1/8 = binary में 0.001।

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.circuit.library import QFTGate
from qiskit.primitives import StatevectorSampler

pe = QuantumCircuit(4, 3)
pe.x(3)                              # T की eigenstate |1⟩
pe.h([0, 1, 2])                      # counting qubits
for k in range(3):
    for _ in range(2**k):
        pe.cp(np.pi / 4, k, 3)       # controlled-T, 2^k बार
pe.append(QFTGate(3).inverse(), [0, 1, 2])
pe.measure([0, 1, 2], [0, 1, 2])

print(StatevectorSampler().run([pe], shots=1000).result()[0].data.c.get_counts())
```

```text
{'001': 1000}
```

Counting register **001** = 1 पढ़ता है, तो φ = 1/2³ = **1/8**। हर shot में बिल्कुल सही।

## यह कहाँ इस्तेमाल होता है

- **Shor algorithm** (पाठ 11): period ढूँढना, phase estimation का ही रूप है।
- **Quantum chemistry** (पाठ 14): किसी molecule की energy निकालना उसके Hamiltonian का phase estimation है।
- **Quantum sensing** (पाठ 6): Ramsey interferometry एक-qubit phase estimation है।

## ख़ुद आज़माएँ

1. `np.pi / 4` को `np.pi / 2` (S gate, φ = 1/4) से बदलें। Register क्या पढ़ेगा?
2. `np.pi / 3` (φ = 1/6) आज़माएँ। कौन-से नतीजे सबसे ज़्यादा आते हैं?
3. चौथा counting qubit जोड़कर सवाल 2 दोहराएँ। क्या precision बढ़ी?
