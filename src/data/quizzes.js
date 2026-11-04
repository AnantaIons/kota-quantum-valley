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
    Q(['Which step of Shor\'s algorithm needs a quantum computer?', ['Computing a gcd', 'Finding the order r of a mod N', 'Checking that aʳ mod N = 1', 'Choosing a random a'], 1, 'Everything else is fast classically. Order finding is the one hard step, and the quantum computer does it by phase estimation.'],
      ['Shor के algorithm का कौन-सा क़दम quantum computer माँगता है?', ['gcd निकालना', 'mod N में a का order r ढूँढना', 'aʳ mod N = 1 जाँचना', 'Random a चुनना'], 1, 'बाक़ी सब classically तेज़ है। Order finding ही कठिन क़दम है, और quantum computer इसे phase estimation से करता है।']),
    Q(['For N = 15 and a = 7 (order r = 4), which gcds give the factors?', ['gcd(6, 15) and gcd(8, 15)', 'gcd(48, 15) and gcd(50, 15)', 'gcd(7, 15) and gcd(4, 15)', 'gcd(13, 15) and gcd(1, 15)'], 1, '7^(r/2) = 7² = 49, so gcd(48, 15) = 3 and gcd(50, 15) = 5.'],
      ['N = 15 और a = 7 (order r = 4) के लिए कौन-से gcd factors देते हैं?', ['gcd(6, 15) और gcd(8, 15)', 'gcd(48, 15) और gcd(50, 15)', 'gcd(7, 15) और gcd(4, 15)', 'gcd(13, 15) और gcd(1, 15)'], 1, '7^(r/2) = 7² = 49, तो gcd(48, 15) = 3 और gcd(50, 15) = 5।']),
    Q(['What are the eigenphases of U|y⟩ = |ay mod N⟩ on the cycle through |1⟩?', ['s/r for s = 0 … r − 1', 'a/N', 'r/N', 'Only 0 and ½'], 0, 'The eigenstates |u_s⟩ have eigenvalues e^(2πi·s/r), and |1⟩ is an equal mix of all of them, so phase estimation returns s/r for a random s.'],
      ['|1⟩ से गुज़रने वाले चक्र पर U|y⟩ = |ay mod N⟩ के eigenphases क्या हैं?', ['s = 0 … r − 1 के लिए s/r', 'a/N', 'r/N', 'सिर्फ़ 0 और ½'], 0, 'Eigenstates |u_s⟩ के eigenvalues e^(2πi·s/r) हैं, और |1⟩ इन सबका बराबर मिश्रण है, इसलिए phase estimation किसी random s के लिए s/r देता है।']),
    Q(['Why are the controlled powers U^(2ᵏ) cheap in Shor\'s algorithm?', ['They can be skipped', 'a^(2ᵏ) mod N is found classically by repeated squaring, so each power is one multiplication', 'The QFT applies them', 'They act on a single qubit'], 1, 'Multiplying by a^(2ᵏ) mod N is a single modular multiplication by a known constant, not 2ᵏ applications of U.'],
      ['Shor के algorithm में controlled घातें U^(2ᵏ) सस्ती क्यों हैं?', ['उन्हें छोड़ा जा सकता है', 'a^(2ᵏ) mod N बार-बार वर्ग करके classically मिलता है, तो हर घात एक गुणा है', 'QFT उन्हें लगाता है', 'वे एक ही qubit पर काम करती हैं'], 1, 'a^(2ᵏ) mod N से गुणा एक ज्ञात स्थिरांक से एक modular गुणा है, U के 2ᵏ प्रयोग नहीं।']),
    Q(['With t = 8 and N = 15, a run gives k = 128, so k/2ᵗ = 1/2 and the guess is r = 2. What now?', ['Accept r = 2', 'It is only a divisor of r: 7² mod 15 = 4 ≠ 1 shows it is wrong, so run again', 'N must be prime', 'Add more counting qubits'], 1, 'The outcome came from s = 2, which shares a factor with r = 4. Checking aʳ mod N = 1 always tells you whether a guess is right.'],
      ['t = 8 और N = 15 के साथ एक run k = 128 देता है, तो k/2ᵗ = 1/2 और अनुमान r = 2 है। अब क्या?', ['r = 2 मान लें', 'यह r का सिर्फ़ भाजक है: 7² mod 15 = 4 ≠ 1 दिखाता है कि यह ग़लत है, तो फिर चलाएँ', 'N prime होना चाहिए', 'और counting qubits जोड़ें'], 1, 'नतीजा s = 2 से आया, जिसका r = 4 के साथ साझा factor है। aʳ mod N = 1 जाँचना हमेशा बताता है कि अनुमान सही है या नहीं।']),
    Q(['Which numbers have been honestly factored with Shor\'s algorithm on real hardware?', ['Only 15', 'Numbers up to RSA-250', '21, 35 and 143', 'Any 48-bit number'], 0, 'Fifteen was factored on NMR (2001) and trapped ions (2016). An honest circuit for 21 needs over 100 times more entangling gates, and published runs for 21 used shortcuts.'],
      ['असली hardware पर Shor के algorithm से ईमानदारी से किन संख्याओं के factors निकाले गए हैं?', ['सिर्फ़ 15', 'RSA-250 तक की संख्याएँ', '21, 35 और 143', 'कोई भी 48-bit संख्या'], 0, '15 के factors NMR (2001) और trapped ions (2016) पर निकाले गए। 21 के ईमानदार circuit को 100 गुना से ज़्यादा entangling gates चाहिए, और 21 के प्रकाशित runs ने shortcuts इस्तेमाल किए।']),
  ],
  'variational-algorithms-vqe-qaoa': [
    Q(['Why can no trial state have an energy below the ground energy E₀?', ['Because of shot noise', 'Its energy is a weighted average of the energy levels, with weights |cᵢ|²', 'Because the optimiser forbids it', 'Only for one qubit'], 1, '⟨ψ|H|ψ⟩ = Σ|cᵢ|²Eᵢ, and an average can never be below its smallest member, E₀.'],
      ['कोई trial state ground energy E₀ से कम energy क्यों नहीं रख सकती?', ['Shot noise की वजह से', 'उसकी energy energy levels का भारित औसत है, भार |cᵢ|² के साथ', 'क्योंकि optimiser मना करता है', 'सिर्फ़ एक qubit के लिए'], 1, '⟨ψ|H|ψ⟩ = Σ|cᵢ|²Eᵢ, और कोई औसत अपने सबसे छोटे सदस्य E₀ से कम नहीं हो सकता।']),
    Q(['How is ⟨X⟩ of a qubit measured on hardware that only measures in the Z basis?', ['It can\'t be', 'Apply H, then measure and average ±1', 'Apply X twice', 'Measure twice as many shots'], 1, 'H rotates the X axis onto the Z axis. Each shot then gives +1 or −1, and the average estimates ⟨X⟩.'],
      ['जो hardware सिर्फ़ Z basis में मापता है, उस पर qubit का ⟨X⟩ कैसे मापा जाता है?', ['नहीं मापा जा सकता', 'H लगाएँ, फिर मापें और ±1 का औसत लें', 'X दो बार लगाएँ', 'दोगुने shots मापें'], 1, 'H, X अक्ष को Z अक्ष पर घुमा देता है। फिर हर shot +1 या −1 देता है, और औसत ⟨X⟩ का अनुमान है।']),
    Q(['The parameter-shift rule computes dE/dθ for a rotation gate as…', ['[E(θ + h) − E(θ − h)]/(2h) with tiny h', '[E(θ + π/2) − E(θ − π/2)]/2, exactly', 'E(θ)/θ', 'It needs a classical simulation'], 1, 'For rotation gates, E(θ) = A + B cos θ + C sin θ, so a quarter-turn shift either side gives the exact derivative, with large, noise-robust differences.'],
      ['Parameter-shift rule किसी rotation gate के लिए dE/dθ ऐसे निकालता है…', ['बहुत छोटे h के साथ [E(θ + h) − E(θ − h)]/(2h)', '[E(θ + π/2) − E(θ − π/2)]/2, सटीक', 'E(θ)/θ', 'इसे classical simulation चाहिए'], 1, 'Rotation gates के लिए E(θ) = A + B cos θ + C sin θ, इसलिए दोनों ओर चौथाई चक्कर का खिसकाव सटीक derivative देता है, बड़े और noise-सहने वाले अंतरों के साथ।']),
    Q(['A circuit has 500 parameters. Why might you choose SPSA over parameter-shift gradients?', ['SPSA is exact', 'Each SPSA step costs 2 energy evaluations, versus 1,000 for a parameter-shift gradient', 'SPSA needs no quantum computer', 'Parameter shifts don\'t work with CNOTs'], 1, 'SPSA nudges all parameters at once in a random direction, so its cost per step doesn\'t grow with the number of parameters, and it tolerates noise well.'],
      ['एक circuit में 500 parameters हैं। Parameter-shift gradients के बजाय SPSA क्यों चुन सकते हैं?', ['SPSA सटीक है', 'हर SPSA क़दम 2 energy evaluations लेता है, parameter-shift gradient के 1,000 के मुक़ाबले', 'SPSA को quantum computer नहीं चाहिए', 'Parameter shifts CNOTs के साथ काम नहीं करते'], 1, 'SPSA सभी parameters को एक साथ random दिशा में खिसकाता है, इसलिए हर क़दम की लागत parameters की संख्या के साथ नहीं बढ़ती, और यह noise अच्छी तरह सहता है।']),
    Q(['Which hardware error can a VQE optimiser largely compensate for?', ['Depolarising noise', 'A systematic 10% over-rotation of every RY gate', 'Random readout flips', 'Qubit loss'], 1, 'Systematic (coherent) errors are absorbed because the optimiser simply learns different angles. Random (incoherent) noise can\'t be undone by any choice of angles.'],
      ['VQE optimiser hardware की किस error की भरपाई ज़्यादातर कर सकता है?', ['Depolarising noise', 'हर RY gate का व्यवस्थित 10% over-rotation', 'Random readout flips', 'Qubit खो जाना'], 1, 'व्यवस्थित (coherent) errors सोख ली जाती हैं क्योंकि optimiser बस अलग कोण सीख लेता है। Random (incoherent) noise कोणों के किसी चुनाव से उलटा नहीं जा सकता।']),
    Q(['QAOA with p = 1 on a ring network achieves which cut ratio?', ['1/2, the same as random guessing', '3/4', '0.878', 'Always the optimum'], 1, 'The best p = 1 angles give an expected cut of 3/4 of the links on any ring, because each link sees the same local neighbourhood.'],
      ['Ring network पर p = 1 वाला QAOA कौन-सा cut अनुपात पाता है?', ['1/2, random अनुमान के बराबर', '3/4', '0.878', 'हमेशा optimum'], 1, 'p = 1 के सबसे अच्छे कोण किसी भी ring पर links के 3/4 का अपेक्षित cut देते हैं, क्योंकि हर link को एक जैसा स्थानीय पड़ोस दिखता है।']),
  ],
};
