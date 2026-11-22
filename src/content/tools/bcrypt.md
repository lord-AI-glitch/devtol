# Online Bcrypt Hash Generator & Verifier: Cryptographic Architecture, Salt Rounds & Password Security

## 1. Quick Overview & Core Advantages
The **Online Bcrypt Hash Generator & Verifier** is a professional-grade cryptographic utility designed to compute adaptive, blowfish-based password hashes and verify candidate credentials against stored modular crypt strings directly within your web browser. Originally designed by Niels Provos and David Mazières in 1999 for OpenBSD, bcrypt remains one of the most reliable and battle-tested adaptive key derivation functions for authentication security.

In line with zero-trust engineering standards, this tool is built on a **Zero-Knowledge Architecture: cryptographic keys, candidate passwords, and generated hashes never leave local browser memory**. All salt generation, state expansions, and iterative cipher permutations take place strictly in the browser runtime via WebAssembly-compiled C routines and Web Crypto primitives. No network requests are made, protecting your operational credentials from network eavesdropping, proxy retention, and server-side log exposure.

### Core Technical Advantages
- **Zero-Knowledge Privacy**: Plaintext passwords and salt materials are never uploaded to any remote server.
- **Configurable Work Factor ($2^N$)**: Tailor the cost factor between 4 and 16 rounds to test hardware load and audit password hashing throughput.
- **Bidirectional Verification**: Instant validation of candidate passwords against standard modular crypt strings (`$2a$`, `$2b$`, and `$2y$`).
- **Cryptographic Entropy**: Random salts are drawn from the browser's cryptographically secure pseudo-random number generator (`crypto.getRandomValues`).

---

## 2. How to Use Step-by-Step Guide

### Generating a Bcrypt Hash
1. **Input Credentials**: Type or paste the plaintext secret into the **Input String** field.
2. **Select Cost Factor (Rounds)**: Choose the logarithmic cost parameter. Default recommendation is 10 to 12 for web applications.
3. **Generate Hash**: Click **Generate**. The engine generates a 16-byte cryptographically secure salt, runs the configured $2^{\text{cost}}$ iterations, and outputs the standard 60-character bcrypt hash string.
4. **Export Result**: Copy the modular hash string directly into your backend configuration, user seeders, or database test suites.

### Verifying a Candidate Password
1. **Enter Plaintext Password**: Insert the raw password string being tested into the candidate input.
2. **Enter Stored Hash**: Paste the pre-computed bcrypt hash string (e.g., `$2b$12$e8Y7z...`).
3. **Compare**: Click **Verify Password**. The utility parses the cost factor and salt from the hash, runs the identical Eksblowfish expansion on the candidate input, and compares the resulting digest using constant-time string evaluation.

```text
Modular Crypt Format Anatomy:
$2b$12$e8Y7zH7Nq.tP9G8F4D2A1Q.K8Z5T3M2N1B4V6C8X0Z2L4J6O0P2Q4
├── └──┬───────────────────────┴─────────────────────────┘
│      └── 22-char Base64 Salt (16 bytes) + 31-char Ciphertext (24 bytes)
├───────── Cost Factor (2^12 = 4,096 state expansion iterations)
└───────── Algorithm Identifier ($2b$ = Canonical OpenBSD Bcrypt)
```

---

## 3. Cryptographic & Algorithmic Deep Dive

### The Eksblowfish (Expensive Key Schedule) Algorithm
Bcrypt is grounded in the **Eksblowfish** cipher. Unlike symmetric ciphers designed for maximum streaming throughput (like AES), Eksblowfish is engineered to make the initial key schedule computationally expensive while keeping actual block encryption standard.

Modern graphics processing units (GPUs) and Application-Specific Integrated Circuits (ASICs) excel at parallelizing algorithms with small memory footprints, such as SHA-256 or MD5. Bcrypt counters hardware attacks through two mechanisms:
1. **Dynamic Memory Footprint**: Bcrypt continuously permutes an internal state composed of an 18-entry $P$-array and four 256-entry $S$-boxes (totaling 4,096 bytes). Rapid, unpredictable memory reads across these tables throttle massive SIMD parallelization on GPUs.
2. **Exponential Computational Work Factor**: The cost parameter $C$ dictates the exact iteration count:

$$\text{Total Iterations} = 2^C$$

When $C = 12$, the key setup runs $2^{12} = 4,096$ iterations:

```text
Algorithm EksblowfishSetup(cost, salt, password):
    state = InitializeStandardBlowfishState()
    ExpandState(state, salt, password)
    Repeat (2^cost) times:
        ExpandState(state, 0, password)
        ExpandState(state, 0, salt)
    return state
```

### The 72-Byte Truncation Limit
The original Blowfish key schedule operates on maximum key lengths of 448 bits (56 bytes), which the OpenBSD bcrypt implementation extended to **72 bytes**. Plaintext passwords exceeding 72 bytes are truncated at byte 72. In production architectures handling arbitrary passphrase lengths, engineers should pre-hash passwords using an unkeyed digest:

```python
import hashlib
import bcrypt

def create_secure_bcrypt_hash(passphrase: str, rounds: int = 12) -> str:
    # Pre-hash to 32 binary bytes to bypass the 72-byte truncation boundary cleanly
    digest = hashlib.sha256(passphrase.encode('utf-8')).digest()
    salt = bcrypt.gensalt(rounds=rounds, prefix=b'2b')
    return bcrypt.hashpw(digest, salt).decode('utf-8')
```

---

## 4. Real-World Production Security Use Cases & Workflows

### 1. In-Place Password Re-Hashing on Login
As CPU speeds increase over time, password cost factors must increase. Authentication services inspect the cost factor upon user authentication and dynamically upgrade the hash without requiring a manual password reset:

```typescript
import bcrypt from 'bcrypt';

async function verifyAndUpgradePassword(candidate: string, existingHash: string, userId: string) {
  const isMatch = await bcrypt.compare(candidate, existingHash);
  if (!isMatch) throw new Error('Unauthorized: Invalid credentials');

  const currentRounds = bcrypt.getRounds(existingHash);
  const TARGET_ROUNDS = 12;

  if (currentRounds < TARGET_ROUNDS) {
    const upgradedHash = await bcrypt.hash(candidate, TARGET_ROUNDS);
    await database.users.update({ where: { id: userId }, data: { passwordHash: upgradedHash } });
  }
  return true;
}
```

### 2. Rainbow Table Invalidation via Nonce Salts
Because each hash generates a fresh 16-byte random salt, identical passwords generate completely disparate ciphertext signatures. Pre-computed dictionary attacks and rainbow tables cannot be reused across database rows or systems.

---

## 5. Common Mistakes & Pitfalls

### Mistake 1: Choosing a cost factor that is too low
**Cause:** A cost factor of 4 or 5 makes hashing nearly instant — convenient for tests, but it also lets an attacker's GPU cluster try billions of candidates per second.
**Fix:** Use cost 10 to 12 for interactive logins (roughly 100–350 ms per hash) and re-hash on login when hardware gets faster.

### Mistake 2: Hashing passwords longer than 72 bytes without pre-hashing
**Cause:** Bcrypt silently truncates input at 72 bytes, so two passphrases that share the same first 72 bytes produce the identical hash.
**Fix:** Pre-hash long passphrases with SHA-256 to a fixed 32-byte digest before passing them to bcrypt, as shown in the deep-dive section above.

### Mistake 3: Comparing hashes with a plain equality check
**Cause:** Naive string comparison can leak timing information, and re-hashing a candidate with a fresh salt and comparing with `==` always fails, because every bcrypt hash uses a new random salt.
**Fix:** Always verify with the library's constant-time compare function (for example `bcrypt.compare`), which extracts the salt and cost from the stored hash.

### Mistake 4: Reusing or hard-coding the salt
**Cause:** A fixed salt means identical passwords produce identical hashes, re-enabling rainbow-table attacks across your whole user table.
**Fix:** Let the library generate a fresh 16-byte cryptographically random salt for every password; never reuse, hard-code, or derive the salt from the username.

### Mistake 5: Hashing passwords with a fast hash like SHA-256 or MD5
**Cause:** General-purpose hashes are designed to be fast, so an attacker with a GPU cluster can test billions of password guesses per second against stolen digests.
**Fix:** Use a deliberately slow, salted key derivation function — bcrypt, scrypt, or Argon2id — for password storage, never a raw hash.

## 6. Frequently Asked Questions (FAQs)

### What is the distinction between $2a$, $2b$, and $2y$ prefixes?
- `$2a$`: Early revision. A historic bug in crypt_blowfish did not properly handle passwords exceeding 255 characters or containing null bytes.
- `$2y$`: Introduced in PHP's crypt implementation to explicitly denote patches for UTF-8 sign-extension handling.
- `$2b$`: The modern canonical standard established in OpenBSD 5.5. It is backward-compatible with corrected `$2a$` hashes and should be the default choice in all contemporary software.

### What is the recommended salt round setting for enterprise web applications?
For typical interactive web applications, **rounds 10 to 12** provide optimal balance, generating roughly 100ms to 350ms of execution latency on modern multi-core server processors. Going below round 10 exposes hashes to rapid GPU clusters, while exceeding round 14 can expose web servers to denial-of-service (DoS) attacks via CPU exhaustion under high login volume.

### Can bcrypt hashes be reversed or decrypted?
No. Bcrypt is a one-way key derivation function, not symmetric encryption. Plaintext cannot be calculated from the hash; the only mechanism to verify a credential is by computing the forward Eksblowfish expansion of a candidate and comparing output digests.

### Are my passwords logged or sent across the internet?
No. This tool runs 100% locally in your browser sandbox using compiled WebAssembly. No network packets are transmitted, ensuring absolute privacy for sensitive credentials during testing and development.

---

## 7. Security and Privacy Guarantee
- **Zero-Knowledge Protocol**: Raw credentials and salts are maintained only in browser volatile memory.
- **No Remote Telemetry**: Zero analytics, trackers, or HTTP POST requests are fired during generation or verification.
- **Standardized RFC Format**: Produces standard modular crypt outputs compatible with Node.js, Python, Ruby, Go, PHP, and Java bcrypt libraries.
