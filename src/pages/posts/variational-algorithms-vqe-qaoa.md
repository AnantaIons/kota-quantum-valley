---
layout: ../../layouts/Post.astro
title: "Variational algorithms: VQE and QAOA"
description: "How today's noisy quantum computers team up with classical computers. The variational principle and why random guessing fails, measuring an energy from shots, choosing an ansatz, exact gradients with the parameter-shift rule, a complete VQE for an Ising chain, optimisers that cope with noise (including SPSA), which hardware errors the loop can absorb and which it can't, QAOA and its energy landscape for MaxCut, and an honest status report."
date: 2026-11-04
category: lesson
lesson: 30
---

Shor's algorithm (Lesson 28) and phase estimation (Lesson 27) need long, nearly perfect circuits: billions of gates on error-corrected machines that don't exist yet. Today's hardware is different. It has tens to a thousand-odd qubits, and every gate has an error of around 0.1% to 1%, so you can run only a few hundred to a few thousand gates before noise takes over (Lesson 32 makes this precise). This is often called the **NISQ** era: noisy intermediate-scale quantum.

**Variational algorithms** were designed for exactly these machines. They keep the quantum circuit short, and hand everything else to an ordinary computer. The two famous examples are the **variational quantum eigensolver** (VQE), for finding the lowest energy of a molecule or material, and the **quantum approximate optimisation algorithm** (QAOA), for combinatorial problems. This lesson builds the method from its foundations: the principle that makes it work, how energies are measured, how circuits are chosen and trained, what noise does to it, and an honest assessment of where it stands.

## The loop

Every variational algorithm is the same loop between two computers:

1. A **parameterised circuit**, called the **ansatz** (German for "approach" or "starting guess"), prepares a trial state |ψ(θ)⟩ using adjustable angles θ = (θ₁, θ₂, …).
2. The quantum computer **measures a cost**, usually an energy E(θ) = ⟨ψ(θ)|H|ψ(θ)⟩, by running the circuit many times.
3. A **classical optimiser** looks at the cost and chooses new angles that should lower it.
4. Repeat until the cost stops improving.

| Quantum computer | Classical computer |
|---|---|
| Prepares a state that may be too complex to store classically | Chooses the angles |
| Measures the energy (thousands of shots) | Runs the optimisation and keeps track of the best result |
| Runs only short circuits | Does everything else |

The idea is a division of labour: use the quantum computer only for the one job it's uniquely good at, representing a complicated many-qubit state, and keep the circuits short enough to survive the noise.

## The variational principle

Why does lowering the measured energy lead towards the right answer? Because of the **variational principle**, an old result from quantum mechanics (Rayleigh and Ritz): **no state has an energy below the ground energy.**

The proof takes three lines. Write H's energy levels as E₀ ≤ E₁ ≤ E₂ ≤ …, with eigenstates |E₀⟩, |E₁⟩, …. Any state can be written in that basis as |ψ⟩ = Σᵢ cᵢ|Eᵢ⟩, with Σ|cᵢ|² = 1. Then

> ⟨ψ|H|ψ⟩ = Σᵢ |cᵢ|² Eᵢ ≥ Σᵢ |cᵢ|² E₀ = E₀

The energy is a **weighted average** of the levels, with weights |cᵢ|², and an average can never be below its smallest member. It equals E₀ only when all the weight is on the ground state. So every measured energy is an **upper bound** on E₀, and lower is always better.

Let's check this, and see why we can't just guess:

```python
import numpy as np
from qiskit.quantum_info import SparsePauliOp

# A two-qubit Hamiltonian: an Ising coupling plus a sideways ("transverse") field
H = SparsePauliOp(["ZZ", "XI", "IX"], coeffs=[1.0, 0.5, 0.5]).to_matrix()
E, V = np.linalg.eigh(H)                              # exact energy levels and eigenstates
print("energy levels:", np.round(E, 4))

rng = np.random.default_rng(0)
psi = rng.normal(size=4) + 1j * rng.normal(size=4)
psi /= np.linalg.norm(psi)                            # a random two-qubit state
weights = np.abs(V.conj().T @ psi) ** 2               # |overlap with each eigenstate|^2
print("weights on each level:", np.round(weights, 3))
print(f"<H> = {np.vdot(psi, H @ psi).real:.4f} = sum of weight x level = {weights @ E:.4f}")

energies = []
for _ in range(100_000):
    psi = rng.normal(size=4) + 1j * rng.normal(size=4)
    psi /= np.linalg.norm(psi)
    energies.append(np.vdot(psi, H @ psi).real)
energies = np.array(energies)
print(f"\n100,000 random states: lowest <H> = {energies.min():.4f}, average = {energies.mean():.4f}")
print(f"states below the ground energy {E[0]:.4f}: {np.sum(energies < E[0])}")
print(f"states within 0.05 of it: {np.sum(energies < E[0] + 0.05)}")
```

