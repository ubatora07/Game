const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const EN = path.join(ROOT, 'src/services/i18n/translations/en.ts');
const RU = path.join(ROOT, 'src/services/i18n/translations/ru.ts');

// Files graduate into this list only after their player-facing copy has been migrated.
const STRICT_UI_FILES = [
  'src/ui/screens/SoulTreeScreen.ts',
  'src/ui/screens/BattleScreen.ts',
  'src/ui/components/BattlefieldViewport.ts',
  'src/ui/screens/SettlementScreen.ts',
  'src/ui/modals/PetModal.ts',
  'src/ui/modals/EquipmentInventoryModal.ts',
  'src/ui/modals/EquipmentEvolutionModal.ts',
  'src/ui/modals/MarketModal.ts',
  'src/ui/modals/TitleSelectionModal.ts',
  'src/ui/modals/MercenaryGuildModal.ts',
  'src/ui/modals/BuildingInspectionModal.ts',
  'src/ui/modals/NPCDialogueModal.ts',
  'src/ui/modals/ForgeCraftingModal.ts',
  'src/ui/modals/SettlementRaidModal.ts',
  'src/ui/modals/SettlementStoryModal.ts',
  'src/ui/modals/LegacyCodexModal.ts',
  'src/ui/components/HeroStage.ts',
  'src/ui/screens/ExpeditionsScreen.ts',
  'src/ui/components/RhythmBeatIndicator.ts',
  'src/ui/screens/RelicsScreen.ts',
  'src/ui/screens/HeroesScreen.ts',
  'src/ui/screens/SummonScreen.ts',
  'src/ui/modals/SettingsModal.ts',
  'src/ui/screens/TowerScreen.ts',
  'src/ui/art/SettlementVisualRenderer.ts',
];

const DYNAMIC_CONTENT_KEY_FILES = [
  'src/content/campaignWorlds.ts',
  'src/content/campaignEnemies.ts',
  'src/content/campaignBosses.ts',
];

const STRICT_CONTENT_FILES = [
  'src/content/settlementCatalog.ts',
  'src/content/settlementNPCs.ts',
  'src/content/blacksmithCatalog.ts',
  'src/content/craftingRecipesCatalog.ts',
  'src/content/settlementRaidsCatalog.ts',
  'src/content/settlementStoryCatalog.ts',
  'src/content/legacyEndingsCatalog.ts',
  'src/content/titlesCatalog.ts',
  'src/content/mercenariesCatalog.ts',
  'src/content/relics.ts',
  'src/content/marketCatalog.ts',
];

function read(relOrAbs) {
  const p = path.isAbsolute(relOrAbs) ? relOrAbs : path.join(ROOT, relOrAbs);
  return fs.readFileSync(p, 'utf8');
}

function translationKeys(file) {
  const text = read(file);
  const keys = new Set();
  const re = /^\s*'([^']+)'\s*:/gm;
  let m;
  while ((m = re.exec(text))) keys.add(m[1]);
  return keys;
}

