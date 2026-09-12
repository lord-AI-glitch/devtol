# Online HMAC Generator: Cryptographic Signatures, Hash Algorithms & API Security

## 1. Quick Overview & Core Advantages
The **Online HMAC Generator** is an interactive, browser-based cryptographic tool designed to compute Hash-based Message Authentication Codes (HMAC) across diverse hash algorithms (SHA-256, SHA-512, SHA-384, SHA-1, and MD5). HMAC provides cryptographically verifiable message authenticity and data integrity, guaranteeing that messages transmitted across networks have not been forged or altered by unauthorized intermediaries.

This utility operates on a **Zero-Knowledge Architecture: private signing keys, request payloads, and calculated HMAC digests never leave local browser memory**. Leveraging the browser's native Web Crypto API (`crypto.subtle.sign`), operations execute locally without transmitting your secret keys or API signatures across the network.

### Core Technical Advantages
- **Zero-Knowledge Security**: Cryptographic secret keys remain strictly within your local browser session.
- **Comprehensive Hash Support**: Supports SHA-256, SHA-512, SHA-384, SHA-224, SHA-1, and MD5.
- **Flexible Encoding Schemes**: Output signatures in Hexadecimal, Base64, or Base64URL formats.
- **Developer-Ready Validation**: Compare generated signatures against incoming third-party webhook headers (such as GitHub, Stripe, or AWS).

---

## 2. How to Use Step-by-Step Guide

### Generating an HMAC Signature
1. **Choose Hash Algorithm**: Select your hashing algorithm (recommended: **SHA-256** or **SHA-512** for production APIs).
2. **Enter Secret Key**: Input the shared secret signing key. Toggle between raw UTF-8 string or Hex-encoded binary keys.
3. **Input Message Payload**: Paste your message text, JSON body, or webhook payload into the input box.
4. **Choose Output Format**: Select Hexadecimal (lowercase/uppercase), Base64, or Base64URL encoding.
5. **Copy Output**: Click **Copy** to export the resulting cryptographic digest into your HTTP headers or signature verification script.

```text
HMAC Processing Flow:
[Message Payload] + [Secret Key]
        │                │
        ▼                ▼
 ┌──────────────────────────────┐
 │   HMAC-SHA256 Local Engine   │ ──> (Zero Network Calls)
 └──────────────────────────────┘
                 │
                 ▼
  4f8a9b2c1d0e... (Hex Digest)
```

---

## 3. Cryptographic & Algorithmic Deep Dive

### RFC 2104 Mathematical Formulation
HMAC is formally specified in **RFC 2104**. It resolves a fundamental vulnerability in naive hash combinations: simply prepending a secret key to a message ($H(K \mathbin{\Vert} M)$) makes the hash vulnerable to **length-extension attacks** on Merkle-Damgård hash algorithms (such as MD5, SHA-1, and SHA-256).

HMAC prevents length-extension attacks by nesting two rounds of hashing using inner and outer padding constants:

$$\text{HMAC}(K, M) = H\big((K' \oplus opad) \mathbin{\Vert} H((K' \oplus ipad) \mathbin{\Vert} M)\big)$$

Where:
- $H$: The underlying cryptographic hash function (e.g., SHA-256).
- $B$: The block size of the hash function (64 bytes for SHA-256; 128 bytes for SHA-512).
- $K'$: A key normalized to block length $B$. If $K$ is longer than $B$, it is pre-hashed: $K' = H(K)$. If shorter, it is right-padded with zeroes.
- $ipad$: Inner pad constant (byte `0x36` repeated $B$ times).
- $opad$: Outer pad constant (byte `0x5C` repeated $B$ times).

```text
Detailed Step Diagram:
1. Inner Key:  K_inner = K' XOR 0x36...0x36
2. Inner Hash: H_inner = Hash(K_inner || Message)
3. Outer Key:  K_outer = K' XOR 0x5C...0x5C
4. Final Hash: HMAC    = Hash(K_outer || H_inner)
```

---

## 4. Real-World Production Security Use Cases & Workflows

### 1. Webhook Signature Verification (Stripe / GitHub Style)
Modern SaaS platforms sign outgoing webhook events with an HMAC-SHA256 header. The receiver computes the HMAC of the raw request body and performs a constant-time comparison:

```typescript
import crypto from 'crypto';

function verifyWebhook(payload: string, signatureHeader: string, secret: string): boolean {
  const computedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');

  // Use timingSafeEqual to protect against timing side-channel attacks
  return crypto.timingSafeEqual(
    Buffer.from(signatureHeader, 'hex'),
    Buffer.from(computedSignature, 'hex')
  );
}
```

### 2. AWS Signature Version 4 (SigV4) Request Signing
Cloud providers utilize chained HMAC-SHA256 calculations over dates, regions, and service endpoints to authorize API calls without exposing primary account master credentials.

---

## 5. Frequently Asked Questions (FAQs)

### What is the difference between a Hash and an HMAC?
A standard hash (like SHA-256) takes an arbitrary input and produces a fixed-size digest without requiring a key; anyone can compute the hash of a known message. An HMAC incorporates a private cryptographic key, meaning only parties possessing the secret key can generate or verify the signature.

### Why is naive concatenation Hash(Key + Message) insecure?
Merkle-Damgård hash functions (including MD5, SHA-1, and SHA-256) process data in sequential blocks. If an attacker observes $H(Key \mathbin{\Vert} Message)$, they can append additional arbitrary data to the message and compute a valid signature without knowing the secret key. HMAC's nested two-pass design eliminates this risk.

### Why is constant-time comparison critical for verifying HMACs?
Standard string equality comparisons (`==` or `===`) return `false` immediately upon finding the first non-matching byte. Attackers can measure the response time in microseconds to guess each byte sequentially. Constant-time comparisons inspect every byte regardless of mismatch, mitigating timing attacks.

### Are my private signing keys safe using this online tool?
Yes. The tool operates completely on your local machine using the browser's Web Crypto API. Signing keys and messages are never sent over the network or stored in external logs.

---

## 6. Security and Privacy Guarantee
- **Local Web Crypto API**: Hardware-backed cryptographic operations within the browser sandbox.
- **Zero-Knowledge Architecture**: Secret keys and messages remain strictly in local memory.
- **RFC 2104 Conformance**: Fully compliant with RFC 2104 and FIPS 198-1 specifications.
