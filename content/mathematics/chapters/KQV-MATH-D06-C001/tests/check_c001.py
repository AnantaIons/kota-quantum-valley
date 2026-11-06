"""Independent checks of every calculation in KQV-MATH-D06-C001 (Why Complex Numbers Are Needed).
Run: python3 content/mathematics/chapters/KQV-MATH-D06-C001/tests/check_c001.py
Exact and symbolic arithmetic (SymPy), plus tolerance-aware numerics; exits non-zero on any failure."""
import sympy as sp
from sympy import I, sqrt, Rational as Q, cos, pi, simplify, expand, nsimplify
import cmath, math, itertools, random

results = []
def check(name, ok):
    results.append((name, bool(ok)))

x, y, z, k, a, b, c, d, t, h = sp.symbols('x y z k a b c d t h')
real = lambda e: sp.simplify(sp.im(sp.expand_complex(e))) == 0

# ---------- 1.2 / 1.3 ----------
check('1.3 completed square identity', sp.simplify(a*x**2 + b*x + c - (a*(x + b/(2*a))**2 - (b**2 - 4*a*c)/(4*a))) == 0)
check('Prereq: x^2-5x+6 roots 2,3', set(sp.solve(x**2 - 5*x + 6, x)) == {2, 3})
check('Prereq: x^2+6x+13 = (x+3)^2+4', sp.expand((x + 3)**2 + 4 - (x**2 + 6*x + 13)) == 0)

# ---------- 1.4 Cardano's 10 = sum, 40 = product ----------
u1, u2 = 5 + sqrt(-15), 5 - sqrt(-15)
check('1.4 5±sqrt(-15): sum 10, product 40', sp.simplify(u1 + u2) == 10 and sp.simplify(sp.expand(u1 * u2)) == 40)
check('1.4 discriminant of x^2-10x+40 is -60', sp.discriminant(x**2 - 10*x + 40, x) == -60)

# ---------- 1.5 depressing a cubic ----------
poly = sp.expand((a*(y - b/(3*a))**3 + b*(y - b/(3*a))**2 + c*(y - b/(3*a)) + d) / a)
P = sp.Poly(poly, y)
p_expr = (3*a*c - b**2) / (3*a**2)
q_expr = (2*b**3 - 9*a*b*c + 27*a**2*d) / (27*a**3)
check('1.5/T5.1 depressed cubic has no y^2 term', sp.simplify(P.coeff_monomial(y**2)) == 0)
check('1.5/T5.1 p formula', sp.simplify(P.coeff_monomial(y) - p_expr) == 0)
check('1.5/T5.1 q formula', sp.simplify(P.coeff_monomial(1) - q_expr) == 0)
u, v, p, q = sp.symbols('u v p q')
check('1.5 (u+v)^3 identity', sp.expand((u + v)**3 - (u**3 + v**3 + 3*u*v*(u + v))) == 0)
# Cardano formula generic numeric test: random real p,q with R>0, real cube roots
ok = True
rng = random.Random(1)
for _ in range(200):
    pp, qq = rng.uniform(-5, 5), rng.uniform(-5, 5)
    R = qq**2/4 + pp**3/27
    if R <= 0: continue
    cr = lambda w: math.copysign(abs(w)**(1/3), w)
    yy = cr(-qq/2 + math.sqrt(R)) + cr(-qq/2 - math.sqrt(R))
    ok &= abs(yy**3 + pp*yy + qq) < 1e-9 and abs(cr(-qq/2 + math.sqrt(R))*cr(-qq/2 - math.sqrt(R)) + pp/3) < 1e-9
check('1.5 Cardano formula gives a root and uv = -p/3 when R > 0 (200 random cases)', ok)

# Worked example x^3 + 6x - 20
check('1.5 R = 108 for x^3+6x-20', Q(400, 4) + Q(216, 27) == 108)
check('1.5 (1+sqrt3)^3 = 10+6sqrt3 = 10+sqrt108', sp.expand((1 + sqrt(3))**3) == 10 + 6*sqrt(3) and sqrt(108) == 6*sqrt(3))
check('1.5 (sqrt3-1)^3 = 6sqrt3-10', sp.expand((sqrt(3) - 1)**3) == 6*sqrt(3) - 10)
check('1.5 x = 2 is a root; quotient x^2+2x+10 has negative discriminant',
      sp.div(x**3 + 6*x - 20, x - 2) == (x**2 + 2*x + 10, 0) and sp.discriminant(x**2 + 2*x + 10, x) < 0)

