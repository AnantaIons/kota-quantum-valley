---
layout: ../../layouts/Post.astro
title: "Many qubits and the tensor product"
description: "How qubits combine into one bigger state, the tensor product of vectors and matrices, the 2ⁿ amplitudes of n qubits, Qiskit's reversed bit order (the most common beginner bug), a test that tells product states from entangled ones, Hadamards on every qubit, measuring only some qubits, and why 2ⁿ amplitudes don't mean 2ⁿ answers."
date: 2026-11-04
category: lesson
lesson: 12

---

Everything so far has been about one qubit. One qubit is a nice toy, but it can't compute anything a coin can't. The power of quantum computing appears when qubits are **combined**, because the combined state isn't just a list of the individual states. It's something much bigger.

This lesson teaches the rule for combining qubits, the **tensor product**. It's a simple rule, but it has three consequences that run through the rest of the course: the number of amplitudes doubles with each qubit, some combined states can't be split back into separate qubits (entanglement), and the order you write qubits in matters, especially in Qiskit.

## Two qubits: four amplitudes

Two classical bits can be 00, 01, 10 or 11: four possibilities, one at a time. Two qubits have these four as **basis states**:

> |00⟩, |01⟩, |10⟩, |11⟩

and a general two-qubit state is a superposition of all four:

> |ψ⟩ = a|00⟩ + b|01⟩ + c|10⟩ + d|11⟩ = [a, b, c, d]

with |a|² + |b|² + |c|² + |d|² = 1. Measuring both qubits gives "00" with probability |a|², "01" with probability |b|², and so on. Lesson 3's rules all carry over: the state is a vector, now of length 4, and the Born rule works exactly as before.

## The tensor product of two states

Suppose the first qubit is in state [α₀, α₁] and the second in [β₀, β₁], and they've never interacted. What's the combined state?

The probability of "first is 0 and second is 1" should be P(first is 0) × P(second is 1), because the qubits are independent (Lesson 5). That works if the **amplitude** of |01⟩ is α₀·β₁. Doing the same for all four:

> **[α₀, α₁] ⊗ [β₀, β₁] = [α₀β₀, α₀β₁, α₁β₀, α₁β₁]**

This is the **tensor product** (also called the Kronecker product), written ⊗. Multiply each entry of the first vector by the whole second vector, and stack the results.

Some examples, worked by hand:

```text
|0⟩ ⊗ |1⟩ = [1, 0] ⊗ [0, 1] = [1·0, 1·1, 0·0, 0·1] = [0, 1, 0, 0] = |01⟩

|+⟩ ⊗ |0⟩ = [1/√2, 1/√2] ⊗ [1, 0] = [1/√2, 0, 1/√2, 0] = (|00⟩ + |10⟩)/√2

|+⟩ ⊗ |+⟩ = [½, ½, ½, ½] = (|00⟩ + |01⟩ + |10⟩ + |11⟩)/2
```

The shorthand |01⟩ just means |0⟩ ⊗ |1⟩. You'll also see it written |0⟩|1⟩ or |0,1⟩.

```python
import numpy as np
ket0, ket1 = np.array([1, 0]), np.array([0, 1])
plus = (ket0 + ket1) / np.sqrt(2)

print(np.kron(ket0, ket1))              # |0> (x) |1> = |01>
print(np.round(np.kron(plus, ket0), 3)) # |+> (x) |0> = (|00> + |10>)/sqrt2
print(np.round(np.kron(plus, plus), 3)) # |+> (x) |+> = all four, equally

def is_product(state):
    """A two-qubit state [a, b, c, d] is a product state exactly when ad - bc = 0."""
    a, b, c, d = state
    return np.isclose(a * d - b * c, 0)

bell = np.array([1, 0, 0, 1]) / np.sqrt(2)
print(is_product(np.kron(plus, ket0)), is_product(bell))
```

```text
[0 1 0 0]
[0.707 0.    0.707 0.   ]
[0.5 0.5 0.5 0.5]
True False
```

