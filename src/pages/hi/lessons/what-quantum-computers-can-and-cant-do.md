---
layout: ../../../layouts/Post.astro
lang: hi
title: "Quantum computers क्या कर सकते हैं और क्या नहीं"
description: "Quantum speed-ups का ईमानदार नक़्शा: complexity classes P, NP और BQP, quantum computers NP-complete समस्याएँ तेज़ी से लगभग पक्का क्यों हल नहीं कर सकते, किन समस्याओं में exponential, quadratic या कोई speed-up नहीं, data भरने और पढ़ने की रुकावटें, quadratic speed-up कब असल में फ़ायदा देता है (गणना के साथ), और 2019–2025 के 'quantum advantage' प्रयोगों ने क्या दिखाया और क्या नहीं।"
date: 2026-11-04
category: lesson
lesson: 31

---

अब आप मुख्य quantum algorithms देख चुके हैं: Deutsch–Jozsa, Bernstein–Vazirani, Simon, Grover, amplitude amplification, QFT, phase estimation, Shor, simulation और variational तरीके। यह पाठ एक क़दम पीछे हटकर वह सवाल पूछता है जो क्षेत्र के बाहर हर कोई सबसे पहले पूछता है: **तो quantum computer असल में बेहतर क्या कर सकता है?**

ईमानदार जवाब: कुछ ज़रूरी चीज़ें, बहुत बेहतर; कुछ चीज़ें, थोड़ा बेहतर; और ज़्यादातर चीज़ें, बिल्कुल बेहतर नहीं। कौन-सा कौन है, यह जानना ही quantum professional को headlines दोहराने वाले से अलग करता है। इस पाठ के अंत तक आप किसी भी दावे वाले quantum application को देखकर सही तीन सवाल पूछ पाएँगे।

## सबसे आम मिथक

> "Quantum computer एक साथ हर संभव जवाब आज़माता है, तो कोई भी समस्या तुरंत हल कर सकता है।"

पहला आधा superposition का ढीला वर्णन है। दूसरा आधा ग़लत है। Quantum computer एक register को सभी 2ⁿ inputs के superposition में डाल **सकता** है और एक बार में सब पर f निकाल सकता है। लेकिन measure करने पर **एक** random input–output जोड़ी मिलती है (पाठ 12 का Holevo bound)। यह classically एक random input चुनने से बेहतर नहीं।

हर असली quantum speed-up **interference** से आता है: गणना ऐसे सजाना कि ग़लत जवाब कट जाएँ और सही जवाब बचे (पाठ 2 और 22)। Interference तभी काम करता है जब समस्या में सही **ढाँचा** हो, जैसे छिपा period। ढाँचा नहीं, तो interference नहीं, तो speed-up नहीं।

## Complexity classes: कठिनाई का नक़्शा

Computer scientists समस्याओं को इस हिसाब से बाँटते हैं कि input आकार n के साथ उनकी लागत कैसे बढ़ती है। "कुशल" मतलब लागत **polynomially** बढ़े (जैसे n² या n³), **exponentially** नहीं (जैसे 2ⁿ)।

| Class | मतलब | उदाहरण |
|---|---|---|
| **P** | Classical कंप्यूटर कुशलता से हल कर सके | Sorting, सबसे छोटे रास्ते, नंबर prime है या नहीं जाँचना, linear equations |
| **NP** | प्रस्तावित जवाब कुशलता से **जाँचा** जा सके | Sudoku, scheduling, travelling salesman (decision रूप), factoring |
| **NP-complete** | NP की सबसे कठिन समस्याएँ: एक कुशलता से हल करो तो सब हो जाएँ | SAT, travelling salesman, graph colouring, कई scheduling समस्याएँ |
| **BQP** | Quantum computer कुशलता से हल कर सके (छोटी ग़लती के साथ) | P का सब कुछ, साथ में factoring, discrete log, quantum systems का simulation |

क्या पता है और क्या माना जाता है:

- **P ⊆ BQP:** quantum computer वह सब कर सकता है जो classical कर सकता है (reversible gates से, पाठ 1)।
- **Factoring, BQP में है** (Shor) लेकिन P में होना **ज्ञात नहीं**। यह NP में है, लेकिन NP-complete **नहीं** माना जाता।
- **NP-complete समस्याएँ BQP में नहीं मानी जातीं।** किसी ने साबित नहीं किया (इससे P ≠ NP भी साबित होता, गणित की सबसे बड़ी खुली समस्याओं में से)। लेकिन मज़बूत सबूत है: बिना ढाँचे की खोज के लिए **Grover का √N साबित रूप से सबसे अच्छा है** (Bennett, Bernstein, Brassard और Vazirani, 1997)। जो भी quantum algorithm समस्या को black box माने, उसे कम से कम लगभग √N oracle calls चाहिए। तो 2ⁿ brute-force खोज 2^(n/2) बनती है, फिर भी exponential।

