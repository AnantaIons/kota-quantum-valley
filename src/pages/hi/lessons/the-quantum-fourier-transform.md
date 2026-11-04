---
layout: ../../../layouts/Post.astro
lang: hi
title: "Quantum Fourier transform"
description: "Discrete Fourier transform और वह क्या ढूँढता है, वही transform amplitudes पर, वह product सूत्र जो इसे सस्ता बनाता है, Hadamards और controlled phases से बना circuit (Qiskit से जाँचा), यह periodic state को तीखी चोटियों में कैसे बदलता है, approximate QFT, और यह तेज़ FFT क्यों नहीं है।"
date: 2026-11-04
category: lesson
lesson: 26

---

Simon algorithm (पाठ 23) ने Hadamards से एक छिपा pattern ढूँढा। साधारण जोड़ से बने patterns के लिए, जैसे Shor algorithm में 7ˣ mod 15 की दोहराई जाने वाली values, Hadamards काफ़ी नहीं। आपको **quantum Fourier transform (QFT)** चाहिए: विज्ञान और engineering के सबसे काम के औज़ारों में से एक का quantum रूप।

यह पाठ समझाता है कि Fourier transform क्या करता है, QFT परिभाषित करता है, दिखाता है कि n qubits पर इसे सिर्फ़ लगभग n² gates क्यों चाहिए, circuit बनाकर Qiskit से जाँचता है, और फिर वह गुण दिखाता है जो इसे Shor algorithm और phase estimation का इंजन बनाता है: **यह periodicity को तीखी, पढ़ी जा सकने वाली चोटियों में बदलता है।**

## Fourier transform: किसी signal में कौन-सी लय हैं?

Fourier transform नंबरों की एक सूची (signal) लेकर पूछता है: **यह किन दोहराए जाने वाले patterns (frequencies) से बना है?** 440 Hz और 660 Hz के दो सुरों से बनी आवाज़ की लहर, Fourier transform के बाद दो तेज़ चोटियाँ दिखाती है। आपका फ़ोन यह लगातार करता है: audio compression, Wi-Fi और 4G/5G signals, image compression (JPEG) और भी बहुत कुछ के लिए।

N नंबरों x₀, x₁, …, x_{N−1} की सूची के लिए **discrete Fourier transform (DFT)** N नए नंबर बनाता है:

> yₖ = (1/√N) Σⱼ xⱼ · ωʲᵏ,  जहाँ ω = e^(2πi/N)

ω पाठ 2 का N-th root of unity है: वृत्त पर 360°/N का एक क़दम। हर output yₖ पूछता है "input में से कितना हिस्सा वृत्त के चारों ओर k बार दोहराता है?", हर xⱼ को हर index पर k क़दम घुमाकर और जोड़कर। अगर input में वह लय है, तो घुमाए पद एक सीध में आकर जुड़ते हैं; नहीं तो वृत्त पर फैलकर कट जाते हैं (फिर से पाठ 2 के roots of unity)।

Matrix की तरह, N = 4 के लिए (जहाँ ω = i):

```python
import numpy as np
N = 4
w = np.exp(2j * np.pi / N)
F = np.array([[w ** (j * k) for k in range(N)] for j in range(N)]) / np.sqrt(N)
print(np.round(F * 2, 3) + 0)                          # times 2 to show the pattern of 1, i, -1, -i
print("unitary:", np.allclose(F.conj().T @ F, np.eye(N)))
```

```text
[[ 1.+0.j  1.+0.j  1.+0.j  1.+0.j]
 [ 1.+0.j  0.+1.j -1.+0.j  0.-1.j]
 [ 1.+0.j -1.+0.j  1.+0.j -1.+0.j]
 [ 1.+0.j  0.-1.j -1.+0.j  0.+1.j]]
unitary: True
```

Row k, वृत्त पर एक बार में k चौथाई-चक्कर घूमती है। और matrix **unitary** है (पाठ 4), तो यह quantum gate हो सकती है।

