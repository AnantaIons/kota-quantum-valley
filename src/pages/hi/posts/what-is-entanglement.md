---
layout: ../../../layouts/Post.astro
lang: hi
title: "Entanglement क्या है?"
description: "दो qubits की एक साझा state: पूरा correlation, रोशनी से तेज़ संदेश नहीं, और यह quantum computing और QKD को कैसे ताक़त देता है।"
date: 2026-11-04
category: explainer
---

Einstein ने इसे "spooky action at a distance" कहा था। यह कम डरावना लगता है जब आप देखते हैं कि यह क्या है, और क्या नहीं।

## दो qubits, एक state

**Entangled** state वह है जिसे दो अलग-अलग विवरणों में *नहीं* तोड़ा जा सकता। क्लासिक उदाहरण Bell state है:

```
|Φ⁺⟩ = (|00⟩ + |11⟩) / √2
```

यहाँ "qubit A की state" और "qubit B की state" अलग-अलग नहीं हैं, सिर्फ़ जोड़े की state है।

## क्या दिखता है

कई बार measure करें: आधी बार **00**, आधी बार **11**, और **कभी** 01 या 10 नहीं। हर qubit अकेले सिक्का लगता है, लेकिन दोनों सिक्के हमेशा मेल खाते हैं, चाहे qubits दूर हों।

## कैसे बनाएँ

1. Qubit A पर **H**: वह (|0⟩ + |1⟩)/√2 बनता है।
2. A control, B target वाला **CNOT**।

नतीजा: (|00⟩ + |11⟩)/√2।

## सबसे बड़ी ग़लतफ़हमी: रोशनी से तेज़ संदेश नहीं

A के पास वाला random 0 या 1 देखता है; वह चुन नहीं सकता। B के पास वाला भी random नतीजा देखता है। जब दोनों साधारण फ़ोन या इंटरनेट से नतीजे मिलाते हैं, तभी पता चलता है कि वे मेल खाए। कोई उपयोगी जानकारी रोशनी से तेज़ नहीं जाती।

## यह क्यों मायने रखता है

- **Quantum computing:** entanglement से कई qubits 2ⁿ amplitudes की एक state साझा करते हैं।
- **Quantum communication:** E91 protocol entangled photons से key बाँटता है (पाठ 41)।
- **Teleportation:** entangled pair और दो classical bits से qubit की state दूसरी जगह पहुँचती है (पाठ 21)।
- **Sensing:** entangled atoms precision की standard सीमा तोड़ सकते हैं (पाठ 44)।

## आज़माएँ

[क्वांटम लैब](/hi/lab/) में **प्रयोग 3** खोलें, **Bell state बनाएँ** दबाएँ और 100 बार measure करें। फिर **H q1** जोड़कर दोबारा measure करें: पूरा correlation टूट जाता है।
