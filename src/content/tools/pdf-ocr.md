# PDF OCR Text Extractor — Extract Text from Scanned PDFs Online

> Use AI-powered Optical Character Recognition to extract editable text from scanned PDF documents and images. Supports English, Arabic, French, German, Spanish, and more. Fully client-side.

## What is PDF OCR and Why Do You Need It?

Scanned PDFs are image-based — they look like text documents but contain no machine-readable text. You cannot search, copy, or edit the text because it exists only as pixels in an image. OCR (Optical Character Recognition) analyzes these pixel patterns and converts them to actual text characters.

Our PDF OCR tool uses **Tesseract.js** — a WebAssembly port of Google''s industry-leading Tesseract OCR engine — running entirely in your browser. No scan data is transmitted to any server.

## How to Extract Text from a Scanned PDF

1. **Upload your scanned PDF** or image file (PNG, JPG, TIFF, WebP).
2. **Select the document language** from the dropdown (English, Arabic, French, German, Spanish).
3. **Click "Extract Text"** — a progress bar shows recognition progress.
4. **Review the extracted text** in the output textarea.
5. **Copy the text** to clipboard with one click.

## How Tesseract.js OCR Works

The OCR pipeline involves multiple steps:

1. **PDF Rendering**: Each PDF page is rendered to an HTML5 canvas using pdfjs-dist at 2× scale (approximately 150 DPI) to ensure sufficient resolution for accurate recognition.
2. **Preprocessing**: Tesseract internally applies adaptive thresholding to binarize the image (convert to black/white), deskewing to correct slight rotational misalignments, and line detection to identify text baselines.
3. **Character Recognition**: The neural network model (LSTM-based, trained on millions of document samples) analyzes image regions and produces a probability distribution over possible characters.
4. **Word Assembly**: Characters are assembled into words using a language model and dictionary matching to resolve ambiguities.
5. **Output**: Text is assembled in reading order and returned with a confidence score (0–100%).

## Supported Languages & Scripts

Tesseract.js supports over 100 languages. This tool includes:
- **English** (eng) — Latin script, optimized for printed text
- **Arabic** (ara) — RTL text, includes Arabic numerals
- **French** (fra) — Latin with diacritics (é, à, ù, etc.)
- **German** (deu) — Latin with umlauts (ä, ö, ü, ß)
- **Spanish** (spa) — Latin with ñ, accents
- **Chinese Simplified** (chi_sim) — Ideographic characters

## Real-World Use Cases

### Legal Discovery — Convert hundreds of scanned legal documents into searchable, copyable text for review.
### Academic Research — Extract text from scanned historical documents, academic papers, or book chapters.
### Data Entry Automation — Convert paper forms, invoices, and receipts to digital text for database entry.
### Accessibility — Make scanned PDFs accessible to screen readers by extracting and re-publishing the text.
### Archive Digitization — Convert institutional paper archives to searchable digital text.
### Medical Records — Extract text from scanned medical documents for electronic health record systems.

## Tips for Better OCR Accuracy

| Factor | Recommendation |
|--------|---------------|
| **Scan Resolution** | 300 DPI minimum; 600 DPI for best results |
| **Contrast** | High contrast between text and background |
| **Orientation** | Pages should be straight (use PDF Organize to fix skewed scans) |
| **Font Size** | Text below 8pt may not be recognized accurately |
| **Language** | Always select the correct language for better accuracy |

## Frequently Asked Questions

### What accuracy can I expect?
On clean, well-scanned documents at 300 DPI, Tesseract typically achieves 97–99% character accuracy. For poor-quality scans with noise, stains, or unusual fonts, accuracy may drop to 85–95%.
### Can the tool handle handwriting?
Tesseract is optimized for printed text. Handwriting recognition accuracy is significantly lower (50–70%) and varies with handwriting clarity.
### Does Arabic text appear in the correct direction?
Yes. The Arabic language model outputs right-to-left text correctly. However, the textarea display direction should be set to RTL in a text editor for proper viewing.
### Can I use this for a passport or ID scan?
Technically yes, but we recommend against processing identity documents online. This tool is client-side, but treat personal document data with appropriate caution.

## Technical Verification & E-E-A-T Disclaimer

Built on Tesseract.js v5 (Apache 2.0 license), which wraps Tesseract 4.1+ LSTM engine. The LSTM model was trained on 4,500+ fonts across 100+ languages by Google Research. Recognition accuracy benchmarks are maintained by the Tesseract project at github.com/tesseract-ocr.

---

## Worked Example: Extracting Text from an 18-Page Arabic Invoice Scan

