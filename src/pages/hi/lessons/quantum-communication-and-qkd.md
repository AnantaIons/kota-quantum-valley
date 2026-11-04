---
layout: ../../../layouts/Post.astro
lang: hi
title: "Quantum communication और QKD"
description: "Physics से सुरक्षित secret keys साझा करना। One-time pad और key दोबारा इस्तेमाल करना घातक क्यों है, असली qubits और एक जासूस के साथ BB84 simulate किया, 11% abort सीमा कहाँ से आती है, error correction और privacy amplification, decoy states, दूरी की सीमाएँ (हिसाब के साथ) और उनसे आगे जाने के रिकॉर्ड तोड़ तरीके, satellites, entanglement-आधारित और device-independent QKD, असली hardware पर हमले, और इस क्षेत्र में भारत का काम।"
date: 2026-11-04
category: lesson
lesson: 41
---

Shor का algorithm (पाठ 28) एक दिन वह public-key cryptography तोड़ देगा जो लगभग पूरे internet traffic की रक्षा करती है। और एक असहज मोड़ है: कोई दुश्मन encrypted traffic **आज** record करके उसे **बाद में** decrypt कर सकता है, जब बड़ा quantum computer बन जाए। यह "harvest now, decrypt later" ख़तरा बताता है कि जो राज़ दशकों तक राज़ रहने चाहिए, वे अभी से जोखिम में हैं।

इसके दो जवाब हैं। एक है नया गणित जिसे quantum computers तोड़ न सकें, **post-quantum cryptography** (पाठ 43)। दूसरा ख़ुद quantum physics इस्तेमाल करता है: **quantum key distribution (QKD)**, जहाँ दो पक्ष एक secret key साझा करते हैं, और quantum mechanics के नियम पक्का करते हैं कि कोई भी जासूसी पकड़ में आने लायक़ निशान छोड़े। यह पाठ QKD के बारे में है: यह कैसे काम करता है, क्यों सुरक्षित है, व्यवहार में इसे क्या सीमित करता है, और कहाँ लगाया जा रहा है।

## Perfect cipher, और उसकी कमज़ोर कड़ी

**One-time pad** एकमात्र encryption तरीका है जो साबित रूप से अटूट है। संदेश encrypt करने के लिए उसे bit-दर-bit (XOR) ऐसी key से मिलाओ जो सच में random हो, संदेश जितनी लंबी हो, और कभी दोबारा इस्तेमाल न हो। Key के बिना हर संभव संदेश बराबर संभावित है, तो ciphertext बिल्कुल कुछ नहीं बताता। यहाँ code में, और key दो बार इस्तेमाल करने पर क्या बिगड़ता है:

```python
import random

def xor(a: bytes, b: bytes) -> bytes:
    return bytes(x ^ y for x, y in zip(a, b))

m1, m2 = b"MEET AT KOTA 9AM", b"BRING THE QUBITS"
key = random.Random(1984).randbytes(len(m1))         # random, as long as the message (real use: the secrets module)

c1 = xor(m1, key)
print("ciphertext:", c1.hex())
print("decrypted: ", xor(c1, key).decode())

# The fatal mistake: reusing the key for a second message
c2 = xor(m2, key)
leak = xor(c1, c2)                                    # the key cancels out: this is m1 XOR m2
print("c1 XOR c2 == m1 XOR m2:", leak == xor(m1, m2))
print("if Eve guesses m1, she gets m2:", xor(leak, m1).decode())
```

```text
ciphertext: e87455097ddedddc3b0cd03f025b088a
decrypted:  MEET AT KOTA 9AM
c1 XOR c2 == m1 XOR m2: True
if Eve guesses m1, she gets m2: BRING THE QUBITS
```

एक बार इस्तेमाल हो तो pad perfect है। दो बार हो तो key कट जाती है: दोनों ciphertexts का XOR दोनों **संदेशों** का XOR देता है, और किसी एक का अंदाज़ा दूसरे को खोल देता है। (ठीक इसी ग़लती से Allied codebreakers Venona project में Soviet संदेश पढ़ पाए।)

