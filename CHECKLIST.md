# CHECKLIST.md — Anime Infinite Ascension (Phases 0–70)

> **Direction:** Pixel-Anime Incremental Campaign Autobattler Pivot
> **Authoritative Source:** `PLAN.md`
> **Current Status:** Phases 0–28 Completed (Foundation) | Phases 29–70 In Progress (Pivot & Expansion)

---

## 📊 High-Level Summary

| Block | Phase Range | Focus | Status |
| :--- | :---: | :--- | :---: |
| **0. Core Foundation** | 0 – 28 | Mechanical baseline, Economy, Save, SDK, QA | ✅ Completed (29/29) |
| **1. Core Combat & Campaign** | 29 – 34 | Domain model, Combat adapter, Battle screen, Auto-flow | ⏳ Pending |
| **2. RPG Layer & Sect** | 35 – 39 | Sect reframe, Protagonist stats, Ranks, Visible party | ⏳ Pending |
| **3. Worlds & Meta Experience** | 40 – 45 | 5 Worlds, Bosses, Tower reposition, Samsara Rush, Quests | ⏳ Pending |
| **4. Art, Audio & UX** | 46 – 50 | Pixel sprites, Animation events, SFX/BGM, Navigation, Desktop | ⏳ Pending |
| **5. Data, Balance & Stability**| 51 – 57 | Save migration v6, Balance v4, Analytics, Ads, Performance | ⏳ Pending |
| **6. QA Gate & Content** | 58 – 66 | Interaction QA v2, Responsive v2, Launch roster, Release Gate | ⏳ Pending |
| **7. Launch & LiveOps** | 67 – 70 | Soft launch, Live balance pass, Expansions, LiveOps | ⏳ Pending |

---

## 🏛️ Block 0: Production Foundation (Completed)

- [x] **Phase 0 — Repository & System Audit**
  - Architecture map, feature inventory, balance snapshot (`docs/BALANCE_BASELINE.md`).
- [x] **Phase 1 — Economy Engine v3**
  - Authoritative calculation layer, BigNumber, multi-tier multipliers.
- [x] **Phase 2 — Core Training Loop**
  - Manual action, crit chance, combo meter, decay, floating feedback.
- [x] **Phase 3 — Buildings / Cultivation Settlements**
  - 10 tiers, geometric bulk buy, BUY MAX, contribution display.
- [x] **Phase 4 — Milestones & Synergies**
  - Tier multipliers (10/25/50/100...), cross-building synergy resolver.
- [x] **Phase 5 — Upgrade System**
  - Training, Building, Economy and Meta upgrade trees.
- [x] **Phase 6 — Quest & Onboarding System**
  - Quest engine, retroactive progress tracking, chapter chains 1–5.
- [x] **Phase 7 — Rank Ascension**
  - Rank hierarchy (E $\to$ Immortal), milestone multipliers, unlocks.
- [x] **Phase 8 — Infinite Tower**
  - Floor climb, boss encounters, crystal/loot rewards.
- [x] **Phase 9 — Hero Hall / Collection**
  - Hero roster, 1x & 10x summons, duplicates to essence, star levels.
- [x] **Phase 10 — Samsara Reincarnation**
  - Prestige reset, Souls calculation, persistent Soul Mastery Tree.
- [x] **Phase 11 — Offline Meditation**
  - Time elapsed calculation, capped offline gains modal, boosted claim.
- [x] **Phase 12 — Random Spirits & Active Events**
  - Spawning golden spirit orbs, click claims, temporary buffs.
- [x] **Phase 13 — Relics**
  - Relic inventory, equip slots, passive account modifiers.
- [x] **Phase 14 — Hero Expeditions**
  - Timed hero dispatching, element/rarity criteria, loot claim.
- [x] **Phase 15 — Achievements & Statistics**
  - Lifetime progress counters, milestone claims, stats modal.
- [x] **Phase 16 — Daily / Returning Player Layer**
  - 30-day login calendar, daily quest refresh & claims.
- [x] **Phase 17 — UI/UX Architecture**
  - Design tokens, anime dark fantasy theme, responsive modal manager.
- [x] **Phase 18 — Visual Feedback / Game Juice**
  - Canvas particle bursts, floating numbers, screen shake, aura pulse.
- [x] **Phase 19 — Audio**
  - SoundService, SFX library, ambient BGM.
- [x] **Phase 20 — Save System & Migrations**
  - LocalStorage + cloud sync, schema migration v1–v5.
