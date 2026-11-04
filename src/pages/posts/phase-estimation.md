---
layout: ../../layouts/Post.astro
title: "Quantum phase estimation"
description: "Reading the hidden phase of a unitary's eigenvalue into bits: the circuit, the full derivation, exact and inexact phases, how precision and success probability grow with more qubits, estimating the ground-state energy of a small Hamiltonian, the single-qubit iterative version, and why Shor's algorithm and quantum chemistry are both phase estimation."
date: 2026-11-04
category: lesson
lesson: 27

---

Lesson 4 showed that every eigenvalue of a unitary is a phase: U|u⟩ = e^(2πiφ)|u⟩ for some number φ between 0 and 1. That phase often holds exactly the answer you want: the period in Shor's algorithm, the energy of a molecule, the frequency of an atomic clock. But a global phase on |u⟩ is invisible (Lesson 10). How can you possibly read it?

**Quantum phase estimation (QPE)**, introduced by Alexei Kitaev in 1995, does exactly that. It combines two tools you already have: **phase kickback** (Lesson 13), which moves the phase onto control qubits where it becomes a relative phase, and the **inverse QFT** (Lesson 26), which turns those phases into binary digits. It's the most important subroutine in quantum computing.

## The problem

You're given:

- a unitary U that you can apply, controlled, many times, and
- an eigenstate |u⟩ of U (or a state close to one),

with U|u⟩ = e^(2πiφ)|u⟩. **Find φ** to t binary digits.

## The circuit

QPE uses two registers: t **counting qubits**, which will hold the answer, and the **target register**, which holds |u⟩.

1. **Superpose:** H on every counting qubit.
2. **Controlled powers:** counting qubit k controls U applied 2ᵏ times (U, U², U⁴, U⁸, …).
3. **Inverse QFT** on the counting register.
4. **Measure** the counting register. The t-bit result m gives φ ≈ m/2ᵗ.

### Why it works

**Step 2, one qubit at a time.** Take counting qubit k, in |+⟩, controlling U^(2ᵏ) on the eigenstate |u⟩. Since U^(2ᵏ)|u⟩ = e^(2πi·2ᵏφ)|u⟩, phase kickback puts that phase on the control's |1⟩ branch:

> (|0⟩ + |1⟩)/√2 → (|0⟩ + e^(2πi·2ᵏφ)|1⟩)/√2

The target is left exactly as |u⟩, so it doesn't get entangled and can be ignored from now on.

**All counting qubits together:**

> (1/√2ᵗ) (|0⟩ + e^(2πi·2^(t−1)φ)|1⟩) ⊗ … ⊗ (|0⟩ + e^(2πi·2φ)|1⟩) ⊗ (|0⟩ + e^(2πi·φ)|1⟩)

Now compare with Lesson 26's product formula for QFT|j⟩. If φ = m/2ᵗ exactly, for some integer m, this is **precisely QFT|m⟩**: doubling φ shifts its binary digits along, and the integer parts drop out of the phases. (Expanding the product gives (1/√2ᵗ) Σₖ e^(2πiφk)|k⟩, the QFT formula with j = m.)

**Step 3.** So the inverse QFT turns it into |m⟩, and **measuring gives m with certainty**. The phase has become a number.

Let's check with the phase gate P(2πφ), whose eigenstate is |1⟩. With φ = 1/8 the answer should read 001, and with φ = 5/8 it should read 101 (five eighths).

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.circuit.library import QFTGate
from qiskit.quantum_info import Statevector

def qpe_probabilities(phi, t):
    """Phase estimation of U = P(2*pi*phi) on its eigenstate |1>, with t counting qubits."""
    qc = QuantumCircuit(t + 1)
    qc.x(t)                                        # eigenstate |1> on the last qubit
    qc.h(range(t))
    for k in range(t):
        qc.cp(2 * np.pi * phi * 2 ** k, k, t)      # controlled U^(2^k): phase kickback of 2^k * phi
    qc.append(QFTGate(t).inverse(), range(t))
    return Statevector(qc).probabilities(range(t)) # distribution of the counting register

for phi in [1 / 8, 5 / 8]:
    p = qpe_probabilities(phi, 3)
    print(f"phi = {phi}: most likely reading {np.argmax(p):03b} with probability {p.max():.3f}")

phi = 1 / 3                                        # not an exact binary fraction
for t in [3, 5, 8]:
    p = qpe_probabilities(phi, t)
    best = int(np.argmax(p))
    near = sum(p[(best + d) % 2 ** t] for d in (-1, 0, 1))
    print(f"t = {t}: best estimate {best}/{2 ** t} = {best / 2 ** t:.4f}, P(best) = {p[best]:.3f}, P(within one step) = {near:.3f}")
