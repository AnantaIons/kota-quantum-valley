---
layout: ../../layouts/Post.astro
title: "Phase: global and relative"
description: "Why a global phase changes nothing, why a relative phase changes everything, how to turn a hidden phase into a measurable probability with an interferometer, where phases come from physically, why 'the same gate up to phase' stops being the same once you control it, and how random phase noise destroys interference."
date: 2026-11-04
category: lesson
lesson: 10

---

Phase is the part of quantum computing that has no everyday analogue, and it's the part that makes quantum algorithms work. You've met it several times: the angle of a complex amplitude (Lesson 2), the longitude φ on the Bloch sphere (Lesson 7), and the action of Z, S and T (Lesson 9).

This lesson pulls those threads together into one clear rule: **global phase is never physical, relative phase is always physical.** Then it shows how to measure a relative phase, where phases come from in real hardware, a subtle trap that catches even experienced programmers, and how phase noise quietly destroys quantum computation.

## Global phase: invisible, always

A **global phase** multiplies the whole state by the same factor e^(iγ):

> |ψ⟩ → e^(iγ)|ψ⟩

**Claim: no experiment can ever detect it.** Here's the proof, in two lines.

**Measurement in any basis:** the probability of outcome |b⟩ is |⟨b|e^(iγ)ψ⟩|² = |e^(iγ)|²·|⟨b|ψ⟩|² = |⟨b|ψ⟩|². Unchanged, whatever basis you choose.

**Any gates applied first:** U(e^(iγ)|ψ⟩) = e^(iγ)(U|ψ⟩). The phase just rides along to the end, where the measurement can't see it.

So e^(iγ)|ψ⟩ and |ψ⟩ are **the same physical state**. That's why we were free to make α real in Lesson 7, and why you'll often see statements like "X|−⟩ = −|−⟩, so |−⟩ is unchanged". A minus sign in front of the whole state is just a global phase of 180°.

## Relative phase: physical, always

A **relative phase** is a phase on one amplitude compared with another:

> (|0⟩ + |1⟩)/√2  versus  (|0⟩ + e^(iφ)|1⟩)/√2

These are genuinely different states for every φ (other than multiples of 360°). On the Bloch sphere, φ is the longitude: φ = 0 is |+⟩ at the front, φ = 90° is |+i⟩, φ = 180° is |−⟩ at the back.

But notice: **measuring in the 0/1 basis can't see φ.** Both amplitudes have size 1/√2, so P(0) = P(1) = ½ for every φ. The information is in the state, but the default question can't reach it. You need to ask a different question.

## The interferometer: turning phase into probability

The trick is to make the two amplitudes **interfere**. Apply H, then the phase, then H again, and measure.

Work through it. After the first H: (|0⟩ + |1⟩)/√2. After a phase gate P(φ): (|0⟩ + e^(iφ)|1⟩)/√2. Now apply H to each term, using H|0⟩ = (|0⟩ + |1⟩)/√2 and H|1⟩ = (|0⟩ − |1⟩)/√2:

```text
H (|0⟩ + e^(iφ)|1⟩)/√2  =  ½ [ (|0⟩ + |1⟩) + e^(iφ)(|0⟩ − |1⟩) ]
                        =  ½ [ (1 + e^(iφ))|0⟩ + (1 − e^(iφ))|1⟩ ]
```

The amplitude of |0⟩ is (1 + e^(iφ))/2. Its squared size, using Lesson 2's |1 + e^(iφ)|² = 2 + 2cos φ:

> **P(0) = (2 + 2cos φ)/4 = cos²(φ/2)**

The hidden phase is now a probability you can measure. At φ = 0 you always get 0; at φ = 180° you always get 1; in between, it varies smoothly.

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

# Interferometer: H, then a phase phi on |1>, then H. Read out P(0).
print(" phi   P(0) from Z   P(0) after H")
for deg in [0, 45, 90, 135, 180]:
    qc = QuantumCircuit(1)
    qc.h(0)
    qc.p(np.radians(deg), 0)                     # relative phase e^(i phi) on |1>
    before = Statevector(qc).probabilities()[0]  # measure straight away
    qc.h(0)
    after = Statevector(qc).probabilities()[0]   # measure after a second H
    print(f"{deg:4d}   {before:.3f}         {after:.3f}")
```

```text
 phi   P(0) from Z   P(0) after H
   0   0.500         1.000
  45   0.500         0.854
  90   0.500         0.500
 135   0.500         0.146
 180   0.500         0.000
