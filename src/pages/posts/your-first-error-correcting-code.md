---
layout: ../../layouts/Post.astro
title: "Your first error-correcting code"
description: "How to protect a qubit you're not allowed to copy or look at. The classical repetition code and why it works, the three obstacles for qubits, the 3-qubit bit-flip code with parity checks and syndromes, a full correct-and-verify cycle in Qiskit, how measuring the syndrome turns messy errors into clean ones, the phase-flip code, and Shor's 9-qubit code that fixes any single-qubit error."
date: 2026-11-04
category: lesson
lesson: 33
---

Lesson 32 ended with a hard fact: at an error rate of ε per gate, you can run only about 1/ε gates before the answer is mostly noise. Today's best gates give a few thousand. Useful algorithms need billions. Better hardware alone won't close that gap.

Classical computers faced the same problem decades ago, and solved it with **redundancy**: store information more than once, and use the extra copies to detect and fix mistakes. Your phone does this constantly, in its memory, its Wi-Fi and its storage. This lesson shows how to do the same for qubits, which turns out to be surprisingly subtle. You'll build a real quantum error-correcting code, watch it fix errors in Qiskit, and then see the 9-qubit code that first proved quantum error correction is possible.

## The classical idea: repeat and vote

The simplest classical code is the **repetition code**. To send one bit, send three copies: 0 becomes 000, and 1 becomes 111. If noise flips each bit independently with probability p, the receiver takes a **majority vote**. The vote is wrong only if two or three of the copies flipped:

> P(fail) = 3p²(1 − p) + p³ = 3p² − 2p³

Let's check that formula with a million simulated messages:

```python
import numpy as np
rng = np.random.default_rng(1)

print("   p      one bit    3 copies + majority vote   formula 3p² - 2p³")
for p in [0.001, 0.01, 0.1, 0.3, 0.5]:
    flips = rng.random((1_000_000, 3)) < p                # which of the 3 copies got flipped
    fail = np.mean(flips.sum(axis=1) >= 2)                # the vote is wrong if 2 or 3 flipped
    print(f"{p:6.3f}    {p:.4f}         {fail:.6f}                {3 * p**2 - 2 * p**3:.6f}")
```

```text
p      one bit    3 copies + majority vote   formula 3p² - 2p³
 0.001    0.0010         0.000003                0.000003
 0.010    0.0100         0.000298                0.000298
 0.100    0.1000         0.027886                0.028000
 0.300    0.3000         0.216358                0.216000
 0.500    0.5000         0.500064                0.500000
```

Look at the first rows. With p = 1%, a single bit fails 1% of the time, but the encoded bit fails only 0.03% of the time, more than 30 times better. The reason is the **p²**: to fool the code, noise must hit **two** bits, and two independent rare events are much rarer than one.

Look at the last row too. At p = 0.5 the code does nothing, and for p above 0.5 it would make things **worse**. Redundancy only helps when the raw error rate is below some **threshold**. This idea will become central in Lesson 35.

## Three obstacles for qubits

Copy the idea to qubits, and you immediately hit three walls:

1. **You can't copy a qubit.** The no-cloning theorem (Lesson 16) forbids turning |ψ⟩ into |ψ⟩|ψ⟩|ψ⟩ for an unknown |ψ⟩.
2. **You can't look at it.** A majority vote needs to read the bits. Measuring a qubit destroys its superposition, which is the very thing we're protecting.
3. **Errors are continuous, and come in more kinds.** A classical bit can only flip. A qubit can be rotated by any small angle about any axis, and it can suffer **phase** errors (Z) that have no classical equivalent at all.

For a while in the early 1990s, many physicists thought these obstacles made quantum error correction impossible. In 1995 Peter Shor showed they were wrong. Each obstacle has an elegant way around it, and the 3-qubit code below shows the first two.

## Spreading out, not copying

