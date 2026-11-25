# Online URL Parser & Query String Analyser: RFC 3986 URL Anatomy & Parameter Extraction

## 1. Quick Overview & Core Advantages
The **Online URL Parser & Query String Analyser** is an interactive network analysis utility designed to dissect, parse, and evaluate Uniform Resource Locators (URLs) and web endpoints. It breaks complex URLs down into their fundamental architectural components: **Protocol/Scheme**, **Authentication Credentials**, **Hostname/Domain**, **Port**, **Pathname**, and **Query Parameters**. The hash fragment is part of the URL but is not displayed.

Everything runs locally in your browser: inspected URLs, query tokens, authorization headers, and endpoint paths never leave local browser memory. Parsing runs entirely within your browser's execution thread via the WHATWG URL API.

### Core Technical Advantages
- **Local Processing**: URLs and parameters are evaluated locally with zero remote data transfer.
- **WHATWG URL Standard Compliance**: Built on modern browser URL parsing engines.
- **Query Parameter Rows**: Each parameter is shown as a key/value row with its own copy field, percent-decoded. The list is read-only — there is no search, sort, or edit.
- **Default Ports Shown Blank**: The Port field shows the explicit port, or nothing at all when the URL uses its scheme's default port.

---

## 2. How to Use Step-by-Step Guide

### Parsing a Complex URL
1. **Enter URL**: Paste the URL into the input field.
2. **Review Component Breakdown**: Instantly view the structured breakdown of the URL:
   - **Protocol**: `https:`
   - **Host / Hostname**: `api.example.com`
   - **Port**: The explicit port, or blank when the URL uses the default port for its scheme
   - **Path**: `/v2/users/search`
3. **Inspect Query Parameters**: Review the interactive table of parsed keys and decoded values.
4. **Inspect the Parameter Rows**: Below the components, each query parameter appears as its own key/value row.
5. **Copy Any Value**: Each component and each parameter row has its own copy field.

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

1. **Protocol Normalization**: Protocols are normalized to lowercase. The Port field shows the value of `new URL(...).port` exactly as reported — an empty string when the URL uses its scheme's default port (`80` for `http:`, `443` for `https:`, `21` for `ftp:`) — so a default-port URL shows a blank Port field.
2. **Domain Normalization & Punycode**: Internationalized Domain Names (IDNs) containing Unicode characters are converted into ASCII-compatible encoding (ACE) using Punycode:

$$\text{münchen.de} \implies \text{xn--mnchen-3ya.de}$$

3. **Query String Key-Value Mapping**: Query strings are parsed into key-value pairs following `application/x-www-form-urlencoded` rules. The tool reads seven properties straight from `new URL(...)` — protocol, username, password, hostname, port, pathname, and the raw query string — and lists the parameters from `Object.fromEntries(url.searchParams.entries())`. Because `Object.fromEntries` keeps only the last value for a repeated key, `?filter=a&filter=b&filter=c` shows a single row: `filter=c`.

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
HTTP supports multiple query parameters sharing the identical key, but this tool shows only one row per key: it builds the parameter list with `Object.fromEntries(...)`, so `?filter=a&filter=b&filter=c` displays a single row, `filter=c`.

### Are my parsed URLs sent to an external server?
No. All URL parsing, parameter extraction, and domain checks run locally inside your browser memory.

---

## 6. Security and Privacy Guarantee
- **Local Client Processing**: All parsing executes locally inside browser memory.
- **Zero Remote Storage**: URLs and parameters are never logged or transmitted over the network.
- **WHATWG Compliant**: Full adherence to modern web standards for URL parsing.

---

## 7. Worked Examples: Real Parses

### The tool's default URL

The parser opens with this URL already loaded:

```text
https://me:pwd@devtol.online:3000/url-parser?key1=value&key2=value2#the-hash
```

and breaks it down as:

| Field | Value |
| :--- | :--- |
| Protocol | `https:` |
| Username | `me` |
| Password | `pwd` |
| Hostname | `devtol.online` |
| Port | `3000` |
| Path | `/url-parser` |
| Params | `?key1=value&key2=value2` |

Each query parameter is also shown on its own row: `key1` → `value`, `key2` → `value2`.

### A URL with credentials and a non-standard port

```text
https://alice:secret@api.example.com:8443/v1/checkout?cart_id=8912&coupon=SUMMER#payment
```

parses to protocol `https:`, username `alice`, password `secret`, hostname `api.example.com`, port `8443`, path `/v1/checkout`, and params `?cart_id=8912&coupon=SUMMER`.

### Three behaviours to know

- **Default ports show as blank.** Parsing `https://example.com/a` gives an empty Port field, not `443`, because the URL engine drops the default port. A non-default port such as `8080` is shown.
- **Duplicate keys keep only the last value.** For `?filter=a&filter=b&filter=c` the parameter table shows a single row, `filter` → `c`. Earlier values are discarded.
- **International domains become Punycode.** The hostname `münchen.de` is displayed as `xn--mnchen-3ya.de`, which is the ASCII form actually sent in requests.

### Query values arrive percent-decoded

The parameter rows show decoded values, not the raw encoded text. For this URL:

```text
https://example.com/search?q=hello%20world&city=M%C3%BCnchen&empty=&plus=a%2Bb
```

the table reads:

| Key | Value |
| :--- | :--- |
| `q` | `hello world` |
| `city` | `München` |
| `empty` | *(empty)* |
| `plus` | `a+b` |

The `%20` becomes a space, `%C3%BC` becomes `ü`, and `%2B` becomes a literal `+` — which is different from a `+` written directly in a query string, where it would also mean a space under form-encoding rules. An empty value is shown as an empty row, not dropped, so you can tell a present-but-empty parameter apart from a missing one.
