---
layout: ../../../layouts/Post.astro
lang: hi
title: "Quantum chemistry और quantum machine learning"
description: "दो सबसे चर्चित इस्तेमाल के क्षेत्र, ईमानदारी से जाँचे गए। Classical computers के लिए molecules कठिन क्यों हैं, molecule को qubits में बदलना, hydrogen molecule की energy सटीक और VQE से निकाली, near-term chemistry के measurement की क़ीमत (हिसाब के साथ), fault-tolerant chemistry को क्या चाहिए, एक चलता quantum-kernel classifier जिसकी classical से तुलना की, barren plateaus नापे, और असली संभावना को hype से अलग करने की checklist।"
date: 2026-11-04
category: lesson
lesson: 45
---

पूछिए "quantum computers किस काम आएँगे?" और दो सबसे आम जवाब हैं **chemistry** और **machine learning**। ये बहुत अलग मामले हैं। Chemistry सबसे मज़बूत क्षेत्रों में से एक है, क्योंकि molecules quantum systems हैं और पाठ 29 ने दिखाया कि quantum systems simulate करना वहीं है जहाँ exponential speed-ups रहते हैं। Machine learning कहीं ज़्यादा अनिश्चित है: दिलचस्प विचार हैं, लेकिन गंभीर रुकावटें भी, और कई दावे जो जाँच में नहीं टिके।

यह पाठ दोनों को असली हिसाब से देखता है: आप simulated quantum computer पर hydrogen molecule की energy निकालेंगे, देखेंगे कि उसे नापने में कितना ख़र्च है, एक quantum-kernel classifier बनाकर उसकी classical से ईमानदार तुलना करेंगे, और "barren plateau" समस्या नापेंगे जो variational algorithms को सताती है।

## भाग 1: Quantum chemistry

### Molecules कठिन क्यों हैं

Chemistry molecules के electrons से चलती है: वे कहाँ हैं, यह bond की ताक़त, reaction की दर, रंग, catalytic गतिविधि और दवा का अपने target से चिपकना तय करता है। Electrons quantum mechanics मानते हैं, और M orbitals में फैले N electrons वाले molecule का wavefunction molecule के आकार के साथ exponentially बढ़ता है। उसे classical computer पर सटीक simulate करना कुछ दर्जन orbitals से आगे नामुमकिन है।

Classical chemistry के पास बढ़िया अनुमान हैं। **Density functional theory (DFT)** हज़ारों atoms संभालती है और industry में रोज़ इस्तेमाल होती है, और **coupled-cluster** तरीके "साधारण" molecules के लिए बहुत सटीक हैं। वे **strongly correlated** systems से जूझते हैं, जहाँ कई electrons जटिल तरीके से entangled हैं: transition-metal catalysts, कुछ battery materials, high-temperature superconductors, और **nitrogenase** जैसे enzymes, जिसका FeMoco cluster कमरे के तापमान पर हवा से nitrogen बाँधता है जबकि industry को energy-भूखी Haber–Bosch प्रक्रिया चाहिए, जो दुनिया की natural gas का कुछ प्रतिशत इस्तेमाल करती है। यही वे targets हैं जहाँ quantum computer मायने रख सकता है।

### Molecule से qubits तक

नुस्ख़े में तीन क़दम हैं:

1. **Basis चुनो।** हर electron की संभव जगहों को orbitals के सीमित set (**basis set**) से दिखाओ। बड़े basis sets ज़्यादा सटीक हैं और ज़्यादा qubits चाहते हैं।
2. **Hamiltonian के coefficients classically निकालो:** integrals जो हर electron की kinetic energy, nuclei की ओर उसका खिंचाव, और electrons की जोड़ियों के बीच प्रतिकर्षण बताते हैं। यह आम और तेज़ है।
3. **Qubits पर ले जाओ।** हर spin-orbital एक qubit बनता है (भरा = |1⟩, ख़ाली = |0⟩), और electron operators Pauli strings बनते हैं, **Jordan–Wigner** जैसी mapping से। नतीजा Hamiltonian H = Σ cᵢPᵢ है, Pauli strings का भारित जोड़, ठीक उस क़िस्म का observable जो पाठ 19 और 30 ने नापा।