Nadia runs a small bookkeeping office and receives an 18-page scan of Arabic supplier invoices. The PDF is image-only — she cannot search it for "فاتورة" or copy a single amount — and she needs the text in a spreadsheet.

**Step 1 — Check the scan quality.** Nadia opens the PDF and zooms into page 4. The print is crisp, the pages are straight, and the scan looks like 300 DPI. She knows from the accuracy table that 300 DPI is the minimum for reliable results, so she proceeds instead of rescanning.

**Step 2 — Select Arabic and extract.** She uploads the file, selects Arabic (ara) from the language dropdown — not English, even though the invoices contain some Latin digits — and clicks "Extract Text". The progress bar advances page by page. After about 2 minutes the output textarea shows the recognised text, with a confidence score of 96%.

**Step 3 — Verify the numbers.** She copies the text and pastes it into her editor, set to RTL display. She spot-checks five invoice totals against the scanned images: 4,250 EGP on page 2, 18,900 EGP on page 7, 7,300 EGP on page 11, 12,150 EGP on page 14, and 950 EGP on page 18. Four match exactly; on page 11 the OCR read "7,300" as "7,800", so she corrects that one figure by hand. The lesson is concrete: even at 96% confidence, amounts must be checked character by character before they go into accounts.

## OCR Accuracy Limits — What the Numbers Really Mean

On clean printed text at 300 DPI, Tesseract typically reaches 97–99% character accuracy. That still means 1–3 wrong characters in every 100 — roughly 15–45 errors in a 1,500-character page. On poor scans with stains, skew, or unusual fonts, accuracy falls to 85–95%, which is 75–225 errors per 1,500-character page. Handwriting is far worse at 50–70%: about every second or third word is wrong, so handwritten notes need manual transcription, not OCR. Small text below 8 pt, faint dot-matrix print, and glossy paper glare all push accuracy toward the low end. The six languages in this tool are English, Arabic, French, German, Spanish, and Chinese Simplified for image OCR — pick the language the page is actually written in, because the wrong dictionary makes the word-assembly step guess badly. A page that mixes two languages, such as Arabic text with long English paragraphs, will be recognised less accurately than a single-language page, since only one language model is active at a time.

## Common Mistakes

### Mistake 1: Selecting English for an Arabic document
**Cause:** English is the default in the dropdown, and users click "Extract Text" without changing it. The Latin model then misreads Arabic letterforms badly. **Fix:** Always set the dropdown to the document's real language — Arabic (ara) for the invoices in the example — before starting. The same applies to French, German, Spanish, and Chinese Simplified.

### Mistake 2: Running OCR on a 72 DPI phone photo of a page
**Cause:** A quick phone snapshot looks readable to the eye, but at 72 DPI each character is only a few pixels wide, so the neural network cannot distinguish similar letters. **Fix:** Rescan at 300 DPI or higher, or photograph the page flat, square-on, and in good light, then check that small print is sharp before uploading.

### Mistake 3: Trusting invoice totals without spot-checking
**Cause:** A 96% confidence score feels like a pass mark, but a single misread digit — "7,300" becoming "7,800" — changes money. **Fix:** Verify every amount, date, and ID number against the original image. OCR output is a draft; figures that enter accounts, contracts, or medical records must be checked character by character.

### Mistake 4: Expecting handwriting to be recognised like print
**Cause:** Users assume OCR reads any writing, but Tesseract is trained on printed text, and handwriting scores only 50–70%. **Fix:** For handwritten forms and notes, treat OCR as a rough index for searching, and type the important fields manually.

## Frequently Asked Questions (Continued)

### Which languages does the tool support, exactly?
Six: English, Arabic, French, German, and Spanish for PDF and image OCR, plus Chinese Simplified for image OCR. Arabic outputs right-to-left text correctly; French handles é, à, and ù; German handles ä, ö, ü, and ß; Spanish handles ñ and accents.

### Can I OCR a document that mixes Arabic and English on the same page?
Partly. Select the language of the majority of the text — Arabic in the invoice example — and the English words and digits will usually still be recognised, but with lower accuracy than a single-language page. For a page that is half Arabic and half English, run it twice, once per language, and keep the better output for each section.

### How long does OCR take for a long document?
It depends on page count and resolution. The 18-page invoice scan at 300 DPI took about 2 minutes in the example — roughly 6–7 seconds per page. A 100-page document can take 10–12 minutes, and the progress bar shows the current page so you can see it is still working.

### Why does the extracted text lose the original layout?
Tesseract returns text in reading order, not in the original columns and tables. A two-column invoice becomes one flowing block of text, and table cells lose their grid. If you need the layout preserved, keep the scanned PDF as the visual record and use the extracted text only for searching and copying.
