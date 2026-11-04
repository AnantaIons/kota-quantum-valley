---
layout: ../../layouts/Post.astro
title: "Stabilizer codes"
description: "The language almost every quantum error-correcting code is written in. Describing states by the Pauli operators that leave them unchanged, how syndromes come from commuting and anticommuting, logical operators and code distance, the 7-qubit Steane code (whose syndrome spells out the error's position), transversal gates and why T is the hard one, and the 5-qubit perfect code."
date: 2026-11-04
category: lesson
lesson: 34
---

In Lesson 33 you protected a qubit with Shor's 9-qubit code and checked it by simulating the full state vector: 2⁹ = 512 complex amplitudes. That was fine for 9 qubits. But the codes used on real hardware have hundreds or thousands of physical qubits, and a state vector for 1,000 qubits has more entries than there are atoms in the universe. We need a smarter way to describe codes.

In 1997, Daniel Gottesman found one. Instead of listing a state's amplitudes, list the operations that **leave it unchanged**. For the states used in error correction, a short list of such operations pins the state down completely, and errors can be tracked with simple bookkeeping instead of giant matrices. This is the **stabilizer formalism**, and it's the language in which almost every quantum error-correcting code, including the surface code of Lesson 35, is designed, analysed and simulated.

## Pauli strings

The building blocks are **Pauli strings**: a Pauli matrix (I, X, Y or Z) on each qubit, multiplied together. For three qubits, Z⊗Z⊗I is written simply **ZZI**, and means "Z on the first two qubits, nothing on the third". The **weight** of a Pauli string is the number of qubits it actually touches: ZZI has weight 2.

(One convention to keep in mind: Qiskit writes labels with **qubit 0 on the right**, just like its bitstrings. So in Qiskit, `Pauli("IZZ")` means Z on qubits 0 and 1.)

Pauli strings have three properties that make them perfect for error correction:

1. **Every measurement outcome is ±1.** A Pauli string squared is the identity, so its eigenvalues are +1 and −1. Measuring ZZ asks a yes-or-no question: "do these two qubits agree?" That's exactly the parity check from Lesson 33.
2. **Any two Pauli strings either commute or anticommute.** Either AB = BA or AB = −BA, never anything messier.
3. **There's a simple rule for which.** Line the two strings up and count the positions where both have a non-identity letter and the letters **differ**. If that count is even, they commute; if odd, they anticommute. For example, ZZI and XXI differ in two positions (Z vs X, twice), so they commute. ZZI and XII differ in one, so they anticommute.

That third rule is the engine of the whole formalism. You'll see why in a moment.

## Describing a state by what leaves it alone

A Pauli string S **stabilizes** a state |ψ⟩ if S|ψ⟩ = |ψ⟩: the state is an eigenvector with eigenvalue +1. Some examples:

- |0⟩ is stabilized by Z, because Z|0⟩ = |0⟩. And |1⟩ is stabilized by −Z.
- |+⟩ is stabilized by X.
- The Bell state (|00⟩ + |11⟩)/√2 is stabilized by **XX** (flipping both qubits swaps the two terms, which changes nothing) and by **ZZ** (both terms have equal qubits).
- The 3-qubit GHZ state (|000⟩ + |111⟩)/√2 is stabilized by **XXX**, **ZZI** and **IZZ**.

Because a stabilizer has eigenvalue +1, measuring it on the state always gives +1, and its expectation value is exactly +1. We can check these with Qiskit:

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, Pauli

bell = QuantumCircuit(2); bell.h(0); bell.cx(0, 1)
ghz = QuantumCircuit(3); ghz.h(0); ghz.cx(0, 1); ghz.cx(1, 2)

for name, qc, checks in [("Bell", bell, ["XX", "ZZ", "YY", "ZI"]),
                         ("GHZ ", ghz, ["XXX", "ZZI", "IZZ", "XXI"])]:
    state = Statevector(qc)
    row = "   ".join(f"⟨{p}⟩ = {state.expectation_value(Pauli(p)).real:+.0f}" for p in checks)
    print(f"{name}:  {row}")
