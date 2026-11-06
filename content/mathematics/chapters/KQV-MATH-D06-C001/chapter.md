---
id: KQV-MATH-D06-C001
course: "Course 2: Mathematics for Quantum Science"
domain: D06
chapter_number: 1
title: "Why Complex Numbers Are Needed"
subtitle: "Where the real numbers get stuck, why cubic equations forced the issue, and why the extension stops at the complex numbers."
language: en
level: L1
ceiling: T6
prerequisites: "Chapter 0; solving quadratic equations; reading a graph. The university and PhD-level parts also use polynomial division and the idea of a field, explained where they appear."
estimated_minutes: 90
version: 0.1.0
status: mathematically_checked
publication_status: published
---

# Chapter 1 · Why Complex Numbers Are Needed

In 1572 Rafael Bombelli published a calculation that made no sense by the standards of his time [H2]. He wanted a solution of

$$
x^3=15x+4.
$$

One solution is easy to guess: $x=4$, because $4^3=64$ and $15\cdot4+4=64$. But the celebrated formula for cubic equations, published by Girolamo Cardano in 1545 [H1], did not hand him 4 directly. It handed him

$$
x=\sqrt[3]{2+\sqrt{-121}}+\sqrt[3]{2-\sqrt{-121}}.
$$

A square root of a negative number, in the middle of a calculation whose answer is the ordinary whole number 4. Cardano himself had called such quantities "sophistic" [H2]. Bombelli did something braver: he calculated with them as if they obeyed the usual rules of algebra, and the answer came out as 4 [H2].

This chapter explains why that was not a trick. The real numbers have a genuine gap. Quadratic equations expose it, cubic equations make it unavoidable, and a precise theorem says that no cleverer formula could have avoided it. We then ask the opposite question: once we add a number whose square is $-1$, why does the process stop? Why are there no "even more complex" numbers we are forced to invent next?

> **Driving question:** Can we solve every polynomial equation using only real numbers, and if not, what is the smallest consistent extension that lets us?

## 1.1 · What this chapter covers

By the end of this chapter you should be able to:

- explain the pattern by which number systems grow ($\mathbb{N}\subset\mathbb{Z}\subset\mathbb{Q}\subset\mathbb{R}$), and what "consistent extension" means;
- prove that $x^2+1=0$ has no real solution, and decide for any real quadratic whether its roots are real;
- derive Cardano's formula for cubic equations and use it;
- recognise the *casus irreducibilis*, the case in which a cubic has three real roots yet Cardano's formula must pass through square roots of negative numbers, and state the theorem that this cannot be avoided;
- explain why, once we have a number $i$ with $i^2=-1$, there is no need for further numbers to solve polynomial equations, and why going further costs commutativity;
- explain, precisely and without exaggeration, why quantum theory's standard description of a qubit uses complex numbers.

**What this chapter does not do.** It does not yet build the complex numbers rigorously. We will compute with $i$ the way Bombelli did, assuming the familiar rules of algebra still hold. Chapter 2 develops the arithmetic, Chapters 4 and 5 construct the complex numbers and prove that the rules really do hold, Chapter 8 shows what we lose (ordering), and Chapter 9 proves that the construction genuinely extends the real numbers.

**How to use the levels.** Sections 1.2 to 1.4 need only school algebra. Sections 1.5 and 1.6 are university level. Sections 1.7 to 1.9 contain graduate material, clearly marked. The problem ladder in Section 1.12 climbs through foundation, board and JEE Main, university and PhD-qualifying problems, each with a full solution. You can stop at any level and return later.

### Prerequisite check

1. Solve $x^2-5x+6=0$.
2. Complete the square: $x^2+6x+13=(x+\square)^2+\square$.
3. What is the discriminant of $ax^2+bx+c$, and what does its sign tell you about real roots?

*Answers:* (1) $x=2$ or $x=3$. (2) $(x+3)^2+4$. (3) $b^2-4ac$; two distinct real roots if it is positive, one repeated real root if it is zero, no real roots if it is negative. If any of these felt shaky, revise quadratics before continuing; everything below builds on them.

## 1.2 · Number systems grow when equations get stuck

Each familiar number system was created, historically and logically, because an equation with ordinary-looking coefficients had no solution in the system before it.

| Equation | Stuck in | Solution | New system |
|---|---|---|---|
| $x+5=2$ | Natural numbers $\mathbb{N}=\{0,1,2,\dots\}$ | $x=-3$ | Integers $\mathbb{Z}$ |
| $3x=2$ | Integers $\mathbb{Z}$ | $x=\tfrac{2}{3}$ | Rationals $\mathbb{Q}$ |
| $x^2=2$ | Rationals $\mathbb{Q}$ | $x=\pm\sqrt{2}$ | Reals $\mathbb{R}$ |
| $x^2=-1$ | Reals $\mathbb{R}$ | $x=\pm i$ | Complex numbers $\mathbb{C}$ |

Every step follows the same three-part pattern.

1. **An equation gets stuck.** Its coefficients belong to the old system, but no solution does.
2. **We adjoin a new kind of number** that the equation demands.
3. **We keep the old rules.** Addition and multiplication of old numbers must give the same answers as before, and laws such as $a(b+c)=ab+ac$ must continue to hold for the new numbers too.

The third condition is what separates mathematics from wishful thinking. You cannot simply declare "let $z$ be a number with $0\cdot z=1$". Any system containing such a $z$ and obeying the distributive law collapses: $1=0\cdot z=(0+0)z=0\cdot z+0\cdot z=1+1$, so $1=2$. A good extension adds new numbers *without* breaking the old rules. Proving that a proposed extension is consistent is real work; for the complex numbers it is done in Chapters 4 and 5.

The step from $\mathbb{Q}$ to $\mathbb{R}$ is different in character from the others. It is not only about one equation; it fills every gap on the number line (completeness). We will not need the details here, only one consequence used in Section 1.6: a continuous function that is negative at one point and positive at another takes the value zero somewhere in between (the intermediate value theorem).

**Something is also lost at each step.** Natural numbers have a smallest element; integers do not. Integers have "the next number"; between two rationals there is always another. We will see in Chapter 8 that the complex numbers lose something too: they cannot be ordered in a way compatible with arithmetic. Extensions buy new solutions at a price, and it is part of mathematics to know the price.

## 1.3 · An equation the real numbers cannot solve

**Theorem 1.1.** *For every real number $x$, $x^2\ge0$. Consequently $x^2+1=0$ has no real solution.*

*Proof.* If $x\ge0$, then $x\cdot x\ge0$ because the product of two nonnegative reals is nonnegative. If $x<0$, then $-x>0$ and $x^2=(-x)(-x)>0$. In both cases $x^2\ge0$, so $x^2+1\ge1>0$, and $x^2+1$ is never $0$. ∎

Notice the structure: the proof uses the *ordering* of the real numbers (positive times positive is positive). That is exactly why the complex numbers, which contain a solution of $x^2+1=0$, cannot carry a compatible ordering. Chapter 8 turns this remark into a theorem.

### The same gap, in every quadratic

For a real quadratic $ax^2+bx+c$ with $a\ne0$, completing the square gives

$$
ax^2+bx+c=a\left(x+\frac{b}{2a}\right)^2-\frac{b^2-4ac}{4a}.
$$

Setting this to zero, a real solution exists exactly when $\left(x+\tfrac{b}{2a}\right)^2=\tfrac{b^2-4ac}{4a^2}$ has a real solution, that is, when the discriminant $D=b^2-4ac$ satisfies $D\ge0$. When $D<0$ we are back to "a real square equals a negative number", the same obstacle as $x^2=-1$.

**Picture.** The graph of $y=x^2+1$ is a parabola whose lowest point is $(0,1)$. It never meets the $x$-axis. A real root of a polynomial is a point where its graph crosses or touches the axis, so no crossing means no real root. That picture is honest, but it is also limited: it shows *that* there is no real solution, not what a solution in a larger system would look like. Geometry for complex numbers lives in a plane, not on a line (Chapter 10).

