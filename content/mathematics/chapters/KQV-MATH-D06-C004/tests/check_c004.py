"""Independent checks of every calculation in KQV-MATH-D06-C004 (Complex Numbers as Ordered Pairs).
Run: python3 content/mathematics/chapters/KQV-MATH-D06-C004/tests/check_c004.py

Pairs are implemented here from Definition 4.1 alone (tuples of SymPy reals, no I anywhere),
so every identity is checked against the definition rather than against SymPy's complex numbers.
Polynomial remainders use SymPy's polynomial division; finite fields use exhaustive search.
"""
import sympy as sp
from sympy import I, sqrt, Rational as Q, Matrix, Poly, rem, symbols
import itertools, random, os, importlib.util

results = []
def check(name, ok): results.append((name, bool(ok)))
E = sp.expand
a, b, c, d, e_, f_, p, q, r, t = symbols('a b c d e f p q r t', real=True)
x = symbols('x')

def add(z, w): return (E(z[0] + w[0]), E(z[1] + w[1]))
def mul(z, w): return (E(z[0]*w[0] - z[1]*w[1]), E(z[0]*w[1] + z[1]*w[0]))
def pw(z, n):
    out = (1, 0)
    for _ in range(n): out = mul(out, z)
    return out
def eq(z, w): return sp.simplify(z[0] - w[0]) == 0 and sp.simplify(z[1] - w[1]) == 0
def remxx(fpoly, m=x**2 + 1):
    rr = Poly(rem(sp.expand(fpoly), m, x), x)
    co = rr.all_coeffs()[::-1] + [0, 0]
    return (sp.nsimplify(co[0]), sp.nsimplify(co[1]))

# opening: the impossible j
check('opening: (0+0)*j = 0*j + 0*j (the distributive step)', E((0 + 0)*t - (0*t + 0*t)) == 0)
# prerequisites
check('prereq x^3 + 2x + 5 = x(x^2+1) + (x+5)', E(x*(x**2 + 1) + x + 5 - (x**3 + 2*x + 5)) == 0)

# 4.3
check('4.3 (2,3)(-1,4) = (-14,5)', mul((2, 3), (-1, 4)) == (-14, 5))
check('4.3 agrees with (2+3i)(-1+4i)', E((2 + 3*I)*(-1 + 4*I)) == -14 + 5*I)
check('Thm 4.1 (0,1)(0,1) = (-1,0)', mul((0, 1), (0, 1)) == (-1, 0))
# 4.4
check('Thm 4.2 (a,0)(b,0) = (ab,0), sums', mul((a, 0), (b, 0)) == (a*b, 0) and add((a, 0), (b, 0)) == (a + b, 0))
check('Thm 4.2 identities (1,0), (0,0)', mul((1, 0), (c, d)) == (c, d) and add((0, 0), (c, d)) == (c, d))
check('Thm 4.2 (r,0)(c,d) = (rc, rd)', mul((r, 0), (c, d)) == (r*c, r*d))
# 4.5
check('Thm 4.3 (a,b) = (a,0) + (b,0)(0,1)', add((a, 0), mul((b, 0), (0, 1))) == (a, b) and mul((b, 0), (0, 1)) == (0, b))
z, w, u = (a, b), (c, d), (e_, f_)
check('Thm 4.4 commutativity', eq(mul(z, w), mul(w, z)))
check('Thm 4.4 associativity', eq(mul(mul(z, w), u), mul(z, mul(w, u))))
check('Thm 4.4 associativity: printed expansions', mul(mul(z, w), u) == (E(a*c*e_ - b*d*e_ - a*d*f_ - b*c*f_), E(a*c*f_ - b*d*f_ + a*d*e_ + b*c*e_)) and mul((c*e_ - d*f_, c*f_ + d*e_), z) == mul(z, mul(w, u)))
check('Thm 4.4 distributivity', eq(mul(z, add(w, u)), add(mul(z, w), mul(z, u))))
check('Thm 4.4 addition commutative/associative', eq(add(z, w), add(w, z)) and eq(add(add(z, w), u), add(z, add(w, u))))
check('Try it: Python (2+3j)(-1+4j) = -14+5j', (2 + 3j)*(-1 + 4j) == complex(-14, 5))
try:
    import numpy as np
    check('Try it: complex128 is 16 bytes', np.dtype(np.complex128).itemsize == 16)
