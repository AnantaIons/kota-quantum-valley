---
layout: ../../layouts/Post.astro
title: "Transpiling and running on hardware"
description: "What happens between your circuit and a real chip. Native gates and how standard gates are translated into them, layout and routing on a limited coupling map (and why placement matters), optimisation levels compared on a noisy simulated device, mapping observables to physical qubits, reading a device's calibration data, and a complete, step-by-step workflow for running on IBM Quantum hardware for free."
date: 2026-11-04
category: lesson
lesson: 40
---

The circuits you've written in this course use convenient gates (H, CNOT, Toffoli, QFT) on qubits that can all talk to each other. Real hardware is pickier. It offers a short list of **native gates**, and only certain pairs of qubits are physically connected. Before a circuit can run, it must be rewritten to fit the chip: a process called **transpiling** (a mix of "translating" and "compiling").

Transpiling isn't a formality. On a noisy machine, a well-transpiled circuit can give a clearly right answer where a badly transpiled version of the same circuit gives noise. This lesson shows what the transpiler does, step by step, on a simulated device with realistic errors, and then walks through running your own circuits on real IBM quantum computers.

## What a device looks like to the transpiler

Qiskit describes a device by a **target**: its native gates, which qubit pairs each two-qubit gate works on (the **coupling map**), and the measured error rate and duration of every operation. Qiskit includes a configurable fake device, `GenericBackendV2`, which we'll use throughout. Here's a 7-qubit device with its qubits in a line and IBM-style native gates:

```python
from qiskit import QuantumCircuit
from qiskit.providers.fake_provider import GenericBackendV2
from qiskit.transpiler import CouplingMap

# A pretend 7-qubit device: qubits in a line, IBM-style native gates
backend = GenericBackendV2(num_qubits=7, coupling_map=CouplingMap.from_line(7),
                           basis_gates=["cz", "rz", "sx", "x"], seed=42)
print("native gates:", sorted(backend.operation_names))
print("connections: ", list(backend.coupling_map.get_edges())[:6], "...")
props = backend.qubit_properties(0)
print(f"qubit 0: T1 = {props.t1 * 1e6:.0f} µs, T2 = {props.t2 * 1e6:.0f} µs")
print(f"CZ on (0, 1): error {backend.target['cz'][(0, 1)].error:.4f}, duration {backend.target['cz'][(0, 1)].duration * 1e9:.0f} ns")
print(f"SX on 0:      error {backend.target['sx'][(0,)].error:.5f}, duration {backend.target['sx'][(0,)].duration * 1e9:.0f} ns")
```

```text
native gates: ['cz', 'delay', 'measure', 'reset', 'rz', 'sx', 'x']
connections:  [(0, 1), (1, 0), (1, 2), (2, 1), (2, 3), (3, 2)] ...
qubit 0: T1 = 177 µs, T2 = 144 µs
CZ on (0, 1): error 0.0049, duration 371 ns
SX on 0:      error 0.00009, duration 54 ns
```

This device can only do four kinds of gates: CZ between neighbours, RZ (any Z rotation), SX (a square root of X, the 90° X rotation), and X. Every qubit has its own T1 and T2, and every gate has its own error rate and duration, just like a real calibration report. A two-qubit CZ is about 50 times more error-prone and 7 times slower than an SX, which is typical.

Why such a small gate set? Because each native gate must be individually calibrated as a physical pulse (Lesson 38). RZ is free (a virtual phase change), SX and X are calibrated pulses, and one entangling gate is enough, since any circuit can be built from these (Lesson 17).

## Step 1: translate to native gates

The simplest job is rewriting each gate in terms of native ones. Here's a Bell-state circuit translated for this device:

```python
from qiskit import QuantumCircuit, transpile
from qiskit.quantum_info import Operator

qc = QuantumCircuit(2)
qc.h(0)
qc.cx(0, 1)

native = transpile(qc, basis_gates=["cz", "rz", "sx", "x"], optimization_level=1)
print("\n".join(line.rstrip() for line in str(native.draw(output="text")).splitlines()))
print("same operation as the original:", Operator(native).equiv(Operator(qc)))
```

