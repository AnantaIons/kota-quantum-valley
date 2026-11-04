---
layout: ../../../layouts/Post.astro
lang: hi
title: "Circuits में noise और decoherence"
description: "असली qubits ग़लतियाँ क्यों करते हैं, और उन ग़लतियों को सटीक तरह से कैसे लिखें: environment से entanglement के रूप में decoherence, density matrices, Bloch sphere पर noise channels, T1 और T2, gate और readout errors, circuit में errors कैसे जमा होते हैं, coherent बनाम random errors, और Qiskit Aer में पूरा noise model।"
date: 2026-11-04
category: lesson
lesson: 32
---

अब तक इस course का हर circuit perfect qubits पर चला है। Gates ने ठीक वही किया जो उनकी matrices कहती थीं, इंतज़ार करते समय states वहीं रहीं, और measurement ने ठीक वही पढ़ा जो वहाँ था। असली hardware ऐसा नहीं है। हर gate थोड़ा ग़लत होता है, हर qubit धीरे-धीरे अपनी state भूलता है, और हर measurement कभी-कभी ग़लत पढ़ता है।

यह पाठ उन्हीं कमियों के बारे में है। आप सीखेंगे कि वे कहाँ से आती हैं, physicists उन्हें सटीक रूप से कैसे लिखते हैं, आज की machines पर वे कितनी बड़ी हैं, और वे कितनी जल्दी किसी computation को बर्बाद कर देती हैं। इससे Part F का बाक़ी हिस्सा तैयार होता है: error-correcting codes (पाठ 33 से 35) और error mitigation (पाठ 36), वे दो तरीके जिनसे field जवाबी लड़ाई लड़ता है।

## Qubits नाज़ुक क्यों हैं

Classical bit किसी बड़ी और मज़बूत चीज़ में रखा जाता है: capacitor पर अरबों electrons, या disk पर एक magnetic domain। छोटी-सी गड़बड़ी 0 को 1 नहीं बनाती।

Qubit एक अकेले quantum system में रखा जाता है: एक ion, एक atom, एक छोटा superconducting circuit। और उसकी काम की जानकारी का हिस्सा |0⟩ और |1⟩ के बीच के **relative phase** में रहता है (पाठ 10)। Environment की कोई भी चीज़ जो qubit से interact करे, कोई भटका photon, chip में कंपन करता atom, बदलता magnetic field, qubit की state के बारे में थोड़ी जानकारी उठा सकती है।

मुख्य बात यह है: **जब environment किसी qubit के बारे में जान लेता है, qubit अपना superposition खो देता है।** मानो environment ने उसे आंशिक रूप से measure कर लिया हो। इस प्रक्रिया को **decoherence** कहते हैं।

इसे एक छोटे simulation में सीधे देखा जा सकता है। |+⟩ में एक qubit लें और "environment" का रूप लिए दूसरे qubit को controlled rotation से उससे interact करने दें। Interaction θ जितना ताक़तवर, environment की state हमारे qubit पर उतनी ज़्यादा निर्भर:

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, partial_trace

print("interaction θ   coherence |ρ₀₁|   purity of the qubit")
for theta in [0, np.pi / 4, np.pi / 2, 3 * np.pi / 4, np.pi]:
    qc = QuantumCircuit(2)          # qubit 0 = our qubit, qubit 1 = "the environment"
    qc.h(0)                         # our qubit starts in |+⟩: coherence 0.5
    qc.cry(theta, 0, 1)             # the environment picks up a little information about it
    rho = partial_trace(Statevector(qc), [1])      # look at our qubit alone
    print(f"   {theta:.2f}            {abs(rho.data[0, 1]):.3f}            {rho.purity().real:.3f}")
```

```text
interaction θ   coherence |ρ₀₁|   purity of the qubit
   0.00            0.500            1.000
   0.79            0.462            0.927
   1.57            0.354            0.750
   2.36            0.191            0.573
   3.14            0.000            0.500
