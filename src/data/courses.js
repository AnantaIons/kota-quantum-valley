// Every course on the site, in order. Used by the Courses page, the home page and the Course 1 hub,
// so the course list and its wording stay the same everywhere.
// status: 'open' (complete), 'started' (some chapters open), 'prep' (being prepared).
export const courses = [
  {
    n: 1, status: 'open', href: '/lessons/', hiHref: '/hi/lessons/', art: 'orbital', shape: ['orbital', 'mix'],
    en: {
      name: 'Course 1: Quantum Basics',
      text: 'From bits and complex numbers to qubits, gates, entanglement, algorithms, error correction, hardware and your career path. 9 parts, with code and a quiz in every lesson.',
      chips: ['Qubits', 'Gates and circuits', 'Entanglement', 'Algorithms', 'Error correction', 'Hardware', 'Qiskit'],
      level: 'Class 8 onwards', lang: 'English and Hindi', cta: 'Open Course 1',
    },
    hi: {
      name: 'कोर्स 1: क्वांटम की बुनियाद',
      text: 'Bits और complex numbers से शुरू करके qubits, gates, entanglement, algorithms, error correction, हार्डवेयर और आपके करियर के रास्ते तक। 9 भाग, हर पाठ में कोड और quiz।',
      chips: ['Qubits', 'Gates और circuits', 'Entanglement', 'Algorithms', 'Error correction', 'हार्डवेयर', 'Qiskit'],
      level: 'कक्षा 8 से आगे', lang: 'हिन्दी और English', cta: 'कोर्स 1 खोलें',
    },
  },
  {
    n: 2, status: 'started', href: '/mathematics/', hiHref: '/mathematics/', art: 'tesseract', shape: ['cube', 'cobalt'],
    en: {
      name: 'Course 2: Mathematics for Quantum Science',
      text: 'From Class 10 foundations to the mathematics of quantum theory. Every chapter starts with intuition and climbs, one justified step at a time, to the hardest problems its topic produces, up to PhD level.',
      chips: ['Algebra', 'Complex numbers', 'Linear algebra', 'Calculus', 'Probability', 'Proofs'],
      level: 'Class 10 up to PhD qualifying', lang: 'English', cta: 'Open Course 2',
    },
    hi: {
      name: 'कोर्स 2: Mathematics for Quantum Science',
      text: 'कक्षा 10 की नींव से quantum theory के गणित तक। हर अध्याय सहज समझ से शुरू होकर, एक-एक प्रमाणित क़दम में, अपने विषय के सबसे कठिन सवालों तक जाता है, PhD स्तर तक।',
      chips: ['Algebra', 'Complex numbers', 'Linear algebra', 'Calculus', 'Probability', 'Proofs'],
      level: 'कक्षा 10 से PhD qualifying तक', lang: 'अभी सिर्फ़ English में', cta: 'कोर्स 2 खोलें (English)',
    },
  },
  {
    n: 3, status: 'prep', href: '/programming/', hiHref: '/programming/', art: 'gem', shape: ['octa', 'gold'],
    en: {
      name: 'Course 3: Programming in C and Python',
      text: 'Two languages, side by side, in every chapter: C to see what the machine really does, Python to get real work done fast. From your first program to writing your own quantum simulator in both.',
      chips: ['C', 'Python', 'Memory and pointers', 'Data structures', 'Numerical computing', 'Quantum simulator'],
      level: 'Complete beginner to professional', lang: 'English', cta: 'Open Course 3',
    },
    hi: {
      name: 'कोर्स 3: C और Python में प्रोग्रामिंग',
      text: 'दो भाषाएँ, हर अध्याय में साथ-साथ: C से समझिए मशीन असल में क्या करती है, Python से असली काम तेज़ी से कीजिए। पहले प्रोग्राम से लेकर दोनों भाषाओं में अपना quantum simulator लिखने तक।',
      chips: ['C', 'Python', 'Memory और pointers', 'Data structures', 'Numerical computing', 'Quantum simulator'],
      level: 'बिल्कुल शुरुआत से professional स्तर तक', lang: 'अभी सिर्फ़ English में', cta: 'कोर्स 3 खोलें (English)',
    },
  },
  {
    n: 4, status: 'prep', href: '/operating-systems/', hiHref: '/operating-systems/', art: 'nested', shape: ['icosa', 'cobalt'],
    en: {
      name: 'Course 4: Operating Systems and Embedded Linux',
      text: 'How an operating system really works, and how to build, boot and program Linux on embedded hardware. Every lab runs on your laptop with QEMU; a Raspberry Pi is optional. From your first system call to your own kernel driver and Linux image.',
      chips: ['Processes and threads', 'Memory and the MMU', 'Device drivers', 'Booting Linux', 'Real time', 'QEMU and Raspberry Pi'],
      level: 'Some C to kernel developer', lang: 'English', cta: 'Open Course 4',
    },
    hi: {
      name: 'कोर्स 4: ऑपरेटिंग सिस्टम और Embedded Linux',
      text: 'ऑपरेटिंग सिस्टम असल में कैसे काम करता है, और embedded हार्डवेयर पर Linux को कैसे बनाएँ, बूट करें और प्रोग्राम करें। हर लैब आपके लैपटॉप पर QEMU में चलती है; Raspberry Pi वैकल्पिक है। पहले system call से अपने kernel driver और Linux image तक।',
      chips: ['Processes और threads', 'Memory और MMU', 'Device drivers', 'Linux बूट करना', 'Real time', 'QEMU और Raspberry Pi'],
      level: 'थोड़ी C से kernel developer तक', lang: 'अभी सिर्फ़ English में', cta: 'कोर्स 4 खोलें (English)',
    },
  },
  {
    n: 5, status: 'prep', href: null, hiHref: null, art: 'static', shape: ['dodeca', 'gold'],   // 'static': no 3D scene, the drawn solid stays
    en: {
      name: 'Course 5: IBM Quantum series',
      text: 'Following the IBM Quantum Learning syllabus in order, explained in our own words, with experiments on real IBM hardware.',
      chips: ['Basics of quantum information', 'Algorithms', 'Error correction', 'Utility-scale'],
      level: 'After Courses 1 to 3', lang: 'English and Hindi', cta: null,
    },
    hi: {
      name: 'कोर्स 5: IBM Quantum सीरीज़',
      text: 'IBM Quantum Learning के सिलेबस के क्रम में, हमारी अपनी व्याख्या के साथ, और असली IBM हार्डवेयर पर प्रयोग।',
      chips: ['Basics of quantum information', 'Algorithms', 'Error correction', 'Utility-scale'],
      level: 'कोर्स 1 से 3 के बाद', lang: 'हिन्दी और English', cta: null,
    },
  },
];

export const statusText = {
  en: { open: 'Open now', started: 'Started', prep: 'In preparation' },
  hi: { open: 'अभी खुला', started: 'शुरू हो गया', prep: 'तैयार हो रहा है' },
};
