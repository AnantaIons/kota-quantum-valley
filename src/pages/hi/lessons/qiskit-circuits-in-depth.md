---
layout: ../../../layouts/Post.astro
lang: hi
title: "Qiskit circuits गहराई से"
description: "Qiskit में circuits बनाने के बारे में सब कुछ: नाम वाले registers, कई qubits पर एक साथ gates, barriers, चुने हुए bits में measure करना, एक circuit को कई कोणों पर चलाने के लिए parameters, inverse और control वाले दोबारा इस्तेमाल होने वाले blocks, if_test के साथ बीच में measurement, Sampler और Estimator primitives, और circuits को OpenQASM में सहेजना।"
date: 2026-11-04
category: lesson
lesson: 19

---

पाठ 18 ने आपको चलाना सिखाया: Qiskit install करो, Bell जोड़ी बनाओ, measure करो। छोटे प्रयोगों के लिए इतना काफ़ी है, लेकिन असली programs को ज़्यादा चाहिए। आप qubits के समूहों को नाम देना चाहेंगे, एक ही circuit को बिना दोबारा बनाए सौ अलग कोणों पर चलाना चाहेंगे, blocks दोबारा इस्तेमाल करना चाहेंगे, बीच में measure करके नतीजे पर प्रतिक्रिया देना चाहेंगे, और सिर्फ़ bitstrings गिनने की जगह expectation values निकालना चाहेंगे।

यह पाठ उन Qiskit features की सैर है जो आप पूरे course में इस्तेमाल करेंगे, हर एक छोटे, टेस्ट किए उदाहरण के साथ। अपने circuits लिखते समय इसे reference की तरह खुला रखें। यहाँ सब **Qiskit 2.6.1** (और एक उदाहरण के लिए Qiskit Aer 0.18) के साथ टेस्ट किया गया है।

## Registers: qubits के समूहों को नाम देना

`QuantumCircuit(3)` आपको 0, 1, 2 नंबर वाले तीन बेनाम qubits देता है। बड़े programs के लिए qubits को नाम वाले **registers** में बाँटना साफ़ रहता है: qubits के लिए `QuantumRegister` और measurement नतीजे रखने वाले bits के लिए `ClassicalRegister`।

यह एक छोटा circuit है जो दो data qubits की **parity** (XOR) एक helper qubit में निकालकर उसे measure करता है। ठीक यही pattern आप error correction (पाठ 33) में देखेंगे, जहाँ helper qubits, data को बिगाड़े बिना parities measure करते हैं।

```python
from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister

data = QuantumRegister(2, "data")
helper = QuantumRegister(1, "anc")
result = ClassicalRegister(1, "parity")
qc = QuantumCircuit(data, helper, result)

qc.h(data)                      # H on both data qubits at once
qc.barrier()
qc.cx(data[0], helper[0])       # copy the parity of the data qubits
qc.cx(data[1], helper[0])       # into the helper qubit
qc.measure(helper[0], result[0])
print(qc.draw("text"))
print("qubits:", qc.num_qubits, " clbits:", qc.num_clbits, " depth:", qc.depth(), " ops:", dict(qc.count_ops()))
```

```text
          ┌───┐ ░              
  data_0: ┤ H ├─░───■──────────
          ├───┤ ░   │          
  data_1: ┤ H ├─░───┼────■─────
          └───┘ ░ ┌─┴─┐┌─┴─┐┌─┐
     anc: ──────░─┤ X ├┤ X ├┤M├
                ░ └───┘└───┘└╥┘
parity: 1/═══════════════════╩═
                             0 
qubits: 3  clbits: 1  depth: 4  ops: {'h': 2, 'cx': 2, 'barrier': 1, 'measure': 1}
```

ध्यान देने वाली बातें:

