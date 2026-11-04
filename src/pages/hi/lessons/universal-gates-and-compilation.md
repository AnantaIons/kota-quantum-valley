---
layout: ../../../layouts/Post.astro
lang: hi
title: "Universal gate sets और compilation"
description: "Gate set के universal होने का मतलब, single-qubit gates और CNOT से कोई भी operation क्यों बनता है, किसी भी two-qubit gate को ज़्यादा से ज़्यादा तीन CNOTs क्यों चाहिए, ज़्यादातर operations को फिर भी exponentially कई gates क्यों चाहिए, H और T किसी भी घुमाव का अनुमान कैसे लगाते हैं (Solovay–Kitaev), Clifford circuits simulate करना आसान क्यों है, और compiler आपके circuit को हार्डवेयर gates में कैसे बदलता है।"
date: 2026-11-04
category: lesson
lesson: 17

---

Classical कंप्यूटर सिर्फ़ NAND gates से कोई भी program चला सकता है (पाठ 1)। क्या इसका quantum रूप है: gates का एक छोटा set जिससे हर संभव quantum गणना बन सके?

हाँ, और व्यवहार में इसकी बारीकियाँ बहुत मायने रखती हैं। ये तय करती हैं कि हार्डवेयर को क्या कर पाना चाहिए, गणना कितनी महँगी है, कौन-से circuits classical कंप्यूटर आसानी से simulate कर सकता है, और चलने से पहले quantum compiler आपके program के साथ क्या करता है। यह पाठ तीन सवालों के जवाब देकर भाग C बंद करता है: **कौन-से gates काफ़ी हैं, कितने चाहिए, और आपका circuit उनमें कैसे बदलता है।**

## "Universal" के दो मतलब

Classical computing के मुक़ाबले एक मोड़ है। Quantum gates एक **continuum** हैं: हर कोण θ के लिए RX(θ) अलग gate है। Gates का सीमित set सिर्फ़ गिनने लायक circuits बना सकता है, तो वह हर unitary को कभी ठीक-ठीक नहीं पा सकता। इसलिए universality दो तरह की है:

| तरह | मतलब | उदाहरण |
|---|---|---|
| **Exactly universal** | Continuous कोणों वाले gates से कोई भी unitary ठीक-ठीक | सभी single-qubit gates + CNOT |
| **Approximately universal** | सीमित set से कोई भी unitary, जितनी चाहें उतनी सटीकता ε तक | H, T और CNOT ("Clifford + T") |

हार्डवेयर पहली तरह इस्तेमाल करता है (वह कोई भी कोण सेट कर सकता है), लेकिन error-corrected कंप्यूटर दूसरी तरह इस्तेमाल करेंगे (पाठ 35 बताता है क्यों)। दोनों ज़रूरी हैं।

## Single-qubit gates और CNOT से सब कुछ बनता है

**प्रमेय (Barenco और साथी, 1995):** कितने भी qubits पर कोई भी unitary, single-qubit gates और CNOTs के circuit की तरह ठीक-ठीक लिखा जा सकता है।

सबूत का विचार, तीन क़दमों में:

1. कोई भी बड़ा unitary **two-level unitaries** के गुणनफल में तोड़ा जा सकता है: ऐसी matrices जो सिर्फ़ दो basis states पर 2×2 घुमाव जैसी चलती हैं और बाक़ी पर कुछ नहीं करतीं (उल्टे Gaussian elimination जैसा)।
2. हर two-level unitary, बाक़ी सभी qubits पर controlled एक single-qubit gate है, जिसे Toffoli जैसे multi-controlled gates से बनाया जा सकता है।
3. Multi-controlled gates, CNOTs और single-qubit gates में टूटते हैं (पाठ 13 ने Toffoli के लिए दिखाया)।

पाठ 11 से आप जानते हैं कि कोई भी single-qubit gate तीन घुमाव है। तो quantum computer को मूल रूप से बस CNOT और घुमाव चाहिए।

### किसी भी two-qubit gate को ज़्यादा से ज़्यादा 3 CNOTs

दो qubits के लिए एक सटीक नतीजा है: **हर two-qubit unitary ज़्यादा से ज़्यादा 3 CNOTs** और single-qubit gates से बन सकता है (यह "KAK" या Cartan decomposition से निकलता है)। आम random gate के लिए तीन ज़रूरी भी हैं। Qiskit ऐसा decomposition अपने आप ढूँढता है:

```python
from qiskit import QuantumCircuit, transpile
from qiskit.quantum_info import random_unitary, Operator

U = random_unitary(4, seed=17)                  # a random two-qubit gate
qc = QuantumCircuit(2)
qc.unitary(U, [0, 1])
native = transpile(qc, basis_gates=["cx", "rz", "sx", "x"], optimization_level=2)
print(dict(native.count_ops()))
print("still the same gate:", Operator(native).equiv(U))
```

```text
{'rz': 15, 'sx': 10, 'cx': 3}
still the same gate: True
```

एक पूरी तरह random 4×4 unitary, IBM के native set (पाठ 11) पर ठीक 3 CNOTs और 25 single-qubit gates बन गया। क्योंकि CNOT महँगा हिस्सा है, "3 CNOTs" किसी भी two-qubit gate की असली क़ीमत है।

## Universal का मतलब सस्ता नहीं

एक गंभीर तथ्य। n-qubit unitary एक 2ⁿ × 2ⁿ matrix है: इसे बताने में लगभग 4ⁿ real नंबर लगते हैं। Circuit का हर gate सिर्फ़ कुछ समायोज्य नंबर जोड़ता है। तो हर unitary तक पहुँच पाने के लिए circuits में आम तौर पर लगभग **4ⁿ gates** होने चाहिए। (यह गिनती वाला तर्क है, बहुत कुछ Shannon के उस सबूत जैसा कि ज़्यादातर Boolean functions को exponentially बड़े classical circuits चाहिए।)

नतीजा: **लगभग सभी quantum operations बनाना असंभव रूप से महँगा है।** 50 qubits के लिए 4⁵⁰ ≈ 10³⁰ gates। उपयोगी quantum algorithms दुर्लभ, ख़ास operations हैं जिन्हें संयोग से सिर्फ़ polynomially कई gates चाहिए, जैसे quantum Fourier transform (लगभग n² gates, पाठ 26)। ऐसे ख़ास operations ढूँढना ही quantum algorithm research है, और इसीलिए पाठ 31 सावधानी से बताता है कि quantum computers किन समस्याओं में मदद कर सकते हैं।

## सीमित gate sets: Clifford + T

जब हार्डवेयर कोई भी कोण सेट कर सकता है, तो कोई **सीमित** gate set क्यों चाहेगा? Error correction की वजह से। Fault-tolerant कंप्यूटर (पाठ 33–35) में हर logical gate कई physical qubits पर सावधानी से बनाई गई प्रक्रिया है, और ऐसी प्रक्रियाओं का सिर्फ़ सीमित menu बन सकता है। मानक menu है:

> **Clifford gates (H, S, CNOT) + T gate**

इनसे कोई भी single-qubit घुमाव, H और T gates के लंबे क्रम से, जितना चाहें उतना पास **अनुमानित** किया जा सकता है।

कितना लंबा? **Solovay–Kitaev प्रमेय** (लगभग 1995–2000) गारंटी देता है कि सटीकता ε तक पहुँचने के लिए gates की संख्या सिर्फ़ log(1/ε) की किसी power की तरह बढ़ती है। यह बहुत धीमी बढ़त है: सटीकता के हर अतिरिक्त अंक की क़ीमत gates में एक मामूली, लगभग स्थिर गुणक है, दस गुना नहीं। Qiskit में Solovay–Kitaev algorithm है, तो इसे काम करते देख सकते हैं:

```python
import numpy as np
from qiskit.circuit.library import RXGate
from qiskit.quantum_info import Operator
from qiskit.synthesis import SolovayKitaevDecomposition

target = Operator(RXGate(0.3)).data                # an angle that H and T can't hit exactly
sk = SolovayKitaevDecomposition(basis_gates=["h", "t", "tdg"], depth=10)

for degree in [0, 1, 2, 3]:
    approx = sk.run(target, recursion_degree=degree)
    a = Operator(approx).data
    error = np.sqrt(abs(1 - abs(np.trace(a.conj().T @ target)) / 2))   # 0 = perfect, ignores global phase
    print(f"recursion {degree}: {approx.size():5d} gates from {{H, T, T†}}, error {error:.5f}")
```

