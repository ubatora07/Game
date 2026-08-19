# Execution Log — Game Consolidation V1

## Baseline

- Repository: `ubatora07/Game`
- Audited/source commit: `010304d4c1395efa1667fee190cb85126c1669ab`
- User-provided `game.zip` contains the full checkout including `.git`, `src`, `tests`, `node_modules` and build config.
- Local HEAD was verified exactly against the audited commit before modification.
- GitHub connector remains read-only for writes: branch creation still returns HTTP 403.
- Work therefore proceeds on a local `agent/...` branch and is delivered as source ZIP + format-patch.

## Applied batches

### Batch 01 — P0 Runtime Contracts

Status: **APPLIED / TYPECHECK PASS / RUNTIME CONTRACT PASS**

- DevOverlay moved behind a DEV-only dynamic import path.
- `worldState` restored during bootstrap.
- `karma:major_choice_recorded` emitted by KarmaSystem.
- Karma modifier state rebuilt on current-life/full reset.
- Party class/partner changes emit typed dependency events.

### Batch 02 — P0 Save Aggregate V7 + Class Authority

Status: **APPLIED / TYPECHECK PASS / RUNTIME CONTRACT PASS**

- Save version bumped 6 → 7 while retaining V6…legacy read keys.
- Typed Party/Pet/Karma/World save domains added.
- PartyTeam, PetSystem, KarmaSystem and WorldStateManager serialized/hydrated.
- `PartyTeam.char_1` is authoritative for protagonist class; `ClassSystem` is a compatibility facade.
- Clear Save resets mutable out-of-store systems before serializing a fresh aggregate.

### Batch 03 — P0 Rebirth Transaction

Status: **APPLIED / TYPECHECK PASS / RUNTIME CONTRACT PASS**

- Rank S definition is consumed instead of stale hardcoded player-facing requirement copy.
- Soul Tree no longer displays `1M Power` as the requirement.
- Rebirth invokes existing Settlement/Crafting/Market/Mercenary/Title/Defense/Story/Legacy/Karma/World reset policies.
- Current-life world state resets while permanent chronicle state survives.

### Batch 04 — P1 Title Milestone Integrity

Status: **APPLIED / TYPECHECK PASS / RUNTIME CONTRACT PASS**

- Craft and market events carry authoritative totals.
- Master Artisan requires 5 crafts.
- Baron of Commerce requires 5 purchases.

### Batch 05 — P1 Pet Combat Integration

Status: **APPLIED / TYPECHECK PASS / RUNTIME CONTRACT PASS**

- Pet lifecycle/combat events typed.
- Campaign loop calls `PetSystem.tickCombat()` with correct time units.
- Pet damage travels through campaign enemy damage/kill transaction.
- Battlefield consumes active-pet/action events that PetSystem actually emits.

### Batch 06 — P0 Production Debug Surface Hardening

Status: **APPLIED / SOURCE VERIFIED / FRESH BUILD PENDING**

- `window.events` and `window.store` exposed only when `import.meta.env.DEV`.
- `__DISABLE_SAVE__` is honored only in DEV.
- Added `scripts/release-safety-audit.cjs`.
- `npm run build` now automatically runs `qa:release-safety` after Vite build.
- Gate scans for `BALANCE DEV`, `CHEATS`, force-rank/currency/spawn controls, Test Ad and save-disable marker.
- Existing stale `dist` correctly fails this gate, proving it must be rebuilt before shipping.

### Batch 07 — AdventureEvent Persistence + Strict V7 Sanitization

Status: **APPLIED / TYPECHECK PASS / RUNTIME CONTRACT PASS**

- AdventureEvent once-only completion IDs and cooldown timestamps are persisted.
- Expired cooldowns are discarded during hydration.
- Duplicate Karma snapshot removed from AdventureEvent serialization; Karma remains its own authority.
- V7 sanitizer now structurally validates Party, Pet, Karma, World and AdventureEvent payloads.
- Invalid class IDs, unknown pets, bad numeric values, fake world flags and malformed cooldowns are rejected/clamped.
- Added corrupted-V7 regression coverage.


### Batch 08 — UX Information Architecture V3

Status: **APPLIED / SOURCE TYPECHECK PASS / ROUTE HARNESS PASS / BROWSER QA PENDING**

