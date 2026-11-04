---
layout: ../../../layouts/Post.astro
lang: hi
title: "Ions, atoms और photons"
description: "Qubits बनाने के दूसरे अग्रणी तरीके, हर एक उसकी physics से समझाया। Trapped ions: static field उन्हें क्यों नहीं पकड़ सकता, Paul trap (simulate किया), और साझा कंपनों से gates (modes निकाले)। Neutral atoms: optical tweezers और Rydberg blockade (simulate किया)। Photons: Hong–Ou–Mandel असर (simulate किया), loss, और measurement-आधारित computing। साथ में silicon में spins, topological qubits, और platforms की तुलना।"
date: 2026-11-04
category: lesson
lesson: 39
---

पाठ 38 ने electrical circuits से qubits बनाए। यह पाठ उन्हें प्रकृति के अपने quantum systems से बनाता है: अकेले atoms, electric fields या प्रकाश की किरणों से थामे गए, और प्रकाश के अकेले कण। इन platforms की ताक़तें अलग हैं। Trapped ions gate सटीकता के रिकॉर्ड रखते हैं; neutral atoms qubits की संख्या के; photons यात्रा की गति और कमरे के तापमान पर चलने के। हर एक के पास एक कठिन समस्या भी है जिसे बढ़ने के लिए हल करना है।

हर platform के लिए हम देखेंगे कि qubit कहाँ रहता है, कैसे नियंत्रित और entangle होता है, और उसे क्या सीमित करता है, और उस मुख्य physical असर को simulate करेंगे जो उसे काम कराता है।

## Trapped ions

**Ion** एक atom है जिसका एक electron हटा दिया गया है, तो उस पर electric charge है, और charged कणों को electric fields से धकेला जा सकता है। Vacuum में थामा गया एक अकेला ion दुनिया से लगभग उतना ही अलग है जितना कुछ भी हो सकता है, इसीलिए ions इतने साफ़ qubits बनाते हैं।

### Ion को बस स्थिर क्यों नहीं थाम सकते

एक पेंच है। **Earnshaw का प्रमेय** (1842) कहता है कि **static** charges की कोई भी व्यवस्था किसी charged कण को स्थिर संतुलन में नहीं थाम सकती। Static electric field एक घोड़े की काठी (saddle) बना सकता है: वह ion को एक दिशा में अंदर धकेलता है लेकिन दूसरी में बाहर, और ion फिसल जाता है।

हल, जिसके लिए Wolfgang Paul को 1989 का Nobel पुरस्कार साझा मिला, है काठी को **दोलन** कराना। एक radio-frequency voltage (दसियों MHz) काठी को आगे-पीछे पलटता है: जैसे ही ion किसी दिशा में बाहर फिसलने लगता है, वही दिशा अंदर धकेलने वाली बन जाती है। औसतन, अच्छी तरह चुना दोलन कुल मिलाकर वापस खींचने वाला बल बनाता है। Ion की गति **Mathieu समीकरण** मानती है, और हम उसे simulate कर सकते हैं:

```python
import numpy as np
from scipy.integrate import solve_ivp

# An ion in a Paul trap, in dimensionless time τ: x'' = -(a - 2q·cos 2τ)·x   (the Mathieu equation)
def furthest(a, q, x0=1.0, tmax=200):
    sol = solve_ivp(lambda t, y: [y[1], -(a - 2 * q * np.cos(2 * t)) * y[0]], [0, tmax], [x0, 0], max_step=0.01)
    return np.max(np.abs(sol.y[0]))

print("field                                   furthest the ion gets (starting at 1)")
for name, a, q in [("static saddle (no oscillation)", -0.05, 0.0),
                   ("oscillating, q = 0.3", 0.0, 0.3),
                   ("oscillating, q = 0.7", 0.0, 0.7),
                   ("oscillating too hard, q = 1.0", 0.0, 1.0)]:
    print(f"{name:38s}  {furthest(a, q):10.3g}")
```