जो तस्वीर उभरती है: BQP, P के थोड़ा बाहर है, ख़ास ढाँचे वाली कुछ समस्याएँ समेटता है, लेकिन NP को निगलता नहीं।

## तीन तरह के speed-up

| Speed-up | उदाहरण | क्यों मदद करता है |
|---|---|---|
| **Exponential** (या super-polynomial) | Factoring और discrete log (Shor, पाठ 28); quantum systems का simulation (पाठ 29); कुछ algebraic समस्याएँ | बड़े inputs के लिए "असंभव" को "आम" बना देता है |
| **Polynomial**, आमतौर पर quadratic | बिना ढाँचे की खोज (Grover, पाठ 24); Monte Carlo के लिए amplitude estimation (पाठ 25); कुछ optimisation subroutines | असली, लेकिन जब तक समस्या बहुत बड़ी न हो, ऊपरी लागत खा जाती है |
| **कोई ज्ञात नहीं** | Sorting, databases, spreadsheets, web serving, ज़्यादातर machine learning, video games, word processing | Quantum computers आपके laptop की जगह नहीं लेंगे |

पहली row का ढाँचा देखें: छिपे **algebraic ढाँचे** (periods, groups) वाली समस्याएँ और जो समस्याएँ **शुरू से quantum** हैं (molecules, materials)। Exponential ताक़त वहीं है।

## Input और output की रुकावट

Speed-up होने पर भी दो व्यावहारिक सवाल तय करते हैं कि वह मदद करेगा या नहीं।

**Data अंदर कैसे जाएगा?** कई प्रस्तावित algorithms (linear algebra और machine learning के लिए) मानते हैं कि input data पहले से quantum state के amplitudes में रखा है। N classical नंबर amplitudes में भरने में आम तौर पर लगभग N operations लगते हैं, जो exponential speed-up को पूरी तरह रद्द कर सकते हैं। एक प्रस्तावित हल, **quantum RAM (QRAM)**, data जल्दी भरता, लेकिन कोई नहीं जानता कि बड़ा, ग़लती-रहित QRAM कैसे बनाएँ।

**जवाब बाहर कैसे आएगा?** Output 2ⁿ amplitudes वाली quantum state है, लेकिन आप उससे बस नमूने ले सकते हैं। अगर आपकी समस्या को पूरा हल-vector चाहिए, तो आप अटक गए। उपयोगी algorithms कुछ छोटा देते हैं: एक factor, एक energy, हाँ/ना।

**Dequantisation।** 2018 में Ewin Tang ने, तब 18 साल की undergraduate, दिखाया कि recommendation systems के एक मशहूर quantum algorithm की बराबरी एक classical algorithm कर सकता है जिसे उसी तरह की data पहुँच दी जाए। ऐसे ही कई quantum machine-learning प्रस्तावों के "dequantisations" आए। सबक़: speed-up के दावे की तुलना **उन्हीं मान्यताओं** वाले सबसे अच्छे classical algorithm से होनी चाहिए, किसी सीधे-सादे से नहीं।

## Quadratic speed-up कब फ़ायदा देता है?

Grover search को (π/4)·√N क़दम चाहिए, N classical जाँचों के मुक़ाबले। बड़े N के लिए √N बहुत छोटा है। लेकिन हर quantum क़दम कहीं **धीमा** है: error-corrected logical operation में microseconds लग सकते हैं, पूरी Grover iteration (असली oracle के साथ, कई logical gates से बनी) में कहीं ज़्यादा, जबकि एक classical core प्रति सेकंड लगभग एक अरब आसान जाँचें करता है, और आप कई cores ख़रीद सकते हैं।

तो बराबरी का बिंदु कहाँ है? दोनों चलने के समय बराबर रखें:

> N / (cores × 10⁹ प्रति सेकंड) = (π/4) · √N · (हर Grover क़दम का समय)

