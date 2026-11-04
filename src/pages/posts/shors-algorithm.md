---
layout: ../../layouts/Post.astro
title: "Shor's algorithm, step by step"
description: "Shor's algorithm from the ground up: how RSA depends on factoring (a toy RSA you can break), the number theory that turns factoring into finding an order, order finding as phase estimation on modular multiplication, full Qiskit runs for N = 15 and N = 21, continued fractions, what the algorithm costs and why that's an exponential speed-up, discrete logarithms and elliptic curves, what has really been run on hardware, and an honest timeline."
date: 2026-11-04
category: lesson
lesson: 28
---

In 1994, Peter Shor showed that a large enough quantum computer could **factor** whole numbers, and compute **discrete logarithms**, in a time that grows only polynomially with the number of digits. The best known classical methods take super-polynomial time. Those two problems are the foundation of almost all public-key cryptography in use today: RSA, Diffie–Hellman and elliptic curves. No other quantum algorithm has had a bigger effect on the world, even before a machine exists that can run it at scale.

This lesson builds Shor's algorithm piece by piece. It starts with why factoring matters (a toy RSA you can break), then the number-theory trick that turns factoring into **finding an order**, then the quantum part, which is phase estimation (Lesson 27) applied to modular multiplication. You'll run the full algorithm in Qiskit for N = 15 and N = 21, recover the period with continued fractions, and then look honestly at the cost, the records and the timeline.

## Why factoring matters: RSA in one screen

RSA (Rivest, Shamir and Adleman, 1977) works like this:

1. Choose two large secret primes p and q, and multiply them: **N = p·q**. N is public.
2. Compute φ = (p − 1)(q − 1). This needs p and q, so only the owner can do it.
3. Choose a public exponent e, and compute the private exponent **d** with e·d ≡ 1 (mod φ).
4. Anyone can **encrypt** a message m as c = mᵉ mod N. Only the owner can **decrypt**: m = cᵈ mod N.

The security rests on one fact: to compute d you need φ, and to compute φ you need p and q. **If you can factor N, you can read everything.** Here it is with tiny primes:

```python
# Toy RSA with tiny primes, then breaking it by factoring N
p, q = 61, 53                  # the secret primes
N = p * q                      # public modulus
phi = (p - 1) * (q - 1)        # secret: needs p and q
e = 17                         # public exponent
d = pow(e, -1, phi)            # private exponent: e*d = 1 mod phi

message = 1234
cipher = pow(message, e, N)    # anyone can encrypt with (N, e)
print(f"public key (N, e) = ({N}, {e}), private d = {d}")
print(f"encrypt {message} -> {cipher}, decrypt -> {pow(cipher, d, N)}")

# The attacker knows only N and e. Factor N by trial division:
f = next(k for k in range(2, N) if N % k == 0)
d_stolen = pow(e, -1, (f - 1) * (N // f - 1))
print(f"attacker factors {N} = {f} x {N // f}, recovers d = {d_stolen}, reads {pow(cipher, d_stolen, N)}")
```

```text
public key (N, e) = (3233, 17), private d = 2753
encrypt 1234 -> 2183, decrypt -> 1234
attacker factors 3233 = 53 x 61, recovers d = 2753, reads 1234
```

With N = 3233, trial division finds the factors instantly. Real RSA uses a 2048-bit N, a number with 617 decimal digits (and adds padding schemes that this toy leaves out). The same attack needs only one thing: a way to factor N.

### How hard is factoring classically?

- **Trial division** tries divisors up to √N. For a 2048-bit N that's about 2¹⁰²⁴ ≈ 10³⁰⁸ divisions: hopeless.
- The best known method, the **general number field sieve** (NFS), is far cleverer. Its cost grows roughly like e^(c·n^(1/3)·(log n)^(2/3)) for an n-bit number: slower than exponential, but faster than any polynomial. The record is **RSA-250**, an 829-bit number factored in 2020 using about 2,700 CPU core-years. RSA-2048 is far beyond reach.
- Nobody has **proved** that factoring is classically hard. It's a belief based on centuries of mathematics and decades of attacks. Shor's result is different: it's a proof that a quantum computer **can** factor efficiently.

