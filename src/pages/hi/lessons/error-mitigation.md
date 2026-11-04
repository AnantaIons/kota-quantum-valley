---
layout: ../../../layouts/Post.astro
lang: hi
title: "Error mitigation"
description: "पूरे error correction के बिना आज के noisy quantum computers से सटीक जवाब निकालना। Mitigation अलग-अलग runs के बजाय औसत क्यों ठीक करता है, readout error mitigation, zero-noise extrapolation, probabilistic error cancellation और उसका exponential ख़र्च, Pauli twirling, dynamical decoupling, व्यवहार में इनका इस्तेमाल, और इनकी सीमाएँ। हर तकनीक simulate करके जाँची गई है।"
date: 2026-11-04
category: lesson
lesson: 36
---

पाठ 33 से 35 ने noise का लंबी अवधि का जवाब दिखाया: error correction। लेकिन उसे हर logical qubit के लिए सैकड़ों physical qubits चाहिए, और आज की सबसे बड़ी machines में ज़्यादा से ज़्यादा कुछ हज़ार physical qubits हैं। पूरे fault tolerance से पहले के सालों में quantum computers वह हैं जिन्हें John Preskill ने 2018 में **NISQ** devices कहा: Noisy Intermediate-Scale Quantum। उनके पास simulate करना कठिन बनाने लायक़ qubits हैं, लेकिन बड़े पैमाने के error correction के लिए बहुत ज़्यादा noise।

**Error mitigation** उन तकनीकों का set है जिनसे NISQ machines से फिर भी काम के जवाब निकलते हैं। यह errors को होते समय पकड़कर ठीक नहीं करता। इसके बजाय यह अतिरिक्त, चतुराई से चुने circuits चलाता है और classical post-processing से अंदाज़ा लगाता है कि noise के बिना नतीजा **क्या होता**। IBM के 2023 के 127-qubit "utility" प्रयोग (पाठ 29) ने इसी तरह noisy machine से सटीक संख्याएँ निकालीं।

## मुख्य विचार: हर run नहीं, औसत ठीक करो

ज़्यादातर near-term algorithms, जैसे VQE (पाठ 30) और simulation (पाठ 29), को एक perfect bitstring नहीं चाहिए। उन्हें एक **expectation value** चाहिए, जैसे energy ⟨H⟩ या magnetisation ⟨Z⟩, जो कई shots का औसत है। इससे समस्या पूरी बदल जाती है। हमें हर shot सही नहीं करना; बस **औसत** सही आना चाहिए।

| | Error correction | Error mitigation |
|---|---|---|
| क्या ठीक करता है | हर run, real time में | कई runs का औसत, बाद में |
| अतिरिक्त qubits | बहुत (हर logical qubit पर सैकड़ों) | कुछ या शून्य |
| अतिरिक्त ख़र्च | Qubits और gates | अतिरिक्त shots और circuits |
| क्या देता है | सही अलग-अलग नतीजे | Expectation values के बेहतर अनुमान |
| बड़े circuits तक चलता है? | हाँ, threshold से नीचे | नहीं: ख़र्च exponentially बढ़ता है |

आख़िरी पंक्ति ही पेंच है, और हम उस पर लौटेंगे। पहले तकनीकें।

## 1. Readout error mitigation

सबसे आसान mitigate होने वाला error measurement error है (पाठ 32), क्योंकि उसे सीधे नापा जा सकता है। हर basis state तैयार करो, उसे कई बार measure करो, और दर्ज करो कि हर नतीजा कितनी बार आता है। इससे **confusion matrix** M मिलती है: entry (i, j), सच्ची state j होने पर i पढ़ने की probability है। फिर आपकी देखी probabilities हैं

> P_observed = M · P_true

तो यह समीकरण हल करके, यानी M⁻¹ से गुणा करके, सच्ची probabilities वापस पा सकते हैं:

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator
from qiskit_aer.noise import NoiseModel, ReadoutError

noise = NoiseModel()
noise.add_readout_error(ReadoutError([[0.97, 0.03], [0.08, 0.92]]), [0])   # qubit 0's readout
noise.add_readout_error(ReadoutError([[0.95, 0.05], [0.06, 0.94]]), [1])   # qubit 1's readout
sim = AerSimulator(noise_model=noise, seed_simulator=11)
shots = 100_000

