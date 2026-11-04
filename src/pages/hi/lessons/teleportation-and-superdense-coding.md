---
layout: ../../../layouts/Post.astro
lang: hi
title: "Teleportation और superdense coding"
description: "वे दो protocols जो दिखाते हैं कि entanglement की क़ीमत क्या है। Bell basis और Bell measurement, teleportation क़दम-दर-क़दम निकाला गया और mid-circuit measurement व feed-forward वाले असली dynamic circuit के रूप में चलाया गया, यह प्रकाश से तेज़ कुछ क्यों नहीं भेज सकता, ख़ुद entanglement को teleport करना, साझा pair कितना अच्छा हो कि classical तरीकों को हराए, perfect और noisy pairs के साथ superdense coding, दोनों protocols सबसे अच्छे क्यों हैं, ऐतिहासिक प्रयोग, और teleportation कहाँ इस्तेमाल होता है।"
date: 2026-11-04
category: lesson
lesson: 21
---

Entanglement (पाठ 14) एक अजीब correlation से कहीं ज़्यादा है। यह एक **संसाधन** है: ऐसी चीज़ जिसे आप पहले से बना सकते हैं, सँभालकर रख सकते हैं, और फिर किसी ऐसे काम पर **ख़र्च** कर सकते हैं जो वरना असंभव होता। इस संसाधन की इकाई एक साझा Bell pair है, जिसे **ebit** कहते हैं।

यह पाठ एक ebit ख़र्च करने के दो क्लासिक तरीके दिखाता है, जो 1992 और 1993 में खोजे गए:

- **Teleportation:** 1 ebit + 2 classical bits → 1 qubit पहुँचाना।
- **Superdense coding:** 1 ebit + 1 qubit → 2 classical bits पहुँचाना।

ये एक-दूसरे के दर्पण-प्रतिबिंब हैं, और मिलकर ठीक-ठीक तय करते हैं कि entanglement, qubits और classical bits एक-दूसरे के बदले कैसे लेन-देन करते हैं। रास्ते में आप mid-circuit measurement और feed-forward (पाठ 19) को सचमुच इस्तेमाल करेंगे, और देखेंगे कि teleportation quantum networks और fault-tolerant computers में एक काम का औज़ार क्यों है, सिर्फ़ जादू का खेल नहीं।

## Bell basis और Bell measurement

दोनों protocols चार **Bell states** (पाठ 14) पर टिके हैं, दो qubits की अधिकतम entangled states:

> Φ+ = (|00⟩ + |11⟩)/√2   Φ− = (|00⟩ − |11⟩)/√2
> Ψ+ = (|01⟩ + |10⟩)/√2   Ψ− = (|01⟩ − |10⟩)/√2

ये एक-दूसरे के लंबवत (orthogonal) हैं, इसलिए मिलकर दो qubits के लिए एक **basis** बनाते हैं, **Bell basis**, ठीक वैसे ही जैसे |00⟩, |01⟩, |10⟩ और |11⟩। Circuit "पहले qubit पर H, फिर CNOT" हर साधारण basis state को एक अलग Bell state में बदलता है। इसे उलटा चलाने पर, "CNOT, फिर पहले qubit पर H", हर Bell state वापस एक साधारण basis state बन जाती है, जिसे फिर measure किया जा सकता है। वह उलटा circuit और एक सामान्य measurement मिलकर **Bell measurement** है: यह बताता है कि दो qubits चारों में से किस Bell state में हैं।

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

bell_circuit = QuantumCircuit(2)
bell_circuit.h(0); bell_circuit.cx(0, 1)          # makes a Bell state
bell_measure = QuantumCircuit(2)
bell_measure.cx(0, 1); bell_measure.h(0)          # the same steps reversed: a Bell measurement

def show(state):
    """Write a 2-qubit state as a sum of kets, qubit 0 first (left)."""
    terms = []
    for key, amp in sorted(state.to_dict().items(), key=lambda kv: kv[0][::-1]):
        if abs(amp) < 1e-9: continue
        sign = "−" if amp.real < 0 else "+"
        terms.append(f"{sign} |{key[::-1]}⟩")
    return "(" + " ".join(terms).lstrip("+ ") + ")/√2"

for start, name in [("00", "Φ+"), ("01", "Ψ+"), ("10", "Φ−"), ("11", "Ψ−")]:
    prep = QuantumCircuit(2)
    for q, bit in enumerate(start):
        if bit == "1": prep.x(q)
    bell = Statevector(prep.compose(bell_circuit))
    probs = bell.evolve(bell_measure).probabilities_dict()
    result = max(probs, key=probs.get)[::-1]
    print(f"|{start}⟩  →  {name} = {show(bell):22s}  →  Bell measurement gives {result} (prob {probs[result[::-1]]:.0f})")
