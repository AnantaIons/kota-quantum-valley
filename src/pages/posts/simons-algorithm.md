---
layout: ../../layouts/Post.astro
title: "Simon's algorithm"
description: "The first exponential quantum speed-up that holds even against randomised classical algorithms: finding a hidden XOR pattern. The problem, why classical search needs about 2^(n/2) queries, the quantum circuit, the maths of why every outcome is orthogonal to the secret, solving the equations, and how this inspired Shor."
date: 2026-11-04
category: lesson
lesson: 23

---

Lesson 22 ended with an honest caveat: Deutsch–Jozsa's exponential advantage disappears if a classical algorithm is allowed a small chance of error. Was the quantum advantage just a trick of the rules?

In 1994, Daniel Simon answered no. He found a problem where a quantum computer needs about **n** queries, while **any** classical algorithm, even one allowed to guess and make errors, needs about **2^(n/2)**. That's a genuine exponential gap. Simon's paper was rejected from a major conference at first, but one reviewer, Peter Shor, read it closely and realised the same idea could find periods in modular arithmetic. Months later he had a factoring algorithm (Lesson 28). Simon's algorithm is the direct ancestor of the most famous quantum algorithm in the world.

## The problem: a hidden XOR pattern

You're given an oracle for a function f that takes n bits to n bits. You're promised there is a secret, non-zero n-bit string s such that:

> **f(x) = f(y) exactly when y = x or y = x ⊕ s**

(⊕ is bitwise XOR.) So f is **two-to-one**: inputs come in pairs {x, x ⊕ s} that share an output, and different pairs have different outputs. **Find s.**

Here's a small example with n = 3 and s = 110:

| x | x ⊕ s | f(x) |
|---|---|---|
| 000 | 110 | 101 |
| 001 | 111 | 010 |
| 010 | 100 | 000 |
| 011 | 101 | 110 |
| 100 | 010 | 000 |
| 101 | 011 | 110 |
| 110 | 000 | 101 |
| 111 | 001 | 010 |

The outputs are arbitrary labels; what matters is that inputs differing by exactly 110 share an output. If you ever find two inputs with the same output, XOR them and you have s.

## The classical difficulty: you need a collision

Classically, the only way to learn anything about s is to find a **collision**: two different inputs x ≠ y with f(x) = f(y). Then s = x ⊕ y. Until you find one, every output you've seen looks like a random new label, and tells you nothing.

How many queries until a collision? This is the **birthday problem**: in a room of 23 people, there's a 50% chance two share a birthday, even though there are 365 days. With N possible outputs, you need about √N random samples before two match. Here there are 2ⁿ⁻¹ outputs, so a classical algorithm needs on the order of **2^(n/2)** queries. Simon proved that no classical strategy, however clever or random, can do fundamentally better.

```python
import numpy as np
rng = np.random.default_rng(0)

def classical_queries(n):
    """Query f(x) = min(x, x XOR s) at random inputs until two inputs give the same output."""
    s = int(rng.integers(1, 2 ** n))
    seen = {}
    for count, x in enumerate(rng.permutation(2 ** n), start=1):
        y = min(int(x), int(x) ^ s)
        if y in seen:
            return count                     # collision: x XOR seen[y] = s
        seen[y] = x

for n in [10, 16, 20]:
    avg = np.mean([classical_queries(n) for _ in range(200)])
    print(f"n = {n}: classical ≈ {avg:6.0f} queries on average   (2^(n/2) = {2 ** (n / 2):5.0f});  quantum ≈ {n + 1}")
```

```text
n = 10: classical ≈     40 queries on average   (2^(n/2) =    32);  quantum ≈ 11
n = 16: classical ≈    305 queries on average   (2^(n/2) =   256);  quantum ≈ 17
n = 20: classical ≈   1193 queries on average   (2^(n/2) =  1024);  quantum ≈ 21
```

(We used the simple function f(x) = min(x, x ⊕ s), which has exactly the required pairing.) Every 2 extra bits double the classical cost. At n = 100, the classical search would need about 10¹⁵ queries; the quantum algorithm, about 100.

## The quantum algorithm

The circuit uses two registers of n qubits: an input register and an output register. One round is:

1. **Superpose** the input register: H on each of its qubits. Output register stays |0…0⟩.
2. **Query** the oracle once: |x⟩|0⟩ → |x⟩|f(x)⟩.
3. **Measure the output register** (or just ignore it; the maths is the same).
4. **Interfere:** H on each input qubit again.
5. **Measure the input register.** Call the result y.

