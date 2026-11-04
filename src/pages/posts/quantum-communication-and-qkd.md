---
layout: ../../layouts/Post.astro
title: "Quantum communication and QKD"
description: "Sharing secret keys protected by physics. The one-time pad and why key reuse is fatal, BB84 simulated with real qubits and an eavesdropper, where the 11% abort threshold comes from, error correction and privacy amplification, decoy states, distance limits (computed) and the record-breaking ways around them, satellites, entanglement-based and device-independent QKD, attacks on real hardware, and India's work in the field."
date: 2026-11-04
category: lesson
lesson: 41
---

Shor's algorithm (Lesson 28) will one day break the public-key cryptography that protects almost all internet traffic. And there's an uncomfortable twist: an adversary can record encrypted traffic **today** and decrypt it **later**, once a large quantum computer exists. This "harvest now, decrypt later" threat means that secrets which must stay secret for decades are already at risk.

There are two responses. One is new mathematics that quantum computers can't break, **post-quantum cryptography** (Lesson 43). The other uses quantum physics itself: **quantum key distribution (QKD)**, where two parties share a secret key, and the laws of quantum mechanics guarantee that any eavesdropping leaves detectable traces. This lesson is about QKD: how it works, why it's secure, what limits it in practice, and where it's being deployed.

## The perfect cipher, and its weak point

The **one-time pad** is the only encryption scheme that is provably unbreakable. To encrypt a message, combine it bit by bit (XOR) with a key that is truly random, as long as the message, and never reused. Without the key, every possible message is equally likely, so the ciphertext reveals nothing at all. Here it is in code, along with what goes wrong if the key is used twice:

```python
import random

def xor(a: bytes, b: bytes) -> bytes:
    return bytes(x ^ y for x, y in zip(a, b))

m1, m2 = b"MEET AT KOTA 9AM", b"BRING THE QUBITS"
key = random.Random(1984).randbytes(len(m1))         # random, as long as the message (real use: the secrets module)

c1 = xor(m1, key)
print("ciphertext:", c1.hex())
print("decrypted: ", xor(c1, key).decode())

# The fatal mistake: reusing the key for a second message
c2 = xor(m2, key)
leak = xor(c1, c2)                                    # the key cancels out: this is m1 XOR m2
print("c1 XOR c2 == m1 XOR m2:", leak == xor(m1, m2))
print("if Eve guesses m1, she gets m2:", xor(leak, m1).decode())
```

```text
ciphertext: e87455097ddedddc3b0cd03f025b088a
decrypted:  MEET AT KOTA 9AM
c1 XOR c2 == m1 XOR m2: True
if Eve guesses m1, she gets m2: BRING THE QUBITS
```

Used once, the pad is perfect. Used twice, the key cancels out: XORing the two ciphertexts gives the XOR of the two **messages**, and guessing either one reveals the other. (This exact mistake let Allied codebreakers read Soviet messages in the Venona project.)

So the one-time pad shifts the whole problem to **sharing keys**: you need as much fresh, secret, random key as you have message, delivered securely. Classically, that's impractical. QKD is a way to grow such keys between two distant places, with security guaranteed by physics.

## Three quantum rules that protect the key

1. **Measuring disturbs.** Measuring a qubit generally changes its state (Lesson 8).
2. **No-cloning.** An unknown quantum state can't be copied (Lesson 16), so Eve can't keep a copy and pass on the original.
3. **Wrong basis, random answer.** Measuring a qubit in a basis it wasn't prepared in gives a random result and destroys the original information.

Photons can carry bits in two bases:

| Basis | Bit 0 | Bit 1 |
|---|---|---|
| **+** (rectilinear, Z) | Horizontal polarisation, \|0⟩ | Vertical, \|1⟩ |
| **×** (diagonal, X) | 45°, \|+⟩ | 135°, \|−⟩ |

Measured in the same basis, the bit comes out right. Measured in the other basis, the result is a coin toss.

## BB84, step by step

