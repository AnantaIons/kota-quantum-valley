---
layout: ../../layouts/Post.astro
title: "Post-quantum cryptography"
description: "The other answer to Shor's algorithm: new public-key cryptography that runs on ordinary computers but resists quantum attacks. What quantum computers break and what they don't, Mosca's inequality for deciding when to act, learning with errors (a working toy encryption scheme and why the errors matter), hash-based signatures (a Lamport signature you can run), the 2024 NIST standards and their sizes, lessons from broken candidates, and how the migration is happening, including on embedded devices."
date: 2026-11-04
category: lesson
lesson: 43
---

Lesson 28 showed that Shor's algorithm will break RSA and elliptic-curve cryptography, the public-key systems that secure websites, messaging apps, software updates, bank transfers and smart cards. Lesson 41 showed one response, QKD, which uses physics but needs special hardware and is limited by distance.

This lesson is about the response that will protect almost everyone: **post-quantum cryptography (PQC)**. It's ordinary software, running on ordinary computers and phones, based on mathematical problems that no known quantum (or classical) algorithm can solve efficiently. In 2024, the US National Institute of Standards and Technology (NIST) published the first PQC standards, and the largest cryptographic migration in history is now under way. You'll see what's broken and what isn't, build toy versions of the two main ideas, and learn how the transition is being managed.

## What quantum computers break, and what they don't

| Cryptography | Used for | Quantum attack | Status |
|---|---|---|---|
| RSA | Key exchange, signatures, certificates | Shor (factoring) | **Broken** by a large quantum computer |
| Elliptic curves (ECDH, ECDSA, Ed25519) | Key exchange, signatures, cryptocurrencies | Shor (discrete logarithm) | **Broken**, and needs fewer qubits than RSA |
| Diffie–Hellman (finite field) | Key exchange | Shor | **Broken** |
| AES and other symmetric ciphers | Bulk encryption | Grover (quadratic speed-up) | Weakened: use 256-bit keys for long-term security |
| SHA-2, SHA-3 hash functions | Integrity, signatures, passwords | Grover | Fine with 256-bit outputs |

Two lessons from this table. First, the danger is concentrated in **public-key** cryptography, which is exactly what must be replaced. Second, symmetric cryptography survives: Grover only gives a square-root speed-up (Lesson 24), and it parallelises badly, so AES-256 remains secure, and many experts consider AES-128 adequate in practice too.

## When should you worry? Mosca's inequality

Nobody knows when a **cryptographically relevant quantum computer** (CRQC) will exist. Lesson 35 showed estimates of under a million physical qubits for RSA-2048, so it's an engineering question, not a question of principle. Michele Mosca proposed a simple way to decide whether to act now. Let:

- **x** = how many years your data must stay secret (its "shelf life"),
- **y** = how many years it will take to migrate your systems to PQC,
- **z** = how many years until a CRQC exists.

If **x + y > z**, you're already too late for some of your data: an adversary can record it now and decrypt it before it stops mattering.

```python
def mosca(shelf_life, migration_time, years_to_quantum_threat):
    """Mosca's inequality: if x + y > z, data encrypted today will still be secret when it can be broken."""
    x, y, z = shelf_life, migration_time, years_to_quantum_threat
    return "AT RISK" if x + y > z else "ok"

cases = [("chat messages", 1, 3), ("bank records", 10, 5), ("medical records", 30, 5),
         ("smart meter (device lifetime)", 20, 8), ("national security secrets", 50, 10)]
print("data                         must stay secret   migration   threat in 10 yrs   threat in 15 yrs")
for name, x, y in cases:
    print(f"{name:29s} {x:6d} years      {y:3d} years       {mosca(x, y, 10):8s}           {mosca(x, y, 15)}")
```

```text
data                         must stay secret   migration   threat in 10 yrs   threat in 15 yrs
chat messages                      1 years        3 years       ok                 ok
bank records                      10 years        5 years       AT RISK            ok
medical records                   30 years        5 years       AT RISK            AT RISK
smart meter (device lifetime)     20 years        8 years       AT RISK            AT RISK
national security secrets         50 years       10 years       AT RISK            AT RISK
```

Even with an optimistic 15-year horizon, anything long-lived is at risk. Devices are an important case: a smart meter, car, satellite or industrial controller installed today may operate for 15 to 25 years, and its keys and firmware-signing scheme must stay trustworthy for its whole life. Replacing cryptography in the field is far harder than in a web browser. That's why governments now set firm deadlines: NIST plans to deprecate RSA and elliptic-curve cryptography by 2030 and disallow them by 2035, and the US NSA's CNSA 2.0 requires quantum-resistant algorithms in national security systems in the same time frame.

## The main families of PQC

Every PQC scheme rests on a problem believed hard even for quantum computers. The main families:

| Family | Hard problem | Examples | Notes |
|---|---|---|---|
| **Lattice-based** | Learning with errors (LWE) and related problems on lattices | ML-KEM (Kyber), ML-DSA (Dilithium), FN-DSA (Falcon) | Fast, moderate sizes; the main workhorse |
| **Hash-based** | Security of a hash function only | SLH-DSA (SPHINCS+), XMSS, LMS | Very conservative; signatures only; larger or stateful |
| **Code-based** | Decoding random error-correcting codes | Classic McEliece, HQC | Long history (1978); large keys (McEliece) |
| **Multivariate** | Solving systems of quadratic equations | (Rainbow, broken in 2022) | Small signatures, but a troubled record |
| **Isogeny-based** | Maps between elliptic curves | (SIKE, broken in 2022) | Tiny keys, but the leading candidate fell |

## Learning with errors

The most important family is built on a beautifully simple problem. Take a secret vector **s**. Publish many random vectors **a**, each with the value **a·s** (mod q), but add a **small random error** e to each one:

> b = a·s + e  (mod q)

Without the errors, anyone could recover **s** with school-level linear algebra (Gaussian elimination). With the errors, finding **s** becomes the **learning with errors (LWE)** problem, introduced by Oded Regev in 2005 (he won the Gödel Prize for it in 2018). Regev showed that solving LWE is at least as hard as some worst-case problems on lattices, which have resisted decades of attempts by both classical and quantum algorithms.

Here's a working toy version of Regev's encryption scheme. The public key is (A, b); to encrypt a bit, add up a random subset of the public samples and shift by q/2 for a 1. The person who knows **s** can subtract it out, leaving only a small error plus 0 or q/2:

```python
import numpy as np
rng = np.random.default_rng(43)

n, m, q = 16, 40, 257                     # secret length, number of samples, modulus (toy sizes)
A = rng.integers(0, q, size=(m, n))       # public random matrix
s = rng.integers(0, q, size=n)            # the secret key
e = rng.integers(-2, 3, size=m)           # small random errors: -2..2
b = (A @ s + e) % q                       # public key: (A, b). Without e, this would be easy to solve.

def encrypt(bit):
    r = rng.integers(0, 2, size=m)        # pick a random subset of the public samples
    return (r @ A) % q, (r @ b + bit * (q // 2)) % q

def decrypt(u, v):
    x = (v - u @ s) % q                   # = (r·e + bit·q/2) mod q: near 0 means 0, near q/2 means 1
    return int(q // 4 < x < 3 * q // 4)

message = [1, 0, 1, 1, 0, 0, 1, 0]
print("sent:     ", message)
print("decrypted:", [decrypt(*encrypt(bit)) for bit in message])

def solve_mod(M, y, p):
    """Solve M·x = y (mod p) by Gaussian elimination, using the first n equations."""
    M, y = M[:n].copy() % p, y[:n].copy() % p
    for col in range(n):
        piv = next(r for r in range(col, n) if M[r, col] % p)
        M[[col, piv]], y[[col, piv]] = M[[piv, col]], y[[piv, col]]
        inv = pow(int(M[col, col]), -1, p)
        M[col], y[col] = (M[col] * inv) % p, (y[col] * inv) % p
        for r in range(n):
            if r != col and M[r, col]:
                f = M[r, col]
                M[r], y[r] = (M[r] - f * M[col]) % p, (y[r] - f * y[col]) % p
    return y

print("attack with NO errors (b = A·s):  recovered the secret?", np.array_equal(solve_mod(A, (A @ s) % q, q), s))
print("attack on the real key (with errors): recovered the secret?", np.array_equal(solve_mod(A, b, q), s))
```

```text
sent:      [1, 0, 1, 1, 0, 0, 1, 0]
decrypted: [1, 0, 1, 1, 0, 0, 1, 0]
attack with NO errors (b = A·s):  recovered the secret? True
attack on the real key (with errors): recovered the secret? False
```

The message decrypts correctly, because the accumulated error is much smaller than q/4. The last two lines show why the errors are the whole point: with exact equations, Gaussian elimination recovers the secret instantly; with the small errors added, the same attack produces nonsense. (These toy sizes are far too small to be secure; a lattice-reduction attack would break them easily.)

The real standard, **ML-KEM** (formerly Kyber), uses the same idea with structure for efficiency: vectors of **polynomials** with 256 coefficients modulo q = 3329 ("module LWE"), which makes keys smaller and operations fast, using a number-theoretic transform (a cousin of the FFT). It's a **key encapsulation mechanism** (KEM): rather than encrypting messages directly, it securely establishes a shared secret key, which then drives AES.

## Hash-based signatures

