---
layout: ../../layouts/Post.astro
title: "Teleportation and superdense coding"
description: "The two protocols that show what entanglement is worth. The Bell basis and Bell measurement, teleportation derived step by step and run as a real dynamic circuit with mid-circuit measurement and feed-forward, why it can't send anything faster than light, teleporting entanglement itself, how good a shared pair must be to beat classical methods, superdense coding with perfect and noisy pairs, why both protocols are optimal, landmark experiments, and where teleportation is used."
date: 2026-11-04
category: lesson
lesson: 21
---

Entanglement (Lesson 14) is more than a strange correlation. It's a **resource**: something you can make in advance, store, and then **spend** to do a job that would otherwise be impossible. The unit of this resource is one shared Bell pair, called an **ebit**.

This lesson covers the two classic ways to spend an ebit, discovered in 1992 and 1993:

- **Teleportation:** 1 ebit + 2 classical bits → move 1 qubit.
- **Superdense coding:** 1 ebit + 1 qubit → deliver 2 classical bits.

They're mirror images of each other, and together they pin down exactly how entanglement, qubits and classical bits trade against one another. Along the way you'll use mid-circuit measurement and feed-forward (Lesson 19) for real, and see why teleportation is a working tool in quantum networks and fault-tolerant computers, not just a party trick.

## The Bell basis and the Bell measurement

Both protocols rest on the four **Bell states** (Lesson 14), maximally entangled states of two qubits:

> Φ+ = (|00⟩ + |11⟩)/√2   Φ− = (|00⟩ − |11⟩)/√2
> Ψ+ = (|01⟩ + |10⟩)/√2   Ψ− = (|01⟩ − |10⟩)/√2

They're orthogonal to each other, so together they form a **basis** for two qubits, the **Bell basis**, just as |00⟩, |01⟩, |10⟩ and |11⟩ do. The circuit "H on the first qubit, then CNOT" turns each ordinary basis state into a different Bell state. Running it backwards, "CNOT, then H on the first qubit", turns each Bell state back into an ordinary basis state, which can then be measured. That reverse circuit plus a normal measurement is a **Bell measurement**: it tells you which of the four Bell states two qubits are in.

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

bell_circuit = QuantumCircuit(2)
bell_circuit.h(0); bell_circuit.cx(0, 1)          # makes a Bell state
bell_measure = QuantumCircuit(2)
bell_measure.cx(0, 1); bell_measure.h(0)          # the same steps reversed: a Bell measurement

def show(state):
    """Write a 2-qubit state as a sum of kets, qubit 0 first (left)."""
    terms = []
    for key, amp in sorted(state.to_dict().items(), key=lambda kv: kv[0][::-1]):
        if abs(amp) < 1e-9: continue
        sign = "−" if amp.real < 0 else "+"
        terms.append(f"{sign} |{key[::-1]}⟩")
    return "(" + " ".join(terms).lstrip("+ ") + ")/√2"

for start, name in [("00", "Φ+"), ("01", "Ψ+"), ("10", "Φ−"), ("11", "Ψ−")]:
    prep = QuantumCircuit(2)
    for q, bit in enumerate(start):
        if bit == "1": prep.x(q)
    bell = Statevector(prep.compose(bell_circuit))
    probs = bell.evolve(bell_measure).probabilities_dict()
    result = max(probs, key=probs.get)[::-1]
    print(f"|{start}⟩  →  {name} = {show(bell):22s}  →  Bell measurement gives {result} (prob {probs[result[::-1]]:.0f})")
