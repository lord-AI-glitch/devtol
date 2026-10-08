import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const keyPath = path.join(rootDir, 'service_account.json');
if (!fs.existsSync(keyPath)) {
  console.error('service_account.json not found!');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claimSet = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const unsigned = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(claimSet))}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsigned);
  const signature = signer
    .sign(serviceAccount.private_key, 'base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const jwt = `${unsigned}.${signature}`;
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
            resolve(data.access_token);
          } catch (e) {
            reject(e);
          }
        });
      }
    );
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function getUrlMetadata(token, url) {
  return new Promise(resolve => {
    const req = https.request(
      {
        hostname: 'indexing.googleapis.com',
        path: `/v3/urlNotifications/metadata?url=${encodeURIComponent(url)}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      res => {
        let body = '';
        res.on('data', chunk => (body += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch {
            resolve({ status: res.statusCode, body });
          }
        });
      }
    );
    req.on('error', err => resolve({ error: err.message }));
    req.end();
  });
}

async function main() {
  console.log('====================================================');
  console.log('  Google Indexing API — Querying Live Server Metadata');
  console.log('====================================================\n');

  const token = await getAccessToken();
  console.log('✓ Obtained OAuth2 token from Google.');
  console.log('Querying Google\'s official notification log for DevTol URLs...\n');

  const testUrls = [
    'https://devtol.online/',
    'https://devtol.online/ar',
    'https://devtol.online/pdf-tools',
    'https://devtol.online/ar/pdf-tools',
    'https://devtol.online/pdf-editor',
    'https://devtol.online/compress-pdf/100kb',
    'https://devtol.online/merge-pdf/combine-two-pdfs',
  ];

  for (const url of testUrls) {
    const res = await getUrlMetadata(token, url);
    if (res.status === 200 && res.data?.latestUpdate) {
      console.log(`[URL]: ${url}`);
      console.log(`  └─ Type: ${res.data.latestUpdate.type}`);
      console.log(`  └─ Timestamp recorded by Google: ${res.data.latestUpdate.notifyTime}`);
      console.log('----------------------------------------------------');
    } else {
      console.log(`[URL]: ${url} -> HTTP ${res.status}:`, JSON.stringify(res.data || res.body));
    }
  }
}

main().catch(console.error);
