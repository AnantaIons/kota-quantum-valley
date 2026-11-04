---
layout: ../../layouts/Post.astro
title: "Matrices and unitary operations"
description: "How a matrix acts on a vector, why the order of gates matters, the conjugate transpose, what makes a matrix unitary and why every quantum gate must be one, Hermitian matrices, and eigenvalues and eigenvectors worked by hand and in code."
date: 2026-11-04
category: lesson
lesson: 4

---

If a qubit's state is a vector (Lesson 3), then anything you **do** to a qubit is a **matrix**: a rule that takes the old vector and produces a new one. Quantum gates, whole circuits, even the passage of time in a physical qubit: all of them are matrices.

But not every matrix is allowed. Quantum mechanics only permits a special kind, called **unitary**. This lesson teaches you how matrices act, how to combine them, how to check whether one is unitary, and what eigenvalues are and why they appear in nearly every advanced algorithm.

## Matrix times vector

A 2×2 matrix acting on a 2-entry vector gives a new 2-entry vector. Each entry of the result is **one row of the matrix, multiplied entry by entry with the vector, and added up**:

```text
[ a  b ] [ x ]   [ a·x + b·y ]
[ c  d ] [ y ] = [ c·x + d·y ]
```

**Worked example: the Hadamard gate.** H = (1/√2)·[[1, 1], [1, −1]]. Apply it to |0⟩ = [1, 0]:

```text
H|0⟩ = (1/√2) [ 1·1 + 1·0  ]  = (1/√2) [ 1 ]  = (|0⟩ + |1⟩)/√2 = |+⟩
              [ 1·1 + (−1)·0 ]         [ 1 ]
```

And to |1⟩ = [0, 1]:

```text
H|1⟩ = (1/√2) [ 1·0 + 1·1  ]  = (1/√2) [  1 ]  = (|0⟩ − |1⟩)/√2 = |−⟩
              [ 1·0 + (−1)·1 ]         [ −1 ]
```

A useful shortcut: **the columns of a matrix are what it does to the basis states.** H's first column [1, 1]/√2 is H|0⟩, and its second column [1, −1]/√2 is H|1⟩. So if someone tells you what a gate does to |0⟩ and |1⟩, you can write its matrix immediately.

The same idea in Dirac notation: a gate can be written as a sum of outer products (Lesson 3), "send this input to that output". For the X (NOT) gate:

> X = |1⟩⟨0| + |0⟩⟨1|

Apply it to |0⟩: |1⟩⟨0|0⟩ + |0⟩⟨1|0⟩ = |1⟩·1 + |0⟩·0 = |1⟩. It reads like a sentence: "whatever was |0⟩ becomes |1⟩, and whatever was |1⟩ becomes |0⟩".

## Matrix times matrix: one gate after another

Applying gate A and then gate B to a state |ψ⟩ gives B(A|ψ⟩). Matrix multiplication lets you combine them into a single matrix first:

> B(A|ψ⟩) = (BA)|ψ⟩

To multiply two matrices, each entry of the result is **a row of the left matrix times a column of the right matrix**:

```text
[ a  b ] [ e  f ]   [ ae+bg  af+bh ]
[ c  d ] [ g  h ] = [ ce+dg  cf+dh ]
```

### Watch the order

Notice something that trips everyone up at first: **the gate applied first is written on the right.** A circuit diagram reads left to right (A, then B), but the matrix product reads right to left (BA). Think of it like functions: in f(g(x)), g happens first.

And unlike ordinary numbers, **order matters for matrices**: AB is usually not equal to BA. Take X = [[0, 1], [1, 0]] and Z = [[1, 0], [0, −1]]:

```text
XZ = [ 0·1+1·0   0·0+1·(−1) ]  = [ 0  −1 ]
     [ 1·1+0·0   1·0+0·(−1) ]    [ 1   0 ]

ZX = [ 1·0+0·1   1·1+0·0 ]     = [  0  1 ]
     [ 0·0+(−1)·1  0·1+(−1)·0 ]  [ −1  0 ]
```