सीधे तरीके से, N नंबरों पर DFT में लगभग N² operations लगते हैं। **Fast Fourier transform (FFT)**, जिसे 1965 में Cooley और Tukey ने लोकप्रिय बनाया, इसे लगभग N·log₂N में करता है, और यह अब तक लिखे सबसे ज़रूरी algorithms में से है।

## Quantum Fourier transform

QFT **वही matrix** है, n qubits के **amplitudes** पर, N = 2ⁿ के साथ:

> **QFT |j⟩ = (1/√N) Σₖ ω^(jk) |k⟩**

तो एक आम state Σⱼ xⱼ|j⟩ बन जाती है Σₖ yₖ|k⟩: amplitudes का Fourier transform हो जाता है। एक qubit के लिए (N = 2, ω = −1), matrix (1/√2)[[1, 1], [1, −1]] है: **एक qubit पर QFT बस H है।** QFT, Hadamard को "XOR patterns" से "जोड़ patterns" तक बढ़ाता है।

### Product सूत्र: यह सस्ता क्यों है

QFT को कुशल बनाने वाला कमाल का तथ्य। j को binary में j₁j₂…jₙ लिखें, और **binary fraction** notation 0.j₁j₂…jₘ = j₁/2 + j₂/4 + … + jₘ/2ᵐ इस्तेमाल करें। तब किसी basis state का QFT एक **product state** है:

> QFT|j⟩ = (1/√2ⁿ) (|0⟩ + e^(2πi·0.jₙ)|1⟩) ⊗ (|0⟩ + e^(2πi·0.jₙ₋₁jₙ)|1⟩) ⊗ … ⊗ (|0⟩ + e^(2πi·0.j₁j₂…jₙ)|1⟩)

हर output qubit, |0⟩ और |1⟩ का बराबर superposition है, जिसका phase j के **आख़िरी कुछ bits** पर निर्भर है। (सबूत का विचार: e^(2πi·jk/2ⁿ), k के bits पर गुणनफल में टूटता है, और हर घातांक के पूर्णांक हिस्से हट जाते हैं क्योंकि e^(2πi·पूर्णांक) = 1।)

यह बताता है कि इसे कैसे बनाएँ:

- e^(2πi·0.jₙ) वाले output qubit को सिर्फ़ आख़िरी bit चाहिए: उस पर एक H।
- अगले को e^(2πi·0.jₙ₋₁jₙ) चाहिए: एक H, फिर अगले bit पर **controlled** 2π/4 का phase घुमाव।
- और ऐसे ही: हर qubit को एक H और फिर हर कम-महत्व वाले qubit से 2π/2ᵏ का controlled घुमाव।

यह n Hadamards और n(n − 1)/2 controlled phase gates हैं: कुल लगभग **n²/2 gates**, और अंत में कुछ swaps क्योंकि सूत्र qubits उल्टे क्रम में बनाता है।

### Circuit बनाना

यह textbook वाला निर्माण है, Qiskit के अपने `QFTGate` से जाँचा हुआ:

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.circuit.library import QFTGate
from qiskit.quantum_info import Operator

