---
layout: ../../layouts/Post.astro
title: "Single-qubit gates: X, Y, Z, H, S, T"
description: "Every standard single-qubit gate: its matrix, what it does to |0⟩ and |+⟩, and the rotation it makes on the Bloch sphere. The Pauli gates and their algebra, the Hadamard as a basis swap, the phase gates S and T, and the identities you'll use for the rest of the course, all checked in Qiskit."
date: 2026-11-04
category: lesson
lesson: 9

---

You now have the two pictures of a qubit: a vector of two amplitudes (Lesson 6) and a point on the Bloch sphere (Lesson 7). This lesson adds the actions. A **gate** is a unitary matrix (Lesson 4), and on the Bloch sphere **every single-qubit gate is a rotation** of the sphere about some axis.

There are only six gates you need to know by heart: **X, Y, Z, H, S and T.** For each one you'll learn three things: its matrix, what it does to the basis states, and the rotation it makes. Then you'll learn the identities that connect them, because real circuits are full of tricks that rely on them.

## The Pauli gates: half-turns about the three axes

The three **Pauli matrices**, named after Wolfgang Pauli, are the most important gates in quantum computing. Each one is a **180° rotation** of the Bloch sphere about one of the three axes.

### X: the bit flip

```text
X = [ 0  1 ]        X|0⟩ = |1⟩
    [ 1  0 ]        X|1⟩ = |0⟩
```

X is the quantum NOT gate from Lesson 1. On the sphere it rotates 180° about the **x-axis**: the North and South Poles swap. Points on the x-axis stay put: X|+⟩ = |+⟩ and X|−⟩ = −|−⟩ (the minus sign is a global phase, so |−⟩ is the same physical state). That's just Lesson 4's eigenvector statement, seen as a picture.

### Z: the phase flip

```text
Z = [ 1   0 ]       Z|0⟩ =  |0⟩
    [ 0  −1 ]       Z|1⟩ = −|1⟩
```

Z leaves |0⟩ alone and puts a minus sign on |1⟩. On the sphere, it rotates 180° about the **z-axis**, so the poles don't move, but the equator turns half a circle: |+⟩ ↔ |−⟩ and |+i⟩ ↔ |−i⟩.

This is a gate with **no classical counterpart**. Measuring in the 0/1 basis can't tell whether Z was applied, because it doesn't change |α|² or |β|². It only changes the relative phase, which shows up as soon as you interfere the amplitudes (Lesson 10).

### Y: both at once

```text
Y = [ 0  −i ]       Y|0⟩ =  i|1⟩
    [ i   0 ]       Y|1⟩ = −i|0⟩
```

Y rotates 180° about the **y-axis**. It flips the poles like X does, and also flips the phase. In fact Y = iXZ: up to a phase, it's "Z then X".

### The Pauli algebra

These three matrices obey a short set of rules that you'll use constantly:

| Rule | Meaning |
|---|---|
| X² = Y² = Z² = I | Two half-turns about the same axis do nothing |
| XY = iZ, YZ = iX, ZX = iY | Multiplying two gives the third (times i) |
| XZ = −ZX, and so on | Different Paulis **anticommute**: swapping order flips the sign |
| All three are Hermitian and unitary | Each is both a gate and an observable |

The anticommutation rule is what makes error correction work (Lesson 34): an X error can be detected by measuring Z-type checks precisely because X and Z anticommute.

## The Hadamard gate: swapping the two bases

```text
H = 1/√2 [ 1   1 ]      H|0⟩ = |+⟩      H|+⟩ = |0⟩
         [ 1  −1 ]      H|1⟩ = |−⟩      H|−⟩ = |1⟩
```

H is the gate that **creates superposition** from a basis state, and it's in nearly every quantum algorithm. On the sphere, it's a 180° rotation about the **diagonal axis halfway between x and z**. That swaps the North Pole with +x, and the South Pole with −x.

The most useful way to think of H: **it swaps the 0/1 basis with the +/− basis.** Anything you know about one basis, H translates into the other. That gives these identities:

```text
HXH = Z      HZH = X      HYH = −Y      HH = I
```

Read HXH = Z as: "a bit flip, seen through Hadamard glasses, is a phase flip". This is how you measure in the x-basis (Lesson 8), how a CZ gate turns into a CNOT (Lesson 13), and why the bit-flip and phase-flip error-correcting codes are mirror images of each other (Part F).

## The phase gates: S and T

Z rotates the equator by 180°. Smaller rotations about the z-axis are also extremely useful.

### S: a quarter turn

```text
S = [ 1  0 ]        S|0⟩ = |0⟩,   S|1⟩ = i|1⟩
    [ 0  i ]        S|+⟩ = |+i⟩   (a quarter turn around the equator)
```

