---
layout: ../../layouts/Post.astro
title: "Universal gate sets and compilation"
description: "What it means for a gate set to be universal, why single-qubit gates plus CNOT build any operation, why any two-qubit gate needs at most three CNOTs, why most operations still need exponentially many gates, how H and T approximate any rotation (Solovay–Kitaev), why Clifford circuits are easy to simulate, and how a compiler turns your circuit into hardware gates."
date: 2026-11-04
category: lesson
lesson: 17

---

A classical computer can run any program using only NAND gates (Lesson 1). Is there a quantum equivalent: a small set of gates from which every possible quantum computation can be built?

Yes, and the details matter a great deal in practice. They decide what hardware must be able to do, how expensive a computation is, which circuits a classical computer can simulate easily, and what a quantum compiler does to your program before it runs. This lesson closes Part C by answering three questions: **which gates are enough, how many do you need, and how does your circuit get turned into them.**

## Two meanings of "universal"

There's a twist compared with classical computing. Quantum gates form a **continuum**: RX(θ) is a different gate for every angle θ. A finite set of gates can only make countably many circuits, so it can never hit every unitary exactly. So there are two kinds of universality:

| Kind | Meaning | Example |
|---|---|---|
| **Exactly universal** | Builds any unitary exactly, using gates with continuous angles | All single-qubit gates + CNOT |
| **Approximately universal** | Builds any unitary to any accuracy ε you ask for, using a finite set | H, T and CNOT ("Clifford + T") |

Hardware uses the first kind (it can tune any angle), but error-corrected computers will use the second (Lesson 35 explains why). Both matter.

## Single-qubit gates plus CNOT build everything

**Theorem (Barenco and colleagues, 1995):** any unitary on any number of qubits can be written exactly as a circuit of single-qubit gates and CNOTs.

The idea of the proof, in three steps:

1. Any big unitary can be broken into a product of **two-level unitaries**: matrices that act like a 2×2 rotation on just two basis states and do nothing to the rest (like Gaussian elimination in reverse).
2. Each two-level unitary is a single-qubit gate controlled on all the other qubits, which can be built from Toffoli-like multi-controlled gates.
3. Multi-controlled gates break down into CNOTs and single-qubit gates (Lesson 13 showed it for Toffoli).

You already know from Lesson 11 that any single-qubit gate is three rotations. So CNOT plus rotations is all a quantum computer fundamentally needs.

### Any two-qubit gate needs at most 3 CNOTs

For two qubits there's a sharp result: **every two-qubit unitary can be built with at most 3 CNOTs** plus single-qubit gates (this follows from the "KAK" or Cartan decomposition). Three is also needed for a typical random gate. Qiskit finds such a decomposition automatically:

```python
from qiskit import QuantumCircuit, transpile
from qiskit.quantum_info import random_unitary, Operator

U = random_unitary(4, seed=17)                  # a random two-qubit gate
qc = QuantumCircuit(2)
qc.unitary(U, [0, 1])
native = transpile(qc, basis_gates=["cx", "rz", "sx", "x"], optimization_level=2)
print(dict(native.count_ops()))
print("still the same gate:", Operator(native).equiv(U))
```

```text
{'rz': 15, 'sx': 10, 'cx': 3}
still the same gate: True
```

A completely random 4×4 unitary became exactly 3 CNOTs and 25 single-qubit gates on IBM's native set (Lesson 11). Since a CNOT is the expensive part, "3 CNOTs" is the real price of an arbitrary two-qubit gate.

## Universal doesn't mean cheap

Here's a sobering fact. An n-qubit unitary is a 2ⁿ × 2ⁿ matrix: roughly 4ⁿ real numbers describe it. Each gate in a circuit adds only a handful of adjustable numbers. So to be able to reach every unitary, circuits must, in general, contain on the order of **4ⁿ gates**. (This is a counting argument, much like Shannon's proof that most Boolean functions need exponentially large classical circuits.)

