// The Great Minds page: sixteen people, in order of birth, half from India.
// Portraits are sketches drawn in code by scripts/minds-portraits.py (no photographs); art key = slug.
// For Archimedes, Aryabhata and Brahmagupta no likeness from their lifetime survives, so the drawing shows their idea.

export const habits = {
  en: [
    ['Curious about ordinary things', 'Raman asked why the sea is blue. Feynman watched a plate wobble in a cafeteria. Great questions usually start with something everyone has seen and nobody has explained.'],
    ['Prove it, don\'t just believe it', 'Archimedes found results with imagined balances, then proved each one with geometry. Turing turned the vague word "computable" into a precise machine. A guess becomes knowledge only when it is checked.'],
    ['Write everything down', 'Ramanujan\'s notebooks, Faraday\'s numbered laboratory notes, Euler\'s 800 papers. Writing is how they remembered, and how they found their own mistakes.'],
    ['Build your own tools', 'Newton built his telescope, J. C. Bose his radio detectors, Faraday his apparatus. When the tool you need does not exist, making it is part of the science.'],
    ['Keep going after setbacks', 'Euler went blind and did half his work afterwards. Ramanujan lost his scholarship. Kalam\'s first rocket fell into the sea. None of them stopped at the first failure.'],
    ['Teach and share', 'Faraday lectured to children, S. N. Bose taught science in Bengali, Feynman wrote lectures for first-year students, Kalam spent his last years in classrooms. Understanding grows when it is given away.'],
  ],
  hi: [
    ['रोज़मर्रा की चीज़ों पर जिज्ञासा', 'रमन ने पूछा कि समुद्र नीला क्यों है। फ़ाइनमैन ने कैंटीन में एक डगमगाती प्लेट देखी। बड़े सवाल अक्सर उस चीज़ से शुरू होते हैं जिसे सबने देखा है और किसी ने समझाया नहीं।'],
    ['मानो मत, सिद्ध करो', 'आर्किमिडीज़ ने कल्पना के तराज़ू से नतीजे खोजे, फिर हर एक को ज्यामिति से सिद्ध किया। ट्यूरिंग ने "computable" जैसे धुँधले शब्द को एक सटीक मशीन में बदल दिया। अंदाज़ा तभी ज्ञान बनता है जब उसे जाँचा जाए।'],
    ['सब कुछ लिखो', 'रामानुजन की नोटबुक, फ़ैराडे के क्रमांकित प्रयोगशाला नोट्स, ऑयलर के 800 शोधपत्र। लिखकर ही वे याद रखते थे, और लिखकर ही अपनी ग़लतियाँ पकड़ते थे।'],
    ['अपने औज़ार ख़ुद बनाओ', 'न्यूटन ने अपनी दूरबीन बनाई, जगदीश चंद्र बोस ने अपने रेडियो डिटेक्टर, फ़ैराडे ने अपने उपकरण। जिस औज़ार की ज़रूरत है वह न हो, तो उसे बनाना भी विज्ञान का हिस्सा है।'],
    ['ठोकर के बाद भी चलते रहो', 'ऑयलर की आँखें चली गईं और उनका आधा काम उसके बाद हुआ। रामानुजन की छात्रवृत्ति छिन गई। कलाम का पहला रॉकेट समुद्र में गिरा। इनमें से कोई पहली नाकामी पर नहीं रुका।'],
    ['सिखाओ और बाँटो', 'फ़ैराडे ने बच्चों को व्याख्यान दिए, सत्येंद्र नाथ बोस ने बांग्ला में विज्ञान पढ़ाया, फ़ाइनमैन ने पहले साल के छात्रों के लिए व्याख्यान लिखे, कलाम ने आख़िरी साल कक्षाओं में बिताए। समझ बाँटने से बढ़ती है।'],
  ],
};

