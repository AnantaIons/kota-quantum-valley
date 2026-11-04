---
layout: ../../layouts/Post.astro
title: "No-cloning and what quantum information is"
description: "Why no machine can copy an unknown quantum state (two short proofs), why a CNOT copies 0 and 1 but not superpositions, the limit on telling non-orthogonal states apart, density matrices for describing mixtures and parts of bigger systems, and what all this means for security, error correction and how much a qubit can carry."
date: 2026-11-04
category: lesson
lesson: 16

---

Copying is so basic to classical computing that we never think about it. Every file you open is copied from disk to memory; every message you send is copied to a server; backups are copies. Lesson 1 noted that copying a classical bit is trivial: just split the wire.

Quantum information is different in a way that shapes everything built on it. **An unknown quantum state cannot be copied.** This lesson proves that, shows exactly where a naive copier fails, and then looks at what quantum information is: what you can and can't learn about a state, how to describe uncertainty about states, and how much information a qubit can really carry.

## The no-cloning theorem

**Claim:** there is no device (no unitary U, with any amount of extra blank qubits) that takes any unknown state |ψ⟩ and a blank qubit |0⟩ and produces two copies:

> U(|ψ⟩|0⟩) = |ψ⟩|ψ⟩  for every |ψ⟩  is **impossible**.

This was proved in 1982 by Wootters and Zurek, and independently by Dieks. Here are two short proofs; either one is enough.

### Proof 1: linearity

Suppose such a U existed. It would have to copy the basis states:

```text
U|0⟩|0⟩ = |0⟩|0⟩
U|1⟩|0⟩ = |1⟩|1⟩
```

Now feed it |+⟩ = (|0⟩ + |1⟩)/√2. Because U is a matrix, it's **linear**: it acts on each term of a sum separately.

```text
U|+⟩|0⟩ = (U|0⟩|0⟩ + U|1⟩|0⟩)/√2 = (|00⟩ + |11⟩)/√2
```

But a true copy would be |+⟩|+⟩ = (|00⟩ + |01⟩ + |10⟩ + |11⟩)/2. These aren't equal; in fact the result is an entangled Bell state, not two copies of anything. **Linearity forces the copier to fail on superpositions.**

### Proof 2: inner products

Suppose U copies two states |ψ⟩ and |φ⟩. Unitaries preserve inner products (Lesson 4), so the inner product before must equal the inner product after:

```text
before:  ⟨ψ|φ⟩ · ⟨0|0⟩ = ⟨ψ|φ⟩
after:   ⟨ψ|φ⟩ · ⟨ψ|φ⟩ = ⟨ψ|φ⟩²
```

So ⟨ψ|φ⟩ = ⟨ψ|φ⟩². A number equal to its own square is 0 or 1. That means |ψ⟩ and |φ⟩ must be either **orthogonal** (inner product 0) or **the same state** (1). A copier can work for a set of mutually orthogonal states, like |0⟩ and |1⟩, but never for two states that partly overlap, like |0⟩ and |+⟩.

### Seeing it in code

The CNOT is the natural "copier": it XORs the original into a blank qubit. It works perfectly on |0⟩ and |1⟩, and fails on superpositions, exactly as the proofs say. We measure success with the **fidelity** |⟨wanted|got⟩|²: 1 for a perfect copy, 0 for the completely wrong state.

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, state_fidelity

def cnot_copy(label):
    """Try to 'copy' a one-qubit state onto a blank qubit with a CNOT."""
    original = Statevector.from_label(label)
    qc = QuantumCircuit(2)
    qc.cx(0, 1)                                     # qubit 0 = original, qubit 1 = blank |0>
    out = Statevector.from_label("0").tensor(original).evolve(qc)
    two_copies = original.tensor(original)          # what a perfect copier would make
    return round(float(state_fidelity(out, two_copies)), 3)

for label in ["0", "1", "+", "-"]:
    print(f"copying |{label}> -> fidelity with two perfect copies: {cnot_copy(label)}")
