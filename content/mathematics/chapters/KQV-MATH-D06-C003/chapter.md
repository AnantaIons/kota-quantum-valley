---
id: KQV-MATH-D06-C003
course: "Course 2: Mathematics for Quantum Science"
domain: D06
chapter_number: 3
title: "Real and Imaginary Parts, and Equality"
subtitle: "Why one complex equation is two real ones, and how to solve equations in z, its conjugate and its size, up to olympiad level."
language: en
level: L1
ceiling: T4
prerequisites: "Chapters 1 and 2; simultaneous linear equations; absolute value and square roots of real numbers."
estimated_minutes: 100
version: 0.1.0
status: mathematically_checked
publication_status: not_published
---

# Chapter 3 · Real and Imaginary Parts, and Equality

Solve this equation:

$$
z^2+|z|=0.
$$

If $z$ were a real number, the only solution would be $z=0$, since $z^2\ge0$ and $|z|\ge0$. But over the complex numbers there are exactly three solutions: $0$, $i$ and $-i$. Check $z=i$: $i^2+|i|=-1+1=0$.

How do we *find* them, and how can we be sure there are no others? The key is a fact so basic that it is easy to overlook: a complex number has two real coordinates, so **one equation between complex numbers is really two equations between real numbers.** This chapter proves that fact, turns it into a method, and pushes the method to JEE Advanced and olympiad problems, including equations that mix $z$, its conjugate $\bar z$ and its size $|z|$, and functional equations over $\mathbb{C}$.

> **Driving question:** Why does an equation in complex numbers carry two pieces of information, and how do we use both to solve it completely?

## 3.1 · What this chapter covers

By the end of this chapter you should be able to:

- prove that the standard form $a+bi$ of a complex number is unique;
- use the real part and imaginary part as functions, knowing which rules they obey and which they break;
- solve equations by comparing real and imaginary parts, including equations in $z$, $\bar z$ and $|z|$, without losing or inventing solutions;
- decide exactly when a linear equation $az+b\bar z=c$ has one solution, none, or infinitely many;
- read an equation in $z$ as a picture: one real condition gives a curve, two give points;
- solve functional equations over $\mathbb{C}$ by substitution;
- see real and imaginary parts as measurable quantities in a qubit.

**Notation used before its full chapter.** For $z=a+bi$ we write $\bar z=a-bi$ (the conjugate, Chapter 6) and $|z|=\sqrt{a^2+b^2}$ (the modulus, Chapter 12). Here they are just shorthand; we use only the identities $z\bar z=a^2+b^2=|z|^2$ and $z+\bar z=2a$, $z-\bar z=2bi$, which you can check by expanding.

### Prerequisite check

1. Solve $2x+y=3$, $x+2y=2$.
2. Solve $\sqrt{x^2+1}=2-x$ for real $x$, and check your answer.
3. For which real $t$ is $t^2-t=0$?

*Answers:* (1) $x=\tfrac43$, $y=\tfrac13$. (2) Squaring gives $x^2+1=4-4x+x^2$, so $x=\tfrac34$; check $\sqrt{9/16+1}=\tfrac54=2-\tfrac34$. (3) $t=0$ or $t=1$.

## 3.2 · Equality: the standard form is unique

**Theorem 3.1.** *If $a+bi=c+di$ with $a,b,c,d$ real, then $a=c$ and $b=d$.*

*Proof.* Rearranging, $a-c=(d-b)i$. Suppose $d\ne b$. Then $i=\dfrac{a-c}{d-b}$ is a quotient of real numbers, so $i$ is real. But the square of a real number is never negative (Theorem 1.1), while $i^2=-1$. So $d=b$, and then $a-c=0$. ∎

Three consequences follow at once.

1. **Real and imaginary parts are well defined.** Every complex number has exactly one standard form, so $\operatorname{Re}z$ and $\operatorname{Im}z$ are genuine functions from $\mathbb{C}$ to $\mathbb{R}$.
2. **$z=0$ exactly when both parts are 0.** Apply the theorem with $c=d=0$.
3. **One complex equation is two real equations.** An equation $F(z)=G(z)$ holds if and only if $\operatorname{Re}F=\operatorname{Re}G$ *and* $\operatorname{Im}F=\operatorname{Im}G$.

The third point is the method of this chapter. In the language of linear algebra, Theorem 3.1 says that $1$ and $i$ are linearly independent over $\mathbb{R}$: they behave like two perpendicular coordinate directions.

![The real and imaginary parts are the coordinates of z. For z = 3 + 2i, Re z = 3 is read off the horizontal axis and Im z = 2 the vertical one; the conjugate z̄ = 3 − 2i is the mirror image across the real axis.](diagram:c3-parts)