```

```text
phi = 0.125: most likely reading 001 with probability 1.000
phi = 0.625: most likely reading 101 with probability 1.000
t = 3: best estimate 3/8 = 0.3750, P(best) = 0.688, P(within one step) = 0.910
t = 5: best estimate 11/32 = 0.3438, P(best) = 0.684, P(within one step) = 0.898
t = 8: best estimate 85/256 = 0.3320, P(best) = 0.684, P(within one step) = 0.898
```

The first two lines are exact, every time. (Remember T = P(π/4) = P(2π·⅛), so the first line is "phase estimation of the T gate".)

## When φ isn't an exact fraction

The second part of the output asks what happens with φ = 1/3, which has no finite binary expansion (0.010101…). Then the counting register isn't exactly QFT|m⟩ for any m, and the inverse QFT spreads probability over several outcomes, concentrated around the true value.

The guarantees (from Cleve, Ekert, Macchiavello and Mosca, 1998):

- The single **closest** t-bit fraction appears with probability at least **4/π² ≈ 40.5%** (here about 68%).
- To get φ accurate to **n bits** with success probability at least 1 − ε, use **t = n + ⌈log₂(2 + 1/(2ε))⌉** counting qubits. A few extra qubits beyond the precision you need make failure very unlikely.

In the table, more counting qubits give a sharper estimate: 0.375, then 0.344, then 0.332, homing in on 0.3333. Each extra qubit **doubles** the resolution, and the probability of landing within one step of the truth stays around 90%.

### The real cost: controlled powers

The output looks cheap: t qubits for t bits. The cost hides in step 2: counting qubit k needs U applied **2ᵏ times**. For t bits of precision, that's 1 + 2 + 4 + … + 2^(t−1) ≈ **2ᵗ uses of U**. So precision ε costs about 1/ε applications of U.

That's the **Heisenberg limit**, and it's the best possible: measuring a phase by repeated sampling, as in Lesson 5, would cost 1/ε² instead. The same 1/ε versus 1/ε² gap appeared in amplitude estimation (Lesson 25) and will appear in quantum sensing (Lesson 44). They are all, at heart, phase estimation.

For Shor's algorithm it's fine, because U^(2ᵏ) can be computed directly by repeated squaring, without applying U 2ᵏ times (Lesson 28). For a general U, like a molecule's time evolution, it's the dominant cost.

## Estimating an energy

Here's QPE doing something closer to real science. A molecule's energy levels are the eigenvalues of its **Hamiltonian** H (Lesson 29). The time-evolution operator U = e^(−iHt) has the same eigenstates, with eigenvalues e^(−iEt). So phase estimation on U reads out an **energy**.

Below, H is a small two-qubit Hamiltonian, ZZ + 0.5·XI + 0.5·IX (written as a sum of Pauli strings, Lesson 19). We load its lowest-energy state (the **ground state**) and estimate its energy with 7 counting qubits. To keep the example short, we build the controlled powers of U from exact matrices; on a real machine they'd be built from gates (Lesson 29).

```python
import numpy as np
from scipy.linalg import expm
from qiskit import QuantumCircuit
from qiskit.circuit.library import QFTGate, UnitaryGate
from qiskit.quantum_info import SparsePauliOp, Statevector

# A small "molecule": a two-qubit Hamiltonian. We want its lowest energy.
H = SparsePauliOp(["ZZ", "XI", "IX"], [1.0, 0.5, 0.5]).to_matrix()
energies, vectors = np.linalg.eigh(H)
ground_energy, ground_state = energies[0], vectors[:, 0]

t_time = 0.5                                       # U = exp(-i H t), so U|E> = e^(-i E t)|E>
U = expm(-1j * H * t_time)

t = 7                                              # counting qubits
qc = QuantumCircuit(t + 2)
qc.initialize(ground_state, [t, t + 1])            # load the eigenstate (in practice: approximately)
qc.h(range(t))
for k in range(t):
    power = UnitaryGate(np.linalg.matrix_power(U, 2 ** k)).control(1)
    qc.append(power, [k, t, t + 1])
qc.append(QFTGate(t).inverse(), range(t))

p = Statevector(qc).probabilities(range(t))
m = int(np.argmax(p))
phi = m / 2 ** t                                   # e^(2 pi i phi) = e^(-i E t)
E = -2 * np.pi * phi / t_time
if E < -np.pi / t_time:                            # phases wrap around: map back to the right range
    E += 2 * np.pi / t_time
