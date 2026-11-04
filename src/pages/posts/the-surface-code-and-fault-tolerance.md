---
layout: ../../layouts/Post.astro
title: "The surface code and fault tolerance"
description: "How real quantum computers plan to reach billions of reliable operations. The surface code's grid of neighbour-only checks, errors as chains and syndromes as their endpoints, decoding by matching, the threshold theorem with a real simulation in Stim, fault tolerance when the checks themselves are noisy, magic state distillation for the T gate, what a million-qubit machine is for, and where the hardware stands."
date: 2026-11-04
category: lesson
lesson: 35
---

Lessons 33 and 34 gave you the tools: encode one logical qubit in many physical ones, measure stabilizers to get a syndrome, and decode. But the codes so far have a practical problem. The Steane code's checks connect qubits 1, 3, 5 and 7, which on a real chip might be far apart. Superconducting chips are flat grids, and each qubit can only interact with its **nearest neighbours**.

The **surface code** solves this. Every check involves only four neighbouring qubits on a square grid. It tolerates physical error rates of around 1%, among the highest of any known code, and it grows in a simple, regular way. That's why it's the code Google, IBM's early experiments and many others built their first logical qubits from. This lesson explains how it works, what "below threshold" means, how errors in the checking process itself are handled, and how big a useful fault-tolerant computer needs to be.

## The layout

Picture a d × d grid of **data qubits**. Between them, in the gaps of the grid, sit **measure qubits** (ancillas), each touching the four data qubits around it. The gaps are coloured like a chessboard: half are **Z-type** checks (the product of Z on the four neighbours) and half are **X-type** checks (the product of X). Along the edges, the checks that would stick out of the grid are cut in half, to weight 2.

Here's the smallest useful version, distance 3, with 9 data qubits (numbered 0 to 8) and 8 checks:

```text
        X01
     0 ───── 1 ───── 2
     │ Z0134 │ X1245 │ Z25
     3 ───── 4 ───── 5
 Z36 │ X3467 │ Z4578 │
     6 ───── 7 ───── 8
                X78
```

Each name lists the data qubits the check touches: Z0134 is Z₀Z₁Z₃Z₄. The top and bottom edges carry X-type half-checks, the left and right edges Z-type ones. The code needs 9 data qubits plus 8 measure qubits, 17 in total. In general a distance-d patch uses d² data qubits and d² − 1 measure qubits, about **2d²** physical qubits for one logical qubit.

Let's check it's a valid stabilizer code, and see how errors show up:

```python
import numpy as np
from qiskit.quantum_info import Pauli

# Distance-3 rotated surface code. Data qubits on a 3×3 grid:   0 1 2
#                                                               3 4 5
#                                                               6 7 8
z_checks = {"Z0134": [0, 1, 3, 4], "Z4578": [4, 5, 7, 8], "Z36": [3, 6], "Z25": [2, 5]}
x_checks = {"X1245": [1, 2, 4, 5], "X3467": [3, 4, 6, 7], "X01": [0, 1], "X78": [7, 8]}

def pauli_on(qubits, p, n=9):
    label = ["I"] * n
    for q in qubits:
        label[n - 1 - q] = p
    return Pauli("".join(label))

checks = {name: pauli_on(qs, name[0]) for name, qs in {**z_checks, **x_checks}.items()}
print("all 8 checks commute:", all(a.commutes(b) for a in checks.values() for b in checks.values()))

def rank_mod2(rows):
    rows, rank = [r.copy() for r in rows], 0
    for col in range(len(rows[0])):
        pivot = next((i for i in range(rank, len(rows)) if rows[i][col]), None)
        if pivot is None:
            continue
        rows[rank], rows[pivot] = rows[pivot], rows[rank]
        for i in range(len(rows)):
            if i != rank and rows[i][col]:
                rows[i] ^= rows[rank]
        rank += 1
    return rank

r = rank_mod2([np.concatenate([c.x, c.z]).astype(np.uint8) for c in checks.values()])
print(f"independent checks: {r}, so 9 - {r} = {9 - r} logical qubit")

def fired(err):
    return [name for name, c in checks.items() if err.anticommutes(c)] or ["none"]

for qs in [[4], [0], [1, 4], [1, 4, 7]]:
    print(f"X on qubits {str(qs):10s} → checks that fire: {', '.join(fired(pauli_on(qs, 'X')))}")
```

