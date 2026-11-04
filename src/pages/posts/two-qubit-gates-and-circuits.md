---
layout: ../../layouts/Post.astro
title: "Two-qubit gates and circuits"
description: "Controlled gates from the ground up: CNOT, CZ and controlled-U as matrices, why 'control' and 'target' depend on the basis, phase kickback, SWAP from three CNOTs, Toffoli and its cost, the four Bell states, the native two-qubit gates of real hardware, and how to read a circuit's width, depth and gate count."
date: 2026-11-04
category: lesson
lesson: 13

---

Single-qubit gates (Lessons 9 to 11) can rotate each qubit anywhere on its Bloch sphere. But on their own they can never make qubits **interact**: a product state stays a product state. To create entanglement and do real computation, you need gates that act on two qubits at once, in a way that depends on both.

Almost every multi-qubit gate in practice is a **controlled gate**: "do something to one qubit, but only if another qubit is 1". This lesson builds them from the matrix up, shows a few surprising facts about them (the control and target can swap roles!), and ends with how to read and measure the size of a circuit.

We'll write maths in textbook order (first qubit on the left, Lesson 12) and remind you where Qiskit's order differs.

## The controlled-NOT

You met CNOT as a classical reversible gate in Lesson 1. It has a **control** qubit and a **target** qubit: if the control is 1, flip the target; otherwise do nothing.

| Input (control, target) | Output |
|---|---|
| \|00⟩ | \|00⟩ |
| \|01⟩ | \|01⟩ |
| \|10⟩ | \|11⟩ |
| \|11⟩ | \|10⟩ |

As a matrix (columns are what happens to |00⟩, |01⟩, |10⟩, |11⟩):

```text
CNOT = [ 1 0 0 0 ]
       [ 0 1 0 0 ]
       [ 0 0 0 1 ]
       [ 0 0 1 0 ]
```

The top-left 2×2 block is I (control 0: do nothing) and the bottom-right block is X (control 1: flip). That structure gives a neat way to write **any** controlled gate using the projectors of Lesson 3:

> **Controlled-U = |0⟩⟨0| ⊗ I + |1⟩⟨1| ⊗ U**

"If the first qubit is |0⟩, apply I to the second; if it's |1⟩, apply U." With U = X that's CNOT. And because it acts on superpositions linearly, a control in superposition makes the gate "both happen and not happen", which is how entanglement is born.

In circuit diagrams, the control is a solid dot and the target of a CNOT is a circle with a plus (⊕, "XOR into").

## Controlled-Z: the symmetric one

With U = Z you get **CZ**:

```text
CZ = [ 1 0 0  0 ]
     [ 0 1 0  0 ]
     [ 0 0 1  0 ]
     [ 0 0 0 −1 ]
```

It does nothing except put a minus sign on |11⟩. Notice: the minus sign appears only when **both** qubits are 1. So it doesn't matter which one you call the control: **CZ is symmetric.** In diagrams it's drawn as two dots joined by a line.

## Control and target depend on the basis

Here are three facts that surprise almost everyone. Each one is just the H-swaps-bases identity HZH = X from Lesson 9 applied to two qubits.

**1. A CNOT is a CZ with Hadamards around the target.** Since HZH = X, a controlled-Z sandwiched between H's on the target becomes a controlled-X:

> CNOT = (I ⊗ H) · CZ · (I ⊗ H)

**2. Hadamards on both qubits swap control and target.** Put H on both qubits before and after a CNOT, and you get a CNOT pointing the other way. In the +/− basis, the "target" is the one doing the controlling.

> (H ⊗ H) · CNOT₁→₂ · (H ⊗ H) = CNOT₂→₁

