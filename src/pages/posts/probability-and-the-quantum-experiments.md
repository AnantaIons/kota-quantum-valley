---
layout: ../../layouts/Post.astro
title: "Probability and the experiments that broke physics"
description: "The probability you need for quantum computing (expected values, spread, how many shots), then the four experiments that forced physicists to invent quantum mechanics: photons, the double slit, three polarisers and Stern–Gerlach, each simulated in Python."
date: 2026-11-04
category: lesson
lesson: 5

---

Quantum computers give **random answers**. Run the same circuit twice and you can get different results. So before anything else, you need to be comfortable with probability: what it means, how to calculate with it, and how many times you must repeat an experiment to trust the result.

Then we'll look at **why** nature behaves this way. Four famous experiments, each simple enough to describe in a paragraph, broke classical physics and forced the invention of quantum mechanics. Every one of them is a qubit in disguise, and by the end of the lesson you'll be able to describe each in the vector language of Lessons 3 and 4.

## Part 1: probability for quantum computing

### The basic rules

A **probability** is a number from 0 (never happens) to 1 (always happens). For an experiment with several possible **outcomes**:

| Rule | Formula | Example (fair die) |
|---|---|---|
| Every probability is between 0 and 1 | 0 ≤ P ≤ 1 | P(6) = 1/6 |
| All outcomes together have probability 1 | P(1) + … + P(6) = 1 | 6 × 1/6 = 1 |
| Not happening | P(not A) = 1 − P(A) | P(not 6) = 5/6 |
| A **or** B, if they can't both happen | P(A or B) = P(A) + P(B) | P(5 or 6) = 2/6 |
| A **and** B, if independent | P(A and B) = P(A) × P(B) | P(6 then 6) = 1/36 |

For a qubit measured in the 0/1 basis there are just two outcomes, so everything is described by one number p = P(1), with P(0) = 1 − p.

### Expected value

The **expected value** is the long-run average result. Multiply each outcome's value by its probability and add:

> E[X] = Σ (value × probability)

A qubit with P(1) = 0.3, recording 1 for a "1" and 0 for a "0": E = 0×0.7 + 1×0.3 = 0.3. Measure it 1,000 times and you expect about **300 ones**.

Physicists often label the outcomes +1 and −1 instead (the eigenvalues of Z, Lesson 4). Then E[Z] = (+1)×0.7 + (−1)×0.3 = **0.4**. This is called the **expectation value** of Z, written ⟨Z⟩, and you'll see it constantly in variational algorithms (Lesson 30).

### Shots and the spread of results

A real quantum computer can't tell you the probability directly. It only gives you one 0 or 1 per run. To estimate probabilities, you repeat the circuit many times. Each repetition is called a **shot**.

With N shots and a true probability p, the number of 1s you see follows the **binomial distribution**:

> average number of 1s = N·p
> typical spread (standard deviation) = √(N·p·(1 − p))

For a 50/50 qubit and 1,000 shots: average 500, spread √(1000 × 0.5 × 0.5) ≈ **15.8**. So you'll usually see between about 484 and 516 ones, and almost always between 470 and 530 (within two spreads). Let's check by simulating five separate runs:

```python
import numpy as np
rng = np.random.default_rng(7)

# A fair 50/50 qubit measured 1,000 times, in five separate runs
for run in range(5):
    ones = rng.binomial(1000, 0.5)
    print("run", run + 1, "->", 1000 - ones, "zeros,", ones, "ones")
print("expected spread:", round(np.sqrt(1000 * 0.5 * 0.5), 1))
```

```text
run 1 -> 500 zeros, 500 ones
run 2 -> 512 zeros, 488 ones
run 3 -> 514 zeros, 486 ones
run 4 -> 526 zeros, 474 ones
run 5 -> 506 zeros, 494 ones
expected spread: 15.8
```

