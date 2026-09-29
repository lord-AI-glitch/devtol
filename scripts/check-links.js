import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '..', 'dist');

const files = [];

function getFiles(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getFiles(fullPath);
    } else if (file.endsWith('.html')) {
      files.push(fullPath);
    }
  });
}

getFiles(distDir);
console.log('Total HTML files to scan for internal links:', files.length);

const brokenLinks = new Set();
let totalLinksScanned = 0;

for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  const hrefRegex = /href=["'](\/[^"'#?]+)["']/g;
  let match;
  while ((match = hrefRegex.exec(content)) !== null) {
    const rawLink = match[1];
    const linkPath = rawLink.replace(/^\//, '');
    totalLinksScanned++;

    // Ignore asset files
    if (
      linkPath.startsWith('assets/') ||
      linkPath.endsWith('.svg') ||
      linkPath.endsWith('.png') ||
      linkPath.endsWith('.ico') ||
      linkPath.endsWith('.txt') ||
      linkPath.endsWith('.xml') ||
      linkPath.endsWith('.webmanifest') ||
      linkPath.endsWith('.js') ||
      linkPath.endsWith('.css') ||
      linkPath === ''
    ) {
      continue;
    }

    const p1 = path.join(distDir, linkPath);
    const p2 = path.join(distDir, `${linkPath}.html`);
    const p3 = path.join(distDir, linkPath, 'index.html');

    if (!fs.existsSync(p1) && !fs.existsSync(p2) && !fs.existsSync(p3)) {
      brokenLinks.add(rawLink);
    }
  }
}

console.log('Total internal links checked:', totalLinksScanned);
console.log('Broken link candidates found:', Array.from(brokenLinks));