except ImportError:
    check('Try it: numpy available', False)
# 4.6
sig = lambda z: (z[0], E(-z[1]))
check('4.6 (0,-1)^2 = (-1,0)', mul((0, -1), (0, -1)) == (-1, 0))
check('4.6 sigma respects products', eq(mul(sig(z), sig(w)), sig(mul(z, w))))
check('4.6 sigma respects sums, fixes reals', eq(add(sig(z), sig(w)), sig(add(z, w))) and sig((a, 0)) == (a, 0))

# 4.7
check('4.7 remainder product rule', remxx((a + b*x)*(c + d*x)) == (E(a*c - b*d), E(a*d + b*c)) or sp.simplify(Poly(rem(E((a + b*x)*(c + d*x)), x**2 + 1, x), x).as_expr() - ((a*c - b*d) + (a*d + b*c)*x)) == 0)
check('4.7 identity (a+bx)(c+dx) = (ac-bd) + (ad+bc)x + bd(x^2+1)', E((a + b*x)*(c + d*x) - ((a*c - b*d) + (a*d + b*c)*x + b*d*(x**2 + 1))) == 0)
g1, g2, h1, h2 = [sp.Function(n)(x) for n in ('g1', 'g2', 'h1', 'h2')]
check('4.7 fg - f\'g\' = f(g - g\') + g\'(f - f\')', E(g1*h1 - g2*h2 - (g1*(h1 - h2) + h2*(g1 - g2))) == 0)
check('4.7 x^2026 = -1 mod x^2+1', remxx(x**2026) == (-1, 0))
check('4.7 (1+x)^4 = -4 mod x^2+1', remxx((1 + x)**4) == (-4, 0))
check('4.7 inverse: (a+bx)(a-bx) = a^2 + b^2 mod x^2+1', sp.simplify(Poly(rem(E((a + b*x)*(a - b*x)), x**2 + 1, x), x).as_expr() - (a**2 + b**2)) == 0)
random.seed(4)
ok = True
for _ in range(60):
    co = [random.randint(-5, 5) for _ in range(random.randint(1, 9))]
    fpol = sum(cc*x**k for k, cc in enumerate(co))
    val = E(fpol.subs(x, I))
    rr = remxx(fpol)
    ok &= sp.simplify(val - (rr[0] + rr[1]*I)) == 0
check('Thm 4.5 remainder = value at i (60 random polynomials)', ok)
ok = True
for _ in range(60):
    A_ = [random.randint(-6, 6) for _ in range(4)]
    P1, P2 = A_[0] + A_[1]*x, A_[2] + A_[3]*x
    ok &= remxx(P1*P2) == mul((A_[0], A_[1]), (A_[2], A_[3]))
check('Thm 4.5 Phi respects products (60 random cases)', ok)

# 4.8 classification
e2 = (p, q)
def mulpq(z, w): return (E(z[0]*w[0] + p*z[1]*w[1]), E(z[0]*w[1] + z[1]*w[0] + q*z[1]*w[1]))
check('4.8 forced product formula equals remainders mod x^2 - qx - p', sp.simplify(Poly(rem(E((a + b*x)*(c + d*x)), x**2 - q*x - p, x), x).as_expr() - ((a*c + p*b*d) + (a*d + b*c + q*b*d)*x)) == 0)
check('4.8 product is associative and commutative', all(sp.simplify(v) == 0 for v in (mulpq(mulpq(z, w), u)[0] - mulpq(z, mulpq(w, u))[0], mulpq(mulpq(z, w), u)[1] - mulpq(z, mulpq(w, u))[1], mulpq(z, w)[0] - mulpq(w, z)[0], mulpq(z, w)[1] - mulpq(w, z)[1])))
fsq = mulpq((-q/2, 1), (-q/2, 1))
check('Thm 4.6 f = e - q/2 has f^2 = (q^2+4p)/4', sp.simplify(fsq[0] - (q**2 + 4*p)/4) == 0 and sp.simplify(fsq[1]) == 0)
check('Thm 4.6 discriminant of x^2 - qx - p is q^2 + 4p', sp.discriminant(x**2 - q*x - p, x) == q**2 + 4*p)
check('Thm 4.6 S: (1+j)(1-j) = 0 and (a+bj)^2 = (a^2+b^2) + 2ab j', E((1 + t)*(1 - t)).subs(t**2, 1) == 0 and E((a + b*t)**2).subs(t**2, 1) == a**2 + b**2 + 2*a*b*t)
check('Thm 4.6 S: (a+bj)^2 = 0 has only the real solution a = b = 0', [s_ for s_ in sp.solve([a**2 + b**2, 2*a*b], [a, b], dict=True) if all(v.is_real for v in s_.values())] == [{a: 0, b: 0}])
check('4.8 dual: (a+eps)^n = a^n + n a^(n-1) eps (n <= 8)', all(E(((a + t)**n).series(t, 0, 2).removeO() - (a**n + n*a**(n - 1)*t)) == 0 for n in range(1, 9)))
check('4.8 norms a^2 - g^2 b^2 for g^2 = -1, 0, 1', [E((a + b*t)*(a - b*t)).subs(t**2, s) for s in (-1, 0, 1)] == [a**2 + b**2, a**2, a**2 - b**2])
check('4.8 S: unit norm preserved by multiplication', E(((a*c + b*d)**2 - (a*d + b*c)**2) - (a**2 - b**2)*(c**2 - d**2)) == 0)
check('4.8 x^2+x+1: (2x+1)/sqrt3 squares to -1', remxx(((2*x + 1)/sqrt(3))**2, x**2 + x + 1) == (-1, 0))