- Primary navigation replaced with the authoritative six-domain order: Hero / Team / Battle / Settlement / World / More.
- Added `PrimaryDomains.ts` as the single source of truth for primary-domain order and deep-route ownership.
- Added dedicated Hero, Team and World domain hub screens instead of overloading Ascension/Heroes as primary tabs.
- Battle is now the default startup route; legacy `home` remains a backward-compatible Battle alias only.
- Legacy Sect management is reachable through an explicit `sect` route under More, eliminating the old Sect -> home -> Battle mismatch.
- Settlement now surfaces Forge, Market, Mercenaries, Raid Defense and Chronicles directly inside the Settlement domain.
- More reduced from 18 mixed destinations to 7 legacy/meta destinations.
- Added centralized `ScreenRouteRegistry` plus direct-route smoke coverage.
- Deep routes now map back to the correct active primary domain (Ascension -> Hero, Heroes/Summon -> Team, Tower/Expeditions/Quests -> World, legacy/meta -> More).
- Navigation is six equal-width touch targets with the existing 44px minimum target token; no horizontal scrolling is required by the source layout contract.
- Added accessible primary-nav label/current-page state and keyboard-native button actions.
- Added `screen_change` analytics telemetry.
- Updated unit and Playwright selectors from the stale five-tab contract.
- `P4-01` through `P4-26` are source-complete; browser visual Gate C remains intentionally open until a fresh Linux-compatible build can be produced.

### Batch 09 — Product Identity V2 Foundation

Status: **DOCUMENTED / COMPATIBILITY-SAFE / TITLE DECISION OPEN**

- Added `docs/PRODUCT_IDENTITY_V2.md` locking the player-facing direction to western/dark heroic pixel fantasy while preserving anime as a visual/cinematic influence rather than the default cultural vocabulary.
- Defined technology ceiling, magic vocabulary, faction language, protagonist fantasy, settlement fantasy, Rebirth/Legacy framing, rank semantics, naming morphology and adjective-density limits.
- Added `docs/NAMING_AND_WORLD_BIBLE_V2.md` with a coherent five-region migration direction anchored on Mountain Haven / Eldoria.
- Added `docs/TERMINOLOGY_MIGRATION_MAP.md` separating player-facing retheme from stable save/content/analytics identifiers.
- Audited the current `ANIME INFINITE ASCENSION` title and produced a working shortlist.
- `P5-01` through `P5-21` and `P5-24/P5-25` are complete.
- `P5-22/P5-23` intentionally remain open: no final store-facing game title is selected or applied without availability review and explicit product choice.

### Batch 10 — Xianxia Legacy Audit + Regression Gate

Status: **AUDITED / BASELINE LOCKED / BUILD GATE ENABLED**

- Added `docs/XIANXIA_LEGACY_AUDIT_V2.md` covering Sect, Cultivation, Qi, Samsara, Ascension, Soul Tree, rank escalation, buildings, upgrades, World 2 cultural identity, heroes, titles, market, pets, equipment, relics, NPC/story copy and compatibility rules.
- Added AST-based `scripts/terminology-audit.cjs` scanning player-facing translation values and content display fields rather than internal identifiers/comments.
- Added locked `scripts/terminology-baseline.json` for 19 tracked legacy/restricted term families across 2,473 player-facing strings.
- Baseline policy is monotonic: new occurrences fail; approved migrations lower counts; baseline should not be increased to silence regressions.
- Added `npm run qa:terminology` and made it the first gate in `npm run build`.
- `P6-01` through `P6-25` are complete at audit/regression-control level. Actual display-copy migration proceeds in Phase 7 with EN/RU parity.

## Validation results

- `git diff --check`: **PASS**.
- `node node_modules/typescript/bin/tsc --noEmit`: **PASS**.
- New regression suites + `tests/save.test.ts` typecheck: **PASS**.
- Independent compiled runtime harness: **7/7 PASS**:
  1. V6 → V7 migration
  2. Class authority
  3. Karma → World + modifier reset
  4. Pet persistence/combat cooldown
  5. Title milestone thresholds
  6. AdventureEvent persistence
  7. Rebirth transaction
- UX IA V3 route harness: **PASS** (six-domain order, deep-route ownership, screen registry aliases).
- Test inventory: 85 Vitest suites.
- E2E inventory: 3 Playwright specs.

