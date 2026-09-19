import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import YAML from 'yaml';
import MarkdownIt from 'markdown-it';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

const BASE_URL = process.env.SITE_URL || 'https://devtol.online';

console.log('[SEO Prerender] Starting multi-language static HTML generation for all routes...');

if (!fs.existsSync(distDir)) {
  console.error('[SEO Prerender] Error: dist/ directory does not exist. Run vite build first.');
  process.exit(1);
}

const templateIndexPath = path.join(distDir, 'index.html');
if (!fs.existsSync(templateIndexPath)) {
  console.error('[SEO Prerender] Error: dist/index.html not found.');
  process.exit(1);
}

let baseHtmlTemplate = fs.readFileSync(templateIndexPath, 'utf8');

// Inline critical index.css into HTML to eliminate render-blocking CSS requests
const cssMatch = baseHtmlTemplate.match(/<link rel="stylesheet" href="([^"]*\/assets\/index-[^"]+\.css)">/);
if (cssMatch) {
  const cssHref = cssMatch[1];
  const cssFilePath = path.join(distDir, cssHref.replace(/^\//, ''));
  if (fs.existsSync(cssFilePath)) {
    const cssContent = fs.readFileSync(cssFilePath, 'utf8');
    baseHtmlTemplate = baseHtmlTemplate.replace(cssMatch[0], `<style>${cssContent}</style>`);
    fs.writeFileSync(templateIndexPath, baseHtmlTemplate, 'utf8');
    console.log(`[SEO Prerender] Inlined critical CSS (${cssHref}) to eliminate render-blocking resources!`);
  }
}

// Initialize markdown renderer
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

const supportedLangs = ['ar', 'de', 'es', 'fr', 'no', 'pt', 'uk', 'vi', 'zh'];

// Load all locales for titles and descriptions
const allLocales = {};
const allLangCodes = ['en', ...supportedLangs];

for (const lang of allLangCodes) {
  const locPath = path.join(rootDir, 'locales', `${lang}.yml`);
  allLocales[lang] = { tools: {}, home: {} };
  if (fs.existsSync(locPath)) {
    try {
      allLocales[lang] = YAML.parse(fs.readFileSync(locPath, 'utf8')) || { tools: {}, home: {} };
    } catch (err) {
      console.warn(`[SEO Prerender] Warning: Could not parse locales/${lang}.yml:`, err.message);
    }
  }
}

const enLocale = allLocales.en;

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

console.log(`[SEO Prerender] Found ${registeredToolVars.size} tools to prerender across 10 languages.`);

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function extractFaqsFromMarkdown(rawMd) {
  if (!rawMd) return [];
  const faqs = [];
  const regex = /###\s*(?:Q\d+:\s*)?([^\n\?]+\?)\s*\n([\s\S]*?)(?=(?:###|\n---|\n##|\Z))/g;
  let match;
  while ((match = regex.exec(rawMd)) !== null) {
    const q = match[1].trim();
    let a = match[2].trim();
    a = a.replace(/```[\s\S]*?```/g, '').replace(/[*_#`]/g, '').replace(/\s+/g, ' ').trim();
    if (q && a) {
      faqs.push({
        question: q,
        answer: a.slice(0, 450),
      });
    }
  }
  return faqs;
}

function generatePrerenderedHtml({
  pathSlug,
  title,
  description,
  keywords,
  articleHtml,
  category,
  faqs = [],
  relatedTools = [],
  lang = 'en',
}) {
  const isEn = lang === 'en';
  const canonicalUrl = isEn ? `${BASE_URL}/${pathSlug}` : `${BASE_URL}/${lang}/${pathSlug}`;

  // Localized title & description formatting with high CTR hooks
  let fullTitle = `${title} Online (Free & Fast) - DevTol`;
  let fullDesc = `${description}. 100% client-side, free, fast, and secure online developer tool on DevTol.`;

  if (lang === 'ar') {
    fullTitle = `${title} أونلاين مجاناً (سريع ومحلي 100%) - DevTol`;
    fullDesc = `${description}. أداة مطورين مجانية 100% تعمل محلياً داخل المتصفح بأمان وخصوصية تامة على DevTol.`;
  } else if (lang === 'de') {
    fullTitle = `${title} Online Kostenlos (Schnell & Sicher) - DevTol`;
    fullDesc = `${description}. 100% clientseitiges, kostenloses und sicheres Online-Entwicklertool auf DevTol.`;
  } else if (lang === 'es') {
    fullTitle = `${title} Online Gratis (Rápido y Seguro) - DevTol`;
    fullDesc = `${description}. Herramienta online para desarrolladores 100% en el navegador, gratis y segura en DevTol.`;
  } else if (lang === 'fr') {
    fullTitle = `${title} en Ligne Gratuit (Rapide & Sécurisé) - DevTol`;
    fullDesc = `${description}. Outil développeur en ligne 100% côté client, gratuit et sécurisé sur DevTol.`;
  } else if (!isEn) {
    fullTitle = `${title} Online (Free & Private) - DevTol`;
    fullDesc = `${description}. Free, 100% client-side, fast and secure online developer tool on DevTol.`;
  }

  // Generate complete bidirectional hreflang tags
  const hreflangTags = [
    `<link rel="alternate" hreflang="x-default" href="${BASE_URL}/${pathSlug}" />`,
    `<link rel="alternate" hreflang="en" href="${BASE_URL}/${pathSlug}" />`,
    ...supportedLangs.map(l => `<link rel="alternate" hreflang="${l}" href="${BASE_URL}/${l}/${pathSlug}" />`),
  ].join('\n    ');

  const graphNodes = [
    {
      '@type': 'WebApplication',
      '@id': `${canonicalUrl}#webapp`,
      'url': canonicalUrl,
      'name': `${title} Online`,
      'applicationCategory': category || 'DeveloperApplication',
      'operatingSystem': 'All',
      'browserRequirements': 'Requires JavaScript. Requires HTML5.',
      'description': fullDesc,
      'inLanguage': lang,
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
          'name': isEn ? 'Home' : (allLocales[lang]?.home?.home || 'Home'),
          'item': isEn ? BASE_URL : `${BASE_URL}/${lang}`,
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': title,
          'item': canonicalUrl,
        },
      ],
    },
  ];

  if (faqs && faqs.length > 0) {
    graphNodes.push({
      '@type': 'FAQPage',
      '@id': `${canonicalUrl}#faq`,
      'mainEntity': faqs.map(item => ({
        '@type': 'Question',
        'name': item.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': item.answer,
        },
      })),
    });
  }

  const schemaJson = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': graphNodes,
  });

  let html = baseHtmlTemplate;

  // Replace <html lang="...">
  html = html.replace(/<html\s+lang="[^"]*"/i, `<html lang="${lang}"${lang === 'ar' ? ' dir="rtl"' : ' dir="ltr"'}`);

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

  // Inject hreflangs & dynamic tool JSON-LD schema into head
  const headInjection = `\n    <!-- International Hreflang Network -->\n    ${hreflangTags}\n    <!-- Dynamic Tool Schema.org Structured Data -->\n    <script type="application/ld+json">\n    ${schemaJson}\n    </script>\n  </head>`;
  html = html.replace('</head>', headInjection);

  // Related tools navigation for internal link graph & topic clusters
  const relatedHeading = lang === 'ar' ? 'أدوات مطورين ومصممين ذات صلة' : 'Related Online Developer Tools';
  const relatedHtml = (relatedTools && relatedTools.length > 0) ? `
    <nav class="related-tools" style="margin-top: 48px; padding-top: 32px; border-top: 2px solid #e2e8f0;">
      <h3 style="font-size: 1.25rem; font-weight: 700; color: #0f172a; margin: 0 0 16px 0;">${escapeHtml(relatedHeading)}</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px;">
        ${relatedTools.map(rt => `
          <a href="/${rt.slug}" style="display: block; padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; text-decoration: none; color: #0f172a;">
            <strong style="display: block; font-size: 0.875rem; color: #059669;">${escapeHtml(rt.title)}</strong>
            <span style="display: block; font-size: 0.75rem; color: #64748b; margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(rt.description)}</span>
          </a>
        `).join('')}
      </div>
    </nav>
  ` : '';

  // Inject rich semantic content inside <div id="app"></div>
  const preRenderedContent = `
    <div id="app">
      <main class="seo-prerender-container" style="max-width: 900px; margin: 0 auto; padding: 40px 20px; font-family: system-ui, -apple-system, sans-serif; color: #1e293b;">
        <header style="margin-bottom: 24px; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px;">
          <h1 style="font-size: 2.25rem; font-weight: 800; color: #0f172a; margin: 0 0 8px 0;">${escapeHtml(title)}</h1>
          <p style="font-size: 1.125rem; color: #475569; margin: 0; line-height: 1.5;">${escapeHtml(description)}</p>
        </header>
        ${articleHtml ? `<section class="tool-guide" style="margin-top: 24px; line-height: 1.7;">${articleHtml}</section>` : ''}
        ${relatedHtml}
      </main>
    </div>`;

  html = html.replace('<div id="app"></div>', preRenderedContent.trim());

  return html;
}