```

```text
|00⟩  →  Φ+ = (|00⟩ + |11⟩)/√2        →  Bell measurement gives 00 (prob 1)
|01⟩  →  Ψ+ = (|01⟩ + |10⟩)/√2        →  Bell measurement gives 01 (prob 1)
|10⟩  →  Φ− = (|00⟩ − |11⟩)/√2        →  Bell measurement gives 10 (prob 1)
|11⟩  →  Ψ− = (|01⟩ − |10⟩)/√2        →  Bell measurement gives 11 (prob 1)
```

(In this output the kets are written with qubit 0 on the **left**, the order used in textbooks.) Each Bell state maps to a unique two-bit result with certainty. The first bit records the **sign** (Φ+ and Ψ+ have a plus, Φ− and Ψ− a minus), and the second records the **parity** (Φ states have equal bits, Ψ states have different bits).

## Teleportation

### The problem

Alice holds a qubit in an **unknown** state |ψ⟩ = α|0⟩ + β|1⟩, and wants Bob, far away, to have it. She can't measure it, because one measurement gives one bit and destroys α and β (Lesson 8). She can't copy it and send the copy (no-cloning, Lesson 16). And she might not be able to send the qubit itself: photons get lost in fibres, and a qubit stored in an atom or a chip can't easily be moved.

What she can do is use a Bell pair that she and Bob shared earlier, plus an ordinary phone call.

### The recipe

Label the qubits: q0 is the message, q1 is Alice's half of the Bell pair, and q2 is Bob's half.

1. **Share a Bell pair** Φ+ on q1 and q2, in advance. Bob takes q2 with him.
2. **Alice does a Bell measurement** on q0 and q1: CNOT from q0 to q1, H on q0, then measure both. She gets two random bits, m0 and m1.
3. **She sends m0 and m1 to Bob** by any ordinary channel.
4. **Bob corrects:** if m1 = 1 he applies X; then, if m0 = 1, he applies Z.

Bob's qubit is now exactly |ψ⟩.

### Why it works

Write the three-qubit starting state |ψ⟩ ⊗ Φ+ out in full and regroup it using the Bell basis for Alice's two qubits. A few lines of algebra give

> |ψ⟩₀ Φ+₁₂ = ½ [ Φ+ (α|0⟩ + β|1⟩) + Ψ+ (β|0⟩ + α|1⟩) + Φ− (α|0⟩ − β|1⟩) + Ψ− (α|1⟩ − β|0⟩) ]

where each Bell state is on Alice's qubits and the bracket after it is Bob's qubit. This is remarkable: **before anyone does anything**, the state already contains Bob's qubit in a version of |ψ⟩ for each of Alice's four possible Bell results. Alice's Bell measurement simply picks one term at random, each with probability ¼, and her two bits tell Bob which one. Each version differs from |ψ⟩ by a known Pauli, X, Z or both, which Bob undoes.

Let's see the four branches, for the message 0.6|0⟩ + 0.8i|1⟩:

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

alpha, beta = 0.6, 0.8j                       # the state to teleport: 0.6|0> + 0.8i|1>
qc = QuantumCircuit(3)                        # q0: Alice's message, q1: Alice's half, q2: Bob's half
qc.initialize([alpha, beta], 0)
qc.h(1); qc.cx(1, 2)                          # share a Bell pair
qc.cx(0, 1); qc.h(0)                          # Alice's Bell-measurement circuit (before measuring)
amp = Statevector(qc).data                    # index = q0 + 2*q1 + 4*q2

def ket(v):
    """Write (a, b) as 'a|0> + b|1>' with tidy complex numbers."""
    def num(z):
        z = complex(np.round(z, 3))
        return f"{z.real:g}" if z.imag == 0 else (f"{z.imag:g}i" if z.real == 0 else f"({z.real:g}{z.imag:+g}i)")
    return f"{num(v[0])}|0⟩ + {num(v[1])}|1⟩".replace("-", "−").replace("+ −", "− ")

X, Z = np.array([[0, 1], [1, 0]]), np.diag([1, -1])
fixes = {"nothing": np.eye(2), "X": X, "Z": Z, "X then Z": Z @ X}
for m0 in (0, 1):
    for m1 in (0, 1):
        bob = np.array([amp[m0 + 2 * m1], amp[m0 + 2 * m1 + 4]])       # Bob's part for this result
        p = np.vdot(bob, bob).real
        bob = bob / np.sqrt(p)
        fix = {(0, 0): "nothing", (0, 1): "X", (1, 0): "Z", (1, 1): "X then Z"}[(m0, m1)]
        fixed = fixes[fix] @ bob
        print(f"m0 m1 = {m0} {m1} (prob {p:.2f}): Bob has {ket(bob):17s} apply {fix:8s} -> {ket(fixed)}")
```

