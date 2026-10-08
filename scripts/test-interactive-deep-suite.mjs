import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { chromium } from '@playwright/test';
import { PDFDocument } from 'pdf-lib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const testAssetsDir = path.join(rootDir, 'test-assets');

async function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

async function prepareTestAssets() {
  if (!fs.existsSync(testAssetsDir)) {
    fs.mkdirSync(testAssetsDir, { recursive: true });
  }

  // 1. Sample PNG
  const samplePngPath = path.join(testAssetsDir, 'sample.png');
  fs.copyFileSync(path.join(rootDir, 'public/favicon-16x16.png'), samplePngPath);

  // 2. Sample 2nd PNG
  const samplePng2Path = path.join(testAssetsDir, 'sample2.png');
  fs.copyFileSync(path.join(rootDir, 'public/apple-touch-icon.png'), samplePng2Path);

  // 3. Sample PDF
  const samplePdfPath = path.join(testAssetsDir, 'sample.pdf');
  const doc = await PDFDocument.create();
  const page1 = doc.addPage([300, 300]);
  page1.drawText('Sample Page 1 for testing');
  const page2 = doc.addPage([300, 300]);
  page2.drawText('Sample Page 2 for testing');
  fs.writeFileSync(samplePdfPath, Buffer.from(await doc.save()));

  // 4. Sample PDF 2 (for merge)
  const samplePdf2Path = path.join(testAssetsDir, 'sample2.pdf');
  const doc2 = await PDFDocument.create();
  const p = doc2.addPage([300, 300]);
  p.drawText('Doc 2 Page');
  fs.writeFileSync(samplePdf2Path, Buffer.from(await doc2.save()));

  return { samplePngPath, samplePng2Path, samplePdfPath, samplePdf2Path };
}