const toolsList = [];

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
    let faqs = [];
    if (fs.existsSync(articlePath)) {
      const rawMd = fs.readFileSync(articlePath, 'utf8');
      articleHtml = md.render(rawMd);
      faqs = extractFaqsFromMarkdown(rawMd);
    }

    toolsList.push({
      slug: toolSlug,
      title,
      description,
      keywords,
      articleHtml,
      faqs,
    });
  }
}

let generatedCount = 0;
const totalTools = toolsList.length;

// 1. Prerender all tools across all 10 languages
for (let i = 0; i < totalTools; i++) {
  const tool = toolsList[i];
  const relatedTools = [
    toolsList[(i - 2 + totalTools) % totalTools],
    toolsList[(i - 1 + totalTools) % totalTools],
    toolsList[(i + 1) % totalTools],
    toolsList[(i + 2) % totalTools],
  ].map(t => ({ slug: t.slug, title: t.title, description: t.description }));

  // 1A. English (Default)
  const enHtml = generatePrerenderedHtml({
    pathSlug: tool.slug,
    title: tool.title,
    description: tool.description,
    keywords: tool.keywords,
    articleHtml: tool.articleHtml,
    category: 'DeveloperApplication',
    faqs: tool.faqs,
    relatedTools,
    lang: 'en',
  });

  const targetDirEn = path.join(distDir, tool.slug);
  if (!fs.existsSync(targetDirEn)) {
    fs.mkdirSync(targetDirEn, { recursive: true });
  }
  fs.writeFileSync(path.join(targetDirEn, 'index.html'), enHtml, 'utf8');
  generatedCount++;

  // 1B. Localized pages for all supported languages
  for (const lang of supportedLangs) {
    const locDict = allLocales[lang]?.tools?.[tool.slug] || {};
    const locTitle = locDict.title || tool.title;
    const locDesc = locDict.description || tool.description;

    const localizedHtml = generatePrerenderedHtml({
      pathSlug: tool.slug,
      title: locTitle,
      description: locDesc,
      keywords: tool.keywords,
      articleHtml: tool.articleHtml,
      category: 'DeveloperApplication',
      faqs: tool.faqs,
      relatedTools: relatedTools.map(rt => {
        const rtDict = allLocales[lang]?.tools?.[rt.slug] || {};
        return {
          slug: `${lang}/${rt.slug}`,
          title: rtDict.title || rt.title,
          description: rtDict.description || rt.description,
        };
      }),
      lang,
    });

    const targetDirLang = path.join(distDir, lang, tool.slug);
    if (!fs.existsSync(targetDirLang)) {
      fs.mkdirSync(targetDirLang, { recursive: true });
    }
    fs.writeFileSync(path.join(targetDirLang, 'index.html'), localizedHtml, 'utf8');
    generatedCount++;
  }
}

