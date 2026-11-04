---
layout: ../../../layouts/Post.astro
lang: hi
title: "Transpiling और hardware पर चलाना"
description: "आपके circuit और असली chip के बीच क्या होता है। Native gates और मानक gates उनमें कैसे बदले जाते हैं, सीमित coupling map पर layout और routing (और जगह चुनना क्यों मायने रखता है), noisy simulated device पर optimisation levels की तुलना, observables को physical qubits पर ले जाना, device का calibration data पढ़ना, और IBM Quantum hardware पर मुफ़्त चलाने का पूरा, क़दम-दर-क़दम workflow।"
date: 2026-11-04
category: lesson
lesson: 40
---

इस course में आपने जो circuits लिखे वे सुविधाजनक gates (H, CNOT, Toffoli, QFT) ऐसे qubits पर इस्तेमाल करते हैं जो सब एक-दूसरे से बात कर सकते हैं। असली hardware ज़्यादा नख़रेबाज़ है। वह **native gates** की छोटी सूची देता है, और qubits की सिर्फ़ कुछ जोड़ियाँ physically जुड़ी होती हैं। Circuit चलने से पहले उसे chip के हिसाब से फिर लिखना होता है: इस प्रक्रिया को **transpiling** कहते हैं ("translating" और "compiling" का मेल)।

Transpiling सिर्फ़ औपचारिकता नहीं। Noisy machine पर अच्छी तरह transpile किया circuit साफ़ सही जवाब दे सकता है जहाँ उसी circuit का बुरी तरह transpile किया रूप noise देता है। यह पाठ दिखाता है कि transpiler क्या करता है, क़दम-दर-क़दम, असली जैसे errors वाले simulated device पर, और फिर अपने circuits असली IBM quantum computers पर चलाने का पूरा रास्ता बताता है।

## Transpiler को device कैसा दिखता है

Qiskit किसी device को एक **target** से बताता है: उसके native gates, हर two-qubit gate किन qubit जोड़ियों पर चलता है (**coupling map**), और हर operation का नापा error rate और समय। Qiskit में एक configurable नक़ली device, `GenericBackendV2`, है, जिसे हम पूरे पाठ में इस्तेमाल करेंगे। यहाँ एक 7-qubit device है जिसके qubits एक कतार में हैं और IBM जैसे native gates हैं:

```python
from qiskit import QuantumCircuit
from qiskit.providers.fake_provider import GenericBackendV2
from qiskit.transpiler import CouplingMap

# A pretend 7-qubit device: qubits in a line, IBM-style native gates
backend = GenericBackendV2(num_qubits=7, coupling_map=CouplingMap.from_line(7),
                           basis_gates=["cz", "rz", "sx", "x"], seed=42)
print("native gates:", sorted(backend.operation_names))
print("connections: ", list(backend.coupling_map.get_edges())[:6], "...")
props = backend.qubit_properties(0)
print(f"qubit 0: T1 = {props.t1 * 1e6:.0f} µs, T2 = {props.t2 * 1e6:.0f} µs")
print(f"CZ on (0, 1): error {backend.target['cz'][(0, 1)].error:.4f}, duration {backend.target['cz'][(0, 1)].duration * 1e9:.0f} ns")
print(f"SX on 0:      error {backend.target['sx'][(0,)].error:.5f}, duration {backend.target['sx'][(0,)].duration * 1e9:.0f} ns")
```

```text
native gates: ['cz', 'delay', 'measure', 'reset', 'rz', 'sx', 'x']
connections:  [(0, 1), (1, 0), (1, 2), (2, 1), (2, 3), (3, 2)] ...
qubit 0: T1 = 177 µs, T2 = 144 µs
CZ on (0, 1): error 0.0049, duration 371 ns
SX on 0:      error 0.00009, duration 54 ns
```

