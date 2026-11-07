---
id: KQV-MATH-D06-C005
course: "Course 2: Mathematics for Quantum Science"
domain: D06
chapter_number: 5
title: "Checking the Field Laws"
subtitle: "Every rule of arithmetic, proved for pairs; the one fact about real numbers that makes division possible; and why no number system of three dimensions can exist."
language: en
level: L3
ceiling: T6
prerequisites: "Chapter 4. Sections 5.8 to 5.10 use determinants and eigenvalues of small matrices, explained where they appear."
estimated_minutes: 130
version: 0.1.0
status: mathematically_checked
publication_status: published
---

# Chapter 5 · Checking the Field Laws

Chapter 4 built the complex numbers as pairs of real numbers and proved that the pairs add and multiply the way Chapters 1 to 3 assumed: commutatively, associatively, distributively (Theorem 4.4). That is not yet enough to do algebra. To solve $3z+5=11$ you subtract, and to finish you **divide**. Division is the law that fails for whole numbers, for $2\times2$ matrices and for the split-complex numbers of Chapter 4. Does it hold for the pairs, and if so, why?

This chapter checks every law on the list. Then it asks what made the construction work, and finds that the whole of division rests on one fact: a sum of two real squares is zero only when both are zero. That fact decides when the same construction works over other number systems, and it shows that repeating the trick on $\mathbb{C}$ itself fails.

Finally comes the question William Rowan Hamilton spent years on after 1837: pairs of real numbers can be multiplied, so can **triples**? The answer is no, and the proof takes six lines. The search led Hamilton in 1843 to a four-dimensional system, the quaternions, which today describe every rotation of a qubit.

> **Driving question:** Which rules of arithmetic do the pairs obey, which property of the real numbers makes division possible, and why can no number system of dimension 3 extend $\mathbb{R}$?

## 5.1 · What this chapter covers

By the end of this chapter you should be able to:

- state the field laws and prove every one of them for $\mathbb{C}$, including the existence and uniqueness of inverses;
- prove the laws a second way, by turning each complex number into a $2\times2$ matrix;
- name the single property of $\mathbb{R}$ that division depends on, and decide for any field $K$ whether pairs over $K$ form a field;
- derive the everyday consequences: cancellation, no zero divisors, at most two square roots;
- prove that $\mathbb{C}$ is the only field of dimension 2 over $\mathbb{R}$;
- prove that no field, and no number system without zero divisors, has dimension 3 (or any odd dimension above 1) over $\mathbb{R}$;
- define the quaternions, state the theorems of Frobenius and Hurwitz, and see why unit quaternions are single-qubit gates.

**Levels.** Sections 5.2 to 5.7 need Class 11 algebra. Section 5.6 reaches JEE Advanced and olympiad level. Sections 5.8 to 5.10 are first-year university algebra (dimension, determinants, eigenvalues). Section 5.10 ends with graduate results, stated with their sources.

### Prerequisite check

1. Compute $(2,1)(3,-2)$ from Definition 4.1.
2. When does a $2\times2$ real matrix have an inverse?
3. Explain why every real polynomial of degree 3 has a real root.

*Answers:* (1) $(6+2,\ -4+3)=(8,-1)$. (2) Exactly when its determinant is not $0$. (3) For $x^3+ax^2+bx+c$, the $x^3$ term dominates for large $|x|$, so the value is negative far to the left and positive far to the right; a continuous function that changes sign takes the value $0$ in between (the intermediate value theorem).

## 5.2 · The field laws

**Definition 5.1.** A **field** is a set $F$ with two operations, $+$ and $\times$, and two elements $0$ and $1$, such that for all $x,y,z$ in $F$:

- **(F1)** $x+y=y+x$
- **(F2)** $(x+y)+z=x+(y+z)$
- **(F3)** $x+0=x$
- **(F4)** there is $-x$ in $F$ with $x+(-x)=0$
- **(F5)** $xy=yx$
- **(F6)** $(xy)z=x(yz)$
- **(F7)** $x\cdot1=x$
- **(F8)** if $x\ne0$, there is $x^{-1}$ in $F$ with $x\,x^{-1}=1$
- **(F9)** $x(y+z)=xy+xz$
- **(F10)** $0\ne1$

The rational numbers $\mathbb{Q}$ and the real numbers $\mathbb{R}$ are fields. The integers $\mathbb{Z}$ are not: $2$ has no inverse in $\mathbb{Z}$. The integers modulo a prime $p$, written $\mathbb{F}_p$, form a field. The $2\times2$ real matrices fail (F5) and (F8).

These ten laws are exactly what school algebra uses. Solving $ax+b=c$ with $a\ne0$, every step is one of them:

| Step | Law used |
|---|---|
| $ax+b=c$ | given |
| $(ax+b)+(-b)=c+(-b)$ | (F4): $-b$ exists |
| $ax+(b+(-b))=c-b$ | (F2) |
| $ax=c-b$ | (F4), (F3) |
| $a^{-1}(ax)=a^{-1}(c-b)$ | (F8): $a^{-1}$ exists |
| $(a^{-1}a)x=a^{-1}(c-b)$ | (F6) |
| $x=a^{-1}(c-b)$ | (F5), (F8), (F7) |

So "the pairs form a field" means: every manipulation you learned for real numbers is valid for complex numbers.

## 5.3 · The addition laws

**Theorem 5.1.** *The pairs satisfy (F1) to (F4), with zero $(0,0)$ and $-(a,b)=(-a,-b)$.*

*Proof.* Addition acts on each coordinate separately, $(a,b)+(c,d)=(a+c,\ b+d)$, so each law follows from the same law for real numbers, applied twice. For (F1): $(a+c,\ b+d)=(c+a,\ d+b)$. For (F2): both sides equal $(a+c+e,\ b+d+f)$. For (F3): $(a,b)+(0,0)=(a,b)$. For (F4): $(a,b)+(-a,-b)=(0,0)$. ∎

Nothing here involves $i$: under addition, the pairs are just the plane $\mathbb{R}^2$ of vectors.

## 5.4 · The multiplication laws, and a second proof

Theorem 4.4 proved (F5), (F6) and (F9) by expanding both sides. (F7) and (F10) are immediate:

$$
\begin{aligned}(a,b)(1,0)&=(a\cdot1-b\cdot0,\\&\qquad a\cdot0+b\cdot1)\\&=(a,b),\end{aligned}
$$

and $(0,0)\ne(1,0)$ because the first coordinates differ.

The expansion proof of associativity in Theorem 4.4 is correct but gives no reason *why* it works. Here is a second proof that does.

**Definition 5.2.** For a pair $z=(a,b)$, let
$$
M(z)=\begin{pmatrix}a&-b\\b&a\end{pmatrix}.
$$

**Theorem 5.2.** *For all pairs $z,w$: $M(z+w)=M(z)+M(w)$, $M(zw)=M(z)\,M(w)$ and $M(1,0)=I$. Different pairs give different matrices.*