def probs(qc):
    counts = sim.run(qc, shots=shots).result().get_counts()
    return np.array([counts.get(f"{i:02b}", 0) / shots for i in range(4)])     # order 00, 01, 10, 11

# Step 1: calibrate. Prepare each of the 4 basis states and see how it is read.
M = np.zeros((4, 4))
for i in range(4):
    cal = QuantumCircuit(2)
    if i & 1: cal.x(0)
    if i & 2: cal.x(1)
    cal.measure_all()
    M[:, i] = probs(cal)                    # column i: what we read when the truth is i
print("confusion matrix (columns = true state 00, 01, 10, 11):")
print(np.round(M, 3))

# Step 2: run the real circuit, a Bell state, and undo the readout errors
bell = QuantumCircuit(2); bell.h(0); bell.cx(0, 1); bell.measure_all()
raw = probs(bell)
fixed = np.linalg.solve(M, raw)
zz = np.array([1, -1, -1, 1])               # the ZZ value of 00, 01, 10, 11
show = lambda v: "  ".join(f"{x:+.4f}" for x in v)
print(f"\n            00       01       10       11")
print(f"raw        {show(raw)}    ⟨ZZ⟩ = {raw @ zz:.3f}")
print(f"mitigated  {show(fixed)}    ⟨ZZ⟩ = {fixed @ zz:.3f}")
print(f"ideal      {show([0.5, 0, 0, 0.5])}    ⟨ZZ⟩ = 1.000")
```

```text
confusion matrix (columns = true state 00, 01, 10, 11):
[[0.921 0.078 0.058 0.005]
 [0.029 0.873 0.002 0.055]
 [0.048 0.004 0.912 0.077]
 [0.002 0.046 0.028 0.863]]

            00       01       10       11