```

```text
|00⟩  →  Φ+ = (|00⟩ + |11⟩)/√2        →  Bell measurement gives 00 (prob 1)
|01⟩  →  Ψ+ = (|01⟩ + |10⟩)/√2        →  Bell measurement gives 01 (prob 1)
|10⟩  →  Φ− = (|00⟩ − |11⟩)/√2        →  Bell measurement gives 10 (prob 1)
|11⟩  →  Ψ− = (|01⟩ − |10⟩)/√2        →  Bell measurement gives 11 (prob 1)
```

(इस output में kets qubit 0 को **बाईं** ओर रखकर लिखे गए हैं, जैसा किताबों में होता है।) हर Bell state निश्चितता के साथ एक अनोखे दो-bit नतीजे पर जाती है। पहला bit **चिह्न** दर्ज करता है (Φ+ और Ψ+ में plus है, Φ− और Ψ− में minus), और दूसरा **parity** (Φ states के bits बराबर हैं, Ψ states के अलग)।

## Teleportation

### समस्या

Alice के पास एक **अज्ञात** state |ψ⟩ = α|0⟩ + β|1⟩ में एक qubit है, और वह चाहती है कि दूर बैठे Bob के पास यह हो। वह इसे measure नहीं कर सकती, क्योंकि एक measurement एक bit देता है और α व β को नष्ट कर देता है (पाठ 8)। वह इसकी copy बनाकर नहीं भेज सकती (no-cloning, पाठ 16)। और शायद वह qubit ख़ुद भी न भेज पाए: fibres में photons खो जाते हैं, और किसी atom या chip में रखा qubit आसानी से हिलाया नहीं जा सकता।

वह जो कर सकती है, वह है पहले से Bob के साथ साझा किया गया एक Bell pair, और एक साधारण phone call इस्तेमाल करना।

### विधि

Qubits को नाम दें: q0 संदेश है, q1 Bell pair का Alice वाला आधा, और q2 Bob वाला आधा।

1. q1 और q2 पर **Bell pair** Φ+ पहले से **साझा करें**। Bob q2 अपने साथ ले जाता है।
2. **Alice q0 और q1 पर Bell measurement करती है:** q0 से q1 पर CNOT, q0 पर H, फिर दोनों को measure। उसे दो random bits मिलते हैं, m0 और m1।
3. **वह m0 और m1 Bob को भेजती है**, किसी भी साधारण चैनल से।
4. **Bob सुधारता है:** अगर m1 = 1 तो वह X लगाता है; फिर, अगर m0 = 1, तो Z लगाता है।

अब Bob का qubit ठीक |ψ⟩ है।

### यह क्यों काम करता है

तीन-qubit शुरुआती state |ψ⟩ ⊗ Φ+ को पूरा लिखें और Alice के दो qubits के लिए Bell basis से दोबारा समूहित करें। बीजगणित की कुछ पंक्तियाँ देती हैं

> |ψ⟩₀ Φ+₁₂ = ½ [ Φ+ (α|0⟩ + β|1⟩) + Ψ+ (β|0⟩ + α|1⟩) + Φ− (α|0⟩ − β|1⟩) + Ψ− (α|1⟩ − β|0⟩) ]

जहाँ हर Bell state Alice के qubits पर है और उसके बाद का कोष्ठक Bob का qubit है। यह कमाल की बात है: **किसी के कुछ करने से पहले ही** state में Alice के चारों संभव Bell नतीजों में से हर एक के लिए Bob के qubit में |ψ⟩ का एक रूप मौजूद है। Alice का Bell measurement बस एक पद को random चुनता है, हर एक ¼ probability के साथ, और उसके दो bits Bob को बताते हैं कि कौन-सा। हर रूप |ψ⟩ से एक ज्ञात Pauli, X, Z या दोनों, से अलग है, जिसे Bob उलट देता है।

आइए संदेश 0.6|0⟩ + 0.8i|1⟩ के लिए चारों शाखाएँ देखें:

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

alpha, beta = 0.6, 0.8j                       # the state to teleport: 0.6|0> + 0.8i|1>
qc = QuantumCircuit(3)                        # q0: Alice's message, q1: Alice's half, q2: Bob's half
qc.initialize([alpha, beta], 0)
qc.h(1); qc.cx(1, 2)                          # share a Bell pair
qc.cx(0, 1); qc.h(0)                          # Alice's Bell-measurement circuit (before measuring)
amp = Statevector(qc).data                    # index = q0 + 2*q1 + 4*q2

def ket(v):
    """Write (a, b) as 'a|0> + b|1>' with tidy complex numbers."""
    def num(z):
        z = complex(np.round(z, 3))
        return f"{z.real:g}" if z.imag == 0 else (f"{z.imag:g}i" if z.real == 0 else f"({z.real:g}{z.imag:+g}i)")
    return f"{num(v[0])}|0⟩ + {num(v[1])}|1⟩".replace("-", "−").replace("+ −", "− ")

X, Z = np.array([[0, 1], [1, 0]]), np.diag([1, -1])
fixes = {"nothing": np.eye(2), "X": X, "Z": Z, "X then Z": Z @ X}
for m0 in (0, 1):
    for m1 in (0, 1):
        bob = np.array([amp[m0 + 2 * m1], amp[m0 + 2 * m1 + 4]])       # Bob's part for this result
        p = np.vdot(bob, bob).real
        bob = bob / np.sqrt(p)
        fix = {(0, 0): "nothing", (0, 1): "X", (1, 0): "Z", (1, 1): "X then Z"}[(m0, m1)]
        fixed = fixes[fix] @ bob
        print(f"m0 m1 = {m0} {m1} (prob {p:.2f}): Bob has {ket(bob):17s} apply {fix:8s} -> {ket(fixed)}")
```