तो one-time pad पूरी समस्या को **keys साझा करने** पर डाल देता है: आपको उतनी ही ताज़ा, secret, random key चाहिए जितना संदेश है, सुरक्षित पहुँचाई गई। Classically यह अव्यावहारिक है। QKD दो दूर की जगहों के बीच ऐसी keys उगाने का तरीका है, physics की गारंटी वाली सुरक्षा के साथ।

## Key की रक्षा करने वाले तीन quantum नियम

1. **Measure करना बदलता है।** Qubit measure करना आम तौर पर उसकी state बदल देता है (पाठ 8)।
2. **No-cloning।** अनजान quantum state copy नहीं हो सकती (पाठ 16), तो Eve एक copy रखकर मूल आगे नहीं भेज सकती।
3. **ग़लत basis, random जवाब।** Qubit को उस basis में measure करना जिसमें वह तैयार नहीं हुआ, random नतीजा देता है और मूल जानकारी नष्ट करता है।

Photons दो bases में bits ढो सकते हैं:

| Basis | Bit 0 | Bit 1 |
|---|---|---|
| **+** (rectilinear, Z) | Horizontal polarisation, \|0⟩ | Vertical, \|1⟩ |
| **×** (diagonal, X) | 45°, \|+⟩ | 135°, \|−⟩ |

एक ही basis में measure करने पर bit सही आता है। दूसरे basis में नतीजा सिक्का उछालना है।

## BB84, क़दम-दर-क़दम

Charles Bennett और Gilles Brassard ने 1984 में पहला QKD protocol प्रस्तावित किया (इस और संबंधित काम के लिए उन्होंने 2018 का Wolf Prize in Physics, 2023 का Breakthrough Prize, और 2025 में घोषित ACM Turing Award, computing का सर्वोच्च सम्मान, साझा किया)।

1. **Alice भेजती है।** हर photon के लिए वह एक random bit और एक random basis चुनती है, और मेल खाती state तैयार करती है।
2. **Bob measure करता है।** हर photon के लिए वह अपना random basis चुनता है। आधे समय वह Alice से मेल खाता है।
3. **Sifting।** एक साधारण public channel पर (जो **authenticated** होना चाहिए, ताकि Eve किसी पक्ष का भेस न धर सके) वे अपने **bases** बताते हैं, कभी bits नहीं, और सिर्फ़ वे जगहें रखते हैं जहाँ bases मेल खाए। लगभग आधे photons बचते हैं। यह **sifted key** है।
4. **Error का अनुमान।** वे sifted bits का एक random नमूना बताकर तुलना करते हैं। असहमत हिस्सा **quantum bit error rate (QBER)** है।
5. **फ़ैसला।** QBER बहुत ऊँचा हो तो वे रुक जाते हैं। कोई, या कुछ, दख़ल दे रहा है।
6. **Error correction और privacy amplification** बचे bits को एक छोटी, एक जैसी और पूरी तरह secret key में बदलते हैं।

## असली qubits से BB84 simulate करना

आइए Qiskit में असली qubits से protocol चलाएँ: Alice की तैयारी X और H gates के रूप में, Bob का basis चुनाव measurement से पहले एक H के रूप में, और एक जासूस जो कुछ photons पकड़कर random basis में measure करती है और जो देखा वह आगे भेज देती है (**intercept-resend attack**):

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

rng = np.random.default_rng(84)
sim = AerSimulator(seed_simulator=84)

