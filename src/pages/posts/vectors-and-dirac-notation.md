---
layout: ../../layouts/Post.astro
title: "Vectors and Dirac notation"
description: "Complex vectors, the inner product and why it needs a conjugate, length and normalisation, orthonormal bases, kets and bras, changing basis between |0⟩, |1⟩ and |+⟩, |−⟩, and the outer product. The language every later lesson is written in."
date: 2026-11-04
category: lesson
lesson: 3

---

A qubit's state is a vector. That one sentence is the reason this lesson exists. If you understand vectors with complex entries, and the special notation physicists use for them, then every formula in the rest of the course will read like a sentence instead of a puzzle.

We'll build it in five steps: vectors, the inner product, length, bases, and finally **Dirac notation** (kets, bras and brackets), which is just a compact way of writing all of the above.

## Step 1: vectors are lists of numbers

In school, a vector is an arrow with a length and a direction, like a velocity. Written down, it's a list of numbers: the arrow from the origin to the point (3, 4) is the vector [3, 4].

In quantum computing:

- Vectors are written as **columns** (we'll write [3, 4] on one line to save space, but think of it as standing up).
- The entries can be **complex numbers**.
- The length of the list is the number of possible measurement outcomes: **2** for one qubit, **4** for two, **2ⁿ** for n.

Two operations work exactly as you'd expect, entry by entry:

```text
Adding:            [1, 2] + [3, −1] = [4, 1]
Scaling by a number:  2i × [1, 3]  = [2i, 6i]
```

A combination like a·[1, 0] + b·[0, 1] = [a, b] is called a **linear combination**. A qubit state is always a linear combination of the two basic states, with complex weights. That's what "superposition" means mathematically.

## Step 2: the inner product, and why it needs a conjugate

For ordinary real vectors, the **dot product** multiplies matching entries and adds:

```text
[1, 2] · [3, 4] = 1×3 + 2×4 = 11
```

It measures how much two vectors point in the same direction. It's zero when they're at right angles, and the dot product of a vector with itself is its length squared: [3, 4] · [3, 4] = 9 + 16 = 25, so the length is 5.

With **complex** entries, the plain dot product breaks. Take v = [1, i]. Then v · v = 1×1 + i×i = 1 + (−1) = 0. A non-zero vector with "length zero"? That's nonsense.

The fix is to **conjugate the first vector** before multiplying. This is the **inner product**:

> ⟨a, b⟩ = a₁* b₁ + a₂* b₂ + … (conjugate every entry of a)

Now try v = [1, i] again:

```text
⟨v, v⟩ = 1*·1 + i*·i = 1·1 + (−i)·i = 1 + 1 = 2
```

Each term is z*·z = |z|², which is always real and never negative (Lesson 2). So the inner product of a vector with itself is always a real, non-negative number: a sensible "length squared".

Two properties to know:

- **Order matters, a little:** ⟨b, a⟩ = ⟨a, b⟩*. Swapping gives the conjugate.
- **Zero means perpendicular:** if ⟨a, b⟩ = 0, the vectors are **orthogonal**. For quantum states this means something physical: the two states can be told apart perfectly by one measurement.

## Step 3: length and normalisation

The **length** (also called the **norm**) of a vector is

> ‖v‖ = √⟨v, v⟩ = √(|v₁|² + |v₂|² + …)

A quantum state must have **length exactly 1**. Why? Because the squared sizes of the entries are the probabilities of the outcomes (Lesson 8), and probabilities must add up to 1:

> |v₁|² + |v₂|² + … = 1

A vector with length 1 is called **normalised**. If you have a vector pointing in the right direction but with the wrong length, divide by its length:

```text
v = [1, i]        ‖v‖ = √2
v / ‖v‖ = [1/√2, i/√2]       now |1/√2|² + |i/√2|² = ½ + ½ = 1 ✓
```

Another example: [3, 4i] has length √(9 + 16) = 5, so the normalised state is [3/5, 4i/5]. Its probabilities are 9/25 = 0.36 and 16/25 = 0.64.

## Step 4: bases

A **basis** is a set of vectors you can build every other vector from. For one qubit, the standard choice is

```text
[1, 0]  and  [0, 1]
```

because any [a, b] = a·[1, 0] + b·[0, 1]. These two are **orthonormal**: each has length 1, and they're orthogonal to each other. In quantum computing this is called the **computational basis**, and it's what the computer measures by default.

But it's not the only basis. Here's another orthonormal pair, which you'll meet constantly:

```text
[1/√2,  1/√2]   and   [1/√2, −1/√2]
```

Check: each has length √(½ + ½) = 1. Their inner product is ½ − ½ = 0. So they're orthonormal too, and they also form a basis. They're the same two directions, rotated by 45°.

**Different bases are different questions you can ask a qubit.** Measuring in the first basis asks "0 or 1?". Measuring in the second asks a different question, and the answers can be completely random for one basis and completely certain for the other. Lesson 8 develops this, and Lesson 41 shows how quantum key distribution uses it to catch eavesdroppers.

## Step 5: Dirac notation

Everything above is ordinary linear algebra. Physicists added one piece of notation, invented by Paul Dirac in 1939, that makes it much quicker to write. Here's all of it.

### Kets: column vectors

A **ket** is a column vector, written with a vertical bar and an angle bracket: |name⟩. The name inside is just a label.

```text
|0⟩ = [1, 0]           |1⟩ = [0, 1]
|+⟩ = [1/√2,  1/√2]    |−⟩ = [1/√2, −1/√2]
```

So a general qubit is

> |ψ⟩ = α|0⟩ + β|1⟩ = [α, β]

(ψ, "psi", is the traditional name for a general state.) Notice: **|0⟩ is not the zero vector.** It's the state "the qubit is 0", which is the vector [1, 0]. The zero vector [0, 0] is not a valid state at all.

### Bras: conjugated rows

A **bra** is the ket turned on its side **and conjugated**:

> if |ψ⟩ = [α, β] (a column), then ⟨ψ| = [α*, β*] (a row)

This "flip and conjugate" is called the **conjugate transpose** or **dagger**, written †: ⟨ψ| = |ψ⟩†.

### Brackets: the inner product

Put a bra next to a ket and you get a **bra-ket**, or **bracket**: a row times a column, which is just a number.

> ⟨φ|ψ⟩ = φ₁*ψ₁ + φ₂*ψ₂

That's exactly the inner product from Step 2, with the conjugate built in automatically by the bra. (The joke in the name is that "bracket" splits into "bra" and "ket".)

Some brackets worth working out by hand:

```text
⟨0|0⟩ = 1·1 + 0·0 = 1           (normalised)
⟨0|1⟩ = 1·0 + 0·1 = 0           (orthogonal)
⟨+|−⟩ = (1/√2)(1/√2) + (1/√2)(−1/√2) = ½ − ½ = 0
⟨0|+⟩ = 1·(1/√2) + 0·(1/√2) = 1/√2
```

### Reading off amplitudes

Here's why brackets are so useful. For |ψ⟩ = α|0⟩ + β|1⟩:

> ⟨0|ψ⟩ = α  and  ⟨1|ψ⟩ = β

The bracket with a basis state **pulls out that amplitude**. And more generally:

> **|⟨φ|ψ⟩|² = the probability that a qubit in state |ψ⟩ is found in state |φ⟩**, when you measure in a basis containing |φ⟩.

This one formula is the heart of quantum measurement. It says the probability is the **squared overlap** between where the state is and what you're asking about. Lesson 8 builds on it.

**Worked example.** Let |ψ⟩ = (|0⟩ + i|1⟩)/√2. What's the chance of finding it in |+⟩?

```text
⟨+|ψ⟩ = (1/√2)*·(1/√2) + (1/√2)*·(i/√2)
      = ½ + i/2
|⟨+|ψ⟩|² = (½)² + (½)² = ½
```

So 50%. (The conjugate on ⟨+| does nothing here because its entries are real, but it matters whenever the bra has complex entries.)

### Changing basis

Since |+⟩ = (|0⟩ + |1⟩)/√2 and |−⟩ = (|0⟩ − |1⟩)/√2, you can add and subtract them to go back:

```text
|+⟩ + |−⟩ = (2/√2)|0⟩ = √2|0⟩     so   |0⟩ = (|+⟩ + |−⟩)/√2
|+⟩ − |−⟩ = (2/√2)|1⟩ = √2|1⟩     so   |1⟩ = (|+⟩ − |−⟩)/√2
```

Read the first line physically: **|0⟩, which is completely certain in the 0/1 question, is a 50/50 superposition in the +/− question.** A state isn't "in superposition" or "not in superposition" on its own. It depends on which basis you describe it in. This surprises almost everyone, and it's worth sitting with for a minute.

### Outer products: making matrices from vectors

A ket times a bra, in that order, is a column times a row. That makes a **matrix**:

```text
|0⟩⟨0| = [1] × [1, 0] = [ 1  0 ]
         [0]            [ 0  0 ]
```

This is called an **outer product**. |0⟩⟨0| is the **projector** onto |0⟩: applied to any state, it keeps the |0⟩ part and throws away the rest.

```text
|0⟩⟨0| (α|0⟩ + β|1⟩) = α|0⟩⟨0|0⟩ + β|0⟩⟨0|1⟩ = α|0⟩·1 + β|0⟩·0 = α|0⟩
```

Notice how the algebra works by just sliding brackets together: |0⟩⟨0|0⟩ = |0⟩(⟨0|0⟩) = |0⟩·1. That's the real power of Dirac notation: you can often compute without writing a single matrix. Projectors describe measurement (Lesson 8), and every gate can be written as a sum of outer products (Lesson 4).

## Code: inner products in NumPy and Qiskit

In NumPy, `np.vdot(a, b)` computes ⟨a|b⟩, conjugating the first vector for you.

```python
import numpy as np
ket0 = np.array([1, 0])
ket1 = np.array([0, 1])
plus  = (ket0 + ket1) / np.sqrt(2)
minus = (ket0 - ket1) / np.sqrt(2)
psi   = np.array([1, 1j]) / np.sqrt(2)

# np.vdot(a, b) conjugates a first, so it computes <a|b>
print(round(abs(np.vdot(plus, minus)), 6))      # |<+|->|
print(round(abs(np.vdot(plus, plus)), 6))       # |<+|+>|
print(round(abs(np.vdot(psi, psi)), 6))         # |<psi|psi>|
print(round(abs(np.vdot(plus, psi)) ** 2, 6))   # |<+|psi>|^2
print(np.round(np.vdot(plus, psi), 4))          # <+|psi> itself
```

```text
0.0
1.0
1.0
0.5
(0.5+0.5j)
```

The last line matches the worked example: ⟨+|ψ⟩ = ½ + i/2.

The outer product, as a projector:

```python
import numpy as np
ket0 = np.array([1, 0])
psi = np.array([3, 4j]) / 5
P0 = np.outer(ket0, ket0.conj())     # |0><0|
print(P0)
print(P0 @ psi)
print(abs(np.vdot(ket0, psi))**2)
```

```text
[[1 0]
 [0 0]]
[0.6+0.j 0. +0.j]
0.3600000000000001
```

The projector kept only the |0⟩ part (amplitude 3/5 = 0.6), and the chance of finding |0⟩ is 0.36 (the extra digits are rounding). Qiskit has the same tools built in. Its `Statevector.from_label` knows the common states by single letters: '0', '1', '+', '−' (written '-'), and 'r' and 'l' for (|0⟩ ± i|1⟩)/√2.

```python
import numpy as np
from qiskit.quantum_info import Statevector
a = Statevector.from_label('+')      # (|0> + |1>)/sqrt(2)
b = Statevector.from_label('r')      # (|0> + i|1>)/sqrt(2)
print(np.round(a.inner(b), 4))       # <a|b>
print(round(abs(a.inner(b)) ** 2, 4))
print(b.probabilities().round(4))    # P(0), P(1) for b
```

```text
(0.5+0.5j)
0.5
[0.5 0.5]
```

## Try it

1. Compute ⟨v, v⟩ for v = [2, −i] and normalise v.
2. Show that ⟨−|−⟩ = 1 and ⟨0|−⟩ = 1/√2.
3. For |ψ⟩ = (3|0⟩ − 4i|1⟩)/5, find ⟨1|ψ⟩ and the probability of measuring 1.
4. Write ⟨ψ| as a row for |ψ⟩ = (|0⟩ + i|1⟩)/√2. (Careful with the conjugate.)
5. Write |1⟩⟨1| as a matrix, and check that |0⟩⟨0| + |1⟩⟨1| is the identity matrix.
6. Express |−⟩ in terms of |0⟩ and |1⟩, and |1⟩ in terms of |+⟩ and |−⟩.

**Answers:**

1. 2*·2 + (−i)*·(−i) = 4 + (i)(−i) = 4 + 1 = 5. Normalised: [2/√5, −i/√5].
2. ⟨−|−⟩ = ½ + (−1/√2)(−1/√2) = ½ + ½ = 1. ⟨0|−⟩ = 1·(1/√2) + 0 = 1/√2.
3. ⟨1|ψ⟩ = −4i/5. Probability |−4i/5|² = 16/25 = 0.64.
4. ⟨ψ| = [1/√2, −i/√2]: the i becomes −i.
5. |1⟩⟨1| = [[0, 0], [0, 1]]. Adding [[1, 0], [0, 0]] gives [[1, 0], [0, 1]] = I. (This is called a **completeness relation**: the projectors onto a basis add up to "do nothing".)
6. |−⟩ = (|0⟩ − |1⟩)/√2. |1⟩ = (|+⟩ − |−⟩)/√2.

## Cheat sheet

| Idea | Notation | Meaning |
|---|---|---|
| Ket | \|ψ⟩ | Column vector: the state |
| Basis states | \|0⟩ = [1, 0], \|1⟩ = [0, 1] | The computational basis |
| Hadamard basis | \|±⟩ = (\|0⟩ ± \|1⟩)/√2 | Another orthonormal basis |
| General qubit | \|ψ⟩ = α\|0⟩ + β\|1⟩ | Superposition with complex weights |
| Bra | ⟨ψ\| = \|ψ⟩† | Conjugated row vector |
| Inner product | ⟨φ\|ψ⟩ = Σ φᵢ* ψᵢ | Overlap; a number |
| Swap order | ⟨ψ\|φ⟩ = ⟨φ\|ψ⟩* | Gives the conjugate |
| Normalised | ⟨ψ\|ψ⟩ = 1 | Required for every state |
| Orthogonal | ⟨φ\|ψ⟩ = 0 | Perfectly distinguishable |
| Amplitude | ⟨0\|ψ⟩ = α | Bracket pulls out a component |
| Probability | \|⟨φ\|ψ⟩\|² | Chance of finding \|ψ⟩ in \|φ⟩ |
| Outer product | \|ψ⟩⟨φ\| | A matrix |
| Projector | \|0⟩⟨0\| | Keeps only the \|0⟩ part |
| Completeness | \|0⟩⟨0\| + \|1⟩⟨1\| = I | Basis projectors add to identity |
| NumPy | `np.vdot(a, b)` | ⟨a\|b⟩ |
| Qiskit | `Statevector.from_label('+')`, `.inner()` | Ready-made states and brackets |