## Environment blocker — not a code failure

`npm test` / Vite build cannot start in this Linux sandbox because the uploaded `node_modules/@rollup` contains only:

- `rollup-win32-x64-gnu`
- `rollup-win32-x64-msvc`

and does not contain the Linux optional native package `@rollup/rollup-linux-x64-gnu`. Therefore no Vitest/Vite result is being reported as pass or fail. The source-level TypeScript and independent runtime validations above are the current evidence.

## Next execution gate

Navigation IA V3 is source-implemented. Before release, it still requires a fresh browser build on Linux-compatible dependencies to close Gate C at 390x844 / 1366x768 / 1920x1080.

Implementation can continue independently into **Phase 5 — Product Identity V2**, while preserving these rules:

1. Player-facing terminology changes must not rename save keys or stable internal IDs without migration coverage.
2. Western/dark-fantasy vocabulary should be centralized before mass string replacement.
3. RU and EN must migrate together.
4. Historical docs stay historical; current source-of-truth docs receive explicit supersession status.
5. Fresh build/test/Playwright gates remain open until Linux Rollup dependencies are available.

## 2026-08-19 — Phase 7 Localization Consolidation

Status: SOURCE COMPLETE except browser overflow gates P7-18/P7-19.

Completed:
- expanded EN/RU dictionaries to 1645 parity-checked keys;
- migrated active Battle/Hero/Settlement/World/RPG modal copy to i18n;
- localized runtime toast/event feedback across gameplay systems;
- localized settlement, raid, story, Legacy ending, market, title, mercenary and relic content keys;
- added placeholder-parity, dynamic-content-key and hardcoded-copy enforcement;
- added global raw-runtime-toast regression gate;
- fixed Legacy Ascendant ending eligibility to use `reincarnationCount` instead of `rankIndex`;
- rethemed player-facing Domain/Sovereign/Samsara/Celestial runtime phrases without changing compatibility IDs;
- documented hardcoded-copy and pluralization-sensitive follow-up.

Validation:
- `npx tsc --noEmit -p tsconfig.json` PASS
- `node scripts/i18n-audit.cjs` PASS
- `node scripts/terminology-audit.cjs` PASS
- `git diff --check` PASS
- fresh Vite/Vitest/Playwright build remains blocked by Windows-only Rollup native package in supplied `node_modules`.

## 2026-08-19 — Phase 8 Real Art Runtime Architecture

Status: **SOURCE COMPLETE / ART REGISTRY GATE PASS / PRODUCTION ASSET REPLACEMENT PENDING PHASE 9**

Completed:
- added typed World, Enemy/Boss, Player, Pet and UI Icon registries;
- extended the existing art-pipeline contract with nearest-neighbor/integer pixel scaling and a 192px seamless tile rule;
- wired `CampaignWorld.bgAsset`, combat `spriteId`, authoritative protagonist class and active `petId + evolutionStage` into Battlefield;
- replaced forest-for-every-world with five distinct four-layer procedural parallax fallbacks;
- replaced goblin-for-every-enemy with explicit coverage for 35 enemy/boss sprite IDs and multiple silhouettes;
- replaced swordsman-for-every-class with distinct Mage/Swordsman/Archer/Assassin fallback paths;
- replaced Ignis-for-every-pet with independent Ignis/Fenrir/Sylph/Aegis fallback paths;
- added DEV-only missing-art diagnostics and safe production fallback behavior;
- synchronized world/boss ambience hooks through the existing SoundService theme API;
- added boss presentation metadata/aura hooks;
- added `tests/art-asset-resolution.test.ts` and build-enforced `qa:art-registry`;
- documented the runtime art boundary in `docs/ART_RUNTIME_ARCHITECTURE_V2.md`.

Validation:
- `npx tsc --noEmit -p tsconfig.json` PASS
- selective TypeScript compile of `tests/art-asset-resolution.test.ts` PASS
- `node scripts/art-registry-audit.cjs` PASS: 5 worlds / 35 enemy+boss sprites / 4 classes / 4 pets / 6 UI icons
- `node scripts/i18n-audit.cjs` PASS
- `node scripts/terminology-audit.cjs` PASS
- `git diff --check` PASS
- Vitest/Vite/Playwright execution remains environment-blocked by the supplied Windows-only Rollup native dependency; no browser-art verification is claimed.

