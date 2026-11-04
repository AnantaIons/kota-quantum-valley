---
layout: ../../layouts/Post.astro
title: "Noise and decoherence in circuits"
description: "Why real qubits make mistakes, and how to describe those mistakes exactly: decoherence as entanglement with the environment, density matrices, noise channels on the Bloch sphere, T1 and T2, gate and readout errors, how errors pile up in a circuit, coherent versus random errors, and a full noise model in Qiskit Aer."
date: 2026-11-04
category: lesson
lesson: 32
---

Until now, every circuit in this course has run on perfect qubits. Gates did exactly what their matrices said, states stayed put while you waited, and measurement read exactly what was there. Real hardware is not like that. Every gate is a little bit wrong, every qubit slowly forgets its state, and every measurement sometimes misreads.

This lesson is about those imperfections. You'll learn where they come from, how physicists describe them precisely, how big they are on today's machines, and how quickly they ruin a computation. That sets up the rest of Part F: error-correcting codes (Lessons 33 to 35) and error mitigation (Lesson 36), the two ways the field fights back.

## Why qubits are fragile

A classical bit is stored in something big and robust: billions of electrons on a capacitor, or a magnetic domain on a disk. A small disturbance doesn't change a 0 into a 1.

A qubit is stored in a single quantum system: one ion, one atom, one tiny superconducting circuit. And its useful information lives partly in the **relative phase** between |0⟩ and |1⟩ (Lesson 10). Anything in the environment that interacts with the qubit, a stray photon, a vibrating atom in the chip, a fluctuating magnetic field, can pick up a trace of information about the qubit's state.

Here's the key insight: **when the environment learns about a qubit, the qubit loses its superposition.** It's as if the environment had partly measured it. This process is called **decoherence**.

You can see this directly in a small simulation. Take a qubit in |+⟩ and let a second qubit, standing in for "the environment", interact with it through a controlled rotation. The stronger the interaction θ, the more the environment's state depends on our qubit:

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, partial_trace

print("interaction θ   coherence |ρ₀₁|   purity of the qubit")
for theta in [0, np.pi / 4, np.pi / 2, 3 * np.pi / 4, np.pi]:
    qc = QuantumCircuit(2)          # qubit 0 = our qubit, qubit 1 = "the environment"
    qc.h(0)                         # our qubit starts in |+⟩: coherence 0.5
    qc.cry(theta, 0, 1)             # the environment picks up a little information about it
    rho = partial_trace(Statevector(qc), [1])      # look at our qubit alone
    print(f"   {theta:.2f}            {abs(rho.data[0, 1]):.3f}            {rho.purity().real:.3f}")
```

```text
interaction θ   coherence |ρ₀₁|   purity of the qubit
   0.00            0.500            1.000
   0.79            0.462            0.927
   1.57            0.354            0.750
   2.36            0.191            0.573
   3.14            0.000            0.500