```

```text
Bell:  ⟨XX⟩ = +1   ⟨ZZ⟩ = +1   ⟨YY⟩ = -1   ⟨ZI⟩ = +0
GHZ :  ⟨XXX⟩ = +1   ⟨ZZI⟩ = +1   ⟨IZZ⟩ = +1   ⟨XXI⟩ = +0
```

The stabilizers come out as exactly +1. Operators that aren't stabilizers can give anything: ZI gives 0, because the first qubit alone is a 50/50 mix.

Notice YY gives −1. That's not an accident. If S₁ and S₂ both stabilize a state, so does their product S₁S₂ (apply one, then the other; the state never changes). For the Bell state, XX·ZZ = (XZ)⊗(XZ) = (−iY)⊗(−iY) = −YY. So **−YY** is a stabilizer too, which is why YY measures −1. The stabilizers of a state form a **group**, and you only need to list a few **generators**; all the others are products of them.

The key fact: **an n-qubit state is pinned down uniquely by n independent, commuting stabilizer generators.** The Bell state needs just two (XX and ZZ), the GHZ state three. Each generator is a string of n letters, so the description takes about n² symbols instead of 2ⁿ amplitudes. For 1,000 qubits, that's the difference between a million symbols and an impossible number.

## Stabilizer codes

Now the idea that turns this into error correction. Use **fewer** generators than qubits: pick n − k independent, commuting Pauli strings on n qubits. The states stabilized by all of them don't form a single state any more, but a whole **space** of dimension 2ᵏ. That space is the **code space**, and it stores k logical qubits.

The bit-flip code from Lesson 33 is the simplest example. Its generators are Z₀Z₁ and Z₁Z₂: n = 3 qubits, n − k = 2 generators, so k = 1 logical qubit. Both |000⟩ and |111⟩, and every superposition α|000⟩ + β|111⟩, have +1 for both checks. That two-dimensional space is the code space.

Why must the generators commute? Because we want to measure all of them, and two observables can only be measured together without disturbing each other if they commute. Commuting generators also guarantee that there are states which are +1 for all of them at once.

## Syndromes from commuting and anticommuting

Here's where the commutation rule pays off. Suppose a Pauli error E hits an encoded state |ψ⟩, and then we measure a generator g.

- If E **commutes** with g: g(E|ψ⟩) = E(g|ψ⟩) = E|ψ⟩. The measurement gives **+1**, as if nothing happened.
- If E **anticommutes** with g: g(E|ψ⟩) = −E(g|ψ⟩) = −E|ψ⟩. The measurement gives **−1**.

So **the syndrome is simply the list of which generators the error anticommutes with.** No state vectors, no amplitudes, just the letter-counting rule. And the syndrome doesn't depend on |ψ⟩ at all, which is why measuring it reveals nothing about the encoded data.

Here's the bit-flip code's syndrome table, computed purely from Pauli algebra (a 1 means that check reads −1):

```python
from qiskit.quantum_info import Pauli

def syndrome(error, generators):
    """1 where the error anticommutes with a generator (that check reads -1), else 0."""
    return "".join("1" if error.anticommutes(g) else "0" for g in generators)

def on(qubit, p, n):
    """A single-qubit Pauli p on one qubit of n, as a Qiskit Pauli (qubit 0 is the rightmost letter)."""
    label = ["I"] * n
    label[n - 1 - qubit] = p
    return Pauli("".join(label))

bit_flip = [Pauli("IZZ"), Pauli("ZZI")]          # Z0Z1 and Z1Z2 (rightmost letter = qubit 0)
for q in range(3):
    print(f"X on qubit {q}: syndrome {syndrome(on(q, 'X', 3), bit_flip)}    "
          f"Z on qubit {q}: syndrome {syndrome(on(q, 'Z', 3), bit_flip)}")
