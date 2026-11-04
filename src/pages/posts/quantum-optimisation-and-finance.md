---
layout: ../../layouts/Post.astro
title: "Quantum optimisation and finance"
description: "What quantum computers can and can't do for optimisation and finance, with every claim tested in code. Turning problems into QUBO and Ising form, MaxCut solved by brute force, QAOA at increasing depth (simulated and optimised), quantum annealing and the adiabatic theorem (simulated), the strong classical competition, Monte Carlo option pricing versus quantum amplitude estimation (computed), resource estimates, and an honest scorecard."
date: 2026-11-04
category: lesson
lesson: 46
---

Optimisation is everywhere: routing delivery vans, scheduling trains and factory shifts, assigning frequencies to mobile towers, designing chips, choosing investments. Finance adds a second big workload: estimating risks and prices by simulating thousands of possible futures. Both are attractive markets, and both appear in almost every list of quantum applications.

Lesson 31 already gave the ground rules: quantum computers are not expected to solve NP-hard problems efficiently, and quadratic speed-ups only pay off on large, error-corrected machines. This lesson looks at what's actually proposed, runs the main algorithms on small examples, and compares them honestly with classical methods.

## Turning problems into energies: QUBO and Ising

Most quantum optimisation methods need the problem in one standard form: **QUBO**, quadratic unconstrained binary optimisation. Choose binary variables x₁, …, xₙ (each 0 or 1) to minimise a quadratic function:

> cost(x) = Σᵢ Qᵢᵢ xᵢ + Σᵢ<ⱼ Qᵢⱼ xᵢ xⱼ

Many problems fit, sometimes after adding penalty terms for constraints: scheduling, routing, graph colouring, portfolio selection. Substituting xᵢ = (1 − zᵢ)/2 with zᵢ = ±1 turns a QUBO into an **Ising model**, an energy function of the form Σ Jᵢⱼ zᵢzⱼ + Σ hᵢzᵢ, and replacing each zᵢ by the Pauli operator Zᵢ gives a quantum Hamiltonian whose **ground state is the best answer**. Optimisation becomes "find the lowest-energy state", the same task as in chemistry (Lesson 45).

The standard test problem is **MaxCut**: split the nodes of a network into two groups to cut as many links as possible. Here's a small instance, solved by checking every possibility:

```python
import itertools

# A small network: 6 nodes, 9 links. MaxCut: split the nodes into two groups, cutting as many links as possible.
edges = [(0, 1), (0, 2), (1, 2), (1, 3), (2, 4), (3, 4), (3, 5), (4, 5), (0, 5)]
n = 6

def cut_size(bits):
    return sum(bits[i] != bits[j] for i, j in edges)

best = max(itertools.product([0, 1], repeat=n), key=cut_size)
print("best split:", "".join(map(str, best)), " links cut:", cut_size(best), "of", len(edges))
print("checked all", 2 ** n, "possible splits; with 100 nodes that would be", f"{2.0 ** 100:.1e}")
```

```text
best split: 001101  links cut: 7 of 9
checked all 64 possible splits; with 100 nodes that would be 1.3e+30
```

For 6 nodes, there are only 64 splits to check. For 100 nodes there are about 10³⁰, and MaxCut is NP-hard, so no known algorithm, classical or quantum, finds the exact best cut efficiently for every network. But good **approximate** answers are often enough in practice, and that's where quantum heuristics aim.

For MaxCut, each link (i, j) contributes Zᵢ Zⱼ to the Hamiltonian: +1 if both ends are in the same group (not cut), −1 if they're split. Minimising Σ ZᵢZⱼ maximises the cut.

## QAOA: the gate-based approach

The **quantum approximate optimisation algorithm** (Farhi, Goldstone and Gutmann, 2014) was introduced in Lesson 30. It starts in an equal superposition of all answers and alternates two kinds of layer, p times:

1. a **problem layer**, e^(−iγ H_problem), which gives each answer a phase depending on its cost (for MaxCut, an RZZ rotation on every link), and
2. a **mixer layer**, e^(−iβ Σ Xᵢ), which lets amplitude flow between neighbouring answers.

A classical optimiser tunes the 2p angles to maximise the expected cut. Let's run QAOA on our network for p = 1, 2 and 3, with several random starting points for the optimiser:

```python
import itertools
import numpy as np
from scipy.optimize import minimize
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

edges = [(0, 1), (0, 2), (1, 2), (1, 3), (2, 4), (3, 4), (3, 5), (4, 5), (0, 5)]
n, best_cut = 6, 7

def qaoa(params, p):
    gammas, betas = params[:p], params[p:]
    qc = QuantumCircuit(n)
    qc.h(range(n))                                   # start in an equal superposition of all splits
    for g, b in zip(gammas, betas):
        for i, j in edges:
            qc.rzz(2 * g, i, j)                      # problem layer: phase depends on whether the link is cut
        qc.rx(2 * b, range(n))                       # mixer layer: lets amplitude flow between splits
    return Statevector(qc).probabilities_dict()

def expected_cut(params, p):
    return sum(prob * sum(k[n - 1 - i] != k[n - 1 - j] for i, j in edges) for k, prob in qaoa(params, p).items())

rng = np.random.default_rng(1)
print("layers p   average cut   approx. ratio   chance of an optimal split")
for p in [1, 2, 3]:
    runs = [minimize(lambda x: -expected_cut(x, p), rng.uniform(0, np.pi, 2 * p), method="COBYLA") for _ in range(8)]
    best = min(runs, key=lambda r: r.fun)
    probs = qaoa(best.x, p)
    p_opt = sum(prob for k, prob in probs.items() if sum(k[n - 1 - i] != k[n - 1 - j] for i, j in edges) == best_cut)
    print(f"   {p}          {-best.fun:.3f}         {-best.fun / best_cut:.3f}           {p_opt:.3f}")
print(f"random guessing: average cut {len(edges) / 2:.1f}, ratio {len(edges) / 2 / best_cut:.3f}")
```

```text
layers p   average cut   approx. ratio   chance of an optimal split
   1          5.939         0.848           0.401
   2          6.603         0.943           0.721
   3          6.878         0.983           0.923
random guessing: average cut 4.5, ratio 0.643
```

As the depth grows, QAOA's average cut climbs from 85% to 98% of the optimum, and the chance of measuring an optimal split rises from 40% to 92%. That's real progress over random guessing (64%). In the limit of infinitely many layers, QAOA is guaranteed to find the optimum, because it approximates the adiabatic process described next.

But keep the classical comparison in mind. For MaxCut, the **Goemans–Williamson algorithm** (1995) guarantees at least 87.8% of the optimum on **every** graph in polynomial time, and good classical heuristics (simulated annealing, local search, commercial solvers like Gurobi and CPLEX) often find optimal or near-optimal cuts for networks with thousands of nodes. Low-depth QAOA has provable guarantees **below** Goemans–Williamson on some graph families, and deeper QAOA needs more gates, more noise and harder optimisation (including barren plateaus, Lesson 45).

## Quantum annealing: the analogue approach

The **adiabatic theorem** says that if a quantum system starts in the ground state of a Hamiltonian, and the Hamiltonian is changed **slowly enough**, the system stays in the ground state. **Quantum annealing** uses this: start with a simple Hamiltonian whose ground state is easy (all qubits in |+⟩), slowly morph it into the problem Hamiltonian, and the system should end in the problem's ground state, the best answer:

> H(s) = (1 − s)·H_start + s·H_problem,  with s going slowly from 0 to 1

Let's simulate this for our network, with different total annealing times T:

```python
import numpy as np
from scipy.linalg import expm
from qiskit.quantum_info import SparsePauliOp

edges = [(0, 1), (0, 2), (1, 2), (1, 3), (2, 4), (3, 4), (3, 5), (4, 5), (0, 5)]
n, best_cut = 6, 7

def zz(i, j):
    label = ["I"] * n; label[n - 1 - i] = "Z"; label[n - 1 - j] = "Z"
    return "".join(label)
def x(i):
    label = ["I"] * n; label[n - 1 - i] = "X"
    return "".join(label)

# Problem Hamiltonian: energy = (number of uncut links) - (cut links); lowest energy = best cut
H_problem = SparsePauliOp([zz(i, j) for i, j in edges]).to_matrix()
H_start = -SparsePauliOp([x(i) for i in range(n)]).to_matrix()     # ground state: equal superposition

ground0 = np.ones(2 ** n) / np.sqrt(2 ** n)
cuts = np.array([sum(((k >> i) & 1) != ((k >> j) & 1) for i, j in edges) for k in range(2 ** n)])

print(f"random guess: {np.mean(cuts == best_cut):.3f}")
print("anneal time T   chance of ending in an optimal split")
for T in [1, 3, 10, 30, 100]:
    steps = 200
    psi = ground0.astype(complex)
    for k in range(steps):
        s = (k + 0.5) / steps                                       # slowly turn the problem on
        H = (1 - s) * H_start + s * H_problem
        psi = expm(-1j * H * T / steps) @ psi
    print(f"     {T:4d}            {np.sum(np.abs(psi[cuts == best_cut]) ** 2):.3f}")
```

