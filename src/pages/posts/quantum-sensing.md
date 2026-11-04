---
layout: ../../layouts/Post.astro
title: "Quantum sensing"
description: "The quantum technology already in daily use. Why a fragile qubit makes a superb sensor, Ramsey interferometry measuring a frequency in Qiskit, the standard quantum limit and how entanglement beats it (simulated), the best waiting time when coherence is finite, atomic clocks, GPS and relativity (computed), magnetometers from SQUIDs to NV centres in diamond, atom interferometers for gravity and navigation, LIGO's squeezed light, and India's plans."
date: 2026-11-04
category: lesson
lesson: 44
---

Quantum computing fights the environment: every stray field that nudges a qubit is noise to be suppressed. **Quantum sensing turns that around.** If a qubit is so sensitive that the tiniest magnetic field, the faintest change in gravity, or the smallest shift in time disturbs it, then it can **measure** those things with extraordinary precision.

Quantum sensing is also the most mature of the quantum technologies. Atomic clocks have defined the second since 1967 and make GPS possible; SQUID magnetometers image the human brain; MRI scanners read the quantum spins of hydrogen nuclei. A new generation of sensors, using diamonds, cold atoms and entanglement, is now moving out of laboratories into navigation, medicine, mining and defence. This lesson explains the shared principle, the limits on precision, and the main kinds of sensor.

## A qubit's weakness is a sensor's strength

Almost every quantum sensor works the same way:

1. Something you want to measure (a magnetic field, an electric field, gravity, rotation, time) slightly **shifts the energy gap** between |0⟩ and |1⟩, and so the qubit's frequency.
2. In a superposition, that frequency shift makes a **relative phase** build up between |0⟩ and |1⟩: φ = Δω·t (Lesson 10).
3. **Interference** turns the phase into a probability, which you measure.

## Ramsey interferometry: H, wait, H

The standard recipe is called a **Ramsey measurement**, after Norman Ramsey (Nobel Prize 1989), and you've already seen its pieces:

- **Prepare** |0⟩ and apply H: (|0⟩ + |1⟩)/√2.
- **Wait** for time t. The unknown shift Δ adds a phase: (|0⟩ + e^(iΔt)|1⟩)/√2, up to a global phase.
- **Apply H again** and measure. The probability of 0 is cos²(φ/2), with φ = Δ·t.

Measuring P(0) many times gives φ, and dividing by t gives the frequency shift, and from it the field. Let's measure an unknown 180 kHz shift with a 1 µs wait and 2,000 shots:

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler

t = 1e-6                                   # wait 1 µs between the two pulses
true_detuning = 2 * np.pi * 180e3          # unknown to us: the field shifts the qubit by 180 kHz

def ramsey(detuning, shots=2000):
    qc = QuantumCircuit(1)
    qc.h(0)                                # superpose
    qc.rz(detuning * t, 0)                 # the field adds a phase φ = Δ·t while we wait
    qc.h(0)                                # interfere
    qc.measure_all()
    counts = StatevectorSampler(seed=11).run([qc], shots=shots).result()[0].data.meas.get_counts()
    return counts.get("0", 0) / shots      # P(0) = cos²(φ/2)

