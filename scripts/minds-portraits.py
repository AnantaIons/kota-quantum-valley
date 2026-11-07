"""Sketch portraits for the Great Minds page, drawn stroke by stroke in code (no photograph is used or traced).
Run: python3 scripts/minds-portraits.py  ->  src/data/minds-art.json

Each portrait is the inside of an <svg viewBox="0 0 200 220">. The page supplies the shared <defs>
(hatch patterns mh-g, mh-v, mh-c, a halo gradient and the pencil filters msk-a, msk-b) and the colours, through CSS:
  g.ml   gold pencil line, drawn twice (g.ml2 is the second, looser pass)
  g.mt   thin gold strokes (hair strands, creases)
  g.mv   violet strokes        g.mc  cobalt strokes
  .hg / .hv / .hc   hatched fills in gold, violet and cobalt
For the three ancient thinkers no likeness from their lifetime survives, so their portrait is their idea instead."""
import json, math, os, random

CX = 100

def f(v):
    return f'{v:.1f}'.rstrip('0').rstrip('.')

def P(*pts):
    out = []
    for p in pts:
        out.append(p if isinstance(p, str) else f'{f(p[0])} {f(p[1])}')
    return ' '.join(out)

def bez(a, b, c, d, t):
    u = 1 - t
    return (u**3 * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t**3 * d[0],
            u**3 * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t**3 * d[1])

def sample(chain, n):
    """n points spread along a chain of cubic segments [(p0, p1, p2, p3), ...]."""
    pts = []
    for i in range(n):
        x = i / (n - 1) * len(chain)
        k = min(int(x), len(chain) - 1)
        pts.append(bez(*chain[k], x - k))
    return pts

def chain_path(chain):
    s = P('M', chain[0][0])
    for a, b, c, d in chain:
        s += ' ' + P('C', b, c, d)
    return s