```text
energy levels: [-1.4142 -1.      1.      1.4142]
weights on each level: [0.296 0.214 0.317 0.173]
<H> = -0.0708 = sum of weight x level = -0.0708

100,000 random states: lowest <H> = -1.3952, average = -0.0005
states below the ground energy -1.4142: 0
states within 0.05 of it: 4
```

The random state's energy is exactly the weighted average of the four levels. Of 100,000 random states, none went below the ground energy −1.4142, as the principle promises. But only **4** came within 0.05 of it. Random guessing is hopeless even with two qubits, and the fraction of good states shrinks exponentially as qubits are added. So VQE needs two smart ingredients: a **family of states** that contains good answers (the ansatz) and a **search method** that finds them (the optimiser).

## Measuring an energy on a quantum computer

A quantum computer can't output E(θ) directly. It gives bitstrings. To turn bitstrings into an energy, we use the fact that H is a sum of **Pauli strings** (Lesson 29), H = Σⱼ cⱼPⱼ, so

> E(θ) = Σⱼ cⱼ ⟨Pⱼ⟩

and each ⟨Pⱼ⟩ can be measured separately:

- **Z-type terms** (like Z₀Z₁): measure normally. Each shot gives a bitstring, and the value of the term for that shot is (−1)^(sum of the relevant bits): +1 for even parity, −1 for odd.
- **X or Y terms:** first rotate the qubit so that X or Y becomes Z (Lesson 8). For X, apply H before measuring; for Y, apply S† and then H.
- **Commuting terms** that need the same basis can share the same shots. Here, X on qubit 0 and X on qubit 1 are both measured from one circuit with Hadamards on both qubits.

Here's the whole process by hand, for H = Z₀Z₁ + 0.5 X₀ + 0.5 X₁ (written "ZZ", "IX", "XI" in Qiskit, with qubit 0 on the right):

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler
from qiskit.quantum_info import SparsePauliOp, Statevector

H = SparsePauliOp(["ZZ", "XI", "IX"], coeffs=[1.0, 0.5, 0.5])

state = QuantumCircuit(2)                       # some trial state
state.ry(2.0, 0)
state.ry(-0.5, 1)
state.cx(0, 1)

# Group 1: ZZ is measured directly. Group 2: XI and IX both need X-basis
# measurements, which is a Hadamard on each qubit followed by a normal measurement.
z_circ = state.copy(); z_circ.measure_all()
x_circ = state.copy(); x_circ.h([0, 1]); x_circ.measure_all()

def parity(counts, qubits):
    """Average of (-1)^(sum of the measured bits on these qubits): the value of a Z-type Pauli."""
    shots = sum(counts.values())
    return sum(c * (-1) ** sum(int(b[-1 - q]) for q in qubits) for b, c in counts.items()) / shots

exact = Statevector(state).expectation_value(H).real
print(f"exact <H> = {exact:.4f}")
sampler = StatevectorSampler(seed=np.random.default_rng(7))

def estimates(shots, repeats):
    """Estimate <H> from fresh shots, several times over."""
    results = sampler.run([z_circ, x_circ] * repeats, shots=shots).result()
    out = []
    for zr, xr in zip(results[0::2], results[1::2]):
        zc, xc = zr.data.meas.get_counts(), xr.data.meas.get_counts()
        out.append(1.0 * parity(zc, [0, 1]) + 0.5 * parity(xc, [1]) + 0.5 * parity(xc, [0]))
    return np.array(out)

print("shots per group   one estimate   typical error (spread of 200 repeats)")
for shots in [100, 1_000, 10_000]:
    est = estimates(shots, 200)
    print(f"{shots:10,d}         {est[0]:.4f}          {est.std():.4f}")
```

```text
exact <H> = 0.4199
shots per group   one estimate   typical error (spread of 200 repeats)
       100         0.3600          0.0995
     1,000         0.4200          0.0336
    10,000         0.4134          0.0094
