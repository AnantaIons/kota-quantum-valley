---
layout: ../../layouts/Post.astro
title: "Complex numbers for quantum"
description: "Why quantum computing needs i, how to add, multiply and conjugate complex numbers, the complex plane, Euler's formula e^(iθ), why phases don't change probabilities but do change interference, and the roots of unity behind the quantum Fourier transform."
date: 2026-11-04
category: lesson
lesson: 2

---

Lesson 1 ended with a promise: qubits are described by numbers that can **cancel each other**. Ordinary probabilities can't do that. Negative numbers can, a little: +½ and −½ add to zero. But quantum mechanics needs more freedom than "positive or negative". It needs numbers that can point in **any direction**. Those are complex numbers, and this lesson teaches you everything about them that quantum computing uses.

If you studied complex numbers in Class 11 or 12, much of the first half is revision. Read it anyway: the focus here is on the picture (angles and rotations), because that picture is what you'll use for the rest of the course.

## Why we need i

Start with the equation x² = −1. No ordinary (real) number solves it: any real number squared is zero or positive. So mathematicians invented a new number, **i**, defined by

> **i² = −1**

That's the only rule. Everything else follows from ordinary algebra.

A **complex number** is a real part plus an imaginary part:

> z = a + b·i, where a and b are ordinary real numbers.

For example 3 + 4i, or −2 + 0.5i, or just i (which is 0 + 1i), or just 7 (which is 7 + 0i). Real numbers are complex numbers whose imaginary part happens to be 0.

## Arithmetic, step by step

**Adding:** add the real parts, and add the imaginary parts.

```text
(3 + 4i) + (1 − 2i) = (3 + 1) + (4 − 2)i = 4 + 2i
```

**Multiplying:** expand the brackets as usual, then replace i² by −1.

```text
(3 + 4i)(1 − 2i) = 3·1 + 3·(−2i) + 4i·1 + 4i·(−2i)
                 = 3 − 6i + 4i − 8i²
                 = 3 − 2i − 8(−1)
                 = 11 − 2i
```

**The conjugate** flips the sign of the imaginary part. We write it with a star:

> if z = a + bi, then z* = a − bi.

So (3 + 4i)* = 3 − 4i. The conjugate is everywhere in quantum computing, as you'll see in Lesson 3.

**The size (modulus):** how far the number is from zero.

> |z| = √(a² + b²)

For 3 + 4i: √(9 + 16) = √25 = 5.

Here's a fact you'll use constantly. Multiply a number by its own conjugate:

```text
z · z* = (a + bi)(a − bi) = a² − abi + abi − b²i² = a² + b²
```

The i's cancel completely and you get a real, non-negative number:

> **z · z* = |z|²**

This is how a quantum computer turns a complex amplitude into a probability, which must be a real number between 0 and 1. Squaring the size of the amplitude is the rule (Lesson 8 calls it the Born rule).

## The complex plane: numbers as arrows

Draw a complex number a + bi as a point on a flat plane: a steps along the horizontal (real) axis, b steps up the vertical (imaginary) axis. Then draw an arrow from the origin to that point.

Now every complex number has two natural descriptions:

| Description | For 1 + i | Called |
|---|---|---|
| Steps across and up: (a, b) | (1, 1) | Cartesian form |
| Length and angle: (r, θ) | (√2, 45°) | Polar form |

The length r is the modulus |z|. The angle θ is measured anticlockwise from the positive real axis, and is called the **argument** or, in quantum computing, the **phase**.

To convert between them, use ordinary trigonometry:

```text
a = r·cos θ        b = r·sin θ
r = √(a² + b²)     θ = the angle whose tan is b/a (check which quadrant)
```

Some numbers worth knowing by heart:

| Number | Length | Angle |
|---|---|---|
| 1 | 1 | 0° |
| i | 1 | 90° |
| −1 | 1 | 180° |
| −i | 1 | 270° (or −90°) |
| (1 + i)/√2 | 1 | 45° |

## Euler's formula: the most useful equation in the course

There is a compact way to write "length 1, angle θ":

> **e^(iθ) = cos θ + i·sin θ**

This is **Euler's formula**. You don't need to prove it to use it, but here's why it's believable. The right-hand side is the point on a circle of radius 1 at angle θ. As θ grows, that point moves around the circle at a steady speed. And e^(iθ) has exactly the property a "steady rotation" should have: multiplying two of them adds their angles, just as e^x · e^y = e^(x+y).

