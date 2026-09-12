# PDF Password Protect & Unlock — Free Online PDF Security Tool

> Add user and owner passwords to PDF files, or remove password protection — all processed locally in your browser. Your documents never leave your device.

## Introduction: Why PDF Security Matters

PDF security serves two purposes: confidentiality (preventing unauthorized viewing) and rights management (controlling what authorized users can do — print, copy, edit). Our PDF Protect tool applies password protection directly in your browser using pdf-lib, with no remote processing.

## How to Protect a PDF with a Password

1. **Select the "Protect PDF" tab**.
2. **Upload your PDF** file.
3. **Enter a User Password** — this must be entered to open the document.
4. **Enter an Owner Password** (optional) — this grants full administrative access and can be different from the user password.
5. **Click "Protect & Download"** — the secured PDF is saved to your device.

## Understanding PDF Permission Levels

PDF security operates at two permission levels:

| Permission Level | Description |
|-----------------|-------------|
| **User Password** | Required to open and view the document |
| **Owner Password** | Required to change security settings, edit, or extract content |
| **Print Permission** | Controls whether the document can be printed |
| **Copy Permission** | Controls whether text can be selected and copied |

## Technical Process: PDF Encryption

PDF encryption in the browser uses pdf-lib's built-in encryption capabilities:

1. **Password Hashing**: The user and owner passwords are processed through the PDF encryption algorithm (RC4 or AES depending on PDF version).
2. **Permission Flags**: A 32-bit permission integer encodes which operations are allowed.
3. **Encryption**: The document content streams are encrypted using the derived key.
4. **Output**: The encrypted PDF is saved with an `/Encrypt` dictionary in its trailer.

**Important Note**: Client-side PDF encryption provides protection against casual access. For legally certified, high-security document protection, use dedicated tools like Adobe Acrobat Pro or server-side encryption with AES-256.

## Real-World Use Cases

### Confidential Business Documents — Protect financial reports, strategic plans, and HR documents before distribution.
### Legal Submissions — Add read-only protection to contracts sent for signature to prevent unauthorized modification.
### Educational Materials — Protect copyrighted course materials from copying while allowing printing.
### Personal Privacy — Secure PDFs containing personal information like tax returns, medical records, or identity documents.
### Client Deliverables — Protect design mockups, reports, and creative work sent to clients.

## Frequently Asked Questions

### Can I unlock a PDF I own but forgot the password to?
This tool does not include brute-force decryption. For legitimate document recovery, specialized tools or the original document author may be needed.
### Is the encryption strong enough for sensitive business documents?
For everyday confidentiality, yes. For highly regulated industries (healthcare, finance, government), use certified solutions with AES-256 encryption and digital signatures.
### Can I set different passwords for viewing and editing?
Yes — set a User Password for viewing and a different, stronger Owner Password to prevent editing.
### Will the protected PDF work in all PDF readers?
Yes. Password-protected PDFs are supported by all major PDF viewers including Adobe Acrobat, macOS Preview, Foxit Reader, and browser-based viewers.

## Technical Verification & E-E-A-T Disclaimer

Built on pdf-lib (MIT license). PDF security implementation follows ISO 32000-1:2008 Section 7.6 (Encryption). For maximum security requirements, supplement with server-side AES-256 encryption and digital certificate signing.
