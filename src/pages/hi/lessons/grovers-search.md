---
layout: ../../../layouts/Post.astro
lang: hi
title: "Grover की खोज, code में बनाई"
description: "Grover का algorithm बुनियाद से: खोज की समस्या और oracle model, amplitude-दर-amplitude औसत के गिर्द उलटना, 2θ घुमाव की ज्यामितीय तस्वीर, Qiskit में सामान्य Grover circuit और सफलता की probability का चढ़ना-उतरना, कई हल, एक छोटी satisfiability समस्या के लिए gates से बना असली oracle, √N सबसे अच्छा क्यों है, और Grover क्या नहीं कर सकता।"
date: 2026-11-04
category: lesson
lesson: 24
---

पाठ 22 ने oracles और phase kickback से परिचय कराया, और ऐसे algorithms (Deutsch–Jozsa, Bernstein–Vazirani) दिखाए जो छिपे ढाँचे का फ़ायदा उठाते हैं। Grover का algorithm (Lov Grover, 1996) उलटी स्थिति से निपटता है: **कोई ढाँचा नहीं**। आप भूसे के ढेर में सुई ढूँढ रहे हैं, और आपके पास बस एक जाँचने वाला है जो कहता है "हाँ, यही है" या "नहीं"।

Grover का algorithm लगभग N जाँचों के बजाय लगभग √N जाँचों में सुई ढूँढ लेता है। यह **quadratic** speed-up है, exponential नहीं, लेकिन यह समस्याओं की विशाल श्रृंखला पर लागू होता है, और साबित रूप से सबसे अच्छा संभव है। यह पाठ इसे शुरू से बनाता है, ठीक-ठीक समझाता है कि यह क्यों काम करता है, और फिर एक छोटी तर्क पहेली के लिए असली oracle बनाता है।

## समस्या

आपके पास N संभव जवाब हैं, 0 से N − 1 तक, और एक function f(x) जो सही जवाब(ों) के लिए 1 और बाक़ी के लिए 0 है। आप f निकाल सकते हैं, लेकिन उसके बारे में और कुछ नहीं जानते। Classically आपको एक-एक करके जवाब आज़माने होंगे: एक जवाब के लिए औसतन लगभग N/2 कोशिशें, और सबसे बुरे मामले में N − 1।

Quantum computer पर f एक **phase oracle** (पाठ 22) के रूप में दिया जाता है: O|x⟩ = (−1)^f(x)|x⟩। यह हर सही जवाब के amplitude का चिह्न पलटता है और बाक़ी को छोड़ देता है। सवाल है कि हमें कितनी कम oracle calls ("queries") चाहिए।

| N | Classical कोशिशें (औसत) | Grover rounds |
|---|---|---|
| 4 | 2.5 | 1 |
| 1,000,000 | 500,000 | लगभग 785 |
| 10¹² | 5 × 10¹¹ | लगभग 785,000 |

## एक round के दो क़दम

सभी N जवाबों के बराबर superposition से शुरू करें, हर एक का amplitude 1/√N (हर qubit पर Hadamards)। फिर दो क़दमों वाला **Grover round** दोहराएँ:

1. **Oracle:** सही जवाब के amplitude का चिह्न पलटो। Probabilities अभी नहीं बदलतीं; बस एक छिपा चिह्न बदलता है।
2. **Diffusion (औसत के गिर्द उलटना):** हर amplitude a को 2·औसत − a से बदलो। औसत से ऊपर वाले amplitudes उतनी ही दूरी पर नीचे जाते हैं, और उलटा भी।

क़दम 1 के बाद सही जवाब का amplitude negative है, औसत से बहुत नीचे। औसत के गिर्द उलटना उसे बहुत **ऊपर** फेंक देता है, जबकि बाक़ी सब थोड़े सिकुड़ते हैं। यहाँ N = 8 के लिए यह प्रक्रिया amplitude-दर-amplitude है:

```python
import numpy as np

N, marked = 8, 5
amp = np.ones(N) / np.sqrt(N)                     # start: equal superposition
print("round   amplitude of the answer   each other amplitude   P(answer)")
print(f"  0          {amp[marked]:+.3f}                  {amp[0]:+.3f}            {amp[marked]**2:.3f}")
for k in range(1, 5):
    amp[marked] *= -1                             # oracle: flip the answer's sign
    amp = 2 * amp.mean() - amp                    # diffusion: reflect every amplitude about the mean
    print(f"  {k}          {amp[marked]:+.3f}                  {amp[0]:+.3f}            {amp[marked]**2:.3f}")
```

```text
round   amplitude of the answer   each other amplitude   P(answer)
  0          +0.354                  +0.354            0.125
  1          +0.884                  +0.177            0.781
  2          +0.972                  -0.088            0.945
  3          +0.575                  -0.309            0.330
  4          -0.110                  -0.376            0.012
```

एक round के बाद जवाब की probability 12.5% से 78% तक उछलती है; दो के बाद 94.5% तक। लेकिन तीसरा round इसे **बदतर** करता है (33%), और चौथा लगभग शून्य। बाक़ी amplitudes negative होते हैं और प्रक्रिया आगे निकल जाती है। Grover का algorithm "बढ़ाते रहो" नहीं; इसे ठीक सही संख्या में rounds चाहिए।

## ज्यामितीय तस्वीर

यह चढ़ता और फिर गिरता क्यों है? क्योंकि हर round एक **घुमाव** है। सारा खेल एक 2-dimensional समतल में होता है, दो states से बना:

- |w⟩, सही जवाब, और
- |r⟩, सभी ग़लत जवाबों का बराबर superposition।

शुरुआती state लगभग पूरी तरह |r⟩ है, |w⟩ की ओर एक छोटे कोण θ से झुकी, जहाँ **sin θ = 1/√N**। Oracle state को |r⟩ के आर-पार परावर्तित करता है; diffusion उसे शुरुआती state के आर-पार परावर्तित करता है। दो परावर्तन मिलकर **2θ** का **घुमाव** बनाते हैं (पाठ 25 इसे सामान्य रूप में साबित करता है)। तो k rounds के बाद state |r⟩ से (2k + 1)θ के कोण पर है, और

> P(सफलता) = sin²((2k + 1)θ)

|w⟩ (90° कोण) पर पहुँचने के लिए k ≈ π/(4θ) − ½ ≈ (π/4)√N चुनें। आगे घुमाएँ और आप उसके पार निकल जाते हैं, ठीक जैसा table ने दिखाया।

## Qiskit में Grover

यहाँ n qubits और किसी भी target bitstring के लिए सामान्य Grover circuit है। Oracle X gates से |target⟩ को |11…1⟩ पर ले जाकर और multi-controlled Z लगाकर उसे पलटता है; diffusion |00…0⟩ के लिए वही करता है, Hadamards के बीच:

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

def oracle(n, target):
    """Phase oracle: flip the sign of |target⟩ only (target is a bitstring, qubit 0 on the right)."""
    qc = QuantumCircuit(n)
    zeros = [q for q in range(n) if target[n - 1 - q] == "0"]
    if zeros: qc.x(zeros)                         # map |target⟩ to |11…1⟩
    qc.h(n - 1); qc.mcx(list(range(n - 1)), n - 1); qc.h(n - 1)   # multi-controlled Z on |11…1⟩
    if zeros: qc.x(zeros)
    return qc

def diffusion(n):
    """Reflect about the equal superposition: H, flip the sign of |00…0⟩, H."""
    qc = QuantumCircuit(n)
    qc.h(range(n)); qc.x(range(n))
    qc.h(n - 1); qc.mcx(list(range(n - 1)), n - 1); qc.h(n - 1)
    qc.x(range(n)); qc.h(range(n))
    return qc

def grover(n, target, rounds):
    qc = QuantumCircuit(n)
    qc.h(range(n))
    for _ in range(rounds):
        qc.compose(oracle(n, target), inplace=True)
        qc.compose(diffusion(n), inplace=True)
    return qc

n, target = 3, "101"
for k in range(5):
    p = Statevector(grover(n, target, k)).probabilities_dict().get(target, 0)
    print(f"{k} rounds: P({target}) = {p:.3f}")
