---
layout: ../../layouts/Post.astro
title: "Superconducting qubits and control electronics"
description: "Inside the most widely used quantum hardware, from the chip to the rack. The Josephson junction and the transmon (energy levels computed), microwave gates and DRAG pulses (simulated), cross-resonance and CZ two-qubit gates, dispersive readout and its speed-versus-accuracy trade-off, IQ mixers and FPGA control, the dilution refrigerator and its attenuators, and the engineering problems of scaling up."
date: 2026-11-04
category: lesson
lesson: 38
---

Superconducting circuits are the platform behind IBM's and Google's quantum computers, behind most cloud-accessible machines, and behind the below-threshold error correction of Lesson 35. They are also the platform where quantum computing looks most like ordinary electrical engineering: the qubits are circuits printed on a chip, controlled by microwave pulses from racks of electronics, with signals travelling through coaxial cables into a refrigerator.

This lesson follows that whole chain. We'll start with the physics of the qubit itself, compute its energy levels, simulate the pulses that drive it, and then follow the signals out through the amplifiers, mixers, FPGAs and wiring that make a working machine. If you've worked with RF, FPGAs or embedded control, a lot of this will feel familiar, and you'll see exactly where those skills are needed.

## From an LC circuit to a qubit

Some metals, such as aluminium (below about 1.2 K) and niobium (below about 9 K), become **superconductors** when cold: their electrons pair up into **Cooper pairs** that flow with zero resistance. A superconducting circuit has no energy loss from resistance, so it can hold a quantum state for a long time.

The simplest circuit, an inductor L and a capacitor C, is an oscillator with frequency f = 1/(2π√(LC)). Treated quantum mechanically, its energy levels are evenly spaced, hf apart. As Lesson 37 showed, that's useless as a qubit: a drive that flips 0 → 1 also climbs 1 → 2 → 3.

The fix is the **Josephson junction**: two superconductors separated by an insulating barrier about a nanometre thick (typically aluminium, a thin layer of aluminium oxide, and aluminium again). Cooper pairs **tunnel** through the barrier, and the junction behaves like an inductor whose inductance depends on the current through it. That **nonlinearity** makes the energy levels unevenly spaced. Brian Josephson predicted the effect in 1962 as a 22-year-old student and shared the 1973 Nobel Prize for it; the 2025 Nobel Prize in Physics went to John Clarke, Michel Devoret and John Martinis for showing in the 1980s that such circuits behave as genuine quantum objects.

A junction in parallel with a capacitor has the Hamiltonian

> H = 4E_C (n − n_g)² − E_J cos φ

where n counts Cooper pairs that have tunnelled, φ is the superconducting phase across the junction, **E_C** is the **charging energy** (set by the capacitance), **E_J** is the **Josephson energy** (set by the junction), and n_g is a stray "offset charge" from the environment that nobody controls.

## The transmon

The early version of this circuit, the **Cooper-pair box** (around 1999), had E_J similar to E_C. It worked, but its frequency jumped around with every fluctuation of stray charge, giving very short coherence times. In 2007, Jens Koch and colleagues at Yale proposed a simple fix: add a large capacitor to make E_C small, so E_J/E_C is around 50. They called it the **transmon**. Let's see why it works by solving the Hamiltonian numerically, writing it as a matrix in the basis of Cooper-pair number n:

