---
layout: ../../../layouts/Post.astro
lang: hi
title: "Post-quantum cryptography"
description: "Shor के algorithm का दूसरा जवाब: नई public-key cryptography जो साधारण computers पर चलती है लेकिन quantum हमलों का विरोध करती है। Quantum computers क्या तोड़ते हैं और क्या नहीं, कब क़दम उठाना है यह तय करने के लिए Mosca की असमानता, learning with errors (एक चलती toy encryption योजना और errors क्यों मायने रखते हैं), hash-आधारित signatures (एक Lamport signature जिसे आप चला सकते हैं), 2024 के NIST मानक और उनके आकार, टूटे उम्मीदवारों के सबक़, और बदलाव कैसे हो रहा है, embedded devices समेत।"
date: 2026-11-04
category: lesson
lesson: 43
---

पाठ 28 ने दिखाया कि Shor का algorithm RSA और elliptic-curve cryptography तोड़ देगा, वे public-key systems जो websites, messaging apps, software updates, bank transfers और smart cards को सुरक्षित रखते हैं। पाठ 41 ने एक जवाब दिखाया, QKD, जो physics इस्तेमाल करता है लेकिन ख़ास hardware चाहता है और दूरी से सीमित है।

यह पाठ उस जवाब के बारे में है जो लगभग सबकी रक्षा करेगा: **post-quantum cryptography (PQC)**। यह साधारण software है, साधारण computers और phones पर चलता, ऐसे गणितीय सवालों पर आधारित जिन्हें कोई ज्ञात quantum (या classical) algorithm कुशलता से हल नहीं कर सकता। 2024 में US National Institute of Standards and Technology (NIST) ने पहले PQC मानक प्रकाशित किए, और इतिहास का सबसे बड़ा cryptographic बदलाव अब चल रहा है। आप देखेंगे कि क्या टूटा है और क्या नहीं, दो मुख्य विचारों के toy रूप बनाएँगे, और सीखेंगे कि बदलाव कैसे संभाला जा रहा है।

## Quantum computers क्या तोड़ते हैं, और क्या नहीं

| Cryptography | किसके लिए | Quantum हमला | स्थिति |
|---|---|---|---|
| RSA | Key exchange, signatures, certificates | Shor (factoring) | बड़े quantum computer से **टूटा** |
| Elliptic curves (ECDH, ECDSA, Ed25519) | Key exchange, signatures, cryptocurrencies | Shor (discrete logarithm) | **टूटा**, और RSA से कम qubits चाहिए |
| Diffie–Hellman (finite field) | Key exchange | Shor | **टूटा** |
| AES और दूसरे symmetric ciphers | बड़े पैमाने का encryption | Grover (quadratic speed-up) | कमज़ोर: लंबी सुरक्षा के लिए 256-bit keys |
| SHA-2, SHA-3 hash functions | Integrity, signatures, passwords | Grover | 256-bit outputs के साथ ठीक |

इस table से दो सबक़। पहला, ख़तरा **public-key** cryptography में केंद्रित है, जो ठीक वही है जिसे बदलना है। दूसरा, symmetric cryptography बचती है: Grover सिर्फ़ square-root speed-up देता है (पाठ 24), और बुरी तरह parallel होता है, तो AES-256 सुरक्षित रहता है, और कई विशेषज्ञ AES-128 को भी व्यवहार में काफ़ी मानते हैं।

## कब चिंता करें? Mosca की असमानता

कोई नहीं जानता कि **cryptographically relevant quantum computer** (CRQC) कब होगा। पाठ 35 ने RSA-2048 के लिए दस लाख से कम physical qubits के अनुमान दिखाए, तो यह engineering का सवाल है, सिद्धांत का नहीं। Michele Mosca ने यह तय करने का सरल तरीका सुझाया कि अभी क़दम उठाना है या नहीं। मान लें:

- **x** = आपके data को कितने साल secret रहना है (उसकी "shelf life"),
- **y** = आपके systems को PQC पर ले जाने में कितने साल लगेंगे,
- **z** = CRQC बनने में कितने साल।

अगर **x + y > z**, तो आप अपने कुछ data के लिए पहले ही देर कर चुके हैं: कोई दुश्मन उसे अभी record करके, उसके बेमानी होने से पहले decrypt कर सकता है।

