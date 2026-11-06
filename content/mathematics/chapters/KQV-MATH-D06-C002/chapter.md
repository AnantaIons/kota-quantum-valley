---
id: KQV-MATH-D06-C002
course: "Course 2: Mathematics for Quantum Science"
domain: D06
chapter_number: 2
title: "Meeting i: Arithmetic with a + bi"
subtitle: "Adding, multiplying and raising to powers with i, from the first calculation to Gaussian integers and the two-squares theorem."
language: en
level: L1
ceiling: T5
prerequisites: "Chapter 1; expanding brackets; the binomial theorem for small powers. The university sections also use divisibility and remainders of integers."
estimated_minutes: 110
version: 0.1.0
status: mathematically_checked
publication_status: published
---

# Chapter 2 · Meeting i: Arithmetic with a + bi

Here is a calculation that looks impossible without a computer:

$$
(1+i)^{100}=\ ?
$$

Multiplying $1+i$ by itself a hundred times would take an afternoon. By the end of Section 2.6 you will do it in your head in under a minute, and the answer is the ordinary integer $-2^{50}$. The same idea will add up alternating sums of binomial coefficients that would otherwise need hundreds of terms, and in Section 2.8 it will tell us exactly which prime numbers can be written as a sum of two squares.

Chapter 1 showed that we *need* a number $i$ with $i^2=-1$. This chapter learns to *calculate* with it fluently, which is what every later chapter, and every quantum computation, depends on.

> **Driving question:** What does arithmetic look like once $i^2=-1$ is allowed, and what hidden patterns does $i$ reveal in ordinary numbers?

## 2.1 · What this chapter covers

By the end of this chapter you should be able to:

- add, subtract and multiply numbers of the form $a+bi$ quickly and without errors;
- reduce any power of $i$, and sum long runs of powers;
- compute powers such as $(1+i)^n$ and $(1+\omega)^n$ by finding a power that is real;
- turn sums of binomial coefficients into real and imaginary parts of such powers, including the "roots of unity filter";
- calculate with $\omega=\tfrac{-1+i\sqrt3}{2}$, the cube root of unity that appears throughout JEE problems;
- work in the Gaussian integers $\mathbb{Z}[i]$: norms, units, primes and division with remainder;
- prove which primes are sums of two squares, and find the squares;
- represent complex numbers as $2\times2$ real matrices, and recognise the same arithmetic in quantum gates.

**Not in this chapter.** Division of complex numbers is Chapter 7 (we will divide only in special cases we can check by multiplying). The conjugate $a-bi$ appears here as a useful partner; its full theory is Chapter 6. Pictures in the plane appear as previews; the plane itself is Chapter 10. Angles and polar form are Chapters 21 to 23.

**Levels.** Sections 2.2 to 2.5 are Class 10 to 12. Sections 2.6 and 2.7 reach JEE Advanced. Sections 2.8 and 2.9 are university level. The problem ladder climbs through all five tiers: foundation, board and JEE Main, JEE Advanced, olympiad, and university.

### Prerequisite check

1. Expand $(x+y)^3$.
2. Write down the binomial expansion of $(1+t)^4$.
3. What is the remainder when 2026 is divided by 4?

*Answers:* (1) $x^3+3x^2y+3xy^2+y^3$. (2) $1+4t+6t^2+4t^3+t^4$. (3) $2026=4\cdot506+2$, remainder 2.

## 2.2 · The ground rules

We work under the assumption of Section 1.7, which Chapters 4 and 5 will prove consistent:

> There is a number system containing the real numbers, with addition and multiplication obeying the usual laws (commutative, associative, distributive, with $0$ and $1$ as before), and containing a number $i$ with $i^2=-1$.

**Definition.** A number of the form $a+bi$ with $a,b$ real is written in **standard form**. The real number $a$ is its **real part**, written $\operatorname{Re}(a+bi)=a$, and the real number $b$ is its **imaginary part**, $\operatorname{Im}(a+bi)=b$. Note that the imaginary part is the *real* number $b$, not $bi$.

Real numbers are the case $b=0$, and numbers $bi$ with $a=0$ are called **purely imaginary**. Chapter 3 proves the fact we will use freely: two numbers in standard form are equal only when their real parts are equal *and* their imaginary parts are equal.

**Theorem 2.1 (closure).** *Any expression built from real numbers and $i$ using addition, subtraction and multiplication can be written in standard form $a+bi$.*

*Proof.* Every real number $r$ is $r+0i$, and $i$ is $0+1i$, so the building blocks are in standard form. Sections 2.3 and 2.4 show that the sum, difference and product of two numbers in standard form is again in standard form. An expression is built by applying these operations finitely many times, so (by induction on the number of operations) its value is in standard form. ∎

This is why we never need "$i^2$" or "$i^3$" in a final answer, and why complex arithmetic never runs out of room: the form $a+bi$ is closed under the three operations.

## 2.3 · Addition and subtraction

Using the commutative, associative and distributive laws,

$$
\begin{aligned}(a+bi)+(c+di)&=(a+c)+(b+d)i,\\ (a+bi)-(c+di)&=(a-c)+(b-d)i.\end{aligned}
$$

Real parts add to real parts and imaginary parts to imaginary parts, just as like terms combine in algebra. The additive inverse of $a+bi$ is $-a-bi$, and $0=0+0i$ is the zero.

**Example.** $(3+5i)+(2-7i)-(4-i)=(3+2-4)+(5-7+1)i=1-i$.

If we draw $a+bi$ as the point $(a,b)$ and an arrow from the origin, addition is exactly the addition of arrows: place them head to tail, or complete the parallelogram. This picture becomes precise in Chapter 11.

![Adding 2 + i and 1 + 3i. The arrows add head to tail, and the sum 3 + 4i is the far corner of the parallelogram they span.](diagram:c2-add)

## 2.4 · Multiplication

Multiply as you would multiply any two brackets, then use $i^2=-1$:

$$
\begin{aligned}(a+bi)(c+di)&=ac+adi+bci+bd\,i^2\\&=(ac-bd)+(ad+bc)i.\end{aligned}
$$

Do not memorise this formula; reproduce it every time by expanding and replacing $i^2$ by $-1$. Errors almost always come from forgetting that last step or from dropping a cross term.

**Examples.**

$$
\begin{aligned}(3+2i)(1-4i)&=3-12i+2i-8i^2\\&=3+8-10i=11-10i,\end{aligned}
$$

$$
\begin{aligned}(2+i)^2&=4+4i+i^2=3+4i,\\ (1+i)^2&=1+2i+i^2=2i.\end{aligned}
$$

