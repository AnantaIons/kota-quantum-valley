---
id: KQV-MATH-D06-C004
course: "Course 2: Mathematics for Quantum Science"
domain: D06
chapter_number: 4
title: "Complex Numbers as Ordered Pairs"
subtitle: "Building the complex numbers out of real numbers alone, so that i is no longer an assumption, and three other ways to build them."
language: en
level: L2
ceiling: T5
prerequisites: "Chapters 1 to 3; ordered pairs; dividing one polynomial by another."
estimated_minutes: 110
version: 0.1.0
status: mathematically_checked
publication_status: published
---

# Chapter 4 · Complex Numbers as Ordered Pairs

In Chapters 1 to 3 we said: *suppose there is a number $i$ with $i^2=-1$, and suppose it obeys the usual rules of arithmetic.* Then we calculated, and nothing went wrong.

But "suppose there is a number with this property" is a dangerous sentence. Here is one that fails. Suppose there is a number $j$ with $0\cdot j=1$, obeying the usual rules. Then

$$
\begin{aligned}1&=0\cdot j=(0+0)\cdot j\\&=0\cdot j+0\cdot j=1+1=2.\end{aligned}
$$

So $1=2$: the assumption contradicts itself. Every step used only the distributive law and the property of $j$.

How do we know that $i$ is not like $j$? Three chapters of calculations without a contradiction do not prove that a contradiction will never appear. This chapter settles the question for good: it **builds** the complex numbers out of real numbers, with no mysterious symbol anywhere, and then shows that the built object has a square root of $-1$ and obeys the usual rules. Then it builds the same object in three other ways, and asks a deeper question: among all ways of multiplying pairs of real numbers, why this one?

> **Driving question:** Can we construct a number system containing a square root of $-1$ from the real numbers alone, and in how many essentially different ways can pairs of real numbers be multiplied?

## 4.1 · What this chapter covers

By the end of this chapter you should be able to:

- define the complex numbers as ordered pairs of real numbers, and compute with the definition alone;
- prove from the definition that $(0,1)(0,1)=(-1,0)$, and recover the form $a+bi$;
- explain why the construction guarantees that Chapters 1 to 3 cannot lead to a contradiction;
- build $\mathbb{C}$ a second way, as polynomials computed modulo $x^2+1$, and prove that the two constructions are the same;
- classify every way of making the plane into a number system with an identity: the complex numbers, the dual numbers and the split-complex numbers;
- construct "complex numbers modulo a prime" and decide when they form a field.

**Levels.** Sections 4.2 to 4.5 need only Class 11 algebra. Section 4.6 reaches JEE Advanced. Sections 4.7 to 4.10 are first-year university algebra (rings, ideals and quotients), introduced from scratch.

### Prerequisite check

1. When are two ordered pairs $(a,b)$ and $(c,d)$ equal?
2. Divide $x^3+2x+5$ by $x^2+1$: find the quotient and the remainder.
3. Explain why $x^2+1$ has no real root.

*Answers:* (1) Exactly when $a=c$ and $b=d$; this is what makes a pair *ordered*. (2) $x^3+2x+5=x(x^2+1)+(x+5)$: quotient $x$, remainder $x+5$. (3) $x^2+1\ge1>0$ for every real $x$ (Theorem 1.1).

## 4.2 · Why assuming is not enough

The $j$ example shows that a list of wishes ("a number with this property, obeying these rules") may be impossible to satisfy. There are two ways to know a wish list is safe:

1. derive every possible consequence and check that none is contradictory, which can never be finished; or
2. **exhibit an object that satisfies every wish**, built from things we already trust.

The second way is decisive. If we can build, out of real numbers, a system with a square root of $-1$ that obeys all the rules used in Chapters 1 to 3, then any contradiction derived from those rules would be a contradiction about real numbers. So **if the real numbers are free of contradiction, so are the complex numbers.** Logicians call this *relative consistency*.

The construction below is the one William Rowan Hamilton published in 1837, in which complex numbers are "algebraic couples", ordered pairs of real numbers [H1].

## 4.3 · The definition

**Definition 4.1.** The **complex numbers** $\mathbb{C}$ are the ordered pairs $(a,b)$ of real numbers, where $(a,b)=(c,d)$ means $a=c$ and $b=d$, with addition and multiplication defined by

$$
\begin{aligned}(a,b)+(c,d)&=(a+c,\ b+d),\\ (a,b)\,(c,d)&=(ac-bd,\ ad+bc).\end{aligned}
$$

Where does the multiplication rule come from? From Chapter 2: it is what $(a+bi)(c+di)=(ac-bd)+(ad+bc)i$ would give. But now the logic runs the other way. Nothing is assumed; the rule is a **definition**, and every operation on its right-hand side is an operation on real numbers.

**Example.** $(2,3)(-1,4)=\big(2\cdot(-1)-3\cdot4,\ 2\cdot4+3\cdot(-1)\big)=(-14,5)$.

**Theorem 4.1.** *$(0,1)(0,1)=(-1,0)$.*

*Proof.* By the definition, $(0,1)(0,1)=(0\cdot0-1\cdot1,\ 0\cdot1+1\cdot0)=(-1,0)$. ∎

This one line is the whole point. The pair $(0,1)$ squares to the pair $(-1,0)$, and the next section shows that $(-1,0)$ *is* the real number $-1$ in disguise.

## 4.4 · The real numbers inside the pairs

**Theorem 4.2.** *For real numbers $a,b$:*

1. *$(a,0)+(b,0)=(a+b,0)$ and $(a,0)(b,0)=(ab,0)$;*
2. *$(a,0)=(b,0)$ only when $a=b$;*
3. *$(1,0)$ is a multiplicative identity and $(0,0)$ an additive identity: $(1,0)(c,d)=(c,d)$ and $(0,0)+(c,d)=(c,d)$;*
4. *$(r,0)(c,d)=(rc,rd)$ for every real $r$.*

*Proof.* (1) $(a,0)(b,0)=(ab-0\cdot0,\ a\cdot0+0\cdot b)=(ab,0)$; addition is immediate. (2) is the definition of equality of pairs. (3) $(1,0)(c,d)=(c-0\cdot d,\ d+0\cdot c)=(c,d)$. (4) $(r,0)(c,d)=(rc-0\cdot d,\ rd+0\cdot c)=(rc,rd)$. ∎

So the pairs $(a,0)$ add and multiply exactly as the real numbers $a$ do, and different real numbers give different pairs. The map $a\mapsto(a,0)$ is a perfect copy of $\mathbb{R}$ inside $\mathbb{C}$. From now on we **identify** the real number $a$ with the pair $(a,0)$; Chapter 9 examines this identification carefully. Part (4) says that multiplying a pair by a real number scales both coordinates, as for vectors.

