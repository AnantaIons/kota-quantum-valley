---
layout: ../../layouts/Post.astro
title: "The quantum internet"
description: "Networks that share entanglement instead of copying bits. Why the job of a quantum network is to distribute Bell pairs, entanglement swapping simulated in Qiskit, quantum repeaters and why memories turn an impossible wait into a short one (computed), entanglement purification, the hardware of a network node, the experiments so far, the stages towards a full quantum internet, and what it will be used for."
date: 2026-11-04
category: lesson
lesson: 42
---

The classical internet moves bits: copy them, amplify them, store them, forward them. A **quantum internet** moves something that can't be copied: quantum states, and above all **entanglement**. It would connect quantum computers, sensors and users, enabling things no classical network can do: key distribution secured by physics over any distance, private computing on someone else's quantum computer, and linking small quantum processors into one big one.

Building it is one of the great engineering projects of this century. This lesson explains the central idea (a network that distributes Bell pairs), the key operations (entanglement swapping and purification), why **quantum repeaters** are needed and how they beat distance, what the hardware looks like, and how far experiments have come.

## The network's real job: distributing Bell pairs

You can't send a qubit down a long fibre and expect it to arrive: photons get lost (Lesson 41), and lost qubits can't be resent because the original can't be copied. But Lesson 21 showed another way to move a qubit: **teleportation**. If Alice and Bob share a Bell pair, Alice can transfer any qubit state to Bob by doing a Bell measurement and sending him **two classical bits**. The qubit itself never travels.

So a quantum network doesn't need to transmit fragile qubits reliably. It only needs to give pairs of users **shared, high-quality Bell pairs**. Once they have one, they can use it to teleport a qubit, to generate a secret key (Lesson 41's E91), or as a resource in a distributed computation. Bell pairs are interchangeable and can be made in advance, tested, and thrown away if bad. This turns an impossible task (perfectly transmitting unique states) into a manageable one (eventually succeeding at making a standard resource).

## Entanglement swapping

How do you share a Bell pair between two places too far apart for a photon to reach? Make two shorter pairs and **join** them. Suppose Alice shares a Bell pair with a middle station, and the station shares another pair with Bob. The station performs a Bell measurement on its two qubits, one from each pair, and tells Bob the result. Now **Alice and Bob** share a Bell pair, even though their qubits never interacted.

This is **entanglement swapping**, and it's teleportation in disguise: the station teleports its half of the first pair onto Bob's qubit. Let's verify it, including the classical message and Bob's correction:

```python
from qiskit import QuantumCircuit, ClassicalRegister, QuantumRegister
from qiskit.quantum_info import Statevector, state_fidelity
from qiskit_aer import AerSimulator

q = QuantumRegister(4)          # qubit 0: Alice   1, 2: the middle station   3: Bob
c = ClassicalRegister(2)
qc = QuantumCircuit(q, c)
qc.h(0); qc.cx(0, 1)            # Bell pair shared by Alice and the station
qc.h(2); qc.cx(2, 3)            # a second Bell pair shared by the station and Bob
# The station makes a Bell measurement on its two qubits (1 and 2)...
qc.cx(1, 2); qc.h(1)
qc.measure(1, c[0]); qc.measure(2, c[1])
# ...and phones Bob the two bits, which tell him which correction to apply
with qc.if_test((c[1], 1)): qc.x(3)
with qc.if_test((c[0], 1)): qc.z(3)
qc.save_density_matrix([0, 3])

res = AerSimulator(seed_simulator=5).run(qc, shots=2000).result()
target = QuantumCircuit(2); target.h(0); target.cx(0, 1)
print("station's results (all four appear):", dict(sorted(res.get_counts().items())))
print("Alice-Bob fidelity with a perfect Bell pair:", round(state_fidelity(res.data()["density_matrix"], Statevector(target)), 6))
```

```text
station's results (all four appear): {'00': 474, '01': 493, '10': 527, '11': 506}
Alice-Bob fidelity with a perfect Bell pair: 1.0
```

The station's four results each occur about a quarter of the time, and each tells Bob which Pauli correction to apply. After the correction, qubits 0 and 3 form a perfect Bell pair, with fidelity 1, on average over all 2,000 runs. Swapping can be repeated: a chain of stations, each joining its neighbours' pairs, can stretch entanglement across a continent.

## Quantum repeaters: beating the exponential

Swapping alone doesn't solve the loss problem. If you need **every** link in a chain to succeed **at the same moment**, the chance is the product of their success probabilities, which is exactly as bad as sending a photon the whole way. The trick is **quantum memory**: when a link succeeds, its qubits are **stored**, and that link waits while the others keep trying. When all links have succeeded, the stations swap, and the end-to-end pair is ready.

How much does this help? Let's count the rounds of attempts needed over 500 km and 1,000 km of fibre (0.2 dB/km), split into different numbers of segments, assuming perfect memories and swaps:

```python
import numpy as np

def expected_rounds(p, n):
    """Average rounds until ALL n independent links have succeeded at least once (each tries with prob p per round).
    With quantum memories, a link that succeeds early waits for the others."""
    if p < 1e-4:                            # tiny p: E[max of n geometric waits] ≈ (1 + 1/2 + ... + 1/n) / p
        return sum(1 / k for k in range(1, n + 1)) / p
    total, t = 0.0, 0                       # otherwise add up P(not all done after t rounds) exactly
    while True:
        term = 1 - (1 - (1 - p) ** t) ** n
        total += term
        t += 1
        if term < 1e-12:
            return total

def link_probability(km):
    return 10 ** (-0.2 * km / 10)           # fibre transmission at 0.2 dB/km

print("total distance   segments   rounds needed (each round ≈ the light travel time of one segment)")
for L in [500, 1000]:
    for n in [1, 4, 16, 64]:
        print(f"   {L:5d} km        {n:3d}        {expected_rounds(link_probability(L / n), n):12.3g}")
```

```text
total distance   segments   rounds needed (each round ≈ the light travel time of one segment)
     500 km          1               1e+10
     500 km          4                 658
     500 km         16                  13
     500 km         64                4.46
    1000 km          1               1e+20
    1000 km          4            2.08e+05
    1000 km         16                58.9
    1000 km         64                7.61
```

Sending directly over 1,000 km would take about 10²⁰ attempts. With a 1 GHz source that's thousands of years per photon. Splitting the line into 16 segments with memories, it takes about 60 rounds. The waiting time no longer grows exponentially with distance; it grows only polynomially. That's the core idea of the quantum repeater, proposed by Briegel, Dür, Cirac and Zoller in 1998.

Real repeaters are harder than this model: swaps aren't always deterministic (photonic Bell measurements succeed only 50% of the time with simple optics), detectors miss photons, and **memories decohere** while they wait, so they must hold their qubits for longer than the waiting time. Building memories that store a qubit for seconds and connect efficiently to telecom photons is the field's central challenge.

## Entanglement purification

Every step adds noise: imperfect sources, lossy optics, decaying memories, imperfect swaps. After several swaps, the end-to-end Bell pair may be too noisy to use. **Entanglement purification** (also called distillation; Bennett and colleagues, 1996) fixes this: take **two** noisy pairs shared by the same two parties, apply CNOTs locally and measure one pair, keep the other only if the measurement results agree. Surviving pairs are better than the originals. For pairs with fidelity F (here, "Werner" states with symmetric noise), one round gives:

```python
def purify(F):
    """One round of entanglement purification (BBPSSW) on two Werner pairs of fidelity F.
    Returns the fidelity of the surviving pair and the chance the round succeeds."""
    e = (1 - F) / 3
    success = F ** 2 + 2 * F * e + 5 * e ** 2
    return (F ** 2 + e ** 2) / success, success

F = 0.80
print("round   fidelity   success probability")
print(f"  0      {F:.4f}")
for r in range(1, 6):
    F, p = purify(F)
    print(f"  {r}      {F:.4f}        {p:.3f}")
```

```text
round   fidelity   success probability
  0      0.8000
  1      0.8382        0.769
  2      0.8736        0.807
  3      0.9045        0.846
  4      0.9300        0.881
  5      0.9500        0.911
```

Five rounds raise the fidelity from 0.80 to 0.95. The cost is steep: every round consumes two pairs to make one, and sometimes fails, so this took at least 2⁵ = 32 starting pairs. A full repeater architecture interleaves swapping and purification, and future "third-generation" repeaters will use quantum error-correcting codes (Lessons 33 to 35) instead, sending encoded qubits through the chain.

## What a network node needs

A useful quantum network node has to do three things well:

1. **Store qubits** in a long-lived **quantum memory**. Leading candidates: trapped ions and neutral atoms (Lesson 39), defects in diamond such as **NV centres** and **silicon-vacancy (SiV) centres**, and rare-earth ions in crystals.
2. **Talk to photons**: emit a photon entangled with the stored qubit, efficiently, often by placing the emitter inside an optical cavity.
3. **Speak telecom**: most emitters produce light at visible or near-infrared wavelengths that fibre absorbs strongly, so **frequency conversion** shifts the photons to 1,550 nm, where fibre loss is lowest.

Superconducting quantum computers face an extra hurdle: their qubits speak in microwave photons, which can't travel through warm fibre at all. **Microwave-to-optical transducers**, which convert a single microwave photon into an optical one, are an active research area, and essential for linking superconducting machines across buildings or cities.

## Experiments so far

