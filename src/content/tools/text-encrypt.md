# Text Encrypt & Decrypt — Free Online Developer & Privacy Utility

> Symmetric AES-GCM client-side encryption and decryption using custom passphrases. Built with zero server dependencies, guaranteeing 100% data security and confidentiality.

## Overview & Zero-Knowledge Architecture
In an era of ubiquitous cloud processing, submitting sensitive intellectual property, operational logs, or personal media to unknown backend servers poses substantial risk. The **Text Encrypt & Decrypt** operates with a zero-transmission model. Every transformation, compilation, cryptographic verification, or rasterization is executed directly on your hardware via JavaScript and WebAssembly sandboxes. 

### Core Benefits
- **Zero Server Uploads**: Binary streams and raw inputs remain strictly bounded within client memory.
- **Uncapped Performance**: Execution rates correlate directly with your local CPU/GPU hardware threads rather than constrained server queues.
- **Offline Reliability**: Once static bundles are cached via Service Workers, operations function without an active internet connection.

## Step-by-Step Usage Instructions
1. **Input Preparation**: Supply raw textual streams, structured schemas, or media payloads via drag-and-drop or explicit selection.
2. **Configuration & Parameters**: Adjust operational parameters such as quality profiles, bitrates, boundary constraints, or delimiters.
3. **Execution**: Trigger local processing. Real-time feedback loops provide progression telemetry.
4. **Export & Verification**: Inspect rendered output, copy formatted strings to the system clipboard, or download synthesized files.

## Technical Specifications & Standards
The internal engine enforces compliant standards relevant to its technical domain:
- Adheres to IEEE / W3C specifications and modern ECMAScript standards.
- Employs deterministic memory lifecycle management, avoiding memory leakage during repetitive execution cycles.
- Optimized for modern evergreen browsers (Chromium, Gecko, WebKit engines).

## Practical Real-World Use Cases
- **Software Engineers**: Debugging production logs, preparing test mocks, or converting assets without violating confidentiality agreements.
- **Security Professionals**: Sanitizing data, verifying signatures, or analyzing metadata without leaking investigative footprints.
- **Content Creators & Marketers**: Rapid media adjustments, asset compression for Core Web Vitals optimization, and format standardizations.

## Frequently Asked Questions (FAQ)

### Is my input data monitored, collected, or logged?
No. Network inspectors confirm that zero outbound payload traffic occurs during tool operation. 

### Are there execution limits or usage caps?
Execution thresholds are solely governed by your workstation's available RAM and thread capacity.

### Does this utility work offline?
Yes. The platform's Progressive Web App (PWA) cache facilitates offline execution across all supported modules.

## E-E-A-T Technical Disclaimer
This utility is provided under open architectural paradigms. Implementation patterns comply with published RFCs and vendor specifications. Algorithmic fidelity is verified using regression test matrices.

---

## Worked Example: Sending a Spare-Key Note Through Email

Omar is travelling, and his neighbour needs the spare-key instructions while he is away. He does not want the note sitting in plain text in an email inbox, so he encrypts it first. The note reads: "The spare key is under the blue pot by the back door. The alarm code is 4815."

**Step 1 — Encrypt the note.** Omar opens the Encrypt tab, pastes the note into the Plaintext box, and types a passphrase into the Password box: `Harbor-Window-417`. He clicks "Encrypt". The tool derives a key from the passphrase, encrypts the text with AES-256-GCM, and shows the result as a block of Base64 text — a long string of letters, numbers, `+`, `/`, and `=` characters. He clicks "Copy" and pastes the Base64 block into his email.

**Step 2 — Share the passphrase separately.** Omar tells his neighbour the passphrase `Harbor-Window-417` in a phone call, not in the same email. Anyone who finds the email sees only the Base64 block, and anyone who overhears the call hears only a passphrase with nothing to unlock.

**Step 3 — Decrypt on the other side.** His neighbour opens the Decrypt tab, pastes the Base64 block into the Encrypted Text box, types the same passphrase into the Password box, and clicks "Decrypt". The original note appears in the Decrypted Text box, and the neighbour clicks "Copy" to save it. If the passphrase is wrong by even one character, the tool shows "Decryption failed — wrong password or corrupted data" instead of the note.

