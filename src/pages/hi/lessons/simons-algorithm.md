---
layout: ../../../layouts/Post.astro
lang: hi
title: "Simon का algorithm"
description: "पहला exponential quantum speed-up जो randomised classical algorithms के ख़िलाफ़ भी टिकता है: छिपा XOR pattern ढूँढना। समस्या, classical खोज को लगभग 2^(n/2) queries क्यों चाहिए, quantum circuit, हर नतीजा secret से orthogonal क्यों होता है उसका गणित, समीकरण हल करना, और इसने Shor को कैसे प्रेरित किया।"
date: 2026-11-04
category: lesson
lesson: 23

---

पाठ 22 एक ईमानदार चेतावनी पर ख़त्म हुआ: अगर classical algorithm को ग़लती की छोटी संभावना की छूट हो, तो Deutsch–Jozsa का exponential फ़ायदा ग़ायब हो जाता है। क्या quantum फ़ायदा बस नियमों की चाल था?

1994 में Daniel Simon ने जवाब दिया: नहीं। उन्होंने ऐसी समस्या ढूँढी जहाँ quantum computer को लगभग **n** queries चाहिए, जबकि **किसी भी** classical algorithm को, अंदाज़ा लगाने और ग़लती करने की छूट के साथ भी, लगभग **2^(n/2)** चाहिए। यह असली exponential फ़र्क़ है। Simon का paper पहले एक बड़े सम्मेलन से लौटा दिया गया, लेकिन एक reviewer, Peter Shor, ने उसे ध्यान से पढ़ा और समझा कि यही विचार modular गणित में periods ढूँढ सकता है। कुछ महीनों बाद उनके पास factoring algorithm था (पाठ 28)। Simon का algorithm दुनिया के सबसे मशहूर quantum algorithm का सीधा पूर्वज है।

## समस्या: एक छिपा XOR pattern

आपको function f का oracle दिया गया है जो n bits से n bits देता है। वादा है कि एक secret, non-zero n-bit string s है ऐसी कि:

> **f(x) = f(y) ठीक तब जब y = x या y = x ⊕ s**

(⊕ bitwise XOR है।) तो f **दो-से-एक** है: inputs जोड़ियों {x, x ⊕ s} में आते हैं जो एक output साझा करते हैं, और अलग जोड़ियों के outputs अलग हैं। **s ढूँढो।**

n = 3 और s = 110 के साथ एक छोटा उदाहरण:

| x | x ⊕ s | f(x) |
|---|---|---|
| 000 | 110 | 101 |
| 001 | 111 | 010 |
| 010 | 100 | 000 |
| 011 | 101 | 110 |
| 100 | 010 | 000 |
| 101 | 011 | 110 |
| 110 | 000 | 101 |
| 111 | 001 | 010 |

Outputs बस मनमाने labels हैं; मायने यह रखता है कि ठीक 110 से अलग inputs एक output साझा करते हैं। अगर कभी एक ही output वाले दो inputs मिल जाएँ, उनका XOR करें और s मिल गया।

## Classical कठिनाई: टकराव चाहिए

Classically, s के बारे में कुछ भी जानने का अकेला तरीका **टकराव** (collision) ढूँढना है: दो अलग inputs x ≠ y जिनका f(x) = f(y)। तब s = x ⊕ y। जब तक यह न मिले, हर देखा output एक random नए label जैसा लगता है, और कुछ नहीं बताता।

टकराव तक कितनी queries? यह **birthday problem** है: 23 लोगों के कमरे में 50% संभावना है कि दो का जन्मदिन एक हो, जबकि साल में 365 दिन हैं। N संभव outputs के साथ, दो मेल खाने से पहले लगभग √N random नमूने चाहिए। यहाँ 2ⁿ⁻¹ outputs हैं, तो classical algorithm को लगभग **2^(n/2)** queries चाहिए। Simon ने साबित किया कि कोई classical रणनीति, कितनी भी चतुर या random, मूल रूप से इससे बेहतर नहीं कर सकती।

