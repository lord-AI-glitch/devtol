import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import YAML from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const BASE_URL = process.env.SITE_URL || 'https://devtol.online';

console.log('[SEO Generator] Starting comprehensive SEO generation (sitemap, robots, llms.txt)...');
console.log(`[SEO Generator] Base URL: ${BASE_URL}`);

// Load English locale for descriptions
const enLocalePath = path.join(rootDir, 'locales', 'en.yml');
let enLocale = { tools: {} };
if (fs.existsSync(enLocalePath)) {
  try {
    enLocale = YAML.parse(fs.readFileSync(enLocalePath, 'utf8')) || { tools: {} };
  } catch (err) {
    console.warn('[SEO Generator] Warning: Could not parse locales/en.yml', err.message);
  }
}

// 1. Core static routes
const staticRoutes = [
  { path: '/', priority: '1.0', changefreq: 'daily', title: 'DevTol — 126+ Free Online Developer Tools | 100% Client-Side' },
  { path: '/guides', priority: '0.9', changefreq: 'weekly', title: 'Developer Engineering Guides & Technical Architecture' },
  { path: '/deals', priority: '0.8', changefreq: 'weekly', title: 'Developer Deals, Cloud Credits & Partner Perks' },
  { path: '/pdf-tools', priority: '0.9', changefreq: 'weekly', title: 'Free PDF Tools Online — 100% Client-Side & Private' },
  { path: '/about', priority: '0.8', changefreq: 'monthly', title: 'About Us & Editorial Standards' },
  { path: '/privacy-policy', priority: '0.6', changefreq: 'monthly', title: 'Privacy Policy & Local Processing' },
  { path: '/terms-of-service', priority: '0.6', changefreq: 'monthly', title: 'Terms of Service' },
  { path: '/contact', priority: '0.7', changefreq: 'monthly', title: 'Contact Us & Technical Support' },
  { path: '/disclaimer', priority: '0.5', changefreq: 'monthly', title: 'Disclaimer & RFC Compliance' },
];

// Check if legal/compliance markdown articles exist
const legalDir = path.join(rootDir, 'src', 'content', 'legal');
if (fs.existsSync(legalDir)) {
  const legalFiles = fs.readdirSync(legalDir).filter(f => f.endsWith('.md'));
  for (const file of legalFiles) {
    const slug = file.replace(/\.md$/, '');
    const routePath = `/${slug}`;
    if (!staticRoutes.some(r => r.path === routePath)) {
      staticRoutes.push({ path: routePath, priority: '0.5', changefreq: 'monthly', title: slug });
    }
  }
}

// 2. Extract tools from src/tools/index.ts
const toolsIndexPath = path.join(rootDir, 'src', 'tools', 'index.ts');
if (!fs.existsSync(toolsIndexPath)) {
  console.error(`[SEO Generator] Error: src/tools/index.ts not found at ${toolsIndexPath}`);
  process.exit(1);
}

const toolsIndexContent = fs.readFileSync(toolsIndexPath, 'utf8');

// Parse import statements
const importRegex = /import\s+\{\s*tool\s+as\s+(\w+)\s*\}\s+from\s+['"](\.\/[^'"]+)['"]/g;
const importedModules = new Map();
let importMatch;
while ((importMatch = importRegex.exec(toolsIndexContent)) !== null) {
  importedModules.set(importMatch[1], importMatch[2]);
}

// Parse tools registered in toolsByCategory
const categorySection = toolsIndexContent.substring(toolsIndexContent.indexOf('export const toolsByCategory'));

const categoriesWithTools = [];
const catMatches = categorySection.match(/name:\s*['"][^'"]+['"][\s\S]*?components:\s*\[[\s\S]*?\]/g) || [];
for (const chunk of catMatches) {
  const nMatch = chunk.match(/name:\s*['"]([^'"]+)['"]/);
  const cMatch = chunk.match(/components:\s*\[([\s\S]*?)\]/);
  if (nMatch && cMatch) {
    const catName = nMatch[1];
    const catToolVars = [];
    let tm;
    const r = /\b([a-zA-Z0-9_]+)\b/g;
    while ((tm = r.exec(cMatch[1])) !== null) {
      if (importedModules.has(tm[1])) {
        catToolVars.push(tm[1]);
      }
    }
    categoriesWithTools.push({ name: catName, tools: catToolVars });
  }
}

