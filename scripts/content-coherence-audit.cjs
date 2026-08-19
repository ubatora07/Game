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
            file: path.relative(ROOT, file).replace(/\\/g, '/'),
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
requireText('src/systems/AdventureEventSystem.ts', 'if (req?.minRank)', 'adventure-min-rank');
requireText('src/systems/AdventureEventSystem.ts', 'public isChoiceEligible(choice: AdventureEventChoice)', 'adventure-choice-gate');
requireText('src/systems/AdventureEventSystem.ts', 'if (!this.isChoiceEligible(choice))', 'adventure-choice-gate');
requireText('src/ui/modals/AdventureEventModal.ts', 'adventureEventSystem.isChoiceEligible(c)', 'adventure-choice-ui');
requireText('src/main.ts', 'adventureEventDirector.init()', 'adventure-live-scheduler');
requireText('src/systems/AdventureEventDirector.ts', "events.on('campaign:stage_cleared'", 'adventure-live-scheduler');
requireText('src/systems/AdventureEventDirector.ts', 'if (!isFirstClear || this.presentationActive) return null', 'adventure-no-farm-repeat');
requireText('src/systems/AdventureEventDirector.ts', 'stage.stageNumber !== world.stageCount', 'adventure-world-boss-cadence');
requireText('src/systems/AdventureEventDirector.ts', 'campaignCombatService.setPaused(true)', 'adventure-presentation-pause');
requireText('src/systems/AdventureEventDirector.ts', "modalId: 'adventure_event_modal'", 'adventure-live-scheduler');
requireText('src/ui/modals/AdventureEventModal.ts', 'dismissible: false', 'adventure-decision-integrity');
requireText('src/ui/components/ModalManager.ts', 'modalDef.dismissible !== false', 'modal-dismiss-contract');
requireText('src/content/adventureEvents.ts', 'PARTNER_AWAKENING_EVENT_ID', 'partner-milestone-story');
requireText('src/systems/AdventureEventDirector.ts', 'PARTNER_AWAKENING_TRIGGER_STAGE_ID', 'partner-milestone-story');
requireText('src/systems/PartnerUnlockSystem.ts', 'public canAwakenPartner(): boolean', 'partner-progression-gate');
requireText('src/systems/PartnerUnlockSystem.ts', 'if (!this.canAwakenPartner()) return false', 'partner-direct-bypass');
requireText('src/ui/modals/PartnerAwakeningModal.ts', 'partnerUnlockSystem.canAwakenPartner()', 'partner-modal-gate');
requireText('src/ui/modals/PartnerAwakeningModal.ts', 'partnerUnlockSystem.completeAwakening', 'partner-modal-gate');
requireText('src/ui/screens/TeamHubScreen.ts', 'isVisible: () => partnerUnlockSystem.canAwakenPartner()', 'partner-progressive-disclosure');
requireText('src/content/petUnlock.ts', "FIRST_PET_EVENT_ID = 'evt_pet_mystic_egg_nest'", 'pet-discovery-milestone');
requireText('src/content/petUnlock.ts', "FIRST_PET_TRIGGER_STAGE_ID = '2-10'", 'pet-discovery-milestone');
requireText('src/systems/AdventureEventDirector.ts', 'FIRST_PET_TRIGGER_STAGE_ID', 'pet-discovery-milestone');
requireText('src/systems/AdventureEventDirector.ts', 'petSystem.getOwnedPets().length === 0', 'pet-discovery-milestone');
requireText('src/ui/screens/TeamHubScreen.ts', 'isVisible: () => petSystem.getOwnedPets().length > 0', 'pet-progressive-disclosure');
requireText('src/ui/screens/TeamHubScreen.ts', "events.on('pet:acquired'", 'pet-progressive-disclosure');
requireText('src/ui/navigation/SecondaryDisclosure.ts', "isProgressionUnlockedForRankId('tower'", 'secondary-disclosure');
requireText('src/ui/navigation/SecondaryDisclosure.ts', 'ownedHeroCount > 0', 'secondary-disclosure');
requireText('src/ui/navigation/SecondaryDisclosure.ts', 'ownedRelicCount > 0', 'secondary-disclosure');
requireText('src/ui/navigation/SecondaryDisclosure.ts', "isProgressionUnlockedForRankId('rebirth'", 'secondary-disclosure');
requireText('src/ui/screens/WorldHubScreen.ts', 'shouldShowTower(store.get().rankId)', 'world-progressive-disclosure');
requireText('src/ui/screens/WorldHubScreen.ts', 'shouldShowExpeditions(Object.keys(store.get().heroes).length)', 'world-progressive-disclosure');
requireText('src/ui/modals/MoreMenuModal.ts', 'shouldShowSoulTree(state.rankId, state.souls)', 'more-progressive-disclosure');
requireText('src/ui/modals/MoreMenuModal.ts', 'shouldShowRelics(Object.keys(state.relics).length)', 'more-progressive-disclosure');
requireText('src/ui/modals/MoreMenuModal.ts', 'shouldShowLegacyCodex(state.reincarnationCount', 'more-progressive-disclosure');
requireText('src/ui/screens/TeamHubScreen.ts', 'isVisible: () => mercenarySystem.isGuildUnlocked()', 'mercenary-progressive-disclosure');

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

requireText('src/content/progressionUnlocks.ts', "hero_roster: {", 'hero-roster-timing');
requireText('src/content/progressionUnlocks.ts', "rankId: 'E'", 'hero-roster-timing');
requireText('src/content/progressionUnlocks.ts', "enforcement: 'runtime'", 'hero-roster-timing');
requireText('src/core/GameState.ts', 'crystals: 150, // Starter crystals for early summon', 'hero-roster-starter-funding');
requireText('src/systems/HeroSystem.ts', "isProgressionUnlockedForRankId('hero_roster'", 'hero-roster-runtime-gate');
if (read('src/content/ranks.ts').includes("unlockedFeature: 'heroes'")) {
  errors.push('[hero-roster-timing] Rank B must not advertise Heroes as a new feature after Rank E recruitment is already live');
}

console.log(`content coherence audit: player names=${[...byName.values()].flat().length}, duplicate groups=${duplicateGroups}, shared progression gate=on, hero starter contract=on, mercenary tavern gate=on, adventure eligibility/scheduler gate=on`);
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log('[content-coherence] PASS: progression gates are centralized, Settlement/Mercenary bypasses are blocked, Adventure scheduling is first-clear boss-only, Partner/Pet/late-meta discovery is progressively disclosed, and duplicate player identities are controlled.');
