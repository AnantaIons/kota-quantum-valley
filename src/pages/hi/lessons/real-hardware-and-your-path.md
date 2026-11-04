---
layout: ../../../layouts/Post.astro
lang: hi
title: "असली hardware और quantum में आपका रास्ता"
description: "आख़िरी पाठ: एक capstone प्रयोग जो नापता है कि quantum computer के errors gates की हर परत पर कितना ख़र्च करते हैं (पहले noisy device model पर local चलाया, फिर असली IBM hardware के लिए तैयार), 50 पाठों के बाद आप अब क्या कर सकते हैं, इसे साबित करने वाला portfolio कैसे बनाएँ, 12 महीने की सीखने की योजना, मुख्य career दिशाएँ, और भारत और online संसाधन।"
date: 2026-11-04
category: lesson
lesson: 49
---

आप Course 1 के आख़िरी पाठ पर पहुँच गए हैं। पचास पाठ पहले bit एक switch था और qubit एक रहस्य। अब आप quantum circuits लिख और विश्लेषण कर सकते हैं, मुख्य algorithms और उनकी सीमाएँ समझा सकते हैं, बता सकते हैं कि errors कैसे ठीक और कम किए जाते हैं, hardware platforms की तुलना कर सकते हैं, असली devices पर code चला सकते हैं, और research आलोचनात्मक नज़र से पढ़ सकते हैं।

यह पाठ तीन काम करता है। पहला, एक **capstone प्रयोग** जो transpiling, noise, benchmarking और data fitting को जोड़ता है: आप नापेंगे कि circuits गहरे होने पर quantum computer कितनी तेज़ी से जानकारी खोता है। दूसरा, जो सीखा उसे ऐसे **सबूत** में बदलने की व्यावहारिक guide जिसे employers और professors महत्व देते हैं। तीसरा, **आगे कहाँ जाएँ** इसका नक़्शा।

## अब आप क्या कर सकते हैं

| भाग | पाठ | अब आप... |
|---|---|---|
| A. तैयारी | 0–5 | Bits, complex संख्याओं, vectors, matrices और probability के साथ काम कर सकते हैं |
| B. एक qubit | 6–11 | कोई भी qubit state, measurement और single-qubit gate बता सकते हैं |
| C. कई qubits | 12–17 | Tensor products, entanglement, Bell tests, no-cloning और universal gate sets इस्तेमाल कर सकते हैं |
| D. Qiskit से coding | 18–21 | Circuits बना, simulate और विश्लेषण कर सकते हैं; teleport और superdense-code कर सकते हैं |
| E. Quantum algorithms | 22–31 | मुख्य algorithms समझा और बना सकते हैं, और ईमानदारी से बता सकते हैं कि वे क्या कर सकते हैं और क्या नहीं |
| F. Errors और correction | 32–36 | Noise का model बना सकते हैं, error-correcting codes बना सकते हैं, surface code समझ सकते हैं, errors कम कर सकते हैं |
| G. Hardware | 37–40 | Superconducting, ion, atom और photonic qubits कैसे काम करते हैं समझा सकते हैं; hardware पर transpile और चला सकते हैं |
| H. Communication और sensing | 41–44 | QKD, quantum networks, post-quantum cryptography और quantum sensors समझा सकते हैं |
| I. इस्तेमाल और आपका रास्ता | 45–49 | Chemistry, ML, optimisation और finance के इस्तेमाल परख सकते हैं; research पढ़ सकते हैं; career की योजना बना सकते हैं |

## Capstone: हर परत की क़ीमत कितनी है?

यहाँ एक सरल, ताक़तवर प्रयोग है जिसे researchers और companies असली devices को परखने के लिए इस्तेमाल करते हैं: **mirror circuits**। किसी depth का random circuit U बनाओ, फिर उसका सटीक उलटा U† लगाओ। Ideally U†U = I, तो qubits को |00…0⟩ पर लौटना चाहिए। कोई भी भटकाव errors से होता है। Depth बढ़ने पर सफलता दर कैसे गिरती है, यह नापना उस machine पर gates की हर परत की क़ीमत बताता है।

