---
layout: ../../../layouts/Post.astro
lang: hi
title: "Probability और वे प्रयोग जिन्होंने physics बदल दी"
description: "Quantum computing के लिए ज़रूरी probability (expected value, फैलाव, कितने shots), फिर वे चार प्रयोग जिन्होंने physicists को quantum mechanics बनाने पर मजबूर किया: photons, double slit, तीन polarisers और Stern–Gerlach, हर एक Python में simulate किया हुआ।"
date: 2026-11-04
category: lesson
lesson: 5

---

Quantum computers **random जवाब** देते हैं। एक ही circuit दो बार चलाएँ तो अलग नतीजे मिल सकते हैं। तो सबसे पहले आपको probability के साथ सहज होना होगा: इसका मतलब क्या है, इससे गणना कैसे करें, और नतीजे पर भरोसा करने के लिए प्रयोग कितनी बार दोहराना पड़ता है।

फिर हम देखेंगे कि प्रकृति ऐसे **क्यों** चलती है। चार मशहूर प्रयोग, हर एक इतना आसान कि एक पैराग्राफ़ में बताया जा सके, ने classical physics तोड़ दी और quantum mechanics बनाने पर मजबूर किया। हर एक छिपा हुआ qubit है, और पाठ के अंत तक आप हर एक को पाठ 3 और 4 की vector भाषा में बता पाएँगे।

## भाग 1: quantum computing के लिए probability

### बुनियादी नियम

**Probability** 0 (कभी नहीं होता) से 1 (हमेशा होता है) तक का नंबर है। कई संभव **नतीजों** वाले प्रयोग के लिए:

| नियम | सूत्र | उदाहरण (ठीक पासा) |
|---|---|---|
| हर probability 0 और 1 के बीच | 0 ≤ P ≤ 1 | P(6) = 1/6 |
| सभी नतीजों का जोड़ 1 | P(1) + … + P(6) = 1 | 6 × 1/6 = 1 |
| न होना | P(A नहीं) = 1 − P(A) | P(6 नहीं) = 5/6 |
| A **या** B, अगर दोनों एक साथ न हो सकें | P(A या B) = P(A) + P(B) | P(5 या 6) = 2/6 |
| A **और** B, अगर स्वतंत्र हों | P(A और B) = P(A) × P(B) | P(6 फिर 6) = 1/36 |

0/1 basis में measure किए qubit के सिर्फ़ दो नतीजे हैं, तो सब कुछ एक नंबर p = P(1) से बताया जाता है, और P(0) = 1 − p।

### Expected value

**Expected value** लंबे समय का औसत नतीजा है। हर नतीजे की value को उसकी probability से गुणा करके जोड़ें:

> E[X] = Σ (value × probability)

P(1) = 0.3 वाला qubit, "1" के लिए 1 और "0" के लिए 0 लिखकर: E = 0×0.7 + 1×0.3 = 0.3। इसे 1,000 बार measure करें तो लगभग **300 ones** की उम्मीद है।

Physicists अक्सर नतीजों को +1 और −1 label देते हैं (Z के eigenvalues, पाठ 4)। तब E[Z] = (+1)×0.7 + (−1)×0.3 = **0.4**। इसे Z का **expectation value** कहते हैं, ⟨Z⟩ लिखते हैं, और variational algorithms (पाठ 30) में यह बार-बार दिखेगा।

### Shots और नतीजों का फैलाव

असली quantum computer आपको सीधे probability नहीं बता सकता। हर बार चलाने पर वह सिर्फ़ एक 0 या 1 देता है। Probabilities का अनुमान लगाने के लिए circuit बहुत बार दोहराते हैं। हर दोहराव को **shot** कहते हैं।

N shots और असली probability p के साथ, दिखने वाले 1s की संख्या **binomial distribution** मानती है:

> 1s की औसत संख्या = N·p
> आम फैलाव (standard deviation) = √(N·p·(1 − p))