With Euler's formula, any complex number can be written as

> **z = r·e^(iθ)**  (length r, angle θ)

Plug in some angles:

```text
e^(i·0)    = cos 0   + i sin 0   = 1
e^(iπ/2)   = cos 90° + i sin 90° = i
e^(iπ)     = cos 180°+ i sin 180°= −1
e^(i2π)    = cos 360°+ i sin 360°= 1   (all the way round)
```

The third line, e^(iπ) = −1, is famous. In quantum computing it says something very practical: **a minus sign is a phase of 180°.**

### Why the polar form makes multiplication easy

Multiply two numbers in polar form:

> r₁e^(iθ₁) × r₂e^(iθ₂) = (r₁r₂)·e^(i(θ₁+θ₂))

**Multiply the lengths. Add the angles.** That's the whole rule, and it's the single most useful picture of complex numbers. In particular:

- Multiplying by **i** (length 1, angle 90°) **rotates by 90°**. Check: i × 1 = i, i × i = −1, i × (−1) = −i. Each step turns a quarter circle.
- Multiplying by **e^(iθ)** rotates by θ **without changing the length.**

That second point is the key to the rest of this lesson.

### Code: complex numbers in Python

Python has complex numbers built in. It writes i as `j` (the engineering convention), and the `cmath` module handles polar form.

```python
z = 3 + 4j
w = 1 - 2j
print(z + w, z * w, z.conjugate(), abs(z))
print(z * z.conjugate())

import cmath, math
r, theta = cmath.polar(1 + 1j)
print(round(r, 4), round(math.degrees(theta), 1))
print(cmath.exp(1j * math.pi))
print(cmath.rect(2, math.pi / 3))
```

```text
(4+2j) (11-2j) (3-4j) 5.0
(25+0j)
1.4142 45.0
(-1+1.2246467991473532e-16j)
(1.0000000000000002+1.7320508075688772j)
```

Three things to notice:

- z × z* = 25 = |z|², exactly as derived above.
- e^(iπ) printed as −1 plus a tiny 10⁻¹⁶ imaginary part. That's rounding error in the computer's floating-point arithmetic, not maths. You'll see such tiny numbers often; treat them as zero.
- `cmath.rect(2, π/3)` builds the number with length 2 and angle 60°: 2(cos 60° + i sin 60°) = 1 + 1.732i.

## Phase: invisible alone, decisive together

In quantum computing, the amplitudes of a qubit are complex numbers, and **probabilities are their squared lengths.** Now think about multiplying an amplitude α by a phase e^(iθ):

> |e^(iθ)·α|² = |e^(iθ)|² · |α|² = 1 · |α|² = |α|²

The probability **doesn't change.** A phase, on its own, is invisible to measurement.

So why do phases matter so much? Because quantum mechanics **adds amplitudes before squaring.** When two amplitudes contribute to the same result, the phase difference between them decides whether they reinforce or cancel.

Take two amplitudes of equal size, say 1 and e^(iθ), and add them. The probability is proportional to:

> |1 + e^(iθ)|² = (1 + cos θ)² + sin²θ = 2 + 2·cos θ

| Phase difference θ | 2 + 2cos θ | What happens |
|---|---|---|
| 0° | 4 | Full **constructive** interference: the two add perfectly |
| 60° | 3 | Mostly constructive |
| 90° | 2 | Same as if they didn't interfere at all (1 + 1) |
| 120° | 1 | Mostly destructive |
| 180° | 0 | Full **destructive** interference: they cancel completely |

Picture it with arrows. Adding complex numbers is adding arrows head-to-tail. Two arrows pointing the same way make an arrow twice as long. Two arrows pointing opposite ways make nothing.

```python
import numpy as np
for deg in (0, 60, 90, 120, 180):
    t = np.radians(deg)
    total = 1 + np.exp(1j * t)
    print(deg, round(abs(total) ** 2, 3))
```

```text
0 4.0
60 3.0
90 2.0
120 1.0
180 0.0
```

**This table is the engine of every quantum algorithm.** A quantum algorithm is, at heart, a way of arranging phases so that the paths leading to wrong answers arrive at 180° to each other and cancel, while the paths to the right answer arrive in step and add up. You'll see it happen in Deutsch–Jozsa (Lesson 22), Grover (Lesson 24) and Shor (Lesson 28).