*Proof.* Sums: add entry by entry. Products, with $z=(a,b)$ and $w=(c,d)$:
$$
\begin{aligned}M(z)M(w)&=\begin{pmatrix}ac-bd&-(ad+bc)\\ad+bc&ac-bd\end{pmatrix}\\&=M(ac-bd,\ ad+bc)\\&=M(zw).\end{aligned}
$$
$M(1,0)$ is the identity matrix. The pair $(a,b)$ can be read off the first column of $M(a,b)$, so different pairs give different matrices. ∎

**Corollary.** *Multiplication of pairs is associative.*

*Proof.* $M\big((zw)u\big)=M(zw)M(u)=M(z)M(w)M(u)$, and in the same way $M\big(z(wu)\big)=M(z)M(w)M(u)$, because matrix multiplication is associative. Different pairs give different matrices, so $(zw)u=z(wu)$. ∎

Matrix multiplication is associative for a deep but simple reason: a matrix is a linear map, multiplying matrices composes the maps, and composing functions is always associative, since doing $f$ after ($g$ after $h$) and doing ($f$ after $g$) after $h$ are the same three steps. And $M(z)$ *is* a map: it is "multiply by $z$". Writing $w=(c,d)$ as a column,
$$
M(z)\begin{pmatrix}c\\d\end{pmatrix}=\begin{pmatrix}ac-bd\\bc+ad\end{pmatrix},
$$
which is $zw$. So associativity of complex multiplication is associativity of composing the maps "multiply by $z$". Chapter 21 shows that each of these maps is a rotation combined with a stretch.

![Multiplying by z = (2, 1) moves every point of the plane by the matrix M(z). The unit square with corners 0, 1, 1 + i, i goes to the square with corners 0, z, z(1 + i), zi: turned and stretched by the factor √5, but still a square.](diagram:c5-square)

## 5.5 · Inverses

**Theorem 5.3.** *Every pair $z=(a,b)\ne(0,0)$ has exactly one inverse, namely*
$$
z^{-1}=\left(\frac{a}{a^2+b^2},\ \frac{-b}{a^2+b^2}\right).
$$
*Hence the pairs form a field.*

**Where the formula comes from.** We want $(c,d)$ with $(a,b)(c,d)=(1,0)$, that is,
$$
\begin{aligned}ac-bd&=1,\\bc+ad&=0.\end{aligned}
$$
This is a linear system for $c$ and $d$. Its matrix is $M(z)$, whose determinant is $a^2+b^2$. Solving by elimination (multiply the first equation by $a$, the second by $b$, and add) gives $(a^2+b^2)c=a$; similarly $(a^2+b^2)d=-b$.