S rotates **90°** about the z-axis. Two of them make a Z: SS = Z, so S is sometimes called √Z. Its inverse is S† = [[1, 0], [0, −i]], which you used in Lesson 8 to measure in the y-basis.

### T: an eighth of a turn

```text
T = [ 1     0      ]        T|1⟩ = e^(iπ/4)|1⟩
    [ 0  e^(iπ/4)  ]
```

T rotates **45°** about the z-axis. TT = S, and four T's make a Z. Its inverse is T†.

T looks like a minor gate, but it's one of the most important in the field. The gates H, S and CNOT on their own can't do everything: circuits made only from them (called **Clifford circuits**) can be simulated efficiently on an ordinary computer. **Adding T makes the set universal** (Lesson 17). And in an error-corrected computer, T is by far the most expensive gate to perform (Lesson 35), so algorithm designers count "T gates" the way engineers count transistors.

### The general phase gate

S, T and Z are all members of one family:

```text
P(λ) = [ 1     0     ]      Z = P(π),  S = P(π/2),  T = P(π/4)
       [ 0  e^(iλ)   ]
```

P(λ) rotates by λ about the z-axis. Lesson 10 explores what phase rotations do, and Lesson 11 adds rotations about the other axes.

## All six gates in one table

| Gate | Matrix | Rotation on the Bloch sphere | \|0⟩ becomes | \|+⟩ becomes |
|---|---|---|---|---|
| X | [[0, 1], [1, 0]] | 180° about x | \|1⟩ | \|+⟩ |
| Y | [[0, −i], [i, 0]] | 180° about y | i\|1⟩ | −i\|−⟩ (same as \|−⟩) |
| Z | [[1, 0], [0, −1]] | 180° about z | \|0⟩ | \|−⟩ |
| H | [[1, 1], [1, −1]]/√2 | 180° about (x+z)/√2 | \|+⟩ | \|0⟩ |
| S | [[1, 0], [0, i]] | 90° about z | \|0⟩ | \|+i⟩ |
| T | [[1, 0], [0, e^(iπ/4)]] | 45° about z | \|0⟩ | 45° round the equator |

### Code: every gate on the Bloch sphere

This applies each gate to |0⟩ and to |+⟩ and prints the Bloch vector (x, y, z) of the result, using the `bloch` function from Lesson 7.

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, SparsePauliOp

def bloch(qc):
    s = Statevector(qc)
    return [round(float(s.expectation_value(SparsePauliOp(p)).real), 3) + 0.0 for p in "XYZ"]

for gate in ["x", "y", "z", "h", "s", "t"]:
    row = []
    for start in ["0", "+"]:
        qc = QuantumCircuit(1)
        if start == "+":
            qc.h(0)
        getattr(qc, gate)(0)            # apply the gate by name
        row.append(bloch(qc))
    print(f"{gate.upper()}:  from |0> -> {row[0]}   from |+> -> {row[1]}")
```

```text
X:  from |0> -> [0.0, 0.0, -1.0]   from |+> -> [1.0, 0.0, 0.0]
Y:  from |0> -> [0.0, 0.0, -1.0]   from |+> -> [-1.0, 0.0, 0.0]
Z:  from |0> -> [0.0, 0.0, 1.0]   from |+> -> [-1.0, 0.0, 0.0]
H:  from |0> -> [1.0, 0.0, 0.0]   from |+> -> [0.0, 0.0, 1.0]
S:  from |0> -> [0.0, 0.0, 1.0]   from |+> -> [0.0, 1.0, 0.0]
T:  from |0> -> [0.0, 0.0, 1.0]   from |+> -> [0.707, 0.707, 0.0]
```

Read the table against the rotations. Z, S and T leave the North Pole (0, 0, 1) where it is, because they rotate about the z-axis. Starting from |+⟩ = (1, 0, 0), they turn it around the equator by 180°, 90° and 45°: to (−1, 0, 0), (0, 1, 0) and (0.707, 0.707, 0). (The `+ 0.0` in the code just turns any −0.0 into 0.0 for tidy printing.)

## The identities, verified

Here are the identities from this lesson, each checked by comparing the circuit's matrix with the expected one. `Operator(a) == Operator(b)` tests exact equality.

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Operator

def op(*gates):
    """The matrix of a one-qubit circuit that applies the named gates in order."""
    qc = QuantumCircuit(1)
    for g in gates:
        getattr(qc, g)(0)
    return Operator(qc)

print("HXH = Z :", op("h", "x", "h") == op("z"))
print("HZH = X :", op("h", "z", "h") == op("x"))
print("SS  = Z :", op("s", "s") == op("z"))
print("TT  = S :", op("t", "t") == op("s"))
print("S Sdg = I:", op("s", "sdg") == op())
print("XY = iZ :", np.allclose(op("y", "x").data, 1j * op("z").data))   # Y first, then X

qc = QuantumCircuit(1)
qc.h(0)
qc.t(0)
qc.h(0)
qc.measure_all()
print(qc.draw("text"))
```