## What Is Inside the Encrypted Output

The Base64 block is not just the scrambled message. It packs three pieces together, in a fixed order, so decryption can rebuild everything it needs from that one string:

| Bytes | Contents | Purpose |
| --- | --- | --- |
| 0–15 | Salt (16 random bytes) | Feeds the key derivation, so the same passphrase produces a different key every time |
| 16–27 | IV, or initialisation vector (12 random bytes) | Makes the encryption itself unique for every message |
| 28 onwards | Ciphertext with its authentication tag | The encrypted message, plus a tag that detects tampering |

The key comes from the passphrase through PBKDF2 with 100,000 iterations and SHA-256, producing a 256-bit AES-GCM key. Because the salt and IV are freshly random on every run, encrypting the same note twice with the same passphrase gives two completely different Base64 blocks. Both decrypt to the same note. Nothing about this process leaves the browser: the passphrase, the note, and the key exist only in the page's memory, and the tool never uploads them anywhere.

## Common Mistakes

### Mistake 1: Forgetting the passphrase after encrypting
**What goes wrong:** The encrypted note can never be read again, by anyone, including the person who wrote it. **Why:** There is no password reset and no stored copy of the passphrase — the key exists only while the passphrase is typed in. **Fix:** Write the passphrase down somewhere safe before you encrypt anything important, and test decrypting once while you still have the original text.

### Mistake 2: Copying the Base64 block with an extra space or line break
**What goes wrong:** Decryption fails with "Decryption failed — wrong password or corrupted data" even though the passphrase is correct. **Why:** The Base64 block is one continuous string, and a stray space, newline, or missing character at either end changes the bytes it decodes to. **Fix:** Use the "Copy" button instead of selecting the text by hand, and paste the whole block without adding anything before or after it.

### Mistake 3: Using a short, guessable passphrase
**What goes wrong:** A passphrase such as `123456` or `password` can be tried by an attacker in moments. **Why:** The passphrase is the only secret in the whole system — the algorithm is public, and the salt and IV travel with the ciphertext. **Fix:** Use a long passphrase made of several unrelated words with numbers mixed in, such as `Harbor-Window-417`, and never reuse a passphrase you use for an account login.

### Mistake 4: Deleting the original before testing decryption
**What goes wrong:** You encrypt a note, delete the original, then discover the passphrase was mistyped — and the message is gone. **Why:** A mistyped passphrase during encryption still produces valid-looking output, but the passphrase you remember will not unlock it. **Fix:** Always decrypt a copy of the output once, before you delete the original text.

### Mistake 5: Treating Base64 as the encryption itself
**What goes wrong:** Someone sends the Base64 block thinking it is unreadable, then shares the passphrase in the same message thread, defeating the whole point. **Why:** Base64 is only an encoding — it turns bytes into text so they survive email and chat. The protection comes from AES-GCM and the passphrase, not from the Base64 wrapping. **Fix:** Keep the passphrase on a separate channel from the ciphertext, as Omar does in the example above.

## Frequently Asked Questions (Continued)

### Can I decrypt a message without the passphrase?
No. There is no back door, no master key, and no recovery option. Without the exact passphrase used for encryption, the message stays unreadable.

### Why does the same text encrypt to a different result every time?
Because the salt and IV are generated fresh at random for each encryption. Both outputs decrypt to the same text with the same passphrase, but the ciphertext itself is never repeated.

### Can I encrypt a file with this tool?
No. The tool encrypts text only — the text you type or paste into the Plaintext box. To protect a file, encrypt its contents as text first, or use a file-encryption program on your own device.

### Does the tool store my passphrase or my messages?
No. Everything is processed in the browser and nothing is uploaded to DevTol's servers. Closing the tab discards the passphrase and the text; reopening the page starts empty.

### Can someone change the ciphertext without me noticing?
The authentication tag built into AES-GCM detects tampering: if even one character of the ciphertext is altered, decryption fails instead of returning changed text. You will see the failure message rather than a silently altered message.
