---
layout: ../../../layouts/Post.astro
lang: hi
title: "Amplitude amplification"
description: "Grover का विचार अपने आम रूप में: कोई भी quantum प्रक्रिया जो probability p से सफल होती है, उसे लगभग 1/√p क़दमों में लगभग पक्की सफलता तक बढ़ाना। दो-reflection वाली ज्यामिति, कोड में जाँचा sin²((2k+1)θ) सूत्र, p अनजान हो तो क्या करें, और amplitude estimation, जो sampling से quadratically तेज़ गिनता और औसत निकालता है।"
date: 2026-11-04
category: lesson
lesson: 25

---

पाठ 24 ने Grover search बनाया: सही जवाब पर phase से निशान लगाओ, फिर "औसत के पार reflect करो" ताकि उसका amplitude round-दर-round बढ़े। पता चलता है कि उस नुस्ख़े में कुछ भी बराबर superposition से शुरू करने, या खोजने पर भी, निर्भर नहीं है। यह **किसी भी** quantum प्रक्रिया को ज़्यादा बार सफल बनाने का आम तरीका है, जिसे **amplitude amplification** कहते हैं (Brassard, Høyer, Mosca और Tapp, 2000)।

और इसका एक ताक़तवर भाई है, **amplitude estimation**, जो सिर्फ़ अच्छे नतीजे नहीं ढूँढता बल्कि नापता है कि वे **कितने संभावित** हैं, बार-बार sampling से quadratically तेज़। Finance और विज्ञान में Monte Carlo simulation के quantum speed-ups के पीछे यही इंजन है (पाठ 46)।

## स्थिति

मान लीजिए आपके पास कोई quantum circuit A है। |0…0⟩ पर चलाने से वह ऐसी state बनाता है जिसमें कुछ नतीजे "अच्छे" हैं (जो आप चाहते हैं) और बाक़ी "बुरे"। इन्हें समूहों में रखें:

> A|0…0⟩ = sin θ · |good⟩ + cos θ · |bad⟩

यहाँ |good⟩ सभी अच्छे नतीजों का normalised superposition है, |bad⟩ उसी तरह, और कोण θ सफलता की कुल probability से परिभाषित है:

> p = sin²θ

**Classically**, अगर A probability p से सफल होता है, तो आप बस उसे बार-बार चलाते हैं। औसतन **1/p** कोशिशें लगती हैं। p = 1% के लिए 100 कोशिशें।

**Amplitude amplification** को A के सिर्फ़ लगभग **1/√p** runs चाहिए: 100 की जगह 10। यह Grover वाला ही quadratic speed-up है, किसी भी A के लिए। (Grover search वह ख़ास स्थिति है जहाँ A = H⊗ⁿ और एक अच्छी चीज़ है, तो p = 1/N।)

आपको बस चाहिए:

- circuit **A** और उसका inverse **A†**, और
- अच्छे नतीजे **पहचानने** का तरीका: एक phase oracle **S_good** जो अच्छी basis states पर −1 लगाए (पाठ 22 के phase oracles जैसा)।

## ज्यामिति: दो reflections मिलकर घुमाव

State को एक समतल में तीर की तरह सोचें, एक अक्ष पर |bad⟩ और दूसरे पर |good⟩। A|0⟩ bad अक्ष से छोटे कोण θ ऊपर शुरू होता है। हम उसे |good⟩ की ओर घुमाना चाहते हैं।

Amplitude amplification का एक round यह operator है

> **Q = A · S₀ · A† · S_good**

जो दो reflections से बना है:

1. **S_good** अच्छे हिस्से का चिह्न पलटता है। समतल में यह **bad अक्ष के पार reflection** है: कोण θ वाला तीर −θ पर जाता है।
2. **A · S₀ · A†**, जहाँ S₀, |0…0⟩ का चिह्न पलटता है, **शुरुआती दिशा A|0⟩ के पार reflection** है। (एक global चिह्न छोड़कर, जो मायने नहीं रखता।) −θ वाला तीर +3θ पर जाता है।

एक-दूसरे से θ कोण पर दो रेखाओं के पार दो reflections मिलकर **2θ का घुमाव** बनाते हैं। (आईने और पेंसिल से आज़माएँ: θ कोण वाले दो आईनों के पार दो बार reflect करने से कोई भी चीज़ 2θ घूम जाती है।) तो Q का हर round state को |good⟩ की ओर 2θ घुमाता है। k rounds के बाद कोण (2k + 1)θ है, और:

> **k rounds के बाद P(good) = sin²((2k + 1)θ)**

लगभग पक्की सफलता के लिए k ऐसा चुनें कि (2k + 1)θ ≈ 90°:

> **k ≈ π/(4θ) − ½ ≈ (π/4)·(1/√p)**  (छोटे p के लिए, क्योंकि θ ≈ √p)

