---
layout: ../../../layouts/Post.astro
lang: hi
title: "Superconducting qubits और control electronics"
description: "सबसे ज़्यादा इस्तेमाल होने वाले quantum hardware के अंदर, chip से rack तक। Josephson junction और transmon (energy levels निकाले गए), microwave gates और DRAG pulses (simulate किए गए), cross-resonance और CZ two-qubit gates, dispersive readout और उसका गति-बनाम-सटीकता का समझौता, IQ mixers और FPGA control, dilution refrigerator और उसके attenuators, और बड़ा बनाने की engineering समस्याएँ।"
date: 2026-11-04
category: lesson
lesson: 38
---

Superconducting circuits IBM और Google के quantum computers के पीछे का platform हैं, ज़्यादातर cloud पर उपलब्ध machines के पीछे, और पाठ 35 के threshold-से-नीचे error correction के पीछे। यही वह platform भी है जहाँ quantum computing सबसे ज़्यादा साधारण electrical engineering जैसा दिखता है: qubits chip पर छपे circuits हैं, electronics के racks से आते microwave pulses से नियंत्रित, और signals coaxial cables से होकर एक refrigerator में जाते हैं।

यह पाठ उस पूरी कड़ी का पीछा करता है। हम ख़ुद qubit की physics से शुरू करेंगे, उसके energy levels निकालेंगे, उसे चलाने वाले pulses simulate करेंगे, और फिर signals का पीछा amplifiers, mixers, FPGAs और wiring से होकर करेंगे जो एक चलती machine बनाते हैं। अगर आपने RF, FPGAs या embedded control पर काम किया है, तो इसका बहुत हिस्सा जाना-पहचाना लगेगा, और आप ठीक-ठीक देखेंगे कि उन skills की कहाँ ज़रूरत है।

## LC circuit से qubit तक

कुछ धातुएँ, जैसे aluminium (लगभग 1.2 K से नीचे) और niobium (लगभग 9 K से नीचे), ठंडी होने पर **superconductors** बन जाती हैं: उनके electrons जोड़ी बनाकर **Cooper pairs** बनते हैं जो शून्य resistance से बहते हैं। Superconducting circuit में resistance से कोई energy नहीं जाती, तो वह quantum state लंबे समय तक रख सकता है।

सबसे सरल circuit, एक inductor L और एक capacitor C, frequency f = 1/(2π√(LC)) वाला oscillator है। Quantum mechanics से देखें तो उसके energy levels बराबर दूरी पर हैं, hf के अंतर पर। जैसा पाठ 37 ने दिखाया, qubit के रूप में यह बेकार है: 0 → 1 पलटने वाली drive 1 → 2 → 3 भी चढ़ाती है।

इलाज है **Josephson junction**: लगभग एक nanometre मोटी insulating दीवार से अलग दो superconductors (आम तौर पर aluminium, aluminium oxide की पतली परत, और फिर aluminium)। Cooper pairs दीवार के आर-पार **tunnel** करते हैं, और junction ऐसे inductor की तरह बर्ताव करता है जिसकी inductance उससे बहते current पर निर्भर है। वही **nonlinearity** energy levels को असमान दूरी पर कर देती है। Brian Josephson ने 1962 में 22 साल के छात्र के रूप में इस असर की भविष्यवाणी की और 1973 का Nobel पुरस्कार साझा किया; 2025 का Physics Nobel John Clarke, Michel Devoret और John Martinis को मिला, यह दिखाने के लिए कि 1980 के दशक में ऐसे circuits सच्ची quantum चीज़ों की तरह बर्ताव करते हैं।

Capacitor के साथ parallel में junction का Hamiltonian है

> H = 4E_C (n − n_g)² − E_J cos φ

जहाँ n tunnel हुए Cooper pairs गिनता है, φ junction के आर-पार superconducting phase है, **E_C** **charging energy** है (capacitance से तय), **E_J** **Josephson energy** है (junction से तय), और n_g environment से आया एक भटका "offset charge" है जिस पर किसी का नियंत्रण नहीं।

## Transmon

