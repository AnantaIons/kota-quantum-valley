---
layout: ../../../layouts/Post.astro
lang: hi
title: "Quantum sensing"
description: "वह quantum technology जो पहले से रोज़ इस्तेमाल में है। नाज़ुक qubit बढ़िया sensor क्यों बनता है, Qiskit में Ramsey interferometry से frequency नापना, standard quantum limit और entanglement उसे कैसे हराता है (simulate किया), सीमित coherence में सबसे अच्छा इंतज़ार का समय, atomic clocks, GPS और relativity (हिसाब के साथ), SQUIDs से diamond के NV centres तक magnetometers, gravity और navigation के लिए atom interferometers, LIGO का squeezed light, और भारत की योजनाएँ।"
date: 2026-11-04
category: lesson
lesson: 44
---

Quantum computing environment से लड़ता है: qubit को धक्का देने वाला हर भटका field दबाने लायक़ noise है। **Quantum sensing इसे उलट देता है।** अगर qubit इतना संवेदनशील है कि सबसे छोटा magnetic field, gravity में सबसे हल्का बदलाव, या समय में सबसे छोटा खिसकाव उसे परेशान करता है, तो वह उन चीज़ों को असाधारण सटीकता से **नाप** सकता है।

Quantum sensing quantum technologies में सबसे परिपक्व भी है। Atomic clocks 1967 से second को परिभाषित करती हैं और GPS संभव बनाती हैं; SQUID magnetometers मानव दिमाग़ की तस्वीर लेते हैं; MRI scanners hydrogen nuclei के quantum spins पढ़ते हैं। Diamonds, ठंडे atoms और entanglement इस्तेमाल करने वाले sensors की नई पीढ़ी अब labs से निकलकर navigation, चिकित्सा, खनन और रक्षा में आ रही है। यह पाठ साझा सिद्धांत, सटीकता की सीमाएँ, और मुख्य क़िस्म के sensors समझाता है।

## Qubit की कमज़ोरी, sensor की ताक़त

लगभग हर quantum sensor एक ही तरह काम करता है:

1. जो आप नापना चाहते हैं (magnetic field, electric field, gravity, घूमना, समय) वह |0⟩ और |1⟩ के बीच **energy gap को थोड़ा खिसकाता है**, और इसलिए qubit की frequency को।
2. Superposition में वह frequency खिसकाव |0⟩ और |1⟩ के बीच **relative phase** जमा करता है: φ = Δω·t (पाठ 10)।
3. **Interference** phase को probability में बदलता है, जिसे आप measure करते हैं।

## Ramsey interferometry: H, इंतज़ार, H

मानक नुस्ख़ा **Ramsey measurement** कहलाता है, Norman Ramsey (Nobel पुरस्कार 1989) के नाम पर, और इसके टुकड़े आप देख चुके हैं:

- |0⟩ **तैयार** करो और H लगाओ: (|0⟩ + |1⟩)/√2।
- समय t तक **इंतज़ार** करो। अनजान खिसकाव Δ phase जोड़ता है: global phase तक (|0⟩ + e^(iΔt)|1⟩)/√2।
- **फिर H लगाओ** और measure करो। 0 की probability cos²(φ/2) है, φ = Δ·t के साथ।

P(0) को कई बार नापने से φ मिलता है, और t से भाग देने से frequency खिसकाव, और उससे field। 1 µs इंतज़ार और 2,000 shots से एक अनजान 180 kHz खिसकाव नापें:

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler

t = 1e-6                                   # wait 1 µs between the two pulses
true_detuning = 2 * np.pi * 180e3          # unknown to us: the field shifts the qubit by 180 kHz

def ramsey(detuning, shots=2000):
    qc = QuantumCircuit(1)
    qc.h(0)                                # superpose
    qc.rz(detuning * t, 0)                 # the field adds a phase φ = Δ·t while we wait
    qc.h(0)                                # interfere
    qc.measure_all()
    counts = StatevectorSampler(seed=11).run([qc], shots=shots).result()[0].data.meas.get_counts()
    return counts.get("0", 0) / shots      # P(0) = cos²(φ/2)