// 2. Prerender localized homepages (dist/ar/index.html, dist/de/index.html, etc.)
for (const lang of supportedLangs) {
  const homeTargetDir = path.join(distDir, lang);
  if (!fs.existsSync(homeTargetDir)) {
    fs.mkdirSync(homeTargetDir, { recursive: true });
  }

  const locHome = allLocales[lang]?.home || {};
  let homeTitle = `DevTol — Free Online Developer Tools Suite`;
  let homeDesc = locHome.subtitle || 'Handy online tools for developers and IT workers. 100% client-side, secure and free.';

  if (lang === 'ar') {
    homeTitle = 'DevTol — منصة أدوات المطورين والمصممين المجانية (تعمل محلياً 100%)';
    homeDesc = 'مجموعة أدوات برمجية وتصميم مجانية تعمل بالكامل في المتصفح مع حماية تامة للخصوصية وبدون رفع أي ملفات.';
  }

  const homeHreflangs = [
    `<link rel="alternate" hreflang="x-default" href="${BASE_URL}/" />`,
    `<link rel="alternate" hreflang="en" href="${BASE_URL}/" />`,
    ...supportedLangs.map(l => `<link rel="alternate" hreflang="${l}" href="${BASE_URL}/${l}" />`),
  ].join('\n    ');

  let homeHtml = baseHtmlTemplate;
  homeHtml = homeHtml.replace(/<html\s+lang="[^"]*"/i, `<html lang="${lang}"${lang === 'ar' ? ' dir="rtl"' : ' dir="ltr"'}`);
  homeHtml = homeHtml.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(homeTitle)}</title>`);
  homeHtml = homeHtml.replace(/<meta\s+name="description"\s+content=".*?"\s*\/?>/i, `<meta name="description" content="${escapeHtml(homeDesc)}" />`);
  homeHtml = homeHtml.replace(/<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i, `<link rel="canonical" href="${BASE_URL}/${lang}" />`);
  homeHtml = homeHtml.replace('</head>', `\n    <!-- International Hreflangs -->\n    ${homeHreflangs}\n  </head>`);

  fs.writeFileSync(path.join(homeTargetDir, 'index.html'), homeHtml, 'utf8');
  generatedCount++;
}

// 3. Update root dist/index.html with home hreflangs
const rootHomeHreflangs = [
  `<link rel="alternate" hreflang="x-default" href="${BASE_URL}/" />`,
  `<link rel="alternate" hreflang="en" href="${BASE_URL}/" />`,
  ...supportedLangs.map(l => `<link rel="alternate" hreflang="${l}" href="${BASE_URL}/${l}" />`),
].join('\n    ');

let rootHomeHtml = fs.readFileSync(templateIndexPath, 'utf8');
if (!rootHomeHtml.includes('hreflang="x-default"')) {
  rootHomeHtml = rootHomeHtml.replace('</head>', `\n    <!-- International Hreflangs -->\n    ${rootHomeHreflangs}\n  </head>`);
  fs.writeFileSync(templateIndexPath, rootHomeHtml, 'utf8');
}

// 4. Prerender Legal pages (English default)
const legalPages = [
  {
    slug: 'about',
    title: 'About Us & Editorial Standards',
    description: 'Learn about the engineering team, mission, privacy-first client-side architecture, and E-E-A-T editorial standards behind DevTol.',
  },
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy & Local Data Processing',
    description: 'Read the privacy policy of DevTol. 100% client-side computing guarantees zero transmission or logging of user data.',
  },
  {
    slug: 'terms-of-service',
    title: 'Terms of Service',
    description: 'Terms of service and acceptable usage guidelines for DevTol open-source developer utilities.',
  },
  {
    slug: 'contact',
    title: 'Contact Us & Technical Support',
    description: 'Get in touch with DevTol team for feature suggestions, tool contributions, or technical bug reports.',
  },
  {
    slug: 'disclaimer',
    title: 'Disclaimer & RFC Compliance',
    description: 'Disclaimer regarding algorithmic calculations, cryptography tools, and developer utilities on DevTol.',
  },
];

for (const page of legalPages) {
  const pageHtml = generatePrerenderedHtml({
    pathSlug: page.slug,
    title: page.title,
    description: page.description,
    keywords: ['about', 'privacy', 'terms', 'contact', 'disclaimer', 'devtol'],
    articleHtml: '',
    category: 'InformationPage',
    lang: 'en',
  });

  const pageDir = path.join(distDir, page.slug);
  if (!fs.existsSync(pageDir)) {
    fs.mkdirSync(pageDir, { recursive: true });
  }
  fs.writeFileSync(path.join(pageDir, 'index.html'), pageHtml, 'utf8');
  generatedCount++;
}

console.log(`[SEO Prerender] Successfully generated ${generatedCount} static HTML pages across 10 languages in dist/!`);
