---
layout: ../../../layouts/Post.astro
lang: hi
title: "No-cloning और quantum information क्या है"
description: "कोई भी मशीन अनजान quantum state की copy क्यों नहीं बना सकती (दो छोटे सबूत), CNOT 0 और 1 की copy क्यों बनाता है पर superpositions की नहीं, non-orthogonal states को अलग पहचानने की सीमा, मिश्रणों और बड़े systems के हिस्सों के लिए density matrices, और इन सबका security, error correction और qubit कितना ले जा सकता है, उस पर क्या मतलब है।"
date: 2026-11-04
category: lesson
lesson: 16

---

Classical computing में copy करना इतना बुनियादी है कि हम इसके बारे में सोचते ही नहीं। हर file जो आप खोलते हैं, disk से memory में copy होती है; हर संदेश server पर copy होता है; backups copies हैं। पाठ 1 ने बताया था कि classical bit की copy बनाना मामूली है: बस तार को बाँट दो।

Quantum information एक ऐसे तरीके से अलग है जो उस पर बनी हर चीज़ को आकार देता है। **किसी अनजान quantum state की copy नहीं बनाई जा सकती।** यह पाठ इसे साबित करता है, दिखाता है कि सीधा-सादा copier ठीक कहाँ विफल होता है, और फिर देखता है कि quantum information क्या है: किसी state के बारे में क्या जाना जा सकता है और क्या नहीं, states के बारे में अनिश्चितता कैसे बताएँ, और एक qubit असल में कितनी जानकारी ले जा सकता है।

## No-cloning प्रमेय

**दावा:** ऐसी कोई device नहीं है (कोई unitary U, कितने भी अतिरिक्त ख़ाली qubits के साथ) जो कोई भी अनजान state |ψ⟩ और एक ख़ाली qubit |0⟩ लेकर दो copies बना दे:

> हर |ψ⟩ के लिए U(|ψ⟩|0⟩) = |ψ⟩|ψ⟩  **असंभव** है।

इसे 1982 में Wootters और Zurek ने, और अलग से Dieks ने साबित किया। दो छोटे सबूत; कोई एक काफ़ी है।

### सबूत 1: linearity

मान लीजिए ऐसा U होता। उसे basis states की copy बनानी होती:

```text
U|0⟩|0⟩ = |0⟩|0⟩
U|1⟩|0⟩ = |1⟩|1⟩
```

अब उसे |+⟩ = (|0⟩ + |1⟩)/√2 दें। क्योंकि U एक matrix है, वह **linear** है: जोड़ के हर पद पर अलग से काम करता है।

```text
U|+⟩|0⟩ = (U|0⟩|0⟩ + U|1⟩|0⟩)/√2 = (|00⟩ + |11⟩)/√2
```

लेकिन सच्ची copy |+⟩|+⟩ = (|00⟩ + |01⟩ + |10⟩ + |11⟩)/2 होती। ये बराबर नहीं; असल में नतीजा एक entangled Bell state है, किसी की दो copies नहीं। **Linearity copier को superpositions पर विफल होने पर मजबूर करती है।**

### सबूत 2: inner products

मान लीजिए U दो states |ψ⟩ और |φ⟩ की copy बनाता है। Unitaries inner products नहीं बदलते (पाठ 4), तो पहले का inner product बाद वाले के बराबर होना चाहिए:

```text
पहले:  ⟨ψ|φ⟩ · ⟨0|0⟩ = ⟨ψ|φ⟩
बाद:   ⟨ψ|φ⟩ · ⟨ψ|φ⟩ = ⟨ψ|φ⟩²
```

तो ⟨ψ|φ⟩ = ⟨ψ|φ⟩²। जो नंबर अपने वर्ग के बराबर हो, वह 0 या 1 है। मतलब |ψ⟩ और |φ⟩ या तो **orthogonal** हों (inner product 0) या **एक ही state** (1)। Copier आपस में orthogonal states के set के लिए काम कर सकता है, जैसे |0⟩ और |1⟩, लेकिन दो आंशिक रूप से overlap करती states के लिए कभी नहीं, जैसे |0⟩ और |+⟩।

