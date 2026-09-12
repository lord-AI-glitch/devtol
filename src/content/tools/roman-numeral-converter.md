# Roman Numeral Converter: Bi-Directional Parsing, Subtractive Notation & Algorithmic Validation

## 1. Overview & Core Advantages
The Roman numeral system originated in ancient Rome and served as the standard arithmetic and record-keeping notation across Europe until the gradual adoption of the Hindu-Arabic decimal positional system in the late Middle Ages. In contemporary computing, software engineering, and digital publishing, Roman numerals remain extensively deployed for numbering book prefaces, legal statute subsections, copyright years in media metadata, periodic table groups, clock dials, astronomical nomenclature, and recurring global events (such as the Olympic Games and Super Bowls).

Our Roman Numeral Converter provides **instantaneous, bi-directional conversion** between standard Hindu-Arabic integers ($1$ to $3,999$ or extended Vinculum notation) and standardized subtractive Roman numerals.

### Core Architectural Advantages
- **Zero Server Transmission**: Computation is executed 100% client-side inside the user's browser sandbox via pure JavaScript. No query strings, integer inputs, or generated roman representations are logged, cached, or transmitted across the network.
- **Strict Grammar Validation**: Built-in AST-level parsing filters out invalid non-standard sequences (e.g., rejecting `IIII`, `IL`, or `IC` while accepting canonical subtractive forms like `IV` and `XC`).
- **Bi-Directional Synchronous Evaluation**: Real-time reactivity updates Arabic-to-Roman and Roman-to-Arabic values with zero UI latency.
- **Support for Classical & Modern Formats**: Standard range from $1$ (`I`) to $3,999$ (`MMMCMXCIX`), with strict compliance to modern subtractive formatting rules.

---

## 2. Theoretical Principles & Algorithmic Mechanics

### The Standard Subtractive Notation System
Standard Roman numerals are constructed using seven basic glyphs derived from the Latin alphabet:

| Symbol | Numerical Value | Category | Maximum Consecutive Repetitions |
| :--- | :--- | :--- | :--- |
| `I` | 1 | Unit Base 10 | 3 |
| `V` | 5 | Intermediate Base 5 | 1 (Never repeated) |
| `X` | 10 | Unit Base 10 | 3 |
| `L` | 50 | Intermediate Base 5 | 1 (Never repeated) |
| `C` | 100 | Unit Base 10 | 3 |
| `D` | 500 | Intermediate Base 5 | 1 (Never repeated) |
| `M` | 1,000 | Unit Base 10 | 3 (Standard canonical range) |

### Strict Subtractive Combination Rules
In classical additive notation, four was written as `IIII`. Under the modernized **subtractive notation** formalized during the Renaissance:
1. Only symbols representing powers of ten (`I`, `X`, `C`) can precede a larger symbol to denote subtraction.
2. The intermediate five-based symbols (`V`, `L`, `D`) can never be subtracted (e.g., 95 is `XCV`, never `VC`).
3. A subtractive symbol can precede only symbols worth 5 or 10 times its value:
   - `I` can precede only `V` (4) and `X` (9).
   - `X` can precede only `L` (40) and `C` (90).
   - `C` can precede only `D` (400) and `M` (900).
4. A subtractive symbol cannot be preceded by a symbol of equal or lesser value in the same group (e.g., `IIV` is strictly invalid; 3 is `III`).

### Algorithmic Complexity & State Machine Parsing

#### Integer to Roman Conversion (Greedy Mapping)
Integer-to-Roman conversion is executed via a greedy evaluation algorithm iterating over a statically ordered dictionary of values and symbols:

$$\text{Values} = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]$$
$$\text{Symbols} = [\text{"M"}, \text{"CM"}, \text{"D"}, \text{"CD"}, \text{"C"}, \text{"XC"}, \text{"L"}, \text{"XL"}, \text{"X"}, \text{"IX"}, \text{"V"}, \text{"IV"}, \text{"I"}]$$

Because the dictionary has a fixed size of 13 entries and the upper bound is 3,999, the time complexity is bounded by $\mathcal{O}(1)$ with constant memory overhead.

#### Roman to Integer Parsing (Lookahead Accumulator)
Parsing a Roman string back into an integer requires evaluating consecutive character pairs. Given a string $S = c_1 c_2 \dots c_n$:
$$\text{Value}(S) = \sum_{i=1}^{n} \begin{cases} -\text{Val}(c_i) & \text{if } i < n \text{ and } \text{Val}(c_i) < \text{Val}(c_{i+1}) \\ +\text{Val}(c_i) & \text{otherwise} \end{cases}$$

---

## 3. Step-by-Step Custom Configuration Guide

### TypeScript Implementation with Strict Validation

