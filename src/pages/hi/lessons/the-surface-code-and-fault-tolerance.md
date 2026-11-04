---
layout: ../../../layouts/Post.astro
lang: hi
title: "Surface code और fault tolerance"
description: "असली quantum computers अरबों भरोसेमंद operations तक कैसे पहुँचने की योजना बनाते हैं। Surface code का सिर्फ़-पड़ोसी जाँचों वाला grid, errors chains के रूप में और syndromes उनके सिरों के रूप में, matching से decoding, Stim में असली simulation के साथ threshold प्रमेय, जब जाँचें ख़ुद noisy हों तब fault tolerance, T gate के लिए magic state distillation, दस लाख-qubit machine किस काम की है, और hardware कहाँ खड़ा है।"
date: 2026-11-04
category: lesson
lesson: 35
---

पाठ 33 और 34 ने आपको औज़ार दिए: एक logical qubit को कई physical qubits में encode करो, syndrome के लिए stabilizers measure करो, और decode करो। लेकिन अब तक के codes में एक व्यावहारिक समस्या है। Steane code की जाँचें qubits 1, 3, 5 और 7 को जोड़ती हैं, जो असली chip पर दूर-दूर हो सकते हैं। Superconducting chips सपाट grids हैं, और हर qubit सिर्फ़ अपने **सबसे पास के पड़ोसियों** से interact कर सकता है।

**Surface code** इसे हल करता है। हर जाँच square grid पर सिर्फ़ चार पड़ोसी qubits को शामिल करती है। यह लगभग 1% तक के physical error rates सह लेता है, किसी भी ज्ञात code में सबसे ऊँचे में से, और सरल, नियमित तरीके से बढ़ता है। इसीलिए Google, IBM के शुरुआती प्रयोगों और कई दूसरों ने अपने पहले logical qubits इसी code से बनाए। यह पाठ बताता है कि यह कैसे काम करता है, "threshold से नीचे" का क्या मतलब है, जाँच की प्रक्रिया में ही आए errors कैसे संभाले जाते हैं, और काम का fault-tolerant computer कितना बड़ा होना चाहिए।

## बनावट

**Data qubits** का d × d grid सोचें। उनके बीच, grid के ख़ाली खानों में, **measure qubits** (ancillas) बैठते हैं, हर एक अपने आसपास के चार data qubits को छूता है। खाने शतरंज की बिसात की तरह रंगे हैं: आधे **Z-type** जाँचें हैं (चारों पड़ोसियों पर Z का गुणनफल) और आधे **X-type** जाँचें (X का गुणनफल)। किनारों पर, जो जाँचें grid से बाहर निकलतीं वे आधी कट जाती हैं, weight 2 पर।

यहाँ सबसे छोटा काम का version है, distance 3, 9 data qubits (0 से 8 नंबर) और 8 जाँचों के साथ:

```text
        X01
     0 ───── 1 ───── 2
     │ Z0134 │ X1245 │ Z25
     3 ───── 4 ───── 5
 Z36 │ X3467 │ Z4578 │
     6 ───── 7 ───── 8
                X78
```

हर नाम उन data qubits की सूची है जिन्हें जाँच छूती है: Z0134 है Z₀Z₁Z₃Z₄। ऊपर और नीचे के किनारे X-type आधी-जाँचें रखते हैं, बाएँ और दाएँ Z-type। Code को 9 data qubits और 8 measure qubits चाहिए, कुल 17। आम तौर पर distance-d patch d² data qubits और d² − 1 measure qubits लेता है, एक logical qubit के लिए लगभग **2d²** physical qubits।

जाँचें कि यह वैध stabilizer code है, और देखें errors कैसे दिखते हैं:

```python
import numpy as np
from qiskit.quantum_info import Pauli

# Distance-3 rotated surface code. Data qubits on a 3×3 grid:   0 1 2
#                                                               3 4 5
#                                                               6 7 8
z_checks = {"Z0134": [0, 1, 3, 4], "Z4578": [4, 5, 7, 8], "Z36": [3, 6], "Z25": [2, 5]}
x_checks = {"X1245": [1, 2, 4, 5], "X3467": [3, 4, 6, 7], "X01": [0, 1], "X78": [7, 8]}

def pauli_on(qubits, p, n=9):
    label = ["I"] * n
    for q in qubits:
        label[n - 1 - q] = p
    return Pauli("".join(label))

checks = {name: pauli_on(qs, name[0]) for name, qs in {**z_checks, **x_checks}.items()}
print("all 8 checks commute:", all(a.commutes(b) for a in checks.values() for b in checks.values()))

def rank_mod2(rows):
    rows, rank = [r.copy() for r in rows], 0
    for col in range(len(rows[0])):
        pivot = next((i for i in range(rank, len(rows)) if rows[i][col]), None)
        if pivot is None:
            continue
        rows[rank], rows[pivot] = rows[pivot], rows[rank]
        for i in range(len(rows)):
            if i != rank and rows[i][col]:
                rows[i] ^= rows[rank]
        rank += 1
    return rank

r = rank_mod2([np.concatenate([c.x, c.z]).astype(np.uint8) for c in checks.values()])
print(f"independent checks: {r}, so 9 - {r} = {9 - r} logical qubit")

def fired(err):
    return [name for name, c in checks.items() if err.anticommutes(c)] or ["none"]

for qs in [[4], [0], [1, 4], [1, 4, 7]]:
    print(f"X on qubits {str(qs):10s} → checks that fire: {', '.join(fired(pauli_on(qs, 'X')))}")
```

```text
all 8 checks commute: True
independent checks: 8, so 9 - 8 = 1 logical qubit
X on qubits [4]        → checks that fire: Z0134, Z4578
X on qubits [0]        → checks that fire: Z0134
X on qubits [1, 4]     → checks that fire: Z4578
X on qubits [1, 4, 7]  → checks that fire: none
```

8 जाँचें commute करती हैं और स्वतंत्र हैं, 9 − 8 = 1 logical qubit छोड़ते हुए। अब error patterns देखें:

- **बीच वाले** qubit 4 पर X error उसके बगल की **दो** Z-जाँचें fire करता है।
- **कोने** के qubit 0 पर X error सिर्फ़ **एक** fire करता है। उसका दूसरा पड़ोसी grid के बाहर होता।
- Qubits 1 और 4 पर X errors, एक छोटी chain, सिर्फ़ **एक** जाँच fire करते हैं, Z4578, chain के निचले सिरे पर। ऊपरी सिरा ऊपर के किनारे से जा मिला है।
- 1, 4 और 7 पर X errors, ऊपर के किनारे से नीचे के किनारे तक **पूरी तरह** चलती chain, **कुछ भी** fire नहीं करती। यह एक logical X है: रखे data में बिना पकड़ा बदलाव।

## Errors chains हैं, syndromes सिरे हैं

यही pattern surface code का दिल है। हर X error को एक data qubit से गुज़रती छोटी रेखा मानें, जो उसके दोनों ओर की Z-जाँचों को जोड़ती है। Errors की chain जुड़कर एक रास्ता बनती है, और रास्ते की हर जाँच **दो** flips देखती है, जो कट जाते हैं। सिर्फ़ chain के **दो सिरों** की जाँचें विषम संख्या में flips देखती हैं और fire होती हैं। इन fire हुई जाँचों को **defects** कहते हैं।

तो syndrome आपको errors नहीं दिखाता, सिर्फ़ यह कि error chains **कहाँ ख़त्म** होती हैं। Decoder का काम अंदाज़ा लगाना है कि किन chains ने सबसे संभवतः वे सिरे बनाए, और सबसे संभव व्याख्या आम तौर पर chains का वह **सबसे छोटा** set है जो हर defect को किसी दूसरे defect से, या grid के किनारे से, जोड़ दे। यह सबसे छोटी जोड़ी ढूँढना computer science की एक क्लासिक समस्या है जिसे **minimum-weight perfect matching** कहते हैं, और यह कुशलता से हल हो सकती है। Open-source decoder **PyMatching** ठीक यही करता है।

