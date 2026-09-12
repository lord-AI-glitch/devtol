# Master Antigravity Prompts for 30 Additional PDF, Text & Media Tools

This document contains specialized, production-ready prompts designed for **Antigravity AI** to generate both the **Vue 3 Client-Side Tool Components** and **1,000+ Word SEO Educational Guides** for 30 high-demand utilities (PDF Processing, Text & Data Formatting, and Image & Media Conversion).

---

## 🛠️ Batch Generation Framework for Antigravity

Use the master template below in Antigravity to generate the complete Vue 3 component code (Client-side JavaScript libraries) and SEO text for any of the 30 tools.

### Master Prompt Template

```text
Act as a Senior Full-Stack Vue.js Developer and Technical SEO Expert. 
Generate a complete, production-ready Vue 3 component and a 1,000+ word SEO guide in Markdown for the tool: "[TOOL_NAME]".

Target Category: [TOOL_CATEGORY]
Primary Technical Library: [JS_LIBRARY] (e.g., pdf-lib, tesseract.js, canvas, jszip, ffmpeg.wasm)
Privacy Model: 100% Client-Side Processing (Zero server uploads).

SECTION 1: VUE 3 COMPONENT CODE (<template>, <script setup>, <style scoped>)
1. Clean UI using Tailwind CSS or standard IT-Tools design system.
2. Drag-and-drop file upload zone or standard text inputs.
3. Client-side execution logic using [JS_LIBRARY].
4. Processing state (loading indicator, error handling, success/download triggers).
5. Clean reactive state management using Vue 3 Composition API (<script setup>).

SECTION 2: SEO EDUCATIONAL GUIDE (1,000+ Words in English)
1. Title & Catchy Subtitle (H1).
2. Introduction & Client-Side Security Guarantee (H2).
3. Step-by-Step Instructions (H2).
4. Deep Dive: Technical Standards & Algorithmic Process (H2).
5. Practical Real-World Use Cases for Developers, Marketers & Students (H2).
6. Frequently Asked Questions (FAQs with Schema structure) (H2).
7. Technical Verification / E-E-A-T Disclaimer (H3).

Format output clearly with Markdown code blocks.
```

---

## 📄 Category 1: PDF Management Tools (Tools 1 to 10)

### 1. Merge PDF (`pdf-lib`)
* **Tool Name:** Merge PDF
* **Category:** PDF Utilities
* **JS Library:** `pdf-lib`
* **Prompt Parameter:**
  ```text
  Tool: Merge PDF
  JS Library: pdf-lib
  Key Logic: Accept multiple PDF files, merge pages sequentially in memory using PDFDocument.create() and PDFDocument.load(), output downloadable merged Blob.
  ```

### 2. Split & Extract PDF (`pdf-lib`)
* **Tool Name:** Split & Extract PDF
* **Category:** PDF Utilities
* **JS Library:** `pdf-lib`
* **Prompt Parameter:**
  ```text
  Tool: Split & Extract PDF
  JS Library: pdf-lib
  Key Logic: Parse uploaded PDF, display page thumbnails, allow user to select specific page ranges (e.g., 1-3, 5), and export selected pages to a new PDF.
  ```

### 3. Compress PDF (`pdfjs-dist` + `pdf-lib` / `canvas`)
* **Tool Name:** Compress PDF
* **Category:** PDF Utilities
* **JS Library:** `pdf-lib` & HTML5 Canvas
* **Prompt Parameter:**
  ```text
  Tool: Compress PDF
  JS Library: canvas & pdf-lib
  Key Logic: Render PDF pages to canvas at customizable DPI/quality scales, re-encode as JPEG/PNG streams, and build a reduced-size PDF.
  ```

### 4. PDF to Word / Word to PDF (`pdfjs-dist` & `docx`)
* **Tool Name:** PDF to Word Converter
* **Category:** Document Conversion
* **JS Library:** `pdfjs-dist` & `docx`
* **Prompt Parameter:**
  ```text
  Tool: PDF to Word Converter
  JS Library: pdfjs-dist & docx.js
  Key Logic: Extract text content and layout coordinates from PDF pages using pdfjs-dist, assemble Paragraph and Table objects using docx.js, and export .docx.
  ```