यह device सिर्फ़ चार क़िस्म के gates कर सकता है: पड़ोसियों के बीच CZ, RZ (कोई भी Z rotation), SX (X का square root, 90° X rotation), और X। हर qubit का अपना T1 और T2 है, और हर gate का अपना error rate और समय, बिल्कुल असली calibration report की तरह। Two-qubit CZ, SX से लगभग 50 गुना ज़्यादा error वाला और 7 गुना धीमा है, जो आम है।

इतना छोटा gate set क्यों? क्योंकि हर native gate को एक physical pulse के रूप में अलग से calibrate करना होता है (पाठ 38)। RZ मुफ़्त है (एक virtual phase बदलाव), SX और X calibrate किए pulses हैं, और एक entangling gate काफ़ी है, क्योंकि हर circuit इनसे बन सकता है (पाठ 17)।

## क़दम 1: native gates में अनुवाद

सबसे सरल काम हर gate को native gates में फिर लिखना है। यहाँ इस device के लिए अनुवादित Bell-state circuit है:

```python
from qiskit import QuantumCircuit, transpile
from qiskit.quantum_info import Operator

qc = QuantumCircuit(2)
qc.h(0)
qc.cx(0, 1)

native = transpile(qc, basis_gates=["cz", "rz", "sx", "x"], optimization_level=1)
print("\n".join(line.rstrip() for line in str(native.draw(output="text")).splitlines()))
print("same operation as the original:", Operator(native).equiv(Operator(qc)))
```

```text
global phase: 3π/4
     ┌─────────┐┌────┐┌─────────┐
q_0: ┤ Rz(π/2) ├┤ √X ├┤ Rz(π/2) ├─■─────────────────────────────
     ├─────────┤├────┤├─────────┤ │ ┌─────────┐┌────┐┌─────────┐
q_1: ┤ Rz(π/2) ├┤ √X ├┤ Rz(π/2) ├─■─┤ Rz(π/2) ├┤ √X ├┤ Rz(π/2) ├
     └─────────┘└────┘└─────────┘   └─────────┘└────┘└─────────┘
same operation as the original: True
```

Hadamard बना RZ(π/2)·SX·RZ(π/2), और CNOT बना target पर Hadamard जैसे rotations के साथ एक CZ (क्योंकि CNOT = (I⊗H)·CZ·(I⊗H))। 3π/4 के global phase का कोई physical असर नहीं (पाठ 10)। जाँच पक्का करती है कि अनुवादित circuit ठीक वही unitary है। ध्यान दें कि hardware पर RZs की कोई क़ीमत नहीं; असली क़ीमत यहाँ qubit 1 पर दो SX pulses, qubit 0 पर एक, और एक CZ है।

## क़दम 2: layout और routing

अगला, transpiler को तय करना है कि आपके circuit के हर **virtual** qubit के लिए कौन-सा **physical** qubit इस्तेमाल होगा (**layout**), और फिर उन qubits के बीच के two-qubit gates ठीक करने हैं जो पड़ोसी नहीं (**routing**)। Routing quantum states को एक-दूसरे के पास लाने के लिए **SWAP** gates डालता है, और हर SWAP की क़ीमत तीन CNOTs है, तो यह महँगा है।

देखें सिर्फ़ layout हमारे कतार-आकार device पर, virtual qubits 0 और 2 के बीच एक CNOT वाले circuit के लिए क्या करता है:

```python
from qiskit import QuantumCircuit
from qiskit.providers.fake_provider import GenericBackendV2
from qiskit.transpiler import CouplingMap
from qiskit.transpiler.preset_passmanagers import generate_preset_pass_manager

backend = GenericBackendV2(num_qubits=7, coupling_map=CouplingMap.from_line(7),
                           basis_gates=["cz", "rz", "sx", "x"], seed=42)

qc = QuantumCircuit(3)
qc.h(0)
qc.cx(0, 2)                      # needs virtual qubits 0 and 2 to be next to each other

for layout in [[0, 1, 2], [1, 0, 2]]:
    pm = generate_preset_pass_manager(backend=backend, optimization_level=0, initial_layout=layout)
    out = pm.run(qc)
    ops = out.count_ops()
    print(f"virtual qubits placed on physical {layout}:  CZ gates = {ops.get('cz', 0)},  "
          f"swaps needed = {'yes' if ops.get('cz', 0) > 1 else 'no'}")
```

