---
layout: ../../layouts/Post.astro
title: "What quantum computers can and can't do"
description: "An honest map of quantum speed-ups: the complexity classes P, NP and BQP, why quantum computers almost certainly can't solve NP-complete problems fast, which problems have exponential, quadratic or no speed-up, the data loading and readout bottlenecks, when a quadratic speed-up actually pays off (computed), and what the 'quantum advantage' experiments of 2019–2025 did and didn't show."
date: 2026-11-04
category: lesson
lesson: 31

---

You've now seen the main quantum algorithms: Deutsch–Jozsa, Bernstein–Vazirani, Simon, Grover, amplitude amplification, the QFT, phase estimation, Shor, simulation and variational methods. This lesson steps back and asks the question everyone outside the field asks first: **so what can a quantum computer actually do better?**

The honest answer is: a few important things, much better; some things, somewhat better; and most things, not better at all. Knowing which is which is what separates a quantum professional from someone repeating headlines. By the end of this lesson you should be able to look at any claimed quantum application and ask the right three questions.

## The most common myth

> "A quantum computer tries every possible answer at the same time, so it can solve any problem instantly."

The first half is a loose description of superposition. The second half is false. A quantum computer **can** put a register into a superposition of all 2ⁿ inputs and compute f on all of them in one go. But measuring gives **one** random input–output pair (Lesson 12's Holevo bound). That's no better than picking one input at random classically.

Every real quantum speed-up comes from **interference**: arranging the computation so that wrong answers cancel and the right answer survives (Lessons 2 and 22). Interference only works when the problem has the right **structure**, like a hidden period. No structure, no interference, no speed-up.

## Complexity classes: a map of hardness

Computer scientists sort problems by how their cost grows with the input size n. "Efficient" means the cost grows **polynomially** (like n² or n³), not **exponentially** (like 2ⁿ).

| Class | Meaning | Examples |
|---|---|---|
| **P** | Solvable efficiently by a classical computer | Sorting, shortest paths, checking if a number is prime, linear equations |
| **NP** | A proposed answer can be **checked** efficiently | Sudoku, scheduling, the travelling salesman (decision version), factoring |
| **NP-complete** | The hardest problems in NP: solve one efficiently and you solve them all | SAT, travelling salesman, graph colouring, many scheduling problems |
| **BQP** | Solvable efficiently by a quantum computer (with small error) | Everything in P, plus factoring, discrete log, simulating quantum systems |

What's known and believed:

- **P ⊆ BQP:** a quantum computer can do anything a classical one can (with reversible gates, Lesson 1).
- **Factoring is in BQP** (Shor) but is **not known** to be in P. It's in NP, but is believed **not** to be NP-complete.
- **NP-complete problems are believed not to be in BQP.** Nobody has proved it (that would also prove P ≠ NP, one of the biggest open problems in mathematics). But there's strong evidence: for unstructured search, **Grover's √N is provably optimal** (Bennett, Bernstein, Brassard and Vazirani, 1997). Any quantum algorithm that treats the problem as a black box needs at least about √N oracle calls. So a 2ⁿ brute-force search becomes 2^(n/2), still exponential.

The picture that emerges: BQP sits a little outside P, covering some problems with special structure, but doesn't swallow NP.

## Three kinds of speed-up

| Speed-up | Examples | Why it helps |
|---|---|---|
| **Exponential** (or super-polynomial) | Factoring and discrete log (Shor, Lesson 28); simulating quantum systems (Lesson 29); some algebraic problems | Turns "impossible" into "routine" for large inputs |
| **Polynomial**, usually quadratic | Unstructured search (Grover, Lesson 24); amplitude estimation for Monte Carlo (Lesson 25); some optimisation subroutines | Real, but eaten up by overheads unless the problem is huge |
| **None known** | Sorting, databases, spreadsheets, web serving, most of machine learning, video games, word processing | Quantum computers won't replace your laptop |

Notice the shape of the first row: problems with hidden **algebraic structure** (periods, groups) and problems that are **quantum to begin with** (molecules, materials). That's where the exponential power lives.

## The input and output bottleneck

Even when an algorithm has a speed-up, two practical questions decide whether it helps.

**Can you get the data in?** Many proposed algorithms (for linear algebra and machine learning) assume the input data is already stored in a quantum state's amplitudes. Loading N classical numbers into amplitudes takes, in general, about N operations, which can cancel an exponential speed-up completely. A proposed fix, **quantum RAM (QRAM)**, would load data quickly, but nobody knows how to build a large, error-free one.

**Can you get the answer out?** The output is a quantum state with 2ⁿ amplitudes, but you can only sample from it. If your problem needs the whole solution vector, you're stuck. Useful algorithms output something short: a factor, an energy, a yes/no.

**Dequantisation.** In 2018, Ewin Tang, then an 18-year-old undergraduate, showed that a celebrated quantum algorithm for recommendation systems could be matched by a classical algorithm that's given the same kind of data access. Similar "dequantisations" followed for several quantum machine-learning proposals. The lesson: a speed-up claim must compare against the best classical algorithm **with the same assumptions**, not against a naive one.

## When does a quadratic speed-up pay off?

Grover's search needs (π/4)·√N steps, against N classical checks. For big N, √N is far smaller. But each quantum step is far **slower**: an error-corrected logical operation may take microseconds, a full Grover iteration (with a nontrivial oracle, built from many logical gates) much longer, while a classical core does about a billion simple checks per second, and you can buy many cores.

So where's the break-even point? Set the two running times equal:

> N / (cores × 10⁹ per second) = (π/4) · √N · (time per Grover step)

```python
import numpy as np

def crossover(grover_step_seconds, classical_cores, checks_per_core=1e9):
    """Search size N where Grover's (π/4)·√N steps take as long as N classical checks."""
    rate = classical_cores * checks_per_core                    # classical checks per second
    root_n = (np.pi / 4) * grover_step_seconds * rate          # from N / rate = (π/4)·√N·step
    n = root_n ** 2
    return n, n / rate                                         # size, and time to break even

def readable(seconds):
    for unit, size in [("days", 86400), ("hours", 3600), ("minutes", 60), ("seconds", 1)]:
        if seconds >= size:
            return f"{seconds / size:.1f} {unit}"
    return f"{seconds * 1000:.2f} milliseconds"

for step, cores in [(1e-6, 1), (1e-4, 1), (1e-4, 1000), (1e-3, 10000)]:
    n, t = crossover(step, cores)
    print(f"Grover step {step * 1e6:5.0f} µs vs {cores:5d} classical cores: "
          f"break-even at N ≈ {n:.0e}, after {readable(t)}")
```

```text
Grover step     1 µs vs     1 classical cores: break-even at N ≈ 6e+05, after 0.62 milliseconds
Grover step   100 µs vs     1 classical cores: break-even at N ≈ 6e+09, after 6.2 seconds
Grover step   100 µs vs  1000 classical cores: break-even at N ≈ 6e+15, after 1.7 hours
Grover step  1000 µs vs 10000 classical cores: break-even at N ≈ 6e+19, after 71.4 days
```

Read the last lines. With a realistic error-corrected step time (100 µs to 1 ms per Grover iteration, including a real oracle) against a modest classical cluster, the quantum computer only **starts** to win after hours to months of running. And that ignores the error-correction overhead in qubits and the fact that classical algorithms usually aren't brute force. A widely cited 2021 analysis by Google researchers (Babbush and colleagues) reached the same conclusion: **quadratic speed-ups are unlikely to give practical advantage on early error-corrected machines**; the first useful applications will need bigger-than-quadratic speed-ups.

## "Quantum advantage" experiments

Since 2019, several experiments have claimed that a quantum device did something no classical computer could do in reasonable time. It's worth knowing what each one showed.

| Year | Who | What | Status |
|---|---|---|---|
| 2019 | Google (Sycamore, 53 qubits) | Random circuit sampling: claimed 200 seconds vs 10,000 years | Improved classical algorithms later cut the classical estimate to hours or less for that experiment |
| 2020–21 | USTC, China (Jiuzhang photonic device; Zuchongzhi superconducting) | Gaussian boson sampling and random circuit sampling | Classical spoofing methods have challenged some claims; larger later versions remain hard |
| 2023 | IBM (Eagle, 127 qubits) | "Utility": dynamics of a kicked Ising model with error mitigation | Reproduced classically within weeks by tensor-network methods (Lesson 29) |
| Dec 2024 | Google (Willow, 105 qubits) | Random circuit sampling estimated at 10²⁵ years classically; and error correction **below threshold** (Lesson 35) | The error-correction result is a major engineering milestone |
| Oct 2025 | Google (Willow) | "Quantum Echoes": an out-of-time-order correlator measurement claimed about 13,000× faster than the best classical method, and **verifiable** by repeating it | A step towards useful tasks; independent classical challenges are the normal next step |

The pattern is healthy science: a quantum claim, a classical counter-attack that sometimes closes the gap, and a new quantum experiment that pushes further. The tasks so far have been chosen to be hard for classical computers rather than useful in themselves. The field's next goal is **useful quantum advantage**: a result someone actually needs, that couldn't be obtained classically. As of 2026, that milestone is the subject of intense work but hasn't been clearly established for a practical problem.

## Three questions for any quantum claim

When you read "quantum computer will revolutionise X", ask:

1. **What's the speed-up, and over what?** Exponential, polynomial, or none? Compared with the **best** classical method, or a naive one?
2. **Where do the data come from and where do they go?** Is there an efficient way to load the input and read the output?
3. **What hardware does it need?** How many logical qubits, how many T gates, how long? Is it a near-term noisy machine or a large error-corrected one?

If a claim can't answer all three, treat it as a research direction, not a result. That's the honest attitude this course tries to teach, and it's what employers in the field value most.

## Try it

1. Why doesn't putting a register into a superposition of all inputs, and computing f on all of them, solve problems by itself?
2. A problem has 2⁸⁰ candidate answers and no structure. Roughly how many Grover iterations would it need? Is that feasible?
3. Which class is factoring believed to be in: P, NP-complete, or neither?
4. What two bottlenecks can cancel the speed-up of a quantum linear-algebra algorithm?
5. Using the crossover formula, how does the break-even N change if the classical side has 100 times more cores?
6. What's the difference between "quantum advantage" and "useful quantum advantage"?

**Answers:**

1. Measuring gives just one random input–output pair. Without interference that favours the right answer, it's no better than random sampling.
2. About (π/4)·2⁴⁰ ≈ 8.6 × 10¹¹ iterations. At even 1 µs each that's about 10 days of perfect error-corrected running, and realistically far longer: **not practical**.
3. **Neither**: it's in NP, believed not in P and believed not NP-complete. It is in BQP.
4. **Loading** the data into amplitudes, and **reading out** the answer from a quantum state.
5. N scales with (cores)², so **10,000 times larger**; the break-even time grows 100×.
6. Quantum advantage: a quantum device beats classical computers at **some** task, even a contrived one. Useful quantum advantage: it does so for a task someone actually needs.

## Cheat sheet

| Idea | Formula or fact |
|---|---|
| The myth | "Tries all answers at once": measurement gives just one |
| The truth | Speed-ups come from interference, which needs structure |
| P | Efficient classically |
| NP | Answers checkable efficiently |
| BQP | Efficient on a quantum computer; contains P |
| Factoring | In BQP and NP; not known in P; not NP-complete |
| NP-complete | Believed not in BQP |
| Search lower bound | Ω(√N): Grover is optimal (BBBV, 1997) |
| Exponential speed-ups | Factoring, discrete log, quantum simulation |
| Quadratic speed-ups | Search, amplitude estimation, Monte Carlo |
| Bottlenecks | Data loading (QRAM), output readout |
| Dequantisation | Tang (2018): some quantum ML speed-ups vanish classically |
| Break-even for Grover | N* = ((π/4) × step time × classical rate)² |
| Advantage experiments | 2019 Sycamore, 2020 Jiuzhang, 2023 IBM utility, 2024 Willow, 2025 Quantum Echoes |
| Three questions | What speed-up vs what? Data in and out? What hardware? |