### 5. PDF to JPG / PNG (`pdfjs-dist`)
* **Tool Name:** PDF to Image Converter
* **Category:** PDF & Media Conversion
* **JS Library:** `pdfjs-dist` & `JSZip`
* **Prompt Parameter:**
  ```text
  Tool: PDF to Image Converter
  JS Library: pdfjs-dist & JSZip
  Key Logic: Render each PDF page onto a canvas, convert to Data URL (PNG/JPG), package multiple page images into a single zip file using JSZip.
  ```

### 6. Images to PDF (`pdf-lib`)
* **Tool Name:** Images to PDF Converter
* **Category:** PDF & Media Conversion
* **JS Library:** `pdf-lib`
* **Prompt Parameter:**
  ```text
  Tool: Images to PDF Converter
  JS Library: pdf-lib
  Key Logic: Accept PNG/JPG uploads, embed images using doc.embedPng() or doc.embedJpg(), size pages dynamically based on image aspect ratio, export PDF.
  ```

### 7. Protect & Unlock PDF (`pdf-lib`)
* **Tool Name:** PDF Password Security Tool
* **Category:** PDF Security
* **JS Library:** `pdf-lib`
* **Prompt Parameter:**
  ```text
  Tool: PDF Security & Encryptor
  JS Library: pdf-lib
  Key Logic: Add or prompt for user/owner passwords to restrict viewing, printing, or editing permissions on PDF files directly in the browser.
  ```

### 8. Organize & Rotate PDF (`pdf-lib`)
* **Tool Name:** Rotate & Organize PDF Pages
* **Category:** PDF Utilities
* **JS Library:** `pdf-lib`
* **Prompt Parameter:**
  ```text
  Tool: PDF Page Rotator & Reorder
  JS Library: pdf-lib
  Key Logic: Display visual page cards, allow drag-and-drop reordering and 90/180/270 degree rotation per page using page.setRotation(degrees()).
  ```

### 9. OCR PDF (`tesseract.js` + `pdfjs-dist`)
* **Tool Name:** OCR PDF Text Extractor
* **Category:** PDF AI Utilities
* **JS Library:** `tesseract.js` & `pdfjs-dist`
* **Prompt Parameter:**
  ```text
  Tool: OCR PDF Text Extractor
  JS Library: tesseract.js & pdfjs-dist
  Key Logic: Render scanned PDF pages to canvas elements, run Tesseract.recognize() worker for optical character recognition, output editable text.
  ```

### 10. Redact PDF (`pdf-lib`)
* **Tool Name:** PDF Sensitive Data Redactor
* **Category:** PDF Privacy & Security
* **JS Library:** `pdf-lib`
* **Prompt Parameter:**
  ```text
  Tool: PDF Redaction Tool
  JS Library: pdf-lib
  Key Logic: Allow user to draw blackout rectangles over sensitive areas, permanently draw black filled rectangles onto the PDF vector layer, removing underlying text.
  ```

---

## 📝 Category 2: Text & Data Tools (Tools 11 to 20)

### 11. Word & Character Counter
* **Tool Name:** Advanced Word & Character Counter
* **Category:** Text Utilities
* **JS Library:** Native JS Regex
* **Prompt Parameter:**
  ```text
  Tool: Word & Character Counter
  Key Logic: Real-time analysis of word count, character count (with/without spaces), paragraph count, estimated reading time, and keyword density.
  ```

### 12. Text Diff Checker (`diff`)
* **Tool Name:** Text Diff Checker
* **Category:** Text Utilities
* **JS Library:** `diff` (jsdiff)
* **Prompt Parameter:**
  ```text
  Tool: Text & Code Diff Checker
  JS Library: jsdiff
  Key Logic: Compare two text blocks side-by-side or unified, highlighting additions in green and deletions in red with line numbers.
  ```

### 13. Markdown ↔ HTML Converter (`marked` / `turndown`)
* **Tool Name:** Markdown to HTML Converter
* **Category:** Text Conversion
* **JS Library:** `marked` & `turndown`
* **Prompt Parameter:**
  ```text
  Tool: Markdown HTML Converter
  JS Library: marked & turndown
  Key Logic: Bi-directional conversion between Markdown syntax and clean HTML code with live preview panel.
  ```

