---
layout: ../../../layouts/Post.astro
lang: hi
title: "Bell inequalities और CHSH game"
description: "Einstein की आपत्ति, Bell का जवाब, और वह प्रयोग जिसने फ़ैसला किया: CHSH game, सबूत कि कोई classical रणनीति 75% से ज़्यादा नहीं जीतती, वह quantum रणनीति जो 85.4% जीतती है, CHSH नंबर 2√2, 2022 के Nobel Prize के पीछे के loophole-free tests, और आज Bell tests किस काम आते हैं।"
date: 2026-11-04
category: lesson
lesson: 15

---

पाठ 14 ने दिखाया कि Bell जोड़ी हर basis में correlated है, और तर्क दिया कि "साझा छिपी योजना" (जैसे लिफ़ाफ़ों में मेल खाते सिक्के) ऐसा नहीं कर सकती। लेकिन "नहीं कर सकती" एक अंदाज़ा था। शायद कोई चतुर छिपी योजना कर सके।

1964 में physicist John Bell ने इस अंदाज़े को एक **नंबर** में बदलने का तरीका ढूँढा, जिसे हर छिपी-योजना वाली theory को मानना ही होगा, और quantum mechanics उसे तोड़ती है। तब से प्रयोगों ने इसे और भी ध्यान से जाँचा है, और हर बार quantum mechanics जीती है। यह पाठ Bell के विचार को उसके सबसे साफ़ आधुनिक रूप में पेश करता है, **CHSH** नाम का एक सहयोगी खेल, और दोनों पक्ष सटीक रूप से निकालता है।

## वह तर्क जिसका जवाब Bell ने दिया

1935 में Einstein, Podolsky और Rosen (EPR) ने ऐसे तर्क दिया। एक entangled जोड़ी लो और दोनों आधे अलग करो। Alice का qubit 0/1 basis में measure करो, और Bob का 0/1 नतीजा पक्का बताया जा सकता है। Alice का +/− basis में measure करो, और Bob का +/− नतीजा पक्का बताया जा सकता है। Alice का चुनाव Bob के दूर के कण पर तुरंत असर नहीं डाल सकता। तो, उन्होंने कहा, Bob के कण के पास दोनों सवालों के तय जवाब **पहले से** होने चाहिए, और quantum mechanics, जो कहती है कि नहीं हैं, अधूरी है।

EPR की स्थिति को **local realism** कहते हैं:

- **Realism:** measurement के नतीजे कणों के साथ चलने वाले गुणों से तय होते हैं (जिन्हें अक्सर **hidden variables** कहते हैं), लिफ़ाफ़ों में सिक्कों के faces की तरह।
- **Locality:** Alice की lab में जो होता है वह Bob के नतीजों पर तुरंत असर नहीं डाल सकता।

30 साल तक यह दर्शन जैसा लगा: जो प्रयोग हुए थे, उनके लिए दोनों विचार एक ही नतीजे बताते थे। Bell ने ऐसा प्रयोग ढूँढा जिसमें दोनों अलग हैं।

## CHSH game

यह रहा खेल, Clauser, Horne, Shimony और Holt के नाम पर, जिन्होंने 1969 में Bell का विचार निखारा।

- एक referee Alice को random bit **x** और Bob को random bit **y** देता है।
- Alice को bit **a** से जवाब देना है, और Bob को bit **b** से। खेल शुरू होने के बाद वे बात नहीं कर सकते (अलग कमरों में हैं, या किलोमीटर दूर)।
- वे **जीतते** हैं अगर a ⊕ b = x ∧ y। शब्दों में: उनके जवाब **एक जैसे** होने चाहिए, सिवाय तब जब दोनों सवाल 1 हों, तब जवाब **अलग** होने चाहिए।

| सवाल (x, y) | जीत अगर |
|---|---|
| (0, 0) | a = b |
| (0, 1) | a = b |
| (1, 0) | a = b |
| (1, 1) | a ≠ b |