Important boundary:
Phase 8 fixes **runtime art identity resolution**, not final art quality. Procedural SVG/CSS remains an explicit fallback. Phase 9 is the production World 1 vertical slice that replaces these sources with real seamless pixel-art layers and sprite atlases without changing gameplay routing.

## 2026-08-19 — Phase 9 vertical-slice authoring lock

Status: **PALETTE + RUNTIME PARALLAX CONTRACT COMPLETE / FINAL RASTER ART PENDING**

- Locked World 1 palette and four-layer 192px seamless authoring specification in `docs/WORLD1_VERTICAL_SLICE_ART_SPEC.md`.
- The four-speed runtime parallax implementation from Phase 8 satisfies P9-06.
- Production raster layer/sprite/VFX checkboxes remain open until actual final assets exist and can be visually validated in a fresh browser build.
- No procedural fallback is being mislabeled as final production pixel art.


## 2026-08-19 — Phase 10 Gameplay Integration

Status: **SOURCE COMPLETE / INDEPENDENT RUNTIME HARNESS 10/10 PASS**

Completed:
- corrected campaign first-clear semantics so stage bonuses are awarded only on actual stage completion;
- deferred authoritative combat reward events until after the GameStore transaction notifies subscribers;
- verified hero-skill and duplicate-death paths cannot grant the same campaign kill reward twice;
- verified party modifier application is idempotent;
- defined active focus as loadout/editing focus and connected Equipment Inventory to the authoritative party focus without changing combat power;
- typed party-focus, mercenary, settlement-story and world-flag EventBus contracts;
- promoted `settlement` to a real ModifierSourceType instead of `as any`;
- verified mercenary expiry deletes contracts and clears modifier sources, including after deserialize;
- verified pet synergy can be satisfied by either unlocked party character;
- connected WorldState consequences to Settlement visual output through a text-free overlay and live `world:flag_changed` rerender;
- verified the shared damage path applies boss shield mechanics consistently;
- verified serialize/deserialize cycles do not leak or stack modifier sources;
- added `tests/gameplay-integration-v2.test.ts` and updated campaign reward tests to the corrected first-clear contract;
- documented cross-system rules in `docs/GAMEPLAY_INTEGRATION_CONTRACTS_V1.md`.

Validation:
- `npx tsc --noEmit -p tsconfig.json` PASS
- selective TypeScript compile for campaign + gameplay integration tests PASS
- independent Phase 10 Node runtime harness PASS **10/10**
- `node scripts/i18n-audit.cjs` PASS
- `node scripts/terminology-audit.cjs` PASS
- `node scripts/art-registry-audit.cjs` PASS
- `git diff --check` PASS
- full Vitest/Vite/Playwright execution remains environment-blocked by Windows-only Rollup native dependencies in supplied `node_modules`.


## 2026-08-19 — Phase 11 UI Production Pass (source contract batch A)

Status: **SOURCE CONTRACT PASS / BROWSER DENSITY QA PENDING**

Completed in this batch:
- replaced the old blue/slate glass token language with opaque dark heroic-fantasy surface tokens;
- defined forged-bronze, stone, wood, leather and parchment surface contracts;
- defined rarity frames plus primary/secondary/destructive/disabled action states;
- added visible keyboard focus rings and a 44px minimum control contract;
- removed all `backdrop-filter` usage from active UI source, including header/layout, modal and toast surfaces;
- switched the six primary domains and all Hero/Team/World hub icons to semantic SVG registry IDs;
- switched More menu to semantic registry icons;
- switched active Battle/Home building presentation from legacy emoji fields to 10 semantic building icons;
- switched HeroStage rank presentation from its emoji array to 12 semantic rank badges;
- documented system/local typography strategy without adding external font-file dependencies;
- raised responsive QA train/navigation thresholds from 36px to 44px;
- added build-enforced `qa:ui-production` and `docs/UI_PRODUCTION_SYSTEM_V1.md`.

Intentionally still open:
- controller-specific navigation semantics beyond keyboard/focus-visible readiness;
- repo-wide replacement of legacy raw spacing/radius/shadow literals in old inline-style screens;
- real browser validation at 390x844, 1366x768 and 1920x1080.