async function runInteractiveDeepSuite() {
  console.log('====================================================');
  console.log('🔬 DEVTOL DEEP INTERACTIVE ACTION & UPLOAD TEST SUITE');
  console.log('====================================================\n');

  const assets = await prepareTestAssets();
  console.log('✓ Prepared test assets on disk.');

  console.log('Starting vite preview on port 4173...');
  const server = spawn('npx', ['vite', 'preview', '--port', '4173', '--strictPort'], { shell: true });
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch('http://localhost:4173/');
      if (res.status === 200) break;
    } catch {}
    await wait(1000);
  }
  console.log('✓ Preview server is UP at http://localhost:4173\n');

  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const testCases = [
    {
      name: 'PDF OCR Text Extractor (/pdf-ocr)',
      url: 'http://localhost:4173/pdf-ocr',
      action: async () => {
        await page.locator('input[type="file"]').setInputFiles([assets.samplePngPath]);
        await wait(500);
        await page.getByRole('button', { name: /Extract Text/i }).click();
        await page.waitForSelector('text=OCR complete!', { timeout: 20000 });
      }
    },
    {
      name: 'Image OCR Text Extractor (/image-ocr)',
      url: 'http://localhost:4173/image-ocr',
      action: async () => {
        await page.locator('input[type="file"]').setInputFiles([assets.samplePngPath]);
        await wait(500);
        await page.getByRole('button', { name: /Extract Text/i }).click();
        await page.waitForSelector('text=OCR complete!', { timeout: 20000 });
      }
    },
    {
      name: 'Images to PDF (/images-to-pdf)',
      url: 'http://localhost:4173/images-to-pdf',
      action: async () => {
        await page.locator('input[type="file"]').setInputFiles([assets.samplePngPath, assets.samplePng2Path]);
        await wait(500);
        await page.getByRole('button', { name: /Create PDF/i }).click();
        await page.waitForSelector('text=PDF created from 2 images', { timeout: 10000 });
      }
    },
    {
      name: 'PDF to Image (/pdf-to-image)',
      url: 'http://localhost:4173/pdf-to-image',
      action: async () => {
        await page.locator('input[type="file"]').setInputFiles([assets.samplePdfPath]);
        await wait(500);
        await page.getByRole('button', { name: /Convert to Images/i }).click();
        await page.waitForSelector('text=Converted 2 pages!', { timeout: 15000 });
      }
    },
    {
      name: 'PDF Merge (/pdf-merge)',
      url: 'http://localhost:4173/pdf-merge',
      action: async () => {
        await page.locator('input[type="file"]').setInputFiles([assets.samplePdfPath, assets.samplePdf2Path]);
        await wait(500);
        await page.getByRole('button', { name: /Merge PDFs/i }).click();
        await page.waitForSelector('text=PDF merged successfully!', { timeout: 10000 });
      }
    },
    {
      name: 'PDF Split (/pdf-split)',
      url: 'http://localhost:4173/pdf-split',
      action: async () => {
        await page.locator('input[type="file"]').setInputFiles([assets.samplePdfPath]);
        await wait(800);
        await page.getByRole('button', { name: /Extract Pages/i }).click();
        await page.waitForSelector('text=Download extracted.pdf', { timeout: 10000 });
      }
    },
    {
      name: 'PDF Compress (/pdf-compress)',
      url: 'http://localhost:4173/pdf-compress',
      action: async () => {
        await page.locator('input[type="file"]').setInputFiles([assets.samplePdfPath]);
        await wait(800);
        await page.getByRole('button', { name: /Compress PDF/i }).click();
        await page.waitForSelector('text=PDF compressed!', { timeout: 15000 });
      }
    },
    {
      name: 'PDF Organize Pages (/pdf-organize)',
      url: 'http://localhost:4173/pdf-organize',
      action: async () => {
        await page.locator('input[type="file"]').setInputFiles([assets.samplePdfPath]);
        await wait(800);
        await page.getByRole('button', { name: /Apply & Download/i }).click();
        await page.waitForSelector('text=PDF organized!', { timeout: 10000 });
      }
    },
    {
      name: 'PDF Watermark Tool (/pdf-watermark-tool)',
      url: 'http://localhost:4173/pdf-watermark-tool',
      action: async () => {
        await page.locator('input[type="file"]').setInputFiles([assets.samplePdfPath]);
        await wait(500);
        await page.getByRole('button', { name: /Add Watermark/i }).click();
        await page.waitForSelector('text=Watermark added!', { timeout: 10000 });
      }
    },
    {
      name: 'PDF Protect Tool (/pdf-protect)',
      url: 'http://localhost:4173/pdf-protect',
      action: async () => {
        await page.locator('input[type="file"]').setInputFiles([assets.samplePdfPath]);
        await wait(500);
        await page.getByRole('button', { name: /Protect & Download/i }).click();
        await page.waitForSelector('text=PDF processed!', { timeout: 10000 });
      }
    },
    {
      name: 'PDF Redact Tool (/pdf-redact)',
      url: 'http://localhost:4173/pdf-redact',
      action: async () => {
        await page.locator('input[type="file"]').setInputFiles([assets.samplePdfPath]);
        await wait(500);
        await page.locator('input[placeholder*="John Doe"]').fill('Sample');
        await page.getByRole('button', { name: /Redact & Download/i }).click();
        await page.waitForSelector('text=PDF processed', { timeout: 10000 });
      }
    },
    {
      name: 'Favicon Generator (/favicon-generator)',
      url: 'http://localhost:4173/favicon-generator',
      action: async () => {
        await page.locator('input[type="file"]').setInputFiles([assets.samplePngPath]);
        await wait(500);
        await page.getByRole('button', { name: /Generate All Sizes/i }).click();
        await page.waitForSelector('text=All icon sizes generated!', { timeout: 10000 });
      }
    },
    {
      name: 'Image Compressor (/image-compressor)',
      url: 'http://localhost:4173/image-compressor',
      action: async () => {
        await page.locator('input[type="file"]').setInputFiles([assets.samplePngPath]);
        await wait(500);
        await page.getByRole('button', { name: /Compress Image/i }).click();
        await page.waitForSelector('text=Download Compressed', { timeout: 10000 });
      }
    },
    {
      name: 'Image Resizer (/image-resizer)',
      url: 'http://localhost:4173/image-resizer',
      action: async () => {
        await page.locator('input[type="file"]').setInputFiles([assets.samplePngPath]);
        await wait(500);
        await page.getByRole('button', { name: /Resize Image/i }).click();
        await page.waitForSelector('text=Download', { timeout: 10000 });
      }
    },
    {
      name: 'Image Watermark (/image-watermark)',
      url: 'http://localhost:4173/image-watermark',
      action: async () => {
        await page.locator('input[type="file"]').setInputFiles([assets.samplePngPath]);
        await wait(500);
        await page.getByRole('button', { name: /Apply Watermark/i }).click();
        await page.waitForSelector('text=Download Watermarked', { timeout: 10000 });
      }
    },
    {
      name: 'SVG Converter (/svg-converter)',
      url: 'http://localhost:4173/svg-converter',
      action: async () => {
        await page.getByRole('button', { name: /Convert SVG/i }).click();
        await page.waitForSelector('text=Download .png', { timeout: 10000 });
      }
    },
    {
      name: 'WebP Converter (/webp-converter)',
      url: 'http://localhost:4173/webp-converter',
      action: async () => {
        await page.locator('input[type="file"]').setInputFiles([assets.samplePngPath]);
        await wait(500);
        await page.getByRole('button', { name: /Convert/i }).click();
        await page.waitForSelector('text=Download', { timeout: 10000 });
      }
    },
    {
      name: 'YAML Validator (/yaml-validator)',
      url: 'http://localhost:4173/yaml-validator',
      action: async () => {
        await page.getByRole('button', { name: /Validate & Format/i }).click();
        await page.waitForSelector('text=Valid YAML', { timeout: 5000 });
      }
    },
    {
      name: 'Text Encrypt (/text-encrypt)',
      url: 'http://localhost:4173/text-encrypt',
      action: async () => {
        await page.locator('textarea').first().fill('Hello Secret Text');
        await page.locator('input[type="password"]').fill('SecretPass123!');
        await page.getByRole('button', { name: /Encrypt/i }).click();
        await page.waitForSelector('text=Encrypted (Base64)', { timeout: 5000 });
      }
    }
  ];

  let passedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    console.log(`[${i + 1}/${testCases.length}] Executing action on: ${tc.name}...`);
    try {
      await page.goto(tc.url, { waitUntil: 'networkidle', timeout: 15000 });
      await tc.action();
      console.log(`   ✓ PASS: ${tc.name} executed successfully!`);
      passedCount++;
    } catch (err) {
      console.error(`   ❌ FAIL: ${tc.name} failed: ${err.message}`);
      failedCount++;
    }
  }

  await browser.close();
  server.kill();
  try { spawn('taskkill', ['/pid', server.pid.toString(), '/f', '/t']); } catch {}

  console.log('\n====================================================');
  console.log(`INTERACTIVE DEEP SUITE COMPLETE`);
  console.log(`PASSED: ${passedCount} | FAILED: ${failedCount}`);
  console.log('====================================================');

  if (failedCount > 0) process.exit(1);
}

runInteractiveDeepSuite().catch(console.error);
