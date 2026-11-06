"""Diagrams for Complex Numbers Chapter 1. Run: python3 content/mathematics/chapters/KQV-MATH-D06-C001/diagrams/make.py"""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '../../../tools'))
from svgplot import Fig, save

# 1. Nested number systems, each forced by an equation
f = Fig((0, 1), (0, 1), w=440, h=300, pad=(0, 0, 0, 0))
boxes = [('ℂ', 'x² = −1:  ±i', 'c2', 'f2'), ('ℝ', 'x² = 2:  ±√2', 'c3', 'f3'), ('ℚ', '3x = 2:  2/3', 'c4', 'f3'), ('ℤ', 'x + 5 = 2:  −3', 'c1', 'f1'), ('ℕ', '0, 1, 2, 3, …', 'c1', 'f1')]
for k, (name, eq, c, fill) in enumerate(boxes):
    x, y = 10 + k * 30, 10 + k * 34
    w, h = 420 - k * 60, 280 - k * 54
    f.rect(x, y, w, h, f'{fill} {c}', rx=14)
    f.text((x + 14, y + 26), name, f'lab big t{ {"c1": 1, "c2": 2, "c3": 3, "c4": 4}[c] }', px=True)
    f.text((x + w - 12, y + 24), eq, 'lab small', anchor='end', px=True)
save(f, os.path.join(HERE, 'c1-systems.svg'), 'Nested number systems N inside Z inside Q inside R inside C, each labelled with an equation that forced the next one.')

# 2. y = x^2 + 1 never meets the axis; y = x^2 - 1 does
f = Fig((-2.6, 2.6), (-1.6, 5.2), w=440, h=300)
f.grid([-2, -1, 1, 2], [1, 2, 3, 4, 5])
f.axes(xticks=[-2, -1, 1, 2], yticks=[1, 2, 3, 4], xlabel='x', ylabel='y')
f.plot(lambda x: x * x + 1, 'c1')
f.plot(lambda x: x * x - 1, 'c3 dash')
f.point((0, 1), 'p1')
for r in (-1, 1): f.point((r, 0), 'p3', r=3.6)
f.text((0.15, 3.4), 'y = x² + 1', 'lab t1')
f.text((1.3, -1.2), 'y = x² − 1', 'lab t3')
f.text((1.08, -0.45), 'roots ±1', 'lab t3')
save(f, os.path.join(HERE, 'c1-parabolas.svg'), 'The parabola y = x squared plus 1 stays above the x-axis, so it has no real root; y = x squared minus 1 crosses at plus and minus 1.')

# 3. Bombelli's cubic: three real roots, local max above and local min below the axis
g = lambda x: x ** 3 - 15 * x - 4
s = math.sqrt(5)
f = Fig((-4.6, 5.0), (-36, 36), w=440, h=320)
f.grid(range(-4, 5), range(-30, 31, 10))
f.axes(xticks=[], yticks=[-30, -20, -10, 10, 20, 30], xlabel='x', ylabel='y')
f.plot(g, 'c1')
for r in (4, -2 + math.sqrt(3), -2 - math.sqrt(3)): f.point((r, 0), 'p1', r=4.6)
f.text((4, 0), '4', 'lab t1', dx=7, dy=18)
f.text((-2 + math.sqrt(3), 0), '−2 + √3', 'lab t1', dx=-6, dy=18, anchor='end')
f.text((-2 - math.sqrt(3), 0), '−2 − √3', 'lab t1', dx=6, dy=18)
f.point((-s, g(-s)), 'p2', r=4); f.text((-s, g(-s)), 'local max > 0', 'lab t2', dy=-12, anchor='middle')
f.point((s, g(s)), 'p2', r=4); f.text((s, g(s)), 'local min < 0', 'lab t2', dy=22, anchor='middle')
f.text((-4.4, 33), 'y = x³ − 15x − 4', 'lab t1')
save(f, os.path.join(HERE, 'c1-bombelli.svg'), 'Graph of x cubed minus 15x minus 4. It crosses the axis three times, at 4 and minus 2 plus or minus root 3, because its local maximum is positive and its local minimum is negative.')

