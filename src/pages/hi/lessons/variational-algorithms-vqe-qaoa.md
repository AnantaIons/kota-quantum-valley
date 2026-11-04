---
layout: ../../../layouts/Post.astro
lang: hi
title: "Variational algorithms: VQE और QAOA"
description: "आज के noisy quantum computers classical computers के साथ मिलकर कैसे काम करते हैं। Variational principle और random अनुमान क्यों नाकाम है, shots से energy मापना, ansatz चुनना, parameter-shift rule से सटीक gradients, Ising chain के लिए पूरा VQE, noise झेलने वाले optimisers (SPSA समेत), loop hardware की कौन-सी errors सोख सकता है और कौन-सी नहीं, MaxCut के लिए QAOA और उसका energy landscape, और एक ईमानदार स्थिति-रिपोर्ट।"
date: 2026-11-04
category: lesson
lesson: 30
---

Shor का algorithm (पाठ 28) और phase estimation (पाठ 27) को लंबे, लगभग परिपूर्ण circuits चाहिए: error-corrected machines पर अरबों gates, जो machines अभी हैं ही नहीं। आज का hardware अलग है। उसमें दसियों से हज़ार-एक qubits हैं, और हर gate की error लगभग 0.1% से 1% है, इसलिए noise हावी होने से पहले आप बस कुछ सौ से कुछ हज़ार gates चला सकते हैं (पाठ 32 इसे सटीक बनाता है)। इसे अक्सर **NISQ** दौर कहते हैं: noisy intermediate-scale quantum।

**Variational algorithms** ठीक इन्हीं machines के लिए बने। वे quantum circuit को छोटा रखते हैं, और बाक़ी सब एक साधारण computer को सौंप देते हैं। दो प्रसिद्ध उदाहरण हैं **variational quantum eigensolver** (VQE), किसी molecule या पदार्थ की सबसे कम energy ढूँढने के लिए, और **quantum approximate optimisation algorithm** (QAOA), combinatorial समस्याओं के लिए। यह पाठ इस तरीके को बुनियाद से बनाता है: वह सिद्धांत जिस पर यह चलता है, energies कैसे मापी जाती हैं, circuits कैसे चुने और train किए जाते हैं, noise इसके साथ क्या करता है, और यह कहाँ खड़ा है इसका ईमानदार आकलन।

## Loop

हर variational algorithm दो computers के बीच यही loop है:

1. एक **parameterised circuit**, जिसे **ansatz** कहते हैं (जर्मन में "तरीका" या "शुरुआती अनुमान"), बदलने योग्य कोणों θ = (θ₁, θ₂, …) से एक trial state |ψ(θ)⟩ बनाता है।
2. Quantum computer circuit को कई बार चलाकर एक **cost मापता** है, आम तौर पर energy E(θ) = ⟨ψ(θ)|H|ψ(θ)⟩।
3. एक **classical optimiser** cost देखकर नए कोण चुनता है जिनसे वह घटनी चाहिए।
4. जब तक cost सुधरना बंद न हो, दोहराएँ।

| Quantum computer | Classical computer |
|---|---|
| ऐसी state बनाता है जो classically store करने के लिए शायद बहुत जटिल हो | कोण चुनता है |
| Energy मापता है (हज़ारों shots) | Optimisation चलाता है और सबसे अच्छा नतीजा याद रखता है |
| सिर्फ़ छोटे circuits चलाता है | बाक़ी सब करता है |

विचार काम का बँटवारा है: quantum computer को सिर्फ़ उस एक काम के लिए इस्तेमाल करें जिसमें वह अनोखा है, यानी जटिल many-qubit state को दर्शाना, और circuits इतने छोटे रखें कि noise झेल सकें।

## Variational principle

मापी गई energy घटाने से सही जवाब की ओर क्यों बढ़ते हैं? **Variational principle** की वजह से, जो quantum mechanics का एक पुराना नतीजा है (Rayleigh और Ritz): **किसी भी state की energy ground energy से कम नहीं हो सकती।**

प्रमाण तीन पंक्तियों का है। H के energy levels को E₀ ≤ E₁ ≤ E₂ ≤ … लिखें, eigenstates |E₀⟩, |E₁⟩, … के साथ। कोई भी state उस basis में |ψ⟩ = Σᵢ cᵢ|Eᵢ⟩ लिखी जा सकती है, जहाँ Σ|cᵢ|² = 1। तब

> ⟨ψ|H|ψ⟩ = Σᵢ |cᵢ|² Eᵢ ≥ Σᵢ |cᵢ|² E₀ = E₀

Energy levels का **भारित औसत** है, भार |cᵢ|² के साथ, और कोई औसत अपने सबसे छोटे सदस्य से कम नहीं हो सकता। यह E₀ के बराबर तभी होता है जब सारा भार ground state पर हो। तो हर मापी गई energy E₀ की एक **ऊपरी सीमा** है, और कम हमेशा बेहतर है।

आइए इसे जाँचें, और देखें कि हम बस अनुमान क्यों नहीं लगा सकते:

```python
import numpy as np
from qiskit.quantum_info import SparsePauliOp

# A two-qubit Hamiltonian: an Ising coupling plus a sideways ("transverse") field
H = SparsePauliOp(["ZZ", "XI", "IX"], coeffs=[1.0, 0.5, 0.5]).to_matrix()
E, V = np.linalg.eigh(H)                              # exact energy levels and eigenstates
print("energy levels:", np.round(E, 4))

rng = np.random.default_rng(0)
psi = rng.normal(size=4) + 1j * rng.normal(size=4)
psi /= np.linalg.norm(psi)                            # a random two-qubit state
weights = np.abs(V.conj().T @ psi) ** 2               # |overlap with each eigenstate|^2
print("weights on each level:", np.round(weights, 3))
print(f"<H> = {np.vdot(psi, H @ psi).real:.4f} = sum of weight x level = {weights @ E:.4f}")

energies = []
for _ in range(100_000):
    psi = rng.normal(size=4) + 1j * rng.normal(size=4)
    psi /= np.linalg.norm(psi)
    energies.append(np.vdot(psi, H @ psi).real)
energies = np.array(energies)
print(f"\n100,000 random states: lowest <H> = {energies.min():.4f}, average = {energies.mean():.4f}")
print(f"states below the ground energy {E[0]:.4f}: {np.sum(energies < E[0])}")
print(f"states within 0.05 of it: {np.sum(energies < E[0] + 0.05)}")
```

