---
layout: ../../../layouts/Post.astro
lang: hi
title: "Quantum optimisation और finance"
description: "Optimisation और finance के लिए quantum computers क्या कर सकते हैं और क्या नहीं, हर दावा code में परखा। समस्याओं को QUBO और Ising रूप में बदलना, brute force से हल MaxCut, बढ़ती depth पर QAOA (simulate और optimise किया), quantum annealing और adiabatic प्रमेय (simulate किया), मज़बूत classical मुक़ाबला, Monte Carlo option pricing बनाम quantum amplitude estimation (हिसाब के साथ), resource अनुमान, और एक ईमानदार scorecard।"
date: 2026-11-04
category: lesson
lesson: 46
---

Optimisation हर जगह है: delivery vans के रास्ते, trains और factory shifts का schedule, mobile towers को frequencies देना, chips design करना, निवेश चुनना। Finance दूसरा बड़ा काम जोड़ता है: हज़ारों संभावित भविष्यों को simulate करके जोखिम और क़ीमतों का अनुमान। दोनों आकर्षक बाज़ार हैं, और दोनों quantum इस्तेमालों की लगभग हर सूची में आते हैं।

पाठ 31 ने बुनियादी नियम पहले ही दे दिए: quantum computers से NP-hard समस्याएँ कुशलता से हल करने की उम्मीद नहीं, और quadratic speed-ups सिर्फ़ बड़ी, error-corrected machines पर फ़ायदा देते हैं। यह पाठ देखता है कि असल में क्या प्रस्तावित है, मुख्य algorithms को छोटे उदाहरणों पर चलाता है, और उनकी classical तरीकों से ईमानदार तुलना करता है।

## समस्याओं को energies में बदलना: QUBO और Ising

ज़्यादातर quantum optimisation तरीकों को समस्या एक मानक रूप में चाहिए: **QUBO**, quadratic unconstrained binary optimisation। Binary variables x₁, …, xₙ (हर एक 0 या 1) ऐसे चुनो कि एक quadratic function न्यूनतम हो:

> cost(x) = Σᵢ Qᵢᵢ xᵢ + Σᵢ<ⱼ Qᵢⱼ xᵢ xⱼ

कई समस्याएँ फ़िट होती हैं, कभी-कभी शर्तों के लिए दंड पद जोड़कर: scheduling, routing, graph colouring, portfolio चुनाव। xᵢ = (1 − zᵢ)/2 रखकर, zᵢ = ±1 के साथ, QUBO एक **Ising model** बनता है, Σ Jᵢⱼ zᵢzⱼ + Σ hᵢzᵢ रूप का energy function, और हर zᵢ की जगह Pauli operator Zᵢ रखने से एक quantum Hamiltonian मिलता है जिसकी **ground state सबसे अच्छा जवाब है**। Optimisation बन जाता है "सबसे कम energy वाली state ढूँढो", chemistry (पाठ 45) जैसा ही काम।

मानक test समस्या **MaxCut** है: network के nodes को दो समूहों में बाँटो ताकि ज़्यादा से ज़्यादा links कटें। यहाँ एक छोटा उदाहरण है, हर संभावना जाँचकर हल किया:

```python
import itertools

# A small network: 6 nodes, 9 links. MaxCut: split the nodes into two groups, cutting as many links as possible.
edges = [(0, 1), (0, 2), (1, 2), (1, 3), (2, 4), (3, 4), (3, 5), (4, 5), (0, 5)]
n = 6

def cut_size(bits):
    return sum(bits[i] != bits[j] for i, j in edges)

best = max(itertools.product([0, 1], repeat=n), key=cut_size)
print("best split:", "".join(map(str, best)), " links cut:", cut_size(best), "of", len(edges))
print("checked all", 2 ** n, "possible splits; with 100 nodes that would be", f"{2.0 ** 100:.1e}")
```

```text
best split: 001101  links cut: 7 of 9
checked all 64 possible splits; with 100 nodes that would be 1.3e+30
```