```

```text
copying |0> -> fidelity with two perfect copies: 1.0
copying |1> -> fidelity with two perfect copies: 1.0
copying |+> -> fidelity with two perfect copies: 0.5
copying |-> -> fidelity with two perfect copies: 0.0
```

On |−⟩ the "copy" has **zero** overlap with two copies of |−⟩. And note the subtle point: copying |0⟩ and |1⟩ is not cloning in the quantum sense, it's copying **classical** information. The theorem is about the superpositions in between.

### What no-cloning doesn't forbid

- **Copying known states.** If you know the state is |+⟩, just prepare another |+⟩. The theorem is about unknown states.
- **Imperfect copies.** "Approximate cloning machines" exist; the best universal one makes two copies of a qubit, each with fidelity 5/6.
- **Moving a state.** Teleportation (Lesson 21) transfers a state from one qubit to another, but destroys the original in the process. No copy is ever made.

## Why no-cloning matters

| Area | Consequence |
|---|---|
| **No faster-than-light messages** | If Bob could clone his half of a Bell pair, he could tell which basis Alice measured in by measuring many copies. No-cloning protects no-signalling (Lesson 14). |
| **Quantum key distribution** | An eavesdropper can't copy the qubits in flight and measure the copies later. She has to measure the originals and leave tracks (Lesson 41). |
| **Error correction** | You can't protect a qubit by keeping backup copies. Quantum codes spread information across many qubits **without copying it**, using entanglement (Lessons 33–35). |
| **Quantum money** | Banknotes carrying unknown quantum states can't be forged (an idea by Stephen Wiesner, around 1970, that later inspired QKD). |
| **Programming** | There's no quantum "copy-paste" or "fan-out" of a qubit. Algorithms that reuse a quantum value must recompute it. |

## You can't fully read a state either

No-cloning has a twin: **you can't perfectly tell apart two states that aren't orthogonal.** If you could, you could identify a state and then prepare as many copies as you liked, breaking no-cloning.

How well **can** you do? Suppose someone hands you either |0⟩ or |+⟩, each with probability ½, and asks which. Their overlap is |⟨0|+⟩| = 1/√2. The best possible success rate, found by Carl Helstrom in 1976, is

> P(correct) = ½ (1 + √(1 − |⟨ψ|φ⟩|²))

For |0⟩ and |+⟩ that's ½(1 + √½) ≈ **85.4%**. The best measurement is along a direction on the Bloch sphere "between" the two states (pointing away from each, at −45° and 135° in the x–z plane). Let's check:

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

# Someone gives us |0> or |+> (50/50). We measure along -45 degrees and guess.
def chance_correct(label):
    qc = QuantumCircuit(1)
    qc.ry(np.pi / 4, 0)                             # rotate so that -45 degrees becomes the z axis
    p0 = Statevector.from_label(label).evolve(qc).probabilities()[0]
    return p0 if label == "0" else 1 - p0           # outcome 0 -> guess |0>, outcome 1 -> guess |+>

best = (chance_correct("0") + chance_correct("+")) / 2
overlap = abs(Statevector.from_label("0").inner(Statevector.from_label("+")))
helstrom = 0.5 * (1 + np.sqrt(1 - overlap ** 2))
print("our measurement:", round(float(best), 4), "  Helstrom limit:", round(float(helstrom), 4))
```

```text
our measurement: 0.8536   Helstrom limit: 0.8536
```

Our measurement reaches the limit exactly. (Notice 0.8536 = cos²(π/8) again, the same number as the CHSH game in Lesson 15. That's not a coincidence; both are about measuring "between" two directions 90° apart on the sphere.) The BB84 protocol (Lesson 41) is built on this limit: it encodes bits in non-orthogonal states precisely so an eavesdropper **can't** read them reliably.

## Describing uncertainty: the density matrix

So far every state has been a vector |ψ⟩: a **pure state**. But you've met situations a vector can't describe:

- a coin toss between |0⟩ and |1⟩ (Lesson 7), which is not the same as the superposition |+⟩;
- one half of a Bell pair (Lesson 14), which on its own is completely random.

These are **mixed states**, and the tool for them is the **density matrix** ρ (rho). For a pure state, it's the outer product:

> ρ = |ψ⟩⟨ψ|

For a mixture, "state |ψᵢ⟩ with probability pᵢ", it's the weighted average:

> ρ = Σ pᵢ |ψᵢ⟩⟨ψᵢ|

Compare the superposition |+⟩ with the 50/50 coin:

```text
|+⟩⟨+| = ½ [ 1  1 ]        ½|0⟩⟨0| + ½|1⟩⟨1| = ½ [ 1  0 ]
           [ 1  1 ]                              [ 0  1 ]
```

The **diagonal** entries are the probabilities of 0 and 1: ½ and ½ in both. That's why a 0/1 measurement can't tell them apart. The **off-diagonal** entries, called **coherences**, carry the phase relationship between |0⟩ and |1⟩. The superposition has them; the coin doesn't. Dephasing (Lesson 10) is exactly the process that eats away the off-diagonal entries.

A single number tells pure from mixed: the **purity** Tr(ρ²), the sum of the diagonal of ρ². It's 1 for a pure state and smaller for a mixture (½ is the minimum for a qubit).

```python
import numpy as np
from qiskit.quantum_info import DensityMatrix, Statevector

plus = DensityMatrix(Statevector.from_label("+"))                  # pure superposition
coin = 0.5 * DensityMatrix.from_label("0") + 0.5 * DensityMatrix.from_label("1")   # 50/50 mixture

for name, rho in [("|+> superposition", plus), ("50/50 coin", coin)]:
    print(name)
    print(np.round(rho.data.real, 3))
    print("purity Tr(rho^2) =", round(float(rho.purity().real), 3))

mix = 0.9 * DensityMatrix.from_label("0") + 0.1 * DensityMatrix.from_label("1")
bloch = [round(float(np.trace(mix.data @ P).real), 3) for P in
         (np.array([[0, 1], [1, 0]]), np.array([[0, -1j], [1j, 0]]), np.array([[1, 0], [0, -1]]))]
print("90/10 mixture Bloch vector:", bloch)
```

```text
|+> superposition
[[0.5 0.5]
 [0.5 0.5]]
purity Tr(rho^2) = 1.0
50/50 coin
[[0.5 0. ]
 [0.  0.5]]
purity Tr(rho^2) = 0.5
90/10 mixture Bloch vector: [0.0, 0.0, 0.8]
```

The last line connects to Lesson 7: the Bloch vector of a density matrix is (Tr(ρX), Tr(ρY), Tr(ρZ)), and for a 90/10 mixture it sits **inside** the sphere at z = 0.8. All the rules you know carry over: probabilities are P(k) = ⟨k|ρ|k⟩, expectation values are ⟨A⟩ = Tr(ρA), and a gate U changes ρ into UρU†.

Density matrices are how real experiments and noisy simulators describe qubits, because real qubits are always a little mixed. Lessons 32 and 36 use them throughout.

## How much information does a qubit hold?

Two answers, both true, measure different things.

**To describe it: infinitely much.** A qubit's state has two continuous angles θ and φ. Writing them down exactly takes infinitely many digits.

**To read out: at most one bit.** Holevo's bound (Lesson 12) says a qubit can deliver at most one classical bit of information to whoever measures it. The continuous angles are real, but no measurement can extract them from one copy (this lesson's no-reading result, again).

