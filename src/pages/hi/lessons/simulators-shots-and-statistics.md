---
layout: ../../../layouts/Post.astro
lang: hi
title: "Simulators, shots और statistics"
description: "Quantum simulators के प्रकार और उनकी सीमाएँ, laptop पर 60-qubit simulation, ईमानदार error bars के साथ shots से नतीजों का अनुमान, कितने shots चाहिए, दो नतीजा-histograms की तुलना, और असली noise simulate करके पहले से बताना कि असली हार्डवेयर क्या देगा।"
date: 2026-11-04
category: lesson
lesson: 20

---

लगभग हर quantum program असली हार्डवेयर के पास जाने से पहले एक **simulator** पर लिखा और जाँचा जाता है। Simulators मुफ़्त, तेज़, noise-रहित (जब तक आप noise न माँगें) होते हैं और state के अंदर देखने देते हैं, जो कोई असली device नहीं कर सकती। लेकिन उनकी पक्की सीमाएँ हैं, और असली प्रयोगों के नतीजों में random बिखराव होता है जिसे ईमानदारी से संभालना पड़ता है।

यह पाठ दोनों पक्ष देखता है: हर तरह का simulator क्या कर सकता है और क्या नहीं, और shot गिनतियों के ढेर को भरोसे लायक error bar वाले नंबर में कैसे बदलें। अंत में यह असली जैसा noise simulate करता है, ताकि असली chip पर समय लगाने से पहले आप अनुमान लगा सकें कि वह क्या दिखाएगा।

## Quantum computers को simulate करना कठिन क्यों है

पाठ 1 ने बुनियादी समस्या बताई थी: n-qubit state में 2ⁿ complex amplitudes होते हैं, हर एक आमतौर पर 16 bytes। हर अतिरिक्त qubit memory दोगुनी करता है। 16 GB वाला laptop लगभग 30 qubits पर ख़त्म हो जाता है; दुनिया के सबसे बड़े supercomputers पूरे state vector के लिए 40 के आसपास कहीं ख़त्म हो जाते हैं।

लेकिन "2ⁿ" सबसे बुरी हालत है। कई circuits में **ढाँचा** होता है जिसका चतुर simulator फ़ायदा उठा सकता है, इसलिए कई तरह के simulators हैं, हर एक अलग चीज़ों में अच्छा।

| Simulator | क्या रखता है | किसके लिए अच्छा | व्यावहारिक सीमा |
|---|---|---|---|
| **Statevector** | सभी 2ⁿ amplitudes सटीक | कोई भी circuit, सटीक probabilities | Laptop पर ~30 qubits |
| **Density matrix** | 2ⁿ × 2ⁿ matrix (पाठ 16) | Noisy circuits, सटीक | ~15 qubits (4ⁿ नंबर) |
| **Stabilizer** | ~n² bits (पाठ 17) | सिर्फ़-Clifford circuits | हज़ारों qubits |
| **Matrix product state (MPS)** | छोटे tensors की श्रृंखला | सीमित entanglement वाले circuits | सैकड़ों qubits, अगर entanglement कम रहे |
| **Sampling (shots)** | ऊपर में से कोई, फिर random नतीजे निकालता है | असली हार्डवेयर का output नक़ल करना | नीचे वाले तरीके जितनी |

Qiskit में `quantum_info` के औज़ार (`Statevector`, `DensityMatrix`, `StabilizerState`) सटीक states देते हैं, और primitives (`StatevectorSampler`, `StatevectorEstimator`) हार्डवेयर जैसे outputs। ज़्यादा रफ़्तार और ज़्यादा तरीक़ों के लिए **Qiskit Aer** (`pip install qiskit-aer`) IBM का तेज़ simulator है, जिसमें table के सभी तरीके हैं।

### Laptop पर 60-qubit circuit

60-qubit state vector को 2⁶⁰ × 16 bytes ≈ 1.8 करोड़ gigabytes चाहिए। लेकिन GHZ state बहुत सीधी है: उसका entanglement, पाठ 14 की entropy से नापें तो, श्रृंखला के किसी भी कट पर 1 bit से ज़्यादा नहीं होता। MPS simulator इसे बहुत थोड़ी memory में रख लेता है।

```python
from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator

n = 60                                           # 2^60 amplitudes would need ~18 million GB
ghz = QuantumCircuit(n)
ghz.h(0)
for q in range(n - 1):
    ghz.cx(q, q + 1)
ghz.measure_all()

mps = AerSimulator(method="matrix_product_state", seed_simulator=2)
counts = mps.run(transpile(ghz, mps), shots=1000).result().get_counts()
for bits, c in counts.items():
    print(bits[:10] + "..." + bits[-10:], c)
```

```text
0000000000...0000000000 485
1111111111...1111111111 515
```