```

```text
X on qubit 0: syndrome 10    Z on qubit 0: syndrome 00
X on qubit 1: syndrome 11    Z on qubit 1: syndrome 00
X on qubit 2: syndrome 01    Z on qubit 2: syndrome 00
```

The X errors give the three distinct syndromes we found in Lesson 33 by simulating circuits. And the Z errors give 00: they commute with both generators, so the code can't see them. This took no state vectors at all, so the same function works for codes with thousands of qubits.

## Logical operators and distance

Some Pauli strings commute with **every** generator, and so have an all-zero syndrome. There are two kinds, and the difference is crucial:

- **Stabilizers themselves** (products of generators). They act as the identity on the code space, so they're **harmless**. That's why two Z errors in the same block of Shor's code did nothing in Lesson 33: Z₀Z₁ is one of its stabilizers.
- **Logical operators**: strings that commute with all generators but are **not** in the stabilizer group. They map the code space to itself, but change the encoded information. They're exactly the gates that act on the logical qubit, and exactly the errors the code can't see.

For the bit-flip code, the logical X is XXX (it maps |000⟩ to |111⟩), and a logical Z is Z₀ (it gives |000⟩ a + sign and |111⟩ a − sign). That single-qubit Z₀ is the code's fatal weakness: a weight-1 error that's undetectable and damages the data.

The **distance** d of a code is the smallest weight of any logical operator. It's the number of single-qubit errors needed to change the encoded data without leaving a trace. The bit-flip code has d = 1 against general errors (because of Z₀), and the codes below have d = 3.

This also gives a clean rule for whether error correction worked. A decoder sees the syndrome and applies a correction C (usually the lowest-weight error that matches). Then look at what's left, C·E:

- If C·E is a **stabilizer**, the correction worked, even if C isn't exactly E.
- If C·E is a **logical operator**, the correction silently corrupted the data: a **logical error**.

## The Steane code: a syndrome that spells the position

In 1996, Andrew Steane found a 7-qubit code that fixes any single-qubit error and has a structure so neat it feels like a magic trick. It's built from the classical **Hamming code**, one of the first error-correcting codes ever invented (1950).

Number the 7 qubits 1 to 7 and write each number in binary: 001, 010, 011, …, 111. Make one parity check for each binary digit: the first check covers every qubit whose number has a 1 in the last digit (1, 3, 5, 7), the second every qubit with a 1 in the middle digit (2, 3, 6, 7), the third every qubit with a 1 in the first digit (4, 5, 6, 7). Steane's code uses each check **twice**: once as a Z-type stabilizer (catching X errors) and once as an X-type stabilizer (catching Z errors). That's 6 generators on 7 qubits, so 7 − 6 = 1 logical qubit.

Codes built from two classical codes this way, one for X errors and one for Z errors, are called **CSS codes** after Calderbank, Shor and Steane. They're the most important family in practice. Watch what the syndrome does (qubit q in Qiskit is qubit number q + 1 in the binary scheme):

```python
from itertools import product
from qiskit.quantum_info import Pauli

n = 7
rows = [[0, 2, 4, 6], [1, 2, 5, 6], [3, 4, 5, 6]]       # Hamming code checks: qubit q is in row k if bit k of (q+1) is 1

def pauli_on(qubits, p):
    label = ["I"] * n
    for q in qubits:
        label[n - 1 - q] = p                            # Qiskit labels: qubit 0 is the rightmost letter
    return Pauli("".join(label))

z_checks = [pauli_on(r, "Z") for r in rows]             # catch X errors
x_checks = [pauli_on(r, "X") for r in rows]             # catch Z errors
gens = z_checks + x_checks
print("all 6 generators commute:", all(a.commutes(b) for a in gens for b in gens))

def syndrome(err, checks):
    return "".join("1" if err.anticommutes(c) else "0" for c in reversed(checks))   # read as a binary number

print("qubit:      " + "    ".join(str(q) for q in range(n)))
print("X error →   " + "  ".join(syndrome(pauli_on([q], "X"), z_checks) for q in range(n)))
print("Z error →   " + "  ".join(syndrome(pauli_on([q], "Z"), x_checks) for q in range(n)))
```

```text
all 6 generators commute: True
qubit:      0    1    2    3    4    5    6
X error →   001  010  011  100  101  110  111
Z error →   001  010  011  100  101  110  111
```

The syndrome of an error on qubit q **is the number q + 1 written in binary**. An error on qubit 4 gives 101, which is 5. The decoder doesn't need a lookup table: it just reads the syndrome as a number. And the X checks and Z checks work independently, so an X on one qubit and a Z on another are both located at the same time.

Now let's build the actual logical states and test some gates. We can make the projector onto the code space from the generators, since (I + g)/2 keeps exactly the +1 part of each generator g:

```python
import numpy as np
from qiskit.quantum_info import Pauli, Statevector, Operator

n = 7
rows = [[0, 2, 4, 6], [1, 2, 5, 6], [3, 4, 5, 6]]
def pauli_on(qubits, p):
    label = ["I"] * n
    for q in qubits:
        label[n - 1 - q] = p
    return Pauli("".join(label))
gens = [pauli_on(r, "Z") for r in rows] + [pauli_on(r, "X") for r in rows]

# Projector onto the code space: keep only states with +1 for every generator
P = np.eye(2 ** n)
for g in gens:
    P = P @ (np.eye(2 ** n) + g.to_matrix()) / 2
print("code space dimension:", round(np.trace(P).real))          # 2^(7-6) = 2: one logical qubit

