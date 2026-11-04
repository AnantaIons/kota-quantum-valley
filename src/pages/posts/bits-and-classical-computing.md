---
layout: ../../layouts/Post.astro
title: "Bits, logic gates and classical computing"
description: "What a bit physically is, binary numbers, logic gates and the universal NAND, adding numbers with gates, why erasing information costs energy, and how bits and gates can be written as vectors and matrices: the exact bridge to qubits."
date: 2026-11-04
category: lesson
lesson: 1

---

Before you can understand what a quantum computer does differently, you need a very clear picture of what an ordinary computer does. This lesson builds that picture from the ground up: what a bit is, how gates combine bits, how a computer adds two numbers, and then two ideas that lead straight into quantum computing: **reversible gates**, and **writing bits as vectors and gates as matrices.**

By the end, the sentence "a quantum gate is a matrix acting on a vector" will already make sense, because you'll have seen classical gates do exactly that.

## What a bit really is

A **bit** is the smallest piece of information: an answer to one yes/no question. We write the two answers as **0** and **1**.

A bit isn't an abstract idea inside a computer. It's always something physical with two clearly different conditions:

| Where | 0 means | 1 means |
|---|---|---|
| A wire in a processor | Low voltage (near 0 V) | High voltage (for example 0.8–1.2 V) |
| A flash memory cell (your phone, a USB drive) | Charge on a floating gate | No charge (or the reverse) |
| A hard disk | Tiny magnetic region pointing one way | Pointing the other way |
| An optical fibre | No light pulse in a time slot | A light pulse |

What makes it a bit is that the two conditions are **far apart**. A voltage of 0.97 V and 1.03 V are both read as 1. Small noise doesn't change the answer. This robustness is why classical computers are so reliable, and, as you'll see in Part F, it's exactly what qubits don't have for free.

Two more properties of classical bits will matter later:

- **You can read a bit without changing it.** Measuring a wire's voltage doesn't flip it.
- **You can copy a bit as often as you like.** That's what a fan-out wire does.

Both are false for qubits. Lesson 8 explains why reading changes a qubit, and Lesson 16 proves that a qubit can't be copied.

## Binary numbers

With one bit you can label 2 things. With two bits, 4: 00, 01, 10, 11. With three bits, 8. In general:

> **n bits can hold 2ⁿ different values, but only one of them at a time.**

Hold on to the phrase "only one at a time". The headline difference with qubits is about exactly this.

Binary is counting in base 2. Each position is worth twice the one to its right:

```text
position value:   8   4   2   1
bits:             1   1   0   1
value:            8 + 4 + 0 + 1 = 13
```

So 13 in binary is **1101**. To convert the other way, keep dividing by 2 and read the remainders from bottom to top:

```text
13 ÷ 2 = 6 remainder 1
 6 ÷ 2 = 3 remainder 0
 3 ÷ 2 = 1 remainder 1
 1 ÷ 2 = 0 remainder 1     → read upward: 1101
```

Eight bits make a **byte**, which holds 2⁸ = 256 values (0 to 255). That's enough for one English letter or one brightness level of one colour in a pixel.

## Logic gates

A **logic gate** takes one or more bits in and gives a bit out, following a fixed rule. The rule is completely described by a **truth table**: a list of every possible input and its output.

| Gate | Rule in words | 00 | 01 | 10 | 11 |
|---|---|---|---|---|---|
| **AND** | 1 only if both inputs are 1 | 0 | 0 | 0 | 1 |
| **OR** | 1 if at least one input is 1 | 0 | 1 | 1 | 1 |
| **XOR** | 1 if the inputs are different | 0 | 1 | 1 | 0 |
| **NAND** | NOT of AND | 1 | 1 | 1 | 0 |

And the one-input gate:

| Gate | 0 | 1 |
|---|---|---|
| **NOT** | 1 | 0 |

Inside a chip, each gate is a handful of transistors acting as voltage-controlled switches. A modern processor has billions of them.

### One gate to build them all

Here's a surprising fact: **NAND alone can build every other gate.** We call NAND **universal**.

- NOT a = a NAND a. (If both inputs are the same bit a, NAND gives NOT a.)
- a AND b = NOT (a NAND b).
- a OR b = (NOT a) NAND (NOT b).

Because of this, chip factories can optimise one tiny circuit and build everything from copies of it. Quantum computing has the same idea: a small **universal gate set** that can build any quantum operation (Lesson 17).

### Adding numbers with gates

How does a computer add? Look at adding two single bits:

| a | b | a + b in binary | sum bit | carry bit |
|---|---|---|---|---|
| 0 | 0 | 00 | 0 | 0 |
| 0 | 1 | 01 | 1 | 0 |
| 1 | 0 | 01 | 1 | 0 |
| 1 | 1 | 10 | 0 | 1 |

Compare the columns with the truth tables. The **sum bit is XOR** and the **carry bit is AND**. One XOR gate and one AND gate make a **half adder**. Chain these (with a little extra logic to add the incoming carry) and you can add numbers of any length. Every calculation your phone does is built from tricks like this.

