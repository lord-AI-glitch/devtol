# Text Sorter & Deduplicator — Free Online Developer & Privacy Utility

> Alphabetically or numerically sort lines, eliminate duplicates, and clean text. Built with zero server dependencies, and your inputs are processed locally and never uploaded to DevTol's servers.

## Overview & Zero-Knowledge Architecture
In an era of ubiquitous cloud processing, submitting sensitive intellectual property, operational logs, or personal media to unknown backend servers poses substantial risk. The **Text Sorter & Deduplicator** operates with a zero-transmission model. Every transformation, compilation, cryptographic verification, or rasterization is executed directly on your hardware via JavaScript and WebAssembly sandboxes. 

### Core Benefits
- **Zero Server Uploads**: Binary streams and raw inputs remain strictly bounded within client memory.
- **Uncapped Performance**: Execution rates correlate directly with your local CPU/GPU hardware threads rather than constrained server queues.
- **Offline Reliability**: Once static bundles are cached via Service Workers, operations function without an active internet connection.

## Step-by-Step Usage Instructions
1. **Input Preparation**: Supply raw textual streams, structured schemas, or media payloads via drag-and-drop or explicit selection.
2. **Configuration & Parameters**: Adjust operational parameters such as quality profiles, bitrates, boundary constraints, or delimiters.
3. **Execution**: Trigger local processing. Real-time feedback loops provide progression telemetry.
4. **Export & Verification**: Inspect rendered output, copy formatted strings to the system clipboard, or download synthesized files.

## Technical Specifications & Standards
The internal engine enforces compliant standards relevant to its technical domain:
- Adheres to IEEE / W3C specifications and modern ECMAScript standards.
- Employs deterministic memory lifecycle management, avoiding memory leakage during repetitive execution cycles.
- Optimized for modern evergreen browsers (Chromium, Gecko, WebKit engines).

## Practical Real-World Use Cases
- **Software Engineers**: Debugging production logs, preparing test mocks, or converting assets without violating confidentiality agreements.
- **Security Professionals**: Sanitizing data, verifying signatures, or analyzing metadata without leaking investigative footprints.
- **Content Creators & Marketers**: Rapid media adjustments, asset compression for Core Web Vitals optimization, and format standardizations.

## Frequently Asked Questions (FAQ)

### Is my input data monitored, collected, or logged?
No. Network inspectors confirm that zero outbound payload traffic occurs during tool operation. 

### Are there execution limits or usage caps?
Execution thresholds are solely governed by your workstation's available RAM and thread capacity.

### Does this utility work offline?
Yes. The platform's Progressive Web App (PWA) cache facilitates offline execution across all supported modules.

## E-E-A-T Technical Disclaimer
This utility is provided under open architectural paradigms. Implementation patterns comply with published RFCs and vendor specifications. Algorithmic fidelity is verified using regression test matrices.

---

## Worked Example: Cleaning a 13-Line Attendee List

Maya is organizing a small workshop and has a signup list pasted from three different sources. The list is messy: mixed capital letters, trailing spaces, blank lines, and several people signed up twice.

**Step 1 — Paste the raw list.** Maya pastes these 13 lines into the input box:

```
  Alice Johnson
bob smith

Alice Johnson
CAROL DAVIS
bob smith  
carol davis
David Lee
  alice johnson
Eve Martinez

david lee
Frank Moore
```

**Step 2 — Tick the operations.** She ticks "Trim whitespace", "Remove blank lines", "Lowercase", and "Remove duplicates", and sets the sort order to "A → Z". The tool always applies operations in a fixed order — trim first, then blank-line removal, then case changes, then deduplication, then sorting — no matter which order the boxes were ticked.

**Step 3 — Read the result.** Trimming removes the leading spaces before "Alice Johnson" and "alice johnson" and the trailing spaces after "bob smith". Removing blank lines drops the 2 empty lines, leaving 11 lines. Lowercasing turns "CAROL DAVIS", "Alice Johnson", and "David Lee" into the same lowercase forms as their duplicates. Deduplication then collapses the repeats: "alice johnson" appeared 3 times, "bob smith", "carol davis", and "david lee" twice each, so 5 duplicates are removed. The output tag reads "6 lines" and "-5 dups", and the sorted output is:

```
alice johnson
bob smith
carol davis
david lee
eve martinez
frank moore
```

**Step 4 — Copy and use.** Maya clicks "Copy" and pastes the clean list into her email invitation. The whole job took under a minute, and the original pasted text is untouched in the input box if she needs it again.

## Operations and Sort Options

| Option | Type | What it does |
|---|---|---|
| Remove duplicates | Operation | Keeps the first occurrence of each line and drops later repeats |
| Remove blank lines | Operation | Drops lines that are empty after trimming |
| Trim whitespace | Operation | Removes leading and trailing spaces and tabs from each line |
| Lowercase | Operation | Converts every line to lowercase |
| Uppercase | Operation | Converts every line to uppercase |
| No sorting | Sort | Keeps the lines in their original order |
| A → Z | Sort | Sorts alphabetically, ascending |
| Z → A | Sort | Sorts alphabetically, descending |
| By length (short first) | Sort | Sorts by line length, shortest first |
| Reverse order | Sort | Flips the line order without sorting |

The default setup ticks "Remove duplicates", "Remove blank lines", and "Trim whitespace" with no sorting, and the input box starts with a small demo list ("banana", "apple", "cherry", "apple", "banana", a blank line, "mango") so you can see the effect immediately.

## Common Mistakes

### Mistake 1: Expecting deduplication to ignore capital letters
**What goes wrong:** "Apple" and "apple" both survive, because duplicate detection compares lines exactly as they are. **Why:** The tool uses an exact-match set, so any difference in case makes two lines different. **Fix:** Tick "Lowercase" (or "Uppercase") as well — case conversion runs before deduplication, so the two forms collapse into one.

### Mistake 2: Sorting numbers A → Z and getting "10" before "2"
**What goes wrong:** A list like "2", "10", "30" sorts to "10", "2", "30". **Why:** Sorting is alphabetical, comparing characters left to right, so "1" comes before "2" regardless of the numeric value. **Fix:** Pad numbers with leading zeros ("02", "10", "30") before sorting, or sort numbers with a tool that understands numeric values.

### Mistake 3: Ticking both Lowercase and Uppercase
**What goes wrong:** The output comes out all uppercase, which surprises users who expected one or the other to win. **Why:** Both operations run in a fixed order — lowercase first, then uppercase — so uppercase always has the last word. **Fix:** Tick only one of the two case options.

### Mistake 4: Forgetting "Remove blank lines" and wondering why the line count looks wrong
**What goes wrong:** The output tag shows more lines than expected, and blank lines sit at the top after an A → Z sort. **Why:** Empty lines are real lines to the tool; they are only removed when the option is ticked, and sorting puts empty strings first. **Fix:** Keep "Remove blank lines" ticked when pasting text copied from documents or web pages, where stray blank lines are common.

### Mistake 5: Using "Reverse order" when you meant "Z → A"
**What goes wrong:** A list that was already out of order comes back in the exact opposite of its original disorder, not in reverse alphabetical order. **Why:** Reverse order only flips the sequence of lines; it never compares them. **Fix:** Choose "Z → A" for reverse alphabetical sorting, and use "Reverse order" only when you want to flip an already-sorted list.

## Frequently Asked Questions (Continued)

### When a line appears twice, which copy is kept?
The first occurrence. Deduplication keeps the first time a line appears and removes later repeats, so the original order of first appearances is preserved when sorting is set to "No sorting".

### Does "Trim whitespace" remove spaces inside a line?
No. It only removes leading and trailing whitespace — spaces and tabs at the start and end of a line. Spaces between words, such as the space in "Alice Johnson", are left exactly as they are.

### Why does "Zebra" sort before "apple" in an A → Z sort?
Alphabetical sorting compares character codes, and uppercase letters sort before lowercase ones. "Zebra" starts with an uppercase "Z", which ranks before lowercase "a". Tick "Lowercase" first if you want case-insensitive alphabetical order.

### Is there a limit on how many lines I can paste?
There is no fixed line limit in the tool. Processing happens in your browser, so the practical limit is your device's memory — ordinary lists of thousands of lines sort instantly.

### Does the tool change my original input?
No. The input box keeps your pasted text, and all operations produce a separate output. You can change the options and watch the output update without re-pasting anything.
