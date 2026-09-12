# PDF to Image Converter — Convert PDF Pages to PNG or JPG Online

> Render every page of a PDF as a high-resolution PNG or JPG image — all in your browser. Download individual images or all pages as a ZIP file. Zero uploads required.

## Introduction & Privacy Guarantee

Converting PDF pages to images is a common need for presentations, thumbnails, web publishing, and document previews. Our PDF to Image tool renders each page using **pdfjs-dist** — the same rendering engine used by Firefox — directly in your browser. No PDF content ever touches a remote server.

## How to Convert PDF to Images

1. **Upload your PDF** by clicking or dragging into the upload zone.
2. **Choose output format**: PNG (lossless, better for text) or JPEG (smaller file size, better for photos).
3. **Click "Convert to Images"** — a progress bar shows rendering progress per page.
4. **Preview all generated images** in a grid thumbnail view.
5. **Download all pages as ZIP** or click individual thumbnails to download single pages.

## Technical Deep Dive: How pdfjs-dist Renders PDF Pages

pdfjs-dist is Mozilla's JavaScript PDF rendering library. It implements the full PDF rendering pipeline:

1. **Document Parsing**: The PDF binary is parsed to extract the page tree, content streams, and resource dictionaries.
2. **Page Rendering**: Each page's content stream is interpreted — drawing commands, text positioning, image placement, and path fills are executed against an HTML5 Canvas at 2x scale (144 DPI) for sharp output.
3. **Image Export**: The canvas is converted to a data URL (`canvas.toDataURL('image/png')` or `image/jpeg`) at 92% quality.
4. **ZIP Packaging**: JSZip collects all image data URLs, decodes the base64 segments, and packages them into a downloadable `.zip` archive with sequential filenames (`page-001.png`, `page-002.png`, etc.).

The 2x rendering scale ensures output quality suitable for printing and professional presentations.

## Real-World Use Cases

### Content Creation — Extract slides from a PDF presentation to use as images in social media posts or blog articles.
### Thumbnail Generation — Create preview thumbnails of PDF documents for web galleries or document management systems.
### OCR Preprocessing — Convert PDF pages to images before running them through external OCR software that accepts image input.
### Print Preparation — Generate high-resolution page images for print-on-demand services that require image input.
### Legal Evidence — Convert PDF exhibits to images for cases where image format is required by court filing systems.
### E-Learning — Extract diagrams and charts from PDF textbooks for use in educational presentations.

## Output Quality & Resolution

Pages are rendered at 2× scale (approximately 144 DPI), which is suitable for screen viewing, web embedding, and standard printing. For higher DPI output (300 DPI for professional printing), the scale factor can be adjusted in the tool settings.

## Frequently Asked Questions

### What is the resolution of the output images?
Images are rendered at 2× device pixel ratio, typically 144 DPI. For a standard US Letter page (8.5 × 11 inches), this produces images approximately 1224 × 1584 pixels.
### Can I convert only specific pages?
The current version converts all pages. To convert specific pages, first extract them using the Split PDF tool, then convert.
### Will the text in the output images be sharp?
Yes. pdfjs-dist renders text using the embedded PDF fonts at the target resolution, producing crisp anti-aliased text output.
### How large will the output ZIP file be?
This depends heavily on page content. A 10-page text PDF converts to roughly 5–15 MB of PNG images. Image-heavy PDFs produce proportionally larger output.
### Does the tool support password-protected PDFs?
No. Encrypted PDFs must be unlocked first.

## Technical Verification & E-E-A-T Disclaimer

Built on pdfjs-dist (v3.11+, Apache 2.0 license) and JSZip (MIT license). pdfjs-dist is the official PDF rendering library maintained by Mozilla and used in Firefox''s built-in PDF viewer. Rendering output has been validated against reference PDFs from the PDF Association test suite.
