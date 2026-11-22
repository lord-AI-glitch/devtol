# Cryptographic Hashing Algorithms: SHA-256, MD5, Keccak & Avalanche Mechanics

## 1. Overview & Deep Dive
A cryptographic hash function is a deterministic mathematical algorithm that maps arbitrary-length binary data (the preimage) to a fixed-size bit string (the hash value, message digest, or checksum). Defined across standards including FIPS PUB 180-4 and RFC 1321, cryptographic hashes are fundamental building blocks of modern computer security, powering digital signatures, message integrity checks, blockchain consensus engines, and password authentication frameworks.

Unlike encryption, which is a two-way mathematical operation designed for decryption with a private key, cryptographic hashing is strictly a **one-way function**. It is computationally impossible to reconstruct the original input from the resulting digest alone. 

Understanding the mathematical properties of collision resistance, preimage resistance, and the avalanche effect is critical for selecting the correct algorithm for security, integrity, or performance requirements.

## 2. Technical Architecture & RFC Specifications
To be classified as cryptographically secure, a hashing algorithm must satisfy three core security properties:
1. **Preimage Resistance (One-Wayness)**: Given a digest $h$, it is computationally infeasible to find any input $m$ such that $\text{hash}(m) = h$.
2. **Second Preimage Resistance (Weak Collision Resistance)**: Given an input $m_1$, it is computationally infeasible to find another distinct input $m_2 \neq m_1$ such that $\text{hash}(m_1) = \text{hash}(m_2)$.
3. **Collision Resistance (Strong Collision Resistance)**: It is computationally infeasible to find any two arbitrary distinct inputs $m_1 \neq m_2$ such that $\text{hash}(m_1) = \text{hash}(m_2)$.

### The Avalanche Effect
A cornerstone property of high-quality cryptographic hashes is the **avalanche effect**. If a single bit in the input preimage changes (e.g., changing a capital letter to lowercase or flipping a trailing zero), the resulting output hash changes dramatically—statistically flipping approximately 50% of the output bits in a pseudo-random, uncorrelated manner.

### Overview of Hashing Families
- **MD5 (RFC 1321)**: Produces a 128-bit digest. Broken since 2004 due to practical collision attacks. **Unsafe for cryptographic security.**
- **SHA-1 (RFC 3174)**: Produces a 160-bit digest. Deprecated since the SHAttered collision attack in 2017. **Unsafe for digital signatures.**
- **SHA-2 Family (FIPS PUB 180-4)**: Designed by the NSA and standardized by NIST. Includes:
  - **SHA-256**: 256-bit digest (32 bytes). The global gold standard for TLS, DNSSEC, and Bitcoin.
  - **SHA-512**: 512-bit digest (64 bytes). Optimized for 64-bit hardware architectures.
- **SHA-3 / Keccak (FIPS PUB 202)**: Based on the **sponge construction** rather than the Merkle-Damgård structure used by MD5, SHA-1, and SHA-2. Completely immune to length extension attacks.
- **BLAKE3**: Modern cryptographic hash algorithm designed for extreme parallel performance using Merkle trees, delivering superior speed over SHA-256 while maintaining 128-bit security levels.

## 3. Step-by-Step Practical Usage Guide
### Generating Hashes in Browser and Node.js via Web Crypto API
The standard `crypto.subtle` API provides native, hardware-accelerated cryptographic operations:
```typescript
async function computeSha256(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Example Execution
computeSha256("Hello, Security World!").then(hex => {
  console.log("SHA-256:", hex);
});
```

## 4. Real-World Engineering Use Cases
- **Data Integrity and Checksum Verification**: Software distributions (e.g., Linux ISOs, Docker container image layers) publish SHA-256 checksums alongside download links. After downloading, clients compute the local hash to verify the file was not altered or corrupted.
- **Subresource Integrity (SRI) in Web Browsers**: HTML script tags include `integrity="sha384-..."` attributes. Modern browsers verify the CDN script's hash before execution to prevent malicious CDN tampering.
- **Proof-of-Work and Blockchain Consensus**: Bitcoin uses double SHA-256 (`SHA256(SHA256(block_header))`) mining to achieve distributed trustless consensus across tens of thousands of global validator nodes.

