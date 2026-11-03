---
layout: ../../../layouts/Post.astro
lang: hi
title: "क्वांटम gates और circuits"
description: "Bloch sphere, X, Y, Z, H, S और T gates, rotations, CNOT, आपका पहला Bell pair और universal gate set।"
date: 2026-10-29
category: lesson
lesson: 2
slides: lesson-2
---

## मुख्य बातें

**Gate एक घुमाव (rotation) है।** हर single-qubit state **Bloch sphere** पर एक बिंदु है: |0⟩ उत्तरी ध्रुव पर, |1⟩ दक्षिणी ध्रुव पर, और superpositions सतह पर बीच में। Single-qubit gates इस बिंदु को घुमाते हैं। ये unitary matrices हैं, इसलिए कोई जानकारी नहीं खोती और हर gate को उलटा किया जा सकता है।

## Single-qubit gates

| Gate | क्या करता है |
|---|---|
| X | \|0⟩ ↔ \|1⟩ पलटता है (quantum NOT)। x-axis के चारों ओर 180°। |
| Z | \|0⟩ को वैसा ही छोड़ता है, \|1⟩ का चिह्न बदलता है। Phase flip। |
| Y | Bit flip और phase flip एक साथ। |
| H | \|0⟩ → \|+⟩, \|1⟩ → \|−⟩। Superposition बनाता भी है, हटाता भी है। |
| S, T | चौथाई और आठवें हिस्से के phase gates। |
| Rx, Ry, Rz | अपनी पसंद के किसी भी कोण से घुमाएँ। |

`|+⟩ = (|0⟩ + |1⟩)/√2` और `|−⟩ = (|0⟩ − |1⟩)/√2` दोनों measure करने पर 50/50 नतीजे देते हैं, फिर भी ये अलग states हैं। दोबारा H लगाइए तो वापस |0⟩ या |1⟩ मिलता है।

## दो qubits और entanglement

**CNOT** target qubit को तभी पलटता है जब control |1⟩ हो। पहले qubit पर H लगाइए, फिर CNOT, और आपको **Bell state** (|00⟩ + |11⟩)/√2 मिलती है। दो qubits को entangle करने के लिए बस दो gates काफ़ी हैं।

दूसरे उपयोगी gates: **SWAP** (दो qubits की अदला-बदली), **CZ** (दोनों 1 हों तो phase flip), **Toffoli** (दो controls वाला NOT)।

## Universal gate set

H, T और CNOT मिलकर *किसी भी* quantum computation का अनुमान लगा सकते हैं। असली हार्डवेयर सब कुछ ऐसे ही छोटे सेट से बनाता है।

```python
from qiskit import QuantumCircuit
qc = QuantumCircuit(2, 2)
qc.h(0)
qc.cx(0, 1)
qc.measure([0, 1], [0, 1])
```
