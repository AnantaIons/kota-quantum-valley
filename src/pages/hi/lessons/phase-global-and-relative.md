---
layout: ../../../layouts/Post.astro
lang: hi
title: "Phase: global और relative"
description: "Global phase कुछ क्यों नहीं बदलता, relative phase सब कुछ क्यों बदलता है, interferometer से छिपे phase को नापी जा सकने वाली probability में कैसे बदलें, phases भौतिक रूप से कहाँ से आते हैं, 'phase छोड़कर एक ही gate' control करने पर एक क्यों नहीं रहता, और random phase noise interference को कैसे मिटाता है।"
date: 2026-11-04
category: lesson
lesson: 10

---

Phase quantum computing का वह हिस्सा है जिसकी रोज़मर्रा में कोई मिसाल नहीं, और यही हिस्सा quantum algorithms को चलाता है। आप इससे कई बार मिल चुके हैं: complex amplitude का कोण (पाठ 2), Bloch sphere पर देशांतर φ (पाठ 7), और Z, S, T का काम (पाठ 9)।

यह पाठ इन धागों को एक साफ़ नियम में बाँधता है: **global phase कभी भौतिक नहीं, relative phase हमेशा भौतिक।** फिर दिखाता है कि relative phase कैसे नापें, असली हार्डवेयर में phases कहाँ से आते हैं, एक बारीक जाल जिसमें अनुभवी programmers भी फँसते हैं, और phase noise चुपचाप quantum computation को कैसे नष्ट करता है।

## Global phase: हमेशा अदृश्य

**Global phase** पूरी state को एक ही factor e^(iγ) से गुणा करता है:

> |ψ⟩ → e^(iγ)|ψ⟩

**दावा: कोई भी प्रयोग इसे कभी नहीं पकड़ सकता।** सबूत, दो लाइनों में।

**किसी भी basis में measurement:** नतीजे |b⟩ की probability |⟨b|e^(iγ)ψ⟩|² = |e^(iγ)|²·|⟨b|ψ⟩|² = |⟨b|ψ⟩|² है। कोई भी basis चुनें, नहीं बदलती।

**पहले लगे कोई भी gates:** U(e^(iγ)|ψ⟩) = e^(iγ)(U|ψ⟩)। Phase बस अंत तक साथ चलता है, जहाँ measurement उसे देख नहीं सकता।

तो e^(iγ)|ψ⟩ और |ψ⟩ **एक ही भौतिक state** हैं। इसीलिए पाठ 7 में हम α को real बना सके, और इसीलिए आप अक्सर ऐसे कथन देखेंगे: "X|−⟩ = −|−⟩, तो |−⟩ नहीं बदला"। पूरी state के आगे minus चिह्न बस 180° का global phase है।

## Relative phase: हमेशा भौतिक

**Relative phase** एक amplitude पर दूसरे के सापेक्ष phase है:

> (|0⟩ + |1⟩)/√2  बनाम  (|0⟩ + e^(iφ)|1⟩)/√2

हर φ के लिए (360° के गुणजों को छोड़कर) ये सच में अलग states हैं। Bloch sphere पर φ देशांतर है: φ = 0 सामने |+⟩, φ = 90° पर |+i⟩, φ = 180° पीछे |−⟩।

लेकिन ध्यान दें: **0/1 basis में measure करना φ नहीं देख सकता।** दोनों amplitudes का आकार 1/√2 है, तो हर φ के लिए P(0) = P(1) = ½। जानकारी state में है, पर default सवाल उस तक नहीं पहुँचता। अलग सवाल पूछना होगा।

## Interferometer: phase को probability में बदलना

तरकीब है दोनों amplitudes को **interfere** कराना। H लगाएँ, फिर phase, फिर फिर से H, और measure करें।

इसे हल करें। पहले H के बाद: (|0⟩ + |1⟩)/√2। Phase gate P(φ) के बाद: (|0⟩ + e^(iφ)|1⟩)/√2। अब हर पद पर H लगाएँ, H|0⟩ = (|0⟩ + |1⟩)/√2 और H|1⟩ = (|0⟩ − |1⟩)/√2 से:

```text
H (|0⟩ + e^(iφ)|1⟩)/√2  =  ½ [ (|0⟩ + |1⟩) + e^(iφ)(|0⟩ − |1⟩) ]
                        =  ½ [ (1 + e^(iφ))|0⟩ + (1 − e^(iφ))|1⟩ ]
```