(The `default_rng(7)` line fixes the random seed so you get exactly these numbers. Remove the 7 and you'll get different ones every time.)

Every run is a little different, and none is exactly 500/500 except by luck. **This is normal.** When you run real circuits, you'll see this same scatter, and you'll need to tell the difference between scatter and a genuine effect.

### How many shots do you need?

Your estimate of p is (number of 1s) / N. Its uncertainty is the spread divided by N:

> uncertainty in p ≈ √(p(1 − p) / N)

| Shots N | Uncertainty for p = 0.5 |
|---|---|
| 100 | ±5% |
| 1,000 | ±1.6% |
| 10,000 | ±0.5% |
| 1,000,000 | ±0.05% |

Notice the square root: **to halve the uncertainty, you need four times as many shots.** This square-root law will come back again and again, from error mitigation (Lesson 36) to quantum sensing (Lesson 44), where beating it is the whole point.

### Two kinds of randomness

When you toss a coin, the result is random only because you don't know the exact force, air currents and so on. With perfect information, you could predict it. That's randomness from **ignorance**.

Quantum randomness appears to be different: as far as every experiment can tell, **nothing** decides the result in advance. A qubit in the state (|0⟩ + |1⟩)/√2 doesn't secretly "know" it will give 0. Lesson 15 explains the experiment (Bell tests, Nobel Prize 2022) that rules out the most natural kind of hidden information.

## Part 2: the experiments that broke physics

Around 1900, physics seemed almost finished. Then a series of experiments gave results that no classical theory could explain. Here are four that matter most for quantum computing.

### Experiment 1: light comes in lumps

Shine light on a metal and electrons fly off. This is the **photoelectric effect**. Classical physics predicted that brighter light should give the electrons more energy. Experiments said otherwise: brightness changed **how many** electrons came out, but their energy depended only on the light's **colour** (frequency). Below a certain frequency, no electrons came out at all, however bright the light.

In 1905 Einstein explained it: light arrives in individual lumps, later called **photons**, each with energy

> E = h·f

where f is the frequency and h is Planck's constant (6.63 × 10⁻³⁴ J·s). One photon knocks out one electron. More brightness means more photons, not stronger ones. (This won Einstein his Nobel Prize in 1921, not relativity.)

Why it matters for us: light can be sent **one photon at a time**, and a single photon can carry a qubit. Quantum communication (Lessons 41 and 42) is built on this.

### Experiment 2: the double slit, one particle at a time

Send light through two narrow, close slits onto a screen, and you see a pattern of bright and dark **stripes** (fringes). With waves, that's easy to explain: waves from the two slits add where their crests meet and cancel where a crest meets a trough.

Now make it strange. Turn the source down until **one particle** goes through at a time: one photon, or one electron. (This was done with electrons by Akira Tonomura's team at Hitachi in 1989, and it has since been done with whole molecules of 60 carbon atoms.) Each particle lands as **a single dot** on the screen, like a particle should. But after thousands of dots, the **stripes appear**. Some places on the screen are hit often, others almost never, including places that would be hit if only one slit were open.

Let's say it in numbers. Let P₁ be the probability of landing at a point with only slit 1 open, and P₂ with only slit 2. Classical common sense says that with both open, P = P₁ + P₂. **That's wrong.** At the dark fringes, P = 0 even though P₁ and P₂ are both positive.

What works instead is the rule from Lessons 2 and 3: each route has a complex **amplitude**, ψ₁ and ψ₂, and

> **P = |ψ₁ + ψ₂|²**   (add amplitudes first, then square)

The phase difference between ψ₁ and ψ₂ depends on the difference in path length from each slit to the point on the screen. Where the phases match, the amplitudes add (bright). Where they're 180° apart, they cancel (dark). It's exactly the 2 + 2cos θ table from Lesson 2.

And here's the strangest part. Put a detector at the slits to find out **which slit** each particle went through. The stripes **vanish**, and the pattern becomes P₁ + P₂. Once the paths can be told apart, their amplitudes no longer add. Gaining "which-path" information destroys interference.

```python
import numpy as np
x = np.linspace(-1, 1, 17)          # 17 positions across the screen
phase = 4 * np.pi * x               # phase difference between the two paths
psi1 = np.ones_like(x) / np.sqrt(2)         # amplitude via slit 1
psi2 = np.exp(1j * phase) / np.sqrt(2)      # amplitude via slit 2

both_open  = np.abs(psi1 + psi2) ** 2                 # add amplitudes, then square
which_path = np.abs(psi1) ** 2 + np.abs(psi2) ** 2    # add probabilities
print(np.round(both_open, 2))
print(np.round(which_path, 2))
```

```text
[2. 1. 0. 1. 2. 1. 0. 1. 2. 1. 0. 1. 2. 1. 0. 1. 2.]
[1. 1. 1. 1. 1. 1. 1. 1. 1. 1. 1. 1. 1. 1. 1. 1. 1.]
```

The first line is the striped pattern: bright (2), half (1), dark (0), repeating. The second, with which-path information, is flat. Same particles, same slits; the only difference is whether the two routes could be distinguished.

**The qubit connection:** "went through slit 1" and "went through slit 2" are two basis states, |0⟩ and |1⟩. A particle passing through both slits is in a superposition. The screen is a measurement in a different basis. That's the whole structure of a quantum computer: put a qubit in superposition, let the amplitudes interfere, then measure.

### Experiment 3: three polarisers

Light has a **polarisation**: the direction its electric field wiggles. A polarising filter (like in sunglasses or a 3D-cinema lens) lets through light polarised along its axis and blocks light polarised at right angles.

For light polarised at angle θ to the filter's axis, the fraction that gets through is

> **cos²θ**  (Malus's law, 1809)

At the single-photon level this becomes a probability: each photon either **passes completely** or is **absorbed completely**, and it passes with probability cos²θ. A photon that passes comes out polarised along the filter's axis, whatever it was before.

Now the puzzle. Start with photons polarised at 0°.

- Send them into a filter at **90°**: cos²90° = 0. **Nothing** gets through.
- Now put a third filter at **45°** between them, so the order is 0° → 45° → 90°. Surely adding a filter can only block more light?

But light **comes through**. Each photon passes the 45° filter with probability cos²45° = ½, and comes out polarised at 45°. It then meets the 90° filter at a 45° angle, and passes with probability ½ again. Overall: **¼ of the photons get through.** Adding a filter let light through where none got through before.

```python
import numpy as np
rng = np.random.default_rng(1)
def malus(angle_deg):                       # chance a photon passes a polariser
    return np.cos(np.radians(angle_deg)) ** 2

photons = 100_000                           # all start polarised at 0 degrees
direct = rng.random(photons) < malus(90)                    # 0 -> 90
via45  = (rng.random(photons) < malus(45)) & (rng.random(photons) < malus(45))  # 0 -> 45 -> 90
print("straight to 90:", direct.sum())
print("via 45 then 90:", via45.sum())
```

```text
straight to 90: 0
via 45 then 90: 25065
```

About a quarter, as predicted. The middle filter is a **measurement** that changes the state: it erases the photon's memory of being at 0°.

**The qubit connection:** horizontal polarisation is |0⟩ and vertical is |1⟩. Polarisation at 45° is |+⟩ = (|0⟩ + |1⟩)/√2, and 135° is |−⟩. The probability cos²45° = ½ is exactly |⟨+|0⟩|² = (1/√2)² from Lesson 3. Each filter is a measurement in a basis. (A polarisation angle θ in the lab corresponds to an angle of 2θ on the Bloch sphere of Lesson 7. That's why polarisations 90° apart in the lab are opposite, perfectly distinguishable states.)

### Experiment 4: Stern–Gerlach, the first qubit found in nature

In 1922, Otto Stern and Walther Gerlach fired a beam of silver atoms through a magnet whose field was stronger at one side than the other. Each silver atom behaves like a tiny bar magnet (because of a property of its outermost electron, later called **spin**), so the uneven field pushes it up or down depending on which way its tiny magnet points.

Classically, the atoms' magnets point in random directions, so you'd expect a **smear** on the screen: every amount of deflection from fully up to fully down. Instead they saw **two separate spots**: up and down, nothing in between. Spin, measured along any direction, gives **only two answers**. It's a natural two-level system: a qubit.

Now chain magnets together:

1. **Magnet 1 along z:** keep only the atoms that went "up". Pass them through **another z magnet**: 100% go up again. So far, so classical: the atoms remember.
2. **Magnet 2 along x** (turned sideways): the "up-z" atoms split **50/50** into "+x" and "−x". Keep only the +x beam.
3. **Magnet 3 along z again:** you might expect all these atoms to go up, since they were all "up-z" earlier. Instead they split **50/50** again.

Measuring along x **erased** the z information. There is no hidden record inside the atom saying "I'm up along z and plus along x". Here is that experiment, simulated with the vectors from Lesson 3:

```python
import numpy as np
rng = np.random.default_rng(3)
up, down = np.array([1, 0]), np.array([0, 1])
plus, minus = (up + down) / np.sqrt(2), (up - down) / np.sqrt(2)

def measure(state, basis):
    """Measure in a basis (pair of states). Return the result and the new state."""
    p0 = abs(np.vdot(basis[0], state)) ** 2
    return (0, basis[0]) if rng.random() < p0 else (1, basis[1])

counts = [0, 0]
for _ in range(10_000):
    s = up                                  # atom from the first magnet's "up" beam
    r, s = measure(s, (plus, minus))        # second magnet: along x
    if r == 0:                              # keep only the "+x" beam
        r, s = measure(s, (up, down))       # third magnet: along z again
        counts[r] += 1
print("third magnet: up", counts[0], "  down", counts[1])
```

```text
third magnet: up 2566   down 2469
```

About 5,000 atoms survived the x filter, and they split evenly at the third magnet. The `measure` function contains the two rules of quantum measurement that Lesson 8 will make precise: the probability is |⟨basis state|ψ⟩|², and afterwards the state **becomes** that basis state.

**The qubit connection:** spin up and down along z are |0⟩ and |1⟩; spin along +x and −x are |+⟩ and |−⟩. Real quantum computers built from trapped ions and neutral atoms (Lesson 39) use exactly these kinds of atomic two-level systems.

## What the four experiments teach

Put them side by side and the rules of quantum mechanics almost write themselves:

| Experiment | What it showed | The rule it led to |
|---|---|---|
| Photoelectric effect | Light comes in single photons | Quantum systems can be handled one at a time |
| Double slit | Amplitudes add, then get squared; which-path info kills interference | States are vectors of complex amplitudes; P = \|amplitude\|² |
| Three polarisers | A measurement changes the state | After measuring, the state becomes the result |
| Stern–Gerlach | Only two outcomes; measuring one direction erases another | Two-level systems (qubits) exist; different bases are different questions |

There's one more rule, about how states change **between** measurements: by unitary matrices (Lesson 4), smoothly and reversibly. With that, you have the full rulebook for one qubit, and Part B is about learning to use it.

## Try it

1. A qubit gives 1 with probability 0.2. In 500 shots, what's the expected number of 1s, and the typical spread?
2. With outcomes labelled +1 (for 0) and −1 (for 1), what is ⟨Z⟩ for that qubit?
3. You want to estimate a probability near 0.5 to within ±1%. Roughly how many shots do you need?
4. In the double-slit simulation, what's the probability at a point where the phase difference is 90°? Compare with the which-path value.
5. Photons polarised at 0° go through filters at 30° and then 60°. What fraction gets through? (Use cos².)
6. In the Stern–Gerlach chain, what fraction of the original "up-z" atoms ends up "down-z" at the third magnet?

**Answers:**

1. 500 × 0.2 = **100**; spread √(500 × 0.2 × 0.8) = √80 ≈ **8.9**.
2. ⟨Z⟩ = (+1)(0.8) + (−1)(0.2) = **0.6**.
3. √(0.25/N) = 0.01 gives N = 0.25/0.0001 = **2,500 shots**.
4. |ψ₁ + ψ₂|² = 2 × ½ × (1 + cos 90°) = **1**, the same as the which-path value: at 90° there's no interference either way.
5. cos²30° × cos²30° = 0.75 × 0.75 = **0.5625**.
6. Half pass the x filter, then half of those go down: **¼**.

## Cheat sheet

| Idea | Formula or fact |
|---|---|
| Probabilities | 0 ≤ P ≤ 1, all outcomes add to 1 |
| Not A | 1 − P(A) |
| Independent A and B | P(A) × P(B) |
| Expected value | Σ value × probability |
| ⟨Z⟩ | P(0) − P(1) |
| Shots | Repeat a circuit N times to estimate probabilities |
| Spread in counts | √(N·p·(1 − p)) |
| Uncertainty in p | √(p(1 − p)/N); 4× shots halves it |
| Photon energy | E = h·f |
| Double slit | P = \|ψ₁ + ψ₂\|², not P₁ + P₂ |
| Which-path info | Destroys interference |
| Malus's law | Fraction passing = cos²θ; per photon it's a probability |
| Three polarisers | 0° → 45° → 90° passes ¼ |
| Stern–Gerlach | Spin gives only two outcomes; a natural qubit |
| Sequential measurement | Measuring x erases z information |
| Measurement rule (preview) | P = \|⟨result\|ψ⟩\|²; state becomes the result |
