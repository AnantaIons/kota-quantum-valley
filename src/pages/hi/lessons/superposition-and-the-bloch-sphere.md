---
layout: ../../../layouts/Post.astro
lang: hi
title: "Superposition और Bloch sphere"
description: "हर qubit state एक गोले पर बिंदु क्यों है, दो Bloch कोण α और β से कैसे निकलते हैं, θ/2 क्यों आता है, छह मुख्य states, superposition सिक्के के उछाल से कैसे अलग है (एक test के साथ जो आप चला सकते हैं), और गोले के अंदर का मतलब।"
date: 2026-11-04
category: lesson
lesson: 7

---

पाठ 6 ने कहा था कि qubit की state एक vector |ψ⟩ = α|0⟩ + β|1⟩ है, दो complex numbers α और β के साथ। यह सही है, पर कल्पना करना कठिन है: दो complex numbers यानी चार real नंबर, और चार आयाम कोई नहीं देख सकता।

यह पाठ दिखाता है कि **हर qubit state असल में एक गेंद की सतह पर एक बिंदु है**, जिसे **Bloch sphere** कहते हैं। जब आप states को बिंदुओं और gates को घुमावों की तरह देखने लगें, तो single-qubit quantum computing ऐसी चीज़ बन जाती है जिसे आँखों से समझा जा सके। और हम ठीक-ठीक तय करेंगे कि **superposition** का मतलब क्या है, एक आसान प्रयोग के साथ जो दिखाता है कि यह "हमें पता नहीं कौन-सा" जैसा नहीं है।

## चार नंबरों से दो कोणों तक

α और β से शुरू करें। हर complex number का एक आकार और एक कोण है (पाठ 2), तो state में चार real नंबर हैं। दो बातें इसे घटाती हैं।

**1. Normalisation एक हटाता है।** Probabilities का जोड़ 1 होना चाहिए: |α|² + |β|² = 1। α का आकार पता हो तो β का भी पता है। तो दोनों आकार एक ही कोण से लिखे जा सकते हैं। क्योंकि cos² + sin² = 1, लिखें:

> |α| = cos(θ/2),  |β| = sin(θ/2)

("/2" अजीब लगता है। यह सवाल याद रखें; नीचे समझाया है।)

**2. Global phase एक और हटाता है।** पूरी state को e^(iγ) से गुणा करने से कुछ भी नापा जा सकने वाला नहीं बदलता (पाठ 2)। तो हम दोनों amplitudes को साथ घुमाकर α को positive real बना सकते हैं। सिर्फ़ उनके phases का **अंतर** बचता है। उसे φ कहें।

बचे दो कोण, θ और φ, और हर qubit state ऐसे लिखी जा सकती है:

> **|ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)·sin(θ/2)|1⟩**

θ 0 से 180° तक और φ 0 से 360° तक। गोले की सतह पर एक बिंदु बताने के लिए ठीक दो कोण चाहिए: θ उत्तरी ध्रुव से नीचे की ओर नापे अक्षांश जैसा है, और φ देशांतर जैसा।

## गोला बनाना

साधारण spherical coordinates से बिंदु को unit sphere पर रखें:

```text
x = sin θ · cos φ
y = sin θ · sin φ
z = cos θ
```

केंद्र से उस बिंदु तक का तीर **Bloch vector** है। कुछ तुरंत नतीजे:

- **θ = 0** से |ψ⟩ = |0⟩। यह **उत्तरी ध्रुव** है, (0, 0, 1)।
- **θ = 180°** से |ψ⟩ = e^(iφ)|1⟩, जो global phase छोड़कर |1⟩ है। यह **दक्षिणी ध्रुव** है, (0, 0, −1)।
- **θ = 90°** से |α| = |β| = 1/√2: 50/50 superposition। ये states **भूमध्य रेखा** पर हैं, और φ बताता है कहाँ।

### छह मुख्य states

| State | Amplitudes | θ, φ | Bloch vector | कहाँ |
|---|---|---|---|---|
| \|0⟩ | [1, 0] | 0°, कोई भी | (0, 0, 1) | उत्तरी ध्रुव |
| \|1⟩ | [0, 1] | 180°, कोई भी | (0, 0, −1) | दक्षिणी ध्रुव |
| \|+⟩ | [1, 1]/√2 | 90°, 0° | (1, 0, 0) | भूमध्य, सामने (+x) |
| \|−⟩ | [1, −1]/√2 | 90°, 180° | (−1, 0, 0) | भूमध्य, पीछे (−x) |
| \|+i⟩ | [1, i]/√2 | 90°, 90° | (0, 1, 0) | भूमध्य, दाएँ (+y) |
| \|−i⟩ | [1, −i]/√2 | 90°, 270° | (0, −1, 0) | भूमध्य, बाएँ (−y) |