```python
import numpy as np

def crossover(grover_step_seconds, classical_cores, checks_per_core=1e9):
    """Search size N where Grover's (π/4)·√N steps take as long as N classical checks."""
    rate = classical_cores * checks_per_core                    # classical checks per second
    root_n = (np.pi / 4) * grover_step_seconds * rate          # from N / rate = (π/4)·√N·step
    n = root_n ** 2
    return n, n / rate                                         # size, and time to break even

def readable(seconds):
    for unit, size in [("days", 86400), ("hours", 3600), ("minutes", 60), ("seconds", 1)]:
        if seconds >= size:
            return f"{seconds / size:.1f} {unit}"
    return f"{seconds * 1000:.2f} milliseconds"

for step, cores in [(1e-6, 1), (1e-4, 1), (1e-4, 1000), (1e-3, 10000)]:
    n, t = crossover(step, cores)
    print(f"Grover step {step * 1e6:5.0f} µs vs {cores:5d} classical cores: "
          f"break-even at N ≈ {n:.0e}, after {readable(t)}")
```

```text
Grover step     1 µs vs     1 classical cores: break-even at N ≈ 6e+05, after 0.62 milliseconds
Grover step   100 µs vs     1 classical cores: break-even at N ≈ 6e+09, after 6.2 seconds
Grover step   100 µs vs  1000 classical cores: break-even at N ≈ 6e+15, after 1.7 hours
Grover step  1000 µs vs 10000 classical cores: break-even at N ≈ 6e+19, after 71.4 days
```

आख़िरी लाइनें पढ़ें। असली जैसे error-corrected क़दम समय के साथ (हर Grover iteration में 100 µs से 1 ms, असली oracle सहित), एक मामूली classical cluster के ख़िलाफ़, quantum computer घंटों से महीनों तक चलने के बाद ही जीतना **शुरू** करता है। और यह error correction की qubits वाली लागत और इस तथ्य को नज़रअंदाज़ करता है कि classical algorithms आमतौर पर brute force नहीं होते। Google researchers (Babbush और साथी) के 2021 के एक मशहूर विश्लेषण का भी यही निष्कर्ष था: **शुरुआती error-corrected मशीनों पर quadratic speed-ups से व्यावहारिक फ़ायदे की संभावना कम है**; पहले उपयोगी applications को quadratic से बड़े speed-ups चाहिए होंगे।

## "Quantum advantage" प्रयोग

2019 से कई प्रयोगों ने दावा किया है कि किसी quantum device ने कुछ ऐसा किया जो कोई classical कंप्यूटर उचित समय में नहीं कर सकता। हर एक ने क्या दिखाया, यह जानने लायक है।

| साल | किसने | क्या | स्थिति |
|---|---|---|---|
| 2019 | Google (Sycamore, 53 qubits) | Random circuit sampling: 200 सेकंड बनाम 10,000 साल का दावा | बेहतर classical algorithms ने बाद में उस प्रयोग का classical अनुमान घंटों या कम तक घटा दिया |
| 2020–21 | USTC, चीन (Jiuzhang photonic device; Zuchongzhi superconducting) | Gaussian boson sampling और random circuit sampling | Classical spoofing तरीकों ने कुछ दावों को चुनौती दी है; बाद के बड़े रूप कठिन बने हुए हैं |
| 2023 | IBM (Eagle, 127 qubits) | "Utility": error mitigation के साथ kicked Ising model की dynamics | Tensor-network तरीकों से कुछ हफ़्तों में classically दोहराया गया (पाठ 29) |
| दिसंबर 2024 | Google (Willow, 105 qubits) | Random circuit sampling, classically 10²⁵ साल का अनुमान; और **threshold से नीचे** error correction (पाठ 35) | Error-correction नतीजा बड़ी engineering उपलब्धि है |
| अक्टूबर 2025 | Google (Willow) | "Quantum Echoes": एक out-of-time-order correlator measurement, सबसे अच्छे classical तरीके से लगभग 13,000× तेज़ होने का दावा, और दोहराकर **जाँचा जा सकने वाला** | उपयोगी कामों की ओर एक क़दम; स्वतंत्र classical चुनौतियाँ अगला सामान्य क़दम हैं |

यह स्वस्थ विज्ञान का ढाँचा है: एक quantum दावा, एक classical जवाबी हमला जो कभी फ़र्क़ मिटा देता है, और एक नया quantum प्रयोग जो और आगे धकेलता है। अब तक के काम classical कंप्यूटरों के लिए कठिन होने के लिए चुने गए थे, अपने आप में उपयोगी होने के लिए नहीं। क्षेत्र का अगला लक्ष्य **उपयोगी quantum advantage** है: ऐसा नतीजा जिसकी किसी को सच में ज़रूरत हो, और जो classically न मिल सके। 2026 तक इस पड़ाव पर गहन काम चल रहा है, लेकिन किसी व्यावहारिक समस्या के लिए यह साफ़ स्थापित नहीं हुआ।

