import { G, GL, V, P, GR, T, M, BG, mono, head, plot, tx, gate } from './kit.js';

// A small Bloch sphere: outline, equator, axes. Returns SVG and a projector for points.
const sphere = (cx, cy, r) => {
  const proj = (x, y, z) => [cx + r * (y * 0.95 - x * 0.35), cy - r * (z * 0.92 - x * 0.22)];
  const svg = `<circle cx='${cx}' cy='${cy}' r='${r}' fill='${V}' fill-opacity='.08' stroke='${M}' stroke-opacity='.55' stroke-width='1.5'/>
    <ellipse cx='${cx}' cy='${cy}' rx='${r}' ry='${(r * 0.3).toFixed(1)}' fill='none' stroke='${M}' stroke-opacity='.45' stroke-width='1.2' stroke-dasharray='4 4'/>
    <line x1='${cx}' y1='${cy - r}' x2='${cx}' y2='${cy + r}' stroke='${M}' stroke-opacity='.4' stroke-width='1'/>`;
  return { svg, proj };
};

export const art = {
  // Bloch sphere with a state arrow and the landmark poles
  'superposition-and-the-bloch-sphere': (() => {
    const { svg, proj } = sphere(200, 125, 92);
    const th = 0.95, ph = 0.9;
    const [px, py] = proj(Math.sin(th) * Math.cos(ph), Math.sin(th) * Math.sin(ph), Math.cos(th));
    const [ex, ey] = proj(1, 0, 0);
    return `${svg}<line x1='200' y1='125' x2='${px.toFixed(1)}' y2='${py.toFixed(1)}' stroke='${G}' stroke-width='4' stroke-linecap='round'/><circle cx='${px.toFixed(1)}' cy='${py.toFixed(1)}' r='7' fill='${G}'/>
      <line x1='${px.toFixed(1)}' y1='${py.toFixed(1)}' x2='${px.toFixed(1)}' y2='${(125 - 0).toFixed(1)}' stroke='${GL}' stroke-opacity='.5' stroke-dasharray='3 4'/>
      <circle cx='${ex.toFixed(1)}' cy='${ey.toFixed(1)}' r='4' fill='${V}'/>
      ${tx(208, 28, '|0⟩', { size: 15, fill: T })}${tx(208, 234, '|1⟩', { size: 15, fill: T })}${tx(ex - 14, ey + 22, '|+⟩', { size: 13, fill: M, anchor: 'middle' })}${tx(px + 12, py - 8, '|ψ⟩', { size: 15, fill: GL })}`;
  })(),

  // A measurement meter and the two outcome bars it produces
  'measurement-and-the-born-rule': `<rect x='44' y='70' width='130' height='100' rx='14' fill='${BG}' stroke='${G}' stroke-width='2.5'/>
      <path d='M66 145 A 44 44 0 0 1 152 145' fill='none' stroke='${T}' stroke-width='3'/><line x1='109' y1='145' x2='140' y2='98' stroke='${G}' stroke-width='3.5' stroke-linecap='round'/><circle cx='109' cy='145' r='5' fill='${G}'/>
      <path d='M182 120 H222' stroke='${GL}' stroke-width='2.5' stroke-dasharray='4 4'/><path d='M222 120 l-9 -6 v12 Z' fill='${GL}'/>
      <rect x='248' y='${210 - 130}' width='42' height='130' rx='5' fill='${G}'/><rect x='308' y='${210 - 44}' width='42' height='44' rx='5' fill='${V}' fill-opacity='.8'/>
      <line x1='238' y1='210' x2='362' y2='210' stroke='${M}' stroke-opacity='.6' stroke-width='1.5'/>
      ${tx(269, 228, '0', { size: 14, fill: M, anchor: 'middle' })}${tx(329, 228, '1', { size: 14, fill: M, anchor: 'middle' })}${tx(269, 72, '75%', { size: 13, fill: GL, anchor: 'middle' })}${tx(329, 158, '25%', { size: 13, fill: M, anchor: 'middle' })}
      ${tx(44, 42, 'P = |⟨b|ψ⟩|²', { size: 16, fill: GL })}`,

  // The six standard gates, as a 3 × 2 grid of gate tiles
  'single-qubit-gates': `${[['X', G], ['Y', G], ['Z', G], ['H', GL], ['S', V], ['T', P]].map(([g, c], i) => {
      const x = 96 + (i % 3) * 104, y = 78 + Math.floor(i / 3) * 92;
      const solid = i < 4;
      return `<rect x='${x - 36}' y='${y - 30}' width='72' height='66' rx='12' fill='${solid ? c : BG}' fill-opacity='${solid ? 1 : 1}' stroke='${c}' stroke-width='2.5'/>${tx(x, y + 14, g, { size: 32, fill: solid ? '#1A1304' : c, anchor: 'middle', font: head, weight: 700 })}`;
    }).join('')}`,

  // A phase wheel feeding an interference curve P(0) = cos²(φ/2)
  'phase-global-and-relative': (() => {
    const cx = 92, cy = 120, r = 56, a = 2.1;
    const curve = plot((x) => 200 - 150 * Math.cos(((x - 170) / 200) * Math.PI) ** 2, 170, 370, 3);
    const mx = 170 + (a / (2 * Math.PI)) * 200, my = 200 - 150 * Math.cos(a / 2) ** 2;
    return `<circle cx='${cx}' cy='${cy}' r='${r}' fill='none' stroke='${M}' stroke-opacity='.55' stroke-width='1.5'/>
      <line x1='${cx}' y1='${cy}' x2='${cx + r}' y2='${cy}' stroke='${M}' stroke-width='2'/>
      <line x1='${cx}' y1='${cy}' x2='${(cx + r * Math.cos(a)).toFixed(1)}' y2='${(cy - r * Math.sin(a)).toFixed(1)}' stroke='${G}' stroke-width='3.5' stroke-linecap='round'/>
      <path d='M ${cx + 22} ${cy} A 22 22 0 0 0 ${(cx + 22 * Math.cos(a)).toFixed(1)} ${(cy - 22 * Math.sin(a)).toFixed(1)}' fill='none' stroke='${GL}' stroke-width='2'/>
      ${tx(cx + 2, cy - 30, 'φ', { size: 16, fill: GL })}
      <line x1='170' y1='200' x2='372' y2='200' stroke='${M}' stroke-opacity='.5' stroke-width='1.5'/><line x1='170' y1='200' x2='170' y2='40' stroke='${M}' stroke-opacity='.5' stroke-width='1.5'/>
      <path d='${curve}' fill='none' stroke='${V}' stroke-width='3'/><circle cx='${mx.toFixed(1)}' cy='${my.toFixed(1)}' r='6' fill='${G}'/>
      ${tx(178, 34, 'P(0) = cos²(φ/2)', { size: 13, fill: M })}`;
  })(),

  // A sphere turning about a tilted axis, with a ring of motion around that axis
  'rotations-and-any-single-qubit-gate': (() => {
    const cx = 196, cy = 126, r = 90;
    return `<circle cx='${cx}' cy='${cy}' r='${r}' fill='${V}' fill-opacity='.08' stroke='${M}' stroke-opacity='.5' stroke-width='1.5'/>
      <line x1='${cx - 70}' y1='${cy + 98}' x2='${cx + 70}' y2='${cy - 98}' stroke='${GL}' stroke-width='2' stroke-dasharray='5 5'/>
      <g transform='translate(219 94) rotate(35.5)'>
        <ellipse cx='0' cy='0' rx='60' ry='16' fill='none' stroke='${G}' stroke-width='3'/>
        <path d='M 52 9 l 14 2 l -9 10 Z' fill='${G}'/>
      </g>
      <line x1='${cx}' y1='${cy}' x2='183.5' y2='57.6' stroke='${G}' stroke-width='4' stroke-linecap='round'/><circle cx='183.5' cy='57.6' r='6' fill='${G}'/>
      ${tx(296, 64, 'θ', { size: 24, fill: GL })}${tx(276, 34, 'axis n', { size: 12, fill: M })}`;
  })(),
};