# 4. The three cases of a depressed cubic: R > 0, R = 0, R < 0
f = Fig((0, 1), (0, 1), w=440, h=170, pad=(0, 0, 0, 0))
panels = [('R > 0: one real root', lambda y: y ** 3 + 2 * y - 3, 'y³ + 2y − 3'), ('R = 0: a repeated root', lambda y: y ** 3 - 3 * y + 2, 'y³ − 3y + 2'), ('R < 0: three real roots', lambda y: y ** 3 - 3 * y + 1, 'y³ − 3y + 1')]
for k, (title, fn, lab) in enumerate(panels):
    x0 = 6 + k * 146
    f.rect(x0, 6, 136, 158, 'f3 c5', rx=10)
    sub = Fig((-2.6, 2.6), (-5, 5), w=136, h=110, pad=(6, 6, 6, 6))
    sub.axes(xlabel='', ylabel='')
    sub.plot(fn, 'c1')
    inner = sub.svg(title, f'c1-cases-{k}').replace('<svg viewBox=', f'<svg x="{x0}" y="28" width="136" height="110" viewBox=', 1)
    f.add(inner.replace(' role="img"', '').replace(' xmlns="http://www.w3.org/2000/svg"', ''))
    f.text((x0 + 68, 22), title, 'lab small', anchor='middle', px=True)
    f.text((x0 + 68, 156), lab, 'lab small t1', anchor='middle', px=True)
save(f, os.path.join(HERE, 'c1-cases.svg'), 'Three depressed cubics. When R is positive the graph crosses once, when R is zero it touches the axis at a repeated root, and when R is negative it crosses three times.')

# 5. Bombelli's cube roots 2 + i and 2 - i add to 4 (a first look at the complex plane)
f = Fig((-0.6, 4.8), (-1.8, 1.8), w=440, h=200, equal=True)
f.grid([1, 2, 3, 4], [-1, 1])
f.axes(xticks=[1, 2, 3, 4], yticks=[-1, 1], yt=['−i', 'i'], xlabel='real', ylabel='imaginary')
f.arrow((0, 0), (2, 1), 'c2'); f.arrow((0, 0), (2, -1), 'c3'); f.arrow((0, 0), (4, 0), 'c1')
f.line((2, 1), (4, 0), 'c5 dash'); f.line((2, -1), (4, 0), 'c5 dash')
f.text((2, 1), '2 + i', 'lab t2', dx=4, dy=-8); f.text((2, -1), '2 − i', 'lab t3', dx=4, dy=18)
f.text((4, 0), '4', 'lab t1', dx=6, dy=-8)
save(f, os.path.join(HERE, 'c1-sum.svg'), 'In the complex plane, 2 plus i and 2 minus i are mirror images across the real axis; adding them as arrows gives the real number 4.')

# 6. Mutually unbiased bases in R^2: Z (0 and 90 degrees) and X (45 and 135 degrees); nothing is 45 degrees from both
f = Fig((-1.5, 1.5), (-0.42, 1.3), w=440, equal=True)
f.arc((0, 0), 1, 0, math.pi, 'c5 dash')
f.line((-1.2, 0), (1.2, 0), 'c5')
for a, cls in ((0, 'c3'), (90, 'c3'), (45, 'c1'), (135, 'c1')):
    t = math.radians(a)
    f.arrow((0, 0), (math.cos(t), math.sin(t)), cls)
f.text((1, 0), 'Z: 0°', 'lab t3', dx=2, dy=-10)
f.text((0, 1), 'Z: 90°', 'lab t3', dx=8, dy=-2)
f.text((math.cos(math.pi / 4), math.sin(math.pi / 4)), 'X: 45°', 'lab t1', dx=6, dy=-4)
f.text((math.cos(3 * math.pi / 4), math.sin(3 * math.pi / 4)), 'X: 135°', 'lab t1', dx=-6, dy=-4, anchor='end')
f.arc((0, 0), 0.32, 0, math.pi / 4, 'c5')
f.text((0.36, 0.13), '45°', 'lab small', dx=4)
f.text((0, -0.3), 'A third basis would need to sit 45° from both: impossible.', 'lab small', anchor='middle')
save(f, os.path.join(HERE, 'c1-mub.svg'), 'In the real plane, the Z basis at 0 and 90 degrees and the X basis at 45 and 135 degrees are unbiased; no third pair of directions is 45 degrees away from both.')
print('ok')