```python
import numpy as np

def transmon_levels(EJ_over_EC, EC=0.25, ng=0.0, cut=30):
    """Energy levels (GHz) of H = 4E_C(n - n_g)² - E_J cos φ, in the basis of Cooper-pair number n."""
    n = np.arange(-cut, cut + 1)
    H = np.diag(4 * EC * (n - ng) ** 2) - 0.5 * EJ_over_EC * EC * (np.eye(len(n), k=1) + np.eye(len(n), k=-1))
    E = np.linalg.eigvalsh(H)
    return E - E[0]

def readable(ghz):
    hz = ghz * 1e9
    for unit, size in [("MHz", 1e6), ("kHz", 1e3), ("Hz", 1)]:
        if hz >= size:
            return f"{hz / size:6.1f} {unit}"
    return f"{hz:6.2f} Hz"

print("E_J/E_C    f01 (GHz)   anharmonicity (MHz)   f01 shift from stray charge")
for ratio in [1, 5, 20, 50, 100]:
    E = transmon_levels(ratio)
    f01, f12 = E[1], E[2] - E[1]
    f01_half = transmon_levels(ratio, ng=0.5)[1]          # worst-case stray charge on the island
    print(f"{ratio:6d}     {f01:7.3f}        {1000 * (f12 - f01):8.1f}            {readable(abs(f01 - f01_half)):>12s}")
```

```text
E_J/E_C    f01 (GHz)   anharmonicity (MHz)   f01 shift from stray charge
     1       1.025          -994.8               776.2 MHz
     5       1.411          -881.2               268.3 MHz
    20       2.889          -363.8                 4.4 MHz
    50       4.735          -287.3                 9.9 kHz
   100       6.811          -273.9                  6.3 Hz
```

Read the columns as E_J/E_C grows:

- **The frequency rises into the microwave range.** At E_J/E_C = 50 the qubit sits at 4.7 GHz. A good approximation is f₀₁ ≈ √(8E_J·E_C) − E_C.
- **The anharmonicity shrinks, but only slowly.** It settles near −E_C, here about −270 to −290 MHz. That's still plenty to address the 0 → 1 transition without hitting 1 → 2.
- **Sensitivity to stray charge collapses exponentially.** From hundreds of MHz at E_J/E_C = 1 to 10 kHz at 50 and a few Hz at 100.

That trade, giving up a little anharmonicity to become almost immune to charge noise, is why the transmon became the workhorse of the field. A typical transmon today has f₀₁ ≈ 4 to 6 GHz, anharmonicity ≈ −200 to −340 MHz, and T1 of about 100 to 300 µs on the best devices.

## Single-qubit gates: microwave pulses and DRAG

A single-qubit gate is a shaped microwave pulse at the qubit's frequency, as in Lesson 37's Rabi oscillations. Its length is a trade-off. Shorter is better for coherence, but a short pulse has a wide frequency spectrum, and a wide spectrum reaches the 1 → 2 transition only a couple of hundred MHz away. Two things then go wrong: population **leaks** into |2⟩, and the nearby level shifts the qubit's frequency during the pulse, causing **phase errors**.

The standard cure is **DRAG** (Derivative Removal by Adiabatic Gate, Motzoi and colleagues, 2009): add a second component on the other quadrature (the Y axis), shaped like the **derivative** of the main pulse and scaled by 1/anharmonicity. Let's simulate an X gate on a three-level transmon, with and without it:

```python
import numpy as np
from scipy.linalg import expm

alpha = 2 * np.pi * -0.25                    # anharmonicity: -250 MHz, in radians per ns
a = np.diag([1, np.sqrt(2)], k=1)            # lowering operator on levels 0, 1, 2
X_drive, Y_drive = a + a.T, 1j * (a.T - a)
H_anh = np.diag([0, 0, alpha])

def x_gate(duration, beta, steps=400):
    """Apply a Gaussian π pulse (plus a DRAG correction of strength beta) to a 3-level transmon."""
    t = np.linspace(0, duration, steps + 1)
    mid, sigma, dt = duration / 2, duration / 4, duration / steps
    g = np.exp(-((t - mid) ** 2) / (2 * sigma ** 2)) - np.exp(-((mid) ** 2) / (2 * sigma ** 2))
    omega_x = np.pi * g / (g.sum() * dt)                       # area π: a full flip
    omega_y = -beta * np.gradient(omega_x, dt) / alpha        # DRAG: the derivative on the other axis
    U = np.eye(3, dtype=complex)
    for k in range(steps):
        H = H_anh + 0.5 * omega_x[k] * X_drive + 0.5 * omega_y[k] * Y_drive
        U = expm(-1j * H * dt) @ U
    leak = abs(U[2, 0]) ** 2                                   # population sent to |2⟩ from |0⟩
    Uq = U[:2, :2]
    fid = (abs(np.trace(np.array([[0, 1], [1, 0]]) @ Uq)) ** 2 + np.trace(Uq.conj().T @ Uq).real) / 6
    return leak, 1 - fid

print("pulse      plain Gaussian            with DRAG (β = 0.5)")
print("length     leakage   gate error      leakage   gate error")
for T in [8, 12, 20, 40]:
    l0, e0 = x_gate(T, 0.0)
    l1, e1 = x_gate(T, 0.5)
    print(f"{T:3d} ns     {l0:.1e}   {e0:.1e}         {l1:.1e}   {e1:.1e}")
```

