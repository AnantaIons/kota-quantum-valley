"""Independent checks of every calculation in KQV-MATH-D06-C003 (Real and Imaginary Parts, and Equality).
Run: python3 content/mathematics/chapters/KQV-MATH-D06-C003/tests/check_c003.py

Equations in z, conj(z) and |z| are solved here without the chapter's case analysis:
z = x + iy and r = |z| become real unknowns, the system Re F = 0, Im F = 0, r^2 = x^2 + y^2, r >= 0
is handed to SymPy, and the solution set is compared with the chapter's list.
"""
import sympy as sp
from sympy import I, sqrt, Rational as Q, Matrix
import math, cmath, random

results = []
def check(name, ok): results.append((name, bool(ok)))
E = lambda e: sp.expand(e)
x, y, r, u, v = sp.symbols('x y r u v', real=True)
a, b, c, d = sp.symbols('a b c d', real=True)
a1, a2, b1, b2, k = sp.symbols('a1 a2 b1 b2 k', real=True)
Z, ZB = x + I*y, x - I*y
w = (-1 + I*sqrt(3))/2

def parts(F):
    e = E(F)
    return sp.re(e), sp.im(e)

def solve_z(F, uses_r=False):
    """All complex z (as a set of SymPy numbers) with F(z) = 0; F is written in x, y (and r = |z|)."""
    re_, im_ = parts(F)
    eqs = [re_, im_] + ([r**2 - x**2 - y**2] if uses_r else [])
    unk = [x, y] + ([r] if uses_r else [])
    sols = sp.solve(eqs, unk, dict=True)
    out = set()
    for s in sols:
        if any(not s.get(q, q).is_real for q in unk if q in s):
            continue
        if uses_r and not (s[r] >= 0):
            continue
        if not all(q in s for q in unk):
            return None   # a free parameter: infinitely many solutions
        out.add(sp.nsimplify(sp.simplify(s[x] + I*s[y])))
    return out

def same(A, B):
    return A is not None and len(A) == len(B) and all(any(sp.simplify(p - q) == 0 for q in B) for p in A)

# prerequisites
check('prereq 2x+y=3, x+2y=2', sp.solve([2*x + y - 3, x + 2*y - 2], [x, y]) == {x: Q(4, 3), y: Q(1, 3)})
check('prereq sqrt(x^2+1) = 2-x gives 3/4', sp.solve(sp.sqrt(x**2 + 1) - (2 - x), x) == [Q(3, 4)])
check('prereq t^2 - t = 0', set(sp.solve(u**2 - u, u)) == {0, 1})

# 3.2 Theorem 3.1: (a-c) = (d-b)i forces both zero; parts of a + bi are a and b
check('3.1 re/im of a+bi', sp.re(a + b*I) == a and sp.im(a + b*I) == b)
check('3.1 squaring a - c = (d - b)i gives (a-c)^2 = -(d-b)^2', E(((d - b)*I)**2) == E(-(d - b)**2))
check('3.1 a+bi = c+di iff a = c and b = d (all integers in [-3, 3])', all((sp.Integer(p1) + p2*I == sp.Integer(p3) + p4*I) == (p1 == p3 and p2 == p4) for p1 in range(-3, 4) for p2 in range(-3, 4) for p3 in range(-3, 4) for p4 in range(-3, 4)))
check('3.1 i is not a real quotient: no real t with t^2 = -1', sp.solve(u**2 + 1, u) == [])

# 3.3 rules for Re and Im
zc, wc = a + b*I, c + d*I
check('3.3 Re(zw) = Re z Re w - Im z Im w', sp.re(E(zc*wc)) == a*c - b*d)
check('3.3 Im(zw) = Re z Im w + Im z Re w', sp.im(E(zc*wc)) == a*d + b*c)
check('3.3 Re(z^2) = a^2 - b^2, Im(z^2) = 2ab', sp.re(E(zc**2)) == a**2 - b**2 and sp.im(E(zc**2)) == 2*a*b)
check('3.3 Re(i^2) = -1 but (Re i)^2 = 0', sp.re(I**2) == -1 and sp.re(I)**2 == 0)
check('3.3 Re(iz) = -Im z, Im(iz) = Re z', E(I*zc) == -b + a*I)
check('3.3 Re z = (z + zbar)/2, Im z = (z - zbar)/(2i)', E((zc + (a - b*I))/2) == a and sp.simplify((zc - (a - b*I))/(2*I)) == b)
check('3.3 z zbar = a^2 + b^2', E(zc*(a - b*I)) == a**2 + b**2)
check('3.3 linearity over R', sp.re(E(k*zc + wc)) == k*a + c and sp.im(E(k*zc + wc)) == k*b + d)

