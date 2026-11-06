"""Independent checks of every calculation in KQV-MATH-D06-C002 (Meeting i: Arithmetic with a + bi).
Run: python3 content/mathematics/chapters/KQV-MATH-D06-C002/tests/check_c002.py"""
import sympy as sp
from sympy import I, sqrt, Rational as Q, binomial as C, Matrix, eye
import math, itertools

results = []
def check(name, ok): results.append((name, bool(ok)))
E = lambda e: sp.expand(e)
a, b, c, d, x, y, t = sp.symbols('a b c d x y t', real=True)
w = (-1 + I*sqrt(3))/2
S = lambda e: sp.nsimplify(sp.simplify(sp.expand(e)))

# prerequisites
check('prereq (x+y)^3', E((x + y)**3) == x**3 + 3*x**2*y + 3*x*y**2 + y**3)
check('prereq (1+t)^4', E((1 + t)**4) == 1 + 4*t + 6*t**2 + 4*t**3 + t**4)
check('prereq 2026 mod 4 = 2', 2026 % 4 == 2 and 2026 == 4*506 + 2)

# 2.3 / 2.4
check('2.3 example (3+5i)+(2-7i)-(4-i) = 1-i', E((3 + 5*I) + (2 - 7*I) - (4 - I)) == 1 - I)
check('2.4 product formula', E((a + b*I)*(c + d*I)) == E((a*c - b*d) + (a*d + b*c)*I))
check('2.4 (3+2i)(1-4i) = 11-10i', E((3 + 2*I)*(1 - 4*I)) == 11 - 10*I)
check('2.4 (2+i)^2 = 3+4i, (1+i)^2 = 2i', E((2 + I)**2) == 3 + 4*I and E((1 + I)**2) == 2*I)
check('2.4 (a+bi)(a-bi) = a^2+b^2', E((a + b*I)*(a - b*I)) == a**2 + b**2)
check('2.4 square and cube formulas', E((a + b*I)**2) == E(a**2 - b**2 + 2*a*b*I) and E((a + b*I)**3) == E(a**3 - 3*a*b**2 + (3*a**2*b - b**3)*I))
check('2.4 (2+i)^3 = 2+11i', E((2 + I)**3) == 2 + 11*I)
check('2.4 i(a+bi) = -b+ai', E(I*(a + b*I)) == -b + a*I)
check('2.4/fig rotation: 3+i, -1+3i, -3-i, 1-3i', [E(I**k*(3 + I)) for k in range(4)] == [3 + I, -1 + 3*I, -3 - I, 1 - 3*I])