50/50 qubit और 1,000 shots के लिए: औसत 500, फैलाव √(1000 × 0.5 × 0.5) ≈ **15.8**। तो आमतौर पर लगभग 484 से 516 ones दिखेंगे, और लगभग हमेशा 470 से 530 के बीच (दो फैलाव के अंदर)। पाँच अलग runs simulate करके जाँचें:

```python
import numpy as np
rng = np.random.default_rng(7)

# A fair 50/50 qubit measured 1,000 times, in five separate runs
for run in range(5):
    ones = rng.binomial(1000, 0.5)
    print("run", run + 1, "->", 1000 - ones, "zeros,", ones, "ones")
print("expected spread:", round(np.sqrt(1000 * 0.5 * 0.5), 1))
```

```text
run 1 -> 500 zeros, 500 ones
run 2 -> 512 zeros, 488 ones
run 3 -> 514 zeros, 486 ones
run 4 -> 526 zeros, 474 ones
run 5 -> 506 zeros, 494 ones
expected spread: 15.8
```

(`default_rng(7)` लाइन random seed तय करती है ताकि ठीक यही नंबर मिलें। 7 हटाएँ तो हर बार अलग मिलेंगे।)

हर run थोड़ा अलग है, और किस्मत के सिवा कोई ठीक 500/500 नहीं है। **यह सामान्य है।** असली circuits चलाने पर आपको यही बिखराव दिखेगा, और आपको बिखराव और असली असर में फ़र्क़ करना होगा।

### कितने shots चाहिए?

p का आपका अनुमान (1s की संख्या) / N है। इसकी अनिश्चितता, फैलाव को N से भाग देकर:

> p में अनिश्चितता ≈ √(p(1 − p) / N)

| Shots N | p = 0.5 के लिए अनिश्चितता |
|---|---|
| 100 | ±5% |
| 1,000 | ±1.6% |
| 10,000 | ±0.5% |
| 1,000,000 | ±0.05% |

वर्गमूल पर ध्यान दें: **अनिश्चितता आधी करने के लिए चार गुना shots चाहिए।** यह वर्गमूल का नियम बार-बार लौटेगा, error mitigation (पाठ 36) से quantum sensing (पाठ 44) तक, जहाँ इसे हराना ही पूरा मक़सद है।

### दो तरह की randomness

सिक्का उछालने पर नतीजा सिर्फ़ इसलिए random है क्योंकि आपको सटीक बल, हवा वग़ैरह नहीं पता। पूरी जानकारी हो तो अनुमान लगाया जा सकता है। यह **अज्ञान** से आई randomness है।

Quantum randomness अलग लगती है: जहाँ तक हर प्रयोग बता सकता है, नतीजा पहले से **कुछ भी** तय नहीं करता। (|0⟩ + |1⟩)/√2 state वाला qubit चुपके से "नहीं जानता" कि वह 0 देगा। पाठ 15 वह प्रयोग समझाता है (Bell tests, 2022 का Nobel Prize) जो सबसे स्वाभाविक तरह की छिपी जानकारी को ख़ारिज करता है।

## भाग 2: वे प्रयोग जिन्होंने physics तोड़ दी

1900 के आसपास physics लगभग पूरी लगती थी। फिर कई प्रयोगों ने ऐसे नतीजे दिए जिन्हें कोई classical theory नहीं समझा सकी। Quantum computing के लिए सबसे ज़रूरी चार ये हैं।

### प्रयोग 1: रोशनी गुच्छों में आती है

धातु पर रोशनी डालें तो electrons उछलकर निकलते हैं। यह **photoelectric effect** है। Classical physics का अनुमान था कि तेज़ रोशनी electrons को ज़्यादा energy देगी। प्रयोगों ने कुछ और कहा: चमक से **कितने** electrons निकलते हैं वह बदला, लेकिन उनकी energy सिर्फ़ रोशनी के **रंग** (frequency) पर निर्भर थी। एक ख़ास frequency से नीचे, रोशनी कितनी भी तेज़ हो, कोई electron नहीं निकला।

1905 में Einstein ने समझाया: रोशनी अलग-अलग गुच्छों में आती है, जिन्हें बाद में **photons** कहा गया, हर एक की energy

