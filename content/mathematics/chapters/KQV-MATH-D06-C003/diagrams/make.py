"""Diagrams for Complex Numbers Chapter 3. Run: python3 content/mathematics/chapters/KQV-MATH-D06-C003/diagrams/make.py"""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '../../../tools'))
from svgplot import Fig, save, fmt

def ilab(y):
    if y == 1: return 'i'
    if y == -1: return '−i'
    return f'{y}i'.replace('-', '−')

def plane(xr, yr, xt, yt, w=440, xl='Re', yl='Im', grid=True):
    f = Fig(xr, yr, w=w, equal=True)
    if grid:
        f.grid([x for x in range(math.ceil(xr[0]), math.floor(xr[1]) + 1) if x], [y for y in range(math.ceil(yr[0]), math.floor(yr[1]) + 1) if y])
    f.axes(xticks=xt, yticks=yt, yt=[ilab(y) for y in yt], xlabel=xl, ylabel=yl)
    return f

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

def hole(f, p, cls='c1', r=4.6):
    X, Y = f.P(p)
    f.add(f'<circle class="hole {cls}" cx="{fmt(X)}" cy="{fmt(Y)}" r="{r}"/>')

# 1. real and imaginary parts as coordinates; the conjugate as a reflection
f = plane((-0.7, 4.3), (-2.8, 2.8), [1, 2], [-2, -1, 1, 2])
f.line((3, 0), (3, 2), 'c3 dash'); f.line((0, 2), (3, 2), 'c2 dash'); f.line((3, 0), (3, -2), 'c5 dash')
f.arrow((0, 0), (3, 2), 'c1'); f.arrow((0, 0), (3, -2), 'c5')
f.point((3, 2), 'p1'); f.point((3, -2), 'p5')
f.point((3, 0), 'p3', r=3.6); f.point((0, 2), 'p2', r=3.6)
f.text((3, 2), 'z = 3 + 2i', 'lab t1', dx=8, dy=-6)
f.text((3, -2), 'z̄ = 3 − 2i', 'lab', dx=8, dy=16)
f.text((3, 0), 'Re z = 3', 'lab small t3', dx=6, dy=-8)
f.text((0, 2), 'Im z = 2', 'lab small t2', dx=8, dy=-8)
save(f, os.path.join(HERE, 'c3-parts.svg'), 'z = 3 + 2i drawn in the plane: its real part 3 is the horizontal coordinate and its imaginary part 2 the vertical one. The conjugate 3 − 2i is its mirror image in the real axis.')

# 2. z^2 = conj(z): the real-part curve and the imaginary-part lines cross at the four solutions
f = plane((-1.8, 2.1), (-1.45, 1.45), [2], [], grid=False)
f.circle((0, 0), 1, 'c5 dash')
# x^2 - y^2 = x  <=>  (x - 1/2)^2 - y^2 = 1/4 ; branches x = 1/2 +- cosh(t)/2, y = sinh(t)/2
branch(f, lambda t: (0.5 + math.cosh(t) / 2, math.sinh(t) / 2), -2.2, 2.2, 'c2')
branch(f, lambda t: (0.5 - math.cosh(t) / 2, math.sinh(t) / 2), -2.2, 2.2, 'c2')
f.line((f.x0, 0), (f.x1 - 0.12, 0), 'c3')
f.line((-0.5, f.y0), (-0.5, f.y1), 'c3')
s3 = math.sqrt(3) / 2
for p in [(0, 0), (1, 0), (-0.5, s3), (-0.5, -s3)]:
    f.point(p, 'p1', r=5)
f.text((0, 0), '0', 'lab t1', dx=-8, dy=16, anchor='end')
f.text((1, 0), '1', 'lab t1', dx=8, dy=16)
f.text((-0.5, s3), 'ω', 'lab t1', dx=10, dy=-6)
f.text((-0.5, -s3), 'ω²', 'lab t1', dx=10, dy=16)
f.text((1.36, 0.5), 'x² − y² = x', 'lab small t2')
f.text((-0.5, -1.36), 'x = −½', 'lab small t3', dx=8)
save(f, os.path.join(HERE, 'c3-zbar.svg'), 'The equation z squared equals z bar, split into parts. The real-part condition is a hyperbola, the imaginary-part condition is the pair of lines y = 0 and x = −1/2, and they cross at 0, 1, ω and ω².')

