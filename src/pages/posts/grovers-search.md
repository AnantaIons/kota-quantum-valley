---
layout: ../../layouts/Post.astro
title: "Grover's search, built in code"
description: "Grover's algorithm from the ground up: the search problem and the oracle model, inversion about the mean traced amplitude by amplitude, the geometric picture of rotation by 2θ, a general Grover circuit in Qiskit with the rise and fall of success probability, many solutions, a real oracle built from gates for a small satisfiability problem, why √N is optimal, and what Grover can't do."
date: 2026-11-04
category: lesson
lesson: 24
---

Lesson 22 introduced oracles and phase kickback, and showed algorithms (Deutsch–Jozsa, Bernstein–Vazirani) that exploit hidden structure. Grover's algorithm (Lov Grover, 1996) tackles the opposite situation: **no structure at all**. You're searching for a needle in a haystack, and the only tool you have is a checker that says "yes, this is it" or "no".

Grover's algorithm finds the needle with about √N checks instead of about N. That's a **quadratic** speed-up, not exponential, but it applies to an enormous range of problems, and it's provably the best possible. This lesson builds it from scratch, explains exactly why it works, and then builds a real oracle for a small logic puzzle.

## The problem

You have N possible answers, labelled 0 to N − 1, and a function f(x) that is 1 for the correct answer(s) and 0 otherwise. You can evaluate f, but you know nothing else about it. Classically, you must try answers one by one: on average about N/2 tries for a single answer, and N − 1 in the worst case.

On a quantum computer, f is given as a **phase oracle** (Lesson 22): O|x⟩ = (−1)^f(x)|x⟩. It flips the sign of the amplitude of every correct answer and leaves the others alone. The question is how few oracle calls ("queries") we need.

| N | Classical tries (average) | Grover rounds |
|---|---|---|
| 4 | 2.5 | 1 |
| 1,000,000 | 500,000 | about 785 |
| 10¹² | 5 × 10¹¹ | about 785,000 |

## The two steps of a round

Start with all N answers in equal superposition, each with amplitude 1/√N (Hadamards on every qubit). Then repeat a **Grover round** of two steps:

1. **Oracle:** flip the sign of the correct answer's amplitude. The probabilities don't change yet; only a hidden sign does.
2. **Diffusion (inversion about the mean):** replace every amplitude a by 2·mean − a. Amplitudes above the mean go below it, and vice versa, by the same distance.

After step 1, the correct answer's amplitude is negative, far below the mean. Reflecting about the mean throws it far **above**, while all the others shrink slightly. Here's the process traced amplitude by amplitude for N = 8:

```python
import numpy as np

N, marked = 8, 5
amp = np.ones(N) / np.sqrt(N)                     # start: equal superposition
print("round   amplitude of the answer   each other amplitude   P(answer)")
print(f"  0          {amp[marked]:+.3f}                  {amp[0]:+.3f}            {amp[marked]**2:.3f}")
for k in range(1, 5):
    amp[marked] *= -1                             # oracle: flip the answer's sign
    amp = 2 * amp.mean() - amp                    # diffusion: reflect every amplitude about the mean
    print(f"  {k}          {amp[marked]:+.3f}                  {amp[0]:+.3f}            {amp[marked]**2:.3f}")
```

```text
round   amplitude of the answer   each other amplitude   P(answer)
  0          +0.354                  +0.354            0.125
  1          +0.884                  +0.177            0.781
  2          +0.972                  -0.088            0.945
  3          +0.575                  -0.309            0.330
  4          -0.110                  -0.376            0.012
```

After one round, the answer's probability jumps from 12.5% to 78%; after two, to 94.5%. But a third round makes it **worse** (33%), and a fourth almost zero. The other amplitudes go negative and the process overshoots. Grover's algorithm isn't "keep amplifying"; it needs exactly the right number of rounds.

## The geometric picture

Why does it rise and then fall? Because each round is a **rotation**. All the action happens in a 2-dimensional plane, spanned by two states:

- |w⟩, the correct answer, and
- |r⟩, the equal superposition of all the wrong answers.

The starting state is almost entirely |r⟩, tilted towards |w⟩ by a small angle θ with **sin θ = 1/√N**. The oracle reflects the state across |r⟩; the diffusion reflects it across the starting state. Two reflections make a **rotation** by **2θ** (Lesson 25 proves this in general). So after k rounds the state is at angle (2k + 1)θ from |r⟩, and

> P(success) = sin²((2k + 1)θ)

To land on |w⟩ (angle 90°), choose k ≈ π/(4θ) − ½ ≈ (π/4)√N. Rotate further and you go past it, exactly as the table showed.

## Grover in Qiskit

Here's a general Grover circuit for n qubits and any target bitstring. The oracle flips |target⟩ by mapping it to |11…1⟩ with X gates and applying a multi-controlled Z; the diffusion does the same for |00…0⟩, sandwiched between Hadamards:

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

def oracle(n, target):
    """Phase oracle: flip the sign of |target⟩ only (target is a bitstring, qubit 0 on the right)."""
    qc = QuantumCircuit(n)
    zeros = [q for q in range(n) if target[n - 1 - q] == "0"]
    if zeros: qc.x(zeros)                         # map |target⟩ to |11…1⟩
    qc.h(n - 1); qc.mcx(list(range(n - 1)), n - 1); qc.h(n - 1)   # multi-controlled Z on |11…1⟩
    if zeros: qc.x(zeros)
    return qc

def diffusion(n):
    """Reflect about the equal superposition: H, flip the sign of |00…0⟩, H."""
    qc = QuantumCircuit(n)
    qc.h(range(n)); qc.x(range(n))
    qc.h(n - 1); qc.mcx(list(range(n - 1)), n - 1); qc.h(n - 1)
    qc.x(range(n)); qc.h(range(n))
    return qc

def grover(n, target, rounds):
    qc = QuantumCircuit(n)
    qc.h(range(n))
    for _ in range(rounds):
        qc.compose(oracle(n, target), inplace=True)
        qc.compose(diffusion(n), inplace=True)
    return qc

n, target = 3, "101"
for k in range(5):
    p = Statevector(grover(n, target, k)).probabilities_dict().get(target, 0)
    print(f"{k} rounds: P({target}) = {p:.3f}")
theta = np.arcsin(1 / np.sqrt(2 ** n))
print(f"best number of rounds ≈ π/(4θ) − 1/2 = {np.pi / (4 * theta) - 0.5:.2f}")
```

```text
0 rounds: P(101) = 0.125
1 rounds: P(101) = 0.781
2 rounds: P(101) = 0.945
3 rounds: P(101) = 0.330
4 rounds: P(101) = 0.012
best number of rounds ≈ π/(4θ) − 1/2 = 1.67
```

The Qiskit circuit reproduces the amplitude calculation exactly: 78% after one round, 94.5% after two, then falling. The formula says the ideal number of rounds is 1.67, so 2 is the best whole number. Run 2 rounds and measure: you get the answer 94.5% of the time; if not, check it with one classical evaluation and repeat.

## Many solutions

If M of the N answers are correct, the same algorithm works with sin θ = √(M/N): the starting state is tilted further towards the good answers, so fewer rounds are needed, about (π/4)√(N/M):

```python
import numpy as np

print("   N           M    Grover rounds   P(success)   classical tries (average)")
for N, M in [(16, 1), (16, 2), (16, 4), (2 ** 20, 1), (2 ** 20, 16)]:
    theta = np.arcsin(np.sqrt(M / N))
    k = int(np.floor(np.pi / (4 * theta)))           # best whole number of rounds
    p = np.sin((2 * k + 1) * theta) ** 2
    print(f"{N:9,d}   {M:4d}       {k:5d}          {p:.3f}         {(N + 1) / (M + 1):12,.1f}")
```

```text
   N           M    Grover rounds   P(success)   classical tries (average)
       16      1           3          0.961                  8.5
       16      2           2          0.945                  5.7
       16      4           1          1.000                  3.4