The most conservative signatures rely only on a hash function being hard to invert, the one assumption all of cryptography already depends on. The idea goes back to Leslie Lamport in 1979. For each of the 256 bits of a message's hash, keep two random secrets; publish their hashes as the public key. To sign, reveal one secret from each pair, chosen by the hash bits. Anyone can check the revealed secrets against the public hashes:

```python
import hashlib, random

H = lambda data: hashlib.sha256(data).digest()
rnd = random.Random(1979)                 # demo only; real keys come from the secrets module

# Key generation: 256 pairs of random secrets; the public key is their hashes
secret = [[rnd.randbytes(32) for _ in range(2)] for _ in range(256)]
public = [[H(x) for x in pair] for pair in secret]

def bits(message):
    d = int.from_bytes(H(message), "big")
    return [(d >> (255 - i)) & 1 for i in range(256)]

def sign(message):                        # reveal one secret from each pair, chosen by the message's hash bits
    return [secret[i][b] for i, b in enumerate(bits(message))]

def verify(message, signature):
    return all(H(sig) == public[i][b] for i, (b, sig) in enumerate(zip(bits(message), signature)))

msg = b"Firmware v2.1, build 7f3a"
sig = sign(msg)
print("signature size:", sum(len(x) for x in sig), "bytes;  public key size:", 256 * 2 * 32, "bytes")
print("valid signature verifies:      ", verify(msg, sig))
print("tampered message is rejected:  ", not verify(b"Firmware v2.1, build 7f3b", sig))
```

```text
signature size: 8192 bytes;  public key size: 16384 bytes
valid signature verifies:       True
tampered message is rejected:   True
```

It works, and its security rests only on SHA-256. But notice two problems: the keys and signatures are big (16 KB and 8 KB), and each key can sign **only one message**, because each signature reveals half the secrets. Signing two different messages would reveal enough secrets to forge others.

