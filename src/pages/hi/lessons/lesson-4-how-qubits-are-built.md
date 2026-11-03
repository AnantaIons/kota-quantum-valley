---
layout: ../../../layouts/Post.astro
lang: hi
title: "असली qubits कैसे बनते हैं"
description: "Decoherence, fidelity, transmon और dilution fridge, control stack, ions, atoms, photons, spins, और error correction।"
date: 2026-10-29
category: lesson
lesson: 4
slides: lesson-4
---

## Qubits भौतिक चीज़ें हैं

Qubit कोई भी ऐसा भौतिक सिस्टम है जिसके दो स्तर हों और जिन्हें आप कंट्रोल कर सकें: superconducting circuit, ion, atom, photon, electron spin। **DiVincenzo checklist** कहती है कि अच्छे platform को चाहिए: scalable qubits, उन्हें reset करने का तरीका, लंबी coherence, universal gate set, और readout।

**Decoherence** दुश्मन है: गर्मी, बाहरी fields और कंपन quantum state को environment में बहा देते हैं। असली पैमाना है gate की रफ़्तार और memory समय का अनुपात, और **fidelity**, यानी कितने प्रतिशत operations सही निकलते हैं।

## Transmon

आज का सबसे आम qubit (IBM, Google)। **Josephson junction** वाला एक superconducting circuit, जो energy levels को असमान दूरी पर रखता है ताकि |0⟩ और |1⟩ को अलग से छुआ जा सके। यह **dilution refrigerator** के अंदर लगभग 10–20 millikelvin पर चलता है, अंतरिक्ष से भी ठंडा।

## Control stack (जहाँ embedded इंजीनियर काम आते हैं)

कमरे के तापमान वाले इलेक्ट्रॉनिक्स microwave pulses बनाते हैं (FPGA, DAC, RF mixing)। Pulses fridge के अंदर जाकर qubits को **drive** करते हैं। लौटते signals amplify होकर **readout** के लिए digital बनते हैं। Timing, firmware और low-latency feedback, ये सब इंजीनियरिंग की समस्याएँ हैं।

## दूसरे platforms

- **Trapped ions:** बहुत ऊँची fidelity, धीमे gates।
- **Neutral atoms:** laser tweezers में पकड़े गए; सैकड़ों और हज़ारों तक बढ़ रहे हैं।
- **Photons:** कमरे के तापमान पर, networking के लिए स्वाभाविक।
- **Silicon spins:** chip फ़ैक्ट्रियों की तकनीक दोबारा इस्तेमाल कर सकते हैं।
- **Topological:** design से ही errors दबें। अभी शुरुआती research।

## Error correction

Physical qubits बहुत ग़लतियाँ करते हैं। **Error correction** एक *logical* qubit को कई physical qubits में फैलाता है और data को measure किए बिना ग़लतियाँ जाँचता रहता है। **Surface code** सबसे आगे का तरीका है। 2024 में Google की Willow chip ने दिखाया कि code बड़ा करने पर logical errors घटते हैं, एक बड़ा पड़ाव।
