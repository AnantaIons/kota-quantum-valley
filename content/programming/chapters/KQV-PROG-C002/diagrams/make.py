"""Diagrams for Course 3 Chapter 2. Run: python3 content/programming/chapters/KQV-PROG-C002/diagrams/make.py"""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '../../../tools'))
from flow import Flow
from svgplot import fmt

MONO = ' style="font-family: var(--font-mono)"'

# 1. The 4-bit wheel: unsigned inside, two's complement outside
W, H = 440, 450
d = Flow(W, H)
cx, cy = W / 2, 232
d.f.add(f'<circle class="c5" cx="{fmt(cx)}" cy="{fmt(cy)}" r="116"/>')
for k in range(16):
    a = math.radians(-90 + k * 22.5)
    px, py = lambda r: cx + r * math.cos(a), lambda r: cy + r * math.sin(a)
    s = k if k < 8 else k - 16
    d.f.add(f'<circle class="{"p3" if s >= 0 else "p2"}" cx="{fmt(px(116))}" cy="{fmt(py(116))}" r="4.5"/>')
    d.f.add(f'<text class="lab t3" x="{fmt(px(92))}" y="{fmt(py(92) + 4.5)}" text-anchor="middle">{k}</text>')
    d.f.add(f'<text class="lab small t5" x="{fmt(px(142))}" y="{fmt(py(142) + 4)}" text-anchor="middle"{MONO}>{k:04b}</text>')
    d.f.add(f'<text class="lab {"t1" if s >= 0 else "t2"}" x="{fmt(px(176))}" y="{fmt(py(176) + 4.5)}" text-anchor="middle" font-weight="600">{s}</text>'.replace('>-', '>−'))
# boundaries: unsigned wrap at the top (15 -> 0), signed overflow at the bottom (7 -> -8)
for ang, cls in ((-90 - 11.25, 'c1'), (90 - 11.25, 'c2')):
    a = math.radians(ang)
    d.f.add(f'<line class="{cls} dash" x1="{fmt(cx + 60 * math.cos(a))}" y1="{fmt(cy + 60 * math.sin(a))}" x2="{fmt(cx + 196 * math.cos(a))}" y2="{fmt(cy + 196 * math.sin(a))}"/>')
d.text(cx, 16, 'inside: unsigned 0 to 15 · outside: two’s complement −8 to 7', 'lab small t5')
d.text(cx - 72, 34, 'unsigned wraps: 15 + 1 = 0', 'lab small t1', 'end')
d.text(cx + 50, H - 4, 'signed overflow: 7 + 1 = −8', 'lab small t2', 'start')
# +1 arrow: a short clockwise arc near the centre
r = 34
a0, a1 = math.radians(-150), math.radians(-30)
d.f.add(f'<path class="c5" d="M{fmt(cx + r * math.cos(a0))} {fmt(cy + r * math.sin(a0))} A{r} {r} 0 0 1 {fmt(cx + r * math.cos(a1))} {fmt(cy + r * math.sin(a1))}"/>')
ex, ey = cx + r * math.cos(a1), cy + r * math.sin(a1)
d.f.add(f'<path class="head c5" d="M{fmt(ex + 4)} {fmt(ey - 6)} L{fmt(ex + 3)} {fmt(ey + 5)} L{fmt(ex - 6)} {fmt(ey - 1)} Z"/>')
d.text(cx, cy + 6, '+1', 'lab t5')
d.text(cx, cy + 22, 'one step clockwise', 'lab small t5')
d.save(os.path.join(HERE, 'p2-wheel.svg'), 'A wheel of the sixteen 4-bit patterns. Inside each is its unsigned value, 0 to 15; outside is its two’s complement value, 0 to 7 then −8 to −1. Adding 1 moves one step clockwise. At the top, 15 + 1 wraps to 0; at the bottom, 7 + 1 becomes −8, which is signed overflow.')

# 2. Encoding the rupee sign in UTF-8
W, H = 440, 300
d = Flow(W, H)
d.text(W / 2, 22, '₹ is code point U+20B9', 'lab t5')
groups = [('0010', 't1', 'c1'), ('000010', 't2', 'c2'), ('111001', 't3', 'c3')]
# the 16 bits, split 4 + 6 + 6
xs = [96, 200, 318]
for (bits, t, c), x in zip(groups, xs):
    d.f.add(f'<text class="lab {t}" x="{x}" y="68" text-anchor="middle" font-weight="600"{MONO}>{bits}</text>')
d.text(W / 2, 92, 'its 16 bits, split 4 + 6 + 6', 'lab small t5')
# the three bytes: fixed prefix (muted) + payload (coloured)
prefixes = ['1110', '10', '10']
bx = [24, 160, 296]
for (bits, t, c), p, x, x0 in zip(groups, prefixes, bx, xs):
    d.arrow(x0, 100, x + 60, 150, c)
    d.f.add(f'<rect class="f3 c5" x="{x}" y="156" width="120" height="44" rx="9"/>')
    d.f.add(f'<text class="lab" x="{x + 60}" y="183" text-anchor="middle"{MONO}><tspan class="t5">{p}</tspan><tspan class="{t}" font-weight="600">{bits}</tspan></text>')
for x, h in zip(bx, ['e2', '82', 'b9']):
    d.arrow(x + 60, 200, x + 60, 226, 'c5')
    d.f.add(f'<text class="lab big t5" x="{x + 60}" y="254" text-anchor="middle"{MONO}>{h}</text>')
d.text(W / 2, 290, 'grey bits are fixed: 1110 starts a 3-byte character, 10 marks a continuation', 'lab small t5')
d.save(os.path.join(HERE, 'p2-utf8.svg'), 'Encoding the rupee sign, U+20B9, in UTF-8. Its 16 bits 0010 0000 1011 1001 are split into groups of 4, 6 and 6 bits. Each group is placed after a fixed prefix: 1110 for the first byte of a three-byte character, 10 for each continuation byte. The bytes are e2, 82 and b9.')
