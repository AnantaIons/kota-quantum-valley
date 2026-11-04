---
layout: ../../layouts/Post.astro
title: "Quantum chemistry and quantum machine learning"
description: "The two most-discussed application areas, examined honestly. Why molecules are hard for classical computers, turning a molecule into qubits, the hydrogen molecule's energy found exactly and with VQE, the measurement cost of near-term chemistry (computed), what fault-tolerant chemistry will need, quantum machine learning with a working quantum-kernel classifier compared against a classical one, barren plateaus measured, and a checklist for telling real promise from hype."
date: 2026-11-04
category: lesson
lesson: 45
---

Ask "what will quantum computers be used for?" and the two most common answers are **chemistry** and **machine learning**. They're very different cases. Chemistry is one of the strongest application areas, because molecules are quantum systems and Lesson 29 showed that simulating quantum systems is where exponential speed-ups live. Machine learning is much more uncertain: there are interesting ideas, but also serious obstacles and many claims that didn't survive scrutiny.

This lesson works through both with real calculations: you'll compute the energy of a hydrogen molecule on a simulated quantum computer, see how much measuring that costs, build a quantum-kernel classifier and compare it honestly with a classical one, and measure the "barren plateau" problem that haunts variational algorithms.

## Part 1: Quantum chemistry

### Why molecules are hard

Chemistry is governed by the electrons in molecules: where they are determines bond strengths, reaction rates, colours, catalytic activity and whether a drug sticks to its target. Electrons obey quantum mechanics, and a molecule with N electrons spread over M orbitals has a wavefunction whose size grows exponentially with the size of the molecule. Simulating it exactly on a classical computer is hopeless beyond a few dozen orbitals.

Classical chemistry has excellent approximations. **Density functional theory (DFT)** handles thousands of atoms and is used every day in industry, and **coupled-cluster** methods are very accurate for "ordinary" molecules. They struggle with **strongly correlated** systems, where many electrons are entangled in complicated ways: transition-metal catalysts, some battery materials, high-temperature superconductors, and enzymes such as **nitrogenase**, whose FeMoco cluster fixes nitrogen from the air at room temperature while industry needs the energy-hungry Haber–Bosch process, which uses a few percent of the world's natural gas. Those are the targets where a quantum computer could matter.

### From molecule to qubits

The recipe has three steps:

1. **Choose a basis.** Represent each electron's possible locations by a finite set of orbitals (a **basis set**). Larger basis sets are more accurate and need more qubits.
2. **Compute the Hamiltonian's coefficients** classically: integrals describing each electron's kinetic energy, its attraction to the nuclei, and the repulsion between pairs of electrons. This is routine and fast.
3. **Map to qubits.** Each spin-orbital becomes a qubit (occupied = |1⟩, empty = |0⟩), and the electron operators become Pauli strings, using a mapping such as **Jordan–Wigner**. The result is a Hamiltonian H = Σ cᵢPᵢ, a weighted sum of Pauli strings, exactly the kind of observable Lessons 19 and 30 measured.

For the hydrogen molecule H₂ in the smallest basis, there are 4 spin-orbitals, which symmetries reduce to just **2 qubits**. Here is its Hamiltonian at the natural bond length, with its energies found by direct diagonalisation:

```python
import numpy as np
from qiskit.quantum_info import SparsePauliOp

# The hydrogen molecule H2 at 0.735 Å (its natural bond length), minimal basis set, reduced to 2 qubits.
# The coefficients (in hartree) come from a standard quantum-chemistry calculation of the electron integrals.
H = SparsePauliOp.from_list([("II", -1.052373245772859), ("IZ", 0.39793742484318045),
                             ("ZI", -0.39793742484318045), ("ZZ", -0.01128010425623538),
                             ("XX", 0.18093119978423156)])
nuclear_repulsion = 0.7199689944489797           # the two protons repel each other

energies = np.linalg.eigvalsh(H.to_matrix())
print("electronic energy levels (Ha):", np.round(energies, 6))
print(f"ground-state energy of H2 = {energies[0] + nuclear_repulsion:.6f} Ha  "
      f"(= {(energies[0] + nuclear_repulsion) * 27.2114:.3f} eV)")
```

```text
electronic energy levels (Ha): [-1.857275 -1.244585 -0.882722 -0.224911]
ground-state energy of H2 = -1.137306 Ha  (= -30.948 eV)
```

The lowest level, plus the repulsion between the two protons, gives H₂'s ground-state energy in this basis: −1.137 hartree (the atomic unit of energy, 27.2 eV). That's the number a quantum computer should reproduce. Of course, a 2-qubit Hamiltonian is trivially diagonalised classically; the point is the method, which scales to molecules where diagonalisation is impossible.

### VQE for H₂

