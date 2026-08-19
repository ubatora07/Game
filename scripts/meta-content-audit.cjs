#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const errors = [];

const consumers = {
  auto_training: ['src/main.ts', "'auto_training'"],
  tower_skip: ['src/systems/TowerSystem.ts', "'tower_skip'"],
  spirit_lure: ['src/systems/RandomEventSystem.ts', "'spirit_lure'"],
  offline_efficiency: ['src/economy/EconomyEngine.ts', "'offline_efficiency'"],
  synergy_amp: ['src/economy/EconomyEngine.ts', "'synergy_amp'"],
  quest_gold: ['src/systems/QuestSystem.ts', "'quest_gold'"],
  reincarnation_boost: ['src/systems/rebirth/RebirthRequirements.ts', "'reincarnation_boost'"],
  crit_burst: ['src/systems/TrainingSystem.ts', "'crit_burst'"],
};

const relicSource = read('src/content/relics.ts');
const declared = [...relicSource.matchAll(/type:\s*'([a-z_]+)'/g)].map((m) => m[1]);
const unique = [...new Set(declared)];
for (const effect of unique) {
  const consumer = consumers[effect];
  if (!consumer) {
    errors.push(`[relic-effect] ${effect}: no declared runtime consumer`);
    continue;
  }
  if (!read(consumer[0]).includes(consumer[1])) {
    errors.push(`[relic-effect] ${effect}: missing consumer marker ${consumer[1]} in ${consumer[0]}`);
  }
}
for (const effect of Object.keys(consumers)) {
  if (!unique.includes(effect)) errors.push(`[relic-effect] ${effect}: consumer exists but no relic uses the effect`);
}
if (relicSource.includes("'offline_forge'")) {
  errors.push('[relic-effect] deprecated offline_forge stub must not remain in the live relic pool');
}
if (!read('src/systems/TowerSystem.ts').includes('RELICS[Math.floor(Math.random() * RELICS.length)]')) {
  errors.push('[relic-drop] Tower relic drop path changed; re-audit live-effect coverage');
}

console.log(`meta content audit: relic effects=${unique.length}, live consumers=${Object.keys(consumers).length}`);
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log('[meta-content] PASS: every relic effect in the Tower drop pool has an explicit runtime consumer.');
