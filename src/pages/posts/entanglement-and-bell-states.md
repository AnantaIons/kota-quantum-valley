---
layout: ../../layouts/Post.astro
title: "Entanglement and the Bell states"
description: "What entanglement is and isn't: correlations that hold in every basis, each qubit alone being perfectly random, measuring entanglement with entropy, why it can't be used to send messages faster than light, GHZ states of many qubits, and why entanglement is a resource that computing, communication and sensing all spend."
date: 2026-11-04
category: lesson
lesson: 14

---

Einstein called it "spooky action at a distance". Schrödinger, who named it, called it "the characteristic trait of quantum mechanics, the one that enforces its entire departure from classical lines of thought". Entanglement is the most famous and most misunderstood idea in quantum physics.

You already know how to make it (Lesson 13: H then CNOT) and how to test for it (Lesson 12: a state that isn't a product). This lesson is about what it **means**: what an entangled pair actually does when you measure it, what it can and cannot be used for, and how to put a number on "how entangled" a state is. Everything is checked with code, so the spookiness has nowhere to hide.

## The definition, once more

A multi-qubit state is **entangled** if it can't be written as a tensor product of states of its parts. For two qubits [a, b, c, d], that means ad − bc ≠ 0 (Lesson 12).

The four **Bell states** are the most entangled states two qubits can be in:

> Φ⁺ = (|00⟩ + |11⟩)/√2   Φ⁻ = (|00⟩ − |11⟩)/√2
> Ψ⁺ = (|01⟩ + |10⟩)/√2   Ψ⁻ = (|01⟩ − |10⟩)/√2

They're orthonormal, so they form a basis of the two-qubit space, called the **Bell basis**. We'll focus on Φ⁺; the others behave the same way with signs or bit values changed.

Picture the usual story: Alice takes the first qubit of a Φ⁺ pair and Bob takes the second. They travel far apart. Then each measures their own qubit.

## Fact 1: perfect correlation in the 0/1 basis

If both measure in the 0/1 basis, they get **00** half the time and **11** half the time. Never 01 or 10. Whatever Alice gets, Bob gets the same.

So far, nothing strange. A classical "coin pair" can do that: put two identical coins, both heads or both tails (decided by a hidden coin toss), into two envelopes. Each envelope is 50/50, and they always match. That's correlation from a **shared hidden choice**, and there's nothing spooky about it.

## Fact 2: perfect correlation in other bases too

Here's where Φ⁺ differs from the envelopes. Rewrite it in the +/− basis, using |0⟩ = (|+⟩ + |−⟩)/√2 and |1⟩ = (|+⟩ − |−⟩)/√2 from Lesson 3. Expand both:

```text
|00⟩ = ½ (|++⟩ + |+−⟩ + |−+⟩ + |−−⟩)
|11⟩ = ½ (|++⟩ − |+−⟩ − |−+⟩ + |−−⟩)

(|00⟩ + |11⟩)/√2 = (1/√2)·½·(2|++⟩ + 2|−−⟩) = (|++⟩ + |−−⟩)/√2
```

The mixed terms cancel. **Φ⁺ has exactly the same form in the +/− basis.** So if Alice and Bob both measure "+ or −", they also always agree.

The envelopes can't do this. If each coin has a definite face hidden inside, a "sideways" question (the analogue of + or −) has no definite answer that's the same for both coins. The envelope pair is correlated in **one** basis; the Bell pair is correlated in **every** basis at once. That's the first sign that entanglement isn't just hidden shared information. Lesson 15 turns this into a sharp, testable inequality.

We can compute all of this with expectation values. For two qubits, ⟨ZZ⟩ is the average of the product of the two ±1 results: +1 means "always agree", −1 "always disagree", 0 "no relation".

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, SparsePauliOp

bell = QuantumCircuit(2)
bell.h(0)
bell.cx(0, 1)
phi = Statevector(bell)                     # (|00> + |11>)/sqrt2

for pauli in ["ZZ", "XX", "YY", "ZI", "IZ", "XI"]:
    value = phi.expectation_value(SparsePauliOp(pauli)).real
    print(pauli, round(float(value), 3) + 0.0)
```

```text
ZZ 1.0
XX 1.0
YY -1.0
ZI 0.0
IZ 0.0
XI 0.0
```

Perfect agreement for Z and for X, perfect **dis**agreement for Y (that's the i's at work: |+i⟩|+i⟩ and |−i⟩|−i⟩ cancel, leaving the opposite pairs). And look at the last three lines: ⟨ZI⟩, ⟨IZ⟩ and ⟨XI⟩ are all zero. That's the next fact.

## Fact 3: each qubit alone is perfectly random

The single-qubit expectation values ⟨X⟩, ⟨Y⟩, ⟨Z⟩ of either qubit are all **zero**. Its Bloch vector is (0, 0, 0): the **centre** of the Bloch sphere (Lesson 7). On its own, each half of a Bell pair is in the completely mixed state, 50/50 in every basis.

This is the strange heart of entanglement: **the pair as a whole is in a perfectly definite, pure state, but each part on its own is in a state of complete randomness.** All the information is in the correlations; none is in the parts.

The tool for describing a part of a bigger system is the **density matrix** (Lesson 16 explains it fully). Throwing away one qubit's description is called taking the **partial trace**. For a Bell pair, what remains is ½·I: the 50/50 mixture.

### Measuring entanglement: entropy

How random is the part? We can put a number on it with the **entanglement entropy**: the entropy (in bits) of one part's state.

- **0 bits:** the part is in a pure state. No entanglement: it's a product state.
- **1 bit:** the part is completely random. Maximum entanglement for two qubits.

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, partial_trace, entropy

bell = QuantumCircuit(2)
bell.h(0)
bell.cx(0, 1)
phi = Statevector(bell)

rho_bob = partial_trace(phi, [0])           # throw away qubit 0, keep qubit 1
print(np.round(rho_bob.data.real, 3))
print("entanglement entropy:", round(entropy(rho_bob, base=2), 3))

prod = QuantumCircuit(2)
prod.h(0)                                   # |+> on qubit 0, |0> on qubit 1: no entanglement
print("product state entropy:", round(entropy(partial_trace(Statevector(prod), [0]), base=2), 3))
```

```text
[[0.5 0. ]
 [0.  0.5]]
entanglement entropy: 1.0
product state entropy: 0.0
```

Bob's qubit is ½·I with exactly 1 bit of entropy: one "ebit" of entanglement, the unit used to count it. Teleporting one qubit (Lesson 21) costs exactly one ebit.

## Fact 4: no messages faster than light

When Alice measures her qubit and gets 0, Bob's qubit is instantly |0⟩, however far away. Can she use this to send Bob a message?

**No.** Bob only ever sees his own results, and his results are 50/50 **whatever Alice does**. If she measures in the Z basis, his qubit becomes |0⟩ or |1⟩ at random; if she measures in X, it becomes |+⟩ or |−⟩ at random; if she does nothing, it stays half of a Bell pair. In all three cases Bob's qubit is a perfect 50/50 mixture from his point of view. Here's the simulation:

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler

sampler = StatevectorSampler(seed=np.random.default_rng(8))
circuits = []
for alice_basis in ["Z", "X"]:
    qc = QuantumCircuit(2)
    qc.h(0)
    qc.cx(0, 1)                 # Bell pair: Alice has qubit 0, Bob has qubit 1
    if alice_basis == "X":
        qc.h(0)                 # Alice measures in the X basis instead
    qc.measure_all()
    circuits.append(qc)

for alice_basis, res in zip(["Z", "X"], sampler.run(circuits, shots=4000).result()):
    counts = res.data.meas.get_counts()
    bob0 = sum(v for k, v in counts.items() if k[0] == "0")   # left digit = qubit 1 = Bob
    print(f"Alice measures {alice_basis}: Bob sees 0 in {bob0 / 4000:.3f} of runs")
```

```text
Alice measures Z: Bob sees 0 in 0.502 of runs
Alice measures X: Bob sees 0 in 0.492 of runs
```

Both are 50/50 within shot noise. Alice's choice leaves no trace in Bob's statistics. The correlations only show up later, when Alice and Bob **compare notes** over an ordinary channel, which is limited by the speed of light. This principle is called **no-signalling**, and it's why entanglement and relativity coexist peacefully. It's also why teleportation needs Alice to send two classical bits (Lesson 21).

## Entangling many qubits: the GHZ state

Extend the Bell circuit with a chain of CNOTs and you get the **GHZ state** (after Greenberger, Horne and Zeilinger):

> (|00…0⟩ + |11…1⟩)/√2

All n qubits are either all 0 or all 1, in superposition. Measure any one and you know all the others.

```python
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler

ghz = QuantumCircuit(5)
ghz.h(0)
for q in range(4):
    ghz.cx(q, q + 1)            # chain of CNOTs spreads the superposition
ghz.measure_all()
print(StatevectorSampler(seed=1).run([ghz], shots=1000).result()[0].data.meas.get_counts())
```

```text
{'11111': 493, '00000': 507}
```

Only 00000 and 11111 appear. GHZ states are used to benchmark quantum computers (a high-quality 50-qubit GHZ state is a serious achievement, because a single error anywhere spoils it), for quantum sensing beyond the standard limit (Lesson 44), and in error-correcting codes (Part F).

There are other kinds of multi-qubit entanglement too. The **W state** (|100⟩ + |010⟩ + |001⟩)/√3 behaves differently: lose one qubit of a GHZ state and the rest becomes unentangled, but lose one qubit of a W state and the other two stay entangled. For three or more qubits, entanglement comes in genuinely different types.

## What entanglement is, and isn't

| Entanglement is | Entanglement is not |
|---|---|
| Correlations stronger than any shared hidden plan can produce (Lesson 15) | A way to send messages faster than light |
| A property of the whole system, not of its parts | Two particles "secretly agreeing" beforehand |
| A resource that gets **used up** by protocols | Something that survives easily: noise destroys it quickly |
| **Monogamous:** if A is maximally entangled with B, A can't be entangled with C at all | Only about particles far apart: neighbouring qubits on one chip are entangled in exactly the same way |

The monogamy row has a practical meaning: if Alice and Bob share a perfect Bell pair, no eavesdropper can be entangled with it. That's the security idea behind the E91 protocol (Lesson 41).

### Where entanglement gets spent

| Use | Lesson |
|---|---|
| Teleporting a qubit (1 ebit + 2 classical bits) | 21 |
| Superdense coding (sending 2 bits with 1 qubit + 1 ebit) | 21 |
| Quantum algorithms: interference across exponentially many entangled terms | 22–31 |
| Error-correcting codes: spreading one qubit's information across many | 33–35 |
| Quantum key distribution with Bell tests | 41 |
| Quantum repeaters and the quantum internet | 42 |
| Sensing beyond the standard quantum limit | 44 |

## Try it

1. Rewrite Ψ⁻ = (|01⟩ − |10⟩)/√2 in the +/− basis. What do you notice?
2. For Φ⁺, what is ⟨ZX⟩ (Z on Alice's qubit, X on Bob's)? Guess first, then reason it out.
3. Alice and Bob share Ψ⁺ = (|01⟩ + |10⟩)/√2 and both measure in the 0/1 basis. What results can they get?
4. Is (|00⟩ + |01⟩ + |10⟩ + |11⟩)/2 entangled? What's its entanglement entropy?
5. Alice measures her half of Φ⁺ and gets 1. What state is Bob's qubit in now? Can Bob tell, without talking to Alice, that she measured?
6. In a 5-qubit GHZ state, you measure qubit 2 and get 0. What will the other four give?

**Answers:**

1. (|−+⟩ − |+−⟩)/√2, up to an overall sign. **The same form**: Ψ⁻ is anti-correlated in the +/− basis too. In fact Ψ⁻ looks the same in every basis; it's the "singlet" state.
2. **0.** Alice's Z result and Bob's X result are completely unrelated: knowing Alice got 0 leaves Bob in |0⟩, which is 50/50 for X.
3. Only **01** or **10**, each with probability ½: always opposite.
4. No: it's |+⟩|+⟩ (ad − bc = ¼ − ¼ = 0). Entropy **0**.
5. **|1⟩.** No: his statistics are 50/50 either way. Only comparing results with Alice reveals the correlation.
6. All **0**: the state collapsed to |00000⟩.

## Cheat sheet

| Idea | Formula or fact |
|---|---|
| Entangled | Not a product of the parts' states (2 qubits: ad − bc ≠ 0) |
| Bell states | Φ± = (\|00⟩ ± \|11⟩)/√2, Ψ± = (\|01⟩ ± \|10⟩)/√2 |
| Φ⁺ in the +/− basis | (\|++⟩ + \|−−⟩)/√2: same form |
| Correlations of Φ⁺ | ⟨ZZ⟩ = ⟨XX⟩ = 1, ⟨YY⟩ = −1 |
| Each qubit alone | ⟨X⟩ = ⟨Y⟩ = ⟨Z⟩ = 0: centre of the Bloch sphere |
| Reduced state | Partial trace of a Bell pair = ½·I |
| Entanglement entropy | 0 bits for product states, 1 bit (one ebit) for a Bell pair |
| No-signalling | Bob's statistics never depend on what Alice measures |
| GHZ state | (\|0…0⟩ + \|1…1⟩)/√2: all agree |
| W state | (\|100⟩ + \|010⟩ + \|001⟩)/√3: entanglement survives losing a qubit |
| Monogamy | Maximal entanglement with B rules out entanglement with C |
| Resource | Teleportation, superdense coding, QKD, sensing, error correction |
| In code | `partial_trace`, `entropy`, `expectation_value(SparsePauliOp("ZZ"))` |