6 nodes के लिए जाँचने को सिर्फ़ 64 बँटवारे हैं। 100 nodes के लिए लगभग 10³⁰ हैं, और MaxCut NP-hard है, तो कोई ज्ञात algorithm, classical या quantum, हर network के लिए सटीक सबसे अच्छा cut कुशलता से नहीं ढूँढता। लेकिन व्यवहार में अच्छे **अनुमानित** जवाब अक्सर काफ़ी होते हैं, और quantum heuristics का निशाना वहीं है।

MaxCut के लिए हर link (i, j) Hamiltonian में Zᵢ Zⱼ जोड़ता है: दोनों सिरे एक समूह में हों (कटा नहीं) तो +1, अलग हों तो −1। Σ ZᵢZⱼ न्यूनतम करना cut अधिकतम करता है।

## QAOA: gate-आधारित तरीका

**Quantum approximate optimisation algorithm** (Farhi, Goldstone और Gutmann, 2014) पाठ 30 में आया। यह सभी जवाबों के बराबर superposition से शुरू होता है और दो क़िस्म की परतें बारी-बारी, p बार, लगाता है:

1. एक **problem परत**, e^(−iγ H_problem), जो हर जवाब को उसकी cost के हिसाब से phase देती है (MaxCut के लिए हर link पर एक RZZ rotation), और
2. एक **mixer परत**, e^(−iβ Σ Xᵢ), जो amplitude को पड़ोसी जवाबों के बीच बहने देती है।

एक classical optimiser अपेक्षित cut अधिकतम करने के लिए 2p कोण tune करता है। हमारे network पर p = 1, 2 और 3 के लिए, optimiser के कई random शुरुआती बिंदुओं के साथ, QAOA चलाएँ:

```python
import itertools
import numpy as np
from scipy.optimize import minimize
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

edges = [(0, 1), (0, 2), (1, 2), (1, 3), (2, 4), (3, 4), (3, 5), (4, 5), (0, 5)]
n, best_cut = 6, 7

def qaoa(params, p):
    gammas, betas = params[:p], params[p:]
    qc = QuantumCircuit(n)
    qc.h(range(n))                                   # start in an equal superposition of all splits
    for g, b in zip(gammas, betas):
        for i, j in edges:
            qc.rzz(2 * g, i, j)                      # problem layer: phase depends on whether the link is cut
        qc.rx(2 * b, range(n))                       # mixer layer: lets amplitude flow between splits
    return Statevector(qc).probabilities_dict()

def expected_cut(params, p):
    return sum(prob * sum(k[n - 1 - i] != k[n - 1 - j] for i, j in edges) for k, prob in qaoa(params, p).items())

rng = np.random.default_rng(1)
print("layers p   average cut   approx. ratio   chance of an optimal split")
for p in [1, 2, 3]:
    runs = [minimize(lambda x: -expected_cut(x, p), rng.uniform(0, np.pi, 2 * p), method="COBYLA") for _ in range(8)]
    best = min(runs, key=lambda r: r.fun)
    probs = qaoa(best.x, p)
    p_opt = sum(prob for k, prob in probs.items() if sum(k[n - 1 - i] != k[n - 1 - j] for i, j in edges) == best_cut)
    print(f"   {p}          {-best.fun:.3f}         {-best.fun / best_cut:.3f}           {p_opt:.3f}")
print(f"random guessing: average cut {len(edges) / 2:.1f}, ratio {len(edges) / 2 / best_cut:.3f}")
```

```text
layers p   average cut   approx. ratio   chance of an optimal split
   1          5.939         0.848           0.401
   2          6.603         0.943           0.721
   3          6.878         0.983           0.923
random guessing: average cut 4.5, ratio 0.643
```

Depth बढ़ने पर QAOA का औसत cut सबसे अच्छे के 85% से 98% तक चढ़ता है, और सबसे अच्छा बँटवारा measure होने की संभावना 40% से 92% तक बढ़ती है। Random अंदाज़े (64%) से यह असली प्रगति है। अनंत परतों की सीमा में QAOA सबसे अच्छा ढूँढने की गारंटी देता है, क्योंकि यह आगे बताई adiabatic प्रक्रिया का अनुमान है।