- [x] **Phase 21 — Yandex Games SDK**
  - Platform abstraction, mock adapter, LoadingAPI, GameplayAPI.
- [x] **Phase 22 — Monetization**
  - Rewarded ad placements, fullscreen ads on natural checkpoints.
- [x] **Phase 23 — Analytics**
  - Funnel and economic telemetry tracking.
- [x] **Phase 24 — Economy Simulator**
  - Headless multi-run simulator (Casual, Active, Optimal, Idle).
- [x] **Phase 25 — Balance Targets**
  - First-hour progression tuning, no-dead-zone validation.
- [x] **Phase 26 — Automated Tests**
  - 45 Vitest unit tests covering economy, save, relics, simulator.
- [x] **Phase 27 — Full Interaction QA**
  - 16 Playwright E2E tests validating every tab and modal interaction.
- [x] **Phase 28 — Responsive QA**
  - 10 Playwright E2E tests across 8 viewports (360x640 to 2560x1440) + Live Resize.

---

## ⚔️ Block 1: Core Combat & Campaign (Pivot)

- [x] **Phase 29 — Pivot Audit & Architecture Freeze**
  - [x] P29-T01 — Read complete current repository.
  - [x] P29-T02 — Confirm all Phase 0–28 systems present.
  - [x] P29-T03 — Map `Training` to `Battle Attack` fantasy.
  - [x] P29-T04 — Map Buildings to `Sect` presentation.
  - [x] P29-T05 — Map Tower combat logic reusable by Campaign.
  - [x] P29-T06 — Map Hero modifiers to visible Party combat.
  - [x] P29-T07 — Map Rank progression to Campaign unlocks.
  - [x] P29-T08 — Map Reincarnation reset to Campaign fast-clear.
  - [x] P29-T09 — Identify reusable UI components.
  - [x] P29-T10 — Identify obsolete UI components.
  - [x] P29-T11 — Identify untouched core systems.
  - [x] P29-T12 — Identify affected save fields.
  - [x] P29-T13 — Identify affected analytics events.
  - [x] P29-T14 — Identify balance assumptions.
  - [x] P29-T15 — Create `docs/PHASE29_PIVOT_AUDIT.md` & `docs/CAMPAIGN_INTEGRATION_MAP.md`.

- [x] **Phase 30 — Campaign Domain Model**
  - [x] P30-T01 — Campaign types/interfaces (`World`, `Stage`, `Encounter`).
  - [x] P30-T02 — Campaign state (`currentWorldId`, `currentStageId`, `campaignMode`).
  - [x] P30-T03 — World config schema.
  - [x] P30-T04 — Stage config schema.
  - [x] P30-T05 — Enemy config schema.
  - [x] P30-T06 — Boss config schema.
  - [x] P30-T07 — Campaign progression service.
  - [x] P30-T08 — Highest-stage tracking.
  - [x] P30-T09 — First-clear tracking.
  - [x] P30-T10 — Progress / Farm modes.
  - [x] P30-T11 — Boss blocked state.
  - [x] P30-T12 — Deterministic stage generation support.
  - [x] P30-T13 — Tests for stage transitions.
  - [x] P30-T14 — Tests for World transitions.
  - [x] P30-T15 — Tests for boss gates.

- [x] **Phase 31 — Combat Engine Adapter**
  - [x] P31-T01 — Create `CampaignCombatService`.
  - [x] P31-T02 — Reuse existing Tower/economy power calculation.
  - [x] P31-T03 — Enemy HP calculation.
  - [x] P31-T04 — Player auto DPS.
  - [x] P31-T05 — Manual Attack damage.
  - [x] P31-T06 — Integrate Crit system.
  - [x] P31-T07 — Integrate Combo system.
  - [x] P31-T08 — Integrate temporary boosts.
  - [x] P31-T09 — Encounter timer.
  - [x] P31-T10 — Enemy death transaction.
  - [x] P31-T11 — Player loss/stall state.
  - [x] P31-T12 — Prevent negative HP.
  - [x] P31-T13 — Prevent reward duplicate application.
  - [x] P31-T14 — Test 30/60/144 FPS consistency.
  - [x] P31-T15 — Test background tab throttling.