On near-term hardware, the standard method is the **variational quantum eigensolver** (Lesson 30): a parameterised circuit prepares a trial state, a quantum computer estimates its energy, and a classical optimiser adjusts the parameters to lower the energy. Here is the full loop, with Qiskit's Estimator and SciPy's COBYLA optimiser:

```python
import numpy as np
from scipy.optimize import minimize
from qiskit import QuantumCircuit
from qiskit.circuit import ParameterVector
from qiskit.primitives import StatevectorEstimator
from qiskit.quantum_info import SparsePauliOp

H = SparsePauliOp.from_list([("II", -1.052373245772859), ("IZ", 0.39793742484318045),
                             ("ZI", -0.39793742484318045), ("ZZ", -0.01128010425623538),
                             ("XX", 0.18093119978423156)])
exact = np.linalg.eigvalsh(H.to_matrix())[0]

theta = ParameterVector("θ", 4)
ansatz = QuantumCircuit(2)
ansatz.ry(theta[0], 0); ansatz.ry(theta[1], 1)
ansatz.cx(0, 1)
ansatz.ry(theta[2], 0); ansatz.ry(theta[3], 1)

estimator = StatevectorEstimator()
history = []
def energy(params):
    e = estimator.run([(ansatz, H, params)]).result()[0].data.evs
    history.append(float(e))
    return float(e)

result = minimize(energy, x0=[0.1, 0.1, 0.1, 0.1], method="COBYLA", options={"maxiter": 300})
print(f"VQE energy   {result.fun:.6f} Ha after {len(history)} energy evaluations")
print(f"exact energy {exact:.6f} Ha")
error_mHa = abs(result.fun - exact) * 1000
print(f"error = {error_mHa:.4f} mHa  ({'within' if error_mHa < 1.6 else 'outside'} chemical accuracy, 1.6 mHa)")
```

```text
VQE energy   -1.857275 Ha after 64 energy evaluations
exact energy -1.857275 Ha
error = 0.0000 mHa  (within chemical accuracy, 1.6 mHa)
```

VQE finds the exact ground energy in 64 energy evaluations. Chemists care about **chemical accuracy**, 1.6 milli-hartree (about 1 kcal/mol), the precision needed to predict reaction rates reliably, and this result is far inside it. The first VQE experiment on real hardware (Peruzzo and colleagues, 2014, on a photonic chip) and IBM's 2017 demonstrations on small molecules followed exactly this pattern.

### The catch: measurement cost

On a real device, every energy is estimated from **shots**, and each shot of each Pauli term gives only ±1. To reach chemical accuracy, the number of shots needed is roughly (Σ|cᵢ| / ε)²:

```python
import numpy as np

coeffs = {"IZ": 0.39793742484318045, "ZI": -0.39793742484318045, "ZZ": -0.01128010425623538, "XX": 0.18093119978423156}
target = 1.6e-3                                 # chemical accuracy: 1.6 milli-hartree

# Each shot of a Pauli term gives ±1. Spreading shots well across terms, the error is about Σ|c| / √shots.
weight = sum(abs(c) for c in coeffs.values())
print(f"H2: Σ|c| = {weight:.3f} Ha  →  about {(weight / target) ** 2:,.0f} shots for ONE energy estimate")

# Larger molecules: the number of Hamiltonian terms grows roughly like (number of qubits)^4
for n in [20, 50, 100]:
    print(f"{n:3d} qubits: roughly {n ** 4 / 8:,.0f} Pauli terms")
```

```text
H2: Σ|c| = 0.988 Ha  →  about 381,373 shots for ONE energy estimate
 20 qubits: roughly 20,000 Pauli terms
 50 qubits: roughly 781,250 Pauli terms
100 qubits: roughly 12,500,000 Pauli terms
```

Even for H₂, a single energy estimate to chemical accuracy needs about 380,000 shots, and an optimisation needs hundreds of estimates. For larger molecules, the number of terms grows roughly like the fourth power of the number of qubits, and the coefficients don't shrink. Grouping commuting terms, smarter measurement schemes, and error mitigation (Lesson 36) all help, but measurement cost, noise and barren plateaus (below) mean VQE has not yet beaten classical chemistry methods for any molecule of practical interest.

### The fault-tolerant route

The long-term plan for chemistry is different: **quantum phase estimation** (Lesson 27) applied to time evolution under the molecular Hamiltonian (Lesson 29). Given a starting state with a good overlap with the ground state, it returns the energy to high precision with far fewer repetitions, but it needs deep circuits and therefore error correction (Lessons 33 to 35).

Resource estimates for industrially relevant molecules, such as FeMoco and cytochrome P450 enzymes, have fallen dramatically over the past decade as algorithms improved, but they still call for millions of physical qubits (or a few hundred thousand with optimistic hardware) running for hours to days. Chemistry is therefore expected to be among the **first** valuable uses of early fault-tolerant quantum computers, not of today's devices. Honest open questions remain: how often good starting states can be prepared, and whether improving classical methods will close the gap for many molecules.