They differ by a sign: XZ = −ZX. Physically, "flip then phase" is not the same as "phase then flip". This non-commutativity is one of the deepest features of quantum mechanics; it's behind the uncertainty principle.

### A surprising identity

Multiply out H·Z·H (so: H first, then Z, then H):

> HZH = X

Sandwiching Z between two Hadamards turns it into X. In words: **H swaps the roles of the 0/1 basis and the +/− basis**, so a phase flip in one basis becomes a bit flip in the other. You'll use this trick to build CNOT-like gates from CZ (Lesson 13) and to understand error correction (Part F).

## The conjugate transpose (dagger)

Lesson 3 turned a ket into a bra by flipping it and conjugating. You can do the same to a whole matrix: **swap rows and columns, and conjugate every entry.** This is the **conjugate transpose**, written A† ("A dagger").

```text
A = [ 1   2i ]          A† = [  1    3  ]
    [ 3   4  ]               [ −2i   4  ]
```

The 2i moved from top-right to bottom-left and became −2i. Two rules worth knowing: (A†)† = A, and **(AB)† = B†A†**, with the order reversed (just like putting on socks and shoes, then taking them off).

## Unitary matrices: the only gates nature allows

A matrix U is **unitary** if

> **U†U = I**

where I is the identity matrix [[1, 0], [0, 1]] (the matrix that does nothing). In words: **U† undoes U.** The inverse of a unitary is simply its dagger, which is easy to compute.

### Why every quantum gate must be unitary

There are three equivalent reasons, and each one says something real.

**1. Probabilities must keep adding up to 1.** A state has length 1. After a gate, it must still have length 1, or the probabilities wouldn't add to 1 any more. Unitary matrices are exactly the matrices that never change any vector's length:

> ⟨Uψ|Uψ⟩ = ⟨ψ|U†U|ψ⟩ = ⟨ψ|I|ψ⟩ = ⟨ψ|ψ⟩ = 1

**2. Distinguishable states stay distinguishable.** The same calculation with two different states shows ⟨Uφ|Uψ⟩ = ⟨φ|ψ⟩. If two states were orthogonal (perfectly distinguishable) before the gate, they still are afterwards. A gate can rotate the whole space, but it can't squash it.

**3. Quantum evolution is reversible.** Since U†U = I, every gate can be undone. This is why Lesson 1's irreversible AND gate can't be a quantum gate as it stands.

### A quick test: orthonormal columns

There's a fast way to check unitarity by eye. **A matrix is unitary exactly when its columns are orthonormal vectors**: each column has length 1, and every pair of different columns has inner product 0. (That's what U†U = I says, entry by entry.)

Check H: columns [1, 1]/√2 and [1, −1]/√2 each have length 1, and their inner product is (1 − 1)/2 = 0. ✓ Unitary.

Now try the matrix B = [[1, 1], [0, 0]]. Its columns are [1, 0] and [1, 0]: the same vector twice, so not orthogonal. ✗ Not unitary. Look at what it does: B|0⟩ = [1, 0] and B|1⟩ = [1, 0]. **Two different inputs give the same output**, so information is destroyed, exactly like the AND gate in Lesson 1.

### Code: checking unitarity

```python
import numpy as np
X = np.array([[0, 1], [1, 0]])
Z = np.array([[1, 0], [0, -1]])
H = np.array([[1, 1], [1, -1]]) / np.sqrt(2)

print(X @ Z)
print(Z @ X)
print(np.allclose(X @ Z, -(Z @ X)))

def is_unitary(U):
    return np.allclose(U.conj().T @ U, np.eye(len(U)))
B = np.array([[1, 1], [0, 0]])                # a "gate" that merges two states
print(is_unitary(X), is_unitary(H), is_unitary(B))
print(B @ [1, 0], B @ [0, 1])
```

```text
[[ 0 -1]
 [ 1  0]]
[[ 0  1]
 [-1  0]]
True
True True False
[1 0] [1 0]
```

`U.conj().T` is the dagger: conjugate, then transpose. `np.allclose` compares with a tiny tolerance for rounding errors.

