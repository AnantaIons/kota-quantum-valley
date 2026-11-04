---
layout: ../../../layouts/Post.astro
lang: hi
title: "Measurement और Born rule"
description: "Quantum measurement के सटीक नियम: Born rule, collapse, projectors, पहले घुमाकर किसी भी basis में measure करना, expectation values, कई measurements से अनजान state दोबारा बनाना (tomography), और quantum Zeno effect, सब टेस्ट किए कोड के साथ।"
date: 2026-11-04
category: lesson
lesson: 8

---

Measurement वह जगह है जहाँ quantum दुनिया हमारी दुनिया से मिलती है। Quantum computer जो कुछ भी करता है वह उन amplitudes के साथ होता है जिन्हें आप देख नहीं सकते; बाहर आपको सिर्फ़ measurement का नतीजा मिलता है। इसलिए measurement के नियम **सटीक** जानने चाहिए, "collapse" के धुँधले विचार की तरह नहीं।

यह पाठ एक qubit को measure करने की पूरी नियमावली देता है, Bloch sphere की किसी भी दिशा में measure करना दिखाता है, बताता है कि measurements से अनजान state कैसे दोबारा बनाएँ, और एक अजीब नतीजे पर ख़त्म होता है: qubit को काफ़ी ध्यान से देखते रहने से उसका बदलना रुक सकता है।

## Born rule

आप इसे इस्तेमाल कर चुके हैं। अब यह सटीक रूप में, जैसा Max Born ने 1926 में कहा।

Measure करने के लिए एक orthonormal basis चुनें, जैसे {|b₀⟩, |b₁⟩}। State |ψ⟩ वाले qubit को measure करने पर:

> **1. नतीजा k, probability P(k) = |⟨bₖ|ψ⟩|² से मिलता है।**
> **2. उसके तुरंत बाद qubit state |bₖ⟩ में होता है।**

बस इतना। नियम 1 को **Born rule** कहते हैं। नियम 2 को अक्सर **collapse** कहते हैं: qubit जिस भी superposition में था, अब वह उस basis state में है जो आपको मिली।

साधारण computational-basis measurement के लिए basis {|0⟩, |1⟩} है, और |ψ⟩ = α|0⟩ + β|1⟩ के साथ:

```text
P(0) = |⟨0|ψ⟩|² = |α|²        बाद में: |0⟩
P(1) = |⟨1|ψ⟩|² = |β|²        बाद में: |1⟩
```

**Probabilities का जोड़ 1 क्यों होना चाहिए?** क्योंकि basis orthonormal है और state normalised: |⟨b₀|ψ⟩|² + |⟨b₁|ψ⟩|² = ⟨ψ|ψ⟩ = 1। States की लंबाई 1 होने का यह एक कारण है (पाठ 3)।

### यही नियम projectors के साथ

पाठ 3 ने projector |bₖ⟩⟨bₖ| दिया था, जो state का सिर्फ़ |bₖ⟩ वाला हिस्सा रखता है। इसे Πₖ कहें। तब Born rule ऐसे लिखा जा सकता है:

> P(k) = ⟨ψ|Πₖ|ψ⟩

क्योंकि ⟨ψ|bₖ⟩⟨bₖ|ψ⟩ = (⟨bₖ|ψ⟩)*·⟨bₖ|ψ⟩ = |⟨bₖ|ψ⟩|²। और measurement के बाद की state Πₖ|ψ⟩ को उसकी लंबाई से भाग देकर मिलती है। यह "projector" रूप कई qubits और उनमें से कुछ ही को measure करने पर भी आसानी से लागू होता है, जो आपको teleportation (पाठ 21) और error correction (भाग F) में चाहिए होगा।

### व्यवहार में collapse का मतलब

Collapse का एक आसान, जाँचा जा सकने वाला नतीजा है: **एक ही चीज़ लगातार दो बार measure करें तो दोनों बार एक ही जवाब मिलता है।** अगर पहले measurement में 1 मिला, तो qubit अब |1⟩ है, और दोबारा measure करने पर पक्का 1 मिलेगा।

