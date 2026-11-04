import { G, GL, V, P, GR, T, M, BG, mono, head, plot, tx, gate } from './kit.js';

// Part E covers: quantum algorithms
export const art = {
  // Inputs pair up as {x, x ⊕ s} and land on the same output (s = 101)
  'simons-algorithm': (() => {
    const pairs = [[0, 5], [1, 4], [2, 7], [3, 6]];
    const ix = (i) => 46 + i * 44, ox = (j) => 80 + j * 80;
    const lines = pairs.map(([a, b], j) => [a, b].map((i) => `<path d='M${ix(i)} 82 C ${ix(i)} 124, ${ox(j)} 128, ${ox(j)} 164' fill='none' stroke='${j % 2 ? V : G}' stroke-width='2' stroke-opacity='.85'/>`).join('')).join('');
    const ins = [...Array(8).keys()].map((i) => `<circle cx='${ix(i)}' cy='70' r='12' fill='${BG}' stroke='${T}' stroke-width='1.6'/>${tx(ix(i), 75, i.toString(2).padStart(3, '0'), { size: 9, fill: T, anchor: 'middle' })}`).join('');
    const outs = pairs.map((_, j) => `<rect x='${ox(j) - 22}' y='164' width='44' height='30' rx='7' fill='${j % 2 ? V : G}' fill-opacity='${j % 2 ? 0.8 : 1}'/>${tx(ox(j), 184, `f${j}`, { size: 13, fill: j % 2 ? T : '#1A1304', anchor: 'middle' })}`).join('');
    return `${lines}${ins}${outs}${tx(30, 36, 'f(x) = f(x ⊕ s)', { size: 15, fill: GL })}${tx(370, 36, 's = 101', { size: 14, fill: M, anchor: 'end' })}`;
  })(),

  // Each round rotates the state by 2θ towards |good⟩
  'amplitude-amplification': (() => {
    const ox = 70, oy = 206, R = 150, th = 0.16;
    const vec = (k) => { const a = (2 * k + 1) * th; return [ox + R * Math.cos(a), oy - R * Math.sin(a)]; };
    const vs = [0, 1, 2, 3, 4].map((k) => { const [x, y] = vec(k); const last = k === 4; return `<line x1='${ox}' y1='${oy}' x2='${x.toFixed(1)}' y2='${y.toFixed(1)}' stroke='${last ? G : V}' stroke-width='${last ? 3.5 : 2}' stroke-opacity='${last ? 1 : 0.35 + k * 0.15}'/><circle cx='${x.toFixed(1)}' cy='${y.toFixed(1)}' r='${last ? 5 : 3.5}' fill='${last ? G : T}'/>`; }).join('');
    const arc = plot((x) => oy - Math.sqrt(Math.max(0, (R + 18) ** 2 - (x - ox) ** 2)), ox + (R + 18) * Math.cos(9 * th), ox + (R + 18) * Math.cos(th), 2);
    return `<line x1='${ox}' y1='${oy}' x2='360' y2='${oy}' stroke='${M}' stroke-width='1.6'/><line x1='${ox}' y1='${oy}' x2='${ox}' y2='28' stroke='${M}' stroke-width='1.6'/>
      <path d='${arc}' fill='none' stroke='${GL}' stroke-width='1.6' stroke-dasharray='4 4'/>${vs}
      ${tx(ox - 8, 44, '|good⟩', { size: 14, fill: GL, anchor: 'end' })}${tx(300, oy - 10, '|bad⟩', { size: 14, fill: M })}
      ${tx(238, 64, 'sin²((2k+1)θ)', { size: 15, fill: T })}`;
  })(),

  // A comb with period r becomes a comb at multiples of N/r
  'the-quantum-fourier-transform': (() => {
    const base = 186;
    const left = [...Array(16).keys()].map((i) => { const on = i % 4 === 1; const x = 28 + i * 8.4; return `<line x1='${x}' y1='${base}' x2='${x}' y2='${on ? base - 92 : base - 4}' stroke='${on ? V : M}' stroke-width='${on ? 4 : 2}' stroke-linecap='round' stroke-opacity='${on ? 1 : 0.5}'/>`; }).join('');
    const right = [...Array(16).keys()].map((i) => { const on = i % 4 === 0; const x = 240 + i * 8.4; return `<line x1='${x}' y1='${base}' x2='${x}' y2='${on ? base - 112 : base - 4}' stroke='${on ? G : M}' stroke-width='${on ? 4 : 2}' stroke-linecap='round' stroke-opacity='${on ? 1 : 0.5}'/>`; }).join('');
    return `<line x1='22' y1='${base}' x2='162' y2='${base}' stroke='${M}' stroke-opacity='.6'/><line x1='234' y1='${base}' x2='374' y2='${base}' stroke='${M}' stroke-opacity='.6'/>
      ${left}${right}${gate(198, 130, 'QFT', { w: 54 })}
      ${tx(92, 210, 'period r', { size: 12, fill: M, anchor: 'middle' })}${tx(300, 210, 'peaks at k·N/r', { size: 12, fill: M, anchor: 'middle' })}
      ${tx(30, 40, '|x⟩ → Σ e^(2πixk/N) |k⟩', { size: 14, fill: GL })}`;
  })(),

  // A spin chain with ZZ bonds, and the Trotter staircase that evolves it
  'simulating-quantum-systems': (() => {
    const xs = [60, 130, 200, 270, 340], ups = [1, 0, 1, 1, 0];
    const bonds = xs.slice(0, -1).map((x, i) => `<path d='M${x + 18} 82 Q ${x + 35} 66 ${x + 52} 82' fill='none' stroke='${P}' stroke-width='2' stroke-opacity='.8'/>`).join('');
    const spins = xs.map((x, i) => `<circle cx='${x}' cy='86' r='18' fill='${V}' fill-opacity='.18' stroke='${G}' stroke-width='2'/><path d='M${x} ${ups[i] ? 98 : 74} V${ups[i] ? 72 : 100} M${x - 6} ${ups[i] ? 80 : 92} L${x} ${ups[i] ? 72 : 100} L${x + 6} ${ups[i] ? 80 : 92}' fill='none' stroke='${GL}' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'/>`).join('');
    const steps = [...Array(6).keys()].map((k) => { const x = 40 + k * 46; const zz = k % 2 === 0; return `<rect x='${x}' y='${zz ? 138 : 170}' width='38' height='26' rx='6' fill='${zz ? P : G}' fill-opacity='${zz ? 0.75 : 1}'/>${tx(x + 19, zz ? 156 : 188, zz ? 'ZZ' : 'X', { size: 12, fill: zz ? T : '#1A1304', anchor: 'middle' })}`; }).join('');
    return `${bonds}${spins}${steps}${tx(30, 36, 'e^(−iHt) ≈ (e^(−iAt/r) e^(−iBt/r))^r', { size: 13, fill: GL })}`;
  })(),

  // The complexity map: P inside BQP, BQP overlapping NP, NP-complete outside BQP
  'what-quantum-computers-can-and-cant-do': `<ellipse cx='238' cy='128' rx='132' ry='88' fill='${V}' fill-opacity='.10' stroke='${M}' stroke-width='2'/>
      <ellipse cx='142' cy='128' rx='104' ry='74' fill='${G}' fill-opacity='.10' stroke='${G}' stroke-width='2.4'/>
      <ellipse cx='132' cy='136' rx='46' ry='36' fill='${GR}' fill-opacity='.14' stroke='${GR}' stroke-width='2'/>
      <ellipse cx='318' cy='132' rx='40' ry='46' fill='${P}' fill-opacity='.14' stroke='${P}' stroke-width='2' stroke-dasharray='5 4'/>
      ${tx(132, 142, 'P', { size: 20, fill: GR, anchor: 'middle', font: head, weight: 700 })}
      ${tx(66, 96, 'BQP', { size: 16, fill: G, font: head, weight: 700 })}
      ${tx(256, 64, 'NP', { size: 16, fill: T, font: head, weight: 700 })}
      ${tx(318, 128, 'NP-', { size: 11, fill: P, anchor: 'middle' })}${tx(318, 143, 'complete', { size: 11, fill: P, anchor: 'middle' })}
      <circle cx='214' cy='112' r='5' fill='${GL}'/>${tx(214, 134, 'factoring', { size: 10, fill: GL, anchor: 'middle' })}`,
};
