---
layout: ../../../layouts/Post.astro
lang: hi
title: "Oracles, Deutsch–Jozsa और Bernstein–Vazirani"
description: "Quantum algorithms कैसे नापे जाते हैं (oracle को queries), bit oracles और phase oracles, phase kickback, हाथ से हल किया Deutsch algorithm, पूरे गणित के साथ Deutsch–Jozsa और Bernstein–Vazirani, किसी भी function के लिए oracle, और इन पहले speed-ups पर ईमानदार नज़र।"
date: 2026-11-04
category: lesson
lesson: 22

---

भाग E quantum algorithms के बारे में है: वे क्या हैं, तेज़ क्यों हैं, और कहाँ नहीं हैं। यह पहला पाठ वह ढाँचा बनाता है जिसे आगे का हर algorithm इस्तेमाल करता है, और फिर अब तक मिले पहले तीन quantum algorithms हल करता है। ये बनावटी समस्याएँ हल करते हैं, लेकिन मूल तरीका किसी और चीज़ से ज़्यादा साफ़ दिखाते हैं: **जवाब को phases में डालो, फिर interference से phases को ऐसे measurement में बदलो जिसे पढ़ा जा सके।**

आपको पाठ 12 का कई qubits पर Hadamards वाला सूत्र और पाठ 13 का phase kickback चाहिए। दोनों जहाँ इस्तेमाल होते हैं, वहाँ दोहराए गए हैं।

## Quantum रफ़्तार कैसे नापी जाती है: queries

Quantum और classical कंप्यूटर की तुलना पेचीदा है: उनका हार्डवेयर बिल्कुल अलग है। इसलिए साफ़ तुलना के लिए researchers **query model** इस्तेमाल करते हैं।

एक black box सोचें, जिसे **oracle** कहते हैं, जो कोई function f निकालता है। आप अंदर नहीं देख सकते; सिर्फ़ inputs देकर outputs ले सकते हैं। Algorithm की लागत है **oracle को कितनी बार बुलाया** (**queries** की संख्या)। सवाल यह है: f के किसी गुण को जानने में कितनी queries लगती हैं?

यह बनावटी लगता है, लेकिन बिना क्रम वाले database में खोजने (पाठ 24) या किसी function का period ढूँढने (पाठ 28) का विश्लेषण ऐसे ही होता है: oracle समस्या का वह हिस्सा है जिसे सरल नहीं किया जा सकता, और बाक़ी सब ऊपरी ख़र्च है।

## Oracle बनाने के दो तरीके

Classical oracle x को f(x) में बदलता है। Quantum oracle को **reversible** होना चाहिए (पाठ 1), तो वह x को मिटा नहीं सकता। दो मानक रूप हैं।

**Bit oracle:** x रखो, और जवाब को एक अतिरिक्त target qubit में XOR करो:

> U_f |x⟩|y⟩ = |x⟩|y ⊕ f(x)⟩

Reversible classical logic ठीक ऐसे ही चलता है (CNOT, f(x) = x का bit oracle है)।

**Phase oracle:** x रखो, और जवाब एक चिह्न में डालो:

> O_f |x⟩ = (−1)^f(x) |x⟩

Phase oracle पहले बेकार लगता है: एक अकेली basis state पर चिह्न global phase है, अदृश्य। लेकिन **superposition** पर, अलग inputs को अलग चिह्न मिलते हैं: एक relative phase, जिसे interference पकड़ सकता है (पाठ 10)।

### Phase kickback एक को दूसरे में बदलता है

Bit oracle से phase oracle पाने के लिए target को |−⟩ = (|0⟩ − |1⟩)/√2 में रखें। देखें bit oracle क्या करता है:

- अगर f(x) = 0: target नहीं बदलता, |x⟩|−⟩।
- अगर f(x) = 1: target पलटता है। X|−⟩ = −|−⟩, तो −|x⟩|−⟩ मिलता है।

दोनों मिलाकर: **U_f |x⟩|−⟩ = (−1)^f(x) |x⟩|−⟩।** Target कभी नहीं बदलता; जवाब |x⟩ पर चिह्न बनकर "वापस किक" हो गया। यह पाठ 13 का phase kickback है, और यह classical logic से quantum interference तक का पुल है।