- **Broadcasting:** `qc.h(data)` ने register के हर qubit पर H लगाया। Gate methods एक qubit, list, register या `range` ले सकते हैं।
- **Barriers** (बिंदुओं वाली लकीर) state के साथ कुछ नहीं करते। ये दिखाने के लिए विभाजक हैं, और compiler को gates इनके पार खिसकाने से रोकते हैं (जब आप कोई हिस्सा ठीक लिखे अनुसार रखना चाहें तब काम का)।
- **`measure(q, c)`** qubit का नतीजा आपके चुने classical bit में भेजता है। `measure_all()`, जो आपने पहले इस्तेमाल किया, `meas` नाम का पूरा नया register जोड़कर हर qubit उसमें measure करता है।
- Register index से qubit गिना जाता है: `data[0]` पूरे circuit का qubit 0 है, `helper[0]` qubit 2। Qiskit की bitstrings में फिर भी सबसे बड़े नंबर वाला bit बाईं ओर होता है (पाठ 12)।

## Circuit की जाँच

| Method | क्या देता है |
|---|---|
| `qc.draw("text")` | ASCII drawing (notebook में तस्वीर के लिए `"mpl"`) |
| `qc.num_qubits`, `qc.num_clbits` | Width |
| `qc.depth()` | Time steps की संख्या (पाठ 13) |
| `qc.size()`, `qc.count_ops()` | कुल gates, और तरह के हिसाब से gates |
| `Operator(qc)` | Circuit की unitary matrix (measurements नहीं होने चाहिए) |
| `Statevector(qc)` | \|0…0⟩ से बनने वाली state (measurements नहीं होने चाहिए) |

## Parameters: एक circuit, कई कोण

Variational algorithms (पाठ 30), sensing scans (पाठ 44) और calibrations सब **एक ही circuit कई अलग कोणों पर** चलाते हैं। हर बार circuit दोबारा बनाना धीमा है। इसकी जगह एक प्रतीकात्मक **`Parameter`** इस्तेमाल करें और चलाते समय नंबर दें।

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.circuit import Parameter
from qiskit.primitives import StatevectorSampler

theta = Parameter("θ")
qc = QuantumCircuit(1)
qc.ry(theta, 0)
qc.measure_all()

sampler = StatevectorSampler(seed=3)
angles = [0, np.pi / 3, np.pi / 2, np.pi]
job = sampler.run([(qc, angles)], shots=1000)          # one circuit, four angles
counts = job.result()[0].data.meas
for i, a in enumerate(angles):
    c = counts.get_counts(i)
    print(f"θ = {np.degrees(a):5.1f}°  ->  P(1) ≈ {c.get('1', 0) / 1000:.3f}   (exact {np.sin(a / 2) ** 2:.3f})")
```

```text
θ =   0.0°  ->  P(1) ≈ 0.000   (exact 0.000)
θ =  60.0°  ->  P(1) ≈ 0.230   (exact 0.250)
θ =  90.0°  ->  P(1) ≈ 0.498   (exact 0.500)
θ = 180.0°  ->  P(1) ≈ 1.000   (exact 1.000)
```

Sampler ने एक **pub** ("primitive unified bloc") लिया: (circuit, parameter values) का tuple। चार values के साथ उसने चार रूप चलाए और counts के चार sets लौटाए। 0.230 बनाम 0.250 shot noise है (पाठ 5: 1,000 shots के साथ लगभग ±0.014)। कई parameters के लिए `ParameterVector("θ", 10)` एक लाइन में θ[0] … θ[9] बनाता है, और ज़रूरत हो तो `qc.assign_parameters({theta: 0.5})` circuit की एक तय copy बनाता है।

## दोबारा इस्तेमाल होने वाले blocks: to_gate, compose, inverse, control

बड़े algorithms दोहराए जाने वाले टुकड़ों से बनते हैं: oracle, diffusion step, QFT। Qiskit किसी भी circuit को एक gate की तरह इस्तेमाल करने देता है।

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Operator

# A reusable block: prepare a Bell pair
bell = QuantumCircuit(2, name="bell")
bell.h(0)
bell.cx(0, 1)

big = QuantumCircuit(4)
big.append(bell.to_gate(), [0, 1])        # use it as one gate...
big.append(bell.to_gate(), [2, 3])        # ...twice
big.compose(bell.inverse(), [0, 1], inplace=True)   # then undo the first pair
print(big.draw("text"))
print(dict(big.count_ops()))

undo = bell.compose(bell.inverse())
print("bell then its inverse is the identity:", Operator(undo).equiv(Operator(QuantumCircuit(2))))

cbell = bell.to_gate().control(1)          # a controlled version: a 3-qubit gate
print("controlled block acts on", cbell.num_qubits, "qubits")
```