खेल से पहले Alice और Bob कोई भी रणनीति तय कर सकते हैं, और कुछ भी साझा कर सकते हैं: random numbers, निर्देशों की किताब, लिफ़ाफ़ों में मेल खाते सिक्के। यह साझा सामग्री hidden variables की भूमिका निभाती है।

## Classical सीमा: 75%

**आसान रणनीति:** दोनों हमेशा 0 जवाब दें। तब हर round में a = b, तो पहले तीन case जीतते हैं और (1, 1) हारते हैं। Random सवालों के साथ हर case बराबर संभव है, तो वे **75%** बार जीतते हैं।

क्या इससे बेहतर हो सकता है? कोई भी classical रणनीति, कितनी भी चतुर हो, इतनी ही है: साझा सामग्री के हिसाब से Alice का जवाब सिर्फ़ x पर निर्भर है (x = 0 के लिए a₀, x = 1 के लिए a₁) और Bob का सिर्फ़ y पर (b₀, b₁)। साझा randomness बस ऐसी एक योजना random रूप से चुनती है, और औसत उसकी सबसे अच्छी योजना से बेहतर नहीं हो सकता। तो सिर्फ़ पक्की योजनाएँ जाँचनी हैं, और वे बस 2⁴ = 16 हैं।

एक सुंदर सबूत कि कोई भी चारों round नहीं जीतती। चारों जीतने के लिए चाहिए:

```text
a₀ ⊕ b₀ = 0
a₀ ⊕ b₁ = 0
a₁ ⊕ b₀ = 0
a₁ ⊕ b₁ = 1
```

चारों बाएँ हिस्सों का XOR लें: a₀, a₁, b₀, b₁ हर एक ठीक दो बार आता है, तो सब कटकर 0 हो जाते हैं। लेकिन दाएँ हिस्सों का XOR 1 है। विरोधाभास: **4 में से ज़्यादा से ज़्यादा 3 सही हो सकते हैं।** तो कोई classical रणनीति 75% से ज़्यादा नहीं। फिर भी brute force से जाँचें:

```python
import itertools

# A deterministic classical strategy: Alice answers a0 or a1, Bob b0 or b1.
results = {}
for a0, a1, b0, b1 in itertools.product([0, 1], repeat=4):
    wins = sum(([a0, a1][x] ^ [b0, b1][y]) == (x & y) for x in (0, 1) for y in (0, 1))
    results[(a0, a1, b0, b1)] = wins / 4

print("best classical win rate:", max(results.values()))
print("strategies that reach it:", sum(v == 0.75 for v in results.values()), "of", len(results))
```

```text
best classical win rate: 0.75
strategies that reach it: 8 of 16
```

वह 75% एक **Bell inequality** है: हर local hidden-variable theory को इसे मानना ही होगा।

## Quantum रणनीति: 85.4%

अब Alice और Bob को मेल खाते सिक्कों की जगह साझा **Bell जोड़ी** Φ⁺ दें। रणनीति: हर एक अपने सवाल के हिसाब से एक कोण पर अपना qubit measure करे, और नतीजा जवाब दे।

| खिलाड़ी | सवाल 0 | सवाल 1 |
|---|---|---|
| Alice | 0° (Z) पर measure | 90° (X) पर measure |
| Bob | +45° पर measure | −45° पर measure |

कोण Bloch sphere पर, x–z समतल में हैं। यह काम क्यों करता है: Φ⁺ के लिए, अगर Alice कोण α पर और Bob β पर measure करे, तो **एक जैसा** जवाब मिलने की probability है

> P(same) = cos²((α − β)/2)

(α = β पर यह 1 है: पूरा correlation, पाठ 14।) अब चारों case जाँचें:

| (x, y) | कोणों का अंतर | चाहिए | जीत की probability |
|---|---|---|---|
| (0, 0) | 0° − 45° = −45° | एक जैसा | cos²(22.5°) ≈ 0.854 |
| (0, 1) | 0° + 45° = 45° | एक जैसा | cos²(22.5°) ≈ 0.854 |
| (1, 0) | 90° − 45° = 45° | एक जैसा | cos²(22.5°) ≈ 0.854 |
| (1, 1) | 90° + 45° = 135° | अलग | 1 − cos²(67.5°) = sin²(67.5°) ≈ 0.854 |

