---
layout: ../../layouts/Post.astro
title: "Measurement and the Born rule"
description: "The exact rules of quantum measurement: the Born rule, collapse, projectors, measuring in any basis by rotating first, expectation values, rebuilding an unknown state from many measurements (tomography), and the quantum Zeno effect, all with tested code."
date: 2026-11-04
category: lesson
lesson: 8

---

Measurement is where the quantum world meets ours. Everything a quantum computer does happens to amplitudes you can't see; the only thing you ever get out is the result of a measurement. So it's worth knowing the rules of measurement **exactly**, not as a vague idea of "collapse".

This lesson gives you the complete rulebook for measuring a single qubit, shows how to measure along any direction on the Bloch sphere, explains how to rebuild an unknown state from measurements, and ends with a strange consequence: watching a qubit closely enough can stop it from changing.

## The Born rule

You've already used it. Now here it is precisely, as Max Born stated it in 1926.

Pick an orthonormal basis to measure in, say {|b₀⟩, |b₁⟩}. Measuring a qubit in state |ψ⟩:

> **1. You get outcome k with probability P(k) = |⟨bₖ|ψ⟩|².**
> **2. Immediately afterwards, the qubit is in the state |bₖ⟩.**

That's all. Rule 1 is called the **Born rule**. Rule 2 is often called **collapse**: whatever superposition the qubit was in, it's now in the basis state you found.

For the ordinary computational-basis measurement, the basis is {|0⟩, |1⟩}, and with |ψ⟩ = α|0⟩ + β|1⟩:

```text
P(0) = |⟨0|ψ⟩|² = |α|²        afterwards: |0⟩
P(1) = |⟨1|ψ⟩|² = |β|²        afterwards: |1⟩
```

**Why must the probabilities add to 1?** Because the basis is orthonormal and the state is normalised: |⟨b₀|ψ⟩|² + |⟨b₁|ψ⟩|² = ⟨ψ|ψ⟩ = 1. This is one reason states must have length 1 (Lesson 3).

### The same rule with projectors

Lesson 3 introduced the projector |bₖ⟩⟨bₖ|, which keeps only the |bₖ⟩ part of a state. Call it Πₖ. Then the Born rule can be written as

> P(k) = ⟨ψ|Πₖ|ψ⟩

because ⟨ψ|bₖ⟩⟨bₖ|ψ⟩ = (⟨bₖ|ψ⟩)*·⟨bₖ|ψ⟩ = |⟨bₖ|ψ⟩|². And the state after the measurement is Πₖ|ψ⟩ divided by its length. This "projector" form generalises neatly to many qubits and to measuring only some of them, which you'll need for teleportation (Lesson 21) and error correction (Part F).

### What collapse means in practice

Collapse has a simple, testable consequence: **measure the same thing twice in a row and you get the same answer twice.** If the first measurement gave 1, the qubit is now |1⟩, and measuring it again gives 1 with certainty.

It also means **a single measurement destroys information.** Before measuring, the state contained two complex numbers α and β. Afterwards you have one bit, and the qubit has forgotten α and β. You cannot measure "softly" to peek at the amplitudes without disturbing them; that impossibility is what makes quantum key distribution secure (Lesson 41).

## Measuring along any direction

Real quantum computers can only measure in the computational basis, |0⟩ or |1⟩: the z-axis of the Bloch sphere. How do you ask a different question, like "+ or −?"

**Rotate first, then measure z.** If a gate U turns the basis you care about into {|0⟩, |1⟩}, then applying U and measuring z is the same as measuring in your basis.

| To measure along | Basis | Apply before measuring | Why |
|---|---|---|---|
| z | \|0⟩, \|1⟩ | nothing | Already the default |
| x | \|+⟩, \|−⟩ | H | H\|+⟩ = \|0⟩, H\|−⟩ = \|1⟩ |
| y | \|+i⟩, \|−i⟩ | S†, then H | S† turns \|+i⟩ into \|+⟩, then H gives \|0⟩ |

The result "0" now means "+" (or "+i"), and "1" means "−" (or "−i").