```text
all 8 checks commute: True
independent checks: 8, so 9 - 8 = 1 logical qubit
X on qubits [4]        → checks that fire: Z0134, Z4578
X on qubits [0]        → checks that fire: Z0134
X on qubits [1, 4]     → checks that fire: Z4578
X on qubits [1, 4, 7]  → checks that fire: none
```

The 8 checks commute and are independent, leaving 9 − 8 = 1 logical qubit. Now look at the error patterns:

- An X error on the **middle** qubit 4 fires the **two** Z-checks next to it.
- An X error on the **corner** qubit 0 fires only **one**. Its other neighbour would be outside the grid.
- X errors on qubits 1 and 4, a short chain, fire only **one** check, Z4578, at the chain's lower end. The upper end has run into the top edge.
- X errors on 1, 4 and 7, a chain running **all the way** from the top edge to the bottom edge, fire **nothing**. This is a logical X: an undetectable change to the stored data.

## Errors are chains, syndromes are endpoints

That pattern is the heart of the surface code. Think of each X error as a short line segment through a data qubit, linking the two Z-checks on either side of it. A chain of errors links up into a path, and each check along the path sees **two** flips, which cancel. Only the checks at the **two ends** of the chain see an odd number of flips and fire. These fired checks are called **defects**.

So the syndrome doesn't show you the errors, only where error chains **end**. The decoder's job is to guess which chains most likely caused those endpoints, and the most likely explanation is usually the **shortest** set of chains that pairs every defect with another defect, or with the edge of the grid. Finding that shortest pairing is a classic problem in computer science called **minimum-weight perfect matching**, and it can be solved efficiently. The open-source decoder **PyMatching** does exactly this.

When does decoding fail? When the decoder's chosen chains, combined with the real error chains, form a path that **stretches from one edge to the opposite edge**. That's a logical operator, like X₁X₄X₇ above. To make that happen by accident, noise has to create a chain covering about half the patch, at least (d + 1)/2 errors lined up. That's why a bigger patch is safer: the chance of (d + 1)/2 errors conspiring falls like p^((d+1)/2).

## The threshold, simulated

Here's the most important experiment in error correction, done in simulation. We'll take surface code patches of distance 3, 5 and 7, run d rounds of syndrome measurement with **every** operation noisy (gates, measurements, resets, idle qubits, all with error probability p), decode with matching, and count how often the logical qubit ends up wrong.

The full circuit has hundreds of noisy operations, far too many for a state-vector simulator, but it's all Clifford gates and Pauli noise, so the stabilizer simulator **Stim** (Lesson 34) handles it in seconds. You can install both tools with `pip install stim pymatching`:

```python
import stim, pymatching
import numpy as np

def logical_error_rate(d, p, shots=100_000):
    """Simulate d rounds of a distance-d surface code memory with circuit noise p, decode with matching."""
    circuit = stim.Circuit.generated(
        "surface_code:rotated_memory_z", distance=d, rounds=d,
        after_clifford_depolarization=p, before_round_data_depolarization=p,
        before_measure_flip_probability=p, after_reset_flip_probability=p)
    sampler = circuit.compile_detector_sampler(seed=7)
    detections, flips = sampler.sample(shots, separate_observables=True)
    decoder = pymatching.Matching.from_detector_error_model(circuit.detector_error_model(decompose_errors=True))
    guesses = decoder.decode_batch(detections)
    return np.mean(guesses[:, 0] != flips[:, 0])

print("physical p    d = 3      d = 5      d = 7")
for p in [0.002, 0.004, 0.006, 0.008, 0.010]:
    print(f"  {p:.3f}     " + "   ".join(f"{logical_error_rate(d, p):.5f}" for d in [3, 5, 7]))
```

