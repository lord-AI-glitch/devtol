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

console.log('[SEO Generator] All SEO assets generated successfully!');