```

Each estimate scatters around the exact value 0.4199. Ten times more shots make the typical error about √10 ≈ 3.2 times smaller: the familiar 1/√shots law of Lesson 20. That's a heavy cost. For an error of 0.001, this tiny problem would need around a million shots per energy, and an optimisation needs hundreds or thousands of energies. For real molecules, with thousands of Pauli terms, measurement cost is one of VQE's biggest problems (Lesson 45 counts it for H₂).

In practice you don't write this by hand: Qiskit's **Estimator** primitive (Lesson 19) groups the terms, adds the basis changes, runs the shots and returns ⟨H⟩ with an error bar. The rest of this lesson uses it.

## Choosing the ansatz

The ansatz decides which states the algorithm can reach. If the answer isn't in the family, no optimiser can find it. Here's a one-qubit example with H = Z + 0.5·Y:

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import SparsePauliOp, Statevector

H = SparsePauliOp(["Z", "Y"], coeffs=[1.0, 0.5])
exact = np.linalg.eigvalsh(H.to_matrix())[0]

def energy(circuit):
    return Statevector(circuit).expectation_value(H).real

def ry_only(t):
    qc = QuantumCircuit(1); qc.ry(t, 0)
    return qc

def ry_rz(t, p):
    qc = QuantumCircuit(1); qc.ry(t, 0); qc.rz(p, 0)
    return qc

grid = np.linspace(0, 2 * np.pi, 181)
best1 = min(energy(ry_only(t)) for t in grid)
best2 = min(energy(ry_rz(t, p)) for t in grid for p in grid)
print(f"exact ground energy      {exact:.4f}")
print(f"ansatz RY(θ)             {best1:.4f}   (stuck: real amplitudes give <Y> = 0)")
print(f"ansatz RY(θ) then RZ(φ)  {best2:.4f}")
```

```text
exact ground energy      -1.1180
ansatz RY(θ)             -1.0000   (stuck: real amplitudes give <Y> = 0)
ansatz RY(θ) then RZ(φ)  -1.1180
```

An RY rotation only makes states with **real** amplitudes, and every such state has ⟨Y⟩ = 0, so the RY-only ansatz can never use the Y term and gets stuck at −1. Adding RZ lets the state reach every point of the Bloch sphere (Lesson 7), and the exact ground energy −√1.25 ≈ −1.118 appears. This property is called **expressibility**.

But more expressive isn't simply better. An ansatz has to balance three things:

- **Expressive enough** to contain a good approximation to the answer.
- **Shallow enough** to run before noise destroys the state.
- **Trainable:** the optimiser must be able to find the good angles. Very generic, deep circuits have **barren plateaus**, landscapes so flat that gradients vanish exponentially with the number of qubits (Lesson 45 measures this).

Two families are common:

- **Hardware-efficient ansatzes:** layers of the hardware's native single-qubit rotations alternated with entangling gates between neighbouring qubits. Cheap to run, but generic, so they can be hard to train at scale. Qiskit's `real_amplitudes` and `efficient_su2` functions build them.
- **Problem-inspired ansatzes:** built from the structure of the problem. In chemistry, the **unitary coupled-cluster** (UCC) ansatz mimics the coupled-cluster method used by chemists; in optimisation, the QAOA ansatz is built from the problem itself (below). These need more gates, but encode real knowledge.

Symmetry also helps. If a Hamiltonian contains only X and Z terms (no Y), its matrix is real, and its ground state can be chosen with real amplitudes. Then an RY-and-CNOT ansatz, which only makes real states, wastes nothing. The Ising chain below is such a case.

## Gradients: the parameter-shift rule

Most good optimisers want the **gradient**: how the energy changes as each angle changes. The obvious method, a finite difference [E(θ + h) − E(θ − h)]/(2h) with small h, works badly on a quantum computer: the two energies are nearly equal, so their small difference is buried in shot noise, which is then divided by the tiny 2h.

There's a much better way. For a gate RY(θ) (or RX, RZ, or any rotation e^(−iθP/2) with a Pauli P), the matrix entries are cos(θ/2) and sin(θ/2), and the energy is quadratic in them. Using cos²(θ/2) = (1 + cos θ)/2 and similar identities, the energy as a function of that one angle always has the form

> E(θ) = A + B cos θ + C sin θ

for some constants A, B and C that depend on everything else in the circuit. Its derivative is −B sin θ + C cos θ. Now evaluate E a quarter-turn either side:

> [E(θ + π/2) − E(θ − π/2)] / 2 = [B(−2 sin θ) + C(2 cos θ)] / 2 = −B sin θ + C cos θ

That's **exactly** the derivative. This is the **parameter-shift rule**: run the same circuit with the angle shifted by +π/2 and −π/2, and halve the difference. No approximation, and the shifts are large, so the two energies differ by a lot and noise matters much less. Here are both methods, with simulated shot noise of 0.01 per energy:

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.circuit import ParameterVector
from qiskit.primitives import StatevectorEstimator
from qiskit.quantum_info import SparsePauliOp

H = SparsePauliOp(["ZZ", "XI", "IX"], coeffs=[1.0, 0.5, 0.5])
th = ParameterVector("θ", 4)
ansatz = QuantumCircuit(2)
ansatz.ry(th[0], 0); ansatz.ry(th[1], 1)
ansatz.cx(0, 1)
ansatz.ry(th[2], 0); ansatz.ry(th[3], 1)

exact_est = StatevectorEstimator()
noisy_est = StatevectorEstimator(seed=np.random.default_rng(3))