```text
field                                   furthest the ion gets (starting at 1)
static saddle (no oscillation)            1.32e+19
oscillating, q = 0.3                          1.37
oscillating, q = 0.7                          2.59
oscillating too hard, q = 1.0             4.91e+24
```

Static काठी ion को फेंक देती है (उसकी दूरी बेहद बढ़ती है)। मध्यम ताक़त q वाला दोलन करता field उसे केंद्र से छोटी दूरी के अंदर, डगमगाते हुए, रखता है। लेकिन बहुत ज़ोर से दोलन कराएँ (q लगभग 1 या ऊपर) तो गति फिर अस्थिर हो जाती है। असली **Paul traps** स्थिर क्षेत्र में चलते हैं, और आधुनिक **surface traps** हैं: chip पर बने electrodes, जिनके लगभग 50 µm ऊपर ions तैरते हैं।

### Qubits, ठंडा करना और readout

Qubit ion के बाहरी electron की दो अंदरूनी states में रहता है। **Hyperfine qubits** (जैसे ¹⁷¹Yb⁺ या ¹³⁷Ba⁺ में) कुछ GHz से अलग दो states इस्तेमाल करते हैं और microwaves या lasers की जोड़ियों से नियंत्रित होते हैं; वे seconds से minutes तक coherence रख सकते हैं। **Optical qubits** (जैसे ⁴⁰Ca⁺ में) एक ground state और एक लंबे समय तक टिकने वाली excited state इस्तेमाल करते हैं जो optical frequency से अलग हैं, एक बहुत स्थिर laser से नियंत्रित।

Lasers ions की गति को भी लगभग उसकी quantum ground state तक **ठंडा** करते हैं। Readout **fluorescence** से होता है: laser एक qubit state से बहुत photons बिखरवाता है जबकि दूसरी अँधेरी रहती है (पाठ 37), 0.01% से 0.1% तक कम errors के साथ।

### साझा कंपन से gates

एक ही trap के ions एक कतार में लगते हैं, आपसी प्रतिकर्षण से अलग रखे। क्योंकि वे एक-दूसरे को धकेलते हैं, वे स्वतंत्र रूप से नहीं काँपते: कतार के कंपन के सामूहिक **modes** होते हैं, guitar के तार के modes की तरह। सबसे निचला mode पूरी कतार का एक साथ आगे-पीछे झूलना है। यहाँ संतुलन की जगहें और mode frequencies हैं, trap के खिंचाव और ions के Coulomb प्रतिकर्षण के संतुलन से निकाली:

```python
import numpy as np
from scipy.optimize import minimize

def chain_modes(N):
    """Axial vibration modes of N ions in a harmonic trap (frequencies in units of the trap frequency)."""
    energy = lambda x: 0.5 * np.sum(x ** 2) + sum(1 / abs(x[i] - x[j]) for i in range(N) for j in range(i))
    x = np.sort(minimize(energy, np.linspace(-1, 1, N) * N ** 0.5).x)     # equilibrium positions
    K = np.eye(N)                                                         # stiffness matrix (Hessian)
    for i in range(N):
        for j in range(N):
            if i != j:
                K[i, j] = -2 / abs(x[i] - x[j]) ** 3
                K[i, i] += 2 / abs(x[i] - x[j]) ** 3
    return np.sqrt(np.linalg.eigvalsh(K)), x

for N in [2, 3, 5]:
    freqs, x = chain_modes(N)
    print(f"{N} ions: positions {np.round(x, 2) + 0.0}   mode frequencies {np.round(freqs, 3)}")
```

```text
2 ions: positions [-0.63  0.63]   mode frequencies [1.    1.732]
3 ions: positions [-1.08  0.    1.08]   mode frequencies [1.    1.732 2.408]
5 ions: positions [-1.74 -0.82  0.    0.82  1.74]   mode frequencies [1.    1.732 2.412 3.055 3.671]
```

