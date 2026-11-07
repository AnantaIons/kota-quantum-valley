---
layout: ../../layouts/Post.astro
title: "Day 7: The site is live, and two qubits that always agree"
description: "Kota Quantum Valley goes online with its first lessons, a full Hindi version and a Quantum Lab. The idea of the day: the Bell state."
date: 2026-11-03
category: journey
day: 7
---

Today the website went live. Until now everything lived on Instagram, in carousels. A website can hold what a carousel cannot: long lessons, code you can copy, and experiments you can run.

## What I built

- **The site itself**, hosted on Cloudflare, with the code on GitHub, so every change is tracked and can be undone.
- **The first six lessons and the roadmap**: notes that start from zero, code that runs, and exercises.
- **A full Hindi version.** Every main page has an English and a Hindi switch. A Kota student should not have to read quantum physics in a second language.
- **The Quantum Lab**: a Bloch sphere you can turn, a superposition experiment, a Bell-state experiment and a circuit builder for up to four qubits.
- **A "Chat with us" button** that opens an Instagram message.

## The idea of the day: two qubits that always agree

Building the Bell-state experiment meant getting one small circuit exactly right. Start with two qubits, both 0. Apply a Hadamard gate to the first and then a CNOT gate from the first to the second. The state becomes

> (|00⟩ + |11⟩) / √2

Measure both qubits and you get 00 half the time and 11 half the time. Never 01, never 10.

Look at either qubit alone and it behaves like a fair coin: 0 or 1, fifty-fifty. Look at both and they always agree. Neither qubit had a value before it was measured, yet the two results are perfectly correlated. That is **entanglement**.

It does not let you send a message faster than light. Whoever holds one qubit sees only random 0s and 1s; the agreement shows up only when the two lists of results are put side by side, and that needs ordinary communication.

Try it in the [Quantum Lab](/lab/), or read the full lesson on [entanglement and Bell states](/posts/entanglement-and-bell-states/).

## What's next

Turning the first lessons into a complete course, from bits all the way to real hardware.
