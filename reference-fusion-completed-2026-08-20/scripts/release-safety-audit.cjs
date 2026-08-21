#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const distDir = path.join(root, 'dist');

const forbidden = [
  { label: 'visible balance dev overlay', pattern: /BALANCE DEV/i },
  { label: 'generic cheats marker', pattern: /CHEATS/i },
  { label: 'forced rank cheat', pattern: /Force Next Rank/i },
  { label: 'currency cheat', pattern: /\+10K Gold/i },
  { label: 'spawn debug control', pattern: /Spawn Spirit/i },
  { label: 'test-ad control', pattern: /Test Ad/i },
  { label: 'save-disable test hook', pattern: /__DISABLE_SAVE__/ },
];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return [full];
  });
}

if (!fs.existsSync(distDir)) {
  console.error('[release-safety] dist/ is missing. Run npm run build first.');
  process.exit(2);
}

const files = walk(distDir).filter((file) => /\.(?:js|html|css)$/i.test(file));
const hits = [];
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  for (const rule of forbidden) {
    if (rule.pattern.test(text)) {
      hits.push(`${path.relative(root, file)}: ${rule.label}`);
    }
  }
}

if (hits.length) {
  console.error('[release-safety] FAILED: production artifacts contain debug/test surfaces:');
  for (const hit of hits) console.error(`  - ${hit}`);
  process.exit(1);
}

console.log(`[release-safety] PASS: scanned ${files.length} production files; no forbidden debug markers found.`);