## किसी भी quantum दावे के लिए तीन सवाल

जब आप पढ़ें "quantum computer X में क्रांति लाएगा", तो पूछें:

1. **Speed-up क्या है, और किसके मुक़ाबले?** Exponential, polynomial, या कोई नहीं? **सबसे अच्छे** classical तरीके से तुलना, या किसी सीधे-सादे से?
2. **Data कहाँ से आता है और कहाँ जाता है?** Input भरने और output पढ़ने का कुशल तरीका है?
3. **कौन-सा हार्डवेयर चाहिए?** कितने logical qubits, कितने T gates, कितना समय? Near-term noisy मशीन या बड़ी error-corrected?

अगर कोई दावा तीनों का जवाब न दे सके, तो उसे research की दिशा मानें, नतीजा नहीं। यही ईमानदार नज़रिया यह course सिखाना चाहता है, और इस क्षेत्र में नौकरी देने वाले इसी की सबसे ज़्यादा क़द्र करते हैं।

## ख़ुद करके देखें

1. Register को सभी inputs के superposition में डालकर उन सब पर f निकालना, अपने आप में समस्याएँ हल क्यों नहीं करता?
2. एक समस्या में 2⁸⁰ संभावित जवाब हैं और कोई ढाँचा नहीं। लगभग कितनी Grover iterations चाहिए? क्या यह संभव है?
3. Factoring किस class में माना जाता है: P, NP-complete, या कोई नहीं?
4. कौन-सी दो रुकावटें quantum linear-algebra algorithm का speed-up रद्द कर सकती हैं?
5. Crossover सूत्र से, अगर classical तरफ़ 100 गुना ज़्यादा cores हों तो बराबरी वाला N कैसे बदलता है?
6. "Quantum advantage" और "उपयोगी quantum advantage" में क्या फ़र्क़ है?

**जवाब:**

1. Measure करने पर बस एक random input–output जोड़ी मिलती है। सही जवाब के पक्ष वाले interference के बिना, यह random sampling से बेहतर नहीं।
2. लगभग (π/4)·2⁴⁰ ≈ 8.6 × 10¹¹ iterations। 1 µs प्रति iteration पर भी यह लगभग 10 दिन की पूरी error-corrected दौड़ है, और असल में कहीं ज़्यादा: **व्यावहारिक नहीं**।
3. **कोई नहीं**: यह NP में है, P में नहीं माना जाता और NP-complete भी नहीं माना जाता। यह BQP में है।
4. Data को amplitudes में **भरना**, और quantum state से जवाब **पढ़ना**।
5. N, (cores)² के साथ बढ़ता है, तो **10,000 गुना बड़ा**; बराबरी का समय 100× बढ़ता है।
6. Quantum advantage: quantum device **किसी** काम में classical कंप्यूटरों को हराए, बनावटी काम में भी। उपयोगी quantum advantage: ऐसा उस काम में करे जिसकी किसी को सच में ज़रूरत हो।

## सार

| विचार | सूत्र या तथ्य |
|---|---|
| मिथक | "एक साथ सब जवाब आज़माता है": measurement सिर्फ़ एक देता है |
| सच | Speed-ups interference से आते हैं, जिसे ढाँचा चाहिए |
| P | Classically कुशल |
| NP | जवाब कुशलता से जाँचे जा सकें |
| BQP | Quantum computer पर कुशल; P इसमें है |
| Factoring | BQP और NP में; P में ज्ञात नहीं; NP-complete नहीं |
| NP-complete | BQP में नहीं माना जाता |
| खोज की निचली सीमा | Ω(√N): Grover सबसे अच्छा है (BBBV, 1997) |
| Exponential speed-ups | Factoring, discrete log, quantum simulation |
| Quadratic speed-ups | खोज, amplitude estimation, Monte Carlo |
| रुकावटें | Data भरना (QRAM), output पढ़ना |
| Dequantisation | Tang (2018): कुछ quantum ML speed-ups classically ग़ायब |
| Grover का बराबरी बिंदु | N* = ((π/4) × क़दम समय × classical दर)² |
| Advantage प्रयोग | 2019 Sycamore, 2020 Jiuzhang, 2023 IBM utility, 2024 Willow, 2025 Quantum Echoes |
| तीन सवाल | क्या speed-up, किसके मुक़ाबले? Data अंदर-बाहर? कौन-सा हार्डवेयर? |