## Hermitian matrices: the questions you can ask

A matrix is **Hermitian** if it equals its own dagger: **A† = A**. (Its diagonal entries must be real, and the entry across the diagonal from each one must be its conjugate.)

X and Z are both Hermitian *and* unitary. Hermitian matrices play a different role from unitary ones:

| Kind | Rule | Role in quantum computing |
|---|---|---|
| Unitary | U†U = I | **Actions**: gates, things you do to a state |
| Hermitian | A† = A | **Observables**: quantities you measure, like energy or "0 or 1" |

The reason Hermitian matrices describe measurements is the next topic: their eigenvalues are always **real numbers**, and the result of a measurement must be a real number.

## Eigenvalues and eigenvectors

Most vectors change direction when a matrix acts on them. But some special vectors only get **multiplied by a number**:

> A|v⟩ = λ|v⟩

Such a |v⟩ is an **eigenvector** of A, and the number λ (lambda) is its **eigenvalue**. ("Eigen" is German for "own": the matrix's own directions.)

**Z's eigenvectors** are easy to spot:

```text
Z|0⟩ = [ 1  0 ][1] = [1] = +1·|0⟩     eigenvalue +1
       [ 0 −1 ][0]   [0]
Z|1⟩ = [ 1  0 ][0] = [ 0] = −1·|1⟩    eigenvalue −1
       [ 0 −1 ][1]   [−1]
```

**X's eigenvectors** are |+⟩ and |−⟩:

```text
X|+⟩ = (1/√2)[0·1+1·1, 1·1+0·1] = (1/√2)[1, 1] = +1·|+⟩
X|−⟩ = (1/√2)[0·1+1·(−1), 1·1+0·(−1)] = (1/√2)[−1, 1] = −1·|−⟩
```

Here's the physical meaning. When you **measure an observable** (a Hermitian matrix), the possible results are its **eigenvalues**, and right after the measurement the qubit is in the matching **eigenvector**. Measuring Z gives +1 (and leaves |0⟩) or −1 (and leaves |1⟩). That's just the ordinary "0 or 1" measurement, with the outcomes labelled +1 and −1 instead. Measuring X is the "+ or −" measurement.

### Finding eigenvalues by hand

For a 2×2 matrix, the eigenvalues are the solutions of

> det(A − λI) = 0

where det[[a, b], [c, d]] = ad − bc. For X:

```text
det [ −λ   1 ]  = (−λ)(−λ) − 1·1 = λ² − 1 = 0   →   λ = +1 or −1
    [  1  −λ ]
```

Then for each λ, solve (A − λI)|v⟩ = 0 to find the eigenvector. For λ = +1 that gives v₁ = v₂, so |v⟩ ∝ [1, 1], which normalises to |+⟩.

### Eigenvalues of unitaries are phases

Since a unitary never changes length, if U|v⟩ = λ|v⟩ then |λ| must be 1. So **every eigenvalue of a unitary is a phase e^(iθ)** (Lesson 2). For example, the S gate = [[1, 0], [0, i]] has eigenvalues 1 and i, which are e^(i·0) and e^(iπ/2).

This fact powers one of the most important algorithms: **quantum phase estimation** (Lesson 27) finds the angle θ hidden in a unitary's eigenvalue e^(iθ). Shor's factoring algorithm and quantum chemistry are both phase estimation in disguise.

### Code: eigenvalues

```python
import numpy as np
X = np.array([[0, 1], [1, 0]])
vals, vecs = np.linalg.eig(X)
print(np.round(vals, 4))
print(np.round(vecs, 4))
S = np.array([[1, 0], [0, 1j]])
print(np.round(np.linalg.eigvals(S), 4))
```

```text
[ 1.+0.j -1.+0.j]
[[ 0.7071+0.j -0.7071+0.j]
 [ 0.7071+0.j  0.7071+0.j]]
[1.+0.j 0.+1.j]
```

The eigenvectors are the **columns** of `vecs`. The first is [0.7071, 0.7071] = |+⟩, as expected. The second is [−0.7071, 0.7071], which is −|−⟩. That's |−⟩ multiplied by −1, a global phase (Lesson 2): any multiple of an eigenvector is still an eigenvector, and it's the same physical state.

## Circuits are matrices: proving HZH = X in Qiskit

Qiskit can turn any circuit into its matrix with `Operator`. Here's the identity from earlier, checked:

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Operator
qc = QuantumCircuit(1)
qc.h(0)
qc.z(0)
qc.h(0)
U = Operator(qc)
print(np.round(U.data.real, 4))
print(U.equiv(Operator.from_label('X')))
print(U.is_unitary())
```

```text
[[0. 1.]
 [1. 0.]]
True
True
```

The circuit's matrix is exactly X. `equiv` checks equality up to a global phase, which is the right test for "same physical gate".

## Looking ahead: bigger matrices

Everything here works for any size. Two qubits use 4×4 matrices, n qubits use 2ⁿ × 2ⁿ. The rule for building a big matrix out of small ones, for example "X on the first qubit and nothing on the second", is the **tensor product**, X ⊗ I, which Lesson 12 teaches. And rotations by any angle, like "rotate by θ around the x-axis", are matrices of the form cos(θ/2)·I − i·sin(θ/2)·X, which Lesson 11 builds.

## Try it

1. Compute H|+⟩ and H|−⟩. What does H do when applied twice?
2. Multiply Z·Z and X·X. What do you get, and what does it mean physically?
3. Find S† for S = [[1, 0], [0, i]], and check that S†S = I.
4. Is [[1, 0], [0, 2]] unitary? Is [[0, i], [i, 0]] unitary? (Use the column test.)
5. Find the eigenvalues of Y = [[0, −i], [i, 0]] using det(Y − λI) = 0.
6. Write the matrix of the gate that does |0⟩ → |1⟩ and |1⟩ → −|0⟩. Is it unitary?

**Answers:**

1. H|+⟩ = |0⟩ and H|−⟩ = |1⟩. So HH = I: H is its own inverse.
2. Both give I. Flipping twice, or phase-flipping twice, does nothing.
3. S† = [[1, 0], [0, −i]]. S†S = [[1, 0], [0, (−i)(i)]] = [[1, 0], [0, 1]]. ✓
4. No: the second column has length 2. Yes: columns [0, i] and [i, 0] each have length 1 and inner product 0·i + (−i)·0 = 0.
5. det [[−λ, −i], [i, −λ]] = λ² − (−i)(i) = λ² − 1 = 0, so λ = ±1. (Y is Hermitian, so real eigenvalues, as promised.)
6. Columns are the outputs: first column [0, 1], second [−1, 0], so [[0, −1], [1, 0]]. Columns orthonormal: yes, unitary. (It's the XZ you computed earlier.)

## Cheat sheet

| Idea | Rule |
|---|---|
| Matrix × vector | Each output entry = row · vector |
| Columns | Column k = what the matrix does to basis state k |
| As outer products | X = \|1⟩⟨0\| + \|0⟩⟨1\| |
| Gate A then B | Matrix BA (first gate on the right) |
| Order matters | XZ = −ZX |
| Basis swap | HZH = X; H swaps 0/1 and +/− |
| Dagger | A† = conjugate transpose; (AB)† = B†A† |
| Unitary | U†U = I; inverse is U† |
| Why gates are unitary | Keeps length 1, keeps distinguishability, reversible |
| Column test | Unitary ⇔ columns orthonormal |
| Hermitian | A† = A; real eigenvalues; observables |
| Eigen equation | A\|v⟩ = λ\|v⟩ |
| Finding λ (2×2) | det(A − λI) = 0 |
| Z eigen | \|0⟩: +1, \|1⟩: −1 |
| X eigen | \|+⟩: +1, \|−⟩: −1 |
| Unitary eigenvalues | Always phases e^(iθ) |
| Measurement | Results are eigenvalues; state becomes the eigenvector |
| In code | `U.conj().T`, `np.linalg.eig`, Qiskit `Operator(qc)` |