# ---------- 1.6 Bombelli ----------
check('1.6 R = -121 for x^3-15x-4', Q(16, 4) + Q(-15)**3 / 27 == -121)
check('1.6 sqrt(-121) = 11i', sqrt(-121) == 11*I)
check('1.6 (2+i)^3 = 2+11i and (2-i)^3 = 2-11i', sp.expand((2 + I)**3) == 2 + 11*I and sp.expand((2 - I)**3) == 2 - 11*I)
check('1.6 product condition (2+i)(2-i) = 5 = -p/3', sp.expand((2 + I)*(2 - I)) == 5)
check('1.6 4 is a root; x^3-15x-4 = (x-4)(x^2+4x+1)', sp.expand((x - 4)*(x**2 + 4*x + 1)) == x**3 - 15*x - 4)
check('1.6 other roots -2±sqrt3', set(sp.solve(x**2 + 4*x + 1, x)) == {-2 + sqrt(3), -2 - sqrt(3)})
w = sp.Rational(-1, 2) + sqrt(3)*I/2
roots_c = [sp.nsimplify(sp.expand(sp.expand_complex(w**j*(2 + I) + w**(-j)*(2 - I)))) for j in range(3)]
check('1.6 u w^j + v w^-j gives all three roots 4, -2±sqrt3', set(map(sp.simplify, roots_c)) == {4, -2 + sqrt(3), -2 - sqrt(3)})

# Theorem 1.2: three distinct real roots iff 4p^3+27q^2<0 (numeric sweep + algebra)
s_ = sp.symbols('s', positive=True)
fpm = lambda sign: (sign*s_)**3 + p*(sign*s_) + q
prod = sp.expand(fpm(1)*fpm(-1)).subs(s_**2, -p/3)
check('Thm 1.2 f(s) f(-s) = (4p^3+27q^2)/27 when s^2 = -p/3', sp.simplify(sp.expand(prod.subs(s_**4, (p/3)**2).subs(s_**6, -(p/3)**3)) - (4*p**3 + 27*q**2)/27) == 0)
check('Thm 1.2 discriminant of y^3+py+q is -4p^3-27q^2', sp.expand(sp.discriminant(y**3 + p*y + q, y) - (-4*p**3 - 27*q**2)) == 0)
check('Thm 1.2 108 R = 4p^3 + 27q^2', sp.expand(108*(q**2/4 + p**3/27) - (4*p**3 + 27*q**2)) == 0)
ok = True
for _ in range(500):
    pp, qq = rng.uniform(-6, 6), rng.uniform(-6, 6)
    import numpy as np
    rts = np.roots([1, 0, pp, qq])
    nreal = sum(abs(r.imag) < 1e-9 for r in rts)
    if abs(4*pp**3 + 27*qq**2) < 1e-6: continue
    ok &= (nreal == 3) == (4*pp**3 + 27*qq**2 < 0)
check('Thm 1.2 numeric sweep: 3 real roots exactly when 4p^3+27q^2<0 (500 cases)', ok)

# Viète trig formula
def viete(pp, qq):
    m = 2*math.sqrt(-pp/3)
    arg = (3*qq/(2*pp))*math.sqrt(-3/pp)
    return [m*math.cos(math.acos(arg)/3 - 2*math.pi*kk/3) for kk in range(3)]
ok = True
for _ in range(300):
    pp, qq = rng.uniform(-6, -0.1), rng.uniform(-6, 6)
    if 4*pp**3 + 27*qq**2 > 0: continue
    ok &= all(abs(r**3 + pp*r + qq) < 1e-8 for r in viete(pp, qq))
check('1.6/T5.4 trigonometric formula gives roots whenever p<0, R<=0', ok)
check('1.6/T5.4 x^3-3x+1 roots 2cos(2pi/9), 2cos(8pi/9), 2cos(14pi/9)',
      all(abs(r**3 - 3*r + 1) < 1e-12 for r in [2*math.cos(2*math.pi/9), 2*math.cos(8*math.pi/9), 2*math.cos(14*math.pi/9)])
      and sorted(viete(-3, 1)) == sorted(viete(-3, 1)) and
      sorted(round(r, 10) for r in viete(-3, 1)) == sorted(round(r, 10) for r in [2*math.cos(2*math.pi/9), 2*math.cos(8*math.pi/9), 2*math.cos(14*math.pi/9)]))
