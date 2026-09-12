# Markdown to HTML: CommonMark & GFM Specifications, AST Parsing & XSS Sanitization

## 1. Quick Overview & Core Advantages
Markdown is a lightweight, human-readable plain-text formatting syntax created in 2004 by John Gruber and Aaron Swartz. Over the subsequent two decades, informal variations led to ambiguities, prompting the formalization of the **CommonMark Specification** and **GitHub Flavored Markdown (GFM)** (RFC 7763 / RFC 7764). Today, Markdown serves as the primary authoring language for technical documentation, blog platforms, static site generators (Astro, Next.js, Hugo, VitePress), and developer communication tools.

Our client-side **Markdown to HTML Converter** transforms raw Markdown syntax into clean, semantic, and sanitized HTML5 markup in real-time.

### Core Advantages & Zero-Knowledge Architecture
- **100% Client-Side AST Tokenization**: Documents, technical specifications, and proprietary markdown notes are parsed in your browser. No articles or draft content are sent to remote servers.
- **Strict CommonMark & GFM Support**: Full support for tables, strikethrough, task lists, fenced code blocks with language identifiers, footnotes, and autolinks.
- **Built-in DOMPurify Security Sanitization**: Actively neutralizes Cross-Site Scripting (XSS) vectors, invalid script tags, and malicious `onerror` attributes before HTML rendering.

---

## 2. Step-by-Step Usage Guide

### Converting Markdown to Sanitized HTML
1. **Input Markdown**: Paste or type your formatted Markdown text into the source editor pane.
2. **Configure Parser Extensions**:
   - *GFM Tables*: Renders pipe tables (`| Col 1 | Col 2 |`) into accessible `<table>` markup.
   - *Syntax Highlighting Classes*: Generates language tokens for Prism.js or Highlight.js.
   - *Typographic SmartyPants*: Converts straight quotes (`""`) to curly typographical quotes.
   - *HTML Sanitization*: Enforces DOMPurify filtering to prevent arbitrary JavaScript execution.
3. **Inspect Output Modes**:
   - **Visual Preview**: Live interactive rendering of the styled HTML document.
   - **Raw HTML Code**: Clean, indented HTML tags ready for copy-pasting into CMS templates or email builders.
4. **Export**: Copy raw HTML or download as an `.html` file.

### Markdown to HTML Conversion Example
```markdown
## System Architecture
* Zero-latency processing
* **End-to-End** encryption

| Protocol | Port | Transport |
| :--- | :--- | :--- |
| HTTPS | 443 | TCP / QUIC |
```
Renders into semantic HTML5:
```html
<h2>System Architecture</h2>
<ul>
  <li>Zero-latency processing</li>
  <li><strong>End-to-End</strong> encryption</li>
</ul>
<table>
  <thead>
    <tr>
      <th style="text-align:left">Protocol</th>
      <th style="text-align:left">Port</th>
      <th style="text-align:left">Transport</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="text-align:left">HTTPS</td>
      <td style="text-align:left">443</td>
      <td style="text-align:left">TCP / QUIC</td>
    </tr>
  </tbody>
</table>
```

---

## 3. Technical Deep-Dive: Abstract Syntax Trees (AST) & Parser Phases

Modern Markdown engines do not use simple regex substitution; regex cannot properly handle nested lists, escaped backticks, or blockquotes. Compliant parsers (such as `markdown-it` or `marked`) process content in two discrete phases:

```
[ Raw Markdown Text ] 
       │
       ▼ (Phase 1: Lexical Block & Inline Tokenization)
[ Tokens / Abstract Syntax Tree (AST) ]
       │
       ▼ (Phase 2: HTML Renderer)
[ Raw HTML String ]
       │
       ▼ (Phase 3: DOMPurify Sanitization)
[ Safe, Accessible HTML5 ]
```

### High-Performance TypeScript Implementation with Sanitization
```typescript
import { marked } from 'marked';
import DOMPurify from 'dompurify';

export interface ConversionOptions {
  gfm: boolean;
  breaks: boolean;
  sanitize: boolean;
}

export function convertMarkdownToHtml(
  markdown: string,
  options: ConversionOptions = { gfm: true, breaks: false, sanitize: true }
): string {
  // Configure marked parser
  marked.setOptions({
    gfm: options.gfm,
    breaks: options.breaks
  });

  // Step 1: Parse Markdown to raw HTML
  const rawHtml = marked.parse(markdown) as string;

  // Step 2: Security Sanitization pass
  if (options.sanitize) {
    return DOMPurify.sanitize(rawHtml, {
      USE_PROFILES: { html: true },
      ADD_ATTR: ['target', 'rel']
    });
  }

  return rawHtml;
}
```

---

## 4. Real-World Production Use Cases
1. **Headless CMS & Static Site Publishing**: Ingesting Markdown blog posts and technical guides authored by editorial teams and compiling them into static HTML at build time within Astro, Nuxt, or Next.js pipelines.
2. **Developer Knowledge Bases**: Rendering user-submitted API feedback, issue tracker descriptions, and discussion forum comments in platforms like GitHub or Jira.
3. **Automated Release Notes Generation**: Parsing git commit logs and tag release notes written in Markdown and transforming them into rich HTML newsletters and customer notification emails.

---

## 5. Frequently Asked Questions (FAQs)

### What is the difference between CommonMark and GitHub Flavored Markdown (GFM)?
CommonMark is the base formal specification that standardizes core Markdown grammar (headings, lists, code spans, emphasis). GFM is a strict superset of CommonMark created by GitHub that adds critical developer features, including pipe tables, task lists (`- [x]`), autolinking URLs, and strikethrough (`~~text~~`).

### How does this converter prevent XSS attacks?
If Markdown allows raw HTML (e.g., `<script>alert(1)</script>` or `<img src=x onerror=stealCookies()>`), malicious users can execute arbitrary scripts in the reader's browser. Our converter runs all output through DOMPurify, an industry-standard XSS sanitizer that strips executable tags and dangerous event handlers while preserving safe HTML structure.

### Why do consecutive single newlines not create a line break?
Under CommonMark rules, soft line breaks within a paragraph are treated as spaces. To trigger an explicit hard line break (`<br>`), you must either end the line with two trailing spaces or enable the GFM `breaks: true` configuration option.

### Can I convert HTML back to Markdown?
Yes, using AST reverse-parsers such as `Turndown`. However, because HTML supports arbitrary nested `<div>` and `<span>` tags that have no direct Markdown equivalents, reverse conversion is often lossy, whereas Markdown-to-HTML conversion is lossless.

---

## 6. Privacy & Security Notice
All Markdown parsing, tokenization, and HTML sanitization execute strictly inside your local browser sandbox. Your technical documentation, private notes, and internal wiki content are never uploaded to remote cloud servers.