```

Nothing was done to qubit 0 after the Hadamard. Yet as the environment becomes more entangled with it, the **coherence** (the off-diagonal number you'll meet in a moment) shrinks, and at θ = π it's gone completely. Our qubit now behaves like a coin that is either 0 or 1, with no phase left to interfere. That's decoherence: not a force that pushes the qubit, but information leaking out to places we can't control.

## Density matrices: describing a qubit you're not sure about

The printout above used two words, coherence and purity, that come from **density matrices**. A state vector |ψ⟩ can only describe a qubit you know perfectly. Once noise is involved, you're uncertain about the state itself, and you need a bigger description.

The density matrix of a known (**pure**) state is ρ = |ψ⟩⟨ψ|. For |ψ⟩ = α|0⟩ + β|1⟩:

> ρ = [[ |α|², αβ* ], [ α*β, |β|² ]]

- The **diagonal** entries are the probabilities of measuring 0 and 1.
- The **off-diagonal** entries, the **coherences**, record the relative phase. They are what make interference possible.

If instead the qubit is in state |ψ₁⟩ with probability p₁ and |ψ₂⟩ with probability p₂ (a **mixed** state), you average: ρ = p₁|ψ₁⟩⟨ψ₁| + p₂|ψ₂⟩⟨ψ₂|.

The classic comparison:

| State | Density matrix | Measure in Z | Measure in X |
|---|---|---|---|
| \|+⟩ = (\|0⟩ + \|1⟩)/√2 | [[½, ½], [½, ½]] | 50/50 | always + |
| A coin: \|0⟩ or \|1⟩, 50/50 | [[½, 0], [0, ½]] | 50/50 | 50/50 |

Both give 50/50 in the Z basis, so you can't tell them apart that way. But |+⟩ has coherences, so it shows interference (always + in the X basis), and the coin doesn't. Decoherence is exactly the process that turns the first matrix into the second.

Two handy facts:

- **Purity** Tr(ρ²) is 1 for a pure state and ½ for a completely mixed qubit.
- Every single-qubit ρ can be written ρ = (I + xX + yY + zZ)/2. The numbers (x, y, z) are the **Bloch vector** (Lesson 7). Pure states sit **on** the Bloch sphere (length 1); mixed states sit **inside** it. The centre, length 0, is the completely random qubit.

So noise has a beautiful picture: **it pulls the Bloch vector inwards**, away from the surface.

## Noise channels

How do you describe a noise process mathematically? Unitary gates aren't enough, because a unitary maps pure states to pure states. Noise is described by a **quantum channel**, written using **Kraus operators** K₁, K₂, …:

> ρ → K₁ρK₁† + K₂ρK₂† + …,  with K₁†K₁ + K₂†K₂ + … = I

You can read each term as "with some probability, this happened". The condition at the end makes sure probabilities still add to 1. Four channels cover most of what you'll meet:

| Channel | What happens (probability p) | Kraus operators | On the Bloch sphere |
|---|---|---|---|
| **Bit flip** | X is applied | √(1−p) I, √p X | y and z shrink by (1−2p) |
| **Phase flip** | Z is applied | √(1−p) I, √p Z | x and y shrink by (1−2p) |
| **Depolarising** | The qubit is replaced by a completely random one | √(1−3p/4) I, √(p/4) X, √(p/4) Y, √(p/4) Z | Everything shrinks by (1−p) |
| **Amplitude damping** | \|1⟩ decays to \|0⟩ (energy loss) | [[1, 0], [0, √(1−p)]], [[0, √p], [0, 0]] | Squashed and pulled towards \|0⟩ |

Let's apply each to the same starting state and watch the Bloch vector:

```python
import numpy as np
from qiskit.quantum_info import DensityMatrix, Kraus, Pauli

def bloch(rho):
    return [float(np.real(rho.expectation_value(Pauli(p)))) + 0.0 for p in "XYZ"]

I = np.eye(2); X = np.array([[0, 1], [1, 0]]); Y = np.array([[0, -1j], [1j, 0]]); Z = np.diag([1, -1])
p = 0.2
channels = {
    "bit flip":          Kraus([np.sqrt(1 - p) * I, np.sqrt(p) * X]),
    "phase flip":        Kraus([np.sqrt(1 - p) * I, np.sqrt(p) * Z]),
    "depolarising":      Kraus([np.sqrt(1 - 3 * p / 4) * I] + [np.sqrt(p / 4) * P for P in (X, Y, Z)]),
    "amplitude damping": Kraus([np.array([[1, 0], [0, np.sqrt(1 - p)]]), np.array([[0, np.sqrt(p)], [0, 0]])]),
}

rho = DensityMatrix(np.array([np.sqrt(0.1), np.sqrt(0.9)]))      # Bloch vector (0.6, 0, -0.8)
x, y, z = bloch(rho)
print(f"{'start':18s} Bloch = ({x:+.2f}, {y:+.2f}, {z:+.2f})   length {np.linalg.norm([x, y, z]):.2f}   purity {rho.purity().real:.2f}")
for name, ch in channels.items():
    out = rho.evolve(ch)
    x, y, z = bloch(out)
    print(f"{name:18s} Bloch = ({x:+.2f}, {y:+.2f}, {z:+.2f})   length {np.linalg.norm([x, y, z]):.2f}   purity {out.purity().real:.2f}")
