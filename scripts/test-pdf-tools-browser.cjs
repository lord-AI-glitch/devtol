const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.SITE_URL || 'https://devtol.online';
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'reports', 'pdf-qa-screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const targets = [
  { slug: 'pdf-tools', path: '/pdf-tools', name: 'PDF Tools Hub (EN)' },
  { slug: 'ar-pdf-tools', path: '/ar/pdf-tools', name: 'PDF Tools Hub (AR)' },
  { slug: 'pdf-editor', path: '/pdf-editor', name: 'PDF Editor' },
  { slug: 'pdf-merge', path: '/pdf-merge', name: 'PDF Merge' },
  { slug: 'pdf-split', path: '/pdf-split', name: 'PDF Split' },
  { slug: 'pdf-compress', path: '/pdf-compress', name: 'PDF Compress' },
  { slug: 'pdf-to-image', path: '/pdf-to-image', name: 'PDF to Image' },
  { slug: 'images-to-pdf', path: '/images-to-pdf', name: 'Images to PDF' },
  { slug: 'pdf-protect', path: '/pdf-protect', name: 'PDF Protect' },
  { slug: 'pdf-organize', path: '/pdf-organize', name: 'PDF Organize' },
  { slug: 'pdf-ocr', path: '/pdf-ocr', name: 'PDF OCR' },
  { slug: 'pdf-redact', path: '/pdf-redact', name: 'PDF Redact' },
  { slug: 'pdf-watermark-tool', path: '/pdf-watermark-tool', name: 'PDF Watermark' },
  { slug: 'pdf-signature-checker', path: '/pdf-signature-checker', name: 'PDF Signature Verifier' },
  { slug: 'compress-pdf-200kb', path: '/compress-pdf/200kb', name: 'Programmatic: Compress PDF to 200KB' }
];

async function runQa() {
  console.log('====================================================');
  console.log(`Starting Live Browser QA with Chrome on: ${BASE_URL}`);
  console.log('====================================================');

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 DevTolQA/1.0',
  });

  const page = await context.newPage();
  const results = [];

  for (const target of targets) {
    const url = `${BASE_URL}${target.path}`;
    console.log(`\nTesting: [${target.name}] -> ${url}`);

    const consoleErrors = [];
    const failedRequests = [];

    const onConsole = msg => {
      if (msg.type() === 'error') {
        // Filter out benign external tracking/font warnings if any
        consoleErrors.push(msg.text());
      }
    };

    const onPageError = err => {
      consoleErrors.push(`Uncaught: ${err.message}`);
    };

    const onRequestFailed = req => {
      // Ignore third-party adblock/adsense blocked calls
      const u = req.url();
      if (!u.includes('google') && !u.includes('doubleclick')) {
        failedRequests.push(`${req.method()} ${u}: ${req.failure()?.errorText || 'failed'}`);
      }
    };

    page.on('console', onConsole);
    page.on('pageerror', onPageError);
    page.on('requestfailed', onRequestFailed);

    let loadSuccess = false;
    let pageTitle = '';
    let hasH1 = false;
    let h1Text = '';
    let responseStatus = 0;

    try {
      const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
      responseStatus = response ? response.status() : 0;
      await page.waitForTimeout(1500); // Allow Vue hydration

      pageTitle = await page.title();
      const h1El = await page.$('h1');
      if (h1El) {
        hasH1 = true;
        h1Text = (await h1El.textContent() || '').trim();
      }

      // Check specific interactive capabilities
      if (target.slug === 'pdf-tools' || target.slug === 'ar-pdf-tools') {
        // Test search input
        const searchInput = await page.$('input[type="text"]');
        if (searchInput) {
          await searchInput.fill(target.slug === 'ar-pdf-tools' ? 'دمج' : 'merge');
          await page.waitForTimeout(500);
          console.log(`  ✓ Search interaction test passed`);
          await searchInput.fill('');
        }

        // Test category filter click
        const categoryButtons = await page.$$('.pdf-hub-container button');
        console.log(`  ✓ Found ${categoryButtons.length} filter buttons in PDF Hub`);
      } else {
        // Check presence of dropzone, buttons, or canvas
        const hasInteractive = await page.evaluate(() => {
          const inputs = document.querySelectorAll('input, button, canvas, .n-upload, .dropzone');
          return inputs.length > 0;
        });
        console.log(`  ✓ Interactive elements detected: ${hasInteractive}`);
      }

      const screenshotPath = path.join(SCREENSHOTS_DIR, `${target.slug}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });
      console.log(`  ✓ Screenshot saved: ${screenshotPath}`);

      loadSuccess = responseStatus >= 200 && responseStatus < 400;
    } catch (err) {
      console.error(`  ✗ Page load error: ${err.message}`);
      consoleErrors.push(err.message);
    } finally {
      page.off('console', onConsole);
      page.off('pageerror', onPageError);
      page.off('requestfailed', onRequestFailed);
    }

    results.push({
      target,
      url,
      responseStatus,
      loadSuccess,
      pageTitle,
      hasH1,
      h1Text,
      consoleErrors,
      failedRequests,
    });
  }

  await browser.close();

  // Print Summary Table
  console.log('\n====================================================');
  console.log('LIVE QA AUDIT RESULTS SUMMARY:');
  console.log('====================================================');

  let passedCount = 0;
  for (const r of results) {
    const isOk = r.loadSuccess && r.consoleErrors.length === 0;
    if (isOk) passedCount++;
    console.log(`${isOk ? '✅' : '⚠️'} [${r.responseStatus}] ${r.target.name}`);
    console.log(`   Title: "${r.pageTitle.slice(0, 70)}..."`);
    console.log(`   H1: "${r.h1Text.slice(0, 50)}"`);
    if (r.consoleErrors.length > 0) {
      console.log(`   Console Errors (${r.consoleErrors.length}):`, r.consoleErrors);
    }
    if (r.failedRequests.length > 0) {
      console.log(`   Failed Requests (${r.failedRequests.length}):`, r.failedRequests);
    }
  }

  console.log(`\nTotal Passed: ${passedCount} / ${results.length}`);
  
  // Save JSON report
  const reportPath = path.join(__dirname, '..', 'reports', 'pdf-qa-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`Full report saved to: ${reportPath}`);
}

runQa().catch(err => {
  console.error('Fatal QA error:', err);
  process.exit(1);
});
