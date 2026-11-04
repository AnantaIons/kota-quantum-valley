import { G, GL, V, P, GR, T, M, BG, mono, head, plot, tx, gate } from './kit.js';

// Part A covers: bits, complex numbers, vectors, matrices, the double slit.
export const art = {
  // A byte of bits above a NAND gate
  'bits-and-classical-computing': `${[1, 0, 1, 1, 0, 0, 1, 0].map((b, i) => `<rect x='${48 + i * 38}' y='26' width='30' height='36' rx='6' fill='${b ? G : 'none'}' stroke='${b ? G : M}' stroke-opacity='${b ? 1 : 0.55}' stroke-width='1.5'/>${tx(63 + i * 38, 51, b, { size: 17, fill: b ? '#1A1304' : M, anchor: 'middle' })}`).join('')}
      <line x1='70' y1='132' x2='150' y2='132' stroke='${M}' stroke-width='2'/><line x1='70' y1='184' x2='150' y2='184' stroke='${M}' stroke-width='2'/>
      <path d='M150 106 H190 A52 52 0 0 1 190 210 H150 Z' fill='${BG}' stroke='${G}' stroke-width='2.5'/>
      <circle cx='250' cy='158' r='8' fill='${BG}' stroke='${G}' stroke-width='2.5'/><line x1='258' y1='158' x2='330' y2='158' stroke='${GL}' stroke-width='2.5'/>
      ${tx(56, 137, 'a', { size: 14, fill: M })}${tx(56, 189, 'b', { size: 14, fill: M })}${tx(186, 164, 'NAND', { size: 12, fill: GL, anchor: 'middle' })}${tx(338, 163, 'out', { size: 13, fill: M })}`,

  // The complex plane: unit circle, e^(iθ), and the 8th roots of unity
  'complex-numbers-for-quantum': (() => {
    const cx = 190, cy = 128, r = 88, a = (40 * Math.PI) / 180;
    const ex = cx + r * Math.cos(a), ey = cy - r * Math.sin(a);
    const roots = [0, 1, 2, 3, 4, 5, 6, 7].map((k) => { const t = (k * Math.PI) / 4; return `<circle cx='${(cx + r * Math.cos(t)).toFixed(1)}' cy='${(cy - r * Math.sin(t)).toFixed(1)}' r='4.5' fill='${V}'/>`; }).join('');
    return `<line x1='60' y1='${cy}' x2='320' y2='${cy}' stroke='${M}' stroke-opacity='.6' stroke-width='1.5'/><line x1='${cx}' y1='22' x2='${cx}' y2='234' stroke='${M}' stroke-opacity='.6' stroke-width='1.5'/>
      <circle cx='${cx}' cy='${cy}' r='${r}' fill='none' stroke='${V}' stroke-width='1.5' stroke-dasharray='4 5'/>${roots}
      <path d='M ${cx + 30} ${cy} A 30 30 0 0 0 ${(cx + 30 * Math.cos(a)).toFixed(1)} ${(cy - 30 * Math.sin(a)).toFixed(1)}' fill='none' stroke='${GL}' stroke-width='2'/>
      <line x1='${cx}' y1='${cy}' x2='${ex.toFixed(1)}' y2='${ey.toFixed(1)}' stroke='${G}' stroke-width='4' stroke-linecap='round'/><circle cx='${ex.toFixed(1)}' cy='${ey.toFixed(1)}' r='7' fill='${G}'/>
      ${tx(ex + 12, ey - 8, 'e^(iθ)', { size: 16, fill: T })}${tx(cx + 38, cy - 8, 'θ', { size: 14, fill: GL })}${tx(326, cy + 5, 'Re', { size: 13, fill: M })}${tx(cx + 8, 32, 'Im', { size: 13, fill: M })}`;
  })(),

  // A bracket ⟨φ|ψ⟩ beside two vectors and the projection between them
  'vectors-and-dirac-notation': `${tx(34, 140, '⟨φ|ψ⟩', { size: 46, fill: GL, font: head, weight: 700 })}
      <line x1='220' y1='205' x2='370' y2='205' stroke='${M}' stroke-opacity='.5' stroke-width='1.5'/><line x1='220' y1='205' x2='220' y2='40' stroke='${M}' stroke-opacity='.5' stroke-width='1.5'/>
      <line x1='220' y1='205' x2='360' y2='150' stroke='${V}' stroke-width='3.5' stroke-linecap='round'/><circle cx='360' cy='150' r='6' fill='${V}'/>
      <line x1='220' y1='205' x2='300' y2='62' stroke='${G}' stroke-width='3.5' stroke-linecap='round'/><circle cx='300' cy='62' r='6' fill='${G}'/>
      <line x1='300' y1='62' x2='${(220 + 0.72 * 140).toFixed(1)}' y2='${(205 - 0.72 * 55).toFixed(1)}' stroke='${GL}' stroke-width='1.5' stroke-dasharray='4 4'/>
      ${tx(306, 58, '|ψ⟩', { size: 15, fill: T })}${tx(364, 144, '|φ⟩', { size: 15, fill: T })}`,

  // H as a matrix, acting on |0⟩ to give |+⟩
  'matrices-and-unitary-operations': `${tx(30, 132, '1/√2', { size: 15, fill: M })}
      <path d='M82 70 h-8 v110 h8 M196 70 h8 v110 h-8' fill='none' stroke='${G}' stroke-width='2.5'/>
      ${tx(110, 112, '1', { size: 22, fill: T, anchor: 'middle' })}${tx(168, 112, '1', { size: 22, fill: T, anchor: 'middle' })}${tx(110, 160, '1', { size: 22, fill: T, anchor: 'middle' })}${tx(168, 160, '−1', { size: 22, fill: T, anchor: 'middle' })}
      <line x1='290' y1='190' x2='290' y2='50' stroke='${M}' stroke-opacity='.45' stroke-width='3' stroke-linecap='round'/>
      <line x1='290' y1='190' x2='${(290 + 140 * Math.sin(Math.PI / 4)).toFixed(1)}' y2='${(190 - 140 * Math.cos(Math.PI / 4)).toFixed(1)}' stroke='${G}' stroke-width='4' stroke-linecap='round'/>
      <path d='M290 92 A 98 98 0 0 1 359 121' fill='none' stroke='${GL}' stroke-width='2' stroke-dasharray='3 4'/>
      ${tx(276, 44, '|0⟩', { size: 14, fill: M })}${tx(392, 92, '|+⟩', { size: 15, fill: T, anchor: 'end' })}${tx(226, 132, '→', { size: 26, fill: GL, anchor: 'middle' })}`,

  // The double slit: waves from two slits and a striped pattern on the screen
  'probability-and-the-quantum-experiments': (() => {
    const sx = 150, s1 = 98, s2 = 152;
    const arcs = [24, 48, 72, 96, 120, 144].map((rad) => [s1, s2].map((sy) => `<path d='M ${sx + rad * Math.cos(-1.1)} ${(sy + rad * Math.sin(-1.1)).toFixed(1)} A ${rad} ${rad} 0 0 1 ${sx + rad * Math.cos(1.1)} ${(sy + rad * Math.sin(1.1)).toFixed(1)}' fill='none' stroke='${V}' stroke-opacity='${(0.75 - rad / 220).toFixed(2)}' stroke-width='1.5'/>`).join('')).join('');
    const bars = Array.from({ length: 41 }, (_, i) => { const y = 26 + i * 4.4; const I = Math.cos(((y - 125) / 100) * Math.PI * 2) ** 2 * Math.exp(-(((y - 125) / 110) ** 2)); return `<rect x='312' y='${y.toFixed(1)}' width='${(2 + 50 * I).toFixed(1)}' height='3.4' rx='1.5' fill='${G}' fill-opacity='${(0.3 + 0.7 * I).toFixed(2)}'/>`; }).join('');
    return `<circle cx='44' cy='125' r='9' fill='${GL}'/>${[18, 34, 50].map((rad) => `<path d='M ${44 + rad * 0.5} ${125 - rad * 0.87} A ${rad} ${rad} 0 0 1 ${44 + rad * 0.5} ${125 + rad * 0.87}' fill='none' stroke='${GL}' stroke-opacity='.5' stroke-width='1.5'/>`).join('')}
      <rect x='${sx - 4}' y='24' width='8' height='${s1 - 8 - 24}' fill='${M}'/><rect x='${sx - 4}' y='${s1 + 8}' width='8' height='${s2 - s1 - 16}' fill='${M}'/><rect x='${sx - 4}' y='${s2 + 8}' width='8' height='${226 - s2 - 8}' fill='${M}'/>
      ${arcs}<line x1='308' y1='24' x2='308' y2='226' stroke='${M}' stroke-opacity='.6' stroke-width='2'/>${bars}`;
  })(),
};