raw        +0.4631  +0.0418  +0.0626  +0.4325    ⟨ZZ⟩ = 0.791
mitigated  +0.4999  -0.0001  +0.0002  +0.5000    ⟨ZZ⟩ = 1.000
ideal      +0.5000  +0.0000  +0.0000  +0.5000    ⟨ZZ⟩ = 1.000
```

कच्चे Bell state ने 1 के बजाय ⟨ZZ⟩ = 0.79 नापा, सिर्फ़ readout errors की वजह से। Confusion matrix उलटने के बाद probabilities लगभग ठीक सही आती हैं, और ⟨ZZ⟩ = 1.000।

ध्यान दें कि 01 की mitigated probability **−0.0001** आई। यह bug नहीं। M उलटना noise के औसत असर को उलटता है, और shot noise सच्चे शून्य के अनुमान को ज़रा-सा शून्य से नीचे धकेल सकता है। Mitigated "probabilities" असल में **quasi-probabilities** हैं, जो तब तक ठीक है जब तक आप उन्हें सिर्फ़ औसत निकालने में इस्तेमाल करें।

n qubits के लिए पूरी confusion matrix 2ⁿ × 2ⁿ है, दर्जन भर qubits से आगे नापने को बहुत बड़ी। व्यवहार में तरीके मानते हैं कि readout errors ज़्यादातर हर qubit पर स्वतंत्र हैं (छोटी 2 × 2 matrices का tensor product), या **TREX** (twirled readout error extinction) जैसी तरकीबें इस्तेमाल करते हैं, जो measurement से पहले qubits को random रूप से पलटती हैं ताकि readout noise एक सरल scaling बन जाए जिसे भाग देकर हटाना आसान हो।

## 2. Zero-noise extrapolation

Gate errors को readout errors जितनी आसानी से नापा नहीं जा सकता। लेकिन एक चतुर विचार है: भले आप noise **हटा** न सकें, आम तौर पर उसे नियंत्रित तरीके से **बढ़ा** सकते हैं। Circuit को सामान्य noise पर चलाओ, फिर 3 गुना पर, फिर 5 गुना पर, और देखो जवाब कैसे बदलता है। फिर उस रुझान को **शून्य** noise तक extrapolate करो।

Ideal circuit बदले बिना noise तिगुना कैसे करें? **Gate folding** से: हर CNOT की जगह CNOT·CNOT·CNOT रखो। क्योंकि CNOT·CNOT = I, ideal circuit नहीं बदलता, लेकिन जहाँ एक noisy gate था वहाँ अब तीन हैं। पाँच CNOTs पाँच गुना noise देते हैं, इत्यादि।

यहाँ 2% CNOT errors वाले एक छोटे Ising-model simulation पर ZNE है:

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, SparsePauliOp
from qiskit_aer import AerSimulator
from qiskit_aer.noise import NoiseModel, depolarizing_error

n, steps = 4, 4
obs = SparsePauliOp("IIIZ")                        # ⟨Z⟩ on qubit 0

def ising(fold=1):
    """A small Ising-model simulation. Each CNOT is replaced by fold CNOTs (an odd number: same gate, more noise)."""
    qc = QuantumCircuit(n)
    for _ in range(steps):
        qc.rx(0.6, range(n))
        for q in range(n - 1):                     # e^(-i·0.4·Z_q Z_q+1) = CNOT, RZ, CNOT
            for _ in range(fold): qc.cx(q, q + 1)
            qc.rz(0.8, q + 1)
            for _ in range(fold): qc.cx(q, q + 1)
    return qc

noise = NoiseModel()
noise.add_all_qubit_quantum_error(depolarizing_error(0.002, 1), ["rx", "rz"])
noise.add_all_qubit_quantum_error(depolarizing_error(0.02, 2), ["cx"])
sim = AerSimulator(method="density_matrix", noise_model=noise)

ideal = Statevector(ising()).expectation_value(obs).real
factors, values = [1, 3, 5], []
for f in factors:
    qc = ising(f)
    qc.save_expectation_value(obs, range(n))
    values.append(sim.run(qc).result().data()["expectation_value"])
    print(f"noise × {f}:  ⟨Z₀⟩ = {values[-1]:.4f}")

linear = np.polyval(np.polyfit(factors, values, 1), 0)
richardson = np.polyval(np.polyfit(factors, values, 2), 0)        # a parabola through all 3 points
exponential = np.exp(np.polyval(np.polyfit(factors, np.log(values), 1), 0))   # a decaying exponential
print(f"\nideal (no noise):              {ideal:.4f}")
print(f"raw, noise × 1:                {values[0]:.4f}   error {abs(values[0] - ideal):.4f}")
print(f"extrapolated, straight line:   {linear:.4f}   error {abs(linear - ideal):.4f}")
print(f"extrapolated, parabola:        {richardson:.4f}   error {abs(richardson - ideal):.4f}")
print(f"extrapolated, exponential:     {exponential:.4f}   error {abs(exponential - ideal):.4f}")
```

```text
noise × 1:  ⟨Z₀⟩ = 0.1492
noise × 3:  ⟨Z₀⟩ = 0.0874
noise × 5:  ⟨Z₀⟩ = 0.0497

ideal (no noise):              0.1958
raw, noise × 1:                0.1492   error 0.0466
extrapolated, straight line:   0.1701   error 0.0257
extrapolated, parabola:        0.1891   error 0.0067
extrapolated, exponential:     0.1974   error 0.0016
```

कच्चा नतीजा 0.047 से हटा है। शून्य noise तक extrapolate करने से यह सीधी रेखा से 0.026, parabola से 0.007, और exponential से 0.0016 तक सुधरता है, कच्ची क़ीमत से लगभग **30 गुना बेहतर**। यहाँ exponential सबसे अच्छा बैठता है क्योंकि depolarising noise हर gate के साथ signal को एक ही गुणक से सिकोड़ता है, जो ठीक exponential decay है। सही extrapolation model चुनना मायने रखता है, और असली प्रयोगों में यह अपनी समझ का मामला है, जो ZNE की एक कमज़ोरी है।

ZNE के बारे में दो और बातें:

- **इसमें अतिरिक्त shots लगते हैं।** Extrapolation सांख्यिकीय अनिश्चितता बढ़ाता है: तीन नापे बिंदुओं की छोटी random ग़लतियाँ शून्य noise पर बड़ी ग़लती बनती हैं। असली प्रयोगों को उतनी ही error bars के लिए कई गुना ज़्यादा shots चाहिए।
- **यह मानता है कि noise अनुमान के मुताबिक़ बढ़ता है।** Folding मानता है कि CNOT·CNOT·CNOT का noise ठीक एक CNOT का तिगुना है, जो सिर्फ़ लगभग सच है। IBM के 2023 utility प्रयोग ने **probabilistic error amplification (PEA)** नाम का ज़्यादा सावधान तरीका इस्तेमाल किया, जो पहले noise सीखता है और फिर उसे सटीक रूप से बढ़ाता है।

ZNE 2017 में प्रस्तावित हुआ (Temme, Bravyi और Gambetta; और Li और Benjamin) और 2019 में IBM hardware पर पहली बार बड़े पैमाने पर दिखाया गया।

## 3. Probabilistic error cancellation

ZNE सही जवाब के क़रीब पहुँचता है। **Probabilistic error cancellation (PEC)** औसत में ठीक सही जवाब देता है, एक क़ीमत पर।

विचार: अगर आप noise channel N को ठीक-ठीक जानते हैं, तो उसका **inverse** N⁻¹ उन operations के मेल के रूप में लिख सकते हैं जो आप सचमुच कर सकते हैं। Strength p वाले depolarising noise के लिए inverse है "कुछ न करो" 1 से थोड़े ऊपर weight के साथ, और X, Y और Z हर एक छोटे **negative** weight के साथ:

> N⁻¹ = (1 + 3p/(4(1−p))) · [कुछ नहीं] − (p/(4(1−p))) · ([X] + [Y] + [Z])

आप negative probability वाला operation नहीं लगा सकते। लेकिन उसे **simulate** कर सकते हैं: उसके weight के आकार के अनुपात में probability से random operation चुनो, circuit उसके साथ चलाओ, और नतीजे को weight के चिह्न से और एक normalising गुणक γ (absolute weights का जोड़) से गुणा करो। कई runs के औसत में noise ठीक-ठीक कट जाता है:

```python
import numpy as np
rng = np.random.default_rng(4)

I = np.eye(2); X = np.array([[0, 1], [1, 0]]); Y = np.array([[0, -1j], [1j, 0]]); Z = np.diag([1, -1])
paulis = [I, X, Y, Z]
p, N, shots = 0.05, 10, 40_000
rz = np.diag([np.exp(-0.1j), np.exp(0.1j)])                  # RZ(0.2): the gate we apply N times

q = np.array([1 + 3 * p / (4 * (1 - p))] + 3 * [-p / (4 * (1 - p))])    # quasi-probabilities for I, X, Y, Z
gamma = np.abs(q).sum()

def one_shot(fixes):
    """Run the noisy circuit once, inserting the Paulis in fixes after each gate; return a ±1 result for X."""
    rho = np.array([[0.5, 0.5], [0.5, 0.5]])                # start in |+⟩
    for k in fixes:
        rho = rz @ rho @ rz.conj().T
        rho = (1 - p) * rho + p * I / 2                      # depolarising noise after every gate
        rho = paulis[k] @ rho @ paulis[k].conj().T           # the inserted Pauli (I = nothing)
    p_plus = (1 + 2 * rho[0, 1].real) / 2                    # chance of measuring + in the X basis
    return 1 if rng.random() < p_plus else -1

raw = np.array([one_shot([0] * N) for _ in range(shots)])
choices = rng.choice(4, size=(shots, N), p=np.abs(q) / gamma)  # random fixes, chosen with prob |q|/γ
signs = np.prod(np.sign(q[choices]), axis=1)
pec = np.array([one_shot(c) for c in choices]) * signs * gamma ** N

print(f"raw       ⟨X⟩ = {raw.mean():+.3f} ± {raw.std() / np.sqrt(shots):.3f}")
print(f"with PEC  ⟨X⟩ = {pec.mean():+.3f} ± {pec.std() / np.sqrt(shots):.3f}")
print(f"ideal     ⟨X⟩ = {np.cos(N * 0.2):+.3f}      (γ^N = {gamma ** N:.2f}: that's how much the error bar grows)")
```