// All registered tools
const toolTokenRegex = /\b([a-zA-Z0-9_]+)\b/g;
const registeredToolVars = new Set();
let tokenMatch;
while ((tokenMatch = toolTokenRegex.exec(categorySection)) !== null) {
  if (importedModules.has(tokenMatch[1])) {
    registeredToolVars.add(tokenMatch[1]);
  }
}

console.log(`[SEO Generator] Found ${registeredToolVars.size} active tools across ${categoriesWithTools.length} categories.`);

const toolRoutes = [];
const today = new Date().toISOString().split('T')[0];
const toolDetails = [];

for (const varName of registeredToolVars) {
  const relImport = importedModules.get(varName);
  let toolFilePath = path.join(rootDir, 'src', 'tools', relImport.replace('./', ''), 'index.ts');
  if (!fs.existsSync(toolFilePath)) {
    toolFilePath = path.join(rootDir, 'src', 'tools', `${relImport.replace('./', '')}.ts`);
  }

  if (fs.existsSync(toolFilePath)) {
    const fileContent = fs.readFileSync(toolFilePath, 'utf8');
    const pathMatch = fileContent.match(/path:\s*['"]([^'"]+)['"]/);
    if (pathMatch) {
      const toolPath = pathMatch[1].startsWith('/') ? pathMatch[1] : `/${pathMatch[1]}`;
      const slug = toolPath.replace(/^\//, '');

      const dateMatch = fileContent.match(/createdAt:\s*new Date\(['"]([^'"]+)['"]\)/);
      const lastmod = dateMatch ? dateMatch[1] : today;

      const localeEntry = (enLocale.tools && enLocale.tools[slug]) || {};
      let title = localeEntry.title;
      let description = localeEntry.description;

      const literalNameMatch = fileContent.match(/name:\s*['"]([^'"]+)['"]/);
      if (!title && literalNameMatch) {
        title = literalNameMatch[1];
      }

      const literalDescMatch = fileContent.match(/description:\s*['"]([^'"]+)['"]/);
      if (!description && literalDescMatch) {
        description = literalDescMatch[1];
      }

      if (!title) {
        title = slug
          .split('-')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
      }
      if (!description) {
        description = `Free, client-side, instant ${title} online developer tool.`;
      }

      toolRoutes.push({
        path: toolPath,
        priority: '0.8',
        changefreq: 'weekly',
        lastmod,
        title,
        description,
        slug,
      });

      toolDetails.push({
        varName,
        slug,
        title,
        description,
        path: toolPath,
        lastmod,
      });
    }
  }
}

const programmaticScenarios = [
  {
    path: '/docker-run-to-compose/nginx',
    priority: '0.8',
    changefreq: 'weekly',
    title: 'Convert Docker Run Nginx to Docker Compose YML',
    description: 'Instantly convert Nginx docker run command into a production-ready docker-compose.yml file.',
  },
  {
    path: '/docker-run-to-compose/postgres',
    priority: '0.8',
    changefreq: 'weekly',
    title: 'Convert Docker Run PostgreSQL to Docker Compose YML',
    description: 'Instantly convert PostgreSQL 16 docker run command into a production-ready docker-compose.yml file.',
  },
  {
    path: '/docker-run-to-compose/redis',
    priority: '0.8',
    changefreq: 'weekly',
    title: 'Convert Docker Run Redis to Docker Compose YML',
    description: 'Instantly convert Redis docker run command into a production-ready docker-compose.yml file.',
  },
  {
    path: '/docker-run-to-compose/mysql',
    priority: '0.8',
    changefreq: 'weekly',
    title: 'Convert Docker Run MySQL to Docker Compose YML',
    description: 'Instantly convert MySQL 8.0 docker run command into a production-ready docker-compose.yml file.',
  },
  {
    path: '/docker-run-to-compose/mongodb',
    priority: '0.8',
    changefreq: 'weekly',
    title: 'Convert Docker Run MongoDB to Docker Compose YML',
    description: 'Instantly convert MongoDB NoSQL docker run command into a production-ready docker-compose.yml file.',
  },
  {
    path: '/docker-run-to-compose/rabbitmq',
    priority: '0.8',
    changefreq: 'weekly',
    title: 'Convert Docker Run RabbitMQ to Docker Compose YML',
    description: 'Instantly convert RabbitMQ message broker docker run command into a production-ready docker-compose.yml file.',
  },
  {
    path: '/docker-run-to-compose/wordpress',
    priority: '0.8',
    changefreq: 'weekly',
    title: 'Convert Docker Run WordPress to Docker Compose YML',
    description: 'Instantly convert WordPress CMS docker run command into a production-ready docker-compose.yml file.',
  },
  {
    path: '/color-converter/hex-to-rgb',
    priority: '0.8',
    changefreq: 'weekly',
    title: 'HEX to RGB Color Converter',
    description: 'Convert HEX color codes to RGB values instantly with live preview.',
  },
  {
    path: '/color-converter/rgb-to-hex',
    priority: '0.8',
    changefreq: 'weekly',
    title: 'RGB to HEX Color Converter',
    description: 'Convert RGB color values to hexadecimal format instantly with live preview.',
  },
  {
    path: '/color-converter/hex-to-hsl',
    priority: '0.8',
    changefreq: 'weekly',
    title: 'HEX to HSL Color Converter',
    description: 'Convert HEX colors to HSL (Hue, Saturation, Lightness) values for CSS.',
  },
  {
    path: '/color-converter/rgb-to-hsl',
    priority: '0.8',
    changefreq: 'weekly',
    title: 'RGB to HSL Color Converter',
    description: 'Convert RGB colors to HSL notation for modern UI/UX design systems.',
  },
  {
    path: '/date-converter/unix-timestamp-to-utc',
    priority: '0.8',
    changefreq: 'weekly',
    title: 'Unix Timestamp to UTC Converter',
    description: 'Convert Unix epoch timestamp seconds to UTC human-readable format.',
  },
  {
    path: '/date-converter/unix-timestamp-to-iso',
    priority: '0.8',
    changefreq: 'weekly',
    title: 'Unix Timestamp to ISO 8601 Converter',
    description: 'Convert seconds since Unix epoch to standard ISO 8601 datetime format.',
  },
  {
    path: '/date-converter/iso-to-unix-timestamp',
    priority: '0.8',
    changefreq: 'weekly',
    title: 'ISO 8601 to Unix Timestamp Converter',
    description: 'Convert ISO 8601 date string to Unix epoch seconds and milliseconds.',
  },
  {
    path: '/compress-pdf/100kb',
    priority: '0.8',
    changefreq: 'weekly',
    title: 'Compress PDF to 100KB Online Free — 100% Client-Side',
    description: 'Compress PDF files down to 100KB online for job applications, email attachments, and government portals without uploading files.',
  },
  {
    path: '/compress-pdf/200kb',
    priority: '0.8',
    changefreq: 'weekly',
    title: 'Compress PDF to 200KB Online Free — Fast & Private',
    description: 'Reduce PDF file size to 200KB or less locally in your browser. Fast, free, and completely secure.',
  },
  {
    path: '/compress-pdf/500kb',
    priority: '0.8',
    changefreq: 'weekly',
    title: 'Compress PDF to 500KB Online Free — High Quality',
    description: 'Compress PDF documents to under 500KB with crystal-clear text and image quality preserved.',
  },
  {
    path: '/compress-pdf/1mb',
    priority: '0.8',
    changefreq: 'weekly',
    title: 'Compress PDF to 1MB Online Free — Instant Local Compression',
    description: 'Shrink large PDF documents down to 1MB instantly without file size limits or paywalls.',
  },
  {
    path: '/merge-pdf/combine-two-pdfs',
    priority: '0.8',
    changefreq: 'weekly',
    title: 'Combine Two PDF Files Online Free — Instant & Private',
    description: 'Merge and combine two PDF files into one document in seconds. 100% client-side, zero server storage.',
  },
  {
    path: '/merge-pdf/merge-scanned-documents',
    priority: '0.8',
    changefreq: 'weekly',
    title: 'Merge Scanned Documents into One PDF Online',
    description: 'Combine multiple scanned document pages, receipts, and invoices into a single organized PDF file.',
  },
  {
    path: '/pdf-split/extract-pages',
    priority: '0.8',
    changefreq: 'weekly',
    title: 'Extract Pages from PDF Online Free — Fast Page Extractor',
    description: 'Extract specific single or multiple pages from your PDF document and save as a new PDF file instantly.',
  },
  {
    path: '/pdf-split/split-by-range',
    priority: '0.8',
    changefreq: 'weekly',
    title: 'Split PDF by Page Range Online Free — Precision Splitting',
    description: 'Divide large PDF documents into smaller parts by custom page ranges (e.g. 1-5, 6-10).',
  },
  {
    path: '/pdf-to-image/pdf-to-jpg',
    priority: '0.8',
    changefreq: 'weekly',
    title: 'Convert PDF to JPG High Resolution Online Free',
    description: 'Convert every PDF page into high-quality JPG images. Download individual images or all pages in a ZIP archive.',
  },
  {
    path: '/pdf-to-image/pdf-to-png',
    priority: '0.8',
    changefreq: 'weekly',
    title: 'Convert PDF to Transparent PNG Online Free',
    description: 'Convert PDF documents to crisp, lossless PNG images locally without uploading documents to external servers.',
  },
  {
    path: '/images-to-pdf/jpg-to-pdf',
    priority: '0.8',
    changefreq: 'weekly',
    title: 'Convert JPG to PDF Online Free — Combine Photos to PDF',
    description: 'Convert JPG photos and graphics into a clean, compact PDF document. Reorder pages and adjust margins freely.',
  },
  {
    path: '/images-to-pdf/png-to-pdf',
    priority: '0.8',
    changefreq: 'weekly',
    title: 'Convert PNG to PDF Online Free — High Quality PDF Document',
    description: 'Convert lossless PNG graphics and illustrations into professional PDF documents instantly.',
  },
  {
    path: '/vs/ilovepdf',
    priority: '0.9',
    changefreq: 'weekly',
    title: 'DevTol vs iLovePDF — 100% Client-Side Private PDF Alternative',
    description: 'Compare DevTol vs iLovePDF: Merge, split, compress, and convert PDFs locally in your browser via WebAssembly with zero cloud server uploads or daily paywall limits.',
  },
  {
    path: '/vs/smallpdf',
    priority: '0.9',
    changefreq: 'weekly',
    title: 'DevTol vs Smallpdf — Free Unlimited Offline-Capable PDF Suite',
    description: 'Why engineers and privacy-conscious teams switch from Smallpdf to DevTol for unlimited, zero-upload local PDF compression, OCR, and digital watermarking.',
  },
  {
    path: '/vs/cyberchef',
    priority: '0.9',
    changefreq: 'weekly',
    title: 'DevTol vs CyberChef — Modern Fast Web Cryptography & Encoding Suite',
    description: 'Compare DevTol vs GCHQ CyberChef: Instant, dedicated UI routes for AES/RSA encryption, hashing, JWT decoding, Base64, and binary inspection with zero UI lag.',
  },
  {
    path: '/vs/devutils',
    priority: '0.9',
    changefreq: 'weekly',
    title: 'DevTol vs DevUtils — Free Cross-Platform Browser Alternative',
    description: 'Get all the power of macOS DevUtils free in any browser on Windows, Linux, macOS, and mobile with 100% local execution and PWA offline support.',
  },
  {
    path: '/vs/jwt-io',
    priority: '0.9',
    changefreq: 'weekly',
    title: 'DevTol vs JWT.io — Private Client-Side JWT Decoder & Key Generator',
    description: 'Decode, verify, and inspect JSON Web Tokens (JWT) alongside HMAC/RSA key generation and OAuth debugging in a unified zero-telemetry workspace.',
  },
  {
    path: '/vs/jsonlint',
    priority: '0.9',
    changefreq: 'weekly',
    title: 'DevTol vs JSONLint — Ad-Free JSON Formatter, Diff & TypeScript Generator',
    description: 'Validate, prettify, minify, diff, and convert JSON to TypeScript, Go, Rust, or CSV locally without intrusive ads or server-side payload logging.',
  },
  {
    path: '/vs/regex101',
    priority: '0.9',
    changefreq: 'weekly',
    title: 'DevTol vs Regex101 — Fast Client-Side Regular Expression Tester & Cheatsheet',
    description: 'Test JavaScript and PCRE regular expressions with instant match highlighting, capture group extraction, and integrated developer tools in one offline PWA.',
  },
  {
    path: '/vs/base64decode',
    priority: '0.9',
    changefreq: 'weekly',
    title: 'DevTol vs Base64Decode.org — Zero-Upload Base64 String & File Encoder',
    description: 'Encode and decode Base64 strings, images, and binary files locally in browser RAM without sending sensitive credentials or API payloads to remote servers.',
  },
];

// Combine all routes
const allRoutes = [...staticRoutes, ...toolRoutes, ...programmaticScenarios];
const uniqueRoutes = Array.from(new Map(allRoutes.map(item => [item.path, item])).values());
console.log(`[SEO Generator] Total unique URLs to index in sitemap: ${uniqueRoutes.length}`);

const publicDir = path.join(rootDir, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const supportedLangs = ['ar', 'de', 'es', 'fr', 'no', 'pt', 'uk', 'vi', 'zh'];

// 3. Generate multi-language sitemap.xml with full bidirectional xhtml:link hreflang annotations
const sitemapEntries = [];

for (const route of uniqueRoutes) {
  const isHome = route.path === '/';
  const defaultUrl = `${BASE_URL}${route.path}`;
  
  // Build alternate links for default, en, and each supported language
  const alternates = [
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${defaultUrl}" />`,
    `    <xhtml:link rel="alternate" hreflang="en" href="${defaultUrl}" />`,
    ...supportedLangs.map(
      lang => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${BASE_URL}/${lang}${isHome ? '' : route.path}" />`
    ),
  ].join('\n');

  // 1. English / default URL entry
  sitemapEntries.push(`  <url>
    <loc>${defaultUrl}</loc>
${alternates}
    <lastmod>${route.lastmod || today}</lastmod>
    <changefreq>${route.changefreq || 'weekly'}</changefreq>
    <priority>${route.priority || '0.8'}</priority>
  </url>`);

  // 2. Localized URL entries for each supported language
  for (const lang of supportedLangs) {
    const localizedUrl = `${BASE_URL}/${lang}${isHome ? '' : route.path}`;
    const priority = route.path === '/' ? '0.9' : '0.8';
    sitemapEntries.push(`  <url>
    <loc>${localizedUrl}</loc>
${alternates}
    <lastmod>${route.lastmod || today}</lastmod>
    <changefreq>${route.changefreq || 'weekly'}</changefreq>
    <priority>${priority}</priority>
  </url>`);
  }
}

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${sitemapEntries.join('\n')}
</urlset>
`;

const sitemapPath = path.join(publicDir, 'sitemap.xml');
fs.writeFileSync(sitemapPath, sitemapXml.trim() + '\n', 'utf8');
console.log(`[SEO Generator] Successfully generated ${sitemapPath} with ${sitemapEntries.length} multi-lingual URLs & bidirectional hreflangs!`);

// 4. Generate robots.txt
const robotsTxt = `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /

# Search Crawlers
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Applebot
Allow: /

User-agent: Yandex
Allow: /

User-agent: DuckDuckBot
Allow: /

User-agent: Baiduspider
Allow: /

# AI & LLM Search Crawlers (Generative Engine Optimization - GEO)
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: Bytespider
Allow: /

User-agent: CCBot
Allow: /

User-agent: Cohere-ai
Allow: /

User-agent: FacebookBot
Allow: /

User-agent: Amazonbot
Allow: /

User-agent: meta-externalagent
Allow: /

# Host & Sitemaps
Host: ${BASE_URL.replace(/^https?:\/\//, '')}
Sitemap: ${BASE_URL}/sitemap.xml
`;

const robotsPath = path.join(publicDir, 'robots.txt');
fs.writeFileSync(robotsPath, robotsTxt, 'utf8');
console.log(`[SEO Generator] Successfully generated ${robotsPath}`);

// 5. Generate llms.txt (GEO standard)
const toolDetailMap = new Map(toolDetails.map(t => [t.varName, t]));

let llmsContent = `# DevTol

> DevTol is a free, open-source, client-side developer utility platform featuring 120+ tools across PDF processing, cryptography, image editing, data converters, network utilities, and text formatting. All operations run 100% locally inside the browser sandbox with zero server data transmission.

## Platform Principles
- 100% Client-Side Privacy: Passwords, tokens, images, and documents never leave the user browser.
- Offline Capable: Designed as a high-performance Progressive Web Application (PWA).
- Zero Latency: Local execution using modern WebAssembly and JavaScript algorithms.

## Developer Utilities Directory
`;

for (const cat of categoriesWithTools) {
  llmsContent += `\n### ${cat.name}\n`;
  for (const varName of cat.tools) {
    const tool = toolDetailMap.get(varName);
    if (tool) {
      llmsContent += `- [${tool.title}](${BASE_URL}${tool.path}): ${tool.description}\n`;
    }
  }
}

llmsContent += `\n## Legal & Information
- [About Us & Editorial Standards](${BASE_URL}/about): Mission, technical advisory board, and RFC standards.
- [Privacy Policy](${BASE_URL}/privacy-policy): Guaranteed zero server logging and local data processing.
- [Terms of Service](${BASE_URL}/terms-of-service): Free open-source usage terms.
- [Contact Support](${BASE_URL}/contact): Bug reporting and tool suggestions.
`;

const llmsPath = path.join(publicDir, 'llms.txt');
fs.writeFileSync(llmsPath, llmsContent.trim() + '\n', 'utf8');
console.log(`[SEO Generator] Successfully generated ${llmsPath}`);

// 6. Generate llms-full.txt
let llmsFullContent = llmsContent + `\n## Technical Architecture & Tool Guides\n`;
llmsFullContent += `Each utility operates as an independent client-side module adhering to official RFC and IEEE standards (e.g., RFC 7519 for JWT, RFC 4648 for Base64, RFC 4122 for UUID, RFC 6238 for TOTP/HOTP, and FIPS PUB 180-4 for SHA Cryptography).\n`;

const llmsFullPath = path.join(publicDir, 'llms-full.txt');
fs.writeFileSync(llmsFullPath, llmsFullContent.trim() + '\n', 'utf8');
console.log(`[SEO Generator] Successfully generated ${llmsFullPath}`);

// 7. Generate .well-known/ai-catalog.json (Lighthouse 13.4.0 Agentic Browsing & WebMCP Standard)
const wellKnownDir = path.join(publicDir, '.well-known');
if (!fs.existsSync(wellKnownDir)) {
  fs.mkdirSync(wellKnownDir, { recursive: true });
}

const aiCatalog = {
  schema_version: '2026-10',
  name_for_human: 'DevTol — Free Client-Side Developer Utilities',
  name_for_model: 'devtol_developer_tools',
  description_for_model: 'Comprehensive suite of 126+ free, 100% client-side developer, cryptography, PDF, network, and data conversion utilities running locally in the browser with zero server data transmission.',
  base_url: BASE_URL,
  agentic_browsing: {
    llms_txt: `${BASE_URL}/llms.txt`,
    llms_full_txt: `${BASE_URL}/llms-full.txt`,
    sitemap_xml: `${BASE_URL}/sitemap.xml`,
    privacy_guarantee: '100% client-side execution; zero telemetry or server payload storage.',
  },
  categories: categoriesWithTools.map(cat => ({
    category: cat.name,
    tools: cat.tools
      .map(varName => toolDetailMap.get(varName))
      .filter(Boolean)
      .map(t => ({
        id: t.slug,
        title: t.title,
        url: `${BASE_URL}${t.path}`,
        description: t.description,
      })),
  })),
};

const aiCatalogPath = path.join(wellKnownDir, 'ai-catalog.json');
fs.writeFileSync(aiCatalogPath, JSON.stringify(aiCatalog, null, 2) + '\n', 'utf8');
console.log(`[SEO Generator] Successfully generated ${aiCatalogPath}`);

console.log('[SEO Generator] All SEO assets generated successfully!');
