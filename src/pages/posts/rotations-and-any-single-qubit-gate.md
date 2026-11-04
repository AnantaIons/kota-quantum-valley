---
layout: ../../layouts/Post.astro
title: "Rotations and building any single-qubit gate"
description: "The rotation gates RX, RY and RZ and where their formula comes from, why a full turn gives a minus sign, preparing any state on the Bloch sphere, Euler angles and the fact that three rotations build any single-qubit gate, Qiskit's U gate, and what a real superconducting chip actually runs."
date: 2026-11-04
category: lesson
lesson: 11

---

The six gates of Lesson 9 are fixed rotations: half-turns, quarter-turns, eighth-turns. Real quantum programs need **any** angle: rotate by 37°, tilt to exactly the right latitude, fine-tune a parameter in a variational algorithm (Lesson 30). This lesson introduces the **rotation gates** RX, RY and RZ, which turn the Bloch sphere by any angle θ about the x, y or z axis.

Then it proves something remarkable: **three rotations are enough to build every possible single-qubit gate.** That's why a real quantum chip only needs to be good at a couple of physical operations, and it's how your circuits are translated into what the hardware actually does.

## The rotation gates

Here are the three rotation gates, for an angle θ:

```text
RX(θ) = [ cos(θ/2)      −i·sin(θ/2) ]
        [ −i·sin(θ/2)    cos(θ/2)   ]

RY(θ) = [ cos(θ/2)   −sin(θ/2) ]
        [ sin(θ/2)    cos(θ/2) ]

RZ(θ) = [ e^(−iθ/2)       0      ]
        [     0       e^(iθ/2)   ]
```

On the Bloch sphere, RX(θ) rotates by θ about the x-axis, RY(θ) about the y-axis, and RZ(θ) about the z-axis, using the right-hand rule (thumb along the axis, fingers curl in the direction of rotation).

Notice the half-angles again. Just as in Lesson 7, an angle θ on the sphere corresponds to θ/2 inside the matrix. Also notice that RY has only **real** entries: it rotates within the plane containing |0⟩ and |1⟩, like an ordinary 2D rotation matrix with a half angle. That makes it the natural gate for setting probabilities: RY(θ)|0⟩ = cos(θ/2)|0⟩ + sin(θ/2)|1⟩.

### Where the formula comes from

All three come from one compact formula:

> **R_P(θ) = e^(−iθP/2)**, where P is X, Y or Z

The exponential of a matrix is defined by the same power series as for numbers: e^A = I + A + A²/2! + A³/3! + …. Normally that's hard to compute. But the Pauli matrices have a special property from Lesson 9: **P² = I**. So the powers of P just alternate: P, I, P, I, …. Group the series into the terms with I and the terms with P:

```text
e^(−iθP/2) = I·[1 − (θ/2)²/2! + (θ/2)⁴/4! − …] − i·P·[(θ/2) − (θ/2)³/3! + …]
           = cos(θ/2)·I − i·sin(θ/2)·P
```

