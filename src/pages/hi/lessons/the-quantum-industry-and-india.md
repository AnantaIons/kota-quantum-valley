---
layout: ../../../layouts/Post.astro
lang: hi
title: "Quantum industry और भारत"
description: "Quantum technology कौन बना रहा है, कितना पैसा आ रहा है, और भारत के एक छात्र के लिए इसका क्या मतलब है। Platform के हिसाब से वैश्विक खिलाड़ी, निवेश का उछाल और उसके जोखिम, राष्ट्रीय कार्यक्रम, भारत का National Quantum Mission विस्तार से (उसके लक्ष्य, hubs और startups), Amaravati के लिए योजनाबद्ध IBM machine, quantum stack में नौकरियाँ, और industry की ख़बरें आलोचनात्मक नज़र से कैसे पढ़ें।"
date: 2026-11-04
category: lesson
lesson: 47
---

पिछले 46 पाठ इस बारे में थे कि quantum technology कैसे काम करती है। यह पाठ इस बारे में है कि उसे कौन बना रहा है, कौन पैसा दे रहा है, और नौकरियाँ कहाँ हैं, भारत पर ख़ास ध्यान के साथ। Field तेज़ी से बदल रहा है: यहाँ की संख्याएँ 2026 के अंत की हैं, और कुछ एक साल में पुरानी हो जाएँगी। पाठ के अंत में ख़बरें आलोचनात्मक नज़र से पढ़ने की आदतें ज़्यादा टिकेंगी।

## परिदृश्य: कौन क्या बनाता है

Quantum computing अब सिर्फ़ academic field नहीं। सैकड़ों companies अब इस पर काम करती हैं, चार मोटे समूहों में।

**बड़ी technology companies** जिनके अपने quantum कार्यक्रम हैं:

| Company | मुख्य platform या भूमिका | ख़ास काम |
|---|---|---|
| IBM | Superconducting qubits; Qiskit; cloud पहुँच | Heron और Nighthawk processors; 2029 में fault-tolerant Starling machine का roadmap (पाठ 38) |
| Google | Superconducting qubits | Willow और threshold-से-नीचे error correction (पाठ 35); Quantum Echoes (पाठ 31) |
| Microsoft | Topological qubits; Azure Quantum cloud | Majorana 1 (2025, अब भी बहस में; पाठ 39); Quantinuum और Atom Computing के साथ साझेदारी |
| Amazon (AWS) | Cat qubits; Braket cloud | Ocelot chip (2025) |
| Nvidia | Quantum के लिए classical hardware और software | CUDA-Q software, GPU simulation, GPUs को quantum processors से जोड़ना |

**समर्पित quantum hardware companies**, उनमें से कई अब public हैं:

| Platform | Companies |
|---|---|
| Trapped ions | Quantinuum (2026 में Nasdaq IPO), IonQ, AQT |
| Neutral atoms | QuEra, Pasqal, Atom Computing, Infleqtion (2026 में merger से public) |
| Superconducting | Rigetti, IQM, Alice & Bob, Oxford Quantum Circuits, और भारत में QpiAI |
| Photonics | PsiQuantum, Xanadu, Quandela |
| Annealing | D-Wave |
| Silicon में spins | Diraq, Quantum Motion, Intel |

**सक्षम बनाने वाली technology** के आपूर्तिकर्ता: dilution refrigerators (Bluefors, Oxford Instruments), control electronics (Quantum Machines, Qblox, Zurich Instruments, Keysight), lasers, cryogenic cables, single-photon detectors, और chip foundries। यह परत अक्सर वह है जहाँ engineers को पहली नौकरियाँ मिलती हैं, और जहाँ अपनी क्षमता बनाने वाले देशों, जैसे भारत, को निवेश करना होता है।

**Software, इस्तेमाल और सुरक्षा:** quantum software और algorithm companies, consultancies, research teams वाले banks और दवा companies, और कहीं बड़ी post-quantum cryptography industry (पाठ 43), जो encryption इस्तेमाल करने वाली हर संस्था को प्रभावित करती है।

## पैसा: उछाल, असली जोखिमों के साथ

McKinsey के Quantum Technology Monitor 2026 के मुताबिक़:

- Quantum startups में निवेश **2025 में लगभग $12.6 अरब** पहुँचा, 2024 के स्तर से छह गुना से ज़्यादा, जिसका लगभग 90% quantum computing में गया।
- Quantum computing companies ने 2025 में दुनिया भर में **$1 अरब से ज़्यादा** कमाया।
- McKinsey **2035 तक $60–100 अरब** के quantum बाज़ार, और industries में $2.7 ट्रिलियन तक के आर्थिक मूल्य का अनुमान लगाता है।

कई companies 2025 और 2026 में ऊँचे मूल्यांकन पर stock markets में आईं। दूसरा पहलू देखना भी अहम है। मूल्यांकन की तुलना में कमाई अब भी छोटी है, ज़्यादातर companies बड़ा घाटा उठाती हैं, और कमाई का बड़ा हिस्सा सरकारों और research labs को machines बेचने से आता है, न कि व्यावसायिक समस्याएँ classical computers से बेहतर हल करने से। पाठ 31 ने समझाया क्यों: व्यावहारिक समस्याओं के लिए काम का quantum फ़ायदा अभी साफ़ स्थापित नहीं हुआ। Deep technology में निवेश के उछाल के बाद दर्दनाक गिरावट आ सकती है। अच्छे careers उन skills पर बनते हैं जो दोनों हालात में क़ीमती रहें: physics, electronics, software और गणित।

## राष्ट्रीय कार्यक्रम

सरकारें quantum technology को रणनीतिक रूप से अहम मानती हैं, सुरक्षा (codebreaking और सुरक्षित संचार), आर्थिक प्रतिस्पर्धा, और विज्ञान के लिए:

- **United States:** National Quantum Initiative Act (2018) research funding का समन्वय करता है; DARPA, Department of Energy और दूसरे बड़े कार्यक्रम fund करते हैं।
- **चीन:** भारी सरकारी निवेश, ख़ास तौर पर quantum communication (Micius satellite और राष्ट्रीय QKD backbone, पाठ 41) और superconducting और photonic computing में।
- **European Union:** Quantum Flagship (2018 से), साथ में Germany, France, Netherlands, Finland और दूसरों के राष्ट्रीय कार्यक्रम।
- **United Kingdom:** 2014 से राष्ट्रीय कार्यक्रम, और 2024 से £2.5 अरब सार्वजनिक funding वाली 10-साल की रणनीति।
- Japan, South Korea, Canada, Australia, Singapore और Israel भी अहम कार्यक्रम चलाते हैं।

## भारत का National Quantum Mission

भारत के केंद्रीय मंत्रिमंडल ने 19 अप्रैल 2023 को **National Quantum Mission (NQM)** मंज़ूर किया, आठ साल, 2023–24 से 2030–31, के लिए **₹6,003.65 करोड़** (लगभग $740 million) के बजट के साथ। इसे Department of Science and Technology (DST) चलाता है। इसके घोषित लक्ष्यों में शामिल हैं:

- **Computing:** लगभग तीन साल में 20 से 50 physical qubits, पाँच साल में 50 से 100, और आठ साल में 50 से 1,000 qubits वाले intermediate-scale quantum computers, superconducting और photonic qubits जैसे platforms पर।
- **Communication:** लगभग 2,000 km दूर ground stations के बीच satellite-आधारित सुरक्षित quantum communication, दूसरे देशों के साथ लंबी दूरी के सुरक्षित links, 2,000 km से ज़्यादा inter-city QKD, और quantum memories वाले multi-node quantum networks।
- **Sensing और metrology:** सटीक समय, संचार और navigation के लिए उच्च-संवेदनशीलता magnetometers और atomic clocks।
- **Materials और devices:** quantum devices के लिए superconductors, नए semiconductor ढाँचे और topological materials।

### चार hubs

2024 में NQM ने चार **thematic hubs** (T-Hubs) बनाए, हर एक का नेतृत्व एक बड़ा संस्थान करता है जो देश भर के साझेदार संस्थानों के साथ काम करता है:

| Hub | नेतृत्व करने वाला संस्थान |
|---|---|
| Quantum computing | Indian Institute of Science (IISc), Bengaluru |
| Quantum communication | IIT Madras (C-DOT के साथ) |
| Quantum sensing और metrology | IIT Bombay |
| Quantum materials और devices | IIT Delhi |

