---
layout: ../../layouts/Post.astro
title: "Noise and your first error-correcting code"
description: "Why qubits make mistakes, how to catch an error without looking at the data, and the 3-qubit bit-flip code built in Qiskit."
date: 2026-11-04
category: lesson
lesson: 12
---

Real qubits are noisy (Lesson 4). A good superconducting qubit today makes an error in roughly 1 out of every few hundred to few thousand operations. Useful algorithms need billions of operations. Error correction is the bridge.

## Three kinds of error

| Error | What happens | Gate that causes the same thing |
|---|---|---|
| Bit flip | \|0⟩ ↔ \|1⟩ | X |
| Phase flip | \|1⟩ → −\|1⟩ | Z |
| Both | flip + phase flip | Y |

Any small, messy error can be written as a mix of these, so a code that fixes X and Z errors fixes everything (a deep result called **error discretisation**).

## The problem: you can't just copy and check

Classically, you'd store a bit 3 times (000 or 111) and take a majority vote. For qubits:

- **No-cloning:** you can't copy an unknown qubit.
- **Measuring destroys superposition:** you can't look at the data to check it.

## The trick: spread out, then check *differences*

1. **Encode** one logical qubit into three: α|0⟩ + β|1⟩ → α|000⟩ + β|111⟩. (CNOTs do this; it's entanglement, not copying.)
2. **Check parities**, not values: "are qubits 0 and 1 equal?" and "are qubits 1 and 2 equal?" Extra **ancilla** qubits measure these.
3. The two answers, the **syndrome**, point to the broken qubit, without revealing α or β.
4. **Fix** it with an X on that qubit.

| Syndrome (q0≠q1, q1≠q2) | Error on |
|---|---|
| no, no | nothing |
| yes, no | qubit 0 |
| yes, yes | qubit 1 |
| no, yes | qubit 2 |

## The bit-flip code in Qiskit

```python
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler

bf = QuantumCircuit(5, 2)       # q0-q2 data, q3-q4 ancillas
bf.x(0)                         # logical |1⟩ (try removing this)
bf.cx(0, 1); bf.cx(0, 2)        # encode: |1⟩ → |111⟩

bf.x(1)                         # an error hits qubit 1

bf.cx(0, 3); bf.cx(1, 3)        # ancilla 3 = parity of q0, q1
bf.cx(1, 4); bf.cx(2, 4)        # ancilla 4 = parity of q1, q2
bf.measure([3, 4], [0, 1])

print(StatevectorSampler().run([bf], shots=100).result()[0].data.c.get_counts())
```

```text
{'11': 100}
```

Both checks fire, so the error is on **qubit 1**. And the syndrome is the same whether the data was |0⟩, |1⟩ or any superposition: the check never touched the information.

## From toy code to real machines

- The bit-flip code only fixes X errors. **Shor's 9-qubit code** (1995) fixes both X and Z.
- Real machines use the **surface code**: qubits on a grid, with parity checks between neighbours. It tolerates relatively high physical error rates.
- The key number is the **threshold**: if physical errors are below it, adding more qubits makes the logical qubit *better*. In 2024, Google's Willow chip showed logical errors falling as the code grew, a crucial milestone.
- Cost: hundreds to thousands of physical qubits per reliable logical qubit. That's why "a million qubits" is the target for breaking RSA (Lesson 11).

## Try it

1. Move the error from `bf.x(1)` to `bf.x(0)`, then `bf.x(2)`. Do the syndromes match the table? (Qiskit prints the second ancilla first.)
2. Remove the error entirely. What syndrome do you get?
3. Put errors on **two** qubits. Why does the code now "fix" the wrong one?
