---
layout: ../../layouts/Post.astro
title: "What is a qubit?"
description: "A bit is 0 or 1. A qubit can be a blend of both — until you look. Here's what that really means."
date: 2026-10-28
category: explainer
---

A normal computer stores information in **bits**. A bit is either `0` or `1`. Nothing in between.

A quantum computer uses **qubits**. A qubit can be in a *blend* of 0 and 1 at the same time. This blend is called **superposition**.

## The notation

Physicists write the two basic states like this:

- `|0⟩` — read as "ket zero"
- `|1⟩` — read as "ket one"

(That's where our logo comes from — `|K⟩` is "Kota" written as a quantum state.)

Any qubit state can be written as:

```
|ψ⟩ = α|0⟩ + β|1⟩
```

Here **α** and **β** are numbers called *amplitudes*. They can even be complex numbers.

## What happens when you measure?

This is the strange part. When you measure a qubit, you never see the blend. You always get a plain `0` or `1`:

- You get `0` with probability **|α|²**
- You get `1` with probability **|β|²**

Because something must happen, the two probabilities always add up to one:

```
|α|² + |β|² = 1
```

**Example:** if α = β = 1/√2, then each probability is 1/2. The qubit is a perfect 50–50 blend — like a coin spinning in the air. Measuring it is like catching the coin: it lands as heads or tails, and the spin is gone.

## Why is this useful?

One qubit isn't impressive. The power comes from many qubits together.

- 2 qubits can hold a blend of 4 states (00, 01, 10, 11).
- 3 qubits: 8 states.
- *n* qubits: 2ⁿ states.

At 300 qubits, 2³⁰⁰ is more than the number of atoms in the observable universe. Quantum algorithms are clever ways of making the *right* answer's amplitude grow and the wrong ones cancel out, before you measure.

## A common mistake

> "A qubit is 0 and 1 at the same time, so a quantum computer tries every answer at once."

Not quite. You only get **one** answer when you measure. The trick is in steering the amplitudes — using **interference** — so the answer you want is the likely one. That's what the next explainers will cover.

## Remember

| Bit | Qubit |
|---|---|
| Either 0 or 1 | A blend: α\|0⟩ + β\|1⟩ |
| Reading it changes nothing | Measuring it collapses it to 0 or 1 |
| n bits = one of 2ⁿ states | n qubits = a blend of all 2ⁿ states |