### Startups

2024 के अंत में NQM ने समर्थन के लिए अपने पहले **आठ startups** चुने, पूरे stack को ढकते हुए, जो एक राष्ट्रीय quantum industry की ज़रूरतों का अच्छा नक़्शा है:

| Startup | शहर | क्षेत्र |
|---|---|---|
| QpiAI | Bengaluru | Superconducting quantum computers |
| QNu Labs | Bengaluru | Quantum communication और quantum-safe networks |
| Dimira Technologies | Mumbai (IIT Bombay) | Cryogenic cables |
| PrenishQ | Delhi (IIT Delhi) | सटीक diode-laser systems |
| QuPrayog | Pune | Optical atomic clocks |
| Quanastra | Delhi | Cryogenics और superconducting detectors |
| Pristine Diamonds | Ahmedabad | Quantum sensing के लिए diamond materials |
| Quan2D Technologies | Bengaluru | Superconducting nanowire single-photon detectors |

World Quantum Day, 14 अप्रैल 2025 को QpiAI ने **QpiAI-Indus** launch किया, अपने software stack के साथ 25-qubit superconducting quantum computer, जिसे भारत का पहला full-stack quantum computing platform बताया गया। NQM ने तब से और startups के लिए लगातार खुला आवेदन शुरू किया है।

### Amaravati Quantum Valley

मई 2025 में IBM, Tata Consultancy Services और Andhra Pradesh सरकार ने Amaravati के नए "Quantum Valley" technology park में 156-qubit Heron processor (पाठ 38) वाला **IBM Quantum System Two** लगाने की योजना घोषित की, जो भारत का सबसे बड़ा quantum computer होगा। Park में निर्माण 2026 में शुरू हुआ। अक्टूबर 2026 तक system लगने की कोई आधिकारिक पुष्टि नहीं थी, और राज्य सरकार के बयान 2027 की शुरुआत में launch की ओर इशारा करते थे। यह इस बात का काम का उदाहरण है कि बड़ी technology परियोजनाओं की समय-सीमाएँ कैसे खिसकती हैं, और आपको पहली घोषणा के बजाय ताज़ा आधिकारिक स्थिति क्यों देखनी चाहिए।

### दूसरी गतिविधि

भारत का quantum काम NQM से बहुत आगे तक जाता है: ISRO और DRDO ने QKD links दिखाए हैं (पाठ 41); C-DOT और भारतीय startups QKD products बनाते हैं; ISRO NavIC के लिए स्वदेशी atomic clocks बना रहा है (पाठ 44); TIFR, IISc, IITs, IISERs, RRI और दूसरों के research समूह superconducting, photonic, trapped-ion और NV-centre प्रयोग बनाते हैं; और भारतीय IT companies वैश्विक ग्राहकों के लिए quantum और post-quantum cryptography काम करती हैं। शिक्षा भी तेज़ी से बढ़ रही है, दसियों हज़ार university छात्र अब quantum computing courses ले रहे हैं।

भारत की ताक़त है गणित, physics और engineering प्रतिभा का बहुत बड़ा भंडार, विश्व-स्तरीय software industry, और मज़बूत संस्थान। चुनौतियाँ जानी-मानी हैं: उन्नत chips का सीमित घरेलू fabrication, dilution refrigerators और lasers जैसे आयातित components पर निर्भरता, और धैर्यवान, लंबी अवधि के funding की ज़रूरत। NQM के startup चुनाव (cables, lasers, detectors, materials) ठीक इन्हीं कमियों को निशाना बनाते हैं।

## Quantum stack में नौकरियाँ

Quantum technology को physicists से कहीं ज़्यादा चाहिए। यहाँ मुख्य क़िस्म की भूमिकाएँ हैं, और इस course के कौन-से हिस्से हर एक के लिए तैयार करते हैं:

| भूमिका | वे क्या करते हैं | पृष्ठभूमि | Course पाठ |
|---|---|---|---|
| Quantum hardware physicist | Qubits design और जाँच करना | Physics PhD या master's | 32, 37–39 |
| Microwave और RF engineer | Signal chains, resonators, amplifiers, filters | ECE | 38 |
| FPGA और firmware engineer | Pulse sequencing, feedback, real-time decoders | ECE, embedded systems | 35, 38, 40 |
| Cryogenic और vacuum engineer | Fridges, wiring, vacuum systems | Mechanical, physics | 38, 39 |
| Laser और photonics engineer | Ions, atoms, QKD के lasers; detectors | Physics, optics, ECE | 39, 41, 44 |
| Fabrication और process engineer | Chip fabrication, materials | Materials science, physics, ECE | 38, 39 |
| Quantum software engineer | Compilers, SDKs, cloud platforms | Computer science | 17–20, 40 |
| Quantum algorithm researcher | नए algorithms और इस्तेमाल | गणित, CS, physics | 22–31 |
| Error-correction engineer | Codes, decoders, fault-tolerant architecture | CS, physics, गणित | 33–36 |
| Application scientist | Chemistry, materials, finance, optimisation के इस्तेमाल | क्षेत्र का विज्ञान और quantum | 29, 45, 46 |
| Security और PQC engineer | Systems को quantum-सुरक्षित cryptography पर ले जाना | CS, security | 41, 43 |
| Product, business और policy भूमिकाएँ | रणनीति, बिक्री, मानक, सरकारी कार्यक्रम | अलग-अलग, और ठोस तकनीकी समझ | 31, 47 |

दो बातें। पहली, near-term नौकरियों की सबसे बड़ी संख्या ख़ुद qubits बनाने में नहीं, बल्कि **qubits के आसपास engineering और software** में है। दूसरी, सबसे क़ीमती लोग दो दुनियाओं को जोड़ते हैं: qubits समझने वाला embedded engineer, Qiskit लिख सकने वाला chemist, Shor का algorithm समझने वाला security engineer। आपको अपना मौजूदा field छोड़ने की ज़रूरत नहीं; उसमें quantum जोड़ना है।

## Kota क्यों?

Kota एक चीज़ के लिए मशहूर है: लाखों छात्रों को physics, chemistry और गणित में ऐसे स्तर पर तैयार करना जिसकी बराबरी दुनिया में कम जगहें करती हैं। Quantum technology को ठीक यही नींव चाहिए। Kota Quantum Valley के पीछे विचार यह है कि यह प्रतिभा, और इसके आसपास की पढ़ाने की विशेषज्ञता, quantum-कुशल workforce तैयार कर सकती है: छात्र जो अपनी तैयारी के साथ quantum computing सीखें, शिक्षक जो quantum modules जोड़ें, और समय के साथ शहर में ही training और engineering काम। यह एक आकांक्षा है, अभी हक़ीक़त नहीं, और यह course पहला क़दम है: मुफ़्त, English और हिन्दी में, bits से असली hardware तक।

## Quantum ख़बरें आलोचनात्मक नज़र से पढ़ना

हर हफ़्ते घोषणाएँ आती हैं। किसी पर भरोसा करने से पहले पूछें:

1. **Qubits या गुणवत्ता?** Gate error rates, connectivity और coherence के बिना बड़ी qubit संख्या का मतलब कम है (पाठ 37)। Two-qubit error rates और logical-qubit नतीजे देखें।
2. **Peer-reviewed या press release?** क्या कोई paper है, और क्या उसकी जाँच हुई? Advantage दावों के बाद अक्सर classical जवाबी नतीजे आते हैं (पाठ 31)।
3. **काम का या बनावटी?** क्या काम classical computers के लिए कठिन होने के लिए चुना गया, या काम का होने के लिए?
4. **Physical या logical?** लंबे algorithms के लिए error-corrected logical qubits मायने रखते हैं (पाठ 35)। हर logical qubit पर कितने physical qubits, और किस logical error rate पर?
5. **घोषित या दिया गया?** Roadmaps और साझेदारी की घोषणाएँ इरादे बताती हैं; बाद में देखें कि दिया गया या नहीं।
6. **कमाई या मूल्यांकन?** Companies के लिए असली कमाई और घाटे की बाज़ार मूल्य से तुलना करें।

## आज़माकर देखें