## Deutsch algorithm: पहला quantum speed-up

1985 में David Deutsch ने सबसे छोटा संभव सवाल पूछा। Function f एक bit से एक bit देता है। ऐसे चार functions हैं:

| f | f(0) | f(1) | प्रकार |
|---|---|---|---|
| f(x) = 0 | 0 | 0 | constant |
| f(x) = 1 | 1 | 1 | constant |
| f(x) = x | 0 | 1 | balanced |
| f(x) = NOT x | 1 | 0 | balanced |

**सवाल:** f constant है (दोनों inputs पर एक ही output) या balanced (अलग outputs)?

**Classically:** f(0) **और** f(1) दोनों निकालने पड़ते हैं। दो queries। एक जवाब दूसरे के बारे में कुछ नहीं बताता।

**Quantum में: एक query।** यह रहा circuit और पूरी गणना।

1. Input qubit |0⟩ में और target |1⟩ में शुरू करें। दोनों पर H: |+⟩|−⟩।
2. Oracle से एक बार पूछें। Phase kickback से input बन जाता है (1/√2)[(−1)^f(0)|0⟩ + (−1)^f(1)|1⟩], और target |−⟩ रहता है।
3. वह input state देखें। अगर f **constant** है, दोनों चिह्न एक जैसे हैं, तो यह ±|+⟩ है। अगर **balanced** है, चिह्न अलग हैं, तो ±|−⟩।
4. Input पर H लगाएँ: |+⟩ → |0⟩ और |−⟩ → |1⟩। Measure करें।

**नतीजा 0 मतलब constant; 1 मतलब balanced।** एक query के बाद, पक्का। Algorithm कभी f(0) या f(1) अलग-अलग नहीं जानता; वह सिर्फ़ उनके बीच का **रिश्ता** जानता है, और सवाल बस इतना ही पूछता था। हर quantum speed-up का सार यही है: f की सभी values निकाले बिना उसके बारे में कोई वैश्विक सवाल का जवाब देना।

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

# The four one-bit functions f: {0,1} -> {0,1}, as oracles |x>|y> -> |x>|y XOR f(x)>
def oracle(name):
    qc = QuantumCircuit(2)                 # qubit 0 = input x, qubit 1 = target y
    if name == "f(x)=1":
        qc.x(1)
    if name == "f(x)=x":
        qc.cx(0, 1)
    if name == "f(x)=NOT x":
        qc.cx(0, 1); qc.x(1)
    return qc                              # "f(x)=0" does nothing

for name in ["f(x)=0", "f(x)=1", "f(x)=x", "f(x)=NOT x"]:
    qc = QuantumCircuit(2)
    qc.x(1); qc.h([0, 1])                  # input |+>, target |->
    qc.compose(oracle(name), inplace=True) # ONE call to f
    qc.h(0)
    p1 = Statevector(qc).probabilities([0])[1]
    kind = "balanced" if p1 > 0.5 else "constant"
    print(f"{name:11s} -> input qubit reads {int(round(p1))}  ({kind})")