```

```text
start              Bloch = (+0.60, +0.00, -0.80)   length 1.00   purity 1.00
bit flip           Bloch = (+0.60, +0.00, -0.48)   length 0.77   purity 0.80
phase flip         Bloch = (+0.36, +0.00, -0.80)   length 0.88   purity 0.88
depolarising       Bloch = (+0.48, +0.00, -0.64)   length 0.80   purity 0.82
amplitude damping  Bloch = (+0.54, +0.00, -0.44)   length 0.69   purity 0.74
```

Check each line against the table:

- **Bit flip** left x alone (an X flip doesn't change the X component) but shrank z by 1 − 2(0.2) = 0.6: −0.8 became −0.48.
- **Phase flip** did the opposite: z untouched, x shrank from 0.60 to 0.36.
- **Depolarising** shrank everything by 0.8, towards the centre.
- **Amplitude damping** moved z **upwards**, from −0.80 to −0.44, because energy loss pushes the qubit towards |0⟩ (z = +1). It's the only channel here with a preferred direction.

In every case the length dropped below 1: the state became mixed. The three symmetric channels can only ever shrink the Bloch vector. Amplitude damping is the exception: applied long enough, it drags **every** state to |0⟩, even a completely mixed one. That's actually useful, because it's the simplest way to reset a qubit: wait.

## T1 and T2: the two clocks of a qubit

Hardware teams summarise a qubit's memory with two times.

- **T1, energy relaxation.** A qubit in |1⟩ has more energy than |0⟩ and eventually drops down, giving the energy to its surroundings. The probability of still being in |1⟩ after time t is e^(−t/T1). This is amplitude damping.
- **T2, dephasing.** Even if no energy is lost, the relative phase between |0⟩ and |1⟩ wanders randomly, because the qubit's frequency jitters with the environment. The coherence decays like e^(−t/T2). This is phase-flip noise, plus a share of the T1 process.

Physics guarantees **T2 ≤ 2·T1**: anything that loses energy also loses phase. In practice T2 is often below T1.

Qiskit Aer can build the exact channel for a qubit that sits idle for time t:

```python
import numpy as np
from qiskit.quantum_info import DensityMatrix, Pauli
from qiskit_aer.noise import thermal_relaxation_error

T1, T2 = 100e-6, 80e-6                        # seconds: typical for a good superconducting qubit
one  = DensityMatrix.from_label("1")          # tests T1: does |1⟩ stay excited?
plus = DensityMatrix.from_label("+")          # tests T2: does the relative phase survive?

print("  time    P(1) from |1⟩   ⟨X⟩ from |+⟩")
for t_us in [0, 25, 50, 100, 200, 400]:
    channel = thermal_relaxation_error(T1, T2, t_us * 1e-6).to_quantumchannel()
    p1 = one.evolve(channel).probabilities()[1]
    x = plus.evolve(channel).expectation_value(Pauli("X")).real
    print(f"{t_us:4d} µs      {p1:.3f}          {x:.3f}")
print(f"\ne^(-t/T1) at 100 µs = {np.exp(-1):.3f};  e^(-t/T2) at 100 µs = {np.exp(-100 / 80):.3f}")
```

```text
time    P(1) from |1⟩   ⟨X⟩ from |+⟩
   0 µs      1.000          1.000
  25 µs      0.779          0.732
  50 µs      0.607          0.535
 100 µs      0.368          0.287
 200 µs      0.135          0.082
 400 µs      0.018          0.007

