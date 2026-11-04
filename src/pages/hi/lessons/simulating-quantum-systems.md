---
layout: ../../../layouts/Post.astro
lang: hi
title: "Quantum systems का simulation"
description: "वह application जिसके लिए Feynman ने quantum computers का प्रस्ताव रखा: Hamiltonians, Pauli पदों के जोड़ की तरह, e^(−iHt) को gates में बदलना, हर Pauli exponential को CNOTs और एक घुमाव से बनाना, Trotter क़दम और उनकी ग़लतियाँ (first और second order, कोड में नापी), simulations क्या निकालते हैं, और classical तरीकों से होड़ पर ईमानदार नज़र।"
date: 2026-11-04
category: lesson
lesson: 29

---

1981 में Richard Feynman ने MIT में एक भाषण दिया जिसे अक्सर quantum computing की शुरुआत कहा जाता है। उनका तर्क आसान था। किसी quantum system को साधारण कंप्यूटर पर simulate करने में ऐसे संसाधन लगते हैं जो उसके आकार के साथ **exponentially** बढ़ते हैं (पाठ 1 की दोगुनी होती table)। लेकिन प्रकृति ख़ुद को आसानी से simulate करती है। तो क्यों न quantum हिस्सों से कंप्यूटर बनाया जाए, और उसे दूसरे quantum systems की सीधे नक़ल करने दिया जाए? उनके शब्दों में: *"प्रकृति classical नहीं है, और अगर आप प्रकृति का simulation बनाना चाहते हैं, तो बेहतर है उसे quantum mechanical बनाएँ।"*

चालीस से ज़्यादा साल बाद भी, molecules, materials और दूसरे quantum systems का simulation वह application है जहाँ quantum computers के असली फ़र्क़ डालने की सबसे ज़्यादा संभावना है। यह पाठ दिखाता है कि यह कैसे काम करता है: भौतिक system कैसे लिखा जाता है, समय के साथ उसका बदलना gates में कैसे बदलता है, अनुमानों की क्या क़ीमत है, और ईमानदार कठिनाइयाँ कहाँ हैं।

## Hamiltonians: quantum system की नियमावली

हर quantum system उसके **Hamiltonian** H से बताया जाता है, एक Hermitian matrix (पाठ 4) जो उसकी **energy** दर्शाती है। दो बातें इसे केंद्रीय बनाती हैं:

- इसके **eigenvalues** संभव energies हैं, और eigenvectors तय energy वाली states। सबसे निचली **ground state** है।
- यह **Schrödinger समीकरण** से तय करता है कि system समय के साथ कैसे बदलता है। हल है

> **|ψ(t)⟩ = e^(−iHt) |ψ(0)⟩**  (ऐसी इकाइयों में जहाँ ħ = 1)

e^(−iHt) एक unitary है (पाठ 11 ने अकेले Paulis के लिए ये बनाए थे)। तो "quantum system को समय t तक simulate करना" मतलब "quantum computer पर unitary e^(−iHt) लगाना"।

### Pauli strings के जोड़ की तरह Hamiltonians

असली systems के Hamiltonians आमतौर पर **आसान स्थानीय पदों** का जोड़ होते हैं, हर एक कुछ कणों पर। Qubits पर हर पद एक Pauli string बन जाता है (पाठ 19)। मानक उदाहरण **transverse-field Ising model** है, n छोटे magnets की एक श्रृंखला:

> H = −J Σᵢ ZᵢZᵢ₊₁ − h Σᵢ Xᵢ

- **ZZ पद** कहते हैं कि पड़ोसी spins एक सीध में रहना पसंद करते हैं (दोनों 0 या दोनों 1 हों तो energy कम), ताक़त J के साथ।
- **X पद** ताक़त h का बग़ल वाला magnetic field है जो हर spin को पलटने की कोशिश करता है।

