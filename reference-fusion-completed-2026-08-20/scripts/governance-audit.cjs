const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const fail = (message) => {
  console.error(`[governance] FAIL: ${message}`);
  process.exitCode = 1;
};

const governance = read('docs/PROJECT_GOVERNANCE.md');
const roadmap = read('docs/ULTRA_MASTER_PLAN.md');
const packageJson = JSON.parse(read('package.json'));
const packager = read('scripts/package-release.cjs');

for (const marker of [
  'Source-of-truth precedence',
  'Effort semantics',
  'Migration-risk semantics',
  'Acceptance-criteria template',
  'Save-sensitive rollback requirements',
  'Production-only verification checklist',
  'npm run package:release',
]) {
  if (!governance.includes(marker)) fail(`PROJECT_GOVERNANCE.md missing contract: ${marker}`);
}

if (!roadmap.startsWith('# ULTRA MASTER PLAN')) fail('ULTRA_MASTER_PLAN.md is not identifiable as the active roadmap');

for (const legacy of ['PLAN.md', 'PLAN_RPG_EXPANSION.md', 'CHECKLIST.md', 'CHECKLIST_RPG_EXPANSION.md']) {
  const text = read(legacy);
  if (!text.includes('HISTORICAL — NOT THE ACTIVE ROADMAP.')) fail(`${legacy} is missing the historical-roadmap banner`);
  if (!text.includes('docs/ULTRA_MASTER_PLAN.md')) fail(`${legacy} does not point readers to the active roadmap`);
}

if (packageJson.scripts?.['package:release'] !== 'node scripts/package-release.cjs') {
  fail('package:release npm command is missing or redirected');
}
if (!packager.includes("path.join(rootDir, 'dist')")) fail('release packager is not rooted in dist/');
if (!packager.includes('release-safety-audit.cjs')) fail('release packager does not rerun artifact safety');
if (/docs\/|tests\/|src\//.test(packager)) fail('release packager references non-dist source/dev payloads');

if (!process.exitCode) {
  console.log('[governance] PASS: active-roadmap precedence, historical banners, risk/rollback evidence rules and safe release packaging contract verified.');
}