## 5. Security Pitfalls: Why NOT to Hash Passwords with SHA-256
A critical security misconception is storing user passwords using SHA-256 or SHA-512.
- Cryptographic hash algorithms are intentionally engineered to be **extremely fast**. A modern GPU cluster can compute billions of SHA-256 hashes per second.
- Attackers armed with precomputed rainbow tables or offline dictionary attacks can crack raw SHA-256 password digests in seconds.
- **Correct Solution**: Passwords must be hashed using dedicated, deliberately slow **Key Derivation Functions (KDFs)** with configurable work factors and memory hardness, such as **Argon2id**, **bcrypt**, or **scrypt**.

## 6. Comparative Performance Benchmarks & Hardware Acceleration
When selecting a hash function for high-throughput stream processing or distributed consensus, raw execution speed and hardware instruction support play a pivotal role. The table below illustrates standard throughput characteristics observed across modern x86-64 and ARM64 architectures:

| Algorithm | Digest Size | Architecture Optimization | Throughput (Cycles/Byte) | Primary Cryptographic Vulnerabilities |
| :--- | :--- | :--- | :--- | :--- |
| **MD5** | 128 bits | 32-bit arithmetic | 4.5 - 6.0 | Severe practical collision vulnerabilities; broken. |
| **SHA-1** | 160 bits | 32-bit arithmetic | 5.5 - 7.5 | SHAttered collision demonstrated; completely deprecated. |
| **SHA-256** | 256 bits | Intel SHA Extensions / ARMv8 Crypto | 1.8 - 12.0 (hw vs sw) | Length extension vulnerability if unkeyed. |
| **SHA-512** | 512 bits | 64-bit native registers | 4.0 - 6.5 | Length extension vulnerability if unkeyed. |
| **SHA3-256**| 256 bits | Sponge construction | 6.0 - 8.5 | None; immune to length extension by design. |
| **BLAKE3** | 256 bits | SIMD / AVX-512 / NEON parallelism | 0.5 - 1.2 | None; cutting-edge tree hash design. |

Modern processors feature dedicated hardware instructions specifically targeting SHA-256 computation (Intel SHA Extensions and ARMv8 Cryptographic Extensions). When these instructions are leveraged by optimized low-level engines (like OpenSSL or BoringSSL), SHA-256 computation speeds increase by 4x to 8x compared to naive software loops, ensuring negligible CPU overhead even on high-traffic gigabit networks.

## 7. Frequently Asked Questions (FAQs)
**Q1: Can a hash function be decrypted?**
No. Hashing is a one-way mathematical reduction. Because an infinite number of arbitrary-length inputs map into a finite bit space (such as 256 bits), information is irreversibly compressed. You cannot mathematically invert a digest back into its original text.

**Q2: What is a hash collision?**
A collision occurs when two distinct, different inputs produce the exact same output hash digest ($	ext{hash}(A) = 	ext{hash}(B)$). While theoretically guaranteed to exist by the Pigeonhole Principle, finding one in SHA-256 would require more energy than boiling the Earth's oceans.

**Q3: What is a Length Extension Attack?**
In algorithms based on the Merkle-Damgård construction (MD5, SHA-1, SHA-256), knowing $	ext{hash}(secret \parallel message)$ and the length of $secret$ allows an attacker to compute $	ext{hash}(secret \parallel message \parallel padding \parallel attacker\_extension)$ without ever knowing the secret. SHA-3 and HMAC constructions are immune to this attack.

**Q4: Why is MD5 still used if it is cryptographically broken?**
MD5 is still occasionally used as a quick non-cryptographic checksum for caching keys, duplicate file detection on local storage, or audio/video deduplication where speed matters and active adversaries are not a concern. It must never be used for security or certificates.

**Q5: How does HMAC differ from a plain hash?**
A Hash-based Message Authentication Code (HMAC) incorporates a cryptographic secret key into the hashing process ($	ext{HMAC}(K, m) = H((K' \oplus opad) \parallel H((K' \oplus ipad) \parallel m))$). This guarantees both data integrity and authentic origin, preventing tampering and length extension attacks.

**Q6: Is BLAKE3 supported by this tool?**
BLAKE3 is not supported in this tool — it supports MD5, SHA-1, SHA-2, SHA-3 and RIPEMD-160.