> E = h·f

जहाँ f frequency है और h Planck constant (6.63 × 10⁻³⁴ J·s)। एक photon एक electron निकालता है। ज़्यादा चमक मतलब ज़्यादा photons, ज़्यादा ताक़तवर नहीं। (इसी के लिए Einstein को 1921 का Nobel Prize मिला, relativity के लिए नहीं।)

हमारे लिए क्यों ज़रूरी: रोशनी **एक-एक photon** करके भेजी जा सकती है, और एक photon एक qubit ले जा सकता है। Quantum communication (पाठ 41 और 42) इसी पर बना है।

### प्रयोग 2: double slit, एक-एक कण

दो पतली, पास-पास की slits से रोशनी स्क्रीन पर डालें, तो चमकीली और अँधेरी **धारियाँ** (fringes) दिखती हैं। Waves के साथ यह समझाना आसान है: दोनों slits की waves वहाँ जुड़ती हैं जहाँ शिखर मिलें, और वहाँ कटती हैं जहाँ शिखर, गर्त से मिले।

अब इसे अजीब बनाइए। Source को इतना धीमा करें कि एक समय में **एक कण** जाए: एक photon, या एक electron। (Electrons के साथ यह 1989 में Hitachi में Akira Tonomura की टीम ने किया, और तब से 60 carbon atoms वाले पूरे molecules के साथ भी हो चुका है।) हर कण स्क्रीन पर **एक बिंदु** की तरह गिरता है, जैसे कण को गिरना चाहिए। लेकिन हज़ारों बिंदुओं के बाद **धारियाँ उभर आती हैं।** स्क्रीन की कुछ जगहों पर अक्सर कण गिरते हैं, कुछ पर लगभग कभी नहीं, उन जगहों सहित जहाँ सिर्फ़ एक slit खुली होने पर कण गिरते।

इसे नंबरों में कहें। P₁ किसी बिंदु पर गिरने की probability है जब सिर्फ़ slit 1 खुली हो, और P₂ जब सिर्फ़ slit 2। Classical सामान्य समझ कहती है कि दोनों खुली हों तो P = P₁ + P₂। **यह ग़लत है।** अँधेरी धारियों पर P = 0, जबकि P₁ और P₂ दोनों positive हैं।

इसकी जगह पाठ 2 और 3 का नियम काम करता है: हर रास्ते का एक complex **amplitude** है, ψ₁ और ψ₂, और

> **P = |ψ₁ + ψ₂|²**   (पहले amplitudes जोड़ें, फिर वर्ग करें)

ψ₁ और ψ₂ के बीच phase अंतर, हर slit से स्क्रीन के उस बिंदु तक की दूरी के अंतर पर निर्भर है। जहाँ phases मिलें, amplitudes जुड़ते हैं (चमकीला)। जहाँ 180° का अंतर हो, कट जाते हैं (अँधेरा)। यह ठीक पाठ 2 की 2 + 2cos θ वाली table है।

और सबसे अजीब हिस्सा यह है। Slits पर एक detector लगाइए यह जानने के लिए कि हर कण **किस slit** से गया। धारियाँ **ग़ायब** हो जाती हैं, और pattern P₁ + P₂ बन जाता है। जैसे ही रास्ते पहचाने जा सकें, उनके amplitudes नहीं जुड़ते। "किस रास्ते से" की जानकारी interference मिटा देती है।

```python
import numpy as np
x = np.linspace(-1, 1, 17)          # 17 positions across the screen
phase = 4 * np.pi * x               # phase difference between the two paths
psi1 = np.ones_like(x) / np.sqrt(2)         # amplitude via slit 1
psi2 = np.exp(1j * phase) / np.sqrt(2)      # amplitude via slit 2

both_open  = np.abs(psi1 + psi2) ** 2                 # add amplitudes, then square
which_path = np.abs(psi1) ** 2 + np.abs(psi2) ** 2    # add probabilities
print(np.round(both_open, 2))
print(np.round(which_path, 2))
```