```python
def mosca(shelf_life, migration_time, years_to_quantum_threat):
    """Mosca's inequality: if x + y > z, data encrypted today will still be secret when it can be broken."""
    x, y, z = shelf_life, migration_time, years_to_quantum_threat
    return "AT RISK" if x + y > z else "ok"

cases = [("chat messages", 1, 3), ("bank records", 10, 5), ("medical records", 30, 5),
         ("smart meter (device lifetime)", 20, 8), ("national security secrets", 50, 10)]
print("data                         must stay secret   migration   threat in 10 yrs   threat in 15 yrs")
for name, x, y in cases:
    print(f"{name:29s} {x:6d} years      {y:3d} years       {mosca(x, y, 10):8s}           {mosca(x, y, 15)}")
```

```text
data                         must stay secret   migration   threat in 10 yrs   threat in 15 yrs
chat messages                      1 years        3 years       ok                 ok
bank records                      10 years        5 years       AT RISK            ok
medical records                   30 years        5 years       AT RISK            AT RISK
smart meter (device lifetime)     20 years        8 years       AT RISK            AT RISK
national security secrets         50 years       10 years       AT RISK            AT RISK
```

15 साल के आशावादी क्षितिज पर भी लंबा चलने वाला सब कुछ जोखिम में है। Devices एक अहम मामला हैं: आज लगाया smart meter, car, satellite या industrial controller 15 से 25 साल चल सकता है, और उसकी keys और firmware-signing योजना को पूरे जीवन भरोसेमंद रहना है। Field में cryptography बदलना web browser से कहीं कठिन है। इसीलिए सरकारें अब पक्की समय-सीमाएँ तय कर रही हैं: NIST, RSA और elliptic-curve cryptography को 2030 तक पुराना घोषित (deprecate) और 2035 तक प्रतिबंधित करने की योजना रखता है, और US NSA का CNSA 2.0 उसी समय-सीमा में national security systems में quantum-प्रतिरोधी algorithms माँगता है।

## PQC के मुख्य परिवार

हर PQC योजना ऐसे सवाल पर टिकी है जो quantum computers के लिए भी कठिन माना जाता है। मुख्य परिवार:

| परिवार | कठिन सवाल | उदाहरण | टिप्पणी |
|---|---|---|---|
| **Lattice-आधारित** | Lattices पर learning with errors (LWE) और संबंधित सवाल | ML-KEM (Kyber), ML-DSA (Dilithium), FN-DSA (Falcon) | तेज़, मध्यम आकार; मुख्य workhorse |
| **Hash-आधारित** | सिर्फ़ hash function की सुरक्षा | SLH-DSA (SPHINCS+), XMSS, LMS | बहुत रूढ़िवादी; सिर्फ़ signatures; बड़े या stateful |
| **Code-आधारित** | Random error-correcting codes को decode करना | Classic McEliece, HQC | लंबा इतिहास (1978); बड़ी keys (McEliece) |
| **Multivariate** | Quadratic समीकरणों के systems हल करना | (Rainbow, 2022 में टूटा) | छोटे signatures, लेकिन परेशान रिकॉर्ड |
| **Isogeny-आधारित** | Elliptic curves के बीच maps | (SIKE, 2022 में टूटा) | बहुत छोटी keys, लेकिन अग्रणी उम्मीदवार गिर गया |

## Learning with errors

सबसे अहम परिवार एक ख़ूबसूरती से सरल सवाल पर बना है। एक secret vector **s** लो। कई random vectors **a** प्रकाशित करो, हर एक के साथ **a·s** (mod q) का मान, लेकिन हर एक में एक **छोटा random error** e जोड़कर:

> b = a·s + e  (mod q)

Errors के बिना कोई भी school-स्तर के linear algebra (Gaussian elimination) से **s** निकाल लेता। Errors के साथ **s** ढूँढना **learning with errors (LWE)** सवाल बन जाता है, जिसे Oded Regev ने 2005 में पेश किया (इसके लिए उन्हें 2018 में Gödel Prize मिला)। Regev ने दिखाया कि LWE हल करना कम से कम lattices पर कुछ सबसे बुरे-मामले के सवालों जितना कठिन है, जो classical और quantum दोनों algorithms की दशकों की कोशिशों के सामने टिके हैं।