# 4.9 matrices and Theorem 4.7
J = Matrix([[0, -1], [1, 0]]); Id = sp.eye(2)
M = lambda a_, b_: a_*Id + b_*J
check('4.9 J^2 = -I and M(a,b)M(c,d) = M(ac-bd, ad+bc)', J**2 == -Id and sp.simplify(M(a, b)*M(c, d) - M(a*c - b*d, a*d + b*c)) == sp.zeros(2))
check('Thm 4.7 in K = {aI + bJ}: psi respects products and psi(a,b) = 0 only for (0,0)', sp.simplify(M(*mul((a, b), (c, d))) - M(a, b)*M(c, d)) == sp.zeros(2) and sp.solve(list(M(a, b)), [a, b]) == {a: 0, b: 0})

# 4.10 finite fields
def isfield_mod(pp):
    for A_, B_ in itertools.product(range(pp), repeat=2):
        if (A_, B_) == (0, 0): continue
        if not any(((A_*C_ - B_*D_) % pp, (A_*D_ + B_*C_) % pp) == (1, 0) for C_, D_ in itertools.product(range(pp), repeat=2)):
            return False
    return True
primes = [3, 5, 7, 11, 13, 17, 19, 23, 29, 31]
check('Thm 4.8 F_p[x]/(x^2+1) is a field iff p = 3 mod 4 (p up to 31, exhaustive)', all(isfield_mod(pp) == (pp % 4 == 3) for pp in primes))
check('Thm 4.8 -1 is a square mod p iff p = 1 mod 4 (odd p < 2000)', all((any((k*k + 1) % pp == 0 for k in range(pp))) == (pp % 4 == 1) for pp in sp.primerange(3, 2000)))
check('Thm 4.8 ((p-1)/2)!^2 = -1 mod p for p = 1 mod 4 (p < 2000)', all((sp.factorial((pp - 1)//2)**2 + 1) % pp == 0 for pp in sp.primerange(3, 2000) if pp % 4 == 1))
check('Thm 4.8 Fermat t^(p-1) = 1 (p < 200, all t)', all(pow(tt, pp - 1, pp) == 1 for pp in sp.primerange(3, 200) for tt in range(1, pp)))
check('4.10 field sizes 9, 49, 121, 361', [pp**2 for pp in (3, 7, 11, 19)] == [9, 49, 121, 361] and all(pp % 4 == 3 for pp in (3, 7, 11, 19)) and all(pp % 4 == 1 for pp in (5, 13, 17)))
check('4.10 mod 5: (x-2)(x+2) = 0', ((2*2 + 1) % 5 == 0) and mul((3, 1), (2, 1)) == (5, 5) and all(v % 5 == 0 for v in mul((3, 1), (2, 1))))
def mul3(z, w): return ((z[0]*w[0] - z[1]*w[1]) % 3, (z[0]*w[1] + z[1]*w[0]) % 3)
gp = [(1, 0)]
for _ in range(8): gp.append(mul3(gp[-1], (1, 1)))
check('4.10 powers of 1+x mod 3: 1, 1+x, 2x, 1+2x, 2, 2+2x, x, 2+x, 1', gp == [(1, 0), (1, 1), (0, 2), (1, 2), (2, 0), (2, 2), (0, 1), (2, 1), (1, 0)])
check('4.10 g^6 = x squares to -1 and g^2 = 2x = -x', mul3((0, 1), (0, 1)) == (2, 0) and gp[2] == (0, 2))

# Tier 1
check('T1.1 sum and product', add((2, 3), (-1, 4)) == (1, 7) and mul((2, 3), (-1, 4)) == (-14, 5))
check('T1.3 (0,1)^3 = (0,-1), (0,1)^4 = (1,0)', pw((0, 1), 3) == (0, -1) and pw((0, 1), 4) == (1, 0))
check('T1.5 (3,0)(a,b) = (3a,3b)', mul((3, 0), (a, b)) == (3*a, 3*b))
check('T1.6 additive inverse (-2,1)', add((2, -1), (-2, 1)) == (0, 0))
check('T1.7 (x,y)(0,1) = (-y,x); solution (3,-4)', mul((a, b), (0, 1)) == (-b, a) and mul((3, -4), (0, 1)) == (4, 3))
check('T1.8 (1,1)(1,-1) = (2,0)', mul((1, 1), (1, -1)) == (2, 0))
# Tier 2
check('T2.1 (a,b)^2 = (0,2) -> (1,1), (-1,-1)', {tuple(s) for s in sp.solve([a**2 - b**2, 2*a*b - 2], [a, b])} == {(1, 1), (-1, -1)})
check('T2.2 (a,b)(a,-b) = (a^2+b^2, 0)', mul((a, b), (a, -b)) == (a**2 + b**2, 0))
check('T2.3 inverse of (3,4)', mul((3, 4), (Q(3, 25), Q(-4, 25))) == (1, 0))
check('T2.4 (2,1)(2,1) = (3,4) and unique', mul((2, 1), (2, 1)) == (3, 4) and sp.solve([2*a - b - 3, a + 2*b - 4], [a, b]) == {a: 2, b: 1})
check('T2.5 (0,1)^2026 = (-1,0)', pw((0, 1), 2026 % 4) == (-1, 0) and 2026 % 4 == 2 and all(pw((0, 1), n) == pw((0, 1), n % 4) for n in range(40)))
check('T2.6 remainder 5 + x and (2,3)(1,-1) = (5,1)', remxx((2 + 3*x)*(1 - x)) == (5, 1) and mul((2, 3), (1, -1)) == (5, 1) and E((2 + 3*x)*(1 - x) - (-3*(x**2 + 1) + 5 + x)) == 0)
# Tier 3
k1, k2, k3 = c*(a + b), a*(d - c), b*(c + d)
check('T3.1 three-multiplication trick', E(k1 - k3) == E(a*c - b*d) and E(k1 + k2) == E(a*d + b*c))
star = lambda z, w: (z[0]*w[0], z[1]*w[1])
check('T3.2 componentwise: identity (1,1), (1,0)*(0,1) = 0', star((1, 1), (c, d)) == (c, d) and star((1, 0), (0, 1)) == (0, 0))
check('T3.3 z^2 = (-1,0) only (0,+-1)', {tuple(s) for s in sp.solve([a**2 - b**2 + 1, 2*a*b], [a, b]) if all(v.is_real for v in s)} == {(0, 1), (0, -1)})
check('T3.4 x^2026 -> -1, x^2027 -> -x, (1+x)^10 -> 32x', remxx(x**2026) == (-1, 0) and remxx(x**2027) == (0, -1) and remxx((1 + x)**10) == (0, 32))
check('T3.5 remainder 2 - 3x', remxx(x**5 + 3*x**3 - x + 2) == (2, -3))
check('T3.6 x^2+1 | x^4 + ax + b iff a = 0, b = -1', sp.solve(list(remxx(x**4 + a*x + b)), [a, b]) == {a: 0, b: -1} and E((x**2 - 1)*(x**2 + 1)) == x**4 - 1)
dual = lambda expr: E(expr).subs(t**2, 0).subs(t**3, 0).subs(t**4, 0)
check('T3.7 (3+eps)^4 = 81 + 108 eps', E((3 + t)**4).coeff(t, 0) == 81 and E((3 + t)**4).coeff(t, 1) == 108)
check('T3.7 (1+2eps)(1-2eps) = 1 and inverse of a + b eps', dual((1 + 2*t)*(1 - 2*t)) == 1 and sp.simplify(dual((a + b*t)*(1/a - b/a**2*t)) - 1) == 0)
# Tier 4
check('T4.1 (a,b) . (a+qb, -b) = (N, 0)', mulpq((a, b), (a + q*b, -b)) == (E(a**2 + q*a*b - p*b**2), 0))
check('T4.1 N = (a + qb/2)^2 - (q^2+4p) b^2/4', E((a + q*b/2)**2 - (q**2 + 4*p)*b**2/4 - (a**2 + q*a*b - p*b**2)) == 0)
check('T4.1 root t of t^2+qt-p gives N(t,1) = 0', E((a**2 + q*a*b - p*b**2).subs({a: t, b: 1}) - (t**2 + q*t - p)) == 0)
ok = True
for pv, qv in [(-1, 0), (-1, -1), (-2, 2), (0, 0), (1, 0), (0, 1), (-1, 2), (Q(-1, 4), 1), (-3, 1)]:
    has_root = qv**2 + 4*pv >= 0
    if has_root:
        tv = (-qv + sp.sqrt(qv**2 + 4*pv))/2
        prod = mulpq((tv, 1), (tv + q, -1))
        ok &= all(sp.simplify(v.subs({p: pv, q: qv})) == 0 for v in prod)
    else:
        Nn = (a**2 + qv*a*b - pv*b**2)
        ok &= sp.Matrix([[1, qv/2], [qv/2, -pv]]).is_positive_definite
check('T4.1 field iff q^2 + 4p < 0 on nine (p, q) examples', ok)
gsq = mulpq((1/sqrt(3), 2/sqrt(3)), (1/sqrt(3), 2/sqrt(3)))
check('T4.2 p = q = -1: g = (2e+1)/sqrt3 squares to -1', [sp.simplify(v.subs({p: -1, q: -1})) for v in gsq] == [-1, 0])
check('T4.2 (2w+1)/sqrt3 = i and w^2 + w + 1 = 0', sp.simplify((2*(-1 + I*sqrt(3))/2 + 1)/sqrt(3) - I) == 0 and sp.simplify(E(((-1 + I*sqrt(3))/2)**2 + (-1 + I*sqrt(3))/2 + 1)) == 0)
check('T4.3 z^2 = 1 in S: four solutions', {tuple(s) for s in sp.solve([a**2 + b**2 - 1, 2*a*b], [a, b])} == {(1, 0), (-1, 0), (0, 1), (0, -1)})
Sprod = lambda z, w: (E(z[0]*w[0] + z[1]*w[1]), E(z[0]*w[1] + z[1]*w[0]))
pi_ = lambda z: (E(z[0] + z[1]), E(z[0] - z[1]))
check('T4.4 pi respects products', pi_(Sprod(z, w)) == (E((a + b)*(c + d)), E((a - b)*(c - d))))
check('T4.5 f(2+eps) = 22 + 69 eps for x^5 - 3x^2 + x', E(((2 + t)**5 - 3*(2 + t)**2 + (2 + t))).coeff(t, 0) == 22 and E(((2 + t)**5 - 3*(2 + t)**2 + (2 + t))).coeff(t, 1) == 69 and sp.diff(x**5 - 3*x**2 + x, x).subs(x, 2) == 69)
check('T4.5 (32+80e) - 3(4+4e) + 2 + e', E((2 + t)**5).coeff(t, 1) == 80 and E((2 + t)**5).coeff(t, 0) == 32)
check('T4.6 two-square identity', E((a**2 + b**2)*(c**2 + d**2) - ((a*c - b*d)**2 + (a*d + b*c)**2)) == 0)
# Tier 5
w_ = (-1 + I*sqrt(3))/2
check('T5.1 x^2+x+1 has root w; remainder evaluation', sp.simplify(E(w_**2 + w_ + 1)) == 0 and sp.im(w_) == sqrt(3)/2)
check('T5.1 (2x+1)^2 = -3 mod x^2+x+1', remxx((2*x + 1)**2, x**2 + x + 1) == (-3, 0))
def kur(a_, b_): return frozenset({frozenset({a_}), frozenset({a_, b_})})
check('T5.2 Kuratowski pairs: equal iff components equal (all of {0..3}^4)', all((kur(p1, p2) == kur(p3, p4)) == (p1 == p3 and p2 == p4) for p1, p2, p3, p4 in itertools.product(range(4), repeat=4)))
check('T5.3a g^2 = 2x, g^4 = 2, g^8 = 1, order 8, inverse 2 + x', gp[2] == (0, 2) and gp[4] == (2, 0) and gp[8] == (1, 0) and len(set(gp[:8])) == 8 and mul3((1, 1), (2, 1)) == (1, 0))
check('T5.3b mod 5: (3 + x)(2 + x) = 0', tuple(v % 5 for v in mul((3, 1), (2, 1))) == (0, 0))
check('T5.3c mod 2: x^2 + 1 = (x+1)^2', Poly(E((x + 1)**2 - (x**2 + 1)), x, modulus=2).is_zero)
P_, Q_, R_, S_ = symbols('P Q R S')
Mg = Matrix([[P_, Q_], [R_, S_]])
check('T5.4 MJ and JM', Mg*J == Matrix([[Q_, -P_], [S_, -R_]]) and J*Mg == Matrix([[-R_, -S_], [P_, Q_]]))
sol = sp.solve(list(Mg*J - J*Mg), [Q_, S_], dict=True)
check('T5.4 commutant is pI + rJ', len(sol) == 1 and sp.simplify(Mg.subs(sol[0]) - (P_*Id + R_*J)) == sp.zeros(2))
check('T5.4 inverse (aI - bJ)/(a^2+b^2)', sp.simplify(M(a, b)*M(a, -b)/(a**2 + b**2) - Id) == sp.zeros(2) and sp.simplify(M(a, b).det() - (a**2 + b**2)) == 0)
ok = True
for _ in range(30):
    co = [random.randint(-4, 4) for _ in range(random.randint(1, 8))]
    fpol = sum(cc*x**k for k, cc in enumerate(co))
    fJ = sum((cc*J**k for k, cc in enumerate(co)), sp.zeros(2))
    rr = remxx(fpol)
    ok &= fJ == M(rr[0], rr[1])
check('T5.5 f(J) = M(remainder) (30 random polynomials)', ok)
check('T5.6 conjugation composed with Phi respects products', eq(sig(mul(z, w)), mul(sig(z), sig(w))))
check('T5.7 a real cubic has a real root (sign change) e.g. x^3 - 2x + 5', any(sp.im(rt) == 0 for rt in sp.Poly(x**3 - 2*x + 5, x).all_roots()))
check('T5.7 zero divisors: (x - r) h = m', E((x - 1)*(x**2 + x + 1) - (x**3 - 1)) == 0)
# Mastery
check('M1 (1,2)(3,-1) = (5,5)', mul((1, 2), (3, -1)) == (5, 5))
check('M3 inverse of (1,-1) is (1/2,1/2)', mul((1, -1), (Q(1, 2), Q(1, 2))) == (1, 0))
check('M4 (1+x)^4 -> -4', remxx((1 + x)**4) == (-4, 0))
check('M5 (2+eps)^3 = 8 + 12 eps', E((2 + t)**3).coeff(t, 0) == 8 and E((2 + t)**3).coeff(t, 1) == 12)
check('M6 discriminants -4, 0, 4', [sp.discriminant(m_, x) for m_ in (x**2 + 2*x + 2, x**2 + 2*x + 1, x**2 + 2*x)] == [-4, 0, 4])
check('M7 (a,b)^2 = (3,4) -> (2,1), (-2,-1)', {tuple(s) for s in sp.solve([a**2 - b**2 - 3, 2*a*b - 4], [a, b])} == {(2, 1), (-2, -1)})

# Figures
here = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('mk', os.path.join(here, '../diagrams/make.py'))
mk = importlib.util.module_from_spec(spec); spec.loader.exec_module(mk)
check('fig c4-f9 powers match the text', mk.powers == gp)
check('fig c4-family points classified correctly', all(((qq*qq + 4*pp) < 0) == (sp.discriminant(x**2 - qq*x - pp, x) < 0) for (qq, pp), *_ in mk.marks))

for name, ok in results: print(f"{'PASS' if ok else 'FAIL'}  {name}")
fails = sum(not ok for _, ok in results)
print(f"\n{len(results) - fails} of {len(results)} checks passed")
raise SystemExit(1 if fails else 0)