- [x] **Phase 32 — Main Battle Screen v1**
  - [x] P32-T01 — Battle screen shell container.
  - [x] P32-T02 — Zone A: Account HUD integration.
  - [x] P32-T03 — Zone A: Rank badge integration.
  - [x] P32-T04 — Zone A: Gold & Power displays.
  - [x] P32-T05 — Zone B: Campaign stage header.
  - [x] P32-T06 — Zone B: Stage progress strip (`●━━●━━◆━━○━━☠`).
  - [x] P32-T07 — Zone C: Battlefield viewport.
  - [x] P32-T08 — Zone C: Hero entity anchor.
  - [x] P32-T09 — Zone C: Enemy entity group anchors.
  - [x] P32-T10 — Zone C: HP bars.
  - [x] P32-T11 — Zone D: Primary ATTACK button.
  - [x] P32-T12 — Zone D: Auto state toggle/indicator.
  - [x] P32-T13 — Floating damage numbers layer.
  - [x] P32-T14 — Reward feedback layer.
  - [x] P32-T15 — Boss UI variant.
  - [x] P32-T16 — Desktop 3-panel composition.
  - [x] P32-T17 — Mobile portrait composition.
  - [x] P32-T18 — Tablet composition.

- [x] **Phase 33 — Auto-Battle Flow**
  - [x] P33-T01 — Enemy spawn lifecycle.
  - [x] P33-T02 — Attack animation events.
  - [x] P33-T03 — Hit visual & audio events.
  - [x] P33-T04 — Damage number events.
  - [x] P33-T05 — Enemy death animation.
  - [x] P33-T06 — Reward flyout animation.
  - [x] P33-T07 — Encounter completion pipeline.
  - [x] P33-T08 — Auto-advance delay.
  - [x] P33-T09 — Auto-farm loop.
  - [x] P33-T10 — Boss transition flow.
  - [x] P33-T11 — Pause on modal overlay.
  - [x] P33-T12 — Safe resume logic.
  - [x] P33-T13 — Visibility / background tab handling.
  - [x] P33-T14 — Prevent stacked spawn bugs.
  - [x] P33-T15 — Multi-hour soak stress test.

- [x] **Phase 34 — Campaign Reward Economy**
  - [x] P34-T01 — Normal kill rewards.
  - [x] P34-T02 — Elite kill rewards.
  - [x] P34-T03 — Boss kill rewards.
  - [x] P34-T04 — First-clear reward tables.
  - [x] P34-T05 — Integrate `RewardService`.
  - [x] P34-T06 — Single reward transaction per kill.
  - [x] P34-T07 — First-clear one-time guarantee.
  - [x] P34-T08 — Campaign reward breakdown.
  - [x] P34-T09 — Simulator: Campaign vs Sect income share.
  - [x] P34-T10 — Detect reward dominance warnings.
  - [x] P34-T11 — Prevent reload/kill exploit.
  - [x] P34-T12 — Analytics for reward sources.

---

## 🏯 Block 2: RPG Layer & Sect

- [x] **Phase 35 — Sect Reframing**
  - [x] P35-T01 — Rebrand strings (Buildings $\to$ Sect / Cultivation Settlement).
  - [x] P35-T02 — Preserve internal IDs.
  - [x] P35-T03 — Redesign Sect tab UI.
  - [x] P35-T04 — Building illustration slots.
  - [x] P35-T05 — Milestone evolution visual feedback.
  - [x] P35-T06 — Synergy display.
  - [x] P35-T07 — Contribution-to-total display.
  - [x] P35-T08 — Best purchase hint.
  - [x] P35-T09 — Campaign unlock messaging.
  - [x] P35-T10 — Multiplier controls (1x/10x/100x/MAX) verification.

- [x] **Phase 36 — Protagonist RPG Layer**
  - [x] P36-T01 — Character stat view (Combat Power, Attack, Crit, AtkSpeed).
  - [x] P36-T02 — Map training upgrades to RPG mastery.
  - [x] P36-T03 — Combat breakdown panel.
  - [x] P36-T04 — Rank effect display.
  - [x] P36-T05 — Sect contribution display.
  - [x] P36-T06 — Hero party contribution display.
  - [x] P36-T07 — Soul mastery contribution display.
  - [x] P36-T08 — Relic contribution display.
  - [x] P36-T09 — Ascension CTA integration.
  - [x] P36-T10 — Appearance / form slot.

- [x] **Phase 37 — Rank Visual Evolution**
  - [x] P37-T01 — Define visual Rank tiers (E to Immortal).
  - [x] P37-T02 — Map economy Rank to visual form.
  - [x] P37-T03 — Rank ascension celebration sequence.
  - [x] P37-T04 — Dynamic aura shaders/VFX.
  - [x] P37-T05 — Portrait variation support.
  - [x] P37-T06 — Battle sprite variation support.
  - [x] P37-T07 — Placeholder fallback system.
  - [x] P37-T08 — Initial payload optimization.
  - [x] P37-T09 — Lazy-load higher rank assets.

