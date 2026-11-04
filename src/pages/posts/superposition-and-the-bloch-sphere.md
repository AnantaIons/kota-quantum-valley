---
layout: ../../layouts/Post.astro
title: "Superposition and the Bloch sphere"
description: "Why every qubit state is a point on a sphere, how the two Bloch angles come from α and β, why θ/2 appears, the six landmark states, how superposition differs from a coin toss (with a test you can run), and what the inside of the sphere means."
date: 2026-11-04
category: lesson
lesson: 7

---

Lesson 6 said a qubit's state is a vector |ψ⟩ = α|0⟩ + β|1⟩, with two complex numbers α and β. That's correct, but hard to picture: two complex numbers are four real numbers, and nobody can visualise four dimensions.

This lesson shows that **every qubit state is really just a point on the surface of a ball**, called the **Bloch sphere**. Once you can see states as points and gates as rotations, single-qubit quantum computing becomes something you can reason about with your eyes. And we'll pin down exactly what **superposition** means, including a simple experiment that shows it's not the same thing as "we don't know which".

## From four numbers to two angles

Start with α and β. Each complex number has a size and an angle (Lesson 2), so the state has four real numbers. Two facts cut this down.

**1. Normalisation removes one.** Probabilities must add to 1: |α|² + |β|² = 1. If you know the size of α, you know the size of β. So the two sizes can be written with a single angle. Since cos² + sin² = 1, write:

> |α| = cos(θ/2),  |β| = sin(θ/2)

(The "/2" looks odd. Hold that thought; it's explained below.)

**2. Global phase removes another.** Multiplying the whole state by e^(iγ) changes nothing measurable (Lesson 2). So we're free to rotate both amplitudes together until α is a positive real number. Only the **difference** between their phases survives. Call it φ.

What's left is two angles, θ and φ, and every qubit state can be written as:

> **|ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)·sin(θ/2)|1⟩**

with θ from 0 to 180° and φ from 0 to 360°. Two angles are exactly what you need to describe a point on the surface of a sphere: θ is like latitude measured down from the North Pole, and φ is like longitude.

## Drawing the sphere

Put the point on a unit sphere using ordinary spherical coordinates:

```text
x = sin θ · cos φ
y = sin θ · sin φ
z = cos θ
```

The arrow from the centre to that point is the **Bloch vector**. Some immediate consequences:

- **θ = 0** gives |ψ⟩ = |0⟩. That's the **North Pole**, (0, 0, 1).
- **θ = 180°** gives |ψ⟩ = e^(iφ)|1⟩, which is |1⟩ up to a global phase. That's the **South Pole**, (0, 0, −1).
- **θ = 90°** gives |α| = |β| = 1/√2: a 50/50 superposition. These states lie around the **equator**, and φ says where.

### The six landmark states

| State | Amplitudes | θ, φ | Bloch vector | Where |
|---|---|---|---|---|
| \|0⟩ | [1, 0] | 0°, any | (0, 0, 1) | North Pole |
| \|1⟩ | [0, 1] | 180°, any | (0, 0, −1) | South Pole |
| \|+⟩ | [1, 1]/√2 | 90°, 0° | (1, 0, 0) | Equator, front (+x) |
| \|−⟩ | [1, −1]/√2 | 90°, 180° | (−1, 0, 0) | Equator, back (−x) |
| \|+i⟩ | [1, i]/√2 | 90°, 90° | (0, 1, 0) | Equator, right (+y) |
| \|−i⟩ | [1, −i]/√2 | 90°, 270° | (0, −1, 0) | Equator, left (−y) |

(Qiskit calls |+i⟩ and |−i⟩ 'r' and 'l', for right and left.)

### Why θ/2? Opposite points are orthogonal states

On the sphere, |0⟩ and |1⟩ are **opposite** points, 180° apart. But as vectors, |0⟩ and |1⟩ are at **90°** to each other: they're orthogonal (⟨0|1⟩ = 0). The sphere **doubles** every angle compared with the state vectors. That's where the θ/2 comes from: an angle θ on the sphere means an angle θ/2 between state vectors.

The useful rule that comes out of this:

> **Opposite points on the Bloch sphere are orthogonal states**, which one measurement can tell apart perfectly.

So |+⟩ and |−⟩ (front and back) are orthogonal, and so are |+i⟩ and |−i⟩. Any diameter of the sphere is a basis you can measure in.

### Reading probabilities straight off the picture

The z coordinate tells you the measurement probabilities for the ordinary 0/1 measurement:

```text
P(0) = cos²(θ/2) = (1 + cos θ)/2 = (1 + z)/2
P(1) = sin²(θ/2) = (1 − cos θ)/2 = (1 − z)/2
```

(Using the half-angle identity cos²(θ/2) = (1 + cos θ)/2 from Class 11 trigonometry.)