*Proof.* First, $a^2+b^2\ne0$: a real square is never negative, so $a^2+b^2=0$ forces $a^2=b^2=0$, that is $z=(0,0)$. So the formula makes sense, and
$$
\begin{aligned}&(a,b)\left(\tfrac{a}{a^2+b^2},\ \tfrac{-b}{a^2+b^2}\right)\\&=\left(\tfrac{a^2+b^2}{a^2+b^2},\ \tfrac{-ab+ba}{a^2+b^2}\right)\\&=(1,0).\end{aligned}
$$
For uniqueness, suppose $zw=1$ and $zw'=1$. Then, using (F5), (F6) and (F7),
$$
w=w(zw')=(wz)w'=w'.
$$
Together with Theorems 4.4, 5.1 and Section 5.4, all ten laws hold. ∎

**Example.** $(3,4)^{-1}=\left(\tfrac3{25},-\tfrac4{25}\right)$. Check: $(3,4)\left(\tfrac3{25},-\tfrac4{25}\right)=\left(\tfrac{9+16}{25},\ \tfrac{-12+12}{25}\right)=(1,0)$. In the usual notation, $\dfrac1{3+4i}=\dfrac{3-4i}{25}$. Chapter 7 turns this into a routine for dividing in the form $a+bi$.

## 5.6 · The one fact that makes division work

Read the proofs again and list what they used about the real numbers. Theorems 4.4 and 5.1 and Section 5.4 used only that $\mathbb{R}$ is a field: they would work word for word with $\mathbb{R}$ replaced by any field $K$. Theorem 5.3 used one more fact:

$$
a^2+b^2=0\ \text{ only when }\ a=b=0.
$$

Over $\mathbb{R}$ this holds because squares are never negative. Over other fields it may fail. What exactly is needed?

**Theorem 5.4 (pairs over any field).** *Let $K$ be a field, and give the pairs $(a,b)$ with $a,b$ in $K$ the operations of Definition 4.1. They satisfy (F1) to (F7), (F9) and (F10). They form a field if and only if $-1$ is not a square in $K$, that is, no $c$ in $K$ has $c^2=-1$.*

*Proof.* The laws other than (F8) have the same proofs as before. Suppose first that $-1$ is not a square in $K$, and let $(a,b)\ne(0,0)$. If $a^2+b^2=0$, then $b\ne0$ (otherwise $a^2=0$, so $a=0$), and dividing by $b^2$ gives $(a/b)^2=-1$, which is impossible. So $a^2+b^2\ne0$, and the formula of Theorem 5.3 gives an inverse.

Suppose instead that $c^2=-1$ for some $c$ in $K$. Then
$$
\begin{aligned}(c,1)(c,-1)&=(c^2+1,\ -c+c)\\&=(0,0).\end{aligned}
$$
If $(c,1)$ had an inverse $u$, then $(c,-1)=u\,(c,1)(c,-1)=u\,(0,0)=(0,0)$, which is false. So $(c,1)$, which is not zero, has no inverse. ∎

Three consequences, each worth remembering:

1. **Over $\mathbb{Q}$** the pairs form a field, the **Gaussian rationals** $\mathbb{Q}(i)$, because no rational number squares to $-1$.
2. **Over $\mathbb{F}_p$** the pairs form a field exactly when $-1$ is not a square modulo $p$. Chapter 4 showed that $-1$ is a square modulo an odd prime $p$ exactly when $p\equiv1\pmod4$, so this is Theorem 4.8 again, now with the reason in one line. Modulo 2, $-1=1=1^2$, so it fails.
3. **Over $\mathbb{C}$ itself** the construction fails, because $i^2=-1$. Pairs of complex numbers with this multiplication have zero divisors: $(i,1)(i,-1)=(0,0)$. *The trick that turned $\mathbb{R}$ into $\mathbb{C}$ cannot be repeated to build something bigger.* Any larger system must be built differently, and Section 5.10 shows what that costs.

## 5.7 · What the field laws buy

Everything in this section is proved from (F1) to (F10) alone, so it holds in every field: $\mathbb{Q}$, $\mathbb{R}$, $\mathbb{C}$, $\mathbb{F}_p$.

**Theorem 5.5.** *In any field:*

*(a) $0\cdot x=0$ for every $x$;*
*(b) if $xy=0$, then $x=0$ or $y=0$ (no zero divisors);*
*(c) if $xy=xz$ and $x\ne0$, then $y=z$ (cancellation);*
*(d) $(-1)x=-x$;*
*(e) if $a\ne0$, the equation $ax=b$ has exactly one solution, $x=a^{-1}b$;*
*(f) $x^2=y^2$ exactly when $x=y$ or $x=-y$.*

*Proof.* (a) $0x=(0+0)x=0x+0x$ by (F3) and (F9); adding $-(0x)$ to both sides gives $0=0x$.

(b) If $x\ne0$, then $y=1\cdot y=(x^{-1}x)y=x^{-1}(xy)=x^{-1}\cdot0=0$, by (a).

(c) $x(y-z)=xy-xz=0$, so by (b) $y-z=0$.

(d) $x+(-1)x=(1+(-1))x=0\cdot x=0$, so $(-1)x$ is an additive inverse of $x$. Additive inverses are unique: if $x+u=0=x+v$, then $u=u+(x+v)=(u+x)+v=v$. So $(-1)x=-x$.

(e) $x=a^{-1}b$ works, since $a(a^{-1}b)=(aa^{-1})b=b$. If $ax=b=ax'$, then $x=x'$ by (c).

(f) $x^2-y^2=(x-y)(x+y)$ by (F5) and (F9); now use (b). ∎

**Example.** The equation $z^2=-1$ has exactly two complex solutions. Since $i^2=-1$, part (f) says $z^2=i^2$ forces $z=i$ or $z=-i$. Compare the split-complex numbers of Chapter 4, which are not a field: there $z^2=1$ has four solutions.

**Example.** Solve $z^2=z$ in $\mathbb{C}$. Then $z(z-1)=0$, so $z=0$ or $z=1$ by (b). Nothing else, even though $\mathbb{C}$ is much larger than $\mathbb{R}$.

## 5.8 · The only plane of numbers

Chapter 4 classified every way of multiplying pairs (Theorem 4.6). Here is a direct proof, from the field laws alone, that among them $\mathbb{C}$ is the only field. A field $K$ that contains $\mathbb{R}$ is in particular a real vector space; its **dimension over $\mathbb{R}$** is the number of elements in a basis.

**Theorem 5.6.** *Let $K$ be a field containing $\mathbb{R}$, of dimension 2 over $\mathbb{R}$. Then $K$ is isomorphic to $\mathbb{C}$, and there are exactly two isomorphisms $\mathbb{C}\to K$ that fix every real number.*

*Proof.* Choose $e$ in $K$ that is not real. Then $1$ and $e$ are linearly independent, so they form a basis, and $e^2=p+qe$ for some real $p,q$. Put $f=e-\tfrac q2$. Then
$$
\begin{aligned}f^2&=e^2-qe+\tfrac{q^2}4\\&=p+\tfrac{q^2}4=:d,\end{aligned}
$$
a real number. If $d\ge0$, let $s=\sqrt d$. Then $(f-s)(f+s)=f^2-s^2=0$, so $f=s$ or $f=-s$ by Theorem 5.5(b). Either way $f$ is real, and so is $e=f+\tfrac q2$, a contradiction. Hence $d<0$, and $j=f/\sqrt{-d}$ satisfies $j^2=d/(-d)=-1$.

By Theorem 4.7, $\psi(a,b)=a+bj$ is a one-to-one map $\mathbb{C}\to K$ that respects sums and products. It is onto, because $1,j$ is a basis of $K$ ($j$ is not real). So $\psi$ is an isomorphism.

An isomorphism $\varphi$ that fixes the reals sends $(a,b)=a+bi$ to $a+b\,\varphi(i)$, so it is decided by $\varphi(i)$, which must satisfy $\varphi(i)^2=\varphi(i^2)=-1$. By Theorem 5.5(f), the only square roots of $-1$ in $K$ are $j$ and $-j$. Both choices give isomorphisms ($a+bi\mapsto a-bj$ is $\psi$ composed with conjugation), so there are exactly two. ∎

So "the" complex numbers are well defined: any two-dimensional field extending $\mathbb{R}$ is a copy of $\mathbb{C}$, and there is no preferred way to tell $i$ from $-i$. Chapter 6 studies the second isomorphism, conjugation.

## 5.9 · Why there is no three-dimensional number system

After 1837 Hamilton tried, for years, to multiply **triples** $(a,b,c)$ in a way that extends the real numbers and allows division. In a letter of 17 October 1843 he described the attempts in detail [H2]. The following theorem explains why every attempt had to fail.

**Theorem 5.7.** *Let $K$ be a field containing $\mathbb{R}$, of finite odd dimension $n$ over $\mathbb{R}$. Then $n=1$ and $K=\mathbb{R}$. In particular, there is no field of dimension 3 over $\mathbb{R}$.*

*Proof.* Take any $x$ in $K$, and let $L$ be the map $L(v)=xv$ from $K$ to $K$. By (F9), and because real numbers multiply into everything, $L$ is a linear map of the $n$-dimensional real vector space $K$. Choose a basis; $L$ becomes an $n\times n$ real matrix $A$. Its **characteristic polynomial** $\chi(\lambda)=\det(\lambda I-A)$ is a real polynomial of degree $n$ with leading coefficient $1$. Because $n$ is odd, $\chi(\lambda)\to-\infty$ as $\lambda\to-\infty$ and $\chi(\lambda)\to+\infty$ as $\lambda\to+\infty$, so by the intermediate value theorem $\chi$ has a real root $\lambda_0$.

Then $\det(\lambda_0I-A)=0$, so the matrix $\lambda_0I-A$ is not invertible, and there is a vector $v\ne0$ with $Av=\lambda_0v$. In $K$ this says $xv=\lambda_0v$, that is
$$
(x-\lambda_0)\,v=0.
$$
Since $v\ne0$ and $K$ is a field, Theorem 5.5(b) gives $x=\lambda_0$: the element $x$ is real. Every $x$ in $K$ is real, so $K=\mathbb{R}$ and $n=1$. ∎

![Why odd dimension forces a real eigenvalue. The characteristic polynomial of multiplication by x has odd degree, so its graph must cross the axis somewhere, at a real λ₀. Then (x − λ₀)v = 0 for some v ≠ 0, which in a field forces x = λ₀.](diagram:c5-cubic)

Look at what the proof really used: that multiplication distributes and is compatible with real scalars, that there is an identity, and that **there are no zero divisors**. It never used commutativity or associativity. So it proves more.

**Theorem 5.8.** *Let $A$ be a real vector space of finite dimension $n$ with a multiplication that distributes over addition, satisfies $(rx)y=r(xy)=x(ry)$ for real $r$, has an identity $1$, and has no zero divisors. If $n$ is odd, then $n=1$.*

*Proof.* As above, with $L(v)=xv$: from $xv=\lambda_0v$ we get $(x-\lambda_01)v=0$, so $x=\lambda_01$, for every $x$. ∎

So a number system extending $\mathbb{R}$ in which you can always divide must have even dimension: 2, 4, 6, 8, and so on. Much more is true, but the proofs need topology. Hopf showed in 1940 that $n$ must be a power of 2 [H5], and Bott and Milnor [B1] and Kervaire [K1] showed in 1958 that $n$ must be 1, 2, 4 or 8.

If the system is a **field** (commutative, associative, with inverses), the answer is sharper still. The next theorem uses the Fundamental Theorem of Algebra, which Chapter 18 states and Chapter 45 proves; nothing in Chapters 1 to 17 depends on it.

**Theorem 5.9.** *Assume the Fundamental Theorem of Algebra: every non-constant complex polynomial has a complex root. Then every field containing $\mathbb{R}$ of finite dimension over $\mathbb{R}$ is either $\mathbb{R}$ or a copy of $\mathbb{C}$.*

*Proof.* Let $K$ be such a field, of dimension $n$, and let $x$ be in $K$. The $n+1$ elements $1,x,\dots,x^n$ are linearly dependent, so $g(x)=0$ for some non-zero real polynomial $g$. By the Fundamental Theorem, $g$ factors over $\mathbb{R}$ into factors of degree 1 and 2 (non-real roots come in conjugate pairs, which Chapter 18 proves). The product of the factors, evaluated at $x$, is $0$, so one factor $h$ has $h(x)=0$ by Theorem 5.5(b). If $h$ has degree 1, $x$ is real. Otherwise $h$ has degree 2 and no real root, so $x$ is not real. The span $S$ of $1$ and $x$ is closed under multiplication, since $x^2$ is a combination of $1$ and $x$. It is a field: multiplication by a non-zero $y$ in $S$ maps $S$ to itself one-to-one (no zero divisors), hence onto, so $yw=1$ for some $w$ in $S$. By Theorem 5.6, $S$ contains some $j$ with $j^2=-1$.

So if $K\ne\mathbb{R}$, then $K$ contains such a $j$, and $C=\{a+bj\}$ is a copy of $\mathbb{C}$ inside $K$. Now $K$ is a vector space over $C$ of finite dimension $m$, and the same argument over $C$ gives, for each $x$ in $K$, a non-zero complex polynomial $g$ with $g(x)=0$. By the Fundamental Theorem, $g$ splits into factors of degree 1 over $C$, so $x-c=0$ for some $c$ in $C$. Hence $K=C$. ∎

## 5.10 · Giving something up: the quaternions

On 16 October 1843, walking along the Royal Canal in Dublin, Hamilton saw how to do it: use **four** dimensions, and give up commutativity. He carved the rule into a stone of Broome Bridge [H3]:

$$
i^2=j^2=k^2=ijk=-1.
$$

**Definition 5.3.** The **quaternions** $\mathbb{H}$ are the expressions $q=a+bi+cj+dk$ with $a,b,c,d$ real, added coordinate by coordinate and multiplied using the distributive law, real numbers commuting with everything, and Hamilton's rule.

From the rule, $ij=k$: multiply $ijk=-1$ on the right by $k$ to get $ij\,k^2=-k$, that is $-ij=-k$. In the same way (Problem T5.4),
$$
\begin{aligned}ij&=k,&ji&=-k,\\jk&=i,&kj&=-i,\\ki&=j,&ik&=-j.\end{aligned}
$$
So $ij\ne ji$: **multiplication of quaternions is not commutative.** For $q=a+bi+cj+dk$ define the **conjugate** $\bar q=a-bi-cj-dk$ and the **norm** $|q|^2=a^2+b^2+c^2+d^2$.

**Theorem 5.10.** *Quaternion multiplication is associative. For every $q$, $q\bar q=\bar qq=|q|^2$, so every $q\ne0$ has the inverse $q^{-1}=\bar q/|q|^2$. For all $p,q$, $|pq|=|p|\,|q|$.*

*Proof.* As in Section 5.4, use matrices. Send $1\mapsto I$ and
$$
\begin{aligned}i&\mapsto\begin{pmatrix}0&-i\\-i&0\end{pmatrix},\\j&\mapsto\begin{pmatrix}0&-1\\1&0\end{pmatrix},\\k&\mapsto\begin{pmatrix}-i&0\\0&i\end{pmatrix}.\end{aligned}
$$
(The $i$ inside the matrices is the complex number $i$.) Each of the three matrices squares to $-I$, and the product of the three, in order, is $-I$, so the matrices obey Hamilton's rule. A quaternion $q=a+bi+cj+dk$ goes to
$$
Q(q)=\begin{pmatrix}\alpha&-\bar\beta\\\beta&\bar\alpha\end{pmatrix},
$$
with $\alpha=a-di$ and $\beta=c-bi$. Different quaternions give different matrices, the map respects sums, and it respects products because both sides are computed by the same distributive expansion from the same rule. Matrix multiplication is associative, so quaternion multiplication is.

Next, $\det Q(q)=|\alpha|^2+|\beta|^2=a^2+b^2+c^2+d^2=|q|^2$, and $Q(\bar q)$ is the conjugate transpose of $Q(q)$; for this kind of matrix, $Q(q)\,Q(q)^{\dagger}=|q|^2I$. So $q\bar q=|q|^2$, and likewise $\bar qq=|q|^2$. Finally $|pq|^2=\det Q(pq)=\det Q(p)\det Q(q)=|p|^2|q|^2$. ∎

So in $\mathbb{H}$ you can divide, but you must say on which side: $q^{-1}p$ and $pq^{-1}$ are usually different. A system with every law except (F5) is called a **division ring** or **skew field**. Theorems 5.7 and 5.8 do not forbid $\mathbb{H}$: its dimension, 4, is even.

**What is lost at each step.** Theorem 5.10's identity $|pq|=|p||q|$, written out in coordinates, says that a product of two sums of four squares is again a sum of four squares (Euler's four-square identity, Problem T5.5). For pairs, the same fact is the two-square identity of Brahmagupta (Problem T3.3). Hamilton's friend John Graves and, independently, Arthur Cayley found an eight-dimensional system, the **octonions** $\mathbb{O}$, in which even associativity fails. The ladder stops there:

| System | Dimension | Lost at this step |
|---|---|---|
| $\mathbb{R}$ | 1 | |
| $\mathbb{C}$ | 2 | order (Chapter 8) |
| $\mathbb{H}$ | 4 | commutativity |
| $\mathbb{O}$ | 8 | associativity |

![The ladder of number systems in which you can divide: ℝ, ℂ, ℍ and 𝕆, of dimensions 1, 2, 4 and 8. Each step doubles the dimension and gives up one rule. Dimension 3, or any other odd dimension above 1, is impossible (Theorem 5.8).](diagram:c5-ladder)

Three theorems close the subject, each with full hypotheses:

- **Frobenius (1878).** Every associative division algebra of finite dimension over $\mathbb{R}$ (with $\mathbb{R}$ commuting with everything) is isomorphic to $\mathbb{R}$, $\mathbb{C}$ or $\mathbb{H}$ [F1].
- **Hurwitz (1898).** Every finite-dimensional real algebra with identity and a norm from a positive definite quadratic form satisfying $|xy|=|x||y|$ is isomorphic to $\mathbb{R}$, $\mathbb{C}$, $\mathbb{H}$ or $\mathbb{O}$ [H4].
- **Bott–Milnor and Kervaire (1958).** A finite-dimensional real algebra without zero divisors (no associativity, no identity and no norm assumed) has dimension 1, 2, 4 or 8 [B1], [K1].