Instead of copying |ψ⟩ = α|0⟩ + β|1⟩, we **entangle** it with two fresh qubits using two CNOTs:

> α|0⟩ + β|1⟩  →  α|000⟩ + β|111⟩

This is not three copies. Three copies of |+⟩ would be |+⟩|+⟩|+⟩, a product state. Encoding |+⟩ instead gives (|000⟩ + |111⟩)/√2, the entangled GHZ state. The amplitudes α and β appear only **once**, shared across all three qubits. No-cloning is respected.

The two states |000⟩ and |111⟩ are called the **logical** |0⟩ and |1⟩, often written |0_L⟩ and |1_L⟩. The three real qubits are **physical** qubits. One logical qubit, three physical ones.

## Checking differences, not values

Now suppose an X error flips one of the three qubits, say qubit 1. The state becomes α|010⟩ + β|101⟩. How do we find out which qubit flipped, without learning α and β?

The trick is to ask about **differences**, not values. Ask two yes-or-no questions:

- Do qubits 0 and 1 **agree**? (This is the parity Z₀Z₁: +1 if they agree, −1 if not.)
- Do qubits 1 and 2 agree? (The parity Z₁Z₂.)

Here's why these questions are safe. In α|010⟩ + β|101⟩, **both** branches have qubit 0 and qubit 1 disagreeing. So the answer to the first question is "no" with certainty, whatever α and β are. The measurement learns something about the **error**, and nothing about the **data**. Because the answer is the same in both branches, measuring it doesn't collapse the superposition between them.

The pair of answers is called the **syndrome**, a word borrowed from medicine: the symptoms that point to the illness.

| Qubits 0, 1 agree? | Qubits 1, 2 agree? | Diagnosis | Fix |
|---|---|---|---|
| yes | yes | no error | nothing |
| **no** | yes | qubit 0 flipped | X on qubit 0 |
| **no** | **no** | qubit 1 flipped | X on qubit 1 |
| yes | **no** | qubit 2 flipped | X on qubit 2 |

To measure a parity without measuring the data qubits, use an extra qubit, called an **ancilla**, starting in |0⟩. A CNOT from each of the two data qubits onto the ancilla flips it once for each data qubit in |1⟩, so the ancilla ends up holding their parity (0 if they agree, 1 if not). Measure the ancilla, and you have one syndrome bit.

## The full cycle in Qiskit

Here is a complete error-correction cycle: encode an arbitrary state, hit it with an error, measure the syndrome with two ancillas, apply the fix using **classical feed-forward** (`if_test`, Lesson 19), decode, and check the result against the original state:

```python
import numpy as np
from qiskit import QuantumCircuit, ClassicalRegister, QuantumRegister
from qiskit.quantum_info import Statevector, state_fidelity
from qiskit_aer import AerSimulator

theta, phi = 1.1, 0.7                        # an arbitrary qubit state to protect
psi = QuantumCircuit(1); psi.ry(theta, 0); psi.rz(phi, 0)
target = Statevector(psi)

def bit_flip_cycle(error_on=None):
    data, anc = QuantumRegister(3, "d"), QuantumRegister(2, "a")
    syn = ClassicalRegister(2, "s")
    qc = QuantumCircuit(data, anc, syn)
    qc.ry(theta, 0); qc.rz(phi, 0)           # the state to protect, on d0
    qc.cx(0, 1); qc.cx(0, 2)                 # encode: α|000⟩ + β|111⟩
    if error_on is not None:
        qc.x(error_on)                       # an X error hits one data qubit
    qc.cx(0, 3); qc.cx(1, 3)                 # a0 = parity of d0, d1
    qc.cx(1, 4); qc.cx(2, 4)                 # a1 = parity of d1, d2
    qc.measure(anc, syn)                     # the syndrome
    with qc.if_test((syn, 0b01)): qc.x(0)    # a0 only      -> d0 flipped
    with qc.if_test((syn, 0b11)): qc.x(1)    # a0 and a1    -> d1 flipped
    with qc.if_test((syn, 0b10)): qc.x(2)    # a1 only      -> d2 flipped
    qc.cx(0, 2); qc.cx(0, 1)                 # decode back onto d0
    qc.save_density_matrix([0])
    return qc

sim = AerSimulator(seed_simulator=1)
for err in [None, 0, 1, 2]:
    res = sim.run(bit_flip_cycle(err), shots=1, memory=True).result()
    s = res.get_memory()[0]
    f = state_fidelity(res.data()["density_matrix"], target)
    print(f"error on {str(err):4s}  syndrome (a1 a0) = {s}   fidelity after correction = {f:.4f}")
```

