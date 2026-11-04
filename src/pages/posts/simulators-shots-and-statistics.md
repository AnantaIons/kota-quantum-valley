---
layout: ../../layouts/Post.astro
title: "Simulators, shots and statistics"
description: "The kinds of quantum simulator and their limits, a 60-qubit simulation on a laptop, estimating results from shots with honest error bars, how many shots you need, comparing two result histograms, and simulating realistic noise to predict what real hardware will give you."
date: 2026-11-04
category: lesson
lesson: 20

---

Almost all quantum programs are written and tested on a **simulator** before they go near real hardware. Simulators are free, fast, noiseless (unless you ask for noise) and let you look inside the state, which no real device can do. But they have hard limits, and the results of real experiments come with random scatter that you have to handle honestly.

This lesson covers both sides: what each kind of simulator can and can't do, and how to turn a pile of shot counts into a number with an error bar you can trust. It ends by simulating realistic noise, so you can predict what a real chip will show before you spend time on it.

## Why simulating quantum computers is hard

Lesson 1 gave the basic problem: an n-qubit state has 2ⁿ complex amplitudes, each typically 16 bytes. Every extra qubit doubles the memory. A laptop with 16 GB runs out at about 30 qubits; the world's largest supercomputers run out somewhere in the 40s for a full state vector.

But "2ⁿ" is the worst case. Many circuits have **structure** that a clever simulator can exploit, so there are several kinds of simulator, each good at different things.

| Simulator | What it stores | Good for | Practical limit |
|---|---|---|---|
| **Statevector** | All 2ⁿ amplitudes exactly | Any circuit, exact probabilities | ~30 qubits on a laptop |
| **Density matrix** | A 2ⁿ × 2ⁿ matrix (Lesson 16) | Noisy circuits, exactly | ~15 qubits (4ⁿ numbers) |
| **Stabilizer** | ~n² bits (Lesson 17) | Clifford-only circuits | Thousands of qubits |
| **Matrix product state (MPS)** | A chain of small tensors | Circuits with limited entanglement | Hundreds of qubits, if entanglement stays low |
| **Sampling (shots)** | Any of the above, then draws random results | Mimicking real hardware output | Same as the method underneath |

In Qiskit, the `quantum_info` tools (`Statevector`, `DensityMatrix`, `StabilizerState`) give you exact states, and the primitives (`StatevectorSampler`, `StatevectorEstimator`) give you hardware-like outputs. For more speed and more methods, **Qiskit Aer** (`pip install qiskit-aer`) is IBM's high-performance simulator, and it has all the methods in the table.

### A 60-qubit circuit on a laptop

A 60-qubit state vector would need 2⁶⁰ × 16 bytes ≈ 18 million gigabytes. But a GHZ state is very simple: its entanglement, measured by Lesson 14's entropy, is never more than 1 bit across any cut of the chain. An MPS simulator stores it in a tiny amount of memory.

```python
from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator

n = 60                                           # 2^60 amplitudes would need ~18 million GB
ghz = QuantumCircuit(n)
ghz.h(0)
for q in range(n - 1):
    ghz.cx(q, q + 1)
ghz.measure_all()

mps = AerSimulator(method="matrix_product_state", seed_simulator=2)
counts = mps.run(transpile(ghz, mps), shots=1000).result().get_counts()
for bits, c in counts.items():
    print(bits[:10] + "..." + bits[-10:], c)
```

```text
0000000000...0000000000 485
1111111111...1111111111 515
```

It ran in under a second. The catch: when a circuit builds up a lot of entanglement, as interesting algorithms do, MPS memory grows exponentially too. Every simulator has a kind of circuit it struggles with, and the circuits that defeat **all** of them are exactly the ones where quantum computers might be useful. That's the basis of "quantum advantage" experiments (Lesson 31).

## Shots: turning counts into numbers

A real quantum computer (or a Sampler) gives you counts from a finite number of shots. Lesson 5 explained the scatter. Here's how to use it properly.

Say you want ⟨Z⟩ for one qubit. From the counts, ⟨Z⟩ ≈ P(0) − P(1) = 2·P(0) − 1, where P(0) is estimated as (number of 0s)/N. The uncertainty of P(0) is √(P(0)(1 − P(0))/N) (Lesson 5), and ⟨Z⟩ is twice that. Always report the result **with** this **standard error**:

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler

qc = QuantumCircuit(1)
qc.ry(2 * np.arccos(np.sqrt(0.7)), 0)          # P(0) = 0.7, so <Z> = 0.4 exactly
qc.measure_all()

for shots in [100, 1_000, 10_000, 100_000]:
    c = StatevectorSampler(seed=9).run([qc], shots=shots).result()[0].data.meas.get_counts()
    p0 = c.get("0", 0) / shots
    z = 2 * p0 - 1                               # <Z> = P(0) - P(1)
    err = 2 * np.sqrt(p0 * (1 - p0) / shots)     # standard error of <Z>
    print(f"{shots:>7} shots: <Z> = {z:.3f} ± {err:.3f}")