```text
raw       ⟨X⟩ = -0.247 ± 0.005
with PEC  ⟨X⟩ = -0.406 ± 0.010
ideal     ⟨X⟩ = -0.416      (γ^N = 2.14: that's how much the error bar grows)
```

5% depolarising noise वाले दस gates ⟨X⟩ को −0.416 से −0.247 तक सिकोड़ देते हैं, 40% ग़लती। PEC के साथ अनुमान −0.406 ± 0.010 है, अपनी error bar के अंदर ideal क़ीमत से मेल खाता। Noise रद्द हो गया।

लेकिन error bars देखें: उतने ही shots के लिए कच्चे में 0.005, PEC में 0.010। हर gate अनुमान के फैलाव को γ से गुणा करता है, तो पूरा circuit उसे γ^G से गुणा करता है। मूल सटीकता पर लौटने के लिए **γ^(2G)** गुना ज़्यादा shots चाहिए। यह कैसे बढ़ता है:

```python
import numpy as np

def gamma(p):
    """Cost factor to cancel one depolarising error of strength p with quasi-probabilities."""
    q_identity = 1 + 3 * p / (4 * (1 - p))          # weight on "do nothing"   (positive)
    q_pauli = -p / (4 * (1 - p))                    # weight on each of X, Y, Z (negative!)
    return abs(q_identity) + 3 * abs(q_pauli)

p = 0.01
print(f"one gate with p = {p}: quasi-probabilities {1 + 3*p/(4*(1-p)):.4f} (I) and {-p/(4*(1-p)):.4f} (each of X, Y, Z)")
print(f"γ per gate = {gamma(p):.4f}\n")
print("noisy gates   extra shots needed (γ^(2G))")
for G in [10, 100, 300, 1000]:
    print(f"{G:8d}       {gamma(p) ** (2 * G):12.3g}")
```

```text
one gate with p = 0.01: quasi-probabilities 1.0076 (I) and -0.0025 (each of X, Y, Z)
γ per gate = 1.0152

noisy gates   extra shots needed (γ^(2G))
      10               1.35
     100               20.2
     300           8.29e+03
    1000           1.15e+13
```

1% errors के साथ 100 gates को लगभग 20 गुना ज़्यादा shots चाहिए: वहन करने लायक़। 300 gates को 8,000 गुना: दर्दनाक। 1,000 gates को 10¹³ गुना: असंभव। यह **exponential sampling ख़र्च** error mitigation की बुनियादी सीमा है, और हर तरीके में इसका कोई न कोई रूप है। PEC को noise model भी सटीक रूप से जानना होता है, जिसका मतलब कई qubits के लिए पहले noise का एक sparse model सीखना है (जैसा IBM ने 2023 में "sparse Pauli–Lindblad" noise models से किया)।

## 4. Pauli twirling: noise को सरल बनाना

पाठ 32 ने दिखाया कि **coherent** errors (हर बार वही छोटा over-rotation) **random** errors से कहीं तेज़ बढ़ते हैं, और उनका model बनाना भी कठिन है, जो ZNE और PEC को तोड़ देता है। **Pauli twirling** (जिसे randomised compiling भी कहते हैं) coherent errors को random में बदल देता है।

तरकीब: हर two-qubit gate के आसपास, उससे पहले एक random Pauli P डालो, और उसके बाद मेल खाता Pauli P' = CNOT·P·CNOT। Ideal circuit में P' ठीक P को उलट देता है, तो कुछ नहीं बदलता। लेकिन error, उनके बीच दबकर, random रूप से चिह्न बदलता है। कई random चुनावों के औसत में coherent error एक सरल random Pauli channel बन जाता है:

```python
import numpy as np
from itertools import product
from qiskit.quantum_info import Pauli, Operator
from qiskit.circuit.library import CXGate, RZZGate
rng = np.random.default_rng(2)

CX = Operator(CXGate()).data
error = Operator(RZZGate(0.05)).data              # a small, coherent ZZ over-rotation after every CNOT
noisy_cx = error @ CX
paulis = [Pauli(a + b).to_matrix() for a, b in product("IXYZ", repeat=2)]
after = [CX @ P @ CX for P in paulis]             # the Pauli that undoes P once it has passed through the CNOT

def infidelity(U, ideal):
    return 1 - abs(np.trace(ideal.conj().T @ U) / 4) ** 2

print(" CNOTs   plain (coherent)   twirled (averaged over 300 random twirls)")
for N in [10, 50, 200]:
    ideal = np.linalg.matrix_power(CX, N)
    plain = infidelity(np.linalg.matrix_power(noisy_cx, N), ideal)
    twirled = []
    for _ in range(300):
        U = np.eye(4)
        for k in rng.integers(16, size=N):        # a fresh random Pauli pair around every CNOT
            U = after[k] @ noisy_cx @ paulis[k] @ U
        twirled.append(infidelity(U, ideal))
    print(f"{N:5d}       {plain:.4f}             {np.mean(twirled):.4f}")
```

```text
 CNOTs   plain (coherent)   twirled (averaged over 300 random twirls)
   10       0.0308             0.0065
   50       0.5675             0.0299
  200       0.5881             0.1088
```

10 CNOTs के बाद coherent error पहले ही twirled से 5 गुना बदतर है। 50 CNOTs तक coherent error fidelity का 57% मिटा चुका है जबकि twirled ने सिर्फ़ 3% खोया। (Coherent column लगातार नहीं बढ़ता क्योंकि coherent error एक rotation है, जो आगे-पीछे झूल सकता है; यही अनिश्चितता उसे ख़तरनाक बनाने का हिस्सा है।) व्यवहार में twirling, ZNE या PEC के साथ लगाया जाता है: पहले twirl करो ताकि noise एक सुव्यवस्थित Pauli channel हो, फिर extrapolate या cancel करो।

## 5. Dynamical decoupling: खाली qubits की रक्षा

असली circuit में कई qubits **खाली** समय बिताते हैं, दूसरे qubits पर gates ख़त्म होने का इंतज़ार करते हुए। खाली रहते हुए वे dephase होते हैं (पाठ 32)। Spin echo ने दिखाया कि इंतज़ार के बीच में एक X pulse धीमे frequency errors को उलट देता है। **Dynamical decoupling (DD)** खाली समय को ऐसे pulses के क्रमों से भरता है, जो इस तरह चुने जाते हैं कि उनका गुणनफल identity हो।

यहाँ 20 µs इंतज़ार करता एक qubit है, हर run में random frequency offset और एक धीमे drift के साथ, बराबर दूरी पर रखे अलग-अलग संख्या के X pulses से सुरक्षित:

```python
import numpy as np
rng = np.random.default_rng(6)

runs, slices, T = 4000, 400, 20.0                   # 4000 experiments, each 20 µs long, in 400 time slices
dt = T / slices
# The qubit's frequency error δ (radians per µs): a random offset for each run, plus a slow random drift
offset = rng.normal(0, 0.5, size=(runs, 1))
drift = np.cumsum(rng.normal(0, 0.006, size=(runs, slices)), axis=1)
delta = offset + drift

def coherence(pulses):
    """⟨X⟩ after waiting T in |+⟩, with `pulses` evenly spaced X flips (CPMG-style dynamical decoupling)."""
    t = (np.arange(slices) + 0.5) * dt
    flips = np.floor(t / T * pulses + 0.5)          # how many π pulses have happened by time t
    sign = (-1) ** flips                            # each X pulse reverses the direction the phase winds
    if pulses % 2:                                  # an odd number of X's leaves the qubit flipped; undo the
        sign = -sign                                # bookkeeping so the ideal answer is still ⟨X⟩ = 1
    phase = (delta * sign * dt).sum(axis=1)
    return np.mean(np.cos(phase))

for n in [0, 1, 2, 4, 8, 16]:
    label = "free evolution" if n == 0 else f"{n:2d} X pulses"
    print(f"{label:15s}  coherence ⟨X⟩ = {coherence(n):.3f}")
```

```text
free evolution   coherence ⟨X⟩ = -0.007
 1 X pulses      coherence ⟨X⟩ = 0.787
 2 X pulses      coherence ⟨X⟩ = 0.940
 4 X pulses      coherence ⟨X⟩ = 0.985
 8 X pulses      coherence ⟨X⟩ = 0.996
16 X pulses      coherence ⟨X⟩ = 0.999
```