```text
virtual qubits placed on physical [0, 1, 2]:  CZ gates = 4,  swaps needed = yes
virtual qubits placed on physical [1, 0, 2]:  CZ gates = 1,  swaps needed = no
```

बिना सोचे physical qubits 0, 1, 2 पर रखने पर virtual qubits 0 और 2 पड़ोसी नहीं, तो transpiler को SWAP डालना पड़ता है: 1 के बजाय 4 CZs। Physical 1, 0, 2 पर रखने पर वे पड़ोसी हैं और कुछ अतिरिक्त नहीं चाहिए। बड़े circuit के लिए अच्छा layout ढूँढना कठिन optimisation समस्या है (यह graph isomorphism से जुड़ी है), और Qiskit तेज़ heuristics इस्तेमाल करता है: **VF2Layout** बिना SWAPs वाली perfect जगह ढूँढता है, और **SabreLayout** और **SabreSwap** कम SWAPs वाली जगहें और swap क्रम खोजते हैं, कई random शुरुआती बिंदुओं से।

अच्छे layouts **noise-aware** भी होते हैं: चुनाव हो तो transpiler device के calibration data से कम error rates वाले qubits और connections पसंद करता है।

## क़दम 3: optimise करना

आख़िर में transpiler सरल बनाता है: लगातार single-qubit gates को एक में मिलाना, एक-दूसरे को उलटने वाले gates (जैसे लगातार दो CNOTs) हटाना, और two-qubit gates के छोटे blocks को ज़्यादा कुशलता से फिर बनाना। Qiskit यह सब **optimisation levels** 0 से 3 में बाँधता है। ऊँचे levels ज़्यादा कोशिश करते हैं और compile होने में ज़्यादा समय लेते हैं।

यहाँ पाठ 22 का Bernstein–Vazirani circuit है, 6-bit secret के साथ। कतार-आकार device पर यह अटपटा है, क्योंकि secret के हर 1 को उसी ancilla qubit से एक CNOT चाहिए। हम इसे हर level पर transpile करते हैं और ऐसे simulator पर चलाते हैं जो device के अपने error rates इस्तेमाल करता है:

```python
from qiskit import QuantumCircuit
from qiskit.providers.fake_provider import GenericBackendV2
from qiskit.transpiler import CouplingMap
from qiskit.transpiler.preset_passmanagers import generate_preset_pass_manager
from qiskit_aer import AerSimulator

backend = GenericBackendV2(num_qubits=7, coupling_map=CouplingMap.from_line(7),
                           basis_gates=["cz", "rz", "sx", "x"], seed=42)
noisy_sim = AerSimulator.from_backend(backend, seed_simulator=7)     # uses the backend's error rates

secret = "101101"                                 # Bernstein–Vazirani (Lesson 22): find this in one query
n = len(secret)
bv = QuantumCircuit(n + 1, n)
bv.x(n); bv.h(range(n + 1))
for i, bit in enumerate(reversed(secret)):
    if bit == "1":
        bv.cx(i, n)                               # every 1 in the secret talks to the same ancilla
bv.h(range(n))
bv.measure(range(n), range(n))

print("level   CZ gates   depth   chance of reading the secret")
for level in [0, 1, 2, 3]:
    pm = generate_preset_pass_manager(backend=backend, optimization_level=level, seed_transpiler=1)
    isa = pm.run(bv)
    counts = noisy_sim.run(isa, shots=4000).result().get_counts()
    print(f"  {level}       {isa.count_ops().get('cz', 0):3d}      {isa.depth():4d}          {counts.get(secret, 0) / 4000:.3f}")
print("level 3 put the 7 circuit qubits on physical qubits:", isa.layout.final_index_layout())
```