## Part 2: Quantum machine learning

### The ideas

Quantum machine learning (QML) asks whether quantum computers can learn from data faster or better. The main approaches:

- **Encoding data.** Classical data must first be loaded into quantum states: as rotation angles (**angle encoding**, one or a few features per qubit) or into amplitudes (**amplitude encoding**, 2ⁿ numbers in n qubits, but expensive to prepare, Lesson 31).
- **Variational classifiers** ("quantum neural networks"): a parameterised circuit acts on the encoded data, and its parameters are trained like a neural network's weights.
- **Quantum kernels:** encode two data points as quantum states and use their **overlap** |⟨φ(x)|φ(x′)⟩|² as a similarity measure inside a classical support-vector machine. The hope is that some quantum feature maps compute similarities that are hard to compute classically.

### A quantum-kernel classifier

Here is a complete quantum-kernel classifier on a classic test dataset (two concentric circles of points), using the **ZZ feature map** to encode each 2D point into 2 qubits, compared with a standard classical kernel:

```python
import numpy as np
from sklearn.datasets import make_circles
from sklearn.model_selection import train_test_split
from sklearn.svm import SVC
from qiskit.circuit.library import zz_feature_map
from qiskit.quantum_info import Statevector

X, y = make_circles(n_samples=120, noise=0.08, factor=0.5, random_state=0)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

feature_map = zz_feature_map(feature_dimension=2, reps=2)      # encodes a 2D point into a 2-qubit state
def state(x):
    return Statevector(feature_map.assign_parameters(x))

def kernel(A, B):
    """Quantum kernel: K(x, x') = |⟨φ(x)|φ(x')⟩|², the overlap of the two encoded states."""
    SA, SB = [state(a) for a in A], [state(b) for b in B]
    return np.array([[abs(sa.inner(sb)) ** 2 for sb in SB] for sa in SA])

quantum = SVC(kernel="precomputed").fit(kernel(X_train, X_train), y_train)
q_acc = quantum.score(kernel(X_test, X_train), y_test)
classical = SVC(kernel="rbf").fit(X_train, y_train)
print(f"quantum-kernel SVM accuracy:  {q_acc:.2f}")
print(f"classical RBF SVM accuracy:   {classical.score(X_test, y_test):.2f}")
```

```text
quantum-kernel SVM accuracy:  1.00
classical RBF SVM accuracy:   1.00
```

Both classify the test set perfectly. That's the honest picture for most QML benchmarks on small classical datasets: quantum methods work, but classical ones do just as well, faster and cheaper. To show a genuine advantage you need a problem where the quantum kernel captures structure that no efficient classical method can, and such problems are known to exist only for specially constructed datasets (for example, ones based on discrete logarithms) rather than natural data.

### Barren plateaus

Training a variational circuit means following gradients downhill. In 2018, McClean and colleagues showed that for random, deep circuits on many qubits, the gradients become **exponentially small** almost everywhere: the cost landscape is a vast flat plain, a **barren plateau**, where the optimiser can't tell which way to go. Let's measure it, using the parameter-shift rule to compute exact gradients of a global cost function for random parameters:

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, SparsePauliOp

rng = np.random.default_rng(7)

def circuit(n, params):
    """A 'hardware-efficient' random ansatz: n layers of RY rotations and a chain of CZs."""
    qc = QuantumCircuit(n)
    k = 0
    for _ in range(n):
        for q in range(n):
            qc.ry(params[k], q); k += 1
        for q in range(n - 1):
            qc.cz(q, q + 1)
    return qc

def gradient_spread(n, samples=60):
    cost = SparsePauliOp("Z" * n)                       # a "global" cost: all qubits at once
    grads = []
    for _ in range(samples):
        p = rng.uniform(0, 2 * np.pi, n * n)
        shift = np.zeros_like(p); shift[0] = np.pi / 2   # parameter-shift rule for the first angle
        e_plus = Statevector(circuit(n, p + shift)).expectation_value(cost).real
        e_minus = Statevector(circuit(n, p - shift)).expectation_value(cost).real
        grads.append(0.5 * (e_plus - e_minus))
    return np.var(grads)

print("qubits   variance of the gradient")
for n in [2, 4, 6, 8, 10]:
    print(f"  {n:2d}        {gradient_spread(n):.2e}")
```

```text
qubits   variance of the gradient
   2        1.64e-01
   4        4.97e-02
   6        1.78e-02
   8        4.59e-03
  10        6.01e-04