इसका यह भी मतलब है कि **एक measurement जानकारी नष्ट कर देता है।** Measure करने से पहले state में दो complex numbers α और β थे। बाद में आपके पास एक bit है, और qubit α और β भूल चुका है। Amplitudes को झाँकने के लिए "धीरे से" measure करना संभव नहीं जिससे वे बिगड़ें नहीं; यही असंभवता quantum key distribution को सुरक्षित बनाती है (पाठ 41)।

## किसी भी दिशा में measure करना

असली quantum computers सिर्फ़ computational basis में measure कर सकते हैं, |0⟩ या |1⟩: Bloch sphere का z-अक्ष। तो अलग सवाल कैसे पूछें, जैसे "+ या −?"

**पहले घुमाएँ, फिर z measure करें।** अगर कोई gate U आपके basis को {|0⟩, |1⟩} में बदल दे, तो U लगाकर z measure करना आपके basis में measure करने जैसा ही है।

| इस दिशा में measure | Basis | Measure से पहले लगाएँ | क्यों |
|---|---|---|---|
| z | \|0⟩, \|1⟩ | कुछ नहीं | पहले से default |
| x | \|+⟩, \|−⟩ | H | H\|+⟩ = \|0⟩, H\|−⟩ = \|1⟩ |
| y | \|+i⟩, \|−i⟩ | S†, फिर H | S†, \|+i⟩ को \|+⟩ बनाता है, फिर H से \|0⟩ |

अब नतीजा "0" का मतलब "+" (या "+i") है, और "1" का मतलब "−" (या "−i")।

y वाला तरीका |+i⟩ = (|0⟩ + i|1⟩)/√2 पर जाँचें। S† = [[1, 0], [0, −i]], |1⟩ के amplitude को −i से गुणा करता है: i × (−i) = 1, तो मिलता है (|0⟩ + |1⟩)/√2 = |+⟩। फिर H|+⟩ = |0⟩। ✓

## Expectation values

पाठ 5 ने expectation value को लंबे समय का औसत कहा था। किसी observable A (Hermitian matrix, पाठ 4) के लिए quantum mechanics एक छोटा सूत्र देती है:

> **⟨A⟩ = ⟨ψ|A|ψ⟩**

Z के लिए, नतीजे +1 (0 के लिए) और −1 (1 के लिए):

```text
⟨Z⟩ = ⟨ψ|Z|ψ⟩ = |α|² − |β|² = P(0) − P(1)
```

और इसी तरह ⟨X⟩ = P(+) − P(−), ⟨Y⟩ = P(+i) − P(−i)। ये तीन नंबर ठीक पाठ 7 का Bloch vector (x, y, z) हैं। तो: **किसी state का Bloch vector उसके तीन expectation values की सूची है।**

कई algorithms असल में expectation values ही निकालते हैं। Variational algorithm (पाठ 30) को एक bitstring नहीं चाहिए; उसे ⟨H⟩, औसत energy चाहिए, जो कई shots से अनुमानित होती है।

## अनजान state दोबारा बनाना: tomography

मान लीजिए कोई आपको एक मशीन देता है जो हर बटन दबाने पर एक ही अनजान qubit state बनाती है। आप कैसे पता करेंगे कि वह क्या है?

एक copy से नामुमकिन: एक measurement एक bit देता है। लेकिन **कई copies** से तीनों expectation values का अनुमान लग सकता है: कई copies x में measure करें, कई y में और कई z में। इससे Bloch vector मिलता है, जो state को पूरी तरह तय करता है। इसे **quantum state tomography** कहते हैं (यूनानी में "टुकड़ा": CT scan की तरह, कई दिशाओं से देखना)।

यहाँ "अनजान" state हमने ख़ुद बनाई है, उत्तरी ध्रुव से 60°, +y की ओर, ताकि जवाब जाँच सकें: असली Bloch vector (0, 0.866, 0.5) है।

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler

def prepare():
    """The mystery state: 60 degrees from the north pole, facing +y."""
    qc = QuantumCircuit(1)
    qc.ry(np.pi / 3, 0)
    qc.rz(np.pi / 2, 0)
    return qc

