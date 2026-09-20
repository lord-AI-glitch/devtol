import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import YAML from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('====================================================');
console.log('  DevTol Official Extension Builder (Manifest V3)  ');
console.log('====================================================');

// 1. Load English locale for names and descriptions
const enLocalePath = path.join(rootDir, 'locales', 'en.yml');
let enLocale = { tools: {} };
if (fs.existsSync(enLocalePath)) {
  try {
    enLocale = YAML.parse(fs.readFileSync(enLocalePath, 'utf8')) || { tools: {} };
  } catch (err) {
    console.warn('[Extension Builder] Warning: Could not parse locales/en.yml', err.message);
  }
}

// 2. Extract tools from src/tools/index.ts
const toolsIndexPath = path.join(rootDir, 'src', 'tools', 'index.ts');
if (!fs.existsSync(toolsIndexPath)) {
  console.error(`[Extension Builder] Error: src/tools/index.ts not found at ${toolsIndexPath}`);
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

// Parse category section
const categorySection = toolsIndexContent.substring(toolsIndexContent.indexOf('export const toolsByCategory'));
const catMatches = categorySection.match(/name:\s*['"][^'"]+['"][\s\S]*?components:\s*\[[\s\S]*?\]/g) || [];

const toolToCategory = new Map();
for (const chunk of catMatches) {
  const nMatch = chunk.match(/name:\s*['"]([^'"]+)['"]/);
  const cMatch = chunk.match(/components:\s*\[([\s\S]*?)\]/);
  if (nMatch && cMatch) {
    const catName = nMatch[1];
    let tm;
    const r = /\b([a-zA-Z0-9_]+)\b/g;
    while ((tm = r.exec(cMatch[1])) !== null) {
      if (importedModules.has(tm[1])) {
        toolToCategory.set(tm[1], catName);
      }
    }
  }
}

// Extract registered tools
const toolTokenRegex = /\b([a-zA-Z0-9_]+)\b/g;
const registeredToolVars = new Set();
let tokenMatch;
while ((tokenMatch = toolTokenRegex.exec(categorySection)) !== null) {
  if (importedModules.has(tokenMatch[1])) {
    registeredToolVars.add(tokenMatch[1]);
  }
}

const catalog = [];
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

      const localeEntry = (enLocale.tools && enLocale.tools[slug]) || {};
      let title = localeEntry.title;
      let description = localeEntry.description;

      const literalNameMatch = fileContent.match(/name:\s*['"]([^'"]+)['"]/);
      if (literalNameMatch) title = literalNameMatch[1];

      const literalDescMatch = fileContent.match(/description:\s*['"]([^'"]+)['"]/);
      if (literalDescMatch) description = literalDescMatch[1];

      if (!title) {
        title = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      }

      const kwMatch = fileContent.match(/keywords:\s*\[([\s\S]*?)\]/);
      let keywords = [];
      if (kwMatch) {
        keywords = kwMatch[1].match(/['"]([^'"]+)['"]/g)?.map(k => k.replace(/['"]/g, '')) || [];
      }

      catalog.push({
        name: title,
        path: toolPath,
        category: toolToCategory.get(varName) || 'General',
        description: description || '',
        keywords
      });
    }
  }
}

// Sort alphabetically by name
catalog.sort((a, b) => a.name.localeCompare(b.name));

console.log(`[Extension Builder] Extracted ${catalog.length} tools for the extension catalog.`);

// Write tools-catalog.json to extension/popup/
const catalogPath = path.join(rootDir, 'extension', 'popup', 'tools-catalog.json');
fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf8');
console.log(`[Extension Builder] Written catalog to ${catalogPath}`);

// 3. Assemble dist-extension/
const distDir = path.join(rootDir, 'dist-extension');
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Copy manifest
fs.copyFileSync(path.join(rootDir, 'extension', 'manifest.json'), path.join(distDir, 'manifest.json'));

// Copy icons
copyRecursiveSync(path.join(rootDir, 'extension', 'icons'), path.join(distDir, 'icons'));

// Copy popup
copyRecursiveSync(path.join(rootDir, 'extension', 'popup'), path.join(distDir, 'popup'));

console.log(`[Extension Builder] Assembled unpacked extension into: ${distDir}`);

// 4. Create ZIP package for Chrome Web Store & Edge Add-ons
const zipPath = path.join(distDir, 'devtol-chrome-extension.zip');
try {
  // Use PowerShell Compress-Archive on Windows
  const psCmd = `powershell -Command "Compress-Archive -Path '${distDir}/*' -DestinationPath '${zipPath}' -Force"`;
  execSync(psCmd, { stdio: 'inherit' });
  const zipStats = fs.statSync(zipPath);
  console.log(`[Extension Builder] Successfully created ZIP archive: ${(zipStats.size / 1024).toFixed(1)} KB`);
} catch (err) {
  console.warn('[Extension Builder] Warning creating zip file:', err.message);
}

console.log('====================================================');
console.log('  DevTol Browser Extension Build Completed!         ');
console.log(`  Unpacked folder: ${distDir}                       `);
console.log(`  Ready for Chrome Web Store & Edge Add-ons Upload!  `);
console.log('====================================================');
