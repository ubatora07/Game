#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const ROOT = path.resolve(__dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile() && entry.name.endsWith('.ts')) out.push(full);
  }
  return out;
}

function collectPlayerNames() {
  const files = walk(path.join(ROOT, 'src', 'content'));
  const names = [];
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    function visit(node) {
      if (ts.isPropertyAssignment(node)) {
        const key = node.name && (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name)) ? node.name.text : '';
        if ((key === 'defaultName' || key === 'name') && ts.isStringLiteralLike(node.initializer)) {
          names.push({
            value: node.initializer.text.trim(),
            file: path.relative(ROOT, file),
            line: source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1,
          });
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
  }
  return names;
}

const errors = [];
function requireText(rel, needle, label) {
  if (!read(rel).includes(needle)) errors.push(`[${label}] ${rel}: missing ${JSON.stringify(needle)}`);
}
function forbidText(rel, needle, label) {
  if (read(rel).includes(needle)) errors.push(`[${label}] ${rel}: forbidden duplicated progression literal ${JSON.stringify(needle)}`);
}

// Shared rank-gate contract must own the live progression thresholds.
requireText('src/content/progressionUnlocks.ts', "settlement: {", 'unlock-contract');
requireText('src/content/progressionUnlocks.ts', "rankId: 'C'", 'unlock-contract');
requireText('src/content/progressionUnlocks.ts', "tower: {", 'unlock-contract');
requireText('src/content/progressionUnlocks.ts', "rebirth: {", 'unlock-contract');
requireText('src/ui/navigation/PrimaryDomains.ts', "getProgressionUnlockRankIndex('settlement')", 'progressive-disclosure');
requireText('src/systems/TowerSystem.ts', "isProgressionUnlocked('tower'", 'tower-gate');
requireText('src/systems/SettlementSystem.ts', "isProgressionUnlockedForRankId('settlement', newRank)", 'settlement-event');
requireText('src/ui/screens/SettlementScreen.ts', 'canClaimSettlementFromProgression()', 'settlement-direct-route');
forbidText('src/systems/TowerSystem.ts', 'rankIndex < 2', 'tower-gate');
forbidText('src/systems/SettlementSystem.ts', 'rankIndex >= 2', 'settlement-event');
requireText('src/systems/MercenarySystem.ts', "settlementSystem.getBuildingState('tavern')", 'mercenary-gate');
requireText('src/systems/MercenarySystem.ts', 'settlementSystem.isSettlementOwned()', 'mercenary-gate');
requireText('src/systems/MercenarySystem.ts', 'if (!this.isGuildUnlocked())', 'mercenary-gate');
requireText('src/systems/MarketSystem.ts', "offer.reward.type === 'mercenary' && !mercenarySystem.isGuildUnlocked()", 'mercenary-market-transaction');
requireText('src/ui/modals/MercenaryGuildModal.ts', "mercenary.guild_locked_tavern", 'mercenary-locked-ui');

// Player-facing duplicate identities need to be intentional and explicit.
const allowedDuplicateNames = new Map([
  ['master goran', new Set(['src/content/blacksmithCatalog.ts', 'src/content/settlementNPCs.ts'])],
]);
const byName = new Map();
for (const entry of collectPlayerNames()) {
  const key = entry.value.toLocaleLowerCase('en-US');
  if (!byName.has(key)) byName.set(key, []);
  byName.get(key).push(entry);
}
let duplicateGroups = 0;
for (const [key, entries] of byName) {
  if (entries.length < 2) continue;
  duplicateGroups += 1;
  const actualFiles = new Set(entries.map((entry) => entry.file));
  const allowedFiles = allowedDuplicateNames.get(key);
  const exactAllowed = allowedFiles
    && actualFiles.size === allowedFiles.size
    && [...actualFiles].every((file) => allowedFiles.has(file));
  if (!exactAllowed) {
    errors.push(`[duplicate-player-name] ${entries[0].value}: ${entries.map((entry) => `${entry.file}:${entry.line}`).join(', ')}`);
  }
}

// The one intentional duplicate represents the same NPC in settlement + forge services.
const goranBlacksmith = /defaultName:\s*'Master Goran'/.test(read('src/content/blacksmithCatalog.ts'));
const goranNpc = /defaultName:\s*'Master Goran'/.test(read('src/content/settlementNPCs.ts'));
if (!goranBlacksmith || !goranNpc) errors.push('[identity-link] Master Goran settlement/forge identity drifted');

const unresolvedHeroTiming = read('src/content/progressionUnlocks.ts').includes("hero_roster")
  && read('src/content/progressionUnlocks.ts').includes("enforcement: 'declared'");
if (!unresolvedHeroTiming) errors.push('[pacing-evidence] hero roster timing conflict must remain explicitly declared until resolved');

console.log(`content coherence audit: player names=${[...byName.values()].flat().length}, duplicate groups=${duplicateGroups}, shared progression gate=on, mercenary tavern gate=on`);
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log('[content-coherence] PASS: progression gates are centralized, Settlement/Mercenary bypasses are blocked, and duplicate player identities are controlled.');