e^(-t/T1) at 100 µs = 0.368;  e^(-t/T2) at 100 µs = 0.287
```

After one T1 (100 µs), only 37% of the excited population is left. After one T2, the phase information has dropped to 29% of its starting value. Within a few hundred microseconds, the qubit has forgotten everything.

That sounds hopeless until you compare it with gate times. A superconducting two-qubit gate takes roughly 50 to 500 nanoseconds, so a qubit with T2 = 80 µs can fit hundreds to a thousand gates in one coherence time. What matters is the **ratio** of coherence time to gate time, not either number alone. Trapped ions have much longer coherence (seconds) but also much slower gates (tens to hundreds of microseconds), so the ratio ends up in a similar range.

There's one more subtlety worth knowing. Part of dephasing comes from slow drifts: the qubit's frequency is slightly different from one run to the next. That part can be **undone**. If you apply an X halfway through the waiting time, the phase gained in the first half is reversed in the second half, like runners turned around at the halfway mark who all arrive back at the start together. This is the **spin echo**, and the coherence time measured with it (often written T2,echo) is longer than the plain one (often written T2*). Lesson 36 builds on this idea, called dynamical decoupling.

## Gate errors and readout errors

Idle decay isn't the only problem. Every gate is also slightly imperfect: the control pulse might be a little too strong, a little too long, or arrive slightly off frequency. Hardware teams measure an **error per gate** using a technique called **randomised benchmarking**: run long random sequences of gates that should multiply to the identity, and see how quickly the success rate falls with sequence length.

Measurement is imperfect too. A qubit in |1⟩ might be read as 0, often because it decayed during the measurement itself (measurement takes hundreds of nanoseconds on superconducting qubits). These errors are summarised by a **confusion matrix**: the probability of reading each outcome given each true state.

Rough numbers for leading machines in 2025 and 2026 look like this (they improve every year, so treat these as orders of magnitude and check the provider's current calibration data):

| Platform | Coherence | Two-qubit gate time | Two-qubit gate error | Readout error |
|---|---|---|---|---|
| Superconducting circuits | T1 ≈ 50 to 300 µs | ≈ 50 to 500 ns | ≈ 0.2% to 1% | ≈ 0.5% to 2% |
| Trapped ions | T2 ≈ seconds | ≈ 0.1 to 1 ms | ≈ 0.1% to 0.5% | ≈ 0.1% to 0.5% |
| Neutral atoms | T2 ≈ 1 second | ≈ 0.2 to 1 µs | ≈ 0.5% to 1% | ≈ 0.5% to 3% |

The common thread: **the best two-qubit gates fail about once in every few hundred to a thousand uses.** Single-qubit gates are typically ten times better. Lessons 37 to 39 explain where these numbers come from physically.

## How errors pile up

One error in a thousand sounds small. The trouble is that circuits have many gates, and the chance that **none** of them fails shrinks exponentially. If each gate fails with probability ε and the circuit has G gates, the chance of a clean run is about (1 − ε)^G ≈ e^(−εG):

```python
print("chance a whole circuit runs with no error, (1 - ε)^G")
print("   gates G      ε = 1%       ε = 0.1%     ε = 0.01%")
for G in [100, 1_000, 10_000, 1_000_000]:
    row = [(1 - e) ** G for e in [1e-2, 1e-3, 1e-4]]
    print(f"{G:10,d}   " + "   ".join(f"{r:10.1e}" if r > 1e-300 else "    ≈ 0   " for r in row))
```

```text
chance a whole circuit runs with no error, (1 - ε)^G
   gates G      ε = 1%       ε = 0.1%     ε = 0.01%
       100      3.7e-01      9.0e-01      9.9e-01
     1,000      4.3e-05      3.7e-01      9.0e-01
    10,000      2.2e-44      4.5e-05      3.7e-01
 1,000,000       ≈ 0          ≈ 0         3.7e-44
```

The rule of thumb: **with error rate ε, you can run about 1/ε gates** before the result is mostly noise. At ε = 0.1% that's about a thousand gates. Shor's algorithm for a 2048-bit number needs billions (Lesson 28). No foreseeable improvement in raw hardware closes a gap that large, which is why error correction (Lesson 33 onwards) is not optional.

Let's watch this happen in a real simulation. A GHZ state (|00…0⟩ + |11…1⟩)/√2 on n qubits needs n − 1 CNOTs. Give each CNOT a 1% depolarising error and each Hadamard 0.1%, then compare the noisy result with the perfect state using the **fidelity** (1 means identical):

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, state_fidelity
from qiskit_aer import AerSimulator
from qiskit_aer.noise import NoiseModel, depolarizing_error

noise = NoiseModel()
noise.add_all_qubit_quantum_error(depolarizing_error(0.001, 1), ["h"])     # 0.1% per 1-qubit gate
noise.add_all_qubit_quantum_error(depolarizing_error(0.01, 2), ["cx"])     # 1% per 2-qubit gate
sim = AerSimulator(method="density_matrix", noise_model=noise)

def ghz(n):
    qc = QuantumCircuit(n)
    qc.h(0)
    for q in range(n - 1):
        qc.cx(q, q + 1)
    return qc

print(" n   CNOTs   fidelity   rough guess (0.99)^CNOTs")
for n in [2, 4, 6, 8, 10]:
    ideal = Statevector(ghz(n))
    qc = ghz(n)
    qc.save_density_matrix()
    rho = sim.run(qc).result().data()["density_matrix"]
    print(f"{n:2d}   {n - 1:4d}    {state_fidelity(rho, ideal):.4f}     {0.99 ** (n - 1):.4f}")
```