```text
pulse      plain Gaussian            with DRAG (β = 0.5)
length     leakage   gate error      leakage   gate error
  8 ns     1.9e-03   2.8e-02         4.0e-04   9.2e-04
 12 ns     2.1e-04   1.2e-02         5.0e-05   1.5e-04
 20 ns     2.7e-05   4.3e-03         6.7e-06   1.9e-05
 40 ns     1.7e-06   1.1e-03         4.3e-07   1.2e-06
```

For an 8 ns pulse, the plain Gaussian has a 2.8% gate error, unusable. With the DRAG component, the error drops to 0.09%, about 30 times better. For a 20 ns pulse, it drops from 0.4% to 0.002%. DRAG lets gates be short **and** accurate, which is why every superconducting control system uses it. Real systems calibrate the DRAG strength β for each qubit. (In this simple model, β = 0.5 cancels the phase error best, while β = 1 removes the most leakage; calibration finds the best compromise for the real device.)

## Two-qubit gates

Two transmons are coupled through a small capacitor or a coupling circuit. The two leading approaches make a two-qubit gate in quite different ways.

**Cross-resonance (IBM).** The qubits have fixed frequencies. To entangle them, you drive the **control** qubit with a microwave pulse at the **target** qubit's frequency. Through the coupling, this rotates the target about X in a direction that depends on the control's state: an interaction of the form Z⊗X. A 90° ZX rotation, plus single-qubit corrections, is a CNOT:

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Operator

# Cross-resonance: drive the control qubit at the TARGET's frequency. The result is a ZX interaction,
# exp(-i·θ/2·Z⊗X): the target rotates about X one way if the control is |0⟩, the other way if it is |1⟩.
cr = QuantumCircuit(2)
cr.rzx(np.pi / 2, 0, 1)          # a 90° ZX rotation (qubit 0 = control, qubit 1 = target)
cr.rz(-np.pi / 2, 0)             # plus two single-qubit corrections
cr.rx(-np.pi / 2, 1)

cnot = QuantumCircuit(2)
cnot.cx(0, 1)
print("ZX(90°) + two single-qubit rotations = CNOT (up to a global phase):",
      Operator(cr).equiv(Operator(cnot)))
