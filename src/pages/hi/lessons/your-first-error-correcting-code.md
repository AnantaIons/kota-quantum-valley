---
layout: ../../../layouts/Post.astro
lang: hi
title: "Noise और आपका पहला error-correcting code"
description: "Qubits ग़लतियाँ क्यों करते हैं, data देखे बिना error कैसे पकड़ें, और Qiskit में 3-qubit bit-flip code।"
date: 2026-11-04
category: lesson
lesson: 33
---

असली qubits में noise होता है (पाठ 32)। आज का अच्छा superconducting qubit लगभग हर कुछ सौ से कुछ हज़ार operations में एक ग़लती करता है। उपयोगी algorithms को अरबों operations चाहिए। Error correction यही पुल है।

## तीन तरह की ग़लतियाँ

| Error | क्या होता है | वही असर देने वाला gate |
|---|---|---|
| Bit flip | \|0⟩ ↔ \|1⟩ | X |
| Phase flip | \|1⟩ → −\|1⟩ | Z |
| दोनों | flip + phase flip | Y |

कोई भी छोटी, उलझी ग़लती इन्हीं का मिश्रण लिखी जा सकती है, इसलिए जो code X और Z ठीक करे, वह सब ठीक करता है।

## समस्या: copy करके जाँच नहीं सकते

Classically आप एक bit 3 बार रखते (000 या 111) और बहुमत देखते। Qubits के लिए:

- **No-cloning:** अनजान qubit copy नहीं हो सकता।
- **Measure करने से superposition टूटता है:** data को देखकर जाँच नहीं सकते।

## तरकीब: फैलाओ, फिर *अंतर* जाँचो

1. **Encode:** α|0⟩ + β|1⟩ → α|000⟩ + β|111⟩। (CNOT से; यह entanglement है, copy नहीं।)
2. **Parity जाँचें**, values नहीं: "qubit 0 और 1 बराबर हैं?" और "qubit 1 और 2 बराबर हैं?" अतिरिक्त **ancilla** qubits यह measure करते हैं।
3. दोनों जवाब, यानी **syndrome**, टूटे qubit की ओर इशारा करते हैं, α या β बताए बिना।
4. उस qubit पर X लगाकर **ठीक करें**।

| Syndrome (q0≠q1, q1≠q2) | Error कहाँ |
|---|---|
| नहीं, नहीं | कहीं नहीं |
| हाँ, नहीं | qubit 0 |
| हाँ, हाँ | qubit 1 |
| नहीं, हाँ | qubit 2 |

## Qiskit में bit-flip code

```python
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler

bf = QuantumCircuit(5, 2)       # q0-q2 data, q3-q4 ancillas
bf.x(0)                         # logical |1⟩
bf.cx(0, 1); bf.cx(0, 2)        # encode: |1⟩ → |111⟩

bf.x(1)                         # qubit 1 पर error

bf.cx(0, 3); bf.cx(1, 3)        # ancilla 3 = q0, q1 की parity
bf.cx(1, 4); bf.cx(2, 4)        # ancilla 4 = q1, q2 की parity
bf.measure([3, 4], [0, 1])

print(StatevectorSampler().run([bf], shots=100).result()[0].data.c.get_counts())
```

```text
{'11': 100}
```

दोनों जाँचें fire हुईं, तो error **qubit 1** पर है। और syndrome वही रहता है चाहे data |0⟩, |1⟩ या कोई superposition हो: जाँच ने जानकारी को छुआ ही नहीं।

## खिलौने से असली मशीनों तक

- Bit-flip code सिर्फ़ X errors ठीक करता है। **Shor का 9-qubit code** (1995) X और Z दोनों ठीक करता है।
- असली मशीनें **surface code** इस्तेमाल करती हैं: grid पर qubits, पड़ोसियों के बीच parity checks।
- मुख्य संख्या **threshold** है: अगर physical errors उससे कम हों, तो ज़्यादा qubits जोड़ने से logical qubit *बेहतर* होता है। 2024 में Google की Willow chip ने दिखाया कि code बड़ा करने पर logical errors घटते हैं।
- लागत: एक भरोसेमंद logical qubit के लिए सैकड़ों से हज़ारों physical qubits।

## ख़ुद आज़माएँ

1. Error को `bf.x(0)` और फिर `bf.x(2)` पर ले जाएँ। क्या syndromes table से मेल खाते हैं? (Qiskit दूसरा ancilla पहले छापता है।)
2. Error पूरी तरह हटा दें। Syndrome क्या आता है?
3. **दो** qubits पर error डालें। Code अब ग़लत qubit क्यों "ठीक" करता है?
