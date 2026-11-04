---
layout: ../../../layouts/Post.astro
lang: hi
title: "Grover search, कोड में"
description: "Grover algorithm शुरू से बनाएँ: oracle, diffusion, कितने rounds, और 2-qubit search एक ही बार में जवाब क्यों देता है।"
date: 2026-11-04
category: lesson
lesson: 9
---

पाठ 3 में Grover search चित्रों से समझाया था। अब आप इसे gate-दर-gate बनाएँगे।

## समस्या

N संभावित जवाब हैं और एक "checker" (**oracle**) है जो सही जवाब पहचान सकता है। Classically आप एक-एक करके जाँचते हैं: औसतन N/2 बार। Grover लगभग **(π/4)·√N** rounds में ढूँढ लेता है।

| N | Classical (औसत) | Grover rounds |
|---|---|---|
| 4 | 2 | 1 |
| 10,00,000 | 5,00,000 | ~785 |
| 10¹² | 5 × 10¹¹ | ~7,85,000 |

यह **quadratic** speed-up है: उपयोगी, लेकिन exponential नहीं।

## एक round के दो हिस्से

**1. Oracle: जवाब का चिह्न पलटें।** Marked state का amplitude −1 से गुणा होता है। Probabilities अभी नहीं बदलतीं, सिर्फ़ एक छिपा चिह्न।

**2. Diffusion: हर amplitude को औसत के चारों ओर पलटें।** Marked amplitude अब औसत से नीचे है, तो पलटने पर वह बहुत ऊपर चला जाता है। बाक़ी थोड़े छोटे हो जाते हैं।

दोनों कदम लगभग (π/4)√N बार दोहराएँ, फिर measure करें।

## 2 qubits पर Grover

2 qubits पर 4 जवाब हैं: 00, 01, 10, 11। हम **11** को mark करेंगे। N = 4 के लिए **एक round** से जवाब पक्का मिलता है।

```python
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler

g = QuantumCircuit(2)
g.h([0, 1])          # चारों जवाबों का बराबर superposition

g.cz(0, 1)           # Oracle: |11⟩ का चिह्न पलटें

g.h([0, 1])          # Diffusion
g.x([0, 1])
g.cz(0, 1)
g.x([0, 1])
g.h([0, 1])

g.measure_all()
print(StatevectorSampler().run([g], shots=1000).result()[0].data.meas.get_counts())
```

```text
{'11': 1000}
```

1,000 में से 1,000। Classically औसतन 2 अंदाज़े, और सबसे बुरे में 3 लगते।

## दूसरा जवाब mark करना

सिर्फ़ oracle बदलता है। q0 = 1 और q1 = 0 वाले जवाब के लिए q1 पर CZ के दोनों तरफ़ X लगाएँ:

```python
g2 = QuantumCircuit(2)
g2.h([0, 1])
g2.x(1); g2.cz(0, 1); g2.x(1)                                        # oracle
g2.h([0, 1]); g2.x([0, 1]); g2.cz(0, 1); g2.x([0, 1]); g2.h([0, 1])  # diffusion
g2.measure_all()
print(StatevectorSampler().run([g2], shots=1000).result()[0].data.meas.get_counts())
```

```text
{'01': 1000}
```

Qiskit q1 को पहले लिखता है, तो '01' का मतलब q1 = 0, q0 = 1: वही जो हमने mark किया।

## ज़्यादा rounds नुक़सानदेह

Grover एक घुमाव है। कम rounds में जवाब तक नहीं पहुँचते; **ज़्यादा rounds में आगे निकल जाते हैं**। N = 4 पर दूसरा round नतीजा बिगाड़ देता है।

## ईमानदार सीमाएँ

- Oracle को quantum circuit के रूप में बनाना पड़ता है। "Database search" में data load करना अक्सर classical search जितना महँगा होता है।
- Quadratic speed-up error-correction की लागत (पाठ 12) में खप सकता है।
- आज का असली असर: यह symmetric keys की ताक़त आधी कर देता है, इसीलिए लंबी सुरक्षा के लिए AES-128 के बजाय AES-256 की सलाह दी जाती है।

## ख़ुद आज़माएँ

1. **00** mark करें: oracle में कौन-से X gates चाहिए?
2. 2-qubit circuit में दूसरा Grover round जोड़ें। Counts का क्या होता है?
3. यही circuit [क्वांटम लैब](/hi/lab/) के circuit builder में बनाएँ।