यही 1/√p है।

### कोड में देखना

यहाँ A बराबर superposition बिल्कुल नहीं है: यह तीन qubits में से हर एक पर अलग RY घुमाव लगाता है, और "अच्छा" मतलब नतीजा 111। अकेला A सिर्फ़ 1.65% बार 111 देता है। Oracle S_good एक CCZ है (controlled-controlled-Z, H और Toffoli से बना), और S₀ वही चीज़ X gates में लिपटी है ताकि 000 पर निशान लगाए।

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

angles = [1.2, 0.9, 1.1]                       # A: a different RY on each of 3 qubits
def A():
    qc = QuantumCircuit(3)
    for q, a in enumerate(angles):
        qc.ry(a, q)
    return qc

def flip_111():                                # phase -1 on the good state |111>
    qc = QuantumCircuit(3)
    qc.h(2); qc.ccx(0, 1, 2); qc.h(2)
    return qc

def reflect_about_000():                       # phase -1 on |000> (up to a global sign)
    qc = QuantumCircuit(3)
    qc.x([0, 1, 2]); qc.compose(flip_111(), inplace=True); qc.x([0, 1, 2])
    return qc

Q = QuantumCircuit(3)                          # one round of amplitude amplification
Q.compose(flip_111(), inplace=True)
Q.compose(A().inverse(), inplace=True)
Q.compose(reflect_about_000(), inplace=True)
Q.compose(A(), inplace=True)

p = np.prod(np.sin(np.array(angles) / 2) ** 2) # chance that A alone gives |111>
theta = np.arcsin(np.sqrt(p))
print(f"A alone: P(111) = {p:.4f}, theta = {np.degrees(theta):.2f} degrees")
state = A()
for k in range(6):
    sim = Statevector(state).probabilities_dict().get("111", 0)
    print(f"k = {k}: P(111) = {sim:.4f}   formula sin^2((2k+1)θ) = {np.sin((2 * k + 1) * theta) ** 2:.4f}")
    state = state.compose(Q)
```

```text
A alone: P(111) = 0.0165, theta = 7.38 degrees
k = 0: P(111) = 0.0165   formula sin^2((2k+1)θ) = 0.0165
k = 1: P(111) = 0.1419   formula sin^2((2k+1)θ) = 0.1419
k = 2: P(111) = 0.3601   formula sin^2((2k+1)θ) = 0.3601
k = 3: P(111) = 0.6147   formula sin^2((2k+1)θ) = 0.6147
k = 4: P(111) = 0.8395   formula sin^2((2k+1)θ) = 0.8395
k = 5: P(111) = 0.9762   formula sin^2((2k+1)θ) = 0.9762
```

Simulation सूत्र से ठीक मेल खाता है। 5 rounds के बाद (A या A† के कुल 11 इस्तेमाल), सफलता 97.6% है। अकेला A दोहराते हुए, एक बार 111 देखने के लिए औसतन लगभग 1/0.0165 ≈ 60 runs चाहिए। और क्योंकि सूत्र सबसे अच्छा k ≈ π/(4 × 0.129) − ½ ≈ 5.6 बताता है, पाँच rounds ठीक वहीं हैं जहाँ रुकना चाहिए।

## आगे मत निकलिए

घुमाव चलता रहता है। लगभग π/(4θ) rounds के बाद state |good⟩ के पार निकल जाती है और वापस नीचे आने लगती है: ऊपर के उदाहरण में k = 6 पर P पहले से कम होगा, लगभग 0.989, और फिर तेज़ी से गिरता है। यही मुख्य व्यावहारिक कठिनाई है: **सही समय पर रुकने के लिए θ पता होना चाहिए**, यानी p पता होना चाहिए।

अगर पता न हो तो? तीन मानक जवाब:

| स्थिति | तरीका |
|---|---|
| p अनजान, अच्छा नतीजा चाहिए | बढ़ती सीमा से random संख्या में rounds आज़माएँ (Boyer, Brassard, Høyer और Tapp, 1998)। फिर भी औसतन ~1/√p |
| p अनजान, आगे निकलना मंज़ूर नहीं | **Fixed-point** amplitude amplification (Yoder, Low और Chuang, 2014): चिह्न पलटने की जगह सावधानी से चुने कोणों के घुमाव, ताकि लक्ष्य के पास पहुँचे पर कभी आगे न निकले |
| p ख़ुद जानना है | **Amplitude estimation** (अगला हिस्सा) |

## Amplitude estimation: p को quadratically तेज़ नापना

अक्सर आपको अच्छा नतीजा चाहिए ही नहीं। आपको **नंबर** p चाहिए: "इस portfolio के पैसे गँवाने की probability क्या है?", "इन configurations का कितना हिस्सा शर्त पूरी करता है?"। Classical तरीका sampling है: A को N बार चलाओ और गिनो। पाठ 5 का shot noise लगभग इतनी ग़लती देता है

> **classical ग़लती ≈ √(p(1 − p)/N) ∝ 1/√N**

Amplitude estimation, A के N इस्तेमालों से लगभग इतनी ग़लती देता है

> **quantum ग़लती ∝ 1/N**

यह quadratically बेहतर है: 10× ज़्यादा सटीकता के लिए sampling को 100× ज़्यादा runs चाहिए; amplitude estimation को सिर्फ़ 10×।

**कैसे?** कुंजी सूत्र sin²((2k + 1)θ) में है। k rounds के बाद नतीजे की probability (2k + 1)θ पर निर्भर है: θ में छोटा बदलाव 2k + 1 से **गुणा** हो जाता है। कई rounds के बाद measure करना लंबे लीवर जैसा है: जो कोण आप नापना चाहते हैं उसे बड़ा कर देता है।

मूल रूप (Brassard और साथी, 2000) यह quantum phase estimation (पाठ 27) से करता है: Q, 2θ का घुमाव है, तो उसके eigenvalues e^(±2iθ) हैं, और phase estimation सीधे θ पढ़ लेता है। इसके लिए गहरा, controlled circuit चाहिए। नए रूप (maximum-likelihood और iterative amplitude estimation, लगभग 2019–2020) phase estimation छोड़ देते हैं: वे बस k = 0, 1, 2, 4, 8, … rounds के साथ circuit चलाते हैं, हर एक में कुछ shots, और सभी नतीजों पर θ fit करते हैं। वे 1/N scaling बनाए रखते हैं और हार्डवेयर के लिए कहीं आसान हैं।

यह रहा वह विचार, simulate किया हुआ। हम सटीक probabilities sin²((2k + 1)θ) से random shot गिनतियाँ बनाते हैं, फिर maximum likelihood से θ fit करते हैं, और **A के उतने ही कुल इस्तेमालों के लिए** ग़लती की तुलना साधारण sampling से करते हैं:

```python
import numpy as np
rng = np.random.default_rng(25)
p_true = 0.3                                   # the probability we want to estimate
theta_true = np.arcsin(np.sqrt(p_true))
grid = np.linspace(1e-4, np.pi / 2 - 1e-4, 20001)   # candidate values of theta

