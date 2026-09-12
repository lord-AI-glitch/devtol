# Email Address Normalizer: Canonicalization Standards, RFC 5322 Parsing, Sub-Addressing Rules, and Fraud Prevention

## 1. Quick Overview & Core Advantages
The Email Address Normalizer is an enterprise-grade utility that transforms raw, user-submitted email addresses into their canonical, deduplicated, and standardized forms. Defined across Internet Engineering Task Force (IETF) specifications—including **RFC 5321 (SMTP)**, **RFC 5322 (Internet Message Format)**, and **RFC 6530/6531 (Internationalized Email)**—email addressing involves subtle domain-specific routing nuances that malicious actors, multi-accounting fraudsters, and duplicate sign-up bots exploit.

Popular Mail Transfer Agents (MTAs) and email providers like Google Gmail, Google Workspace, Microsoft Outlook/Hotmail, Fastmail, and ProtonMail implement unique internal mailbox routing rules:
- **Dot-Insensitivity**: Gmail ignores period (`.`) characters in the local-part (`john.doe@gmail.com` routes to the same mailbox as `johndoe@gmail.com`).
- **Plus-Addressing / Sub-Addressing**: Providers allow tags appended with a plus sign (`john+promo@gmail.com` routes to `john@gmail.com`).
- **Domain Aliasing**: `googlemail.com` and `gmail.com` share the same global namespace.

### Core Architectural Advantages
- **100% In-Browser Zero-Knowledge Processing**: All string parsing, Unicode normalization, regex matching, and provider-specific normalization logic run entirely in the client-side JavaScript engine. No customer email addresses, lead lists, or user identities are ever uploaded or transmitted across external networks.
- **Sybil & Fraud Defense for User Registrations**: Prevents users from abusing free trial promotions, promotional discount codes, or voting systems by creating thousands of alias variations pointing to the same single physical inbox.
- **RFC-Compliant Punycode & IDN Handling**: Fully normalizes Internationalized Domain Names (IDN) with Unicode normalization forms (NFC/NFKC) and Punycode conversions according to RFC 5891.

---

## 2. Step-by-Step Custom Configuration Guide
Standardizing email addresses requires distinguishing between universal RFC canonical rules and provider-specific mailbox routing heuristics.

### Step 1: Universal Canonical Rules (RFC 5321 / 5322)
1. **Trim Whitespace**: Remove leading, trailing, and invisible zero-width unicode characters.
2. **Domain Lowercasing**: Per RFC 5321 Section 2.3.5, the domain part of an email address is strictly case-insensitive (`EXAMPLE.COM` $\equiv$ `example.com`).
3. **Punycode Conversion**: Convert non-ASCII domain characters (e.g., `münchen.de`) to ASCII Compatible Encoding (`xn--mnchen-3ya.de`).

### Step 2: Provider-Specific Rules Engine
Below is a production-ready TypeScript implementation of the multi-provider normalization pipeline:

```typescript
export interface NormalizationOptions {
  removeDotsGmail?: boolean;
  removeSubaddressing?: boolean;
  normalizeGooglemail?: boolean;
  normalizeFastmail?: boolean;
  normalizeHotmail?: boolean;
}

export function normalizeEmail(
  rawEmail: string,
  options: NormalizationOptions = {
    removeDotsGmail: true,
    removeSubaddressing: true,
    normalizeGooglemail: true,
    normalizeFastmail: true,
    normalizeHotmail: true
  }
): string {
  if (!rawEmail || typeof rawEmail !== "string") {
    throw new Error("Invalid email input.");
  }

  // 1. Trim whitespace and control characters
  let email = rawEmail.trim().toLowerCase();

  // 2. Validate basic structure
  const atIndex = email.lastIndexOf("@");
  if (atIndex <= 0 || atIndex === email.length - 1) {
    throw new Error("RFC 5322 syntax error: Missing '@' or empty parts.");
  }

  let localPart = email.slice(0, atIndex);
  let domainPart = email.slice(atIndex + 1);

  // 3. Domain Aliasing & Normalization
  if (options.normalizeGooglemail && domainPart === "googlemail.com") {
    domainPart = "gmail.com";
  }

  // 4. Provider-Specific Local Part Logic
  const isGmail = domainPart === "gmail.com" || domainPart === "googlemail.com";
  const isMicrosoft = ["outlook.com", "hotmail.com", "live.com", "msn.com"].includes(domainPart);
  const isFastmail = domainPart === "fastmail.com" || domainPart.endsWith(".fastmail.com");
  const isProton = ["proton.me", "protonmail.com", "pm.me"].includes(domainPart);

  // Strip sub-addressing (+tag or -tag)
  if (options.removeSubaddressing) {
    if (isGmail || isMicrosoft || isProton) {
      const plusIndex = localPart.indexOf("+");
      if (plusIndex !== -1) {
        localPart = localPart.slice(0, plusIndex);
      }
    } else if (isFastmail && options.normalizeFastmail) {
      // Fastmail supports both username+tag and tag@username.fastmail.com
      const plusIndex = localPart.indexOf("+");
      if (plusIndex !== -1) {
        localPart = localPart.slice(0, plusIndex);
      }
    }
  }

  // Strip dots for providers that ignore periods
  if (options.removeDotsGmail && isGmail) {
    localPart = localPart.replace(/\./g, "");
  }

  return `${localPart}@${domainPart}`;
}

// Example Execution:
// Input: "  John.Doe+Newsletter@GoogleMail.COM  "
// Output: "johndoe@gmail.com"
```

---

## 3. Algorithmic Principles, RFC Specifications & Edge Cases

