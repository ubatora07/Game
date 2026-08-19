# ULTRA MASTER PLAN — Game Consolidation V1

**Repository:** `ubatora07/Game`  
**Audited tree SHA:** `010304d4c1395efa1667fee190cb85126c1669ab`  
**Execution mode:** preserve working mechanics; fix contracts and presentation before adding major systems.

## Severity

- **P0** release/data-loss/security/debug blocker
- **P1** major product/gameplay coherence blocker
- **P2** production quality/polish
- **P3** optimization/cleanup
- **P4** optional/future

## Working rules

- Do not rebalance unless a task explicitly requires balance correction.
- Preserve stable save keys and internal IDs until migration coverage exists.
- Every stateful feature must pass save → reload and, where relevant, rebirth → reload.
- Historical “Verified” documents are not evidence for current HEAD.
- Every completed batch must include validation evidence or be marked `NOT RUNTIME-VERIFIED`.
- Player-facing terminology may change before internal identifiers.
- Do not add major new systems until P0/P1 consolidation gates are closed.

## Current execution status

- [x] Repository-wide tree obtained and full source ZIP materialized locally.
- [x] Local checkout HEAD verified exactly as `010304d4c1395efa1667fee190cb85126c1669ab`.
- [x] `BATCH-01` through `BATCH-05` applied to the real source checkout.
- [x] P0 production debug surfaces hardened at source level.
- [x] Save Aggregate bumped to V7 with Party/Pets/Karma/AdventureEvents/World persistence.
- [x] Strict V7 sanitization added for newly persisted typed RPG subdomains.
- [x] Class ownership consolidated: `PartyTeam.char_1` authoritative, `ClassSystem` compatibility facade.
- [x] Rebirth invokes existing subsystem reset policies as one transaction path.
- [x] Pet active combat wired into `CampaignCombatService`.
- [x] Title 5-craft / 5-purchase milestone bugs fixed.
- [x] Source TypeScript check passes: `tsc --noEmit`.
- [x] New regression suites + `save.test.ts` type-check cleanly.
- [x] Independent runtime contract harness passes **7/7** Save/Rebirth assertions.
- [x] Independent Phase 10 gameplay integration harness passes **10/10** assertions.
- [x] `git diff --check` passes.
- [x] Build-time `qa:release-safety` gate added and chained into `npm run build`.
- [x] Build-time `qa:source-safety` gate added before Vite/TypeScript release build.
- [x] Production platform fallback changed from reward-simulating Mock to fail-closed no-op service.
- [x] Yandex ad calls fail closed when SDK is unavailable/uninitialized.
- [x] Save V7 external RPG orchestration centralized in `RpgSaveAggregate`.
- [x] Save V7 full round-trip / clear-reset / cloud-selection contracts runtime-verified.
- [x] Rebirth requirements centralized and aligned to Rank S / 2B lifetime power.
- [x] Rebirth persistence, preservation, combat respawn and idempotency runtime-verified.
- [x] Build-time `qa:ui-production` gate enforces opaque RPG surfaces, semantic icons, and 44px targets.
- [x] Existing stale `dist` correctly FAILS release-safety because it predates P0 hardening.
- [ ] Full `npm test` execution — environment-blocked: uploaded `node_modules` contains only Windows Rollup native packages, sandbox is Linux.
- [ ] Fresh `npm run build` — same Rollup native-package blocker; current `dist` must not be shipped.
- [ ] Playwright gates — wait for a fresh post-fix build/dev server.

### Applied implementation batches

- [x] `BATCH-01` P0 runtime contracts: DEV-only DevOverlay path, WorldState hydrate, Karma/Party events.
- [x] `BATCH-02` Save V7 + class authority consolidation + aggregate clear-save reset.
- [x] `BATCH-03` Rebirth transaction + Rank S requirement source.
- [x] `BATCH-04` Title milestone integrity (5 crafts / 5 purchases).
- [x] `BATCH-05` Pet combat integration + active-pet event wiring.
- [x] `BATCH-06` Production debug-surface hardening + mandatory release-safety build gate.
- [x] `BATCH-07` AdventureEvent once-only/cooldown persistence + strict V7 sanitizer pass.
- [x] `BATCH-08` Save V7 aggregate orchestration + full persistence/idempotency regression coverage.
- [x] `BATCH-09` RebirthRequirements + exactly-once reset ordering + immediate persistence contract.
- [x] `BATCH-10` Production platform fail-closed hardening + source-safety audit/runbook.

