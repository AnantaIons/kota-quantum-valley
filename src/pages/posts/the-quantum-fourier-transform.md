---
layout: ../../layouts/Post.astro
title: "The quantum Fourier transform"
description: "The discrete Fourier transform and what it finds, the same transform applied to amplitudes, the product formula that makes it cheap, the circuit built from Hadamards and controlled phases (checked against Qiskit), how it turns a periodic state into sharp peaks, the approximate QFT, and why it isn't a faster FFT."
date: 2026-11-04
category: lesson
lesson: 26

---

Simon's algorithm (Lesson 23) found a hidden pattern using Hadamards. For patterns made with ordinary addition, like the repeating values of 7ˣ mod 15 in Shor's algorithm, Hadamards aren't enough. You need the **quantum Fourier transform (QFT)**: the quantum version of one of the most useful tools in all of science and engineering.

This lesson explains what the Fourier transform does, defines the QFT, shows why it needs only about n² gates on n qubits, builds the circuit and checks it against Qiskit, and then shows the property that makes it the engine of Shor's algorithm and phase estimation: **it turns periodicity into sharp, readable peaks.**

## The Fourier transform: which rhythms make up a signal?

A Fourier transform takes a list of numbers (a signal) and asks: **which repeating patterns (frequencies) is it made of?** A sound wave made of a 440 Hz note and a 660 Hz note shows two strong peaks after a Fourier transform. Your phone does this constantly: for audio compression, Wi-Fi and 4G/5G signals, image compression (JPEG), and more.

For a list of N numbers x₀, x₁, …, x_{N−1}, the **discrete Fourier transform (DFT)** produces N new numbers:

> yₖ = (1/√N) Σⱼ xⱼ · ωʲᵏ,  where ω = e^(2πi/N)

