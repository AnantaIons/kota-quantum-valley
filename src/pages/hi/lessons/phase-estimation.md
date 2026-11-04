---
layout: ../../../layouts/Post.astro
lang: hi
title: "Quantum phase estimation"
description: "किसी unitary के eigenvalue का छिपा phase bits में पढ़ना: circuit, पूरा derivation, सटीक और असटीक phases, ज़्यादा qubits से सटीकता और सफलता की संभावना कैसे बढ़ती है, एक छोटे Hamiltonian की ground-state energy का अनुमान, एक-qubit वाला iterative रूप, और Shor algorithm और quantum chemistry दोनों phase estimation क्यों हैं।"
date: 2026-11-04
category: lesson
lesson: 27

---

पाठ 4 ने दिखाया था कि किसी unitary का हर eigenvalue एक phase है: किसी नंबर φ (0 से 1 के बीच) के लिए U|u⟩ = e^(2πiφ)|u⟩। वह phase अक्सर ठीक वही जवाब रखता है जो आप चाहते हैं: Shor algorithm में period, किसी molecule की energy, atomic clock की frequency। लेकिन |u⟩ पर global phase अदृश्य है (पाठ 10)। इसे पढ़ा कैसे जा सकता है?

**Quantum phase estimation (QPE)**, जिसे 1995 में Alexei Kitaev ने पेश किया, ठीक यही करता है। यह दो औज़ार मिलाता है जो आपके पास पहले से हैं: **phase kickback** (पाठ 13), जो phase को control qubits पर ले जाता है जहाँ वह relative phase बन जाता है, और **inverse QFT** (पाठ 26), जो उन phases को binary अंकों में बदलता है। यह quantum computing का सबसे ज़रूरी subroutine है।

## समस्या

आपको दिया गया है:

- एक unitary U जिसे आप, controlled रूप में, कई बार लगा सकते हैं, और
- U की एक eigenstate |u⟩ (या उसके पास की state),

जहाँ U|u⟩ = e^(2πiφ)|u⟩। **φ को t binary अंकों तक निकालो।**

## Circuit

QPE में दो registers हैं: t **counting qubits**, जिनमें जवाब आएगा, और **target register**, जिसमें |u⟩ है।

1. **Superpose:** हर counting qubit पर H।
2. **Controlled powers:** counting qubit k, U को 2ᵏ बार लगाने को control करता है (U, U², U⁴, U⁸, …)।
3. Counting register पर **inverse QFT**।
4. Counting register **measure** करें। t-bit नतीजा m से φ ≈ m/2ᵗ।

### यह काम क्यों करता है

**क़दम 2, एक-एक qubit।** Counting qubit k लें, |+⟩ में, जो eigenstate |u⟩ पर U^(2ᵏ) को control करता है। क्योंकि U^(2ᵏ)|u⟩ = e^(2πi·2ᵏφ)|u⟩, phase kickback वह phase control की |1⟩ शाखा पर डाल देता है:

> (|0⟩ + |1⟩)/√2 → (|0⟩ + e^(2πi·2ᵏφ)|1⟩)/√2

Target ठीक |u⟩ ही रहता है, तो entangle नहीं होता और अब से नज़रअंदाज़ किया जा सकता है।

**सारे counting qubits एक साथ:**

> (1/√2ᵗ) (|0⟩ + e^(2πi·2^(t−1)φ)|1⟩) ⊗ … ⊗ (|0⟩ + e^(2πi·2φ)|1⟩) ⊗ (|0⟩ + e^(2πi·φ)|1⟩)

अब पाठ 26 के QFT|j⟩ वाले product सूत्र से मिलाएँ। अगर किसी पूर्णांक m के लिए φ = m/2ᵗ ठीक हो, तो यह **ठीक QFT|m⟩** है: φ को दोगुना करना उसके binary अंक खिसकाता है, और phases से पूर्णांक हिस्से हट जाते हैं। (गुणनफल खोलने पर (1/√2ᵗ) Σₖ e^(2πiφk)|k⟩ मिलता है, j = m वाला QFT सूत्र।)

**क़दम 3।** तो inverse QFT इसे |m⟩ बना देता है, और **measure करने पर m पक्का मिलता है।** Phase एक नंबर बन गया।

Phase gate P(2πφ) से जाँचें, जिसकी eigenstate |1⟩ है। φ = 1/8 के लिए जवाब 001 पढ़ना चाहिए, और φ = 5/8 के लिए 101 (पाँच-आठवाँ)।

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.circuit.library import QFTGate
from qiskit.quantum_info import Statevector