### "No solution" always means "no solution in a stated system"

"$3x=2$ has no solution" is true in $\mathbb{Z}$ and false in $\mathbb{Q}$. "$x^2+1=0$ has no solution" is true in $\mathbb{R}$ and false in $\mathbb{C}$. A statement about solving equations is incomplete until it names the number system. Examiners test exactly this.

## 1.4 · If quadratics were the only problem, nobody would have bothered

It is tempting to think complex numbers were invented so that $x^2+1=0$ would have a solution. Historically, that is not what forced them. When a quadratic had a negative discriminant, sixteenth-century mathematicians simply said it had no solution, and in most practical problems that was the right conclusion: a rectangle with a given perimeter and an impossible area just does not exist.

Cardano did write down such "impossible" solutions. In his *Ars Magna* he considered dividing 10 into two parts whose product is 40 [H3]. If the parts are $x$ and $10-x$, then $x(10-x)=40$, so $x^2-10x+40=0$, with discriminant $100-160=-60<0$. Formally the parts are

$$
5+\sqrt{-15}\quad\text{and}\quad 5-\sqrt{-15},
$$

and computing with the usual rules they do add to 10 and multiply to $25-(-15)=40$. But nothing forced anyone to take such answers seriously, because the real-world problem genuinely had no solution.

Cubic equations changed that.

## 1.5 · Cubic equations and Cardano's formula

A method for solving cubic equations was found in Italy in the early sixteenth century. Niccolò Tartaglia shared it with Cardano under a promise of secrecy, and Cardano published it in the *Ars Magna* in 1545, after learning that Scipione dal Ferro had found it first [H1]. We now derive the method in modern notation. Every step is reversible algebra, so you can check each line.

### Step 1: remove the squared term

Start with a general cubic equation with real coefficients,

$$
ax^3+bx^2+cx+d=0,\qquad a\ne0.
$$

Substitute $x=y-\dfrac{b}{3a}$. Expanding (Problem T5.1 asks you to do this in full) gives a *depressed cubic*, one with no $y^2$ term:

$$
y^3+py+q=0,\qquad p=\frac{3ac-b^2}{3a^2},\qquad q=\frac{2b^3-9abc+27a^2d}{27a^3}.
$$

Why it works: in $(y-k)^3=y^3-3ky^2+\dots$, the $y^2$ coefficient after substitution is $-3ak+b$, which vanishes exactly when $k=\tfrac{b}{3a}$. Cardano described this kind of transformation in the *Ars Magna* [H1]. From now on we work with $y^3+py+q=0$.

### Step 2: split the unknown into two parts

Look for a solution of the form $y=u+v$. Then

$$
(u+v)^3=u^3+v^3+3uv(u+v),
$$

so the equation $y^3+py+q=0$ becomes

$$
u^3+v^3+(3uv+p)(u+v)+q=0.
$$

We have one equation but two unknowns, so we are free to impose one extra condition. Choose it to kill the middle term:

$$
3uv+p=0,\qquad\text{that is,}\qquad uv=-\frac{p}{3}.
$$

Then the equation reduces to $u^3+v^3=-q$.

### Step 3: a quadratic in disguise

We now know the sum and product of the two numbers $u^3$ and $v^3$:

$$
u^3+v^3=-q,\qquad u^3v^3=-\frac{p^3}{27}.
$$

Two numbers with known sum $S$ and product $P$ are the roots of $t^2-St+P=0$. So $u^3$ and $v^3$ are the roots of the *resolvent quadratic*

$$
t^2+qt-\frac{p^3}{27}=0,
\qquad
t=-\frac{q}{2}\pm\sqrt{\frac{q^2}{4}+\frac{p^3}{27}}.
$$

Write $R=\dfrac{q^2}{4}+\dfrac{p^3}{27}$. This single number decides everything that follows.

**Cardano's formula.** *A root of $y^3+py+q=0$ is*

$$
y=\sqrt[3]{-\frac{q}{2}+\sqrt{R}}+\sqrt[3]{-\frac{q}{2}-\sqrt{R}},
\qquad R=\frac{q^2}{4}+\frac{p^3}{27},
$$

*where the two cube roots must be chosen with product $-p/3$.*

That last condition is easy to forget and essential. When $R\ge0$, take the real cube roots: their product is the real cube root of $u^3v^3=-p^3/27$, which is $-p/3$, so the condition holds automatically.

### A worked example with one real root

Solve $x^3+6x-20=0$. Here $p=6$, $q=-20$, so

$$
R=\frac{400}{4}+\frac{216}{27}=100+8=108>0,
$$

and

$$
x=\sqrt[3]{10+\sqrt{108}}+\sqrt[3]{10-\sqrt{108}}=\sqrt[3]{10+6\sqrt3}-\sqrt[3]{6\sqrt3-10}.
$$

That looks nothing like a whole number, but $(1+\sqrt3)^3=1+3\sqrt3+9+3\sqrt3=10+6\sqrt3$ and $(\sqrt3-1)^3=3\sqrt3-9+3\sqrt3-1=6\sqrt3-10$. So

$$
x=(1+\sqrt3)-(\sqrt3-1)=2.
$$

Check: $8+12-20=0$. Dividing $x^3+6x-20$ by $x-2$ leaves $x^2+2x+10$, whose discriminant is $4-40<0$; so $x=2$ is the only real root. When $R>0$, the formula gives the one real root through real arithmetic alone. The trouble starts when $R<0$.

## 1.6 · The irreducible case: when real answers need non-real steps

### Bombelli's equation

For $x^3=15x+4$, that is $x^3-15x-4=0$, we have $p=-15$, $q=-4$:

$$
R=\frac{16}{4}+\frac{(-15)^3}{27}=4-125=-121<0.
$$

So Cardano's formula reads

$$
x=\sqrt[3]{2+\sqrt{-121}}+\sqrt[3]{2-\sqrt{-121}}.
$$

Bombelli's idea [H2] was to look for cube roots of the form $a+b\sqrt{-1}$ with whole numbers $a,b$, computing with $\sqrt{-1}$ under the usual rules and the single extra rule $(\sqrt{-1})^2=-1$. Writing $i$ for $\sqrt{-1}$, we have $\sqrt{-121}=11i$ and

$$
(2+i)^3=8+3\cdot4\cdot i+3\cdot2\cdot i^2+i^3=8+12i-6-i=2+11i.
$$

Similarly $(2-i)^3=2-11i$. The product condition holds: $(2+i)(2-i)=4-i^2=5=-p/3$. Therefore

$$
x=(2+i)+(2-i)=4.
$$

The non-real parts cancel, exactly as Bombelli found [H2]. The other two roots come from dividing $x^3-15x-4$ by $x-4$, which leaves $x^2+4x+1$, with roots $-2\pm\sqrt3$. All three roots are real: $4$, $-2+\sqrt3\approx-0.27$ and $-2-\sqrt3\approx-3.73$.

### When does $R<0$ happen? Exactly when there are three real roots

**Theorem 1.2.** *Let $p,q$ be real. The depressed cubic $f(y)=y^3+py+q$ has three distinct real roots if and only if $4p^3+27q^2<0$, that is, if and only if $R<0$.*

*Proof.* If $p\ge0$, then $f'(y)=3y^2+p\ge0$ with equality at most at one point, so $f$ is strictly increasing and has exactly one real root; also $4p^3+27q^2\ge0$. So both sides of the "if and only if" are false.

