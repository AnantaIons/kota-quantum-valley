---
layout: ../../layouts/Post.astro
title: "Quantum algorithms: Deutsch–Jozsa to Shor"
description: "Oracles, phase kickback, Deutsch–Jozsa, Bernstein–Vazirani, Grover's search, the quantum Fourier transform and Shor's algorithm."
date: 2026-10-29
category: lesson
lesson: 3
slides: lesson-3
---

## The recipe

Almost every quantum algorithm follows the same pattern: **superpose → apply an oracle → interfere → measure.** The oracle marks the answer with a phase. Interference turns that phase into a high probability of measuring the right answer.

**Phase kickback** is the trick behind it: when a controlled gate acts on a target in the |−⟩ state, the phase ends up on the *control* qubit.

## The algorithms

- **Deutsch–Jozsa:** is a function constant or balanced? Classically you might need to check more than half the inputs. Quantumly, one query.
- **Bernstein–Vazirani:** find a hidden n-bit string. Classically n queries, quantumly one.
- **Grover's search:** find a marked item among N in about √N steps instead of N. Each round has two parts: the oracle flips the sign of the answer, then *diffusion* reflects everything around the average, boosting the answer. A quadratic speed-up.
- **Quantum Fourier transform (QFT):** finds the hidden period in a sequence. It is the engine inside Shor.
- **Shor's algorithm:** factoring turns into finding a period. With the QFT, a quantum computer can find it exponentially faster. Example: factoring 15 gives 3 × 5.

## Why Shor matters

RSA encryption is safe only because factoring huge numbers is hard. A large, error-corrected quantum computer running Shor would break it. That is why the world is moving to post-quantum cryptography (see Lesson 5).

**Honest note:** quantum doesn't speed up everything. The big wins are specific problems: factoring, simulating molecules and materials, and some search and optimisation.