Centre-of-mass mode हमेशा ठीक trap frequency (1) पर है, "breathing" mode √3 ≈ 1.732 पर, और ऊँचे modes उससे ऊपर। ये साझा कंपन वह **bus** हैं जो qubits को जोड़ती है। **Mølmer–Sørensen gate** (1999, Cirac और Zoller के 1995 के प्रस्ताव पर आधारित) में lasers दो ions को थोड़ी देर ऐसे बल से धकेलते हैं जो उनकी qubit states पर निर्भर है, साझा गति को उत्तेजित करते हैं और फिर आराम पर लौटाते हैं। गति अपरिवर्तित रहती है, लेकिन दोनों qubits एक phase उठाते हैं जो दोनों की states पर निर्भर है, एक entangling XX rotation बनाते हुए।

क्योंकि कतार का हर ion वही modes साझा करता है, **कोई भी ion किसी भी दूसरे से entangle हो सकता है**: पूरी connectivity, SWAP gates की ज़रूरत नहीं। Two-qubit gates धीमे हैं (आम तौर पर 100 µs या ज़्यादा) लेकिन बेहद सटीक: सबसे अच्छे अब **99.9%** fidelity से ऊपर हैं, और single-qubit gates 99.999% से ऊपर।

### Ions को बढ़ाना

लंबी कतारें नियंत्रित करना कठिन है: mode frequencies आपस में भिड़ती हैं, और gates धीमे होते हैं। बढ़ाने के दो तरीके हैं:

- **QCCD architecture** (quantum charge-coupled device): कई trap zones वाली chip, जहाँ ions को storage, gate और readout क्षेत्रों के बीच physically **ले जाया** (shuttle) जाता है। Quantinuum की H-series और उसकी **Helios** machine (98 qubits, 2025) यह तरीका इस्तेमाल करती हैं।
- **Photonic interconnects:** अलग traps को ions और उनसे निकले photons को entangle करके जोड़ना (पाठ 42 के quantum networks), जिसे IonQ और दूसरे अपना रहे हैं।

## Neutral atoms

Neutral atoms पर कोई charge नहीं, तो electric fields उन्हें नहीं थामते। इसके बजाय वे कसकर केंद्रित laser किरणों से थामे जाते हैं जिन्हें **optical tweezers** कहते हैं (Arthur Ashkin ने इनके आविष्कार के लिए 2018 का Nobel पुरस्कार साझा किया)। Atom अपनी resonance frequency से नीचे tune किए laser के चमकीले केंद्र की ओर खिंचता है। सैकड़ों या हज़ारों tweezers, एक laser से उन devices द्वारा बनाए जो किरणों को बाँटते और मोड़ते हैं, atoms की array को किसी भी pattern में थामते हैं। 2025 में Caltech के एक समूह ने एक array में **6,100** से ज़्यादा atoms पकड़े।

भरना random है: हर tweezer सिर्फ़ लगभग आधे समय एक atom पकड़ता है। तो camera तस्वीर लेता है, और चलते tweezers कुछ milliseconds में atoms को एक perfect, दोषरहित array में **फिर से सजा** देते हैं। Qubits दो hyperfine ground states हैं (जैसे ⁸⁷Rb या ¹⁷¹Yb में), लंबी coherence के साथ।

### Rydberg atoms और blockade

Ground states में neutral atoms मुश्किल से interact करते हैं। उन्हें entangle करने के लिए laser एक atom को **Rydberg state** में उत्तेजित करता है: उसका बाहरी electron बहुत ऊँची कक्षा (principal quantum number n लगभग 50 से 100) में उठता है, जिससे atom विशाल, सामान्य से हज़ारों गुना बड़ा, हो जाता है। कुछ micrometres दूर दो Rydberg atoms ताक़त से interact करते हैं, दोनों-उत्तेजित state की energy को V जितना खिसकाते हुए।

अगर V laser की Rabi frequency Ω से बहुत बड़ा हो, तो laser **एक** atom उत्तेजित कर सकता है, लेकिन दोनों नहीं: दूसरी उत्तेजना resonance से बाहर है। यह **Rydberg blockade** है (Jaksch और साथियों ने 2000 में प्रस्तावित किया)। एक ही laser से चलाए दो atoms simulate करें:

```python
import numpy as np
from scipy.linalg import expm

# Two atoms, each with a ground state g and a Rydberg state r. Basis: gg, gr, rg, rr.
omega = 1.0                                       # laser Rabi frequency (sets the time unit)
flip = np.array([[0, 1], [1, 0]])
I2 = np.eye(2)
drive = 0.5 * omega * (np.kron(flip, I2) + np.kron(I2, flip))

print("interaction V/Ω   most likely to find BOTH atoms excited")
for V in [0, 1, 5, 20, 100]:
    H = drive + np.diag([0, 0, 0, V])            # V: energy cost of two Rydberg atoms side by side
    times = np.linspace(0, 4 * np.pi, 800)
    p_rr = max(abs((expm(-1j * H * t) @ [1, 0, 0, 0])[3]) ** 2 for t in times)
    print(f"      {V:5.0f}              {p_rr:.4f}")

H = drive + np.diag([0, 0, 0, 100])
t = np.pi / (np.sqrt(2) * omega)                   # half a period of the collective oscillation
psi = expm(-1j * H * t) @ [1, 0, 0, 0]
print(f"\nwith strong blockade, after t = π/(√2·Ω): P(gr) = {abs(psi[1])**2:.3f}, P(rg) = {abs(psi[2])**2:.3f}, "
      f"P(rr) = {abs(psi[3])**2:.4f}")
```

```text
interaction V/Ω   most likely to find BOTH atoms excited
          0              1.0000
          1              0.5634
          5              0.0255
         20              0.0013
        100              0.0001

with strong blockade, after t = π/(√2·Ω): P(gr) = 0.500, P(rg) = 0.500, P(rr) = 0.0000
```

कोई interaction न हो तो दोनों atoms साथ उत्तेजित होते हैं (P(rr) 1 तक पहुँचता है)। V बढ़ने पर दोनों-उत्तेजित state वर्जित होती जाती है: V = 100Ω पर दोनों के उत्तेजित मिलने की संभावना कभी 0.01% से ऊपर नहीं जाती। इसके बजाय जोड़ी |gg⟩ और **entangled** state (|gr⟩ + |rg⟩)/√2 के बीच, तेज़ frequency √2·Ω पर, झूलती है। "हममें से ठीक एक उत्तेजित है, लेकिन बताते नहीं कौन" blockade से बना entanglement है। यही physics CZ gate देती है: एक atom की state तय करती है कि उसका पड़ोसी 2π उत्तेजना loop पूरा कर पाए या नहीं, जो तय करता है कि −1 phase आए या नहीं।

### ताक़त और चुनौतियाँ

Neutral atoms बड़ी संख्या में एक जैसे qubits तक बढ़ते हैं (एक ही isotope के atoms पूरी तरह एक जैसे हैं; fabrication का कोई अंतर नहीं), और computation के दौरान atoms को **हिलाया** जा सकता है ताकि कोई भी जोड़ी पास आ सके। लंबी दूरी की जाँचों वाले error-correcting codes के लिए यह आदर्श है, और 2023 में Harvard, MIT और QuEra की team ने इस तरह 48 logical qubits तक पर algorithms चलाए (पाठ 35)। चुनौतियाँ हैं धीमे cycles (measurement और atom को हिलाना milliseconds लेते हैं), atoms का कभी-कभी trap से **खोना**, और लगभग 99.5% two-qubit fidelities, जो अभी सुधर रही हैं। 2025 में समूहों ने ऐसी arrays दिखाईं जिन्हें लगातार नए atoms से भरा जाता है, ताकि computation किसी atom के trap में टिकने के समय से कहीं लंबा चल सके।

## Photons