Validation:
- `node scripts/ui-production-audit.cjs` PASS (10 building icons / 12 rank badges)
- `npx tsc --noEmit -p tsconfig.json` PASS
- selective TypeScript compile of navigation/art/responsive QA PASS
- i18n / terminology / art-registry gates PASS
- `git diff --check` PASS


### 2026-08-19 — Phase 11 UI Production Pass (source contract batch B)

**Status:** PASS — shared shell focus/geometry contract; active-screen inline geometry cleanup still open.

- Added roving arrow-key focus semantics to the six primary navigation domains.
- Added deterministic focus groups/order to Hero/Team/World domain action hubs.
- Added modal `aria-modal` semantics, initial focus placement, and focus restoration on close.
- Tokenized all layout.css spacing/radius/shadow declarations; raw pixel spacing/radius/shadow now fail `qa:ui-production`.
- Added controlled nav/hub/toast shadow tokens and explicit micro-spacing tokens for dense optical exceptions.
- P11-12 is complete. P11-19/P11-20/P11-21 remain open because active legacy screen-local inline styles still contain raw geometry values.

## 2026-08-19 — P0 Save/Rebirth Closure (BATCH-08/09)

Status: **SOURCE COMPLETE / INDEPENDENT RUNTIME HARNESS 6/6 PASS**

Completed:
- replaced remaining external RPG `any` fields in `GameStateData` with concrete save-state types;
- centralized capture/hydrate/clear-reset orchestration in `RpgSaveAggregate`;
- extracted deterministic local-vs-cloud selection into `selectMostRecentSave`;
- added full V7 round-trip coverage for party, second character, active focus, pet evolution/active pet, Karma score/flags/reputation and World current/legacy flags;
- verified repeated hydration is idempotent for Pet and Karma modifier sources;
- removed AdventureEvent -> Karma reset ownership leakage;
- documented the exact Save V7 and Rebirth preservation matrix;
- created structured `RebirthRequirements` as the single eligibility/reward contract;
- aligned the legacy 1B reward floor to the actual Rank S / 2B rebirth gate;
- updated Soul Tree and Rebirth modal to consume the structured requirements object;
- removed the duplicate Settlement `reincarnate:complete` reset listener so reset policies execute exactly once;
- added an explicit post-reset campaign-combat rebuild before `reincarnate:complete`;
- made `SaveService` persist immediately on the post-transaction rebirth event;
- verified party/class/partner/pet preservation, current-life World reset, legacy World preservation and immediate second-rebirth idempotency;
- added corrupted-optional-domain rebirth regression coverage.

Validation:
- `tsc --noEmit -p tsconfig.json` PASS;
- selective TypeScript compile of Save V7 + Rebirth regression suites PASS;
- independent P0 Save/Rebirth Node runtime harness PASS **6/6**;
- `npm run qa:terminology` PASS;
- `npm run qa:i18n` PASS;
- `npm run qa:art-registry` PASS;
- `npm run qa:ui-production` PASS;
- `git diff --check` PASS;
- full Vitest/Vite/Playwright remains environment-blocked by the supplied Windows-only Rollup native dependency, so those gates remain explicitly open.

Roadmap effect:
- Phase 2 Save Aggregate V7: **51/51 complete**.
- Phase 3 Rebirth / Legacy Reset Contract: **32/32 complete**.

## 2026-08-19 — P0 Production Platform Safety (BATCH-10)

Status: **SOURCE SAFETY PASS / PLATFORM FAIL-CLOSED RUNTIME HARNESS 5/5 / FRESH BUNDLE PROOF STILL BLOCKED**

Completed:
- replaced production fallback from `MockPlatformService` with `UnavailablePlatformService`;
- retained MockPlatform only behind the explicit DEV factory path;
- changed uninitialized Yandex fullscreen/rewarded ad behavior from simulated success to fail-closed `false`;
- removed mutable `window.ysdk` exposure;
- added build-enforced `qa:source-safety` before the existing content/type/Vite gates;
- source-safety scans runtime imports for test fixtures, suspicious window debug hooks, DevOverlay import shape, Mock activation, fail-closed ads and DEV analytics logging;
- added `tests/production-safety.test.ts` source/platform regression coverage;
- added `docs/PRODUCTION_SAFETY_RUNBOOK.md` with emergency rollback procedure.

