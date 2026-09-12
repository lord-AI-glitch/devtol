# Online Password Strength Analyser: Entropy Measurement, Zxcvbn Modeling & Credential Security

## 1. Quick Overview & Core Advantages
The **Online Password Strength Analyser** is an advanced credential auditing and entropy estimation utility designed to evaluate the strength and cracking complexity of passwords. Standard password meters rely on superficial heuristics (such as checking for uppercase letters, numbers, and symbols). In contrast, this utility applies information theory, Shannon entropy calculations, dictionary matching, spatial keyboard pattern detection, and NIST SP 800-63B guidelines.

Operating under a strict **Zero-Knowledge Architecture: candidate passwords, dictionary lookups, and entropy calculations never leave local browser memory**. Password strings are analyzed entirely inside your browser's client-side runtime. No keystrokes, hashes, or evaluation scores are ever transmitted to external servers, protecting critical credentials during password testing and security reviews.

### Core Technical Advantages
- **Zero-Knowledge Processing**: Passwords remain isolated inside local browser memory with zero network exposure.
- **Shannon Entropy Calculation**: Computes mathematical entropy bits ($H$) based on effective character sets and length.
- **Pattern & Dictionary Recognition**: Detects spatial keyboard walks (e.g., `qwerty`, `123456`), repeat sequences, l33t-speak substitutions, and common name dictionaries.
- **Realistic Brute-Force Time Modeling**: Estimates cracking duration across multiple threat models—from fast offline GPU clusters ($10^{11}$ hashes/sec) to slow web rate-limited online attacks ($10$ attempts/sec).

---

## 2. How to Use Step-by-Step Guide

### Analyzing a Password
1. **Enter Candidate String**: Type or paste a password into the input field.
2. **Review Real-Time Score**: Instantly observe the visual strength rating (from Score 0: Very Weak to Score 4: Strong).
3. **Inspect Entropy Metrics**: View the calculated bits of entropy, character pool distribution, and total search space combinations.
4. **Evaluate Attack Scenarios**: Check realistic time-to-crack estimates across various adversary profiles (Online unthrottled, Online throttled, Offline slow hash, and Offline fast hash).
5. **Implement Recommendations**: Review actionable guidance on addressing common dictionary patterns, predictable sequences, or insufficient length.

```text
Score Overview (NIST & Industry Standard):
[█░░░░] Score 0: Risky (< 28 bits entropy) - Instant crack
[██░░░] Score 1: Very Weak (28-35 bits)    - Seconds to minutes
[███░░] Score 2: Moderate (36-59 bits)     - Hours to days
[████░] Score 3: Strong (60-127 bits)      - Decades to centuries
[█████] Score 4: Uncrackable (128+ bits)   - Universally resilient
```

---

## 3. Cryptographic & Algorithmic Deep Dive

### Information Theory & Shannon Entropy
Entropy quantifies the uncertainty and unpredictability of a password string. For a password of length $L$ drawn from an alphabet of $R$ equally likely unique characters, the raw search space size is $S = R^L$. The theoretical maximum entropy in bits is:

$$H = \log_2(S) = L \cdot \log_2(R)$$

Common character pool sizes ($R$):
- Numeric digits (`0-9`): $R = 10$ ($\approx 3.32$ bits/char)
- Lowercase letters (`a-z`): $R = 26$ ($\approx 4.70$ bits/char)
- Alphanumeric (`a-z, A-Z, 0-9`): $R = 62$ ($\approx 5.95$ bits/char)
- Full ASCII Printable: $R = 95$ ($\approx 6.57$ bits/char)

### Realistic Password Modeling: The zxcvbn Paradigm
Raw Shannon entropy assumes every character in the alphabet is selected with equal probability. In practice, human-chosen passwords display predictable patterns. Modern password strength analysis combines dictionary matching with recursive graph searches:

$$C_{\text{guesses}} = \sum_{m \in \text{Matches}} C(m)$$

Where:
- **Dictionary Matches**: Common English words, names, and breached lists are given minimal guess costs regardless of length (e.g., `password` requires only $\approx 10$ guesses).
- **Spatial Walks**: Adjacent keys on QWERTY keyboards (e.g., `qazwsx`) are identified and evaluated based on path complexity.
- **L33t Transformations**: Substitutions like `@` for `a` or `0` for `o` are recognized and mapped to baseline dictionary entries.

```typescript
// Simplified Entropy Calculation
function calculateRawEntropy(password: string): number {
  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 33;

  if (poolSize === 0 || password.length === 0) return 0;
  return password.length * Math.log2(poolSize);
}
```

---

## 4. Real-World Production Security Use Cases & Workflows

### 1. Client-Side Registration Validation (NIST SP 800-63B)
Modern security guidelines discourage arbitrary composition rules (e.g., requiring at least one symbol and number) because they encourage predictable patterns (like capitalizing the first letter and appending `1!`). Instead, applications enforce length ($\ge 12$ characters) and verify against breached dictionaries:

```typescript
function validateRegistrationPassword(password: string) {
  if (password.length < 12) {
    return { valid: false, error: 'Password must be at least 12 characters long.' };
  }
  const entropy = calculateRawEntropy(password);
  if (entropy < 50) {
    return { valid: false, error: 'Password pattern is too predictable.' };
  }
  return { valid: true };
}
```

### 2. Password Health Auditing for Corporate Access
Security administrators run internal password health checks on team credentials to identify weak or compromised passphrases before deploying single sign-on (SSO) configurations.

---

## 5. Frequently Asked Questions (FAQs)

### Why are traditional composition rules (uppercase + number + symbol) considered outdated?
NIST SP 800-63B emphasizes that strict composition rules lead users to adopt predictable transformations (e.g., replacing `e` with `3` or appending `!` to the end). Longer passphrases (15+ characters) formed from random words offer significantly higher entropy and usability.

### How are time-to-crack estimates calculated?
Cracking times are calculated by dividing the estimated guess space by attack speed:
- **Online Attack (Throttled)**: 10 attempts per minute (with account lockouts).
- **Offline Fast Hash (SHA-256 / MD5)**: $10^{11}$ guesses per second on multi-GPU cracking hardware.
- **Offline Slow Hash (Bcrypt / Argon2)**: $10^4$ guesses per second.

### What is the difference between entropy and brute-force time?
Entropy measures the mathematical information density of a string, while brute-force time translates that entropy into practical duration depending on the cryptographic hashing algorithm used by the server.

### Does this tool send passwords to an external server or API?
No. The analyzer is executed completely in your local browser using client-side JavaScript. No passwords, tokens, or evaluation results are ever sent across the network.

---

## 6. Security and Privacy Guarantee
- **Strictly Client-Side**: All analysis, dictionary checks, and entropy calculations occur locally.
- **No Remote Telemetry**: Zero analytics, external network calls, or logging.
- **NIST Aligned**: Evaluated against modern NIST SP 800-63B digital identity guidelines.