The consequence: **almost all quantum operations are impossibly expensive to build.** For 50 qubits, 4⁵⁰ ≈ 10³⁰ gates. Useful quantum algorithms are rare, special operations that happen to need only polynomially many gates, like the quantum Fourier transform (about n² gates, Lesson 26). Finding those special operations is what quantum algorithm research is about, and it's why Lesson 31 is careful about which problems quantum computers can help with.

## Finite gate sets: Clifford + T

Why would anyone want a **finite** gate set, when hardware can tune any angle? Because of error correction. In a fault-tolerant computer (Lessons 33–35), each logical gate is a carefully designed procedure on many physical qubits, and only a finite menu of such procedures can be built. The standard menu is:

> **Clifford gates (H, S, CNOT) + the T gate**

With these, any single-qubit rotation can be **approximated** as closely as you like, by a long sequence of H and T gates.

How long? The **Solovay–Kitaev theorem** (around 1995–2000) guarantees that the number of gates needed to reach accuracy ε grows only like a power of log(1/ε). That's very slow growth: each extra digit of accuracy costs a modest, roughly constant factor more gates, not ten times more. Qiskit implements the Solovay–Kitaev algorithm, so we can watch it work:

```python
import numpy as np
from qiskit.circuit.library import RXGate
from qiskit.quantum_info import Operator
from qiskit.synthesis import SolovayKitaevDecomposition

target = Operator(RXGate(0.3)).data                # an angle that H and T can't hit exactly
sk = SolovayKitaevDecomposition(basis_gates=["h", "t", "tdg"], depth=10)

for degree in [0, 1, 2, 3]:
    approx = sk.run(target, recursion_degree=degree)
    a = Operator(approx).data
    error = np.sqrt(abs(1 - abs(np.trace(a.conj().T @ target)) / 2))   # 0 = perfect, ignores global phase
    print(f"recursion {degree}: {approx.size():5d} gates from {{H, T, T†}}, error {error:.5f}")
```

```text
recursion 0:    10 gates from {H, T, T†}, error 0.10422
recursion 1:    36 gates from {H, T, T†}, error 0.03347
recursion 2:   164 gates from {H, T, T†}, error 0.03262
recursion 3:   872 gates from {H, T, T†}, error 0.00508
```

The rotation RX(0.3) is built purely from H, T and T†. Each level of recursion refines the previous approximation, and the error falls (not perfectly smoothly, but steadily overall). Modern number-theoretic methods do much better than Solovay–Kitaev for single-qubit rotations: they need only about 3·log₂(1/ε) T gates, so a rotation accurate to one part in a billion costs around 100 T gates.

## Why Clifford gates alone aren't enough

If T is so expensive in error-corrected machines (Lesson 35), why not use only Clifford gates: H, S and CNOT? Because **Clifford circuits are easy to simulate on an ordinary computer.** This is the **Gottesman–Knill theorem** (1998).

The trick is that Clifford gates map Pauli operators to Pauli operators. Instead of storing 2ⁿ amplitudes, a simulator tracks how n special Pauli "stabilizers" change, which takes only about n² bits. Lesson 34 explains stabilizers properly; for now, see the effect. Here's a 200-qubit GHZ state, which would need 2²⁰⁰ amplitudes as a state vector:

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import StabilizerState

n = 200                                         # a state vector would need 2^200 amplitudes
ghz = QuantumCircuit(n)
ghz.h(0)
for q in range(n - 1):
    ghz.cx(q, q + 1)                            # only Clifford gates: H and CNOT

