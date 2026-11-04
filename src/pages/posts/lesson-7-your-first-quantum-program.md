---
layout: ../../layouts/Post.astro
title: "Your first quantum program"
description: "Install Qiskit, build a qubit in superposition, make a Bell pair, read the results, and see interference, all in a few lines of Python."
date: 2026-11-04
category: lesson
lesson: 7
---

You've learned qubits, gates, algorithms, hardware, communication and sensing. Now you write code. By the end of this lesson you'll have run three real quantum programs on your own computer.

**What you need:** Python 3.10 or newer and about 15 minutes. No physics beyond Lessons 1 and 2.

**No laptop?** Open [Google Colab](https://colab.research.google.com/) in your phone's browser, make a new notebook, and run everything there.

## Step 1: Install Qiskit

Qiskit is IBM's free, open-source toolkit for quantum programming. In a terminal (or a Colab cell, with `!` in front):

```bash
pip install qiskit
```

Check it worked:

```python
import qiskit
print(qiskit.__version__)
```

This lesson was tested with Qiskit **2.6.1**.

## Step 2: One qubit in superposition

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

qc = QuantumCircuit(1)   # one qubit, starts in |0⟩
qc.h(0)                  # Hadamard gate on qubit 0

print(Statevector(qc))
```

Output:

```text
Statevector([0.70710678+0.j, 0.70710678+0.j], dims=(2,))
```

That is exactly (|0⟩ + |1⟩)/√2 from Lesson 1. The two numbers are the **amplitudes** of |0⟩ and |1⟩. Each is 1/√2 ≈ 0.707, so each probability is 0.707² = 0.5.

`Statevector` lets you peek at the amplitudes. **A real quantum computer can't do this.** It can only measure. So let's measure.

## Step 3: Measure it 1,000 times

```python
from qiskit.primitives import StatevectorSampler

qc.measure_all()         # add a measurement to every qubit
print(qc.draw())

sampler = StatevectorSampler()
result = sampler.run([qc], shots=1000).result()
print(result[0].data.meas.get_counts())
```

Output (your numbers will differ slightly):

```text
        ┌───┐ ░ ┌─┐
     q: ┤ H ├─░─┤M├
        └───┘ ░ └╥┘
meas: 1/═════════╩═
                 0
{'0': 477, '1': 523}
```

- `qc.draw()` prints the circuit: H, a barrier `░`, then the meter `M`.
- `shots=1000` means "prepare and measure the circuit 1,000 times".
- About half the shots gave 0 and half gave 1. **Each single shot is random. Only the pattern is predictable.**

Run it again: the counts change, but stay close to 500/500.

## Step 4: Your first entanglement (a Bell pair)

```python
bell = QuantumCircuit(2)
bell.h(0)        # superposition on qubit 0
bell.cx(0, 1)    # CNOT: control 0, target 1

print(Statevector(bell))
bell.measure_all()
print(bell.draw())

counts = sampler.run([bell], shots=1000).result()[0].data.meas.get_counts()
print(counts)
```

Output:

```text
Statevector([0.70710678+0.j, 0.+0.j, 0.+0.j, 0.70710678+0.j], dims=(2, 2))
        ┌───┐      ░ ┌─┐
   q_0: ┤ H ├──■───░─┤M├───
        └───┘┌─┴─┐ ░ └╥┘┌─┐
   q_1: ─────┤ X ├─░──╫─┤M├
             └───┘ ░  ║ └╥┘
meas: 2/══════════════╩══╩═
                      0  1
{'00': 484, '11': 516}
```

You only ever get **00** or **11**, never 01 or 10. Each qubit alone is a coin toss, but the two always agree. That's entanglement: the state (|00⟩ + |11⟩)/√2 from Lesson 2.

## Step 5: Interference, H twice

```python
hh = QuantumCircuit(1)
hh.h(0)
hh.h(0)
hh.measure_all()
print(sampler.run([hh], shots=1000).result()[0].data.meas.get_counts())
```

Output:

```text
{'0': 1000}
```

One H gives a 50/50 coin. Two H's give **0 every single time**. The two paths to |1⟩ have amplitudes +½ and −½; they **cancel**. This cancelling is the engine of every quantum algorithm in Lesson 3.

## Watch out: Qiskit reads bits right to left

```python
x = QuantumCircuit(2)
x.x(1)           # flip qubit 1 only
x.measure_all()
print(sampler.run([x], shots=100).result()[0].data.meas.get_counts())
```

```text
{'10': 100}
```

You flipped qubit **1**, but the result reads `'10'`. Qiskit writes **qubit 0 on the right**: the string is `q1 q0`. Our Quantum Lab shows qubit 0 on the left, like most textbooks. Both are fine; just know which one you're reading.

## Run it on a real quantum computer (optional)

Everything above ran on a **simulator** on your computer. To use real IBM hardware:

1. Make a free account at [IBM Quantum Platform](https://quantum.cloud.ibm.com/).
2. Install `qiskit-ibm-runtime` and follow IBM's "Hello world" tutorial to connect with your API key.
3. Expect small errors: real hardware might give a few `01` and `10` results for the Bell pair. That's the noise from Lesson 4, made visible.

## Try it yourself

1. Add `qc.x(0)` before `qc.h(0)` in Step 2. What changes in the statevector, and why don't the counts change?
2. Make a 3-qubit GHZ state: H on 0, CNOT 0→1, CNOT 1→2. Which results appear?
3. Put `qc.z(0)` between the two H's in Step 5. Predict the result first, then run it.

You can check every answer in the [Quantum Lab](/lab/) circuit builder, and export your circuit back to Qiskit code from there.

## Cheat sheet

| Code | Meaning |
|---|---|
| `QuantumCircuit(n)` | n qubits, all starting in \|0⟩ |
| `qc.h(q)`, `qc.x(q)`, `qc.z(q)` | Single-qubit gates |
| `qc.cx(c, t)` | CNOT, control c, target t |
| `Statevector(qc)` | Peek at amplitudes (simulator only) |
| `qc.measure_all()` | Measure every qubit |
| `StatevectorSampler().run([qc], shots=N)` | Run N shots |
| `.result()[0].data.meas.get_counts()` | Count each result |