Suppose $p<0$ and let $s=\sqrt{-p/3}>0$. Then $f'(y)=3(y-s)(y+s)$, so $f$ increases on $(-\infty,-s]$, decreases on $[-s,s]$ and increases on $[s,\infty)$. Since $f(y)\to-\infty$ as $y\to-\infty$ and $f(y)\to+\infty$ as $y\to\infty$, the intermediate value theorem shows $f$ has three distinct real roots exactly when the local maximum is positive and the local minimum is negative: $f(-s)>0>f(s)$. Using $s^2=-p/3$,

$$
f(\pm s)=\pm s\,(s^2+p)+q=\pm\frac{2p}{3}s+q.
$$

Since $f(-s)-f(s)=-\tfrac{4p}{3}s>0$, the condition $f(-s)>0>f(s)$ is equivalent to $f(-s)\,f(s)<0$. And

$$
f(-s)\,f(s)=q^2-\frac{4p^2}{9}s^2=q^2+\frac{4p^3}{27}=\frac{4p^3+27q^2}{27}.
$$

So three distinct real roots occur exactly when $4p^3+27q^2<0$. Finally $4p^3+27q^2=108R$, so this is the same as $R<0$. ∎

The quantity $\Delta=-4p^3-27q^2=-108R$ is the *discriminant* of the cubic; it equals $\big((r_1-r_2)(r_1-r_3)(r_2-r_3)\big)^2$ for the roots $r_1,r_2,r_3$ (Problem T6.1 uses this).

Put Theorem 1.2 next to Cardano's formula and the conclusion is striking: **whenever a cubic has three distinct real roots, Cardano's formula requires the square root of a negative number.** These are precisely the cubics whose answers are most real. This is the *casus irreducibilis*, the "irreducible case". Cardano knew of it and did not resolve it [H1].

### Could a cleverer formula avoid it? No.

Perhaps Cardano's formula is just a poor route, and some other expression in real square roots, cube roots and higher roots would reach the real roots without leaving $\mathbb{R}$. The following theorem says no, for every cubic that cannot be factored over the rationals.

**Theorem 1.3 (casus irreducibilis).** *Let $f$ be a cubic polynomial with rational coefficients that is irreducible over $\mathbb{Q}$ (it has no rational root) and has three real roots. Then no root of $f$ can be written using rational numbers, the four arithmetic operations and real $n$th roots of real numbers.* [S1, S2]

Read the hypothesis carefully. "Irreducible" matters: $x^3-7x+6=(x-1)(x-2)(x+3)$ has three real roots, $R<0$, and Cardano's formula still passes through non-real numbers, yet its roots are plainly expressible (they are whole numbers). The theorem says that for irreducible cubics there is no escape route at all. A complete proof needs field theory; it is Problem T6.2, with every step written out. Its core idea is short enough to state now: a real radical tower can only reach a root of $f$ through a step of degree 3 that is a "Galois" extension, and such a step would have to contain the non-real cube roots of unity, which a tower inside $\mathbb{R}$ cannot.

This is the precise sense in which complex numbers are **needed**: not as a convenience, but because the real numbers, together with real roots, are provably unable to express the real solutions of some very ordinary equations.

### The real-number workaround, and what it really uses

There is a way to write the three roots without non-real numbers, using trigonometry (Problem T5.4). For $p<0$ and $R\le0$,

$$
y_k=2\sqrt{-\frac{p}{3}}\,\cos\!\left(\frac13\arccos\!\left(\frac{3q}{2p}\sqrt{-\frac{3}{p}}\right)-\frac{2\pi k}{3}\right),\qquad k=0,1,2.
$$

For $x^3-3x+1=0$ this gives the roots $2\cos\frac{2\pi}{9}$, $2\cos\frac{8\pi}{9}$ and $2\cos\frac{14\pi}{9}$. This does not contradict Theorem 1.3: $\cos$ and $\arccos$ are not radicals. The formula replaces "cube root of a non-real number" with "one third of an angle", and Chapter 22 shows these are the same operation viewed geometrically: multiplying complex numbers adds their angles, so taking a cube root divides an angle by three.

## 1.7 · Taking the step: a number whose square is $-1$

Bombelli's computation suggests the experiment we will make rigorous in Chapters 2 to 5:

> Suppose there is a number system that contains $\mathbb{R}$, in which addition and multiplication obey all the usual laws (commutative, associative, distributive, with $0$ and $1$ behaving as before), and which contains an element $i$ with $i^2=-1$.

What follows from this assumption alone?

**Two square roots of $-1$.** $(-i)^2=(-1)^2i^2=-1$. So $-1$ has the square roots $i$ and $-i$, and $i\ne-i$ because otherwise $2i=0$, giving $i=0$ and $i^2=0\ne-1$.

**At most two.** If $z^2=-1$ then $z^2-i^2=0$, so $(z-i)(z+i)=0$. In a system where a product is zero only if a factor is zero, $z=i$ or $z=-i$. (This step uses commutativity: $(z-i)(z+i)=z^2+zi-iz-i^2$, and the middle terms cancel only if $zi=iz$. Keep this in mind for Section 1.8.)

**Every real quadratic is solved.** If $D=b^2-4ac<0$, write $D=-k^2$ with $k=\sqrt{-D}>0$. Then

$$
\left(\frac{-b\pm ik}{2a}\right)\ \text{satisfy}\ ax^2+bx+c=0,
$$

because $a\left(x+\tfrac{b}{2a}\right)^2=a\cdot\tfrac{(ik)^2}{4a^2}=\tfrac{-k^2}{4a}=\tfrac{D}{4a}$, which is exactly what completing the square requires. For example, $x^2-4x+13=0$ has $D=-36$ and roots $2\pm3i$.

**Powers of $i$ cycle.** $i^2=-1$, $i^3=-i$, $i^4=1$, $i^5=i$, and so on with period 4. So $i^n$ depends only on $n$ modulo 4.

**What we have not shown.** We have not shown that such a system exists. Every consequence above would be meaningless if the assumptions contradicted each other, as "$0\cdot z=1$" did in Section 1.2. Chapter 4 builds the system explicitly from pairs of real numbers, and Chapter 5 checks every law. Until then, we are doing exactly what Bombelli did: reasoning from assumptions whose consistency is still owed.

## 1.8 · Why stop at the complex numbers?

Adding $\sqrt2$ to $\mathbb{Q}$ did not solve $x^2=3$ or $x^3=2$; we needed all of $\mathbb{R}$. Will adding $i$ to $\mathbb{R}$ similarly fall short, so that some new equation needs yet another kind of number? Two theorems say the process stops.

**Theorem 1.4 (Fundamental Theorem of Algebra).** *Every non-constant polynomial with complex coefficients has a root in $\mathbb{C}$.*

So no polynomial equation, even one with complex coefficients, forces a further extension. We state this here and prove it in Chapter 45, after Liouville's theorem; Chapter 18 explores its consequences, and the problem ladder of Chapter 18 compares several proofs.

The second theorem answers a different question: could we go further anyway, to a larger number system, if we wanted to?

**Theorem 1.5 (Frobenius, 1878).** *Every finite-dimensional associative division algebra over $\mathbb{R}$ is isomorphic to $\mathbb{R}$, to $\mathbb{C}$, or to the quaternions $\mathbb{H}$.* [S3, S4]

A *division algebra over $\mathbb{R}$* is, roughly, a number system that is a finite-dimensional real vector space with a multiplication that distributes over addition, is compatible with real scalars, and in which every nonzero element has a multiplicative inverse. The quaternions $\mathbb{H}$ are numbers $a+bi+cj+dk$ with $i^2=j^2=k^2=ijk=-1$; they are a division algebra, but $ij=k$ while $ji=-k$, so multiplication is not commutative. Frobenius's theorem therefore says:

- a number system extending $\mathbb{R}$ with all the usual laws, *including* commutativity, and finite dimension over $\mathbb{R}$ is $\mathbb{R}$ or $\mathbb{C}$ (Problem T6.3 proves this part from the Fundamental Theorem of Algebra);
- going beyond $\mathbb{C}$ costs commutativity, and the only option of finite dimension is $\mathbb{H}$, of dimension 4;
- there is no "three-dimensional" number system of this kind at all (Problem T5.5 proves the commutative case by an elementary argument).

