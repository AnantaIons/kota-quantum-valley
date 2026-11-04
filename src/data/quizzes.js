// End-of-lesson quizzes, keyed by lesson slug. Each question: [question, [options], correctIndex, explanation], in EN and HI.
// Keep options in the same order in both languages.

import { Q } from './quiz/q.js';
import { quiz as qA } from './quiz/part-a.js';
import { quiz as qB } from './quiz/part-b.js';
import { quiz as qC } from './quiz/part-c.js';
import { quiz as qE } from './quiz/part-e.js';
import { quiz as qG } from './quiz/part-g.js';

export const quizzes = {
  ...qA, ...qB, ...qC, ...qE, ...qG,
  'roadmap-what-to-learn-first': [
    Q(['Which subject should you start with first?', ['Electronics', 'Maths', 'Chemistry', 'Cryptography'], 1, 'Every later idea in quantum computing is written in maths: complex numbers, vectors and matrices.'],
      ['सबसे पहले कौन-सा विषय शुरू करना चाहिए?', ['इलेक्ट्रॉनिक्स', 'मैथ्स', 'केमिस्ट्री', 'Cryptography'], 1, 'क्वांटम कंप्यूटिंग का हर आगे का विचार मैथ्स में लिखा है: complex numbers, vectors और matrices।']),
    Q(['Why does quantum computing need matrices?', ['To store files', 'Every gate is a matrix', 'To draw circuits', 'They make computers cold'], 1, 'A gate changes a state vector by matrix multiplication.'],
      ['क्वांटम कंप्यूटिंग को matrices क्यों चाहिए?', ['Files रखने के लिए', 'हर gate एक matrix है', 'Circuits बनाने के लिए', 'वे कंप्यूटर ठंडा करती हैं'], 1, 'Gate, state vector को matrix गुणा से बदलता है।']),
    Q(['What is |3 + 4i|?', ['7', '5', '1', '12'], 1, '|a + bi| = √(a² + b²) = √(9 + 16) = 5.'],
      ['|3 + 4i| क्या है?', ['7', '5', '1', '12'], 1, '|a + bi| = √(a² + b²) = √(9 + 16) = 5।']),
    Q(['Which book is the "final goal" of the reading list?', ['The Art of Electronics', 'Feynman Lectures Vol. III', 'Nielsen & Chuang', 'Python Crash Course'], 2, 'Nielsen & Chuang, Quantum Computation and Quantum Information, is the standard textbook of the field.'],
      ['किताबों की सूची में "अंतिम लक्ष्य" कौन-सी है?', ['The Art of Electronics', 'Feynman Lectures Vol. III', 'Nielsen & Chuang', 'Python Crash Course'], 2, 'Nielsen & Chuang की Quantum Computation and Quantum Information इस क्षेत्र की मानक किताब है।']),
  ],
  'qubits-and-quantum-states': [
    Q(['A qubit is in √0.8|0⟩ + √0.2|1⟩. What is P(1)?', ['0.8', '0.2', '0.45', '√0.2'], 1, 'P(1) = |β|² = (√0.2)² = 0.2.'],
      ['Qubit √0.8|0⟩ + √0.2|1⟩ में है। P(1) क्या है?', ['0.8', '0.2', '0.45', '√0.2'], 1, 'P(1) = |β|² = (√0.2)² = 0.2।']),
    Q(['Which of these is a valid qubit state?', ['[0.5, 0.5]', '[0.6, 0.8]', '[1, 1]', '[0.9, 0.9]'], 1, '0.6² + 0.8² = 0.36 + 0.64 = 1. The others don\'t add up to 1.'],
      ['इनमें से कौन-सी सही qubit state है?', ['[0.5, 0.5]', '[0.6, 0.8]', '[1, 1]', '[0.9, 0.9]'], 1, '0.6² + 0.8² = 0.36 + 0.64 = 1। बाक़ी का जोड़ 1 नहीं है।']),
    Q(['What happens right after you measure a qubit and get 1?', ['It stays in superposition', 'It becomes |1⟩', 'It becomes |0⟩', 'It is destroyed'], 1, 'Measurement collapses the state to the result you saw.'],
      ['Qubit measure करके 1 मिलने के ठीक बाद क्या होता है?', ['Superposition में रहता है', '|1⟩ बन जाता है', '|0⟩ बन जाता है', 'नष्ट हो जाता है'], 1, 'Measurement state को उसी नतीजे पर collapse कर देता है जो आपने देखा।']),
    Q(['Why do amplitudes, not probabilities, make quantum computing powerful?', ['Amplitudes are bigger', 'Amplitudes can cancel each other', 'Amplitudes are always positive', 'Amplitudes are easy to read'], 1, 'Amplitudes can be negative or complex, so they can interfere and cancel. Probabilities never can.'],
      ['Probabilities नहीं, amplitudes क्वांटम कंप्यूटिंग को ताक़तवर क्यों बनाते हैं?', ['Amplitudes बड़े होते हैं', 'Amplitudes एक-दूसरे को cancel कर सकते हैं', 'Amplitudes हमेशा positive हैं', 'Amplitudes पढ़ना आसान है'], 1, 'Amplitudes negative या complex हो सकते हैं, इसलिए interfere करके cancel हो सकते हैं। Probabilities कभी नहीं।']),
  ],
  'your-first-quantum-program': [
    Q(['What does Statevector(qc) let you do?', ['Run on real hardware', 'Peek at the amplitudes (simulator only)', 'Measure 1,000 times', 'Draw the circuit'], 1, 'It computes the exact amplitudes, which real hardware can never show you.'],
      ['Statevector(qc) से क्या कर सकते हैं?', ['असली हार्डवेयर पर चलाना', 'Amplitudes देखना (सिर्फ़ simulator)', '1,000 बार measure करना', 'Circuit बनाना'], 1, 'यह ठीक-ठीक amplitudes निकालता है, जो असली हार्डवेयर कभी नहीं दिखा सकता।']),
    Q(['A Bell pair measured 1,000 times gives…', ['All four results equally', 'Only 00 and 11', 'Only 01 and 10', 'Always 00'], 1, 'The two qubits always agree: about half 00, half 11.'],
      ['Bell pair को 1,000 बार measure करने पर मिलता है…', ['चारों नतीजे बराबर', 'सिर्फ़ 00 और 11', 'सिर्फ़ 01 और 10', 'हमेशा 00'], 1, 'दोनों qubits हमेशा मेल खाते हैं: लगभग आधे 00, आधे 11।']),
    Q(['H then H on |0⟩, measured 1,000 times, gives…', ['500/500', '0 every time', '1 every time', 'Random'], 1, 'The two paths to |1⟩ cancel: interference.'],
      ['|0⟩ पर H फिर H, 1,000 बार measure करने पर…', ['500/500', 'हर बार 0', 'हर बार 1', 'Random'], 1, '|1⟩ तक के दोनों रास्ते cancel हो जाते हैं: interference।']),
    Q(['You apply X to qubit 1 of 2. Qiskit prints…', ["'01'", "'10'", "'11'", "'00'"], 1, 'Qiskit writes qubit 0 on the right, so the string is q1 q0 = 10.'],
      ['2 में से qubit 1 पर X लगाया। Qiskit छापता है…', ["'01'", "'10'", "'11'", "'00'"], 1, 'Qiskit qubit 0 को दाएँ लिखता है, तो string q1 q0 = 10 है।']),
  ],
  'teleportation-and-superdense-coding': [
    Q(['Teleportation moves…', ['Matter', 'A quantum state', 'Energy', 'Photons faster than light'], 1, 'Only the state moves; Bob\'s qubit was already with Bob.'],
      ['Teleportation क्या भेजता है?', ['पदार्थ', 'एक quantum state', 'Energy', 'रोशनी से तेज़ photons'], 1, 'सिर्फ़ state जाती है; Bob का qubit पहले से Bob के पास था।']),
    Q(['How many classical bits does Alice send in teleportation?', ['0', '2', '1', '4'], 1, 'Two bits tell Bob which correction (nothing, X, Z, or both) to apply.'],
      ['Teleportation में Alice कितने classical bits भेजती है?', ['0', '2', '1', '4'], 1, 'दो bits बताते हैं कि Bob कौन-सा सुधार (कुछ नहीं, X, Z या दोनों) लगाए।']),
    Q(['Why isn\'t teleportation faster than light?', ['It is', 'Bob needs Alice\'s classical bits first', 'Photons are slow', 'Entanglement breaks'], 1, 'Until the bits arrive, Bob\'s qubit looks completely random.'],
      ['Teleportation रोशनी से तेज़ क्यों नहीं?', ['है', 'Bob को पहले Alice के classical bits चाहिए', 'Photons धीमे हैं', 'Entanglement टूटता है'], 1, 'Bits पहुँचने तक Bob का qubit पूरी तरह random दिखता है।']),
    Q(['Superdense coding sends 2 classical bits using…', ['2 qubits sent', '1 qubit sent, plus a shared Bell pair', 'No qubits', '4 qubits'], 1, 'Alice encodes on her half of a Bell pair and sends just that one qubit.'],
      ['Superdense coding 2 classical bits भेजता है…', ['2 qubits भेजकर', '1 qubit भेजकर, साझा Bell pair के साथ', 'बिना qubits', '4 qubits'], 1, 'Alice Bell pair के अपने आधे हिस्से पर encode करके सिर्फ़ वही एक qubit भेजती है।']),
  ],
  'grovers-search': [
    Q(['What does Grover\'s oracle do?', ['Measures the answer', 'Flips the sign of the marked state', 'Copies the answer', 'Sorts the list'], 1, 'It multiplies the marked amplitude by −1; probabilities don\'t change yet.'],
      ['Grover का oracle क्या करता है?', ['जवाब measure करता है', 'Marked state का चिह्न पलटता है', 'जवाब copy करता है', 'List sort करता है'], 1, 'यह marked amplitude को −1 से गुणा करता है; probabilities अभी नहीं बदलतीं।']),
    Q(['For N = 4, how many Grover rounds give the answer with certainty?', ['2', '1', '4', '√4 + 1'], 1, 'One round is exactly right for N = 4.'],
      ['N = 4 के लिए कितने Grover rounds से जवाब पक्का मिलता है?', ['2', '1', '4', '√4 + 1'], 1, 'N = 4 के लिए एक round बिल्कुल सही है।']),
    Q(['What happens if you do too many rounds?', ['Nothing', 'You rotate past the answer', 'It gets faster', 'The circuit crashes'], 1, 'Grover is a rotation; extra rounds overshoot and lower the success probability.'],
      ['ज़्यादा rounds करने पर क्या होता है?', ['कुछ नहीं', 'आप जवाब से आगे घूम जाते हैं', 'तेज़ हो जाता है', 'Circuit crash'], 1, 'Grover एक घुमाव है; अतिरिक्त rounds आगे निकल जाते हैं और सफलता घटती है।']),
    Q(['About how many rounds for N = 1,000,000?', ['500,000', '~785', '1,000', '20'], 1, '(π/4)·√1,000,000 ≈ 785.'],
      ['N = 10,00,000 के लिए लगभग कितने rounds?', ['5,00,000', '~785', '1,000', '20'], 1, '(π/4)·√10,00,000 ≈ 785।']),
  ],
  'shors-algorithm': [
    Q(['Shor turns factoring into…', ['Sorting', 'Finding a period', 'Searching', 'Measuring'], 1, 'Factoring N reduces to finding the period of aˣ mod N.'],
      ['Shor factoring को किसमें बदलता है?', ['Sorting', 'Period ढूँढना', 'Search', 'Measuring'], 1, 'N की factoring, aˣ mod N का period ढूँढने में बदल जाती है।']),
    Q(['For N = 15, a = 7, the period r is…', ['2', '4', '7', '15'], 1, '7ˣ mod 15 = 1, 7, 4, 13, 1, … repeats every 4.'],
      ['N = 15, a = 7 के लिए period r है…', ['2', '4', '7', '15'], 1, '7ˣ mod 15 = 1, 7, 4, 13, 1, … हर 4 पर दोहराता है।']),
    Q(['gcd(48, 15) = ?', ['5', '3', '15', '1'], 1, '48 = 3 × 16 and 15 = 3 × 5, so the gcd is 3.'],
      ['gcd(48, 15) = ?', ['5', '3', '15', '1'], 1, '48 = 3 × 16 और 15 = 3 × 5, तो gcd 3 है।']),
    Q(['Roughly how many noisy physical qubits to break RSA-2048 (2025 estimate)?', ['50', 'About a million', '1,000', 'A billion'], 1, 'A 2025 estimate put it at under a million noisy qubits running for about a week.'],
      ['RSA-2048 तोड़ने के लिए लगभग कितने noisy physical qubits (2025 का अनुमान)?', ['50', 'लगभग 10 लाख', '1,000', 'एक अरब'], 1, '2025 के अनुमान के अनुसार 10 लाख से कम noisy qubits, लगभग एक हफ़्ते चलाकर।']),
  ],
  'variational-algorithms-vqe-qaoa': [
    Q(['In VQE, who adjusts the circuit\'s angles?', ['The quantum computer', 'A classical optimiser', 'The user by hand', 'Nobody'], 1, 'It\'s a loop: the quantum computer measures, a classical optimiser updates θ.'],
      ['VQE में circuit के कोण कौन बदलता है?', ['Quantum computer', 'Classical optimiser', 'User हाथ से', 'कोई नहीं'], 1, 'यह loop है: quantum computer measure करता है, classical optimiser θ बदलता है।']),
    Q(['The variational principle says the measured energy is…', ['Always exact', '≥ the true ground energy', '≤ the ground energy', 'Random'], 1, 'Any trial state\'s energy is at least the ground-state energy, so lowering it only helps.'],
      ['Variational principle कहता है measured energy…', ['हमेशा ठीक', 'असली ground energy से ≥', 'Ground energy से ≤', 'Random'], 1, 'किसी भी trial state की energy कम से कम ground energy होती है, इसलिए घटाना हमेशा मदद करता है।']),
    Q(['What is a barren plateau?', ['A hardware fault', 'A nearly flat cost landscape where optimisers get lost', 'A type of qubit', 'A QAOA layer'], 1, 'In large random circuits, gradients vanish and training stalls.'],
      ['Barren plateau क्या है?', ['हार्डवेयर ख़राबी', 'लगभग सपाट cost landscape जिसमें optimisers भटक जाते हैं', 'एक तरह का qubit', 'QAOA layer'], 1, 'बड़े random circuits में gradients ग़ायब हो जाते हैं और training रुक जाती है।']),
    Q(['QAOA is designed for…', ['Factoring', 'Combinatorial optimisation like MaxCut', 'Teleportation', 'Error correction'], 1, 'It alternates problem and mixer layers to find good solutions.'],
      ['QAOA किसके लिए बना है?', ['Factoring', 'MaxCut जैसे combinatorial optimisation', 'Teleportation', 'Error correction'], 1, 'यह problem और mixer layers बारी-बारी लगाकर अच्छे हल ढूँढता है।']),
  ],
};