zero_L = Statevector(P @ Statevector.from_label("0" * n).data)
zero_L = zero_L / np.linalg.norm(zero_L.data)
X_L, Z_L = pauli_on(range(n), "X"), pauli_on(range(n), "Z")
one_L = zero_L.evolve(X_L)
print("|0_L⟩ is a mix of", sum(abs(a) > 1e-9 for a in zero_L.data), "basis states with weights",
      sorted({bin(i).count("1") for i, a in enumerate(zero_L.data) if abs(a) > 1e-9}))
print(f"⟨Z_L⟩ on |0_L⟩ = {zero_L.expectation_value(Z_L).real:+.0f},  on |1_L⟩ = {one_L.expectation_value(Z_L).real:+.0f}")

H7 = Operator.from_label("H" * n)
plus_L = Statevector((zero_L.data + one_L.data) / np.sqrt(2))
print(f"H on all 7 qubits: |⟨+_L| H⊗7 |0_L⟩|² = {abs(plus_L.inner(zero_L.evolve(H7))) ** 2:.4f}")

T = np.diag([1, np.exp(1j * np.pi / 4)])
T7 = Operator(T)
for _ in range(n - 1):
    T7 = T7.tensor(Operator(T))
after = zero_L.evolve(T7).data
print(f"T on all 7 qubits: probability of staying in the code space = {np.vdot(after, P @ after).real:.4f}")
```

```text
code space dimension: 2
|0_L⟩ is a mix of 8 basis states with weights [0, 4]
⟨Z_L⟩ on |0_L⟩ = +1,  on |1_L⟩ = -1
H on all 7 qubits: |⟨+_L| H⊗7 |0_L⟩|² = 1.0000
T on all 7 qubits: probability of staying in the code space = 0.5625
```

Four things to notice:

- The code space really is 2-dimensional: one logical qubit.
- |0_L⟩ is an equal superposition of 8 bitstrings: 0000000 and seven strings of weight 4. These are exactly the even-weight codewords of the classical Hamming code.
- The logical X and Z are X and Z on **all seven** qubits (they have weight 7, but there are equivalent versions of weight 3, which is the code's distance).
- **Applying H to every qubit performs a logical H.** It turns |0_L⟩ into |+_L⟩ perfectly.

That last property is called a **transversal** gate: a logical gate done by applying a physical gate to each qubit separately. Transversal gates are wonderful for fault tolerance, because a fault in one physical gate can only damage one qubit of the block, which the code can then fix. On the Steane code, H, CNOT (between two code blocks, qubit by qubit) and S are all transversal. (For S there's a small twist: S on every qubit gives the logical **S†**, so you apply S† on every qubit to get logical S.)

But T is not. Applying T to all seven qubits knocks the state **out of the code space**: only 56% of it remains a valid codeword. This isn't a flaw of the Steane code. The **Eastin–Knill theorem** (2009) proves that **no** quantum code that can detect errors has a universal set of transversal gates. Every code has at least one hard gate, and for most practical codes that gate is T. Lesson 35 shows how fault-tolerant machines get around this, with **magic state distillation**.

## A decoder, and how it fails

Let's put the pieces together: a decoder for the Steane code that finds the X part and Z part of the error from their syndromes, applies the correction, and then checks the leftover C·E against the stabilizer group (all 2⁶ = 64 products of the generators):

```python
from itertools import product
from qiskit.quantum_info import Pauli

n = 7
rows = [[0, 2, 4, 6], [1, 2, 5, 6], [3, 4, 5, 6]]
def pauli_on(qubits, p):
    label = ["I"] * n
    for q in qubits:
        label[n - 1 - q] = p
    return Pauli("".join(label))
z_checks = [pauli_on(r, "Z") for r in rows]
x_checks = [pauli_on(r, "X") for r in rows]
gens = z_checks + x_checks

def position(err, checks):
    """The Steane syndrome spells the error's position in binary (0 means no error)."""
    return sum(2 ** k for k, c in enumerate(checks) if err.anticommutes(c))

def decode(err):
    """Find the X part and the Z part of the error separately, and undo each."""
    fix = Pauli("I" * n)
    if (q := position(err, z_checks)):
        fix = fix.compose(pauli_on([q - 1], "X"))
    if (q := position(err, x_checks)):
        fix = fix.compose(pauli_on([q - 1], "Z"))
    return fix

stabilizers = set()
for bits in product([0, 1], repeat=len(gens)):
    s = Pauli("I" * n)
    for b, g in zip(bits, gens):
        if b:
            s = s.compose(g)
    stabilizers.add(s.to_label().lstrip("-i"))

