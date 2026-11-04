---
layout: ../../layouts/Post.astro
title: "Error mitigation"
description: "Getting accurate answers from today's noisy quantum computers without full error correction. Why mitigation fixes averages rather than individual runs, readout error mitigation, zero-noise extrapolation, probabilistic error cancellation and its exponential cost, Pauli twirling, dynamical decoupling, how these are used in practice, and where their limits are. Every technique is simulated and checked."
date: 2026-11-04
category: lesson
lesson: 36
---

Lessons 33 to 35 showed the long-term answer to noise: error correction. But it needs hundreds of physical qubits per logical qubit, and today's largest machines have at most a few thousand physical qubits. In the years before full fault tolerance, quantum computers are what John Preskill in 2018 called **NISQ** devices: Noisy Intermediate-Scale Quantum. They have enough qubits to be hard to simulate, but too much noise for error correction at scale.

**Error mitigation** is the set of techniques for getting useful answers out of NISQ machines anyway. It doesn't detect and fix errors as they happen. Instead, it runs extra, cleverly chosen circuits and uses classical post-processing to estimate what the result **would have been** without noise. It's how IBM's 127-qubit "utility" experiment of 2023 (Lesson 29) got accurate numbers out of a noisy machine.

## The key idea: fix the average, not each run

Most near-term algorithms, such as VQE (Lesson 30) and simulation (Lesson 29), don't need one perfect bitstring. They need an **expectation value**, like an energy ⟨H⟩ or a magnetisation ⟨Z⟩, which is an average over many shots. That changes the problem completely. We don't have to make every shot right; we only need the **average** to come out right.

| | Error correction | Error mitigation |
|---|---|---|
| What it fixes | Each run, in real time | The average over many runs, afterwards |
| Extra qubits | Many (hundreds per logical qubit) | Few or none |
| Extra cost | Qubits and gates | Extra shots and circuits |
| Gives | Correct individual results | Better estimates of expectation values |
| Scales to large circuits? | Yes, below threshold | No: cost grows exponentially |

That last row is the catch, and we'll come back to it. First, the techniques.

## 1. Readout error mitigation

The simplest error to mitigate is measurement error (Lesson 32), because it can be measured directly. Prepare each basis state, measure it many times, and record how often each outcome comes out. That gives the **confusion matrix** M: entry (i, j) is the probability of reading i when the true state is j. The probabilities you observe are then

> P_observed = M · P_true

so you can recover the true probabilities by solving this equation, which amounts to multiplying by M⁻¹:

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

The raw Bell state measured ⟨ZZ⟩ = 0.79 instead of 1, purely because of readout errors. After inverting the confusion matrix, the probabilities come out almost exactly right, and ⟨ZZ⟩ = 1.000.

Notice the mitigated probability for 01 came out as **−0.0001**. That's not a bug. Inverting M undoes the average effect of the noise, and shot noise can push the estimate of a true zero slightly below zero. Mitigated "probabilities" are really **quasi-probabilities**, which is fine as long as you only use them to compute averages.

For n qubits, the full confusion matrix is 2ⁿ × 2ⁿ, too big to measure beyond a dozen or so qubits. In practice, methods assume readout errors are mostly independent per qubit (a tensor product of small 2 × 2 matrices), or use tricks like **TREX** (twirled readout error extinction), which randomly flips qubits before measurement so that the readout noise becomes a simple scaling that's easy to divide out.

## 2. Zero-noise extrapolation

Gate errors can't be measured as simply as readout errors. But here's a clever idea: even if you can't **remove** noise, you can usually **add** it in a controlled way. Run the circuit at the normal noise level, then at 3 times, then at 5 times, and see how the answer changes. Then extrapolate the trend back to **zero** noise.

How do you triple the noise without changing the ideal circuit? By **gate folding**: replace each CNOT with CNOT·CNOT·CNOT. Since CNOT·CNOT = I, the ideal circuit is unchanged, but there are now three noisy gates where there was one. Five CNOTs give five times the noise, and so on.

Here's ZNE on a small Ising-model simulation with 2% CNOT errors:

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

The raw result is off by 0.047. Extrapolating to zero noise improves it to 0.026 with a straight line, 0.007 with a parabola, and 0.0016 with an exponential, about **30 times better** than the raw value. The exponential fits best here because depolarising noise shrinks signals by the same factor with each gate, which is exactly an exponential decay. Choosing the right extrapolation model matters, and in real experiments it's a judgment call, which is one weakness of ZNE.

Two other things to know about ZNE:

- **It costs extra shots.** Extrapolation amplifies statistical uncertainty: small random errors in the three measured points become a bigger error at zero noise. Real experiments need several times more shots to get the same error bars.
- **It assumes noise scales predictably.** Folding assumes the noise of CNOT·CNOT·CNOT is exactly three times the noise of one CNOT, which is only approximately true. IBM's 2023 utility experiment used a more careful method called **probabilistic error amplification (PEA)**, which first learns the noise and then amplifies it precisely.

ZNE was proposed in 2017 (Temme, Bravyi and Gambetta; and Li and Benjamin) and first demonstrated at scale on IBM hardware in 2019.

## 3. Probabilistic error cancellation

ZNE gets close to the right answer. **Probabilistic error cancellation (PEC)** gets the exact right answer on average, at a price.

The idea: if you know the noise channel N exactly, you can write its **inverse** N⁻¹ as a combination of operations you can actually do. For depolarising noise of strength p, the inverse is "do nothing" with weight slightly above 1, plus X, Y and Z each with a small **negative** weight:

> N⁻¹ = (1 + 3p/(4(1−p))) · [nothing] − (p/(4(1−p))) · ([X] + [Y] + [Z])

You can't apply an operation with a negative probability. But you can **simulate** it: pick an operation at random with probability proportional to the size of its weight, run the circuit with it, and multiply the result by the sign of the weight and by a normalising factor γ (the sum of the absolute weights). Averaged over many runs, the noise cancels exactly:

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

Ten gates with 5% depolarising noise shrink ⟨X⟩ from −0.416 to −0.247, a 40% error. With PEC, the estimate is −0.406 ± 0.010, matching the ideal value within its error bar. The noise has been cancelled.

But look at the error bars: 0.005 raw, 0.010 with PEC, for the same number of shots. Every gate multiplies the spread of the estimate by γ, so the whole circuit multiplies it by γ^G. To get back to the original precision you need **γ^(2G)** times more shots. Here's how that grows:

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

With 1% errors, 100 gates need about 20 times more shots: affordable. 300 gates need 8,000 times more: painful. 1,000 gates need 10¹³ times more: impossible. This **exponential sampling cost** is the fundamental limit of error mitigation, and every method has some version of it. PEC also requires knowing the noise model accurately, which for many qubits means learning a sparse model of the noise first (as IBM did in 2023 with "sparse Pauli–Lindblad" noise models).

## 4. Pauli twirling: making noise simple

Lesson 32 showed that **coherent** errors (the same small over-rotation every time) build up much faster than **random** ones, and they're also hard to model, which breaks ZNE and PEC. **Pauli twirling** (also called randomised compiling) converts coherent errors into random ones.

The trick: around each two-qubit gate, insert a random Pauli P before it, and the matching Pauli P' = CNOT·P·CNOT after it. In the ideal circuit, P' exactly undoes P, so nothing changes. But the error, sandwiched between them, gets randomly flipped in sign. Averaged over many random choices, the coherent error turns into a simple random Pauli channel:

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