```text
error on None  syndrome (a1 a0) = 00   fidelity after correction = 1.0000
error on 0     syndrome (a1 a0) = 01   fidelity after correction = 1.0000
error on 1     syndrome (a1 a0) = 11   fidelity after correction = 1.0000
error on 2     syndrome (a1 a0) = 10   fidelity after correction = 1.0000
```

Every syndrome matches the table (Qiskit prints the bits right to left, so a1 comes first), and in every case the decoded qubit is **exactly** the original state, fidelity 1. The code never learned α or β, never copied anything, and still fixed the error. Obstacles 1 and 2 are beaten.

## Measuring the syndrome makes errors discrete

Now obstacle 3: real errors aren't clean X flips. What if qubit 1 is rotated by a small, unwanted angle, RX(0.3)? That's a continuous error, a little bit of "flip" mixed with a lot of "nothing":

> RX(0.3) = cos(0.15)·I − i·sin(0.15)·X

After this error, the encoded state is a superposition of "no error happened" (amplitude cos 0.15) and "an X happened on qubit 1" (amplitude −i sin 0.15). Measuring the syndrome forces it to choose. With probability cos²(0.15) ≈ 97.8% the syndrome says "no error", and the state **collapses** back to the perfect encoded state. With probability sin²(0.15) ≈ 2.2% it says "qubit 1 flipped", the state collapses to a clean X error, and the fix removes it. Either way, the result is perfect:

```python
import numpy as np
from qiskit import QuantumCircuit, ClassicalRegister, QuantumRegister
from qiskit.quantum_info import Statevector, state_fidelity
from qiskit_aer import AerSimulator

theta, phi = 1.1, 0.7
psi = QuantumCircuit(1); psi.ry(theta, 0); psi.rz(phi, 0)
target = Statevector(psi)

def cycle(error):
    data, anc = QuantumRegister(3, "d"), QuantumRegister(2, "a")
    syn = ClassicalRegister(2, "s")
    qc = QuantumCircuit(data, anc, syn)
    qc.ry(theta, 0); qc.rz(phi, 0)
    qc.cx(0, 1); qc.cx(0, 2)
    error(qc)
    qc.cx(0, 3); qc.cx(1, 3)
    qc.cx(1, 4); qc.cx(2, 4)
    qc.measure(anc, syn)
    with qc.if_test((syn, 0b01)): qc.x(0)
    with qc.if_test((syn, 0b11)): qc.x(1)
    with qc.if_test((syn, 0b10)): qc.x(2)
    qc.cx(0, 2); qc.cx(0, 1)
    qc.save_density_matrix([0])
    return qc

sim = AerSimulator(seed_simulator=3)
res = sim.run(cycle(lambda qc: qc.rx(0.3, 1)), shots=10_000).result()
print("small RX(0.3) error on d1:")
print("  syndromes:", dict(sorted(res.get_counts().items())))
print(f"  predicted: '00' with prob cos²(0.15) = {np.cos(0.15)**2:.4f}, '11' with prob sin²(0.15) = {np.sin(0.15)**2:.4f}")
print(f"  fidelity after correction: {state_fidelity(res.data()['density_matrix'], target):.4f}")
res = sim.run(cycle(lambda qc: qc.z(1)), shots=1000).result()
print("Z error on d1:")
print("  syndromes:", dict(res.get_counts()))
print(f"  fidelity after correction: {state_fidelity(res.data()['density_matrix'], target):.4f}")
```

