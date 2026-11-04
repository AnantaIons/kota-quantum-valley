---
layout: ../../../layouts/Post.astro
lang: hi
title: "Quantum internet"
description: "ऐसे networks जो bits copy करने के बजाय entanglement साझा करते हैं। Quantum network का असली काम Bell pairs बाँटना क्यों है, Qiskit में entanglement swapping simulate किया, quantum repeaters और memories असंभव इंतज़ार को छोटा कैसे बनाती हैं (हिसाब के साथ), entanglement purification, network node का hardware, अब तक के प्रयोग, पूरे quantum internet की ओर के चरण, और यह किस काम आएगा।"
date: 2026-11-04
category: lesson
lesson: 42
---

Classical internet bits ले जाता है: उन्हें copy करो, amplify करो, रखो, आगे भेजो। **Quantum internet** ऐसी चीज़ ले जाएगा जो copy नहीं हो सकती: quantum states, और सबसे बढ़कर **entanglement**। यह quantum computers, sensors और users को जोड़ेगा, वे चीज़ें संभव करते हुए जो कोई classical network नहीं कर सकता: किसी भी दूरी पर physics से सुरक्षित key distribution, किसी और के quantum computer पर निजी computing, और छोटे quantum processors को जोड़कर एक बड़ा बनाना।

इसे बनाना इस सदी की बड़ी engineering परियोजनाओं में से एक है। यह पाठ केंद्रीय विचार (Bell pairs बाँटने वाला network), मुख्य operations (entanglement swapping और purification), **quantum repeaters** क्यों चाहिए और वे दूरी को कैसे हराते हैं, hardware कैसा दिखता है, और प्रयोग कितनी दूर आ चुके हैं, यह समझाता है।

## Network का असली काम: Bell pairs बाँटना

आप लंबे fibre में qubit भेजकर उसके पहुँचने की उम्मीद नहीं कर सकते: photons खो जाते हैं (पाठ 41), और खोए qubits फिर नहीं भेजे जा सकते क्योंकि मूल copy नहीं हो सकता। लेकिन पाठ 21 ने qubit ले जाने का दूसरा तरीका दिखाया: **teleportation**। अगर Alice और Bob एक Bell pair साझा करते हैं, तो Alice Bell measurement करके और Bob को **दो classical bits** भेजकर कोई भी qubit state Bob तक पहुँचा सकती है। Qubit ख़ुद कभी यात्रा नहीं करता।

तो quantum network को नाज़ुक qubits भरोसे से भेजने की ज़रूरत नहीं। उसे बस users की जोड़ियों को **साझा, उच्च-गुणवत्ता Bell pairs** देने हैं। एक मिल जाए, तो वे उसे qubit teleport करने, secret key बनाने (पाठ 41 का E91), या distributed computation में resource की तरह इस्तेमाल कर सकते हैं। Bell pairs आपस में बदले जा सकते हैं, पहले से बनाए, जाँचे, और ख़राब हों तो फेंके जा सकते हैं। यह एक असंभव काम (अनोखी states को पूरी तरह भेजना) को संभालने लायक़ काम (आख़िरकार एक मानक resource बनाने में सफल होना) में बदल देता है।

## Entanglement swapping

उन दो जगहों के बीच Bell pair कैसे साझा करें जो photon के पहुँचने के लिए बहुत दूर हैं? दो छोटी जोड़ियाँ बनाओ और उन्हें **जोड़ो**। मान लें Alice बीच के station के साथ एक Bell pair साझा करती है, और station Bob के साथ दूसरी। Station अपने दो qubits पर, हर जोड़ी से एक, Bell measurement करता है और Bob को नतीजा बताता है। अब **Alice और Bob** एक Bell pair साझा करते हैं, भले उनके qubits ने कभी interact नहीं किया।

यह **entanglement swapping** है, और यह छिपे भेस में teleportation है: station पहली जोड़ी का अपना आधा हिस्सा Bob के qubit पर teleport करता है। Classical संदेश और Bob के सुधार समेत इसे जाँचें:

```python
from qiskit import QuantumCircuit, ClassicalRegister, QuantumRegister
from qiskit.quantum_info import Statevector, state_fidelity
from qiskit_aer import AerSimulator

q = QuantumRegister(4)          # qubit 0: Alice   1, 2: the middle station   3: Bob
c = ClassicalRegister(2)
qc = QuantumCircuit(q, c)
qc.h(0); qc.cx(0, 1)            # Bell pair shared by Alice and the station
qc.h(2); qc.cx(2, 3)            # a second Bell pair shared by the station and Bob
# The station makes a Bell measurement on its two qubits (1 and 2)...
qc.cx(1, 2); qc.h(1)
qc.measure(1, c[0]); qc.measure(2, c[1])
# ...and phones Bob the two bits, which tell him which correction to apply
with qc.if_test((c[1], 1)): qc.x(3)
with qc.if_test((c[0], 1)): qc.z(3)
qc.save_density_matrix([0, 3])

res = AerSimulator(seed_simulator=5).run(qc, shots=2000).result()
target = QuantumCircuit(2); target.h(0); target.cx(0, 1)
print("station's results (all four appear):", dict(sorted(res.get_counts().items())))
print("Alice-Bob fidelity with a perfect Bell pair:", round(state_fidelity(res.data()["density_matrix"], Statevector(target)), 6))
```

```text
station's results (all four appear): {'00': 474, '01': 493, '10': 527, '11': 506}
Alice-Bob fidelity with a perfect Bell pair: 1.0
```

Station के चारों नतीजे लगभग एक-चौथाई समय आते हैं, और हर एक Bob को बताता है कि कौन-सा Pauli सुधार लगाना है। सुधार के बाद qubits 0 और 3 एक perfect Bell pair बनाते हैं, fidelity 1, सभी 2,000 runs के औसत में। Swapping दोहराई जा सकती है: stations की एक श्रृंखला, हर एक अपने पड़ोसियों की जोड़ियाँ जोड़ते हुए, entanglement को महाद्वीप भर तक खींच सकती है।

## Quantum repeaters: exponential को हराना

अकेली swapping loss की समस्या हल नहीं करती। अगर आपको श्रृंखला के **हर** link का **एक ही पल पर** सफल होना चाहिए, तो संभावना उनकी सफलता संभावनाओं का गुणनफल है, जो photon को पूरा रास्ता भेजने जितना ही बुरा है। तरकीब है **quantum memory**: जब कोई link सफल होता है, उसके qubits **रख** लिए जाते हैं, और वह link इंतज़ार करता है जबकि बाक़ी कोशिश करते रहते हैं। जब सारे links सफल हो जाएँ, stations swap करते हैं, और सिरे-से-सिरे की जोड़ी तैयार है।

इससे कितनी मदद मिलती है? 500 km और 1,000 km fibre (0.2 dB/km) पर, अलग-अलग segments में बाँटकर, perfect memories और swaps मानकर, ज़रूरी कोशिशों के rounds गिनें:

```python
import numpy as np

def expected_rounds(p, n):
    """Average rounds until ALL n independent links have succeeded at least once (each tries with prob p per round).
    With quantum memories, a link that succeeds early waits for the others."""
    if p < 1e-4:                            # tiny p: E[max of n geometric waits] ≈ (1 + 1/2 + ... + 1/n) / p
        return sum(1 / k for k in range(1, n + 1)) / p
    total, t = 0.0, 0                       # otherwise add up P(not all done after t rounds) exactly
    while True:
        term = 1 - (1 - (1 - p) ** t) ** n
        total += term
        t += 1
        if term < 1e-12:
            return total

def link_probability(km):
    return 10 ** (-0.2 * km / 10)           # fibre transmission at 0.2 dB/km

print("total distance   segments   rounds needed (each round ≈ the light travel time of one segment)")
for L in [500, 1000]:
    for n in [1, 4, 16, 64]:
        print(f"   {L:5d} km        {n:3d}        {expected_rounds(link_probability(L / n), n):12.3g}")
```

```text
total distance   segments   rounds needed (each round ≈ the light travel time of one segment)
     500 km          1               1e+10
     500 km          4                 658
     500 km         16                  13
     500 km         64                4.46
    1000 km          1               1e+20
    1000 km          4            2.08e+05
    1000 km         16                58.9
    1000 km         64                7.61
```