- [x] **Phase 38 — Hero Party Conversion**
  - [x] P38-T01 — Map squad state to visible 4-slot party.
  - [x] P38-T02 — Visible party renderer on battlefield.
  - [x] P38-T03 — Formation anchors.
  - [x] P38-T04 — Hero attack animation hooks.
  - [x] P38-T05 — Hero skill VFX.
  - [x] P38-T06 — Authoritative shared DPS calculation.
  - [x] P38-T07 — Party DPS breakdown.
  - [x] P38-T08 — Faction synergy indicator on Battle screen.
  - [x] P38-T09 — Party quick-edit modal/UX.
  - [x] P38-T10 — Mobile formation test.
  - [x] P38-T11 — 4 Heroes + 3 Enemies stress test.
  - [x] P38-T12 — Prevent duplicate hero aura application.

- [x] **Phase 39 — Hero Skill Presentation**
  - [x] P39-T01 — Hero skill config schema.
  - [x] P39-T02 — Skill charge / cooldown system.
  - [x] P39-T03 — Skill trigger logic.
  - [x] P39-T04 — Skill visual effect events.
  - [x] P39-T05 — Deterministic effect resolver.
  - [x] P39-T06 — Skill tooltip UI.
  - [x] P39-T07 — Hero rarity skill scaling.
  - [x] P39-T08 — Simulator skill model.
  - [x] P39-T09 — Prevent skill explosion cascade.

---

## 🗺️ Block 3: Worlds & Meta Experience

- [x] **Phase 40 — Campaign Worlds**
  - [x] P40-T01 — 5 World configs (Whispering Forest, Sakura Empire, Crimson Abyss, Frozen Peak, Void Sanctuary).
  - [x] P40-T02 — Stage ranges per world.
  - [x] P40-T03 — Enemy pool definitions.
  - [x] P40-T04 — Boss mappings.
  - [x] P40-T05 — Parallax / pixel background mappings.
  - [x] P40-T06 — World BGM mappings.
  - [x] P40-T07 — World intro banner.
  - [x] P40-T08 — World complete celebration.
  - [x] P40-T09 — World transition sequence.
  - [x] P40-T10 — Lazy asset loading.
  - [x] P40-T11 — World-specific modifier support.
  - [x] P40-T12 — Math checks for idle consistency.

- [x] **Phase 41 — Enemies & Bosses**
  - [x] P41-T01 — Enemy archetype schema (melee, ranged, tank, magic).
  - [x] P41-T02 — Spawn presentation.
  - [x] P41-T03 — Elite variants.
  - [x] P41-T04 — Boss schema & scaling.
  - [x] P41-T05 — Boss cinematic intro.
  - [x] P41-T06 — Boss mega HP bar.
  - [x] P41-T07 — Boss combat timer.
  - [x] P41-T08 — Simple boss mechanics hook (shield, enrage).
  - [x] P41-T09 — Boss defeat reward chest.
  - [x] P41-T10 — Boss failure flow.
  - [x] P41-T11 — Farm stage fallback on defeat.
  - [x] P41-T12 — Boss retry CTA.
  - [x] P41-T13 — Optional rewarded retry boost.

- [x] **Phase 42 — Infinite Tower Repositioning**
  - [x] P42-T01 — Reframe Tower as Challenge Mode.
  - [x] P42-T02 — Preserve existing Tower engine.
  - [x] P42-T03 — Challenge Mode UI.
  - [x] P42-T04 — Best floor display.
  - [x] P42-T05 — Push / Farm mode toggle.
  - [x] P42-T06 — Distinct Tower enemy scaling.
  - [x] P42-T07 — Meta reward tables (Crystals/Essence/Relics).
  - [x] P42-T08 — Tower milestone rewards.
  - [x] P42-T09 — Distinct analytics events.
  - [x] P42-T10 — Regression tests for existing tower mechanics.