Charles Bennett and Gilles Brassard proposed the first QKD protocol in 1984 (for this and related work they have shared the 2018 Wolf Prize in Physics, the 2023 Breakthrough Prize, and the ACM Turing Award announced in 2025, computing's highest honour).

1. **Alice sends.** For each photon she picks a random bit and a random basis, and prepares the matching state.
2. **Bob measures.** For each photon he picks a random basis of his own. Half the time it matches Alice's.
3. **Sifting.** Over an ordinary public channel (which must be **authenticated**, so Eve can't impersonate either side), they announce their **bases**, never their bits, and keep only the positions where the bases matched. About half the photons survive. This is the **sifted key**.
4. **Error estimation.** They reveal a random sample of the sifted bits and compare. The fraction that disagree is the **quantum bit error rate (QBER)**.
5. **Decision.** If the QBER is too high, they abort. Someone, or something, is interfering.
6. **Error correction and privacy amplification** turn the remaining bits into a shorter, identical and completely secret key.

## Simulating BB84 with real qubits

Let's run the protocol with actual qubits in Qiskit: Alice's preparation as X and H gates, Bob's basis choice as an H before measurement, and an eavesdropper who intercepts some photons, measures them in a random basis, and resends what she saw (the **intercept-resend attack**):

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

rng = np.random.default_rng(84)
sim = AerSimulator(seed_simulator=84)

def bb84(n_photons=2000, eve_fraction=0.0, batch=20):
    """Send n_photons qubits from Alice to Bob, batch at a time; Eve intercepts a fraction of them."""
    a_bit, a_basis, b_basis = (rng.integers(2, size=n_photons) for _ in range(3))   # basis 0 = Z (+), 1 = X (×)
    eve_on = rng.random(n_photons) < eve_fraction
    e_basis = rng.integers(2, size=n_photons)
    circuits = []
    for start in range(0, n_photons, batch):
        qc = QuantumCircuit(batch, 2 * batch)            # first half of the bits: Eve's notes; second half: Bob's
        for q in range(batch):
            i = start + q
            if a_bit[i]: qc.x(q)                         # Alice encodes her bit...
            if a_basis[i]: qc.h(q)                       # ...in her basis
            if eve_on[i]:                                # Eve measures in her own basis and resends what she saw
                if e_basis[i]: qc.h(q)
                qc.measure(q, q)
                if e_basis[i]: qc.h(q)
            if b_basis[i]: qc.h(q)                       # Bob measures in his basis
            qc.measure(q, batch + q)
        circuits.append(qc)
    results = sim.run(circuits, shots=1, memory=True).result()
    b_bit = np.concatenate([[int(c) for c in results.get_memory(k)[0][:batch][::-1]] for k in range(len(circuits))])
    keep = a_basis == b_basis                             # sifting: keep matching bases only
    return keep.sum(), np.mean(a_bit[keep] != b_bit[keep])

for f in [0.0, 0.5, 1.0]:
    kept, qber = bb84(eve_fraction=f)
    print(f"Eve intercepts {f:4.0%} of photons:  kept {kept} of 2000 after sifting,  error rate {qber:.3f}  (theory {f / 4:.3f})")
```

```text
Eve intercepts   0% of photons:  kept 975 of 2000 after sifting,  error rate 0.000  (theory 0.000)
Eve intercepts  50% of photons:  kept 996 of 2000 after sifting,  error rate 0.129  (theory 0.125)
Eve intercepts 100% of photons:  kept 1023 of 2000 after sifting,  error rate 0.235  (theory 0.250)
```

Without Eve, the sifted key has no errors at all. When Eve intercepts every photon, about a quarter of the sifted bits are wrong. Here's why: she picks the wrong basis half the time, and when she does, she resends a photon in the wrong basis, so Bob's result (in Alice's basis) is random and wrong half of those times. ½ × ½ = **25%**. Intercepting only half the photons gives about 12.5%. Eve can't learn anything without leaving this footprint.

## From raw bits to a secret key

Real links always have some errors, from imperfect optics and detector noise, even without Eve. Since Alice and Bob can't tell the source of the errors, they must assume the worst: **all** errors are Eve's doing. Two classical steps then finish the job:

- **Error correction.** Alice and Bob exchange parity information over the public channel to find and fix the differing bits (protocols such as Cascade or LDPC codes). This leaks information to Eve: at least h(Q) bits per key bit, where h is the binary entropy function and Q is the QBER.
- **Privacy amplification.** They compress the corrected key with a randomly chosen hash function, shrinking it by the maximum amount Eve could know, which for BB84 is also about h(Q) bits per key bit. After this, Eve's information about the final key is negligible. (Mathematically, a random linear map over bits, such as multiplying by a random binary matrix, does the job.)

That leaves a secret fraction of about **1 − 2h(Q)** of the sifted key, a result proved by Shor and Preskill in 2000:

```python
import numpy as np

def h(p):                                    # binary entropy: bits of uncertainty in a p-biased coin
    return 0.0 if p in (0, 1) else -p * np.log2(p) - (1 - p) * np.log2(1 - p)

print("error rate Q   secret bits per sifted bit, 1 - 2h(Q)")
for Q in [0.0, 0.01, 0.03, 0.05, 0.08, 0.10, 0.11, 0.12]:
    r = max(0.0, 1 - 2 * h(Q))
    print(f"   {Q:5.1%}        {r:.3f}")
```

```text
error rate Q   secret bits per sifted bit, 1 - 2h(Q)
    0.0%        1.000
    1.0%        0.838
    3.0%        0.611
    5.0%        0.427
    8.0%        0.196
   10.0%        0.062
   11.0%        0.000
   12.0%        0.000
```

With a 1% error rate, 84% of the sifted bits become secret key; at 5%, 43%; and at about **11%** the rate reaches zero. Above that, Eve could know as much as Bob, and no secret key can be extracted, so the protocol aborts. That's the origin of BB84's famous 11% threshold. Notice that a full intercept-resend attack (25%) is far above it.

## Real light sources and decoy states

Ideal BB84 uses single photons, but practical systems use very weak laser pulses, with an average of less than one photon per pulse. Occasionally a pulse contains two photons, and Eve could split off one and keep it (the **photon-number-splitting attack**), learning the bit without disturbing the other photon.

The fix, the **decoy-state method** (Hwang, 2003; Lo, Ma and Chen, 2005), randomly varies the pulse intensity. Alice later reveals which pulses were decoys, and by comparing detection rates at different intensities, she and Bob can estimate how many single-photon pulses Bob received, and so bound what Eve could have learned. Almost every commercial QKD system uses decoy states.

## The distance problem

Optical fibre absorbs light: about 0.2 dB per kilometre at the best telecom wavelength (1550 nm), so after 100 km only 1% of photons arrive. Unlike classical signals, quantum signals can't simply be amplified, because an amplifier would have to copy them (no-cloning). Meanwhile, detectors produce occasional false clicks (**dark counts**) at a fixed rate. As the distance grows, real photons become rarer while dark counts don't, until noise overwhelms the signal.

There's also a fundamental limit. In 2017, Pirandola, Laurenza, Ottaviani and Banchi proved that **no** QKD protocol over a lossy channel without repeaters can beat −log₂(1 − η) secret bits per pulse, where η is the channel's transmission (the **PLOB bound**, about 1.44η for small η). Let's compare that bound with a simple BB84 estimate for a 1 GHz system:

```python
import numpy as np

def h(p):
    return 0.0 if p <= 0 or p >= 1 else -p * np.log2(p) - (1 - p) * np.log2(1 - p)

pulse_rate = 1e9          # 1 GHz source
mu = 0.5                  # average photons per pulse (weak laser pulses, with decoy states)
detector_eff = 0.8        # superconducting nanowire detectors
dark = 1e-6               # chance of a false click per pulse
misalign = 0.01           # 1% errors from imperfect optics

print("distance   fibre transmission   PLOB limit (bits/s)   BB84 estimate (bits/s)")
for km in [10, 50, 100, 150, 200, 250, 300]:
    eta = 10 ** (-0.2 * km / 10)                               # 0.2 dB per km of fibre
    plob = -np.log2(1 - eta)                                   # best possible without repeaters
    clicks = 1 - np.exp(-eta * detector_eff * mu) + dark       # chance Bob's detector clicks
    errors = (misalign * (1 - np.exp(-eta * detector_eff * mu)) + dark / 2) / clicks
    rate = 0.5 * clicks * max(0.0, 1 - 2 * h(errors))          # sifting keeps half; 1 - 2h(Q) per bit
    print(f"{km:5d} km      {eta:10.2e}          {pulse_rate * plob:10.3g}           {pulse_rate * rate:10.3g}")
```

```text
distance   fibre transmission   PLOB limit (bits/s)   BB84 estimate (bits/s)
   10 km        6.31e-01            1.44e+09             9.35e+07
   50 km        1.00e-01            1.52e+08             1.64e+07
  100 km        1.00e-02            1.45e+07             1.67e+06
  150 km        1.00e-03            1.44e+06             1.65e+05
  200 km        1.00e-04            1.44e+05             1.43e+04
  250 km        1.00e-05            1.44e+04                 30.7
  300 km        1.00e-06            1.44e+03                    0
```

Both fall by a factor of 10 for every 50 km of fibre, but BB84 then collapses: at 250 km the key rate drops to about 30 bits per second, and at 300 km to zero, as dark counts take over. Practical fibre QKD therefore works well up to about 100 to 200 km.

Three ways past this:

- **Trusted nodes.** Chain shorter links through secure relay stations, each of which decrypts and re-encrypts the key. It works today (China's Beijing–Shanghai backbone, over 2,000 km, uses this) but each node must be trusted.
- **Twin-field QKD** (Lucamarini and colleagues, 2018). Alice and Bob each send light to a middle station, which interferes the two signals. The key rate scales like √η instead of η, beating the PLOB bound. In 2023, a Chinese team used it to distribute keys over **1,002 km** of fibre, at a very low rate.
- **Quantum repeaters.** Future devices that extend entanglement across long distances without measuring the qubits (Lesson 42).

## Satellites

In space there's almost nothing to absorb photons; most loss happens in the last few kilometres of atmosphere. China's **Micius** satellite, launched in 2016, distributed entangled photons to ground stations 1,200 km apart in 2017, and enabled a QKD-secured video call between Beijing and Vienna, 7,600 km apart, using the satellite as a trusted relay. Satellite QKD is now being developed by several space agencies, including in Europe and India.

## Entanglement-based and device-independent QKD

In 1991, Artur Ekert proposed **E91**: a source creates entangled photon pairs and sends one to Alice and one to Bob. Measuring in matching bases gives perfectly correlated bits. On some other measurements, they run a **Bell test** (Lesson 15). If the CHSH value is close to 2√2, the pairs are maximally entangled with each other, and monogamy of entanglement means they can't also be entangled with Eve. Security comes from the observed correlations themselves.

Taken to its limit, this idea gives **device-independent QKD**: security that doesn't even depend on trusting how the devices work inside, only on observing a Bell-inequality violation. It was demonstrated for the first time in 2022, in several experiments (with trapped ions and with neutral atoms), at short distances and low rates.

## Attacking real systems

QKD's security proofs assume ideal devices; real devices have imperfections an attacker can exploit. The most famous example is **detector blinding** (Lydersen and colleagues, 2010): by shining bright light into Bob's single-photon detectors, an attacker can make them behave like classical detectors and control which ones click, stealing the key without raising the error rate. Commercial systems were vulnerable until patched.

Defences include careful engineering and certification, and **measurement-device-independent (MDI) QKD** (Lo, Curty and Qi, 2012), in which the detectors sit at an untrusted middle station, so attacks on them gain nothing. Because of these practical concerns, some security agencies (including the US NSA and the UK's NCSC) currently recommend post-quantum cryptography over QKD for most uses, while others (notably in China and the EU) are investing heavily in QKD networks. The likely future is both: PQC everywhere, and QKD for links that need the highest, longest-lasting security.

## QKD in India

India's National Quantum Mission, approved in 2023, includes secure quantum communication as one of its main goals, including satellite-based links between ground stations about 2,000 km apart. Demonstrations so far include ISRO's free-space QKD over about 300 metres in Ahmedabad (2021), and a DRDO and IIT Delhi fibre link of about 100 km between Prayagraj and Vindhyachal (2022). Indian startups and C-DOT are building QKD products for government and banking networks. Lesson 47 looks at India's quantum ecosystem in more detail.

## QKD vs post-quantum cryptography

| | QKD | Post-quantum cryptography (Lesson 43) |
|---|---|---|
| Security based on | Laws of physics (plus authenticated channel) | Hard maths problems believed quantum-safe |
| Hardware | Special photon sources, detectors, fibre or free-space links | Ordinary computers and networks |
| Distance | ≈ 100–200 km per fibre link; longer with trusted nodes or satellites | Unlimited |
| What it provides | Key distribution only | Key exchange and digital signatures |
| Main risk | Implementation flaws in devices | New mathematical attacks |
| Status | Metro and backbone networks, satellites | NIST standards (2024), being deployed in browsers and operating systems |

## Try it

1. Why does reusing a one-time pad key reveal information, even though each ciphertext alone is perfectly secure?
2. Why must the public channel used for sifting be authenticated?
3. Eve intercepts 20% of photons with intercept-resend. What QBER do you expect? Is it above 11%?
4. Using 1 − 2h(Q), roughly what fraction of the sifted key survives at Q = 3%?
5. What does a decoy-state protocol protect against?
6. Fibre loses 0.2 dB/km. What fraction of photons survive 150 km?
7. How does twin-field QKD beat the PLOB bound, which says no repeaterless protocol can?

**Answers:**

1. XORing the two ciphertexts cancels the key and leaves m1 XOR m2. Natural-language messages have structure, so guessing or partially knowing one message reveals the other.
2. Otherwise Eve could pretend to be Bob to Alice and Alice to Bob (a man-in-the-middle), running separate QKD sessions with each and reading everything. QKD needs a small shared secret or authentication key to start, then grows much more key.
3. 20% × 25% = **5%**, below the 11% threshold. Alice and Bob would still distil a key, just a shorter one, because privacy amplification removes what Eve learned.
4. h(0.03) ≈ 0.194, so 1 − 0.389 ≈ **61%**.
5. The **photon-number-splitting attack**, where Eve keeps one photon from multi-photon pulses. Decoys let Alice and Bob estimate the single-photon contribution and bound Eve's knowledge.
6. 10^(−0.2 × 150 / 10) = 10⁻³ = **0.1%**.
7. It's not repeaterless in the usual sense: the middle station interferes signals from both ends, so each photon only crosses half the distance. The rate scales with √η instead of η. (It still respects the bound for each half of the channel.)

## Cheat sheet

| Idea | Formula or fact |
|---|---|
| Harvest now, decrypt later | Recorded traffic can be broken once quantum computers arrive |
| One-time pad | Ciphertext = message XOR key; perfect if the key is random, long and used once |
| BB84 (1984) | Random bits in random bases (Z or X); keep matching bases (sifting) |
| Intercept-resend | QBER = 25% × fraction intercepted |
| Secret fraction | 1 − 2h(Q) (Shor–Preskill); zero at Q ≈ 11% |
| Post-processing | Error correction, then privacy amplification (random hashing) |
| Authenticated channel | Needed to prevent man-in-the-middle attacks |
| Decoy states | Varying pulse intensity defeats photon-number splitting |
| Fibre loss | ≈ 0.2 dB/km; 100 km → 1%, 150 km → 0.1% |
| PLOB bound | ≤ −log₂(1 − η) ≈ 1.44η bits per pulse without repeaters |
| Twin-field QKD | Rate ∝ √η; 1,002 km of fibre (2023) |
| Micius (2016–17) | Entanglement over 1,200 km; Beijing–Vienna call over 7,600 km |
| E91 (1991) | Entangled pairs plus a Bell test |
| Device-independent QKD | Security from a Bell violation alone; first shown in 2022 |
| Attacks on devices | Detector blinding (2010); defences include MDI-QKD (2012) |
| India | NQM goals; ISRO 300 m (2021); DRDO–IIT Delhi ≈ 100 km fibre (2022) |