हर case cos²(π/8) ≈ **85.4%** probability से जीतता है, classical 75% को हराकर। तरकीब यह है कि Bob के कोण Alice के कोणों के बीचोंबीच हैं, तो मेल-ज़रूरी तीन cases में वह उसके "लगभग साथ" है और अलग-ज़रूरी case में "लगभग उल्टा"।

Circuit में कोण θ पर measure करने के लिए पहले RY(−θ) घुमाएँ और फिर सामान्य measure करें (पाठ 8 का पहले-घुमाओ-फिर-measure विचार):

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

alice_angle = {0: 0, 1: np.pi / 2}               # Z or X
bob_angle   = {0: np.pi / 4, 1: -np.pi / 4}      # halfway between them

def round_win_probability(x, y):
    qc = QuantumCircuit(2)
    qc.h(0)
    qc.cx(0, 1)                                  # shared Bell pair
    qc.ry(-alice_angle[x], 0)                    # measure along Alice's angle
    qc.ry(-bob_angle[y], 1)                      # measure along Bob's angle
    p = Statevector(qc).probabilities_dict()
    same = p.get("00", 0) + p.get("11", 0)       # a = b
    return same if (x & y) == 0 else 1 - same    # win if a XOR b = x AND y

wins = {(x, y): round_win_probability(x, y) for x in (0, 1) for y in (0, 1)}
for k, v in wins.items():
    print(k, round(float(v), 4))
print("quantum win rate:", round(float(np.mean(list(wins.values()))), 4), " cos^2(pi/8) =", round(np.cos(np.pi / 8) ** 2, 4))

E = {k: 2 * v - 1 if k != (1, 1) else 1 - 2 * v for k, v in wins.items()}   # correlations <AB>
S = E[(0, 0)] + E[(0, 1)] + E[(1, 0)] - E[(1, 1)]
print("CHSH value S =", round(float(S), 4), " (classical limit 2, 2*sqrt2 =", round(2 * np.sqrt(2), 4), ")")
```

```text
(0, 0) 0.8536
(0, 1) 0.8536
(1, 0) 0.8536
(1, 1) 0.8536
quantum win rate: 0.8536  cos^2(pi/8) = 0.8536
CHSH value S = 2.8284  (classical limit 2, 2*sqrt2 = 2.8284 )
```

### असल में खेलना

ये सटीक probabilities हैं। असली प्रयोग random सवालों के साथ बहुत rounds खेलता है और जीत गिनता है, तो shot noise होता है। यह रहे 4,000 simulated rounds:

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler

alice_angle = {0: 0, 1: np.pi / 2}
bob_angle   = {0: np.pi / 4, 1: -np.pi / 4}
rng = np.random.default_rng(15)
rounds = rng.integers(0, 2, size=(4000, 2))       # the referee's random questions (x, y)

circuits = {}
for x in (0, 1):
    for y in (0, 1):
        qc = QuantumCircuit(2)
        qc.h(0); qc.cx(0, 1)
        qc.ry(-alice_angle[x], 0); qc.ry(-bob_angle[y], 1)
        qc.measure_all()
        circuits[(x, y)] = qc

sampler = StatevectorSampler(seed=rng)
wins = 0
for (x, y), qc in circuits.items():
    n = int(np.sum((rounds[:, 0] == x) & (rounds[:, 1] == y)))     # how often this pair came up
    counts = sampler.run([qc], shots=n).result()[0].data.meas.get_counts()
    for bits, c in counts.items():
        a, b = int(bits[1]), int(bits[0])                          # qubit 0 = Alice, qubit 1 = Bob
        wins += c * ((a ^ b) == (x & y))
print("won", wins, "of 4000 rounds:", round(wins / 4000, 3))
```

```text
won 3428 of 4000 rounds: 0.857
```

85.7%, 85.4% के shot noise के अंदर (4,000 rounds में अनिश्चितता लगभग ±0.6% है, पाठ 5)। Classical टीम का 4,000 में 3,428 rounds जीतना ऐसा है जैसे ठीक सिक्का 4,000 उछाल में 3,428 बार heads दे: ऐसा होता नहीं।