## Validation evidence — 2026-08-19

- Full source checkout: exact audited Git commit.
- Unit test inventory: **88** `tests/*.test.ts` files after adding the new regression suites.
- E2E inventory: **3** Playwright specs (`campaign-interaction-v2`, `interaction-qa`, `responsive-qa`).
- `tsc --noEmit`: PASS.
- New regression-suite typecheck: PASS.
- Save/Rebirth runtime contract harness: **7/7 PASS**.
- Gameplay integration runtime harness: **10/10 PASS**.
- `git diff --check`: PASS.
- Old/pre-fix `dist` release-safety audit: EXPECTED FAIL with `BALANCE DEV`, `CHEATS`, rank/currency/spawn controls, Test Ad and `__DISABLE_SAVE__` markers.
- Vitest/Vite execution is not counted as pass because the uploaded dependency tree contains Windows-only Rollup native modules.

## PHASE 0 — Baseline & Governance

**Priority:** P0/P1

- [x] `P0-01` Pin audited HEAD SHA 010304d4c1395efa1667fee190cb85126c1669ab in the working log
- [x] `P0-02` Create a single active roadmap and mark legacy phase reports historical
- [ ] `P0-03` Define source-of-truth document precedence
- [x] `P0-04` Record current save version and legacy keys
- [x] `P0-05` Record current primary navigation routes
- [x] `P0-06` Record current runtime entry points
- [x] `P0-07` Record current automated test inventory
- [x] `P0-08` Record current E2E viewport matrix
- [x] `P0-09` Record production build command
- [ ] `P0-10` Record release packaging command
- [x] `P0-11` Define P0/P1/P2/P3/P4 severity semantics
- [ ] `P0-12` Define S/M/L/XL effort semantics
- [ ] `P0-13` Define LOW/MEDIUM/HIGH migration risk semantics
- [ ] `P0-14` Define acceptance criteria template
- [ ] `P0-15` Define rollback requirements for save-sensitive changes
- [x] `P0-16` Define no-balance-change rule for consolidation phases
- [x] `P0-17` Define no-internal-ID-rename rule until player-facing migration is stable
- [x] `P0-18` Define player-facing vs internal terminology boundary
- [ ] `P0-19` Define production-only verification checklist
- [x] `P0-20` Create execution log section updated after each batch

## PHASE 1 — P0 Production Safety

**Priority:** P0

- [x] `P1-01` Guard DevOverlay behind import.meta.env.DEV
- [ ] `P1-02` Ensure production bundle does not instantiate DevOverlay
- [x] `P1-03` Audit all global window debug hooks
- [x] `P1-04` Audit __DISABLE_SAVE__ exposure
- [x] `P1-05` Audit cheat buttons and test-ad controls for production reachability
- [x] `P1-06` Audit console-only debug commands
- [x] `P1-07` Add test asserting DevOverlay is unavailable in production mode
- [x] `P1-08` Add build-time release assertion for debug markers
- [x] `P1-09` Audit test fixtures accidentally imported by runtime
- [x] `P1-10` Audit mock platform activation rules
- [x] `P1-11` Audit ad test paths
- [x] `P1-12` Audit development telemetry UI
- [x] `P1-13` Audit forced rank manipulation paths
- [x] `P1-14` Audit direct currency mutation controls
- [x] `P1-15` Audit time-skip controls
- [x] `P1-16` Audit spawn/debug event controls
- [x] `P1-17` Add release grep for BALANCE DEV
- [x] `P1-18` Add release grep for CHEATS
- [x] `P1-19` Add release grep for Test Ad
- [x] `P1-20` Document emergency rollback if production debug leak is found

## PHASE 2 — Save Aggregate V7

**Priority:** P0

