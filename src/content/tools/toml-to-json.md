# Online TOML to JSON Converter: Configuration Parsing, Schema Translation & Spec Compliance

## 1. Quick Overview & Core Advantages
The **Online TOML to JSON Converter** is a developer utility designed to parse, validate, and convert TOML (Tom's Obvious, Minimal Language) configuration files into formatted, syntactically valid JSON (JavaScript Object Notation). Widely utilized across modern ecosystem tools—such as Rust's `Cargo.toml`, Python's `pyproject.toml`, Hugo site configurations, and container settings—TOML offers human-readable configuration that often needs translation to JSON for automated CI/CD pipelines and API consumption.

Everything runs locally in your browser: configuration payloads, internal server variables, and API keys never leave local browser memory. TOML parsing and JSON serialization execute entirely inside the client browser engine.

### Core Technical Advantages
- **Local Processing**: All parsing runs locally in client memory with zero remote transmission.
- **Strict TOML v1.0.0 Compliance**: Full support for tables, inline tables, multiline strings, dates/times, arrays of tables, and binary literals.
- **Syntax Validation**: Real-time validation — invalid TOML shows the generic message `Provided TOML is not valid.`, with no line or column details.
- **Fixed 3-Space JSON**: The output is always `JSON.stringify(parseToml(value), null, 3)` — pretty-printed with a 3-space indent. There is no minified or indent-size option.

---

## 2. How to Use Step-by-Step Guide

### Converting TOML to JSON
1. **Paste TOML Configuration**: Input your TOML content (e.g., a `Cargo.toml` or `pyproject.toml` file) into the editor.
2. **Review Real-Time Validation**: The parser automatically evaluates syntax; invalid TOML shows the generic message `Provided TOML is not valid.`
3. **Read the Output**: The JSON is pretty-printed with a fixed 3-space indent.
4. **Copy**: Click **Copy** to grab the generated JSON string.

```toml
# Sample TOML Input:
[package]
name = "secure-vault"
version = "1.4.0"
authors = ["Security Lead <sec@example.com>"]

[dependencies]
serde = { version = "1.0", features = ["derive"] }
tokio = { version = "1.28", features = ["full"] }
```

```json
// Converted JSON Output:
{
   "package": {
      "name": "secure-vault",
      "version": "1.4.0",
      "authors": [
         "Security Lead <sec@example.com>"
      ]
   },
   "dependencies": {
      "serde": {
         "version": "1.0",
         "features": [
            "derive"
         ]
      },
      "tokio": {
         "version": "1.28",
         "features": [
            "full"
         ]
      }
   }
}
```

---

## 3. Algorithmic & Specification Deep Dive

### TOML v1.0.0 Parsing Mechanics
TOML maps directly to a hash table (dictionary). However, handling TOML types requires careful data conversion when targeting JSON:

1. **Date-Time Objects**: TOML natively supports RFC 3339 Offset Date-Times (e.g., `1979-05-27T07:32:00Z`), Local Date-Times, and Local Dates. Because standard JSON lacks native date types, the converter serializes these into standard ISO 8601 string representations.
2. **Array of Tables (`[[table]]`)**: Consecutive double brackets represent an array of dictionary tables:

```toml
[[products]]
name = "Hammer"
sku = 738594937

[[products]]
name = "Nail"
sku = 284758393
```

Maps to a JSON array of objects:
```json
{
   "products": [
      {
         "name": "Hammer",
         "sku": 738594937
      },
      {
         "name": "Nail",
         "sku": 284758393
      }
   ]
}
```

3. **Floating-Point Values**: TOML supports special float values like `inf`, `-inf`, and `nan`. Because the JSON specification (RFC 8259) does not permit `NaN` or `Infinity`, the parser maps them to `null`. There are no configuration settings — `inf`, `-inf`, and `nan` always become `null`.

---

## 4. Real-World Production & DevOps Use Cases

### 1. CI/CD Pipeline Automation
Convert `pyproject.toml` or `Cargo.toml` files into JSON during GitHub Actions workflows, allowing `jq` scripts to easily query package versions and metadata.

### 2. Cloud Configuration Ingestion
Translate human-edited TOML configuration files into JSON payloads for ingestion by REST APIs, Kubernetes controllers, or AWS Lambda configuration stores.

---

## 5. Frequently Asked Questions (FAQs)

### Can all TOML features be represented in JSON?
Mostly, with the mappings below. TOML's data model maps cleanly to JSON's object and array model, but types without native JSON equivalents lose something in translation: dates and timestamps become ISO 8601 strings, and infinite floats (`inf`, `-inf`, `nan`) become `null`.

### How are TOML inline tables handled?
Inline tables (e.g., `name = { first = "Tom", last = "Preston-Werner" }`) are treated identically to standard TOML tables and map directly to standard nested JSON objects.

### Can this tool process large configuration files?
Yes. The parser runs locally in your browser and can quickly process large configuration files containing thousands of lines without network latency.

### Is my configuration data uploaded to any server?
No. All lexical analysis, syntax parsing, and JSON serialization run locally in your browser memory. No configuration data is stored or transmitted.

---

## 6. Security and Privacy Guarantee
- **Local Parsing**: Processing executes entirely within client browser memory.
- **Zero Remote Storage**: Data is discarded immediately upon session end.
- **TOML v1.0.0 & RFC 8259 Compliant**: Follows strict formatting and specification standards.

---

## 7. Worked Examples: Types That Need Care

### Dates become ISO strings

TOML dates have no JSON equivalent, so the parser returns date objects and serialisation turns them into ISO 8601 strings:

```json
// Input:  created = 1979-05-27T07:32:00Z
//         day = 1979-05-27
// Output:
{
   "created": "1979-05-27T07:32:00.000Z",
   "day": "1979-05-27"
}
```

A full date-time gains milliseconds and a `Z` suffix; a bare local date stays a plain `1979-05-27` string.

### Infinity and NaN become null

```json
// Input:  big = inf
//         neg = -inf
//         notnum = nan
// Output:
{
   "big": null,
   "neg": null,
   "notnum": null
}
```

JSON cannot represent infinity or NaN, so all three become `null`. Any code reading the output must treat `null` here as "a non-finite number was present", not as "the key was missing".

### Numbers in other bases

Hexadecimal and binary integers are converted to plain decimal numbers: `0xDEADBEEF` becomes `3735928559` and `0b1010` becomes `10`.

### Errors the parser reports

Defining the same key twice is an error, not a silent overwrite:

```text
a = 1
a = 2
```

fails with `Can't redefine existing key at row 2, col 6, pos 12:`, with the parser pointing at the second definition (`2> a = 2`). The tool then shows the validation message `Provided TOML is not valid.`

### Inline tables and arrays of tables

Inline tables map to nested objects exactly like block tables do:

```toml
name = { first = "Tom", last = "Preston-Werner" }
```

becomes:

```json
{
   "name": {
      "first": "Tom",
      "last": "Preston-Werner"
   }
}
```

And the array-of-tables example from section 3 converts cleanly:

```toml
[[products]]
name = "Hammer"
sku = 738594937

[[products]]
name = "Nail"
sku = 284758393
```

```json
{
   "products": [
      {
         "name": "Hammer",
         "sku": 738594937
      },
      {
         "name": "Nail",
         "sku": 284758393
      }
   ]
}
```

The two tables keep their order in the array, and each keeps its own keys, so a list of products, servers, or dependencies survives the conversion as a list.