```

Hadamard के बाद qubit 0 के साथ कुछ नहीं किया गया। फिर भी जैसे-जैसे environment उससे ज़्यादा entangled होता है, **coherence** (off-diagonal संख्या, जिससे आप अभी मिलेंगे) सिकुड़ती है, और θ = π पर पूरी तरह ग़ायब। अब हमारा qubit एक सिक्के जैसा है जो या तो 0 है या 1, interfere करने के लिए कोई phase नहीं बचा। यही decoherence है: qubit को धकेलने वाला कोई बल नहीं, बल्कि जानकारी का उन जगहों पर रिस जाना जिन पर हमारा नियंत्रण नहीं।

## Density matrices: ऐसे qubit को लिखना जिसके बारे में आप पक्के नहीं

ऊपर के printout में दो शब्द थे, coherence और purity, जो **density matrices** से आते हैं। State vector |ψ⟩ सिर्फ़ उस qubit को लिख सकता है जिसे आप पूरी तरह जानते हैं। Noise आते ही आप ख़ुद state के बारे में अनिश्चित होते हैं, और बड़ा विवरण चाहिए।

ज्ञात (**pure**) state की density matrix ρ = |ψ⟩⟨ψ| है। |ψ⟩ = α|0⟩ + β|1⟩ के लिए:

> ρ = [[ |α|², αβ* ], [ α*β, |β|² ]]

- **Diagonal** entries 0 और 1 measure करने की probabilities हैं।
- **Off-diagonal** entries, यानी **coherences**, relative phase दर्ज करती हैं। यही interference संभव बनाती हैं।

अगर qubit probability p₁ से state |ψ₁⟩ में और p₂ से |ψ₂⟩ में हो (एक **mixed** state), तो औसत लें: ρ = p₁|ψ₁⟩⟨ψ₁| + p₂|ψ₂⟩⟨ψ₂|।

क्लासिक तुलना:

| State | Density matrix | Z में measure | X में measure |
|---|---|---|---|
| \|+⟩ = (\|0⟩ + \|1⟩)/√2 | [[½, ½], [½, ½]] | 50/50 | हमेशा + |
| एक सिक्का: \|0⟩ या \|1⟩, 50/50 | [[½, 0], [0, ½]] | 50/50 | 50/50 |

दोनों Z basis में 50/50 देते हैं, तो उस तरह आप फ़र्क़ नहीं कर सकते। लेकिन |+⟩ के पास coherences हैं, तो वह interference दिखाता है (X basis में हमेशा +), और सिक्का नहीं। Decoherence ठीक वह प्रक्रिया है जो पहली matrix को दूसरी में बदल देती है।

दो काम की बातें:

- **Purity** Tr(ρ²) pure state के लिए 1 है और पूरी तरह mixed qubit के लिए ½।
- हर एक-qubit ρ को ρ = (I + xX + yY + zZ)/2 लिखा जा सकता है। संख्याएँ (x, y, z) **Bloch vector** हैं (पाठ 7)। Pure states Bloch sphere **पर** बैठती हैं (लंबाई 1); mixed states उसके **अंदर**। केंद्र, लंबाई 0, पूरी तरह random qubit है।

तो noise की एक सुंदर तस्वीर है: **वह Bloch vector को अंदर की ओर खींचता है**, सतह से दूर।

## Noise channels

Noise प्रक्रिया को गणित में कैसे लिखें? Unitary gates काफ़ी नहीं, क्योंकि unitary pure states को pure states में ही बदलता है। Noise को **quantum channel** से लिखा जाता है, **Kraus operators** K₁, K₂, … के साथ:

> ρ → K₁ρK₁† + K₂ρK₂† + …,  जहाँ K₁†K₁ + K₂†K₂ + … = I

हर पद को "किसी probability से यह हुआ" पढ़ सकते हैं। आख़िरी शर्त पक्का करती है कि probabilities का जोड़ फिर भी 1 रहे। चार channels ज़्यादातर मामलों को ढक लेते हैं:

| Channel | क्या होता है (probability p) | Kraus operators | Bloch sphere पर |
|---|---|---|---|
| **Bit flip** | X लगता है | √(1−p) I, √p X | y और z (1−2p) से सिकुड़ते हैं |
| **Phase flip** | Z लगता है | √(1−p) I, √p Z | x और y (1−2p) से सिकुड़ते हैं |
| **Depolarising** | Qubit की जगह पूरी तरह random qubit आ जाता है | √(1−3p/4) I, √(p/4) X, √(p/4) Y, √(p/4) Z | सब कुछ (1−p) से सिकुड़ता है |
| **Amplitude damping** | \|1⟩ गिरकर \|0⟩ बनता है (energy loss) | [[1, 0], [0, √(1−p)]], [[0, √p], [0, 0]] | दबता है और \|0⟩ की ओर खिंचता है |

हर एक को एक ही शुरुआती state पर लगाएँ और Bloch vector देखें:

```python
import numpy as np
from qiskit.quantum_info import DensityMatrix, Kraus, Pauli