1,048,576      1         804          1.000            524,288.5
1,048,576     16         201          1.000             61,681.0
```

Notice the special case M/N = ¼: a single round gives the answer with **certainty** (θ = 30°, and 3θ = 90°). For a million items with one answer, 804 rounds succeed with probability almost 1, against over half a million classical tries.

What if you don't know M? Then you don't know how many rounds to run. Two fixes: run Grover with a random number of rounds from a growing range (which still finds a solution in about √(N/M) queries on average), or first estimate M with **quantum counting**, which is amplitude estimation (Lesson 25) applied to the Grover rotation.

## A real oracle: solving a logic puzzle

In the examples so far, the oracle "knew" the answer, because we built it from the target bitstring. That's fine for learning, but useless in practice: if you already know the answer, you don't need to search. A real oracle must **compute** f(x) from x using gates, so it can recognise an answer without knowing it in advance.

Here's a small **satisfiability** (SAT) problem: find bits x₀, x₁, x₂ that make this formula true:

> (x₀ OR x₁) AND (NOT x₀ OR x₂) AND (NOT x₁ OR NOT x₂)

The oracle computes each clause into an extra **ancilla** qubit using Toffoli gates (an OR is a NOT of an AND of NOTs), flips an output qubit prepared in |−⟩ if all three clauses are true (phase kickback turns that flip into a −1 sign), and then **uncomputes** the clauses so the ancillas return to |0⟩. This last step matters: leftover garbage in the ancillas would be entangled with the answers and ruin the interference.

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

# Find x0, x1, x2 satisfying (x0 OR x1) AND (NOT x0 OR x2) AND (NOT x1 OR NOT x2)
clauses = [[(0, True), (1, True)], [(0, False), (2, True)], [(1, False), (2, False)]]   # (variable, positive?)
x, anc, out = [0, 1, 2], [3, 4, 5], 6

def compute_clauses(qc):
    for c, ((a, pa), (b, pb)) in zip(anc, clauses):
        flips = [v for v, positive in ((a, pa), (b, pb)) if positive]
        if flips: qc.x(flips)
        qc.ccx(a, b, c)           # c = (NOT lit_a) AND (NOT lit_b)
        if flips: qc.x(flips)
        qc.x(c)                   # c = lit_a OR lit_b

qc = QuantumCircuit(7)
qc.h(x)
qc.x(out); qc.h(out)              # output qubit in |−⟩: flipping it gives a phase of −1 (kickback, Lesson 22)
# Oracle: compute every clause, flip the output if all are true, then UNCOMPUTE the clauses
compute_clauses(qc)
qc.mcx(anc, out)
undo = QuantumCircuit(7); compute_clauses(undo)
qc.compose(undo.inverse(), inplace=True)
# Diffusion on the three variable qubits
qc.h(x); qc.x(x); qc.h(2); qc.ccx(0, 1, 2); qc.h(2); qc.x(x); qc.h(x)

state = Statevector(qc)
answers = {str(k): round(float(v), 3) for k, v in state.probabilities_dict(qargs=x).items() if v > 1e-9}
print("after ONE Grover round, x2 x1 x0 →", answers)
print("clause ancillas back to 0:", round(float(state.probabilities_dict(qargs=anc).get("000", 0)), 6))
```

```text
after ONE Grover round, x2 x1 x0 → {'010': 0.5, '101': 0.5}
clause ancillas back to 0: 1.0
```

The formula has exactly 2 solutions out of 8 (M/N = ¼), so a single round lands on them with certainty: x₂x₁x₀ = 010 or 101, each half the time. Check: for 010, x₀ = 0, x₁ = 1, x₂ = 0 makes each clause true. And the ancillas are cleanly back to 0. Nowhere did we tell the circuit what the solutions were: it found them by evaluating the formula on a superposition of all inputs, plus interference.

This is the general recipe for applying Grover to any problem whose solutions can be **checked** by a circuit: scheduling, constraint satisfaction, finding keys, and so on.