Validation:
- `npm run qa:source-safety` PASS: 179 runtime source files scanned;
- selective TypeScript compile of production-safety regression test PASS;
- independent platform runtime harness PASS **5/5**;
- source `tsc --noEmit -p tsconfig.json` PASS;
- terminology/i18n/art-registry/ui-production gates PASS;
- `git diff --check` PASS.

Still open by evidence rule:
- `P1-02` remains open until a fresh Vite production bundle can be generated and scanned. The supplied dependencies still lack the Linux Rollup native module required by this sandbox.

## 2026-08-19 — UI Geometry & Shadow Normalization (BATCH-11)

Status: **SOURCE COMPLETE / UI PRODUCTION AUDIT PASS / BROWSER DENSITY QA STILL BLOCKED**

Completed:
- introduced a canonical exact-value spacing token scale and migrated every runtime UI `padding`, `margin`, and `gap` pixel literal to tokens without changing geometry;
- introduced canonical radius tokens and migrated every runtime UI pixel radius to tokens, retaining circular/full-radius semantics;
- standardized structural elevation, modal frames, inset depth and colored feedback glows behind controlled shadow/glow tokens;
- added `--ui-glow-color` + dynamic glow tokens so rank/rarity colors remain data-driven without reintroducing one-off shadow geometry;
- migrated active dynamic rank/rarity/boss glow assignments to the controlled dynamic glow contract;
- expanded `qa:ui-production` to recursively reject raw runtime spacing, radius and numeric box-shadow declarations across `src/ui`;
- eliminated raw runtime spacing/radius/numeric-shadow declarations from the audited UI tree.

Validation:
- `npm run qa:ui-production` PASS;
- `npx tsc --noEmit -p tsconfig.json` PASS;
- `npm run qa:source-safety` PASS;
- `npm run qa:terminology` PASS;
- `npm run qa:i18n` PASS;
- `npm run qa:art-registry` PASS;
- `git diff --check` PASS.

Roadmap effect:
- `P11-19` spacing normalization COMPLETE;
- `P11-20` radius normalization COMPLETE;
- `P11-21` shadow normalization COMPLETE;
- `P11-24..26` remain open until a fresh browser-build path is available for 390x844 / 1366x768 / 1920x1080 validation.

## 2026-08-19 — Governance & Release Packaging Contract (BATCH-12)

Status: **SOURCE GOVERNANCE PASS / STALE ARTIFACT CORRECTLY REFUSED**

Completed:
- defined authoritative document precedence in `docs/PROJECT_GOVERNANCE.md`;
- defined S/M/L/XL effort and LOW/MEDIUM/HIGH migration-risk semantics;
- added a reusable acceptance-criteria template and mandatory rollback rules for save-sensitive HIGH-risk changes;
- defined the production-only verification checklist and explicit BLOCKED / NOT VERIFIED evidence rule;
- marked root `PLAN*.md` and `CHECKLIST*.md` files as historical and redirected readers to the active master plan;
- added `npm run package:release` as the canonical packaging command;
- replaced the Windows-only release packager with a cross-platform `dist/`-only packager (PowerShell on Windows, zip/Python fallback elsewhere);
- packaging now reruns `release-safety` before creating an archive and requires `dist/index.html`;
- added build-enforced `qa:governance` to prevent roadmap precedence / packaging safety regression.

Validation:
- `npm run qa:governance` PASS;
- `node --check scripts/package-release.cjs` PASS;
- `node --check scripts/governance-audit.cjs` PASS;
- `npx tsc --noEmit -p tsconfig.json` PASS;
- `git diff --check` PASS;
- `npm run package:release` against the stale pre-fix `dist/` correctly FAILS before archive creation because release-safety detects debug/cheat markers.

Roadmap effect:
- Phase 0 Baseline & Governance is now **20/20 complete**.
- Positive release ZIP generation remains a release-candidate task because a fresh Vite build is still environment-blocked by the missing Linux Rollup native dependency.

## 2026-08-19 — Campaign World Identity + Dynamic i18n Contract (BATCH-13)

Status: **SOURCE COMPLETE / I18N + TERMINOLOGY GATES PASS / PRODUCTION ART STILL OPEN**