## 3.3 · Real and imaginary parts as functions

Write $z=a+bi$ and $w=c+di$.

**What they respect.** For all complex $z,w$ and real $r$,

$$
\begin{gathered}\operatorname{Re}(z+w)=\operatorname{Re}z+\operatorname{Re}w,\\ \operatorname{Re}(rz)=r\operatorname{Re}z,\end{gathered}
$$

and the same for $\operatorname{Im}$. In other words, $\operatorname{Re}$ and $\operatorname{Im}$ are real-linear.

**What they do not respect.** They are *not* multiplicative. From the product rule of Chapter 2,

$$
\begin{aligned}\operatorname{Re}(zw)&=\operatorname{Re}z\operatorname{Re}w-\operatorname{Im}z\operatorname{Im}w,\\
\operatorname{Im}(zw)&=\operatorname{Re}z\operatorname{Im}w+\operatorname{Im}z\operatorname{Re}w.\end{aligned}
$$

So $\operatorname{Re}(z^2)=(\operatorname{Re}z)^2-(\operatorname{Im}z)^2$, which is not $(\operatorname{Re}z)^2$ unless $z$ is real. For $z=i$: $\operatorname{Re}(i^2)=-1$ while $(\operatorname{Re}i)^2=0$.

**Multiplying by $i$ swaps the parts.** $i(a+bi)=-b+ai$, so

$$
\operatorname{Re}(iz)=-\operatorname{Im}z,\qquad \operatorname{Im}(iz)=\operatorname{Re}z.
$$

**Formulas through the conjugate.** Since $z+\bar z=2a$ and $z-\bar z=2bi$,

$$
\operatorname{Re}z=\frac{z+\bar z}{2},\qquad \operatorname{Im}z=\frac{z-\bar z}{2i}.
$$

(Dividing by $2i$ means multiplying by $\tfrac{1}{2}\cdot i^{-1}=-\tfrac i2$, which Chapter 2 justified.) These give two tests that will be used constantly:

- $z$ is **real** exactly when $\operatorname{Im}z=0$, that is, when $\bar z=z$;
- $z$ is **purely imaginary** exactly when $\operatorname{Re}z=0$, that is, when $\bar z=-z$.

**The size of $z$.** $z\bar z=a^2+b^2=|z|^2$ is real and nonnegative, and it is $0$ only when $z=0$. Note that $z^2$ and $|z|^2$ are different: $z^2=(a^2-b^2)+2abi$. They agree only when $z$ is real.

## 3.4 · Solving equations by comparing parts

The method has three steps:

1. **Substitute** $z=x+iy$ with $x,y$ real (and $\bar z=x-iy$, $|z|=\sqrt{x^2+y^2}$).
2. **Separate** into real and imaginary parts, giving two real equations.
3. **Solve the real system completely,** splitting into cases where a product is zero, and **check** every candidate when you have squared anything.

### Linear equations

**Example 1.** Solve $2z+i\bar z=3+2i$. With $z=x+iy$,

$$
\begin{aligned}&2x+2iy+i(x-iy)\\={}&(2x+y)+(x+2y)i\\={}&3+2i.\end{aligned}
$$

So $2x+y=3$ and $x+2y=2$, giving $x=\tfrac43$, $y=\tfrac13$: the unique solution is $z=\tfrac43+\tfrac13 i$.

When is such an equation uniquely solvable? Here is the complete answer.

**Theorem 3.2.** *Let $a,b,c$ be complex numbers. The equation $az+b\bar z=c$ has exactly one solution if $|a|\ne|b|$. If $|a|=|b|$ it has either no solution or infinitely many.*

*Proof.* Write $a=a_1+a_2i$, $b=b_1+b_2i$, $z=x+iy$. Expanding,

$$
\begin{aligned}az&=(a_1x-a_2y)+(a_2x+a_1y)i,\\ b\bar z&=(b_1x+b_2y)+(b_2x-b_1y)i.\end{aligned}
$$

So the equation is the real linear system

$$
\begin{aligned}(a_1+b_1)x+(b_2-a_2)y&=\operatorname{Re}c,\\ (a_2+b_2)x+(a_1-b_1)y&=\operatorname{Im}c.\end{aligned}
$$

Its determinant is $(a_1+b_1)(a_1-b_1)-(b_2-a_2)(a_2+b_2)=a_1^2+a_2^2-b_1^2-b_2^2=|a|^2-|b|^2$. A $2\times2$ real system has a unique solution exactly when its determinant is non-zero, and otherwise has none or infinitely many. ∎