अकेला छोड़ने पर qubit सारी coherence खो देता है: random offsets phase को पूरी तरह उलझा देते हैं। एक echo pulse 79% वापस लाता है, क्योंकि वह constant offset रद्द करता है, और सिर्फ़ drift बचता है। ज़्यादा pulses तेज़ बदलावों को भी रद्द करते हैं: 16 pulses 99.9% बचाते हैं। इस simulation में pulses perfect हैं; असली pulses की अपनी छोटी ग़लतियाँ होती हैं, तो हर स्थिति के लिए pulses की एक सबसे अच्छी संख्या होती है। DD **crosstalk** (पड़ोसियों के बीच अनचाहा ZZ coupling) भी दबाता है, जो superconducting chips पर उसके सबसे बड़े इस्तेमालों में से एक है। Qiskit transpiler pass `PadDynamicalDecoupling` से DD क्रम अपने आप डाल सकता है।

## दूसरी तकनीकें

- **Symmetry verification:** अगर सच्चे जवाब में कोई ज्ञात गुण होना ज़रूरी है (जैसे chemistry simulation में कणों की तय संख्या), तो उसे तोड़ने वाला हर shot फेंक दो। सस्ता और असरदार, लेकिन data बर्बाद करता है।
- **Virtual distillation:** noisy state की दो या ज़्यादा प्रतियाँ चलाओ और उन्हें साथ में ऐसे measure करो जो असल में state को शुद्ध करे और errors दबाए। इसे अतिरिक्त qubits चाहिए।
- **Learning-based तरीके:** ज्ञात ideal जवाबों वाले circuits (जैसे Clifford circuits, जो classically simulate हो सकते हैं) से एक classical model को noisy नतीजों से सुधरे नतीजों तक ले जाना सिखाओ।

## व्यवहार में mitigation

आपको शायद ही इन्हें हाथ से बनाना पड़ता है:

- **Qiskit Runtime** (पाठ 40) इन्हें अपने Estimator primitive में रखता है। एक setting, `resilience_level`, इन्हें चालू करती है: level 1 readout mitigation (TREX) लगाता है, और level 2 gate twirling के साथ zero-noise extrapolation जोड़ता है। Options से dynamical decoupling और PEC भी चालू होते हैं।
- **Mitiq**, Unitary Fund की open-source Python library, Qiskit और दूसरे frameworks के circuits के लिए ZNE, PEC, DD और दूसरे तरीके देती है।

Mitigation अब NISQ hardware पर कुछ भी गंभीर चलाने का मानक हिस्सा है। आम workflow: gates को twirl करो, खाली qubits पर DD जोड़ो, readout mitigate करो, और शून्य noise तक extrapolate करो।

## सीमाएँ

हर mitigation तकनीक अतिरिक्त shots से क़ीमत चुकाती है, और ख़र्च circuit में noise की कुल मात्रा (मोटे तौर पर error rate × gates की संख्या) के साथ **exponentially** बढ़ता है। PEC इसे γ^(2G) से साफ़ दिखाता है; ZNE इसे बढ़ती error bars और model की अनिश्चितता में छिपाता है। मोटा नियम: mitigation तब काम करता है जब circuit का कुल "error budget" εG लगभग 1 से कुछ तक हो, यानी कच्चा circuit noisy है लेकिन पूरी तरह उलझा नहीं। जिस circuit में εG = 50 हो, उसमें कितना भी mitigation मदद नहीं करेगा।

इसीलिए mitigation एक **पुल** है, मंज़िल नहीं। यह NISQ machines की पहुँच बढ़ाता है, आज के प्रयोगों को research के लिए काम का बनाता है, और शुरुआती error-corrected machines पर भी बची-खुची ग़लतियाँ निचोड़ने के लिए इस्तेमाल होता रहेगा। लेकिन अरबों gates वाले Shor जैसे algorithms को हमेशा error correction चाहिए होगा।

## आज़माकर देखें

