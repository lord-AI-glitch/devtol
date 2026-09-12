import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import YAML from 'yaml';
import MarkdownIt from 'markdown-it';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

const BASE_URL = process.env.SITE_URL || 'https://devtool-it.pages.dev';

console.log('[SEO Prerender] Starting static HTML generation for all routes...');

if (!fs.existsSync(distDir)) {
  console.error('[SEO Prerender] Error: dist/ directory does not exist. Run vite build first.');
  process.exit(1);
}

const templateIndexPath = path.join(distDir, 'index.html');
if (!fs.existsSync(templateIndexPath)) {
  console.error('[SEO Prerender] Error: dist/index.html not found.');
  process.exit(1);
}

const baseHtmlTemplate = fs.readFileSync(templateIndexPath, 'utf8');

// Initialize markdown renderer
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

// Load English locale for titles and descriptions
const enLocalePath = path.join(rootDir, 'locales', 'en.yml');
let enLocale = { tools: {} };
if (fs.existsSync(enLocalePath)) {
  try {
    enLocale = YAML.parse(fs.readFileSync(enLocalePath, 'utf8')) || { tools: {} };
  } catch (err) {
    console.warn('[SEO Prerender] Warning: Could not parse locales/en.yml', err.message);
  }
}

// Parse tools from src/tools/index.ts
const toolsIndexPath = path.join(rootDir, 'src', 'tools', 'index.ts');
const toolsIndexContent = fs.readFileSync(toolsIndexPath, 'utf8');

const importRegex = /import\s+\{\s*tool\s+as\s+(\w+)\s*\}\s+from\s+['"](\.\/[^'"]+)['"]/g;
const importedModules = new Map();
let importMatch;
while ((importMatch = importRegex.exec(toolsIndexContent)) !== null) {
  importedModules.set(importMatch[1], importMatch[2]);
}

const categorySection = toolsIndexContent.substring(toolsIndexContent.indexOf('export const toolsByCategory'));
const toolTokenRegex = /\b([a-zA-Z0-9_]+)\b/g;
const registeredToolVars = new Set();
let tokenMatch;
while ((tokenMatch = toolTokenRegex.exec(categorySection)) !== null) {
  if (importedModules.has(tokenMatch[1])) {
    registeredToolVars.add(tokenMatch[1]);
  }
}

