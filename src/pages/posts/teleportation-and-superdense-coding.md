---
layout: ../../layouts/Post.astro
title: "Teleportation and superdense coding"
description: "Send a qubit using two classical bits, and two classical bits using one qubit. The two protocols that show what entanglement is really worth."
date: 2026-11-04
category: lesson
lesson: 21
---

Entanglement (Lesson 14) is a resource you can spend. This lesson shows the two classic ways to spend it. Both use one shared Bell pair.

## Quantum teleportation

**Goal:** Alice has an unknown qubit |ψ⟩ = α|0⟩ + β|1⟩. She wants Bob to have it. She can't just measure it (that destroys α and β) and she can't copy it (no-cloning, Lesson 16).

**The recipe:**

1. **Share a Bell pair.** Alice holds q1, Bob holds q2, in the state (|00⟩ + |11⟩)/√2.
2. **Alice entangles her qubits:** CNOT from q0 (the one to send) to q1, then H on q0.
3. **Alice measures q0 and q1.** She gets two random bits, m0 and m1.
4. **She sends m0 and m1 to Bob** over an ordinary channel (phone, internet).
5. **Bob corrects:** if m1 = 1 he applies X, if m0 = 1 he applies Z.

Bob's qubit is now exactly |ψ⟩.

| Alice's bits (m0 m1) | Bob applies |
|---|---|
| 0 0 | nothing |
| 0 1 | X |
| 1 0 | Z |
| 1 1 | X then Z |

**What teleportation is not:**

- **Not matter transport.** Only the *state* moves. Bob's qubit was already with Bob.
- **Not faster than light.** Until Bob receives the two classical bits, his qubit looks completely random.
- **Not copying.** Alice's original is destroyed by her measurement, so no-cloning is respected.

## Teleportation in Qiskit

This version puts Bob's corrections inside the circuit as controlled gates. It's mathematically the same as measuring first.

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, partial_trace, DensityMatrix
import numpy as np

tp = QuantumCircuit(3)
tp.ry(1.2, 0)            # the "unknown" state Alice wants to send
tp.h(1); tp.cx(1, 2)     # Bell pair: q1 Alice, q2 Bob
tp.cx(0, 1); tp.h(0)     # Alice's operations
tp.cx(1, 2); tp.cz(0, 2) # Bob's corrections

bob = partial_trace(Statevector(tp), [0, 1])   # Bob's qubit alone
ref = QuantumCircuit(1); ref.ry(1.2, 0)
print(np.allclose(bob.data, DensityMatrix(Statevector(ref)).data))   # True
```

**True**: Bob's qubit is identical to the state Alice started with.

## Superdense coding

The reverse trick: **send 2 classical bits by sending only 1 qubit.**

1. Alice and Bob share a Bell pair.
2. Alice encodes two bits by acting on **her qubit only**: nothing, X, Z, or X then Z.
3. She sends her qubit to Bob.
4. Bob applies CNOT then H, and measures both qubits.

Each of Alice's four choices produces a different Bell state, and Bob's CNOT + H turns each into a different result.

```python
from qiskit.primitives import StatevectorSampler
sampler = StatevectorSampler()

for label, ops in [("nothing", ""), ("X", "x"), ("Z", "z"), ("X then Z", "xz")]:
    sd = QuantumCircuit(2)
    sd.h(0); sd.cx(0, 1)          # Bell pair
    if "x" in ops: sd.x(0)        # Alice encodes
    if "z" in ops: sd.z(0)
    sd.cx(0, 1); sd.h(0)          # Bob decodes
    sd.measure_all()
    print(label, sampler.run([sd], shots=100).result()[0].data.meas.get_counts())
```

```text
nothing  {'00': 100}
X        {'10': 100}
Z        {'01': 100}
X then Z {'11': 100}
```

Every choice gives one result, 100 times out of 100. Remember Qiskit prints qubit 0 on the right (Lesson 18).

## Why this matters

- **Teleportation** is how a future quantum internet will move qubits between processors, and between nodes too far apart for photons to travel directly.
- Both protocols prove that entanglement + classical bits can do things neither can do alone.

## Try it

1. Change `ry(1.2, 0)` to `h(0)` or `x(0)` in the teleportation code. Is the result still True?
2. Remove `tp.cz(0, 2)`. What goes wrong, and when?
3. In the [Quantum Lab](/lab/) circuit builder, build the superdense-coding circuit for "X then Z" and check the probabilities.
