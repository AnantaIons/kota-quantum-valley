// Course 1 structure. The position of a lesson in `syllabus` is its lesson number (0 = Roadmap).
// To add a lesson: write src/pages/posts/<slug>.md (+ Hindi in src/pages/hi/lessons/<slug>.md)
// and make sure its slug is in the list below. Lessons not yet written show as "coming soon".

export const syllabus = [
  // Part A: Getting ready
  ['roadmap-what-to-learn-first', 'Roadmap: what to learn first', 'रोडमैप: पहले क्या सीखें'],
  ['bits-and-classical-computing', 'Bits, logic gates and classical computing', 'Bits, logic gates और classical computing'],
  ['complex-numbers-for-quantum', 'Complex numbers for quantum', 'क्वांटम के लिए complex numbers'],
  ['vectors-and-dirac-notation', 'Vectors and Dirac notation', 'Vectors और Dirac notation'],
  ['matrices-and-unitary-operations', 'Matrices and unitary operations', 'Matrices और unitary operations'],
  ['probability-and-the-quantum-experiments', 'Probability and the experiments that broke physics', 'Probability और वे प्रयोग जिन्होंने physics बदल दी'],
  // Part B: One qubit
  ['qubits-and-quantum-states', 'Qubits and quantum states', 'Qubits और quantum states'],
  ['superposition-and-the-bloch-sphere', 'Superposition and the Bloch sphere', 'Superposition और Bloch sphere'],
  ['measurement-and-the-born-rule', 'Measurement and the Born rule', 'Measurement और Born rule'],
  ['single-qubit-gates', 'Single-qubit gates: X, Y, Z, H, S, T', 'Single-qubit gates: X, Y, Z, H, S, T'],
  ['phase-global-and-relative', 'Phase: global and relative', 'Phase: global और relative'],
  ['rotations-and-any-single-qubit-gate', 'Rotations and building any single-qubit gate', 'Rotations और कोई भी single-qubit gate'],
  // Part C: Many qubits
  ['many-qubits-and-the-tensor-product', 'Many qubits and the tensor product', 'कई qubits और tensor product'],
  ['two-qubit-gates-and-circuits', 'Two-qubit gates and circuits', 'Two-qubit gates और circuits'],
  ['entanglement-and-bell-states', 'Entanglement and the Bell states', 'Entanglement और Bell states'],
  ['bell-inequalities-and-chsh', 'Bell inequalities and the CHSH game', 'Bell inequalities और CHSH game'],
  ['no-cloning-and-quantum-information', 'No-cloning and what quantum information is', 'No-cloning और quantum information क्या है'],
  ['universal-gates-and-compilation', 'Universal gate sets and compilation', 'Universal gate sets और compilation'],
  // Part D: Coding with Qiskit
  ['your-first-quantum-program', 'Your first quantum program', 'आपका पहला quantum program'],
  ['qiskit-circuits-in-depth', 'Qiskit circuits in depth', 'Qiskit circuits गहराई से'],
  ['simulators-shots-and-statistics', 'Simulators, shots and statistics', 'Simulators, shots और statistics'],
  ['teleportation-and-superdense-coding', 'Teleportation and superdense coding', 'Teleportation और superdense coding'],
  // Part E: Quantum algorithms
  ['oracles-deutsch-jozsa-bernstein-vazirani', 'Oracles, Deutsch-Jozsa and Bernstein-Vazirani', 'Oracles, Deutsch-Jozsa और Bernstein-Vazirani'],
  ['simons-algorithm', 'Simon\'s algorithm', 'Simon का algorithm'],
  ['grovers-search', 'Grover\'s search', 'Grover search'],
  ['amplitude-amplification', 'Amplitude amplification', 'Amplitude amplification'],
  ['the-quantum-fourier-transform', 'The quantum Fourier transform', 'Quantum Fourier transform'],
  ['phase-estimation', 'Quantum phase estimation', 'Quantum phase estimation'],
  ['shors-algorithm', 'Shor\'s algorithm, step by step', 'Shor algorithm, क़दम-दर-क़दम'],
  ['simulating-quantum-systems', 'Simulating quantum systems', 'Quantum systems का simulation'],
  ['variational-algorithms-vqe-qaoa', 'Variational algorithms: VQE and QAOA', 'Variational algorithms: VQE और QAOA'],
  ['what-quantum-computers-can-and-cant-do', 'What quantum computers can and can\'t do', 'Quantum computers क्या कर सकते हैं और क्या नहीं'],
  // Part F: Errors and correction
  ['noise-and-decoherence-in-circuits', 'Noise and decoherence in circuits', 'Circuits में noise और decoherence'],
  ['your-first-error-correcting-code', 'Your first error-correcting code', 'आपका पहला error-correcting code'],
  ['stabilizer-codes', 'Stabilizer codes', 'Stabilizer codes'],
  ['the-surface-code-and-fault-tolerance', 'The surface code and fault tolerance', 'Surface code और fault tolerance'],
  ['error-mitigation', 'Error mitigation', 'Error mitigation'],
  // Part G: Hardware
  ['how-real-qubits-are-built', 'How real qubits are built', 'असली qubits कैसे बनते हैं'],
  ['superconducting-qubits-and-control-electronics', 'Superconducting qubits and control electronics', 'Superconducting qubits और control electronics'],
  ['ions-atoms-and-photons', 'Ions, neutral atoms and photons', 'Ions, neutral atoms और photons'],
  ['transpiling-and-running-on-hardware', 'Transpiling and running on real hardware', 'Transpiling और असली हार्डवेयर पर चलाना'],
  // Part H: Communication and sensing
  ['quantum-communication-and-qkd', 'Quantum communication and QKD', 'Quantum communication और QKD'],
  ['the-quantum-internet', 'The quantum internet', 'Quantum internet'],
  ['post-quantum-cryptography', 'Post-quantum cryptography', 'Post-quantum cryptography'],
  ['quantum-sensing', 'Quantum sensing', 'Quantum sensing'],
  // Part I: Applications and your path
  ['quantum-chemistry-and-machine-learning', 'Quantum chemistry and machine learning', 'Quantum chemistry और machine learning'],
  ['quantum-optimisation-and-finance', 'Quantum optimisation and finance', 'Quantum optimisation और finance'],
  ['the-quantum-industry-and-india', 'The quantum industry and India', 'Quantum industry और भारत'],
  ['reading-quantum-research', 'How to read quantum research', 'Quantum research कैसे पढ़ें'],
  ['real-hardware-and-your-path', 'Real hardware and your path', 'असली हार्डवेयर और आपका रास्ता'],
].map(([slug, en, hi], n) => ({ slug, n, en, hi }));

