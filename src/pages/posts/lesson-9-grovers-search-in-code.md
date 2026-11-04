---
layout: ../../layouts/Post.astro
title: "Grover's search, built in code"
description: "Build Grover's algorithm from scratch: oracle, diffusion, how many rounds, and why a 2-qubit search finds the answer in one try."
date: 2026-11-04
category: lesson
lesson: 9
---

Lesson 3 explained Grover's search in pictures. Now you build it, gate by gate.

## The problem

You have N possible answers and a "checker" (the **oracle**) that can recognise the right one. Classically, you try answers one by one: about N/2 tries on average. Grover finds it in about **(π/4)·√N** rounds.

| N | Classical (average) | Grover rounds |
|---|---|---|
| 4 | 2 | 1 |
| 1,000,000 | 500,000 | ~785 |
| 10¹² | 5 × 10¹¹ | ~785,000 |

A **quadratic** speed-up: useful, but not exponential.

## The two parts of a round

**1. Oracle: flip the sign of the answer.**
It multiplies the marked state's amplitude by −1. Nothing changes in the probabilities yet, only a hidden sign.

**2. Diffusion: reflect every amplitude about the average.**
The marked amplitude is now below the average, so reflecting pushes it far above. All the others shrink slightly.

Repeat both steps about (π/4)√N times, then measure.

## Grover on 2 qubits

With 2 qubits there are 4 answers: 00, 01, 10, 11. We'll mark **11**. For N = 4, exactly **one round** gives the answer with certainty.

```python
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler

g = QuantumCircuit(2)
g.h([0, 1])          # equal superposition of all 4 answers

# Oracle: flip the sign of |11⟩
g.cz(0, 1)

# Diffusion: reflect about the average
g.h([0, 1])
g.x([0, 1])
g.cz(0, 1)
g.x([0, 1])
g.h([0, 1])

g.measure_all()
print(StatevectorSampler().run([g], shots=1000).result()[0].data.meas.get_counts())
```

```text
{'11': 1000}
```

1,000 out of 1,000. Classically you'd need 2 guesses on average, and 3 in the worst case.

## Marking a different answer

The oracle is the only part that changes. To mark the answer where q0 = 1 and q1 = 0, wrap the CZ in X gates on q1, so the "11" check happens when q1 is actually 0:

```python
g2 = QuantumCircuit(2)
g2.h([0, 1])
g2.x(1); g2.cz(0, 1); g2.x(1)                                        # oracle
g2.h([0, 1]); g2.x([0, 1]); g2.cz(0, 1); g2.x([0, 1]); g2.h([0, 1])  # diffusion
g2.measure_all()
print(StatevectorSampler().run([g2], shots=1000).result()[0].data.meas.get_counts())
```

```text
{'01': 1000}
```

Qiskit prints q1 first, so '01' means q1 = 0, q0 = 1: the one we marked.

## Don't over-rotate

Grover is a rotation. Too few rounds and you haven't arrived; **too many and you rotate past the answer**. For N = 4, a second round actually makes things worse. With larger N, you must choose the round count carefully.

## Honest limits

- The oracle must be built as a quantum circuit. For "searching a database", loading the data is often as expensive as searching it classically.
- A quadratic speed-up can be eaten up by error-correction overhead (Lesson 12).
- Grover's real impact today: it halves the effective strength of symmetric keys, which is why AES-256 is recommended over AES-128 for long-term security.

## Try it

1. Mark **00**: which X gates does the oracle need?
2. Add a second Grover round to the 2-qubit circuit. What happens to the counts?
3. Build the same circuit in the [Quantum Lab](/lab/) circuit builder and watch the probabilities after each gate.