(`np.kron` is NumPy's tensor product. The last line is explained in the next section.)

## Product states and entangled states

Any state you can write as (one qubit's state) ⊗ (the other's) is called a **product state**. Each qubit has its own definite state, and you could describe them separately.

But look at the general state [a, b, c, d]. It has four amplitudes, while a product [α₀β₀, α₀β₁, α₁β₀, α₁β₁] is built from only two pairs. Not every four-entry vector can be split. Here's a quick test: in a product state, the entries satisfy

> (α₀β₀)(α₁β₁) = (α₀β₁)(α₁β₀), that is, **ad = bc**

So for two qubits: **[a, b, c, d] is a product state exactly when ad − bc = 0.** (It's the determinant of the 2×2 grid [[a, b], [c, d]].)

Now try the state (|00⟩ + |11⟩)/√2 = [1/√2, 0, 0, 1/√2]. Here ad − bc = ½ − 0 = ½, not zero. **It cannot be written as one qubit's state times the other's.** Neither qubit has a state of its own; only the pair does.

States like this are called **entangled**, and this one is a **Bell state**. That's what the `False` in the code output means. Entanglement is the subject of Lesson 14; for now, notice that it falls straight out of the tensor product: most vectors in the bigger space simply aren't products.

## n qubits: 2ⁿ amplitudes

Add a third qubit and each of the four basis states splits into two: |000⟩, |001⟩, …, |111⟩. That's 8. In general:

> **n qubits have 2ⁿ basis states, and a general state needs 2ⁿ complex amplitudes.**

This is the doubling from Lesson 1's table: 10 qubits need 1,024 amplitudes, 50 need about 10¹⁵. A product state of n qubits needs only 2n numbers (two per qubit), so the overwhelming majority of the huge space is made of entangled states. That's where a quantum computer's room to work comes from.

## Bit order: the most common beginner bug

When you write |01⟩, which qubit is the 0? There are two conventions, and mixing them up causes more confusion than anything else in practical quantum computing.

| Convention | \|01⟩ means | Used by |
|---|---|---|
| **Textbook** (big-endian) | qubit 0 is 0, qubit 1 is 1 (left to right) | Most books, papers and this course's maths |
| **Qiskit** (little-endian) | qubit 1 is 0, qubit 0 is 1 (**qubit 0 on the right**) | Qiskit output, bitstrings and state vectors |

Qiskit writes bitstrings like ordinary binary numbers: the rightmost digit is the lowest, which is qubit 0. So in Qiskit, flipping qubit 0 of |00⟩ gives "01", not "10":

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

def probs(state):
    """Probabilities of each bitstring, as a tidy dict."""
    return {str(k): round(float(v), 3) for k, v in state.probabilities_dict().items()}

qc = QuantumCircuit(2)
qc.x(0)                         # flip qubit 0 only
print(probs(Statevector(qc)))

a = Statevector.from_label("0")
b = Statevector.from_label("1")
print(probs(a.tensor(b)))       # a.tensor(b): b becomes qubit 0
```

```text
{'01': 1.0}
{'01': 1.0}
```

**Rule of thumb for this course:** maths written in the text uses the textbook order (first qubit on the left) unless it says otherwise. Whenever you read Qiskit output, **read the bitstring right to left** to get qubit 0, 1, 2, …. When a result looks "backwards", this is almost always why.

## Tensor products of gates

A gate on one qubit of a pair is also a tensor product. "Apply A to the first qubit and B to the second" is the 4×4 matrix A ⊗ B, defined so that

> (A ⊗ B)(|a⟩ ⊗ |b⟩) = (A|a⟩) ⊗ (B|b⟩)

To build it, replace each entry of A by that entry times the whole matrix B. For "X on the first qubit, nothing on the second", that's X ⊗ I:

```text
X ⊗ I = [ 0·I  1·I ]  =  [ 0 0 1 0 ]
        [ 1·I  0·I ]     [ 0 0 0 1 ]
                         [ 1 0 0 0 ]
                         [ 0 1 0 0 ]
```

It sends |00⟩ → |10⟩, |01⟩ → |11⟩ and so on: the first qubit flips, the second is untouched.

### Hadamards everywhere: the uniform superposition

The most important multi-qubit product is H on every qubit, written H⊗ⁿ. Starting from |00…0⟩, each H makes |+⟩, so:

> H⊗ⁿ|0…0⟩ = |+⟩ ⊗ |+⟩ ⊗ … ⊗ |+⟩ = (1/√2ⁿ) × (sum of all 2ⁿ basis states)

With n gates, you've made an equal superposition of all 2ⁿ bitstrings. Almost every quantum algorithm in Part E begins this way.

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, Operator

qc = QuantumCircuit(3)
qc.h([0, 1, 2])                 # H on every qubit
print(np.round(Statevector(qc).data.real, 4))

X = np.array([[0, 1], [1, 0]])
I = np.eye(2, dtype=int)
print(np.kron(X, I))            # X on the left (first) qubit, nothing on the right
```

```text
[0.3536 0.3536 0.3536 0.3536 0.3536 0.3536 0.3536 0.3536]
[[0 0 1 0]
 [0 0 0 1]
 [1 0 0 0]
 [0 1 0 0]]
```

Eight equal amplitudes of 1/√8 ≈ 0.3536, and the X ⊗ I matrix from above.

There's also a formula for H⊗ⁿ applied to any basis state |x⟩, which Lesson 22 uses to explain Deutsch–Jozsa and Bernstein–Vazirani:

> H⊗ⁿ|x⟩ = (1/√2ⁿ) Σ_y (−1)^(x·y) |y⟩

where x·y is the number of positions where both x and y have a 1. Every amplitude has the same size; only the **signs** carry information about x. Hold on to that idea.

## Measuring only some of the qubits

Often you measure some qubits and leave the rest. The rule is the Born rule plus bookkeeping.

**Probability of a result on the measured qubit:** add up |amplitude|² over all basis states that agree with that result.

**State afterwards:** keep only the terms that agree with the result, and rescale so the length is 1 again.

**Worked example.** Take |ψ⟩ = (|00⟩ + |01⟩ + |11⟩)/√3 in textbook order (first qubit on the left), and measure only the **first** qubit.

- Result 0: terms |00⟩ and |01⟩, so P = ⅓ + ⅓ = **⅔**. Afterwards: (|00⟩ + |01⟩)/√2 = |0⟩ ⊗ |+⟩. The second qubit is left in |+⟩.
- Result 1: term |11⟩, so P = **⅓**. Afterwards: |11⟩. The second qubit is left in |1⟩.

Notice that the result on one qubit changed what's left on the other. That's because this state is entangled (ad − bc = 1/3 − 0 ≠ 0).

Let's check it in Qiskit. Careful with the order: we write the same amplitudes in Qiskit's order, where the left digit is qubit 1. So "the first qubit" of the text is qubit 1 in Qiskit.

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
from qiskit.primitives import StatevectorSampler

# (|00> + |01> + |11>)/sqrt3, with amplitudes in Qiskit's order 00, 01, 10, 11
psi = Statevector(np.array([1, 1, 0, 1]) / np.sqrt(3))
print({str(k): round(float(v), 3) for k, v in psi.probabilities_dict().items()})
print("qubit 0 alone:", np.round(psi.probabilities([0]), 3))    # P(q0 = 0), P(q0 = 1)
print("qubit 1 alone:", np.round(psi.probabilities([1]), 3))

# Measure only qubit 1, many times
qc = QuantumCircuit(2, 1)
qc.initialize(psi, [0, 1])
qc.measure(1, 0)
counts = StatevectorSampler(seed=4).run([qc], shots=3000).result()[0].data.c.get_counts()
print("qubit 1 results:", counts)
```

```text
{'00': 0.333, '01': 0.333, '11': 0.333}
qubit 0 alone: [0.333 0.667]
qubit 1 alone: [0.667 0.333]
qubit 1 results: {'1': 1004, '0': 1996}
```

Qubit 1 (the left digit) gives 0 about two-thirds of the time, exactly as calculated. `probabilities([1])` computes this "marginal" probability directly, by summing over the other qubit.

## 2ⁿ amplitudes, but not 2ⁿ answers

It's tempting to think: "n qubits hold 2ⁿ numbers, so a quantum computer processes 2ⁿ values at once and gives 2ⁿ answers". The first half is roughly true; the second is false.

When you measure n qubits, you get **one** n-bit string. The 2ⁿ amplitudes decide the odds, and then they're gone. A theorem by Alexander Holevo (1973) makes this precise: **n qubits can carry at most n classical bits of information** that you can read out, no matter how they were prepared.

So the 2ⁿ amplitudes are workspace, not storage. A quantum algorithm must arrange, through interference, that the **one** string you read out is useful, typically by making the wrong answers cancel. That's the hard part, and it's why quantum computers help only for problems with the right structure (Lesson 31).

## Try it

1. Compute |1⟩ ⊗ |+⟩ as a 4-entry vector.
2. Is [½, ½, ½, −½] a product state? Is [½, −½, ½, −½]? Use ad − bc.
3. Write the matrix I ⊗ X (nothing on the first qubit, X on the second). Which basis states does it swap?
4. In Qiskit, a 3-qubit result is "110". What did qubits 0, 1 and 2 give?
5. For |ψ⟩ = (|00⟩ + |01⟩ + |11⟩)/√3 (textbook order), what's the probability that the **second** qubit gives 1? What's left on the first qubit if it does?
6. How many amplitudes does a 20-qubit state have? How many bits can you read out of it?

**Answers:**

1. [0, 1] ⊗ [1/√2, 1/√2] = [0, 0, 1/√2, 1/√2] = (|10⟩ + |11⟩)/√2.
2. First: ad − bc = −¼ − ¼ = −½ ≠ 0, **entangled**. Second: (½)(−½) − (−½)(½) = −¼ + ¼ = 0, **product** (it's |+⟩ ⊗ |−⟩).
3. I ⊗ X = [[0,1,0,0], [1,0,0,0], [0,0,0,1], [0,0,1,0]]. It swaps |00⟩ ↔ |01⟩ and |10⟩ ↔ |11⟩.
4. Reading right to left: qubit 0 gave **0**, qubit 1 gave **1**, qubit 2 gave **1**.
5. Terms with second qubit 1: |01⟩ and |11⟩, so P = **⅔**. Afterwards (|01⟩ + |11⟩)/√2 = |+⟩ ⊗ |1⟩, so the first qubit is left in **|+⟩**.
6. 2²⁰ = **1,048,576** amplitudes, but at most **20** bits of readable information.

## Cheat sheet

| Idea | Formula or fact |
|---|---|
| Two-qubit basis | \|00⟩, \|01⟩, \|10⟩, \|11⟩ |
| Tensor product of states | [α₀, α₁] ⊗ [β₀, β₁] = [α₀β₀, α₀β₁, α₁β₀, α₁β₁] |
| Shorthand | \|01⟩ = \|0⟩ ⊗ \|1⟩ = \|0⟩\|1⟩ |
| n qubits | 2ⁿ basis states and 2ⁿ amplitudes |
| Product state test (2 qubits) | [a, b, c, d] is a product ⇔ ad − bc = 0 |
| Entangled | Can't be written as one state ⊗ another |
| Bell state | (\|00⟩ + \|11⟩)/√2: entangled |
| Textbook order | First qubit on the left |
| Qiskit order | Qubit 0 on the **right**; read bitstrings right to left |
| Qiskit tensor | `a.tensor(b)`: b becomes qubit 0 |
| Gates on several qubits | (A ⊗ B)(\|a⟩ ⊗ \|b⟩) = A\|a⟩ ⊗ B\|b⟩ |
| X on first qubit only | X ⊗ I |
| Uniform superposition | H⊗ⁿ\|0…0⟩ = equal mix of all 2ⁿ strings |
| H⊗ⁿ on \|x⟩ | (1/√2ⁿ) Σ_y (−1)^(x·y) \|y⟩ |
| Partial measurement | Add \|amplitude\|² over matching terms; keep them and renormalise |
| Holevo bound | n qubits give at most n readable classical bits |
| In code | `np.kron`, `Statevector.tensor`, `.probabilities([qubits])` |
