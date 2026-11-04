import { G, GL, V, P, GR, T, M, BG, mono, head, plot, tx, gate } from './kit.js';

// Column vector drawn with square brackets
const column = (x, y, entries, { w = 44, step = 30, col = T } = {}) => {
  const h = step * entries.length + 8;
  return `<path d='M${x + 6} ${y} h-6 v${h} h6 M${x + w - 6} ${y} h6 v${h} h-6' fill='none' stroke='${G}' stroke-width='2.2'/>` +
    entries.map((e, i) => tx(x + w / 2, y + 24 + i * step, e, { size: 15, fill: col, anchor: 'middle' })).join('');
};

// Part C and D covers
export const art = {
  // [α₀, α₁] ⊗ [β₀, β₁] = four products
  'many-qubits-and-the-tensor-product': `${column(34, 80, ['α₀', 'α₁'])}${tx(102, 128, '⊗', { size: 28, fill: GL, anchor: 'middle' })}${column(126, 80, ['β₀', 'β₁'])}
      ${tx(196, 132, '=', { size: 28, fill: GL, anchor: 'middle' })}${column(222, 38, ['α₀β₀', 'α₀β₁', 'α₁β₀', 'α₁β₁'], { w: 78, step: 36 })}
      ${tx(330, 70, '2ⁿ', { size: 30, fill: V, font: head, weight: 700 })}`,

  // Two qubits with no individual state, joined by a wavy link
  'entanglement-and-bell-states': (() => {
    const wave = plot((x) => 118 + 12 * Math.sin((x - 128) / 9), 128, 272, 2);
    return `<circle cx='86' cy='118' r='52' fill='${V}' fill-opacity='.1' stroke='${G}' stroke-width='2.5'/><circle cx='314' cy='118' r='52' fill='${V}' fill-opacity='.1' stroke='${G}' stroke-width='2.5'/>
      <circle cx='86' cy='118' r='6' fill='${GL}'/><circle cx='314' cy='118' r='6' fill='${GL}'/>
      <path d='${wave}' fill='none' stroke='${P}' stroke-width='3'/>
      ${tx(86, 196, 'A', { size: 18, fill: T, anchor: 'middle', font: head, weight: 700 })}${tx(314, 196, 'B', { size: 18, fill: T, anchor: 'middle', font: head, weight: 700 })}
      ${tx(200, 44, '(|00⟩ + |11⟩)/√2', { size: 16, fill: GL, anchor: 'middle' })}`;
  })(),

  // The CHSH game score: classical limit against the quantum strategy
  'bell-inequalities-and-chsh': `<line x1='60' y1='206' x2='340' y2='206' stroke='${M}' stroke-opacity='.6' stroke-width='1.5'/>
      <rect x='92' y='${206 - 150 * 0.75}' width='70' height='${150 * 0.75}' rx='6' fill='${V}' fill-opacity='.85'/>
      <rect x='224' y='${206 - 150 * 0.854}' width='70' height='${150 * 0.854}' rx='6' fill='${G}'/>
      <line x1='72' y1='${206 - 150 * 0.75}' x2='320' y2='${206 - 150 * 0.75}' stroke='${M}' stroke-dasharray='4 5'/>
      ${tx(127, 84, '75%', { size: 17, fill: T, anchor: 'middle', font: head, weight: 700 })}${tx(259, 68, '85.4%', { size: 17, fill: '#1A1304', anchor: 'middle', font: head, weight: 700 }).replace("fill='#1A1304'", `fill='${GL}'`)}
      ${tx(127, 226, 'classical', { size: 12, fill: M, anchor: 'middle' })}${tx(259, 226, 'quantum', { size: 12, fill: M, anchor: 'middle' })}
      ${tx(30, 36, 'S ≤ 2   vs   2√2', { size: 14, fill: GL })}`,

  // A copier that can't make the second copy
  'no-cloning-and-quantum-information': `<rect x='150' y='70' width='100' height='110' rx='14' fill='${BG}' stroke='${G}' stroke-width='2.5'/>${tx(200, 132, 'copy?', { size: 15, fill: GL, anchor: 'middle' })}
      <line x1='60' y1='125' x2='150' y2='125' stroke='${T}' stroke-width='2.5'/>${tx(42, 130, '|ψ⟩', { size: 16, fill: T, anchor: 'middle' })}
      <line x1='250' y1='100' x2='330' y2='100' stroke='${T}' stroke-width='2.5'/>${tx(352, 105, '|ψ⟩', { size: 16, fill: T, anchor: 'middle' })}
      <line x1='250' y1='152' x2='330' y2='152' stroke='${M}' stroke-width='2.5' stroke-dasharray='5 5'/>${tx(352, 157, '|ψ⟩', { size: 16, fill: M, anchor: 'middle' })}
      <path d='M276 138 L304 166 M304 138 L276 166' stroke='${P}' stroke-width='4' stroke-linecap='round'/>`,

  // A zig-zag of H and T steps homing in on a target rotation
  'universal-gates-and-compilation': (() => {
    const tgt = [300, 96];
    const pts = [[52, 206], [120, 150], [170, 196], [214, 120], [246, 150], [270, 104], [286, 116], [296, 98]];
    const path = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ');
    const labels = pts.slice(0, -1).map((p, i) => { const q = pts[i + 1]; return i < 4 ? tx((p[0] + q[0]) / 2 - 8, (p[1] + q[1]) / 2 - 6, i % 2 ? 'T' : 'H', { size: 13, fill: i % 2 ? V : GL }) : ''; }).join('');
    return `${[44, 28, 14].map((r) => `<circle cx='${tgt[0]}' cy='${tgt[1]}' r='${r}' fill='none' stroke='${G}' stroke-opacity='.45' stroke-dasharray='3 4'/>`).join('')}
      <circle cx='${tgt[0]}' cy='${tgt[1]}' r='6' fill='${G}'/><path d='${path}' fill='none' stroke='${V}' stroke-width='2.5' stroke-linejoin='round'/>
      ${pts.map((p) => `<circle cx='${p[0]}' cy='${p[1]}' r='3.5' fill='${T}'/>`).join('')}${labels}
      ${tx(352, 64, 'ε', { size: 20, fill: GL })}${tx(40, 44, 'H · T · CNOT', { size: 15, fill: M })}`;
  })(),

  // A parameterised gate, a mid-circuit measurement and feed-forward
  'qiskit-circuits-in-depth': `<line x1='30' y1='96' x2='370' y2='96' stroke='${M}' stroke-width='2'/><line x1='30' y1='176' x2='370' y2='176' stroke='${M}' stroke-width='2'/>
      <rect x='60' y='72' width='78' height='48' rx='9' fill='${G}'/>${tx(99, 103, 'RY(θ)', { size: 16, fill: '#1A1304', anchor: 'middle' })}
      <rect x='170' y='74' width='44' height='44' rx='8' fill='${BG}' stroke='${T}' stroke-width='1.8'/><path d='M180 106 A 12 12 0 0 1 204 106' fill='none' stroke='${T}' stroke-width='2'/><line x1='192' y1='106' x2='201' y2='88' stroke='${T}' stroke-width='2'/>
      <path d='M192 118 V176' stroke='${GL}' stroke-width='2' stroke-dasharray='3 3'/><path d='M192 176 H240' stroke='${GL}' stroke-width='2' stroke-dasharray='3 3'/>
      <rect x='238' y='140' width='112' height='70' rx='10' fill='none' stroke='${V}' stroke-width='2' stroke-dasharray='5 4'/>${tx(294, 160, 'if 0:', { size: 12, fill: V, anchor: 'middle' })}
      ${gate(294, 186, 'X', { w: 36 }).replace(/y='166'/, "y='168'")}
      ${tx(30, 44, 'Parameter · if_test · Estimator', { size: 13, fill: M })}`,

  // A histogram with error bars and the bell curve of shot noise
  'simulators-shots-and-statistics': (() => {
    const vals = [0.12, 0.31, 0.38, 0.19];
    const bars = vals.map((v, i) => { const x = 70 + i * 66, h = v * 400, top = 206 - h, e = 18; return `<rect x='${x}' y='${top}' width='44' height='${h}' rx='5' fill='${i === 2 ? G : V}' fill-opacity='${i === 2 ? 1 : 0.75}'/><path d='M${x + 22} ${top - e} V${top + e} M${x + 14} ${top - e} H${x + 30} M${x + 14} ${top + e} H${x + 30}' stroke='${T}' stroke-width='1.8'/>`; }).join('');
    const bell = plot((x) => 206 - 150 * Math.exp(-(((x - 214) / 70) ** 2)), 40, 380, 3);
    return `<path d='${bell}' fill='none' stroke='${GL}' stroke-opacity='.55' stroke-width='2' stroke-dasharray='5 4'/>${bars}
      <line x1='50' y1='206' x2='350' y2='206' stroke='${M}' stroke-opacity='.6' stroke-width='1.5'/>
      ${['00', '01', '10', '11'].map((b, i) => tx(92 + i * 66, 226, b, { size: 12, fill: M, anchor: 'middle' })).join('')}${tx(40, 40, '± 1/√N', { size: 15, fill: GL })}`;
  })(),
};