def bb84(n_photons=2000, eve_fraction=0.0, batch=20):
    """Send n_photons qubits from Alice to Bob, batch at a time; Eve intercepts a fraction of them."""
    a_bit, a_basis, b_basis = (rng.integers(2, size=n_photons) for _ in range(3))   # basis 0 = Z (+), 1 = X (×)
    eve_on = rng.random(n_photons) < eve_fraction
    e_basis = rng.integers(2, size=n_photons)
    circuits = []
    for start in range(0, n_photons, batch):
        qc = QuantumCircuit(batch, 2 * batch)            # first half of the bits: Eve's notes; second half: Bob's
        for q in range(batch):
            i = start + q
            if a_bit[i]: qc.x(q)                         # Alice encodes her bit...
            if a_basis[i]: qc.h(q)                       # ...in her basis
            if eve_on[i]:                                # Eve measures in her own basis and resends what she saw
                if e_basis[i]: qc.h(q)
                qc.measure(q, q)
                if e_basis[i]: qc.h(q)
            if b_basis[i]: qc.h(q)                       # Bob measures in his basis
            qc.measure(q, batch + q)
        circuits.append(qc)
    results = sim.run(circuits, shots=1, memory=True).result()
    b_bit = np.concatenate([[int(c) for c in results.get_memory(k)[0][:batch][::-1]] for k in range(len(circuits))])
    keep = a_basis == b_basis                             # sifting: keep matching bases only
    return keep.sum(), np.mean(a_bit[keep] != b_bit[keep])

for f in [0.0, 0.5, 1.0]:
    kept, qber = bb84(eve_fraction=f)
    print(f"Eve intercepts {f:4.0%} of photons:  kept {kept} of 2000 after sifting,  error rate {qber:.3f}  (theory {f / 4:.3f})")
```

```text
Eve intercepts   0% of photons:  kept 975 of 2000 after sifting,  error rate 0.000  (theory 0.000)
Eve intercepts  50% of photons:  kept 996 of 2000 after sifting,  error rate 0.129  (theory 0.125)
Eve intercepts 100% of photons:  kept 1023 of 2000 after sifting,  error rate 0.235  (theory 0.250)
```

Eve के बिना sifted key में कोई error नहीं। जब Eve हर photon पकड़ती है, sifted bits का लगभग एक चौथाई ग़लत होता है। वजह: वह आधे समय ग़लत basis चुनती है, और तब वह ग़लत basis में photon आगे भेजती है, तो Bob का नतीजा (Alice के basis में) random है और उनमें से आधे समय ग़लत। ½ × ½ = **25%**। सिर्फ़ आधे photons पकड़ने से लगभग 12.5% आता है। Eve यह निशान छोड़े बिना कुछ नहीं सीख सकती।

## कच्चे bits से secret key तक

असली links में हमेशा कुछ errors होते हैं, अधूरे optics और detector noise से, Eve के बिना भी। क्योंकि Alice और Bob errors का स्रोत नहीं बता सकते, उन्हें सबसे बुरा मानना होता है: **सारे** errors Eve के हैं। फिर दो classical क़दम काम पूरा करते हैं:

- **Error correction।** Alice और Bob public channel पर parity जानकारी बदलकर अलग bits ढूँढते और ठीक करते हैं (Cascade या LDPC codes जैसे protocols)। इससे Eve को जानकारी मिलती है: हर key bit पर कम से कम h(Q) bits, जहाँ h binary entropy function है और Q QBER है।
- **Privacy amplification।** वे ठीक की गई key को random चुने hash function से दबाते हैं, उसे उतना सिकोड़ते हुए जितना Eve ज़्यादा से ज़्यादा जान सकती थी, जो BB84 के लिए भी हर key bit पर लगभग h(Q) bits है। इसके बाद अंतिम key के बारे में Eve की जानकारी नगण्य है। (गणित में bits पर एक random linear map, जैसे random binary matrix से गुणा, यह काम करता है।)

इससे sifted key का लगभग **1 − 2h(Q)** हिस्सा secret बचता है, जो Shor और Preskill ने 2000 में साबित किया:

```python
import numpy as np

def h(p):                                    # binary entropy: bits of uncertainty in a p-biased coin
    return 0.0 if p in (0, 1) else -p * np.log2(p) - (1 - p) * np.log2(1 - p)