ω is the N-th root of unity from Lesson 2: one step of 360°/N around the circle. Each output yₖ asks "how much of the input repeats k times around the circle?" by rotating each xⱼ by k steps per index and adding. If the input has that rhythm, the rotated terms line up and add; if not, they spread around the circle and cancel (Lesson 2's roots of unity again).

As a matrix, for N = 4 (where ω = i):

```python
import numpy as np
N = 4
w = np.exp(2j * np.pi / N)
F = np.array([[w ** (j * k) for k in range(N)] for j in range(N)]) / np.sqrt(N)
print(np.round(F * 2, 3) + 0)                          # times 2 to show the pattern of 1, i, -1, -i
print("unitary:", np.allclose(F.conj().T @ F, np.eye(N)))
```

```text
[[ 1.+0.j  1.+0.j  1.+0.j  1.+0.j]
 [ 1.+0.j  0.+1.j -1.+0.j  0.-1.j]
 [ 1.+0.j -1.+0.j  1.+0.j -1.+0.j]
 [ 1.+0.j  0.-1.j -1.+0.j  0.+1.j]]
unitary: True
```

Row k steps around the circle k quarter-turns at a time. And the matrix is **unitary** (Lesson 4), so it can be a quantum gate.

Done naively, a DFT on N numbers takes about N² operations. The **fast Fourier transform (FFT)**, popularised by Cooley and Tukey in 1965, does it in about N·log₂N, and it's one of the most important algorithms ever written.

## The quantum Fourier transform

The QFT is the **same matrix**, applied to the **amplitudes** of n qubits, with N = 2ⁿ:

> **QFT |j⟩ = (1/√N) Σₖ ω^(jk) |k⟩**

So a general state Σⱼ xⱼ|j⟩ becomes Σₖ yₖ|k⟩: the amplitudes are Fourier-transformed. For one qubit (N = 2, ω = −1), the matrix is (1/√2)[[1, 1], [1, −1]]: **the QFT on one qubit is just H**. The QFT generalises the Hadamard from "XOR patterns" to "addition patterns".

### The product formula: why it's cheap

Here's the remarkable fact that makes the QFT efficient. Write j in binary as j₁j₂…jₙ, and use the **binary fraction** notation 0.j₁j₂…jₘ = j₁/2 + j₂/4 + … + jₘ/2ᵐ. Then the QFT of a basis state is a **product state**:

> QFT|j⟩ = (1/√2ⁿ) (|0⟩ + e^(2πi·0.jₙ)|1⟩) ⊗ (|0⟩ + e^(2πi·0.jₙ₋₁jₙ)|1⟩) ⊗ … ⊗ (|0⟩ + e^(2πi·0.j₁j₂…jₙ)|1⟩)

Each output qubit is an equal superposition of |0⟩ and |1⟩ with a phase that depends on the **last few bits** of j. (The idea of the proof: e^(2πi·jk/2ⁿ) splits into a product over the bits of k, and integer parts of each exponent drop out because e^(2πi·integer) = 1.)

This tells you how to build it:

- The output qubit with phase e^(2πi·0.jₙ) only needs the last bit: that's an H on it.
- The next one needs e^(2πi·0.jₙ₋₁jₙ): an H, then a phase rotation by 2π/4 **controlled** on the next bit.
- And so on: each qubit gets one H and then a controlled rotation by 2π/2ᵏ from each less-significant qubit.

That's n Hadamards and n(n − 1)/2 controlled phase gates: about **n²/2 gates** in total, plus some swaps at the end because the formula produces the qubits in reversed order.

### Building the circuit

Here's the textbook construction, checked against Qiskit's built-in `QFTGate`:

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.circuit.library import QFTGate
from qiskit.quantum_info import Operator

def qft(n):
    """The textbook QFT circuit: H and controlled phase rotations, then swaps to fix the order."""
    qc = QuantumCircuit(n)
    for j in reversed(range(n)):                 # start from the most significant qubit
        qc.h(j)
        for k in reversed(range(j)):
            qc.cp(np.pi / 2 ** (j - k), k, j)    # rotation by 2*pi / 2^(j-k+1)
    for i in range(n // 2):
        qc.swap(i, n - 1 - i)
    return qc

mine = qft(4)
print(mine.draw("text", fold=-1))
print("matches Qiskit's QFTGate:", Operator(mine).equiv(Operator(QFTGate(4))))
print("gates:", dict(mine.count_ops()))
```

```text
                                                                          ┌───┐   
q_0: ─────────────────────────────■─────────────────■─────────────■───────┤ H ├─X─
                                  │                 │       ┌───┐ │P(π/2) └───┘ │ 
q_1: ───────────────■─────────────┼────────■────────┼───────┤ H ├─■─────────X───┼─
                    │       ┌───┐ │        │P(π/2)  │P(π/4) └───┘           │   │ 
q_2: ──────■────────┼───────┤ H ├─┼────────■────────■───────────────────────X───┼─
     ┌───┐ │P(π/2)  │P(π/4) └───┘ │P(π/8)                                       │ 
q_3: ┤ H ├─■────────■─────────────■─────────────────────────────────────────────X─
     └───┘                                                                        
matches Qiskit's QFTGate: True
gates: {'cp': 6, 'h': 4, 'swap': 2}
```

Read the drawing: qubit 3 (the most significant) gets an H, then controlled phases of π/2, π/4 and π/8 from qubits 2, 1 and 0. Then qubit 2 gets an H and two controlled phases, and so on. The swaps at the end reverse the order. Four qubits need 4 + 6 = 10 gates (plus 2 swaps).

### The exponential gap, and the catch

| Transform | Input | Cost |
|---|---|---|
| Classical FFT | N = 2ⁿ numbers | ~N·log₂N = n·2ⁿ steps |
| Quantum QFT | n qubits holding 2ⁿ amplitudes | ~n²/2 gates |

For n = 50 qubits, the QFT needs about 1,250 gates. An FFT on 2⁵⁰ numbers needs about 5 × 10¹⁶ steps. That looks like an exponential speed-up for Fourier transforms.

**It isn't, in general.** Two problems, both familiar from Lesson 12:

- **Loading:** to Fourier-transform your own 2⁵⁰ numbers, you'd first have to put them into amplitudes, which takes about 2⁵⁰ operations.
- **Reading:** the 2⁵⁰ output amplitudes can't be read out. One measurement gives one k, with probability |yₖ|².

So the QFT is not a faster FFT for your audio files. It's useful only **inside** algorithms where the input state is created by the computation itself and you need just one sample from the output. Exactly that happens in period finding.

## What the QFT is good for: finding periods

Suppose a computation has produced a **periodic** state: an equal superposition of every r-th basis state, starting from some offset x₀:

> |ψ⟩ ∝ |x₀⟩ + |x₀ + r⟩ + |x₀ + 2r⟩ + …

This is exactly what happens in Shor's algorithm (Lesson 28), where measuring the output of f(x) = aˣ mod N leaves the input register in such a state, with a **random** offset you can't control.

Apply the QFT. The amplitude of output k is a sum of ω^(k·(x₀ + mr)) over m. The offset gives a common factor ω^(k·x₀), which is just a phase. The rest is a sum of steps of ω^(kr) around the circle: they **line up and add** when kr is a multiple of N, and **cancel** otherwise. So:

> **After the QFT, the only likely outcomes are k ≈ multiples of N/r, whatever the offset.**

```python
import numpy as np
from qiskit.circuit.library import QFTGate
from qiskit.quantum_info import Statevector

n, N = 4, 16
for r, offset in [(4, 1), (4, 3), (5, 2)]:
    amps = np.zeros(N)
    amps[offset::r] = 1                            # |offset> + |offset + r> + |offset + 2r> + ...
    state = Statevector(amps / np.linalg.norm(amps)).evolve(QFTGate(n))
    p = state.probabilities()
    peaks = {k: round(float(p[k]), 3) for k in range(N) if p[k] > 0.05}
    print(f"period {r}, offset {offset}: peaks at {peaks}   (N/r = {N / r:.1f})")
```

```text
period 4, offset 1: peaks at {0: 0.25, 4: 0.25, 8: 0.25, 12: 0.25}   (N/r = 4.0)
period 4, offset 3: peaks at {0: 0.25, 4: 0.25, 8: 0.25, 12: 0.25}   (N/r = 4.0)
period 5, offset 2: peaks at {0: 0.188, 3: 0.169, 6: 0.121, 7: 0.065, 9: 0.065, 10: 0.121, 13: 0.169}   (N/r = 3.2)
```

Three things to notice:

1. With period 4 (which divides 16), the output is exactly 0, 4, 8 or 12: the multiples of N/r = 4. Measure once, and k/N is a multiple of 1/r.
2. **The offset doesn't matter.** Offsets 1 and 3 give identical probabilities. The QFT has thrown away the random part and kept only the period, just like the Hadamards did in Simon's algorithm.
3. With period 5 (which doesn't divide 16), the peaks are fuzzy but cluster around the multiples of 3.2: 0, 3, 6–7, 9–10, 13. Shor's algorithm handles this with more qubits (sharper peaks) and a classical step called **continued fractions** that turns k/N into the nearest simple fraction with denominator r (Lesson 28).

## Running it backwards: reading phases

The QFT turns |j⟩ into a product of qubits whose phases encode j. Run it **backwards** (the inverse QFT, QFT†) and a register whose qubits have phases e^(2πi·φ), e^(2πi·2φ), e^(2πi·4φ), … becomes the binary digits of φ. That's the last step of **quantum phase estimation** (Lesson 27): it turns a phase, which can't be measured directly, into bits you can read. Shor's algorithm, quantum chemistry and many other algorithms use the QFT this way, as a phase-to-number converter.

## The approximate QFT

Look at the rotation angles: π/2, π/4, π/8, …, π/2ⁿ⁻¹. For large n, most of them are **tiny**. A rotation by π/1024 barely changes anything, and on real hardware it would add more error than it removes. In 1994, Don Coppersmith showed you can simply **drop** the rotations between qubits that are far apart and keep high accuracy. Here's a 10-qubit QFT with only the rotations between nearby qubits kept:

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Operator, average_gate_fidelity

def qft(n, max_gap=None):
    """QFT circuit; with max_gap, skip the tiny rotations between qubits more than max_gap apart."""
    qc = QuantumCircuit(n)
    for j in reversed(range(n)):
        qc.h(j)
        for k in reversed(range(j)):
            if max_gap is None or j - k <= max_gap:
                qc.cp(np.pi / 2 ** (j - k), k, j)
    for i in range(n // 2):
        qc.swap(i, n - 1 - i)
    return qc

n = 10
exact = Operator(qft(n))
for gap in [1, 2, 3, 4, None]:
    approx = qft(n, gap)
    f = average_gate_fidelity(Operator(approx), exact)
    print(f"keep rotations up to gap {str(gap):4s}: {approx.count_ops()['cp']:2d} controlled phases, fidelity {f:.4f}")
```

```text
keep rotations up to gap 1   :  9 controlled phases, fidelity 0.1100
keep rotations up to gap 2   : 17 controlled phases, fidelity 0.6114
keep rotations up to gap 3   : 24 controlled phases, fidelity 0.9030
keep rotations up to gap 4   : 30 controlled phases, fidelity 0.9801
keep rotations up to gap None: 45 controlled phases, fidelity 1.0000
```

Keeping rotations up to a gap of 4 (angles down to π/16) uses 30 of the 45 controlled phases and still matches the exact QFT with 98% fidelity. In general, keeping rotations down to an angle of about 1/n is enough, which cuts the gate count to about **n·log n**. For Shor's algorithm on 2,048-bit numbers, that saving is enormous.

## Try it

1. Write the QFT matrix for one qubit and check it equals H.
2. Using the product formula, write QFT|11⟩ for two qubits (j₁ = 1, j₂ = 1). Hint: 0.1 in binary is ½ and 0.11 is ¾.
3. How many controlled phase gates does an exact QFT on 20 qubits need?
4. A state on 6 qubits (N = 64) has period 8. Which outcomes can the QFT give?
5. Why doesn't the random offset x₀ change the output probabilities?
6. Why can't you use the QFT to speed up the FFT in a music app?

**Answers:**

1. N = 2, ω = −1: (1/√2)[[1, 1], [1, −1]] = H.
2. (1/2)(|0⟩ + e^(2πi·½)|1⟩) ⊗ (|0⟩ + e^(2πi·¾)|1⟩) = ½(|0⟩ − |1⟩) ⊗ (|0⟩ − i|1⟩).
3. 20 × 19 / 2 = **190**.
4. Multiples of N/r = 64/8 = 8: **0, 8, 16, 24, 32, 40, 48, 56**, each with probability ⅛.
5. It only contributes the common factor ω^(k·x₀), a phase of size 1 that doesn't change |amplitude|².
6. Loading the audio samples into amplitudes would cost as much as the FFT itself, and you could only read one random frequency out per run.

## Cheat sheet

| Idea | Formula or fact |
|---|---|
| DFT | yₖ = (1/√N) Σⱼ xⱼ ωʲᵏ, ω = e^(2πi/N) |
| FFT | ~N log N classical steps |
| QFT | \|j⟩ → (1/√N) Σₖ ω^(jk) \|k⟩, N = 2ⁿ |
| One qubit | QFT = H |
| Product formula | QFT\|j⟩ = ⊗ (\|0⟩ + e^(2πi·0.jₗ…jₙ)\|1⟩)/√2 |
| Circuit | H + controlled phases π/2, π/4, …, then swaps |
| Cost | n H's + n(n − 1)/2 controlled phases ≈ n²/2 gates |
| Periodic input | Output peaks at multiples of N/r |
| Offset | Only a phase; doesn't affect the peaks |
| Not a faster FFT | Loading and reading out amplitudes are the bottlenecks |
| Inverse QFT | Turns phases into binary digits: the end of phase estimation |
| Approximate QFT | Drop tiny rotations: ~n log n gates, high fidelity |
| Qiskit | `QFTGate(n)`, `QFTGate(n).inverse()` |