```text
energy levels: [-1.4142 -1.      1.      1.4142]
weights on each level: [0.296 0.214 0.317 0.173]
<H> = -0.0708 = sum of weight x level = -0.0708

100,000 random states: lowest <H> = -1.3952, average = -0.0005
states below the ground energy -1.4142: 0
states within 0.05 of it: 4
```

Random state की energy ठीक चार levels का भारित औसत है। 100,000 random states में से कोई भी ground energy −1.4142 से नीचे नहीं गई, जैसा सिद्धांत वादा करता है। लेकिन सिर्फ़ **4** उसके 0.05 के भीतर आईं। दो qubits के साथ भी random अनुमान बेकार है, और qubits जोड़ने पर अच्छी states का हिस्सा exponentially घटता है। तो VQE को दो चतुर चीज़ें चाहिए: states का एक **परिवार** जिसमें अच्छे जवाब हों (ansatz) और उन्हें ढूँढने का एक **खोज तरीका** (optimiser)।

## Quantum computer पर energy मापना

Quantum computer E(θ) सीधे नहीं दे सकता। वह bitstrings देता है। Bitstrings को energy में बदलने के लिए हम इस तथ्य का इस्तेमाल करते हैं कि H **Pauli strings** का योग है (पाठ 29), H = Σⱼ cⱼPⱼ, तो

> E(θ) = Σⱼ cⱼ ⟨Pⱼ⟩

और हर ⟨Pⱼ⟩ अलग से मापा जा सकता है:

- **Z-प्रकार के पद** (जैसे Z₀Z₁): सामान्य तरीके से मापें। हर shot एक bitstring देता है, और उस shot के लिए पद का मान (−1)^(संबंधित bits का योग) है: सम parity पर +1, विषम पर −1।
- **X या Y पद:** पहले qubit को घुमाएँ ताकि X या Y, Z बन जाए (पाठ 8)। X के लिए मापने से पहले H लगाएँ; Y के लिए S† और फिर H।
- **Commute करने वाले पद** जिन्हें एक ही basis चाहिए, एक ही shots साझा कर सकते हैं। यहाँ qubit 0 पर X और qubit 1 पर X दोनों एक ही circuit से मापे जाते हैं, जिसमें दोनों qubits पर Hadamards हैं।

यह रही पूरी प्रक्रिया हाथ से, H = Z₀Z₁ + 0.5 X₀ + 0.5 X₁ के लिए (Qiskit में "ZZ", "IX", "XI" लिखा जाता है, qubit 0 दाईं ओर):

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler
from qiskit.quantum_info import SparsePauliOp, Statevector

H = SparsePauliOp(["ZZ", "XI", "IX"], coeffs=[1.0, 0.5, 0.5])

state = QuantumCircuit(2)                       # some trial state
state.ry(2.0, 0)
state.ry(-0.5, 1)
state.cx(0, 1)

# Group 1: ZZ is measured directly. Group 2: XI and IX both need X-basis
# measurements, which is a Hadamard on each qubit followed by a normal measurement.
z_circ = state.copy(); z_circ.measure_all()
x_circ = state.copy(); x_circ.h([0, 1]); x_circ.measure_all()

def parity(counts, qubits):
    """Average of (-1)^(sum of the measured bits on these qubits): the value of a Z-type Pauli."""
    shots = sum(counts.values())
    return sum(c * (-1) ** sum(int(b[-1 - q]) for q in qubits) for b, c in counts.items()) / shots

exact = Statevector(state).expectation_value(H).real
print(f"exact <H> = {exact:.4f}")
sampler = StatevectorSampler(seed=np.random.default_rng(7))

def estimates(shots, repeats):
    """Estimate <H> from fresh shots, several times over."""
    results = sampler.run([z_circ, x_circ] * repeats, shots=shots).result()
    out = []
    for zr, xr in zip(results[0::2], results[1::2]):
        zc, xc = zr.data.meas.get_counts(), xr.data.meas.get_counts()
        out.append(1.0 * parity(zc, [0, 1]) + 0.5 * parity(xc, [1]) + 0.5 * parity(xc, [0]))
    return np.array(out)

print("shots per group   one estimate   typical error (spread of 200 repeats)")
for shots in [100, 1_000, 10_000]:
    est = estimates(shots, 200)
    print(f"{shots:10,d}         {est[0]:.4f}          {est.std():.4f}")
```

```text
exact <H> = 0.4199
shots per group   one estimate   typical error (spread of 200 repeats)
       100         0.3600          0.0995
     1,000         0.4200          0.0336
    10,000         0.4134          0.0094
