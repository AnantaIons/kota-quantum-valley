"""Independent checks of every calculation in KQV-MATH-D06-C005 (Checking the Field Laws).
Run: python3 content/mathematics/chapters/KQV-MATH-D06-C005/tests/check_c005.py

Pairs are implemented from Definition 4.1 alone (tuples, no I), over SymPy reals or over the integers modulo p.
Quaternions are checked in the 2x2 complex matrix model of Theorem 5.10 and, separately, by a
multiplication table built only from Hamilton's rule. Finite fields are checked by exhaustive search.
"""
import sympy as sp
from sympy import I, sqrt, Rational as Q, Matrix, symbols, eye, cos, sin
import itertools, random, os, importlib.util

random.seed(5)
results = []
def check(name, ok): results.append((name, bool(ok)))
E = sp.expand
a, b, c, d, e_, f_, p, q, k, th = symbols('a b c d e f p q k theta', real=True)
lam, x = symbols('lambda x')

def add(z, w): return (E(z[0] + w[0]), E(z[1] + w[1]))
def mul(z, w): return (E(z[0]*w[0] - z[1]*w[1]), E(z[0]*w[1] + z[1]*w[0]))
def same(z, w): return sp.simplify(z[0] - w[0]) == 0 and sp.simplify(z[1] - w[1]) == 0
def M(z): return Matrix([[z[0], -z[1]], [z[1], z[0]]])
def inv(z):
    n = sp.S(z[0])**2 + sp.S(z[1])**2
    return (sp.S(z[0]) / n, -sp.S(z[1]) / n)
def mulp(z, w, P): return ((z[0]*w[0] - z[1]*w[1]) % P, (z[0]*w[1] + z[1]*w[0]) % P)
def is_field_pairs(P):
    els = [(u, v) for u in range(P) for v in range(P)]
    return all(any(mulp(z, w, P) == (1, 0) for w in els) for z in els if z != (0, 0))
def neg1_square(P): return any((t*t + 1) % P == 0 for t in range(P))
primes = list(sp.primerange(2, 60))

