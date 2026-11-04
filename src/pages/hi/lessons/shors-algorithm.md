---
layout: ../../../layouts/Post.astro
lang: hi
title: "Shor का algorithm, क़दम-दर-क़दम"
description: "Shor का algorithm बुनियाद से: RSA factoring पर कैसे टिका है (एक छोटा RSA जिसे आप तोड़ सकते हैं), वह number theory जो factoring को order ढूँढने में बदलती है, modular multiplication पर phase estimation के रूप में order finding, N = 15 और N = 21 के लिए Qiskit में पूरे runs, continued fractions, algorithm की लागत और वह exponential speed-up क्यों है, discrete logarithms और elliptic curves, hardware पर असल में क्या चला है, और एक ईमानदार समय-रेखा।"
date: 2026-11-04
category: lesson
lesson: 28
---

1994 में Peter Shor ने दिखाया कि पर्याप्त बड़ा quantum computer पूर्ण संख्याओं के **factors** निकाल सकता है, और **discrete logarithms** निकाल सकता है, ऐसे समय में जो अंकों की संख्या के साथ सिर्फ़ polynomial तरीके से बढ़ता है। सबसे अच्छे ज्ञात classical तरीकों में super-polynomial समय लगता है। आज इस्तेमाल होने वाली लगभग सारी public-key cryptography इन्हीं दो समस्याओं पर टिकी है: RSA, Diffie–Hellman और elliptic curves। किसी और quantum algorithm का दुनिया पर इससे बड़ा असर नहीं हुआ, जबकि उसे बड़े पैमाने पर चला सकने वाली machine अभी बनी भी नहीं है।

यह पाठ Shor का algorithm टुकड़ा-टुकड़ा बनाता है। शुरुआत इस बात से कि factoring क्यों मायने रखती है (एक छोटा RSA जिसे आप तोड़ सकते हैं), फिर number theory की वह तरकीब जो factoring को **order ढूँढने** में बदल देती है, फिर quantum हिस्सा, जो modular multiplication पर लागू phase estimation (पाठ 27) है। आप Qiskit में N = 15 और N = 21 के लिए पूरा algorithm चलाएँगे, continued fractions से period वापस निकालेंगे, और फिर लागत, records और समय-रेखा को ईमानदारी से देखेंगे।

## Factoring क्यों मायने रखती है: एक screen में RSA

RSA (Rivest, Shamir और Adleman, 1977) ऐसे काम करता है:

1. दो बड़े गुप्त prime p और q चुनें, और उन्हें गुणा करें: **N = p·q**। N सार्वजनिक है।
2. φ = (p − 1)(q − 1) निकालें। इसके लिए p और q चाहिए, इसलिए यह सिर्फ़ मालिक कर सकता है।
3. एक सार्वजनिक exponent e चुनें, और निजी exponent **d** ऐसे निकालें कि e·d ≡ 1 (mod φ)।
4. कोई भी message m को c = mᵉ mod N के रूप में **encrypt** कर सकता है। सिर्फ़ मालिक **decrypt** कर सकता है: m = cᵈ mod N।

सुरक्षा एक तथ्य पर टिकी है: d निकालने के लिए φ चाहिए, और φ निकालने के लिए p और q। **अगर आप N के factors निकाल सकें, तो आप सब कुछ पढ़ सकते हैं।** छोटे primes के साथ यह रहा:

```python
# Toy RSA with tiny primes, then breaking it by factoring N
p, q = 61, 53                  # the secret primes
N = p * q                      # public modulus
phi = (p - 1) * (q - 1)        # secret: needs p and q
e = 17                         # public exponent
d = pow(e, -1, phi)            # private exponent: e*d = 1 mod phi

message = 1234
cipher = pow(message, e, N)    # anyone can encrypt with (N, e)
print(f"public key (N, e) = ({N}, {e}), private d = {d}")
print(f"encrypt {message} -> {cipher}, decrypt -> {pow(cipher, d, N)}")

# The attacker knows only N and e. Factor N by trial division:
f = next(k for k in range(2, N) if N % k == 0)
d_stolen = pow(e, -1, (f - 1) * (N // f - 1))
print(f"attacker factors {N} = {f} x {N // f}, recovers d = {d_stolen}, reads {pow(cipher, d_stolen, N)}")
```

```text
public key (N, e) = (3233, 17), private d = 2753
encrypt 1234 -> 2183, decrypt -> 1234
attacker factors 3233 = 53 x 61, recovers d = 2753, reads 1234
```

N = 3233 के लिए trial division factors तुरंत ढूँढ लेता है। असली RSA 2048-bit N इस्तेमाल करता है, 617 दशमलव अंकों वाली संख्या (और padding schemes जोड़ता है जो यह खिलौना छोड़ देता है)। वही हमला सिर्फ़ एक चीज़ माँगता है: N के factors निकालने का तरीका।

### Classically factoring कितनी कठिन है?

