import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Potential local file locations for service account credentials
const POSSIBLE_KEY_FILES = [
  'service_account.json',
  'service-account.json',
  'google-key.json',
  'credentials.json',
];

function getServiceAccount() {
  // 1. Check Environment Variables (Standard CI/CD / GitHub Secrets)
  const envCandidates = [
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
    process.env.GOOGLE_CREDENTIALS,
  ];

  for (const envVal of envCandidates) {
    if (!envVal || typeof envVal !== 'string') continue;
    const trimmed = envVal.trim();
    if (!trimmed) continue;

    // Check if it's direct JSON string
    if (trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed.client_email && parsed.private_key) {
          return { source: 'ENV (Direct JSON)', data: parsed };
        }
      } catch {}
    }

    // Check if it's Base64-encoded JSON (common to preserve newlines in CI)
    try {
      const decoded = Buffer.from(trimmed, 'base64').toString('utf8');
      if (decoded.trim().startsWith('{')) {
        const parsed = JSON.parse(decoded);
        if (parsed.client_email && parsed.private_key) {
          return { source: 'ENV (Base64)', data: parsed };
        }
      }
    } catch {}

    // Check if it points to a file path
    if (fs.existsSync(trimmed)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(trimmed, 'utf8'));
        return { source: `ENV Filepath (${trimmed})`, data: parsed };
      } catch {}
    }
  }

  // 2. Check Local Filesystem in Root Directory
  for (const filename of POSSIBLE_KEY_FILES) {
    const fullPath = path.join(rootDir, filename);
    if (fs.existsSync(fullPath)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        return { source: `File (${filename})`, data: parsed };
      } catch (err) {
        console.error(`⚠️ Found key file at ${filename}, but failed to parse JSON: ${err.message}`);
      }
    }
  }

  return null;
}

function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

async function getAccessToken(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

  const claimSet = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedClaim = base64UrlEncode(JSON.stringify(claimSet));
  const unsignedToken = `${encodedHeader}.${encodedClaim}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsignedToken);
  const signature = signer
    .sign(serviceAccount.private_key, 'base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const jwt = `${unsignedToken}.${signature}`;

  // Exchange JWT assertion for access token
  const postData = `grant_type=${encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer')}&assertion=${encodeURIComponent(jwt)}`;

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'oauth2.googleapis.com',
        path: '/token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData),
        },
      },
      res => {
        let body = '';
        res.on('data', chunk => (body += chunk));
        res.on('end', () => {
          try {
            const data = JSON.parse(body);
            if (data.access_token) {
              resolve(data.access_token);
            } else {
              reject(new Error(`Failed to obtain token: ${body}`));
            }
          } catch (e) {
            reject(new Error(`Invalid JSON response from oauth2: ${body}`));
          }
        });
      }
    );

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function publishUrl(accessToken, url, action = 'URL_UPDATED') {
  const payload = JSON.stringify({
    url,
    type: action,
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'indexing.googleapis.com',
        path: '/v3/urlNotifications:publish',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          Authorization: `Bearer ${accessToken}`,
        },
      },
      res => {
        let body = '';
        res.on('data', chunk => (body += chunk));
        res.on('end', () => {
          try {
            const json = JSON.parse(body);
            resolve({ status: res.statusCode, data: json });
          } catch {
            resolve({ status: res.statusCode, body });
          }
        });
      }
    );

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    limit: 50,
    daily: false,
    offset: null,
    urls: [],
  };

  for (const arg of args) {
    if (arg.startsWith('--limit=')) {
      const val = parseInt(arg.replace('--limit=', ''), 10);
      options.limit = Math.min(Math.max(val || 50, 1), 200); // 1-200 quota bounds
    } else if (arg === '--daily' || arg === '--rotate') {
      options.daily = true;
    } else if (arg.startsWith('--offset=')) {
      options.offset = parseInt(arg.replace('--offset=', ''), 10);
    } else if (arg.startsWith('http://') || arg.startsWith('https://')) {
      options.urls.push(arg);
    }
  }

  return options;
}