```text
m0 m1 = 0 0 (prob 0.25): Bob has 0.6|0⟩ + 0.8i|1⟩  apply nothing  -> 0.6|0⟩ + 0.8i|1⟩
m0 m1 = 0 1 (prob 0.25): Bob has 0.8i|0⟩ + 0.6|1⟩  apply X        -> 0.6|0⟩ + 0.8i|1⟩
m0 m1 = 1 0 (prob 0.25): Bob has 0.6|0⟩ − 0.8i|1⟩  apply Z        -> 0.6|0⟩ + 0.8i|1⟩
m0 m1 = 1 1 (prob 0.25): Bob has −0.8i|0⟩ + 0.6|1⟩ apply X then Z -> 0.6|0⟩ + 0.8i|1⟩
```

Alice के चारों नतीजे बराबर संभावित हैं, और हर मामले में Bob के qubit में α और β हैं, शायद अदला-बदला या चिह्न पलटा हुआ। सही सुधार सटीक संदेश लौटा देता है, complex phase i समेत, जिसे कोई measurement उजागर नहीं कर सकता था।

### असली protocol: measure, भेजें, सुधारें

असली hardware पर Alice का measurement circuit के बीच में होता है, और Bob के सुधार नतीजों पर निर्भर होते हैं। यह **feed-forward** वाला **dynamic circuit** है (पाठ 19): `if_test` कोई gate तभी लगाता है जब एक classical bit 1 हो। हम तीन random states teleport करते हैं और मापते हैं कि Bob का qubit हर एक से कितना मेल खाता है:

```python
import numpy as np
from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister
from qiskit.quantum_info import Statevector, state_fidelity, partial_trace
from qiskit_aer import AerSimulator

def teleport(theta, phi):
    q, m = QuantumRegister(3), ClassicalRegister(2)
    qc = QuantumCircuit(q, m)
    qc.u(theta, phi, 0, 0)                  # the message: any single-qubit state
    qc.h(1); qc.cx(1, 2)                    # Bell pair: q1 for Alice, q2 for Bob
    qc.cx(0, 1); qc.h(0)                    # Alice's Bell measurement ...
    qc.measure(0, m[0]); qc.measure(1, m[1])
    with qc.if_test((m[1], 1)): qc.x(2)     # ... two bits travel to Bob, who corrects
    with qc.if_test((m[0], 1)): qc.z(2)
    qc.save_density_matrix([2])             # Bob's qubit, averaged over all shots
    return qc

sim = AerSimulator()
rng = np.random.default_rng(4)
messages = [(rng.uniform(0, np.pi), rng.uniform(0, 2 * np.pi)) for _ in range(3)]
for k, (theta, phi) in enumerate(messages):
    target = QuantumCircuit(1); target.u(theta, phi, 0, 0)
    res = sim.run(teleport(theta, phi), shots=4000, seed_simulator=10**5 * (k + 1)).result()
    counts = dict(sorted(res.get_counts().items()))
    fid = state_fidelity(res.data()["density_matrix"], Statevector(target))
    print(f"θ = {theta:.2f}, φ = {phi:.2f}: Alice's results {counts}, Bob's fidelity {fid:.6f}")

print("\nBob's qubit before the two bits arrive (exact):")
for theta, phi in messages:
    qc = QuantumCircuit(3)
    qc.u(theta, phi, 0, 0); qc.h(1); qc.cx(1, 2); qc.cx(0, 1); qc.h(0)
    rho = partial_trace(Statevector(qc), [0, 1]).data
    print(f"  θ = {theta:.2f}, φ = {phi:.2f}: {(np.round(rho.real, 3) + 0).tolist()}")
```