```text
     ┌───────┐     ┌───┐
q_0: ┤0      ├──■──┤ H ├
     │  bell │┌─┴─┐└───┘
q_1: ┤1      ├┤ X ├─────
     ├───────┤└───┘     
q_2: ┤0      ├──────────
     │  bell │          
q_3: ┤1      ├──────────
     └───────┘          
{'bell': 2, 'cx': 1, 'h': 1}
bell then its inverse is the identity: True
controlled block acts on 3 qubits
```

| औज़ार | क्या करता है |
|---|---|
| `circ.to_gate()` | किसी circuit (बिना measurements) को एक नाम वाले gate में बाँधता है |
| `qc.append(gate, qubits)` | उस gate को चुने qubits पर रखता है |
| `qc.compose(other, qubits)` | दूसरे circuit के gates खोलकर चिपकाता है |
| `circ.inverse()` | Circuit उल्टा, हर gate की जगह उसका inverse (पाठ 4: (AB)† = B†A†) |
| `gate.control(k)` | k अतिरिक्त qubits से controlled रूप (पाठ 13) |
| `gate.power(k)` | Gate k बार दोहराया |
| `qc.decompose()` | नाम वाले blocks को एक स्तर खोलता है, अंदर देखने के लिए |

`inverse` और `control` लगातार इस्तेमाल होते हैं: "गणना करो, नतीजा इस्तेमाल करो, गणना उलटो" helper qubits साफ़ करने का मानक pattern है, और किसी unitary की controlled powers phase estimation (पाठ 27) का दिल हैं।

## बीच में measurement और feed-forward

अब तक measurements अंत में थे। आज का हार्डवेयर circuit के **बीच में measure** करके **नतीजे के हिसाब से अगले gates चुन** भी सकता है, सब एक ही run में। इन्हें **dynamic circuits** कहते हैं, और teleportation (पाठ 21) और error correction (भाग F) इन पर निर्भर हैं।

एक छोटा उदाहरण: qubit को superposition में डालो, उसे देखो, और अगर नतीजा 0 था तो पलट दो। पहला नतीजा जो भी हो, qubit अंत में 1 होता है।

```python
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

# Mid-circuit measurement and feed-forward: guarantee that qubit 0 ends in |1>
qc = QuantumCircuit(1, 2)
qc.h(0)
qc.measure(0, 0)                         # first look: random 0 or 1
with qc.if_test((qc.clbits[0], 0)):      # if we saw 0 ...
    qc.x(0)                              # ... flip it
qc.measure(0, 1)                         # second look

counts = AerSimulator(seed_simulator=5).run(qc, shots=1000).result().get_counts()
print(counts)                            # bit 1 (left) is the second measurement
```

```text
{'10': 498, '11': 502}
```

दाईं ओर का bit (पहली नज़र) random है। बाईं ओर का bit (दूसरी नज़र) हमेशा 1 है। इसके लिए classical control वाला simulator चाहिए, इसलिए हमने **Qiskit Aer** (`pip install qiskit-aer`) इस्तेमाल किया, IBM का तेज़ simulator, जिसे पाठ 20 ठीक से समझाता है। जुड़े औज़ार: `qc.reset(q)` circuit के बीच qubit को वापस |0⟩ पर लाता है (measure करके, ज़रूरत हो तो पलटकर), जिससे qubits **दोबारा इस्तेमाल** हो सकते हैं।