# 3. one condition gives a curve, two give points: Re z = 1 and |z| = 2
f = plane((-2.6, 2.9), (-2.5, 2.5), [], [-1, 1])
f.circle((0, 0), 2, 'c2')
f.line((1, f.y0), (1, f.y1), 'c3')
r3 = math.sqrt(3)
f.point((1, r3), 'p1', r=5); f.point((1, -r3), 'p1', r=5)
f.text((1, r3), '1 + i√3', 'lab t1', dx=10, dy=-6)
f.text((1, -r3), '1 − i√3', 'lab t1', dx=10, dy=18)
f.text((1, 2.25), 'Re z = 1', 'lab small t3', dx=8)
f.text((-1.62, 1.55), '|z| = 2', 'lab small t2', anchor='end')
save(f, os.path.join(HERE, 'c3-line-circle.svg'), 'The line Re z = 1 and the circle |z| = 2 are each a single real condition, so each is a curve. Together they are two conditions and meet in just two points, 1 + i√3 and 1 − i√3.')

# 4. square roots of 1 + 2i: x^2 - y^2 = 1 meets xy = 1
f = plane((-3.1, 3.1), (-2.5, 2.5), [-2, 2], [-2, -1, 1, 2], yl='')
f.text((0, f.y1), 'Im', 'lab m', dx=-8, dy=12, anchor='end')
branch(f, lambda t: (math.cosh(t), math.sinh(t)), -2.0, 2.0, 'c2')
branch(f, lambda t: (-math.cosh(t), math.sinh(t)), -2.0, 2.0, 'c2')
f.plot(lambda x: 1 / x if x > 0 else None, 'c3', a=0.05, b=f.x1)
f.plot(lambda x: 1 / x if x < 0 else None, 'c3', a=f.x0, b=-0.05)
phi = (1 + math.sqrt(5)) / 2
x0 = math.sqrt(phi); y0 = 1 / x0
f.point((x0, y0), 'p1', r=5); f.point((-x0, -y0), 'p1', r=5)
f.text((x0, y0), '1.272 + 0.786i', 'lab small t1', dx=-22, dy=18, anchor='end')
f.text((-x0, -y0), '−1.272 − 0.786i', 'lab small t1', dx=14, dy=-10)
f.text((3.0, -1.0), 'x² − y² = 1', 'lab small t2', anchor='end')
f.text((3.0, 0.62), 'xy = 1', 'lab small t3', anchor='end')
save(f, os.path.join(HERE, 'c3-hyperbolas.svg'), 'Solving z squared = 1 + 2i: the real part gives the hyperbola x² − y² = 1, the imaginary part gives the hyperbola xy = 1, and they cross at the two square roots, about ±(1.272 + 0.786i).')

# 5. number of solutions of z^2 + |z| + a = 0 as a function of a
def count(a):
    n = 0
    # real solutions: x^2 + |x| = -a
    if a == 0: n += 1
    elif a < 0: n += 2
    # purely imaginary, y != 0: |y|^2 - |y| - a = 0
    d = 1 + 4 * a
    if d >= 0:
        roots = {(1 + math.sqrt(d)) / 2, (1 - math.sqrt(d)) / 2}
        n += 2 * sum(1 for r in roots if r > 1e-12)
    return n

f = Fig((-0.62, 0.42), (0, 7.2), w=360, h=230, pad=(40, 14, 14, 30))
f.grid([], [2, 4, 6])
f.axes(xticks=[-0.5, -0.25, 0, 0.25], xt=['−½', '−¼', '0', '¼'], yticks=[2, 3, 4, 6], xlabel='a', ylabel='solutions', origin=(f.x0, 0))
f.line((0, 0), (0, 6.4), 'c5 dash'); f.line((-0.25, 0), (-0.25, 6.4), 'c5 dash')
q = -0.25
f.line((f.x0, count(-0.4)), (q, count(-0.4)), 'c1')
f.line((q, count(-0.1)), (0, count(-0.1)), 'c1')
f.line((0, count(0.2)), (f.x1 - 0.02, count(0.2)), 'c1')
for p in [(q, count(-0.4)), (q, count(-0.1)), (0, count(-0.1)), (0, count(0.2))]:
    hole(f, p)
f.point((q, count(q)), 'p1', r=5); f.point((0, count(0)), 'p1', r=5)
f.text((-0.44, 2), '2', 'lab small t1', dy=-9, anchor='middle')
f.text((q, 4), '4 at a = −¼', 'lab small t1', dx=9, dy=4)
f.text((-0.125, 6), '6', 'lab small t1', dy=17, anchor='middle')
f.text((0, 3), '3 at a = 0', 'lab small t1', dx=9, dy=4)
f.text((0.2, 2), '2', 'lab small t1', dy=-9, anchor='middle')
save(f, os.path.join(HERE, 'c3-count.svg'), 'The number of complex solutions of z² + |z| + a = 0 against a: 2 for a below −1/4, 4 at a = −1/4, 6 between −1/4 and 0, 3 at a = 0, and 2 for every positive a.')