```text
global phase: 3π/4
     ┌─────────┐┌────┐┌─────────┐
q_0: ┤ Rz(π/2) ├┤ √X ├┤ Rz(π/2) ├─■─────────────────────────────
     ├─────────┤├────┤├─────────┤ │ ┌─────────┐┌────┐┌─────────┐
q_1: ┤ Rz(π/2) ├┤ √X ├┤ Rz(π/2) ├─■─┤ Rz(π/2) ├┤ √X ├┤ Rz(π/2) ├
     └─────────┘└────┘└─────────┘   └─────────┘└────┘└─────────┘
same operation as the original: True
```

The Hadamard became RZ(π/2)·SX·RZ(π/2), and the CNOT became a CZ with Hadamard-like rotations on the target (since CNOT = (I⊗H)·CZ·(I⊗H)). The global phase of 3π/4 has no physical effect (Lesson 10). The check confirms the translated circuit is exactly the same unitary. Note that the RZs cost nothing on hardware; the real cost here is two SX pulses on qubit 1, one on qubit 0, and one CZ.

## Step 2: layout and routing

Next, the transpiler must decide which **physical** qubit each of your circuit's **virtual** qubits will use (the **layout**), and then fix any two-qubit gates between qubits that aren't neighbours (**routing**). Routing inserts **SWAP** gates to move quantum states next to each other, and each SWAP costs three CNOTs, so it's expensive.

Watch what layout alone does for a circuit with one CNOT between virtual qubits 0 and 2, on our line-shaped device:

```python
from qiskit import QuantumCircuit
from qiskit.providers.fake_provider import GenericBackendV2
from qiskit.transpiler import CouplingMap
from qiskit.transpiler.preset_passmanagers import generate_preset_pass_manager

backend = GenericBackendV2(num_qubits=7, coupling_map=CouplingMap.from_line(7),
                           basis_gates=["cz", "rz", "sx", "x"], seed=42)

qc = QuantumCircuit(3)
qc.h(0)
qc.cx(0, 2)                      # needs virtual qubits 0 and 2 to be next to each other

for layout in [[0, 1, 2], [1, 0, 2]]:
    pm = generate_preset_pass_manager(backend=backend, optimization_level=0, initial_layout=layout)
    out = pm.run(qc)
    ops = out.count_ops()
    print(f"virtual qubits placed on physical {layout}:  CZ gates = {ops.get('cz', 0)},  "
          f"swaps needed = {'yes' if ops.get('cz', 0) > 1 else 'no'}")
```

```text
virtual qubits placed on physical [0, 1, 2]:  CZ gates = 4,  swaps needed = yes
virtual qubits placed on physical [1, 0, 2]:  CZ gates = 1,  swaps needed = no
```