दोनों में होड़ है: J क्रम चाहता है, h quantum उतार-चढ़ाव। J ≈ h पर श्रृंखला एक **quantum phase transition** पर होती है, जहाँ उसका व्यवहार गणना में बेहद कठिन है। यह quantum simulation का "hello world" है, और IBM ने 2023 में अपने 127-qubit "utility" प्रयोग के लिए इसी का एक रूप इस्तेमाल किया।

Qiskit में:

> `SparsePauliOp.from_sparse_list([("ZZ", [i, i+1], −J) …] + [("X", [i], −h) …], num_qubits=n)`

## एक Pauli पद का exponential

एक पद से शुरू करें। e^(−iθ Z⊗Z) gates से कैसे बनाएँ?

Z⊗Z का eigenvalue +1 है जब दोनों qubits बराबर हों (00, 11) और −1 जब अलग हों (01, 10): यह **parity** है। तो e^(−iθZZ) बराबर-parity वाली states पर phase e^(−iθ) और विषम पर e^(+iθ) लगाता है। तरकीब:

1. Qubit 0 से qubit 1 पर **CNOT**: target अब parity रखता है।
2. Target पर **RZ(2θ)**: parity के हिसाब से phase e^(∓iθ) (पाठ 11)।
3. Parity उलटने के लिए फिर **CNOT**।

X या Y वाले पदों के लिए पहले basis बदलें (H, X को Z बनाता है, पाठ 9), और ZZZZ जैसी लंबी strings के लिए CNOTs की सीढ़ी से सभी qubits की parity एक पर इकट्ठी करें, घुमाएँ, और वापस बिखेरें। **k qubits वाली string के हर Pauli exponential में एक घुमाव और लगभग 2(k − 1) CNOTs लगते हैं।**

```python
import numpy as np
from scipy.linalg import expm
from qiskit import QuantumCircuit
from qiskit.quantum_info import Operator, SparsePauliOp

theta = 0.37
exact = expm(-1j * theta * SparsePauliOp("ZZ").to_matrix())   # e^(-i theta Z Z)

qc = QuantumCircuit(2)
qc.cx(0, 1)
qc.rz(2 * theta, 1)          # RZ(2 theta) = e^(-i theta Z)
qc.cx(0, 1)
print("CNOT - RZ - CNOT equals e^(-i theta ZZ):", np.allclose(Operator(qc).data, exact))

xx = QuantumCircuit(2)       # e^(-i theta X X): the same, seen through Hadamards
xx.h([0, 1]); xx.compose(qc, inplace=True); xx.h([0, 1])
print("with Hadamards around it, e^(-i theta XX):",
      np.allclose(Operator(xx).data, expm(-1j * theta * SparsePauliOp("XX").to_matrix())))
```

```text
CNOT - RZ - CNOT equals e^(-i theta ZZ): True
with Hadamards around it, e^(-i theta XX): True
```

## Trotterisation: कई पद एक साथ

अगर H = A + B, क्या बस पहले e^(−iAt) और फिर e^(−iBt) लगा सकते हैं? सिर्फ़ तब जब A और B **commute** करें (AB = BA)। साधारण नंबरों के लिए e^(a+b) = eᵃeᵇ हमेशा। Matrices के लिए आम तौर पर ग़लत, क्योंकि क्रम मायने रखता है (पाठ 4)। Ising model में ZZ पद और X पद commute नहीं करते, तो यह shortcut ग़लत है।

लेकिन छोटे समय के लिए यह **लगभग** सही है। सुधार, **Lie–Trotter product सूत्र** (Trotter, 1959) से, समय को r छोटे क़दमों में काटना और बारी-बारी चलाना है:

> e^(−i(A+B)t) ≈ (e^(−iAt/r) · e^(−iBt/r))^r

हर टुकड़े की ग़लती (t/r)² गुणा इस बात के अनुपात में है कि A और B कितना commute करने में विफल हैं, तो कुल ग़लती **t²/r** की तरह घटती है। ज़्यादा टुकड़े, छोटी ग़लती, ज़्यादा gates।