यहाँ Regev की encryption योजना का एक चलता toy रूप है। Public key (A, b) है; एक bit encrypt करने के लिए public नमूनों का एक random उपसमूह जोड़ो और 1 के लिए q/2 खिसकाओ। जो **s** जानता है वह उसे घटा सकता है, सिर्फ़ एक छोटा error और 0 या q/2 छोड़ते हुए:

```python
import numpy as np
rng = np.random.default_rng(43)

n, m, q = 16, 40, 257                     # secret length, number of samples, modulus (toy sizes)
A = rng.integers(0, q, size=(m, n))       # public random matrix
s = rng.integers(0, q, size=n)            # the secret key
e = rng.integers(-2, 3, size=m)           # small random errors: -2..2
b = (A @ s + e) % q                       # public key: (A, b). Without e, this would be easy to solve.

def encrypt(bit):
    r = rng.integers(0, 2, size=m)        # pick a random subset of the public samples
    return (r @ A) % q, (r @ b + bit * (q // 2)) % q

def decrypt(u, v):
    x = (v - u @ s) % q                   # = (r·e + bit·q/2) mod q: near 0 means 0, near q/2 means 1
    return int(q // 4 < x < 3 * q // 4)

message = [1, 0, 1, 1, 0, 0, 1, 0]
print("sent:     ", message)
print("decrypted:", [decrypt(*encrypt(bit)) for bit in message])

def solve_mod(M, y, p):
    """Solve M·x = y (mod p) by Gaussian elimination, using the first n equations."""
    M, y = M[:n].copy() % p, y[:n].copy() % p
    for col in range(n):
        piv = next(r for r in range(col, n) if M[r, col] % p)
        M[[col, piv]], y[[col, piv]] = M[[piv, col]], y[[piv, col]]
        inv = pow(int(M[col, col]), -1, p)
        M[col], y[col] = (M[col] * inv) % p, (y[col] * inv) % p
        for r in range(n):
            if r != col and M[r, col]:
                f = M[r, col]
                M[r], y[r] = (M[r] - f * M[col]) % p, (y[r] - f * y[col]) % p
    return y

print("attack with NO errors (b = A·s):  recovered the secret?", np.array_equal(solve_mod(A, (A @ s) % q, q), s))
print("attack on the real key (with errors): recovered the secret?", np.array_equal(solve_mod(A, b, q), s))
```

```text
sent:      [1, 0, 1, 1, 0, 0, 1, 0]
decrypted: [1, 0, 1, 1, 0, 0, 1, 0]
attack with NO errors (b = A·s):  recovered the secret? True
attack on the real key (with errors): recovered the secret? False
```

संदेश सही decrypt होता है, क्योंकि जमा error q/4 से कहीं छोटा है। आख़िरी दो पंक्तियाँ दिखाती हैं कि errors ही असली बात क्यों हैं: सटीक समीकरणों के साथ Gaussian elimination तुरंत secret निकाल लेता है; छोटे errors जोड़ने पर वही हमला बकवास देता है। (ये toy आकार सुरक्षित होने के लिए बहुत छोटे हैं; lattice-reduction हमला इन्हें आसानी से तोड़ देगा।)

असली मानक, **ML-KEM** (पहले Kyber), वही विचार दक्षता के लिए ढाँचे के साथ इस्तेमाल करता है: q = 3329 modulo 256 coefficients वाले **polynomials** के vectors ("module LWE"), जो keys छोटी और operations तेज़ बनाता है, number-theoretic transform (FFT का रिश्तेदार) इस्तेमाल करके। यह एक **key encapsulation mechanism** (KEM) है: संदेशों को सीधे encrypt करने के बजाय यह सुरक्षित रूप से एक साझा secret key बनाता है, जो फिर AES चलाती है।

## Hash-आधारित signatures

सबसे रूढ़िवादी signatures सिर्फ़ hash function के उलटने में कठिन होने पर टिके हैं, वह एक मान्यता जिस पर पूरी cryptography पहले से निर्भर है। विचार 1979 में Leslie Lamport तक जाता है। संदेश के hash के 256 bits में से हर एक के लिए दो random secrets रखो; उनके hashes को public key के रूप में प्रकाशित करो। Sign करने के लिए हर जोड़ी से एक secret खोलो, hash bits के हिसाब से चुना। कोई भी खोले गए secrets को public hashes से जाँच सकता है:

```python
import hashlib, random

H = lambda data: hashlib.sha256(data).digest()
rnd = random.Random(1979)                 # demo only; real keys come from the secrets module

# Key generation: 256 pairs of random secrets; the public key is their hashes
secret = [[rnd.randbytes(32) for _ in range(2)] for _ in range(256)]
public = [[H(x) for x in pair] for pair in secret]

def bits(message):
    d = int.from_bytes(H(message), "big")
    return [(d >> (255 - i)) & 1 for i in range(256)]

def sign(message):                        # reveal one secret from each pair, chosen by the message's hash bits
    return [secret[i][b] for i, b in enumerate(bits(message))]

def verify(message, signature):
    return all(H(sig) == public[i][b] for i, (b, sig) in enumerate(zip(bits(message), signature)))

msg = b"Firmware v2.1, build 7f3a"
sig = sign(msg)
print("signature size:", sum(len(x) for x in sig), "bytes;  public key size:", 256 * 2 * 32, "bytes")
print("valid signature verifies:      ", verify(msg, sig))
print("tampered message is rejected:  ", not verify(b"Firmware v2.1, build 7f3b", sig))
```

```text
signature size: 8192 bytes;  public key size: 16384 bytes
valid signature verifies:       True
tampered message is rejected:   True
```

यह काम करता है, और इसकी सुरक्षा सिर्फ़ SHA-256 पर टिकी है। लेकिन दो समस्याएँ देखें: keys और signatures बड़े हैं (16 KB और 8 KB), और हर key **सिर्फ़ एक संदेश** sign कर सकती है, क्योंकि हर signature आधे secrets खोल देता है। दो अलग संदेशों पर sign करने से इतने secrets खुल जाएँगे कि दूसरे जाली बनाए जा सकें।

आधुनिक योजनाएँ इसे ठीक करती हैं। **XMSS** और **LMS** Merkle tree से कई one-time keys को एक public key के नीचे जोड़ते हैं, लेकिन उन्हें ध्यान से हिसाब रखना होता है कि कौन-सी keys इस्तेमाल हो चुकीं (वे **stateful** हैं: key दोबारा इस्तेमाल करना विनाशकारी है)। **SLH-DSA** (SPHINCS+) कहीं बड़ा ढाँचा बनाता है जो state की ज़रूरत हटा देता है, लगभग 8 से 50 KB के signatures की क़ीमत पर। क्योंकि उनकी सुरक्षा इतनी अच्छी तरह समझी गई है, stateful hash-आधारित signatures (LMS और XMSS) पहले ही **firmware signing** के लिए मंज़ूर हैं, जहाँ signatures कभी-कभार, नियंत्रित माहौल में बनते हैं, और कई devices पर जाँचे जाते हैं।

## NIST मानक

NIST ने एक खुली, विश्वव्यापी प्रतियोगिता चलाई। 2017 में 82 submissions आए, cryptographers ने सालों उन पर हमले किए, और बचे हुए मानक बने:

| मानक (2024) | आधार | उद्देश्य | Public key | Ciphertext या signature |
|---|---|---|---|---|
| FIPS 203: **ML-KEM-768** | Module lattices (Kyber) | Key बनाना | 1,184 bytes | 1,088 bytes |
| FIPS 204: **ML-DSA-65** | Module lattices (Dilithium) | Signatures | 1,952 bytes | 3,309 bytes |
| FIPS 205: **SLH-DSA-128s** | Hash functions (SPHINCS+) | Signatures | 32 bytes | 7,856 bytes |
| FN-DSA-512 (मानक बन रहा है) | NTRU lattices (Falcon) | छोटे signatures | 897 bytes | 666 bytes |
| तुलना के लिए: X25519 | Elliptic curve | Key exchange | 32 bytes | 32 bytes |
| तुलना के लिए: RSA-2048 | Factoring | Key exchange या signatures | 256 bytes | 256 bytes |

मार्च 2025 में NIST ने ML-KEM के backup के रूप में **HQC**, एक code-आधारित KEM, भी चुना, ताकि lattices के ख़िलाफ़ कोई गणितीय सफलता दुनिया को बिना मानक के न छोड़ दे।

Table से समझौता साफ़ है: PQC तेज़ है (ML-KEM अक्सर elliptic curves से तेज़ है), लेकिन keys और signatures मोटे तौर पर **10 से 100 गुना बड़े** हैं। यह network packets, certificates, smart cards और छोटे embedded devices के लिए मायने रखता है।

## टूटे उम्मीदवारों के सबक़