z, w, u = (a, b), (c, d), (e_, f_)
# prerequisite
check('prereq (2,1)(3,-2) = (8,-1)', mul((2, 1), (3, -2)) == (8, -1))
# 5.2 the solved linear equation
check('5.2 x = a^-1 (c - b) solves a x + b = c', sp.simplify(a * ((c - b) / a) + b - c) == 0)
# Theorem 5.1
check('Thm 5.1 (F1) addition commutes', add(z, w) == add(w, z))
check('Thm 5.1 (F2) addition associative', add(add(z, w), u) == add(z, add(w, u)))
check('Thm 5.1 (F3),(F4) zero and negatives', add(z, (0, 0)) == z and add(z, (-a, -b)) == (0, 0))
# 5.4
check('5.4 (F7) (a,b)(1,0) = (a,b) = (1,0)(a,b)', mul(z, (1, 0)) == z and mul((1, 0), z) == z)
check('5.4 (F10) (0,0) != (1,0)', (0, 0) != (1, 0))
check('Thm 5.2 M(zw) = M(z)M(w)', sp.simplify(M(mul(z, w)) - M(z) * M(w)) == sp.zeros(2))
check('Thm 5.2 M(z+w) = M(z)+M(w), M(1,0) = I', M(add(z, w)) == M(z) + M(w) and M((1, 0)) == eye(2))
check('Thm 5.2 pair = first column of M', list(M(z)[:, 0]) == [a, b])
check('Cor. associativity by expansion', mul(mul(z, w), u) == mul(z, mul(w, u)))
check('Cor. associativity via matrices', sp.simplify(M(mul(mul(z, w), u)) - M(z) * M(w) * M(u)) == sp.zeros(2))
check('5.4 M(z) applied to (c,d) is zw', list(M(z) * Matrix([c, d])) == list(mul(z, w)))
# Theorem 5.3
check('Thm 5.3 z * z^-1 = (1,0)', same(mul(z, inv(z)), (1, 0)))
sol = sp.solve([a*c - b*d - 1, b*c + a*d], [c, d], dict=True)[0]
check('Thm 5.3 solving the linear system gives the formula', sp.simplify(sol[c] - a/(a**2 + b**2)) == 0 and sp.simplify(sol[d] + b/(a**2 + b**2)) == 0)
check('Thm 5.3 elimination: a*(eq1) + b*(eq2) = (a^2+b^2) c', E(a*(a*c - b*d) + b*(b*c + a*d)) == E((a**2 + b**2)*c))
check('Thm 5.3 elimination: -b*(eq1) + a*(eq2) = (a^2+b^2) d', E(-b*(a*c - b*d) + a*(b*c + a*d)) == E((a**2 + b**2)*d))
check('Thm 5.3 det M(z) = a^2 + b^2', M(z).det() == a**2 + b**2)
check('5.5 example (3,4)^-1 = (3/25,-4/25)', inv((3, 4)) == (Q(3, 25), Q(-4, 25)) and mul((3, 4), (Q(3, 25), Q(-4, 25))) == (1, 0))
check('5.5 example 1/(3+4i) = (3-4i)/25', sp.simplify(1/(3 + 4*I) - (3 - 4*I)/25) == 0)
# Theorem 5.4
check('Thm 5.4 pairs over F_p are a field iff -1 is not a square (all primes < 60)', all(is_field_pairs(P) == (not neg1_square(P)) for P in primes))
check('Thm 5.4 field iff p = 3 mod 4 (odd primes < 60)', all(is_field_pairs(P) == (P % 4 == 3) for P in primes if P > 2))
check('Thm 5.4 (c,1)(c,-1) = (c^2+1, 0) symbolically', mul((c, 1), (c, -1)) == (c**2 + 1, 0))
zd = all(mulp((t, 1), (t, -1), P) == (0, 0) for P in primes for t in range(P) if (t*t + 1) % P == 0)
check('Thm 5.4 zero divisors (c,1)(c,-1) = 0 whenever c^2 = -1 mod p', zd)
check('5.6 over C: (i,1)(i,-1) = (0,0)', mul((I, 1), (I, -1)) == (0, 0))
check('5.6 over F_2: -1 = 1 = 1^2', (-1) % 2 == 1)
check('5.6 Q: no rational square root of -1 (x^2+1 irreducible over Q)', sp.Poly(x**2 + 1, x).is_irreducible)
# Theorem 5.5
check('Thm 5.5 example: z^2 = -1 has exactly i, -i', set(sp.solve(x**2 + 1, x)) == {I, -I})
check('Thm 5.5 example: z^2 = z has exactly 0, 1', set(sp.solve(x**2 - x, x)) == {0, 1})
check('Thm 5.5(f) x^2 - y^2 = (x-y)(x+y)', E((a - b)*(a + b)) == a**2 - b**2)
check('5.7 split-complex z^2 = 1 has 4 roots (Chapter 4 contrast)', len([s for s in [(1, 0), (-1, 0), (0, 1), (0, -1)] if (s[0]**2 + s[1]**2, 2*s[0]*s[1]) == (1, 0)]) == 4)
# Theorem 5.6
ee = symbols('e')
check('Thm 5.6 (e - q/2)^2 = p + q^2/4 when e^2 = p + q e', E(E((ee - q/2)**2).subs(ee**2, p + q*ee) - (p + q**2/4)) == 0)
check('Thm 5.6 j = f/sqrt(-d) squares to -1', sp.simplify((sp.Symbol('f')**2 / (-sp.Symbol('d', negative=True))).subs(sp.Symbol('f')**2, sp.Symbol('d', negative=True)) + 1) == 0)
# Theorem 5.7
ok = True
for _ in range(300):
    A = sp.Matrix(3, 3, [random.randint(-9, 9) for _ in range(9)])
    ok &= any(abs(sp.im(r)) < 1e-12 for r in sp.Poly(A.charpoly(lam).as_expr(), lam).nroots())