```text
θ = 2.96, φ = 3.21: Alice's results {'00': 1009, '01': 976, '10': 975, '11': 1040}, Bob's fidelity 1.000000
θ = 3.07, φ = 0.51: Alice's results {'00': 985, '01': 1010, '10': 1015, '11': 990}, Bob's fidelity 1.000000
θ = 1.91, φ = 2.37: Alice's results {'00': 1003, '01': 1046, '10': 989, '11': 962}, Bob's fidelity 1.000000

Bob's qubit before the two bits arrive (exact):
  θ = 2.96, φ = 3.21: [[0.5, 0.0], [0.0, 0.5]]
  θ = 3.07, φ = 0.51: [[0.5, 0.0], [0.0, 0.5]]
  θ = 1.91, φ = 2.37: [[0.5, 0.0], [0.0, 0.5]]
```

हर संदेश के लिए Alice के चारों नतीजे लगभग बराबर बार आते हैं (Qiskit m1 को बाईं ओर छापता है), और Bob का qubit सभी 4,000 runs के औसत पर संदेश से **fidelity 1** के साथ मेल खाता है।

दूसरा हिस्सा यह समझने की कुंजी है कि teleportation प्रकाश से तेज़ क्यों नहीं है। दो bits पहुँचने से **पहले** Bob के qubit का density matrix ½·I है (पाठ 16): पूरी तरह random qubit, **हर संदेश के लिए एक जैसा**। Bob इसके साथ कुछ भी करे, |ψ⟩ के बारे में कुछ नहीं जान सकता। जानकारी तभी उपलब्ध होती है जब classical bits पहुँचते हैं, और वे प्रकाश से तेज़ नहीं चलते।

### Teleportation क्या है, और क्या नहीं

- **पदार्थ का परिवहन नहीं।** सिर्फ़ state चलती है। Bob का qubit हमेशा से Bob के पास था।
- **Copy बनाना नहीं।** Alice का measurement उसके मूल को नष्ट कर देता है, इसलिए किसी पल दो copies मौजूद नहीं होतीं, और no-cloning का सम्मान होता है।
- **प्रकाश से तेज़ नहीं।** दो bits के बिना Bob के पास एक random qubit है।
- **Classical संचार में महँगा नहीं।** दो लगातार (continuous) real संख्याओं से वर्णित state भेजने के लिए दो bits काफ़ी हैं। बाक़ी "जानकारी" मानो साझा entanglement में पहले से रखी थी।

### Entanglement को teleport करना

Teleportation किसी qubit की state को **दूसरे qubits के साथ उसके entanglement समेत** ले जाता है। मान लीजिए संदेश q0 ख़ुद एक reference qubit q3 के साथ Bell pair का आधा है, जो पीछे रहता है। q0 को Bob तक teleport करने के बाद q3 और Bob का q2 entangled हैं, जबकि वे कभी मिले ही नहीं। यह रूप Bob के सुधारों को measurements के बजाय controlled gates की तरह लिखता है; **deferred measurement principle** कहता है कि यह बराबर है (measure करके फिर gate को classically control करना वही नतीजा देता है जो उसे quantum रूप से control करके बाद में measure करना):

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, partial_trace, state_fidelity

# q3 is a "reference" qubit that stays with Alice's lab and never moves.
# The message q0 is half of a Bell pair with q3. Teleport q0 to Bob's q2.
qc = QuantumCircuit(4)
qc.h(3); qc.cx(3, 0)                       # message q0 entangled with reference q3
qc.h(1); qc.cx(1, 2)                       # teleportation Bell pair: q1 (Alice), q2 (Bob)
qc.cx(0, 1); qc.h(0)                       # Alice's Bell-measurement circuit
qc.cx(1, 2); qc.cz(0, 2)                   # corrections as controlled gates (deferred measurement)