लेकिन classical तुलना याद रखें। MaxCut के लिए **Goemans–Williamson algorithm** (1995) polynomial समय में **हर** graph पर सबसे अच्छे का कम से कम 87.8% गारंटी करता है, और अच्छे classical heuristics (simulated annealing, local search, Gurobi और CPLEX जैसे commercial solvers) हज़ारों nodes वाले networks के लिए अक्सर सबसे अच्छे या उसके क़रीब cuts ढूँढ लेते हैं। कम-depth QAOA की कुछ graph परिवारों पर साबित गारंटियाँ Goemans–Williamson से **नीचे** हैं, और गहरे QAOA को ज़्यादा gates, ज़्यादा noise और कठिन optimisation (barren plateaus समेत, पाठ 45) चाहिए।

## Quantum annealing: analogue तरीका

**Adiabatic प्रमेय** कहता है कि अगर quantum system किसी Hamiltonian की ground state में शुरू हो, और Hamiltonian **काफ़ी धीरे** बदला जाए, तो system ground state में ही रहता है। **Quantum annealing** इसे इस्तेमाल करता है: एक सरल Hamiltonian से शुरू करो जिसकी ground state आसान है (सारे qubits |+⟩ में), उसे धीरे-धीरे problem Hamiltonian में बदलो, और system को समस्या की ground state, सबसे अच्छे जवाब, में ख़त्म होना चाहिए:

> H(s) = (1 − s)·H_start + s·H_problem,  s धीरे-धीरे 0 से 1 तक

अपने network के लिए इसे अलग-अलग कुल annealing समय T के साथ simulate करें:

```python
import numpy as np
from scipy.linalg import expm
from qiskit.quantum_info import SparsePauliOp

edges = [(0, 1), (0, 2), (1, 2), (1, 3), (2, 4), (3, 4), (3, 5), (4, 5), (0, 5)]
n, best_cut = 6, 7

def zz(i, j):
    label = ["I"] * n; label[n - 1 - i] = "Z"; label[n - 1 - j] = "Z"
    return "".join(label)
def x(i):
    label = ["I"] * n; label[n - 1 - i] = "X"
    return "".join(label)

# Problem Hamiltonian: energy = (number of uncut links) - (cut links); lowest energy = best cut
H_problem = SparsePauliOp([zz(i, j) for i, j in edges]).to_matrix()
H_start = -SparsePauliOp([x(i) for i in range(n)]).to_matrix()     # ground state: equal superposition

ground0 = np.ones(2 ** n) / np.sqrt(2 ** n)
cuts = np.array([sum(((k >> i) & 1) != ((k >> j) & 1) for i, j in edges) for k in range(2 ** n)])

print(f"random guess: {np.mean(cuts == best_cut):.3f}")
print("anneal time T   chance of ending in an optimal split")
for T in [1, 3, 10, 30, 100]:
    steps = 200
    psi = ground0.astype(complex)
    for k in range(steps):
        s = (k + 0.5) / steps                                       # slowly turn the problem on
        H = (1 - s) * H_start + s * H_problem
        psi = expm(-1j * H * T / steps) @ psi
    print(f"     {T:4d}            {np.sum(np.abs(psi[cuts == best_cut]) ** 2):.3f}")
```

```text
random guess: 0.094
anneal time T   chance of ending in an optimal split
        1            0.252
        3            0.825
       10            0.993
       30            1.000
      100            1.000
```

तेज़ anneal (T = 1) मुश्किल से अंदाज़े को हराता है। धीमा (T = 30 या ज़्यादा) लगभग हर बार सबसे अच्छे बँटवारे पर ख़त्म होता है। "काफ़ी धीमा" कितना धीमा है? ज़रूरी समय तब बढ़ता है जब anneal के दौरान ground state और पहली excited state के बीच **energy gap** सिकुड़ता है, मोटे तौर पर 1/gap² की तरह। कठिन समस्या उदाहरणों के लिए वह gap **exponentially छोटा** हो सकता है, जो anneal को exponentially लंबा बनाता है। यही गहरी वजह है कि annealing NP-hardness से नहीं बचता।