एक चतुर क्रम, **second-order (symmetric) Suzuki–Trotter सूत्र**, हर टुकड़े में A का आधा क़दम, B का पूरा क़दम, फिर A का एक और आधा क़दम इस्तेमाल करता है। लागत लगभग वही, पर ग़लती **t³/r²** की तरह घटती है, जो कहीं तेज़ है।

यह 6-qubit Ising श्रृंखला है (J = 1, h = 0.8), |000000⟩ से समय t = 2 तक। हम अलग संख्या के टुकड़ों के लिए Trotterised circuit की सटीक जवाब से तुलना करते हैं:

```python
import numpy as np
from scipy.linalg import expm
from qiskit import QuantumCircuit, transpile
from qiskit.circuit.library import PauliEvolutionGate
from qiskit.synthesis import LieTrotter, SuzukiTrotter
from qiskit.quantum_info import SparsePauliOp, Statevector, state_fidelity

n, J, h, T = 6, 1.0, 0.8, 2.0
zz = [("ZZ", [i, i + 1], -J) for i in range(n - 1)]
x = [("X", [i], -h) for i in range(n)]
H = SparsePauliOp.from_sparse_list(zz + x, num_qubits=n)      # transverse-field Ising chain

start = Statevector.from_label("0" * n)
exact = Statevector(expm(-1j * H.to_matrix() * T) @ start.data)

print(" steps   first-order fidelity   second-order fidelity   CNOTs (1st order)")
for steps in [1, 2, 4, 8, 16]:
    row, cnots = [], 0
    for method in (LieTrotter(reps=steps), SuzukiTrotter(order=2, reps=steps)):
        qc = QuantumCircuit(n)
        qc.append(PauliEvolutionGate(H, time=T, synthesis=method), range(n))
        gates = transpile(qc, basis_gates=["cx", "rz", "sx", "x"], optimization_level=0)
        row.append(state_fidelity(start.evolve(gates), exact))
        cnots = cnots or gates.count_ops().get("cx", 0)
    print(f"{steps:5d}   {row[0]:.4f}                 {row[1]:.4f}                  {cnots}")
```

```text
 steps   first-order fidelity   second-order fidelity   CNOTs (1st order)
    1   0.0584                 0.0623                  10
    2   0.0083                 0.0061                  20
    4   0.5920                 0.9148                  40
    8   0.9121                 0.9956                  80
   16   0.9802                 0.9997                  160
```

Fidelity |⟨सटीक|Trotter⟩|² (पाठ 16) कहानी बताती है:

- 1 या 2 टुकड़ों के साथ नतीजा **बेकार** है (fidelity लगभग 0): समय के क़दम बहुत बड़े हैं।
- 8 टुकड़ों के साथ first order 91% तक पहुँचता है, जबकि second order पहले ही 99.6% पर है।
- 16 टुकड़ों के साथ second order 99.97% पर है।

यहाँ हर टुकड़े में 10 CNOTs लगते हैं (हर ZZ पद पर दो, पाँच ZZ पद), तो सटीकता की क़ीमत **depth** है। और यहीं noise काटता है: 99% वाले 160 CNOTs सिर्फ़ लगभग 20% बार सफल होंगे (पाठ 20 का नियम)। Trotter ग़लती बनाम हार्डवेयर ग़लती का यही समझौता near-term quantum simulation की केंद्रीय व्यावहारिक समस्या है।

### Trotter से बेहतर

Trotter सूत्र आसान और ख़ूब इस्तेमाल होते हैं, लेकिन बेहतर scaling वाले ज़्यादा उन्नत तरीके भी हैं:

| तरीका | विचार | समय t, सटीकता ε के लिए लागत |
|---|---|---|
| First-order Trotter | छोटे क़दम बारी-बारी | ~t²/ε |
| Higher-order Suzuki | Symmetric घोंसलेदार क़दम | order 2k के लिए ~t^(1+1/2k)/ε^(1/2k) |
| qDRIFT (2019) | आकार के हिसाब से random चुने पद लगाओ | पदों की संख्या से स्वतंत्र |
| Linear combinations of unitaries, qubitization | H के "block encoding" से e^(−iHt) सटीक बनाओ | ~t + log(1/ε): लगभग सबसे अच्छा |

