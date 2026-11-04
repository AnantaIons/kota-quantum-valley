---
layout: ../../../layouts/Post.astro
lang: hi
title: "क्वांटम सेंसिंग"
description: "नाज़ुक qubit बढ़िया sensor क्यों बनता है, कोड में Ramsey interferometry, precision की सीमाएँ, atomic clocks, SQUIDs, NV centres, atom gravimeters और LIGO।"
date: 2026-10-30
category: lesson
lesson: 6
slides: lesson-6
---

Quantum computing environment से लड़ती है। **Quantum sensing उसे सुनती है।** यही स्तंभ आज रोज़ इस्तेमाल में है: atomic clocks और SQUIDs दशकों से काम कर रहे हैं।

## Qubit की कमज़ोरी, sensor की ताक़त

1. कोई field (magnetic, electric, gravity) |0⟩ और |1⟩ के बीच energy gap **खिसका** देती है।
2. Superposition में यह खिसकाव समय के साथ |0⟩ और |1⟩ के बीच **phase** बनकर जमा होता है।
3. **Interference** phase को measure होने वाली probability में बदल देता है।

## हर quantum sensor का नुस्खा

1. Qubit को |0⟩ में **तैयार** करें।
2. H जैसे operation से **superpose** करें।
3. **Sense:** t समय रुकें; field phase φ जोड़ती है।
4. **Read out:** interfere करें, measure करें; हज़ारों बार दोहराएँ।

## Ramsey interferometry: H, रुको, H

```
पहले H के बाद:    (|0⟩ + |1⟩)/√2
रुकने के बाद:     (|0⟩ + e^(iφ)|1⟩)/√2        φ = Δω · t
दूसरे H के बाद:   P(0) = cos²(φ/2)
```

P(0) measure करो तो φ पता; φ पता तो field पता।

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

for phi in [0, np.pi / 2, np.pi]:
    r = QuantumCircuit(1)
    r.h(0)
    r.p(phi, 0)        # field phase φ जोड़ती है
    r.h(0)
    p0 = abs(Statevector(r).data[0]) ** 2
    print(f"φ = {phi:.3f}   P(0) = {p0:.3f}   cos²(φ/2) = {np.cos(phi/2)**2:.3f}")
```

```text
φ = 0.000   P(0) = 1.000   cos²(φ/2) = 1.000
φ = 1.571   P(0) = 0.500   cos²(φ/2) = 0.500
φ = 3.142   P(0) = 0.000   cos²(φ/2) = 0.000
```

Sensors φ = π/2 के पास सबसे अच्छे काम करते हैं, जहाँ P(0) सबसे तेज़ बदलता है। ज़्यादा देर रुकने से उसी field से φ बढ़ता है, जब तक decoherence (पाठ 4) उसे मिटा न दे।

## Precision की सीमाएँ

- **Standard quantum limit:** N स्वतंत्र atoms या repeats से error **1/√N** की तरह घटता है। 100 repeats से 10× बेहतर; 10,000 से 100×।
- **Heisenberg limit:** N atoms को **GHZ state** (|00…0⟩ + |11…1⟩)/√2 में entangle करें तो phase N गुना तेज़ जमा होता है, error **1/N** तक घट सकता है। शर्त: GHZ states बेहद नाज़ुक हैं।

## Atomic clocks

- **एक second** = caesium-133 के 9,192,631,770 cycles (SI परिभाषा)।
- Clock एक oscillator है जो feedback से atom पर **lock** है: phase-locked loop जिसका reference प्रकृति है।
- **Optical clocks** (जैसे strontium, ~429 THz) कहीं तेज़ टिक करते हैं; सबसे अच्छे ब्रह्मांड की उम्र में एक second से कम भटकेंगे।
- **उपयोग:** GPS और **NavIC** (1 ns error ≈ 30 cm), मोबाइल networks, बिजली grid। भारत का आधिकारिक समय **CSIR-NPL** के caesium clocks रखते हैं।

## Magnetic sensors

| Field | आम ताक़त |
|---|---|
| Fridge magnet | ~5 mT |
| पृथ्वी | ~50 µT |
| आपकी धड़कन | ~10–100 pT |
| आपका दिमाग़ | ~100 fT |

- **SQUIDs:** Josephson junctions वाले superconducting loops; femtotesla तक; brain scans (MEG); ~4 K चाहिए।
- **Diamond में NV centres:** एक nitrogen atom के बगल में ग़ायब carbon। **कमरे के तापमान** पर, हरे laser और लाल चमक से पढ़ा जाता है, **2.87 GHz** से control। Field resonance को बाँटती है: **Δf = 2γB**, γ ≈ 28 GHz/T, तो 1 mT पर 56 MHz।
- **Optically pumped magnetometers:** rubidium vapour cells, brain scan के लिए पहनने लायक छोटे।

## Gravity और गति

**Atom interferometers** laser pulses से ठंडे atoms को दो रास्तों में बाँटकर फिर मिलाते हैं। Gravity phase **φ = k·g·T²** जोड़ती है। अच्छे instruments g का लगभग एक अरबवाँ हिस्सा पकड़ते हैं: ज़मीन के नीचे सुरंग, पानी और खनिज map करने, और **GPS के बिना** navigation के लिए काफ़ी।

## LIGO और squeezed light

LIGO proton की चौड़ाई के लगभग 1/10,000 जितनी mirror हलचल पकड़ता है। Photon का "shot noise" quantum सीमा तय करता है; **squeezed light** noise को उस quantity में धकेल देती है जो measure नहीं होती। LIGO 2019 से इसे इस्तेमाल कर रहा है। **LIGO-India** महाराष्ट्र के हिंगोली में बन रहा है।

## ख़ुद आज़माएँ

1. कोड में φ = π/3 आज़माएँ। पहले P(0) का अनुमान लगाएँ।
2. Standard limit पर 1,000× बेहतर precision के लिए कितने repeats चाहिए?
3. NV sensor पर 14 MHz splitting दिखी। Field कितनी है? (Δf = 2γB, γ = 28 GHz/T)

## सार

| विचार | Formula / तथ्य |
|---|---|
| Ramsey | H, रुको, H: P(0) = cos²(φ/2) |
| Standard limit | precision ∝ 1/√N |
| Heisenberg limit | precision ∝ 1/N (entangled) |
| Second | 9,192,631,770 Cs-133 cycles |
| NV centre | Δf = 2γB, γ ≈ 28 GHz/T |
| Atom gravimeter | φ = k·g·T² |
