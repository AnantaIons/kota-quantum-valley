---
layout: ../../layouts/Post.astro
title: "Bell inequalities and the CHSH game"
description: "Einstein's objection, Bell's answer, and the experiment that settled it: the CHSH game, proof that no classical strategy wins more than 75%, the quantum strategy that wins 85.4%, the CHSH number 2√2, the loophole-free tests behind the 2022 Nobel Prize, and what Bell tests are used for today."
date: 2026-11-04
category: lesson
lesson: 15

---

Lesson 14 showed that a Bell pair is correlated in every basis, and argued that a "shared hidden plan" (like two matching coins in envelopes) couldn't do that. But "couldn't" was a hunch. Maybe a cleverer hidden plan could.

In 1964 the physicist John Bell found a way to turn that hunch into a **number** that any hidden-plan theory must obey, and that quantum mechanics breaks. Experiments since then have checked it, more and more carefully, and quantum mechanics wins every time. This lesson presents Bell's idea in its cleanest modern form, a cooperative game called **CHSH**, and computes both sides exactly.

## The argument Bell answered

In 1935, Einstein, Podolsky and Rosen (EPR) argued like this. Take an entangled pair and separate the halves. Measure Alice's in the 0/1 basis, and you can predict Bob's 0/1 result with certainty. Measure Alice's in the +/− basis, and you can predict Bob's +/− result with certainty. Alice's choice can't instantly affect Bob's distant particle. So, they said, Bob's particle must have **already had** definite answers to both questions all along, and quantum mechanics, which says it doesn't, is incomplete.

The EPR position is called **local realism**:

- **Realism:** measurement results are decided by properties the particles carry (often called **hidden variables**), like the faces of coins in envelopes.
- **Locality:** what happens at Alice's lab can't affect Bob's results instantly.

For 30 years this looked like philosophy: both views predicted the same results for the experiments people had done. Bell found an experiment where they disagree.

## The CHSH game

Here's the game, named after Clauser, Horne, Shimony and Holt, who refined Bell's idea in 1969.

- A referee gives Alice a random bit **x** and Bob a random bit **y**.
- Alice must reply with a bit **a**, and Bob with a bit **b**. They can't communicate once the game starts (they're in separate rooms, or kilometres apart).
- They **win** if a ⊕ b = x ∧ y. In words: their answers must be **the same**, unless both questions were 1, in which case their answers must be **different**.

| Questions (x, y) | Win if |
|---|---|
| (0, 0) | a = b |
| (0, 1) | a = b |
| (1, 0) | a = b |
| (1, 1) | a ≠ b |

Before the game, Alice and Bob can agree on any strategy they like, and share anything they like: random numbers, a book of instructions, matching coins in envelopes. This shared material plays the role of hidden variables.

## The classical limit: 75%

**Simple strategy:** both always answer 0. Then a = b every round, so they win the first three cases and lose (1, 1). With random questions, each case is equally likely, so they win **75%** of the time.

Can they do better? Any classical strategy, however clever, comes down to this: given the shared material, Alice's answer depends only on x (say a₀ for x = 0, a₁ for x = 1) and Bob's only on y (b₀, b₁). Shared randomness just picks one such plan at random, and an average can't beat the best plan in it. So we only need to check deterministic plans, and there are just 2⁴ = 16 of them.

Here's a neat proof that none wins all four rounds. Winning all four would need:

```text
a₀ ⊕ b₀ = 0
a₀ ⊕ b₁ = 0
a₁ ⊕ b₀ = 0
a₁ ⊕ b₁ = 1
```

XOR all four left sides together: each of a₀, a₁, b₀, b₁ appears exactly twice, so they cancel to 0. But the right sides XOR to 1. Contradiction: **at most 3 of the 4 can hold.** So no classical strategy beats 75%. Let's check by brute force anyway:

```python
import itertools

# A deterministic classical strategy: Alice answers a0 or a1, Bob b0 or b1.
results = {}
for a0, a1, b0, b1 in itertools.product([0, 1], repeat=4):
    wins = sum(([a0, a1][x] ^ [b0, b1][y]) == (x & y) for x in (0, 1) for y in (0, 1))
    results[(a0, a1, b0, b1)] = wins / 4

print("best classical win rate:", max(results.values()))
print("strategies that reach it:", sum(v == 0.75 for v in results.values()), "of", len(results))
```

```text
best classical win rate: 0.75
strategies that reach it: 8 of 16
```

That 75% is a **Bell inequality**: every local hidden-variable theory must obey it.

## The quantum strategy: 85.4%

Now give Alice and Bob a shared **Bell pair** Φ⁺ instead of matching coins. The strategy: each measures their qubit along an angle that depends on their question, and answers with the result.

| Player | Question 0 | Question 1 |
|---|---|---|
| Alice | measure along 0° (Z) | measure along 90° (X) |
| Bob | measure along +45° | measure along −45° |

The angles are on the Bloch sphere, in the x–z plane. Here's why it works. For Φ⁺, if Alice measures along angle α and Bob along β, the probability that they get **the same** answer is

