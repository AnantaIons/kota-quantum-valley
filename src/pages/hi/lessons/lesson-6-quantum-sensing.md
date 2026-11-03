---
layout: ../../../layouts/Post.astro
lang: hi
title: "क्वांटम सेंसिंग"
description: "Ramsey interferometry, precision की सीमाएँ, atomic clocks, SQUIDs, diamond के NV centres, atom gravimeters और LIGO की squeezed light।"
date: 2026-10-30
category: lesson
lesson: 6
slides: lesson-6
---

## Qubit की कमज़ोरी, sensor की ताक़त

Environment छूते ही qubits अपनी state खो देते हैं। Computing के लिए यह बुरा है, लेकिन मापने के लिए बिल्कुल सही। Magnetic field, electric field या gravity qubit की energy बदल देते हैं। Superposition में यह बदलाव धीरे-धीरे एक **phase** बनकर जमा होता है, और interference उस phase को गिनने लायक चीज़ में बदल देता है।

## मूल तरकीब: Ramsey interferometry

H, t समय रुको, H, measure।

```
पहले H के बाद:    (|0⟩ + |1⟩)/√2
रुकने के बाद:     (|0⟩ + e^{iφ}|1⟩)/√2      φ = Δω · t
दूसरे H के बाद:   P(0) = cos²(φ/2)
```

P(0) measure करो, तो φ पता चलता है। φ पता हो, तो field पता चल जाती है।

**Precision की सीमाएँ.** N स्वतंत्र atoms या repeats के साथ error 1/√N की तरह घटता है (*standard quantum limit*)। Atoms को GHZ state में entangle करें तो यह 1/N तक जा सकता है (*Heisenberg limit*), लेकिन GHZ states बहुत नाज़ुक होती हैं।

## Sensors

- **Atomic clocks:** एक second = caesium-133 के 9,192,631,770 cycles। Clock एक oscillator है जो atom से lock है, जैसे PLL जिसका reference ख़ुद प्रकृति है। GPS, NavIC, मोबाइल नेटवर्क और बिजली ग्रिड इन पर निर्भर हैं।
- **SQUIDs:** superconducting loops जो femtotesla fields भी पकड़ लेते हैं, दिमाग़ के scans (MEG) के लिए काफ़ी। इन्हें लगभग 4 K चाहिए।
- **Diamond में NV centres:** कमरे के तापमान पर spin qubits, जिन्हें हरे laser और लाल चमक से पढ़ते हैं और 2.87 GHz से कंट्रोल करते हैं। Magnetic field resonance को दो में बाँट देती है: Δf = 2γB, जहाँ γ ≈ 28 GHz/T।
- **Optically pumped magnetometers:** rubidium vapour cells, इतने छोटे कि brain scan के लिए पहने जा सकें।
- **Atom interferometers:** atoms को waves की तरह इस्तेमाल करके gravity को लगभग एक अरबवें हिस्से तक मापना। ज़मीन के नीचे की mapping और GPS के बिना navigation में काम आते हैं।
- **LIGO:** squeezed light photon के shot noise को हराती है। LIGO-India महाराष्ट्र के हिंगोली में बन रहा है।

**इंजीनियरों के लिए:** अगर आप PLL, ADC और noise समझते हैं, तो quantum sensing का आधा हिस्सा आप पहले से जानते हैं।