def bloch(rho):
    return [float(np.real(rho.expectation_value(Pauli(p)))) + 0.0 for p in "XYZ"]

I = np.eye(2); X = np.array([[0, 1], [1, 0]]); Y = np.array([[0, -1j], [1j, 0]]); Z = np.diag([1, -1])
p = 0.2
channels = {
    "bit flip":          Kraus([np.sqrt(1 - p) * I, np.sqrt(p) * X]),
    "phase flip":        Kraus([np.sqrt(1 - p) * I, np.sqrt(p) * Z]),
    "depolarising":      Kraus([np.sqrt(1 - 3 * p / 4) * I] + [np.sqrt(p / 4) * P for P in (X, Y, Z)]),
    "amplitude damping": Kraus([np.array([[1, 0], [0, np.sqrt(1 - p)]]), np.array([[0, np.sqrt(p)], [0, 0]])]),
}

rho = DensityMatrix(np.array([np.sqrt(0.1), np.sqrt(0.9)]))      # Bloch vector (0.6, 0, -0.8)
x, y, z = bloch(rho)
print(f"{'start':18s} Bloch = ({x:+.2f}, {y:+.2f}, {z:+.2f})   length {np.linalg.norm([x, y, z]):.2f}   purity {rho.purity().real:.2f}")
for name, ch in channels.items():
    out = rho.evolve(ch)
    x, y, z = bloch(out)
    print(f"{name:18s} Bloch = ({x:+.2f}, {y:+.2f}, {z:+.2f})   length {np.linalg.norm([x, y, z]):.2f}   purity {out.purity().real:.2f}")
```

```text
start              Bloch = (+0.60, +0.00, -0.80)   length 1.00   purity 1.00
bit flip           Bloch = (+0.60, +0.00, -0.48)   length 0.77   purity 0.80
phase flip         Bloch = (+0.36, +0.00, -0.80)   length 0.88   purity 0.88
depolarising       Bloch = (+0.48, +0.00, -0.64)   length 0.80   purity 0.82
amplitude damping  Bloch = (+0.54, +0.00, -0.44)   length 0.69   purity 0.74
```

हर पंक्ति को table से मिलाएँ:

- **Bit flip** ने x को छुआ नहीं (X flip X component नहीं बदलता) लेकिन z को 1 − 2(0.2) = 0.6 से सिकोड़ा: −0.8 बना −0.48।
- **Phase flip** ने उलटा किया: z अछूता, x 0.60 से 0.36 हुआ।
- **Depolarising** ने सब कुछ 0.8 से सिकोड़ा, केंद्र की ओर।
- **Amplitude damping** ने z को **ऊपर** खिसकाया, −0.80 से −0.44, क्योंकि energy loss qubit को |0⟩ (z = +1) की ओर धकेलता है। यहाँ यही अकेला channel है जिसकी एक पसंदीदा दिशा है।

हर मामले में लंबाई 1 से नीचे गई: state mixed हो गई। तीनों symmetric channels Bloch vector को सिर्फ़ सिकोड़ ही सकते हैं। Amplitude damping अपवाद है: काफ़ी देर लगाने पर वह **हर** state को |0⟩ तक खींच लेता है, पूरी तरह mixed state को भी। यह असल में काम का है, क्योंकि qubit को reset करने का सबसे आसान तरीका यही है: इंतज़ार करो।

## T1 और T2: qubit की दो घड़ियाँ

Hardware teams qubit की याददाश्त को दो समयों में बताती हैं।

- **T1, energy relaxation।** |1⟩ में qubit के पास |0⟩ से ज़्यादा energy होती है और आख़िरकार वह नीचे गिरता है, energy आसपास को देकर। समय t के बाद भी |1⟩ में रहने की probability e^(−t/T1) है। यही amplitude damping है।
- **T2, dephasing।** Energy न भी खोए, तो भी |0⟩ और |1⟩ के बीच relative phase random भटकता है, क्योंकि qubit की frequency environment के साथ काँपती है। Coherence e^(−t/T2) की तरह घटती है। यह phase-flip noise है, साथ में T1 प्रक्रिया का हिस्सा।

Physics पक्का करती है कि **T2 ≤ 2·T1**: जो energy खोता है वह phase भी खोता है। व्यवहार में T2 अक्सर T1 से कम होता है।

Qiskit Aer, समय t तक खाली बैठे qubit का सटीक channel बना सकता है:

```python
import numpy as np
from qiskit.quantum_info import DensityMatrix, Pauli
from qiskit_aer.noise import thermal_relaxation_error