```

The typical gradient size shrinks by a factor of about 3 to 4 for every two qubits added. At 50 qubits, the gradients would be far smaller than the shot noise of any realistic measurement, and training would stall. Remedies include **local** cost functions (measuring a few qubits rather than all), problem-inspired circuits instead of generic ones, and careful initialisation, but there's a deeper twist: recent research suggests that circuits structured enough to avoid barren plateaus are often also structured enough to be **simulated classically**, which would remove the quantum advantage.

### The catches, together

- **Data loading:** encoding a large classical dataset can cost as much as the computation it was meant to speed up (Lesson 31).
- **Dequantisation:** several celebrated QML speed-ups were matched by classical algorithms given the same data access (Ewin Tang, 2018, and follow-ups).
- **Trainability:** barren plateaus and noise make large variational models hard to train.
- **Benchmarks:** small demonstrations are usually matched by classical methods.

### Where QML may still win

The most promising direction is **quantum data**: learning from the outputs of quantum experiments, sensors or simulations, where the data is already quantum and doesn't need to be loaded. Theory shows that a quantum computer with quantum memory can learn some properties of quantum systems with **exponentially fewer** experiments than any classical learner, and Google demonstrated this in 2022 (Huang and colleagues). That's a real, proven advantage, just not for spam filters or image recognition.

## A checklist for spotting hype

When you read a claim about quantum chemistry or QML, ask:

1. **Compared with what?** Is it compared with the **best** classical method (DFT, coupled cluster, tensor networks, a well-tuned neural network), or a weak one?
2. **At what size?** Small demonstrations (a few qubits) are always classically simulable. What happens at 100 or 1,000 qubits?
3. **What about loading and reading out data?** Are those costs included?
4. **Noise and shots:** were the results on real hardware, and how many shots and how much mitigation did they need?
5. **Is the speed-up proven, or hoped for?** And has it survived attempts at dequantisation?

Chemistry passes this test better than most areas: the problem is genuinely quantum, the target molecules are known, and the resource estimates are concrete. Lesson 46 applies the same test to optimisation and finance.

## Try it

1. Why are strongly correlated molecules, like FeMoco, good targets for quantum computers when ordinary molecules aren't?
2. How many qubits would a 10-orbital, 2-spin basis need with a direct Jordan–Wigner mapping?
3. In the H₂ example, why do we add the nuclear repulsion after diagonalising?
4. Using (Σ|c|/ε)², how many shots would H₂ need for a precision of 10 mHa?
5. Both classifiers scored 1.00. What does this tell us about quantum advantage for this dataset?
6. Why does a barren plateau make training fail, even with a perfect optimiser?
7. What is "quantum data", and why is QML more promising there?

**Answers:**

1. Classical methods like DFT and coupled cluster handle ordinary molecules well, so there's little to gain. Strongly correlated systems have many entangled electrons, which defeat those approximations but are natural for a quantum computer.
2. 10 orbitals × 2 spins = **20 qubits**.
3. The qubit Hamiltonian describes only the electrons (with the nuclei held fixed). The proton–proton repulsion is a constant for a fixed geometry, so it's added at the end.
4. (0.988 / 0.010)² ≈ **9,800** shots.
5. Nothing positive: the classical kernel does equally well, faster. A useful quantum method must beat the best classical method on a problem where that's hard.
6. The gradients are exponentially small compared with the statistical noise from finite shots, so measured gradients are dominated by noise and point in random directions.
7. Data produced by quantum systems (experiments, sensors, quantum simulations). It's already in quantum form, so there's no costly loading step, and for some learning tasks quantum learners provably need exponentially fewer experiments.

## Cheat sheet

| Idea | Formula or fact |
|---|---|
| Why chemistry | Electrons are quantum; exact simulation is exponential classically |
| Hard cases | Strongly correlated systems: catalysts, FeMoco, some materials |
| Recipe | Basis set → classical integrals → qubit Hamiltonian H = Σ cᵢPᵢ (Jordan–Wigner) |
| H₂ (minimal basis) | 2 qubits after symmetry; E₀ = −1.137 Ha with nuclear repulsion |
| Chemical accuracy | 1.6 mHa ≈ 1 kcal/mol |
| VQE | Parameterised circuit + Estimator + classical optimiser (Lesson 30) |
| Shot cost | ≈ (Σ\|cᵢ\|/ε)² per energy; terms grow ≈ N⁴ |
| Fault-tolerant chemistry | Phase estimation on e^(−iHt); millions of physical qubits for FeMoco-class problems |
| Data encoding | Angle encoding (cheap), amplitude encoding (compact but costly to load) |
| Quantum kernel | K(x, x′) = \|⟨φ(x)\|φ(x′)⟩\|², used in a classical SVM |
| Barren plateau | Gradients shrink exponentially with qubits (McClean 2018) |
| Dequantisation | Classical algorithms matching QML claims (Tang 2018) |
| Real promise | Learning from quantum data (proven exponential advantage, 2022) |
| Hype checklist | Best classical baseline? Size? Data loading? Noise and shots? Proven speed-up? |
