---
layout: ../../layouts/Post.astro
title: "The quantum Fourier transform and phase estimation"
description: "What the QFT does, why it's exponentially cheaper than the classical version, and how phase estimation reads a hidden angle into bits."
date: 2026-11-04
category: lesson
lesson: 10
---

The quantum Fourier transform (QFT) is the hidden engine of Shor's algorithm and of most algorithms with an exponential speed-up. This lesson builds the intuition, then uses it in **phase estimation**.

## The Fourier idea, in one paragraph

A Fourier transform takes a pattern and asks: *which repeating frequencies is it made of?* A signal that repeats every 4 samples has a strong "period 4" component. Your phone does this millions of times a second for audio and Wi-Fi.

## The QFT

The QFT does the same thing to the **amplitudes** of n qubits:

```
|x⟩  →  (1/√N) Σ_k  e^(2πi·x·k/N) |k⟩      with N = 2ⁿ
```

Each input becomes a superposition whose **phases** rotate at a speed set by x.

**Cost:** about n²/2 gates for n qubits. The classical fast Fourier transform on 2ⁿ numbers needs about n·2ⁿ steps. That's the exponential gap.

**The catch:** you can't read out all 2ⁿ amplitudes; measurement gives one result. The QFT is only useful inside algorithms built so the answer appears as a high-probability outcome.

## Phase estimation: reading an angle into bits

**The problem:** a gate U acts on a state |u⟩ and only multiplies it by a phase, U|u⟩ = e^(2πiφ)|u⟩. Find φ.

**The recipe:**

1. Put several "counting" qubits into superposition with H.
2. Let counting qubit k control U applied 2ᵏ times. Each one picks up phase φ·2ᵏ (phase kickback, Lesson 3).
3. Apply the **inverse QFT** to the counting qubits.
4. Measure: the bits spell out φ as a binary fraction.

## Phase estimation in Qiskit

The T gate multiplies |1⟩ by e^(iπ/4) = e^(2πi·1/8). So φ = 1/8 = 0.001 in binary.

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.circuit.library import QFTGate
from qiskit.primitives import StatevectorSampler

pe = QuantumCircuit(4, 3)
pe.x(3)                              # eigenstate |1⟩ of T
pe.h([0, 1, 2])                      # counting qubits
for k in range(3):
    for _ in range(2**k):
        pe.cp(np.pi / 4, k, 3)       # controlled-T, repeated 2^k times
pe.append(QFTGate(3).inverse(), [0, 1, 2])
pe.measure([0, 1, 2], [0, 1, 2])

print(StatevectorSampler().run([pe], shots=1000).result()[0].data.c.get_counts())
```

```text
{'001': 1000}
```

The counting register reads **001** = 1, so φ = 1/2³ = **1/8**. Exactly right, every shot.

If φ isn't an exact fraction of 2³, the answer comes out as the closest value with high probability; more counting qubits give more precision.

## Where this is used

- **Shor's algorithm** (Lesson 11): finding a period is phase estimation in disguise.
- **Quantum chemistry** (Lesson 14): estimating a molecule's energy is phase estimation of its Hamiltonian.
- **Quantum sensing** (Lesson 6): Ramsey interferometry is a one-qubit phase estimation.

## Try it

1. Replace `np.pi / 4` with `np.pi / 2` (the S gate, φ = 1/4). What should the counting register read?
2. Try `np.pi / 3` (φ = 1/6, not an exact 3-bit fraction). Which results appear most often?
3. Add a fourth counting qubit and repeat question 2. Does precision improve?
