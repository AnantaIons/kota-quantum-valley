"""Box-and-arrow diagrams for Course 3, drawn in pixel coordinates with the Course 2 SVG helper.
Colours come from the chapter page's CSS classes (c1 gold = Python, c3 cobalt = C, c2 violet = shared)."""
import os, sys, html
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../mathematics/tools'))
from svgplot import Fig, save, fmt

class Flow:
    def __init__(self, w, h):
        # y grows downwards: the data window runs from h at the bottom to 0 at the top
        self.f = Fig((0, w), (h, 0), w=w, h=h, pad=(0, 0, 0, 0))
    def box(self, x, y, w, h, lines, tone='c5', fill='f3', bold=False, small=None):
        f = self.f
        f.add(f'<rect class="{fill} {tone}" x="{fmt(x)}" y="{fmt(y)}" width="{fmt(w)}" height="{fmt(h)}" rx="9"/>')
        n = len(lines)
        for k, t in enumerate(lines):
            cls = 'lab' + (' small' if (small if small is not None else k > 0) else '')
            cls += {'c1': ' t1', 'c3': ' t3', 'c2': ' t2'}.get(tone, '') if k == 0 else ' t5'
            yy = y + h / 2 + (k - (n - 1) / 2) * 15 + 4.5
            f.add(f'<text class="{cls}" x="{fmt(x + w / 2)}" y="{fmt(yy)}" text-anchor="middle"{" font-weight=\"600\"" if bold and k == 0 else ""}>{html.escape(t)}</text>')
    def arrow(self, x1, y1, x2, y2, tone='c5', label=None, lx=6, anchor='start'):
        self.f.arrow((x1, y1), (x2, y2), tone, head=7)
        if label:
            self.f.add(f'<text class="lab small t5" x="{fmt((x1 + x2) / 2 + lx)}" y="{fmt((y1 + y2) / 2 + 4)}" text-anchor="{anchor}">{html.escape(label)}</text>')
    def text(self, x, y, s, cls='lab small t5', anchor='middle'):
        self.f.add(f'<text class="{cls}" x="{fmt(x)}" y="{fmt(y)}" text-anchor="{anchor}">{html.escape(s)}</text>')
    def save(self, path, title):
        save(self.f, path, title)