यह एक सेकंड से कम में चला। शर्त: जब कोई circuit बहुत entanglement बनाता है, जैसा दिलचस्प algorithms करते हैं, तो MPS memory भी exponentially बढ़ती है। हर simulator के लिए कोई न कोई तरह का circuit कठिन है, और जो circuits **सभी** को हरा दें, ठीक वही हैं जहाँ quantum computers उपयोगी हो सकते हैं। "Quantum advantage" प्रयोगों का आधार यही है (पाठ 31)।

## Shots: गिनतियों को नंबरों में बदलना

असली quantum computer (या Sampler) सीमित shots की गिनतियाँ देता है। पाठ 5 ने बिखराव समझाया था। अब इसे ठीक से इस्तेमाल करना।

मान लीजिए आपको एक qubit का ⟨Z⟩ चाहिए। गिनतियों से ⟨Z⟩ ≈ P(0) − P(1) = 2·P(0) − 1, जहाँ P(0) का अनुमान (0s की संख्या)/N है। P(0) की अनिश्चितता √(P(0)(1 − P(0))/N) है (पाठ 5), और ⟨Z⟩ की उसकी दोगुनी। नतीजा हमेशा इस **standard error** के **साथ** बताएँ:

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler

qc = QuantumCircuit(1)
qc.ry(2 * np.arccos(np.sqrt(0.7)), 0)          # P(0) = 0.7, so <Z> = 0.4 exactly
qc.measure_all()

for shots in [100, 1_000, 10_000, 100_000]:
    c = StatevectorSampler(seed=9).run([qc], shots=shots).result()[0].data.meas.get_counts()
    p0 = c.get("0", 0) / shots
    z = 2 * p0 - 1                               # <Z> = P(0) - P(1)
    err = 2 * np.sqrt(p0 * (1 - p0) / shots)     # standard error of <Z>
    print(f"{shots:>7} shots: <Z> = {z:.3f} ± {err:.3f}")
```

```text
    100 shots: <Z> = 0.240 ± 0.097
   1000 shots: <Z> = 0.394 ± 0.029
  10000 shots: <Z> = 0.408 ± 0.009
 100000 shots: <Z> = 0.405 ± 0.003
```

असली value 0.4 है। पहली लाइन देखें: 0.240 काफ़ी दूर है, लेकिन error bar (±0.097) चेतावनी देता है, और 0.4 लगभग दो error bars के अंदर है। Error bars का मक़सद यही है: वे बताते हैं कि किसी नंबर पर कितना भरोसा करें। काम का नियम: नतीजा किसी अनुमान से **मेल खाता** है अगर फ़र्क़ लगभग दो standard errors से कम हो; तीन से ज़्यादा का फ़र्क़ जाँचने लायक है।

### कितने shots चाहिए?

जिस observable के नतीजे ±1 हों (कोई भी Pauli string), उसका standard error ज़्यादा से ज़्यादा 1/√N है। तो सटीकता ε तक पहुँचने के लिए:

> **N ≈ 1/ε²**

| चाहिए सटीकता | चाहिए shots (सबसे बुरी हालत) |
|---|---|
| ±0.1 | 100 |
| ±0.01 | 10,000 |
| ±0.001 | 1,000,000 |

यह 1/ε² असली लागत है। Variational algorithms (पाठ 30) दर्जनों या सैकड़ों Pauli पदों से बनी energies का अनुमान लगाते हैं, हर एक को हज़ारों shots चाहिए, optimisation के हर क़दम पर। Near-term algorithms को धीमा अक्सर shot गिनती बनाती है, gate गिनती नहीं। (पाठ 25 दिखाता है कि भविष्य की मशीनों पर amplitude estimation इसे ~1/ε तक कैसे सुधार सकता है।)

Estimator यह आपके लिए संभालता है: हार्डवेयर पर आप लक्ष्य `precision` सेट करते हैं, और वह shots चुनता है। Simulator पर `StatevectorEstimator(default_precision=0.01)` सटीक जवाब में उतने आकार का असली जैसा random बिखराव जोड़ता है, यह जल्दी जाँचने का तरीका है कि आपका algorithm shot noise झेल पाता है या नहीं।

## दो histograms की तुलना

अक्सर आप जानना चाहते हैं कि नापा गया distribution आदर्श वाले के कितना पास है, जैसे असली chip का output बनाम simulator। दो मानक माप:

**Total variation distance (TVD):** सभी नतीजों पर probability के अंतरों के जोड़ का आधा। 0 मतलब एक जैसे, 1 मतलब बिल्कुल overlap नहीं। यह probability का वह सबसे बड़ा अंतर है जो दोनों distributions किसी घटना को दे सकते हैं।

**Hellinger fidelity:** (Σ √(pᵢ qᵢ))², 1 मतलब एक जैसे और 0 मतलब कोई overlap नहीं। Qiskit में यह पहले से है, और IBM के benchmarks अक्सर यही बताते हैं।

```python
from qiskit.quantum_info import hellinger_fidelity

