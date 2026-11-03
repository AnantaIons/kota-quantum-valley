---
layout: ../../../layouts/Post.astro
lang: hi
title: "क्वांटम कम्युनिकेशन और QKD"
description: "One-time pad, BB84 कदम-दर-कदम, जासूस को पकड़ना, E91, satellites, teleportation, और QKD बनाम post-quantum cryptography।"
date: 2026-10-30
category: lesson
lesson: 5
slides: lesson-5
---

## समस्या

**One-time pad** अटूट है अगर key सच में random हो, message जितनी लंबी हो, और सिर्फ़ एक बार इस्तेमाल हो। मुश्किल है key को साझा करना। **Quantum key distribution (QKD)** इसका हल है: physics गारंटी देती है कि जो भी जासूसी करेगा, उसके निशान छूटेंगे।

तीन quantum नियम इसे संभव बनाते हैं: measure करने से state बदलती है, अनजान states की copy नहीं बनती (no-cloning), और ग़लत basis में measure करने पर random जवाब मिलता है।

## BB84, कदम-दर-कदम

1. **Alice भेजती है।** हर photon के लिए वह एक random bit और एक random basis चुनती है: + (horizontal/vertical) या × (diagonal)।
2. **Bob measure करता है।** वह हर photon के लिए basis का अंदाज़ा लगाता है। आधी बार अंदाज़ा सही होता है और उसे Alice का bit मिलता है; बाक़ी बार नतीजा random होता है।
3. **वे basis मिलाते हैं** (bits नहीं) एक सामान्य public channel पर, और सिर्फ़ मेल खाने वाले रखते हैं। यह है *sifted key*।
4. **Error जाँच.** वे कुछ bits खोलकर मिलाते हैं। अगर Eve ने हर photon measure किया हो, तो sifted bits में लगभग **25%** नहीं मिलते। लगभग 11% से ज़्यादा errors पर BB84 रुक जाता है।
5. **Key साफ़ करें.** Error correction और privacy amplification से एक छोटी, पूरी तरह गुप्त key बचती है।

**E91** यही काम entangled pairs से करता है और Bell test से साबित करता है कि किसी ने छेड़छाड़ नहीं की।

## असली दुनिया

Fibre में लगभग 0.2 dB प्रति km नुकसान होता है और photons को amplify नहीं किया जा सकता, इसलिए trusted relay nodes के बिना fibre QKD कुछ सौ km तक सीमित है। **Satellites** इससे आगे जाते हैं: चीन के Micius ने 2017 में 7,600 km की intercontinental call सुरक्षित की। भारत में DRDO और IIT दिल्ली ने fibre और free space पर QKD दिखाया है।

## QKD बनाम PQC

**Post-quantum cryptography (PQC)** नई गणितीय समस्याओं पर टिकी है जिन्हें quantum computer आसानी से हल नहीं कर सकते। NIST ने 2024 में पहले standards जारी किए। यह आज के हार्डवेयर पर चलती है। QKD को ख़ास हार्डवेयर चाहिए, लेकिन उसकी सुरक्षा physics पर टिकी है। दोनों साथ-साथ चलेंगे।