- **Trial division** √N तक के भाजक आज़माता है। 2048-bit N के लिए यह लगभग 2¹⁰²⁴ ≈ 10³⁰⁸ भाग हैं: नामुमकिन।
- सबसे अच्छा ज्ञात तरीका, **general number field sieve** (NFS), कहीं ज़्यादा चतुर है। n-bit संख्या के लिए इसकी लागत मोटे तौर पर e^(c·n^(1/3)·(log n)^(2/3)) की तरह बढ़ती है: exponential से धीमी, लेकिन किसी भी polynomial से तेज़। Record **RSA-250** का है, एक 829-bit संख्या जिसके factors 2020 में लगभग 2,700 CPU core-years लगाकर निकाले गए। RSA-2048 पहुँच से बहुत दूर है।
- किसी ने **साबित** नहीं किया कि factoring classically कठिन है। यह सदियों के गणित और दशकों के हमलों पर आधारित एक विश्वास है। Shor का नतीजा अलग है: यह इस बात का प्रमाण है कि quantum computer factoring कुशलता से **कर सकता है**।

## बड़ा विचार: factoring = order ढूँढना

### Modular arithmetic और order

"a mod N" का मतलब है a को N से भाग देने पर बचा शेषफल। ऐसी संख्या a चुनें जिसका N के साथ कोई साझा factor न हो (यानी gcd(a, N) = 1), और mod N में उसकी घातें देखें:

> f(x) = aˣ mod N

N = 15 और a = 7 के लिए:

| x | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|---|
| 7ˣ mod 15 | 1 | 7 | 4 | 13 | 1 | 7 | 4 | 13 |

Sequence **दोहराता** है। उसे दोहराना ही होगा: सिर्फ़ N संभव शेषफल हैं, और a से गुणा को उलटा जा सकता है (gcd(a, N) = 1 होने पर mod N में a का inverse होता है), इसलिए sequence को 1 पर लौटना ही है। aˣ ≡ 1 (mod N) वाला पहला x > 0 a का **order** कहलाता है, जिसे **r** लिखते हैं। यहाँ r = 4, और f का **period** r है।

### Order से factors क्यों मिलते हैं

चूँकि a^r ≡ 1 (mod N), N a^r − 1 को भाग देता है। अगर r सम है, तो यह वर्गों के अंतर की तरह टूटता है:

> a^r − 1 = (a^(r/2) − 1)(a^(r/2) + 1)

तो N दोनों कोष्ठकों के गुणनफल को भाग देता है। अब:

- N a^(r/2) − 1 को भाग नहीं देता, क्योंकि तब a^(r/2) ≡ 1 होता, और r ऐसी **सबसे छोटी** घात नहीं होती।
- अगर साथ में a^(r/2) ≢ −1 (mod N) भी हो, तो N a^(r/2) + 1 को भी भाग नहीं देता।

तो N गुणनफल को भाग देता है लेकिन किसी एक factor को नहीं। ऐसा तभी हो सकता है जब N के prime factors दोनों कोष्ठकों में **बँटे** हों। तब महत्तम समापवर्तक (gcd)

> gcd(a^(r/2) − 1, N) और gcd(a^(r/2) + 1, N)

N के असली factors हैं। विशाल संख्याओं के लिए भी gcd निकालना आसान है, **Euclid के algorithm** से (बड़ी संख्या को बार-बार छोटी से भाग देने पर बचे शेषफल से बदलते जाएँ), जिसमें अंकों की संख्या के अनुपात में क़दम लगते हैं।

N = 15, a = 7 के लिए: r = 4, और 7² = 49। gcd(48, 15) = **3** और gcd(50, 15) = **5**। तो 15 = 3 × 5।

आइए N = 15 के लिए हर संभव a जाँचें, और कुछ और N के लिए गिनें कि तरकीब कितनी बार काम करती है:

```python
from math import gcd

def order(a, N):
    """Smallest r > 0 with a^r = 1 (mod N), found by brute force."""
    r, y = 1, a % N
    while y != 1:
        y = y * a % N
        r += 1
    return r

def try_a(a, N):
    r = order(a, N)
    if r % 2 == 1:
        return r, "fails: r is odd"
    h = pow(a, r // 2, N)                  # a^(r/2) mod N
    if h == N - 1:
        return r, "fails: a^(r/2) = -1 mod N"
    return r, f"factors {gcd(h - 1, N)} x {gcd(h + 1, N)}"

N = 15
print(f"N = {N}")
for a in range(2, N):
    if gcd(a, N) == 1:
        r, result = try_a(a, N)
        print(f"  a = {a:2d}  order r = {r}  {result}")

print("\nfraction of coprime a that work:")
for N in [15, 21, 35, 77, 221, 3233]:
    good = [a for a in range(2, N) if gcd(a, N) == 1]
    works = sum(try_a(a, N)[1].startswith("factors") for a in good)
    print(f"  N = {N:4d}: {works}/{len(good)} = {works / len(good):.2f}")
```

```text
N = 15
  a =  2  order r = 4  factors 3 x 5
  a =  4  order r = 2  factors 3 x 5
  a =  7  order r = 4  factors 3 x 5
  a =  8  order r = 4  factors 3 x 5
  a = 11  order r = 2  factors 5 x 3
  a = 13  order r = 4  factors 3 x 5
  a = 14  order r = 2  fails: a^(r/2) = -1 mod N

fraction of coprime a that work:
  N =   15: 6/7 = 0.86
  N =   21: 6/11 = 0.55
  N =   35: 18/23 = 0.78
  N =   77: 30/59 = 0.51
  N =  221: 174/191 = 0.91
  N = 3233: 1950/3119 = 0.63
```