print("error rate Q   secret bits per sifted bit, 1 - 2h(Q)")
for Q in [0.0, 0.01, 0.03, 0.05, 0.08, 0.10, 0.11, 0.12]:
    r = max(0.0, 1 - 2 * h(Q))
    print(f"   {Q:5.1%}        {r:.3f}")
```

```text
error rate Q   secret bits per sifted bit, 1 - 2h(Q)
    0.0%        1.000
    1.0%        0.838
    3.0%        0.611
    5.0%        0.427
    8.0%        0.196
   10.0%        0.062
   11.0%        0.000
   12.0%        0.000
```

1% error rate पर sifted bits का 84% secret key बनता है; 5% पर 43%; और लगभग **11%** पर दर शून्य पर पहुँचती है। उसके ऊपर Eve Bob जितना जान सकती है, और कोई secret key नहीं निकलती, तो protocol रुक जाता है। यही BB84 की मशहूर 11% सीमा का स्रोत है। ध्यान दें कि पूरा intercept-resend attack (25%) इससे बहुत ऊपर है।

## असली light sources और decoy states

Ideal BB84 single photons इस्तेमाल करता है, लेकिन व्यावहारिक systems बहुत कमज़ोर laser pulses इस्तेमाल करते हैं, औसतन हर pulse में एक से कम photon। कभी-कभी pulse में दो photons होते हैं, और Eve एक को अलग करके रख सकती है (**photon-number-splitting attack**), दूसरे photon को छेड़े बिना bit जान लेते हुए।

इलाज, **decoy-state तरीका** (Hwang, 2003; Lo, Ma और Chen, 2005), pulse की तीव्रता random रूप से बदलता है। Alice बाद में बताती है कि कौन-से pulses decoys थे, और अलग तीव्रताओं पर detection दरों की तुलना करके वह और Bob अनुमान लगा सकते हैं कि Bob को कितने single-photon pulses मिले, और इस तरह Eve की संभावित जानकारी की सीमा तय करते हैं। लगभग हर commercial QKD system decoy states इस्तेमाल करता है।

## दूरी की समस्या

Optical fibre प्रकाश सोखता है: सबसे अच्छी telecom wavelength (1550 nm) पर लगभग 0.2 dB प्रति kilometre, तो 100 km के बाद सिर्फ़ 1% photons पहुँचते हैं। Classical signals के उलट quantum signals को बस amplify नहीं किया जा सकता, क्योंकि amplifier को उन्हें copy करना पड़ता (no-cloning)। इस बीच detectors एक तय दर पर कभी-कभी झूठे clicks देते हैं (**dark counts**)। दूरी बढ़ने पर असली photons दुर्लभ होते जाते हैं जबकि dark counts नहीं, जब तक noise signal पर हावी न हो जाए।

एक बुनियादी सीमा भी है। 2017 में Pirandola, Laurenza, Ottaviani और Banchi ने साबित किया कि repeaters के बिना lossy channel पर **कोई भी** QKD protocol हर pulse पर −log₂(1 − η) secret bits से आगे नहीं जा सकता, जहाँ η channel का transmission है (**PLOB bound**, छोटे η पर लगभग 1.44η)। 1 GHz system के लिए उस सीमा की तुलना एक सरल BB84 अनुमान से करें:

```python
import numpy as np

def h(p):
    return 0.0 if p <= 0 or p >= 1 else -p * np.log2(p) - (1 - p) * np.log2(1 - p)

pulse_rate = 1e9          # 1 GHz source
mu = 0.5                  # average photons per pulse (weak laser pulses, with decoy states)
detector_eff = 0.8        # superconducting nanowire detectors
dark = 1e-6               # chance of a false click per pulse
misalign = 0.01           # 1% errors from imperfect optics