# 3.4 Example 1 / T2.1
check('Ex1 2z + i zbar = 3+2i: parts', parts(2*Z + I*ZB) == (2*x + y, x + 2*y))
check('Ex1 unique solution 4/3 + i/3', same(solve_z(2*Z + I*ZB - (3 + 2*I)), {Q(4, 3) + I/3}))

# Theorem 3.2
A_, B_ = a1 + a2*I, b1 + b2*I
re_, im_ = parts(A_*Z + B_*ZB)
M2 = Matrix([[sp.diff(re_, x), sp.diff(re_, y)], [sp.diff(im_, x), sp.diff(im_, y)]])
check('Thm 3.2 real system coefficients', M2 == Matrix([[a1 + b1, b2 - a2], [a2 + b2, a1 - b1]]))
check('Thm 3.2 determinant = |a|^2 - |b|^2', E(M2.det()) == a1**2 + a2**2 - b1**2 - b2**2)
check('Thm 3.2 z + zbar = 1: infinitely many (line x = 1/2)', solve_z(Z + ZB - 1) is None and parts(Z + ZB - 1) == (2*x - 1, 0))
check('Thm 3.2 z - zbar = 1: none', solve_z(Z - ZB - 1) == set() and parts(Z - ZB - 1) == (-1, 2*y))
random.seed(3)
ok = True
for _ in range(200):
    av = complex(random.randint(-5, 5), random.randint(-5, 5)); bv = complex(random.randint(-5, 5), random.randint(-5, 5))
    cv = complex(random.randint(-5, 5), random.randint(-5, 5))
    if abs(abs(av) - abs(bv)) < 1e-12: continue
    det = abs(av)**2 - abs(bv)**2
    # explicit solution: z = (conj(a) c - b conj(c)) / (|a|^2 - |b|^2)
    zv = (av.conjugate()*cv - bv*cv.conjugate())/det
    ok &= abs(av*zv + bv*zv.conjugate() - cv) < 1e-9
check('Thm 3.2 unique solution exists when |a| != |b| (200 random cases)', ok)

# Example 2 / T2.2
check('Ex2 z + |z| = 2+i', same(solve_z(Z + r - (2 + I), True), {Q(3, 4) + I}))
# Example 3 / T3.1
check('Ex3 z^2 + |z| = 0 -> {0, i, -i}', same(solve_z(Z**2 + r, True), {0, I, -I}))
# Example 4 / T2.4
check('Ex4 z^2 = zbar parts', parts(Z**2 - ZB) == (x**2 - y**2 - x, 2*x*y + y))
check('Ex4 z^2 = zbar -> {0, 1, w, w^2}', same(solve_z(Z**2 - ZB), {0, 1, w, E(w**2)}))
check('Ex4 w^3 = 1 = w wbar', sp.simplify(E(w**3)) == 1 and sp.simplify(E(w*sp.conjugate(w))) == 1)
# Example 5 / T2.6
zz, ww = sp.symbols('zz ww')
s5 = sp.solve([zz + ww - (3 + I), zz - I*ww - (1 + 2*I)], [zz, ww])
check('Ex5 system', sp.simplify(s5[zz] - (Q(5, 2) + Q(5, 2)*I)) == 0 and sp.simplify(s5[ww] - (Q(1, 2) - Q(3, 2)*I)) == 0)
check('Ex5 (1+i)w = 2-i', sp.simplify((1 + I)*(Q(1, 2) - Q(3, 2)*I) - (2 - I)) == 0)

# 3.5 pictures
check('3.5 Re z = 1 and |z| = 2 -> 1 +- i sqrt3', set(sp.solve([x - 1, x**2 + y**2 - 4], [x, y])) == {(1, sqrt(3)), (1, -sqrt(3))})
roots = solve_z(Z**2 - (1 + 2*I))
phi = (1 + sqrt(5))/2
exact = sqrt(phi) + I/sqrt(phi)
check('3.5 z^2 = 1+2i has two roots +-(sqrt(phi) + i/sqrt(phi))', same(roots, {exact, -exact}))
check('3.5 x^4 - x^2 - 1 = 0 gives x^2 = (1+sqrt5)/2', sp.simplify(phi**2 - phi - 1) == 0)
check('3.5 numerical value 1.272 + 0.786i', abs(complex(sp.N(exact)) - complex(1.272, 0.786)) < 6e-4)
check('3.5/T3.6 z^2 + |z|^2 = 0: infinitely many', solve_z(Z**2 + Z*ZB) is None and E(Z**2 + Z*ZB) == E(2*x*Z))