सबसे छोटे basis में hydrogen molecule H₂ के 4 spin-orbitals हैं, जिन्हें symmetries सिर्फ़ **2 qubits** तक घटा देती हैं। यहाँ स्वाभाविक bond लंबाई पर उसका Hamiltonian है, सीधे diagonalisation से निकाली energies के साथ:

```python
import numpy as np
from qiskit.quantum_info import SparsePauliOp

# The hydrogen molecule H2 at 0.735 Å (its natural bond length), minimal basis set, reduced to 2 qubits.
# The coefficients (in hartree) come from a standard quantum-chemistry calculation of the electron integrals.
H = SparsePauliOp.from_list([("II", -1.052373245772859), ("IZ", 0.39793742484318045),
                             ("ZI", -0.39793742484318045), ("ZZ", -0.01128010425623538),
                             ("XX", 0.18093119978423156)])
nuclear_repulsion = 0.7199689944489797           # the two protons repel each other

energies = np.linalg.eigvalsh(H.to_matrix())
print("electronic energy levels (Ha):", np.round(energies, 6))
print(f"ground-state energy of H2 = {energies[0] + nuclear_repulsion:.6f} Ha  "
      f"(= {(energies[0] + nuclear_repulsion) * 27.2114:.3f} eV)")
```

```text
electronic energy levels (Ha): [-1.857275 -1.244585 -0.882722 -0.224911]
ground-state energy of H2 = -1.137306 Ha  (= -30.948 eV)
```

सबसे निचला level, और दोनों protons के बीच का प्रतिकर्षण, इस basis में H₂ की ground-state energy देता है: −1.137 hartree (energy की atomic इकाई, 27.2 eV)। Quantum computer को यही संख्या दोहरानी चाहिए। बेशक 2-qubit Hamiltonian classically आसानी से diagonalise होता है; बात तरीके की है, जो उन molecules तक बढ़ता है जहाँ diagonalisation असंभव है।

### H₂ के लिए VQE

Near-term hardware पर मानक तरीका **variational quantum eigensolver** है (पाठ 30): एक parameterised circuit trial state तैयार करता है, quantum computer उसकी energy का अनुमान लगाता है, और classical optimiser energy घटाने के लिए parameters बदलता है। यहाँ Qiskit के Estimator और SciPy के COBYLA optimiser के साथ पूरा loop है:

```python
import numpy as np
from scipy.optimize import minimize
from qiskit import QuantumCircuit
from qiskit.circuit import ParameterVector
from qiskit.primitives import StatevectorEstimator
from qiskit.quantum_info import SparsePauliOp

H = SparsePauliOp.from_list([("II", -1.052373245772859), ("IZ", 0.39793742484318045),
                             ("ZI", -0.39793742484318045), ("ZZ", -0.01128010425623538),
                             ("XX", 0.18093119978423156)])
exact = np.linalg.eigvalsh(H.to_matrix())[0]

theta = ParameterVector("θ", 4)
ansatz = QuantumCircuit(2)
ansatz.ry(theta[0], 0); ansatz.ry(theta[1], 1)
ansatz.cx(0, 1)
ansatz.ry(theta[2], 0); ansatz.ry(theta[3], 1)

estimator = StatevectorEstimator()
history = []
def energy(params):
    e = estimator.run([(ansatz, H, params)]).result()[0].data.evs
    history.append(float(e))
    return float(e)

result = minimize(energy, x0=[0.1, 0.1, 0.1, 0.1], method="COBYLA", options={"maxiter": 300})
print(f"VQE energy   {result.fun:.6f} Ha after {len(history)} energy evaluations")
print(f"exact energy {exact:.6f} Ha")
error_mHa = abs(result.fun - exact) * 1000
print(f"error = {error_mHa:.4f} mHa  ({'within' if error_mHa < 1.6 else 'outside'} chemical accuracy, 1.6 mHa)")
```

```text
VQE energy   -1.857275 Ha after 64 energy evaluations
exact energy -1.857275 Ha
error = 0.0000 mHa  (within chemical accuracy, 1.6 mHa)
```

