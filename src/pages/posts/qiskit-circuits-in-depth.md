---
layout: ../../layouts/Post.astro
title: "Qiskit circuits in depth"
description: "Everything about building circuits in Qiskit: named registers, broadcasting gates, barriers, measuring into chosen bits, parameters for running one circuit at many angles, reusable blocks with inverse and control, mid-circuit measurement with if_test, the Sampler and Estimator primitives, and saving circuits as OpenQASM."
date: 2026-11-04
category: lesson
lesson: 19

---

Lesson 18 got you running: install Qiskit, make a Bell pair, measure it. That's enough for small experiments, but real programs need more. You'll want to name groups of qubits, run the same circuit at a hundred different angles without rebuilding it, reuse blocks, measure halfway through and react to the result, and compute expectation values instead of just counting bitstrings.

This lesson is a tour of the Qiskit features you'll use for the rest of the course, each with a small tested example. Keep it open as a reference when you write your own circuits. Everything here was tested with **Qiskit 2.6.1** (and Qiskit Aer 0.18 for one example).

## Registers: naming groups of qubits

`QuantumCircuit(3)` gives you three anonymous qubits numbered 0, 1, 2. For bigger programs it's clearer to group qubits into named **registers**: a `QuantumRegister` for qubits and a `ClassicalRegister` for the bits that hold measurement results.

Here's a small circuit that computes the **parity** (XOR) of two data qubits into a helper qubit and measures it. You'll meet this exact pattern in error correction (Lesson 33), where helper qubits measure parities without disturbing the data.

```python
from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister

data = QuantumRegister(2, "data")
helper = QuantumRegister(1, "anc")
result = ClassicalRegister(1, "parity")
qc = QuantumCircuit(data, helper, result)

qc.h(data)                      # H on both data qubits at once
qc.barrier()
qc.cx(data[0], helper[0])       # copy the parity of the data qubits
qc.cx(data[1], helper[0])       # into the helper qubit
qc.measure(helper[0], result[0])
print(qc.draw("text"))
print("qubits:", qc.num_qubits, " clbits:", qc.num_clbits, " depth:", qc.depth(), " ops:", dict(qc.count_ops()))
```

```text
          ┌───┐ ░              
  data_0: ┤ H ├─░───■──────────
          ├───┤ ░   │          
  data_1: ┤ H ├─░───┼────■─────
          └───┘ ░ ┌─┴─┐┌─┴─┐┌─┐
     anc: ──────░─┤ X ├┤ X ├┤M├
                ░ └───┘└───┘└╥┘
parity: 1/═══════════════════╩═
                             0 
qubits: 3  clbits: 1  depth: 4  ops: {'h': 2, 'cx': 2, 'barrier': 1, 'measure': 1}
```

Things to notice:

- **Broadcasting:** `qc.h(data)` applied H to every qubit in the register. Gate methods accept a single qubit, a list, a register or a `range`.
- **Barriers** (the dotted line) do nothing to the state. They're a visual divider, and they stop the compiler from moving gates across them (useful when you want to keep a section exactly as written).
- **`measure(q, c)`** sends a qubit's result into a classical bit you choose. `measure_all()`, which you used before, adds a whole new register called `meas` and measures every qubit into it.
- The qubit counts as a register index: `data[0]` is qubit 0 of the whole circuit, `helper[0]` is qubit 2. Qiskit's bitstrings still put the highest-numbered bit on the left (Lesson 12).

## Inspecting a circuit

| Method | Returns |
|---|---|
| `qc.draw("text")` | An ASCII drawing (use `"mpl"` for a picture in a notebook) |
| `qc.num_qubits`, `qc.num_clbits` | Width |
| `qc.depth()` | Number of time steps (Lesson 13) |
| `qc.size()`, `qc.count_ops()` | Total gates, and gates by type |
| `Operator(qc)` | The circuit's unitary matrix (no measurements allowed) |
| `Statevector(qc)` | The state it produces from \|0…0⟩ (no measurements allowed) |

## Parameters: one circuit, many angles