def qft(n):
    """The textbook QFT circuit: H and controlled phase rotations, then swaps to fix the order."""
    qc = QuantumCircuit(n)
    for j in reversed(range(n)):                 # start from the most significant qubit
        qc.h(j)
        for k in reversed(range(j)):
            qc.cp(np.pi / 2 ** (j - k), k, j)    # rotation by 2*pi / 2^(j-k+1)
    for i in range(n // 2):
        qc.swap(i, n - 1 - i)
    return qc

mine = qft(4)
print(mine.draw("text", fold=-1))
print("matches Qiskit's QFTGate:", Operator(mine).equiv(Operator(QFTGate(4))))
print("gates:", dict(mine.count_ops()))
```

```text
                                                                          ┌───┐   
q_0: ─────────────────────────────■─────────────────■─────────────■───────┤ H ├─X─
                                  │                 │       ┌───┐ │P(π/2) └───┘ │ 
q_1: ───────────────■─────────────┼────────■────────┼───────┤ H ├─■─────────X───┼─
                    │       ┌───┐ │        │P(π/2)  │P(π/4) └───┘           │   │ 
q_2: ──────■────────┼───────┤ H ├─┼────────■────────■───────────────────────X───┼─
     ┌───┐ │P(π/2)  │P(π/4) └───┘ │P(π/8)                                       │ 
q_3: ┤ H ├─■────────■─────────────■─────────────────────────────────────────────X─
     └───┘                                                                        
matches Qiskit's QFTGate: True
gates: {'cp': 6, 'h': 4, 'swap': 2}
```

Drawing पढ़ें: qubit 3 (सबसे महत्वपूर्ण) को एक H मिलता है, फिर qubits 2, 1 और 0 से π/2, π/4 और π/8 के controlled phases। फिर qubit 2 को एक H और दो controlled phases, वग़ैरह। अंत के swaps क्रम उलटते हैं। चार qubits को 4 + 6 = 10 gates चाहिए (और 2 swaps)।

### Exponential फ़र्क़, और शर्त

| Transform | Input | लागत |
|---|---|---|
| Classical FFT | N = 2ⁿ नंबर | ~N·log₂N = n·2ⁿ क़दम |
| Quantum QFT | 2ⁿ amplitudes वाले n qubits | ~n²/2 gates |

n = 50 qubits के लिए QFT को लगभग 1,250 gates चाहिए। 2⁵⁰ नंबरों पर FFT को लगभग 5 × 10¹⁶ क़दम। यह Fourier transforms के लिए exponential speed-up जैसा दिखता है।

**आम तौर पर ऐसा नहीं है।** दो समस्याएँ, दोनों पाठ 12 से जानी-पहचानी:

- **Loading:** अपने 2⁵⁰ नंबरों का Fourier transform करने के लिए पहले उन्हें amplitudes में डालना होगा, जिसमें लगभग 2⁵⁰ operations लगते हैं।
- **पढ़ना:** 2⁵⁰ output amplitudes पढ़े नहीं जा सकते। एक measurement एक k देता है, probability |yₖ|² से।

तो QFT आपकी audio files के लिए तेज़ FFT नहीं है। यह सिर्फ़ ऐसे algorithms के **अंदर** काम का है जहाँ input state गणना ख़ुद बनाती है और output से आपको बस एक नमूना चाहिए। Period ढूँढने में ठीक यही होता है।

## QFT किस काम का है: periods ढूँढना

मान लीजिए किसी गणना ने एक **periodic** state बनाई है: किसी offset x₀ से शुरू, हर r-वीं basis state का बराबर superposition:

> |ψ⟩ ∝ |x₀⟩ + |x₀ + r⟩ + |x₀ + 2r⟩ + …

Shor algorithm (पाठ 28) में ठीक यही होता है, जहाँ f(x) = aˣ mod N का output measure करने से input register ऐसी state में बचता है, एक **random** offset के साथ जिसे आप नियंत्रित नहीं कर सकते।

QFT लगाएँ। Output k का amplitude, m पर ω^(k·(x₀ + mr)) का जोड़ है। Offset एक साझा गुणक ω^(k·x₀) देता है, जो बस एक phase है। बाक़ी वृत्त पर ω^(kr) के क़दमों का जोड़ है: जब kr, N का गुणज हो तो वे **एक सीध में जुड़ते** हैं, और बाक़ी समय **कट जाते** हैं। तो:

> **QFT के बाद सिर्फ़ k ≈ N/r के गुणज वाले नतीजे संभावित हैं, offset चाहे जो हो।**

```python
import numpy as np
from qiskit.circuit.library import QFTGate
from qiskit.quantum_info import Statevector

n, N = 4, 16
for r, offset in [(4, 1), (4, 3), (5, 2)]:
    amps = np.zeros(N)
    amps[offset::r] = 1                            # |offset> + |offset + r> + |offset + 2r> + ...
    state = Statevector(amps / np.linalg.norm(amps)).evolve(QFTGate(n))
    p = state.probabilities()
    peaks = {k: round(float(p[k]), 3) for k in range(N) if p[k] > 0.05}
    print(f"period {r}, offset {offset}: peaks at {peaks}   (N/r = {N / r:.1f})")
```

```text
period 4, offset 1: peaks at {0: 0.25, 4: 0.25, 8: 0.25, 12: 0.25}   (N/r = 4.0)
period 4, offset 3: peaks at {0: 0.25, 4: 0.25, 8: 0.25, 12: 0.25}   (N/r = 4.0)
period 5, offset 2: peaks at {0: 0.188, 3: 0.169, 6: 0.121, 7: 0.065, 9: 0.065, 10: 0.121, 13: 0.169}   (N/r = 3.2)
```

तीन बातें देखें:

1. Period 4 के साथ (जो 16 को बाँटता है), output ठीक 0, 4, 8 या 12 है: N/r = 4 के गुणज। एक बार measure करें, और k/N, 1/r का गुणज है।
2. **Offset मायने नहीं रखता।** Offsets 1 और 3 बिल्कुल एक जैसी probabilities देते हैं। QFT ने random हिस्सा फेंककर सिर्फ़ period रखा, ठीक जैसे Simon algorithm में Hadamards ने किया था।
3. Period 5 के साथ (जो 16 को नहीं बाँटता), चोटियाँ धुँधली हैं लेकिन 3.2 के गुणजों के पास इकट्ठी हैं: 0, 3, 6–7, 9–10, 13। Shor algorithm इसे ज़्यादा qubits (तीखी चोटियाँ) और **continued fractions** नाम के classical क़दम से संभालता है, जो k/N को r हर वाली सबसे पास की आसान fraction में बदलता है (पाठ 28)।

## उल्टा चलाना: phases पढ़ना

QFT, |j⟩ को ऐसे qubits के गुणनफल में बदलता है जिनके phases में j छिपा है। इसे **उल्टा** चलाएँ (inverse QFT, QFT†), तो ऐसा register जिसके qubits के phases e^(2πi·φ), e^(2πi·2φ), e^(2πi·4φ), … हों, φ के binary अंक बन जाता है। यह **quantum phase estimation** (पाठ 27) का आख़िरी क़दम है: यह phase को, जिसे सीधे नापा नहीं जा सकता, पढ़े जा सकने वाले bits में बदलता है। Shor algorithm, quantum chemistry और कई दूसरे algorithms QFT को ऐसे ही, phase-से-नंबर converter की तरह, इस्तेमाल करते हैं।

## Approximate QFT

घुमाव के कोण देखें: π/2, π/4, π/8, …, π/2ⁿ⁻¹। बड़े n के लिए इनमें से ज़्यादातर **बहुत छोटे** हैं। π/1024 का घुमाव लगभग कुछ नहीं बदलता, और असली हार्डवेयर पर यह जितनी ग़लती हटाता उससे ज़्यादा जोड़ता। 1994 में Don Coppersmith ने दिखाया कि दूर के qubits के बीच के घुमाव बस **हटाए** जा सकते हैं और सटीकता ऊँची रहती है। यह 10-qubit QFT है, सिर्फ़ पास के qubits के बीच के घुमाव रखकर:

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Operator, average_gate_fidelity

def qft(n, max_gap=None):
    """QFT circuit; with max_gap, skip the tiny rotations between qubits more than max_gap apart."""
    qc = QuantumCircuit(n)
    for j in reversed(range(n)):
        qc.h(j)
        for k in reversed(range(j)):
            if max_gap is None or j - k <= max_gap:
                qc.cp(np.pi / 2 ** (j - k), k, j)
    for i in range(n // 2):
        qc.swap(i, n - 1 - i)
    return qc

n = 10
exact = Operator(qft(n))
for gap in [1, 2, 3, 4, None]:
    approx = qft(n, gap)
    f = average_gate_fidelity(Operator(approx), exact)
    print(f"keep rotations up to gap {str(gap):4s}: {approx.count_ops()['cp']:2d} controlled phases, fidelity {f:.4f}")
```

```text
keep rotations up to gap 1   :  9 controlled phases, fidelity 0.1100
keep rotations up to gap 2   : 17 controlled phases, fidelity 0.6114
keep rotations up to gap 3   : 24 controlled phases, fidelity 0.9030
keep rotations up to gap 4   : 30 controlled phases, fidelity 0.9801
keep rotations up to gap None: 45 controlled phases, fidelity 1.0000
```

4 के अंतर तक के घुमाव रखने से (π/16 तक के कोण) 45 में से 30 controlled phases लगते हैं और फिर भी सटीक QFT से 98% fidelity से मेल खाता है। आम तौर पर लगभग 1/n कोण तक के घुमाव रखना काफ़ी है, जिससे gate गिनती लगभग **n·log n** हो जाती है। 2,048-bit नंबरों पर Shor algorithm के लिए यह बचत बहुत बड़ी है।

## ख़ुद करके देखें

1. एक qubit के लिए QFT matrix लिखें और जाँचें कि वह H के बराबर है।
2. Product सूत्र से दो qubits के लिए QFT|11⟩ लिखें (j₁ = 1, j₂ = 1)। संकेत: binary में 0.1 = ½ और 0.11 = ¾।
3. 20 qubits पर सटीक QFT को कितने controlled phase gates चाहिए?
4. 6 qubits (N = 64) की एक state का period 8 है। QFT कौन-से नतीजे दे सकता है?
5. Random offset x₀ output probabilities क्यों नहीं बदलता?
6. Music app में FFT तेज़ करने के लिए QFT क्यों इस्तेमाल नहीं हो सकता?

**जवाब:**

1. N = 2, ω = −1: (1/√2)[[1, 1], [1, −1]] = H।
2. (1/2)(|0⟩ + e^(2πi·½)|1⟩) ⊗ (|0⟩ + e^(2πi·¾)|1⟩) = ½(|0⟩ − |1⟩) ⊗ (|0⟩ − i|1⟩)।
3. 20 × 19 / 2 = **190**।
4. N/r = 64/8 = 8 के गुणज: **0, 8, 16, 24, 32, 40, 48, 56**, हर एक ⅛ probability से।
5. यह बस साझा गुणक ω^(k·x₀) देता है, आकार 1 का phase, जो |amplitude|² नहीं बदलता।
6. Audio samples को amplitudes में भरने में FFT जितनी ही लागत लगेगी, और हर run में सिर्फ़ एक random frequency पढ़ी जा सकेगी।

## सार

| विचार | सूत्र या तथ्य |
|---|---|
| DFT | yₖ = (1/√N) Σⱼ xⱼ ωʲᵏ, ω = e^(2πi/N) |
| FFT | ~N log N classical क़दम |
| QFT | \|j⟩ → (1/√N) Σₖ ω^(jk) \|k⟩, N = 2ⁿ |
| एक qubit | QFT = H |
| Product सूत्र | QFT\|j⟩ = ⊗ (\|0⟩ + e^(2πi·0.jₗ…jₙ)\|1⟩)/√2 |
| Circuit | H + controlled phases π/2, π/4, …, फिर swaps |
| लागत | n H + n(n − 1)/2 controlled phases ≈ n²/2 gates |
| Periodic input | Output की चोटियाँ N/r के गुणजों पर |
| Offset | सिर्फ़ phase; चोटियों पर असर नहीं |
| तेज़ FFT नहीं | Amplitudes भरना और पढ़ना ही रुकावट है |
| Inverse QFT | Phases को binary अंकों में बदलता है: phase estimation का अंत |
| Approximate QFT | छोटे घुमाव हटाओ: ~n log n gates, ऊँची fidelity |
| Qiskit | `QFTGate(n)`, `QFTGate(n).inverse()` |