For example, $z+\bar z=1$ (where $|a|=|b|=1$) says $2\operatorname{Re}z=1$: infinitely many solutions, the whole line $\operatorname{Re}z=\tfrac12$. But $z-\bar z=1$ says $2i\operatorname{Im}z=1$; the left side is purely imaginary and the right side real, so there is no solution.

### Equations with $|z|$

**Example 2.** Solve $z+|z|=2+i$. Comparing imaginary parts: $y=1$. Real parts: $x+\sqrt{x^2+1}=2$, so $\sqrt{x^2+1}=2-x$, which needs $2-x\ge0$. Squaring, $x^2+1=4-4x+x^2$, so $x=\tfrac34$, which satisfies $x\le2$. The solution is $z=\tfrac34+i$, and indeed $|z|=\tfrac54$ and $\tfrac34+\tfrac54=2$.

**Example 3 (the opening equation).** Solve $z^2+|z|=0$. Parts:

$$
x^2-y^2+\sqrt{x^2+y^2}=0,\qquad 2xy=0.
$$

The second equation splits into cases. If $y=0$: $x^2+|x|=0$, so $x=0$. If $x=0$: $-y^2+|y|=0$, so $|y|(1-|y|)=0$, so $y=0$ or $y=\pm1$. All solutions: $z=0$, $i$, $-i$, and there are no others because the cases are exhaustive.

### Equations with $\bar z$ that produce famous numbers

**Example 4.** Solve $z^2=\bar z$. Parts:

$$
x^2-y^2=x,\qquad 2xy=-y.
$$

The second gives $y(2x+1)=0$. If $y=0$: $x^2=x$, so $x=0$ or $1$. If $x=-\tfrac12$: $\tfrac14-y^2=-\tfrac12$, so $y=\pm\tfrac{\sqrt3}2$. The four solutions are

$$
\begin{gathered}0,\qquad 1,\\ -\tfrac12+\tfrac{\sqrt3}2i=\omega,\qquad -\tfrac12-\tfrac{\sqrt3}2i=\omega^2.\end{gathered}
$$

So the cube roots of unity of Chapter 2 appear on their own. (Reason: if $z\ne0$ and $z^2=\bar z$, then $z^3=z\bar z=|z|^2$ is a positive real number; Chapter 12 finishes this argument.)

![The equation z² = z̄ split into parts. The real part gives the hyperbola x² − y² = x (violet); the imaginary part gives the lines y = 0 and x = −1/2 (blue). They cross at the four solutions 0, 1, ω and ω²; the last three lie on the dashed circle of radius 1.](diagram:c3-zbar)

### Two unknowns

**Example 5.** Solve $z+w=3+i$, $z-iw=1+2i$. Subtracting, $(1+i)w=2-i$. Writing $w=u+iv$: $(1+i)(u+iv)=(u-v)+(u+v)i$, so $u-v=2$, $u+v=-1$, giving $w=\tfrac12-\tfrac32i$. Then $z=3+i-w=\tfrac52+\tfrac52i$. Check: $z-iw=\tfrac52+\tfrac52i-\big(\tfrac12i+\tfrac32\big)=1+2i$.

## 3.5 · Equations as pictures

Because $z=x+iy$ has two real coordinates, the counting rule of geometry applies.

- **One real condition gives a curve.** $\operatorname{Re}z=1$ is a vertical line; $|z|=2$ is the circle $x^2+y^2=4$; $\operatorname{Re}(z^2)=1$ is the hyperbola $x^2-y^2=1$.
- **Two real conditions give points,** typically finitely many: the intersections of two curves.
- **A complex equation is two real conditions,** so it typically has finitely many solutions. Exceptions happen when the two conditions are not independent, as in $z+\bar z=1$ (one condition, a whole line) or $z^2+|z|^2=0$ (Problem T3.6).

![One real condition gives a curve. The line Re z = 1 and the circle |z| = 2 are each one condition; together they pin down the two points 1 ± i√3.](diagram:c3-line-circle)

This picture explains *why* square roots of complex numbers exist. Solving $z^2=1+2i$ means imposing $\operatorname{Re}(z^2)=1$ and $\operatorname{Im}(z^2)=2$, that is, intersecting the hyperbolas $x^2-y^2=1$ and $xy=1$. They meet in exactly two points, which are the two square roots. Solving algebraically, $x^2-\tfrac1{x^2}=1$ gives $x^4-x^2-1=0$, so $x^2=\tfrac{1+\sqrt5}2$ and