Photon qubit को अपने polarisation (horizontal या vertical) में, दो में से कौन-सा रास्ता लेता है उसमें, या अपने पहुँचने के समय में ढो सकता है। Photons के बड़े फ़ायदे हैं: वे प्रकाश की गति से चलते हैं, environment से मुश्किल से interact करते हैं तो coherence अच्छी रखते हैं, और ज़्यादातर hardware कमरे के तापमान पर चलता है (अक्सर detectors को छोड़कर)। दूरियों पर quantum जानकारी भेजने के लिए वे अकेले व्यावहारिक qubits हैं (पाठ 41 और 42)।

उनकी बड़ी कमज़ोरी उसी अलगाव का दूसरा पहलू है: **photons आपस में interact नहीं करते**, तो two-photon gates कठिन हैं। 2001 में Knill, Laflamme और Milburn (**KLM**) ने दिखाया कि linear optics (beam splitters और phase shifters), single-photon sources, detectors और feed-forward universal quantum computing के लिए काफ़ी हैं, ऐसे gates के साथ जो सिर्फ़ कभी-कभी काम करते हैं लेकिन सफल होने पर बता देते हैं। इसे संभव बनाने वाला quantum असर **two-photon interference** है।

### Hong–Ou–Mandel असर

दो photons को 50:50 beam splitter के दो input ports में, एक ही पल पर, भेजें। अगर वे पूरी तरह **एक जैसे** हों (एक रंग, polarisation, समय), तो वे **हमेशा साथ निकलते** हैं, एक ही output port से, कभी हर detector पर एक नहीं। Classically आप आधे समय हर detector पर एक photon की उम्मीद करते। "हर एक पर एक" पाने के दो तरीकों (दोनों आर-पार, या दोनों परावर्तित) के amplitudes ठीक-ठीक कट जाते हैं। इसे Hong, Ou और Mandel ने 1987 में दिखाया। इसे photon-number states से simulate करें, photons कितने एक जैसे हैं यह बदलते हुए:

```python
import numpy as np
from scipy.linalg import expm
from itertools import product

# Four modes: port A and port B of a beam splitter, each in two "internal" versions (think: two
# polarisations). Each mode holds 0, 1 or 2 photons, so the space has 3^4 = 81 basis states.
cut, modes = 3, 4
a = np.diag(np.sqrt(np.arange(1, cut)), 1)                 # one mode's lowering operator
def op(m):                                                 # lowering operator of mode m, on all 4 modes
    mats = [np.eye(cut)] * modes
    mats[m] = a
    out = mats[0]
    for M in mats[1:]:
        out = np.kron(out, M)
    return out
A, A2, B, B2 = (op(m) for m in range(modes))               # A, B: same internal version; A2, B2: the other
splitter = expm(np.pi / 4 * ((A.T @ B - B.T @ A) + (A2.T @ B2 - B2.T @ A2)))   # a 50:50 beam splitter
vac = np.zeros(cut ** modes); vac[0] = 1
labels = list(product(range(cut), repeat=modes))           # photon numbers (A, A2, B, B2) of each basis state

def coincidence(overlap):
    """One photon enters at A; the other enters at B, overlapping the first photon's internal state by `overlap`."""
    photon2 = overlap * B.T + np.sqrt(1 - overlap ** 2) * B2.T
    out = splitter @ (A.T @ photon2 @ vac)
    return sum(abs(c) ** 2 for c, (nA, nA2, nB, nB2) in zip(out, labels) if nA + nA2 == 1 and nB + nB2 == 1)

print("how identical the photons are   chance of one photon at each detector")
for o in [0.0, 0.5, 0.8, 0.95, 1.0]:
    print(f"            {o:4.2f}                         {coincidence(o):.3f}")
```

```text
how identical the photons are   chance of one photon at each detector
            0.00                         0.500
            0.50                         0.375
            0.80                         0.180
            0.95                         0.049
            1.00                         0.000
```

पूरी तरह अलग पहचाने जाने वाले photons classical 50% देते हैं; पूरी तरह एक जैसे **शून्य** coincidences देते हैं: **HOM dip**। Dip की गहराई नापती है कि दो photons कितने एक जैसे हैं, photon sources का बुनियादी गुणवत्ता test। Beam splitters पर two-photon interference, फिर detection, से photonic machines **Bell measurements** करती हैं और photons को entangle करती हैं।