```python
import numpy as np
rng = np.random.default_rng(0)

def classical_queries(n):
    """Query f(x) = min(x, x XOR s) at random inputs until two inputs give the same output."""
    s = int(rng.integers(1, 2 ** n))
    seen = {}
    for count, x in enumerate(rng.permutation(2 ** n), start=1):
        y = min(int(x), int(x) ^ s)
        if y in seen:
            return count                     # collision: x XOR seen[y] = s
        seen[y] = x

for n in [10, 16, 20]:
    avg = np.mean([classical_queries(n) for _ in range(200)])
    print(f"n = {n}: classical ≈ {avg:6.0f} queries on average   (2^(n/2) = {2 ** (n / 2):5.0f});  quantum ≈ {n + 1}")
```

```text
n = 10: classical ≈     40 queries on average   (2^(n/2) =    32);  quantum ≈ 11
n = 16: classical ≈    305 queries on average   (2^(n/2) =   256);  quantum ≈ 17
n = 20: classical ≈   1193 queries on average   (2^(n/2) =  1024);  quantum ≈ 21
```

(हमने आसान function f(x) = min(x, x ⊕ s) इस्तेमाल किया, जिसमें ठीक ज़रूरी जोड़ियाँ हैं।) हर 2 अतिरिक्त bits classical लागत दोगुनी करते हैं। n = 100 पर classical खोज को लगभग 10¹⁵ queries चाहिए; quantum algorithm को लगभग 100।

## Quantum algorithm

Circuit में n qubits के दो registers हैं: input register और output register। एक round:

1. Input register को **superpose** करें: उसके हर qubit पर H। Output register |0…0⟩ में रहता है।
2. Oracle से एक बार **पूछें**: |x⟩|0⟩ → |x⟩|f(x)⟩।
3. **Output register measure करें** (या बस नज़रअंदाज़ करें; गणित वही है)।
4. **Interfere:** हर input qubit पर फिर H।
5. **Input register measure करें।** नतीजे को y कहें।

हर round एक string y देता है। लगभग n बार दोहराएँ, फिर कुछ आसान समीकरण हल करके s निकालें।

### यह काम क्यों करता है

**क़दम 2 के बाद** state (1/√2ⁿ) Σ_x |x⟩|f(x)⟩ है, दोनों registers की entangled state।

**क़दम 3।** मान लीजिए output register measure करने पर कोई value f₀ मिली। उससे मेल खाने वाले inputs सिर्फ़ जोड़ी x₀ और x₀ ⊕ s हैं। तो input register collapse होता है

> (|x₀⟩ + |x₀ ⊕ s⟩)/√2

जहाँ x₀ random है। ध्यान दें: अगर अभी input measure करें, तो x₀ या x₀ ⊕ s मिलेगा, एक random जोड़ी का random सदस्य। बेकार। लेकिन जोड़ी के **superposition** के ढाँचे में s है।

**क़दम 4।** पाठ 12 के सूत्र H⊗ⁿ|x⟩ = (1/√2ⁿ) Σ_y (−1)^(x·y) |y⟩ से H⊗ⁿ लगाएँ। हर |y⟩ का amplitude है

> (1/√2ⁿ⁺¹) [(−1)^(x₀·y) + (−1)^((x₀⊕s)·y)] = (1/√2ⁿ⁺¹) (−1)^(x₀·y) [1 + (−1)^(s·y)]

((x₀ ⊕ s)·y = x₀·y ⊕ s·y से)। अब bracket देखें:

- अगर **s·y = 0**: bracket 1 + 1 = 2 है। दोनों रास्ते **जुड़ते** हैं।
- अगर **s·y = 1**: bracket 1 − 1 = 0 है। दोनों रास्ते **कटते** हैं।

तो measurement **सिर्फ़ वे strings y देता है जिनका s·y = 0 (mod 2)**, हर एक बराबर संभावना से। Random x₀ सिर्फ़ चिह्न में आता है, जिसे measurement नहीं देख सकता। पूरी तरकीब यही है: interference ने बेकार random हिस्सा मिटा दिया और s पर एक साफ़ शर्त रख ली।

### s निकालना

हर y, bits पर एक linear समीकरण है: y₁s₁ ⊕ y₂s₂ ⊕ … ⊕ yₙsₙ = 0। लगभग n इकट्ठा करने के बाद आपके पास n − 1 स्वतंत्र समीकरण होंगे, और वे s को अकेले तय कर देते हैं (दूसरा हल s = 00…0 है, जो बाहर है)। हल करने में साधारण Gaussian elimination लगता है, घटाने की जगह XOR से; laptop इसे हज़ारों n के लिए भी तुरंत कर देता है।