circuits = {}
for basis in "XYZ":
    qc = prepare()
    if basis == "X":
        qc.h(0)                 # turns the X question into a Z question
    if basis == "Y":
        qc.sdg(0)               # S-dagger then H turns the Y question into Z
        qc.h(0)
    qc.measure_all()
    circuits[basis] = qc

sampler = StatevectorSampler(seed=5)
results = sampler.run(list(circuits.values()), shots=4000).result()
for basis, res in zip(circuits, results):
    c = res.data.meas.get_counts()
    expectation = (c.get("0", 0) - c.get("1", 0)) / 4000      # P(0) - P(1)
    print(basis, c, "->", round(expectation, 3))
```

```text
X {'1': 1967, '0': 2033} -> 0.017
Y {'0': 3726, '1': 274} -> 0.863
Z {'1': 981, '0': 3019} -> 0.509
```

12,000 shots से हमने (0.017, 0.863, 0.509) का अनुमान लगाया, असली (0, 0.866, 0.5) के बहुत पास। छोटी ग़लतियाँ पाठ 5 का shot noise हैं: 4,000 shots के साथ हर value में अनिश्चितता लगभग √(1/4000) ≈ 0.016 है। (State बनाने वाले `ry` और `rz` gates घुमाव हैं, जिन्हें पाठ 11 समझाता है।)

Labs tomography से ही जाँचती हैं कि उनके qubits और gates वही कर रहे हैं जो करना चाहिए। इसकी लागत भी एक सबक़ है: n qubits के लिए settings की संख्या 3ⁿ की तरह बढ़ती है, तो 20 qubits की भी पूरी tomography अव्यावहारिक है। इसीलिए quantum computers तभी उपयोगी हैं जब आपको चाहिए जवाब कुछ नंबर या एक संभावित bitstring हो, पूरी state नहीं।

## Quantum Zeno effect

Collapse का एक अजीब नतीजा। मान लीजिए एक qubit को धीरे-धीरे |0⟩ से |1⟩ की ओर घुमाया जा रहा है, जैसे एक कमज़ोर, स्थिर pulse से जो एक सेकंड में पलटना पूरा करेगा। अकेला छोड़ दें तो एक सेकंड बाद वह |1⟩ है।

अब उस सेकंड में उसे **N बार** measure करें। हर छोटा क़दम उसे Bloch sphere पर सिर्फ़ 180°/N घुमाता है। एक क़दम के ठीक बाद |0⟩ मिलने की संभावना cos²(90°/N) है, जो N बड़ा हो तो 1 के बहुत पास है। अगर |0⟩ मिला, तो state वापस ठीक |0⟩ में collapse हो जाती है, और घुमाव शून्य से फिर शुरू करना पड़ता है।

सभी N जाँचों में हर बार |0⟩ मिलने की संभावना:

> P(अब भी |0⟩) = [cos²(90°/N)]ᴺ

```python
import numpy as np
# Turn |0> into |1> with N small rotations, measuring after each one.
# The chance of surviving every measurement in |0> is cos^2(pi/2N) to the power N.
for N in [1, 2, 5, 10, 100, 1000]:
    survive = np.cos(np.pi / (2 * N)) ** (2 * N)
    print(f"{N:5d} steps: still |0> with probability {survive:.3f}")
```

```text
    1 steps: still |0> with probability 0.000
    2 steps: still |0> with probability 0.250
    5 steps: still |0> with probability 0.605
   10 steps: still |0> with probability 0.781
  100 steps: still |0> with probability 0.976
 1000 steps: still |0> with probability 0.998