p0 = ramsey(true_detuning)
phi = 2 * np.arccos(np.sqrt(p0))           # invert P(0) = cos²(φ/2)
print(f"measured P(0) = {p0:.4f}  →  phase φ = {phi:.3f} rad  →  frequency shift = {phi / t / (2 * np.pi) / 1e3:.1f} kHz")
err = 1 / np.sqrt(2000) / t / (2 * np.pi) / 1e3   # shot noise: δφ ≈ 1/√shots
print(f"uncertainty from 2000 shots ≈ ±{err:.1f} kHz   (the true shift was 180.0 kHz)")
```

```text
measured P(0) = 0.7280  →  phase φ = 1.097 rad  →  frequency shift = 174.6 kHz
uncertainty from 2000 shots ≈ ±3.6 kHz   (the true shift was 180.0 kHz)
```

The estimate is 175 ± 4 kHz, within about one and a half error bars of the truth. Notice where the uncertainty comes from: each shot gives one random 0 or 1, so with N shots the phase is known only to about **1/√N**. That's **shot noise**, also called **projection noise**, and it's the basic limit for any sensor made of independent particles.

## The standard quantum limit, and beating it with entanglement

With N independent qubits (or N repetitions), the phase uncertainty is

> δφ ≈ 1/√N   (the **standard quantum limit**)

To halve the error, you need four times as many atoms or measurements. Entanglement can do better. If n qubits are prepared in a GHZ state (|00…0⟩ + |11…1⟩)/√2 and each picks up phase φ, the two branches differ by **nφ**: the entangled state is n times more sensitive. Repeating this with N particles in total gives

> δφ ≈ 1/N   (the **Heisenberg limit**)

Let's check both claims: first that the GHZ fringe really oscillates n times faster, then that, with the same 4,000 qubit-uses in total, the entangled strategy estimates a small phase more precisely:

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

def ghz_ramsey_p0(n, phi):
    """n entangled qubits in a GHZ state each pick up phase φ; then disentangle and read qubit 0."""
    qc = QuantumCircuit(n)
    qc.h(0)
    for q in range(n - 1): qc.cx(q, q + 1)          # (|00..0⟩ + |11..1⟩)/√2
    for q in range(n): qc.rz(phi, q)                # every qubit senses the same field
    for q in reversed(range(n - 1)): qc.cx(q, q + 1)
    qc.h(0)
    return Statevector(qc).probabilities([0])[0]

phi = 0.2
for n in [1, 2, 4, 8]:
    print(f"{n} qubit(s): P(0) = {ghz_ramsey_p0(n, phi):.4f}   cos²(n·φ/2) = {np.cos(n * phi / 2) ** 2:.4f}")

# Same total resources: 8 qubits per run, 500 runs. Estimate a small phase φ many times and compare the spread.
rng = np.random.default_rng(3)
n, runs, true_phi = 8, 500, 0.01
def estimate(k, shots):             # k = phase multiplier; measured at the steepest point of the fringe
    p0 = np.cos((k * true_phi + np.pi / 2) / 2) ** 2
    est_p0 = rng.binomial(shots, p0, size=2000) / shots
    return (2 * np.arccos(np.sqrt(est_p0)) - np.pi / 2) / k
independent = estimate(1, n * runs)          # 8 separate qubits each run: 4000 single-qubit shots
entangled = estimate(n, runs)                # one 8-qubit GHZ state each run: 500 shots, 8× the phase
print(f"\nspread of the estimate:  independent qubits {independent.std():.4f}  (1/√4000 = {1 / np.sqrt(n * runs):.4f})")
print(f"                         GHZ state          {entangled.std():.4f}  (1/(8·√500) = {1 / (n * np.sqrt(runs)):.4f})")
```

```text
1 qubit(s): P(0) = 0.9900   cos²(n·φ/2) = 0.9900
2 qubit(s): P(0) = 0.9605   cos²(n·φ/2) = 0.9605
4 qubit(s): P(0) = 0.8484   cos²(n·φ/2) = 0.8484
8 qubit(s): P(0) = 0.4854   cos²(n·φ/2) = 0.4854

spread of the estimate:  independent qubits 0.0162  (1/√4000 = 0.0158)
                         GHZ state          0.0056  (1/(8·√500) = 0.0056)
```

The GHZ probability follows cos²(nφ/2) exactly. And with identical resources, the entangled sensor's spread is 0.0056 against 0.016 for independent qubits: √8 ≈ 2.8 times better, exactly as the two limits predict.

There's a catch, which is why most practical sensors still use independent particles: a GHZ state also **decoheres n times faster**, because any noise on any qubit destroys the shared phase. In noisy conditions the advantage can vanish. A gentler form of entanglement, **spin squeezing**, which redistributes uncertainty between two quantities, gives smaller but more robust gains and is used in the best atomic clocks.

## How long should you wait?

Waiting longer accumulates more phase, so a longer wait seems better. But the qubit decoheres: after time t, the fringe's contrast shrinks like e^(−t/T2) (Lesson 32). And longer waits mean fewer repetitions per second. Balancing these:

```python
import numpy as np

T2 = 100e-6        # coherence time
total = 1.0        # one second of measuring, split into repeated Ramsey runs of length t

def field_uncertainty(t):
    """Smallest detectable frequency shift (rad/s) after `total` seconds of repeated runs of length t."""
    runs = total / t
    contrast = np.exp(-t / T2)                # decoherence shrinks the fringe
    return 1 / (t * contrast * np.sqrt(runs)) # phase noise 1/√runs, divided by how much phase per unit shift

print(" wait t     relative uncertainty (lower is better)")
best = field_uncertainty(T2 / 2)
for frac in [0.05, 0.1, 0.25, 0.5, 1.0, 2.0, 4.0]:
    print(f"{frac:5.2f}·T2        {field_uncertainty(frac * T2) / best:6.2f}")
ts = np.linspace(0.01, 5, 5000) * T2
print(f"\nbest wait time = {ts[np.argmin(field_uncertainty(ts))] / T2:.2f} × T2")
```

```text
 wait t     relative uncertainty (lower is better)
 0.05·T2          2.02
 0.10·T2          1.50
 0.25·T2          1.10
 0.50·T2          1.00
 1.00·T2          1.17
 2.00·T2          2.24
 4.00·T2         11.71

best wait time = 0.50 × T2
```

The best waiting time is **half the coherence time**. Wait much less and you waste sensitivity; wait much longer and decoherence wipes out the signal. That's why sensor designers obsess over coherence: doubling T2 lets you wait twice as long, improving sensitivity by √2 for the same total time. Dynamical decoupling (Lesson 36) is also used to extend coherence, and, cleverly, to make a sensor respond only to signals oscillating at a chosen frequency.

## Atomic clocks

An **atomic clock** is a Ramsey-type measurement run in reverse: instead of measuring an unknown frequency, it keeps a laser or microwave oscillator locked exactly to an atomic transition. Since 1967, the second has been defined as **9,192,631,770** periods of the hyperfine transition in caesium-133. Caesium fountain clocks reach fractional uncertainties of about 10⁻¹⁶.

**Optical clocks**, using transitions at hundreds of terahertz in strontium, ytterbium or single ions, are about 100 times better still, around 10⁻¹⁸: they would lose less than a second over the age of the universe. At that precision, clocks become sensors of gravity, through Einstein's **gravitational redshift**: time runs faster higher up. The same physics matters for GPS, where satellite clocks must be corrected for both special and general relativity:

```python
g, c = 9.81, 299_792_458.0               # gravity (m/s²), speed of light (m/s)

# General relativity: a clock higher up runs faster by Δf/f = g·Δh / c²
for dh in [0.01, 1.0, 1000.0]:
    print(f"raise a clock by {dh:7.2f} m  →  it runs faster by {g * dh / c**2:.2e} (fraction)")
print("best optical clocks: ≈ 1e-18, so they can feel a height change of about a centimetre\n")

# GPS satellites: orbit radius ≈ 26,560 km, speed ≈ 3.87 km/s
GM, R_earth, r_orbit, v = 3.986e14, 6.371e6, 2.656e7, 3874.0
day = 86400
special = -0.5 * v**2 / c**2 * day                      # moving clocks run slow
general = GM / c**2 * (1 / R_earth - 1 / r_orbit) * day # higher clocks run fast
print(f"GPS clock drift per day: special relativity {special * 1e6:+.1f} µs, general relativity {general * 1e6:+.1f} µs")
print(f"net {(special + general) * 1e6:+.1f} µs/day; uncorrected, positions would drift ≈ {(special + general) * c / 1000:.0f} km per day")
```

```text
raise a clock by    0.01 m  →  it runs faster by 1.09e-18 (fraction)
raise a clock by    1.00 m  →  it runs faster by 1.09e-16 (fraction)
raise a clock by 1000.00 m  →  it runs faster by 1.09e-13 (fraction)
best optical clocks: ≈ 1e-18, so they can feel a height change of about a centimetre

GPS clock drift per day: special relativity -7.2 µs, general relativity +45.7 µs
net +38.5 µs/day; uncorrected, positions would drift ≈ 12 km per day
```

Raising a clock by one centimetre changes its rate by about 1 part in 10¹⁸, which the best optical clocks can now detect: this is **relativistic geodesy**, measuring height and the shape of Earth's gravity field with clocks. And GPS would fail within a day without relativistic corrections: satellite clocks gain about 38 µs per day, which would put positions off by about 10 to 12 km per day. Every navigation system, including India's **NavIC**, depends on space-qualified atomic clocks; when the imported rubidium clocks on the first NavIC satellite failed in 2016, ISRO began developing indigenous atomic clocks. India's official time (IST) is maintained by CSIR-NPL in New Delhi using caesium clocks.

## Magnetic field sensors