## 4.5 · Recovering $a+bi$, and the rules of arithmetic

**Definition 4.2.** $i=(0,1)$.

With this definition and the identification $a=(a,0)$, Theorem 4.1 reads $i^2=-1$. And every pair is of the familiar form:

**Theorem 4.3.** *For all real $a,b$: $(a,b)=(a,0)+(b,0)(0,1)$, that is, $(a,b)=a+bi$.*

*Proof.* $(b,0)(0,1)=(b\cdot0-0\cdot1,\ b\cdot1+0\cdot0)=(0,b)$, and $(a,0)+(0,b)=(a,b)$. ∎

![The plane of pairs. The horizontal axis is the copy of the real numbers, the pairs (a, 0). The pair i = (0, 1) and its negative (0, −1) both square to −1. The pair (3, 2) is (3, 0) plus (2, 0)(0, 1).](diagram:c4-pairs)

Uniqueness of the form $a+bi$ (Theorem 3.1) now needs no argument at all: $a+bi=c+di$ means $(a,b)=(c,d)$, which *means* $a=c$ and $b=d$.

What remains is to check that pairs obey the rules we used without comment in Chapters 1 to 3.

**Theorem 4.4.** *For all pairs $z,w,u$: $zw=wz$, $(zw)u=z(wu)$ and $z(w+u)=zw+zu$. Addition is commutative and associative.*

*Proof.* Write $z=(a,b)$, $w=(c,d)$, $u=(e,f)$. Addition works coordinate by coordinate, so it inherits commutativity and associativity from $\mathbb{R}$.

*Commutativity.* $wz=(ca-db,\ cb+da)=(ac-bd,\ ad+bc)=zw$.

*Associativity.* On one side,
$$
\begin{aligned}(zw)u&=(ac-bd,\ ad+bc)(e,f)\\&=(ace-bde-adf-bcf,\\&\qquad acf-bdf+ade+bce).\end{aligned}
$$
On the other,
$$
\begin{aligned}z(wu)&=(a,b)(ce-df,\ cf+de)\\&=(ace-adf-bcf-bde,\\&\qquad acf+ade+bce-bdf).\end{aligned}
$$
The two results have the same four terms in each coordinate.

*Distributivity.*
$$
\begin{aligned}z(w+u)&=\big(a(c+e)-b(d+f),\\&\qquad a(d+f)+b(c+e)\big)\\&=(ac-bd,\ ad+bc)\\&\quad+(ae-bf,\ af+be)\\&=zw+zu.\end{aligned}
$$
∎

So every calculation in Chapters 1 to 3 is a calculation with pairs, and the construction does exactly what Section 4.2 asked. Chapter 5 completes the list of field laws (inverses in particular) and asks whether any other construction could have worked.

**Try it.** Software stores complex numbers exactly this way: as a pair of real (floating-point) numbers.

```python
z, w = 2 + 3j, -1 + 4j
print(z * w)                # (-14+5j), the pair rule
print(z.real, z.imag)       # 2.0 3.0: the two stored coordinates
import numpy as np
print(np.dtype(np.complex128).itemsize)   # 16 bytes: two 8-byte floats
```

## 4.6 · Which square root of $-1$ is $i$?

The pair $(0,-1)$ also squares to $-1$: $(0,-1)(0,-1)=(0-1,\ 0+0)=(-1,0)$. Problem T3.3 shows these are the only two. We *chose* $i=(0,1)$. Could a different choice change anything?

No. Consider the map $\sigma(a,b)=(a,-b)$, which swaps $(0,1)$ and $(0,-1)$ and leaves every real number $(a,0)$ alone. It respects both operations:

$$
\begin{aligned}\sigma(a,b)\,\sigma(c,d)&=(a,-b)(c,-d)\\&=(ac-bd,\ -ad-bc)\\&=\sigma\big((a,b)(c,d)\big),\end{aligned}
$$

and $\sigma$ obviously respects sums. So any true statement written using only $+$, $\times$, real numbers and $i$ stays true when $i$ is replaced by $-i$. Algebra alone cannot tell the two square roots of $-1$ apart; choosing one of them to call $i$ is a convention, like choosing which way is "up" on a page. The map $\sigma$ is the conjugate of Chapter 3, and Chapter 6 proves that it and the identity are the only maps of $\mathbb{C}$ with these properties.

## 4.7 · A second construction: polynomials modulo $x^2+1$

Here is a different idea. Take the variable $x$ of ordinary polynomials, and compute as usual, except that whenever $x^2+1$ appears we are allowed to treat it as $0$. Then $x$ behaves like a square root of $-1$.

**Definition 4.3.** For real polynomials $f$ and $g$, write $f\equiv g\pmod{x^2+1}$ when $x^2+1$ divides $f-g$. The set of **classes** $[f]$ under this relation is written $\mathbb{R}[x]/(x^2+1)$, with $[f]+[g]=[f+g]$ and $[f]\,[g]=[fg]$.

Two facts make this work.

**Remainders.** Dividing by $x^2+1$ gives $f(x)=q(x)\,(x^2+1)+(a+bx)$ with real $a,b$, and the remainder $a+bx$ is unique: if two remainders differed, their difference would be a non-zero polynomial of degree less than 2 divisible by $x^2+1$, which is impossible. So every class contains exactly one polynomial $a+bx$ of degree less than 2.