theta = np.arcsin(1 / np.sqrt(2 ** n))
print(f"best number of rounds ≈ π/(4θ) − 1/2 = {np.pi / (4 * theta) - 0.5:.2f}")
```

```text
0 rounds: P(101) = 0.125
1 rounds: P(101) = 0.781
2 rounds: P(101) = 0.945
3 rounds: P(101) = 0.330
4 rounds: P(101) = 0.012
best number of rounds ≈ π/(4θ) − 1/2 = 1.67
```

Qiskit circuit amplitude हिसाब को ठीक दोहराता है: एक round के बाद 78%, दो के बाद 94.5%, फिर गिरावट। सूत्र कहता है कि rounds की ideal संख्या 1.67 है, तो 2 सबसे अच्छी पूर्ण संख्या है। 2 rounds चलाओ और measure करो: 94.5% समय जवाब मिलता है; न मिले तो एक classical जाँच करो और दोहराओ।

## कई हल

अगर N में से M जवाब सही हैं, तो वही algorithm sin θ = √(M/N) के साथ काम करता है: शुरुआती state अच्छे जवाबों की ओर ज़्यादा झुकी है, तो कम rounds चाहिए, लगभग (π/4)√(N/M):

```python
import numpy as np

print("   N           M    Grover rounds   P(success)   classical tries (average)")
for N, M in [(16, 1), (16, 2), (16, 4), (2 ** 20, 1), (2 ** 20, 16)]:
    theta = np.arcsin(np.sqrt(M / N))
    k = int(np.floor(np.pi / (4 * theta)))           # best whole number of rounds
    p = np.sin((2 * k + 1) * theta) ** 2
    print(f"{N:9,d}   {M:4d}       {k:5d}          {p:.3f}         {(N + 1) / (M + 1):12,.1f}")
```

```text
   N           M    Grover rounds   P(success)   classical tries (average)
       16      1           3          0.961                  8.5
       16      2           2          0.945                  5.7
       16      4           1          1.000                  3.4
1,048,576      1         804          1.000            524,288.5
1,048,576     16         201          1.000             61,681.0
```

ख़ास मामला देखें M/N = ¼: एक round **निश्चितता** से जवाब देता है (θ = 30°, और 3θ = 90°)। एक जवाब वाली दस लाख चीज़ों के लिए 804 rounds लगभग 1 की probability से सफल होते हैं, आधे करोड़ से ज़्यादा classical कोशिशों के मुक़ाबले।

अगर आप M नहीं जानते तो? तब आप नहीं जानते कितने rounds चलाने हैं। दो इलाज: बढ़ती range से random संख्या में rounds के साथ Grover चलाओ (जो फिर भी औसतन लगभग √(N/M) queries में हल ढूँढता है), या पहले **quantum counting** से M का अनुमान लगाओ, जो Grover घुमाव पर लगाया amplitude estimation (पाठ 25) है।

## असली oracle: एक तर्क पहेली हल करना

अब तक के उदाहरणों में oracle को जवाब "पता" था, क्योंकि हमने उसे target bitstring से बनाया। सीखने के लिए ठीक है, लेकिन व्यवहार में बेकार: अगर आपको जवाब पहले से पता है, तो खोज की ज़रूरत नहीं। असली oracle को gates से x से f(x) **निकालना** होता है, ताकि वह पहले से जाने बिना जवाब पहचान सके।

यहाँ एक छोटी **satisfiability** (SAT) समस्या है: ऐसे bits x₀, x₁, x₂ ढूँढो जो इस सूत्र को सच बनाएँ:

> (x₀ OR x₁) AND (NOT x₀ OR x₂) AND (NOT x₁ OR NOT x₂)

Oracle हर clause को Toffoli gates से एक अतिरिक्त **ancilla** qubit में निकालता है (OR, NOTs के AND का NOT है), |−⟩ में तैयार एक output qubit को पलटता है अगर तीनों clauses सच हों (phase kickback उस पलटाव को −1 चिह्न में बदलता है), और फिर clauses को **uncompute** करता है ताकि ancillas |0⟩ पर लौटें। यह आख़िरी क़दम मायने रखता है: ancillas में बचा कचरा जवाबों से entangled होता और interference बिगाड़ देता।

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

# Find x0, x1, x2 satisfying (x0 OR x1) AND (NOT x0 OR x2) AND (NOT x1 OR NOT x2)
clauses = [[(0, True), (1, True)], [(0, False), (2, True)], [(1, False), (2, False)]]   # (variable, positive?)
x, anc, out = [0, 1, 2], [3, 4, 5], 6

def compute_clauses(qc):
    for c, ((a, pa), (b, pb)) in zip(anc, clauses):
        flips = [v for v, positive in ((a, pa), (b, pb)) if positive]
        if flips: qc.x(flips)
        qc.ccx(a, b, c)           # c = (NOT lit_a) AND (NOT lit_b)
        if flips: qc.x(flips)
        qc.x(c)                   # c = lit_a OR lit_b

qc = QuantumCircuit(7)
qc.h(x)
qc.x(out); qc.h(out)              # output qubit in |−⟩: flipping it gives a phase of −1 (kickback, Lesson 22)
# Oracle: compute every clause, flip the output if all are true, then UNCOMPUTE the clauses
compute_clauses(qc)
qc.mcx(anc, out)
undo = QuantumCircuit(7); compute_clauses(undo)
qc.compose(undo.inverse(), inplace=True)
# Diffusion on the three variable qubits
qc.h(x); qc.x(x); qc.h(2); qc.ccx(0, 1, 2); qc.h(2); qc.x(x); qc.h(x)

state = Statevector(qc)
answers = {str(k): round(float(v), 3) for k, v in state.probabilities_dict(qargs=x).items() if v > 1e-9}
print("after ONE Grover round, x2 x1 x0 →", answers)
print("clause ancillas back to 0:", round(float(state.probabilities_dict(qargs=anc).get("000", 0)), 6))
```