# 3.6 Example 6 / T3.4
f6 = lambda z: 2*sp.conjugate(z) - z
zs = sp.Symbol('zs')
check('Ex6 elimination 3A = 6 zbar - 3z', E(2*(3*ZB) - 3*Z) == E(3*(2*ZB - Z)))
check('Ex6 f(z) = 2 zbar - z satisfies f(z) + 2 f(zbar) = 3z', E((2*ZB - Z) + 2*(2*Z - ZB)) == E(3*Z))

# 3.7 quantum bridge
al, be = sp.symbols('alpha beta')
X_ = Matrix([[0, 1], [1, 0]]); Y_ = Matrix([[0, -I], [I, 0]]); Zp = Matrix([[1, 0], [0, -1]])
psi = Matrix([al, be]); bra = psi.H
q = sp.conjugate(al)*be
check('3.7 <X> = 2 Re(conj(alpha) beta)', sp.simplify((bra*X_*psi)[0] - (q + sp.conjugate(q))) == 0)
check('3.7 <Y> = 2 Im(conj(alpha) beta)', sp.simplify((bra*Y_*psi)[0] - (q - sp.conjugate(q))/I) == 0)
check('3.7 <Z> = |alpha|^2 - |beta|^2', sp.simplify((bra*Zp*psi)[0] - (al*sp.conjugate(al) - be*sp.conjugate(be))) == 0)
yp = Matrix([1, I])/sqrt(2)
check('3.7 |y+>: <X> = 0, <Y> = 1', sp.simplify((yp.H*X_*yp)[0]) == 0 and sp.simplify((yp.H*Y_*yp)[0]) == 1 and sp.simplify(sp.conjugate(yp[0])*yp[1]) == I/2)
check('3.7 parameter count 4 - 1 - 1 = 2', 4 - 1 - 1 == 2)

# Tier 1
check('T1.1 (2-3i)(1+i) = 5 - i', E((2 - 3*I)*(1 + I)) == 5 - I)
check('T1.2 x = 4, y = 2', sp.solve([x + y - 6, x - y - 2], [x, y]) == {x: 4, y: 2})
check('T1.3 (k+2i)(1+i) real iff k = -2', E((k + 2*I)*(1 + I)) == E((k - 2) + (k + 2)*I) and sp.solve(k + 2, k) == [-2])
check('T1.4 z = 1+i: Re(z^2) = 0, (Re z)^2 = 1', E((1 + I)**2) == 2*I)
z15 = 3 - 4*I
check('T1.5 z = 3-4i', sp.conjugate(z15) == 3 + 4*I and z15 + sp.conjugate(z15) == 6 and E(z15 - sp.conjugate(z15)) == -8*I and E(z15*sp.conjugate(z15)) == 25 and sp.Abs(z15) == 5)
check('T1.6 2z + 3i = 5 - i -> 5/2 - 2i', same(solve_z(2*Z + 3*I - (5 - I)), {Q(5, 2) - 2*I}))
check('T1.7 point 2 - i', parts((2 - I) - (x + I*y)) == (2 - x, -1 - y))
check('T1.8 i^7(2+i) = 1 - 2i', E(I**7*(2 + I)) == 1 - 2*I and I**7 == -I)

# Tier 2
check('T2.3 x = 1, y = 2', sp.solve(list(parts((1 + I)*x + (1 - I)*y - (3 - I))), [x, y]) == {x: 1, y: 2})
uu, vv = parts((x + I*y)**3)
check('T2.5 u/x + v/y = 4(x^2 - y^2)', sp.simplify(uu/x + vv/y - 4*(x**2 - y**2)) == 0)
check('T2.7 Im(z^2) = 2xy', parts(Z**2)[1] == 2*x*y)
check('T2.8 (z-1)(zbar+1) = (|z|^2 - 1) + 2i Im z', E((Z - 1)*(ZB + 1)) == E((x**2 + y**2 - 1) + 2*I*y))

# Tier 3
check('T3.2 |z| - z = 1 + 2i -> 3/2 - 2i', same(solve_z(r - Z - (1 + 2*I), True), {Q(3, 2) - 2*I}))
check('T3.2 check |3/2 - 2i| = 5/2', sp.Abs(Q(3, 2) - 2*I) == Q(5, 2))
s33 = {}
for av in [2, Q(1, 2), -3, 0]:
    s33[av] = solve_z(av*Z + ZB - 1)