इस circuit का शुरुआती रूप, **Cooper-pair box** (लगभग 1999), में E_J, E_C के बराबर था। वह चलता था, लेकिन उसकी frequency भटके charge के हर उतार-चढ़ाव के साथ उछलती थी, जिससे coherence times बहुत छोटे थे। 2007 में Yale के Jens Koch और साथियों ने एक सरल इलाज सुझाया: E_C छोटा करने के लिए बड़ा capacitor जोड़ो, ताकि E_J/E_C लगभग 50 हो। उन्होंने इसे **transmon** कहा। Hamiltonian को Cooper-pair संख्या n के basis में matrix लिखकर numerically हल करें और देखें यह क्यों काम करता है:

```python
import numpy as np

def transmon_levels(EJ_over_EC, EC=0.25, ng=0.0, cut=30):
    """Energy levels (GHz) of H = 4E_C(n - n_g)² - E_J cos φ, in the basis of Cooper-pair number n."""
    n = np.arange(-cut, cut + 1)
    H = np.diag(4 * EC * (n - ng) ** 2) - 0.5 * EJ_over_EC * EC * (np.eye(len(n), k=1) + np.eye(len(n), k=-1))
    E = np.linalg.eigvalsh(H)
    return E - E[0]

def readable(ghz):
    hz = ghz * 1e9
    for unit, size in [("MHz", 1e6), ("kHz", 1e3), ("Hz", 1)]:
        if hz >= size:
            return f"{hz / size:6.1f} {unit}"
    return f"{hz:6.2f} Hz"

print("E_J/E_C    f01 (GHz)   anharmonicity (MHz)   f01 shift from stray charge")
for ratio in [1, 5, 20, 50, 100]:
    E = transmon_levels(ratio)
    f01, f12 = E[1], E[2] - E[1]
    f01_half = transmon_levels(ratio, ng=0.5)[1]          # worst-case stray charge on the island
    print(f"{ratio:6d}     {f01:7.3f}        {1000 * (f12 - f01):8.1f}            {readable(abs(f01 - f01_half)):>12s}")
```

```text
E_J/E_C    f01 (GHz)   anharmonicity (MHz)   f01 shift from stray charge
     1       1.025          -994.8               776.2 MHz
     5       1.411          -881.2               268.3 MHz
    20       2.889          -363.8                 4.4 MHz
    50       4.735          -287.3                 9.9 kHz
   100       6.811          -273.9                  6.3 Hz
```

E_J/E_C बढ़ने के साथ columns पढ़ें:

- **Frequency microwave range में चढ़ती है।** E_J/E_C = 50 पर qubit 4.7 GHz पर है। एक अच्छा अनुमान है f₀₁ ≈ √(8E_J·E_C) − E_C।
- **Anharmonicity घटती है, लेकिन धीरे।** वह −E_C के पास ठहरती है, यहाँ लगभग −270 से −290 MHz। 1 → 2 को छुए बिना 0 → 1 को address करने के लिए यह अब भी काफ़ी है।
- **भटके charge के प्रति संवेदनशीलता exponentially गिरती है।** E_J/E_C = 1 पर सैकड़ों MHz से, 50 पर 10 kHz और 100 पर कुछ Hz तक।

वह सौदा, थोड़ी anharmonicity छोड़कर charge noise से लगभग अछूता होना, ही वजह है कि transmon field का workhorse बना। आज का आम transmon f₀₁ ≈ 4 से 6 GHz, anharmonicity ≈ −200 से −340 MHz, और सबसे अच्छे devices पर लगभग 100 से 300 µs का T1 रखता है।

## Single-qubit gates: microwave pulses और DRAG

Single-qubit gate qubit की frequency पर एक आकार दिया microwave pulse है, जैसे पाठ 37 के Rabi oscillations में। उसकी लंबाई एक समझौता है। छोटा coherence के लिए बेहतर है, लेकिन छोटे pulse का frequency spectrum चौड़ा होता है, और चौड़ा spectrum सिर्फ़ कुछ सौ MHz दूर के 1 → 2 transition तक पहुँच जाता है। तब दो चीज़ें बिगड़ती हैं: population |2⟩ में **leak** होती है, और पास का level pulse के दौरान qubit की frequency खिसकाता है, जिससे **phase errors** आते हैं।

