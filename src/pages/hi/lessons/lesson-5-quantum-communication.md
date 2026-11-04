---
layout: ../../../layouts/Post.astro
lang: hi
title: "क्वांटम कम्युनिकेशन और QKD"
description: "One-time pad, चलने वाले simulation के साथ BB84 कदम-दर-कदम, जासूस को पकड़ना, E91, दूरी की सीमाएँ और satellites, और QKD बनाम post-quantum cryptography।"
date: 2026-10-30
category: lesson
lesson: 5
slides: lesson-5
---

Shor algorithm (पाठ 11) आज के encryption को ख़तरे में डालता है। Quantum physics एक हल भी देती है: secret keys बाँटने का ऐसा तरीका जिसमें **कोई भी जासूसी निशान छोड़ती है**। यही quantum key distribution, QKD है।

## QKD कौन-सी समस्या हल करता है

**One-time pad** गणितीय रूप से अटूट है अगर key सच में random हो, message जितनी लंबी हो, और दोबारा इस्तेमाल न हो। कमज़ोरी है **key बाँटना**: रास्ते में कोई key copy कर ले तो सब ख़त्म।

RSA जैसे public-key तरीके बाँटने की समस्या हल करते हैं, लेकिन ऐसे गणित पर टिके हैं जिसे Shor तोड़ सकता है। QKD key **physics** से बाँटता है।

## Key बचाने वाले तीन नियम

1. **Measure करने से बदलाव:** qubit को देखना आमतौर पर उसे बदल देता है।
2. **No-cloning:** अनजान qubit copy नहीं हो सकता।
3. **ग़लत basis, random जवाब:** ग़लत basis में measure करें तो नतीजा सिक्का उछालने जैसा।

## दो bases

| Basis | Bit 0 | Bit 1 |
|---|---|---|
| **+** | horizontal → | vertical ↑ |
| **×** | diagonal ↗ | anti-diagonal ↖ |

उसी basis में measure करें जिसमें photon भेजा गया: सही bit। **दूसरे** basis में: 50/50 random।

## BB84, कदम-दर-कदम

Charles Bennett और Gilles Brassard, 1984।

1. **Alice भेजती है:** हर photon के लिए random bit और random basis।
2. **Bob measure करता है:** अपने random basis में। आधी बार Alice से मेल।
3. **Sifting:** public channel पर सिर्फ़ **bases** मिलाते हैं, bits कभी नहीं, और मेल वाली जगहें रखते हैं। लगभग आधे photons बचते हैं।
4. **Error जाँच:** बचे bits का random नमूना खोलकर मिलाते हैं।
5. **फ़ैसला:** कम error तो आगे बढ़ें। लगभग **11%** से ज़्यादा तो रोक दें: कोई सुन रहा था।
6. **सफ़ाई:** error correction और **privacy amplification** से key छोटी लेकिन पूरी तरह गुप्त।

## Eve को पकड़ना: 25% कहाँ से

Eve हर photon पकड़ती है, measure करती है और नया भेजती है।

- **आधी** बार वह ग़लत basis चुनती है।
- तब Bob (Alice के basis में) random bit पाता है: उनमें से **आधी** बार ग़लत।
- ½ × ½ = sifted key में **25% errors**।

## ख़ुद simulate करें

```python
import random
random.seed(7)

def bb84(n=2000, eve=False):
    a_bits  = [random.randint(0, 1) for _ in range(n)]
    a_bases = [random.choice("+x") for _ in range(n)]
    b_bases = [random.choice("+x") for _ in range(n)]
    received = []
    for bit, ab, bb in zip(a_bits, a_bases, b_bases):
        sent_bit, sent_basis = bit, ab
        if eve:                                   # पकड़ो और दोबारा भेजो
            eb = random.choice("+x")
            sent_bit = bit if eb == ab else random.randint(0, 1)
            sent_basis = eb
        received.append(sent_bit if bb == sent_basis else random.randint(0, 1))
    keep = [i for i in range(n) if a_bases[i] == b_bases[i]]
    errors = sum(a_bits[i] != received[i] for i in keep) / len(keep)
    return len(keep), round(errors, 3)

print("no Eve  :", bb84())
print("with Eve:", bb84(eve=True))
```

```text
no Eve  : (1027, 0.0)
with Eve: (985, 0.26)
```

लगभग आधे bits sifting में बचते हैं, और Eve की जासूसी ~25% errors के रूप में दिखती है, ठीक अनुमान के मुताबिक़।

## E91: entangled version

Artur Ekert, 1991। एक source **entangled pair** का एक-एक photon दोनों तरफ़ भेजता है। कुछ नतीजों पर **Bell test** से पता चलता है कि किसी ने छेड़छाड़ नहीं की।

## दूरी की समस्या

- Optical fibre लगभग **0.2 dB प्रति km** खोता है: 100 km के बाद ~1% photons पहुँचते हैं।
- Photons को measure किए बिना amplify नहीं किया जा सकता (no-cloning)।
- इसलिए fibre QKD **कुछ सौ km** तक जाता है। लंबी दूरी के लिए **trusted nodes** या भविष्य के **quantum repeaters**।

**Satellites:** चीन के **Micius** satellite से 2017 में **7,600 km** की QKD-सुरक्षित intercontinental video call हुई। भारत में **DRDO और IIT दिल्ली** ने fibre और free space पर QKD दिखाया है।

## QKD बनाम post-quantum cryptography

| | QKD | PQC |
|---|---|---|
| सुरक्षा का आधार | Physics के नियम | कठिन गणितीय समस्याएँ |
| हार्डवेयर | ख़ास photon sources और detectors | साधारण कंप्यूटर |
| दूरी | Trusted nodes के बिना सीमित | असीमित |
| स्थिति | शुरुआती networks | NIST standards 2024 में; लागू हो रहे हैं |

ज़्यादातर विशेषज्ञ **दोनों** की उम्मीद करते हैं: हर जगह PQC, सबसे ऊँची सुरक्षा वाले links पर QKD।

## असली दुनिया की सावधानी

QKD का *सिद्धांत* सुरक्षित है; असली *devices* लीक कर सकते हैं। Detectors और light sources पर हमले हुए हैं। Certified हार्डवेयर उतना ही ज़रूरी है जितनी physics।

## ख़ुद आज़माएँ

1. Simulation में Eve सिर्फ़ **आधे** photons पकड़े। कितनी error rate होनी चाहिए? जाँचें।
2. n को 20,000 करें। क्या error rate 0.25 के और पास आती है?
3. Fibre 0.2 dB/km खोता है। 50 km के बाद कितने photons बचते हैं? (10^(−0.2·50/10))

## सार

| शब्द | मतलब |
|---|---|
| One-time pad | Random, लंबी, एक बार की key हो तो अटूट |
| BB84 | Random bits + random bases, मेल वाले bases रखो |
| Sifted key | जहाँ Alice और Bob के bases मिले |
| Eve का निशान | हर photon measure करे तो ~25% errors |
| रोकने की सीमा | ~11% error (BB84) |
| E91 | Entangled pairs + Bell test |
| PQC | गणित-आधारित, quantum-प्रतिरोधी encryption |
