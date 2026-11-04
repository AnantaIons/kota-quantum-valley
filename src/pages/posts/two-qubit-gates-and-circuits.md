---
layout: ../../layouts/Post.astro
title: "Quantum gates and circuits"
description: "Every key gate as a matrix and a rotation on the Bloch sphere, |+⟩ and |−⟩, two-qubit gates, building a Bell pair, and the universal gate set, with code to check each one."
date: 2026-10-29
category: lesson
lesson: 13

---

A quantum program is a **circuit**: qubits as horizontal wires, gates as boxes, read left to right. This lesson gives you every gate you'll use in the rest of the course.

## The rule all gates follow

A gate is a **unitary matrix** U: it keeps |α|² + |β|² = 1. Every unitary can be undone, so **quantum gates are reversible**. (Measurement is not a gate, and is not reversible.)

## The Bloch sphere picture

Any single-qubit state can be drawn as a point on a sphere: |0⟩ at the north pole, |1⟩ at the south pole, 50/50 states around the equator. Every single-qubit gate is a **rotation** of this sphere. ([Full explainer](/posts/what-is-the-bloch-sphere/).)

## The single-qubit gates

| Gate | Matrix | Bloch rotation | Effect |
|---|---|---|---|
| **X** | [[0, 1], [1, 0]] | 180° about x | \|0⟩ ↔ \|1⟩ (quantum NOT) |
| **Y** | [[0, −i], [i, 0]] | 180° about y | Bit flip + phase flip |
| **Z** | [[1, 0], [0, −1]] | 180° about z | \|1⟩ → −\|1⟩ (phase flip) |
| **H** | (1/√2)[[1, 1], [1, −1]] | 180° about x+z | \|0⟩ → \|+⟩, \|1⟩ → \|−⟩ |
| **S** | [[1, 0], [0, i]] | 90° about z | Quarter-turn phase |
| **T** | [[1, 0], [0, e^(iπ/4)]] | 45° about z | Eighth-turn phase |
| **Rx, Ry, Rz(θ)** | — | θ about x, y, z | Any angle you choose |

Two useful identities: **T·T = S** and **H·Z·H = X**.

## |+⟩ and |−⟩: same probabilities, different states

```
|+⟩ = (|0⟩ + |1⟩)/√2        |−⟩ = (|0⟩ − |1⟩)/√2
```

Both give 50/50 when measured. But H turns |+⟩ back into |0⟩ and |−⟩ into |1⟩. The minus sign is real, physical information, carried by the **phase**.

## Two qubits

Two qubits have 4 basis states: |00⟩, |01⟩, |10⟩, |11⟩, so a state is a vector of 4 amplitudes. Combining separate qubits uses the **tensor product**: |0⟩ ⊗ |1⟩ = |01⟩.

**CNOT** (controlled-NOT) flips the target if the control is |1⟩:

| Input | Output |
|---|---|
| \|00⟩ | \|00⟩ |
| \|01⟩ | \|01⟩ |
| \|10⟩ | \|11⟩ |
| \|11⟩ | \|10⟩ |

Other two- and three-qubit gates: **CZ** (phase flip if both are 1), **SWAP** (exchange two qubits), **Toffoli** (CCX, flips the target if both controls are 1).

## Building a Bell pair, step by step

1. Start: |00⟩
2. H on qubit 0: (|0⟩ + |1⟩)/√2 ⊗ |0⟩ = (|00⟩ + |10⟩)/√2
3. CNOT 0→1: the |10⟩ part becomes |11⟩, giving **(|00⟩ + |11⟩)/√2**

Two gates, and the qubits are entangled. ([Entanglement explained](/posts/what-is-entanglement/).)

## The universal gate set

**H, T and CNOT** together can approximate *any* quantum computation to any accuracy you want. Real hardware builds everything from a small native set like this.

## Check every claim in code

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Operator, Statevector
import numpy as np

c = QuantumCircuit(1); c.h(0); c.z(0); c.h(0)
print(Operator(c).equiv(Operator.from_label("X")))   # True:  HZH = X

tt = QuantumCircuit(1); tt.t(0); tt.t(0)
s = QuantumCircuit(1); s.s(0)
print(Operator(tt).equiv(Operator(s)))               # True:  TT = S

minus = QuantumCircuit(1); minus.x(0); minus.h(0)
print(np.round(Statevector(minus).data.real, 3))     # [ 0.707 -0.707]  = |−⟩
```

## Try it

1. What does H·H do? Check with `Operator`.
2. Show by multiplying matrices that X·X = I.
3. Build a Bell pair, then add X on qubit 1. Which Bell state do you get?
4. In the [Quantum Lab](/lab/), press H, then S, then S again. Where does the arrow end up, and which single gate does S·S equal?

## Cheat sheet

| Want to… | Use |
|---|---|
| Flip 0 ↔ 1 | X |
| Make 50/50 superposition | H |
| Change only the phase | Z, S, T, Rz |
| Entangle two qubits | H then CNOT |
| Universal set | H, T, CNOT |
