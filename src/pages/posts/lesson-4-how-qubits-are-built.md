---
layout: ../../layouts/Post.astro
title: "How real qubits are built"
description: "Decoherence, fidelity, transmons and dilution fridges, the control stack, ions, atoms, photons, spins, and error correction."
date: 2026-10-29
category: lesson
lesson: 4
slides: lesson-4
---

## Qubits are physical things

A qubit is any physical system with two levels you can control: a superconducting circuit, an ion, an atom, a photon, an electron spin. The **DiVincenzo checklist** says a good platform needs scalable qubits, a way to reset them, long coherence, a universal gate set, and readout.

**Decoherence** is the enemy: heat, stray fields and vibrations leak the quantum state into the environment. What matters is the ratio of gate speed to memory time, and **fidelity**, the percentage of operations that come out right.

## The transmon

The most common qubit today (IBM, Google). A superconducting circuit with a **Josephson junction**, which makes the energy levels unevenly spaced so |0⟩ and |1⟩ can be addressed alone. It runs at about 10–20 millikelvin inside a **dilution refrigerator**, colder than outer space.

## The control stack (where embedded engineers fit)

Room-temperature electronics generate microwave pulses (FPGAs, DACs, RF mixing). The pulses travel down into the fridge to **drive** the qubits. Reflected signals come back up, get amplified and are digitised for **readout**. Timing, firmware and low-latency feedback are all engineering problems.

## Other platforms

- **Trapped ions:** very high fidelity, slower gates.
- **Neutral atoms:** held in laser tweezers; scaling to hundreds and thousands.
- **Photons:** room temperature, natural for networking.
- **Silicon spins:** could reuse chip-factory technology.
- **Topological:** errors suppressed by design. Still early research.

## Error correction

Physical qubits make too many errors. **Error correction** spreads one *logical* qubit across many physical ones and keeps checking for errors without measuring the data. The **surface code** is the leading approach. In 2024 Google's Willow chip showed that logical errors fall as the code gets bigger, a key milestone.
