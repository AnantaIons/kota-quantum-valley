---
layout: ../../layouts/Post.astro
title: "Amplitude amplification"
description: "Grover's idea in its general form: take any quantum procedure that succeeds with probability p and boost it to near-certainty in about 1/√p steps. The two-reflection geometry, the sin²((2k+1)θ) formula checked in code, what to do when p is unknown, and amplitude estimation, which counts and averages quadratically faster than sampling."
date: 2026-11-04
category: lesson
lesson: 25

---

Lesson 24 built Grover's search: mark the right answer with a phase, then "reflect about the average" to grow its amplitude, round after round. It turns out that nothing in that recipe depends on starting from an equal superposition, or even on searching. It's a general method for making **any** quantum procedure succeed more often, called **amplitude amplification** (Brassard, Høyer, Mosca and Tapp, 2000).

And it has a powerful sibling, **amplitude estimation**, which doesn't just find good outcomes but measures **how likely** they are, quadratically faster than repeated sampling. That's the engine behind quantum speed-ups for Monte Carlo simulation in finance and science (Lesson 46).

## The setting

Suppose you have some quantum circuit A. Run on |0…0⟩, it produces a state where some outcomes are "good" (what you want) and the rest are "bad". Group them:

> A|0…0⟩ = sin θ · |good⟩ + cos θ · |bad⟩

Here |good⟩ is the normalised superposition of all the good outcomes, |bad⟩ likewise, and the angle θ is defined by the total probability of success:

> p = sin²θ

**Classically**, if A succeeds with probability p, you just run it again and again. On average you need **1/p** tries. For p = 1%, that's 100 tries.

**Amplitude amplification** needs only about **1/√p** runs of A: 10 instead of 100. It's the same quadratic speed-up as Grover, for any A. (Grover's search is the special case where A = H⊗ⁿ and there's one good item, so p = 1/N.)

All you need is:

- the circuit **A** and its inverse **A†**, and
- a way to **recognise** good outcomes: a phase oracle **S_good** that puts a −1 on good basis states (like Lesson 22's phase oracles).

## The geometry: two reflections make a rotation

Picture the state as an arrow in a flat plane, with |bad⟩ along one axis and |good⟩ along the other. A|0⟩ starts at a small angle θ above the bad axis. We want to rotate it up towards |good⟩.

One round of amplitude amplification is the operator

> **Q = A · S₀ · A† · S_good**

made of two reflections:

1. **S_good** flips the sign of the good component. In the plane, that's a **reflection across the bad axis**: the arrow at angle θ goes to −θ.
2. **A · S₀ · A†**, where S₀ flips the sign of |0…0⟩, is a **reflection across the starting direction** A|0⟩. (Up to a global sign, which doesn't matter.) The arrow at −θ goes to +3θ.

Two reflections across lines at angle θ to each other make a **rotation by 2θ**. (Try it with a mirror and a pencil: reflecting twice across two mirrors at angle θ turns any object by 2θ.) So each round of Q rotates the state by 2θ towards |good⟩. After k rounds the angle is (2k + 1)θ, and:

> **P(good after k rounds) = sin²((2k + 1)θ)**

To get close to certainty, choose k so that (2k + 1)θ ≈ 90°:

> **k ≈ π/(4θ) − ½ ≈ (π/4)·(1/√p)**  (for small p, since θ ≈ √p)

That's the 1/√p.

### Seeing it in code

Here A is not a uniform superposition at all: it applies a different RY rotation to each of three qubits, and "good" means the outcome 111. On its own, A gives 111 only 1.65% of the time. The oracle S_good is a CCZ (a controlled-controlled-Z, built from H and a Toffoli), and S₀ is the same thing wrapped in X gates so it marks 000 instead.

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

angles = [1.2, 0.9, 1.1]                       # A: a different RY on each of 3 qubits
def A():
    qc = QuantumCircuit(3)
    for q, a in enumerate(angles):
        qc.ry(a, q)
    return qc

def flip_111():                                # phase -1 on the good state |111>
    qc = QuantumCircuit(3)
    qc.h(2); qc.ccx(0, 1, 2); qc.h(2)
    return qc

def reflect_about_000():                       # phase -1 on |000> (up to a global sign)
    qc = QuantumCircuit(3)
    qc.x([0, 1, 2]); qc.compose(flip_111(), inplace=True); qc.x([0, 1, 2])
    return qc

Q = QuantumCircuit(3)                          # one round of amplitude amplification
Q.compose(flip_111(), inplace=True)
Q.compose(A().inverse(), inplace=True)
Q.compose(reflect_about_000(), inplace=True)
Q.compose(A(), inplace=True)

p = np.prod(np.sin(np.array(angles) / 2) ** 2) # chance that A alone gives |111>
theta = np.arcsin(np.sqrt(p))
print(f"A alone: P(111) = {p:.4f}, theta = {np.degrees(theta):.2f} degrees")
state = A()
for k in range(6):
    sim = Statevector(state).probabilities_dict().get("111", 0)
    print(f"k = {k}: P(111) = {sim:.4f}   formula sin^2((2k+1)θ) = {np.sin((2 * k + 1) * theta) ** 2:.4f}")
    state = state.compose(Q)
```

```text
A alone: P(111) = 0.0165, theta = 7.38 degrees
k = 0: P(111) = 0.0165   formula sin^2((2k+1)θ) = 0.0165
k = 1: P(111) = 0.1419   formula sin^2((2k+1)θ) = 0.1419
k = 2: P(111) = 0.3601   formula sin^2((2k+1)θ) = 0.3601
k = 3: P(111) = 0.6147   formula sin^2((2k+1)θ) = 0.6147
k = 4: P(111) = 0.8395   formula sin^2((2k+1)θ) = 0.8395
k = 5: P(111) = 0.9762   formula sin^2((2k+1)θ) = 0.9762
```

The simulation matches the formula exactly. After 5 rounds (11 uses of A or A† in total), success is 97.6%. Repeating A on its own, you'd need about 1/0.0165 ≈ 60 runs on average to see 111 once. And since the formula predicts the best k ≈ π/(4 × 0.129) − ½ ≈ 5.6, five rounds is right where we should stop.

## Don't overshoot

Rotation keeps going. After about π/(4θ) rounds the state passes |good⟩ and starts coming back down: at k = 6 in the example above, P would already be lower, about 0.989, and it then drops quickly. This is the main practical difficulty: **to stop at the right time, you need to know θ**, which means knowing p.

What if you don't? Three standard answers:

| Situation | Method |
|---|---|
| p unknown, want a good outcome | Try random numbers of rounds from a growing range (Boyer, Brassard, Høyer and Tapp, 1998). Still ~1/√p on average |
| p unknown, overshooting unacceptable | **Fixed-point** amplitude amplification (Yoder, Low and Chuang, 2014): uses rotations by carefully chosen angles instead of sign flips, so it approaches the target without ever overshooting |
| Want to know p itself | **Amplitude estimation** (next section) |

## Amplitude estimation: measuring p quadratically faster

Often you don't want a good outcome at all. You want the **number** p: "what's the probability that this portfolio loses money?", "what fraction of these configurations satisfy the constraint?". The classical method is sampling: run A N times and count. Lesson 5's shot noise gives an error of about

> **classical error ≈ √(p(1 − p)/N) ∝ 1/√N**

Amplitude estimation gets an error of about

> **quantum error ∝ 1/N**

for N uses of A. That's quadratically better: to get 10× more precision, sampling needs 100× more runs; amplitude estimation needs only 10×.

**How?** The key is in the formula sin²((2k + 1)θ). After k rounds, the outcome probability depends on (2k + 1)θ: a small change in θ gets **multiplied** by 2k + 1. Measuring after many rounds is like using a longer lever: it magnifies the angle you're trying to measure.

The original version (Brassard and colleagues, 2000) does this with quantum phase estimation (Lesson 27): Q is a rotation by 2θ, so its eigenvalues are e^(±2iθ), and phase estimation reads θ out directly. That needs a deep, controlled circuit. Newer versions (maximum-likelihood and iterative amplitude estimation, around 2019–2020) skip phase estimation: they just run the circuit with k = 0, 1, 2, 4, 8, … rounds, a few shots each, and fit θ to all the results. They keep the 1/N scaling and are much friendlier to hardware.

Here's that idea, simulated. We use the exact outcome probabilities sin²((2k + 1)θ) to generate random shot counts, then fit θ by maximum likelihood, and compare the error with plain sampling **for the same total number of uses of A**:

```python
import numpy as np
rng = np.random.default_rng(25)
p_true = 0.3                                   # the probability we want to estimate
theta_true = np.arcsin(np.sqrt(p_true))
grid = np.linspace(1e-4, np.pi / 2 - 1e-4, 20001)   # candidate values of theta

def monte_carlo(queries):
    """Plain sampling: each query is one run of A and one measurement."""
    return rng.binomial(queries, p_true) / queries

def amplitude_estimation(max_power, shots=20):
    """Run A then k rounds of Q, for k = 0, 1, 2, 4, ..., and fit theta to all the results."""
    ks = [0] + [2 ** j for j in range(max_power + 1)]
    loglik, queries = np.zeros_like(grid), 0
    for k in ks:
        hits = rng.binomial(shots, np.sin((2 * k + 1) * theta_true) ** 2)
        q = np.clip(np.sin((2 * k + 1) * grid) ** 2, 1e-12, 1 - 1e-12)
        loglik += hits * np.log(q) + (shots - hits) * np.log(1 - q)
        queries += shots * (2 * k + 1)         # each round uses A twice (A and A-dagger)
    return np.sin(grid[np.argmax(loglik)]) ** 2, queries

print(" queries   error (plain sampling)   error (amplitude estimation)")
for m in [3, 5, 7, 9]:
    ae = [amplitude_estimation(m) for _ in range(300)]
    budget = ae[0][1]
    err_ae = np.sqrt(np.mean([(est - p_true) ** 2 for est, _ in ae]))
    err_mc = np.sqrt(np.mean([(monte_carlo(budget) - p_true) ** 2 for _ in range(300)]))
    print(f"{budget:8d}   {err_mc:.5f}                  {err_ae:.5f}")
```

```text
 queries   error (plain sampling)   error (amplitude estimation)
     700   0.01747                  0.00576
    2660   0.00930                  0.00115
   10380   0.00447                  0.00065
   41140   0.00228                  0.00014
```

Read the columns from top to bottom. The budget grows about 59×. Plain sampling's error shrinks about 7.7× (that's √59: the 1/√N law). Amplitude estimation's error shrinks about 41×, close to the full 59× of a 1/N law. At the largest budget it's **16 times more accurate** for the same cost.

## Where it's used, and the catch

| Application | What amplitude estimation gives |
|---|---|
| **Monte Carlo pricing and risk** in finance (Lesson 46) | Expected values with quadratically fewer samples |
| **Quantum counting** | The number of solutions to a search problem, which also tells Grover when to stop |
| **Estimating integrals and averages** in physics and engineering | Same quadratic saving as sampling-based numerics |
| **Speeding up other quantum algorithms** | Boosting any subroutine that succeeds only sometimes |

The catch is the same as for Grover (Lesson 24):

- **It's quadratic, not exponential.** A problem that takes a classical computer 10¹² samples might take 10⁶ quantum runs, but each quantum run is far slower and more expensive than a classical sample.
- **It needs deep, coherent circuits.** Many rounds of Q, each containing A twice, must run without errors. In practice that means error-corrected machines (Part F).
- **A must be a quantum circuit.** You need A†, and you need to load the probability distribution you're sampling from into a quantum state efficiently, which is often the hardest part.

Studies of realistic financial workloads estimate that a genuine advantage needs thousands of logical qubits and fast error-corrected gates. Amplitude estimation is one of the best-understood quantum speed-ups, and one of the most likely to matter **eventually**, but not on today's hardware.

## Try it

1. A procedure succeeds with probability p = 1/400. Roughly how many classical repetitions, and how many rounds of amplitude amplification, do you need?
2. For p = 0.25, what is θ? How many rounds k make success certain?
3. In the code's example, what would P(111) be after k = 7 rounds? (Use the formula.)
4. Why does reflecting twice across lines at angle θ give a rotation by 2θ?
5. To estimate a probability to ±0.001, roughly how many samples does plain sampling need for p near 0.5? Roughly how many uses of A for amplitude estimation (ignoring constant factors)?
6. Why is Grover's search a special case of amplitude amplification?

**Answers:**

1. Classically about **400**. θ ≈ √(1/400) = 0.05 rad, so k ≈ π/(4 × 0.05) ≈ **16 rounds**.
2. sin²θ = ¼ → **θ = 30°**. With k = 1: (2·1 + 1) × 30° = 90°, so **one round** gives certainty.
3. (2·7 + 1) × 7.38° = 110.7°, and sin²(110.7°) ≈ **0.875**: past the peak and falling.
4. Each reflection reverses the angle relative to its mirror line; doing two in a row adds up to twice the angle between the lines (a standard geometry fact).
5. √(0.25/N) = 0.001 → N ≈ **250,000** samples. Amplitude estimation needs on the order of 1/0.001 ≈ **1,000** uses of A (times a modest constant).
6. With A = H⊗ⁿ and one marked item, A|0⟩ is the uniform superposition and p = 1/N; Q is exactly Grover's "oracle then diffusion" round.

## Cheat sheet

| Idea | Formula or fact |
|---|---|
| Starting state | A\|0⟩ = sin θ\|good⟩ + cos θ\|bad⟩, p = sin²θ |
| Classical repetition | ~1/p runs |
| One round | Q = A · S₀ · A† · S_good |
| Geometry | Two reflections = rotation by 2θ |
| After k rounds | P(good) = sin²((2k + 1)θ) |
| Best k | ≈ π/(4θ) − ½ ≈ (π/4)/√p |
| Overshoot | Too many rounds lowers P again |
| Unknown p | Random schedules (BBHT), or fixed-point amplification |
| Grover | A = H⊗ⁿ, one marked item, p = 1/N |
| Amplitude estimation | Error ∝ 1/N (vs 1/√N for sampling) |
| How | Q's eigenvalues are e^(±2iθ); or fit results for k = 0, 1, 2, 4, … |
| Uses | Monte Carlo in finance, counting, integrals |
| Catch | Quadratic only; needs deep error-corrected circuits and efficient state loading |