The two brackets are exactly the power series for cos and sin. Put P = X, Y or Z into cos(θ/2)·I − i·sin(θ/2)·P and you get the three matrices above. (This is the matrix version of Euler's formula from Lesson 2.)

Why should a rotation be "e to the minus i times angle times Pauli"? In physics, a qubit evolves as e^(−iHt/ħ) where H is its energy (its Hamiltonian, Lesson 29). A field pointing along x gives an energy proportional to X, so the qubit rotates about x. **Every rotation gate is a short burst of a carefully chosen energy.** That's literally how the hardware makes them (Lesson 38).

### Code: checking the formula

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Operator, Statevector, SparsePauliOp

X = np.array([[0, 1], [1, 0]])
theta = np.pi / 3
RX_formula = np.cos(theta / 2) * np.eye(2) - 1j * np.sin(theta / 2) * X
qc = QuantumCircuit(1)
qc.rx(theta, 0)
print("RX formula matches Qiskit:", np.allclose(RX_formula, Operator(qc).data))

# RX(pi) is X up to a global phase of -i
qc = QuantumCircuit(1)
qc.rx(np.pi, 0)
print(np.round(Operator(qc).data, 3))
print("RX(pi) equiv X:", Operator(qc).equiv(Operator.from_label("X")))

# A full turn is not "nothing": RX(2 pi) = -I
qc = QuantumCircuit(1)
qc.rx(2 * np.pi, 0)
print(np.round(Operator(qc).data.real, 3))
```

```text
RX formula matches Qiskit: True
[[0.+0.j 0.-1.j]
 [0.-1.j 0.+0.j]]
RX(pi) equiv X: True
[[-1.  0.]
 [ 0. -1.]]
```

Two things to take away:

**The Pauli gates are half-turns.** RX(π) = −i·X. The −i is a global phase, so RX(π) and X are the same gate. Likewise RY(π) ≅ Y and RZ(π) ≅ Z. And the phase gates are z-rotations: S ≅ RZ(π/2), T ≅ RZ(π/4).

**A full turn gives a minus sign.** RX(2π) = −I, not I. You need to go round **twice** (4π) to get back exactly to the identity. On its own, −I is a global phase and invisible. But as Lesson 10 warned, put it inside a controlled gate and it becomes a relative phase you can measure. This "4π symmetry" is a real property of electron spin, and it has been seen in neutron interference experiments.

## Rotation about any axis

Nothing is special about x, y and z. For any direction n = (n_x, n_y, n_z) of length 1, the rotation by θ about n is

> R_n(θ) = cos(θ/2)·I − i·sin(θ/2)·(n_x X + n_y Y + n_z Z)

For example, the Hadamard gate is a half-turn (θ = π) about the diagonal axis n = (1, 0, 1)/√2. Put those in: R_n(π) = −i·(X + Z)/√2 = −i·H. So **H is a rotation**, up to the global phase −i, just as Lesson 9 described.

This leads to a clean geometric fact:

> **Every single-qubit gate is a rotation of the Bloch sphere about some axis by some angle, times a global phase.**

The six gates of Lesson 9, RX, RY, RZ, and every other single-qubit unitary you'll ever meet: all rotations. That's why the Bloch sphere picture is so powerful for one qubit.

## Preparing any state

Want the qubit at a particular point (θ, φ) on the sphere? Start at the North Pole |0⟩ and do two rotations:

1. **RY(θ)** tilts the arrow down from the pole by θ, towards +x. Now it's at latitude θ.
2. **RZ(φ)** turns it around the z-axis by φ. Now it's at longitude φ.

The result is cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩ (up to a global phase): exactly the general state from Lesson 7.

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, SparsePauliOp

def prepare(theta, phi):
    """Any point on the Bloch sphere: tilt by theta about y, then turn by phi about z."""
    qc = QuantumCircuit(1)
    qc.ry(theta, 0)
    qc.rz(phi, 0)
    return qc

theta, phi = np.radians(120), np.radians(45)
s = Statevector(prepare(theta, phi))
x, y, z = (float(s.expectation_value(SparsePauliOp(p)).real) for p in "XYZ")
print("measured  :", round(x, 3), round(y, 3), round(z, 3))
print("predicted :", round(np.sin(theta) * np.cos(phi), 3), round(np.sin(theta) * np.sin(phi), 3), round(np.cos(theta), 3))
```

```text
measured  : 0.612 0.612 -0.5
predicted : 0.612 0.612 -0.5
```

The Bloch vector matches (sin θ cos φ, sin θ sin φ, cos θ) exactly. This RY-then-RZ recipe is how you'd load a number into a qubit as an angle, which is the starting point of many quantum machine-learning circuits (Lesson 45).

## Euler angles: three rotations build any gate

Preparing a state needed two rotations. Building a whole **gate** needs at most three. The theorem:

> **Any single-qubit unitary U can be written as U = e^(iα)·RZ(β)·RY(γ)·RZ(δ)**

for some four angles α, β, γ, δ. (α is just a global phase.) This is the **ZYZ Euler decomposition**, named after Leonhard Euler, who showed in the 1700s that any orientation of a rigid body can be reached by three rotations about two axes. Pilots and game programmers use the same idea: yaw, pitch, yaw.

Why does it work? Think of what U does to the North Pole. RZ(δ) does nothing to it; RY(γ) tilts it to the right latitude; RZ(β) turns it to the right longitude. That fixes where |0⟩ goes. The first rotation, RZ(δ), then sets the remaining freedom: how much the sphere is twisted around that point.

Qiskit can find the angles for any gate:

```python
import numpy as np
from qiskit import QuantumCircuit, transpile
from qiskit.quantum_info import Operator, random_unitary
from qiskit.synthesis import OneQubitEulerDecomposer

U = random_unitary(2, seed=42)                 # any single-qubit gate at all
zyz = OneQubitEulerDecomposer(basis="ZYZ")
circ = zyz(U)                                   # find the three angles
print(circ.draw("text"))
print("rebuilt gate equals U:", Operator(circ).equiv(U))

# What a superconducting chip actually runs for a Hadamard
qc = QuantumCircuit(1)
qc.h(0)
native = transpile(qc, basis_gates=["rz", "sx", "x"])
print(native.draw("text"))
```

```text
global phase: 5.664
   ┌───────────────┐┌─────────────┐┌────────────┐
q: ┤ Rz(0.0088291) ├┤ Ry(0.73591) ├┤ Rz(1.5846) ├
   └───────────────┘└─────────────┘└────────────┘
rebuilt gate equals U: True
global phase: π/4
   ┌─────────┐┌────┐┌─────────┐
q: ┤ Rz(π/2) ├┤ √X ├┤ Rz(π/2) ├
   └─────────┘└────┘└─────────┘
```

A completely random gate was rebuilt from three rotations (angles in radians), plus a global phase that Qiskit records separately.

### Qiskit's U gate

Because three angles describe any gate, Qiskit has a single general gate for it: **U(θ, φ, λ)**, equal to RZ(φ)·RY(θ)·RZ(λ) up to a global phase. Every single-qubit gate is some U:

| Gate | As U(θ, φ, λ) |
|---|---|
| X | U(π, 0, π) |
| H | U(π/2, 0, π) |
| RY(θ) | U(θ, 0, 0) |
| P(λ) | U(0, 0, λ) |

## What the hardware really runs

The last part of the code output answers a practical question. A real chip can't do "any rotation" directly. IBM's superconducting processors, for example, offer just a few native operations: **RZ(θ)**, **√X** (written SX, a quarter-turn about x, equal to RX(π/2) up to phase) and **X**.

The output shows that a Hadamard becomes RZ(π/2), then √X, then RZ(π/2). In general, **any single-qubit gate needs at most RZ·√X·RZ·√X·RZ**: two physical pulses and three RZs.

And here's the clever part. As Lesson 10 explained, an RZ on these machines is **virtual**: it's done by shifting the reference phase of all later pulses in software. It takes no time and adds no error. So the real cost of any single-qubit gate is at most **two** √X pulses, each lasting a few tens of nanoseconds. Engineers only have to make one pulse shape extremely good, and every other gate comes for free from software. Lesson 40 shows this translation, called **transpiling**, for whole circuits.

## Try it

1. Write the matrix of RY(π/2), and show that RY(π/2)|0⟩ = |+⟩.
2. What state does RX(π/2)|0⟩ give? Where is it on the Bloch sphere?
3. Use RZ(θ) = e^(−iθ/2)·P(θ) to explain why S = P(π/2) and RZ(π/2) are the same gate on their own.
4. Which rotation takes |+⟩ to |−⟩? Give two different answers.
5. You want P(1) = 0.1. What angle θ should RY(θ) use, starting from |0⟩?
6. Why does a real chip only need to make √X pulses well, and not RZ pulses?

**Answers:**

1. RY(π/2) = [[1, −1], [1, 1]]/√2. Applied to [1, 0] it gives [1, 1]/√2 = |+⟩. (Tilting the North Pole 90° towards +x.)
2. [cos 45°, −i·sin 45°] = (|0⟩ − i|1⟩)/√2 = **|−i⟩**, on the equator at −y. (Rotating the pole about +x by the right-hand rule tips it towards −y.)
3. They differ only by the global phase e^(−iπ/4), which can't be detected for a single gate.
4. RZ(π), which turns the equator half a circle (that's Z, up to phase). Also RY(π), which flips +x to −x (that's Y, up to phase).
5. sin²(θ/2) = 0.1 → sin(θ/2) ≈ 0.316 → θ/2 ≈ 18.4° → **θ ≈ 36.9°**.
6. RZ is done virtually in software by shifting the phase of later pulses, so it costs no time and adds no error. Every gate is RZ·√X·RZ·√X·RZ.

## Cheat sheet

| Idea | Formula or fact |
|---|---|
| Rotation gate | R_P(θ) = e^(−iθP/2) = cos(θ/2)·I − i·sin(θ/2)·P |
| Why it simplifies | P² = I, so the power series splits into cos and sin |
| RX, RY, RZ | Rotate the Bloch sphere by θ about x, y, z |
| RY | Real matrix; RY(θ)\|0⟩ = cos(θ/2)\|0⟩ + sin(θ/2)\|1⟩ |
| Paulis as rotations | RX(π) = −iX, RY(π) = −iY, RZ(π) = −iZ |
| Phase gates as rotations | S ≅ RZ(π/2), T ≅ RZ(π/4) |
| Full turn | R(2π) = −I; R(4π) = I |
| Any axis | R_n(θ) = cos(θ/2)·I − i·sin(θ/2)·(n·σ) |
| Hadamard | Half-turn about (x+z)/√2: H = i·R_n(π) |
| Every 1-qubit gate | A rotation about some axis, times a global phase |
| Prepare any state | RY(θ) then RZ(φ) from \|0⟩ |
| Euler (ZYZ) | U = e^(iα)·RZ(β)·RY(γ)·RZ(δ) |
| Qiskit U gate | U(θ, φ, λ) ≅ RZ(φ)·RY(θ)·RZ(λ); H = U(π/2, 0, π) |
| IBM native gates | RZ (virtual, free), √X, X |
| Any gate on hardware | At most RZ·√X·RZ·√X·RZ: two real pulses |