```text
recursion 0:    10 gates from {H, T, T†}, error 0.10422
recursion 1:    36 gates from {H, T, T†}, error 0.03347
recursion 2:   164 gates from {H, T, T†}, error 0.03262
recursion 3:   872 gates from {H, T, T†}, error 0.00508
```

घुमाव RX(0.3) पूरी तरह H, T और T† से बना। Recursion का हर स्तर पिछले अनुमान को निखारता है, और ग़लती घटती है (पूरी तरह सहज नहीं, पर कुल मिलाकर लगातार)। Single-qubit घुमावों के लिए आधुनिक number-theoretic तरीके Solovay–Kitaev से कहीं बेहतर हैं: उन्हें लगभग 3·log₂(1/ε) T gates चाहिए, तो एक-अरब में एक हिस्से तक सटीक घुमाव लगभग 100 T gates का पड़ता है।

## अकेले Clifford gates काफ़ी क्यों नहीं

अगर error-corrected मशीनों में T इतना महँगा है (पाठ 35), तो सिर्फ़ Clifford gates क्यों न इस्तेमाल करें: H, S और CNOT? क्योंकि **Clifford circuits साधारण कंप्यूटर पर आसानी से simulate हो जाते हैं।** यह **Gottesman–Knill प्रमेय** (1998) है।

तरकीब यह है कि Clifford gates, Pauli operators को Pauli operators में बदलते हैं। 2ⁿ amplitudes रखने की जगह, simulator बस यह track करता है कि n ख़ास Pauli "stabilizers" कैसे बदलते हैं, जिसमें लगभग n² bits लगते हैं। पाठ 34 stabilizers ठीक से समझाता है; अभी असर देखें। यह रही 200-qubit GHZ state, जिसे state vector की तरह 2²⁰⁰ amplitudes चाहिए होते:

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import StabilizerState

n = 200                                         # a state vector would need 2^200 amplitudes
ghz = QuantumCircuit(n)
ghz.h(0)
for q in range(n - 1):
    ghz.cx(q, q + 1)                            # only Clifford gates: H and CNOT