VQE 64 energy evaluations में सटीक ground energy ढूँढ लेता है। Chemists **chemical accuracy** की परवाह करते हैं, 1.6 milli-hartree (लगभग 1 kcal/mol), reaction दरों का भरोसेमंद अनुमान लगाने के लिए ज़रूरी सटीकता, और यह नतीजा उसके बहुत अंदर है। असली hardware पर पहला VQE प्रयोग (Peruzzo और साथी, 2014, photonic chip पर) और छोटे molecules पर IBM के 2017 के प्रदर्शन ठीक इसी pattern पर चले।

### पेंच: measurement की क़ीमत

असली device पर हर energy का अनुमान **shots** से लगता है, और हर Pauli पद का हर shot सिर्फ़ ±1 देता है। Chemical accuracy तक पहुँचने के लिए ज़रूरी shots मोटे तौर पर (Σ|cᵢ| / ε)² हैं:

```python
import numpy as np

coeffs = {"IZ": 0.39793742484318045, "ZI": -0.39793742484318045, "ZZ": -0.01128010425623538, "XX": 0.18093119978423156}
target = 1.6e-3                                 # chemical accuracy: 1.6 milli-hartree

# Each shot of a Pauli term gives ±1. Spreading shots well across terms, the error is about Σ|c| / √shots.
weight = sum(abs(c) for c in coeffs.values())
print(f"H2: Σ|c| = {weight:.3f} Ha  →  about {(weight / target) ** 2:,.0f} shots for ONE energy estimate")

# Larger molecules: the number of Hamiltonian terms grows roughly like (number of qubits)^4
for n in [20, 50, 100]:
    print(f"{n:3d} qubits: roughly {n ** 4 / 8:,.0f} Pauli terms")
```

```text
H2: Σ|c| = 0.988 Ha  →  about 381,373 shots for ONE energy estimate
 20 qubits: roughly 20,000 Pauli terms
 50 qubits: roughly 781,250 Pauli terms
100 qubits: roughly 12,500,000 Pauli terms
```

H₂ के लिए भी chemical accuracy तक एक energy अनुमान को लगभग 3,80,000 shots चाहिए, और एक optimisation को सैकड़ों अनुमान। बड़े molecules के लिए पदों की संख्या qubits की संख्या की लगभग चौथी घात से बढ़ती है, और coefficients छोटे नहीं होते। Commute करने वाले पदों को समूहों में रखना, चतुर measurement योजनाएँ, और error mitigation (पाठ 36) सब मदद करते हैं, लेकिन measurement ख़र्च, noise और barren plateaus (नीचे) का मतलब है कि VQE ने अब तक व्यावहारिक रुचि के किसी molecule के लिए classical chemistry तरीकों को नहीं हराया।

### Fault-tolerant रास्ता

Chemistry की लंबी अवधि की योजना अलग है: molecular Hamiltonian के तहत time evolution (पाठ 29) पर लगाया गया **quantum phase estimation** (पाठ 27)। Ground state से अच्छे overlap वाली शुरुआती state मिल जाए, तो यह कहीं कम दोहरावों में ऊँची सटीकता से energy देता है, लेकिन इसे गहरे circuits और इसलिए error correction (पाठ 33 से 35) चाहिए।

Industry के लिए प्रासंगिक molecules, जैसे FeMoco और cytochrome P450 enzymes, के resource अनुमान पिछले दशक में algorithms सुधरने से नाटकीय रूप से गिरे हैं, लेकिन वे अब भी लाखों physical qubits (या आशावादी hardware के साथ कुछ लाख) माँगते हैं, घंटों से दिनों तक चलते हुए। इसलिए chemistry के शुरुआती fault-tolerant quantum computers के **पहले** क़ीमती इस्तेमालों में होने की उम्मीद है, आज के devices के नहीं। ईमानदार खुले सवाल बचे हैं: अच्छी शुरुआती states कितनी बार तैयार हो सकती हैं, और क्या सुधरते classical तरीके कई molecules के लिए फ़ासला पाट देंगे।

## भाग 2: Quantum machine learning

### विचार