```text
after ONE Grover round, x2 x1 x0 → {'010': 0.5, '101': 0.5}
clause ancillas back to 0: 1.0
```

सूत्र के 8 में से ठीक 2 हल हैं (M/N = ¼), तो एक round निश्चितता से उन पर पहुँचता है: x₂x₁x₀ = 010 या 101, हर एक आधे समय। जाँचें: 010 के लिए x₀ = 0, x₁ = 1, x₂ = 0 हर clause को सच बनाता है। और ancillas साफ़ तौर पर 0 पर लौट आए। कहीं भी हमने circuit को नहीं बताया कि हल क्या हैं: उसने सभी inputs के superposition पर सूत्र निकालकर, और interference से, उन्हें ढूँढा।

यह Grover को किसी भी ऐसी समस्या पर लगाने का सामान्य नुस्ख़ा है जिसके हल किसी circuit से **जाँचे** जा सकें: scheduling, constraint satisfaction, keys ढूँढना, इत्यादि।

## Grover सबसे अच्छा है

क्या कोई चतुर quantum algorithm तेज़ खोज सकता है? नहीं। 1997 में Bennett, Bernstein, Brassard और Vazirani ने साबित किया कि बिना ढाँचे की खोज के लिए **किसी भी** quantum algorithm को कम से कम लगभग √N oracle queries चाहिए। Grover का algorithm इस सीमा से मेल खाता है, तो यह सबसे अच्छा है।

इसका बड़ा नतीजा है (पाठ 31): quantum computers से NP-complete समस्याएँ कुशलता से हल करने की उम्मीद नहीं। 2ⁿ संभावनाओं पर brute-force खोज Grover से 2^(n/2) बनती है, फिर भी exponential। 100 variables वाली SAT समस्या के लिए Grover को लगभग 2⁵⁰ ≈ 10¹⁵ rounds चाहिए, हर एक बड़ा circuit।

## ईमानदार सीमाएँ