After 10 CNOTs, the coherent error is already 5 times worse than the twirled one. By 50 CNOTs, the coherent error has wiped out 57% of the fidelity while the twirled one has lost only 3%. (The coherent column doesn't grow steadily because a coherent error is a rotation, which can swing back and forth; that unpredictability is part of what makes it dangerous.) In practice, twirling is applied alongside ZNE or PEC: twirl first so the noise is a well-behaved Pauli channel, then extrapolate or cancel it.

## 5. Dynamical decoupling: protecting idle qubits

In a real circuit, many qubits spend time **idle**, waiting for gates on other qubits to finish. While idle, they dephase (Lesson 32). The spin echo showed that an X pulse halfway through the wait reverses slow frequency errors. **Dynamical decoupling (DD)** fills idle periods with sequences of such pulses, chosen so that they multiply to the identity.

Here's a qubit waiting 20 µs, with a random frequency offset in each run plus a slow drift, protected by different numbers of evenly spaced X pulses:

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

Left alone, the qubit loses all coherence: the random offsets scramble the phase completely. A single echo pulse restores 79%, because it cancels the constant offset, and only the drift is left. More pulses cancel faster and faster changes too: 16 pulses keep 99.9%. In this simulation the pulses are perfect; real pulses have their own small errors, so there's a best number of pulses for each situation. DD also suppresses **crosstalk** (unwanted ZZ coupling between neighbours), which is one of its biggest uses on superconducting chips. Qiskit can insert DD sequences automatically with the transpiler pass `PadDynamicalDecoupling`.

## Other techniques

- **Symmetry verification:** if the true answer must have a known property (say, a fixed number of particles in a chemistry simulation), throw away every shot that violates it. Cheap and effective, but it discards data.
- **Virtual distillation:** run two or more copies of a noisy state and measure them together, in a way that effectively purifies the state and suppresses errors. It needs extra qubits.
- **Learning-based methods:** train a classical model to map noisy results to corrected ones, using circuits whose ideal answers are known (for example, Clifford circuits, which can be simulated classically).

## Using mitigation in practice

You rarely have to implement these by hand:

- **Qiskit Runtime** (Lesson 40) builds them into its Estimator primitive. A single setting, `resilience_level`, turns them on: level 1 applies readout mitigation (TREX), and level 2 adds zero-noise extrapolation with gate twirling. Options also enable dynamical decoupling and PEC.
- **Mitiq**, an open-source Python library from the Unitary Fund, implements ZNE, PEC, DD and others for circuits from Qiskit and other frameworks.

Mitigation is now a standard part of running anything serious on NISQ hardware. A typical workflow: twirl the gates, add DD to idle qubits, mitigate readout, and extrapolate to zero noise.

## The limits

Every mitigation technique pays with extra shots, and the cost grows **exponentially** with the total amount of noise in the circuit (roughly, error rate × number of gates). PEC makes this explicit with γ^(2G); ZNE hides it in growing error bars and model uncertainty. As a rule of thumb, mitigation works when the circuit's total "error budget" εG is around 1 to a few, meaning the raw circuit is noisy but not completely scrambled. For a circuit where εG = 50, no amount of mitigation will help.

That's why mitigation is a **bridge**, not a destination. It extends what NISQ machines can do, makes today's experiments useful for research, and will keep being used on top of early error-corrected machines to squeeze out the last residual errors. But algorithms like Shor's, with billions of gates, will always need error correction.

## Try it

1. Why can error mitigation improve an expectation value but not a single measured bitstring?
2. A qubit in |0⟩ reads as 1 with 4% chance, and a qubit in |1⟩ reads as 0 with 10% chance. Write its confusion matrix.
3. In gate folding, why is a CNOT replaced by three CNOTs and not two?
4. A ZNE experiment measures 0.60 at noise ×1 and 0.40 at noise ×3. What does a straight-line extrapolation give at zero noise?
5. For PEC with γ = 1.02 per gate, roughly how many times more shots does a 200-gate circuit need?
6. What does Pauli twirling change about the noise, and why does that help ZNE and PEC?
7. Why does a single echo pulse fail to fully protect the qubit in the dynamical decoupling simulation?

**Answers:**

1. Mitigation corrects the **statistics** of many runs (by inverting, extrapolating or reweighting averages). An individual shot is still a random, possibly wrong, bitstring; nothing in it is fixed.
2. Columns are the true states 0 and 1: **M = [[0.96, 0.10], [0.04, 0.90]]**.
3. CNOT·CNOT = I, so two CNOTs would change the ideal circuit (removing the gate). Three CNOTs equal one CNOT ideally, with three times the noise.
4. The line drops 0.20 per 2 units of noise, so 0.10 per unit. Going from ×1 back to ×0 adds 0.10: **0.70**.
5. γ^(2G) = 1.02⁴⁰⁰ ≈ e^(400 × 0.0198) ≈ e^7.9 ≈ **2,800** times more.
6. It turns coherent errors (which add up as N² and are hard to model) into random Pauli errors (which add up as N and form a simple, predictable channel). ZNE and PEC both rely on noise that is predictable and easy to describe.
7. One echo cancels any **constant** frequency offset, but the drift changes the frequency during the wait, so the two halves don't exactly cancel. More pulses make the intervals shorter, so the frequency changes less within each one.

## Cheat sheet

| Idea | Formula or fact |
|---|---|
| NISQ | Noisy Intermediate-Scale Quantum (Preskill, 2018): before full error correction |
| Mitigation vs correction | Fixes averages after the fact; costs shots, not qubits |
| Readout mitigation | P_observed = M·P_true; solve for P_true; results are quasi-probabilities |
| ZNE | Run at noise ×1, ×3, ×5 (gate folding: CNOT → CNOT·CNOT·CNOT); extrapolate to 0 |
| Extrapolation models | Linear, polynomial (Richardson), exponential; the model choice matters |
| PEC | Write N⁻¹ as quasi-probabilities; sample, sign and rescale; unbiased |
| PEC cost | γ per gate; γ^(2G) times more shots for G gates |
| Depolarising γ | 1 + 3p/(2(1 − p)) |
| Pauli twirling | Random P before, CNOT·P·CNOT after; coherent → random Pauli noise |
| Dynamical decoupling | X pulses during idle time cancel slow dephasing and crosstalk |
| In Qiskit Runtime | Estimator `resilience_level` 1: readout (TREX); 2: + ZNE and twirling |
| Libraries | Qiskit Runtime, Mitiq |
| The limit | Cost grows exponentially with error rate × gate count; mitigation is a bridge to QEC |