1,000 km पर सीधे भेजने में लगभग 10²⁰ कोशिशें लगेंगी। 1 GHz source के साथ यह हर photon के लिए हज़ारों साल है। Line को memories के साथ 16 segments में बाँटने पर लगभग 60 rounds लगते हैं। इंतज़ार का समय अब दूरी के साथ exponentially नहीं बढ़ता; सिर्फ़ polynomially। यही quantum repeater का मूल विचार है, जिसे Briegel, Dür, Cirac और Zoller ने 1998 में प्रस्तावित किया।

असली repeaters इस model से कठिन हैं: swaps हमेशा निश्चित नहीं होते (सरल optics से photonic Bell measurements सिर्फ़ 50% समय सफल होते हैं), detectors photons चूकते हैं, और इंतज़ार करते समय **memories decohere होती हैं**, तो उन्हें इंतज़ार से ज़्यादा देर qubits रखने चाहिए। ऐसी memories बनाना जो seconds तक qubit रखें और telecom photons से कुशलता से जुड़ें, field की केंद्रीय चुनौती है।

## Entanglement purification

हर क़दम noise जोड़ता है: अधूरे sources, lossy optics, गिरती memories, अधूरे swaps। कई swaps के बाद सिरे-से-सिरे का Bell pair इस्तेमाल के लिए बहुत noisy हो सकता है। **Entanglement purification** (जिसे distillation भी कहते हैं; Bennett और साथी, 1996) इसे ठीक करता है: उन्हीं दो पक्षों की **दो** noisy जोड़ियाँ लो, local रूप से CNOTs लगाओ और एक जोड़ी measure करो, दूसरी तभी रखो जब measurement नतीजे मेल खाएँ। बची जोड़ियाँ मूल से बेहतर होती हैं। Fidelity F वाली जोड़ियों के लिए (यहाँ symmetric noise वाली "Werner" states), एक round देता है:

```python
def purify(F):
    """One round of entanglement purification (BBPSSW) on two Werner pairs of fidelity F.
    Returns the fidelity of the surviving pair and the chance the round succeeds."""
    e = (1 - F) / 3
    success = F ** 2 + 2 * F * e + 5 * e ** 2
    return (F ** 2 + e ** 2) / success, success

F = 0.80
print("round   fidelity   success probability")
print(f"  0      {F:.4f}")
for r in range(1, 6):
    F, p = purify(F)
    print(f"  {r}      {F:.4f}        {p:.3f}")
```

```text
round   fidelity   success probability
  0      0.8000
  1      0.8382        0.769
  2      0.8736        0.807
  3      0.9045        0.846
  4      0.9300        0.881
  5      0.9500        0.911
```

पाँच rounds fidelity को 0.80 से 0.95 तक ले जाते हैं। क़ीमत भारी है: हर round एक बनाने के लिए दो जोड़ियाँ ख़र्च करता है, और कभी fail होता है, तो इसमें कम से कम 2⁵ = 32 शुरुआती जोड़ियाँ लगीं। पूरा repeater architecture swapping और purification को बारी-बारी करता है, और भविष्य के "तीसरी पीढ़ी" के repeaters इसके बजाय quantum error-correcting codes (पाठ 33 से 35) इस्तेमाल करेंगे, श्रृंखला में encoded qubits भेजते हुए।

## Network node को क्या चाहिए

काम के quantum network node को तीन चीज़ें अच्छी तरह करनी हैं:

1. लंबे समय तक टिकने वाली **quantum memory** में **qubits रखना**। अग्रणी उम्मीदवार: trapped ions और neutral atoms (पाठ 39), diamond में दोष जैसे **NV centres** और **silicon-vacancy (SiV) centres**, और crystals में rare-earth ions।
2. **Photons से बात करना**: रखे qubit से entangled photon कुशलता से छोड़ना, अक्सर emitter को optical cavity में रखकर।
3. **Telecom बोलना**: ज़्यादातर emitters visible या near-infrared wavelengths पर प्रकाश बनाते हैं जिसे fibre ज़ोर से सोखता है, तो **frequency conversion** photons को 1,550 nm पर ले जाता है, जहाँ fibre loss सबसे कम है।

