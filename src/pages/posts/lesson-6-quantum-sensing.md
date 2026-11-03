---
layout: ../../layouts/Post.astro
title: "Quantum sensing"
description: "Ramsey interferometry, precision limits, atomic clocks, SQUIDs, NV centres in diamond, atom gravimeters and LIGO's squeezed light."
date: 2026-10-30
category: lesson
lesson: 6
slides: lesson-6
---

## A qubit's weakness is a sensor's strength

Qubits lose their state when the environment touches them. That's terrible for computing and perfect for measuring. A magnetic field, an electric field or gravity shifts the qubit's energy. In superposition, that shift builds up as a **phase**, and interference turns phase into something you can count.

## The core trick: Ramsey interferometry

H, wait for a time t, H, measure.

```
after first H:   (|0⟩ + |1⟩)/√2
after waiting:   (|0⟩ + e^{iφ}|1⟩)/√2      φ = Δω · t
after second H:  P(0) = cos²(φ/2)
```

Measure P(0) and you know φ. Know φ and you know the field.

**Precision limits.** With N independent atoms or repeats, error falls as 1/√N (the *standard quantum limit*). Entangle the atoms into a GHZ state and it can fall as 1/N (the *Heisenberg limit*), but GHZ states are very fragile.

## The sensors

- **Atomic clocks:** one second is 9,192,631,770 cycles of caesium-133. A clock is an oscillator locked to an atom, like a PLL with nature as the reference. GPS, NavIC, mobile networks and power grids depend on them.
- **SQUIDs:** superconducting loops that sense femtotesla fields, enough for brain scans (MEG). They need about 4 K.
- **NV centres in diamond:** room-temperature spin qubits read with a green laser and red glow, controlled at 2.87 GHz. A magnetic field splits the resonance: Δf = 2γB, with γ ≈ 28 GHz/T.
- **Optically pumped magnetometers:** rubidium vapour cells, small enough to wear for brain scans.
- **Atom interferometers:** atoms as waves, measuring gravity to about one part in a billion. Used for underground mapping and navigation without GPS.
- **LIGO:** squeezed light beats photon shot noise. LIGO-India is being built in Hingoli, Maharashtra.

**For engineers:** if you know PLLs, ADCs and noise, you already know half of quantum sensing.