Decoding कब fail होती है? जब decoder की चुनी chains, असली error chains के साथ मिलकर, ऐसा रास्ता बनाएँ जो **एक किनारे से सामने के किनारे तक** फैला हो। वह एक logical operator है, ऊपर के X₁X₄X₇ जैसा। यह संयोग से होने के लिए noise को patch के लगभग आधे हिस्से को ढकती chain बनानी होगी, कम से कम (d + 1)/2 errors एक सीध में। इसीलिए बड़ा patch ज़्यादा सुरक्षित है: (d + 1)/2 errors के मिलकर साज़िश करने की संभावना p^((d+1)/2) की तरह गिरती है।

## Threshold, simulate करके

यहाँ error correction का सबसे अहम प्रयोग है, simulation में। हम distance 3, 5 और 7 के surface code patches लेंगे, syndrome measurement के d rounds चलाएँगे जिसमें **हर** operation noisy है (gates, measurements, resets, खाली qubits, सब error probability p के साथ), matching से decode करेंगे, और गिनेंगे कि logical qubit कितनी बार ग़लत निकला।

पूरे circuit में सैकड़ों noisy operations हैं, state-vector simulator के लिए बहुत ज़्यादा, लेकिन सब Clifford gates और Pauli noise है, तो stabilizer simulator **Stim** (पाठ 34) इसे seconds में संभाल लेता है। दोनों tools `pip install stim pymatching` से install कर सकते हैं:

```python
import stim, pymatching
import numpy as np

def logical_error_rate(d, p, shots=100_000):
    """Simulate d rounds of a distance-d surface code memory with circuit noise p, decode with matching."""
    circuit = stim.Circuit.generated(
        "surface_code:rotated_memory_z", distance=d, rounds=d,
        after_clifford_depolarization=p, before_round_data_depolarization=p,
        before_measure_flip_probability=p, after_reset_flip_probability=p)
    sampler = circuit.compile_detector_sampler(seed=7)
    detections, flips = sampler.sample(shots, separate_observables=True)
    decoder = pymatching.Matching.from_detector_error_model(circuit.detector_error_model(decompose_errors=True))
    guesses = decoder.decode_batch(detections)
    return np.mean(guesses[:, 0] != flips[:, 0])

print("physical p    d = 3      d = 5      d = 7")
for p in [0.002, 0.004, 0.006, 0.008, 0.010]:
    print(f"  {p:.3f}     " + "   ".join(f"{logical_error_rate(d, p):.5f}" for d in [3, 5, 7]))
```

```text
physical p    d = 3      d = 5      d = 7
  0.002     0.00311   0.00113   0.00019
  0.004     0.01142   0.00709   0.00449
  0.006     0.02380   0.02374   0.01959
  0.008     0.03960   0.04888   0.05268
  0.010     0.05871   0.08497   0.10267
```

Table पंक्ति-दर-पंक्ति पढ़ें, और देखें patch बढ़ने पर क्या होता है:

- **p = 0.2%** पर बड़ा कहीं बेहतर है: logical error 0.31% (d = 3) से 0.11% (d = 5) से 0.019% (d = 7) तक गिरता है। Distance के हर क़दम पर error लगभग 3 से 6 गुना कम होता है।
- **p = 0.4%** पर बड़ा अब भी बेहतर है, लेकिन फ़ायदा छोटा है।
- **p = 0.6%** पर तीनों distances लगभग बराबर हैं।
- **p = 0.8% और 1.0%** पर बड़ा **बदतर** है: ज़्यादा qubits मतलब errors के लिए ज़्यादा जगहें, और code पीछे रह जाता है।