```

हर अनुमान सटीक मान 0.4199 के आसपास बिखरता है। दस गुना ज़्यादा shots से सामान्य error लगभग √10 ≈ 3.2 गुना छोटी होती है: पाठ 20 का जाना-पहचाना 1/√shots नियम। यह भारी कीमत है। 0.001 की error के लिए इस छोटी-सी समस्या को हर energy पर लगभग दस लाख shots चाहिए, और एक optimisation को सैकड़ों या हज़ारों energies चाहिए। असली molecules के लिए, हज़ारों Pauli पदों के साथ, मापने की लागत VQE की सबसे बड़ी समस्याओं में से एक है (पाठ 45 H₂ के लिए इसे गिनता है)।

व्यवहार में आप यह हाथ से नहीं लिखते: Qiskit का **Estimator** primitive (पाठ 19) पदों को समूहों में बाँटता है, basis बदलाव जोड़ता है, shots चलाता है और error bar के साथ ⟨H⟩ लौटाता है। इस पाठ का बाक़ी हिस्सा उसी का इस्तेमाल करता है।

## Ansatz चुनना

Ansatz तय करता है कि algorithm किन states तक पहुँच सकता है। अगर जवाब परिवार में नहीं है, तो कोई optimiser उसे नहीं ढूँढ सकता। यह रहा एक-qubit उदाहरण, H = Z + 0.5·Y के साथ:

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import SparsePauliOp, Statevector

H = SparsePauliOp(["Z", "Y"], coeffs=[1.0, 0.5])
exact = np.linalg.eigvalsh(H.to_matrix())[0]

def energy(circuit):
    return Statevector(circuit).expectation_value(H).real

def ry_only(t):
    qc = QuantumCircuit(1); qc.ry(t, 0)
    return qc

def ry_rz(t, p):
    qc = QuantumCircuit(1); qc.ry(t, 0); qc.rz(p, 0)
    return qc

grid = np.linspace(0, 2 * np.pi, 181)
best1 = min(energy(ry_only(t)) for t in grid)
best2 = min(energy(ry_rz(t, p)) for t in grid for p in grid)
print(f"exact ground energy      {exact:.4f}")
print(f"ansatz RY(θ)             {best1:.4f}   (stuck: real amplitudes give <Y> = 0)")
print(f"ansatz RY(θ) then RZ(φ)  {best2:.4f}")
```

```text
exact ground energy      -1.1180
ansatz RY(θ)             -1.0000   (stuck: real amplitudes give <Y> = 0)
ansatz RY(θ) then RZ(φ)  -1.1180
```

RY rotation सिर्फ़ **real** amplitudes वाली states बनाता है, और ऐसी हर state के लिए ⟨Y⟩ = 0, इसलिए सिर्फ़-RY ansatz कभी Y पद का इस्तेमाल नहीं कर सकता और −1 पर अटक जाता है। RZ जोड़ने से state Bloch sphere के हर बिंदु तक पहुँच सकती है (पाठ 7), और सटीक ground energy −√1.25 ≈ −1.118 मिल जाती है। इस गुण को **expressibility** कहते हैं।

लेकिन ज़्यादा expressive होना अपने-आप बेहतर नहीं है। Ansatz को तीन चीज़ों में संतुलन रखना होता है:

- **पर्याप्त expressive**, ताकि उसमें जवाब का अच्छा सन्निकटन हो।
- **पर्याप्त उथला**, ताकि noise के state नष्ट करने से पहले चल जाए।
- **Trainable:** optimiser अच्छे कोण ढूँढ सके। बहुत सामान्य, गहरे circuits में **barren plateaus** होते हैं, ऐसे सपाट landscapes कि gradients qubits की संख्या के साथ exponentially ग़ायब हो जाते हैं (पाठ 45 इसे मापता है)।

दो परिवार आम हैं:

- **Hardware-efficient ansatzes:** hardware के अपने single-qubit rotations की परतें, पड़ोसी qubits के बीच entangling gates के साथ बारी-बारी। चलाने में सस्ते, लेकिन सामान्य, इसलिए बड़े पैमाने पर train करना कठिन हो सकता है। Qiskit के `real_amplitudes` और `efficient_su2` functions इन्हें बनाते हैं।
- **समस्या-प्रेरित ansatzes:** समस्या की बनावट से बने। Chemistry में **unitary coupled-cluster** (UCC) ansatz रसायनशास्त्रियों के coupled-cluster तरीके की नकल करता है; optimisation में QAOA ansatz समस्या से ही बनता है (नीचे)। इन्हें ज़्यादा gates चाहिए, लेकिन ये असली ज्ञान समेटते हैं।

Symmetry भी मदद करती है। अगर Hamiltonian में सिर्फ़ X और Z पद हैं (कोई Y नहीं), तो उसका matrix real है, और उसकी ground state real amplitudes के साथ चुनी जा सकती है। तब RY-और-CNOT ansatz, जो सिर्फ़ real states बनाता है, कुछ बर्बाद नहीं करता। नीचे की Ising chain ऐसा ही मामला है।

## Gradients: parameter-shift rule

ज़्यादातर अच्छे optimisers को **gradient** चाहिए: हर कोण बदलने पर energy कैसे बदलती है। सीधा तरीका, छोटे h के साथ finite difference [E(θ + h) − E(θ − h)]/(2h), quantum computer पर बुरा काम करता है: दोनों energies लगभग बराबर हैं, इसलिए उनका छोटा अंतर shot noise में दब जाता है, जिसे फिर छोटे 2h से भाग दिया जाता है।

इससे कहीं बेहतर तरीका है। Gate RY(θ) (या RX, RZ, या Pauli P के साथ कोई भी rotation e^(−iθP/2)) के matrix के अवयव cos(θ/2) और sin(θ/2) हैं, और energy उनमें quadratic है। cos²(θ/2) = (1 + cos θ)/2 और ऐसी ही सर्वसमिकाओं से, उस एक कोण के function के रूप में energy का रूप हमेशा यह होता है

> E(θ) = A + B cos θ + C sin θ

जहाँ स्थिरांक A, B और C circuit के बाक़ी हिस्से पर निर्भर हैं। इसका derivative −B sin θ + C cos θ है। अब E को दोनों ओर एक चौथाई चक्कर पर निकालें:

> [E(θ + π/2) − E(θ − π/2)] / 2 = [B(−2 sin θ) + C(2 cos θ)] / 2 = −B sin θ + C cos θ

यह **ठीक** derivative है। यही **parameter-shift rule** है: वही circuit कोण को +π/2 और −π/2 खिसकाकर चलाएँ, और अंतर का आधा लें। कोई सन्निकटन नहीं, और खिसकाव बड़े हैं, इसलिए दोनों energies में बहुत अंतर होता है और noise का असर बहुत कम होता है। यह रहे दोनों तरीके, हर energy पर 0.01 के simulated shot noise के साथ:

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.circuit import ParameterVector
from qiskit.primitives import StatevectorEstimator
from qiskit.quantum_info import SparsePauliOp

