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

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function prepareTestAssets() {
  if (!fs.existsSync(testAssetsDir)) {
    fs.mkdirSync(testAssetsDir, { recursive: true });
  }

  // 1. Sample PNG
  const samplePngPath = path.join(testAssetsDir, 'sample.png');
  fs.copyFileSync(path.join(rootDir, 'public/favicon-16x16.png'), samplePngPath);

  // 2. Sample SVG
  const sampleSvgPath = path.join(testAssetsDir, 'sample.svg');
  fs.writeFileSync(sampleSvgPath, '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="40" fill="green"/></svg>', 'utf-8');

  // 3. Sample TXT
  const sampleTxtPath = path.join(testAssetsDir, 'sample.txt');
  fs.writeFileSync(sampleTxtPath, 'Hello DevTol World!', 'utf-8');

  // 4. Sample PDF
  const samplePdfPath = path.join(testAssetsDir, 'sample.pdf');
  const doc = await PDFDocument.create();
  const page1 = doc.addPage([300, 300]);
  page1.drawText('Page 1 Test PDF');
  const page2 = doc.addPage([300, 300]);
  page2.drawText('Page 2 Test PDF');
  const pdfBytes = await doc.save();
  fs.writeFileSync(samplePdfPath, Buffer.from(pdfBytes));

  return { samplePngPath, sampleSvgPath, sampleTxtPath, samplePdfPath };
}

function getToolRoutes() {
  const indexContent = fs.readFileSync(path.join(rootDir, 'src/tools/index.ts'), 'utf-8');
  const lines = indexContent.split('\n');
  const routes = [];
  for (const line of lines) {
    const m = line.match(/import\s*\{\s*tool\s*as\s*\w+\s*\}\s*from\s*['"]\.\/([^'"]+)['"]/);
    if (m) {
      routes.push(m[1]);
    }
  }
  return routes;
}

async function main() {
  console.log('====================================================');
  console.log('🚀 DEVTOL FULL BROWSER & ALL TOOLS E2E VERIFICATION');
  console.log('====================================================\n');

  const assets = await prepareTestAssets();
  console.log('✓ Test assets prepared in test-assets/');

  const toolRoutes = getToolRoutes();
  console.log(`✓ Loaded ${toolRoutes.length} tools from src/tools/index.ts\n`);

  console.log('Starting vite preview server on port 4173...');
  const server = spawn('npx', ['vite', 'preview', '--port', '4173', '--strictPort'], {
    cwd: rootDir,
    shell: true,
    stdio: 'pipe',
  });

  // Wait for server to respond
  let serverReady = false;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch('http://localhost:4173/');
      if (res.status === 200) {
        serverReady = true;
        break;
      }
    } catch {}
    await wait(1000);
  }

  if (!serverReady) {
    console.error('❌ Failed to start vite preview server in 30 seconds');
    server.kill();
    process.exit(1);
  }

  console.log('✓ Preview server is UP at http://localhost:4173\n');

  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = [];
  let overallFailed = 0;

  for (let idx = 0; idx < toolRoutes.length; idx++) {
    const route = toolRoutes[idx];
    const url = `http://localhost:4173/${route}`;
    const pageErrors = [];

    const onPageError = err => pageErrors.push(err.message || String(err));
    page.on('pageerror', onPageError);

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await wait(300);

      const hasErrorCrash = (await page.locator('.tool-issue-banner').count()) > 0;
      const isNotFound = (await page.locator('.not-found').count()) > 0;

      if (hasErrorCrash || isNotFound) {
        throw new Error(hasErrorCrash ? 'Runtime crash in error boundary (.tool-issue-banner)' : 'Route 404 (.not-found)');
      }

      // Specific Interactive Execution for Key Tools
      let interactiveSuccess = '';

      if (route === 'images-to-pdf') {
        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles([assets.samplePngPath]);
        await wait(500);
        const createBtn = page.getByRole('button', { name: /Create PDF/i });
        if (await createBtn.isVisible()) {
          await createBtn.click();
          await page.waitForSelector('text=PDF created from 1 image', { timeout: 6000 });
          interactiveSuccess = ' [Image uploaded -> PDF created]';
        }
      } else if (route === 'yaml-validator') {
        const validateBtn = page.getByRole('button', { name: /Validate & Format/i });
        if (await validateBtn.isVisible()) {
          await validateBtn.click();
          await page.waitForSelector('text=Valid YAML', { timeout: 4000 });
          interactiveSuccess = ' [YAML parsed & formatted]';
        }
      } else if (route === 'image-compressor') {
        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles([assets.samplePngPath]);
        await wait(500);
        const compressBtn = page.getByRole('button', { name: /Compress Image/i });
        if (await compressBtn.isVisible()) {
          await compressBtn.click();
          await page.waitForSelector('text=Download Compressed', { timeout: 6000 });
          interactiveSuccess = ' [Image compressed & blob created]';
        }
      } else if (route === 'image-resizer') {
        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles([assets.samplePngPath]);
        await wait(500);
        const resizeBtn = page.getByRole('button', { name: /Resize Image/i });
        if (await resizeBtn.isVisible()) {
          await resizeBtn.click();
          await page.waitForSelector('text=Download', { timeout: 6000 });
          interactiveSuccess = ' [Image resized via Canvas]';
        }
      } else if (route === 'image-watermark') {
        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles([assets.samplePngPath]);
        await wait(500);
        const applyBtn = page.getByRole('button', { name: /Apply Watermark/i });
        if (await applyBtn.isVisible()) {
          await applyBtn.click();
          await page.waitForSelector('text=Download Watermarked', { timeout: 6000 });
          interactiveSuccess = ' [Watermark rendered via Canvas]';
        }
      } else if (route === 'svg-converter') {
        const convertBtn = page.getByRole('button', { name: /Convert SVG/i });
        if (await convertBtn.isVisible()) {
          await convertBtn.click();
          await page.waitForSelector('text=Download .png', { timeout: 6000 });
          interactiveSuccess = ' [SVG converted to PNG]';
        }
      } else if (route === 'webp-converter') {
        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles([assets.samplePngPath]);
        await wait(500);
        const convertBtn = page.getByRole('button', { name: /Convert/i });
        if (await convertBtn.isVisible()) {
          await convertBtn.click();
          await page.waitForSelector('text=Download', { timeout: 6000 });
          interactiveSuccess = ' [WebP conversion verified]';
        }
      }

      console.log(`[${idx + 1}/${toolRoutes.length}] ✓ PASS: /${route}${interactiveSuccess}`);
      results.push({ route, status: 'PASS', interactive: interactiveSuccess });
    } catch (err) {
      console.error(`[${idx + 1}/${toolRoutes.length}] ❌ FAIL: /${route} - ${err.message}`);
      results.push({ route, status: 'FAIL', error: err.message });
      overallFailed++;
    } finally {
      page.off('pageerror', onPageError);
    }
  }

  await browser.close();
  server.kill();
  try {
    spawn('taskkill', ['/pid', server.pid.toString(), '/f', '/t']);
  } catch {}

  console.log('\n====================================================');
  console.log(`AUDIT COMPLETE: ${results.length} TOOLS TESTED IN BROWSER`);
  console.log(`PASSED: ${results.length - overallFailed} | FAILED: ${overallFailed}`);
  console.log('====================================================');

  if (overallFailed > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
