"""Drawings for the Great Minds page: each person's best-known idea, drawn stroke by stroke in code.
No photograph is used. Run: python3 scripts/minds-portraits.py  ->  src/data/minds-art.json

Each drawing is the inside of an <svg viewBox="0 0 200 220">. The page supplies the shared <defs>
(hatch patterns mh-g, mh-v, mh-c, a halo gradient and the pencil filters msk-a, msk-b) and the colours,
through the CSS classes in src/components/MindsArt.astro:
  g.ml gold line (drawn twice: g.ml2 is a looser pencil pass), g.mv violet, g.mc cobalt, g.mt thin gold;
  .hg .hv .hc hatched fills; text classes mtxt (formula), mbig (large), mlab (label), mtick (small mono);
  mdot gold dots, mstar pale dots, mhead violet arrow heads."""
import json, math, os

def f(v):
    return f'{v:.1f}'.rstrip('0').rstrip('.')

def P(*pts):
    return ' '.join(p if isinstance(p, str) else f'{f(p[0])} {f(p[1])}' for p in pts)

def poly(pts, close=False):
    return P('M', pts[0], *[x for p in pts[1:] for x in ('L', p)]) + (' Z' if close else '')

def circle(cx, cy, r):
    return P('M', (cx - r, cy), 'a', (r, r), '0 1 0', (2 * r, 0), 'a', (r, r), '0 1 0', (-2 * r, 0))

def ellipse(cx, cy, rx, ry):
    return P('M', (cx - rx, cy), 'a', (rx, ry), '0 1 0', (2 * rx, 0), 'a', (rx, ry), '0 1 0', (-2 * rx, 0))

def curve(fn, t0, t1, n=80):
    return poly([fn(t0 + (t1 - t0) * k / n) for k in range(n + 1)])

def wave(x0, x1, y, amp, periods, phase=0.0):
    return curve(lambda t: (x0 + (x1 - x0) * t, y - amp * math.sin(2 * math.pi * periods * t + phase)), 0, 1, 120)

class D:
    """One drawing: lists of paths by colour, plus extra markup (text, dots, arrow heads)."""
    def __init__(self):
        self.gold, self.thin, self.violet, self.cobalt, self.fills, self.extra = [], [], [], [], [], []
    def arrow(self, a, b, group='violet', head=7):
        getattr(self, group).append(P('M', a, 'L', b))
        dx, dy = b[0] - a[0], b[1] - a[1]
        L = math.hypot(dx, dy) or 1
        ux, uy = dx / L, dy / L
        bx, by = b[0] - ux * head, b[1] - uy * head
        hw = head * 0.5
        self.extra.append(f'<path class="mhead" d="{poly([b, (bx - uy * hw, by + ux * hw), (bx + uy * hw, by - ux * hw)], True)}"/>')
    def text(self, x, y, s, cls='mlab', anchor='middle'):
        self.extra.append(f'<text class="{cls}" x="{f(x)}" y="{f(y)}" text-anchor="{anchor}">{s}</text>')
    def dot(self, x, y, r=3.2, cls='mdot'):
        self.extra.append(f'<circle class="{cls}" cx="{f(x)}" cy="{f(y)}" r="{f(r)}"/>')
    def caption(self, s):
        self.text(100, 206, s, 'mtxt')
    def svg(self):
        g = lambda ps: ''.join(f'<path d="{d}"/>' for d in ps)
        fills = ''.join(f'<path class="{c}" d="{d}"/>' for c, d in self.fills)
        return (f'<circle class="mhalo" cx="100" cy="104" r="88"/><g class="mfill">{fills}</g>'
                f'<g class="mv">{g(self.violet)}</g><g class="mc">{g(self.cobalt)}</g><g class="mt">{g(self.thin)}</g>'
                f'<g class="ml">{g(self.gold)}</g><g class="ml2">{g(self.gold)}</g>{"".join(self.extra)}')

# ---------------------------------------------------------------- the drawings, in order of birth
def aristotle():
    d = D()
    d.gold.append(ellipse(100, 98, 78, 66)); d.violet.append(ellipse(92, 104, 52, 44)); d.cobalt.append(ellipse(84, 110, 26, 22))
    d.fills.append(('hc', ellipse(84, 110, 26, 22)))
    d.text(158, 52, 'C', 'mbig'); d.text(130, 82, 'B', 'mbig'); d.text(84, 117, 'A', 'mbig')
    d.caption('A inside B, B inside C ⇒ A inside C')
    return d.svg()

def euclid():
    d = D()
    A, B = (72, 120), (128, 120)
    r = 56
    d.gold += [circle(*A, r), circle(*B, r)]
    C = (100, 120 - r * math.sqrt(3) / 2)
    d.violet.append(poly([A, B, C], True)); d.fills.append(('hv', poly([A, B, C], True)))
    for (x, y), s, dx, dy in ((A, 'A', -10, 16), (B, 'B', 10, 16), (C, 'C', 0, -9)):
        d.dot(x, y); d.text(x + dx, y + dy, s, 'mlab')
    d.caption('Elements, Book I, Proposition 1')
    return d.svg()

def archimedes():
    d = D()
    d.gold += [ellipse(100, 50, 48, 12), P('M', (52, 50), 'L', (52, 166)), P('M', (148, 50), 'L', (148, 166)),
               P('M', (52, 166), 'A', (48, 12), '0 0 0', (148, 166)), circle(100, 108, 48)]
    d.violet += [P('M', (52, 108), 'A', (48, 12), '0 0 0', (148, 108)), P('M', (100, 60), 'A', (14, 48), '0 0 0', (100, 156))]
    d.cobalt.append(P('M', (52, 166), 'A', (48, 12), '0 0 1', (148, 166)))
    d.fills += [('hc', P('M', (124, 66), 'A', (48, 48), '0 0 1', (124, 150), 'A', (30, 48), '0 0 0', (124, 66), 'Z')),
                ('hv', poly([(132, 58), (148, 54), (148, 166), (132, 172)], True))]
    d.caption('sphere : cylinder = 2 : 3')
    return d.svg()

def aryabhata():
    d = D()
    d.gold += [circle(100, 100, 46), P('M', (40, 66), 'C', (20, 106), (60, 166), (110, 156)), P('M', (160, 136), 'C', (180, 96), (150, 46), (96, 46))]
    d.violet += [ellipse(100, 100, 46, 14), P('M', (100, 54), 'A', (18, 46), '0 0 0', (100, 146)), P('M', (100, 54), 'A', (36, 46), '0 0 1', (100, 146)),
                 ellipse(100, 76, 42, 10), ellipse(100, 124, 42, 10)]
    d.fills.append(('hc', P('M', (100, 54), 'A', (46, 46), '0 0 1', (100, 146), 'A', (24, 46), '0 0 0', (100, 54), 'Z')))
    d.extra += [f'<path class="mhead" d="{P("M", (110, 156), "l", (-9, -6), "l", (1, 10), "z")}"/>', f'<path class="mhead" d="{P("M", (96, 46), "l", (9, 6), "l", (-1, -10), "z")}"/>']
    for x, y in ((30, 36), (172, 32), (164, 172), (34, 164), (186, 88), (16, 116)):
        d.dot(x, y, 1.6, 'mstar')
    d.caption('the Earth turns; π ≈ 3.1416')
    return d.svg()

def brahmagupta():
    d = D()
    outer = P('M', (100, 40), 'C', (138, 40), (146, 80), (146, 98), 'C', (146, 124), (130, 154), (100, 154), 'C', (70, 154), (54, 124), (54, 98), 'C', (54, 74), (66, 40), (100, 40), 'Z')
    inner = P('M', (100, 52), 'C', (126, 52), (132, 82), (132, 98), 'C', (132, 120), (122, 142), (100, 142), 'C', (78, 142), (68, 120), (68, 98), 'C', (68, 78), (76, 52), (100, 52), 'Z')
    inner_rev = P('M', (100, 52), 'C', (76, 52), (68, 78), (68, 98), 'C', (68, 120), (78, 142), (100, 142), 'C', (122, 142), (132, 120), (132, 98), 'C', (132, 82), (126, 52), (100, 52), 'Z')
    d.gold += [outer, inner]; d.fills.append(('hg', outer + ' ' + inner_rev))
    d.cobalt.append(P('M', (24, 172), 'L', (176, 172)))
    for k, n in enumerate(['−3', '−2', '−1', '0', '1', '2', '3']):
        x = 28 + 24 * k
        d.cobalt.append(P('M', (x, 167), 'L', (x, 177))); d.text(x, 190, n, 'mtick')
    d.caption('a − a = 0')
    return d.svg()