$$
\begin{aligned}z&=\pm\left(\sqrt{\tfrac{1+\sqrt5}{2}}+\frac{i}{\sqrt{(1+\sqrt5)/2}}\right)\\&\approx\pm(1.272+0.786i).\end{aligned}
$$

Chapter 17 does this for every complex number.

![Solving z² = 1 + 2i means intersecting the hyperbola x² − y² = 1 (from the real part) with the hyperbola xy = 1 (from the imaginary part). They meet at two opposite points, the two square roots.](diagram:c3-hyperbolas)

## 3.6 · Functional equations over $\mathbb{C}$

A functional equation asks for every function satisfying an identity. Over $\mathbb{C}$ the main tool is **substitution**: replace $z$ by a related expression ($\bar z$, $1-z$, $iz$, …) to get a second equation, then solve the pair as a linear system in the unknown values.

**Example 6.** Find all $f:\mathbb{C}\to\mathbb{C}$ with $f(z)+2f(\bar z)=3z$ for all $z$.

Replace $z$ by $\bar z$ (and use $\bar{\bar z}=z$): $f(\bar z)+2f(z)=3\bar z$. Writing $A=f(z)$ and $B=f(\bar z)$:

$$
A+2B=3z,\qquad 2A+B=3\bar z.
$$

Doubling the second and subtracting the first, $3A=6\bar z-3z$, so $f(z)=2\bar z-z$. **Checking is not optional:** substitution only shows that a solution *must* have this form. Here $f(z)+2f(\bar z)=(2\bar z-z)+2(2z-\bar z)=3z$. ✓

The olympiad version of this idea (Problem T4.1) has a twist: for some special values of $z$ the linear system becomes degenerate, and the function is then *not* determined there.

## 3.7 · Quantum bridge: real and imaginary parts you can measure

A qubit state $\alpha|0\rangle+\beta|1\rangle$ involves two complex amplitudes, so four real numbers. Normalisation $|\alpha|^2+|\beta|^2=1$ is one real condition, and an overall phase factor changes no probability (Section 2.9; Chapter 64 makes this precise), removing one more real parameter. That leaves $4-1-1=2$ real parameters: the two angles of the Bloch sphere (Chapter 67).

Real and imaginary parts also appear directly in what experiments measure. The average values of the Pauli measurements are

$$
\begin{aligned}\langle Z\rangle&=|\alpha|^2-|\beta|^2,\\
\langle X\rangle&=2\operatorname{Re}(\bar\alpha\beta),\\
\langle Y\rangle&=2\operatorname{Im}(\bar\alpha\beta).\end{aligned}
$$

*Derivation of the last two.* With $\psi=(\alpha,\beta)$, $\langle X\rangle=\bar\alpha\beta+\bar\beta\alpha=\bar\alpha\beta+\overline{\bar\alpha\beta}=2\operatorname{Re}(\bar\alpha\beta)$. Similarly $\langle Y\rangle=\bar\alpha(-i\beta)+\bar\beta(i\alpha)=-i\big(\bar\alpha\beta-\overline{\bar\alpha\beta}\big)=-i\cdot2i\operatorname{Im}(\bar\alpha\beta)=2\operatorname{Im}(\bar\alpha\beta)$.

So the real part and the imaginary part of the single complex number $\bar\alpha\beta$ are two *different* experiments: an $X$ measurement and a $Y$ measurement. For $|y_+\rangle=\tfrac{1}{\sqrt2}(|0\rangle+i|1\rangle)$, $\bar\alpha\beta=\tfrac i2$, so $\langle X\rangle=0$ and $\langle Y\rangle=1$: this state always gives $+1$ in a $Y$ measurement. In Course 1, [Lesson 7](/posts/superposition-and-the-bloch-sphere/) shows that these three averages are exactly the coordinates of the Bloch vector.

## 3.8 · Toolkit

1. **Substitute $z=x+iy$ and separate parts.** The universal method. Write $\bar z=x-iy$ and $|z|=\sqrt{x^2+y^2}$.
2. **Factor the imaginary-part equation first.** It is often a product such as $2xy=0$ or $y(2x+1)=0$; split into cases and treat each completely.
3. **Before squaring, record the sign condition** ($\sqrt{\cdot}=$ something forces that something $\ge0$). After squaring, check every candidate.
4. **Use $\operatorname{Re}z=\tfrac{z+\bar z}2$ and $\operatorname{Im}z=\tfrac{z-\bar z}{2i}$** to recognise real or purely imaginary expressions: $w$ is real iff $w=\bar w$.
5. **Use $z\bar z=|z|^2$** to turn sizes into algebra; remember $z^2\ne|z|^2$ unless $z$ is real.
6. **Count conditions.** A complex equation is two real conditions; expect finitely many solutions, and look for dependence when there seem to be too many.
7. **For $az+b\bar z=c$, compare $|a|$ and $|b|$** (Theorem 3.2) before solving.
8. **Symmetric systems:** from $z+w$ and $zw$ (or $z^2+w^2$), form the quadratic $t^2-(z+w)t+zw=0$.
9. **Functional equations:** substitute to get a second equation, solve the linear system, then check, and examine the values where the system degenerates.