मानक इलाज **DRAG** है (Derivative Removal by Adiabatic Gate, Motzoi और साथी, 2009): दूसरे quadrature (Y axis) पर एक दूसरा हिस्सा जोड़ो, मुख्य pulse के **derivative** के आकार का और 1/anharmonicity से scale किया। तीन-level transmon पर X gate simulate करें, उसके साथ और बिना:

```python
import numpy as np
from scipy.linalg import expm

alpha = 2 * np.pi * -0.25                    # anharmonicity: -250 MHz, in radians per ns
a = np.diag([1, np.sqrt(2)], k=1)            # lowering operator on levels 0, 1, 2
X_drive, Y_drive = a + a.T, 1j * (a.T - a)
H_anh = np.diag([0, 0, alpha])

def x_gate(duration, beta, steps=400):
    """Apply a Gaussian π pulse (plus a DRAG correction of strength beta) to a 3-level transmon."""
    t = np.linspace(0, duration, steps + 1)
    mid, sigma, dt = duration / 2, duration / 4, duration / steps
    g = np.exp(-((t - mid) ** 2) / (2 * sigma ** 2)) - np.exp(-((mid) ** 2) / (2 * sigma ** 2))
    omega_x = np.pi * g / (g.sum() * dt)                       # area π: a full flip
    omega_y = -beta * np.gradient(omega_x, dt) / alpha        # DRAG: the derivative on the other axis
    U = np.eye(3, dtype=complex)
    for k in range(steps):
        H = H_anh + 0.5 * omega_x[k] * X_drive + 0.5 * omega_y[k] * Y_drive
        U = expm(-1j * H * dt) @ U
    leak = abs(U[2, 0]) ** 2                                   # population sent to |2⟩ from |0⟩
    Uq = U[:2, :2]
    fid = (abs(np.trace(np.array([[0, 1], [1, 0]]) @ Uq)) ** 2 + np.trace(Uq.conj().T @ Uq).real) / 6
    return leak, 1 - fid

print("pulse      plain Gaussian            with DRAG (β = 0.5)")
print("length     leakage   gate error      leakage   gate error")
for T in [8, 12, 20, 40]:
    l0, e0 = x_gate(T, 0.0)
    l1, e1 = x_gate(T, 0.5)
    print(f"{T:3d} ns     {l0:.1e}   {e0:.1e}         {l1:.1e}   {e1:.1e}")
```

```text
pulse      plain Gaussian            with DRAG (β = 0.5)
length     leakage   gate error      leakage   gate error
  8 ns     1.9e-03   2.8e-02         4.0e-04   9.2e-04
 12 ns     2.1e-04   1.2e-02         5.0e-05   1.5e-04
 20 ns     2.7e-05   4.3e-03         6.7e-06   1.9e-05
 40 ns     1.7e-06   1.1e-03         4.3e-07   1.2e-06
```

8 ns pulse के लिए सादे Gaussian में 2.8% gate error है, इस्तेमाल लायक़ नहीं। DRAG हिस्से के साथ error 0.09% पर गिरता है, लगभग 30 गुना बेहतर। 20 ns pulse के लिए वह 0.4% से 0.002% पर गिरता है। DRAG gates को छोटा **और** सटीक दोनों बनाने देता है, इसीलिए हर superconducting control system इसे इस्तेमाल करता है। असली systems हर qubit के लिए DRAG ताक़त β calibrate करते हैं। (इस सरल model में β = 0.5 phase error सबसे अच्छा रद्द करता है, जबकि β = 1 सबसे ज़्यादा leakage हटाता है; calibration असली device के लिए सबसे अच्छा समझौता ढूँढता है।)

## Two-qubit gates

दो transmons एक छोटे capacitor या coupling circuit से जुड़े होते हैं। दो अग्रणी तरीके two-qubit gate बिल्कुल अलग तरह बनाते हैं।

**Cross-resonance (IBM)।** Qubits की frequencies तय हैं। उन्हें entangle करने के लिए **control** qubit को **target** qubit की frequency पर microwave pulse से drive करते हैं। Coupling के ज़रिए यह target को X के गिर्द ऐसी दिशा में घुमाता है जो control की state पर निर्भर है: Z⊗X रूप का interaction। 90° ZX rotation, और single-qubit सुधार, एक CNOT है:

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Operator

