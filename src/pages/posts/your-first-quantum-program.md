---
layout: ../../layouts/Post.astro
title: "Your first quantum program"
description: "Set up Qiskit and write complete quantum programs, explained line by line: the four-step shape of every quantum program, a qubit in superposition, measuring and reading the result object, error bars on counts, a Bell pair and what its statistics show, a one-qubit interferometer, Qiskit's bit order, the three mistakes every beginner makes, a quantum dice program, and how to run on real hardware."
date: 2026-11-04
category: lesson
lesson: 18
---

You've learned qubits, gates, measurement and entanglement (Lessons 6 to 17), and you've seen small snippets along the way. Now you set Qiskit up properly and write complete quantum programs, with every line explained. By the end you'll have run six programs on your own computer, including a quantum dice, and you'll know how to read their output and avoid the common traps. Lesson 19 then covers Qiskit in depth.

**What you need:** Python 3.10 or newer, and about 30 minutes. No physics beyond Lessons 6 to 14.

**No laptop?** Open [Google Colab](https://colab.research.google.com/) in your phone's browser, make a new notebook, and run everything there. It's free and needs no installation.

## Setting up

### Install Qiskit

Qiskit is IBM's free, open-source toolkit for quantum programming, and the most widely used one. It's good practice to install it in a **virtual environment**, a private folder of packages for one project, so it can't clash with anything else on your computer. In a terminal:

```bash
python3 -m venv qenv               # create the environment (once)
source qenv/bin/activate           # switch it on (on Windows: qenv\Scripts\activate)
pip install qiskit                 # install Qiskit into it
```

In Colab, skip the first two lines and run `!pip install qiskit` in a cell. Then check that it worked:

```python
import qiskit
print(qiskit.__version__)
```

```text
2.6.1
```

This lesson was tested with Qiskit **2.6.1**. Any 2.x version will work.

**A warning about old tutorials.** Qiskit changed a lot in version 1.0 (2024). Code you find online that uses `execute(...)` or `from qiskit import Aer` is from before then and no longer runs. This course uses the modern style throughout: **primitives** like the Sampler and the Estimator.

### Where to write code

- **A notebook** (Jupyter, or Colab): run code in small cells and see results immediately. Best for learning and experimenting.
- **A script** (a `.py` file run with `python3 file.py`, or an editor such as VS Code): best once a program gets longer.

Every code block in this course is a complete program: copy it into a cell or a file and run it as it is.

## The shape of every quantum program

Whatever it does, a quantum program has four steps. IBM calls them the **Qiskit patterns**: map, optimise, execute, post-process.

1. **Build** the circuit: qubits, gates and measurements (**map** the problem onto a circuit).
2. **Prepare** it for the machine: rewrite it in the gates and connections the hardware actually has (**optimise**, called transpiling). Simulators don't need this, so we skip it until Lesson 40.
3. **Run** it (**execute**): a **Sampler** returns measured bitstrings; an **Estimator** returns average values (Lesson 19).
4. **Analyse** the results (**post-process**): turn counts into probabilities, error bars and answers.

The programs below follow these steps.

## Program 1: one qubit in superposition

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

Line by line:

- `QuantumCircuit(1)` makes a circuit with one qubit. Every qubit starts in |0⟩.
- `qc.h(0)` adds a Hadamard gate on qubit 0 (Lesson 9). Nothing runs yet: you're writing down a recipe.
- `Statevector(qc)` **simulates** the recipe on your computer and gives the final state.

The output is the vector of **amplitudes** (Lesson 6): 0.7071 for |0⟩ and 0.7071 for |1⟩, which is (|0⟩ + |1⟩)/√2. Each number is written as a complex number, and `+0.j` means its imaginary part is zero (Python writes i as j). `dims=(2,)` says it's one two-level system. The probabilities are 0.7071² = 0.5 each.

`Statevector` is a peek that only a simulator allows. **A real quantum computer can't show you amplitudes**; it can only measure. So let's measure.

## Program 2: measuring, and reading the results

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

**The drawing.** The top wire is the qubit `q`, with time running left to right: the H gate, a **barrier** `░` (a divider that `measure_all` adds, which stops the compiler moving gates across it), then the **meter** `M`. The double line at the bottom is a **classical register** called `meas` with 1 bit. The arrow from the meter into it, marked 0, means "store this result in bit 0".

**Running.** `StatevectorSampler()` is a Sampler that runs on your computer. `run([qc], shots=1000)` prepares and measures the circuit 1,000 times. The list means you can pass several circuits at once.

**The result object.** `result[0]` is the result for the first (here the only) circuit. `.data.meas` holds the bits stored in the register named `meas`. From it, `get_counts()` gives a tally of each outcome, and `get_bitstrings()` gives every shot in order.

**Randomness.** The first 20 shots, 10110111000111001011, show that **each shot is random**: nothing predicts the next one. Only the pattern is predictable: about half 0s and half 1s. A simulator makes its randomness with a pseudo-random number generator, and `seed=42` fixes its starting point, so your output matches this page exactly. Remove the seed and you'll get fresh results every run, still close to 500/500.

**Error bars.** An estimated probability from N shots has a **standard error** of about √(p(1 − p)/N). Here that's ±0.016, so 0.497 is entirely consistent with the true 0.5. Results within about two standard errors of the expected value are normal scatter, not a bug. Lesson 20 covers these statistics properly.

## Program 3: your first entanglement

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

`bell.cx(0, 1)` is a CNOT with qubit 0 as **control** (the dot) and qubit 1 as **target** (drawn as an X box). The state has four amplitudes, for |00⟩, |01⟩, |10⟩ and |11⟩, and only the first and last are non-zero: (|00⟩ + |11⟩)/√2, the Bell state of Lesson 14.

Now look at the statistics:

- **Each qubit alone** is a fair coin: qubit 0 was 1 in 498 of 1,000 shots, and so was qubit 1.
- **Together** they agreed in all 1,000 shots. You only ever see 00 or 11.

Two perfectly random bits that always match: that's the signature of entanglement. (Matching alone could have a classical explanation, like two envelopes holding the same card. Lesson 15 showed how measurements at other angles rule that out.)

## Program 4: a one-qubit interferometer

Here's the heart of quantum computing in four lines. The first H splits the qubit into two "paths", |0⟩ and |1⟩. The phase gate P(φ) shifts the phase of the |1⟩ path only. The second H recombines the paths, and they **interfere**:

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

The phase is invisible on its own: after the first H, any φ gives 50/50 if you measure. But after recombination it **controls the outcome completely**. Working it through:

- After H: (|0⟩ + |1⟩)/√2.
- After P(φ): (|0⟩ + e^(iφ)|1⟩)/√2.
- After the second H, the amplitude of |1⟩ is (1 − e^(iφ))/2, so **P(1) = (1 − cos φ)/2 = sin²(φ/2)**.

At φ = 0 the two paths to |1⟩ cancel exactly (+½ and −½), so H twice gives 0 every time. At φ = π (a Z gate), the paths to |0⟩ cancel instead, and you always get 1. In between, the measured values match sin²(φ/2) within the error bars.

This is a **Mach–Zehnder interferometer** written as a circuit, the same structure physicists build with mirrors and beam splitters. It's also the core of phase kickback (Lesson 22), phase estimation (Lesson 27) and quantum sensing (Lesson 44): a phase you can't see is turned into probabilities you can measure.

## Reading results: Qiskit's bit order

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

Two conventions to know:

- **Statevector positions:** the amplitude for a basis state sits at position q0·1 + q1·2 + q2·4 + …, so flipping only qubit 1 puts the 1 at position 2.
- **Bitstrings are written with qubit 0 on the right:** `'010'` means q2 = 0, q1 = 1, q0 = 0. So `key[-1]` is qubit 0, `key[-2]` is qubit 1, and so on.

This is the same as ordinary binary numbers, where the lowest bit is on the right. Most textbooks, and this site's Quantum Lab, write qubit 0 on the **left** instead. Both are fine; just know which one you're reading. If you need the textbook order, `qc.reverse_bits()` flips a circuit's qubit order, and `key[::-1]` flips a string.

## Three mistakes everyone makes

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

1. **Statevector of a measured circuit.** `Statevector` simulates gates, not measurements. Take the statevector **before** adding measurements (or of a copy without them).
2. **No measurements, so no `meas`.** Without `measure_all()` there's no classical register, so the result has nothing named `meas`. Qiskit also prints a warning: "One of your circuits has no output classical registers". If you name your own registers (Lesson 19), the results appear under those names instead.
3. **Gates after a measurement.** `StatevectorSampler` only allows measurements at the end of a circuit. Mid-circuit measurement is real and useful (teleportation in Lesson 21 needs it), but it needs a simulator that supports it, such as Qiskit Aer (Lesson 19).

When you hit an error, read the **last line** of the message first: it usually says exactly what went wrong.

## Program 5: a quantum dice

Now a complete, useful program. Measuring qubits in superposition gives random bits, so a quantum computer is a natural **random number generator**. Three qubits give a number from 0 to 7, but a die needs 1 to 6:

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

The trick in `dice` is called **rejection sampling**: if the three bits give 6 or 7, throw that result away and use the next. The obvious shortcut, "number mod 6", would be **biased**: 0 and 6 would both become a 1, and 1 and 7 would both become a 2, so faces 1 and 2 would come up twice as often as the others. In the 6,000 rolls, each face appears about 1,000 times, with a scatter of about ±30, as statistics predicts.

Two honest notes. First, on a simulator the randomness comes from the seeded pseudo-random generator, so it's not truly random; on real hardware, it comes from quantum measurement. Second, real devices are slightly **biased** (for example, readout errors make 0 a little more likely than 1), so real **quantum random number generators** (QRNGs) clean up their raw bits with a step called randomness extraction. QRNG chips are commercial products: since 2020, some smartphones have included a tiny one, which uses a light source and a light sensor rather than qubits in a circuit.

## Running on a real quantum computer (optional)

Everything above ran on a **simulator** on your computer. IBM offers free access to real quantum computers through its Open Plan (a few minutes of quantum processor time per month, plenty for small experiments). The steps are:

1. Make a free account at [IBM Quantum Platform](https://quantum.cloud.ibm.com/) and create an API key.
2. Install the client with `pip install qiskit-ibm-runtime`, and save your key once on your computer. Never paste it into code you share.
3. Pick a device, **transpile** your circuit for it (step 2 of the pattern), and run it with the hardware Sampler, which works just like the one you've been using.

Lesson 40 gives the complete, tested code. Expect a little noise: a real Bell pair gives a few percent of 01 and 10 results. That's the noise of Lesson 32, made visible.

## Try it yourself

1. Add `qc.x(0)` before `qc.h(0)` in Program 1. What changes in the statevector, and why don't the measured counts change?
2. Make a 3-qubit GHZ state: H on qubit 0, CNOT 0→1, CNOT 1→2. Which results appear, and how often?
3. In Program 4, which phase φ gives P(1) = ¼?
4. In Program 2, 1,000 shots gave an error bar of ±0.016. Roughly how many shots give ±0.005?
5. A 2-qubit circuit gives the result `'01'`. Which qubit was measured as 1?
6. Build a 2-qubit circuit whose qubits always **disagree** (only 01 and 10), using H, CNOT and one more gate.
7. Why does the dice program throw away 6 and 7 instead of using "number mod 6, plus 1"?

You can check your circuits in the [Quantum Lab](/lab/) circuit builder, and export them back to Qiskit code from there.

**Answers:**

1. The statevector becomes (0.7071, −0.7071), the state |−⟩ = (|0⟩ − |1⟩)/√2. The counts stay about 50/50 because both probabilities are still 0.5: the minus sign is a relative **phase** (Lesson 10), which only shows up after further gates, as in Program 4.
2. Only **000** and **111**, each about half the time. All three qubits always agree.
3. sin²(φ/2) = ¼ means sin(φ/2) = ½, so φ/2 = π/6 and **φ = π/3 ≈ 1.047**.
4. The error shrinks like 1/√N, so you need (0.016/0.005)² ≈ 10 times as many: about **10,000 shots**.
5. **Qubit 0**: the rightmost character is qubit 0.
6. H on qubit 0, CNOT 0→1, then **X on qubit 1**. This makes (|01⟩ + |10⟩)/√2, the Bell state Ψ+.
7. "Mod 6" is biased: 0 and 6 both give 1, and 1 and 7 both give 2, so 1 and 2 would each appear with probability 2/8 instead of 1/6. Throwing away 6 and 7 keeps all six faces equally likely, at 1/6 each.

## Cheat sheet

| Code | Meaning |
|---|---|
| `pip install qiskit` | Install Qiskit (in a virtual environment, or `!pip` in Colab) |
| `QuantumCircuit(n)` | n qubits, all starting in \|0⟩ |
| `qc.h(q)`, `qc.x(q)`, `qc.z(q)`, `qc.p(φ, q)` | Single-qubit gates |
| `qc.cx(c, t)` | CNOT, control c, target t |
| `Statevector(qc)` | Exact amplitudes (simulator only, no measurements allowed) |
| `.probabilities()` | Probability of each basis state |
| `qc.measure_all()` | Measure every qubit into a register named `meas` |
| `qc.draw()` | Draw the circuit as text |
| `StatevectorSampler(seed=…).run([qc], shots=N)` | Run N shots (seed for repeatable results) |
| `.result()[0].data.meas` | Results of circuit 0, register `meas` |
| `.get_counts()`, `.get_bitstrings()` | Tally of outcomes; every shot in order |
| Error bar | ±√(p(1 − p)/N) for a probability from N shots |
| Bit order | Qubit 0 is the **rightmost** character; position = q0·1 + q1·2 + … |
| Old code | `execute(...)` and `from qiskit import Aer` are pre-1.0 and no longer work |
| Pattern | Build → prepare (transpile) → run → analyse |