```

```text
f(x)=0      -> input qubit reads 0  (constant)
f(x)=1      -> input qubit reads 0  (constant)
f(x)=x      -> input qubit reads 1  (balanced)
f(x)=NOT x  -> input qubit reads 1  (balanced)
```

## Deutsch–Jozsa: 1 bit से n bits तक

1992 में Deutsch और Richard Jozsa ने इसे बड़ा किया। अब f, **n** bits से एक bit देता है, और आपको **वादा** किया गया है कि f या तो:

- **constant** है: सभी 2ⁿ inputs पर एक ही output, या
- **balanced** है: ठीक आधे inputs पर output 0 और बाक़ी आधे पर 1।

**Classically (पक्का):** सबसे बुरी हालत में balanced function के साथ बदक़िस्मती से पहले 2ⁿ⁻¹ inputs पर एक ही output दिख सकता है। पक्का होने के लिए **2ⁿ⁻¹ + 1** queries चाहिए। n = 50 के लिए यह 500 ख़रब से ज़्यादा है।

**Quantum में: एक query।** Circuit Deutsch वाला ही है, चौड़ा किया हुआ: सभी n inputs पर H, एक phase-oracle call, सभी n inputs पर H, measure।

### यह काम क्यों करता है

|0…0⟩ से शुरू करें। पहली H परत के बाद uniform superposition (पाठ 12):

> (1/√2ⁿ) Σ_x |x⟩

Phase oracle हर पद को (−1)^f(x) से गुणा करता है:

> (1/√2ⁿ) Σ_x (−1)^f(x) |x⟩

अब फिर H⊗ⁿ लगाएँ। हमें सिर्फ़ |0…0⟩ का amplitude चाहिए। पाठ 12 के सूत्र H⊗ⁿ|x⟩ = (1/√2ⁿ) Σ_y (−1)^(x·y) |y⟩ से, हर H⊗ⁿ|x⟩ का |0…0⟩ हिस्सा बस 1/√2ⁿ है (क्योंकि x·0 = 0)। तो:

> |0…0⟩ का amplitude = (1/2ⁿ) Σ_x (−1)^f(x)

यह **चिह्नों का औसत** है।

- **Constant f:** हर चिह्न एक जैसा, तो औसत ±1। **P(सब शून्य) = 1।**
- **Balanced f:** आधे चिह्न +1 और आधे −1, तो पूरी तरह कट जाते हैं। **P(सब शून्य) = 0।**

तो: **सब शून्य मिले तो constant; और कुछ भी मिले तो balanced।** यह एक साथ 2ⁿ amplitudes के बीच destructive interference है, पाठ 2 के roots of unity वाला ही तरीका।

### किसी भी function के लिए oracle

किसी भी function पर आज़माने के लिए किसी भी truth table का phase oracle चाहिए। एक आसान (कुशल नहीं) तरीका: f(x) = 1 वाले हर input x के लिए, सिर्फ़ |x⟩ पर −1 phase लगाओ। Multi-controlled phase gate यह |11…1⟩ के लिए करता है; पहले और बाद में X gates इसे किसी और |x⟩ पर ले जाते हैं।

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

def phase_oracle(truth_table):
    """Phase oracle for any f on n bits: multiplies |x> by (-1)^f(x). truth_table[x] = f(x)."""
    n = (len(truth_table) - 1).bit_length()
    qc = QuantumCircuit(n)
    for x, fx in enumerate(truth_table):
        if fx:
            zeros = [q for q in range(n) if not (x >> q) & 1]
            if zeros: qc.x(zeros)          # turn |x> into |11...1>
            qc.mcp(np.pi, list(range(n - 1)), n - 1)   # phase -1 on |11...1>
            if zeros: qc.x(zeros)          # undo
    return qc

def deutsch_jozsa(truth_table):
    n = (len(truth_table) - 1).bit_length()
    qc = QuantumCircuit(n)
    qc.h(range(n))
    qc.compose(phase_oracle(truth_table), inplace=True)
    qc.h(range(n))
    return round(float(Statevector(qc).probabilities()[0]), 3)    # chance of reading all zeros

print("constant 0      :", deutsch_jozsa([0] * 8))
print("constant 1      :", deutsch_jozsa([1] * 8))
print("balanced (x0)   :", deutsch_jozsa([x & 1 for x in range(8)]))
print("balanced (mixed):", deutsch_jozsa([1, 0, 1, 1, 0, 0, 1, 0]))
print("not promised    :", deutsch_jozsa([1, 0, 0, 0, 0, 0, 0, 0]))
```

```text
constant 0      : 1.0
constant 1      : 1.0
balanced (x0)   : 0.0
balanced (mixed): 0.0
not promised    : 0.562
```

Constant functions पक्का सब-शून्य देते हैं, balanced कभी नहीं। आख़िरी लाइन वादा तोड़ती है (सिर्फ़ एक input पर 1): चिह्नों का औसत (7 − 1)/8 = ¾ है, तो P = (¾)² = 0.5625, और algorithm साफ़ जवाब नहीं दे सकता। **वादा समस्या का हिस्सा है।**

## Bernstein–Vazirani: एक query में छिपी string पढ़ना

