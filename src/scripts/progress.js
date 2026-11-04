// Course progress, saved in this browser only (a list of finished lesson slugs).
const KEY = 'kqv-done-v2';
// v1 stored the old 16-lesson numbers; convert them once.
const V1 = ['roadmap-what-to-learn-first', 'qubits-and-quantum-states', 'two-qubit-gates-and-circuits', 'oracles-deutsch-jozsa-bernstein-vazirani',
  'how-real-qubits-are-built', 'quantum-communication-and-qkd', 'quantum-sensing', 'your-first-quantum-program', 'teleportation-and-superdense-coding',
  'grovers-search', 'phase-estimation', 'shors-algorithm', 'your-first-error-correcting-code', 'variational-algorithms-vqe-qaoa',
  'quantum-chemistry-and-machine-learning', 'real-hardware-and-your-path'];

export function readDone() {
  try {
    const v = localStorage.getItem(KEY);
    if (v) return JSON.parse(v);
    const old = JSON.parse(localStorage.getItem('kqv-done-v1') || '[]');
    const conv = old.map((n) => V1[n]).filter(Boolean);
    if (conv.length) localStorage.setItem(KEY, JSON.stringify(conv));
    return conv;
  } catch { return []; }
}
export function writeDone(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch {}
}
