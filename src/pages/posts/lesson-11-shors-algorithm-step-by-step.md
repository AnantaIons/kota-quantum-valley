---
layout: ../../layouts/Post.astro
title: "Shor's algorithm, step by step"
description: "How factoring turns into finding a period, worked fully for N = 15, plus an honest look at when RSA is actually at risk."
date: 2026-11-04
category: lesson
lesson: 11
---

In 1994 Peter Shor showed that a large enough quantum computer could factor huge numbers exponentially faster than any known classical method. That threatens RSA, the encryption behind much of the internet. Here's how it works, worked by hand for N = 15.

## Step 0: why factoring matters

RSA is safe because multiplying two big primes is easy, but splitting the product back apart is extremely hard. A 2048-bit RSA number would take classical computers far longer than the age of the universe.

## The big idea: factoring = finding a period

Pick a number a that shares no factor with N. Look at the sequence

```
f(x) = aˣ mod N
```

It always **repeats**. If the period r is even, then

```
gcd(a^(r/2) − 1, N)   and   gcd(a^(r/2) + 1, N)
```

usually give you the factors of N. Finding r classically is as hard as factoring. **Finding r quantumly is easy**, thanks to the QFT (Lesson 10).

## Worked example: N = 15, a = 7

**1. Compute the sequence** (on a classical computer here, to see the pattern):

| x | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|---|
| 7ˣ mod 15 | 1 | 7 | 4 | 13 | 1 | 7 | 4 | 13 |

**2. Read the period:** it repeats every **r = 4**.

**3. Use the formula:** 7^(4/2) = 49.

- gcd(49 − 1, 15) = gcd(48, 15) = **3**
- gcd(49 + 1, 15) = gcd(50, 15) = **5**

**15 = 3 × 5.** Done.

```python
import math
N, a = 15, 7
print([pow(a, x, N) for x in range(8)])        # [1, 7, 4, 13, 1, 7, 4, 13]
r = 4
print(math.gcd(a**(r//2) - 1, N), math.gcd(a**(r//2) + 1, N))   # 3 5
```

## Where the quantum computer comes in

For a 2048-bit N, you can't list the sequence: it could have more terms than there are atoms in the universe. The quantum part does this instead:

1. Put a register into a superposition of **all** x at once.
2. Compute aˣ mod N into a second register, in superposition (**modular exponentiation**, the most expensive part).
3. Apply the **QFT** to the first register. Because f repeats every r steps, the amplitudes interfere so that measurement gives a multiple of N/r with high probability.
4. A few runs plus a classical trick (continued fractions) recover r.
5. The gcd step is classical and fast.

Only step 3's period-finding needs quantum hardware; everything else is ordinary maths.

## Sometimes it fails, and that's fine

If r is odd, or a^(r/2) ≡ −1 mod N, that choice of a doesn't work. Pick another a and repeat. A random a works with probability at least 1/2, so a few tries suffice.

## Honest status

- The largest numbers factored by **true** Shor runs on real hardware are tiny (like 15 and 21), often with shortcuts.
- Breaking RSA-2048 is estimated to need on the order of **a million noisy physical qubits** running for about a week, with error correction (a 2025 estimate by Google researchers). Today's machines have hundreds to low thousands of physical qubits.
- That's why governments are migrating to **post-quantum cryptography** now (Lesson 5): data stolen today could be decrypted later ("harvest now, decrypt later").

## Try it

1. Repeat the worked example with N = 21, a = 2. What is the period? What factors do you get?
2. Try N = 15, a = 4. Does it work?
3. Why must a share no common factor with N? (Hint: what would gcd(a, N) tell you directly?)