### Global phase versus relative phase

One more distinction, which Lesson 10 develops fully:

- Multiplying **every** amplitude of a state by the same phase (a **global phase**) changes nothing at all you could ever measure. All the arrows rotate together; their differences stay the same.
- Changing the phase of **one** amplitude relative to another (a **relative phase**) changes how they interfere later. That's physically real.

For example, (|0⟩ + |1⟩)/√2 and (|0⟩ − |1⟩)/√2 give the same 50/50 probabilities if measured directly, but they are different states: the minus sign is a relative phase of 180°, and one more gate will turn them into completely different results (Lesson 9).

## Roots of unity: a preview of the quantum Fourier transform

Divide a full circle into N equal steps. The step is the complex number

> ω = e^(2πi/N)  (length 1, angle 360°/N)

Its powers ω⁰, ω¹, ω², …, ω^(N−1) are N points spaced evenly around the circle. They're called the **N-th roots of unity**, because each one raised to the power N gives 1 (going N steps of 360°/N brings you all the way round).

Here's a beautiful fact: **they add up to zero.**

> 1 + ω + ω² + … + ω^(N−1) = 0  (for N ≥ 2)

Why? The arrows are spread perfectly evenly around the circle, so they balance like spokes on a wheel. Every arrow is cancelled by the others.

```python
import numpy as np
N = 8
w = np.exp(2j * np.pi / N)
roots = [w**k for k in range(N)]
print(np.round(sum(roots), 12))
print(np.round(w**8, 12))
```

```text
(-0+0j)
(1-0j)
```

(The "−0" is just floating-point rounding of a number that is zero.)

This cancellation is perfect destructive interference among N amplitudes, and it's exactly how the **quantum Fourier transform** (Lesson 26) finds hidden patterns: sums of roots of unity are zero, except when the pattern lines up, and then they all point the same way and add to N.

## Try it

1. Compute (2 + i) + (3 − 4i) and (2 + i)(3 − 4i).
2. Find the conjugate and modulus of −5 + 12i.
3. Write −2i in polar form (length and angle).
4. What is i³? i⁴? i¹⁰¹? (Hint: each power of i rotates by 90°.)
5. What is |e^(i·0.7)|? Why is the answer the same for any angle?
6. Two equal amplitudes have a phase difference of 90°. By what factor is the combined probability bigger than one alone? (Use 2 + 2cos θ, compared with one amplitude alone, which gives |1|² = 1.)
7. What do the four 4th roots of unity add up to? List them.

**Answers:**

1. 5 − 3i, and 6 − 8i + 3i − 4i² = 10 − 5i.
2. −5 − 12i; √(25 + 144) = 13.
3. Length 2, angle 270° (or −90°): 2e^(−iπ/2).
4. i³ = −i, i⁴ = 1, i¹⁰¹ = i (101 = 4×25 + 1).
5. 1. Because |cos θ + i sin θ|² = cos²θ + sin²θ = 1 for every θ.
6. 2 + 2cos 90° = 2: twice one alone. At 90° the amplitudes neither help nor hurt each other.
7. 1, i, −1, −i. They add to 0.

## Cheat sheet

| Idea | Formula or fact |
|---|---|
| The definition | i² = −1 |
| Complex number | z = a + bi |
| Conjugate | z* = a − bi |
| Modulus | \|z\| = √(a² + b²) |
| Number times its conjugate | z·z* = \|z\|², always real and ≥ 0 |
| Polar form | z = r·e^(iθ) |
| Euler's formula | e^(iθ) = cos θ + i sin θ |
| Famous special case | e^(iπ) = −1: a minus sign is a 180° phase |
| Multiplying | Multiply lengths, add angles |
| Phase factor | \|e^(iθ)\| = 1: rotates without changing length |
| Interference of two equal amplitudes | \|1 + e^(iθ)\|² = 2 + 2cos θ: 4 at 0°, 0 at 180° |
| Global phase | Same phase on every amplitude: unobservable |
| Relative phase | Phase between amplitudes: changes interference |
| Roots of unity | ω = e^(2πi/N); 1 + ω + … + ω^(N−1) = 0 |
| In Python | `3 + 4j`, `abs(z)`, `z.conjugate()`, `cmath.exp`, `cmath.polar` |