T1, T2 = 100e-6, 80e-6                        # seconds: typical for a good superconducting qubit
one  = DensityMatrix.from_label("1")          # tests T1: does |1⟩ stay excited?
plus = DensityMatrix.from_label("+")          # tests T2: does the relative phase survive?

print("  time    P(1) from |1⟩   ⟨X⟩ from |+⟩")
for t_us in [0, 25, 50, 100, 200, 400]:
    channel = thermal_relaxation_error(T1, T2, t_us * 1e-6).to_quantumchannel()
    p1 = one.evolve(channel).probabilities()[1]
    x = plus.evolve(channel).expectation_value(Pauli("X")).real
    print(f"{t_us:4d} µs      {p1:.3f}          {x:.3f}")
print(f"\ne^(-t/T1) at 100 µs = {np.exp(-1):.3f};  e^(-t/T2) at 100 µs = {np.exp(-100 / 80):.3f}")
```

```text
time    P(1) from |1⟩   ⟨X⟩ from |+⟩
   0 µs      1.000          1.000
  25 µs      0.779          0.732
  50 µs      0.607          0.535
 100 µs      0.368          0.287
 200 µs      0.135          0.082
 400 µs      0.018          0.007

e^(-t/T1) at 100 µs = 0.368;  e^(-t/T2) at 100 µs = 0.287
```

एक T1 (100 µs) के बाद excited population का सिर्फ़ 37% बचा। एक T2 के बाद phase जानकारी अपनी शुरुआती क़ीमत के 29% पर आ गई। कुछ सौ microseconds में qubit सब कुछ भूल चुका है।

यह निराशाजनक लगता है जब तक आप gate times से तुलना न करें। Superconducting two-qubit gate लगभग 50 से 500 nanoseconds लेता है, तो T2 = 80 µs वाला qubit एक coherence time में सैकड़ों से हज़ार gates समा सकता है। मायने coherence time और gate time का **अनुपात** रखता है, अकेली कोई संख्या नहीं। Trapped ions की coherence बहुत लंबी (seconds) होती है लेकिन gates भी बहुत धीमे (दसियों से सैकड़ों microseconds), तो अनुपात मिलती-जुलती range में आता है।

एक और बारीकी जानने लायक़ है। Dephasing का एक हिस्सा धीमे drifts से आता है: qubit की frequency एक run से दूसरे run में थोड़ी अलग होती है। वह हिस्सा **उलटा** जा सकता है। अगर इंतज़ार के बीच में एक X लगाएँ, तो पहले आधे में जमा phase दूसरे आधे में उलट जाता है, जैसे आधे रास्ते पर पलटाए गए धावक, जो सब एक साथ शुरुआत पर लौटते हैं। यह **spin echo** है, और इसके साथ नापा गया coherence time (अक्सर T2,echo लिखा जाता है) सादे वाले (अक्सर T2*) से लंबा होता है। पाठ 36 इस विचार पर आगे बनाता है, जिसे dynamical decoupling कहते हैं।

## Gate errors और readout errors

खाली बैठने का decay अकेली समस्या नहीं। हर gate भी थोड़ा अधूरा है: control pulse ज़रा ज़्यादा ताक़तवर हो सकता है, ज़रा लंबा, या frequency से ज़रा हटकर। Hardware teams **error per gate** एक तकनीक से नापती हैं जिसे **randomised benchmarking** कहते हैं: gates के लंबे random क्रम चलाओ जिनका गुणनफल identity होना चाहिए, और देखो कि क्रम की लंबाई के साथ सफलता कितनी जल्दी गिरती है।

Measurement भी अधूरा है। |1⟩ वाला qubit 0 पढ़ा जा सकता है, अक्सर इसलिए कि वह measurement के दौरान ही गिर गया (superconducting qubits पर measurement सैकड़ों nanoseconds लेता है)। इन errors को **confusion matrix** में लिखा जाता है: हर सच्ची state पर हर नतीजा पढ़ने की probability।

2025 और 2026 की अग्रणी machines की मोटी संख्याएँ कुछ ऐसी हैं (हर साल सुधरती हैं, तो इन्हें मोटे परिमाण मानें और provider का ताज़ा calibration data देखें):

| Platform | Coherence | Two-qubit gate समय | Two-qubit gate error | Readout error |
|---|---|---|---|---|
| Superconducting circuits | T1 ≈ 50 से 300 µs | ≈ 50 से 500 ns | ≈ 0.2% से 1% | ≈ 0.5% से 2% |
| Trapped ions | T2 ≈ seconds | ≈ 0.1 से 1 ms | ≈ 0.1% से 0.5% | ≈ 0.1% से 0.5% |
| Neutral atoms | T2 ≈ 1 second | ≈ 0.2 से 1 µs | ≈ 0.5% से 1% | ≈ 0.5% से 3% |

साझा बात: **सबसे अच्छे two-qubit gates हर कुछ सौ से हज़ार इस्तेमाल में लगभग एक बार fail होते हैं।** Single-qubit gates आम तौर पर दस गुना बेहतर हैं। पाठ 37 से 39 बताते हैं कि ये संख्याएँ physically कहाँ से आती हैं।

## Errors कैसे जमा होते हैं

हज़ार में एक error छोटा लगता है। मुश्किल यह है कि circuits में बहुत gates होते हैं, और इस बात की संभावना कि उनमें से **कोई भी** fail न हो, exponentially घटती है। अगर हर gate probability ε से fail हो और circuit में G gates हों, तो साफ़ run की संभावना लगभग (1 − ε)^G ≈ e^(−εG) है:

```python
print("chance a whole circuit runs with no error, (1 - ε)^G")
print("   gates G      ε = 1%       ε = 0.1%     ε = 0.01%")
for G in [100, 1_000, 10_000, 1_000_000]:
    row = [(1 - e) ** G for e in [1e-2, 1e-3, 1e-4]]
    print(f"{G:10,d}   " + "   ".join(f"{r:10.1e}" if r > 1e-300 else "    ≈ 0   " for r in row))
