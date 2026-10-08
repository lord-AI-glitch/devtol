import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function test() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.goto('http://localhost:4173/images-to-pdf', { waitUntil: 'networkidle' });
  console.log('Page loaded!');
  
  const file1 = path.join(rootDir, 'public/favicon-16x16.png');
  const file2 = path.join(rootDir, 'public/apple-touch-icon.png');

  // Check inputs
  const inputs = await page.locator('input[type="file"]').all();
  console.log('Total file inputs on page:', inputs.length);

  for (let i = 0; i < inputs.length; i++) {
    console.log(`Input ${i} accept:`, await inputs[i].getAttribute('accept'));
  }

  // Set input files on the specific input
  await page.locator('input[accept="image/*"]').setInputFiles([file1, file2]);
  await page.waitForTimeout(2000);

  const bodyText = await page.textContent('body');
  console.log('Contains Image Order?', bodyText.includes('Image Order'));
  console.log('Contains Create PDF?', bodyText.includes('Create PDF'));
  console.log('Contains favicon-16x16.png?', bodyText.includes('favicon-16x16.png'));

  if (bodyText.includes('Create PDF')) {
    console.log('Clicking Create PDF...');
    await page.getByRole('button', { name: /Create PDF/i }).click();
    await page.waitForTimeout(2000);
    const afterClickText = await page.textContent('body');
    console.log('Contains PDF created from 2 images?', afterClickText.includes('PDF created from 2 image'));
    console.log('Contains Download images.pdf?', afterClickText.includes('Download images.pdf'));
  }

  await browser.close();
}

test();