```text
m0 m1 = 0 0 (prob 0.25): Bob has 0.6|0⟩ + 0.8i|1⟩  apply nothing  -> 0.6|0⟩ + 0.8i|1⟩
m0 m1 = 0 1 (prob 0.25): Bob has 0.8i|0⟩ + 0.6|1⟩  apply X        -> 0.6|0⟩ + 0.8i|1⟩
m0 m1 = 1 0 (prob 0.25): Bob has 0.6|0⟩ − 0.8i|1⟩  apply Z        -> 0.6|0⟩ + 0.8i|1⟩
m0 m1 = 1 1 (prob 0.25): Bob has −0.8i|0⟩ + 0.6|1⟩ apply X then Z -> 0.6|0⟩ + 0.8i|1⟩
```

Each of Alice's four results is equally likely, and in each case Bob's qubit holds α and β, possibly swapped or with a sign flipped. The right correction restores the exact message, including the complex phase i, which no measurement could have revealed.

### The real protocol: measure, send, correct

On real hardware, Alice's measurement happens in the middle of the circuit, and Bob's corrections depend on the results. That's a **dynamic circuit** with **feed-forward** (Lesson 19): `if_test` applies a gate only if a classical bit is 1. We teleport three random states and measure how well Bob's qubit matches each one:

```python
import numpy as np
from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister
from qiskit.quantum_info import Statevector, state_fidelity, partial_trace
from qiskit_aer import AerSimulator

def teleport(theta, phi):
    q, m = QuantumRegister(3), ClassicalRegister(2)
    qc = QuantumCircuit(q, m)
    qc.u(theta, phi, 0, 0)                  # the message: any single-qubit state
    qc.h(1); qc.cx(1, 2)                    # Bell pair: q1 for Alice, q2 for Bob
    qc.cx(0, 1); qc.h(0)                    # Alice's Bell measurement ...
    qc.measure(0, m[0]); qc.measure(1, m[1])
    with qc.if_test((m[1], 1)): qc.x(2)     # ... two bits travel to Bob, who corrects
    with qc.if_test((m[0], 1)): qc.z(2)
    qc.save_density_matrix([2])             # Bob's qubit, averaged over all shots
    return qc

sim = AerSimulator()
rng = np.random.default_rng(4)
messages = [(rng.uniform(0, np.pi), rng.uniform(0, 2 * np.pi)) for _ in range(3)]
for k, (theta, phi) in enumerate(messages):
    target = QuantumCircuit(1); target.u(theta, phi, 0, 0)
    res = sim.run(teleport(theta, phi), shots=4000, seed_simulator=10**5 * (k + 1)).result()
    counts = dict(sorted(res.get_counts().items()))
    fid = state_fidelity(res.data()["density_matrix"], Statevector(target))
    print(f"θ = {theta:.2f}, φ = {phi:.2f}: Alice's results {counts}, Bob's fidelity {fid:.6f}")

print("\nBob's qubit before the two bits arrive (exact):")
for theta, phi in messages:
    qc = QuantumCircuit(3)
    qc.u(theta, phi, 0, 0); qc.h(1); qc.cx(1, 2); qc.cx(0, 1); qc.h(0)
    rho = partial_trace(Statevector(qc), [0, 1]).data
    print(f"  θ = {theta:.2f}, φ = {phi:.2f}: {(np.round(rho.real, 3) + 0).tolist()}")
```

```text
θ = 2.96, φ = 3.21: Alice's results {'00': 1009, '01': 976, '10': 975, '11': 1040}, Bob's fidelity 1.000000
θ = 3.07, φ = 0.51: Alice's results {'00': 985, '01': 1010, '10': 1015, '11': 990}, Bob's fidelity 1.000000
θ = 1.91, φ = 2.37: Alice's results {'00': 1003, '01': 1046, '10': 989, '11': 962}, Bob's fidelity 1.000000

Bob's qubit before the two bits arrive (exact):
  θ = 2.96, φ = 3.21: [[0.5, 0.0], [0.0, 0.5]]
  θ = 3.07, φ = 0.51: [[0.5, 0.0], [0.0, 0.5]]
  θ = 1.91, φ = 2.37: [[0.5, 0.0], [0.0, 0.5]]
```

