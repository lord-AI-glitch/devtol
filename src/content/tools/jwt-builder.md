# Free Online JWT Builder & Signer — Create, Sign & Decode JSON Web Tokens (HMAC-SHA256)

DevTol's **Free Online JWT Builder & Signer** is a client-side cryptographic utility designed for software engineers, backend developers, and security analysts. Construct, customize, sign, and verify **JSON Web Tokens (JWT)** conforming to RFC 7519 standards directly in your browser. Configure custom headers, claims payloads, expiration timestamps, and HMAC-SHA256 cryptographic signatures with 100% in-browser privacy.

---

## Why Client-Side JWT Construction is Essential for Security

Pasting proprietary JSON Web Tokens, private secret keys, or authentication claims into public cloud-based JWT debuggers (such as jwt.io) sends your application secrets across third-party networks, risking token interception, secret leakage, and credential abuse.

DevTol executes all cryptographic HMAC-SHA256 signatures locally using standard Web Cryptography APIs (`SubtleCrypto`):

| Security Parameter | DevTol JWT Builder | Typical Cloud JWT Debuggers |
| :--- | :--- | :--- |
| **Secret Key Privacy** | **100% Client-Side** (Never leaves RAM) | Frequently sent to remote servers via analytics |
| **RFC 7519 Compliance** | Fully compliant 3-part Base64URL structure | Variable compliance |
| **Token Verification** | Real-time HMAC-SHA256 signature checking | Network roundtrip required |
| **Payload Customization** | Flexible claims (sub, iss, aud, exp, custom JSON) | Clunky text area with formatting errors |
| **Offline Execution** | Operates offline via Progressive Web App (PWA) | Inoperable without constant internet |

---

## Anatomical Structure of a JSON Web Token (RFC 7519)

A JSON Web Token consists of three distinct components joined by periods (`.`):

```
[Header].[Payload].[Signature]
```

1. **Header**: Contains the token type (`JWT`) and the signing algorithm (e.g., `HS256` for HMAC using SHA-256).
2. **Payload (Claims)**: Contains statements about the entity (typically the user) and additional metadata:
   - `iss` (Issuer): Identifies the principal that issued the JWT.
   - `sub` (Subject): Identifies the subject of the JWT (e.g., user ID).
   - `aud` (Audience): Identifies the recipients that the JWT is intended for.
   - `exp` (Expiration Time): Identifies the expiration time on or after which the JWT must not be accepted.
   - `iat` (Issued At): Identifies the time at which the JWT was issued.
3. **Signature**: Computed by encoding the header and payload with Base64URL, concatenating them with a period, and hashing the result with your private secret key using HMAC-SHA256.

---

## How to Build and Sign a JWT Step-by-Step

1. **Set Header**: Confirm the signing algorithm (default: `HS256`) and token type.
2. **Edit Payload Claims**: Input your JSON payload claims including user IDs, roles, permissions, and expiration times.
3. **Enter Secret Key**: Supply your HMAC-SHA256 secret passphrase. The signature recalculates reactively in memory.
4. **Copy Signed Token**: Click **Copy Token** to retrieve your valid, ready-to-test JSON Web Token for API headers (`Authorization: Bearer <token>`).

---

## Frequently Asked Questions (FAQs)

### Q1: Is my secret signing key stored or transmitted anywhere?
No. DevTol uses the browser's native Web Crypto API (`window.crypto.subtle`). All HMAC key derivation and signature computations occur strictly within your browser's local sandbox memory.

### Q2: What is the difference between JWT encoding and encryption?
Standard JWTs signed with HMAC-SHA256 are **encoded and signed, not encrypted**. The payload is readable by anyone who decodes the Base64URL string; the signature merely guarantees that the payload has not been tampered with in transit. Never place unencrypted passwords or credit cards in standard JWT claims.

### Q3: Does this tool validate token expiration timestamps (`exp`)?
Yes. The builder allows you to specify Unix timestamps for `exp` (expiration) and `nbf` (not before) and verifies whether the generated token is currently valid or expired.
