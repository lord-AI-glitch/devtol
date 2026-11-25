# Professional YAML Prettifier & Formatter: Syntax Standards, Indentation Normalization & DevOps Pipeline Security

## 1. Overview & Operational Significance in Modern DevOps

YAML (YAML Ain't Markup Language) has become the de facto international standard for software configuration, infrastructure as code (IaC), container orchestration, and continuous integration/continuous deployment (CI/CD) pipelines. From Kubernetes manifests (`deployment.yaml`), Docker Compose files (`docker-compose.yml`), GitHub Actions workflows (`.github/workflows/*.yml`), to Ansible playbooks and OpenAPI/Swagger specifications, modern engineering teams manage thousands of lines of YAML daily.

However, unlike JSON or XML which use explicit delimiters (`{}` or `<>`), YAML relies strictly on **significant whitespace and indentation** to define scope and document hierarchy. A single accidental tab character, misaligned two-space indentation, or unescaped colon can invalidate an entire Kubernetes cluster deployment or cause silent CI/CD pipeline failures.

The **DevTol YAML Prettifier & Formatter** provides a high-reliability, client-side syntax beautifier engineered to inspect, re-indent, and standardize YAML documents. It parses the YAML and re-emits it in a canonical form, normalising indentation and quote style to the YAML 1.2 rules the parser follows.

---

## 2. Technical Indentation Rules & YAML Specifications

YAML enforces rigorous rules regarding whitespace, block mappings, and scalar types:

### Tab Prohibition & Whitespace Standardization
YAML strictly forbids the use of Tab characters (`\t`) for indentation — and the prettifier cannot fix them. A tab-indented document fails to parse, and the tool shows its validation message instead of any output. What the tool *can* fix is uneven space indentation:

```yaml
# Before Prettification (uneven space indentation):
app:
    name: demo
    config:
        debug: true
        level: 2

# After Prettification (normalised to the 2-space default):
app:
  name: demo
  config:
    debug: true
    level: 2
```

A document indented with tabs is a different story: the parser throws `Tabs are not allowed as indentation...` and the tool shows `Provided YAML is not valid.` Replace tabs with spaces first — the prettifier cannot repair a document it cannot parse.

### Multi-Document YAML Streams (`---`)
Kubernetes and CI/CD configurations often concatenate multiple distinct resources in a single file separated by three hyphens (`---`). DevTol does not support multi-document streams: such a file fails to parse (`Source contains multiple documents...`), so split the stream into single documents before formatting.

### Literal and Folded Block Scalars (`|` and `>`)
Handling multi-line shell scripts, configuration scripts, and documentation blocks inside YAML requires precise scalar block styling:
- **Literal Block Scalar (`|`)**: Preserves all internal line breaks and newlines exactly as written—essential for multi-line bash scripts in GitHub Actions or Kubernetes `ConfigMap` data.
- **Folded Block Scalar (`>`)**: Folds multiple lines into a single continuous space-delimited string while preserving blank line breaks.
DevTol formats block scalars without corrupting internal line indentation. One style detail: the value is preserved, but the block style is not — a folded (`>`) block is re-emitted as a literal (`|`) block with the same folded value.

---

## 3. Step-by-Step Practical Usage Guide

1. **Input YAML Content**: Paste your raw, misaligned, or problematic YAML document into the editor.
2. **Review Real-Time Validation**: If there are syntax errors — bad indentation, unclosed quotes, or illegal duplicate keys — the tool shows the generic validation message `Provided YAML is not valid.` and no output. Fix the document and try again.
3. **Select Indentation Preference**: Set the indent size — any number from 1 to 10 spaces (default 2) — and optionally switch on Sort keys to reorder mappings alphabetically.
4. **Copy or Export**: Use the one-click copy button to transfer the clean YAML into your Git repository, IDE (VS Code, IntelliJ), or deployment terminal.

---

## 4. Security & Zero-Server Transmission Guarantee

Infrastructure configuration files often contain the most critical secrets of an organization:
- Kubernetes secrets with Base64-encoded TLS private keys and database passwords.
- Cloud provider IAM credentials, service account tokens, and webhook URLs.
- Sensitive environment variables and internal network CIDR blocks.

Pasting these documents into cloud-hosted formatters that transmit payloads over the web poses a catastrophic supply-chain security vulnerability. DevTol processes all YAML locally inside your browser: no data is transmitted to a server and nothing is stored.

---

## 5. Frequently Asked Questions (FAQs)

### Why does my YAML fail with a tab error?
Tab characters are illegal as YAML indentation. The parser throws `Tabs are not allowed as indentation...` and the tool shows its validation message instead of any output. Replace tabs with spaces first — the prettifier cannot repair a document it cannot parse.

### Does the prettifier preserve YAML comments?
No. Comments are dropped when the parser reads the document — the prettifier re-emits only the data, so a `# top comment` or an inline note disappears from the output. Keep a commented copy elsewhere if the comments matter.

### Can DevTol validate Kubernetes manifests and Helm values files?
Yes — the tool parses generic YAML, so Kubernetes manifests, Custom Resource Definitions (CRDs), and Helm `values.yaml` files are formatted like any other YAML document. There is no Kubernetes-specific handling.

---

## 6. Worked Examples: Real Prettified Output

### Indentation sizes

The indent control accepts any value from 1 to 10 spaces (default 2). The same document at indent 2:

```yaml
services:
  web:
    image: nginx:alpine
    ports:
      - 80:80
      - 443:443
    environment:
      NODE_ENV: production
      LOG_LEVEL: debug
    restart: always
```

and at indent 4:

```yaml
services:
    web:
        image: nginx:alpine
        ports:
            - 80:80
            - 443:443
        environment:
            NODE_ENV: production
            LOG_LEVEL: debug
        restart: always
```

Note that the quoted port mappings `"80:80"` lose their quotes in the output. The value is unchanged — it is still the string `80:80` — only the quoting style is normalised.

### Sorting keys

Switching on **Sort keys** reorders every mapping alphabetically:

```yaml
# Input:
zebra: 1
apple: 2
mango: 3

# Output with Sort keys on:
apple: 2
mango: 3
zebra: 1
```

### Block scalars

Literal blocks keep their line breaks, and a folded block is re-emitted as a literal block with the same folded value:

```yaml
# Input:
folded: >
  one two
  three four

# Output:
folded: |
  one two three four
```

The text value is identical; only the block style changes. Input that fails to parse shows the message `Provided YAML is not valid.`

### Errors and dropped comments

Two inputs do not prettify at all, and one transformation is lossy in a way worth knowing:

- A tab used for indentation makes the parser throw `Tabs are not allowed as indentation at line 2, column 1:`, so the tool shows the validation message and no output. Replace tabs with spaces first; the prettifier cannot repair a document it cannot parse.
- Several documents separated by `---` throw `Source contains multiple documents; please use YAML.parseAllDocuments() at line 2, column 1:`. Split the stream into single documents before formatting.
- Comments do not survive. This input:

```yaml
# top comment
key: value # inline note
```

formats to just `key: value`. The parser discards comments when it reads the document, so the prettifier has nothing to re-emit. Keep a commented original somewhere safe before formatting if the comments matter.