state = StabilizerState(ghz)                    # tracks the state with about n^2 bits instead
print(state.probabilities_dict([0, 57, 123, 199]))   # four qubits chosen across the chain
```

```text
{'0000': 0.5, '1111': 0.5}
```

A laptop handles it in a couple of seconds. So Clifford circuits, despite creating lots of entanglement, can't give a quantum advantage. **The T gate is what takes a circuit beyond what classical computers can efficiently simulate.** People say T supplies "magic", and the number of T gates in an algorithm is a good measure of how hard it is to simulate classically and how expensive it is to run fault-tolerantly.

## Other universal sets

| Gate set | Universal how | Notes |
|---|---|---|
| All single-qubit gates + CNOT | Exactly | The textbook set |
| Native hardware sets: RZ, √X, X + ECR or CZ | Exactly | What IBM chips run (Lessons 11 and 13) |
| H, S, T, CNOT (Clifford + T) | Approximately | The fault-tolerant standard |
| H + Toffoli | Approximately, for computations with real amplitudes | Shows that "classical logic + Hadamard" is already enough |
| Any two-qubit gate that creates entanglement + all single-qubit gates | Exactly | So almost any interaction between qubits will do |

The last row is good news for hardware builders: you don't need a perfect CNOT. **Any** entangling two-qubit interaction, combined with single-qubit control, is enough in principle. That's why such different hardware (Lesson 13's table) can all be universal quantum computers.

## What a compiler does

When you run a circuit on real hardware, a compiler called the **transpiler** turns it into something the chip can execute. Its main stages:

1. **Unroll:** break high-level operations (a QFT, a Toffoli, `unitary(U)`) into one- and two-qubit gates.
2. **Translate:** rewrite everything into the chip's native gate set (for example RZ, √X and CZ), using identities like those in Lessons 9 to 13.
3. **Layout and routing:** choose which physical qubits play the role of your qubits, and insert SWAPs when two qubits that must interact aren't neighbours on the chip.
4. **Optimise:** cancel adjacent inverse gates (H·H = I), merge consecutive rotations, and reduce the CNOT count, often by large factors.

Lesson 40 runs all four on a real device layout. The key takeaway for now: the circuit you write and the circuit that runs can look very different, and a good compiler can make the difference between a result and noise.

## Try it

1. Why can't a finite gate set build every single-qubit unitary exactly?
2. How many CNOTs does Qiskit need for a SWAP gate? For a random two-qubit unitary?
3. A 10-qubit unitary is chosen at random. Roughly how many gates would a general circuit for it need? What about 20 qubits?
4. Using the "about 3·log₂(1/ε) T gates" rule, how many T gates approximate a rotation to ε = 10⁻⁶?
5. A circuit uses only H, S and CNOT on 500 qubits. Can a laptop simulate it? What one change makes that hard in general?
6. Why is it good news that almost any entangling two-qubit gate is universal?

**Answers:**

1. Finitely many gates make countably many circuits, but there are uncountably many unitaries (every angle θ gives a different RX(θ)).
2. **3** for SWAP (Lesson 13), and **3** for a random two-qubit unitary.
3. On the order of 4¹⁰ ≈ **10⁶** gates; for 20 qubits 4²⁰ ≈ **10¹²**.
4. log₂(10⁶) ≈ 20, so about **60** T gates.
5. **Yes** (Gottesman–Knill). Adding T gates (non-Clifford gates) makes it hard in general.
6. Every hardware platform has some natural interaction between qubits; it doesn't have to be a perfect CNOT to make the machine universal.

## Cheat sheet

| Idea | Formula or fact |
|---|---|
| Exactly universal | Any unitary exactly, with continuous angles |
| Approximately universal | Any unitary to accuracy ε, with a finite set |
| Barenco et al. (1995) | Single-qubit gates + CNOT build any unitary |
| Two-qubit gates | At most 3 CNOTs + single-qubit gates (KAK decomposition) |
| Counting argument | A general n-qubit unitary needs ~4ⁿ gates |
| Useful algorithms | Rare operations that need only polynomially many gates |
| Clifford gates | H, S, CNOT |
| Clifford + T | Approximately universal; the fault-tolerant standard |
| Solovay–Kitaev | Gates grow like a power of log(1/ε) |
| Modern synthesis | About 3·log₂(1/ε) T gates per rotation |
| Gottesman–Knill | Clifford-only circuits are efficiently simulable classically |
| T gate | Supplies "magic"; T-count measures cost and classical hardness |
| Any entangling gate | + single-qubit gates is universal |
| Transpiler stages | Unroll, translate to native gates, layout/route, optimise |
| In code | `transpile(..., basis_gates=[...])`, `SolovayKitaevDecomposition`, `StabilizerState` |