check('Thm 5.7 300 random real 3x3 matrices each have a real eigenvalue', ok)
ok = True
for _ in range(60):
    A = sp.Matrix(5, 5, [random.randint(-5, 5) for _ in range(25)])
    ok &= any(abs(sp.im(r)) < 1e-9 for r in sp.Poly(A.charpoly(lam).as_expr(), lam).nroots())
check('Thm 5.7 60 random real 5x5 matrices each have a real eigenvalue', ok)
r3 = sp.root(2, 3)
check('T5.3 x^3 - 2 = (x - 2^(1/3))(x^2 + 2^(1/3) x + 2^(2/3))', sp.simplify(E((x - r3)*(x**2 + r3*x + r3**2)) - (x**3 - 2)) == 0)
Lx = Matrix([[0, 0, 2], [1, 0, 0], [0, 1, 0]])   # multiplication by x on R[x]/(x^3 - 2), basis 1, x, x^2
check('T5.3 multiplication by x on R[x]/(x^3-2) has char poly lambda^3 - 2', E(Lx.charpoly(lam).as_expr()) == lam**3 - 2)
# Quaternions: matrix model
Xp, Yp, Zp = Matrix([[0, 1], [1, 0]]), Matrix([[0, -I], [I, 0]]), Matrix([[1, 0], [0, -1]])
qi, qj, qk = Matrix([[0, -I], [-I, 0]]), Matrix([[0, -1], [1, 0]]), Matrix([[-I, 0], [0, I]])
check('5.10 matrices are -iX, -iY, -iZ', qi == -I*Xp and qj == -I*Yp and qk == -I*Zp)
check('5.10 i^2 = j^2 = k^2 = ijk = -I', all(m*m == -eye(2) for m in (qi, qj, qk)) and qi*qj*qk == -eye(2))
check('5.10 ij=k, ji=-k, jk=i, kj=-i, ki=j, ik=-j', qi*qj == qk and qj*qi == -qk and qj*qk == qi and qk*qj == -qi and qk*qi == qj and qi*qk == -qj)
def Qm(a_, b_, c_, d_): return a_*eye(2) + b_*qi + c_*qj + d_*qk
Qq = Qm(a, b, c, d)
al, be = a - d*I, c - b*I
check('Thm 5.10 Q(q) = [[alpha, -conj(beta)], [beta, conj(alpha)]]', sp.simplify(Qq - Matrix([[al, -sp.conjugate(be)], [be, sp.conjugate(al)]])) == sp.zeros(2))
check('Thm 5.10 det Q(q) = a^2+b^2+c^2+d^2', E(Qq.det()) == a**2 + b**2 + c**2 + d**2)
check('Thm 5.10 Q(q) Q(q)^dagger = |q|^2 I', sp.simplify(E(Qq * Qq.H) - (a**2 + b**2 + c**2 + d**2)*eye(2)) == sp.zeros(2))
check('Thm 5.10 Q(conj q) = Q(q)^dagger', sp.simplify(Qm(a, -b, -c, -d) - Qq.H) == sp.zeros(2))
# Quaternions from Hamilton's rule alone: a multiplication table on basis 1,i,j,k with signs
T = {('1', s): (1, s) for s in '1ijk'}; T.update({(s, '1'): (1, s) for s in '1ijk'})
T.update({('i', 'i'): (-1, '1'), ('j', 'j'): (-1, '1'), ('k', 'k'): (-1, '1'), ('i', 'j'): (1, 'k'), ('j', 'k'): (1, 'i'), ('k', 'i'): (1, 'j'),
          ('j', 'i'): (-1, 'k'), ('k', 'j'): (-1, 'i'), ('i', 'k'): (-1, 'j')})
def qmul(p_, q_):
    out = {s: 0 for s in '1ijk'}
    for s1, x1 in zip('1ijk', p_):
        for s2, x2 in zip('1ijk', q_):
            sg, s3 = T[(s1, s2)]; out[s3] += sg * x1 * x2
    return tuple(E(out[s]) for s in '1ijk')
