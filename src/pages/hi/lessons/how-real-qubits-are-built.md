---
layout: ../../../layouts/Post.astro
lang: hi
title: "असली qubits कैसे बनते हैं"
description: "गणित से पदार्थ तक: physical qubit क्या है, ज़्यादातर को अंतरिक्ष से भी ठंडा क्यों होना पड़ता है (हिसाब के साथ), gate असल में एक सावधानी से समय दिया pulse कैसे है (Rabi oscillations simulate करके), qubit साधारण oscillator क्यों नहीं हो सकता, qubits कैसे पढ़े जाते हैं, DiVincenzo मानदंड, machines की तुलना कैसे करें, और मुख्य platforms एक साथ।"
date: 2026-11-04
category: lesson
lesson: 37
---

36 पाठों तक qubit दो complex संख्याओं का column रहा, और gate एक matrix। Algorithms के बारे में सोचने का यही सही तरीका है। लेकिन कहीं न कहीं किसी असली चीज़ को वे संख्याएँ रखनी होती हैं, और hardware के किसी असली हिस्से को वे matrices लगानी होती हैं। यह पाठ उसी physical परत के बारे में है: qubit असल में क्या है, उसे कैसे नियंत्रित करते हैं, कैसे पढ़ते हैं, और कैसे परखें कि कोई machine अच्छी है या नहीं। पाठ 38 और 39 फिर अग्रणी technologies में गहराई से जाते हैं।

अगर आप electronics या embedded systems से आते हैं, तो quantum computing का यही हिस्सा सबसे जाना-पहचाना लगेगा। इसका बड़ा हिस्सा signals, timing, noise और control के बारे में है।

## Qubit यानी दो energy levels

लगभग कोई भी quantum system जिसमें **दो अलग energy levels** हों जिन्हें आप नियंत्रित कर सकें, qubit बन सकता है। निचला level |0⟩ बनता है और ऊपरी |1⟩। उनके बीच का energy अंतर ΔE, Planck के संबंध से, एक **frequency** तय करता है:

> ΔE = h·f   (h = 6.626 × 10⁻³⁴ J·s, Planck का स्थिरांक)

वह frequency qubit की "tuning" है: वह प्रकाश या microwaves की frequency है जो |0⟩ और |1⟩ के बीच transitions कराती है, और इसी से आप एक qubit को दूसरे को छुए बिना address करते हैं।

| Platform | \|0⟩ और \|1⟩ क्या हैं | Qubit frequency |
|---|---|---|
| Superconducting circuit (transmon) | Chip पर एक छोटे electrical circuit की दो सबसे निचली energy states | ≈ 4 से 8 GHz (microwaves) |
| Trapped ion, hyperfine qubit | Ion के electron और nucleus spins की दो states, जैसे ¹⁷¹Yb⁺ में | ≈ 12.6 GHz |
| Trapped ion, optical qubit | एक ground और एक लंबे समय तक टिकने वाली excited electron state, जैसे ⁴⁰Ca⁺ में | ≈ 411 THz (729 nm लाल प्रकाश) |
| Neutral atom | दो hyperfine ground states, जैसे ⁸⁷Rb में | ≈ 6.8 GHz |
| Silicon में electron spin | Magnetic field में spin up और spin down | ≈ 10 से 40 GHz |
| Photon | Horizontal या vertical polarisation, या दो में से कौन-सा रास्ता | (energy gap नहीं; photon ख़ुद qubit ढोता है) |

Physics बेहद अलग है, लेकिन आपका सीखा गणित सब पर लागू होता है। यही abstraction की ताक़त है।

## ठंडा रखना (या नहीं)

Qubit का environment हमेशा energy जोड़ने या घटाने की कोशिश करता है। अगर आसपास गर्म है, तो random thermal energy qubit को अपने आप |1⟩ में धकेल देगी, और आप साफ़ |0⟩ से शुरू भी नहीं कर पाएँगे। कितना गर्म बहुत गर्म है? Boltzmann वितरण से qubit के energy gap hf की तुलना thermal energy k_B·T से करें:

```python
import numpy as np

h, k_B = 6.62607015e-34, 1.380649e-23          # Planck and Boltzmann constants (SI, exact)

def excited_fraction(f_hz, T_kelvin):
    """Thermal chance of finding a two-level system in its upper level: Boltzmann distribution."""
    x = h * f_hz / (k_B * T_kelvin)
    return np.exp(-x) / (1 + np.exp(-x))

f = 5e9                                          # a typical superconducting qubit: 5 GHz
print(f"5 GHz qubit: hf/k_B = {h * f / k_B * 1000:.0f} mK")
for T, place in [(300, "room temperature"), (4, "liquid helium"), (0.1, "100 mK"), (0.05, "50 mK"), (0.01, "10 mK")]:
    print(f"  {place:17s} T = {T:7.3f} K   thermally excited: {excited_fraction(f, T):.2e}")
print(f"\n729 nm optical ion qubit (411 THz) at room temperature: {excited_fraction(411e12, 300):.1e}")
```

```text
5 GHz qubit: hf/k_B = 240 mK
  room temperature  T = 300.000 K   thermally excited: 5.00e-01
  liquid helium     T =   4.000 K   thermally excited: 4.85e-01
  100 mK            T =   0.100 K   thermally excited: 8.32e-02
  50 mK             T =   0.050 K   thermally excited: 8.17e-03
  10 mK             T =   0.010 K   thermally excited: 3.79e-11

729 nm optical ion qubit (411 THz) at room temperature: 2.8e-29
```

5 GHz qubit का energy gap सिर्फ़ 240 millikelvin तापमान के बराबर है। कमरे के तापमान पर या 4 K (liquid helium) पर भी qubit आधा |1⟩ में है, पूरी तरह random। सिर्फ़ लगभग 10 से 20 mK पर thermal excitation नगण्य होता है। इसीलिए superconducting और spin qubits **dilution refrigerators** में रहते हैं, जो लगभग 10 mK तक पहुँचते हैं, बाहरी अंतरिक्ष (2.7 K) से सौ गुना ठंडा। व्यवहार में तारों से नीचे रिसता भटका विकिरण असली qubits को प्रभावी रूप से 30 से 60 mK तक गर्म कर देता है, जिससे एक प्रतिशत से कम बचा excitation रहता है, जिसे हर run से पहले reset कर दिया जाता है।

आख़िरी पंक्ति दिखाती है कि **optical** qubits वाले trapped ions को ख़ुद qubit के लिए fridge क्यों नहीं चाहिए: 411 THz पर energy gap इतना बड़ा है कि कमरे का तापमान उसे बिल्कुल excite नहीं कर सकता। (Ion और atom प्रयोगों को फिर भी अति-उच्च vacuum चाहिए, और वे atoms की **गति** को लगभग absolute zero तक lasers से ठंडा करते हैं, जो अलग मामला है।) कुछ GHz वाले hyperfine ion और atom qubits भी कमरे के तापमान पर thermally मिले होते, लेकिन उन्हें **optical pumping** से तैयार किया जाता है: ऐसा laser प्रकाश डालना जो atom को तब तक excite करता रहे जब तक वह उस एक state में न गिर जाए जिसे प्रकाश छू नहीं सकता, जो तापमान से स्वतंत्र काम करता है।

## Gate एक pulse है: Rabi oscillations

Qubit को असल में घुमाते कैसे हैं? उस पर एक तरंग डालते हैं, microwaves या laser प्रकाश, उसकी frequency पर (या बहुत पास)। जब तक drive चालू है, qubit |0⟩ और |1⟩ के बीच सहजता से झूलता है। ये **Rabi oscillations** हैं, Isidor Rabi (Nobel पुरस्कार 1944) के नाम पर।

Drive के साथ घूमने वाले "rotating frame" में physics एक सरल Hamiltonian पर आ जाती है, H = (Δ/2)Z + (Ω/2)X, जहाँ **Ω** (Rabi frequency) drive की ताक़त से तय होती है और **Δ** **detuning** है, drive frequency और qubit frequency का अंतर। Qubit e^(−iHt) से बदलता है, जो resonance (Δ = 0) पर बस RX(Ω·t) है, पाठ 11 का rotation:

```python
import numpy as np
from scipy.linalg import expm

X = np.array([[0, 1], [1, 0]]); Z = np.diag([1, -1])
rabi = 2 * np.pi * 20e6                          # drive strength Ω: 20 MHz Rabi frequency (in rad/s)

def p1_after(t, detuning):
    """Chance of |1⟩ after driving |0⟩ for time t. Rotating frame: H = (Δ/2)Z + (Ω/2)X."""
    H = 0.5 * detuning * Z + 0.5 * rabi * X
    psi = expm(-1j * H * t) @ np.array([1, 0])
    return abs(psi[1]) ** 2

t_pi = np.pi / rabi                              # a π pulse: Ω·t = π
print(f"π-pulse length: {t_pi * 1e9:.0f} ns")
print("  time (ns)   on resonance   detuned by 10 MHz")
for frac in [0, 0.25, 0.5, 0.75, 1.0, 1.5, 2.0]:
    t = frac * t_pi
    print(f"   {t * 1e9:5.1f}         {p1_after(t, 0):.3f}           {p1_after(t, 2 * np.pi * 10e6):.3f}")
```

```text
π-pulse length: 25 ns
  time (ns)   on resonance   detuned by 10 MHz
     0.0         0.000           0.000
     6.2         0.146           0.145
    12.5         0.500           0.474
    18.8         0.854           0.750
    25.0         1.000           0.773
    37.5         0.500           0.189
    50.0         0.000           0.105
```

Resonance पर qubit पूरी तरह |0⟩ से |1⟩ और वापस झूलता है। पलटने के आधे समय तक drive करें, और बराबर superposition मिलता है: एक RX(π/2), Hadamard जैसे gate का hardware रूप। ठीक पलटने के समय, Ω·t = π, तक drive करें, और X gate मिलता है, जिसे **π pulse** कहते हैं। यहाँ 20 MHz Rabi frequency के साथ π pulse 25 ns लेता है।

Resonance से हटकर oscillation तेज़ है लेकिन कभी पूरी नहीं: 10 MHz detuning के साथ सबसे ज़्यादा Ω²/(Ω² + Δ²) = 80% तक पहुँचते हैं। इसीलिए हर qubit की frequency सटीक नापनी होती है और drive उस पर tune करना होता है, एक प्रक्रिया जिसे **calibration** कहते हैं, और frequencies के खिसकने पर इसे नियमित रूप से दोहराया जाता है।

Pulses के बारे में तीन और तथ्य तस्वीर पूरी करते हैं:

- **Drive का phase rotation axis तय करता है।** Microwave का phase 90° खिसकाएँ और आप X की जगह Y के गिर्द घूमते हैं।
- **Z rotations मुफ़्त हैं।** Z के गिर्द physically घुमाने के बजाय controller उस qubit के **बाद के** सारे pulses का phase बस खिसका देता है। यह "virtual Z" gate शून्य समय लेता है और उसमें शून्य error है, इसीलिए compilers को Z rotations बहुत पसंद हैं।
- **Two-qubit gates को interaction चाहिए।** Qubits को जुड़ा होना चाहिए, किसी साझा circuit हिस्से से, ions के साझा कंपन से, या excited atoms के interaction से। हर platform का two-qubit gate उसका सबसे कठिन और धीमा operation है, और error का मुख्य स्रोत।

## Qubit साधारण oscillator क्यों नहीं हो सकता

यहाँ एक बारीक लेकिन बेहद ज़रूरी शर्त है। कई physical systems, एक pendulum, एक LC circuit, प्रकाश का एक mode, **harmonic oscillators** हैं: उनके energy levels **बराबर दूरी** पर हैं, सीढ़ी के डंडों की तरह। यह हानिरहित लगता है, लेकिन qubit के लिए आफ़त है, क्योंकि 0 → 1 transition पर tune की गई drive ठीक 1 → 2, 2 → 3, इत्यादि पर भी tune है। एक qubit और एक harmonic oscillator पर वही "π pulse" लगाएँ:

```python
import numpy as np
from scipy.linalg import expm

levels, rabi = 12, 1.0
a = np.diag(np.sqrt(np.arange(1, levels)), 1)          # lowering operator of a harmonic oscillator
H_oscillator = 0.5 * rabi * (a + a.T)                  # a resonant drive; the levels are evenly spaced
H_qubit = 0.5 * rabi * np.array([[0, 1], [1, 0]])      # the same drive on a true two-level system

t = np.pi / rabi                                       # the "π pulse" that flips a qubit
qubit = np.abs(expm(-1j * H_qubit * t)[:, 0]) ** 2
osc = np.abs(expm(-1j * H_oscillator * t)[:, 0]) ** 2
print(f"{'level':22s}" + "".join(f"{n:>7d}" for n in range(5)))
print(f"{'two-level qubit':22s}" + "".join(f"{p:7.3f}" for p in qubit) + "      -" * 3)
print(f"{'harmonic oscillator':22s}" + "".join(f"{p:7.3f}" for p in osc[:5]))
```