## 3.9 · Misconceptions to avoid

**"$\operatorname{Im}(3+4i)=4i$."** The imaginary part is the real number $4$.

**"If $z^2$ is real then $z$ is real."** No: $i^2=-1$ is real. $z^2$ is real exactly when $\operatorname{Re}z\cdot\operatorname{Im}z=0$, i.e. $z$ is real or purely imaginary.

**"$\operatorname{Re}(zw)=\operatorname{Re}z\cdot\operatorname{Re}w$."** False; the correct formula has the extra term $-\operatorname{Im}z\operatorname{Im}w$.

**"$|a+bi|=a+b$" or "$|z|^2=z^2$."** $|a+bi|=\sqrt{a^2+b^2}$, and $|z|^2=z\bar z$, which equals $z^2$ only for real $z$.

**"A complex equation has at most as many solutions as its degree."** $z^2+|z|^2=0$ looks quadratic but holds for every purely imaginary $z$: infinitely many solutions. Expressions involving $\bar z$ or $|z|$ are not polynomials in $z$.

**"Squaring both sides is always safe."** It can add false solutions. In Example 2, squaring $\sqrt{x^2+1}=2-x$ is valid only for $x\le2$, and the answer must be checked.

**"$az+b\bar z=c$ always has a solution."** Not when $|a|=|b|$: $z-\bar z=1$ has none.

## 3.10 · Problem ladder

Tiers: T1 foundation, T2 board and JEE Main, T3 JEE Advanced, T4 olympiad. Write $z=x+iy$ with $x,y$ real unless stated otherwise.

### Tier 1 · Foundation

**T1.1** Find the real and imaginary parts of $(2-3i)(1+i)$.

**T1.2** Find real $x,y$ with $(x+y)+(x-y)i=6+2i$.

**T1.3** For which real $k$ is $(k+2i)(1+i)$ real?

**T1.4** Give a complex number $z$ for which $\operatorname{Re}(z^2)\ne(\operatorname{Re}z)^2$.

**T1.5** For $z=3-4i$, find $\bar z$, $z+\bar z$, $z-\bar z$, $z\bar z$ and $|z|$.

**T1.6** Solve $2z+3i=5-i$.

**T1.7** Describe the set of all $z$ with $\operatorname{Re}z=2$, and the set with $\operatorname{Re}z=2$ and $\operatorname{Im}z=-1$.

**T1.8** Find the real and imaginary parts of $i^7(2+i)$.

### Answers: Tier 1

**T1.1** $2+2i-3i-3i^2=5-i$: real part $5$, imaginary part $-1$.

**T1.2** $x+y=6$ and $x-y=2$, so $x=4$, $y=2$.

**T1.3** $(k+2i)(1+i)=(k-2)+(k+2)i$, which is real when $k+2=0$: $k=-2$.

**T1.4** $z=1+i$: $\operatorname{Re}(z^2)=\operatorname{Re}(2i)=0$, but $(\operatorname{Re}z)^2=1$.

**T1.5** $\bar z=3+4i$, $z+\bar z=6$, $z-\bar z=-8i$, $z\bar z=9+16=25$, $|z|=5$.

**T1.6** $2z=5-4i$, so $z=\tfrac52-2i$.

**T1.7** A vertical line through $2$ (infinitely many points); with $\operatorname{Im}z=-1$ as well, the single point $2-i$.

**T1.8** $i^7=i^3=-i$, and $-i(2+i)=-2i-i^2=1-2i$: real part $1$, imaginary part $-2$.

### Tier 2 · Board and JEE Main

**T2.1** Solve $2z+i\bar z=3+2i$.

**T2.2** Solve $z+|z|=2+i$.

**T2.3** Find real $x,y$ with $(1+i)x+(1-i)y=3-i$.

**T2.4** Find all complex $z$ with $z^2=\bar z$.

**T2.5** If $(x+iy)^3=u+iv$ with $x,y$ non-zero, show that $\dfrac ux+\dfrac vy=4(x^2-y^2)$.

**T2.6** Solve the system $z+w=3+i$, $z-iw=1+2i$.

**T2.7** Describe the set of $z$ with $\operatorname{Im}(z^2)=0$.