p0 = ramsey(true_detuning)
phi = 2 * np.arccos(np.sqrt(p0))           # invert P(0) = cos²(φ/2)
print(f"measured P(0) = {p0:.4f}  →  phase φ = {phi:.3f} rad  →  frequency shift = {phi / t / (2 * np.pi) / 1e3:.1f} kHz")
err = 1 / np.sqrt(2000) / t / (2 * np.pi) / 1e3   # shot noise: δφ ≈ 1/√shots
print(f"uncertainty from 2000 shots ≈ ±{err:.1f} kHz   (the true shift was 180.0 kHz)")
```

```text
measured P(0) = 0.7280  →  phase φ = 1.097 rad  →  frequency shift = 174.6 kHz
uncertainty from 2000 shots ≈ ±3.6 kHz   (the true shift was 180.0 kHz)
```

अनुमान 175 ± 4 kHz है, सच से लगभग डेढ़ error bars के अंदर। देखें अनिश्चितता कहाँ से आती है: हर shot एक random 0 या 1 देता है, तो N shots के साथ phase सिर्फ़ लगभग **1/√N** तक पता है। यह **shot noise** है, जिसे **projection noise** भी कहते हैं, और यह स्वतंत्र कणों से बने किसी भी sensor की बुनियादी सीमा है।

## Standard quantum limit, और entanglement से उसे हराना

N स्वतंत्र qubits (या N दोहरावों) के साथ phase अनिश्चितता है

> δφ ≈ 1/√N   (**standard quantum limit**)

Error आधा करने के लिए चार गुना atoms या measurements चाहिए। Entanglement बेहतर कर सकता है। अगर n qubits GHZ state (|00…0⟩ + |11…1⟩)/√2 में तैयार हों और हर एक phase φ उठाए, तो दोनों branches **nφ** से अलग होती हैं: entangled state n गुना ज़्यादा संवेदनशील है। कुल N कणों के साथ इसे दोहराने से मिलता है

> δφ ≈ 1/N   (**Heisenberg limit**)

दोनों दावे जाँचें: पहले कि GHZ fringe सचमुच n गुना तेज़ झूलती है, फिर कि कुल वही 4,000 qubit-इस्तेमालों के साथ entangled तरीका एक छोटा phase ज़्यादा सटीकता से अनुमान लगाता है:

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

def ghz_ramsey_p0(n, phi):
    """n entangled qubits in a GHZ state each pick up phase φ; then disentangle and read qubit 0."""
    qc = QuantumCircuit(n)
    qc.h(0)
    for q in range(n - 1): qc.cx(q, q + 1)          # (|00..0⟩ + |11..1⟩)/√2
    for q in range(n): qc.rz(phi, q)                # every qubit senses the same field
    for q in reversed(range(n - 1)): qc.cx(q, q + 1)
    qc.h(0)
    return Statevector(qc).probabilities([0])[0]

phi = 0.2
for n in [1, 2, 4, 8]:
    print(f"{n} qubit(s): P(0) = {ghz_ramsey_p0(n, phi):.4f}   cos²(n·φ/2) = {np.cos(n * phi / 2) ** 2:.4f}")

# Same total resources: 8 qubits per run, 500 runs. Estimate a small phase φ many times and compare the spread.
rng = np.random.default_rng(3)
n, runs, true_phi = 8, 500, 0.01
def estimate(k, shots):             # k = phase multiplier; measured at the steepest point of the fringe
    p0 = np.cos((k * true_phi + np.pi / 2) / 2) ** 2
    est_p0 = rng.binomial(shots, p0, size=2000) / shots
    return (2 * np.arccos(np.sqrt(est_p0)) - np.pi / 2) / k
independent = estimate(1, n * runs)          # 8 separate qubits each run: 4000 single-qubit shots
entangled = estimate(n, runs)                # one 8-qubit GHZ state each run: 500 shots, 8× the phase
print(f"\nspread of the estimate:  independent qubits {independent.std():.4f}  (1/√4000 = {1 / np.sqrt(n * runs):.4f})")
print(f"                         GHZ state          {entangled.std():.4f}  (1/(8·√500) = {1 / (n * np.sqrt(runs)):.4f})")
```