```text
level                       0      1      2      3      4
two-level qubit         0.000  1.000      -      -      -
harmonic oscillator     0.085  0.209  0.258  0.212  0.131
```

दो-level system पूरी तरह level 1 में पलट जाता है। Harmonic oscillator, ठीक वही drive पाकर, कई levels पर फैल जाता है, level 1 में पहुँचने की सिर्फ़ 21% संभावना के साथ। उसे दो levels तक सीमित रखना असंभव है।

तो अच्छे qubit को **anharmonicity** चाहिए: 1 से 2 का अंतर 0 से 1 के अंतर से अलग होना चाहिए, ताकि drive को एक पर tune किया जा सके दूसरे को छुए बिना। Atoms और ions में यह स्वाभाविक है। Superconducting circuits इसे एक ख़ास nonlinear हिस्से, **Josephson junction**, से पाते हैं, जो पूरे पाठ 38 का विषय है। तब भी अगर pulses बहुत छोटे या तीखे हों तो कुछ population level 2 में **leak** हो सकती है, और इसे रोकने के लिए चतुर pulse आकार इस्तेमाल होते हैं।

## Qubit पढ़ना

Measurement को एक सवाल का जवाब देना है, 0 या 1, जल्दी और भरोसे से, पड़ोसी qubits को परेशान किए बिना। हर platform इसे अलग तरह करता है:

- **Superconducting qubits:** हर qubit एक छोटे microwave **resonator** से जुड़ा है। Qubit |0⟩ में है या |1⟩ में, इसके हिसाब से resonator की frequency थोड़ी खिसकती है (इसे **dispersive readout** कहते हैं)। उससे एक कमज़ोर microwave tone भेजकर और लौटे signal का phase नापकर qubit की state पता चलती है, कुछ सौ nanoseconds में।
- **Trapped ions और neutral atoms:** laser ऐसे tune किया जाता है कि एक state हर second लाखों photons बिखेरे (वह चमके) और दूसरी कोई नहीं (वह अँधेरी रहे)। Camera या photon counter देखता है **चमक = 1, अँधेरा = 0**, या उलटा।
- **Photons:** single-photon detectors दर्ज करते हैं कि photon ने कौन-सा रास्ता या polarisation लिया। सबसे अच्छे (superconducting nanowire detectors) 95% से ज़्यादा photons पकड़ते हैं।
- **Silicon में spins:** spin state को एक अकेले electron charge की मौजूदगी या ग़ैरमौजूदगी में बदला जाता है (**spin-to-charge conversion**), जिसे एक संवेदनशील transistor जैसा sensor पकड़ता है।

## DiVincenzo मानदंड

2000 में IBM के David DiVincenzo ने लिखा कि किसी भी physical system को quantum computer बनने के लिए क्या चाहिए। यह सूची आज भी मानक checklist है:

1. **अच्छी तरह समझे गए qubits का scalable system।** आपको qubits के गुण पता होने चाहिए, और बहुत सारे बना पाने चाहिए।
2. **Initialisation:** qubits को भरोसे से |0⟩ जैसी ज्ञात state पर reset करना।
3. **लंबे coherence times**, gate times से कहीं लंबे।
4. **Gates का universal set** (पाठ 17)।
5. **Qubit-विशेष measurement।**

और quantum communication के लिए दो और:

6. स्थिर qubits (computing के लिए) और उड़ने वाले qubits (भेजने के लिए) के बीच **बदलना**।
7. उड़ने वाले qubits को जगहों के बीच भरोसे से **भेजना**।

Photons स्वाभाविक उड़ने वाले qubits हैं, इसीलिए हर quantum network design (पाठ 42) में matter qubits को प्रकाश में बदलना शामिल है।

## Machines की तुलना कैसे करें

Headlines आम तौर पर **qubits की संख्या** बताती हैं। अकेले में यही सबसे कम जानकारी देने वाली संख्या है। हज़ार noisy qubits सौ अच्छे qubits से कम काम के हो सकते हैं, जैसा पाठ 32 के error budget ने दिखाया। उचित तुलना कई गुणों को साथ देखती है:

| गुण | यह क्या बताता है |
|---|---|
| Two-qubit gate error | सबसे अहम गुणवत्ता संख्या; तय करती है कितने gates चला सकते हैं (लगभग 1/ε) |
| Coherence time ÷ gate time | Qubit के भूलने से पहले कितने operations समाते हैं |
| Measurement error और गति | Error correction के लिए बहुत अहम, जो लगातार measure करता है |
| Connectivity | कौन-सी जोड़ियाँ सीधे interact कर सकती हैं; विरल layouts को अतिरिक्त SWAP gates चाहिए (पाठ 40) |
| गति | हर gate और हर error-correction round का समय; बड़ा algorithm कितना लंबा चलेगा |
| Mid-circuit measurement और feed-forward | Error correction और teleportation-आधारित circuits के लिए ज़रूरी |
| बढ़ने का रास्ता | Fabrication, wiring, cooling, control: क्या यह लाखों तक बढ़ सकता है? |

Benchmarks इन्हें एक score में मिलाते हैं। **Randomised benchmarking** औसत gate errors देता है। **Quantum volume** (IBM, 2019) वह सबसे बड़ा वर्गाकार random circuit नापता है जो machine भरोसे से चला सके। **Layer fidelity** नापती है कि कई qubits पर gates की पूरी परत कितनी अच्छी चलती है। हर एक कुछ पकड़ता है; कोई सब कुछ नहीं। अच्छे engineers पूरी data sheet पढ़ते हैं।

## मुख्य platforms एक नज़र में

| Platform | ताक़त | चुनौतियाँ | मुख्य खिलाड़ी |
|---|---|---|---|
| **Superconducting circuits** | बहुत तेज़ gates (दसियों ns), chip-fabrication तरीकों से बनते हैं, परिपक्व control | ≈ 10 mK cooling, हर qubit के लिए wiring, सिर्फ़ पास के पड़ोसियों से जुड़ाव | IBM, Google, Rigetti, IQM, Alibaba, चीन का USTC |
| **Trapped ions** | सबसे ऊँची gate fidelities, लंबी coherence, कोई भी qubit किसी से भी interact कर सकता है | धीमे gates (≈ 100 µs), एक trap में सैकड़ों ions से आगे बढ़ना कठिन | Quantinuum, IonQ, AQT |
| **Neutral atoms** | हज़ारों एक जैसे atoms, laser tweezers से फिर सजाए जा सकते हैं, लंबी दूरी के codes के लिए अच्छे | धीमे cycles, atom loss, two-qubit fidelity अभी सुधर रही है | QuEra, Pasqal, Atom Computing, Infleqtion |
| **Photonics** | कमरे के तापमान पर photons, networking के लिए स्वाभाविक, तेज़ | Photons शायद ही interact करते हैं, तो gates probabilistic हैं; loss मुख्य दुश्मन | PsiQuantum, Xanadu, Quandela |
| **Silicon में spins** | बहुत छोटे qubits, शायद मौजूदा chip factories में बन सकें | बड़े पैमाने पर एकरूपता, wiring और fidelity अभी हल हो रहे हैं | Intel, Diraq, Quantum Motion |

एक छठा, ज़्यादा अटकल वाला तरीका भी है: **topological qubits**, जो जानकारी अनोखे quasiparticles (Majorana zero modes) में रखेंगे जिनकी बनावट design से ही स्थानीय noise का विरोध करती है। Microsoft ने फ़रवरी 2025 में ऐसी पहली chip, Majorana 1, घोषित की, लेकिन इसमें असली topological qubits होने के सबूत पर physicists अब भी बहस कर रहे हैं। पाठ 39 ions, atoms, photons और spins को विस्तार से देखता है।

## पूरा stack, और engineers कहाँ फ़िट होते हैं

Quantum computer engineering की एक मीनार है, और qubits सिर्फ़ सबसे नीचे की मंज़िल हैं:

```text
Application and algorithm (Qiskit code, chemistry, optimisation)
  → Compiler and transpiler (map to the chip's gates and layout, Lesson 40)
    → Error-correction decoder (real-time classical computing, Lesson 35)
      → Pulse sequencer and control firmware (FPGAs, precise timing, feedback)
        → Signal generation and readout electronics (DACs, ADCs, mixers, amplifiers, lasers)
          → Cryogenics or vacuum, wiring, shielding
            → Qubits
```