# Cross-resonance: drive the control qubit at the TARGET's frequency. The result is a ZX interaction,
# exp(-i·θ/2·Z⊗X): the target rotates about X one way if the control is |0⟩, the other way if it is |1⟩.
cr = QuantumCircuit(2)
cr.rzx(np.pi / 2, 0, 1)          # a 90° ZX rotation (qubit 0 = control, qubit 1 = target)
cr.rz(-np.pi / 2, 0)             # plus two single-qubit corrections
cr.rx(-np.pi / 2, 1)

cnot = QuantumCircuit(2)
cnot.cx(0, 1)
print("ZX(90°) + two single-qubit rotations = CNOT (up to a global phase):",
      Operator(cr).equiv(Operator(cnot)))
```

```text
ZX(90°) + two single-qubit rotations = CNOT (up to a global phase): True
```

तय frequencies qubits को सरल और स्थिर बनाती हैं, लेकिन पड़ोसी qubits की frequencies टकरानी नहीं चाहिए, जो chip design को बाँधता है।

**Tunable qubits और couplers (Google और दूसरे)।** यहाँ qubit या coupler में एक छोटा loop (एक SQUID) है जिसकी frequency magnetic flux से tune की जा सकती है, जो on-chip line में current से लगाया जाता है। **CZ** gate बनाने के लिए qubits को थोड़ी देर resonance में लाया जाता है ताकि |11⟩, non-qubit state |20⟩ से interact करे, −1 का phase उठाए, और लौट आए। Qubits के बीच **tunable coupler** interaction को सिर्फ़ gate के दौरान चालू करता है, बाक़ी समय crosstalk घटाते हुए। IBM की नई chips भी tunable couplers इस्तेमाल करती हैं।

Two-qubit gates design के हिसाब से लगभग 30 से 500 ns लेते हैं, और सबसे अच्छे लगभग 0.1 से 0.3% errors तक पहुँचते हैं।

## Qubit को पढ़ना

हर transmon अपने **readout resonator** से जुड़ा है, लगभग 7 GHz का एक microwave resonator। Coupling की वजह से resonator की frequency qubit की state के हिसाब से थोड़ी, ±χ, खिसकती है। यह **dispersive readout** है। Resonator frequency के पास भेजा छोटा microwave tone |0⟩ और |1⟩ के लिए थोड़े अलग phase और amplitude के साथ लौटता है। अलग frequencies वाले कई resonators एक feedline साझा कर सकते हैं, तो एक cable कई qubits पढ़ता है (**frequency multiplexing**)।

लौटता signal बहुत छोटा है, कुछ photons, तो उसे **amplifiers** चाहिए। पहला एक **quantum-limited amplifier** है ठीक mixing-chamber stage पर (Josephson parametric amplifier, या travelling-wave parametric amplifier, TWPA), जो लगभग कोई noise नहीं जोड़ता। उसके बाद 4 K पर एक **HEMT** transistor amplifier, फिर कमरे के तापमान वाले amplifiers।

Readout में एक क्लासिक engineering समझौता है। Signal को ज़्यादा देर integrate करने से noise औसत होकर घटता है, लेकिन |1⟩ वाला qubit measurement के दौरान **गिर** सकता है और 0 पढ़ा जा सकता है:

```python
import numpy as np
from scipy.special import erfc

T1 = 50e-6                                   # qubit lifetime: 50 µs

def readout_error(tau, snr_100ns):
    """snr_100ns: separation of the |0⟩ and |1⟩ signals divided by the noise, after 100 ns."""
    snr = snr_100ns * np.sqrt(tau / 100e-9)             # signal grows like τ, noise like √τ
    overlap = 0.5 * erfc(snr / (2 * np.sqrt(2)))        # the two noisy blobs overlap
    decay = 0.5 * (1 - np.exp(-tau / (2 * T1)))         # |1⟩ decays during the first half: misread
    return overlap, decay

print("integration   from noise   from T1 decay   total error")
for tau_ns in [100, 400, 800, 1200, 2000, 4000]:
    ov, dec = readout_error(tau_ns * 1e-9, 1.5)
    print(f"  {tau_ns:5d} ns     {ov:.2e}      {dec:.2e}      {ov + dec:.2e}")