def al_khwarizmi():
    d = D()
    x0, y0, s, t = 56, 44, 60, 30      # the x-by-x square and strips 5 wide (scaled)
    d.gold.append(poly([(x0, y0), (x0 + s, y0), (x0 + s, y0 + s), (x0, y0 + s)], True)); d.fills.append(('hg', poly([(x0, y0), (x0 + s, y0), (x0 + s, y0 + s), (x0, y0 + s)], True)))
    d.violet += [poly([(x0 + s, y0), (x0 + s + t, y0), (x0 + s + t, y0 + s), (x0 + s, y0 + s)], True), poly([(x0, y0 + s), (x0 + s, y0 + s), (x0 + s, y0 + s + t), (x0, y0 + s + t)], True)]
    d.fills += [('hv', poly([(x0 + s, y0), (x0 + s + t, y0), (x0 + s + t, y0 + s), (x0 + s, y0 + s)], True))]
    d.cobalt.append(poly([(x0 + s, y0 + s), (x0 + s + t, y0 + s), (x0 + s + t, y0 + s + t), (x0 + s, y0 + s + t)], True))
    d.thin.append(P('M', (x0 + s + 2, y0 + s + 2), 'L', (x0 + s + t - 2, y0 + s + t - 2)))
    d.text(x0 + s / 2, y0 + s / 2 + 6, 'x²', 'mbig'); d.text(x0 + s + t / 2, y0 + s / 2 + 4, '5x', 'mlab'); d.text(x0 + s / 2, y0 + s + t / 2 + 4, '5x', 'mlab')
    d.text(x0 + s + t / 2, y0 + s + t / 2 + 4, '25', 'mlab')
    d.caption('x² + 10x + 25 = 64, so x = 3')
    return d.svg()

def ibn_al_haytham():
    d = D()
    d.gold.append(poly([(96, 52), (176, 52), (176, 152), (96, 152)], True))
    d.gold.append(P('M', (96, 52), 'L', (96, 96), 'M', (96, 108), 'L', (96, 152)))      # wall with a pinhole
    d.cobalt.append(P('M', (34, 72), 'L', (34, 136)))
    d.extra.append(f'<path class="mhead" d="{poly([(34, 64), (28, 76), (40, 76)], True)}"/>')            # the object: an upright arrow
    d.violet += [P('M', (34, 72), 'L', (166, 132)), P('M', (34, 136), 'L', (166, 72))]
    d.cobalt.append(P('M', (166, 72), 'L', (166, 132)))
    d.extra.append(f'<path class="mhead" d="{poly([(166, 140), (160, 128), (172, 128)], True)}"/>')       # the image: upside down
    d.fills.append(('hc', poly([(96, 52), (176, 52), (176, 152), (96, 152)], True)))
    d.text(34, 160, 'object', 'mlab'); d.text(136, 170, 'image, upside down', 'mlab')
    d.caption('light travels in straight lines')
    return d.svg()

def madhava():
    d = D()
    d.thin.append(P('M', (24, 160), 'L', (182, 160)))
    target = 104
    d.cobalt.append(P('M', (24, target), 'L', (182, target)))
    s, pts = 0.0, []
    for k in range(9):
        s += (-1) ** k / (2 * k + 1)
        pts.append((36 + k * 17, 160 - s / (math.pi / 4) * (160 - target)))
    d.gold.append(poly(pts))
    for x, y in pts: d.dot(x, y, 2.8)
    d.text(178, target - 8, 'π/4', 'mlab', 'end')
    d.caption('π/4 = 1 − 1/3 + 1/5 − 1/7 + …')
    return d.svg()

def copernicus():
    d = D()
    d.gold.append(circle(100, 100, 12)); d.fills.append(('hg', circle(100, 100, 12)))
    for k in range(12):
        a = k * math.pi / 6
        d.thin.append(P('M', (100 + 16 * math.cos(a), 100 + 16 * math.sin(a)), 'L', (100 + 22 * math.cos(a), 100 + 22 * math.sin(a))))
    for r, a, grp, lab in ((36, 2.2, 'cobalt', ''), (56, 0.5, 'violet', 'Earth'), (78, 3.9, 'cobalt', '')):
        getattr(d, grp).append(circle(100, 100, r))
        x, y = 100 + r * math.cos(a), 100 - r * math.sin(a)
        d.dot(x, y, 4.2 if lab else 3.4)
        if lab: d.text(x + 6, y - 8, lab, 'mlab', 'start')
    d.caption('the Sun at the centre')
    return d.svg()

def galileo():
    d = D()
    A, B = (26, 52), (178, 160)
    d.gold.append(poly([A, B, (26, 160)], True)); d.fills.append(('hc', poly([A, B, (26, 160)], True)))
    L = math.hypot(B[0] - A[0], B[1] - A[1]); ux, uy = (B[0] - A[0]) / L, (B[1] - A[1]) / L
    prev = 0
    for k, dist in enumerate((0, 1, 4, 9, 16)):
        t = dist / 16 * (L - 12) + 6
        x, y = A[0] + ux * t - uy * 8, A[1] + uy * t + ux * 8 - 16
        d.dot(A[0] + ux * t, A[1] + uy * t - 6, 4.4)
        if k:
            mx = A[0] + ux * (prev + t) / 2
            my = A[1] + uy * (prev + t) / 2
            d.text(mx + 4, my - 14, str(2 * k - 1), 'mlab')
        prev = t
    d.caption('1 : 3 : 5 : 7 in equal times, d ∝ t²')
    return d.svg()

def kepler():
    d = D()
    a, b = 70, 48
    c = math.sqrt(a * a - b * b)
    cx, cy = 100, 100
    fx = cx + c
    d.gold.append(ellipse(cx, cy, a, b))
    pt = lambda th: (cx + a * math.cos(th), cy - b * math.sin(th))
    for t0, t1, cls in ((-0.35, 0.35, 'hv'), (2.62, 3.66, 'hc')):
        arc = [pt(t0 + (t1 - t0) * k / 20) for k in range(21)]
        d.fills.append((cls, poly([(fx, cy)] + arc, True)))
        d.violet.append(poly([(fx, cy)] + arc + [(fx, cy)]))
    d.dot(fx, cy, 6); d.text(fx, cy + 22, 'Sun', 'mlab')
    d.caption('equal areas in equal times; T² ∝ a³')
    return d.svg()

def descartes():
    d = D()
    O, s = (88, 112), 13
    d.thin += [P('M', (18, O[1]), 'L', (182, O[1])), P('M', (O[0], 30), 'L', (O[0], 186))]
    d.gold.append(circle(O[0], O[1], 5 * s))
    px, py = O[0] + 3 * s, O[1] - 4 * s
    d.violet += [P('M', (px, py), 'L', (px, O[1])), P('M', (px, py), 'L', (O[0], py)), P('M', O, 'L', (px, py))]
    d.dot(px, py, 4.2); d.text(px + 8, py - 6, '(3, 4)', 'mlab', 'start')
    d.text(178, O[1] - 6, 'x', 'mlab'); d.text(O[0] + 8, 36, 'y', 'mlab', 'start')
    d.caption('x² + y² = 25')
    return d.svg()

def newton():
    d = D()
    T = [(100, 48), (60, 140), (140, 140)]
    d.gold.append(poly(T, True)); d.fills.append(('hc', poly(T, True)))
    d.gold.append(P('M', (18, 112), 'L', (78, 100)))
    for k, grp in enumerate(['gold', 'violet', 'cobalt', 'violet', 'gold', 'cobalt']):
        getattr(d, grp).append(P('M', (122, 104 + k * 2), 'L', (186, 82 + k * 14)))
    d.text(30, 102, 'white light', 'mlab', 'start')
    d.caption('white light is all the colours')
    return d.svg()

def leibniz():
    d = D()
    for k, s in enumerate(['1', '10', '11', '100', '101', '110']):
        d.text(64, 50 + k * 22, s, 'mtxt', 'end'); d.text(78, 50 + k * 22, f'= {k + 1}', 'mlab', 'start')
    d.gold.append(P('M', (156, 46), 'C', (144, 36), (134, 50), (138, 92), 'C', (142, 134), (134, 170), (120, 160)))
    d.text(158, 120, 'dy', 'mtxt', 'start'); d.violet.append(P('M', (154, 126), 'L', (180, 126))); d.text(158, 142, 'dx', 'mtxt', 'start')
    d.caption('everything from 0 and 1')
    return d.svg()

