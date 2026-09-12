# Online URL Encoder & Decoder: RFC 3986 Percent-Encoding, Query Strings & URI Components

## 1. Quick Overview & Core Advantages
The **Online URL Encoder & Decoder** is a web utility designed to encode or decode Uniform Resource Identifiers (URIs), query string parameters, and URL path components in accordance with **RFC 3986**. It correctly handles percent-encoding for reserved characters, spaces, special symbols, and multi-byte UTF-8 sequences.

Operating under a strict **Zero-Knowledge Architecture: URLs, query parameters, authorization tokens, and API endpoints never leave local browser memory**. All parsing and character escaping routines execute directly inside your browser runtime. Sensitive API keys, session tokens, and internal redirect URLs remain completely confidential.

### Core Technical Advantages
- **Zero-Knowledge Processing**: All encoding and decoding occurs locally in browser memory.
- **Strict RFC 3986 Conformance**: Supports both standard URI encoding (`encodeURI`) and full component-level percent-encoding (`encodeURIComponent`).
- **Full UTF-8 Multi-Byte Support**: Correctly converts international characters, non-Latin alphabets, and emojis into valid percent-encoded octet sequences.
- **Bidirectional Transformation**: Seamlessly encode raw text strings or decode percent-escaped URLs back into human-readable text.

---

## 2. How to Use Step-by-Step Guide

### Encoding a URL or Component
1. **Enter String**: Input your URL or parameter text into the input field.
2. **Select Mode**:
   - **Full URI (`encodeURI`)**: Preserves protocol, host, and path delimiters (`:`, `/`, `?`, `#`).
   - **URI Component (`encodeURIComponent`)**: Encodes all reserved characters, ideal for query string values.
   - **RFC 3986 Strict**: Replaces spaces with `%20` and escapes additional reserved characters (`!`, `'`, `(`, `)`, `*`).
3. **Copy Output**: Click **Copy** to export the encoded string for your API requests or HTTP redirects.

### Decoding a Percent-Encoded URL
1. **Paste Encoded String**: Input the percent-encoded string (e.g., `https%3A%2F%2Fexample.com`).
2. **Decode**: The tool automatically processes percent tokens and restores original UTF-8 characters.
3. **Copy Result**: Export the clean URL.

```text
Encoding Comparison:
Input:  "https://example.com/search?q=hello world & dev=true"

Mode: encodeURI
Output: "https://example.com/search?q=hello%20world%20&%20dev=true"

Mode: encodeURIComponent
Output: "https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world%20%26%20dev%3Dtrue"
```

---

## 3. Algorithmic & Specification Deep Dive

### RFC 3986 Character Classes
RFC 3986 classifies characters into distinct groups:
1. **Unreserved Characters**: Characters that never require encoding:
   - Uppercase & lowercase letters (`A-Z`, `a-z`)
   - Digits (`0-9`)
   - Hyphen (`-`), Period (`.`), Underscore (`_`), Tilde (`~`)
2. **Reserved Characters**: Characters that serve as structural delimiters within a URI:
   - General delimiters: `:`, `/`, `?`, `#`, `[`, `]`, `@`
   - Sub-delimiters: `!`, `$`, `&`, `'`, `(`, `)`, `*`, `+`, `,`, `;`, `=`

#### Percent-Encoding UTF-8 Bytes
When a character falls outside the unreserved set, it is converted into its UTF-8 binary byte sequence, and each byte is represented by a percent sign (`%`) followed by two hexadecimal digits:

$$\text{Char} \xrightarrow{\text{UTF-8}} [B_1, B_2, \dots] \xrightarrow{\text{Hex}} \%H_1 \%H_2 \dots$$

For example, the Euro symbol `€` has UTF-8 representation `[0xE2, 0x82, 0xAC]`. Its percent-encoded representation is:

$$\text{€} \implies \%E2\%82\%AC$$

```typescript
// RFC 3986 Compliant Encoder
function rfc3986Encode(str: string): string {
  return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase();
  });
}
```

---

## 4. Real-World Production & API Use Cases

### 1. OAuth Redirect URI and State Encoding
In OAuth 2.0 authorization flows, the callback URL must be passed as a query parameter (`redirect_uri`). Proper component encoding prevents callback URLs with existing parameters from corrupting the outer authorization request.

### 2. Deep-Linking and Webhook Parameter Sanitation
Sanitize user-submitted search inputs, query parameters, and dynamic route variables before appending them to HTTP request URLs.

---

## 5. Frequently Asked Questions (FAQs)

### What is the difference between `encodeURI` and `encodeURIComponent`?
`encodeURI` is intended for full URLs and preserves structural delimiters like `:`, `/`, `?`, and `#`. In contrast, `encodeURIComponent` encodes all structural characters, making it suitable for sanitizing individual query parameter keys and values.

### Should spaces be encoded as `+` or `%20`?
In standard URI paths and modern RFC 3986 specifications, spaces are encoded as **`%20`**. The plus sign (`+`) is a historic convention used specifically in HTML form data (`application/x-www-form-urlencoded`). Using `%20` is recommended for general API parameters.

### How does the tool handle malformed percent sequences?
If a string contains an isolated percent sign or invalid hexadecimal sequence (e.g., `%ZZ`), the decoder catches the error and highlights the exact character position rather than failing silently.

### Is any of my URL data uploaded to an external server?
No. All character inspection, regex transformations, and percent-encodings run locally inside your browser memory.

---

## 6. Security and Privacy Guarantee
- **Local Browser Execution**: All parsing runs locally in client memory.
- **Zero Network Transmission**: URLs and parameters are never sent across the network.
- **RFC 3986 Standard Compliant**: Adheres strictly to IETF URI specifications.