**The operations are well defined.** If $f\equiv f'$ and $g\equiv g'$, then $f+g\equiv f'+g'$, and
$$
fg-f'g'=f\,(g-g')+g'\,(f-f')
$$
is divisible by $x^2+1$, so $fg\equiv f'g'$. The answer does not depend on which polynomial we pick from each class.

Now multiply two remainders:

$$
\begin{aligned}(a+bx)(c+dx)&=ac+(ad+bc)x+bd\,x^2\\&=(ac-bd)+(ad+bc)x\\&\qquad+bd\,(x^2+1)\\&\equiv(ac-bd)+(ad+bc)x.\end{aligned}
$$

This is the pair rule, coefficient for coefficient.

**Theorem 4.5.** *The map $\Phi:\mathbb{R}[x]/(x^2+1)\to\mathbb{C}$, $\Phi([a+bx])=(a,b)$, is a bijection with $\Phi(F+G)=\Phi(F)+\Phi(G)$ and $\Phi(FG)=\Phi(F)\,\Phi(G)$. In other words the two constructions are isomorphic. Equivalently, $f\mapsto f(i)$ sends $\mathbb{R}[x]$ onto $\mathbb{C}$, respects sums and products, and $f(i)=0$ exactly when $x^2+1$ divides $f$.*

*Proof.* $\Phi$ is well defined and one-to-one because each class has exactly one remainder $a+bx$; it is onto because $(a,b)=\Phi([a+bx])$. It respects sums because remainders add coefficient by coefficient, and products by the calculation above. For the second form, substitute $i$ into $f=q\,(x^2+1)+(a+bx)$: since $i^2+1=0$, $f(i)=a+bi=\Phi([f])$. Substitution respects sums and products, and $f(i)=0$ if and only if $a=b=0$, that is, if and only if $x^2+1$ divides $f$. ∎

**Computing with the polynomial picture.** To find the remainder of a polynomial on division by $x^2+1$, evaluate it at $i$. For example, $x^{2026}=(x^2)^{1013}\equiv(-1)^{1013}=-1$, and $(1+x)^4\equiv-4$ because $(1+i)^4=-4$ (Chapter 2).

**Why do we get a field?** The class of $a+bx$ (not both zero) has an inverse:
$$
\begin{gathered}(a+bx)(a-bx)=a^2-b^2x^2\equiv a^2+b^2,\\ \text{so}\quad [a+bx]^{-1}=\left[\frac{a-bx}{a^2+b^2}\right].\end{gathered}
$$
This works because $a^2+b^2>0$ for $(a,b)\ne(0,0)$, which in turn is because $x^2+1$ has no real root. The next section shows that this is exactly the dividing line.

## 4.8 · Every way to multiply pairs

Keep the addition of pairs and the identity $(1,0)=1$, but let $e=(0,1)$ square to an arbitrary pair, $e^2=(p,q)=p+qe$. If the multiplication is to distribute over addition and commute with real scalars, it is forced:

$$
\begin{aligned}(a+be)(c+de)&=ac+(ad+bc)\,e+bd\,e^2\\&=(ac+p\,bd)\\&\qquad+(ad+bc+q\,bd)\,e.\end{aligned}
$$

This is arithmetic of remainders modulo $m(x)=x^2-qx-p$, exactly as in Section 4.7, so it is automatically commutative and associative. The question is which choices of $(p,q)$ give a field. The answer is controlled by the discriminant of $m$, which is $q^2+4p$.

Three systems appear:

- the **complex numbers** $\mathbb{C}$: $a+bi$ with $i^2=-1$;
- the **dual numbers** $\mathbb{D}$: $a+b\varepsilon$ with $\varepsilon^2=0$;
- the **split-complex numbers** $\mathbb{S}$: $a+bj$ with $j^2=1$.

**Theorem 4.6 (classification).** *Let $A$ be a two-dimensional real vector space with a multiplication that distributes over addition, commutes with real scalars ($(ru)v=r(uv)=u(rv)$) and has an identity $1$. Then $A$ is commutative and associative, and it is isomorphic to exactly one of $\mathbb{C}$, $\mathbb{D}$, $\mathbb{S}$. Precisely, choose any $e\in A$ that is not a real multiple of $1$, and write $e^2=p+qe$; then $A\cong\mathbb{C}$ if $q^2+4p<0$, $A\cong\mathbb{D}$ if $q^2+4p=0$, and $A\cong\mathbb{S}$ if $q^2+4p>0$. Only $\mathbb{C}$ is a field.*

*Proof.* Since $1\ne0$ (otherwise $u=1\cdot u=0$ for all $u$) and $A$ has dimension 2, $\{1,e\}$ is a basis, and $e^2$, like every element, is $p+qe$ for some reals $p,q$. The calculation above shows the product of $a+be$ and $c+de$ is determined by $p$ and $q$, and equals the product of the remainders $a+bx$ and $c+dx$ modulo $x^2-qx-p$. Polynomial multiplication is commutative and associative, and so (as in Section 4.7) is multiplication of remainders; so is $A$.

*Complete the square.* Let $f=e-\tfrac q2$. Then
$$
f^2=e^2-qe+\tfrac{q^2}{4}=p+\tfrac{q^2}{4}=\tfrac{q^2+4p}{4}=:\Delta .
$$
$\{1,f\}$ is again a basis.

- If $\Delta<0$, let $g=f/\sqrt{-\Delta}$, so $g^2=-1$. Then $a+bg\mapsto a+bi$ is a bijection $A\to\mathbb{C}$, and it respects products because both sides multiply by the same rule $(a+bg)(c+dg)=(ac-bd)+(ad+bc)g$.
- If $\Delta=0$, then $f^2=0$ and $a+bf\mapsto a+b\varepsilon$ is an isomorphism with $\mathbb{D}$.
- If $\Delta>0$, let $g=f/\sqrt{\Delta}$, so $g^2=1$, and $a+bg\mapsto a+bj$ is an isomorphism with $\mathbb{S}$.

*Exactly one.* In a field, $uv=0$ forces $u=0$ or $v=0$ (multiply by $u^{-1}$). $\mathbb{D}$ has $\varepsilon\cdot\varepsilon=0$ and $\mathbb{S}$ has $(1+j)(1-j)=1-j^2=0$, with non-zero factors, so neither is a field, and neither is isomorphic to $\mathbb{C}$, which is (Section 4.7). Finally $\mathbb{D}\not\cong\mathbb{S}$: $\mathbb{D}$ has a non-zero element whose square is $0$, but in $\mathbb{S}$, $(a+bj)^2=(a^2+b^2)+2ab\,j=0$ forces $a=b=0$. An isomorphism would carry such an element across. ∎

![Which polynomial x² − qx − p gives which number system. Below the parabola p = −q²/4 (no real root) the result is a field, a copy of ℂ. On the parabola (a repeated root) it is the dual numbers; above it (two real roots) the split-complex numbers.](diagram:c4-family)

In words: **reducing modulo a quadratic with no real root gives $\mathbb{C}$, whichever quadratic it is.** For example, modulo $x^2+x+1$ the class of $x$ behaves like $\omega$, and $g=(2x+1)/\sqrt3$ squares to $-1$ (Problem T5.1).

The other two systems are not curiosities.

- In $\mathbb{D}$, $(a+\varepsilon)^n=a^n+na^{n-1}\varepsilon$, so for every polynomial $f(a+\varepsilon)=f(a)+f'(a)\,\varepsilon$: dual numbers compute derivatives automatically (Problem T4.5). This is the idea behind forward-mode automatic differentiation in software.
- In $\mathbb{S}$, $(a+bj)(a-bj)=a^2-b^2$, and multiplying by an element with $a^2-b^2=1$ preserves $a^2-b^2$, the way a Lorentz boost preserves $t^2-x^2$ in special relativity. Also $\mathbb{S}$ is just $\mathbb{R}\times\mathbb{R}$ in disguise (Problem T4.4).

Each system has a **norm**, $N(a+bg)=(a+bg)(a-bg)=a^2-g^2b^2$: it is $a^2+b^2$ in $\mathbb{C}$, $a^2$ in $\mathbb{D}$ and $a^2-b^2$ in $\mathbb{S}$. Non-zero elements of norm $0$ are exactly the zero divisors, and $\mathbb{C}$ has none.

![The norm in the three systems. The elements of norm 1 form a circle in ℂ, a pair of lines in the dual numbers and a hyperbola in the split-complex numbers. The dashed lines are the non-zero elements of norm 0, the zero divisors; ℂ has none.](diagram:c4-norms)

## 4.9 · A third construction, and why they all agree

Chapter 2 (Section 2.9) gave a third model: the matrices
$$
\begin{gathered}M(a,b)=\begin{pmatrix}a&-b\\ b&a\end{pmatrix}=aI+bJ,\\ J=\begin{pmatrix}0&-1\\1&0\end{pmatrix},\qquad J^2=-I,\end{gathered}
$$
which multiply by the same rule, $M(a,b)M(c,d)=M(ac-bd,\ ad+bc)$. So we have pairs, polynomial remainders and matrices. Are they "the same" in a precise sense? Yes, and much more is true: any system with the right properties is a copy of $\mathbb{C}$.

**Theorem 4.7.** *Let $K$ be a field that contains $\mathbb{R}$ and an element $j$ with $j^2=-1$. Then $\psi(a,b)=a+bj$ is a one-to-one map $\mathbb{C}\to K$ that respects sums and products. If every element of $K$ has the form $a+bj$ with $a,b$ real, $\psi$ is an isomorphism.*

*Proof.* $\psi$ respects sums clearly, and products because $(a+bj)(c+dj)=(ac-bd)+(ad+bc)j$ uses only $j^2=-1$ and the field laws of $K$. For one-to-one: if $a+bj=c+dj$ with $b\ne d$, then $j=\frac{a-c}{d-b}$ is real, so $j^2\ge0$, contradicting $j^2=-1$. So $b=d$, and then $a=c$. The last sentence says $\psi$ is also onto. ∎

So "the complex numbers" is one structure, however it is built. Problem T5.5 builds the matrix copy by substituting $J$ into polynomials.

## 4.10 · Complex numbers modulo a prime

Nothing in Section 4.7 needed the real numbers specifically. Replace $\mathbb{R}$ by $\mathbb{F}_p$, the integers modulo a prime $p$. The classes $a+bx$ with $a,b\in\mathbb{F}_p$ form $\mathbb{F}_p[x]/(x^2+1)$, a system with $p^2$ elements multiplying by the same rule $(a+bx)(c+dx)=(ac-bd)+(ad+bc)x$, all modulo $p$. Is it a field?

**Theorem 4.8.** *For an odd prime $p$, $\mathbb{F}_p[x]/(x^2+1)$ is a field if and only if $p\equiv3\pmod 4$.*

*Proof.* *Step 1: it is a field exactly when $x^2+1$ has no root modulo $p$.* If $t^2\equiv-1$, then $(x-t)(x+t)=x^2-t^2\equiv x^2+1\equiv0$ with both factors non-zero classes, so there are zero divisors and no field. If there is no root, take $a+bx\ne0$. Its norm $a^2+b^2$ is not $0$ modulo $p$: if $b\equiv0$ then $a\not\equiv0$ and $a^2\not\equiv0$; if $b\not\equiv0$ and $a^2+b^2\equiv0$, then $(a/b)^2\equiv-1$, a root. So $(a-bx)/(a^2+b^2)$ is an inverse, as in Section 4.7.

*Step 2: $-1$ is a square modulo $p$ exactly when $p\equiv1\pmod 4$.* If $p\equiv1\pmod4$, Chapter 2 (Section 2.8) showed $t=\big(\tfrac{p-1}{2}\big)!$ satisfies $t^2\equiv-1$. If $p\equiv3\pmod4$ and $t^2\equiv-1$, then $t\not\equiv0$ and
$$
t^{p-1}=(t^2)^{(p-1)/2}\equiv(-1)^{(p-1)/2}=-1,
$$
because $(p-1)/2$ is odd. This contradicts **Fermat's little theorem**, $t^{p-1}\equiv1$ for $t\not\equiv0$. (Proof: multiplying the non-zero residues $1,2,\dots,p-1$ by $t$ permutes them, since $tk\equiv tl$ forces $k\equiv l$; so their product satisfies $t^{p-1}(p-1)!\equiv(p-1)!$, and $(p-1)!\not\equiv0$ can be cancelled.) ∎

So modulo 3, 7, 11, 19, … there are finite "complex numbers": fields with $9,49,121,361,\dots$ elements. Modulo 5, 13, 17, … there are not. For example, modulo 5, $2^2=4\equiv-1$, so $(x-2)(x+2)\equiv0$.

The smallest example, modulo 3, has 9 elements. Every non-zero element is a power of $g=1+x$:

![The eight non-zero "complex numbers modulo 3", placed in the order of the powers of g = 1 + x. Each arrow is multiplication by g, and after eight steps the cycle returns to 1. As with the eighth roots of unity, g⁴ = 2 = −1 sits opposite 1, and the two square roots of −1, g² = 2x and g⁶ = x, sit opposite each other.](diagram:c4-f9)

The powers are $g^0=1$, $g=1+x$, $g^2=2x$, $g^3=1+2x$, $g^4=2$, $g^5=2+2x$, $g^6=x$, $g^7=2+x$, $g^8=1$ (Problem T5.3). Note $g^6=x$: this field has its own "$i$", and $g^2=2x=-x$ is the other one.

## 4.11 · Toolkit

1. **Compute from the definition.** $(a,b)(c,d)=(ac-bd,\ ad+bc)$. Every claim about $\mathbb{C}$ can, in the end, be checked this way.
2. **Real numbers are $(a,0)$; $i$ is $(0,1)$; $(a,b)=a+bi$.** Switch freely between the notations.
3. **Remainder modulo $x^2+1$ = value at $i$.** To reduce $f(x)$, compute $f(i)=a+bi$; the remainder is $a+bx$. To test whether $x^2+1$ divides $f$, check $f(i)=0$.
4. **Conjugate trick for inverses.** $(a+bx)(a-bx)\equiv a^2+b^2$, so divide $a-bx$ by the norm.
5. **Complete the square to classify.** For $e^2=p+qe$, the element $f=e-\tfrac q2$ has $f^2=\tfrac{q^2+4p}4$; its sign decides between $\mathbb{C}$, $\mathbb{D}$ and $\mathbb{S}$.
6. **Zero divisors kill fields.** If $uv=0$ with $u,v\ne0$, the system is not a field. A factorisation of the modulus gives zero divisors.
7. **To build an isomorphism, send a square root of $-1$ to a square root of $-1$**, and check it is one-to-one (Theorem 4.7).
8. **Modulo $p$, ask whether $-1$ is a square.** It is exactly when $p=2$ or $p\equiv1\pmod 4$.

## 4.12 · Misconceptions to avoid

**"$(a,b)(c,d)=(ac,\ bd)$."** That is a different multiplication (coordinate by coordinate). It has $(1,0)(0,1)=(0,0)$, so it has zero divisors and is not a field; it is the split-complex numbers in disguise (Problems T3.2 and T4.4).

**"$i$ is defined as $\sqrt{-1}$."** The real square root is not defined for negative numbers, and $-1$ has two square roots in $\mathbb{C}$, $\pm i$. Writing $\sqrt{-1}$ and then using $\sqrt a\sqrt b=\sqrt{ab}$ produces nonsense: $-1=i\cdot i=\sqrt{-1}\sqrt{-1}=\sqrt{(-1)(-1)}=\sqrt1=1$. Here $i$ is *defined* as the pair $(0,1)$; square roots of complex numbers wait for Chapter 17.

**"The construction finds $i$ among the real numbers."** It does not; $\mathbb{C}$ is a new set. The reals sit inside it as the pairs $(a,0)$.

**"Any rule for multiplying pairs would do."** Section 4.8: only a modulus with no real root gives a field. The other choices give zero divisors.

**"In $\mathbb{R}[x]/(x^2+1)$, $x^2+1$ is the zero polynomial."** The polynomial $x^2+1$ is not zero; its *class* is the zero class.

**"A quadratic equation has at most two roots in any number system."** In $\mathbb{S}$, $z^2=1$ has four roots, $\pm1$ and $\pm j$ (Problem T4.3). The usual count needs a field, where $uv=0$ forces a factor to be $0$.

**"Complex numbers modulo $p$ always form a field."** Only for $p\equiv3\pmod 4$. Modulo 5, $(x-2)(x+2)\equiv0$. Modulo 2, $x^2+1\equiv(x+1)^2$.

## 4.13 · Problem ladder

Tiers: T1 foundation, T2 board and JEE Main, T3 JEE Advanced, T4 olympiad, T5 university. Use only the definition of pairs unless a problem says otherwise.

### Tier 1 · Foundation

**T1.1** Compute $(2,3)+(-1,4)$ and $(2,3)(-1,4)$.

**T1.2** Show from the definition that $(0,1)(0,1)=(-1,0)$.

**T1.3** Compute $(0,1)^3$ and $(0,1)^4$ from the definition.

**T1.4** Write the pair $(5,-2)$ in the form $a+bi$, and write $3-7i$ as a pair.

**T1.5** Show that $(3,0)(a,b)=(3a,3b)$.

**T1.6** Find the pair that must be added to $(2,-1)$ to give $(0,0)$, and show that $(1,0)(x,y)=(x,y)$.

**T1.7** Solve $(x,y)(0,1)=(4,3)$.

**T1.8** Compute $(1,1)(1,-1)$. Is the result a real number?

### Answers: Tier 1

**T1.1** $(1,7)$ and $(-14,5)$.

**T1.2** $(0\cdot0-1\cdot1,\ 0\cdot1+1\cdot0)=(-1,0)$.

**T1.3** $(0,1)^3=(-1,0)(0,1)=(0-0,\ -1+0)=(0,-1)$, and $(0,1)^4=(0,-1)(0,1)=(0+1,\ 0+0)=(1,0)$.

**T1.4** $5-2i$; and $(3,-7)$.

**T1.5** $(3a-0\cdot b,\ 3b+0\cdot a)=(3a,3b)$.

**T1.6** $(-2,1)$; and $(1\cdot x-0\cdot y,\ 1\cdot y+0\cdot x)=(x,y)$.

**T1.7** $(x,y)(0,1)=(-y,\ x)$, so $-y=4$ and $x=3$: $(x,y)=(3,-4)$.

**T1.8** $(1+1,\ -1+1)=(2,0)$, which is the real number $2$.

### Tier 2 · Board and JEE Main

**T2.1** Find all pairs $(a,b)$ with $(a,b)^2=(0,2)$.

**T2.2** Show that $(a,b)(a,-b)=(a^2+b^2,\ 0)$.

**T2.3** Find the pair $w$ with $(3,4)\,w=(1,0)$, and check your answer.

**T2.4** Solve $(x,y)(2,1)=(3,4)$.

**T2.5** Show that $(0,1)^n$ depends only on the remainder of $n$ on division by 4, and find $(0,1)^{2026}$.

**T2.6** Find the remainder of $(2+3x)(1-x)$ on division by $x^2+1$, and compare it with $(2,3)(1,-1)$.

### Answers: Tier 2

**T2.1** $(a^2-b^2,\ 2ab)=(0,2)$, so $a^2=b^2$ and $ab=1$. Then $a$ and $b$ have the same sign and $a=b$, $a^2=1$: $(1,1)$ or $(-1,-1)$.

**T2.2** $(a^2-b(-b),\ a(-b)+ba)=(a^2+b^2,\ 0)$.

**T2.3** By T2.2, $(3,4)(3,-4)=(25,0)$, so $w=\left(\tfrac3{25},-\tfrac4{25}\right)$. Check: $\left(\tfrac9{25}+\tfrac{16}{25},\ -\tfrac{12}{25}+\tfrac{12}{25}\right)=(1,0)$.

**T2.4** $(2x-y,\ x+2y)=(3,4)$, so $x=2$, $y=1$. Check: $(2,1)(2,1)=(3,4)$.

**T2.5** $(0,1)^4=(1,0)$ (T1.3), which is the identity, so $(0,1)^{4k+r}=(0,1)^r$. Since $2026=4\cdot506+2$, $(0,1)^{2026}=(0,1)^2=(-1,0)$.

**T2.6** $(2+3x)(1-x)=2+x-3x^2=-3(x^2+1)+5+x$: remainder $5+x$. And $(2,3)(1,-1)=(2+3,\ -2+3)=(5,1)$. They match, as Theorem 4.5 says.

### Tier 3 · JEE Advanced

**T3.1** Multiplying $(a,b)(c,d)$ by the definition takes four real multiplications. Show that it can be done with three: let $k_1=c(a+b)$, $k_2=a(d-c)$, $k_3=b(c+d)$, and prove $(a,b)(c,d)=(k_1-k_3,\ k_1+k_2)$.

**T3.2** Define a different product of pairs, $(a,b)*(c,d)=(ac,\ bd)$. Find its identity element. Show that it has zero divisors, and deduce that $(1,0)$ has no inverse for $*$.

**T3.3** Prove that the only pairs $z$ with $z^2=(-1,0)$ are $(0,1)$ and $(0,-1)$.

**T3.4** Find the remainders of $x^{2026}$, $x^{2027}$ and $(1+x)^{10}$ on division by $x^2+1$.

**T3.5** Find the remainder of $x^5+3x^3-x+2$ on division by $x^2+1$ without long division.

**T3.6** Find real $a,b$ such that $x^2+1$ divides $x^4+ax+b$.

**T3.7** In the dual numbers ($\varepsilon^2=0$), compute $(3+\varepsilon)^4$ and $(1+2\varepsilon)(1-2\varepsilon)$, and find the inverse of $a+b\varepsilon$ when $a\ne0$.

### Answers: Tier 3

**T3.1** $k_1-k_3=ca+cb-bc-bd=ac-bd$ and $k_1+k_2=ca+cb+ad-ac=ad+bc$. *Why it matters:* for large numbers, matrices or polynomials, a multiplication is much more expensive than an addition, so saving one in four is a real gain.

**T3.2** The identity is $(1,1)$: $(1,1)*(c,d)=(c,d)$. And $(1,0)*(0,1)=(0,0)$ with both factors non-zero. If $(1,0)*w=(1,1)$ for some $w$, then
$(0,1)=(0,1)*(1,1)=(0,1)*\big((1,0)*w\big)=\big((0,1)*(1,0)\big)*w=(0,0)*w=(0,0)$
(this $*$ is associative, coordinate by coordinate), which is false.

**T3.3** $(a,b)^2=(a^2-b^2,\ 2ab)=(-1,0)$. From $2ab=0$: if $b=0$ then $a^2=-1$, impossible for real $a$; so $a=0$ and $-b^2=-1$, $b=\pm1$.

**T3.4** Using the value at $i$: $i^{2026}=-1$ and $i^{2027}=-i$, so the remainders are $-1$ and $-x$. Also $(1+i)^{10}=\big((1+i)^2\big)^5=(2i)^5=32i$, so the remainder is $32x$.

**T3.5** At $i$: $i^5+3i^3-i+2=i-3i-i+2=2-3i$. Remainder: $2-3x$.

**T3.6** The remainder is the value at $i$: $i^4+ai+b=(1+b)+ai$. It is $0$ when $a=0$, $b=-1$. Check: $x^4-1=(x^2-1)(x^2+1)$.

**T3.7** $(3+\varepsilon)^4=81+4\cdot27\,\varepsilon=81+108\varepsilon$ (all terms with $\varepsilon^2$ vanish). $(1+2\varepsilon)(1-2\varepsilon)=1-4\varepsilon^2=1$. $(a+b\varepsilon)(a-b\varepsilon)=a^2$, so $(a+b\varepsilon)^{-1}=\dfrac{a-b\varepsilon}{a^2}=\dfrac1a-\dfrac{b}{a^2}\varepsilon$.

### Tier 4 · Olympiad

**T4.1** For real $p,q$, define $(a,b)\odot(c,d)=(ac+p\,bd,\ ad+bc+q\,bd)$. Show that $(a,b)\odot(a+qb,\ -b)=\big(N(a,b),\,0\big)$ with $N(a,b)=a^2+qab-pb^2$. Deduce directly (without Theorem 4.6) that every non-zero pair has an inverse if and only if $q^2+4p<0$.

**T4.2** Take $p=q=-1$, so $e^2=-1-e$. Find an element $g=\alpha+\beta e$ with $g^2=-1$, and identify $e$ as a familiar complex number.

**T4.3** In the split-complex numbers, find every solution of $z^2=1$.

**T4.4** Show that $\pi(a+bj)=(a+b,\ a-b)$ is an isomorphism from $\mathbb{S}$ to $\mathbb{R}\times\mathbb{R}$ with coordinate-by-coordinate operations. Find all zero divisors of $\mathbb{S}$.

**T4.5** In the dual numbers, prove that $f(a+\varepsilon)=f(a)+f'(a)\,\varepsilon$ for every real polynomial $f$. Use it to find $f(2)$ and $f'(2)$ for $f(x)=x^5-3x^2+x$ in one calculation, and show that the product rule $(fg)'=f'g+fg'$ follows.

**T4.6** Using only the definition of the product of pairs (no inverses), prove that if $zw=(0,0)$ then $z=(0,0)$ or $w=(0,0)$.

### Answers: Tier 4

**T4.1** First coordinate: $a(a+qb)+p\,b(-b)=a^2+qab-pb^2$. Second: $a(-b)+b(a+qb)+q\,b(-b)=0$.
If $q^2+4p<0$: $N(a,b)=\big(a+\tfrac q2b\big)^2-\tfrac{q^2+4p}{4}\,b^2>0$ for $(a,b)\ne(0,0)$, so $(a,b)^{-1}=\tfrac{1}{N}(a+qb,\ -b)$.
If $q^2+4p\ge0$: the equation $t^2+qt-p=0$ has a real root $t$. Then $N(t,1)=0$, so $(t,1)\odot(t+q,-1)=(0,0)$ with both factors non-zero. If $(t,1)$ had an inverse $u$, associativity (Section 4.8) would give $(t+q,-1)=u\odot(t,1)\odot(t+q,-1)=(0,0)$, a contradiction.

**T4.2** Complete the square: $f=e+\tfrac12$ has $f^2=e^2+e+\tfrac14=-\tfrac34$. So $g=\dfrac{2e+1}{\sqrt3}$ has $g^2=\tfrac{4}{3}\cdot\left(-\tfrac34\right)=-1$. Since $e^2+e+1=0$, $e$ plays the role of $\omega=\tfrac{-1+i\sqrt3}2$ (or $\omega^2$; Section 4.6 says the choice cannot matter). Indeed $\tfrac{2\omega+1}{\sqrt3}=\tfrac{i\sqrt3}{\sqrt3}=i$.

**T4.3** $(a+bj)^2=(a^2+b^2)+2ab\,j=1$ gives $ab=0$ and $a^2+b^2=1$: $z=\pm1$ or $z=\pm j$. **Four** solutions of a quadratic: possible because $\mathbb{S}$ has zero divisors, $z^2-1=(z-1)(z+1)=0$ without either factor being $0$ (for example $z=j$).

**T4.4** $\pi$ is linear and one-to-one (from $a+b$ and $a-b$ one recovers $a$ and $b$), so a bijection. Products: $(a+bj)(c+dj)=(ac+bd)+(ad+bc)j$, and
$\pi$ of this is $(ac+bd+ad+bc,\ ac+bd-ad-bc)=\big((a+b)(c+d),\ (a-b)(c-d)\big)=\pi(a+bj)\,\pi(c+dj)$. In $\mathbb{R}\times\mathbb{R}$ the zero divisors are the non-zero pairs with a $0$ coordinate, so in $\mathbb{S}$ they are the non-zero $a+bj$ with $a=b$ or $a=-b$.

**T4.5** By the binomial theorem and $\varepsilon^2=0$, $(a+\varepsilon)^n=a^n+na^{n-1}\varepsilon$, which is the claim for $f(x)=x^n$. Both sides of the claim are linear in $f$, so it holds for every polynomial. For $f(x)=x^5-3x^2+x$:
$(2+\varepsilon)^5-3(2+\varepsilon)^2+(2+\varepsilon)=(32+80\varepsilon)-3(4+4\varepsilon)+2+\varepsilon=22+69\varepsilon$, so $f(2)=22$ and $f'(2)=69$ (check: $f'(x)=5x^4-6x+1$).
Product rule: $(fg)(a+\varepsilon)=f(a+\varepsilon)\,g(a+\varepsilon)=\big(f+f'\varepsilon\big)\big(g+g'\varepsilon\big)=fg+(f'g+fg')\varepsilon$, all at $a$; comparing $\varepsilon$-parts gives $(fg)'(a)=f'(a)g(a)+f(a)g'(a)$.

**T4.6** Let $z=(a,b)$, $w=(c,d)$ with $(ac-bd,\ ad+bc)=(0,0)$. By the two-square identity of Chapter 2,
$(a^2+b^2)(c^2+d^2)=(ac-bd)^2+(ad+bc)^2=0$. A product of real numbers is $0$ only if a factor is, so $a^2+b^2=0$ (then $z=(0,0)$) or $c^2+d^2=0$ (then $w=(0,0)$).

### Tier 5 · University

**T5.1** Prove that $\mathbb{R}[x]/(x^2+x+1)\cong\mathbb{C}$, giving the isomorphism and its inverse explicitly.

**T5.2** (Kuratowski) Sets do not have an order, so set theory defines the ordered pair as $(a,b)=\{\{a\},\{a,b\}\}$. Prove that with this definition $(a,b)=(c,d)$ if and only if $a=c$ and $b=d$.

**T5.3** (a) In $\mathbb{F}_3[x]/(x^2+1)$, show that $g=1+x$ has $g^8=1$ but $g^4\ne1$, so its powers give all 8 non-zero elements; find $g^{-1}$. (b) In $\mathbb{F}_5[x]/(x^2+1)$, find two non-zero elements whose product is $0$. (c) Show that $\mathbb{F}_2[x]/(x^2+1)$ is the dual numbers over $\mathbb{F}_2$.

**T5.4** Show that the $2\times2$ real matrices that commute with $J=\begin{pmatrix}0&-1\\1&0\end{pmatrix}$ are exactly the matrices $aI+bJ$, and that every non-zero one of them has an inverse of the same form.

**T5.5** Show that $f\mapsto f(J)$ is a ring homomorphism from $\mathbb{R}[x]$ to the $2\times2$ real matrices, with image $\{aI+bJ\}$ and kernel the multiples of $x^2+1$. Deduce that $[a+bx]\mapsto M(a,b)$ is an isomorphism $\mathbb{R}[x]/(x^2+1)\to\{aI+bJ\}$.

**T5.6** Prove that there are exactly two isomorphisms $\mathbb{R}[x]/(x^2+1)\to\mathbb{C}$ that send each real number to itself, and describe both.

**T5.7** Let $m$ be a real polynomial of degree 3. Prove that $\mathbb{R}[x]/(m)$ is never a field. What does this suggest about building a "three-dimensional" number system extending $\mathbb{R}$?

### Answers: Tier 5

**T5.1** Let $\omega=\tfrac{-1+i\sqrt3}2$, a root of $x^2+x+1$. Substitution $f\mapsto f(\omega)$ respects sums and products. Divide: $f=q\,(x^2+x+1)+(a+bx)$, so $f(\omega)=a+b\omega$. This is $0$ only if $a=b=0$, because $\omega$ is not real. So $f(\omega)=0$ exactly when $x^2+x+1$ divides $f$, and $[f]\mapsto f(\omega)$ is well defined and one-to-one. It is onto: $a+b\omega$ has imaginary part $\tfrac{\sqrt3}{2}b$, so every complex number is reached, with
$i=\dfrac{2\omega+1}{\sqrt3}$. Inverse map: $c+di\mapsto\left[c+d\,\dfrac{2x+1}{\sqrt3}\right]$. *Check:* $(2x+1)^2=4x^2+4x+1\equiv4(-x-1)+4x+1=-3$, so the class of $\tfrac{2x+1}{\sqrt3}$ squares to $-1$.

**T5.2** If $a=c$ and $b=d$ the sets are equal. Conversely, suppose $\{\{a\},\{a,b\}\}=\{\{c\},\{c,d\}\}$.
*Case $a=b$.* The left side is $\{\{a\}\}$, a set with one element, so $\{c\}=\{a\}$ and $\{c,d\}=\{a\}$: $c=a$ and $d=a=b$.
*Case $a\ne b$.* The left side has two elements, one of size 1 and one of size 2. So the right side has two elements and $c\ne d$. The one-element members must match: $\{a\}=\{c\}$, so $a=c$. The two-element members must match: $\{a,b\}=\{a,d\}$, and since $b\ne a$, $b=d$.

**T5.3** (a) Modulo 3 with $x^2\equiv-1$: $g^2=1+2x+x^2\equiv2x$, $g^4=(2x)^2=4x^2\equiv-4\equiv2\ne1$, $g^8=2^2=4\equiv1$. Let $n$ be the smallest positive integer with $g^n=1$. Writing $8=kn+r$ with $0\le r<n$ gives $g^r=g^8(g^n)^{-k}=1$, so $r=0$ and $n$ divides 8. Since $g^4\ne1$, $n$ is not 1, 2 or 4, so $n=8$. Then $g^0,g^1,\dots,g^7$ are distinct: $g^k=g^l$ with $0\le k<l\le7$ would give $g^{l-k}=1$ with $0<l-k<8$. That is 8 distinct non-zero elements, which is all of them. $g^{-1}=g^7=2+x$; check $(1+x)(2+x)=2+3x+x^2\equiv2-1=1$.
(b) $2^2=4\equiv-1\pmod5$, so $(x-2)(x+2)=x^2-4\equiv x^2+1\equiv0$: the classes $3+x$ and $2+x$ are non-zero with product $0$.
(c) Modulo 2, $x^2+1\equiv x^2+2x+1=(x+1)^2$. With $\varepsilon=[x+1]$ we get $\varepsilon^2=0$, and $\{1,\varepsilon\}$ is a basis, so the system is $\{a+b\varepsilon\}$ with $\varepsilon^2=0$.

**T5.4** Let $M=\begin{pmatrix}p&q\\r&s\end{pmatrix}$. Then $MJ=\begin{pmatrix}q&-p\\s&-r\end{pmatrix}$ and $JM=\begin{pmatrix}-r&-s\\p&q\end{pmatrix}$. Equality gives $q=-r$ and $s=p$, so $M=\begin{pmatrix}p&-r\\r&p\end{pmatrix}=pI+rJ$. Conversely $aI+bJ$ commutes with $J$. If $(a,b)\ne(0,0)$, $\det(aI+bJ)=a^2+b^2>0$ and $(aI+bJ)\cdot\frac{aI-bJ}{a^2+b^2}=\frac{a^2I-b^2J^2}{a^2+b^2}=I$.

**T5.5** Substituting a matrix into polynomials respects sums and products because all powers of $J$ commute with each other. Divide: $f=q\,(x^2+1)+(a+bx)$; since $J^2+I=0$, $f(J)=aI+bJ$. So the image is $\{aI+bJ\}$, and $f(J)=0$ exactly when $a=b=0$ (the entries of $aI+bJ$ are $a$, $-b$, $b$, $a$), that is, when $x^2+1$ divides $f$. As in Theorem 4.5, $[f]\mapsto f(J)$ is then well defined, one-to-one, onto $\{aI+bJ\}$, and respects the operations: $[a+bx]\mapsto aI+bJ=M(a,b)$.

**T5.6** Let $\phi$ be such an isomorphism. Then $\phi([x])^2=\phi([x^2])=\phi([-1])=-1$, so $\phi([x])=\pm i$ by T3.3. And $\phi([a+bx])=a+b\,\phi([x])$, so $\phi$ is determined by this choice. Both choices work: $\phi_+([a+bx])=a+bi$ is $\Phi$ of Theorem 4.5, and $\phi_-([a+bx])=a-bi$ is $\sigma\circ\Phi$, an isomorphism because $\sigma$ respects sums and products (Section 4.6).

**T5.7** A real cubic has a real root $r$ (its values have opposite signs for large positive and large negative $x$, so by the intermediate value theorem it crosses $0$). So $m(x)=(x-r)\,h(x)$ with $h$ of degree 2. The classes $[x-r]$ and $[h]$ are non-zero, since $m$ cannot divide a non-zero polynomial of smaller degree, but $[x-r][h]=[m]=0$. Zero divisors, so no field. The same argument works for every odd degree greater than 1. So this route to a three-dimensional number system containing $\mathbb{R}$ fails; Chapter 5 explains why every route fails (the Frobenius theorem).

## 4.14 · Mastery check

1. Compute $(1,2)(3,-1)$ from the definition.
2. Prove $(0,1)^2=(-1,0)$.
3. Find the inverse of $(1,-1)$.
4. Find the remainder of $(1+x)^4$ on division by $x^2+1$.
5. In the dual numbers compute $(2+\varepsilon)^3$, and say what the two parts of the answer mean.
6. Which of $\mathbb{R}[x]/(x^2+2x+2)$, $\mathbb{R}[x]/(x^2+2x+1)$ and $\mathbb{R}[x]/(x^2+2x)$ is a field? Name the other two.
7. Find all pairs $(a,b)$ with $(a,b)^2=(3,4)$.
8. In one or two sentences, explain why the pair construction shows that the calculations of Chapters 1 to 3 cannot lead to a contradiction.

### Answers: Mastery check

1. $(3+2,\ -1+6)=(5,5)$.
2. $(0\cdot0-1\cdot1,\ 0\cdot1+1\cdot0)=(-1,0)$.
3. $(1,-1)(1,1)=(2,0)$, so the inverse is $\left(\tfrac12,\tfrac12\right)$.
4. $(1+i)^4=-4$, so the remainder is $-4$.
5. $8+12\varepsilon$: the value $2^3=8$ and the derivative $3\cdot2^2=12$ of $x^3$ at $2$.
6. The discriminants are $4-8<0$, $4-4=0$ and $4-0>0$. So the first is a field (a copy of $\mathbb{C}$), the second is the dual numbers and the third the split-complex numbers.
7. $a^2-b^2=3$ and $ab=2$; then $a^4-3a^2-4=0$, so $a^2=4$: $(2,1)$ or $(-2,-1)$.
8. The pairs are built from real numbers, and they satisfy every rule used in those chapters, with $(0,1)$ playing $i$. So a contradiction derived from those rules would be a contradiction about real numbers.

## 4.15 · Where this leads

Chapter 5 checks every field law for the pairs and asks the deeper question raised by T5.7: why is there no number system of dimension 3 (or any dimension other than 1 and 2) that extends $\mathbb{R}$ as a field? Chapter 6 develops the conjugate $\sigma$ of Section 4.6 and proves it is the only non-trivial symmetry of $\mathbb{C}$ fixing $\mathbb{R}$. Chapter 8 shows that, unlike $\mathbb{R}$, the field $\mathbb{C}$ cannot be ordered. Chapter 9 makes the identification $a=(a,0)$ precise, and Chapter 72 returns to how software stores and multiplies complex numbers.

---

## References

- **[H1]** W. R. Hamilton, "Theory of Conjugate Functions, or Algebraic Couples; with a Preliminary and Elementary Essay on Algebra as the Science of Pure Time", *Transactions of the Royal Irish Academy* 17 (1837), 293–422. Online edition by D. R. Wilkins, Trinity College Dublin, which describes the paper as defining complex numbers as "algebraic couples", ordered pairs of real numbers. [Read the edition](https://www.maths.tcd.ie/pub/HistMath/People/Hamilton/PureTime/).

The theorems in this chapter are standard. The worked examples and problems were written for this chapter; none is quoted from a past examination paper.