- **2017:** China's Micius satellite distributed entangled photon pairs to ground stations 1,200 km apart (Lesson 41).
- **2021:** QuTech in Delft built the first **three-node** quantum network from NV-centre memories, and performed entanglement swapping through the middle node to entangle the two outer nodes.
- **2024:** Harvard and AWS entangled two silicon-vacancy memory nodes over **35 km** of deployed fibre in the Boston area. The same year, a team at USTC entangled quantum memories across a metropolitan network in Hefei, and QuTech linked nodes in Delft and The Hague over about 25 km.
- **2025:** Oxford researchers ran a **distributed quantum algorithm** (Grover's search) across two separate ion-trap modules linked only by photons, using teleported two-qubit gates, a first step towards networked quantum computers.

These are short links with low rates, but they show every ingredient working: memories, photonic links, swapping and teleportation.

## Stages of a quantum internet

In 2018, Stephanie Wehner, David Elkouss and Ronald Hanson described the path as a series of stages, each enabling new applications:

| Stage | What the network can do | Example uses |
|---|---|---|
| Trusted repeater network | Pass keys through trusted relay nodes | QKD backbones (in use today) |
| Prepare-and-measure | Any user can send single qubits to any other | End-to-end QKD |
| Entanglement distribution | Share Bell pairs between any two users, on demand | Device-independent QKD |
| Quantum memory | Store entanglement while operations finish | Blind computing, clock synchronisation |
| Few-qubit fault-tolerant | Small error-corrected operations at nodes | Distributed protocols, better repeaters |
| Quantum computing | Arbitrary quantum computations across the network | Distributed quantum computing |

Today's research is at the third and fourth stages; deployed networks are at the first.

## What will it be used for?

- **Long-distance secure communication:** QKD over any distance without trusting intermediate nodes, using device-independent protocols.
- **Blind quantum computing:** using a remote quantum computer without the owner learning your input, your algorithm or your output (Broadbent, Fitzsimons and Kashefi, 2009). As quantum computing moves to the cloud, this privacy could matter a lot.
- **Distributed quantum computing:** linking many small processors into one large machine, as in the Oxford experiment. Several hardware companies plan modular machines linked this way (Lessons 38 and 39).
- **Better clocks and sensors:** entangled networks of atomic clocks could measure time more precisely and robustly; entangled telescopes separated by kilometres could act as one giant instrument with much finer resolution.
- **Superdense coding:** with a pre-shared Bell pair, sending one qubit can carry two classical bits (Lesson 21).

A full quantum internet is likely decades away, but the pieces are being built now, and like the classical internet, its biggest uses may be ones nobody has thought of yet.

## Try it

1. Why does a quantum network focus on distributing Bell pairs instead of sending qubits directly?
2. In entanglement swapping, the station measures qubits 1 and 2. Which qubits end up entangled, and did they ever interact?
3. What would go wrong if Bob ignored the station's two classical bits?
4. Without memories, why doesn't splitting a link into segments help?
5. Using the repeater table, roughly how many rounds are needed for 500 km with 16 segments? Compare with direct transmission.
6. How many starting pairs (at least) does it take to produce one pair after three rounds of purification?
7. Why do superconducting quantum computers need microwave-to-optical transducers to join a quantum network?

**Answers:**

1. Lost photons can't be resent (no-cloning), and qubits can't be amplified. Bell pairs are a standard resource that can be made in advance, tested and discarded if bad; once shared, teleportation moves any qubit reliably with two classical bits.
2. **Qubits 0 and 3** (Alice and Bob). They never interacted; their entanglement came from the station's Bell measurement on their partners.
3. Without the correction, Bob's qubit would be in one of four Bell states at random, from his point of view a completely mixed state: no usable entanglement. The two bits tell him which Pauli fixes it. (It also shows why entanglement can't send information faster than light.)
4. All segments would have to succeed in the same round, so the success probability is the product of the segment probabilities, which is the same as the end-to-end transmission. Memories let successful segments wait.
5. About **13** rounds, versus about 10¹⁰ attempts directly.
6. **2³ = 8** pairs, and more on average, because rounds can fail.
7. Their qubits interact with microwave photons, which can't travel through room-temperature fibre or free space without being swamped by thermal noise. Converting to optical photons lets them use fibre networks.

## Cheat sheet

| Idea | Formula or fact |
|---|---|
| Network's job | Distribute Bell pairs; then teleport, make keys, or compute |
| Teleportation | Bell pair + Bell measurement + 2 classical bits moves a qubit (Lesson 21) |
| Entanglement swapping | Bell measurement on two pairs' inner halves entangles the outer qubits |
| No faster than light | Swapping and teleportation need classical bits to finish |
| Quantum repeater (1998) | Segments + memories + swapping: polynomial instead of exponential cost |
| Memory requirement | Must store qubits longer than the waiting time |
| Purification (1996) | Two noisy pairs → one better pair, probabilistically; F 0.80 → 0.95 in 5 rounds |
| Node needs | Quantum memory, photon interface, telecom frequency conversion |
| Memories | Ions, atoms, NV and SiV centres in diamond, rare-earth crystals |
| Transducers | Microwave ↔ optical, to network superconducting qubits |
| Milestones | Micius 2017; Delft 3-node 2021; 35 km Boston and metro links 2024; distributed Grover 2025 |
| Stages | Trusted relays → prepare-and-measure → entanglement → memory → fault-tolerant → computing |
| Uses | Secure links, blind computing, distributed QC, clocks, telescopes |
