"""Diagrams for Complex Numbers Chapter 4. Run: python3 content/mathematics/chapters/KQV-MATH-D06-C004/diagrams/make.py"""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '../../../tools'))
from svgplot import Fig, save, fmt

def branch(f, xy, t0, t1, cls, n=240):
    """A parametric curve, keeping only the samples inside the plotting window."""
    pts = [xy(t0 + (t1 - t0) * k / n) for k in range(n + 1)]
    seg = []
    for p in pts:
        if f.x0 <= p[0] <= f.x1 and f.y0 <= p[1] <= f.y1:
            seg.append(p)
        elif seg:
            if len(seg) > 1: f.path_pts(seg, cls)
            seg = []
    if len(seg) > 1: f.path_pts(seg, cls)

# 1. the plane of pairs: the real axis is a copy of R, i = (0, 1), and (3, 2) = (3, 0) + (2, 0)(0, 1)
f = Fig((-1.6, 4.4), (-1.7, 2.9), w=440, equal=True)
f.grid([x for x in range(-1, 5) if x], [y for y in range(-1, 3) if y])
f.axes(xticks=[1, 2, 3], yticks=[], xlabel='', ylabel='')
f.line((f.x0, 0), (f.x1 - 0.15, 0), 'c1')
f.text((f.x0, 0), 'ℝ: the pairs (a, 0)', 'lab small t1', dx=4, dy=-10)
f.arrow((0, 0), (3, 0), 'c3'); f.arrow((3, 0), (3, 2), 'c2'); f.arrow((0, 0), (3, 2), 'c1 dash')
f.point((3, 2), 'p1', r=5); f.point((0, 1), 'p2', r=5); f.point((0, -1), 'p5', r=4.4); f.point((-1, 0), 'p1', r=4.4)
f.text((3, 2), '(3, 2) = 3 + 2i', 'lab t1', dx=-8, dy=-10, anchor='end')
f.text((1.5, 0), '(3, 0)', 'lab small t3', dy=16, anchor='middle')
f.text((3, 1), '(2, 0)(0, 1) = (0, 2)', 'lab small t2', dx=8)
f.text((0, 1), 'i = (0, 1)', 'lab t2', dx=-8, dy=4, anchor='end')
f.text((0, -1), '(0, −1)', 'lab small', dx=-8, dy=4, anchor='end')
f.text((-1, 0), '(−1, 0) = −1', 'lab small t1', dx=6, dy=18)
save(f, os.path.join(HERE, 'c4-pairs.svg'), 'The plane of ordered pairs. The horizontal axis holds the pairs (a, 0), a copy of the real numbers. The pair i = (0, 1) squares to (−1, 0), and (3, 2) is (3, 0) plus (2, 0) times (0, 1).')

# 2. which quadratic x^2 - q x - p gives which system: the parabola q^2 + 4p = 0 in the (q, p) plane
f = Fig((-3.2, 3.2), (-3.0, 2.2), w=440, h=330, pad=(34, 14, 14, 28))
para = lambda q: -q * q / 4
below = [(q / 20, para(q / 20)) for q in range(-64, 65)]
f.path_pts([(f.x0, f.y0)] + [(-3.2, para(-3.2))] + below + [(3.2, para(3.2)), (f.x1, f.y0)], 'f3 poly', close=True)
f.path_pts([(f.x0, f.y1)] + [(-3.2, para(-3.2))] + below + [(3.2, para(3.2)), (f.x1, f.y1)], 'f2 poly', close=True)
f.axes(xticks=[-2, -1, 1, 2], yticks=[-2, -1, 1], xlabel='q', ylabel='p')
f.plot(para, 'c1')
marks = [((0, -1), 'x² + 1', 8, 16, 'start'), ((-1, -1), 'x² + x + 1', 0, 20, 'middle'), ((2, -2), 'x² − 2x + 2', -8, 16, 'end'),
         ((0, 0), 'x²', 8, -8, 'start'), ((2, -1), 'x² − 2x + 1', 8, -8, 'start'), ((0, 1), 'x² − 1', 8, -6, 'start'), ((1, 0), 'x² − x', 8, -8, 'start')]
for (q, p), lab, dx, dy, a in marks:
    d = q * q + 4 * p
    f.point((q, p), 'p3' if d < 0 else ('p1' if d == 0 else 'p2'), r=4.6)
    f.text((q, p), lab, 'lab small', dx=dx, dy=dy, anchor=a)
f.text((-3.05, -2.45), 'below: a field, a copy of ℂ', 'lab small t3')
f.text((-3.05, 1.95), 'above: split-complex numbers', 'lab small t2')
f.text((3.1, -2.75), 'on the parabola: dual numbers', 'lab small t1', anchor='end')
save(f, os.path.join(HERE, 'c4-family.svg'), 'The (q, p) plane of quadratics x² − qx − p. Below the parabola p = −q²/4 reducing modulo the quadratic gives a copy of ℂ; on the parabola, the dual numbers; above it, the split-complex numbers.')