**The quantum link.** A quaternion of norm 1 goes to a matrix $\begin{pmatrix}\alpha&-\bar\beta\\\beta&\bar\alpha\end{pmatrix}$ with $|\alpha|^2+|\beta|^2=1$. These are exactly the $2\times2$ unitary matrices of determinant 1, the group called $SU(2)$, and every single-qubit gate is one of them times a global phase. In the matrix model, $i,j,k$ are $-iX$, $-iY$, $-iZ$ in terms of the Pauli matrices $X,Y,Z$ of Course 1 (Problem T6.5), so the unit quaternion $\cos\tfrac\theta2+\sin\tfrac\theta2\,i$ is the rotation gate $R_x(\theta)=\cos\tfrac\theta2\,I-i\sin\tfrac\theta2\,X$. The half-angle is the same one that puts $|0\rangle$ and $|1\rangle$ at opposite poles of the Bloch sphere, and $q$ and $-q$ describe the same rotation of the sphere: a qubit turned through $360^\circ$ comes back multiplied by $-1$.

## 5.11 · Toolkit

1. **Check a law coordinate by coordinate** when the operation acts on each coordinate separately (all the addition laws).
2. **Turn numbers into matrices.** $z\mapsto M(z)$ turns complex multiplication into matrix multiplication; laws such as associativity, and identities such as $|zw|=|z||w|$ (from $\det$), come for free. Use it whenever an expansion gets long.
3. **Find an inverse by solving a linear system.** $zw=1$ is two linear equations in the coordinates of $w$; the determinant decides whether a solution exists.
4. **Ask whether $-1$ is a square.** Pairs over a field $K$ form a field exactly when $-1$ is not a square in $K$. If $c^2=-1$, then $(c,1)(c,-1)=0$ exhibits the failure.
5. **Use "no zero divisors" to count roots.** In a field, $(x-a)(x-b)=0$ forces $x=a$ or $x=b$; so $x^2=y^2$ gives $x=\pm y$, and a quadratic has at most two roots.
6. **Complete the square** to find a square root of $-1$ in a two-dimensional field: $f=e-\tfrac q2$ has a real square.
7. **Odd dimension gives a real eigenvalue.** For a multiplication by $x$ on a space of odd dimension, the characteristic polynomial has a real root $\lambda_0$, so $(x-\lambda_0)v=0$ for some $v\ne0$.
8. **Norms that multiply give sum-of-squares identities**, and an identity $|xy|=|x||y|$ rules out zero divisors at once.

## 5.12 · Misconceptions to avoid

**"Division by $z$ just needs $z\ne0$, so every number system has it."** The integers, the matrices, and the split-complex numbers all have non-zero elements without inverses. For pairs, division needs the fact that $a^2+b^2=0$ only when $a=b=0$.

**"We proved the laws for $a+bi$ in Chapters 1 to 3."** Those chapters *assumed* them. Chapter 4 and this chapter prove them for an object built from real numbers.

**"The construction works over any field."** Only when $-1$ is not a square. Over $\mathbb{F}_5$ ($2^2\equiv-1$), over $\mathbb{F}_2$, and over $\mathbb{C}$ itself, it produces zero divisors.

**"Repeat the pair construction on $\mathbb{C}$ to get a four-dimensional field."** Pairs of complex numbers with the same rule have $(i,1)(i,-1)=(0,0)$. The quaternions are built with a different rule, and they are not commutative.

**"A field of dimension 3 might exist; nobody has found it yet."** Theorem 5.7 proves it cannot exist. The same proof rules out any number system of odd dimension above 1 in which you can always divide.

**"In the quaternions, $(pq)^{-1}=p^{-1}q^{-1}$."** The order reverses: $(pq)^{-1}=q^{-1}p^{-1}$, because $(pq)(q^{-1}p^{-1})=p(qq^{-1})p^{-1}=1$. In a commutative field the two agree.

## 5.13 · Problem ladder

Tiers: T1 foundation, T2 board and JEE Main, T3 JEE Advanced, T4 olympiad, T5 university, T6 graduate and PhD qualifying. Each answer names the key idea and, where useful, a common wrong approach.

### Tier 1 · Foundation

**T1.1** Compute $(2,3)+(-1,4)$ and the additive inverse of the result.

**T1.2** Find the inverse of $(3,-4)$ and check it by multiplying.

**T1.3** Show that $(1,0)$ is the identity: $(a,b)(1,0)=(1,0)(a,b)=(a,b)$.

**T1.4** Solve $(1,2)\,z=(3,-1)$.

**T1.5** Explain why $(0,0)$ has no inverse.

**T1.6** Write down $M(z)$ for $z=(1,1)$ and compute $M(z)^2$. Which pair does it represent?

### Answers: Tier 1

**T1.1** $(1,7)$; its inverse is $(-1,-7)$. *Key idea:* addition is coordinate by coordinate.

**T1.2** $a^2+b^2=25$, so $(3,-4)^{-1}=\left(\tfrac3{25},\tfrac4{25}\right)$. Check: $\left(\tfrac{9+16}{25},\ \tfrac{12-12}{25}\right)=(1,0)$. *Wrong approach:* inverting each coordinate, $\left(\tfrac13,-\tfrac14\right)$; that gives $(3,-4)\left(\tfrac13,-\tfrac14\right)=(1-1,\ -\tfrac34-\tfrac43)\ne(1,0)$.

**T1.3** $(a\cdot1-b\cdot0,\ a\cdot0+b\cdot1)=(a,b)$, and the other order is the same by (F5).

**T1.4** $z=(1,2)^{-1}(3,-1)=\left(\tfrac15,-\tfrac25\right)(3,-1)=\left(\tfrac35-\tfrac25,\ -\tfrac15-\tfrac65\right)=\left(\tfrac15,-\tfrac75\right)$. Check: $(1,2)\left(\tfrac15,-\tfrac75\right)=\left(\tfrac{1+14}5,\ \tfrac{-7+2}5\right)=(3,-1)$. *Key idea:* Theorem 5.5(e).