check('T5.4 numeric root values 1.532, -1.879, 0.347',
      [round(2*math.cos(2*math.pi/9), 3), round(2*math.cos(8*math.pi/9), 3), round(2*math.cos(14*math.pi/9), 3)] == [1.532, -1.879, 0.347])
check('T5.4 cos(14pi/9) = cos(4pi/9)', abs(math.cos(14*math.pi/9) - math.cos(4*math.pi/9)) < 1e-12)
m_ = 2*sp.sqrt(-p/3)
check('T5.4(a) -4q/m^3 = (3q/(2p)) sqrt(-3/p) for p<0',
      all(abs(float((-4*q/m_**3 - (3*q/(2*p))*sp.sqrt(-3/p)).subs({p: pv, q: qv}))) < 1e-12 for pv, qv in [(-3, 1), (-1.7, 2.2), (-6, -4)]))
check('T5.4(a) cos^3 identity', sp.simplify(sp.cos(3*t) - (4*sp.cos(t)**3 - 3*sp.cos(t))) == 0)
check('T5.4(b) square of RHS = -27q^2/(4p^3)', sp.simplify(((3*q/(2*p))**2*(-3/p)) - (-27*q**2/(4*p**3))) == 0)

# x^3 - 7x + 6
check('1.6/M3 x^3-7x+6 = (x-1)(x-2)(x+3); 4p^3+27q^2 = -400; R = -100/27',
      sp.expand((x - 1)*(x - 2)*(x + 3)) == x**3 - 7*x + 6 and 4*(-7)**3 + 27*36 == -400 and Q(36, 4) + Q(-343, 27) == Q(-100, 27))

# ---------- 1.7 ----------
check('1.7 (-i)^2 = -1', sp.expand((-I)**2) == -1)
check('1.7 roots (-b ± ik)/(2a) solve ax^2+bx+c when D<0',
      all(sp.simplify(sp.expand(aa*r**2 + bb*r + cc)) == 0
          for aa, bb, cc in [(1, -4, 13), (2, 3, 5), (-1, 1, -7)]
          for kk in [sqrt(-(bb**2 - 4*aa*cc))]
          for r in [(-bb + I*kk)/(2*aa), (-bb - I*kk)/(2*aa)]))
check('1.7 x^2-4x+13: D = -36, roots 2±3i', sp.discriminant(x**2 - 4*x + 13, x) == -36 and set(sp.solve(x**2 - 4*x + 13, x)) == {2 + 3*I, 2 - 3*I})
check('1.7 powers of i period 4', [I**n for n in range(1, 9)] == [I, -1, -I, 1, I, -1, -I, 1])

# ---------- 1.8 / T6.4 quaternions ----------
H = sp.algebras.Quaternion
qi, qj, qk = H(0, 1, 0, 0), H(0, 0, 1, 0), H(0, 0, 0, 1)
check('1.8 quaternion relations i^2=j^2=k^2=ijk=-1, ij=k, ji=-k',
      qi*qi == H(-1, 0, 0, 0) and qj*qj == H(-1, 0, 0, 0) and qk*qk == H(-1, 0, 0, 0) and qi*qj*qk == H(-1, 0, 0, 0) and qi*qj == qk and qj*qi == H(0, 0, 0, -1))
bb_, cc_, dd_ = sp.symbols('b c d', real=True)
vq = H(0, bb_, cc_, dd_)
check('T6.4 (bi+cj+dk)^2 = -(b^2+c^2+d^2)', sp.simplify((vq*vq).a + bb_**2 + cc_**2 + dd_**2) == 0 and all(sp.simplify(e) == 0 for e in [(vq*vq).b, (vq*vq).c, (vq*vq).d]))
check('T6.4 j*i - i*j != 0 (commutativity fails)', (qj*qi - qi*qj) != H(0, 0, 0, 0))

