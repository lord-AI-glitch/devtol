import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import YAML from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const BASE_URL = process.env.SITE_URL || 'https://devtool.it.com';

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
  { path: '/', priority: '1.0', changefreq: 'daily', title: 'Home - Developer Tools Suite' },
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
      if (literalNameMatch) {
        title = literalNameMatch[1];
      }

      const literalDescMatch = fileContent.match(/description:\s*['"]([^'"]+)['"]/);
      if (literalDescMatch) {
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

// Combine all routes
const allRoutes = [...staticRoutes, ...toolRoutes];
const uniqueRoutes = Array.from(new Map(allRoutes.map(item => [item.path, item])).values());
console.log(`[SEO Generator] Total unique URLs to index in sitemap: ${uniqueRoutes.length}`);

const publicDir = path.join(rootDir, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 3. Generate sitemap.xml
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${uniqueRoutes
  .map(
    route => `  <url>
    <loc>${BASE_URL}${route.path}</loc>
    <lastmod>${route.lastmod || today}</lastmod>
    <changefreq>${route.changefreq || 'weekly'}</changefreq>
    <priority>${route.priority || '0.8'}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`;

const sitemapPath = path.join(publicDir, 'sitemap.xml');
fs.writeFileSync(sitemapPath, sitemapXml.trim() + '\n', 'utf8');
console.log(`[SEO Generator] Successfully generated ${sitemapPath}`);

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

User-agent: Claude-Web
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: CCBot
Allow: /

User-agent: Cohere-ai
Allow: /

User-agent: meta-externalagent
Allow: /

# Host & Sitemaps
Host: ${BASE_URL}
Sitemap: ${BASE_URL}/sitemap.xml

# LLMs Discovery Specification (https://llmstxt.org/)
llms.txt: ${BASE_URL}/llms.txt
llms-full.txt: ${BASE_URL}/llms-full.txt
`;

const robotsPath = path.join(publicDir, 'robots.txt');
fs.writeFileSync(robotsPath, robotsTxt, 'utf8');
console.log(`[SEO Generator] Successfully generated ${robotsPath}`);

// 5. Generate llms.txt (GEO standard)
const toolDetailMap = new Map(toolDetails.map(t => [t.varName, t]));

let llmsContent = `# DevTool.it

> DevTool.it is a free, open-source, client-side developer utility platform featuring 120+ tools across PDF processing, cryptography, image editing, data converters, network utilities, and text formatting. All operations run 100% locally inside the browser sandbox with zero server data transmission.

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