Modern schemes fix this. **XMSS** and **LMS** combine many one-time keys under a single public key using a Merkle tree, but must carefully track which keys have been used (they're **stateful**: reusing a key is catastrophic). **SLH-DSA** (SPHINCS+) builds a much larger structure that removes the need for state, at the cost of signatures of about 8 to 50 KB. Because their security is so well understood, stateful hash-based signatures (LMS and XMSS) are already approved for **firmware signing**, where signatures are made rarely, in controlled environments, and verified on many devices.

## The NIST standards

NIST ran an open, worldwide competition. It received 82 submissions in 2017, cryptographers attacked them for years, and the survivors were standardised:

| Standard (2024) | Based on | Purpose | Public key | Ciphertext or signature |
|---|---|---|---|---|
| FIPS 203: **ML-KEM-768** | Module lattices (Kyber) | Key establishment | 1,184 bytes | 1,088 bytes |
| FIPS 204: **ML-DSA-65** | Module lattices (Dilithium) | Signatures | 1,952 bytes | 3,309 bytes |
| FIPS 205: **SLH-DSA-128s** | Hash functions (SPHINCS+) | Signatures | 32 bytes | 7,856 bytes |
| FN-DSA-512 (standard in progress) | NTRU lattices (Falcon) | Compact signatures | 897 bytes | 666 bytes |
| For comparison: X25519 | Elliptic curve | Key exchange | 32 bytes | 32 bytes |
| For comparison: RSA-2048 | Factoring | Key exchange or signatures | 256 bytes | 256 bytes |

In March 2025, NIST also selected **HQC**, a code-based KEM, as a backup to ML-KEM, so that a mathematical breakthrough against lattices wouldn't leave the world without a standard.

The trade-off is clear from the table: PQC is fast (ML-KEM is often faster than elliptic curves), but keys and signatures are roughly **10 to 100 times larger**. That matters for network packets, certificates, smart cards and small embedded devices.

## Lessons from broken candidates

Two schemes that reached late stages were broken in 2022, and they're instructive:

- **SIKE** (isogeny-based), a finalist with remarkably small keys, was broken by Wouter Castryck and Thomas Decru using a classical algorithm that recovered keys in about an hour on a single laptop core.
- **Rainbow** (multivariate), a signature finalist, was broken by Ward Beullens with an attack that took about a weekend on a laptop.

Neither attack used a quantum computer. The lesson: new cryptographic assumptions need many years of public scrutiny, and that's why the standards favour lattices (studied since the 1990s) and hash functions, and why **hybrid** schemes are used during the transition.

## How the migration is happening

**Hybrid key exchange.** Most early deployments combine a classical algorithm and a PQC algorithm, so the connection is secure as long as **either** one holds. Chrome, Firefox and Cloudflare support the hybrid X25519 + ML-KEM-768 key exchange in TLS, and by 2025 a large share of web traffic through Cloudflare was protected this way. Signal added post-quantum key agreement (PQXDH) in 2023, Apple's iMessage moved to its PQ3 protocol in 2024, and OpenSSH made a hybrid ML-KEM key exchange its default in 2025.

**Signatures come next.** Key exchange was urgent because of harvest-now-decrypt-later. Signatures only need to be quantum-safe before a CRQC exists, but certificate infrastructure is slow to change, and larger signatures strain protocols, so the work is happening now.

**Crypto agility.** Organisations are taking **inventories** of where they use public-key cryptography, and redesigning systems so algorithms can be swapped without rebuilding everything.

## PQC on embedded devices

For engineers who work with microcontrollers, PQC brings specific challenges and opportunities:

- **Performance is fine.** On an Arm Cortex-M4, optimised ML-KEM-768 runs each operation in roughly a million cycles or less, a few milliseconds at typical clock speeds; open-source projects such as **pqm4** benchmark many schemes on exactly this class of chip.
- **Memory is the constraint.** Keys, signatures and working buffers of several kilobytes are significant on devices with tens of kilobytes of RAM, and on low-bandwidth links (metering networks, LoRa, NB-IoT) a 3 KB signature can take many packets.
- **Secure boot and firmware updates** are the first place to act, because a device that can't verify a future update can't be fixed. LMS or XMSS (stateful hash-based) signatures are recommended for firmware signing, and are small to verify.
- **Side channels** matter: timing and power analysis attacks on PQC implementations are an active research area, so constant-time, hardened libraries should be used rather than hand-written code.
- **Long field lifetimes** make Mosca's inequality bite hardest: devices shipped today should be crypto-agile, able to receive new algorithms over the air.

## QKD and PQC together

PQC protects almost everything, cheaply, on existing hardware, but relies on mathematical assumptions. QKD (Lesson 41) relies on physics, but needs dedicated hardware and is limited in distance. Most security agencies recommend PQC as the main defence, with QKD considered for specialised high-security links. Neither is waiting for quantum computers to arrive: the switch is happening now.

## Try it

1. Which of these does Shor's algorithm break: AES-256, RSA-4096, ECDSA, SHA-256?
2. A company's design files must stay secret for 12 years, and migrating will take 4 years. If a CRQC arrives in 14 years, does Mosca's inequality say they're at risk?
3. In the LWE toy scheme, why would the scheme be useless without the errors e?
4. Why does decryption still work even though errors were added?
5. Why can a Lamport key sign only one message?
6. Roughly how much larger is an ML-DSA-65 signature than an ECDSA P-256 signature (64 bytes)?
7. What is a hybrid key exchange, and why is it used during the transition?

**Answers:**

1. **RSA-4096** and **ECDSA**. AES-256 and SHA-256 are only weakened by Grover, and remain secure at these sizes.
2. x + y = 12 + 4 = 16 > 14, so **yes**, at risk.
3. Without errors, b = A·s is a system of linear equations, and Gaussian elimination recovers the secret directly, as the code showed.
4. The decryptor computes v − u·s = r·e + bit·(q/2). Since r·e is a sum of small errors, it stays far from q/4, so rounding to the nearest of 0 or q/2 gives the right bit.
5. Each signature reveals one secret from each of the 256 pairs. A second signature on a different message reveals other secrets, and the attacker could then mix them to sign new messages.
6. 3,309 / 64 ≈ **50 times** larger.
7. It combines a classical algorithm (such as X25519) and a PQC algorithm (such as ML-KEM) so the result stays secure if **either** is unbroken. It protects against harvest-now-decrypt-later while guarding against an undiscovered flaw in the new algorithm.

## Cheat sheet

| Idea | Formula or fact |
|---|---|
| Broken by Shor | RSA, elliptic curves (ECDH, ECDSA, Ed25519), Diffie–Hellman |
| Weakened by Grover | AES, SHA: use 256-bit sizes |
| Mosca's inequality | Act now if shelf life + migration time > time to a CRQC |
| Deadlines | NIST: deprecate RSA/ECC by 2030, disallow by 2035; NSA CNSA 2.0 similar |
| LWE (Regev, 2005) | b = A·s + e (mod q); errors make linear algebra fail |
| ML-KEM (FIPS 203) | Module-LWE KEM; q = 3329, 256-coefficient polynomials; pk 1,184 B (768) |
| ML-DSA (FIPS 204) | Lattice signatures; ML-DSA-65 sig 3,309 B |
| SLH-DSA (FIPS 205) | Stateless hash-based signatures; small keys, large signatures |
| LMS, XMSS | Stateful hash-based signatures; firmware signing |
| FN-DSA (Falcon) | Compact lattice signatures; standard in progress |
| HQC (2025) | Code-based backup KEM |
| Broken in 2022 | SIKE (≈1 hour, laptop), Rainbow (≈a weekend, laptop), both classically |
| Hybrid | Classical + PQC together; secure if either holds (X25519MLKEM768) |
| Embedded | Fast enough; memory and bandwidth are the limits; secure boot first; crypto agility |
