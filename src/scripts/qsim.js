// Tiny, exact state-vector simulator for 1 and 2 qubits (complex numbers as [re, im]).
export const C = {
  add: (a, b) => [a[0] + b[0], a[1] + b[1]],
  mul: (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]],
  conj: (a) => [a[0], -a[1]],
  abs2: (a) => a[0] * a[0] + a[1] * a[1],
  expi: (t) => [Math.cos(t), Math.sin(t)],
};
const s = Math.SQRT1_2;
export const GATES = {
  X: [[[0, 0], [1, 0]], [[1, 0], [0, 0]]],
  Y: [[[0, 0], [0, -1]], [[0, 1], [0, 0]]],
  Z: [[[1, 0], [0, 0]], [[0, 0], [-1, 0]]],
  H: [[[s, 0], [s, 0]], [[s, 0], [-s, 0]]],
  S: [[[1, 0], [0, 0]], [[0, 0], [0, 1]]],
  T: [[[1, 0], [0, 0]], [[0, 0], [s, s]]],
};
// Bloch-sphere rotation equivalent to each gate (up to global phase): axis, angle.
export const ROT = {
  X: [[1, 0, 0], Math.PI], Y: [[0, 1, 0], Math.PI], Z: [[0, 0, 1], Math.PI],
  H: [[s, 0, s], Math.PI], S: [[0, 0, 1], Math.PI / 2], T: [[0, 0, 1], Math.PI / 4],
};

export function apply1(g, st) {
  const m = GATES[g];
  return [C.add(C.mul(m[0][0], st[0]), C.mul(m[0][1], st[1])), C.add(C.mul(m[1][0], st[0]), C.mul(m[1][1], st[1]))];
}

// Remove global phase so alpha is real and >= 0 (makes the display readable).
export function normPhase(st) {
  const r = Math.hypot(st[0][0], st[0][1]);
  if (r < 1e-12) { const r1 = Math.hypot(st[1][0], st[1][1]); return [[0, 0], [r1, 0]]; }
  const ph = C.conj([st[0][0] / r, st[0][1] / r]);
  return [C.mul(st[0], ph), C.mul(st[1], ph)];
}

export function bloch(st) {
  const [a, b] = st;
  const ab = C.mul(C.conj(a), b);
  return [2 * ab[0], 2 * ab[1], C.abs2(a) - C.abs2(b)];
}

export function rotate(v, axis, ang) {
  const [x, y, z] = v, [u, w, k] = axis, c = Math.cos(ang), sn = Math.sin(ang), d = u * x + w * y + k * z;
  return [
    x * c + (w * z - k * y) * sn + u * d * (1 - c),
    y * c + (k * x - u * z) * sn + w * d * (1 - c),
    z * c + (u * y - w * x) * sn + k * d * (1 - c),
  ];
}

export function fmt(z, d = 3) {
  const r = (x) => { const v = Math.abs(x) < 5e-4 ? 0 : x; return (+v.toFixed(d)).toString(); };
  const re = Math.abs(z[0]) < 5e-4 ? 0 : z[0], im = Math.abs(z[1]) < 5e-4 ? 0 : z[1];
  if (im === 0) return r(re).replace('-', '−');
  if (re === 0) return (im === 1 ? '' : im === -1 ? '−' : r(im).replace('-', '−')) + 'i';
  return `${r(re).replace('-', '−')} ${im < 0 ? '−' : '+'} ${r(Math.abs(im))}i`;
}

// ---- two qubits: basis order |q0 q1> = 00, 01, 10, 11 ----
export function apply2single(g, q, st) {
  const m = GATES[g], out = st.map(() => [0, 0]);
  for (let i = 0; i < 4; i++) {
    const bit = q === 0 ? (i >> 1) & 1 : i & 1;
    for (let b = 0; b < 2; b++) {
      const j = q === 0 ? (b << 1) | (i & 1) : (i & 2) | b;
      out[i] = C.add(out[i], C.mul(m[bit][b], st[j]));
    }
  }
  return out;
}
export function cnot(st) { return [st[0], st[1], st[3], st[2]]; }

export function sample(probs) {
  let r = Math.random(), acc = 0;
  for (let i = 0; i < probs.length; i++) { acc += probs[i]; if (r < acc) return i; }
  return probs.length - 1;
}