def outcome(err):
    leftover = decode(err).compose(err)                 # what remains after the correction
    if leftover.to_label().lstrip("-i") in stabilizers:
        return "fixed"
    return "LOGICAL ERROR" if all(leftover.commutes(g) for g in gens) else "still detectable"

single = [pauli_on([q], p) for q in range(n) for p in "XYZ"]
print("21 single-qubit errors:", {outcome(e) for e in single})
print("X on qubits 0 and 1:  ", outcome(pauli_on([0, 1], "X")))
print("X on 0, Z on 1:       ", outcome(pauli_on([0], "X").compose(pauli_on([1], "Z"))))
```

```text
21 single-qubit errors: {'fixed'}
X on qubits 0 and 1:   LOGICAL ERROR
X on 0, Z on 1:        fixed
```

All 21 single-qubit errors (X, Y or Z on each of 7 qubits) are fixed. A Y error is just an X and a Z on the same qubit, and the two halves of the decoder handle one each.

Two X errors, on qubits 0 and 1, are another story. Their combined syndrome is 001 XOR 010 = 011, which says "qubit 2". The decoder applies X to qubit 2, and the leftover X₀X₁X₂ is a weight-3 **logical operator**. The decoder has turned a correctable-looking situation into a logical error. That's what distance 3 means: three errors in the wrong places fool the code, and two errors can mislead the decoder into supplying the third.

The last line shows a strength of CSS codes: an X error on one qubit and a Z error on another are still fixed, because X errors and Z errors are decoded separately. Only two errors **of the same type** cause trouble.

## The 5-qubit perfect code

How small can a code be and still fix any single-qubit error? Count syndromes. On n qubits there are 3n single-qubit errors (X, Y or Z on each), and each needs its own syndrome, plus one syndrome for "no error". With n − 1 generators (for one logical qubit) there are 2ⁿ⁻¹ possible syndromes. So we need:

> 2ⁿ⁻¹ ≥ 3n + 1

This is the **quantum Hamming bound**. For n = 4: 8 ≥ 13 is false. For n = 5: 16 ≥ 16, exactly equal. So five qubits is the minimum, and a 5-qubit code would have to use **every** syndrome, with none wasted. Such a code exists, found in 1996 by Laflamme, Miquel, Paz and Zurek and independently by Bennett, DiVincenzo, Smolin and Wootters. Its generators are XZZXI and its cyclic shifts:

```python
from qiskit.quantum_info import Pauli

gens = [Pauli(s) for s in ["XZZXI", "IXZZX", "XIXZZ", "ZXIXZ"]]     # cyclic shifts of XZZX
print("generators commute:", all(a.commutes(b) for a in gens for b in gens))

def syndrome(err):
    return "".join("1" if err.anticommutes(g) else "0" for g in gens)

seen = set()
print("      q0      q1      q2      q3      q4")
for p in "XYZ":
    row = []
    for q in range(5):
        label = ["I"] * 5
        label[4 - q] = p
        row.append(syndrome(Pauli("".join(label))))
    seen.update(row)
    print(f"{p}   " + "    ".join(row))
print(f"{len(seen)} different syndromes, plus 0000 for 'no error' = {len(seen) + 1} = 2^4: every syndrome is used")
```

```text
generators commute: True
      q0      q1      q2      q3      q4