Ethan Bernstein और Umesh Vazirani (1993) ने यही circuit एक ज़्यादा काम के लगने वाले काम के लिए इस्तेमाल किया। एक छिपी n-bit string s है, और oracle निकालता है

> f(x) = s·x mod 2  (उन bits की parity जहाँ s और x दोनों में 1 हो)

**s ढूँढो।**

**Classically:** हर query एक bit जानकारी देती है, तो **n** queries चाहिए (s का पहला bit जानने के लिए x = 100…0, फिर 010…0, वग़ैरह)।

**Quantum में: एक query।** Oracle के बाद state (1/√2ⁿ) Σ_x (−1)^(s·x) |x⟩ है। पाठ 12 के सूत्र से मिलाएँ: यह **ठीक H⊗ⁿ|s⟩** है। क्योंकि H⊗ⁿ ख़ुद को उलटता है, आख़िरी H परत इसे |s⟩ बना देती है। Measure करने पर s मिलता है, पक्का।

यहाँ phase oracle बेहद आसान है: (−1)^(s·x), उन जगहों पर (−1)^(xᵢ) का गुणनफल है जहाँ sᵢ = 1, और वह बस **उन हर qubit पर एक Z gate** है।

```python
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler

def bernstein_vazirani(secret):
    """f(x) = s.x mod 2. Its phase oracle is just a Z on every qubit where s has a 1."""
    n = len(secret)
    qc = QuantumCircuit(n)
    qc.h(range(n))
    for i, bit in enumerate(reversed(secret)):   # Qiskit: qubit 0 is the rightmost bit
        if bit == "1":
            qc.z(i)                               # the oracle: (-1)^(s.x)
    qc.h(range(n))
    qc.measure_all()
    return StatevectorSampler(seed=1).run([qc], shots=100).result()[0].data.meas.get_counts()

for s in ["101", "1101", "10011010"]:
    print(s, "->", bernstein_vazirani(s))
```

```text
101 -> {'101': 100}
1101 -> {'1101': 100}
10011010 -> {'10011010': 100}
```

हर shot secret देता है। (देखें कि `reversed` Qiskit का bit क्रम कैसे संभालता है, पाठ 12।) पाठ 9 की identities में, हर qubit पर पूरा H–Z–H circuit बस HZH = X है, ठीक उन qubits पर जहाँ sᵢ = 1: यह s को सीधे लिख देता है।

## हर algorithm के पीछे का नुस्ख़ा

तीनों algorithms एक ही चार क़दम मानते हैं, और भाग E का बाक़ी सब भी:

1. **Superpose:** Hadamards, input register को सभी inputs के superposition में डालते हैं।
2. **Query:** Oracle, function की values को phase kickback से **phases** में लिखता है।
3. **Interfere:** एक transform (यहाँ H⊗ⁿ; Shor algorithm में QFT) phases को जवाब पर जोड़ता है और बाक़ी जगह काटता है।
4. **Measure:** जवाब पढ़ो, अक्सर पक्का, कभी ऊँची probability से।

"जादू" पूरी तरह क़दम 3 में है। Interference के बिना, क़दम 2 बस f का एक random नमूना होता, classical से बेहतर नहीं।

## इन speed-ups पर ईमानदार टिप्पणी

| समस्या | Classical, पक्का | Classical, छोटी ग़लती की छूट | Quantum |
|---|---|---|---|
| Deutsch (n = 1) | 2 queries | 2 queries | 1 query |
| Deutsch–Jozsa | 2ⁿ⁻¹ + 1 queries | लगभग 10–20 queries | 1 query |
| Bernstein–Vazirani | n queries | n queries | 1 query |

बीच वाला column देखें। अगर classical algorithm को ग़लती की बहुत छोटी संभावना की छूट हो, तो Deutsch–Jozsa आसान हो जाता है: ~20 random inputs पूछो; सब मेल खाएँ तो "constant" कहो। Balanced function आपको सिर्फ़ 2⁻¹⁹ probability से धोखा देगा। तो exponential फ़र्क़ सिर्फ़ **सटीक** (शून्य-ग़लती) algorithms के लिए असली है। Bernstein–Vazirani ठोस speed-up देता है, लेकिन सिर्फ़ n से 1 तक, exponential नहीं।

