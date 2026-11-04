---
layout: ../../layouts/Post.astro
title: "Real hardware and your path in quantum"
description: "The final lesson: a capstone experiment that measures how much a quantum computer's errors cost per layer of gates (run locally on a noisy device model, then ready for real IBM hardware), what you can now do after 50 lessons, how to build a portfolio that proves it, a 12-month learning plan, the main career directions, and resources in India and online."
date: 2026-11-04
category: lesson
lesson: 49
---

You've reached the last lesson of Course 1. Fifty lessons ago, a bit was a switch and a qubit was a mystery. Now you can write and analyse quantum circuits, explain the major algorithms and their limits, describe how errors are corrected and mitigated, compare hardware platforms, run code on real devices, and read research critically.

This lesson does three things. First, a **capstone experiment** that pulls together transpiling, noise, benchmarking and data fitting: you'll measure how fast a quantum computer loses information as circuits get deeper. Second, a practical guide to turning what you've learned into **evidence** that employers and professors value. Third, a map of **where to go next**.

## What you can now do

| Part | Lessons | You can now... |
|---|---|---|
| A. Getting ready | 0–5 | Work with bits, complex numbers, vectors, matrices and probability |
| B. One qubit | 6–11 | Describe any qubit state, measurement and single-qubit gate |
| C. Many qubits | 12–17 | Use tensor products, entanglement, Bell tests, no-cloning and universal gate sets |
| D. Coding with Qiskit | 18–21 | Build, simulate and analyse circuits; teleport and superdense-code |
| E. Quantum algorithms | 22–31 | Explain and implement the main algorithms, and say honestly what they can and can't do |
| F. Errors and correction | 32–36 | Model noise, build error-correcting codes, understand the surface code, mitigate errors |
| G. Hardware | 37–40 | Explain how superconducting, ion, atom and photonic qubits work; transpile and run on hardware |
| H. Communication and sensing | 41–44 | Explain QKD, quantum networks, post-quantum cryptography and quantum sensors |
| I. Applications and your path | 45–49 | Evaluate applications in chemistry, ML, optimisation and finance; read research; plan a career |

## Capstone: how much does each layer cost?

Here's a simple, powerful experiment that researchers and companies use to benchmark real devices: **mirror circuits**. Build a random circuit U of some depth, then apply its exact inverse U†. Ideally U†U = I, so the qubits must return to |00…0⟩. Any departure is caused by errors. Measuring how the success rate falls as the depth grows tells you the cost of each layer of gates on that machine.

Two details matter, and both come from earlier lessons. First, a **barrier** between U and U† stops the transpiler (Lesson 40) from cancelling them, which would make the experiment meaningless. Second, we fit the decay with a simple exponential model, as in Lesson 48's randomised benchmarking. Here it is on a noisy model of a 5-qubit device:

```python
import numpy as np
from scipy.optimize import curve_fit
from qiskit import QuantumCircuit
from qiskit.circuit.library import CXGate
from qiskit.providers.fake_provider import GenericBackendV2
from qiskit.transpiler import CouplingMap
from qiskit.transpiler.preset_passmanagers import generate_preset_pass_manager
from qiskit_aer import AerSimulator

backend = GenericBackendV2(num_qubits=5, coupling_map=CouplingMap.from_line(5),
                           basis_gates=["cz", "rz", "sx", "x"], seed=42)
sim = AerSimulator.from_backend(backend, seed_simulator=3)
pm = generate_preset_pass_manager(backend=backend, optimization_level=1, seed_transpiler=1)
rng = np.random.default_rng(2)

def mirror_circuit(n, layers):
    """Random layers U, then their exact inverse U†: ideally the qubits return to |00...0⟩."""
    U = QuantumCircuit(n)
    for _ in range(layers):
        for q in range(n):
            U.rx(rng.uniform(0, 2 * np.pi), q); U.rz(rng.uniform(0, 2 * np.pi), q)
        start = rng.integers(2)
        for q in range(start, n - 1, 2):
            U.cx(q, q + 1)
    qc = U.copy()
    qc.barrier()            # stops the transpiler cancelling U against U†: we want the hardware to do the work
    qc.compose(U.inverse(), inplace=True)
    qc.measure_all()
    return qc

n, shots = 4, 2000
depths = [1, 2, 4, 6, 8, 12, 16]
success = []
for L in depths:
    circs = pm.run([mirror_circuit(n, L) for _ in range(5)])        # 5 random circuits per depth
    results = sim.run(circs, shots=shots).result()
    success.append(np.mean([results.get_counts(k).get("0" * n, 0) / shots for k in range(5)]))
    print(f"depth {L:2d} (×2 for the mirror): success {success[-1]:.3f}")

model = lambda L, A, f: A * f ** (2 * L)                                # each layer (and its mirror) keeps fraction f
(A, f), _ = curve_fit(model, depths, success, p0=[1.0, 0.98])
print(f"\nfitted: about {100 * (1 - f):.1f}% of the success is lost per layer of {n} qubits")
```