### कोड में देखना

CNOT स्वाभाविक "copier" है: यह original को एक ख़ाली qubit में XOR करता है। यह |0⟩ और |1⟩ पर पूरी तरह काम करता है, और superpositions पर विफल होता है, ठीक जैसा सबूत कहते हैं। सफलता **fidelity** |⟨चाहिए|मिला⟩|² से नापते हैं: पूरी copy के लिए 1, बिल्कुल ग़लत state के लिए 0।

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, state_fidelity

def cnot_copy(label):
    """Try to 'copy' a one-qubit state onto a blank qubit with a CNOT."""
    original = Statevector.from_label(label)
    qc = QuantumCircuit(2)
    qc.cx(0, 1)                                     # qubit 0 = original, qubit 1 = blank |0>
    out = Statevector.from_label("0").tensor(original).evolve(qc)
    two_copies = original.tensor(original)          # what a perfect copier would make
    return round(float(state_fidelity(out, two_copies)), 3)

for label in ["0", "1", "+", "-"]:
    print(f"copying |{label}> -> fidelity with two perfect copies: {cnot_copy(label)}")
```

```text
copying |0> -> fidelity with two perfect copies: 1.0
copying |1> -> fidelity with two perfect copies: 1.0
copying |+> -> fidelity with two perfect copies: 0.5
copying |-> -> fidelity with two perfect copies: 0.0
```

|−⟩ पर "copy" का |−⟩ की दो copies से overlap **शून्य** है। और बारीक बात देखें: |0⟩ और |1⟩ की copy बनाना quantum अर्थ में cloning नहीं है, यह **classical** जानकारी की copy है। प्रमेय उनके बीच के superpositions के बारे में है।

### No-cloning क्या मना नहीं करता

- **जानी हुई states की copy।** अगर पता है कि state |+⟩ है, तो एक और |+⟩ बना लीजिए। प्रमेय अनजान states के बारे में है।
- **अधूरी copies।** "Approximate cloning machines" होती हैं; सबसे अच्छी universal मशीन एक qubit की दो copies बनाती है, हर एक fidelity 5/6 के साथ।
- **State को हटाकर ले जाना।** Teleportation (पाठ 21) एक qubit की state दूसरे पर पहुँचाता है, लेकिन इस दौरान original नष्ट हो जाता है। कभी कोई copy नहीं बनती।

## No-cloning क्यों ज़रूरी है

| क्षेत्र | नतीजा |
|---|---|
| **रोशनी से तेज़ संदेश नहीं** | अगर Bob अपने Bell जोड़ी के आधे की copies बना पाता, तो कई copies measure करके बता सकता कि Alice ने किस basis में measure किया। No-cloning, no-signalling की रक्षा करता है (पाठ 14)। |
| **Quantum key distribution** | जासूस रास्ते में qubits की copy बनाकर बाद में measure नहीं कर सकती। उसे originals measure करने पड़ते हैं और निशान छूटते हैं (पाठ 41)। |
| **Error correction** | Backup copies रखकर qubit की रक्षा नहीं हो सकती। Quantum codes entanglement से जानकारी को कई qubits पर **बिना copy किए** फैलाते हैं (पाठ 33–35)। |
| **Quantum money** | अनजान quantum states वाले नोटों की नक़ल नहीं हो सकती (Stephen Wiesner का लगभग 1970 का विचार, जिसने बाद में QKD को प्रेरित किया)। |
| **Programming** | Qubit का कोई quantum "copy-paste" या "fan-out" नहीं। जो algorithms किसी quantum value को दोबारा इस्तेमाल करें, उन्हें उसे फिर से गिनना पड़ता है। |

## State को पूरा पढ़ा भी नहीं जा सकता

No-cloning का एक जुड़वाँ है: **दो states जो orthogonal नहीं हैं, उन्हें पूरी तरह अलग नहीं पहचाना जा सकता।** अगर पहचान पाते, तो state पहचानकर जितनी चाहें copies बना लेते, जिससे no-cloning टूट जाता।

कितना अच्छा **हो सकता है**? मान लीजिए कोई आपको |0⟩ या |+⟩ देता है, हर एक ½ probability से, और पूछता है कौन-सी। उनका overlap |⟨0|+⟩| = 1/√2 है। सबसे अच्छी संभव सफलता दर, जो Carl Helstrom ने 1976 में निकाली:

> P(सही) = ½ (1 + √(1 − |⟨ψ|φ⟩|²))

|0⟩ और |+⟩ के लिए यह ½(1 + √½) ≈ **85.4%** है। सबसे अच्छा measurement Bloch sphere पर दोनों states के "बीच" की दिशा में है (हर एक से दूर इशारा करता, x–z समतल में −45° और 135° पर)। जाँचें:

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

# Someone gives us |0> or |+> (50/50). We measure along -45 degrees and guess.
def chance_correct(label):
    qc = QuantumCircuit(1)
    qc.ry(np.pi / 4, 0)                             # rotate so that -45 degrees becomes the z axis
    p0 = Statevector.from_label(label).evolve(qc).probabilities()[0]
    return p0 if label == "0" else 1 - p0           # outcome 0 -> guess |0>, outcome 1 -> guess |+>

best = (chance_correct("0") + chance_correct("+")) / 2
overlap = abs(Statevector.from_label("0").inner(Statevector.from_label("+")))
helstrom = 0.5 * (1 + np.sqrt(1 - overlap ** 2))
print("our measurement:", round(float(best), 4), "  Helstrom limit:", round(float(helstrom), 4))
```

