---
layout: ../../../layouts/Post.astro
lang: hi
title: "Entanglement और Bell states"
description: "Entanglement क्या है और क्या नहीं: ऐसे correlations जो हर basis में बने रहते हैं, हर qubit अकेले में पूरी तरह random, entropy से entanglement नापना, इससे रोशनी से तेज़ संदेश क्यों नहीं भेजे जा सकते, कई qubits की GHZ states, और entanglement एक ऐसा संसाधन क्यों है जिसे computing, communication और sensing सब ख़र्च करते हैं।"
date: 2026-11-04
category: lesson
lesson: 14

---

Einstein ने इसे "दूर से भूतिया असर" कहा। Schrödinger ने, जिन्होंने इसे नाम दिया, इसे "quantum mechanics का ख़ास लक्षण, वह जो उसे classical सोच से पूरी तरह अलग करता है" कहा। Entanglement quantum physics का सबसे मशहूर और सबसे ग़लत समझा जाने वाला विचार है।

आप इसे बनाना जानते हैं (पाठ 13: H फिर CNOT) और परखना भी (पाठ 12: ऐसी state जो product नहीं)। यह पाठ इसके **मतलब** के बारे में है: entangled जोड़ी को measure करने पर वह असल में क्या करती है, इसे किसके लिए इस्तेमाल किया जा सकता है और किसके लिए नहीं, और "कितना entangled" को नंबर कैसे दें। सब कोड से जाँचा हुआ, ताकि भूतियापन को छिपने की जगह न मिले।

## परिभाषा, एक बार फिर

कई qubits की state **entangled** है अगर उसे उसके हिस्सों की states के tensor product की तरह न लिखा जा सके। दो qubits [a, b, c, d] के लिए, इसका मतलब ad − bc ≠ 0 (पाठ 12)।

चार **Bell states** सबसे ज़्यादा entangled states हैं जिनमें दो qubits हो सकते हैं:

> Φ⁺ = (|00⟩ + |11⟩)/√2   Φ⁻ = (|00⟩ − |11⟩)/√2
> Ψ⁺ = (|01⟩ + |10⟩)/√2   Ψ⁻ = (|01⟩ − |10⟩)/√2

ये orthonormal हैं, तो two-qubit space का एक basis बनाती हैं, जिसे **Bell basis** कहते हैं। हम Φ⁺ पर ध्यान देंगे; बाक़ी चिह्न या bit values बदलकर वैसे ही चलती हैं।

आम कहानी सोचें: Alice एक Φ⁺ जोड़ी का पहला qubit लेती है और Bob दूसरा। दोनों दूर चले जाते हैं। फिर हर एक अपना qubit measure करता है।

## तथ्य 1: 0/1 basis में पूरा correlation

दोनों 0/1 basis में measure करें तो आधी बार **00** और आधी बार **11** मिलता है। कभी 01 या 10 नहीं। Alice को जो मिले, Bob को वही।

अब तक कुछ अजीब नहीं। एक classical "सिक्कों की जोड़ी" यह कर सकती है: दो एक जैसे सिक्के, दोनों heads या दोनों tails (एक छिपे उछाल से तय), दो लिफ़ाफ़ों में रखें। हर लिफ़ाफ़ा 50/50 है, और दोनों हमेशा मेल खाते हैं। यह **साझा छिपे चुनाव** से आया correlation है, और इसमें कुछ भूतिया नहीं।

## तथ्य 2: दूसरे bases में भी पूरा correlation

यहाँ Φ⁺ लिफ़ाफ़ों से अलग है। इसे +/− basis में दोबारा लिखें, पाठ 3 के |0⟩ = (|+⟩ + |−⟩)/√2 और |1⟩ = (|+⟩ − |−⟩)/√2 से। दोनों को खोलें:

```text
|00⟩ = ½ (|++⟩ + |+−⟩ + |−+⟩ + |−−⟩)
|11⟩ = ½ (|++⟩ − |+−⟩ − |−+⟩ + |−−⟩)

(|00⟩ + |11⟩)/√2 = (1/√2)·½·(2|++⟩ + 2|−−⟩) = (|++⟩ + |−−⟩)/√2
```

मिले-जुले पद कट जाते हैं। **+/− basis में Φ⁺ का रूप ठीक वैसा ही है।** तो अगर Alice और Bob दोनों "+ या −" measure करें, तो भी हमेशा मेल खाते हैं।