```text
depth  1 (×2 for the mirror): success 0.976
depth  2 (×2 for the mirror): success 0.963
depth  4 (×2 for the mirror): success 0.921
depth  6 (×2 for the mirror): success 0.887
depth  8 (×2 for the mirror): success 0.868
depth 12 (×2 for the mirror): success 0.813
depth 16 (×2 for the mirror): success 0.757

fitted: about 0.8% of the success is lost per layer of 4 qubits
```

The success rate falls from 98% to 76% as the depth grows, and the fit says each layer (four qubits of random rotations plus a row of CNOTs, applied forwards and backwards) costs about 0.8% of the success probability. That single number summarises the device's practical quality for circuits like yours: with it, you can predict that a 50-layer circuit would succeed only about 0.992¹⁰⁰ ≈ 45% of the time, and decide whether error mitigation (Lesson 36) is worth the extra shots.

### Running it on a real quantum computer

The same code runs on IBM hardware with three changes (setup is in Lesson 40):

```py
from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2 as Sampler

service = QiskitRuntimeService()
backend = service.least_busy(operational=True, simulator=False)   # 1. a real device
pm = generate_preset_pass_manager(backend=backend, optimization_level=1, seed_transpiler=1)
sampler = Sampler(mode=backend)                                    # 2. the runtime Sampler

circs = pm.run([mirror_circuit(n, L) for L in depths for _ in range(5)])
job = sampler.run(circs, shots=2000)                               # 3. one job for everything
print(job.job_id())                                                # fetch later with service.job(id)
```

Submitting all circuits in **one job** saves queue time. Read the counts from `job.result()[k].data.meas.get_counts()` for each circuit k, and fit exactly as before.

### Extend it into a real project

- **Compare devices or qubits:** run on two different backends, or on the best and worst qubits of one device (choose with `initial_layout`).
- **Test mitigation:** repeat with `sampler.options.dynamical_decoupling.enable = True` and with twirling, and measure the change in error per layer.
- **Compare with the calibration data:** predict the error per layer from the device's reported gate errors (Lesson 40) and compare with what you measured. Are they consistent? If not, why?
- **Write it up:** a short report with your method, plots, fitted numbers with uncertainties, and an honest discussion, exactly as Lesson 48 describes.

That's a genuine, publishable-quality student project, and exactly the kind of evidence that stands out.

## Build a portfolio

Certificates show you attended something. A **portfolio** shows what you can do. Build one in public, on GitHub or a personal website:

1. **Course notebooks:** your own versions of key lessons (teleportation, Grover, phase estimation, a stabilizer code, VQE for H₂), each with a short README explaining the result in your own words.
2. **One original project**, such as the capstone above, or: Grover on simulator versus hardware; the Steane code with a decoder; a QKD simulation with an eavesdropper and finite-key effects; a post-quantum signature on a microcontroller.
3. **Writing:** short explanations of concepts, aimed at beginners. Teaching exposes the gaps in your own understanding faster than anything else, and it's visible proof of communication skills.
4. **Open source:** documentation fixes and small issues in Qiskit, Stim, Mitiq or other projects are welcomed, and maintainers notice good contributors.
5. **Events:** hackathons, IBM Quantum challenges, Qiskit Fall Fest events at universities, and quantum summer schools are where you meet people and get noticed.

## A 12-month plan

| Months | Focus | Concrete goals |
|---|---|---|
| 1–2 | Consolidate foundations | Redo the Try-it exercises for Parts A–C; strengthen linear algebra and probability (Course 2 on this site will help) |
| 3–4 | Coding fluency | Rebuild Parts D–E in your own notebooks; learn NumPy and Qiskit properly |
| 5–6 | Choose a direction | Read the reviews and lessons for your chosen path (table below); start one original project |
| 7–8 | Hardware experience | Run the capstone and your project on real hardware; write up results |
| 9–10 | Go deeper | Work through chapters of Nielsen and Chuang, an NPTEL course, or IBM's learning paths; take Course 3 on this site |
| 11–12 | Show and apply | Publish your portfolio; apply for internships, research projects or roles; contribute to open source |

An hour a day for a year is enough to reach a level where you can contribute meaningfully, especially if you combine quantum with a field you already know.

## Choose a direction