### 14. JSON ↔ CSV / Excel Converter (`papaparse`)
* **Tool Name:** JSON to CSV & Excel Converter
* **Category:** Data Utilities
* **JS Library:** `papaparse` & `xlsx`
* **Prompt Parameter:**
  ```text
  Tool: JSON to CSV & Excel Converter
  JS Library: PapaParse & SheetJS (xlsx)
  Key Logic: Parse nested JSON structures into tabular CSV/XLSX data with configurable delimiter and array flattening.
  ```

### 15. Case Converter & Text Cleaner
* **Tool Name:** Multi-Case Converter & Text Normalizer
* **Category:** Text Utilities
* **JS Library:** Native JS
* **Prompt Parameter:**
  ```text
  Tool: Multi-Case Converter
  Key Logic: Convert input string into UPPERCASE, lowercase, Title Case, camelCase, PascalCase, snake_case, kebab-case, and CONSTANT_CASE instantly.
  ```

### 16. Base64 / URL Encoder & Decoder
* **Tool Name:** Base64 & URL Encoder/Decoder
* **Category:** Encoding Utilities
* **JS Library:** Native JS (`atob`, `btoa`, `encodeURIComponent`)
* **Prompt Parameter:**
  ```text
  Tool: Base64 & URL Encoder
  Key Logic: Encode and decode plain text, binary files, or URL strings into Base64 format with UTF-8 support.
  ```

### 17. OCR Image to Text (`tesseract.js`)
* **Tool Name:** Image Text Extractor (OCR)
* **Category:** Text Extraction
* **JS Library:** `tesseract.js`
* **Prompt Parameter:**
  ```text
  Tool: Image OCR Text Extractor
  JS Library: tesseract.js
  Key Logic: Client-side optical character recognition supporting multiple languages (ENG, AR, SPA, DE, FR) with copy-to-clipboard functionality.
  ```

### 18. Lorem Ipsum & Mock Data Generator (`faker`)
* **Tool Name:** Mock Data & Lorem Ipsum Generator
* **Category:** Developer Generators
* **JS Library:** `@faker-js/faker`
* **Prompt Parameter:**
  ```text
  Tool: Mock Data Generator
  JS Library: @faker-js/faker
  Key Logic: Generate custom dummy text, random user profiles, dummy JSON arrays, SQL insert statements, and mock addresses.
  ```

### 19. Text Cleaner & Duplicate Remover
* **Tool Name:** Text Line Cleaner & Deduplicator
* **Category:** Text Utilities
* **JS Library:** Native JS
* **Prompt Parameter:**
  ```text
  Tool: Line Deduplicator & Cleaner
  Key Logic: Remove duplicate lines, trim whitespace, remove blank lines, sort alphabetically, and replace custom regex patterns.
  ```

20. Text to Speech (`Web Speech API`)
* **Tool Name:** Text to Speech Converter
* **Category:** Media & Speech
* **JS Library:** Native `window.speechSynthesis`
* **Prompt Parameter:**
  ```text
  Tool: Text to Speech Converter
  Key Logic: Convert plain text into audio playback with accent, pitch, speed, and volume controls, using browser Web Speech synthesis API.
  ```

---

## 🖼️ Category 3: Image & Media Tools (Tools 21 to 30)

### 21. Image Compressor (`browser-image-resizer` / Canvas)
* **Tool Name:** Image Compressor (JPG, PNG, WebP)
* **Category:** Media Utilities
* **JS Library:** HTML5 Canvas / `browser-image-compression`
* **Prompt Parameter:**
  ```text
  Tool: Client-Side Image Compressor
  JS Library: browser-image-compression
  Key Logic: Compress image file sizes up to 90% via quality loss sliders and canvas re-encoding without uploading to server.
  ```

### 22. WEBP to PNG / JPG Converter
* **Tool Name:** WebP Image Converter
* **Category:** Image Conversion
* **JS Library:** HTML5 Canvas
* **Prompt Parameter:**
  ```text
  Tool: WebP Converter
  Key Logic: Convert WebP images to standard PNG/JPG formats or convert bulk JPGs to modern lightweight WebP files.
  ```