- [x] `P2-01` Inventory every subsystem owning mutable state outside GameStore
- [x] `P2-02` Add typed save fields for partyTeam
- [x] `P2-03` Add typed save fields for pets
- [x] `P2-04` Add typed save fields for karma
- [x] `P2-05` Add typed save fields for class selection or explicitly retire duplicate ClassSystem ownership
- [x] `P2-06` Add typed save field for worldState
- [x] `P2-07` Replace new any save subdomains with concrete types incrementally
- [x] `P2-08` Bump CURRENT_SAVE_VERSION from 6 to 7
- [x] `P2-09` Preserve all ANIME_ASCENSION_SAVE legacy read keys
- [x] `P2-10` Define V6 to V7 migration defaults
- [x] `P2-11` Sanitize partyTeam payload
- [x] `P2-12` Sanitize pet payload
- [x] `P2-13` Sanitize karma payload
- [x] `P2-14` Sanitize worldState payload
- [x] `P2-15` Sanitize class payload if retained
- [x] `P2-16` Serialize partyTeam in SaveService
- [x] `P2-17` Serialize PetSystem in SaveService
- [x] `P2-18` Serialize KarmaSystem in SaveService
- [x] `P2-19` Serialize WorldStateManager in SaveService
- [x] `P2-20` Serialize ClassSystem only if it remains authoritative
- [x] `P2-21` Deserialize partyTeam during bootstrap
- [x] `P2-22` Deserialize pets during bootstrap
- [x] `P2-23` Deserialize karma during bootstrap
- [x] `P2-24` Deserialize worldState during bootstrap
- [x] `P2-25` Deserialize class during bootstrap if retained
- [x] `P2-26` Reapply all derived modifiers after hydration
- [x] `P2-27` Prevent double-application of class modifiers after hydration
- [x] `P2-28` Prevent double-application of pet modifiers after hydration
- [x] `P2-29` Prevent double-application of karma modifiers after hydration
- [x] `P2-30` Add V6 -> V7 migration unit test
- [x] `P2-31` Add corrupted V7 payload sanitization test
- [x] `P2-32` Add save/reload party test
- [x] `P2-33` Add save/reload pet ownership test
- [x] `P2-34` Add save/reload pet evolution test
- [x] `P2-35` Add save/reload active pet test
- [x] `P2-36` Add save/reload karma score test
- [x] `P2-37` Add save/reload major choice flags test
- [x] `P2-38` Add save/reload faction reputation test
- [x] `P2-39` Add save/reload world flag test
- [x] `P2-40` Add save/reload legacy world chronicle test
- [x] `P2-41` Add save/reload active focus character test
- [x] `P2-42` Add save/reload second character unlock test
- [x] `P2-43` Add old save non-regression test
- [x] `P2-44` Add clear-save reset test for all V7 domains
- [x] `P2-45` Add cloud-vs-local selection test with V7 payload
- [x] `P2-46` Document exact preservation rules for every subdomain
- [x] `P2-47` Persist AdventureEvent once-only completion state
- [x] `P2-48` Persist AdventureEvent cooldown timestamps
- [x] `P2-49` Drop expired/invalid AdventureEvent cooldowns during hydrate
- [x] `P2-50` Verify `SkillTreeSystem` is not a live runtime save domain before adding duplicate state
- [x] `P2-51` Verify `RhythmAttackSystem` is not a live runtime save domain before adding duplicate state

## PHASE 3 — Rebirth / Legacy Reset Contract

**Priority:** P0

- [x] `P3-01` Create a single RebirthRequirements source of truth
- [x] `P3-02` Remove hardcoded 1M requirement copy
- [x] `P3-03` Reconcile Rank S 2B requirement with soul formula 1B lifetime threshold
- [x] `P3-04` Define whether both rank and lifetime thresholds are intentional
- [x] `P3-05` Expose structured canRebirth reason
- [x] `P3-06` Expose structured potential reward
- [x] `P3-07` Make SoulTree UI consume RebirthRequirements
- [x] `P3-08` Make ReincarnateModal consume RebirthRequirements
- [x] `P3-09` Create reset coordinator or explicit reset event contract
- [x] `P3-10` Reset run economy exactly once
- [x] `P3-11` Reset campaign exactly once
- [x] `P3-12` Reset current-life karma and reapply modifiers
- [x] `P3-13` Reset current-life world flags
- [x] `P3-14` Preserve permanent world chronicle flags
- [x] `P3-15` Preserve titles according to design
- [x] `P3-16` Define pet preservation through rebirth
- [x] `P3-17` Define party/partner preservation through rebirth
- [x] `P3-18` Define class preservation through rebirth
- [x] `P3-19` Define equipment preservation through rebirth
- [x] `P3-20` Define settlement preservation through rebirth
- [x] `P3-21` Define crafting inventory preservation through rebirth
- [x] `P3-22` Define market state preservation through rebirth
- [x] `P3-23` Define mercenary contract reset behavior
- [x] `P3-24` Define story state reset behavior
- [x] `P3-25` Define legacy ending preservation
- [x] `P3-26` Reapply all modifier sources after reset
- [x] `P3-27` Immediately save after successful rebirth
- [x] `P3-28` Respawn campaign only after reset transaction completes
- [x] `P3-29` Add rebirth persistence test
- [x] `P3-30` Add rebirth + reload test
- [x] `P3-31` Add repeated rebirth idempotency test
- [x] `P3-32` Add rebirth with corrupt optional domains test

