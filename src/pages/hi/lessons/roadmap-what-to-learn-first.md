---
layout: ../../../layouts/Post.astro
lang: hi
title: "रोडमैप: पहले क्या सीखें, और यह course कैसे चलता है"
description: "क्वांटम कंप्यूटिंग के पीछे की मैथ्स, फ़िज़िक्स, कंप्यूटर साइंस और इलेक्ट्रॉनिक्स, हर एक क्यों ज़रूरी है, कौन-सी किताबें पढ़ें, और कोर्स 1 के 50 पाठ आपस में कैसे जुड़ते हैं।"
date: 2026-10-28
category: lesson
lesson: 0

---

बाहर से क्वांटम कंप्यूटिंग डरावनी लगती है, क्योंकि इसमें चार विषय मिलते हैं जो आमतौर पर अलग-अलग पढ़ाए जाते हैं: **मैथ्स, फ़िज़िक्स, कंप्यूटर साइंस और इलेक्ट्रॉनिक्स।** अच्छी ख़बर यह है कि पहले दिन चारों नहीं चाहिए, और फ़िज़िक्स की डिग्री भी नहीं चाहिए। सही चीज़ें, सही क्रम में चाहिए। यह पेज वही क्रम है।

इस रोडमैप से अगर एक वाक्य याद रखें, तो यह रखें: **मैथ्स सबसे पहले सीखें, क्योंकि आगे का हर विचार उसी भाषा में लिखा है।** Qubit एक vector है। Gate एक matrix है। Measurement एक probability है। जब ये तीन वाक्य सहज लगने लगें, तो बाक़ी क्वांटम कंप्यूटिंग इन्हीं पर बने चतुर विचारों का सेट बन जाती है, और चतुर विचार किसी नई भाषा से कहीं आसान होते हैं।

## कोर्स 1 कैसे बना है

कोर्स 1 में एक रोडमैप (यह पेज) और 49 पाठ हैं, नौ भागों में। हर भाग पिछले पर बनता है, इसलिए पहली बार क्रम से ही पढ़ें।

| भाग | पाठ | अंत में आप क्या कर पाएँगे |
|---|---|---|
| **A. तैयारी** | 0–5 | Bits, complex numbers, vectors, matrices और probability पर आराम से काम |
| **B. एक qubit** | 6–11 | कोई भी single-qubit state लिखना, कोई भी gate लगाना, measurement का अनुमान |
| **C. कई qubits** | 12–17 | Qubits जोड़ना, entanglement बनाना और परखना, quantum information की copy क्यों नहीं बनती |
| **D. Qiskit के साथ कोडिंग** | 18–21 | असली quantum programs लिखना, simulate करना, पढ़ना, teleportation सहित |
| **E. Quantum algorithms** | 22–31 | Deutsch–Jozsa, Simon, Grover, QFT, phase estimation, Shor और VQE समझना और कोड करना, और ईमानदारी से बताना कि quantum कहाँ मदद करता है |
| **F. Errors और correction** | 32–36 | Noise समझना, error-correcting codes बनाना, surface code और error mitigation |
| **G. हार्डवेयर** | 37–40 | Qubits कैसे बनते और नियंत्रित होते हैं, और असली chips पर circuits चलाना |
| **H. Communication और sensing** | 41–44 | QKD, quantum internet, post-quantum cryptography और quantum sensors |
| **I. Applications और आपका रास्ता** | 45–49 | असली applications परखना, research papers पढ़ना, और अगले साल की योजना |

**कितना समय?** अगर आप pen लेकर examples हल करें और कोड चलाएँ, तो हर पाठ में 1.5 से 3 घंटे। हर दो-तीन दिन में एक पाठ करें तो course लगभग चार महीने में पूरा होता है। हफ़्ते में एक पाठ करें तो लगभग एक साल, जो भी पूरी तरह ठीक रफ़्तार है।

### हर पाठ में क्या होता है

हर पाठ एक ही क्रम में चलता है, ताकि आपको हमेशा पता रहे कि आप कहाँ हैं:

1. **आसान भाषा में विचार,** उस चीज़ से शुरू करके जो आप पहले से जानते हैं।
2. **मैथ्स, धीरे-धीरे।** हर क़दम लिखा हुआ। मुख्य पाठ में कुछ भी "अभ्यास के लिए छोड़ा" नहीं जाता।
3. **चलने वाला कोड,** Python और Qiskit में टेस्ट किया हुआ, साथ में वह output जो आपको दिखना चाहिए।
4. **ख़ुद करके देखें:** छोटे अभ्यास, जवाबों के साथ।
5. **सार:** पूरा पाठ एक स्क्रीन पर, दोहराने के लिए।
6. **Quiz:** चार सवाल, हर जवाब का कारण।

## चार स्तंभ, और हर एक क्यों ज़रूरी है

### 1. मैथ्स: सबसे ज़रूरी, यहीं से शुरू करें

मैथ्स पूरे क्षेत्र की भाषा है। ठीक-ठीक क्या चाहिए, और course में हर विषय पहली बार कहाँ आता है:

| विषय | क्वांटम कंप्यूटिंग को क्यों चाहिए | पहली बार |
|---|---|---|
| Complex numbers और e^(iθ) | Qubit के अंदर के नंबर (amplitudes) complex होते हैं। उनका कोण, यानी phase, ही interference संभव बनाता है। | पाठ 2 |
| Vectors और dot product | Qubit की state **एक vector है।** Dot product (inner product) बताता है कि दो states कितनी मिलती हैं, और उसी से measurement की probability निकलती है। | पाठ 3 |
| Matrices और matrix गुणा | हर quantum gate एक matrix है। Circuit चलाना यानी matrices गुणा करना। | पाठ 4 |
| Eigenvalues और eigenvectors | Measurement के संभव नतीजे eigenvalues होते हैं। Phase estimation, सबसे ज़रूरी algorithms में से एक, एक eigenvalue ढूँढता है। | पाठ 4 |
| Probability | Measurement random नतीजे देता है। औसत, फैलाव, और कितनी बार दोहराना (shots) है, यह सोचना पड़ता है। | पाठ 5 |
| Trigonometry | Single-qubit gates एक गोले के rotations हैं। sin, cos और आधे कोण हर जगह आते हैं। | पाठ 7 |
| Tensor product | कई qubits मिलकर एक बड़ी state कैसे बनाते हैं। Quantum computers की "2ⁿ" बढ़त यहीं से आती है। | पाठ 12 |

**इसमें से आप कितना पहले से जानते हैं?** अगर आपने 12वीं की मैथ्स पढ़ी है (जैसे JEE के लिए), तो complex numbers, matrices, probability और trigonometry आप जानते हैं। आमतौर पर नया होता है: complex vectors, complex numbers के साथ inner product, eigenvalues और tensor product। पाठ 2 से 5 ठीक यही कमियाँ भरते हैं, और 10वीं के आगे कुछ भी मानकर नहीं चलते।

एक छोटा नमूना, ताकि table सिर्फ़ शब्द न लगे। सबसे ज़्यादा इस्तेमाल होने वाला gate, Hadamard gate H, यह matrix है:

```text
H = 1/√2 × [ 1   1 ]
           [ 1  −1 ]
```

इसे state |0⟩ = [1, 0] पर लगाएँ तो मिलता है [1/√2, 1/√2]: 50/50 superposition। यह एक matrix गुणा एक vector है। पाठ 4 तक आप यह मन में कर लेंगे।

### 2. फ़िज़िक्स: मददगार, और आपके साथ बढ़ती है

बहुत कम फ़िज़िक्स के साथ भी quantum *computing* सीखी जा सकती है, क्योंकि quantum computer को program करने के लिए जो चाहिए वह सब मैथ्स में आ जाता है। फ़िज़िक्स तब ज़रूरी होती है जब आप समझना चाहें कि यह **क्यों** काम करता है और हार्डवेयर **कैसे** बनता है। सबसे काम की फ़िज़िक्स:

- **Double-slit प्रयोग।** Interference की सबसे साफ़ तस्वीर: एक-एक करके भेजे गए कण भी धारियों वाला pattern बनाते हैं। पाठ 5 इसे नंबरों के साथ हल करता है।
- **Stern–Gerlach प्रयोग।** Silver atoms ठीक दो धाराओं में बँट जाते हैं। दो नतीजों वाला यह system एक qubit है, जो 1922 में प्रकृति में मिला। यह भी पाठ 5 में।
- **Modern physics के अध्याय (12वीं और कॉलेज का पहला साल):** photons और photoelectric effect, matter waves, atoms के energy levels। इन्हीं से समझ आता है कि असली qubits atoms, ions और circuits से कैसे बनते हैं (भाग G)।
- **Quantum mechanics की बुनियाद:** states, measurement और spin। कोर्स 1 इन्हें साथ-साथ सिखाता है।
- **थोड़ी physical chemistry:** orbitals और molecules की energy। Quantum chemistry simulations (पाठ 45) यही निकालते हैं।

### 3. कंप्यूटर साइंस और Python

- **Binary, logic gates और circuits।** Quantum circuits, classical circuits का बड़ा रूप हैं, और दोनों की तुलना करना यह देखने का सबसे अच्छा तरीका है कि सच में नया क्या है। पाठ 1 यही सिखाता है।
- **Python।** Loops, functions और किसी library का इस्तेमाल, बस इतना। इस course का सारा कोड NumPy और Qiskit के साथ Python में है। पाठ 18 Qiskit शुरू से set up करता है; पाठ 1 से 5 में सिर्फ़ Python और NumPy चाहिए।
- **Algorithms और complexity (बाद में)।** Big-O notation, और यह विचार कि कुछ समस्याएँ बढ़ने के साथ बहुत कठिन होती जाती हैं। पाठ 31 इसी से ईमानदारी से बताता है कि quantum computers किन समस्याओं को तेज़ करते हैं।

### 4. इलेक्ट्रॉनिक्स: हार्डवेयर नौकरियों का दरवाज़ा

Quantum computers को सटीक microwave pulses, तेज़ digital electronics, FPGAs, cryogenic wiring और low-noise amplifiers नियंत्रित करते हैं। अगर आप circuits, signals, noise और measurement जानते हैं, तो आप quantum हार्डवेयर पर काम कर सकते हैं, भले कभी theorist न बनें। पाठ 37 से 40 दिखाते हैं कि ये skills ठीक कहाँ लगती हैं।

### आपके लिए कौन-से स्तंभ सबसे ज़रूरी?

| अगर आप चाहते हैं... | ध्यान दें | कम ज़रूरी |
|---|---|---|
| Quantum algorithms और software लिखना | मैथ्स, CS, Python | इलेक्ट्रॉनिक्स |
| Quantum हार्डवेयर और control systems बनाना | इलेक्ट्रॉनिक्स, फ़िज़िक्स, मैथ्स | एडवांस्ड algorithms |
| Quantum chemistry या materials पर काम | फ़िज़िक्स, केमिस्ट्री, मैथ्स | इलेक्ट्रॉनिक्स |
| Quantum communication या security पर काम | मैथ्स, CS (cryptography), optics | केमिस्ट्री |
| क्वांटम पढ़ाना या समझाना (इस पेज की तरह) | चारों, बुनियादी स्तर पर | कुछ नहीं; चौड़ाई ही skill है |

अभी चुनना ज़रूरी नहीं। कोर्स 1 सबको एक ही नींव देता है। भाग E ख़त्म होते-होते आपको पता चल जाएगा कि आपका मन किस तरफ़ खिंचता है।

## किताबों की सूची

कोर्स 1 पूरा करने के लिए इनमें से कोई भी किताब ख़रीदनी ज़रूरी नहीं। ये वे किताबें हैं जिनमें आप आगे बढ़ेंगे, मोटे तौर पर आसान से कठिन, सबसे काम के अध्यायों के साथ।