```text
n   CNOTs   fidelity   rough guess (0.99)^CNOTs
 2      1    0.9920     0.9900
 4      3    0.9747     0.9703
 6      5    0.9578     0.9510
 8      7    0.9411     0.9321
10      9    0.9248     0.9135
```

The fidelity falls steadily with every CNOT, closely tracking the simple (1 − ε)^G estimate. (It does slightly better than the guess because a depolarising error sometimes replaces the state with something that happens to overlap the right answer.) Using `method="density_matrix"` makes Aer track the full ρ, which is exact but costs 4ⁿ numbers, so it's only practical for about a dozen qubits.

## Coherent errors versus random errors

Not all errors add up the same way. Compare two kinds of slightly faulty gate, each wrong by a tiny angle ε = 0.01 radians:

- **Coherent error:** every gate over-rotates by +ε, the same way each time (a miscalibrated pulse). The angles **add**: after N gates you're off by Nε.
- **Random (incoherent) error:** each gate is off by +ε or −ε at random. The angles do a **random walk**: after N gates you're typically off by only about √N·ε.

The error probability goes like the square of the angle, so the difference is dramatic:

```python
import numpy as np

eps = 0.01                       # each gate over-rotates by 0.01 radians
print("  gates N   coherent (same direction)   random direction")
for N in [1, 10, 100, 1000]:
    coherent = np.sin(N * eps / 2) ** 2              # angles add: N·ε
    random = (1 - np.cos(eps) ** N) / 2              # angles random-walk: ~√N·ε
    print(f"{N:8d}        {coherent:.2e}                {random:.2e}")
```

```text
gates N   coherent (same direction)   random direction
       1        2.50e-05                2.50e-05
      10        2.50e-03                2.50e-04
     100        2.30e-01                2.49e-03
    1000        9.20e-01                2.44e-02
```

After one gate the two are identical. After 100 gates, the coherent error has grown to 23%, while the random one is only 0.25%. Coherent errors grow like **N²**; random errors like **N**.

This has two big consequences. First, a single "error per gate" number can badly underestimate how a long circuit fails if the errors are coherent. Second, it suggests a trick: deliberately **randomise** errors so they can't add up coherently. That trick, called **Pauli twirling** or randomised compiling, is used in error mitigation (Lesson 36), and error-correcting codes also turn coherent errors into random ones when they measure (Lesson 33).

## Other troublemakers

Real devices have a few more failure modes that the simple models above leave out:

- **Leakage:** a superconducting qubit is really a ladder of energy levels. A sloppy pulse can push it into |2⟩, outside the qubit space, where ordinary gates and codes don't know what to do with it.
- **Crosstalk:** driving one qubit slightly disturbs its neighbours, so errors are not independent.
- **Drift:** calibrations go stale over hours as the environment changes, which is why machines are recalibrated regularly.
- **Correlated bursts:** a cosmic ray or a burst of natural radioactivity can deposit energy in a chip and cause errors on many qubits at once. Error-correcting codes assume errors are mostly independent, so these are especially dangerous, and chip designers now add features to absorb such bursts.

## A complete noise model in Qiskit

Aer lets you combine gate errors and readout errors into one `NoiseModel` and then run circuits exactly as you would on hardware. Here's a Bell state with depolarising gate noise and an asymmetric readout error:

```python
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator
from qiskit_aer.noise import NoiseModel, depolarizing_error, ReadoutError

bell = QuantumCircuit(2)
bell.h(0)
bell.cx(0, 1)
bell.measure_all()

noise = NoiseModel()
noise.add_all_qubit_quantum_error(depolarizing_error(0.001, 1), ["h"])
noise.add_all_qubit_quantum_error(depolarizing_error(0.02, 2), ["cx"])
# Readout: a true 0 is read as 1 with 2% chance; a true 1 is read as 0 with 5% chance
noise.add_all_qubit_readout_error(ReadoutError([[0.98, 0.02], [0.05, 0.95]]))

for name, sim in [("ideal", AerSimulator(seed_simulator=7)), ("noisy", AerSimulator(noise_model=noise, seed_simulator=7))]:
    counts = sim.run(bell, shots=10_000).result().get_counts()
    print(f"{name}: {dict(sorted(counts.items()))}")
```