**SQUIDs** (superconducting quantum interference devices) use two Josephson junctions in a superconducting loop (Lesson 38). The current through the loop oscillates with the magnetic flux through it, in steps of the flux quantum h/2e ≈ 2.07 × 10⁻¹⁵ Wb, which makes them sensitive to femtotesla fields. They've been used for decades in **magnetoencephalography (MEG)**, which maps brain activity from the tiny magnetic fields of neural currents, and in geology. They need cryogenic cooling.

**Optically pumped magnetometers (OPMs)** use a vapour of alkali atoms whose spins precess in a magnetic field, read out with lasers. They now rival SQUIDs in sensitivity without cryogenics, enabling wearable MEG helmets that let patients, including children, move during a scan.

**NV centres in diamond** are perhaps the most versatile quantum sensor. A nitrogen atom next to a missing carbon atom in a diamond crystal traps electrons whose spin has a resonance near 2.87 GHz that shifts by 28 GHz per tesla of magnetic field. They work at **room temperature**, are read out optically (they glow more brightly in one spin state), and the defect is atom-sized, so it can sit nanometres from what it measures:

```python
import numpy as np

# NV centre in diamond: its spin resonance shifts by 28 GHz per tesla of magnetic field
gamma_nv = 28e9                                  # Hz per tesla
for name, B in [("Earth's field", 50e-6), ("fridge magnet, 1 cm away", 1e-3), ("1 nanotesla change", 1e-9),
                ("brain signal outside the head (≈ 100 fT)", 1e-13)]:
    print(f"{name:41s} B = {B:8.0e} T  →  NV frequency shift {gamma_nv * B:10.3g} Hz")

# Atom interferometer gravimeter: phase φ = k_eff · g · T², with rubidium's 780 nm light
k_eff = 2 * 2 * np.pi / 780e-9                   # two photon kicks per pulse (rad per metre)
T = 0.1                                          # 100 ms between pulses
g = 9.81
print(f"\natom gravimeter phase: φ = k·g·T² = {k_eff * g * T**2:.3g} rad")
print(f"a change of g by one part in a billion shifts the phase by {k_eff * g * 1e-9 * T**2 * 1000:.2f} milliradians")
```

```text
Earth's field                             B =    5e-05 T  →  NV frequency shift    1.4e+06 Hz
fridge magnet, 1 cm away                  B =    1e-03 T  →  NV frequency shift    2.8e+07 Hz
1 nanotesla change                        B =    1e-09 T  →  NV frequency shift         28 Hz
brain signal outside the head (≈ 100 fT)  B =    1e-13 T  →  NV frequency shift     0.0028 Hz

atom gravimeter phase: φ = k·g·T² = 1.58e+06 rad
a change of g by one part in a billion shifts the phase by 1.58 milliradians
```

Earth's field shifts the NV resonance by about 1.4 MHz, and one nanotesla by 28 Hz, easily measured. Brain signals, at about 100 fT, shift it by only 3 mHz, so they need large ensembles of NV centres and long averaging, an active research goal. A single NV centre in a diamond tip can image the magnetic fields of individual molecules, nanoscale magnets and living cells. NV centres also sense temperature, electric fields and strain.

## Gravity, acceleration and rotation

Atoms are also waves (Lesson 5). In an **atom interferometer** (Kasevich and Chu, 1991), laser pulses split a cloud of cold atoms into two wave packets that travel along different paths, then recombine them, exactly like a Mach–Zehnder interferometer for light. In free fall, the phase difference is φ = k_eff·g·T², where k_eff is set by the laser wavelength and T is the time between pulses. The last lines of the code above show how large this is: about 1.6 million radians for T = 0.1 s, so a change in g of one part in a billion shifts the phase by over a milliradian, which is measurable.

Applications include:

- **Gravimetry:** mapping underground density for mineral and oil exploration, groundwater, volcano monitoring, and civil engineering (finding voids, tunnels and old mine shafts).
- **Inertial navigation:** atom accelerometers and gyroscopes can track position without satellite signals, important for submarines, aircraft and resilience against GPS jamming. Navies and transport operators have begun testing quantum inertial navigation outside the lab, including trials on ships and trains in the UK.
- **Fundamental physics:** measuring the gravitational constant, testing whether all objects fall at the same rate, and searching for dark matter.

## LIGO and squeezed light