Placed naively on physical qubits 0, 1, 2, virtual qubits 0 and 2 are not neighbours, so the transpiler must insert a SWAP: 4 CZs instead of 1. Placed on physical 1, 0, 2, they are neighbours and need nothing extra. Finding a good layout for a big circuit is a hard optimisation problem (it's related to graph isomorphism), and Qiskit uses fast heuristics: **VF2Layout** looks for a perfect placement with no SWAPs, and **SabreLayout** and **SabreSwap** search for placements and swap sequences with few SWAPs, trying several random starting points.

Good layouts are also **noise-aware**: given a choice, the transpiler prefers qubits and connections with lower error rates, using the device's calibration data.

## Step 3: optimise

Finally, the transpiler simplifies: merging consecutive single-qubit gates into one, cancelling gates that undo each other (like two CNOTs in a row), and resynthesising small blocks of two-qubit gates more efficiently. Qiskit packages all of this into **optimisation levels** 0 to 3. Higher levels try harder and take longer to compile.

Here's the Bernstein–Vazirani circuit from Lesson 22 with a 6-bit secret. On a line-shaped device it's awkward, because every 1 in the secret needs a CNOT to the same ancilla qubit. We transpile it at each level and run it on a simulator that uses the device's own error rates:

```python
from qiskit import QuantumCircuit
from qiskit.providers.fake_provider import GenericBackendV2
from qiskit.transpiler import CouplingMap
from qiskit.transpiler.preset_passmanagers import generate_preset_pass_manager
from qiskit_aer import AerSimulator

backend = GenericBackendV2(num_qubits=7, coupling_map=CouplingMap.from_line(7),
                           basis_gates=["cz", "rz", "sx", "x"], seed=42)
noisy_sim = AerSimulator.from_backend(backend, seed_simulator=7)     # uses the backend's error rates

secret = "101101"                                 # Bernstein–Vazirani (Lesson 22): find this in one query
n = len(secret)
bv = QuantumCircuit(n + 1, n)
bv.x(n); bv.h(range(n + 1))
for i, bit in enumerate(reversed(secret)):
    if bit == "1":
        bv.cx(i, n)                               # every 1 in the secret talks to the same ancilla
bv.h(range(n))
bv.measure(range(n), range(n))

print("level   CZ gates   depth   chance of reading the secret")
for level in [0, 1, 2, 3]:
    pm = generate_preset_pass_manager(backend=backend, optimization_level=level, seed_transpiler=1)
    isa = pm.run(bv)
    counts = noisy_sim.run(isa, shots=4000).result().get_counts()
    print(f"  {level}       {isa.count_ops().get('cz', 0):3d}      {isa.depth():4d}          {counts.get(secret, 0) / 4000:.3f}")
print("level 3 put the 7 circuit qubits on physical qubits:", isa.layout.final_index_layout())
```

```text
level   CZ gates   depth   chance of reading the secret
  0        28        66          0.850
  1        10        33          0.944
  2        10        31          0.946
  3        10        29          0.947
level 3 put the 7 circuit qubits on physical qubits: [1, 0, 3, 2, 6, 5, 4]
```

Level 0 does only what's strictly necessary: a trivial layout and simple routing, producing 28 CZs and a depth of 66, and the noisy device finds the secret 85% of the time. Levels 1 to 3 choose a much better layout and simplify the result, using only 10 CZs at less than half the depth, and the success rate rises to about 95%. The same algorithm, on the same hardware, roughly **a third as many errors**, just from better compiling.

The last line shows where each of the circuit's qubits ended up on the chip. Because routing moves quantum states around with SWAPs, this final placement is in a scrambled order, and the transpiler keeps track of it so that measurement results are reported for the right qubits.

In practice, **optimisation level 3** (or level 2, the default in recent Qiskit versions) is the right choice for almost everything you'll run on hardware.

## Step 4 (often): scheduling and timing

After optimisation, a hardware-ready circuit can also be **scheduled**: every gate is given a start time, and idle periods appear as explicit **delays**. That's where **dynamical decoupling** pulses are inserted into idle gaps (Lesson 36), and where the controller checks that everything fits the hardware's timing rules. IBM's runtime service can do this for you with a single option, as you'll see below.

## Observables must follow the layout

If you use an **Estimator** to measure expectation values (Lesson 19), there's one more step. Your observable is written for the circuit's virtual qubits. After layout, those qubits live on different physical qubits, so the observable has to be moved too, with `apply_layout`:

```python
from qiskit import QuantumCircuit
from qiskit.primitives import BackendEstimatorV2
from qiskit.providers.fake_provider import GenericBackendV2
from qiskit.quantum_info import SparsePauliOp
from qiskit.transpiler import CouplingMap
from qiskit.transpiler.preset_passmanagers import generate_preset_pass_manager
from qiskit_aer import AerSimulator

backend = GenericBackendV2(num_qubits=7, coupling_map=CouplingMap.from_line(7),
                           basis_gates=["cz", "rz", "sx", "x"], seed=42)

ghz = QuantumCircuit(4)
ghz.h(0); ghz.cx(0, 1); ghz.cx(1, 2); ghz.cx(2, 3)
observables = SparsePauliOp(["ZZII", "IIZZ", "XXXX"])     # ideal values: 1, 1, 1

pm = generate_preset_pass_manager(backend=backend, optimization_level=3, seed_transpiler=1)
isa = pm.run(ghz)
isa_obs = [SparsePauliOp(p).apply_layout(isa.layout) for p in observables.paulis.to_labels()]
print("observables after layout:", [o.paulis.to_labels()[0] for o in isa_obs])

estimator = BackendEstimatorV2(backend=AerSimulator.from_backend(backend, seed_simulator=3),
                               options={"default_precision": 0.01, "seed_simulator": 3})
result = estimator.run([(isa, isa_obs)]).result()[0]
for label, value, err in zip(observables.paulis.to_labels(), result.data.evs, result.data.stds):
    print(f"⟨{label}⟩ = {value:.3f} ± {err:.3f}   (ideal 1)")
```

```text
observables after layout: ['IIIIZZI', 'IIZZIII', 'IIXXXXI']
⟨ZZII⟩ = 0.988 ± 0.002   (ideal 1)
⟨IIZZ⟩ = 0.977 ± 0.002   (ideal 1)
⟨XXXX⟩ = 0.963 ± 0.003   (ideal 1)
```

The 4-qubit observables became 7-qubit observables acting on the physical qubits the transpiler chose. Forgetting this step is one of the most common mistakes when moving from a simulator to hardware: the Estimator would measure the wrong qubits. The results are close to the ideal value of 1 but not equal, because the simulated device is noisy. The X-type observable suffers most, because it depends on the fragile phase between |0000⟩ and |1111⟩.

## Running on real IBM hardware

Everything above runs locally. To run on a real quantum computer, IBM offers free access through its **Open Plan**, which at the time of writing includes about **10 minutes of quantum processor time every 28 days**. That's plenty for many small experiments: a typical small job uses a few seconds.

### One-time setup

1. Create a free account at **quantum.cloud.ibm.com** (IBM Quantum Platform).
2. On the dashboard, create an **API key**, and note your **instance** name or CRN.
3. Install the runtime client: `pip install qiskit-ibm-runtime`.
4. Save your credentials once on your computer (never put your API key in code you share or upload):

```py
from qiskit_ibm_runtime import QiskitRuntimeService

QiskitRuntimeService.save_account(
    channel="ibm_quantum_platform",
    token="PASTE_YOUR_API_KEY_HERE",       # keep this private
    instance="PASTE_YOUR_INSTANCE_CRN_OR_NAME",
    set_as_default=True,
)
```

### Running a circuit

This is the complete pattern: pick a device, transpile for it, run with the Sampler, read the counts.

```py
from qiskit import QuantumCircuit
from qiskit.transpiler.preset_passmanagers import generate_preset_pass_manager
from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2 as Sampler

service = QiskitRuntimeService()
backend = service.least_busy(operational=True, simulator=False)   # a real device with a short queue
print("running on", backend.name, "with", backend.num_qubits, "qubits")

bell = QuantumCircuit(2)
bell.h(0)
bell.cx(0, 1)
bell.measure_all()

pm = generate_preset_pass_manager(backend=backend, optimization_level=3)
isa = pm.run(bell)                         # "ISA circuit": uses only this device's native gates and links

sampler = Sampler(mode=backend)
sampler.options.default_shots = 4000
sampler.options.dynamical_decoupling.enable = True      # protect idle qubits (Lesson 36)
sampler.options.twirling.enable_gates = True            # Pauli twirling (Lesson 36)

job = sampler.run([isa])
print("job id:", job.job_id())             # save this: you can fetch the result later with service.job(id)
counts = job.result()[0].data.meas.get_counts()
print(counts)
```

You should see mostly `00` and `11`, with a few percent of `01` and `10` from noise, just like the noisy simulations in this course. The job waits in a **queue** until the device is free, which can take seconds or hours. You can close your laptop and fetch the result later using the job id.

### Running an Estimator with error mitigation

For expectation values, use the Estimator and let IBM's runtime apply error mitigation. Remember to map the observables to the layout:

```py
from qiskit.quantum_info import SparsePauliOp
from qiskit_ibm_runtime import EstimatorV2 as Estimator

ghz = QuantumCircuit(3)
ghz.h(0); ghz.cx(0, 1); ghz.cx(1, 2)
observables = [SparsePauliOp("ZZI"), SparsePauliOp("XXX")]

isa = pm.run(ghz)
isa_obs = [o.apply_layout(isa.layout) for o in observables]

estimator = Estimator(mode=backend)
estimator.options.resilience_level = 2    # readout mitigation + zero-noise extrapolation (Lesson 36)
result = estimator.run([(isa, isa_obs)]).result()[0]
print("values:", result.data.evs, "uncertainties:", result.data.stds)
```

### Testing before you spend your minutes

Before using real hardware time, run the exact same code against a local **fake backend** that copies a real device's layout and calibration (in `qiskit_ibm_runtime.fake_provider`, for example `FakeBrisbane`), by passing it as the `mode`. Runtime's primitives then simulate locally with that device's noise. Once the results make sense, switch `mode` to the real backend. This habit saves both time and quota.

### Execution modes

Jobs can run in three modes. **Job mode** (as above) runs one job at a time. **Batch mode** submits many independent jobs together for better throughput. **Session mode** reserves the device for a series of jobs that depend on each other, such as the optimisation loop of VQE (Lesson 30), so each iteration doesn't wait in the queue again. Sessions aren't available on every plan.

## A checklist for hardware runs

1. **Simulate first**, ideally with a noise model from the target device.
2. **Keep circuits shallow.** Every two-qubit gate costs roughly 0.1 to 1% fidelity (Lesson 32). Check `count_ops()` and `depth()` after transpiling.
3. **Transpile with optimisation level 2 or 3** for the specific backend, and check how many SWAPs were added.
4. **Map observables** with `apply_layout` when using the Estimator.
5. **Use enough shots** for the precision you need: statistical error falls like 1/√shots (Lesson 20).
6. **Turn on mitigation** (dynamical decoupling, twirling, resilience levels) and compare with and without it.
7. **Record everything:** backend name, date, job id, transpiled depth. Calibrations change daily, so results drift.
8. **Interpret honestly:** compare with an ideal simulation, and report the noise rather than hiding it.

Lesson 49 builds on this with a hands-on hardware project and a path to further study.

## Try it

1. Name the four native gates of the example device. Which one costs no time on real hardware?
2. Why does a SWAP cost three two-qubit gates, and why does that make routing expensive?
3. In the layout example, why did placing the virtual qubits on physical qubits 1, 0, 2 avoid any SWAP?
4. Between optimisation levels 0 and 3, how did the number of CZ gates change for Bernstein–Vazirani, and what happened to the success rate?
5. You transpile a circuit and then run an Estimator with your original observables, skipping `apply_layout`. What goes wrong?
6. Why should you never paste your API key directly into a notebook you share?
7. When would you choose session mode over job mode?

**Answers:**

1. CZ, RZ, SX and X. **RZ** is virtual: a phase update in the control software, taking no time.
2. SWAP = three CNOTs (CNOT(a,b)·CNOT(b,a)·CNOT(a,b)), and each CNOT needs a native two-qubit gate. Two-qubit gates are the slowest and most error-prone operations, so every SWAP adds about three two-qubit errors.
3. Virtual qubit 0 went to physical 1 and virtual qubit 2 to physical 2. On a line, physical 1 and 2 are neighbours, so the CNOT maps directly to a CZ (plus single-qubit gates).
4. From **28 to 10** CZs (and depth from 66 to 29); the success rate rose from about **85% to 95%**.
5. The observables would act on the wrong physical qubits (the circuit's qubits were moved by the layout), so the measured values would be meaningless.
6. Anyone with the key can use your account and quota. Save it once with `save_account` on your own machine, or use environment variables, and keep it out of shared files.
7. When jobs depend on each other in a loop, such as a VQE or QAOA optimisation (Lesson 30), so the device stays reserved between iterations instead of re-queuing each time.

## Cheat sheet

| Idea | Formula or fact |
|---|---|
| Native gates | Small calibrated set, e.g. CZ (or ECR), RZ, SX, X |
| Coupling map | Which physical qubit pairs can do two-qubit gates |
| Target | Native gates, connections, errors, durations, T1/T2 of a device |
| Translation | H = RZ(π/2)·SX·RZ(π/2); CNOT = (I⊗H)·CZ·(I⊗H) |
| Layout | Virtual → physical qubit assignment (VF2Layout, SabreLayout), noise-aware |
| Routing | Insert SWAPs (3 CNOTs each) for non-neighbour gates (SabreSwap) |
| Optimisation levels | 0 to 3; use 2 or 3 for hardware |
| Pass manager | `generate_preset_pass_manager(backend=..., optimization_level=3)` |
| ISA circuit | Uses only the device's native gates and connections |
| Observables | `obs.apply_layout(isa.layout)` before the Estimator |
| Fake devices | `GenericBackendV2` (Qiskit), `fake_provider` (runtime) for local tests |
| Noisy simulation | `AerSimulator.from_backend(backend)` |
| IBM Open Plan | Free; about 10 min of QPU time per 28 days |
| Runtime primitives | `SamplerV2`, `EstimatorV2` with `mode=backend` |
| Mitigation options | `dynamical_decoupling.enable`, `twirling.enable_gates`, `resilience_level` |
| Modes | Job, batch, session |
