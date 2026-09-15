# Project State & Zero-Token Checkpoint
- **Project:** DevTol Web Platform (Vite + Vue 3 + UnoCSS)
- **Brand Name:** DevTol
- **Production Domain:** `https://devtol.online` (🟢 LIVE & VERIFIED)
- **Cloudflare Pages Production Project:** `devtol` (`https://devtol.pages.dev`)
- **AdSense Publisher ID:** `ca-pub-3672531286921744`
- **AdSense Verification:** Verified Live (`https://devtol.online/ads.txt` returns `google.com, pub-3672531286921744, DIRECT, f08c47fec0942fa0` with HTTP 200)

## Core Accomplishments & Architecture:
1. **Complete Rebrand to DevTol (100% Repository-Wide Cleaned):**
   - Eliminated every reference to `it-tools`, `DevTool.it`, and old domains across `src/`, `locales/` (all 9 languages), `scripts/`, `README.md`, `public/humans.txt`, and e2e test titles.
   - Branded UI Header: `<span class="brand-dev">Dev</span><span class="brand-tol">Tol</span>` with JetBrains Mono, emerald glow `#34d399`, and updated legal copyright.
   - Updated all legal pages (`AboutUs`, `PrivacyPolicy`, `TermsOfService`, `ContactUs`, `Disclaimer`) to DevTol and `support@devtol.online` / `privacy@devtol.online`.
   - Updated Command Palette, Twitter/X handles (`@devtolonline`), and donation link (`https://buymeacoffee.com/lordrealstx`).
2. **Cloudflare Pages Project `devtol`:**
   - Created new dedicated Cloudflare Pages project named `devtol`.
   - Deployed full production build (445 files including 125 pre-rendered static HTML routes).
   - Live URL: `https://devtol.pages.dev`.
3. **AdSense Compliance & Direct Script Integration:**
   - `ads.txt` deployed and verified live with code 200 at `https://devtol.online/ads.txt`.
   - Official Google AdSense script (`ca-pub-3672531286921744`) placed statically in `<head>` in `index.html` for instant site verification and Auto Ads detection.
   - Workbox PWA configuration updated to exclude `/ads.txt` from cache fallback.
4. **Static HTML Prerendering (125 Static Routes):**
   - Automated postbuild script generates complete static HTML files in `dist/` with high-CTR titles, meta descriptions, canonical URLs (`https://devtol.online`), and full markdown technical guides.
5. **Dual Schema.org Structured Data (JSON-LD) & GEO/AEO:**
   - `WebSite` SearchAction schema + `WebApplication` ($0 Free Offer) + `BreadcrumbList`.
   - Updated `sitemap.xml`, `robots.txt`, `llms.txt`, and `llms-full.txt` for ChatGPT, Perplexity, and Claude under `https://devtol.online`.
6. **IndexNow Instant Indexing:**
   - Submitted all website URLs to Bing & IndexNow.
7. **Graphify Knowledge Graph:**
   - Fully synced locally via `python -m graphify update .` (8,909 nodes, 15,424 edges, 448 communities).

