---
layout: ../../../layouts/Post.astro
lang: hi
title: "शून्य से क्वांटम: qubit, |0⟩ और |1⟩"
description: "Bit बनाम qubit, quantum state क्या है, superposition, i की ज़रूरत क्यों, vectors और matrices, entanglement और interference।"
date: 2026-10-28
category: lesson
lesson: 1
slides: lesson-1
---

## मुख्य बातें

**Bit या तो 0 होता है या 1। Qubit की एक state होती है।** दो बुनियादी states को हम `|0⟩` और `|1⟩` लिखते हैं ("ket zero" और "ket one")। कोई भी qubit state इन दोनों का मिश्रण है:

```
|ψ⟩ = α|0⟩ + β|1⟩      जहाँ  |α|² + |β|² = 1
```

**Superposition.** α और β को *amplitudes* कहते हैं। Measure करने पर 0 मिलने की probability |α|² है और 1 मिलने की |β|²। Measure करने के बाद qubit उसी state में रह जाता है जो आपने देखी।

**Complex numbers क्यों?** Amplitudes negative या complex हो सकते हैं। इसलिए वे एक-दूसरे को काट (cancel) सकते हैं, और क्वांटम कंप्यूटिंग की ताक़त यहीं से आती है। Probabilities कभी cancel नहीं होतीं; amplitudes होते हैं।

**Qubit एक vector है।** `|0⟩ = [1, 0]` और `|1⟩ = [0, 1]`। Gate एक matrix है जो इस vector से गुणा होता है। X gate दोनों को आपस में बदल देता है, बिल्कुल NOT gate की तरह।

**पैमाना.** n qubits को लिखने के लिए 2ⁿ amplitudes चाहिए। 300 qubits के लिए इतनी संख्याएँ चाहिए जितने पूरे दिखने वाले ब्रह्मांड में atoms भी नहीं हैं।

## चार बड़े विचार

- **Superposition:** |0⟩ और |1⟩ का मिश्रण।
- **Measurement:** एक ही जवाब देता है, जिसकी probability |amplitude|² होती है।
- **Entanglement:** दो qubits की एक साझा state, जैसे (|00⟩ + |11⟩)/√2। एक को measure करें, दूसरे का जवाब तुरंत पता चल जाता है।
- **Interference:** amplitudes जुड़ते या कटते हैं। Algorithms ऐसे बनाए जाते हैं कि ग़लत जवाब कट जाएँ और सही जवाब मज़बूत हो।

## आपका पहला circuit

|0⟩ पर **Hadamard (H)** gate लगाइए, बराबर का मिश्रण मिलेगा: (|0⟩ + |1⟩)/√2। इसे 1,000 बार measure करें तो लगभग 500 बार 0 और 500 बार 1 आएगा। IBM Quantum पर इसे मुफ़्त में आज़माइए।
