---
layout: ../../layouts/Post.astro
title: "Oracles, Deutsch–Jozsa and Bernstein–Vazirani"
description: "How quantum algorithms are measured (queries to an oracle), bit oracles and phase oracles, phase kickback, Deutsch's algorithm worked by hand, Deutsch–Jozsa and Bernstein–Vazirani with the full maths, an oracle for any function, and an honest look at what these first speed-ups prove."
date: 2026-11-04
category: lesson
lesson: 22

---

Part E is about quantum algorithms: what they are, why they're faster, and where they aren't. This first lesson builds the framework that every later algorithm uses, and then works through the first three quantum algorithms ever found. They solve made-up problems, but they show the core mechanism more clearly than anything else: **put the answer into phases, then use interference to turn the phases into a measurement you can read.**

You'll need Lesson 12's formula for Hadamards on many qubits and Lesson 13's phase kickback. Both are recapped where they're used.

## How quantum speed is measured: queries

Comparing a quantum and a classical computer is tricky: their hardware is completely different. So for clean comparisons, researchers use the **query model**.

Imagine a black box, called an **oracle**, that computes some function f. You can't look inside; you can only feed it inputs and get outputs. The cost of an algorithm is the **number of times it calls the oracle** (the number of **queries**). The question is: how many queries does it take to learn some property of f?

This sounds artificial, but it's how you'd analyse searching an unsorted database (Lesson 24) or finding the period of a function (Lesson 28): the oracle is the part of the problem you can't simplify, and everything else is overhead.

## Two ways to build an oracle

A classical oracle maps x to f(x). A quantum oracle must be **reversible** (Lesson 1), so it can't just overwrite x. There are two standard forms.

**Bit oracle:** keep x, and XOR the answer into an extra target qubit:

> U_f |x⟩|y⟩ = |x⟩|y ⊕ f(x)⟩

This is exactly how reversible classical logic works (a CNOT is the bit oracle for f(x) = x).

**Phase oracle:** keep x, and put the answer into a sign:

> O_f |x⟩ = (−1)^f(x) |x⟩

The phase oracle looks useless at first: a sign on a single basis state is a global phase, invisible. But on a **superposition**, different inputs get different signs: a relative phase, which interference can detect (Lesson 10).

### Phase kickback turns one into the other

You can get a phase oracle from a bit oracle by preparing the target in |−⟩ = (|0⟩ − |1⟩)/√2. Look at what the bit oracle does:

- If f(x) = 0: the target is unchanged, |x⟩|−⟩.
- If f(x) = 1: the target is flipped. X|−⟩ = −|−⟩, so we get −|x⟩|−⟩.

Both cases together: **U_f |x⟩|−⟩ = (−1)^f(x) |x⟩|−⟩.** The target never changes; the answer has been "kicked back" into a sign on |x⟩. That's Lesson 13's phase kickback, and it's the bridge from classical logic to quantum interference.

## Deutsch's algorithm: the first quantum speed-up

In 1985 David Deutsch asked the smallest possible question. A function f takes one bit to one bit. There are four such functions:

| f | f(0) | f(1) | Type |
|---|---|---|---|
| f(x) = 0 | 0 | 0 | constant |
| f(x) = 1 | 1 | 1 | constant |
| f(x) = x | 0 | 1 | balanced |
| f(x) = NOT x | 1 | 0 | balanced |

**Question:** is f constant (same output for both inputs) or balanced (different outputs)?

**Classically:** you must evaluate f(0) **and** f(1). Two queries. One answer tells you nothing about the other.

**Quantumly: one query.** Here's the circuit and the full calculation.

1. Start with the input qubit in |0⟩ and the target in |1⟩. Apply H to both: |+⟩|−⟩.
2. Query the oracle once. By phase kickback, the input becomes (1/√2)[(−1)^f(0)|0⟩ + (−1)^f(1)|1⟩], and the target stays |−⟩.
3. Look at that input state. If f is **constant**, both signs are the same, so it's ±|+⟩. If f is **balanced**, the signs differ, so it's ±|−⟩.
4. Apply H to the input: |+⟩ → |0⟩ and |−⟩ → |1⟩. Measure.