def monte_carlo(queries):
    """Plain sampling: each query is one run of A and one measurement."""
    return rng.binomial(queries, p_true) / queries

def amplitude_estimation(max_power, shots=20):
    """Run A then k rounds of Q, for k = 0, 1, 2, 4, ..., and fit theta to all the results."""
    ks = [0] + [2 ** j for j in range(max_power + 1)]
    loglik, queries = np.zeros_like(grid), 0
    for k in ks:
        hits = rng.binomial(shots, np.sin((2 * k + 1) * theta_true) ** 2)
        q = np.clip(np.sin((2 * k + 1) * grid) ** 2, 1e-12, 1 - 1e-12)
        loglik += hits * np.log(q) + (shots - hits) * np.log(1 - q)
        queries += shots * (2 * k + 1)         # each round uses A twice (A and A-dagger)
    return np.sin(grid[np.argmax(loglik)]) ** 2, queries

print(" queries   error (plain sampling)   error (amplitude estimation)")
for m in [3, 5, 7, 9]:
    ae = [amplitude_estimation(m) for _ in range(300)]
    budget = ae[0][1]
    err_ae = np.sqrt(np.mean([(est - p_true) ** 2 for est, _ in ae]))
    err_mc = np.sqrt(np.mean([(monte_carlo(budget) - p_true) ** 2 for _ in range(300)]))
    print(f"{budget:8d}   {err_mc:.5f}                  {err_ae:.5f}")
```

```text
 queries   error (plain sampling)   error (amplitude estimation)
     700   0.01747                  0.00576
    2660   0.00930                  0.00115
   10380   0.00447                  0.00065
   41140   0.00228                  0.00014
