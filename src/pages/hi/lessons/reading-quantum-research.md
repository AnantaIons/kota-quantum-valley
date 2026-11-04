---
layout: ../../../layouts/Post.astro
lang: hi
title: "Quantum research पढ़ना"
description: "Quantum computing papers को बिना भटके या धोखा खाए कैसे पढ़ें। Research कहाँ छपती है, paper की बनावट और three-pass तरीका, संकेतन की phrasebook, headline संख्याएँ कैसे बनती हैं (randomised benchmarking प्रयोग simulate और fit किया), paper के scaling दावे को ख़ुद जाँचना, एक मील के पत्थर वाले abstract की उदाहरण-पढ़ाई, चेतावनी के संकेत, और ताज़ा कैसे रहें।"
date: 2026-11-04
category: lesson
lesson: 48
---

इस course का सब कुछ आख़िरकार research papers से आया: Shor का 1994 का paper, BB84 paper, surface-code papers, Google का Willow paper। Quantum technology इतनी तेज़ चलती है कि textbooks सालों पीछे रहती हैं, और सबसे नए नतीजे सिर्फ़ papers और preprints के रूप में होते हैं। उन्हें पढ़ पाना, कम से कम इतना कि मुख्य दावा समझ आए और परख सकें कि वह भरोसेमंद है या नहीं, सबसे काम की skills में से एक है जो आप बना सकते हैं, चाहे आप research, engineering, निवेश या पत्रकारिता में जाएँ।

Papers विशेषज्ञों के लिए लिखे जाते हैं और घने होते हैं। यह पाठ आपको एक तरीका, एक phrasebook, और अभ्यास देता है: आप देखेंगे कि प्रायोगिक papers की दो सबसे आम headline संख्याएँ (gate fidelity और error-correction गुणक Λ) असल में data से कैसे बनती हैं, और एक मील के पत्थर वाला abstract दावा-दर-दावा पढ़ेंगे।

## Research कहाँ छपती है

- **arXiv** (arxiv.org), **quant-ph** श्रेणी में, वह जगह है जहाँ लगभग हर quantum paper पहले आता है, मुफ़्त **preprint** के रूप में, अक्सर journal में छपने से महीनों पहले। Preprints peer review नहीं होते, तो उन्हें चर्चा में चल रहे दावे मानें।
- **Journals:** Physical Review Letters, Physical Review X और PRX Quantum, Nature, Science और उनके साथी journals, npj Quantum Information, और **Quantum** (एक open-access, समुदाय-संचालित journal)। Peer review कई ग़लतियाँ पकड़ता है लेकिन सब नहीं।
- **Conferences:** QIP (theory), TQC, IEEE Quantum Week (QCE), और APS March Meeting (प्रयोग)।
- **टिप्पणी:** review लेख, विश्वविद्यालयों और companies के research blogs, और Scott Aaronson के *Shtetl-Optimized* जैसे विशेषज्ञ blogs, जो बड़े दावों पर अक्सर दिनों में आलोचनात्मक चर्चा करते हैं।
- **खोज tools:** Google Scholar और Semantic Scholar papers ढूँढते हैं और दिखाते हैं कि उन्हें कौन cite करता है। Citations का आगे ("इस पर किसने बनाया?") और पीछे ("यह किस पर बना?") पीछा करना ही किसी विषय का नक़्शा बनाना है।

## Paper की बनावट

ज़्यादातर papers एक ही ढाँचा मानते हैं:

| हिस्सा | यह क्या बताता है |
|---|---|
| Title और abstract | मुख्य दावा, एक paragraph में। धीरे पढ़ें। |
| Introduction | समस्या क्यों मायने रखती है और पहले क्या ज्ञात था। आख़िरी paragraph आम तौर पर योगदान गिनाता है। |
| Methods / setup | यह कैसे किया गया: device, circuit, protocol, प्रमाण की तकनीक। |
| Results | Data या प्रमेय। Figures प्रायोगिक paper का दिल हैं। |
| Discussion / outlook | सीमाएँ, तुलनाएँ, अगले क़दम। ईमानदार papers अपनी चेतावनियाँ यहीं बताते हैं। |
| Supplementary material | विवरण: calibrations, error विश्लेषण, प्रमाण। अक्सर paper से लंबा। |

एक अच्छा तरीका **three-pass तरीका** है:

1. **पहला pass (10 minutes):** title, abstract, introduction, हिस्सों के शीर्षक, figures, निष्कर्ष। क्या आप मुख्य दावा एक वाक्य में बता सकते हैं? क्या यह आपके लिए प्रासंगिक है?
2. **दूसरा pass (एक घंटा):** पूरा paper पढ़ें, प्रमाण और बारीक विवरण छोड़कर। हर figure ध्यान से देखें: axes, इकाइयाँ, error bars, किसकी किससे तुलना है। जो समझ न आए उसे लिखें।
3. **तीसरा pass (घंटों):** काम को फिर से बनाएँ। मुख्य समीकरण फिर निकालें, simulation फिर चलाएँ, figures से संख्याएँ जाँचें। Researchers यही उन papers के लिए करते हैं जो उनके अपने काम के केंद्र में हैं।

ज़्यादातर papers को सिर्फ़ पहला pass चाहिए। कुछ तीनों के लायक़ हैं।

## संकेतन की phrasebook

| आप देखेंगे | मतलब | पाठ |
|---|---|---|
| \|ψ⟩, ⟨φ\|ψ⟩, ⊗ | State, inner product, tensor product | 3, 12 |
| ρ, Tr(·), Tr_B(·) | Density matrix, trace, partial trace | 16, 32 |
| ⟨O⟩, ⟨ψ\|O\|ψ⟩ | Observable का expectation value | 19 |
| F, "fidelity" | State या gate ideal के कितने पास है (1 = perfect) | 32 |
| U, H, e^(−iHt) | Unitary, Hamiltonian, time evolution | 4, 29 |
| O(·), Ω(·), Θ(·), poly(n) | ऊपरी सीमा, निचली सीमा, कसी सीमा, n में polynomial (asymptotic scaling) | 31 |
| ε, δ | छोटा error या विफलता की probability | 25, 31 |
| BQP, NP | Complexity classes | 31 |
| [[n, k, d]] | Quantum code: n physical, k logical qubits, distance d | 34 |
| T1, T2, T2* | Relaxation और dephasing times | 32 |
| EPG, EPC, "2Q fidelity" | हर gate पर error, हर Clifford पर error, two-qubit gate fidelity | 32, 37 |
| Λ, p_th | Error-दबाव गुणक, threshold | 35 |
| SPAM | State तैयार करने और measurement के errors | 32, 36 |
| QV, CLOPS, EPLG | Quantum volume, हर second circuit layer operations, हर layered gate पर error | 37 |

जब कोई अनजान शब्द आए, उसका पहला इस्तेमाल ढूँढें: papers आम तौर पर शब्दों को वहीं परिभाषित करते हैं या cite करते हैं कि कहाँ परिभाषित हैं।

## Headline संख्याएँ कैसे बनती हैं: randomised benchmarking

जब paper कहता है "single-qubit gate fidelity 99.9%", यह संख्या कहाँ से आती है? आम तौर पर **randomised benchmarking (RB)** से (पाठ 32)। m random Clifford gates लगाओ, फिर वह एक Clifford जो उन सबको उलट दे, ताकि ideal नतीजा हमेशा 0 हो। Noise से m बढ़ने पर 0 पर लौटने की संभावना ("survival probability") घटती है, और उस गिरावट को fit करने से हर gate का औसत error मिलता है, state तैयारी और measurement errors से अलग। यहाँ एक simulated RB प्रयोग और उसका fit है, ठीक प्रायोगिक paper की तरह:

```python
import numpy as np
from scipy.optimize import curve_fit
from qiskit import QuantumCircuit
from qiskit.quantum_info import Clifford, random_clifford
from qiskit_aer import AerSimulator
from qiskit_aer.noise import NoiseModel, depolarizing_error

# Simulate a single-qubit randomised benchmarking experiment, as an experimental paper would run it
noise = NoiseModel()
noise.add_all_qubit_quantum_error(depolarizing_error(0.004, 1), ["h", "s", "sdg", "x", "y", "z", "sx", "sxdg"])
sim = AerSimulator(noise_model=noise, seed_simulator=1)
rng = np.random.default_rng(1)

def rb_circuit(m):
    """m random Clifford gates, then the one inverse that undoes them all; ideally we always return to 0."""
    qc, total = QuantumCircuit(1), Clifford(QuantumCircuit(1))
    for _ in range(m):
        c = random_clifford(1, seed=rng)
        qc.compose(c.to_circuit(), inplace=True)
        total = total.compose(c)
    qc.compose(total.adjoint().to_circuit(), inplace=True)
    qc.measure_all()
    return qc

lengths = [1, 10, 25, 50, 100, 200, 400]
survival = []
for m in lengths:
    circs = [rb_circuit(m) for _ in range(20)]                  # 20 random sequences per length
    counts = sim.run(circs, shots=200).result().get_counts()
    survival.append(np.mean([c.get("0", 0) / 200 for c in counts]))

decay = lambda m, A, p, B: A * p ** m + B                       # the standard RB model
(A, p, B), cov = curve_fit(decay, lengths, survival, p0=[0.5, 0.99, 0.5])
for m, s in zip(lengths, survival):
    print(f"sequence length {m:4d}: survival {s:.3f}")
print(f"\nfitted p = {p:.5f} ± {np.sqrt(cov[1, 1]):.5f}  →  error per Clifford = (1 - p)/2 = {(1 - p) / 2:.2e}")
```