```

The middle column is always 0.5: phase is invisible. The last column follows cos²(φ/2): phase made visible. (cos²22.5° = 0.854, cos²67.5° = 0.146.)

This little H–phase–H circuit is one of the most important patterns in the whole field. It's a **Ramsey interferometer** in atomic physics, the readout of every atomic clock and quantum sensor (Lesson 44), and the core of **phase estimation** (Lesson 27), which reads out phases to many digits of precision and powers Shor's algorithm.

## Where phases come from

In a circuit, relative phases come from gates like Z, S, T and P(φ). But in a real qubit there's a deeper source: **time itself.**

Quantum mechanics says a state with a definite energy E picks up a phase as time passes:

> |E⟩ → e^(−iEt/ħ)|E⟩

(ħ, "h-bar", is Planck's constant divided by 2π.) A qubit's |0⟩ and |1⟩ usually have different energies E₀ and E₁. So in a superposition, the two amplitudes rotate at different speeds, and their **relative** phase grows steadily:

> φ(t) = (E₁ − E₀)·t/ħ = 2π·f·t,  where f = (E₁ − E₀)/h

On the Bloch sphere, the state **precesses**: it circles around the z-axis at frequency f, like a spinning top. (That's what the arrow on our home page is doing.) The global part of the phase, common to both amplitudes, is invisible as always.

For a superconducting qubit, f is about **4 to 6 GHz**: the relative phase goes round billions of times every second. This has very practical consequences for the engineers who build quantum computers:

- Control electronics must keep track of this rotation precisely, so pulses arrive with the right phase. They work in a "rotating frame" that turns along with the qubit.
- This is why a **Z rotation can be done in software** on many machines: you just shift the reference phase of all later pulses. It's called a "virtual Z gate", it takes zero time, and it's perfect (Lesson 11 and Lesson 38).
- Any uncertainty in f, or noise that jiggles it, turns into uncertainty in φ. That's the next topic.

## The trap: "the same gate up to phase"

Two gates that differ only by a global phase, U and e^(iγ)U, have the same effect on any state. So we usually call them **the same gate**. For example, the phase gate P(θ) and the z-rotation RZ(θ) are related by a global phase:

```text
P(θ)  = [ 1     0    ]          RZ(θ) = [ e^(−iθ/2)     0      ]  =  e^(−iθ/2) · P(θ)
        [ 0   e^(iθ) ]                  [    0      e^(iθ/2)   ]
```

Now **control** them with a second qubit: apply the gate only when the control qubit is 1. The "global" phase e^(−iθ/2) now appears only in the branch where the control is 1, and not in the branch where it's 0. **A global phase has become a relative phase between the control's |0⟩ and |1⟩**, and it's suddenly physical.

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Operator

theta = np.pi / 2
a = QuantumCircuit(1); a.p(theta, 0)      # P(theta)  = diag(1, e^(i theta))
b = QuantumCircuit(1); b.rz(theta, 0)     # RZ(theta) = diag(e^(-i theta/2), e^(i theta/2))
print("same gate (up to global phase):", Operator(a).equiv(Operator(b)))
print("exactly equal:                 ", Operator(a) == Operator(b))

# Now control each one with another qubit
ca = QuantumCircuit(2); ca.cp(theta, 0, 1)
cb = QuantumCircuit(2); cb.crz(theta, 0, 1)
print("controlled versions equivalent:", Operator(ca).equiv(Operator(cb)))
print(np.round(np.diag(Operator(ca).data), 3))
print(np.round(np.diag(Operator(cb).data), 3))
```

```text
same gate (up to global phase): True
exactly equal:                  False
controlled versions equivalent: False
[1.+0.j 1.+0.j 1.+0.j 0.+1.j]
[1.   +0.j    0.707-0.707j 1.   +0.j    0.707+0.707j]
```

`equiv` checks equality up to a global phase; `==` checks exact equality. Alone, the two gates are equivalent. Controlled, they are not. The last two lines show the diagonals of the two 4×4 matrices (both are diagonal; Lesson 12 explains the ordering of the four entries). Controlled-P puts a phase i on just one entry. Controlled-RZ puts e^(∓iπ/4) on two entries: the leftover global phase, now attached to the control.

The general lesson: **a phase that doesn't matter for a gate on its own can matter when that gate is part of something bigger.** This effect has a name, **phase kickback**: when a controlled gate acts on a target that's in one of its eigenstates (Lesson 4), the eigenvalue's phase "kicks back" onto the control qubit. It's the central trick of Deutsch–Jozsa (Lesson 22), phase estimation (Lesson 27) and Shor's algorithm (Lesson 28).

## Phase noise: how interference dies