```text
HXH = Z : True
HZH = X : True
SS  = Z : True
TT  = S : True
S Sdg = I: True
XY = iZ : True
        ┌───┐┌───┐┌───┐ ░ ┌─┐
     q: ┤ H ├┤ T ├┤ H ├─░─┤M├
        └───┘└───┘└───┘ ░ └╥┘
meas: 1/═══════════════════╩═
                           0
```

Notice the comment on the last identity: the circuit "Y then X" has matrix X·Y, because the first gate goes on the right (Lesson 4). The drawing at the end is how Qiskit shows circuits: time runs left to right, each horizontal line is a qubit, boxes are gates, and the meter symbol is a measurement whose result is stored in the classical bit below. You'll see that H–T–H sandwich again in Lesson 10, where it turns a phase into a measurable probability.

## Reading circuits by following the sphere

With these rotations in your head, you can predict short circuits without any algebra. Try this one: **H, then S, then H**, starting from |0⟩.

1. H: North Pole → +x, the front of the equator.
2. S: a quarter turn about z → +y, the right side.
3. H: the rotation about the (x+z) diagonal leaves y pointing the opposite way (that's HYH = −Y) → −y.

So H·S·H turns |0⟩ into |−i⟩, and measuring in the 0/1 basis gives 50/50. You can check it in the [Quantum Lab](/lab/): apply H, S, H on the Bloch sphere and watch the arrow.

## Try it

1. What does X do to |+i⟩? Use the rotation picture, then check with the matrix.
2. Show that ZXZ = −X by multiplying the matrices, and explain it with anticommutation.
3. What single gate equals TTTT? And SSSS?
4. Starting from |0⟩, which point does the circuit H, T, T reach? Is it a landmark state?
5. Predict the Bloch vector after H, Z, H starting from |0⟩, using HZH = X.
6. Why can't a measurement in the 0/1 basis tell whether a Z gate was applied to |0⟩ or |1⟩? Could it tell for |+⟩?

**Answers:**

1. Rotating 180° about x sends +y to −y, so X|+i⟩ = |−i⟩ (up to a global phase). Matrix: X(|0⟩ + i|1⟩)/√2 = (|1⟩ + i|0⟩)/√2 = i(|0⟩ − i|1⟩)/√2 = i|−i⟩. ✓
2. ZXZ = Z(XZ) = Z(−ZX) = −ZZX = −X. The two Z's cancel after X is moved past one of them, picking up a minus sign.
3. TTTT = Z. SSSS = I (a full turn).
4. H gives |+⟩, and TT = S turns it 90° to **|+i⟩**: a landmark state.
5. HZH = X, so it's X|0⟩ = |1⟩: Bloch vector **(0, 0, −1)**.
6. Z only multiplies |1⟩ by −1, which is a global phase on |0⟩ or |1⟩ alone, so nothing changes. For |+⟩ it's a relative phase: Z|+⟩ = |−⟩, which a 0/1 measurement still can't see (both are 50/50), but an x-basis measurement can.

## Cheat sheet

| Gate | Matrix | Bloch rotation | Key facts |
|---|---|---|---|
| X | [[0, 1], [1, 0]] | 180° about x | Bit flip; quantum NOT |
| Y | [[0, −i], [i, 0]] | 180° about y | Bit and phase flip; Y = iXZ |
| Z | [[1, 0], [0, −1]] | 180° about z | Phase flip; no classical twin |
| H | [[1, 1], [1, −1]]/√2 | 180° about (x+z)/√2 | Makes superposition; swaps 0/1 and +/− |
| S | [[1, 0], [0, i]] | 90° about z | SS = Z; S\|+⟩ = \|+i⟩ |
| T | [[1, 0], [0, e^(iπ/4)]] | 45° about z | TT = S; makes gate sets universal |
| P(λ) | [[1, 0], [0, e^(iλ)]] | λ about z | Z = P(π), S = P(π/2), T = P(π/4) |

| Identity | Use |
|---|---|
| X² = Y² = Z² = H² = I | Each undoes itself |
| XY = iZ, YZ = iX, ZX = iY | Products of Paulis |
| XZ = −ZX | Paulis anticommute (basis of error detection) |
| HXH = Z, HZH = X | Hadamard swaps bit flips and phase flips |
| HYH = −Y | Y flips direction under H |
| Clifford gates | H, S, CNOT: easy to simulate classically |
| + T | Universal; T is the costly gate in error correction |
