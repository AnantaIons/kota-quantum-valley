---
layout: ../../layouts/Post.astro
title: "Day 9: Drawing a qubit, and why it needs 720°"
description: "A design day: motion and drawings for the home page, including a dilution refrigerator and a Möbius strip. The idea of the day: turning a qubit all the way round is not enough."
date: 2026-11-05
category: journey
day: 9
---

Today was a design day. A page about qubits should show qubits, so the home page now has motion and drawings built from the ideas themselves.

## What I built

- **Inside a real quantum computer**: a drawing of a dilution refrigerator. As you scroll, the cold travels down its six stages, from room temperature to about 10 millikelvin, a hundredth of a degree above absolute zero, where superconducting qubits work.
- **Turn it twice**: a moving Möbius strip, to show why a qubit has to turn through 720° to come back to where it started.
- **A live histogram** in the Lab preview: 1,000 measurements of a qubit, counted as they arrive.

The Möbius strip took the longest, because I had to be sure the idea behind it was right.

## The idea of the day: the half-angle

Every state of one qubit can be written as

> |ψ⟩ = cos(θ/2)|0⟩ + e^(iφ) sin(θ/2)|1⟩

The two angles θ and φ give a point on the Bloch sphere. But the formula uses θ/2, not θ. Why?

|0⟩ and |1⟩ are completely different states: measuring one never gives the other's result. On the sphere they sit at opposite poles, 180° apart. In the formula, going from |0⟩ to |1⟩ turns cos and sin through only 90°. **The sphere doubles every angle.**

Now run that backwards. Turn a qubit through a full 360° on the sphere, and inside the formula the angles have moved only 180°. Both amplitudes come back multiplied by −1:

> |ψ⟩ → −|ψ⟩

That overall −1 cannot be seen in any measurement of this qubit on its own. But if the turn happens on only one branch of a larger superposition, the −1 becomes a relative phase and changes the result. Only a second full turn, 720° in all, brings the state back exactly. A Möbius strip has the same habit: walk once along it and you are on the other side; walk twice and you are back.

The full lesson: [superposition and the Bloch sphere](/posts/superposition-and-the-bloch-sphere/).

## What's next

The maths underneath all of this. Course 2 starts with complex numbers.
