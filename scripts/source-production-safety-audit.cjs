#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const srcDir = path.join(root, 'src');
const mainPath = path.join(srcDir, 'main.ts');
const platformPath = path.join(srcDir, 'services/platform/YandexGamesService.ts');
const analyticsPath = path.join(srcDir, 'services/analytics/AnalyticsService.ts');

function fail(message) {
  console.error(`[source-safety] FAILED: ${message}`);
  process.exit(1);
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const main = fs.readFileSync(mainPath, 'utf8');
const platform = fs.readFileSync(platformPath, 'utf8');
const analytics = fs.readFileSync(analyticsPath, 'utf8');

if (/^import\s+\{?\s*DevOverlay\b/m.test(main)) {
  fail('main.ts statically imports DevOverlay');
}
if (!/if\s*\(import\.meta\.env\.DEV\)[\s\S]{0,350}await import\('\.\/ui\/components\/DevOverlay'\)/m.test(main)) {
  fail('DevOverlay dynamic import is not visibly guarded by import.meta.env.DEV');
}
if (/window\.ysdk\s*=/.test(platform)) {
  fail('Yandex SDK instance is exposed as mutable window.ysdk');
}

const failClosedMatches = platform.match(/if\s*\(!this\.isReady\(\)\)\s*return false;/g) || [];
if (failClosedMatches.length < 2) {
  fail('fullscreen/rewarded ads are not both fail-closed when Yandex SDK is unavailable');
}
if (!/if\s*\(isDev\)[\s\S]{0,120}return new MockPlatformService\(\);[\s\S]{0,120}return new UnavailablePlatformService\(\);/m.test(platform)) {
  fail('MockPlatformService is not restricted to the explicit DEV factory path');
}
if (!/if\s*\(import\.meta\.env\?\.DEV\)[\s\S]{0,120}console\.log/m.test(analytics)) {
  fail('analytics console telemetry is not DEV-guarded');
}

const sourceFiles = walk(srcDir).filter((file) => /\.(?:ts|tsx)$/.test(file));
const forbiddenRuntimeImports = [];
const suspiciousWindowHooks = [];
for (const file of sourceFiles) {
  const text = fs.readFileSync(file, 'utf8');
  const rel = path.relative(root, file);
  const importRe = /(?:from\s+|import\s*\()\s*['"]([^'"]+)['"]/g;
  for (const match of text.matchAll(importRe)) {
    const spec = match[1];
    if (/(^|\/)tests?(\/|$)|__fixtures__|test-fixtures|\.spec(?:\.|$)|\.test(?:\.|$)/i.test(spec)) {
      forbiddenRuntimeImports.push(`${rel} -> ${spec}`);
    }
  }
  for (const match of text.matchAll(/window\.([A-Za-z_$][\w$]*)\s*=/g)) {
    const name = match[1];
    if (/^(?:cheat|debug|force|spawn|grant|currency|rank)/i.test(name)) {
      suspiciousWindowHooks.push(`${rel}: window.${name}`);
    }
  }
}

if (forbiddenRuntimeImports.length) {
  fail(`runtime imports test/fixture modules:\n  - ${forbiddenRuntimeImports.join('\n  - ')}`);
}
if (suspiciousWindowHooks.length) {
  fail(`runtime exposes suspicious window debug hooks:\n  - ${suspiciousWindowHooks.join('\n  - ')}`);
}

console.log(`[source-safety] PASS: ${sourceFiles.length} runtime source files scanned; DEV overlay, mock platform, ads, telemetry and fixture-import contracts are fail-safe.`);
