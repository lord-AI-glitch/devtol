import { chromium } from '@playwright/test';
import { execSync } from 'child_process';

const DEVTOL_DATA = {
  name: 'DevTol',
  url: 'https://devtol.online',
  tagline: '126+ Free, Private, Client-Side Developer & PDF Tools',
  category: 'Developer Tools',
  alternatives: 'CyberChef, IT-Tools, DevToys, iLovePDF, Smallpdf',
  tags: 'developer-tools, pdf-editor, pdf-tools, json, web-tools, privacy, utilities',
  shortDescription:
    'DevTol is a free, ultra-fast web productivity suite with 126+ client-side tools. Edit and compress PDFs, format JSON, test Regex, calculate AI tokens, and decode JWTs with 100% local privacy.',
  fullDescription: `DevTol (https://devtol.online) is an all-in-one, privacy-first web utilities suite hosting 126+ client-side developer and designer tools.

Unlike traditional online converters that upload your confidential documents to cloud servers, DevTol executes 100% inside your browser using Web Workers and the Web Crypto API. Your files, API keys, and sensitive data never leave your device.

Key Capabilities:
- Full PDF Suite: Compress PDF (to 100kb, 200kb, 500kb), Merge PDF, Client-Side PDF Editor with Arabic RTL font shaping, PDF to Image, Images to PDF, and Digital Signature Checker.
- Developer Utilities: JSON Viewer & Diff, JWT Decoder, Regex Sandbox, cURL to Code Converter (7 languages), SQL Prettifier, Hash/HMAC Generators, Base64 & Color Converters.
- AI & Modern Workflows: AI Prompt Token Counter & Cost Calculator (GPT-4o, Claude 3.5, Gemini, DeepSeek), Docker Compose Generator.
- Zero Sign-up: 100% free and unlimited, accessible from any browser.`,
};

// Copy primary pitch to Windows clipboard for convenience
try {
  execSync(
    `powershell -Command "Set-Clipboard -Value @'
${DEVTOL_DATA.fullDescription}
'@"`,
    { stdio: 'ignore' }
  );
  console.log('✓ DevTol full pitch copied to Windows Clipboard!');
} catch {}

const TARGET_DIRECTORIES = [
  {
    name: 'AlternativeTo (DR 82)',
    url: 'https://alternativeto.net/software/create/',
  },
  {
    name: 'Toolify.ai (DR 79)',
    url: 'https://www.toolify.ai/submit',
  },
  {
    name: 'StartupBase (DR 68)',
    url: 'https://startupbase.io/submit',
  },
  {
    name: 'Devpost (DR 85)',
    url: 'https://devpost.com/software/new',
  },
  {
    name: 'Reddit WebDev (DR 95)',
    url: 'https://www.reddit.com/r/webdev/submit',
  },
];

async function injectCopilotBanner(page, targetName) {
  try {
    await page.evaluate(data => {
      if (document.getElementById('devtol-copilot-banner')) return;

      const banner = document.createElement('div');
      banner.id = 'devtol-copilot-banner';
      banner.style.position = 'fixed';
      banner.style.bottom = '20px';
      banner.style.right = '20px';
      banner.style.zIndex = '99999999';
      banner.style.backgroundColor = '#0F0F23';
      banner.style.color = '#FFFFFF';
      banner.style.padding = '16px';
      banner.style.borderRadius = '12px';
      banner.style.boxShadow = '0 10px 30px rgba(0,0,0,0.6), 0 0 15px rgba(52, 211, 153, 0.4)';
      banner.style.border = '1px solid #34d399';
      banner.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      banner.style.maxWidth = '360px';
      banner.style.direction = 'ltr';

      banner.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <strong style="color:#34d399; font-size:14px;">🚀 DevTol AI Co-Pilot</strong>
          <span style="font-size:11px; opacity:0.8;">Active</span>
        </div>
        <p style="font-size:12px; margin:0 0 10px 0; color:#E2E8F0;">
          Auto-fill ready for <strong>${data.name}</strong>.
        </p>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px;">
          <button id="devtol-btn-fill" style="background:#10B981; color:white; border:none; padding:6px 10px; border-radius:6px; font-size:12px; cursor:pointer; font-weight:600;">
            ⚡ Auto-Fill Fields
          </button>
          <button id="devtol-btn-copy" style="background:#374151; color:white; border:none; padding:6px 10px; border-radius:6px; font-size:12px; cursor:pointer;">
            📋 Copy Pitch
          </button>
        </div>
      `;

      document.body.appendChild(banner);

      document.getElementById('devtol-btn-fill').addEventListener('click', () => {
        // Attempt intelligent form filling
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
          const name = (input.name || input.id || input.placeholder || '').toLowerCase();
          if (name.includes('name') || name.includes('title')) {
            input.value = data.name;
            input.dispatchEvent(new Event('input', { bubbles: true }));
          } else if (name.includes('url') || name.includes('website') || name.includes('link')) {
            input.value = data.url;
            input.dispatchEvent(new Event('input', { bubbles: true }));
          } else if (name.includes('tagline') || name.includes('subtitle')) {
            input.value = data.tagline;
            input.dispatchEvent(new Event('input', { bubbles: true }));
          } else if (name.includes('tag') || name.includes('keyword')) {
            input.value = data.tags;
            input.dispatchEvent(new Event('input', { bubbles: true }));
          } else if (input.tagName === 'TEXTAREA' || name.includes('desc') || name.includes('about')) {
            input.value = data.fullDescription;
            input.dispatchEvent(new Event('input', { bubbles: true }));
          }
        });
        alert('DevTol data injected into detected fields!');
      });

      document.getElementById('devtol-btn-copy').addEventListener('click', () => {
        navigator.clipboard.writeText(data.fullDescription);
        alert('Copied full description to clipboard!');
      });
    }, DEVTOL_DATA);
  } catch {}
}

async function main() {
  console.log('====================================================');
  console.log('  DevTol Playwright Interactive Backlinks Co-Pilot');
  console.log('====================================================\n');
  console.log('Launching Google Chrome on your desktop in visible mode...\n');

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: false,
    args: ['--start-maximized'],
  });

  const context = await browser.newContext({
    viewport: null, // Full native window size
  });

  const page = await context.newPage();

  console.log('Opening target 1: AlternativeTo (DR 82)...');
  console.log('-> If Cloudflare Turnstile appears, click the checkbox on your screen to proceed.');
  console.log('-> DevTol AI Co-Pilot floating banner will appear on the bottom-right corner!\n');

  try {
    await page.goto(TARGET_DIRECTORIES[0].url, {
      waitUntil: 'commit',
      timeout: 30000,
    });
  } catch (err) {
    console.log('Navigation:', err.message);
  }

  // Inject helper banner periodically as pages navigate
  page.on('load', async () => {
    await injectCopilotBanner(page, TARGET_DIRECTORIES[0].name);
  });

  // Keep alive for 15 minutes for the user to submit comfortably
  console.log('====================================================');
  console.log('Browser is active and under your control on your screen.');
  console.log('You can fill fields with 1 click using the floating green button.');
  console.log('Session will remain open for 15 minutes.');
  console.log('====================================================');

  await page.waitForTimeout(900000);
  await browser.close();
}

main().catch(err => {
  console.error('Co-Pilot error:', err.message);
  process.exit(1);
});