def energies(points, noisy=False):
    """Energies at several parameter points; noisy=True mimics ~10,000 shots (error 0.01)."""
    est, prec = (noisy_est, 0.01) if noisy else (exact_est, 0.0)
    return est.run([(ansatz, H, points)], precision=prec).result()[0].data.evs

theta = np.array([1.2, -0.4, 0.6, 1.0])
e0 = np.eye(4)[0]                                     # we differentiate with respect to θ0

def param_shift(noisy=False):
    plus, minus = energies([theta + np.pi / 2 * e0, theta - np.pi / 2 * e0], noisy)
    return (plus - minus) / 2

def finite_diff(h, noisy=False):
    plus, minus = energies([theta + h * e0, theta - h * e0], noisy)
    return (plus - minus) / (2 * h)

print(f"exact simulation: parameter shift {param_shift():.6f}, finite difference {finite_diff(1e-6):.6f}")
print("\nwith shot noise (200 repeats):   average    spread")
for name, f in [("parameter shift", lambda: param_shift(True)),
                ("finite diff, h = 0.01", lambda: finite_diff(0.01, True)),
                ("finite diff, h = 0.1", lambda: finite_diff(0.1, True))]:
    g = np.array([f() for _ in range(200)])
    print(f"  {name:22s}       {g.mean():8.4f}   {g.std():.4f}")
```

```text
exact simulation: parameter shift -0.762454, finite difference -0.762454

with shot noise (200 repeats):   average    spread
  parameter shift               -0.7626   0.0072
  finite diff, h = 0.01         -0.8313   0.6639
  finite diff, h = 0.1          -0.7561   0.0667
```

Without noise, both methods agree to six decimal places. With noise, the parameter-shift gradient has a spread of 0.0072 (the noise of two energies, divided by 2). The finite difference with h = 0.01 divides the same noise by 0.02, so its spread is **0.66**, larger than the gradient itself: useless. A larger h = 0.1 reduces the noise but introduces a bias, because the formula is no longer exact. The parameter-shift rule has neither problem. Its cost is **two energy evaluations per parameter** for each gradient.

## A complete VQE: the Ising chain

Let's find the ground state of the transverse-field Ising chain from Lesson 29 on three qubits, at the hardest point where the two kinds of term are equally strong:

> H = −(Z₀Z₁ + Z₁Z₂) − (X₀ + X₁ + X₂)

The ansatz is hardware-efficient: three layers of RY rotations (9 angles) separated by two chains of CNOTs. The optimiser is plain **gradient descent**: compute the gradient by parameter shifts, step a little downhill, repeat.

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.circuit import ParameterVector
from qiskit.primitives import StatevectorEstimator
from qiskit.quantum_info import SparsePauliOp, Statevector

# Transverse-field Ising chain on 3 qubits: H = -(Z0Z1 + Z1Z2) - (X0 + X1 + X2)
H = SparsePauliOp(["IZZ", "ZZI", "IIX", "IXI", "XII"], coeffs=[-1, -1, -1, -1, -1])
E, V = np.linalg.eigh(H.to_matrix())

n, layers = 3, 2
th = ParameterVector("θ", n * (layers + 1))
ansatz = QuantumCircuit(n)                           # "hardware-efficient": rotations + a CNOT chain
for l in range(layers + 1):
    for q in range(n):
        ansatz.ry(th[n * l + q], q)
    if l < layers:
        ansatz.cx(0, 1); ansatz.cx(1, 2)

est = StatevectorEstimator()
def energy(p):
    return float(est.run([(ansatz, H, p)]).result()[0].data.evs)

def gradient(p):
    """Parameter-shift rule: two energy evaluations per parameter."""
    shifts = np.pi / 2 * np.eye(len(p))
    points = np.vstack([p + shifts, p - shifts])
    evs = est.run([(ansatz, H, points)]).result()[0].data.evs
    return (evs[:len(p)] - evs[len(p):]) / 2

p = np.random.default_rng(5).uniform(-0.1, 0.1, len(th))   # start near all-zeros
print("step   energy")
for step in range(101):
    if step % 20 == 0:
        print(f"{step:4d}   {energy(p):.4f}")
    if step < 100:
        p -= 0.2 * gradient(p)                                 # gradient descent

final = Statevector(ansatz.assign_parameters(p))
print(f"exact ground energy {E[0]:.4f}")
print(f"overlap |<ground|VQE state>|^2 = {abs(np.vdot(V[:, 0], final.data)) ** 2:.4f}")
print(f"energy evaluations for the gradients: {100 * 2 * len(p):,}")
```

```text
step   energy
   0   -1.8344
  20   -3.4286
  40   -3.4735
  60   -3.4859
  80   -3.4910
 100   -3.4930
exact ground energy -3.4940
overlap |<ground|VQE state>|^2 = 0.9995
energy evaluations for the gradients: 1,800
```