Completed:
- finalized player-facing identities for Worlds 1–5 as Whispering Forest, Thorncourt Marches, Ashen Rift, Frostspire Range and Umbral Sanctum while preserving stable world/theme/background IDs;
- removed the Sakura/Ronin/Kitsune/Shogun player-facing cluster from World 2 campaign/tower copy and replaced it with fallen-marches duelists, wardens, cursed foxes and Regent Morcant;
- rethemed World 3 around blackglass ruins and the Ashen Rift, World 4 around frostborn high passes and ward-stones, and World 5 around an occult Umbral Sanctum rather than outer-space/cosmic fantasy;
- aligned campaign enemy and boss fallback names with the Product Identity V2 world bible without renaming internal enemy IDs, boss IDs, translation keys or sprite IDs;
- added all missing campaign `nameKey`, `titleKey`, and `descriptionKey` translations for EN/RU so battle UI cannot fall back to raw content keys;
- extended `qa:i18n` with automatic dynamic-key extraction for campaign worlds, enemies and bosses;
- rethemed matching Infinite Tower world/monster/boss copy and the Stage 2-5 quest;
- switched the legacy World 2 tower ambient particle presentation from blossom petals to generic red-leaf particles while preserving the mechanical world slot.

Validation:
- `npm run qa:i18n` PASS: EN/RU parity **1696 / 1696**, dynamic campaign key gate active;
- `npm run qa:terminology` PASS with reductions from the locked baseline (`sakura -4`, `ronin -2`, `kitsune -2`, `shogun -2`, `cosmic -4`, `astral -4`, `sovereign -4`);
- `npm run qa:art-registry` PASS;
- `npm run qa:ui-production` PASS;
- `npm run qa:source-safety` PASS;
- `npm run qa:governance` PASS;
- `npx tsc --noEmit -p tsconfig.json` PASS;
- `git diff --check` PASS.

Roadmap effect:
- `P12-01`, `P12-02`, `P12-07`, `P12-12`, `P12-17` COMPLETE (world identity/content contracts);
- World 2–5 background layers, production enemy/boss art, authored ambience, unique props/loot/VFX and browser transition validation remain intentionally OPEN.


## 2026-08-19 — Progression Disclosure & Content Coherence Gate (BATCH-14)

Status: **SOURCE COMPLETE / CONTENT-COHERENCE GATE PASS / HERO + PARTNER TIMING INTENTIONALLY OPEN**

Completed:
- introduced `PROGRESSION_UNLOCKS` as the shared rank-gate contract for Settlement, Tower, declared Hero-roster timing and Rebirth documentation;
- moved Settlement primary navigation and direct-claim eligibility to the shared Rank C gate;
- fixed the dead Settlement rank-up listener to consume the typed `newRank` payload instead of nonexistent `rankIndex` data;
- replaced Tower's duplicated magic Rank C index with the shared progression helper;
- added the active unlock pacing matrix and structural content-coherence audit;
- added duplicate player-name enforcement with the single intentional Master Goran Settlement/Forge identity explicitly recognized;
- closed a mercenary progression bypass: hiring now requires Mountain Haven ownership plus a constructed Tavern;
- made Market mercenary contracts validate the Tavern gate before any currency is deducted;
- added a locked Mercenary Guild state explaining Settlement/Tavern requirements in EN/RU;
- updated legacy mercenary integration tests to establish the Tavern explicitly and added focused mercenary progression regressions;
- left Hero recruitment timing and Partner Awakening discovery timing open because existing design sources conflict or do not define an enforceable trigger; no balance/time gate was invented.

Validation:
- `npm run qa:content-coherence` PASS;
- `npm run qa:i18n` PASS;
- source `npx tsc --noEmit -p tsconfig.json` PASS;
- focused progression/mercenary regression typecheck PASS in ES module mode;
- `git diff --check` PASS;
- full Vitest/Vite/Playwright execution remains environment-blocked by the supplied Windows-only Rollup native dependency.

Roadmap effect:
- `P13-07` Mercenary audit COMPLETE with runtime enforcement evidence;
- `P13-28` Unlock pacing matrix COMPLETE;
- `P13-27` first-60-minute overload reduction remains OPEN until Hero/Partner timing and locked-teaser browser behavior are resolved.


## 2026-08-19 — Adventure Event Integrity Contracts (BATCH-15)

Status: **SOURCE INTEGRITY COMPLETE / LIVE SCHEDULER STILL OPEN**