लिफ़ाफ़े यह नहीं कर सकते। अगर हर सिक्के के अंदर एक तय face छिपा है, तो "बग़ल वाले" सवाल (+ या − का समकक्ष) का कोई तय जवाब नहीं जो दोनों सिक्कों के लिए एक हो। लिफ़ाफ़ों की जोड़ी **एक** basis में correlated है; Bell जोड़ी **हर** basis में एक साथ। यह पहला संकेत है कि entanglement सिर्फ़ छिपी साझा जानकारी नहीं है। पाठ 15 इसे एक तीखी, परखी जा सकने वाली असमानता में बदलता है।

यह सब expectation values से निकाला जा सकता है। दो qubits के लिए ⟨ZZ⟩ दोनों ±1 नतीजों के गुणनफल का औसत है: +1 मतलब "हमेशा मेल", −1 "हमेशा उल्टा", 0 "कोई रिश्ता नहीं"।

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, SparsePauliOp

bell = QuantumCircuit(2)
bell.h(0)
bell.cx(0, 1)
phi = Statevector(bell)                     # (|00> + |11>)/sqrt2

for pauli in ["ZZ", "XX", "YY", "ZI", "IZ", "XI"]:
    value = phi.expectation_value(SparsePauliOp(pauli)).real
    print(pauli, round(float(value), 3) + 0.0)
```

```text
ZZ 1.0
XX 1.0
YY -1.0
ZI 0.0
IZ 0.0
XI 0.0
```

Z और X के लिए पूरा मेल, Y के लिए पूरा **उल्टा** (यह i का कमाल है: |+i⟩|+i⟩ और |−i⟩|−i⟩ कट जाते हैं, उल्टी जोड़ियाँ बचती हैं)। और आख़िरी तीन लाइनें देखें: ⟨ZI⟩, ⟨IZ⟩ और ⟨XI⟩ सब शून्य हैं। यही अगला तथ्य है।

## तथ्य 3: हर qubit अकेले में पूरी तरह random

किसी भी qubit के single-qubit expectation values ⟨X⟩, ⟨Y⟩, ⟨Z⟩ सब **शून्य** हैं। उसका Bloch vector (0, 0, 0) है: Bloch sphere का **केंद्र** (पाठ 7)। अकेले में Bell जोड़ी का हर आधा हिस्सा पूरी तरह mixed state में है, हर basis में 50/50।

यही entanglement का अजीब दिल है: **पूरी जोड़ी एक बिल्कुल तय, pure state में है, लेकिन हर हिस्सा अकेले में पूरी randomness की state में।** सारी जानकारी correlations में है; हिस्सों में कुछ नहीं।

किसी बड़े system के एक हिस्से को बताने का औज़ार **density matrix** है (पाठ 16 इसे पूरा समझाता है)। एक qubit का विवरण फेंक देना **partial trace** लेना कहलाता है। Bell जोड़ी के लिए बचता है ½·I: 50/50 मिश्रण।

### Entanglement नापना: entropy

हिस्सा कितना random है? इसे **entanglement entropy** से नंबर दिया जा सकता है: एक हिस्से की state की entropy (bits में)।

- **0 bits:** हिस्सा pure state में है। कोई entanglement नहीं: यह product state है।
- **1 bit:** हिस्सा पूरी तरह random है। दो qubits के लिए अधिकतम entanglement।

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, partial_trace, entropy

bell = QuantumCircuit(2)
bell.h(0)
bell.cx(0, 1)
phi = Statevector(bell)

rho_bob = partial_trace(phi, [0])           # throw away qubit 0, keep qubit 1
print(np.round(rho_bob.data.real, 3))
print("entanglement entropy:", round(entropy(rho_bob, base=2), 3))

prod = QuantumCircuit(2)
prod.h(0)                                   # |+> on qubit 0, |0> on qubit 1: no entanglement
print("product state entropy:", round(entropy(partial_trace(Statevector(prod), [0]), base=2), 3))
```

```text
[[0.5 0. ]
 [0.  0.5]]
entanglement entropy: 1.0
product state entropy: 0.0
```

Bob का qubit ½·I है, ठीक 1 bit entropy के साथ: entanglement की एक "ebit", जिससे इसे गिना जाता है। एक qubit teleport करने (पाठ 21) में ठीक एक ebit लगती है।

## तथ्य 4: रोशनी से तेज़ संदेश नहीं

जब Alice अपना qubit measure करती है और 0 पाती है, Bob का qubit तुरंत |0⟩ हो जाता है, कितना भी दूर हो। क्या वह इससे Bob को संदेश भेज सकती है?

