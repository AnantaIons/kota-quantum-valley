---
layout: ../../layouts/Post.astro
title: "How real qubits are built"
description: "From maths to matter: what a physical qubit is, why most must be colder than outer space (computed), how a gate is really a carefully timed pulse (Rabi oscillations simulated), why a qubit can't be an ordinary oscillator, how qubits are read out, the DiVincenzo criteria, how to compare machines, and the main platforms side by side."
date: 2026-11-04
category: lesson
lesson: 37
---

For 36 lessons, a qubit has been a column of two complex numbers, and a gate has been a matrix. That's the right way to think about algorithms. But somewhere, a real object has to hold those numbers, and a real piece of hardware has to apply those matrices. This lesson is about that physical layer: what a qubit actually is, how you control it, how you read it, and how to judge whether a given machine is any good. Lessons 38 and 39 then go deep into the leading technologies.

If you come from electronics or embedded systems, this is where quantum computing will feel most familiar. Much of it is about signals, timing, noise and control.

## A qubit is two energy levels

Almost any quantum system with **two distinct energy levels** that you can control can serve as a qubit. The lower level plays |0⟩ and the upper level plays |1⟩. The energy difference ΔE between them fixes a **frequency**, through Planck's relation:

> ΔE = h·f   (h = 6.626 × 10⁻³⁴ J·s, Planck's constant)

That frequency is the qubit's "tuning": it's the frequency of light or microwaves that drives transitions between |0⟩ and |1⟩, and it's how you address one qubit without disturbing another.

| Platform | What \|0⟩ and \|1⟩ are | Qubit frequency |
|---|---|---|
| Superconducting circuit (transmon) | The two lowest energy states of a tiny electrical circuit on a chip | ≈ 4 to 8 GHz (microwaves) |
| Trapped ion, hyperfine qubit | Two states of the ion's electron and nucleus spins, e.g. in ¹⁷¹Yb⁺ | ≈ 12.6 GHz |
| Trapped ion, optical qubit | A ground and a long-lived excited electron state, e.g. in ⁴⁰Ca⁺ | ≈ 411 THz (729 nm red light) |
| Neutral atom | Two hyperfine ground states, e.g. in ⁸⁷Rb | ≈ 6.8 GHz |
| Electron spin in silicon | Spin up and spin down in a magnetic field | ≈ 10 to 40 GHz |
| Photon | Horizontal or vertical polarisation, or which of two paths it takes | (not an energy gap; the photon itself carries the qubit) |

The physics differs wildly, but the maths you've learned applies to all of them. That's the power of the abstraction.

## Keeping it cold (or not)

A qubit's environment is always trying to add or remove energy. If the surroundings are warm, random thermal energy will kick the qubit into |1⟩ on its own, and you can't even start from a clean |0⟩. How warm is too warm? Compare the qubit's energy gap hf with the thermal energy k_B·T, using the Boltzmann distribution:

```python
import numpy as np

h, k_B = 6.62607015e-34, 1.380649e-23          # Planck and Boltzmann constants (SI, exact)

def excited_fraction(f_hz, T_kelvin):
    """Thermal chance of finding a two-level system in its upper level: Boltzmann distribution."""
    x = h * f_hz / (k_B * T_kelvin)
    return np.exp(-x) / (1 + np.exp(-x))

f = 5e9                                          # a typical superconducting qubit: 5 GHz
print(f"5 GHz qubit: hf/k_B = {h * f / k_B * 1000:.0f} mK")
for T, place in [(300, "room temperature"), (4, "liquid helium"), (0.1, "100 mK"), (0.05, "50 mK"), (0.01, "10 mK")]:
    print(f"  {place:17s} T = {T:7.3f} K   thermally excited: {excited_fraction(f, T):.2e}")
print(f"\n729 nm optical ion qubit (411 THz) at room temperature: {excited_fraction(411e12, 300):.1e}")
```

```text
5 GHz qubit: hf/k_B = 240 mK
  room temperature  T = 300.000 K   thermally excited: 5.00e-01
  liquid helium     T =   4.000 K   thermally excited: 4.85e-01
  100 mK            T =   0.100 K   thermally excited: 8.32e-02
  50 mK             T =   0.050 K   thermally excited: 8.17e-03
  10 mK             T =   0.010 K   thermally excited: 3.79e-11

729 nm optical ion qubit (411 THz) at room temperature: 2.8e-29
```

A 5 GHz qubit's energy gap corresponds to a temperature of only 240 millikelvin. At room temperature or even at 4 K (liquid helium), the qubit is half in |1⟩, completely randomised. Only at around 10 to 20 mK does thermal excitation become negligible. That's why superconducting and spin qubits live inside **dilution refrigerators**, which reach about 10 mK, a hundred times colder than outer space (2.7 K). In practice, stray radiation leaking down the wires heats real qubits to an effective 30 to 60 mK, leaving a fraction of a percent of residual excitation, which is reset away before each run.

The last line shows why trapped ions with **optical** qubits don't need a fridge for the qubit itself: at 411 THz, the energy gap is so large that room temperature can't excite it at all. (Ion and atom experiments still need ultra-high vacuum, and they use lasers to cool the atoms' **motion** to near absolute zero, which is a separate issue.) Hyperfine ion and atom qubits, at a few GHz, would be thermally mixed at room temperature too, but they're prepared by **optical pumping**: shining laser light that keeps exciting the atom until it falls into the one state the light can't touch, which works regardless of temperature.

## A gate is a pulse: Rabi oscillations

How do you actually rotate a qubit? You shine a wave at it, microwaves or laser light, at (or very near) its frequency. While the drive is on, the qubit oscillates smoothly between |0⟩ and |1⟩. These are **Rabi oscillations**, named after Isidor Rabi (Nobel Prize 1944).

In the "rotating frame" that turns with the drive, the physics reduces to a simple Hamiltonian, H = (Δ/2)Z + (Ω/2)X, where **Ω** (the Rabi frequency) is set by the drive's strength and **Δ** is the **detuning**, the difference between the drive frequency and the qubit frequency. The qubit evolves as e^(−iHt), which on resonance (Δ = 0) is just RX(Ω·t), the rotation from Lesson 11:

```python
import numpy as np
from scipy.linalg import expm

X = np.array([[0, 1], [1, 0]]); Z = np.diag([1, -1])
rabi = 2 * np.pi * 20e6                          # drive strength Ω: 20 MHz Rabi frequency (in rad/s)

def p1_after(t, detuning):
    """Chance of |1⟩ after driving |0⟩ for time t. Rotating frame: H = (Δ/2)Z + (Ω/2)X."""
    H = 0.5 * detuning * Z + 0.5 * rabi * X
    psi = expm(-1j * H * t) @ np.array([1, 0])
    return abs(psi[1]) ** 2

t_pi = np.pi / rabi                              # a π pulse: Ω·t = π
print(f"π-pulse length: {t_pi * 1e9:.0f} ns")
print("  time (ns)   on resonance   detuned by 10 MHz")
for frac in [0, 0.25, 0.5, 0.75, 1.0, 1.5, 2.0]:
    t = frac * t_pi
    print(f"   {t * 1e9:5.1f}         {p1_after(t, 0):.3f}           {p1_after(t, 2 * np.pi * 10e6):.3f}")
```

```text
π-pulse length: 25 ns
  time (ns)   on resonance   detuned by 10 MHz
     0.0         0.000           0.000
     6.2         0.146           0.145
    12.5         0.500           0.474
    18.8         0.854           0.750
    25.0         1.000           0.773
    37.5         0.500           0.189
    50.0         0.000           0.105
```

On resonance, the qubit swings fully from |0⟩ to |1⟩ and back. Drive for half the time needed to flip, and you get an equal superposition: an RX(π/2), the hardware's version of a Hadamard-like gate. Drive for exactly the flip time, Ω·t = π, and you get an X gate, called a **π pulse**. Here, with a 20 MHz Rabi frequency, a π pulse takes 25 ns.

Off resonance, the oscillation is faster but never complete: with 10 MHz detuning, the best you can reach is Ω²/(Ω² + Δ²) = 80%. This is why every qubit's frequency must be measured precisely and the drive tuned to it, a process called **calibration**, repeated regularly as frequencies drift.

Three more facts about pulses complete the picture:

- **The drive's phase sets the rotation axis.** Shift the microwave's phase by 90° and you rotate about Y instead of X.
- **Z rotations are free.** Instead of physically rotating about Z, the controller simply shifts the phase of all **later** pulses on that qubit. This "virtual Z" gate takes zero time and has zero error, which is why compilers love Z rotations.
- **Two-qubit gates need an interaction.** The qubits must be coupled, through a shared circuit element, a shared vibration of ions, or an interaction between excited atoms. Each platform's two-qubit gate is its hardest and slowest operation, and its main source of error.

## Why a qubit can't be an ordinary oscillator

Here's a subtle but crucial requirement. Many physical systems, a pendulum, an LC circuit, a mode of light, are **harmonic oscillators**: their energy levels are **evenly spaced**, like rungs of a ladder. That sounds harmless, but it's a disaster for a qubit, because a drive tuned to the 0 → 1 transition is also exactly tuned to 1 → 2, 2 → 3, and so on. Let's apply the same "π pulse" to a qubit and to a harmonic oscillator:

```python
import numpy as np
from scipy.linalg import expm

levels, rabi = 12, 1.0
a = np.diag(np.sqrt(np.arange(1, levels)), 1)          # lowering operator of a harmonic oscillator
H_oscillator = 0.5 * rabi * (a + a.T)                  # a resonant drive; the levels are evenly spaced
H_qubit = 0.5 * rabi * np.array([[0, 1], [1, 0]])      # the same drive on a true two-level system

t = np.pi / rabi                                       # the "π pulse" that flips a qubit
qubit = np.abs(expm(-1j * H_qubit * t)[:, 0]) ** 2
osc = np.abs(expm(-1j * H_oscillator * t)[:, 0]) ** 2
print(f"{'level':22s}" + "".join(f"{n:>7d}" for n in range(5)))
print(f"{'two-level qubit':22s}" + "".join(f"{p:7.3f}" for p in qubit) + "      -" * 3)
print(f"{'harmonic oscillator':22s}" + "".join(f"{p:7.3f}" for p in osc[:5]))
```

```text
level                       0      1      2      3      4
two-level qubit         0.000  1.000      -      -      -
harmonic oscillator     0.085  0.209  0.258  0.212  0.131
```

The two-level system flips perfectly into level 1. The harmonic oscillator, given exactly the same drive, spreads out over many levels, with only a 21% chance of landing in level 1. It's impossible to confine it to two levels.

So a good qubit needs **anharmonicity**: the gap from 1 to 2 must differ from the gap from 0 to 1, so the drive can be tuned to one without touching the other. Atoms and ions have this naturally. Superconducting circuits get it from a special nonlinear component, the **Josephson junction**, which is the whole subject of Lesson 38. Even then, some population can **leak** into level 2 if pulses are too short or sharp, and clever pulse shapes are used to prevent it.

## Reading a qubit

Measurement must answer one question, 0 or 1, quickly and reliably, without disturbing neighbouring qubits. Each platform does it differently:

- **Superconducting qubits:** each qubit is coupled to a small microwave **resonator**. The resonator's frequency shifts slightly depending on whether the qubit is in |0⟩ or |1⟩ (called **dispersive readout**). Sending a weak microwave tone through it and measuring the reflected signal's phase reveals the qubit's state, in a few hundred nanoseconds.
- **Trapped ions and neutral atoms:** a laser is tuned so that one state scatters millions of photons per second (it glows) and the other scatters none (it stays dark). A camera or photon counter sees **bright = 1, dark = 0**, or the reverse.
- **Photons:** single-photon detectors register which path or polarisation the photon took. The best (superconducting nanowire detectors) catch over 95% of photons.
- **Spins in silicon:** the spin state is converted into the presence or absence of a single electron charge (**spin-to-charge conversion**), which a sensitive transistor-like sensor detects.

## The DiVincenzo criteria

In 2000, David DiVincenzo of IBM listed what any physical system needs to be a quantum computer. The list is still the standard checklist:

1. **A scalable system of well-characterised qubits.** You must know the qubits' properties, and be able to make many.
2. **Initialisation:** reset qubits reliably to a known state like |0⟩.
3. **Long coherence times**, much longer than gate times.
4. **A universal set of gates** (Lesson 17).
5. **Qubit-specific measurement.**

And two more for quantum communication:

6. **Converting** between stationary qubits (for computing) and flying qubits (for sending).
7. **Transmitting** flying qubits faithfully between places.

Photons are the obvious flying qubits, which is why every quantum network design (Lesson 42) involves converting matter qubits to light.

## How to compare machines

Headlines usually quote the **number of qubits**. That's the least informative number on its own. A thousand noisy qubits can be less useful than a hundred good ones, as Lesson 32's error budget showed. A fair comparison looks at several properties together:

| Property | What it tells you |
|---|---|
| Two-qubit gate error | The single most important quality number; sets how many gates you can run (about 1/ε) |
| Coherence time ÷ gate time | How many operations fit before the qubit forgets |
| Measurement error and speed | Matters greatly for error correction, which measures constantly |
| Connectivity | Which pairs can interact directly; sparse layouts need extra SWAP gates (Lesson 40) |
| Speed | Time per gate and per error-correction round; sets how long a big algorithm takes |
| Mid-circuit measurement and feed-forward | Needed for error correction and teleportation-based circuits |
| Path to scaling | Fabrication, wiring, cooling, control: can it grow to millions? |

Benchmarks combine these into single scores. **Randomised benchmarking** gives average gate errors. **Quantum volume** (IBM, 2019) measures the largest square random circuit a machine can run reliably. **Layer fidelity** measures how well a full layer of gates across many qubits works. Each captures something; none captures everything. Good engineers read the full data sheet.

## The main platforms at a glance

| Platform | Strengths | Challenges | Notable players |
|---|---|---|---|
| **Superconducting circuits** | Very fast gates (tens of ns), made with chip-fabrication methods, mature control | Needs ≈ 10 mK cooling, wiring for every qubit, nearest-neighbour connections only | IBM, Google, Rigetti, IQM, Alibaba, China's USTC |
| **Trapped ions** | Highest gate fidelities, long coherence, any qubit can interact with any other | Slow gates (≈ 100 µs), scaling past hundreds of ions in one trap is hard | Quantinuum, IonQ, AQT |
| **Neutral atoms** | Thousands of identical atoms, rearrangeable with laser tweezers, good for long-range codes | Slower cycles, atom loss, two-qubit fidelity still improving | QuEra, Pasqal, Atom Computing, Infleqtion |
| **Photonics** | Room-temperature photons, natural for networking, fast | Photons rarely interact, so gates are probabilistic; loss is the main enemy | PsiQuantum, Xanadu, Quandela |
| **Spins in silicon** | Tiny qubits, potentially made in existing chip factories | Uniformity, wiring and fidelity at scale still being solved | Intel, Diraq, Quantum Motion |

There's also a sixth, more speculative approach: **topological qubits**, which would store information in exotic quasiparticles (Majorana zero modes) whose structure resists local noise by design. Microsoft announced a first such chip, Majorana 1, in February 2025, but the evidence that it contains genuine topological qubits is still debated by physicists. Lesson 39 looks at ions, atoms, photons and spins in detail.

## The full stack, and where engineers fit

A quantum computer is a tower of engineering, and the qubits are only the bottom layer:

```text
Application and algorithm (Qiskit code, chemistry, optimisation)
  → Compiler and transpiler (map to the chip's gates and layout, Lesson 40)
    → Error-correction decoder (real-time classical computing, Lesson 35)
      → Pulse sequencer and control firmware (FPGAs, precise timing, feedback)
        → Signal generation and readout electronics (DACs, ADCs, mixers, amplifiers, lasers)
          → Cryogenics or vacuum, wiring, shielding
            → Qubits
```

Every layer is a job description: physicists for the qubits; cryogenic, vacuum, laser and microwave engineers for the hardware around them; FPGA and embedded engineers for the control systems, which must react in well under a microsecond for error correction; compiler and software engineers for the layers above. Quantum hardware is as much an electronics and systems problem as a physics problem. Lesson 38 follows a signal from software all the way down into the fridge.

## Try it

1. A spin qubit has a frequency of 20 GHz. What is its hf/k_B in millikelvin? Is 100 mK cold enough?
2. With a Rabi frequency of 50 MHz, how long is a π pulse? An RX(π/2) pulse?
3. A qubit is driven with Rabi frequency Ω and detuning Δ = Ω. What's the highest chance of reaching |1⟩?
4. Why is a Z rotation called "free" on most hardware?
5. Why is a harmonic oscillator a poor qubit, and what property fixes this?
6. Machine A has 1,000 qubits with 1% two-qubit error; machine B has 100 qubits with 0.1% error. Roughly how many two-qubit gates can each run before results are mostly noise?
7. Which DiVincenzo criteria are about communication rather than computation?

**Answers:**

1. hf/k_B = (6.626 × 10⁻³⁴ × 2 × 10¹⁰)/(1.381 × 10⁻²³) ≈ 0.96 K = **960 mK**. At 100 mK, hf/k_BT ≈ 9.6, so the excited fraction is about e^(−9.6) ≈ 7 × 10⁻⁵: **yes**, cold enough. (This is one reason spin qubits can run warmer than transmons.)
2. Ω = 2π × 50 MHz, so t_π = π/Ω = 1/(2 × 50 MHz) = **10 ns**, and RX(π/2) takes **5 ns**.
3. Ω²/(Ω² + Δ²) = Ω²/(2Ω²) = **50%**.
4. It's done by shifting the phase of all later pulses in software (a "virtual Z"), so it takes no time and adds no error.
5. Its levels are evenly spaced, so a drive for 0 → 1 also drives 1 → 2 and higher. **Anharmonicity** (unequal spacing) lets you address just the lowest two levels.
6. About 1/ε gates: machine A about **100**, machine B about **1,000**. For deep circuits, B is more capable despite having ten times fewer qubits.
7. Criteria **6** (converting stationary to flying qubits) and **7** (transmitting flying qubits faithfully).

## Cheat sheet

| Idea | Formula or fact |
|---|---|
| Qubit | Any controllable two-level system; \|0⟩ lower, \|1⟩ upper level |
| Frequency | ΔE = h·f; sets the drive frequency and addresses the qubit |
| Thermal excitation | P(1) ≈ e^(−hf/k_BT); 5 GHz needs ≈ 10–20 mK |
| Dilution refrigerator | Reaches ≈ 10 mK; needed for superconducting and spin qubits |
| Optical pumping | Prepares atom and ion qubits regardless of temperature |
| Rabi oscillation | Resonant drive: P(1) = sin²(Ωt/2); π pulse: Ωt = π |
| Detuning | Max P(1) = Ω²/(Ω² + Δ²) |
| Virtual Z | Z rotations by shifting later pulse phases: free and perfect |
| Anharmonicity | Unequal level spacing; prevents leakage to \|2⟩ |
| Readout | Dispersive resonator (SC), fluorescence (ions/atoms), photon detectors, spin-to-charge |
| DiVincenzo | Scalable qubits, reset, coherence, universal gates, measurement (+ 2 for networking) |
| Comparing machines | Gate error, coherence/gate time, readout, connectivity, speed, feed-forward, scaling |