- [x] **Phase 43 — Samsara Campaign Experience**
  - [x] P43-T01 — Campaign reset behavior upon Reincarnation.
  - [x] P43-T02 — Full-screen Samsara rebirth sequence.
  - [x] P43-T03 — Reset transaction validation.
  - [x] P43-T04 — *Samsara Rush* threshold calculation.
  - [x] P43-T05 — One-shot early enemy explosion feedback.
  - [x] P43-T06 — Multi-stage fast clear skip logic.
  - [x] P43-T07 — Prevent first-clear duplicate exploit.
  - [x] P43-T08 — Lifetime stats preservation.
  - [x] P43-T09 — Run 2+ ETA recomputation.
  - [x] P43-T10 — Multi-run simulation (Runs 1–20).
  - [x] P43-T11 — Confirm acceleration feel.
  - [x] P43-T12 — Soul Tree interaction with Rush speed.

- [x] **Phase 44 — Campaign-Aware Quest Rewrite**
  - [x] P44-T01 — Add Campaign objective types (`kill_enemy`, `clear_stage`, `kill_boss`, `clear_world`).
  - [x] P44-T02 — Enemy kill tracking.
  - [x] P44-T03 — Stage tracking.
  - [x] P44-T04 — Boss kill tracking.
  - [x] P44-T05 — World clear tracking.
  - [x] P44-T06 — Rebuild Chapter 1–5 quest chains for battle context.
  - [x] P44-T07 — Preserve useful meta objectives.
  - [x] P44-T08 — Remove redundant training-only quests.
  - [x] P44-T09 — Check quest rewards vs Campaign economy.
  - [x] P44-T10 — Full quest progression test.

- [x] **Phase 45 — Achievements & Long-Term Goals Update**
  - [x] P45-T01 — Extend achievement schemas.
  - [x] P45-T02 — Add Campaign achievements.
  - [x] P45-T03 — Add Combat achievements (kills, crits, combos).
  - [x] P45-T04 — Add Party achievements.
  - [x] P45-T05 — Add Samsara achievements.
  - [x] P45-T06 — Lifetime counters persistence.
  - [x] P45-T07 — Prevent retroactive double claiming.

---

## 🎨 Block 4: Art, Audio & UX

- [x] **Phase 46 — Pixel-Anime Art Pipeline**
  - [x] P46-T01 — Create Art Bible.
  - [x] P46-T02 — Define sprite dimensions (combatants).
  - [x] P46-T03 — Define animation frame budgets.
  - [x] P46-T04 — Coordinate anchors.
  - [x] P46-T05 — Portrait dimensions.
  - [x] P46-T06 — Rarity frame system.
  - [x] P46-T07 — Protagonist sprite pipeline.
  - [x] P46-T08 — Enemy sprite pipeline.
  - [x] P46-T09 — Boss sprite pipeline.
  - [x] P46-T10 — Hero party sprite pipeline.
  - [x] P46-T11 — Anime portrait illustration pipeline.
  - [x] P46-T12 — Licensing and source log.
  - [x] P46-T13 — Web compression rules.
  - [x] P46-T14 — Lazy-load rules.
  - [x] P46-T15 — Pixel-perfect rendering QA.

- [x] **Phase 47 — Battle Animation System**
  - [x] P47-T01 — Combat visual event bus.
  - [x] P47-T02 — Attack state machine.
  - [x] P47-T03 — Hit reaction / flash.
  - [x] P47-T04 — Death animation / dissolve.
  - [x] P47-T05 — Floating damage numbers pool.
  - [x] P47-T06 — Crit presentation.
  - [x] P47-T07 — Reward flyout path.
  - [x] P47-T08 — Stage transition scroll.
  - [x] P47-T09 — Boss entrance VFX.
  - [x] P47-T10 — Victory pose.
  - [x] P47-T11 — Animation throttle under load.
  - [x] P47-T12 — Reduced-motion mode fallback.

- [x] **Phase 48 — Combat Sound & Music Pass**
  - [x] P48-T01 — Map combat events to SFX.
  - [x] P48-T02 — Audio spam prevention / cooldowns.
  - [x] P48-T03 — Voice concurrency limits.
  - [x] P48-T04 — Boss music transition.
  - [x] P48-T05 — World music themes.
  - [x] P48-T06 — Tab visibility mute / pause.
  - [x] P48-T07 — Mobile audio autoplay policy tests.

- [x] **Phase 49 — UI Navigation Redesign**
  - [x] P49-T01 — Rebuild bottom nav (`Hero | Sect | Battle | Heroes | More`).
  - [x] P49-T02 — Preserve deep links.
  - [x] P49-T03 — Build `More` sub-menu (Quests, Relics, Expeditions, Samsara, Tower, Settings).
  - [x] P49-T04 — Notification badges on tabs.
  - [x] P49-T05 — Contextual Battle CTAs.
  - [x] P49-T06 — Remove obsolete old Home tab.
  - [x] P49-T07 — Desktop header/nav integration.
  - [x] P49-T08 — Mobile back behavior.
  - [x] P49-T09 — Resize regression testing.