check('T3.3 az + zbar = 1 unique for a != +-1 (a = 2, 1/2, -3, 0)', all(s is not None and len(s) == 1 for s in s33.values()))
check('T3.3 a = 1 infinitely many, a = -1 none', solve_z(Z + ZB - 1) is None and solve_z(-Z + ZB - 1) == set())
check('T3.5 z^2 + 2 zbar = 0 -> {0, -2, 1 +- i sqrt3}', same(solve_z(Z**2 + 2*ZB), {0, -2, 1 + I*sqrt(3), 1 - I*sqrt(3)}))
check('T3.6 z(z + zbar) = 2xz', E(Z*(Z + ZB)) == E(2*x*Z))
check('T3.7 |z-1|^2 - |z+1|^2 = -4x', E(((x - 1)**2 + y**2) - ((x + 1)**2 + y**2)) == -4*x)
t = sp.Symbol('t')
check('T3.8 zw = 1 - 2i and (t-1)^2 = 2i', E(((2)**2 - (2 + 4*I))/2) == 1 - 2*I and E((t - 1)**2 - (t**2 - 2*t + 1 - 2*I)) == 2*I)
rt = sp.solve(t**2 - 2*t + 1 - 2*I, t)
check('T3.8 roots 2+i and -i', same(set(rt), {2 + I, -I}))
check('T3.8 check (2+i)^2 + (-i)^2 = 2 + 4i', E((2 + I)**2 + (-I)**2) == 2 + 4*I)
check('T3.8 (1+i)^2 = 2i', E((1 + I)**2) == 2*I)

# Tier 4
# T4.1
zsym, cc = sp.symbols('zsym cc')
A, B = sp.symbols('A B')
sol = sp.solve([A + zsym*B - (1 + zsym), (1 - zsym)*A + B - (2 - zsym)], [A, B], dict=True)[0]
check('T4.1 generic solution f(z) = 1', sp.simplify(sol[A] - 1) == 0)
check('T4.1 eq1 - z*eq2 = (A - 1)(z^2 - z + 1)', sp.simplify(E((A + zsym*B - (1 + zsym)) - zsym*((1 - zsym)*A + B - (2 - zsym))) - (A - 1)*(zsym**2 - zsym + 1)) == 0)
z0, z1 = (1 + I*sqrt(3))/2, (1 - I*sqrt(3))/2
check('T4.1 exceptional points: roots, sum 1, product 1', sp.simplify(E(z0**2 - z0 + 1)) == 0 and sp.simplify(E(z1**2 - z1 + 1)) == 0 and sp.simplify(z0 + z1) == 1 and sp.simplify(E(z0*z1)) == 1)
def fam(zv):
    if sp.simplify(zv - z0) == 0: return cc
    if sp.simplify(zv - z1) == 0: return z1*(1 + z0 - cc)
    return 1
check('T4.1 family satisfies equation at z0 and z1 for every c',
      sp.simplify(E(fam(z0) + z0*fam(1 - z0) - (1 + z0))) == 0 and sp.simplify(E(fam(z1) + z1*fam(1 - z1) - (1 + z1))) == 0)
ok = True
for _ in range(50):
    zv = sp.Rational(random.randint(-9, 9), random.randint(1, 5)) + I*sp.Rational(random.randint(-9, 9), random.randint(1, 5))
    ok &= sp.simplify(E(fam(zv) + zv*fam(1 - zv) - (1 + zv))) == 0
check('T4.1 family satisfies equation at 50 other points', ok)
check('T4.1 c = 1 gives f(z1) = 1', sp.simplify(E(z1*(1 + z0 - 1))) == 1)
check('T4.1 the two exceptional equations are proportional (factor z1)', sp.simplify(E(z1*(cc + z0*B - (1 + z0)) - (B + z1*cc - (1 + z1)))) == 0)
# T4.2
check('T4.2 f(i)^2 = -1 gives f(i) = +-i', set(sp.solve(t**2 + 1, t)) == {I, -I})
check('T4.2 conjugation additive and multiplicative', E(sp.conjugate((a + b*I) + (c + d*I)) - ((a - b*I) + (c - d*I))) == 0 and E(sp.conjugate(E((a + b*I)*(c + d*I))) - (a - b*I)*(c - d*I)) == 0)
# T4.3
check('T4.3 parts of z^3 - zbar', [sp.factor(p) for p in parts(Z**3 - ZB)] == [sp.factor(x*(x**2 - 3*y**2 - 1)), sp.factor(y*(3*x**2 - y**2 + 1))])
check('T4.3 z^3 = zbar -> {0, +-1, +-i}', same(solve_z(Z**3 - ZB), {0, 1, -1, I, -I}))
check('T4.3 both non-zero case impossible', sp.solve([x**2 - 1 - 3*y**2, 3*x**2 - y**2 + 1], [x, y]) == [] or all(not (s[0].is_real and s[1].is_real) for s in sp.solve([x**2 - 1 - 3*y**2, 3*x**2 - y**2 + 1], [x, y])))
# T4.4
check('T4.4 Im conditions give b = 0 or c = a', E((a*d + b*c).subs(d, -b)) == E(b*(c - a)))
# T4.5 count table by direct solving
def count(av):
    s = solve_z(Z**2 + r + av, True)
    return None if s is None else len(s)