Let's check the y recipe on |+i⟩ = (|0⟩ + i|1⟩)/√2. S† = [[1, 0], [0, −i]] multiplies the |1⟩ amplitude by −i: i × (−i) = 1, giving (|0⟩ + |1⟩)/√2 = |+⟩. Then H|+⟩ = |0⟩. ✓

## Expectation values

Lesson 5 defined the expectation value as the long-run average. For an observable A (a Hermitian matrix, Lesson 4), quantum mechanics gives a compact formula:

> **⟨A⟩ = ⟨ψ|A|ψ⟩**

For Z, with outcomes +1 (for 0) and −1 (for 1):

```text
⟨Z⟩ = ⟨ψ|Z|ψ⟩ = |α|² − |β|² = P(0) − P(1)
```

and similarly ⟨X⟩ = P(+) − P(−), ⟨Y⟩ = P(+i) − P(−i). These three numbers are exactly the Bloch vector (x, y, z) from Lesson 7. So: **the Bloch vector of a state is the list of its three expectation values.**

Expectation values are what many algorithms actually output. A variational algorithm (Lesson 30) doesn't want a single bitstring; it wants ⟨H⟩, the average energy, estimated from many shots.

## Rebuilding an unknown state: tomography

Suppose someone hands you a machine that produces the same unknown qubit state every time you press a button. How could you find out what it is?

One copy is hopeless: one measurement gives one bit. But with **many copies**, you can estimate all three expectation values: measure many copies along x, many along y and many along z. That gives the Bloch vector, which pins down the state completely. This is called **quantum state tomography** (from the Greek for "slice": like a CT scan, you look from several directions).

Here the "unknown" state is one we prepared ourselves, 60° from the North Pole, facing +y, so we can check the answer: the true Bloch vector is (0, 0.866, 0.5).

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler

def prepare():
    """The mystery state: 60 degrees from the north pole, facing +y."""
    qc = QuantumCircuit(1)
    qc.ry(np.pi / 3, 0)
    qc.rz(np.pi / 2, 0)
    return qc

circuits = {}
for basis in "XYZ":
    qc = prepare()
    if basis == "X":
        qc.h(0)                 # turns the X question into a Z question
    if basis == "Y":
        qc.sdg(0)               # S-dagger then H turns the Y question into Z
        qc.h(0)
    qc.measure_all()
    circuits[basis] = qc

sampler = StatevectorSampler(seed=5)
results = sampler.run(list(circuits.values()), shots=4000).result()
for basis, res in zip(circuits, results):
    c = res.data.meas.get_counts()
    expectation = (c.get("0", 0) - c.get("1", 0)) / 4000      # P(0) - P(1)
    print(basis, c, "->", round(expectation, 3))
```

```text
X {'1': 1967, '0': 2033} -> 0.017
Y {'0': 3726, '1': 274} -> 0.863
Z {'1': 981, '0': 3019} -> 0.509
```

From 12,000 shots we estimated (0.017, 0.863, 0.509), very close to the true (0, 0.866, 0.5). The small errors are the shot noise from Lesson 5: with 4,000 shots the uncertainty in each value is about √(1/4000) ≈ 0.016. (The `ry` and `rz` gates that prepared the state are rotations, which Lesson 11 explains.)

Tomography is how labs check that their qubits and gates do what they should. Its cost is also a lesson: for n qubits the number of settings grows as 3ⁿ, so full tomography of even 20 qubits is impractical. That's why quantum computers are useful only when the answer you need is a few numbers or a likely bitstring, not the whole state.

## The quantum Zeno effect

Here's a strange consequence of collapse. Suppose a qubit is slowly being rotated from |0⟩ towards |1⟩, say by a weak, steady pulse that would complete the flip in one second. Left alone, after one second it's |1⟩.

Now measure it **N times** during that second. Each small step rotates it by only 180°/N on the Bloch sphere. Right after a step, the chance of still finding |0⟩ is cos²(90°/N), which is very close to 1 when N is large. If you find |0⟩, the state collapses back to exactly |0⟩, and the rotation has to start again from scratch.

The chance of finding |0⟩ at every one of the N checks is

> P(still |0⟩) = [cos²(90°/N)]ᴺ

```python
import numpy as np
# Turn |0> into |1> with N small rotations, measuring after each one.
# The chance of surviving every measurement in |0> is cos^2(pi/2N) to the power N.
for N in [1, 2, 5, 10, 100, 1000]:
    survive = np.cos(np.pi / (2 * N)) ** (2 * N)
    print(f"{N:5d} steps: still |0> with probability {survive:.3f}")