## PHASE 4 — Navigation IA V3

**Priority:** P1

- [x] `P4-01` Replace legacy 5-domain navigation contract
- [x] `P4-02` Implement HERO domain route
- [x] `P4-03` Implement TEAM domain route
- [x] `P4-04` Keep BATTLE as default center route
- [x] `P4-05` Implement SETTLEMENT domain route
- [x] `P4-06` Implement WORLD domain route
- [x] `P4-07` Keep MORE for meta/secondary destinations only
- [x] `P4-08` Remove Sect -> home -> Battle routing mismatch
- [x] `P4-09` Remove Hero -> Ascension semantic mismatch
- [x] `P4-10` Define desktop navigation composition
- [x] `P4-11` Define mobile navigation composition
- [x] `P4-12` Define tablet navigation composition
- [x] `P4-13` Move protagonist/class/equipment into Hero domain
- [x] `P4-14` Move partner/heroes/pets/mercenaries into Team domain
- [x] `P4-15` Move forge/market/tavern/raids/story into Settlement domain
- [x] `P4-16` Move campaign map/tower/expeditions into World domain
- [x] `P4-17` Move settings/stats/dailies/legacy/meta into More
- [x] `P4-18` Reduce More menu destination count
- [x] `P4-19` Update screen registry
- [x] `P4-20` Update navigation active-state logic
- [x] `P4-21` Update keyboard/focus behavior
- [x] `P4-22` Update route analytics
- [x] `P4-23` Update navigation unit tests
- [x] `P4-24` Update responsive E2E selectors
- [x] `P4-25` Add direct-route smoke tests for six domains
- [x] `P4-26` Add browser back/reload route expectations if routing evolves — N/A for this batch; event-based routing intentionally retained

## PHASE 5 — Product Identity V2

**Priority:** P1

- [x] `P5-01` Lock primary fantasy as western/dark/heroic pixel fantasy RPG
- [x] `P5-02` Define exact role of anime influence
- [x] `P5-03` Define forbidden xianxia-facing terminology
- [x] `P5-04` Define allowed legacy internal identifiers
- [x] `P5-05` Define world technology ceiling
- [x] `P5-06` Define magic vocabulary
- [x] `P5-07` Define kingdom/faction vocabulary
- [x] `P5-08` Define protagonist fantasy
- [x] `P5-09` Define settlement fantasy
- [x] `P5-10` Define rebirth fantasy
- [x] `P5-11` Define rank ladder fantasy
- [x] `P5-12` Define soul/legacy resource fantasy
- [x] `P5-13` Define naming morphology for humans
- [x] `P5-14` Define naming morphology for monsters
- [x] `P5-15` Define naming morphology for items
- [x] `P5-16` Define naming morphology for locations
- [x] `P5-17` Define naming morphology for titles
- [x] `P5-18` Define adjective-density limits
- [x] `P5-19` Define Sovereign/Celestial/Astral/Cosmic usage limits
- [x] `P5-20` Audit game title ANIME INFINITE ASCENSION
- [x] `P5-21` Produce candidate title shortlist
- [ ] `P5-22` Choose player-facing title before store-art lock
- [ ] `P5-23` Update app title/subtitle only after decision
- [x] `P5-24` Create world bible
- [x] `P5-25` Create terminology migration map

## PHASE 6 — Xianxia Legacy Migration

**Priority:** P1