def lavoisier():
    d = D()
    d.gold += [P('M', (100, 40), 'L', (100, 168)), P('M', (78, 168), 'L', (122, 168)), P('M', (40, 64), 'L', (160, 64))]
    d.dot(100, 64, 4)
    for x in (40, 160):
        d.thin += [P('M', (x, 64), 'L', (x - 22, 110)), P('M', (x, 64), 'L', (x + 22, 110))]
        d.gold.append(P('M', (x - 26, 110), 'Q', (x, 124), (x + 26, 110)))
        flask = P('M', (x - 5, 82), 'L', (x - 5, 92), 'L', (x - 14, 108), 'L', (x + 14, 108), 'L', (x + 5, 92), 'L', (x + 5, 82))
        (d.violet if x < 100 else d.cobalt).append(flask)
    d.text(40, 140, 'before', 'mlab'); d.text(160, 140, 'after', 'mlab')
    d.caption('mass before = mass after')
    return d.svg()

def euler():
    d = D()
    O, r = (100, 104), 62
    d.thin += [P('M', (24, O[1]), 'L', (176, O[1])), P('M', (O[0], 30), 'L', (O[0], 178))]
    d.gold.append(circle(*O, r))
    th = 0.85
    p = (O[0] + r * math.cos(th), O[1] - r * math.sin(th))
    d.violet += [P('M', O, 'L', p), P('M', p, 'L', (p[0], O[1]))]
    d.cobalt.append(P('M', O, 'L', (p[0], O[1])))
    d.thin.append(P('M', (O[0] + 18, O[1]), 'A', (18, 18), '0 0 0', (O[0] + 18 * math.cos(th), O[1] - 18 * math.sin(th))))
    d.dot(*p, 4.4); d.text(p[0] + 8, p[1] - 6, 'e^(iθ)', 'mlab', 'start'); d.text(O[0] + 26, O[1] - 6, 'θ', 'mlab', 'start')
    d.text(O[0] + (p[0] - O[0]) / 2, O[1] + 16, 'cos θ', 'mlab'); d.text(p[0] + 6, O[1] - 18, 'sin θ', 'mlab', 'start')
    d.dot(O[0] - r, O[1], 4.2); d.text(O[0] - r - 6, O[1] - 8, '−1', 'mlab', 'end')
    d.caption('e^(iπ) + 1 = 0')
    return d.svg()

def gauss():
    d = D()
    d.thin.append(P('M', (18, 150), 'L', (182, 150)))
    bell = lambda t: (18 + 164 * t, 150 - 92 * math.exp(-((t - 0.5) / 0.15) ** 2 / 2))
    d.gold.append(curve(bell, 0, 1, 120))
    d.fills.append(('hg', poly([(18 + 164 * t / 60, 150) for t in range(int(60 * 0.35), int(60 * 0.65) + 1)][::-1] + [bell(t / 60) for t in range(int(60 * 0.35), int(60 * 0.65) + 1)], True)))
    cx, cy, r = 160, 48, 18
    d.violet.append(poly([(cx + r * math.sin(2 * math.pi * k / 17), cy - r * math.cos(2 * math.pi * k / 17)) for k in range(17)], True))
    d.text(cx, cy + 34, '17-gon', 'mtick')
    d.caption('the normal curve')
    return d.svg()

def faraday():
    d = D()
    for k in range(6):
        x = 96 + k * 12
        d.gold.append(ellipse(x, 100, 6, 30))
    d.thin.append(P('M', (96, 70), 'L', (156, 70), 'M', (96, 130), 'L', (156, 130)))
    d.cobalt.append(poly([(20, 90), (72, 90), (72, 110), (20, 110)], True)); d.fills.append(('hc', poly([(46, 90), (72, 90), (72, 110), (46, 110)], True)))
    d.text(33, 104, 'N', 'mlab'); d.text(59, 104, 'S', 'mlab')
    d.arrow((30, 128), (70, 128))
    for k in (1, 2):
        d.violet.append(P('M', (72, 100 - 6 * k), 'C', (96, 100 - 40 * k), (-4, 100 - 40 * k), (20, 100 - 6 * k)))
        d.violet.append(P('M', (72, 100 + 6 * k), 'C', (96, 100 + 40 * k), (-4, 100 + 40 * k), (20, 100 + 6 * k)))
    d.gold.append(P('M', (168, 100), 'L', (180, 100), 'L', (180, 156), 'L', (90, 156), 'L', (90, 130)))
    d.gold.append(circle(135, 156, 10)); d.thin.append(P('M', (135, 156), 'L', (141, 149)))
    d.caption('a moving magnet makes a current')
    return d.svg()

def darwin():
    d = D()
    d.text(30, 44, 'I think', 'mlab', 'start')
    d.gold.append(P('M', (100, 172), 'L', (100, 138)))
    d.gold += [P('M', (100, 138), 'Q', (80, 120), (66, 96)), P('M', (100, 138), 'Q', (122, 118), (136, 98))]
    d.violet += [P('M', (66, 96), 'Q', (52, 80), (44, 60)), P('M', (66, 96), 'Q', (74, 78), (82, 60)), P('M', (136, 98), 'Q', (124, 78), (118, 60)), P('M', (136, 98), 'Q', (150, 80), (160, 64))]
    d.cobalt += [P('M', (160, 64), 'L', (172, 50)), P('M', (160, 64), 'L', (150, 48))]
    for (x, y), s in (((44, 60), 'A'), ((82, 60), 'B'), ((118, 60), 'C'), ((172, 50), 'D'), ((150, 48), '')):
        d.dot(x, y, 3.2)
        if s: d.text(x, y - 8, s, 'mlab')
    d.caption('the tree of life')
    return d.svg()

def lovelace():
    d = D()
    for col in range(3):
        x = 118 + col * 24
        for row in range(5):
            y = 50 + row * 22
            d.gold.append(circle(x, y, 9))
            for k in range(8):
                a = k * math.pi / 4
                d.thin.append(P('M', (x + 9 * math.cos(a), y + 9 * math.sin(a)), 'L', (x + 12 * math.cos(a), y + 12 * math.sin(a))))
    for k in range(5):
        y = 46 + k * 22
        d.violet.append(P('M', (22, y + 12), 'L', (96, y + 12)))
        d.text(26, y + 6, ['V1 × V2', 'V4 − V1', 'V5 ÷ V4', 'V11 ÷ V5', 'V13 − …'][k], 'mtick', 'start')
    d.violet.append(P('M', (22, 34), 'L', (22, 156), 'M', (96, 34), 'L', (96, 156)))
    d.caption('the first published program, 1843')
    return d.svg()

def boole():
    d = D()
    d.gold.append(P('M', (40, 48), 'L', (72, 48), 'A', (28, 28), '0 0 1', (72, 104), 'L', (40, 104), 'Z')); d.fills.append(('hg', P('M', (40, 48), 'L', (72, 48), 'A', (28, 28), '0 0 1', (72, 104), 'L', (40, 104), 'Z')))
    d.violet += [P('M', (18, 62), 'L', (40, 62)), P('M', (18, 90), 'L', (40, 90)), P('M', (100, 76), 'L', (122, 76))]
    d.text(14, 66, 'A', 'mlab', 'end'); d.text(14, 94, 'B', 'mlab', 'end'); d.text(126, 80, 'A·B', 'mlab', 'start')
    rows = [('0', '0', '0'), ('0', '1', '0'), ('1', '0', '0'), ('1', '1', '1')]
    d.cobalt += [P('M', (52, 122), 'L', (148, 122)), P('M', (116, 112), 'L', (116, 190))]
    for k, s in enumerate(['A', 'B', 'A AND B']): d.text([64, 88, 132][k], 116, s, 'mtick')
    for r, (a, b, o) in enumerate(rows):
        y = 138 + r * 14
        d.text(64, y, a, 'mtick'); d.text(88, y, b, 'mtick'); d.text(132, y, o, 'mtick')
    return d.svg()

