# Online Symmetric Encryption & Decryption: AES-GCM, AES-CBC & Cryptographic Architecture

## 1. Quick Overview & Core Advantages
The **Online Symmetric Encryption & Decryption Utility** is an enterprise-grade cryptographic workspace that provides secure, authenticated symmetric data transformation directly within the browser. Supporting modern cryptographic standards including **AES-GCM (Galois/Counter Mode)** and **AES-CBC (Cipher Block Chaining)** with PBKDF2 key derivation, this tool allows engineers, security analysts, and developers to encrypt plaintext payloads or decrypt existing ciphertexts.

Engineered under a strict **Zero-Knowledge Architecture: cryptographic keys, passphrases, and plaintexts never leave local browser memory**. Transformations are performed using the hardware-accelerated W3C Web Crypto API (`window.crypto.subtle`). No encryption keys or decrypted plaintexts are transmitted over the network, ensuring zero exposure to third-party observers, ISPs, or unauthorized logging servers.

### Core Technical Advantages
- **Zero-Knowledge Processing**: Encryption and decryption occur entirely within client memory.
- **Authenticated Encryption (AEAD)**: Native support for AES-GCM guarantees data confidentiality and cryptographic authenticity.
- **Robust Key Derivation**: Employs PBKDF2 with HMAC-SHA256 and configurable iterations (100,000+) to transform human passphrases into 256-bit symmetric keys.
- **Hardware-Accelerated Web Crypto**: Utilizes native CPU cryptographic instructions (such as Intel AES-NI or ARMv8 Crypto Extensions) through modern browser engines.

---

## 2. How to Use Step-by-Step Guide

### Encrypting Plaintext
1. **Select Cipher Mode**: Choose **AES-GCM** (recommended for authenticated encryption) or **AES-CBC**.
2. **Enter Plaintext**: Paste your configuration secret, token, or message into the **Plaintext** field.
3. **Set Passphrase or 256-Bit Hex Key**: Provide a strong passphrase or direct hexadecimal cryptographic key.
4. **Configure PBKDF2 Iterations**: When using a passphrase, select iteration count (default: 100,000 iterations).
5. **Encrypt**: Click **Encrypt Payload**. The tool generates a cryptographically secure Initialization Vector (IV) / Nonce, derives the 256-bit key, and outputs the resulting Base64 or Hex ciphertext bundle.

### Decrypting Ciphertext
1. **Select Matching Cipher Mode**: Ensure the selected mode matches the mode used during encryption (e.g., AES-GCM).
2. **Input Ciphertext Bundle**: Paste the Base64/Hex ciphertext, along with the corresponding IV/Nonce and Salt.
3. **Enter Passphrase/Key**: Enter the identical secret passphrase used during encryption.
4. **Decrypt**: Click **Decrypt Payload**. The engine checks authentication tags (in GCM mode) to confirm message integrity, decrypts the payload, and displays the plaintext.

```text
Encrypted Payload Structure (JSON / Base64 format):
{
  "cipher": "AES-GCM",
  "salt": "d98f7e2a4b1c8e3f...",     // 16-byte random salt for PBKDF2
  "iv": "3f8a9b2c1d0e...",           // 12-byte initialization vector / nonce
  "tag": "e1f2a3b4c5...",            // 16-byte authentication tag
  "data": "kL8Z0Pq..."               // Encrypted ciphertext
}
```

---

## 3. Cryptographic & Algorithmic Deep Dive

### AES-GCM: Authenticated Encryption with Associated Data (AEAD)
AES (Advanced Encryption Standard, standardized in NIST FIPS PUB 197) is a symmetric block cipher operating on 128-bit blocks. AES-GCM couples AES counter mode with universal hashing over a binary Galois field $\text{GF}(2^{128})$:

1. **Counter Mode Confidentiality**: AES-CTR turns a block cipher into a stream cipher by encrypting successive values of an incremental counter:

$$C_i = P_i \oplus \text{AES}_K(\text{IV} \mathbin{\Vert} i)$$

2. **GHASH Authenticity Tag**: As blocks are encrypted, an incremental universal hash calculates a 128-bit authentication tag $T$:

$$T = \text{GHASH}_H(A, C) \oplus \text{AES}_K(\text{IV} \mathbin{\Vert} 0)$$

If an attacker alters even a single bit of the ciphertext $C$, tag verification fails immediately during decryption, preventing padding oracle attacks and bit-flipping tampering.