X   0011    0110    1100    1000    0001
Y   0111    1111    1110    1101    1011
Z   0100    1001    0010    0101    1010
15 different syndromes, plus 0000 for 'no error' = 16 = 2^4: every syndrome is used
```

Fifteen errors, fifteen different non-zero syndromes, and together with 0000 all 16 possible syndromes are used. That's why it's called **perfect**. It isn't a CSS code, though (its generators mix X and Z), which makes its logical gates harder to implement. In practice, slightly bigger CSS codes are preferred.

## Why stabilizer codes are easy to simulate

Everything in an error-correction cycle with Pauli noise is built from Clifford operations: encoding with H, S and CNOT, Pauli errors, and measuring Pauli strings. By the Gottesman–Knill theorem (Lesson 17), such circuits can be simulated efficiently on an ordinary computer, by tracking how the stabilizer generators change rather than tracking amplitudes.

This is enormously useful. Researchers test codes and decoders on millions of simulated error-correction rounds, with thousands of qubits, on a laptop. The widely used open-source simulator **Stim** (Craig Gidney, 2021) does exactly this. Qiskit Aer offers the same trick with `AerSimulator(method="stabilizer")`. It's the reason error-correction research can run far ahead of the hardware.

## A gallery of codes

| Code | [[n, k, d]] | Notes |
|---|---|---|
| Bit-flip (repetition) | [[3, 1, 1]] | Catches X only; distance 3 against X errors alone |
| 5-qubit perfect code | [[5, 1, 3]] | Smallest code that fixes any single error |
| Steane code | [[7, 1, 3]] | CSS, from the Hamming code; transversal H, S, CNOT |
| Shor code | [[9, 1, 3]] | The first quantum code (1995) |
| Surface code | [[d², 1, d]] | Checks only between neighbours on a 2D grid; the hardware favourite (Lesson 35) |
| Bivariate bicycle ("gross") code | [[144, 12, 12]] | A newer "qLDPC" code: 12 logical qubits in 144, with longer-range connections (IBM, 2024) |

The trend in the last row is important. The surface code is simple to build but stores only one logical qubit per patch. Newer **qLDPC** (quantum low-density parity-check) codes store many logical qubits more efficiently, at the price of connections between distant qubits. Which approach wins on real hardware is one of the most active questions in the field.

## Try it

1. Do XXZ and ZXX commute or anticommute?
2. What are two stabilizer generators of the Bell state (|01⟩ + |10⟩)/√2?
3. A code has 12 physical qubits and 10 independent stabilizer generators. How many logical qubits does it store?
4. In the Steane code, a Z error hits qubit 5 (Qiskit numbering). What syndrome do the X checks give?
5. In the bit-flip code, Z₀ is a logical operator but Z₀Z₁ is a stabilizer. What does each do to α|000⟩ + β|111⟩?
6. Use the quantum Hamming bound to show that no 4-qubit code can fix every single-qubit error.
7. Why are transversal gates good for fault tolerance?

**Answers:**

1. Compare position by position: X vs Z (differ), X vs X (same), Z vs X (differ). Two differences, an even number, so they **commute**.
2. **XX** (swapping both qubits maps |01⟩ ↔ |10⟩) and **−ZZ** (both terms have unequal qubits, so ZZ gives −1).
3. k = n − (number of generators) = 12 − 10 = **2** logical qubits.
4. Qiskit qubit 5 is qubit number 6 in the binary scheme, so the syndrome is **110**.
5. Z₀ gives α|000⟩ − β|111⟩: a different, valid encoded state, so the data is damaged without any syndrome. Z₀Z₁ gives α|000⟩ + β|111⟩ unchanged, because each branch picks up two equal signs.
6. With n = 4 and one logical qubit there are 3 generators, so 2³ = 8 syndromes. But 3·4 + 1 = 13 situations need distinct syndromes, and 8 < 13.
7. Each physical gate touches only one qubit of the code block, so a single faulty gate causes at most one error in the block, which the code can correct. A non-transversal gate could spread one fault to several qubits.

## Cheat sheet

| Idea | Formula or fact |
|---|---|
| Pauli string | One of I, X, Y, Z per qubit, e.g. ZZI; weight = number of non-I letters |
| Commutation rule | Count positions where both are non-I and differ: even → commute, odd → anticommute |
| Stabilizer | S\|ψ⟩ = \|ψ⟩; products of stabilizers are stabilizers |
| Describing a state | n independent commuting generators fix an n-qubit state |
| Stabilizer code | n − k generators on n qubits → 2ᵏ-dimensional code space, k logical qubits |
| Syndrome | 1 for each generator the error anticommutes with |
| Harmless errors | Errors in the stabilizer group act as the identity |
| Logical operator | Commutes with all generators, but not a stabilizer |
| Distance d | Smallest weight of a logical operator; corrects ⌊(d − 1)/2⌋ errors |
| Decoder success | Correction C works if C·E is a stabilizer; fails if C·E is logical |
| CSS code | Separate X-type and Z-type checks from two classical codes |
| Steane code | [[7, 1, 3]]; syndrome = error position in binary |
| Transversal gate | Physical gate on each qubit separately; spreads no errors |
| Eastin–Knill | No error-detecting code has a universal transversal gate set |
| 5-qubit code | [[5, 1, 3]]; meets the quantum Hamming bound 2ⁿ⁻¹ ≥ 3n + 1 exactly |
| Simulation | Stabilizer circuits are classically easy (Gottesman–Knill); tools: Stim, Aer `method="stabilizer"` |