1. हर platform के लिए एक company बताएँ: superconducting, trapped ions, neutral atoms, photonics।
2. 2025 में quantum startup निवेश और quantum computing कमाई के लिए McKinsey के अनुमान क्या थे?
3. NQM का बजट और अवधि क्या है, और आठवें साल तक वह कितने qubits का लक्ष्य रखता है?
4. चार NQM hubs का नेतृत्व कौन-से संस्थान करते हैं?
5. कोई देश सिर्फ़ quantum computers ही नहीं, बल्कि cryogenic cables और laser systems बनाने वाले startups को fund करना क्यों चुन सकता है?
6. एक घोषणा कहती है "Company X ने 1,000-qubit processor पेश किया"। आप पहले कौन-से तीन सवाल पूछेंगे?
7. Jobs table की कौन-सी भूमिकाएँ आपकी अपनी पृष्ठभूमि से सबसे ज़्यादा मेल खाती हैं, और आप पहले कौन-से पाठ दोहराएँगे?

**जवाब:**

1. जैसे: superconducting, IBM या Google (या भारत में QpiAI); trapped ions, Quantinuum या IonQ; neutral atoms, QuEra या Pasqal; photonics, PsiQuantum या Xanadu।
2. 2025 में लगभग **$12.6 अरब** का startup निवेश, और **$1 अरब से ज़्यादा** quantum computing कमाई।
3. आठ साल (2023–24 से 2030–31) में **₹6,003.65 करोड़**, आठवें साल तक **50 से 1,000 physical qubits** का लक्ष्य।
4. **IISc Bengaluru** (computing), **IIT Madras** (communication), **IIT Bombay** (sensing और metrology), **IIT Delhi** (materials और devices)।
5. हर quantum computer ऐसे components पर निर्भर है; सब आयात करना निर्भरता और आपूर्ति जोखिम बनाता है, और ये ऐसे क्षेत्र हैं जहाँ देश quantum computers के काम के होने से पहले ही असली औद्योगिक क्षमता और निर्यात बना सकता है।
6. जैसे: Two-qubit gate error rates और coherence times क्या हैं? Qubits कैसे जुड़े हैं, और क्या device का benchmark (या प्रकाशन) हुआ है? कोई logical qubits, और users के लिए असल में कब उपलब्ध होगा?
7. यह आप पर निर्भर है। जैसे एक embedded firmware engineer स्वाभाविक रूप से FPGA और control-system भूमिकाओं (पाठ 35, 38, 40) और devices पर PQC (पाठ 43) से मेल खाता है।

## सार-सूत्र

| विचार | सूत्र या तथ्य |
|---|---|
| बड़ी tech | IBM, Google, Microsoft, Amazon, Nvidia |
| Platforms | Superconducting, ions, atoms, photonics, annealing, silicon spins |
| सक्षम बनाने वाली tech | Fridges, control electronics, lasers, cables, detectors, foundries |
| निवेश (2025) | Startups में ≈ $12.6 अरब; > $1 अरब कमाई (McKinsey 2026) |
| बाज़ार अनुमान | 2035 तक $60–100 अरब (McKinsey का अनुमान) |
| सावधानी | छोटी कमाई, बड़े घाटे, ऊँचे मूल्यांकन; व्यावहारिक समस्याओं पर फ़ायदा अभी नहीं दिखा |
| भारत का NQM | 19 अप्रैल 2023 को मंज़ूर; ₹6,003.65 करोड़; 2023–24 से 2030–31 |
| NQM लक्ष्य | 8 साल में 50–1,000 qubits; 2,000 km satellite QKD; magnetometers, clocks; materials |
| T-Hubs | IISc (computing), IIT Madras (communication), IIT Bombay (sensing), IIT Delhi (materials) |
| NQM startups | QpiAI, QNu Labs, Dimira, PrenishQ, QuPrayog, Quanastra, Pristine Diamonds, Quan2D |
| QpiAI-Indus | 25-qubit superconducting system, 14 अप्रैल 2025 को launch |
| Amaravati | IBM Quantum System Two (156-qubit Heron) योजनाबद्ध; launch 2027 में अपेक्षित |
| नौकरियाँ | ज़्यादातर near-term भूमिकाएँ qubits के आसपास engineering और software में |
| ख़बर checklist | संख्या नहीं गुणवत्ता; peer review; काम का काम; logical qubits; दिया गया; कमाई |