### Measurement-आधारित और fusion-आधारित computing

Gates के क्रम के बजाय photonic designs आम तौर पर **measurement-based quantum computing** इस्तेमाल करते हैं: पहले कई photons की एक बड़ी entangled **cluster state** तैयार करो, फिर सिर्फ़ photons को एक-एक करके measure करके गणना करो, हर measurement basis पहले के नतीजों के हिसाब से चुनते हुए। **Fusion-based quantum computing** (PsiQuantum का तरीका) cluster को छोटी entangled resource states से बनाता है जो "fusion" measurements से जुड़ती हैं, जो probabilistic Bell measurements हैं। एक दूसरा तरीका (Xanadu का) qubits को squeezed प्रकाश के pulses में encode करता है, **GKP states** जैसे continuous-variable codes इस्तेमाल करके।

### दुश्मन: loss

हर दर्पण, fibre, chip waveguide और detector कुछ photons खोता है। दूसरे platforms के उलट, जहाँ error qubit की state बदलता है, यहाँ qubit बस ग़ायब हो जाता है। अगर protocol को n photons का सबका पहुँचना चाहिए, और हर एक probability η से बचता है, तो सफलता दर ηⁿ है, जो n के साथ exponentially गिरती है। Photonics के error-correcting codes को loss सहना होता है, और field की मुख्य engineering चुनौती कम-loss components और लगभग निश्चित photon sources हैं। **Superconducting nanowire single-photon detectors** (SNSPDs) अब 95% से ज़्यादा photons पकड़ते हैं, लेकिन कुछ kelvin तक ठंडे करने होते हैं।

Photons ने एक quantum advantage प्रदर्शन में भी मुख्य भूमिका निभाई: चीन के **Jiuzhang** devices (2020 से) ने Gaussian boson sampling किया, कई photons के interference पर आधारित एक काम जो classical computers के लिए कठिन है (पाठ 31)।

## Silicon में spins

**Quantum dot** एक semiconductor में एक छोटा क्षेत्र है, nanoscale electrodes पर voltages से बना, जो एक अकेले electron को फँसा सकता है। Magnetic field में electron का **spin**, up या down, qubit है। Microwaves या electric fields से नियंत्रित, और spin-to-charge conversion (पाठ 37) से पढ़े जाने वाले, इन qubits के दो बड़े वादे हैं:

- **आकार और निर्माण।** Spin qubit लगभग 100 nm का है, transmon से हज़ारों गुना छोटा, और उन्हीं 300 mm foundries में बन सकता है जो साधारण computer chips बनाती हैं। Intel की **Tunnel Falls** chip (2023) में ऐसे 12 qubits हैं जो उसकी मानक production lines पर बने।
- **गर्म तापमान पर चलना।** कुछ spin qubits 10 mK के बजाय लगभग 1 K पर काम करते हैं, जहाँ refrigerators के पास कहीं ज़्यादा cooling ताक़त है, जिससे control electronics को पास रखना आसान है।

Silicon को लगभग शुद्ध ²⁸Si तक **isotopically शुद्ध** किया जा सकता है, जिसका कोई nuclear spin नहीं, जिससे magnetic noise का एक बड़ा स्रोत हटता है और लंबी coherence मिलती है। चुनौतियाँ हैं एकरूपता (हर dot थोड़ा अलग है), घनी wiring, और कई qubits पर लगातार two-qubit fidelity को 99% से ऊपर ले जाना। संबंधित तरीके silicon में रखे अकेले **phosphorus donor** atoms, और diamond में **nitrogen-vacancy (NV) centres** इस्तेमाल करते हैं, जो quantum sensing के लिए ख़ास तौर पर अहम हैं (पाठ 44)।

## Topological qubits