**Result 0 means constant; result 1 means balanced.** With certainty, after one query. The algorithm never learns f(0) or f(1) individually; it learns only the **relationship** between them, which is all the question asked for. That's the essence of every quantum speed-up: answer a global question about f without computing all its values.

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

# The four one-bit functions f: {0,1} -> {0,1}, as oracles |x>|y> -> |x>|y XOR f(x)>
def oracle(name):
    qc = QuantumCircuit(2)                 # qubit 0 = input x, qubit 1 = target y
    if name == "f(x)=1":
        qc.x(1)
    if name == "f(x)=x":
        qc.cx(0, 1)
    if name == "f(x)=NOT x":
        qc.cx(0, 1); qc.x(1)
    return qc                              # "f(x)=0" does nothing

for name in ["f(x)=0", "f(x)=1", "f(x)=x", "f(x)=NOT x"]:
    qc = QuantumCircuit(2)
    qc.x(1); qc.h([0, 1])                  # input |+>, target |->
    qc.compose(oracle(name), inplace=True) # ONE call to f
    qc.h(0)
    p1 = Statevector(qc).probabilities([0])[1]
    kind = "balanced" if p1 > 0.5 else "constant"
    print(f"{name:11s} -> input qubit reads {int(round(p1))}  ({kind})")
```

```text
f(x)=0      -> input qubit reads 0  (constant)
f(x)=1      -> input qubit reads 0  (constant)
f(x)=x      -> input qubit reads 1  (balanced)
f(x)=NOT x  -> input qubit reads 1  (balanced)
```

## Deutsch–Jozsa: from 1 bit to n bits

In 1992 Deutsch and Richard Jozsa scaled it up. Now f takes **n** bits to one bit, and you're **promised** that f is either:

- **constant:** the same output for all 2ⁿ inputs, or
- **balanced:** output 0 for exactly half the inputs and 1 for the other half.

**Classically (with certainty):** in the worst case you might see the same output on the first 2ⁿ⁻¹ inputs you try, by bad luck with a balanced function. You need **2ⁿ⁻¹ + 1** queries to be sure. For n = 50, that's over 500 trillion.

**Quantumly: one query.** The circuit is Deutsch's, widened: H on all n inputs, one phase-oracle call, H on all n inputs, measure.

### Why it works

Start from |0…0⟩. After the first layer of H's you have the uniform superposition (Lesson 12):

> (1/√2ⁿ) Σ_x |x⟩

The phase oracle multiplies each term by (−1)^f(x):

> (1/√2ⁿ) Σ_x (−1)^f(x) |x⟩

Now apply H⊗ⁿ again. We only need the amplitude of |0…0⟩. Using Lesson 12's formula H⊗ⁿ|x⟩ = (1/√2ⁿ) Σ_y (−1)^(x·y) |y⟩, the |0…0⟩ component of every H⊗ⁿ|x⟩ is just 1/√2ⁿ (since x·0 = 0). So:

> amplitude of |0…0⟩ = (1/2ⁿ) Σ_x (−1)^f(x)

That's the **average of the signs**.

- **Constant f:** every sign is the same, so the average is ±1. **P(all zeros) = 1.**
- **Balanced f:** half the signs are +1 and half −1, so they cancel exactly. **P(all zeros) = 0.**

So: **measure all zeros means constant; anything else means balanced.** This is destructive interference among 2ⁿ amplitudes at once, the same mechanism as Lesson 2's roots of unity.

### An oracle for any function

To try it on any function, we need a phase oracle for any truth table. A simple (not efficient) construction: for each input x with f(x) = 1, put a −1 phase on |x⟩ alone. A multi-controlled phase gate does that for |11…1⟩; X gates before and after move it to any other |x⟩.

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

def phase_oracle(truth_table):
    """Phase oracle for any f on n bits: multiplies |x> by (-1)^f(x). truth_table[x] = f(x)."""
    n = (len(truth_table) - 1).bit_length()
    qc = QuantumCircuit(n)
    for x, fx in enumerate(truth_table):
        if fx:
            zeros = [q for q in range(n) if not (x >> q) & 1]
            if zeros: qc.x(zeros)          # turn |x> into |11...1>
            qc.mcp(np.pi, list(range(n - 1)), n - 1)   # phase -1 on |11...1>
            if zeros: qc.x(zeros)          # undo
    return qc

def deutsch_jozsa(truth_table):
    n = (len(truth_table) - 1).bit_length()
    qc = QuantumCircuit(n)
    qc.h(range(n))
    qc.compose(phase_oracle(truth_table), inplace=True)
    qc.h(range(n))
    return round(float(Statevector(qc).probabilities()[0]), 3)    # chance of reading all zeros

print("constant 0      :", deutsch_jozsa([0] * 8))
print("constant 1      :", deutsch_jozsa([1] * 8))
print("balanced (x0)   :", deutsch_jozsa([x & 1 for x in range(8)]))
print("balanced (mixed):", deutsch_jozsa([1, 0, 1, 1, 0, 0, 1, 0]))
print("not promised    :", deutsch_jozsa([1, 0, 0, 0, 0, 0, 0, 0]))
```