**नहीं।** Bob सिर्फ़ अपने नतीजे देखता है, और उसके नतीजे **Alice चाहे जो करे** 50/50 रहते हैं। अगर वह Z basis में measure करे, Bob का qubit random रूप से |0⟩ या |1⟩ बनता है; X में करे तो random रूप से |+⟩ या |−⟩; कुछ न करे तो वह Bell जोड़ी का आधा रहता है। तीनों हालत में Bob की नज़र से उसका qubit पूरा 50/50 मिश्रण है। Simulation:

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler

sampler = StatevectorSampler(seed=np.random.default_rng(8))
circuits = []
for alice_basis in ["Z", "X"]:
    qc = QuantumCircuit(2)
    qc.h(0)
    qc.cx(0, 1)                 # Bell pair: Alice has qubit 0, Bob has qubit 1
    if alice_basis == "X":
        qc.h(0)                 # Alice measures in the X basis instead
    qc.measure_all()
    circuits.append(qc)

for alice_basis, res in zip(["Z", "X"], sampler.run(circuits, shots=4000).result()):
    counts = res.data.meas.get_counts()
    bob0 = sum(v for k, v in counts.items() if k[0] == "0")   # left digit = qubit 1 = Bob
    print(f"Alice measures {alice_basis}: Bob sees 0 in {bob0 / 4000:.3f} of runs")
```

```text
Alice measures Z: Bob sees 0 in 0.502 of runs
Alice measures X: Bob sees 0 in 0.492 of runs
```

दोनों shot noise के अंदर 50/50 हैं। Alice का चुनाव Bob के आँकड़ों में कोई निशान नहीं छोड़ता। Correlations बाद में ही दिखते हैं, जब Alice और Bob एक साधारण channel से **नतीजे मिलाते** हैं, जो रोशनी की रफ़्तार से बँधा है। इस सिद्धांत को **no-signalling** कहते हैं, और इसी वजह से entanglement और relativity शांति से साथ रहते हैं। इसीलिए teleportation में Alice को दो classical bits भेजने पड़ते हैं (पाठ 21)।

## कई qubits को entangle करना: GHZ state

Bell circuit को CNOTs की श्रृंखला से बढ़ाएँ तो **GHZ state** मिलती है (Greenberger, Horne और Zeilinger के नाम पर):

> (|00…0⟩ + |11…1⟩)/√2

सभी n qubits या तो सब 0 या सब 1, superposition में। किसी एक को measure करें और बाक़ी सब पता चल जाते हैं।

```python
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler

ghz = QuantumCircuit(5)
ghz.h(0)
for q in range(4):
    ghz.cx(q, q + 1)            # chain of CNOTs spreads the superposition
