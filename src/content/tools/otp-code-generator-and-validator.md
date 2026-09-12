# Online OTP Code Generator & Validator: RFC 6238 TOTP, HOTP & Two-Factor Authentication

## 1. Quick Overview & Core Advantages
The **Online OTP (One-Time Password) Generator & Validator** is an interactive, browser-based cryptographic authentication tool designed to generate, inspect, and validate RFC 6238 Time-Based One-Time Passwords (TOTP) and RFC 4226 HMAC-Based One-Time Passwords (HOTP). Compatible with multi-factor authentication (MFA) applications such as Google Authenticator, Microsoft Authenticator, Authy, and 1Password, this tool allows developers to debug two-factor login workflows and verify secret keys.

Our implementation operates under a strict **Zero-Knowledge Architecture: secret seeds, Base32 keys, and authentication codes never leave local browser memory**. All HMAC calculations, bitwise truncation routines, and time-step tracking occur locally in your browser session, preventing inadvertent exposure of your MFA credentials to remote servers.

### Core Technical Advantages
- **Zero-Knowledge Client Processing**: Secret seeds remain isolated in local volatile browser memory.
- **Full RFC Compliance**: Supports RFC 6238 (TOTP) and RFC 4226 (HOTP) standards.
- **Configurable Parameters**: Customize time steps (e.g., 30s, 60s), code lengths (6, 7, 8 digits), and hash algorithms (SHA-1, SHA-256, SHA-512).
- **Time Drift Tolerance Testing**: Verify OTP codes across preceding and following time windows ($pm 1$ step) to diagnose server clock drift issues.

---

## 2. How to Use Step-by-Step Guide

### Generating TOTP Authentication Codes
1. **Input Base32 Secret Key**: Enter your two-factor secret key (e.g., `JBSWY3DPEHPK3PXP`) in the secret field.
2. **Select Hash Algorithm**: Standard services use **SHA-1**; advanced enterprise systems may specify **SHA-256** or **SHA-512**.
3. **Configure Period & Digits**: Default settings are **30 seconds** and **6 digits**.
4. **View Live Code**: The tool displays the active one-time password alongside a real-time visual expiration countdown ring.
5. **Copy Code**: Click the code to copy it directly into your application's MFA verification input.

### Validating an OTP Code
1. **Enter Active Secret**: Provide the Base32 shared secret key.
2. **Enter Candidate Code**: Type the 6-digit or 8-digit OTP code received from an authenticator app.
3. **Validate**: Click **Validate Token**. The engine compares the candidate code against the current counter and adjacent drift intervals ($pm 30$ seconds).

```text
Standard OTP URI Format (used in QR codes):
otpauth://totp/AcmeCorp:alice@example.com?secret=JBSWY3DPEHPK3PXP&issuer=AcmeCorp&algorithm=SHA1&digits=6&period=30
```

---

## 3. Cryptographic & Algorithmic Deep Dive

### The Mathematical Foundation of RFC 4226 (HOTP) and RFC 6238 (TOTP)
TOTP is an extension of event-based HOTP, substituting a monotonically increasing event counter with a 64-bit integer derived from current Unix epoch time:

$$T = \left\lfloor \frac{\text{Current Unix Time} - T_0}{X} \right\rfloor$$

Where $T_0 = 0$ and $X = 30$ seconds (the default time step).

#### 1. HMAC Generation
A message authentication digest is computed using the shared secret key $K$ and counter $T$:

$$\text{HS} = \text{HMAC-SHA-1}(K, T)$$

$\text{HS}$ produces a 20-byte (160-bit) hash digest.

#### 2. Dynamic Truncation (DT)
To extract a user-friendly 6-digit code, the algorithm takes the low-order 4 bits of the last byte to establish an offset index between 0 and 15:

$$\text{Offset} = \text{HS}[19] \;\&\; \text{0x0F}$$

Four sequential bytes starting at the offset are combined into a 31-bit unsigned integer:

$$\text{BinaryCode} = \big((\text{HS}[\text{Offset}] \;\&\; \text{0x7F}) \ll 24\big) \mid \big(\text{HS}[\text{Offset}+1] \ll 16\big) \mid \big(\text{HS}[\text{Offset}+2] \ll 8\big) \mid (\text{HS}[\text{Offset}+3])$$

#### 3. Modulo Reduction
The numeric code is extracted using modulo $10^d$, where $d$ is the desired code length (typically 6):

$$\text{OTP} = \text{BinaryCode} \pmod{10^d}$$

```typescript
// Implementation of Dynamic Truncation
function dynamicTruncation(hmacBytes: Uint8Array, digits = 6): string {
  const offset = hmacBytes[hmacBytes.length - 1] & 0x0f;
  const binary =
    ((hmacBytes[offset] & 0x7f) << 24) |
    ((hmacBytes[offset + 1] & 0xff) << 16) |
    ((hmacBytes[offset + 2] & 0xff) << 8) |
    (hmacBytes[offset + 3] & 0xff);

  const otp = binary % Math.pow(10, digits);
  return otp.toString().padStart(digits, '0');
}
```

---

## 4. Real-World Production Security Use Cases & Workflows

### 1. Multi-Factor Authentication Verification Endpoints
Web applications verify incoming 2FA codes during user login, applying clock drift tolerance to account for slight client-server time offsets:

```typescript
function verifyTOTPWithDrift(candidateCode: string, secret: string, window = 1): boolean {
  const currentTime = Math.floor(Date.now() / 1000);
  const timeStep = 30;
  const currentStep = Math.floor(currentTime / timeStep);

  for (let errorStep = -window; errorStep <= window; errorStep++) {
    const stepToCheck = currentStep + errorStep;
    const generatedCode = computeHOTP(secret, stepToCheck);
    if (generatedCode === candidateCode) {
      return true;
    }
  }
  return false;
}
```

### 2. Guarding Against Replay Attacks
Production authentication servers must record used OTP tokens in an in-memory cache (like Redis) with a TTL matching the validity window. If a user submits a valid code, that specific code-window combination is flagged to prevent replay attacks within the remaining time step.

---

## 5. Frequently Asked Questions (FAQs)

### Why is SHA-1 still widely used in TOTP implementations?
Although SHA-1 is deprecated for digital signatures due to collision attacks, RFC 6238 and RFC 4226 use SHA-1 inside HMAC. Collision attacks do not undermine HMAC security properties. Consequently, major authenticator apps (Google Authenticator, Microsoft Authenticator) maintain SHA-1 as their baseline standard for compatibility.

### What is the purpose of Base32 encoding in 2FA secrets?
Base32 uses a 32-character alphabet (`A-Z` and `2-7`), deliberately omitting visually ambiguous characters like `0` (zero), `O` (letter O), `1` (one), and `I` (letter I). This minimizes transcription errors when users manually type secret keys into their authenticator devices.

### How does the server handle clock drift between mobile devices and servers?
Production validation systems inspect a sliding window (typically $pm 1$ step, or $pm 30$ seconds). If the user's mobile device clock is up to 30 seconds ahead or behind the server's NTP clock, the token will still validate successfully.

### Does generating codes in this tool compromise my 2FA account?
No. All calculations are executed locally via JavaScript within your browser. Secret keys are never transmitted to any server or recorded in external storage.

---

## 6. Security and Privacy Guarantee
- **Local Client Processing**: Computation runs strictly inside your local browser sandbox.
- **Zero Remote Storage**: Seeds, keys, and tokens are never saved or transmitted across the network.
- **RFC Standard Compliance**: Adheres to RFC 4226 (HOTP) and RFC 6238 (TOTP) specifications.