## दो primitives: Sampler और Estimator

Qiskit के आधुनिक interface में circuits चलाने के दो मुख्य तरीके हैं, जिन्हें **primitives** कहते हैं।

| Primitive | किस सवाल का जवाब | Output |
|---|---|---|
| **Sampler** | "कौन-सी bitstrings निकलती हैं?" | हर measure की गई bitstring की गिनती |
| **Estimator** | "इस observable का औसत value क्या है?" | Expectation values ⟨A⟩ (पाठ 8), ग़लती के अनुमान के साथ |

Grover (पाठ 24) जैसे algorithms को bitstrings चाहिए, तो वे Sampler इस्तेमाल करते हैं। Chemistry और optimisation (पाठ 30) को energies चाहिए, जो expectation values हैं, तो वे Estimator इस्तेमाल करते हैं। Observables, `SparsePauliOp` से **Pauli strings** की तरह लिखे जाते हैं, Qiskit क्रम में (सबसे दाईं अक्षर qubit 0 पर): "IZ" का मतलब qubit 0 पर Z, qubit 1 पर कुछ नहीं।

Estimator एक call में कई observables को कई parameter values पर निकाल सकता है, NumPy जैसे broadcasting से: observables का एक column गुणा कोणों की एक row से एक grid मिलता है।

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.circuit import Parameter
from qiskit.quantum_info import SparsePauliOp
from qiskit.primitives import StatevectorEstimator

theta = Parameter("θ")
qc = QuantumCircuit(2)
qc.ry(theta, 0)
qc.cx(0, 1)                                  # cos(θ/2)|00> + sin(θ/2)|11>

observables = [[SparsePauliOp("ZZ")], [SparsePauliOp("IZ")], [SparsePauliOp("XX")]]   # a column
angles = [0, np.pi / 2, np.pi]                                                         # a row
result = StatevectorEstimator().run([(qc, observables, angles)]).result()[0]
print("      ZZ    IZ    XX")
for a, row in zip(angles, result.data.evs.T.round(3) + 0.0):
    print(f"{np.degrees(a):4.0f}°", row)
```

```text
      ZZ    IZ    XX
   0° [1. 1. 0.]
  90° [1. 0. 1.]
 180° [ 1. -1.  0.]
```

हाथ से जाँचें। State cos(θ/2)|00⟩ + sin(θ/2)|11⟩ है। दोनों qubits हमेशा मेल खाते हैं, तो हर कोण पर ⟨ZZ⟩ = 1। Qubit 0 पर ⟨Z⟩, cos²(θ/2) − sin²(θ/2) = cos θ है: 1, 0, −1। और ⟨XX⟩ = sin θ: 0, 1, 0। 90° पर state Bell जोड़ी है, और पाठ 14 का ⟨ZZ⟩ = ⟨XX⟩ = 1 मिलता है।

`Statevector…` primitives आपके कंप्यूटर पर सटीक गणना करते हैं। असली हार्डवेयर पर आप `qiskit-ibm-runtime` package के IBM `SamplerV2` और `EstimatorV2` के साथ वही interface इस्तेमाल करते हैं (पाठ 40), तो इन primitives पर लिखा कोड लगभग बिना बदले हार्डवेयर पर चला जाता है।

## Circuits सहेजना और बाँटना: OpenQASM

**OpenQASM** quantum circuits के लिए plain-text भाषा है, जिसे Qiskit और ज़्यादातर दूसरे quantum toolkits पढ़ सकते हैं। यह quantum computing की "assembly language" है।

```python
from qiskit import QuantumCircuit, qasm3