**T1.5** $(0,0)(c,d)=(0,0)$ for every $(c,d)$, never $(1,0)$. (F8) only asks for inverses of non-zero elements.

**T1.6** $M(1,1)=\begin{pmatrix}1&-1\\1&1\end{pmatrix}$ and $M(1,1)^2=\begin{pmatrix}0&-2\\2&0\end{pmatrix}=M(0,2)$. So $(1,1)^2=(0,2)$, that is $(1+i)^2=2i$.

### Tier 2 · Board and JEE Main

**T2.1** Using only Theorem 5.5, find all complex $z$ with $z^2=4z$.

**T2.2** Prove that $(zw)^{-1}=z^{-1}w^{-1}$ for non-zero complex $z,w$.

**T2.3** Prove that $(z^{-1})^{-1}=z$ in two ways: from the formula of Theorem 5.3, and from uniqueness of inverses.

**T2.4** If $zw=zu$ and $z=(2,-1)$, show that $w=u$. Which law did you use?

**T2.5** Show that $\det M(z)=a^2+b^2$ for $z=(a,b)$, and use $M(zw)=M(z)M(w)$ to prove $(a^2+b^2)(c^2+d^2)=(ac-bd)^2+(ad+bc)^2$.

### Answers: Tier 2

**T2.1** $z^2-4z=z(z-4)=0$, so $z=0$ or $z=4$ by Theorem 5.5(b). *Wrong approach:* dividing by $z$ first, which loses the solution $z=0$.

**T2.2** $(zw)(z^{-1}w^{-1})=(zz^{-1})(ww^{-1})=1$, using (F5) and (F6) to regroup; by uniqueness of inverses this is $(zw)^{-1}$.

**T2.3** Formula: $z^{-1}=\left(\tfrac aN,-\tfrac bN\right)$ with $N=a^2+b^2$; its own norm is $\tfrac{a^2+b^2}{N^2}=\tfrac1N$, so its inverse is $\left(\tfrac aN\cdot N,\ \tfrac bN\cdot N\right)=(a,b)$. Uniqueness: $z^{-1}z=1$ says $z$ is an inverse of $z^{-1}$, and inverses are unique.

**T2.4** Multiply both sides by $z^{-1}=\left(\tfrac25,\tfrac15\right)$: $w=u$. This is cancellation, Theorem 5.5(c), which needs (F8).

**T2.5** $\det\begin{pmatrix}a&-b\\b&a\end{pmatrix}=a^2+b^2$. Taking determinants of $M(zw)=M(z)M(w)$ gives $\det M(zw)=\det M(z)\det M(w)$, and $zw=(ac-bd,\ ad+bc)$. *Key idea:* determinants multiply.

### Tier 3 · JEE Advanced

**T3.1** Find the inverse of $(\cos\theta,\sin\theta)$ and describe what multiplying by it does to the plane.

**T3.2** The coordinate-wise product $(a,b)\odot(c,d)=(ac,\ bd)$ satisfies every field law except one. Which, and why?

**T3.3** Use T2.5 to write $65=5\cdot13$ as a sum of two squares in two different ways.

**T3.4** For which real $k$ do the pairs with product $(a,b)(c,d)=(ac+k\,bd,\ ad+bc)$ form a field?

**T3.5** Find all complex $z$ with $z^3=z$, and explain why there are no more than three.

### Answers: Tier 3

**T3.1** $\cos^2\theta+\sin^2\theta=1$, so the inverse is $(\cos\theta,-\sin\theta)$. $M(\cos\theta,\sin\theta)$ is the rotation matrix through $\theta$, so multiplying by the inverse rotates the plane through $-\theta$.

**T3.2** (F8) fails: $(1,0)\odot(0,1)=(0,0)$, so $(1,0)$ is a zero divisor and has no inverse ($(1,0)\odot(c,d)=(c,0)\ne(1,1)$, where $(1,1)$ is the identity). All the other laws hold because each coordinate is a copy of $\mathbb{R}$.

**T3.3** $5=1^2+2^2$, $13=2^2+3^2$. With $(a,b,c,d)=(1,2,2,3)$: $(2-6)^2+(3+4)^2=16+49=65$. With $(1,2,3,2)$: $(3-4)^2+(2+6)^2=1+64=65$. So $65=4^2+7^2=1^2+8^2$. *Key idea:* the two-square identity, known to Brahmagupta in the 7th century.

**T3.4** Solving $(a,b)(c,d)=(1,0)$ gives a linear system with determinant $a^2-kb^2$. If $k<0$, then $a^2-kb^2>0$ for every non-zero pair, so inverses exist and it is a field (isomorphic to $\mathbb{C}$: $(0,1)/\sqrt{-k}$ squares to $-1$). If $k=c^2\ge0$, then $(c,1)(c,-1)=(c^2-k,\ 0)=(0,0)$, a zero divisor. So: a field exactly when $k<0$. *Key idea:* Theorem 5.4 with "$k$ is a square" in place of "$-1$ is a square".

**T3.5** $z^3-z=z(z-1)(z+1)=0$, so $z\in\{0,1,-1\}$ by Theorem 5.5(b), applied twice. *Wrong approach:* expecting more roots because $\mathbb{C}$ is bigger; the number of roots is limited by the absence of zero divisors, not by the size of the field.

### Tier 4 · Olympiad

**T4.1** Prove: if a prime $p\equiv3\pmod4$ divides $a^2+b^2$ for integers $a,b$, then $p$ divides both $a$ and $b$.

**T4.2** Write $2026$ as a sum of two squares, given that $1013$ is prime and $1013=22^2+23^2$.

**T4.3** Prove that a product of two numbers, each a sum of four integer squares, is again a sum of four integer squares, assuming the identity $|pq|=|p||q|$ of Theorem 5.10.

**T4.4** Let $F$ be a field in which $1+1\ne0$. Prove that $x^2=1$ has exactly the solutions $1$ and $-1$, and that they are different.

**T4.5** Show that the pairs over $\mathbb{F}_7$ form a field with $49$ elements. In that field, solve $z^2=3$, although $3$ is not a square modulo $7$.

### Answers: Tier 4

**T4.1** Work in $\mathbb{F}_p$. If $p\nmid b$, then $b$ is invertible modulo $p$ and $a^2+b^2\equiv0$ gives $(ab^{-1})^2\equiv-1$. But $-1$ is not a square modulo $p$ when $p\equiv3\pmod4$ (Chapter 4, Theorem 4.8). So $p\mid b$, then $p\mid a^2$, so $p\mid a$. *Key idea:* Theorem 5.4's dichotomy, used in $\mathbb{F}_p$.

**T4.2** $2=1^2+1^2$, so by T2.5 with $(a,b,c,d)=(1,1,22,23)$: $2026=(22-23)^2+(23+22)^2=1+2025=1^2+45^2$.