```text
our measurement: 0.8536   Helstrom limit: 0.8536
```

हमारा measurement ठीक सीमा तक पहुँचता है। (0.8536 = cos²(π/8) फिर से, पाठ 15 के CHSH game वाला ही नंबर। यह संयोग नहीं; दोनों गोले पर 90° अलग दो दिशाओं के "बीच" measure करने के बारे में हैं।) BB84 protocol (पाठ 41) इसी सीमा पर बना है: वह bits को non-orthogonal states में इसीलिए भरता है ताकि जासूस उन्हें भरोसे से **न** पढ़ सके।

## अनिश्चितता बताना: density matrix

अब तक हर state एक vector |ψ⟩ थी: **pure state**। लेकिन आप ऐसी स्थितियाँ देख चुके हैं जिन्हें vector नहीं बता सकता:

- |0⟩ और |1⟩ के बीच सिक्का उछाल (पाठ 7), जो superposition |+⟩ जैसा नहीं है;
- Bell जोड़ी का आधा हिस्सा (पाठ 14), जो अकेले में पूरी तरह random है।

ये **mixed states** हैं, और इनका औज़ार **density matrix** ρ (rho) है। Pure state के लिए यह outer product है:

> ρ = |ψ⟩⟨ψ|

किसी मिश्रण के लिए, "state |ψᵢ⟩, probability pᵢ से", यह भारित औसत है:

> ρ = Σ pᵢ |ψᵢ⟩⟨ψᵢ|

Superposition |+⟩ की 50/50 सिक्के से तुलना करें:

```text
|+⟩⟨+| = ½ [ 1  1 ]        ½|0⟩⟨0| + ½|1⟩⟨1| = ½ [ 1  0 ]
           [ 1  1 ]                              [ 0  1 ]
```

**Diagonal** entries 0 और 1 की probabilities हैं: दोनों में ½ और ½। इसीलिए 0/1 measurement इन्हें अलग नहीं कर सकता। **Off-diagonal** entries, जिन्हें **coherences** कहते हैं, |0⟩ और |1⟩ के बीच का phase रिश्ता रखती हैं। Superposition में ये हैं; सिक्के में नहीं। Dephasing (पाठ 10) ठीक वही प्रक्रिया है जो off-diagonal entries को खा जाती है।

एक नंबर pure को mixed से अलग बताता है: **purity** Tr(ρ²), ρ² के diagonal का जोड़। Pure state के लिए 1 और मिश्रण के लिए कम (qubit के लिए न्यूनतम ½)।