Variational algorithms (Lesson 30), sensing scans (Lesson 44) and calibrations all run the **same circuit at many different angles**. Rebuilding the circuit each time is slow. Instead, use a symbolic **`Parameter`** and supply the numbers when you run it.

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.circuit import Parameter
from qiskit.primitives import StatevectorSampler

theta = Parameter("θ")
qc = QuantumCircuit(1)
qc.ry(theta, 0)
qc.measure_all()

sampler = StatevectorSampler(seed=3)
angles = [0, np.pi / 3, np.pi / 2, np.pi]
job = sampler.run([(qc, angles)], shots=1000)          # one circuit, four angles
counts = job.result()[0].data.meas
for i, a in enumerate(angles):
    c = counts.get_counts(i)
    print(f"θ = {np.degrees(a):5.1f}°  ->  P(1) ≈ {c.get('1', 0) / 1000:.3f}   (exact {np.sin(a / 2) ** 2:.3f})")
```

```text
θ =   0.0°  ->  P(1) ≈ 0.000   (exact 0.000)
θ =  60.0°  ->  P(1) ≈ 0.230   (exact 0.250)
θ =  90.0°  ->  P(1) ≈ 0.498   (exact 0.500)
θ = 180.0°  ->  P(1) ≈ 1.000   (exact 1.000)
```

The sampler took a **pub** ("primitive unified bloc"): a tuple of (circuit, parameter values). With four values it ran four versions and returned four sets of counts. The 0.230 versus 0.250 is shot noise (Lesson 5: about ±0.014 with 1,000 shots). For many parameters, `ParameterVector("θ", 10)` makes θ[0] … θ[9] in one line, and `qc.assign_parameters({theta: 0.5})` makes a fixed copy of the circuit if you need one.

## Reusable blocks: to_gate, compose, inverse, control

Large algorithms are built from repeated pieces: an oracle, a diffusion step, a QFT. Qiskit lets you treat any circuit as a single gate.

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Operator

# A reusable block: prepare a Bell pair
bell = QuantumCircuit(2, name="bell")
bell.h(0)
bell.cx(0, 1)

big = QuantumCircuit(4)
big.append(bell.to_gate(), [0, 1])        # use it as one gate...
big.append(bell.to_gate(), [2, 3])        # ...twice
big.compose(bell.inverse(), [0, 1], inplace=True)   # then undo the first pair
print(big.draw("text"))
print(dict(big.count_ops()))

undo = bell.compose(bell.inverse())
print("bell then its inverse is the identity:", Operator(undo).equiv(Operator(QuantumCircuit(2))))

cbell = bell.to_gate().control(1)          # a controlled version: a 3-qubit gate
print("controlled block acts on", cbell.num_qubits, "qubits")
```

```text
     ┌───────┐     ┌───┐
q_0: ┤0      ├──■──┤ H ├
     │  bell │┌─┴─┐└───┘
q_1: ┤1      ├┤ X ├─────
     ├───────┤└───┘     
q_2: ┤0      ├──────────
     │  bell │          
q_3: ┤1      ├──────────
     └───────┘          
{'bell': 2, 'cx': 1, 'h': 1}
bell then its inverse is the identity: True
controlled block acts on 3 qubits
```

| Tool | What it does |
|---|---|
| `circ.to_gate()` | Packs a circuit (without measurements) into one named gate |
| `qc.append(gate, qubits)` | Places that gate on chosen qubits |
| `qc.compose(other, qubits)` | Pastes another circuit's gates in, unpacked |
| `circ.inverse()` | The circuit run backwards, with every gate replaced by its inverse (Lesson 4: (AB)† = B†A†) |
| `gate.control(k)` | A version controlled by k extra qubits (Lesson 13) |
| `gate.power(k)` | The gate repeated k times |
| `qc.decompose()` | Unpacks named blocks one level, to see what's inside |

`inverse` and `control` are used constantly: "compute, use the result, uncompute" is a standard pattern for cleaning up helper qubits, and controlled powers of a unitary are the heart of phase estimation (Lesson 27).

