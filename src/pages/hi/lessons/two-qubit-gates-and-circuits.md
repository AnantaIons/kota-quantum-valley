---
layout: ../../../layouts/Post.astro
lang: hi
title: "क्वांटम gates और circuits"
description: "हर ज़रूरी gate matrix और Bloch sphere घुमाव के रूप में, |+⟩ और |−⟩, दो-qubit gates, Bell pair बनाना और universal gate set, हर बात कोड से जाँचकर।"
date: 2026-10-29
category: lesson
lesson: 13

---

Quantum program एक **circuit** है: qubits आड़ी लाइनें, gates डिब्बे, बाएँ से दाएँ पढ़ें। यह पाठ आगे इस्तेमाल होने वाला हर gate देता है।

## हर gate का नियम

Gate एक **unitary matrix** U है: यह |α|² + |β|² = 1 बनाए रखता है। हर unitary उलटा किया जा सकता है, इसलिए **quantum gates reversible हैं**। (Measurement gate नहीं है, और reversible नहीं है।)

## Bloch sphere की तस्वीर

हर single-qubit state एक गोले पर बिंदु है: उत्तरी ध्रुव |0⟩, दक्षिणी ध्रुव |1⟩, भूमध्य रेखा पर 50/50 states। हर single-qubit gate इस गोले का **घुमाव** है। ([पूरी व्याख्या](/hi/posts/what-is-the-bloch-sphere/))

## Single-qubit gates

| Gate | Matrix | Bloch घुमाव | असर |
|---|---|---|---|
| **X** | [[0, 1], [1, 0]] | x पर 180° | \|0⟩ ↔ \|1⟩ (quantum NOT) |
| **Y** | [[0, −i], [i, 0]] | y पर 180° | Bit flip + phase flip |
| **Z** | [[1, 0], [0, −1]] | z पर 180° | \|1⟩ → −\|1⟩ (phase flip) |
| **H** | (1/√2)[[1, 1], [1, −1]] | x+z पर 180° | \|0⟩ → \|+⟩, \|1⟩ → \|−⟩ |
| **S** | [[1, 0], [0, i]] | z पर 90° | चौथाई phase |
| **T** | [[1, 0], [0, e^(iπ/4)]] | z पर 45° | आठवाँ phase |
| **Rx, Ry, Rz(θ)** | — | x, y, z पर θ | कोई भी कोण |

दो उपयोगी पहचान: **T·T = S** और **H·Z·H = X**।

## |+⟩ और |−⟩: probabilities एक, states अलग

```
|+⟩ = (|0⟩ + |1⟩)/√2        |−⟩ = (|0⟩ − |1⟩)/√2
```

दोनों measure करने पर 50/50 देते हैं। लेकिन H, |+⟩ को |0⟩ और |−⟩ को |1⟩ बना देता है। Minus चिह्न असली जानकारी है, जो **phase** में रहती है।

## दो qubits

दो qubits के 4 basis states: |00⟩, |01⟩, |10⟩, |11⟩। अलग qubits जोड़ना **tensor product** है: |0⟩ ⊗ |1⟩ = |01⟩।

**CNOT**, control |1⟩ हो तो target पलटता है:

| Input | Output |
|---|---|
| \|00⟩ | \|00⟩ |
| \|01⟩ | \|01⟩ |
| \|10⟩ | \|11⟩ |
| \|11⟩ | \|10⟩ |

दूसरे gates: **CZ** (दोनों 1 हों तो phase flip), **SWAP** (दो qubits की अदला-बदली), **Toffoli** (दोनों controls 1 हों तो target पलटे)।

## Bell pair, कदम-दर-कदम

1. शुरुआत: |00⟩
2. Qubit 0 पर H: (|00⟩ + |10⟩)/√2
3. CNOT 0→1: |10⟩ वाला हिस्सा |11⟩ बनता है, मिलता है **(|00⟩ + |11⟩)/√2**

दो gates, और qubits entangled। ([Entanglement की व्याख्या](/hi/posts/what-is-entanglement/))

## Universal gate set

**H, T और CNOT** मिलकर *किसी भी* quantum computation का मनचाहा सटीक अनुमान लगा सकते हैं।

## हर दावा कोड से जाँचें

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Operator, Statevector
import numpy as np

c = QuantumCircuit(1); c.h(0); c.z(0); c.h(0)
print(Operator(c).equiv(Operator.from_label("X")))   # True:  HZH = X

tt = QuantumCircuit(1); tt.t(0); tt.t(0)
s = QuantumCircuit(1); s.s(0)
print(Operator(tt).equiv(Operator(s)))               # True:  TT = S

minus = QuantumCircuit(1); minus.x(0); minus.h(0)
print(np.round(Statevector(minus).data.real, 3))     # [ 0.707 -0.707]  = |−⟩
```

## ख़ुद आज़माएँ

1. H·H क्या करता है? `Operator` से जाँचें।
2. Matrices गुणा करके दिखाएँ कि X·X = I।
3. Bell pair बनाकर qubit 1 पर X लगाएँ। कौन-सी Bell state मिली?
4. [क्वांटम लैब](/hi/lab/) में H, फिर S, फिर S दबाएँ। तीर कहाँ पहुँचा, और S·S किस gate के बराबर है?

## सार

| करना है… | इस्तेमाल करें |
|---|---|
| 0 ↔ 1 पलटना | X |
| 50/50 superposition | H |
| सिर्फ़ phase बदलना | Z, S, T, Rz |
| दो qubits entangle करना | H फिर CNOT |
| Universal set | H, T, CNOT |
