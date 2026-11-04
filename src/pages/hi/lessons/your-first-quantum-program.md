---
layout: ../../../layouts/Post.astro
lang: hi
title: "आपका पहला quantum program"
description: "Qiskit set up करें और पूरे quantum programs लिखें, हर लाइन समझाकर: हर quantum program का चार-क़दम वाला ढाँचा, superposition में एक qubit, measure करना और result object पढ़ना, counts पर error bars, एक Bell pair और उसके आँकड़े क्या दिखाते हैं, एक-qubit interferometer, Qiskit का bit क्रम, तीन ग़लतियाँ जो हर शुरुआती करता है, एक quantum पासा program, और असली hardware पर कैसे चलाएँ।"
date: 2026-11-04
category: lesson
lesson: 18
---

आपने qubits, gates, measurement और entanglement सीख लिए (पाठ 6 से 17), और रास्ते में छोटे snippets भी देखे। अब Qiskit ठीक से set up करके पूरे quantum programs लिखने की बारी है, हर लाइन की व्याख्या के साथ। अंत तक आप अपने computer पर छह programs चला चुके होंगे, एक quantum पासे समेत, और जान जाएँगे कि उनका output कैसे पढ़ें और आम जालों से कैसे बचें। फिर पाठ 19 Qiskit को गहराई से सिखाता है।

**क्या चाहिए:** Python 3.10 या नया, और लगभग 30 मिनट। पाठ 6 से 14 से आगे की फ़िज़िक्स नहीं।