function getUrlsFromSitemap({ limit, daily, offset }) {
  const sitemapCandidates = [
    path.join(rootDir, 'public', 'sitemap.xml'),
    path.join(rootDir, 'dist', 'sitemap.xml'),
  ];

  let sitemapPath = null;
  for (const candidate of sitemapCandidates) {
    if (fs.existsSync(candidate)) {
      sitemapPath = candidate;
      break;
    }
  }

  if (!sitemapPath) {
    console.error(`[Google Indexing] Error: Sitemap not found in public/ or dist/`);
    return [];
  }

  const content = fs.readFileSync(sitemapPath, 'utf8');
  const locRegex = /<loc>(https:\/\/[^<]+)<\/loc>/g;
  const urls = [];
  let match;
  while ((match = locRegex.exec(content)) !== null) {
    urls.push(match[1]);
  }

  const uniqueUrls = [...new Set(urls)];

  // Define Core Anchor URLs (High value pages that should be refreshed continuously)
  const isAnchorUrl = url => {
    if (url.endsWith('.online/') || url.endsWith('.online/ar')) return true;
    if (url.includes('pdf-tools')) return true;
    if (url.includes('guides')) return true;
    if (url.includes('deals')) return true;
    if (url.includes('compress-pdf') || url.includes('merge-pdf') || url.includes('pdf-editor')) return true;
    return false;
  };

  if (daily) {
    const anchorUrls = uniqueUrls.filter(isAnchorUrl);
    const rotatingPool = uniqueUrls.filter(url => !isAnchorUrl(url));

    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const diff = now - startOfYear;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    const rotatingQuota = Math.max(0, limit - anchorUrls.length);
    const startIdx = typeof offset === 'number' && !isNaN(offset)
      ? offset % rotatingPool.length
      : (dayOfYear * rotatingQuota) % rotatingPool.length;

    const rotatingSlice = [];
    for (let i = 0; i < rotatingQuota; i++) {
      rotatingSlice.push(rotatingPool[(startIdx + i) % rotatingPool.length]);
    }

    const combined = [...anchorUrls, ...rotatingSlice];
    const fullCycleDays = Math.ceil(rotatingPool.length / (rotatingQuota || 1));

    console.log(`\n📅 Daily Dynamic Rotation Activated:`);
    console.log(`   - Day #${dayOfYear} of ${now.getFullYear()}`);
    console.log(`   - Total Sitemap URLs: ${uniqueUrls.length}`);
    console.log(`   - Core Anchor URLs (Always Submitted): ${anchorUrls.length}`);
    console.log(`   - Rotating Pool Size: ${rotatingPool.length}`);
    console.log(`   - Daily Rotating Slice: ${rotatingSlice.length} (Index [${startIdx}..${(startIdx + rotatingSlice.length - 1) % rotatingPool.length}])`);
    console.log(`   - Full Website Rotation Cycle: ~${fullCycleDays} days`);

    return combined;
  }

  // Standard non-daily mode: prioritize and slice top `limit`
  uniqueUrls.sort((a, b) => {
    const priority = url => {
      if (url.endsWith('.online/') || url.endsWith('.online/ar')) return 100;
      if (url.includes('pdf-tools')) return 90;
      if (url.includes('guides')) return 80;
      if (url.includes('compress-pdf') || url.includes('merge-pdf')) return 70;
      return 10;
    };
    return priority(b) - priority(a);
  });

  return uniqueUrls.slice(0, limit);
}

