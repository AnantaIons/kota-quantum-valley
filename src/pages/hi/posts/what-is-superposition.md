---
layout: ../../../layouts/Post.astro
lang: hi
title: "Superposition असल में क्या है?"
description: "न 'एक साथ दोनों', न घूमता सिक्का। Superposition असल में क्या है, amplitudes क्या करते हैं, और यह क्यों मायने रखता है।"
date: 2026-11-04
category: explainer
---

अक्सर सुनते हैं कि superposition में qubit "एक साथ 0 और 1" होता है। यह वाक्य आकर्षक है, लेकिन भटकाता है। यहाँ ज़्यादा सटीक तस्वीर है।

## परिभाषा

```
|ψ⟩ = α|0⟩ + β|1⟩
```

α और β **amplitudes** हैं: positive, negative या complex नंबर, जिनके लिए |α|² + |β|² = 1।

**Superposition का मतलब बस इतना है कि α और β दोनों शून्य नहीं हैं।**

## Measure करने पर क्या दिखता है

आप α या β सीधे कभी नहीं देखते। Measurement एक 0 या 1 देता है: 0 की probability |α|², 1 की |β|²। उसके बाद qubit वही *है* जो आपने देखा।

## "घूमता सिक्का" आधा ही सही क्यों है

घूमता सिक्का randomness के लिए अच्छी तस्वीर है। लेकिन सिक्का अंदर से हमेशा head या tail होता है; बस हमें पता नहीं होता।

Qubit एक ज़रूरी तरीके से अलग है: **amplitudes cancel हो सकते हैं।**

(|0⟩ + |1⟩)/√2 और (|0⟩ − |1⟩)/√2, दोनों measure करने पर 50/50 देते हैं। लेकिन Hadamard लगाइए तो पहला हमेशा 0 देता है, दूसरा हमेशा 1। वह minus चिह्न असली जानकारी था।

Probabilities कभी negative नहीं होतीं, इसलिए cancel नहीं हो सकतीं। Amplitudes हो सकते हैं।

## यह क्यों मायने रखता है

सिर्फ़ superposition quantum computers को तेज़ नहीं बनाता। ताक़त **superposition + interference** से आती है: algorithm amplitudes को ऐसे सजाता है कि measure से *पहले* ग़लत जवाब cancel हो जाएँ और सही जवाब जुड़ जाए।

## आज़माएँ

[क्वांटम लैब](/hi/lab/) में **H** दबाएँ, फिर 1,000 बार measure करें: लगभग 50/50। Reset करें, फिर **H**, **Z**, **H**: हमेशा |1⟩।

## याद रखें

| भ्रम | बेहतर तस्वीर |
|---|---|
| "एक साथ 0 और 1" | दो non-zero amplitudes वाली state |
| "अंदर से 0 या 1 है, हमें पता नहीं" | नहीं: amplitudes के चिह्न असली हैं और cancel हो सकते हैं |
| "Superposition से कंप्यूटर तेज़" | Superposition **और interference** से |
