// UI text in English and Hindi. Lesson content lives in the Markdown files.
export const t = {
  en: {
    tagline: 'Quantum learning, from Kota',
    tagline2: 'Your future starts beyond binary.',
    nav: [
      ['/lessons/', 'Lessons'], ['/lab/', 'Quantum Lab'], ['/learn/', 'Learning log'], ['/careers/', 'Careers'], ['/why-kota/', 'Why Kota'], ['/about/', 'About'],
    ],
    start: 'Start learning', startHref: '/posts/roadmap-what-to-learn-first/',
    menu: 'Menu', explainers: 'Explainers', newLabel: 'New',
    footAbout: "Free quantum computing lessons from absolute zero, and the case for building India's quantum workforce in Kota.",
    footLearn: 'Learn', footInit: 'Initiative', footFollow: 'Follow',
    roadmap: 'Roadmap', allLessons: 'All lessons', learningLog: 'Learning log', journeyTag: 'Learning log', explainerTag: 'Explainer', allExplainers: 'all explainers', theLog: 'the learning log', soon: 'First post coming soon.', day: (n) => `Day ${n}`, whyKota: 'Why Kota', careers: 'Careers in quantum', about: 'About',
    license: "Lessons and slides are licensed {cc}. Share them with credit; don't sell them.",
    switchLabel: 'हिन्दी', switchAria: 'हिन्दी में पढ़ें',
    lesson: (n) => `Lesson ${n}`, roadmapLabel: 'Roadmap', startHere: 'Start here', slides: (n) => `${n} slides`,
    published: (d, n) => `Published ${d}${n ? `, with ${n} slides` : ''}`,
    theSlides: 'The slides', tapSlide: 'Tap a slide to open it full size.', slideAlt: (i, title) => `Slide ${i}: ${title}`,
    prev: 'Previous', next: 'Next', backTo: 'Back to',
    chat: 'Chat with us', chatTitle: 'Questions about quantum, Kota or the lessons?', chatBody: 'Send us a message on Instagram. It opens a direct chat with @kota_quantum_valley, and we usually reply within a day.', chatButton: 'Message on Instagram', chatClose: 'Close chat',
  },
  hi: {
    tagline: 'कोटा से, क्वांटम की पढ़ाई',
    tagline2: 'आपका भविष्य बाइनरी से आगे शुरू होता है।',
    nav: [
      ['/hi/lessons/', 'पाठ'], ['/hi/lab/', 'क्वांटम लैब'], ['/hi/learn/', 'लर्निंग लॉग'], ['/hi/careers/', 'करियर'], ['/hi/why-kota/', 'कोटा क्यों'], ['/hi/about/', 'हमारे बारे में'],
    ],
    start: 'पढ़ाई शुरू करें', startHref: '/hi/lessons/roadmap-what-to-learn-first/',
    menu: 'मेनू', explainers: 'आसान व्याख्या', newLabel: 'नया',
    footAbout: 'शून्य से क्वांटम कंप्यूटिंग के मुफ़्त पाठ, और भारत की क्वांटम वर्कफ़ोर्स कोटा में तैयार करने का प्रस्ताव।',
    footLearn: 'पढ़ें', footInit: 'पहल', footFollow: 'जुड़ें',
    roadmap: 'रोडमैप', journeyTag: 'लर्निंग लॉग', explainerTag: 'आसान व्याख्या', allExplainers: 'सभी व्याख्याएँ', theLog: 'लर्निंग लॉग', soon: 'पहली पोस्ट जल्द आ रही है।', day: (n) => `दिन ${n}`, allLessons: 'सभी पाठ', learningLog: 'लर्निंग लॉग', whyKota: 'कोटा क्यों', careers: 'क्वांटम में करियर', about: 'हमारे बारे में',
    license: 'पाठ और स्लाइड {cc} लाइसेंस के तहत हैं। क्रेडिट देकर शेयर करें, बेचें नहीं।',
    switchLabel: 'EN', switchAria: 'Read in English',
    lesson: (n) => `पाठ ${n}`, roadmapLabel: 'रोडमैप', startHere: 'यहाँ से शुरू करें', slides: (n) => `${n} स्लाइड`,
    published: (d, n) => `प्रकाशित ${d}${n ? `, ${n} स्लाइड के साथ` : ''}`,
    theSlides: 'स्लाइड', tapSlide: 'किसी भी स्लाइड को बड़ा देखने के लिए उस पर टैप करें। स्लाइड अंग्रेज़ी में हैं।', slideAlt: (i, title) => `स्लाइड ${i}: ${title}`,
    prev: 'पिछला', next: 'अगला', backTo: 'वापस',
    chat: 'हमसे बात करें', chatTitle: 'क्वांटम, कोटा या पाठों के बारे में कोई सवाल?', chatBody: 'हमें इंस्टाग्राम पर मैसेज करें। इससे @kota_quantum_valley के साथ सीधी चैट खुलती है, और हम आमतौर पर एक दिन में जवाब देते हैं।', chatButton: 'इंस्टाग्राम पर मैसेज करें', chatClose: 'चैट बंद करें',
  },
};

export const langOf = (path) => (path === '/hi' || path.startsWith('/hi/') ? 'hi' : 'en');

// The matching page in the other language (falls back to that language's home).
export function altPath(path) {
  const p = path.endsWith('/') ? path : path + '/';
  if (langOf(p) === 'hi') {
    const m = p.match(/^\/hi\/(?:lessons|posts)\/([^/]+)\/$/);
    if (m) return `/posts/${m[1]}/`;
    return p.replace(/^\/hi/, '') || '/';
  }
  const m = p.match(/^\/posts\/((?:lesson-\d[^/]*)|roadmap-what-to-learn-first)\/$/);
  if (m) return `/hi/lessons/${m[1]}/`;
  const post = p.match(/^\/posts\/([^/]+)\/$/);
  if (post) return `/hi/posts/${post[1]}/`;
  if (['/', '/lessons/', '/lab/', '/why-kota/', '/about/', '/learn/', '/explainers/', '/careers/'].includes(p)) return '/hi' + p;
  return '/hi/';
}