### Three products worth knowing by heart

**1. A number times its partner.** For real $a,b$,

$$
(a+bi)(a-bi)=a^2-(bi)^2=a^2+b^2.
$$

The result is real and never negative. In words: *a sum of two squares factors over the complex numbers.* We call $a-bi$ the **conjugate** of $a+bi$ (Chapter 6 studies it properly). This one identity drives division (Chapter 7), the modulus (Chapter 12), measurement probabilities in quantum mechanics, and the number theory of Section 2.8.

**2. Squares and cubes in standard form.**

$$
\begin{aligned}(a+bi)^2&=(a^2-b^2)+2ab\,i,\\ (a+bi)^3&=(a^3-3ab^2)+(3a^2b-b^3)\,i.\end{aligned}
$$

The cube formula is exactly what Bombelli needed in Chapter 1: $(2+i)^3=(8-6)+(12-1)i=2+11i$.

**3. Multiplication by $i$.** $i(a+bi)=ai+bi^2=-b+ai$. On points, $(a,b)\mapsto(-b,a)$, which is a quarter turn anticlockwise about the origin. Doing it four times returns every point to where it started, matching $i^4=1$.

![Multiplying by i turns every point a quarter turn about 0. Starting from z = 3 + i, the points z, iz, i²z = −z and i³z = −iz form a square.](diagram:c2-rot)

**Multiplication by a real number** $r$ simply scales: $r(a+bi)=ra+rbi$. So multiplying by $2i$ means "turn a quarter and double the length". Chapter 22 shows that every complex multiplication is a rotation combined with a scaling.

## 2.5 · Powers of $i$

Since $i^2=-1$, the powers of $i$ repeat with period 4:

| $n$ | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|---|
| $i^n$ | $1$ | $i$ | $-1$ | $-i$ | $1$ | $i$ | $-1$ | $-i$ |

**Rule.** *If $n=4q+r$ with $0\le r\le3$, then $i^n=i^r$.* Proof: $i^n=(i^4)^q\,i^r=1^q\,i^r=i^r$.

Only the **remainder** matters. For $n=2027$: $2027=4\cdot506+3$, so $i^{2027}=i^3=-i$.

**Negative powers** work too, without any division formula. Since $i\cdot(-i)=-i^2=1$, the number $-i$ is the reciprocal of $i$: $i^{-1}=-i$. Then $i^{-n}=(i^{-1})^n$, and the same period-4 rule holds for all integers $n$. For example $i^{-3}=i^{-4}\,i=i$.

### Sums and products of powers

Four consecutive powers always cancel:

$$
\begin{aligned}i^k+i^{k+1}+i^{k+2}+i^{k+3}&=i^k(1+i-1-i)\\&=0.\end{aligned}
$$

So in $S_n=\sum_{k=0}^{n}i^k$ only the last incomplete block survives:

| $n \bmod 4$ | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| $S_n$ | $1$ | $1+i$ | $i$ | $0$ |

For products, exponents add: $i\cdot i^2\cdots i^n=i^{1+2+\dots+n}=i^{n(n+1)/2}$.

## 2.6 · Powers of $1+i$, and binomial sums

The trick for $(1+i)^{100}$ is to find a small power that is real.

$$
\begin{gathered}(1+i)^2=2i,\qquad (1+i)^4=(2i)^2=-4,\\ (1+i)^8=16.\end{gathered}
$$

Once a power is real, everything else is bookkeeping: $(1+i)^{4m}=(-4)^m$. So

$$
\begin{aligned}(1+i)^{100}&=\big((1+i)^4\big)^{25}=(-4)^{25}\\&=-4^{25}=-2^{50}.\end{aligned}
$$

In general, write $n=4m+r$ with $0\le r\le3$; then $(1+i)^n=(-4)^m(1+i)^r$, where

$$
\begin{gathered}(1+i)^0=1,\qquad (1+i)^1=1+i,\\ (1+i)^2=2i,\qquad (1+i)^3=-2+2i.\end{gathered}
$$

The same works for $1-i$, since $(1-i)^2=-2i$ and $(1-i)^4=-4$.

![The powers (1 + i)ⁿ for n = 0 to 7. Each step turns by an eighth of a full turn and stretches the length by √2, so every two steps the length doubles and every four steps the point lands on the real axis: (1 + i)⁴ = −4 and (1 + i)⁸ = 16.](diagram:c2-spiral)

### Binomial sums from real and imaginary parts

By the binomial theorem, and $i^k$ running through $1,i,-1,-i$,

$$
\begin{aligned}(1+i)^n&=\sum_{k=0}^{n}\binom nk i^k\\
&=\Big[\binom n0-\binom n2+\binom n4-\cdots\Big]\\
&\quad+i\Big[\binom n1-\binom n3+\binom n5-\cdots\Big].\end{aligned}
$$

Comparing real and imaginary parts:

$$
\begin{aligned}\binom n0-\binom n2+\binom n4-\cdots&=\operatorname{Re}(1+i)^n,\\ \binom n1-\binom n3+\binom n5-\cdots&=\operatorname{Im}(1+i)^n.\end{aligned}
$$

**Example ($n=10$).** $(1+i)^{10}=(-4)^2(1+i)^2=16\cdot2i=32i$. So

$$
\begin{gathered}1-45+210-210+45-1=0\quad\text{and}\\ 10-120+252-120+10=32.\end{gathered}
$$

### The roots-of-unity filter

Now a sharper question: what is $\binom n0+\binom n4+\binom n8+\cdots$, the sum over $k$ divisible by 4? The key fact is

$$
1+(-1)^k+i^k+(-i)^k=\begin{cases}4 & \text{if } 4\mid k,\\ 0 & \text{otherwise.}\end{cases}
$$

(Check the four cases $k\equiv0,1,2,3\pmod4$: $1+1+1+1$, $1-1+i-i$, $1+1-1-1$, $1-1-i+i$.) Multiply by $\binom nk$ and sum over $k$:

$$
\begin{aligned}\sum_{4\mid k}\binom nk=\frac14\Big[&(1+1)^n+(1-1)^n\\&+(1+i)^n+(1-i)^n\Big].\end{aligned}
$$

For $n\ge1$ the term $(1-1)^n$ is $0$, and $(1-i)^n$ is the conjugate partner of $(1+i)^n$, so the sum is $\tfrac14\big(2^n+2\operatorname{Re}(1+i)^n\big)$.