- [x] `P6-01` Audit Sect player-facing strings
- [x] `P6-02` Audit Cultivation player-facing strings
- [x] `P6-03` Audit Qi player-facing strings
- [x] `P6-04` Audit Samsara player-facing strings
- [x] `P6-05` Audit Ascension player-facing strings
- [x] `P6-06` Audit Soul Tree player-facing strings
- [x] `P6-07` Audit immortal/god/deity escalation copy
- [x] `P6-08` Audit dojo/meditation/shrine cultural mix
- [x] `P6-09` Audit Sakura Empire world identity
- [x] `P6-10` Audit ronin/kitsune/shogun enemy set
- [x] `P6-11` Audit Japanese/Chinese hero naming concentration
- [x] `P6-12` Audit rank descriptions
- [x] `P6-13` Audit building descriptions
- [x] `P6-14` Audit upgrades
- [x] `P6-15` Audit quests and achievements
- [x] `P6-16` Audit titles
- [x] `P6-17` Audit market black-market copy
- [x] `P6-18` Audit pets and evolution names
- [x] `P6-19` Audit equipment evolution names
- [x] `P6-20` Audit relic names
- [x] `P6-21` Audit NPC dialogue
- [x] `P6-22` Audit story chapters
- [x] `P6-23` Audit analytics event labels only where player-facing dashboards use them
- [x] `P6-24` Preserve stable internal IDs unless migration value is proven
- [x] `P6-25` Add terminology regression scan

## PHASE 7 — Localization Consolidation

**Priority:** P1

- [x] `P7-01` Inventory all hardcoded player-facing English strings
- [x] `P7-02` Move SoulTree literals to i18n
- [x] `P7-03` Move Battlefield literals to i18n
- [x] `P7-04` Move SettlementScreen literals to i18n
- [x] `P7-05` Move settlement modals to i18n
- [x] `P7-06` Move pet modal literals to i18n
- [x] `P7-07` Move equipment modal literals to i18n
- [x] `P7-08` Move market modal literals to i18n
- [x] `P7-09` Move title modal literals to i18n
- [x] `P7-10` Move mercenary modal literals to i18n
- [x] `P7-11` Move toast strings to i18n
- [x] `P7-12` Move boss warning strings to i18n
- [x] `P7-13` Move world-clear strings to i18n
- [x] `P7-14` Add EN keys
- [x] `P7-15` Add RU keys
- [x] `P7-16` Check interpolation safety
- [x] `P7-17` Check pluralization-sensitive strings
- [ ] `P7-18` Check 390px Russian string overflow
- [ ] `P7-19` Check 1366 desktop Russian strings
- [x] `P7-20` Add missing-key test
- [x] `P7-21` Add hardcoded-player-copy lint/audit script

## PHASE 8 — Real Art Runtime Architecture

**Priority:** P1

- [x] `P8-01` Create WorldArtRegistry contract
- [x] `P8-02` Create EnemySpriteRegistry contract
- [x] `P8-03` Create PlayerSpriteRegistry contract
- [x] `P8-04` Create PetSpriteRegistry contract
- [x] `P8-05` Create UIIconRegistry contract
- [x] `P8-06` Wire campaignWorld.bgAsset to battlefield renderer
- [x] `P8-07` Wire enemy.spriteId to enemy renderer
- [x] `P8-08` Wire boss.spriteId to boss renderer
- [x] `P8-09` Wire protagonist class to player renderer
- [x] `P8-10` Wire active pet id + evolution to pet renderer
- [x] `P8-11` Define atlas metadata contract
- [x] `P8-12` Define animation frame metadata contract
- [x] `P8-13` Define pixel scale rules
- [x] `P8-14` Define fallback asset behavior
- [x] `P8-15` Define missing-asset diagnostics in dev only
- [x] `P8-16` Eliminate forest-for-every-world rendering
- [x] `P8-17` Eliminate goblin-for-every-enemy rendering
- [x] `P8-18` Eliminate swordsman-for-every-class rendering
- [x] `P8-19` Eliminate Ignis-for-every-pet rendering
- [x] `P8-20` Define parallax layer contract
- [x] `P8-21` Define seamless repeat contract
- [x] `P8-22` Define world ambience hooks
- [x] `P8-23` Define boss presentation hooks
- [x] `P8-24` Add asset-resolution unit tests

## PHASE 9 — World 1 Production Vertical Slice

**Priority:** P1

