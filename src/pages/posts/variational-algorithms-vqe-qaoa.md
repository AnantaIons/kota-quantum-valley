---
layout: ../../layouts/Post.astro
title: "Variational algorithms: VQE and QAOA"
description: "How today's noisy quantum computers team up with classical computers: tune a circuit's angles until it finds a minimum energy or a good solution."
date: 2026-11-04
category: lesson
lesson: 30
---

Shor and phase estimation need error-corrected machines that don't exist yet. **Variational algorithms** were designed for today's noisy hardware, often called the **NISQ** era (noisy intermediate-scale quantum).

## The idea: a quantum-classical loop

1. A **parameterised circuit** (the *ansatz*) prepares a state using adjustable angles θ.
2. The quantum computer **measures** a cost, like an energy.
3. A **classical optimiser** adjusts θ to lower the cost.
4. Repeat until the cost stops improving.

Short circuits keep noise low. The classical computer does the heavy lifting of the search.

## VQE: variational quantum eigensolver

**Goal:** find the lowest energy (the *ground state*) of a system described by a Hamiltonian H. This is the central question in chemistry: a molecule's ground-state energy predicts its shape and reactions.

**Why it works:** the **variational principle**. For any state |ψ(θ)⟩, the measured energy is ≥ the true ground energy. So lowering the energy can only bring you closer.

## A tiny VQE in Qiskit

A one-qubit "molecule" with H = Z + 0.5·X. One angle, one RY gate:

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.circuit import Parameter
from qiskit.quantum_info import SparsePauliOp, Statevector

H = SparsePauliOp(["Z", "X"], coeffs=[1.0, 0.5])
theta = Parameter("θ")
ansatz = QuantumCircuit(1)
ansatz.ry(theta, 0)

def energy(t):
    state = Statevector(ansatz.assign_parameters({theta: t}))
    return state.expectation_value(H).real

best = min(np.linspace(0, 2 * np.pi, 721), key=energy)   # simple search
print("best θ =", round(best, 3), " energy =", round(energy(best), 4))
print("exact  =", round(np.linalg.eigvalsh(H.to_matrix())[0], 4))
```

```text
best θ = 3.604  energy = -1.118
exact  = -1.118
```

The loop found the exact ground energy, −√1.25 ≈ −1.118. Real VQE runs use dozens of qubits, many parameters, and smarter optimisers like COBYLA or SPSA, but the loop is identical.

## QAOA: quantum approximate optimisation

**Goal:** good answers to hard combinatorial problems, like *MaxCut*: split a network into two groups to cut as many links as possible. Similar problems include scheduling, routing and portfolio choices.

**The circuit** alternates two layers p times:

1. A **problem layer** that adds phases depending on how good each answer is.
2. A **mixer layer** (RX rotations) that lets amplitude flow between answers.

The classical optimiser tunes the 2p angles. Measuring then gives good answers with boosted probability.

## Honest status

- **No clear practical advantage yet.** For real problems, the best classical methods still match or beat VQE and QAOA.
- **Barren plateaus:** for large random circuits the cost landscape becomes almost flat, and optimisers get lost. Problem-inspired ansatzes help.
- **Measurement cost:** each energy estimate needs thousands of shots.
- Variational methods remain the main way researchers use today's hardware, and the best place to learn.

## Try it

1. Change the Hamiltonian to `["Z", "X"], coeffs=[1.0, 1.0]`. What ground energy do you expect? Check it.
2. Replace the grid search with `scipy.optimize.minimize(energy, x0=0.1, method="COBYLA")`.
3. Why can't one RY gate find the ground state of `["Y"]`? Add an RX or RZ and see.