**D-Wave Systems** हज़ारों superconducting qubits वाले commercial quantum annealers बनाती है (उसकी Advantage machines में 5,000 से ज़्यादा हैं)। वे universal gate-आधारित computers नहीं; वे ख़ास analogue devices हैं जो इस प्रक्रिया के noisy, सीमित-तापमान रूप चलाते हैं। पिछले दशक में कई अध्ययनों ने पाया कि अच्छी तरह tune किए classical algorithms optimisation benchmarks पर उनकी बराबरी करते या उन्हें हराते हैं। 2025 में D-Wave ने magnetic materials की dynamics **simulate** करने में beyond-classical नतीजा बताया, जो optimisation नहीं बल्कि physics simulation काम (पाठ 29) है, और हर advantage दावे की तरह इस पर भी classical जवाबी अध्ययन आए।

## Finance: Monte Carlo से pricing और जोखिम

Banks जटिल वित्तीय products (options, derivatives) की क़ीमत लगाते हैं और जोखिम (जैसे Value at Risk) का अनुमान **Monte Carlo simulation** से लगाते हैं: कई random भविष्य के परिदृश्य बनाओ, हर एक का नतीजा निकालो, और औसत लो। N नमूनों के साथ error **1/√N** की तरह घटता है, तो सटीकता के हर अतिरिक्त अंक की क़ीमत 100 गुना ज़्यादा नमूने है, और बड़े banks ये गणनाएँ रात भर बड़े computing clusters पर चलाते हैं।

**Quantum amplitude estimation** (पाठ 25) वही औसत quantum "oracle" calls की संख्या में **1/N** से घटते error के साथ अनुमानित करता है, एक quadratic speed-up। Classical पक्ष देखें, एक सरल option की क़ीमत लगाते हुए जिसकी सटीक क़ीमत Black–Scholes सूत्र से ज्ञात है:

```python
import numpy as np
from scipy.stats import norm

# A European call option: the right to buy a share at K = ₹110 in one year. Today's price S0 = ₹100.
S0, K, r, sigma, T = 100.0, 110.0, 0.06, 0.25, 1.0
d1 = (np.log(S0 / K) + (r + sigma ** 2 / 2) * T) / (sigma * np.sqrt(T))
exact = S0 * norm.cdf(d1) - K * np.exp(-r * T) * norm.cdf(d1 - sigma * np.sqrt(T))     # Black–Scholes formula

rng = np.random.default_rng(3)
print(f"exact price (Black–Scholes): ₹{exact:.4f}\n")
print("   samples N    Monte Carlo estimate (± standard error)")
for N in [1_000, 10_000, 100_000, 1_000_000]:
    z = rng.standard_normal(N)
    ST = S0 * np.exp((r - sigma ** 2 / 2) * T + sigma * np.sqrt(T) * z)               # simulated prices in a year
    payoff = np.exp(-r * T) * np.maximum(ST - K, 0)
    print(f"{N:12,d}      ₹{payoff.mean():.4f} ± {payoff.std() / np.sqrt(N):.4f}")

# How many samples (classical) or oracle calls (amplitude estimation) to reach ±1 paisa?
spread, eps = payoff.std(), 0.01
print(f"\nfor ±₹0.01: classical Monte Carlo ≈ {(spread / eps) ** 2:,.0f} samples;  "
      f"amplitude estimation ≈ {spread / eps:,.0f} oracle calls")
```

```text
exact price (Black–Scholes): ₹8.4297

   samples N    Monte Carlo estimate (± standard error)
       1,000      ₹8.9187 ± 0.5106
      10,000      ₹8.5024 ± 0.1580
     100,000      ₹8.4091 ± 0.0498
   1,000,000      ₹8.4328 ± 0.0158

for ±₹0.01: classical Monte Carlo ≈ 2,492,886 samples;  amplitude estimation ≈ 1,579 oracle calls
```