ideal  = {"00": 500, "11": 500}
noisy  = {"00": 470, "11": 455, "01": 40, "10": 35}

def tvd(p, q):
    """Total variation distance between two count dictionaries (0 = same, 1 = no overlap)."""
    keys = set(p) | set(q)
    P, Q = sum(p.values()), sum(q.values())
    return 0.5 * sum(abs(p.get(k, 0) / P - q.get(k, 0) / Q) for k in keys)

print("total variation distance:", round(tvd(ideal, noisy), 3))
print("Hellinger fidelity:      ", round(hellinger_fidelity(ideal, noisy), 3))
```

```text
total variation distance: 0.075
Hellinger fidelity:       0.925
```

7.5% probability "ग़लत जगह" पर है: ठीक 1,000 में से 01 और 10 वाले 75 shots। याद रखें कि पूरी तरह सही device भी सीमित shots के साथ शून्य से ऊपर TVD देती है, क्योंकि दोनों histograms में shot noise है। हार्डवेयर को दोष देने से पहले तुलना करें कि अकेला shot noise कितना देता।

## Noise simulate करना

असली हार्डवेयर इस्तेमाल करने से पहले simulator जो सबसे काम की चीज़ कर सकता है, वह है अनुमान लगाना कि **noise** आपके नतीजे कैसे बिगाड़ेगा। Aer आसान सामग्री से **noise model** बनाने देता है:

- **Depolarizing error:** probability p से gate के बाद एक random Pauli error आता है (असल में qubit की state थोड़ी गड़बड़ हो जाती है)। Two-qubit gates का p बड़ा होता है।
- **Readout error:** 0 कभी-कभी 1 दर्ज होता है और उल्टा भी।

असली devices ये नंबर अपने calibration data में छापती हैं (पाठ 40)। यह model मोटे तौर पर मध्यम स्तर के superconducting chip जैसा है: हर single-qubit gate पर 0.1% error, हर CNOT पर 1%, और 2–3% readout error। हम बढ़ते आकार की GHZ states चलाकर नापते हैं कि कितना बचता है।

```python
from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator
from qiskit_aer.noise import NoiseModel, depolarizing_error, ReadoutError
from qiskit.quantum_info import hellinger_fidelity

# A simple noise model, roughly like a mid-range superconducting chip
noise = NoiseModel()
noise.add_all_qubit_quantum_error(depolarizing_error(0.001, 1), ["sx", "x", "rz"])   # 0.1% per 1-qubit gate
noise.add_all_qubit_quantum_error(depolarizing_error(0.01, 2), ["cx"])               # 1% per CNOT
noise.add_all_qubit_readout_error(ReadoutError([[0.98, 0.02], [0.03, 0.97]]))       # misread 2-3%

def ghz(n):
    qc = QuantumCircuit(n)
    qc.h(0)
    for q in range(n - 1):
        qc.cx(q, q + 1)
    qc.measure_all()
    return qc

ideal_sim = AerSimulator(seed_simulator=1)
noisy_sim = AerSimulator(noise_model=noise, seed_simulator=1)
for n in [2, 5, 10]:
    qc = transpile(ghz(n), basis_gates=["cx", "sx", "x", "rz"])
    ideal = ideal_sim.run(qc, shots=4000).result().get_counts()
    noisy = noisy_sim.run(qc, shots=4000).result().get_counts()
    good = noisy.get("0" * n, 0) + noisy.get("1" * n, 0)
    print(f"{n:2d} qubits: {good / 4000:.3f} of shots are all-0 or all-1,"
          f" Hellinger fidelity {hellinger_fidelity(ideal, noisy):.3f}")
```

```text
 2 qubits: 0.947 of shots are all-0 or all-1, Hellinger fidelity 0.947
 5 qubits: 0.842 of shots are all-0 or all-1, Hellinger fidelity 0.842
