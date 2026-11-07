"""Diagrams for Complex Numbers Chapter 5. Run: python3 content/mathematics/chapters/KQV-MATH-D06-C005/diagrams/make.py"""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '../../../tools'))
from svgplot import Fig, save, fmt

def mul(z, w):
    return (z[0] * w[0] - z[1] * w[1], z[0] * w[1] + z[1] * w[0])

# 1. multiplying by z = (2, 1): the unit square is turned and stretched, but stays a square
Z = (2, 1)
square = [(0, 0), (1, 0), (1, 1), (0, 1)]
image = [mul(Z, p) for p in square]          # (0,0), (2,1), (1,3), (-1,2)
f = Fig((-1.8, 3.2), (-0.6, 3.5), w=440, equal=True)
f.grid([x for x in range(-1, 4) if x], [y for y in range(1, 4)])
f.axes(xticks=[2, 3], yticks=[2, 3], xlabel='', ylabel='')
f.path_pts(square, 'f3 poly', close=True); f.path_pts(square + [square[0]], 'c3')
f.path_pts(image, 'f1 poly', close=True); f.path_pts(image + [image[0]], 'c1')
f.arrow((0.5, 0.5), mul(Z, (0.5, 0.5)), 'c2 dash', head=8, shorten=6)
f.point(image[1], 'p1', r=4.6); f.point(image[3], 'p1', r=4.6); f.point(image[2], 'p1', r=4.6)
f.point((1, 0), 'p3', r=4.2); f.point((0, 1), 'p3', r=4.2)
f.text(image[1], 'z = 2 + i', 'lab t1', dx=8, dy=4)
f.text(image[3], 'zi = −1 + 2i', 'lab t1', dx=-8, dy=-8, anchor='end')
f.text(image[2], 'z(1 + i) = 1 + 3i', 'lab t1', dx=8, dy=-6)
f.text((1, 0), '1', 'lab small t3', dx=-3, dy=17)
f.text((0, 1), 'i', 'lab small t3', dx=-10, dy=4)
f.text((0.5, 0.22), 'unit square', 'lab small t3', dy=4, anchor='middle')
save(f, os.path.join(HERE, 'c5-square.svg'), 'The unit square with corners 0, 1, 1 + i and i, and its image after multiplying every point by z = 2 + i: the square with corners 0, 2 + i, 1 + 3i and −1 + 2i, turned and stretched by √5.')

# 2. odd degree forces a real root: chi(lam) = (lam - 1)(lam^2 + 1) = lam^3 - lam^2 + lam - 1
chi = lambda t: t**3 - t**2 + t - 1
root = 1.0
f = Fig((-1.6, 2.4), (-5.5, 5.5), w=440, h=300)
f.grid([-1, 1, 2], [-4, -2, 2, 4])
f.axes(xticks=[-1, 1, 2], yticks=[-4, 4], xlabel='λ', ylabel='χ(λ)')
f.plot(chi, 'c2')
f.point((root, 0), 'p1', r=5.5)
f.text((root, 0), 'λ₀: a real root', 'lab t1', dx=10, dy=-10)
f.text((-1.45, -4.6), 'χ → −∞ on the left', 'lab small t5')
f.text((2.35, 4.7), 'χ → +∞ on the right', 'lab small t5', anchor='end')
save(f, os.path.join(HERE, 'c5-cubic.svg'), 'The graph of a cubic characteristic polynomial, χ(λ) = λ³ − λ² + λ − 1. It is negative far to the left and positive far to the right, so it crosses the axis at a real root, here λ₀ = 1.')

# 3. the ladder of division algebras: R, C, H, O
f = Fig((0, 440), (0, 250), w=440, h=250, pad=(0, 0, 0, 0))
rungs = [('ℝ', '1', 'ordered', 'c3'), ('ℂ', '2', 'loses order', 'c3'), ('ℍ', '4', 'loses commutativity', 'c2'), ('𝕆', '8', 'loses associativity', 'c1')]
for k, (name, dim, note, tone) in enumerate(rungs):
    y = 214 - k * 58
    w = 96 + 30 * k
    x = 18
    f.rect(x, y - 22, w, 44, f'f3 {tone}', rx=10)
    f.text((x + 20, y + 8), name, f'lab big t{tone[1]}', px=True)
    f.text((x + 56, y + 6), f'dim {dim}', 'lab small t5', px=True)
    f.text((x + w + 16, y + 5), note, 'lab t5', px=True)
    if k:
        f.add(f'<line class="c5" x1="{x + 30}" y1="{y + 22}" x2="{x + 30}" y2="{y + 36}"/>')
f.text((430, 238), 'dimension 3, 5, 6, 7…: impossible', 'lab small t5', anchor='end', px=True)
save(f, os.path.join(HERE, 'c5-ladder.svg'), 'The four real number systems in which you can always divide and which have a multiplicative norm: ℝ of dimension 1, ℂ of dimension 2 (no order), ℍ of dimension 4 (not commutative) and 𝕆 of dimension 8 (not associative).')