**Example ($n=8$).** $\tfrac14(256+16+16)=72$, and indeed $\binom80+\binom84+\binom88=1+70+1=72$.

This is the idea behind a whole family of olympiad and JEE Advanced problems: to pick out every $q$th term of a sum, average over the $q$ numbers whose $q$th power is 1. For $q=4$ those are $1,i,-1,-i$; for $q=3$ they are $1,\omega,\omega^2$, which we meet next. Chapter 24 develops the general version.

## 2.7 · The cube root of unity $\omega$

Let

$$
\omega=\frac{-1+i\sqrt3}{2}.
$$

**Direct computation.** $\omega^2=\dfrac{1-2i\sqrt3+3i^2}{4}=\dfrac{-2-2i\sqrt3}{4}=\dfrac{-1-i\sqrt3}{2}$, and

$$
\begin{aligned}\omega^3=\omega\cdot\omega^2&=\frac{(-1+i\sqrt3)(-1-i\sqrt3)}{4}\\&=\frac{1+3}{4}=1.\end{aligned}
$$

Adding, $1+\omega+\omega^2=1+\dfrac{-1+i\sqrt3}{2}+\dfrac{-1-i\sqrt3}{2}=0$.

So $1$, $\omega$ and $\omega^2$ are three different numbers whose cube is 1. They are the roots of $x^3-1=(x-1)(x^2+x+1)$.