```text
[2. 1. 0. 1. 2. 1. 0. 1. 2. 1. 0. 1. 2. 1. 0. 1. 2.]
[1. 1. 1. 1. 1. 1. 1. 1. 1. 1. 1. 1. 1. 1. 1. 1. 1.]
```

पहली लाइन धारियों वाला pattern है: चमकीला (2), आधा (1), अँधेरा (0), बार-बार। दूसरी, रास्ते की जानकारी के साथ, सपाट है। वही कण, वही slits; फ़र्क़ सिर्फ़ इतना कि दोनों रास्ते पहचाने जा सकते थे या नहीं।

**Qubit से रिश्ता:** "slit 1 से गया" और "slit 2 से गया" दो basis states हैं, |0⟩ और |1⟩। दोनों slits से गुज़रता कण superposition में है। स्क्रीन एक अलग basis में measurement है। Quantum computer का पूरा ढाँचा यही है: qubit को superposition में डालो, amplitudes को interfere होने दो, फिर measure करो।

### प्रयोग 3: तीन polarisers

रोशनी का एक **polarisation** होता है: वह दिशा जिसमें उसका electric field हिलता है। Polarising filter (जैसे धूप के चश्मे या 3D-सिनेमा के lens में) अपनी axis के साथ polarised रोशनी जाने देता है और समकोण वाली रोक देता है।

Filter की axis से θ कोण पर polarised रोशनी का जितना हिस्सा निकलता है:

> **cos²θ**  (Malus का नियम, 1809)

एक photon के स्तर पर यह probability बन जाता है: हर photon या तो **पूरा निकलता है** या **पूरा सोख लिया जाता है**, और cos²θ probability से निकलता है। जो photon निकलता है वह filter की axis के साथ polarised होकर निकलता है, पहले चाहे जो रहा हो।

अब पहेली। 0° पर polarised photons से शुरू करें।

- उन्हें **90°** वाले filter में भेजें: cos²90° = 0। **कुछ नहीं** निकलता।
- अब बीच में **45°** पर तीसरा filter लगाएँ, क्रम 0° → 45° → 90°। Filter जोड़ने से तो रोशनी और ज़्यादा ही रुकनी चाहिए?

लेकिन रोशनी **निकलती है।** हर photon 45° filter से cos²45° = ½ probability से निकलता है, और 45° पर polarised होकर निकलता है। फिर वह 90° filter से 45° के कोण पर मिलता है, और फिर ½ probability से निकलता है। कुल: **¼ photons निकल जाते हैं।** एक filter जोड़ने से वहाँ रोशनी आ गई जहाँ पहले बिल्कुल नहीं आती थी।

```python
import numpy as np
rng = np.random.default_rng(1)
def malus(angle_deg):                       # chance a photon passes a polariser
    return np.cos(np.radians(angle_deg)) ** 2

photons = 100_000                           # all start polarised at 0 degrees
direct = rng.random(photons) < malus(90)                    # 0 -> 90
via45  = (rng.random(photons) < malus(45)) & (rng.random(photons) < malus(45))  # 0 -> 45 -> 90
print("straight to 90:", direct.sum())
print("via 45 then 90:", via45.sum())
```

```text
straight to 90: 0
via 45 then 90: 25065
```

लगभग एक चौथाई, जैसा अनुमान था। बीच वाला filter एक **measurement** है जो state बदल देता है: वह photon की 0° वाली याद मिटा देता है।

**Qubit से रिश्ता:** क्षैतिज polarisation |0⟩ है और ऊर्ध्व |1⟩। 45° वाला polarisation |+⟩ = (|0⟩ + |1⟩)/√2 है, और 135° वाला |−⟩। Probability cos²45° = ½ ठीक पाठ 3 का |⟨+|0⟩|² = (1/√2)² है। हर filter एक basis में measurement है। (Lab में polarisation कोण θ, पाठ 7 के Bloch sphere पर 2θ कोण के बराबर है। इसीलिए lab में 90° अलग polarisations, उल्टी और पूरी तरह पहचानी जा सकने वाली states हैं।)

### प्रयोग 4: Stern–Gerlach, प्रकृति में मिला पहला qubit