```

```text
ZX(90°) + two single-qubit rotations = CNOT (up to a global phase): True
```

Fixed frequencies make qubits simple and stable, but neighbouring qubits must not have colliding frequencies, which constrains the chip design.

**Tunable qubits and couplers (Google and others).** Here the qubit or coupler includes a small loop (a SQUID) whose frequency can be tuned by a magnetic flux, applied with a current through an on-chip line. To make a **CZ** gate, the qubits are brought briefly into resonance so that |11⟩ interacts with the non-qubit state |20⟩, picks up a phase of −1, and returns. A **tunable coupler** between qubits switches the interaction on only during the gate, reducing crosstalk the rest of the time. IBM's newer chips also use tunable couplers.

Two-qubit gates take about 30 to 500 ns depending on the design, and the best reach errors of about 0.1 to 0.3%.

## Reading the qubit out

Each transmon is coupled to its own **readout resonator**, a microwave resonator at around 7 GHz. Because of the coupling, the resonator's frequency shifts by a small amount, ±χ, depending on the qubit's state. This is **dispersive readout**. A short microwave tone sent near the resonator frequency comes back with a slightly different phase and amplitude for |0⟩ and |1⟩. Several resonators at different frequencies can share one feedline, so one cable reads several qubits (**frequency multiplexing**).

The returning signal is tiny, a few photons, so it needs **amplifiers**. The first is a **quantum-limited amplifier** right at the mixing-chamber stage (a Josephson parametric amplifier, or a travelling-wave parametric amplifier, TWPA), which adds almost no noise. Next comes a **HEMT** transistor amplifier at 4 K, then room-temperature amplifiers.

Readout involves a classic engineering trade-off. Integrating the signal for longer averages away noise, but a qubit in |1⟩ can **decay** during the measurement and be misread as 0:

```python
import numpy as np
from scipy.special import erfc

T1 = 50e-6                                   # qubit lifetime: 50 µs

def readout_error(tau, snr_100ns):
    """snr_100ns: separation of the |0⟩ and |1⟩ signals divided by the noise, after 100 ns."""
    snr = snr_100ns * np.sqrt(tau / 100e-9)             # signal grows like τ, noise like √τ
    overlap = 0.5 * erfc(snr / (2 * np.sqrt(2)))        # the two noisy blobs overlap
    decay = 0.5 * (1 - np.exp(-tau / (2 * T1)))         # |1⟩ decays during the first half: misread
    return overlap, decay

print("integration   from noise   from T1 decay   total error")
for tau_ns in [100, 400, 800, 1200, 2000, 4000]:
    ov, dec = readout_error(tau_ns * 1e-9, 1.5)
    print(f"  {tau_ns:5d} ns     {ov:.2e}      {dec:.2e}      {ov + dec:.2e}")

taus = np.linspace(20e-9, 5e-6, 5000)
for name, snr in [("ordinary amplifier", 1.5), ("quantum-limited amplifier (3× better SNR)", 4.5)]:
    errors = [sum(readout_error(t, snr)) for t in taus]
    k = int(np.argmin(errors))
    print(f"{name}: best time ≈ {taus[k] * 1e9:.0f} ns, error {errors[k]:.1e}")
```

```text
integration   from noise   from T1 decay   total error
    100 ns     2.27e-01      5.00e-04      2.27e-01
    400 ns     6.68e-02      2.00e-03      6.88e-02
    800 ns     1.69e-02      3.98e-03      2.09e-02
   1200 ns     4.69e-03      5.96e-03      1.07e-02
   2000 ns     3.98e-04      9.90e-03      1.03e-02
   4000 ns     1.05e-06      1.96e-02      1.96e-02
ordinary amplifier: best time ≈ 1546 ns, error 9.3e-03
quantum-limited amplifier (3× better SNR): best time ≈ 250 ns, error 1.4e-03
```

With an ordinary amplifier, the best you can do is about 1.5 µs and a 0.9% error: noise dominates short readouts, decay dominates long ones. A quantum-limited amplifier triples the signal-to-noise ratio and moves the optimum to about 250 ns with 0.14% error. That's why parametric amplifiers became standard: fast, accurate readout is essential for error correction, which measures half the qubits every cycle. (Real devices also add **Purcell filters**, which stop the qubit from decaying out through its own readout line.)

## The control electronics

Every pulse starts as numbers in a computer and ends as a precisely shaped microwave burst at a qubit. Here is the typical chain.

**Pulse generation.** An arbitrary waveform generator (AWG), whose core is a fast **DAC** sampling at roughly 1 to 10 GS/s, produces two baseband signals, I and Q, at an **intermediate frequency** of around 100 MHz. An **IQ mixer** multiplies them with a **local oscillator** (LO) at, say, 4.9 GHz and adds the results, producing a tone at 5.0 GHz. The beauty of IQ mixing is that the amplitude and phase of the final microwave pulse are set entirely by the digital I and Q samples, which is how DRAG shapes and virtual Z phases are applied.

An ideal IQ mixer outputs only the wanted sideband (LO + IF). A real one with slightly unbalanced I and Q paths also leaks an unwanted **image** at LO − IF:

```python
import numpy as np