def smooth(pts):
    s = P('M', pts[0])
    for i in range(1, len(pts) - 1):
        m = ((pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2)
        s += ' ' + P('Q', pts[i], m)
    return s + ' ' + P('L', pts[-1])

def lerp(a, b, u):
    return (a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u)


class Face:
    def __init__(self, seed, w=37, chin=168, jaw=1.0, smile=0, eye_y=108, brow=1.0, age=0):
        self.r = random.Random(seed)
        self.w, self.chin, self.jaw, self.smile, self.ey, self.brow, self.age = w, chin, jaw, smile, eye_y, brow, age
        self.lines, self.thin, self.violet, self.cobalt, self.fills, self.dots, self.rings = [], [], [], [], [], [], []

    # ---------- face
    def jawline(self, top=100):
        w, c, j = self.w, self.chin, self.jaw
        self.lines.append(P('M', (CX - w, top), 'C', (CX - w, 136 + 6 * j), (CX - 14 - 8 * j, c - 2), (CX, c),
                            'C', (CX + 14 + 8 * j, c - 2), (CX + w, 136 + 6 * j), (CX + w, top)))
        # cheekbones and chin
        self.thin.append(P('M', (CX - w + 4, 122), 'q', (4, 8), (10, 10)))
        self.thin.append(P('M', (CX + w - 4, 122), 'q', (-4, 8), (-10, 10)))
        self.thin.append(P('M', (CX - 6, c - 7), 'Q', (CX, c - 4), (CX + 6, c - 7)))
        # shadow under the jaw onto the neck
        self.fills.append(('hv', P('M', (CX - 22, c - 8), 'Q', (CX, c + 4), (CX + 22, c - 8), 'L', (CX + 16, c + 14), 'Q', (CX, c + 18), (CX - 16, c + 14), 'Z')))

    def forehead(self, y=58):
        w = self.w
        self.lines.append(P('M', (CX - w, 100), 'C', (CX - w, 72), (CX - 22, y), (CX, y), 'C', (CX + 22, y), (CX + w, 72), (CX + w, 100)))

    def ears(self):
        w = self.w
        for s in (-1, 1):
            self.lines.append(P('M', (CX + s * (w - 1), 102), 'C', (CX + s * (w + 10), 98), (CX + s * (w + 10), 124), (CX + s * (w - 2), 127)))
            self.thin.append(P('M', (CX + s * (w + 3), 106), 'Q', (CX + s * (w + 6), 113), (CX + s * (w + 2), 120)))

    def eyes(self, gap=16, size=8.5, iris=3.3):
        y, b = self.ey, self.brow
        for s in (-1, 1):
            ex = CX + s * gap
            self.lines.append(P('M', (ex - size, y + 0.5), 'Q', (ex, y - 6.5), (ex + size, y + 0.5)))          # upper lid
            self.thin.append(P('M', (ex - size + 2, y - 4), 'Q', (ex, y - 9), (ex + size - 1, y - 3.5)))      # crease
            self.thin.append(P('M', (ex - size + 2.5, y + 2.5), 'Q', (ex, y + 5), (ex + size - 2.5, y + 2.5)))  # lower lid
            self.rings.append((ex, y + 0.2, iris))
            self.dots.append((ex, y + 0.2, 1.5))
            # brow: a few pencil strokes along a curve
            self.lines.append(P('M', (ex - 11, y - 11), 'Q', (ex, y - 16 - 2 * b), (ex + 11, y - 11 + (1.5 if s > 0 else 0))))
            for k in range(int(4 + 3 * b)):
                x0 = ex - 10 + k * (20 / (3 + 3 * b))
                self.thin.append(P('M', (x0, y - 12 - b), 'l', (2.5, -2.5 - b)))
            # socket shadow at the inner corner
            self.violet.append(P('M', (CX + s * (gap - size + 1), y - 9), 'q', (s * -3, 5), (s * -1, 10)))
            if self.age:
                self.thin.append(P('M', (ex + s * (size + 1), y + 2), 'q', (s * 3, 2), (s * 5, 6)))
                self.thin.append(P('M', (ex - 4, y + 8), 'q', (4, 2), (8, 0)))

    def nose(self, wide=1.0, long=0):
        y = self.ey
        self.thin.append(P('M', (CX - 6, y - 8), 'C', (CX - 4, y + 2), (CX - 4, y + 10 + long), (CX - 7 * wide, y + 18 + long)))   # bridge
        self.lines.append(P('M', (CX - 9 * wide, y + 19 + long), 'C', (CX - 11 * wide, y + 25 + long), (CX - 4, y + 26 + long), (CX - 3, y + 24 + long)))
        self.lines.append(P('M', (CX - 3, y + 24 + long), 'Q', (CX, y + 27 + long), (CX + 3, y + 24 + long)))
        self.lines.append(P('M', (CX + 3, y + 24 + long), 'C', (CX + 4, y + 26 + long), (CX + 11 * wide, y + 25 + long), (CX + 9 * wide, y + 19 + long)))
        self.violet.append(P('M', (CX + 5, y + 4), 'C', (CX + 6, y + 10 + long), (CX + 9 * wide, y + 14 + long), (CX + 9 * wide, y + 18 + long)))

    def mouth(self, y=146, width=11):
        s = self.smile
        if s:   # a closed-lip grin: corners lifted, lower lip, cheeks pushed up
            self.lines.append(P('M', (CX - width - 3, y - 4), 'C', (CX - 7, y + 3 + 2 * s), (CX + 7, y + 3 + 2 * s), (CX + width + 3, y - 4)))
            self.thin.append(P('M', (CX - width - 5, y - 2), 'q', (-2, -2), (-1, -5)))
            self.thin.append(P('M', (CX + width + 5, y - 2), 'q', (2, -2), (1, -5)))
            self.thin.append(P('M', (CX - 7, y + 9 + 2 * s), 'Q', (CX, y + 12 + 2 * s), (CX + 7, y + 9 + 2 * s)))
            self.thin.append(P('M', (CX - 26, y - 22), 'q', (2, 4), (6, 5)))
            self.thin.append(P('M', (CX + 26, y - 22), 'q', (-2, 4), (-6, 5)))
        else:
            self.lines.append(P('M', (CX - width, y), 'C', (CX - 5, y - 2.5), (CX - 2, y + 0.5), (CX, y), 'C', (CX + 2, y + 0.5), (CX + 5, y - 2.5), (CX + width, y)))
            self.thin.append(P('M', (CX - 4, y - 6), 'L', (CX - 2, y - 2)))
            self.thin.append(P('M', (CX + 4, y - 6), 'L', (CX + 2, y - 2)))
            self.thin.append(P('M', (CX - 6, y + 7), 'Q', (CX, y + 9.5), (CX + 6, y + 7)))
        if s or self.age:   # smile lines
            self.thin.append(P('M', (CX - 12, y - 16), 'q', (-6, 8), (-3, 18)))
            self.thin.append(P('M', (CX + 12, y - 16), 'q', (6, 8), (3, 18)))

    def neck(self):
        self.lines.append(P('M', (CX - 15, self.chin - 10), 'C', (CX - 15, self.chin + 4), (CX - 16, 176), (CX - 17, 184)))
        self.lines.append(P('M', (CX + 15, self.chin - 10), 'C', (CX + 15, self.chin + 4), (CX + 16, 176), (CX + 17, 184)))

    def shade(self):
        w, c = self.w, self.chin
        self.fills.append(('hv', P('M', (CX + 14, 62), 'C', (CX + 30, 70), (CX + w, 88), (CX + w, 108), 'C', (CX + w, 140), (CX + 20, c - 4), (CX + 2, c),
                                   'C', (CX + 16, 150), (CX + 25, 128), (CX + 24, 108), 'C', (CX + 23, 90), (CX + 20, 74), (CX + 14, 62), 'Z')))

    def body(self, kind='jacket'):
        sh = P('M', (20, 220), 'C', (28, 194), (58, 186), (CX - 17, 182), 'L', (CX + 17, 182), 'C', (142, 186), (172, 194), (180, 220), 'Z')
        self.fills.append(('hc', sh))
        self.lines.append(P('M', (20, 220), 'C', (28, 194), (58, 186), (CX - 17, 182)))
        self.lines.append(P('M', (180, 220), 'C', (172, 194), (142, 186), (CX + 17, 182)))
        self.thin.append(P('M', (48, 200), 'q', (2, 10), (0, 20)))
        self.thin.append(P('M', (152, 200), 'q', (-2, 10), (0, 20)))
        if kind == 'jacket':
            self.lines.append(P('M', (CX - 17, 182), 'L', (CX, 204), 'L', (CX + 17, 182)))
            self.lines.append(P('M', (CX - 28, 186), 'L', (CX - 9, 218)))
            self.lines.append(P('M', (CX + 28, 186), 'L', (CX + 9, 218)))
        elif kind == 'tie':
            self.lines.append(P('M', (CX - 17, 182), 'L', (CX - 4, 198), 'L', (CX + 4, 198), 'L', (CX + 17, 182)))
            self.lines.append(P('M', (CX - 4, 198), 'L', (CX - 7, 220)))
            self.lines.append(P('M', (CX + 4, 198), 'L', (CX + 7, 220)))
            self.fills.append(('hv', P('M', (CX - 4, 198), 'L', (CX + 4, 198), 'L', (CX + 7, 220), 'L', (CX - 7, 220), 'Z')))
            self.lines.append(P('M', (CX - 30, 186), 'L', (CX - 12, 220)))
            self.lines.append(P('M', (CX + 30, 186), 'L', (CX + 12, 220)))
        elif kind == 'band':        # bandhgala: a high, closed collar
            self.lines.append(P('M', (CX - 19, 180), 'L', (CX - 19, 189), 'Q', (CX, 198), (CX + 19, 189), 'L', (CX + 19, 180)))
            self.lines.append(P('M', (CX, 195), 'L', (CX, 220)))
            for y in (204, 214):
                self.dots.append((CX + 4, y, 1.7))
        elif kind == 'sweater':
            self.lines.append(P('M', (CX - 18, 182), 'Q', (CX, 200), (CX + 18, 182)))
            self.thin.append(P('M', (CX - 22, 186), 'Q', (CX, 206), (CX + 22, 186)))
            for k in range(7):
                self.thin.append(P('M', (CX - 70 + k * 22, 206), 'q', (2, 6), (0, 12)))
        elif kind == 'open':
            self.lines.append(P('M', (CX - 17, 182), 'L', (CX - 2, 206), 'L', (CX + 17, 182)))
            self.lines.append(P('M', (CX - 17, 182), 'L', (CX - 25, 199), 'L', (CX - 8, 197)))
            self.lines.append(P('M', (CX + 17, 182), 'L', (CX + 25, 199), 'L', (CX + 8, 197)))
        elif kind == 'dress':
            self.lines.append(P('M', (CX - 16, 176), 'Q', (CX, 186), (CX + 16, 176)))
            self.lines.append(P('M', (CX - 16, 176), 'L', (CX - 18, 186)))
            self.lines.append(P('M', (CX + 16, 176), 'L', (CX + 18, 186)))
            self.fills.append(('hc', sh))
        elif kind == 'cravat':
            self.lines.append(P('M', (CX - 14, 182), 'Q', (CX, 192), (CX + 14, 182)))
            self.lines.append(P('M', (CX - 12, 188), 'C', (CX - 16, 200), (CX - 4, 210), (CX, 204), 'C', (CX + 4, 210), (CX + 16, 200), (CX + 12, 188)))
            self.thin.append(P('M', (CX - 6, 196), 'q', (6, 8), (12, 0)))

    # ---------- hair
    def mass(self, inner, outer, n=60, mode='across', curl=4.0, drift=0, gold=0.6, along=9, outline=True, wild=0.0):
        r = self.r
        a, b = sample(inner, n), sample(outer, n)
        self.fills.append(('hg', P('M', a[0]) + ' ' + ' '.join(P('L', p) for p in a[1:] + b[::-1]) + ' Z'))
        if outline:
            self.lines.append(chain_path(outer))
            self.thin.append(chain_path(inner))
        if mode == 'across':
            for i in range(n):
                p0 = a[i]
                j = max(0, min(n - 1, i + drift + r.randint(-2, 2)))
                p1 = lerp(p0, b[j], r.uniform(0.75, 1.05 + wild))
                m = lerp(p0, p1, 0.5)
                dx, dy = p1[0] - p0[0], p1[1] - p0[1]
                L = math.hypot(dx, dy) or 1
                k = r.uniform(-curl, curl)
                c = (m[0] - dy / L * k, m[1] + dx / L * k)
                (self.thin if r.random() < gold else self.violet).append(P('M', p0, 'Q', c, p1))
        else:   # strands that run along the whole length of the mass
            for k in range(along):
                u = (k + 0.5) / along
                pts = []
                for i in range(0, n, 4):
                    p = lerp(a[i], b[i], u + r.uniform(-0.06, 0.06))
                    pts.append((p[0] + r.uniform(-curl, curl) * 0.3, p[1] + r.uniform(-curl, curl) * 0.3))
                pts.append(lerp(a[-1], b[-1], u))
                (self.thin if k % 3 else self.violet).append(smooth(pts))

    def svg(self):
        g = lambda ps: ''.join(f'<path d="{d}"/>' for d in ps)
        fills = ''.join(f'<path class="{c}" d="{d}"/>' for c, d in self.fills)
        lines = g(self.lines)
        rings = ''.join(f'<circle cx="{f(x)}" cy="{f(y)}" r="{f(r)}"/>' for x, y, r in self.rings)
        dots = ''.join(f'<circle cx="{f(x)}" cy="{f(y)}" r="{f(r)}"/>' for x, y, r in self.dots)
        return (f'<circle class="mhalo" cx="100" cy="108" r="88"/>'
                f'<g class="mfill">{fills}</g>'
                f'<g class="mv">{g(self.violet)}</g><g class="mc">{g(self.cobalt)}</g>'
                f'<g class="mt">{g(self.thin)}</g>'
                f'<g class="ml">{lines}{rings}</g><g class="ml2">{lines}</g>'
                f'<g class="mdot">{dots}</g>')

def W(F):
    return F.w

# ---------------------------------------------------------------- people
def einstein():
    F = Face(1879, w=37, chin=166, brow=1.8, age=1)
    w = F.w
    F.jawline(98); F.ears(); F.eyes(); F.nose(wide=1.15, long=1); F.neck(); F.shade(); F.body('sweater')
    F.thin += [P('M', (CX - 20, 78), 'Q', (CX, 74), (CX + 20, 78)), P('M', (CX - 16, 85), 'Q', (CX, 81), (CX + 16, 85))]
    for k in range(16):                          # the bushy moustache
        x = CX - 19 + k * 2.6
        F.lines.append(P('M', (x, 135 + abs(x - CX) * 0.08), 'q', ((x - CX) * 0.06, 6), ((x - CX) * 0.14, 11)))
    F.lines.append(P('M', (CX - 20, 138), 'Q', (CX, 129), (CX + 20, 138)))
    F.thin.append(P('M', (CX - 8, 152), 'Q', (CX, 154), (CX + 8, 152)))
    inner = [((CX - w, 98), (CX - w, 78), (CX - 22, 66), (CX, 66)), ((CX, 66), (CX + 22, 66), (CX + w, 78), (CX + w, 98))]
    outer = [((CX - w - 4, 124), (CX - 86, 104), (CX - 64, 26), (CX, 34)), ((CX, 34), (CX + 64, 22), (CX + 88, 100), (CX + w + 4, 126))]
    F.mass(inner, outer, n=110, curl=14, gold=0.65, outline=False, wild=0.35)
    return F.svg()

def newton():
    F = Face(1643, w=35, chin=172, jaw=0.6)
    w = F.w
    F.jawline(104); F.eyes(gap=15); F.nose(wide=1.0, long=4); F.mouth(151, 10); F.neck(); F.shade(); F.body('cravat')
    for s in (-1, 1):   # the long wig, parted in the centre, falling past the shoulders in curls
        inner = [((CX, 60), (CX + s * 22, 60), (CX + s * w, 74), (CX + s * w, 104)), ((CX + s * w, 104), (CX + s * w, 140), (CX + s * (w + 4), 170), (CX + s * (w + 10), 204))]
        outer = [((CX, 56), (CX + s * 34, 38), (CX + s * 62, 60), (CX + s * 62, 100)), ((CX + s * 62, 100), (CX + s * 66, 140), (CX + s * 74, 176), (CX + s * 70, 210))]
        F.mass(inner, outer, n=64, mode='along', along=8, curl=10)
        for k in range(6):
            y = 100 + k * 18
            x = CX + s * (58 + (k % 2) * 6)
            F.lines.append(P('M', (x, y), 'c', (s * 11, 2), (s * 11, 15), (0, 15), 'c', (-s * 7, 0), (-s * 7, -9), (0, -8)))
    F.lines.append(P('M', (CX - w, 104), 'C', (CX - w, 74), (CX - 22, 60), (CX, 60), 'C', (CX + 22, 60), (CX + w, 74), (CX + w, 104)))
    return F.svg()

def headwrap(F, top=38, edge=92, folds=5, loose=False):
    w = F.w + 7
    F.lines.append(P('M', (CX - w, edge + 2), 'C', (CX - w - 5, top + 24), (CX - 26, top), (CX, top), 'C', (CX + 26, top), (CX + w + 5, top + 24), (CX + w, edge + 2)))
    F.lines.append(P('M', (CX - w, edge + 2), 'Q', (CX, edge - 12), (CX + w, edge + 2)))
    F.fills.append(('hg', P('M', (CX - w, edge + 2), 'C', (CX - w - 5, top + 24), (CX - 26, top), (CX, top), 'C', (CX + 26, top), (CX + w + 5, top + 24), (CX + w, edge + 2), 'Q', (CX, edge - 12), (CX - w, edge + 2), 'Z')))
    for k in range(folds):
        t = (k + 1) / (folds + 1)
        y0 = edge - 6 - (edge - top) * t * 0.95
        if loose:
            F.lines.append(P('M', (CX - w + 6 * t, y0 + 8), 'C', (CX - 22, y0 - 8), (CX + 14, y0 + 10), (CX + w - 3 * t, y0 - 4)))
            F.violet.append(P('M', (CX - w + 10 * t, y0 + 12), 'C', (CX - 18, y0), (CX + 14, y0 + 14), (CX + w - 6 * t, y0 + 2)))
        else:   # wrapped bands crossing at the front
            F.lines.append(P('M', (CX - w + 4 * t, y0 + 16), 'Q', (CX - 6, y0 - 4), (CX + 8, y0 - 14 + 10 * t)))
            F.lines.append(P('M', (CX + w - 4 * t, y0 + 16), 'Q', (CX + 6, y0 - 4), (CX - 8, y0 - 14 + 10 * t)))
            F.violet.append(P('M', (CX - w + 8 * t, y0 + 20), 'Q', (CX - 4, y0 + 2), (CX + 6, y0 - 8 + 10 * t)))

def raman():
    F = Face(1888, w=37, chin=168, age=1)
    F.jawline(98); F.ears(); F.eyes(); F.nose(wide=1.15); F.mouth(147); F.neck(); F.shade(); F.body('band')
    headwrap(F, top=34, edge=92, folds=4)
    return F.svg()

def euler():
    F = Face(1707, w=38, chin=170, jaw=1.3, age=1)
    F.jawline(100); F.eyes(gap=16); F.nose(wide=1.2, long=3); F.mouth(149); F.neck(); F.shade(); F.body('cravat')
    headwrap(F, top=40, edge=88, folds=4, loose=True)
    F.lines.append(P('M', (CX + 44, 64), 'C', (CX + 60, 76), (CX + 58, 110), (CX + 50, 130)))     # the cloth falling at the side
    F.lines.append(P('M', (CX + 44, 64), 'C', (CX + 50, 84), (CX + 48, 108), (CX + 42, 124)))
    F.fills.append(('hg', P('M', (CX + 44, 64), 'C', (CX + 60, 76), (CX + 58, 110), (CX + 50, 130), 'L', (CX + 42, 124), 'C', (CX + 48, 108), (CX + 50, 84), (CX + 44, 64), 'Z')))
    F.thin.append(P('M', (CX - 14, 162), 'Q', (CX, 168), (CX + 14, 162)))
    return F.svg()

def curie():
    F = Face(1867, w=34, chin=166, jaw=0.7)
    w = F.w
    F.jawline(104); F.eyes(gap=15, size=8); F.nose(wide=0.9); F.mouth(146, 9); F.neck(); F.shade(); F.body('dress')
    for s in (-1, 1):   # hair parted in the middle, pulled back loosely, frizzy at the front
        inner = [((CX, 72), (CX + s * 16, 70), (CX + s * (w - 2), 80), (CX + s * w, 106))]
        outer = [((CX, 48), (CX + s * 26, 44), (CX + s * 52, 64), (CX + s * (w + 8), 112))]
        F.mass(inner, outer, n=46, curl=9, drift=s * 3, gold=0.55)
    F.lines.append(P('M', (CX - 14, 46), 'C', (CX - 12, 36), (CX + 12, 36), (CX + 14, 46)))   # the knot at the back
    return F.svg()

def kalam():
    F = Face(1931, w=37, chin=166, smile=1, age=1, brow=1.3)
    w = F.w
    F.jawline(108); F.eyes(gap=15); F.nose(wide=1.3); F.mouth(146, 11); F.neck(); F.shade(); F.body('band')
    part = (CX - 16, 50)
    # the famous long silver hair: side parting, a thick sweep across the forehead, falling over both ears to the jaw
    F.mass([(part, (CX - 28, 58), (CX - w, 76), (CX - w, 108)), ((CX - w, 108), (CX - w, 124), (CX - w + 1, 136), (CX - w + 4, 146))],
           [(part, (CX - 42, 40), (CX - 60, 70), (CX - 56, 104)), ((CX - 56, 104), (CX - 56, 124), (CX - 54, 140), (CX - 46, 154))],
           n=72, mode='along', along=11, curl=7)
    F.mass([(part, (CX - 6, 72), (CX + 16, 82), (CX + w, 88)), ((CX + w, 88), (CX + w, 112), (CX + w, 132), (CX + w - 3, 146))],
           [(part, (CX + 22, 36), (CX + 60, 60), (CX + 56, 102)), ((CX + 56, 102), (CX + 56, 124), (CX + 54, 140), (CX + 46, 154))],
           n=72, mode='along', along=13, curl=7)
    for s in (-1, 1):   # tips curling at the bottom
        F.lines.append(P('M', (CX + s * 46, 154), 'q', (s * -6, 4), (s * -12, -2)))
    return F.svg()

def bhabha():
    F = Face(1909, w=35, chin=170, jaw=0.6)
    w = F.w
    F.jawline(100); F.ears(); F.eyes(gap=15); F.nose(wide=1.0, long=3); F.mouth(149, 10); F.neck(); F.shade(); F.body('tie')
    inner = [((CX - w, 96), (CX - w + 2, 76), (CX - 20, 66), (CX - 10, 64)), ((CX - 10, 64), (CX + 10, 64), (CX + 28, 68), (CX + w, 90))]
    outer = [((CX - w - 2, 100), (CX - w - 8, 54), (CX - 16, 36), (CX + 6, 38)), ((CX + 6, 38), (CX + 32, 38), (CX + w + 8, 60), (CX + w + 2, 98))]
    F.mass(inner, outer, n=60, curl=3, drift=6, gold=0.6)
    return F.svg()

def ramanujan():
    F = Face(1887, w=41, chin=168, jaw=1.7)
    w = F.w
    F.jawline(100); F.ears(); F.eyes(gap=17, size=9.5, iris=3.8); F.nose(wide=1.35); F.mouth(149, 10); F.neck(); F.shade(); F.body('jacket')
    inner = [((CX - w, 98), (CX - w + 2, 78), (CX - 20, 70), (CX - 8, 70)), ((CX - 8, 70), (CX + 12, 68), (CX + 30, 72), (CX + w, 94))]
    outer = [((CX - w - 2, 100), (CX - w - 6, 60), (CX - 20, 48), (CX + 2, 50)), ((CX + 2, 50), (CX + 26, 48), (CX + w + 6, 62), (CX + w + 2, 98))]
    F.mass(inner, outer, n=70, curl=2.5, drift=-2, gold=0.55)
    return F.svg()

def sn_bose():
    F = Face(1894, w=38, chin=168, jaw=1.2, age=1)
    w = F.w
    F.jawline(98); F.ears(); F.eyes(gap=16, size=7.5, iris=3); F.nose(wide=1.1); F.neck(); F.shade(); F.body('band')
    F.forehead(60)
    F.thin += [P('M', (CX - 18, 76), 'Q', (CX, 72), (CX + 18, 76))]
    for s in (-1, 1):   # round glasses
        F.lines.append(P('M', (CX + s * 16 - 12, 108), 'a', (12, 12), '0 1 0', (24, 0), 'a', (12, 12), '0 1 0', (-24, 0)))
        F.lines.append(P('M', (CX + s * 28, 106), 'L', (CX + s * 38, 102)))
    F.lines.append(P('M', (CX - 4, 106), 'Q', (CX, 103), (CX + 4, 106)))
    F.lines.append(P('M', (CX - 17, 141), 'Q', (CX - 8, 132), (CX, 136), 'Q', (CX + 8, 132), (CX + 17, 141)))   # moustache
    F.lines.append(P('M', (CX - 17, 141), 'Q', (CX, 143), (CX + 17, 141)))
    for k in range(9):
        x = CX - 14 + k * 3.5
        F.thin.append(P('M', (x, 136), 'l', ((x - CX) * 0.08, 5)))
    F.thin.append(P('M', (CX - 8, 151), 'Q', (CX, 153), (CX + 8, 151)))
    for s in (-1, 1):   # grey hair at the sides only
        F.mass([((CX + s * 26, 66), (CX + s * 34, 70), (CX + s * w, 84), (CX + s * w, 100))],
               [((CX + s * 24, 62), (CX + s * 40, 62), (CX + s * (w + 7), 80), (CX + s * (w + 3), 102))], n=20, curl=3, gold=0.5)
    for k in range(6):
        F.thin.append(P('M', (CX - 22 + k * 9, 63 + abs(k - 2.5) * 1.5), 'q', (6, -5), (13, -2)))
    return F.svg()

def jc_bose():
    F = Face(1858, w=39, chin=170, jaw=1.3, age=1, brow=1.4)
    w = F.w
    F.jawline(98); F.ears(); F.eyes(gap=16); F.nose(wide=1.2, long=2); F.neck(); F.shade(); F.body('band')
    F.forehead(62)
    F.thin += [P('M', (CX - 16, 78), 'Q', (CX, 74), (CX + 16, 78)), P('M', (CX - 12, 84), 'Q', (CX, 81), (CX + 12, 84))]
    F.lines.append(P('M', (CX - 23, 147), 'C', (CX - 16, 132), (CX - 6, 132), (CX, 136), 'C', (CX + 6, 132), (CX + 16, 132), (CX + 23, 147)))   # full moustache
    F.fills.append(('hg', P('M', (CX - 23, 147), 'C', (CX - 16, 132), (CX - 6, 132), (CX, 136), 'C', (CX + 6, 132), (CX + 16, 132), (CX + 23, 147), 'Q', (CX, 142), (CX - 23, 147), 'Z')))
    for k in range(12):
        x = CX - 20 + k * 3.6
        F.thin.append(P('M', (x, 136), 'q', ((x - CX) * 0.1, 5), ((x - CX) * 0.2, 9)))
    F.thin.append(P('M', (CX - 8, 155), 'Q', (CX, 157), (CX + 8, 155)))
    for s in (-1, 1):
        F.mass([((CX + s * 24, 66), (CX + s * 34, 70), (CX + s * w, 84), (CX + s * w, 100))],
               [((CX + s * 22, 62), (CX + s * 40, 60), (CX + s * (w + 8), 78), (CX + s * (w + 3), 102))], n=22, curl=3, gold=0.5)
    return F.svg()

def faraday():
    F = Face(1791, w=36, chin=170, jaw=0.8)
    w = F.w
    F.jawline(104); F.eyes(gap=15); F.nose(wide=1.0, long=3); F.mouth(150, 10); F.neck(); F.shade(); F.body('cravat')
    inner = [((CX - w, 104), (CX - w, 82), (CX - 18, 70), (CX - 4, 74)), ((CX - 4, 74), (CX + 14, 68), (CX + 30, 74), (CX + w, 100))]
    outer = [((CX - w - 10, 112), (CX - 60, 60), (CX - 24, 36), (CX, 40)), ((CX, 40), (CX + 28, 34), (CX + 62, 62), (CX + w + 10, 112))]
    F.mass(inner, outer, n=70, curl=9, gold=0.6)
    for s in (-1, 1):   # side whiskers
        F.mass([((CX + s * w, 104), (CX + s * w, 118), (CX + s * (w - 2), 132), (CX + s * (w - 6), 144))],
               [((CX + s * (w + 9), 110), (CX + s * (w + 8), 124), (CX + s * (w + 4), 140), (CX + s * (w - 2), 150))], n=18, curl=2, gold=0.5)
    return F.svg()

def turing():
    F = Face(1912, w=35, chin=168, jaw=0.8)
    w = F.w
    F.jawline(102); F.ears(); F.eyes(gap=15); F.nose(wide=1.0, long=1); F.mouth(147, 10); F.neck(); F.shade(); F.body('tie')
    inner = [((CX - w, 98), (CX - w + 2, 80), (CX - 22, 72), (CX - 12, 68)), ((CX - 12, 68), (CX + 4, 76), (CX + 26, 72), (CX + w, 92))]
    outer = [((CX - w - 3, 102), (CX - w - 8, 58), (CX - 18, 40), (CX + 4, 42)), ((CX + 4, 42), (CX + 32, 42), (CX + w + 8, 62), (CX + w + 3, 100))]
    F.mass(inner, outer, n=66, curl=6, drift=5, gold=0.5)
    F.lines.append(P('M', (CX - 12, 68), 'L', (CX - 16, 46)))    # the side parting
    return F.svg()

def feynman():
    F = Face(1918, w=36, chin=170, jaw=0.9, smile=2, brow=1.1, age=1)
    w = F.w
    F.jawline(102); F.ears(); F.eyes(gap=15, size=8); F.nose(wide=1.1, long=2); F.mouth(148, 12); F.neck(); F.shade(); F.body('open')
    inner = [((CX - w, 94), (CX - w + 4, 72), (CX - 16, 62), (CX, 64)), ((CX, 64), (CX + 16, 62), (CX + w - 4, 72), (CX + w, 94))]
    outer = [((CX - w - 4, 100), (CX - w - 12, 48), (CX - 16, 28), (CX + 4, 32)), ((CX + 4, 32), (CX + 30, 30), (CX + w + 12, 50), (CX + w + 4, 100))]
    F.mass(inner, outer, n=72, curl=11, gold=0.6)
    return F.svg()

# ---------------------------------------------------------------- idea portraits (no likeness survives)
def emblem(lines, violet=(), cobalt=(), fills=(), extra=''):
    g = lambda ps: ''.join(f'<path d="{d}"/>' for d in ps)
    fl = ''.join(f'<path class="{c}" d="{d}"/>' for c, d in fills)
    return (f'<circle class="mhalo" cx="100" cy="108" r="88"/><g class="mfill">{fl}</g><g class="mv">{g(violet)}</g><g class="mc">{g(cobalt)}</g>'
            f'<g class="ml">{g(lines)}</g><g class="ml2">{g(lines)}</g>{extra}')

def archimedes():
    L = [P('M', (52, 50), 'A', (48, 12), '0 0 0', (148, 50), 'A', (48, 12), '0 0 0', (52, 50)),
         P('M', (52, 50), 'L', (52, 166)), P('M', (148, 50), 'L', (148, 166)),
         P('M', (52, 166), 'A', (48, 12), '0 0 0', (148, 166)),
         P('M', (52, 108), 'a', (48, 48), '0 1 0', (96, 0), 'a', (48, 48), '0 1 0', (-96, 0))]
    V = [P('M', (52, 108), 'A', (48, 12), '0 0 0', (148, 108)), P('M', (100, 60), 'A', (14, 48), '0 0 0', (100, 156))]
    C = [P('M', (52, 166), 'A', (48, 12), '0 0 1', (148, 166))]
    fills = [('hc', P('M', (124, 70), 'A', (48, 48), '0 0 1', (124, 146), 'A', (30, 48), '0 0 0', (124, 70), 'Z')),
             ('hv', P('M', (132, 60), 'L', (148, 56), 'L', (148, 166), 'L', (132, 172), 'Z'))]
    return emblem(L, V, C, fills, '<text class="mtxt" x="100" y="200" text-anchor="middle">sphere : cylinder = 2 : 3</text>')

def aryabhata():
    L = [P('M', (54, 104), 'a', (46, 46), '0 1 0', (92, 0), 'a', (46, 46), '0 1 0', (-92, 0)),
         P('M', (40, 70), 'C', (20, 110), (60, 170), (110, 160)), P('M', (160, 140), 'C', (180, 100), (150, 50), (96, 50))]
    V = [P('M', (54, 104), 'A', (46, 14), '0 0 0', (146, 104)), P('M', (100, 58), 'A', (18, 46), '0 0 0', (100, 150)),
         P('M', (100, 58), 'A', (36, 46), '0 0 1', (100, 150)), P('M', (62, 80), 'A', (42, 10), '0 0 0', (138, 80)), P('M', (62, 128), 'A', (42, 10), '0 0 0', (138, 128))]
    heads = [P('M', (110, 160), 'l', (-9, -6), 'l', (1, 10), 'z'), P('M', (96, 50), 'l', (9, 6), 'l', (-1, -10), 'z')]
    fills = [('hc', P('M', (100, 58), 'A', (46, 46), '0 0 1', (100, 150), 'A', (24, 46), '0 0 0', (100, 58), 'Z'))]
    stars = ''.join(f'<circle class="mstar" cx="{x}" cy="{y}" r="1.6"/>' for x, y in ((30, 40), (172, 36), (164, 176), (34, 168), (186, 92), (16, 120)))
    extra = f'<path class="mhead" d="{heads[0]}"/><path class="mhead" d="{heads[1]}"/>{stars}<text class="mtxt" x="100" y="200" text-anchor="middle">π ≈ 3.1416</text>'
    return emblem(L, V, (), fills, extra)

def brahmagupta():
    outer0 = P('M', (100, 46), 'C', (138, 46), (146, 86), (146, 104), 'C', (146, 130), (130, 160), (100, 160), 'C', (70, 160), (54, 130), (54, 104), 'C', (54, 80), (66, 46), (100, 46), 'Z')
    inner0 = P('M', (100, 58), 'C', (126, 58), (132, 88), (132, 104), 'C', (132, 126), (122, 148), (100, 148), 'C', (78, 148), (68, 126), (68, 104), 'C', (68, 84), (76, 58), (100, 58), 'Z')
    inner_rev = P('M', (100, 58), 'C', (76, 58), (68, 84), (68, 104), 'C', (68, 126), (78, 148), (100, 148), 'C', (122, 148), (132, 126), (132, 104), 'C', (132, 88), (126, 58), (100, 58), 'Z')
    C = [P('M', (24, 178), 'L', (176, 178))] + [P('M', (40 + 24 * k, 173), 'L', (40 + 24 * k, 183)) for k in range(6)]
    nums = ''.join(f'<text class="mtick" x="{40 + 24 * k}" y="196" text-anchor="middle">{n}</text>' for k, n in enumerate(['−3', '−2', '−1', '0', '1', '2']))
    return emblem([outer0, inner0], (), C, [('hg', outer0 + ' ' + inner_rev)], nums + '<text class="mtxt" x="100" y="214" text-anchor="middle">a − a = 0</text>')

PEOPLE = {
    'archimedes': archimedes, 'aryabhata': aryabhata, 'brahmagupta': brahmagupta, 'newton': newton, 'euler': euler,
    'faraday': faraday, 'jc-bose': jc_bose, 'curie': curie, 'einstein': einstein, 'ramanujan': ramanujan,
    'raman': raman, 'sn-bose': sn_bose, 'bhabha': bhabha, 'turing': turing, 'feynman': feynman, 'kalam': kalam,
}

if __name__ == '__main__':
    here = os.path.dirname(os.path.abspath(__file__))
    out = {k: fn() for k, fn in PEOPLE.items()}
    path = os.path.join(here, '../src/data/minds-art.json')
    with open(path, 'w') as fh:
        json.dump(out, fh, ensure_ascii=False, indent=0)
        fh.write('\n')
    print(path, sum(len(v) for v in out.values()), 'bytes')
