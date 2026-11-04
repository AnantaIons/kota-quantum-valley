---
layout: ../../layouts/Post.astro
title: "Roadmap: what to learn before quantum computing"
description: "The maths, physics, computer science and electronics you need, the great books to learn each from, and how this 15-lesson course is organised."
date: 2026-10-28
category: lesson
lesson: 0

---

Quantum computing sits on **four pillars**: maths, physics, computer science and electronics. You don't need all of them on day one. You do need the maths first, because every later idea is written in it.

## How this course is organised

| Part | Lessons | You'll be able to |
|---|---|---|
| **Foundations** | 1–2 | Write a qubit as a vector, apply gates as matrices, build a Bell pair |
| **Algorithms** | 3 | Explain why quantum algorithms work (interference) |
| **Technology** | 4–6 | Explain how qubits are built, how QKD protects keys, how quantum sensors work |
| **Coding** | 7–10 | Run real programs: Bell pairs, teleportation, Grover, phase estimation |
| **Advanced** | 11–14 | Shor's algorithm, error correction, VQE/QAOA, chemistry and ML |
| **Your path** | 15 | Use real hardware and plan your next year |

**How much time?** About 2–3 hours per lesson if you do every "Try it" exercise. One lesson a week finishes the course in about four months.

## What you need, and why

### 1. Maths (essential, start here)

| Topic | Why quantum needs it | Used first in |
|---|---|---|
| Complex numbers, e^(iθ) | Amplitudes are complex; phases live in e^(iθ) | Lesson 1 |
| Vectors and the dot product | A qubit state *is* a vector | Lesson 1 |
| Matrices and matrix multiplication | Every gate is a matrix | Lesson 2 |
| Eigenvalues and eigenvectors | Measurement outcomes, phase estimation | Lessons 2, 10 |
| Tensor product | Combining several qubits | Lesson 2 |
| Probability | Measurement gives random results | Lesson 1 |
| Trigonometry | Rotations on the Bloch sphere | Lesson 2 |

If you've done Class 12 maths, you already know about half of this. The rest is about 4–6 weeks of steady study.

### 2. Physics (helpful, grows over time)

- **The double-slit experiment:** the clearest picture of interference.
- **Modern physics:** photons, matter waves, energy levels of atoms.
- **Basic quantum mechanics:** states, measurement, spin.

### 3. Computer science and Python

- Logic gates and binary (you'll compare them with quantum gates).
- Enough Python to write loops and functions. Lesson 7 starts coding.

### 4. Electronics (for the hardware path)

Circuits, signals, noise and measurement. Quantum computers are controlled by precise microwave pulses and fast electronics, so this is the door into quantum hardware jobs.

## The bookmark list

| Book | Author | Read |
|---|---|---|
| Introduction to Linear Algebra | Gilbert Strang | Ch 1, 2, 4, 6 |
| Visual Complex Analysis | Tristan Needham | Ch 1 |
| Probability Theory, Vol. 1 | William Feller | Ch I, V, VI |
| The Feynman Lectures, Vol. III | Richard Feynman | Ch 1–3, 6, 19 |
| Concepts of Modern Physics | Arthur Beiser | Ch 2–5 |
| Introduction to Quantum Mechanics | David J. Griffiths | Ch 1–3 |
| The Principles of Quantum Mechanics | P.A.M. Dirac | Ch 1 |
| The Art of Electronics | Horowitz & Hill | Ch 1 |
| Quantum Computation and Quantum Information | Nielsen & Chuang | Ch 1, 2, 4 (the final goal) |

**Free video companions:** 3Blue1Brown's *Essence of Linear Algebra* (chapters 1–4 cover most of what Lessons 1–2 need) and NPTEL's IIT courses.

## Check yourself before Lesson 1

You're ready if you can do these by hand:

1. Multiply (2 + 3i)(1 − i).
2. Find |3 + 4i|.
3. Multiply the matrix [[0, 1], [1, 0]] by the vector [1, 0].
4. If a coin lands heads with probability 0.3, what's the probability of tails?

Answers: 5 + i; 5; [0, 1]; 0.7. If any felt shaky, spend a week on Strang Ch 1 and Needham Ch 1 first.

## Where to start today

Watch the first four 3Blue1Brown linear-algebra videos, then open **Lesson 1**.