taus = np.linspace(20e-9, 5e-6, 5000)
for name, snr in [("ordinary amplifier", 1.5), ("quantum-limited amplifier (3× better SNR)", 4.5)]:
    errors = [sum(readout_error(t, snr)) for t in taus]
    k = int(np.argmin(errors))
    print(f"{name}: best time ≈ {taus[k] * 1e9:.0f} ns, error {errors[k]:.1e}")
```

```text
integration   from noise   from T1 decay   total error
    100 ns     2.27e-01      5.00e-04      2.27e-01
    400 ns     6.68e-02      2.00e-03      6.88e-02
    800 ns     1.69e-02      3.98e-03      2.09e-02
   1200 ns     4.69e-03      5.96e-03      1.07e-02
   2000 ns     3.98e-04      9.90e-03      1.03e-02
   4000 ns     1.05e-06      1.96e-02      1.96e-02
ordinary amplifier: best time ≈ 1546 ns, error 9.3e-03
quantum-limited amplifier (3× better SNR): best time ≈ 250 ns, error 1.4e-03
```

साधारण amplifier के साथ सबसे अच्छा लगभग 1.5 µs और 0.9% error है: छोटे readouts में noise हावी है, लंबों में decay। Quantum-limited amplifier signal-to-noise अनुपात तिगुना करता है और सबसे अच्छे बिंदु को लगभग 250 ns और 0.14% error पर ले आता है। इसीलिए parametric amplifiers मानक बन गए: तेज़, सटीक readout error correction के लिए ज़रूरी है, जो हर cycle में आधे qubits measure करता है। (असली devices **Purcell filters** भी जोड़ते हैं, जो qubit को अपनी ही readout line से बाहर गिरने से रोकते हैं।)

## Control electronics

हर pulse computer में संख्याओं के रूप में शुरू होता है और qubit पर सटीक आकार के microwave झोंके के रूप में ख़त्म। यहाँ आम कड़ी है।

**Pulse बनाना।** एक arbitrary waveform generator (AWG), जिसके केंद्र में लगभग 1 से 10 GS/s पर sample करने वाला तेज़ **DAC** है, लगभग 100 MHz की **intermediate frequency** पर दो baseband signals, I और Q, बनाता है। एक **IQ mixer** उन्हें, मान लें, 4.9 GHz के **local oscillator** (LO) से गुणा करके जोड़ता है, और 5.0 GHz पर tone बनता है। IQ mixing की ख़ूबी यह है कि अंतिम microwave pulse का amplitude और phase पूरी तरह digital I और Q samples से तय होता है, इसी तरह DRAG आकार और virtual Z phases लगाए जाते हैं।

Ideal IQ mixer सिर्फ़ चाहा गया sideband (LO + IF) देता है। थोड़े असंतुलित I और Q रास्तों वाला असली mixer LO − IF पर एक अनचाही **image** भी रिसाता है:

```python
import numpy as np

fs = 40e9                                     # simulate the analogue signals at 40 GS/s
t = np.arange(0, 400e-9, 1 / fs)              # a 400 ns window
f_lo, f_if = 4.9e9, 100e6                     # local oscillator and intermediate frequency
target = f_lo + f_if                          # we want a tone at 5.0 GHz, the qubit frequency

def mixer_output(gain_error=0.0, phase_error_deg=0.0):
    """The AWG makes I and Q at 100 MHz; an IQ mixer multiplies them with the LO and adds them."""
    phi = np.deg2rad(phase_error_deg)
    I = np.cos(2 * np.pi * f_if * t)
    Q = (1 + gain_error) * np.sin(2 * np.pi * f_if * t + phi)
    return I * np.cos(2 * np.pi * f_lo * t) - Q * np.sin(2 * np.pi * f_lo * t)

def tone_db(signal, f):
    spectrum = np.abs(np.fft.rfft(signal * np.hanning(len(signal))))
    freqs = np.fft.rfftfreq(len(signal), 1 / fs)
    return 20 * np.log10(spectrum[np.argmin(abs(freqs - f))] + 1e-12)

for name, g, p in [("perfect mixer", 0, 0), ("2% gain, 2° phase error", 0.02, 2.0)]:
    out = mixer_output(g, p)
    wanted, image = tone_db(out, target), tone_db(out, f_lo - f_if)
    print(f"{name:25s}  5.0 GHz tone: {wanted - wanted:5.1f} dB   unwanted 4.8 GHz image: {image - wanted:6.1f} dB")