**3. Three CNOTs make a SWAP.** Alternating the direction, CNOT₁→₂ · CNOT₂→₁ · CNOT₁→₂ exchanges the two qubits completely. (It's the quantum version of the XOR-swap trick programmers use to swap two variables without a temporary one.)

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Operator

def same(a, b):
    return Operator(a) == Operator(b)

# 1. CZ is symmetric: it doesn't matter which qubit is the control
cz01 = QuantumCircuit(2); cz01.cz(0, 1)
cz10 = QuantumCircuit(2); cz10.cz(1, 0)
print("CZ(0,1) = CZ(1,0):", same(cz01, cz10))

# 2. A CNOT is a CZ with Hadamards on the target
cx = QuantumCircuit(2); cx.cx(0, 1)
hzh = QuantumCircuit(2); hzh.h(1); hzh.cz(0, 1); hzh.h(1)
print("CNOT = (I x H) CZ (I x H):", same(cx, hzh))

# 3. Hadamards on both qubits swap control and target
flipped = QuantumCircuit(2); flipped.h([0, 1]); flipped.cx(0, 1); flipped.h([0, 1])
cx10 = QuantumCircuit(2); cx10.cx(1, 0)
print("(H x H) CNOT(0,1) (H x H) = CNOT(1,0):", same(flipped, cx10))

# 4. Three CNOTs make a SWAP
three = QuantumCircuit(2); three.cx(0, 1); three.cx(1, 0); three.cx(0, 1)
swap = QuantumCircuit(2); swap.swap(0, 1)
print("CNOT CNOT CNOT = SWAP:", same(three, swap))
```

```text
CZ(0,1) = CZ(1,0): True
CNOT = (I x H) CZ (I x H): True
(H x H) CNOT(0,1) (H x H) = CNOT(1,0): True
CNOT CNOT CNOT = SWAP: True
```

(In Qiskit, `qc.cx(a, b)` means control a, target b.) These identities aren't curiosities. Real chips offer only one kind of two-qubit gate, often CZ, and compilers use exactly these rewrites to turn your CNOTs and SWAPs into it (Lesson 40).

## Phase kickback: the control gets changed

Classically, the control of a CNOT is never changed. Quantum mechanically, it can be, and this is one of the most important effects in quantum computing.

Put the target in |−⟩ = (|0⟩ − |1⟩)/√2. Flipping it gives X|−⟩ = −|−⟩: the same state times −1. So a CNOT acting on |c⟩|−⟩ does:

```text
control |0⟩:  |0⟩|−⟩  →  |0⟩|−⟩           (no flip)
control |1⟩:  |1⟩|−⟩  →  |1⟩(−|−⟩) = −|1⟩|−⟩   (flip = multiply by −1)
```

The target is unchanged either way. The −1 has moved onto the **control's |1⟩ branch**. So if the control was |+⟩ = (|0⟩ + |1⟩)/√2, it becomes (|0⟩ − |1⟩)/√2 = |−⟩. The control has been flipped in the +/− basis, while the target, supposedly the thing being acted on, didn't change at all.

In general, if the target is an eigenstate of U with eigenvalue e^(iθ), a controlled-U puts the phase e^(iθ) onto the control's |1⟩ branch. This is **phase kickback** (previewed in Lesson 10). Let's see it: the control reads 0 when the target is |+⟩ (eigenvalue +1), and 1 when the target is |−⟩ (eigenvalue −1).

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

for target in ["|+>", "|->"]:
    qc = QuantumCircuit(2)
    qc.h(0)                      # control (qubit 0) in |+>
    if target == "|->":
        qc.x(1)
    qc.h(1)                      # target (qubit 1) in |+> or |->
    qc.cx(0, 1)
    qc.h(0)                      # ask the control "+ or -?"
    p = Statevector(qc).probabilities([0])
    print("target", target, "-> control reads 0/1 with", np.round(p, 3))
```

```text
target |+> -> control reads 0/1 with [1. 0.]
target |-> -> control reads 0/1 with [0. 1.]
```

Deutsch–Jozsa and Bernstein–Vazirani (Lesson 22) use exactly this to read a function's answer out of the control qubits. Phase estimation (Lesson 27) uses it with general phases e^(iθ).

## The Bell states

The two-gate circuit "H on the first qubit, then CNOT" turns each of the four basis states into one of the four **Bell states**, the maximally entangled states of two qubits:

| Input (textbook) | Output | Name |
|---|---|---|
| \|00⟩ | (\|00⟩ + \|11⟩)/√2 | Φ⁺ |
| \|10⟩ | (\|00⟩ − \|11⟩)/√2 | Φ⁻ |
| \|01⟩ | (\|01⟩ + \|10⟩)/√2 | Ψ⁺ |
| \|11⟩ | (\|01⟩ − \|10⟩)/√2 | Ψ⁻ |

Let's trace the first one step by step. Start in |00⟩. H on the first qubit gives (|0⟩ + |1⟩)/√2 ⊗ |0⟩ = (|00⟩ + |10⟩)/√2. CNOT leaves |00⟩ alone and turns |10⟩ into |11⟩. Result: **(|00⟩ + |11⟩)/√2**, which fails Lesson 12's product test (ad − bc = ½), so it's entangled.

In Qiskit (labels in Qiskit order, qubit 0 on the right; H is on qubit 0 and the CNOT goes 0 → 1):

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

bell = QuantumCircuit(2)
bell.h(0)
bell.cx(0, 1)

for label in ["00", "01", "10", "11"]:          # Qiskit order: qubit 1, qubit 0
    out = Statevector.from_label(label).evolve(bell)
    print(label, "->", {str(k): round(float(v.real), 3) for k, v in out.to_dict().items()})
```

```text
00 -> {'00': 0.707, '11': 0.707}
01 -> {'00': 0.707, '11': -0.707}
10 -> {'01': 0.707, '10': 0.707}
11 -> {'01': -0.707, '10': 0.707}
```

All four Bell states appear (the last one is Ψ⁻ up to an overall sign, a global phase). Because the circuit is unitary, you can also run it **backwards**, CNOT then H, to turn each Bell state back into a distinct basis state. That's called a **Bell measurement**, and it's the key step in teleportation and superdense coding (Lesson 21). Lesson 14 explores what makes these states special.

## Three-qubit gates: Toffoli

The **Toffoli** gate (CCX) flips the target only if **both** controls are 1. It's the reversible AND from Lesson 1, and since Toffoli alone is universal for classical reversible computing, **any classical calculation can be run on a quantum computer**: this is how Shor's algorithm computes modular arithmetic (Lesson 28) and how Grover's algorithm checks candidate answers (Lesson 24).

Real chips don't have a native three-qubit gate, so Toffoli must be built from smaller ones. The standard construction uses 6 CNOTs and 7 T or T† gates:

```python
from qiskit import QuantumCircuit, transpile

qc = QuantumCircuit(3)
qc.ccx(0, 1, 2)                       # Toffoli
small = transpile(qc, basis_gates=["cx", "h", "t", "tdg"], optimization_level=1)
print(dict(small.count_ops()), "depth", small.depth())
```

```text
{'cx': 6, 't': 4, 'tdg': 3, 'h': 2} depth 11
```

That's a lot for one "AND". It's why quantum versions of classical arithmetic are expensive, and why counting T gates matters for error-corrected machines (Lesson 35).

## Native two-qubit gates of real hardware

Each hardware platform has one two-qubit interaction it does well. Everything else is compiled to it, using identities like the ones above.

| Platform | Typical native two-qubit gate |
|---|---|
| IBM superconducting | ECR (echoed cross-resonance) or CZ |
| Google superconducting | CZ, or √iSWAP |
| Trapped ions (Quantinuum, IonQ) | Mølmer–Sørensen (an XX rotation) or ZZ phase gates |
| Neutral atoms | CZ, via Rydberg interactions |

They all look different, but each is equivalent to a CNOT up to single-qubit gates. Two-qubit gates are typically **10 times more error-prone** than single-qubit ones and slower, so compilers work hard to minimise them (Lessons 38–40).

## Reading a circuit: width, depth and size

Three numbers summarise a circuit's cost:

| Measure | Meaning | Why it matters |
|---|---|---|
| **Width** | Number of qubits | Must fit on the chip |
| **Depth** | Number of time steps, when gates on different qubits run in parallel | Must finish before decoherence (Lesson 32) |
| **Size / gate count** | Total number of gates, often counted by type | Each gate adds error |

Gates on **different** qubits can happen at the same time, so they share a time step. The Toffoli above has 15 gates but depth 11, because some of them run side by side. In Qiskit: `qc.num_qubits`, `qc.depth()`, `qc.size()` and `qc.count_ops()`. When people compare quantum algorithms, the two-qubit gate count and the depth are usually the numbers that decide whether it can run on today's hardware.

## Try it

1. Write the matrix of a CNOT whose control is the **second** qubit and target the **first** (textbook order). Which basis states does it swap?
2. Show that CZ|+⟩|+⟩ is entangled. (Write it out and use ad − bc.)
3. A controlled-S gate acts on |1⟩|1⟩. What's the output? On |+⟩|1⟩?
4. Using phase kickback, predict what a CZ does to |+⟩|1⟩.
5. Which Bell state do you get from |11⟩, and what circuit turns it back into |11⟩?
6. A circuit has gates: H on q0; H on q1; CNOT q0→q1; X on q2; CNOT q1→q2. What are its width, size and depth?

**Answers:**

1. It flips the first qubit when the second is 1: swaps |01⟩ ↔ |11⟩. Matrix rows/columns 00, 01, 10, 11: [[1,0,0,0], [0,0,0,1], [0,0,1,0], [0,1,0,0]].
2. |+⟩|+⟩ = [½, ½, ½, ½]; CZ flips the last sign: [½, ½, ½, −½]. ad − bc = −¼ − ¼ = −½ ≠ 0, entangled.
3. |1⟩ ⊗ S|1⟩ = **i|11⟩**. For |+⟩|1⟩: (|01⟩ + i|11⟩)/√2 = (|0⟩ + i|1⟩)/√2 ⊗ |1⟩ = **|+i⟩|1⟩**: the phase kicked back onto the control.
4. |1⟩ is an eigenstate of Z with eigenvalue −1, so the control picks up a −1 on its |1⟩ branch: **|−⟩|1⟩**.
5. Ψ⁻ = (|01⟩ − |10⟩)/√2. Apply the circuit backwards: **CNOT, then H** on the first qubit.
6. Width **3**, size **5**. Depth **3**: step 1 = H, H, X (all different qubits); step 2 = CNOT q0→q1; step 3 = CNOT q1→q2.

## Cheat sheet

| Idea | Formula or fact |
|---|---|
| Any controlled gate | \|0⟩⟨0\| ⊗ I + \|1⟩⟨1\| ⊗ U |
| CNOT | Flip target if control is 1; matrix has I and X blocks |
| CZ | Minus sign on \|11⟩ only; symmetric |
| CNOT from CZ | CNOT = (I ⊗ H)·CZ·(I ⊗ H) |
| Reverse a CNOT | Hadamards on both qubits before and after |
| SWAP | Three alternating CNOTs |
| Phase kickback | Target in an eigenstate: its eigenvalue phase moves to the control |
| Bell circuit | H on first qubit, then CNOT |
| Bell states | Φ± = (\|00⟩ ± \|11⟩)/√2, Ψ± = (\|01⟩ ± \|10⟩)/√2 |
| Bell measurement | CNOT, then H, then measure both |
| Toffoli (CCX) | Reversible AND; 6 CNOTs + 7 T/T† |
| Native gates | ECR/CZ (superconducting), MS/ZZ (ions), CZ (atoms) |
| Two-qubit gate cost | About 10× the error of single-qubit gates |
| Width / depth / size | Qubits / time steps / total gates |
| Qiskit | `cx(c, t)`, `cz`, `swap`, `ccx`, `depth()`, `count_ops()` |