तरकीब सिर्फ़ तब नाकाम होती है जब r विषम हो या a^(r/2) ≡ −1 (mod N); N = 15 के लिए ऐसा सिर्फ़ a = 14 पर होता है, जो ख़ुद −1 है। एक प्रमेय गारंटी देता है कि अगर N विषम है और किसी prime की घात नहीं है, तो सभी मान्य a में से **कम से कम आधे** काम करते हैं। इसलिए कुछ random कोशिशें काफ़ी हैं।

### पूरी विधि

1. अगर N सम है, तो 2 एक factor है। अगर N = pᵏ किसी prime p के लिए (classically जाँचना आसान), तो काम हो गया।
2. 2 और N − 1 के बीच एक random a चुनें। अगर gcd(a, N) > 1, तो किस्मत से factor मिल गया।
3. **mod N में a का order r ढूँढें।**
4. अगर r विषम है या a^(r/2) ≡ −1 (mod N), तो क़दम 2 पर लौटें।
5. gcd(a^(r/2) − 1, N) दें।

क़दम 3 के अलावा हर क़दम साधारण computer पर तेज़ है। क़दम 3 ही समस्या है: code का brute-force loop r क़दम लेता है, और r लगभग N जितना बड़ा हो सकता है, इसलिए 2048-bit N के लिए यह trial division जितना ही नामुमकिन है। Order ढूँढने का कोई कुशल classical तरीका ज्ञात नहीं है, और जब तक factoring भी आसान न हो, कोई आसान तरीका हो भी नहीं सकता, क्योंकि यह विधि किसी भी order-finder को factoring के तरीके में बदल देती है। **क़दम 3 quantum computer का इकलौता काम है।**

## Quantum हिस्सा: order finding phase estimation है

### गुणा एक quantum gate के रूप में

n-qubit register (n = N के bits की संख्या) पर एक operation परिभाषित करें जो a से गुणा करता है:

> U|y⟩ = |a·y mod N⟩

चूँकि mod N में a का inverse है, अलग-अलग y अलग-अलग output देते हैं: U बस basis states को **फेरबदल** करता है (यह एक permutation है), इसलिए यह unitary है। (बेकार states y ≥ N पर U कुछ नहीं करता।)

|1⟩ से शुरू करके U बार-बार लगाएँ। आप लंबाई r के एक चक्र पर घूमते हैं:

> |1⟩ → |7⟩ → |4⟩ → |13⟩ → |1⟩ (a = 7, N = 15 के लिए)

### इसके eigenstates में period है

पाठ 27 ने दिखाया कि phase estimation किसी unitary के eigenvalue phases पढ़ता है। ये रहे U के eigenstates। हर s = 0, 1, …, r − 1 के लिए परिभाषित करें

> |u_s⟩ = (1/√r) Σₖ e^(−2πi·sk/r) |aᵏ mod N⟩   (k = 0 … r − 1 पर योग)

U लगाने से हर पद चक्र पर एक क़दम आगे खिसकता है, जो पूरी state को e^(2πi·s/r) से गुणा करने के बराबर है:

> U|u_s⟩ = e^(2πi·s/r) |u_s⟩

तो eigenphases **φ = s/r** हैं। Period हर (denominator) में बैठा है।

एक अड़चन है: |u_s⟩ बनाने के लिए आपको r पहले से पता होना चाहिए। इसका हल ख़ूबसूरत है। सभी eigenstates को जोड़ें:

> (1/√r) Σ_s |u_s⟩ = |1⟩

(हर k ≠ 0 के लिए, s बदलने पर phases e^(−2πi·sk/r) circle का पूरा चक्कर लगाते हैं और कट जाते हैं; k = 0 के लिए सब 1 हैं और जुड़ जाते हैं।) तो **|1⟩ सभी r eigenstates का बराबर superposition है**, और इसे बनाना बेहद आसान है। |1⟩ पर phase estimation चलाएँ, और नतीजा किसी **random** s के लिए s/r होगा, हर एक 1/r probability के साथ।

### Controlled घातें मुफ़्त में

Phase estimation को controlled U, U², U⁴, U⁸ वग़ैरह चाहिए: counting qubit k U^(2ᵏ) को control करता है। पाठ 27 ने चेताया था कि आम तौर पर यही महँगा हिस्सा है: U के 2ᵏ प्रयोग। यहाँ नहीं। U^(2ᵏ) का मतलब है "a^(2ᵏ) mod N से गुणा", और वह संख्या classically **बार-बार वर्ग करके** निकाली जा सकती है: a, a², a⁴ = (a²)², a⁸ = (a⁴)², … हर एक mod N। तो हर controlled घात एक ज्ञात स्थिरांक से **एक** controlled गुणा है। यही Shor के algorithm को कुशल बनाता है।

### यही चीज़, period finding के रूप में