## Code: build every gate from NAND

```python
def NAND(a, b): return 1 - (a & b)
def NOT(a):     return NAND(a, a)
def AND(a, b):  return NOT(NAND(a, b))
def OR(a, b):   return NAND(NOT(a), NOT(b))
def XOR(a, b):  return AND(OR(a, b), NAND(a, b))

print("a b | AND OR XOR NAND")
for a in (0, 1):
    for b in (0, 1):
        print(a, b, "|", AND(a, b), "  ", OR(a, b), " ", XOR(a, b), "  ", NAND(a, b))

def half_adder(a, b): return XOR(a, b), AND(a, b)   # (sum, carry)
print(half_adder(1, 1))
```

```text
a b | AND OR XOR NAND
0 0 | 0    0   0    1
0 1 | 0    1   1    1
1 0 | 0    1   1    1
1 1 | 1    1   0    0
(0, 1)
```

The last line says 1 + 1 gives sum 0, carry 1: binary 10, which is 2. Notice that XOR was built as "OR and NAND": 1 when at least one input is 1 **and** not both.

## Reversible gates: the first step towards quantum

Look at AND's truth table again. If AND outputs 0, what were the inputs? It could be 00, 01 or 10. **You can't tell.** AND destroys information: three different inputs give the same output, so the input can't be recovered.

A gate whose input can always be recovered from its output is called **reversible**. NOT is reversible: if the output is 1, the input was 0. AND, OR, XOR and NAND (with their single output) are not.

Why should you care? Two reasons.