There's one famous way to squeeze more out: **superdense coding**. If Alice and Bob already share a Bell pair, Alice can send **two** classical bits by sending Bob just one qubit (Lesson 21). The shared entanglement makes up the difference; Holevo's bound still holds once you count it.

The basic units of quantum information, then:

| Unit | What it is | Exchange rate |
|---|---|---|
| **bit** | One classical 0/1 | |
| **qubit** | One two-level quantum system | Carries ≤ 1 readable bit |
| **ebit** | One shared Bell pair | 1 ebit + 2 bits sent → 1 qubit teleported; 1 ebit + 1 qubit sent → 2 bits delivered |

Quantum information theory is largely the study of how these three resources trade against each other, and Part H uses them to build quantum networks.

## Try it

1. Use the inner-product proof to explain why a machine that copies both |0⟩ and |+⟩ can't exist.
2. What does the CNOT "copier" produce from |1⟩|0⟩? From (|0⟩ + i|1⟩)/√2 ⊗ |0⟩?
3. With the Helstrom formula, what's the best success rate for telling |0⟩ from |1⟩? From |+⟩ and |+i⟩?
4. Write the density matrix of a mixture that's |0⟩ with probability ¾ and |1⟩ with probability ¼. What's its purity?
5. Write the density matrix of |−⟩. How does it differ from the 50/50 coin?
6. A friend claims to have a device that copies any qubit, and says it would let them check which basis a distant partner measured a shared Bell pair in. Which two principles would that device break?

**Answers:**

1. Copying both requires ⟨0|+⟩ = ⟨0|+⟩², i.e. 1/√2 = ½. False, so no such unitary exists.
2. |1⟩|1⟩ (a perfect copy: it's a basis state). (|00⟩ + i|11⟩)/√2: an entangled state, not two copies.
3. |0⟩ vs |1⟩: overlap 0, so **100%**. |+⟩ vs |+i⟩: |⟨+|+i⟩| = |1 + i|/2 = 1/√2, so **≈ 85.4%**.
4. [[¾, 0], [0, ¼]]. Purity = (¾)² + (¼)² = **0.625**.
5. ½[[1, −1], [−1, 1]]. Same diagonal as the coin, but with off-diagonal −½ (coherence); purity 1 instead of ½.
6. **No-cloning** (the device itself) and **no-signalling** (using it would send information faster than light).

## Cheat sheet

| Idea | Formula or fact |
|---|---|
| No-cloning | No unitary maps \|ψ⟩\|0⟩ → \|ψ⟩\|ψ⟩ for every \|ψ⟩ |
| Proof by linearity | Copying \|0⟩ and \|1⟩ turns \|+⟩ into a Bell state |
| Proof by inner products | ⟨ψ\|φ⟩ = ⟨ψ\|φ⟩²: only orthogonal or identical states copy |
| CNOT on basis states | Copies classical information only |
| Allowed | Preparing known states, approximate cloning (fidelity 5/6), teleporting |
| Consequences | No-signalling, QKD security, no backup copies in error correction |
| Distinguishing states | Best success ½(1 + √(1 − \|⟨ψ\|φ⟩\|²)) (Helstrom) |
| Fidelity | \|⟨wanted\|got⟩\|²: 1 = perfect |
| Density matrix | ρ = \|ψ⟩⟨ψ\| (pure) or Σ pᵢ\|ψᵢ⟩⟨ψᵢ\| (mixed) |
| Diagonal of ρ | Probabilities of 0 and 1 |
| Off-diagonal of ρ | Coherences: the phase relationship |
| Purity | Tr(ρ²): 1 pure, ½ fully mixed (qubit) |
| Rules with ρ | P(k) = ⟨k\|ρ\|k⟩, ⟨A⟩ = Tr(ρA), gate: ρ → UρU† |
| Qubit capacity | ≤ 1 readable bit (Holevo); 2 with a shared ebit (superdense coding) |
| In code | `state_fidelity`, `DensityMatrix`, `.purity()` |