export const minds = [
  {
    slug: 'archimedes', region: 'world', years: 'c. 287–212 BCE', noLikeness: true,
    en: {
      name: 'Archimedes', place: 'Syracuse, Sicily', field: 'Mathematics, physics, engineering',
      gave: 'The law of the lever, the principle of buoyancy, and a way to trap π between two numbers.',
      ideas: [
        'Find the rule underneath. He showed that a lever balances when weight times distance is the same on both sides, turning a craft into a law of nature.',
        'Squeeze the unknown between two knowns. With polygons of 96 sides drawn inside and outside a circle, he proved that π lies between 3 10/71 and 3 1/7.',
        'Discover freely, then prove strictly. He found results by imagining weights on balances, but trusted each one only after a full geometric proof.',
      ],
      copy: 'When you cannot calculate something exactly, find one number that is certainly too small and one that is certainly too big, then close the gap.',
      art: 'No portrait from his lifetime survives. The drawing shows the sphere inside a cylinder, the figure he asked to have carved on his tomb: the sphere has exactly two-thirds of the cylinder\'s volume.',
    },
    hi: {
      name: 'आर्किमिडीज़', place: 'सिराक्यूज़, सिसिली', field: 'गणित, भौतिकी, इंजीनियरिंग',
      gave: 'उत्तोलक (lever) का नियम, उत्प्लावन (buoyancy) का सिद्धांत, और π को दो संख्याओं के बीच फँसाने का तरीक़ा।',
      ideas: [
        'नीचे छिपा नियम खोजो। उन्होंने दिखाया कि lever तब संतुलित होता है जब दोनों ओर भार गुणा दूरी बराबर हो। एक हुनर को उन्होंने प्रकृति का नियम बना दिया।',
        'अज्ञात को दो ज्ञात संख्याओं के बीच दबाओ। वृत्त के अंदर और बाहर 96 भुजाओं वाले बहुभुज बनाकर उन्होंने सिद्ध किया कि π, 3 10/71 और 3 1/7 के बीच है।',
        'खुलकर खोजो, सख़्ती से सिद्ध करो। वे तराज़ू पर भार की कल्पना से नतीजे खोजते थे, पर किसी पर भरोसा तभी करते थे जब उसकी पूरी ज्यामितीय उपपत्ति हो जाए।',
      ],
      copy: 'जब किसी चीज़ की ठीक गणना न हो सके, तो एक संख्या खोजो जो पक्का छोटी है और एक जो पक्का बड़ी है, फिर दोनों के बीच का फ़ासला घटाओ।',
      art: 'उनके जीवनकाल का कोई चित्र नहीं बचा। यह चित्र बेलन के अंदर गोला दिखाता है, वह आकृति जो वे अपनी समाधि पर खुदवाना चाहते थे: गोले का आयतन बेलन का ठीक दो-तिहाई है।',
    },
  },
  {
    slug: 'aryabhata', region: 'india', years: '476–550 CE', noLikeness: true,
    en: {
      name: 'Aryabhata', place: 'Kusumapura, near today\'s Patna', field: 'Mathematics, astronomy',
      gave: 'The Aryabhatiya, written at the age of 23, with π correct to four decimal places and the idea that the Earth turns on its axis. India\'s first satellite, launched in 1975, carries his name.',
      ideas: [
        'Compress what you know. The Aryabhatiya fits arithmetic, algebra, trigonometry and astronomy into 121 verses. His π: add 4 to 100, multiply by 8, add 62,000, and you have the circumference of a circle of diameter 20,000, which gives 3.1416.',
        'Question what looks obvious. The sky seems to turn around us; he argued that the Earth rotates instead, like a passenger in a boat who sees the shore moving backwards.',
        'Explain with causes, not stories. He described eclipses as the shadows of the Earth and the Moon.',
      ],
      copy: 'When something "obviously" moves, ask what would look exactly the same if you were the one moving.',
      art: 'No likeness of Aryabhata survives; statues of him are modern imagination. The drawing shows the turning Earth and his value of π.',
    },
    hi: {
      name: 'आर्यभट', place: 'कुसुमपुर, आज के पटना के पास', field: 'गणित, खगोलशास्त्र',
      gave: '23 वर्ष की आयु में लिखा गया आर्यभटीय, जिसमें π दशमलव के चार अंकों तक सही है और यह विचार कि पृथ्वी अपनी धुरी पर घूमती है। 1975 में छोड़ा गया भारत का पहला उपग्रह उन्हीं के नाम पर है।',
      ideas: [
        'जो जानते हो, उसे सघन करो। आर्यभटीय अंकगणित, बीजगणित, त्रिकोणमिति और खगोलशास्त्र को 121 श्लोकों में समेटता है। उनका π: 100 में 4 जोड़ो, 8 से गुणा करो, 62,000 जोड़ो; यह 20,000 व्यास वाले वृत्त की परिधि है, यानी 3.1416।',
        'जो स्पष्ट दिखे, उस पर सवाल करो। आकाश हमारे चारों ओर घूमता दिखता है; उन्होंने तर्क दिया कि असल में पृथ्वी घूमती है, जैसे नाव में बैठे यात्री को किनारा पीछे जाता दिखता है।',
        'कारण से समझाओ, कहानी से नहीं। उन्होंने ग्रहण को पृथ्वी और चंद्रमा की छाया से समझाया।',
      ],
      copy: 'जब कोई चीज़ "साफ़-साफ़" चलती दिखे, तो पूछो: अगर चलने वाले तुम होते, तो क्या ठीक यही दिखता?',
      art: 'आर्यभट का कोई चित्र नहीं बचा; उनकी मूर्तियाँ आधुनिक कल्पना हैं। यह चित्र घूमती पृथ्वी और उनका π दिखाता है।',
    },
  },
  {
    slug: 'brahmagupta', region: 'india', years: '598–c. 668 CE', noLikeness: true,
    en: {
      name: 'Brahmagupta', place: 'Bhillamala (Bhinmal), in today\'s Rajasthan', field: 'Mathematics, astronomy',
      gave: 'The first written rules for calculating with zero and with negative numbers, in the Brahmasphutasiddhanta of 628 CE. A mathematician from Rajasthan who changed arithmetic for the whole world.',
      ideas: [
        'Treat a new idea as a number like any other. He wrote rules for zero: a number minus itself is zero, and adding zero changes nothing. He also wrote 0 ÷ 0 = 0, which later mathematicians rejected. The first map of new land always has errors.',
        'Give abstract ideas a meaning. He called positive numbers "fortunes" and negative numbers "debts": a debt times a debt is a fortune.',
        'Attack the hard general case. He found a way to build new solutions of equations like Nx² + 1 = y² from old ones, a problem European mathematicians took up a thousand years later.',
      ],
      copy: 'When a new kind of object appears (zero, negative numbers, complex numbers, qubits), write its rules down one by one and test each on examples.',
      art: 'No likeness of Brahmagupta survives. The drawing shows zero and the number line he made complete.',
    },
    hi: {
      name: 'ब्रह्मगुप्त', place: 'भिल्लमाल (भीनमाल), आज के राजस्थान में', field: 'गणित, खगोलशास्त्र',
      gave: '628 ईस्वी के ब्राह्मस्फुटसिद्धांत में शून्य और ऋणात्मक संख्याओं से गणना के पहले लिखित नियम। राजस्थान के एक गणितज्ञ, जिन्होंने पूरी दुनिया का अंकगणित बदल दिया।',
      ideas: [
        'नए विचार को भी बाक़ी संख्याओं जैसा मानो। उन्होंने शून्य के नियम लिखे: कोई संख्या घटा वही संख्या शून्य है, और शून्य जोड़ने से कुछ नहीं बदलता। उन्होंने 0 ÷ 0 = 0 भी लिखा, जिसे बाद के गणितज्ञों ने नहीं माना। नई ज़मीन के पहले नक्शे में ग़लतियाँ होती ही हैं।',
        'अमूर्त विचारों को अर्थ दो। उन्होंने धनात्मक संख्याओं को "धन" और ऋणात्मक को "ऋण" कहा: ऋण गुणा ऋण, धन होता है।',
        'कठिन सामान्य सवाल से भिड़ो। उन्होंने Nx² + 1 = y² जैसे समीकरणों के पुराने हलों से नए हल बनाने का तरीक़ा खोजा, जिस पर यूरोप के गणितज्ञ हज़ार साल बाद पहुँचे।',
      ],
      copy: 'जब कोई नई तरह की चीज़ सामने आए (शून्य, ऋणात्मक संख्याएँ, complex numbers, qubits), तो उसके नियम एक-एक करके लिखो और हर नियम को उदाहरणों पर जाँचो।',
      art: 'ब्रह्मगुप्त का कोई चित्र नहीं बचा। यह चित्र शून्य और वह संख्या-रेखा दिखाता है जिसे उन्होंने पूरा किया।',
    },
  },
  {
    slug: 'newton', region: 'world', years: '1643–1727',
    en: {
      name: 'Isaac Newton', place: 'Woolsthorpe, England', field: 'Physics, mathematics',
      gave: 'The laws of motion, universal gravitation and calculus, and the proof that white light is a mixture of colours.',
      ideas: [
        'Stay with one problem. He was known for keeping a single question in mind for days and weeks until it gave way.',
        'One law for the sky and the ground. The force that pulls an apple down is the same force that holds the Moon in its orbit.',
        'Build the tool you need. He invented calculus to handle quantities that change, and built the first working reflecting telescope with his own hands.',
      ],
      copy: 'Use time alone well. With his university closed by plague in 1665 and 1666, Newton worked at home and laid the foundations of calculus, gravity and his theory of light.',
    },
    hi: {
      name: 'आइज़क न्यूटन', place: 'वूल्सथॉर्प, इंग्लैंड', field: 'भौतिकी, गणित',
      gave: 'गति के नियम, सार्वत्रिक गुरुत्वाकर्षण और कैलकुलस, और यह प्रमाण कि सफ़ेद रोशनी रंगों का मिश्रण है।',
      ideas: [
        'एक सवाल के साथ टिके रहो। वे एक ही सवाल को दिनों और हफ़्तों तक मन में रखते थे, जब तक वह खुल न जाए।',
        'आकाश और धरती के लिए एक ही नियम। जो बल सेब को नीचे खींचता है, वही चंद्रमा को उसकी कक्षा में रखता है।',
        'जो औज़ार चाहिए, वह बनाओ। बदलती मात्राओं को सँभालने के लिए उन्होंने कैलकुलस बनाया, और पहली कामयाब परावर्तक दूरबीन अपने हाथों से बनाई।',
      ],
      copy: 'अकेले समय का अच्छा इस्तेमाल करो। 1665 और 1666 में प्लेग से विश्वविद्यालय बंद होने पर न्यूटन ने घर पर काम किया और कैलकुलस, गुरुत्वाकर्षण और प्रकाश के अपने सिद्धांत की नींव रखी।',
    },
  },
  {
    slug: 'euler', region: 'world', years: '1707–1783', link: ['/mathematics/complex-numbers-1/', 'Course 2: complex numbers', 'कोर्स 2: complex numbers'],
    en: {
      name: 'Leonhard Euler', place: 'Basel, Switzerland', field: 'Mathematics, physics',
      gave: 'Much of the notation we write today, such as f(x), e, i and Σ; the formula e^(iθ) = cos θ + i sin θ that joins complex numbers to rotations; and the first theorem of graph theory.',
      ideas: [
        'Write, and keep writing. He produced more than 800 papers and books, more than any mathematician before or since.',
        'Keep going when it gets hard. He lost the sight of one eye in his thirties and was almost completely blind from 1771, yet about half of his work came in his last two decades, worked out in his head and dictated.',
        'Turn a puzzle into a theory. Could anyone walk across the seven bridges of Königsberg exactly once each? His answer, in 1736, started graph theory.',
      ],
      copy: 'Practise calculating in your head. Euler carried long computations mentally; the skill is built one small calculation at a time.',
    },
    hi: {
      name: 'लियोनार्ड ऑयलर', place: 'बासेल, स्विट्ज़रलैंड', field: 'गणित, भौतिकी',
      gave: 'आज हम जो चिह्न लिखते हैं उनमें से बहुत से, जैसे f(x), e, i और Σ; सूत्र e^(iθ) = cos θ + i sin θ, जो complex numbers को घुमाव से जोड़ता है; और graph theory का पहला प्रमेय।',
      ideas: [
        'लिखो, और लिखते रहो। उन्होंने 800 से ज़्यादा शोधपत्र और किताबें लिखीं, किसी भी दूसरे गणितज्ञ से ज़्यादा।',
        'मुश्किल में भी चलते रहो। तीस की उम्र के आसपास उनकी एक आँख की रोशनी गई और 1771 से वे लगभग पूरी तरह दृष्टिहीन थे, फिर भी उनका लगभग आधा काम आख़िरी दो दशकों में हुआ, दिमाग़ में हल करके बोलकर लिखवाया हुआ।',
        'पहेली को सिद्धांत बनाओ। क्या कोई कोनिग्सबर्ग के सातों पुल ठीक एक-एक बार पार कर सकता है? 1736 में उनके जवाब से graph theory शुरू हुई।',
      ],
      copy: 'मन में गणना का अभ्यास करो। ऑयलर लंबी गणनाएँ दिमाग़ में कर लेते थे; यह हुनर एक-एक छोटी गणना से बनता है।',
    },
  },
  {
    slug: 'faraday', region: 'world', years: '1791–1867',
    en: {
      name: 'Michael Faraday', place: 'London, England', field: 'Physics, chemistry',
      gave: 'Electromagnetic induction (1831), the principle behind every generator and transformer, and the idea of fields: lines of force filling space.',
      ideas: [
        'No degree is needed to begin. A bookbinder\'s apprentice, he read the science books he bound, attended Humphry Davy\'s lectures, sent Davy his notes, and became his assistant.',
        'Let experiments lead. With very little mathematics, he discovered induction, the laws of electrolysis and the effect of magnetism on light, and pictured them as lines of force. James Clerk Maxwell later turned those pictures into equations.',
        'Share it with the young. He gave the Royal Institution\'s Christmas Lectures for children many times; his Chemical History of a Candle is still read today.',
      ],
      copy: 'Keep a lab notebook. Faraday numbered every paragraph of his notes, thousands of them; writing down what you tried is how you learn from it.',
    },
    hi: {
      name: 'माइकल फ़ैराडे', place: 'लंदन, इंग्लैंड', field: 'भौतिकी, रसायन',
      gave: 'विद्युत-चुंबकीय प्रेरण (1831), जो हर जनरेटर और ट्रांसफ़ॉर्मर का आधार है, और field का विचार: अंतरिक्ष में फैली बल-रेखाएँ।',
      ideas: [
        'शुरू करने के लिए डिग्री ज़रूरी नहीं। जिल्दसाज़ के शागिर्द के रूप में वे उन्हीं विज्ञान की किताबों को पढ़ते थे जिनकी जिल्द बाँधते थे, हम्फ़्री डेवी के व्याख्यान सुने, डेवी को अपने नोट्स भेजे, और उनके सहायक बन गए।',
        'प्रयोग को आगे चलने दो। बहुत कम गणित के साथ उन्होंने प्रेरण, विद्युत-अपघटन के नियम और प्रकाश पर चुंबकत्व का असर खोजा, और उन्हें बल-रेखाओं के चित्रों में सोचा। बाद में जेम्स क्लर्क मैक्सवेल ने इन चित्रों को समीकरणों में बदला।',
        'युवाओं के साथ बाँटो। उन्होंने रॉयल इंस्टीट्यूशन में बच्चों के लिए कई बार क्रिसमस व्याख्यान दिए; उनकी किताब The Chemical History of a Candle आज भी पढ़ी जाती है।',
      ],
      copy: 'प्रयोगशाला नोटबुक रखो। फ़ैराडे अपने नोट्स के हर अनुच्छेद पर क्रमांक लिखते थे, हज़ारों अनुच्छेद; जो आज़माया उसे लिखना ही उससे सीखने का तरीक़ा है।',
    },
  },
  {
    slug: 'jc-bose', region: 'india', years: '1858–1937', link: ['/posts/superconducting-qubits-and-control-electronics/', 'Course 1: qubits and control electronics', 'कोर्स 1: qubits और control electronics'],
    en: {
      name: 'Jagadish Chandra Bose', place: 'Born in Mymensingh, worked in Kolkata', field: 'Physics, radio science, biology',
      gave: 'Pioneering experiments with millimetre-wave radio in the 1890s, among the first semiconductor detectors, and instruments that recorded the tiny responses of plants. Microwave signals, a little lower in frequency, are how many quantum computers control their qubits today.',
      ideas: [
        'Build your own instruments. With little money at Presidency College, Calcutta, he made his own transmitters, receivers and detectors.',
        'Share knowledge openly. He preferred to publish rather than patent; his one US patent, for a crystal detector (1904), was filed at friends\' urging.',
        'Cross the borders between subjects. He moved from radio physics to plant physiology and built the crescograph to measure how plants grow, minute by minute.',
      ],
      copy: 'Make an instrument from what you have. A simple sensor you built with your own hands teaches more than ten diagrams.',
    },
    hi: {
      name: 'जगदीश चंद्र बोस', place: 'जन्म मैमनसिंह में, काम कोलकाता में', field: 'भौतिकी, रेडियो विज्ञान, जीवविज्ञान',
      gave: '1890 के दशक में मिलीमीटर-तरंग रेडियो के अग्रणी प्रयोग, शुरुआती semiconductor डिटेक्टरों में से एक, और पौधों की सूक्ष्म प्रतिक्रियाएँ दर्ज करने वाले उपकरण। इनसे थोड़ी कम frequency के microwave signals से आज कई quantum computer अपने qubits को नियंत्रित करते हैं।',
      ideas: [
        'अपने उपकरण ख़ुद बनाओ। कलकत्ता के प्रेसिडेंसी कॉलेज में कम पैसों में उन्होंने अपने ट्रांसमीटर, रिसीवर और डिटेक्टर बनाए।',
        'ज्ञान खुलकर बाँटो। वे पेटेंट से ज़्यादा प्रकाशित करना पसंद करते थे; crystal detector पर उनका इकलौता अमेरिकी पेटेंट (1904) दोस्तों के ज़ोर देने पर लिया गया।',
        'विषयों की सीमाएँ लाँघो। वे रेडियो भौतिकी से पादप शरीर-क्रिया विज्ञान तक गए और पौधों की मिनट-दर-मिनट बढ़त मापने के लिए crescograph बनाया।',
      ],
      copy: 'जो पास है उससे उपकरण बनाओ। अपने हाथों से बना एक साधारण sensor दस चित्रों से ज़्यादा सिखाता है।',
    },
  },
  {
    slug: 'curie', region: 'world', years: '1867–1934',
    en: {
      name: 'Marie Curie', place: 'Born in Warsaw, worked in Paris', field: 'Physics, chemistry',
      gave: 'The study of radioactivity and the discovery of polonium and radium. The first person to win two Nobel Prizes, and still the only one in two different sciences: Physics in 1903 and Chemistry in 1911.',
      ideas: [
        'Learn even when the door is closed. Women could not attend university in Russian-ruled Warsaw, so she studied at the secret "Flying University" and saved for years to study in Paris.',
        'Trust a careful measurement. A uranium ore was more radioactive than its uranium could explain; instead of doubting the number, she concluded that the ore held unknown elements, and found them.',
        'Put science to work. During the First World War she equipped mobile X-ray units and trained the people who ran them, so surgeons could find bullets and broken bones.',
      ],
      copy: 'When a measurement disagrees with what you expected, check it and repeat it. If it holds, follow it: that is where discoveries hide.',
    },
    hi: {
      name: 'मैरी क्यूरी', place: 'जन्म वारसॉ में, काम पेरिस में', field: 'भौतिकी, रसायन',
      gave: 'रेडियोधर्मिता का अध्ययन और पोलोनियम व रेडियम की खोज। दो नोबेल पुरस्कार जीतने वाली पहली व्यक्ति, और आज भी दो अलग विज्ञानों में जीतने वाली अकेली: 1903 में भौतिकी और 1911 में रसायन।',
      ideas: [
        'दरवाज़ा बंद हो तब भी सीखो। रूस के शासन वाले वारसॉ में महिलाएँ विश्वविद्यालय नहीं जा सकती थीं, इसलिए वे गुप्त "फ़्लाइंग यूनिवर्सिटी" में पढ़ीं और पेरिस में पढ़ने के लिए सालों पैसे जोड़े।',
        'सावधानी से किए माप पर भरोसा करो। यूरेनियम का एक अयस्क उसमें मौजूद यूरेनियम से ज़्यादा रेडियोधर्मी था; संख्या पर शक करने की बजाय उन्होंने निष्कर्ष निकाला कि अयस्क में अज्ञात तत्व हैं, और उन्हें खोज निकाला।',
        'विज्ञान को काम में लगाओ। पहले विश्व युद्ध में उन्होंने चलती-फिरती X-ray इकाइयाँ तैयार कीं और उन्हें चलाने वालों को प्रशिक्षित किया, ताकि सर्जन गोलियाँ और टूटी हड्डियाँ ढूँढ सकें।',
      ],
      copy: 'जब कोई माप उम्मीद से मेल न खाए, तो उसे जाँचो और दोहराओ। अगर वह टिका रहे, तो उसके पीछे चलो: खोजें वहीं छिपी होती हैं।',
    },
  },
  {
    slug: 'einstein', region: 'world', years: '1879–1955', link: ['/posts/entanglement-and-bell-states/', 'Course 1: entanglement', 'कोर्स 1: entanglement'],
    en: {
      name: 'Albert Einstein', place: 'Born in Ulm, Germany', field: 'Physics',
      gave: 'Light quanta (photons), special and general relativity, and E = mc². In 1905, while working full-time as a patent clerk, he published four papers that changed physics. His 1921 Nobel Prize was for the photoelectric effect.',
      ideas: [
        'Think in pictures. At 16 he imagined chasing a beam of light. Thought experiments like that one led him to relativity.',
        'Question what everyone assumes. He asked what "at the same time" really means, and found that whether two events are simultaneous depends on who is watching.',
        'Doubt usefully. He never accepted that quantum mechanics was complete. His 1935 paper with Podolsky and Rosen pointed straight at entanglement, the very resource quantum computers now use.',
      ],
      copy: 'Before you solve, picture it: draw the situation, imagine yourself inside it, and ask what you would actually see.',
    },
    hi: {
      name: 'अल्बर्ट आइंस्टाइन', place: 'जन्म उल्म, जर्मनी में', field: 'भौतिकी',
      gave: 'प्रकाश के क्वांटा (फ़ोटॉन), विशेष और सामान्य सापेक्षता, और E = mc²। 1905 में, पेटेंट क्लर्क की पूरी नौकरी करते हुए, उन्होंने चार शोधपत्र प्रकाशित किए जिन्होंने भौतिकी बदल दी। उनका 1921 का नोबेल पुरस्कार प्रकाश-विद्युत प्रभाव के लिए था।',
      ideas: [
        'चित्रों में सोचो। 16 साल की उम्र में उन्होंने रोशनी की किरण का पीछा करने की कल्पना की। ऐसे विचार-प्रयोग उन्हें सापेक्षता तक ले गए।',
        'जो सब मान लेते हैं, उस पर सवाल करो। उन्होंने पूछा कि "एक ही समय पर" का असल अर्थ क्या है, और पाया कि दो घटनाएँ एक साथ हैं या नहीं, यह देखने वाले पर निर्भर करता है।',
        'उपयोगी शक करो। उन्होंने कभी नहीं माना कि quantum mechanics पूरी है। पोडोल्स्की और रोज़ेन के साथ उनका 1935 का शोधपत्र सीधे entanglement की ओर इशारा करता था, वही संसाधन जिसे आज quantum computer इस्तेमाल करते हैं।',
      ],
      copy: 'हल करने से पहले कल्पना करो: स्थिति का चित्र बनाओ, ख़ुद को उसके अंदर सोचो, और पूछो कि तुम्हें असल में क्या दिखेगा।',
    },
  },
  {
    slug: 'ramanujan', region: 'india', years: '1887–1920',
    en: {
      name: 'Srinivasa Ramanujan', place: 'Erode and Kumbakonam, Tamil Nadu', field: 'Mathematics',
      gave: 'Nearly 3,900 results on infinite series, partitions, continued fractions and more, many still being proved and used a century later. His series for π are among the fastest ever found.',
      ideas: [
        'Go deep where your love is, but know the cost. He loved mathematics so much that he neglected other subjects, failed his college exams and lost his scholarship. Marks did not measure his mind, yet for years he struggled to find work.',
        'Write your results down. He filled notebooks with formulas, often without proofs; mathematicians are still proving them today.',
        'Reach out. In 1913, a clerk at the Madras Port Trust, he wrote to G. H. Hardy at Cambridge with pages of theorems. Hardy saw a genius and brought him to Cambridge, where he became a Fellow of the Royal Society at 30.',
      ],
      copy: 'Collect patterns. Compute small cases by hand, notice what repeats, write down a guess, then try to prove it. Ramanujan knew numbers like friends: 1729 = 1³ + 12³ = 9³ + 10³.',
    },
    hi: {
      name: 'श्रीनिवास रामानुजन', place: 'ईरोड और कुंभकोणम, तमिलनाडु', field: 'गणित',
      gave: 'अनंत श्रेणियों, partitions, सतत भिन्नों और बहुत कुछ पर लगभग 3,900 नतीजे, जिनमें से कई सौ साल बाद भी सिद्ध और इस्तेमाल किए जा रहे हैं। π के लिए उनकी श्रेणियाँ अब तक मिली सबसे तेज़ श्रेणियों में हैं।',
      ideas: [
        'जहाँ लगन हो, वहाँ गहरे उतरो, पर क़ीमत भी जानो। गणित से उन्हें इतना प्रेम था कि दूसरे विषय छूट गए, वे कॉलेज की परीक्षाओं में फ़ेल हुए और छात्रवृत्ति छिन गई। अंक उनकी प्रतिभा को नहीं माप सके, फिर भी सालों तक उन्हें काम ढूँढने में संघर्ष करना पड़ा।',
        'अपने नतीजे लिखो। उन्होंने नोटबुकें सूत्रों से भर दीं, अक्सर बिना उपपत्ति के; गणितज्ञ आज भी उन्हें सिद्ध कर रहे हैं।',
        'संपर्क करो। 1913 में, मद्रास पोर्ट ट्रस्ट में क्लर्क रहते हुए, उन्होंने कैम्ब्रिज के जी. एच. हार्डी को प्रमेयों से भरे पन्ने भेजे। हार्डी ने प्रतिभा पहचानी और उन्हें कैम्ब्रिज बुलाया, जहाँ 30 वर्ष की आयु में वे रॉयल सोसाइटी के फ़ेलो बने।',
      ],
      copy: 'पैटर्न जमा करो। छोटे उदाहरण हाथ से निकालो, देखो क्या दोहराता है, एक अनुमान लिखो, फिर उसे सिद्ध करने की कोशिश करो। रामानुजन संख्याओं को दोस्तों की तरह जानते थे: 1729 = 1³ + 12³ = 9³ + 10³।',
    },
  },
  {
    slug: 'raman', region: 'india', years: '1888–1970',
    en: {
      name: 'C. V. Raman', place: 'Tiruchirappalli, Tamil Nadu', field: 'Physics',
      gave: 'The Raman effect (1928): light scattered by molecules changes colour very slightly, and the change identifies the molecule. The first Nobel Prize in a science for an Asian (1930). India celebrates 28 February, the day of the discovery, as National Science Day.',
      ideas: [
        'Do research around a job. For ten years he worked as an officer in the Indian Finance Department and did experiments in the mornings and evenings at the Indian Association for the Cultivation of Science in Calcutta.',
        'Ask why about ordinary things. On a voyage to Europe in 1921 he asked why the sea is blue, and argued that it is not only the reflected sky but light scattered by the water itself.',
        'World-class work can be done at home. He made his discoveries in India, with modest apparatus, and built institutions to keep that possible.',
      ],
      copy: 'Pick one everyday thing you do not really understand (why the sky is blue, why ice floats) and chase the explanation all the way to the bottom.',
    },
    hi: {
      name: 'सी. वी. रमन', place: 'तिरुचिरापल्ली, तमिलनाडु', field: 'भौतिकी',
      gave: 'रमन प्रभाव (1928): अणुओं से बिखरी रोशनी का रंग बहुत थोड़ा बदल जाता है, और यह बदलाव अणु की पहचान बताता है। किसी विज्ञान में किसी एशियाई को मिला पहला नोबेल पुरस्कार (1930)। भारत खोज के दिन, 28 फ़रवरी, को राष्ट्रीय विज्ञान दिवस के रूप में मनाता है।',
      ideas: [
        'नौकरी के साथ शोध करो। दस साल तक वे भारतीय वित्त विभाग में अधिकारी रहे और सुबह-शाम कलकत्ता के Indian Association for the Cultivation of Science में प्रयोग करते रहे।',
        'रोज़मर्रा की चीज़ों से "क्यों" पूछो। 1921 में यूरोप की समुद्री यात्रा पर उन्होंने पूछा कि समुद्र नीला क्यों है, और तर्क दिया कि यह सिर्फ़ आकाश का प्रतिबिंब नहीं, पानी से ख़ुद बिखरी रोशनी है।',
        'विश्व-स्तर का काम अपने देश में हो सकता है। उन्होंने अपनी खोजें भारत में, साधारण उपकरणों से कीं, और इसे संभव बनाए रखने के लिए संस्थान बनाए।',
      ],
      copy: 'कोई एक रोज़मर्रा की चीज़ चुनो जिसे तुम सच में नहीं समझते (आकाश नीला क्यों है, बर्फ़ तैरती क्यों है) और उसके कारण का पीछा तह तक करो।',
    },
  },
  {
    slug: 'sn-bose', region: 'india', years: '1894–1974',
    en: {
      name: 'Satyendra Nath Bose', place: 'Kolkata', field: 'Physics',
      gave: 'A new way of counting particles of light (1924) that became Bose–Einstein statistics. Every particle of that kind is called a boson, after him. The Bose–Einstein condensate it predicted was first made in a laboratory in 1995.',
      ideas: [
        'Trust a clean argument. He derived Planck\'s law by treating light quanta as truly identical, something no one had done. He sent the paper straight to Einstein, who translated it into German and had it published.',
        'Learn languages to learn science. He learned German and French to read research, and with Meghnad Saha translated Einstein\'s relativity papers into English.',
        'Science belongs in every language. He founded a society to teach and write science in Bengali, so that students could learn it in their own tongue.',
      ],
      copy: 'Read the original. When you can, read the paper or book where an idea was first written, not only the summary of a summary.',
    },
    hi: {
      name: 'सत्येंद्र नाथ बोस', place: 'कोलकाता', field: 'भौतिकी',
      gave: 'प्रकाश के कणों को गिनने का एक नया तरीक़ा (1924), जो बोस-आइंस्टाइन सांख्यिकी बना। इस तरह के हर कण को उन्हीं के नाम पर boson कहा जाता है। इससे जिस बोस-आइंस्टाइन संघनन की भविष्यवाणी हुई, वह पहली बार 1995 में प्रयोगशाला में बना।',
      ideas: [
        'साफ़ तर्क पर भरोसा करो। उन्होंने प्रकाश के क्वांटा को पूरी तरह एक जैसा मानकर प्लैंक का नियम निकाला, जो किसी ने नहीं किया था। उन्होंने शोधपत्र सीधे आइंस्टाइन को भेजा, जिन्होंने उसका जर्मन में अनुवाद करके उसे प्रकाशित करवाया।',
        'विज्ञान सीखने के लिए भाषाएँ सीखो। शोध पढ़ने के लिए उन्होंने जर्मन और फ़्रेंच सीखी, और मेघनाद साहा के साथ आइंस्टाइन के सापेक्षता शोधपत्रों का अंग्रेज़ी में अनुवाद किया।',
        'विज्ञान हर भाषा का है। उन्होंने बांग्ला में विज्ञान पढ़ाने और लिखने के लिए एक संस्था बनाई, ताकि छात्र उसे अपनी भाषा में सीख सकें।',
      ],
      copy: 'मूल पढ़ो। जब हो सके, वह शोधपत्र या किताब पढ़ो जिसमें विचार पहली बार लिखा गया, सिर्फ़ सारांश का सारांश नहीं।',
    },
  },
  {
    slug: 'bhabha', region: 'india', years: '1909–1966',
    en: {
      name: 'Homi J. Bhabha', place: 'Mumbai', field: 'Physics, building institutions',
      gave: 'Theories of how electrons and positrons scatter (Bhabha scattering) and of cosmic-ray showers; and the places where Indian physics grew: the Tata Institute of Fundamental Research (1945) and the atomic research centre at Trombay, now BARC.',
      ideas: [
        'Build institutions, not only theories. He came home in 1939 and spent his life building places where Indian scientists could do world-class work without leaving India.',
        'Plan in decades. He laid out a three-stage nuclear power programme designed around India\'s large reserves of thorium.',
        'Keep art in your life. He was a fine painter and a lover of music, and saw no wall between art and science.',
      ],
      copy: 'Think about what you can build that will outlast you: a study group, a club, a set of notes others can use after you.',
    },
    hi: {
      name: 'होमी जहाँगीर भाभा', place: 'मुंबई', field: 'भौतिकी, संस्था-निर्माण',
      gave: 'इलेक्ट्रॉन और पॉज़िट्रॉन के प्रकीर्णन (भाभा प्रकीर्णन) और कॉस्मिक-किरण बौछारों के सिद्धांत; और वे जगहें जहाँ भारतीय भौतिकी पनपी: टाटा इंस्टीट्यूट ऑफ़ फ़ंडामेंटल रिसर्च (1945) और ट्रॉम्बे का परमाणु अनुसंधान केंद्र, जो अब BARC है।',
      ideas: [
        'सिर्फ़ सिद्धांत नहीं, संस्थाएँ बनाओ। वे 1939 में भारत लौटे और जीवन भर ऐसी जगहें बनाते रहे जहाँ भारतीय वैज्ञानिक देश छोड़े बिना विश्व-स्तर का काम कर सकें।',
        'दशकों में योजना बनाओ। उन्होंने भारत के थोरियम के बड़े भंडार को ध्यान में रखकर तीन-चरणीय परमाणु ऊर्जा कार्यक्रम तैयार किया।',
        'जीवन में कला रखो। वे अच्छे चित्रकार और संगीत-प्रेमी थे, और कला और विज्ञान के बीच कोई दीवार नहीं देखते थे।',
      ],
      copy: 'सोचो कि तुम क्या बना सकते हो जो तुम्हारे बाद भी रहे: एक study group, एक क्लब, नोट्स का एक संग्रह जिसे दूसरे इस्तेमाल कर सकें।',
    },
  },
  {
    slug: 'turing', region: 'world', years: '1912–1954', link: ['/programming/', 'Course 3: C and Python', 'कोर्स 3: C और Python'],
    en: {
      name: 'Alan Turing', place: 'London, England', field: 'Mathematics, computing',
      gave: 'The Turing machine (1936), a precise definition of what it means to compute, and the proof that some problems no computer can ever solve. Codebreaking work in the Second World War, and the question "Can machines think?" (1950).',
      ideas: [
        'Define the idea exactly. "Computable" was a vague word until he described a simple machine that reads and writes symbols on a tape, and argued that it captures every possible computation.',
        'Find the limits. He proved that no program can decide, for every program, whether it will eventually stop: the halting problem.',
        'Take theory into the real world. He helped design the machines that broke Enigma messages at Bletchley Park, and one of the first designs for a stored-program computer.',
      ],
      copy: 'When a word feels vague (fast, random, intelligent), try to define it so exactly that a machine could test it.',
    },
    hi: {
      name: 'एलन ट्यूरिंग', place: 'लंदन, इंग्लैंड', field: 'गणित, कंप्यूटिंग',
      gave: 'ट्यूरिंग मशीन (1936), गणना करने का सटीक अर्थ, और यह प्रमाण कि कुछ सवाल कोई कंप्यूटर कभी हल नहीं कर सकता। दूसरे विश्व युद्ध में कूट-संदेश तोड़ने का काम, और सवाल "क्या मशीनें सोच सकती हैं?" (1950)।',
      ideas: [
        'विचार को ठीक-ठीक परिभाषित करो। "Computable" एक धुँधला शब्द था, जब तक उन्होंने टेप पर चिह्न पढ़ने और लिखने वाली एक साधारण मशीन का वर्णन नहीं किया और तर्क नहीं दिया कि वह हर संभव गणना को पकड़ लेती है।',
        'सीमाएँ खोजो। उन्होंने सिद्ध किया कि कोई प्रोग्राम हर प्रोग्राम के बारे में यह तय नहीं कर सकता कि वह कभी रुकेगा या नहीं: halting problem।',
        'सिद्धांत को असली दुनिया में ले जाओ। उन्होंने ब्लेचली पार्क में Enigma संदेश तोड़ने वाली मशीनें बनाने में मदद की, और stored-program कंप्यूटर के शुरुआती डिज़ाइनों में से एक बनाया।',
      ],
      copy: 'जब कोई शब्द धुँधला लगे (तेज़, random, बुद्धिमान), तो उसे इतना सटीक परिभाषित करने की कोशिश करो कि एक मशीन उसे जाँच सके।',
    },
  },
  {
    slug: 'feynman', region: 'world', years: '1918–1988', link: ['/posts/simulating-quantum-systems/', 'Course 1: simulating quantum systems', 'कोर्स 1: quantum systems का simulation'],
    en: {
      name: 'Richard Feynman', place: 'New York, USA', field: 'Physics',
      gave: 'Quantum electrodynamics and Feynman diagrams (Nobel Prize 1965), the Feynman Lectures on Physics, and in 1981 the idea that a computer built from quantum parts could simulate nature where ordinary computers cannot.',
      ideas: [
        'Understand by rebuilding. On his blackboard when he died were the words: "What I cannot create, I do not understand."',
        'Explain it to a first-year student. When he could not make an idea clear to beginners, he took it as a sign that physicists did not really understand it yet.',
        'Play is serious. He learned drumming, drawing and lock-picking for fun, and a wobbling plate tossed in the Cornell cafeteria led him back to the work that won his Nobel Prize.',
      ],
      copy: 'Test your understanding: explain today\'s topic on one page for a younger student. Wherever you get stuck is what to study next.',
    },
    hi: {
      name: 'रिचर्ड फ़ाइनमैन', place: 'न्यूयॉर्क, अमेरिका', field: 'भौतिकी',
      gave: 'Quantum electrodynamics और फ़ाइनमैन आरेख (नोबेल पुरस्कार 1965), Feynman Lectures on Physics, और 1981 में यह विचार कि quantum पुर्ज़ों से बना कंप्यूटर प्रकृति का वह simulation कर सकता है जो साधारण कंप्यूटर नहीं कर सकते।',
      ideas: [
        'दोबारा बनाकर समझो। उनकी मृत्यु के समय उनके ब्लैकबोर्ड पर लिखा था: "What I cannot create, I do not understand", यानी जो मैं बना नहीं सकता, उसे मैं समझता नहीं।',
        'पहले साल के छात्र को समझाओ। जब वे कोई विचार शुरुआती छात्रों को साफ़ नहीं समझा पाते, तो इसे संकेत मानते थे कि भौतिकविद उसे अभी सच में नहीं समझते।',
        'खेल भी गंभीर है। उन्होंने मज़े के लिए ढोल बजाना, चित्र बनाना और ताले खोलना सीखा, और कॉर्नेल की कैंटीन में उछाली गई एक डगमगाती प्लेट उन्हें उस काम तक वापस ले गई जिसके लिए नोबेल मिला।',
      ],
      copy: 'अपनी समझ जाँचो: आज का विषय एक छोटे छात्र के लिए एक पन्ने पर समझाओ। जहाँ अटको, वही अगला पढ़ने का विषय है।',
    },
  },
  {
    slug: 'kalam', region: 'india', years: '1931–2015',
    en: {
      name: 'A. P. J. Abdul Kalam', place: 'Rameswaram, Tamil Nadu', field: 'Aerospace engineering',
      gave: 'Project director of SLV-3, India\'s first satellite launch vehicle, which put the Rohini satellite into orbit in 1980; leader of India\'s guided missile programme; President of India from 2002 to 2007; and a teacher to millions of students.',
      ideas: [
        'Start from where you are. As a boy in Rameswaram he delivered newspapers to help his family, and studied by lamplight.',
        'Own the failure, share the success. When the first SLV-3 flight failed in 1979, his chief Satish Dhawan faced the press himself. When the 1980 flight succeeded, Dhawan sent Kalam to announce it. Kalam carried that lesson in leadership all his life.',
        'Dream, then work. He asked students to dream big and to back the dream with years of disciplined work. He spent his last years in classrooms, and died while giving a lecture to students in Shillong.',
      ],
      copy: 'Write down one goal for ten years from now, and one thing you will do this week that moves you towards it.',
    },
    hi: {
      name: 'ए. पी. जे. अब्दुल कलाम', place: 'रामेश्वरम, तमिलनाडु', field: 'एयरोस्पेस इंजीनियरिंग',
      gave: 'भारत के पहले उपग्रह प्रक्षेपण यान SLV-3 के परियोजना निदेशक, जिसने 1980 में रोहिणी उपग्रह को कक्षा में पहुँचाया; भारत के निर्देशित प्रक्षेपास्त्र कार्यक्रम के प्रमुख; 2002 से 2007 तक भारत के राष्ट्रपति; और लाखों छात्रों के शिक्षक।',
      ideas: [
        'जहाँ हो, वहीं से शुरू करो। रामेश्वरम में बचपन में वे परिवार की मदद के लिए अख़बार बाँटते थे, और लालटेन की रोशनी में पढ़ते थे।',
        'नाकामी अपने सिर लो, कामयाबी बाँटो। 1979 में SLV-3 की पहली उड़ान विफल हुई तो उनके प्रमुख सतीश धवन ने ख़ुद प्रेस का सामना किया। 1980 की उड़ान सफल हुई तो धवन ने घोषणा के लिए कलाम को भेजा। नेतृत्व का यह सबक कलाम जीवन भर साथ रखे रहे।',
        'सपना देखो, फिर मेहनत करो। वे छात्रों से बड़े सपने देखने और उन्हें सालों की अनुशासित मेहनत से पूरा करने को कहते थे। उन्होंने आख़िरी साल कक्षाओं में बिताए, और शिलांग में छात्रों को व्याख्यान देते हुए उनका निधन हुआ।',
      ],
      copy: 'दस साल बाद का एक लक्ष्य लिखो, और इस हफ़्ते की एक चीज़ जो तुम्हें उसकी ओर ले जाए।',
    },
  },
];