(Qiskit |+i⟩ और |−i⟩ को 'r' और 'l' कहता है, right और left।)

### θ/2 क्यों? उल्टे बिंदु orthogonal states हैं

गोले पर |0⟩ और |1⟩ **उल्टे** बिंदु हैं, 180° दूर। लेकिन vectors की तरह |0⟩ और |1⟩ एक-दूसरे से **90°** पर हैं: orthogonal (⟨0|1⟩ = 0)। गोला state vectors की तुलना में हर कोण **दोगुना** कर देता है। θ/2 यहीं से आता है: गोले पर कोण θ का मतलब state vectors के बीच θ/2 कोण।

इससे निकलने वाला काम का नियम:

> **Bloch sphere पर उल्टे बिंदु orthogonal states हैं**, जिन्हें एक measurement पूरी तरह अलग पहचान सकता है।

तो |+⟩ और |−⟩ (सामने और पीछे) orthogonal हैं, और |+i⟩ और |−i⟩ भी। गोले का हर व्यास एक basis है जिसमें measure किया जा सकता है।

### तस्वीर से सीधे probabilities पढ़ना

z coordinate साधारण 0/1 measurement की probabilities बताता है:

```text
P(0) = cos²(θ/2) = (1 + cos θ)/2 = (1 + z)/2
P(1) = sin²(θ/2) = (1 − cos θ)/2 = (1 − z)/2
```

(11वीं की trigonometry की half-angle identity cos²(θ/2) = (1 + cos θ)/2 से।)

तो 0/1 measurement के लिए बिंदु की **ऊँचाई** ही मायने रखती है। उत्तरी ध्रुव: P(0) = 1। भूमध्य: 50/50। दो-तिहाई ऊपर (z = 1/3): P(0) = 2/3। देशांतर φ इस measurement के लिए पूरी तरह अदृश्य है, लेकिन हर चीज़ के लिए नहीं, जैसा नीचे और पाठ 10 में दिखेगा।

बाक़ी अक्षों के लिए भी यही चलता है। x, +/− measurement की संभावनाएँ बताता है, और y, +i/−i measurement की:

> P(+) = (1 + x)/2,  P(+i) = (1 + y)/2

असल में x, y और z ठीक X, Y और Z observables के **expectation values** हैं (पाठ 5): x = ⟨X⟩, y = ⟨Y⟩, z = ⟨Z⟩। इससे कोड में किसी भी state का Bloch vector निकालने का तरीका मिलता है।

### कोड: Bloch vectors

```python
import numpy as np
from qiskit.quantum_info import Statevector, SparsePauliOp

def bloch(state):
    """Return the Bloch vector (x, y, z) = (<X>, <Y>, <Z>) of a one-qubit state."""
    return [round(float(state.expectation_value(SparsePauliOp(p)).real), 3) for p in "XYZ"]

for label in ["0", "1", "+", "-", "r", "l"]:
    print(label, bloch(Statevector.from_label(label)))

theta, phi = np.pi / 3, np.pi / 2           # 60 degrees down from the north pole, facing +y
psi = Statevector([np.cos(theta / 2), np.exp(1j * phi) * np.sin(theta / 2)])
print("custom", bloch(psi), "P(0) =", round(float(psi.probabilities()[0]), 3))
```

```text
0 [0.0, 0.0, 1.0]
1 [0.0, 0.0, -1.0]
+ [1.0, 0.0, 0.0]
- [-1.0, 0.0, 0.0]
r [0.0, 1.0, 0.0]
l [0.0, -1.0, 0.0]
custom [0.0, 0.866, 0.5] P(0) = 0.75
```

Custom state का θ = 60° है: z = cos 60° = 0.5, और P(0) = (1 + 0.5)/2 = 0.75, सूत्र से मेल। इसका φ = 90° इसे +y तरफ़ रखता है, y = sin 60° = 0.866 के साथ।

[क्वांटम लैब](/hi/lab/) खोलें और प्रयोग 1 करें: वह यही गोला बनाता है और gates से बिंदु को घुमाने देता है।

## Superposition का असली मतलब

Qubit "superposition में" तब है जब उसके एक से ज़्यादा amplitudes non-zero हों। गोले पर: कोई भी बिंदु जो ठीक उत्तरी या दक्षिणी ध्रुव पर नहीं है।

