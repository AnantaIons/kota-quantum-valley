---
layout: ../../layouts/Post.astro
title: "Roadmap: what to learn first, and how this course works"
description: "The maths, physics, computer science and electronics behind quantum computing, why each one matters, the books to learn from, and how the 50 lessons of Course 1 fit together."
date: 2026-10-28
category: lesson
lesson: 0

---

Quantum computing looks intimidating from the outside because it mixes four subjects that are usually taught separately: **maths, physics, computer science and electronics.** The good news is that you don't need all four on day one, and you don't need a physics degree. You need the right things, in the right order. This page is that order.

If you remember one sentence from this roadmap, make it this one: **learn the maths first, because every later idea is written in it.** A qubit is a vector. A gate is a matrix. A measurement is a probability. Once those three sentences feel natural, the rest of quantum computing becomes a set of clever ideas built on top of them, and clever ideas are much easier to learn than a new language.

## How Course 1 is organised

Course 1 has a roadmap (this page) and 49 lessons, grouped into nine parts. Each part builds on the one before it, so go in order the first time through.

| Part | Lessons | What you'll be able to do at the end |
|---|---|---|
| **A. Getting ready** | 0–5 | Work with bits, complex numbers, vectors, matrices and probabilities comfortably |
| **B. One qubit** | 6–11 | Describe any single-qubit state, apply any single-qubit gate, predict measurements |
| **C. Many qubits** | 12–17 | Combine qubits, create and test entanglement, explain why quantum information can't be copied |
| **D. Coding with Qiskit** | 18–21 | Write, simulate and read real quantum programs, including teleportation |
| **E. Quantum algorithms** | 22–31 | Explain and code Deutsch–Jozsa, Simon, Grover, the QFT, phase estimation, Shor and VQE, and say honestly where quantum helps |
| **F. Errors and correction** | 32–36 | Explain noise, build error-correcting codes, understand the surface code and error mitigation |
| **G. Hardware** | 37–40 | Explain how qubits are built and controlled, and run circuits on real chips |
| **H. Communication and sensing** | 41–44 | Explain QKD, the quantum internet, post-quantum cryptography and quantum sensors |
| **I. Applications and your path** | 45–49 | Judge real applications, read research papers, and plan your next year |

**How much time?** Plan on 1.5 to 3 hours per lesson if you work through the examples with a pen and run the code. One lesson every two or three days finishes the course in about four months. One a week takes about a year, which is still a perfectly good pace.

### What every lesson contains

Every lesson follows the same order, so you always know where you are:

1. **The idea in plain words,** starting from something you already know.
2. **The maths, worked slowly.** Every step is written out. Nothing is "left as an exercise" in the main text.
3. **Code you can run,** tested in Python and Qiskit, with the exact output you should see.
4. **Try it:** short exercises, with answers so you can check yourself.
5. **A cheat sheet:** the whole lesson on one screen, for revision.
6. **A quiz:** four questions. Each answer explains why it's right.

## The four pillars, and why each one matters

### 1. Maths: essential, start here

Maths is the language of the whole field. Here is exactly what you need and where each topic first appears in the course.

| Topic | Why quantum computing needs it | First used in |
|---|---|---|
| Complex numbers and e^(iθ) | The numbers inside a qubit (amplitudes) are complex. Their angle, called the phase, is what makes interference possible. | Lesson 2 |
| Vectors and the dot product | A qubit's state **is** a vector. The dot product (inner product) tells you how much two states overlap, which gives measurement probabilities. | Lesson 3 |
| Matrices and matrix multiplication | Every quantum gate is a matrix. Running a circuit means multiplying matrices. | Lesson 4 |
| Eigenvalues and eigenvectors | The possible results of a measurement are eigenvalues. Phase estimation, one of the most important algorithms, finds an eigenvalue. | Lesson 4 |
| Probability | Measurement gives random results. You need to reason about averages, spreads and how many repetitions (shots) you need. | Lesson 5 |
| Trigonometry | Single-qubit gates are rotations of a sphere. sin, cos and half-angles appear everywhere. | Lesson 7 |
| Tensor product | How several qubits combine into one bigger state. This is where the "2ⁿ" growth of quantum computers comes from. | Lesson 12 |

**How much of this do you already know?** If you've studied Class 12 maths (for example for JEE), you already know complex numbers, matrices, probability and trigonometry. What's usually new is complex vectors, the inner product with complex numbers, eigenvalues and the tensor product. Lessons 2 to 5 teach exactly those gaps, assuming nothing beyond Class 10.

A small taste, so the table isn't abstract. The single most-used gate, the Hadamard gate H, is this matrix:

```text
H = 1/√2 × [ 1   1 ]
           [ 1  −1 ]
```

Apply it to the state |0⟩ = [1, 0] and you get [1/√2, 1/√2]: a 50/50 superposition. That calculation is one matrix times one vector. By Lesson 4 you'll do it in your head.

### 2. Physics: helpful, and it grows with you

You can learn quantum *computing* with very little physics, because the maths captures everything you need to program a quantum computer. Physics becomes important when you want to understand **why** it works and **how** the hardware is built. The physics that matters most:

- **The double-slit experiment.** The clearest picture of interference: single particles, sent one at a time, still build up a striped pattern. Lesson 5 works through it with numbers.
- **The Stern–Gerlach experiment.** Silver atoms split into exactly two beams. This two-outcome system is a qubit, found in nature in 1922. Also in Lesson 5.
- **Modern physics chapters (Class 12 and first-year college):** photons and the photoelectric effect, matter waves, energy levels in atoms. These explain how real qubits are made from atoms, ions and circuits (Part G).
- **Basic quantum mechanics:** states, measurement and spin. Course 1 teaches these as it goes.
- **Some physical chemistry:** orbitals and molecular energy. This is what quantum chemistry simulations (Lesson 45) compute.

### 3. Computer science and Python

- **Binary, logic gates and circuits.** Quantum circuits are a generalisation of classical ones, and comparing them is the best way to see what's genuinely new. Lesson 1 covers this.
- **Python.** Enough to write loops, functions and use a library. All the code in this course is Python with NumPy and Qiskit. Lesson 18 sets up Qiskit from scratch; Lessons 1 to 5 only need plain Python and NumPy.
- **Algorithms and complexity (later).** Big-O notation, and the idea that some problems get much harder as they grow. Lesson 31 uses this to explain honestly which problems quantum computers speed up.

### 4. Electronics: the door into hardware jobs

Quantum computers are controlled by precise microwave pulses, fast digital electronics, FPGAs, cryogenic wiring and low-noise amplifiers. If you know circuits, signals, noise and measurement, you can work on quantum hardware even if you never become a theorist. Lessons 37 to 40 show exactly where these skills fit.

### Which pillars matter most for you?

| If you want to... | Focus on | Lighter on |
|---|---|---|
| Write quantum algorithms and software | Maths, CS, Python | Electronics |
| Build quantum hardware and control systems | Electronics, physics, maths | Advanced algorithms |
| Work on quantum chemistry or materials | Physics, chemistry, maths | Electronics |
| Work on quantum communication or security | Maths, CS (cryptography), optics | Chemistry |
| Teach or explain quantum (like this page) | All four at a basic level | Nothing; breadth is the skill |

You don't have to choose now. Course 1 gives everyone the same base. You'll know which direction pulls you by the time you finish Part E.

## The bookmark list

You don't need to buy any of these to finish Course 1. They are the books to grow into, listed roughly from easiest to hardest, with the chapters that matter most.

| Book | Author | Read | Why |
|---|---|---|---|
| Introduction to Linear Algebra | Gilbert Strang | Ch 1, 2, 4, 6 | The clearest route to vectors, matrices and eigenvalues |
| Visual Complex Analysis | Tristan Needham | Ch 1 | Complex numbers as rotations, with pictures |
| An Introduction to Probability Theory, Vol. 1 | William Feller | Ch I, V, VI | Probability done properly |
| The Feynman Lectures on Physics, Vol. III | Richard Feynman | Ch 1–3, 6, 19 | The best explanation of quantum behaviour ever written; free online |
| Concepts of Modern Physics | Arthur Beiser | Ch 2–5 | Photons, matter waves, atoms |
| Introduction to Quantum Mechanics | David J. Griffiths | Ch 1–3 | The standard first course in quantum mechanics |
| The Art of Electronics | Horowitz & Hill | Ch 1 | Practical electronics, for the hardware path |
| Quantum Computation and Quantum Information | Nielsen & Chuang | Ch 1, 2, 4 | The standard textbook of the field; your final goal |

**Free companions:** 3Blue1Brown's *Essence of Linear Algebra* video series (chapters 1 to 4 cover most of Lessons 3 and 4, with beautiful animations), NPTEL's IIT courses on linear algebra and quantum mechanics, and IBM's free Quantum Learning platform.

## Check yourself

You're ready for Lesson 1 right now; it assumes nothing. But try these four questions to see how much of Part A will be revision for you:

1. Multiply (2 + 3i)(1 − i).
2. Find the size |3 + 4i|.
3. Multiply the matrix [[0, 1], [1, 0]] by the vector [1, 0].
4. A coin lands heads with probability 0.3. What's the probability of tails? If you toss it 100 times, about how many heads do you expect?

**Answers:**

1. (2 + 3i)(1 − i) = 2 − 2i + 3i − 3i² = 2 + i + 3 = **5 + i** (because i² = −1).
2. |3 + 4i| = √(3² + 4²) = √25 = **5**.
3. First row · vector = 0×1 + 1×0 = 0. Second row · vector = 1×1 + 0×0 = 1. Result: **[0, 1]**. (You just applied a quantum NOT gate.)
4. **0.7**, and about **30 heads**.

All four easy? You'll move quickly through Part A. Any of them shaky? Good: that's exactly what Lessons 2 to 5 are for. Take them slowly.

## Where to start today

1. Open **Lesson 1** and read it with a notebook beside you.
2. Install Python if you don't have it (python.org, or use a free online notebook like Google Colab). NumPy is all you need until Lesson 18.
3. Bookmark the [Glossary](/glossary/) and the [Quantum Lab](/lab/). You'll use both all the way through.

## Cheat sheet

| Question | Answer |
|---|---|
| What to learn first? | Maths: complex numbers, vectors, matrices, probability |
| What's a qubit, in one line? | A vector of two complex numbers |
| What's a gate? | A matrix that changes that vector |
| What's a measurement? | A random result, with probabilities set by the vector |
| How is the course organised? | 9 parts, 49 lessons, each building on the last |
| How long does it take? | About 4 months at 2–3 lessons a week |
| What do I need installed? | Python and NumPy now; Qiskit from Lesson 18 |
| Final-goal book? | Nielsen & Chuang, *Quantum Computation and Quantum Information* |