- **Quadratic, exponential नहीं।** Error-corrected hardware पर हर round धीमा है, तो classical computers से crossover के लिए बहुत बड़े खोज क्षेत्र चाहिए (पाठ 31 इसका हिसाब लगाता है)।
- **Oracle महँगा हो सकता है।** हर round को f reversibly निकालना होता है, अक्सर कई ancillas और T gates के साथ।
- **ढाँचा Grover को हराता है।** असली समस्याओं में आम तौर पर ढाँचा होता है जिसका अच्छे classical algorithms फ़ायदा उठाते हैं; Grover ढाँचे को नज़रअंदाज़ करता है, तो उसकी तुलना brute force से नहीं, सबसे अच्छे classical तरीके से होनी चाहिए।
- **कहाँ मायने रखता है:** symmetric cryptography। Grover किसी cipher की प्रभावी key लंबाई आधी कर देता है, इसीलिए लंबी सुरक्षा के लिए AES-256 की सलाह है (पाठ 43)। Grover-शैली का amplitude amplification कई दूसरे quantum algorithms के अंदर भी subroutine है (पाठ 25)।

## आज़माकर देखें

1. N = 64 और एक जवाब के लिए θ क्या है, और कितने rounds चलाने चाहिए?
2. Amplitude table में तीसरे round के बाद जवाब की probability क्यों गिरती है?
3. M/N = ¼ होने पर एक round के बाद P(सफलता) क्या है? ज्यामितीय रूप से समझाएँ।
4. Qiskit code में target को "011" करें। क्या probabilities बदलती हैं? क्यों या क्यों नहीं?
5. SAT oracle को clause ancillas uncompute क्यों करने चाहिए?
6. 2⁸⁰ keys पर brute-force खोज को मोटे तौर पर कितने Grover rounds चाहिए? क्या यह व्यावहारिक है?
7. Grover का algorithm NP-complete समस्याओं को आसान क्यों नहीं बनाता?

**जवाब:**

1. sin θ = 1/8, तो θ ≈ 0.125 rad ≈ 7.2°। Rounds ≈ π/(4θ) − ½ ≈ 6.27 − 0.5 ≈ 5.8, तो **6**, जिससे P ≈ sin²(13θ) ≈ 0.997।
2. State हर round 2θ घूमती रहती है और |w⟩ के पार निकल जाती है। चोटी के बाद हर अतिरिक्त round उसे जवाब से दूर ले जाता है।
3. **1** (निश्चितता)। sin θ = ½ से θ = 30°; एक round के बाद कोण 3θ = 90° है, ठीक |w⟩।
4. **नहीं।** Symmetry से हर target बराबर है; बस बदलता है कि कौन-सी state बढ़ती है।
5. वरना ancillas x register से entangled रहते, अलग x के लिए अलग मान लिए। तब branches interfere नहीं करतीं, और diffusion क़दम काम नहीं करता।
6. लगभग (π/4)·2⁴⁰ ≈ 8.6 × 10¹¹ rounds, हर एक बड़ा error-corrected circuit: **व्यावहारिक नहीं**, इसीलिए 256-bit keys वाला AES सुरक्षित रहता है।
7. Grover बिना ढाँचे की खोज के लिए सबसे अच्छा है और सिर्फ़ quadratic speed-up देता है: 2ⁿ बनता है 2^(n/2), फिर भी exponential।

## सार-सूत्र

| विचार | सूत्र या तथ्य |
|---|---|
| समस्या | सिर्फ़ oracle से N चीज़ों में f(x) = 1 वाला x ढूँढो |
| Phase oracle | O\|x⟩ = (−1)^f(x)\|x⟩ |
| Diffusion | औसत के गिर्द उलटना: a → 2·औसत − a |
| ज्यामिति | हर round 2θ घुमाता है, sin θ = √(M/N) |
| सफलता | P = sin²((2k + 1)θ) |
| सबसे अच्छे rounds | k ≈ π/(4θ) − ½ ≈ (π/4)√(N/M) |
| आगे निकलना | बहुत ज़्यादा rounds सफलता की probability घटाते हैं |
| M/N = ¼ | एक round निश्चितता से सफल |
| अनजान M | Random rounds, या quantum counting (पाठ 25) |
| असली oracles | Gates से f निकालो, ancillas इस्तेमाल करो, फिर uncompute करो |
| सबसे अच्छा | Ω(√N) queries चाहिए (BBBV, 1997) |
| सीमाएँ | सिर्फ़ quadratic; महँगे oracles; ढाँचा समझने वाले classical तरीके मुक़ाबला करते हैं |
| Crypto असर | Symmetric key ताक़त आधी: AES-256 इस्तेमाल करो |