```text
small RX(0.3) error on d1:
  syndromes: {'00': 9769, '11': 231}
  predicted: '00' with prob cos²(0.15) = 0.9777, '11' with prob sin²(0.15) = 0.0223
  fidelity after correction: 1.0000
Z error on d1:
  syndromes: {'00': 1000}
  fidelity after correction: 0.2057
```

Over 10,000 runs, the syndrome split almost exactly as predicted, and the average fidelity after correction is 1.0000. This is **error discretisation**, one of the most important ideas in the field: **a code that can fix X errors automatically fixes every small rotation that's built from X**, because the syndrome measurement turns the continuous error into either "nothing" or "a clean X".

More generally, any error on one qubit, however messy, can be written as a combination a·I + b·X + c·Y + d·Z. Since Y = i·X·Z, a code that corrects both X and Z on a qubit corrects **every** possible error on that qubit. We only ever need to worry about two kinds of error.

But look at the second test. A **Z** error on qubit 1 produced syndrome 00 ("all fine") and left the data damaged, fidelity 0.21. The bit-flip code is completely blind to phase errors. A Z on any one qubit changes α|000⟩ + β|111⟩ into α|000⟩ − β|111⟩, which is a perfectly valid encoded state, just the wrong one. We need protection against Z as well.

## The phase-flip code

Here's the beautiful observation: **in the Hadamard basis, Z looks like X.** Since HZH = X, a phase flip on |+⟩ turns it into |−⟩, exactly like a bit flip turns |0⟩ into |1⟩.

So to protect against phase flips, do everything in the Hadamard basis:

- **Encode:** use the same two CNOTs, then apply H to all three qubits. The logical states become |+++⟩ and |−−−⟩.
- **Check:** instead of comparing Z values, compare X values: the parities X₀X₁ and X₁X₂. (In a circuit, that's an H on each data qubit before and after the parity check.)
- **Fix:** apply Z to the qubit the syndrome points to.

The phase-flip code fixes any single Z error, but now it's blind to X errors. Each 3-qubit code protects against one kind of error only. To protect against both, we combine them.

## Shor's 9-qubit code

Shor's idea in 1995 was to **nest** the two codes, a technique called **concatenation**:

1. First encode the qubit with the **phase-flip** code, across three qubits.
2. Then encode **each** of those three qubits with the **bit-flip** code.

That gives 3 × 3 = 9 physical qubits, arranged in three blocks of three:

> |0_L⟩ = (|000⟩ + |111⟩)(|000⟩ + |111⟩)(|000⟩ + |111⟩) / 2√2
>
> |1_L⟩ = (|000⟩ − |111⟩)(|000⟩ − |111⟩)(|000⟩ − |111⟩) / 2√2

An **X** error on any qubit is caught inside its block, by the bit-flip code's parity checks. A **Z** error on any qubit flips the sign of its block, from + to −, and that's caught by comparing the signs of the blocks with each other, which is the phase-flip code's job. A **Y** error is both at once, and gets both fixes.

Let's verify the claim that it fixes **any** single-qubit error. The decoder below uses a neat shortcut: instead of measuring syndromes, it uses Toffoli gates as built-in majority votes (a Toffoli flips the first qubit only if both of the other two say so). Real machines measure syndromes instead, as in the earlier example, but the logic is the same and this version is easy to check:

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, partial_trace, state_fidelity, random_unitary

theta, phi = 1.1, 0.7
psi = QuantumCircuit(1); psi.ry(theta, 0); psi.rz(phi, 0)
target = Statevector(psi)

def shor_encode():
    qc = QuantumCircuit(9)
    qc.ry(theta, 0); qc.rz(phi, 0)            # the state to protect, on qubit 0
    qc.cx(0, 3); qc.cx(0, 6)                  # phase-flip layer: spread over 3 blocks
    qc.h([0, 3, 6])
    for b in (0, 3, 6):                       # bit-flip layer: each block → 3 qubits
        qc.cx(b, b + 1); qc.cx(b, b + 2)
    return qc

def shor_decode(qc):
    for b in (0, 3, 6):                       # undo each block, then a majority vote
        qc.cx(b, b + 1); qc.cx(b, b + 2)
        qc.ccx(b + 2, b + 1, b)               # flip the leader if both others say so
    qc.h([0, 3, 6])
    qc.cx(0, 3); qc.cx(0, 6)
    qc.ccx(6, 3, 0)                           # majority vote across the blocks
    return qc

def fidelity_after(error):
    qc = shor_encode()
    error(qc)
    shor_decode(qc)
    rho0 = partial_trace(Statevector(qc), list(range(1, 9)))   # keep qubit 0 only
    return state_fidelity(rho0, target)

worst = min(fidelity_after(lambda qc, g=g, q=q: getattr(qc, g)(q)) for g in "xyz" for q in range(9))
print(f"all 27 single-qubit X, Y, Z errors: worst fidelity = {worst:.6f}")
U = random_unitary(2, seed=5)
print(f"a random 'messy' error on qubit 4:  fidelity = {fidelity_after(lambda qc: qc.unitary(U, [4])):.6f}")
print(f"X errors on qubits 0 and 1 (same block): fidelity = {fidelity_after(lambda qc: qc.x([0, 1])):.6f}")
print(f"Z errors on qubits 0 and 3 (two blocks):  fidelity = {fidelity_after(lambda qc: qc.z([0, 3])):.6f}")
print(f"Z errors on qubits 0 and 1 (same block): fidelity = {fidelity_after(lambda qc: qc.z([0, 1])):.6f}")
```

```text
all 27 single-qubit X, Y, Z errors: worst fidelity = 1.000000
a random 'messy' error on qubit 4:  fidelity = 1.000000
X errors on qubits 0 and 1 (same block): fidelity = 0.205749
Z errors on qubits 0 and 3 (two blocks):  fidelity = 0.464624
Z errors on qubits 0 and 1 (same block): fidelity = 1.000000
```

Read the results line by line:

- **All 27** single-qubit Pauli errors (X, Y or Z on each of the 9 qubits) are fixed perfectly.
- A **random unitary** error, a completely arbitrary messy rotation, is also fixed perfectly. That's discretisation at work: it's a combination of I, X, Y and Z, and all of those are fixable.
- **Two X errors in the same block** beat the majority vote, and the logical qubit is damaged. Two **Z** errors in **different** blocks beat the block vote. The code protects against **one** error, not two. Like the classical repetition code, its failure rate is about p² instead of p.
- The last line is a surprise: two Z errors in the **same** block do no harm at all. Z₀Z₁ leaves (|000⟩ ± |111⟩) unchanged, because both branches have qubits 0 and 1 equal. Some errors are invisible because they **don't change the encoded state**. Lesson 34 explains exactly which ones, using the language of **stabilizers**.

## What this costs, and what comes next

Shor's code proved that quantum error correction is possible, but it's expensive: 9 physical qubits for one logical qubit, plus ancillas for the syndrome measurements. Codes are summarised with the notation **[[n, k, d]]**: n physical qubits, k logical qubits, and **distance** d, the smallest number of single-qubit errors that can cause an undetected logical error. Shor's code is [[9, 1, 3]], and a code of distance d can correct up to (d − 1)/2 errors.

There's also a serious problem we've ignored: the syndrome measurement itself uses noisy gates. A faulty CNOT can spread one error into two, or the ancilla can be misread. Doing error correction in a way that doesn't make things worse is called **fault tolerance**, and it's the subject of Lesson 35.

The next three lessons build the full story:

- **Lesson 34, stabilizer codes:** a compact language that describes Shor's code, the 7-qubit Steane code, and almost every code used in practice, using lists of Pauli operators instead of state vectors.
- **Lesson 35, the surface code and fault tolerance:** the code that real hardware uses, the threshold theorem, and Google's 2024 demonstration that bigger codes really do give better logical qubits.
- **Lesson 36, error mitigation:** what to do on today's machines before full error correction is available.

## Try it

1. Using 3p² − 2p³, what's the failure rate of the 3-bit repetition code at p = 2%? How much better is it than a single bit?
2. Encode |1⟩ with the bit-flip code. What is the encoded state, and why isn't it "three copies" in any troubling sense?
3. An X error hits qubit 2 of the bit-flip code. Which parity checks fire, and what's the syndrome (a1 a0)?
4. A small rotation RX(0.2) hits qubit 0 of the bit-flip code. What's the probability the syndrome reports an error?
5. Why does the bit-flip code report "no error" when a Z hits one of its qubits?
6. In Shor's code, a Z error hits qubit 4. Which block's sign changes, and which part of the code catches it?
7. Shor's code is [[9, 1, 3]]. How many errors can it correct, and how many does it take to cause a logical error?

**Answers:**

1. 3(0.02)² − 2(0.02)³ = 0.0012 − 0.000016 ≈ **0.00118**, about 0.12%. That's about **17 times** better than 2%.
2. |111⟩. It's a basis state, so copying it is allowed (no-cloning only forbids copying **unknown** states). For a superposition, the encoding gives an entangled state like α|000⟩ + β|111⟩, not three independent copies.
3. Qubits 0 and 1 still agree, but qubits 1 and 2 don't, so only a1 fires: syndrome **10**.
4. sin²(0.1) ≈ **0.0100**, about 1%. And whichever way it goes, the corrected state is perfect.
5. Z changes only the **sign** between |000⟩ and |111⟩. Both branches still have all three qubits agreeing, so the parity checks see nothing wrong.
6. Qubit 4 is in the **middle** block (qubits 3, 4, 5), so that block changes from (|000⟩ + |111⟩) to (|000⟩ − |111⟩), or vice versa. The **phase-flip** layer, comparing block signs, catches it.
7. It corrects (3 − 1)/2 = **1** error. It takes **3** suitably placed single-qubit errors to cause an undetected logical error; 2 errors can be detected but may be "corrected" the wrong way.

## Cheat sheet

| Idea | Formula or fact |
|---|---|
| Repetition code | 0 → 000, 1 → 111; majority vote; fails with 3p² − 2p³ |
| Why it helps | Needs 2 errors to fail: p² instead of p, if p is small |
| Three obstacles | No-cloning; measurement destroys; continuous and phase errors |
| Bit-flip code | α\|0⟩ + β\|1⟩ → α\|000⟩ + β\|111⟩ (two CNOTs) |
| Parity checks | Z₀Z₁ and Z₁Z₂: compare qubits, never read them |
| Syndrome | The check results; points to the error, reveals nothing about α, β |
| Ancilla | Extra qubit that collects a parity through CNOTs and is measured |
| Discretisation | Syndrome measurement turns any small error into "none" or a clean Pauli |
| Enough to fix X and Z | Any one-qubit error = a·I + b·X + c·Y + d·Z, and Y = iXZ |
| Phase-flip code | The bit-flip code in the Hadamard basis: \|+++⟩, \|−−−⟩; checks X₀X₁, X₁X₂ |
| Shor code | Phase-flip code with each qubit bit-flip encoded: 9 qubits, fixes any single error |
| [[n, k, d]] | n physical, k logical, distance d; corrects (d − 1)/2 errors |
| Fault tolerance | Error correction must work even though its own gates are noisy (Lesson 35) |