P1, P2, P3 = (a, b, c, d), symbols('a2 b2 c2 d2', real=True), symbols('a3 b3 c3 d3', real=True)
check('5.10 table: ijk = -1 (from the derived products)', qmul(qmul((0, 1, 0, 0), (0, 0, 1, 0)), (0, 0, 0, 1)) == (-1, 0, 0, 0))
check('Thm 5.10 associativity from the table (symbolic)', qmul(qmul(P1, P2), P3) == qmul(P1, qmul(P2, P3)))
check('Thm 5.10 table agrees with matrix model', sp.simplify(Qm(*qmul(P1, P2)) - Qm(*P1) * Qm(*P2)) == sp.zeros(2))
nrm = lambda t: E(sum(v**2 for v in t))
check('Thm 5.10 |pq|^2 = |p|^2 |q|^2 (symbolic)', nrm(qmul(P1, P2)) == E(nrm(P1) * nrm(P2)))
check('Thm 5.10 q conj(q) = |q|^2', qmul(P1, (a, -b, -c, -d)) == (nrm(P1), 0, 0, 0))
check('5.10 not commutative: ij != ji', qmul((0, 1, 0, 0), (0, 0, 1, 0)) != qmul((0, 0, 1, 0), (0, 1, 0, 0)))
check('5.12 (pq)^-1 = q^-1 p^-1 (numeric)', (lambda p_, q_: all(sp.nsimplify(v) == sp.nsimplify(w_) for v, w_ in zip(
    qmul(qmul(p_, q_), qmul(tuple(sp.Rational(t, nrm(q_)) * s for t, s in zip((1, -1, -1, -1), q_)), tuple(sp.Rational(t, nrm(p_)) * s for t, s in zip((1, -1, -1, -1), p_)))), (1, 0, 0, 0))))((1, 2, 0, -1), (3, 0, 1, 1)))
