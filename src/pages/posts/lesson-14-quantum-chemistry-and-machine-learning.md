---
layout: ../../layouts/Post.astro
title: "Quantum chemistry and quantum machine learning"
description: "The two most-hyped application areas: what's genuinely promising, what's still research, and how to tell them apart."
date: 2026-11-04
category: lesson
lesson: 14
---

Ask "what will quantum computers be used for?" and you'll hear chemistry and machine learning. This lesson separates the solid reasons from the hype.

## Part 1: Quantum chemistry

### Why chemistry is hard for classical computers

Electrons in a molecule are quantum objects. Describing them exactly needs a number of values that grows **exponentially** with the number of electrons. Classical methods use clever approximations, which work well for most molecules but struggle when many electrons are strongly correlated, as in:

- **FeMoco**, the catalyst bacteria use to turn nitrogen into fertiliser at room temperature (the industrial Haber–Bosch process needs high heat and pressure, and uses roughly 1–2% of the world's energy).
- **Battery materials** and **high-temperature superconductors**.
- Some **drug** binding problems.

Feynman's 1981 insight was that a quantum system is naturally simulated by another quantum system. That's still the strongest argument for quantum computers.

### How it's done

- **Near term:** VQE (Lesson 13) on small molecules like H₂ and LiH. These are demonstrations; classical computers solve them easily.
- **Long term:** **phase estimation** (Lesson 10) on error-corrected machines to get energies to "chemical accuracy". Resource estimates for FeMoco run to **millions of physical qubits**.

### Honest status

Promising and well-founded, but useful advantage needs error-corrected hardware. Expect careful, incremental progress, not overnight breakthroughs.

## Part 2: Quantum machine learning (QML)

### The ideas

- **Quantum kernels:** map data into a huge quantum state space, then measure similarity between data points.
- **Variational quantum classifiers:** parameterised circuits trained like small neural networks.
- **Quantum speed-ups for linear algebra** (the HHL algorithm): exponentially faster matrix inversion, in principle.

### The catches

- **Data loading:** getting classical data into quantum states can cost as much as the computation you hoped to speed up.
- **Dequantisation:** several claimed exponential speed-ups (for example in recommendation systems) were matched by new classical algorithms, starting with Ewin Tang's 2018 result, found when she was an undergraduate.
- **Trainability:** large variational models hit barren plateaus (Lesson 13).
- **No demonstrated advantage** on practical, real-world ML tasks so far.

### Where QML may still win

On data that is **already quantum**: outputs of quantum sensors (Lesson 6) or quantum simulations. There, there's no loading problem, and quantum processing has a natural edge.

## A checklist for spotting hype

When you read "quantum computer beats classical at X", ask:

1. **Compared against what?** The best classical method, or a weak baseline?
2. **Useful problem, or a demonstration?**
3. **Real hardware, or a simulation?** And how many qubits, with what error rates?
4. **Does the result survive error-correction overhead?**

## Try it

1. Search IBM or Google's latest chemistry papers. Which molecule did they simulate, and could a laptop do it classically?
2. In Lesson 13's VQE code, replace the Hamiltonian with `["ZZ", "XI", "IX"]` coefficients `[1, 0.5, 0.5]` on 2 qubits. You'll need a 2-qubit ansatz: try RY on both qubits plus a CNOT.