```text
level   CZ gates   depth   chance of reading the secret
  0        28        66          0.850
  1        10        33          0.944
  2        10        31          0.946
  3        10        29          0.947
level 3 put the 7 circuit qubits on physical qubits: [1, 0, 3, 2, 6, 5, 4]
```

Level 0 सिर्फ़ उतना करता है जितना बिल्कुल ज़रूरी: सीधा layout और सरल routing, जिससे 28 CZs और 66 की depth बनती है, और noisy device 85% समय secret ढूँढता है। Levels 1 से 3 कहीं बेहतर layout चुनते हैं और नतीजे को सरल बनाते हैं, आधी से कम depth पर सिर्फ़ 10 CZs इस्तेमाल करते हुए, और सफलता दर लगभग 95% तक बढ़ती है। वही algorithm, वही hardware, सिर्फ़ बेहतर compiling से **लगभग एक तिहाई errors**।

आख़िरी पंक्ति दिखाती है कि circuit का हर qubit chip पर कहाँ पहुँचा। क्योंकि routing SWAPs से quantum states को इधर-उधर ले जाता है, यह अंतिम जगह बिखरे क्रम में है, और transpiler इसका हिसाब रखता है ताकि measurement नतीजे सही qubits के लिए बताए जाएँ।

व्यवहार में, hardware पर चलाने वाली लगभग हर चीज़ के लिए **optimisation level 3** (या level 2, हाल के Qiskit versions का default) सही चुनाव है।

## क़दम 4 (अक्सर): scheduling और timing

Optimisation के बाद hardware-तैयार circuit को **schedule** भी किया जा सकता है: हर gate को शुरू होने का समय मिलता है, और ख़ाली अवधियाँ साफ़ **delays** के रूप में दिखती हैं। यहीं ख़ाली अंतरालों में **dynamical decoupling** pulses डाले जाते हैं (पाठ 36), और controller जाँचता है कि सब कुछ hardware के timing नियमों में फ़िट है। IBM की runtime service एक option से यह आपके लिए कर सकती है, जैसा आप नीचे देखेंगे।

## Observables को layout के साथ चलना चाहिए

अगर आप expectation values नापने के लिए **Estimator** इस्तेमाल करें (पाठ 19), तो एक और क़दम है। आपका observable circuit के virtual qubits के लिए लिखा है। Layout के बाद वे qubits दूसरे physical qubits पर रहते हैं, तो observable को भी `apply_layout` से खिसकाना होगा:

```python
from qiskit import QuantumCircuit
from qiskit.primitives import BackendEstimatorV2
from qiskit.providers.fake_provider import GenericBackendV2
from qiskit.quantum_info import SparsePauliOp
from qiskit.transpiler import CouplingMap
from qiskit.transpiler.preset_passmanagers import generate_preset_pass_manager
from qiskit_aer import AerSimulator

backend = GenericBackendV2(num_qubits=7, coupling_map=CouplingMap.from_line(7),
                           basis_gates=["cz", "rz", "sx", "x"], seed=42)

ghz = QuantumCircuit(4)
ghz.h(0); ghz.cx(0, 1); ghz.cx(1, 2); ghz.cx(2, 3)
observables = SparsePauliOp(["ZZII", "IIZZ", "XXXX"])     # ideal values: 1, 1, 1

pm = generate_preset_pass_manager(backend=backend, optimization_level=3, seed_transpiler=1)
isa = pm.run(ghz)
isa_obs = [SparsePauliOp(p).apply_layout(isa.layout) for p in observables.paulis.to_labels()]
print("observables after layout:", [o.paulis.to_labels()[0] for o in isa_obs])

estimator = BackendEstimatorV2(backend=AerSimulator.from_backend(backend, seed_simulator=3),
                               options={"default_precision": 0.01, "seed_simulator": 3})
result = estimator.run([(isa, isa_obs)]).result()[0]
for label, value, err in zip(observables.paulis.to_labels(), result.data.evs, result.data.stds):
    print(f"⟨{label}⟩ = {value:.3f} ± {err:.3f}   (ideal 1)")
```