In 20 steps the energy falls most of the way, then creeps down to −3.4930, within 0.001 of the exact −3.4940. The final state overlaps the true ground state with probability 0.9995. The ground state of this chain isn't a simple bitstring: it's a superposition shaped by the competition between the ZZ and X terms, and the loop found it without ever being told what it looks like.

Count the cost: 1,800 energy evaluations. On hardware, each would be thousands of shots, so millions of circuit runs for a 3-qubit problem that a laptop solves exactly in microseconds. VQE only makes sense for systems too big to solve classically, and that's where the difficulties begin.

## Optimisers when every number is noisy

The optimiser is a large part of a variational algorithm's success. Three kinds are common:

- **Gradient descent with parameter shifts** (and refinements like Adam): reliable, but each step costs 2P energy evaluations for P parameters.
- **Gradient-free methods** such as **COBYLA** and Nelder–Mead: they build a local model from previous evaluations. Efficient for few parameters and exact energies, but noise can confuse them.
- **SPSA** (simultaneous perturbation stochastic approximation, James Spall, 1992): at each step, pick a **random direction** that nudges every parameter by ±c at once, measure the energy on both sides, and step along that direction. It costs **2 evaluations per step whatever the number of parameters**, and it's naturally tolerant of noise. It's a favourite on real hardware.

Here are gradient descent and SPSA on the same Ising problem, both with simulated shot noise of 0.05 per energy (about a thousand shots each) and the same budget of 1,800 noisy evaluations:

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.circuit import ParameterVector
from qiskit.primitives import StatevectorEstimator
from qiskit.quantum_info import SparsePauliOp

H = SparsePauliOp(["IZZ", "ZZI", "IIX", "IXI", "XII"], coeffs=[-1, -1, -1, -1, -1])
exact = np.linalg.eigvalsh(H.to_matrix())[0]
n, layers = 3, 2
th = ParameterVector("θ", n * (layers + 1))
ansatz = QuantumCircuit(n)
for l in range(layers + 1):
    for q in range(n):
        ansatz.ry(th[n * l + q], q)
    if l < layers:
        ansatz.cx(0, 1); ansatz.cx(1, 2)

rng = np.random.default_rng(1)
est = StatevectorEstimator(seed=rng)
def noisy(points):
    """Energies with shot noise of 0.05 (about 1,000 shots each)."""
    return est.run([(ansatz, H, points)], precision=0.05).result()[0].data.evs

def exact_energy(p):
    return float(StatevectorEstimator().run([(ansatz, H, p)]).result()[0].data.evs)

budget = 1800                                           # energy evaluations allowed
start = rng.uniform(-0.1, 0.1, len(th))