```

```text
    100 shots: <Z> = 0.240 ± 0.097
   1000 shots: <Z> = 0.394 ± 0.029
  10000 shots: <Z> = 0.408 ± 0.009
 100000 shots: <Z> = 0.405 ± 0.003
```

The true value is 0.4. Look at the first line: 0.240 is quite far off, but the error bar (±0.097) warns you, and 0.4 is within about two error bars. That's the point of error bars: they tell you how far to trust a number. A useful rule of thumb: a result is **consistent** with a prediction if they differ by less than about two standard errors; a difference of more than three is worth investigating.

### How many shots do you need?

For an observable whose results are ±1 (any Pauli string), the standard error is at most 1/√N. So to reach a precision ε:

> **N ≈ 1/ε²**

| Precision wanted | Shots needed (worst case) |
|---|---|
| ±0.1 | 100 |
| ±0.01 | 10,000 |
| ±0.001 | 1,000,000 |

That 1/ε² is a real cost. Variational algorithms (Lesson 30) estimate energies made of dozens or hundreds of Pauli terms, each needing thousands of shots, at every step of an optimisation. Shot counts, not gate counts, are often what makes near-term algorithms slow. (Lesson 25 shows how amplitude estimation can improve this to ~1/ε, on future machines.)

The Estimator handles this for you: on hardware you set a target `precision`, and it chooses the shots. On a simulator, `StatevectorEstimator(default_precision=0.01)` adds realistic random scatter of that size to the exact answer, which is a quick way to test whether your algorithm survives shot noise.

## Comparing two histograms

Often you want to know how close a measured distribution is to the ideal one, for example the output of a real chip versus the simulator. Two standard measures:

**Total variation distance (TVD):** half the sum of the differences in probability over all outcomes. 0 means identical, 1 means no overlap at all. It's the largest difference in probability the two distributions can give to any event.

**Hellinger fidelity:** (Σ √(pᵢ qᵢ))², with 1 meaning identical and 0 meaning no overlap. Qiskit has it built in, and it's what IBM's benchmarks often report.

```python
from qiskit.quantum_info import hellinger_fidelity

ideal  = {"00": 500, "11": 500}
noisy  = {"00": 470, "11": 455, "01": 40, "10": 35}

def tvd(p, q):
    """Total variation distance between two count dictionaries (0 = same, 1 = no overlap)."""
    keys = set(p) | set(q)
    P, Q = sum(p.values()), sum(q.values())
    return 0.5 * sum(abs(p.get(k, 0) / P - q.get(k, 0) / Q) for k in keys)

print("total variation distance:", round(tvd(ideal, noisy), 3))
print("Hellinger fidelity:      ", round(hellinger_fidelity(ideal, noisy), 3))
```

```text
total variation distance: 0.075
Hellinger fidelity:       0.925
```

7.5% of the probability is "in the wrong place": exactly the 75 shots of 01 and 10 out of 1,000. Remember that even a perfect device gives a TVD above zero with finite shots, because both histograms have shot noise. Compare against what shot noise alone would give before blaming the hardware.

## Simulating noise

The most useful thing a simulator can do before you use real hardware is predict how **noise** will spoil your results. Aer lets you build a **noise model** from simple ingredients:

- **Depolarizing error:** with probability p, a gate is followed by a random Pauli error (in effect, the qubit's state is partly scrambled). Two-qubit gates get a bigger p.
- **Readout error:** a 0 is sometimes recorded as 1 and vice versa.

Real devices publish these numbers in their calibration data (Lesson 40). Here's a model roughly like a mid-range superconducting chip: 0.1% error per single-qubit gate, 1% per CNOT, and 2–3% readout error. We run GHZ states of growing size and measure how much survives.

```python
from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator
from qiskit_aer.noise import NoiseModel, depolarizing_error, ReadoutError
from qiskit.quantum_info import hellinger_fidelity

# A simple noise model, roughly like a mid-range superconducting chip
noise = NoiseModel()
noise.add_all_qubit_quantum_error(depolarizing_error(0.001, 1), ["sx", "x", "rz"])   # 0.1% per 1-qubit gate
noise.add_all_qubit_quantum_error(depolarizing_error(0.01, 2), ["cx"])               # 1% per CNOT
noise.add_all_qubit_readout_error(ReadoutError([[0.98, 0.02], [0.03, 0.97]]))       # misread 2-3%

def ghz(n):
    qc = QuantumCircuit(n)
    qc.h(0)
    for q in range(n - 1):
        qc.cx(q, q + 1)
    qc.measure_all()
    return qc

