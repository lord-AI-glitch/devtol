# Online RSA Key Pair Generator: Public/Private Keys, PEM Formatting & PKCS#8 Cryptography

## 1. Quick Overview & Core Advantages
The **Online RSA Key Pair Generator** is a cryptographic utility designed to generate asymmetric public and private key pairs directly within your web browser. Utilizing modern cryptographic standards, it supports key moduli of **2048, 3072, and 4096 bits**, generating industry-standard PEM-formatted PKCS#8 private keys and SPKI (Subject Public Key Info) public keys.

Operating under a strict **Zero-Knowledge Architecture: RSA private keys and prime factor materials never leave local browser memory**. Key generation relies on the native W3C Web Crypto API (`window.crypto.subtle.generateKey`), executing directly on your local hardware. Private keys are never transmitted over the network or saved to remote databases, safeguarding your asymmetric keys from interception.

### Core Technical Advantages
- **Zero-Knowledge Key Generation**: Cryptographic keys are generated locally within browser memory.
- **Multiple Modulus Bitlengths**: Generate 2048-bit (standard web security), 3072-bit (enterprise security), or 4096-bit (high-security archival) keys.
- **Standardized PEM Encoding**: Exports formatted keys with standard `-----BEGIN PRIVATE KEY-----` (PKCS#8) and `-----BEGIN PUBLIC KEY-----` (SPKI) headers.
- **Hardware-Accelerated Web Crypto API**: Uses native platform cryptographic libraries for high-entropy prime number generation.

---

## 2. How to Use Step-by-Step Guide

### Generating an Asymmetric RSA Key Pair
1. **Select Modulus Length**: Choose the desired key bitlength (**2048**, **3072**, or **4096** bits).
2. **Select Public Exponent**: Standard public exponent is $F_4 = 65537$ (`0x010001`).
3. **Choose Intended Purpose**: Select **Signature (RSASSA-PKCS1-v1_5 / RSA-PSS)** or **Encryption (RSA-OAEP)**.
4. **Generate Keypair**: Click **Generate RSA Key Pair**. The browser's crypto engine locates prime candidates and constructs the key structure.
5. **Download / Copy PEM**: Copy the public key for server installation and save the private key in your local secret storage.

```text
Key Structure Format:
Public Key:  SPKI format (SubjectPublicKeyInfo - RFC 5280)
             -----BEGIN PUBLIC KEY----- ... -----END PUBLIC KEY-----

Private Key: PKCS#8 format (Private-Key Information Syntax - RFC 5208)
             -----BEGIN PRIVATE KEY----- ... -----END PRIVATE KEY-----
```

---

## 3. Cryptographic & Algorithmic Deep Dive

### Mathematical Foundations of RSA (Rivest–Shamir–Adleman)
RSA security relies on the hardness of the integer factorization problem for products of two large prime numbers.

#### 1. Prime Selection & Modulus Generation
Two distinct large prime numbers $p$ and $q$ are chosen at random using a cryptographically secure random number generator:

$$n = p \cdot q$$

The integer $n$ represents the RSA **modulus**, and its bitlength $\lceil\log_2 n\rceil$ defines key strength (e.g., 2048 or 4096 bits).

#### 2. Euler's Totient & Key Math
Euler's totient function $\phi(n)$ is computed as:

$$\phi(n) = (p - 1)(q - 1)$$

A public exponent $e$ is selected such that $1 < e < \phi(n)$ and $\gcd(e, \phi(n)) = 1$. The standard industry choice is the fourth Fermat number:

$$e = 2^{16} + 1 = 65537$$

This value balances computational efficiency for signature verification with protection against small-exponent attacks (like Coppersmith's attack on $e=3$).

#### 3. Private Exponent Derivation
The private exponent $d$ is derived as the modular multiplicative inverse of $e$ modulo $\phi(n)$:

$$d \equiv e^{-1} \pmod{\phi(n)} \implies e \cdot d \equiv 1 \pmod{\phi(n)}$$

- **Public Key**: $(e, n)$
- **Private Key**: $(d, n)$, typically augmented with Chinese Remainder Theorem (CRT) coefficients ($d_p, d_q, q_{\text{inv}}$) to accelerate decryption speed by up to $4\times$.

```javascript
// Native Web Crypto RSA-OAEP Keypair Generation
async function generateRSAKeyPair(modulusLength = 2048) {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: modulusLength,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]), // 65537
      hash: "SHA-256",
    },
    true, // extractable
    ["encrypt", "decrypt"]
  );
  return keyPair;
}
```

---

## 4. Real-World Production Security Use Cases & Workflows

### 1. SSH Server Access & Identity Authentication
Generate key pairs for secure server access. The public key is placed on the remote host inside `~/.ssh/authorized_keys`, while the private key remains on the client device.

### 2. TLS/HTTPS Web Certificates and DKIM Email Signing
RSA keys power TLS handshakes and domain email authentication (DKIM), allowing mail servers to verify that outgoing messages originated from authorized domain infrastructure.

---

## 5. Common Mistakes & Pitfalls

### Mistake 1: Generating 1024-bit (or smaller) keys
**Cause:** 1024-bit RSA is within reach of well-funded factorization efforts, so keys that size no longer provide a meaningful security margin.
**Fix:** Use 2048 bits as the minimum for general use, 3072 bits for data that must stay secure beyond 2030, and 4096 bits for root CAs and long-term archives.

### Mistake 2: Sharing, emailing, or committing the private key
**Cause:** Anyone holding the private key can decrypt messages and forge signatures as you. A key committed to a repository is compromised the moment it is pushed, even to a private repo.
**Fix:** Keep the private key in local secret storage with tight file permissions, distribute only the public key, and revoke and replace any private key that was ever exposed.

### Mistake 3: Encrypting large data directly with RSA
**Cause:** RSA can only encrypt a message shorter than the key minus padding overhead (about 190 bytes for a 2048-bit key with OAEP), so bulk data fails or forces insecure chunking.
**Fix:** Use hybrid encryption: generate a random AES key, encrypt the data with AES-GCM, and encrypt only the AES key with RSA.

### Mistake 4: Mixing up PKCS#1 and PKCS#8 formats on import
**Cause:** A `BEGIN RSA PRIVATE KEY` (PKCS#1) file fed to a parser expecting `BEGIN PRIVATE KEY` (PKCS#8) — or the reverse — fails to load, and converting by hand risks corrupting the key.
**Fix:** Check the PEM header before importing and convert explicitly (for example with OpenSSL `pkcs8 -topk8`) instead of renaming headers.

### Mistake 5: Using raw "textbook" RSA without padding
**Cause:** Unpadded RSA is deterministic and malleable: identical plaintexts produce identical ciphertexts and attackers can manipulate ciphertexts algebraically.
**Fix:** Always use OAEP padding for encryption and PSS (or PKCS#1 v1.5) for signatures; never use raw modular exponentiation on application data.

## 6. Frequently Asked Questions (FAQs)

### What key length should I choose: 2048, 3072, or 4096 bits?
- **2048 bits**: Current baseline recommended by NIST for general commercial systems.
- **3072 bits**: Recommended for systems requiring security longevity beyond 2030 (equivalent to 128 bits of symmetric security).
- **4096 bits**: High-security option suitable for root Certificate Authorities (CAs) and long-term archival data encryption.

### Why is 65537 almost universally selected as the public exponent?
$65537$ ($2^{16} + 1$) contains only two set bits in binary (`10000000000000001`), requiring only 17 modular multiplications during exponentiation while remaining large enough to prevent low-exponent attacks.

### What is the difference between PKCS#1 and PKCS#8 formats?
PKCS#1 format specifically represents RSA keys (indicated by `BEGIN RSA PRIVATE KEY`). PKCS#8 is a modern, versatile format that encapsulates any private key algorithm alongside its algorithm identifier (indicated by `BEGIN PRIVATE KEY`).

### Can anyone access the private keys generated by this online tool?
No. Key generation occurs directly inside your browser sandbox using the Web Crypto API. Private keys are never sent over the network or saved in external logs.

---

## 7. Security and Privacy Guarantee
- **Web Crypto Native**: Hardware-backed asymmetric key generation directly inside client memory.
- **Zero Remote Storage**: Private keys are not transmitted or stored remotely.
- **PKCS Compliant**: Exports RFC 5208 (PKCS#8) and RFC 5280 (SPKI) standards.