यह crossover बिंदु, इस noise model के लिए लगभग 0.6 से 0.7%, **threshold** है। यह **threshold प्रमेय** का असर है, जिसे 1990 के दशक के अंत में कई समूहों ने पहली बार साबित किया (Aharonov और Ben-Or; Knill, Laflamme और Zurek; Kitaev): **अगर physical error rate एक threshold से नीचे है, तो code बड़ा करके logical errors को जितना चाहें उतना छोटा किया जा सकता है।** Threshold से नीचे logical error rate मोटे तौर पर ऐसे चलता है:

> p_L ≈ A · (p / p_th)^((d+1)/2)

अनुपात p_th / p को अक्सर **Λ** (lambda) कहते हैं। हर बार d के 2 बढ़ने पर logical error rate लगभग Λ गुना गिरता है। Λ को आराम से 1 से ऊपर ले जाना error correction पर काम करने वाली हर hardware team का केंद्रीय लक्ष्य है।

## Google का Willow: असल में threshold से नीचे

दिसंबर 2024 में Google ने ठीक यही प्रयोग असली hardware पर, अपनी 105-qubit **Willow** chip के साथ, प्रकाशित किया। उन्होंने distance 3, 5 और 7 की surface code memories चलाईं (सबसे बड़ी में 101 qubits) और पाया कि जाँचों के हर round में logical error distance के हर क़दम पर **Λ ≈ 2.1** गुना गिरा। Distance 7 पर logical qubit ने अपनी जानकारी **chip के सबसे अच्छे अकेले physical qubit से 2.4 गुना धीरे** खोई। पहली बार कोई quantum code बड़ा होने पर साफ़ तौर पर बेहतर हो रहा था, और अपने ही हिस्सों से ज़्यादा टिक रहा था।

उन्होंने **real time** में decoding भी की: decoder chip के लगभग 1-microsecond measurement cycle के साथ चला, जो असली computation को चाहिए होगा, क्योंकि अगले logical operation से पहले corrections पता होने चाहिए। (पाठ 31 में Willow के दूसरे मील के पत्थर हैं।)

## Fault tolerance: जब जाँचें भी noisy हों

ऊपर के simulation में ख़ुद measurements noisy थे, और code फिर भी काम किया। यह अपने आप नहीं होता। इसमें सावधानी लगती है, और **fault tolerance** शब्द का यही मतलब है: ऐसा design जिसमें circuit में कहीं भी **कोई एक गड़बड़ी** ज़्यादा से ज़्यादा ठीक होने लायक़ नुक़सान करे।

तीन विचार surface code को fault-tolerant बनाते हैं:

1. **Measurements दोहराओ।** ग़लत पढ़ी जाँच ठीक असली error जैसी दिखती है। लेकिन असली error टिका रहता है, जबकि measurement error एक round में आता है और अगले में ग़ायब। तो code सारी जाँचें बार-बार measure करता है (d rounds आम है), और decoder rounds के बीच syndrome के **बदलावों** को देखता है। Measurement errors फिर **समय** में chains बन जाते हैं, और matching space और समय के 3D grid पर काम करता है, जो Stim simulation ने किया।
2. **Gates का क्रम ध्यान से चुनो।** हर measure qubit अपने पड़ोसियों के साथ चार CNOTs करता है। बीच में measure qubit पर error दो data qubits पर फैल सकता है (तथाकथित **hook error**)। चार CNOTs का क्रम चुनकर पक्का किया जाता है कि ऐसी जोड़ी उस दिशा में **चले** जो सामने के किनारों के बीच का रास्ता छोटा न करे, ताकि वह code का distance न घटा सके।
3. **Corrections software में रखो।** X और Z corrections को सचमुच qubits पर लगाने की ज़रूरत नहीं। Classical controller बस उन्हें याद रखता है (इसे **Pauli frame** कहते हैं) और बाद के measurement नतीजों को उसी हिसाब से पढ़ता है, gates और समय बचाते हुए।

## Logical gates, और T की समस्या

Qubit रखना काफ़ी नहीं; उससे गणना भी करनी है। Surface code पर:

- **Logical X और Z** मुफ़्त हैं: बस Pauli frame के updates।
- **Logical CNOT** **lattice surgery** से होता है: दो patches को एक किनारे पर अस्थायी रूप से जोड़ा जाता है, जोड़ के आर-पार नई जाँचें measure करके, फिर अलग किया जाता है। हर क़दम सिर्फ़ nearest-neighbour operations इस्तेमाल करता है।
- **Logical H और S** मिलते-जुलते patch बदलावों से होते हैं, थोड़े ज़्यादा ख़र्च के साथ।

इससे Clifford gates मिलते हैं, जो पाठ 17 ने दिखाया कि universal computation के लिए काफ़ी नहीं (और पाठ 34 का Eastin–Knill प्रमेय कहता है कि कोई code सब कुछ transversally नहीं पाता)। ग़ायब हिस्सा है **T gate**।

मानक हल एक ख़ास resource state बनाना है, **magic state** |T⟩ = T|+⟩, और उससे **gate teleportation** द्वारा T लगाना: एक छोटा Clifford circuit और एक measurement एक |T⟩ ख़र्च करके data qubit पर T लगाते हैं। पेंच यह है कि सीधे बनी magic states सिर्फ़ physical hardware जितनी अच्छी होती हैं, लगभग 10⁻³ error, बहुत ज़्यादा noisy।

तो उन्हें **magic state distillation** से शुद्ध किया जाता है (Bravyi और Kitaev, 2005)। सबसे मशहूर protocol **15** noisy magic states लेकर, सिर्फ़ Clifford operations और पाठ 34 के विचारों से बने code से, **एक** कहीं बेहतर state देता है, error लगभग **35p³** के साथ:

```python
p = 1e-3                                     # error rate of a raw, noisy T state
print(f"raw T state:      error {p:.1e}")
for rnd in [1, 2]:
    p = 35 * p ** 3                          # 15 noisy T states in, 1 better one out
    print(f"after round {rnd}:    error {p:.1e}   (cost: {15 ** rnd} raw states each)")
```

```text
raw T state:      error 1.0e-03
after round 1:    error 3.5e-08   (cost: 15 raw states each)
after round 2:    error 1.5e-21   (cost: 225 raw states each)
```

दो rounds 10⁻³ वाली state को लगभग 10⁻²¹ error वाली बना देते हैं, किसी भी algorithm की ज़रूरत से कहीं बेहतर। लेकिन क़ीमत भारी है: हर T gate के लिए 225 कच्ची states, और बहुत सारी जगह और समय। कई designs में magic state "factories" पूरी machine का बड़ा हिस्सा घेरती हैं। नई तकनीकें, जैसे **magic state cultivation** (Gidney, Shutty और Jones, 2024), अच्छी magic states सस्ते में उगाती हैं, और यह क़ीमत घटाना field के सबसे सक्रिय विषयों में से एक है।

## काम की machine कितनी बड़ी होनी चाहिए?

अब हम पाठ 28 के एक सवाल का जवाब दे सकते हैं: RSA तोड़ने के resource estimates **दस लाख** qubits की बात क्यों करते हैं?

मान लें एक algorithm लगभग एक अरब logical operations चलाता है। तो हर logical operation के fail होने की probability लगभग 10⁻¹² या कम होनी चाहिए। 1% threshold के साथ सूत्र p_L ≈ 0.03 (p/p_th)^((d+1)/2) से distance, और इसलिए हर logical qubit के physical qubits निकाल सकते हैं:

```python
def distance_needed(p, target, p_th=0.01, A=0.03):
    """Smallest odd d with A·(p/p_th)^((d+1)/2) below the target logical error rate."""
    d = 3
    while A * (p / p_th) ** ((d + 1) / 2) > target:
        d += 2
    return d

target = 1e-12            # roughly what a billion-operation algorithm needs per logical operation
print("physical p   distance d   physical qubits per logical qubit (≈ 2d²)")
for p in [5e-3, 2e-3, 1e-3, 5e-4, 1e-4]:
    d = distance_needed(p, target)
    print(f"  {p:.0e}         {d:3d}            {2 * d * d:6,d}")
```