```

Columns ऊपर से नीचे पढ़ें। Budget लगभग 59× बढ़ता है। साधारण sampling की ग़लती लगभग 7.7× घटती है (यह √59 है: 1/√N नियम)। Amplitude estimation की ग़लती लगभग 41× घटती है, 1/N नियम के पूरे 59× के पास। सबसे बड़े budget पर यह उसी लागत में **16 गुना ज़्यादा सटीक** है।

## कहाँ इस्तेमाल होता है, और शर्त

| Application | Amplitude estimation क्या देता है |
|---|---|
| Finance में **Monte Carlo pricing और risk** (पाठ 46) | Quadratically कम samples से expected values |
| **Quantum counting** | खोज समस्या के हलों की संख्या, जो Grover को यह भी बताती है कि कब रुकना है |
| Physics और engineering में **integrals और औसत का अनुमान** | Sampling-आधारित गणना जैसी ही quadratic बचत |
| **दूसरे quantum algorithms को तेज़ करना** | किसी भी subroutine को बढ़ाना जो कभी-कभी ही सफल हो |

शर्त Grover (पाठ 24) जैसी ही है:

- **यह quadratic है, exponential नहीं।** जिस समस्या में classical कंप्यूटर को 10¹² samples लगें, उसमें शायद 10⁶ quantum runs लगें, लेकिन हर quantum run classical sample से कहीं धीमा और महँगा है।
- **इसे गहरे, coherent circuits चाहिए।** Q के कई rounds, हर एक में दो बार A, बिना ग़लती के चलने चाहिए। व्यवहार में इसका मतलब error-corrected मशीनें (भाग F)।
- **A एक quantum circuit होना चाहिए।** आपको A† चाहिए, और जिस probability distribution से sample कर रहे हैं उसे quantum state में कुशलता से भरना चाहिए, जो अक्सर सबसे कठिन हिस्सा है।

असली financial workloads के अध्ययन अनुमान लगाते हैं कि सच्चे फ़ायदे के लिए हज़ारों logical qubits और तेज़ error-corrected gates चाहिए। Amplitude estimation सबसे अच्छी तरह समझे गए quantum speed-ups में से है, और **आख़िरकार** मायने रखने की सबसे ज़्यादा संभावना वालों में, लेकिन आज के हार्डवेयर पर नहीं।

## ख़ुद करके देखें

1. एक प्रक्रिया probability p = 1/400 से सफल होती है। लगभग कितनी classical कोशिशें, और amplitude amplification के कितने rounds चाहिए?
2. p = 0.25 के लिए θ क्या है? कितने rounds k सफलता पक्की करते हैं?
3. कोड वाले उदाहरण में k = 7 rounds के बाद P(111) क्या होगा? (सूत्र लगाएँ।)
4. θ कोण वाली रेखाओं के पार दो बार reflect करने से 2θ का घुमाव क्यों मिलता है?
5. p ≈ 0.5 वाली probability को ±0.001 तक जानने के लिए साधारण sampling को लगभग कितने samples चाहिए? Amplitude estimation को A के लगभग कितने इस्तेमाल (स्थिर गुणक छोड़कर)?
6. Grover search, amplitude amplification की ख़ास स्थिति क्यों है?

**जवाब:**

1. Classically लगभग **400**। θ ≈ √(1/400) = 0.05 rad, तो k ≈ π/(4 × 0.05) ≈ **16 rounds**।
2. sin²θ = ¼ → **θ = 30°**। k = 1 से: (2·1 + 1) × 30° = 90°, तो **एक round** सफलता पक्की करता है।
3. (2·7 + 1) × 7.38° = 110.7°, और sin²(110.7°) ≈ **0.875**: चोटी के पार, गिरता हुआ।
4. हर reflection अपनी आईना-रेखा के सापेक्ष कोण उलट देता है; लगातार दो करने पर रेखाओं के बीच के कोण का दोगुना जुड़ता है (ज्यामिति का मानक तथ्य)।
5. √(0.25/N) = 0.001 → N ≈ **2,50,000** samples। Amplitude estimation को लगभग 1/0.001 ≈ **1,000** इस्तेमाल चाहिए (एक मामूली स्थिर गुणक के साथ)।
6. A = H⊗ⁿ और एक निशान वाली चीज़ के साथ, A|0⟩ बराबर superposition है और p = 1/N; Q ठीक Grover का "oracle फिर diffusion" round है।

## सार

| विचार | सूत्र या तथ्य |
|---|---|
| शुरुआती state | A\|0⟩ = sin θ\|good⟩ + cos θ\|bad⟩, p = sin²θ |
| Classical दोहराव | ~1/p runs |
| एक round | Q = A · S₀ · A† · S_good |
| ज्यामिति | दो reflections = 2θ का घुमाव |
| k rounds के बाद | P(good) = sin²((2k + 1)θ) |
| सबसे अच्छा k | ≈ π/(4θ) − ½ ≈ (π/4)/√p |
| आगे निकलना | ज़्यादा rounds से P फिर घटता है |
| अनजान p | Random schedules (BBHT), या fixed-point amplification |
| Grover | A = H⊗ⁿ, एक निशान वाली चीज़, p = 1/N |
| Amplitude estimation | ग़लती ∝ 1/N (sampling के लिए 1/√N) |
| कैसे | Q के eigenvalues e^(±2iθ); या k = 0, 1, 2, 4, … के नतीजे fit करें |
| इस्तेमाल | Finance में Monte Carlo, counting, integrals |
| शर्त | सिर्फ़ quadratic; गहरे error-corrected circuits और कुशल state loading चाहिए |
