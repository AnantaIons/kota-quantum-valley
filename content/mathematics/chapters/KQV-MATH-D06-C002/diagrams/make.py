"""Diagrams for Complex Numbers Chapter 2. Run: python3 content/mathematics/chapters/KQV-MATH-D06-C002/diagrams/make.py"""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '../../../tools'))
from svgplot import Fig, save

def plane(xr, yr, xt, yt, w=440, xl='Re', yl='Im'):
    f = Fig(xr, yr, w=w, equal=True)
    f.grid([x for x in range(math.ceil(xr[0]), math.floor(xr[1]) + 1) if x], [y for y in range(math.ceil(yr[0]), math.floor(yr[1]) + 1) if y])
    f.axes(xticks=xt, yticks=yt, yt=[(f'{y}i' if y not in (1, -1) else ('i' if y == 1 else '−i')).replace('-', '−') for y in yt], xlabel=xl, ylabel=yl)
    return f

# 1. addition as arrows: (2 + i) + (1 + 3i) = 3 + 4i
f = plane((-0.6, 4.4), (-0.6, 4.6), [1, 2, 3, 4], [1, 2, 3, 4])
f.arrow((0, 0), (2, 1), 'c2'); f.arrow((0, 0), (1, 3), 'c3'); f.arrow((0, 0), (3, 4), 'c1')
f.arrow((2, 1), (3, 4), 'c3 dash'); f.arrow((1, 3), (3, 4), 'c2 dash')
f.point((3, 4), 'p1'); f.point((2, 1), 'p2'); f.point((1, 3), 'p3')
f.text((2, 1), 'z = 2 + i', 'lab t2', dx=8, dy=12); f.text((1, 3), 'w = 1 + 3i', 'lab t3', dx=-8, dy=-8, anchor='end')
f.text((3, 4), 'z + w = 3 + 4i', 'lab t1', dx=-10, dy=-10, anchor='end')
save(f, os.path.join(HERE, 'c2-add.svg'), 'The arrows for 2 plus i and 1 plus 3i, placed head to tail, end at 3 plus 4i, the corner of their parallelogram.')

# 2. multiplication by i: z, iz, -z, -iz form a square
f = plane((-3.8, 3.8), (-3.6, 3.6), [-3, 3], [-3, 3])
pts = [(3, 1), (-1, 3), (-3, -1), (1, -3)]
names = ['z = 3 + i', 'iz = −1 + 3i', 'i²z = −3 − i', 'i³z = 1 − 3i']
f.path_pts(pts + [pts[0]], 'c5 dash')
for k, (p, n) in enumerate(zip(pts, names)):
    f.arrow((0, 0), p, ['c1', 'c2', 'c3', 'c4'][k]); f.point(p, ['p1', 'p2', 'p3', 'p4'][k])
for (p, n, dx, dy, a) in [((3, 1), names[0], 8, -6, 'start'), ((-1, 3), names[1], -8, -4, 'end'), ((-3, -1), names[2], -8, 18, 'end'), ((1, -3), names[3], 8, 14, 'start')]:
    f.text(p, n, 'lab', dx=dx, dy=dy, anchor=a)
r = math.hypot(3, 1); a0 = math.atan2(1, 3)
f.arc((0, 0), 1.3, a0 + 0.12, a0 + math.pi / 2 - 0.12, 'c5', arrow=True)
f.text((0.55, 1.25), '×i', 'lab small', anchor='middle')
save(f, os.path.join(HERE, 'c2-rot.svg'), 'Multiplying by i turns z = 3 + i a quarter turn to −1 + 3i; repeating gives −3 − i and 1 − 3i, the corners of a square, and a fourth turn returns to z.')

# 3. spiral of (1 + i)^n, n = 0..7
f = plane((-5.6, 9.4), (-9.0, 3.4), [-4, 4, 8], [-8, -4, 2], w=440)
z = complex(1, 0); prev = None; pts = []
for n in range(8):
    pts.append((z.real, z.imag)); z *= complex(1, 1)