दो बारीकियाँ मायने रखती हैं, और दोनों पहले के पाठों से हैं। पहली, U और U† के बीच एक **barrier** transpiler (पाठ 40) को उन्हें रद्द करने से रोकता है, जो प्रयोग को बेमानी बना देता। दूसरी, हम गिरावट को एक सरल exponential model से fit करते हैं, जैसे पाठ 48 के randomised benchmarking में। यहाँ यह 5-qubit device के noisy model पर है:

```python
import numpy as np
from scipy.optimize import curve_fit
from qiskit import QuantumCircuit
from qiskit.circuit.library import CXGate
from qiskit.providers.fake_provider import GenericBackendV2
from qiskit.transpiler import CouplingMap
from qiskit.transpiler.preset_passmanagers import generate_preset_pass_manager
from qiskit_aer import AerSimulator

backend = GenericBackendV2(num_qubits=5, coupling_map=CouplingMap.from_line(5),
                           basis_gates=["cz", "rz", "sx", "x"], seed=42)
sim = AerSimulator.from_backend(backend, seed_simulator=3)
pm = generate_preset_pass_manager(backend=backend, optimization_level=1, seed_transpiler=1)
rng = np.random.default_rng(2)

def mirror_circuit(n, layers):
    """Random layers U, then their exact inverse U†: ideally the qubits return to |00...0⟩."""
    U = QuantumCircuit(n)
    for _ in range(layers):
        for q in range(n):
            U.rx(rng.uniform(0, 2 * np.pi), q); U.rz(rng.uniform(0, 2 * np.pi), q)
        start = rng.integers(2)
        for q in range(start, n - 1, 2):
            U.cx(q, q + 1)
    qc = U.copy()
    qc.barrier()            # stops the transpiler cancelling U against U†: we want the hardware to do the work
    qc.compose(U.inverse(), inplace=True)
    qc.measure_all()
    return qc

n, shots = 4, 2000
depths = [1, 2, 4, 6, 8, 12, 16]
success = []
for L in depths:
    circs = pm.run([mirror_circuit(n, L) for _ in range(5)])        # 5 random circuits per depth
    results = sim.run(circs, shots=shots).result()
    success.append(np.mean([results.get_counts(k).get("0" * n, 0) / shots for k in range(5)]))
    print(f"depth {L:2d} (×2 for the mirror): success {success[-1]:.3f}")

model = lambda L, A, f: A * f ** (2 * L)                                # each layer (and its mirror) keeps fraction f
(A, f), _ = curve_fit(model, depths, success, p0=[1.0, 0.98])
print(f"\nfitted: about {100 * (1 - f):.1f}% of the success is lost per layer of {n} qubits")
```

```text
depth  1 (×2 for the mirror): success 0.976
depth  2 (×2 for the mirror): success 0.963
depth  4 (×2 for the mirror): success 0.921
depth  6 (×2 for the mirror): success 0.887
depth  8 (×2 for the mirror): success 0.868
depth 12 (×2 for the mirror): success 0.813
depth 16 (×2 for the mirror): success 0.757

fitted: about 0.8% of the success is lost per layer of 4 qubits
```

Depth बढ़ने पर सफलता दर 98% से 76% तक गिरती है, और fit कहता है कि हर परत (चार qubits के random rotations और CNOTs की एक पंक्ति, आगे और पीछे लगाई) सफलता की संभावना का लगभग 0.8% ख़र्च करती है। यह एक संख्या आपके जैसे circuits के लिए device की व्यावहारिक गुणवत्ता का सार है: इससे आप अनुमान लगा सकते हैं कि 50-परत वाला circuit सिर्फ़ लगभग 0.992¹⁰⁰ ≈ 45% समय सफल होगा, और तय कर सकते हैं कि error mitigation (पाठ 36) अतिरिक्त shots के लायक़ है या नहीं।