## Simon algorithm कोड में

यह n = 4 और secret s = 1011 (Qiskit क्रम में लिखा, तो सबसे दाईं bit, bit 0 है) के लिए पूरा run है। Oracle, x को दूसरे register में copy करता है, फिर जब भी x का एक ख़ास bit 1 हो, s को XOR कर देता है; इससे x और x ⊕ s एक ही output देते हैं। छोटे उदाहरण के लिए हम हर उम्मीदवार को समीकरणों से जाँचकर s ढूँढते हैं।

```python
import itertools
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler

def simon_oracle(s):
    """f(x) = f(x XOR s): a 2-to-1 function hiding the string s (Qiskit order: s[-1] is bit 0)."""
    n = len(s)
    qc = QuantumCircuit(2 * n)
    for i in range(n):
        qc.cx(i, n + i)                      # second register = copy of x
    k = s[::-1].index("1")                   # lowest bit where s has a 1
    for i, bit in enumerate(s[::-1]):
        if bit == "1":
            qc.cx(k, n + i)                  # if x_k = 1, XOR s into the copy
    return qc

def simon_round(s, shots):
    n = len(s)
    qc = QuantumCircuit(2 * n, n)
    qc.h(range(n))
    qc.compose(simon_oracle(s), inplace=True)
    qc.h(range(n))
    qc.measure(range(n), range(n))
    return StatevectorSampler(seed=23).run([qc], shots=shots).result()[0].data.c.get_counts()

secret = "1011"
counts = simon_round(secret, shots=20)
print("measured y values:", sorted(counts))

def dot(a, b):
    return sum(int(x) * int(y) for x, y in zip(a, b)) % 2

ys = list(counts)
for y in sorted(ys):
    print(y, "· s =", dot(y, secret))

candidates = ["".join(c) for c in itertools.product("01", repeat=len(secret)) if "1" in c]
solutions = [c for c in candidates if all(dot(y, c) == 0 for y in ys)]
print("strings consistent with every y:", solutions)
```

```text
measured y values: ['0000', '0011', '0100', '0111', '1001', '1010', '1101']
0000 · s = 0
0011 · s = 0
0100 · s = 0
0111 · s = 0
1001 · s = 0
1010 · s = 0
1101 · s = 0
strings consistent with every y: ['1011']
```

बीस shots से 7 अलग y values मिलीं, और **हर एक** का y·s = 0 है, ठीक जैसा interference तर्क कहता है। (s से orthogonal 2³ = 8 strings हैं, 0000 सहित; हमने उनमें से 7 देखीं।) सिर्फ़ एक non-zero string सभी समीकरणों से मेल खाती है: secret।

ध्यान दें कि हमने output register कभी measure नहीं किया। उसे measure करें या न करें, input register के आँकड़ों में फ़र्क़ नहीं पड़ता: जब input, output से entangled हो, तो output को नज़रअंदाज़ करना उसे measure करके नतीजा भूल जाने जैसा ही है (पाठ 14 की reduced states)।

## Simon algorithm क्यों मायने रखता है

**1. असली exponential फ़र्क़।** Deutsch–Jozsa के उलट, यह फ़र्क़ randomised classical algorithms के ख़िलाफ़ भी टिकता है: लगभग n quantum queries बनाम लगभग 2^(n/2) classical। यह तब तक का सबसे मज़बूत सबूत था कि कुछ कामों के लिए quantum computers मूल रूप से classical से ज़्यादा ताक़तवर हैं।

**2. यह period-finding algorithm है।** शर्त f(x) = f(x ⊕ s) कहती है कि f period s के साथ **periodic** है, जहाँ "जोड़ना" XOR है। Shor की समझ थी XOR की जगह modulo N साधारण जोड़, और Hadamard transform की जगह quantum Fourier transform (पाठ 26) रखना। ढाँचा वही रहता है: superpose, query, periodic superposition में collapse, transform, period पर शर्त पढ़ो, दोहराओ, हल करो।

