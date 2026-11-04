---
layout: ../../layouts/Post.astro
title: "Quantum algorithms: Deutsch–Jozsa to Shor"
description: "The recipe every quantum algorithm follows, phase kickback, Deutsch–Jozsa and Bernstein–Vazirani in working code, plus a map of Grover, the QFT and Shor."
date: 2026-10-29
category: lesson
lesson: 3
slides: lesson-3
---

A quantum algorithm doesn't "try every answer at once and pick the best". It does something subtler: it arranges **interference** so wrong answers cancel and the right one is what you measure. This lesson shows exactly how, with two algorithms you can run today.

## The recipe

Almost every quantum algorithm has the same four steps:

1. **Superpose:** H on every input qubit, giving all inputs at once.
2. **Oracle:** a circuit that encodes the problem by putting a **phase** on certain inputs.
3. **Interfere:** more gates (often H again, or the QFT) so phases turn into big or small amplitudes.
4. **Measure:** read out the answer.

## The oracle and phase kickback

An oracle for a function f(x) (0 or 1) usually works like this: it flips an extra "target" qubit when f(x) = 1.

The trick: prepare that target in **|−⟩**. Flipping |−⟩ gives −|−⟩. The target is unchanged except for a minus sign, and that sign attaches to the **input** state:

```
|x⟩|−⟩  →  (−1)^f(x) |x⟩|−⟩
```

This is **phase kickback**. The answer is now stored as phases on the inputs, ready to interfere.

## Deutsch–Jozsa: constant or balanced?

**Problem:** f takes n bits and outputs 0 or 1. You're promised it's either **constant** (same output for every input) or **balanced** (0 for exactly half the inputs). Which is it?

- **Classically:** in the worst case you must check 2ⁿ⁻¹ + 1 inputs.
- **Quantumly:** **one** call to the oracle.

**Rule:** after the circuit, measure all n input qubits. **All zeros means constant; anything else means balanced.**

```python
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler

def deutsch_jozsa(balanced):
    q = QuantumCircuit(4, 3)        # 3 input qubits + 1 target
    q.x(3); q.h(range(4))           # target in |−⟩, inputs in superposition
    if balanced:                    # oracle f(x) = x0 XOR x1 XOR x2
        for i in range(3):
            q.cx(i, 3)
    q.h(range(3))                   # interfere
    q.measure(range(3), range(3))
    return StatevectorSampler().run([q], shots=1000).result()[0].data.c.get_counts()

print("constant:", deutsch_jozsa(False))
print("balanced:", deutsch_jozsa(True))
```

```text
constant: {'000': 1000}
balanced: {'111': 1000}
```

One oracle call, a certain answer.

## Bernstein–Vazirani: find a hidden string

**Problem:** f(x) = s·x (mod 2) for a secret n-bit string s. Find s.

- **Classically:** n calls (test each bit separately).
- **Quantumly:** **one** call. The measured bits *are* s.

```python
secret = "101"
bv = QuantumCircuit(4, 3)
bv.x(3); bv.h(range(4))
for i, bit in enumerate(reversed(secret)):   # Qiskit's qubit 0 is the rightmost bit
    if bit == "1":
        bv.cx(i, 3)
bv.h(range(3))
bv.measure(range(3), range(3))
print(StatevectorSampler().run([bv], shots=1000).result()[0].data.c.get_counts())
```

```text
{'101': 1000}
```

## The big three, in one map

| Algorithm | Problem | Classical | Quantum | Details |
|---|---|---|---|---|
| **Grover** | Find 1 marked item among N | ~N/2 tries | ~√N | Lesson 9 |
| **QFT / phase estimation** | Find a hidden period or phase | Exponential (in general) | Polynomial | Lesson 10 |
| **Shor** | Factor a large number | Sub-exponential | Polynomial | Lesson 11 |

## Honest note

Quantum computers don't speed up everything. Deutsch–Jozsa and Bernstein–Vazirani solve made-up problems; they exist to show the mechanism. The big practical wins expected are **factoring** (Shor), **simulating molecules and materials** (Lesson 14), and some search and optimisation, mostly on future error-corrected machines.

## Try it

1. Change the Deutsch–Jozsa balanced oracle to only `q.cx(0, 3)`. Still balanced? What does it output?
2. Change `secret` to `"110"` and check the output.
3. Why must the target start in |−⟩? Remove `q.x(3)` and see what happens.

## Cheat sheet

| Term | Meaning |
|---|---|
| Oracle | Circuit that marks answers with a phase |
| Phase kickback | Target in \|−⟩ moves the sign onto the input |
| Interference | H (or QFT) turns phases into probabilities |
| Speed-up types | Exponential (Shor), quadratic (Grover), query (DJ, BV) |