# 2.5
check('2.5 period 4 table', [I**n for n in range(8)] == [1, I, -1, -I, 1, I, -1, -I])
check('2.5 i^2027 = -i', I**2027 == -I and 2027 == 4*506 + 3)
check('2.5 i^-1 = -i and i^-3 = i', sp.simplify(I**-1) == -I and sp.simplify(I**-3) == I and E(I*(-I)) == 1)
check('2.5 S_n table by n mod 4', all(sum(I**k for k in range(n + 1)) == [1, 1 + I, I, 0][n % 4] for n in range(40)))
check('2.5 product i*i^2*...*i^n = i^(n(n+1)/2)', all(sp.prod([I**k for k in range(1, n + 1)]) == I**(n*(n + 1)//2) for n in range(1, 20)))

# 2.6
check('2.6 (1+i)^4 = -4, (1+i)^8 = 16', E((1 + I)**4) == -4 and E((1 + I)**8) == 16)
check('2.6 (1+i)^100 = -2^50', E((1 + I)**100) == -2**50)
check('2.6 (1+i)^r for r = 0..3', [E((1 + I)**r) for r in range(4)] == [1, 1 + I, 2*I, -2 + 2*I])
check('2.6 (1+i)^n = (-4)^m (1+i)^r', all(E((1 + I)**n) == E((-4)**(n//4)*(1 + I)**(n % 4)) for n in range(60)))
check('2.6 (1-i)^2 = -2i, (1-i)^4 = -4', E((1 - I)**2) == -2*I and E((1 - I)**4) == -4)
check('2.6 alternating binomial sums are Re and Im of (1+i)^n',
      all(sum((-1)**j*C(n, 2*j) for j in range(n//2 + 1)) == sp.re(E((1 + I)**n)) and
          sum((-1)**j*C(n, 2*j + 1) for j in range((n - 1)//2 + 1)) == sp.im(E((1 + I)**n)) for n in range(1, 40)))
check('2.6 n = 10: (1+i)^10 = 32i, sums 0 and 32', E((1 + I)**10) == 32*I and 1 - 45 + 210 - 210 + 45 - 1 == 0 and 10 - 120 + 252 - 120 + 10 == 32)
check('2.6 filter identity 1+(-1)^k+i^k+(-i)^k', all(E(1 + (-1)**k + I**k + (-I)**k) == (4 if k % 4 == 0 else 0) for k in range(40)))
check('2.6 sum over 4|k of C(n,k) = (2^n + 2 Re(1+i)^n)/4 (n = 1..60)',
      all(sum(C(n, k) for k in range(0, n + 1, 4)) == (2**n + 2*sp.re(E((1 + I)**n)))/4 for n in range(1, 61)))
check('2.6 n = 8 gives 72 = 1 + 70 + 1', (256 + 16 + 16)//4 == 72 == C(8, 0) + C(8, 4) + C(8, 8))

# 2.7
check('2.7 omega^2 = (-1 - i sqrt3)/2', S(w**2 - (-1 - I*sqrt(3))/2) == 0)
check('2.7 omega^3 = 1, 1+omega+omega^2 = 0', S(w**3) == 1 and S(1 + w + w**2) == 0)
check('2.7 x^3 - 1 = (x-1)(x^2+x+1)', E((x - 1)*(x**2 + x + 1)) == x**3 - 1)
check('2.7 factorisations with omega',
      S((a - b*w)*(a - b*w**2) - (a**2 + a*b + b**2)) == 0 and S((a + b*w)*(a + b*w**2) - (a**2 - a*b + b**2)) == 0 and
      S((a - b)*(a - b*w)*(a - b*w**2) - (a**3 - b**3)) == 0 and S((a + b)*(a + b*w)*(a + b*w**2) - (a**3 + b**3)) == 0)
check('2.7 filter 1 + w^k + w^2k', all(S(1 + w**k + w**(2*k)) == (3 if k % 3 == 0 else 0) for k in range(18)))
check('2.7 sum over 3|k of C(n,k) formula (n = 0..40)',
      all(sum(C(n, k) for k in range(0, n + 1, 3)) == Q(2**n + (-1)**n*(2 if n % 3 == 0 else -1), 3) for n in range(0, 41)))
check('2.7 n = 6 gives 22', (64 + 2)//3 == 22 == 1 + 20 + 1)

# 2.8
check('Thm 2.2 two-square identity', E((a*c - b*d)**2 + (a*d + b*c)**2 - (a**2 + b**2)*(c**2 + d**2)) == 0)
check('2.8 65 examples', E((1 + 2*I)*(2 + 3*I)) == -4 + 7*I and E((1 + 2*I)*(2 - 3*I)) == 8 + I and 16 + 49 == 65 == 64 + 1)
check('Prop 2.3 units: a^2+b^2 = 1 solutions', sorted((p, q) for p in range(-3, 4) for q in range(-3, 4) if p*p + q*q == 1) == [(-1, 0), (0, -1), (0, 1), (1, 0)])
check('2.8 2 = (1+i)(1-i) = -i(1+i)^2; 5 = (2+i)(2-i)', E((1 + I)*(1 - I)) == 2 and E(-I*(1 + I)**2) == 2 and E((2 + I)*(2 - I)) == 5)
check('2.8 3 and 7 are not sums of two squares', all(p*p + q*q not in (3, 7) for p in range(4) for q in range(4)))
def gdiv(al, be):  # Euclidean division as in Theorem 2.4
    n = int(E(be*sp.conjugate(be)))
    xy = E(al*sp.conjugate(be)); X, Y = int(sp.re(xy)), int(sp.im(xy))
    p = math.floor(X/n + Q(1, 2)); q = math.floor(Y/n + Q(1, 2))
    k = p + q*I; r = E(al - k*be)
    return k, r, int(E(r*sp.conjugate(r))), n
ok = True
import random
rng = random.Random(3)
for _ in range(400):
    al = rng.randint(-60, 60) + rng.randint(-60, 60)*I; be = rng.randint(-15, 15) + rng.randint(-15, 15)*I
    if be == 0: continue
    k, r, nr, n = gdiv(al, be)
    ok &= E(k*be + r) == E(al) and 2*nr <= n
check('Thm 2.4 division with N(rho) <= N(beta)/2 (400 random cases)', ok)
k, r, nr, n = gdiv(7 + 5*I, 2 + I)
check('2.8 example 7+5i = (4+i)(2+i) - i', E((7 + 5*I)*(2 - I)) == 19 + 3*I and k == 4 + I and r == -I)
check('Lemma 2.6 Wilson for primes < 200', all(math.factorial(p - 1) % p == p - 1 for p in sp.primerange(2, 200)))
check('Thm 2.7 odd primes < 2000: sum of two squares iff p = 1 mod 4',
      all((any(int(math.isqrt(p - u*u))**2 == p - u*u for u in range(0, math.isqrt(p) + 1))) == (p % 4 == 1) for p in sp.primerange(3, 2000)))
check('Thm 2.7 ((p-1)/2)!^2 = -1 mod p for p = 1 mod 4 (< 500)', all((math.factorial((p - 1)//2)**2) % p == p - 1 for p in sp.primerange(5, 500) if p % 4 == 1))
check('2.8 p = 13: 6! = 5 mod 13, 5^2 = -1', math.factorial(6) % 13 == 5 and 25 % 13 == 12)

# 2.9 matrices and Pauli
M = lambda p, q: Matrix([[p, -q], [q, p]])
check('2.9 M sum and product rules', M(a, b) + M(c, d) == M(a + c, b + d) and (M(a, b)*M(c, d)).expand() == M(a*c - b*d, a*d + b*c).expand())
check('2.9 commutative, J^2 = -I, det = a^2+b^2', (M(a, b)*M(c, d) - M(c, d)*M(a, b)).expand() == sp.zeros(2) and M(0, 1)**2 == -eye(2) and M(a, b).det() == a**2 + b**2)
X = Matrix([[0, 1], [1, 0]]); Y = Matrix([[0, -I], [I, 0]]); Z = Matrix([[1, 0], [0, -1]])
check('2.9 XY = iZ, YZ = iX, ZX = iY, YX = -iZ, XYZ = iI', X*Y == I*Z and Y*Z == I*X and Z*X == I*Y and Y*X == -I*Z and X*Y*Z == I*eye(2))
check('2.9 XY entries as displayed', X*Y == Matrix([[I, 0], [0, -I]]))
check('2.9 multiplying by i keeps a^2+b^2', E((-b)**2 + a**2) == a**2 + b**2)

# Tier 1
check('T1.2 (4-3i)(2+5i) = 23+14i', E((4 - 3*I)*(2 + 5*I)) == 23 + 14*I)
check('T1.4 i^17, i^-3, i^2026', I**17 == I and sp.simplify(I**-3) == I and I**2026 == -1)
check('T1.5 169', E((5 + 12*I)*(5 - 12*I)) == 169)
check('T1.6 sum i^1..i^10 = -1+i', sum(I**k for k in range(1, 11)) == -1 + I)
check('T1.7 i(3-2i) = 2+3i', E(I*(3 - 2*I)) == 2 + 3*I)

# Tier 2
sol = sp.solve([2*x + 3*y - 4, -3*x + 2*y - 1], [x, y])
check('T2.1 x = 5/13, y = 14/13 and check', sol == {x: Q(5, 13), y: Q(14, 13)} and E((Q(5, 13) + I*Q(14, 13))*(2 - 3*I)) == 4 + I)
check('T2.2 least n with (1+i)^n positive real is 8', min(n for n in range(1, 50) if sp.im(E((1 + I)**n)) == 0 and sp.re(E((1 + I)**n)) > 0) == 8)
check('T2.3 sum_{0}^{100} i^k = 1', sum(I**k for k in range(101)) == 1)
check('T2.4 (1-w+w^2)(1+w-w^2) = 4 for both non-real roots', all(S((1 - v + v**2)*(1 + v - v**2)) == 4 for v in (w, w**2)))
check('T2.5 (1+w)^7 = 1 + w', S((1 + w)**7 - (1 + w)) == 0)
check('T2.6 (a+bi)^2 = -5+12i: (2,3), (-2,-3)', set(sp.solve([a**2 - b**2 + 5, 2*a*b - 12], [a, b])) == {(2, 3), (-2, -3)})
check('T2.7 (1+i)^2n + (1-i)^2n: zero for odd n; -8 for n=2', all(E((1 + I)**(2*n) + (1 - I)**(2*n)) == 0 for n in range(1, 30, 2)) and E((1 + I)**4 + (1 - I)**4) == -8)
check('T2.8 (2+3i)^3 = -46+9i', E((2 + 3*I)**3) == -46 + 9*I)

# Tier 3
check('T3.1 alternating sum for n = 20 is -1024', sum((-1)**j*C(20, 2*j) for j in range(11)) == -1024)
check('T3.2 = 256', C(10, 0) + C(10, 4) + C(10, 8) == 256)
check('T3.3 = 170', sum(C(9, k) for k in range(0, 10, 3)) == 170)
check('T3.4 (1+i)^n = (1-i)^n iff 4|n (n = -20..40)', all((E((1 + I)**n - (1 - I)**n) == 0) == (n % 4 == 0) for n in range(-20, 41)) and E(I*(1 - I)) == 1 + I)
check('T3.5 2500 pairs', sum(1 for m in range(1, 101) for n in range(1, 101) if I**m + I**n == 0) == 2500)
check('T3.6 sum k i^k to 100 = 50 - 50i', E(sum(k*I**k for k in range(1, 101))) == 50 - 50*I)
check('T3.7 least n = 3', min(n for n in range(1, 30) if S((1 + w**2)**n - (1 + w**4)**n) == 0) == 3)
check('T3.8 product and a^3+b^3+c^3-3abc', S((a + b*w + c*w**2)*(a + b*w**2 + c*w) - (a**2 + b**2 + c**2 - a*b - b*c - c*a)) == 0 and
      S((a + b + c)*(a + b*w + c*w**2)*(a + b*w**2 + c*w) - (a**3 + b**3 + c**3 - 3*a*b*c)) == 0)

# Tier 4
def powparts(z, n):
    zz = complex(1, 0); out = []
    for _ in range(n): zz = zz*z
    return zz
ok = True; A_, B_ = 1, 0
for n in range(1, 400):
    A_, B_ = 2*A_ - B_, A_ + 2*B_
    ok &= B_ != 0 and B_ % 5 in (1, 4)
check('T4.1 (2+i)^n never real; Im = 1 or 4 mod 5 (n < 400)', ok)
check('T4.1 mod-5 cycle (2,1) -> (3,4) -> (2,1)', ((2*2 - 1) % 5, (2 + 2*1) % 5) == (3, 4) and ((2*3 - 4) % 5, (3 + 2*4) % 5) == (2, 1))
prods = {s: E((2 + I)*(3 + s[0]*2*I)*(4 + s[1]*I)) for s in itertools.product((1, -1), repeat=2)}
check('T4.2 four products', prods[(1, 1)] == 9 + 32*I and prods[(1, -1)] == 23 + 24*I and prods[(-1, 1)] == 33 + 4*I and prods[(-1, -1)] == 31 - 12*I)
check('T4.2 1105 four ways', all(p*p + q*q == 1105 for p, q in [(32, 9), (24, 23), (33, 4), (31, 12)]) and 5*13*17 == 1105)
check('T4.3 Im (a+bi)^3 = b(3a^2-b^2)', sp.im(E((a + b*I)**3)) == E(b*(3*a**2 - b**2)))
check('T4.3 integer search: (a+bi)^3 real => b = 0 (|a|,|b| <= 40)', all(b_ == 0 for a_ in range(-40, 41) for b_ in range(-40, 41) if b_*(3*a_*a_ - b_*b_) == 0))
A2 = a*c - b*d; B2 = a*d + b*c + b*d
check('T4.4 (a^2+ab+b^2)(c^2+cd+d^2) = A^2+AB+B^2', E((a**2 + a*b + b**2)*(c**2 + c*d + d**2) - (A2**2 + A2*B2 + B2**2)) == 0)
check('T4.4 product with omega', S((a - b*w)*(c - d*w) - ((a*c - b*d) - (a*d + b*c + b*d)*w)) == 0)
check('T4.4 example 3*7 = 21 with A = 1, B = 4', (1*2 - 1*1, 1*1 + 1*2 + 1*1) == (1, 4) and 1 + 4 + 16 == 21)
check('T4.5 2n = a^2+b^2 => n = ((a+b)/2)^2+((a-b)/2)^2', E(((a + b)/2)**2 + ((a - b)/2)**2 - (a**2 + b**2)/2) == 0)
check('T4.6 p = 3 mod 4 divides a^2+b^2 only if it divides both (p < 60, a,b < 60)',
      all((a_*a_ + b_*b_) % p != 0 or (a_ % p == 0 and b_ % p == 0) for p in [3, 7, 11, 19, 23, 31, 43, 47, 59] for a_ in range(60) for b_ in range(60)))
check('T4.6 21 not a sum of two squares', all(p*p + q*q != 21 for p in range(5) for q in range(5)))
check('T4.7 x^2+x+1 | x^2n+x^n+1 iff 3 does not divide n (n = 1..30)', all((sp.rem(x**(2*n) + x**n + 1, x**2 + x + 1, x) == 0) == (n % 3 != 0) for n in range(1, 31)))

# Tier 5
check('T5.2 13 = (3+2i)(3-2i)', E((3 + 2*I)*(3 - 2*I)) == 13)
k1, r1, _, n1 = gdiv(11 + 7*I, 3 + 2*I)
check('T5.3 first step: (11+7i)(3-2i) = 47 - i, kappa 4, rho -1-i', E((11 + 7*I)*(3 - 2*I)) == 47 - I and k1 == 4 and r1 == -1 - I)
check('T5.3 second step: (3+2i)(-1+i) = -5+i; 3+2i + 2(-1-i) = 1', E((3 + 2*I)*(-1 + I)) == -5 + I and E(3 + 2*I + 2*(-1 - I)) == 1)
check('T5.3 norms 170 = 2*5*17, 13', 121 + 49 == 170 and sp.factorint(170) == {2: 1, 5: 1, 17: 1})
check('T5.4 12! = 13*36846276 + 12', math.factorial(12) == 479001600 == 13*36846276 + 12 and 720 == 13*55 + 5)
check('T5.5 13(5-i) = 65-13i; rho = 3-2i; (5+i)(3+2i) = 13+13i; (1+i)(3-2i) = 5+i',
      E(13*(5 - I)) == 65 - 13*I and E(13 - 2*(5 + I)) == 3 - 2*I and E((5 + I)*(3 + 2*I)) == 13 + 13*I and E((1 + I)*(3 - 2*I)) == 5 + I and 9 + 4 == 13)
sols = sorted((p, q) for p in range(-46, 47) for q in range(-46, 47) if p*p + q*q == 2026)
check('T5.6 integer solutions of x^2+y^2 = 2026 are (±1,±45), (±45,±1)', sols == sorted([(s1*1, s2*45) for s1 in (1, -1) for s2 in (1, -1)] + [(s1*45, s2*1) for s1 in (1, -1) for s2 in (1, -1)]))
check('T5.6 factorisation pieces', sp.isprime(1013) and 1013 % 4 == 1 and 22**2 + 23**2 == 1013 and E(-I*(1 + I)**2*(22 + 23*I)*(22 - 23*I)) == 2026
      and E((1 + I)*(22 + 23*I)) == -1 + 45*I and E((1 + I)*(22 - 23*I)) == 45 - I)
nn = a**2 + b**2
check('T5.7 inverse M(a/n, -b/n)', sp.simplify(M(a, b)*M(a/nn, -b/nn) - eye(2)) == sp.zeros(2))

# Mastery
check('M1 = 2+i', E((1 + 2*I)*(3 - I) - (2 + I)**2) == 2 + I)
check('M2 = 0', I**2027 + I**2026 + I**2025 + I**2024 == 0)
check('M3 (1-i)^12 = -64', E((1 - I)**12) == -64)
check('M4 = -64', sum((-1)**j*C(12, 2*j) for j in range(7)) == -64)
check('M5 = 1366', sum(C(12, k) for k in range(0, 13, 3)) == 1366 == 1 + 220 + 924 + 220 + 1)
check('M6 (3-i)^2 = 8-6i', set(sp.solve([a**2 - b**2 - 8, 2*a*b + 6], [a, b])) == {(3, -1), (-3, 1)} and E((3 - I)**2) == 8 - 6*I)
check('M7 85 = 7^2+6^2 = 9^2+2^2', E((2 + I)*(4 + I)) == 7 + 6*I and E((2 + I)*(4 - I)) == 9 + 2*I and 49 + 36 == 85 == 81 + 4)

for name, ok in results: print(f"{'PASS' if ok else 'FAIL'}  {name}")
fails = sum(not ok for _, ok in results)
print(f"\n{len(results) - fails} of {len(results)} checks passed")
raise SystemExit(1 if fails else 0)