## Mid-circuit measurement and feed-forward

So far, measurements came at the end. Modern hardware can also **measure in the middle** of a circuit and **choose the next gates based on the result**, all within the run. These are called **dynamic circuits**, and teleportation (Lesson 21) and error correction (Part F) depend on them.

Here's a tiny example: put a qubit in superposition, look at it, and if the result was 0, flip it. Whatever the first result, the qubit then ends up as 1.

```python
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

# Mid-circuit measurement and feed-forward: guarantee that qubit 0 ends in |1>
qc = QuantumCircuit(1, 2)
qc.h(0)
qc.measure(0, 0)                         # first look: random 0 or 1
with qc.if_test((qc.clbits[0], 0)):      # if we saw 0 ...
    qc.x(0)                              # ... flip it
qc.measure(0, 1)                         # second look

counts = AerSimulator(seed_simulator=5).run(qc, shots=1000).result().get_counts()
print(counts)                            # bit 1 (left) is the second measurement
```

```text
{'10': 498, '11': 502}
```

The right-hand bit (the first look) is random. The left-hand bit (the second look) is always 1. This needs a simulator that supports classical control, so we used **Qiskit Aer** (`pip install qiskit-aer`), IBM's high-performance simulator, which Lesson 20 covers properly. Related tools: `qc.reset(q)` sets a qubit back to |0⟩ mid-circuit (by measuring and flipping if needed), which lets you **reuse** qubits.

## The two primitives: Sampler and Estimator

Qiskit's modern interface has two main ways to run circuits, called **primitives**.

| Primitive | Question it answers | Output |
|---|---|---|
| **Sampler** | "What bitstrings come out?" | Counts of each measured bitstring |
| **Estimator** | "What's the average value of this observable?" | Expectation values ⟨A⟩ (Lesson 8), with error estimates |

Algorithms like Grover's (Lesson 24) want bitstrings, so they use a Sampler. Chemistry and optimisation (Lesson 30) want energies, which are expectation values, so they use an Estimator. Observables are written as **Pauli strings** with `SparsePauliOp`, in Qiskit order (rightmost letter on qubit 0): "IZ" means Z on qubit 0, nothing on qubit 1.

The Estimator can evaluate several observables at several parameter values in one call, using NumPy-style broadcasting: a column of observables times a row of angles gives a grid.

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.circuit import Parameter
from qiskit.quantum_info import SparsePauliOp
from qiskit.primitives import StatevectorEstimator

theta = Parameter("θ")
qc = QuantumCircuit(2)
qc.ry(theta, 0)
qc.cx(0, 1)                                  # cos(θ/2)|00> + sin(θ/2)|11>

observables = [[SparsePauliOp("ZZ")], [SparsePauliOp("IZ")], [SparsePauliOp("XX")]]   # a column
angles = [0, np.pi / 2, np.pi]                                                         # a row
result = StatevectorEstimator().run([(qc, observables, angles)]).result()[0]
print("      ZZ    IZ    XX")
for a, row in zip(angles, result.data.evs.T.round(3) + 0.0):
    print(f"{np.degrees(a):4.0f}°", row)
```

```text
      ZZ    IZ    XX
   0° [1. 1. 0.]
  90° [1. 0. 1.]
 180° [ 1. -1.  0.]
```

Check by hand. The state is cos(θ/2)|00⟩ + sin(θ/2)|11⟩. Both qubits always agree, so ⟨ZZ⟩ = 1 at every angle. ⟨Z⟩ on qubit 0 is cos²(θ/2) − sin²(θ/2) = cos θ: 1, 0, −1. And ⟨XX⟩ = sin θ: 0, 1, 0. At 90° the state is the Bell pair, and you get Lesson 14's ⟨ZZ⟩ = ⟨XX⟩ = 1.

The `Statevector…` primitives compute exactly on your computer. On real hardware you use the same interface with IBM's `SamplerV2` and `EstimatorV2` from the `qiskit-ibm-runtime` package (Lesson 40), so code written against these primitives moves to hardware with almost no changes.

## Saving and sharing circuits: OpenQASM

**OpenQASM** is a plain-text language for quantum circuits, readable by Qiskit and most other quantum toolkits. It's the "assembly language" of quantum computing.

```python
from qiskit import QuantumCircuit, qasm3