def mendel():
    d = D()
    x0, y0, s = 60, 54, 46
    for k in range(3):
        d.gold += [P('M', (x0, y0 + k * s), 'L', (x0 + 2 * s, y0 + k * s)), P('M', (x0 + k * s, y0), 'L', (x0 + k * s, y0 + 2 * s))]
    d.fills.append(('hv', poly([(x0 + s, y0 + s), (x0 + 2 * s, y0 + s), (x0 + 2 * s, y0 + 2 * s), (x0 + s, y0 + 2 * s)], True)))
    for k, s_ in enumerate('Aa'):
        d.text(x0 + s / 2 + k * s, y0 - 10, s_, 'mtxt'); d.text(x0 - 12, y0 + s / 2 + 5 + k * s, s_, 'mtxt')
    for (i, j), g in (((0, 0), 'AA'), ((1, 0), 'Aa'), ((0, 1), 'Aa'), ((1, 1), 'aa')):
        d.text(x0 + s / 2 + i * s, y0 + s / 2 + 6 + j * s, g, 'mbig')
    d.caption('3 : 1')
    return d.svg()

def pasteur():
    d = D()
    d.gold.append(P('M', (78, 112), 'A', (40, 40), '1 1 0', (122, 112), 'L', (122, 96), 'C', (122, 70), (150, 60), (160, 76), 'C', (170, 92), (182, 74), (186, 52)))
    d.gold.append(P('M', (78, 112), 'L', (78, 96), 'C', (78, 60), (140, 46), (152, 66), 'C', (162, 82), (172, 70), (176, 50)))
    d.fills.append(('hc', P('M', (62, 132), 'Q', (100, 120), (138, 132), 'A', (40, 40), '0 0 1', (62, 132), 'Z')))
    d.cobalt.append(P('M', (62, 132), 'Q', (100, 120), (138, 132)))
    for x, y in ((158, 74), (163, 80), (154, 70), (180, 46), (170, 40)): d.dot(x, y, 2, 'mstar')
    d.text(100, 160, 'broth stays clear', 'mlab'); d.text(186, 36, 'dust trapped', 'mlab', 'end')
    d.caption('no microbes in, no life out')
    return d.svg()

def riemann():
    d = D()
    d.gold.append(circle(100, 100, 66)); d.thin.append(ellipse(100, 100, 66, 18))
    N = (100, 34); A = (60, 112); B = (138, 116)
    d.violet += [P('M', N, 'Q', (58, 52), A), P('M', N, 'Q', (146, 56), B), P('M', A, 'Q', (100, 132), B)]
    d.fills.append(('hv', P('M', N, 'Q', (58, 52), A, 'Q', (100, 132), B, 'Q', (146, 56), N, 'Z')))
    for p in (N, A, B): d.dot(*p, 3.6)
    d.caption('angles add up to more than 180°')
    return d.svg()

def maxwell():
    d = D()
    d.thin.append(P('M', (20, 110), 'L', (180, 110)))
    d.gold.append(wave(20, 170, 110, 42, 1.5))
    d.violet.append(curve(lambda t: (20 + 150 * t + 26 * math.sin(3 * math.pi * t), 110 + 14 * math.sin(3 * math.pi * t)), 0, 1, 120))
    d.arrow((150, 160), (186, 160), 'cobalt'); d.text(150, 176, 'speed c', 'mlab', 'start')
    d.text(34, 58, 'E', 'mbig'); d.text(58, 140, 'B', 'mbig')
    d.caption('light is an electromagnetic wave')
    return d.svg()

def mendeleev():
    d = D()
    rows = [['Li', 'Be', 'B', 'C', 'N'], ['Na', 'Mg', 'Al', 'Si', 'P'], ['K', 'Ca', '?', 'Ti', 'V'], ['Zn', '?', '?', 'As', 'Se']]
    x0, y0, w, h = 30, 40, 28, 30
    for r, row in enumerate(rows):
        for c, s in enumerate(row):
            x, y = x0 + c * w, y0 + r * h
            box = poly([(x, y), (x + w - 4, y), (x + w - 4, y + h - 4), (x, y + h - 4)], True)
            if s == '?':
                d.violet.append(box); d.fills.append(('hv', box))
            else:
                d.gold.append(box)
            d.text(x + (w - 4) / 2, y + (h - 4) / 2 + 5, s, 'mlab')
    d.caption('gaps he predicted: Sc, Ga, Ge')
    return d.svg()

def tesla():
    d = D()
    for k, grp in enumerate(('gold', 'violet', 'cobalt')):
        getattr(d, grp).append(wave(18, 98, 104, 26, 1.5, -2 * math.pi * k / 3))
    d.thin.append(P('M', (18, 104), 'L', (98, 104)))
    d.gold.append(circle(146, 104, 34))
    d.arrow((146, 104), (146 + 30 * math.cos(-0.6), 104 + 30 * math.sin(-0.6)), 'violet', 9)
    d.cobalt.append(P('M', (146 + 44 * math.cos(0.4), 104 - 44 * math.sin(0.4)), 'A', (44, 44), '0 0 0', (146 + 44 * math.cos(1.4), 104 - 44 * math.sin(1.4))))
    d.text(58, 150, 'three phases', 'mlab'); d.text(146, 156, 'rotating field', 'mlab')
    return d.svg()

def planck():
    d = D()
    d.thin += [P('M', (24, 160), 'L', (182, 160)), P('M', (24, 160), 'L', (24, 40))]
    B = lambda x: x ** 3 / (math.exp(x) - 1) if x > 1e-6 else 0
    d.gold.append(curve(lambda t: (24 + 156 * t, 160 - 110 * B(10 * t + 1e-6) / 1.4214), 0, 1, 140))
    d.fills.append(('hg', curve(lambda t: (24 + 156 * t, 160 - 110 * B(10 * t + 1e-6) / 1.4214), 0, 1, 140) + ' L 180 160 L 24 160 Z'))
    d.text(180, 176, 'frequency', 'mtick', 'end'); d.text(28, 36, 'brightness', 'mtick', 'start')
    d.caption('E = hf')
    return d.svg()

def rutherford():
    d = D()
    d.gold.append(P('M', (120, 40), 'L', (120, 170)))
    d.dot(120, 104, 4.6)
    for y in (56, 76, 132, 152):
        d.arrow((20, y), (184, y), 'cobalt', 6)
    d.arrow((20, 96), (180, 80), 'violet', 6)
    d.violet.append(P('M', (20, 104), 'L', (112, 104)))
    d.arrow((112, 106), (36, 122), 'violet', 7)
    d.text(120, 186, 'gold foil', 'mlab')
    d.caption('a tiny, heavy nucleus')
    return d.svg()

def noether():
    d = D()
    d.gold.append(circle(100, 66, 30))
    for k in range(6):
        a = k * math.pi / 3
        d.violet.append(P('M', (100, 66), 'L', (100 + 30 * math.cos(a), 66 + 30 * math.sin(a))))
    d.cobalt.append(P('M', (100 + 40 * math.cos(-0.3), 66 + 40 * math.sin(-0.3)), 'A', (40, 40), '0 0 1', (100 + 40 * math.cos(0.9), 66 + 40 * math.sin(0.9))))
    for k, (a, b) in enumerate((('time', 'energy'), ('place', 'momentum'), ('direction', 'angular momentum'))):
        y = 124 + k * 22
        d.text(62, y, a, 'mlab', 'end'); d.text(76, y, '↔', 'mtxt'); d.text(90, y, b, 'mlab', 'start')
    d.caption('symmetry ↔ conservation')
    return d.svg()

def bohr():
    d = D()
    c = (84, 104)
    d.dot(*c, 6)
    for r, grp in ((24, 'cobalt'), (44, 'violet'), (66, 'gold')):
        getattr(d, grp).append(circle(*c, r))
    a = -0.9
    p3 = (c[0] + 66 * math.cos(a), c[1] + 66 * math.sin(a)); p2 = (c[0] + 44 * math.cos(a), c[1] + 44 * math.sin(a))
    d.arrow(p3, p2, 'gold', 7)
    d.dot(*p3, 3.4)
    d.violet.append(curve(lambda t: (p2[0] + 8 + 70 * t + 0, p2[1] - 4 - 50 * t + 5 * math.sin(14 * math.pi * t)), 0, 1, 100))
    d.text(176, 30, 'light', 'mlab', 'end')
    d.caption('hf = E₃ − E₂')
    return d.svg()

def schrodinger():
    d = D()
    d.gold += [P('M', (26, 40), 'L', (26, 160)), P('M', (174, 40), 'L', (174, 160)), P('M', (26, 160), 'L', (174, 160))]
    d.fills += [('hg', poly([(14, 40), (26, 40), (26, 160), (14, 160)], True)), ('hg', poly([(174, 40), (186, 40), (186, 160), (174, 160)], True))]
    d.violet.append(curve(lambda t: (26 + 148 * t, 104 - 40 * math.sin(3 * math.pi * t)), 0, 1, 120))
    d.cobalt.append(curve(lambda t: (26 + 148 * t, 104 + 40 * math.sin(3 * math.pi * t)), 0, 1, 120))
    d.thin.append(P('M', (26, 104), 'L', (174, 104)))
    d.caption('iħ ∂ψ/∂t = Ĥψ')
    return d.svg()

