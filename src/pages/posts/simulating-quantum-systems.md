---
layout: ../../layouts/Post.astro
title: "Simulating quantum systems"
description: "The application Feynman proposed quantum computers for: Hamiltonians as sums of Pauli terms, turning e^(−iHt) into gates, building each Pauli exponential from CNOTs and one rotation, Trotter steps and their errors (first and second order, measured in code), what simulations compute, and an honest look at the race with classical methods."
date: 2026-11-04
category: lesson
lesson: 29

---

In 1981, Richard Feynman gave a talk at MIT that is often called the beginning of quantum computing. His argument was simple. Simulating a quantum system on an ordinary computer takes resources that grow **exponentially** with its size (Lesson 1's doubling table). But nature simulates itself effortlessly. So why not build a computer out of quantum parts, and let it imitate other quantum systems directly? As he put it: *"Nature isn't classical, dammit, and if you want to make a simulation of nature, you'd better make it quantum mechanical."*

Forty-odd years later, simulating molecules, materials and other quantum systems is still the application where quantum computers are most likely to make a real difference. This lesson shows how it works: how a physical system is written down, how its evolution in time is turned into gates, what the approximations cost, and where the honest difficulties lie.

## Hamiltonians: the rulebook of a quantum system

Every quantum system is described by its **Hamiltonian** H, a Hermitian matrix (Lesson 4) that represents its **energy**. Two facts make it the central object:

- Its **eigenvalues** are the possible energies, and its eigenvectors are the states with definite energy. The lowest one is the **ground state**.
- It decides how the system changes in time, through the **Schrödinger equation**. The solution is

> **|ψ(t)⟩ = e^(−iHt) |ψ(0)⟩**  (in units where ħ = 1)

e^(−iHt) is a unitary (Lesson 11 built these for single Paulis). So "simulating a quantum system for time t" means "applying the unitary e^(−iHt)" on a quantum computer.

### Hamiltonians as sums of Pauli strings

The Hamiltonians of real systems are usually sums of **simple local terms**, each acting on a few particles. On qubits, each term becomes a Pauli string (Lesson 19). The standard example is the **transverse-field Ising model**, a chain of n tiny magnets:

> H = −J Σᵢ ZᵢZᵢ₊₁ − h Σᵢ Xᵢ

- The **ZZ terms** say neighbouring spins prefer to line up (lower energy when both are 0 or both are 1), with strength J.
- The **X terms** are a sideways magnetic field of strength h that tries to flip each spin.

The two compete: J wants order, h wants quantum fluctuation. At J ≈ h the chain sits at a **quantum phase transition**, where its behaviour is famously hard to compute. It's the "hello world" of quantum simulation, and IBM used a version of it for its 127-qubit "utility" experiment in 2023.

In Qiskit:

> `SparsePauliOp.from_sparse_list([("ZZ", [i, i+1], −J) …] + [("X", [i], −h) …], num_qubits=n)`

## Exponentiating one Pauli term

Start with a single term. How do you build e^(−iθ Z⊗Z) from gates?

Z⊗Z has eigenvalue +1 when the two qubits are equal (00, 11) and −1 when they differ (01, 10): it's the **parity**. So e^(−iθZZ) puts a phase e^(−iθ) on equal-parity states and e^(+iθ) on odd-parity ones. The trick:

1. **CNOT** from qubit 0 to qubit 1: the target now holds the parity.
2. **RZ(2θ)** on the target: phase e^(∓iθ) depending on the parity (Lesson 11).
3. **CNOT** again to uncompute the parity.

For terms with X or Y, change basis first (H turns X into Z, Lesson 9), and for longer strings like ZZZZ, use a ladder of CNOTs to collect the parity of all the qubits onto one, rotate, and uncollect. **Every Pauli exponential costs one rotation plus about 2(k − 1) CNOTs for a string on k qubits.**

```python
import numpy as np
from scipy.linalg import expm
from qiskit import QuantumCircuit
from qiskit.quantum_info import Operator, SparsePauliOp

theta = 0.37
exact = expm(-1j * theta * SparsePauliOp("ZZ").to_matrix())   # e^(-i theta Z Z)

qc = QuantumCircuit(2)
qc.cx(0, 1)
qc.rz(2 * theta, 1)          # RZ(2 theta) = e^(-i theta Z)
qc.cx(0, 1)
print("CNOT - RZ - CNOT equals e^(-i theta ZZ):", np.allclose(Operator(qc).data, exact))

xx = QuantumCircuit(2)       # e^(-i theta X X): the same, seen through Hadamards
xx.h([0, 1]); xx.compose(qc, inplace=True); xx.h([0, 1])
print("with Hadamards around it, e^(-i theta XX):",
      np.allclose(Operator(xx).data, expm(-1j * theta * SparsePauliOp("XX").to_matrix())))
```

```text
CNOT - RZ - CNOT equals e^(-i theta ZZ): True
with Hadamards around it, e^(-i theta XX): True
```

## Trotterisation: many terms at once

If H = A + B, can you just apply e^(−iAt) and then e^(−iBt)? Only if A and B **commute** (AB = BA). For ordinary numbers, e^(a+b) = eᵃeᵇ always. For matrices it fails in general, because order matters (Lesson 4). In the Ising model, ZZ terms and X terms don't commute, so the shortcut is wrong.

But it's **nearly** right for short times. The fix, from the **Lie–Trotter product formula** (Trotter, 1959), is to slice time into r small steps and alternate:

> e^(−i(A+B)t) ≈ (e^(−iAt/r) · e^(−iBt/r))^r

The error of each slice is proportional to (t/r)² times how badly A and B fail to commute, so the total error falls like **t²/r**. More slices, smaller error, more gates.

A cleverer ordering, the **second-order (symmetric) Suzuki–Trotter formula**, uses half a step of A, a full step of B, then another half step of A in each slice. It costs about the same but the error falls like **t³/r²**, which is much faster.

Here's the 6-qubit Ising chain (J = 1, h = 0.8) evolved for time t = 2 from |000000⟩. We compare the Trotterised circuit with the exact answer for different numbers of slices:

```python
import numpy as np
from scipy.linalg import expm
from qiskit import QuantumCircuit, transpile
from qiskit.circuit.library import PauliEvolutionGate
from qiskit.synthesis import LieTrotter, SuzukiTrotter
from qiskit.quantum_info import SparsePauliOp, Statevector, state_fidelity

n, J, h, T = 6, 1.0, 0.8, 2.0
zz = [("ZZ", [i, i + 1], -J) for i in range(n - 1)]
x = [("X", [i], -h) for i in range(n)]
H = SparsePauliOp.from_sparse_list(zz + x, num_qubits=n)      # transverse-field Ising chain

start = Statevector.from_label("0" * n)
exact = Statevector(expm(-1j * H.to_matrix() * T) @ start.data)

print(" steps   first-order fidelity   second-order fidelity   CNOTs (1st order)")
for steps in [1, 2, 4, 8, 16]:
    row, cnots = [], 0
    for method in (LieTrotter(reps=steps), SuzukiTrotter(order=2, reps=steps)):
        qc = QuantumCircuit(n)
        qc.append(PauliEvolutionGate(H, time=T, synthesis=method), range(n))
        gates = transpile(qc, basis_gates=["cx", "rz", "sx", "x"], optimization_level=0)
        row.append(state_fidelity(start.evolve(gates), exact))
        cnots = cnots or gates.count_ops().get("cx", 0)
    print(f"{steps:5d}   {row[0]:.4f}                 {row[1]:.4f}                  {cnots}")
```

```text
 steps   first-order fidelity   second-order fidelity   CNOTs (1st order)
    1   0.0584                 0.0623                  10
    2   0.0083                 0.0061                  20
    4   0.5920                 0.9148                  40
    8   0.9121                 0.9956                  80
   16   0.9802                 0.9997                  160
```

The fidelity |⟨exact|Trotter⟩|² (Lesson 16) tells the story:

- With 1 or 2 slices, the result is **useless** (fidelity near 0): the time steps are far too big.
- With 8 slices, first order reaches 91%, while second order already reaches 99.6%.
- With 16 slices, second order is at 99.97%.

Each slice costs 10 CNOTs here (two per ZZ term, five ZZ terms), so the price of accuracy is **depth**. And this is where noise bites: 160 CNOTs at 99% each would succeed only about 20% of the time (Lesson 20's rule). That trade-off, Trotter error against hardware error, is the central practical problem of near-term quantum simulation.

### Better than Trotter

Trotter formulas are simple and widely used, but there are more advanced methods with better scaling:

| Method | Idea | Cost for time t, accuracy ε |
|---|---|---|
| First-order Trotter | Alternate small steps | ~t²/ε |
| Higher-order Suzuki | Symmetric nested steps | ~t^(1+1/2k)/ε^(1/2k) for order 2k |
| qDRIFT (2019) | Apply randomly chosen terms, weighted by size | Independent of the number of terms |
| Linear combinations of unitaries, qubitization | Build e^(−iHt) exactly from a "block encoding" of H | ~t + log(1/ε): essentially optimal |

The last row is what large error-corrected chemistry simulations are planned around (Lesson 45). But Trotter remains the workhorse on today's machines.

## What simulations compute

Applying e^(−iHt) is a means, not an end. Useful outputs include:

| Output | How |
|---|---|
| **Dynamics:** how a magnetisation, current or charge changes after a sudden kick | Evolve, then measure expectation values with an Estimator (Lesson 19) |
| **Energies:** ground and excited state energies of molecules and materials | Phase estimation on e^(−iHt) (Lesson 27), or variational methods (Lesson 30) |
| **Spectra and response:** what frequencies of light a material absorbs | Correlation functions ⟨A(t)B(0)⟩ from interference circuits |
| **Phases of matter:** magnetism, superconductivity, topological order | Prepare low-energy states, measure order parameters |

### Electrons need a translation

Electrons are **fermions**: swapping two of them flips the sign of the state. Qubits don't behave that way on their own. Before simulating a molecule, its Hamiltonian is translated into Pauli strings using a mapping such as **Jordan–Wigner** (1928), which keeps track of the signs with strings of Z operators. A molecule with N spin-orbitals becomes N qubits and a sum of many Pauli strings: for small molecules, hundreds to thousands of terms. Lesson 45 does this for real molecules.

### Digital and analog simulators

Everything here is **digital** simulation: gates on a general-purpose machine. There's also **analog** simulation: building a controllable quantum system (cold atoms in laser light, trapped ions, superconducting arrays) whose own Hamiltonian imitates the one you care about. Analog simulators have already studied systems of hundreds of particles, beyond exact classical computation for some questions, but each one can only imitate a limited family of Hamiltonians, and errors are harder to control. Neutral-atom platforms (Lesson 39) can work in both modes.

## The honest race with classical methods

Quantum simulation is a race, and classical computers are fast runners. Physicists have spent decades building clever classical methods: tensor networks (Lesson 20's MPS is one), quantum Monte Carlo, density functional theory, coupled cluster. For many systems, especially those with low entanglement or a simple structure, they work extremely well.

A telling example: in June 2023, IBM simulated the dynamics of a 127-qubit kicked Ising model and showed results that their brute-force classical methods couldn't check. Within weeks, several groups reproduced the results on ordinary computers using tensor networks and other approximations. The quantum computer hadn't won; but the classical methods had to be sharpened to keep up, and the experiment showed that noisy machines could produce reliable results at that scale with error mitigation (Lesson 36).

The current consensus: quantum simulation is likely to beat classical methods first for **strongly correlated** systems (some catalysts, high-temperature superconductors, certain magnetic materials), where classical approximations break down, and probably on early **error-corrected** machines rather than today's noisy ones.

## Try it

1. Write the Hamiltonian of a 3-qubit Ising chain as a list of Pauli strings with coefficients (J = 1, h = 0.5).
2. Which Pauli strings in the Ising model don't commute with each other? Give one pair.
3. How many CNOTs does e^(−iθ Z⊗Z⊗Z⊗Z) need with the CNOT-ladder method?
4. First-order Trotter error falls like t²/r. If 8 slices give error 0.09, roughly how many give error 0.01?
5. Why would 160 CNOTs be a problem on today's hardware, even with a perfect Trotter formula?
6. In one sentence, why did Feynman think quantum computers were needed for simulating nature?

**Answers:**

1. −1·ZZI, −1·IZZ, −0.5·XII, −0.5·IXI, −0.5·IIX (in some consistent qubit order).
2. Z₁Z₂ and X₁ (or X₂): they share a qubit where one has Z and the other X, and Z and X anticommute (Lesson 9).
3. 2 × (4 − 1) = **6** CNOTs, plus one RZ.
4. Error ∝ 1/r, so 9 times smaller error needs about 9 × 8 = **72** slices.
5. At ~1% error per CNOT, 0.99¹⁶⁰ ≈ 0.2: most runs would contain at least one error.
6. Because the classical cost of describing quantum states grows exponentially with size, while a quantum computer can represent them naturally.

## Cheat sheet

| Idea | Formula or fact |
|---|---|
| Hamiltonian | Hermitian matrix of energy; eigenvalues = energies |
| Time evolution | \|ψ(t)⟩ = e^(−iHt)\|ψ(0)⟩ |
| Local Hamiltonian | Sum of Pauli strings on a few qubits each |
| Ising chain | H = −J Σ ZᵢZᵢ₊₁ − h Σ Xᵢ |
| e^(−iθZZ) | CNOT, RZ(2θ), CNOT |
| X or Y terms | Change basis with H (or S†H) first |
| k-qubit Pauli string | One rotation + ~2(k − 1) CNOTs |
| Lie–Trotter | e^(−i(A+B)t) ≈ (e^(−iAt/r) e^(−iBt/r))^r; error ~t²/r |
| Second-order Suzuki | Symmetric steps; error ~t³/r² |
| Advanced methods | qDRIFT, LCU, qubitization (~optimal) |
| Outputs | Dynamics, energies, spectra, phases of matter |
| Fermions | Jordan–Wigner maps electrons to Pauli strings |
| Analog simulators | Build a system that imitates the target Hamiltonian |
| Classical competition | Tensor networks, Monte Carlo, DFT, coupled cluster |
| Qiskit | `SparsePauliOp`, `PauliEvolutionGate`, `LieTrotter`, `SuzukiTrotter` |