For every message, Alice's four results occur about equally often (Qiskit prints m1 on the left), and Bob's qubit matches the message with **fidelity 1**, averaged over all 4,000 runs.

The second part is the key to why teleportation is not faster than light. **Before** the two bits arrive, Bob's qubit is described by the density matrix ½·I (Lesson 16): a perfectly random qubit, **the same for every message**. Nothing Bob can do with it reveals anything about |ψ⟩. The information only becomes available when the classical bits arrive, and they travel no faster than light.

### What teleportation is, and isn't

- **Not matter transport.** Only the state moves. Bob's qubit was with Bob all along.
- **Not copying.** Alice's measurement destroys her original, so at no moment do two copies exist, and no-cloning is respected.
- **Not faster than light.** Without the two bits, Bob has a random qubit.
- **Not expensive in classical communication.** Two bits suffice to send a state described by two continuous real numbers. The rest of the "information" was effectively prepositioned in the shared entanglement.

### Teleporting entanglement

Teleportation moves a qubit's state **including its entanglement with other qubits**. Suppose the message q0 is itself half of a Bell pair with a reference qubit q3 that stays behind. After teleporting q0 to Bob, q3 and Bob's q2 are entangled, though they have never met. This version writes Bob's corrections as controlled gates instead of measurements; the **deferred measurement principle** says that's equivalent (measuring and then classically controlling a gate gives the same result as controlling it quantumly and measuring later):

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, partial_trace, state_fidelity

# q3 is a "reference" qubit that stays with Alice's lab and never moves.
# The message q0 is half of a Bell pair with q3. Teleport q0 to Bob's q2.
qc = QuantumCircuit(4)
qc.h(3); qc.cx(3, 0)                       # message q0 entangled with reference q3
qc.h(1); qc.cx(1, 2)                       # teleportation Bell pair: q1 (Alice), q2 (Bob)
qc.cx(0, 1); qc.h(0)                       # Alice's Bell-measurement circuit
qc.cx(1, 2); qc.cz(0, 2)                   # corrections as controlled gates (deferred measurement)

pair = partial_trace(Statevector(qc), [0, 1])          # the reference q3 and Bob's q2
bell = QuantumCircuit(2); bell.h(1); bell.cx(1, 0)      # Bell state on (q2, q3), as qubits (0, 1)
print("fidelity of (Bob, reference) with a Bell pair:", round(state_fidelity(pair, Statevector(bell)), 6))
alice = partial_trace(Statevector(qc), [2, 3]).probabilities_dict()
print("Alice's two qubits afterwards:", {str(k): round(float(v), 3) for k, v in alice.items()})
```

```text
fidelity of (Bob, reference) with a Bell pair: 1.0
Alice's two qubits afterwards: {'00': 0.25, '01': 0.25, '10': 0.25, '11': 0.25}
```

The reference and Bob's qubit form a perfect Bell pair, while Alice's leftover qubits are completely random and carry no trace of the message. This is **entanglement swapping**, the basic operation of a quantum repeater, which Lesson 42 uses to stretch entanglement across a continent.

## How good must the shared pair be?

Real Bell pairs are imperfect. A standard model is the **Werner state**: a perfect pair with probability p, and completely random junk (½·I ⊗ ½·I) otherwise. Its overlap with the ideal pair, the **Bell fidelity**, is F = p + (1 − p)/4. How well does teleportation work with such a pair?

There's an important benchmark. Without any entanglement, Alice could measure her qubit and phone Bob a description of the result, and Bob could prepare that state. For a random unknown message, the best possible average fidelity of any such **measure-and-prepare** strategy is **2/3**. Teleportation is only worth doing if it beats 2/3.

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import DensityMatrix, Statevector, partial_trace, state_fidelity

def noisy_pair(p):
    """Werner state on (q1, q2): a perfect Bell pair with probability p, random junk otherwise."""
    bell = QuantumCircuit(2); bell.h(0); bell.cx(0, 1)
    return p * DensityMatrix(bell) + (1 - p) * DensityMatrix(np.eye(4) / 4)

protocol = QuantumCircuit(3)
protocol.cx(0, 1); protocol.h(0)                # Alice's Bell measurement circuit
protocol.cx(1, 2); protocol.cz(0, 2)            # Bob's corrections (deferred measurement)

rng = np.random.default_rng(0)
messages = []
for _ in range(300):                            # random message states, spread over the Bloch sphere
    v = rng.normal(size=2) + 1j * rng.normal(size=2)
    messages.append(Statevector(v / np.linalg.norm(v)))

print("pair quality p   Bell fidelity F   teleport fidelity   formula (2F+1)/3")
for p in [1.0, 0.8, 0.5, 1 / 3, 0.0]:
    pair = noisy_pair(p)
    fids = []
    for msg in messages:
        rho = DensityMatrix(msg).expand(pair).evolve(protocol)      # q0 = message, q1 q2 = pair
        fids.append(state_fidelity(partial_trace(rho, [0, 1]), msg))
    F = p + (1 - p) / 4
    print(f"     {p:.2f}            {F:.3f}             {np.mean(fids):.3f}              {(2 * F + 1) / 3:.3f}")
print("best possible without entanglement (measure, then send a description): 2/3 = 0.667")
```