- [x] `P9-01` Lock World 1 palette
- [ ] `P9-02` Create seamless sky/far layer
- [ ] `P9-03` Create seamless distant forest layer
- [ ] `P9-04` Create seamless midground layer
- [ ] `P9-05` Create seamless foreground layer
- [x] `P9-06` Implement four-speed parallax
- [ ] `P9-07` Create protagonist idle sprite
- [ ] `P9-08` Create protagonist attack sprite
- [ ] `P9-09` Create protagonist crit sprite
- [ ] `P9-10` Create protagonist hurt sprite
- [ ] `P9-11` Create protagonist victory sprite
- [ ] `P9-12` Create first enemy family
- [ ] `P9-13` Create second enemy family
- [ ] `P9-14` Create third enemy family
- [ ] `P9-15` Create elite variant
- [ ] `P9-16` Create World 1 boss
- [ ] `P9-17` Create one production pet
- [ ] `P9-18` Create attack VFX
- [ ] `P9-19` Create crit VFX
- [ ] `P9-20` Create hit VFX
- [ ] `P9-21` Create death VFX
- [ ] `P9-22` Create loot flyout visuals
- [ ] `P9-23` Create world stage progress visuals
- [ ] `P9-24` Create boss warning visual
- [ ] `P9-25` Create production currency icons
- [ ] `P9-26` Remove emoji placeholders from vertical slice
- [ ] `P9-27` Validate pixel edges at 1x/2x/3x scale
- [ ] `P9-28` Validate no white fog/halo contamination in forest layers
- [ ] `P9-29` Validate seamless horizontal loop visually
- [ ] `P9-30` Validate mobile battlefield readability
- [ ] `P9-31` Validate desktop battlefield expansion

## PHASE 10 — Gameplay Integration

**Priority:** P1

- [x] `P10-01` Call PetSystem.tickCombat from authoritative combat loop
- [x] `P10-02` Apply pet damage through CampaignCombatService mechanics
- [x] `P10-03` Emit pet combat events
- [x] `P10-04` Render pet combat action feedback
- [x] `P10-05` Verify hero skills do not duplicate rewards
- [x] `P10-06` Verify party modifiers apply once
- [x] `P10-07` Verify ClassSystem and PartyTeamSystem class ownership do not conflict
- [x] `P10-08` Choose one authoritative protagonist class state
- [x] `P10-09` Migrate duplicate class state safely
- [x] `P10-10` Verify mercenary modifiers lifecycle
- [x] `P10-11` Verify expired contracts clear modifiers
- [x] `P10-12` Verify titles unlock at real thresholds
- [x] `P10-13` Fix Master Artisan 5-craft condition
- [x] `P10-14` Fix Baron of Commerce 5-purchase condition
- [x] `P10-15` Fix Karma major-choice event contract
- [x] `P10-16` Fix Karma reset modifier reapplication
- [x] `P10-17` Verify world flag visual consequences are consumed
- [x] `P10-18` Verify story choices update world flags
- [x] `P10-19` Verify pet class synergy with both characters
- [x] `P10-20` Verify active-focus switching has intended mechanical meaning
- [x] `P10-21` Verify boss special mechanics with pet/hero damage
- [x] `P10-22` Verify reward transaction remains atomic
- [x] `P10-23` Verify no kill reward duplication
- [x] `P10-24` Verify no modifier source leaks after reload

## PHASE 11 — UI Production Pass

**Priority:** P2

- [x] `P11-01` Remove generic glassmorphism from primary surfaces
- [x] `P11-02` Reduce backdrop-filter usage
- [x] `P11-03` Define forged bronze primary frame
- [x] `P11-04` Define stone secondary panel
- [x] `P11-05` Define wood/leather contextual panels
- [x] `P11-06` Define parchment narrative surface
- [x] `P11-07` Define rarity frames
- [x] `P11-08` Define button hierarchy
- [x] `P11-09` Define destructive confirmation style
- [x] `P11-10` Define disabled style
- [x] `P11-11` Define keyboard focus style
- [x] `P11-12` Define controller-ready focus semantics
- [x] `P11-13` Replace navigation emoji with icons
- [x] `P11-14` Replace building emoji with icons
- [x] `P11-15` Replace rank emoji with badges/icons
- [x] `P11-16` Replace More menu emoji with icons
- [x] `P11-17` Create readable fantasy display font strategy
- [x] `P11-18` Keep body font highly readable
- [ ] `P11-19` Normalize spacing scale
- [ ] `P11-20` Normalize border radii
- [ ] `P11-21` Normalize shadow use
- [x] `P11-22` Enforce 44px touch targets
- [x] `P11-23` Update E2E target-size expectation from 36 to 44
- [ ] `P11-24` Validate modals at 390x844
- [ ] `P11-25` Validate 1366x768 density
- [ ] `P11-26` Validate 1920x1080 expansion

