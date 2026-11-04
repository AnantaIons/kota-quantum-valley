---
layout: ../../../layouts/Post.astro
lang: hi
title: "Qubits और quantum states"
description: "Course का सबसे अहम विचार: qubit दो complex amplitudes का normalised vector है। Bits बनाम qubits, physical qubits जिनकी कल्पना कर सकें, kets और normalisation, amplitudes से probabilities, शुरू से लिखा एक छोटा qubit simulator, qubit सिर्फ़ random bit क्यों नहीं है (code में दिखाया), phase क्यों मायने रखता है लेकिन global phase नहीं, state space कितनी तेज़ी से बढ़ता है, और qubit असल में कितनी जानकारी रखता है।"
date: 2026-11-04
category: lesson
lesson: 6
---

Part A ने आपको औज़ार दिए: bits, complex संख्याएँ, vectors, matrices और probability। Part B इनसे quantum computing की केंद्रीय चीज़ बनाता है, **qubit**। यह पाठ ठीक-ठीक बताता है कि qubit की state क्या है, वह bit से (और random bit से) कैसे अलग है, और आप उससे क्या सीख सकते हैं और क्या नहीं। पाठ 7 से 11 फिर qubit को विस्तार से देखते हैं: उसकी ज्यामिति, measurement, gates, phase और rotations।

याद रखने लायक़ एक विचार: **qubit की state दो complex संख्याओं का vector है, जिसकी कुल squared लंबाई 1 है।** बाक़ी सब इसी से निकलता है।

## Bits और qubits

Classical **bit** या तो 0 है या 1। आप उसे जितनी बार चाहें पढ़ सकते हैं, और पढ़ना उसे नहीं बदलता। एक **random** bit भी, जैसे सिक्का उछालने का नतीजा जो आपने अभी नहीं देखा, असल में एक state में या दूसरी में है; बस आपको पता नहीं कौन-सी।

**Qubit** दो अलग पहचानी जा सकने वाली basis states वाला physical system है, Dirac के **ket** संकेतन (पाठ 3) में लिखा:

- **|0⟩** ("ket zero") और **|1⟩** ("ket one")।

Bit के उलट, qubit दोनों के **superposition** में हो सकता है:

> |ψ⟩ = α|0⟩ + β|1⟩

जहाँ α और β **complex संख्याएँ** हैं जिन्हें **amplitudes** कहते हैं। Column vector के रूप में |0⟩ = (1, 0), |1⟩ = (0, 1), और |ψ⟩ = (α, β)।

### Qubits जिनकी कल्पना कर सकें

पाठ 37 असली hardware देखता है, लेकिन तीन उदाहरण अभी मदद करते हैं:

- **Photon का polarisation:** |0⟩ = horizontal, |1⟩ = vertical। 45° पर polarised प्रकाश superposition (|0⟩ + |1⟩)/√2 है, और 0° पर रखा polarising filter उसे आधे समय गुज़रने देता है।
- Magnetic field में **electron का spin:** |0⟩ = spin up, |1⟩ = spin down। 1922 में Stern–Gerlach प्रयोग ने पाया कि silver atoms की किरण ठीक **दो** धब्बों में बँटती है, फैलाव में नहीं: दो-state quantum system की पहली झलक।
- **किसी atom या superconducting circuit के दो सबसे निचले energy levels**, जिनमें ज़्यादातर quantum computers qubits रखते हैं (पाठ 37 से 39)।

हर मामले में "0" और "1" दो पूरी तरह अलग पहचानी जा सकने वाली physical स्थितियाँ हैं, और qubit उनके superposition में हो सकता है।

## State के नियम

तीन नियम qubit की state परिभाषित करते हैं। ये याद रखने लायक़ हैं।

1. **State:** complex entries वाला vector |ψ⟩ = (α, β)।
2. **Normalisation:** |α|² + |β|² = 1। Vector की लंबाई 1 है।
3. **Measurement (Born नियम, पाठ 8):** {|0⟩, |1⟩} basis में measure करने पर probability |α|² से 0 और |β|² से 1 मिलता है। उसके बाद qubit वही state **है** जो measure हुई: |0⟩ या |1⟩।

Normalisation बस नियम 3 को सुसंगत बनाना है: दोनों probabilities का जोड़ 1 होना चाहिए। याद रखें कि |α|² का मतलब complex संख्या का **squared परिमाण** है: α = a + bi के लिए |α|² = a² + b² (पाठ 2)।

### शुरू से एक qubit simulator

साधारण computer पर qubit simulate करने के लिए ये नियम काफ़ी हैं। यहाँ NumPy की कुछ पंक्तियों में पूरा simulator है: state normalise करो, उसकी probabilities निकालो, और measurements के नमूने लो:

```python
import numpy as np
rng = np.random.default_rng(6)

def normalise(amplitudes):
    v = np.array(amplitudes, dtype=complex)
    return v / np.linalg.norm(v)                 # make |α|² + |β|² = 1

def probabilities(state):
    return np.abs(state) ** 2

def measure(state, shots):
    """Sample measurement results: 0 with probability |α|², 1 with probability |β|²."""
    return np.bincount(rng.choice(2, size=shots, p=probabilities(state)), minlength=2)

psi = normalise([2, 1j])                         # unnormalised (2, i) → (2, i)/√5
print("state:        ", np.round(psi, 4))
print("probabilities:", np.round(probabilities(psi), 4), " sum =", probabilities(psi).sum().round(10))
print("1000 shots:   ", measure(psi, 1000))
```

```text
state:         [0.8944+0.j     0.    +0.4472j]
probabilities: [0.8 0.2]  sum = 1.0
1000 shots:    [785 215]
```

बिना normalise की जोड़ी (2, i) बनी (2/√5, i/√5): probabilities 0.8 और 0.2, जिनका जोड़ 1 है। हज़ार simulated measurements ने 785 zeros और 215 ones दिए, अपेक्षित 800 और 200 के पास, सामान्य सांख्यिकीय बिखराव के साथ (पाठ 20)। ध्यान दें कि दूसरा amplitude **imaginary** है, फिर भी उसकी probability बिल्कुल साधारण है: |i/√5|² = 1/5।

हर quantum simulator, Qiskit का भी, ठीक इसी विचार का कहीं ज़्यादा कुशल रूप है।

## Qubit सिर्फ़ random bit नहीं है

यह सोचना लुभाता है कि (|0⟩ + |1⟩)/√2 में qubit "छिपे तौर पर 0 या 1 है, बस हमें पता नहीं कौन", जैसे कप के नीचे सिक्का। यह ग़लत है, और इसे सटीक तरह से देखने का तरीका यह है।

Random bit **probabilities** से बताया जाता है, और उस पर operations probabilities की matrices हैं (हर column का जोड़ 1)। Qubit **amplitudes** से बताया जाता है, और operations **unitary** matrices हैं (पाठ 4)। दो बार लगाए "fair coin flip" की तुलना दो बार लगाए Hadamard gate से करें:

```python
import numpy as np

# A classical random bit: a "fair coin flip" gate is a matrix of probabilities (each column sums to 1)
coin_flip = np.array([[0.5, 0.5],
                      [0.5, 0.5]])
p = np.array([1.0, 0.0])                       # start certainly 0
print("random bit, flipped once: ", coin_flip @ p)
print("random bit, flipped twice:", coin_flip @ coin_flip @ p)

# A qubit: the Hadamard gate acts on amplitudes, which can be negative
H = np.array([[1, 1],
              [1, -1]]) / np.sqrt(2)
a = np.array([1.0, 0.0])                       # start in |0⟩
once, twice = H @ a, H @ H @ a
print("\nqubit after one H:  amplitudes", np.round(once, 4), " probabilities", np.round(once ** 2, 4))
print("qubit after two Hs: amplitudes", np.round(twice, 4) + 0.0, " probabilities", np.round(twice ** 2, 4) + 0.0)
```

```text
random bit, flipped once:  [0.5 0.5]
random bit, flipped twice: [0.5 0.5]

qubit after one H:  amplitudes [0.7071 0.7071]  probabilities [0.5 0.5]
qubit after two Hs: amplitudes [1. 0.]  probabilities [1. 0.]
```

एक बार सिक्का उछालने से 50/50 मिलता है, और एक H से भी: अब तक दोनों एक जैसे दिखते हैं। लेकिन सिक्का दो बार उछालने पर भी 50/50 मिलता है, जबकि H दो बार लगाने से qubit **निश्चित रूप से** |0⟩ पर लौट आता है। दूसरे H में |1⟩ तक जाने वाले दो रास्तों के amplitudes +½ और −½ हैं, और वे **कट जाते** हैं; |0⟩ तक के दो रास्तों के +½ और +½ हैं, और वे **जुड़ जाते** हैं। यह **interference** है, और probabilities के साथ असंभव है, जो कभी negative नहीं होतीं।

यही quantum computing का दिल है: algorithms amplitudes को ऐसे सजाते हैं कि ग़लत जवाबों के रास्ते कट जाएँ और सही जवाबों के रास्ते मज़बूत हों (पाठ 22 से 28)।

## Phase मायने रखता है, global phase नहीं

क्योंकि amplitudes complex हैं, हर एक का परिमाण और **phase** (एक कोण, पाठ 2) होता है। दो क़िस्म के phase बहुत अलग बर्ताव करते हैं:

- |0⟩ और |1⟩ हिस्सों के बीच **relative phase**, जैसे |+⟩ = (|0⟩ + |1⟩)/√2 बनाम |−⟩ = (|0⟩ − |1⟩)/√2, physical है। यह सीधे 0 या 1 measure करने की probabilities नहीं बदलता, लेकिन आगे के gates के बाद क्या होता है वह बदलता है।
- **Global phase**, पूरी state को एक ही e^(iθ) से गुणा करना, कुछ भी नहीं बदलता: gates के किसी भी क्रम के बाद हर probability वही रहती है।

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

def show(state):
    return {str(k): round(float(v), 4) for k, v in state.probabilities_dict().items() if v > 1e-9}

plus = Statevector([1, 1] / np.sqrt(2))          # |+⟩ = (|0⟩ + |1⟩)/√2
minus = Statevector([1, -1] / np.sqrt(2))        # |−⟩ = (|0⟩ − |1⟩)/√2
print("measured directly:  |+⟩ →", show(plus), "   |−⟩ →", show(minus))

h = QuantumCircuit(1); h.h(0)
print("after an H gate:    |+⟩ →", show(plus.evolve(h)), "           |−⟩ →", show(minus.evolve(h)))

# A global phase (multiplying the whole state by e^(iθ)) changes nothing measurable
shifted = Statevector(np.exp(0.7j) * plus.data)
print("\n|+⟩ and e^(0.7i)|+⟩ are physically the same state:", shifted.equiv(plus))
print("|+⟩ and |−⟩ are physically the same state:        ", minus.equiv(plus))
```

```text
measured directly:  |+⟩ → {'0': 0.5, '1': 0.5}    |−⟩ → {'0': 0.5, '1': 0.5}
after an H gate:    |+⟩ → {'0': 1.0}            |−⟩ → {'1': 1.0}

|+⟩ and e^(0.7i)|+⟩ are physically the same state: True
|+⟩ and |−⟩ are physically the same state:         False
```

|+⟩ और |−⟩ सीधे measure करने पर एक जैसे 50/50 आँकड़े देते हैं। एक Hadamard के बाद वे |0⟩ और |1⟩ बन जाते हैं, पूरी तरह अलग पहचाने जा सकने वाले। इस बीच e^(0.7i)|+⟩ ठीक वही physical state है जो |+⟩ है। पाठ 10 phase को गहराई से देखता है।

क्योंकि global phase मायने नहीं रखता और state normalised है, qubit की state में बस **दो real parameters** हैं, चार नहीं। इसी से हर qubit state को एक गोले पर बिंदु के रूप में दिखाया जा सकता है, पाठ 7 का **Bloch sphere**।

## कई qubits: state space फट पड़ता है

n qubits के लिए state सभी 2ⁿ bitstrings पर एक vector है: |00…0⟩, |00…1⟩, …, |11…1⟩, हर एक पर एक complex amplitude (पाठ 12)। उस vector को classical computer पर रखना जल्दी असंभव हो जाता है:

```python
print("qubits   amplitudes        memory to store them (16 bytes each)")
for n in [10, 20, 30, 40, 50, 60]:
    size = 16 * 2 ** n
    for unit, scale in [("EB", 1e18), ("PB", 1e15), ("TB", 1e12), ("GB", 1e9), ("MB", 1e6), ("KB", 1e3)]:
        if size >= scale:
            break
    print(f"{n:4d}   {2 ** n:20,d}   {size / scale:8.1f} {unit}")
```

```text
qubits   amplitudes        memory to store them (16 bytes each)
  10                  1,024       16.4 KB
  20              1,048,576       16.8 MB
  30          1,073,741,824       17.2 GB
  40      1,099,511,627,776       17.6 TB
  50   1,125,899,906,842,624       18.0 PB
  60   1,152,921,504,606,846,976       18.4 EB