**T2.8** Show that $(z-1)(\bar z+1)=(|z|^2-1)+2i\operatorname{Im}z$, and deduce that its real part is zero if and only if $|z|=1$.

### Answers: Tier 2

**T2.1** Example 1: $z=\tfrac43+\tfrac13i$.

**T2.2** Example 2: $z=\tfrac34+i$.

**T2.3** $(x+y)+(x-y)i=3-i$, so $x+y=3$, $x-y=-1$: $x=1$, $y=2$.

**T2.4** Example 4: $0$, $1$, $\omega$, $\omega^2$.

**T2.5** $u=x^3-3xy^2$ and $v=3x^2y-y^3$. So $\tfrac ux=x^2-3y^2$ and $\tfrac vy=3x^2-y^2$, whose sum is $4x^2-4y^2$.

**T2.6** Example 5: $z=\tfrac52+\tfrac52i$, $w=\tfrac12-\tfrac32i$.

**T2.7** $\operatorname{Im}(z^2)=2xy=0$: the union of the real axis ($y=0$) and the imaginary axis ($x=0$).

**T2.8** $(z-1)(\bar z+1)=z\bar z+z-\bar z-1=(|z|^2-1)+2i\operatorname{Im}z$, using $z-\bar z=2i\operatorname{Im}z$. Its real part is $|z|^2-1$, which is $0$ exactly when $|z|=1$. *Picture:* the points with $|z|=1$ form the unit circle.

### Tier 3 · JEE Advanced

**T3.1** Solve $z^2+|z|=0$.

**T3.2** Solve $|z|-z=1+2i$.

**T3.3** Prove Theorem 3.2, and use it to decide for which real $a$ the equation $az+\bar z=1$ has exactly one solution. What happens for the other values of $a$?

**T3.4** Find all $f:\mathbb{C}\to\mathbb{C}$ with $f(z)+2f(\bar z)=3z$.

**T3.5** Solve $z^2+2\bar z=0$.

**T3.6** How many complex numbers satisfy $z^2+|z|^2=0$?

**T3.7** Show that $|z-1|=|z+1|$ if and only if $\operatorname{Re}z=0$.

**T3.8** Find all pairs of complex numbers $(z,w)$ with $z+w=2$ and $z^2+w^2=2+4i$.

### Answers: Tier 3

**T3.1** Example 3: $0$, $i$, $-i$.

**T3.2** Real part: $\sqrt{x^2+y^2}-x=1$; imaginary part: $-y=2$, so $y=-2$. Then $\sqrt{x^2+4}=1+x$ (needs $x\ge-1$); squaring, $x^2+4=1+2x+x^2$, $x=\tfrac32$. So $z=\tfrac32-2i$. Check: $|z|=\tfrac52$, and $\tfrac52-\tfrac32+2i=1+2i$.

**T3.3** For the proof see Section 3.4. Here $|a|$ versus $|b|=1$: exactly one solution when $a\ne\pm1$. For $a=1$: $z+\bar z=2x=1$, infinitely many solutions (the line $x=\tfrac12$). For $a=-1$: $\bar z-z=-2iy=1$, impossible since the left side is purely imaginary; no solution.

**T3.4** Example 6: $f(z)=2\bar z-z$, which checks.

**T3.5** Parts: $x^2-y^2+2x=0$ and $2xy-2y=0$, i.e. $y(x-1)=0$. If $y=0$: $x^2+2x=0$, $x=0$ or $-2$. If $x=1$: $3-y^2=0$, $y=\pm\sqrt3$. Solutions: $0$, $-2$, $1+i\sqrt3$, $1-i\sqrt3$. Check $1+i\sqrt3$: $z^2=-2+2i\sqrt3$ and $2\bar z=2-2i\sqrt3$; the sum is $0$.

**T3.6** $z^2+z\bar z=z(z+\bar z)=2xz$. This is $0$ when $z=0$ or $x=0$. So every purely imaginary $z$ is a solution: **infinitely many**. *Trap:* answering "2" by treating it as a quadratic.

**T3.7** Both sides are nonnegative, so the equation is equivalent to $|z-1|^2=|z+1|^2$: $(x-1)^2+y^2=(x+1)^2+y^2$, i.e. $-2x=2x$, i.e. $x=0$. *Picture:* the points equidistant from $1$ and $-1$ form the perpendicular bisector, the imaginary axis.

