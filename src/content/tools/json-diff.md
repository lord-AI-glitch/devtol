# JSON Diff: RFC 6902 Patch Operations, AST Structural Comparison & Deep Object Equality

## 1. Quick Overview & Core Advantages
Comparing structured data payloads is a fundamental engineering necessity across modern distributed applications, continuous integration pipelines, and API monitoring systems. While traditional textual diff engines (such as Myers diff) compare documents line-by-line, **JSON Diff** performs semantic, structural AST (Abstract Syntax Tree) comparison. Governed by **RFC 6902 (JSON Patch)** and **RFC 7386 (JSON Merge Patch)**, structural diffing understands that key order in JSON objects is arbitrary, preventing misleading line-based false positives.

Our client-side **JSON Diff Tool** provides visual side-by-side highlighting, recursive key-value disparity detection, and standard RFC 6902 patch generation.

### Core Advantages & Zero-Knowledge Architecture
- **100% Client-Side Semantic Diffing**: Proprietary database exports, confidential API responses, and production environment configs are evaluated entirely in browser memory. No data is sent to backend servers.
- **Key-Order Agnostic Evaluation**: Correctly identifies `{"a": 1, "b": 2}` and `{"b": 2, "a": 1}` as identical, highlighting only genuine value mutations, additions, and deletions.
- **RFC 6902 Patch Generation**: Automatically outputs atomic patch operations (`add`, `remove`, `replace`, `move`, `copy`) ready for replay in REST APIs.

---

## 2. Step-by-Step Usage Guide

### Comparing Two JSON Documents
1. **Load Left (Original) & Right (Modified) JSON**: Paste or upload your baseline and modified JSON payloads into the respective code editors.
2. **Configure Comparison Rules**:
   - *Ignore Array Ordering*: Toggle whether array elements should be matched by value or strict index.
   - *Ignore Whitespace / Indentation*: Automatically strips formatting nuances.
   - *Case Sensitivity*: Toggle strict key casing comparison.
3. **Inspect the Visual Discrepancies**:
   - <span style="color: green;">**Green (+) Added**</span>: Fields present in the modified document but absent from the baseline.
   - <span style="color: red;">**Red (-) Removed**</span>: Fields present in the baseline that have been deleted.
   - <span style="color: orange;">**Orange (~) Modified**</span>: Keys whose primitive value or type has mutated.
4. **Export RFC 6902 JSON Patch**: Copy the generated array of atomic JSON Patch operations.

### Example: Structural Disparity & RFC 6902 Patch
```json
// Original (Left)
{
  "service": "billing",
  "port": 8080,
  "features": ["stripe", "paypal"]
}

// Modified (Right)
{
  "service": "billing",
  "port": 8443,
  "features": ["stripe", "paypal", "apple_pay"],
  "debug": true
}

// Generated RFC 6902 Patch
[
  { "op": "replace", "path": "/port", "value": 8443 },
  { "op": "add", "path": "/features/2", "value": "apple_pay" },
  { "op": "add", "path": "/debug", "value": true }
]
```

---

## 3. Technical Deep-Dive: RFC 6902 Specification & Recursive AST Traversal

### Formal RFC 6902 Patch Operations
Under RFC 6902, a JSON Patch document represents an ordered sequence of mutation objects containing:
1. `op`: The operation string (`add`, `remove`, `replace`, `move`, `copy`, `test`).
2. `path`: A JSON Pointer string (**RFC 6901**) identifying the target location (e.g., `/users/0/address/city`). In JSON Pointer syntax, `~0` encodes `~` and `~1` encodes `/`.
3. `value`: The payload value to apply (required for `add`, `replace`, and `test`).

### Recursive AST Diff Algorithm in TypeScript
```typescript
export interface PatchOperation {
  op: 'add' | 'remove' | 'replace';
  path: string;
  value?: any;
  oldValue?: any;
}

export function generateJsonDiff(
  obj1: any,
  obj2: any,
  currentPath = ''
): PatchOperation[] {
  const operations: PatchOperation[] = [];

  // Handle primitive value or type change
  if (typeof obj1 !== typeof obj2 || obj1 === null || obj2 === null || typeof obj1 !== 'object') {
    if (obj1 !== obj2) {
      operations.push({ op: 'replace', path: currentPath || '/', value: obj2, oldValue: obj1 });
    }
    return operations;
  }

  // Handle Array comparison
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    const maxLen = Math.max(obj1.length, obj2.length);
    for (let i = 0; i < maxLen; i++) {
      const p = `${currentPath}/${i}`;
      if (i >= obj1.length) {
        operations.push({ op: 'add', path: p, value: obj2[i] });
      } else if (i >= obj2.length) {
        operations.push({ op: 'remove', path: p, oldValue: obj1[i] });
      } else {
        operations.push(...generateJsonDiff(obj1[i], obj2[i], p));
      }
    }
    return operations;
  }

  // Handle Object comparison
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  const allKeys = new Set([...keys1, ...keys2]);

  for (const key of allKeys) {
    const escapedKey = key.replace(/~/g, '~0').replace(/\//g, '~1');
    const p = `${currentPath}/${escapedKey}`;

    if (!(key in obj1)) {
      operations.push({ op: 'add', path: p, value: obj2[key] });
    } else if (!(key in obj2)) {
      operations.push({ op: 'remove', path: p, oldValue: obj1[key] });
    } else {
      operations.push(...generateJsonDiff(obj1[key], obj2[key], p));
    }
  }

  return operations;
}
```

---

## 4. Real-World Production Use Cases
1. **Microservice API Regression Testing**: Diffing production and staging response payloads during canary deployments to detect breaking changes or unexpected schema regressions.
2. **Audit Trails & Event Sourcing**: Generating and persisting RFC 6902 change deltas in compliance databases (e.g., tracking customer profile updates or financial permission changes) rather than storing full snapshots.
3. **Infrastructure as Code (IaC) Validation**: Comparing Kubernetes manifests or Terraform state JSON definitions before applying cluster changes.

---

## 5. Frequently Asked Questions (FAQs)

### Why does text-based diff (like git diff) fail on JSON?
Git and line-based diff utilities compare raw lines of text. If one system serializes keys as `{"id": 1, "name": "A"}` and another outputs `{"name": "A", "id": 1}`, a text diff flags both lines as changed, even though the semantic data is 100% identical. JSON Diff eliminates this issue.

### How are escaping rules handled in RFC 6901 JSON Pointers?
Because the forward slash `/` is used as a path delimiter, any JSON key containing a literal slash or tilde must be escaped: tildes are replaced with `~0` and slashes are replaced with `~1`. For example, the key `"a/b"` becomes `/a~1b`.

### What is the performance complexity of recursive JSON diffing?
For trees of size $N$ and $M$, semantic diffing is $O(N + M)$ when array indices are compared positionally. If deep unordered array matching is required, complexity increases to $O(N \times M)$ using greedy bipartite matching.

### Can JSON Diff handle circular references?
Standard JSON format (RFC 8259) prohibits cyclical object graphs. If an unparsed JavaScript object with circular references is evaluated, a recursive diff will trigger a call stack overflow. Our tool strictly parses valid JSON strings, guaranteeing acyclic tree traversal.

---

## 6. Privacy & Security Notice
All parsing, AST traversals, and RFC 6902 patch calculations are executed 100% locally in your client web browser. Zero bytes of sensitive configuration data, tokens, or personal identifiers are uploaded to remote servers.