```typescript
// Complete, Production-Ready Bi-Directional Converter
export class RomanNumeralConverter {
  private static readonly ROMAN_REGEX =
    /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;

  private static readonly VALUE_MAP: readonly [number, string][] = [
    [1000, 'M'],
    [900, 'CM'],
    [500, 'D'],
    [400, 'CD'],
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ];

  private static readonly CHAR_MAP: Record<string, number> = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000,
  };

  /**
   * Converts an integer (1 to 3999) to a canonical Roman numeral string.
   */
  public static toRoman(arabic: number): string {
    if (!Number.isInteger(arabic) || arabic < 1 || arabic > 3999) {
      throw new RangeError('Arabic input must be an integer between 1 and 3,999.');
    }

    let remainder = arabic;
    let result = '';

    for (const [val, symbol] of this.VALUE_MAP) {
      while (remainder >= val) {
        result += symbol;
        remainder -= val;
      }
    }
    return result;
  }

  /**
   * Parses a Roman numeral string and returns the corresponding integer.
   * Performs strict canonical grammar validation.
   */
  public static toArabic(roman: string): number {
    const sanitized = roman.trim().toUpperCase();

    if (!sanitized) {
      throw new Error('Roman numeral string cannot be empty.');
    }

    if (!this.ROMAN_REGEX.test(sanitized)) {
      throw new Error(`Invalid or non-canonical Roman numeral: "${roman}"`);
    }

    let total = 0;
    for (let i = 0; i < sanitized.length; i++) {
      const currentVal = this.CHAR_MAP[sanitized[i]];
      const nextVal = i + 1 < sanitized.length ? this.CHAR_MAP[sanitized[i + 1]] : 0;

      if (currentVal < nextVal) {
        total -= currentVal;
      } else {
        total += currentVal;
      }
    }

    return total;
  }
}

// Verification Tests
console.log(RomanNumeralConverter.toRoman(2026)); // "MMXXVI"
console.log(RomanNumeralConverter.toRoman(3999)); // "MMMCMXCIX"
console.log(RomanNumeralConverter.toArabic("MMXXVI")); // 2026
```

---

## 4. Production Engineering & Architecture Use Cases

### 1. Digital Publishing & Legal Metadata Generation
In document processing engines (such as PDF generation with Puppeteer, WeasyPrint, or Pandoc), pagination schemes require Roman numerals for front matter (abstract, table of contents, preface) and Arabic numerals for body chapters:
```typescript
interface DocumentSection {
  title: string;
  isFrontMatter: boolean;
  pageNumber: number;
}

function formatPageNumber(section: DocumentSection): string {
  if (section.isFrontMatter) {
    return RomanNumeralConverter.toRoman(section.pageNumber).toLowerCase(); // e.g., "iv", "ix"
  }
  return section.pageNumber.toString();
}
```

### 2. Microservice Legal Statute Parser
Regulatory and legislative compliance microservices ingest municipal codes and statutory instruments where subsections follow structured alphanumeric nesting:
```typescript
// Parses hierarchical statute keys like "Title 14, Chapter IV, Section 12(b)"
function parseStatuteHierarchy(chapterRoman: string): number {
  return RomanNumeralConverter.toArabic(chapterRoman);
}
```

### 3. Media Metadata & Film Copyright Encoding
Streaming platforms, archival databases, and broadcast content ingestion systems parse copyright credit dates often encoded in trailing title cards (e.g., `MCMLXXXIV` for 1984, `MMXXIV` for 2024):
```typescript
function extractCopyrightYear(rawCredit: string): number {
  const match = rawCredit.match(/\b([MDCLXVI]+)\b/);
  if (!match) throw new Error("No Roman numeral found in copyright string");
  return RomanNumeralConverter.toArabic(match[1]);
}
```

---

## 5. Frequently Asked Questions (FAQs)

### Q1: Why is 3,999 (`MMMCMXCIX`) the standard upper limit for Roman numerals?
The classical Roman numeral system lacks a standard single-character symbol for values of $5,000$ or higher in standard Latin typography. Because standard rules permit repeating a unit symbol (`M` = 1,000) at most three times sequentially (`MMM` = 3,000), values starting at $4,000$ require extended notation, such as the medieval **Vinculum** (an overline above a symbol multiplying its value by 1,000, e.g., $\overline{\text{IV}}$ for 4,000). For standard Unicode string processing, 3,999 remains the canonical threshold.

### Q2: Why is the number zero not represented in Roman numerals?
The ancient Romans did not possess a concept of zero as a mathematical placeholder or independent number. Arithmetic was performed physically on counting boards and abaci. The word *nulla* (Latin for "nothing") or the abbreviation *N* was occasionally used by medieval Christian computists (such as Bede) to denote an empty remainder in Easter tables, but no standard numeral glyph exists.

### Q3: Why do some clock dials use `IIII` instead of `IV` for the number four?
Clockmakers historically adopted `IIII` instead of `IV` for visual balance and symmetry. Placing `IIII` on the right half of the dial balances the visually heavy `VIII` on the left half. Furthermore, it creates three distinct groups of four symbols on the dial face: four containing `I` only (`I, II, III, IIII`), four containing `V` (`V, VI, VII, VIII`), and four containing `X` (`IX, X, XI, XII`).

### Q4: Why is `IC` rejected as a valid representation of 99?
Under strict subtractive rules, `I` can only be subtracted from `V` (5) and `X` (10). It cannot be subtracted from `C` (100) or `M` (1000). Ninety-nine must be parsed into decimal components: $90 + 9$. Ninety is represented as `XC` ($100 - 10$) and nine is represented as `IX` ($10 - 1$), resulting in the canonical string `XCIX`. Expressions like `IC` or `IL` represent invalid colloquial abbreviations.

---

## 6. Client-Side Privacy & Security Notice
All conversions executed by this Roman Numeral Converter are performed entirely on the client side using local browser memory. No text, integer calculations, or search parameters are sent over the network or saved to remote logging servers. Your inputs remain 100% private and protected.