लेकिन ऊपर की table क्या कहती है, देखें: **superposition सवाल पर निर्भर है।** |+⟩, |0⟩ और |1⟩ का 50/50 superposition है, लेकिन "+ या −?" सवाल का बिल्कुल पक्का जवाब है। ध्रुवों में कुछ ख़ास नहीं; वे बस वह अक्ष हैं जिस पर कंप्यूटर default में measure करता है। गोले का हर बिंदु किसी दूसरे अक्ष का उत्तरी ध्रुव है।

### Superposition का मतलब "हमें पता नहीं कौन-सा" नहीं

Superposition के बारे में सबसे आम ग़लती यह सोचना है कि |+⟩ = (|0⟩ + |1⟩)/√2 का मतलब है "qubit असल में 0 या 1 है, हमें बस पता नहीं, जैसे कप के नीचे सिक्का"। तुरंत measure करें तो दोनों 50/50 देते हैं। तो इन्हें कभी अलग कैसे पहचानें?

Measure करने से पहले Hadamard gate लगाइए।

- **Superposition** |+⟩: H|+⟩ = |0⟩ (पाठ 4)। **हर बार 0** मिलता है। |0⟩ और |1⟩ से आए amplitudes interfere करते हैं: नतीजे 0 के लिए जुड़ते हैं और नतीजे 1 के लिए कटते हैं।
- **सिक्के का उछाल**: आधी बार qubit |0⟩ है, और H उसे |+⟩ बनाता है, जो 50/50 देता है। आधी बार |1⟩ है, और H उसे |−⟩ बनाता है, वह भी 50/50। कुल: **50/50**। कोई interference नहीं, क्योंकि हर run में सिर्फ़ एक amplitude था।

```python
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler
sampler = StatevectorSampler(seed=11)

# 1. Superposition: H makes |+>. A second H, then measure.
sup = QuantumCircuit(1)
sup.h(0)
sup.h(0)
sup.measure_all()
print("superposition, then H:", sampler.run([sup], shots=1000).result()[0].data.meas.get_counts())

# 2. Coin toss: half the runs start as |0>, half as |1>. Then H, then measure.
start0 = QuantumCircuit(1)
start0.h(0)
start0.measure_all()
start1 = QuantumCircuit(1)
start1.x(0)
start1.h(0)
start1.measure_all()
r0, r1 = sampler.run([start0, start1], shots=500).result()
c0, c1 = r0.data.meas.get_counts(), r1.data.meas.get_counts()
print("coin toss, then H:    ", {k: c0.get(k, 0) + c1.get(k, 0) for k in "01"})
```

```text
superposition, then H: {'0': 1000}
coin toss, then H:     {'0': 530, '1': 470}
```

H से पहले एक जैसे 50/50 आँकड़े; उसके बाद बिल्कुल अलग नतीजे। यह सबसे साफ़ सबूत है कि superposition अपनी दिशा वाली एक असली, अकेली state है, कोई छिपा 0 या 1 नहीं जिसके बारे में हम अनजान हैं। यह पाठ 5 का double-slit प्रयोग छोटे रूप में है।

### और "घूमता सिक्का"?

घूमता सिक्का एक लोकप्रिय तस्वीर है, और एक बात सही पकड़ता है: qubit अभी heads या tails में तय नहीं हुआ। लेकिन ज़रूरी हिस्सा छूट जाता है। घूमते सिक्के का कोई **phase** नहीं होता, तो दो घूमते सिक्के एक-दूसरे को काट नहीं सकते। Qubits काट सकते हैं। एक बात याद रखें: superposition और **interference** मिलकर संसाधन हैं; अकेला superposition आपको random number generator से ज़्यादा कुछ नहीं देता।

## गेंद का अंदरूनी हिस्सा

हर **pure** state (जिसे एक vector α|0⟩ + β|1⟩ की तरह लिखा जा सके) गोले की **सतह** पर है, Bloch vector की लंबाई ठीक 1 के साथ।

लेकिन ऊपर का सिक्का उछाल कुछ और है: |0⟩ और |1⟩ का random मिश्रण। इसे **mixed state** कहते हैं, और यह गेंद के **अंदर** रहती है। |0⟩ और |1⟩ का 50/50 मिश्रण केंद्र बिंदु (0, 0, 0) है: किसी भी basis में measure करें तो 50/50, और कोई gate उससे interference नहीं बना सकता। |0⟩ और |1⟩ का 90/10 मिश्रण z-अक्ष पर z = 0.8 पर है।

यह क्यों ज़रूरी है? क्योंकि असली qubits अपने आसपास में जानकारी रिसाते हैं, और इससे pure states, mixed बन जाती हैं: समय के साथ Bloch vector केंद्र की ओर **सिकुड़ता** है। यही **decoherence** है, quantum computers का मुख्य दुश्मन, और पाठ 32 इसे नापता है। Mixed states को density matrix नाम के औज़ार से बताया जाता है, जिसे पाठ 16 पेश करता है।

