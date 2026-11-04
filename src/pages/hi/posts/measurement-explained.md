---
layout: ../../../layouts/Post.astro
lang: hi
title: "Measurement, ठीक से समझें"
description: "Born rule, inner product ⟨φ|ψ⟩, अलग-अलग bases में measure करना, 'collapse' का मतलब, और no-cloning क्यों सच है।"
date: 2026-11-04
category: explainer
---

हर पाठ measurement इस्तेमाल करता है। यह पेज इसे चार विचारों में ध्यान से समझाता है।

## 1. Inner product ⟨φ|ψ⟩: दो states कितनी मिलती हैं

दो states |φ⟩ = [a, b] और |ψ⟩ = [c, d] के लिए:

```
⟨φ|ψ⟩ = a*·c + b*·d        (* यानी complex conjugate)
```

- ⟨φ|ψ⟩ का आकार 1: states एक जैसी हैं।
- ⟨φ|ψ⟩ = 0: states पूरी तरह अलग पहचानी जा सकती हैं (**orthogonal**), जैसे |0⟩ और |1⟩।

⟨φ| को **bra** कहते हैं; ⟨φ|ψ⟩ मिलकर **bra-ket** है।

## 2. Born rule: probability = |overlap|²

किसी **basis** {|b₀⟩, |b₁⟩} में measure करने पर नतीजा k आने की probability:

```
P(k) = |⟨b_k|ψ⟩|²
```

साधारण basis {|0⟩, |1⟩} में यही P(0) = |α|², P(1) = |β|² है।

**उदाहरण.** |ψ⟩ = √0.8|0⟩ + √0.2|1⟩ को **+/− basis** में measure करें:

```
P(+) = |⟨+|ψ⟩|² = (√0.8 + √0.2)² / 2 = 0.9
P(−) = 0.1
```

एक ही state एक basis में 80/20 और दूसरे में 90/10 देती है।

## 3. दूसरे bases में measure करना

हार्डवेयर आमतौर पर सिर्फ़ {|0⟩, |1⟩} (**Z basis**) में measure करता है। दूसरे basis के लिए **पहले घुमाएँ**:

| Measure करना है | Measure से पहले लगाएँ |
|---|---|
| Z basis {\|0⟩, \|1⟩} | कुछ नहीं |
| X basis {\|+⟩, \|−⟩} | H |
| Y basis {\|+i⟩, \|−i⟩} | S† फिर H |

```python
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler
S = StatevectorSampler()

z = QuantumCircuit(1); z.h(0); z.measure_all()            # |+⟩, Z basis में
x = QuantumCircuit(1); x.h(0); x.h(0); x.measure_all()    # |+⟩, X basis में
print(S.run([z], shots=1000).result()[0].data.meas.get_counts())
print(S.run([x], shots=1000).result()[0].data.meas.get_counts())
```

```text
{'1': 502, '0': 498}
{'0': 1000}
```

|+⟩ Z basis में पूरी तरह random दिखता है, और X basis में पूरी तरह पक्का। **Randomness इस पर निर्भर है कि आप क्या सवाल पूछते हैं।** BB84 (पाठ 41) ठीक यही इस्तेमाल करता है।

## 4. "Collapse" का मतलब

Measure करके नतीजा k मिलने के बाद qubit **|b_k⟩ ही है**। उसी basis में दोबारा measure करें: हर बार k।

- Measurement से पहले के amplitudes चले गए। α और β वापस नहीं मिलते।
- इसलिए एक measurement से state पता नहीं चलती। α और β का अनुमान लगाने के लिए **कई एक जैसी copies** चाहिए, कई bases में measure की गईं (**state tomography**)।

## No-cloning क्यों सच है

अगर अनजान state copy हो सकती, तो आप 1,000 copies बनाकर सब measure करते और एक ही original से α और β जान लेते। Quantum mechanics इसकी इजाज़त नहीं देती: copy करने वाला operation non-linear होना चाहिए, जबकि हर quantum operation linear (unitary) है। यही **no-cloning theorem** है, और इसी से QKD सुरक्षित है।

## याद रखें

| विचार | Formula |
|---|---|
| Overlap | ⟨φ\|ψ⟩ = a*c + b*d |
| Born rule | P(k) = \|⟨b_k\|ψ⟩\|² |
| X-basis measurement | H, फिर measure |
| k मिलने के बाद | state \|b_k⟩ है |
| No-cloning | अनजान state copy नहीं हो सकती |