So the **height** of the point is all that matters for a 0/1 measurement. North Pole: P(0) = 1. Equator: 50/50. Two-thirds of the way up (z = 1/3): P(0) = 2/3. The longitude φ is completely invisible to this measurement, but it's not invisible to everything, as you'll see below and in Lesson 10.

The same works for the other axes. x tells you the chances for a +/− measurement, and y for a +i/−i measurement:

> P(+) = (1 + x)/2,  P(+i) = (1 + y)/2

In fact x, y and z are exactly the **expectation values** of the X, Y and Z observables (Lesson 5): x = ⟨X⟩, y = ⟨Y⟩, z = ⟨Z⟩. That gives a way to compute the Bloch vector of any state in code.

### Code: Bloch vectors

```python
import numpy as np
from qiskit.quantum_info import Statevector, SparsePauliOp

def bloch(state):
    """Return the Bloch vector (x, y, z) = (<X>, <Y>, <Z>) of a one-qubit state."""
    return [round(float(state.expectation_value(SparsePauliOp(p)).real), 3) for p in "XYZ"]

for label in ["0", "1", "+", "-", "r", "l"]:
    print(label, bloch(Statevector.from_label(label)))

theta, phi = np.pi / 3, np.pi / 2           # 60 degrees down from the north pole, facing +y
psi = Statevector([np.cos(theta / 2), np.exp(1j * phi) * np.sin(theta / 2)])
print("custom", bloch(psi), "P(0) =", round(float(psi.probabilities()[0]), 3))
```

```text
0 [0.0, 0.0, 1.0]
1 [0.0, 0.0, -1.0]
+ [1.0, 0.0, 0.0]
- [-1.0, 0.0, 0.0]
r [0.0, 1.0, 0.0]
l [0.0, -1.0, 0.0]
custom [0.0, 0.866, 0.5] P(0) = 0.75
```

The custom state has θ = 60°: z = cos 60° = 0.5, and P(0) = (1 + 0.5)/2 = 0.75, matching the formula. Its φ = 90° puts it on the +y side, with y = sin 60° = 0.866.

Open the [Quantum Lab](/lab/) and try Experiment 1: it draws this sphere and lets you move the point with gates.

## What superposition really means

A qubit is "in superposition" when more than one of its amplitudes is non-zero. On the sphere: any point that isn't exactly at the North or South Pole.

But notice what the table above says: **superposition depends on the question.** |+⟩ is a 50/50 superposition of |0⟩ and |1⟩, but it's a perfectly definite answer to the question "+ or −?". There's nothing special about the poles; they're just the axis the computer happens to measure along by default. Every point on the sphere is the North Pole of some other axis.

### Superposition is not "we don't know which"

The most common mistake about superposition is to think |+⟩ = (|0⟩ + |1⟩)/√2 means "the qubit is really 0 or really 1, we just don't know which, like a coin under a cup". Both give 50/50 if you measure straight away. So how could you ever tell them apart?

Apply a Hadamard gate before measuring.

- **The superposition** |+⟩: H|+⟩ = |0⟩ (Lesson 4). You get **0 every time**. The amplitudes from |0⟩ and |1⟩ interfere: they add up for the result 0 and cancel for the result 1.
- **The coin toss**: half the time the qubit is |0⟩, and H turns it into |+⟩, which gives 50/50. Half the time it's |1⟩, and H turns it into |−⟩, also 50/50. Overall: **50/50**. No interference, because in each run there was only one amplitude.

```python
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler
sampler = StatevectorSampler(seed=11)

# 1. Superposition: H makes |+>. A second H, then measure.
sup = QuantumCircuit(1)
sup.h(0)
sup.h(0)
sup.measure_all()
print("superposition, then H:", sampler.run([sup], shots=1000).result()[0].data.meas.get_counts())

# 2. Coin toss: half the runs start as |0>, half as |1>. Then H, then measure.
start0 = QuantumCircuit(1)
start0.h(0)
start0.measure_all()
start1 = QuantumCircuit(1)
start1.x(0)
start1.h(0)
start1.measure_all()
r0, r1 = sampler.run([start0, start1], shots=500).result()
c0, c1 = r0.data.meas.get_counts(), r1.data.meas.get_counts()
print("coin toss, then H:    ", {k: c0.get(k, 0) + c1.get(k, 0) for k in "01"})
```

```text
superposition, then H: {'0': 1000}
coin toss, then H:     {'0': 530, '1': 470}
```

Same 50/50 statistics before the H; completely different results after it. This is the cleanest demonstration that a superposition is a real, single state with its own direction, not a hidden 0 or 1 that we're ignorant of. It's the double-slit experiment from Lesson 5 in miniature.

