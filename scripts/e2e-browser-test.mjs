import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runBrowserTests() {
  console.log('----------------------------------------------------');
  console.log('🌐 STARTING REAL BROWSER E2E TEST VIA PLAYWRIGHT');
  console.log('----------------------------------------------------\n');

  console.log('Starting vite preview server on port 4173...');
  const server = spawn('npx', ['vite', 'preview', '--port', '4173', '--strictPort'], {
    cwd: rootDir,
    shell: true,
    stdio: 'pipe',
  });

  server.stdout.on('data', d => {
    // console.log(`[preview] ${d}`);
  });
  server.stderr.on('data', d => {
    // console.error(`[preview-err] ${d}`);
  });

  // Wait for server to be responsive
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

  console.log('✓ Preview server is UP and responding at http://localhost:4173\n');

  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', err => {
    consoleErrors.push(err.message);
  });

  try {
    // ----------------------------------------------------
    // TEST 1: Images to PDF Tool (/images-to-pdf)
    // ----------------------------------------------------
    console.log('1. Testing /images-to-pdf in Chromium...');
    await page.goto('http://localhost:4173/images-to-pdf', { waitUntil: 'networkidle' });
    
    // Check page title / content
    const pageContent = await page.content();
    if (!pageContent.includes('Upload Images')) {
      throw new Error('Images to PDF page failed to render upload card');
    }

    // Upload two real images
    const file1 = path.join(rootDir, 'public/favicon-16x16.png');
    const file2 = path.join(rootDir, 'public/apple-touch-icon.png');
    const inputLocator = page.locator('input[type="file"]');
    await inputLocator.setInputFiles([file1, file2]);
    await wait(1000);

    // Verify images list is rendered
    const listItems = page.locator('.n-list-item');
    const count = await listItems.count();
    console.log(`   Found ${count} uploaded image item(s) in UI`);
    if (count !== 2) {
      throw new Error(`Expected 2 items in images list, found ${count}`);
    }

    // Click "Create PDF" button
    const createBtn = page.getByRole('button', { name: /Create PDF/i });
    await createBtn.click();
    console.log('   Clicked "Create PDF" button...');

    // Wait for Result card and download button
    await page.waitForSelector('text=PDF created from 2 images', { timeout: 10000 });
    const downloadBtn = page.getByRole('button', { name: /Download images.pdf/i });
    const isVisible = await downloadBtn.isVisible();
    if (!isVisible) {
      throw new Error('Download button did not appear after PDF creation');
    }
    console.log('   ✓ SUCCESS: Images converted to PDF and verified in browser UI!\n');

    // ----------------------------------------------------
    // TEST 2: YAML Validator (/yaml-validator)
    // ----------------------------------------------------
    console.log('2. Testing /yaml-validator in Chromium...');
    await page.goto('http://localhost:4173/yaml-validator', { waitUntil: 'networkidle' });
    const validateBtn = page.getByRole('button', { name: /Validate & Format/i });
    await validateBtn.click();
    await wait(1000);
    const validTag = page.locator('text=Valid YAML');
    const tagVisible = await validTag.first().isVisible();
    if (!tagVisible) {
      throw new Error('YAML validator failed to show Valid YAML tag');
    }
    console.log('   ✓ SUCCESS: YAML validator parsed and formatted cleanly in browser!\n');

    // ----------------------------------------------------
    // TEST 3: Check PDF Merge route (/pdf-merge)
    // ----------------------------------------------------
    console.log('3. Testing /pdf-merge route in Chromium...');
    await page.goto('http://localhost:4173/pdf-merge', { waitUntil: 'networkidle' });
    const mergeTitle = await page.textContent('body');
    if (!mergeTitle.includes('PDF')) {
      throw new Error('PDF Merge page failed to render');
    }
    console.log('   ✓ SUCCESS: /pdf-merge rendered properly!\n');

    // ----------------------------------------------------
    // TEST 4: Check PDF Split route (/pdf-split)
    // ----------------------------------------------------
    console.log('4. Testing /pdf-split route in Chromium...');
    await page.goto('http://localhost:4173/pdf-split', { waitUntil: 'networkidle' });
    const splitContent = await page.textContent('body');
    if (!splitContent.includes('PDF')) {
      throw new Error('PDF Split page failed to render');
    }
    console.log('   ✓ SUCCESS: /pdf-split rendered properly!\n');

    // Check console errors
    const criticalErrors = consoleErrors.filter(e => !e.includes('favicon') && !e.includes('analytics') && !e.includes('adsbygoogle'));
    if (criticalErrors.length > 0) {
      console.warn('⚠️ Console errors detected:', criticalErrors);
    } else {
      console.log('✓ ZERO unhandled JavaScript errors in browser console during test run!');
    }

    console.log('\n====================================================');
    console.log('🎉 ALL BROWSER E2E TESTS PASSED 100%!');
    console.log('====================================================');
  } catch (err) {
    console.error('❌ E2E Browser Test Failed:', err.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
    server.kill();
    // In windows, kill child process tree
    try {
      spawn('taskkill', ['/pid', server.pid.toString(), '/f', '/t']);
    } catch {}
  }
}

runBrowserTests();
