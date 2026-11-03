---
layout: ../../layouts/Post.astro
title: "Quantum gates and circuits"
description: "The Bloch sphere, X, Y, Z, H, S and T gates, rotations, CNOT, your first Bell pair and the universal gate set."
date: 2026-10-29
category: lesson
lesson: 2
slides: lesson-2
---

## Key ideas

**A gate is a rotation.** Every single-qubit state is a point on the **Bloch sphere**: |0⟩ at the north pole, |1⟩ at the south pole, superpositions on the surface in between. Single-qubit gates rotate that point. They are unitary matrices, so they never lose information and can always be undone.

## The single-qubit gates

| Gate | What it does |
|---|---|
| X | Flips \|0⟩ ↔ \|1⟩ (quantum NOT). 180° about the x-axis. |
| Z | Leaves \|0⟩ alone, flips the sign of \|1⟩. A phase flip. |
| Y | A bit flip and a phase flip together. |
| H | \|0⟩ → \|+⟩, \|1⟩ → \|−⟩. Creates and undoes superposition. |
| S, T | Quarter-turn and eighth-turn phase gates. |
| Rx, Ry, Rz | Rotate by any angle you choose. |

`|+⟩ = (|0⟩ + |1⟩)/√2` and `|−⟩ = (|0⟩ − |1⟩)/√2` give the same 50/50 measurement results, but they're different states. Apply H again and you get back |0⟩ or |1⟩.

## Two qubits and entanglement

**CNOT** flips the target qubit only if the control is |1⟩. Put H on the first qubit, then CNOT, and you get the **Bell state** (|00⟩ + |11⟩)/√2. Two gates are all it takes to entangle two qubits.

Other useful gates: **SWAP** (exchange two qubits), **CZ** (phase flip if both are 1), **Toffoli** (a controlled-controlled-NOT).

## Universal gate set

H, T and CNOT together can approximate *any* quantum computation. Real hardware builds everything from a small set like this.

```python
from qiskit import QuantumCircuit
qc = QuantumCircuit(2, 2)
qc.h(0)
qc.cx(0, 1)
qc.measure([0, 1], [0, 1])
```
