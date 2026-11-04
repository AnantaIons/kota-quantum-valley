---
layout: ../../../layouts/Post.astro
lang: hi
title: "आपका पहला quantum program"
description: "Qiskit install करें, superposition वाला qubit बनाएँ, Bell pair बनाएँ, नतीजे पढ़ें और interference देखें, बस कुछ लाइनों के Python में।"
date: 2026-11-04
category: lesson
lesson: 7
---

आपने qubits, gates, algorithms, हार्डवेयर, communication और sensing सीख लिए। अब कोड लिखने की बारी है। इस पाठ के अंत तक आप अपने कंप्यूटर पर तीन असली quantum programs चला चुके होंगे।

**क्या चाहिए:** Python 3.10 या नया, और लगभग 15 मिनट। पाठ 1 और 2 से आगे की फ़िज़िक्स नहीं।

**लैपटॉप नहीं है?** फ़ोन के ब्राउज़र में [Google Colab](https://colab.research.google.com/) खोलें, नई notebook बनाएँ और सब वहीं चलाएँ।

## कदम 1: Qiskit install करें

Qiskit, IBM का मुफ़्त, open-source quantum programming toolkit है। Terminal में (या Colab cell में, आगे `!` लगाकर):

```bash
pip install qiskit
```

यह पाठ Qiskit **2.6.1** पर टेस्ट किया गया है।

## कदम 2: Superposition में एक qubit

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

qc = QuantumCircuit(1)   # एक qubit, |0⟩ से शुरू
qc.h(0)                  # qubit 0 पर Hadamard gate

print(Statevector(qc))
```

```text
Statevector([0.70710678+0.j, 0.70710678+0.j], dims=(2,))
```

यह पाठ 1 वाला (|0⟩ + |1⟩)/√2 ही है। दोनों नंबर |0⟩ और |1⟩ के **amplitudes** हैं। हर एक 1/√2 ≈ 0.707 है, तो हर probability 0.707² = 0.5।

`Statevector` से हम amplitudes झाँक सकते हैं। **असली quantum computer ऐसा नहीं कर सकता।** वह सिर्फ़ measure कर सकता है। तो चलिए measure करें।

## कदम 3: 1,000 बार measure करें

```python
from qiskit.primitives import StatevectorSampler

qc.measure_all()
print(qc.draw())

sampler = StatevectorSampler()
result = sampler.run([qc], shots=1000).result()
print(result[0].data.meas.get_counts())
```

```text
{'0': 477, '1': 523}
```

- `shots=1000` का मतलब: circuit को 1,000 बार बनाओ और measure करो।
- लगभग आधे shots में 0 और आधे में 1 आया। **हर एक shot random है। सिर्फ़ pattern पहले से पता होता है।**

## कदम 4: आपका पहला entanglement (Bell pair)

```python
bell = QuantumCircuit(2)
bell.h(0)        # qubit 0 पर superposition
bell.cx(0, 1)    # CNOT: control 0, target 1
bell.measure_all()

counts = sampler.run([bell], shots=1000).result()[0].data.meas.get_counts()
print(counts)
```

```text
{'00': 484, '11': 516}
```

हमेशा **00** या **11** आता है, कभी 01 या 10 नहीं। हर qubit अकेले सिक्का उछालने जैसा है, लेकिन दोनों हमेशा मेल खाते हैं। यही entanglement है।

## कदम 5: Interference, दो बार H

```python
hh = QuantumCircuit(1)
hh.h(0)
hh.h(0)
hh.measure_all()
print(sampler.run([hh], shots=1000).result()[0].data.meas.get_counts())
```

```text
{'0': 1000}
```

एक H से 50/50 मिलता है। दो H से **हर बार 0**। |1⟩ तक पहुँचने के दो रास्तों के amplitudes +½ और −½ हैं, जो एक-दूसरे को **cancel** कर देते हैं। यही cancelling हर quantum algorithm का इंजन है।

## ध्यान दें: Qiskit bits को दाएँ से बाएँ पढ़ता है

```python
x = QuantumCircuit(2)
x.x(1)           # सिर्फ़ qubit 1 पलटें
x.measure_all()
print(sampler.run([x], shots=100).result()[0].data.meas.get_counts())
```

```text
{'10': 100}
```

आपने qubit **1** पलटा, लेकिन नतीजा `'10'` दिखा। Qiskit **qubit 0 को सबसे दाएँ** लिखता है। हमारी Quantum Lab qubit 0 को बाएँ दिखाती है, जैसे ज़्यादातर किताबें। दोनों सही हैं, बस पता होना चाहिए कि आप कौन-सा पढ़ रहे हैं।

## असली quantum computer पर चलाएँ (वैकल्पिक)

ऊपर सब कुछ आपके कंप्यूटर के **simulator** पर चला। असली IBM हार्डवेयर के लिए:

1. [IBM Quantum Platform](https://quantum.cloud.ibm.com/) पर मुफ़्त account बनाएँ।
2. `qiskit-ibm-runtime` install करें और IBM का "Hello world" tutorial फ़ॉलो करें।
3. थोड़ी ग़लतियों की उम्मीद रखें: Bell pair में कुछ `01` और `10` भी आ सकते हैं। यही पाठ 4 वाला noise है।

## ख़ुद आज़माएँ

1. कदम 2 में `qc.h(0)` से पहले `qc.x(0)` जोड़ें। Statevector में क्या बदला, और counts क्यों नहीं बदले?
2. 3-qubit GHZ state बनाएँ: 0 पर H, CNOT 0→1, CNOT 1→2। कौन-से नतीजे आते हैं?
3. कदम 5 के दोनों H के बीच `qc.z(0)` लगाएँ। पहले अनुमान लगाएँ, फिर चलाएँ।

हर जवाब [क्वांटम लैब](/hi/lab/) के circuit builder में जाँचा जा सकता है।