> P(same) = cos²((α − β)/2)

(When α = β this is 1: perfect correlation, Lesson 14.) Now check the four cases:

| (x, y) | Angle difference | Need | Win probability |
|---|---|---|---|
| (0, 0) | 0° − 45° = −45° | same | cos²(22.5°) ≈ 0.854 |
| (0, 1) | 0° + 45° = 45° | same | cos²(22.5°) ≈ 0.854 |
| (1, 0) | 90° − 45° = 45° | same | cos²(22.5°) ≈ 0.854 |
| (1, 1) | 90° + 45° = 135° | different | 1 − cos²(67.5°) = sin²(67.5°) ≈ 0.854 |

Every case wins with probability cos²(π/8) ≈ **85.4%**, beating the classical 75%. The trick is that Bob's angles sit halfway between Alice's, so he's "nearly aligned" with her in the three must-agree cases and "nearly opposite" in the must-differ case.

To measure along angle θ in a circuit, rotate by RY(−θ) first and then measure normally (Lesson 8's rotate-then-measure idea):

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

alice_angle = {0: 0, 1: np.pi / 2}               # Z or X
bob_angle   = {0: np.pi / 4, 1: -np.pi / 4}      # halfway between them

def round_win_probability(x, y):
    qc = QuantumCircuit(2)
    qc.h(0)
    qc.cx(0, 1)                                  # shared Bell pair
    qc.ry(-alice_angle[x], 0)                    # measure along Alice's angle
    qc.ry(-bob_angle[y], 1)                      # measure along Bob's angle
    p = Statevector(qc).probabilities_dict()
    same = p.get("00", 0) + p.get("11", 0)       # a = b
    return same if (x & y) == 0 else 1 - same    # win if a XOR b = x AND y

wins = {(x, y): round_win_probability(x, y) for x in (0, 1) for y in (0, 1)}
for k, v in wins.items():
    print(k, round(float(v), 4))
print("quantum win rate:", round(float(np.mean(list(wins.values()))), 4), " cos^2(pi/8) =", round(np.cos(np.pi / 8) ** 2, 4))

E = {k: 2 * v - 1 if k != (1, 1) else 1 - 2 * v for k, v in wins.items()}   # correlations <AB>
S = E[(0, 0)] + E[(0, 1)] + E[(1, 0)] - E[(1, 1)]
print("CHSH value S =", round(float(S), 4), " (classical limit 2, 2*sqrt2 =", round(2 * np.sqrt(2), 4), ")")
```

```text
(0, 0) 0.8536
(0, 1) 0.8536
(1, 0) 0.8536
(1, 1) 0.8536
quantum win rate: 0.8536  cos^2(pi/8) = 0.8536
CHSH value S = 2.8284  (classical limit 2, 2*sqrt2 = 2.8284 )
```

### Playing it for real

Those are exact probabilities. A real experiment plays many rounds with random questions and counts wins, so there's shot noise. Here are 4,000 simulated rounds:

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler

alice_angle = {0: 0, 1: np.pi / 2}
bob_angle   = {0: np.pi / 4, 1: -np.pi / 4}
rng = np.random.default_rng(15)
rounds = rng.integers(0, 2, size=(4000, 2))       # the referee's random questions (x, y)

circuits = {}
for x in (0, 1):
    for y in (0, 1):
        qc = QuantumCircuit(2)
        qc.h(0); qc.cx(0, 1)
        qc.ry(-alice_angle[x], 0); qc.ry(-bob_angle[y], 1)
        qc.measure_all()
        circuits[(x, y)] = qc

sampler = StatevectorSampler(seed=rng)
wins = 0
for (x, y), qc in circuits.items():
    n = int(np.sum((rounds[:, 0] == x) & (rounds[:, 1] == y)))     # how often this pair came up
    counts = sampler.run([qc], shots=n).result()[0].data.meas.get_counts()
    for bits, c in counts.items():
        a, b = int(bits[1]), int(bits[0])                          # qubit 0 = Alice, qubit 1 = Bob
        wins += c * ((a ^ b) == (x & y))
print("won", wins, "of 4000 rounds:", round(wins / 4000, 3))
```

```text
won 3428 of 4000 rounds: 0.857
```

85.7%, within shot noise of 85.4% (the uncertainty with 4,000 rounds is about ±0.6%, Lesson 5). A classical team winning 3,428 of 4,000 rounds would be like a fair coin landing heads 3,428 times in 4,000 tosses: it doesn't happen.

## The CHSH number S

Physicists usually report the result as one number. Write each of Alice's and Bob's answers as ±1 instead of 0/1, and let E(x, y) be the average of their product (their correlation, Lesson 14). Then define

> **S = E(0,0) + E(0,1) + E(1,0) − E(1,1)**

The win rate and S are related by win rate = ½ + S/8, so:

| Theory | Maximum S | Maximum win rate |
|---|---|---|
| Local hidden variables (classical) | **2** | 75% |
| Quantum mechanics | **2√2 ≈ 2.83** | cos²(π/8) ≈ 85.4% |
| Any theory that forbids faster-than-light signalling | 4 | 100% |

S ≤ 2 is the **CHSH inequality**. Quantum mechanics reaches 2√2, which is called **Tsirelson's bound**: no quantum strategy, with any amount of entanglement and any measurements, can do better. Interestingly, the no-signalling principle alone would allow S = 4. Why nature stops at 2√2 is still an active research question.

## The experiments

| Year | Who | What |
|---|---|---|
| 1972 | Freedman and Clauser (Berkeley) | First Bell test, with photon pairs from calcium atoms: violation |
| 1982 | Alain Aspect's team (Paris) | Switched the measurement settings while the photons were in flight, closing the gap that the detectors might "coordinate" |
| 1998 | Anton Zeilinger's team (Innsbruck) | Fully random, fast switching of settings, with stations 400 m apart |
| 2015 | Delft, Vienna and NIST (Boulder) | First **loophole-free** tests: detectors efficient enough and stations far enough apart that no known classical explanation remains |
| 2022 | Nobel Prize in Physics | Awarded to Aspect, Clauser and Zeilinger "for experiments with entangled photons, establishing the violation of Bell inequalities" |

The Delft experiment used electron spins in diamonds 1.3 km apart. Each measurement finished faster than light could travel between the labs, so no signal could have coordinated them.

## What it means, and what it doesn't

Bell tests rule out **local realism**: you can't explain the results with particles carrying predetermined answers and no faster-than-light influence. Something in our everyday picture must go. Most physicists conclude that measurement results genuinely aren't decided until measurement. (A few keep hidden variables and give up locality, as in Bohmian mechanics; experiments can't tell these interpretations apart, because they make the same predictions.)

What Bell tests **don't** show: that messages can travel faster than light. Each player's own results stay 50/50 (Lesson 14's no-signalling). The violation only appears when the results are brought together and compared.

## Bell tests at work

The CHSH game isn't just a philosophy experiment. A high S is a **certificate** that the devices really share entanglement, checked from the input–output statistics alone, without trusting how the devices were built.

- **Device-independent QKD:** if Alice and Bob see S close to 2√2, monogamy (Lesson 14) guarantees no eavesdropper can be entangled with their pairs, even if an enemy built their equipment. This is the logic of the E91 protocol (Lesson 41).
- **Certified randomness:** a Bell violation proves the outputs couldn't have been predetermined, so they're genuinely random. Several national labs run public randomness beacons on this principle.
- **Benchmarking:** measuring S is a quick check of how well a quantum computer or network creates entanglement. Noise pulls S down towards 2.

## Try it

1. In the CHSH game, what's the win rate of "Alice always answers 0, Bob always answers 1"?
2. Using P(same) = cos²((α − β)/2), what if Bob measures along the same angles as Alice (0° and 90°)? What's the average win rate?
3. Convert S = 2√2 to a win rate with win = ½ + S/8, and S = 2 too.
4. Noise reduces every correlation by a factor v, so S = v·2√2. Below what v can a CHSH test no longer show anything quantum?
5. Why do experimenters choose the measurement settings randomly and at the last moment?
6. Why can't Alice use a Bell test to send Bob a message?

**Answers:**

1. a ≠ b always: they win only (1, 1), so **25%**.
2. Cases (0,0) and (1,1): angle difference 0 → for (0,0) they agree (win, 1), for (1,1) they agree but need to differ (lose, 0). Cases (0,1) and (1,0): difference 90° → P(same) = ½. Average (1 + ½ + ½ + 0)/4 = **50%**: worse than classical.
3. ½ + 2√2/8 = ½ + √2/4 ≈ **0.854**. ½ + 2/8 = **0.75**.
4. v·2√2 > 2 needs v > 1/√2 ≈ **0.707**.
5. So that neither the source nor the other station could know the settings in advance, which would let a hidden-variable model "cheat".
6. Each of them sees 50/50 results whatever the other does; the correlations show up only when they compare data over an ordinary channel.

## Cheat sheet

| Idea | Formula or fact |
|---|---|
| EPR (1935) | Argued quantum mechanics is incomplete; hidden answers must exist |
| Local realism | Predetermined answers + no faster-than-light influence |
| Bell (1964) | Local realism makes a testable prediction that quantum mechanics breaks |
| CHSH game | Win if a ⊕ b = x ∧ y |
| Classical limit | 75% win rate; S ≤ 2 |
| Proof idea | XOR of the four winning conditions gives 0 = 1 |
| Quantum strategy | Bell pair; Alice at 0°/90°, Bob at ±45° |
| P(same) for Φ⁺ | cos²((α − β)/2) |
| Quantum win rate | cos²(π/8) ≈ 85.4% |
| CHSH value | S = E00 + E01 + E10 − E11; quantum max 2√2 (Tsirelson) |
| Win rate from S | ½ + S/8 |
| Loophole-free tests | 2015 (Delft, Vienna, NIST) |
| Nobel Prize 2022 | Aspect, Clauser, Zeilinger |
| Uses | Device-independent QKD, certified randomness, benchmarking |
| Measure along angle θ | RY(−θ), then measure in Z |