आपको Shor का algorithm पाठ 26 की तरह भी समझाया मिल सकता है: counting register को सभी x के superposition में रखें, aˣ mod N को work register में निकालें, और नतीजे का period ढूँढने के लिए QFT लगाएँ। यह बिल्कुल वही circuit है। Controlled गुणा हर x के लिए एक साथ aˣ mod N निकालते हैं (x का हर bit एक गुणा को control करता है), और inverse QFT period पढ़ लेता है। "Phase estimation" और "period finding" एक ही algorithm के दो वर्णन हैं।

### Circuit

1. **Counting register:** t qubits (आम तौर पर t ≈ 2n), हर एक Hadamard से |+⟩ में।
2. **Work register:** n qubits, |1⟩ पर सेट।
3. **Controlled गुणा:** counting qubit k "a^(2ᵏ) mod N से गुणा" को control करता है।
4. Counting register पर **inverse QFT**।
5. Counting register को **measure** करें, जिससे एक संख्या k मिलती है। तब k/2ᵗ ≈ s/r।
6. **Classical post-processing:** continued fractions k/2ᵗ को s/r में बदलते हैं, जिससे r मिलता है।

## Qiskit में N = 15 के लिए Shor

यह रहा N = 15 और a = 7 के लिए पूरा algorithm, t = 8 counting qubits और 4-qubit work register के साथ। हर modular गुणा एक permutation matrix के रूप में बना है:

```python
import numpy as np
from fractions import Fraction
from qiskit import QuantumCircuit
from qiskit.circuit.library import QFTGate, UnitaryGate
from qiskit.quantum_info import Statevector

def mult_gate(c, N, n):
    """U|y> = |c*y mod N> for y < N (and |y> for y >= N), as an n-qubit gate."""
    M = np.zeros((2**n, 2**n))
    for y in range(2**n):
        M[c * y % N if y < N else y, y] = 1
    return UnitaryGate(M, label=f"x{c} mod {N}")

def order_finding(a, N, t):
    n = N.bit_length()                              # work-register size
    qc = QuantumCircuit(t + n)
    qc.h(range(t))                                  # counting register: all x at once
    qc.x(t)                                         # work register starts in |1>
    for k in range(t):                              # controlled U^(2^k) = multiply by a^(2^k)
        c = pow(a, 2**k, N)                         # computed classically by repeated squaring
        qc.append(mult_gate(c, N, n).control(1), [k] + list(range(t, t + n)))
    qc.append(QFTGate(t).inverse(), range(t))       # inverse QFT on the counting register
    return qc

N, a, t = 15, 7, 8
probs = Statevector(order_finding(a, N, t)).probabilities_dict(qargs=range(t))
for bits, p in sorted(probs.items()):
    if p > 1e-6:
        k = int(bits, 2)
        frac = Fraction(k, 2**t).limit_denominator(N)
        print(f"measure k = {k:3d}  prob {p:.3f}  k/2^t = {k / 2**t:.4f} = {str(frac):4s}  -> r guess {frac.denominator}")
```

```text
measure k =   0  prob 0.250  k/2^t = 0.0000 = 0     -> r guess 1
measure k =  64  prob 0.250  k/2^t = 0.2500 = 1/4   -> r guess 4
measure k = 128  prob 0.250  k/2^t = 0.5000 = 1/2   -> r guess 2
measure k = 192  prob 0.250  k/2^t = 0.7500 = 3/4   -> r guess 4
```

चार नतीजे 0, 64, 128 और 192 हर एक 25% बार आते हैं। 2⁸ = 256 से भाग देने पर ये ठीक 0, 1/4, 1/2 और 3/4 हैं: s = 0, 1, 2, 3 के लिए भिन्न s/4। चूँकि r = 4 256 को ठीक-ठीक भाग देता है, peaks बिल्कुल नुकीले हैं।

हर नतीजा क्या बताता है:

- **64 या 192** (s = 1 या 3): भिन्न 1/4 या 3/4 है, तो r = **4**। जाँच: 7⁴ mod 15 = 1। सफलता।
- **128** (s = 2): भिन्न 2/4 घटकर 1/2 हो जाती है, तो अनुमान 2 है, जो असली order का एक **भाजक** है। जाँच 7² mod 15 = 4 ≠ 1 दिखाती है कि यह ग़लत है, तो आप फिर चलाते हैं (या अनुमान के छोटे गुणज आज़माते हैं)।
- **0** (s = 0): कोई जानकारी नहीं। फिर चलाएँ।

तो हर run आधी बार सफल होता है, और आपको हमेशा पता चल जाता है कि हुआ या नहीं, क्योंकि aʳ mod N = 1 जाँचना आसान है।

Code के बारे में एक ईमानदार बात: U को 2ⁿ × 2ⁿ matrix के रूप में बनाना सिर्फ़ इसलिए चलता है क्योंकि N बहुत छोटा है। 2048-bit N के लिए matrix में 2²⁰⁴⁸ पंक्तियाँ होतीं। असली implementations modular गुणा को **reversible arithmetic circuits** से बनाते हैं: Toffoli और CNOT gates से बने adders (पाठ 13), या QFT-आधारित adders। Shor की लगभग सारी लागत इसी arithmetic में है।

## जब period फ़िट न हो: N = 21 और continued fractions