सबसे महत्वाकांक्षी तरीका ऐसे qubits बनाने की कोशिश करता है जो error correction से नहीं, **अपनी physics से** noise से सुरक्षित हों। कुछ अनोखे materials में theory **Majorana zero modes** नाम के quasiparticles की भविष्यवाणी करती है; उनकी एक जोड़ी में साझा रखा qubit, दूर-दूर रखे जाने पर, किसी भी स्थानीय noise से परेशान नहीं हो सकता। Gates **braiding** से होंगे: quasiparticles को एक-दूसरे के गिर्द घुमाना।

Microsoft लगभग दो दशकों से इस पर लगा है। फ़रवरी 2025 में उसने **Majorana 1** घोषित किया, indium arsenide और aluminium nanowires पर आधारित chip जिसमें उसके मुताबिक़ topological qubits हैं। कई physicists अब तक के सबूत को असली topological सुरक्षा पक्की करने के लिए अपर्याप्त मानते हैं, और इस क्षेत्र के पहले के दावे (2018 के) वापस लिए गए थे। अगर यह काम करे, तो फ़ायदा बड़ा है: हर logical qubit के लिए कहीं कम physical qubits। फ़िलहाल यह सबसे कम साबित platform है।

## Platforms की तुलना

| | Superconducting | Trapped ions | Neutral atoms | Photons | Silicon में spins |
|---|---|---|---|---|---|
| Qubit | Circuit energy levels | Ion की electron states | Atom की hyperfine states | Polarisation, रास्ता या समय | Quantum dot में electron spin |
| Two-qubit gate | Cross-resonance या CZ, ≈ 30–500 ns | साझा कंपन (MS gate), ≈ 100 µs | Rydberg blockade, ≈ 0.2–1 µs | Probabilistic fusion या interference | Exchange interaction, ≈ 10–100 ns |
| सबसे अच्छी 2q fidelity | ≈ 99.7–99.9% | ≈ 99.9%+ | ≈ 99.5% | मुख्य रूप से loss से सीमित | ≈ 99%+ |
| Connectivity | पास के पड़ोसी | Trap के अंदर सब-से-सब | Atoms हिलाकर बदली जा सकती | Optical network से तय | पास के पड़ोसी |
| तापमान | ≈ 10 mK | कमरे के तापमान का vacuum system (ठंडे ions) | कमरे के तापमान का vacuum system (ठंडे atoms) | कमरे का तापमान (detectors ठंडे) | ≈ 10 mK से 1 K |
| बढ़ने की मुख्य चुनौती | Wiring और fridge की जगह | गति, कई-zone traps | गति, atom loss | Loss, source दक्षता | एकरूपता, wiring |
| खिलाड़ी | IBM, Google, Rigetti, IQM | Quantinuum, IonQ, AQT | QuEra, Pasqal, Atom Computing, Infleqtion | PsiQuantum, Xanadu, Quandela | Intel, Diraq, Quantum Motion |

कौन जीतेगा? शायद एक से ज़्यादा। बड़े computers processing के लिए एक platform और modules जोड़ने के लिए photons इस्तेमाल कर सकते हैं; sensing (पाठ 44) और communication (पाठ 41 से 43) पहले ही अलग systems पसंद करते हैं। Field में आने वाले किसी के लिए भी, इस course में सीखे मूल विचार सब पर लागू होते हैं: वे सब qubits, gates, measurements और noise हैं, एक ही गणित से बताए गए।

## आज़माकर देखें

1. Static electric field ion को क्यों नहीं फँसा सकता, और Paul trap इससे कैसे बचता है?
2. Ions की कतार में कौन-सा mode हमेशा ठीक trap frequency पर होता है? अगले mode की frequency क्या है?
3. Trapped ions कतार की किसी भी जोड़ी के बीच two-qubit gate क्यों कर सकते हैं, जबकि superconducting qubits आम तौर पर नहीं?
4. Rydberg simulation में मज़बूत blockade के तहत समय π/(√2·Ω) के बाद दो atoms किस state में पहुँचते हैं? यह entangled क्यों है?
5. HOM प्रयोग में दो photons का 90% overlap (amplitude में) है। (1 − overlap²)/2 से आप कितनी coincidence probability की उम्मीद करते हैं?
6. एक photonic protocol को 20 photons का सबका बचना चाहिए, हर एक 95% transmission के साथ। सफलता की probability क्या है?
7. Silicon में spin qubits बढ़ाने के लिए आकर्षक क्यों हैं, दो कारण दें।

