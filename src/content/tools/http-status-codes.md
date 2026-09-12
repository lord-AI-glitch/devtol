# HTTP Status Codes: Comprehensive RFC Reference, Header Semantics & Debugging Guide

## 1. Quick Overview & Core Advantages
HTTP (Hypertext Transfer Protocol) status codes are standardized three-digit integers returned by web servers to communicate the outcome of a client's HTTP request. Defined primarily by the Internet Engineering Task Force (IETF) across RFC 9110 (which obsoletes RFC 7231 and RFC 2616), RFC 6585, and related standards, status codes form the foundational signaling layer of the modern World Wide Web, RESTful APIs, microservices, and distributed cloud applications.

Our client-side **HTTP Status Code Reference & Inspection Tool** provides instant, searchable access to the complete standard registry maintained by the Internet Assigned Numbers Authority (IANA), along with common non-standard and vendor-specific codes (such as Cloudflare 520–530 series and Nginx 499).

### Core Advantages & Zero-Knowledge Architecture
- **100% Client-Side Search & Inspection**: All queries, status code lookups, and diagnostic reference searches run entirely within your local browser sandbox. No telemetry, IP logging, or request telemetry is transmitted to external servers.
- **RFC-Compliant Semantics**: Authoritative descriptions detailing caching rules, idempotency considerations, and expected client/server behavior under RFC 9110, RFC 9111 (HTTP Caching), and RFC 7540/9113 (HTTP/2 & HTTP/3).
- **Zero Latency**: Instantaneous sub-millisecond filtering across all status code categories, headers, and specification links without external API overhead.

---

## 2. Step-by-Step Usage Guide

### Searching and Filtering Status Codes
1. **Filter by Class**: Select the target HTTP status class (1xx Informational, 2xx Success, 3xx Redirection, 4xx Client Error, or 5xx Server Error) to isolate the relevant operational phase.
2. **Search by Code or Keyword**: Enter a numeric code (e.g., `429`) or descriptive term (e.g., `Rate Limit`, `Gateway Timeout`, `Idempotent`) in the search field to retrieve matching definitions.
3. **Inspect Header Contracts**: Review mandatory and optional HTTP headers associated with each code (e.g., `Retry-After` for 429 and 503, `Location` for 201 and 3xx redirects, `WWW-Authenticate` for 401).
4. **Copy Diagnostic Boilerplates**: Copy ready-to-use JSON error envelopes and status handling code snippets in TypeScript, Go, or Python.

### Example: Handling Standardized Error Responses
Modern REST APIs should return structured RFC 7807 (Problem Details for HTTP APIs) payloads:

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/problem+json
Retry-After: 60

{
  "type": "https://api.example.com/errors/rate-limit-exceeded",
  "title": "Too Many Requests",
  "status": 429,
  "detail": "Quota exceeded. You have made 100 requests in 60 seconds. Limit is 60.",
  "instance": "/v1/subscriptions/sub_9921/usage"
}
```

---

## 3. Technical Deep-Dive: RFC Classification & Semantics

The first digit of an HTTP status code defines the general response category. RFC 9110 specifies five official classes:

| Class | Category | Core Responsibility & Client Expectation |
| :--- | :--- | :--- |
| **1xx** | Informational | Request received, continuing process (e.g., 101 Switching Protocols, 103 Early Hints) |
| **2xx** | Successful | Action successfully received, understood, accepted (e.g., 200 OK, 201 Created, 204 No Content) |
| **3xx** | Redirection | Further action must be taken to complete request (e.g., 301, 302, 304 Not Modified, 308) |
| **4xx** | Client Error | Request contains bad syntax or cannot be fulfilled (e.g., 400, 401, 403, 404, 429) |
| **5xx** | Server Error | Server failed to fulfill an apparently valid request (e.g., 500, 502 Bad Gateway, 503, 504) |

### Complete Breakdown of Primary RFC Status Codes

#### 1xx: Informational Responses
- **100 Continue**: Indicates that the server has received the request headers and the client should proceed to send the request body (e.g., with `Expect: 100-continue`).
- **101 Switching Protocols**: The requester has asked the server to switch protocols via `Upgrade`, commonly utilized to establish WebSocket connections (`Upgrade: websocket`).
- **103 Early Hints (RFC 8297)**: Sent prior to final response headers to allow browsers to preload critical subresources (`Link: </style.css>; rel=preload`).

#### 2xx: Success Responses
- **200 OK**: Standard response for successful HTTP requests.
- **201 Created**: The request has succeeded and led to the creation of a new resource, specified in the `Location` response header.
- **202 Accepted**: The request has been accepted for processing, but processing has not been completed. Ideal for asynchronous worker queues.
- **204 No Content**: Successfully processed the request; returns no response body (common in `DELETE` or `PUT` operations).
- **206 Partial Content (RFC 9110 §15.3.7)**: Delivered when clients request a byte range via the `Range` request header, essential for video streaming and resumable downloads.

#### 3xx: Redirection Responses
- **301 Moved Permanently**: All future requests must be sent to the URI in `Location`. Search engines transfer SEO link equity (PageRank).
- **302 Found (Temporary Redirect)**: The target resource resides temporarily under a different URI. Clients should retain the original URI for future requests.
- **304 Not Modified (RFC 9111)**: Conditional GET requests (`If-None-Match`, `If-Modified-Since`) return 304 when client cached representations remain fresh, eliminating redundant data transfer.
- **307 Temporary Redirect**: Like 302, but guarantees the HTTP method (e.g., POST) is NOT altered when redirecting.
- **308 Permanent Redirect**: Like 301, but guarantees the HTTP method cannot change to GET upon redirect.

#### 4xx: Client Error Responses
- **400 Bad Request**: Malformed syntax, invalid JSON, or schema validation failures.
- **401 Unauthorized**: Lacks valid authentication credentials (`Authorization` header missing or invalid). Must include `WWW-Authenticate`.
- **403 Forbidden**: Authenticated identity lacks permission to access the resource (authorization failure).
- **404 Not Found**: The server cannot find the requested resource.
- **405 Method Not Allowed**: HTTP verb not supported on the target URI (`Allow: GET, POST`).
- **409 Conflict**: Request conflicts with current state of resource (e.g., optimistic locking failures, duplicate unique keys).
- **422 Unprocessable Content (RFC 9110)**: Syntax is valid, but semantic instructions contain errors (dominant in REST APIs).
- **429 Too Many Requests (RFC 6585)**: Rate limiting triggered. Accompanied by `Retry-After`.

#### 5xx: Server Error Responses
- **500 Internal Server Error**: Generic unhandled exception on the origin server.
- **502 Bad Gateway**: Reverse proxy (Nginx, Envoy, Cloudflare) received an invalid response from the upstream microservice.
- **503 Service Unavailable**: Server is overloaded or down for maintenance.
- **504 Gateway Timeout**: Upstream origin failed to respond to reverse proxy within configured timeout.

### Programmatic Implementation in TypeScript / Express
```typescript
import { Request, Response, NextFunction } from 'express';