N = 21 और a = 2 के लिए घातें 1, 2, 4, 8, 16, 11, 1, … हैं, तो r = 6। t = 10 counting qubits के साथ, 2ᵗ/r = 1024/6 ≈ 170.67 पूर्ण संख्या नहीं है, इसलिए peaks ठीक पूर्णांकों पर नहीं पड़ सकते। वे पड़ोसी मानों पर फैल जाते हैं, ठीक पाठ 26 और 27 की तरह।

### Continued fractions

मापे गए k/2ᵗ को वापस s/r में बदलने के लिए हमें उसके सबसे क़रीब की सरल भिन्न चाहिए। **Continued fractions** ठीक यही करते हैं। किसी भी संख्या को ऐसे लिखा जा सकता है

> x = a₀ + 1/(a₁ + 1/(a₂ + 1/(a₃ + …)))

और विस्तार को जल्दी काट देने से x के **सबसे अच्छे सरल सन्निकटन** मिलते हैं, जिन्हें **convergents** कहते हैं। उदाहरण के लिए,

> 171/1024 = 0 + 1/(5 + 1/(1 + 1/(84 + 1/2)))

जिसके convergents 1/5, **1/6**, 85/509 और 171/1024 हैं। इनमें से N = 21 से अनधिक हर वाला आख़िरी convergent 1/6 है, तो r = 6।

एक classical प्रमेय इसकी गारंटी देता है: अगर |k/2ᵗ − s/r| < 1/(2r²), तो s/r k/2ᵗ का एक convergent है। 2ᵗ ≥ N² चुनने से (यानी t ≈ 2n counting qubits) सबसे पास का peak पर्याप्त क़रीब हो जाता है। इसीलिए Shor का algorithm N के bits से लगभग दोगुने counting qubits इस्तेमाल करता है। Python का `Fraction.limit_denominator(N)` यह खोज हमारे लिए करता है।

```python
import numpy as np
from math import lcm
from fractions import Fraction
from collections import Counter
from itertools import product
from qiskit import QuantumCircuit
from qiskit.circuit.library import QFTGate, UnitaryGate
from qiskit.quantum_info import Statevector

def mult_gate(c, N, n):
    M = np.zeros((2**n, 2**n))
    for y in range(2**n):
        M[c * y % N if y < N else y, y] = 1
    return UnitaryGate(M)

def order_finding(a, N, t):
    n = N.bit_length()
    qc = QuantumCircuit(t + n)
    qc.h(range(t))
    qc.x(t)
    for k in range(t):
        qc.append(mult_gate(pow(a, 2**k, N), N, n).control(1), [k] + list(range(t, t + n)))
    qc.append(QFTGate(t).inverse(), range(t))
    return qc

N, a, t = 21, 2, 10                                  # the true order of 2 mod 21 is 6
probs = Statevector(order_finding(a, N, t)).probabilities_dict(qargs=range(t))
dist = {int(b, 2): p for b, p in probs.items()}

def guess(k):
    """Continued fractions: the nearest fraction s/r to k/2^t with r <= N."""
    return Fraction(k, 2**t).limit_denominator(N)

print("most likely outcomes:")
for k in sorted(sorted(dist, key=dist.get, reverse=True)[:6]):
    print(f"  k = {k:4d}  prob {dist[k]:.3f}  k/2^t = {k / 2**t:.4f}  -> {str(guess(k)):3s}  r guess {guess(k).denominator}")

step = 2**t / 6
near = sum(p for k, p in dist.items() if abs(k - step * round(k / step)) < 1)
print(f"\nP(k within 1 of a multiple of 2^t/6) = {near:.3f}")

g = Counter()                                        # probability of each r guess
for k, p in dist.items():
    g[guess(k).denominator] += p

def found(guesses):
    """Try each guess and the lcm of all of them; keep the smallest r with a^r = 1 mod N."""
    valid = [r for r in set(guesses) | {lcm(*guesses)} if pow(a, r, N) == 1]
    return min(valid, default=None) == 6

for runs in [1, 2, 3]:
    p = sum(np.prod([g[x] for x in combo]) for combo in product(g, repeat=runs) if found(combo))
    print(f"P(r = 6 found with {runs} run(s))         = {p:.3f}")
```

```text
most likely outcomes:
  k =    0  prob 0.167  k/2^t = 0.0000  -> 0    r guess 1
  k =  171  prob 0.114  k/2^t = 0.1670  -> 1/6  r guess 6
  k =  341  prob 0.114  k/2^t = 0.3330  -> 1/3  r guess 3
  k =  512  prob 0.167  k/2^t = 0.5000  -> 1/2  r guess 2
  k =  683  prob 0.114  k/2^t = 0.6670  -> 2/3  r guess 3
  k =  853  prob 0.114  k/2^t = 0.8330  -> 5/6  r guess 6

P(k within 1 of a multiple of 2^t/6) = 0.903
P(r = 6 found with 1 run(s))         = 0.322
P(r = 6 found with 2 run(s))         = 0.650
P(r = 6 found with 3 run(s))         = 0.824
```