pair = partial_trace(Statevector(qc), [0, 1])          # the reference q3 and Bob's q2
bell = QuantumCircuit(2); bell.h(1); bell.cx(1, 0)      # Bell state on (q2, q3), as qubits (0, 1)
print("fidelity of (Bob, reference) with a Bell pair:", round(state_fidelity(pair, Statevector(bell)), 6))
alice = partial_trace(Statevector(qc), [2, 3]).probabilities_dict()
print("Alice's two qubits afterwards:", {str(k): round(float(v), 3) for k, v in alice.items()})
```

```text
fidelity of (Bob, reference) with a Bell pair: 1.0
Alice's two qubits afterwards: {'00': 0.25, '01': 0.25, '10': 0.25, '11': 0.25}
```

Reference और Bob का qubit एक perfect Bell pair बनाते हैं, जबकि Alice के बचे qubits पूरी तरह random हैं और संदेश का कोई निशान नहीं रखते। यह **entanglement swapping** है, quantum repeater का बुनियादी operation, जिसे पाठ 42 entanglement को महाद्वीप भर में फैलाने के लिए इस्तेमाल करता है।

## साझा pair कितना अच्छा होना चाहिए?

असली Bell pairs अपूर्ण होते हैं। एक मानक model **Werner state** है: probability p के साथ perfect pair, और बाक़ी समय पूरी तरह random कचरा (½·I ⊗ ½·I)। आदर्श pair से इसका overlap, **Bell fidelity**, F = p + (1 − p)/4 है। ऐसे pair के साथ teleportation कितना अच्छा काम करता है?

एक अहम पैमाना है। बिना किसी entanglement के, Alice अपना qubit measure करके Bob को नतीजे का विवरण phone पर बता सकती है, और Bob वह state बना सकता है। Random अज्ञात संदेश के लिए ऐसी किसी भी **measure-and-prepare** रणनीति की सबसे अच्छी संभव औसत fidelity **2/3** है। Teleportation तभी करने लायक है जब यह 2/3 को हराए।

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import DensityMatrix, Statevector, partial_trace, state_fidelity

def noisy_pair(p):
    """Werner state on (q1, q2): a perfect Bell pair with probability p, random junk otherwise."""
    bell = QuantumCircuit(2); bell.h(0); bell.cx(0, 1)
    return p * DensityMatrix(bell) + (1 - p) * DensityMatrix(np.eye(4) / 4)

protocol = QuantumCircuit(3)
protocol.cx(0, 1); protocol.h(0)                # Alice's Bell measurement circuit
protocol.cx(1, 2); protocol.cz(0, 2)            # Bob's corrections (deferred measurement)

rng = np.random.default_rng(0)
messages = []
for _ in range(300):                            # random message states, spread over the Bloch sphere
    v = rng.normal(size=2) + 1j * rng.normal(size=2)
    messages.append(Statevector(v / np.linalg.norm(v)))

print("pair quality p   Bell fidelity F   teleport fidelity   formula (2F+1)/3")
for p in [1.0, 0.8, 0.5, 1 / 3, 0.0]:
    pair = noisy_pair(p)
    fids = []
    for msg in messages:
        rho = DensityMatrix(msg).expand(pair).evolve(protocol)      # q0 = message, q1 q2 = pair
        fids.append(state_fidelity(partial_trace(rho, [0, 1]), msg))
    F = p + (1 - p) / 4
    print(f"     {p:.2f}            {F:.3f}             {np.mean(fids):.3f}              {(2 * F + 1) / 3:.3f}")
print("best possible without entanglement (measure, then send a description): 2/3 = 0.667")
```

```text
pair quality p   Bell fidelity F   teleport fidelity   formula (2F+1)/3
     1.00            1.000             1.000              1.000
     0.80            0.850             0.900              0.900
     0.50            0.625             0.750              0.750
     0.33            0.500             0.667              0.667
     0.00            0.250             0.500              0.500
best possible without entanglement (measure, then send a description): 2/3 = 0.667
```

Simulation सूत्र **f = (2F + 1)/3** से ठीक मेल खाता है। Teleportation classical 2/3 को तभी हराता है जब Bell fidelity F **½** से ऊपर हो, जो Werner state के लिए p > 1/3 का मतलब है। प्रयोग इसी को परीक्षण मानते हैं कि असली quantum teleportation हुआ। बहुत noisy pairs को पहले **entanglement purification** (पाठ 42) से सुधारा जा सकता है, जो कई ख़राब pairs को गिनती में कम लेकिन अच्छे pairs में बदलता है।