**1. Erasing information costs energy.** In 1961, Rolf Landauer showed that erasing one bit must release at least kT·ln 2 of heat (k is Boltzmann's constant, T the temperature). At room temperature that's about 3 × 10⁻²¹ joules: tiny, and today's chips waste far more than this for other reasons. But it's a real physical law connecting information and energy.

**2. Quantum gates must be reversible.** You'll see in Lesson 4 that a quantum computer evolves by operations that can always be undone. So any classical calculation we want to run on a quantum computer must first be rewritten with reversible gates.

### Making gates reversible

The trick is to **keep the inputs** and write the answer into an extra bit.

**CNOT (controlled-NOT):** two bits in, two bits out. The first bit (the *control*) passes through unchanged. The second bit (the *target*) is flipped if the control is 1.

| in (control, target) | out |
|---|---|
| 00 | 00 |
| 01 | 01 |
| 10 | 11 |
| 11 | 10 |

The target becomes control XOR target. Every output appears exactly once, so it's reversible. In fact, applying CNOT twice gets you back where you started.

**Toffoli (controlled-controlled-NOT):** three bits in, three out. The third bit flips only if the first two are both 1. If you set the third bit to 0 at the start, it ends up holding **a AND b**, while a and b are kept:

| a | b | c (start) | c (end) |
|---|---|---|---|
| 0 | 0 | 0 | 0 |
| 0 | 1 | 0 | 0 |
| 1 | 0 | 0 | 0 |
| 1 | 1 | 0 | **1** |

Toffoli is universal for reversible classical computing: with it (and some spare bits set to 0 or 1) you can compute anything an ordinary computer can. Both CNOT and Toffoli reappear as quantum gates in Lesson 13, with exactly the same truth tables.

## Bits as vectors, gates as matrices

Now the most important idea of the lesson. It looks like a strange way to write simple things, but it is exactly the language of quantum computing.

Write the bit 0 as the column vector **[1, 0]** and the bit 1 as **[0, 1]**. Each vector has a 1 in the position of the value it stands for. (This is called a *one-hot* encoding.)

Then NOT is the matrix

```text
NOT = [ 0  1 ]
      [ 1  0 ]
```

and applying the gate means multiplying the matrix by the vector. Each output entry is a row of the matrix times the input vector:

```text
NOT × [1, 0] = [0×1 + 1×0,  1×1 + 0×0] = [0, 1]     (0 becomes 1)
NOT × [0, 1] = [0×0 + 1×1,  1×0 + 0×1] = [1, 0]     (1 becomes 0)
```

Two bits work the same way, but with **4-entry vectors**, one position for each of 00, 01, 10, 11. For example 10 is [0, 0, 1, 0]. Every reversible two-bit gate becomes a **4×4 matrix** with exactly one 1 in each row and column (a *permutation matrix*). CNOT is:

```text
         00 01 10 11   ← input
CNOT = [ 1  0  0  0 ]  → 00
       [ 0  1  0  0 ]  → 01
       [ 0  0  0  1 ]  → 10
       [ 0  0  1  0 ]  → 11
```

Read each column as "where does this input go?": column 10 has its 1 in row 11, so 10 → 11.

Notice something: n bits need a vector of length **2ⁿ**. For classical bits this is wasteful, because only one entry is ever 1. Quantum computing is what you get when **all 2ⁿ entries are allowed to be non-zero at once.**

### Code: gates as matrices

```python
import numpy as np
zero, one = np.array([1, 0]), np.array([0, 1])
NOTm = np.array([[0, 1],
                 [1, 0]])
print(NOTm @ zero, NOTm @ one)

# Two bits: 00, 01, 10, 11 become 4 one-hot vectors.
CNOT = np.array([[1, 0, 0, 0],
                 [0, 1, 0, 0],
                 [0, 0, 0, 1],
                 [0, 0, 1, 0]])
for i, label in enumerate(["00", "01", "10", "11"]):
    v = np.zeros(4, dtype=int); v[i] = 1
    out = CNOT @ v
    print(label, "->", ["00", "01", "10", "11"][int(np.argmax(out))])
```

```text
[0 1] [1 0]
00 -> 00
01 -> 01
10 -> 11
11 -> 10
```

The `@` symbol in Python means matrix multiplication. You've just run a classical computer as linear algebra.

## From certain bits to random bits

What if you don't know a bit's value, only the chances? A fair coin before you look is 0 with probability ½ and 1 with probability ½. Write that as the vector **[0.5, 0.5]**: the entries are probabilities, and they add up to 1.

Apply NOT to the coin: NOT × [0.5, 0.5] = [0.5, 0.5]. Still a fair coin, which makes sense. A biased coin [0.9, 0.1] becomes [0.1, 0.9].

This is called a **probabilistic bit**, and it looks a lot like a qubit: a vector whose entries tell you the chances of 0 and 1. But there's one difference that changes everything:

| | Probabilistic bit | Qubit |
|---|---|---|
| Entries are | Probabilities | **Amplitudes** |
| Entries can be | Only 0 to 1 | **Negative, or complex** |
| Probabilities come from | The entries directly | The entries **squared** |
| Two paths to the same result | Always add up | **Can cancel each other** |

That last row, cancellation, is called **interference**, and it's the reason quantum computers can do things probabilistic computers can't. Lesson 2 gives you the complex numbers needed to describe it, and Lesson 5 shows the experiment that revealed it.

## Why classical computers struggle to simulate quantum ones

A classical computer can, in principle, simulate any quantum computer: just store all 2ⁿ entries of the vector and multiply by matrices. The problem is size. Each entry is a complex number, typically 16 bytes:

| Qubits | Entries (2ⁿ) | Memory |
|---|---|---|
| 10 | 1,024 | 16 kilobytes |
| 30 | about 1 billion | 17 gigabytes |
| 50 | about 10¹⁵ | 18 petabytes (18 million gigabytes) |
| 300 | about 10⁹⁰ | more than the number of atoms in the observable universe |

Every extra qubit **doubles** the memory. Around 50 qubits, the biggest supercomputers run out of room for a direct simulation. This doubling is the deep reason quantum computers might be powerful, though, as Lesson 31 explains carefully, a big state doesn't automatically mean a big speed-up.

## Try it

1. Convert 45 to binary, and 10110 to decimal.
2. How many different values can 16 bits hold?
3. Build OR using only NAND gates on paper, and check all four inputs.
4. Is XOR (one output) reversible? What about the two-output gate (a, b) → (a, a XOR b)?
5. Write the 4×4 matrix of the SWAP gate, which swaps two bits: 01 → 10, 10 → 01, and 00, 11 unchanged.
6. Multiply NOT by the biased coin [0.7, 0.3]. What does the result mean?

**Answers:**

1. 45 = 32 + 8 + 4 + 1 = **101101**. 10110 = 16 + 4 + 2 = **22**.
2. 2¹⁶ = **65,536**.
3. (a NAND a) NAND (b NAND b). Inputs 00 → (1) NAND (1) = 0; 01 → 1 NAND 0 = 1; 10 → 0 NAND 1 = 1; 11 → 0 NAND 0 = 1. That's OR.
4. XOR with one output is **not** reversible (output 0 comes from both 00 and 11). The two-output version **is**: it's CNOT.
5. Rows and columns in the order 00, 01, 10, 11: [[1,0,0,0], [0,0,1,0], [0,1,0,0], [0,0,0,1]].
6. [0.3, 0.7]: the coin is now 1 with probability 0.7. NOT swapped the chances.

## Cheat sheet

| Idea | Key fact |
|---|---|
| Bit | A physical system with two clearly different states, 0 and 1 |
| n bits | 2ⁿ possible values, one at a time |
| Binary | Positions worth 1, 2, 4, 8, …; 13 = 1101 |
| Universal gate | NAND builds NOT, AND, OR and everything else |
| Half adder | sum = XOR, carry = AND |
| Reversible gate | Input can always be recovered from output |
| Landauer | Erasing one bit releases at least kT·ln 2 of heat |
| CNOT | Target flips if control is 1; reversible |
| Toffoli | Third bit flips if first two are 1; computes AND reversibly |
| Bits as vectors | 0 = [1, 0], 1 = [0, 1]; n bits need length 2ⁿ |
| Gates as matrices | Apply a gate = multiply matrix × vector |
| Probabilistic bit | Entries are probabilities; can't cancel |
| Qubit (preview) | Entries are amplitudes; can be negative or complex; can cancel |
| Simulation cost | Memory doubles with every qubit; ~50 qubits overwhelms supercomputers |