## Grover is optimal

Could a cleverer quantum algorithm search faster? No. In 1997, Bennett, Bernstein, Brassard and Vazirani proved that **any** quantum algorithm needs at least about √N oracle queries for unstructured search. Grover's algorithm matches this bound, so it's optimal.

This has a big consequence (Lesson 31): quantum computers are not expected to solve NP-complete problems efficiently. A brute-force search over 2ⁿ possibilities becomes 2^(n/2) with Grover, still exponential. For a SAT problem with 100 variables, Grover needs about 2⁵⁰ ≈ 10¹⁵ rounds, each a large circuit.

## Honest limits

- **Quadratic, not exponential.** On error-corrected hardware each round is slow, so the crossover with classical computers needs very large search spaces (Lesson 31 computes it).
- **The oracle can be expensive.** Each round must evaluate f reversibly, often with many ancillas and T gates.
- **Structure beats Grover.** Real problems usually have structure that good classical algorithms exploit; Grover ignores structure, so it must be compared with the best classical method, not brute force.
- **Where it matters:** symmetric cryptography. Grover halves the effective key length of a cipher, which is why AES-256 is recommended for long-term security (Lesson 43). Grover-style amplitude amplification is also a subroutine inside many other quantum algorithms (Lesson 25).

## Try it

1. For N = 64 and one answer, what is θ, and how many rounds should you run?
2. In the amplitude table, why does the answer's probability drop after the third round?
3. What is P(success) after one round when M/N = ¼? Explain geometrically.
4. Change the target in the Qiskit code to "011". Do the probabilities change? Why or why not?
5. Why must the SAT oracle uncompute the clause ancillas?
6. How many Grover rounds would a brute-force search over 2⁸⁰ keys need, roughly? Is that practical?
7. Why does Grover's algorithm not make NP-complete problems easy?

**Answers:**

1. sin θ = 1/8, so θ ≈ 0.125 rad ≈ 7.2°. Rounds ≈ π/(4θ) − ½ ≈ 6.27 − 0.5 ≈ 5.8, so **6**, giving P ≈ sin²(13θ) ≈ 0.997.
2. The state keeps rotating by 2θ each round and passes |w⟩. After the peak, each extra round moves it away from the answer.
3. **1** (certainty). sin θ = ½ gives θ = 30°; after one round the angle is 3θ = 90°, exactly |w⟩.
4. **No.** Every target is equivalent by symmetry; only which state gets amplified changes.
5. Otherwise the ancillas remain entangled with the x register, holding different values for different x. The branches would then no longer interfere, and the diffusion step wouldn't work.
6. About (π/4)·2⁴⁰ ≈ 8.6 × 10¹¹ rounds, each a large error-corrected circuit: **not practical**, which is why AES with 256-bit keys remains secure.
7. Grover is optimal for unstructured search and gives only a quadratic speed-up: 2ⁿ becomes 2^(n/2), still exponential.

## Cheat sheet

| Idea | Formula or fact |
|---|---|
| Problem | Find x with f(x) = 1 among N items, using only an oracle |
| Phase oracle | O\|x⟩ = (−1)^f(x)\|x⟩ |
| Diffusion | Inversion about the mean: a → 2·mean − a |
| Geometry | Each round rotates by 2θ, with sin θ = √(M/N) |
| Success | P = sin²((2k + 1)θ) |
| Best rounds | k ≈ π/(4θ) − ½ ≈ (π/4)√(N/M) |
| Overshooting | Too many rounds lowers the success probability |
| M/N = ¼ | One round succeeds with certainty |
| Unknown M | Randomised rounds, or quantum counting (Lesson 25) |
| Real oracles | Compute f with gates, use ancillas, then uncompute |
| Optimal | Ω(√N) queries needed (BBBV, 1997) |
| Limits | Quadratic only; costly oracles; structure-aware classical methods compete |
| Crypto impact | Halves symmetric key strength: use AES-256 |
