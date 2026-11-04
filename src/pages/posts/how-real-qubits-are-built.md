---
layout: ../../layouts/Post.astro
title: "How real qubits are built"
description: "What makes a good qubit, decoherence and fidelity in numbers, transmons and dilution fridges, the control stack, the five main platforms, and why error correction matters."
date: 2026-10-29
category: lesson
lesson: 37

---

So far a qubit has been maths. This lesson is about the physical object, and why building good ones is one of the hardest engineering problems today.

## What a qubit physically is

Any quantum system with two levels you can control: a tiny superconducting circuit, a single trapped ion, a neutral atom, a photon, or an electron's spin. The levels play the role of |0⟩ and |1⟩.

## The DiVincenzo checklist

In 2000, David DiVincenzo listed what a working quantum computer needs:

1. **Scalable**, well-defined qubits.
2. A way to **reset** qubits to |0⟩.
3. **Long coherence** compared with gate time.
4. A **universal set of gates** (Lesson 17).
5. Reliable **measurement**.

## Decoherence: the enemy

Every qubit slowly leaks its quantum state into its surroundings: heat, stray electric and magnetic fields, vibrations. Two times describe this:

- **T1:** how long until |1⟩ decays to |0⟩ (energy loss).
- **T2:** how long the **phase** survives. Superposition needs this.

Coherence fades roughly as e^(−t/T2):

| Time (with T2 = 100 µs) | Coherence left |
|---|---|
| 0 | 100% |
| 50 µs | 61% |
| 100 µs | 37% |
| 300 µs | 5% |

**What matters is the ratio.** If a gate takes 50 ns and T2 is 100 µs, you have time for roughly 2,000 gates before the state fades.

## Fidelity: how often a gate is right

**Fidelity** is the fraction of times a gate does what you intended. 99.9% sounds excellent, but over 1,000 gates the chance that *everything* goes right is 0.999¹⁰⁰⁰ ≈ 37%. That's why error correction (Lesson 33) is essential.

## The transmon: today's workhorse

Used by IBM, Google and many others:

- A superconducting circuit of a capacitor and a **Josephson junction**, a thin insulating barrier between two superconductors.
- The junction makes the energy levels **unevenly spaced**, so you can drive |0⟩ ↔ |1⟩ without accidentally reaching |2⟩.
- It runs at about **10–20 millikelvin** inside a **dilution refrigerator**, colder than outer space, so heat can't flip it.
- Gates are microwave pulses lasting tens of nanoseconds.

## The control stack (where engineers fit)

```
Software (Qiskit)  →  compiler  →  pulse sequencer (FPGA)
   →  DACs + RF mixers  →  coax lines into the fridge  →  qubits
   ←  amplifiers  ←  ADCs  ←  readout signal  ←
```

Every arrow is an engineering job: low-noise electronics, precise timing, fast feedback, firmware. Quantum hardware is as much an electronics problem as a physics one.

## The five main platforms

| Platform | Strengths | Challenges | Examples |
|---|---|---|---|
| **Superconducting** | Fast gates, chip fabrication | Needs mK cooling, short coherence | IBM, Google |
| **Trapped ions** | Very high fidelity, any-to-any connections | Slower gates | Quantinuum, IonQ |
| **Neutral atoms** | Hundreds to thousands of atoms, flexible layouts | Slower gates, atom loss | QuEra, Pasqal |
| **Photonic** | Room temperature, natural for networks | Photons rarely interact | Xanadu, PsiQuantum |
| **Silicon spins** | Reuses chip-factory technology | Hard to control many at once | Intel, Diraq |

**Topological** qubits aim to resist errors by design, but are still at an early research stage.

## Why errors make scaling hard

Adding qubits adds noise sources, wiring, heat and crosstalk. A useful algorithm may need billions of operations; physical qubits manage thousands. The bridge is **error correction**: many physical qubits make one reliable **logical** qubit. In 2024, Google's Willow chip showed logical errors *falling* as the code grew, a key milestone. Lesson 33 builds a code yourself.

## Try it

1. A gate takes 30 ns and T2 = 150 µs. Roughly how many gates fit before coherence drops to 37%?
2. With 99.5% fidelity, what's the chance 200 gates all succeed? (0.995²⁰⁰)
3. Which platform would you choose for a quantum network between cities, and why?

## Cheat sheet

| Term | Meaning |
|---|---|
| T1 / T2 | Energy-loss time / phase-loss time |
| Fidelity | Fraction of correct operations |
| Transmon | Superconducting qubit with a Josephson junction |
| Dilution fridge | Cools qubits to ~10 mK |
| Logical qubit | Reliable qubit built from many physical ones |