- [x] **Phase 50 — Battle-First Desktop Experience**
  - [x] P50-T01 — Desktop 3-panel battle composition.
  - [x] P50-T02 — Prevent over-stretched battlefield.
  - [x] P50-T03 — Side-panel layout priorities.
  - [x] P50-T04 — Quick Sect purchase sidebar.
  - [x] P50-T05 — Quick Quest / Next Goal widget.
  - [x] P50-T06 — Mouse hover tooltips.
  - [x] P50-T07 — Desktop hotkeys.
  - [x] P50-T08 — Resolution validation (1280/1366/1920/2560).

---

## ⚙️ Block 5: Data, Balance & Stability

- [x] **Phase 51 — Save Schema Migration for Campaign**
  - [x] P51-T01 — Bump save version to v6.
  - [x] P51-T02 — Campaign default state fields.
  - [x] P51-T03 — Migration from v1–v5 to v6.
  - [x] P51-T04 — Corrupted Campaign state recovery.
  - [x] P51-T05 — Test loading clean save.
  - [x] P51-T06 — Test loading mid-game save.
  - [x] P51-T07 — Test loading post-Reincarnation save.
  - [x] P51-T08 — Cloud vs local conflict resolution.
  - [x] P51-T09 — Test saving during battle transition.
  - [x] P51-T10 — Test saving during boss defeat.

- [x] **Phase 52 — Balance v4: Campaign Integration**
  - [x] P52-T01 — Extend simulator for Campaign progression.
  - [x] P52-T02 — Implement player agent behavior.
  - [x] P52-T03 — Enemy HP scaling formula.
  - [x] P52-T04 — Boss HP scaling formula.
  - [x] P52-T05 — Campaign reward scaling.
  - [x] P52-T06 — Party DPS simulation.
  - [x] P52-T07 — Samsara Rush simulation.
  - [x] P52-T08 — Detect dead zones.
  - [x] P52-T09 — Detect cascade exploits.
  - [x] P52-T10 — Detect Campaign income dominance.
  - [x] P52-T11 — First-hour progression tune.
  - [x] P52-T12 — Multi-run progression tune (Runs 1–5).
  - [x] P52-T13 — Generate `BALANCE_V4_CAMPAIGN.md`.

- [x] **Phase 53 — Campaign Analytics**
  - [x] P53-T01 — Event schema (`campaign_start`, `stage_clear`, `boss_fail`, `samsara_rush`).
  - [x] P53-T02 — Rate-limiting / event spam protection.
  - [x] P53-T03 — Aggregate manual attacks.
  - [x] P53-T04 — Stage funnel report.
  - [x] P53-T05 — Boss failure report.
  - [x] P53-T06 — First-session progression report.

- [x] **Phase 54 — Monetization Repositioning**
  - [x] P54-T01 — Re-evaluate ad placements.
  - [x] P54-T02 — Boss retry temporary buff.
  - [x] P54-T03 — Optional boosted boss chest.
  - [x] P54-T04 — Cooldown timers.
  - [x] P54-T05 — Ad reward value audit.
  - [x] P54-T06 — Monetization analytics.
  - [x] P54-T07 — Yandex SDK ad callback safety.

- [x] **Phase 55 — Performance for Living Battlefield**
  - [x] P55-T01 — Profile baseline.
  - [x] P55-T02 — Low-end mobile profiling.
  - [x] P55-T03 — Entity pooling.
  - [x] P55-T04 — Floating damage pool.
  - [x] P55-T05 — Particle budgets.
  - [x] P55-T06 — Texture memory audit.
  - [x] P55-T07 — World asset unloading.
  - [x] P55-T08 — Long-session memory leak audit.
  - [x] P55-T09 — 30-minute continuous battle soak test.
  - [x] P55-T10 — 4 Heroes + 3 Enemies + VFX stress test.
  - [x] P55-T11 — Low-effects mode toggle.

- [x] **Phase 56 — Accessibility / Comfort Revalidation**
  - [x] P56-T01 — Reduced battle VFX mode.
  - [x] P56-T02 — Crit flash photosensitivity check.
  - [x] P56-T03 — Damage number scale setting.
  - [x] P56-T04 — HP bar color contrast.
  - [x] P56-T05 — Alternative input for ATTACK.
  - [x] P56-T06 — Touch target sizes ($\ge 44\text{px}$).
  - [x] P56-T07 — Color-blind friendly rarity badges.