आख़िरी चरणों तक पहुँची दो योजनाएँ 2022 में टूटीं, और वे सिखाने वाली हैं:

- **SIKE** (isogeny-आधारित), बेहद छोटी keys वाला finalist, Wouter Castryck और Thomas Decru ने एक classical algorithm से तोड़ा जिसने एक laptop core पर लगभग एक घंटे में keys निकाल लीं।
- **Rainbow** (multivariate), एक signature finalist, Ward Beullens ने ऐसे हमले से तोड़ा जिसमें laptop पर लगभग एक weekend लगा।

किसी भी हमले में quantum computer इस्तेमाल नहीं हुआ। सबक़: नई cryptographic मान्यताओं को सालों की सार्वजनिक जाँच चाहिए, इसीलिए मानक lattices (1990 के दशक से अध्ययन) और hash functions को पसंद करते हैं, और इसीलिए बदलाव के दौरान **hybrid** योजनाएँ इस्तेमाल होती हैं।

## बदलाव कैसे हो रहा है

**Hybrid key exchange।** ज़्यादातर शुरुआती तैनातियाँ एक classical और एक PQC algorithm मिलाती हैं, ताकि connection तब तक सुरक्षित रहे जब तक **कोई भी** एक टिका रहे। Chrome, Firefox और Cloudflare, TLS में hybrid X25519 + ML-KEM-768 key exchange का समर्थन करते हैं, और 2025 तक Cloudflare से गुज़रने वाले web traffic का बड़ा हिस्सा इसी तरह सुरक्षित था। Signal ने 2023 में post-quantum key agreement (PQXDH) जोड़ा, Apple का iMessage 2024 में अपने PQ3 protocol पर गया, और OpenSSH ने 2025 में hybrid ML-KEM key exchange को अपना default बनाया।

**Signatures अगले हैं।** Key exchange harvest-now-decrypt-later की वजह से ज़रूरी था। Signatures को सिर्फ़ CRQC बनने से पहले quantum-सुरक्षित होना है, लेकिन certificate ढाँचा धीरे बदलता है, और बड़े signatures protocols पर दबाव डालते हैं, तो काम अभी हो रहा है।

**Crypto agility।** संस्थाएँ **सूची** बना रही हैं कि वे public-key cryptography कहाँ इस्तेमाल करती हैं, और systems को ऐसे फिर से design कर रही हैं कि सब कुछ फिर बनाए बिना algorithms बदले जा सकें।

## Embedded devices पर PQC

Microcontrollers पर काम करने वाले engineers के लिए PQC ख़ास चुनौतियाँ और अवसर लाता है:

- **Performance ठीक है।** Arm Cortex-M4 पर optimised ML-KEM-768 हर operation मोटे तौर पर दस लाख cycles या कम में चलाता है, आम clock speeds पर कुछ milliseconds; **pqm4** जैसी open-source परियोजनाएँ ठीक इसी क़िस्म की chip पर कई योजनाओं का benchmark करती हैं।
- **Memory बाधा है।** कुछ kilobytes की keys, signatures और working buffers, दसियों kilobytes RAM वाले devices पर बड़े हैं, और कम-bandwidth links (metering networks, LoRa, NB-IoT) पर 3 KB signature में कई packets लग सकते हैं।
- **Secure boot और firmware updates** क़दम उठाने की पहली जगह हैं, क्योंकि जो device भविष्य का update जाँच नहीं सकता उसे ठीक नहीं किया जा सकता। Firmware signing के लिए LMS या XMSS (stateful hash-आधारित) signatures की सलाह है, और उन्हें जाँचना हल्का है।
- **Side channels** मायने रखते हैं: PQC implementations पर timing और power analysis हमले सक्रिय research क्षेत्र हैं, तो हाथ से लिखे code के बजाय constant-time, मज़बूत libraries इस्तेमाल होनी चाहिए।
- **लंबे field जीवन** Mosca की असमानता को सबसे तेज़ चुभाते हैं: आज भेजे गए devices crypto-agile होने चाहिए, over the air नए algorithms पा सकने वाले।

## QKD और PQC साथ में