fs = 40e9                                     # simulate the analogue signals at 40 GS/s
t = np.arange(0, 400e-9, 1 / fs)              # a 400 ns window
f_lo, f_if = 4.9e9, 100e6                     # local oscillator and intermediate frequency
target = f_lo + f_if                          # we want a tone at 5.0 GHz, the qubit frequency

def mixer_output(gain_error=0.0, phase_error_deg=0.0):
    """The AWG makes I and Q at 100 MHz; an IQ mixer multiplies them with the LO and adds them."""
    phi = np.deg2rad(phase_error_deg)
    I = np.cos(2 * np.pi * f_if * t)
    Q = (1 + gain_error) * np.sin(2 * np.pi * f_if * t + phi)
    return I * np.cos(2 * np.pi * f_lo * t) - Q * np.sin(2 * np.pi * f_lo * t)

def tone_db(signal, f):
    spectrum = np.abs(np.fft.rfft(signal * np.hanning(len(signal))))
    freqs = np.fft.rfftfreq(len(signal), 1 / fs)
    return 20 * np.log10(spectrum[np.argmin(abs(freqs - f))] + 1e-12)

for name, g, p in [("perfect mixer", 0, 0), ("2% gain, 2° phase error", 0.02, 2.0)]:
    out = mixer_output(g, p)
    wanted, image = tone_db(out, target), tone_db(out, f_lo - f_if)
    print(f"{name:25s}  5.0 GHz tone: {wanted - wanted:5.1f} dB   unwanted 4.8 GHz image: {image - wanted:6.1f} dB")
```

```text
perfect mixer              5.0 GHz tone:   0.0 dB   unwanted 4.8 GHz image: -160.2 dB
2% gain, 2° phase error    5.0 GHz tone:   0.0 dB   unwanted 4.8 GHz image:  -34.0 dB
```

Just 2% gain mismatch and 2° phase error put an image only 34 dB below the wanted tone, at 4.8 GHz, which could be the frequency of a neighbouring qubit. So mixers are calibrated by pre-distorting I and Q. Increasingly, systems skip analogue mixing altogether with **direct RF synthesis**: RF system-on-chip devices (such as AMD's RFSoC) contain DACs and ADCs fast enough (several GS/s) to generate and capture microwave signals directly, with an FPGA on the same chip.

**Sequencing.** An **FPGA** plays out pulses for many qubits with nanosecond timing, keeps track of each qubit's phase (virtual Z gates are just phase updates in the FPGA), and handles **feed-forward**: reading a measurement result and choosing the next pulse within a few hundred nanoseconds. Mid-circuit measurement, teleportation-style circuits and error correction all depend on this.

**Readout processing.** The returning signal is digitised by an **ADC**, digitally mixed down to baseband, and integrated with a weighting function to produce one point in the IQ plane per measurement. A threshold (or a small classifier) turns that point into 0 or 1.

For error correction, the time budget is tight: a surface-code cycle takes about 1 µs, and the decoder must keep up. That's why real-time decoders are increasingly implemented on FPGAs or custom chips. Quantum computing companies hire many FPGA, firmware and RF engineers for exactly this layer.

## Inside the refrigerator

A **dilution refrigerator** cools by mixing two isotopes of helium (³He and ⁴He). It's built as a stack of plates, each colder than the one above:

| Stage | Temperature | What's there |
|---|---|---|
| Top plate | 300 K | Connectors, room-temperature electronics outside |
| First stage | ≈ 50 K | Radiation shields, heat sinks for cables |
| Second stage | ≈ 4 K | HEMT amplifiers, attenuators |
| Still | ≈ 1 K | Attenuators |
| Cold plate | ≈ 100 mK | Attenuators, filters |
| Mixing chamber | ≈ 10 mK | The chip, quantum-limited amplifiers, circulators |

Why so many **attenuators** on the input lines? Because a coaxial cable from room temperature carries thermal microwave noise: at 5 GHz, a 300 K line carries about 1,250 thermal photons on average. Any stray photon in a readout resonator randomly shifts the qubit's frequency and dephases it. Each attenuator absorbs most of the incoming noise, but also emits its own thermal noise at its own temperature, so they must be placed at progressively colder stages:

```python
import numpy as np