Classical Monte Carlo सटीक क़ीमत की ओर बढ़ता है, नमूनों में हर दस गुना बढ़ोतरी पर standard error लगभग √10 घटता है। ±1 पैसे तक पहुँचने में लगभग 25 लाख नमूने लगेंगे, जबकि ideal amplitude estimation को सिर्फ़ लगभग 1,600 oracle calls चाहिए।

यह नाटकीय दिखता है, लेकिन पाठ 31 का crossover विश्लेषण लागू होता है। हर "oracle call" एक बड़ा quantum circuit है: उसे भविष्य की क़ीमतों का probability वितरण amplitudes में भरना और payoff को reversibly निकालना है, कई logical qubits और T gates इस्तेमाल करके। Goldman Sachs और IBM के researchers के 2021 के अध्ययन ने अनुमान लगाया कि एक असली derivative की क़ीमत classical तरीकों से तेज़ लगाने के लिए हज़ारों logical qubits और आज के hardware से कहीं आगे की error-corrected gate गति चाहिए। इस बीच GPU पर एक classical नमूना nanoseconds लेता है, और classical तरीकों के अपने speed-ups हैं (quasi-Monte Carlo, variance reduction) जो 1/√N को सुधारते हैं।

तो quantum finance एक विश्वसनीय **लंबी अवधि** का इस्तेमाल है, केंद्र में साबित quadratic speed-up के साथ, लेकिन यह fault-tolerant युग का है। दूसरे finance प्रस्ताव, जैसे QUBO के रूप में portfolio optimisation, दूसरी optimisation समस्याओं जैसे ही मुद्दों का सामना करते हैं।

## एक ईमानदार scorecard

| क्षेत्र | Quantum तरीका | Speed-up | स्थिति |
|---|---|---|---|
| Combinatorial optimisation (MaxCut, scheduling, routing) | QAOA, quantum annealing | Heuristic; NP-hard समस्याओं के लिए कोई साबित speed-up नहीं | सबसे अच्छे classical solvers पर कोई दिखाया व्यावहारिक फ़ायदा नहीं |
| ढाँचेदार optimisation (कुछ ख़ास समस्याएँ) | विशेष quantum algorithms | कभी polynomial, संकरे मामलों के लिए साबित | Research |
| Monte Carlo pricing और जोखिम | Amplitude estimation | Quadratic (साबित) | बड़ी fault-tolerant machines चाहिए |
| Portfolio optimisation | QAOA या annealing के साथ QUBO | Heuristic | सिर्फ़ छोटे प्रदर्शन |
| Physical systems simulate करना (materials, chemistry के लिए) | Hamiltonian simulation | अक्सर exponential | सबसे आशाजनक क्षेत्र (पाठ 29, 45) |

दो व्यावहारिक बातें याद रखने लायक़ हैं। पहली, कई "quantum-inspired" algorithms, quantum computing से विचार उधार लेने वाले classical तरीके, ने अपने दम पर असली व्यावसायिक मूल्य दिया है। दूसरी, समस्याओं को QUBOs और Hamiltonians के रूप में लिखना सीखना hardware चाहे जो हो, काम का है: वही रूप classical solvers, annealers और gate-आधारित machines पर चलते हैं, तो companies अभी तैयारी कर सकती हैं और hardware तैयार होने पर बदल सकती हैं।

## आज़माकर देखें

