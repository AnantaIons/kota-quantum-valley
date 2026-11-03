---
layout: ../../layouts/Post.astro
title: "Quantum communication and QKD"
description: "One-time pads, BB84 step by step, catching an eavesdropper, E91, satellites, teleportation, and QKD vs post-quantum cryptography."
date: 2026-10-30
category: lesson
lesson: 5
slides: lesson-5
---

## The problem

A **one-time pad** is unbreakable if the key is truly random, as long as the message, and used only once. The hard part is sharing the key. **Quantum key distribution (QKD)** solves that: physics guarantees that anyone spying leaves fingerprints.

Three quantum rules make it work: measuring disturbs a state, unknown states can't be copied (no-cloning), and measuring in the wrong basis gives a random answer.

## BB84, step by step

1. **Alice sends.** For each photon she picks a random bit and a random basis: + (horizontal/vertical) or × (diagonal).
2. **Bob measures.** He guesses a basis for each photon. Half the time he guesses right and gets Alice's bit exactly; otherwise the result is random.
3. **They compare bases** (not bits) over a normal public channel and keep only the matches. That's the *sifted key*.
4. **Error check.** They reveal a sample of bits. If Eve measured every photon, about **25%** of sifted bits disagree. Above about 11% errors, BB84 aborts.
5. **Clean the key.** Error correction plus privacy amplification gives a shorter, perfectly secret key.

**E91** does the same with entangled pairs and uses a Bell test to prove nobody tampered.

## Real world

Fibre loses about 0.2 dB per km and photons can't be amplified, so fibre QKD is limited to a few hundred km without trusted relay nodes. **Satellites** go further: China's Micius secured a 7,600 km intercontinental call in 2017. India's DRDO and IIT Delhi have shown QKD over fibre and free space.

## QKD vs PQC

**Post-quantum cryptography (PQC)** uses new maths problems that quantum computers can't easily solve. NIST published the first standards in 2024. It runs on today's hardware. QKD needs special hardware but its security rests on physics. Expect both to coexist.
