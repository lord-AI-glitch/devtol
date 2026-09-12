# Online URL Parser & Query String Analyser: RFC 3986 URL Anatomy & Parameter Extraction

## 1. Quick Overview & Core Advantages
The **Online URL Parser & Query String Analyser** is an interactive network analysis utility designed to dissect, parse, and evaluate Uniform Resource Locators (URLs) and web endpoints. It breaks complex URLs down into their fundamental architectural components: **Protocol/Scheme**, **Authentication Credentials**, **Hostname/Domain**, **Port**, **Pathname**, **Query Parameters**, and **Hash Fragment**.

Operating under a strict **Zero-Knowledge Architecture: inspected URLs, query tokens, authorization headers, and endpoint paths never leave local browser memory**. Parsing runs entirely within your browser's execution thread via the WHATWG URL API. Internal API routes, security tokens, and user parameters remain completely protected from network exposure.

### Core Technical Advantages
- **Zero-Knowledge Architecture**: URLs and parameters are evaluated locally with zero remote data transfer.
- **WHATWG URL Standard Compliance**: Built on modern browser URL parsing engines.
- **Interactive Query Parameter Table**: View, search, sort, and edit query parameters with automatic percent decoding.
- **Security Parameter Highlighting**: Automatically identifies sensitive tokens (such as `token`, `auth`, `key`, `secret`, or `sig`) embedded within query strings.

---

## 2. How to Use Step-by-Step Guide

### Parsing a Complex URL
1. **Enter URL**: Paste the URL into the input field.
2. **Review Component Breakdown**: Instantly view the structured breakdown of the URL:
   - **Protocol**: `https:`
   - **Host / Hostname**: `api.example.com`
   - **Port**: Explicit or default (e.g., `443`)
   - **Path**: `/v2/users/search`
   - **Hash**: `#profile`
3. **Inspect Query Parameters**: Review the interactive table of parsed keys and decoded values.
4. **Modify & Reconstruct**: Update parameter values or add new keys; the tool reassembles the valid URL in real time.
5. **Copy Sanitized URL**: Click **Copy** to export the structured components or the updated URL string.

```text
URL Anatomy Overview:
https://alice:secret@api.example.com:8443/v1/checkout?cart_id=8912&coupon=SUMMER#payment
│       │     │      │               │    │           └───────────┬───────────┘ └──┬──┘
│       │     │      │               │    │                       └── Query Params  └── Hash
│       │     │      │               │    └────────────────────────── Pathname
│       │     │      │               └─────────────────────────────── Port
│       │     │      └─────────────────────────────────────────────── Hostname
│       └─────┴────────────────────────────────────────────────────── Credentials (User:Pass)
└──────────────────────────────────────────────────────────────────── Protocol
```

---

## 3. Algorithmic & Specification Deep Dive

### The WHATWG URL Standard
Modern web platforms follow the **WHATWG URL Standard**, which supersedes older RFC 1738 and RFC 3986 URL parsing rules. Key parsing mechanics include:

1. **Protocol Normalization**: Protocols are normalized to lowercase, and standard ports are mapped automatically:
   - `http:` $\implies$ default port `80`
   - `https:` $\implies$ default port `443`
   - `ftp:` $\implies$ default port `21`
2. **Domain Normalization & Punycode**: Internationalized Domain Names (IDNs) containing Unicode characters are converted into ASCII-compatible encoding (ACE) using Punycode:

$$\text{münchen.de} \implies \text{xn--mnchen-3ya.de}$$

3. **Query String Key-Value Mapping**: Query strings are parsed into key-value pairs following `application/x-www-form-urlencoded` rules:

```typescript
// URL Decomposition Implementation
function parseUrlDetails(rawUrl: string) {
  const parsed = new URL(rawUrl);
  const searchParams: Record<string, string[]> = {};

  parsed.searchParams.forEach((val, key) => {
    if (!searchParams[key]) searchParams[key] = [];
    searchParams[key].push(val);
  });

  return {
    protocol: parsed.protocol,
    username: parsed.username,
    password: parsed.password,
    hostname: parsed.hostname,
    port: parsed.port || (parsed.protocol === 'https:' ? '443' : '80'),
    pathname: parsed.pathname,
    params: searchParams,
    hash: parsed.hash
  };
}
```

---

## 4. Real-World Production & Web Security Use Cases

### 1. Identifying Sensitive Token Leaks in URLs
Security teams audit client-side logs to find sensitive tokens (like JWTs or API keys) improperly placed in query parameters, where they risk exposure via browser history, proxy logs, and `Referer` headers.

### 2. Microservice Routing and Webhook Debugging
Inspect complex redirect URLs, callback hooks, and API gateway routes during backend integration testing.

---

## 5. Frequently Asked Questions (FAQs)

### Why is placing secret tokens in query parameters considered insecure?
Query parameters are frequently stored in plaintext across browser history records, web server access logs, reverse proxy caches, and transmitted in HTTP `Referer` headers to third parties. Sensitive credentials should be sent using HTTP headers (like `Authorization`) or request bodies instead.

### What is the difference between `host` and `hostname`?
In URL standards, `hostname` refers strictly to the domain name or IP address (e.g., `example.com`), whereas `host` includes the port number when one is explicitly specified (e.g., `example.com:8080`).

### How does the parser handle duplicate query keys?
HTTP supports multiple query parameters sharing the identical key (e.g., `?filter=a&filter=b`). The parser displays all values associated with each key rather than overwriting them.

### Are my parsed URLs sent to an external server?
No. All URL parsing, parameter extraction, and domain checks run locally inside your browser memory.

---

## 6. Security and Privacy Guarantee
- **Local Client Processing**: All parsing executes locally inside browser memory.
- **Zero Remote Storage**: URLs and parameters are never logged or transmitted over the network.
- **WHATWG Compliant**: Full adherence to modern web standards for URL parsing.