**T3.8** $zw=\tfrac12\big((z+w)^2-(z^2+w^2)\big)=\tfrac12(4-2-4i)=1-2i$. So $z,w$ are the roots of $t^2-2t+1-2i=0$, i.e. $(t-1)^2=2i$. Since $(1+i)^2=2i$, the roots are $t=1\pm(1+i)$: $2+i$ and $-i$. So $(z,w)=(2+i,-i)$ or $(-i,2+i)$. Check: $(2+i)^2+(-i)^2=3+4i-1=2+4i$.

### Tier 4 · Olympiad

**T4.1** Find all functions $f:\mathbb{C}\to\mathbb{C}$ with $f(z)+z\,f(1-z)=1+z$ for every complex $z$.

**T4.2** Find all functions $f:\mathbb{C}\to\mathbb{C}$ such that $f(z+w)=f(z)+f(w)$ and $f(zw)=f(z)f(w)$ for all $z,w$, and $f(r)=r$ for every real $r$.

**T4.3** Find all complex $z$ with $z^3=\bar z$.

**T4.4** Suppose $z_1+z_2$ and $z_1z_2$ are both real. Prove that either $z_1,z_2$ are both real or $z_2=\bar z_1$.

**T4.5** For each real number $a$, find the number of complex solutions of $z^2+|z|+a=0$.

**T4.6** For complex $z,w$ prove $\big|\operatorname{Re}(z\bar w)\big|\le|z|\,|w|$, with equality exactly when one of $z,w$ is a real multiple of the other. Deduce $|z+w|\le|z|+|w|$.

### Answers: Tier 4

**T4.1** Replace $z$ by $1-z$: $f(1-z)+(1-z)f(z)=2-z$. With $A=f(z)$, $B=f(1-z)$:

$$
\begin{aligned}A+zB&=1+z,\\ (1-z)A+B&=2-z.\end{aligned}
$$

Multiply the second by $z$ and subtract from the first: $A\big(1-z(1-z)\big)=1+z-z(2-z)$, i.e. $A(z^2-z+1)=z^2-z+1$. So **$f(z)=1$ whenever $z^2-z+1\ne0$.**
The exceptional values are the roots $z_0,z_1=\tfrac{1\pm i\sqrt3}{2}$ of $z^2-z+1$; note $z_0+z_1=1$ and $z_0z_1=1$, so $1-z_0=z_1$. At these two points the system collapses to the single equation $f(z_0)+z_0f(z_1)=1+z_0$ (the equation at $z_1$ is the same one multiplied by $z_1$). So $f(z_0)=c$ can be any complex number, and then $f(z_1)=z_1(1+z_0-c)$, using $z_1z_0=1$.
**Answer:** $f(z)=1$ for $z\ne z_0,z_1$; $f(z_0)=c$ and $f(z_1)=z_1(1+z_0-c)$ for an arbitrary complex constant $c$. (For $c=1$ this is the constant function 1.) *Check at $z_1$:* $f(z_1)+z_1f(z_0)=z_1(1+z_0-c)+z_1c=z_1+z_1z_0=z_1+1$. ✓

**T4.2** $f(i)^2=f(i^2)=f(-1)=-1$, so $f(i)=i$ or $f(i)=-i$. For real $a,b$: $f(a+bi)=f(a)+f(b)f(i)=a+b\,f(i)$. So $f(z)=z$ for all $z$, or $f(z)=\bar z$ for all $z$. Both work: the identity obviously, and conjugation because $\overline{z+w}=\bar z+\bar w$ and $\overline{zw}=\bar z\,\bar w$ (expand to check, or see Chapter 6).

**T4.3** Parts of $z^3=x^3-3xy^2+(3x^2y-y^3)i$ against $\bar z=x-iy$:

$$
\begin{aligned}x(x^2-3y^2-1)&=0,\\ y(3x^2-y^2+1)&=0.\end{aligned}
$$

If $x=0$: $y(1-y^2)=0$, so $z\in\{0,i,-i\}$. If $y=0$: $x(x^2-1)=0$, so $z\in\{0,1,-1\}$. If both are non-zero: $x^2=1+3y^2$ and $3x^2-y^2=-1$; substituting, $3+8y^2=-1$, impossible. **Five solutions:** $0,\pm1,\pm i$.

**T4.4** Write $z_1=a+bi$, $z_2=c+di$. $\operatorname{Im}(z_1+z_2)=b+d=0$, so $d=-b$. $\operatorname{Im}(z_1z_2)=ad+bc=b(c-a)=0$. So $b=0$ (then $d=0$: both real) or $c=a$ (then $z_2=a-bi=\bar z_1$).

