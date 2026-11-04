---
layout: ../../layouts/Post.astro
title: "Ions, atoms and photons"
description: "The other leading ways to build qubits, each explained from its physics. Trapped ions: why a static field can't hold them, the Paul trap (simulated), and gates through shared vibrations (modes computed). Neutral atoms: optical tweezers and the Rydberg blockade (simulated). Photons: the Hong–Ou–Mandel effect (simulated), loss, and measurement-based computing. Plus spins in silicon, topological qubits, and how the platforms compare."
date: 2026-11-04
category: lesson
lesson: 39
---

Lesson 38 built qubits from electrical circuits. This lesson builds them from nature's own quantum systems: individual atoms, held in place by electric fields or beams of light, and individual particles of light. These platforms have different strengths. Trapped ions hold the records for gate accuracy; neutral atoms for the number of qubits; photons for speed of travel and room-temperature operation. Each also has a hard problem it must solve to scale.

For each platform we'll cover where the qubit lives, how it's controlled and entangled, and what limits it, and we'll simulate the key physical effect that makes it work.

## Trapped ions

An **ion** is an atom with an electron removed, so it carries an electric charge, and charged particles can be pushed around with electric fields. A single ion, held in vacuum, is about as isolated from the world as anything can be, which is why ions make such clean qubits.

### Why you can't just hold an ion still

There's a catch. **Earnshaw's theorem** (1842) says no arrangement of **static** charges can hold a charged particle in stable equilibrium. A static electric field can form a saddle: it pushes the ion inwards in one direction but outwards in another, and the ion slides off.

The solution, which earned Wolfgang Paul a share of the 1989 Nobel Prize, is to make the saddle **oscillate**. A radio-frequency voltage (tens of MHz) flips the saddle back and forth: just as the ion starts sliding out along one direction, that direction becomes confining. On average, a well-chosen oscillation produces a net restoring force. The ion's motion obeys the **Mathieu equation**, and we can simulate it:

```python
import numpy as np
from scipy.integrate import solve_ivp

# An ion in a Paul trap, in dimensionless time τ: x'' = -(a - 2q·cos 2τ)·x   (the Mathieu equation)
def furthest(a, q, x0=1.0, tmax=200):
    sol = solve_ivp(lambda t, y: [y[1], -(a - 2 * q * np.cos(2 * t)) * y[0]], [0, tmax], [x0, 0], max_step=0.01)
    return np.max(np.abs(sol.y[0]))

print("field                                   furthest the ion gets (starting at 1)")
for name, a, q in [("static saddle (no oscillation)", -0.05, 0.0),
                   ("oscillating, q = 0.3", 0.0, 0.3),
                   ("oscillating, q = 0.7", 0.0, 0.7),
                   ("oscillating too hard, q = 1.0", 0.0, 1.0)]:
    print(f"{name:38s}  {furthest(a, q):10.3g}")
```

```text
field                                   furthest the ion gets (starting at 1)
static saddle (no oscillation)            1.32e+19
oscillating, q = 0.3                          1.37
oscillating, q = 0.7                          2.59
oscillating too hard, q = 1.0             4.91e+24
```

A static saddle throws the ion away (its distance grows without limit). An oscillating field with a moderate strength q keeps it within a small distance of the centre, wobbling. But oscillate too hard (q near 1 or above) and the motion becomes unstable again. Real **Paul traps** run in the stable zone, and modern ones are **surface traps**: patterned electrodes on a chip, with the ions floating about 50 µm above the surface.

### Qubits, cooling and readout

The qubit is stored in two internal states of the ion's outer electron. **Hyperfine qubits** (for example in ¹⁷¹Yb⁺ or ¹³⁷Ba⁺) use two states separated by a few GHz and are controlled with microwaves or pairs of lasers; they can keep coherence for seconds to minutes. **Optical qubits** (for example in ⁴⁰Ca⁺) use a ground state and a long-lived excited state separated by an optical frequency, controlled by a very stable laser.

