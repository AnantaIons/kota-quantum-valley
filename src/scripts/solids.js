// Wireframe geometry for the site's shape language: Platonic solids, a torus and an atomic orbital.
// Every [data-solid] SVG is drawn here; it turns slowly while on screen and stays still for
// readers who prefer reduced motion.
const PHI = (1 + Math.sqrt(5)) / 2;
const NS = 'http://www.w3.org/2000/svg';

const edgesByLength = (verts, len) => {
  const out = [];
  for (let i = 0; i < verts.length; i++)
    for (let j = i + 1; j < verts.length; j++) {
      const d = Math.hypot(...verts[i].map((v, k) => v - verts[j][k]));
      if (Math.abs(d - len) < 1e-6) out.push([i, j]);
    }
  return out;
};
const norm = (verts) => { const r = Math.max(...verts.map((v) => Math.hypot(...v))); return verts.map((v) => v.map((x) => x / r)); };
const signs = (n) => Array.from({ length: 2 ** n }, (_, m) => Array.from({ length: n }, (_, k) => (m >> k & 1 ? -1 : 1)));

function polyhedron(name) {
  let v, len;
  if (name === 'tetra') { v = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]]; len = Math.sqrt(8); }
  else if (name === 'cube') { v = signs(3); len = 2; }
  else if (name === 'octa') { v = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]; len = Math.SQRT2; }
  else if (name === 'icosa') {
    v = [];
    for (const [a, b] of signs(2)) v.push([0, a, b * PHI], [a, b * PHI, 0], [b * PHI, 0, a]);
    len = 2;
  } else if (name === 'dodeca') {
    v = signs(3);
    for (const [a, b] of signs(2)) v.push([0, a / PHI, b * PHI], [a / PHI, b * PHI, 0], [b * PHI, 0, a / PHI]);
    len = 2 / PHI;
  }
  const edges = edgesByLength(v, len);
  return { verts: norm(v), edges };
}

// Curves (torus rings, orbital ellipses) are lists of 3D points drawn as polylines.
function curves(name) {
  const out = [];
  if (name === 'torus') {
    const R = 0.68, r = 0.3;
    for (let i = 0; i < 18; i++) {                       // small circles around the tube
      const u = (i / 18) * Math.PI * 2, pts = [];
      for (let k = 0; k <= 24; k++) { const w = (k / 24) * Math.PI * 2; pts.push([(R + r * Math.cos(w)) * Math.cos(u), (R + r * Math.cos(w)) * Math.sin(u), r * Math.sin(w)]); }
      out.push({ pts, tone: 'a' });
    }
    for (let j = 0; j < 6; j++) {                        // rings along the tube
      const w = (j / 6) * Math.PI * 2, pts = [];
      for (let k = 0; k <= 60; k++) { const u = (k / 60) * Math.PI * 2; pts.push([(R + r * Math.cos(w)) * Math.cos(u), (R + r * Math.cos(w)) * Math.sin(u), r * Math.sin(w)]); }
      out.push({ pts, tone: 'b' });
    }
  } else if (name === 'orbital') {
    [0, Math.PI / 3, -Math.PI / 3].forEach((tilt, i) => {
      const pts = [];
      for (let k = 0; k <= 72; k++) {
        const t = (k / 72) * Math.PI * 2, x = Math.cos(t), y = 0.36 * Math.sin(t);
        pts.push([x * Math.cos(tilt) - y * Math.sin(tilt), x * Math.sin(tilt) + y * Math.cos(tilt), 0.25 * Math.sin(t) * (i - 1)]);
      }
      out.push({ pts, tone: i === 0 ? 'b' : 'a' });
    });
  }
  return out;
}