### 23. Image Resizer & Crop (`cropperjs`)
* **Tool Name:** Image Resizer & Cropper
* **Category:** Image Utilities
* **JS Library:** `cropperjs`
* **Prompt Parameter:**
  ```text
  Tool: Image Resizer & Cropper
  JS Library: cropperjs
  Key Logic: Interactive visual crop box, preset aspect ratios (16:9, 1:1, 4:5), dimension scaling in pixels or percentages.
  ```

### 24. SVG to PNG / JPG / ICO Converter
* **Tool Name:** SVG Vector Converter
* **Category:** Image Conversion
* **JS Library:** HTML5 Canvas & `canvg`
* **Prompt Parameter:**
  ```text
  Tool: SVG Vector Converter
  Key Logic: Rasterize vector SVG files to high-resolution PNG, JPG, or ICO favicons at custom scale multipliers.
  ```

### 25. Background Remover (`@imgly/background-removal`)
* **Tool Name:** AI Background Remover
* **Category:** AI Image Utilities
* **JS Library:** `@imgly/background-removal`
* **Prompt Parameter:**
  ```text
  Tool: AI Image Background Remover
  JS Library: @imgly/background-removal
  Key Logic: Run WebAssembly/ONNX machine learning models in browser to isolate subjects and produce transparent PNG output.
  ```

### 26. Video / GIF Converter (`ffmpeg.wasm`)
* **Tool Name:** Video to GIF & Trimmer
* **Category:** Video Utilities
* **JS Library:** `@ffmpeg/ffmpeg` (FFmpeg WebAssembly)
* **Prompt Parameter:**
  ```text
  Tool: Video to GIF Converter
  JS Library: @ffmpeg/ffmpeg
  Key Logic: Trim start/end video timestamps, resize resolution, and render animated GIF client-side using WebAssembly FFmpeg.
  ```

### 27. Color Converter & Picker (`chroma-js`)
* **Tool Name:** Color Format Converter & Palette Generator
* **Category:** Design Utilities
* **JS Library:** `chroma-js`
* **Prompt Parameter:**
  ```text
  Tool: Color Format Converter
  JS Library: chroma-js
  Key Logic: Convert colors between HEX, RGB, HSL, CMYK, and HSV, check WCAG accessibility contrast ratios, and generate palettes.
  ```

### 28. Exif Data Viewer & Remover (`exif-js`)
* **Tool Name:** EXIF Metadata Inspector & Cleaner
* **Category:** Image Security & Privacy
* **JS Library:** `exif-js`
* **Prompt Parameter:**
  ```text
  Tool: Image EXIF Metadata Cleaner
  JS Library: exif-js & Canvas
  Key Logic: Inspect photo metadata (camera specs, GPS coordinates, timestamps) and scrub metadata by re-saving pixel data on canvas.
  ```

### 29. Favicon & App Icon Generator (`JSZip`)
* **Tool Name:** Favicon & App Icon Pack Generator
* **Category:** Developer Utilities
* **JS Library:** HTML5 Canvas & `JSZip`
* **Prompt Parameter:**
  ```text
  Tool: Favicon Package Generator
  JS Library: Canvas & JSZip
  Key Logic: Convert a single image into standard favicon sizes (16x16, 32x32, 180x180, 512x512, favicon.ico) and zip for download.
  ```

### 30. Watermark Image
* **Tool Name:** Batch Image Watermarker
* **Category:** Media Security
* **JS Library:** HTML5 Canvas
* **Prompt Parameter:**
  ```text
  Tool: Batch Image Watermarker
  Key Logic: Overlay text or logo images onto uploaded photos with opacity, position grids, font styling, and tiled rotation options.
  ```

---

## ⚡ Quick Copy-Paste Batch Prompt for Antigravity AI

```text
Please execute the Master Prompt Framework for Tools 1 through 5 (Merge PDF, Split PDF, Compress PDF, PDF to Word, PDF to Image). 
Generate the Vue 3 component code using client-side JS libraries (pdf-lib, pdfjs-dist, docx.js) and the 1,000+ word SEO guide in Markdown for each tool. Ensure zero server uploads and full E-E-A-T compliance.
```