हर परत एक job description है: qubits के लिए physicists; उनके आसपास के hardware के लिए cryogenic, vacuum, laser और microwave engineers; control systems के लिए FPGA और embedded engineers, जिन्हें error correction के लिए एक microsecond से काफ़ी कम में प्रतिक्रिया देनी होती है; ऊपर की परतों के लिए compiler और software engineers। Quantum hardware उतनी ही electronics और systems की समस्या है जितनी physics की। पाठ 38 एक signal को software से fridge के अंदर तक ले जाता है।

## आज़माकर देखें

1. एक spin qubit की frequency 20 GHz है। Millikelvin में उसका hf/k_B क्या है? क्या 100 mK काफ़ी ठंडा है?
2. 50 MHz Rabi frequency के साथ π pulse कितना लंबा है? RX(π/2) pulse?
3. एक qubit Rabi frequency Ω और detuning Δ = Ω से drive होता है। |1⟩ तक पहुँचने की सबसे ऊँची संभावना क्या है?
4. ज़्यादातर hardware पर Z rotation को "मुफ़्त" क्यों कहते हैं?
5. Harmonic oscillator ख़राब qubit क्यों है, और कौन-सा गुण इसे ठीक करता है?
6. Machine A में 1% two-qubit error वाले 1,000 qubits हैं; machine B में 0.1% error वाले 100 qubits। नतीजे ज़्यादातर noise बनने से पहले हर एक लगभग कितने two-qubit gates चला सकती है?
7. कौन-से DiVincenzo मानदंड computation के बजाय communication के बारे में हैं?

**जवाब:**

1. hf/k_B = (6.626 × 10⁻³⁴ × 2 × 10¹⁰)/(1.381 × 10⁻²³) ≈ 0.96 K = **960 mK**। 100 mK पर hf/k_BT ≈ 9.6, तो excited हिस्सा लगभग e^(−9.6) ≈ 7 × 10⁻⁵: **हाँ**, काफ़ी ठंडा। (यह एक वजह है कि spin qubits transmons से गर्म चल सकते हैं।)
2. Ω = 2π × 50 MHz, तो t_π = π/Ω = 1/(2 × 50 MHz) = **10 ns**, और RX(π/2) **5 ns** लेता है।
3. Ω²/(Ω² + Δ²) = Ω²/(2Ω²) = **50%**।
4. यह software में बाद के सारे pulses का phase खिसकाकर होता है (एक "virtual Z"), तो इसमें न समय लगता है न error जुड़ता है।
5. उसके levels बराबर दूरी पर हैं, तो 0 → 1 की drive 1 → 2 और ऊपर को भी drive करती है। **Anharmonicity** (असमान दूरी) सिर्फ़ सबसे निचले दो levels को address करने देती है।
6. लगभग 1/ε gates: machine A लगभग **100**, machine B लगभग **1,000**। गहरे circuits के लिए B, दस गुना कम qubits के बावजूद, ज़्यादा सक्षम है।
7. मानदंड **6** (स्थिर से उड़ने वाले qubits में बदलना) और **7** (उड़ने वाले qubits को भरोसे से भेजना)।

## सार-सूत्र

| विचार | सूत्र या तथ्य |
|---|---|
| Qubit | कोई भी नियंत्रणीय दो-level system; \|0⟩ निचला, \|1⟩ ऊपरी level |
| Frequency | ΔE = h·f; drive frequency तय करती है और qubit को address करती है |
| Thermal excitation | P(1) ≈ e^(−hf/k_BT); 5 GHz को ≈ 10–20 mK चाहिए |
| Dilution refrigerator | ≈ 10 mK तक पहुँचता है; superconducting और spin qubits के लिए ज़रूरी |
| Optical pumping | Atom और ion qubits को तापमान से स्वतंत्र तैयार करता है |
| Rabi oscillation | Resonant drive: P(1) = sin²(Ωt/2); π pulse: Ωt = π |
| Detuning | सबसे ज़्यादा P(1) = Ω²/(Ω² + Δ²) |
| Virtual Z | बाद के pulse phases खिसकाकर Z rotations: मुफ़्त और perfect |
| Anharmonicity | असमान level दूरी; \|2⟩ में leakage रोकती है |
| Readout | Dispersive resonator (SC), fluorescence (ions/atoms), photon detectors, spin-to-charge |
| DiVincenzo | Scalable qubits, reset, coherence, universal gates, measurement (+ networking के लिए 2) |
| Machines की तुलना | Gate error, coherence/gate time, readout, connectivity, गति, feed-forward, scaling |
