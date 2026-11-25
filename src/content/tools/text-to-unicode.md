# Online Text to Unicode Converter: Decimal HTML Entities & Back

## 1. Quick Overview & Core Advantages
The **Online Text to Unicode Converter** is an encoding inspection and conversion utility engineered for software developers, internationalization (i18n) engineers, and security analysts. It converts each character of a text into its **decimal HTML entity** (`&#65;` for `A`) and decodes decimal entities back into readable text. There is one output format and one decode direction — no code-point view, no byte view, and no escape-sequence output.

Everything runs locally in your browser: submitted texts never leave local browser memory, and all entity conversion happens inside the page.

### Core Technical Advantages
- **Local Processing**: All character parsing runs locally with zero external network requests.
- **Decimal Entities Only**: Every character maps to one `&#NNN;` entity, where NNN is the character's UTF-16 code-unit number. Hex entities (`&#x41;`) are not produced and are not recognised when decoding.
- **Two Entities for Astral Characters**: Characters above the Basic Multilingual Plane, such as 🚀, occupy two UTF-16 code units, so the tool emits two entities (`&#55357;&#56960;`) — not the single code-point entity `&#128640;`.
- **Bidirectional Conversion**: Encode text into decimal entities, or decode decimal entities back into readable text.

---

## 2. How to Use Step-by-Step Guide

### Converting Text to Unicode Code Points
1. **Enter Text**: Input text containing standard characters, emojis, or international scripts into the text area.
2. **Read the Entity String**: One `&#NNN;` entity appears per character, joined into a single string.
3. **Copy Converted Result**: Click **Copy** to export the encoded string into your source code.

```text
Conversion Example:
Input:   "Aé"
Output:  "&#65;&#233;"

Input:   "🚀"
Output:  "&#55357;&#56960;"
```

🚀 is a single character, but it needs two UTF-16 code units, so it becomes two entities. `&#128640;` is the entity for the same character's code point (128640) — a browser renders both forms the same way, but this tool only emits the two-entity form.

---

## 3. Algorithmic & Encoding Deep Dive

### How the Tool Maps Characters

The tool works on UTF-16 code units, not on code points. Encoding splits the string into single code units and wraps each unit's number in `&#...;`; decoding reverses the mapping with a regular expression that only matches decimal entities:

```typescript
// The tool's entire conversion logic (text-to-unicode.service.ts)
function convertTextToUnicode(text: string): string {
  return text.split('').map(value => `&#${value.charCodeAt(0)};`).join('');
}

function convertUnicodeToText(unicodeStr: string): string {
  return unicodeStr.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));
}
```

### Why One Emoji Becomes Two Entities

Most characters fit in a single 16-bit code unit, but code points from `U+10000` to `U+10FFFF` cannot — JavaScript stores them as a pair of 16-bit values called surrogates. The rocket 🚀 is code point `U+1F680`; its surrogate pair is `0xD83D` (decimal 55357) and `0xDE80` (decimal 56960), so the tool emits `&#55357;&#56960;`. Keep the pair together when pasting it into source code — splitting it produces two invalid characters.

---

## 4. Real-World Production & i18n Use Cases

### 1. Embedding Characters as HTML Entities
When a character cannot be typed or stored directly — in an HTML template, an email body, or a legacy database field — its decimal entity is a safe ASCII-only stand-in that browsers render back into the original character.

### 2. Decoding Entities Found in Scraped HTML
HTML source copied from a page often contains decimal entities instead of the characters themselves. Pasting the fragment into the decoder restores the readable text, leaving the surrounding words untouched.

---

## 5. Frequently Asked Questions (FAQs)

### What is the difference between UTF-8 and Unicode?
Unicode is a character set standard that assigns unique numbers (code points) to characters. UTF-8 is a specific binary encoding scheme that translates those code points into 1 to 4 variable-length bytes.

### Does the tool produce hex entities such as `&#x41;`?
No — decimal only. Hex entities are not produced, and when decoding they are left untouched, since the decoder only recognises `&#digits;`.

### What are surrogate pairs in JavaScript strings?
JavaScript strings historically use UTF-16 code units. Characters with code points above `0xFFFF` require two 16-bit code units (a surrogate pair) to be represented in JavaScript memory.

### Is my text submitted to any remote server?
No. All entity conversion occurs locally in your browser memory.

---

## 6. Security and Privacy Guarantee
- **Local Browser Parsing**: No characters leave your machine.
- **Zero Network Transmission**: Processing is completely isolated in client memory.
- **Decimal Entities Only**: One output format — `&#NNN;` per UTF-16 code unit — and one decode direction.

---

## 7. Worked Examples: What the Tool Actually Emits

The tool has exactly one output format: decimal HTML entities, one per UTF-16 code unit. There is no code-point or escape-sequence view.

### Text to entities

```text
Input:   "Aé"
Output:  "&#65;&#233;"

Input:   "Hi"
Output:  "&#72;&#105;"
```

Each character maps to its decimal code unit number wrapped in `&#...;`. The letter `A` is code unit 65, so it becomes `&#65;`.

### Characters above the Basic Multilingual Plane

The rocket emoji 🚀 is a single character, but it needs two UTF-16 code units (a surrogate pair), so the tool emits two entities:

```text
Input:   "🚀"
Output:  "&#55357;&#56960;"
```

That is not the same as `&#128640;`, which is the single entity for the emoji's code point 128640. A browser renders both forms identically, but if you paste the tool's output into source code, keep the pair together — splitting it produces two invalid characters.

### Entities back to text

Decoding reverses the mapping:

```text
Input:   "&#72;&#105;"
Output:  "Hi"
```

Only decimal entities of the form `&#digits;` are recognised. Hex entities such as `&#x41;` are left untouched.

### Mixed text decodes in place

The decoder only touches decimal entities and leaves everything else exactly where it is:

```text
Input:   "Say &#72;&#105;!"
Output:  "Say Hi!"
```

The plain words `Say` and `!` pass through unchanged while the two entities become `H` and `i`. That makes the tool handy for cleaning up a fragment of HTML source: paste the fragment, decode, and the readable text appears with the surrounding words still in position. One limit to remember: a hex entity such as `&#x41;` is not a decimal entity, so it is left untouched and stays in the output as written.
