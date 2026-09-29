# Text Diff & Code Comparison Engine: Myers Algorithm, Visual Delta Analysis & Privacy-First Document Auditing

## 1. Overview & Core Engineering Problem

Detecting textual variations, code revisions, and configuration drift is an indispensable daily requirement for software engineers, DevOps practitioners, legal reviewers, and technical writers. When comparing software patches, JSON configuration payloads, API response payloads, environment variable files (`.env`), or legal contracts, manual line-by-line inspection is slow, error-prone, and cognitively exhausting.

The **DevTol Text Diff & Comparison Tool** provides an instant, dual-pane and inline visual difference engine built upon the mathematical foundations of sequence alignment algorithms. Designed to run completely client-side inside modern web browsers, it computes the exact character-level and line-level delta between any two arbitrary text blocks without sending a single byte to external servers.

Whether you need to verify an infrastructure configuration change before applying it to production, validate database output records, or inspect subtle whitespace discrepancies in cryptographic keys, DevTol highlights additions, deletions, and modifications with crystal-clear syntax-aware visual markers.

---

## 2. Mathematical Foundations: The Myers Diff Algorithm

At the core of DevTol's text comparison engine lies an optimized implementation of the **Myers Difference Algorithm** (Eugene W. Myers, *An O(ND) Difference Algorithm and Its Variations*, 1986). The Myers algorithm models text comparison as a graph search problem over an edit graph:

- **Edit Graph Coordinates**: Given text $A$ of length $N$ and text $B$ of length $M$, an edit graph is constructed from $(0, 0)$ to $(N, M)$.
- **Horizontal Edges**: Represent deletion of a character from text $A$.
- **Vertical Edges**: Represent insertion of a character into text $B$.
- **Diagonal Edges**: Represent identical matching characters between $A$ and $B$, which incur zero cost.
- **Shortest Edit Path (SES)**: The algorithm finds the path with the minimum number of non-diagonal moves (cost $D$), representing the Shortest Edit Script that transforms $A$ into $B$.

By leveraging greedy breadth-first search and diagonal heuristics, the algorithm achieves near-linear $O(ND)$ time complexity, ensuring instantaneous diff rendering even for multi-thousand-line source code files.

```
       Original Text (A)            Modified Text (B)
             ↓                             ↓
     [ Tokenization ]              [ Tokenization ]
             ↓                             ↓
    [ Longest Common Subsequence (LCS) Calculation ]
             ↓
    [ Myers Edit Graph Search (Minimum Edit Script) ]
             ↓
     ┌─────────────────────────────┬─────────────────────────────┐
     │ Line-Level Additions (+)    │ Line-Level Deletions (-)    │
     ├─────────────────────────────┴─────────────────────────────┤
     │      Sub-Line Intra-Word Character Delta Highlight        │
     └───────────────────────────────────────────────────────────┘
```

---

## 3. Advanced Comparison Modes & Key Features

### Split (Side-by-Side) vs. Unified (Inline) Diff Views
- **Split Diff (Side-by-Side)**: Displays the original document on the left and the modified version on the right with synchronized vertical scrolling. This layout is optimal for code review pull requests, complex architectural refactors, and side-by-side legal clause auditing.
- **Unified Diff (Inline)**: Displays changes sequentially in a single scrolling pane, using industry-standard `+` (green) and `-` (red) indicators. This format mirrors standard Git CLI output (`git diff`) and patch files.

### Word-Level and Character-Level Precision
Basic diff utilities only report entire lines as changed, forcing engineers to manually scan long sentences or minified strings to identify what actually changed. DevTol implements a secondary pass over modified lines to compute **intra-line character deltas**, highlighting the exact words, characters, or punctuation marks that were modified within an edited line.

### Whitespace & Case Insensitivity Toggles
- **Ignore Whitespace**: Disregards differences in indentation spaces, tab characters, and trailing whitespace—essential when reviewing code where indentation was reformatted without changing logic.
- **Ignore Line Breaks**: Normalizes Windows (`\r\n`) and Unix (`\n`) newline representations to prevent phantom differences caused by cross-platform Git checkouts.
- **Case-Insensitive Comparison**: Allows comparing text blocks while ignoring upper/lowercase discrepancies.

---

## 4. Step-by-Step Usage Guide

1. **Insert Original Text**: Paste your baseline text, code file, or document into the left-hand pane ("Original Text").
2. **Insert Modified Text**: Paste the revised or updated text block into the right-hand pane ("Changed Text").
3. **Select Comparison Mode**: Toggle between **Split View** and **Unified View** depending on your inspection preference.
4. **Inspect Visual Deltas**:
   - Green blocks represent inserted content.
   - Red blocks represent deleted content.
   - Darker highlighted sub-spans indicate exact intra-line character changes.
5. **Copy or Export Differences**: Easily copy the diff or specific lines directly to your clipboard.

---

## 5. Security & Zero-Leakage Privacy Architecture

Text comparisons frequently involve confidential, high-risk assets:
- Proprietary source code algorithms prior to public release.
- Production environment configurations containing database URLs and API endpoints.
- Unreleased financial statements, internal memos, and confidential legal agreements.

Sending this data to web-based diff tools that transmit payloads to remote servers exposes organizations to severe security vulnerabilities, data scrapers, and compliance breaches. DevTol processes all text entirely within your local browser's V8 or JavaScriptCore runtime engine. No text strings are stored, transmitted over HTTP, or logged to remote servers, making DevTol fully safe for enterprise, air-gapped, and defense-grade development environments.

---

## 6. Frequently Asked Questions (FAQs)

### Can DevTol compare structured formats like JSON, XML, or YAML?
Yes. While DevTol provides dedicated structural diff tools for JSON (`/json-diff`), the Text Diff tool accurately compares any textual or structured code format, highlighting both syntax and structural divergences.

### Is there a maximum file size limit for text comparison?
Because computation occurs directly within your browser's allocated memory, DevTol comfortably handles documents with tens of thousands of lines. Performance depends on your device's CPU and RAM rather than remote server quotas.

### Does the tool support multi-language and non-English scripts?
Yes. DevTol's diff engine natively supports full UTF-8 encoding, accurately computing deltas across international alphabets, Right-to-Left (RTL) scripts such as Arabic and Hebrew, CJK characters, and emojis.