# Problems
check('T1.1 (2,3)+(-1,4) = (1,7)', add((2, 3), (-1, 4)) == (1, 7))
check('T1.2 (3,-4)^-1 = (3/25, 4/25)', mul((3, -4), (Q(3, 25), Q(4, 25))) == (1, 0))
check('T1.2 wrong approach gives (0, -3/4 - 4/3)', mul((3, -4), (Q(1, 3), Q(-1, 4))) == (0, Q(-3, 4) - Q(4, 3)))
check('T1.4 z = (1/5, -7/5)', mul((1, 2), (Q(1, 5), Q(-7, 5))) == (3, -1) and inv((1, 2)) == (Q(1, 5), Q(-2, 5)))
check('T1.6 M(1,1)^2 = M(0,2)', M((1, 1))**2 == M((0, 2)))
check('T2.1 z^2 = 4z: 0 and 4', set(sp.solve(x**2 - 4*x, x)) == {0, 4})
check('T2.3 (z^-1)^-1 = z', same(inv(inv(z)), z))
check('T2.4 (2,-1)^-1 = (2/5, 1/5)', inv((2, -1)) == (Q(2, 5), Q(1, 5)))
check('T2.5 two-square identity', E((a**2 + b**2)*(c**2 + d**2)) == E((a*c - b*d)**2 + (a*d + b*c)**2))
check('T3.1 (cos t, sin t)^-1 = (cos t, -sin t)', same(mul((cos(th), sin(th)), (cos(th), -sin(th))), (1, 0)))
check('T3.2 (1,0)(.)(0,1) = (0,0) coordinate-wise', (1*0, 0*1) == (0, 0))
check('T3.3 65 = 4^2+7^2 = 1^2+8^2 from (1,2,2,3) and (1,2,3,2)', ((1*2 - 2*3)**2 + (1*3 + 2*2)**2, (1*3 - 2*2)**2 + (1*2 + 2*3)**2) == (65, 65))
mk_ = lambda z_, w_: (E(z_[0]*w_[0] + k*z_[1]*w_[1]), E(z_[0]*w_[1] + z_[1]*w_[0]))
check('T3.4 system determinant a^2 - k b^2', Matrix([[a, k*b], [b, a]]).det() == a**2 - k*b**2)
check('T3.4 (c,1)(c,-1) = (c^2 - k, 0)', mk_((c, 1), (c, -1)) == (c**2 - k, 0))
check('T3.4 (0,1)^2 = (k, 0)', mk_((0, 1), (0, 1)) == (k, 0))
check('T3.5 z^3 = z: -1, 0, 1', set(sp.solve(x**3 - x, x)) == {-1, 0, 1})
ok = all(all(A % P == 0 and B % P == 0 for A in range(P) for B in range(P) if (A*A + B*B) % P == 0) for P in (3, 7, 11, 19, 23, 31, 43))
check('T4.1 p = 3 mod 4 dividing a^2+b^2 divides a and b (exhaustive for 7 primes)', ok)
check('T4.2 1013 prime, 1013 = 22^2+23^2, 2026 = 1^2+45^2', sp.isprime(1013) and 22**2 + 23**2 == 1013 and 1 + 45**2 == 2026 and (22 - 23)**2 + (23 + 22)**2 == 2026)
check('T4.4 in F_2, x^2 = 1 has one solution', [t for t in range(2) if t*t % 2 == 1] == [1])
check('T4.5 squares mod 7 are 0,1,2,4', sorted({t*t % 7 for t in range(7)}) == [0, 1, 2, 4])
els7 = [(s, t) for s in range(7) for t in range(7)]
check('T4.5 pairs over F_7 form a field (exhaustive)', is_field_pairs(7) and len(els7) == 49)
check('T4.5 z^2 = 3 in the 49-element field: exactly (0,2), (0,5)', sorted(zz for zz in els7 if mulp(zz, zz, 7) == (3, 0)) == [(0, 2), (0, 5)])
check('T5.1 (1,1)^2 = (0,0) over F_2', mulp((1, 1), (1, 1), 2) == (0, 0))
check('T5.2 (i,1)(i,-1) = (0,0) over Q(i)', mul((I, 1), (I, -1)) == (0, 0))
check('T5.4 from the table: ji = -k, kj = -i, ik = -j, ki = j', qmul((0, 0, 1, 0), (0, 1, 0, 0)) == (0, 0, 0, -1) and qmul((0, 0, 0, 1), (0, 0, 1, 0)) == (0, -1, 0, 0)
      and qmul((0, 1, 0, 0), (0, 0, 0, 1)) == (0, 0, -1, 0) and qmul((0, 0, 0, 1), (0, 1, 0, 0)) == (0, 0, 1, 0))