|0⟩ का amplitude (1 + e^(iφ))/2 है। उसका आकार-वर्ग, पाठ 2 के |1 + e^(iφ)|² = 2 + 2cos φ से:

> **P(0) = (2 + 2cos φ)/4 = cos²(φ/2)**

छिपा phase अब एक नापी जा सकने वाली probability है। φ = 0 पर हमेशा 0; φ = 180° पर हमेशा 1; बीच में धीरे-धीरे बदलता है।

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

# Interferometer: H, then a phase phi on |1>, then H. Read out P(0).
print(" phi   P(0) from Z   P(0) after H")
for deg in [0, 45, 90, 135, 180]:
    qc = QuantumCircuit(1)
    qc.h(0)
    qc.p(np.radians(deg), 0)                     # relative phase e^(i phi) on |1>
    before = Statevector(qc).probabilities()[0]  # measure straight away
    qc.h(0)
    after = Statevector(qc).probabilities()[0]   # measure after a second H
    print(f"{deg:4d}   {before:.3f}         {after:.3f}")
```

```text
 phi   P(0) from Z   P(0) after H
   0   0.500         1.000
  45   0.500         0.854
  90   0.500         0.500
 135   0.500         0.146
 180   0.500         0.000
```

बीच वाला column हमेशा 0.5 है: phase अदृश्य। आख़िरी column cos²(φ/2) के साथ चलता है: phase दिखने लगा। (cos²22.5° = 0.854, cos²67.5° = 0.146।)

यह छोटा H–phase–H circuit पूरे क्षेत्र के सबसे ज़रूरी patterns में से है। Atomic physics में यह **Ramsey interferometer** है, हर atomic clock और quantum sensor की readout (पाठ 44), और **phase estimation** (पाठ 27) का दिल, जो phases को कई अंकों तक पढ़ता है और Shor algorithm चलाता है।

## Phases आते कहाँ से हैं

Circuit में relative phases Z, S, T और P(φ) जैसे gates से आते हैं। लेकिन असली qubit में एक गहरा स्रोत है: **ख़ुद समय।**

Quantum mechanics कहती है कि तय energy E वाली state समय बीतने पर phase उठाती है:

> |E⟩ → e^(−iEt/ħ)|E⟩

(ħ, "h-bar", Planck constant को 2π से भाग देकर है।) Qubit के |0⟩ और |1⟩ की energies आमतौर पर अलग होती हैं, E₀ और E₁। तो superposition में दोनों amplitudes अलग रफ़्तार से घूमते हैं, और उनका **relative** phase लगातार बढ़ता है:

> φ(t) = (E₁ − E₀)·t/ħ = 2π·f·t,  जहाँ f = (E₁ − E₀)/h

Bloch sphere पर state **precess** करती है: लट्टू की तरह, frequency f पर z-अक्ष के चारों ओर घूमती है। (हमारे home page का तीर यही कर रहा है।) Phase का global हिस्सा, जो दोनों amplitudes में साझा है, हमेशा की तरह अदृश्य है।

Superconducting qubit के लिए f लगभग **4 से 6 GHz** है: relative phase हर सेकंड अरबों चक्कर लगाता है। Quantum computers बनाने वाले engineers के लिए इसके बहुत व्यावहारिक नतीजे हैं:

- Control electronics को यह घुमाव सटीक रूप से track करना होता है, ताकि pulses सही phase के साथ पहुँचें। वे एक "rotating frame" में काम करते हैं जो qubit के साथ घूमता है।
- इसीलिए कई मशीनों पर **Z घुमाव software में हो सकता है**: बस आगे के सभी pulses का reference phase खिसका दीजिए। इसे "virtual Z gate" कहते हैं, इसमें शून्य समय लगता है, और यह बिल्कुल सही होता है (पाठ 11 और पाठ 38)।
- f में कोई भी अनिश्चितता, या उसे हिलाने वाला noise, φ में अनिश्चितता बन जाता है। यही अगला विषय है।

## जाल: "phase छोड़कर एक ही gate"

दो gates जो सिर्फ़ global phase में अलग हैं, U और e^(iγ)U, किसी भी state पर एक जैसा असर करते हैं। इसलिए हम आमतौर पर उन्हें **एक ही gate** कहते हैं। जैसे phase gate P(θ) और z-घुमाव RZ(θ) एक global phase से जुड़े हैं:

```text
P(θ)  = [ 1     0    ]          RZ(θ) = [ e^(−iθ/2)     0      ]  =  e^(−iθ/2) · P(θ)
        [ 0   e^(iθ) ]                  [    0      e^(iθ/2)   ]