```text
1 qubit(s): P(0) = 0.9900   cos²(n·φ/2) = 0.9900
2 qubit(s): P(0) = 0.9605   cos²(n·φ/2) = 0.9605
4 qubit(s): P(0) = 0.8484   cos²(n·φ/2) = 0.8484
8 qubit(s): P(0) = 0.4854   cos²(n·φ/2) = 0.4854

spread of the estimate:  independent qubits 0.0162  (1/√4000 = 0.0158)
                         GHZ state          0.0056  (1/(8·√500) = 0.0056)
```

GHZ probability ठीक cos²(nφ/2) मानती है। और बराबर resources के साथ entangled sensor का फैलाव 0.0056 है, स्वतंत्र qubits के 0.016 के मुक़ाबले: √8 ≈ 2.8 गुना बेहतर, ठीक जैसा दोनों सीमाएँ बताती हैं।

एक पेंच है, इसीलिए ज़्यादातर व्यावहारिक sensors अब भी स्वतंत्र कण इस्तेमाल करते हैं: GHZ state भी **n गुना तेज़ decohere होती है**, क्योंकि किसी भी qubit पर कोई भी noise साझा phase नष्ट कर देता है। Noisy हालात में फ़ायदा ग़ायब हो सकता है। Entanglement का एक नरम रूप, **spin squeezing**, जो दो मात्राओं के बीच अनिश्चितता बाँटता है, छोटे लेकिन ज़्यादा मज़बूत फ़ायदे देता है और सबसे अच्छी atomic clocks में इस्तेमाल होता है।

## कितना इंतज़ार करें?

लंबा इंतज़ार ज़्यादा phase जमा करता है, तो लंबा इंतज़ार बेहतर लगता है। लेकिन qubit decohere होता है: समय t के बाद fringe का contrast e^(−t/T2) की तरह सिकुड़ता है (पाठ 32)। और लंबे इंतज़ार का मतलब हर second कम दोहराव। इन्हें संतुलित करें:

```python
import numpy as np

T2 = 100e-6        # coherence time
total = 1.0        # one second of measuring, split into repeated Ramsey runs of length t

def field_uncertainty(t):
    """Smallest detectable frequency shift (rad/s) after `total` seconds of repeated runs of length t."""
    runs = total / t
    contrast = np.exp(-t / T2)                # decoherence shrinks the fringe
    return 1 / (t * contrast * np.sqrt(runs)) # phase noise 1/√runs, divided by how much phase per unit shift

print(" wait t     relative uncertainty (lower is better)")
best = field_uncertainty(T2 / 2)
for frac in [0.05, 0.1, 0.25, 0.5, 1.0, 2.0, 4.0]:
    print(f"{frac:5.2f}·T2        {field_uncertainty(frac * T2) / best:6.2f}")
ts = np.linspace(0.01, 5, 5000) * T2
print(f"\nbest wait time = {ts[np.argmin(field_uncertainty(ts))] / T2:.2f} × T2")
```

```text
 wait t     relative uncertainty (lower is better)
 0.05·T2          2.02
 0.10·T2          1.50
 0.25·T2          1.10
 0.50·T2          1.00
 1.00·T2          1.17
 2.00·T2          2.24
 4.00·T2         11.71

best wait time = 0.50 × T2
```

सबसे अच्छा इंतज़ार का समय **coherence time का आधा** है। बहुत कम इंतज़ार करें तो संवेदनशीलता बर्बाद; बहुत ज़्यादा करें तो decoherence signal मिटा देता है। इसीलिए sensor designers coherence पर ध्यान गड़ाए रहते हैं: T2 दोगुना करने से दोगुना इंतज़ार कर सकते हैं, उसी कुल समय में संवेदनशीलता √2 सुधरती है। Coherence बढ़ाने के लिए dynamical decoupling (पाठ 36) भी इस्तेमाल होता है, और चतुराई से, sensor को सिर्फ़ चुनी frequency पर दोलन करते signals के प्रति संवेदनशील बनाने के लिए।

