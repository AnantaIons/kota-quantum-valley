---
layout: ../../layouts/Post.astro
title: "Quantum from absolute zero: qubits, |0⟩ and |1⟩"
description: "Bits vs qubits, quantum states as vectors, amplitudes and probabilities, why we need complex numbers, and the four big ideas, with your first lines of code."
date: 2026-10-28
category: lesson
lesson: 1
slides: lesson-1
---

This lesson builds the single most important idea in the course: **a qubit is a vector of two numbers.** Everything else is built on it.

## Bits vs qubits

A classical **bit** is 0 or 1. You can read it as often as you like; reading doesn't change it.

A **qubit** has a **state**. We write the two basic states as

- `|0⟩`, read "ket zero"
- `|1⟩`, read "ket one"

The `| ⟩` symbol is Dirac notation. It just labels a state.

## A state is a vector

Write the two basic states as column vectors:

```
|0⟩ = [1, 0]        |1⟩ = [0, 1]
```

Any qubit state is a combination:

```
|ψ⟩ = α|0⟩ + β|1⟩ = [α, β]
```

α and β are called **amplitudes**.

## Amplitudes → probabilities

When you **measure** a qubit you get a plain 0 or 1:

- P(0) = |α|²
- P(1) = |β|²
- and always **|α|² + |β|² = 1** (something must happen)

**Worked example.** |ψ⟩ = √0.8|0⟩ + √0.2|1⟩.
P(0) = 0.8, P(1) = 0.2. Measure 1,000 copies and you'll see about 800 zeros and 200 ones.

After measuring, the qubit **becomes** the result. The superposition is gone.

## Why complex numbers?

Amplitudes can be negative, or complex like i/√2. That matters because amplitudes **add** before they're squared, so they can **cancel**:

- (+½) + (+½) = 1, a strong result.
- (+½) + (−½) = 0, an impossible result.

Probabilities alone can never cancel (they're never negative). This cancelling, called **interference**, is the source of quantum computing's power.

Complex numbers are the natural way to describe phases: e^(iθ) = cos θ + i sin θ is a number of size 1 that only carries an angle.

## Gates are matrices

A gate changes the state by multiplying the vector by a matrix. The quantum NOT gate, **X**:

```
X = [[0, 1],
     [1, 0]]          X|0⟩ = |1⟩,  X|1⟩ = |0⟩
```

Lesson 2 covers all the important gates.

## How big does it get?

n qubits need 2ⁿ amplitudes:

| Qubits | Amplitudes |
|---|---|
| 1 | 2 |
| 10 | 1,024 |
| 50 | about 10¹⁵ (a classical supercomputer struggles) |
| 300 | about 10⁹⁰ (more than atoms in the observable universe) |

But you can't read all those amplitudes out: one measurement gives one n-bit answer. Quantum algorithms are clever ways to make the *right* answer the likely one.

## The four big ideas

1. **Superposition:** non-zero amplitudes on more than one basis state.
2. **Measurement:** gives one result, with probability |amplitude|², and collapses the state.
3. **Entanglement:** several qubits sharing one state that can't be split up (Lesson 2).
4. **Interference:** amplitudes add or cancel; algorithms use this to suppress wrong answers.

## Your first code

You don't need a quantum computer, just Python with NumPy:

```python
import numpy as np

ket0 = np.array([1, 0])
X = np.array([[0, 1], [1, 0]])
print(X @ ket0)            # [0 1]  →  |1⟩

psi = np.array([np.sqrt(0.8), np.sqrt(0.2)])
print(np.abs(psi)**2)      # [0.8 0.2]  probabilities
```

And with Qiskit (install it in Lesson 7), measuring that 80/20 state 1,000 times:

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler

qc = QuantumCircuit(1)
qc.ry(2 * np.arcsin(np.sqrt(0.2)), 0)   # makes √0.8|0⟩ + √0.2|1⟩
qc.measure_all()
print(StatevectorSampler().run([qc], shots=1000).result()[0].data.meas.get_counts())
```

```text
{'1': 202, '0': 798}
```

## Try it

1. Is [0.6, 0.8] a valid qubit state? What are P(0) and P(1)?
2. Is [1/√2, i/√2] valid? What are its probabilities?
3. Compute X applied to [0.6, 0.8].
4. In the [Quantum Lab](/lab/), press **H** then measure 1,000 times. Which state did you make?

Answers: (1) yes, 0.36 and 0.64; (2) yes, 0.5 and 0.5; (3) [0.8, 0.6].

## Cheat sheet

| Idea | Formula |
|---|---|
| Qubit state | \|ψ⟩ = α\|0⟩ + β\|1⟩ = [α, β] |
| Probabilities | P(0) = \|α\|², P(1) = \|β\|² |
| Normalisation | \|α\|² + \|β\|² = 1 |
| A gate | new state = matrix × old state |
| n qubits | 2ⁿ amplitudes |