```

बीच में कोई जाँच न हो तो qubit पक्का पलटता है। 1,000 जाँचों के साथ, लगभग पक्का **नहीं** पलटता। बार-बार measurement बदलाव को जमा देता है। यह **quantum Zeno effect** है, उस यूनानी दार्शनिक के नाम पर जिसने तर्क दिया था कि देखा जा रहा तीर कभी चल नहीं सकता। इसे trapped ions और atoms में देखा जा चुका है, और इससे जुड़े विचार qubits को अनचाहे बदलाव से बचाने में इस्तेमाल होते हैं।

## Measurement क्या कर सकता है और क्या नहीं

| Measurement कर सकता है | Measurement नहीं कर सकता |
|---|---|
| हर run में एक नतीजा, probability \|⟨bₖ\|ψ⟩\|² से | एक copy से α और β बताना |
| पहले घुमाकर कोई भी सवाल (basis) पूछना | एक ही copy से दो असंगत सवाल (जैसे x और z) पूछना |
| कई shots से expectation values का अनुमान | Shot noise से बचना: अनिश्चितता सिर्फ़ 1/√N की तरह घटती है |
| कई copies से state दोबारा बनाना (tomography) | उलटा किया जाना: collapse unitary नहीं है |

आख़िरी row पर एक पल रुकें। पाठ 4 का सब कुछ unitary और reversible था। Measurement नहीं है: यह α|0⟩ + β|1⟩ और ख़ुद |0⟩ दोनों को |0⟩ बना देता है, जिससे जानकारी खोती है। इसीलिए quantum algorithms जितनी देर हो सके सब कुछ unitary रखते हैं, amplitudes को interfere होने देते हैं, और **बिल्कुल आख़िर में ही measure करते हैं।**

## ख़ुद करके देखें

1. |ψ⟩ = (√3|0⟩ + i|1⟩)/2। P(0) और P(1) निकालें। अगर 1 मिले, तो बाद में state क्या है?
2. उसी state के लिए P(+) निकालें। (पहले ⟨+|ψ⟩ निकालें।)
3. "+i या −i?" पूछने के लिए measure से पहले कौन-से gates लगाएँगे? नतीजे "1" का मतलब क्या है?
4. |ψ⟩ = cos(30°)|0⟩ + sin(30°)|1⟩ के लिए ⟨Z⟩ और ⟨X⟩ निकालें।
5. Tomography कोड में हर value ±0.005 के अंदर पाने के लिए हर basis में लगभग कितने shots चाहिए?
6. Zeno table में N = 3 के लिए बचने की probability क्या है? सूत्र से जाँचें।

**जवाब:**

1. P(0) = 3/4, P(1) = |i/2|² = 1/4। 1 मिलने के बाद state |1⟩ है।
2. ⟨+|ψ⟩ = (1/√2)(√3/2 + i/2), तो P(+) = ½ × |√3/2 + i/2|² = ½ × (3/4 + 1/4) = **½**।
3. S† फिर H। नतीजे "1" का मतलब **−i**।
4. ⟨Z⟩ = cos²30° − sin²30° = cos 60° = **0.5**। ⟨X⟩ = 2·cos30°·sin30° = sin 60° ≈ **0.866**।
5. √(1/N) ≈ 0.005 से हर basis में N ≈ **40,000**।
6. [cos²(30°)]³ = 0.75³ ≈ **0.42**।

## सार

| विचार | सूत्र या तथ्य |
|---|---|
| Born rule | P(k) = \|⟨bₖ\|ψ⟩\|² |
| Collapse | नतीजा k के बाद state \|bₖ⟩ है |
| Projector रूप | P(k) = ⟨ψ\|Πₖ\|ψ⟩, Πₖ = \|bₖ⟩⟨bₖ\| |
| Measurement दोहराना | फिर वही जवाब |
| Hardware measure करता है | सिर्फ़ z (\|0⟩ या \|1⟩) |
| x measure | H लगाएँ, फिर measure |
| y measure | S†, फिर H, फिर measure |
| Expectation value | ⟨A⟩ = ⟨ψ\|A\|ψ⟩ |
| ⟨Z⟩ | P(0) − P(1) |
| Bloch vector | (⟨X⟩, ⟨Y⟩, ⟨Z⟩) |
| Tomography | कई copies, x, y और z में measure करके state दोबारा बनाना |
| Tomography की लागत | n qubits के लिए 3ⁿ settings |
| Zeno effect | बार-बार measurement बदलाव जमा देता है: [cos²(90°/N)]ᴺ → 1 |
| Measurement | Irreversible और unitary नहीं; algorithms के अंत में |