### PBKDF2 Key Derivation (RFC 8018)
Human passphrases lack the entropy necessary for direct use as a 256-bit symmetric key. PBKDF2 applies a pseudorandom function (such as HMAC-SHA256) repeatedly across a salt:

$$DK = \text{PBKDF2}(\text{PRF}, \text{Password}, \text{Salt}, c, dkLen)$$

Where $c \ge 100,000$ iterations drastically raises the computational cost for offline dictionary attacks.

---

## 4. Real-World Production Security Use Cases & Workflows

### 1. Secure Client-Side Secret Storage
Encrypt sensitive state (such as API keys or user tokens) prior to saving in browser `localStorage` or IndexedDB:

```javascript
async function encryptSensitiveToken(token, passphrase) {
  const enc = new TextEncoder();
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const keyMaterial = await window.crypto.subtle.importKey(
    "raw", enc.encode(passphrase), "PBKDF2", false, ["deriveKey"]
  );

  const key = await window.crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );

  const ciphertext = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(token)
  );

  return {
    salt: Array.from(salt),
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(ciphertext))
  };
}
```

### 2. Encrypted Configuration File Sharing
DevOps teams securely share environment variables or production secrets across asynchronous channels by encrypting with a shared team passphrase using AES-GCM.

---

## 5. Common Mistakes & Pitfalls

### Mistake 1: Reusing an IV/nonce with the same key in AES-GCM
**Cause:** GCM's security collapses when a nonce repeats under one key: an attacker can recover the authentication key and forge ciphertexts.
**Fix:** Generate a fresh random 12-byte IV for every encryption and store it alongside the ciphertext; never reuse, hard-code, or derive it from a counter you might reset.

### Mistake 2: Using AES-CBC without authentication
**Cause:** CBC provides confidentiality only. Without a MAC, an attacker can flip ciphertext bits and exploit padding oracles to decrypt the message.
**Fix:** Prefer AES-GCM (authenticated encryption). If you must use CBC, add an HMAC over the ciphertext (encrypt-then-MAC) and verify it before decrypting.

### Mistake 3: Deriving a key directly from a password
**Cause:** Human passphrases have far less entropy than a 256-bit key, and using them raw (or with a single hash round) makes offline dictionary attacks trivial.
**Fix:** Always run passphrases through PBKDF2 (or Argon2/scrypt) with a random 16-byte salt and at least 100,000 iterations.

### Mistake 4: Losing the salt or IV — or treating them as secrets
**Cause:** Salt and IV are required to decrypt, so losing them destroys the data; conversely, hiding them adds no security and complicates key management.
**Fix:** Store the salt and IV in plaintext next to the ciphertext (they are not secrets); protect only the passphrase or key.

### Mistake 5: Encrypting with ECB mode or a hard-coded key
**Cause:** ECB encrypts identical plaintext blocks to identical ciphertext blocks, leaking patterns, and a key baked into source code is exposed to anyone who reads the code.
**Fix:** Never use ECB; use GCM or CBC with a random IV, and load keys from a secret manager or environment variable, never from the repository.

## 6. Frequently Asked Questions (FAQs)

### Why is AES-GCM preferred over AES-CBC?
AES-CBC only provides confidentiality, not integrity. If CBC ciphertexts are modified without authenticated MAC validation, the application may become vulnerable to padding oracle attacks. AES-GCM is an Authenticated Encryption with Associated Data (AEAD) scheme that automatically validates that ciphertext has not been tampered with.

### Can an IV (Initialization Vector) be reused?
**Never reuse an IV with the same key in AES-GCM.** Reusing an IV destroys the authenticity guarantees of Galois Counter Mode and allows adversaries to recover the GHASH authentication key, completely breaking the cryptographic protection.

### How are passwords converted into 256-bit AES keys?
Passphrases pass through PBKDF2 (Password-Based Key Derivation Function 2) with HMAC-SHA256, combined with a 16-byte cryptographically secure random salt and at least 100,000 computational rounds.

### Can the tool operator or host server access my secret keys?
No. All cryptographic operations are processed via the native browser Web Crypto API. Plaintext, keys, and passphrases are never sent across the network.

---

## 7. Security and Privacy Guarantee
- **Local Web Crypto API**: Hardware-accelerated client-side encryption.
- **Zero-Knowledge Guarantee**: Keys and plaintexts remain in client volatile RAM only.
- **NIST Standard Compliant**: Strict adherence to NIST SP 800-38D (AES-GCM) and RFC 8018 (PBKDF2).