state = StabilizerState(ghz)                    # tracks the state with about n^2 bits instead
print(state.probabilities_dict([0, 57, 123, 199]))   # four qubits chosen across the chain
```

```text
{'0000': 0.5, '1111': 0.5}
```

Laptop इसे कुछ सेकंड में कर लेता है। तो Clifford circuits, ढेर सारा entanglement बनाने के बावजूद, quantum फ़ायदा नहीं दे सकते। **T gate ही circuit को उस सीमा से आगे ले जाता है जिसे classical कंप्यूटर आसानी से simulate कर सकें।** लोग कहते हैं T "magic" देता है, और किसी algorithm में T gates की संख्या इसका अच्छा माप है कि उसे classically simulate करना कितना कठिन है और fault-tolerantly चलाना कितना महँगा।

## दूसरे universal sets

| Gate set | कैसे universal | टिप्पणी |
|---|---|---|
| सभी single-qubit gates + CNOT | ठीक-ठीक | Textbook set |
| Native हार्डवेयर sets: RZ, √X, X + ECR या CZ | ठीक-ठीक | IBM chips यही चलाते हैं (पाठ 11 और 13) |
| H, S, T, CNOT (Clifford + T) | अनुमानित | Fault-tolerant मानक |
| H + Toffoli | अनुमानित, real amplitudes वाली गणनाओं के लिए | दिखाता है कि "classical logic + Hadamard" ही काफ़ी है |
| कोई भी entanglement बनाने वाला two-qubit gate + सभी single-qubit gates | ठीक-ठीक | तो qubits के बीच लगभग कोई भी interaction चल जाएगा |

आख़िरी row हार्डवेयर बनाने वालों के लिए अच्छी ख़बर है: पूरा सही CNOT ज़रूरी नहीं। **कोई भी** entangling two-qubit interaction, single-qubit control के साथ, सिद्धांत में काफ़ी है। इसीलिए इतने अलग हार्डवेयर (पाठ 13 की table) सब universal quantum computers हो सकते हैं।

## Compiler क्या करता है

जब आप असली हार्डवेयर पर circuit चलाते हैं, तो **transpiler** नाम का compiler उसे ऐसी चीज़ में बदलता है जिसे chip चला सके। इसके मुख्य चरण:

1. **Unroll:** ऊँचे स्तर के operations (QFT, Toffoli, `unitary(U)`) को एक- और दो-qubit gates में तोड़ना।
2. **Translate:** सब कुछ chip के native gate set में दोबारा लिखना (जैसे RZ, √X और CZ), पाठ 9 से 13 जैसी identities से।
3. **Layout और routing:** तय करना कि कौन-से physical qubits आपके qubits का काम करेंगे, और जब आपस में असर डालने वाले दो qubits chip पर पड़ोसी न हों तो SWAPs जोड़ना।
4. **Optimise:** पास-पास के उल्टे gates काटना (H·H = I), लगातार घुमाव मिलाना, और CNOT गिनती घटाना, अक्सर बड़े गुणकों से।

पाठ 40 असली device layout पर चारों चलाता है। अभी के लिए मुख्य बात: जो circuit आप लिखते हैं और जो चलता है, वे बहुत अलग दिख सकते हैं, और अच्छा compiler नतीजे और noise के बीच का फ़र्क़ बन सकता है।

## ख़ुद करके देखें

1. सीमित gate set हर single-qubit unitary ठीक-ठीक क्यों नहीं बना सकता?
2. SWAP gate के लिए Qiskit को कितने CNOTs चाहिए? Random two-qubit unitary के लिए?
3. एक 10-qubit unitary random चुना गया। आम circuit के लिए लगभग कितने gates चाहिए? 20 qubits के लिए?
4. "लगभग 3·log₂(1/ε) T gates" नियम से, ε = 10⁻⁶ तक घुमाव के लिए कितने T gates?
5. एक circuit 500 qubits पर सिर्फ़ H, S और CNOT इस्तेमाल करता है। क्या laptop इसे simulate कर सकता है? कौन-सा एक बदलाव इसे आम तौर पर कठिन बना देता है?
6. यह अच्छी ख़बर क्यों है कि लगभग कोई भी entangling two-qubit gate universal है?

**जवाब:**

1. सीमित gates गिनने लायक circuits बनाते हैं, लेकिन unitaries अनगिनत हैं (हर कोण θ अलग RX(θ) देता है)।
2. SWAP के लिए **3** (पाठ 13), और random two-qubit unitary के लिए **3**।
3. लगभग 4¹⁰ ≈ **10⁶** gates; 20 qubits के लिए 4²⁰ ≈ **10¹²**।
4. log₂(10⁶) ≈ 20, तो लगभग **60** T gates।
5. **हाँ** (Gottesman–Knill)। T gates (non-Clifford gates) जोड़ने से यह आम तौर पर कठिन हो जाता है।
6. हर हार्डवेयर platform में qubits के बीच कोई स्वाभाविक interaction होता है; मशीन को universal बनाने के लिए उसका पूरा सही CNOT होना ज़रूरी नहीं।

## सार

| विचार | सूत्र या तथ्य |
|---|---|
| Exactly universal | Continuous कोणों से कोई भी unitary ठीक-ठीक |
| Approximately universal | सीमित set से कोई भी unitary, सटीकता ε तक |
| Barenco et al. (1995) | Single-qubit gates + CNOT से कोई भी unitary |
| Two-qubit gates | ज़्यादा से ज़्यादा 3 CNOTs + single-qubit gates (KAK decomposition) |
| गिनती का तर्क | आम n-qubit unitary को ~4ⁿ gates चाहिए |
| उपयोगी algorithms | दुर्लभ operations जिन्हें सिर्फ़ polynomially कई gates चाहिए |
| Clifford gates | H, S, CNOT |
| Clifford + T | Approximately universal; fault-tolerant मानक |
| Solovay–Kitaev | Gates, log(1/ε) की किसी power की तरह बढ़ते हैं |
| आधुनिक synthesis | हर घुमाव के लिए लगभग 3·log₂(1/ε) T gates |
| Gottesman–Knill | सिर्फ़-Clifford circuits classically आसानी से simulate होते हैं |
| T gate | "Magic" देता है; T-गिनती लागत और classical कठिनाई का माप |
| कोई भी entangling gate | + single-qubit gates universal है |
| Transpiler के चरण | Unroll, native gates में अनुवाद, layout/route, optimise |
| कोड में | `transpile(..., basis_gates=[...])`, `SolovayKitaevDecomposition`, `StabilizerState` |