| | Simon | Shor |
|---|---|---|
| छिपा ढाँचा | f(x) = f(x ⊕ s) | f(x) = f(x + r) |
| "जोड़" | Bitwise XOR | साधारण जोड़ |
| Transform | हर qubit पर Hadamard | Quantum Fourier transform |
| हर run देता है | y जिसका y·s = 0 | y जो N/r के किसी गुणज के पास हो |
| Classical बाद का काम | Mod 2 linear algebra | Continued fractions |

**3. यह "hidden subgroup problem" है।** दोनों एक आम समस्या के रूप हैं: किसी छिपे subgroup के cosets पर स्थिर function, subgroup ढूँढो। Quantum computers इसे सभी **abelian** groups के लिए कुशलता से हल करते हैं (जिसमें Simon, Shor, और elliptic-curve cryptography के पीछे की discrete logarithm समस्या आती हैं)। कुछ non-abelian groups के लिए, graph isomorphism से जुड़े वाले सहित, कोई कुशल quantum algorithm ज्ञात नहीं।

**4. इसने काग़ज़ पर असली cryptography तोड़ी है।** 2016 में researchers ने दिखाया कि Simon algorithm कई symmetric-key constructions (कुछ block cipher modes और message-authentication codes) तोड़ सकता है, **अगर हमलावर उनसे superposition में पूछ सके**। आज के ज़्यादातर systems के लिए यह ख़तरे का model अवास्तविक है, लेकिन दिखाता है कि quantum algorithms ऐसे छिपे ढाँचे ढूँढते हैं जो classical cryptanalysis से छूट जाते हैं (पाठ 43)।

## ख़ुद करके देखें

1. ऊपर की n = 3 table में 011 के साथ कौन-सा input output साझा करता है? जाँचें कि उनका XOR, s है।
2. s = 110 के साथ Simon algorithm इनमें से कौन-से y दे सकता है: 000, 001, 110, 111, 011?
3. n = 40 के लिए टकराव ढूँढने में लगभग कितनी classical queries? कितनी quantum?
4. किसी 4-bit s के लिए आपने y = 1100, y = 0110 और y = 0011 नापे। s निकालें।
5. क़दम 3 का random x₀ नतीजा क्यों नहीं बिगाड़ता?
6. एक वाक्य में, Simon और Shor algorithm के बीच क्या बदला?

**जवाब:**

1. 101, क्योंकि 011 ⊕ 110 = 101। Table में दोनों 110 पर जाते हैं।
2. y·s = 0 के लिए y₁·1 ⊕ y₂·1 ⊕ y₃·0 = 0, तो पहले दो bits बराबर होने चाहिए: **000, 001, 110, 111** संभव हैं; 011 नहीं।
3. लगभग 2²⁰ ≈ **दस लाख** classical queries; लगभग **41** quantum queries।
4. समीकरण कहते हैं s₁ = s₂, s₂ = s₃ और s₃ = s₄, तो सभी bits बराबर हैं। अकेला non-zero हल **s = 1111** है।
5. यह सिर्फ़ चिह्न (−1)^(x₀·y) में आता है, और amplitude पर चिह्न probability |amplitude|² नहीं बदलता।
6. Shor ने XOR-periodicity की जगह साधारण जोड़ वाली periodicity रखी, और Hadamard transform की जगह quantum Fourier transform।

## सार

| विचार | सूत्र या तथ्य |
|---|---|
| Simon की समस्या | f(x) = f(y) ⇔ y = x या y = x ⊕ s; s ढूँढो |
| Classical लागत | ~2^(n/2) queries (birthday सीमा), randomness के साथ भी |
| Quantum लागत | ~n queries + mod 2 linear algebra |
| एक round | H⊗ⁿ → query → (output measure) → H⊗ⁿ → input measure |
| Query और collapse के बाद | (\|x₀⟩ + \|x₀ ⊕ s⟩)/√2 |
| मुख्य amplitude | ∝ (−1)^(x₀·y) [1 + (−1)^(s·y)] |
| नतीजे | सिर्फ़ वे y जिनका s·y = 0 (mod 2) |
| अंत | ~n − 1 स्वतंत्र समीकरण → अकेला s |
| इतिहास | Simon (1994); Shor ने review किया, फिर factoring ढूँढा |
| बड़ी तस्वीर | Abelian hidden subgroup problem: Simon, Shor, discrete log |
| Crypto पर असर | Superposition में पूछे जाने पर कुछ symmetric schemes तोड़ता है |