## Atomic clocks

**Atomic clock** उलटा चलाया गया Ramsey-जैसा measurement है: अनजान frequency नापने के बजाय वह एक laser या microwave oscillator को atomic transition पर ठीक-ठीक बाँधे रखती है। 1967 से second, caesium-133 के hyperfine transition के **9,192,631,770** periods के रूप में परिभाषित है। Caesium fountain clocks लगभग 10⁻¹⁶ की fractional अनिश्चितता तक पहुँचती हैं।

**Optical clocks**, strontium, ytterbium या अकेले ions में सैकड़ों terahertz पर transitions इस्तेमाल करके, लगभग 100 गुना और बेहतर हैं, लगभग 10⁻¹⁸: वे ब्रह्मांड की उम्र में एक second से कम खोएँगी। उस सटीकता पर घड़ियाँ Einstein के **gravitational redshift** से gravity की sensors बन जाती हैं: ऊँचाई पर समय तेज़ चलता है। यही physics GPS के लिए मायने रखती है, जहाँ satellite clocks को special और general relativity दोनों के लिए सुधारना पड़ता है:

```python
g, c = 9.81, 299_792_458.0               # gravity (m/s²), speed of light (m/s)

# General relativity: a clock higher up runs faster by Δf/f = g·Δh / c²
for dh in [0.01, 1.0, 1000.0]:
    print(f"raise a clock by {dh:7.2f} m  →  it runs faster by {g * dh / c**2:.2e} (fraction)")
print("best optical clocks: ≈ 1e-18, so they can feel a height change of about a centimetre\n")

# GPS satellites: orbit radius ≈ 26,560 km, speed ≈ 3.87 km/s
GM, R_earth, r_orbit, v = 3.986e14, 6.371e6, 2.656e7, 3874.0
day = 86400
special = -0.5 * v**2 / c**2 * day                      # moving clocks run slow
general = GM / c**2 * (1 / R_earth - 1 / r_orbit) * day # higher clocks run fast
print(f"GPS clock drift per day: special relativity {special * 1e6:+.1f} µs, general relativity {general * 1e6:+.1f} µs")
print(f"net {(special + general) * 1e6:+.1f} µs/day; uncorrected, positions would drift ≈ {(special + general) * c / 1000:.0f} km per day")
```

```text
raise a clock by    0.01 m  →  it runs faster by 1.09e-18 (fraction)
raise a clock by    1.00 m  →  it runs faster by 1.09e-16 (fraction)
raise a clock by 1000.00 m  →  it runs faster by 1.09e-13 (fraction)
best optical clocks: ≈ 1e-18, so they can feel a height change of about a centimetre

GPS clock drift per day: special relativity -7.2 µs, general relativity +45.7 µs
net +38.5 µs/day; uncorrected, positions would drift ≈ 12 km per day
```

घड़ी को एक centimetre ऊपर उठाने से उसकी दर लगभग 10¹⁸ में 1 हिस्सा बदलती है, जिसे सबसे अच्छी optical clocks अब पकड़ सकती हैं: यह **relativistic geodesy** है, घड़ियों से ऊँचाई और पृथ्वी के gravity field का आकार नापना। और relativistic सुधारों के बिना GPS एक दिन में fail हो जाता: satellite clocks हर दिन लगभग 38 µs आगे निकलती हैं, जो positions को हर दिन लगभग 10 से 12 km खिसका देता। हर navigation system, भारत के **NavIC** समेत, अंतरिक्ष-योग्य atomic clocks पर निर्भर है; जब पहले NavIC satellite की आयातित rubidium clocks 2016 में fail हुईं, ISRO ने स्वदेशी atomic clocks बनाना शुरू किया। भारत का आधिकारिक समय (IST) New Delhi में CSIR-NPL caesium clocks से रखता है।