```text
observables after layout: ['IIIIZZI', 'IIZZIII', 'IIXXXXI']
⟨ZZII⟩ = 0.988 ± 0.002   (ideal 1)
⟨IIZZ⟩ = 0.977 ± 0.002   (ideal 1)
⟨XXXX⟩ = 0.963 ± 0.003   (ideal 1)
```

4-qubit observables 7-qubit observables बन गए जो transpiler के चुने physical qubits पर काम करते हैं। यह क़दम भूलना simulator से hardware पर जाते समय सबसे आम ग़लतियों में से एक है: Estimator ग़लत qubits नापता। नतीजे 1 की ideal क़ीमत के पास हैं लेकिन बराबर नहीं, क्योंकि simulated device noisy है। X-type observable सबसे ज़्यादा प्रभावित है, क्योंकि वह |0000⟩ और |1111⟩ के बीच के नाज़ुक phase पर निर्भर है।

## असली IBM hardware पर चलाना

ऊपर का सब कुछ local चलता है। असली quantum computer पर चलाने के लिए IBM अपनी **Open Plan** से मुफ़्त पहुँच देता है, जिसमें लिखते समय **हर 28 दिन में लगभग 10 minutes का quantum processor समय** शामिल है। कई छोटे प्रयोगों के लिए यह काफ़ी है: आम छोटा job कुछ seconds लेता है।

### एक बार का setup

1. **quantum.cloud.ibm.com** (IBM Quantum Platform) पर मुफ़्त account बनाएँ।
2. Dashboard पर एक **API key** बनाएँ, और अपने **instance** का नाम या CRN लिख लें।
3. Runtime client install करें: `pip install qiskit-ibm-runtime`।
4. अपने computer पर credentials एक बार save करें (अपनी API key कभी उस code में न डालें जिसे आप साझा या upload करते हैं):

```py
from qiskit_ibm_runtime import QiskitRuntimeService

QiskitRuntimeService.save_account(
    channel="ibm_quantum_platform",
    token="PASTE_YOUR_API_KEY_HERE",       # keep this private
    instance="PASTE_YOUR_INSTANCE_CRN_OR_NAME",
    set_as_default=True,
)
```

### Circuit चलाना

यह पूरा pattern है: device चुनो, उसके लिए transpile करो, Sampler से चलाओ, counts पढ़ो।

```py
from qiskit import QuantumCircuit
from qiskit.transpiler.preset_passmanagers import generate_preset_pass_manager
from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2 as Sampler

service = QiskitRuntimeService()
backend = service.least_busy(operational=True, simulator=False)   # a real device with a short queue
print("running on", backend.name, "with", backend.num_qubits, "qubits")

bell = QuantumCircuit(2)
bell.h(0)
bell.cx(0, 1)
bell.measure_all()

pm = generate_preset_pass_manager(backend=backend, optimization_level=3)
isa = pm.run(bell)                         # "ISA circuit": uses only this device's native gates and links

sampler = Sampler(mode=backend)
sampler.options.default_shots = 4000
sampler.options.dynamical_decoupling.enable = True      # protect idle qubits (Lesson 36)
sampler.options.twirling.enable_gates = True            # Pauli twirling (Lesson 36)

job = sampler.run([isa])
print("job id:", job.job_id())             # save this: you can fetch the result later with service.job(id)
counts = job.result()[0].data.meas.get_counts()
print(counts)
```