| किताब | लेखक | पढ़ें | क्यों |
|---|---|---|---|
| Introduction to Linear Algebra | Gilbert Strang | Ch 1, 2, 4, 6 | Vectors, matrices और eigenvalues का सबसे साफ़ रास्ता |
| Visual Complex Analysis | Tristan Needham | Ch 1 | Complex numbers को rotations की तरह, चित्रों के साथ |
| An Introduction to Probability Theory, Vol. 1 | William Feller | Ch I, V, VI | Probability ठीक से |
| The Feynman Lectures on Physics, Vol. III | Richard Feynman | Ch 1–3, 6, 19 | Quantum व्यवहार की अब तक की सबसे अच्छी व्याख्या; online मुफ़्त |
| Concepts of Modern Physics | Arthur Beiser | Ch 2–5 | Photons, matter waves, atoms |
| Introduction to Quantum Mechanics | David J. Griffiths | Ch 1–3 | Quantum mechanics का मानक पहला course |
| The Art of Electronics | Horowitz & Hill | Ch 1 | व्यावहारिक electronics, हार्डवेयर रास्ते के लिए |
| Quantum Computation and Quantum Information | Nielsen & Chuang | Ch 1, 2, 4 | इस क्षेत्र की मानक किताब; आपका अंतिम लक्ष्य |

**मुफ़्त साथी:** 3Blue1Brown की *Essence of Linear Algebra* video series (अध्याय 1 से 4 में पाठ 3 और 4 का ज़्यादातर हिस्सा, सुंदर animations के साथ), NPTEL के IIT courses (linear algebra और quantum mechanics), और IBM का मुफ़्त Quantum Learning platform।

## ख़ुद को जाँचें

पाठ 1 के लिए आप अभी तैयार हैं; वह कुछ भी मानकर नहीं चलता। फिर भी ये चार सवाल करके देखें कि भाग A का कितना हिस्सा आपके लिए दोहराना होगा:

1. (2 + 3i)(1 − i) गुणा करें।
2. |3 + 4i| निकालें।
3. Matrix [[0, 1], [1, 0]] को vector [1, 0] से गुणा करें।
4. एक सिक्का 0.3 probability से heads देता है। Tails की probability? 100 बार उछालें तो लगभग कितने heads?

**जवाब:**

1. (2 + 3i)(1 − i) = 2 − 2i + 3i − 3i² = 2 + i + 3 = **5 + i** (क्योंकि i² = −1)।
2. |3 + 4i| = √(3² + 4²) = √25 = **5**।
3. पहली row · vector = 0×1 + 1×0 = 0। दूसरी row · vector = 1×1 + 0×0 = 1। नतीजा: **[0, 1]**। (आपने अभी एक quantum NOT gate लगाया।)
4. **0.7**, और लगभग **30 heads**।

चारों आसान लगे? भाग A आप जल्दी पार कर लेंगे। कोई कमज़ोर लगा? बढ़िया, पाठ 2 से 5 इसी के लिए हैं। उन्हें आराम से पढ़ें।

## आज कहाँ से शुरू करें

1. **पाठ 1** खोलें और साथ में एक notebook रखकर पढ़ें।
2. Python नहीं है तो install करें (python.org, या Google Colab जैसी मुफ़्त online notebook)। पाठ 18 तक सिर्फ़ NumPy चाहिए।
3. [शब्दकोश](/hi/glossary/) और [क्वांटम लैब](/hi/lab/) bookmark करें। दोनों पूरे course में काम आएँगे।

## सार

| सवाल | जवाब |
|---|---|
| पहले क्या सीखें? | मैथ्स: complex numbers, vectors, matrices, probability |
| Qubit एक लाइन में? | दो complex नंबरों का एक vector |
| Gate क्या है? | एक matrix जो उस vector को बदलता है |
| Measurement क्या है? | एक random नतीजा, जिसकी probabilities vector तय करता है |
| Course कैसे बना है? | 9 भाग, 49 पाठ, हर एक पिछले पर बना |
| कितना समय? | हफ़्ते में 2–3 पाठ करें तो लगभग 4 महीने |
| क्या install करना है? | अभी Python और NumPy; पाठ 18 से Qiskit |
| अंतिम लक्ष्य की किताब? | Nielsen & Chuang, *Quantum Computation and Quantum Information* |