```

अब इन्हें दूसरे qubit से **control** करें: gate तभी लगाएँ जब control qubit 1 हो। "Global" phase e^(−iθ/2) अब सिर्फ़ उस शाखा में आता है जहाँ control 1 है, उसमें नहीं जहाँ 0 है। **Global phase, control के |0⟩ और |1⟩ के बीच relative phase बन गया**, और अचानक भौतिक हो गया।

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Operator

theta = np.pi / 2
a = QuantumCircuit(1); a.p(theta, 0)      # P(theta)  = diag(1, e^(i theta))
b = QuantumCircuit(1); b.rz(theta, 0)     # RZ(theta) = diag(e^(-i theta/2), e^(i theta/2))
print("same gate (up to global phase):", Operator(a).equiv(Operator(b)))
print("exactly equal:                 ", Operator(a) == Operator(b))

# Now control each one with another qubit
ca = QuantumCircuit(2); ca.cp(theta, 0, 1)
cb = QuantumCircuit(2); cb.crz(theta, 0, 1)
print("controlled versions equivalent:", Operator(ca).equiv(Operator(cb)))
print(np.round(np.diag(Operator(ca).data), 3))
print(np.round(np.diag(Operator(cb).data), 3))
```

```text
same gate (up to global phase): True
exactly equal:                  False
controlled versions equivalent: False
[1.+0.j 1.+0.j 1.+0.j 0.+1.j]
[1.   +0.j    0.707-0.707j 1.   +0.j    0.707+0.707j]
```

`equiv` global phase छोड़कर बराबरी जाँचता है; `==` सटीक बराबरी। अकेले, दोनों gates equivalent हैं। Control करने पर नहीं। आख़िरी दो लाइनें दोनों 4×4 matrices के diagonals दिखाती हैं (दोनों diagonal हैं; चार entries का क्रम पाठ 12 समझाता है)। Controlled-P सिर्फ़ एक entry पर phase i लगाता है। Controlled-RZ दो entries पर e^(∓iπ/4) लगाता है: बचा हुआ global phase, अब control से जुड़ा।

आम सबक़: **जो phase अकेले gate के लिए मायने नहीं रखता, वह तब मायने रख सकता है जब वह gate किसी बड़ी चीज़ का हिस्सा हो।** इस असर का एक नाम है, **phase kickback**: जब कोई controlled gate ऐसे target पर लगे जो उसकी eigenstates (पाठ 4) में से एक में हो, तो eigenvalue का phase control qubit पर "वापस किक" होता है। यह Deutsch–Jozsa (पाठ 22), phase estimation (पाठ 27) और Shor algorithm (पाठ 28) की केंद्रीय तरकीब है।

## Phase noise: interference कैसे मरता है

Relative phases भौतिक हैं, यानी वे **नाज़ुक** भी हैं। अगर माहौल qubit को छोटे random phase धक्के दे, जैसे उसके आसपास का magnetic field हिलता रहे, या qubit की frequency f थोड़ी भटके, तो प्रयोग के हर run में φ थोड़ा अलग होगा।

तब interferometer क्या देखता है? एक φ के लिए cos²(φ/2) नहीं, बल्कि सभी random धक्कों का **औसत**। अलग-अलग आकार के धक्के simulate करें:

```python
import numpy as np
rng = np.random.default_rng(2)

# Each run gets a random phase kick of typical size sigma (in degrees).
# The interferometer H - (phase) - H should give P(0) = 1 with no kick.
for sigma in [0, 20, 45, 90, 180]:
    kicks = np.radians(rng.normal(0, sigma, 100_000))
    p0 = np.mean(np.cos(kicks / 2) ** 2)          # average of cos^2(phi/2) over the kicks
    print(f"phase noise {sigma:3d} deg -> P(0) = {p0:.3f}")
```

```text
phase noise   0 deg -> P(0) = 1.000
phase noise  20 deg -> P(0) = 0.970
phase noise  45 deg -> P(0) = 0.868
phase noise  90 deg -> P(0) = 0.646
phase noise 180 deg -> P(0) = 0.504
```