## CHSH नंबर S

Physicists आमतौर पर नतीजा एक नंबर में बताते हैं। Alice और Bob के हर जवाब को 0/1 की जगह ±1 लिखें, और E(x, y) उनके गुणनफल का औसत हो (उनका correlation, पाठ 14)। फिर परिभाषित करें

> **S = E(0,0) + E(0,1) + E(1,0) − E(1,1)**

जीत की दर और S का रिश्ता है: जीत = ½ + S/8, तो:

| Theory | अधिकतम S | अधिकतम जीत |
|---|---|---|
| Local hidden variables (classical) | **2** | 75% |
| Quantum mechanics | **2√2 ≈ 2.83** | cos²(π/8) ≈ 85.4% |
| कोई भी theory जो रोशनी से तेज़ signalling मना करे | 4 | 100% |

S ≤ 2 **CHSH inequality** है। Quantum mechanics 2√2 तक पहुँचती है, जिसे **Tsirelson bound** कहते हैं: कोई quantum रणनीति, कितने भी entanglement और कैसे भी measurements के साथ, इससे बेहतर नहीं कर सकती। दिलचस्प बात यह है कि अकेला no-signalling सिद्धांत S = 4 की इजाज़त देता। प्रकृति 2√2 पर क्यों रुकती है, यह अभी भी research का सवाल है।

## प्रयोग

| साल | किसने | क्या |
|---|---|---|
| 1972 | Freedman और Clauser (Berkeley) | पहला Bell test, calcium atoms के photon जोड़ों से: उल्लंघन |
| 1982 | Alain Aspect की टीम (Paris) | Photons के रास्ते में रहते measurement settings बदलीं, ताकि detectors "मिलकर" न चल सकें |
| 1998 | Anton Zeilinger की टीम (Innsbruck) | Settings का पूरी तरह random, तेज़ बदलाव, stations 400 m दूर |
| 2015 | Delft, Vienna और NIST (Boulder) | पहले **loophole-free** tests: इतने अच्छे detectors और इतनी दूर stations कि कोई ज्ञात classical व्याख्या नहीं बचती |
| 2022 | Physics का Nobel Prize | Aspect, Clauser और Zeilinger को "entangled photons के साथ प्रयोगों, Bell inequalities का उल्लंघन स्थापित करने" के लिए |

Delft प्रयोग में 1.3 km दूर हीरों में electron spins इस्तेमाल हुए। हर measurement उतने समय से पहले पूरा हुआ जितना रोशनी को दोनों labs के बीच जाने में लगता, तो कोई signal उन्हें मिलवा नहीं सकता था।

## इसका मतलब क्या है, और क्या नहीं

Bell tests **local realism** को ख़ारिज करते हैं: नतीजों को पहले से तय जवाब लिए कणों और बिना रोशनी-से-तेज़ असर के नहीं समझाया जा सकता। हमारी रोज़ की तस्वीर में कुछ तो छोड़ना होगा। ज़्यादातर physicists मानते हैं कि measurement के नतीजे सचमुच measurement तक तय नहीं होते। (कुछ लोग hidden variables रखते हैं और locality छोड़ देते हैं, जैसे Bohmian mechanics में; प्रयोग इन व्याख्याओं में फ़र्क़ नहीं कर सकते, क्योंकि ये एक ही अनुमान देती हैं।)

Bell tests यह **नहीं** दिखाते कि संदेश रोशनी से तेज़ जा सकते हैं। हर खिलाड़ी के अपने नतीजे 50/50 रहते हैं (पाठ 14 का no-signalling)। उल्लंघन तभी दिखता है जब नतीजे साथ लाकर मिलाए जाएँ।

## काम में Bell tests

CHSH game सिर्फ़ दार्शनिक प्रयोग नहीं है। ऊँचा S एक **प्रमाणपत्र** है कि devices सच में entanglement साझा करते हैं, सिर्फ़ input–output आँकड़ों से जाँचा हुआ, बिना यह भरोसा किए कि devices कैसे बने।

