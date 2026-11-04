// Covers for the first lessons written (keyed by slug).
import { G, GL, V, P, GR, T, M, mono, head } from './kit.js';

export const art = {
  // roadmap: a winding path through four pillars to a flag
  'roadmap-what-to-learn-first': `<path d='M30 210 C 110 210, 90 140, 170 140 S 250 70, 330 70' fill='none' stroke='${G}' stroke-width='3' stroke-dasharray='2 9' stroke-linecap='round'/>
      ${[[30, 210, 'Σ'], [120, 168, 'ψ'], [215, 120, '{ }'], [290, 78, '⏚']].map(([x, y, s], i) => `<circle cx='${x}' cy='${y}' r='19' fill='#0B1026' stroke='${[GR, G, V, P][i]}' stroke-width='2.5'/><text x='${x}' y='${y + 6}' text-anchor='middle' ${mono} font-size='16' fill='${T}'>${s}</text>`).join('')}
      <line x1='345' y1='72' x2='345' y2='22' stroke='${GL}' stroke-width='3'/><path d='M345 22 L375 32 L345 44 Z' fill='${G}'/>`,

  // qubits-and-quantum-states: a qubit as a vector, with its two amplitudes
  'qubits-and-quantum-states': `<line x1='120' y1='200' x2='300' y2='200' stroke='${M}' stroke-width='1.5'/><line x1='120' y1='200' x2='120' y2='30' stroke='${M}' stroke-width='1.5'/>
      <path d='M 270 200 A 150 150 0 0 0 120 50' fill='none' stroke='${V}' stroke-width='1.5' stroke-dasharray='4 5'/>
      <line x1='120' y1='200' x2='254' y2='133' stroke='${G}' stroke-width='4' stroke-linecap='round'/><circle cx='254' cy='133' r='7' fill='${G}'/>
      <line x1='254' y1='133' x2='254' y2='200' stroke='${G}' stroke-opacity='.5' stroke-dasharray='3 4'/><line x1='254' y1='133' x2='120' y2='133' stroke='${G}' stroke-opacity='.5' stroke-dasharray='3 4'/>
      <text x='305' y='206' ${mono} font-size='15' fill='${M}'>|0⟩</text><text x='100' y='26' ${mono} font-size='15' fill='${M}'>|1⟩</text>
      <text x='238' y='222' ${mono} font-size='15' fill='${GL}'>α</text><text x='96' y='138' ${mono} font-size='15' fill='${GL}'>β</text>
      <text x='264' y='124' ${mono} font-size='16' fill='${T}'>|ψ⟩</text>`,

  // two-qubit-gates-and-circuits: a circuit with H and CNOT
  'two-qubit-gates-and-circuits': `<line x1='40' y1='95' x2='360' y2='95' stroke='${M}' stroke-width='2'/><line x1='40' y1='165' x2='360' y2='165' stroke='${M}' stroke-width='2'/>
      <text x='14' y='100' ${mono} font-size='13' fill='${M}'>q0</text><text x='14' y='170' ${mono} font-size='13' fill='${M}'>q1</text>
      <rect x='80' y='72' width='46' height='46' rx='8' fill='${G}'/><text x='103' y='103' text-anchor='middle' ${mono} font-size='20' fill='#1A1304'>H</text>
      <circle cx='185' cy='95' r='8' fill='${G}'/><line x1='185' y1='95' x2='185' y2='165' stroke='${G}' stroke-width='2.5'/>
      <circle cx='185' cy='165' r='17' fill='#0B1026' stroke='${G}' stroke-width='2.5'/><path d='M185 150 V180 M170 165 H200' stroke='${G}' stroke-width='2.5'/>
      <rect x='245' y='72' width='46' height='46' rx='8' fill='none' stroke='${V}' stroke-width='2'/><text x='268' y='103' text-anchor='middle' ${mono} font-size='20' fill='${V}'>T</text>
      <rect x='310' y='142' width='40' height='46' rx='8' fill='#0B1026' stroke='${M}' stroke-width='1.5'/><path d='M318 175 A 12 12 0 0 1 342 175' fill='none' stroke='${T}' stroke-width='2'/><line x1='330' y1='175' x2='339' y2='158' stroke='${T}' stroke-width='2'/>`,

  // oracles-deutsch-jozsa-bernstein-vazirani: interference, two waves adding and cancelling
  'oracles-deutsch-jozsa-bernstein-vazirani': (() => {
    const wave = (y0, a, ph, col, w = 2.5, op = 1) => { let d = ''; for (let x = 20; x <= 380; x += 4) d += `${x === 20 ? 'M' : 'L'}${x} ${(y0 - a * Math.sin(x / 26 + ph)).toFixed(1)} `; return `<path d='${d}' fill='none' stroke='${col}' stroke-width='${w}' stroke-opacity='${op}'/>`; };
    return wave(70, 22, 0, V, 2, .8) + wave(70, 22, 0.3, P, 2, .8) + wave(70, 44, 0.15, G, 3)
      + wave(180, 22, 0, V, 2, .8) + wave(180, 22, Math.PI, P, 2, .8) + `<line x1='20' y1='180' x2='380' y2='180' stroke='${G}' stroke-width='3'/>`
      + `<text x='388' y='76' text-anchor='end' ${mono} font-size='13' fill='${GL}'>add</text><text x='388' y='212' text-anchor='end' ${mono} font-size='13' fill='${M}'>cancel</text>`;
  })(),

  // how-real-qubits-are-built: a dilution refrigerator "chandelier" with a chip at the bottom
  'how-real-qubits-are-built': `${[40, 80, 120, 160].map((y, i) => `<rect x='${120 + i * 12}' y='${y}' width='${160 - i * 24}' height='9' rx='3' fill='${i === 3 ? G : '#2B3470'}' stroke='${G}' stroke-opacity='${0.3 + i * 0.2}'/>`).join('')}
      ${[150, 175, 200, 225, 250].map((x) => `<line x1='${x}' y1='49' x2='${x}' y2='160' stroke='${GL}' stroke-opacity='.55' stroke-width='1.5'/>`).join('')}
      <rect x='175' y='178' width='50' height='34' rx='4' fill='#0B1026' stroke='${G}' stroke-width='2'/><rect x='188' y='188' width='24' height='14' fill='${V}'/>
      ${[0, 1, 2, 3].map((i) => `<line x1='${180 + i * 13}' y1='212' x2='${180 + i * 13}' y2='222' stroke='${G}' stroke-width='2'/>`).join('')}
      <text x='300' y='48' ${mono} font-size='12' fill='${M}'>4 K</text><text x='300' y='128' ${mono} font-size='12' fill='${M}'>100 mK</text><text x='300' y='170' ${mono} font-size='12' fill='${GL}'>10 mK</text>`,

  // quantum-communication-and-qkd: Alice → photons in two bases → Bob, with a lock
  'quantum-communication-and-qkd': `<circle cx='60' cy='125' r='26' fill='#0B1026' stroke='${G}' stroke-width='2.5'/><text x='60' y='131' text-anchor='middle' ${head} font-size='18' font-weight='700' fill='${T}'>A</text>
      <circle cx='340' cy='125' r='26' fill='#0B1026' stroke='${G}' stroke-width='2.5'/><text x='340' y='131' text-anchor='middle' ${head} font-size='18' font-weight='700' fill='${T}'>B</text>
      <line x1='90' y1='125' x2='310' y2='125' stroke='${M}' stroke-opacity='.4' stroke-dasharray='3 6'/>
      ${[[120, '→'], [160, '↗'], [200, '↑'], [240, '↖'], [280, '→']].map(([x, s], i) => `<circle cx='${x}' cy='125' r='13' fill='${i % 2 ? V : P}' fill-opacity='.25' stroke='${i % 2 ? V : P}'/><text x='${x}' y='130' text-anchor='middle' font-size='14' fill='${T}'>${s}</text>`).join('')}
      <rect x='182' y='170' width='36' height='30' rx='5' fill='${G}'/><path d='M190 170 V160 a10 10 0 0 1 20 0 V170' fill='none' stroke='${G}' stroke-width='4'/><circle cx='200' cy='185' r='4' fill='#1A1304'/>`,

  // quantum-sensing: a Ramsey fringe under magnetic field lines
  'quantum-sensing': (() => {
    let d = ''; for (let x = 30; x <= 370; x += 4) d += `${x === 30 ? 'M' : 'L'}${x} ${(200 - 110 * Math.cos((x - 30) / 54) ** 2).toFixed(1)} `;
    return `${[0, 1, 2].map((i) => `<path d='M10 ${40 + i * 22} Q 200 ${10 + i * 22}, 390 ${40 + i * 22}' fill='none' stroke='${V}' stroke-opacity='${0.6 - i * 0.15}' stroke-width='1.5'/>`).join('')}
      <path d='${d}' fill='none' stroke='${G}' stroke-width='3'/><line x1='30' y1='205' x2='370' y2='205' stroke='${M}' stroke-width='1.2'/>
      <text x='34' y='226' ${mono} font-size='13' fill='${M}'>φ →</text><text x='300' y='30' ${mono} font-size='13' fill='${GL}'>cos²(φ/2)</text>`;
  })(),

  // your-first-quantum-program: a code window with Python
  'your-first-quantum-program': `<rect x='50' y='35' width='300' height='180' rx='12' fill='#0B1026' stroke='${M}' stroke-opacity='.5'/>
      ${[P, G, GR].map((c, i) => `<circle cx='${72 + i * 16}' cy='54' r='5' fill='${c}'/>`).join('')}
      <text x='70' y='92' ${mono} font-size='14' fill='${V}'>qc</text><text x='94' y='92' ${mono} font-size='14' fill='${T}'>= QuantumCircuit(2)</text>
      <text x='70' y='118' ${mono} font-size='14' fill='${T}'>qc.<tspan fill='${G}'>h</tspan>(0)</text>
      <text x='70' y='144' ${mono} font-size='14' fill='${T}'>qc.<tspan fill='${G}'>cx</tspan>(0, 1)</text>
      <text x='70' y='176' ${mono} font-size='14' fill='${GR}'>{'00': 503, '11': 497}</text>
      <rect x='70' y='188' width='9' height='15' fill='${G}'/>`,

  // teleportation-and-superdense-coding: teleportation from one node to another via an entangled link
  'teleportation-and-superdense-coding': `<circle cx='80' cy='125' r='34' fill='none' stroke='${G}' stroke-width='2.5'/><circle cx='320' cy='125' r='34' fill='none' stroke='${G}' stroke-width='2.5'/>
      <path d='M114 125 C 160 75, 240 175, 286 125' fill='none' stroke='${V}' stroke-width='2.5'/><path d='M114 125 C 160 175, 240 75, 286 125' fill='none' stroke='${P}' stroke-width='2.5'/>
      <text x='80' y='131' text-anchor='middle' ${mono} font-size='17' fill='${T}'>|ψ⟩</text><text x='320' y='131' text-anchor='middle' ${mono} font-size='17' fill='${GL}'>|ψ⟩</text>
      <path d='M90 200 H310' stroke='${M}' stroke-width='1.5' stroke-dasharray='5 6'/><path d='M302 194 L312 200 L302 206' fill='none' stroke='${M}' stroke-width='1.5'/>
      <text x='200' y='226' text-anchor='middle' ${mono} font-size='12' fill='${M}'>2 classical bits</text>`,

  // grovers-search: Grover amplitudes, one bar rising
  'grovers-search': `${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const tall = i === 5; const h = tall ? 160 : 34; return `<rect x='${48 + i * 40}' y='${210 - h}' width='26' height='${h}' rx='4' fill='${tall ? G : V}' fill-opacity='${tall ? 1 : 0.55}'/>`; }).join('')}
      <line x1='40' y1='166' x2='370' y2='166' stroke='${P}' stroke-width='1.5' stroke-dasharray='5 5'/><text x='370' y='160' text-anchor='end' ${mono} font-size='12' fill='${P}'>average</text>
      <text x='261' y='38' text-anchor='middle' ${mono} font-size='14' fill='${GL}'>★</text>`,

  // phase-estimation: phase wheels at doubling angles
  'phase-estimation': `${[0, 1, 2, 3].map((k) => { const cx = 70 + k * 88, cy = 120, a = (Math.PI / 4) * 2 ** k; return `<circle cx='${cx}' cy='${cy}' r='32' fill='none' stroke='${M}' stroke-opacity='.5' stroke-width='1.5'/><line x1='${cx}' y1='${cy}' x2='${(cx + 30 * Math.cos(a)).toFixed(1)}' y2='${(cy - 30 * Math.sin(a)).toFixed(1)}' stroke='${G}' stroke-width='3' stroke-linecap='round'/><circle cx='${cx}' cy='${cy}' r='3' fill='${T}'/><text x='${cx}' y='${cy + 56}' text-anchor='middle' ${mono} font-size='13' fill='${M}'>${2 ** k}φ</text>`; }).join('')}
      <text x='200' y='40' text-anchor='middle' ${mono} font-size='14' fill='${GL}'>e^(2πi·φ·2ᵏ)</text>`,

  // shors-algorithm: the repeating sequence 7^x mod 15 → 3 × 5
  'shors-algorithm': `${[1, 7, 4, 13, 1, 7, 4, 13].map((v, i) => `<circle cx='${40 + i * 46}' cy='${190 - v * 9}' r='7' fill='${i < 4 ? G : V}'/><text x='${40 + i * 46}' y='${182 - v * 9}' text-anchor='middle' ${mono} font-size='11' fill='${M}'>${v}</text>`).join('')}
      <path d='M40 205 Q 109 232, 178 205' fill='none' stroke='${G}' stroke-width='2'/><text x='109' y='238' text-anchor='middle' ${mono} font-size='12' fill='${GL}'>r = 4</text>
      <text x='360' y='42' text-anchor='end' ${head} font-size='22' font-weight='700' fill='${T}'>15 = 3 × 5</text>`,

  // your-first-error-correcting-code: a surface-code lattice with one flagged error
  'your-first-error-correcting-code': `${[0, 1, 2, 3, 4].map((r) => [0, 1, 2, 3, 4, 5, 6].map((c) => { const x = 60 + c * 47, y = 30 + r * 46, err = r === 2 && c === 3, anc = (r + c) % 2 === 1; return `<circle cx='${x}' cy='${y}' r='${anc ? 6 : 10}' fill='${err ? P : anc ? '#0B1026' : V}' fill-opacity='${err ? 1 : anc ? 1 : 0.7}' stroke='${anc ? G : 'none'}' stroke-width='2'/>`; }).join('')).join('')}
      <circle cx='201' cy='122' r='22' fill='none' stroke='${P}' stroke-width='2' stroke-dasharray='4 4'/>`,

  // variational-algorithms-vqe-qaoa: an energy landscape with the optimiser's ball at the minimum
  'variational-algorithms-vqe-qaoa': (() => {
    const f = (x) => { const t = (x - 20) / 360; return 150 - 60 * Math.sin(t * 9) * (1 - t * 0.3) + 40 * t; };
    let d = '', bx = 20; for (let x = 20; x <= 380; x += 4) { d += `${x === 20 ? 'M' : 'L'}${x} ${f(x).toFixed(1)} `; if (f(x) > f(bx)) bx = x; }
    return `<path d='${d}' fill='none' stroke='${V}' stroke-width='3'/><circle cx='${bx}' cy='${(f(bx) - 11).toFixed(1)}' r='11' fill='${G}'/>
      <path d='M110 60 C 140 20, ${bx - 20} 20, ${bx} ${(f(bx) - 40).toFixed(1)}' fill='none' stroke='${GL}' stroke-width='2' stroke-dasharray='4 5'/>
      <text x='60' y='50' ${mono} font-size='13' fill='${M}'>θ → E(θ)</text>`;
  })(),

  // quantum-chemistry-and-machine-learning: a molecule beside a small neural network
  'quantum-chemistry-and-machine-learning': `${[0, 1, 2, 3, 4, 5].map((i) => { const a = Math.PI / 3 * i + Math.PI / 6; return `<circle cx='${(110 + 52 * Math.cos(a)).toFixed(1)}' cy='${(125 + 52 * Math.sin(a)).toFixed(1)}' r='9' fill='${G}'/>`; }).join('')}
      <polygon points='${[0, 1, 2, 3, 4, 5].map((i) => { const a = Math.PI / 3 * i + Math.PI / 6; return `${(110 + 52 * Math.cos(a)).toFixed(1)},${(125 + 52 * Math.sin(a)).toFixed(1)}`; }).join(' ')}' fill='none' stroke='${GL}' stroke-width='2'/>
      <circle cx='110' cy='125' r='26' fill='none' stroke='${V}' stroke-width='1.5' stroke-dasharray='3 4'/>
      ${[[250, [80, 125, 170]], [310, [100, 150]], [365, [125]]].map(([x, ys], li, arr) => ys.map((y) => (li < arr.length - 1 ? arr[li + 1][1].map((y2) => `<line x1='${x}' y1='${y}' x2='${arr[li + 1][0]}' y2='${y2}' stroke='${M}' stroke-opacity='.35'/>`).join('') : '') + `<circle cx='${x}' cy='${y}' r='9' fill='${li === 2 ? P : V}'/>`).join('')).join('')}`,

  // real-hardware-and-your-path: a quantum chip and a rising path to a star
  'real-hardware-and-your-path': `<rect x='60' y='95' width='90' height='90' rx='10' fill='#0B1026' stroke='${G}' stroke-width='2.5'/>
      ${[0, 1, 2].map((r) => [0, 1, 2].map((c) => `<circle cx='${83 + c * 22}' cy='${118 + r * 22}' r='6' fill='${V}'/>`).join('')).join('')}
      ${[0, 1, 2, 3].map((i) => `<line x1='${72 + i * 22}' y1='95' x2='${72 + i * 22}' y2='83' stroke='${G}' stroke-width='2'/><line x1='${72 + i * 22}' y1='185' x2='${72 + i * 22}' y2='197' stroke='${G}' stroke-width='2'/>`).join('')}
      <path d='M170 200 L215 165 L250 178 L300 120 L340 70' fill='none' stroke='${GL}' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'/>
      <path d='M340 36 L347 54 L366 55 L351 67 L356 86 L340 75 L324 86 L329 67 L314 55 L333 54 Z' fill='${G}'/>`,
};

