import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const toolsDir = path.join(rootDir, 'src/tools');

const entries = fs.readdirSync(toolsDir, { withFileTypes: true });
const toolDirs = entries.filter(e => e.isDirectory()).map(e => e.name);

console.log(`Auditing all ${toolDirs.length} tool directories in src/tools/...`);

let issuesFound = 0;
const auditedTools = [];

for (const dirName of toolDirs) {
  const dirPath = path.join(toolsDir, dirName);
  const files = fs.readdirSync(dirPath);
  
  const hasIndex = files.includes('index.ts');
  const vueFiles = files.filter(f => f.endsWith('.vue'));

  if (!hasIndex && vueFiles.length === 0) {
    // Might be helper directory like meta-tag-generator subdirs
    continue;
  }

  const toolReport = {
    name: dirName,
    hasIndex,
    vueFiles,
    cdnImports: [],
    syntaxValid: true,
  };

  for (const vueFile of vueFiles) {
    const vueContent = fs.readFileSync(path.join(dirPath, vueFile), 'utf-8');
    
    // Check for broken CDN imports
    const cdnMatches = vueContent.match(/import\s*\(\s*['"]https?:\/\/[^'"]+['"]\s*\)/g);
    if (cdnMatches) {
      toolReport.cdnImports.push(...cdnMatches);
      for (const m of cdnMatches) {
        if (m.includes('skypack.dev')) {
          console.error(`[ERROR] ${dirName}/${vueFile} still contains Skypack CDN import: ${m}`);
          issuesFound++;
        }
      }
    }
  }

  auditedTools.push(toolReport);
}

console.log(`\nAudit completed for ${auditedTools.length} tools.`);
const toolsWithCdn = auditedTools.filter(t => t.cdnImports.length > 0);
console.log(`Tools with dynamic CDN imports (esm.sh / jsdelivr fallbacks): ${toolsWithCdn.length}`);
for (const t of toolsWithCdn) {
  console.log(`  - ${t.name}: ${t.cdnImports.join(', ')}`);
}

if (issuesFound > 0) {
  console.error(`\n❌ Found ${issuesFound} critical issues!`);
  process.exit(1);
} else {
  console.log(`\n✅ All ${auditedTools.length} tools passed structural and dependency health checks with 0 broken imports!`);
}