def qpe_probabilities(phi, t):
    """Phase estimation of U = P(2*pi*phi) on its eigenstate |1>, with t counting qubits."""
    qc = QuantumCircuit(t + 1)
    qc.x(t)                                        # eigenstate |1> on the last qubit
    qc.h(range(t))
    for k in range(t):
        qc.cp(2 * np.pi * phi * 2 ** k, k, t)      # controlled U^(2^k): phase kickback of 2^k * phi
    qc.append(QFTGate(t).inverse(), range(t))
    return Statevector(qc).probabilities(range(t)) # distribution of the counting register

for phi in [1 / 8, 5 / 8]:
    p = qpe_probabilities(phi, 3)
    print(f"phi = {phi}: most likely reading {np.argmax(p):03b} with probability {p.max():.3f}")

phi = 1 / 3                                        # not an exact binary fraction
for t in [3, 5, 8]:
    p = qpe_probabilities(phi, t)
    best = int(np.argmax(p))
    near = sum(p[(best + d) % 2 ** t] for d in (-1, 0, 1))
    print(f"t = {t}: best estimate {best}/{2 ** t} = {best / 2 ** t:.4f}, P(best) = {p[best]:.3f}, P(within one step) = {near:.3f}")
```

```text
phi = 0.125: most likely reading 001 with probability 1.000
phi = 0.625: most likely reading 101 with probability 1.000
t = 3: best estimate 3/8 = 0.3750, P(best) = 0.688, P(within one step) = 0.910
t = 5: best estimate 11/32 = 0.3438, P(best) = 0.684, P(within one step) = 0.898
t = 8: best estimate 85/256 = 0.3320, P(best) = 0.684, P(within one step) = 0.898
```

पहली दो लाइनें सटीक हैं, हर बार। (याद रखें T = P(π/4) = P(2π·⅛), तो पहली लाइन "T gate का phase estimation" है।)

## जब φ सटीक fraction न हो

Output का दूसरा हिस्सा पूछता है कि φ = 1/3 के साथ क्या होता है, जिसका कोई सीमित binary रूप नहीं (0.010101…)। तब counting register किसी भी m के लिए ठीक QFT|m⟩ नहीं है, और inverse QFT probability को कई नतीजों पर फैला देता है, असली value के आसपास इकट्ठी।

गारंटियाँ (Cleve, Ekert, Macchiavello और Mosca, 1998 से):

- अकेली **सबसे पास की** t-bit fraction कम से कम **4/π² ≈ 40.5%** probability से आती है (यहाँ लगभग 68%)।
- φ को **n bits** तक कम से कम 1 − ε सफलता के साथ पाने के लिए **t = n + ⌈log₂(2 + 1/(2ε))⌉** counting qubits लें। ज़रूरी सटीकता से कुछ अतिरिक्त qubits विफलता को बहुत असंभावित बना देते हैं।

Table में ज़्यादा counting qubits तीखा अनुमान देते हैं: 0.375, फिर 0.344, फिर 0.332, 0.3333 की ओर बढ़ते हुए। हर अतिरिक्त qubit resolution **दोगुना** करता है, और सच के एक क़दम के अंदर पहुँचने की probability लगभग 90% रहती है।

### असली लागत: controlled powers

Output सस्ता दिखता है: t bits के लिए t qubits। लागत क़दम 2 में छिपी है: counting qubit k को U **2ᵏ बार** चाहिए। t bits सटीकता के लिए यह 1 + 2 + 4 + … + 2^(t−1) ≈ U के **2ᵗ इस्तेमाल** हैं। तो सटीकता ε की लागत U के लगभग 1/ε इस्तेमाल है।

यह **Heisenberg limit** है, और सबसे अच्छा संभव है: पाठ 5 की तरह बार-बार sampling से phase नापने में 1/ε² लगता। 1/ε बनाम 1/ε² का यही फ़र्क़ amplitude estimation (पाठ 25) में आया था और quantum sensing (पाठ 44) में आएगा। ये सब असल में phase estimation हैं।

Shor algorithm के लिए यह ठीक है, क्योंकि U^(2ᵏ) बार-बार वर्ग करके सीधे निकाला जा सकता है, U को 2ᵏ बार लगाए बिना (पाठ 28)। आम U के लिए, जैसे किसी molecule का time evolution, यही सबसे बड़ी लागत है।

## Energy का अनुमान

यह QPE असली विज्ञान के ज़्यादा पास कुछ कर रहा है। किसी molecule के energy levels उसके **Hamiltonian** H के eigenvalues हैं (पाठ 29)। Time-evolution operator U = e^(−iHt) की वही eigenstates हैं, eigenvalues e^(−iEt) के साथ। तो U पर phase estimation एक **energy** पढ़ता है।

नीचे H एक छोटा two-qubit Hamiltonian है, ZZ + 0.5·XI + 0.5·IX (Pauli strings के जोड़ की तरह लिखा, पाठ 19)। हम इसकी सबसे कम energy वाली state (**ground state**) भरते हैं और 7 counting qubits से उसकी energy का अनुमान लगाते हैं। उदाहरण छोटा रखने के लिए U की controlled powers सटीक matrices से बनाते हैं; असली मशीन पर ये gates से बनतीं (पाठ 29)।

```python
import numpy as np
from scipy.linalg import expm
from qiskit import QuantumCircuit
from qiskit.circuit.library import QFTGate, UnitaryGate
from qiskit.quantum_info import SparsePauliOp, Statevector

