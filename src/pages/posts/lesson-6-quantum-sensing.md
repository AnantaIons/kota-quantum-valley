---
layout: ../../layouts/Post.astro
title: "Quantum sensing"
description: "Why a fragile qubit makes a superb sensor, Ramsey interferometry in code, precision limits, atomic clocks, SQUIDs, NV centres, atom gravimeters and LIGO."
date: 2026-10-30
category: lesson
lesson: 6
slides: lesson-6
---

Quantum computing fights the environment. **Quantum sensing listens to it.** It's also the pillar already in daily use: atomic clocks and SQUIDs have worked for decades.

## A qubit's weakness is a sensor's strength

1. A field (magnetic, electric, gravity) **shifts** the energy gap between |0⟩ and |1⟩.
2. In superposition, that shift builds up as a **phase** between |0⟩ and |1⟩ over time.
3. **Interference** turns the phase into a probability you can measure.

## The recipe every quantum sensor follows

1. **Prepare** the qubit in |0⟩.
2. **Superpose** it with an H-like operation.
3. **Sense:** wait a time t; the field adds a phase φ.
4. **Read out:** interfere and measure; repeat thousands of times.

## Ramsey interferometry: H, wait, H

```
after first H:   (|0⟩ + |1⟩)/√2
after waiting:   (|0⟩ + e^(iφ)|1⟩)/√2        φ = Δω · t
after second H:  P(0) = cos²(φ/2)
```

Measure P(0) and you know φ. Know φ and you know the field.

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

for phi in [0, np.pi / 2, np.pi]:
    r = QuantumCircuit(1)
    r.h(0)
    r.p(phi, 0)        # the field adds phase φ
    r.h(0)
    p0 = abs(Statevector(r).data[0]) ** 2
    print(f"φ = {phi:.3f}   P(0) = {p0:.3f}   cos²(φ/2) = {np.cos(phi/2)**2:.3f}")
```

```text
φ = 0.000   P(0) = 1.000   cos²(φ/2) = 1.000
φ = 1.571   P(0) = 0.500   cos²(φ/2) = 0.500
φ = 3.142   P(0) = 0.000   cos²(φ/2) = 0.000
```

Sensors work best near φ = π/2, where P(0) changes fastest. Waiting longer increases φ for the same field, until decoherence (Lesson 4) wipes it out.

## Precision limits

- **Standard quantum limit:** with N independent atoms or repeats, error falls as **1/√N**. 100 repeats give 10× better; 10,000 give 100×.
- **Heisenberg limit:** entangle N atoms into a **GHZ state** (|00…0⟩ + |11…1⟩)/√2 and the phase builds N times faster, so error can fall as **1/N**. The catch: GHZ states are extremely fragile.

## Atomic clocks

- **One second** = 9,192,631,770 cycles of caesium-133 radiation (SI definition).
- A clock is an oscillator **locked** to an atom by feedback: a phase-locked loop whose reference is nature.
- **Optical clocks** (like strontium, ~429 THz) tick far faster; the best would drift less than a second over the age of the universe.
- **Uses:** GPS and **NavIC** (satellites carry atomic clocks; 1 ns of error ≈ 30 cm), mobile networks, power grids. India's official time is kept by caesium clocks at **CSIR-NPL**.

## Magnetic sensors

| Field | Typical strength |
|---|---|
| Fridge magnet | ~5 mT |
| Earth | ~50 µT |
| Your heartbeat | ~10–100 pT |
| Your brain | ~100 fT |

- **SQUIDs:** superconducting loops with Josephson junctions; femtotesla sensitivity; used for brain scans (MEG); need ~4 K.
- **NV centres in diamond:** a nitrogen atom next to a missing carbon. Works at **room temperature**, read with a green laser and red glow, controlled at **2.87 GHz**. A field splits the resonance: **Δf = 2γB**, with γ ≈ 28 GHz/T, so 1 mT gives 56 MHz.
- **Optically pumped magnetometers:** rubidium vapour cells, small enough to wear for brain scans.

## Gravity and motion

**Atom interferometers** split cold atoms into two paths with laser pulses and recombine them. Gravity adds a phase **φ = k·g·T²**. Good instruments resolve about one part in a billion of g: enough to map tunnels, water and minerals underground, and to navigate **without GPS**.

## LIGO and squeezed light

LIGO senses mirror motion about 1/10,000 the width of a proton. Photon "shot noise" sets a quantum limit; **squeezed light** pushes the noise into the quantity that isn't measured. LIGO has used it since 2019. **LIGO-India** is being built in Hingoli, Maharashtra.

## Try it

1. In the code, try φ = π/3. Predict P(0) first.
2. How many independent repeats are needed for 1,000× better precision at the standard quantum limit?
3. An NV sensor shows a splitting of 14 MHz. What's the field? (Δf = 2γB, γ = 28 GHz/T.)

## Cheat sheet

| Idea | Formula / fact |
|---|---|
| Ramsey | H, wait, H: P(0) = cos²(φ/2) |
| Standard limit | precision ∝ 1/√N |
| Heisenberg limit | precision ∝ 1/N (entangled) |
| Second | 9,192,631,770 Cs-133 cycles |
| NV centre | Δf = 2γB, γ ≈ 28 GHz/T |
| Atom gravimeter | φ = k·g·T² |