## The big idea: factoring = finding an order

### Modular arithmetic and the order

"a mod N" means the remainder when a is divided by N. Pick a number a that shares no factor with N (so gcd(a, N) = 1), and look at its powers mod N:

> f(x) = aˣ mod N

For N = 15 and a = 7:

| x | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|---|
| 7ˣ mod 15 | 1 | 7 | 4 | 13 | 1 | 7 | 4 | 13 |

The sequence **repeats**. It must: there are only N possible remainders, and multiplying by a can be undone (a has an inverse mod N when gcd(a, N) = 1), so the sequence has to come back to 1. The first x > 0 with aˣ ≡ 1 (mod N) is called the **order** of a, written **r**. Here r = 4, and f has **period** r.

### Why the order gives the factors

Since a^r ≡ 1 (mod N), N divides a^r − 1. If r is even, that factorises as a difference of squares:

> a^r − 1 = (a^(r/2) − 1)(a^(r/2) + 1)

So N divides the product of the two brackets. Now:

- N doesn't divide a^(r/2) − 1, because then a^(r/2) ≡ 1, and r wouldn't be the **smallest** such power.
- If also a^(r/2) ≢ −1 (mod N), then N doesn't divide a^(r/2) + 1 either.

So N divides the product but neither factor. The only way that can happen is if N's prime factors are **split** between the two brackets. Then the greatest common divisors

> gcd(a^(r/2) − 1, N) and gcd(a^(r/2) + 1, N)

are proper factors of N. The gcd is easy to compute even for huge numbers, using **Euclid's algorithm** (repeatedly replace the larger number by its remainder when divided by the smaller), which takes a number of steps proportional to the number of digits.

For N = 15, a = 7: r = 4, and 7² = 49. gcd(48, 15) = **3** and gcd(50, 15) = **5**. So 15 = 3 × 5.

Let's check every possible a for N = 15, and count how often the trick works for a few other N:

```python
from math import gcd

def order(a, N):
    """Smallest r > 0 with a^r = 1 (mod N), found by brute force."""
    r, y = 1, a % N
    while y != 1:
        y = y * a % N
        r += 1
    return r

def try_a(a, N):
    r = order(a, N)
    if r % 2 == 1:
        return r, "fails: r is odd"
    h = pow(a, r // 2, N)                  # a^(r/2) mod N
    if h == N - 1:
        return r, "fails: a^(r/2) = -1 mod N"
    return r, f"factors {gcd(h - 1, N)} x {gcd(h + 1, N)}"

N = 15
print(f"N = {N}")
for a in range(2, N):
    if gcd(a, N) == 1:
        r, result = try_a(a, N)
        print(f"  a = {a:2d}  order r = {r}  {result}")

print("\nfraction of coprime a that work:")
for N in [15, 21, 35, 77, 221, 3233]:
    good = [a for a in range(2, N) if gcd(a, N) == 1]
    works = sum(try_a(a, N)[1].startswith("factors") for a in good)
    print(f"  N = {N:4d}: {works}/{len(good)} = {works / len(good):.2f}")
```

```text
N = 15
  a =  2  order r = 4  factors 3 x 5
  a =  4  order r = 2  factors 3 x 5
  a =  7  order r = 4  factors 3 x 5
  a =  8  order r = 4  factors 3 x 5
  a = 11  order r = 2  factors 5 x 3
  a = 13  order r = 4  factors 3 x 5
  a = 14  order r = 2  fails: a^(r/2) = -1 mod N

fraction of coprime a that work:
  N =   15: 6/7 = 0.86
  N =   21: 6/11 = 0.55
  N =   35: 18/23 = 0.78
  N =   77: 30/59 = 0.51
  N =  221: 174/191 = 0.91
  N = 3233: 1950/3119 = 0.63
```

