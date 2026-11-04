// Course 1 structure. Lesson numbers refer to `lesson:` in each lesson's frontmatter.
export const course1 = {
  en: { name: 'Course 1: Quantum Basics', short: 'Course 1' },
  hi: { name: 'कोर्स 1: क्वांटम की बुनियाद', short: 'कोर्स 1' },
  parts: [
    { id: 'A', lessons: [0, 1, 2], explainers: ['what-is-a-qubit', 'what-is-superposition', 'what-is-the-bloch-sphere', 'what-is-entanglement', 'measurement-explained'],
      en: ['Foundations', 'What a qubit is, how gates move it, and what measurement really does.'],
      hi: ['नींव', 'Qubit क्या है, gates उसे कैसे बदलते हैं, और measurement असल में क्या करता है।'] },
    { id: 'B', lessons: [3], explainers: [],
      en: ['How quantum algorithms work', 'Oracles, phase kickback and interference: the mechanism behind every speed-up.'],
      hi: ['Quantum algorithms कैसे काम करते हैं', 'Oracles, phase kickback और interference: हर speed-up के पीछे का तरीका।'] },
    { id: 'C', lessons: [4, 5, 6], explainers: [],
      en: ['Quantum technology', 'How qubits are built, how QKD protects keys, and how quantum sensors work.'],
      hi: ['Quantum तकनीक', 'Qubits कैसे बनते हैं, QKD keys कैसे बचाता है, और quantum sensors कैसे काम करते हैं।'] },
    { id: 'D', lessons: [7, 8, 9, 10], explainers: [],
      en: ['Coding with Qiskit', 'Your first programs, teleportation, Grover and phase estimation, all in tested code.'],
      hi: ['Qiskit के साथ कोडिंग', 'पहले programs, teleportation, Grover और phase estimation, सब टेस्ट किए कोड में।'] },
    { id: 'E', lessons: [11, 12, 13, 14], explainers: [],
      en: ['Advanced topics', 'Shor\'s algorithm, error correction, variational algorithms, chemistry and ML.'],
      hi: ['एडवांस्ड विषय', 'Shor algorithm, error correction, variational algorithms, chemistry और ML।'] },
    { id: 'F', lessons: [15], explainers: [],
      en: ['Your path', 'Real hardware, a portfolio, and what to learn next.'],
      hi: ['आपका रास्ता', 'असली हार्डवेयर, portfolio, और आगे क्या सीखें।'] },
  ],
};
export const partOf = (n) => course1.parts.find((p) => p.lessons.includes(n));