## PHASE 12 — World Differentiation

**Priority:** P2

- [ ] `P12-01` Finalize World 1 identity
- [ ] `P12-02` Retheme World 2 to fit Product Identity V2
- [ ] `P12-03` Create World 2 background layers
- [ ] `P12-04` Create World 2 enemy family
- [ ] `P12-05` Create World 2 boss
- [ ] `P12-06` Create World 2 ambience
- [ ] `P12-07` Finalize World 3 identity
- [ ] `P12-08` Create World 3 background layers
- [ ] `P12-09` Create World 3 enemy family
- [ ] `P12-10` Create World 3 boss
- [ ] `P12-11` Create World 3 ambience
- [ ] `P12-12` Finalize World 4 identity
- [ ] `P12-13` Create World 4 background layers
- [ ] `P12-14` Create World 4 enemy family
- [ ] `P12-15` Create World 4 boss
- [ ] `P12-16` Create World 4 ambience
- [ ] `P12-17` Finalize World 5 identity
- [ ] `P12-18` Create World 5 background layers
- [ ] `P12-19` Create World 5 enemy family
- [ ] `P12-20` Create World 5 boss
- [ ] `P12-21` Create World 5 ambience
- [ ] `P12-22` Give each world unique props
- [ ] `P12-23` Give each world unique loot presentation
- [ ] `P12-24` Give each world distinct combat VFX accents
- [ ] `P12-25` Validate world transitions feel like major rewards

## PHASE 13 — Content Coherence

**Priority:** P2

- [ ] `P13-01` Audit main protagonist identity
- [ ] `P13-02` Audit second character identity
- [ ] `P13-03` Audit gacha hero roster
- [ ] `P13-04` Audit four base classes
- [ ] `P13-05` Audit skill trees
- [ ] `P13-06` Audit pets
- [ ] `P13-07` Audit mercenaries
- [ ] `P13-08` Audit settlement NPCs
- [ ] `P13-09` Audit settlement buildings
- [ ] `P13-10` Audit equipment progression chains
- [ ] `P13-11` Audit crafting materials
- [ ] `P13-12` Audit market offers
- [ ] `P13-13` Audit black-market offers
- [ ] `P13-14` Audit titles
- [ ] `P13-15` Audit karma bands
- [ ] `P13-16` Audit narrative chains
- [ ] `P13-17` Audit world flags
- [ ] `P13-18` Audit legacy endings
- [ ] `P13-19` Audit relics
- [ ] `P13-20` Audit expeditions
- [ ] `P13-21` Audit tower
- [ ] `P13-22` Audit quests
- [ ] `P13-23` Audit achievements
- [ ] `P13-24` Audit dailies
- [ ] `P13-25` Audit liveops content packs
- [ ] `P13-26` Remove duplicate fantasy roles
- [ ] `P13-27` Reduce system overload in first 60 minutes
- [ ] `P13-28` Create unlock pacing matrix

## PHASE 14 — Audio & Feel

**Priority:** P2/P3

- [ ] `P14-01` Audit procedural SFX coverage
- [ ] `P14-02` Define authored combat SFX list
- [ ] `P14-03` Define UI SFX list
- [ ] `P14-04` Define settlement ambience list
- [ ] `P14-05` Define world ambience list
- [ ] `P14-06` Define boss stinger list
- [ ] `P14-07` Define reward sound hierarchy
- [ ] `P14-08` Define rarity reveal sounds
- [ ] `P14-09` Add audio asset loading contract
- [ ] `P14-10` Keep WebAudio procedural fallback
- [ ] `P14-11` Verify browser interaction unlock
- [ ] `P14-12` Verify background-tab suspend/resume
- [ ] `P14-13` Verify soundEnabled and musicEnabled independently
- [ ] `P14-14` Verify volume changes apply live
- [ ] `P14-15` Verify reduced-motion does not disable essential audio feedback
- [ ] `P14-16` Balance simultaneous voice count
- [ ] `P14-17` Prevent repetitive auto-attack fatigue
- [ ] `P14-18` Add world-specific music switching
- [ ] `P14-19` Add boss-specific music switching

## PHASE 15 — QA Rebuild