आख़िरी row के आसपास ही बड़े error-corrected chemistry simulations की योजना बनती है (पाठ 45)। लेकिन आज की मशीनों पर Trotter ही मुख्य औज़ार है।

## Simulations क्या निकालते हैं

e^(−iHt) लगाना साधन है, लक्ष्य नहीं। काम के outputs:

| Output | कैसे |
|---|---|
| **Dynamics:** अचानक धक्के के बाद magnetisation, current या charge कैसे बदलता है | Evolve करें, फिर Estimator से expectation values नापें (पाठ 19) |
| **Energies:** molecules और materials की ground और excited state energies | e^(−iHt) पर phase estimation (पाठ 27), या variational तरीके (पाठ 30) |
| **Spectra और response:** कोई material रोशनी की कौन-सी frequencies सोखता है | Interference circuits से correlation functions ⟨A(t)B(0)⟩ |
| **पदार्थ की अवस्थाएँ:** magnetism, superconductivity, topological order | कम-energy states बनाएँ, order parameters नापें |

### Electrons को अनुवाद चाहिए

Electrons **fermions** हैं: दो की अदला-बदली state का चिह्न पलट देती है। Qubits अपने आप ऐसा नहीं करते। Molecule simulate करने से पहले उसका Hamiltonian **Jordan–Wigner** (1928) जैसी mapping से Pauli strings में अनुवाद किया जाता है, जो Z operators की strings से चिह्नों का हिसाब रखती है। N spin-orbitals वाला molecule N qubits और कई Pauli strings का जोड़ बन जाता है: छोटे molecules के लिए सैकड़ों से हज़ारों पद। पाठ 45 असली molecules के लिए यह करता है।

### Digital और analog simulators

यहाँ का सब **digital** simulation है: आम-उद्देश्य वाली मशीन पर gates। **Analog** simulation भी होता है: एक नियंत्रित quantum system बनाना (laser रोशनी में ठंडे atoms, trapped ions, superconducting arrays) जिसका अपना Hamiltonian उस वाले की नक़ल करे जिसमें आपकी रुचि है। Analog simulators सैकड़ों कणों के systems पढ़ चुके हैं, कुछ सवालों के लिए सटीक classical गणना से आगे, लेकिन हर एक Hamiltonians के सीमित परिवार की ही नक़ल कर सकता है, और ग़लतियाँ नियंत्रित करना कठिन है। Neutral-atom platforms (पाठ 39) दोनों तरीक़ों में काम कर सकते हैं।

## Classical तरीकों से ईमानदार होड़

Quantum simulation एक होड़ है, और classical कंप्यूटर तेज़ धावक हैं। Physicists ने दशकों में चतुर classical तरीके बनाए हैं: tensor networks (पाठ 20 का MPS उनमें से एक है), quantum Monte Carlo, density functional theory, coupled cluster। कई systems के लिए, ख़ासकर कम entanglement या आसान ढाँचे वालों के लिए, ये बहुत अच्छे काम करते हैं।

एक बताने वाला उदाहरण: जून 2023 में IBM ने 127-qubit kicked Ising model की dynamics simulate की और ऐसे नतीजे दिखाए जिन्हें उनके brute-force classical तरीके नहीं जाँच सके। कुछ हफ़्तों में कई समूहों ने tensor networks और दूसरे अनुमानों से साधारण कंप्यूटरों पर वही नतीजे दोहरा दिए। Quantum computer जीता नहीं था; लेकिन classical तरीकों को बराबरी के लिए और तेज़ होना पड़ा, और प्रयोग ने दिखाया कि noisy मशीनें error mitigation (पाठ 36) के साथ उस पैमाने पर भरोसेमंद नतीजे दे सकती हैं।