In $\mathbb{H}$ the equation $x^2+1=0$ has infinitely many solutions (Problem T6.4), which is the "at most two" argument of Section 1.7 failing exactly where it used $zi=iz$. If associativity is dropped as well, finite-dimensional real division algebras exist only in dimensions 1, 2, 4 and 8 [S4]; that deeper result is beyond this course's scope here.

## 1.9 · Quantum bridge: why a qubit's amplitudes are complex

In Chapter 0 we met a qubit state $\alpha|0\rangle+\beta|1\rangle$ with $|\alpha|^2+|\beta|^2=1$, using real amplitudes. Are complex amplitudes a convenience, or does the standard theory of a qubit genuinely need them? Here is one precise, provable piece of the answer.

Two orthonormal bases $\{e_1,e_2\}$ and $\{f_1,f_2\}$ of a two-dimensional space are **mutually unbiased** if $|\langle e_j,f_k\rangle|^2=\tfrac12$ for all $j,k$. Physically: if a qubit is prepared in one state of the first basis, a measurement in the second basis gives each outcome with probability $\tfrac12$. Measuring a qubit in three mutually unbiased bases, usually called the $Z$, $X$ and $Y$ bases, is the standard way to determine its state from data (state tomography, which Course 1 uses in Lesson 8).

**Proposition 1.6.** *(a) In the real plane $\mathbb{R}^2$, at most two orthonormal bases are pairwise mutually unbiased. (b) In $\mathbb{C}^2$ there are three:*

$$
Z:\ |0\rangle,\ |1\rangle;\qquad
X:\ \tfrac{1}{\sqrt2}(|0\rangle\pm|1\rangle);\qquad
Y:\ \tfrac{1}{\sqrt2}(|0\rangle\pm i|1\rangle).
$$

*Proof.* (a) Every orthonormal basis of $\mathbb{R}^2$ consists, up to signs and order, of $(\cos\theta,\sin\theta)$ and $(-\sin\theta,\cos\theta)$ for some angle $\theta$. For bases with angles $\theta$ and $\varphi$, the squared inner products are $\cos^2(\theta-\varphi)$ and $\sin^2(\theta-\varphi)$, so the bases are unbiased exactly when $\cos^2(\theta-\varphi)=\tfrac12$, that is, when $\theta-\varphi$ is an odd multiple of $45^\circ$. If three bases with angles $\theta_1,\theta_2,\theta_3$ were pairwise unbiased, then $\theta_2-\theta_1$ and $\theta_3-\theta_1$ would both be odd multiples of $45^\circ$, so their difference $\theta_3-\theta_2$ would be an even multiple of $45^\circ$, a multiple of $90^\circ$. Then $\cos^2(\theta_3-\theta_2)\in\{0,1\}$, not $\tfrac12$: a contradiction.

(b) Each pair of vectors listed is orthonormal. For the complex inner product $\langle u,v\rangle=\overline{u_1}v_1+\overline{u_2}v_2$, a vector from one basis and a vector from another always have inner product of modulus $\tfrac{1}{\sqrt2}$. For example $\langle\tfrac{1}{\sqrt2}(1,1),\tfrac{1}{\sqrt2}(1,i)\rangle=\tfrac12(1+i)$, whose squared modulus is $\tfrac14(1+1)=\tfrac12$. The other cases are similar (Problem T5.6). ∎

So the standard picture of a qubit, with three mutually unbiased measurements, is impossible with real amplitudes alone; the third basis needs $i$. This is honest but limited. It shows that *this description* needs complex numbers. Whether *quantum theory itself* could be rewritten with real numbers is a subtler question, and its answer is surprising: see Section 1.14.

## 1.10 · Toolkit

These are the techniques this chapter's problems use. Each entry says when to reach for it.

1. **Complete the square.** *When:* any quadratic question about real roots, minima or rewriting. $ax^2+bx+c=a(x+\tfrac{b}{2a})^2-\tfrac{D}{4a}$.
2. **Sign of the discriminant.** *When:* "for which parameter values are the roots real or non-real?" Reduce to an inequality in the parameter, then solve that inequality carefully, including the boundary.
3. **Sum and product of roots.** *When:* you know $S=r_1+r_2$ and $P=r_1r_2$; the roots solve $t^2-St+P=0$. This is the engine of Cardano's method.
4. **Depress the cubic.** *When:* any cubic. Substitute $x=y-\tfrac{b}{3a}$.
5. **Cardano's substitution $y=u+v$ with $uv=-p/3$.** *When:* solving a depressed cubic exactly. Always check the product condition when choosing cube roots.
6. **Test the sign of $R=\tfrac{q^2}{4}+\tfrac{p^3}{27}$.** *When:* deciding how many real roots a cubic has (Theorem 1.2), or predicting whether Cardano's formula will need non-real numbers.
7. **Bombelli's trick: guess $(m+ni)^3$.** *When:* Cardano gives $\sqrt[3]{A+Bi}$ with integers $A,B$. Solve $m^3-3mn^2=A$, $3m^2n-n^3=B$ in small integers.
8. **Trigonometric substitution $y=2\sqrt{-p/3}\cos\theta$.** *When:* three real roots ($R<0$) and you want them in real form. It turns the cubic into $\cos3\theta=$ a constant.
9. **Rational root test.** *When:* deciding whether a cubic with integer coefficients is irreducible over $\mathbb{Q}$: it is irreducible exactly when it has no rational root, and any rational root $\tfrac{r}{s}$ in lowest terms has $r$ dividing the constant term and $s$ dividing the leading coefficient.
10. **Degree counting.** *When:* proving something cannot exist inside a field. If $F\subseteq K$ are fields, $\alpha\in K$ has minimal polynomial of degree $m$ over $F$, then $m$ divides $[K:F]$ (tower law).

## 1.11 · Misconceptions to avoid

**"$\sqrt{-4}\cdot\sqrt{-9}=\sqrt{36}=6$."** The rule $\sqrt a\sqrt b=\sqrt{ab}$ is proved for $a,b\ge0$ only. With $\sqrt{-4}=2i$ and $\sqrt{-9}=3i$, the product is $6i^2=-6$. The same error produces the "paradox" $1=\sqrt1=\sqrt{(-1)(-1)}=\sqrt{-1}\sqrt{-1}=i^2=-1$.

**"Complex numbers were invented to solve $x^2+1=0$."** Quadratics with negative discriminant were dismissed as having no solution. What forced the issue was cubics with three *real* roots (Section 1.6).

**"Cardano's formula fails when there are three real roots."** It does not fail; it gives a correct root, but only through non-real intermediate values. Theorem 1.3 says no formula in real radicals can do better for irreducible cubics.

**"$R<0$ means the roots are irrational or hard."** Not necessarily: $x^3-7x+6$ has $R<0$ and whole-number roots. The casus irreducibilis theorem needs irreducibility.

**"Imaginary numbers don't really exist."** They exist in exactly the sense that $-3$ and $\sqrt2$ exist: as elements of a consistently constructed number system (Chapter 4). The word "imaginary" is a historical label.

**"Since $i^2=-1<0$ and $i\ne0$, $i$ is negative."** The complex numbers have no ordering compatible with arithmetic, so "negative" has no meaning for $i$ (Chapter 8).

**"A bigger number system is always available if we want one."** With commutativity and finite dimension over $\mathbb{R}$, $\mathbb{C}$ is the end of the line (Theorem 1.5).

## 1.12 · Problem ladder