function translationEntries(file) {
  const text = read(file);
  const entries = new Map();
  const re = /^\s*'([^']+)'\s*:\s*'((?:\\.|[^'])*)'\s*,?\s*$/gm;
  let m;
  while ((m = re.exec(text))) entries.set(m[1], m[2]);
  return entries;
}

function placeholders(value) {
  const found = new Set();
  const re = /\{([A-Za-z0-9_]+)\}/g;
  let m;
  while ((m = re.exec(value || ''))) found.add(m[1]);
  return [...found].sort();
}

function dynamicContentTranslationKeys(rel) {
  const text = read(rel);
  const keys = new Set();
  const re = /\b(?:nameKey|descriptionKey|titleKey)\s*:\s*['\"]([^'\"]+)['\"]/g;
  let m;
  while ((m = re.exec(text))) keys.add(m[1]);
  return keys;
}

function strictContentTranslationKeys(rel) {
  const text = read(rel);
  const keys = new Set();
  const re = /['"]((?:(?:settlement|blacksmith|recipe|raid|story|legacy|title|merc|market)\.[A-Za-z0-9_.]+|relic_[A-Za-z0-9_]+))['"]/g;
  let m;
  while ((m = re.exec(text))) keys.add(m[1]);
  return keys;
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.ts$/.test(entry.name)) out.push(full);
  }
  return out;
}

function findLiteralTranslationCalls(files) {
  const used = new Map();
  const re = /\bt\(\s*['"]([^'"]+)['"]/g;
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    let m;
    while ((m = re.exec(text))) {
      if (!used.has(m[1])) used.set(m[1], []);
      used.get(m[1]).push(path.relative(ROOT, file));
    }
  }
  return used;
}


function rawRuntimeToastLiterals() {
  const roots = [path.join(ROOT, 'src/systems')];
  const files = roots.flatMap((dir) => walk(dir));
  files.push(path.join(ROOT, 'src/ui/screens/BattleScreen.ts'));
  const hits = [];
  const re = /\bmessage\s*:\s*(['"`])/g;
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    let m;
    while ((m = re.exec(text))) {
      const line = text.slice(0, m.index).split(/\r?\n/).length;
      hits.push(`${path.relative(ROOT, file)}:${line}`);
    }
  }
  return hits;
}

function strictCopyCandidates(rel) {
  const text = read(rel);
  const results = [];
  const lines = text.split(/\r?\n/);
  const htmlText = />\s*([^<>{}\n]*[A-Za-z][^<>{}\n]*)\s*</g;
  const directAssignment = /\b(?:innerText|textContent)\s*=\s*['"`]([^'"`]*[A-Za-z][^'"`]*)['"`]/g;
  const messageLiteral = /\bmessage\s*:\s*['"`]([^'"`]*[A-Za-z][^'"`]*)['"`]/g;
  const ignore = [
    /^https?:/i,
    /^rgba?\(/i,
    /^linear-gradient/i,
    /^radial-gradient/i,
    /^var\(/i,
    /^(block|none|flex|grid|absolute|relative|fixed|pointer|auto|hidden|visible)$/i,
  ];
  function candidate(value) {
    const normalized = value.replace(/\s+/g, ' ').trim();
    if (!normalized || normalized.includes('${t(') || normalized.includes('${') || normalized.includes('`') || normalized.includes('?')) return null;
    if (!/[A-Za-z]{2,}/.test(normalized)) return null;
    if (ignore.some((r) => r.test(normalized))) return null;
    return normalized;
  }
  lines.forEach((line, index) => {
    for (const re of [htmlText, directAssignment, messageLiteral]) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(line))) {
        const value = candidate(m[1]);
        if (value) results.push(`${rel}:${index + 1}: ${value}`);
      }
    }
  });
  return results;
}

const en = translationKeys(EN);
const ru = translationKeys(RU);
const enEntries = translationEntries(EN);
const ruEntries = translationEntries(RU);
const errors = [];

for (const key of [...en].sort()) if (!ru.has(key)) errors.push(`[parity] RU missing: ${key}`);
for (const key of [...ru].sort()) if (!en.has(key)) errors.push(`[parity] EN missing: ${key}`);

for (const key of [...en].filter((k) => ru.has(k)).sort()) {
  const enParams = placeholders(enEntries.get(key));
  const ruParams = placeholders(ruEntries.get(key));
  if (enParams.join('|') !== ruParams.join('|')) {
    errors.push(`[placeholder-parity] ${key}: EN={${enParams.join(',')}} RU={${ruParams.join(',')}}`);
  }
}

for (const rel of DYNAMIC_CONTENT_KEY_FILES) {
  for (const key of dynamicContentTranslationKeys(rel)) {
    if (!en.has(key) || !ru.has(key)) errors.push(`[dynamic-content-key] ${rel}: missing EN/RU translation for ${key}`);
  }
}

for (const rel of STRICT_CONTENT_FILES) {
  for (const key of strictContentTranslationKeys(rel)) {
    if (!en.has(key) || !ru.has(key)) errors.push(`[content-key] ${rel}: missing EN/RU translation for ${key}`);
  }
}

const srcFiles = walk(path.join(ROOT, 'src'));
const used = findLiteralTranslationCalls(srcFiles);
for (const [key, files] of [...used.entries()].sort()) {
  if (!en.has(key) || !ru.has(key)) {
    errors.push(`[missing-key] ${key} used by ${[...new Set(files)].join(', ')}`);
  }
}

for (const rel of STRICT_UI_FILES) {
  for (const candidate of strictCopyCandidates(rel)) {
    errors.push(`[hardcoded-copy] ${candidate}`);
  }
}

for (const hit of rawRuntimeToastLiterals()) {
  errors.push(`[raw-runtime-toast] ${hit}: player toast must use t(...)`);
}

console.log(`i18n audit: EN=${en.size}, RU=${ru.size}, literal t() keys=${used.size}, strict UI=${STRICT_UI_FILES.length}, strict content=${STRICT_CONTENT_FILES.length}, dynamic content=${DYNAMIC_CONTENT_KEY_FILES.length}, raw toast gate=on`);
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log('[i18n] PASS: translation parity, placeholder parity, literal/dynamic key coverage, and strict UI copy checks passed.');