व्यवहार में दोनों में से कोई समस्या मायने नहीं रखती। इनका महत्व ऐतिहासिक और वैचारिक है: इन्होंने साबित किया कि quantum computers एक सटीक model में classical को हरा **सकते** हैं, और वे औज़ार (oracles, phase kickback, Hadamard interference) दिए जिन्हें Simon algorithm (पाठ 23) ने पहले exponential speed-up में बदला, और Shor (पाठ 28) ने ऐसे algorithm में जो पूरी दुनिया के लिए मायने रखता है।

## ख़ुद करके देखें

1. Deutsch algorithm में f(x) = NOT x के लिए oracle के बाद की input state लिखें। चिह्न छोड़कर यह कौन-सी state है?
2. n = 10 के लिए Deutsch–Jozsa को पक्का होने के लिए कितनी classical queries चाहिए? कितनी quantum?
3. 3 bits का एक function inputs 000, 011, 101, 110 पर 1 देता है (बाक़ी पर 0)। क्या यह balanced है? Deutsch–Jozsa circuit क्या देता है?
4. s = 0110 वाले Bernstein–Vazirani में किन qubits पर Z gate लगता है (Qiskit नंबरिंग में)?
5. Bit oracle इस्तेमाल करते समय target qubit का |−⟩ से शुरू होना क्यों ज़रूरी है?
6. कोड का वादा-तोड़ने वाला function P(सब शून्य) = 0.5625 क्यों देता है?

**जवाब:**

1. (1/√2)[(−1)¹|0⟩ + (−1)⁰|1⟩] = (−|0⟩ + |1⟩)/√2 = −|−⟩। चिह्न छोड़कर |−⟩: **balanced**।
2. 2⁹ + 1 = **513** classical queries; **1** quantum query।
3. आठ में चार 1: **balanced**। यह तब 1 है जब x में 1s की संख्या सम हो, तो f(x) = 1 ⊕ (x₀ ⊕ x₁ ⊕ x₂) = 1 ⊕ s·x, s = 111 के साथ। अतिरिक्त "1 ⊕" बस हर चिह्न पलटता है, एक global phase। तो circuit ठीक **111** देता है, Bernstein–Vazirani से।
4. s = 0110 को q3 q2 q1 q0 = 0 1 1 0 पढ़ें, तो **qubits 1 और 2**।
5. क्योंकि X|−⟩ = −|−⟩: target पलटना एक चिह्न बन जाता है, जो input पर वापस किक होता है। |0⟩ के साथ target बस f(x) दर्ज करता और input से entangle हो जाता।
6. सात inputs चिह्न +1 देते हैं और एक −1। औसत 6/8 = ¾ है, और probability उसका वर्ग, 9/16 = 0.5625।

## सार

| विचार | सूत्र या तथ्य |
|---|---|
| Query model | लागत = oracle calls की संख्या |
| Bit oracle | \|x⟩\|y⟩ → \|x⟩\|y ⊕ f(x)⟩ |
| Phase oracle | \|x⟩ → (−1)^f(x)\|x⟩ |
| Phase kickback | \|−⟩ में target, bit oracle को phase oracle बनाता है |
| Deutsch | Constant या balanced, 1 bit: 1 query बनाम 2 |
| Deutsch–Jozsa | वादा: n bits पर constant या balanced; 1 query बनाम 2ⁿ⁻¹ + 1 (सटीक) |
| DJ मुख्य सूत्र | \|0…0⟩ का amplitude = (−1)^f(x) का औसत |
| DJ readout | सब शून्य ⇔ constant |
| Bernstein–Vazirani | f(x) = s·x; 1 query बनाम n; output s है |
| BV oracle | हर उस qubit पर Z जहाँ sᵢ = 1 |
| BV मुख्य तथ्य | Σ (−1)^(s·x)\|x⟩ = H⊗ⁿ\|s⟩ (गुणा √2ⁿ) |
| नुस्ख़ा | Superpose → query (phases) → interfere → measure |
| ईमानदार चेतावनी | छोटी classical ग़लती की छूट हो तो DJ का exponential फ़र्क़ ग़ायब |