## Magnetic field sensors

**SQUIDs** (superconducting quantum interference devices) एक superconducting loop में दो Josephson junctions इस्तेमाल करते हैं (पाठ 38)। Loop से गुज़रता current उसके अंदर के magnetic flux के साथ flux quantum h/2e ≈ 2.07 × 10⁻¹⁵ Wb के क़दमों में दोलन करता है, जो उन्हें femtotesla fields के प्रति संवेदनशील बनाता है। वे दशकों से **magnetoencephalography (MEG)** में इस्तेमाल होते रहे हैं, जो neural currents के छोटे magnetic fields से दिमाग़ की गतिविधि का नक़्शा बनाता है, और geology में भी। उन्हें cryogenic cooling चाहिए।

**Optically pumped magnetometers (OPMs)** alkali atoms की vapour इस्तेमाल करते हैं जिनके spins magnetic field में घूमते हैं, lasers से पढ़े जाते हैं। वे अब cryogenics के बिना संवेदनशीलता में SQUIDs की बराबरी करते हैं, पहनने योग्य MEG helmets संभव बनाते हुए जो मरीज़ों, बच्चों समेत, को scan के दौरान हिलने देते हैं।

**Diamond में NV centres** शायद सबसे बहुमुखी quantum sensor हैं। Diamond crystal में एक ग़ायब carbon atom के बगल में nitrogen atom ऐसे electrons फँसाता है जिनके spin का resonance 2.87 GHz के पास है और जो magnetic field के हर tesla पर 28 GHz खिसकता है। वे **कमरे के तापमान** पर काम करते हैं, optically पढ़े जाते हैं (एक spin state में ज़्यादा चमकते हैं), और दोष atom के आकार का है, तो वह जिसे नापता है उससे nanometres दूर बैठ सकता है:

```python
import numpy as np

# NV centre in diamond: its spin resonance shifts by 28 GHz per tesla of magnetic field
gamma_nv = 28e9                                  # Hz per tesla
for name, B in [("Earth's field", 50e-6), ("fridge magnet, 1 cm away", 1e-3), ("1 nanotesla change", 1e-9),
                ("brain signal outside the head (≈ 100 fT)", 1e-13)]:
    print(f"{name:41s} B = {B:8.0e} T  →  NV frequency shift {gamma_nv * B:10.3g} Hz")

# Atom interferometer gravimeter: phase φ = k_eff · g · T², with rubidium's 780 nm light
k_eff = 2 * 2 * np.pi / 780e-9                   # two photon kicks per pulse (rad per metre)
T = 0.1                                          # 100 ms between pulses
g = 9.81
print(f"\natom gravimeter phase: φ = k·g·T² = {k_eff * g * T**2:.3g} rad")
print(f"a change of g by one part in a billion shifts the phase by {k_eff * g * 1e-9 * T**2 * 1000:.2f} milliradians")
```

```text
Earth's field                             B =    5e-05 T  →  NV frequency shift    1.4e+06 Hz
fridge magnet, 1 cm away                  B =    1e-03 T  →  NV frequency shift    2.8e+07 Hz
1 nanotesla change                        B =    1e-09 T  →  NV frequency shift         28 Hz
brain signal outside the head (≈ 100 fT)  B =    1e-13 T  →  NV frequency shift     0.0028 Hz

atom gravimeter phase: φ = k·g·T² = 1.58e+06 rad
a change of g by one part in a billion shifts the phase by 1.58 milliradians
```

पृथ्वी का field NV resonance को लगभग 1.4 MHz खिसकाता है, और एक nanotesla 28 Hz, आसानी से नापने योग्य। लगभग 100 fT के दिमाग़ी signals उसे सिर्फ़ 3 mHz खिसकाते हैं, तो उन्हें NV centres के बड़े समूह और लंबा averaging चाहिए, एक सक्रिय research लक्ष्य। Diamond की नोक में एक अकेला NV centre अलग-अलग molecules, nanoscale magnets और जीवित cells के magnetic fields की तस्वीर ले सकता है। NV centres तापमान, electric fields और strain भी नापते हैं।