```

```text
chance a whole circuit runs with no error, (1 - ε)^G
   gates G      ε = 1%       ε = 0.1%     ε = 0.01%
       100      3.7e-01      9.0e-01      9.9e-01
     1,000      4.3e-05      3.7e-01      9.0e-01
    10,000      2.2e-44      4.5e-05      3.7e-01
 1,000,000       ≈ 0          ≈ 0         3.7e-44
```

मोटा नियम: **error rate ε पर आप लगभग 1/ε gates चला सकते हैं**, उसके बाद नतीजा ज़्यादातर noise है। ε = 0.1% पर यह लगभग हज़ार gates है। 2048-bit नंबर के लिए Shor algorithm को अरबों चाहिए (पाठ 28)। कच्चे hardware में कोई दिखता सुधार इतना बड़ा फ़ासला नहीं पाटता, इसीलिए error correction (पाठ 33 से आगे) वैकल्पिक नहीं है।

इसे एक असली simulation में होते देखें। n qubits पर GHZ state (|00…0⟩ + |11…1⟩)/√2 को n − 1 CNOTs चाहिए। हर CNOT को 1% depolarising error और हर Hadamard को 0.1% दें, फिर noisy नतीजे की perfect state से तुलना **fidelity** से करें (1 मतलब एक जैसे):

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, state_fidelity
from qiskit_aer import AerSimulator
from qiskit_aer.noise import NoiseModel, depolarizing_error

noise = NoiseModel()
noise.add_all_qubit_quantum_error(depolarizing_error(0.001, 1), ["h"])     # 0.1% per 1-qubit gate
noise.add_all_qubit_quantum_error(depolarizing_error(0.01, 2), ["cx"])     # 1% per 2-qubit gate
sim = AerSimulator(method="density_matrix", noise_model=noise)

def ghz(n):
    qc = QuantumCircuit(n)
    qc.h(0)
    for q in range(n - 1):
        qc.cx(q, q + 1)
    return qc

print(" n   CNOTs   fidelity   rough guess (0.99)^CNOTs")
for n in [2, 4, 6, 8, 10]:
    ideal = Statevector(ghz(n))
    qc = ghz(n)
    qc.save_density_matrix()
    rho = sim.run(qc).result().data()["density_matrix"]
    print(f"{n:2d}   {n - 1:4d}    {state_fidelity(rho, ideal):.4f}     {0.99 ** (n - 1):.4f}")
```