Completed:
- enforced `AdventureEventRequirement.minRank`, which previously existed in schema but was ignored by eligibility resolution;
- added fail-closed choice eligibility for Gold, Class, active Pet, unlocked Title and signed Karma requirements;
- guarded `executeChoice` against foreign/ineligible choices so direct calls cannot bypass choice costs/requirements;
- disabled ineligible Adventure modal choices and exposed a locked state instead of presenting every choice as clickable;
- localized the Adventure modal empty state and category ribbon for EN/RU;
- repaired the stale Phase 85 persistence test so Adventure event history and Karma are validated as separate V7 save domains;
- added focused regressions for min-rank and choice-requirement enforcement;
- recorded the separate live scheduler disconnect as `P13-29` instead of inventing an unvalidated random-event cadence.

Validation:
- source `npx tsc --noEmit -p tsconfig.json` PASS;
- focused Adventure framework/integrity regression typecheck PASS;
- `npm run qa:i18n` PASS;
- `npm run qa:content-coherence` PASS;
- `git diff --check` PASS;
- full Vitest/Vite/Playwright remains environment-blocked by the supplied Windows-only Rollup native dependency.

Roadmap effect:
- `P13-30` Adventure min-rank enforcement COMPLETE;
- `P13-31` Adventure choice requirements COMPLETE;
- `P13-29` live Adventure scheduler remains OPEN and explicit.


## 2026-08-19 — Live Adventure Event Director (BATCH-16)

Status: **SOURCE COMPLETE / CONSERVATIVE LIVE CADENCE / BROWSER QA PENDING**

Completed:
- added `AdventureEventDirector` as the explicit Campaign → Adventure bridge;
- schedule only after first-clear final world boss stages, preventing farm-mode repeat events;
- build event context from the cleared world plus live Party/Karma/Rank/Gold state;
- exclude events with no currently eligible choices from weighted selection;
- pause campaign combat while the Adventure decision is active and restore the previous pause state on close;
- made Adventure decisions non-dismissible by backdrop/Escape so first-clear events cannot be silently lost;
- close the Adventure decision before executing outcomes so Hero/Pet follow-up modals do not collide with the active modal;
- added focused director regressions and a content-coherence regression gate for scheduler wiring/cadence.

Validation target:
- source `npx tsc --noEmit -p tsconfig.json`;
- focused Adventure test typecheck;
- `npm run qa:content-coherence`;
- full available source QA matrix;
- `git diff --check`;
- full Vitest/Vite/Playwright remains environment-blocked by the supplied Windows-only Rollup native dependency.

Roadmap effect:
- `P13-29` live Adventure scheduler COMPLETE at conservative first-clear world-boss cadence.
- Partner Awakening timing remains intentionally separate; it will not be stacked onto the same World 1 boss modal flow without explicit sequencing.


## 2026-08-19 — Partner Awakening Milestone Story (BATCH-17)

Status: **SOURCE COMPLETE / PROGRESSION BYPASS CLOSED / BROWSER QA PENDING**

Completed:
- converted the historical Phase 81 “memorable gameplay event / quest” requirement into a deterministic World 1 final-boss story milestone;
- added the zero-weight dedicated oath Adventure event so it cannot leak into ordinary random selection;
- made AdventureEventDirector prioritize that story on the first `1-10` clear when the second Main Character is still undiscovered;
- added `PartnerUnlockSystem` with a Karma-backed persisted invitation and fail-closed production completion path;
- removed fresh-save Partner disclosure from Team and reveal it only after the story invitation;
- guarded PartnerAwakeningModal itself so direct runtime modal calls cannot bypass progression;
- renamed new/default player-facing partner identity from legacy Soul Resonance language to an oathbound frontier companion;
- added EN/RU story/onboarding copy and focused progression regressions.

Validation target:
- EN/RU i18n parity and terminology regression gate;
- source TypeScript and focused Partner/Adventure test typecheck;
- content coherence/source safety/governance/art/UI source gates;
- `git diff --check`;
- browser behavior remains pending until a Linux-capable fresh Vite build can run.

Roadmap effect:
- `P13-02` second-character identity audit COMPLETE;
- `P13-32` milestone story gate COMPLETE;
- `P13-33` direct awakening bypass + persisted invitation COMPLETE;
- `P13-27` first-hour overload reduction remains OPEN because Hero roster timing still conflicts across design/runtime sources.