```text
random guess: 0.094
anneal time T   chance of ending in an optimal split
        1            0.252
        3            0.825
       10            0.993
       30            1.000
      100            1.000
```

A fast anneal (T = 1) barely beats guessing. A slow one (T = 30 or more) ends in an optimal split almost every time. How slow is "slow enough"? The required time grows as the **energy gap** between the ground state and the first excited state shrinks during the anneal, roughly like 1/gap². For hard problem instances, that gap can become **exponentially small**, which makes the anneal exponentially long. That's the deep reason annealing doesn't escape NP-hardness.

**D-Wave Systems** builds commercial quantum annealers with thousands of superconducting qubits (its Advantage machines have over 5,000). They are not universal gate-based computers; they're specialised analogue devices that run noisy, finite-temperature versions of this process. Many studies over the past decade found that well-tuned classical algorithms match or beat them on optimisation benchmarks. In 2025, D-Wave reported a beyond-classical result in **simulating** the dynamics of magnetic materials, which is a physics simulation task (Lesson 29) rather than optimisation, and, like every advantage claim, it prompted classical counter-studies.

## Finance: pricing and risk with Monte Carlo

Banks price complex financial products (options, derivatives) and estimate risk (such as Value at Risk) by **Monte Carlo simulation**: generate many random future scenarios, compute the outcome of each, and average. The error falls like **1/√N** with N samples, so each extra digit of precision costs 100 times more samples, and large banks run these calculations overnight on big computing clusters.

**Quantum amplitude estimation** (Lesson 25) estimates the same average with error falling like **1/N** in the number of quantum "oracle" calls, a quadratic speed-up. Let's see the classical side, pricing a simple option whose exact price is known from the Black–Scholes formula:

```python
import numpy as np
from scipy.stats import norm

# A European call option: the right to buy a share at K = ₹110 in one year. Today's price S0 = ₹100.
S0, K, r, sigma, T = 100.0, 110.0, 0.06, 0.25, 1.0
d1 = (np.log(S0 / K) + (r + sigma ** 2 / 2) * T) / (sigma * np.sqrt(T))
exact = S0 * norm.cdf(d1) - K * np.exp(-r * T) * norm.cdf(d1 - sigma * np.sqrt(T))     # Black–Scholes formula

rng = np.random.default_rng(3)
print(f"exact price (Black–Scholes): ₹{exact:.4f}\n")
print("   samples N    Monte Carlo estimate (± standard error)")
for N in [1_000, 10_000, 100_000, 1_000_000]:
    z = rng.standard_normal(N)
    ST = S0 * np.exp((r - sigma ** 2 / 2) * T + sigma * np.sqrt(T) * z)               # simulated prices in a year
    payoff = np.exp(-r * T) * np.maximum(ST - K, 0)
    print(f"{N:12,d}      ₹{payoff.mean():.4f} ± {payoff.std() / np.sqrt(N):.4f}")

# How many samples (classical) or oracle calls (amplitude estimation) to reach ±1 paisa?
spread, eps = payoff.std(), 0.01
print(f"\nfor ±₹0.01: classical Monte Carlo ≈ {(spread / eps) ** 2:,.0f} samples;  "
      f"amplitude estimation ≈ {spread / eps:,.0f} oracle calls")
```

```text
exact price (Black–Scholes): ₹8.4297

   samples N    Monte Carlo estimate (± standard error)
       1,000      ₹8.9187 ± 0.5106
      10,000      ₹8.5024 ± 0.1580
     100,000      ₹8.4091 ± 0.0498
   1,000,000      ₹8.4328 ± 0.0158

for ±₹0.01: classical Monte Carlo ≈ 2,492,886 samples;  amplitude estimation ≈ 1,579 oracle calls
```

Classical Monte Carlo homes in on the exact price, with the standard error shrinking by about √10 for every tenfold increase in samples. To reach ±1 paisa would take about 2.5 million samples, while ideal amplitude estimation would need only about 1,600 oracle calls.

That looks dramatic, but Lesson 31's crossover analysis applies. Each "oracle call" is a large quantum circuit: it must load the probability distribution of future prices into amplitudes and compute the payoff reversibly, using many logical qubits and T gates. A 2021 study by Goldman Sachs and IBM researchers estimated that pricing a realistic derivative faster than classical methods would require thousands of logical qubits and error-corrected gate speeds far beyond today's hardware. Meanwhile, a classical sample on a GPU costs nanoseconds, and classical methods have their own speed-ups (quasi-Monte Carlo, variance reduction) that improve on 1/√N.

