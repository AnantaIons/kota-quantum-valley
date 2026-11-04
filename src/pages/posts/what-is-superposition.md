---
layout: ../../layouts/Post.astro
title: "What is superposition, really?"
description: "Not 'both at once', not a spinning coin. What a superposition actually is, what amplitudes do, and why it matters."
date: 2026-11-04
category: explainer
---

You'll often hear that a qubit in superposition is "0 and 1 at the same time". That phrase is catchy, but it leads people astray. Here's a more careful picture.

## The definition

A qubit's state is written as

```
|ψ⟩ = α|0⟩ + β|1⟩
```

where α and β are **amplitudes**: numbers that can be positive, negative or complex, with |α|² + |β|² = 1.

**Superposition just means both α and β are non-zero.** That's all.

## What you see when you measure

You never see α or β directly. A measurement gives a single 0 or 1:

- 0 with probability |α|²
- 1 with probability |β|²

After that, the qubit *is* the result you saw. The superposition is gone.

## Why "a spinning coin" is only half right

A spinning coin is a good picture for the randomness: until it lands, you don't know heads or tails. But a coin is always secretly heads-or-tails underneath; you just don't know which.

A qubit is different in one crucial way: **amplitudes can cancel.**

Take (|0⟩ + |1⟩)/√2 and (|0⟩ − |1⟩)/√2. Measure either one and you get 50/50; they look identical. But apply a Hadamard gate and the first always gives 0, the second always gives 1. The minus sign was real information, invisible to a single measurement but decisive for interference.

No coin, and no "secretly 0 or 1" story, can do that. Probabilities are never negative, so they can't cancel. Amplitudes can.

## Why it matters

Superposition alone doesn't make quantum computers fast. Ten qubits in superposition, measured, just give you ten random bits.

The power comes from **superposition + interference**: an algorithm arranges the amplitudes so the wrong answers cancel and the right answer adds up, *before* you measure. That's what Grover's and Shor's algorithms do (Lesson 3).

## Try it

In the [Quantum Lab](/lab/), press **H**, then measure 1,000 times: about 50/50. Reset, press **H**, **Z**, **H**: always |1⟩. The Z gate only flipped a sign, yet the outcome changed completely.

## Remember

| Myth | Better picture |
|---|---|
| "0 and 1 at the same time" | A state with two non-zero amplitudes |
| "It's secretly 0 or 1, we just don't know" | No: the signs of amplitudes are real and can cancel |
| "Superposition makes computers fast" | Superposition **plus interference** does |
