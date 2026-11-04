---
layout: ../../../layouts/Post.astro
lang: hi
title: "असली qubits कैसे बनते हैं"
description: "अच्छा qubit क्या होता है, decoherence और fidelity नंबरों में, transmon और dilution fridge, control stack, पाँच मुख्य platforms, और error correction क्यों ज़रूरी है।"
date: 2026-10-29
category: lesson
lesson: 4
slides: lesson-4
---

अब तक qubit गणित था। यह पाठ असली भौतिक चीज़ के बारे में है, और यह कि अच्छे qubits बनाना आज की सबसे कठिन इंजीनियरिंग समस्याओं में से एक क्यों है।

## Qubit भौतिक रूप से क्या है

कोई भी quantum system जिसके दो नियंत्रित स्तर हों: छोटा superconducting circuit, एक trapped ion, एक neutral atom, एक photon, या electron का spin।

## DiVincenzo checklist

2000 में David DiVincenzo ने ज़रूरतें गिनाईं:

1. **Scalable**, साफ़ परिभाषित qubits।
2. Qubits को |0⟩ पर **reset** करने का तरीका।
3. Gate के समय की तुलना में **लंबी coherence**।
4. **Universal gate set** (पाठ 2)।
5. भरोसेमंद **measurement**।

## Decoherence: दुश्मन

हर qubit धीरे-धीरे अपनी quantum state परिवेश में खो देता है: गर्मी, बाहरी fields, कंपन। दो समय इसे बताते हैं:

- **T1:** |1⟩ कितनी देर में |0⟩ में गिरता है (energy loss)।
- **T2:** **phase** कितनी देर टिकता है। Superposition को इसी की ज़रूरत है।

Coherence लगभग e^(−t/T2) की तरह घटती है:

| समय (T2 = 100 µs) | बची coherence |
|---|---|
| 0 | 100% |
| 50 µs | 61% |
| 100 µs | 37% |
| 300 µs | 5% |

**अनुपात मायने रखता है।** Gate 50 ns का और T2 100 µs हो, तो state फीकी पड़ने से पहले लगभग 2,000 gates का समय है।

## Fidelity: gate कितनी बार सही

99.9% बढ़िया लगता है, लेकिन 1,000 gates में *सब* सही होने की संभावना 0.999¹⁰⁰⁰ ≈ 37% है। इसीलिए error correction (पाठ 12) ज़रूरी है।

## Transmon: आज का मुख्य qubit

IBM, Google और कई दूसरे इस्तेमाल करते हैं:

- Capacitor और **Josephson junction** वाला superconducting circuit।
- Junction energy levels को **असमान दूरी** पर रखता है, ताकि |0⟩ ↔ |1⟩ चलाते समय ग़लती से |2⟩ न पहुँचे।
- **Dilution refrigerator** में लगभग **10–20 millikelvin** पर चलता है, अंतरिक्ष से भी ठंडा।
- Gates दसियों nanoseconds के microwave pulses हैं।

## Control stack (जहाँ इंजीनियर काम आते हैं)

```
Software (Qiskit)  →  compiler  →  pulse sequencer (FPGA)
   →  DACs + RF mixers  →  fridge में coax lines  →  qubits
   ←  amplifiers  ←  ADCs  ←  readout signal  ←
```

हर तीर एक इंजीनियरिंग काम है: low-noise इलेक्ट्रॉनिक्स, सटीक timing, तेज़ feedback, firmware।

## पाँच मुख्य platforms

| Platform | ताक़त | चुनौती | उदाहरण |
|---|---|---|---|
| **Superconducting** | तेज़ gates, chip fabrication | mK cooling, छोटी coherence | IBM, Google |
| **Trapped ions** | बहुत ऊँची fidelity | धीमे gates | Quantinuum, IonQ |
| **Neutral atoms** | सैकड़ों-हज़ारों atoms | धीमे gates, atom loss | QuEra, Pasqal |
| **Photonic** | कमरे का तापमान, networks के लिए स्वाभाविक | Photons मुश्किल से interact करते हैं | Xanadu, PsiQuantum |
| **Silicon spins** | Chip-factory तकनीक | कई को एक साथ control करना कठिन | Intel, Diraq |

**Topological** qubits design से errors रोकना चाहते हैं, लेकिन अभी शुरुआती research में हैं।

## Errors से scaling कठिन क्यों

ज़्यादा qubits मतलब ज़्यादा noise, wiring, गर्मी और crosstalk। उपयोगी algorithm को अरबों operations चाहिए; physical qubits हज़ारों तक पहुँचते हैं। पुल है **error correction**: कई physical qubits से एक भरोसेमंद **logical** qubit। 2024 में Google की Willow chip ने दिखाया कि code बड़ा करने पर logical errors *घटते* हैं। पाठ 12 में आप ख़ुद एक code बनाएँगे।

## ख़ुद आज़माएँ

1. Gate 30 ns का और T2 = 150 µs। Coherence 37% तक गिरने से पहले लगभग कितने gates?
2. 99.5% fidelity पर 200 gates सब सही होने की संभावना? (0.995²⁰⁰)
3. शहरों के बीच quantum network के लिए कौन-सा platform चुनेंगे, और क्यों?

## सार

| शब्द | मतलब |
|---|---|
| T1 / T2 | Energy-loss समय / phase-loss समय |
| Fidelity | सही operations का हिस्सा |
| Transmon | Josephson junction वाला superconducting qubit |
| Dilution fridge | Qubits को ~10 mK तक ठंडा करता है |
| Logical qubit | कई physical qubits से बना भरोसेमंद qubit |