**जवाब:**

1. Earnshaw का प्रमेय: static fields सिर्फ़ काठी बना सकते हैं, जो ion को किसी दिशा में बाहर धकेलती है। Paul trap काठी को radio frequency पर **दोलन** कराता है, तो औसतन ion हर दिशा में वापस खींचने वाला बल महसूस करता है।
2. **Centre-of-mass** mode, ठीक trap frequency पर; अगला (breathing) mode trap frequency का **√3 ≈ 1.732** गुना है।
3. सभी ions वही कंपन modes साझा करते हैं, तो कोई भी जोड़ी साझा गति से जुड़ सकती है। Superconducting qubits तय wiring से सिर्फ़ अपने पड़ोसियों से जुड़े हैं।
4. **(|gr⟩ + |rg⟩)/√2**, |rr⟩ की लगभग शून्य संभावना के साथ। यह entangled है क्योंकि एक atom measure करना तुरंत दूसरे को तय कर देता है: अगर एक उत्तेजित है, तो दूसरा नहीं। अकेले किसी atom की निश्चित state नहीं है।
5. (1 − 0.81)/2 = **0.095**, लगभग 9.5%।
6. 0.95²⁰ ≈ **0.36**, तो सिर्फ़ लगभग एक तिहाई कोशिशें सफल होती हैं, इसीलिए loss photonics का मुख्य दुश्मन है।
7. इनमें से कोई दो: वे बहुत छोटे हैं (लगभग 100 nm); मौजूदा semiconductor foundries में बन सकते हैं; कुछ लगभग 1 K पर चल सकते हैं, जहाँ ज़्यादा cooling ताक़त है; isotopically शुद्ध ²⁸Si लंबी coherence देता है।

## सार-सूत्र

| विचार | सूत्र या तथ्य |
|---|---|
| Earnshaw का प्रमेय | कोई static field व्यवस्था charge को स्थिर नहीं फँसाती |
| Paul trap | दोलन करती (RF) काठी; मध्यम q पर स्थिर (Mathieu समीकरण) |
| Ion qubits | Hyperfine (GHz, microwaves/Raman) या optical (THz, laser) |
| Ion कतार modes | Centre of mass ω पर, breathing √3·ω पर, …: साझा bus |
| Mølmer–Sørensen gate | साझा गति पर state-निर्भर धक्का → XX entangling gate |
| Ions: ताक़त | सबसे ऊँची fidelities (> 99.9%), सब-से-सब connectivity |
| QCCD | Chip trap के zones के बीच ions ले जाना (Quantinuum) |
| Optical tweezers | केंद्रित lasers atoms थामते हैं; दोषरहित arrays में सजाए जाते हैं |
| Rydberg blockade | मज़बूत V दोहरी उत्तेजना रोकता है → (\|gr⟩ + \|rg⟩)/√2, CZ gates |
| Neutral atoms: ताक़त | हज़ारों एक जैसे qubits, हिलाकर बदली connectivity |
| Photon qubits | Polarisation, रास्ता, time bin; कमरे का तापमान, networks के लिए आदर्श |
| KLM (2001) | Linear optics + detection + feed-forward → universal (probabilistic gates) |
| HOM असर | 50:50 splitter पर एक जैसे photons साथ निकलते हैं; coincidence = (1 − overlap²)/2 |
| Photonic computing | Cluster states पर measurement/fusion-आधारित; loss दुश्मन (ηⁿ) |
| Spin qubits | Quantum dot में electron spin; ≈ 100 nm, foundry में बने, coherence के लिए ²⁸Si |
| Topological | Majorana modes, braiding; Microsoft का Majorana 1 (2025) अब भी बहस में |
