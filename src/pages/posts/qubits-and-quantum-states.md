---
layout: ../../layouts/Post.astro
title: "Qubits and quantum states"
description: "The single most important idea in the course: a qubit is a normalised vector of two complex amplitudes. Bits versus qubits, physical qubits you can picture, kets and normalisation, probabilities from amplitudes, a tiny qubit simulator written from scratch, why a qubit is not just a random bit (shown in code), why phase matters but global phase doesn't, how fast the state space grows, and how much information a qubit really holds."
date: 2026-11-04
category: lesson
lesson: 6
---

Part A gave you the tools: bits, complex numbers, vectors, matrices and probability. Part B uses them to build the central object of quantum computing, the **qubit**. This lesson states exactly what a qubit's state is, how it differs from a bit (and from a random bit), and what you can and can't learn from it. Lessons 7 to 11 then explore the qubit in detail: its geometry, measurement, gates, phase and rotations.

The one idea to take away: **a qubit's state is a vector of two complex numbers, with total squared length 1.** Everything else follows from that.

## Bits and qubits

A classical **bit** is either 0 or 1. You can read it as often as you like, and reading it doesn't change it. Even a **random** bit, say from a coin toss you haven't looked at, is really in one state or the other; you just don't know which.

A **qubit** is a physical system with two distinguishable basis states, written with Dirac's **ket** notation (Lesson 3):

- **|0⟩** ("ket zero") and **|1⟩** ("ket one").

Unlike a bit, a qubit can be in a **superposition** of both:

> |ψ⟩ = α|0⟩ + β|1⟩

where α and β are **complex numbers** called **amplitudes**. As a column vector, |0⟩ = (1, 0), |1⟩ = (0, 1), and |ψ⟩ = (α, β).

### Qubits you can picture

Lesson 37 surveys real hardware, but three examples help now:

- **A photon's polarisation:** |0⟩ = horizontal, |1⟩ = vertical. Light polarised at 45° is the superposition (|0⟩ + |1⟩)/√2, and a polarising filter at 0° passes it half the time.
- **An electron's spin** in a magnetic field: |0⟩ = spin up, |1⟩ = spin down. In 1922 the Stern–Gerlach experiment found that a beam of silver atoms splits into exactly **two** spots, not a smear: the first glimpse of a two-state quantum system.
- **The two lowest energy levels of an atom or a superconducting circuit**, which is how most quantum computers store qubits (Lessons 37 to 39).

In each case, "0" and "1" are two perfectly distinguishable physical situations, and the qubit can be in a superposition of them.

## The rules of the state

Three rules define a qubit's state. They are worth memorising.

1. **State:** a vector |ψ⟩ = (α, β) with complex entries.
2. **Normalisation:** |α|² + |β|² = 1. The vector has length 1.
3. **Measurement (the Born rule, Lesson 8):** measuring in the {|0⟩, |1⟩} basis gives 0 with probability |α|² and 1 with probability |β|². Afterwards, the qubit **is** the state you measured: |0⟩ or |1⟩.

Normalisation is just rule 3 made consistent: the two probabilities must add to 1. Remember that |α|² means the **squared magnitude** of a complex number: for α = a + bi, |α|² = a² + b² (Lesson 2).

### A qubit simulator from scratch

These rules are all you need to simulate a qubit on an ordinary computer. Here's a complete one in a few lines of NumPy: normalise a state, compute its probabilities, and sample measurements:

```python
import numpy as np
rng = np.random.default_rng(6)

def normalise(amplitudes):
    v = np.array(amplitudes, dtype=complex)
    return v / np.linalg.norm(v)                 # make |α|² + |β|² = 1

def probabilities(state):
    return np.abs(state) ** 2

def measure(state, shots):
    """Sample measurement results: 0 with probability |α|², 1 with probability |β|²."""
    return np.bincount(rng.choice(2, size=shots, p=probabilities(state)), minlength=2)

psi = normalise([2, 1j])                         # unnormalised (2, i) → (2, i)/√5
print("state:        ", np.round(psi, 4))
print("probabilities:", np.round(probabilities(psi), 4), " sum =", probabilities(psi).sum().round(10))
print("1000 shots:   ", measure(psi, 1000))
```

```text
state:         [0.8944+0.j     0.    +0.4472j]
probabilities: [0.8 0.2]  sum = 1.0
1000 shots:    [785 215]
```

The unnormalised pair (2, i) became (2/√5, i/√5): probabilities 0.8 and 0.2, which add to 1. A thousand simulated measurements gave 785 zeros and 215 ones, close to the expected 800 and 200 with the usual statistical scatter (Lesson 20). Notice that the second amplitude is **imaginary**, yet its probability is perfectly ordinary: |i/√5|² = 1/5.

Every quantum simulator, including Qiskit's, is a much more efficient version of exactly this idea.

## A qubit is not just a random bit

It's tempting to think that a qubit in (|0⟩ + |1⟩)/√2 is "secretly 0 or 1, we just don't know which", like a coin under a cup. That's wrong, and here's a precise way to see it.