Noise न हो तो interference पूरा: P(0) = 1। Noise बढ़ने पर नतीजा **0.5** की ओर खिसकता है, जो सिक्का उछालने से मिलता। बड़े random phases ने superposition को ऐसी चीज़ बना दिया जो "या तो |0⟩ या |1⟩, पता नहीं कौन" से अलग नहीं पहचानी जा सकती: पाठ 7 की mixed state। Bloch sphere पर vector भूमध्य से z-अक्ष की ओर सिकुड़ गया।

इस प्रक्रिया को **dephasing** कहते हैं, और इसमें लगने वाले समय को **T₂**। Qubits के अपना quantum व्यवहार खोने के दो मुख्य तरीक़ों में से यह एक है (दूसरा, energy खोना, T₁ कहलाता है)। पाठ 32 दोनों नापता है। अभी के लिए मुख्य बात: **हर quantum algorithm एक दौड़ है, dephasing के phases मिटाने से पहले अपना interference पूरा करने की।**

## ख़ुद करके देखें

1. क्या (|0⟩ − |1⟩)/√2 और (−|0⟩ + |1⟩)/√2 एक ही भौतिक state हैं? और (|0⟩ + |1⟩)/√2?
2. P(0) = cos²(φ/2) से, interferometer में कौन-सा relative phase P(0) = 0.25 देता है?
3. H, S, H के बाद P(0)? H, T, H के बाद? (S = P(90°), T = P(45°) लें।)
4. एक qubit की frequency 5 GHz है। Relative phase को एक चक्कर में कितना समय लगता है? 1 microsecond में कितने पूरे चक्कर?
5. RZ(θ) = e^(−iθ/2)P(θ) का global phase single-qubit circuit में मायने क्यों नहीं रखता, लेकिन controlled-RZ में रखता है?
6. Dephasing table में, अगर phase noise पूरी तरह random हो (हर कोण बराबर संभव), तो P(0) किसके पास पहुँचेगा?

**जवाब:**

1. हाँ: (−|0⟩ + |1⟩)/√2 = −(|0⟩ − |1⟩)/√2, 180° का global phase। नहीं: (|0⟩ + |1⟩)/√2, |+⟩ है, जो **relative** phase से अलग है।
2. cos²(φ/2) = 0.25 → cos(φ/2) = 0.5 → φ/2 = 60° → **φ = 120°**।
3. H, S, H: cos²45° = **0.5**। H, T, H: cos²22.5° ≈ **0.854**।
4. एक चक्कर में 1/f = **0.2 nanosecond**। 1 μs में: 10⁻⁶ × 5 × 10⁹ = **5,000 चक्कर**।
5. अकेले, factor e^(−iθ/2) पूरी state को गुणा करता है। Control करने पर यह सिर्फ़ उस हिस्से को गुणा करता है जहाँ control 1 है, तो यह control के |0⟩ और |1⟩ के बीच relative phase है।
6. **0.5**: सभी कोणों पर cos²(φ/2) का औसत ½ है। Interference पूरी तरह ग़ायब।

## सार

| विचार | सूत्र या तथ्य |
|---|---|
| Global phase | e^(iγ)\|ψ⟩: वही भौतिक state; हर basis में पकड़ से बाहर |
| Relative phase | \|0⟩ + e^(iφ)\|1⟩: हर φ के लिए अलग state |
| Bloch sphere पर | Relative phase φ = देशांतर |
| Z-basis measurement | Relative phase के प्रति अंधा |
| Interferometer | H – P(φ) – H से P(0) = cos²(φ/2) |
| कहाँ इस्तेमाल | Atomic clocks, sensors (पाठ 44), phase estimation (पाठ 27) |
| Energy से phase | \|E⟩ → e^(−iEt/ħ)\|E⟩; relative phase f = ΔE/h पर बढ़ता है |
| Precession | Bloch vector frequency f पर z-अक्ष के चारों ओर घूमता है |
| Superconducting qubits | f ≈ 4–6 GHz; Z घुमाव software में "virtual" |
| Equivalent gates | अकेले U और e^(iγ)U एक ही gate |
| जाल | Controlled-U और controlled-(e^(iγ)U) अलग हैं |
| Phase kickback (झलक) | Target का eigenvalue phase control पर चला जाता है |
| Dephasing | Random phase धक्के interference को औसत में मिटा देते हैं: P → 0.5 |
| T₂ | Phase coherence खोने में लगने वाला समय |
