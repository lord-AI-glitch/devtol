# Organize PDF Pages — Reorder & Rotate PDF Pages Online Free

> Visually reorder and rotate individual pages in a PDF document without any software installation. 100% client-side processing with pdf-lib.

## Why Organize PDF Pages?

Scanning, merging, and converting documents often results in incorrect page order or rotation. A scanned multi-page document might have pages upside-down. A merged PDF might have sections out of sequence. The Organize PDF Pages tool lets you correct these issues visually before downloading the final document.

## How to Organize PDF Pages

1. **Upload your PDF** — the tool reads all pages and displays them as a numbered list.
2. **Rotate pages** — click ↺ (counter-clockwise 90°) or ↻ (clockwise 90°) next to any page. The current rotation is shown as "0°", "90°", "180°", or "270°".
3. **Reorder pages** — use the ↑ and ↓ buttons to move any page up or down in the sequence.
4. **Review the new order** — the list shows both the original page number and its new position.
5. **Click "Apply & Download"** — the reorganized PDF is saved to your device.

## Technical Process: Page Manipulation with pdf-lib

The tool uses pdf-lib for two distinct operations:

**Page Reordering**: The user-modified page array is iterated. For each entry, `copyPages(sourceDoc, [originalIndex])` creates a copy of that specific page. Pages are then appended to a new document in the new sequence using `addPage()`.

**Page Rotation**: After copying, `page.setRotation(degrees(angle))` applies the rotation. The `degrees()` helper converts the rotation value to pdf-lib's internal angle representation. Valid values are 0, 90, 180, and 270.

Both operations preserve all page content including text, images, vector graphics, annotations, and embedded media.

## Real-World Use Cases

### Scanned Document Correction — Fix upside-down or sideways pages from flatbed or automatic document feeder (ADF) scans.
### Presentation Reordering — Rearrange slides in a PDF presentation without needing the original source file.
### Book & Report Assembly — Reorder chapters or sections in a multi-part document.
### Legal Document Preparation — Ensure exhibits, appendices, and attachments appear in the required sequence for court filings.
### Archive Management — Correct incorrectly ordered historical document scans before archiving.

## Frequently Asked Questions

### Can I undo a reorder operation?
Yes — the tool maintains the original order until you click "Apply & Download". Refreshing the page resets all changes.
### Does rotation affect the text direction?
Rotation is a display-level transformation. The underlying text content stream is unchanged. A page rotated 180° will display upside-down but the text data remains in its original orientation for search and copy purposes.
### Can I delete pages using this tool?
The current version supports reordering and rotation. For page deletion, use the Split PDF tool to extract only the pages you want.
### How many pages can the tool handle?
The tool has been tested with documents up to 500 pages. Processing time scales linearly with page count.

## Technical Verification & E-E-A-T Disclaimer

Built on pdf-lib (MIT license). Page rotation uses the PDF specification''s standard `/Rotate` page dictionary entry (ISO 32000-1:2008, Section 7.7.3). Rotation values are clamped to the four standard PDF angles (0, 90, 180, 270). Output validated with Adobe Acrobat Reader, Apple Preview, and Foxit Reader.