```text
n   CNOTs   fidelity   rough guess (0.99)^CNOTs
 2      1    0.9920     0.9900
 4      3    0.9747     0.9703
 6      5    0.9578     0.9510
 8      7    0.9411     0.9321
10      9    0.9248     0.9135
```

हर CNOT के साथ fidelity लगातार गिरती है, सरल (1 − ε)^G अनुमान के बिल्कुल क़रीब। (अनुमान से थोड़ा बेहतर इसलिए कि depolarising error कभी-कभी state की जगह ऐसी चीज़ रख देता है जो संयोग से सही जवाब से overlap करती है।) `method="density_matrix"` से Aer पूरा ρ track करता है, जो सटीक है लेकिन 4ⁿ संख्याएँ लेता है, तो लगभग एक दर्जन qubits तक ही व्यावहारिक है।

## Coherent errors बनाम random errors

सारे errors एक तरह नहीं जुड़ते। थोड़े ख़राब gate की दो क़िस्मों की तुलना करें, हर एक छोटे कोण ε = 0.01 radians से ग़लत:

- **Coherent error:** हर gate हर बार एक ही तरफ़ +ε ज़्यादा घूमता है (ग़लत calibrate हुआ pulse)। कोण **जुड़ते** हैं: N gates के बाद आप Nε से हटे हैं।
- **Random (incoherent) error:** हर gate random रूप से +ε या −ε ग़लत है। कोण **random walk** करते हैं: N gates के बाद आम तौर पर सिर्फ़ लगभग √N·ε से हटे हैं।

Error probability कोण के square की तरह चलती है, तो फ़र्क़ नाटकीय है:

```python
import numpy as np

eps = 0.01                       # each gate over-rotates by 0.01 radians
print("  gates N   coherent (same direction)   random direction")
for N in [1, 10, 100, 1000]:
    coherent = np.sin(N * eps / 2) ** 2              # angles add: N·ε
    random = (1 - np.cos(eps) ** N) / 2              # angles random-walk: ~√N·ε
    print(f"{N:8d}        {coherent:.2e}                {random:.2e}")
```

```text
gates N   coherent (same direction)   random direction
       1        2.50e-05                2.50e-05
      10        2.50e-03                2.50e-04
     100        2.30e-01                2.49e-03
    1000        9.20e-01                2.44e-02
```

एक gate के बाद दोनों एक जैसे हैं। 100 gates के बाद coherent error 23% तक बढ़ गया, जबकि random वाला सिर्फ़ 0.25% है। Coherent errors **N²** की तरह बढ़ते हैं; random वाले **N** की तरह।

इसके दो बड़े नतीजे हैं। पहला, अगर errors coherent हों तो एक अकेली "error per gate" संख्या यह बुरी तरह कम आँक सकती है कि लंबा circuit कैसे fail होता है। दूसरा, यह एक तरकीब सुझाता है: errors को जान-बूझकर **random** बना दो ताकि वे coherently न जुड़ सकें। यह तरकीब, जिसे **Pauli twirling** या randomised compiling कहते हैं, error mitigation में इस्तेमाल होती है (पाठ 36), और error-correcting codes भी measure करते समय coherent errors को random में बदल देते हैं (पाठ 33)।

