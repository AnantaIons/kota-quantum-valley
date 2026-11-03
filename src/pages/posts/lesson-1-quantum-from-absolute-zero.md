---
layout: ../../layouts/Post.astro
title: "Quantum from absolute zero: qubits, |0⟩ and |1⟩"
description: "Bits vs qubits, what a quantum state is, superposition, why we need i, vectors and matrices, entanglement and interference."
date: 2026-10-28
category: lesson
lesson: 1
slides: lesson-1
---

## Key ideas

**A bit is 0 or 1. A qubit has a state.** We write the two basic states as `|0⟩` and `|1⟩` ("ket zero" and "ket one"). Any qubit state is a mix of both:

```
|ψ⟩ = α|0⟩ + β|1⟩      with  |α|² + |β|² = 1
```

**Superposition.** α and β are *amplitudes*. When you measure, you get 0 with probability |α|² and 1 with probability |β|². After measuring, the qubit stays in the state you saw.

**Why complex numbers?** Amplitudes can be negative or complex. That lets them cancel each other, which is where quantum computing gets its power. Probabilities can never cancel; amplitudes can.

**Qubits are vectors.** `|0⟩ = [1, 0]` and `|1⟩ = [0, 1]`. A gate is a matrix that multiplies the vector. The X gate swaps them, just like a NOT gate.

**Scale.** n qubits need 2ⁿ amplitudes to describe. 300 qubits would need more numbers than there are atoms in the observable universe.

## The four big ideas

- **Superposition:** a mix of |0⟩ and |1⟩.
- **Measurement:** gives one answer, with probability |amplitude|².
- **Entanglement:** two qubits sharing one state, like (|00⟩ + |11⟩)/√2. Measure one and you instantly know the other.
- **Interference:** amplitudes add or cancel. Algorithms are designed so wrong answers cancel and right answers add up.

## Your first circuit

Apply a **Hadamard (H)** gate to |0⟩ and you get an equal mix: (|0⟩ + |1⟩)/√2. Measure it 1,000 times and you'll see about 500 zeros and 500 ones. Try it free on IBM Quantum.