```text
pair quality p   Bell fidelity F   teleport fidelity   formula (2F+1)/3
     1.00            1.000             1.000              1.000
     0.80            0.850             0.900              0.900
     0.50            0.625             0.750              0.750
     0.33            0.500             0.667              0.667
     0.00            0.250             0.500              0.500
best possible without entanglement (measure, then send a description): 2/3 = 0.667
```

The simulation matches the formula **f = (2F + 1)/3** exactly. Teleportation beats the classical 2/3 only when the Bell fidelity F is above **½**, which for a Werner state means p > 1/3. Experiments use this as the test that genuine quantum teleportation has happened. Pairs that are too noisy can be improved first by **entanglement purification** (Lesson 42), which turns several poor pairs into fewer good ones.

## Superdense coding

Now run the idea in reverse. Alice wants to send Bob **two classical bits** but can send only **one qubit**. Normally a qubit carries at most one bit (Holevo's bound, Lesson 16). With a shared Bell pair, it carries two.

1. **Share a Bell pair** Φ+ in advance: Alice has q0, Bob has q1.
2. **Alice encodes two bits** by acting on **her qubit only**: nothing, X, Z, or X then Z.
3. **She sends her qubit** to Bob.
4. **Bob does a Bell measurement** on both qubits and reads the two bits.

It works because a Pauli on just one half of Φ+ turns it into each of the other Bell states: X gives Ψ+, Z gives Φ−, and X then Z gives Ψ−. Four orthogonal states can be told apart perfectly, and the Bell measurement does exactly that.

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler
from qiskit.quantum_info import DensityMatrix

bell = QuantumCircuit(2)
bell.h(0); bell.cx(0, 1)                   # the shared Bell pair: q0 Alice, q1 Bob

def encode_decode(message):
    """Alice encodes two bits on her qubit only; Bob then does a Bell measurement on both."""
    qc = QuantumCircuit(2)
    if message[0] == "1": qc.x(0)          # Qiskit order: the left bit is read from q1 ...
    if message[1] == "1": qc.z(0)          # ... and the right bit from q0
    qc.cx(0, 1); qc.h(0)                   # Alice's qubit has travelled to Bob: Bell measurement
    return qc

sampler = StatevectorSampler(seed=1)
for message in ["00", "01", "10", "11"]:
    qc = bell.compose(encode_decode(message))
    qc.measure_all()
    counts = sampler.run([qc], shots=1000).result()[0].data.meas.get_counts()
    print(f"Alice sends {message} -> Bob reads {counts}")

print()
for p in [1.0, 0.9, 0.5, 0.0]:             # an imperfect pair: perfect with probability p, junk otherwise
    pair = p * DensityMatrix(bell) + (1 - p) * DensityMatrix(np.eye(4) / 4)
    probs = pair.evolve(encode_decode("10")).probabilities_dict()
    print(f"pair quality {p}: Bob reads 10 correctly with probability {probs['10']:.3f}")
```

```text
Alice sends 00 -> Bob reads {'00': 1000}
Alice sends 01 -> Bob reads {'01': 1000}
Alice sends 10 -> Bob reads {'10': 1000}
Alice sends 11 -> Bob reads {'11': 1000}

pair quality 1.0: Bob reads 10 correctly with probability 1.000
pair quality 0.9: Bob reads 10 correctly with probability 0.925
pair quality 0.5: Bob reads 10 correctly with probability 0.625
pair quality 0.0: Bob reads 10 correctly with probability 0.250
```

Every message arrives perfectly, 1,000 times out of 1,000. With an imperfect pair, the success probability equals the Bell fidelity F = p + (1 − p)/4: 0.925 for p = 0.9, and 0.25 (pure guessing among four messages) when the pair is junk.

Notice that Alice's encoding is **local**: she never touches Bob's qubit. Yet she chooses between four global states. And the qubit she sends, on its own, is completely random (½·I), so an eavesdropper who intercepts it learns nothing without Bob's half.

## The exchange rate, and why it's optimal

The two protocols are summed up by two **resource inequalities**:

> 1 ebit + 2 classical bits ≥ 1 qubit (teleportation)
> 1 ebit + 1 qubit ≥ 2 classical bits (superdense coding)

Neither can be improved:

- **Superdense coding can't send more than 2 bits per qubit.** Holevo's bound (Lesson 16) limits two qubits, the sent one plus Bob's half, to 2 bits.
- **Teleportation can't use fewer than 2 bits.** Suppose it needed only 1 bit. Then Alice could send 2 bits to Bob by superdense coding, but with the qubit delivered by this cheaper teleportation: in total, 1 classical bit plus 2 ebits would deliver 2 classical bits. Shared entanglement would then be **increasing** the capacity of a classical channel, which would also allow faster-than-light signalling. It can't, so 2 bits are needed.

So entanglement can't replace communication. But combined with communication, it converts freely between classical bits and qubits at a fixed exchange rate.

## Landmark experiments

- **1992–1993:** superdense coding (Bennett and Wiesner) and teleportation (Bennett, Brassard, Crépeau, Jozsa, Peres and Wootters) were proposed.
- **1996:** superdense coding with photons in Innsbruck (Mattle, Weinfurter, Kwiat and Zeilinger). With only mirrors and beam splitters, at most two of the four Bell states can be identified reliably, so this experiment distinguished three messages instead of four, about 1.58 bits per photon.
- **1997–1998:** the first teleportation experiments, with photons, in Innsbruck (Bouwmeester and colleagues, Zeilinger's group) and Rome (Boschi and colleagues, De Martini's group).
- **2012:** teleportation over **143 km** of open air between the Canary Islands of La Palma and Tenerife.
- **2013:** fully deterministic teleportation with feed-forward on a superconducting chip at ETH Zurich.
- **2014:** teleportation between solid-state qubits (spins in diamond) 3 metres apart, in Delft.
- **2017:** ground-to-satellite teleportation over distances up to about **1,400 km**, using China's Micius satellite.
- **2022:** teleportation between two **non-neighbouring** nodes of a three-node quantum network in Delft, using entanglement swapping through the middle node.

## Where teleportation is used

- **Quantum networks.** Lost photons can't be resent, so networks distribute and store Bell pairs, then teleport (Lessons 41 and 42).
- **Modular quantum computers.** Linking several smaller processors by photonic Bell pairs, then teleporting qubits or gates between them, is a leading plan for scaling up (Lesson 42).
- **Gate teleportation** (Gottesman and Chuang, 1999). A slightly modified teleportation applies a gate while it moves a qubit. Fault-tolerant computers use this to apply the hard-to-protect T gate by consuming prepared "magic states" (Lesson 35).
- **Measurement-based quantum computing** (Raussendorf and Briegel, 2001). Prepare a large entangled "cluster state", then compute using only single-qubit measurements and feed-forward: in effect, a long chain of teleportations. Several photonic quantum computing companies build on this model.

## Try it

1. Using the output of the Bell basis code, which Bell state gives the measurement result 10? What does each of the two bits tell you?
2. In the teleportation algebra, if Alice's result is Ψ+, what state does Bob hold before correcting, and what does he apply?
3. Why are all four of Alice's results equally likely, whatever the message?
4. Bob receives only m1 (m0 is lost). What should he do, and what does he end up with?
5. A source makes Werner pairs with p = 0.6. What is the Bell fidelity F, and the average teleportation fidelity? Does it beat measure-and-prepare?
6. In superdense coding, why can't an eavesdropper who intercepts Alice's qubit learn the message?
7. Explain why teleportation must use 2 classical bits, not 1.
8. In the [Quantum Lab](/lab/) circuit builder, build the superdense-coding circuit for the message 11 (H and CNOT for the pair, then X and Z on qubit 0, then CNOT and H). Which result has probability 1?

**Answers:**

1. **Φ−**. The first bit (1) says the sign is minus; the second (0) says the two qubits have equal bits.
2. Bob holds **β|0⟩ + α|1⟩**, the message with the amplitudes swapped. He applies **X**.
3. Each Bell-basis term in the regrouped state has amplitude ½ times a normalised state of Bob's qubit, so each result has probability (½)² = ¼, independent of α and β. This is why Alice's results reveal nothing about the message.
4. Without m0 he can't tell whether a Z is needed. If he applies X when m1 = 1, he holds either |ψ⟩ or Z|ψ⟩, each half the time: a mixture that loses the relative phase between |0⟩ and |1⟩. Teleportation fails without both bits.
5. F = 0.6 + 0.4/4 = **0.7**. Fidelity = (2 × 0.7 + 1)/3 = **0.8**, which **beats** 2/3.
6. On its own, Alice's qubit is half of a maximally entangled pair, so its state is ½·I whatever she encoded. All four messages look identical without Bob's qubit.
7. If 1 bit were enough, combining it with superdense coding would deliver 2 classical bits using only 1 classical bit plus shared entanglement. Entanglement can't add classical capacity (otherwise it could signal faster than light), so 2 bits are necessary.
8. The result **11**, with probability 1: X then Z turns Φ+ into Ψ−, and the Bell measurement maps Ψ− to 11.

## Cheat sheet

| Idea | Formula or fact |
|---|---|
| ebit | One shared Bell pair, a resource that can be spent |
| Bell states | Φ± = (\|00⟩ ± \|11⟩)/√2, Ψ± = (\|01⟩ ± \|10⟩)/√2 |
| Bell measurement | CNOT, H on the first qubit, measure both: bits = (sign, parity) |
| Teleportation | Bell measurement on message + Alice's half; send 2 bits; Bob applies X^m1 then Z^m0 |
| Key identity | \|ψ⟩Φ+ = ½ Σ (Bell state on Alice) ⊗ (Pauli · \|ψ⟩ on Bob) |
| Alice's results | Each with probability ¼, independent of the message |
| No faster than light | Before the bits arrive, Bob's qubit is ½·I for every message |
| No cloning | Alice's original is destroyed |
| Deferred measurement | Measure + classical control ≡ quantum control + measure later |
| Entanglement swapping | Teleporting half of a pair entangles qubits that never met (Lesson 42) |
| Noisy pairs | Teleportation fidelity f = (2F + 1)/3; beats classical 2/3 only if F > ½ |
| Superdense coding | Alice applies I, X, Z or XZ to her half; sends it; Bob's Bell measurement reads 2 bits |
| Exchange rates | 1 ebit + 2 bits ≥ 1 qubit; 1 ebit + 1 qubit ≥ 2 bits; both optimal |
| Uses | Quantum networks, modular computers, gate teleportation (T gates), measurement-based computing |