```

```text
perfect mixer              5.0 GHz tone:   0.0 dB   unwanted 4.8 GHz image: -160.2 dB
2% gain, 2° phase error    5.0 GHz tone:   0.0 dB   unwanted 4.8 GHz image:  -34.0 dB
```

सिर्फ़ 2% gain mismatch और 2° phase error से image चाहे गए tone से सिर्फ़ 34 dB नीचे, 4.8 GHz पर, आती है, जो किसी पड़ोसी qubit की frequency हो सकती है। तो mixers को I और Q पहले से बिगाड़कर calibrate किया जाता है। बढ़ते हुए systems analogue mixing पूरी तरह छोड़कर **direct RF synthesis** इस्तेमाल करते हैं: RF system-on-chip devices (जैसे AMD का RFSoC) में इतने तेज़ DACs और ADCs (कई GS/s) होते हैं कि microwave signals सीधे बनाए और पकड़े जा सकें, उसी chip पर FPGA के साथ।

**Sequencing।** एक **FPGA** कई qubits के pulses nanosecond timing से चलाता है, हर qubit का phase track करता है (virtual Z gates FPGA में बस phase updates हैं), और **feed-forward** संभालता है: measurement नतीजा पढ़कर कुछ सौ nanoseconds में अगला pulse चुनना। Mid-circuit measurement, teleportation जैसे circuits और error correction सब इस पर निर्भर हैं।

**Readout processing।** लौटता signal **ADC** से digitise होता है, digitally baseband पर लाया जाता है, और एक weighting function के साथ integrate होकर हर measurement पर IQ plane में एक बिंदु देता है। एक threshold (या छोटा classifier) उस बिंदु को 0 या 1 में बदलता है।

Error correction के लिए समय का budget तंग है: surface-code cycle लगभग 1 µs लेता है, और decoder को साथ चलना है। इसीलिए real-time decoders बढ़ते हुए FPGAs या custom chips पर बनाए जाते हैं। Quantum computing companies ठीक इसी परत के लिए बहुत से FPGA, firmware और RF engineers रखती हैं।

## Refrigerator के अंदर

**Dilution refrigerator** helium के दो isotopes (³He और ⁴He) मिलाकर ठंडा करता है। वह plates के ढेर के रूप में बना है, हर एक ऊपर वाली से ठंडी:

| Stage | तापमान | वहाँ क्या है |
|---|---|---|
| ऊपरी plate | 300 K | Connectors, बाहर कमरे के तापमान का electronics |
| पहला stage | ≈ 50 K | Radiation shields, cables के heat sinks |
| दूसरा stage | ≈ 4 K | HEMT amplifiers, attenuators |
| Still | ≈ 1 K | Attenuators |
| Cold plate | ≈ 100 mK | Attenuators, filters |
| Mixing chamber | ≈ 10 mK | Chip, quantum-limited amplifiers, circulators |

Input lines पर इतने **attenuators** क्यों? क्योंकि कमरे के तापमान से आता coaxial cable thermal microwave noise ढोता है: 5 GHz पर 300 K की line औसतन लगभग 1,250 thermal photons ढोती है। Readout resonator में कोई भी भटका photon qubit की frequency random रूप से खिसकाकर उसे dephase करता है। हर attenuator आते noise का ज़्यादातर हिस्सा सोखता है, लेकिन अपने तापमान पर अपना thermal noise भी छोड़ता है, तो उन्हें क्रमशः ठंडे stages पर रखना होता है:

```python
import numpy as np

h, k_B, f = 6.626e-34, 1.381e-23, 5e9          # a 5 GHz signal line

def thermal_photons(T):
    """Average number of thermal microwave photons at frequency f and temperature T (Bose-Einstein)."""
    return 1 / np.expm1(h * f / (k_B * T))

# Each attenuator passes a fraction A of what comes in, and adds its own thermal noise times (1 - A)
stages = [("room temperature", 300, 0), ("4 K plate", 4, 20), ("100 mK plate", 0.1, 20), ("mixing chamber", 0.015, 20)]
n = thermal_photons(300)
print(f"{'stage':18s} {'attenuation':>11s}   photons arriving below it")
print(f"{'room temperature':18s} {'':>11s}   {n:10.3g}")
for name, T, dB in stages[1:]:
    A = 10 ** (-dB / 10)
    n = n * A + thermal_photons(T) * (1 - A)
    print(f"{name:18s} {dB:8d} dB   {n:10.3g}")