print("distance   fibre transmission   PLOB limit (bits/s)   BB84 estimate (bits/s)")
for km in [10, 50, 100, 150, 200, 250, 300]:
    eta = 10 ** (-0.2 * km / 10)                               # 0.2 dB per km of fibre
    plob = -np.log2(1 - eta)                                   # best possible without repeaters
    clicks = 1 - np.exp(-eta * detector_eff * mu) + dark       # chance Bob's detector clicks
    errors = (misalign * (1 - np.exp(-eta * detector_eff * mu)) + dark / 2) / clicks
    rate = 0.5 * clicks * max(0.0, 1 - 2 * h(errors))          # sifting keeps half; 1 - 2h(Q) per bit
    print(f"{km:5d} km      {eta:10.2e}          {pulse_rate * plob:10.3g}           {pulse_rate * rate:10.3g}")
```

```text
distance   fibre transmission   PLOB limit (bits/s)   BB84 estimate (bits/s)
   10 km        6.31e-01            1.44e+09             9.35e+07
   50 km        1.00e-01            1.52e+08             1.64e+07
  100 km        1.00e-02            1.45e+07             1.67e+06
  150 km        1.00e-03            1.44e+06             1.65e+05
  200 km        1.00e-04            1.44e+05             1.43e+04
  250 km        1.00e-05            1.44e+04                 30.7
  300 km        1.00e-06            1.44e+03                    0
