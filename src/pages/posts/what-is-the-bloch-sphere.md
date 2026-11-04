---
layout: ../../layouts/Post.astro
title: "What is the Bloch sphere?"
description: "How every single-qubit state becomes a point on a ball, what θ and φ mean, and how gates become rotations."
date: 2026-11-04
category: explainer
---

The Bloch sphere is the single most useful picture in quantum computing. It turns a qubit's state into a point on a ball, and every single-qubit gate into a rotation of that ball.

## The formula

Any single-qubit state can be written as

```
|ψ⟩ = cos(θ/2)|0⟩ + e^(iφ) sin(θ/2)|1⟩
```

with two angles:

- **θ (theta)**, from 0 to 180°, is the latitude: how far down from the north pole.
- **φ (phi)**, from 0 to 360°, is the longitude: which way around.

Those two angles pick a point on a sphere.

## Landmarks

| Point | State | Meaning |
|---|---|---|
| North pole | \|0⟩ | Always measures 0 |
| South pole | \|1⟩ | Always measures 1 |
| Equator, front (+x) | \|+⟩ = (\|0⟩+\|1⟩)/√2 | 50/50 |
| Equator, back (−x) | \|−⟩ = (\|0⟩−\|1⟩)/√2 | 50/50, opposite sign |
| Equator, side (+y) | (\|0⟩+i\|1⟩)/√2 | 50/50, complex phase |

**Height = probability.** P(0) = cos²(θ/2): the higher the point, the more likely 0. Every point on the equator is 50/50, yet they're all different states; they differ in φ, the phase.

## Why θ/2 and not θ?

|0⟩ and |1⟩ are opposite outcomes, so they sit at opposite poles, 180° apart on the sphere. But as quantum states they're "90° apart" (perpendicular vectors). The half-angle converts between the two pictures.

## Gates are rotations

| Gate | Rotation |
|---|---|
| X | 180° about the x-axis (flips north ↔ south) |
| Y | 180° about the y-axis |
| Z | 180° about the z-axis (flips the phase, keeps height) |
| H | 180° about the axis halfway between x and z |
| S | 90° about z |
| T | 45° about z |

That's why Z, S and T do nothing visible to |0⟩: rotating the north pole about the z-axis leaves it where it is. Put the state on the equator first (with H), and they swing it around.

## Limits of the picture

The Bloch sphere shows **one qubit** in a **pure state**. Two or more entangled qubits can't be drawn as separate arrows on separate spheres, which is exactly what makes entanglement special.

## Try it

Open the [Quantum Lab](/lab/), Experiment 1. Drag the sphere to rotate the view, then press H, S, T and watch the arrow move. The panel beside it shows the same state as numbers.