### The RFC 5321 Local-Part Case-Sensitivity Paradox
Under strict RFC 5321 guidelines:
- **Domain-Part**: Strictly case-insensitive. `example.com` and `EXAMPLE.COM` are identical.
- **Local-Part**: Formally defined as case-sensitive! Technically, an RFC-compliant SMTP server could deliver mail for `User@example.com` and `user@example.com` to two different physical mailboxes.

In real-world practice, however, virtually zero modern commercial email service providers treat the local-part as case-sensitive. Treating the local-part as case-sensitive in web authentication leads to customer support complaints, duplicate account lockouts, and authentication failures. Modern identity platforms standardize on lowercasing the full address during account creation.

### The Attack Vector: Sybil Attacks & Voucher Abuse
Without email normalization, bad actors programmatically exploit mailbox alias permutations:

$$\text{Total Aliases with Dots} = 2^{L - 1}$$
Where $L$ is the character length of the local part. For a 10-character username like `abcdefghij`, there are $2^9 = 512$ dot variations. When combined with arbitrary sub-addressing tags (`+promo1`, `+promo2`), a single attacker can create hundreds of thousands of registered accounts in a web service, exhausting promotion budgets, skewing referral campaigns, and bypassing rate limiters.

```
Attacker Inbox: victim@gmail.com
       |
       +---> v.ictim@gmail.com        (Account #1 - Claims $10 credit)
       +---> vi.ctim@gmail.com        (Account #2 - Claims $10 credit)
       +---> vic.tim@gmail.com        (Account #3 - Claims $10 credit)
       +---> victim+bot1@gmail.com    (Account #4 - Claims $10 credit)
       +---> victim+bot2@googlemail.com (Account #5 - Claims $10 credit)
```

All 5 accounts receive activation emails in the exact same Gmail inbox, bypassing basic duplicate email checks (`WHERE email = ?`). Normalization collapses all five entries back to the primary canonical address `victim@gmail.com`.

---

## 4. Production Architecture & Database Schema Integration

### Enterprise Identity & Registration Pipeline
In modern SaaS, e-commerce, and fintech architectures, systems store both the user's preferred display email and the normalized canonical identity:

```
[Client Registration Form]
            |
            v
[API Gateway: POST /api/v1/auth/register]
            |
            +---> Compute Canonical Hash (HMAC-SHA256)
            |
            v
[PostgreSQL Database: Users Table]
----------------------------------------------------------------
id                  : 8a4c11b2-2cf4-4b52-9721-3950f1d07c08
display_email       : Jane.Doe+Billing@GoogleMail.com
normalized_email    : janedoe@gmail.com
email_hash          : e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b...
----------------------------------------------------------------
            |
    [UNIQUE INDEX on normalized_email]
            |
            +---> Error: 409 Conflict ("Account already registered")
```

### PostgreSQL Migration Pattern
```sql
-- Migration: Add normalized email constraints
ALTER TABLE users ADD COLUMN normalized_email VARCHAR(255);

-- Populate existing rows
UPDATE users 
SET normalized_email = LOWER(REGEXP_REPLACE(SPLIT_PART(email, '@', 1), '\+.*', '')) || '@' || LOWER(SPLIT_PART(email, '@', 2));

-- Enforce strict uniqueness to block multi-accounting
CREATE UNIQUE INDEX idx_users_normalized_email ON users (normalized_email);
```

---

## 5. Frequently Asked Questions (FAQs)

### Does normalizing an email address prevent legitimate users from receiving emails?
When normalizing emails for duplicate account prevention and security indexing, you should always keep the user's originally typed email as their `display_email` for outgoing communication. When dispatching transactional order receipts or password reset links, deliver to the user's `display_email` so their email inbox filters (e.g., mail filtered by `+receipts`) continue to function as expected.

### Can custom domains hosted on Google Workspace (G Suite) be safely normalized for dots?
Yes. Google Workspace business accounts running on custom corporate domains (`@company.com`) adhere to the exact same dot-insensitivity rules as consumer `@gmail.com` accounts. However, determining whether a custom domain is hosted on Google Workspace requires an MX DNS lookup (`aspmx.l.google.com`). For client-side tools running without server DNS access, dot-stripping is conservatively applied only to verified `@gmail.com` and `@googlemail.com` domains unless custom MX checks are configured.

### What is the difference between RFC 5322 and RFC 6531 regarding Unicode emails?
- **RFC 5322**: Specifies legacy ASCII-only email formatting. Any international characters in the mailbox name require quoting or are disallowed.
- **RFC 6531 (SMTP Extension for Internationalized Email / EAI)**: Permits UTF-8 characters directly in the local part (e.g., `用户@example.com` or `θ@example.com`). When normalizing EAI addresses, apply Unicode Normalization Form KC (NFKC) before comparison to prevent visual homoglyph attacks.

### Why do some websites reject the plus sign (`+`) in email addresses?
Many legacy web forms and poorly written regular expressions (`/^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/`) incorrectly assume the local part cannot contain special characters like `+`, `.`, `_`, or `-`. According to RFC 5322 Section 3.2.3, the plus sign is a completely valid character within the local-part. Rejecting plus signs is bad UX; rather than blocking valid inputs, systems should accept the address and normalize it internally.

---

## 6. Client-Side Privacy & Security Guarantee
This Email Normalizer tool operates with **100% zero-server transmission**:
- Every regex execution, string mutation, and canonical hash calculation executes locally inside your web browser.
- No email addresses entered into the interface are tracked, stored in analytics databases, or shared with third-party marketers.
- You can safely inspect large enterprise mailing lists with complete assurance of data confidentiality and GDPR compliance.