छह सबसे बड़े peaks 0, 171, 341, 512, 683 और 853 पर हैं, जो 170.67 के गुणजों के सबसे पास की पूर्ण संख्याएँ हैं, और कुल probability का 90% किसी peak के 1 के भीतर पड़ता है। Continued fractions हर एक को s/6 में बदलते हैं: s = 1 और 5 सीधे r = 6 देते हैं; s = 2 और 4 1/3 देते हैं, तो अनुमान 3 है; s = 3 1/2 देता है, तो अनुमान 2 है; s = 0 कुछ नहीं देता।

एक run लगभग 32% बार r = 6 ढूँढता है। लेकिन ग़लत अनुमान भी काम के हैं: वे r के भाजक हैं, इसलिए अलग-अलग runs के अनुमानों का **लघुत्तम समापवर्त्य** (lcm) अक्सर r देता है (lcm(2, 3) = 6)। दो runs के साथ सफलता दर 65% है, तीन के साथ 82%। आम तौर पर, random s का r के साथ कोई साझा factor न होने की संभावना r बढ़ने पर बहुत धीरे-धीरे घटती है, इसलिए गिने-चुने runs हमेशा काफ़ी होते हैं।

r = 6 के साथ: 2³ = 8, gcd(7, 21) = **7** और gcd(9, 21) = **3**। तो 21 = 3 × 7।

## लागत क्या है, और यह exponentially तेज़ क्यों है

n-bit N के लिए:

- **Qubits:** किताबी circuit 2n counting qubits और n work qubits इस्तेमाल करता है, साथ में arithmetic के लिए सहायक qubits। लेकिन counting register को **एक अकेले qubit** से बदला जा सकता है जिसे 2n बार measure करके दोबारा इस्तेमाल किया जाता है, और पहले के नतीजों की मदद से inverse QFT एक-एक bit करके किया जाता है (पाठ 27 का iterative विचार)। Stéphane Beauregard का 2003 का circuit Shor का algorithm **2n + 3** logical qubits से चलाता है: RSA-2048 के लिए लगभग 4,100।
- **Gates:** इनमें 2n controlled modular गुणा हावी हैं। हर गुणा में n-bit संख्याओं के लगभग n जोड़ लगते हैं, और हर जोड़ में लगभग n gates, तो कुल **n³** की तरह बढ़ता है। n = 2048 के लिए यह अरबों gates हैं। तुलना में QFT सस्ता है (लगभग n² gates, पाठ 26 के approximate QFT से और भी कम)।

बढ़त की तुलना सबसे अच्छे classical तरीके से करें (दोनों में स्थिरांक छोड़े गए हैं, इसलिए सिर्फ़ आकार मायने रखता है):

```python
import math

def nfs(bits):
    """Number field sieve: exp((64/9)^(1/3) (ln N)^(1/3) (ln ln N)^(2/3)), constants ignored."""
    lnN = bits * math.log(2)
    return math.exp((64 / 9) ** (1 / 3) * lnN ** (1 / 3) * math.log(lnN) ** (2 / 3))

print("RSA size    classical (NFS)   Shor (~n^3)   classical / Shor")
for bits in [512, 1024, 2048, 4096]:
    c, q = math.log10(nfs(bits)), math.log10(bits ** 3)
    print(f"{bits:4d} bits   {'10^%.1f' % c:<18s}{'10^%.1f' % q:<14s}10^{c - q:.1f}")
```

```text
RSA size    classical (NFS)   Shor (~n^3)   classical / Shor
 512 bits   10^19.2           10^8.1        10^11.1
1024 bits   10^26.1           10^9.0        10^17.1
2048 bits   10^35.2           10^9.9        10^25.3
4096 bits   10^47.1           10^10.8       10^36.3
```

Key का आकार दोगुना करने से Shor का काम सिर्फ़ 8 गुना होता है, लेकिन classical काम 10⁷ से 10¹² गुना बढ़ जाता है, और यह गुणक ख़ुद भी बढ़ता जाता है। Exponential (सख़्ती से कहें तो super-polynomial) speed-up ऐसा दिखता है। बड़ी RSA key हमलावर को बस थोड़ा धीमा करती है, इसलिए असली बचाव RSA का इस्तेमाल बंद करना ही है (पाठ 43)।

पेच यह है कि उन अरबों gates में से हर एक लगभग परिपूर्ण होना चाहिए। लगभग 10⁻³ की physical error rates (पाठ 32) के साथ, **error correction** के बिना यह गणना नामुमकिन है, और तब हर logical qubit की कीमत सैकड़ों से एक हज़ार physical qubits होती है। पाठ 35 हिसाब लगाता है कि कुल संख्या दस लाख तक क्यों पहुँचती है।

## Factoring से आगे: discrete logarithms और elliptic curves

Shor के paper ने एक दूसरी समस्या भी हल की। **Discrete logarithm** समस्या में आप g, p और h = gˣ mod p जानते हैं, और x ढूँढना है। Diffie–Hellman key exchange इसके कठिन होने पर निर्भर है, और **elliptic-curve cryptography** (ECDH, ECDSA, Ed25519) भी, जो यही समस्या एक अलग group में इस्तेमाल करती है। Elliptic curves ज़्यादातर HTTPS connections, Signal जैसे messaging apps, SSH logins और cryptocurrency wallets में इस्तेमाल होते हैं।