आपको ज़्यादातर `00` और `11` दिखने चाहिए, noise से कुछ प्रतिशत `01` और `10` के साथ, बिल्कुल इस course के noisy simulations की तरह। Device ख़ाली होने तक job एक **queue** में इंतज़ार करता है, जिसमें seconds या घंटे लग सकते हैं। आप laptop बंद करके बाद में job id से नतीजा ले सकते हैं।

### Error mitigation के साथ Estimator चलाना

Expectation values के लिए Estimator इस्तेमाल करें और IBM की runtime को error mitigation लगाने दें। Observables को layout पर ले जाना याद रखें:

```py
from qiskit.quantum_info import SparsePauliOp
from qiskit_ibm_runtime import EstimatorV2 as Estimator

ghz = QuantumCircuit(3)
ghz.h(0); ghz.cx(0, 1); ghz.cx(1, 2)
observables = [SparsePauliOp("ZZI"), SparsePauliOp("XXX")]

isa = pm.run(ghz)
isa_obs = [o.apply_layout(isa.layout) for o in observables]

estimator = Estimator(mode=backend)
estimator.options.resilience_level = 2    # readout mitigation + zero-noise extrapolation (Lesson 36)
result = estimator.run([(isa, isa_obs)]).result()[0]
print("values:", result.data.evs, "uncertainties:", result.data.stds)
```

### अपने minutes ख़र्च करने से पहले जाँचना

असली hardware समय इस्तेमाल करने से पहले ठीक वही code एक local **fake backend** पर चलाएँ जो किसी असली device का layout और calibration copy करता है (`qiskit_ibm_runtime.fake_provider` में, जैसे `FakeBrisbane`), उसे `mode` के रूप में देकर। तब Runtime के primitives उस device के noise के साथ local simulate करते हैं। नतीजे समझ में आएँ तो `mode` को असली backend पर बदल दें। यह आदत समय और quota दोनों बचाती है।

### Execution modes

Jobs तीन modes में चल सकते हैं। **Job mode** (ऊपर जैसा) एक बार में एक job चलाता है। **Batch mode** बेहतर throughput के लिए कई स्वतंत्र jobs साथ भेजता है। **Session mode** एक-दूसरे पर निर्भर jobs की श्रृंखला के लिए device आरक्षित करता है, जैसे VQE का optimisation loop (पाठ 30), ताकि हर iteration फिर queue में न लगे। Sessions हर plan पर उपलब्ध नहीं।

## Hardware runs के लिए checklist

1. **पहले simulate करो**, अच्छा हो तो target device के noise model के साथ।
2. **Circuits उथले रखो।** हर two-qubit gate लगभग 0.1 से 1% fidelity लेता है (पाठ 32)। Transpile के बाद `count_ops()` और `depth()` देखो।
3. **ख़ास backend के लिए optimisation level 2 या 3 से transpile करो**, और देखो कितने SWAPs जुड़े।
4. Estimator इस्तेमाल करते समय `apply_layout` से **observables ले जाओ**।
5. चाही सटीकता के लिए **काफ़ी shots** इस्तेमाल करो: सांख्यिकीय error 1/√shots की तरह घटता है (पाठ 20)।
6. **Mitigation चालू करो** (dynamical decoupling, twirling, resilience levels) और उसके साथ और बिना तुलना करो।
7. **सब कुछ दर्ज करो:** backend का नाम, तारीख़, job id, transpiled depth। Calibrations रोज़ बदलते हैं, तो नतीजे खिसकते हैं।
8. **ईमानदारी से समझो:** ideal simulation से तुलना करो, और noise छिपाने के बजाय बताओ।

पाठ 49 इस पर hands-on hardware project और आगे पढ़ाई के रास्ते के साथ बनाता है।

## आज़माकर देखें