```text
constant 0      : 1.0
constant 1      : 1.0
balanced (x0)   : 0.0
balanced (mixed): 0.0
not promised    : 0.562
```

Constant functions give all-zeros with certainty, balanced ones never do. The last line breaks the promise (only one input gives 1): the average of the signs is (7 − 1)/8 = ¾, so P = (¾)² = 0.5625, and the algorithm can't give a clean answer. **The promise is part of the problem.**

## Bernstein–Vazirani: read a hidden string in one query

Ethan Bernstein and Umesh Vazirani (1993) used the same circuit for a more useful-looking task. There's a hidden n-bit string s, and the oracle computes

> f(x) = s·x mod 2  (the parity of the bits where both s and x have a 1)

**Find s.**

**Classically:** each query gives one bit of information, so you need **n** queries (try x = 100…0 to learn the first bit of s, then 010…0, and so on).

**Quantumly: one query.** After the oracle, the state is (1/√2ⁿ) Σ_x (−1)^(s·x) |x⟩. Compare with Lesson 12's formula: that's **exactly H⊗ⁿ|s⟩**. Since H⊗ⁿ undoes itself, the final layer of H's turns it into |s⟩. Measuring gives s, with certainty.

The phase oracle here is beautifully simple: (−1)^(s·x) is a product of (−1)^(xᵢ) over the positions where sᵢ = 1, and that's just a **Z gate on each of those qubits**.

```python
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler

def bernstein_vazirani(secret):
    """f(x) = s.x mod 2. Its phase oracle is just a Z on every qubit where s has a 1."""
    n = len(secret)
    qc = QuantumCircuit(n)
    qc.h(range(n))
    for i, bit in enumerate(reversed(secret)):   # Qiskit: qubit 0 is the rightmost bit
        if bit == "1":
            qc.z(i)                               # the oracle: (-1)^(s.x)
    qc.h(range(n))
    qc.measure_all()
    return StatevectorSampler(seed=1).run([qc], shots=100).result()[0].data.meas.get_counts()

for s in ["101", "1101", "10011010"]:
    print(s, "->", bernstein_vazirani(s))
```

```text
101 -> {'101': 100}
1101 -> {'1101': 100}
10011010 -> {'10011010': 100}
```