- **Device-independent QKD:** अगर Alice और Bob को S, 2√2 के पास दिखे, तो monogamy (पाठ 14) गारंटी देती है कि कोई जासूस उनकी जोड़ियों से entangled नहीं हो सकता, चाहे उनके उपकरण दुश्मन ने बनाए हों। यह E91 protocol का तर्क है (पाठ 41)।
- **प्रमाणित randomness:** Bell उल्लंघन साबित करता है कि outputs पहले से तय नहीं हो सकते थे, तो वे सच में random हैं। कई राष्ट्रीय labs इसी सिद्धांत पर सार्वजनिक randomness beacons चलाते हैं।
- **Benchmarking:** S नापना जल्दी जाँचने का तरीका है कि कोई quantum computer या network कितना अच्छा entanglement बनाता है। Noise, S को 2 की ओर खींचता है।

## ख़ुद करके देखें

1. CHSH game में "Alice हमेशा 0, Bob हमेशा 1" की जीत की दर क्या है?
2. P(same) = cos²((α − β)/2) से: अगर Bob भी Alice वाले कोणों (0° और 90°) पर measure करे तो? औसत जीत की दर?
3. win = ½ + S/8 से S = 2√2 को जीत की दर में बदलें, और S = 2 को भी।
4. Noise हर correlation को factor v से घटाता है, तो S = v·2√2। किस v से नीचे CHSH test कुछ भी quantum नहीं दिखा सकता?
5. प्रयोग करने वाले measurement settings random और आख़िरी पल में क्यों चुनते हैं?
6. Alice, Bell test से Bob को संदेश क्यों नहीं भेज सकती?

**जवाब:**

1. हमेशा a ≠ b: वे सिर्फ़ (1, 1) जीतते हैं, तो **25%**।
2. Cases (0,0) और (1,1): कोणों का अंतर 0 → (0,0) में मेल (जीत, 1), (1,1) में मेल लेकिन अलग चाहिए (हार, 0)। Cases (0,1) और (1,0): अंतर 90° → P(same) = ½। औसत (1 + ½ + ½ + 0)/4 = **50%**: classical से भी बुरा।
3. ½ + 2√2/8 = ½ + √2/4 ≈ **0.854**। ½ + 2/8 = **0.75**।
4. v·2√2 > 2 के लिए v > 1/√2 ≈ **0.707**।
5. ताकि न source और न दूसरा station settings पहले से जान सके, जिससे hidden-variable model "धोखा" दे सकता।
6. दोनों को 50/50 नतीजे दिखते हैं, दूसरा चाहे जो करे; correlations तभी दिखते हैं जब वे साधारण channel से data मिलाते हैं।

## सार

| विचार | सूत्र या तथ्य |
|---|---|
| EPR (1935) | तर्क: quantum mechanics अधूरी है; छिपे जवाब होने चाहिए |
| Local realism | पहले से तय जवाब + रोशनी से तेज़ असर नहीं |
| Bell (1964) | Local realism एक परखा जा सकने वाला अनुमान देता है जिसे quantum mechanics तोड़ती है |
| CHSH game | जीत अगर a ⊕ b = x ∧ y |
| Classical सीमा | 75% जीत; S ≤ 2 |
| सबूत का विचार | चारों जीत-शर्तों का XOR 0 = 1 देता है |
| Quantum रणनीति | Bell जोड़ी; Alice 0°/90° पर, Bob ±45° पर |
| Φ⁺ के लिए P(same) | cos²((α − β)/2) |
| Quantum जीत की दर | cos²(π/8) ≈ 85.4% |
| CHSH value | S = E00 + E01 + E10 − E11; quantum अधिकतम 2√2 (Tsirelson) |
| S से जीत | ½ + S/8 |
| Loophole-free tests | 2015 (Delft, Vienna, NIST) |
| Nobel Prize 2022 | Aspect, Clauser, Zeilinger |
| इस्तेमाल | Device-independent QKD, प्रमाणित randomness, benchmarking |
| कोण θ पर measure | RY(−θ), फिर Z में measure |