A random bit is described by **probabilities**, and operations on it are matrices of probabilities (each column adds to 1). A qubit is described by **amplitudes**, and operations are **unitary** matrices (Lesson 4). Let's compare a "fair coin flip" applied twice with a Hadamard gate applied twice:

```python
import numpy as np

# A classical random bit: a "fair coin flip" gate is a matrix of probabilities (each column sums to 1)
coin_flip = np.array([[0.5, 0.5],
                      [0.5, 0.5]])
p = np.array([1.0, 0.0])                       # start certainly 0
print("random bit, flipped once: ", coin_flip @ p)
print("random bit, flipped twice:", coin_flip @ coin_flip @ p)

# A qubit: the Hadamard gate acts on amplitudes, which can be negative
H = np.array([[1, 1],
              [1, -1]]) / np.sqrt(2)
a = np.array([1.0, 0.0])                       # start in |0⟩
once, twice = H @ a, H @ H @ a
print("\nqubit after one H:  amplitudes", np.round(once, 4), " probabilities", np.round(once ** 2, 4))
print("qubit after two Hs: amplitudes", np.round(twice, 4) + 0.0, " probabilities", np.round(twice ** 2, 4) + 0.0)
```

```text
random bit, flipped once:  [0.5 0.5]
random bit, flipped twice: [0.5 0.5]

qubit after one H:  amplitudes [0.7071 0.7071]  probabilities [0.5 0.5]
qubit after two Hs: amplitudes [1. 0.]  probabilities [1. 0.]
```

One coin flip gives 50/50, and so does one H: so far they look the same. But flipping a coin twice still gives 50/50, while applying H twice returns the qubit to |0⟩ **with certainty**. In the second H, the two paths leading to |1⟩ have amplitudes +½ and −½, and they **cancel**; the two paths to |0⟩ have +½ and +½, and they **add**. This is **interference**, and it's impossible with probabilities, which are never negative.

That's the heart of quantum computing: algorithms arrange amplitudes so that paths to wrong answers cancel and paths to right answers reinforce (Lessons 22 to 28).

## Phase matters, global phase doesn't

Since amplitudes are complex, each has a magnitude and a **phase** (an angle, Lesson 2). Two kinds of phase behave very differently:

- A **relative phase** between the |0⟩ and |1⟩ parts, as in |+⟩ = (|0⟩ + |1⟩)/√2 versus |−⟩ = (|0⟩ − |1⟩)/√2, is physical. It doesn't change the probabilities of measuring 0 or 1 directly, but it changes what happens after further gates.
- A **global phase**, multiplying the whole state by the same e^(iθ), changes nothing at all: every probability, after any sequence of gates, is the same.

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

def show(state):
    return {str(k): round(float(v), 4) for k, v in state.probabilities_dict().items() if v > 1e-9}

plus = Statevector([1, 1] / np.sqrt(2))          # |+⟩ = (|0⟩ + |1⟩)/√2
minus = Statevector([1, -1] / np.sqrt(2))        # |−⟩ = (|0⟩ − |1⟩)/√2
print("measured directly:  |+⟩ →", show(plus), "   |−⟩ →", show(minus))

h = QuantumCircuit(1); h.h(0)
print("after an H gate:    |+⟩ →", show(plus.evolve(h)), "           |−⟩ →", show(minus.evolve(h)))

# A global phase (multiplying the whole state by e^(iθ)) changes nothing measurable
shifted = Statevector(np.exp(0.7j) * plus.data)
print("\n|+⟩ and e^(0.7i)|+⟩ are physically the same state:", shifted.equiv(plus))
print("|+⟩ and |−⟩ are physically the same state:        ", minus.equiv(plus))
```

```text
measured directly:  |+⟩ → {'0': 0.5, '1': 0.5}    |−⟩ → {'0': 0.5, '1': 0.5}
after an H gate:    |+⟩ → {'0': 1.0}            |−⟩ → {'1': 1.0}

|+⟩ and e^(0.7i)|+⟩ are physically the same state: True
|+⟩ and |−⟩ are physically the same state:         False
```

|+⟩ and |−⟩ give identical 50/50 statistics when measured directly. After one Hadamard, they become |0⟩ and |1⟩, perfectly distinguishable. Meanwhile, e^(0.7i)|+⟩ is exactly the same physical state as |+⟩. Lesson 10 explores phase in depth.

Because global phase doesn't matter and the state is normalised, a qubit's state has just **two real parameters**, not four. That's what makes it possible to draw every qubit state as a point on a sphere, the **Bloch sphere** of Lesson 7.

## Many qubits: the state space explodes

For n qubits, the state is a vector over all 2ⁿ bitstrings: |00…0⟩, |00…1⟩, …, |11…1⟩, with one complex amplitude each (Lesson 12). Storing that vector on a classical computer quickly becomes impossible:

```python
print("qubits   amplitudes        memory to store them (16 bytes each)")
for n in [10, 20, 30, 40, 50, 60]:
    size = 16 * 2 ** n
    for unit, scale in [("EB", 1e18), ("PB", 1e15), ("TB", 1e12), ("GB", 1e9), ("MB", 1e6), ("KB", 1e3)]:
        if size >= scale:
            break
    print(f"{n:4d}   {2 ** n:20,d}   {size / scale:8.1f} {unit}")