10 qubits: 0.717 of shots are all-0 or all-1, Hellinger fidelity 0.717
```

Circuit बढ़ने के साथ गुणवत्ता गिरती है। इसका मोटा अनुमान हाथ से लगा सकते हैं: 10-qubit GHZ में 9 CNOTs हैं, हर एक 99% बार सफल, तो लगभग 0.99⁹ ≈ 0.91 runs में कोई gate error नहीं। फिर 10 readouts, हर एक लगभग 97.5% बार सही: 0.975¹⁰ ≈ 0.78। मिलाकर: 0.91 × 0.78 ≈ 0.71, simulate किए 0.717 के बहुत पास।

यह गुणा near-term quantum computing का सबसे ज़रूरी मोटा हिसाब है: **सफलता ≈ (gate fidelity)^(gates की संख्या)**। इसीलिए depth और two-qubit gate गिनती इतनी मायने रखती है (पाठ 13), और इसीलिए आख़िरकार error correction (भाग F) ज़रूरी है।

## दोहराने लायक नतीजे: seeds

Simulated shots random होते हैं। हर बार वही नंबर पाने के लिए (पढ़ाने, debugging और इस course जैसे नतीजे जाँचने के लिए) random **seed** तय करें: `StatevectorSampler(seed=…)`, `AerSimulator(seed_simulator=…)`, `np.random.default_rng(…)`। हर run पर नई randomness देखने के लिए seed हटा दें। असली हार्डवेयर का कोई seed नहीं होता: उसकी randomness असली है (पाठ 5)।

## समझदार कार्यप्रणाली

1. **पहले सटीक।** छोटे उदाहरणों पर `Statevector` या `Operator` से जाँचें कि circuit वही करता है जो आप सोचते हैं, बिना किसी randomness के।
2. **फिर shots।** असली जितने shots के साथ Sampler या Estimator चलाएँ, और error bars देखें।
3. **फिर noise।** जिस device को इस्तेमाल करना है, उसके नंबरों से noisy simulation चलाएँ। अगर जवाब यहाँ noise में खो जाए, तो हार्डवेयर पर भी खोएगा।
4. **फिर हार्डवेयर** (पाठ 40), क़दम 2 और 3 से TVD या Hellinger fidelity से तुलना करते हुए।

## ख़ुद करके देखें

1. 35-qubit state vector को कितनी memory चाहिए (हर amplitude 16 bytes)? 35-qubit density matrix को?
2. Stabilizer simulator हज़ारों qubits क्यों संभाल सकता है, लेकिन एक भी T gate नहीं?
3. आपने ⟨Z⟩ = 0.31 ± 0.04 नापा। क्या यह 0.40 के अनुमान से मेल खाता है? 0.30 से?
4. Pauli expectation value को ±0.005 तक जानने के लिए कितने shots चाहिए?
5. एक circuit में 99.5% fidelity वाले 40 CNOTs और 98% वाले 8 readouts हैं। लगभग कितने shots बिना ग़लती के हैं?
6. दो histograms की Hellinger fidelity 1.0 है। क्या इसका मतलब device पूरी तरह सही है?

**जवाब:**

1. 2³⁵ × 16 bytes ≈ **550 GB**। Density matrix को 4³⁵ × 16 bytes ≈ **1.9 × 10²² bytes**: असंभव।
2. Clifford gates stabilizer विवरण को छोटा रखते हैं; T gate वह ढाँचा तोड़ देता है (पाठ 17), तो तरीका लागू नहीं रहता।
3. 0.40 से फ़र्क़ 0.09 है, दो error bars (0.08) से ज़्यादा: **सीमा पर, जाँचने लायक**। 0.30 से फ़र्क़ 0.01: **मेल खाता है**।
4. N ≈ 1/0.005² = **40,000** shots।
5. 0.995⁴⁰ × 0.98⁸ ≈ 0.82 × 0.85 ≈ **0.70**।
6. ज़रूरी नहीं: इसका मतलब है दोनों **histograms** मेल खाते हैं। Device ग़लत phases के साथ सही गिनतियाँ दे सकती है, जो सिर्फ़ दूसरे measurements में दिखती हैं (पाठ 8 की tomography)।

## सार

| विचार | सूत्र या तथ्य |
|---|---|
| Statevector memory | 16 × 2ⁿ bytes; laptop पर ~30 qubits |
| Density matrix | 4ⁿ नंबर; सटीक noise के लिए ज़रूरी |
| Stabilizer | Clifford circuits, हज़ारों qubits |
| MPS | कम-entanglement circuits, सैकड़ों qubits |
| Aer | `AerSimulator(method="statevector" / "density_matrix" / "stabilizer" / "matrix_product_state")` |
| गिनतियों से ⟨Z⟩ | 2·P(0) − 1 |
| ⟨Z⟩ का standard error | 2·√(P(0)(1 − P(0))/N) |
| मेल खाता है? | लगभग दो standard errors के अंदर |
| सटीकता ε के लिए shots | N ≈ 1/ε² |
| TVD | ½ Σ \|pᵢ − qᵢ\|: 0 एक जैसे, 1 बिल्कुल अलग |
| Hellinger fidelity | (Σ √(pᵢqᵢ))²: 1 एक जैसे, 0 बिल्कुल अलग |
| Noise model | Gates पर depolarizing errors + readout errors |
| मोटा नियम | सफलता ≈ (gate fidelity)^(gates की संख्या) × (readout fidelity)^(qubits) |
| Seeds | दोहराने लायक simulations के लिए तय करें; हार्डवेयर में नहीं होते |
| कार्यप्रणाली | सटीक → shots → noisy simulation → हार्डवेयर |
