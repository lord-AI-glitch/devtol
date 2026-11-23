# DevTol Official Browser Extension (Manifest V3)

> Fast, secure, and 100% offline-ready developer utilities suite for Google Chrome, Microsoft Edge, and Brave.

---

## Features
- **Instant Search Across 122 Tools**: Fuzzy search with deep links directly opening tools on `https://devtol.online`.
- **5 Built-in Offline Micro-Tools**:
  - **JSON Prettifier & Minifier**: Format (2 or 4 spaces) and minify JSON with one-click clipboard copy.
  - **Password & Token Generator**: Cryptographically secure random tokens (8–64 length) with entropy calculation.
  - **Base64 String Converter**: UTF-8 safe encode and decode.
  - **AI Token Cost Calculator**: Opens the full calculator on devtol.online — prices are maintained there, so the extension never shows stale rates.
  - **Unix Epoch Converter**: Live ticking Unix timestamp with ISO-8601 UTC and local time conversion.
- **Dark / Light Mode**: Automatically matches system preference and persists user choice.
- **Privacy-First**: Zero tracking, zero remote scripts, zero invasive host permissions (`storage` only).

---

## How to Test Locally (Chrome / Edge / Brave)

1. Open your browser and navigate to:
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
   - Brave: `brave://extensions`
2. Toggle **Developer mode** (وضع مطور البرامج) in the top-right corner.
3. Click **Load unpacked** (تحميل حزمة غير مضغوطة).
4. Select the directory:
   ```
   dist-extension/
   ```
5. Pin the **DevTol** icon to your browser toolbar and click to use!

---

## How to Publish to Web Stores

### Google Chrome Web Store
1. Visit the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).
2. Click **New Item** (عنصر جديد).
3. Upload the pre-built ZIP archive:
   ```
   dist-extension/devtol-chrome-extension.zip
   ```
4. Fill in standard store metadata (Category: `Developer Tools`, Language: `English / Arabic`).
5. Submit for review (Manifest V3 without host permissions typically passes review in < 24 hours).

### Microsoft Edge Add-ons
1. Visit the [Microsoft Partner Center](https://partner.microsoft.com/dashboard/microsoftedge).
2. Click **Create new extension** and upload the same `devtol-chrome-extension.zip`.
3. Submit for Edge certification.