| Path | Core skills | Course lessons to master | Typical next step |
|---|---|---|---|
| Quantum software | Python, linear algebra, compilers, Qiskit | 17–20, 40 | Open-source contributions, software internships |
| Algorithms and research | Strong mathematics and physics, reading papers | 22–31, 45–46, 48 | MSc or PhD, research internships |
| Hardware and control | Electronics, RF, FPGA, embedded systems, cryogenics | 32, 37–40 | Lab work, control-stack projects (for example, open FPGA-based qubit controllers such as QICK) |
| Error correction | Codes, decoders, high-performance computing | 33–36 | Decoder projects with Stim and PyMatching; research |
| Security and PQC | Cryptography, networking, secure firmware | 41, 43 | Migrating real systems to post-quantum cryptography |
| Sensing and photonics | Optics, lasers, low-noise electronics | 39, 41, 42, 44 | Instrumentation labs, sensing startups |
| Applications | Chemistry, materials, finance or logistics, plus quantum | 29, 45, 46 | Industry research teams, consulting |

If you're already working, look for the **bridge** between your current job and quantum: a firmware engineer can move into control systems or PQC on devices; a data scientist into quantum algorithms and benchmarking; a chemist into quantum chemistry. Lesson 47 maps these roles in more detail.

## Resources in India and online

- **NPTEL** offers free IIT courses on quantum mechanics, quantum computing and quantum information, with optional certificates.
- **The National Quantum Mission's four hubs** (IISc Bengaluru, IIT Madras, IIT Bombay, IIT Delhi) and their partner institutions run research projects, schools and internships; watch their websites and DST announcements (Lesson 47).
- **IBM Quantum Learning** and the **Qiskit documentation** offer free courses and tutorials that run on real hardware; Course 3 on this site will walk through them in English and Hindi.
- **Open-source tools** used in this course: Qiskit, Qiskit Aer, Stim, PyMatching and Mitiq, all free.
- **Books:** *Quantum Computation and Quantum Information* (Nielsen and Chuang) as the standard reference; *Quantum Computing: An Applied Approach* (Hidary) for a practical angle; *Quantum Computing Since Democritus* (Aaronson) for the big ideas.
- **This site:** Course 2 (Foundations) and Course 3 (IBM Quantum series) are in preparation, and the Lab, Glossary and Explainers are here to revisit any idea.

## A last word

Quantum technology is still young. The machines are noisy, the useful applications are only beginning to emerge, and much of the hype will fade. But the underlying science is real, the progress in error correction is genuine, and the field needs far more people than it has: people who understand both the promise and the limits, who can build and test and explain. If you've worked through these lessons, you're already one of them. Keep going, build something, share what you learn, and help make Kota, and India, a place where quantum technology is learned and built.

## Try it

1. Why must there be a barrier between U and U† in a mirror circuit?
2. Using the fitted value of 0.8% per layer, estimate the success rate of a mirror circuit with 25 layers each way.
3. Why submit all the circuits of an experiment in a single job on real hardware?
4. Name two ways to extend the capstone into an original project.
5. What's the difference between a certificate and a portfolio, and why do employers value the second more?
6. Which direction in the table best fits you, and which three lessons will you revisit first?

**Answers:**

1. Without it, the transpiler can recognise that U†U = I and cancel the whole circuit, so you'd measure nothing about the hardware's errors.
2. Each layer keeps about 0.992 of the success, applied 2 × 25 = 50 times: 0.992⁵⁰ ≈ **0.67**, about 67% (times the small offset A).
3. Each job waits in the queue separately; one job means one wait, and all circuits run under the same calibration, which makes the results comparable.
4. For example: compare two devices or qubit sets; test the effect of dynamical decoupling or twirling; compare measured error per layer with the device's calibration data; extend to more qubits.
5. A certificate shows you completed something; a portfolio shows what you can actually do, with code, results and explanations that anyone can check.
6. This depends on you. For example, an embedded engineer might choose hardware and control, revisiting Lessons 32, 38 and 40.

## Cheat sheet

| Idea | Formula or fact |
|---|---|
| Mirror circuit | U then U†; ideal result \|00…0⟩; errors lower the success rate |
| Barrier | Stops the transpiler cancelling U against U† |
| Fit | success ≈ A·f^(2L); loss per layer = 1 − f |
| Prediction | Success over many layers ≈ f^(total layers) |
| On hardware | Swap in the runtime Sampler and a real backend; one job for all circuits |
| Portfolio | Notebooks, one original project, writing, open source, events |
| 12-month plan | Foundations → coding → direction → hardware → depth → apply |
| Directions | Software, algorithms, hardware and control, QEC, security, sensing, applications |
| Resources | NPTEL, NQM hubs, IBM Quantum Learning, Qiskit, Stim, Nielsen and Chuang |
| Next on this site | Course 2: Foundations; Course 3: IBM Quantum series |