Quantum machine learning (QML) पूछता है कि क्या quantum computers data से तेज़ या बेहतर सीख सकते हैं। मुख्य तरीके:

- **Data encode करना।** Classical data को पहले quantum states में भरना होता है: rotation कोणों के रूप में (**angle encoding**, हर qubit पर एक या कुछ features) या amplitudes में (**amplitude encoding**, n qubits में 2ⁿ संख्याएँ, लेकिन तैयार करना महँगा, पाठ 31)।
- **Variational classifiers** ("quantum neural networks"): एक parameterised circuit encoded data पर काम करता है, और उसके parameters neural network के weights की तरह train होते हैं।
- **Quantum kernels:** दो data points को quantum states में encode करो और उनके **overlap** |⟨φ(x)|φ(x′)⟩|² को classical support-vector machine के अंदर समानता के माप की तरह इस्तेमाल करो। उम्मीद यह है कि कुछ quantum feature maps ऐसी समानताएँ निकालें जो classically निकालना कठिन है।

### एक quantum-kernel classifier

यहाँ एक क्लासिक test dataset (बिंदुओं के दो संकेंद्रित वृत्त) पर पूरा quantum-kernel classifier है, हर 2D बिंदु को 2 qubits में encode करने के लिए **ZZ feature map** इस्तेमाल करते हुए, एक मानक classical kernel से तुलना के साथ:

```python
import numpy as np
from sklearn.datasets import make_circles
from sklearn.model_selection import train_test_split
from sklearn.svm import SVC
from qiskit.circuit.library import zz_feature_map
from qiskit.quantum_info import Statevector

X, y = make_circles(n_samples=120, noise=0.08, factor=0.5, random_state=0)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

feature_map = zz_feature_map(feature_dimension=2, reps=2)      # encodes a 2D point into a 2-qubit state
def state(x):
    return Statevector(feature_map.assign_parameters(x))

def kernel(A, B):
    """Quantum kernel: K(x, x') = |⟨φ(x)|φ(x')⟩|², the overlap of the two encoded states."""
    SA, SB = [state(a) for a in A], [state(b) for b in B]
    return np.array([[abs(sa.inner(sb)) ** 2 for sb in SB] for sa in SA])

quantum = SVC(kernel="precomputed").fit(kernel(X_train, X_train), y_train)
q_acc = quantum.score(kernel(X_test, X_train), y_test)
classical = SVC(kernel="rbf").fit(X_train, y_train)
print(f"quantum-kernel SVM accuracy:  {q_acc:.2f}")
print(f"classical RBF SVM accuracy:   {classical.score(X_test, y_test):.2f}")
```

```text
quantum-kernel SVM accuracy:  1.00
classical RBF SVM accuracy:   1.00
```

दोनों test set को पूरी तरह सही classify करते हैं। छोटे classical datasets पर ज़्यादातर QML benchmarks की यही ईमानदार तस्वीर है: quantum तरीके काम करते हैं, लेकिन classical तरीके उतना ही अच्छा, तेज़ और सस्ते में करते हैं। असली फ़ायदा दिखाने के लिए ऐसी समस्या चाहिए जहाँ quantum kernel ऐसा ढाँचा पकड़े जो कोई कुशल classical तरीका न पकड़ सके, और ऐसी समस्याएँ सिर्फ़ ख़ास बनाए datasets (जैसे discrete logarithms पर आधारित) के लिए ज्ञात हैं, प्राकृतिक data के लिए नहीं।

### Barren plateaus

Variational circuit train करने का मतलब gradients के साथ नीचे उतरना है। 2018 में McClean और साथियों ने दिखाया कि कई qubits पर random, गहरे circuits के लिए gradients लगभग हर जगह **exponentially छोटे** हो जाते हैं: cost landscape एक विशाल सपाट मैदान है, एक **barren plateau**, जहाँ optimiser बता नहीं पाता कि किधर जाए। Random parameters के लिए एक global cost function के सटीक gradients parameter-shift नियम से निकालकर इसे नापें:

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, SparsePauliOp

rng = np.random.default_rng(7)