```

```text
stage              attenuation   photons arriving below it
room temperature                   1.25e+03
4 K plate                20 dB         28.5
100 mK plate             20 dB        0.384
mixing chamber           20 dB      0.00384
```

तीन ठंडे stages पर फैला साठ decibel attenuation noise को हज़ार से ज़्यादा photons से कुछ हज़ारवें हिस्से तक ले आता है। इसीलिए control pulses कमरे के तापमान पर ताक़तवर शुरू होते हैं, और output (readout) lines इसके बजाय **circulators और isolators** इस्तेमाल करती हैं, जो signal को बाहर जाने देते हैं लेकिन noise को वापस आने से रोकते हैं।

## बड़ा बनाने की समस्या

एक अच्छा transmon बनाना हल हो चुका है। दस लाख बनाना नहीं, और रुकावटें ज़्यादातर engineering की हैं:

- **Wiring।** हर qubit को एक से तीन control lines और readout lines का हिस्सा चाहिए। हर coaxial cable fridge में गर्मी लाता है, और mixing chamber 20 mK पर सिर्फ़ लगभग 10 से 20 microwatts हटा सकता है। सैकड़ों qubits पहले ही एक बड़ा fridge भर देते हैं। हल में लचीले ribbon cables, multiplexing, और **cryo-CMOS** control chips शामिल हैं जो 4 K पर बैठकर qubits के पास pulses बनाती हैं।
- **Frequency की भीड़।** हर qubit को अपनी frequency चाहिए, पड़ोसियों से अलग। Junction fabrication पूरी तरह दोहराने योग्य नहीं, तो frequencies बिखरती हैं। जैसे IBM fabrication के बाद अलग-अलग junctions को trim करने के लिए laser annealing इस्तेमाल करता है।
- **Materials।** T1 मुख्य रूप से chip के oxides और सतहों में सूक्ष्म दोषों से सीमित है, जिन्हें **two-level systems** कहते हैं, जो random frequencies पर energy सोखते हैं। बेहतर materials, जैसे niobium की जगह tantalum, और साफ़ fabrication ने T1 को लगातार बढ़ाया है।
- **Correlated errors।** Cosmic rays और प्राकृतिक radioactivity chip में energy छोड़कर थोड़ी देर कई qubits को एक साथ परेशान कर सकते हैं (पाठ 32)। Chips में अब इस energy को बहा ले जाने वाली features होती हैं।
- **Modularity।** एक विशाल chip के बजाय roadmaps कई chips या fridges को जोड़ते हैं, microwave links या optical photons में बदलकर (पाठ 42)।

## हालात कहाँ हैं

2026 तक अग्रणी superconducting machines में IBM के **Heron** processors (tunable couplers के साथ 133 से 156 qubits), IBM का **Nighthawk** (2025 के अंत में घोषित, square lattice में 120 qubits, हर qubit के ज़्यादा connections के साथ), Google का 105-qubit **Willow**, और चीन का 105-qubit **Zuchongzhi 3.0** शामिल हैं। IBM ने 2023 में 1,121-qubit **Condor** भी बनाया, मुख्य रूप से पैमाने की engineering से जूझने के लिए, और लगभग 2029 में qLDPC codes (पाठ 34) के साथ fault-tolerant machine **Starling** की योजना है। पाठ 40 दिखाता है कि अपने circuits IBM के hardware पर कैसे भेजें।

## आज़माकर देखें

1. एक transmon का E_C/h = 300 MHz और E_J/E_C = 50 है। √(8E_J·E_C) − E_C से f₀₁ का अनुमान लगाएँ, और उसकी anharmonicity।
2. Transmon बड़ा E_J/E_C क्यों इस्तेमाल करता है, और क्या छोड़ता है?
3. DRAG simulation में DRAG से ज़्यादा फ़ायदा किसे मिलता है: 8 ns pulse को या 40 ns pulse को? छोटे pulses इस मेहनत के लायक़ क्यों हैं?
4. Cross-resonance pulse control को target की frequency पर drive करता है। वह कौन-सा interaction बनाता है?
5. Readout model में 2 µs के बजाय 4 µs integrate करने पर कुल error बदतर क्यों होता है?
6. एक IQ mixer का LO = 6.0 GHz और IF = 150 MHz है। चाहा गया tone और image कहाँ हैं?
7. तीन ठंडे stages में से हर एक पर 20 dB के बजाय कमरे के तापमान पर एक 60 dB attenuator क्यों नहीं लगा सकते?

**जवाब:**

1. E_J/h = 50 × 0.3 = 15 GHz, तो √(8 × 15 × 0.3) − 0.3 = √36 − 0.3 = **5.7 GHz**। Anharmonicity ≈ −E_C ≈ **−300 MHz** (परिमाण में थोड़ी ज़्यादा)।
2. बड़ा E_J/E_C frequency को भटके charge के प्रति exponentially असंवेदनशील बनाता है, जो लंबी coherence देता है। वह कुछ **anharmonicity** छोड़ता है, जो −E_C की ओर गिरती है, तो pulses ज़्यादा सावधानी से आकार देने पड़ते हैं।
3. **8 ns** pulse: उसका error 2.8% से 0.09% पर गिरता है, जबकि 40 ns pulse पहले ही काफ़ी अच्छा था। छोटे pulses का मतलब coherence time में ज़्यादा gates।
4. **Z⊗X** interaction: target X के गिर्द ऐसी दिशा में घूमता है जो control के Z मान पर निर्भर है। 90° ZX और single-qubit rotations एक CNOT देते हैं।
5. 2 µs पर noise पहले ही छोटा है, लेकिन measurement के दौरान |1⟩ के गिरने की संभावना समय के साथ बढ़ती रहती है (यहाँ 4 µs पर लगभग 2%)।
6. चाहा गया tone **6.15 GHz** पर (LO + IF); image **5.85 GHz** पर (LO − IF)।
7. Attenuator **अपने** तापमान पर thermal noise छोड़ता है। 300 K वाला लगभग 1,250 × (1 − 10⁻⁶) ≈ 1,250 photons का noise फिर जोड़ देता। सिर्फ़ ठंडे attenuators ही ज़्यादा वापस जोड़े बिना noise सोख सकते हैं।

## सार-सूत्र

| विचार | सूत्र या तथ्य |
|---|---|
| Superconductivity | शून्य resistance: Al ≈ 1.2 K से नीचे, Nb ≈ 9 K से नीचे; Cooper pairs |
| Josephson junction | Superconductor–insulator–superconductor; nonlinear inductance |
| Hamiltonian | H = 4E_C(n − n_g)² − E_J cos φ |
| Transmon | E_J/E_C ≈ 50: charge से अछूता; f₀₁ ≈ √(8E_J·E_C) − E_C, α ≈ −E_C |
| आम संख्याएँ | f₀₁ ≈ 4–6 GHz, α ≈ −200 से −340 MHz, T1 ≈ 100–300 µs (सबसे अच्छे) |
| DRAG | दूसरे quadrature पर pulse का derivative; leakage और phase error घटाता है |
| Cross-resonance | Control को target frequency पर drive करो → ZX → CNOT (IBM) |
| Tunable coupler के साथ CZ | \|11⟩ को \|20⟩ के पास लाओ, −1 phase उठाओ (Google) |
| Dispersive readout | Qubit state से resonator ±χ खिसकता है; frequency-multiplexed feedlines |
| Readout समझौता | लंबा integration: कम noise, ज़्यादा T1 decay; quantum-limited amps मदद करते हैं |
| Amplifier कड़ी | mK पर JPA/TWPA, 4 K पर HEMT, फिर कमरे का तापमान |
| IQ mixing | Output = LO ± IF; असंतुलन image रिसाता है; calibrate करो या direct RF synthesis |
| FPGA control | ns timing, phase tracking (virtual Z), सैकड़ों ns में feed-forward |
| Attenuators | ठंडे stages पर फैले; 5 GHz पर 300 K line ≈ 1,250 photons |
| बड़ा बनाने की समस्याएँ | Wiring की गर्मी, frequency की भीड़, material दोष (TLS), correlated errors, modularity |