1. Nodes 0 और 1 के बीच एक अकेले link पर MaxCut को Ising Hamiltonian के रूप में लिखें। उसकी ground states कौन-सी हैं?
2. QAOA या annealing से हर MaxCut उदाहरण सटीक और कुशलता से हल करने की उम्मीद क्यों नहीं की जा सकती?
3. QAOA table में p = 1 से p = 3 तक सबसे अच्छा बँटवारा measure होने की संभावना कितनी बढ़ी?
4. Goemans–Williamson गारंटी क्या है, और QAOA को परखने में यह क्यों मायने रखती है?
5. Annealing simulation में धीमा anneal सफल क्यों होता है जबकि तेज़ नहीं?
6. Classical Monte Carlo को error ε ∝ 1/√N के लिए N नमूने चाहिए। सटीकता में दस गुना सुधार को कितने नमूने चाहिए? और amplitude estimation के साथ?
7. 1,600 बनाम 25 लाख की तुलना का मतलब यह क्यों नहीं कि quantum computers जल्द options की क़ीमत तेज़ लगाएँगे?

**जवाब:**

1. H = Z₀Z₁। उसकी ground states (energy −1) **|01⟩ और |10⟩** हैं, link काटने के दो तरीके।
2. MaxCut NP-hard है, और quantum computers से NP-hard समस्याएँ कुशलता से हल करने की उम्मीद नहीं (पाठ 31)। Annealing की भाषा में, कठिन उदाहरणों में exponentially छोटे gaps होते हैं, जिन्हें exponentially लंबे anneals चाहिए; QAOA को उसी हिसाब से गहरे circuits चाहिए होंगे।
3. लगभग **40% से 92%**।
4. एक classical polynomial-समय algorithm जो हमेशा अधिकतम cut का कम से कम **87.8%** पाता है। Quantum heuristic को काम का होने के लिए इसे (और व्यावहारिक classical solvers को) हराना चाहिए; कम-depth QAOA हमेशा नहीं हराता।
5. Adiabatic प्रमेय: energy gap के उलटे square की तुलना में Hamiltonian को धीरे बदलने से system ground state में रहता है। तेज़ बदलाव excited states में छलांग कराता है, जो बदतर जवाब हैं।
6. Classically **100 गुना** ज़्यादा नमूने। Amplitude estimation में error ∝ 1/N, तो सिर्फ़ **10 गुना** ज़्यादा oracle calls।
7. हर oracle call एक बड़ा, गहरा, error-corrected circuit है जिसे probability वितरण भरना और payoff निकालना है, GPU पर एक classical नमूने से कहीं धीमा। अनुमानों को हज़ारों logical qubits और बहुत तेज़ logical gates चाहिए, जो सालों तक उपलब्ध नहीं।

## सार-सूत्र

| विचार | सूत्र या तथ्य |
|---|---|
| QUBO | Binary x पर Σ Qᵢᵢxᵢ + Σ Qᵢⱼxᵢxⱼ न्यूनतम करो |
| Ising | x = (1 − z)/2; H = Σ JᵢⱼZᵢZⱼ + Σ hᵢZᵢ; ground state = सबसे अच्छा जवाब |
| MaxCut | हर link ZᵢZⱼ देता है; Σ ZᵢZⱼ न्यूनतम करो; NP-hard |
| QAOA (2014) | e^(−iγH_problem) और e^(−iβΣX) की p परतें; 2p कोण classically tune |
| उदाहरण पर QAOA | p = 1, 2, 3: अनुपात 0.85 → 0.94 → 0.98; P(सबसे अच्छा) 0.40 → 0.92 |
| Goemans–Williamson | MaxCut के लिए 87.8% की classical गारंटी (1995) |
| Adiabatic प्रमेय | H को 1/gap² की तुलना में धीरे बदलो और ground state में रहो |
| Quantum annealing | H(s) = (1 − s)H_start + sH_problem; D-Wave (5,000+ qubits) |
| कठिन उदाहरण | Exponentially छोटे gaps → exponentially लंबे anneals |
| Monte Carlo | Error ∝ 1/√N: हर अतिरिक्त अंक पर 100× नमूने |
| Amplitude estimation | Error ∝ 1/N oracle calls: quadratic speed-up |
| Finance की हक़ीक़त | हज़ारों logical qubits और तेज़ logical gates चाहिए (2021 अनुमान) |
| स्थिति | Optimisation: कोई दिखाया फ़ायदा नहीं; finance: fault-tolerant युग; simulation: सबसे आशाजनक |