A_, B_, C_, D_ = qmul(P1, P2)
a1, b1, c1, d1 = P1; a2, b2, c2, d2 = P2
check('T5.5 Euler four-square coordinates as printed', (A_, B_, C_, D_) == (E(a1*a2 - b1*b2 - c1*c2 - d1*d2), E(a1*b2 + b1*a2 + c1*d2 - d1*c2), E(a1*c2 - b1*d2 + c1*a2 + d1*b2), E(a1*d2 + b1*c2 - c1*b2 + d1*a2)))
check('T5.5 numeric: (1+i+j+k)(1+2i+3j+4k) -> (-8,4,2,6), 4*30 = 120', qmul((1, 1, 1, 1), (1, 2, 3, 4)) == (-8, 4, 2, 6) and 64 + 16 + 4 + 36 == 120 == 4 * 30)
sq = qmul((0, b, c, d), (0, b, c, d))
check('T5.6 (bi+cj+dk)^2 = -(b^2+c^2+d^2)', sq == (E(-(b**2 + c**2 + d**2)), 0, 0, 0))
ok = all(any(pow(t, 2, P) == P - 1 for t in range(1, P)) == (P % 4 == 1) for P in sp.primerange(3, 400))
check('T6.3 -1 is a square mod odd prime p iff p = 1 mod 4 (p < 400)', ok)
check('T6.3 in the field of T4.5, (0,1) has order 4', mulp((0, 1), (0, 1), 7) == (6, 0) and mulp(mulp((0, 1), (0, 1), 7), mulp((0, 1), (0, 1), 7), 7) == (1, 0))
check('T6.5 XY = iZ, YZ = iX, ZX = iY', Xp*Yp == I*Zp and Yp*Zp == I*Xp and Zp*Xp == I*Yp)
check('T6.5 (-i)^3 XYZ = -I', (-I)**3 * Xp*Yp*Zp == -eye(2))
n1, n2, n3 = Q(2, 3), Q(1, 3), Q(2, 3)
nsig = n1*Xp + n2*Yp + n3*Zp
check('T6.5 (n.sigma)^2 = I for a unit vector', nsig**2 == eye(2))
import mpmath
ok = True
for tv in (0.3, 1.0, 2.2, 3.7, 6.0):
    Rn = mpmath.expm(mpmath.matrix((-1j*tv/2*nsig).evalf().tolist()))
    Rf = (sp.cos(tv/2)*eye(2) - I*sp.sin(tv/2)*nsig).evalf()
    ok &= all(abs(complex(Rn[r_, c_]) - complex(Rf[r_, c_])) < 1e-12 for r_ in range(2) for c_ in range(2))
check('T6.5 exp(-i theta n.sigma/2) = cos(theta/2) I - i sin(theta/2) n.sigma (5 angles)', ok)
check('T6.5 unit quaternion maps to R_n(theta)', sp.simplify(Qm(cos(th/2), sin(th/2)*n1, sin(th/2)*n2, sin(th/2)*n3) - (cos(th/2)*eye(2) - I*sin(th/2)*nsig)) == sp.zeros(2))
check('5.10 q and -q give the same rotation (conjugation action)', sp.simplify((-Qq) * Zp * (-Qq).H - Qq * Zp * Qq.H) == sp.zeros(2))
# Mastery
check('M2 (1,-2)^-1 = (1/5, 2/5)', inv((1, -2)) == (Q(1, 5), Q(2, 5)) and mul((1, -2), (Q(1, 5), Q(2, 5))) == (1, 0))
check('M4 F_11 field, F_13 not; 5^2 = -1 mod 13, (5,1)(5,-1) = 0', is_field_pairs(11) and not is_field_pairs(13) and 25 % 13 == 12 and mulp((5, 1), (5, -1), 13) == (0, 0))
check('M5 z^2 = 9: -3, 3', set(sp.solve(x**2 - 9, x)) == {-3, 3})
check('M7 (i+j)^2 = -2', qmul((0, 1, 1, 0), (0, 1, 1, 0)) == (-2, 0, 0, 0))
# Figures
here = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('mk', os.path.join(here, '../diagrams/make.py'))
mk = importlib.util.module_from_spec(spec); spec.loader.exec_module(mk)
check('fig c5-square corners 0, 2+i, 1+3i, -1+2i', mk.image == [(0, 0), (2, 1), (1, 3), (-1, 2)])
check('fig c5-square side length sqrt 5', all(abs((mk.image[(t + 1) % 4][0] - mk.image[t][0])**2 + (mk.image[(t + 1) % 4][1] - mk.image[t][1])**2 - 5) < 1e-12 for t in range(4)))
check('fig c5-cubic chi = (lam-1)(lam^2+1), only real root 1', E((lam - 1)*(lam**2 + 1)) == E(mk.chi(lam)) and sp.real_roots(sp.Poly(mk.chi(lam), lam)) == [1])

for name, ok in results: print(f"{'PASS' if ok else 'FAIL'}  {name}")
fails = sum(not ok for _, ok in results)
print(f"\n{len(results) - fails} of {len(results)} checks passed")
raise SystemExit(1 if fails else 0)