# 3. norm 1 and norm 0 in C, D and S (three panels)
f = Fig((0, 1), (0, 1), w=440, h=196, pad=(0, 0, 0, 0))
panels = [('ℂ: a² + b²', 'circle'), ('dual: a²', 'dual'), ('split: a² − b²', 'split')]
for k, (title, kind) in enumerate(panels):
    x0 = 6 + k * 146
    f.rect(x0, 6, 136, 164, 'f3 c5', rx=10)
    sub = Fig((-1.9, 1.9), (-1.9, 1.9), w=136, h=124, pad=(6, 6, 6, 6))
    sub.axes(xlabel='', ylabel='')
    if kind == 'circle':
        sub.circle((0, 0), 1, 'c1')
    elif kind == 'dual':
        sub.line((1, sub.y0), (1, sub.y1), 'c1'); sub.line((-1, sub.y0), (-1, sub.y1), 'c1')
        sub.line((0, sub.y0), (0, sub.y1), 'c2 dash')
    else:
        branch(sub, lambda t: (math.cosh(t), math.sinh(t)), -1.6, 1.6, 'c1')
        branch(sub, lambda t: (-math.cosh(t), math.sinh(t)), -1.6, 1.6, 'c1')
        sub.line((sub.x0, sub.x0), (sub.x1, sub.x1), 'c2 dash'); sub.line((sub.x0, -sub.x0), (sub.x1, -sub.x1), 'c2 dash')
    sub.point((0, 0), 'p5', r=2.6)
    inner = sub.svg(title, f'c4-norms-{k}').replace('<svg viewBox=', f'<svg x="{x0}" y="30" width="136" height="124" viewBox=', 1)
    f.add(inner.replace(' role="img"', '').replace(' xmlns="http://www.w3.org/2000/svg"', ''))
    f.text((x0 + 68, 24), title, 'lab small', anchor='middle', px=True)
f.text((220, 189), 'Gold: norm 1. Dashed: non-zero elements of norm 0 (zero divisors).', 'lab small t5', anchor='middle', px=True)
save(f, os.path.join(HERE, 'c4-norms.svg'), 'Elements of norm 1: a circle in ℂ, two lines in the dual numbers, a hyperbola in the split-complex numbers. Dashed: the non-zero elements of norm 0, which are zero divisors; ℂ has none.')

# 4. F_9: powers of g = 1 + x modulo 3 and x^2 + 1
def mul(u, v, p=3):
    a, b = u; c, d = v
    return ((a * c - b * d) % p, (a * d + b * c) % p)

powers = [(1, 0)]
for _ in range(8):
    powers.append(mul(powers[-1], (1, 1)))
assert powers[8] == (1, 0) and len(set(powers[:8])) == 8 and (0, 0) not in powers

f = Fig((-2.05, 2.05), (-1.5, 1.5), w=420, equal=True, pad=(10, 10, 10, 10))
names = {(1, 0): '1', (1, 1): '1 + x', (0, 2): '2x', (1, 2): '1 + 2x', (2, 0): '2', (2, 2): '2 + 2x', (0, 1): 'x', (2, 1): '2 + x'}
sup = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷']
f.circle((0, 0), 1, 'c5 dash')
for k in range(8):
    t0, t1 = k * math.pi / 4, (k + 1) * math.pi / 4
    f.arc((0, 0), 1, t0 + 0.13, t1 - 0.13, 'c2', arrow=True)
for k in range(8):
    th = k * math.pi / 4
    P = (math.cos(th), math.sin(th))
    f.point(P, 'p1', r=5.2)
    cx = math.cos(th)
    anchor = 'start' if cx > 0.3 else ('end' if cx < -0.3 else 'middle')
    L = (1.2 * math.cos(th), 1.2 * math.sin(th))
    dy = 5 if abs(math.sin(th)) < 0.3 else (-2 if math.sin(th) > 0 else 12)
    f.text(L, f'g{sup[k]} = {names[powers[k]]}', 'lab small t1' if k % 2 == 0 else 'lab small', dy=dy, anchor=anchor)
f.line((-1, 0), (1, 0), 'c5'); f.line((0, -1), (0, 1), 'c5')
f.text((0.42, 0.12), '×g', 'lab small t2', anchor='middle')
save(f, os.path.join(HERE, 'c4-f9.svg'), 'The eight non-zero complex numbers modulo 3, in the order of the powers of g = 1 + x. Each arrow multiplies by g; after eight steps the cycle returns to 1. g⁴ = 2 = −1 sits opposite 1, and the two square roots of −1, x and 2x, sit opposite each other.')
