---
layout: ../../layouts/Post.astro
title: "Measurement, properly explained"
description: "The Born rule, the inner product ⟨φ|ψ⟩, measuring in different bases, what 'collapse' means, and why no-cloning follows."
date: 2026-11-04
category: explainer
---

Every lesson uses measurement. This page explains it carefully, in four ideas.

## 1. The inner product ⟨φ|ψ⟩: how much two states overlap

For two states |φ⟩ = [a, b] and |ψ⟩ = [c, d]:

```
⟨φ|ψ⟩ = a*·c + b*·d        (* means complex conjugate)
```

- ⟨φ|ψ⟩ = 1 (in size): the states are the same.
- ⟨φ|ψ⟩ = 0: the states are completely distinguishable (**orthogonal**), like |0⟩ and |1⟩.

The symbol ⟨φ| is called a **bra**; together ⟨φ|ψ⟩ is a **bra-ket**. That's where "Dirac bra-ket notation" comes from.

## 2. The Born rule: probability = |overlap|²

Measuring in a **basis** {|b₀⟩, |b₁⟩} gives result k with probability

```
P(k) = |⟨b_k|ψ⟩|²
```

In the usual basis {|0⟩, |1⟩}, this is the familiar P(0) = |α|², P(1) = |β|².

**Worked example.** |ψ⟩ = √0.8|0⟩ + √0.2|1⟩, measured in the **+/− basis**:

```
P(+) = |⟨+|ψ⟩|² = (√0.8 + √0.2)² / 2 = 0.9
P(−) = 0.1
```

The same state gives 80/20 in one basis and 90/10 in another.

## 3. Measuring in other bases

Hardware usually only measures in the {|0⟩, |1⟩} basis (the **Z basis**). To measure in another basis, **rotate first**:

| To measure in | Apply before measuring |
|---|---|
| Z basis {\|0⟩, \|1⟩} | nothing |
| X basis {\|+⟩, \|−⟩} | H |
| Y basis {\|+i⟩, \|−i⟩} | S† then H |

```python
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler
S = StatevectorSampler()

z = QuantumCircuit(1); z.h(0); z.measure_all()            # |+⟩ in Z basis
x = QuantumCircuit(1); x.h(0); x.h(0); x.measure_all()    # |+⟩ in X basis
print(S.run([z], shots=1000).result()[0].data.meas.get_counts())
print(S.run([x], shots=1000).result()[0].data.meas.get_counts())
```

```text
{'1': 502, '0': 498}
{'0': 1000}
```

|+⟩ looks completely random in the Z basis, and completely certain in the X basis. **Randomness depends on the question you ask.** This is exactly what BB84 exploits (Lesson 5).

## 4. What "collapse" means

After measuring and getting result k, the qubit **is** |b_k⟩. Measure again in the same basis: you get k every time.

- The amplitudes before measurement are gone. You can't get α and β back.
- That's why one measurement can't tell you a state. To estimate α and β you need **many identical copies**, measured in several bases (**state tomography**).

## Why no-cloning follows

If you could copy an unknown state, you'd make 1,000 copies and measure them all, learning α and β from a single original. Quantum mechanics forbids this: the copying operation would have to be non-linear, but every quantum operation is linear (unitary). This is the **no-cloning theorem**, and it is what makes QKD secure.

## Remember

| Idea | Formula |
|---|---|
| Overlap | ⟨φ\|ψ⟩ = a*c + b*d |
| Born rule | P(k) = \|⟨b_k\|ψ⟩\|² |
| X-basis measurement | H, then measure |
| After measuring k | the state is \|b_k⟩ |
| No-cloning | unknown states can't be copied |