Each round gives one string y. Repeat about n times, then solve some simple equations to get s.

### Why it works

**After step 2**, the state is (1/√2ⁿ) Σ_x |x⟩|f(x)⟩, an entangled state of both registers.

**Step 3.** Suppose measuring the output register gives some value f₀. The only inputs consistent with it are the pair x₀ and x₀ ⊕ s. So the input register collapses to

> (|x₀⟩ + |x₀ ⊕ s⟩)/√2

with x₀ random. Notice: if you measured the input now, you'd get x₀ or x₀ ⊕ s, a random member of a random pair. Useless. But the **superposition** of the pair contains s in its structure.

**Step 4.** Apply H⊗ⁿ, using Lesson 12's formula H⊗ⁿ|x⟩ = (1/√2ⁿ) Σ_y (−1)^(x·y) |y⟩. The amplitude of each |y⟩ is

> (1/√2ⁿ⁺¹) [(−1)^(x₀·y) + (−1)^((x₀⊕s)·y)] = (1/√2ⁿ⁺¹) (−1)^(x₀·y) [1 + (−1)^(s·y)]

(using (x₀ ⊕ s)·y = x₀·y ⊕ s·y). Now look at the bracket:

- If **s·y = 0**: the bracket is 1 + 1 = 2. The two paths **add**.
- If **s·y = 1**: the bracket is 1 − 1 = 0. The two paths **cancel**.

So the measurement **only ever gives strings y with s·y = 0 (mod 2)**, each equally likely. The random x₀ only appears in a sign, which the measurement can't see. That's the whole trick: interference has erased the useless random part and kept a clean constraint on s.

### Solving for s

Each y is one linear equation over bits: y₁s₁ ⊕ y₂s₂ ⊕ … ⊕ yₙsₙ = 0. After collecting about n of them, you'll have n − 1 independent equations, and they pin down s uniquely (the only other solution is s = 00…0, which is excluded). Solving takes ordinary Gaussian elimination, done with XOR instead of subtraction; a laptop does it instantly even for n in the thousands.

## Simon's algorithm in code

Here's a full run for n = 4 and secret s = 1011 (written in Qiskit order, so the rightmost bit is bit 0). The oracle copies x into the second register, then XORs s in whenever a particular bit of x is 1; that makes x and x ⊕ s give the same output. For a small example, we find s by checking every candidate against the equations.

```python
import itertools
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler

def simon_oracle(s):
    """f(x) = f(x XOR s): a 2-to-1 function hiding the string s (Qiskit order: s[-1] is bit 0)."""
    n = len(s)
    qc = QuantumCircuit(2 * n)
    for i in range(n):
        qc.cx(i, n + i)                      # second register = copy of x
    k = s[::-1].index("1")                   # lowest bit where s has a 1
    for i, bit in enumerate(s[::-1]):
        if bit == "1":
            qc.cx(k, n + i)                  # if x_k = 1, XOR s into the copy
    return qc

def simon_round(s, shots):
    n = len(s)
    qc = QuantumCircuit(2 * n, n)
    qc.h(range(n))
    qc.compose(simon_oracle(s), inplace=True)
    qc.h(range(n))
    qc.measure(range(n), range(n))
    return StatevectorSampler(seed=23).run([qc], shots=shots).result()[0].data.c.get_counts()

secret = "1011"
counts = simon_round(secret, shots=20)
print("measured y values:", sorted(counts))

def dot(a, b):
    return sum(int(x) * int(y) for x, y in zip(a, b)) % 2

ys = list(counts)
for y in sorted(ys):
    print(y, "· s =", dot(y, secret))

candidates = ["".join(c) for c in itertools.product("01", repeat=len(secret)) if "1" in c]
solutions = [c for c in candidates if all(dot(y, c) == 0 for y in ys)]
print("strings consistent with every y:", solutions)
```

```text
measured y values: ['0000', '0011', '0100', '0111', '1001', '1010', '1101']
0000 · s = 0
0011 · s = 0
0100 · s = 0
0111 · s = 0
1001 · s = 0
1010 · s = 0
1101 · s = 0
strings consistent with every y: ['1011']
```

Twenty shots produced 7 different y values, and **every one** has y·s = 0, exactly as the interference argument predicts. (There are 2³ = 8 strings orthogonal to s, including 0000; we saw 7 of them.) Only one non-zero string is consistent with all the equations: the secret.

