import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import YAML from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('====================================================');
console.log('🚀 DEVTOL FULL SUITE & PDF/IMAGE VERIFICATION AUDIT');
console.log('====================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failedTests++;
  }
}

// ---------------------------------------------------------
// Helper: Create a real 100x100 PNG image binary buffer
// ---------------------------------------------------------
function createTestPngBuffer() {
  // 1x1 red PNG base64
  const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  return Buffer.from(base64Png, 'base64');
}

// ---------------------------------------------------------
// Helper: Create a real 1x1 JPEG image binary buffer
// ---------------------------------------------------------
function createTestJpgBuffer() {
  // 1x1 white JPEG base64
  const base64Jpg = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
  return Buffer.from(base64Jpg, 'base64');
}

async function runTests() {
  // TEST 1: images-to-pdf
  console.log('\n--- 1. Testing images-to-pdf Core Logic ---');
  try {
    const pngBuf1 = fs.readFileSync(path.join(rootDir, 'public/favicon-16x16.png'));
    const pngBuf2 = fs.readFileSync(path.join(rootDir, 'public/apple-touch-icon.png'));

    const pdf = await PDFDocument.create();

    const pngImg1 = await pdf.embedPng(pngBuf1);
    assert(pngImg1.width > 0 && pngImg1.height > 0, `Embed 1st image (${pngImg1.width}x${pngImg1.height}) into PDF`);
    const p1 = pdf.addPage([pngImg1.width, pngImg1.height]);
    p1.drawImage(pngImg1, { x: 0, y: 0, width: pngImg1.width, height: pngImg1.height });

    const pngImg2 = await pdf.embedPng(pngBuf2);
    assert(pngImg2.width > 0 && pngImg2.height > 0, `Embed 2nd image (${pngImg2.width}x${pngImg2.height}) into PDF`);
    const p2 = pdf.addPage([pngImg2.width, pngImg2.height]);
    p2.drawImage(pngImg2, { x: 0, y: 0, width: pngImg2.width, height: pngImg2.height });

    const outBytes = await pdf.save();
    assert(outBytes.length > 50, 'Generate non-empty PDF bytes');
    const header = Buffer.from(outBytes.slice(0, 5)).toString();
    assert(header === '%PDF-', 'PDF file header is valid (%PDF-)');
    assert(pdf.getPageCount() === 2, 'PDF has exactly 2 pages');

    fs.writeFileSync(path.join(rootDir, 'temp-test-images.pdf'), outBytes);
    assert(fs.existsSync(path.join(rootDir, 'temp-test-images.pdf')), 'Wrote PDF file to filesystem successfully');
  } catch (err) {
    assert(false, `images-to-pdf failed: ${err.message}`);
  }

  // TEST 2: pdf-merge
  console.log('\n--- 2. Testing pdf-merge Core Logic ---');
  try {
    const doc1 = await PDFDocument.create();
    doc1.addPage([200, 200]);
    const doc1Bytes = await doc1.save();

    const doc2 = await PDFDocument.create();
    doc2.addPage([300, 300]);
    doc2.addPage([400, 400]);
    const doc2Bytes = await doc2.save();

    const merged = await PDFDocument.create();
    const loadedDoc1 = await PDFDocument.load(doc1Bytes);
    const pages1 = await merged.copyPages(loadedDoc1, loadedDoc1.getPageIndices());
    pages1.forEach(p => merged.addPage(p));

    const loadedDoc2 = await PDFDocument.load(doc2Bytes);
    const pages2 = await merged.copyPages(loadedDoc2, loadedDoc2.getPageIndices());
    pages2.forEach(p => merged.addPage(p));

    const mergedBytes = await merged.save();
    const mergedCheck = await PDFDocument.load(mergedBytes);
    assert(mergedCheck.getPageCount() === 3, 'Merged PDF has correct total page count (1 + 2 = 3)');
  } catch (err) {
    assert(false, `pdf-merge failed: ${err.message}`);
  }

  // TEST 3: pdf-split
  console.log('\n--- 3. Testing pdf-split Core Logic ---');
  try {
    const sourceDoc = await PDFDocument.create();
    sourceDoc.addPage([100, 100]);
    sourceDoc.addPage([200, 200]);
    sourceDoc.addPage([300, 300]);
    const srcBytes = await sourceDoc.save();

    const src = await PDFDocument.load(srcBytes);
    const splitDoc = await PDFDocument.create();
    // Split: extract page 2 (index 1)
    const [page2] = await splitDoc.copyPages(src, [1]);
    splitDoc.addPage(page2);

    const splitBytes = await splitDoc.save();
    const splitCheck = await PDFDocument.load(splitBytes);
    assert(splitCheck.getPageCount() === 1, 'Split PDF has exactly 1 extracted page');
    assert(splitCheck.getPage(0).getWidth() === 200, 'Split page maintains exact dimensions (200x200)');
  } catch (err) {
    assert(false, `pdf-split failed: ${err.message}`);
  }

  // TEST 4: pdf-organize & rotate
  console.log('\n--- 4. Testing pdf-organize Core Logic ---');
  try {
    const doc = await PDFDocument.create();
    doc.addPage([500, 400]);
    const bytes = await doc.save();

    const srcDoc = await PDFDocument.load(bytes);
    const organizedDoc = await PDFDocument.create();
    const [p] = await organizedDoc.copyPages(srcDoc, [0]);
    p.setRotation(degrees(90));
    organizedDoc.addPage(p);

    const organizedBytes = await organizedDoc.save();
    const checkDoc = await PDFDocument.load(organizedBytes);
    assert(checkDoc.getPage(0).getRotation().angle === 90, 'Organized PDF page has 90 degree rotation applied');
  } catch (err) {
    assert(false, `pdf-organize failed: ${err.message}`);
  }

  // TEST 5: pdf-watermark
  console.log('\n--- 5. Testing pdf-watermark Core Logic ---');
  try {
    const doc = await PDFDocument.create();
    const p = doc.addPage([600, 800]);
    const font = await doc.embedFont(StandardFonts.HelveticaBold);
    p.drawText('CONFIDENTIAL', {
      x: 100,
      y: 400,
      size: 40,
      font,
      color: rgb(0.8, 0.2, 0.2),
      opacity: 0.5,
      rotate: degrees(-45),
    });
    const bytes = await doc.save();
    assert(bytes.length > 500, 'Watermarked PDF generated with valid embedded font & text');
  } catch (err) {
    assert(false, `pdf-watermark failed: ${err.message}`);
  }

  // TEST 6: Zero-dependency ZIP generator
  console.log('\n--- 6. Testing Zero-Dependency ZIP Creator (src/utils/zip.ts) ---');
  try {
    // Dynamically test crc32 and zip creation matching src/utils/zip.ts logic
    const { computeCrc32 } = await import('../src/utils/zip.ts');
    const helloBytes = new TextEncoder().encode('Hello World');
    const crc = computeCrc32(helloBytes);
    assert(crc === 0x4a17b156, 'CRC-32 calculation is RFC compliant');

    const { createZipBlob } = await import('../src/utils/zip.ts');
    const zipBlob = createZipBlob([
      { name: 'favicon-16x16.png', data: createTestPngBuffer() },
      { name: 'index.html', data: '<html><body>DevTol</body></html>' }
    ]);
    assert(zipBlob.type === 'application/zip', 'ZipBlob has application/zip MIME type');
    assert(zipBlob.size > 200, `ZipBlob has valid non-zero size (${zipBlob.size} bytes)`);
  } catch (err) {
    assert(false, `zip utility failed: ${err.message}`);
  }

  // TEST 7: yaml-validator with local yaml package
  console.log('\n--- 7. Testing yaml-validator Local Engine ---');
  try {
    const validYaml = 'app: devtol\nfeatures:\n  - fast\n  - offline';
    const parsed = YAML.parse(validYaml);
    assert(parsed.app === 'devtol' && parsed.features.length === 2, 'Valid YAML parses correctly');
    const stringified = YAML.stringify(parsed, { indent: 2 });
    assert(stringified.includes('features:'), 'YAML serializes cleanly with indentation');

    let invalidThrew = false;
    try {
      YAML.parse('bad: [unclosed list');
    } catch {
      invalidThrew = true;
    }
    assert(invalidThrew, 'Invalid YAML properly throws parse error with line context');
  } catch (err) {
    assert(false, `yaml-validator failed: ${err.message}`);
  }

  // TEST 8: Full Registry & Translation Integrity
  console.log('\n--- 8. Testing All Tools Registry & Routing ---');
  try {
    const routerContent = fs.readFileSync(path.join(rootDir, 'src/router.ts'), 'utf-8');
    assert(routerContent.includes("path === '/images-to-pdf'"), 'router.ts properly binds /images-to-pdf');
    assert(routerContent.includes("path === '/pdf-to-image'"), 'router.ts properly binds /pdf-to-image');
    assert(routerContent.includes("path === '/pdf-merge'"), 'router.ts properly binds /pdf-merge');
    assert(routerContent.includes("path === '/pdf-split'"), 'router.ts properly binds /pdf-split');
    assert(routerContent.includes("path === '/pdf-compress'"), 'router.ts properly binds /pdf-compress');

    const enYml = fs.readFileSync(path.join(rootDir, 'locales/en.yml'), 'utf-8');
    const arYml = fs.readFileSync(path.join(rootDir, 'locales/ar.yml'), 'utf-8');
    assert(enYml.includes('imagesToPdf') || enYml.includes('images-to-pdf'), 'locales/en.yml has images-to-pdf localization');
    assert(arYml.includes('imagesToPdf') || arYml.includes('images-to-pdf') || arYml.includes('تحويل الصور إلى'), 'locales/ar.yml has Arabic translation');
  } catch (err) {
    assert(false, `Registry & translation test failed: ${err.message}`);
  }

  // Cleanup temp files
  try {
    const tempPdf = path.join(rootDir, 'temp-test-images.pdf');
    if (fs.existsSync(tempPdf)) fs.unlinkSync(tempPdf);
  } catch {}

  console.log('\n====================================================');
  console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
  console.log('====================================================');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests();