Superconducting quantum computers के सामने एक अतिरिक्त बाधा है: उनके qubits microwave photons में बोलते हैं, जो गर्म fibre से बिल्कुल नहीं गुज़र सकते। **Microwave-to-optical transducers**, जो एक microwave photon को optical में बदलते हैं, सक्रिय research क्षेत्र हैं, और superconducting machines को इमारतों या शहरों के पार जोड़ने के लिए ज़रूरी।

## अब तक के प्रयोग

- **2017:** चीन के Micius satellite ने 1,200 km दूर ground stations तक entangled photon जोड़ियाँ बाँटीं (पाठ 41)।
- **2021:** Delft में QuTech ने NV-centre memories से पहला **तीन-node** quantum network बनाया, और बीच के node से entanglement swapping करके दोनों बाहरी nodes को entangle किया।
- **2024:** Harvard और AWS ने Boston क्षेत्र में बिछे **35 km** fibre पर दो silicon-vacancy memory nodes को entangle किया। उसी साल USTC की एक team ने Hefei के metropolitan network में quantum memories को entangle किया, और QuTech ने लगभग 25 km पर Delft और The Hague के nodes जोड़े।
- **2025:** Oxford के researchers ने सिर्फ़ photons से जुड़े दो अलग ion-trap modules पर एक **distributed quantum algorithm** (Grover खोज) चलाया, teleported two-qubit gates इस्तेमाल करके, networked quantum computers की ओर पहला क़दम।

ये कम दरों वाले छोटे links हैं, लेकिन हर हिस्सा काम करता दिखाते हैं: memories, photonic links, swapping और teleportation।

## Quantum internet के चरण

2018 में Stephanie Wehner, David Elkouss और Ronald Hanson ने रास्ते को चरणों की श्रृंखला के रूप में बताया, हर एक नए इस्तेमाल संभव करता हुआ:

| चरण | Network क्या कर सकता है | उदाहरण इस्तेमाल |
|---|---|---|
| Trusted repeater network | Trusted relay nodes से keys आगे भेजना | QKD backbones (आज इस्तेमाल में) |
| Prepare-and-measure | कोई भी user किसी को भी single qubits भेज सके | सिरे-से-सिरे QKD |
| Entanglement distribution | किन्हीं दो users के बीच माँग पर Bell pairs | Device-independent QKD |
| Quantum memory | Operations ख़त्म होने तक entanglement रखना | Blind computing, clock synchronisation |
| Few-qubit fault-tolerant | Nodes पर छोटे error-corrected operations | Distributed protocols, बेहतर repeaters |
| Quantum computing | Network पर मनमानी quantum गणनाएँ | Distributed quantum computing |

आज की research तीसरे और चौथे चरण पर है; बिछे networks पहले पर।

## यह किस काम आएगा?

- **लंबी दूरी का सुरक्षित संचार:** बीच के nodes पर भरोसे के बिना किसी भी दूरी पर QKD, device-independent protocols से।
- **Blind quantum computing:** किसी दूर के quantum computer को उसके मालिक को आपका input, algorithm या output जनाए बिना इस्तेमाल करना (Broadbent, Fitzsimons और Kashefi, 2009)। Quantum computing के cloud पर जाने के साथ यह निजता बहुत मायने रख सकती है।
- **Distributed quantum computing:** कई छोटे processors को जोड़कर एक बड़ी machine बनाना, जैसे Oxford प्रयोग में। कई hardware companies इस तरह जुड़ी modular machines की योजना बना रही हैं (पाठ 38 और 39)।
- **बेहतर घड़ियाँ और sensors:** atomic clocks के entangled networks समय को ज़्यादा सटीक और मज़बूती से नाप सकते हैं; kilometres दूर entangled telescopes एक विशाल उपकरण की तरह, कहीं बारीक resolution के साथ, काम कर सकते हैं।
- **Superdense coding:** पहले से साझा Bell pair के साथ एक qubit भेजना दो classical bits ढो सकता है (पाठ 21)।

पूरा quantum internet शायद दशकों दूर है, लेकिन टुकड़े अभी बन रहे हैं, और classical internet की तरह इसके सबसे बड़े इस्तेमाल शायद वे हों जिनके बारे में अभी किसी ने सोचा भी नहीं।

## आज़माकर देखें