```

```text
    1 steps: still |0> with probability 0.000
    2 steps: still |0> with probability 0.250
    5 steps: still |0> with probability 0.605
   10 steps: still |0> with probability 0.781
  100 steps: still |0> with probability 0.976
 1000 steps: still |0> with probability 0.998
```

With no checks in between, the qubit certainly flips. With 1,000 checks, it almost certainly **doesn't**. Frequent measurement freezes the evolution. This is the **quantum Zeno effect**, named after the Greek philosopher who argued that a watched arrow can never move. It has been seen in trapped ions and atoms, and related ideas are used to protect qubits from unwanted change.

## What measurement can and can't do

| Measurement can | Measurement can't |
|---|---|
| Give one outcome per run, with probability \|⟨bₖ\|ψ⟩\|² | Reveal α and β from a single copy |
| Ask any question (basis), by rotating first | Ask two incompatible questions (like x and z) of the same copy |
| Estimate expectation values from many shots | Avoid shot noise: uncertainty falls only as 1/√N |
| Rebuild a state from many copies (tomography) | Be undone: collapse is not a unitary |

The last row is worth a moment. Everything in Lesson 4 was unitary and reversible. Measurement isn't: it maps both α|0⟩ + β|1⟩ and |0⟩ itself to |0⟩, which loses information. That's why quantum algorithms keep everything unitary for as long as possible, letting amplitudes interfere, and **measure only at the very end**.

## Try it

1. |ψ⟩ = (√3|0⟩ + i|1⟩)/2. Find P(0) and P(1). If you get 1, what's the state afterwards?
2. For the same state, find P(+). (Compute ⟨+|ψ⟩ first.)
3. Which gates would you apply before measuring to ask "+i or −i?". What does outcome "1" mean?
4. Compute ⟨Z⟩ and ⟨X⟩ for |ψ⟩ = cos(30°)|0⟩ + sin(30°)|1⟩.
5. In the tomography code, roughly how many shots per basis would you need to get each value within ±0.005?
6. In the Zeno table, what is the survival probability for N = 3? Check it with the formula.

**Answers:**

1. P(0) = 3/4, P(1) = |i/2|² = 1/4. After getting 1, the state is |1⟩.
2. ⟨+|ψ⟩ = (1/√2)(√3/2 + i/2), so P(+) = ½ × |√3/2 + i/2|² = ½ × (3/4 + 1/4) = **½**.
3. S† then H. Outcome "1" means **−i**.
4. ⟨Z⟩ = cos²30° − sin²30° = cos 60° = **0.5**. ⟨X⟩ = 2·cos30°·sin30° = sin 60° ≈ **0.866**.
5. √(1/N) ≈ 0.005 gives N ≈ **40,000** per basis.
6. [cos²(30°)]³ = 0.75³ ≈ **0.42**.

## Cheat sheet

| Idea | Formula or fact |
|---|---|
| Born rule | P(k) = \|⟨bₖ\|ψ⟩\|² |
| Collapse | After outcome k, the state is \|bₖ⟩ |
| Projector form | P(k) = ⟨ψ\|Πₖ\|ψ⟩, with Πₖ = \|bₖ⟩⟨bₖ\| |
| Repeat a measurement | Same answer again |
| Hardware measures | z only (\|0⟩ or \|1⟩) |
| Measure x | Apply H, then measure |
| Measure y | Apply S†, then H, then measure |
| Expectation value | ⟨A⟩ = ⟨ψ\|A\|ψ⟩ |
| ⟨Z⟩ | P(0) − P(1) |
| Bloch vector | (⟨X⟩, ⟨Y⟩, ⟨Z⟩) |
| Tomography | Many copies, measured in x, y and z, rebuild the state |
| Cost of tomography | Grows like 3ⁿ settings for n qubits |
| Zeno effect | Frequent measurement freezes evolution: [cos²(90°/N)]ᴺ → 1 |
| Measurement is | Irreversible and not unitary; done at the end of algorithms |