### What about "a spinning coin"?

A spinning coin is a popular picture, and it gets one thing right: the qubit isn't settled into heads or tails yet. But it misses the essential part. A spinning coin has no **phase**, so two spinning coins can't cancel each other. Qubits can. If you remember one thing: superposition plus **interference** is the resource; superposition alone gives you nothing more than a random number generator.

## The inside of the ball

Every **pure** state (one you can write as a single vector α|0⟩ + β|1⟩) sits on the **surface** of the sphere, with Bloch vector length exactly 1.

But the coin toss above is something else: a random mixture of |0⟩ and |1⟩. It's called a **mixed state**, and it lives **inside** the ball. A 50/50 mixture of |0⟩ and |1⟩ is the centre point (0, 0, 0): measuring in any basis gives 50/50, and no gate can create interference from it. A 90/10 mixture of |0⟩ and |1⟩ sits on the z-axis at z = 0.8.

Why care? Because real qubits leak information into their surroundings, and that turns pure states into mixed ones: the Bloch vector **shrinks** towards the centre over time. That's **decoherence**, the main enemy of quantum computers, and Lesson 32 measures it. Mixed states are described by a tool called the density matrix, which Lesson 16 introduces.

## Limits of the picture

The Bloch sphere is perfect for one qubit and fails for two or more. Even a pure two-qubit state needs 6 real numbers (a general one needs 15), which is more than a pair of spheres can hold, and entangled states (Lesson 14) have **no** individual Bloch vectors on the surface at all: each qubit on its own looks like a mixed state at the centre. Use the sphere for single-qubit reasoning, and switch to algebra for many qubits.

## Try it

1. Where on the sphere is the state cos(30°)|0⟩ + sin(30°)|1⟩? Give θ, φ and P(0).
2. A state has Bloch vector (0, 0, −0.6). What are P(0) and P(1)?
3. Which state is opposite |+i⟩ on the sphere? Check that they're orthogonal.
4. Is (|0⟩ + i|1⟩)/√2 the same physical state as (i|0⟩ − |1⟩)/√2? (Hint: look for a global phase.)
5. In the code, change the coin toss so the qubit starts as |0⟩ in 90% of the runs. What do you expect after H?
6. Explain in one sentence why measuring in the 0/1 basis can't tell |+⟩ from |+i⟩, but another measurement can.

**Answers:**

1. θ/2 = 30°, so **θ = 60°**, φ = 0. P(0) = cos²30° = **0.75**. The point is 60° down from the North Pole on the +x side: (sin 60°, 0, cos 60°) = (0.866, 0, 0.5).
2. P(0) = (1 − 0.6)/2 = **0.2**, P(1) = **0.8**.
3. **|−i⟩** = (|0⟩ − i|1⟩)/√2. ⟨+i|−i⟩ = ½(1·1 + (i)*·(−i)) = ½(1 + (−i)(−i)) = ½(1 − 1) = 0. ✓
4. **Yes.** (i|0⟩ − |1⟩)/√2 = i·(|0⟩ + i|1⟩)/√2, since i·i = −1. It differs only by the global phase i.
5. Still about **50/50.** |0⟩ → |+⟩ and |1⟩ → |−⟩ both give 50/50 after H, whatever the mix. (A coin toss never interferes.)
6. Both are on the equator (z = 0), so the 0/1 measurement gives 50/50 for both; measuring in the +/− basis gives "+" every time for |+⟩ but 50/50 for |+i⟩.

## Cheat sheet

| Idea | Formula or fact |
|---|---|
| Any qubit state | \|ψ⟩ = cos(θ/2)\|0⟩ + e^(iφ) sin(θ/2)\|1⟩ |
| Why two angles | Normalisation and global phase remove two of four real numbers |
| Bloch vector | (sin θ cos φ, sin θ sin φ, cos θ) = (⟨X⟩, ⟨Y⟩, ⟨Z⟩) |
| Poles | \|0⟩ north, \|1⟩ south |
| Equator | \|±⟩ on x, \|±i⟩ on y: all 50/50 superpositions |
| Opposite points | Orthogonal states; any diameter is a basis |
| Angle doubling | Sphere angle θ = twice the angle between state vectors |
| 0/1 probabilities | P(0) = (1 + z)/2, P(1) = (1 − z)/2 |
| Other bases | P(+) = (1 + x)/2, P(+i) = (1 + y)/2 |
| Superposition | Non-zero amplitude on more than one basis state; basis-dependent |
| Superposition vs coin toss | Same statistics until an H; only superposition interferes |
| Pure state | On the surface, length 1 |
| Mixed state | Inside the ball; centre = completely random |
| Decoherence | The Bloch vector shrinks towards the centre |
| Limitation | One qubit only; entangled qubits have no surface Bloch vector |