1. उदाहरण device के चार native gates बताएँ। असली hardware पर कौन-सा कोई समय नहीं लेता?
2. SWAP की क़ीमत तीन two-qubit gates क्यों है, और इससे routing महँगा क्यों होता है?
3. Layout उदाहरण में virtual qubits को physical qubits 1, 0, 2 पर रखने से SWAP क्यों नहीं लगा?
4. Optimisation levels 0 और 3 के बीच Bernstein–Vazirani के CZ gates की संख्या कैसे बदली, और सफलता दर का क्या हुआ?
5. आप circuit transpile करते हैं और फिर `apply_layout` छोड़कर अपने मूल observables के साथ Estimator चलाते हैं। क्या ग़लत होता है?
6. अपनी API key को साझा किए जाने वाले notebook में सीधे क्यों नहीं डालना चाहिए?
7. Job mode के बजाय session mode कब चुनेंगे?

**जवाब:**

1. CZ, RZ, SX और X। **RZ** virtual है: control software में phase update, कोई समय नहीं।
2. SWAP = तीन CNOTs (CNOT(a,b)·CNOT(b,a)·CNOT(a,b)), और हर CNOT को एक native two-qubit gate चाहिए। Two-qubit gates सबसे धीमे और सबसे ज़्यादा error वाले operations हैं, तो हर SWAP लगभग तीन two-qubit errors जोड़ता है।
3. Virtual qubit 0, physical 1 पर गया और virtual qubit 2, physical 2 पर। कतार पर physical 1 और 2 पड़ोसी हैं, तो CNOT सीधे एक CZ (और single-qubit gates) बन जाता है।
4. **28 से 10** CZs (और depth 66 से 29); सफलता दर लगभग **85% से 95%** तक बढ़ी।
5. Observables ग़लत physical qubits पर काम करते (layout ने circuit के qubits खिसका दिए), तो नापी क़ीमतें बेमानी होतीं।
6. Key वाला कोई भी आपका account और quota इस्तेमाल कर सकता है। उसे अपनी machine पर `save_account` से एक बार save करें, या environment variables इस्तेमाल करें, और साझा files से दूर रखें।
7. जब jobs एक loop में एक-दूसरे पर निर्भर हों, जैसे VQE या QAOA optimisation (पाठ 30), ताकि हर बार फिर queue में लगने के बजाय iterations के बीच device आरक्षित रहे।

## सार-सूत्र

| विचार | सूत्र या तथ्य |
|---|---|
| Native gates | छोटा calibrated set, जैसे CZ (या ECR), RZ, SX, X |
| Coupling map | कौन-सी physical qubit जोड़ियाँ two-qubit gates कर सकती हैं |
| Target | Device के native gates, connections, errors, समय, T1/T2 |
| अनुवाद | H = RZ(π/2)·SX·RZ(π/2); CNOT = (I⊗H)·CZ·(I⊗H) |
| Layout | Virtual → physical qubit बँटवारा (VF2Layout, SabreLayout), noise-aware |
| Routing | गैर-पड़ोसी gates के लिए SWAPs (हर एक 3 CNOTs) डालना (SabreSwap) |
| Optimisation levels | 0 से 3; hardware के लिए 2 या 3 |
| Pass manager | `generate_preset_pass_manager(backend=..., optimization_level=3)` |
| ISA circuit | सिर्फ़ device के native gates और connections इस्तेमाल करता है |
| Observables | Estimator से पहले `obs.apply_layout(isa.layout)` |
| नक़ली devices | Local tests के लिए `GenericBackendV2` (Qiskit), `fake_provider` (runtime) |
| Noisy simulation | `AerSimulator.from_backend(backend)` |
| IBM Open Plan | मुफ़्त; हर 28 दिन में लगभग 10 min QPU समय |
| Runtime primitives | `mode=backend` के साथ `SamplerV2`, `EstimatorV2` |
| Mitigation options | `dynamical_decoupling.enable`, `twirling.enable_gates`, `resilience_level` |
| Modes | Job, batch, session |
