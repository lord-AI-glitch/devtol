# Online String Obfuscator: Character Masking for Secrets & Emails

## 1. Quick Overview & Core Advantages
The **Online String Obfuscator** is a security utility designed to mask strings, email addresses, and sensitive tokens so they can be shared or displayed without exposing them in full. It works by position: it keeps a chosen number of leading and trailing characters and replaces everything else with `*`.

Everything runs locally in your browser: raw inputs and masked outputs never leave local browser memory. There is no key and nothing to decode — the masked characters are replaced, not encoded.

### Core Technical Advantages
- **Local Processing**: Masking happens entirely on your machine; no data is sent to external servers.
- **One Strategy — Position Masking**: Keep the first N and last N characters, mask the rest with `*`. The defaults keep 4 and 4, and both numbers are adjustable from 0 up.
- **Bot & Scraper Defense**: A masked email or key cannot be harvested as written — the hidden characters are gone from the output, not just hidden behind an encoding.
- **One-Way Masking**: The output cannot be decoded back. Masked characters are replaced with `*` and are unrecoverable from the output — unlike an encoding, there is nothing to reverse.

---

## 2. How to Use Step-by-Step Guide

### Obfuscating a String or Code Secret
1. **Input Raw String**: Paste the secret text, email address, or token into the input area.
2. **Set How Much to Keep**: Adjust **Keep first** and **Keep last** (both default to 4; set both to 0 to mask everything — setting only one end to 0 masks only that end) and the **Keep spaces** switch (on by default — spaces survive masking while it is on).
3. **Read the Masked Output**: The result updates live as you type; there is no button to press.
4. **Copy Output**: Copy the masked string for wherever it needs to go.

```text
Masking Example (defaults — keep first 4, keep last 4, keep spaces on):
Raw Input:  "4111 2222 3333 4444"
Masked:     "4111 **** **** 4444"

Raw Input:  "hunter2-secret"
Masked:     "hunt******cret"
```

---

## 3. Cryptographic & Algorithmic Deep Dive

### Obfuscation vs. Encryption: Critical Distinction
It is critical to distinguish between **obfuscation** and **cryptographic encryption**:
- **Encryption**: Guarantees confidentiality against adversaries lacking a private decryption key. Security relies on the key, not the algorithm.
- **Obfuscation**: Transforms data to make it harder for automated bots or casual observers to read — but the kept characters and the total length stay visible, so it is not a substitute for real secrecy.

$$\text{Obfuscation} \neq \text{Cryptographic Security}$$

### How the Mask Is Applied

Masking is positional across the whole string: a character survives if its index is within the first N characters or the last N characters — or if it is a space and Keep spaces is on. Everything else becomes `*`. There is no key, no byte array, and no decoder snippet: the hidden characters are simply gone. The tool opens with keep-first 4, keep-last 4, and keep-spaces on.

```typescript
// The tool's entire masking logic (string-obfuscator.model.ts)
function obfuscateString(
  str: string,
  { replacementChar = '*', keepFirst = 4, keepLast = 0, keepSpace = true } = {}
): string {
  return str
    .split('')
    .map((char, index, array) => {
      if (keepSpace && char === ' ') {
        return char;
      }
      return (index < keepFirst || index >= array.length - keepLast) ? char : replacementChar;
    })
    .join('');
}
```

---

## 4. Real-World Production & Web Defense Use Cases

### 1. Web Email Scraping Protection
Web scrapers scan raw HTML for `mailto:` tags and email regex patterns (`[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}`). Masking an address — `info@example.com` becomes `info********.com` with the defaults — leaves too little of the address for a regex to match, while a human reader still recognises whose address it is.

### 2. Client-Side Analytics Token Masking
Mask a key before pasting it into a public issue, a screenshot, or a shared log, so the full value never leaves your machine in readable form. Remember the kept characters stay visible — masking is for casual exposure, not for protecting a live secret.

---

## 5. Frequently Asked Questions (FAQs)

### Can obfuscated strings be reverse-engineered?
No — not from the masked output alone. The hidden characters are replaced with `*` and are gone; there is no key or decoder that brings them back. But the kept characters and the total length stay visible, so a short secret can still be guessed — and a real secret never belongs in frontend code, masked or not.

### What does the Keep spaces switch do?
With it on (the default), spaces are never masked — `Lorem ipsum dolor sit amet` keeps its word gaps. With it off, spaces are masked like any other character.

### Can I change the replacement character?
No. Masked characters always become `*` — the tool exposes no control for the replacement character.

### Are my strings sent to a third-party server during obfuscation?
No. All masking occurs locally within your browser runtime.

---

## 6. Security and Privacy Guarantee
- **Local Browser Execution**: All transformations occur inside client memory.
- **Zero Network Transmission**: Raw and obfuscated strings are never sent across the network.
- **Ephemeral Processing**: Inputs and outputs are cleared immediately upon tab closure.

---

## 7. Worked Examples: Real Masked Output

The tool masks by position: it keeps a number of leading and trailing characters and replaces everything else with `*`. The defaults keep the first 4 and the last 4 characters and leave spaces alone.

### The default example

The tool opens with `Lorem ipsum dolor sit amet` already loaded, and with the default settings it displays:

```text
Lore* ***** ***** *** amet
```

Masking is positional across the whole string, not per word: only the first four characters (`Lore`) and the last four (`amet`) survive, so `ipsum`, `dolor`, and `sit` are fully masked. Spaces survive because the keep-spaces switch is on.

### An email address and a secret

```text
Input:   "info@example.com"   (keep first 4, keep last 4)
Output:  "info********.com"

Input:   "api_secret_key_2026"   (keep first 4, keep last 4)
Output:  "api_***********2026"
```

The masked middle hides the length only partially: the total length is still visible, and the kept characters are shown in plain text.

### Turning the controls to their extremes

Setting keep-first and keep-last both to `0` masks the whole string: `secret` becomes `******`. With both at `0`, switching keep-spaces off masks spaces too, so `a b c` becomes `*****` instead of keeping its two spaces. Masking hides text from casual readers and simple scrapers, but anyone who can see the output can still guess at the hidden part from its length and the visible characters — it is not encryption, and a real secret still does not belong in frontend code.