# A small "molecule": a two-qubit Hamiltonian. We want its lowest energy.
H = SparsePauliOp(["ZZ", "XI", "IX"], [1.0, 0.5, 0.5]).to_matrix()
energies, vectors = np.linalg.eigh(H)
ground_energy, ground_state = energies[0], vectors[:, 0]

t_time = 0.5                                       # U = exp(-i H t), so U|E> = e^(-i E t)|E>
U = expm(-1j * H * t_time)

t = 7                                              # counting qubits
qc = QuantumCircuit(t + 2)
qc.initialize(ground_state, [t, t + 1])            # load the eigenstate (in practice: approximately)
qc.h(range(t))
for k in range(t):
    power = UnitaryGate(np.linalg.matrix_power(U, 2 ** k)).control(1)
    qc.append(power, [k, t, t + 1])
qc.append(QFTGate(t).inverse(), range(t))

p = Statevector(qc).probabilities(range(t))
m = int(np.argmax(p))
phi = m / 2 ** t                                   # e^(2 pi i phi) = e^(-i E t)
E = -2 * np.pi * phi / t_time
if E < -np.pi / t_time:                            # phases wrap around: map back to the right range
    E += 2 * np.pi / t_time
print(f"exact ground energy : {ground_energy:.4f}")
print(f"phase estimation    : {E:.4f}   (reading {m:07b}, probability {p[m]:.3f})")
print(f"resolution of 7 bits: ±{np.pi / t_time / 2 ** t:.4f}")
```

```text
exact ground energy : -1.4142
phase estimation    : -1.3744   (reading 0001110, probability 0.564)
resolution of 7 bits: ±0.0491
```

अनुमान −1.374, असली −√2 ≈ −1.414 के 7-bit resolution के अंदर है। ज़्यादा counting qubits इसे तीखा करते। दो व्यावहारिक बातें:

- **Phases घूमकर लौटते हैं।** e^(2πiφ) सिर्फ़ φ modulo 1 बताता है, तो energies सिर्फ़ modulo 2π/t पता चलती हैं। Evolution time t इतना छोटा चुनें कि सारी ज़रूरी energies उस खिड़की में आ जाएँ। (`if` वाली लाइन यही संभालती है।)
- **(लगभग) eigenstate चाहिए।** यहाँ हमने सटीक ground state भरी, जो सिर्फ़ इसलिए संभव था क्योंकि उदाहरण बहुत छोटा है। असली chemistry में आप एक **अनुमानित** ground state बनाते हैं (किसी classical तरीके से, या पाठ 30 के VQE से)। तब QPE असली ground energy, probability |⟨अनुमानित|ground⟩|² से लौटाता है, और बाक़ी समय कोई दूसरा energy level। अच्छे overlap वाली states बनाना quantum chemistry algorithms की मुख्य खुली समस्याओं में से है (पाठ 45)।

## Iterative phase estimation: एक counting qubit

पूरे QPE को t counting qubits और एक QFT चाहिए। आज के हार्डवेयर पर qubits और depth क़ीमती हैं, इसलिए एक **single-qubit रूप** है (Kitaev का मूल विचार, 2007 में Dobšíček और साथियों ने निखारा):

1. **एक** counting qubit से φ का **आख़िरी** bit पहले नापें, U^(2^(t−1)) से।
2. उसे reset करें, और अगला bit U^(2^(t−2)) से नापें, साथ में अब तक मिले bits के आधार पर phase सुधार।
3. दोहराएँ, सबसे कम महत्व वाले bit से सबसे ज़्यादा तक।

यह U के उतने ही कुल इस्तेमालों से वही जवाब देता है, लेकिन सिर्फ़ एक अतिरिक्त qubit और **बीच में measurement और feed-forward** (पाठ 19 के dynamic circuits) चाहिए। Inverse QFT की जगह measurements के बीच classical logic आ जाता है।

## Phase estimation कहाँ इस्तेमाल होता है

| Algorithm | U क्या है | φ क्या देता है |
|---|---|---|
| **Shor algorithm** (पाठ 28) | a से mod N गुणा | s/r, जिससे period r निकलता है |
| **Quantum chemistry** (पाठ 45) | e^(−iHt), molecule का time evolution | उसके energy levels |
| **Amplitude estimation** (पाठ 25) | Grover operator Q | θ, यानी एक probability |
| **Linear equations हल करना (HHL)** | Matrix A के लिए e^(iAt) | A के eigenvalues, जिनसे A उलटा जाता है |
| **Quantum sensing** (पाठ 44) | Field में मुक्त evolution | Field की ताक़त (Ramsey = 1-bit QPE) |

## ख़ुद करके देखें

1. U = S = P(2π·¼)। 2 counting qubits और eigenstate |1⟩ के साथ QPE क्या देता है?
2. t = 4 counting qubits के साथ φ का resolution क्या है? U के कुल कितने इस्तेमाल?
3. Target register |u⟩ में ही क्यों रहता है और counting qubits से कभी entangle क्यों नहीं होता?
4. φ = 0.3। t = 3 के साथ कौन-सी reading सबसे संभावित है? (पास की fractions m/8 लिखें।)
5. Energy उदाहरण में अगर भरी गई state का ground state से सिर्फ़ 70% overlap होता, तो क्या होता?
6. बार-बार Ramsey measurements से phase का अनुमान लगाने के मुक़ाबले QPE की 1/ε लागत बेहतर क्यों है?

**जवाब:**

1. Binary में φ = 0.01, तो counting register पक्का **01** पढ़ता है।
2. 1/16 = **0.0625**। U के इस्तेमाल: 1 + 2 + 4 + 8 = **15**।
3. |u⟩ eigenstate है: हर controlled power उसे बस एक phase से गुणा करती है, जो control पर वापस किक होता है। हर शाखा में target एक जैसा है।
4. 0.3 × 8 = 2.4। सबसे पास की fraction 2/8 = 0.25 है, तो **010** सबसे संभावित, फिर 011 (0.375)।
5. 70% बार QPE ground energy लौटाता; 30% बार state के दूसरे हिस्सों से कोई और eigenvalue।
6. बार-बार measurement से सटीकता सिर्फ़ 1/√N की तरह बढ़ती है (shot noise), तो ε के लिए ~1/ε² runs; QPE की दोगुनी होती U powers से ~1/ε।

## सार

| विचार | सूत्र या तथ्य |
|---|---|
| समस्या | U\|u⟩ = e^(2πiφ)\|u⟩; φ ढूँढो |
| क़दम | Counters पर H → controlled U^(2ᵏ) → inverse QFT → measure |
| Kickback के बाद | ⊗ₖ (\|0⟩ + e^(2πi·2ᵏφ)\|1⟩)/√2 |
| सटीक स्थिति | φ = m/2ᵗ → state QFT\|m⟩ है → m पक्का पढ़ें |
| असटीक स्थिति | सबसे पास की t-bit value probability ≥ 4/π² ≈ 0.405 से |
| सटीकता | n bits, सफलता 1 − ε: t = n + ⌈log₂(2 + 1/(2ε))⌉ |
| लागत | U के ~2ᵗ इस्तेमाल, यानी ~1/ε: Heisenberg limit |
| Energy का अनुमान | U = e^(−iHt): φ से energy E (modulo 2π/t) |
| चाहिए | Eigenstate, या अच्छे overlap वाली state |
| Iterative QPE | एक counting qubit, feed-forward के साथ एक-एक bit |
| इस्तेमाल | Shor, chemistry, amplitude estimation, HHL, sensing |