PQC लगभग सब कुछ सस्ते में, मौजूदा hardware पर, सुरक्षित करता है, लेकिन गणितीय मान्यताओं पर निर्भर है। QKD (पाठ 41) physics पर निर्भर है, लेकिन समर्पित hardware चाहता है और दूरी से सीमित है। ज़्यादातर सुरक्षा agencies PQC को मुख्य बचाव मानती हैं, और QKD पर ख़ास उच्च-सुरक्षा links के लिए विचार करती हैं। कोई भी quantum computers के आने का इंतज़ार नहीं कर रहा: बदलाव अभी हो रहा है।

## आज़माकर देखें

1. इनमें से Shor का algorithm किसे तोड़ता है: AES-256, RSA-4096, ECDSA, SHA-256?
2. एक company की design files को 12 साल secret रहना है, और बदलाव में 4 साल लगेंगे। अगर CRQC 14 साल में आए, तो क्या Mosca की असमानता कहती है कि वे जोखिम में हैं?
3. LWE toy योजना में errors e के बिना योजना बेकार क्यों होती?
4. Errors जोड़ने के बावजूद decryption फिर भी काम क्यों करता है?
5. Lamport key सिर्फ़ एक संदेश sign क्यों कर सकती है?
6. ML-DSA-65 signature, ECDSA P-256 signature (64 bytes) से मोटे तौर पर कितना बड़ा है?
7. Hybrid key exchange क्या है, और बदलाव के दौरान यह क्यों इस्तेमाल होता है?

**जवाब:**

1. **RSA-4096** और **ECDSA**। AES-256 और SHA-256 Grover से सिर्फ़ कमज़ोर होते हैं, और इन आकारों पर सुरक्षित रहते हैं।
2. x + y = 12 + 4 = 16 > 14, तो **हाँ**, जोखिम में।
3. Errors के बिना b = A·s रैखिक समीकरणों का system है, और Gaussian elimination सीधे secret निकाल लेता है, जैसा code ने दिखाया।
4. Decrypt करने वाला v − u·s = r·e + bit·(q/2) निकालता है। क्योंकि r·e छोटे errors का जोड़ है, वह q/4 से दूर रहता है, तो 0 या q/2 में से निकटतम पर गोल करने से सही bit मिलता है।
5. हर signature 256 जोड़ियों में से हर एक का एक secret खोलता है। अलग संदेश पर दूसरा signature दूसरे secrets खोलता है, और हमलावर उन्हें मिलाकर नए संदेशों पर sign कर सकता है।
6. 3,309 / 64 ≈ **50 गुना** बड़ा।
7. यह एक classical algorithm (जैसे X25519) और एक PQC algorithm (जैसे ML-KEM) को मिलाता है ताकि नतीजा तब तक सुरक्षित रहे जब तक **कोई भी** एक न टूटे। यह harvest-now-decrypt-later से बचाता है और साथ ही नए algorithm में किसी अनजान ख़ामी से भी।

## सार-सूत्र

| विचार | सूत्र या तथ्य |
|---|---|
| Shor से टूटे | RSA, elliptic curves (ECDH, ECDSA, Ed25519), Diffie–Hellman |
| Grover से कमज़ोर | AES, SHA: 256-bit आकार इस्तेमाल करो |
| Mosca की असमानता | अगर shelf life + बदलाव का समय > CRQC तक का समय, तो अभी क़दम उठाओ |
| समय-सीमाएँ | NIST: RSA/ECC 2030 तक deprecate, 2035 तक प्रतिबंधित; NSA CNSA 2.0 मिलता-जुलता |
| LWE (Regev, 2005) | b = A·s + e (mod q); errors linear algebra को fail करते हैं |
| ML-KEM (FIPS 203) | Module-LWE KEM; q = 3329, 256-coefficient polynomials; pk 1,184 B (768) |
| ML-DSA (FIPS 204) | Lattice signatures; ML-DSA-65 sig 3,309 B |
| SLH-DSA (FIPS 205) | Stateless hash-आधारित signatures; छोटी keys, बड़े signatures |
| LMS, XMSS | Stateful hash-आधारित signatures; firmware signing |
| FN-DSA (Falcon) | छोटे lattice signatures; मानक बन रहा है |
| HQC (2025) | Code-आधारित backup KEM |
| 2022 में टूटे | SIKE (≈1 घंटा, laptop), Rainbow (≈एक weekend, laptop), दोनों classically |
| Hybrid | Classical + PQC साथ; कोई भी टिके तो सुरक्षित (X25519MLKEM768) |
| Embedded | काफ़ी तेज़; memory और bandwidth सीमाएँ; पहले secure boot; crypto agility |