table = {-1: 2, Q(-1, 4): 4, Q(-1, 8): 6, Q(-1, 5): 6, 0: 3, Q(1, 2): 2, 3: 2, Q(-3, 10): 2}
check('T4.5 counts for a = -1, -3/10, -1/4, -1/5, -1/8, 0, 1/2, 3', all(count(av) == n for av, n in table.items()))
check('T4.5 real root |x| = (-1 + sqrt(1-4a))/2 at a = -2', sp.simplify(((-1 + sqrt(9))/2)**2 + (-1 + sqrt(9))/2 - 2) == 0)
# T4.6
check('T4.6 Lagrange identity', E((a**2 + b**2)*(c**2 + d**2) - ((a*c + b*d)**2 + (a*d - b*c)**2)) == 0)
check('T4.6 Re(z wbar) = ac + bd', sp.re(E((a + b*I)*(c - d*I))) == a*c + b*d)
check('T4.6 |z+w|^2 = |z|^2 + 2Re(z wbar) + |w|^2', E((a + c)**2 + (b + d)**2 - ((a**2 + b**2) + 2*(a*c + b*d) + (c**2 + d**2))) == 0)
ok = True
for _ in range(500):
    zv = complex(random.uniform(-5, 5), random.uniform(-5, 5)); wv = complex(random.uniform(-5, 5), random.uniform(-5, 5))
    ok &= abs((zv*wv.conjugate()).real) <= abs(zv)*abs(wv) + 1e-12 and abs(zv + wv) <= abs(zv) + abs(wv) + 1e-12
check('T4.6 inequalities on 500 random pairs', ok)

# Mastery check
check('M1 i^3(1-2i)^2 = -4 + 3i', E(I**3*(1 - 2*I)**2) == -4 + 3*I and E((1 - 2*I)**2) == -3 - 4*I)
check('M2 3z - i zbar = 2 + 6i -> 3/2 + 5i/2', same(solve_z(3*Z - I*ZB - (2 + 6*I)), {Q(3, 2) + Q(5, 2)*I}))
check('M4 z^2 = 2 zbar -> {0, 2, -1 +- i sqrt3}', same(solve_z(Z**2 - 2*ZB), {0, 2, -1 + I*sqrt(3), -1 - I*sqrt(3)}))
check('M4 = twice the solutions of z^2 = zbar', same({0, 2, -1 + I*sqrt(3), -1 - I*sqrt(3)}, {0, 2, E(2*w), E(2*w**2)}))
al8, be8 = Q(3, 5), Q(4, 5)*I
q8 = sp.conjugate(al8)*be8
check('M8 <X> = 0, <Y> = 24/25, <Z> = -7/25, squares sum to 1', sp.re(2*q8) == 0 and sp.im(2*q8) == Q(24, 25) and al8**2 - sp.Abs(be8)**2 == Q(-7, 25) and Q(24, 25)**2 + Q(7, 25)**2 == 1)

# Figures: the diagrams use the same numbers as the text
import importlib.util, os
here = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('mk', os.path.join(here, '../diagrams/make.py'))
mk = importlib.util.module_from_spec(spec); spec.loader.exec_module(mk)
check('fig c3-count agrees with the table', [mk.count(av) for av in [-1, -0.3, -0.25, -0.2, -0.125, 0, 0.5, 3]] == [2, 2, 4, 6, 6, 3, 2, 2])
check('fig c3-hyperbolas point squares to 1 + 2i', abs(complex(mk.x0, mk.y0)**2 - (1 + 2j)) < 1e-12)

for name, ok in results: print(f"{'PASS' if ok else 'FAIL'}  {name}")
fails = sum(not ok for _, ok in results)
print(f"\n{len(results) - fails} of {len(results)} checks passed")
raise SystemExit(1 if fails else 0)