## Superdense coding

अब विचार को उलटा चलाएँ। Alice Bob को **दो classical bits** भेजना चाहती है लेकिन सिर्फ़ **एक qubit** भेज सकती है। आम तौर पर एक qubit ज़्यादा से ज़्यादा एक bit ले जाता है (Holevo की सीमा, पाठ 16)। साझा Bell pair के साथ, वह दो ले जाता है।

1. Φ+ **Bell pair पहले से साझा करें**: Alice के पास q0, Bob के पास q1।
2. **Alice दो bits encode करती है**, सिर्फ़ **अपने qubit** पर काम करके: कुछ नहीं, X, Z, या X फिर Z।
3. **वह अपना qubit** Bob को भेजती है।
4. **Bob दोनों qubits पर Bell measurement करता है** और दो bits पढ़ता है।

यह इसलिए काम करता है कि Φ+ के सिर्फ़ एक आधे पर Pauli उसे बाक़ी Bell states में बदल देता है: X से Ψ+, Z से Φ−, और X फिर Z से Ψ−। चार orthogonal states को पूरी तरह अलग-अलग पहचाना जा सकता है, और Bell measurement ठीक यही करता है।

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler
from qiskit.quantum_info import DensityMatrix

bell = QuantumCircuit(2)
bell.h(0); bell.cx(0, 1)                   # the shared Bell pair: q0 Alice, q1 Bob

def encode_decode(message):
    """Alice encodes two bits on her qubit only; Bob then does a Bell measurement on both."""
    qc = QuantumCircuit(2)
    if message[0] == "1": qc.x(0)          # Qiskit order: the left bit is read from q1 ...
    if message[1] == "1": qc.z(0)          # ... and the right bit from q0
    qc.cx(0, 1); qc.h(0)                   # Alice's qubit has travelled to Bob: Bell measurement
    return qc

sampler = StatevectorSampler(seed=1)
for message in ["00", "01", "10", "11"]:
    qc = bell.compose(encode_decode(message))
    qc.measure_all()
    counts = sampler.run([qc], shots=1000).result()[0].data.meas.get_counts()
    print(f"Alice sends {message} -> Bob reads {counts}")

print()
for p in [1.0, 0.9, 0.5, 0.0]:             # an imperfect pair: perfect with probability p, junk otherwise
    pair = p * DensityMatrix(bell) + (1 - p) * DensityMatrix(np.eye(4) / 4)
    probs = pair.evolve(encode_decode("10")).probabilities_dict()
    print(f"pair quality {p}: Bob reads 10 correctly with probability {probs['10']:.3f}")
```

```text
Alice sends 00 -> Bob reads {'00': 1000}
Alice sends 01 -> Bob reads {'01': 1000}
Alice sends 10 -> Bob reads {'10': 1000}
Alice sends 11 -> Bob reads {'11': 1000}