```text
ideal: {'00': 4980, '11': 5020}
noisy: {'00': 4787, '01': 382, '10': 363, '11': 4468}
```

The ideal run only ever shows 00 and 11. The noisy run shows about 7.5% of results in 01 and 10, which a perfect Bell state never produces. And notice that 11 now appears less often than 00, even though they should be equal: that's the asymmetric readout, because a 1 is more likely to be misread (it can decay during measurement) than a 0.

When you're ready to model a real device, Qiskit can build a noise model from a backend's published calibration data, with T1, T2, gate errors and readout errors for every qubit. Lesson 40 does exactly that.

## Fighting back

There are three ways to deal with noise, and the next four lessons cover them:

1. **Better hardware.** Longer coherence, cleaner gates, better readout. This has improved steadily, roughly ten times every several years, but it can't get to one error in a billion on its own.
2. **Error correction (Lessons 33 to 35).** Spread one logical qubit over many physical ones, detect errors without looking at the data, and fix them. If physical errors are below a **threshold**, adding more qubits makes the logical qubit exponentially better.
3. **Error mitigation (Lesson 36).** For today's machines without full error correction: run extra, cleverly modified circuits and use classical post-processing to estimate what the noiseless answer would have been.

## Try it

1. A qubit's state has Bloch vector (0, 0, 0). What is its density matrix, and what is its purity?
2. A qubit starts exactly in |0⟩. Which of the four channels change its state, and which leave it alone?
3. A qubit has T1 = 200 µs. What's the chance it's still in |1⟩ after 50 µs?
4. Can a qubit have T1 = 50 µs and T2 = 150 µs? Explain.
5. A circuit has 2,000 two-qubit gates with error 0.2% each. Estimate the chance of an error-free run.
6. A gate over-rotates by the same small angle every time. If 10 gates give a 1% error, roughly what error do 30 gates give?
7. In the noisy Bell state run, why did 11 appear less often than 00?

**Answers:**

1. ρ = (I + 0)/2 = [[½, 0], [0, ½]], the completely mixed state. Purity Tr(ρ²) = ¼ + ¼ = **½**, the minimum for a qubit.
2. **Bit flip** (z drops from 1 to 1 − 2p) and **depolarising** (z drops to 1 − p) change it. **Phase flip** leaves it alone, because Z|0⟩ = |0⟩. **Amplitude damping** leaves it alone too, because |0⟩ is already the lowest-energy state and has nothing to lose.
3. e^(−50/200) = e^(−0.25) ≈ **0.78**, a 78% chance.
4. **No.** T2 can never exceed 2·T1 = 100 µs, because losing energy always destroys the phase too.
5. (1 − 0.002)^2000 ≈ e^(−4) ≈ **0.018**, under 2%.
6. A coherent error's probability grows like N², so tripling N multiplies it by about 9: roughly **9%**.
7. Readout misreads a true 1 as 0 with 5% chance, but a true 0 as 1 with only 2% chance. So 11 loses more counts than 00 does.

## Cheat sheet

| Idea | Formula or fact |
|---|---|
| Decoherence | The environment becomes entangled with the qubit and carries away information, destroying superposition |
| Density matrix | ρ = Σ pᵢ \|ψᵢ⟩⟨ψᵢ\|; diagonal = probabilities, off-diagonal = coherences |
| Bloch form | ρ = (I + xX + yY + zZ)/2; pure on the sphere, mixed inside |
| Purity | Tr(ρ²): 1 pure, ½ fully mixed (one qubit) |
| Channel | ρ → Σ K ρ K†, with Σ K†K = I |
| Bit flip / phase flip | X or Z with probability p; shrink two Bloch components by (1−2p) |
| Depolarising | Replace with random qubit with probability p; shrink all by (1−p) |
| Amplitude damping | Energy loss, pulls towards \|0⟩ |
| T1 | P(still in \|1⟩) = e^(−t/T1) |
| T2 | Coherence ∝ e^(−t/T2); T2 ≤ 2·T1 |
| Spin echo | An X halfway through cancels slow phase drifts |
| Error budget | About 1/ε gates at error rate ε; clean-run chance ≈ e^(−εG) |
| Coherent vs random | Coherent errors grow like N², random like N |
| Qiskit | `Kraus`, `DensityMatrix.evolve`, `thermal_relaxation_error`, `depolarizing_error`, `ReadoutError`, `NoiseModel` |