Lasers also **cool** the ions' motion almost to its quantum ground state. Readout uses **fluorescence**: a laser makes one qubit state scatter many photons while the other stays dark (Lesson 37), with errors as low as 0.01% to 0.1%.

### Gates through a shared vibration

Ions in the same trap line up in a chain, kept apart by their mutual repulsion. Because they push on each other, they don't vibrate independently: the chain has collective **modes** of vibration, like the modes of a guitar string. The lowest mode is the whole chain sloshing back and forth together. Here are the equilibrium positions and mode frequencies, computed from the balance of the trap's pull and the ions' Coulomb repulsion:

```python
import numpy as np
from scipy.optimize import minimize

def chain_modes(N):
    """Axial vibration modes of N ions in a harmonic trap (frequencies in units of the trap frequency)."""
    energy = lambda x: 0.5 * np.sum(x ** 2) + sum(1 / abs(x[i] - x[j]) for i in range(N) for j in range(i))
    x = np.sort(minimize(energy, np.linspace(-1, 1, N) * N ** 0.5).x)     # equilibrium positions
    K = np.eye(N)                                                         # stiffness matrix (Hessian)
    for i in range(N):
        for j in range(N):
            if i != j:
                K[i, j] = -2 / abs(x[i] - x[j]) ** 3
                K[i, i] += 2 / abs(x[i] - x[j]) ** 3
    return np.sqrt(np.linalg.eigvalsh(K)), x

for N in [2, 3, 5]:
    freqs, x = chain_modes(N)
    print(f"{N} ions: positions {np.round(x, 2) + 0.0}   mode frequencies {np.round(freqs, 3)}")
```

```text
2 ions: positions [-0.63  0.63]   mode frequencies [1.    1.732]
3 ions: positions [-1.08  0.    1.08]   mode frequencies [1.    1.732 2.408]
5 ions: positions [-1.74 -0.82  0.    0.82  1.74]   mode frequencies [1.    1.732 2.412 3.055 3.671]
```