# ---------- 1.9 MUBs ----------
import numpy as np
Z = [np.array([1, 0]), np.array([0, 1])]
X = [np.array([1, 1])/math.sqrt(2), np.array([1, -1])/math.sqrt(2)]
Y = [np.array([1, 1j])/math.sqrt(2), np.array([1, -1j])/math.sqrt(2)]
ip = lambda u_, v_: np.vdot(u_, v_)
orth = all(abs(ip(B[0], B[1])) < 1e-12 and all(abs(abs(ip(e, e)) - 1) < 1e-12 for e in B) for B in (Z, X, Y))
unb = all(abs(abs(ip(e, f))**2 - 0.5) < 1e-12 for B1, B2 in [(Z, X), (Z, Y), (X, Y)] for e in B1 for f in B2)
check('1.9 Z, X, Y are orthonormal and pairwise mutually unbiased in C^2', orth and unb)
check('1.9 <x+, y+> = (1+i)/2, squared modulus 1/2', abs(ip(X[0], Y[0]) - (1 + 1j)/2) < 1e-12)
# R^2: brute force over angles shows no third basis unbiased to two others
angles = np.linspace(0, math.pi/2, 9001)
unbiased = lambda t1, t2: abs(math.cos(t1 - t2)**2 - 0.5) < 1e-6
found = any(unbiased(0, t2) and unbiased(0, t3) and unbiased(t2, t3) for t2 in angles[::50] for t3 in angles[::50])
check('1.9 no three pairwise unbiased bases in R^2 (angle grid incl. 45 deg)', not found and unbiased(0, math.pi/4))

# ---------- Tier 1 ----------
check('T1.2 x^2+x+1 = (x+1/2)^2+3/4', sp.expand((x + Q(1, 2))**2 + Q(3, 4) - (x**2 + x + 1)) == 0)
check('T1.3 (±3i)^2 = -9', sp.expand((3*I)**2) == -9 and sp.expand((-3*I)**2) == -9)
check('T1.4 x^2+2x+5 = (x+1)^2+4', sp.expand((x + 1)**2 + 4 - (x**2 + 2*x + 5)) == 0)
check('T1.5 i^3, i^4, i^10, i^2027', [I**3, I**4, I**10, I**2027] == [-I, 1, -1, -I] and 2027 % 4 == 3)
check('T1.6 (2i)(3i) = -6', sp.expand((2*I)*(3*I)) == -6)

# ---------- Tier 2 ----------
check('T2.1 k^2-36<0 iff -6<k<6', sp.solve_univariate_inequality(k**2 - 36 < 0, k, relational=False) == sp.Interval.open(-6, 6))
check('T2.2 check 2+3i in x^2-4x+13', sp.expand((2 + 3*I)**2 - 4*(2 + 3*I) + 13) == 0 and sp.expand((2 + 3*I)**2) == -5 + 12*I)
check('T2.3 (x-3-2i)(x-3+2i) = x^2-6x+13', sp.expand((x - 3 - 2*I)*(x - 3 + 2*I)) == x**2 - 6*x + 13)
om = sp.Rational(-1, 2) + sqrt(3)*I/2
check('T2.4 omega^3 = 1 and omega^100+omega^200+1 = 0', sp.simplify(sp.expand(om**3)) == 1 and sp.simplify(sp.expand(om**100 + om**200 + 1)) == 0
      and sp.simplify(sp.expand(om**2 + om + 1)) == 0)
check('T2.5 4a^2-4(a+2)<0 iff -1<a<2', sp.solve_univariate_inequality(4*a**2 - 4*(a + 2) < 0, a, relational=False) == sp.Interval.open(-1, 2))
check('T2.6 discriminant (a+b)^2-4ab-4 = (a-b)^2-4', sp.expand((a + b)**2 - 4*(a*b + 1) - ((a - b)**2 - 4)) == 0)

# ---------- Tier 5 ----------
check('T5.2 x^3-6x-4: R = -4', Q(16, 4) + Q(-6)**3/27 == -4)
check('T5.2 (-1+i)^3 = 2+2i, (-1-i)^3 = 2-2i, product 2', sp.expand((-1 + I)**3) == 2 + 2*I and sp.expand((-1 - I)**3) == 2 - 2*I and sp.expand((-1 + I)*(-1 - I)) == 2)
check('T5.2 (-1+i)^2 = -2i', sp.expand((-1 + I)**2) == -2*I)
check('T5.2 x^3-6x-4 = (x+2)(x^2-2x-2), roots -2, 1±sqrt3', sp.expand((x + 2)*(x**2 - 2*x - 2)) == x**3 - 6*x - 4 and set(sp.solve(x**2 - 2*x - 2, x)) == {1 + sqrt(3), 1 - sqrt(3)})
check('T5.3 R = 5; ((1±sqrt5)/2)^3 = 2±sqrt5; sum 1',
      Q(16, 4) + Q(27, 27) == 5 and sp.expand(((1 + sqrt(5))/2)**3) == 2 + sqrt(5) and sp.expand(((1 - sqrt(5))/2)**3) == 2 - sqrt(5))