The most sensitive measurement ever made is the detection of **gravitational waves**. In 2015, LIGO measured a change in the 4 km length of its arms of about 10⁻¹⁸ m, a thousandth of the width of a proton, caused by two black holes merging 1.3 billion light-years away (Nobel Prize 2017).

LIGO's sensitivity is limited partly by quantum noise in the laser light itself: the random arrival of photons (shot noise) and their random push on the mirrors. Since 2019, LIGO has injected **squeezed light**, a quantum state of light with less noise in one property at the expense of another, beating the standard quantum limit for a real instrument and increasing the rate of detected events by tens of percent. From 2023, frequency-dependent squeezing reduces noise across the whole detection band. It's quantum sensing beyond the standard quantum limit, in daily operation.

## Quantum sensing in India

India's National Quantum Mission names **quantum sensing and metrology** as one of four technology hubs (alongside computing, communication, and materials and devices), with goals that include high-sensitivity magnetometers, atomic clocks for precision timing and navigation, and gravimeters. Research groups at institutions such as the IITs, IISc, RRI, TIFR and NPL work on NV centres, cold-atom sensors and optical clocks, and several Indian startups are developing quantum sensors. For engineers with electronics and embedded skills, sensing is the most immediate opportunity: a quantum sensor is a physics package plus lasers, microwave sources, photodetectors and a lot of control and signal-processing electronics.

## Try it

1. In the Ramsey recipe, what does the first H do, and what does the second H do?
2. With 10,000 shots, roughly what phase uncertainty does the standard quantum limit give?
3. A 10-qubit GHZ state senses a phase φ. How does its fringe compare with a single qubit's? Why isn't GHZ sensing used everywhere?
4. A qubit has T2 = 2 ms. What waiting time gives the best Ramsey sensitivity?
5. Why do GPS satellite clocks run fast overall, even though they're moving quickly?
6. An NV centre's resonance shifts by 140 Hz. What magnetic field change caused it?
7. Why is quantum inertial navigation useful even though GPS exists?

**Answers:**

1. The first H creates the superposition (|0⟩ + |1⟩)/√2, so a relative phase can build up. The second H **interferes** the two branches, turning the phase into a measurable probability, cos²(φ/2).
2. 1/√10,000 = **0.01 rad**.
3. It oscillates **10 times faster** (cos²(10φ/2)), so it's 10 times more sensitive per run. But it also decoheres about 10 times faster, so in noisy settings the gain shrinks or disappears, and large GHZ states are hard to make.
4. About **T2/2 = 1 ms**.
5. General relativity (weaker gravity at altitude) speeds them up by about 46 µs per day, more than special relativity (their speed) slows them down, about 7 µs per day. Net: about +38 µs per day.
6. 140 Hz / 28 GHz per tesla = 5 × 10⁻⁹ T = **5 nT**.
7. GPS can be jammed, spoofed, or unavailable (underwater, underground, in tunnels or in conflict). Inertial sensors work anywhere with no external signal, and quantum versions drift far less than classical ones.

## Cheat sheet

| Idea | Formula or fact |
|---|---|
| Principle | The quantity shifts the qubit frequency; the shift builds a phase φ = Δ·t |
| Ramsey | H, wait t, H, measure: P(0) = cos²(φ/2) |
| Standard quantum limit | δφ ≈ 1/√N for N independent particles or shots |
| Heisenberg limit | δφ ≈ 1/N with entanglement (GHZ: phase × n) |
| Catch | Entangled states decohere faster; squeezing is a robust middle ground |
| Best wait | ≈ T2/2 for Ramsey with exponential decay |
| Second (since 1967) | 9,192,631,770 periods of caesium-133's hyperfine transition |
| Optical clocks | ≈ 10⁻¹⁸; feel a 1 cm height change (Δf/f = g·Δh/c²) |
| GPS relativity | +45.7 µs/day (gravity) − 7.2 µs/day (speed) = +38.5 µs/day |
| SQUID | Flux quantum h/2e; femtotesla; MEG; needs cryogenics |
| OPM | Atomic vapour magnetometers; wearable MEG, no cryogenics |
| NV centre | 2.87 GHz spin resonance, 28 GHz/T, room temperature, nanoscale |
| Atom interferometer | φ = k_eff·g·T²; gravimetry, inertial navigation |
| LIGO | 10⁻¹⁸ m arm changes; squeezed light since 2019 |
| India | NQM sensing and metrology hub; NavIC clocks; NPL keeps IST |