```text
sequence length    1: survival 0.992
sequence length   10: survival 0.957
sequence length   25: survival 0.905
sequence length   50: survival 0.829
sequence length  100: survival 0.709
sequence length  200: survival 0.585
sequence length  400: survival 0.517

fitted p = 0.99144 ± 0.00023  →  error per Clifford = (1 - p)/2 = 4.28e-03
```

Survival probability 99% से 50% (पूरी तरह random qubit) की ओर गिरती है, और fit A·pᵐ + B देता है p ≈ 0.9914, लगभग 0.4% का **हर Clifford पर error**, simulator में डाले noise से मेल खाता। Parameters A और B तैयारी और measurement errors सोख लेते हैं, इसीलिए RB पर भरोसा किया जाता है: यह gates को अलग कर देता है। जब आप "RB fidelity" पढ़ें, ठीक यह curve सोचें, और जाँचें कि paper उसे दिखाता है या नहीं, कितने क्रमों का औसत लिया गया, और error bars बताए गए या नहीं।

## Scaling दावे को ख़ुद जाँचना

Error-correction papers **scaling** के दावे करते हैं: "हर बार code distance 2 बढ़ने पर logical error rate Λ गुना दबता है।" आप ऐसा दावा paper की अपनी संख्याओं से जाँच सकते हैं। यहाँ surface-code प्रयोग की शैली में हर cycle के उदाहरणात्मक logical error rates हैं:

```python
import numpy as np

# Illustrative numbers in the style of a surface-code paper: logical error per cycle at distances 3, 5, 7
d = np.array([3, 5, 7])
eps = np.array([6.5e-3, 3.0e-3, 1.4e-3])

# The claim "each step d → d + 2 divides the error by Λ" means log(ε) is a straight line in d
slope, intercept = np.polyfit(d, np.log(eps), 1)
Lam = np.exp(-2 * slope)
print("ratios between neighbours:", np.round(eps[:-1] / eps[1:], 2))
print(f"fitted Λ = {Lam:.2f}")
for dist in [9, 11, 15, 25]:
    print(f"extrapolated logical error at d = {dist:2d}: {np.exp(intercept + slope * dist):.1e} per cycle")
```

```text
ratios between neighbours: [2.17 2.14]
fitted Λ = 2.15
extrapolated logical error at d =  9: 6.5e-04 per cycle
extrapolated logical error at d = 11: 3.0e-04 per cycle
extrapolated logical error at d = 15: 6.5e-05 per cycle
extrapolated logical error at d = 25: 1.4e-06 per cycle
```

दोनों पड़ोसी अनुपात (2.17 और 2.14) मेल खाते हैं, और distance के मुक़ाबले log(error) की सीधी रेखा fit करने से Λ ≈ 2.15 मिलता है। उस रेखा को आगे बढ़ाने से लगता है कि distance 25 हर cycle लगभग 10⁻⁶ errors तक पहुँचेगा। लेकिन देखें कि यह आगे बढ़ाना क्या **मानता** है: कि वही Λ कहीं बड़ी distances पर भी टिकेगा, कोई नया error स्रोत (जैसे cosmic rays से दुर्लभ correlated errors, पाठ 32) आए बिना। तीन data points यह साबित नहीं कर सकते। अच्छे papers यह कहते हैं; अच्छे पाठक यह देखते हैं।

## उदाहरण-पढ़ाई: threshold से नीचे error correction

आइए surface-code threshold से नीचे quantum error correction पर Google के मील के पत्थर वाले paper (Nature में प्रकाशित, preprint 2024 में) के मुख्य दावे पढ़ें, जैसे आप पहले pass में पढ़ते। सार में इसका abstract बताता है:

1. 105-qubit processor (Willow) पर **दो surface-code memories**: distance 7 (101 qubits इस्तेमाल करके) और distance 5। *क्या जाँचें:* qubit संख्या ख़ुद code के लिए है (data और measure qubits, और कुछ अतिरिक्त); यह memory प्रयोग है, एक logical qubit रखना, logical gates चलाना नहीं।
2. Distance 7 पर **हर cycle 0.143% logical error rate**। *क्या जाँचें:* error correction के हर cycle पर, हर logical operation पर नहीं; paper परिभाषित करता है कि cycle क्या गिना जाता है।
3. Distance 5 से 7 जाने पर **Λ = 2.14 ± 0.02**। *क्या जाँचें:* यही threshold दावा है (पाठ 35); अनिश्चितता छोटी है, लेकिन यह सिर्फ़ कुछ distances से आती है, ऊपर के अभ्यास की तरह।
4. **Logical qubit सबसे अच्छे physical qubit से 2.4 ± 0.3 गुना ज़्यादा टिकता है।** *क्या जाँचें:* "beyond breakeven" **सबसे अच्छे** physical qubit से नापा गया है, एक उचित और कठिन आधार।
5. Distance 5 पर **real-time decoding**, लाख cycles तक 1.1 µs cycle के साथ चलते हुए। *क्या जाँचें:* real time distance 5 पर दिखाया गया, जबकि distance 7 के नतीजों में offline decoding इस्तेमाल हुई, एक सामान्य सीमा जिस पर paper साफ़ है।
6. **सीमाएँ:** paper दुर्लभ correlated error झोंकों की बात करता है जो कहीं बड़ी distances पर logical error rates की निचली सीमा तय करेंगे। *क्या जाँचें:* लेखकों की अपनी चर्चा कि scaling को क्या रोक सकता है।

इस तरह दावा-दर-दावा पढ़ना, "किससे तुलना?" और "किन हालात में?" पूछते हुए, एक डराने वाले paper को समझने लायक़ कथनों के set में बदल देता है, और आपको एक उचित एक-paragraph सार लिखने देता है।

## चेतावनी के संकेत और अच्छे संकेत

| चेतावनी के संकेत | अच्छे संकेत |
|---|---|
| कमज़ोर या भोले classical आधार के मुक़ाबले speed-up का दावा | सबसे अच्छे ज्ञात classical तरीके से तुलना, अक्सर स्वतंत्र विशेषज्ञों द्वारा |
| सिर्फ़ qubit संख्या, कोई error rates नहीं | पूरा विवरण: gate errors, coherence, readout, crosstalk |
| बिना error bars के "तक" वाली संख्याएँ | हर मुख्य संख्या पर अनिश्चितताएँ, और उनका अनुमान कैसे लगा |
| चुनकर लिए उदाहरणों पर नतीजे | कई उदाहरण, कठिन वाले भी, और चुनाव की व्याख्या |
| कोई code या data नहीं | खुला code और data जो दूसरों को नतीजे दोहराने दे |
| Paper से पहले press release | घोषणा के साथ paper और supplementary material उपलब्ध |
| Asymptotic दावे (O(·)) व्यावहारिक speed-ups की तरह पेश | ठोस resource अनुमान: qubits, gates, run time, असली error rates पर |

## ताज़ा कैसे रहें

- **थोड़ा, नियमित पढ़ें।** हफ़्ते में एक-दो बार नए quant-ph preprints के titles देखें, और एक paper का पहला pass करें।
- **Reviews और tutorials से शुरू करें।** Review लेख references के साथ पूरे क्षेत्र का सार देते हैं, और tutorials (जैसे Qiskit का documentation और IBM का learning platform) तरीके code में दिखाते हैं।
- **कुछ दोहराएँ।** किसी paper का छोटा simulation फिर चलाएँ, जैसे आपने इस course में किया। यह समझने का सबसे तेज़ तरीका है कि नतीजे का असल में क्या मतलब है।
- **समुदायों से जुड़ें।** Open-source projects (Qiskit, Stim, Mitiq), online forums, hackathons और quantum challenges वह जगह हैं जहाँ छात्र और पेशेवर मिलते हैं, और जहाँ कई careers शुरू होते हैं।
- **क्लासिक textbook:** Nielsen और Chuang की *Quantum Computation and Quantum Information* आज भी मानक reference है; इस course ने आपको उसका ज़्यादातर हिस्सा पढ़ने की पृष्ठभूमि दे दी है।