The tiers rise in difficulty: T1 foundation, T2 board and JEE Main, T5 university, T6 graduate and PhD qualifying. (This chapter's topic does not produce typical JEE Advanced or olympiad problems; those tiers appear from Chapter 2 onwards.) Try each problem before opening the answers. Every answer gives the key idea first.

### Tier 1 · Foundation

**T1.1** For each equation, name the smallest of $\mathbb{N}$, $\mathbb{Z}$, $\mathbb{Q}$, $\mathbb{R}$ in which it has a solution, or say that none of them works: (a) $x+2=9$; (b) $x+7=3$; (c) $3x=2$; (d) $x^2=5$; (e) $x^2+4=0$.

**T1.2** Prove that $x^2+x+1=0$ has no real solution.

**T1.3** The statement "$x^2=-9$ has no solution" is incomplete. Complete it correctly, then find all solutions in a system containing $i$ with $i^2=-1$ and the usual rules.

**T1.4** Find the lowest point of the graph of $y=x^2+2x+5$ and explain, using it, why the equation $x^2+2x+5=0$ has no real root.

**T1.5** Using only $i^2=-1$ and the usual laws, simplify $i^{3}$, $i^{4}$, $i^{10}$ and $i^{2027}$.

**T1.6** Find the error: "$\sqrt{-4}\cdot\sqrt{-9}=\sqrt{36}=6$." What is the correct value of the product?

### Answers: Tier 1

**T1.1** (a) $\mathbb{N}$: $x=7$. (b) $\mathbb{Z}$: $x=-4$. (c) $\mathbb{Q}$: $x=\tfrac23$. (d) $\mathbb{R}$: $x=\pm\sqrt5$. (e) None of them: $x^2+4\ge4>0$ for every real $x$. *Key idea:* each system fixes a specific kind of failure in the previous one.

**T1.2** Complete the square: $x^2+x+1=\left(x+\tfrac12\right)^2+\tfrac34\ge\tfrac34>0$ for all real $x$. *Alternative:* $D=1-4=-3<0$. *Common slip:* "the roots are negative" is wrong; there are no real roots at all.

**T1.3** "It has no *real* solution." With $i$: $x^2=-9=9i^2$, so $(x-3i)(x+3i)=0$ and $x=\pm3i$. Check: $(3i)^2=9i^2=-9$.

**T1.4** $y=(x+1)^2+4$, lowest point $(-1,4)$. The minimum value 4 is positive, so the graph lies entirely above the $x$-axis and never crosses it.

**T1.5** $i^3=i^2\cdot i=-i$; $i^4=(i^2)^2=1$; $i^{10}=i^{8}i^2=-1$; $2027=4\cdot506+3$, so $i^{2027}=i^3=-i$. *Key idea:* powers of $i$ repeat with period 4.

**T1.6** $\sqrt a\sqrt b=\sqrt{ab}$ holds for $a,b\ge0$, not for negative numbers. Correctly, $\sqrt{-4}\sqrt{-9}=(2i)(3i)=6i^2=-6$.

### Tier 2 · Board and JEE Main

**T2.1** Find all real $k$ for which $x^2+kx+9=0$ has non-real roots.

**T2.2** Solve $x^2-4x+13=0$, and check one root by substitution.

**T2.3** Find a quadratic with real coefficients that has $3+2i$ as a root.

**T2.4** Let $\omega$ be a root of $x^2+x+1=0$. Show that $\omega^3=1$, and find $\omega^{100}+\omega^{200}+1$.

**T2.5** Find all real $a$ for which $x^2+2ax+a+2=0$ has non-real roots.

**T2.6** Let $a,b$ be real. Prove that $(x-a)(x-b)+1=0$ has real roots if and only if $|a-b|\ge2$.

### Answers: Tier 2

**T2.1** Non-real roots exactly when $D=k^2-36<0$, so $-6<k<6$. *Common slip:* writing $k<6$ only.

**T2.2** $D=16-52=-36$, so $x=\tfrac{4\pm6i}{2}=2\pm3i$. Check $2+3i$: $(2+3i)^2=4+12i-9=-5+12i$; then $-5+12i-4(2+3i)+13=-5+12i-8-12i+13=0$.

**T2.3** Use $3+2i$ and $3-2i$: $(x-3-2i)(x-3+2i)=(x-3)^2-(2i)^2=x^2-6x+9+4=x^2-6x+13$. *Why the partner $3-2i$:* a real quadratic with a non-real root has the conjugate as its other root (proved in Chapter 16); here we simply check the product is real.

**T2.4** From $\omega^2+\omega+1=0$, multiply by $\omega-1$: $\omega^3-1=0$. So $\omega^{100}=\omega^{99}\omega=\omega$ and $\omega^{200}=\omega^{198}\omega^2=\omega^2$. Hence $\omega^{100}+\omega^{200}+1=\omega+\omega^2+1=0$.

**T2.5** $D=4a^2-4(a+2)<0\iff a^2-a-2<0\iff(a-2)(a+1)<0\iff-1<a<2$.

**T2.6** Expand: $x^2-(a+b)x+ab+1=0$. Its discriminant is $(a+b)^2-4ab-4=(a-b)^2-4$, which is $\ge0$ exactly when $|a-b|\ge2$. *Key idea:* $(a+b)^2-4ab=(a-b)^2$.

### Tier 5 · University

**T5.1** Show that substituting $x=y-\tfrac{b}{3a}$ into $ax^3+bx^2+cx+d$ and dividing by $a$ gives $y^3+py+q$ with $p=\tfrac{3ac-b^2}{3a^2}$ and $q=\tfrac{2b^3-9abc+27a^2d}{27a^3}$.

**T5.2** Use Cardano's formula to solve $x^3=6x+4$. Find cube roots in Bombelli's way, check the product condition, and find all three roots.

**T5.3** Solve $x^3+3x-4=0$ with Cardano's formula and show the resulting expression equals 1.

**T5.4** (a) Show that for $p<0$ the substitution $y=2\sqrt{-p/3}\cos\theta$ turns $y^3+py+q=0$ into $\cos3\theta=\tfrac{3q}{2p}\sqrt{-3/p}$. (b) Show the right side lies in $[-1,1]$ exactly when $R\le0$. (c) Solve $x^3-3x+1=0$.

**T5.5** Prove there is no field $K$ that contains $\mathbb{R}$ as a subfield and has dimension 3 as a real vector space.

**T5.6** Complete the proof of Proposition 1.6(b): show that each of the three bases is orthonormal and that every pair of vectors from different bases has squared inner product $\tfrac12$.

### Answers: Tier 5

**T5.1** Let $k=\tfrac{b}{3a}$. Then $(y-k)^3=y^3-3ky^2+3k^2y-k^3$ and $(y-k)^2=y^2-2ky+k^2$. Dividing the polynomial by $a$ and collecting:

- $y^2$: $-3k+\tfrac{b}{a}=0$;
- $y$: $3k^2-\tfrac{2bk}{a}+\tfrac{c}{a}=\tfrac{b^2}{3a^2}-\tfrac{2b^2}{3a^2}+\tfrac{c}{a}=\tfrac{3ac-b^2}{3a^2}=p$;
- constant: $-k^3+\tfrac{b}{a}k^2-\tfrac{c}{a}k+\tfrac{d}{a}=-\tfrac{b^3}{27a^3}+\tfrac{b^3}{9a^3}-\tfrac{bc}{3a^2}+\tfrac{d}{a}=\tfrac{2b^3-9abc+27a^2d}{27a^3}=q$.

**T5.2** $x^3-6x-4=0$: $p=-6$, $q=-4$, $R=4-8=-4$. So $x=\sqrt[3]{2+2i}+\sqrt[3]{2-2i}$. Try $(m+ni)^3=2+2i$: $m^3-3mn^2=2$ and $3m^2n-n^3=2$; $m=-1$, $n=1$ works: $(-1+i)^2=-2i$ and $(-2i)(-1+i)=2+2i$. Similarly $(-1-i)^3=2-2i$. Product: $(-1+i)(-1-i)=1+1=2=-p/3$. ✓ So $x=(-1+i)+(-1-i)=-2$. Dividing, $x^3-6x-4=(x+2)(x^2-2x-2)$, so the other roots are $1\pm\sqrt3$. All three roots are real, as Theorem 1.2 predicts from $R<0$. *Common slip:* pairing $-1+i$ with a different cube root of $2-2i$ gives a product other than 2, and a wrong "root".

**T5.3** $p=3$, $q=-4$, $R=4+1=5>0$. So $x=\sqrt[3]{2+\sqrt5}+\sqrt[3]{2-\sqrt5}$. Now $\left(\tfrac{1+\sqrt5}{2}\right)^3=\tfrac{1+3\sqrt5+15+5\sqrt5}{8}=2+\sqrt5$ and likewise $\left(\tfrac{1-\sqrt5}{2}\right)^3=2-\sqrt5$, so $x=\tfrac{1+\sqrt5}{2}+\tfrac{1-\sqrt5}{2}=1$. Check: $1+3-4=0$. Since $R>0$ this is the only real root.

**T5.4** (a) Let $m=2\sqrt{-p/3}$, so $m^2=-\tfrac{4p}{3}$. With $y=m\cos\theta$: $m^3\cos^3\theta+pm\cos\theta+q=0$. Using $\cos3\theta=4\cos^3\theta-3\cos\theta$, i.e. $\cos^3\theta=\tfrac{\cos3\theta+3\cos\theta}{4}$:
$\tfrac{m^3}{4}\cos3\theta+\left(\tfrac{3m^3}{4}+pm\right)\cos\theta+q=0$. The bracket is $m\left(\tfrac34m^2+p\right)=m(-p+p)=0$. So $\cos3\theta=-\tfrac{4q}{m^3}$. Since $m^3=8\left(-\tfrac p3\right)^{3/2}$, a short computation gives $-\tfrac{4q}{m^3}=\tfrac{3q}{2p}\sqrt{-\tfrac3p}$.
(b) The square of the right side is $\tfrac{9q^2}{4p^2}\cdot\tfrac{-3}{p}=-\tfrac{27q^2}{4p^3}$, which is at most 1 exactly when $27q^2\le-4p^3$ (as $p<0$), i.e. $4p^3+27q^2\le0$, i.e. $R\le0$.
(c) $p=-3$, $q=1$: $m=2$ and $\cos3\theta=-\tfrac12$. So $3\theta=\tfrac{2\pi}{3}+2\pi k$, $\theta=\tfrac{2\pi}{9}+\tfrac{2\pi k}{3}$, giving roots $2\cos\tfrac{2\pi}9\approx1.532$, $2\cos\tfrac{8\pi}9\approx-1.879$, $2\cos\tfrac{14\pi}9\approx0.347$. (Since $\cos\frac{14\pi}{9}=\cos\frac{4\pi}{9}$, the last root is also $2\cos\frac{4\pi}{9}$.)

**T5.5** Suppose such a $K$ exists. Pick $\alpha\in K\setminus\mathbb{R}$. The four elements $1,\alpha,\alpha^2,\alpha^3$ of a 3-dimensional space are linearly dependent, so $\alpha$ is a root of a nonzero real polynomial of degree at most 3. Let $g$ be its minimal polynomial over $\mathbb{R}$ (monic, of least degree with $g(\alpha)=0$); $g$ is irreducible over $\mathbb{R}$, and $\deg g\ge2$ because $\alpha\notin\mathbb{R}$. The subfield $\mathbb{R}(\alpha)$ has dimension $\deg g$, and by the tower law $\deg g$ divides $\dim_\mathbb{R}K=3$. Hence $\deg g=3$. But a real cubic changes sign (it tends to $\pm\infty$ in opposite directions), so by the intermediate value theorem it has a real root $r$, and then $x-r$ divides $g$, contradicting irreducibility. So no such $K$ exists. *Key idea:* odd degree forces a real root.

**T5.6** Write $x_\pm=\tfrac{1}{\sqrt2}(1,\pm1)$ and $y_\pm=\tfrac{1}{\sqrt2}(1,\pm i)$, and use $\langle u,v\rangle=\overline{u_1}v_1+\overline{u_2}v_2$.

- *Within bases.* Each vector has squared norm $\tfrac12(1+1)=1$. $\langle x_+,x_-\rangle=\tfrac12(1-1)=0$, and $\langle y_+,y_-\rangle=\tfrac12\big(1+\overline{i}\,(-i)\big)=\tfrac12\big(1+(-i)(-i)\big)=\tfrac12(1-1)=0$.
- *$Z$ against $X$ and $Y$.* The inner products of $|0\rangle=(1,0)$ and $|1\rangle=(0,1)$ with these vectors are their entries: $\tfrac{1}{\sqrt2}$, $\pm\tfrac{1}{\sqrt2}$ or $\pm\tfrac{i}{\sqrt2}$, all of squared modulus $\tfrac12$.
- *$X$ against $Y$.* $\langle x_+,y_+\rangle=\langle x_-,y_-\rangle=\tfrac12(1+i)$ and $\langle x_+,y_-\rangle=\langle x_-,y_+\rangle=\tfrac12(1-i)$, each of squared modulus $\tfrac14(1+1)=\tfrac12$.

So the three bases are pairwise mutually unbiased.

### Tier 6 · Graduate and PhD qualifying

**T6.1** Let $f(x)=x^3-3x+1$. (a) Show $f$ is irreducible over $\mathbb{Q}$. (b) Compute its discriminant. (c) Show that if $r$ is a root then $r^2-2$ is also a root, and deduce that $\mathbb{Q}(r)$ contains all three roots, so the Galois group of $f$ is cyclic of order 3.

**T6.2** Prove Theorem 1.3 (casus irreducibilis): if $f\in\mathbb{Q}[x]$ is an irreducible cubic with three real roots, no root of $f$ lies in a field $\mathbb{Q}=F_0\subseteq F_1\subseteq\dots\subseteq F_n\subseteq\mathbb{R}$ with $F_j=F_{j-1}(a_j)$ and $a_j^{m_j}\in F_{j-1}$ for positive integers $m_j$.

**T6.3** Let $K$ be a field containing $\mathbb{R}$ with $\dim_\mathbb{R}K=n<\infty$. Assuming the Fundamental Theorem of Algebra, prove $n\in\{1,2\}$, and that if $n=2$ then $K\cong\mathbb{C}$.

**T6.4** In the quaternions, show that every $v=bi+cj+dk$ with $b^2+c^2+d^2=1$ satisfies $v^2=-1$. Explain exactly which step of the "at most two square roots" argument of Section 1.7 fails in $\mathbb{H}$.

**T6.5** Let $D$ be a finite-dimensional associative division algebra over $\mathbb{R}$. Show that for every $x\in D$ the subalgebra $\mathbb{R}[x]$ is a field isomorphic to $\mathbb{R}$ or $\mathbb{C}$, and hence that $x$ satisfies $x^2+bx+c=0$ for some real $b,c$. (This is the first step of a standard proof of Frobenius's theorem.)

### Answers: Tier 6

**T6.1** (a) A cubic over $\mathbb{Q}$ is reducible exactly when it has a rational root. By the rational root test the only candidates are $\pm1$, and $f(1)=-1$, $f(-1)=3$. So $f$ is irreducible.
(b) For $x^3+px+q$ the discriminant is $-4p^3-27q^2$. With $p=-3$, $q=1$: $108-27=81=9^2$.
(c) The roots are $2\cos\theta$ with $\cos3\theta=-\tfrac12$ (T5.4). If $r=2\cos\theta$ then $r^2-2=2\cos2\theta$, and $\cos(3\cdot2\theta)=\cos(2\cdot3\theta)=2\cos^2 3\theta-1=-\tfrac12$, so $r^2-2$ is again a root. Starting from $r_0=2\cos\tfrac{2\pi}9$, the map $r\mapsto r^2-2$ gives $2\cos\tfrac{4\pi}{9}$, then $2\cos\tfrac{8\pi}{9}$, then back to $2\cos\tfrac{16\pi}{9}=2\cos\tfrac{2\pi}{9}$. So all three roots lie in $\mathbb{Q}(r_0)$, which has degree 3 over $\mathbb{Q}$ because $f$ is irreducible. The splitting field therefore has degree 3, the Galois group has order 3, and a group of order 3 is cyclic. *Consistency check:* the discriminant is a square in $\mathbb{Q}$ (part b), which for an irreducible cubic is equivalent to the Galois group being $A_3\cong\mathbb{Z}/3$.

**T6.2** *Setup.* Suppose a root $\alpha$ of $f$ lies in such a tower. We may assume:

1. *Each step has prime exponent.* If $a^m\in F$ with $m=p_1\cdots p_s$ (primes, repeats allowed), adjoin $a^{m/p_1}$, then $a^{m/(p_1p_2)}$, and so on; each new element raised to a prime power lies in the previous field, and all are real because $a$ is real.
2. *The square root of the discriminant is in the base.* Let $\Delta$ be the discriminant of $f$. Since $f$ is irreducible over $\mathbb{Q}$ its roots are distinct, and since they are real, $\Delta=\prod_{j<k}(r_j-r_k)^2>0$. Put $\sqrt\Delta$ (a real square root) at the start of the tower. Then $f$ is still irreducible over $\mathbb{Q}(\sqrt\Delta)$: a root there would have degree 3 over $\mathbb{Q}$ inside an extension of degree at most 2.

So consider a tower $E_0=\mathbb{Q}(\sqrt\Delta)\subseteq E_1\subseteq\dots\subseteq E_n\subseteq\mathbb{R}$, $E_j=E_{j-1}(a_j)$, $a_j^{p_j}=b_j\in E_{j-1}$ with $p_j$ prime, and $\alpha\in E_n$. Let $j$ be the first index with $f$ having a root in $E_j$; then $f$ has no root in $E_{j-1}$, so (being a cubic) it is irreducible over $E_{j-1}$. Write $F=E_{j-1}$, $K=E_j=F(a)$, $a^p=b$, $p$ prime, and let $\beta\in K$ be a root of $f$.

*Lemma.* If $F\subseteq\mathbb{R}$ is a field, $p$ prime, $b\in F$, and $x^p-b$ has no root in $F$, then $x^p-b$ is irreducible over $F$.
*Proof of lemma.* Over $\mathbb{C}$, $x^p-b=\prod_{t=0}^{p-1}(x-a\zeta^t)$ with $\zeta=e^{2\pi i/p}$ and $a$ any $p$th root of $b$. Suppose $x^p-b=gh$ in $F[x]$ with $g$ monic of degree $k$, $0<k<p$. The constant term of $g$ is $\pm a^k\zeta^s$ for some integer $s$, so $c=a^k\zeta^s\in F$, and $c^p=a^{kp}=b^k$. Since $\gcd(k,p)=1$ there are integers $u,v$ with $uk+vp=1$, and then $b=b^{uk}b^{vp}=(c^ub^v)^p$. So $c^ub^v\in F$ is a root of $x^p-b$, a contradiction. ∎

*Main argument.* Since $a\notin F$ (otherwise $K=F$ and $f$ would have a root in $F$) and $a$ is real, $x^p-b$ has no root in $F$: if $c^p=b$ with $c\in F\subseteq\mathbb{R}$, then $c=a$ when $p$ is odd (real $p$th roots are unique) and $c=\pm a$ when $p=2$, either way giving $a\in F$. By the lemma, $[K:F]=p$. Now $\beta\in K$ has minimal polynomial $f$ over $F$ (irreducible of degree 3), so $3=[F(\beta):F]$ divides $[K:F]=p$. Hence $p=3$ and $K=F(\beta)$.

The splitting field of $f$ over $F$ is $F(\beta,\sqrt\Delta)$: if $\beta,\gamma,\delta$ are the roots of the monic polynomial $\tfrac1{\text{lead}}f$, then $\gamma+\delta$ is determined by $\beta$ and the coefficients, and $\gamma-\delta=\dfrac{\pm\sqrt\Delta}{(\beta-\gamma)(\beta-\delta)}=\dfrac{\pm\sqrt\Delta}{f_1'(\beta)}$ where $f_1$ is the monic version of $f$; both lie in $F(\beta,\sqrt\Delta)$. Since $\sqrt\Delta\in E_0\subseteq F$, the field $K=F(\beta)$ is the splitting field of $f$ over $F$, so $K/F$ is a normal extension.

Finally, $x^3-b$ is irreducible over $F$ and has the root $a$ in the normal extension $K$, so all its roots $a,a\omega,a\omega^2$ (with $\omega=e^{2\pi i/3}$) lie in $K$. But $a\ne0$ (since $b\ne0$, otherwise $a=0\in F$), so $a\omega$ is not real, while $K\subseteq\mathbb{R}$. This contradiction proves the theorem. ∎

*Where each hypothesis was used:* irreducibility over $\mathbb{Q}$ (distinct roots, and degree 3 dividing $p$); three real roots ($\Delta>0$, so $\sqrt\Delta$ is real and the tower stays real); realness of the tower (uniqueness of real odd roots, and the final contradiction). *Expert review:* this proof should be checked by a qualified mathematician before the chapter is published (see the review record).

**T6.3** Let $\alpha\in K$. Since $K$ is finite-dimensional, $\alpha$ satisfies a nonzero real polynomial; let $g$ be its minimal polynomial over $\mathbb{R}$, which is irreducible. By the Fundamental Theorem of Algebra, $g$ has a complex root $z$; if $z$ is real, $g=x-z$, and otherwise $\bar z$ is also a root and $(x-z)(x-\bar z)=x^2-2\,\mathrm{Re}(z)x+|z|^2$ is a real factor, so $g$ equals it. Thus every element of $K$ has degree 1 or 2 over $\mathbb{R}$.
If $n=1$ then $K=\mathbb{R}$. Otherwise pick $\alpha\notin\mathbb{R}$, with minimal polynomial $x^2+bx+c$, $b^2<4c$. Put $j=\dfrac{2\alpha+b}{\sqrt{4c-b^2}}$; then $j^2=\dfrac{4\alpha^2+4b\alpha+b^2}{4c-b^2}=\dfrac{4(-c)+b^2}{4c-b^2}=-1$. So $L=\mathbb{R}(j)=\{x+yj\}\cong\mathbb{C}$ via $x+yj\mapsto x+yi$. Now $K$ is a finite extension of $L$, and every $\beta\in K$ is algebraic over $L$; its minimal polynomial over $L$ is irreducible over $L\cong\mathbb{C}$, hence linear by the Fundamental Theorem of Algebra. So $\beta\in L$, giving $K=L\cong\mathbb{C}$ and $n=2$.

**T6.4** $v^2=(bi+cj+dk)^2=b^2i^2+c^2j^2+d^2k^2+bc(ij+ji)+bd(ik+ki)+cd(jk+kj)$. Using $ij=-ji=k$, $jk=-kj=i$, $ki=-ik=j$, all mixed terms cancel, leaving $-(b^2+c^2+d^2)=-1$. So the whole unit sphere of pure quaternions consists of square roots of $-1$: infinitely many. The argument "$z^2+1=0\Rightarrow(z-i)(z+i)=0$" fails because $(z-i)(z+i)=z^2+zi-iz-i^2$, and $zi-iz\ne0$ when $z$ does not commute with $i$ (for example $z=j$). Factoring a polynomial through its roots needs commutativity.

**T6.5** $\mathbb{R}[x]$, the set of real polynomial expressions in $x$, is a commutative subalgebra of $D$ and a finite-dimensional real vector space. It has no zero divisors because $D$ is a division algebra. For $0\ne a\in\mathbb{R}[x]$, multiplication by $a$ is an injective linear map of $\mathbb{R}[x]$ to itself, hence surjective by finite dimension, so $ab=1$ for some $b\in\mathbb{R}[x]$. Therefore $\mathbb{R}[x]$ is a field containing $\mathbb{R}$, of finite dimension, and by T6.3 it is $\mathbb{R}$ or isomorphic to $\mathbb{C}$. In either case $x$ has degree at most 2 over $\mathbb{R}$, so $x^2+bx+c=0$ for some real $b,c$ (if $x\in\mathbb{R}$, take $(x-x_0)(x-x_0)$, i.e. $b=-2x_0$, $c=x_0^2$).

## 1.13 · Mastery check

Mixed questions across all tiers. If you can do all eight without looking back, you have mastered this chapter.

1. In which of $\mathbb{N},\mathbb{Z},\mathbb{Q},\mathbb{R}$ does $x^2-2x+2=0$ have a solution? Find its solutions using $i$.
2. Show that $x^2-2mx+m^2+1=0$ has non-real roots for every real $m$, and find them.
3. Decide, without solving, how many real roots $x^3-7x+6$ has. Then factor it. Does this contradict Theorem 1.3?
4. Explain the error in "$1=\sqrt{1}=\sqrt{(-1)(-1)}=\sqrt{-1}\sqrt{-1}=i^2=-1$".
5. Solve $x^3-15x-4=0$ completely, starting from Cardano's formula.
6. Prove that $2\cos\frac{2\pi}{9}$ cannot be written using rational numbers, arithmetic and real radicals.
7. In any field, show $x^2+1$ has at most two roots. Name a number system in which it has infinitely many, and the law that fails there.
8. Show that $|+\rangle=\tfrac{1}{\sqrt2}(|0\rangle+|1\rangle)$ and $|y_+\rangle=\tfrac1{\sqrt2}(|0\rangle+i|1\rangle)$ give identical probabilities for a $Z$-basis measurement but different probabilities for an $X$-basis measurement.

### Answers: Mastery check

1. None of them: $(x-1)^2+1\ge1$. Solutions $x=1\pm i$.
2. $D=4m^2-4m^2-4=-4<0$ for all $m$; roots $m\pm i$.
3. $p=-7$, $q=6$: $4p^3+27q^2=-1372+972=-400<0$, so three distinct real roots (Theorem 1.2). Indeed $x^3-7x+6=(x-1)(x-2)(x+3)$. No contradiction: Theorem 1.3 requires irreducibility over $\mathbb{Q}$, and this cubic has rational roots. Cardano's formula still needs non-real numbers here ($R=-\tfrac{100}{27}$).
4. $\sqrt a\sqrt b=\sqrt{ab}$ is valid only for $a,b\ge0$; applying it to $-1,-1$ is the error.
5. Section 1.6: $x=\sqrt[3]{2+11i}+\sqrt[3]{2-11i}=(2+i)+(2-i)=4$ with the product condition $(2+i)(2-i)=5$; the remaining roots $-2\pm\sqrt3$ come from $x^2+4x+1$.
6. It is a root of $x^3-3x+1$ (T5.4), which is irreducible over $\mathbb{Q}$ (T6.1) and has three real roots (T5.4 or Theorem 1.2: $4(-27)+27=-81<0$). By Theorem 1.3, none of its roots is expressible in real radicals.
7. If $r$ is a root, $x^2+1=(x-r)(x+r)$ (using commutativity), and a field has no zero divisors, so the only roots are $\pm r$. In the quaternions every unit pure quaternion is a root; commutativity fails (T6.4).
8. $Z$ basis: both give $|1/\sqrt2|^2=|i/\sqrt2|^2=\tfrac12$ for each outcome. $X$ basis: $|+\rangle$ gives outcome $+$ with probability 1; for $|y_+\rangle$, $\langle+|y_+\rangle=\tfrac12(1+i)$, so probability $\tfrac12$. So they are different states that a $Z$ measurement alone cannot distinguish.

## 1.14 · Research note: does quantum theory need complex numbers?

Section 1.9 showed that the standard description of a qubit, with three mutually unbiased bases, needs complex amplitudes. A deeper question is whether *any* reformulation of quantum theory using only real numbers could reproduce every experiment. For a long time the answer seemed to be yes: a real-number version of quantum theory was known to reproduce the predictions of multipartite experiments in which the parties share real quantum states [Q1].

In 2021 Renou and colleagues showed that this changes in *networks* with independent sources: real and complex formulations of quantum theory make different predictions there, and they proposed a Bell-like experiment that could rule out the real formulation [Q1]. So "do we need complex numbers?" became, in this precise setting, an experimental question rather than a matter of taste.

Two cautions keep this honest. First, the result concerns a specific mathematical formulation (real versus complex Hilbert spaces, combined by the standard tensor-product rule); it does not say complex numbers are "physically real objects". Second, as with all research topics in this course, check the current literature before relying on later developments; we cite only what we have verified.

---

## References

- **[H1]** M. Gliozzi, "Cardano, Girolamo", *Complete Dictionary of Scientific Biography*, Charles Scribner's Sons, 2008. Sources the 1545 *Ars Magna*, the roles of dal Ferro and Tartaglia, the removal of the squared term, and Cardano's unresolved "irreducible case". [Read the entry](https://mathshistory.st-andrews.ac.uk/DSB/Cardan.pdf).
- **[H2]** H. K. Strick, "Rafael Bombelli (1526–1572)", translated by J. O'Connor, MacTutor History of Mathematics, 2022. Sources *L'Algebra* (Venice, 1572), the equation $x^3=15x+4$, Cardano's "sophistic" quantities, and Bombelli's calculation giving 4. [Read the article](https://mathshistory.st-andrews.ac.uk/Strick/bombelli.pdf).
- **[H3]** J. A. Arredondo García and C. Ramírez Maluendas, "A brief tour through the history of complex numbers", arXiv:1904.05927, 2019 (revised 2023). Sources Cardano's problem of two numbers with sum 10 and product 40. [Read the paper](https://arxiv.org/abs/1904.05927).
- **[S1]** D. A. Cox, *Galois Theory*, 2nd ed., John Wiley & Sons, 2012, Sections 1.3 and 8.6. Treats the casus irreducibilis. Section numbers as listed in [S2]; not yet checked against the book.
- **[S2]** "Casus irreducibilis", *Wikipedia*, accessed 6 November 2026. Statement of the theorem, the condition $\tfrac{q^2}{4}+\tfrac{p^3}{27}<0$, and further references. [Read the article](https://en.wikipedia.org/wiki/Casus_irreducibilis).
- **[S3]** F. G. Frobenius, "Über lineare Substitutionen und bilineare Formen", *Journal für die reine und angewandte Mathematik* 84 (1878), 1–63. Original source of Theorem 1.5, as cited in [S4].
- **[S4]** M. Brešar, "Frobenius' theorem on division algebras", arXiv:2405.01876, 2024. A modern proof; also notes that non-associative finite-dimensional real division algebras exist only in dimensions 1, 2, 4 and 8. [Read the paper](https://arxiv.org/abs/2405.01876).
- **[Q1]** M.-O. Renou, D. Trillo, M. Weilenmann, T. P. Le, A. Tavakoli, N. Gisin, A. Acín and M. Navascués, "Quantum theory based on real numbers can be experimentally falsified", *Nature* 600 (2021), 625–629. doi:10.1038/s41586-021-04160-4. [Read the paper](https://doi.org/10.1038/s41586-021-04160-4).

The worked examples and problems, other than the historical equations attributed above, are original to this chapter.