1. Error mitigation expectation value सुधार सकता है लेकिन एक measured bitstring क्यों नहीं?
2. |0⟩ में qubit 4% संभावना से 1 पढ़ा जाता है, और |1⟩ में qubit 10% संभावना से 0। उसकी confusion matrix लिखें।
3. Gate folding में CNOT की जगह तीन CNOTs क्यों रखे जाते हैं, दो क्यों नहीं?
4. एक ZNE प्रयोग noise ×1 पर 0.60 और noise ×3 पर 0.40 नापता है। सीधी-रेखा extrapolation शून्य noise पर क्या देती है?
5. हर gate पर γ = 1.02 वाले PEC के लिए 200-gate circuit को मोटे तौर पर कितने गुना ज़्यादा shots चाहिए?
6. Pauli twirling noise के बारे में क्या बदलता है, और इससे ZNE और PEC को मदद क्यों मिलती है?
7. Dynamical decoupling simulation में एक echo pulse qubit की पूरी रक्षा क्यों नहीं कर पाता?

**जवाब:**

1. Mitigation कई runs के **आँकड़े** ठीक करता है (औसत को उलटकर, extrapolate करके या दोबारा तौलकर)। अलग shot फिर भी एक random, शायद ग़लत, bitstring है; उसमें कुछ ठीक नहीं होता।
2. Columns सच्ची states 0 और 1 हैं: **M = [[0.96, 0.10], [0.04, 0.90]]**।
3. CNOT·CNOT = I, तो दो CNOTs ideal circuit बदल देते (gate हटा देते)। तीन CNOTs ideally एक CNOT के बराबर हैं, तिगुने noise के साथ।
4. रेखा noise की 2 इकाइयों पर 0.20 गिरती है, यानी हर इकाई पर 0.10। ×1 से ×0 पर लौटने पर 0.10 जुड़ता है: **0.70**।
5. γ^(2G) = 1.02⁴⁰⁰ ≈ e^(400 × 0.0198) ≈ e^7.9 ≈ **2,800** गुना ज़्यादा।
6. यह coherent errors (जो N² की तरह जुड़ते हैं और जिनका model कठिन है) को random Pauli errors (जो N की तरह जुड़ते हैं और सरल, अनुमान-योग्य channel बनाते हैं) में बदलता है। ZNE और PEC दोनों अनुमान-योग्य और आसानी से बताए जा सकने वाले noise पर निर्भर हैं।
7. एक echo किसी भी **constant** frequency offset को रद्द करता है, लेकिन drift इंतज़ार के दौरान frequency बदलता है, तो दोनों आधे ठीक-ठीक नहीं कटते। ज़्यादा pulses अंतराल छोटे करते हैं, तो हर अंतराल में frequency कम बदलती है।

## सार-सूत्र

| विचार | सूत्र या तथ्य |
|---|---|
| NISQ | Noisy Intermediate-Scale Quantum (Preskill, 2018): पूरे error correction से पहले |
| Mitigation बनाम correction | बाद में औसत ठीक करता है; qubits नहीं, shots ख़र्च करता है |
| Readout mitigation | P_observed = M·P_true; P_true के लिए हल करो; नतीजे quasi-probabilities |
| ZNE | Noise ×1, ×3, ×5 पर चलाओ (gate folding: CNOT → CNOT·CNOT·CNOT); 0 तक extrapolate |
| Extrapolation models | Linear, polynomial (Richardson), exponential; model का चुनाव मायने रखता है |
| PEC | N⁻¹ को quasi-probabilities में लिखो; sample करो, चिह्न दो, rescale करो; unbiased |
| PEC ख़र्च | हर gate पर γ; G gates के लिए γ^(2G) गुना ज़्यादा shots |
| Depolarising γ | 1 + 3p/(2(1 − p)) |
| Pauli twirling | पहले random P, बाद में CNOT·P·CNOT; coherent → random Pauli noise |
| Dynamical decoupling | खाली समय में X pulses धीमे dephasing और crosstalk रद्द करते हैं |
| Qiskit Runtime में | Estimator `resilience_level` 1: readout (TREX); 2: + ZNE और twirling |
| Libraries | Qiskit Runtime, Mitiq |
| सीमा | ख़र्च error rate × gate संख्या के साथ exponentially बढ़ता है; mitigation QEC तक का पुल है |
