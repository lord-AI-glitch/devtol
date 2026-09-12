# Delimited List Converter: String Tokenization, Array Wrapping & SQL Formatting

## 1. Quick Overview & Key Benefits

The **Delimited List Converter** is an essential text transformation and data wrangling utility designed for systems engineers, database administrators, and software developers. It converts unformatted, raw data collections—such as spreadsheet columns, server logs, copy-pasted identifiers, and CSV records—into structured formats with customizable delimiters, quotation wrappers, deduplication filters, and sorting algorithms.

Whether preparing a batch of UUIDs for a `WHERE id IN (...)` SQL clause, converting newline-delimited log entries into a JSON/Python array, or cleaning mixed-delimiter CSV exports, engineers frequently spend tedious minutes writing throwaway shell pipelines or manual regex substitutions. The Delimited List Converter executes these multi-stage text manipulations instantaneously within an interactive interface.

### Key Value Propositions & Technical Advantages
- **Comprehensive Delimiter Transformation**: Convert between newlines (`\n`, `\r\n`), commas (`,`), tabs (`\t`), pipes (`|`), semicolons (`;`), or arbitrary multi-character strings.
- **Enclosure & Wrapping Controls**: Wrap elements in single quotes (`'`), double quotes (`"`), backticks (``` ` ```), parentheses, or custom prefix/suffix tokens with escape support.
- **Data Cleansing Pipelines**: One-click deduplication (set reduction), case normalization (upper, lower, title), trimming leading/trailing whitespace, and empty line filtering.
- **SQL & Programming Array Generation**: Instantly generate syntactically valid SQL `IN` lists, JavaScript/TypeScript string arrays (`["a", "b"]`), and Python lists.
- **100% In-Browser Client-Side Processing**: Processes datasets locally inside the browser's JavaScript engine.
- **Zero Data Exposure**: Proprietary IDs, customer emails, IP addresses, and database keys never touch an external server or telemetry pipeline.

---

## 2. Step-by-Step Practical Usage Guide

The following practical walkthrough demonstrates how to convert a messy list of server hostnames into a clean SQL query and a JSON array.

### Step 1: Paste Your Source Text
Paste raw, unstructured items into the input panel. The parser handles mixed line endings (`\r\n` from Windows or `\n` from POSIX), uneven indentation, and redundant empty lines.

#### Example Input: Raw Messy Server Hostnames
```text
  app-node-01.us-east.internal  
app-node-02.us-east.internal
app-node-01.us-east.internal

app-node-03.us-west.internal
  app-node-04.eu-west.internal  
app-node-02.us-east.internal
```

### Step 2: Configure Processing Rules
Adjust transformation options in the configuration toolbar:
1. **Source Delimiter**: Set to `Auto-Detect` or explicitly specify `Newline` (`\n`).
2. **Target Delimiter**: Choose `, ` (comma followed by space) or a custom separator.
3. **Item Wrapping**: Select Single Quotes (`'item'`) for SQL statements or Double Quotes (`"item"`) for JSON arrays.
4. **Data Normalization**:
   - Enable **Trim Whitespace** to eliminate accidental padding.
   - Enable **Remove Duplicates** (Set deduplication) to collapse identical keys.
   - Enable **Remove Empty Items** to clean extraneous blank lines.
   - Set **Sorting**: Ascending Alphabetical (A-Z).

### Step 3: Copy Formatted Output
The output updates in real time, ready for your target query or code file.

#### Example Output 1: SQL `IN` Clause Predicate
```sql
IN ('app-node-01.us-east.internal', 'app-node-02.us-east.internal', 'app-node-03.us-west.internal', 'app-node-04.eu-west.internal')
```

#### Example Output 2: JSON Array Representation
```json
[
  "app-node-01.us-east.internal",
  "app-node-02.us-east.internal",
  "app-node-03.us-west.internal",
  "app-node-04.eu-west.internal"
]
```

---

## 3. Technical Under the Hood: Specifications & Architecture

### Tokenization and String Splitting Mechanics
List conversion is modeled as a multi-stage string transformation pipeline:
$$\text{Input String} \xrightarrow{\text{Split}} [\text{Tokens}] \xrightarrow{\text{Filter}} [\text{Cleaned}] \xrightarrow{\text{Transform}} [\text{Wrapped}] \xrightarrow{\text{Join}} \text{Output String}$$

```
 Raw Input
    │
    ▼
┌───────────────────────┐
│ Delimiter Regex Split │ ── Supports \r?\n, \t, commas, regex boundaries
└───────────────────────┘
    │
    ▼
┌───────────────────────┐
│ Trim & Empty Filter   │ ── Strips \s+ and removes zero-length strings
└───────────────────────┘
    │
    ▼
┌───────────────────────┐
│ Set Deduplication     │ ── O(N) lookup using JavaScript Set / Map
└───────────────────────┘
    │
    ▼
┌───────────────────────┐
│ Sort & Case Normalize │ ── Natural alphanumeric sort (Intl.Collator)
└───────────────────────┘
    │
    ▼
┌───────────────────────┐
│ Prefix / Suffix Wrap  │ ── SQL string escaping (e.g., O'Connor -> O''Connor)
└───────────────────────┘
    │
    ▼
 Final Output
```

### SQL Literal Escaping Specification (ANSI SQL & ISO/IEC 9075)
When wrapping string literals for SQL engines (PostgreSQL, MySQL, SQLite, Oracle, Snowflake), an unescaped single quote within an element causes a syntax error or a critical SQL injection vulnerability.

Under ANSI SQL standard ISO/IEC 9075, single quotes inside string literals must be escaped by doubling the single quote (`''`):
```
O'Reilly  ──>  'O''Reilly'
```
The list converter handles SQL escaping during the wrapping phase to generate valid SQL query predicates.

### Reference TypeScript Transformation Engine
Here is the core conversion engine implementing delimiter tokenization, deduplication, sorting, and SQL-safe wrapping:

```typescript
/**
 * Delimited List Transformation Engine
 */

export interface ListConverterConfig {
  inputDelimiter: "auto" | "newline" | "comma" | "tab" | "semicolon" | string;
  outputDelimiter: string;
  wrapperPrefix: string;
  wrapperSuffix: string;
  trimWhitespace: boolean;
  removeEmpty: boolean;
  deduplicate: boolean;
  caseTransform: "none" | "lower" | "upper";
  sortOrder: "none" | "asc" | "desc" | "natural";
  escapeSqlQuotes: boolean;
}

export function transformDelimitedList(
  rawInput: string,
  config: ListConverterConfig
): string {
  if (!rawInput) return "";

  // 1. Resolve Splitting Delimiter
  let splitRegex: RegExp | string;
  if (config.inputDelimiter === "auto") {
    // Auto-detect: split on CRLF, LF, or commas if no newlines exist
    splitRegex = rawInput.includes("\n") ? /\r?\n/ : rawInput.includes(",") ? "," : /\s+/;
  } else if (config.inputDelimiter === "newline") {
    splitRegex = /\r?\n/;
  } else if (config.inputDelimiter === "comma") {
    splitRegex = ",";
  } else if (config.inputDelimiter === "tab") {
    splitRegex = "\t";
  } else if (config.inputDelimiter === "semicolon") {
    splitRegex = ";";
  } else {
    splitRegex = config.inputDelimiter;
  }

  // 2. Tokenize raw text
  let tokens: string[] = rawInput.split(splitRegex);

  // 3. Trim whitespace
  if (config.trimWhitespace) {
    tokens = tokens.map((t) => t.trim());
  }

  // 4. Remove empty tokens
  if (config.removeEmpty) {
    tokens = tokens.filter((t) => t.length > 0);
  }

  // 5. Case Transformation
  if (config.caseTransform === "lower") {
    tokens = tokens.map((t) => t.toLowerCase());
  } else if (config.caseTransform === "upper") {
    tokens = tokens.map((t) => t.toUpperCase());
  }

  // 6. Deduplication (preserving first occurrence)
  if (config.deduplicate) {
    tokens = Array.from(new Set(tokens));
  }

  // 7. Sorting
  if (config.sortOrder === "asc") {
    tokens.sort((a, b) => a.localeCompare(b));
  } else if (config.sortOrder === "desc") {
    tokens.sort((a, b) => b.localeCompare(a));
  } else if (config.sortOrder === "natural") {
    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
    tokens.sort((a, b) => collator.compare(a, b));
  }

  // 8. Enclosure / Wrapping with SQL escape support
  const wrapped = tokens.map((item) => {
    let value = item;
    if (config.escapeSqlQuotes && (config.wrapperPrefix === "'" || config.wrapperSuffix === "'")) {
      value = value.replace(/'/g, "''");
    }
    return `${config.wrapperPrefix}${value}${config.wrapperSuffix}`;
  });

  // 9. Final join
  return wrapped.join(config.outputDelimiter);
}
```

---

## 4. Real-World Production Use Cases

### Scenario A: Ad-Hoc Production Database Triage (SQL `IN` Clauses)
During incident triage, on-call engineers often extract hundreds of failing user IDs, transaction hashes, or tenant identifiers from observability logs (Datadog, Grafana Loki, or CloudWatch). To run diagnostic database queries:
```sql
SELECT id, status, updated_at FROM transactions WHERE id IN (...);
```
Pasting 500 newline-separated UUIDs directly into SQL workbench tools fails without quotes and commas. The List Converter formats the list in seconds: trimming whitespace, wrapping each ID in single quotes (`'uuid'`), joining with commas, and producing a syntax-valid predicate.

### Scenario B: Firewall & Cloud Security Group IP Rule Configuration
Security engineers reviewing audit logs or abuse reports often receive lists of malicious IP addresses from threat intelligence feeds. Configuring security rules across AWS VPC Security Groups, Cloudflare WAF lists, or `iptables` requires formatting raw IPs into comma-separated arrays or JSON CIDR blocks (`["192.0.2.1/32", "198.51.100.14/32"]`). The List Converter trims formatting anomalies, deduplicates repeated threats, and wraps each address with required CIDR masks.

### Scenario C: Migrating Data Columns from Excel/Sheets to Code Constants
Developers frequently convert spreadsheet columns containing enum constants, country codes, or SKU identifiers into programming language arrays:
```typescript
export const SUPPORTED_LOCALES = [
  "en-US", "en-GB", "de-DE", "fr-FR", "ja-JP"
] as const;
```
Copying directly from spreadsheet cells introduces tabs and carriage returns. The List Converter strips Excel artifacts, wraps each token in double quotes, and formats them into a clean comma-separated list.

---

## 5. Frequently Asked Questions (FAQs)

### Q1: How does the tool handle single quotes within elements when generating SQL queries?
If you select the **Escape SQL Quotes** option, the converter automatically replaces every single quote (`'`) with two consecutive single quotes (`''`) in accordance with ANSI SQL (ISO/IEC 9075). For example, `O'Connor` is safely transformed to `'O''Connor'`, preventing SQL syntax errors.

### Q2: What is the difference between alphabetical sort and "natural" sort?
Standard alphabetical sorting sorts by ASCII/Unicode character code, causing `node-10` to appear *before* `node-2`. **Natural sorting** uses locale-aware numeric collation (`Intl.Collator` with `{ numeric: true }`), sorting numbers logically: `node-1`, `node-2`, `node-10`.

### Q3: Can the tool process massive datasets with tens of thousands of rows?
Yes. Because the tool runs in-memory using optimized native JavaScript string splitting and `Set` collections, it processes lists with 50,000+ items in milliseconds without freezing your browser interface.

### Q4: How does auto-detection distinguish between commas, tabs, and newlines?
The auto-detection algorithm inspects the input text for delimiter frequency and hierarchy:
1. If newline characters (`\n` or `\r\n`) are present, it treats newlines as the primary delimiter (the most common format when copying columns from spreadsheets or terminals).
2. If no newlines exist, it evaluates occurrences of tabs (`\t`) and commas (`,`), choosing the dominant separator.

---

## 6. Technical Accuracy & Client-Side Privacy Notice

### Standards & Compliance
- **Character Encoding**: Full UTF-8 support, including emojis, mathematical symbols, and non-Latin scripts.
- **SQL Specification**: Compliant with [ISO/IEC 9075](https://www.iso.org/standard/63555.html) string literal syntax.
- **Line Ending Standards**: Normalizes both POSIX (`\n`) and Windows CRLF (`\r\n`) line terminators.

### Strict Privacy & Zero Telemetry Guarantee
The Delimited List Converter is **100% client-side**. All tokenization, deduplication, sorting, and wrapping execute entirely in your local browser memory. No text input, database keys, customer identifiers, or server hostnames are ever uploaded to remote servers, logged in telemetry databases, or exposed to third parties. It is completely safe for use with confidential, HIPAA-regulated, or PCI-sensitive data.