H = SparsePauliOp(["ZZ", "XI", "IX"], coeffs=[1.0, 0.5, 0.5])
th = ParameterVector("θ", 4)
ansatz = QuantumCircuit(2)
ansatz.ry(th[0], 0); ansatz.ry(th[1], 1)
ansatz.cx(0, 1)
ansatz.ry(th[2], 0); ansatz.ry(th[3], 1)

exact_est = StatevectorEstimator()
noisy_est = StatevectorEstimator(seed=np.random.default_rng(3))

def energies(points, noisy=False):
    """Energies at several parameter points; noisy=True mimics ~10,000 shots (error 0.01)."""
    est, prec = (noisy_est, 0.01) if noisy else (exact_est, 0.0)
    return est.run([(ansatz, H, points)], precision=prec).result()[0].data.evs

theta = np.array([1.2, -0.4, 0.6, 1.0])
e0 = np.eye(4)[0]                                     # we differentiate with respect to θ0

def param_shift(noisy=False):
    plus, minus = energies([theta + np.pi / 2 * e0, theta - np.pi / 2 * e0], noisy)
    return (plus - minus) / 2

def finite_diff(h, noisy=False):
    plus, minus = energies([theta + h * e0, theta - h * e0], noisy)
    return (plus - minus) / (2 * h)

print(f"exact simulation: parameter shift {param_shift():.6f}, finite difference {finite_diff(1e-6):.6f}")
print("\nwith shot noise (200 repeats):   average    spread")
for name, f in [("parameter shift", lambda: param_shift(True)),
                ("finite diff, h = 0.01", lambda: finite_diff(0.01, True)),
                ("finite diff, h = 0.1", lambda: finite_diff(0.1, True))]:
    g = np.array([f() for _ in range(200)])
    print(f"  {name:22s}       {g.mean():8.4f}   {g.std():.4f}")
```

```text
exact simulation: parameter shift -0.762454, finite difference -0.762454

with shot noise (200 repeats):   average    spread
  parameter shift               -0.7626   0.0072
  finite diff, h = 0.01         -0.8313   0.6639
  finite diff, h = 0.1          -0.7561   0.0667
```

बिना noise के दोनों तरीके छह दशमलव तक मिलते हैं। Noise के साथ, parameter-shift gradient का फैलाव 0.0072 है (दो energies का noise, 2 से भाग)। h = 0.01 वाला finite difference उसी noise को 0.02 से भाग देता है, इसलिए उसका फैलाव **0.66** है, ख़ुद gradient से बड़ा: बेकार। बड़ा h = 0.1 noise घटाता है लेकिन एक bias लाता है, क्योंकि सूत्र अब सटीक नहीं रहता। Parameter-shift rule में दोनों में से कोई समस्या नहीं। इसकी कीमत हर gradient के लिए **प्रति parameter दो energy evaluations** है।

## पूरा VQE: Ising chain

आइए पाठ 29 की transverse-field Ising chain की ground state तीन qubits पर ढूँढें, सबसे कठिन बिंदु पर जहाँ दोनों तरह के पद बराबर ताक़तवर हैं:

> H = −(Z₀Z₁ + Z₁Z₂) − (X₀ + X₁ + X₂)

Ansatz hardware-efficient है: RY rotations की तीन परतें (9 कोण), CNOTs की दो chains से अलग की गईं। Optimiser सीधा-सादा **gradient descent** है: parameter shifts से gradient निकालें, थोड़ा ढलान से नीचे क़दम रखें, दोहराएँ।

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.circuit import ParameterVector
from qiskit.primitives import StatevectorEstimator
from qiskit.quantum_info import SparsePauliOp, Statevector

# Transverse-field Ising chain on 3 qubits: H = -(Z0Z1 + Z1Z2) - (X0 + X1 + X2)
H = SparsePauliOp(["IZZ", "ZZI", "IIX", "IXI", "XII"], coeffs=[-1, -1, -1, -1, -1])
E, V = np.linalg.eigh(H.to_matrix())

n, layers = 3, 2
th = ParameterVector("θ", n * (layers + 1))
ansatz = QuantumCircuit(n)                           # "hardware-efficient": rotations + a CNOT chain
for l in range(layers + 1):
    for q in range(n):
        ansatz.ry(th[n * l + q], q)
    if l < layers:
        ansatz.cx(0, 1); ansatz.cx(1, 2)

est = StatevectorEstimator()
def energy(p):
    return float(est.run([(ansatz, H, p)]).result()[0].data.evs)

def gradient(p):
    """Parameter-shift rule: two energy evaluations per parameter."""
    shifts = np.pi / 2 * np.eye(len(p))
    points = np.vstack([p + shifts, p - shifts])
    evs = est.run([(ansatz, H, points)]).result()[0].data.evs
    return (evs[:len(p)] - evs[len(p):]) / 2

p = np.random.default_rng(5).uniform(-0.1, 0.1, len(th))   # start near all-zeros
print("step   energy")
for step in range(101):
    if step % 20 == 0:
        print(f"{step:4d}   {energy(p):.4f}")
    if step < 100:
        p -= 0.2 * gradient(p)                                 # gradient descent

final = Statevector(ansatz.assign_parameters(p))
print(f"exact ground energy {E[0]:.4f}")
print(f"overlap |<ground|VQE state>|^2 = {abs(np.vdot(V[:, 0], final.data)) ** 2:.4f}")
print(f"energy evaluations for the gradients: {100 * 2 * len(p):,}")
```

```text
step   energy
   0   -1.8344
  20   -3.4286
  40   -3.4735
  60   -3.4859
  80   -3.4910
 100   -3.4930
exact ground energy -3.4940
overlap |<ground|VQE state>|^2 = 0.9995
energy evaluations for the gradients: 1,800
```

20 क़दमों में energy ज़्यादातर रास्ता तय कर लेती है, फिर धीरे-धीरे −3.4930 तक उतरती है, सटीक −3.4940 के 0.001 के भीतर। आख़िरी state असली ground state से 0.9995 probability के साथ मेल खाती है। इस chain की ground state कोई साधारण bitstring नहीं है: यह ZZ और X पदों की होड़ से बना एक superposition है, और loop ने इसे यह बताए बिना ढूँढ लिया कि यह कैसी दिखती है।