**T4.3** Write $m=|p|^2$ and $n=|q|^2$ for quaternions $p,q$ with integer coordinates. Then $pq$ has integer coordinates, and $mn=|p|^2|q|^2=|pq|^2$ is a sum of four integer squares. Written out, this is Euler's four-square identity (T5.5).

**T4.4** $x^2-1=(x-1)(x+1)$, so $x=1$ or $x=-1$ by Theorem 5.5(b); both work. They differ: $1=-1$ would mean $1+1=0$. *Common slip:* in $\mathbb{F}_2$, $1=-1$ and there is only one solution.

**T4.5** The squares modulo 7 are $0,1,2,4$, so $-1\equiv6$ is not a square, and Theorem 5.4 gives a field with $7^2=49$ elements. Write $z=(a,b)$: $z^2=(a^2-b^2,\ 2ab)=(3,0)$ needs $ab=0$. If $b=0$, then $a^2=3$, impossible. If $a=0$, then $-b^2=3$, so $b^2=-3=4$ and $b=\pm2$. So $z=\pm(0,2)$: indeed $(0,2)^2=(-4,0)=(3,0)$. *Key idea:* in the bigger field, $3=-4=(2i)^2$. *Wrong approach:* concluding "no solution" from the calculation in $\mathbb{F}_7$ alone.

### Tier 5 · University

**T5.1** Show that pairs over $\mathbb{F}_2$ are not a field by finding a non-zero $z$ with $z^2=0$.

**T5.2** Let $K=\mathbb{Q}(i)$, the Gaussian rationals. Show that pairs over $K$, with the rule of Definition 4.1, are not a field, and find two non-zero pairs whose product is zero.

**T5.3** Prove that for a real polynomial $m$ of degree 3, $\mathbb{R}[x]/(m)$ has zero divisors, and relate this to Theorem 5.7.

**T5.4** From $i^2=j^2=k^2=ijk=-1$ alone (with associativity), derive $jk=i$, $ki=j$ and $ji=-k$.

**T5.5** Write out $|pq|^2=|p|^2|q|^2$ for $p=a_1+b_1i+c_1j+d_1k$ and $q=a_2+b_2i+c_2j+d_2k$ to obtain Euler's four-square identity, and check it for $p=1+i+j+k$, $q=1+2i+3j+4k$.

**T5.6** Show that $\mathbb{H}$ contains infinitely many square roots of $-1$: every $q=bi+cj+dk$ with $b^2+c^2+d^2=1$. Why does this not contradict Theorem 5.5(f)?

### Answers: Tier 5

**T5.1** $(1,1)^2=(1-1,\ 1+1)=(0,0)$ in $\mathbb{F}_2$. A field has no non-zero $z$ with $z^2=0$ (Theorem 5.5(b)).

**T5.2** $i^2=-1$ in $K$, so by Theorem 5.4: $(i,1)(i,-1)=(i^2+1,\ -i+i)=(0,0)$.

**T5.3** A real cubic $m$ has a real root $r$, so $m=(x-r)h$ with $\deg h=2$. In the quotient, $[x-r]\,[h]=[m]=0$, while neither factor is $0$ (each has degree below 3, so $m$ does not divide it). *Relation:* the quotient is a 3-dimensional real algebra; Theorem 5.7 says it can never be a field, and the real root $r$ is exactly the real eigenvalue $\lambda_0$ of multiplication by $x$.

**T5.4** Multiply $ijk=-1$ on the left by $i$: $i^2jk=-i$, so $-jk=-i$ and $jk=i$. Then, using $i=jk$ and $k=ij$:
$$
\begin{aligned}ji&=j(jk)=j^2k=-k,\\kj&=(ij)j=ij^2=-i,\\ik&=i(ij)=i^2j=-j,\\ki&=k(jk)=(kj)k\\&=(-i)k=-ik=j.\end{aligned}
$$
*Key idea:* substitute $i=jk$ or $k=ij$ and use associativity; never swap two factors, since that is the law being tested.

**T5.5** $(a_1^2+b_1^2+c_1^2+d_1^2)(a_2^2+b_2^2+c_2^2+d_2^2)=A^2+B^2+C^2+D^2$ with
$$
\begin{aligned}A&=a_1a_2-b_1b_2-c_1c_2-d_1d_2,\\B&=a_1b_2+b_1a_2+c_1d_2-d_1c_2,\\C&=a_1c_2-b_1d_2+c_1a_2+d_1b_2,\\D&=a_1d_2+b_1c_2-c_1b_2+d_1a_2.\end{aligned}
$$
For the given $p,q$: $(1+1+1+1)(1+4+9+16)=4\cdot30=120$, and $A=1-2-3-4=-8$, $B=2+1+4-3=4$, $C=3-4+1+2=2$, $D=4+3-2+1=6$: $64+16+4+36=120$.

**T5.6** $(bi+cj+dk)^2=-(b^2+c^2+d^2)+bc(ij+ji)+bd(ik+ki)+cd(jk+kj)=-1$, since each bracket is $0$. Theorem 5.5(f) needs commutativity: the step $x^2-y^2=(x-y)(x+y)$ uses $xy=yx$, which fails in $\mathbb{H}$.

### Tier 6 · Graduate and PhD qualifying

**T6.1** Let $D$ be a finite-dimensional real algebra with identity, associative, without zero divisors. Prove that $D$ is a division ring: every non-zero $x$ has a two-sided inverse.

**T6.2** Let $D$ be as in T6.1 and $x\in D$ not real. Prove that the subalgebra $\mathbb{R}[x]$ spanned by the powers of $x$ is a field isomorphic to $\mathbb{C}$. (You may use Theorem 5.9.)

**T6.3** Prove that a finite field $F$ with $q$ elements, $q$ odd, contains a square root of $-1$ if and only if $q\equiv1\pmod4$. (You may use that the non-zero elements of a finite field form a cyclic group under multiplication.)

**T6.4** Prove that the only field automorphism of $\mathbb{R}$ is the identity.

**T6.5** Show that $i\mapsto-iX$, $j\mapsto-iY$, $k\mapsto-iZ$, with $X,Y,Z$ the Pauli matrices, satisfies Hamilton's rule, and that the unit quaternion $\cos\tfrac\theta2+\sin\tfrac\theta2\,(n_1i+n_2j+n_3k)$, with $n_1^2+n_2^2+n_3^2=1$, maps to the rotation gate $R_{\vec n}(\theta)=\cos\tfrac\theta2\,I-i\sin\tfrac\theta2\,(n_1X+n_2Y+n_3Z)$.

### Answers: Tier 6

**T6.1** For $x\ne0$, the map $L(v)=xv$ is linear and one-to-one (if $xv=0$ then $v=0$, since there are no zero divisors). A one-to-one linear map of a finite-dimensional space to itself is onto, so $xy=1$ for some $y$. Likewise $R(v)=vx$ gives $y'x=1$. Then $y'=y'(xy)=(y'x)y=y$. *Key idea:* finite dimension turns "one-to-one" into "onto".

