"""Diagrams for Chapter 0. Run: python3 content/mathematics/chapters/KQV-MATH-CH000/diagrams/make.py"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '../../../tools'))
from svgplot import Fig, save

# Problem 1: two printing shops, A(n) = 40 + 2n and B(n) = 3n, equal at n = 40
f = Fig((0, 100), (0, 320), w=440, h=290)
f.grid(range(20, 101, 20), range(50, 301, 50))
f.axes(xticks=range(20, 101, 20), yticks=range(100, 301, 100), xlabel='pages n', ylabel='cost (₹)')
f.plot(lambda n: 40 + 2 * n, 'c1', a=0, b=100)
f.plot(lambda n: 3 * n, 'c3', a=0, b=100)
f.line((40, 0), (40, 120), 'c5 dash')
f.point((40, 120), 'p1')
f.text((40, 120), 'both ₹120 at 40 pages', 'lab', dx=-8, dy=-12, anchor='end')
f.text((99, 168), 'A(n) = 40 + 2n', 'lab t1', anchor='end')
f.text((88, 3 * 88), 'B(n) = 3n', 'lab t3', dx=-6, dy=-6, anchor='end')
f.text((20, 12), 'B is cheaper', 'lab t5')
f.text((56, 92), 'A is cheaper', 'lab t5')
save(f, os.path.join(HERE, 'c0-shops.svg'), 'Costs of two printing shops against number of pages; the lines cross at 40 pages and 120 rupees.')

# Problem 2: area l(10 - l) for perimeter 20, maximum 25 at l = 5
f = Fig((0, 10.6), (0, 30), w=440, h=290, pad=(34, 14, 14, 40))
f.grid(range(1, 11), range(5, 31, 5))
f.axes(xticks=range(0, 11, 2), yticks=range(5, 31, 5), xlabel='length l (m)', ylabel='area', xlabel_dy=30)
f.plot(lambda l: l * (10 - l), 'c1', a=0, b=10)
for l in (1, 3):
    f.point((l, l * (10 - l)), 'p3', r=3.6)
    f.text((l, l * (10 - l)), f'{l} × {10 - l} = {l * (10 - l)}', 'lab t3', dx=10, dy=24)
f.point((5, 25), 'p1', r=5)
f.line((5, 0), (5, 25), 'c5 dash')
f.text((5, 25), 'square 5 × 5: area 25', 'lab t1', dx=0, dy=-12, anchor='middle')
f.text((7.4, 12), 'A = 25 − (l − 5)²', 'lab', anchor='middle')
save(f, os.path.join(HERE, 'c0-area.svg'), 'Area of a rectangle with perimeter 20 metres against its length; the parabola peaks at 25 when the length is 5.')

# Problem 3: d(t) = t^2; secant lines from t = 2 approach the tangent of slope 4
f = Fig((0, 3.3), (0, 10.5), w=440, h=300)
f.grid([1, 2, 3], range(2, 11, 2))
f.axes(xticks=[1, 2, 3], yticks=range(2, 11, 2), xlabel='time t (s)', ylabel='distance d (m)')
f.plot(lambda t: t * t, 'c1', a=0, b=3.25)
for h, cls in ((1, 'c2'), (0.5, 'c2 dash'), (0.15, 'c3 dash')):
    m = 4 + h
    f.plot(lambda t, m=m: 4 + m * (t - 2), cls, a=1.1, b=3.25)
    f.point((2 + h, (2 + h) ** 2), 'p2', r=3.2)
f.plot(lambda t: 4 + 4 * (t - 2), 'c4', a=1.0, b=3.25)
f.point((2, 4), 'p1', r=5)
f.text((2, 4), '(2, 4)', 'lab', dx=8, dy=16)
f.text((0.15, 8.4), 'secant, h = 1: slope 5', 'lab t2')
f.text((0.15, 7.5), 'secant, h = 0.15: slope 4.15', 'lab t3')
f.text((0.15, 6.6), 'tangent: slope 4', 'lab t4')
save(f, os.path.join(HERE, 'c0-speed.svg'), 'Distance t squared against time. Secant lines from t = 2 with slopes 5, 4.5 and 4.15 approach the tangent line of slope 4.')
print('ok')