```text
physical p   distance d   physical qubits per logical qubit (≈ 2d²)
  5e-03          69             9,522
  2e-03          29             1,682
  1e-03          21               882
  5e-04          17               578
  1e-04          11               242
```

10⁻³ के physical error rate पर, जो आज के अच्छे hardware का आम है, हर logical qubit को distance-21 patch चाहिए, लगभग 900 physical qubits। कुछ हज़ार logical qubits वाला algorithm, ऊपर से magic state factories और routing की जगह, जल्दी लाखों तक पहुँचता है। ध्यान दें कि ख़र्च hardware की गुणवत्ता पर कितनी तेज़ी से निर्भर है: physical errors को 10⁻³ से 10⁻⁴ करने से हर logical qubit लगभग **चार गुना** छोटा होता है। बेहतर physical qubits और बेहतर codes आपस में गुणा होते हैं।

इन तकनीकों के सुधरने के साथ असली estimates लगातार गिरे हैं। 2019 में Gidney और Ekerå ने अनुमान लगाया कि 2048-bit RSA नंबर factor करने को लगभग **2 करोड़** noisy qubits लगभग 8 घंटे चलाने होंगे। 2025 में Gidney ने इसे घटाकर **दस लाख से कम** qubits, **एक हफ़्ते से कम** चलाना कर दिया, 0.1% gate errors और 1-microsecond cycle मानकर। इतनी बड़ी machine अभी मौजूद नहीं, लेकिन लक्ष्य अब ठोस है।

## हालात कहाँ हैं

2026 तक error correction सिद्धांत से कई platforms पर चलते प्रयोगों तक आ गया है:

- **Google (superconducting):** Willow के साथ threshold से नीचे surface code memory (2024), जैसा ऊपर बताया।
- **Harvard, MIT और QuEra (neutral atoms):** 2023 में उन्होंने **48 logical qubits** तक पर circuits चलाए, laser tweezers से atoms को इधर-उधर ले जाकर दूर के qubits जोड़ते हुए, जो लंबी दूरी की जाँचों वाले codes के लिए अनुकूल है।
- **Quantinuum (trapped ions):** अपनी H-series और Helios machines पर उच्च-fidelity logical qubits और logical operations, जिसमें 2024 में Microsoft के साथ 12 logical qubits को entangle करना शामिल है।
- **IBM (superconducting):** **qLDPC codes** (पाठ 34 का [[144, 12, 12]] "gross" code) पर दाँव लगाया है, जिन्हें हर logical qubit के लिए कहीं कम physical qubits चाहिए, और **Starling** नाम की fault-tolerant machine का roadmap घोषित किया है, 2029 के लक्ष्य के साथ।
- **Amazon (cat qubits):** उसकी **Ocelot** chip (2025) ऐसे qubits इस्तेमाल करती है जो स्वाभाविक रूप से bit flips से सुरक्षित हैं, तो code को सिर्फ़ phase flips ठीक करने होते हैं, overhead घटाते हुए।

हर जगह pattern एक है: physical से सचमुच बेहतर logical qubits मौजूद हैं, और अब होड़ है उनमें से बहुत सारे बनाने, उन्हें जोड़ने, और काम के algorithms के लिए logical gates (ख़ासकर T) काफ़ी तेज़ चलाने की।

## आज़माकर देखें

1. Distance-5 surface code patch कितने physical qubits (data और measure) इस्तेमाल करता है?
2. Distance-3 बनावट में qubit 8 पर X error से कौन-सी जाँचें fire होती हैं?
3. एक X error chain ऊपर के किनारे से qubit 4 तक चलती है (qubits 1 और 4 पर errors)। Matching decoder सबसे संभवतः क्या करता है, और यह समस्या क्यों है?
4. Simulation table में p = 0.2% पर d = 5 से d = 7 तक logical error मोटे तौर पर कितने गुना गिरा?
5. Surface code हर round में हर जाँच एक बार measure करके नतीजे पर भरोसा क्यों नहीं कर सकता?
6. 2 × 10⁻³ error वाली magic states से शुरू करें, 15-से-1 distillation के एक round के बाद error क्या है?
7. Overhead table से, p = 10⁻³ पर 1,000 logical qubits को मोटे तौर पर कितने physical qubits चाहिए (magic state factories छोड़कर)?