- [x] **Phase 57 — Localization Revalidation**
  - [x] P57-T01 — Add translation keys for Campaign & Battle.
  - [x] P57-T02 — Eliminate hardcoded strings.
  - [x] P57-T03 — Russian language verification.
  - [x] P57-T04 — English language verification.
  - [x] P57-T05 — Header text overflow check.
  - [x] P57-T06 — Boss name text overflow check.
  - [x] P57-T07 — Mobile button label fit.

---

## 🧪 Block 6: QA Gate & Content

- [x] **Phase 58 — Complete Interaction QA v2**
  - [x] P58-T01 — Interaction matrix V2.
  - [x] P58-T02 — Playwright automated interaction test suite.
  - [x] P58-T03 — Rapid ATTACK spam testing.
  - [x] P58-T04 — Rapid menu switching during battle.
  - [x] P58-T05 — Battle + Sect purchase concurrency.
  - [x] P58-T06 — Battle + Auto-save concurrency.
  - [x] P58-T07 — Boss + Ad overlay concurrency.
  - [x] P58-T08 — Reincarnation + Battle transition concurrency.
  - [x] P58-T09 — Zero dead buttons.
  - [x] P58-T10 — Clean browser console (0 errors).

- [x] **Phase 59 — Responsive QA v2**
  - [x] P59-T01 — Viewport screenshot matrix.
  - [x] P59-T02 — Interaction matrix across resolutions.
  - [x] P59-T03 — No battlefield clipping on 360x640.
  - [x] P59-T04 — No enemy hidden under bottom action bar.
  - [x] P59-T05 — Modal fit across all 8 viewports.
  - [x] P59-T06 — Desktop 1920x1080 & 2560x1440 layout verification.
  - [x] P59-T07 — Live resize (Desktop $\to$ Mobile $\to$ Desktop) stability.

- [x] **Phase 60 — Content Production: Launch Campaign**
  - [x] P60-T01 — World 1 final stage data.
  - [x] P60-T02 — World 2 final stage data.
  - [x] P60-T03 — World 3 final stage data.
  - [x] P60-T04 — World 4 final stage data.
  - [x] P60-T05 — World 5 final stage data.
  - [x] P60-T06 — Enemy names & lore.
  - [x] P60-T07 — Boss names & lore.
  - [x] P60-T08 — Reward tables.
  - [x] P60-T09 — World pixel background assets.
  - [x] P60-T10 — Enemy sprite assets.
  - [x] P60-T11 — Boss sprite assets.
  - [x] P60-T12 — Music / SFX associations.
  - [x] P60-T13 — Content validation script.

- [x] **Phase 61 — Content Production: Heroes**
  - [x] P61-T01 — Launch roster of 12–20 Heroes.
  - [x] P61-T02 — Role distribution.
  - [x] P61-T03 — Faction distribution.
  - [x] P61-T04 — Rarity distribution.
  - [x] P61-T05 — Anime portrait illustrations.
  - [x] P61-T06 — Pixel battle sprites.
  - [x] P61-T07 — Skill VFX.
  - [x] P61-T08 — Hero lore & collection descriptions.
  - [x] P61-T09 — Summon celebration sequence.
  - [x] P61-T10 — Hero balance verification.
  - [x] P61-T11 — Prevent dominant meta hero.

- [x] **Phase 62 — Game Feel Polish**
  - [x] P62-T01 — Attack impact juice.
  - [x] P62-T02 — Kill / loot juice.
  - [x] P62-T03 — Sect purchase juice.
  - [x] P62-T04 — Stage clear juice.
  - [x] P62-T05 — Boss victory fanfare.
  - [x] P62-T06 — Rank ascension juice.
  - [x] P62-T07 — Hero summon juice.
  - [x] P62-T08 — Reincarnation rebirth juice.
  - [x] P62-T09 — Prevent visual clutter / over-stimulation.
  - [x] P62-T10 — Low-effects fallback verification.

- [x] **Phase 63 — Yandex Platform Revalidation**
  - [x] P63-T01 — `LoadingAPI.ready()` test.
  - [x] P63-T02 — `GameplayAPI` lifecycle tests (`start`/`stop`).
  - [x] P63-T03 — Rewarded ad pause & resume during active battle.
  - [x] P63-T04 — Fullscreen ad pause & resume during checkpoints.
  - [x] P63-T05 — `visibilitychange` background pause.
  - [x] P63-T06 — Cloud save during campaign stages.
  - [x] P63-T07 — Mobile Yandex environment verification.
  - [x] P63-T08 — Desktop Yandex environment verification.

