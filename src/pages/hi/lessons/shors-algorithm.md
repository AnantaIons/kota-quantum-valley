---
layout: ../../../layouts/Post.astro
lang: hi
title: "Shor algorithm, कदम-दर-कदम"
description: "Factoring कैसे period ढूँढने में बदलती है, N = 15 के लिए पूरा हल, और RSA असल में कब ख़तरे में है इसकी ईमानदार तस्वीर।"
date: 2026-11-04
category: lesson
lesson: 28
---

1994 में Peter Shor ने दिखाया कि पर्याप्त बड़ा quantum computer बड़ी संख्याओं के factors किसी भी ज्ञात classical तरीके से exponentially तेज़ निकाल सकता है। इससे RSA ख़तरे में है, जो इंटरनेट के बड़े हिस्से का encryption है।

## Factoring क्यों मायने रखती है

RSA इसलिए सुरक्षित है क्योंकि दो बड़े primes का गुणा आसान है, लेकिन गुणनफल को वापस तोड़ना बेहद कठिन। 2048-bit RSA संख्या में classical कंप्यूटरों को ब्रह्मांड की उम्र से भी ज़्यादा समय लगेगा।

## मुख्य विचार: factoring = period ढूँढना

कोई संख्या a चुनें जिसका N से कोई साझा factor न हो। यह sequence देखें:

```
f(x) = aˣ mod N
```

यह हमेशा **दोहराता** है। अगर period r सम (even) हो, तो

```
gcd(a^(r/2) − 1, N)   और   gcd(a^(r/2) + 1, N)
```

आमतौर पर N के factors देते हैं। r classically ढूँढना factoring जितना ही कठिन है। **Quantum में r ढूँढना आसान है**, QFT (पाठ 26) की मदद से।

## हल किया उदाहरण: N = 15, a = 7

**1. Sequence निकालें:**

| x | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|---|
| 7ˣ mod 15 | 1 | 7 | 4 | 13 | 1 | 7 | 4 | 13 |

**2. Period पढ़ें:** हर **r = 4** पर दोहराता है।

**3. Formula लगाएँ:** 7^(4/2) = 49।

- gcd(49 − 1, 15) = gcd(48, 15) = **3**
- gcd(49 + 1, 15) = gcd(50, 15) = **5**

**15 = 3 × 5।**

```python
import math
N, a = 15, 7
print([pow(a, x, N) for x in range(8)])        # [1, 7, 4, 13, 1, 7, 4, 13]
r = 4
print(math.gcd(a**(r//2) - 1, N), math.gcd(a**(r//2) + 1, N))   # 3 5
```

## Quantum computer कहाँ आता है

2048-bit N के लिए sequence लिखी नहीं जा सकती। Quantum हिस्सा यह करता है:

1. एक register को **सभी** x के superposition में डालें।
2. दूसरे register में aˣ mod N superposition में निकालें (**modular exponentiation**, सबसे महँगा हिस्सा)।
3. पहले register पर **QFT** लगाएँ। f हर r कदम पर दोहराता है, इसलिए amplitudes interfere करके N/r का कोई गुणज ऊँची probability से देते हैं।
4. कुछ runs और एक classical तरकीब (continued fractions) से r निकलता है।
5. gcd वाला कदम classical और तेज़ है।

## कभी-कभी fail होता है, और वह ठीक है

अगर r विषम हो, या a^(r/2) ≡ −1 mod N, तो वह a काम नहीं करता। दूसरा a चुनें। Random a कम से कम 1/2 probability से काम करता है।

## ईमानदार स्थिति

- असली हार्डवेयर पर **सच्चे** Shor runs से factor की गई सबसे बड़ी संख्याएँ बहुत छोटी हैं (जैसे 15 और 21)।
- RSA-2048 तोड़ने के लिए लगभग **10 लाख noisy physical qubits** को error correction के साथ लगभग एक हफ़्ते चलाना होगा (Google शोधकर्ताओं का 2025 का अनुमान)। आज की मशीनों में सैकड़ों से कुछ हज़ार physical qubits हैं।
- इसीलिए सरकारें अभी से **post-quantum cryptography** (पाठ 43) अपना रही हैं: आज चुराया डेटा बाद में decrypt हो सकता है।

## ख़ुद आज़माएँ

1. N = 21, a = 2 के साथ उदाहरण दोहराएँ। Period क्या है? कौन-से factors मिलते हैं?
2. N = 15, a = 4 आज़माएँ। क्या काम करता है?
3. a और N का कोई साझा factor क्यों नहीं होना चाहिए?