### इसे असली quantum computer पर चलाना

वही code तीन बदलावों के साथ IBM hardware पर चलता है (setup पाठ 40 में है):

```py
from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2 as Sampler

service = QiskitRuntimeService()
backend = service.least_busy(operational=True, simulator=False)   # 1. a real device
pm = generate_preset_pass_manager(backend=backend, optimization_level=1, seed_transpiler=1)
sampler = Sampler(mode=backend)                                    # 2. the runtime Sampler

circs = pm.run([mirror_circuit(n, L) for L in depths for _ in range(5)])
job = sampler.run(circs, shots=2000)                               # 3. one job for everything
print(job.job_id())                                                # fetch later with service.job(id)
```

सारे circuits **एक job** में भेजने से queue का समय बचता है। हर circuit k के counts `job.result()[k].data.meas.get_counts()` से पढ़ें, और पहले की तरह ही fit करें।

### इसे असली project में बढ़ाएँ

- **Devices या qubits की तुलना:** दो अलग backends पर, या एक device के सबसे अच्छे और सबसे बुरे qubits पर चलाएँ (`initial_layout` से चुनें)।
- **Mitigation परखें:** `sampler.options.dynamical_decoupling.enable = True` के साथ और twirling के साथ दोहराएँ, और हर परत के error में बदलाव नापें।
- **Calibration data से तुलना:** device के बताए gate errors (पाठ 40) से हर परत के error का अनुमान लगाएँ और नापे हुए से तुलना करें। क्या वे मेल खाते हैं? अगर नहीं, तो क्यों?
- **लिखें:** अपना तरीका, plots, अनिश्चितताओं के साथ fit की संख्याएँ, और ईमानदार चर्चा वाली एक छोटी report, ठीक जैसे पाठ 48 बताता है।

यह एक सच्चा, प्रकाशन-स्तर का छात्र project है, और ठीक उस क़िस्म का सबूत जो अलग दिखता है।

## Portfolio बनाएँ

Certificates दिखाते हैं कि आप किसी चीज़ में शामिल हुए। **Portfolio** दिखाता है कि आप क्या कर सकते हैं। इसे सबके सामने बनाएँ, GitHub या निजी website पर:

1. **Course notebooks:** मुख्य पाठों के अपने रूप (teleportation, Grover, phase estimation, एक stabilizer code, H₂ के लिए VQE), हर एक के साथ नतीजा अपने शब्दों में समझाता छोटा README।
2. **एक मौलिक project**, जैसे ऊपर का capstone, या: simulator बनाम hardware पर Grover; decoder के साथ Steane code; जासूस और finite-key असर के साथ QKD simulation; microcontroller पर post-quantum signature।
3. **लिखना:** शुरुआती लोगों के लिए विचारों की छोटी व्याख्याएँ। पढ़ाना आपकी अपनी समझ की कमियाँ किसी भी चीज़ से तेज़ खोलता है, और यह संवाद कौशल का दिखने वाला सबूत है।
4. **Open source:** Qiskit, Stim, Mitiq या दूसरी परियोजनाओं में documentation सुधार और छोटे issues का स्वागत है, और maintainers अच्छे योगदानकर्ताओं को देखते हैं।
5. **Events:** hackathons, IBM Quantum challenges, विश्वविद्यालयों में Qiskit Fall Fest events, और quantum summer schools वह जगह हैं जहाँ आप लोगों से मिलते हैं और नज़र में आते हैं।

## 12 महीने की योजना

