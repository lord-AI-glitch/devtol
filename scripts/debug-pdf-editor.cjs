const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  console.log('Navigating to https://devtol.online/pdf-editor...');
  await page.goto('https://devtol.online/pdf-editor', { waitUntil: 'networkidle', timeout: 45000 });
  
  console.log('Page loaded! Title:', await page.title());
  const h1 = await page.$('h1');
  console.log('H1:', h1 ? await h1.textContent() : 'no h1');
  
  const buttons = await page.$$('button');
  console.log('Buttons count:', buttons.length);
  
  const inputs = await page.$$('input');
  console.log('Inputs count:', inputs.length);
  
  await page.screenshot({ path: 'reports/pdf-qa-screenshots/pdf-editor-networkidle.png', fullPage: false });
  console.log('Screenshot saved to reports/pdf-qa-screenshots/pdf-editor-networkidle.png');
  
  await browser.close();
})().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
