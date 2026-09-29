# DevTol Web Utilities Suite — Agent Directives

## Workspace
This project is located at: `E:\مشاريع مهمه\devtol`

## Overview
Developer and designer productivity web suite hosting 126+ client-side tools (`https://devtol.online`).
- Stack: Vue 3, Vite, TypeScript, TailwindCSS
- Deployment: Cloudflare Pages (`devtol.pages.dev`)

## CRITICAL DIRECTIVE: ADSENSE AUDIT IN PROGRESS
- **DO NOT MODIFY** `ads.txt`, header analytics/AdSense scripts, legal pages (`/privacy-policy`, `/terms-of-service`, `/about-us`, `/contact-us`, `/disclaimer`), or site metadata.
- Google AdSense review is actively running for publisher `pub-3672531286921744`.
- Strict read-only mode for advertising and legal configurations.

## Multi-Language Routing & Localization
- When resolving tool keys or loading markdown guides from routes, always strip the language prefix:
  `path.replace(/^\/(?:ar|de|es|fr|it|ja|pt|ru|uk|vi|zh)(?:\/|$)/, '/')`
- Ensure all new tools are defined in BOTH `locales/en.yml` and `locales/ar.yml`.

## Vite Build & Memory Budget
- Always run production builds with expanded heap allocation on Windows:
  `npx cross-env NODE_OPTIONS=--max_old_space_size=6144 vite build`
- Post-build step must include `node scripts/prerender-seo-pages.js` to generate static prerendered HTML with inlined critical CSS across all 10 supported locales.

## SEO, Robots & Crawlers
- Run `node scripts/generate-seo.js` to update `public/sitemap.xml` (multilingual xhtml:link), `public/robots.txt`, and `public/llms.txt`.
- AI crawlers (`GPTBot`, `ChatGPT-User`, `ClaudeBot`, `anthropic-ai`, `PerplexityBot`, `Google-Extended`, `Applebot-Extended`, `Bytespider`, `Amazonbot`) must remain explicitly permitted in `robots.txt` for GEO.