**T4.5** Parts: $x^2-y^2+\sqrt{x^2+y^2}+a=0$ and $xy=0$.
*Real solutions* ($y=0$): $x^2+|x|=-a$. The left side is $\ge0$, so: no solution if $a>0$; $x=0$ if $a=0$; and if $a<0$, $|x|=\tfrac{-1+\sqrt{1-4a}}{2}>0$, giving two solutions.
*Purely imaginary solutions* ($x=0$, $y\ne0$): $|y|^2-|y|-a=0$, so $|y|=\tfrac{1\pm\sqrt{1+4a}}{2}$, needing $a\ge-\tfrac14$. For $a>0$ only the $+$ root is positive: two solutions. For $a=0$: $|y|=1$, two solutions. For $-\tfrac14<a<0$: both roots positive and distinct, four solutions. For $a=-\tfrac14$: $|y|=\tfrac12$, two solutions. For $a<-\tfrac14$: none.
**Total:**

| $a$ | solutions |
|---|---|
| $a<-\tfrac14$ | 2 |
| $a=-\tfrac14$ | 4 |
| $-\tfrac14<a<0$ | 6 |
| $a=0$ | 3 |
| $a>0$ | 2 |

![The number of solutions of z² + |z| + a = 0 against a: 2 for a below −1/4, 4 at a = −1/4, 6 between −1/4 and 0, 3 at a = 0, and 2 for every positive a.](diagram:c3-count)

**T4.6** With $z=a+bi$, $w=c+di$: $\operatorname{Re}(z\bar w)=ac+bd$. Lagrange's identity $(a^2+b^2)(c^2+d^2)=(ac+bd)^2+(ad-bc)^2$ (expand both sides) gives $(ac+bd)^2\le|z|^2|w|^2$, with equality exactly when $ad=bc$, i.e. when $(a,b)$ and $(c,d)$ are proportional: one number is a real multiple of the other. Then

$$
\begin{aligned}|z+w|^2&=(z+w)(\bar z+\bar w)\\&=|z|^2+2\operatorname{Re}(z\bar w)+|w|^2\\&\le|z|^2+2|z||w|+|w|^2\\&=(|z|+|w|)^2,\end{aligned}
$$

using $z\bar w+\bar zw=2\operatorname{Re}(z\bar w)$. Taking square roots gives the **triangle inequality**, which Chapter 14 develops.

## 3.11 · Mastery check

1. Find the real and imaginary parts of $i^3(1-2i)^2$.
2. Solve $3z-i\bar z=2+6i$.
3. How many solutions does $z^2+|z|^2=0$ have?
4. Solve $z^2=2\bar z$.
5. For which real $a$ does $az+\bar z=1$ have exactly one solution?
6. Find all $f$ with $f(z)+2f(\bar z)=3z$, and verify your answer.
7. Solve $z+w=2$, $z^2+w^2=2+4i$.
8. A qubit has $\alpha=\tfrac35$, $\beta=\tfrac45i$. Find $\langle X\rangle$, $\langle Y\rangle$, $\langle Z\rangle$, and check that the three numbers squared add to 1.

### Answers: Mastery check

1. $(1-2i)^2=-3-4i$ and $i^3=-i$: $(-3-4i)(-i)=-4+3i$. Real part $-4$, imaginary part $3$.
2. $(3x-y)+(3y-x)i=2+6i$: $x=\tfrac32$, $y=\tfrac52$.
3. Infinitely many: every purely imaginary $z$.
4. $y(x+1)=0$ and $x^2-y^2=2x$: solutions $0$, $2$, $-1\pm i\sqrt3$ (twice the solutions of $z^2=\bar z$).
5. $a\ne\pm1$.
6. $f(z)=2\bar z-z$; check as in Example 6.
7. $(2+i,-i)$ and $(-i,2+i)$.
8. $\bar\alpha\beta=\tfrac{12}{25}i$, so $\langle X\rangle=0$, $\langle Y\rangle=\tfrac{24}{25}$, $\langle Z\rangle=\tfrac9{25}-\tfrac{16}{25}=-\tfrac7{25}$; and $\left(\tfrac{24}{25}\right)^2+\left(\tfrac7{25}\right)^2=\tfrac{576+49}{625}=1$.

## 3.12 · Where this leads

Comparing parts is the workhorse for the rest of Parts 1 and 2: Chapter 6 makes the conjugate a tool in its own right (and proves the rules used in T4.2), Chapter 12 develops the modulus, Chapter 15 turns equations in $z$ into the geometry of lines, circles and regions, and Chapter 17 solves $z^2=c$ for every $c$, finishing the hyperbola picture of Section 3.5.

---

## References

The results in this chapter are standard. The worked examples and problems were written for this chapter; none is quoted from a past examination paper, although equations of these types appear in many textbooks and examination collections.