लागत गिनें: 1,800 energy evaluations। Hardware पर हर एक हज़ारों shots होता, तो 3-qubit समस्या के लिए लाखों circuit runs, जिसे laptop microseconds में सटीक हल कर देता है। VQE का मतलब सिर्फ़ उन systems के लिए है जो classically हल करने के लिए बहुत बड़े हैं, और कठिनाइयाँ वहीं से शुरू होती हैं।

## जब हर संख्या noisy हो, तब optimisers

Variational algorithm की सफलता में optimiser का बड़ा हिस्सा है। तीन तरह के आम हैं:

- **Parameter shifts के साथ gradient descent** (और Adam जैसे सुधार): भरोसेमंद, लेकिन P parameters के लिए हर क़दम 2P energy evaluations लेता है।
- **Gradient-free तरीके** जैसे **COBYLA** और Nelder–Mead: पिछले evaluations से एक स्थानीय model बनाते हैं। कम parameters और सटीक energies के लिए कुशल, लेकिन noise उन्हें भ्रमित कर सकता है।
- **SPSA** (simultaneous perturbation stochastic approximation, James Spall, 1992): हर क़दम पर एक **random दिशा** चुनें जो हर parameter को एक साथ ±c से खिसकाए, दोनों ओर energy मापें, और उस दिशा में क़दम रखें। इसकी कीमत **हर क़दम पर 2 evaluations है, parameters कितने भी हों**, और यह स्वाभाविक रूप से noise सह लेता है। असली hardware पर यह पसंदीदा है।

यह रहे उसी Ising समस्या पर gradient descent और SPSA, दोनों हर energy पर 0.05 के simulated shot noise (लगभग एक हज़ार shots) और 1,800 noisy evaluations के एक ही budget के साथ:

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.circuit import ParameterVector
from qiskit.primitives import StatevectorEstimator
from qiskit.quantum_info import SparsePauliOp

H = SparsePauliOp(["IZZ", "ZZI", "IIX", "IXI", "XII"], coeffs=[-1, -1, -1, -1, -1])
exact = np.linalg.eigvalsh(H.to_matrix())[0]
n, layers = 3, 2
th = ParameterVector("θ", n * (layers + 1))
ansatz = QuantumCircuit(n)
for l in range(layers + 1):
    for q in range(n):
        ansatz.ry(th[n * l + q], q)
    if l < layers:
        ansatz.cx(0, 1); ansatz.cx(1, 2)

rng = np.random.default_rng(1)
est = StatevectorEstimator(seed=rng)
def noisy(points):
    """Energies with shot noise of 0.05 (about 1,000 shots each)."""
    return est.run([(ansatz, H, points)], precision=0.05).result()[0].data.evs

def exact_energy(p):
    return float(StatevectorEstimator().run([(ansatz, H, p)]).result()[0].data.evs)

budget = 1800                                           # energy evaluations allowed
start = rng.uniform(-0.1, 0.1, len(th))