## दूसरे उपद्रवी

असली devices में कुछ और failure modes हैं जो ऊपर के सरल models छोड़ देते हैं:

- **Leakage:** superconducting qubit असल में energy levels की सीढ़ी है। लापरवाह pulse उसे |2⟩ में धकेल सकता है, qubit space के बाहर, जहाँ साधारण gates और codes को समझ नहीं आता कि क्या करें।
- **Crosstalk:** एक qubit को drive करना उसके पड़ोसियों को थोड़ा परेशान करता है, तो errors स्वतंत्र नहीं रहते।
- **Drift:** environment बदलने से calibrations घंटों में पुराने पड़ते हैं, इसीलिए machines नियमित रूप से recalibrate होती हैं।
- **Correlated bursts:** cosmic ray या प्राकृतिक radioactivity का झोंका chip में energy छोड़ सकता है और एक साथ कई qubits पर errors ला सकता है। Error-correcting codes मानते हैं कि errors ज़्यादातर स्वतंत्र हैं, तो ये ख़ास तौर पर ख़तरनाक हैं, और chip designers अब ऐसे झोंकों को सोखने वाली features जोड़ते हैं।

## Qiskit में पूरा noise model

Aer आपको gate errors और readout errors को एक `NoiseModel` में जोड़ने देता है और फिर circuits ठीक वैसे चलाने देता है जैसे hardware पर। यहाँ depolarising gate noise और असमान readout error के साथ Bell state है:

```python
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator
from qiskit_aer.noise import NoiseModel, depolarizing_error, ReadoutError

bell = QuantumCircuit(2)
bell.h(0)
bell.cx(0, 1)
bell.measure_all()

noise = NoiseModel()
noise.add_all_qubit_quantum_error(depolarizing_error(0.001, 1), ["h"])
noise.add_all_qubit_quantum_error(depolarizing_error(0.02, 2), ["cx"])
# Readout: a true 0 is read as 1 with 2% chance; a true 1 is read as 0 with 5% chance
noise.add_all_qubit_readout_error(ReadoutError([[0.98, 0.02], [0.05, 0.95]]))

for name, sim in [("ideal", AerSimulator(seed_simulator=7)), ("noisy", AerSimulator(noise_model=noise, seed_simulator=7))]:
    counts = sim.run(bell, shots=10_000).result().get_counts()
    print(f"{name}: {dict(sorted(counts.items()))}")
```

```text
ideal: {'00': 4980, '11': 5020}
noisy: {'00': 4787, '01': 382, '10': 363, '11': 4468}
```

Ideal run सिर्फ़ 00 और 11 दिखाता है। Noisy run लगभग 7.5% नतीजे 01 और 10 में दिखाता है, जो perfect Bell state कभी नहीं देता। और ध्यान दें कि 11 अब 00 से कम बार आता है, जबकि दोनों बराबर होने चाहिए: यह असमान readout है, क्योंकि 1 के ग़लत पढ़े जाने की संभावना 0 से ज़्यादा है (वह measurement के दौरान गिर सकता है)।

जब आप असली device का model बनाना चाहें, Qiskit किसी backend के प्रकाशित calibration data से noise model बना सकता है, हर qubit के T1, T2, gate errors और readout errors के साथ। पाठ 40 ठीक यही करता है।

## जवाबी लड़ाई

Noise से निपटने के तीन तरीके हैं, और अगले चार पाठ उन्हें समझाते हैं:

1. **बेहतर hardware।** लंबी coherence, साफ़ gates, बेहतर readout। यह लगातार सुधरा है, मोटे तौर पर हर कुछ सालों में दस गुना, लेकिन अपने दम पर अरब में एक error तक नहीं पहुँच सकता।
2. **Error correction (पाठ 33 से 35)।** एक logical qubit को कई physical qubits में फैलाओ, data देखे बिना errors पकड़ो, और ठीक करो। अगर physical errors एक **threshold** से नीचे हों, तो और qubits जोड़ने से logical qubit exponentially बेहतर होता है।
3. **Error mitigation (पाठ 36)।** पूरे error correction के बिना आज की machines के लिए: कुछ अतिरिक्त, चतुराई से बदले circuits चलाओ और classical post-processing से अंदाज़ा लगाओ कि noiseless जवाब क्या होता।