ghz.measure_all()
print(StatevectorSampler(seed=1).run([ghz], shots=1000).result()[0].data.meas.get_counts())
```

```text
{'11111': 493, '00000': 507}
```

सिर्फ़ 00000 और 11111 आते हैं। GHZ states quantum computers को परखने में इस्तेमाल होती हैं (अच्छी 50-qubit GHZ state बड़ी उपलब्धि है, क्योंकि कहीं भी एक ग़लती उसे बिगाड़ देती है), standard सीमा से आगे quantum sensing (पाठ 44) में, और error-correcting codes (भाग F) में।

Multi-qubit entanglement और तरह का भी होता है। **W state** (|100⟩ + |010⟩ + |001⟩)/√3 अलग बर्ताव करती है: GHZ state का एक qubit खो जाए तो बाक़ी unentangled हो जाते हैं, लेकिन W state का एक qubit खोने पर बाक़ी दो entangled रहते हैं। तीन या ज़्यादा qubits के लिए entanglement सचमुच अलग-अलग प्रकारों में आता है।

## Entanglement क्या है, और क्या नहीं

| Entanglement है | Entanglement नहीं है |
|---|---|
| ऐसे correlations जो कोई साझा छिपी योजना नहीं बना सकती (पाठ 15) | रोशनी से तेज़ संदेश भेजने का तरीका |
| पूरे system का गुण, उसके हिस्सों का नहीं | दो कणों का पहले से "चुपके से तय करना" |
| एक संसाधन जो protocols में **ख़र्च होता है** | आसानी से टिकने वाली चीज़: noise इसे जल्दी नष्ट करता है |
| **Monogamous:** अगर A, B से पूरी तरह entangled है, तो A, C से बिल्कुल entangled नहीं हो सकता | सिर्फ़ दूर के कणों की बात: एक chip पर पड़ोसी qubits भी ठीक इसी तरह entangled होते हैं |

Monogamy वाली row का व्यावहारिक मतलब है: अगर Alice और Bob के पास पूरी Bell जोड़ी है, तो कोई जासूस उससे entangled नहीं हो सकता। E91 protocol की सुरक्षा का यही विचार है (पाठ 41)।

### Entanglement कहाँ ख़र्च होता है

| इस्तेमाल | पाठ |
|---|---|
| एक qubit teleport करना (1 ebit + 2 classical bits) | 21 |
| Superdense coding (1 qubit + 1 ebit से 2 bits भेजना) | 21 |
| Quantum algorithms: exponentially कई entangled पदों में interference | 22–31 |
| Error-correcting codes: एक qubit की जानकारी कई पर फैलाना | 33–35 |
| Bell tests के साथ quantum key distribution | 41 |
| Quantum repeaters और quantum internet | 42 |
| Standard quantum limit से आगे sensing | 44 |

## ख़ुद करके देखें

1. Ψ⁻ = (|01⟩ − |10⟩)/√2 को +/− basis में लिखें। क्या दिखता है?
2. Φ⁺ के लिए ⟨ZX⟩ क्या है (Alice के qubit पर Z, Bob के पर X)? पहले अनुमान लगाएँ, फिर तर्क दें।
3. Alice और Bob के पास Ψ⁺ = (|01⟩ + |10⟩)/√2 है और दोनों 0/1 basis में measure करते हैं। उन्हें क्या नतीजे मिल सकते हैं?
4. क्या (|00⟩ + |01⟩ + |10⟩ + |11⟩)/2 entangled है? उसकी entanglement entropy क्या है?
5. Alice अपने Φ⁺ के आधे को measure करती है और 1 पाती है। Bob का qubit अब किस state में है? क्या Bob, Alice से बात किए बिना बता सकता है कि उसने measure किया?
6. 5-qubit GHZ state में आप qubit 2 measure करते हैं और 0 मिलता है। बाक़ी चार क्या देंगे?

**जवाब:**

1. कुल चिह्न छोड़कर (|−+⟩ − |+−⟩)/√2। **वही रूप**: Ψ⁻ +/− basis में भी उल्टा-correlated है। असल में Ψ⁻ हर basis में एक जैसी दिखती है; यह "singlet" state है।
2. **0।** Alice का Z नतीजा और Bob का X नतीजा पूरी तरह असंबंधित हैं: Alice को 0 मिलने पर Bob |0⟩ में रहता है, जो X के लिए 50/50 है।
3. सिर्फ़ **01** या **10**, हर एक ½ probability से: हमेशा उल्टे।
4. नहीं: यह |+⟩|+⟩ है (ad − bc = ¼ − ¼ = 0)। Entropy **0**।
5. **|1⟩।** नहीं: उसके आँकड़े दोनों हालत में 50/50 हैं। सिर्फ़ Alice से नतीजे मिलाने पर correlation दिखता है।
6. सब **0**: state |00000⟩ में collapse हो गई।

## सार

| विचार | सूत्र या तथ्य |
|---|---|
| Entangled | हिस्सों की states का product नहीं (2 qubits: ad − bc ≠ 0) |
| Bell states | Φ± = (\|00⟩ ± \|11⟩)/√2, Ψ± = (\|01⟩ ± \|10⟩)/√2 |
| +/− basis में Φ⁺ | (\|++⟩ + \|−−⟩)/√2: वही रूप |
| Φ⁺ के correlations | ⟨ZZ⟩ = ⟨XX⟩ = 1, ⟨YY⟩ = −1 |
| हर qubit अकेले | ⟨X⟩ = ⟨Y⟩ = ⟨Z⟩ = 0: Bloch sphere का केंद्र |
| Reduced state | Bell जोड़ी का partial trace = ½·I |
| Entanglement entropy | Product states के लिए 0 bits, Bell जोड़ी के लिए 1 bit (एक ebit) |
| No-signalling | Bob के आँकड़े कभी इस पर निर्भर नहीं कि Alice क्या measure करती है |
| GHZ state | (\|0…0⟩ + \|1…1⟩)/√2: सब मेल खाते हैं |
| W state | (\|100⟩ + \|010⟩ + \|001⟩)/√3: एक qubit खोने पर भी entanglement बचता है |
| Monogamy | B से पूरा entanglement, C से entanglement को रोकता है |
| संसाधन | Teleportation, superdense coding, QKD, sensing, error correction |
| कोड में | `partial_trace`, `entropy`, `expectation_value(SparsePauliOp("ZZ"))` |