| महीने | ध्यान | ठोस लक्ष्य |
|---|---|---|
| 1–2 | नींव मज़बूत करना | Parts A–C के Try-it अभ्यास फिर करें; linear algebra और probability मज़बूत करें (इस site का Course 2 मदद करेगा) |
| 3–4 | Coding में प्रवाह | Parts D–E अपने notebooks में फिर बनाएँ; NumPy और Qiskit ठीक से सीखें |
| 5–6 | दिशा चुनना | अपने चुने रास्ते के reviews और पाठ पढ़ें (नीचे की table); एक मौलिक project शुरू करें |
| 7–8 | Hardware अनुभव | Capstone और अपना project असली hardware पर चलाएँ; नतीजे लिखें |
| 9–10 | गहराई में जाना | Nielsen और Chuang के अध्याय, कोई NPTEL course, या IBM के learning paths पूरे करें; इस site का Course 3 लें |
| 11–12 | दिखाना और आवेदन | अपना portfolio प्रकाशित करें; internships, research projects या नौकरियों के लिए आवेदन करें; open source में योगदान दें |

एक साल तक रोज़ एक घंटा उस स्तर तक पहुँचने के लिए काफ़ी है जहाँ आप सार्थक योगदान दे सकें, ख़ास तौर पर अगर आप quantum को उस field से जोड़ें जिसे आप पहले से जानते हैं।

## दिशा चुनें

| रास्ता | मुख्य skills | महारत के लिए course पाठ | आम अगला क़दम |
|---|---|---|---|
| Quantum software | Python, linear algebra, compilers, Qiskit | 17–20, 40 | Open-source योगदान, software internships |
| Algorithms और research | मज़बूत गणित और physics, papers पढ़ना | 22–31, 45–46, 48 | MSc या PhD, research internships |
| Hardware और control | Electronics, RF, FPGA, embedded systems, cryogenics | 32, 37–40 | Lab काम, control-stack projects (जैसे QICK जैसे खुले FPGA-आधारित qubit controllers) |
| Error correction | Codes, decoders, high-performance computing | 33–36 | Stim और PyMatching के साथ decoder projects; research |
| Security और PQC | Cryptography, networking, सुरक्षित firmware | 41, 43 | असली systems को post-quantum cryptography पर ले जाना |
| Sensing और photonics | Optics, lasers, कम-noise electronics | 39, 41, 42, 44 | Instrumentation labs, sensing startups |
| इस्तेमाल | Chemistry, materials, finance या logistics, और quantum | 29, 45, 46 | Industry research teams, consulting |

अगर आप पहले से काम कर रहे हैं, तो अपनी मौजूदा नौकरी और quantum के बीच का **पुल** ढूँढें: firmware engineer control systems या devices पर PQC में जा सकता है; data scientist quantum algorithms और benchmarking में; chemist quantum chemistry में। पाठ 47 इन भूमिकाओं का और विस्तार से नक़्शा देता है।

## भारत और online संसाधन

- **NPTEL** quantum mechanics, quantum computing और quantum information पर मुफ़्त IIT courses देता है, वैकल्पिक certificates के साथ।
- **National Quantum Mission के चार hubs** (IISc Bengaluru, IIT Madras, IIT Bombay, IIT Delhi) और उनके साझेदार संस्थान research projects, schools और internships चलाते हैं; उनकी websites और DST घोषणाएँ देखते रहें (पाठ 47)।
- **IBM Quantum Learning** और **Qiskit documentation** मुफ़्त courses और tutorials देते हैं जो असली hardware पर चलते हैं; इस site का Course 3 उन्हें English और हिन्दी में समझाएगा।
- **इस course में इस्तेमाल open-source tools:** Qiskit, Qiskit Aer, Stim, PyMatching और Mitiq, सब मुफ़्त।
- **किताबें:** मानक reference के रूप में *Quantum Computation and Quantum Information* (Nielsen और Chuang); व्यावहारिक नज़रिए के लिए *Quantum Computing: An Applied Approach* (Hidary); बड़े विचारों के लिए *Quantum Computing Since Democritus* (Aaronson)।
- **यह site:** Course 2 (Foundations) और Course 3 (IBM Quantum series) तैयार हो रहे हैं, और Lab, Glossary और Explainers किसी भी विचार को दोबारा देखने के लिए यहाँ हैं।

## आख़िरी बात