The trick fails only when r is odd or a^(r/2) ≡ −1 (mod N); for N = 15 that happens only for a = 14, which is −1 itself. A theorem guarantees that if N is odd and not a power of a prime, **at least half** of all valid a work. So a few random tries are enough.

### The complete recipe

1. If N is even, 2 is a factor. If N = pᵏ for a prime p (easy to check classically), you're done.
2. Pick a random a between 2 and N − 1. If gcd(a, N) > 1, you've found a factor by luck.
3. **Find the order r of a mod N.**
4. If r is odd or a^(r/2) ≡ −1 (mod N), go back to step 2.
5. Output gcd(a^(r/2) − 1, N).

Every step except step 3 is fast on an ordinary computer. Step 3 is the problem: the brute-force loop in the code takes r steps, and r can be almost as large as N, so for a 2048-bit N it's as hopeless as trial division. No efficient classical method for finding orders is known, and there can't be an easy one unless factoring is easy too, since this recipe turns any order-finder into a factoring method. **Step 3 is the only job for the quantum computer.**

## The quantum part: order finding is phase estimation

### Multiplication as a quantum gate

Define an operation on an n-qubit register (n = number of bits of N) that multiplies by a:

> U|y⟩ = |a·y mod N⟩

Because a has an inverse mod N, different y give different outputs: U just **shuffles** the basis states (it's a permutation), so it's unitary. (For the unused states y ≥ N, U does nothing.)

Start from |1⟩ and apply U repeatedly. You walk around a cycle of length r:

> |1⟩ → |7⟩ → |4⟩ → |13⟩ → |1⟩ (for a = 7, N = 15)

### Its eigenstates hold the period

Lesson 27 showed that phase estimation reads the eigenvalue phases of a unitary. Here are U's eigenstates. For each s = 0, 1, …, r − 1, define

> |u_s⟩ = (1/√r) Σₖ e^(−2πi·sk/r) |aᵏ mod N⟩   (sum over k = 0 … r − 1)

Applying U moves each term one step around the cycle, which is the same as multiplying the whole state by e^(2πi·s/r):

> U|u_s⟩ = e^(2πi·s/r) |u_s⟩

So the eigenphases are **φ = s/r**. The period sits in the denominator.

There's a catch: to prepare |u_s⟩ you'd need to know r already. The way out is beautiful. Add up all the eigenstates:

> (1/√r) Σ_s |u_s⟩ = |1⟩

(For each k ≠ 0, the phases e^(−2πi·sk/r) go once around the circle as s varies and cancel; for k = 0 they're all 1 and add up.) So **|1⟩ is an equal superposition of all r eigenstates**, and it's trivial to prepare. Run phase estimation on |1⟩, and the result is s/r for a **random** s, each with probability 1/r.

### Controlled powers for free

Phase estimation needs controlled U, U², U⁴, U⁸, and so on: counting qubit k controls U^(2ᵏ). Lesson 27 warned that this is usually the expensive part: 2ᵏ applications of U. Here it isn't. U^(2ᵏ) is "multiply by a^(2ᵏ) mod N", and that number can be computed classically by **repeated squaring**: a, a², a⁴ = (a²)², a⁸ = (a⁴)², … each mod N. So each controlled power is **one** controlled multiplication by a known constant. That's what makes Shor's algorithm efficient.

### The same thing, seen as period finding

You may also meet Shor's algorithm described as in Lesson 26: put the counting register in a superposition of all x, compute aˣ mod N into the work register, and apply the QFT to find the period of the result. That's exactly the same circuit. The controlled multiplications compute aˣ mod N for every x at once (each bit of x controls one multiplication), and the inverse QFT reads off the period. "Phase estimation" and "period finding" are two descriptions of one algorithm.

### The circuit

1. **Counting register:** t qubits (usually t ≈ 2n), each put in |+⟩ with a Hadamard.
2. **Work register:** n qubits, set to |1⟩.
3. **Controlled multiplications:** counting qubit k controls "multiply by a^(2ᵏ) mod N".
4. **Inverse QFT** on the counting register.
5. **Measure** the counting register, giving a number k. Then k/2ᵗ ≈ s/r.
6. **Classical post-processing:** continued fractions turn k/2ᵗ into s/r, which gives r.

## Shor for N = 15 in Qiskit

Here is the complete algorithm for N = 15 and a = 7, with t = 8 counting qubits and a 4-qubit work register. Each modular multiplication is built as a permutation matrix:

```python
import numpy as np
from fractions import Fraction
from qiskit import QuantumCircuit
from qiskit.circuit.library import QFTGate, UnitaryGate
from qiskit.quantum_info import Statevector

def mult_gate(c, N, n):
    """U|y> = |c*y mod N> for y < N (and |y> for y >= N), as an n-qubit gate."""
    M = np.zeros((2**n, 2**n))
    for y in range(2**n):
        M[c * y % N if y < N else y, y] = 1
    return UnitaryGate(M, label=f"x{c} mod {N}")

def order_finding(a, N, t):
    n = N.bit_length()                              # work-register size
    qc = QuantumCircuit(t + n)
    qc.h(range(t))                                  # counting register: all x at once
    qc.x(t)                                         # work register starts in |1>
    for k in range(t):                              # controlled U^(2^k) = multiply by a^(2^k)
        c = pow(a, 2**k, N)                         # computed classically by repeated squaring
        qc.append(mult_gate(c, N, n).control(1), [k] + list(range(t, t + n)))
    qc.append(QFTGate(t).inverse(), range(t))       # inverse QFT on the counting register
    return qc

N, a, t = 15, 7, 8
probs = Statevector(order_finding(a, N, t)).probabilities_dict(qargs=range(t))
for bits, p in sorted(probs.items()):
    if p > 1e-6:
        k = int(bits, 2)
        frac = Fraction(k, 2**t).limit_denominator(N)
        print(f"measure k = {k:3d}  prob {p:.3f}  k/2^t = {k / 2**t:.4f} = {str(frac):4s}  -> r guess {frac.denominator}")
```

```text
measure k =   0  prob 0.250  k/2^t = 0.0000 = 0     -> r guess 1
measure k =  64  prob 0.250  k/2^t = 0.2500 = 1/4   -> r guess 4
measure k = 128  prob 0.250  k/2^t = 0.5000 = 1/2   -> r guess 2
measure k = 192  prob 0.250  k/2^t = 0.7500 = 3/4   -> r guess 4
```

The four outcomes 0, 64, 128 and 192 each appear 25% of the time. Divided by 2⁸ = 256, they're exactly 0, 1/4, 1/2 and 3/4: the fractions s/4 for s = 0, 1, 2, 3. Because r = 4 divides 256 exactly, the peaks are perfectly sharp.

What each outcome tells you:

- **64 or 192** (s = 1 or 3): the fraction is 1/4 or 3/4, so r = **4**. Check: 7⁴ mod 15 = 1. Success.
- **128** (s = 2): the fraction 2/4 reduces to 1/2, so the guess is 2, a **divisor** of the true order. The check 7² mod 15 = 4 ≠ 1 shows it's wrong, so you run again (or try small multiples of the guess).
- **0** (s = 0): no information. Run again.

So each run succeeds half the time, and you always know whether it did, because checking aʳ mod N = 1 is easy.

One honest note about the code: building U as a 2ⁿ × 2ⁿ matrix only works because N is tiny. For a 2048-bit N the matrix would have 2²⁰⁴⁸ rows. Real implementations build modular multiplication from **reversible arithmetic circuits**: adders made of Toffoli and CNOT gates (Lesson 13), or QFT-based adders. That arithmetic is where almost all of Shor's cost lives.

## When the period doesn't fit: N = 21 and continued fractions

For N = 21 and a = 2, the powers are 1, 2, 4, 8, 16, 11, 1, …, so r = 6. With t = 10 counting qubits, 2ᵗ/r = 1024/6 ≈ 170.67 isn't a whole number, so the peaks can't land exactly on integers. They spread over neighbouring values, just as in Lessons 26 and 27.

### Continued fractions

To turn a measured k/2ᵗ back into s/r, we need the simple fraction closest to it. **Continued fractions** do exactly that. Any number can be written as

> x = a₀ + 1/(a₁ + 1/(a₂ + 1/(a₃ + …)))

and cutting the expansion off early gives the **best simple approximations** to x, called **convergents**. For example,

> 171/1024 = 0 + 1/(5 + 1/(1 + 1/(84 + 1/2)))

whose convergents are 1/5, **1/6**, 85/509 and 171/1024. The last one with a denominator no larger than N = 21 is 1/6, so r = 6.

A classical theorem guarantees this works: if |k/2ᵗ − s/r| < 1/(2r²), then s/r is one of the convergents of k/2ᵗ. Choosing 2ᵗ ≥ N² (that is, t ≈ 2n counting qubits) makes the nearest peak close enough. That's why Shor's algorithm uses about twice as many counting qubits as N has bits. Python's `Fraction.limit_denominator(N)` performs this search for us.

```python
import numpy as np
from math import lcm
from fractions import Fraction
from collections import Counter
from itertools import product
from qiskit import QuantumCircuit
from qiskit.circuit.library import QFTGate, UnitaryGate
from qiskit.quantum_info import Statevector

def mult_gate(c, N, n):
    M = np.zeros((2**n, 2**n))
    for y in range(2**n):
        M[c * y % N if y < N else y, y] = 1
    return UnitaryGate(M)

def order_finding(a, N, t):
    n = N.bit_length()
    qc = QuantumCircuit(t + n)
    qc.h(range(t))
    qc.x(t)
    for k in range(t):
        qc.append(mult_gate(pow(a, 2**k, N), N, n).control(1), [k] + list(range(t, t + n)))
    qc.append(QFTGate(t).inverse(), range(t))
    return qc

N, a, t = 21, 2, 10                                  # the true order of 2 mod 21 is 6
probs = Statevector(order_finding(a, N, t)).probabilities_dict(qargs=range(t))
dist = {int(b, 2): p for b, p in probs.items()}

def guess(k):
    """Continued fractions: the nearest fraction s/r to k/2^t with r <= N."""
    return Fraction(k, 2**t).limit_denominator(N)

print("most likely outcomes:")
for k in sorted(sorted(dist, key=dist.get, reverse=True)[:6]):
    print(f"  k = {k:4d}  prob {dist[k]:.3f}  k/2^t = {k / 2**t:.4f}  -> {str(guess(k)):3s}  r guess {guess(k).denominator}")

step = 2**t / 6
near = sum(p for k, p in dist.items() if abs(k - step * round(k / step)) < 1)
print(f"\nP(k within 1 of a multiple of 2^t/6) = {near:.3f}")

g = Counter()                                        # probability of each r guess
for k, p in dist.items():
    g[guess(k).denominator] += p

def found(guesses):
    """Try each guess and the lcm of all of them; keep the smallest r with a^r = 1 mod N."""
    valid = [r for r in set(guesses) | {lcm(*guesses)} if pow(a, r, N) == 1]
    return min(valid, default=None) == 6

for runs in [1, 2, 3]:
    p = sum(np.prod([g[x] for x in combo]) for combo in product(g, repeat=runs) if found(combo))
    print(f"P(r = 6 found with {runs} run(s))         = {p:.3f}")
```

```text
most likely outcomes:
  k =    0  prob 0.167  k/2^t = 0.0000  -> 0    r guess 1
  k =  171  prob 0.114  k/2^t = 0.1670  -> 1/6  r guess 6
  k =  341  prob 0.114  k/2^t = 0.3330  -> 1/3  r guess 3
  k =  512  prob 0.167  k/2^t = 0.5000  -> 1/2  r guess 2
  k =  683  prob 0.114  k/2^t = 0.6670  -> 2/3  r guess 3
  k =  853  prob 0.114  k/2^t = 0.8330  -> 5/6  r guess 6

P(k within 1 of a multiple of 2^t/6) = 0.903
P(r = 6 found with 1 run(s))         = 0.322
P(r = 6 found with 2 run(s))         = 0.650
P(r = 6 found with 3 run(s))         = 0.824
```

The six biggest peaks sit at 0, 171, 341, 512, 683 and 853, the nearest whole numbers to the multiples of 170.67, and 90% of all the probability lands within 1 of a peak. Continued fractions turn each into s/6: s = 1 and 5 give r = 6 directly; s = 2 and 4 give 1/3, so the guess is 3; s = 3 gives 1/2, so the guess is 2; s = 0 gives nothing.

A single run finds r = 6 about 32% of the time. But wrong guesses are still useful: they're divisors of r, so the **least common multiple** of guesses from different runs often gives r (lcm(2, 3) = 6). With two runs the success rate is 65%, with three 82%. In general, the chance that a random s shares no factor with r shrinks only very slowly as r grows, so a handful of runs is always enough.

With r = 6: 2³ = 8, gcd(7, 21) = **7** and gcd(9, 21) = **3**. So 21 = 3 × 7.

## What it costs, and why it's exponentially faster

For an n-bit N:

- **Qubits:** the textbook circuit uses 2n counting qubits plus n work qubits, plus helpers for the arithmetic. But the counting register can be replaced by **a single qubit** that's measured and reused 2n times, with the inverse QFT done one bit at a time using the earlier results (the iterative idea of Lesson 27). Stéphane Beauregard's 2003 circuit runs Shor's algorithm with **2n + 3** logical qubits: about 4,100 for RSA-2048.
- **Gates:** dominated by the 2n controlled modular multiplications. Each takes about n additions of n-bit numbers, and each addition about n gates, so the total grows like **n³**. For n = 2048 that's billions of gates. The QFT is cheap by comparison (about n² gates, fewer with the approximate QFT of Lesson 26).

Compare the growth with the best classical method (both with constants ignored, so only the shape matters):

```python
import math

def nfs(bits):
    """Number field sieve: exp((64/9)^(1/3) (ln N)^(1/3) (ln ln N)^(2/3)), constants ignored."""
    lnN = bits * math.log(2)
    return math.exp((64 / 9) ** (1 / 3) * lnN ** (1 / 3) * math.log(lnN) ** (2 / 3))

print("RSA size    classical (NFS)   Shor (~n^3)   classical / Shor")
for bits in [512, 1024, 2048, 4096]:
    c, q = math.log10(nfs(bits)), math.log10(bits ** 3)
    print(f"{bits:4d} bits   {'10^%.1f' % c:<18s}{'10^%.1f' % q:<14s}10^{c - q:.1f}")
```

```text
RSA size    classical (NFS)   Shor (~n^3)   classical / Shor
 512 bits   10^19.2           10^8.1        10^11.1
1024 bits   10^26.1           10^9.0        10^17.1
2048 bits   10^35.2           10^9.9        10^25.3
4096 bits   10^47.1           10^10.8       10^36.3
```

Doubling the key size multiplies Shor's work by just 8, but multiplies the classical work by a factor of 10⁷ to 10¹², and that factor itself keeps growing. That's what an exponential (strictly, super-polynomial) speed-up looks like. A bigger RSA key slows the attacker down only a little, so the only real defence is to stop using RSA (Lesson 43).

The catch is that each of those billions of gates must be nearly perfect. With physical error rates around 10⁻³ (Lesson 32), the computation is impossible without **error correction**, and every logical qubit then costs hundreds to a thousand physical qubits. Lesson 35 works through why the totals reach a million.

## Beyond factoring: discrete logarithms and elliptic curves

Shor's paper solved a second problem. In the **discrete logarithm** problem you know g, p and h = gˣ mod p, and must find x. Diffie–Hellman key exchange depends on it being hard, and so does **elliptic-curve cryptography** (ECDH, ECDSA, Ed25519), which uses the same problem in a different group. Elliptic curves are used in most HTTPS connections, messaging apps like Signal, SSH logins and cryptocurrency wallets.

Shor's method extends to these with a two-variable version of period finding. And elliptic curves are an even easier target: a 256-bit curve is about as strong classically as 3072-bit RSA, but Roetteler and colleagues estimated in 2017 that breaking it needs only about **2,330 logical qubits**. Elliptic-curve cryptography may well fall before RSA does.

Simon's problem (Lesson 23), factoring and discrete logarithms are all cases of one general pattern, the **hidden subgroup problem** for commutative (abelian) groups: a function hides a repeating structure, and Fourier sampling reveals it. For non-commutative groups (connected, for example, to graph isomorphism and to some lattice problems), no efficient quantum algorithm is known. That's one reason lattice-based cryptography is believed to resist quantum attack (Lesson 43).

## What has actually been run

- **2001:** a team at IBM factored **15** with a 7-qubit **NMR** machine (Vandersypen and colleagues). Whether NMR experiments are truly quantum computations is debated, and the circuit used the special structure of 15.
- **2016:** a five-ion trapped-ion computer factored **15** with a version of the algorithm designed to scale (Monz and colleagues).
- **Claims for larger numbers** usually either don't run Shor's algorithm at all (they use annealing or variational methods, which have no proven speed-up) or use circuits **simplified using the known answer**. In 2013, Smolin, Smith and Vargo showed that with such shortcuts you can "factor" any number, however large, with two qubits, which proves the shortcut is doing all the work.
- In 2022, a team claimed a hybrid method could break RSA-2048 with 372 qubits; experts pointed out that there's no evidence the method scales, and it isn't considered a threat.
- **21 is much harder than 15.** In 2025, Craig Gidney counted the gates: the honest circuit for 21 needs more than **100 times** as many entangling gates as the one for 15, because 15 = 2⁴ − 1 makes its multiplications unusually cheap. Published "factorings of 21" have used shortcuts.

So, as of today, no quantum computer has run Shor's algorithm on any number that's hard for a pocket calculator. That isn't a sign the algorithm is wrong; it's a sign of how big the gap is between today's noisy machines and fault-tolerant ones.

## Honest status and timeline

- **Estimates keep falling.** In 2012, Fowler and colleagues estimated that factoring a 2048-bit number would take about **a billion** physical qubits for about a day. In 2019, Gidney and Ekerå brought this to about **20 million** qubits for 8 hours. In 2025, Gidney estimated **under a million** qubits for **under a week**, assuming 0.1% gate errors (Lesson 35).
- **Hardware is far from that.** Today's largest machines have around a thousand physical qubits (a few thousand trapped atoms for neutral-atom arrays), and error correction has only just started to work below threshold (Lesson 35).
- **Nobody knows the date.** Expert surveys spread their guesses over the next decade or two. But data encrypted today can be recorded and decrypted later (**harvest now, decrypt later**), and devices installed today will still be running then.
- **That's why the migration has already started.** NIST plans to deprecate RSA and elliptic-curve cryptography by 2030 and disallow them by 2035, in favour of post-quantum cryptography (Lesson 43). Symmetric ciphers like AES-256 and hash functions are only weakened by Grover's algorithm (Lesson 24), and remain safe.

## Try it

1. Toy RSA with p = 5, q = 11 and e = 3: find N, φ and d. Encrypt m = 2, then decrypt.
2. Factor N = 21 using a = 2 by hand: list the powers, find r, and compute the two gcds.
3. Does a = 4 work for N = 15? Show the steps.
4. For N = 35 and a = 2, the order is r = 12. Find the factors.
5. In the N = 15 run, outcome 128 gives the guess r = 2. Why is it wrong, and how would you notice?
6. Use continued fractions to turn the outcome k = 853 (with t = 10, N = 21) into a guess for r.
7. Why must a share no factor with N? Give two reasons.
8. Doubling the RSA key size from 2048 to 4096 bits: roughly how much harder does it get for Shor's algorithm, and for the number field sieve?

**Answers:**

1. N = **55**, φ = 4 × 10 = **40**, d = **27** (3 × 27 = 81 = 2 × 40 + 1). Encrypt: 2³ mod 55 = **8**. Decrypt: 8²⁷ mod 55 = **2**.
2. Powers of 2 mod 21: 1, 2, 4, 8, 16, 11, 1, so r = **6**. 2³ = 8; gcd(7, 21) = **7** and gcd(9, 21) = **3**.
3. **Yes.** 4¹ = 4 and 4² = 16 ≡ 1, so r = 2. a^(r/2) = 4, which isn't −1 (14). gcd(3, 15) = **3** and gcd(5, 15) = **5**.
4. 2⁶ mod 35 = 64 − 35 = 29. gcd(28, 35) = **7** and gcd(30, 35) = **5**.
5. The outcome came from s = 2, which shares a factor with r = 4, so s/r = 2/4 reduced to 1/2. Checking 7² mod 15 = 4 ≠ 1 shows that 2 isn't the order. Run again, or try multiples of 2.
6. 853/1024 ≈ 0.833, and the closest fraction with denominator at most 21 is **5/6**, so r = **6**.
7. If gcd(a, N) > 1, the gcd is already a factor, so there's nothing left to do. Also, multiplication by a would then not be reversible (two inputs would give the same output), so U wouldn't be unitary and couldn't be a quantum gate.
8. Shor's cost grows like n³, so about 2³ = **8 times** more work. The sieve's cost grows by about **10¹²** (from about 10³⁵ to 10⁴⁷ in the table).

## Cheat sheet

| Idea | Formula or fact |
|---|---|
| RSA | N = pq public; d = e⁻¹ mod (p − 1)(q − 1) needs the factors |
| Classical factoring | Number field sieve: super-polynomial; record RSA-250 (829 bits, 2020) |
| Order | Smallest r > 0 with a^r ≡ 1 (mod N) |
| Factors from r | If r is even and a^(r/2) ≢ −1: gcd(a^(r/2) ± 1, N) |
| Chance a works | At least ½ for odd N that isn't a prime power |
| Quantum step | Order finding, the only step that needs a quantum computer |
| Unitary | U\|y⟩ = \|ay mod N⟩, a permutation of basis states |
| Eigenphases | s/r, for s = 0 … r − 1; \|1⟩ is an equal mix of all eigenstates |
| Controlled powers | U^(2ᵏ) = multiply by a^(2ᵏ) mod N, found by repeated squaring |
| Counting qubits | t ≈ 2n, so 2ᵗ ≥ N² and continued fractions work |
| Continued fractions | Closest s/r to k/2ᵗ with r ≤ N; combine runs with lcm |
| Cost | About 2n + 3 logical qubits; ~n³ gates (modular arithmetic dominates) |
| Discrete log | Also broken: Diffie–Hellman and elliptic curves (~2,330 logical qubits for 256-bit) |
| Hardware runs | Only 15 honestly; 21 needs 100× more entangling gates |
| RSA-2048 estimates | ~1 billion qubits (2012) → ~20 million (2019) → under 1 million, under a week (2025) |
| Defence | Post-quantum cryptography (Lesson 43); AES-256 stays safe |