print(f"exact ground energy : {ground_energy:.4f}")
print(f"phase estimation    : {E:.4f}   (reading {m:07b}, probability {p[m]:.3f})")
print(f"resolution of 7 bits: ±{np.pi / t_time / 2 ** t:.4f}")
```

```text
exact ground energy : -1.4142
phase estimation    : -1.3744   (reading 0001110, probability 0.564)
resolution of 7 bits: ±0.0491
```

The estimate −1.374 is within the 7-bit resolution of the true −√2 ≈ −1.414. More counting qubits would sharpen it. Two practical points:

- **Phases wrap around.** e^(2πiφ) only tells you φ modulo 1, so energies are only known modulo 2π/t. Choose the evolution time t small enough that all relevant energies fit in that window. (That's what the `if` line handles.)
- **You need (roughly) the eigenstate.** Here we loaded the exact ground state, which we could only do because the example is tiny. In real chemistry, you prepare an **approximate** ground state (from a classical method, or from VQE in Lesson 30). QPE then returns the true ground energy with probability equal to the overlap |⟨approx|ground⟩|², and otherwise some other energy level. Preparing states with good overlap is one of the main open problems in quantum chemistry algorithms (Lesson 45).

## Iterative phase estimation: one counting qubit

Full QPE needs t counting qubits and a QFT. On today's hardware, qubits and depth are precious, so there's a **single-qubit version** (Kitaev's original idea, refined by Dobšíček and colleagues in 2007):

1. Use **one** counting qubit to measure the **last** bit of φ first, using U^(2^(t−1)).
2. Reset it, and measure the next bit using U^(2^(t−2)), plus a phase correction based on the bits you've already found.
3. Repeat, working from the least significant bit to the most significant.

It gives the same answer with the same total number of uses of U, but needs only one extra qubit and **mid-circuit measurement with feed-forward** (Lesson 19's dynamic circuits). The inverse QFT is replaced by classical logic between measurements.

## Where phase estimation is used

| Algorithm | What U is | What φ gives |
|---|---|---|
| **Shor's algorithm** (Lesson 28) | Multiply by a mod N | s/r, from which the period r follows |
| **Quantum chemistry** (Lesson 45) | e^(−iHt), a molecule's time evolution | Its energy levels |
| **Amplitude estimation** (Lesson 25) | The Grover operator Q | θ, hence a probability |
| **Solving linear equations (HHL)** | e^(iAt) for a matrix A | A's eigenvalues, used to invert A |
| **Quantum sensing** (Lesson 44) | Free evolution in a field | The field strength (Ramsey = 1-bit QPE) |

## Try it

1. U = S = P(2π·¼). With 2 counting qubits and eigenstate |1⟩, what does QPE output?
2. With t = 4 counting qubits, what's the resolution of φ? How many uses of U in total?
3. Why does the target register stay in |u⟩ and never get entangled with the counting qubits?
4. φ = 0.3. With t = 3, which reading is most likely? (List the nearby fractions m/8.)
5. In the energy example, if the loaded state had only 70% overlap with the ground state, what would happen?
6. Why is QPE's 1/ε cost better than estimating the phase by repeated Ramsey measurements?

**Answers:**

1. φ = 0.01 in binary, so the counting register reads **01** with certainty.
2. 1/16 = **0.0625**. Uses of U: 1 + 2 + 4 + 8 = **15**.
3. |u⟩ is an eigenstate: each controlled power only multiplies it by a phase, which kicks back onto the control. The target is the same in every branch.
4. 0.3 × 8 = 2.4. The nearest fraction is 2/8 = 0.25, so **010** is most likely, with 011 (0.375) next.
5. 70% of the time QPE would return the ground energy; 30% of the time some other eigenvalue, from the other components of the state.
6. Repeated measurement gains precision only as 1/√N (shot noise), so ε needs ~1/ε² runs; QPE's doubling powers of U give ~1/ε.

## Cheat sheet

| Idea | Formula or fact |
|---|---|
| Problem | U\|u⟩ = e^(2πiφ)\|u⟩; find φ |
| Steps | H on counters → controlled U^(2ᵏ) → inverse QFT → measure |
| After kickback | ⊗ₖ (\|0⟩ + e^(2πi·2ᵏφ)\|1⟩)/√2 |
| Exact case | φ = m/2ᵗ → state is QFT\|m⟩ → read m with certainty |
| Inexact case | Closest t-bit value with probability ≥ 4/π² ≈ 0.405 |
| Precision | n bits with success 1 − ε: t = n + ⌈log₂(2 + 1/(2ε))⌉ |
| Cost | ~2ᵗ uses of U, i.e. ~1/ε: the Heisenberg limit |
| Energy estimation | U = e^(−iHt): φ gives energy E (modulo 2π/t) |
| Needs | An eigenstate, or a state with good overlap |
| Iterative QPE | One counting qubit, bits measured one at a time with feed-forward |
| Uses | Shor, chemistry, amplitude estimation, HHL, sensing |