## Gravity, acceleration और घूमना

Atoms भी तरंगें हैं (पाठ 5)। **Atom interferometer** (Kasevich और Chu, 1991) में laser pulses ठंडे atoms के बादल को दो wave packets में बाँटते हैं जो अलग रास्तों पर चलते हैं, फिर उन्हें मिलाते हैं, ठीक प्रकाश के Mach–Zehnder interferometer की तरह। मुक्त गिरावट में phase अंतर φ = k_eff·g·T² है, जहाँ k_eff laser wavelength से तय है और T pulses के बीच का समय है। ऊपर के code की आख़िरी पंक्तियाँ दिखाती हैं कि यह कितना बड़ा है: T = 0.1 s पर लगभग 16 लाख radians, तो g में एक अरब में एक हिस्से का बदलाव phase को एक milliradian से ज़्यादा खिसकाता है, जो नापने योग्य है।

इस्तेमाल में शामिल हैं:

- **Gravimetry:** खनिज और तेल की खोज, भूजल, ज्वालामुखी निगरानी, और civil engineering (ख़ाली जगहें, सुरंगें और पुरानी खदानें ढूँढना) के लिए ज़मीन के नीचे घनत्व का नक़्शा।
- **Inertial navigation:** atom accelerometers और gyroscopes satellite signals के बिना position track कर सकते हैं, submarines, aircraft और GPS jamming के ख़िलाफ़ मज़बूती के लिए अहम। Navies और transport operators ने labs के बाहर quantum inertial navigation परखना शुरू किया है, UK में ships और trains पर trials समेत।
- **बुनियादी physics:** gravitational constant नापना, यह जाँचना कि क्या सब चीज़ें एक ही दर से गिरती हैं, और dark matter की खोज।

## LIGO और squeezed light

अब तक का सबसे संवेदनशील measurement **gravitational waves** की पहचान है। 2015 में LIGO ने अपनी 4 km भुजाओं की लंबाई में लगभग 10⁻¹⁸ m का बदलाव नापा, proton की चौड़ाई का हज़ारवाँ हिस्सा, जो 1.3 अरब प्रकाश-वर्ष दूर दो black holes के मिलने से हुआ (Nobel पुरस्कार 2017)।

LIGO की संवेदनशीलता आंशिक रूप से ख़ुद laser प्रकाश के quantum noise से सीमित है: photons का random आगमन (shot noise) और दर्पणों पर उनका random धक्का। 2019 से LIGO **squeezed light** डालता है, प्रकाश की एक quantum state जिसमें एक गुण में कम noise है दूसरे की क़ीमत पर, एक असली उपकरण के लिए standard quantum limit को हराते हुए और पकड़ी गई घटनाओं की दर दसियों प्रतिशत बढ़ाते हुए। 2023 से frequency-dependent squeezing पूरे detection band में noise घटाता है। यह standard quantum limit से आगे का quantum sensing है, रोज़ के काम में।

## भारत में quantum sensing

भारत का National Quantum Mission **quantum sensing और metrology** को चार technology hubs में से एक बताता है (computing, communication, और materials और devices के साथ), ऐसे लक्ष्यों के साथ जिनमें उच्च-संवेदनशीलता magnetometers, सटीक समय और navigation के लिए atomic clocks, और gravimeters शामिल हैं। IITs, IISc, RRI, TIFR और NPL जैसे संस्थानों के research समूह NV centres, cold-atom sensors और optical clocks पर काम करते हैं, और कई भारतीय startups quantum sensors बना रहे हैं। Electronics और embedded skills वाले engineers के लिए sensing सबसे तात्कालिक अवसर है: quantum sensor एक physics package है और साथ में lasers, microwave sources, photodetectors और बहुत सारा control और signal-processing electronics।

## आज़माकर देखें