export const lessonNumber = (slug) => syllabus.find((s) => s.slug === slug)?.n;
export const isLessonSlug = (slug) => syllabus.some((s) => s.slug === slug);

export const course1 = {
  en: { name: 'Course 1: Quantum Basics', short: 'Course 1' },
  hi: { name: 'कोर्स 1: क्वांटम की बुनियाद', short: 'कोर्स 1' },
  parts: [
    { id: 'A', from: 0, to: 5, explainers: [],
      en: ['Getting ready', 'The maths and computing you need first: bits, complex numbers, vectors, matrices and probability.'],
      hi: ['तैयारी', 'पहले ज़रूरी मैथ्स और computing: bits, complex numbers, vectors, matrices और probability।'] },
    { id: 'B', from: 6, to: 11, explainers: ['what-is-a-qubit', 'what-is-superposition', 'what-is-the-bloch-sphere', 'measurement-explained'],
      en: ['One qubit', 'States, the Bloch sphere, measurement, gates, phase and rotations, one qubit at a time.'],
      hi: ['एक qubit', 'States, Bloch sphere, measurement, gates, phase और rotations, एक qubit पर।'] },
    { id: 'C', from: 12, to: 17, explainers: ['what-is-entanglement'],
      en: ['Many qubits', 'Tensor products, two-qubit gates, entanglement, Bell tests, no-cloning and universal gate sets.'],
      hi: ['कई qubits', 'Tensor product, two-qubit gates, entanglement, Bell tests, no-cloning और universal gate sets।'] },
    { id: 'D', from: 18, to: 21, explainers: [],
      en: ['Coding with Qiskit', 'Write, simulate and read real quantum programs, then teleport a qubit.'],
      hi: ['Qiskit के साथ कोडिंग', 'असली quantum programs लिखें, simulate करें, पढ़ें, और फिर एक qubit teleport करें।'] },
    { id: 'E', from: 22, to: 31, explainers: [],
      en: ['Quantum algorithms', 'From oracles to Shor: how interference gives speed-ups, and where it doesn\'t.'],
      hi: ['Quantum algorithms', 'Oracles से Shor तक: interference से speed-up कैसे मिलता है, और कहाँ नहीं मिलता।'] },
    { id: 'F', from: 32, to: 36, explainers: [],
      en: ['Errors and correction', 'Noise, error-correcting codes, the surface code and error mitigation.'],
      hi: ['Errors और correction', 'Noise, error-correcting codes, surface code और error mitigation।'] },
    { id: 'G', from: 37, to: 40, explainers: [],
      en: ['Hardware', 'How qubits are built and controlled, and how a circuit reaches a real chip.'],
      hi: ['हार्डवेयर', 'Qubits कैसे बनते और नियंत्रित होते हैं, और circuit असली chip तक कैसे पहुँचता है।'] },
    { id: 'H', from: 41, to: 44, explainers: [],
      en: ['Communication and sensing', 'QKD, the quantum internet, post-quantum cryptography and quantum sensors.'],
      hi: ['Communication और sensing', 'QKD, quantum internet, post-quantum cryptography और quantum sensors।'] },
    { id: 'I', from: 45, to: 49, explainers: [],
      en: ['Applications and your path', 'Chemistry, ML, optimisation, the industry in India, reading papers and your next steps.'],
      hi: ['Applications और आपका रास्ता', 'Chemistry, ML, optimisation, भारत में industry, papers पढ़ना और आपके अगले क़दम।'] },
  ],
};
export const partOf = (n) => course1.parts.find((p) => n >= p.from && n <= p.to);