console.log(`[SEO Prerender] Found ${registeredToolVars.size} tools to prerender.`);

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function generatePrerenderedHtml({ pathSlug, title, description, keywords, articleHtml, category }) {
  const canonicalUrl = `${BASE_URL}/${pathSlug}`;
  const fullTitle = `${title} Online (Free & Fast) - DevTool.it`;
  const fullDesc = `${description}. 100% client-side, free, fast, and secure online developer tool on DevTool.it.`;
  const keywordStr = Array.from(new Set([...(keywords || []), title.toLowerCase(), 'free online tool', 'client side', 'developer utility', 'devtool.it'])).join(', ');

  const schemaJson = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        '@id': `${canonicalUrl}#webapp`,
        'url': canonicalUrl,
        'name': `${title} Online`,
        'applicationCategory': category || 'DeveloperApplication',
        'operatingSystem': 'All',
        'browserRequirements': 'Requires JavaScript. Requires HTML5.',
        'description': fullDesc,
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD',
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonicalUrl}#breadcrumb`,
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': BASE_URL,
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': title,
            'item': canonicalUrl,
          },
        ],
      },
    ],
  });

  let html = baseHtmlTemplate;

  // Replace <title>
  html = html.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(fullTitle)}</title>`);

  // Replace meta name="description"
  html = html.replace(/<meta\s+name="description"\s+content=".*?"\s*\/?>/i, `<meta name="description" content="${escapeHtml(fullDesc)}" />`);
  html = html.replace(/<meta\s+itemprop="description"\s+content=".*?"\s*\/?>/i, `<meta itemprop="description" content="${escapeHtml(fullDesc)}" />`);
  html = html.replace(/<meta\s+itemprop="name"\s+content=".*?"\s*\/?>/i, `<meta itemprop="name" content="${escapeHtml(fullTitle)}" />`);

  // Replace Canonical
  html = html.replace(/<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i, `<link rel="canonical" href="${canonicalUrl}" />`);

  // Replace OpenGraph
  html = html.replace(/<meta\s+property="og:title"\s+content=".*?"\s*\/?>/i, `<meta property="og:title" content="${escapeHtml(fullTitle)}" />`);
  html = html.replace(/<meta\s+property="og:description"\s+content=".*?"\s*\/?>/i, `<meta property="og:description" content="${escapeHtml(fullDesc)}" />`);
  html = html.replace(/<meta\s+property="og:url"\s+content=".*?"\s*\/?>/i, `<meta property="og:url" content="${canonicalUrl}" />`);

  // Replace Twitter
  html = html.replace(/<meta\s+name="twitter:title"\s+content=".*?"\s*\/?>/i, `<meta name="twitter:title" content="${escapeHtml(fullTitle)}" />`);
  html = html.replace(/<meta\s+name="twitter:description"\s+content=".*?"\s*\/?>/i, `<meta name="twitter:description" content="${escapeHtml(fullDesc)}" />`);

  // Inject dynamic tool JSON-LD schema into head
  const schemaScriptTag = `\n    <!-- Dynamic Tool Schema.org Structured Data -->\n    <script type="application/ld+json">\n    ${schemaJson}\n    </script>\n  </head>`;
  html = html.replace('</head>', schemaScriptTag);

  // Inject rich semantic content inside <div id="app"></div>
  const preRenderedContent = `
    <div id="app">
      <main class="seo-prerender-container" style="max-width: 900px; margin: 0 auto; padding: 40px 20px; font-family: system-ui, -apple-system, sans-serif; color: #1e293b;">
        <header style="margin-bottom: 24px; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px;">
          <h1 style="font-size: 2.25rem; font-weight: 800; color: #0f172a; margin: 0 0 8px 0;">${escapeHtml(title)}</h1>
          <p style="font-size: 1.125rem; color: #475569; margin: 0; line-height: 1.5;">${escapeHtml(description)}</p>
        </header>
        ${articleHtml ? `<section class="tool-guide" style="margin-top: 24px; line-height: 1.7;">${articleHtml}</section>` : ''}
      </main>
    </div>`;

  html = html.replace('<div id="app"></div>', preRenderedContent.trim());

  return html;
}

let generatedCount = 0;

for (const varName of registeredToolVars) {
  const relImport = importedModules.get(varName);
  let toolFilePath = path.join(rootDir, 'src', 'tools', relImport.replace('./', ''), 'index.ts');
  if (!fs.existsSync(toolFilePath)) {
    toolFilePath = path.join(rootDir, 'src', 'tools', `${relImport.replace('./', '')}.ts`);
  }

  if (fs.existsSync(toolFilePath)) {
    const fileContent = fs.readFileSync(toolFilePath, 'utf8');
    const pathMatch = fileContent.match(/path:\s*['"]([^'"]+)['"]/);
    if (!pathMatch) continue;

    const rawPath = pathMatch[1].replace(/^\//, '');
    const toolSlug = rawPath;

    const localeEntry = (enLocale.tools && enLocale.tools[toolSlug]) || {};
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
      title = toolSlug
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }
    if (!description) {
      description = `Free online ${title} utility. Fast, client-side, and private.`;
    }

    const keywordsMatch = fileContent.match(/keywords:\s*\[([\s\S]*?)\]/);
    let keywords = [];
    if (keywordsMatch) {
      keywords = keywordsMatch[1]
        .split(',')
        .map(k => k.replace(/['"\s]/g, ''))
        .filter(Boolean);
    }

    const articlePath = path.join(rootDir, 'src', 'content', 'tools', `${toolSlug}.md`);
    let articleHtml = '';
    if (fs.existsSync(articlePath)) {
      const rawMd = fs.readFileSync(articlePath, 'utf8');
      articleHtml = md.render(rawMd);
    }

    const toolHtml = generatePrerenderedHtml({
      pathSlug: toolSlug,
      title,
      description,
      keywords,
      articleHtml,
      category: 'DeveloperApplication',
    });

    const targetDir = path.join(distDir, toolSlug);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    fs.writeFileSync(path.join(targetDir, 'index.html'), toolHtml, 'utf8');
    generatedCount++;
  }
}

const legalPages = [
  {
    slug: 'about',
    title: 'About Us & Editorial Standards',
    description: 'Learn about the engineering team, mission, privacy-first client-side architecture, and E-E-A-T editorial standards behind DevTool.it.',
  },
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy & Local Data Processing',
    description: 'Read the privacy policy of DevTool.it. 100% client-side computing guarantees zero transmission or logging of user data.',
  },
  {
    slug: 'terms-of-service',
    title: 'Terms of Service',
    description: 'Terms of service and acceptable usage guidelines for DevTool.it open-source developer utilities.',
  },
  {
    slug: 'contact',
    title: 'Contact Us & Technical Support',
    description: 'Get in touch with DevTool.it team for feature suggestions, tool contributions, or technical bug reports.',
  },
  {
    slug: 'disclaimer',
    title: 'Disclaimer & RFC Compliance',
    description: 'Disclaimer regarding algorithmic calculations, cryptography tools, and developer utilities on DevTool.it.',
  },
];

for (const page of legalPages) {
  const pageHtml = generatePrerenderedHtml({
    pathSlug: page.slug,
    title: page.title,
    description: page.description,
    keywords: ['about', 'privacy', 'terms', 'contact', 'disclaimer', 'devtool.it'],
    articleHtml: '',
    category: 'InformationPage',
  });

  const pageDir = path.join(distDir, page.slug);
  if (!fs.existsSync(pageDir)) {
    fs.mkdirSync(pageDir, { recursive: true });
  }
  fs.writeFileSync(path.join(pageDir, 'index.html'), pageHtml, 'utf8');
  generatedCount++;
}

console.log(`[SEO Prerender] Successfully generated ${generatedCount} static HTML pages in dist/!`);