qc = QuantumCircuit(2)
qc.h(0)
qc.cx(0, 1)
qc.measure_all()
print(qasm3.dumps(qc))                  # plain text that other quantum tools can read
```

```text
OPENQASM 3.0;
include "stdgates.inc";
bit[2] meas;
qubit[2] q;
h q[0];
cx q[0], q[1];
barrier q[0], q[1];
meas[0] = measure q[0];
meas[1] = measure q[1];
```

इसे लाइन-दर-लाइन पढ़ सकते हैं: 2 bits और 2 qubits घोषित करो, H, CNOT, barrier, measure। (`measure_all()` ने barrier अपने आप जोड़ा।) File में सहेजने के लिए `qasm3.dump(qc, file)`। OpenQASM 3 वापस load करने के लिए अतिरिक्त package `qiskit-qasm3-import` चाहिए; पुराने `qasm2.dumps` और `qasm2.loads` आसान circuits के लिए उसके बिना चलते हैं।

## ख़ुद करके देखें

1. "q" नाम का 3-qubit register और "c" नाम का 3-bit register वाला circuit बनाएँ। एक call से तीनों qubits पर H लगाएँ, और qubit i को bit i में measure करें।
2. `Parameter` से |0⟩ पर RX(θ) को θ = 0, 90°, 180°, 270°, 360° के लिए scan करें। कौन-से कोण P(1) = 1 देते हैं?
3. `to_gate()` से 3-qubit GHZ block बनाएँ, फिर `inverse()` से दिखाएँ कि GHZ के बाद उसका inverse |000⟩ लौटाता है।
4. Dynamic-circuit उदाहरण में `if_test` ऐसे बदलें कि qubit हमेशा |0⟩ में ख़त्म हो।
5. Estimator से Ψ⁻ Bell state के लिए ⟨ZZ⟩, ⟨XX⟩ और ⟨YY⟩ निकालें। क्या उम्मीद है?
6. अपना GHZ circuit OpenQASM 3 में export करके text पढ़ें। कितनी लाइनों में `cx` है?

**जवाब (रूपरेखा):**

1. `q = QuantumRegister(3, "q"); c = ClassicalRegister(3, "c"); qc = QuantumCircuit(q, c); qc.h(q); qc.measure(q, c)`।
2. P(1) = sin²(θ/2): **180°** पर 1; 0° और 360° पर 0; 90° और 270° पर ½।
3. `Statevector(ghz.compose(ghz.inverse()))`, |000⟩ के बराबर है।
4. 1 के लिए जाँचें: `with qc.if_test((qc.clbits[0], 1)): qc.x(0)`।
5. Ψ⁻ हर basis में उल्टा-correlated है (पाठ 14): **−1, −1, −1**।
6. दो (दो CNOTs की श्रृंखला के लिए)।

## सार

| काम | कोड |
|---|---|
| नाम वाले registers | `QuantumRegister(n, "name")`, `ClassicalRegister(n, "name")` |
| कई qubits पर gate | `qc.h([0, 1, 2])` या `qc.h(register)` |
| Barrier | `qc.barrier()` |
| चुने bit में measure | `qc.measure(q, c)` |
| सब measure | `qc.measure_all()` (register `meas` जोड़ता है) |
| जाँच | `draw`, `depth`, `size`, `count_ops`, `num_qubits` |
| Parameter | `theta = Parameter("θ")`; `ParameterVector("θ", n)` |
| कई कोण चलाना | `sampler.run([(qc, values)])` |
| Parameter तय करना | `qc.assign_parameters({theta: 0.5})` |
| दोबारा इस्तेमाल होने वाला block | `circ.to_gate()`, `qc.append(gate, qubits)` |
| Circuit चिपकाना | `qc.compose(other, qubits)` |
| उलटना / control / दोहराना | `inverse()`, `control(k)`, `power(k)` |
| Block के अंदर देखना | `qc.decompose()` |
| बीच में logic | `with qc.if_test((clbit, value)):`; `qc.reset(q)` |
| Bitstrings | Sampler (`StatevectorSampler`, हार्डवेयर पर `SamplerV2`) |
| Expectation values | `SparsePauliOp("XZ")` के साथ Estimator |
| Pauli string क्रम | सबसे दाईं अक्षर qubit 0 पर |
| Export | `qasm3.dumps(qc)` |