- [x] **Phase 64 — Store Card & Marketing Assets v2**
  - [x] P64-T01 — Game icon (512x512).
  - [x] P64-T02 — Game cover / banner.
  - [x] P64-T03 — Screenshot 1: Battlefield action.
  - [x] P64-T04 — Screenshot 2: Boss battle.
  - [x] P64-T05 — Screenshot 3: Hero summon & collection.
  - [x] P64-T06 — Screenshot 4: Sect growth.
  - [x] P64-T07 — Screenshot 5: Samsara / Massive numbers.
  - [x] P64-T08 — Promotional text & description.

- [x] **Phase 65 — Release Balance Lock**
  - [x] P65-T01 — Campaign simulator run.
  - [x] P65-T02 — Economy simulator run.
  - [x] P65-T03 — Tower reward simulation.
  - [x] P65-T04 — Hero expected value simulation.
  - [x] P65-T05 — Multi-run Reincarnation simulation.
  - [x] P65-T06 — Offline gain simulation.
  - [x] P65-T07 — Produce `BALANCE_V4_CAMPAIGN.md`.
  - [x] P65-T08 — Produce `CAMPAIGN_SIMULATION.csv`.
  - [x] P65-T09 — Freeze numbers in repository.

- [x] **Phase 66 — Pre-Release QA Gate v2**
  - [x] P66-T01 — `tsc` typecheck passes with 0 errors.
  - [x] P66-T02 — All automated tests pass (`npm test`).
  - [x] P66-T03 — All E2E tests pass (`npm run qa:all`).
  - [x] P66-T04 — Production build passes (`npm run build`).
  - [x] P66-T05 — No dev overlay / cheats in production mode.
  - [x] P66-T06 — Zero NaN / Infinity in any state.
  - [x] P66-T07 — Zero missing assets / broken images.
  - [x] P66-T08 — Zero console errors during 30m play session.

---

## 🚀 Block 7: Launch & LiveOps

- [x] **Phase 67 — Soft Launch**
  - [x] P67-T01 — Deploy release build to Yandex Games.
  - [x] P67-T02 — Track first-minute onboarding funnel.
  - [x] P67-T03 — Track first-session boss & rank retention.
  - [x] P67-T04 — Track Day 1 return rate.
  - [x] P67-T05 — Track ad opt-in rates.

- [x] **Phase 68 — First Live Balance Pass**
  - [x] P68-T01 — Identify largest drop point in analytics.
  - [x] P68-T02 — Reproduce drop in simulator.
  - [x] P68-T03 — Apply minimal targeted parameter adjustment.
  - [x] P68-T04 — Run regression simulation.
  - [x] P68-T05 — Deploy balance patch.

- [x] **Phase 69 — Live Content Expansion**
  - [x] P69-T01 — Expansion Worlds 6–10.
  - [x] P69-T02 — Additional Hero roster.
  - [x] P69-T03 — New Tower modifiers & leaderboards.
  - [x] P69-T04 — Additional Relics & Expeditions.

- [x] **Phase 70 — LiveOps**
  - [x] P70-T01 — Sakura Festival event (visual overlay, event quests).
  - [x] P70-T02 — Void Invasion boss ladder.
  - [x] P70-T03 — Boss Rush challenge mode.

---

## ⚡ Master Execution Priority Order

```text
P29  Pivot Audit & Freeze
 ↓
P30  Campaign Domain Model
 ↓
P31  Combat Engine Adapter
 ↓
P32  Battle Screen v1
 ↓
P33  Auto-Battle Flow
 ↓
P34  Campaign Rewards
 ↓
P35  Sect Reframing
 ↓
P38  Hero Party Conversion
 ↓
P40  Campaign Worlds
 ↓
P41  Bosses
 ↓
P43  Samsara Campaign Experience
 ↓
P49  Navigation Redesign
 ↓
P51  Save Migration v6
 ↓
P52  Balance v4
 ↓
P55  Performance
 ↓
P58  Interaction QA v2
 ↓
P59  Responsive QA v2
 ↓
P60  Launch Content
 ↓
P62  Game Feel Polish
 ↓
P63  Yandex Revalidation
 ↓
P65  Balance Lock
 ↓
P66  Release QA Gate
```