def heisenberg():
    d = D()
    for x0, w, grp, lab in ((18, 0.05, 'gold', 'position'), (106, 0.24, 'violet', 'momentum')):
        d.thin.append(P('M', (x0, 150), 'L', (x0 + 78, 150)))
        fn = lambda t, w=w, x0=x0: (x0 + 78 * t, 150 - 90 * math.exp(-((t - 0.5) / w) ** 2 / 2) * (0.18 / w) ** 0.5 / 1.9)
        getattr(d, grp).append(curve(fn, 0, 1, 120))
        d.text(x0 + 39, 168, lab, 'mlab')
    d.caption('Δx Δp ≥ ħ/2')
    return d.svg()

def dirac():
    d = D()
    O = (60, 140)
    d.arrow(O, (60, 50), 'gold', 9); d.arrow(O, (150, 140), 'gold', 9)
    d.arrow(O, (124, 76), 'violet', 9)
    d.text(48, 56, '|0⟩', 'mtxt', 'end'); d.text(156, 160, '|1⟩', 'mtxt', 'start'); d.text(130, 70, '|ψ⟩', 'mtxt', 'start')
    d.text(100, 34, '⟨φ|ψ⟩', 'mbig')
    d.caption('bra-ket notation')
    return d.svg()

def von_neumann():
    d = D()
    d.gold.append(poly([(24, 40), (176, 40), (176, 84), (24, 84)], True)); d.text(100, 58, 'memory', 'mlab'); d.text(100, 76, 'program  +  data', 'mtick')
    d.fills.append(('hg', poly([(24, 40), (176, 40), (176, 84), (24, 84)], True)))
    d.violet.append(poly([(60, 112), (140, 112), (140, 158), (60, 158)], True)); d.text(100, 132, 'processor', 'mlab'); d.text(100, 148, 'control + arithmetic', 'mtick')
    d.arrow((88, 86), (88, 110), 'cobalt', 6); d.arrow((112, 110), (112, 86), 'cobalt', 6)
    d.arrow((22, 135), (58, 135), 'cobalt', 6); d.arrow((142, 135), (178, 135), 'cobalt', 6)
    d.text(22, 126, 'in', 'mtick', 'start'); d.text(178, 126, 'out', 'mtick', 'end')
    d.caption('program and data in one memory')
    return d.svg()

def godel():
    d = D()
    d.gold.append(poly([(26, 66), (174, 66), (174, 122), (26, 122)], True)); d.fills.append(('hv', poly([(26, 66), (174, 66), (174, 122), (26, 122)], True)))
    d.text(100, 90, 'This statement', 'mlab'); d.text(100, 108, 'cannot be proved.', 'mlab')
    d.violet.append(P('M', (150, 122), 'C', (170, 172), (40, 176), (50, 128)))
    d.extra.append(f'<path class="mhead" d="{poly([(50, 124), (44, 136), (56, 136)], True)}"/>')
    d.caption('true, but unprovable')
    return d.svg()

def chandrasekhar():
    d = D()
    d.thin += [P('M', (26, 160), 'L', (182, 160)), P('M', (26, 160), 'L', (26, 40))]
    lim = 150
    d.gold.append(curve(lambda t: (26 + (lim - 26) * t, 160 - 104 * (1 - t ** 4) ** 0.5 * (1 - 0.35 * t)), 0, 1, 100))
    d.violet.append(P('M', (lim, 40), 'L', (lim, 160)))
    d.text(lim, 176, '1.4 Suns', 'mlab'); d.text(30, 36, 'radius', 'mtick', 'start'); d.text(182, 152, 'mass', 'mtick', 'end')
    d.text(168, 98, 'collapse', 'mlab', 'end')
    d.caption('the Chandrasekhar limit')
    return d.svg()

def shannon():
    d = D()
    boxes = [('source', 40), ('encoder', 76), ('channel', 112), ('decoder', 148)]
    for name, y in boxes:
        box = poly([(52, y - 14), (148, y - 14), (148, y + 14), (52, y + 14)], True)
        (d.violet if name == 'channel' else d.gold).append(box)
        d.text(100, y + 4, name, 'mlab')
    for y in (54, 90, 126):
        d.arrow((100, y), (100, y + 8), 'cobalt', 5)
    d.violet.append(wave(152, 186, 112, 5, 3)); d.text(186, 102, 'noise', 'mtick', 'end')
    d.caption('H = −Σ p log₂ p')
    return d.svg()

def franklin():
    d = D()
    d.gold.append(circle(100, 100, 70)); d.fills.append(('hc', circle(100, 100, 70)))
    for k in range(-4, 5):
        if k == 0: continue
        for s in (-1, 1):
            x, y = 100 + s * k * 9, 100 + k * 12
            d.gold.append(P('M', (x - 8, y), 'L', (x + 8, y)))
    d.dot(100, 100, 3, 'mstar')
    d.caption('Photograph 51: the X of a helix')
    return d.svg()

def hawking():
    d = D()
    d.gold.append(circle(84, 108, 46)); d.fills.append(('hg', circle(84, 108, 46)))
    d.violet.append(circle(84, 108, 58))
    p = (84 + 58 * math.cos(-0.5), 108 + 58 * math.sin(-0.5))
    d.dot(*p, 3)
    d.arrow(p, (84 + 40 * math.cos(-0.7), 108 + 40 * math.sin(-0.7)), 'cobalt', 6)
    d.violet.append(curve(lambda t: (p[0] + 60 * t, p[1] - 50 * t + 4 * math.sin(10 * math.pi * t)), 0, 1, 80))
    d.text(84, 186, 'horizon', 'mlab'); d.text(178, 36, 'radiation', 'mlab', 'end')
    d.caption('black holes glow')
    return d.svg()

def jc_bose():
    d = D()
    d.gold.append(poly([(24, 92), (48, 92), (72, 70), (72, 130), (48, 108), (24, 108)], True)); d.fills.append(('hg', poly([(48, 92), (72, 70), (72, 130), (48, 108)], True)))
    for k in range(4):
        r = 18 + k * 18
        d.violet.append(P('M', (72 + r * math.cos(-0.5), 100 + r * math.sin(-0.5)), 'A', (r, r), '0 0 1', (72 + r * math.cos(0.5), 100 + r * math.sin(0.5))))
    d.gold.append(poly([(150, 80), (180, 80), (180, 120), (150, 120)], True))
    d.cobalt.append(P('M', (150, 100), 'L', (162, 100), 'L', (168, 92)))
    d.text(165, 136, 'detector', 'mlab'); d.text(48, 136, 'horn', 'mlab')
    d.caption('millimetre waves, 1895')
    return d.svg()

def curie():
    d = D()
    for x, y in ((92, 96), (104, 96), (98, 106), (88, 108), (108, 108), (98, 88)):
        d.dot(x, y, 5.4, 'mdot')
    d.gold.append(circle(98, 100, 22))
    d.arrow((118, 88), (170, 52), 'violet', 8); d.text(176, 46, 'α', 'mbig')
    d.arrow((80, 88), (30, 52), 'cobalt', 8); d.text(22, 46, 'β', 'mbig')
    d.violet.append(curve(lambda t: (98 + 4 * math.sin(10 * math.pi * t), 124 + 46 * t), 0, 1, 80)); d.text(116, 172, 'γ', 'mbig')
    d.caption('radioactivity')
    return d.svg()

def einstein():
    d = D()
    d.gold += [P('M', (22, 50), 'L', (178, 50)), P('M', (22, 140), 'L', (178, 140))]
    pts = [(28 + 30 * k, 52 if k % 2 == 0 else 138) for k in range(6)]
    d.violet.append(poly(pts))
    for p in pts: d.dot(*p, 2.4, 'mstar')
    d.text(100, 98, 'E = mc²', 'mbig')
    d.caption('light, time and energy')
    return d.svg()