ideal_sim = AerSimulator(seed_simulator=1)
noisy_sim = AerSimulator(noise_model=noise, seed_simulator=1)
for n in [2, 5, 10]:
    qc = transpile(ghz(n), basis_gates=["cx", "sx", "x", "rz"])
    ideal = ideal_sim.run(qc, shots=4000).result().get_counts()
    noisy = noisy_sim.run(qc, shots=4000).result().get_counts()
    good = noisy.get("0" * n, 0) + noisy.get("1" * n, 0)
    print(f"{n:2d} qubits: {good / 4000:.3f} of shots are all-0 or all-1,"
          f" Hellinger fidelity {hellinger_fidelity(ideal, noisy):.3f}")
```

```text
 2 qubits: 0.947 of shots are all-0 or all-1, Hellinger fidelity 0.947
 5 qubits: 0.842 of shots are all-0 or all-1, Hellinger fidelity 0.842
10 qubits: 0.717 of shots are all-0 or all-1, Hellinger fidelity 0.717
```

The quality falls as the circuit grows. You can predict it roughly by hand: a 10-qubit GHZ uses 9 CNOTs, each succeeding 99% of the time, so about 0.99⁹ ≈ 0.91 of runs have no gate error. Then 10 readouts, each right about 97.5% of the time: 0.975¹⁰ ≈ 0.78. Together: 0.91 × 0.78 ≈ 0.71, very close to the simulated 0.717.

This multiplication is the most important back-of-envelope calculation in near-term quantum computing: **success ≈ (gate fidelity)^(number of gates)**. It's why depth and two-qubit gate counts matter so much (Lesson 13), and why error correction (Part F) is ultimately necessary.

## Reproducibility: seeds

Simulated shots are random. To get the same numbers every time (for teaching, debugging and checking results like the ones in this course) fix the random **seed**: `StatevectorSampler(seed=…)`, `AerSimulator(seed_simulator=…)`, `np.random.default_rng(…)`. Remove the seed to see fresh randomness each run. Real hardware has no seed: its randomness is genuine (Lesson 5).

## A sensible workflow

1. **Exact first.** Use `Statevector` or `Operator` on small instances to check your circuit does what you think, with no randomness at all.
2. **Then shots.** Use a Sampler or Estimator with a realistic number of shots, and look at your error bars.
3. **Then noise.** Run a noisy simulation with numbers from the device you plan to use. If the answer is lost in noise here, it'll be lost on hardware too.
4. **Then hardware** (Lesson 40), comparing with steps 2 and 3 using TVD or Hellinger fidelity.

## Try it

1. How much memory does a 35-qubit state vector need (16 bytes per amplitude)? A 35-qubit density matrix?
2. Why can a stabilizer simulator handle thousands of qubits but not a single T gate?
3. You measure ⟨Z⟩ = 0.31 ± 0.04. Is that consistent with a prediction of 0.40? With 0.30?
4. How many shots do you need to estimate a Pauli expectation value to ±0.005?
5. A circuit has 40 CNOTs at 99.5% fidelity each and 8 readouts at 98%. Roughly what fraction of shots is error-free?
6. Two histograms have Hellinger fidelity 1.0. Does that mean the device is perfect?

**Answers:**

1. 2³⁵ × 16 bytes ≈ **550 GB**. A density matrix needs 4³⁵ × 16 bytes ≈ **1.9 × 10²² bytes**: impossible.
2. Clifford gates keep the stabilizer description small; a T gate breaks that structure (Lesson 17), so the method no longer applies.
3. 0.40 differs by 0.09, more than two error bars (0.08): **borderline, worth checking**. 0.30 differs by 0.01: **consistent**.
4. N ≈ 1/0.005² = **40,000** shots.
5. 0.995⁴⁰ × 0.98⁸ ≈ 0.82 × 0.85 ≈ **0.70**.
6. Not necessarily: it means the two **histograms** match. A device could get the right counts with wrong phases, which only show up in other measurements (Lesson 8's tomography).

## Cheat sheet

| Idea | Formula or fact |
|---|---|
| Statevector memory | 16 × 2ⁿ bytes; ~30 qubits on a laptop |
| Density matrix | 4ⁿ numbers; needed for exact noise |
| Stabilizer | Clifford circuits, thousands of qubits |
| MPS | Low-entanglement circuits, hundreds of qubits |
| Aer | `AerSimulator(method="statevector" / "density_matrix" / "stabilizer" / "matrix_product_state")` |
| ⟨Z⟩ from counts | 2·P(0) − 1 |
| Standard error of ⟨Z⟩ | 2·√(P(0)(1 − P(0))/N) |
| Consistent? | Within about two standard errors |
| Shots for precision ε | N ≈ 1/ε² |
| TVD | ½ Σ \|pᵢ − qᵢ\|: 0 same, 1 disjoint |
| Hellinger fidelity | (Σ √(pᵢqᵢ))²: 1 same, 0 disjoint |
| Noise model | Depolarizing errors on gates + readout errors |
| Rule of thumb | Success ≈ (gate fidelity)^(number of gates) × (readout fidelity)^(qubits) |
| Seeds | Fix for reproducible simulations; hardware has none |
| Workflow | Exact → shots → noisy simulation → hardware |