h, k_B, f = 6.626e-34, 1.381e-23, 5e9          # a 5 GHz signal line

def thermal_photons(T):
    """Average number of thermal microwave photons at frequency f and temperature T (Bose-Einstein)."""
    return 1 / np.expm1(h * f / (k_B * T))

# Each attenuator passes a fraction A of what comes in, and adds its own thermal noise times (1 - A)
stages = [("room temperature", 300, 0), ("4 K plate", 4, 20), ("100 mK plate", 0.1, 20), ("mixing chamber", 0.015, 20)]
n = thermal_photons(300)
print(f"{'stage':18s} {'attenuation':>11s}   photons arriving below it")
print(f"{'room temperature':18s} {'':>11s}   {n:10.3g}")
for name, T, dB in stages[1:]:
    A = 10 ** (-dB / 10)
    n = n * A + thermal_photons(T) * (1 - A)
    print(f"{name:18s} {dB:8d} dB   {n:10.3g}")
```

```text
stage              attenuation   photons arriving below it
room temperature                   1.25e+03
4 K plate                20 dB         28.5
100 mK plate             20 dB        0.384
mixing chamber           20 dB      0.00384
```

Sixty decibels of attenuation, spread over three cold stages, brings the noise from over a thousand photons down to a few thousandths. That's why control pulses must start strong at room temperature, and why the output (readout) lines use **circulators and isolators** instead, which let the signal out but block noise from coming back in.

## The scaling problem

Building one good transmon is solved. Building a million is not, and the obstacles are mostly engineering:

- **Wiring.** Each qubit needs one to three control lines plus a share of readout lines. Every coaxial cable carries heat into the fridge, and the mixing chamber can only remove about 10 to 20 microwatts at 20 mK. Hundreds of qubits already fill a large fridge. Solutions include flexible ribbon cables, multiplexing, and **cryo-CMOS** control chips that sit at 4 K and generate pulses close to the qubits.
- **Frequency crowding.** Every qubit needs its own frequency, distinct from its neighbours'. Junction fabrication isn't perfectly repeatable, so frequencies scatter. IBM, for example, uses laser annealing to trim individual junctions after fabrication.
- **Materials.** T1 is limited mainly by microscopic defects, called **two-level systems**, in the oxides and surfaces of the chip, which absorb energy at random frequencies. Better materials, such as tantalum instead of niobium, and cleaner fabrication have steadily raised T1.
- **Correlated errors.** Cosmic rays and natural radioactivity can deposit energy in the chip and briefly disturb many qubits at once (Lesson 32). Chips now include features to drain away this energy.
- **Modularity.** Rather than one giant chip, roadmaps connect several chips or fridges, using microwave links or conversion to optical photons (Lesson 42).

## Where things stand

As of 2026, the leading superconducting machines include IBM's **Heron** processors (133 to 156 qubits with tunable couplers), IBM's **Nighthawk** (announced in late 2025, 120 qubits in a square lattice with more connections per qubit), Google's 105-qubit **Willow**, and China's 105-qubit **Zuchongzhi 3.0**. IBM also built the 1,121-qubit **Condor** in 2023, mainly to tackle the engineering of scale, and plans a fault-tolerant machine, **Starling**, around 2029, using qLDPC codes (Lesson 34). Lesson 40 shows how to send your own circuits to IBM's hardware.

## Try it

1. A transmon has E_C/h = 300 MHz and E_J/E_C = 50. Estimate f₀₁ with √(8E_J·E_C) − E_C, and its anharmonicity.
2. Why does the transmon use a large E_J/E_C, and what does it give up?
3. In the DRAG simulation, which gets more benefit from DRAG: an 8 ns pulse or a 40 ns pulse? Why are short pulses worth this effort?
4. A cross-resonance pulse drives the control at the target's frequency. What interaction does it create?
5. In the readout model, why does the total error get worse when you integrate for 4 µs instead of 2 µs?
6. An IQ mixer has LO = 6.0 GHz and IF = 150 MHz. Where are the wanted tone and the image?
7. Why can't you just put one 60 dB attenuator at room temperature instead of 20 dB at each of three cold stages?

**Answers:**

1. E_J/h = 50 × 0.3 = 15 GHz, so √(8 × 15 × 0.3) − 0.3 = √36 − 0.3 = **5.7 GHz**. Anharmonicity ≈ −E_C ≈ **−300 MHz** (slightly more in magnitude).
2. Large E_J/E_C makes the frequency exponentially insensitive to stray charge, which gives long coherence. It gives up some **anharmonicity**, which falls towards −E_C, so pulses must be shaped more carefully.
3. The **8 ns** pulse: its error falls from 2.8% to 0.09%, while the 40 ns pulse was already fairly good. Short pulses mean more gates fit inside the coherence time.
4. A **Z⊗X** interaction: the target rotates about X in a direction that depends on the control's Z value. A 90° ZX plus single-qubit rotations gives a CNOT.
5. Noise is already small at 2 µs, but the chance that a |1⟩ decays during the measurement keeps growing with time (here to about 2% at 4 µs).
6. Wanted tone at **6.15 GHz** (LO + IF); image at **5.85 GHz** (LO − IF).
7. An attenuator emits thermal noise at **its own** temperature. One at 300 K would re-add about 1,250 × (1 − 10⁻⁶) ≈ 1,250 photons of noise. Only cold attenuators can absorb noise without adding much back.

## Cheat sheet

| Idea | Formula or fact |
|---|---|
| Superconductivity | Zero resistance: Al below ≈ 1.2 K, Nb below ≈ 9 K; Cooper pairs |
| Josephson junction | Superconductor–insulator–superconductor; nonlinear inductance |
| Hamiltonian | H = 4E_C(n − n_g)² − E_J cos φ |
| Transmon | E_J/E_C ≈ 50: charge-insensitive; f₀₁ ≈ √(8E_J·E_C) − E_C, α ≈ −E_C |
| Typical numbers | f₀₁ ≈ 4–6 GHz, α ≈ −200 to −340 MHz, T1 ≈ 100–300 µs (best) |
| DRAG | Derivative of the pulse on the other quadrature; cuts leakage and phase error |
| Cross-resonance | Drive control at target frequency → ZX → CNOT (IBM) |
| CZ with tunable coupler | Bring \|11⟩ near \|20⟩, pick up phase −1 (Google) |
| Dispersive readout | Resonator shifts by ±χ with qubit state; frequency-multiplexed feedlines |
| Readout trade-off | Longer integration: less noise, more T1 decay; quantum-limited amps help |
| Amplifier chain | JPA/TWPA at mK, HEMT at 4 K, then room temperature |
| IQ mixing | Output = LO ± IF; imbalance leaks an image; calibrate or use direct RF synthesis |
| FPGA control | ns timing, phase tracking (virtual Z), feed-forward in hundreds of ns |
| Attenuators | Spread across cold stages; 300 K line ≈ 1,250 photons at 5 GHz |
| Scaling problems | Wiring heat, frequency crowding, material defects (TLS), correlated errors, modularity |