qc = QuantumCircuit(2)
qc.h(0)
qc.cx(0, 1)
qc.measure_all()
print(qasm3.dumps(qc))                  # plain text that other quantum tools can read
```

```text
OPENQASM 3.0;
include "stdgates.inc";
bit[2] meas;
qubit[2] q;
h q[0];
cx q[0], q[1];
barrier q[0], q[1];
meas[0] = measure q[0];
meas[1] = measure q[1];
```

You can read it line by line: declare 2 bits and 2 qubits, H, CNOT, barrier, measure. (`measure_all()` added the barrier automatically.) Use `qasm3.dump(qc, file)` to save to a file. Loading OpenQASM 3 back needs the extra package `qiskit-qasm3-import`; the older `qasm2.dumps` and `qasm2.loads` work without it for simple circuits.

## Try it

1. Make a circuit with a 3-qubit register named "q" and a 3-bit register named "c". Apply H to all three qubits with one call, and measure qubit i into bit i.
2. Using a `Parameter`, scan RX(θ) on |0⟩ for θ = 0, 90°, 180°, 270°, 360°. Which angles give P(1) = 1?
3. Build a 3-qubit GHZ block with `to_gate()`, then use `inverse()` to show that GHZ followed by its inverse returns |000⟩.
4. In the dynamic-circuit example, change the `if_test` so the qubit always ends in |0⟩.
5. With the Estimator, compute ⟨ZZ⟩, ⟨XX⟩ and ⟨YY⟩ for the Ψ⁻ Bell state. What do you expect?
6. Export your GHZ circuit to OpenQASM 3 and read the text. How many lines contain `cx`?

**Answers (outlines):**

1. `q = QuantumRegister(3, "q"); c = ClassicalRegister(3, "c"); qc = QuantumCircuit(q, c); qc.h(q); qc.measure(q, c)`.
2. P(1) = sin²(θ/2): **180°** gives 1; 0° and 360° give 0; 90° and 270° give ½.
3. `Statevector(ghz.compose(ghz.inverse()))` equals |000⟩.
4. Test for 1 instead: `with qc.if_test((qc.clbits[0], 1)): qc.x(0)`.
5. Ψ⁻ is anti-correlated in every basis (Lesson 14): **−1, −1, −1**.
6. Two (for a chain of two CNOTs).

## Cheat sheet

| Task | Code |
|---|---|
| Named registers | `QuantumRegister(n, "name")`, `ClassicalRegister(n, "name")` |
| Gate on many qubits | `qc.h([0, 1, 2])` or `qc.h(register)` |
| Barrier | `qc.barrier()` |
| Measure into chosen bit | `qc.measure(q, c)` |
| Measure everything | `qc.measure_all()` (adds register `meas`) |
| Inspect | `draw`, `depth`, `size`, `count_ops`, `num_qubits` |
| Parameter | `theta = Parameter("θ")`; `ParameterVector("θ", n)` |
| Run many angles | `sampler.run([(qc, values)])` |
| Fix a parameter | `qc.assign_parameters({theta: 0.5})` |
| Reusable block | `circ.to_gate()`, `qc.append(gate, qubits)` |
| Paste circuit | `qc.compose(other, qubits)` |
| Undo / control / repeat | `inverse()`, `control(k)`, `power(k)` |
| Look inside a block | `qc.decompose()` |
| Mid-circuit logic | `with qc.if_test((clbit, value)):`; `qc.reset(q)` |
| Bitstrings | Sampler (`StatevectorSampler`, `SamplerV2` on hardware) |
| Expectation values | Estimator with `SparsePauliOp("XZ")` |
| Pauli string order | Rightmost letter acts on qubit 0 |
| Export | `qasm3.dumps(qc)` |