```text
physical p    d = 3      d = 5      d = 7
  0.002     0.00311   0.00113   0.00019
  0.004     0.01142   0.00709   0.00449
  0.006     0.02380   0.02374   0.01959
  0.008     0.03960   0.04888   0.05268
  0.010     0.05871   0.08497   0.10267
```

Read the table row by row, and watch what happens as the patch grows:

- At **p = 0.2%**, bigger is much better: the logical error drops from 0.31% (d = 3) to 0.11% (d = 5) to 0.019% (d = 7). Each step up in distance divides the error by a factor of about 3 to 6.
- At **p = 0.4%**, bigger is still better, but the gains are smaller.
- At **p = 0.6%**, the three distances are almost tied.
- At **p = 0.8% and 1.0%**, bigger is **worse**: more qubits means more places for errors, and the code can't keep up.

The crossover point, about 0.6 to 0.7% for this noise model, is the **threshold**. This is the **threshold theorem** in action, first proved in the late 1990s by several groups (Aharonov and Ben-Or; Knill, Laflamme and Zurek; Kitaev): **if the physical error rate is below a threshold, logical errors can be made as small as you like by making the code bigger.** Below threshold, the logical error rate behaves roughly like:

> p_L ≈ A · (p / p_th)^((d+1)/2)

The ratio p_th / p is often called **Λ** (lambda). Every time d increases by 2, the logical error rate falls by a factor of about Λ. Getting Λ comfortably above 1 is the central goal of every hardware team working on error correction.

## Google's Willow: below threshold for real

In December 2024, Google published exactly this experiment on real hardware, with its 105-qubit **Willow** chip. They ran surface code memories of distance 3, 5 and 7 (the largest using 101 qubits) and found the logical error per round of checks fell by a factor of **Λ ≈ 2.1** at each step up in distance. At distance 7, the logical qubit lost its information about **2.4 times more slowly than the best single physical qubit on the chip**. For the first time, a quantum code was clearly getting better as it got bigger, and outlasting its own components.

They also decoded in **real time**: the decoder kept up with the chip's roughly 1-microsecond measurement cycle, which a real computation will need, since corrections must be known before the next logical operation. (Lesson 31 lists Willow's other milestones.)

## Fault tolerance: when the checks are noisy too

In the simulation above, the measurements themselves were noisy, and the code still worked. That's not automatic. It takes care, and it's what the word **fault tolerance** means: a design in which **any single fault**, anywhere in the circuit, causes at most a correctable amount of damage.

Three ideas make the surface code fault-tolerant:

1. **Repeat the measurements.** A misread check looks exactly like a real error. But a real error stays put, while a measurement error appears in one round and vanishes in the next. So the code measures all checks over and over (d rounds is typical), and the decoder looks at **changes** in the syndrome between rounds. Measurement errors then become chains in **time**, and matching works on a 3D grid of space and time, which is what the Stim simulation did.
2. **Order the gates carefully.** Each measure qubit does four CNOTs with its neighbours. An error on the measure qubit halfway through can spread to two data qubits (a so-called **hook error**). Choosing the order of the four CNOTs makes sure such a pair runs **along** the direction that doesn't shorten the path between opposite edges, so it can't reduce the code's distance.
3. **Keep corrections in software.** You don't actually need to apply X and Z corrections to the qubits. The classical controller just remembers them (this is called the **Pauli frame**) and reinterprets later measurement results accordingly, saving gates and time.

## Logical gates, and the problem with T

Storing a qubit isn't enough; we must compute with it. On the surface code:

- **Logical X and Z** are free: they're just updates to the Pauli frame.
- **Logical CNOT** is done by **lattice surgery**: two patches are temporarily merged along an edge by measuring new checks across the seam, then split again. Every step uses only nearest-neighbour operations.
- **Logical H and S** use similar patch manipulations, with a bit more overhead.