check('T5.3 x^3+3x-4: 1 is the only real root', set(r for r in sp.solve(x**3 + 3*x - 4, x) if r.is_real) == {1})

# ---------- Tier 6 ----------
check('T6.1 x^3-3x+1 irreducible over Q', sp.Poly(x**3 - 3*x + 1, x).is_irreducible)
check('T6.1 discriminant 81', sp.discriminant(x**3 - 3*x + 1, x) == 81)
r0 = 2*sp.cos(2*pi/9)
check('T6.1 r -> r^2-2 permutes the roots cyclically',
      all(abs(float((rr**2 - 2)**3 - 3*(rr**2 - 2) + 1)) < 1e-12 for rr in [2*math.cos(2*math.pi/9), 2*math.cos(4*math.pi/9), 2*math.cos(8*math.pi/9)])
      and abs((2*math.cos(2*math.pi/9))**2 - 2 - 2*math.cos(4*math.pi/9)) < 1e-12
      and abs((2*math.cos(4*math.pi/9))**2 - 2 - 2*math.cos(8*math.pi/9)) < 1e-12
      and abs((2*math.cos(8*math.pi/9))**2 - 2 - 2*math.cos(2*math.pi/9)) < 1e-12)
G = sp.polys.numberfields.galoisgroups.galois_group(sp.Poly(x**3 - 3*x + 1, x))
check('T6.1 Galois group has order 3', G[0].order() == 3)
# T6.2 lemma sanity: x^p - b irreducible over Q when b not a p-th power
check('T6.2 lemma examples: x^3-2, x^5-3 irreducible; x^3-8 reducible',
      sp.Poly(x**3 - 2, x).is_irreducible and sp.Poly(x**5 - 3, x).is_irreducible and not sp.Poly(x**3 - 8, x).is_irreducible)
# splitting field via beta and sqrt(Delta): gamma - delta = ±sqrt(Delta)/f'(beta)
rts = sorted([2*math.cos(2*math.pi/9), 2*math.cos(4*math.pi/9), 2*math.cos(8*math.pi/9)])
be, ga, de = rts
fprime = 3*be**2 - 3
check('T6.2 gamma - delta = ±sqrt(Delta)/f\'(beta) for x^3-3x+1', abs(abs(ga - de) - 9/abs(fprime)) < 1e-12)
# T6.3 j^2 = -1
al = sp.symbols('alpha')
jj = (2*al + b)/sp.sqrt(4*c - b**2)
check('T6.3 j^2 = -1 when alpha^2 + b alpha + c = 0', sp.simplify(sp.expand(jj**2).subs(al**2, -b*al - c) + 1) == 0)

# ---------- Mastery ----------
check('M1 x^2-2x+2 = (x-1)^2+1; roots 1±i', sp.expand((x - 1)**2 + 1 - (x**2 - 2*x + 2)) == 0 and set(sp.solve(x**2 - 2*x + 2, x)) == {1 + I, 1 - I})
mm = sp.symbols('m', real=True)
check('M2 discriminant -4; roots m±i', sp.expand(sp.discriminant(x**2 - 2*mm*x + mm**2 + 1, x)) == -4 and set(sp.solve(x**2 - 2*mm*x + mm**2 + 1, x)) == {mm + I, mm - I})
check('M6 4p^3+27q^2 = -81 for x^3-3x+1', 4*(-3)**3 + 27 == -81)
yp = np.array([1, 1j])/math.sqrt(2); plus = np.array([1, 1])/math.sqrt(2)
check('M8 Z probabilities equal; X probabilities 1 vs 1/2', abs(abs(yp[1])**2 - 0.5) < 1e-12 and abs(abs(np.vdot(plus, plus))**2 - 1) < 1e-12 and abs(abs(np.vdot(plus, yp))**2 - 0.5) < 1e-12)

for name, ok in results:
    print(f"{'PASS' if ok else 'FAIL'}  {name}")
fails = sum(not ok for _, ok in results)
print(f"\n{len(results) - fails} of {len(results)} checks passed")
raise SystemExit(1 if fails else 0)