async function writeGitHubSummary({ total, success, failed, serviceAccount, durationMs }) {
  const summaryFile = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryFile) return;

  const markdown = `
### 🚀 Google Indexing API — Daily Automation Summary

| Metric | Value |
| :--- | :--- |
| **Service Account** | \`${serviceAccount.client_email}\` |
| **Project ID** | \`${serviceAccount.project_id}\` |
| **Submitted URLs** | **${total}** |
| **Success (HTTP 200)** | ✅ **${success}** |
| **Failed / Rate Limited** | ${failed > 0 ? `⚠️ ${failed}` : '0'} |
| **Execution Duration** | \`${(durationMs / 1000).toFixed(1)}s\` |
| **Google Daily Quota** | 200 URLs / day |

> *All notified URLs were pushed directly into the real-time Googlebot priority crawl queue.*
`;

  try {
    fs.appendFileSync(summaryFile, markdown, 'utf8');
  } catch (err) {
    console.error('Failed to write GITHUB_STEP_SUMMARY:', err.message);
  }
}

async function main() {
  const startTime = Date.now();
  console.log('====================================================');
  console.log('  Google Indexing API — Professional Push Automation');
  console.log('====================================================\n');

  const credentialInfo = getServiceAccount();
  if (!credentialInfo) {
    console.error('❌ Service Account Credentials NOT found!');
    console.log('\nSupported Credential Locations:');
    console.log('1. Environment Variable: `GOOGLE_SERVICE_ACCOUNT_KEY` (raw JSON or base64)');
    console.log('2. File in project root: `service_account.json`');
    console.log('\nQuick Setup Guide:');
    console.log('  - Local: Place `service_account.json` in project root: E:\\مشاريع مهمه\\devtol\\service_account.json');
    console.log('  - GitHub Actions: Add secret `GOOGLE_SERVICE_ACCOUNT_KEY` in GitHub Repository Settings -> Secrets');
    console.log('  - See docs/GOOGLE_INDEXING_API_GUIDE.md for step-by-step instructions.\n');
    process.exit(1);
  }

  const { source, data: serviceAccount } = credentialInfo;
  console.log(`✓ Loaded Credentials from: ${source}`);
  console.log(`✓ Service Account Email: ${serviceAccount.client_email}`);
  console.log(`✓ Project ID: ${serviceAccount.project_id}`);

  console.log('\nAuthenticating with Google OAuth2 server...');
  let accessToken;
  try {
    accessToken = await getAccessToken(serviceAccount);
    console.log('✓ Successfully authenticated! Bearer token obtained.');
  } catch (err) {
    console.error(`❌ Authentication failed: ${err.message}`);
    process.exit(1);
  }

  const { limit, daily, offset, urls } = parseArgs();
  let targetUrls = urls;
  if (targetUrls.length === 0) {
    targetUrls = getUrlsFromSitemap({ limit, daily, offset });
  }

  console.log(`\nSubmitting ${targetUrls.length} URLs to Google Indexing API (Daily limit: 200)...`);
  console.log('----------------------------------------------------');

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < targetUrls.length; i++) {
    const url = targetUrls[i];
    process.stdout.write(`[${i + 1}/${targetUrls.length}] Submitting: ${url} ... `);

    try {
      const res = await publishUrl(accessToken, url, 'URL_UPDATED');
      if (res.status === 200) {
        console.log(`✅ HTTP 200 (Success)`);
        successCount++;
      } else {
        console.log(`⚠️ HTTP ${res.status}: ${JSON.stringify(res.data || res.body)}`);
        failCount++;
      }
    } catch (err) {
      console.log(`❌ Error: ${err.message}`);
      failCount++;
    }

    // Gentle 100ms throttle between requests
    await new Promise(r => setTimeout(r, 100));
  }

  const durationMs = Date.now() - startTime;
  console.log('\n====================================================');
  console.log(`Google Indexing API Batch Summary:`);
  console.log(`  - Total URLs processed: ${targetUrls.length}`);
  console.log(`  - Successfully notified: ${successCount}`);
  console.log(`  - Failed / Rate limited: ${failCount}`);
  console.log(`  - Time taken: ${(durationMs / 1000).toFixed(1)}s`);
  console.log('====================================================');

  await writeGitHubSummary({
    total: targetUrls.length,
    success: successCount,
    failed: failCount,
    serviceAccount,
    durationMs,
  });
}

main().catch(err => {
  console.error('Fatal Indexing error:', err);
  process.exit(1);
});