pair quality 1.0: Bob reads 10 correctly with probability 1.000
pair quality 0.9: Bob reads 10 correctly with probability 0.925
pair quality 0.5: Bob reads 10 correctly with probability 0.625
pair quality 0.0: Bob reads 10 correctly with probability 0.250
```

हर संदेश 1,000 में से 1,000 बार सही पहुँचता है। अपूर्ण pair के साथ सफलता की probability Bell fidelity F = p + (1 − p)/4 के बराबर है: p = 0.9 के लिए 0.925, और pair कचरा हो तो 0.25 (चार संदेशों में शुद्ध अनुमान)।

ध्यान दें कि Alice का encoding **स्थानीय** है: वह Bob के qubit को कभी नहीं छूती। फिर भी वह चार global states में से चुनती है। और जो qubit वह भेजती है, अकेले में पूरी तरह random (½·I) है, इसलिए उसे बीच में पकड़ने वाला जासूस Bob के आधे के बिना कुछ नहीं जान पाता।

## विनिमय दर, और यह सबसे अच्छी क्यों है

दोनों protocols का सार दो **resource inequalities** में है:

> 1 ebit + 2 classical bits ≥ 1 qubit (teleportation)
> 1 ebit + 1 qubit ≥ 2 classical bits (superdense coding)

दोनों में से किसी को बेहतर नहीं किया जा सकता:

- **Superdense coding प्रति qubit 2 bits से ज़्यादा नहीं भेज सकता।** Holevo की सीमा (पाठ 16) दो qubits को, भेजा गया qubit और Bob का आधा, 2 bits तक सीमित करती है।
- **Teleportation 2 से कम bits से नहीं हो सकता।** मान लीजिए इसे सिर्फ़ 1 bit चाहिए होता। तब Alice superdense coding से Bob को 2 bits भेज सकती, लेकिन qubit इस सस्ते teleportation से पहुँचाकर: कुल मिलाकर 1 classical bit और 2 ebits 2 classical bits पहुँचा देते। तब साझा entanglement एक classical चैनल की क्षमता **बढ़ा** रहा होता, जिससे प्रकाश से तेज़ संकेत भेजना भी संभव हो जाता। ऐसा नहीं हो सकता, इसलिए 2 bits ज़रूरी हैं।

तो entanglement संचार की जगह नहीं ले सकता। लेकिन संचार के साथ मिलकर यह classical bits और qubits के बीच एक तय विनिमय दर पर आसानी से अदला-बदली करता है।

## ऐतिहासिक प्रयोग

- **1992–1993:** superdense coding (Bennett और Wiesner) और teleportation (Bennett, Brassard, Crépeau, Jozsa, Peres और Wootters) प्रस्तावित हुए।
- **1996:** Innsbruck में photons से superdense coding (Mattle, Weinfurter, Kwiat और Zeilinger)। सिर्फ़ दर्पणों और beam splitters से चार में से ज़्यादा से ज़्यादा दो Bell states भरोसे से पहचानी जा सकती हैं, इसलिए इस प्रयोग ने चार के बजाय तीन संदेश अलग किए, प्रति photon लगभग 1.58 bits।
- **1997–1998:** photons के साथ पहले teleportation प्रयोग, Innsbruck (Bouwmeester और साथी, Zeilinger का समूह) और Rome (Boschi और साथी, De Martini का समूह) में।
- **2012:** Canary Islands के La Palma और Tenerife के बीच खुली हवा में **143 km** तक teleportation।
- **2013:** ETH Zurich में superconducting chip पर feed-forward के साथ पूरी तरह निश्चित (deterministic) teleportation।
- **2014:** Delft में 3 मीटर दूर solid-state qubits (हीरे में spins) के बीच teleportation।
- **2017:** चीन के Micius satellite से लगभग **1,400 km** तक की दूरियों पर ज़मीन से satellite तक teleportation।
- **2022:** Delft में तीन-node quantum network के दो **ग़ैर-पड़ोसी** nodes के बीच teleportation, बीच वाले node से entanglement swapping के ज़रिए।

## Teleportation कहाँ इस्तेमाल होता है

- **Quantum networks।** खोए photons दोबारा नहीं भेजे जा सकते, इसलिए networks Bell pairs बाँटते और सँभालते हैं, फिर teleport करते हैं (पाठ 41 और 42)।
- **Modular quantum computers।** कई छोटे processors को photonic Bell pairs से जोड़कर, फिर उनके बीच qubits या gates teleport करना, आकार बढ़ाने की एक प्रमुख योजना है (पाठ 42)।
- **Gate teleportation** (Gottesman और Chuang, 1999)। थोड़ा बदला हुआ teleportation qubit को ले जाते हुए एक gate भी लगा देता है। Fault-tolerant computers इसका इस्तेमाल पहले से तैयार "magic states" ख़र्च करके, मुश्किल से सुरक्षित होने वाला T gate लगाने के लिए करते हैं (पाठ 35)।
- **Measurement-based quantum computing** (Raussendorf और Briegel, 2001)। एक बड़ी entangled "cluster state" बनाएँ, फिर सिर्फ़ single-qubit measurements और feed-forward से गणना करें: असल में teleportations की एक लंबी श्रृंखला। कई photonic quantum computing कंपनियाँ इसी model पर काम करती हैं।

## ख़ुद आज़माएँ

1. Bell basis वाले code के output से बताएँ: कौन-सी Bell state measurement नतीजा 10 देती है? दोनों bits में से हर एक क्या बताता है?
2. Teleportation के बीजगणित में, अगर Alice का नतीजा Ψ+ है, तो सुधार से पहले Bob के पास कौन-सी state है, और वह क्या लगाता है?
3. संदेश कुछ भी हो, Alice के चारों नतीजे बराबर संभावित क्यों हैं?
4. Bob को सिर्फ़ m1 मिलता है (m0 खो गया)। उसे क्या करना चाहिए, और अंत में उसके पास क्या होता है?
5. एक source p = 0.6 वाले Werner pairs बनाता है। Bell fidelity F क्या है, और औसत teleportation fidelity? क्या यह measure-and-prepare को हराता है?
6. Superdense coding में, Alice का qubit बीच में पकड़ने वाला जासूस संदेश क्यों नहीं जान सकता?
7. समझाएँ कि teleportation को 1 नहीं, 2 classical bits क्यों चाहिए।
8. [क्वांटम लैब](/hi/lab/) के circuit builder में संदेश 11 के लिए superdense-coding circuit बनाएँ (pair के लिए H और CNOT, फिर qubit 0 पर X और Z, फिर CNOT और H)। किस नतीजे की probability 1 है?

**जवाब:**

1. **Φ−**। पहला bit (1) बताता है कि चिह्न minus है; दूसरा (0) बताता है कि दोनों qubits के bits बराबर हैं।
2. Bob के पास **β|0⟩ + α|1⟩** है, amplitudes अदला-बदला हुआ संदेश। वह **X** लगाता है।
3. दोबारा समूहित state में हर Bell-basis पद का amplitude ½ गुणा Bob के qubit की एक normalised state है, इसलिए हर नतीजे की probability (½)² = ¼ है, α और β से स्वतंत्र। इसीलिए Alice के नतीजे संदेश के बारे में कुछ नहीं बताते।
4. m0 के बिना वह नहीं बता सकता कि Z चाहिए या नहीं। अगर m1 = 1 पर वह X लगाता है, तो उसके पास या तो |ψ⟩ है या Z|ψ⟩, हर एक आधी बार: एक मिश्रण जो |0⟩ और |1⟩ के बीच का relative phase खो देता है। दोनों bits के बिना teleportation नाकाम है।
5. F = 0.6 + 0.4/4 = **0.7**। Fidelity = (2 × 0.7 + 1)/3 = **0.8**, जो 2/3 को **हराती** है।
6. अकेले में Alice का qubit एक अधिकतम entangled pair का आधा है, इसलिए उसकी state ½·I है, चाहे उसने कुछ भी encode किया हो। Bob के qubit के बिना चारों संदेश एक जैसे दिखते हैं।
7. अगर 1 bit काफ़ी होता, तो उसे superdense coding के साथ मिलाकर सिर्फ़ 1 classical bit और साझा entanglement से 2 classical bits पहुँच जाते। Entanglement classical क्षमता नहीं बढ़ा सकता (वरना यह प्रकाश से तेज़ संकेत भेज सकता), इसलिए 2 bits ज़रूरी हैं।
8. नतीजा **11**, probability 1 के साथ: X फिर Z, Φ+ को Ψ− में बदलता है, और Bell measurement Ψ− को 11 पर ले जाता है।

## सार-पत्रक

| विचार | सूत्र या तथ्य |
|---|---|
| ebit | एक साझा Bell pair, एक ख़र्च करने योग्य संसाधन |
| Bell states | Φ± = (\|00⟩ ± \|11⟩)/√2, Ψ± = (\|01⟩ ± \|10⟩)/√2 |
| Bell measurement | CNOT, पहले qubit पर H, दोनों को measure: bits = (चिह्न, parity) |
| Teleportation | संदेश + Alice के आधे पर Bell measurement; 2 bits भेजें; Bob X^m1 फिर Z^m0 लगाता है |
| मुख्य सर्वसमिका | \|ψ⟩Φ+ = ½ Σ (Alice पर Bell state) ⊗ (Bob पर Pauli · \|ψ⟩) |
| Alice के नतीजे | हर एक ¼ probability के साथ, संदेश से स्वतंत्र |
| प्रकाश से तेज़ नहीं | Bits पहुँचने से पहले Bob का qubit हर संदेश के लिए ½·I है |
| No cloning | Alice का मूल नष्ट हो जाता है |
| Deferred measurement | Measure + classical control ≡ quantum control + बाद में measure |
| Entanglement swapping | Pair का आधा teleport करने से कभी न मिले qubits entangled हो जाते हैं (पाठ 42) |
| Noisy pairs | Teleportation fidelity f = (2F + 1)/3; classical 2/3 को तभी हराता है जब F > ½ |
| Superdense coding | Alice अपने आधे पर I, X, Z या XZ लगाती है; उसे भेजती है; Bob का Bell measurement 2 bits पढ़ता है |
| विनिमय दरें | 1 ebit + 2 bits ≥ 1 qubit; 1 ebit + 1 qubit ≥ 2 bits; दोनों सबसे अच्छी |
| उपयोग | Quantum networks, modular computers, gate teleportation (T gates), measurement-based computing |