1. Ramsey नुस्ख़े में पहला H क्या करता है, और दूसरा H क्या करता है?
2. 10,000 shots के साथ standard quantum limit मोटे तौर पर कितनी phase अनिश्चितता देती है?
3. 10-qubit GHZ state एक phase φ महसूस करती है। उसकी fringe एक qubit की तुलना में कैसी है? GHZ sensing हर जगह क्यों नहीं इस्तेमाल होती?
4. एक qubit का T2 = 2 ms है। कौन-सा इंतज़ार का समय सबसे अच्छी Ramsey संवेदनशीलता देता है?
5. GPS satellite clocks तेज़ी से चलने के बावजूद कुल मिलाकर आगे क्यों निकलती हैं?
6. एक NV centre का resonance 140 Hz खिसकता है। किस magnetic field बदलाव से?
7. GPS होने के बावजूद quantum inertial navigation क्यों काम का है?

**जवाब:**

1. पहला H superposition (|0⟩ + |1⟩)/√2 बनाता है, ताकि relative phase जमा हो सके। दूसरा H दोनों branches को **interfere** कराता है, phase को नापने योग्य probability, cos²(φ/2), में बदलते हुए।
2. 1/√10,000 = **0.01 rad**।
3. यह **10 गुना तेज़** झूलती है (cos²(10φ/2)), तो हर run में 10 गुना ज़्यादा संवेदनशील। लेकिन यह लगभग 10 गुना तेज़ decohere भी होती है, तो noisy हालात में फ़ायदा घटता या ग़ायब होता है, और बड़ी GHZ states बनाना कठिन है।
4. लगभग **T2/2 = 1 ms**।
5. General relativity (ऊँचाई पर कमज़ोर gravity) उन्हें हर दिन लगभग 46 µs तेज़ करती है, जो special relativity (उनकी गति) से हर दिन लगभग 7 µs धीमा होने से ज़्यादा है। कुल: हर दिन लगभग +38 µs।
6. 140 Hz / 28 GHz प्रति tesla = 5 × 10⁻⁹ T = **5 nT**।
7. GPS jam, spoof या अनुपलब्ध हो सकता है (पानी के नीचे, ज़मीन के नीचे, सुरंगों में या संघर्ष में)। Inertial sensors कहीं भी बिना बाहरी signal के काम करते हैं, और quantum रूप classical से कहीं कम भटकते हैं।

## सार-सूत्र

| विचार | सूत्र या तथ्य |
|---|---|
| सिद्धांत | मात्रा qubit frequency खिसकाती है; खिसकाव phase φ = Δ·t बनाता है |
| Ramsey | H, t इंतज़ार, H, measure: P(0) = cos²(φ/2) |
| Standard quantum limit | N स्वतंत्र कणों या shots के लिए δφ ≈ 1/√N |
| Heisenberg limit | Entanglement से δφ ≈ 1/N (GHZ: phase × n) |
| पेंच | Entangled states तेज़ decohere होती हैं; squeezing मज़बूत बीच का रास्ता |
| सबसे अच्छा इंतज़ार | Exponential decay वाले Ramsey के लिए ≈ T2/2 |
| Second (1967 से) | Caesium-133 के hyperfine transition के 9,192,631,770 periods |
| Optical clocks | ≈ 10⁻¹⁸; 1 cm ऊँचाई बदलाव महसूस करती हैं (Δf/f = g·Δh/c²) |
| GPS relativity | +45.7 µs/दिन (gravity) − 7.2 µs/दिन (गति) = +38.5 µs/दिन |
| SQUID | Flux quantum h/2e; femtotesla; MEG; cryogenics चाहिए |
| OPM | Atomic vapour magnetometers; पहनने योग्य MEG, cryogenics नहीं |
| NV centre | 2.87 GHz spin resonance, 28 GHz/T, कमरे का तापमान, nanoscale |
| Atom interferometer | φ = k_eff·g·T²; gravimetry, inertial navigation |
| LIGO | 10⁻¹⁸ m भुजा बदलाव; 2019 से squeezed light |
| भारत | NQM sensing और metrology hub; NavIC clocks; NPL IST रखता है |