**Priority:** P0–P2

- [ ] `P15-01` Run full unit suite on current HEAD
- [ ] `P15-02` Run full build on current HEAD
- [ ] `P15-03` Run E2E on current HEAD
- [ ] `P15-04` Record failures instead of trusting historical reports
- [ ] `P15-05` Add save aggregate integration suite
- [ ] `P15-06` Add reload integration suite
- [ ] `P15-07` Add rebirth integration suite
- [ ] `P15-08` Add modifier lifecycle integration suite
- [x] `P15-09` Add six-domain navigation suite
- [ ] `P15-10` Add asset resolver suite
- [ ] `P15-11` Add hardcoded localization suite
- [ ] `P15-12` Add production debug-leak suite
- [ ] `P15-13` Add first-60-min scripted playtest
- [ ] `P15-14` Add late-game seeded playtest
- [ ] `P15-15` Add 390x844 visual QA checklist
- [ ] `P15-16` Add 1366x768 visual QA checklist
- [ ] `P15-17` Add 1920x1080 visual QA checklist
- [ ] `P15-18` Add World 1 screenshot baselines
- [ ] `P15-19` Add boss screenshot baseline
- [ ] `P15-20` Add settlement screenshot baseline
- [ ] `P15-21` Add hero/team screenshot baselines
- [ ] `P15-22` Add no-horizontal-overflow checks
- [ ] `P15-23` Raise mobile tap target minimum to 44
- [ ] `P15-24` Add no-console-error checks
- [ ] `P15-25` Add production build smoke test
- [ ] `P15-26` Add Yandex platform smoke test
- [ ] `P15-27` Add ad failure fallback test
- [ ] `P15-28` Add cloud/local conflict test

## PHASE 16 — Cleanup & Release Candidate

**Priority:** P2

- [ ] `P16-01` Identify dead HomeScreen references
- [ ] `P16-02` Remove or archive obsolete HomeScreen after dependency check
- [ ] `P16-03` Archive stale phase reports
- [ ] `P16-04` Mark CURRENT_ARCHITECTURE stale or rewrite it
- [ ] `P16-05` Mark FEATURE_INVENTORY stale or rewrite it
- [ ] `P16-06` Remove obsolete navigation tests
- [ ] `P16-07` Remove unused translation keys
- [ ] `P16-08` Remove unused CSS selectors
- [ ] `P16-09` Remove unused SVG renderer paths after real assets land
- [ ] `P16-10` Remove obsolete debug scripts from release package
- [ ] `P16-11` Ensure package-release excludes audits/dev-only artifacts as intended
- [ ] `P16-12` Generate current architecture document
- [ ] `P16-13` Generate current feature inventory
- [ ] `P16-14` Generate current save schema document
- [ ] `P16-15` Generate release checklist
- [ ] `P16-16` Run final fresh-save playthrough
- [ ] `P16-17` Run final migrated-save playthrough
- [ ] `P16-18` Run final rebirth playthrough
- [ ] `P16-19` Run final mobile QA
- [ ] `P16-20` Run final desktop QA
- [ ] `P16-21` Run final Yandex QA
- [ ] `P16-22` Confirm no P0 open
- [ ] `P16-23` Confirm no P1 release blockers open
- [ ] `P16-24` Create release candidate build

## Global release gates

- [ ] **Gate A — Persistence:** every owned/progress state survives reload.
- [ ] **Gate B — Rebirth:** reset/preserve semantics are deterministic and tested.
- [ ] **Gate C — Navigation:** six-domain IA is coherent on mobile and desktop.
- [ ] **Gate D — Identity:** no accidental xianxia/anime-clicker product identity remains in player-facing core.
- [ ] **Gate E — Art:** world/enemy/class/pet identity resolves to correct production assets.
- [ ] **Gate F — Localization:** EN/RU player paths contain no unintended hardcoded language.
- [ ] **Gate G — Production safety:** no cheats/dev overlay/debug controls in release build.
- [ ] **Gate H — QA:** build, unit, integration, E2E and visual QA pass current HEAD.
- [ ] **Gate I — Yandex:** platform, cloud save, ads and lifecycle smoke tests pass.
- [ ] **Gate J — Release candidate:** no open P0 and no release-blocking P1.

## Task count

**Concrete checklist tasks:** 497 (including status/evidence checklists and global gates).
