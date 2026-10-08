import fs from 'fs';
import https from 'https';

const HOST = 'devtol.online';
const KEY = '63ceff34c1ae6ac3262b428c60f2aadd';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const SITEMAP_PATH = fs.existsSync('./public/sitemap.xml') 
  ? './public/sitemap.xml' 
  : './dist/sitemap.xml';

if (!fs.existsSync(SITEMAP_PATH)) {
  console.error('[IndexNow] Error: sitemap.xml not found in public/ or dist/.');
  process.exit(1);
}

const sitemapContent = fs.readFileSync(SITEMAP_PATH, 'utf8');
const locRegex = /<loc>(https:\/\/[^<]+)<\/loc>/g;
const urlList = [];
let match;
while ((match = locRegex.exec(sitemapContent)) !== null) {
  urlList.push(match[1]);
}

console.log(`[IndexNow] Found ${urlList.length} URLs to submit to Bing / IndexNow...`);

const payload = JSON.stringify({
  host: HOST,
  key: KEY,
  keyLocation: KEY_LOCATION,
  urlList: urlList,
});

async function submitToEndpoint(hostname, path) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      res => {
        let body = '';
        res.on('data', chunk => (body += chunk));
        res.on('end', () => {
          resolve({ status: res.statusCode, body });
        });
      }
    );

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function main() {
  const endpoints = [
    { name: 'Bing IndexNow', host: 'www.bing.com', path: '/indexnow' },
    { name: 'Global IndexNow Engine', host: 'api.indexnow.org', path: '/indexnow' },
  ];

  for (const ep of endpoints) {
    try {
      console.log(`[IndexNow] Submitting to ${ep.name} (${ep.host})...`);
      const res = await submitToEndpoint(ep.host, ep.path);
      console.log(`[IndexNow] ${ep.name} Response: HTTP ${res.status} (${res.status === 200 || res.status === 202 ? 'Success / Accepted' : res.body || 'Error'})`);
    } catch (err) {
      console.error(`[IndexNow] Failed submitting to ${ep.name}:`, err.message);
    }
  }
}

main();
