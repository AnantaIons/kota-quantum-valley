---
layout: ../../../layouts/Post.astro
lang: hi
title: "क्वांटम algorithms: Deutsch–Jozsa से Shor तक"
description: "हर quantum algorithm का नुस्खा, phase kickback, Deutsch–Jozsa और Bernstein–Vazirani चलने वाले कोड में, और Grover, QFT व Shor का नक्शा।"
date: 2026-10-29
category: lesson
lesson: 22

---

Quantum algorithm "हर जवाब एक साथ आज़माकर सबसे अच्छा चुनना" नहीं करता। वह कुछ बारीक करता है: **interference** ऐसे सजाता है कि ग़लत जवाब cancel हो जाएँ और सही जवाब ही measure हो। यह पाठ दो चलने वाले algorithms से यही दिखाता है।

## नुस्खा

1. **Superpose:** हर input qubit पर H, सभी inputs एक साथ।
2. **Oracle:** circuit जो समस्या को कुछ inputs पर **phase** लगाकर encode करता है।
3. **Interfere:** और gates (अक्सर फिर H, या QFT) ताकि phases बड़े या छोटे amplitudes बनें।
4. **Measure:** जवाब पढ़ें।

## Oracle और phase kickback

f(x) (0 या 1) का oracle आमतौर पर f(x) = 1 होने पर एक अतिरिक्त "target" qubit पलटता है।

तरकीब: target को **|−⟩** में रखें। |−⟩ पलटने से −|−⟩ मिलता है। Target वैसा ही रहता है, बस minus चिह्न **input** state पर चला जाता है:

```
|x⟩|−⟩  →  (−1)^f(x) |x⟩|−⟩
```

यही **phase kickback** है।

## Deutsch–Jozsa: constant या balanced?

**समस्या:** f, n bits लेकर 0 या 1 देता है। वादा है कि यह या तो **constant** है (हर input पर एक ही output) या **balanced** (ठीक आधे inputs पर 0)। कौन-सा?

- **Classically:** सबसे बुरे में 2ⁿ⁻¹ + 1 inputs जाँचने पड़ते हैं।
- **Quantum:** oracle को **एक** बार बुलाना।

**नियम:** सारे input qubits measure करें। **सब शून्य तो constant; कुछ और तो balanced।**

```python
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler

def deutsch_jozsa(balanced):
    q = QuantumCircuit(4, 3)        # 3 input qubits + 1 target
    q.x(3); q.h(range(4))           # target |−⟩ में, inputs superposition में
    if balanced:                    # oracle f(x) = x0 XOR x1 XOR x2
        for i in range(3):
            q.cx(i, 3)
    q.h(range(3))                   # interfere
    q.measure(range(3), range(3))
    return StatevectorSampler().run([q], shots=1000).result()[0].data.c.get_counts()

print("constant:", deutsch_jozsa(False))
print("balanced:", deutsch_jozsa(True))
```

```text
constant: {'000': 1000}
balanced: {'111': 1000}
```

## Bernstein–Vazirani: छिपी string ढूँढें

**समस्या:** एक गुप्त n-bit string s के लिए f(x) = s·x (mod 2)। s ढूँढें।

- **Classically:** n बार बुलाना।
- **Quantum:** **एक** बार। Measure किए bits *ही* s हैं।

```python
secret = "101"
bv = QuantumCircuit(4, 3)
bv.x(3); bv.h(range(4))
for i, bit in enumerate(reversed(secret)):   # Qiskit का qubit 0 सबसे दाएँ
    if bit == "1":
        bv.cx(i, 3)
bv.h(range(3))
bv.measure(range(3), range(3))
print(StatevectorSampler().run([bv], shots=1000).result()[0].data.c.get_counts())
```

```text
{'101': 1000}
```

## तीन बड़े algorithms, एक नक्शे में

| Algorithm | समस्या | Classical | Quantum | विस्तार |
|---|---|---|---|---|
| **Grover** | N में से 1 marked चीज़ | ~N/2 | ~√N | पाठ 24 |
| **QFT / phase estimation** | छिपा period या phase | Exponential (आमतौर पर) | Polynomial | पाठ 26–27 |
| **Shor** | बड़ी संख्या के factors | Sub-exponential | Polynomial | पाठ 28 |

## ईमानदार बात

Quantum computers हर चीज़ तेज़ नहीं करते। Deutsch–Jozsa और Bernstein–Vazirani बनावटी समस्याएँ हल करते हैं; वे सिर्फ़ तरीका दिखाने के लिए हैं। बड़े व्यावहारिक फ़ायदे **factoring**, **molecules और materials का simulation** (पाठ 45) और कुछ search व optimisation में अपेक्षित हैं, ज़्यादातर भविष्य की error-corrected मशीनों पर।

## ख़ुद आज़माएँ

1. Balanced oracle को सिर्फ़ `q.cx(0, 3)` कर दें। क्या अब भी balanced है? Output क्या है?
2. `secret` को `"110"` करके output जाँचें।
3. Target |−⟩ से ही क्यों शुरू हो? `q.x(3)` हटाकर देखें।

## सार

| शब्द | मतलब |
|---|---|
| Oracle | जवाबों पर phase का निशान लगाने वाला circuit |
| Phase kickback | \|−⟩ वाला target चिह्न को input पर डाल देता है |
| Interference | H (या QFT) phases को probabilities में बदलता है |
| Speed-up के प्रकार | Exponential (Shor), quadratic (Grover), query (DJ, BV) |