Quantum technology अभी जवान है। Machines noisy हैं, काम के इस्तेमाल अभी उभरने शुरू हुए हैं, और बहुत सा hype फीका पड़ जाएगा। लेकिन बुनियादी विज्ञान असली है, error correction में प्रगति सच्ची है, और field को जितने लोग हैं उससे कहीं ज़्यादा चाहिए: ऐसे लोग जो वादा और सीमाएँ दोनों समझें, जो बना सकें, परख सकें और समझा सकें। अगर आपने ये पाठ पूरे किए हैं, तो आप पहले से उनमें से एक हैं। चलते रहें, कुछ बनाएँ, जो सीखें वह बाँटें, और Kota को, और भारत को, ऐसी जगह बनाने में मदद करें जहाँ quantum technology सीखी और बनाई जाती है।

## आज़माकर देखें

1. Mirror circuit में U और U† के बीच barrier क्यों होना चाहिए?
2. हर परत पर 0.8% के fit मान से, हर तरफ़ 25 परतों वाले mirror circuit की सफलता दर का अनुमान लगाएँ।
3. असली hardware पर किसी प्रयोग के सारे circuits एक job में क्यों भेजें?
4. Capstone को मौलिक project में बढ़ाने के दो तरीके बताएँ।
5. Certificate और portfolio में क्या अंतर है, और employers दूसरे को ज़्यादा महत्व क्यों देते हैं?
6. Table की कौन-सी दिशा आप पर सबसे ज़्यादा फ़िट होती है, और आप पहले कौन-से तीन पाठ दोहराएँगे?

**जवाब:**

1. इसके बिना transpiler पहचान सकता है कि U†U = I और पूरा circuit रद्द कर सकता है, तो आप hardware के errors के बारे में कुछ नहीं नापेंगे।
2. हर परत सफलता का लगभग 0.992 रखती है, 2 × 25 = 50 बार लगाई: 0.992⁵⁰ ≈ **0.67**, लगभग 67% (छोटे offset A से गुणा)।
3. हर job queue में अलग इंतज़ार करता है; एक job मतलब एक इंतज़ार, और सारे circuits एक ही calibration में चलते हैं, जो नतीजों को तुलना योग्य बनाता है।
4. जैसे: दो devices या qubit sets की तुलना; dynamical decoupling या twirling का असर परखना; नापे हर परत के error की device के calibration data से तुलना; ज़्यादा qubits तक बढ़ाना।
5. Certificate दिखाता है कि आपने कुछ पूरा किया; portfolio दिखाता है कि आप असल में क्या कर सकते हैं, code, नतीजों और व्याख्याओं के साथ जिन्हें कोई भी जाँच सकता है।
6. यह आप पर निर्भर है। जैसे एक embedded engineer hardware और control चुन सकता है, पाठ 32, 38 और 40 दोहराते हुए।

## सार-सूत्र

| विचार | सूत्र या तथ्य |
|---|---|
| Mirror circuit | U फिर U†; ideal नतीजा \|00…0⟩; errors सफलता दर घटाते हैं |
| Barrier | Transpiler को U और U† रद्द करने से रोकता है |
| Fit | सफलता ≈ A·f^(2L); हर परत पर नुक़सान = 1 − f |
| अनुमान | कई परतों पर सफलता ≈ f^(कुल परतें) |
| Hardware पर | Runtime Sampler और असली backend लगाओ; सारे circuits एक job में |
| Portfolio | Notebooks, एक मौलिक project, लिखना, open source, events |
| 12 महीने की योजना | नींव → coding → दिशा → hardware → गहराई → आवेदन |
| दिशाएँ | Software, algorithms, hardware और control, QEC, security, sensing, इस्तेमाल |
| संसाधन | NPTEL, NQM hubs, IBM Quantum Learning, Qiskit, Stim, Nielsen और Chuang |
| इस site पर आगे | Course 2: Foundations; Course 3: IBM Quantum series |