f.path_pts(pts, 'c2')
for n, p in enumerate(pts):
    f.point(p, 'p1' if abs(p[1]) < 1e-9 else 'p2', r=4.4)
lab = {0: ('1', 6, 16, 'start'), 1: ('1 + i', 6, -6, 'start'), 2: ('2i', 6, -6, 'start'), 3: ('−2 + 2i', -6, -6, 'end'), 4: ('(1 + i)⁴ = −4', -6, 18, 'end'), 5: ('−4 − 4i', -8, 6, 'end'), 6: ('−8i', -8, 6, 'end'), 7: ('8 − 8i', 8, 6, 'start')}
for n, (s, dx, dy, a) in lab.items():
    f.text(pts[n], s, 'lab small' + (' t1' if n in (0, 4) else ''), dx=dx, dy=dy, anchor=a)
f.text((8.9, 0.4), 'n = 8: 16', 'lab small t1', anchor='end')
f.arrow((8, -8), (8.9, -0.3), 'c1 dash')
save(f, os.path.join(HERE, 'c2-spiral.svg'), 'The powers of 1 plus i for n from 0 to 7 spiral outwards, turning an eighth of a turn each time; every fourth power is real: −4, then 16.')

# 4. cube roots of unity
f = plane((-1.6, 1.6), (-1.25, 1.25), [-1, 1], [], w=420)
th = [0, 2 * math.pi / 3, 4 * math.pi / 3]
P = [(math.cos(t), math.sin(t)) for t in th]
f.circle((0, 0), 1, 'c5 dash')
f.path_pts(P + [P[0]], 'c2')
for p in P: f.arrow((0, 0), p, 'c1')
f.point((0, 0), 'p5', r=3)
f.text(P[0], '1', 'lab t1', dx=8, dy=-6)
f.text(P[1], 'ω = (−1 + i√3)/2', 'lab t1', dx=-6, dy=-8, anchor='end')
f.text(P[2], 'ω² = (−1 − i√3)/2', 'lab t1', dx=-6, dy=18, anchor='end')
f.text((0, 0), '1 + ω + ω² = 0', 'lab small', dx=8, dy=16)
save(f, os.path.join(HERE, 'c2-omega.svg'), 'The cube roots of 1, namely 1, ω and ω², lie on the unit circle at the corners of an equilateral triangle centred at 0.')

# 5. Gaussian integer lattice with norm circles 5 and 25
f = Fig((-5.8, 5.8), (-5.8, 5.8), w=420, equal=True)
for x in range(-5, 6):
    for y in range(-5, 6):
        f.point((x, y), 'p5', r=1.4)
f.axes(xticks=[-5, 5], yticks=[-5, 5], yt=['−5i', '5i'], xlabel='Re', ylabel='Im')
f.circle((0, 0), math.sqrt(5), 'c2'); f.circle((0, 0), 5, 'c3')
for x in range(-5, 6):
    for y in range(-5, 6):
        n = x * x + y * y
        if n == 5: f.point((x, y), 'p2', r=4)
        if n == 25: f.point((x, y), 'p3', r=4)
f.point((2, 1), 'p1', r=5.5); f.point((2, -1), 'p1', r=5.5)
f.text((2, 1), '2 + i', 'lab t1', dx=8, dy=-6); f.text((2, -1), '2 − i', 'lab t1', dx=8, dy=16)
f.text((-1.65, 1.65), 'N = 5', 'lab small t2', dx=-4, dy=-4, anchor='end')
f.text((-3.6, 3.6), 'N = 25', 'lab small t3', dx=-4, dy=-4, anchor='end')
save(f, os.path.join(HERE, 'c2-lattice.svg'), 'Gaussian integers as lattice points. Eight lie on the circle of norm 5 and twelve on the circle of norm 25; 2 + i and 2 − i are highlighted.')
print('ok')