## आज़माकर देखें

1. किसी qubit की state का Bloch vector (0, 0, 0) है। उसकी density matrix क्या है, और purity क्या है?
2. एक qubit ठीक |0⟩ में शुरू होता है। चार channels में से कौन-से उसकी state बदलते हैं, और कौन-से उसे छोड़ देते हैं?
3. एक qubit का T1 = 200 µs है। 50 µs बाद उसके अब भी |1⟩ में होने की संभावना क्या है?
4. क्या किसी qubit का T1 = 50 µs और T2 = 150 µs हो सकता है? समझाएँ।
5. एक circuit में 2,000 two-qubit gates हैं, हर एक 0.2% error के साथ। Error-free run की संभावना का अनुमान लगाएँ।
6. एक gate हर बार उसी छोटे कोण से ज़्यादा घूमता है। अगर 10 gates 1% error देते हैं, तो 30 gates लगभग कितना error देंगे?
7. Noisy Bell state run में 11, 00 से कम बार क्यों आया?

**जवाब:**

1. ρ = (I + 0)/2 = [[½, 0], [0, ½]], पूरी तरह mixed state। Purity Tr(ρ²) = ¼ + ¼ = **½**, qubit के लिए न्यूनतम।
2. **Bit flip** (z, 1 से 1 − 2p पर गिरता है) और **depolarising** (z, 1 − p पर गिरता है) उसे बदलते हैं। **Phase flip** उसे छोड़ देता है, क्योंकि Z|0⟩ = |0⟩। **Amplitude damping** भी छोड़ देता है, क्योंकि |0⟩ पहले से सबसे कम energy वाली state है और उसके पास खोने को कुछ नहीं।
3. e^(−50/200) = e^(−0.25) ≈ **0.78**, यानी 78% संभावना।
4. **नहीं।** T2 कभी 2·T1 = 100 µs से ज़्यादा नहीं हो सकता, क्योंकि energy खोना हमेशा phase भी नष्ट करता है।
5. (1 − 0.002)^2000 ≈ e^(−4) ≈ **0.018**, 2% से कम।
6. Coherent error की probability N² की तरह बढ़ती है, तो N तिगुना करने से वह लगभग 9 गुना: मोटे तौर पर **9%**।
7. Readout सच्चे 1 को 5% संभावना से 0 पढ़ता है, लेकिन सच्चे 0 को सिर्फ़ 2% से 1। तो 11 के counts 00 से ज़्यादा घटते हैं।

## सार-सूत्र

| विचार | सूत्र या तथ्य |
|---|---|
| Decoherence | Environment qubit से entangled होकर जानकारी ले जाता है, superposition नष्ट करता है |
| Density matrix | ρ = Σ pᵢ \|ψᵢ⟩⟨ψᵢ\|; diagonal = probabilities, off-diagonal = coherences |
| Bloch रूप | ρ = (I + xX + yY + zZ)/2; pure sphere पर, mixed अंदर |
| Purity | Tr(ρ²): pure पर 1, पूरी तरह mixed (एक qubit) पर ½ |
| Channel | ρ → Σ K ρ K†, जहाँ Σ K†K = I |
| Bit flip / phase flip | Probability p से X या Z; दो Bloch components (1−2p) से सिकुड़ते हैं |
| Depolarising | Probability p से random qubit से बदलना; सब (1−p) से सिकुड़ते हैं |
| Amplitude damping | Energy loss, \|0⟩ की ओर खींचता है |
| T1 | P(अब भी \|1⟩ में) = e^(−t/T1) |
| T2 | Coherence ∝ e^(−t/T2); T2 ≤ 2·T1 |
| Spin echo | बीच में एक X धीमे phase drifts को रद्द करता है |
| Error budget | Error rate ε पर लगभग 1/ε gates; साफ़ run की संभावना ≈ e^(−εG) |
| Coherent बनाम random | Coherent errors N² की तरह, random N की तरह बढ़ते हैं |
| Qiskit | `Kraus`, `DensityMatrix.evolve`, `thermal_relaxation_error`, `depolarizing_error`, `ReadoutError`, `NoiseModel` |
