const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const fail = (message) => {
  console.error(`[art-registry] FAIL: ${message}`);
  process.exitCode = 1;
};

function extractValues(source, pattern) {
  return [...source.matchAll(pattern)].map((match) => match[1]);
}

function unique(values) {
  return [...new Set(values)].sort();
}

function assertExactSet(label, expected, actual) {
  const missing = expected.filter((id) => !actual.includes(id));
  const extra = actual.filter((id) => !expected.includes(id));
  if (missing.length) fail(`${label} missing: ${missing.join(', ')}`);
  if (extra.length) fail(`${label} has unreferenced entries: ${extra.join(', ')}`);
}

const enemies = read('src/content/campaignEnemies.ts');
const bosses = read('src/content/campaignBosses.ts');
const worlds = read('src/content/campaignWorlds.ts');
const classes = read('src/content/classes.ts');
const pets = read('src/content/petsCatalog.ts');
const enemyRegistry = read('src/ui/art/runtime/EnemySpriteRegistry.ts');
const worldRegistry = read('src/ui/art/runtime/WorldArtRegistry.ts');
const playerRegistry = read('src/ui/art/runtime/PlayerSpriteRegistry.ts');
const petRegistry = read('src/ui/art/runtime/PetSpriteRegistry.ts');
const iconRegistry = read('src/ui/art/runtime/UIIconRegistry.ts');
const renderer = read('src/ui/art/runtime/ArtRuntimeRenderer.ts');
const battlefield = read('src/ui/components/BattlefieldViewport.ts');
const layoutCss = read('src/ui/design/layout.css');
const artPipeline = read('src/content/artPipeline.ts');

const contentEnemyIds = unique([
  ...extractValues(enemies, /spriteId:\s*'([^']+)'/g),
  ...extractValues(bosses, /spriteId:\s*'([^']+)'/g),
]);
const registryEnemyIds = unique(extractValues(enemyRegistry, /^\s{2}((?:enemy|boss)_[a-z0-9_]+):\s*enemy\(/gm));
assertExactSet('enemy registry', contentEnemyIds, registryEnemyIds);

const contentWorldIds = unique(extractValues(worlds, /bgAsset:\s*'([^']+)'/g));
const registryWorldIds = unique(extractValues(worldRegistry, /^\s{2}(bg_[a-z0-9_]+):\s*\{/gm));
assertExactSet('world registry', contentWorldIds, registryWorldIds);

const contentClassIds = unique(extractValues(classes, /^\s{4}id:\s*'(mage|swordsman|archer|assassin)'/gm));
const registryClassIds = unique(extractValues(playerRegistry, /^\s{2}(mage|swordsman|archer|assassin):\s*player\(/gm));
assertExactSet('player class registry', contentClassIds, registryClassIds);

const contentPetIds = unique(extractValues(pets, /^\s{2}(pet_[a-z0-9_]+):\s*\{/gm));
const registryPetIds = unique(extractValues(petRegistry, /^\s{2}(pet_[a-z0-9_]+):\s*pet\(/gm));
assertExactSet('pet registry', contentPetIds, registryPetIds);

const requiredIcons = ['nav_hero', 'nav_team', 'nav_battle', 'nav_settlement', 'nav_world', 'nav_more'];
const registryIcons = unique(extractValues(iconRegistry, /^\s{2}(nav_[a-z0-9_]+):\s*icon\(/gm));
assertExactSet('primary UI icon registry', requiredIcons, registryIcons);

const directLegacyRenderers = [
  'PixelSpriteRenderer.getForestBackground',
  'PixelSpriteRenderer.getGoblinSprite',
  'PixelSpriteRenderer.getSwordsmanSprite',
  'PixelSpriteRenderer.getPetSprite',
];
for (const marker of directLegacyRenderers) {
  if (battlefield.includes(marker)) fail(`Battlefield bypasses registry via ${marker}`);
}

const requiredBattlefieldBindings = [
  'world.bgAsset',
  'enemy.spriteId',
  "partyTeamSystem.getCharacter('char_1').classId",
  'activePet.id',
  'sound.setWorldTheme',
  'ArtRuntimeRenderer.renderWorld',
  'ArtRuntimeRenderer.renderEnemy',
  'ArtRuntimeRenderer.renderPlayer',
  'ArtRuntimeRenderer.renderPet',
];
for (const marker of requiredBattlefieldBindings) {
  if (!battlefield.includes(marker)) fail(`Battlefield missing art binding: ${marker}`);
}

if ((worldRegistry.match(/createLayer\(worldId,/g) || []).length !== 4) {
  fail('world parallax factory must define exactly 4 logical layers');
}
if (!worldRegistry.includes('repeatX: true') || !worldRegistry.includes('seamlessX: true')) {
  fail('world layer contract must require horizontal repeat + seamlessX');
}
if (!renderer.includes("const size = '192px 100%';")) {
  fail('procedural world fallbacks must use the 192px seamless tile width');
}
if (!layoutCss.includes('@keyframes battle-parallax-scroll') || !layoutCss.includes('background-position-x: -192px')) {
  fail('parallax keyframe must scroll exactly one seamless 192px tile');
}
if (!artPipeline.includes('seamlessWorldTileWidthPx: 192')) {
  fail('art pipeline must expose the seamless world tile width rule');
}
if (!artPipeline.includes("interpolation: 'nearest-neighbor'")) {
  fail('art pipeline must enforce nearest-neighbor raster interpolation');
}
if (!renderer.includes("spriteId === 'enemy_goblin'") || !renderer.includes('renderGenericEnemy')) {
  fail('enemy runtime must preserve a goblin fallback while supporting non-goblin silhouettes');
}
if (!renderer.includes("def.classId === 'swordsman'") || !renderer.includes('renderGenericPlayer')) {
  fail('player runtime must preserve swordsman fallback while supporting other classes');
}
if (!renderer.includes("def.petId === 'pet_ignis_drake'") || !renderer.includes('renderGenericPet')) {
  fail('pet runtime must preserve Ignis fallback while supporting other pets');
}

if (!process.exitCode) {
  console.log(`[art-registry] PASS: ${contentWorldIds.length} worlds, ${contentEnemyIds.length} enemy/boss sprites, ${contentClassIds.length} classes, ${contentPetIds.length} pets, ${requiredIcons.length} UI icons are registry-covered.`);
}
