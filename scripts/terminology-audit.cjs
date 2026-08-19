#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const ROOT = path.resolve(__dirname, '..');
const BASELINE_PATH = path.join(__dirname, 'terminology-baseline.json');
const UPDATE = process.argv.includes('--update');
const VERBOSE = process.argv.includes('--verbose');

const TRACKED_TERMS = [
  { id: 'sect', pattern: /\bsect\b/gi, severity: 'forbidden' },
  { id: 'cultivation', pattern: /\bcultivat(?:ion|or|ors|e|ing|ed)\b/gi, severity: 'forbidden' },
  { id: 'qi', pattern: /\bqi\b/gi, severity: 'forbidden' },
  { id: 'samsara', pattern: /\bsamsara\b/gi, severity: 'forbidden' },
  { id: 'ascension', pattern: /\bascension\b/gi, severity: 'migration' },
  { id: 'soul_tree', pattern: /\bsoul tree\b/gi, severity: 'forbidden' },
  { id: 'dojo', pattern: /\bdojo\b/gi, severity: 'forbidden' },
  { id: 'sakura', pattern: /\bsakura\b/gi, severity: 'forbidden' },
  { id: 'ronin', pattern: /\bronin\b/gi, severity: 'forbidden' },
  { id: 'kitsune', pattern: /\bkitsune\b/gi, severity: 'forbidden' },
  { id: 'shogun', pattern: /\bshogun\b/gi, severity: 'forbidden' },
  { id: 'celestial', pattern: /\bcelestial\b/gi, severity: 'restricted' },
  { id: 'cosmic', pattern: /\bcosmic\b/gi, severity: 'restricted' },
  { id: 'astral', pattern: /\bastral\b/gi, severity: 'restricted' },
  { id: 'sovereign', pattern: /\bsovereign\b/gi, severity: 'restricted' },
  { id: 'immortal', pattern: /\bimmortal(?:ity)?\b/gi, severity: 'restricted' },
  { id: 'deity', pattern: /\bdeit(?:y|ies)\b/gi, severity: 'restricted' },
  { id: 'god', pattern: /\bgod(?:s|hood|like|dess|desses)?\b/gi, severity: 'restricted' },
  { id: 'transcendent', pattern: /\btranscendent\b/gi, severity: 'restricted' },
];

const PLAYER_PROPERTIES = new Set([
  'defaultName',
  'defaultDesc',
  'defaultTitle',
  'description',
  'subtitle',
  'requirementDesc',
  'unlockHint',
  'sourceDescription',
  'tradeOffDesc',
  'defaultSynergyDesc',
  'functionalityDescription',
  'dialogue',
  'label',
  'title',
  'name',
]);

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile() && entry.name.endsWith('.ts')) out.push(full);
  }
  return out;
}

function lineOf(source, pos) {
  return source.getLineAndCharacterOfPosition(pos).line + 1;
}

function addString(strings, file, source, node, context) {
  const text = node.text;
  if (!text || typeof text !== 'string') return;
  strings.push({ file: path.relative(ROOT, file), line: lineOf(source, node.getStart(source)), context, text });
}

function collectTranslationStrings(file) {
  const text = fs.readFileSync(file, 'utf8');
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const strings = [];
  function visit(node) {
    if (ts.isPropertyAssignment(node)) {
      const key = node.name && (ts.isStringLiteral(node.name) || ts.isIdentifier(node.name)) ? node.name.text : '';
      if (ts.isStringLiteralLike(node.initializer) || ts.isNoSubstitutionTemplateLiteral(node.initializer)) {
        addString(strings, file, source, node.initializer, `translation:${key}`);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return strings;
}

function collectContentStrings(file) {
  const text = fs.readFileSync(file, 'utf8');
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const strings = [];
  function visit(node) {
    if (ts.isPropertyAssignment(node)) {
      const key = node.name && (ts.isStringLiteral(node.name) || ts.isIdentifier(node.name)) ? node.name.text : '';
      if (PLAYER_PROPERTIES.has(key) && (ts.isStringLiteralLike(node.initializer) || ts.isNoSubstitutionTemplateLiteral(node.initializer))) {
        addString(strings, file, source, node.initializer, `property:${key}`);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return strings;
}

function collectPlayerFacingStrings() {
  const translationDir = path.join(ROOT, 'src', 'services', 'i18n', 'translations');
  const contentDir = path.join(ROOT, 'src', 'content');
  const strings = [];
  for (const file of walk(translationDir)) strings.push(...collectTranslationStrings(file));
  for (const file of walk(contentDir)) strings.push(...collectContentStrings(file));
  return strings;
}

function analyze(strings) {
  const counts = {};
  const occurrences = {};
  for (const term of TRACKED_TERMS) {
    counts[term.id] = 0;
    occurrences[term.id] = [];
  }

  for (const entry of strings) {
    for (const term of TRACKED_TERMS) {
      term.pattern.lastIndex = 0;
      const matches = entry.text.match(term.pattern);
      if (!matches) continue;
      counts[term.id] += matches.length;
      occurrences[term.id].push({ ...entry, matches: matches.length });
    }
  }
  return { counts, occurrences };
}

const strings = collectPlayerFacingStrings();
const { counts, occurrences } = analyze(strings);
const metadata = Object.fromEntries(TRACKED_TERMS.map((term) => [term.id, { severity: term.severity }]));

if (UPDATE) {
  fs.writeFileSync(BASELINE_PATH, JSON.stringify({ version: 1, generatedAt: new Date().toISOString(), counts, metadata }, null, 2) + '\n');
  console.log(`[terminology] baseline updated: ${path.relative(ROOT, BASELINE_PATH)}`);
}

if (!fs.existsSync(BASELINE_PATH)) {
  console.error('[terminology] baseline missing. Run: node scripts/terminology-audit.cjs --update');
  process.exit(2);
}

const baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'));
let failed = false;
console.log('Player-facing terminology regression audit');
console.log('term             severity     current  baseline  delta');
console.log('---------------------------------------------------------');
for (const term of TRACKED_TERMS) {
  const current = counts[term.id] || 0;
  const previous = Number(baseline.counts?.[term.id] || 0);
  const delta = current - previous;
  const sign = delta > 0 ? `+${delta}` : String(delta);
  console.log(`${term.id.padEnd(16)} ${term.severity.padEnd(12)} ${String(current).padStart(7)} ${String(previous).padStart(9)} ${sign.padStart(6)}`);
  if (delta > 0) failed = true;

  if (VERBOSE && occurrences[term.id].length) {
    for (const occ of occurrences[term.id]) {
      console.log(`  - ${occ.file}:${occ.line} [${occ.context}] ${JSON.stringify(occ.text)}`);
    }
  }
}

if (failed) {
  console.error('\n[terminology] FAILED: player-facing legacy/restricted terminology increased above the locked baseline.');
  console.error('[terminology] Reduce the new occurrence or intentionally lower/update the baseline after an approved migration.');
  process.exit(1);
}

console.log(`\n[terminology] PASS: ${strings.length} player-facing translation/content strings scanned; no tracked term increased.`);