Every shot gives the secret. (Notice how the `reversed` handles Qiskit's bit order, Lesson 12.) In terms of Lesson 9's identities, the whole circuit H–Z–H on each qubit is just HZH = X on exactly the qubits where sᵢ = 1: it writes s directly.

## The recipe behind every algorithm

All three algorithms follow the same four steps, and so will everything in Part E:

1. **Superpose:** Hadamards put the input register into a superposition of all inputs.
2. **Query:** the oracle writes the function's values into **phases**, via phase kickback.
3. **Interfere:** a transform (here H⊗ⁿ; in Shor's algorithm the QFT) makes the phases add up on the answer and cancel elsewhere.
4. **Measure:** read the answer, often with certainty, sometimes with high probability.

The "magic" is entirely in step 3. Without interference, step 2 would just be a random sample of f, no better than classical.

## An honest note on these speed-ups

| Problem | Classical, certain | Classical, allowed small error | Quantum |
|---|---|---|---|
| Deutsch (n = 1) | 2 queries | 2 queries | 1 query |
| Deutsch–Jozsa | 2ⁿ⁻¹ + 1 queries | About 10–20 queries | 1 query |
| Bernstein–Vazirani | n queries | n queries | 1 query |

Look at the middle column. If a classical algorithm is allowed a tiny chance of error, Deutsch–Jozsa becomes easy: query ~20 random inputs; if they all agree, say "constant". A balanced function fools you only with probability 2⁻¹⁹. So the exponential separation is real only for **exact** (zero-error) algorithms. Bernstein–Vazirani gives a solid speed-up, but only from n to 1, not exponential.

Neither problem matters in practice. Their importance is historical and conceptual: they proved that quantum computers **can** beat classical ones in a precise model, and they introduced the tools (oracles, phase kickback, Hadamard interference) that Simon's algorithm (Lesson 23) turned into the first exponential speed-up, and that Shor (Lesson 28) turned into an algorithm that matters to the whole world.

## Try it

1. In Deutsch's algorithm, write out the input state after the oracle for f(x) = NOT x. Which state is it, up to sign?
2. For n = 10, how many classical queries does Deutsch–Jozsa need to be certain? How many quantum queries?
3. A function on 3 bits gives 1 for inputs 000, 011, 101, 110 (and 0 otherwise). Is it balanced? What does the Deutsch–Jozsa circuit output?
4. In Bernstein–Vazirani with s = 0110, which qubits get a Z gate (in Qiskit numbering)?
5. Why must the target qubit start in |−⟩ when using a bit oracle?
6. Why does the not-promised function in the code give P(all zeros) = 0.5625?

**Answers:**

1. (1/√2)[(−1)¹|0⟩ + (−1)⁰|1⟩] = (−|0⟩ + |1⟩)/√2 = −|−⟩. It's |−⟩ up to sign: **balanced**.
2. 2⁹ + 1 = **513** classical queries; **1** quantum query.
3. Four 1s out of eight: **balanced**. It's 1 exactly when x has an even number of 1s, so f(x) = 1 ⊕ (x₀ ⊕ x₁ ⊕ x₂) = 1 ⊕ s·x with s = 111. The extra "1 ⊕" only flips every sign, a global phase. So the circuit outputs exactly **111**, by Bernstein–Vazirani.
4. s = 0110 reads q3 q2 q1 q0 = 0 1 1 0, so **qubits 1 and 2**.
5. Because X|−⟩ = −|−⟩: flipping the target becomes a sign, which kicks back onto the input. With |0⟩ the target would just record f(x) and entangle with the input instead.
6. Seven inputs give sign +1 and one gives −1. The average is 6/8 = ¾, and the probability is its square, 9/16 = 0.5625.

## Cheat sheet

| Idea | Formula or fact |
|---|---|
| Query model | Cost = number of oracle calls |
| Bit oracle | \|x⟩\|y⟩ → \|x⟩\|y ⊕ f(x)⟩ |
| Phase oracle | \|x⟩ → (−1)^f(x)\|x⟩ |
| Phase kickback | Target in \|−⟩ turns a bit oracle into a phase oracle |
| Deutsch | Constant or balanced, 1 bit: 1 query vs 2 |
| Deutsch–Jozsa | Promise: constant or balanced on n bits; 1 query vs 2ⁿ⁻¹ + 1 (exact) |
| DJ key formula | Amplitude of \|0…0⟩ = average of (−1)^f(x) |
| DJ readout | All zeros ⇔ constant |
| Bernstein–Vazirani | f(x) = s·x; 1 query vs n; output is s |
| BV oracle | Z on each qubit where sᵢ = 1 |
| BV key fact | Σ (−1)^(s·x)\|x⟩ = H⊗ⁿ\|s⟩ (times √2ⁿ) |
| The recipe | Superpose → query (phases) → interfere → measure |
| Honest caveat | DJ's exponential gap vanishes if small classical error is allowed |