Shor का तरीका period finding के दो-variable रूप से इन तक पहुँचता है। और elliptic curves तो और भी आसान निशाना हैं: 256-bit curve classically लगभग 3072-bit RSA जितना मज़बूत है, लेकिन Roetteler और साथियों ने 2017 में अनुमान लगाया कि उसे तोड़ने के लिए सिर्फ़ लगभग **2,330 logical qubits** चाहिए। बहुत संभव है कि elliptic-curve cryptography RSA से पहले गिरे।

Simon की समस्या (पाठ 23), factoring और discrete logarithms सब एक ही सामान्य pattern के मामले हैं, क्रमविनिमेय (abelian) groups के लिए **hidden subgroup problem**: एक function एक दोहराने वाला ढाँचा छिपाता है, और Fourier sampling उसे उजागर करता है। अक्रमविनिमेय groups के लिए (जो उदाहरण के लिए graph isomorphism और कुछ lattice समस्याओं से जुड़े हैं) कोई कुशल quantum algorithm ज्ञात नहीं है। यह एक कारण है कि lattice-आधारित cryptography को quantum हमले से सुरक्षित माना जाता है (पाठ 43)।

## असल में क्या चलाया गया है

- **2001:** IBM की एक team ने 7-qubit **NMR** machine से **15** के factors निकाले (Vandersypen और साथी)। NMR प्रयोग सचमुच quantum गणनाएँ हैं या नहीं, इस पर बहस है, और circuit ने 15 की ख़ास बनावट का फ़ायदा उठाया।
- **2016:** पाँच ions वाले trapped-ion computer ने algorithm के ऐसे रूप से **15** के factors निकाले जो बड़े पैमाने के लिए बनाया गया था (Monz और साथी)।
- **बड़ी संख्याओं के दावे** आम तौर पर या तो Shor का algorithm चलाते ही नहीं (वे annealing या variational तरीके इस्तेमाल करते हैं, जिनका कोई साबित speed-up नहीं है), या ऐसे circuits इस्तेमाल करते हैं जो **जाने हुए जवाब की मदद से सरल किए गए** हैं। 2013 में Smolin, Smith और Vargo ने दिखाया कि ऐसे shortcuts के साथ आप किसी भी संख्या को, चाहे कितनी भी बड़ी हो, दो qubits से "factor" कर सकते हैं, जो साबित करता है कि सारा काम shortcut ही कर रहा है।
- 2022 में एक team ने दावा किया कि एक hybrid तरीका 372 qubits से RSA-2048 तोड़ सकता है; विशेषज्ञों ने बताया कि इस तरीके के बड़े पैमाने पर चलने का कोई सबूत नहीं है, और इसे ख़तरा नहीं माना जाता।
- **21, 15 से कहीं कठिन है।** 2025 में Craig Gidney ने gates गिने: 21 के ईमानदार circuit को 15 वाले से **100 गुना** से ज़्यादा entangling gates चाहिए, क्योंकि 15 = 2⁴ − 1 होने से उसके गुणा असामान्य रूप से सस्ते हैं। "21 के factors" वाले प्रकाशित प्रयोगों ने shortcuts इस्तेमाल किए हैं।

तो आज तक किसी quantum computer ने Shor का algorithm किसी ऐसी संख्या पर नहीं चलाया जो जेब वाले calculator के लिए कठिन हो। यह इस बात का संकेत नहीं कि algorithm ग़लत है; यह संकेत है कि आज की noisy machines और fault-tolerant machines के बीच फ़ासला कितना बड़ा है।

## ईमानदार स्थिति और समय-रेखा

- **अनुमान घटते जा रहे हैं।** 2012 में Fowler और साथियों ने अनुमान लगाया कि 2048-bit संख्या के factors निकालने में लगभग **एक अरब** physical qubits और लगभग एक दिन लगेगा। 2019 में Gidney और Ekerå ने इसे लगभग **2 करोड़** qubits और 8 घंटे पर ला दिया। 2025 में Gidney ने 0.1% gate errors मानकर **दस लाख से कम** qubits और **एक हफ़्ते से कम** का अनुमान लगाया (पाठ 35)।
- **Hardware उससे बहुत दूर है।** आज की सबसे बड़ी machines में लगभग एक हज़ार physical qubits हैं (neutral-atom arrays में कुछ हज़ार फँसाए गए atoms), और error correction ने threshold से नीचे अभी-अभी काम करना शुरू किया है (पाठ 35)।
- **तारीख़ किसी को नहीं पता।** विशेषज्ञ सर्वेक्षण अपने अनुमान अगले एक-दो दशकों में फैलाते हैं। लेकिन आज encrypt किया गया data अभी record करके बाद में decrypt किया जा सकता है (**harvest now, decrypt later**), और आज लगाए गए devices तब भी चल रहे होंगे।
- **इसीलिए बदलाव शुरू हो चुका है।** NIST की योजना RSA और elliptic-curve cryptography को 2030 तक deprecate और 2035 तक पूरी तरह बंद करने की है, post-quantum cryptography के पक्ष में (पाठ 43)। AES-256 जैसे symmetric ciphers और hash functions Grover के algorithm (पाठ 24) से सिर्फ़ कमज़ोर होते हैं, और सुरक्षित रहते हैं।

