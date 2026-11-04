---
layout: ../../layouts/Post.astro
title: "Quantum communication and QKD"
description: "One-time pads, BB84 step by step with a simulation you can run, catching an eavesdropper, E91, distance limits and satellites, and QKD vs post-quantum cryptography."
date: 2026-10-30
category: lesson
lesson: 5
slides: lesson-5
---

Shor's algorithm (Lesson 11) threatens today's encryption. Quantum physics also offers a fix: a way to share secret keys where **any eavesdropping leaves evidence**. That's quantum key distribution, QKD.

## The problem QKD solves

The **one-time pad** is mathematically unbreakable if the key is truly random, as long as the message, and never reused. Its weak point is **sharing the key**: if someone copies the key in transit, everything is lost.

Public-key methods like RSA solve sharing, but rely on maths that Shor can break. QKD shares the key using **physics** instead.

## Three rules that protect the key

1. **Measuring disturbs:** looking at a qubit generally changes it.
2. **No-cloning:** an unknown qubit can't be copied.
3. **Wrong basis, random answer:** measure in the wrong basis and the result is a coin toss.

## Two bases

Photons can be polarised in two bases:

| Basis | Bit 0 | Bit 1 |
|---|---|---|
| **+** (rectilinear) | horizontal → | vertical ↑ |
| **×** (diagonal) | diagonal ↗ | anti-diagonal ↖ |

Measure a photon in the **same** basis it was sent in: you get the right bit. In the **other** basis: 50/50 random.

## BB84, step by step

Charles Bennett and Gilles Brassard, 1984.

1. **Alice sends:** for each photon, a random bit and a random basis.
2. **Bob measures:** in a random basis of his own. Half the time he matches Alice.
3. **Sifting:** over a public channel they compare **bases only**, never bits, and keep the positions where bases matched. About half the photons survive.
4. **Error check:** they reveal a random sample of the kept bits and compare.
5. **Decide:** low error, then they continue. Above about **11%**, they abort: someone was listening.
6. **Clean up:** error correction fixes stray errors; **privacy amplification** shrinks the key to remove anything Eve might know.

## Catching Eve: where 25% comes from

Eve intercepts each photon, measures it and sends a new one.

- She guesses the wrong basis **half** the time.
- Then she sends Bob a photon in the wrong basis, and Bob (in Alice's basis) gets a random bit: wrong **half** of those times.
- ½ × ½ = **25% errors** in the sifted key.

## Simulate it yourself

This is a classical simulation of the protocol's logic, no quantum library needed:

```python
import random
random.seed(7)

def bb84(n=2000, eve=False):
    a_bits  = [random.randint(0, 1) for _ in range(n)]
    a_bases = [random.choice("+x") for _ in range(n)]
    b_bases = [random.choice("+x") for _ in range(n)]
    received = []
    for bit, ab, bb in zip(a_bits, a_bases, b_bases):
        sent_bit, sent_basis = bit, ab
        if eve:                                   # intercept and resend
            eb = random.choice("+x")
            sent_bit = bit if eb == ab else random.randint(0, 1)
            sent_basis = eb
        received.append(sent_bit if bb == sent_basis else random.randint(0, 1))
    keep = [i for i in range(n) if a_bases[i] == b_bases[i]]
    errors = sum(a_bits[i] != received[i] for i in keep) / len(keep)
    return len(keep), round(errors, 3)

print("no Eve  :", bb84())
print("with Eve:", bb84(eve=True))
```

```text
no Eve  : (1027, 0.0)
with Eve: (985, 0.26)
```

About half the bits survive sifting, and Eve's spying shows up as ~25% errors, exactly as predicted.

## E91: the entangled version

Artur Ekert, 1991. A source sends one photon of an **entangled pair** to each side. They measure in random bases, sift, and use a **Bell test** on some results: if the correlations are as strong as entanglement allows, nobody tampered.

## The distance problem

- Optical fibre loses about **0.2 dB per km**: after 100 km only ~1% of photons arrive.
- Photons can't be amplified without measuring them (no-cloning).
- So fibre QKD reaches **a few hundred km**. Longer links use **trusted nodes**, or future **quantum repeaters**.

**Satellites:** photons travel through near-empty space with little loss. China's **Micius** satellite enabled a QKD-secured intercontinental video call over **7,600 km** in 2017. In India, **DRDO and IIT Delhi** have demonstrated QKD over fibre and through free space.

## QKD vs post-quantum cryptography

| | QKD | PQC |
|---|---|---|
| Security from | Laws of physics | Hard maths problems |
| Hardware | Special photon sources and detectors | Ordinary computers |
| Distance | Limited without trusted nodes | Unlimited |
| Status | Early networks | NIST standards published in 2024; rolling out now |

Most experts expect **both**: PQC everywhere, QKD for the highest-security links.

## Real-world caution

QKD's *theory* is secure; real *devices* can leak. Attacks have targeted detectors and light sources. Certified hardware and careful engineering matter as much as the physics.

## Try it

1. In the simulation, make Eve intercept only **half** the photons. What error rate do you expect? Check.
2. Increase n to 20,000. Does the error rate settle closer to 0.25?
3. Fibre loses 0.2 dB/km. What fraction of photons survive 50 km? (Hint: 10^(−0.2·50/10).)

## Cheat sheet

| Term | Meaning |
|---|---|
| One-time pad | Unbreakable if the key is random, long, used once |
| BB84 | Random bits + random bases, keep matching bases |
| Sifted key | Bits where Alice's and Bob's bases matched |
| Eve's mark | ~25% errors if she measures every photon |
| Abort threshold | ~11% error (BB84) |
| E91 | Entangled pairs + Bell test |
| PQC | Maths-based, quantum-resistant encryption |