# 1. Gradient descent with the parameter-shift rule: 18 evaluations per step
p = start.copy()
for _ in range(budget // (2 * len(p))):
    shifts = np.pi / 2 * np.eye(len(p))
    evs = noisy(np.vstack([p + shifts, p - shifts]))
    p -= 0.2 * (evs[:len(p)] - evs[len(p):]) / 2
print(f"parameter-shift descent: {budget // 18:4d} steps, final energy {exact_energy(p):.4f}")

# 2. SPSA: nudge ALL parameters at once in a random direction, 2 evaluations per step
p = start.copy()
for k in range(budget // 2):
    a, c = 1.0 / (k + 10) ** 0.602, 0.2 / (k + 1) ** 0.101   # standard decaying step sizes
    delta = rng.choice([-1, 1], size=len(p))
    e_plus, e_minus = noisy([p + c * delta, p - c * delta])
    p -= a * (e_plus - e_minus) / (2 * c) * delta
print(f"SPSA:                    {budget // 2:4d} steps, final energy {exact_energy(p):.4f}")
print(f"exact ground energy:                       {exact:.4f}")
```

```text
parameter-shift descent:  100 steps, final energy -3.4926
SPSA:                     900 steps, final energy -3.4903
exact ground energy:                       -3.4940
```

Both reach within 0.004 of the exact energy, even though every single energy they saw had an error of 0.05: errors average out over many steps. With 9 parameters, parameter shifts do slightly better. But imagine 900 parameters: one parameter-shift step would cost 1,800 evaluations, the whole budget, while each SPSA step would still cost 2. That's why SPSA is popular for large circuits.

## Noise: what the loop can absorb, and what it can't

Variational algorithms have a useful property: they're **trained on the hardware they run on**. Suppose a device has **coherent** errors, systematic mistakes that are the same every time. Say every RY gate over-rotates by 10%, and every CNOT adds an unwanted ZZ phase of 0.1 (a kind of crosstalk). The optimiser doesn't know about these errors, but it doesn't need to: it simply finds the angles that work best on this device.

**Incoherent** noise is different. Depolarising noise (Lesson 32) replaces the state with random junk some fraction of the time. No choice of angles undoes randomness. Let's compare:

```python
import numpy as np
from scipy.optimize import minimize
from qiskit import QuantumCircuit
from qiskit.quantum_info import SparsePauliOp, Statevector, DensityMatrix, Kraus
from qiskit_aer.noise import depolarizing_error

H = SparsePauliOp(["IZZ", "ZZI", "IIX", "IXI", "XII"], coeffs=[-1, -1, -1, -1, -1])
exact = np.linalg.eigvalsh(H.to_matrix())[0]
n, layers = 3, 2

def circuit(p, over=1.0, crosstalk=0.0):
    """The ansatz as the hardware runs it: RY angles scaled by `over`, an unwanted ZZ phase after each CNOT."""
    qc = QuantumCircuit(n)
    for l in range(layers + 1):
        for q in range(n):
            qc.ry(over * p[n * l + q], q)
        if l < layers:
            for a, b in [(0, 1), (1, 2)]:
                qc.cx(a, b)
                if crosstalk:
                    qc.rzz(crosstalk, a, b)
    return qc

def energy(p, **err):
    return Statevector(circuit(p, **err)).expectation_value(H).real

dep = Kraus(depolarizing_error(0.02, 2))                # 2% depolarising noise on every CNOT
def noisy_energy(p):
    qc, rho = circuit(p), DensityMatrix.from_label("000")
    for inst in qc.data:
        qubits = [qc.find_bit(q).index for q in inst.qubits]
        rho = rho.evolve(inst.operation, qubits)
        if inst.operation.name == "cx":
            rho = rho.evolve(dep, qubits)
    return rho.expectation_value(H).real

def vqe(f):
    start = np.random.default_rng(2).uniform(-0.1, 0.1, 9)
    return minimize(f, start, method="COBYLA", options={"maxiter": 2000})

ideal = vqe(energy)
print(f"exact ground energy                      {exact:.4f}")
print(f"VQE on a perfect device                  {ideal.fun:.4f}")
faulty = dict(over=1.1, crosstalk=0.1)
print(f"perfect-device angles on faulty hardware {energy(ideal.x, **faulty):.4f}")
print(f"VQE run directly on the faulty hardware  {vqe(lambda p: energy(p, **faulty)).fun:.4f}")
print(f"VQE with 2% depolarising noise per CNOT  {vqe(noisy_energy).fun:.4f}")
```

```text
exact ground energy                      -3.4940
VQE on a perfect device                  -3.4940
perfect-device angles on faulty hardware -3.4094
VQE run directly on the faulty hardware  -3.4867
VQE with 2% depolarising noise per CNOT  -3.2995
```

Angles found on a perfect simulator do badly on the faulty device (−3.41). Running VQE directly on the faulty device recovers almost everything (−3.487): the optimiser has compensated for the over-rotation and most of the crosstalk. But with 2% depolarising noise on each of the four CNOTs, the best possible energy is stuck at −3.30, far above the true value. Fighting this kind of noise is the job of **error mitigation** (Lesson 36), which VQE experiments use routinely.

One warning sign is worth remembering. A real state, pure or noisy, can never have energy below E₀, so the principle also holds on noisy hardware. But an **estimate** can go below E₀ because of shot noise or imperfect mitigation. If a VQE paper reports an energy below the exact answer, that's a red flag about its error bars, not a success.

## QAOA: variational optimisation

Many practical problems are **combinatorial optimisation**: choose the best arrangement among exponentially many. A standard test problem is **MaxCut**: split the nodes of a network into two groups so that as many links as possible cross between the groups. (It's NP-hard in general, and closely related to problems in scheduling, chip layout and clustering.)

### The cost as an energy

Label each node 0 or 1. A link between nodes i and j is cut when their labels differ. The operator (1 − ZᵢZⱼ)/2 has value 1 for a cut link and 0 otherwise, so

> C = Σ over links (1 − ZᵢZⱼ)/2

is a diagonal "Hamiltonian" whose value on each bitstring is its cut size. Finding the maximum cut means finding the **highest-energy** bitstring of C (or, equivalently, the ground state of −C). Lesson 46 shows how many other problems, from portfolio selection to routing, can be written the same way.

### The QAOA circuit

QAOA (Farhi, Goldstone and Gutmann, 2014) starts in the equal superposition |+⟩^⊗n of all bitstrings and applies p rounds of two layers:

1. **Problem layer** e^(−iγC): gives each bitstring a phase proportional to its cut size. In gates, an RZZ rotation on every link.
2. **Mixer layer** e^(−iβΣXᵢ): an RX rotation on every qubit, which moves amplitude between bitstrings that differ by one flip.

The 2p angles (γ₁, β₁, …, γₚ, βₚ) are tuned by a classical optimiser to maximise the expected cut ⟨C⟩. The phases mark good answers, and the mixer turns those phases into interference that **boosts their probability**, a little like Grover's algorithm (Lesson 24) but guided by a cost instead of a yes/no oracle. As p → ∞, QAOA can reproduce a slow **adiabatic** evolution (Lesson 46) and is guaranteed to find the optimum; at small p it's a heuristic.

### The landscape

With p = 1 there are only two angles, so we can map the whole landscape the optimiser explores. Here's a ring of 6 nodes, whose best cut is all 6 links (alternate the labels):

```python
import numpy as np
from scipy.optimize import minimize
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

n = 6
edges = [(i, (i + 1) % n) for i in range(n)]          # a ring of 6 nodes; the best cut is 6

cuts = np.array([sum((x >> i & 1) != (x >> j & 1) for i, j in edges) for x in range(2**n)])

def expected_cut(gamma, beta):
    qc = QuantumCircuit(n)
    qc.h(range(n))                                    # equal superposition of all 64 splits
    for i, j in edges:
        qc.rzz(2 * gamma, i, j)                       # problem layer
    qc.rx(2 * beta, range(n))                         # mixer layer
    return Statevector(qc).probabilities() @ cuts

gammas = np.linspace(0, np.pi, 41)
betas = np.linspace(0, np.pi / 2, 11)
grid = np.array([[expected_cut(g, b) for g in gammas] for b in betas])

shades = " .:-=+*#%@"                                 # low ... high expected cut
print("β ↓   γ →  (0 to π)")
for b, row in zip(betas, grid):
    line = "".join(shades[int((v - grid.min()) / (grid.max() - grid.min()) * 9.999)] for v in row)
    print(f"{b:4.2f}  {line}")

i, j = np.unravel_index(grid.argmax(), grid.shape)
print(f"\nbest on the grid: γ = {gammas[j]:.3f}, β = {betas[i]:.3f}, expected cut {grid.max():.3f} of 6"
      f" (ratio {grid.max() / 6:.3f})")
res = minimize(lambda x: -expected_cut(*x), [gammas[j], betas[i]], method="COBYLA")
print(f"refined by COBYLA: γ = {res.x[0]:.3f}, β = {res.x[1]:.3f}, expected cut {-res.fun:.3f} (ratio {-res.fun / 6:.3f})")
print(f"random guessing: {cuts.mean():.3f} (ratio {cuts.mean() / 6:.3f})")
```

```text
β ↓   γ →  (0 to π)
0.00  =========================================
0.16  ==-::.::-==+*##%##*+==-::.::-==+*##%##*+=
0.31  =-:     :-=*#@@@@@#*=-:     :-=*#@@@@@#*=
0.47  =-:     :-=*#@@@@@#*=-:     :-=*#@@@@@#*=
0.63  ==-::.::-==+*##%##*+==-::.::-==+*##%##*+=
0.79  =========================================
0.94  =+*##%##*+==-::.::-==+*##%##*+==-::.::-==
1.10  =*#@@@@@#*=-:     :-=*#@@@@@#*=-:     :-=
1.26  =*#@@@@@#*=-:     :-=*#@@@@@#*=-:     :-=
1.41  =+*##%##*+==-::.::-==+*##%##*+==-::.::-==
1.57  =========================================

best on the grid: γ = 2.749, β = 0.471, expected cut 4.427 of 6 (ratio 0.738)
refined by COBYLA: γ = 2.749, β = 0.393, expected cut 4.500 (ratio 0.750)
random guessing: 3.000 (ratio 0.500)
```

Each character is the expected cut at one (γ, β) point, from low (blank) to high (@). Several things are visible:

- **Flat lines.** At β = 0 the mixer does nothing, and at γ = 0 the problem layer does nothing; either way, the phases never turn into probabilities, and the expected cut stays at the random-guessing value of 3. (At γ = π/2 every node's two links cancel and the problem layer is again trivial, and at β = π/4 the effects also cancel, by a symmetry of this problem.)
- The landscape **repeats**, because of symmetries of the problem. An optimiser only needs to search a small box.
- The best point gives an expected cut of **4.5 out of 6**, a ratio of exactly **3/4**. This matches a theorem of Farhi and colleagues for rings at p = 1, against 1/2 for random guessing.

A useful fact explains why: at depth p, QAOA only "sees" the network within p steps of each link. Every link of a ring looks the same locally, so the same angles give the same 3/4 ratio on a ring of 6 nodes or 6 million. In general, good angles often **transfer** between similar problems, which saves a lot of optimisation. Deeper circuits see further and do better: Lesson 46 runs p = 1, 2 and 3 on a harder network and compares the results with the best classical algorithms.

## Honest status

- **No demonstrated practical advantage.** For every real chemistry or optimisation problem tried so far, the best classical methods (coupled cluster, DMRG and tensor networks in chemistry; commercial solvers, simulated annealing and the Goemans–Williamson algorithm in optimisation) match or beat VQE and QAOA.
- **Training is hard.** Barren plateaus, local minima and noise all fight the optimiser, and the measurement cost grows quickly with problem size (Lesson 45 explores all three).
- **The tension with classical simulation.** Recent research suggests that circuits structured enough to avoid barren plateaus are often also structured enough to be simulated classically, which would remove the quantum advantage.
- **What variational methods are good for today:** they're the main way researchers exercise real hardware, test error mitigation (Lesson 36) and explore heuristics. Newer hybrid methods build on them; for example, **sample-based quantum diagonalisation**, used by IBM and RIKEN researchers in 2024 together with the Fugaku supercomputer, uses a quantum computer to pick out the most important bitstrings and a classical computer to solve the problem within them.
- **The long term.** On fault-tolerant machines, chemistry will probably move to phase estimation (Lesson 27), which gives energies to any precision without an optimisation loop. Variational ideas will live on in preparing good starting states for it, and in quantum machine learning (Lesson 45).

## Try it

1. For H = Z + 0.5·X on one qubit, what is the ground energy? What if the coefficients are 1 and 1?
2. In the variational principle demo, why can no state have energy below −1.4142?
3. Which gates measure ⟨Y⟩ on a qubit with a normal Z-basis measurement?
4. With 1,000 shots, an energy estimate has an error of 0.03. Roughly how many shots give an error of 0.001?
5. A circuit's energy is E(θ) = 2 + 3 cos θ − sin θ. Use the parameter-shift rule to find dE/dθ at θ = 0, and check it by differentiating directly.
6. A circuit has 200 parameters. How many energy evaluations does one gradient step cost with parameter shifts? With SPSA?
7. Why can the optimiser compensate for a 10% over-rotation, but not for depolarising noise?
8. QAOA with p = 1 gives a 3/4 cut ratio on a 6-node ring. Why do the same angles give the same ratio on a 100-node ring?

**Answers:**

1. The ground energy of aZ + bX is −√(a² + b²). So −√1.25 ≈ **−1.118**, and with 1 and 1, −√2 ≈ **−1.414**.
2. The energy of any state is a weighted average of the energy levels, with non-negative weights adding to 1, so it can't be below the lowest level, −√2 ≈ −1.4142.
3. **S† then H** (S† followed by H rotates the Y axis onto the Z axis), then measure normally.
4. Error scales as 1/√shots, so you need (0.03/0.001)² = 900 times more: about **900,000 shots**.
5. E(π/2) = 2 + 0 − 1 = 1 and E(−π/2) = 2 + 0 + 1 = 3, so (1 − 3)/2 = **−1**. Directly: dE/dθ = −3 sin θ − cos θ = −1 at θ = 0. They agree.
6. Parameter shift: 2 × 200 = **400** evaluations. SPSA: **2**.
7. An over-rotation is systematic: the optimiser just learns smaller angles (θ/1.1), and the device then makes exactly the intended state. Depolarising noise is random: some runs are replaced by junk, and no fixed choice of angles can undo randomness.
8. At p = 1, the expected cut of each link depends only on the network within one step of that link. On any ring, every link has the same neighbourhood, so each link contributes the same amount, whatever the ring's size.

## Cheat sheet

| Idea | Formula or fact |
|---|---|
| NISQ | Noisy hardware: ~10⁻³ errors, so only shallow circuits |
| The loop | Ansatz prepares \|ψ(θ)⟩ → quantum computer measures E(θ) → classical optimiser updates θ |
| Variational principle | ⟨ψ\|H\|ψ⟩ = Σ\|cᵢ\|²Eᵢ ≥ E₀ for every state |
| Measuring H | H = Σ cⱼPⱼ; rotate X (H) or Y (S†, H) onto Z; value = (−1)^parity |
| Shot noise | Error ∝ 1/√shots |
| Ansatz | Expressive, shallow and trainable; hardware-efficient or problem-inspired (UCC, QAOA) |
| Real Hamiltonians | Only X and Z terms → real ground state → RY + CNOT is enough |
| Parameter shift | dE/dθ = [E(θ + π/2) − E(θ − π/2)]/2, exact for rotation gates |
| Gradient cost | 2 evaluations per parameter; SPSA: 2 per step, any number of parameters |
| Noise | Coherent errors largely absorbed; incoherent noise isn't → error mitigation (Lesson 36) |
| Red flag | An estimated energy below E₀ means the error bars are wrong |
| MaxCut cost | C = Σ (1 − ZᵢZⱼ)/2 over links |
| QAOA | \|+⟩^⊗n, then p rounds of e^(−iγC) (RZZ) and e^(−iβΣX) (RX); 2p angles |
| QAOA on rings | p = 1 gives a 3/4 cut ratio; angles transfer between similar graphs |
| Status | No practical advantage yet; barren plateaus, measurement cost, classical competition |