**T6.2** $\mathbb{R}[x]$ is commutative (powers of $x$ commute), associative, has no zero divisors and has finite dimension, so by the argument of T6.1 it is a field. It contains $\mathbb{R}$ and has finite dimension, and it is not $\mathbb{R}$ because $x\notin\mathbb{R}$. By Theorem 5.9 it is a copy of $\mathbb{C}$. This is the first step of the standard proof of Frobenius' theorem: every element of $D$ lies in a copy of $\mathbb{R}$ or $\mathbb{C}$.

**T6.3** The group $F^\times$ is cyclic of order $q-1$, with generator $g$. The element $-1$ is the unique element of order 2, namely $g^{(q-1)/2}$. A square root of $-1$ is an element of order 4, and a cyclic group of order $q-1$ has one exactly when $4\mid q-1$. So: exactly when $q\equiv1\pmod 4$. For $q=p$ prime this is Theorem 4.8 again. For $q=49$, $49\equiv1\pmod4$, so the field of T4.5 contains a square root of $-1$, namely $(0,1)$.

**T6.4** Let $\sigma$ be an automorphism. It fixes $1$, hence every integer and every rational. It sends squares to squares, and the non-negative reals are exactly the squares, so $x\ge0$ implies $\sigma(x)\ge0$, and therefore $x\le y$ implies $\sigma(x)\le\sigma(y)$. If $\sigma(x)\ne x$ for some $x$, pick a rational $r$ strictly between them; say $x<r<\sigma(x)$. Then $\sigma(x)\le\sigma(r)=r$, a contradiction; the other order is the same. So $\sigma$ is the identity. *Contrast:* $\mathbb{C}$ has exactly two automorphisms fixing $\mathbb{R}$ (Theorem 5.6), but, using the axiom of choice, infinitely many that do not fix $\mathbb{R}$.

**T6.5** $(-iX)^2=-X^2=-I$, and the same for $Y,Z$. Using $XY=iZ$: $(-iX)(-iY)(-iZ)=(-i)^3XYZ=i\cdot iZ\cdot Z=-I$. So the map respects Hamilton's rule, and by linearity $\cos\tfrac\theta2+\sin\tfrac\theta2\,(n_1i+n_2j+n_3k)\mapsto\cos\tfrac\theta2\,I-i\sin\tfrac\theta2\,(\vec n\cdot\vec\sigma)$, which is $R_{\vec n}(\theta)=e^{-i\theta\,\vec n\cdot\vec\sigma/2}$. These are exactly the matrices used in the proof of Theorem 5.10.

## 5.14 · Mastery check

1. State (F8) and the formula for the inverse of $(a,b)$.
2. Compute $(1,-2)^{-1}$.
3. Which single fact about real numbers does Theorem 5.3 use beyond the field laws?
4. Do pairs over $\mathbb{F}_{11}$ form a field? Over $\mathbb{F}_{13}$?
5. Find all complex $z$ with $z^2=9$.
6. Why does every real $3\times3$ matrix have a real eigenvalue?
7. Compute $ji$ and $(i+j)^2$ in $\mathbb{H}$.
8. Name the four normed division algebras and their dimensions.

### Answers: Mastery check

1. Every non-zero $x$ has $x^{-1}$ with $xx^{-1}=1$; $(a,b)^{-1}=\left(\tfrac a{a^2+b^2},\tfrac{-b}{a^2+b^2}\right)$.
2. $\left(\tfrac15,\tfrac25\right)$; check: $\left(\tfrac{1+4}5,\ \tfrac{2-2}5\right)=(1,0)$.
3. $a^2+b^2=0$ only when $a=b=0$.
4. $\mathbb{F}_{11}$: yes, $11\equiv3\pmod4$. $\mathbb{F}_{13}$: no, $5^2=25\equiv-1$, and $(5,1)(5,-1)=(0,0)$.
5. $z=\pm3$ (Theorem 5.5(f)).
6. Its characteristic polynomial is a real cubic, which has a real root.
7. $ji=-k$; $(i+j)^2=i^2+ij+ji+j^2=-2$.
8. $\mathbb{R}$, $\mathbb{C}$, $\mathbb{H}$, $\mathbb{O}$: dimensions 1, 2, 4, 8.

## 5.15 · Where this leads

Chapter 6 studies conjugation, the second isomorphism of Theorem 5.6, and proves its rules. Chapter 7 turns Theorem 5.3 into a method for dividing in the form $a+bi$. Chapter 8 proves that, unlike $\mathbb{R}$, the field $\mathbb{C}$ cannot be ordered: the price of $i$. Chapter 18 states the Fundamental Theorem of Algebra used in Theorem 5.9, and Chapter 70 returns to $SU(2)$ and qubit rotations.

---

## References

- **[H1]** W. R. Hamilton, "Theory of Conjugate Functions, or Algebraic Couples; with a Preliminary and Elementary Essay on Algebra as the Science of Pure Time", *Transactions of the Royal Irish Academy* 17 (1837), 293–422. [Read the edition](https://www.maths.tcd.ie/pub/HistMath/People/Hamilton/PureTime/).
- **[H2]** W. R. Hamilton, letter to John T. Graves on quaternions, dated 17 October 1843, which describes his attempts to multiply triplets. Edition by D. R. Wilkins. [Read the letter](https://emis.univie.ac.at/classics/Hamilton/QLetter.pdf).
- **[H3]** D. R. Wilkins, "Hamilton's Research on Quaternions", Trinity College Dublin: the discovery on 16 October 1843 and the formula carved on Broome Bridge. [Read the page](https://www.maths.tcd.ie/pub/HistMath/People/Hamilton/Quaternions.html).
- **[F1]** F. G. Frobenius, "Über lineare Substitutionen und bilineare Formen", *Journal für die reine und angewandte Mathematik* 84 (1878), 1–63.
- **[H4]** A. Hurwitz, "Ueber die Composition der quadratischen Formen von beliebig vielen Variablen", *Nachrichten von der Gesellschaft der Wissenschaften zu Göttingen* (1898), 309–316. [EuDML record](https://eudml.org/doc/58420).
- **[H5]** H. Hopf, "Ein topologischer Beitrag zur reellen Algebra", *Commentarii Mathematici Helvetici* 13 (1940), 219–239.
- **[B1]** R. Bott and J. Milnor, "On the parallelizability of the spheres", *Bulletin of the American Mathematical Society* 64 (1958), 87–89. [AMS](https://www.ams.org/journals/bull/1958-64-03/S0002-9904-1958-10166-4).
- **[K1]** M. Kervaire, "Non-parallelizability of the n-sphere for n > 7", *Proceedings of the National Academy of Sciences* 44 (1958), 280–283.

The theorems in this chapter are standard. The worked examples and problems were written for this chapter; none is quoted from a past examination paper.
