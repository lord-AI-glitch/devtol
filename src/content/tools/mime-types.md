# MIME Types: IANA Media Types, HTTP Content Negotiation & Security Headers

## 1. Quick Overview & Core Advantages
Multipurpose Internet Mail Extensions (MIME) types—standardized by the IETF in **RFC 2045**, **RFC 2046**, and updated in **RFC 6838** and **RFC 9110** as **Media Types**—are two-part identifiers that define the format, encoding, and intended processing pipeline of digital documents transmitted across networks. When a web server dispatches a resource over HTTP, the `Content-Type` header instructs the client browser or API consumer whether to execute the file as JavaScript, render it as HTML, display it as an SVG image, or stream it as WebM audio.

Our client-side **MIME Types Reference & Lookup Tool** provides an instant, searchable directory of hundreds of standard IANA-registered media types, file extensions, and HTTP header security best practices.

### Core Advantages & Zero-Knowledge Architecture
- **100% Client-Side Search**: Lookup queries, file extension checks, and header configurations are performed locally within your browser's memory without external telemetry.
- **Authoritative IANA & RFC Registry**: Covers top-level media trees (`application/`, `text/`, `image/`, `audio/`, `video/`, `font/`, `multipart/`, and `model/`).
- **Critical Security Insights**: Features actionable guidance on preventing MIME-sniffing vulnerabilities using `X-Content-Type-Options: nosniff` and configuring proper charset directives (`charset=utf-8`).

---

## 2. Step-by-Step Usage Guide

### Searching MIME Types & File Extensions
1. **Search by Extension or Type**: Enter a file extension (e.g., `.wasm`, `.webp`, `.json`, `.csv`) or a media type string (e.g., `application/pdf`, `audio/ogg`).
2. **Review Detailed Metadata**:
   - **MIME / Media Type**: Official two-part type identifier (`type/subtype`).
   - **Associated Extensions**: Common file suffixes mapped to this format.
   - **RFC Specification**: The underlying IETF RFC governing parsing and serialization.
   - **Binary vs. Text**: Indicates whether the stream requires binary transfer or textual character encoding.
3. **Configure Server Headers**: Copy ready-to-use configuration directives for Nginx, Apache (`mime.types`), Cloudflare Rules, or Express.js middleware.

### Example: Common Web Media Types
```http
# Modern Web Static Asset Configurations
Content-Type: text/html; charset=utf-8
Content-Type: application/json; charset=utf-8
Content-Type: text/javascript; charset=utf-8
Content-Type: image/avif
Content-Type: application/wasm
```

---

## 3. Technical Deep-Dive: RFC 6838 Structure & Content Negotiation

### Media Type Grammar (RFC 6838)
A formal media type follows the ABNF grammar:
```
media-type = type "/" [tree "."] subtype ["+" suffix] [*(";" parameter)]
```
- **Type**: Primary categorization (`application`, `audio`, `font`, `example`, `image`, `message`, `model`, `multipart`, `text`, `video`).
- **Subtype Trees**:
  - *Standard Tree*: No prefix (e.g., `application/json`, `image/png`).
  - *Vendor Tree (`vnd.`)*: Proprietary corporate formats (e.g., `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`).
  - *Personal / Vanity Tree (`prs.`)*: Non-commercial software.
  - *Unregistered / Experimental (`x.`)*: Deprecated historical formats (e.g., `application/x-tar` transitioned to `application/tar`).
- **Structured Syntax Suffix (`+suffix`)**: Informs generic parsers that the underlying data conforms to a known grammar (e.g., `image/svg+xml` is XML; `application/problem+json` is JSON).

### Authoritative MIME Types Reference Table

| Extension | MIME / Media Type | Top-Level Type | RFC Standard |
| :--- | :--- | :--- | :--- |
| `.html` / `.htm` | `text/html` | Text | RFC 2854 / HTML Living Standard |
| `.js` / `.mjs` | `text/javascript` | Text | RFC 9239 (obsoletes `application/javascript`) |
| `.json` | `application/json` | Application | RFC 8259 |
| `.wasm` | `application/wasm` | Application | WebAssembly Core Specification |
| `.svg` | `image/svg+xml` | Image | W3C SVG 1.1 / 2 |
| `.webp` | `image/webp` | Image | WebP Container RFC |
| `.avif` | `image/avif` | Image | Alliance for Open Media |
| `.pdf` | `application/pdf` | Application | ISO 32000 / RFC 8118 |
| `.zip` | `application/zip` | Application | RFC 1951 |
| `.woff2` | `font/woff2` | Font | WOFF 2.0 W3C Recommendation |

### Programmatic Lookup in TypeScript
```typescript
const MIME_DATABASE: Record<string, string> = {
  html: 'text/html; charset=utf-8',
  js: 'text/javascript; charset=utf-8',
  mjs: 'text/javascript; charset=utf-8',
  json: 'application/json; charset=utf-8',
  wasm: 'application/wasm',
  svg: 'image/svg+xml',
  png: 'image/png',
  jpg: 'image/jpeg',
  webp: 'image/webp',
  avif: 'image/avif',
  pdf: 'application/pdf',
  css: 'text/css; charset=utf-8'
};

export function lookupMimeType(filePathOrExtension: string): string {
  const ext = filePathOrExtension.split('.').pop()?.toLowerCase() || '';
  return MIME_DATABASE[ext] || 'application/octet-stream';
}
```

---

## 4. Real-World Production Use Cases
1. **Cloud CDN & S3 Static Hosting**: Setting accurate `Content-Type` metadata on AWS S3, Cloudflare R2, or Google Cloud Storage objects during CI/CD build scripts so browsers render `.wasm` modules and `.css` files rather than forcing file downloads.
2. **REST API Content Negotiation**: Utilizing the `Accept` and `Content-Type` request/response headers to negotiate representations (e.g., `application/json` vs. `application/xml` or protobuf).
3. **Hardening Web Security**: Applying `X-Content-Type-Options: nosniff` in reverse proxy headers to prevent legacy browsers from interpreting user-uploaded image files as executable HTML/JavaScript.

---

## 5. Frequently Asked Questions (FAQs)

### Why is `text/javascript` preferred over `application/javascript`?
Historically, `application/javascript` was designated under RFC 4329. However, **RFC 9239** officially updated the IANA registry, obsoleting `application/javascript` and standardizing `text/javascript` as the sole official media type for ECMAScript source text.

### What happens if a server sends `application/octet-stream`?
`application/octet-stream` is the fallback binary stream type. When a browser encounters this header, it does not attempt to render the resource in the viewport; instead, it triggers a file download dialog.

### What is MIME Sniffing and why is it dangerous?
MIME sniffing is a legacy browser behavior where the user agent ignores the server-declared `Content-Type` and inspects the initial bytes (magic numbers) of the payload to guess the format. Attackers exploit this by uploading an image containing embedded `<script>` tags; if the server serves it without `nosniff`, the browser may execute the script, causing Cross-Site Scripting (XSS).

### Should I always include `charset=utf-8`?
Yes, for text-based formats (such as `text/html`, `text/plain`, `text/css`, and `application/json`). Explicitly declaring the UTF-8 charset prevents character encoding mismatch vulnerabilities and guarantees consistent emoji and international Unicode rendering.

---

## 6. Privacy & Security Notice
All MIME type searches, extension checks, and header configurations are handled entirely on your client machine. No query logs, file names, or application headers are stored or dispatched to third-party endpoints.