## तस्वीर की सीमाएँ

Bloch sphere एक qubit के लिए बढ़िया है और दो या ज़्यादा पर विफल। एक pure two-qubit state को भी 6 real नंबर चाहिए (आम state को 15), जो दो गोलों में नहीं समाते, और entangled states (पाठ 14) का सतह पर **कोई** अलग Bloch vector होता ही नहीं: अकेले देखने पर हर qubit केंद्र वाली mixed state जैसा दिखता है। Single-qubit सोच के लिए गोला इस्तेमाल करें, और कई qubits के लिए algebra पर जाएँ।

## ख़ुद करके देखें

1. State cos(30°)|0⟩ + sin(30°)|1⟩ गोले पर कहाँ है? θ, φ और P(0) बताएँ।
2. एक state का Bloch vector (0, 0, −0.6) है। P(0) और P(1) क्या हैं?
3. गोले पर |+i⟩ के उल्टे कौन-सी state है? जाँचें कि दोनों orthogonal हैं।
4. क्या (|0⟩ + i|1⟩)/√2 और (i|0⟩ − |1⟩)/√2 एक ही भौतिक state हैं? (संकेत: global phase ढूँढें।)
5. कोड में सिक्का उछाल ऐसा बदलें कि 90% runs में qubit |0⟩ से शुरू हो। H के बाद क्या उम्मीद है?
6. एक वाक्य में बताएँ कि 0/1 basis में measure करना |+⟩ और |+i⟩ में फ़र्क़ क्यों नहीं कर सकता, लेकिन दूसरा measurement कर सकता है।

**जवाब:**

1. θ/2 = 30°, तो **θ = 60°**, φ = 0। P(0) = cos²30° = **0.75**। बिंदु +x तरफ़ उत्तरी ध्रुव से 60° नीचे है: (sin 60°, 0, cos 60°) = (0.866, 0, 0.5)।
2. P(0) = (1 − 0.6)/2 = **0.2**, P(1) = **0.8**।
3. **|−i⟩** = (|0⟩ − i|1⟩)/√2। ⟨+i|−i⟩ = ½(1·1 + (i)*·(−i)) = ½(1 + (−i)(−i)) = ½(1 − 1) = 0। ✓
4. **हाँ।** (i|0⟩ − |1⟩)/√2 = i·(|0⟩ + i|1⟩)/√2, क्योंकि i·i = −1। फ़र्क़ सिर्फ़ global phase i का है।
5. फिर भी लगभग **50/50**। |0⟩ → |+⟩ और |1⟩ → |−⟩ दोनों H के बाद 50/50 देते हैं, मिश्रण कैसा भी हो। (सिक्का उछाल कभी interfere नहीं करता।)
6. दोनों भूमध्य पर हैं (z = 0), तो 0/1 measurement दोनों के लिए 50/50 देता है; +/− basis में measure करने पर |+⟩ हर बार "+" देता है लेकिन |+i⟩ 50/50।

## सार

| विचार | सूत्र या तथ्य |
|---|---|
| कोई भी qubit state | \|ψ⟩ = cos(θ/2)\|0⟩ + e^(iφ) sin(θ/2)\|1⟩ |
| दो कोण क्यों | Normalisation और global phase चार में से दो real नंबर हटाते हैं |
| Bloch vector | (sin θ cos φ, sin θ sin φ, cos θ) = (⟨X⟩, ⟨Y⟩, ⟨Z⟩) |
| ध्रुव | \|0⟩ उत्तर, \|1⟩ दक्षिण |
| भूमध्य | x पर \|±⟩, y पर \|±i⟩: सब 50/50 superpositions |
| उल्टे बिंदु | Orthogonal states; हर व्यास एक basis |
| कोण का दोगुना होना | गोले पर कोण θ = state vectors के बीच कोण का दोगुना |
| 0/1 probabilities | P(0) = (1 + z)/2, P(1) = (1 − z)/2 |
| दूसरे bases | P(+) = (1 + x)/2, P(+i) = (1 + y)/2 |
| Superposition | एक से ज़्यादा basis states पर non-zero amplitude; basis पर निर्भर |
| Superposition बनाम सिक्का | H तक एक जैसे आँकड़े; सिर्फ़ superposition interfere करता है |
| Pure state | सतह पर, लंबाई 1 |
| Mixed state | गेंद के अंदर; केंद्र = पूरी तरह random |
| Decoherence | Bloch vector केंद्र की ओर सिकुड़ता है |
| सीमा | सिर्फ़ एक qubit; entangled qubits का सतह पर Bloch vector नहीं |
