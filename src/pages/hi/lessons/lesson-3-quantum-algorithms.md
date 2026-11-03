---
layout: ../../../layouts/Post.astro
lang: hi
title: "क्वांटम algorithms: Deutsch–Jozsa से Shor तक"
description: "Oracles, phase kickback, Deutsch–Jozsa, Bernstein–Vazirani, Grover search, quantum Fourier transform और Shor का algorithm।"
date: 2026-10-29
category: lesson
lesson: 3
slides: lesson-3
---

## नुस्खा

लगभग हर quantum algorithm एक ही ढाँचे पर चलता है: **superpose → oracle लगाओ → interfere → measure।** Oracle सही जवाब पर एक phase का निशान लगाता है। Interference उस phase को सही जवाब मिलने की ऊँची probability में बदल देता है।

**Phase kickback** इसके पीछे की तरकीब है: जब कोई controlled gate |−⟩ state वाले target पर लगता है, तो phase *control* qubit पर आ जाता है।

## Algorithms

- **Deutsch–Jozsa:** कोई function constant है या balanced? Classically आधे से ज़्यादा inputs जाँचने पड़ सकते हैं। Quantum में सिर्फ़ एक query।
- **Bernstein–Vazirani:** छिपी हुई n-bit string ढूँढना। Classically n queries, quantum में एक।
- **Grover search:** N चीज़ों में से एक निशान लगी चीज़ लगभग √N कदमों में ढूँढना, N नहीं। हर round के दो हिस्से: oracle जवाब का चिह्न पलटता है, फिर *diffusion* सबको औसत के चारों ओर पलटकर जवाब को बड़ा कर देता है। Quadratic speed-up।
- **Quantum Fourier transform (QFT):** किसी sequence में छिपा period ढूँढता है। यही Shor का इंजन है।
- **Shor का algorithm:** factoring को period ढूँढने में बदल देता है। QFT की मदद से quantum computer इसे exponentially तेज़ ढूँढ सकता है। उदाहरण: 15 का factor 3 × 5।

## Shor क्यों मायने रखता है

RSA encryption सिर्फ़ इसलिए सुरक्षित है क्योंकि बड़ी संख्याओं के factors निकालना कठिन है। Shor चलाने वाला बड़ा, error-corrected quantum computer इसे तोड़ देगा। इसीलिए दुनिया post-quantum cryptography की ओर बढ़ रही है (पाठ 5 देखें)।

**ईमानदार बात:** quantum हर चीज़ तेज़ नहीं करता। बड़े फ़ायदे ख़ास समस्याओं में हैं: factoring, molecules और materials का simulation, और कुछ search और optimisation।