def cube(d, x, y, s, grp):
    k = s * 0.35
    front = poly([(x, y), (x + s, y), (x + s, y - s), (x, y - s)], True)
    getattr(d, grp).append(front)
    getattr(d, grp).append(poly([(x, y - s), (x + k, y - s - k), (x + s + k, y - s - k), (x + s, y - s)]))
    getattr(d, grp).append(poly([(x + s, y), (x + s + k, y - k), (x + s + k, y - s - k)]))

def ramanujan():
    d = D()
    cube(d, 24, 158, 72, 'gold'); cube(d, 100, 158, 6, 'violet')
    cube(d, 120, 158, 36, 'cobalt'); cube(d, 120, 110, 32, 'violet')
    d.text(60, 178, '12³ + 1³', 'mlab'); d.text(146, 178, '10³ + 9³', 'mlab')
    d.caption('1729 = 1³ + 12³ = 9³ + 10³')
    return d.svg()

def raman():
    d = D()
    d.gold.append(wave(18, 78, 104, 9, 4))
    d.dot(90, 104, 6); d.dot(108, 98, 4.6); d.gold.append(P('M', (90, 104), 'L', (108, 98)))
    d.violet.append(curve(lambda t: (114 + 64 * t, 92 - 54 * t + 7 * math.sin(8 * math.pi * t)), 0, 1, 100))
    d.cobalt.append(curve(lambda t: (114 + 64 * t, 112 + 54 * t + 7 * math.sin(5.5 * math.pi * t)), 0, 1, 100))
    d.text(178, 30, 'same colour', 'mlab', 'end'); d.text(178, 182, 'shifted colour', 'mlab', 'end')
    d.caption('the Raman effect, 1928')
    return d.svg()

def sn_bose():
    d = D()
    for k, (a, b) in enumerate(((2, 0), (1, 1), (0, 2))):
        y = 40 + k * 46
        for j in range(2):
            x = 50 + j * 54
            d.gold.append(poly([(x, y), (x + 46, y), (x + 46, y + 34), (x, y + 34)], True))
        for j, n in enumerate((a, b)):
            for m in range(n):
                d.dot(50 + j * 54 + 16 + m * 14, y + 17, 5, 'mdot')
    d.caption('identical photons: 3 ways, not 4')
    return d.svg()

def bhabha():
    d = D()
    def split(x, y, dx, depth):
        if depth == 0: return
        for s in (-1, 1):
            grp = 'violet' if depth % 2 else 'cobalt'
            getattr(d, grp).append(P('M', (x, y), 'L', (x + s * dx, y + 36)))
            split(x + s * dx, y + 36, dx / 2, depth - 1)
    d.gold.append(P('M', (100, 30), 'L', (100, 52)))
    d.dot(100, 30, 3.4)
    split(100, 52, 40, 4)
    d.caption('a cosmic-ray shower')
    return d.svg()

def turing():
    d = D()
    cells = ['1', '0', '1', '1', '0', '']
    for k, s in enumerate(cells):
        x = 22 + k * 26
        d.gold.append(poly([(x, 110), (x + 26, 110), (x + 26, 140), (x, 140)], True))
        if s: d.text(x + 13, 130, s, 'mtxt')
    d.thin += [P('M', (14, 110), 'L', (22, 110), 'M', (14, 140), 'L', (22, 140), 'M', (178, 110), 'L', (186, 110), 'M', (178, 140), 'L', (186, 140))]
    hx = 22 + 3 * 26 + 13
    d.violet.append(poly([(hx - 22, 50), (hx + 22, 50), (hx + 22, 82), (hx - 22, 82)], True)); d.fills.append(('hv', poly([(hx - 22, 50), (hx + 22, 50), (hx + 22, 82), (hx - 22, 82)], True)))
    d.text(hx, 71, 'q₁', 'mtxt'); d.arrow((hx, 84), (hx, 106), 'violet', 7)
    d.caption('read, write, move: any computation')
    return d.svg()

def feynman():
    d = D()
    A, B = (70, 70), (70, 138)
    d.gold += [P('M', (24, 30), 'L', A, 'L', (24, 110)), P('M', (176, 30), 'L', (128, 70)), P('M', (176, 178), 'L', (128, 138)), P('M', (24, 178), 'L', B)]
    d.gold += [P('M', A, 'L', (128, 70)), P('M', B, 'L', (128, 138))]
    d.violet.append(curve(lambda t: (99 + 6 * math.sin(10 * math.pi * t), 70 + 68 * t), 0, 1, 100))
    d.dot(99, 70, 3.4); d.dot(99, 138, 3.4)
    d.text(108, 108, 'photon', 'mlab', 'start')
    d.caption('e⁻ e⁻ → e⁻ e⁻')
    return d.svg()

def kalam():
    d = D()
    d.gold.append(P('M', (64, 40), 'L', (74, 56), 'L', (74, 146), 'L', (54, 146), 'L', (54, 56), 'Z'))
    d.fills.append(('hg', poly([(54, 56), (74, 56), (74, 146), (54, 146)], True)))
    d.gold += [P('M', (54, 128), 'L', (42, 150), 'L', (54, 146)), P('M', (74, 128), 'L', (86, 150), 'L', (74, 146))]
    d.violet.append(P('M', (56, 150), 'Q', (64, 178), (72, 150)))
    d.cobalt.append(P('M', (100, 168), 'A', (90, 90), '0 0 1', (186, 120)))
    d.violet.append(ellipse(150, 82, 40, 18))
    d.dot(186, 80, 4.2); d.text(178, 60, 'Rohini', 'mlab', 'end')
    d.caption('SLV-3 and Rohini, 1980')
    return d.svg()

# ---------------------------------------------------------------- drawings added for the second set of Indian scientists (and Ritchie)
def pingala():
    d = D()
    # all 8 patterns of 3 syllables: laghu (short) as a small cup, guru (long) as a dash; laghu = 0, guru = 1
    for k in range(8):
        y = 34 + k * 19
        d.text(40, y + 4, f'{k}', 'mtick')
        for j in range(3):
            bit = (k >> (2 - j)) & 1
            x = 70 + j * 30
            if bit:
                d.gold.append(P('M', (x - 10, y), 'L', (x + 10, y)))
            else:
                d.violet.append(P('M', (x - 6, y - 5), 'Q', (x, y + 7), (x + 6, y - 5)))
        d.text(160, y + 4, format(k, '03b'), 'mtick')
    d.caption('3 syllables: 2³ = 8 patterns')
    return d.svg()

def bhaskara():
    d = D()
    cx, cy, r = 100, 96, 60
    d.gold.append(circle(cx, cy, r))
    for k in range(6):      # the wheel: six steps of the cycle
        a = math.radians(-90 + k * 60)
        x, y = cx + r * math.cos(a), cy + r * math.sin(a)
        d.dot(x, y, 3.6)
        d.thin.append(P('M', (cx, cy), 'L', (x, y)))
    for k in range(6):
        a0, a1 = math.radians(-90 + k * 60 + 8), math.radians(-90 + k * 60 + 52)
        d.violet.append(P('M', (cx + (r + 9) * math.cos(a0), cy + (r + 9) * math.sin(a0)), 'A', (r + 9, r + 9), '0 0 1', (cx + (r + 9) * math.cos(a1), cy + (r + 9) * math.sin(a1))))
    a1 = math.radians(-90 + 52)
    ex, ey = cx + (r + 9) * math.cos(a1), cy + (r + 9) * math.sin(a1)
    d.extra.append(f'<path class="mhead" d="{poly([(ex + 4, ey + 6), (ex - 6, ey + 2), (ex + 2, ey - 6)], True)}"/>')
    d.fills.append(('hc', circle(cx, cy, 16)))
    d.cobalt.append(circle(cx, cy, 16))
    d.caption('61x² + 1 = y²')
    return d.svg()

def visvesvaraya():
    d = D()
    d.gold.append(poly([(70, 40), (96, 40), (126, 164), (70, 164)], True))            # the dam wall
    d.fills.append(('hg', poly([(70, 40), (96, 40), (126, 164), (70, 164)], True)))
    d.cobalt.append(wave(20, 70, 70, 2.5, 3))                                          # high water behind the dam
    d.fills.append(('hc', poly([(20, 72), (70, 72), (70, 164), (20, 164)], True)))
    d.violet.append(poly([(70, 82), (70, 112)]))                                       # the gate, swung open
    d.gold.append(P('M', (70, 82), 'L', (88, 104)))
    d.dot(70, 82, 3)
    d.cobalt += [P('M', (96, 100), 'Q', (130, 112), (150, 150)), P('M', (100, 108), 'Q', (136, 120), (160, 156))]
    d.cobalt.append(wave(126, 186, 164, 2, 3))
    d.thin.append(P('M', (14, 70), 'L', (64, 70)))
    d.text(26, 62, 'set level', 'mlab', 'start')
    d.caption('gates that open by themselves, 1903')
    return d.svg()