1. Quantum network qubits सीधे भेजने के बजाय Bell pairs बाँटने पर क्यों ध्यान देता है?
2. Entanglement swapping में station qubits 1 और 2 measure करता है। कौन-से qubits entangled होते हैं, और क्या उन्होंने कभी interact किया?
3. अगर Bob station के दो classical bits को नज़रअंदाज़ करे तो क्या ग़लत होगा?
4. Memories के बिना link को segments में बाँटना मदद क्यों नहीं करता?
5. Repeater table से, 16 segments के साथ 500 km के लिए मोटे तौर पर कितने rounds चाहिए? सीधे transmission से तुलना करें।
6. Purification के तीन rounds के बाद एक जोड़ी बनाने में (कम से कम) कितनी शुरुआती जोड़ियाँ लगती हैं?
7. Quantum network से जुड़ने के लिए superconducting quantum computers को microwave-to-optical transducers क्यों चाहिए?

**जवाब:**

1. खोए photons फिर नहीं भेजे जा सकते (no-cloning), और qubits amplify नहीं हो सकते। Bell pairs एक मानक resource हैं जो पहले से बनाए, जाँचे और ख़राब हों तो फेंके जा सकते हैं; साझा होने के बाद teleportation दो classical bits से कोई भी qubit भरोसे से ले जाता है।
2. **Qubits 0 और 3** (Alice और Bob)। उन्होंने कभी interact नहीं किया; उनका entanglement उनके साथियों पर station के Bell measurement से आया।
3. सुधार के बिना Bob का qubit चार Bell states में से किसी एक में random होगा, उसकी नज़र से पूरी तरह mixed state: कोई काम का entanglement नहीं। दो bits उसे बताते हैं कि कौन-सा Pauli इसे ठीक करता है। (यह भी दिखाता है कि entanglement प्रकाश से तेज़ जानकारी क्यों नहीं भेज सकता।)
4. सारे segments को एक ही round में सफल होना होगा, तो सफलता की संभावना segment संभावनाओं का गुणनफल है, जो सिरे-से-सिरे transmission के बराबर है। Memories सफल segments को इंतज़ार करने देती हैं।
5. लगभग **13** rounds, सीधे लगभग 10¹⁰ कोशिशों की तुलना में।
6. **2³ = 8** जोड़ियाँ, और औसतन ज़्यादा, क्योंकि rounds fail हो सकते हैं।
7. उनके qubits microwave photons से interact करते हैं, जो thermal noise में डूबे बिना कमरे के तापमान के fibre या खुली हवा से नहीं गुज़र सकते। Optical photons में बदलना उन्हें fibre networks इस्तेमाल करने देता है।

## सार-सूत्र

| विचार | सूत्र या तथ्य |
|---|---|
| Network का काम | Bell pairs बाँटो; फिर teleport करो, keys बनाओ, या compute करो |
| Teleportation | Bell pair + Bell measurement + 2 classical bits एक qubit ले जाते हैं (पाठ 21) |
| Entanglement swapping | दो जोड़ियों के अंदरूनी हिस्सों पर Bell measurement बाहरी qubits को entangle करता है |
| प्रकाश से तेज़ नहीं | Swapping और teleportation को पूरा होने के लिए classical bits चाहिए |
| Quantum repeater (1998) | Segments + memories + swapping: exponential के बजाय polynomial ख़र्च |
| Memory की शर्त | इंतज़ार के समय से ज़्यादा देर qubits रखने चाहिए |
| Purification (1996) | दो noisy जोड़ियाँ → एक बेहतर, probabilistically; 5 rounds में F 0.80 → 0.95 |
| Node की ज़रूरतें | Quantum memory, photon interface, telecom frequency conversion |
| Memories | Ions, atoms, diamond में NV और SiV centres, rare-earth crystals |
| Transducers | Superconducting qubits को network में जोड़ने के लिए microwave ↔ optical |
| मील के पत्थर | Micius 2017; Delft 3-node 2021; 35 km Boston और metro links 2024; distributed Grover 2025 |
| चरण | Trusted relays → prepare-and-measure → entanglement → memory → fault-tolerant → computing |
| इस्तेमाल | सुरक्षित links, blind computing, distributed QC, घड़ियाँ, telescopes |