The centre-of-mass mode is always exactly at the trap frequency (1), the "breathing" mode at √3 ≈ 1.732, and higher modes above. These shared vibrations are the **bus** that connects the qubits. In the **Mølmer–Sørensen gate** (1999, building on Cirac and Zoller's 1995 proposal), lasers briefly push two ions with a force that depends on their qubit states, exciting the shared motion and returning it to rest. The motion is left unchanged, but the two qubits pick up a phase that depends on both of their states, producing an entangling XX rotation.

Since every ion in the chain shares the same modes, **any ion can be entangled with any other**: full connectivity, with no SWAP gates needed. Two-qubit gates are slow (typically 100 µs or more) but extremely accurate: the best now exceed **99.9%** fidelity, and single-qubit gates exceed 99.999%.

### Scaling ions

Long chains are hard to control: the mode frequencies crowd together, and gates slow down. Two strategies are used to scale:

- **QCCD architecture** (quantum charge-coupled device): a chip with many trap zones, where ions are physically **shuttled** between storage, gate and readout regions. Quantinuum's H-series and its **Helios** machine (98 qubits, 2025) use this approach.
- **Photonic interconnects:** link separate traps by entangling ions with emitted photons (Lesson 42's quantum networks), an approach pursued by IonQ and others.

## Neutral atoms

Neutral atoms have no charge, so electric fields don't hold them. Instead, they're held by tightly focused laser beams called **optical tweezers** (Arthur Ashkin shared the 2018 Nobel Prize for inventing them). An atom is attracted to the bright focus of a laser tuned below its resonance frequency. Hundreds or thousands of tweezers, created from one laser by devices that split and steer beams, hold an array of atoms in any pattern you like. In 2025, a Caltech group trapped over **6,100** atoms in one array.

Loading is random: each tweezer catches an atom only about half the time. So a camera takes a picture, and moving tweezers **rearrange** the atoms into a perfect, defect-free array in a few milliseconds. The qubits are two hyperfine ground states (for example in ⁸⁷Rb or ¹⁷¹Yb), with long coherence.

### Rydberg atoms and the blockade

Neutral atoms barely interact in their ground states. To entangle them, a laser excites an atom to a **Rydberg state**: its outer electron is lifted to a very high orbit (principal quantum number n around 50 to 100), making the atom enormous, thousands of times larger than normal. Two Rydberg atoms a few micrometres apart interact strongly, shifting the energy of the doubly excited state by an amount V.

If V is much larger than the laser's Rabi frequency Ω, the laser can excite **one** atom, but not both: the second excitation is off-resonant. This is the **Rydberg blockade** (proposed by Jaksch and colleagues in 2000). Let's simulate two atoms driven by the same laser:

```python
import numpy as np
from scipy.linalg import expm

# Two atoms, each with a ground state g and a Rydberg state r. Basis: gg, gr, rg, rr.
omega = 1.0                                       # laser Rabi frequency (sets the time unit)
flip = np.array([[0, 1], [1, 0]])
I2 = np.eye(2)
drive = 0.5 * omega * (np.kron(flip, I2) + np.kron(I2, flip))

print("interaction V/Ω   most likely to find BOTH atoms excited")
for V in [0, 1, 5, 20, 100]:
    H = drive + np.diag([0, 0, 0, V])            # V: energy cost of two Rydberg atoms side by side
    times = np.linspace(0, 4 * np.pi, 800)
    p_rr = max(abs((expm(-1j * H * t) @ [1, 0, 0, 0])[3]) ** 2 for t in times)
    print(f"      {V:5.0f}              {p_rr:.4f}")

H = drive + np.diag([0, 0, 0, 100])
t = np.pi / (np.sqrt(2) * omega)                   # half a period of the collective oscillation
psi = expm(-1j * H * t) @ [1, 0, 0, 0]
print(f"\nwith strong blockade, after t = π/(√2·Ω): P(gr) = {abs(psi[1])**2:.3f}, P(rg) = {abs(psi[2])**2:.3f}, "
      f"P(rr) = {abs(psi[3])**2:.4f}")
```

```text
interaction V/Ω   most likely to find BOTH atoms excited
          0              1.0000
          1              0.5634
          5              0.0255
         20              0.0013
        100              0.0001

with strong blockade, after t = π/(√2·Ω): P(gr) = 0.500, P(rg) = 0.500, P(rr) = 0.0000
```

With no interaction, both atoms are excited together (P(rr) reaches 1). As V grows, the doubly excited state becomes forbidden: at V = 100Ω the chance of finding both excited never exceeds 0.01%. Instead, the pair oscillates between |gg⟩ and the **entangled** state (|gr⟩ + |rg⟩)/√2, at a faster frequency √2·Ω. "Exactly one of us is excited, but not saying which" is entanglement created by the blockade. The same physics gives a CZ gate: an atom's state decides whether its neighbour can complete a 2π excitation loop, which decides whether a −1 phase appears.

### Strengths and challenges

Neutral atoms scale to large numbers of identical qubits (atoms of the same isotope are perfectly identical; there's no fabrication variation), and atoms can be **moved** during a computation to bring any pair together. That's ideal for error-correcting codes with long-range checks, and in 2023 a Harvard, MIT and QuEra team ran algorithms on up to 48 logical qubits this way (Lesson 35). The challenges are slower cycles (measurement and atom movement take milliseconds), atoms occasionally **lost** from their traps, and two-qubit fidelities around 99.5%, still improving. In 2025, groups demonstrated arrays that are continuously reloaded with fresh atoms, so a computation can run for much longer than an atom's lifetime in a trap.

## Photons

A photon can carry a qubit in its polarisation (horizontal or vertical), in which of two paths it takes, or in its arrival time. Photons have huge advantages: they move at the speed of light, they barely interact with their environment so they keep coherence well, and most of the hardware works at room temperature (except, often, the detectors). They're the only practical qubits for sending quantum information over distances (Lessons 41 and 42).

Their great weakness is the flip side of that isolation: **photons don't interact with each other**, so two-photon gates are hard. In 2001, Knill, Laflamme and Milburn (**KLM**) showed that linear optics (beam splitters and phase shifters), single-photon sources, detectors and feed-forward are enough for universal quantum computing, with gates that work only some of the time but signal when they succeed. The quantum effect that makes this possible is **two-photon interference**.

### The Hong–Ou–Mandel effect

Send two photons into the two input ports of a 50:50 beam splitter, at the same moment. If they're perfectly **identical** (same colour, polarisation, timing), they **always leave together** through the same output port, never one at each detector. Classically, you'd expect one photon at each detector half of the time. The two ways of getting "one each" (both transmitted, or both reflected) have amplitudes that cancel exactly. This was demonstrated by Hong, Ou and Mandel in 1987. Let's simulate it with photon-number states, varying how identical the photons are:

```python
import numpy as np
from scipy.linalg import expm
from itertools import product

# Four modes: port A and port B of a beam splitter, each in two "internal" versions (think: two
# polarisations). Each mode holds 0, 1 or 2 photons, so the space has 3^4 = 81 basis states.
cut, modes = 3, 4
a = np.diag(np.sqrt(np.arange(1, cut)), 1)                 # one mode's lowering operator
def op(m):                                                 # lowering operator of mode m, on all 4 modes
    mats = [np.eye(cut)] * modes
    mats[m] = a
    out = mats[0]
    for M in mats[1:]:
        out = np.kron(out, M)
    return out
A, A2, B, B2 = (op(m) for m in range(modes))               # A, B: same internal version; A2, B2: the other
splitter = expm(np.pi / 4 * ((A.T @ B - B.T @ A) + (A2.T @ B2 - B2.T @ A2)))   # a 50:50 beam splitter
vac = np.zeros(cut ** modes); vac[0] = 1
labels = list(product(range(cut), repeat=modes))           # photon numbers (A, A2, B, B2) of each basis state

def coincidence(overlap):
    """One photon enters at A; the other enters at B, overlapping the first photon's internal state by `overlap`."""
    photon2 = overlap * B.T + np.sqrt(1 - overlap ** 2) * B2.T
    out = splitter @ (A.T @ photon2 @ vac)
    return sum(abs(c) ** 2 for c, (nA, nA2, nB, nB2) in zip(out, labels) if nA + nA2 == 1 and nB + nB2 == 1)

print("how identical the photons are   chance of one photon at each detector")
for o in [0.0, 0.5, 0.8, 0.95, 1.0]:
    print(f"            {o:4.2f}                         {coincidence(o):.3f}")
```

```text
how identical the photons are   chance of one photon at each detector
            0.00                         0.500
            0.50                         0.375
            0.80                         0.180
            0.95                         0.049
            1.00                         0.000
```

Fully distinguishable photons give the classical 50%; perfectly identical ones give **zero** coincidences: the **HOM dip**. The depth of the dip measures how identical two photons are, the basic quality test for photon sources. Two-photon interference at beam splitters, followed by detection, is how photonic machines perform **Bell measurements** and entangle photons.

### Measurement-based and fusion-based computing

Instead of a sequence of gates, photonic designs typically use **measurement-based quantum computing**: first prepare a large entangled **cluster state** of many photons, then compute purely by measuring photons one at a time, choosing each measurement basis based on earlier results. **Fusion-based quantum computing** (PsiQuantum's approach) builds the cluster from small entangled resource states joined by "fusion" measurements, which are probabilistic Bell measurements. Another approach (Xanadu's) encodes qubits in pulses of squeezed light, using continuous-variable codes such as **GKP states**.

### The enemy: loss

Every mirror, fibre, chip waveguide and detector loses a few photons. Unlike other platforms, where an error changes the qubit's state, here the qubit simply disappears. If a protocol needs n photons to all arrive, and each survives with probability η, the success rate is ηⁿ, which falls exponentially with n. Error-correcting codes for photonics must tolerate loss, and the field's main engineering challenge is lower-loss components and near-deterministic photon sources. **Superconducting nanowire single-photon detectors** (SNSPDs) now detect over 95% of photons, but need cooling to a few kelvin.

Photons also starred in a quantum advantage demonstration: China's **Jiuzhang** devices (2020 onwards) performed Gaussian boson sampling, a task based on many-photon interference that's hard for classical computers (Lesson 31).

## Spins in silicon

A **quantum dot** is a tiny region in a semiconductor, defined by voltages on nanoscale electrodes, that can trap a single electron. The electron's **spin**, up or down in a magnetic field, is the qubit. Controlled with microwaves or electric fields, and read out by spin-to-charge conversion (Lesson 37), these qubits have two great promises:

- **Size and manufacturing.** A spin qubit is about 100 nm across, thousands of times smaller than a transmon, and can be made in the same 300 mm foundries that make ordinary computer chips. Intel's **Tunnel Falls** chip (2023) has 12 such qubits made on its standard production lines.
- **Warmer operation.** Some spin qubits work at around 1 K instead of 10 mK, where refrigerators have far more cooling power, making it easier to put control electronics nearby.

Silicon can be **isotopically purified** to almost pure ²⁸Si, which has no nuclear spin, removing a major source of magnetic noise and giving long coherence. The challenges are uniformity (every dot is slightly different), dense wiring, and pushing two-qubit fidelity above 99% consistently across many qubits. Related approaches use single **phosphorus donor** atoms placed in silicon, and **nitrogen-vacancy (NV) centres** in diamond, which are especially important for quantum sensing (Lesson 44).

## Topological qubits

The most ambitious approach tries to make qubits that are protected from noise **by their physics**, rather than by error correction. In certain exotic materials, theory predicts quasiparticles called **Majorana zero modes**; a qubit stored jointly in a pair of them, far apart, can't be disturbed by any local noise. Gates would be done by **braiding**: moving the quasiparticles around each other.

Microsoft has pursued this for nearly two decades. In February 2025 it announced **Majorana 1**, a chip based on indium arsenide and aluminium nanowires that it says contains topological qubits. Many physicists consider the evidence so far insufficient to confirm genuine topological protection, and earlier claims in this area (in 2018) were retracted. If it works, the payoff is large: far fewer physical qubits per logical qubit. For now, it remains the least proven platform.

## Comparing the platforms

| | Superconducting | Trapped ions | Neutral atoms | Photons | Spins in silicon |
|---|---|---|---|---|---|
| Qubit | Circuit energy levels | Electron states of an ion | Hyperfine states of an atom | Polarisation, path or time | Electron spin in a quantum dot |
| Two-qubit gate | Cross-resonance or CZ, ≈ 30–500 ns | Shared vibration (MS gate), ≈ 100 µs | Rydberg blockade, ≈ 0.2–1 µs | Probabilistic fusion or interference | Exchange interaction, ≈ 10–100 ns |
| Best 2q fidelity | ≈ 99.7–99.9% | ≈ 99.9%+ | ≈ 99.5% | Limited mainly by loss | ≈ 99%+ |
| Connectivity | Nearest neighbours | All-to-all within a trap | Reconfigurable by moving atoms | Set by the optical network | Nearest neighbours |
| Temperature | ≈ 10 mK | Room-temperature vacuum system (cooled ions) | Room-temperature vacuum system (cooled atoms) | Room temperature (detectors cold) | ≈ 10 mK to 1 K |
| Main scaling challenge | Wiring and fridge space | Speed, many-zone traps | Speed, atom loss | Loss, source efficiency | Uniformity, wiring |
| Players | IBM, Google, Rigetti, IQM | Quantinuum, IonQ, AQT | QuEra, Pasqal, Atom Computing, Infleqtion | PsiQuantum, Xanadu, Quandela | Intel, Diraq, Quantum Motion |

Which will win? Probably more than one. Large computers may use one platform for processing and photons to connect modules; sensing (Lesson 44) and communication (Lessons 41 to 43) already favour different systems. For anyone entering the field, the core ideas you've learned in this course apply to all of them: they're all qubits, gates, measurements and noise, described by the same mathematics.

## Try it

1. Why can't a static electric field trap an ion, and how does a Paul trap get around this?
2. For a chain of ions, which mode is always exactly at the trap frequency? What's the next mode's frequency?
3. Why can trapped ions do a two-qubit gate between any pair in the chain, while superconducting qubits usually can't?
4. In the Rydberg simulation, what state do two atoms reach under strong blockade after time π/(√2·Ω)? Why is it entangled?
5. Two photons in a HOM experiment have 90% overlap (in amplitude). What coincidence probability do you expect, using (1 − overlap²)/2?
6. A photonic protocol needs 20 photons to all survive, each with 95% transmission. What's the success probability?
7. Give two reasons spin qubits in silicon are attractive for scaling.

**Answers:**

1. Earnshaw's theorem: static fields can only make a saddle, which pushes the ion out in some direction. A Paul trap makes the saddle **oscillate** at radio frequency, so on average the ion feels a restoring force in every direction.
2. The **centre-of-mass** mode, at exactly the trap frequency; the next (breathing) mode is at **√3 ≈ 1.732** times the trap frequency.
3. All ions share the same vibrational modes, so any pair can be coupled through the shared motion. Superconducting qubits are linked by fixed wiring to their neighbours only.
4. **(|gr⟩ + |rg⟩)/√2**, with essentially zero chance of |rr⟩. It's entangled because measuring one atom instantly determines the other: if one is excited, the other isn't. Neither atom alone has a definite state.
5. (1 − 0.81)/2 = **0.095**, about 9.5%.
6. 0.95²⁰ ≈ **0.36**, so only about a third of attempts succeed, which is why loss is photonics' main enemy.
7. Any two of: they're tiny (about 100 nm); they can be made in existing semiconductor foundries; some can work at around 1 K, where there is more cooling power; isotopically pure ²⁸Si gives long coherence.

## Cheat sheet

| Idea | Formula or fact |
|---|---|
| Earnshaw's theorem | No static field configuration traps a charge stably |
| Paul trap | Oscillating (RF) saddle; stable for moderate q (Mathieu equation) |
| Ion qubits | Hyperfine (GHz, microwaves/Raman) or optical (THz, laser) |
| Ion chain modes | Centre of mass at ω, breathing at √3·ω, …: the shared bus |
| Mølmer–Sørensen gate | State-dependent push on the shared motion → XX entangling gate |
| Ions: strengths | Highest fidelities (> 99.9%), all-to-all connectivity |
| QCCD | Shuttle ions between zones of a chip trap (Quantinuum) |
| Optical tweezers | Focused lasers hold atoms; rearranged into defect-free arrays |
| Rydberg blockade | Strong V stops double excitation → (\|gr⟩ + \|rg⟩)/√2, CZ gates |
| Neutral atoms: strengths | Thousands of identical qubits, movable connectivity |
| Photon qubits | Polarisation, path, time bin; room temperature, ideal for networks |
| KLM (2001) | Linear optics + detection + feed-forward → universal (probabilistic gates) |
| HOM effect | Identical photons at a 50:50 splitter leave together; coincidence = (1 − overlap²)/2 |
| Photonic computing | Measurement-based / fusion-based on cluster states; loss is the enemy (ηⁿ) |
| Spin qubits | Electron spin in a quantum dot; ≈ 100 nm, foundry-made, ²⁸Si for coherence |
| Topological | Majorana modes, braiding; Microsoft's Majorana 1 (2025) still debated |
