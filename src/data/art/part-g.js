import { G, GL, V, P, GR, T, M, BG, mono, head, plot, tx, gate } from './kit.js';

// Part G covers (hardware); Parts H and I are added below as they are written
export const art = {
  // A microwave pulse driving a transmon (two pads and a junction) coupled to a meander resonator
  'superconducting-qubits-and-control-electronics': (() => {
    const pulse = plot((x) => 132 - 46 * Math.exp(-(((x - 86) / 26) ** 2)) * Math.sin((x - 86) / 3.2), 26, 146, 1.5);
    let meander = 'M284 132 H300 V60 ';
    for (let k = 0; k < 6; k++) { const y = 60 + k * 16; meander += `H362 V${y + 8} H300 V${y + 16} `; }
    return `<path d='${pulse}' fill='none' stroke='${G}' stroke-width='2.4'/>
      <line x1='150' y1='132' x2='176' y2='132' stroke='${GL}' stroke-width='2' stroke-dasharray='4 4'/>
      <rect x='178' y='92' width='42' height='80' rx='6' fill='${V}' fill-opacity='.35' stroke='${G}' stroke-width='2'/>
      <rect x='242' y='92' width='42' height='80' rx='6' fill='${V}' fill-opacity='.35' stroke='${G}' stroke-width='2'/>
      <line x1='220' y1='132' x2='242' y2='132' stroke='${T}' stroke-width='2'/><path d='M225 124 L237 140 M237 124 L225 140' stroke='${P}' stroke-width='3' stroke-linecap='round'/>
      <path d='${meander}' fill='none' stroke='${GL}' stroke-width='2'/>
      ${tx(30, 46, '4E_C(n − n_g)² − E_J cos φ', { size: 13, fill: GL })}${tx(231, 196, 'junction', { size: 11, fill: P, anchor: 'middle' })}`;
  })(),

  // An ion chain over its shared vibration, a Rydberg pair with its blockade ring, and a beam splitter
  'ions-atoms-and-photons': (() => {
    const ions = [70, 115, 160, 205, 250].map((x) => `<circle cx='${x}' cy='62' r='11' fill='${G}'/><circle cx='${x}' cy='62' r='19' fill='${G}' fill-opacity='.15'/>`).join('');
    const mode = plot((x) => 98 + 9 * Math.sin((x - 50) / 32), 50, 270, 3);
    const atoms = [];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { const x = 52 + c * 34, y = 140 + r * 30, ryd = r === 1 && (c === 1 || c === 2); atoms.push(`<circle cx='${x}' cy='${y}' r='${ryd ? 8 : 5}' fill='${ryd ? P : T}' fill-opacity='${ryd ? 1 : 0.8}'/>`); }
    return `${ions}<path d='${mode}' fill='none' stroke='${V}' stroke-width='2.4'/>
      ${atoms.join('')}<circle cx='103' cy='170' r='34' fill='none' stroke='${P}' stroke-width='1.6' stroke-dasharray='4 4'/>
      <line x1='262' y1='196' x2='330' y2='128' stroke='${GL}' stroke-width='4'/>
      <path d='M220 162 L296 162 M296 96 L296 162' stroke='${V}' stroke-width='2.2' stroke-dasharray='5 4'/>
      <path d='M296 162 L370 162' stroke='${G}' stroke-width='3'/><circle cx='370' cy='162' r='6' fill='${G}'/><circle cx='358' cy='162' r='6' fill='${G}' fill-opacity='.7'/>
      ${tx(300, 66, 'HOM', { size: 13, fill: M })}`;
  })(),

  // A circuit becoming native gates on a line of physical qubits
  'transpiling-and-running-on-hardware': (() => {
    const wires = [56, 92, 128].map((y) => `<line x1='28' y1='${y}' x2='150' y2='${y}' stroke='${M}' stroke-width='1.8'/>`).join('');
    const nodes = [0, 1, 2, 3, 4, 5, 6].map((i) => { const x = 40 + i * 52, used = [1, 2, 3].includes(i); return `<circle cx='${x}' cy='196' r='13' fill='${used ? V : BG}' stroke='${used ? G : M}' stroke-width='2'/>${tx(x, 201, String(i), { size: 12, fill: T, anchor: 'middle' })}`; }).join('');
    return `${wires}${gate(62, 56, 'H', { w: 34 })}<line x1='106' y1='56' x2='106' y2='128' stroke='${G}' stroke-width='2.2'/><circle cx='106' cy='56' r='6' fill='${G}'/><circle cx='106' cy='128' r='11' fill='none' stroke='${G}' stroke-width='2.2'/><line x1='95' y1='128' x2='117' y2='128' stroke='${G}' stroke-width='2.2'/><line x1='106' y1='117' x2='106' y2='139' stroke='${G}' stroke-width='2.2'/>
      <path d='M168 92 L206 92' stroke='${GL}' stroke-width='2.4'/><path d='M200 85 L208 92 L200 99' fill='none' stroke='${GL}' stroke-width='2.4'/>
      ${['RZ', 'SX', 'RZ'].map((g, i) => `<rect x='${222 + i * 50}' y='74' width='42' height='36' rx='7' fill='${i === 1 ? G : V}' fill-opacity='${i === 1 ? 1 : 0.7}'/>${tx(243 + i * 50, 98, g, { size: 13, fill: i === 1 ? '#1A1304' : T, anchor: 'middle' })}`).join('')}
      <line x1='40' y1='196' x2='352' y2='196' stroke='${M}' stroke-width='2'/>${nodes}
      ${tx(222, 52, 'layout, route, optimise', { size: 11, fill: M })}`;
  })(),
};
