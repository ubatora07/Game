const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const fail = (message) => {
  console.error(`[ui-production] FAIL: ${message}`);
  process.exitCode = 1;
};

const tokens = read('src/ui/design/tokens.css');
const layout = read('src/ui/design/layout.css');
const modal = read('src/ui/components/ModalManager.ts');
const toast = read('src/ui/components/ToastManager.ts');
const primary = read('src/ui/navigation/PrimaryDomains.ts');
const nav = read('src/ui/components/Navigation.ts');
const more = read('src/ui/modals/MoreMenuModal.ts');
const heroHub = read('src/ui/screens/HeroHubScreen.ts');
const teamHub = read('src/ui/screens/TeamHubScreen.ts');
const worldHub = read('src/ui/screens/WorldHubScreen.ts');
const battle = read('src/ui/screens/BattleScreen.ts');
const heroStage = read('src/ui/components/HeroStage.ts');
const responsive = read('e2e/responsive-qa.spec.ts');
const iconRegistry = read('src/ui/art/runtime/UIIconRegistry.ts');
const buildings = read('src/content/buildings.ts');
const ranks = read('src/content/ranks.ts');

const uiRuntimeFiles = [];
const walkUi = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkUi(abs);
    } else if ((entry.name.endsWith('.ts') || entry.name.endsWith('.css')) && entry.name !== 'tokens.css') {
      uiRuntimeFiles.push(abs);
    }
  }
};
walkUi(path.join(root, 'src/ui'));

const requiredTokens = [
  '--surface-forged-bronze', '--surface-stone', '--surface-wood', '--surface-leather',
  '--surface-parchment', '--space-hairline', '--space-micro', '--space-1', '--space-6', '--focus-ring', '--touch-target-min: 44px',
  '.ui-btn-primary', '.ui-btn-secondary', '.ui-btn-destructive',
  '.rarity-frame-common', '.rarity-frame-mythic', 'min-width: var(--touch-target-min)',
  '--shadow-nav', '--shadow-hub-header', '--shadow-toast', '--shadow-modal',
  '--space-01', '--space-40', '--radius-01', '--radius-20',
  '--glow-dynamic-sm', '--glow-dynamic-xl', '--ui-glow-color',
];
for (const token of requiredTokens) {
  if (!tokens.includes(token)) fail(`missing production UI token/contract: ${token}`);
}

// Production geometry contract: runtime UI may use semantic/canonical CSS variables,
// but it must not introduce one-off pixel spacing/radii or raw numeric box shadows.
const rawRuntimeSpacing = /(?:padding|margin|gap|row-gap|column-gap)(?:-[a-z]+)?\s*:\s*[^;\n`]*-?\d+px/;
const rawRuntimeRadius = /border-radius\s*:\s*\d+px/;
const rawRuntimeShadow = /box-shadow\s*:\s*[^;\n`]*-?\d+px/;
const rawRuntimeShadowAssignment = /\.style\.boxShadow\s*=\s*[^;\n]*-?\d+px/;
for (const abs of uiRuntimeFiles) {
  const rel = path.relative(root, abs);
  const text = fs.readFileSync(abs, 'utf8');
  if (rawRuntimeSpacing.test(text)) fail(`${rel} bypasses canonical spacing tokens`);
  if (rawRuntimeRadius.test(text)) fail(`${rel} bypasses canonical radius tokens`);
  if (rawRuntimeShadow.test(text) || rawRuntimeShadowAssignment.test(text)) {
    fail(`${rel} bypasses controlled shadow/glow tokens`);
  }
}

const rawLayoutSpacing = /(padding|gap|margin)(-[a-z]+)?\s*:\s*\d+px/;
const rawLayoutRadius = /border-radius\s*:\s*\d+px/;
const rawLayoutShadow = /box-shadow\s*:\s*(?:0|inset)/;
if (rawLayoutSpacing.test(layout)) fail('layout.css bypasses the spacing token scale');
if (rawLayoutRadius.test(layout)) fail('layout.css bypasses radius tokens');
if (rawLayoutShadow.test(layout)) fail('layout.css bypasses controlled shadow tokens');

if (!nav.includes("dataset.focusGroup = 'primary-navigation'")) fail('primary navigation is missing a controller-ready focus group');
if (!nav.includes('handleNavigationKeydown')) fail('primary navigation is missing arrow-key roving focus semantics');
const domainHub = read('src/ui/screens/DomainHubScreen.ts');
if (!domainHub.includes('data-focus-group')) fail('domain hubs are missing focus-group metadata');
if (!domainHub.includes('handleActionKeydown')) fail('domain hubs are missing arrow-key roving focus semantics');
if (!modal.includes("setAttribute('aria-modal', 'true')")) fail('modal manager is missing aria-modal semantics');
if (!modal.includes('previouslyFocusedElement')) fail('modal manager does not restore focus after close');

for (const [name, text] of [['layout.css', layout], ['ModalManager', modal], ['ToastManager', toast]]) {
  if (/backdrop-filter\s*:/.test(text)) fail(`${name} reintroduced backdrop-filter/glass blur`);
}

const emojiSources = [
  ['PrimaryDomains', primary], ['MoreMenuModal', more], ['HeroHubScreen', heroHub],
  ['TeamHubScreen', teamHub], ['WorldHubScreen', worldHub],
];
const emoji = /\p{Extended_Pictographic}/u;
for (const [name, text] of emojiSources) {
  if (emoji.test(text)) fail(`${name} contains production emoji instead of semantic icon IDs`);
}

if (!nav.includes('resolveUIIcon(tab.iconId)')) fail('primary navigation does not resolve semantic UI icons');
if (/\$\{building\.icon\}/.test(battle)) fail('BattleScreen still renders legacy building emoji');
if (/avatarIcons\s*=/.test(heroStage)) fail('HeroStage still renders legacy rank emoji array');
if (!heroStage.includes('resolveUIIcon(`rank_${rank.id.toLowerCase()}`)')) fail('HeroStage does not resolve rank badges');

if (/toBeGreaterThanOrEqual\(36\)/.test(responsive)) fail('responsive QA still accepts 36px interaction targets');
const target44Count = (responsive.match(/toBeGreaterThanOrEqual\(44\)/g) || []).length;
if (target44Count < 3) fail(`responsive QA expected >=3 explicit 44px checks, found ${target44Count}`);

const buildingIds = [...buildings.matchAll(/\bid:\s*'([^']+)'/g)].map((m) => m[1]);
for (const id of buildingIds) {
  if (!iconRegistry.includes(`building_${id}:`)) fail(`missing semantic building icon: building_${id}`);
}
const rankIds = [...ranks.matchAll(/\bid:\s*'([^']+)'/g)].map((m) => m[1].toLowerCase());
for (const id of rankIds) {
  if (!iconRegistry.includes(`rank_${id}:`)) fail(`missing semantic rank badge: rank_${id}`);
}

if (!process.exitCode) {
  console.log(`[ui-production] PASS: opaque RPG surfaces, tokenized shell geometry/shadows, controller-ready focus groups, semantic primary/building/rank icons, and 44px QA contract verified (${buildingIds.length} buildings, ${rankIds.length} ranks).`);
}