So quantum finance is a credible **long-term** application, with a proven quadratic speed-up at its core, but it belongs to the fault-tolerant era. Other finance proposals, such as portfolio optimisation as a QUBO, face the same issues as other optimisation problems.

## An honest scorecard

| Area | Quantum method | Speed-up | Status |
|---|---|---|---|
| Combinatorial optimisation (MaxCut, scheduling, routing) | QAOA, quantum annealing | Heuristic; no proven speed-up for NP-hard problems | No demonstrated practical advantage over the best classical solvers |
| Structured optimisation (some special problems) | Specialised quantum algorithms | Sometimes polynomial, proven for narrow cases | Research |
| Monte Carlo pricing and risk | Amplitude estimation | Quadratic (proven) | Needs large fault-tolerant machines |
| Portfolio optimisation | QUBO with QAOA or annealing | Heuristic | Small demonstrations only |
| Simulating physical systems (for materials, chemistry) | Hamiltonian simulation | Often exponential | The most promising area (Lessons 29, 45) |

Two practical points are worth remembering. First, many "quantum-inspired" algorithms, classical methods borrowing ideas from quantum computing, have produced real business value on their own. Second, learning to formulate problems as QUBOs and Hamiltonians is useful regardless of the hardware: the same formulations run on classical solvers, annealers and gate-based machines, so companies can prepare now and switch when the hardware is ready.

## Try it

1. Write MaxCut on a single link between nodes 0 and 1 as an Ising Hamiltonian. Which states are its ground states?
2. Why can't QAOA or annealing be expected to solve every MaxCut instance exactly and efficiently?
3. In the QAOA table, how much did the chance of measuring an optimal split grow from p = 1 to p = 3?
4. What is the Goemans–Williamson guarantee, and why does it matter when judging QAOA?
5. In the annealing simulation, why does a slow anneal succeed while a fast one doesn't?
6. Classical Monte Carlo needs N samples for error ε ∝ 1/√N. How many samples does a tenfold improvement in precision need? And with amplitude estimation?
7. Why doesn't the 1,600-versus-2.5-million comparison mean quantum computers will price options faster soon?

**Answers:**

1. H = Z₀Z₁. Its ground states (energy −1) are **|01⟩ and |10⟩**, the two ways of cutting the link.
2. MaxCut is NP-hard, and quantum computers are not believed to solve NP-hard problems efficiently (Lesson 31). In annealing terms, hard instances have exponentially small gaps, requiring exponentially long anneals; QAOA would need correspondingly deep circuits.
3. From about **40% to 92%**.
4. A classical polynomial-time algorithm that always achieves at least **87.8%** of the maximum cut. A quantum heuristic needs to beat this (and practical classical solvers) to be worthwhile; low-depth QAOA doesn't always.
5. The adiabatic theorem: changing the Hamiltonian slowly compared with the inverse square of the energy gap keeps the system in the ground state. A fast change causes jumps to excited states, which are worse answers.
6. **100 times** more samples classically. With amplitude estimation, error ∝ 1/N, so only **10 times** more oracle calls.
7. Each oracle call is a large, deep, error-corrected circuit that must load a probability distribution and compute the payoff, far slower than a classical sample on a GPU. Estimates require thousands of logical qubits and very fast logical gates, not available for years.

## Cheat sheet

| Idea | Formula or fact |
|---|---|
| QUBO | Minimise Σ Qᵢᵢxᵢ + Σ Qᵢⱼxᵢxⱼ over binary x |
| Ising | x = (1 − z)/2; H = Σ JᵢⱼZᵢZⱼ + Σ hᵢZᵢ; ground state = best answer |
| MaxCut | Each link gives ZᵢZⱼ; minimise Σ ZᵢZⱼ; NP-hard |
| QAOA (2014) | p layers of e^(−iγH_problem) and e^(−iβΣX); 2p angles tuned classically |
| QAOA on the example | p = 1, 2, 3: ratio 0.85 → 0.94 → 0.98; P(optimal) 0.40 → 0.92 |
| Goemans–Williamson | Classical guarantee of 87.8% for MaxCut (1995) |
| Adiabatic theorem | Change H slowly compared with 1/gap² and stay in the ground state |
| Quantum annealing | H(s) = (1 − s)H_start + sH_problem; D-Wave (5,000+ qubits) |
| Hard instances | Exponentially small gaps → exponentially long anneals |
| Monte Carlo | Error ∝ 1/√N: 100× samples per extra digit |
| Amplitude estimation | Error ∝ 1/N oracle calls: quadratic speed-up |
| Finance reality | Thousands of logical qubits and fast logical gates needed (2021 estimates) |
| Status | Optimisation: no demonstrated advantage; finance: fault-tolerant era; simulation: most promising |