export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503
}

export interface ApiProblemDetail {
  type: string;
  title: string;
  status: HttpStatus;
  detail: string;
  instance?: string;
}

export function handleCustomError(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const status = err.status || HttpStatus.INTERNAL_SERVER_ERROR;
  const problem: ApiProblemDetail = {
    type: err.type || 'about:blank',
    title: err.name || 'Internal Error',
    status,
    detail: err.message || 'An unexpected error occurred.',
    instance: req.originalUrl
  };

  res.status(status).contentType('application/problem+json').json(problem);
}
```

---

## 4. Real-World Production Use Cases
1. **Edge Proxies & API Gateway Routing**: Configuring Cloudflare Workers, Kong, or Envoy with precise HTTP routing tables, verifying that backend health-check timeouts emit `504 Gateway Timeout` rather than `500 Internal Server Error` to prevent false alarm alerts in telemetry monitors.
2. **Resilient HTTP Client Retries**: Implementing exponential backoff logic in distributed microservices: automatically retrying idempotent requests on `429`, `503`, and `504`, while immediately failing on deterministic client errors (`400`, `401`, `422`).
3. **SEO Migration Audits**: Engineering large-scale URL redirect maps during website migrations, ensuring permanent migrations return `301` or `308` headers to preserve organic search equity, avoiding search indexing drops caused by erroneous `302` redirects.

---

## 5. Frequently Asked Questions (FAQs)

### What is the exact difference between 401 Unauthorized and 403 Forbidden?
`401 Unauthorized` means authentication is missing or invalid; the client can retry the request with valid credentials (e.g., Bearer token or API key). In contrast, `403 Forbidden` indicates the server knows who the client is, but the client does not possess the requisite permissions or RBAC roles to access the resource; re-authenticating with the same identity will fail.

### Why should I use 307/308 instead of 301/302?
Historical user agents frequently transformed POST, PUT, or DELETE requests into GET requests when encountering `301` or `302` redirects. RFC 7231 / RFC 9110 introduced `307 Temporary Redirect` and `308 Permanent Redirect` to strictly guarantee that the HTTP request method and payload body remain unaltered during redirection.

### How does HTTP status 304 Not Modified improve performance?
A `304 Not Modified` response contains no body payload. When a client performs a conditional request sending `If-None-Match: "etag_hash"` or `If-Modified-Since: <timestamp>`, the server returns 304 if the cached resource is still fresh. This saves bandwidth and reduces latency from milliseconds to microseconds.

### What causes a 502 Bad Gateway error in cloud deployments?
A `502 Bad Gateway` error occurs when a reverse proxy (e.g., Nginx, AWS ALB, Cloudflare, Traefik) attempts to forward an incoming HTTP request to an upstream service container (e.g., Node.js, Go, Python Gunicorn), but the container terminates the TCP connection abruptly, crashes due to an out-of-memory (OOM) error, or fails the socket handshake.

---

## 6. Privacy & Security Notice
All lookups and reference data in this tool are executed 100% within your client browser environment. No URLs, code inputs, network parameters, or user search inquiries are stored, tracked, or dispatched to third-party endpoints. Compliance with RFC 9110, RFC 7807, and IANA specifications is guaranteed.