That gives the Clifford gates, which Lesson 17 showed are not enough for universal computation (and Lesson 34's Eastin–Knill theorem says no code gets everything transversally). The missing ingredient is the **T gate**.

The standard solution is to make a special resource state, the **magic state** |T⟩ = T|+⟩, and use it to apply T by **gate teleportation**: a short Clifford circuit plus a measurement consumes one |T⟩ and applies T to a data qubit. The catch is that magic states made directly are only as good as the physical hardware, around 10⁻³ error, far too noisy.

So they're purified by **magic state distillation** (Bravyi and Kitaev, 2005). The most famous protocol takes **15** noisy magic states and, using only Clifford operations and a code built from Lesson 34's ideas, outputs **one** much better one, with error about **35p³**:

```python
p = 1e-3                                     # error rate of a raw, noisy T state
print(f"raw T state:      error {p:.1e}")
for rnd in [1, 2]:
    p = 35 * p ** 3                          # 15 noisy T states in, 1 better one out
    print(f"after round {rnd}:    error {p:.1e}   (cost: {15 ** rnd} raw states each)")
```

```text
raw T state:      error 1.0e-03
after round 1:    error 3.5e-08   (cost: 15 raw states each)
after round 2:    error 1.5e-21   (cost: 225 raw states each)
```

Two rounds turn a 10⁻³ state into one with error around 10⁻²¹, far better than any algorithm needs. But the cost is huge: 225 raw states, and a lot of space and time, for each T gate. In many designs, magic state "factories" take up a large share of the whole machine. Newer techniques, such as **magic state cultivation** (Gidney, Shutty and Jones, 2024), grow good magic states more cheaply, and reducing this cost is one of the most active topics in the field.

## How big must a useful machine be?

Now we can answer a question from Lesson 28: why do resource estimates for breaking RSA talk about **a million** qubits?

Suppose an algorithm runs about a billion logical operations. Then each logical operation should fail with probability around 10⁻¹² or less. Using the formula p_L ≈ 0.03 (p/p_th)^((d+1)/2) with a threshold of 1%, we can work out the distance, and therefore the number of physical qubits per logical qubit:

```python
def distance_needed(p, target, p_th=0.01, A=0.03):
    """Smallest odd d with A·(p/p_th)^((d+1)/2) below the target logical error rate."""
    d = 3
    while A * (p / p_th) ** ((d + 1) / 2) > target:
        d += 2
    return d

target = 1e-12            # roughly what a billion-operation algorithm needs per logical operation
print("physical p   distance d   physical qubits per logical qubit (≈ 2d²)")
for p in [5e-3, 2e-3, 1e-3, 5e-4, 1e-4]:
    d = distance_needed(p, target)
    print(f"  {p:.0e}         {d:3d}            {2 * d * d:6,d}")
```

```text
physical p   distance d   physical qubits per logical qubit (≈ 2d²)
  5e-03          69             9,522
  2e-03          29             1,682
  1e-03          21               882
  5e-04          17               578
  1e-04          11               242
```

At a physical error rate of 10⁻³, typical of good hardware today, each logical qubit needs a distance-21 patch, about 900 physical qubits. An algorithm with a few thousand logical qubits, plus magic state factories and space for routing, quickly reaches the millions. Notice how sharply the cost depends on hardware quality: cutting physical errors from 10⁻³ to 10⁻⁴ shrinks each logical qubit almost **four times**. Better physical qubits and better codes multiply together.

Real estimates have fallen steadily as these techniques improved. In 2019, Gidney and Ekerå estimated that factoring a 2048-bit RSA number would need about **20 million** noisy qubits running for about 8 hours. In 2025, Gidney revised that to **under one million** qubits running for **under a week**, assuming 0.1% gate errors and a 1-microsecond cycle. No machine that size exists yet, but the target is now concrete.

## Where things stand

As of 2026, error correction has moved from theory to working experiments on several platforms:

- **Google (superconducting):** below-threshold surface code memory with Willow (2024), as described above.
- **Harvard, MIT and QuEra (neutral atoms):** in 2023 they ran circuits on up to **48 logical qubits**, moving atoms around with laser tweezers to connect distant qubits, which suits codes with long-range checks.
- **Quantinuum (trapped ions):** high-fidelity logical qubits and logical operations on its H-series and Helios machines, including work with Microsoft entangling 12 logical qubits in 2024.
- **IBM (superconducting):** has bet on **qLDPC codes** (Lesson 34's [[144, 12, 12]] "gross" code), which need far fewer physical qubits per logical qubit, and has announced a roadmap to a fault-tolerant machine called **Starling**, targeted for 2029.
- **Amazon (cat qubits):** its **Ocelot** chip (2025) uses qubits that are naturally protected against bit flips, so the code only needs to fix phase flips, cutting the overhead.

The pattern is the same everywhere: logical qubits that genuinely outperform physical ones exist, and the race now is to make many of them, connect them, and run logical gates (especially T) fast enough for useful algorithms.

## Try it

1. How many physical qubits (data plus measure) does a distance-5 surface code patch use?
2. In the distance-3 layout, which checks fire for an X error on qubit 8?
3. An X error chain runs from the top edge to qubit 4 (errors on qubits 1 and 4). What does a matching decoder most likely do, and why is that a problem?
4. In the simulation table, at p = 0.2%, by roughly what factor did the logical error drop from d = 5 to d = 7?
5. Why can't the surface code simply measure each check once per round and trust the result?
6. Starting with magic states of error 2 × 10⁻³, what's the error after one round of 15-to-1 distillation?
7. Using the overhead table, roughly how many physical qubits would 1,000 logical qubits need at p = 10⁻³ (ignoring magic state factories)?

**Answers:**

1. d² + (d² − 1) = 25 + 24 = **49**.
2. Qubit 8 is a corner. It's in Z4578 (and in X78, but that's an X-check, which can't see X errors). So only **Z4578** fires.
3. It sees one defect (Z4578) and matches it to the nearest edge, which is the **bottom** edge, through qubit 7, so it applies X₇ (X₈ would do equally well). Combined with the real errors X₁X₄, that's X₁X₄X₇, a **logical error**. Two errors are more than a distance-3 code can fix.
4. From 0.00113 to 0.00019, a factor of about **6**. (With only about 19 failures counted at d = 7, that number is itself somewhat noisy; more shots would pin it down.)
5. Measurements are noisy too. A single misread would look like a real error and trigger a wrong correction. Repeating measurements lets the decoder tell a one-off measurement error (appears and vanishes) from a real data error (persists).
6. 35 × (2 × 10⁻³)³ = 35 × 8 × 10⁻⁹ = **2.8 × 10⁻⁷**.
7. About 1,000 × 882 ≈ **900,000** physical qubits, close to a million before counting factories and routing.

## Cheat sheet

| Idea | Formula or fact |
|---|---|
| Surface code | d × d data qubits, d² − 1 neighbour-only checks (X and Z in a chessboard) |
| Cost | ≈ 2d² physical qubits per logical qubit |
| Logical operators | Chains across the patch from one edge to the opposite edge |
| Defects | Fired checks mark the **ends** of error chains |
| Decoding | Pair up defects with shortest chains: minimum-weight perfect matching (PyMatching) |
| Threshold theorem | Below p_th, logical errors shrink as the code grows |
| Scaling | p_L ≈ A (p/p_th)^((d+1)/2); each d → d + 2 divides p_L by Λ = p_th/p |
| Surface code threshold | About 1% (≈ 0.6–1% depending on the noise model) |
| Willow (2024) | d = 3, 5, 7; Λ ≈ 2.1; logical qubit 2.4× longer-lived than the best physical one |
| Fault tolerance | Any single fault causes only correctable damage; repeat checks, order gates, Pauli frame |
| Lattice surgery | Logical CNOT by merging and splitting patches |
| Magic states | T applied by teleporting a \|T⟩ = T\|+⟩ state |
| Distillation | 15 noisy \|T⟩ → 1 with error ≈ 35p³ |
| RSA-2048 | 2019: ~20 million qubits; 2025: under 1 million qubits, under a week |
| Tools | Stim (fast stabilizer circuits), PyMatching (decoder): `pip install stim pymatching` |