Relative phases are physical, which means they're also **fragile**. If the environment gives the qubit small random phase kicks, for example because the magnetic field around it fluctuates, or the qubit's frequency f wanders slightly, then every run of the experiment has a slightly different φ.

What does the interferometer see then? Not cos²(φ/2) for one φ, but the **average** over all the random kicks. Let's simulate kicks of different typical sizes:

```python
import numpy as np
rng = np.random.default_rng(2)

# Each run gets a random phase kick of typical size sigma (in degrees).
# The interferometer H - (phase) - H should give P(0) = 1 with no kick.
for sigma in [0, 20, 45, 90, 180]:
    kicks = np.radians(rng.normal(0, sigma, 100_000))
    p0 = np.mean(np.cos(kicks / 2) ** 2)          # average of cos^2(phi/2) over the kicks
    print(f"phase noise {sigma:3d} deg -> P(0) = {p0:.3f}")
```

```text
phase noise   0 deg -> P(0) = 1.000
phase noise  20 deg -> P(0) = 0.970
phase noise  45 deg -> P(0) = 0.868
phase noise  90 deg -> P(0) = 0.646
phase noise 180 deg -> P(0) = 0.504
```

With no noise, the interference is perfect: P(0) = 1. As the noise grows, the result slides towards **0.5**, the answer you'd get from a coin toss. Large random phases have turned the superposition into something indistinguishable from "either |0⟩ or |1⟩, we don't know which": the mixed state from Lesson 7. On the Bloch sphere, the vector has shrunk from the equator towards the z-axis.

This process is called **dephasing**, and the time it takes is called **T₂**. It's one of the two main ways qubits lose their quantum behaviour (the other, energy loss, is called T₁). Lesson 32 measures both. For now, the key point: **every quantum algorithm is a race to finish its interference before dephasing erases the phases.**

## Try it

1. Is (|0⟩ − |1⟩)/√2 the same physical state as (−|0⟩ + |1⟩)/√2? What about (|0⟩ + |1⟩)/√2?
2. Using P(0) = cos²(φ/2), what relative phase gives P(0) = 0.25 in the interferometer?
3. What is P(0) after H, S, H? After H, T, H? (Use S = P(90°), T = P(45°).)
4. A qubit's frequency is 5 GHz. How long does it take for the relative phase to go round once? How many full turns in 1 microsecond?
5. Why doesn't the global phase in RZ(θ) = e^(−iθ/2)P(θ) matter in a single-qubit circuit, but does matter in controlled-RZ?
6. In the dephasing table, what would P(0) approach if the phase noise were completely random (any angle equally likely)?

**Answers:**

1. Yes: (−|0⟩ + |1⟩)/√2 = −(|0⟩ − |1⟩)/√2, a global phase of 180°. No: (|0⟩ + |1⟩)/√2 is |+⟩, which differs by a **relative** phase.
2. cos²(φ/2) = 0.25 → cos(φ/2) = 0.5 → φ/2 = 60° → **φ = 120°**.
3. H, S, H: cos²45° = **0.5**. H, T, H: cos²22.5° ≈ **0.854**.
4. One turn takes 1/f = **0.2 nanoseconds**. In 1 μs: 10⁻⁶ × 5 × 10⁹ = **5,000 turns**.
5. Alone, the factor e^(−iθ/2) multiplies the whole state. Controlled, it multiplies only the part where the control is 1, so it's a relative phase between the control's |0⟩ and |1⟩.
6. **0.5**: the average of cos²(φ/2) over all angles is ½. The interference is completely gone.

## Cheat sheet

| Idea | Formula or fact |
|---|---|
| Global phase | e^(iγ)\|ψ⟩: same physical state; undetectable in every basis |
| Relative phase | \|0⟩ + e^(iφ)\|1⟩: a different state for each φ |
| On the Bloch sphere | Relative phase φ = longitude |
| Z-basis measurement | Blind to relative phase |
| Interferometer | H – P(φ) – H gives P(0) = cos²(φ/2) |
| Used in | Atomic clocks, sensors (Lesson 44), phase estimation (Lesson 27) |
| Phase from energy | \|E⟩ → e^(−iEt/ħ)\|E⟩; relative phase grows at f = ΔE/h |
| Precession | The Bloch vector circles the z-axis at frequency f |
| Superconducting qubits | f ≈ 4–6 GHz; Z rotations done "virtually" in software |
| Equivalent gates | U and e^(iγ)U are the same gate on their own |
| The trap | Controlled-U and controlled-(e^(iγ)U) are different |
| Phase kickback (preview) | An eigenvalue phase on the target moves onto the control |
| Dephasing | Random phase kicks average interference away: P → 0.5 |
| T₂ | The time it takes to lose phase coherence |