![The three cube roots of 1: 1, ω = (−1 + i√3)/2 and ω² = (−1 − i√3)/2. They sit at the corners of an equilateral triangle, and their sum, 0, is the triangle's centre.](diagram:c2-omega)

**The identities to use.**

- $\omega^3=1$, so $\omega^n$ depends only on $n \bmod 3$.
- $1+\omega+\omega^2=0$, so $1+\omega=-\omega^2$, $1+\omega^2=-\omega$ and $\omega+\omega^2=-1$.
- $a^3-b^3=(a-b)(a-b\omega)(a-b\omega^2)$ and $a^2+ab+b^2=(a-b\omega)(a-b\omega^2)$.
- $a^3+b^3=(a+b)(a+b\omega)(a+b\omega^2)$ and $a^2-ab+b^2=(a+b\omega)(a+b\omega^2)$.

*Proof of the fourth line.* $(a+b\omega)(a+b\omega^2)=a^2+ab(\omega+\omega^2)+b^2\omega^3=a^2-ab+b^2$, and multiplying by $a+b$ gives $a^3+b^3$. The third line is the same with $b$ replaced by $-b$. ∎

**Filter for multiples of 3.** Exactly as with $i$, $1+\omega^k+\omega^{2k}$ is $3$ when $3\mid k$ and $0$ otherwise (it is $1+\omega+\omega^2$ or $1+\omega^2+\omega^4=1+\omega^2+\omega$). Therefore

$$
\begin{aligned}\sum_{3\mid k}\binom nk&=\frac13\Big[2^n+(1+\omega)^n+(1+\omega^2)^n\Big]\\&=\frac13\Big[2^n+(-1)^n\big(\omega^{2n}+\omega^n\big)\Big].\end{aligned}
$$

If $3\mid n$ the bracket $\omega^{2n}+\omega^n$ is $2$; otherwise it is $\omega+\omega^2=-1$. For $n=6$: $\tfrac13(64+2)=22=1+20+1$.

## 2.8 · Gaussian integers (university level)

Restrict $a$ and $b$ to integers. The set

$$
\mathbb{Z}[i]=\{a+bi : a,b\in\mathbb{Z}\}
$$

is closed under addition, subtraction and multiplication (by the formulas of Sections 2.3 and 2.4). Its elements are the **Gaussian integers**: the lattice points of the plane. They let us use complex arithmetic to answer questions about ordinary whole numbers.

**Definition.** The **norm** of $z=a+bi$ is $N(z)=a^2+b^2=(a+bi)(a-bi)$, a nonnegative integer that is $0$ only for $z=0$.

**Theorem 2.2 (the norm is multiplicative).** *$N(zw)=N(z)N(w)$.*

*Proof.* With $z=a+bi$ and $w=c+di$, $zw=(ac-bd)+(ad+bc)i$, so

$$
\begin{aligned}N(zw)&=(ac-bd)^2+(ad+bc)^2\\&=a^2c^2+b^2d^2+a^2d^2+b^2c^2\\&=(a^2+b^2)(c^2+d^2),\end{aligned}
$$

since the cross terms $-2abcd$ and $+2abcd$ cancel. ∎

Read with integers, Theorem 2.2 is the **two-square identity**: *a product of two sums of two squares is again a sum of two squares.* And the choice of $w$ or its partner gives two representations. For $65=5\cdot13$:

$$
\begin{gathered}(1+2i)(2+3i)=-4+7i,\\ (1+2i)(2-3i)=8+i,\\ \text{so}\quad 65=4^2+7^2=8^2+1^2.\end{gathered}
$$

![Gaussian integers are the lattice points. The circle of norm 5 passes through eight of them (±1 ± 2i and ±2 ± i), and the circle of norm 25 through twelve. The highlighted points 2 + i and 2 − i multiply to 5.](diagram:c2-lattice)

### Units, primes and division with remainder

A **unit** is a Gaussian integer $u$ with $uv=1$ for some Gaussian integer $v$.

**Proposition 2.3.** *The units of $\mathbb{Z}[i]$ are $1,-1,i,-i$.*

*Proof.* If $uv=1$ then $N(u)N(v)=N(1)=1$, and norms are positive integers, so $N(u)=1$: $a^2+b^2=1$, giving $(a,b)=(\pm1,0)$ or $(0,\pm1)$. All four are units: $1\cdot1=(-1)(-1)=i(-i)=1$. ∎

Two Gaussian integers that differ by a unit factor are **associates**. A non-zero, non-unit Gaussian integer $\pi$ is **irreducible** (a *Gaussian prime*) if every factorisation $\pi=\alpha\beta$ has $\alpha$ or $\beta$ a unit.

**Useful test.** If $N(\pi)$ is a prime number, $\pi$ is a Gaussian prime: a factorisation $\pi=\alpha\beta$ gives $N(\alpha)N(\beta)=N(\pi)$, so one norm is 1. Thus $1+i$ (norm 2) and $2\pm i$ (norm 5) are Gaussian primes. On the other hand, $2=(1+i)(1-i)$ and $5=(2+i)(2-i)$ are *not* Gaussian primes, while $3$ is: if $3=\alpha\beta$ with neither a unit, then $N(\alpha)=3$, but no sum of two squares equals 3.

**Theorem 2.4 (division with remainder).** *For Gaussian integers $\alpha,\beta$ with $\beta\ne0$ there are Gaussian integers $\kappa,\rho$ with $\alpha=\kappa\beta+\rho$ and $N(\rho)<N(\beta)$.*

*Proof.* Let $\bar\beta$ be the partner of $\beta$ (change the sign of its imaginary part), so $\beta\bar\beta=n=N(\beta)$, a positive integer. Write $\alpha\bar\beta=x+yi$ with integers $x,y$. Choose integers $p,q$ nearest to $x/n$ and $y/n$, so that $|x-pn|\le\tfrac n2$ and $|y-qn|\le\tfrac n2$. Put $\kappa=p+qi$ and $\rho=\alpha-\kappa\beta$. Then

$$
\rho\bar\beta=\alpha\bar\beta-\kappa n=(x-pn)+(y-qn)i,
$$

so $N(\rho)\,n=N(\rho\bar\beta)=(x-pn)^2+(y-qn)^2\le\tfrac{n^2}{4}+\tfrac{n^2}{4}=\tfrac{n^2}{2}$, using $N(\bar\beta)=N(\beta)=n$. Dividing by $n$, $N(\rho)\le\tfrac n2<n$. ∎

**Example.** Divide $\alpha=7+5i$ by $\beta=2+i$. Here $\alpha\bar\beta=(7+5i)(2-i)=19+3i$ and $n=5$. Rounding $19/5$ and $3/5$ gives $\kappa=4+i$, and $\rho=7+5i-(4+i)(2+i)=7+5i-(7+6i)=-i$, with $N(\rho)=1<5$.

**Theorem 2.5 (Euclid's lemma in $\mathbb{Z}[i]$).** *If a Gaussian prime $\pi$ divides a product $\alpha\beta$, then $\pi$ divides $\alpha$ or $\pi$ divides $\beta$.*

*Proof.* Let $S=\{\alpha x+\pi y:\ x,y\in\mathbb{Z}[i]\}$ and choose $\delta\in S$, $\delta\ne0$, of smallest norm. For any $s\in S$, Theorem 2.4 gives $s=\kappa\delta+\rho$ with $N(\rho)<N(\delta)$; but $\rho=s-\kappa\delta\in S$, so by minimality $\rho=0$. Hence $\delta$ divides every element of $S$, in particular $\alpha$ and $\pi$. Since $\pi$ is a Gaussian prime and $\delta\mid\pi$, either $\delta$ is a unit or $\delta$ is an associate of $\pi$. If $\delta$ is an associate of $\pi$, then $\pi\mid\alpha$. If $\delta$ is a unit, then $1=\delta\delta^{-1}\in S$, so $1=\alpha x+\pi y$ for some $x,y$, and multiplying by $\beta$ gives $\beta=(\alpha\beta)x+\pi(\beta y)$, which $\pi$ divides. ∎

From Theorem 2.5 the usual argument gives **unique factorisation**: every non-zero, non-unit Gaussian integer is a product of Gaussian primes, uniquely up to order and unit factors (existence by induction on the norm; uniqueness by cancelling one prime at a time using Theorem 2.5).

### Which primes are sums of two squares?

**Lemma 2.6 (Wilson).** *For a prime $p$, $(p-1)!\equiv-1\pmod p$.*

*Proof.* For $p=2,3$ check directly. For $p\ge5$, each $k$ in $\{1,\dots,p-1\}$ has a unique inverse $k'$ in that set with $kk'\equiv1\pmod p$. We have $k'=k$ only when $k^2\equiv1$, that is $p\mid(k-1)(k+1)$, so $k=1$ or $k=p-1$. The numbers $2,\dots,p-2$ therefore pair off into pairs with product $\equiv1$, and $(p-1)!\equiv1\cdot(p-1)\equiv-1$. ∎

**Theorem 2.7 (two squares).** *An odd prime $p$ is a sum of two squares of integers if and only if $p\equiv1\pmod4$.*

*Proof.* *Only if.* Squares are $\equiv0$ or $1\pmod4$, so $a^2+b^2\equiv0,1$ or $2\pmod4$. An odd prime that is a sum of two squares is therefore $\equiv1\pmod4$.

*If.* Let $p\equiv1\pmod4$ and $x=\big(\tfrac{p-1}2\big)!$. Pairing $k$ with $p-k$ in Wilson's theorem,

$$
\begin{aligned}-1&\equiv(p-1)!\\&=\prod_{k=1}^{(p-1)/2}k\,(p-k)\\&\equiv\prod_{k=1}^{(p-1)/2}(-k^2)\\&=(-1)^{(p-1)/2}x^2=x^2\pmod p,\end{aligned}
$$

since $\tfrac{p-1}2$ is even. So $p$ divides $x^2+1=(x+i)(x-i)$. If $p$ were a Gaussian prime, Theorem 2.5 would give $p\mid x+i$ or $p\mid x-i$, so $\tfrac xp\pm\tfrac1p\,i$ would be a Gaussian integer, which is false because $\tfrac1p$ is not an integer. Hence $p=\alpha\beta$ with neither factor a unit. Then $N(\alpha)N(\beta)=N(p)=p^2$ with $N(\alpha),N(\beta)>1$, so $N(\alpha)=p$: writing $\alpha=a+bi$, $p=a^2+b^2$. ∎

**The proof is also an algorithm.** For $p=13$: $x=6!=720\equiv5\pmod{13}$ and $5^2=25\equiv-1$. Running the Euclidean algorithm of Theorem 2.4 on $13$ and $5+i$ (Problem T5.5) gives the common factor $3-2i$, and $13=3^2+2^2$.

## 2.9 · Complex numbers as matrices, and the arithmetic of quantum gates

Here is a concrete system in which every rule of Section 2.2 visibly holds. To each $a+bi$ assign the real matrix

$$
M(a,b)=\begin{pmatrix}a&-b\\ b&a\end{pmatrix}.
$$

Then $M(a,b)+M(c,d)=M(a+c,\,b+d)$, and

$$
\begin{aligned}M(a,b)\,M(c,d)&=\begin{pmatrix}ac-bd&-(ad+bc)\\ ad+bc&ac-bd\end{pmatrix}\\&=M(ac-bd,\ ad+bc),\end{aligned}
$$

exactly the multiplication rule of Section 2.4. Real numbers become $M(a,0)=aI$, and $i$ becomes

$$
J=M(0,1)=\begin{pmatrix}0&-1\\1&0\end{pmatrix},\qquad J^2=-I.
$$

Matrix multiplication is associative and distributive, these particular matrices commute with each other (the product formula is symmetric), and $\det M(a,b)=a^2+b^2$, the norm again. Problem T5.7 completes the argument that this family is a field. So the system Bombelli imagined *exists*: it can be built out of real matrices. Chapter 4 gives the standard construction from pairs of reals, and Chapter 22 explains why $J$ is the matrix of a quarter turn.

### Quantum bridge: $i$ inside the Pauli matrices

The three basic one-qubit gates are the Pauli matrices

$$
\begin{gathered}X=\begin{pmatrix}0&1\\1&0\end{pmatrix},\qquad
Y=\begin{pmatrix}0&-i\\ i&0\end{pmatrix},\\
Z=\begin{pmatrix}1&0\\0&-1\end{pmatrix}.\end{gathered}
$$

Their products are pure complex arithmetic. For example

$$
\begin{aligned}XY&=\begin{pmatrix}0\cdot0+1\cdot i & 0\cdot(-i)+1\cdot0\\ 1\cdot0+0\cdot i & 1\cdot(-i)+0\cdot0\end{pmatrix}\\&=\begin{pmatrix}i&0\\0&-i\end{pmatrix}=iZ,\end{aligned}
$$

and in the same way $YZ=iX$, $ZX=iY$, while $YX=-iZ$. So the order of two gates can change the result by the factor $-1$, and factors of $i$ appear constantly in quantum circuits.

**Why a factor of $i$ does not change probabilities.** A measurement probability is $|a+bi|^2=a^2+b^2$, the norm of the amplitude. Multiplying the amplitude by $i$ gives $-b+ai$, with norm $b^2+a^2$, unchanged. Chapter 64 turns this into the precise statement that a *global* phase is unobservable, while a *relative* phase is not.

## 2.10 · Toolkit

1. **Expand, then replace $i^2$ by $-1$ at once.** Every product. Never carry $i^2$ to the next line.
2. **Reduce powers of $i$ by the remainder mod 4,** never the quotient. Negative powers: $i^{-1}=-i$.
3. **Cancel blocks of four consecutive powers** of $i$ (and blocks of three of $\omega$) in long sums.
4. **Hunt for a real power.** $(1\pm i)^2=\pm2i$, $(1\pm i)^4=-4$; $(1+\omega)=-\omega^2$, $(-\omega^2)^3=-1$. Then use exponent arithmetic.
5. **Read binomial sums as real or imaginary parts** of $(1+i)^n$ (alternating sums with step 2) or use the **roots-of-unity filter** (every 4th term with $1,\pm1,\pm i$; every 3rd with $1,\omega,\omega^2$).
6. **Use the partner $a-bi$:** $(a+bi)(a-bi)=a^2+b^2$. It turns complex questions into real ones and powers Euclidean division.
7. **Move between sums of squares and Gaussian integers** with the multiplicative norm. Factor primes $p\equiv1\pmod4$ as $p=(a+bi)(a-bi)$, and multiply factors to build new representations.
8. **Work modulo a prime on the real and imaginary parts** when a power must be shown never to be real, or never zero (Problem T4.1).
9. **Check an identity in the matrix model** $a+bi\mapsto\begin{pmatrix}a&-b\\b&a\end{pmatrix}$ when an algebraic manipulation looks suspicious.

## 2.11 · Misconceptions to avoid

**"$i=-1$."** No: $i^2=-1$. The number $i$ is not real at all (Theorem 1.1).

**"$(a+bi)^2=a^2+b^2i^2=a^2-b^2$."** This forgets the cross term. Correctly $(a+bi)^2=(a^2-b^2)+2abi$.

**"$i^{2026}=i^{506}$ because $2026=4\cdot506+2$."** The exponent that matters is the remainder 2, not the quotient: $i^{2026}=i^2=-1$.

**"The imaginary part of $3-4i$ is $-4i$."** It is $-4$, a real number.

**"$(1+i)^n$ is never real."** It is real exactly when $4\mid n$ (Problem T3.4 proves a stronger statement).

**"$\omega$ is the cube root of 1."** There are three: $1,\omega,\omega^2$. Which one a problem means must be read from the context ("a non-real cube root of unity" means $\omega$ or $\omega^2$, and good solutions work for both).

**"If $a^2+b^2=c^2+d^2$ then $c+di$ is $a+bi$ up to signs and order."** False: $65=1^2+8^2=4^2+7^2$. Different factorisations in $\mathbb{Z}[i]$ give different representations.

**"$2i>i$."** The complex numbers have no ordering compatible with arithmetic (Chapter 8); inequalities between non-real numbers are meaningless.

## 2.12 · Problem ladder

Tiers: T1 foundation, T2 board and JEE Main, T3 JEE Advanced, T4 olympiad, T5 university. Try each problem first; every answer gives the key idea and the trap to avoid.

### Tier 1 · Foundation

**T1.1** Simplify $(3+5i)+(2-7i)-(4-i)$.

**T1.2** Expand $(4-3i)(2+5i)$.

**T1.3** Compute $(2+i)^2$ and $(2+i)^3$.

**T1.4** Simplify $i^{17}$, $i^{-3}$ and $i^{2026}$.

**T1.5** Show that $(5+12i)(5-12i)$ is real and find it.

**T1.6** Find $i+i^2+i^3+\cdots+i^{10}$.

**T1.7** Compute $i(3-2i)$. What happened to the point $(3,-2)$?

**T1.8** Write $(1+i)^4$ in standard form.

### Answers: Tier 1

**T1.1** $(3+2-4)+(5-7+1)i=1-i$.

**T1.2** $8+20i-6i-15i^2=8+15+14i=23+14i$. *Trap:* $-3i\cdot5i=-15i^2=+15$, not $-15$.

**T1.3** $(2+i)^2=4+4i-1=3+4i$; $(2+i)^3=(2+i)(3+4i)=6+8i+3i+4i^2=2+11i$.

**T1.4** $17=4\cdot4+1$, so $i^{17}=i$. $i^{-3}=i^{-4}\,i=i$. $2026\equiv2\pmod4$, so $i^{2026}=-1$.

**T1.5** $25-(12i)^2=25+144=169$.

**T1.6** $i+\dots+i^8$ is two full blocks, sum $0$; the rest is $i^9+i^{10}=i-1$. Answer $-1+i$.

**T1.7** $3i-2i^2=2+3i$. The point $(3,-2)$ moved to $(2,3)$: a quarter turn anticlockwise about the origin.

**T1.8** $(1+i)^2=2i$, so $(1+i)^4=(2i)^2=-4$.

### Tier 2 · Board and JEE Main

**T2.1** Find real $x,y$ with $(x+iy)(2-3i)=4+i$.

**T2.2** Find the least positive integer $n$ for which $(1+i)^n$ is a positive real number.

**T2.3** Evaluate $\sum_{k=0}^{100}i^k$.

**T2.4** For a non-real cube root of unity $\omega$, evaluate $(1-\omega+\omega^2)(1+\omega-\omega^2)$.

**T2.5** Write $(1+\omega)^7$ in the form $A+B\omega$ with real $A,B$.

**T2.6** Find all real $a,b$ with $(a+bi)^2=-5+12i$.

**T2.7** Show that $(1+i)^{2n}+(1-i)^{2n}=0$ for every odd $n$, and find its value for $n=2$.

**T2.8** Express $(2+3i)^3$ in standard form.

### Answers: Tier 2

**T2.1** Expand: $(2x+3y)+(2y-3x)i=4+i$. Equating parts (Chapter 3): $2x+3y=4$ and $-3x+2y=1$. Then $13y=14$, so $y=\tfrac{14}{13}$ and $x=\tfrac{5}{13}$.

**T2.2** $(1+i)^4=-4$ is real but negative; $(1+i)^8=16$. Powers $n$ with $n\not\equiv0\pmod4$ are not real (Section 2.6 table). So $n=8$.

**T2.3** $k=0,\dots,99$ is 25 full blocks, sum $0$; plus $i^{100}=1$. Answer $1$.

**T2.4** $1+\omega^2=-\omega$, so $1-\omega+\omega^2=-2\omega$; similarly $1+\omega-\omega^2=-2\omega^2$. The product is $4\omega^3=4$.

**T2.5** $1+\omega=-\omega^2$, so $(1+\omega)^7=-\omega^{14}=-\omega^2=1+\omega$. So $A=B=1$.

**T2.6** $a^2-b^2=-5$ and $2ab=12$. Substituting $b=\tfrac6a$: $a^4+5a^2-36=0$, i.e. $(a^2+9)(a^2-4)=0$, so $a^2=4$ (as $a$ is real). Hence $(a,b)=(2,3)$ or $(-2,-3)$. *Check:* $(2+3i)^2=4+12i-9=-5+12i$.

**T2.7** $(1+i)^{2n}=(2i)^n$ and $(1-i)^{2n}=(-2i)^n$, so the sum is $(2i)^n\big(1+(-1)^n\big)$, which is $0$ for odd $n$. For $n=2$: $2(2i)^2=-8$.

**T2.8** $(2+3i)^2=-5+12i$; then $(-5+12i)(2+3i)=-10-15i+24i+36i^2=-46+9i$.

### Tier 3 · JEE Advanced

**T3.1** Evaluate $\binom{20}0-\binom{20}2+\binom{20}4-\cdots+\binom{20}{20}$.

**T3.2** Evaluate $\binom{10}0+\binom{10}4+\binom{10}8$ using the roots-of-unity filter, and check directly.

**T3.3** Evaluate $\sum_{3\mid k}\binom 9k$.

**T3.4** Find all integers $n$ with $(1+i)^n=(1-i)^n$.

**T3.5** How many ordered pairs $(m,n)$ with $1\le m,n\le100$ satisfy $i^m+i^n=0$?

**T3.6** Find $\sum_{k=1}^{100}k\,i^k$.

**T3.7** Let $\omega$ be a non-real cube root of unity. Find the least positive integer $n$ with $(1+\omega^2)^n=(1+\omega^4)^n$.

**T3.8** Prove that $(a+b\omega+c\omega^2)(a+b\omega^2+c\omega)=a^2+b^2+c^2-ab-bc-ca$, and deduce a factorisation of $a^3+b^3+c^3-3abc$ into three linear factors.

### Answers: Tier 3

**T3.1** This is $\operatorname{Re}(1+i)^{20}$, and $(1+i)^{20}=(-4)^5=-1024$. Answer $-1024$.

**T3.2** $\tfrac14\big(2^{10}+2\operatorname{Re}(1+i)^{10}\big)=\tfrac14(1024+0)=256$, since $(1+i)^{10}=32i$. Directly: $1+210+45=256$.

**T3.3** $\tfrac13\big(2^9+(-1)^9(\omega^{18}+\omega^9)\big)=\tfrac13(512-2)=170$. Directly: $1+84+84+1=170$.

**T3.4** Since $i(1-i)=i-i^2=1+i$, we have $(1+i)^n=i^n(1-i)^n$. As $(1-i)^n\ne0$, equality holds exactly when $i^n=1$, that is, when $4\mid n$. *Trap:* "dividing by $1-i$" before Chapter 7 is fine only if you can justify it; the identity $1+i=i(1-i)$ avoids division altogether.

**T3.5** $i^m=-i^n$ means $i^{m-n}=-1$, i.e. $m-n\equiv2\pmod4$. Each residue class mod 4 has 25 members in $1,\dots,100$, and for each class of $m$ exactly one class of $n$ works. Answer $4\cdot25\cdot25=2500$.

**T3.6** Group $k=4j+1,\dots,4j+4$: $(4j+1)i-(4j+2)-(4j+3)i+(4j+4)=2-2i$. There are 25 groups, so the sum is $50-50i$.

**T3.7** $1+\omega^2=-\omega$ and $1+\omega^4=1+\omega=-\omega^2$. The equation becomes $(-\omega)^n=(-\omega^2)^n$, i.e. $\omega^n=\omega^{2n}$, i.e. $\omega^n=1$, i.e. $3\mid n$. Least $n=3$.

**T3.8** Expanding gives nine terms; $\omega^3=1$ turns $b^2\omega^3$ and $c^2\omega^3$ into $b^2,c^2$ and $bc\,\omega^4$ into $bc\,\omega$; collecting, the cross terms are $(ab+bc+ca)(\omega+\omega^2)=-(ab+bc+ca)$. Since $a^3+b^3+c^3-3abc=(a+b+c)(a^2+b^2+c^2-ab-bc-ca)$,

$$
\begin{aligned}&a^3+b^3+c^3-3abc\\&\quad=(a+b+c)\\&\qquad\times(a+b\omega+c\omega^2)(a+b\omega^2+c\omega).\end{aligned}
$$

### Tier 4 · Olympiad

**T4.1** Prove that $(2+i)^n$ is not real for any integer $n\ge1$.

**T4.2** Write $1105=5\cdot13\cdot17$ as a sum of two squares of positive integers in four different ways.

**T4.3** Let $a,b$ be integers. Prove that if $(a+bi)^3$ is real then $b=0$.

**T4.4** Prove that a product of two integers of the form $a^2+ab+b^2$ (with $a,b$ integers) is again of that form.

**T4.5** Prove that if $2n$ is a sum of two squares of integers, then so is $n$.

**T4.6** Let $p\equiv3\pmod4$ be prime and suppose $p\mid a^2+b^2$ for integers $a,b$. Prove that $p\mid a$ and $p\mid b$. Deduce that $21$ is not a sum of two squares.

**T4.7** Prove that $x^{2n}+x^n+1$ is divisible by $x^2+x+1$ if and only if $3\nmid n$.

### Answers: Tier 4

**T4.1** Write $(2+i)^n=a_n+b_ni$. Multiplying by $2+i$: $a_{n+1}=2a_n-b_n$, $b_{n+1}=a_n+2b_n$. Work modulo 5. From $(a_1,b_1)=(2,1)$ we get $(a_2,b_2)\equiv(3,4)$, then $(a_3,b_3)\equiv(2\cdot3-4,\ 3+8)\equiv(2,1)$, so the pair alternates between $(2,1)$ and $(3,4)$. Hence $b_n\equiv1$ or $4\pmod5$, never $0$, so $b_n\ne0$. *Key idea:* to show something is never zero, show it is never zero modulo a well-chosen prime. (A second proof uses unique factorisation: $(2+i)^n=(2-i)^n$ would make the Gaussian prime $2+i$ divide $2-i$, which it does not.)

**T4.2** Factor each prime: $5=(2+i)(2-i)$, $13=(3+2i)(3-2i)$, $17=(4+i)(4-i)$. Multiply one factor from each pair:
$(2+i)(3+2i)(4+i)=9+32i$, $(2+i)(3+2i)(4-i)=23+24i$, $(2+i)(3-2i)(4+i)=33+4i$, $(2+i)(3-2i)(4-i)=31-12i$. So

$$
\begin{aligned}1105&=32^2+9^2=24^2+23^2\\&=33^2+4^2=31^2+12^2.\end{aligned}
$$

(The other four choices give the partners of these and the same squares.)

**T4.3** $(a+bi)^3=(a^3-3ab^2)+(3a^2b-b^3)i$, so $b(3a^2-b^2)=0$. If $b\ne0$ then $b^2=3a^2$; then $a\ne0$ and $(b/a)^2=3$, impossible because $\sqrt3$ is irrational. So $b=0$.

**T4.4** By Section 2.7, $a^2+ab+b^2=(a-b\omega)(a-b\omega^2)$. Now
$(a-b\omega)(c-d\omega)=ac-(ad+bc)\omega+bd\,\omega^2=(ac-bd)-(ad+bc+bd)\omega$, using $\omega^2=-1-\omega$. Taking the same product with $\omega^2$ in place of $\omega$ and multiplying,

$$
\begin{gathered}(a^2+ab+b^2)(c^2+cd+d^2)\\=A^2+AB+B^2,\\ A=ac-bd,\quad B=ad+bc+bd.\end{gathered}
$$

(For example $3\cdot7=21=A^2+AB+B^2$ with $(a,b)=(1,1)$, $(c,d)=(2,1)$: $A=1$, $B=4$, and $1+4+16=21$.)

**T4.5** If $2n=a^2+b^2$ then $a,b$ have the same parity, so $\tfrac{a+b}2,\tfrac{a-b}2$ are integers and $n=\left(\tfrac{a+b}2\right)^2+\left(\tfrac{a-b}2\right)^2$. *The complex view:* dividing $a+bi$ by $1+i$ (norm 2) gives $\tfrac{a+b}{2}+\tfrac{b-a}{2}i$, whose norm is $n$.

**T4.6** Suppose $p\nmid a$. Then $a$ has an inverse $a'$ modulo $p$, and $c=ba'$ satisfies $c^2\equiv-1\pmod p$. By Fermat's little theorem $c^{p-1}\equiv1$, but $c^{p-1}=(c^2)^{(p-1)/2}\equiv(-1)^{(p-1)/2}=-1$ because $\tfrac{p-1}2$ is odd. Contradiction, so $p\mid a$, and then $p\mid b^2$, so $p\mid b$. If $21=a^2+b^2$ then $3\mid a$ and $3\mid b$, so $9\mid21$, false.

**T4.7** The roots of $x^2+x+1$ are $\omega$ and $\omega^2$, which are distinct. A polynomial with real coefficients is divisible by $x^2+x+1$ exactly when it vanishes at both. If $3\nmid n$, then $\{\omega^n,\omega^{2n}\}=\{\omega,\omega^2\}$ and $\omega^{2n}+\omega^n+1=0$; the same holds at $\omega^2$. If $3\mid n$, the value at $\omega$ is $1+1+1=3\ne0$.

### Tier 5 · University

**T5.1** Prove Theorem 2.2 and Proposition 2.3 without looking back.

**T5.2** Show that $3$ and $7$ are Gaussian primes, and factor $2$, $5$ and $13$ into Gaussian primes.

**T5.3** Using Theorem 2.4 repeatedly, find a greatest common divisor of $11+7i$ and $3+2i$ in $\mathbb{Z}[i]$.

**T5.4** Verify Lemma 2.6 for $p=13$ by computing $12!\bmod13$, and show $(6!)^2\equiv-1\pmod{13}$.

**T5.5** Carry out the algorithm in the proof of Theorem 2.7 for $p=13$: find $\gcd(13,5+i)$ and deduce $13=a^2+b^2$.

**T5.6** Find all integer solutions of $x^2+y^2=2026$, using unique factorisation in $\mathbb{Z}[i]$.

**T5.7** Show that the matrices $M(a,b)$ of Section 2.9 form a field: closure, commutativity, and an inverse for each non-zero matrix within the family.

**T5.8** Verify $YZ=iX$, $ZX=iY$ and $YX=-iZ$, and show $XYZ=iI$.

### Answers: Tier 5

**T5.1** See Section 2.8. The essential steps: the cross terms cancel in $(ac-bd)^2+(ad+bc)^2$; a unit has norm 1 because norms are positive integers whose product is 1.

**T5.2** A factorisation $7=\alpha\beta$ into non-units gives $N(\alpha)=7$, but $7$ is not a sum of two squares (squares mod 4 are 0 or 1, and $7\equiv3$). The same for 3. Then $2=(1+i)(1-i)=-i(1+i)^2$, $5=(2+i)(2-i)$, $13=(3+2i)(3-2i)$, all factors having prime norm.

**T5.3** $\alpha=11+7i$, $\beta=3+2i$, $N(\beta)=13$, $\alpha\bar\beta=(11+7i)(3-2i)=47-i$. Rounding $47/13$ and $-1/13$: $\kappa=4$, $\rho=\alpha-4\beta=-1-i$, $N(\rho)=2$. Next divide $\beta$ by $\rho$: $\beta\bar\rho=(3+2i)(-1+i)=-5+i$, $N(\rho)=2$; take $\kappa=-2$, remainder $\beta+2\rho=3+2i-2-2i=1$. The last non-zero remainder is $1$, so the gcd is $1$ (up to units). *Check:* the norms $170=2\cdot5\cdot17$ and $13$ share no prime, consistent with this.

**T5.4** $12!=479001600=13\cdot36846276+12$, so $12!\equiv12\equiv-1$. Also $6!=720=13\cdot55+5$, and $5^2=25=26-1\equiv-1$.

**T5.5** Divide $13$ by $5+i$: $13\,(5-i)=65-13i$, $N(5+i)=26$; rounding $65/26=2.5$ and $-13/26=-0.5$ we may take $\kappa=2$, so $\rho=13-2(5+i)=3-2i$ with $N(\rho)=13<26$. Divide $5+i$ by $3-2i$: $(5+i)(3+2i)=13+13i$ and $N=13$, so $\kappa=1+i$ exactly and the remainder is $0$. The gcd is $3-2i$, and $13=N(3-2i)=3^2+2^2$.

**T5.6** $2026=2\cdot1013$ and $1013\equiv1\pmod4$ is prime, with $1013=22^2+23^2$. In $\mathbb{Z}[i]$: $2026=-i(1+i)^2(22+23i)(22-23i)$, all four factors Gaussian primes. If $x^2+y^2=2026$ then $(x+yi)(x-yi)=2026$. The prime $1+i$ divides $x+yi$ and $x-yi$ equally often (its partner $1-i=-i(1+i)$ is an associate), and $(1+i)^2$ appears once in 2026, so $x+yi$ has exactly one factor $1+i$. The primes $22\pm23i$ are not associates, and $x+yi$ contains exactly one of them (both would make $1013\mid x+yi$, so $1013^2\mid2026$). Hence $x+yi=u(1+i)(22\pm23i)$ with $u\in\{\pm1,\pm i\}$. Since $(1+i)(22+23i)=-1+45i$ and $(1+i)(22-23i)=45-i$, the solutions are $(x,y)=(\pm1,\pm45)$ and $(\pm45,\pm1)$: eight in all.

**T5.7** Closure and commutativity follow from the sum and product formulas of Section 2.9, which are symmetric in the two factors. The identity is $M(1,0)=I$. If $(a,b)\ne(0,0)$, let $n=a^2+b^2>0$; then $M(a,b)\,M\!\left(\tfrac an,-\tfrac bn\right)=M\!\left(\tfrac{a^2+b^2}{n},\ \tfrac{-ab+ab}{n}\right)=M(1,0)$. Associativity and distributivity hold for all matrices. So the family is a field containing $\{aI\}$, a copy of $\mathbb{R}$, and $J$ with $J^2=-I$.

**T5.8** $YZ=\begin{pmatrix}0&i\\ i&0\end{pmatrix}=iX$; $ZX=\begin{pmatrix}0&1\\-1&0\end{pmatrix}=iY$; $YX=\begin{pmatrix}-i&0\\0&i\end{pmatrix}=-iZ$; and $XYZ=(XY)Z=iZ\cdot Z=iI$.

## 2.13 · Mastery check

1. Simplify $(1+2i)(3-i)-(2+i)^2$.
2. Evaluate $i^{2027}+i^{2026}+i^{2025}+i^{2024}$.
3. Compute $(1-i)^{12}$.
4. Evaluate $\binom{12}0-\binom{12}2+\binom{12}4-\cdots+\binom{12}{12}$.
5. Evaluate $\sum_{3\mid k}\binom{12}k$.
6. Find real $a,b$ with $(a+bi)^2=8-6i$.
7. Write $85=5\cdot17$ as a sum of two squares in two ways.
8. Show that $21$ is not a sum of two squares.
9. Divide $7+5i$ by $2+i$ with remainder in $\mathbb{Z}[i]$.
10. Show $YX=-iZ$, and explain why multiplying a qubit's amplitudes by $i$ changes no measurement probability.

### Answers: Mastery check

1. $(3-i+6i-2i^2)-(3+4i)=(5+5i)-(3+4i)=2+i$.
2. Four consecutive powers: $0$.
3. $(1-i)^4=-4$, so $(1-i)^{12}=(-4)^3=-64$.
4. $\operatorname{Re}(1+i)^{12}=(-4)^3=-64$.
5. $\tfrac13\big(4096+(\omega^{24}+\omega^{12})\big)=\tfrac13(4096+2)=1366$; directly $1+220+924+220+1=1366$.
6. $a^2-b^2=8$, $ab=-3$; then $a^4-8a^2-9=0$, so $a^2=9$: $(3,-1)$ or $(-3,1)$.
7. $(2+i)(4+i)=7+6i$ and $(2+i)(4-i)=9+2i$: $85=7^2+6^2=9^2+2^2$.
8. Problem T4.6: $3\mid21$, so $3$ would divide both squares' bases and $9\mid21$, which is false.
9. $\kappa=4+i$, $\rho=-i$ (Section 2.8 example).
10. $YX=\begin{pmatrix}-i&0\\0&i\end{pmatrix}=-iZ$. Probabilities are norms of amplitudes, and $N(i(a+bi))=N(-b+ai)=a^2+b^2$.

## 2.14 · Where this leads

The arithmetic of this chapter is used on every later page. Three threads continue directly: Chapter 3 proves that real and imaginary parts are well defined and solves equations by comparing them; Chapters 6 and 7 turn the partner $a-bi$ into the conjugate and use it to divide; and Chapter 24 generalises the roots-of-unity filter from $i$ and $\omega$ to every $n$th root of unity, where it becomes the discrete Fourier transform behind the quantum Fourier transform (Chapter 69).

---

## References

The results in this chapter are standard. The worked examples and problems are original to this chapter, except that the identities for $\omega$ and the binomial sums are classical exercises found in many textbooks.
