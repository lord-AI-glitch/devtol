# Online URL Encoder & Decoder: RFC 3986 Percent-Encoding, Query Strings & URI Components

## 1. Quick Overview & Core Advantages
The **Online URL Encoder & Decoder** is a web utility designed to encode or decode Uniform Resource Identifiers (URIs), query string parameters, and URL path components in accordance with **RFC 3986**. It correctly handles percent-encoding for reserved characters, spaces, special symbols, and multi-byte UTF-8 sequences.

Everything runs locally in your browser: URLs, query parameters, authorization tokens, and API endpoints never leave local browser memory. All parsing and character escaping routines execute directly inside your browser runtime.

### Core Technical Advantages
- **Local Processing**: All encoding and decoding occurs locally in browser memory.
- **Component Encoding Only**: The tool runs `encodeURIComponent` / `decodeURIComponent` on the whole input. There is no `encodeURI` mode, so a full URL gets its `:`, `/`, `?`, and `#` encoded too.
- **Full UTF-8 Multi-Byte Support**: Correctly converts international characters, non-Latin alphabets, and emojis into valid percent-encoded octet sequences.
- **Bidirectional Transformation**: Seamlessly encode raw text strings or decode percent-escaped URLs back into human-readable text.

---

## 2. How to Use Step-by-Step Guide

### Encoding a URL or Component
1. **Enter String**: Input your URL or parameter text into the input field.
2. **Read the Output**: The whole input is encoded as a single URI component — every reserved character is percent-encoded, including the `:` and `/` of a full URL. Spaces become `%20`. One detail: `encodeURIComponent` leaves `!'()*` unescaped.
3. **Copy Output**: Click **Copy** to export the encoded string for your API requests or HTTP redirects.

### Decoding a Percent-Encoded URL
1. **Paste Encoded String**: Input the percent-encoded string (e.g., `https%3A%2F%2Fexample.com`).
2. **Decode**: The tool automatically processes percent tokens and restores original UTF-8 characters.
3. **Copy Result**: Export the clean URL.

```text
Encoding Example (encodeURIComponent — the tool's only mode):
Input:  "hello world & dev=true"
Output: "hello%20world%20%26%20dev%3Dtrue"

Input:  "https://example.com/search?q=hello world"
Output: "https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world"
```

There is no `encodeURI` mode: a full URL encoded as one component loses its structure — to keep the structure, encode each query value separately and assemble the URL yourself.

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

The tool calls `encodeURIComponent` directly — there is no extra strict-encoding step. That is why `!'()*` stay unescaped in the output, even though RFC 3986 lists them as sub-delimiters. The percent-encoding itself still works the same way: each character outside the unreserved set is converted to its UTF-8 bytes, and each byte becomes `%` plus two hex digits.

---

## 4. Real-World Production & API Use Cases

### 1. OAuth Redirect URI and State Encoding
In OAuth 2.0 authorization flows, the callback URL must be passed as a query parameter (`redirect_uri`). Proper component encoding prevents callback URLs with existing parameters from corrupting the outer authorization request.

### 2. Deep-Linking and Webhook Parameter Sanitation
Sanitize user-submitted search inputs, query parameters, and dynamic route variables before appending them to HTTP request URLs.

---

## 5. Frequently Asked Questions (FAQs)

### Does the tool offer an `encodeURI` mode for full URLs?
No. The tool always encodes the whole input as one component, so the `:`, `/`, `?`, and `#` of a full URL are percent-encoded too. `encodeURI` — the JavaScript function that preserves those delimiters — is not used here. To encode a full URL and keep its structure, encode each query value separately and assemble the URL yourself.

### Should spaces be encoded as `+` or `%20`?
In standard URI paths and modern RFC 3986 specifications, spaces are encoded as **`%20`**. The plus sign (`+`) is a historic convention used specifically in HTML form data (`application/x-www-form-urlencoded`). Using `%20` is recommended for general API parameters.

### How does the tool handle malformed percent sequences?
If a string contains an isolated percent sign or invalid hexadecimal sequence (e.g., `%ZZ`), decoding fails: the tool shows an empty output and the generic validation message `Impossible to parse this string`. No character position is reported.

### Is any of my URL data uploaded to an external server?
No. All character inspection, regex transformations, and percent-encodings run locally inside your browser memory.

---

## 6. Security and Privacy Guarantee
- **Local Browser Execution**: All parsing runs locally in client memory.
- **Zero Network Transmission**: URLs and parameters are never sent across the network.
- **Component Encoding**: The whole input is encoded as a single URI component with `encodeURIComponent`.

---

## 7. Worked Examples: Real Encodings

The tool has a single encode mode — component encoding — and a single decode mode. The examples below are the tool's actual output.

### Encoding

```text
Input:   "Hello world :)"
Output:  "Hello%20world%20%3A)"

Input:   "https://example.com/search?q=hello world & dev=true"
Output:  "https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world%20%26%20dev%3Dtrue"
```

Notice the second example: the whole URL, including `:` and `/`, is encoded, because component encoding treats the input as one value, not as a URL with structure. When you build a query string, encode each value on its own and leave the `?`, `=`, and `&` structure untouched.

### Non-ASCII characters

Multi-byte characters become one `%XX` group per UTF-8 byte:

```text
Input:   "€"
Output:  "%E2%82%AC"

Input:   "🚀"
Output:  "%F0%9F%9A%80"
```

The characters `!'()*` and `~` are left unescaped by component encoding, so they appear unchanged in the output.

### Decoding and malformed input

Decoding reverses the process: `Hello%20world%20%3A)` decodes back to `Hello world :)`. A malformed sequence such as `%ZZ`, or a lone `%` with no hex digits after it, fails to decode: the decoder throws a `URI malformed` error, the tool shows an empty output, and the validation message reads `Impossible to parse this string`.

### Encoding one query value

The common real-world job is encoding a single value to drop into a query string. For the value `hello world & dev=true`, the tool gives:

```text
hello%20world%20%26%20dev%3Dtrue
```

Appending that to `https://example.com/search?q=` produces a valid URL whose `q` parameter reads back as the original text. The `&` inside the value becomes `%26`, so it cannot split the query string, and the `=` becomes `%3D`, so it cannot start a second parameter. If you instead encoded the whole URL, the `?` and `=` of the outer structure would be encoded too, and the result would no longer work as a link — which is why values are encoded one at a time.