आज की आम सहमति: quantum simulation के classical तरीकों को सबसे पहले **strongly correlated** systems (कुछ catalysts, ऊँचे-तापमान superconductors, कुछ magnetic materials) में हराने की संभावना है, जहाँ classical अनुमान टूट जाते हैं, और शायद आज की noisy मशीनों की जगह शुरुआती **error-corrected** मशीनों पर।

## ख़ुद करके देखें

1. 3-qubit Ising श्रृंखला का Hamiltonian, coefficients के साथ Pauli strings की सूची की तरह लिखें (J = 1, h = 0.5)।
2. Ising model की कौन-सी Pauli strings आपस में commute नहीं करतीं? एक जोड़ी दें।
3. CNOT-सीढ़ी तरीके से e^(−iθ Z⊗Z⊗Z⊗Z) को कितने CNOTs चाहिए?
4. First-order Trotter ग़लती t²/r की तरह घटती है। अगर 8 टुकड़े 0.09 ग़लती देते हैं, तो 0.01 के लिए लगभग कितने?
5. पूरी तरह सही Trotter सूत्र के साथ भी आज के हार्डवेयर पर 160 CNOTs समस्या क्यों होंगे?
6. एक वाक्य में, Feynman को प्रकृति के simulation के लिए quantum computers क्यों ज़रूरी लगे?

**जवाब:**

1. −1·ZZI, −1·IZZ, −0.5·XII, −0.5·IXI, −0.5·IIX (qubits के किसी एक जैसे क्रम में)।
2. Z₁Z₂ और X₁ (या X₂): दोनों एक qubit साझा करते हैं जहाँ एक में Z और दूसरे में X है, और Z और X anticommute करते हैं (पाठ 9)।
3. 2 × (4 − 1) = **6** CNOTs, और एक RZ।
4. ग़लती ∝ 1/r, तो 9 गुना छोटी ग़लती के लिए लगभग 9 × 8 = **72** टुकड़े।
5. हर CNOT पर ~1% ग़लती से 0.99¹⁶⁰ ≈ 0.2: ज़्यादातर runs में कम से कम एक ग़लती होगी।
6. क्योंकि quantum states बताने की classical लागत आकार के साथ exponentially बढ़ती है, जबकि quantum computer उन्हें स्वाभाविक रूप से रख सकता है।

## सार

| विचार | सूत्र या तथ्य |
|---|---|
| Hamiltonian | Energy की Hermitian matrix; eigenvalues = energies |
| Time evolution | \|ψ(t)⟩ = e^(−iHt)\|ψ(0)⟩ |
| स्थानीय Hamiltonian | कुछ-कुछ qubits पर Pauli strings का जोड़ |
| Ising श्रृंखला | H = −J Σ ZᵢZᵢ₊₁ − h Σ Xᵢ |
| e^(−iθZZ) | CNOT, RZ(2θ), CNOT |
| X या Y पद | पहले H (या S†H) से basis बदलें |
| k-qubit Pauli string | एक घुमाव + ~2(k − 1) CNOTs |
| Lie–Trotter | e^(−i(A+B)t) ≈ (e^(−iAt/r) e^(−iBt/r))^r; ग़लती ~t²/r |
| Second-order Suzuki | Symmetric क़दम; ग़लती ~t³/r² |
| उन्नत तरीके | qDRIFT, LCU, qubitization (~सबसे अच्छा) |
| Outputs | Dynamics, energies, spectra, पदार्थ की अवस्थाएँ |
| Fermions | Jordan–Wigner, electrons को Pauli strings में बदलता है |
| Analog simulators | ऐसा system बनाओ जो लक्ष्य Hamiltonian की नक़ल करे |
| Classical होड़ | Tensor networks, Monte Carlo, DFT, coupled cluster |
| Qiskit | `SparsePauliOp`, `PauliEvolutionGate`, `LieTrotter`, `SuzukiTrotter` |
