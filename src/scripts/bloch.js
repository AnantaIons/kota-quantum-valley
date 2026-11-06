// Draws a Bloch sphere into an <svg> with a draggable 3D view.
// Front-facing parts are solid, back-facing parts faint, so depth reads correctly.
const NS = 'http://www.w3.org/2000/svg';

export function createBloch(svg, opts = {}) {
  const size = 440, cx = 220, cy = 220, R = opts.radius ?? 160;
  const view = { yaw: opts.yaw ?? -0.62, pitch: opts.pitch ?? 0.32 };
  let vec = [0, 0, 1], trace = null, extraYaw = 0, extraPitch = 0;
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);

  const proj = ([x, y, z]) => {
    const yaw = view.yaw + extraYaw, p = view.pitch + extraPitch;
    const xr = x * Math.cos(yaw) - y * Math.sin(yaw), yr = x * Math.sin(yaw) + y * Math.cos(yaw);
    return { sx: cx + R * yr, sy: cy - R * (z * Math.cos(p) - xr * Math.sin(p)), d: xr * Math.cos(p) + z * Math.sin(p) };
  };
  const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); (parent || svg).appendChild(e); return e; };

  const defs = el('defs', {});
  const g1 = el('radialGradient', { id: svg.id + '-g', cx: '38%', cy: '30%', r: '78%' }, defs);
  el('stop', { offset: '0', 'stop-color': '#0047AB', 'stop-opacity': '0.55' }, g1);
  el('stop', { offset: '0.7', 'stop-color': '#0B1026', 'stop-opacity': '0.15' }, g1);
  el('stop', { offset: '1', 'stop-color': '#E6C36A', 'stop-opacity': '0.08' }, g1);
  el('circle', { cx, cy, r: R, fill: `url(#${svg.id}-g)`, stroke: 'rgba(41,121,255,0.6)', 'stroke-width': 1.4 });
  const layer = el('g', {});

  function circlePts(fn, n = 96) { const pts = []; for (let i = 0; i <= n; i++) pts.push(proj(fn((i / n) * Math.PI * 2))); return pts; }
  function drawCurve(pts, color, w, dashBack = true) {
    let seg = [], front = pts[0].d >= 0;
    const flush = () => { if (seg.length > 1) el('polyline', { points: seg.map((p) => `${p.sx.toFixed(1)},${p.sy.toFixed(1)}`).join(' '), fill: 'none', stroke: color, 'stroke-width': w, 'stroke-opacity': front ? 0.85 : 0.25, 'stroke-dasharray': !front && dashBack ? '4 6' : '' }, layer); };
    for (const p of pts) { const f = p.d >= 0; if (f !== front) { seg.push(p); flush(); seg = [p]; front = f; } else seg.push(p); }
    flush();
  }
  function axis(v, label, color) {
    const a = proj(v.map((c) => -c)), b = proj(v), t = proj(v.map((c) => c * 1.16));
    el('line', { x1: a.sx, y1: a.sy, x2: b.sx, y2: b.sy, stroke: color, 'stroke-width': 1.1, 'stroke-opacity': 0.55 }, layer);
    const tx = el('text', { x: t.sx, y: t.sy + 5, 'text-anchor': 'middle', class: 'ket', fill: color }, layer); tx.textContent = label;
  }
  function draw() {
    layer.innerHTML = '';
    drawCurve(circlePts((t) => [Math.cos(t), Math.sin(t), 0]), '#5E95FF', 1.2);
    drawCurve(circlePts((t) => [Math.cos(t), 0, Math.sin(t)]), '#5E95FF', 0.9);
    drawCurve(circlePts((t) => [0, Math.cos(t), Math.sin(t)]), '#5E95FF', 0.9);
    if (trace != null) { const z = trace, r = Math.sqrt(Math.max(0, 1 - z * z)); drawCurve(circlePts((t) => [r * Math.cos(t), r * Math.sin(t), z]), '#E6C36A', 1, true); }
    axis([1, 0, 0], 'x', '#00D4FF'); axis([0, 1, 0], 'y', '#00D4FF'); axis([0, 0, 1], '', '#00D4FF');
    const top = proj([0, 0, 1.12]), bot = proj([0, 0, -1.12]);
    el('text', { x: top.sx + 10, y: top.sy - 4, class: 'ket' }, layer).textContent = '|0⟩';
    el('text', { x: bot.sx + 10, y: bot.sy + 16, class: 'ket' }, layer).textContent = '|1⟩';
    const plus = proj([1.22, 0, 0]); el('text', { x: plus.sx - 10, y: plus.sy + 18, class: 'ket' }, layer).textContent = '|+⟩';
    // state vector
    const o = proj([0, 0, 0]), t = proj(vec), foot = proj([vec[0], vec[1], 0]);
    el('line', { x1: t.sx, y1: t.sy, x2: foot.sx, y2: foot.sy, stroke: '#E6C36A', 'stroke-opacity': 0.35, 'stroke-dasharray': '2 4' }, layer);
    el('line', { x1: o.sx, y1: o.sy, x2: t.sx, y2: t.sy, stroke: '#E6C36A', 'stroke-width': 3.2, 'stroke-linecap': 'round', style: 'filter: drop-shadow(0 0 6px #E6C36A)' }, layer);
    el('circle', { cx: o.sx, cy: o.sy, r: 3.5, fill: '#F4F7FF' }, layer);
    el('circle', { cx: t.sx, cy: t.sy, r: 8, fill: '#E6C36A', 'fill-opacity': t.d < 0 ? 0.55 : 1, style: 'filter: drop-shadow(0 0 10px #E6C36A)' }, layer);
    el('text', { x: t.sx + 12, y: t.sy - 10, class: 'ket ket-live' }, layer).textContent = '|ψ⟩';
  }

  // drag to rotate the view
  let drag = null;
  const host = opts.dragTarget || svg;
  host.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, moved: false }; host.setPointerCapture?.(e.pointerId); });
  host.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
    view.yaw += dx * 0.01; view.pitch = Math.max(-1.3, Math.min(1.3, view.pitch + dy * 0.01));
    drag.x = e.clientX; drag.y = e.clientY; draw();
  });
  const end = () => { const m = drag?.moved; drag = null; return m; };
  host.addEventListener('pointerup', (e) => { if (!end() && opts.onClick) opts.onClick(e); });
  host.addEventListener('pointercancel', end);

  draw();
  return {
    setVec(v) { vec = v; draw(); },
    setTrace(z) { trace = z; draw(); },
    tilt(dx, dy) { extraYaw = dx; extraPitch = dy; draw(); },
    get vec() { return vec; },
  };
}
