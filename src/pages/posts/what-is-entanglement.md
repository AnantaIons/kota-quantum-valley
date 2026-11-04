---
layout: ../../layouts/Post.astro
title: "What is entanglement?"
description: "Two qubits sharing one state: perfect correlation, no faster-than-light messages, and why it powers quantum computing and QKD."
date: 2026-11-04
category: explainer
---

Einstein called it "spooky action at a distance". It's less spooky once you see what it is, and what it isn't.

## Two qubits, one state

Two separate qubits can each have their own state, like |0⟩ and |+⟩. Together they're written as a product, and you can always describe each one on its own.

An **entangled** state is one you *can't* split into two separate descriptions. The classic example is the Bell state:

```
|Φ⁺⟩ = (|00⟩ + |11⟩) / √2
```

There is no "state of qubit A" and "state of qubit B" here, only a state of the pair.

## What you see

Measure the pair many times:

- You get **00** half the time and **11** half the time.
- You **never** get 01 or 10.

Each qubit alone looks like a fair coin. But the two coins always agree, even if the qubits are far apart.

## How to make one

Two gates are enough (Lesson 14):

1. **H** on qubit A: it becomes (|0⟩ + |1⟩)/√2.
2. **CNOT** with A as control and B as target: B copies A's value in each branch.

Result: (|00⟩ + |11⟩)/√2.

## The big misunderstanding: no faster-than-light messages

If measuring A instantly "decides" B, can you send a message? **No.**

Whoever holds A sees a random 0 or 1. They can't choose it. Whoever holds B also sees a random result. Only when the two compare notes, over an ordinary phone call or internet link, do they discover the results matched. Nothing usable travels faster than light.

## Why it matters

- **Quantum computing:** entanglement lets many qubits share one state of 2ⁿ amplitudes. Without it, a quantum computer could be simulated easily.
- **Quantum communication:** the E91 protocol uses entangled photons for key distribution, and a Bell test exposes eavesdroppers (Lesson 41).
- **Teleportation:** an entangled pair plus two classical bits moves a qubit's state from one place to another.
- **Sensing:** entangled atoms can beat the standard precision limit (Lesson 44).

## Try it

In the [Quantum Lab](/lab/), open **Experiment 3**, press **Make a Bell state** and measure 100 times. Then add **H q1** and measure again: the perfect correlation breaks.

## Remember

| Entanglement is | Entanglement is not |
|---|---|
| A shared state of two or more qubits | Two qubits secretly agreeing in advance |
| Perfect correlation in results | A way to send messages instantly |
| A resource for computing, QKD, teleportation | Magic |