**जवाब:**

1. d² + (d² − 1) = 25 + 24 = **49**।
2. Qubit 8 एक कोना है। वह Z4578 में है (और X78 में, लेकिन वह X-जाँच है, जो X errors नहीं देख सकती)। तो सिर्फ़ **Z4578** fire होती है।
3. उसे एक defect (Z4578) दिखता है और वह उसे सबसे पास के किनारे से जोड़ता है, जो **नीचे** का किनारा है, qubit 7 से होकर, तो वह X₇ लगाता है (X₈ भी उतना ही ठीक होता)। असली errors X₁X₄ के साथ मिलकर यह X₁X₄X₇ है, एक **logical error**। दो errors, distance-3 code की क्षमता से ज़्यादा हैं।
4. 0.00113 से 0.00019, लगभग **6** गुना। (d = 7 पर सिर्फ़ लगभग 19 failures गिने गए, तो यह संख्या ख़ुद कुछ noisy है; ज़्यादा shots उसे पक्का करेंगे।)
5. Measurements भी noisy हैं। एक ग़लत पढ़ाई असली error जैसी दिखेगी और ग़लत correction करवाएगी। Measurements दोहराने से decoder एक बार के measurement error (आता है और ग़ायब होता है) को असली data error (टिका रहता है) से अलग कर पाता है।
6. 35 × (2 × 10⁻³)³ = 35 × 8 × 10⁻⁹ = **2.8 × 10⁻⁷**।
7. लगभग 1,000 × 882 ≈ **9,00,000** physical qubits, factories और routing गिनने से पहले ही दस लाख के क़रीब।

## सार-सूत्र

| विचार | सूत्र या तथ्य |
|---|---|
| Surface code | d × d data qubits, d² − 1 सिर्फ़-पड़ोसी जाँचें (शतरंज की तरह X और Z) |
| ख़र्च | हर logical qubit के लिए ≈ 2d² physical qubits |
| Logical operators | Patch के आर-पार एक किनारे से सामने के किनारे तक chains |
| Defects | Fire हुई जाँचें error chains के **सिरे** बताती हैं |
| Decoding | Defects को सबसे छोटी chains से जोड़ो: minimum-weight perfect matching (PyMatching) |
| Threshold प्रमेय | p_th से नीचे code बढ़ने पर logical errors घटते हैं |
| Scaling | p_L ≈ A (p/p_th)^((d+1)/2); हर d → d + 2 पर p_L, Λ = p_th/p से बँटता है |
| Surface code threshold | लगभग 1% (noise model के मुताबिक़ ≈ 0.6–1%) |
| Willow (2024) | d = 3, 5, 7; Λ ≈ 2.1; logical qubit सबसे अच्छे physical से 2.4× ज़्यादा टिकाऊ |
| Fault tolerance | कोई एक गड़बड़ी सिर्फ़ ठीक होने लायक़ नुक़सान करे; जाँचें दोहराओ, gates का क्रम, Pauli frame |
| Lattice surgery | Patches जोड़कर और अलग करके logical CNOT |
| Magic states | \|T⟩ = T\|+⟩ state teleport करके T लगाया जाता है |
| Distillation | 15 noisy \|T⟩ → 1, error ≈ 35p³ |
| RSA-2048 | 2019: ~2 करोड़ qubits; 2025: दस लाख से कम qubits, एक हफ़्ते से कम |
| Tools | Stim (तेज़ stabilizer circuits), PyMatching (decoder): `pip install stim pymatching` |
