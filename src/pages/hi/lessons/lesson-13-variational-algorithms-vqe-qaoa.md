---
layout: ../../../layouts/Post.astro
lang: hi
title: "Variational algorithms: VQE और QAOA"
description: "आज के noisy quantum computers classical कंप्यूटरों के साथ कैसे मिलकर काम करते हैं: circuit के कोण तब तक बदलो जब तक न्यूनतम energy या अच्छा हल न मिल जाए।"
date: 2026-11-04
category: lesson
lesson: 13
---

Shor और phase estimation को error-corrected मशीनें चाहिए, जो अभी नहीं हैं। **Variational algorithms** आज के noisy हार्डवेयर के लिए बने हैं, जिसे **NISQ** दौर (noisy intermediate-scale quantum) कहते हैं।

## विचार: quantum-classical loop

1. एक **parameterised circuit** (*ansatz*) बदलने योग्य कोणों θ से state बनाता है।
2. Quantum computer कोई cost, जैसे energy, **measure** करता है।
3. एक **classical optimiser** cost घटाने के लिए θ बदलता है।
4. जब तक cost सुधरना बंद न हो, दोहराएँ।

छोटे circuits से noise कम रहता है। खोज का भारी काम classical कंप्यूटर करता है।

## VQE: variational quantum eigensolver

**लक्ष्य:** किसी Hamiltonian H वाले system की सबसे कम energy (*ground state*) ढूँढना। Chemistry का यही केंद्रीय सवाल है।

**यह क्यों काम करता है:** **variational principle**। किसी भी state |ψ(θ)⟩ की measured energy असली ground energy से ≥ होती है। तो energy घटाने से आप सिर्फ़ पास ही जाते हैं।

## Qiskit में छोटा VQE

एक-qubit "molecule", H = Z + 0.5·X। एक कोण, एक RY gate:

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.circuit import Parameter
from qiskit.quantum_info import SparsePauliOp, Statevector

H = SparsePauliOp(["Z", "X"], coeffs=[1.0, 0.5])
theta = Parameter("θ")
ansatz = QuantumCircuit(1)
ansatz.ry(theta, 0)

def energy(t):
    state = Statevector(ansatz.assign_parameters({theta: t}))
    return state.expectation_value(H).real

best = min(np.linspace(0, 2 * np.pi, 721), key=energy)
print("best θ =", round(best, 3), " energy =", round(energy(best), 4))
print("exact  =", round(np.linalg.eigvalsh(H.to_matrix())[0], 4))
```

```text
best θ = 3.604  energy = -1.118
exact  = -1.118
```

Loop ने ठीक ground energy, −√1.25 ≈ −1.118, ढूँढ ली। असली VQE में दर्जनों qubits, कई parameters और COBYLA या SPSA जैसे बेहतर optimisers होते हैं, लेकिन loop वही है।

## QAOA: quantum approximate optimisation

**लक्ष्य:** कठिन combinatorial समस्याओं के अच्छे हल, जैसे *MaxCut*: किसी network को दो समूहों में बाँटना ताकि ज़्यादा से ज़्यादा links कटें। Scheduling, routing और portfolio जैसी समस्याएँ इसी तरह की हैं।

**Circuit** दो layers को p बार बारी-बारी दोहराता है:

1. **Problem layer**, जो हर जवाब की अच्छाई के हिसाब से phase जोड़ती है।
2. **Mixer layer** (RX rotations), जो जवाबों के बीच amplitude बहने देती है।

Classical optimiser 2p कोण tune करता है।

## ईमानदार स्थिति

- **अभी कोई साफ़ व्यावहारिक बढ़त नहीं।** असली समस्याओं पर सबसे अच्छे classical तरीके अब भी बराबर या बेहतर हैं।
- **Barren plateaus:** बड़े random circuits में cost का landscape लगभग सपाट हो जाता है, और optimisers भटक जाते हैं।
- **Measurement की लागत:** हर energy अनुमान के लिए हज़ारों shots।
- फिर भी, आज के हार्डवेयर पर शोधकर्ता मुख्यतः यही तरीके इस्तेमाल करते हैं, और सीखने के लिए यह सबसे अच्छी जगह है।

## ख़ुद आज़माएँ

1. Hamiltonian को `["Z", "X"], coeffs=[1.0, 1.0]` कर दें। Ground energy क्या होनी चाहिए? जाँचें।
2. Grid search की जगह `scipy.optimize.minimize(energy, x0=0.1, method="COBYLA")` लगाएँ।
3. एक RY gate `["Y"]` की ground state क्यों नहीं ढूँढ पाता? RX या RZ जोड़कर देखें।