## आज़माकर देखें

1. Preprint और प्रकाशित paper में क्या अंतर है, और इससे आपके भरोसे पर क्या असर होना चाहिए?
2. Three-pass तरीके में पहले pass के बाद आपको क्या कह पाना चाहिए?
3. RB fit में सिर्फ़ pᵐ fit करने के बजाय parameters A और B क्यों शामिल हैं?
4. अगर पड़ोसी distances 2.2 और 1.4 के अनुपात दें, तो दावा किए exponential दबाव के बारे में आप क्या निष्कर्ष निकालेंगे?
5. "सबसे अच्छे physical qubit से 2.4 गुना ज़्यादा" दावा "औसत physical qubit से ज़्यादा" से मज़बूत क्यों है?
6. एक paper O(√N) quantum algorithm का दावा करता है। व्यावहारिक रूप से काम का मानने से पहले आपको और क्या जानकारी चाहिए?
7. Quantum advantage दावे के भरोसेमंद होने के दो अच्छे संकेत बताएँ।

**जवाब:**

1. Preprint का अभी peer review नहीं हुआ। वह बढ़िया हो सकता है, लेकिन चर्चा में दावा है; विशेषज्ञों की प्रतिक्रियाएँ, बाद के versions और आख़िरकार प्रकाशन देखें। प्रकाशन कुछ जाँच जोड़ता है, लेकिन सही होने की गारंटी नहीं।
2. Paper के मुख्य दावे का एक-वाक्य कथन, paper किस क़िस्म का है (theory, प्रयोग, simulation, review), और आगे पढ़ने लायक़ है या नहीं।
3. A और B **state तैयारी और measurement errors** (और पूरी तरह random qubit के 50% तल) को सोखते हैं, ताकि p सिर्फ़ gates दिखाए। सिर्फ़ pᵐ fit करने से SPAM errors gate error में मिल जाते।
4. दबाव एक जैसा नहीं: बड़ी distance पर गुणक गिरता है, जो नए error स्रोत या अलग व्यवस्था का संकेत है। आगे बढ़ाने से पहले आप ज़्यादा distances और लेखकों की व्याख्या चाहेंगे।
5. यह सबसे कठिन physical आधार से तुलना करता है। औसत को हराना आसान है; सबसे अच्छे को हराना दिखाता है कि error correction सचमुच उससे बेहतर कर रहा है जो hardware अकेले कर सकता है।
6. ठोस स्थिरांक और overheads: logical qubits और T gates की संख्या, data भरने और पढ़ने की क़ीमत, error-correction overhead, run time, और व्यावहारिक आकारों पर सबसे अच्छा classical algorithm कैसा करता है (पाठ 31 और 46)।
7. जैसे: सबसे अच्छे classical तरीकों से तुलना (अच्छा हो तो स्वतंत्र समूहों द्वारा जाँची); अनिश्चितताओं के साथ पूरा error विवरण; खुला data और code; कई समस्या उदाहरण; ठोस resource अनुमान।

## सार-सूत्र

| विचार | सूत्र या तथ्य |
|---|---|
| Papers कहाँ आते हैं | arXiv quant-ph (preprints), PRL/PRX Quantum/Nature/Science/Quantum, QIP/QCE/APS March |
| तीन passes | दावे के लिए सरसरी नज़र; figures के साथ पढ़ना; फिर से बनाना और दोहराना |
| Abstract | मुख्य दावा; धीरे पढ़ें, संख्याएँ और शर्तें नोट करें |
| Randomised benchmarking | Survival = A·pᵐ + B; हर Clifford पर error = (1 − p)/2 (एक qubit) |
| SPAM | तैयारी और measurement errors, RB से अलग किए |
| Data से Λ | d के मुक़ाबले log(ε) fit करें; Λ = e^(−2·slope); आगे बढ़ाने से सावधान |
| उदाहरण | Willow: d = 7, 0.143%/cycle, Λ = 2.14, सबसे अच्छे physical qubit से 2.4× |
| सवाल | किससे तुलना? किन हालात में? कितनी अनिश्चितता के साथ? |
| चेतावनी के संकेत | कमज़ोर आधार, error bars नहीं, चुने उदाहरण, data नहीं, paper से पहले press |
| ताज़ा रहना | हफ़्ते में सरसरी नज़र, reviews पढ़ें, दोहराएँ, समुदायों से जुड़ें, Nielsen और Chuang |