```

दोनों हर 50 km fibre पर 10 गुना गिरते हैं, लेकिन फिर BB84 ढह जाता है: 250 km पर key दर लगभग 30 bits प्रति second, और 300 km पर शून्य, जब dark counts हावी हो जाते हैं। इसलिए व्यावहारिक fibre QKD लगभग 100 से 200 km तक अच्छा चलता है।

इससे आगे जाने के तीन तरीके:

- **Trusted nodes।** छोटे links को सुरक्षित relay stations से जोड़ो, जिनमें से हर एक key को decrypt करके फिर encrypt करता है। यह आज चलता है (चीन की Beijing–Shanghai backbone, 2,000 km से ज़्यादा, यही इस्तेमाल करती है) लेकिन हर node पर भरोसा करना होता है।
- **Twin-field QKD** (Lucamarini और साथी, 2018)। Alice और Bob दोनों बीच के station पर प्रकाश भेजते हैं, जो दोनों signals को interfere कराता है। Key दर η के बजाय √η की तरह चलती है, PLOB bound को हराते हुए। 2023 में एक चीनी team ने इससे **1,002 km** fibre पर keys बाँटीं, बहुत कम दर पर।
- **Quantum repeaters।** भविष्य के devices जो qubits measure किए बिना लंबी दूरियों पर entanglement बढ़ाते हैं (पाठ 42)।

## Satellites

अंतरिक्ष में photons सोखने को लगभग कुछ नहीं; ज़्यादातर loss वातावरण के आख़िरी कुछ kilometres में होता है। चीन के **Micius** satellite, 2016 में launch, ने 2017 में 1,200 km दूर ground stations तक entangled photons बाँटे, और satellite को trusted relay बनाकर Beijing और Vienna के बीच, 7,600 km दूर, QKD-सुरक्षित video call संभव की। Satellite QKD अब कई अंतरिक्ष agencies विकसित कर रही हैं, Europe और भारत समेत।

## Entanglement-आधारित और device-independent QKD

1991 में Artur Ekert ने **E91** प्रस्तावित किया: एक source entangled photon जोड़ियाँ बनाकर एक Alice को और एक Bob को भेजता है। मेल खाते bases में measure करना पूरी तरह correlated bits देता है। कुछ दूसरे measurements पर वे **Bell test** चलाते हैं (पाठ 15)। अगर CHSH मान 2√2 के पास है, तो जोड़ियाँ आपस में पूरी तरह entangled हैं, और entanglement की monogamy का मतलब है कि वे Eve से भी entangled नहीं हो सकतीं। सुरक्षा ख़ुद देखे गए correlations से आती है।

इस विचार को चरम तक ले जाएँ तो **device-independent QKD** मिलता है: ऐसी सुरक्षा जो इस पर भी भरोसे पर निर्भर नहीं कि devices अंदर कैसे काम करते हैं, सिर्फ़ Bell-inequality उल्लंघन देखने पर। इसे पहली बार 2022 में कई प्रयोगों में (trapped ions और neutral atoms के साथ) दिखाया गया, छोटी दूरियों और कम दरों पर।

## असली systems पर हमले

QKD के सुरक्षा प्रमाण ideal devices मानते हैं; असली devices में ख़ामियाँ होती हैं जिनका हमलावर फ़ायदा उठा सकता है। सबसे मशहूर उदाहरण **detector blinding** है (Lydersen और साथी, 2010): Bob के single-photon detectors में तेज़ प्रकाश डालकर हमलावर उन्हें classical detectors जैसा बना सकता है और तय कर सकता है कि कौन-सा click करे, error rate बढ़ाए बिना key चुराते हुए। Patch होने तक commercial systems कमज़ोर थे।

बचाव में सावधान engineering और certification शामिल हैं, और **measurement-device-independent (MDI) QKD** (Lo, Curty और Qi, 2012), जिसमें detectors एक अविश्वसनीय बीच के station पर होते हैं, तो उन पर हमलों से कुछ नहीं मिलता। इन व्यावहारिक चिंताओं के कारण कुछ सुरक्षा agencies (US NSA और UK का NCSC समेत) फ़िलहाल ज़्यादातर इस्तेमालों के लिए QKD के बजाय post-quantum cryptography की सलाह देती हैं, जबकि दूसरे (ख़ास तौर पर चीन और EU) QKD networks में भारी निवेश कर रहे हैं। संभावित भविष्य दोनों है: हर जगह PQC, और सबसे ऊँची, सबसे लंबी चलने वाली सुरक्षा वाले links के लिए QKD।

## भारत में QKD

2023 में मंज़ूर भारत के National Quantum Mission के मुख्य लक्ष्यों में सुरक्षित quantum communication शामिल है, जिसमें लगभग 2,000 km दूर ground stations के बीच satellite-आधारित links भी हैं। अब तक के प्रदर्शनों में Ahmedabad में ISRO का लगभग 300 metre का free-space QKD (2021), और Prayagraj और Vindhyachal के बीच DRDO और IIT Delhi का लगभग 100 km का fibre link (2022) शामिल हैं। भारतीय startups और C-DOT सरकारी और banking networks के लिए QKD products बना रहे हैं। पाठ 47 भारत के quantum ecosystem को और विस्तार से देखता है।

## QKD बनाम post-quantum cryptography

| | QKD | Post-quantum cryptography (पाठ 43) |
|---|---|---|
| सुरक्षा का आधार | Physics के नियम (और authenticated channel) | Quantum-सुरक्षित माने गए कठिन गणित के सवाल |
| Hardware | ख़ास photon sources, detectors, fibre या free-space links | साधारण computers और networks |
| दूरी | हर fibre link पर ≈ 100–200 km; trusted nodes या satellites से लंबी | असीमित |
| क्या देता है | सिर्फ़ key distribution | Key exchange और digital signatures |
| मुख्य जोखिम | Devices में implementation की ख़ामियाँ | नए गणितीय हमले |
| स्थिति | Metro और backbone networks, satellites | NIST मानक (2024), browsers और operating systems में लग रहे हैं |

## आज़माकर देखें

1. One-time pad key दोबारा इस्तेमाल करना जानकारी क्यों खोलता है, जबकि अकेला हर ciphertext पूरी तरह सुरक्षित है?
2. Sifting के लिए इस्तेमाल होने वाला public channel authenticated क्यों होना चाहिए?
3. Eve intercept-resend से 20% photons पकड़ती है। आप कितने QBER की उम्मीद करते हैं? क्या यह 11% से ऊपर है?
4. 1 − 2h(Q) से, Q = 3% पर sifted key का मोटे तौर पर कितना हिस्सा बचता है?
5. Decoy-state protocol किससे बचाता है?
6. Fibre 0.2 dB/km खोता है। 150 km के बाद photons का कितना हिस्सा बचता है?
7. Twin-field QKD, PLOB bound को कैसे हराता है, जो कहता है कि कोई repeaterless protocol नहीं हरा सकता?

**जवाब:**

1. दोनों ciphertexts का XOR key को काटकर m1 XOR m2 छोड़ता है। प्राकृतिक भाषा के संदेशों में ढाँचा होता है, तो एक संदेश का अंदाज़ा या आंशिक जानकारी दूसरे को खोल देती है।
2. वरना Eve Alice के सामने Bob और Bob के सामने Alice होने का नाटक कर सकती है (man-in-the-middle), हर एक के साथ अलग QKD sessions चलाकर सब पढ़ते हुए। QKD को शुरू करने के लिए एक छोटा साझा secret या authentication key चाहिए, फिर वह कहीं ज़्यादा key उगाता है।
3. 20% × 25% = **5%**, 11% सीमा से नीचे। Alice और Bob फिर भी key निकालेंगे, बस छोटी, क्योंकि privacy amplification वह हटा देता है जो Eve ने सीखा।
4. h(0.03) ≈ 0.194, तो 1 − 0.389 ≈ **61%**।
5. **Photon-number-splitting attack** से, जहाँ Eve multi-photon pulses से एक photon रख लेती है। Decoys Alice और Bob को single-photon हिस्से का अनुमान लगाने और Eve की जानकारी की सीमा तय करने देते हैं।
6. 10^(−0.2 × 150 / 10) = 10⁻³ = **0.1%**।
7. यह सामान्य अर्थ में repeaterless नहीं: बीच का station दोनों सिरों के signals interfere कराता है, तो हर photon सिर्फ़ आधी दूरी पार करता है। दर η के बजाय √η के साथ चलती है। (Channel के हर आधे हिस्से के लिए यह फिर भी सीमा का पालन करता है।)

## सार-सूत्र

| विचार | सूत्र या तथ्य |
|---|---|
| Harvest now, decrypt later | Record किया traffic quantum computers आने पर तोड़ा जा सकता है |
| One-time pad | Ciphertext = संदेश XOR key; key random, लंबी और एक बार हो तो perfect |
| BB84 (1984) | Random bases (Z या X) में random bits; मेल खाते bases रखो (sifting) |
| Intercept-resend | QBER = 25% × पकड़ा गया हिस्सा |
| Secret हिस्सा | 1 − 2h(Q) (Shor–Preskill); Q ≈ 11% पर शून्य |
| Post-processing | Error correction, फिर privacy amplification (random hashing) |
| Authenticated channel | Man-in-the-middle हमले रोकने के लिए ज़रूरी |
| Decoy states | बदलती pulse तीव्रता photon-number splitting को हराती है |
| Fibre loss | ≈ 0.2 dB/km; 100 km → 1%, 150 km → 0.1% |
| PLOB bound | Repeaters के बिना हर pulse पर ≤ −log₂(1 − η) ≈ 1.44η bits |
| Twin-field QKD | दर ∝ √η; 1,002 km fibre (2023) |
| Micius (2016–17) | 1,200 km पर entanglement; Beijing–Vienna call 7,600 km पर |
| E91 (1991) | Entangled जोड़ियाँ और Bell test |
| Device-independent QKD | सिर्फ़ Bell उल्लंघन से सुरक्षा; पहली बार 2022 में |
| Devices पर हमले | Detector blinding (2010); बचाव में MDI-QKD (2012) |
| भारत | NQM लक्ष्य; ISRO 300 m (2021); DRDO–IIT Delhi ≈ 100 km fibre (2022) |