## ख़ुद आज़माएँ

1. p = 5, q = 11 और e = 3 के साथ छोटा RSA: N, φ और d निकालें। m = 2 को encrypt करें, फिर decrypt करें।
2. a = 2 से N = 21 के factors हाथ से निकालें: घातें लिखें, r ढूँढें, और दोनों gcd निकालें।
3. क्या N = 15 के लिए a = 4 काम करता है? क़दम दिखाएँ।
4. N = 35 और a = 2 के लिए order r = 12 है। Factors निकालें।
5. N = 15 के run में नतीजा 128 अनुमान r = 2 देता है। यह ग़लत क्यों है, और आपको कैसे पता चलेगा?
6. Continued fractions से नतीजे k = 853 (t = 10, N = 21 के साथ) को r के अनुमान में बदलें।
7. a का N के साथ कोई साझा factor क्यों नहीं होना चाहिए? दो कारण दें।
8. RSA key का आकार 2048 से 4096 bits करने पर: Shor के algorithm के लिए यह मोटे तौर पर कितना कठिन होता है, और number field sieve के लिए?

**जवाब:**

1. N = **55**, φ = 4 × 10 = **40**, d = **27** (3 × 27 = 81 = 2 × 40 + 1)। Encrypt: 2³ mod 55 = **8**। Decrypt: 8²⁷ mod 55 = **2**।
2. mod 21 में 2 की घातें: 1, 2, 4, 8, 16, 11, 1, तो r = **6**। 2³ = 8; gcd(7, 21) = **7** और gcd(9, 21) = **3**।
3. **हाँ।** 4¹ = 4 और 4² = 16 ≡ 1, तो r = 2। a^(r/2) = 4, जो −1 (यानी 14) नहीं है। gcd(3, 15) = **3** और gcd(5, 15) = **5**।
4. 2⁶ mod 35 = 64 − 35 = 29। gcd(28, 35) = **7** और gcd(30, 35) = **5**।
5. नतीजा s = 2 से आया, जिसका r = 4 के साथ साझा factor है, इसलिए s/r = 2/4 घटकर 1/2 हो गया। जाँच 7² mod 15 = 4 ≠ 1 दिखाती है कि 2 order नहीं है। फिर चलाएँ, या 2 के गुणज आज़माएँ।
6. 853/1024 ≈ 0.833, और 21 से अनधिक हर वाली सबसे क़रीबी भिन्न **5/6** है, तो r = **6**।
7. अगर gcd(a, N) > 1, तो gcd ख़ुद ही एक factor है, तो करने को कुछ बचा नहीं। साथ ही, तब a से गुणा उलटा नहीं जा सकता (दो inputs एक ही output देते), इसलिए U unitary नहीं होता और quantum gate नहीं बन सकता।
8. Shor की लागत n³ की तरह बढ़ती है, तो लगभग 2³ = **8 गुना** ज़्यादा काम। Sieve की लागत लगभग **10¹²** गुना बढ़ती है (table में लगभग 10³⁵ से 10⁴⁷)।

## सार-पत्रक

| विचार | सूत्र या तथ्य |
|---|---|
| RSA | N = pq सार्वजनिक; d = e⁻¹ mod (p − 1)(q − 1) के लिए factors चाहिए |
| Classical factoring | Number field sieve: super-polynomial; record RSA-250 (829 bits, 2020) |
| Order | a^r ≡ 1 (mod N) वाला सबसे छोटा r > 0 |
| r से factors | अगर r सम है और a^(r/2) ≢ −1: gcd(a^(r/2) ± 1, N) |
| a के काम करने की संभावना | विषम N के लिए जो prime की घात नहीं, कम से कम ½ |
| Quantum क़दम | Order finding, इकलौता क़दम जिसे quantum computer चाहिए |
| Unitary | U\|y⟩ = \|ay mod N⟩, basis states का permutation |
| Eigenphases | s/r, s = 0 … r − 1 के लिए; \|1⟩ सभी eigenstates का बराबर मिश्रण |
| Controlled घातें | U^(2ᵏ) = a^(2ᵏ) mod N से गुणा, बार-बार वर्ग करके |
| Counting qubits | t ≈ 2n, ताकि 2ᵗ ≥ N² और continued fractions काम करें |
| Continued fractions | k/2ᵗ के सबसे क़रीब s/r जिसमें r ≤ N; runs को lcm से जोड़ें |
| लागत | लगभग 2n + 3 logical qubits; ~n³ gates (modular arithmetic हावी) |
| Discrete log | यह भी टूटता है: Diffie–Hellman और elliptic curves (256-bit के लिए ~2,330 logical qubits) |
| Hardware runs | ईमानदारी से सिर्फ़ 15; 21 को 100× ज़्यादा entangling gates चाहिए |
| RSA-2048 अनुमान | ~1 अरब qubits (2012) → ~2 करोड़ (2019) → दस लाख से कम, एक हफ़्ते से कम (2025) |
| बचाव | Post-quantum cryptography (पाठ 43); AES-256 सुरक्षित रहता है |