```python
import numpy as np
from qiskit.quantum_info import DensityMatrix, Statevector

plus = DensityMatrix(Statevector.from_label("+"))                  # pure superposition
coin = 0.5 * DensityMatrix.from_label("0") + 0.5 * DensityMatrix.from_label("1")   # 50/50 mixture

for name, rho in [("|+> superposition", plus), ("50/50 coin", coin)]:
    print(name)
    print(np.round(rho.data.real, 3))
    print("purity Tr(rho^2) =", round(float(rho.purity().real), 3))

mix = 0.9 * DensityMatrix.from_label("0") + 0.1 * DensityMatrix.from_label("1")
bloch = [round(float(np.trace(mix.data @ P).real), 3) for P in
         (np.array([[0, 1], [1, 0]]), np.array([[0, -1j], [1j, 0]]), np.array([[1, 0], [0, -1]]))]
print("90/10 mixture Bloch vector:", bloch)
```

```text
|+> superposition
[[0.5 0.5]
 [0.5 0.5]]
purity Tr(rho^2) = 1.0
50/50 coin
[[0.5 0. ]
 [0.  0.5]]
purity Tr(rho^2) = 0.5
90/10 mixture Bloch vector: [0.0, 0.0, 0.8]
```

आख़िरी लाइन पाठ 7 से जुड़ती है: density matrix का Bloch vector (Tr(ρX), Tr(ρY), Tr(ρZ)) है, और 90/10 मिश्रण के लिए यह गोले के **अंदर** z = 0.8 पर है। आपके जाने सारे नियम लागू रहते हैं: probabilities P(k) = ⟨k|ρ|k⟩, expectation values ⟨A⟩ = Tr(ρA), और gate U, ρ को UρU† बना देता है।

असली प्रयोग और noisy simulators qubits को density matrices से ही बताते हैं, क्योंकि असली qubits हमेशा थोड़े mixed होते हैं। पाठ 32 और 36 इन्हें हर जगह इस्तेमाल करते हैं।

## एक qubit में कितनी जानकारी होती है?

दो जवाब, दोनों सही, अलग चीज़ें नापते हैं।

**बताने के लिए: अनंत।** Qubit की state में दो continuous कोण θ और φ हैं। इन्हें सटीक लिखने में अनंत अंक लगते हैं।

**पढ़ने के लिए: ज़्यादा से ज़्यादा एक bit।** Holevo bound (पाठ 12) कहता है कि qubit उसे measure करने वाले को ज़्यादा से ज़्यादा एक classical bit दे सकता है। Continuous कोण असली हैं, लेकिन कोई measurement उन्हें एक copy से नहीं निकाल सकता (इस पाठ का पढ़ न पाने वाला नतीजा, फिर से)।

ज़्यादा निकालने का एक मशहूर तरीका है: **superdense coding**। अगर Alice और Bob पहले से एक Bell जोड़ी साझा करते हैं, तो Alice Bob को सिर्फ़ एक qubit भेजकर **दो** classical bits भेज सकती है (पाठ 21)। साझा entanglement फ़र्क़ पूरा करता है; उसे गिनने पर Holevo bound फिर भी सही रहता है।

तो quantum information की बुनियादी इकाइयाँ:

| इकाई | क्या है | विनिमय दर |
|---|---|---|
| **bit** | एक classical 0/1 | |
| **qubit** | एक दो-स्तर वाला quantum system | ≤ 1 पढ़ा जा सकने वाला bit |
| **ebit** | एक साझा Bell जोड़ी | 1 ebit + 2 bits भेजे → 1 qubit teleport; 1 ebit + 1 qubit भेजा → 2 bits पहुँचे |

Quantum information theory काफ़ी हद तक इसी का अध्ययन है कि ये तीन संसाधन एक-दूसरे से कैसे बदले जाते हैं, और भाग H इन्हीं से quantum networks बनाता है।

## ख़ुद करके देखें