def circuit(n, params):
    """A 'hardware-efficient' random ansatz: n layers of RY rotations and a chain of CZs."""
    qc = QuantumCircuit(n)
    k = 0
    for _ in range(n):
        for q in range(n):
            qc.ry(params[k], q); k += 1
        for q in range(n - 1):
            qc.cz(q, q + 1)
    return qc

def gradient_spread(n, samples=60):
    cost = SparsePauliOp("Z" * n)                       # a "global" cost: all qubits at once
    grads = []
    for _ in range(samples):
        p = rng.uniform(0, 2 * np.pi, n * n)
        shift = np.zeros_like(p); shift[0] = np.pi / 2   # parameter-shift rule for the first angle
        e_plus = Statevector(circuit(n, p + shift)).expectation_value(cost).real
        e_minus = Statevector(circuit(n, p - shift)).expectation_value(cost).real
        grads.append(0.5 * (e_plus - e_minus))
    return np.var(grads)

print("qubits   variance of the gradient")
for n in [2, 4, 6, 8, 10]:
    print(f"  {n:2d}        {gradient_spread(n):.2e}")
```

```text
qubits   variance of the gradient
   2        1.64e-01
   4        4.97e-02
   6        1.78e-02
   8        4.59e-03
  10        6.01e-04
```

हर दो qubits जुड़ने पर gradient का आम आकार लगभग 3 से 4 गुना घटता है। 50 qubits पर gradients किसी भी व्यावहारिक measurement के shot noise से कहीं छोटे होंगे, और training रुक जाएगी। इलाज में **local** cost functions (सबके बजाय कुछ qubits नापना), सामान्य के बजाय समस्या-प्रेरित circuits, और सावधान शुरुआत शामिल हैं, लेकिन एक गहरा मोड़ है: हाल की research बताती है कि barren plateaus से बचने लायक़ ढाँचे वाले circuits अक्सर **classically simulate** होने लायक़ ढाँचे वाले भी होते हैं, जो quantum फ़ायदा हटा देगा।

### पेंच, एक साथ

- **Data भरना:** बड़े classical dataset को encode करना उतना महँगा हो सकता है जितनी वह गणना जिसे तेज़ करना था (पाठ 31)।
- **Dequantisation:** कई मशहूर QML speed-ups की उसी data पहुँच वाले classical algorithms ने बराबरी कर ली (Ewin Tang, 2018, और आगे)।
- **Trainability:** barren plateaus और noise बड़े variational models को train करना कठिन बनाते हैं।
- **Benchmarks:** छोटे प्रदर्शनों की आम तौर पर classical तरीके बराबरी कर लेते हैं।

### जहाँ QML फिर भी जीत सकता है

सबसे आशाजनक दिशा **quantum data** है: quantum प्रयोगों, sensors या simulations के outputs से सीखना, जहाँ data पहले से quantum है और भरना नहीं पड़ता। Theory दिखाती है कि quantum memory वाला quantum computer quantum systems के कुछ गुण किसी भी classical learner से **exponentially कम** प्रयोगों में सीख सकता है, और Google ने इसे 2022 में दिखाया (Huang और साथी)। यह असली, साबित फ़ायदा है, बस spam filters या image recognition के लिए नहीं।

## Hype पहचानने की checklist

जब आप quantum chemistry या QML के बारे में कोई दावा पढ़ें, पूछें:

1. **किससे तुलना?** क्या **सबसे अच्छे** classical तरीके (DFT, coupled cluster, tensor networks, अच्छी तरह tune किया neural network) से, या कमज़ोर से?
2. **किस आकार पर?** छोटे प्रदर्शन (कुछ qubits) हमेशा classically simulate होते हैं। 100 या 1,000 qubits पर क्या होता है?
3. **Data भरने और पढ़ने का क्या?** क्या वे ख़र्च शामिल हैं?
4. **Noise और shots:** क्या नतीजे असली hardware पर थे, और कितने shots और कितना mitigation लगा?
5. **Speed-up साबित है, या उम्मीद?** और क्या वह dequantisation की कोशिशों के सामने टिका?

Chemistry इस test में ज़्यादातर क्षेत्रों से बेहतर पास होती है: समस्या सच में quantum है, target molecules ज्ञात हैं, और resource अनुमान ठोस हैं। पाठ 46 यही test optimisation और finance पर लगाता है।

## आज़माकर देखें

1. FeMoco जैसे strongly correlated molecules quantum computers के लिए अच्छे targets क्यों हैं जब साधारण molecules नहीं?
2. सीधी Jordan–Wigner mapping के साथ 10-orbital, 2-spin basis को कितने qubits चाहिए?
3. H₂ उदाहरण में diagonalise करने के बाद nuclear repulsion क्यों जोड़ते हैं?
4. (Σ|c|/ε)² से, 10 mHa सटीकता के लिए H₂ को कितने shots चाहिए?
5. दोनों classifiers ने 1.00 पाया। इस dataset के लिए quantum फ़ायदे के बारे में यह क्या बताता है?
6. Barren plateau, perfect optimiser के साथ भी, training को fail क्यों करता है?
7. "Quantum data" क्या है, और वहाँ QML ज़्यादा आशाजनक क्यों है?

**जवाब:**

1. DFT और coupled cluster जैसे classical तरीके साधारण molecules अच्छी तरह संभालते हैं, तो पाने को कम है। Strongly correlated systems में कई entangled electrons होते हैं, जो उन अनुमानों को हराते हैं लेकिन quantum computer के लिए स्वाभाविक हैं।
2. 10 orbitals × 2 spins = **20 qubits**।
3. Qubit Hamiltonian सिर्फ़ electrons को बताता है (nuclei स्थिर रखकर)। तय geometry पर proton–proton प्रतिकर्षण एक स्थिरांक है, तो अंत में जोड़ा जाता है।
4. (0.988 / 0.010)² ≈ **9,800** shots।
5. कुछ सकारात्मक नहीं: classical kernel उतना ही अच्छा, तेज़ करता है। काम के quantum तरीके को ऐसी समस्या पर सबसे अच्छे classical तरीके को हराना चाहिए जहाँ यह कठिन हो।
6. Gradients सीमित shots के सांख्यिकीय noise की तुलना में exponentially छोटे हैं, तो नापे gradients पर noise हावी है और वे random दिशाओं में इशारा करते हैं।
7. Quantum systems (प्रयोगों, sensors, quantum simulations) से बना data। वह पहले से quantum रूप में है, तो कोई महँगा भरने का क़दम नहीं, और कुछ सीखने के कामों के लिए quantum learners को साबित रूप से exponentially कम प्रयोग चाहिए।

## सार-सूत्र

| विचार | सूत्र या तथ्य |
|---|---|
| Chemistry क्यों | Electrons quantum हैं; सटीक simulation classically exponential है |
| कठिन मामले | Strongly correlated systems: catalysts, FeMoco, कुछ materials |
| नुस्ख़ा | Basis set → classical integrals → qubit Hamiltonian H = Σ cᵢPᵢ (Jordan–Wigner) |
| H₂ (minimal basis) | Symmetry के बाद 2 qubits; nuclear repulsion के साथ E₀ = −1.137 Ha |
| Chemical accuracy | 1.6 mHa ≈ 1 kcal/mol |
| VQE | Parameterised circuit + Estimator + classical optimiser (पाठ 30) |
| Shot ख़र्च | हर energy पर ≈ (Σ\|cᵢ\|/ε)²; पद ≈ N⁴ से बढ़ते हैं |
| Fault-tolerant chemistry | e^(−iHt) पर phase estimation; FeMoco जैसी समस्याओं के लिए लाखों physical qubits |
| Data encoding | Angle encoding (सस्ता), amplitude encoding (छोटा लेकिन भरना महँगा) |
| Quantum kernel | K(x, x′) = \|⟨φ(x)\|φ(x′)⟩\|², classical SVM में |
| Barren plateau | Qubits के साथ gradients exponentially घटते हैं (McClean 2018) |
| Dequantisation | QML दावों की बराबरी करते classical algorithms (Tang 2018) |
| असली संभावना | Quantum data से सीखना (साबित exponential फ़ायदा, 2022) |
| Hype checklist | सबसे अच्छा classical आधार? आकार? Data भरना? Noise और shots? साबित speed-up? |
