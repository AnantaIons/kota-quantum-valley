---
layout: ../../../layouts/Post.astro
lang: hi
title: "रोडमैप: क्वांटम कंप्यूटिंग से पहले क्या सीखें"
description: "कौन-सी मैथ्स, फ़िज़िक्स, कंप्यूटर साइंस और इलेक्ट्रॉनिक्स चाहिए, हर विषय की सबसे अच्छी किताबें, और यह 15-पाठ course कैसे बना है।"
date: 2026-10-28
category: lesson
lesson: 0
slides: roadmap
---

क्वांटम कंप्यूटिंग **चार स्तंभों** पर खड़ी है: मैथ्स, फ़िज़िक्स, कंप्यूटर साइंस और इलेक्ट्रॉनिक्स। पहले दिन से सब नहीं चाहिए, लेकिन मैथ्स सबसे पहले चाहिए, क्योंकि आगे का हर विचार उसी में लिखा है।

## यह course कैसे बना है

| हिस्सा | पाठ | आप क्या कर पाएँगे |
|---|---|---|
| **नींव** | 1–2 | Qubit को vector लिखना, gates को matrix की तरह लगाना, Bell pair बनाना |
| **Algorithms** | 3 | समझाना कि quantum algorithms क्यों काम करते हैं (interference) |
| **तकनीक** | 4–6 | Qubits कैसे बनते हैं, QKD keys कैसे बचाता है, quantum sensors कैसे काम करते हैं |
| **कोडिंग** | 7–10 | असली programs: Bell pair, teleportation, Grover, phase estimation |
| **एडवांस्ड** | 11–14 | Shor, error correction, VQE/QAOA, chemistry और ML |
| **आपका रास्ता** | 15 | असली हार्डवेयर इस्तेमाल करना और अगले साल की योजना |

**कितना समय?** हर "ख़ुद आज़माएँ" करें तो हर पाठ में 2–3 घंटे। हफ़्ते में एक पाठ से course लगभग चार महीने में पूरा।

## क्या चाहिए, और क्यों

### 1. मैथ्स (ज़रूरी, यहीं से शुरू)

| विषय | Quantum में क्यों | पहली बार कहाँ |
|---|---|---|
| Complex numbers, e^(iθ) | Amplitudes complex होते हैं; phase e^(iθ) में रहता है | पाठ 1 |
| Vectors और dot product | Qubit state *एक* vector है | पाठ 1 |
| Matrices और गुणा | हर gate एक matrix है | पाठ 2 |
| Eigenvalues और eigenvectors | Measurement के नतीजे, phase estimation | पाठ 2, 10 |
| Tensor product | कई qubits जोड़ना | पाठ 2 |
| Probability | Measurement random नतीजे देता है | पाठ 1 |
| Trigonometry | Bloch sphere पर घुमाव | पाठ 2 |

अगर आपने 12वीं की मैथ्स पढ़ी है, तो इसका लगभग आधा आप पहले से जानते हैं। बाक़ी 4–6 हफ़्ते की लगातार पढ़ाई है।

### 2. फ़िज़िक्स (मददगार, धीरे-धीरे बढ़ती है)

- **Double-slit प्रयोग:** interference की सबसे साफ़ तस्वीर।
- **Modern physics:** photons, matter waves, atoms के energy levels।
- **Quantum mechanics की बुनियाद:** states, measurement, spin।

### 3. कंप्यूटर साइंस और Python

- Logic gates और binary (quantum gates से तुलना के लिए)।
- Loops और functions लिखने लायक Python। कोडिंग पाठ 7 से शुरू होती है।

### 4. इलेक्ट्रॉनिक्स (हार्डवेयर के रास्ते के लिए)

Circuits, signals, noise और measurement। Quantum computers सटीक microwave pulses और तेज़ इलेक्ट्रॉनिक्स से चलते हैं, इसलिए quantum हार्डवेयर नौकरियों का दरवाज़ा यहीं से खुलता है।

## किताबों की सूची

| किताब | लेखक | पढ़ें |
|---|---|---|
| Introduction to Linear Algebra | Gilbert Strang | Ch 1, 2, 4, 6 |
| Visual Complex Analysis | Tristan Needham | Ch 1 |
| Probability Theory, Vol. 1 | William Feller | Ch I, V, VI |
| The Feynman Lectures, Vol. III | Richard Feynman | Ch 1–3, 6, 19 |
| Concepts of Modern Physics | Arthur Beiser | Ch 2–5 |
| Introduction to Quantum Mechanics | David J. Griffiths | Ch 1–3 |
| The Principles of Quantum Mechanics | P.A.M. Dirac | Ch 1 |
| The Art of Electronics | Horowitz & Hill | Ch 1 |
| Quantum Computation and Quantum Information | Nielsen & Chuang | Ch 1, 2, 4 (अंतिम लक्ष्य) |

**मुफ़्त वीडियो:** 3Blue1Brown की *Essence of Linear Algebra* (पहले चार अध्याय पाठ 1–2 के लिए काफ़ी) और NPTEL के IIT courses।

## पाठ 1 से पहले ख़ुद को जाँचें

ये हाथ से कर पाएँ तो आप तैयार हैं:

1. (2 + 3i)(1 − i) का गुणा करें।
2. |3 + 4i| निकालें।
3. Matrix [[0, 1], [1, 0]] को vector [1, 0] से गुणा करें।
4. सिक्के पर head की probability 0.3 है, तो tail की?

जवाब: 5 + i; 5; [0, 1]; 0.7। कोई भी कमज़ोर लगे तो पहले एक हफ़्ता Strang Ch 1 और Needham Ch 1 पर लगाएँ।

## आज कहाँ से शुरू करें

3Blue1Brown के पहले चार linear-algebra वीडियो देखें, फिर **पाठ 1** खोलें।