```

तीस qubits को लगभग 17 GB चाहिए, जो अच्छे workstation में समा जाता है। चालीस को 17.6 TB चाहिए, जिसके लिए supercomputer चाहिए। पचास को 18 petabytes चाहिए, धरती की लगभग किसी भी machine की memory से परे। हर अतिरिक्त qubit memory **दोगुनी** करता है। इसीलिए quantum systems simulate करना कठिन है, और इसीलिए Richard Feynman ने 1981 में सुझाया कि प्रकृति को simulate करने के लिए शायद ऐसे computers चाहिए जो ख़ुद quantum हों (पाठ 29)।

## Qubit कितनी जानकारी रखता है?

अगर qubit की state में दो continuous real parameters हैं, तो क्या वह अनंत bits रख सकता है? नहीं, और यह field के सबसे अहम तथ्यों में से एक है।

**Holevo का प्रमेय** (1973) कहता है कि n qubits उन्हें measure करने वाले को ज़्यादा से ज़्यादा **n bits** classical जानकारी दे सकते हैं। आप α और β पढ़ नहीं सकते: एक measurement एक bit देता है और superposition नष्ट कर देता है। α और β का अनुमान लगाने के लिए state की कई प्रतियाँ चाहिए (पाठ 8), और अनजान state copy नहीं हो सकती (पाठ 16)।

तो qubits की ताक़त ज़्यादा data रखने से नहीं आती। वह इससे आती है कि गणना के दौरान, आख़िर के एक measurement से पहले, **amplitudes कैसे मिलते और interfere करते** हैं। पाठ 31 असली quantum speed-ups को मिथकों से अलग करते समय इस बात पर लौटता है।

## चार बड़े विचार

1. **Superposition:** एक से ज़्यादा basis states पर non-zero amplitudes वाली state।
2. **Measurement:** एक नतीजा देता है, probability |amplitude|² से, और qubit को उसी नतीजे में छोड़ता है।
3. **Interference:** amplitudes जुड़ते या कटते हैं; algorithms इससे ग़लत जवाब दबाते हैं।
4. **Entanglement:** कई qubits एक ऐसी state साझा करते हैं जिसे हर एक की अलग states में नहीं तोड़ा जा सकता (पाठ 14)।

## आज़माकर देखें

1. एक qubit (√3/2)|0⟩ + (1/2)|1⟩ में है। P(0) और P(1) क्या हैं?
2. Vector (1, 1 + i) normalise करें। P(1) क्या है?
3. क्या (0.6, 0.8i) वैध qubit state है? और (0.6, 0.6)?
4. Coin-बनाम-qubit code में H दो बार लगाने से निश्चित रूप से |0⟩ क्यों मिलता है, जबकि सिक्का दो बार उछालने से 50/50?
5. |ψ⟩ = (|0⟩ + i|1⟩)/√2। P(0) और P(1) क्या हैं? क्या यह |+⟩ वाली physical state ही है?
6. 35-qubit state vector को कितनी memory चाहिए (हर amplitude 16 bytes)?
7. अगर qubit की state में दो real parameters हैं, तो एक qubit में पूरी किताब क्यों नहीं रख सकते?

**जवाब:**

1. P(0) = 3/4 = **0.75**, P(1) = 1/4 = **0.25**।
2. लंबाई² = 1 + |1 + i|² = 1 + 2 = 3, तो state (1, 1 + i)/√3 है, और P(1) = 2/3 ≈ **0.667**।
3. (0.6, 0.8i): 0.36 + 0.64 = 1, तो **हाँ**। (0.6, 0.6): 0.36 + 0.36 = 0.72, तो **नहीं** (normalise करना होगा)।
4. Amplitudes negative हो सकते हैं: |1⟩ के दो रास्ते +½ और −½ देते हैं और कट जाते हैं, जबकि |0⟩ के रास्ते जुड़कर 1 बनते हैं। Probabilities कभी negative नहीं होतीं, तो सिक्के के रास्ते कट नहीं सकते।
5. P(0) = P(1) = **½**। यह |+⟩ वाली state **नहीं** है: relative phase 1 के बजाय i है। आगे के gates के बाद वे अलग होती हैं (जैसे Y basis में measure करना उन्हें अलग कर देता है)।
6. 16 × 2³⁵ ≈ 5.5 × 10¹¹ bytes ≈ **550 GB**।
7. Holevo का प्रमेय: एक qubit measure होने पर ज़्यादा से ज़्यादा एक classical bit दे सकता है। आप amplitudes पढ़ नहीं सकते, और कई बार measure करने के लिए state copy नहीं कर सकते।

## सार-सूत्र

| विचार | सूत्र या तथ्य |
|---|---|
| Basis states | \|0⟩ = (1, 0), \|1⟩ = (0, 1) |
| Qubit state | \|ψ⟩ = α\|0⟩ + β\|1⟩ = (α, β), α और β complex |
| Normalisation | \|α\|² + \|β\|² = 1 |
| Born नियम | P(0) = \|α\|², P(1) = \|β\|²; फिर qubit नतीजा बन जाता है |
| Random bit बनाम qubit | Probabilities कट नहीं सकतीं; amplitudes कट सकते हैं (interference) |
| H दो बार | H·H = I: interference से superposition और वापस |
| Relative phase | Physical: \|+⟩ ≠ \|−⟩ |
| Global phase | Unphysical: e^(iθ)\|ψ⟩ ≡ \|ψ⟩ |
| Parameters | हर qubit पर 2 real संख्याएँ → Bloch sphere (पाठ 7) |
| n qubits | 2ⁿ amplitudes; हर qubit पर memory दोगुनी |
| Holevo सीमा | n qubits ज़्यादा से ज़्यादा n classical bits देते हैं |
| चार बड़े विचार | Superposition, measurement, interference, entanglement |