def mahalanobis():
    d = D()
    cx, cy = 100, 100
    for k, s in enumerate((1, 2, 3)):
        rx, ry = 22 * s, 9 * s
        pts = [(cx + rx * math.cos(t) * math.cos(0.6) - ry * math.sin(t) * math.sin(0.6), cy - rx * math.cos(t) * math.sin(0.6) - ry * math.sin(t) * math.cos(0.6)) for t in [2 * math.pi * i / 72 for i in range(73)]]
        (d.gold if s == 3 else d.violet).append(poly(pts))
    import random
    rnd = random.Random(1936)
    for _ in range(46):
        u, v = rnd.gauss(0, 1), rnd.gauss(0, 1)
        x = cx + 22 * u * math.cos(0.6) - 9 * v * math.sin(0.6)
        y = cy - 22 * u * math.sin(0.6) - 9 * v * math.cos(0.6)
        if 20 < x < 180 and 30 < y < 170: d.dot(x, y, 1.8, 'mstar')
    d.dot(cx + 18, cy + 34, 4.2)                     # an unusual point: close in distance, far in spread
    d.text(cx + 26, cy + 50, 'unusual', 'mlab', 'start')
    d.caption('distance that respects the spread')
    return d.svg()

def saha():
    d = D()
    d.gold.append(circle(60, 82, 34)); d.fills.append(('hg', circle(60, 82, 34)))
    for k in range(10):
        a = 2 * math.pi * k / 10
        d.thin.append(P('M', (60 + 40 * math.cos(a), 82 + 40 * math.sin(a)), 'L', (60 + 50 * math.cos(a), 82 + 50 * math.sin(a))))
    x0, x1, y0, y1 = 24, 176, 140, 168
    d.violet.append(poly([(x0, y0), (x1, y0), (x1, y1), (x0, y1)], True))
    d.fills.append(('hv', poly([(x0, y0), (x1, y0), (x1, y1), (x0, y1)], True)))
    for x, w in ((46, 2.6), (63, 1.2), (88, 3.2), (112, 1.6), (130, 2.4), (158, 1.2)):
        d.extra.append(f'<rect x="{f(x - w / 2)}" y="{y0 + 2}" width="{f(w)}" height="{y1 - y0 - 4}" fill="#0b1026"/>')
    d.arrow((100, 82), (150, 126), 'cobalt')
    d.text(120, 70, 'spectrum', 'mlab', 'start')
    d.caption('ionisation tells a star\'s temperature')
    return d.svg()

def janaki_ammal():
    d = D()
    for y in (40, 78, 116, 154):                       # sugarcane: jointed stalk
        d.gold.append(poly([(52, y), (52, y + 36)])); d.gold.append(poly([(70, y), (70, y + 36)]))
        d.gold.append(P('M', (50, y), 'L', (72, y)))
    d.fills.append(('hg', poly([(52, 40), (70, 40), (70, 190), (52, 190)], True)))
    d.cobalt += [P('M', (70, 60), 'Q', (100, 40), (112, 20)), P('M', (52, 100), 'Q', (26, 80), (20, 56))]
    for k, (x, y) in enumerate(((118, 70), (150, 70), (118, 128), (150, 128))):   # pairs of chromosomes as X shapes
        h = 22 if k < 2 else 16
        d.violet += [P('M', (x - 7, y - h), 'Q', (x, y), (x + 7, y + h)), P('M', (x + 7, y - h), 'Q', (x, y), (x - 7, y + h))]
        d.dot(x, y, 2.6)
    d.caption('chromosomes of crop plants')
    return d.svg()

def kaprekar():
    d = D()
    steps = [('3524', None), ('3087', '5432 − 2345'), ('8352', '8730 − 0378'), ('6174', '8532 − 2358')]
    for k, (n, how) in enumerate(steps):
        y = 46 + k * 38
        d.text(58, y, n, 'mbig' if n == '6174' else 'mtxt', 'middle')
        if how:
            d.text(96, y - 17, how, 'mtick', 'start')
        if k < len(steps) - 1:
            d.arrow((58, y + 8), (58, y + 22), 'violet', 6)
    d.violet.append(P('M', (86, 160), 'C', (120, 176), (120, 136), (88, 152)))       # 6174 maps to itself
    d.extra.append(f'<path class="mhead" d="{poly([(84, 154), (94, 148), (93, 158)], True)}"/>')
    d.text(124, 160, '7641 − 1467', 'mtick', 'start')
    d.caption('every start leads to 6174')
    return d.svg()

def asima_chatterjee():
    d = D()
    d.gold.append(P('M', (34, 160), 'C', (30, 100), (70, 56), (110, 40), 'C', (106, 92), (84, 140), (34, 160), 'Z'))   # a leaf
    d.fills.append(('hg', P('M', (34, 160), 'C', (30, 100), (70, 56), (110, 40), 'C', (106, 92), (84, 140), (34, 160), 'Z')))
    d.thin += [P('M', (34, 160), 'Q', (70, 100), (108, 44)), P('M', (58, 118), 'L', (74, 112)), P('M', (70, 96), 'L', (88, 90))]
    def hexagon(cx, cy, r): return poly([(cx + r * math.cos(math.radians(30 + 60 * k)), cy + r * math.sin(math.radians(30 + 60 * k))) for k in range(6)], True)
    d.violet += [hexagon(140, 104, 20), hexagon(140 + 34.6, 104, 20)]
    d.cobalt.append(P('M', (140, 84), 'L', (140, 64)))
    d.text(140, 58, 'N', 'mlab')
    d.violet.append(P('M', (148, 110), 'L', (140, 115)))
    d.caption('medicines from plants')
    return d.svg()

def anna_mani():
    d = D()
    d.gold.append(circle(150, 46, 16)); d.fills.append(('hg', circle(150, 46, 16)))
    for k in range(8):
        a = 2 * math.pi * k / 8
        d.thin.append(P('M', (150 + 21 * math.cos(a), 46 + 21 * math.sin(a)), 'L', (150 + 28 * math.cos(a), 46 + 28 * math.sin(a))))
    d.gold.append(P('M', (84, 170), 'L', (84, 98)))                                     # the mast
    for k in range(3):                                                                    # three cups on arms
        a = math.radians(k * 120 + 15)
        x, y = 84 + 38 * math.cos(a), 92 + 13 * math.sin(a)
        d.violet.append(P('M', (84, 92), 'L', (x, y)))
        d.cobalt.append(P('M', (x - 7, y - 4), 'A', (7, 6), '0 0 0', (x + 7, y - 4)))
        d.dot(x, y - 4, 1.6)
    d.dot(84, 92, 3.2)
    d.violet += [P('M', (22, 140), 'Q', (40, 132), (58, 140)), P('M', (18, 154), 'Q', (36, 146), (54, 154))]   # wind
    d.caption('instruments for India\'s weather')
    return d.svg()

def sarabhai():
    d = D()
    d.cobalt.append(wave(16, 184, 170, 3, 5))                                           # the sea at Thumba
    d.gold.append(P('M', (16, 160), 'L', (90, 160), 'L', (106, 150)))                   # the coast
    d.gold.append(P('M', (112, 40), 'L', (122, 58), 'L', (122, 120), 'L', (102, 120), 'L', (102, 58), 'Z'))   # the rocket
    d.fills.append(('hg', poly([(102, 58), (122, 58), (122, 120), (102, 120)], True)))
    d.gold += [P('M', (102, 108), 'L', (92, 126), 'L', (102, 120)), P('M', (122, 108), 'L', (132, 126), 'L', (122, 120))]
    d.violet += [P('M', (104, 124), 'Q', (112, 150), (120, 124)), P('M', (108, 124), 'Q', (112, 140), (116, 124))]
    d.thin.append(P('M', (112, 150), 'L', (112, 160)))
    for x, y in ((30, 40), (60, 70), (170, 36), (156, 90), (40, 108)):
        d.dot(x, y, 1.5, 'mstar')
    d.caption('Thumba, 21 November 1963')
    return d.svg()