1922 में Otto Stern और Walther Gerlach ने silver atoms की एक धारा ऐसे magnet से गुज़ारी जिसका field एक तरफ़ दूसरी से ज़्यादा तेज़ था। हर silver atom एक छोटे bar magnet की तरह बर्ताव करता है (उसके सबसे बाहरी electron के एक गुण की वजह से, जिसे बाद में **spin** कहा गया), तो असमान field उसे ऊपर या नीचे धकेलता है, इस पर निर्भर कि उसका छोटा magnet किधर इशारा कर रहा है।

Classically, atoms के magnets random दिशाओं में होते हैं, तो स्क्रीन पर एक **फैला हुआ धब्बा** दिखना चाहिए था: पूरे ऊपर से पूरे नीचे तक हर मात्रा का मुड़ना। इसकी जगह उन्हें **दो अलग धब्बे** दिखे: ऊपर और नीचे, बीच में कुछ नहीं। Spin, किसी भी दिशा में नापने पर, **सिर्फ़ दो जवाब** देता है। यह प्राकृतिक दो-स्तर वाला system है: एक qubit।

अब magnets को एक के बाद एक लगाइए:

1. **Magnet 1, z के साथ:** सिर्फ़ "ऊपर" गए atoms रखें। उन्हें **एक और z magnet** से गुज़ारें: 100% फिर ऊपर जाते हैं। अब तक सब classical: atoms याद रखते हैं।
2. **Magnet 2, x के साथ** (बग़ल में घुमाया हुआ): "ऊपर-z" वाले atoms **50/50** में "+x" और "−x" में बँटते हैं। सिर्फ़ +x वाली धारा रखें।
3. **Magnet 3, फिर से z के साथ:** आप सोचेंगे कि ये सब atoms ऊपर जाएँगे, क्योंकि पहले ये सब "ऊपर-z" थे। इसकी जगह ये फिर **50/50** बँटते हैं।

x के साथ measure करने ने z की जानकारी **मिटा** दी। Atom के अंदर कोई छिपा रिकॉर्ड नहीं है कि "मैं z में ऊपर और x में plus हूँ"। यह रहा वह प्रयोग, पाठ 3 के vectors से simulate किया हुआ:

```python
import numpy as np
rng = np.random.default_rng(3)
up, down = np.array([1, 0]), np.array([0, 1])
plus, minus = (up + down) / np.sqrt(2), (up - down) / np.sqrt(2)

def measure(state, basis):
    """Measure in a basis (pair of states). Return the result and the new state."""
    p0 = abs(np.vdot(basis[0], state)) ** 2
    return (0, basis[0]) if rng.random() < p0 else (1, basis[1])

counts = [0, 0]
for _ in range(10_000):
    s = up                                  # atom from the first magnet's "up" beam
    r, s = measure(s, (plus, minus))        # second magnet: along x
    if r == 0:                              # keep only the "+x" beam
        r, s = measure(s, (up, down))       # third magnet: along z again
        counts[r] += 1
print("third magnet: up", counts[0], "  down", counts[1])
```

```text
third magnet: up 2566   down 2469
```

लगभग 5,000 atoms x filter से बचे, और तीसरे magnet पर बराबर बँटे। `measure` function में quantum measurement के वे दो नियम हैं जिन्हें पाठ 8 सटीक बनाएगा: probability |⟨basis state|ψ⟩|² है, और उसके बाद state **वही basis state बन जाती है।**

**Qubit से रिश्ता:** z के साथ spin ऊपर और नीचे |0⟩ और |1⟩ हैं; +x और −x के साथ spin |+⟩ और |−⟩ हैं। Trapped ions और neutral atoms से बने असली quantum computers (पाठ 39) ठीक इसी तरह के atomic दो-स्तर systems इस्तेमाल करते हैं।

## चारों प्रयोग क्या सिखाते हैं

इन्हें साथ रखें तो quantum mechanics के नियम लगभग अपने आप लिख जाते हैं:

| प्रयोग | क्या दिखाया | किस नियम तक ले गया |
|---|---|---|
| Photoelectric effect | रोशनी अकेले photons में आती है | Quantum systems को एक-एक करके संभाला जा सकता है |
| Double slit | Amplitudes जुड़ते हैं, फिर वर्ग; रास्ते की जानकारी interference मिटाती है | States complex amplitudes के vectors हैं; P = \|amplitude\|² |
| तीन polarisers | Measurement state बदल देता है | Measure करने के बाद state नतीजा बन जाती है |
| Stern–Gerlach | सिर्फ़ दो नतीजे; एक दिशा नापना दूसरी मिटा देता है | दो-स्तर systems (qubits) होते हैं; अलग bases अलग सवाल हैं |

एक और नियम है, इस बारे में कि measurements के **बीच** states कैसे बदलती हैं: unitary matrices से (पाठ 4), सहज और reversible तरीके से। इसके साथ एक qubit की पूरी नियमावली आपके पास है, और भाग B उसे इस्तेमाल करना सीखने के बारे में है।

## ख़ुद करके देखें

1. एक qubit 0.2 probability से 1 देता है। 500 shots में 1s की अपेक्षित संख्या और आम फैलाव क्या है?
2. नतीजों पर +1 (0 के लिए) और −1 (1 के लिए) label लगाकर, उस qubit का ⟨Z⟩ क्या है?
3. आप 0.5 के पास की probability को ±1% तक जानना चाहते हैं। लगभग कितने shots चाहिए?
4. Double-slit simulation में, जहाँ phase अंतर 90° हो, वहाँ probability क्या है? रास्ते की जानकारी वाली value से तुलना करें।
5. 0° पर polarised photons पहले 30° और फिर 60° वाले filters से गुज़रते हैं। कितना हिस्सा निकलता है? (cos² लगाएँ।)
6. Stern–Gerlach श्रृंखला में, शुरुआती "ऊपर-z" atoms का कितना हिस्सा तीसरे magnet पर "नीचे-z" में पहुँचता है?

**जवाब:**

1. 500 × 0.2 = **100**; फैलाव √(500 × 0.2 × 0.8) = √80 ≈ **8.9**।
2. ⟨Z⟩ = (+1)(0.8) + (−1)(0.2) = **0.6**।
3. √(0.25/N) = 0.01 से N = 0.25/0.0001 = **2,500 shots**।
4. |ψ₁ + ψ₂|² = 2 × ½ × (1 + cos 90°) = **1**, रास्ते की जानकारी वाली value जितना: 90° पर दोनों तरह कोई interference नहीं।
5. cos²30° × cos²30° = 0.75 × 0.75 = **0.5625**।
6. आधे x filter से निकलते हैं, फिर उनमें से आधे नीचे जाते हैं: **¼**।

## सार

| विचार | सूत्र या तथ्य |
|---|---|
| Probabilities | 0 ≤ P ≤ 1, सब नतीजों का जोड़ 1 |
| A नहीं | 1 − P(A) |
| स्वतंत्र A और B | P(A) × P(B) |
| Expected value | Σ value × probability |
| ⟨Z⟩ | P(0) − P(1) |
| Shots | Probabilities के अनुमान के लिए circuit N बार दोहराएँ |
| गिनती में फैलाव | √(N·p·(1 − p)) |
| p में अनिश्चितता | √(p(1 − p)/N); 4× shots से आधी |
| Photon की energy | E = h·f |
| Double slit | P = \|ψ₁ + ψ₂\|², P₁ + P₂ नहीं |
| रास्ते की जानकारी | Interference मिटा देती है |
| Malus का नियम | निकलने वाला हिस्सा = cos²θ; हर photon के लिए probability |
| तीन polarisers | 0° → 45° → 90° से ¼ निकलता है |
| Stern–Gerlach | Spin के सिर्फ़ दो नतीजे; प्राकृतिक qubit |
| लगातार measurement | x नापना z की जानकारी मिटा देता है |
| Measurement नियम (झलक) | P = \|⟨नतीजा\|ψ⟩\|²; state नतीजा बन जाती है |