Notice that we never measured the output register. Measuring it or not makes no difference to the input register's statistics: once the input is entangled with the output, ignoring the output has the same effect as measuring it and forgetting the result (Lesson 14's reduced states).

## Why Simon's algorithm matters

**1. A real exponential separation.** Unlike Deutsch–Jozsa, the gap survives randomised classical algorithms: about n quantum queries against about 2^(n/2) classical. It was the strongest evidence yet that quantum computers are fundamentally more powerful than classical ones for some tasks.

**2. It's a period-finding algorithm.** The condition f(x) = f(x ⊕ s) says f is **periodic** with period s, where "adding" means XOR. Shor's insight was to replace XOR with ordinary addition modulo N, and the Hadamard transform with the quantum Fourier transform (Lesson 26). The structure stays the same: superpose, query, collapse to a periodic superposition, transform, read a constraint on the period, repeat, solve.

| | Simon | Shor |
|---|---|---|
| Hidden structure | f(x) = f(x ⊕ s) | f(x) = f(x + r) |
| "Addition" | Bitwise XOR | Ordinary addition |
| Transform | Hadamard on each qubit | Quantum Fourier transform |
| Each run gives | y with y·s = 0 | y close to a multiple of N/r |
| Classical post-processing | Linear algebra mod 2 | Continued fractions |

**3. It's the "hidden subgroup problem".** Both are cases of a general problem: a function constant on the cosets of a hidden subgroup, find the subgroup. Quantum computers solve it efficiently for all **abelian** groups (that covers Simon, Shor, and the discrete logarithm problem behind elliptic-curve cryptography). For some non-abelian groups, including the one related to graph isomorphism, no efficient quantum algorithm is known.

**4. It has broken real cryptography, on paper.** In 2016, researchers showed that Simon's algorithm can break several symmetric-key constructions (some block cipher modes and message-authentication codes) **if an attacker can query them in superposition**. That threat model is unrealistic for most systems today, but it shows how quantum algorithms find hidden structure that classical cryptanalysis misses (Lesson 43).

## Try it

1. In the n = 3 table above, which input shares an output with 011? Check that their XOR is s.
2. With s = 110, which of these y can Simon's algorithm output: 000, 001, 110, 111, 011?
3. For n = 40, roughly how many classical queries does collision-finding need? How many quantum?
4. You've measured y = 1100 and y = 0110 and y = 0011 for some 4-bit s. Find s.
5. Why does the random x₀ in step 3 not spoil the result?
6. In one sentence, what changed between Simon's algorithm and Shor's?

**Answers:**

1. 101, since 011 ⊕ 110 = 101. Both map to 110 in the table.
2. y·s = 0 needs y₁·1 ⊕ y₂·1 ⊕ y₃·0 = 0, so the first two bits must be equal: **000, 001, 110, 111** are possible; 011 is not.
3. About 2²⁰ ≈ **one million** classical queries; about **41** quantum queries.
4. The equations say s₁ = s₂, s₂ = s₃ and s₃ = s₄, so all bits are equal. The only non-zero solution is **s = 1111**.
5. It only appears in the sign (−1)^(x₀·y), and a sign on an amplitude doesn't change the probability |amplitude|².
6. Shor replaced XOR-periodicity with periodicity under ordinary addition, and the Hadamard transform with the quantum Fourier transform.

## Cheat sheet

| Idea | Formula or fact |
|---|---|
| Simon's problem | f(x) = f(y) ⇔ y = x or y = x ⊕ s; find s |
| Classical cost | ~2^(n/2) queries (birthday bound), even with randomness |
| Quantum cost | ~n queries + linear algebra mod 2 |
| One round | H⊗ⁿ → query → (measure output) → H⊗ⁿ → measure input |
| After query and collapse | (\|x₀⟩ + \|x₀ ⊕ s⟩)/√2 |
| Key amplitude | ∝ (−1)^(x₀·y) [1 + (−1)^(s·y)] |
| Outcomes | Only y with s·y = 0 (mod 2) |
| Finish | ~n − 1 independent equations → unique s |
| History | Simon (1994); reviewed by Shor, who then found factoring |
| Bigger picture | Abelian hidden subgroup problem: Simon, Shor, discrete log |
| Crypto relevance | Breaks some symmetric schemes if queried in superposition |
