# Project State & Zero-Token Checkpoint
- **Project:** DevTool.it Web Platform (Vite + Vue 3 + UnoCSS)
- **Status:** Complete Enterprise SEO & GEO Overhaul Implemented. Build and 144 unit tests passing 100% clean ✅.
- **Canonical Domain:** `https://devtool.it.com` (Live on Cloudflare Pages)

## SEO & Organic Traffic Powerhouse Architecture (2026-09-12):
1. **Static HTML Prerendering for 100% of Routes (`dist/**/index.html`):**
   - Automated post-build engine (`scripts/prerender-seo-pages.js`) creates static HTML for all 120 tools and 5 legal/about pages.
   - Fixes the traditional SPA crawlability deficit: Googlebot, Bingbot, Yandex, DuckDuckGo, and social bots receive complete static HTML with zero JS execution delays.
   - Pre-rendered static `<div id="app">` includes semantic `<h1>`, `<p>`, and full markdown educational guides with `<h2>`, `<h3>`, and code snippets for instant indexing.
2. **Dynamic Client-Side Metadata & High-CTR Meta Tags (`src/layouts/tool.layout.vue`):**
   - Injected search-optimized titles: `${toolTitle} Online (Free & Fast) - DevTool.it`.
   - Distinct, absolute `canonical` tags per tool route (`https://devtool.it.com${route.path}`) preventing root duplicate canonicalization issues.
   - Comprehensive OpenGraph and Twitter Card tags with large image preview banners.
3. **Dual Structured Data / Schema.org JSON-LD:**
   - Universal `WebSite` Knowledge Graph + SearchAction.
   - Per-tool `WebApplication` schema specifying $0 Free Offer, OperatingSystem: All, and feature capabilities.
   - `BreadcrumbList` schema linking Home -> Category -> Tool for Google SERP breadcrumb display.
4. **Generative Engine Optimization (GEO) & AI Crawlers:**
   - Generated `public/llms.txt` and `public/llms-full.txt` (conforming to llmstxt.org) cataloging all 120+ utilities for ChatGPT Search, Perplexity, Claude, and Gemini.
   - Declared `llms.txt` in `robots.txt` and configured Cloudflare cache headers (`public/_headers`).
5. **XML Sitemap & Robots Directives:**
   - `public/sitemap.xml` with all 126 canonical URLs, `<lastmod>`, `<changefreq>`, and `<priority>`.
   - `public/robots.txt` explicitly welcoming Googlebot, Bingbot, Applebot, GPTBot, Claude-Web, ClaudeBot, PerplexityBot, and Cohere-ai.
6. **E-E-A-T Quality Signals & Bug Fixes:**
   - Fixed emoji character encoding corruptions in `AboutUs.vue` to ensure pristine quality signals.
   - Pipeline integrated: `npm run build` triggers `prebuild` (sitemap/robots/llms) -> `build` (Vite) -> `postbuild` (static prerender).

- **Build & Test Verification:**
  - `pnpm test:unit`: 36 test suites, 144 unit tests passing (0 failures).
  - `pnpm run build`: Exit code 0, 125 static HTML routes prerendered in `dist/`.
- **Knowledge Graph:** Synchronized with Graphify (`python -m graphify update .`).
