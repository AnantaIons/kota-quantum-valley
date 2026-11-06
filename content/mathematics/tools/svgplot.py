"""Tiny SVG plotting helper for Course 2 diagrams.

Every diagram is computed from the mathematics (curves sampled from the actual functions,
points at their exact coordinates), so a figure can never disagree with the text.
Colours and fonts come from CSS classes styled by the chapter page:
  ax, grid, tick, lab, m (math italic), c1 gold, c2 violet, c3 cobalt, c4 cyan, c5 muted,
  dash, p1..p5 (point fills), f1..f3 (soft area fills), t1..t5 (coloured text).
"""
import math, html

def fmt(v):
    s = f"{v:.2f}".rstrip('0').rstrip('.')
    return '0' if s in ('-0', '') else s

class Fig:
    def __init__(self, xr, yr, w=440, h=300, pad=(34, 14, 14, 28), equal=False):
        self.x0, self.x1 = xr
        self.y0, self.y1 = yr
        self.pl, self.pt, self.pr, self.pb = pad
        self.w = w
        if equal:  # same scale on both axes: derive the height from the width
            sx = (w - self.pl - self.pr) / (self.x1 - self.x0)
            h = round(sx * (self.y1 - self.y0) + self.pt + self.pb)
        self.h = h
        self.items = []

    def X(self, x): return self.pl + (x - self.x0) / (self.x1 - self.x0) * (self.w - self.pl - self.pr)
    def Y(self, y): return self.h - self.pb - (y - self.y0) / (self.y1 - self.y0) * (self.h - self.pt - self.pb)
    def P(self, p): return (self.X(p[0]), self.Y(p[1]))

    def add(self, s): self.items.append(s)

    def grid(self, xs, ys):
        for x in xs: self.add(f'<line class="grid" x1="{fmt(self.X(x))}" y1="{fmt(self.Y(self.y0))}" x2="{fmt(self.X(x))}" y2="{fmt(self.Y(self.y1))}"/>')
        for y in ys: self.add(f'<line class="grid" x1="{fmt(self.X(self.x0))}" y1="{fmt(self.Y(y))}" x2="{fmt(self.X(self.x1))}" y2="{fmt(self.Y(y))}"/>')

    def axes(self, xticks=(), yticks=(), xlabel='x', ylabel='y', xt=None, yt=None, origin=(0, 0), xlabel_dy=-8):
        ox = min(max(origin[0], self.x0), self.x1); oy = min(max(origin[1], self.y0), self.y1)
        self.arrow((self.x0, oy), (self.x1, oy), 'ax', head=7)
        self.arrow((ox, self.y0), (ox, self.y1), 'ax', head=7)
        for i, t in enumerate(xticks):
            X, Y = self.X(t), self.Y(oy)
            self.add(f'<line class="ax" x1="{fmt(X)}" y1="{fmt(Y - 3)}" x2="{fmt(X)}" y2="{fmt(Y + 3)}"/>')
            self.add(f'<text class="tick" x="{fmt(X)}" y="{fmt(Y + 15)}" text-anchor="middle">{html.escape(xt[i] if xt else fmt(t))}</text>')
        for i, t in enumerate(yticks):
            X, Y = self.X(ox), self.Y(t)
            self.add(f'<line class="ax" x1="{fmt(X - 3)}" y1="{fmt(Y)}" x2="{fmt(X + 3)}" y2="{fmt(Y)}"/>')
            self.add(f'<text class="tick" x="{fmt(X - 6)}" y="{fmt(Y + 4)}" text-anchor="end">{html.escape(yt[i] if yt else fmt(t))}</text>')
        if xlabel: self.text((self.x1, oy), xlabel, 'lab m', dx=-4, dy=xlabel_dy, anchor='end')
        if ylabel: self.text((ox, self.y1), ylabel, 'lab m', dx=8, dy=12)

    def plot(self, f, cls='c1', n=600, a=None, b=None):
        a = self.x0 if a is None else a; b = self.x1 if b is None else b
        segs, cur = [], []
        for k in range(n + 1):
            x = a + (b - a) * k / n
            try: y = f(x)
            except (ValueError, ZeroDivisionError): y = None
            if y is None or not math.isfinite(y) or y < self.y0 - (self.y1 - self.y0) or y > self.y1 + (self.y1 - self.y0):
                if len(cur) > 1: segs.append(cur)
                cur = []; continue
            cur.append((self.X(x), self.Y(y)))
        if len(cur) > 1: segs.append(cur)
        for s in segs:
            self.add(f'<polyline class="{cls}" clip-path="url(#clip)" points="' + ' '.join(f'{fmt(x)},{fmt(y)}' for x, y in s) + '"/>')

    def path_pts(self, pts, cls='c1', close=False):
        tag = 'polygon' if close else 'polyline'
        self.add(f'<{tag} class="{cls}" points="' + ' '.join(f'{fmt(self.X(x))},{fmt(self.Y(y))}' for x, y in pts) + '"/>')

    def line(self, p, q, cls='c5'):
        (x1, y1), (x2, y2) = self.P(p), self.P(q)
        self.add(f'<line class="{cls}" x1="{fmt(x1)}" y1="{fmt(y1)}" x2="{fmt(x2)}" y2="{fmt(y2)}"/>')

    def arrow(self, p, q, cls='c1', head=9, shorten=0):
        (x1, y1), (x2, y2) = self.P(p), self.P(q)
        L = math.hypot(x2 - x1, y2 - y1)
        if L == 0: return
        ux, uy = (x2 - x1) / L, (y2 - y1) / L
        x2, y2 = x2 - ux * shorten, y2 - uy * shorten
        bx, by = x2 - ux * head, y2 - uy * head
        self.add(f'<line class="{cls}" x1="{fmt(x1)}" y1="{fmt(y1)}" x2="{fmt(bx)}" y2="{fmt(by)}"/>')
        hw = head * 0.5
        pts = [(x2, y2), (bx - uy * hw, by + ux * hw), (bx + uy * hw, by - ux * hw)]
        hc = 'head ' + cls.split()[0]
        self.add(f'<polygon class="{hc}" points="' + ' '.join(f'{fmt(a)},{fmt(b)}' for a, b in pts) + '"/>')

    def arc(self, c, r, t0, t1, cls='c5', n=60, arrow=False):
        pts = [(c[0] + r * math.cos(t0 + (t1 - t0) * k / n), c[1] + r * math.sin(t0 + (t1 - t0) * k / n)) for k in range(n + 1)]
        if arrow:
            self.path_pts(pts[:-3], cls); self.arrow(pts[-4], pts[-1], cls, head=8)
        else:
            self.path_pts(pts, cls)

    def circle(self, c, r, cls='c5'):
        X, Y = self.P(c)
        rx = abs(self.X(c[0] + r) - X); ry = abs(self.Y(c[1] + r) - Y)
        self.add(f'<ellipse class="{cls}" cx="{fmt(X)}" cy="{fmt(Y)}" rx="{fmt(rx)}" ry="{fmt(ry)}"/>')

    def rect(self, x, y, w, h, cls='f1', rx=10):  # in pixel space
        self.add(f'<rect class="{cls}" x="{fmt(x)}" y="{fmt(y)}" width="{fmt(w)}" height="{fmt(h)}" rx="{rx}"/>')

    def point(self, p, cls='p1', r=4.2):
        X, Y = self.P(p)
        self.add(f'<circle class="{cls}" cx="{fmt(X)}" cy="{fmt(Y)}" r="{r}"/>')

    def text(self, p, s, cls='lab', dx=0, dy=0, anchor='start', px=False):
        X, Y = (p if px else self.P(p))
        self.add(f'<text class="{cls}" x="{fmt(X + dx)}" y="{fmt(Y + dy)}" text-anchor="{anchor}">{s}</text>')

    def svg(self, title, uid='d'):
        cx, cy = self.X(self.x0), self.Y(self.y1)
        cw, ch = self.X(self.x1) - cx, self.Y(self.y0) - cy
        cid = 'clip-' + uid                 # ids must be unique when several figures share a page
        clip = f'<defs><clipPath id="{cid}"><rect x="{fmt(cx)}" y="{fmt(cy)}" width="{fmt(cw)}" height="{fmt(ch)}"/></clipPath></defs>'
        return (f'<svg viewBox="0 0 {self.w} {self.h}" role="img" aria-label="{html.escape(title)}" xmlns="http://www.w3.org/2000/svg">'
                + clip + ''.join(self.items).replace('url(#clip)', f'url(#{cid})') + '</svg>\n')

def save(fig, path, title):
    import os
    uid = os.path.splitext(os.path.basename(path))[0]
    with open(path, 'w') as f: f.write(fig.svg(title, uid))