1. Inner-product वाले सबूत से समझाएँ कि |0⟩ और |+⟩ दोनों की copy बनाने वाली मशीन क्यों नहीं हो सकती।
2. CNOT "copier", |1⟩|0⟩ से क्या बनाता है? (|0⟩ + i|1⟩)/√2 ⊗ |0⟩ से?
3. Helstrom सूत्र से, |0⟩ और |1⟩ को अलग पहचानने की सबसे अच्छी दर क्या है? |+⟩ और |+i⟩ की?
4. ऐसे मिश्रण की density matrix लिखें जो ¾ probability से |0⟩ और ¼ से |1⟩ हो। उसकी purity क्या है?
5. |−⟩ की density matrix लिखें। यह 50/50 सिक्के से कैसे अलग है?
6. एक दोस्त दावा करता है कि उसके पास हर qubit की copy बनाने वाली device है, और कहता है कि इससे वह जाँच लेगा कि दूर का साथी साझा Bell जोड़ी किस basis में measure कर रहा है। वह device कौन-से दो सिद्धांत तोड़ेगी?

**जवाब:**

1. दोनों की copy के लिए ⟨0|+⟩ = ⟨0|+⟩² चाहिए, यानी 1/√2 = ½। ग़लत, तो ऐसा कोई unitary नहीं।
2. |1⟩|1⟩ (पूरी copy: यह basis state है)। (|00⟩ + i|11⟩)/√2: एक entangled state, दो copies नहीं।
3. |0⟩ बनाम |1⟩: overlap 0, तो **100%**। |+⟩ बनाम |+i⟩: |⟨+|+i⟩| = |1 + i|/2 = 1/√2, तो **≈ 85.4%**।
4. [[¾, 0], [0, ¼]]। Purity = (¾)² + (¼)² = **0.625**।
5. ½[[1, −1], [−1, 1]]। सिक्के जैसा diagonal, लेकिन off-diagonal −½ (coherence) के साथ; purity ½ की जगह 1।
6. **No-cloning** (device ख़ुद) और **no-signalling** (इसका इस्तेमाल रोशनी से तेज़ जानकारी भेजता)।

## सार

| विचार | सूत्र या तथ्य |
|---|---|
| No-cloning | कोई unitary हर \|ψ⟩ के लिए \|ψ⟩\|0⟩ → \|ψ⟩\|ψ⟩ नहीं करता |
| Linearity से सबूत | \|0⟩ और \|1⟩ की copy, \|+⟩ को Bell state बना देती है |
| Inner products से सबूत | ⟨ψ\|φ⟩ = ⟨ψ\|φ⟩²: सिर्फ़ orthogonal या एक जैसी states copy होती हैं |
| Basis states पर CNOT | सिर्फ़ classical जानकारी की copy |
| इजाज़त है | जानी हुई states बनाना, approximate cloning (fidelity 5/6), teleporting |
| नतीजे | No-signalling, QKD सुरक्षा, error correction में backup copies नहीं |
| States पहचानना | सबसे अच्छी सफलता ½(1 + √(1 − \|⟨ψ\|φ⟩\|²)) (Helstrom) |
| Fidelity | \|⟨चाहिए\|मिला⟩\|²: 1 = पूरा |
| Density matrix | ρ = \|ψ⟩⟨ψ\| (pure) या Σ pᵢ\|ψᵢ⟩⟨ψᵢ\| (mixed) |
| ρ का diagonal | 0 और 1 की probabilities |
| ρ का off-diagonal | Coherences: phase का रिश्ता |
| Purity | Tr(ρ²): 1 pure, ½ पूरा mixed (qubit) |
| ρ के साथ नियम | P(k) = ⟨k\|ρ\|k⟩, ⟨A⟩ = Tr(ρA), gate: ρ → UρU† |
| Qubit की क्षमता | ≤ 1 पढ़ा जा सकने वाला bit (Holevo); साझा ebit के साथ 2 (superdense coding) |
| कोड में | `state_fidelity`, `DensityMatrix`, `.purity()` |
