"""Independent checks of every calculation in Chapter 0 (KQV-MATH-CH000).
Run: python3 content/mathematics/chapters/KQV-MATH-CH000/tests/check_ch000.py
Exact arithmetic (fractions) and symbolic algebra (sympy); exits non-zero on any failure."""
from fractions import Fraction as F
import sympy as sp

results = []
def check(name, ok):
    results.append((name, bool(ok)))

# 0.2 notebooks: C(n) = 40n
C = lambda n: 40 * n
check('0.2 table: C(1),C(2),C(3) = 40, 80, 120', [C(1), C(2), C(3)] == [40, 80, 120])

# 0.3 Problem 1: A(n) = 40 + 2n, B(n) = 3n
A = lambda n: 40 + 2 * n
B = lambda n: 3 * n
n = sp.symbols('n')
check('P1 break-even solves to n = 40', sp.solve(sp.Eq(40 + 2 * n, 3 * n), n) == [40])
check('P1 both shops charge 120 at 40 pages', A(40) == B(40) == 120)
check('P1 10 pages: A = 60, B = 30', (A(10), B(10)) == (60, 30))
check('P1 100 pages: A = 240, B = 300', (A(100), B(100)) == (240, 300))
check('P1 B cheaper for every n < 40, A cheaper for every n > 40 (n = 1..1000)',
      all((B(k) < A(k)) if k < 40 else (A(k) < B(k)) if k > 40 else A(k) == B(k) for k in range(1, 1001)))

# 0.3 Problem 2: rectangles with perimeter 20
l = sp.symbols('l', real=True)
check('P2 identity l(10 - l) = 25 - (l - 5)^2', sp.expand(l * (10 - l) - (25 - (l - 5) ** 2)) == 0)
check('P2 table areas 9, 21, 25 with perimeter 20',
      all(2 * a + 2 * b == 20 and a * b == area for a, b, area in [(1, 9, 9), (3, 7, 21), (5, 5, 25)]))
check('P2 maximum of l(10 - l) on 0 < l < 10 is 25 at l = 5',
      sp.maximum(l * (10 - l), l, sp.Interval.open(0, 10)) == 25 and sp.solve(sp.diff(l * (10 - l), l), l) == [5])
check('0.8 lab: lengths 4 and 6 give equal area (24)', 4 * 6 == 6 * 4 == 24)

# 0.3 Problem 3: d(t) = t^2
h, t = sp.symbols('h t')
check('P3 distances 0, 1, 4, 9 at t = 0..3', [k ** 2 for k in range(4)] == [0, 1, 4, 9])
check('P3 interval average speeds 1, 3, 5', [(k + 1) ** 2 - k ** 2 for k in range(3)] == [1, 3, 5])
check('P3 ((2 + h)^2 - 4)/h simplifies to 4 + h', sp.simplify(((2 + h) ** 2 - 4) / h - (4 + h)) == 0)
check('P3 values 4.1 and 4.01 at h = 0.1, 0.01',
      [((2 + F(x)) ** 2 - 4) / F(x) for x in ('0.1', '0.01')] == [F('4.1'), F('4.01')])
check('P3 limit as h -> 0 is 4', sp.limit(((2 + h) ** 2 - 4) / h, h, 0) == 4)

# 0.4 and 0.11 Q4: x^2 + 1 = 0 has no real solution, and i^2 = -1
x = sp.symbols('x')
check('0.4 x^2 + 1 = 0 has no real roots', sp.solveset(x ** 2 + 1, x, domain=sp.S.Reals) == sp.S.EmptySet)
check('0.4 complex roots are ±i', set(sp.solve(x ** 2 + 1, x)) == {sp.I, -sp.I})

# 0.6 amplitudes 3/5 and 4/5
a, b = F(3, 5), F(4, 5)
check('0.6 |a|^2 + |b|^2 = 1', a * a + b * b == 1)
check('0.6 P(0) = 9/25 = 0.36, P(1) = 16/25 = 0.64', (a * a, b * b) == (F(9, 25), F(16, 25)) and float(a * a) == 0.36 and float(b * b) == 0.64)

# 0.7 counterexample: 2 is prime and even
check('0.7 2 is prime and even', sp.isprime(2) and 2 % 2 == 0)

# 0.11 checkpoint answers
check('Q2 25 pages: A = 90, B = 75, B cheaper by 15', (A(25), B(25), A(25) - B(25)) == (90, 75, 15))
check('Q5 +20% then -20% on 100 gives 96', F(100) * F(6, 5) == 120 and F(120) * F(4, 5) == 96)

w = max(len(n) for n, _ in results)
for name, ok in results:
    print(f"{'PASS' if ok else 'FAIL'}  {name}")
fails = sum(not ok for _, ok in results)
print(f"\n{len(results) - fails} of {len(results)} checks passed")
raise SystemExit(1 if fails else 0)