**लैपटॉप नहीं है?** फ़ोन के browser में [Google Colab](https://colab.research.google.com/) खोलें, नई notebook बनाएँ और सब वहीं चलाएँ। यह मुफ़्त है और कुछ install नहीं करना पड़ता।

## Set up करना

### Qiskit install करें

Qiskit, IBM का मुफ़्त, open-source quantum programming toolkit है, और सबसे ज़्यादा इस्तेमाल होने वाला। इसे एक **virtual environment** में install करना अच्छी आदत है, यानी एक project के लिए packages का निजी folder, ताकि यह आपके computer पर किसी और चीज़ से न टकराए। Terminal में:

```bash
python3 -m venv qenv               # create the environment (once)
source qenv/bin/activate           # switch it on (on Windows: qenv\Scripts\activate)
pip install qiskit                 # install Qiskit into it
```

Colab में पहली दो लाइनें छोड़ दें और एक cell में `!pip install qiskit` चलाएँ। फिर जाँचें कि काम हुआ:

```python
import qiskit
print(qiskit.__version__)
```

```text
2.6.1
```

यह पाठ Qiskit **2.6.1** के साथ जाँचा गया। कोई भी 2.x version चलेगा।

**पुराने tutorials के बारे में चेतावनी।** Qiskit version 1.0 (2024) में बहुत बदला। Online मिलने वाला जो code `execute(...)` या `from qiskit import Aer` इस्तेमाल करता है, वह उससे पहले का है और अब नहीं चलता। यह course पूरे समय आधुनिक शैली इस्तेमाल करता है: Sampler और Estimator जैसे **primitives**।

### Code कहाँ लिखें

- **Notebook** (Jupyter, या Colab): छोटे cells में code चलाएँ और नतीजे तुरंत देखें। सीखने और प्रयोग के लिए सबसे अच्छा।
- **Script** (`python3 file.py` से चलने वाली `.py` file, या VS Code जैसा editor): program लंबा होने पर सबसे अच्छा।

इस course का हर code block एक पूरा program है: उसे किसी cell या file में copy करें और जैसा है वैसा चलाएँ।

## हर quantum program का ढाँचा

कोई quantum program कुछ भी करे, उसमें चार क़दम होते हैं। IBM इन्हें **Qiskit patterns** कहता है: map, optimise, execute, post-process।

1. Circuit **बनाएँ**: qubits, gates और measurements (समस्या को circuit पर **map** करें)।
2. उसे machine के लिए **तैयार** करें: उसे उन gates और connections में दोबारा लिखें जो hardware में सचमुच हैं (**optimise**, जिसे transpiling कहते हैं)। Simulators को इसकी ज़रूरत नहीं, इसलिए हम इसे पाठ 40 तक छोड़ते हैं।
3. उसे **चलाएँ** (**execute**): **Sampler** मापे गए bitstrings लौटाता है; **Estimator** औसत मान लौटाता है (पाठ 19)।
4. नतीजों का **विश्लेषण** करें (**post-process**): counts को probabilities, error bars और जवाबों में बदलें।

नीचे के programs इन्हीं क़दमों पर चलते हैं।

## Program 1: superposition में एक qubit

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

qc = QuantumCircuit(1)       # one qubit, starts in |0⟩
qc.h(0)                      # Hadamard gate on qubit 0

state = Statevector(qc)      # simulate: what are the amplitudes now?
print(state)
print(state.probabilities())          # P(0), P(1)
```

```text
Statevector([0.70710678+0.j, 0.70710678+0.j],
            dims=(2,))
[0.5 0.5]
```

लाइन-दर-लाइन:

- `QuantumCircuit(1)` एक qubit वाला circuit बनाता है। हर qubit |0⟩ से शुरू होता है।
- `qc.h(0)` qubit 0 पर Hadamard gate जोड़ता है (पाठ 9)। अभी कुछ चलता नहीं: आप बस एक नुस्ख़ा लिख रहे हैं।
- `Statevector(qc)` आपके computer पर नुस्ख़े को **simulate** करता है और आख़िरी state देता है।

Output **amplitudes** (पाठ 6) का vector है: |0⟩ के लिए 0.7071 और |1⟩ के लिए 0.7071, जो (|0⟩ + |1⟩)/√2 है। हर संख्या complex संख्या के रूप में लिखी है, और `+0.j` का मतलब है कि उसका imaginary भाग शून्य है (Python i को j लिखता है)। `dims=(2,)` बताता है कि यह एक दो-स्तर वाला system है। Probabilities 0.7071² = 0.5 हर एक हैं।

`Statevector` एक झाँकी है जो सिर्फ़ simulator दे सकता है। **असली quantum computer आपको amplitudes नहीं दिखा सकता**; वह बस measure कर सकता है। तो आइए measure करें।

## Program 2: measure करना, और नतीजे पढ़ना

```python
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler

qc = QuantumCircuit(1)
qc.h(0)
qc.measure_all()                       # add a measurement to every qubit
print(qc.draw())

sampler = StatevectorSampler(seed=42)  # a seed makes the "random" results repeatable
result = sampler.run([qc], shots=1000).result()
bits = result[0].data.meas             # results for circuit 0, register "meas"
counts = bits.get_counts()
print(counts)
print("first 20 shots:", "".join(bits.get_bitstrings()[:20]))

p = counts.get("1", 0) / 1000
err = (p * (1 - p) / 1000) ** 0.5      # standard error of an estimated probability
print(f"estimated P(1) = {p:.3f} ± {err:.3f}")
```

```text
        ┌───┐ ░ ┌─┐
     q: ┤ H ├─░─┤M├
        └───┘ ░ └╥┘
meas: 1/═════════╩═
                 0 
{'1': 497, '0': 503}
first 20 shots: 10110111000111001011
estimated P(1) = 0.497 ± 0.016
```

**चित्र।** ऊपर का तार qubit `q` है, समय बाएँ से दाएँ चलता है: H gate, एक **barrier** `░` (एक विभाजक जो `measure_all` जोड़ता है, जो compiler को उसके आर-पार gates खिसकाने से रोकता है), फिर **meter** `M`। नीचे की दोहरी लाइन `meas` नाम का एक **classical register** है जिसमें 1 bit है। Meter से उसमें जाती लाइन, जिस पर 0 लिखा है, का मतलब है "यह नतीजा bit 0 में रखो"।

**चलाना।** `StatevectorSampler()` एक Sampler है जो आपके computer पर चलता है। `run([qc], shots=1000)` circuit को 1,000 बार तैयार करके measure करता है। List का मतलब है कि आप एक साथ कई circuits दे सकते हैं।

**Result object।** `result[0]` पहले (यहाँ इकलौते) circuit का नतीजा है। `.data.meas` में `meas` नाम के register में रखे bits हैं। उससे `get_counts()` हर नतीजे की गिनती देता है, और `get_bitstrings()` हर shot क्रम से देता है।

**Randomness।** पहले 20 shots, 10110111000111001011, दिखाते हैं कि **हर shot random है**: कुछ भी अगले का अनुमान नहीं देता। सिर्फ़ pattern का अनुमान लगाया जा सकता है: लगभग आधे 0 और आधे 1। Simulator अपनी randomness एक pseudo-random number generator से बनाता है, और `seed=42` उसका शुरुआती बिंदु तय करता है, ताकि आपका output इस पेज से ठीक मेल खाए। Seed हटाएँ और हर बार नए नतीजे मिलेंगे, फिर भी 500/500 के क़रीब।

**Error bars।** N shots से अनुमानित probability की **standard error** लगभग √(p(1 − p)/N) होती है। यहाँ वह ±0.016 है, इसलिए 0.497 असली 0.5 से पूरी तरह मेल खाता है। अपेक्षित मान से लगभग दो standard errors के भीतर के नतीजे सामान्य बिखराव हैं, bug नहीं। पाठ 20 इन आँकड़ों को ठीक से समझाता है।

## Program 3: आपका पहला entanglement

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
from qiskit.primitives import StatevectorSampler

bell = QuantumCircuit(2)
bell.h(0)                    # superposition on qubit 0
bell.cx(0, 1)                # CNOT: control 0, target 1
print(Statevector(bell))

bell.measure_all()
print(bell.draw())
shots = StatevectorSampler(seed=7).run([bell], shots=1000).result()[0].data.meas
print(shots.get_counts())

strings = shots.get_bitstrings()
print("qubit 0 alone was 1 in", sum(s[1] == "1" for s in strings), "of 1000 shots")
print("qubit 1 alone was 1 in", sum(s[0] == "1" for s in strings), "of 1000 shots")
print("the two qubits agreed in", sum(s[0] == s[1] for s in strings), "of 1000 shots")
```

```text
Statevector([0.70710678+0.j, 0.        +0.j, 0.        +0.j,
             0.70710678+0.j],
            dims=(2, 2))
        ┌───┐      ░ ┌─┐   
   q_0: ┤ H ├──■───░─┤M├───
        └───┘┌─┴─┐ ░ └╥┘┌─┐
   q_1: ─────┤ X ├─░──╫─┤M├
             └───┘ ░  ║ └╥┘
meas: 2/══════════════╩══╩═
                      0  1 
{'11': 498, '00': 502}
qubit 0 alone was 1 in 498 of 1000 shots
qubit 1 alone was 1 in 498 of 1000 shots
the two qubits agreed in 1000 of 1000 shots
```

`bell.cx(0, 1)` एक CNOT है जिसमें qubit 0 **control** (बिंदु) और qubit 1 **target** (X box के रूप में बना) है। State में चार amplitudes हैं, |00⟩, |01⟩, |10⟩ और |11⟩ के लिए, और सिर्फ़ पहला और आख़िरी शून्य नहीं हैं: (|00⟩ + |11⟩)/√2, पाठ 14 की Bell state।

अब आँकड़े देखें:

- **हर qubit अकेले** एक निष्पक्ष सिक्का है: qubit 0 1,000 में से 498 shots में 1 था, और qubit 1 भी।
- **साथ में** वे सभी 1,000 shots में मेल खाते रहे। आपको हमेशा सिर्फ़ 00 या 11 दिखता है।

दो पूरी तरह random bits जो हमेशा मेल खाते हैं: यही entanglement की पहचान है। (सिर्फ़ मेल खाने की classical व्याख्या भी हो सकती है, जैसे दो लिफ़ाफ़ों में एक ही पत्ता। पाठ 15 ने दिखाया कि दूसरे कोणों पर measurements उसे कैसे ख़ारिज करते हैं।)

## Program 4: एक-qubit interferometer

यह रहा quantum computing का दिल, चार लाइनों में। पहला H qubit को दो "रास्तों", |0⟩ और |1⟩, में बाँटता है। Phase gate P(φ) सिर्फ़ |1⟩ रास्ते का phase खिसकाता है। दूसरा H रास्तों को फिर मिलाता है, और वे **interfere** करते हैं:

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler

sampler = StatevectorSampler(seed=1)
print("phase φ    measured P(1)   theory sin²(φ/2)")
for phi in [0, np.pi / 4, np.pi / 2, 3 * np.pi / 4, np.pi]:
    qc = QuantumCircuit(1)
    qc.h(0)              # split into two paths: |0> and |1>
    qc.p(phi, 0)         # give the |1> path a phase φ
    qc.h(0)              # recombine the paths: they interfere
    qc.measure_all()
    counts = sampler.run([qc], shots=1000).result()[0].data.meas.get_counts()
    print(f"{phi:5.3f}        {counts.get('1', 0) / 1000:.3f}           {np.sin(phi / 2) ** 2:.3f}")
```

```text
phase φ    measured P(1)   theory sin²(φ/2)
0.000        0.000           0.000
0.785        0.152           0.146
1.571        0.493           0.500
2.356        0.861           0.854
3.142        1.000           1.000
```

Phase अकेले में अदृश्य है: पहले H के बाद कोई भी φ measure करने पर 50/50 देता है। लेकिन फिर मिलने के बाद यह नतीजे को **पूरी तरह नियंत्रित** करता है। हिसाब लगाएँ:

- H के बाद: (|0⟩ + |1⟩)/√2।
- P(φ) के बाद: (|0⟩ + e^(iφ)|1⟩)/√2।
- दूसरे H के बाद |1⟩ का amplitude (1 − e^(iφ))/2 है, तो **P(1) = (1 − cos φ)/2 = sin²(φ/2)**।

φ = 0 पर |1⟩ तक के दोनों रास्ते ठीक-ठीक कट जाते हैं (+½ और −½), इसलिए दो बार H हर बार 0 देता है। φ = π पर (एक Z gate), |0⟩ तक के रास्ते कटते हैं, और आपको हमेशा 1 मिलता है। बीच में, मापे गए मान error bars के भीतर sin²(φ/2) से मेल खाते हैं।

यह circuit के रूप में लिखा गया **Mach–Zehnder interferometer** है, वही ढाँचा जो physicists दर्पणों और beam splitters से बनाते हैं। यही phase kickback (पाठ 22), phase estimation (पाठ 27) और quantum sensing (पाठ 44) का भी केंद्र है: जो phase दिखता नहीं, उसे मापी जा सकने वाली probabilities में बदल दिया जाता है।

## नतीजे पढ़ना: Qiskit का bit क्रम

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
from qiskit.primitives import StatevectorSampler

qc = QuantumCircuit(3)
qc.x(1)                       # flip qubit 1 only

amps = Statevector(qc).data.real
print("amplitudes:", amps)    # the 1 sits at position 2 = 0·1 + 1·2 + 0·4
print("position of the 1:", list(amps).index(1), "=", format(2, "03b"), "in binary")

qc.measure_all()
counts = StatevectorSampler(seed=1).run([qc], shots=100).result()[0].data.meas.get_counts()
print("counts:", counts)
key = list(counts)[0]
print("qubit 0 reads", key[-1], "| qubit 1 reads", key[-2], "| qubit 2 reads", key[-3])
```

```text
amplitudes: [0. 0. 1. 0. 0. 0. 0. 0.]
position of the 1: 2 = 010 in binary
counts: {'010': 100}
qubit 0 reads 0 | qubit 1 reads 1 | qubit 2 reads 0
```

दो परिपाटियाँ जाननी हैं:

- **Statevector में स्थान:** किसी basis state का amplitude स्थान q0·1 + q1·2 + q2·4 + … पर रहता है, इसलिए सिर्फ़ qubit 1 पलटने से 1 स्थान 2 पर आता है।
- **Bitstrings में qubit 0 दाईं ओर लिखा जाता है:** `'010'` का मतलब q2 = 0, q1 = 1, q0 = 0। तो `key[-1]` qubit 0 है, `key[-2]` qubit 1, वग़ैरह।

यह साधारण binary संख्याओं जैसा ही है, जहाँ सबसे निचला bit दाईं ओर होता है। ज़्यादातर किताबें, और इस site की क्वांटम लैब, qubit 0 को **बाईं** ओर लिखती हैं। दोनों ठीक हैं; बस यह जानें कि आप कौन-सा पढ़ रहे हैं। अगर किताबी क्रम चाहिए, तो `qc.reverse_bits()` circuit का qubit क्रम पलट देता है, और `key[::-1]` किसी string को।

## तीन ग़लतियाँ जो हर कोई करता है

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
from qiskit.primitives import StatevectorSampler

def attempt(label, action):
    try:
        action()
        print(label, "worked")
    except Exception as e:
        print(f"{label} {type(e).__name__}: {getattr(e, 'message', str(e))}")

# Mistake 1: asking for the statevector of a circuit that contains measurements
measured = QuantumCircuit(1)
measured.h(0)
measured.measure_all()
attempt("Mistake 1:", lambda: Statevector(measured))

# Mistake 2: forgetting to measure, then asking the sampler for counts
unmeasured = QuantumCircuit(1)
unmeasured.h(0)
attempt("Mistake 2:", lambda: StatevectorSampler().run([unmeasured]).result()[0].data.meas)

# Mistake 3: adding gates after the measurement
late = QuantumCircuit(1)
late.measure_all()
late.x(0)
attempt("Mistake 3:", lambda: StatevectorSampler().run([late]).result())
```

```text
Mistake 1: QiskitError: Cannot apply instruction with classical bits: measure
Mistake 2: AttributeError: 'DataBin' object has no attribute 'meas'
Mistake 3: QiskitError: StatevectorSampler cannot handle mid-circuit measurements
```

1. **Measured circuit का statevector।** `Statevector` gates को simulate करता है, measurements को नहीं। Measurements जोड़ने से **पहले** statevector लें (या उनके बिना वाली copy का)।
2. **Measurements नहीं, तो `meas` नहीं।** `measure_all()` के बिना कोई classical register नहीं है, इसलिए नतीजे में `meas` नाम का कुछ नहीं होता। Qiskit एक चेतावनी भी छापता है: "One of your circuits has no output classical registers"। अगर आप अपने registers को नाम देते हैं (पाठ 19), तो नतीजे उन्हीं नामों से आते हैं।
3. **Measurement के बाद gates।** `StatevectorSampler` सिर्फ़ circuit के अंत में measurements की अनुमति देता है। Mid-circuit measurement असली और काम की चीज़ है (पाठ 21 का teleportation इसे चाहता है), लेकिन उसके लिए ऐसा simulator चाहिए जो इसे सँभाले, जैसे Qiskit Aer (पाठ 19)।

जब error आए, तो message की **आख़िरी लाइन** पहले पढ़ें: वह आम तौर पर ठीक-ठीक बताती है कि क्या ग़लत हुआ।

## Program 5: एक quantum पासा

अब एक पूरा, काम का program। Superposition में qubits को measure करने से random bits मिलते हैं, इसलिए quantum computer स्वाभाविक रूप से एक **random number generator** है। तीन qubits 0 से 7 तक की संख्या देते हैं, लेकिन पासे को 1 से 6 चाहिए:

```python
from collections import Counter
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler

def quantum_bits(n_qubits, shots, seed=None):
    """Put n qubits in superposition and measure: each shot gives n random bits."""
    qc = QuantumCircuit(n_qubits)
    qc.h(range(n_qubits))
    qc.measure_all()
    return StatevectorSampler(seed=seed).run([qc], shots=shots).result()[0].data.meas.get_bitstrings()

def dice(rolls, seed=None):
    """Three random bits give 0..7. Keep 0..5 (add 1 for a die), throw away 6 and 7, repeat."""
    out = []
    while len(out) < rolls:
        out += [int(b, 2) + 1 for b in quantum_bits(3, rolls, seed) if int(b, 2) < 6]
        seed = None if seed is None else seed + 1
    return out[:rolls]

print("a random byte:", quantum_bits(8, 1, seed=3)[0])
print("ten dice rolls:", dice(10, seed=5))

tally = Counter(dice(6000, seed=11))
print("6,000 rolls:")
for face in range(1, 7):
    print(f"  {face}: {'█' * (tally[face] // 50)} {tally[face]}")
```

```text
a random byte: 00010101
ten dice rolls: [5, 3, 1, 4, 4, 1, 1, 5, 3, 3]
6,000 rolls:
  1: ███████████████████ 989
  2: ███████████████████ 980
  3: ████████████████████ 1017
  4: ████████████████████ 1020
  5: ███████████████████ 966
  6: ████████████████████ 1028
```

`dice` में तरकीब को **rejection sampling** कहते हैं: अगर तीन bits 6 या 7 देते हैं, तो वह नतीजा फेंक दें और अगला लें। आसान shortcut, "संख्या mod 6", **पक्षपाती** होता: 0 और 6 दोनों 1 बन जाते, और 1 और 7 दोनों 2, इसलिए 1 और 2 बाक़ियों से दोगुनी बार आते। 6,000 बार फेंकने में हर अंक लगभग 1,000 बार आता है, लगभग ±30 के बिखराव के साथ, जैसा आँकड़े बताते हैं।

दो ईमानदार बातें। पहली, simulator पर randomness seed वाले pseudo-random generator से आती है, इसलिए यह सचमुच random नहीं है; असली hardware पर यह quantum measurement से आती है। दूसरी, असली devices थोड़े **पक्षपाती** होते हैं (जैसे readout errors 0 को 1 से थोड़ा ज़्यादा संभावित बनाती हैं), इसलिए असली **quantum random number generators** (QRNGs) अपने कच्चे bits को randomness extraction नाम के क़दम से साफ़ करते हैं। QRNG chips व्यावसायिक उत्पाद हैं: 2020 से कुछ smartphones में एक छोटा-सा QRNG रहा है, जो circuit के qubits के बजाय एक प्रकाश स्रोत और एक प्रकाश sensor इस्तेमाल करता है।

## असली quantum computer पर चलाना (वैकल्पिक)

ऊपर का सब कुछ आपके computer पर एक **simulator** पर चला। IBM अपने Open Plan से असली quantum computers तक मुफ़्त पहुँच देता है (हर महीने कुछ मिनट का quantum processor समय, छोटे प्रयोगों के लिए काफ़ी)। क़दम ये हैं:

1. [IBM Quantum Platform](https://quantum.cloud.ibm.com/) पर मुफ़्त account बनाएँ और एक API key बनाएँ।
2. `pip install qiskit-ibm-runtime` से client install करें, और अपनी key एक बार अपने computer पर save करें। इसे कभी ऐसे code में न चिपकाएँ जिसे आप साझा करते हैं।
3. एक device चुनें, अपने circuit को उसके लिए **transpile** करें (pattern का क़दम 2), और hardware Sampler से चलाएँ, जो ठीक उसी Sampler जैसा काम करता है जो आप इस्तेमाल करते आए हैं।

पाठ 40 पूरा, जाँचा हुआ code देता है। थोड़े noise की उम्मीद रखें: असली Bell pair कुछ प्रतिशत 01 और 10 नतीजे देता है। यह पाठ 32 का noise है, अपनी आँखों से।

## ख़ुद आज़माएँ

1. Program 1 में `qc.h(0)` से पहले `qc.x(0)` जोड़ें। Statevector में क्या बदलता है, और मापे गए counts क्यों नहीं बदलते?
2. 3-qubit GHZ state बनाएँ: qubit 0 पर H, CNOT 0→1, CNOT 1→2। कौन-से नतीजे आते हैं, और कितनी बार?
3. Program 4 में कौन-सा phase φ, P(1) = ¼ देता है?
4. Program 2 में 1,000 shots ने ±0.016 का error bar दिया। ±0.005 के लिए मोटे तौर पर कितने shots चाहिए?
5. एक 2-qubit circuit नतीजा `'01'` देता है। कौन-सा qubit 1 मापा गया?
6. H, CNOT और एक और gate से ऐसा 2-qubit circuit बनाएँ जिसके qubits हमेशा **अलग** हों (सिर्फ़ 01 और 10)।
7. पासा program "संख्या mod 6, जमा 1" के बजाय 6 और 7 को क्यों फेंक देता है?

आप अपने circuits [क्वांटम लैब](/hi/lab/) के circuit builder में जाँच सकते हैं, और वहाँ से उन्हें वापस Qiskit code में export कर सकते हैं।

**जवाब:**

1. Statevector (0.7071, −0.7071) बन जाता है, state |−⟩ = (|0⟩ − |1⟩)/√2। Counts लगभग 50/50 रहते हैं क्योंकि दोनों probabilities अब भी 0.5 हैं: minus चिह्न एक relative **phase** (पाठ 10) है, जो आगे के gates के बाद ही दिखता है, जैसे Program 4 में।
2. सिर्फ़ **000** और **111**, हर एक लगभग आधी बार। तीनों qubits हमेशा मेल खाते हैं।
3. sin²(φ/2) = ¼ का मतलब sin(φ/2) = ½, तो φ/2 = π/6 और **φ = π/3 ≈ 1.047**।
4. Error 1/√N की तरह घटती है, इसलिए (0.016/0.005)² ≈ 10 गुना चाहिए: लगभग **10,000 shots**।
5. **Qubit 0**: सबसे दाईं ओर का अक्षर qubit 0 है।
6. Qubit 0 पर H, CNOT 0→1, फिर **qubit 1 पर X**। इससे (|01⟩ + |10⟩)/√2 बनता है, Bell state Ψ+।
7. "Mod 6" पक्षपाती है: 0 और 6 दोनों 1 देते हैं, और 1 और 7 दोनों 2, इसलिए 1 और 2 की probability 1/6 के बजाय 2/8 होती। 6 और 7 फेंकने से छहों अंक बराबर, 1/6 हर एक, संभावित रहते हैं।

## सार-पत्रक

| Code | मतलब |
|---|---|
| `pip install qiskit` | Qiskit install करें (virtual environment में, या Colab में `!pip`) |
| `QuantumCircuit(n)` | n qubits, सब \|0⟩ से शुरू |
| `qc.h(q)`, `qc.x(q)`, `qc.z(q)`, `qc.p(φ, q)` | Single-qubit gates |
| `qc.cx(c, t)` | CNOT, control c, target t |
| `Statevector(qc)` | सटीक amplitudes (सिर्फ़ simulator, measurements नहीं) |
| `.probabilities()` | हर basis state की probability |
| `qc.measure_all()` | हर qubit को `meas` नाम के register में measure करें |
| `qc.draw()` | Circuit का text चित्र |
| `StatevectorSampler(seed=…).run([qc], shots=N)` | N shots चलाएँ (दोहराने लायक नतीजों के लिए seed) |
| `.result()[0].data.meas` | Circuit 0 के नतीजे, register `meas` |
| `.get_counts()`, `.get_bitstrings()` | नतीजों की गिनती; हर shot क्रम से |
| Error bar | N shots से मिली probability के लिए ±√(p(1 − p)/N) |
| Bit क्रम | Qubit 0 सबसे **दाईं** ओर का अक्षर है; स्थान = q0·1 + q1·2 + … |
| पुराना code | `execute(...)` और `from qiskit import Aer` 1.0 से पहले के हैं और अब नहीं चलते |
| Pattern | बनाएँ → तैयार करें (transpile) → चलाएँ → विश्लेषण |