function setup(svg) {
  const shape = svg.dataset.solid;
  const poly = ['tetra', 'cube', 'octa', 'icosa', 'dodeca'].includes(shape) ? polyhedron(shape) : null;
  const curveList = poly ? [] : curves(shape);
  const g = document.createElementNS(NS, 'g');
  svg.appendChild(g);
  const lines = poly ? poly.edges.map(() => g.appendChild(document.createElementNS(NS, 'line'))) : [];
  const polys = curveList.map((c) => { const p = g.appendChild(document.createElementNS(NS, 'polyline')); p.setAttribute('class', `s-${c.tone}`); return p; });
  const dots = poly ? poly.verts.map(() => { const c = g.appendChild(document.createElementNS(NS, 'circle')); c.setAttribute('r', '1.6'); return c; }) : [];
  let nucleus, electrons = [];
  if (shape === 'orbital') {
    nucleus = g.appendChild(document.createElementNS(NS, 'circle')); nucleus.setAttribute('r', '5'); nucleus.setAttribute('class', 's-core');
    electrons = curveList.map(() => { const e = g.appendChild(document.createElementNS(NS, 'circle')); e.setAttribute('r', '2.6'); e.setAttribute('class', 's-e'); return e; });
  }
  const S = 40;                                          // the viewBox runs from -50 to 50
  const tilt = +(svg.dataset.tilt || 0.5);
  const proj = (p, a) => {
    const [x, y, z] = p;
    const x1 = x * Math.cos(a) + z * Math.sin(a), z1 = -x * Math.sin(a) + z * Math.cos(a);
    const y2 = y * Math.cos(tilt) - z1 * Math.sin(tilt), z2 = y * Math.sin(tilt) + z1 * Math.cos(tilt);
    const k = 3.2 / (3.2 - z2);
    return [x1 * k * S, y2 * k * S, z2];
  };
  return (a, time) => {
    if (poly) {
      const P = poly.verts.map((v) => proj(v, a));
      poly.edges.forEach(([i, j], n) => {
        const l = lines[n], z = (P[i][2] + P[j][2]) / 2;
        l.setAttribute('x1', P[i][0].toFixed(2)); l.setAttribute('y1', P[i][1].toFixed(2));
        l.setAttribute('x2', P[j][0].toFixed(2)); l.setAttribute('y2', P[j][1].toFixed(2));
        l.style.opacity = (0.35 + 0.65 * (z + 1) / 2).toFixed(2);
      });
      P.forEach((p, n) => { dots[n].setAttribute('cx', p[0].toFixed(2)); dots[n].setAttribute('cy', p[1].toFixed(2)); dots[n].style.opacity = (0.4 + 0.6 * (p[2] + 1) / 2).toFixed(2); });
    } else {
      curveList.forEach((c, n) => polys[n].setAttribute('points', c.pts.map((p) => proj(p, a)).map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')));
      if (shape === 'orbital') {
        const c0 = proj([0, 0, 0], a); nucleus.setAttribute('cx', c0[0]); nucleus.setAttribute('cy', c0[1]);
        curveList.forEach((c, n) => {
          const idx = Math.floor(((time * (0.25 + 0.08 * n) + n / 3) % 1) * (c.pts.length - 1));
          const p = proj(c.pts[idx], a); electrons[n].setAttribute('cx', p[0].toFixed(2)); electrons[n].setAttribute('cy', p[1].toFixed(2));
        });
      }
    }
  };
}

const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const items = [...document.querySelectorAll('svg[data-solid]')].map((svg) => ({ svg, draw: setup(svg), on: false, speed: +(svg.dataset.speed || 0.25), phase: Math.random() * 6 }));
items.forEach((it) => it.draw(it.phase, 0));
if (!still && items.length) {
  const io = new IntersectionObserver((es) => es.forEach((e) => { const it = items.find((x) => x.svg === e.target); if (it) it.on = e.isIntersecting; }));
  items.forEach((it) => io.observe(it.svg));
  let last = performance.now(), frame = 0;
  const tick = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if ((frame++ & 1) === 0) for (const it of items) if (it.on) { it.phase += dt * 2 * it.speed; it.draw(it.phase, now / 1000); }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