def dhawan():
    d = D()
    d.gold.append(P('M', (30, 120), 'C', (40, 96), (120, 92), (176, 118), 'C', (120, 124), (50, 128), (30, 120), 'Z'))   # a wing section
    d.fills.append(('hg', P('M', (30, 120), 'C', (40, 96), (120, 92), (176, 118), 'C', (120, 124), (50, 128), (30, 120), 'Z')))
    # velocity profile above the wing: arrows shrinking to zero at the surface
    for k in range(6):
        y = 92 - k * 9
        length = 46 * (1 - math.exp(-k / 1.6)) + 2
        d.arrow((96, y), (96 + length, y), 'cobalt', 5)
    d.violet.append(P('M', (96, 96), 'C', (104, 84), (124, 70), (142, 47)))
    d.thin.append(P('M', (96, 96), 'L', (96, 40)))
    d.text(150, 46, 'free air', 'mlab', 'start')
    d.text(100, 152, 'slowed to zero at the wing', 'mlab', 'middle')
    d.caption('the boundary layer')
    return d.svg()

def khorana():
    d = D()
    seq = 'UCUCUCUCU'
    for k, ch in enumerate(seq):
        x = 30 + k * 17.5
        d.text(x, 82, ch, 'mtxt')
    d.gold.append(P('M', (20, 92), 'L', (180, 92)))
    for k in range(3):
        x0, x1 = 22 + k * 52.5, 22 + k * 52.5 + 48
        d.violet.append(P('M', (x0, 100), 'Q', ((x0 + x1) / 2, 116), (x1, 100)))
        d.text((x0 + x1) / 2, 132, ['Ser', 'Leu', 'Ser'][k], 'mlab')
    for k in range(10):                                                                   # a strand of the double helix above
        x = 24 + k * 16
        d.cobalt.append(P('M', (x, 40 + 10 * math.sin(k)), 'L', (x, 56 - 10 * math.sin(k))))
    d.cobalt.append(wave(20, 180, 40, 10, 1.5)); d.gold.append(wave(20, 180, 56, -10, 1.5))
    d.caption('read in threes: UCU = Ser, CUC = Leu')
    return d.svg()

def ramachandran():
    d = D()
    x0, y0, x1, y1 = 36, 30, 180, 170
    d.thin += [P('M', (x0, y1), 'L', (x1, y1)), P('M', (x0, y0), 'L', (x0, y1)), P('M', ((x0 + x1) / 2, y0), 'L', ((x0 + x1) / 2, y1)), P('M', (x0, (y0 + y1) / 2), 'L', (x1, (y0 + y1) / 2))]
    beta = P('M', (52, 40), 'C', (90, 34), (100, 56), (96, 78), 'C', (92, 92), (64, 90), (52, 76), 'C', (44, 62), (44, 46), (52, 40), 'Z')
    alpha = P('M', (60, 104), 'C', (84, 98), (96, 112), (90, 128), 'C', (84, 140), (62, 136), (56, 124), 'C', (50, 114), (52, 106), (60, 104), 'Z')
    left = P('M', (128, 66), 'C', (142, 60), (152, 70), (146, 82), 'C', (140, 90), (126, 86), (124, 78), 'C', (122, 72), (124, 68), (128, 66), 'Z')
    d.gold += [beta, alpha]; d.violet.append(left)
    d.fills += [('hg', beta), ('hg', alpha), ('hv', left)]
    d.text(76, 64, 'β', 'mbig'); d.text(74, 124, 'α', 'mbig')
    d.text(x1, y1 + 14, 'φ', 'mlab', 'end'); d.text(x0 - 8, y0 + 8, 'ψ', 'mlab')
    d.caption('Ramachandran plot, 1963')
    return d.svg()

def harish_chandra():
    d = D()
    cx, cy, r = 70, 100, 40
    d.gold.append(circle(cx, cy, r))
    for k in range(6):
        a = math.radians(k * 60)
        d.dot(cx + r * math.cos(a), cy + r * math.sin(a), 2.6)
    d.violet.append(P('M', (cx + r + 8, cy - 14), 'A', (r + 8, r + 8), '0 0 0', (cx + 14, cy - r - 8)))
    d.extra.append(f'<path class="mhead" d="{poly([(cx + 10, cy - r - 8), (cx + 20, cy - r - 14), (cx + 20, cy - r - 2)], True)}"/>')
    for k, amp in enumerate((14, 10, 7)):
        y = 56 + k * 44
        (d.cobalt if k else d.gold).append(wave(124, 184, y, amp, k + 1))
        d.text(118, y + 4, f'{k + 1}', 'mtick', 'end')
    d.caption('symmetry → harmonics')
    return d.svg()

def ritchie():
    d = D()
    d.gold.append(poly([(16, 36), (184, 36), (184, 164), (16, 164)], True))
    d.fills.append(('hc', poly([(16, 36), (184, 36), (184, 52), (16, 52)], True)))
    for x in (26, 36, 46): d.dot(x, 44, 2.4, 'mstar')
    lines = ['main()', '{', 'printf("hello, world");', '}', '$ ./hello', 'hello, world']
    for k, line in enumerate(lines):
        d.text(26, 72 + k * 16, line, 'mtick', 'start')
    d.caption('C and Unix')
    return d.svg()

def chawla():
    d = D()
    d.gold.append(circle(100, 130, 56)); d.fills.append(('hc', circle(100, 130, 56)))
    d.cobalt += [P('M', (60, 100), 'Q', (90, 116), (120, 96)), P('M', (64, 150), 'Q', (100, 140), (140, 160))]
    d.violet.append(ellipse(100, 130, 86, 30))
    # the Shuttle on the orbit
    sx, sy = 156, 106
    d.gold.append(P('M', (sx - 18, sy + 4), 'L', (sx + 12, sy - 2), 'L', (sx + 20, sy + 2), 'L', (sx + 12, sy + 6), 'Z'))
    d.gold.append(P('M', (sx - 4, sy + 2), 'L', (sx - 14, sy + 14), 'L', (sx + 2, sy + 5)))
    for x, y in ((30, 36), (64, 24), (150, 30), (180, 60), (24, 80)):
        d.dot(x, y, 1.5, 'mstar')
    d.caption('STS-87, 1997')
    return d.svg()

PEOPLE = {
    'aristotle': aristotle, 'euclid': euclid, 'archimedes': archimedes, 'aryabhata': aryabhata, 'brahmagupta': brahmagupta,
    'al-khwarizmi': al_khwarizmi, 'ibn-al-haytham': ibn_al_haytham, 'madhava': madhava, 'copernicus': copernicus, 'galileo': galileo,
    'kepler': kepler, 'descartes': descartes, 'newton': newton, 'leibniz': leibniz, 'euler': euler, 'lavoisier': lavoisier, 'gauss': gauss,
    'faraday': faraday, 'darwin': darwin, 'lovelace': lovelace, 'boole': boole, 'mendel': mendel, 'pasteur': pasteur, 'riemann': riemann,
    'maxwell': maxwell, 'mendeleev': mendeleev, 'tesla': tesla, 'jc-bose': jc_bose, 'planck': planck, 'curie': curie, 'rutherford': rutherford,
    'einstein': einstein, 'noether': noether, 'bohr': bohr, 'ramanujan': ramanujan, 'raman': raman, 'schrodinger': schrodinger,
    'sn-bose': sn_bose, 'heisenberg': heisenberg, 'dirac': dirac, 'von-neumann': von_neumann, 'godel': godel, 'bhabha': bhabha,
    'chandrasekhar': chandrasekhar, 'turing': turing, 'shannon': shannon, 'feynman': feynman, 'franklin': franklin, 'kalam': kalam,
    'hawking': hawking,
    'pingala': pingala, 'bhaskara': bhaskara, 'visvesvaraya': visvesvaraya, 'mahalanobis': mahalanobis, 'saha': saha,
    'janaki-ammal': janaki_ammal, 'kaprekar': kaprekar, 'asima-chatterjee': asima_chatterjee, 'anna-mani': anna_mani, 'sarabhai': sarabhai,
    'dhawan': dhawan, 'khorana': khorana, 'ramachandran': ramachandran, 'harish-chandra': harish_chandra, 'ritchie': ritchie, 'chawla': chawla,
}

if __name__ == '__main__':
    here = os.path.dirname(os.path.abspath(__file__))
    out = {k: fn() for k, fn in PEOPLE.items()}
    path = os.path.join(here, '../src/data/minds-art.json')
    with open(path, 'w') as fh:
        json.dump(out, fh, ensure_ascii=False, indent=0)
        fh.write('\n')
    print(len(out), 'drawings,', sum(len(v) for v in out.values()), 'bytes')