```

```text
qubits   amplitudes        memory to store them (16 bytes each)
  10                  1,024       16.4 KB
  20              1,048,576       16.8 MB
  30          1,073,741,824       17.2 GB
  40      1,099,511,627,776       17.6 TB
  50   1,125,899,906,842,624       18.0 PB
  60   1,152,921,504,606,846,976       18.4 EB
```

Thirty qubits need about 17 GB, which fits on a good workstation. Forty need 17.6 TB, which needs a supercomputer. Fifty need 18 petabytes, beyond the memory of almost any machine on Earth. Every added qubit **doubles** the memory. That's why quantum systems are hard to simulate, and why Richard Feynman suggested in 1981 that simulating nature might need computers that are themselves quantum (Lesson 29).

## How much information does a qubit hold?

If a qubit's state has two continuous real parameters, can it store infinitely many bits? No, and this is one of the most important facts in the field.

**Holevo's theorem** (1973) says that n qubits can deliver at most **n bits** of classical information to whoever measures them. You can't read out α and β: one measurement gives one bit and destroys the superposition. Estimating α and β takes many copies of the state (Lesson 8), and an unknown state can't be copied (Lesson 16).

So the power of qubits doesn't come from storing more data. It comes from **how amplitudes combine and interfere** during a computation, before the single measurement at the end. Lesson 31 returns to this point when separating real quantum speed-ups from myths.

## The four big ideas

1. **Superposition:** a state with non-zero amplitudes on more than one basis state.
2. **Measurement:** gives one result, with probability |amplitude|², and leaves the qubit in that result.
3. **Interference:** amplitudes add or cancel; algorithms use this to suppress wrong answers.
4. **Entanglement:** several qubits sharing one state that can't be split into separate states for each (Lesson 14).

## Try it

1. A qubit is in (√3/2)|0⟩ + (1/2)|1⟩. What are P(0) and P(1)?
2. Normalise the vector (1, 1 + i). What is P(1)?
3. Is (0.6, 0.8i) a valid qubit state? What about (0.6, 0.6)?
4. In the coin-versus-qubit code, why does applying H twice give |0⟩ with certainty, while flipping a coin twice gives 50/50?
5. |ψ⟩ = (|0⟩ + i|1⟩)/√2. What are P(0) and P(1)? Is it the same physical state as |+⟩?
6. How much memory would a 35-qubit state vector need (16 bytes per amplitude)?
7. If a qubit's state has two real parameters, why can't you store a whole book in one qubit?

**Answers:**

1. P(0) = 3/4 = **0.75**, P(1) = 1/4 = **0.25**.
2. Length² = 1 + |1 + i|² = 1 + 2 = 3, so the state is (1, 1 + i)/√3, and P(1) = 2/3 ≈ **0.667**.
3. (0.6, 0.8i): 0.36 + 0.64 = 1, so **yes**. (0.6, 0.6): 0.36 + 0.36 = 0.72, so **no** (it would need normalising).
4. Amplitudes can be negative: the two paths to |1⟩ contribute +½ and −½ and cancel, while the paths to |0⟩ add to 1. Probabilities are never negative, so a coin's paths can't cancel.
5. P(0) = P(1) = **½**. It is **not** the same state as |+⟩: the relative phase is i instead of 1. They differ in what happens after further gates (for example, measuring in the Y basis distinguishes them).
6. 16 × 2³⁵ ≈ 5.5 × 10¹¹ bytes ≈ **550 GB**.
7. Holevo's theorem: one qubit can deliver at most one classical bit when measured. You can't read out the amplitudes, and you can't copy the state to measure it many times.

## Cheat sheet

| Idea | Formula or fact |
|---|---|
| Basis states | \|0⟩ = (1, 0), \|1⟩ = (0, 1) |
| Qubit state | \|ψ⟩ = α\|0⟩ + β\|1⟩ = (α, β), α and β complex |
| Normalisation | \|α\|² + \|β\|² = 1 |
| Born rule | P(0) = \|α\|², P(1) = \|β\|²; then the qubit becomes the result |
| Random bit vs qubit | Probabilities can't cancel; amplitudes can (interference) |
| H twice | H·H = I: superposition and back, through interference |
| Relative phase | Physical: \|+⟩ ≠ \|−⟩ |
| Global phase | Unphysical: e^(iθ)\|ψ⟩ ≡ \|ψ⟩ |
| Parameters | 2 real numbers per qubit → the Bloch sphere (Lesson 7) |
| n qubits | 2ⁿ amplitudes; memory doubles per qubit |
| Holevo bound | n qubits deliver at most n classical bits |
| Four big ideas | Superposition, measurement, interference, entanglement |