# 1. Gradient descent with the parameter-shift rule: 18 evaluations per step
p = start.copy()
for _ in range(budget // (2 * len(p))):
    shifts = np.pi / 2 * np.eye(len(p))
    evs = noisy(np.vstack([p + shifts, p - shifts]))
    p -= 0.2 * (evs[:len(p)] - evs[len(p):]) / 2
print(f"parameter-shift descent: {budget // 18:4d} steps, final energy {exact_energy(p):.4f}")

# 2. SPSA: nudge ALL parameters at once in a random direction, 2 evaluations per step
p = start.copy()
for k in range(budget // 2):
    a, c = 1.0 / (k + 10) ** 0.602, 0.2 / (k + 1) ** 0.101   # standard decaying step sizes
    delta = rng.choice([-1, 1], size=len(p))
    e_plus, e_minus = noisy([p + c * delta, p - c * delta])
    p -= a * (e_plus - e_minus) / (2 * c) * delta
print(f"SPSA:                    {budget // 2:4d} steps, final energy {exact_energy(p):.4f}")
print(f"exact ground energy:                       {exact:.4f}")
```

```text
parameter-shift descent:  100 steps, final energy -3.4926
SPSA:                     900 steps, final energy -3.4903
exact ground energy:                       -3.4940
```

दोनों सटीक energy के 0.004 के भीतर पहुँचते हैं, जबकि उन्होंने जो हर energy देखी उसमें 0.05 की error थी: कई क़दमों में errors औसत होकर मिट जाती हैं। 9 parameters के साथ parameter shifts थोड़ा बेहतर करते हैं। लेकिन 900 parameters सोचिए: एक parameter-shift क़दम 1,800 evaluations लेता, पूरा budget, जबकि हर SPSA क़दम फिर भी 2 लेता। इसीलिए बड़े circuits के लिए SPSA लोकप्रिय है।

## Noise: loop क्या सोख सकता है, और क्या नहीं

Variational algorithms का एक उपयोगी गुण है: वे **उसी hardware पर train होते हैं जिस पर चलते हैं**। मान लीजिए किसी device में **coherent** errors हैं, व्यवस्थित ग़लतियाँ जो हर बार एक जैसी होती हैं। मान लें हर RY gate 10% ज़्यादा घुमाता है, और हर CNOT 0.1 का एक अनचाहा ZZ phase जोड़ता है (एक तरह का crosstalk)। Optimiser इन errors के बारे में नहीं जानता, लेकिन उसे जानने की ज़रूरत भी नहीं: वह बस वे कोण ढूँढता है जो इस device पर सबसे अच्छा काम करते हैं।

**Incoherent** noise अलग है। Depolarising noise (पाठ 32) कुछ हिस्से समय state को random कचरे से बदल देता है। कोण का कोई भी चुनाव randomness को उलट नहीं सकता। आइए तुलना करें:

```python
import numpy as np
from scipy.optimize import minimize
from qiskit import QuantumCircuit
from qiskit.quantum_info import SparsePauliOp, Statevector, DensityMatrix, Kraus
from qiskit_aer.noise import depolarizing_error

H = SparsePauliOp(["IZZ", "ZZI", "IIX", "IXI", "XII"], coeffs=[-1, -1, -1, -1, -1])
exact = np.linalg.eigvalsh(H.to_matrix())[0]
n, layers = 3, 2

def circuit(p, over=1.0, crosstalk=0.0):
    """The ansatz as the hardware runs it: RY angles scaled by `over`, an unwanted ZZ phase after each CNOT."""
    qc = QuantumCircuit(n)
    for l in range(layers + 1):
        for q in range(n):
            qc.ry(over * p[n * l + q], q)
        if l < layers:
            for a, b in [(0, 1), (1, 2)]:
                qc.cx(a, b)
                if crosstalk:
                    qc.rzz(crosstalk, a, b)
    return qc

def energy(p, **err):
    return Statevector(circuit(p, **err)).expectation_value(H).real

dep = Kraus(depolarizing_error(0.02, 2))                # 2% depolarising noise on every CNOT
def noisy_energy(p):
    qc, rho = circuit(p), DensityMatrix.from_label("000")
    for inst in qc.data:
        qubits = [qc.find_bit(q).index for q in inst.qubits]
        rho = rho.evolve(inst.operation, qubits)
        if inst.operation.name == "cx":
            rho = rho.evolve(dep, qubits)
    return rho.expectation_value(H).real

def vqe(f):
    start = np.random.default_rng(2).uniform(-0.1, 0.1, 9)
    return minimize(f, start, method="COBYLA", options={"maxiter": 2000})

ideal = vqe(energy)
print(f"exact ground energy                      {exact:.4f}")
print(f"VQE on a perfect device                  {ideal.fun:.4f}")
faulty = dict(over=1.1, crosstalk=0.1)
print(f"perfect-device angles on faulty hardware {energy(ideal.x, **faulty):.4f}")
print(f"VQE run directly on the faulty hardware  {vqe(lambda p: energy(p, **faulty)).fun:.4f}")
print(f"VQE with 2% depolarising noise per CNOT  {vqe(noisy_energy).fun:.4f}")
```

```text
exact ground energy                      -3.4940
VQE on a perfect device                  -3.4940
perfect-device angles on faulty hardware -3.4094
VQE run directly on the faulty hardware  -3.4867
VQE with 2% depolarising noise per CNOT  -3.2995
```

Perfect simulator पर मिले कोण faulty device पर बुरा करते हैं (−3.41)। VQE सीधे faulty device पर चलाने से लगभग सब वापस मिल जाता है (−3.487): optimiser ने over-rotation और ज़्यादातर crosstalk की भरपाई कर ली है। लेकिन चारों CNOTs में से हर एक पर 2% depolarising noise के साथ, सबसे अच्छी संभव energy −3.30 पर अटकी है, असली मान से बहुत ऊपर। इस तरह के noise से लड़ना **error mitigation** (पाठ 36) का काम है, जिसे VQE प्रयोग नियमित रूप से इस्तेमाल करते हैं।

एक चेतावनी याद रखने लायक है। कोई असली state, pure या noisy, कभी E₀ से कम energy नहीं रख सकती, इसलिए सिद्धांत noisy hardware पर भी लागू होता है। लेकिन एक **अनुमान** shot noise या अधूरे mitigation की वजह से E₀ से नीचे जा सकता है। अगर कोई VQE paper सटीक जवाब से कम energy बताता है, तो यह उसके error bars के बारे में ख़तरे का संकेत है, सफलता नहीं।

## QAOA: variational optimisation

कई व्यावहारिक समस्याएँ **combinatorial optimisation** हैं: exponentially कई व्यवस्थाओं में से सबसे अच्छी चुनना। एक मानक परीक्षण समस्या **MaxCut** है: किसी network के nodes को दो समूहों में ऐसे बाँटें कि ज़्यादा से ज़्यादा links समूहों के बीच से गुज़रें। (यह आम तौर पर NP-hard है, और scheduling, chip layout और clustering की समस्याओं से गहराई से जुड़ी है।)

### Cost एक energy के रूप में

हर node पर 0 या 1 लिखें। Nodes i और j के बीच का link तब कटता है जब उनके labels अलग हों। Operator (1 − ZᵢZⱼ)/2 का मान कटे link के लिए 1 और बाक़ी के लिए 0 है, तो

> C = Σ links पर (1 − ZᵢZⱼ)/2

एक diagonal "Hamiltonian" है जिसका हर bitstring पर मान उसके cut का आकार है। Maximum cut ढूँढने का मतलब है C की **सबसे ऊँची energy** वाली bitstring ढूँढना (या, समान रूप से, −C की ground state)। पाठ 46 दिखाता है कि portfolio चुनने से routing तक, कितनी और समस्याएँ इसी तरह लिखी जा सकती हैं।

### QAOA circuit

QAOA (Farhi, Goldstone और Gutmann, 2014) सभी bitstrings के बराबर superposition |+⟩^⊗n से शुरू करता है और दो परतों के p दौर लगाता है:

1. **Problem परत** e^(−iγC): हर bitstring को उसके cut आकार के अनुपात में phase देती है। Gates में, हर link पर एक RZZ rotation।
2. **Mixer परत** e^(−iβΣXᵢ): हर qubit पर एक RX rotation, जो एक flip से अलग bitstrings के बीच amplitude बहाता है।

2p कोण (γ₁, β₁, …, γₚ, βₚ) एक classical optimiser अपेक्षित cut ⟨C⟩ को अधिकतम करने के लिए सेट करता है। Phases अच्छे जवाबों पर निशान लगाते हैं, और mixer उन phases को interference में बदलता है जो **उनकी probability बढ़ाता है**, कुछ-कुछ Grover के algorithm (पाठ 24) जैसा, लेकिन हाँ/ना oracle के बजाय cost से निर्देशित। p → ∞ पर QAOA एक धीमी **adiabatic** evolution (पाठ 46) दोहरा सकता है और optimum ढूँढने की गारंटी है; छोटे p पर यह एक heuristic है।

### Landscape

p = 1 पर सिर्फ़ दो कोण हैं, इसलिए हम optimiser का खोजा जाने वाला पूरा landscape नक़्शे पर उतार सकते हैं। यह रहा 6 nodes का एक ring, जिसका सबसे अच्छा cut सारे 6 links हैं (labels बारी-बारी रखें):

```python
import numpy as np
from scipy.optimize import minimize
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

n = 6
edges = [(i, (i + 1) % n) for i in range(n)]          # a ring of 6 nodes; the best cut is 6

cuts = np.array([sum((x >> i & 1) != (x >> j & 1) for i, j in edges) for x in range(2**n)])

def expected_cut(gamma, beta):
    qc = QuantumCircuit(n)
    qc.h(range(n))                                    # equal superposition of all 64 splits
    for i, j in edges:
        qc.rzz(2 * gamma, i, j)                       # problem layer
    qc.rx(2 * beta, range(n))                         # mixer layer
    return Statevector(qc).probabilities() @ cuts

gammas = np.linspace(0, np.pi, 41)
betas = np.linspace(0, np.pi / 2, 11)
grid = np.array([[expected_cut(g, b) for g in gammas] for b in betas])

shades = " .:-=+*#%@"                                 # low ... high expected cut
print("β ↓   γ →  (0 to π)")
for b, row in zip(betas, grid):
    line = "".join(shades[int((v - grid.min()) / (grid.max() - grid.min()) * 9.999)] for v in row)
    print(f"{b:4.2f}  {line}")

i, j = np.unravel_index(grid.argmax(), grid.shape)
print(f"\nbest on the grid: γ = {gammas[j]:.3f}, β = {betas[i]:.3f}, expected cut {grid.max():.3f} of 6"
      f" (ratio {grid.max() / 6:.3f})")
res = minimize(lambda x: -expected_cut(*x), [gammas[j], betas[i]], method="COBYLA")
print(f"refined by COBYLA: γ = {res.x[0]:.3f}, β = {res.x[1]:.3f}, expected cut {-res.fun:.3f} (ratio {-res.fun / 6:.3f})")
print(f"random guessing: {cuts.mean():.3f} (ratio {cuts.mean() / 6:.3f})")
```

```text
β ↓   γ →  (0 to π)
0.00  =========================================
0.16  ==-::.::-==+*##%##*+==-::.::-==+*##%##*+=
0.31  =-:     :-=*#@@@@@#*=-:     :-=*#@@@@@#*=
0.47  =-:     :-=*#@@@@@#*=-:     :-=*#@@@@@#*=
0.63  ==-::.::-==+*##%##*+==-::.::-==+*##%##*+=
0.79  =========================================
0.94  =+*##%##*+==-::.::-==+*##%##*+==-::.::-==
1.10  =*#@@@@@#*=-:     :-=*#@@@@@#*=-:     :-=
1.26  =*#@@@@@#*=-:     :-=*#@@@@@#*=-:     :-=
1.41  =+*##%##*+==-::.::-==+*##%##*+==-::.::-==
1.57  =========================================

best on the grid: γ = 2.749, β = 0.471, expected cut 4.427 of 6 (ratio 0.738)
refined by COBYLA: γ = 2.749, β = 0.393, expected cut 4.500 (ratio 0.750)
random guessing: 3.000 (ratio 0.500)
```

हर अक्षर एक (γ, β) बिंदु पर अपेक्षित cut है, कम (ख़ाली) से ऊँचे (@) तक। कई बातें दिखती हैं:

- **सपाट रेखाएँ।** β = 0 पर mixer कुछ नहीं करता, और γ = 0 पर problem परत कुछ नहीं करती; दोनों हालात में phases कभी probabilities में नहीं बदलते, और अपेक्षित cut random अनुमान के मान 3 पर रहता है। (γ = π/2 पर हर node के दो links रद्द हो जाते हैं और problem परत फिर बेअसर हो जाती है, और β = π/4 पर भी इस समस्या की एक symmetry से असर रद्द हो जाते हैं।)
- Landscape **दोहराता** है, समस्या की symmetries की वजह से। Optimiser को बस एक छोटा डिब्बा खोजना होता है।
- सबसे अच्छा बिंदु 6 में से **4.5** का अपेक्षित cut देता है, ठीक **3/4** का अनुपात। यह p = 1 पर rings के लिए Farhi और साथियों के एक प्रमेय से मेल खाता है, जबकि random अनुमान से 1/2 मिलता है।

एक उपयोगी तथ्य इसकी वजह बताता है: गहराई p पर QAOA हर link से p क़दम के भीतर का network ही "देखता" है। Ring का हर link स्थानीय रूप से एक जैसा दिखता है, इसलिए वही कोण 6 nodes या 60 लाख nodes के ring पर वही 3/4 अनुपात देते हैं। आम तौर पर अच्छे कोण मिलती-जुलती समस्याओं के बीच **स्थानांतरित** हो जाते हैं, जिससे बहुत सारा optimisation बचता है। गहरे circuits दूर तक देखते हैं और बेहतर करते हैं: पाठ 46 एक कठिन network पर p = 1, 2 और 3 चलाता है और नतीजों की तुलना सबसे अच्छे classical algorithms से करता है।

## ईमानदार स्थिति

- **कोई साबित व्यावहारिक बढ़त नहीं।** अब तक आज़माई गई हर असली chemistry या optimisation समस्या के लिए सबसे अच्छे classical तरीके (chemistry में coupled cluster, DMRG और tensor networks; optimisation में commercial solvers, simulated annealing और Goemans–Williamson algorithm) VQE और QAOA की बराबरी करते हैं या उन्हें हराते हैं।
- **Training कठिन है।** Barren plateaus, स्थानीय minima और noise सब optimiser से लड़ते हैं, और मापने की लागत समस्या के आकार के साथ तेज़ी से बढ़ती है (पाठ 45 तीनों को खोजता है)।
- **Classical simulation से खिंचाव।** हाल का शोध बताता है कि जो circuits barren plateaus से बचने लायक संरचित हैं, वे अक्सर classically simulate होने लायक भी संरचित होते हैं, जिससे quantum बढ़त ख़त्म हो जाएगी।
- **Variational तरीके आज किस काम के हैं:** ये असली hardware को आज़माने, error mitigation (पाठ 36) परखने और heuristics खोजने का शोधकर्ताओं का मुख्य तरीका हैं। नए hybrid तरीके इन पर बनते हैं; उदाहरण के लिए **sample-based quantum diagonalisation**, जिसे IBM और RIKEN के शोधकर्ताओं ने 2024 में Fugaku supercomputer के साथ इस्तेमाल किया, quantum computer से सबसे अहम bitstrings चुनता है और classical computer से उनके भीतर समस्या हल करता है।
- **लंबी अवधि।** Fault-tolerant machines पर chemistry शायद phase estimation (पाठ 27) की ओर जाएगी, जो बिना optimisation loop के किसी भी precision तक energies देता है। Variational विचार उसके लिए अच्छी शुरुआती states बनाने में, और quantum machine learning (पाठ 45) में ज़िंदा रहेंगे।

## ख़ुद आज़माएँ

1. एक qubit पर H = Z + 0.5·X के लिए ground energy क्या है? अगर गुणांक 1 और 1 हों तो?
2. Variational principle वाले demo में कोई state −1.4142 से कम energy क्यों नहीं रख सकती?
3. सामान्य Z-basis माप के साथ किसी qubit पर ⟨Y⟩ कौन-से gates मापते हैं?
4. 1,000 shots के साथ energy के अनुमान की error 0.03 है। 0.001 की error के लिए मोटे तौर पर कितने shots चाहिए?
5. किसी circuit की energy E(θ) = 2 + 3 cos θ − sin θ है। Parameter-shift rule से θ = 0 पर dE/dθ निकालें, और सीधे differentiate करके जाँचें।
6. एक circuit में 200 parameters हैं। Parameter shifts के साथ एक gradient क़दम कितने energy evaluations लेता है? SPSA के साथ?
7. Optimiser 10% over-rotation की भरपाई क्यों कर सकता है, लेकिन depolarising noise की नहीं?
8. p = 1 वाला QAOA 6-node ring पर 3/4 cut अनुपात देता है। वही कोण 100-node ring पर वही अनुपात क्यों देते हैं?

**जवाब:**

1. aZ + bX की ground energy −√(a² + b²) है। तो −√1.25 ≈ **−1.118**, और 1 और 1 के साथ −√2 ≈ **−1.414**।
2. किसी भी state की energy energy levels का भारित औसत है, जिसके भार ऋणेतर हैं और जुड़कर 1 होते हैं, इसलिए यह सबसे निचले level −√2 ≈ −1.4142 से कम नहीं हो सकती।
3. **S† फिर H** (S† के बाद H, Y अक्ष को Z अक्ष पर घुमा देता है), फिर सामान्य माप।
4. Error 1/√shots की तरह घटती है, तो (0.03/0.001)² = 900 गुना ज़्यादा चाहिए: लगभग **9,00,000 shots**।
5. E(π/2) = 2 + 0 − 1 = 1 और E(−π/2) = 2 + 0 + 1 = 3, तो (1 − 3)/2 = **−1**। सीधे: dE/dθ = −3 sin θ − cos θ, जो θ = 0 पर −1 है। दोनों मिलते हैं।
6. Parameter shift: 2 × 200 = **400** evaluations। SPSA: **2**।
7. Over-rotation व्यवस्थित है: optimiser बस छोटे कोण (θ/1.1) सीख लेता है, और device फिर ठीक इच्छित state बनाता है। Depolarising noise random है: कुछ runs कचरे से बदल जाते हैं, और कोणों का कोई तय चुनाव randomness को उलट नहीं सकता।
8. p = 1 पर हर link का अपेक्षित cut सिर्फ़ उस link से एक क़दम के भीतर के network पर निर्भर है। किसी भी ring में हर link का पड़ोस एक जैसा है, इसलिए हर link बराबर योगदान देता है, ring का आकार कुछ भी हो।

## सार-पत्रक

| विचार | सूत्र या तथ्य |
|---|---|
| NISQ | Noisy hardware: ~10⁻³ errors, इसलिए सिर्फ़ उथले circuits |
| Loop | Ansatz \|ψ(θ)⟩ बनाता है → quantum computer E(θ) मापता है → classical optimiser θ बदलता है |
| Variational principle | हर state के लिए ⟨ψ\|H\|ψ⟩ = Σ\|cᵢ\|²Eᵢ ≥ E₀ |
| H मापना | H = Σ cⱼPⱼ; X (H) या Y (S†, H) को Z पर घुमाएँ; मान = (−1)^parity |
| Shot noise | Error ∝ 1/√shots |
| Ansatz | Expressive, उथला और trainable; hardware-efficient या समस्या-प्रेरित (UCC, QAOA) |
| Real Hamiltonians | सिर्फ़ X और Z पद → real ground state → RY + CNOT काफ़ी |
| Parameter shift | dE/dθ = [E(θ + π/2) − E(θ − π/2)]/2, rotation gates के लिए सटीक |
| Gradient की लागत | प्रति parameter 2 evaluations; SPSA: हर क़दम 2, parameters कितने भी हों |
| Noise | Coherent errors ज़्यादातर सोख ली जाती हैं; incoherent noise नहीं → error mitigation (पाठ 36) |
| ख़तरे का संकेत | E₀ से नीचे अनुमानित energy का मतलब है error bars ग़लत हैं |
| MaxCut cost | Links पर C = Σ (1 − ZᵢZⱼ)/2 |
| QAOA | \|+⟩^⊗n, फिर e^(−iγC) (RZZ) और e^(−iβΣX) (RX) के p दौर; 2p कोण |
| Rings पर QAOA | p = 1 पर 3/4 cut अनुपात; कोण मिलते-जुलते graphs के बीच स्थानांतरित होते हैं |
| स्थिति | अभी व्यावहारिक बढ़त नहीं; barren plateaus, मापने की लागत, classical होड़ |
