# PLAN.md — Anime Infinite Ascension

> **HISTORICAL — NOT THE ACTIVE ROADMAP.**
> Current implementation authority is `docs/ULTRA_MASTER_PLAN.md`; precedence and evidence rules are defined in `docs/PROJECT_GOVERNANCE.md`.
> Keep this file only as historical design/context unless an active roadmap task explicitly references it.

## Continuation: Phase 29+ — Pixel-Anime Campaign Autobattler Pivot

> **Project state:** Phases 0–28 are considered completed.
>
> **This document starts from Phase 29.**
>
> It does NOT re-plan or re-implement the already completed economy, save, Yandex SDK, quests, buildings, heroes, reincarnation, simulator, automated tests, interaction QA, or responsive foundation unless a new Phase explicitly requires adapting an existing system.
>
> **New direction:** transform the current Anime Incremental RPG into a visually readable **Pixel-Anime Incremental Autobattler**, where the main screen is an always-living campaign battle rather than a static training dashboard.
>
> The game must still preserve the strongest parts of the existing project:
>
> - incremental economy;
> - Buildings / Sect economy;
> - Upgrades;
> - Ranks;
> - Heroes;
> - Summon;
> - Infinite Tower;
> - Samsara Reincarnation;
> - Soul Tree;
> - Offline progress;
> - Quests;
> - Achievements;
> - Relics;
> - Expeditions;
> - Yandex Games integration;
> - analytics;
> - economy simulator;
> - responsive support.
>
> The goal of Phase 29+ is **not to restart development**, but to turn the completed mechanical foundation into a game that visually feels like an actual RPG adventure.

---

# PRODUCT PIVOT — LOCKED DIRECTION

The main fantasy becomes:

```text
I see my hero fighting
↓
I press ATTACK and help him
↓
he kills enemies automatically
↓
Gold / Power / loot numbers fly out
↓
I improve my Sect and character
↓
I clear stages
↓
I reach a boss
↓
I become stronger
↓
I unlock heroes and build a party
↓
I reach a new World / Rank
↓
I hit a wall
↓
I Reincarnate
↓
I return to World 1 absurdly stronger
↓
I fly through old stages
↓
I push further than before
```

The game should feel approximately like:

```text
Cookie Clicker economy
+
AFK-style meta progression
+
simple autobattler campaign
+
pixel-anime presentation
```

but must remain an original product.

Do NOT copy:

- another game's characters;
- exact pixel sprites;
- exact UI layout;
- icons;
- stage structure;
- names;
- visual composition one-to-one.

We take the **interaction philosophy**, not another game's assets.

---

# NEW PRIMARY GAME LOOP

The previous conceptual structure:

```text
TRAIN
→ Buildings
→ Rank
→ separate Tower
```

changes to:

```text
CAMPAIGN BATTLE
↓
AUTO ATTACK + PLAYER ATTACK
↓
ENEMY DEFEATED
↓
POWER + GOLD + LOOT
↓
BUILD SECT / BUY UPGRADES
↓
DPS INCREASES
↓
NEXT STAGE
↓
BOSS
↓
RANK / HERO / SYSTEM UNLOCK
↓
WORLD COMPLETION
↓
SAMSARA
```

Training remains mechanically relevant, but its fantasy is now expressed through **combat actions, character training upgrades, skills and Sect progression**.

---

# NEW SCREEN HIERARCHY

## Primary Screen — BATTLE

The Battle screen is now the game's home.

It must contain four visual zones.

### Zone A — Account HUD

Shows:

- avatar;
- protagonist name;
- current Rank;
- optional level/progression badge;
- Gold;
- Power / Combat Power;
- key meta currency when relevant;
- menu / notifications.

### Zone B — Campaign Progress

Shows:

- current World;
- current Stage;
- compact stage node/progress strip;
- next boss indicator;
- World boss indicator when close;
- optional Rank requirement / next major unlock.

Example:

```text
WORLD 2 — SAKURA EMPIRE

Stage 2-7

●━━●━━◆━━●━━○━━☠
```

### Zone C — Battlefield

The largest part of the screen.

Contains:

- pixel-art environment;
- protagonist / party;
- enemy group;
- HP bars;
- attacks;
- damage numbers;
- crit feedback;
- status/VFX;
- boss presentation;
- loot feedback.

### Zone D — Action / Navigation

Contains:

- primary ATTACK action;
- contextual reward preview;
- Auto mode state;
- boss attempt state;
- bottom navigation.

Mobile bottom navigation baseline:

```text
HERO
SECT
BATTLE
HEROES
MORE
```

`BATTLE` is the central/default tab.

---

# KEY EXPERIENCE RULE

At almost any moment on the main screen, **something must be visibly happening even if the player does nothing**:

- hero attacks;
- enemy attacks;
- damage appears;
- coins fly;
- stage progress changes;
- ability charges;
- aura animates;
- quest completes;
- next upgrade becomes affordable.

The game must never look like a static admin dashboard.

---

# PHASE 29 — PIVOT AUDIT & ARCHITECTURE FREEZE

## Goal

Before touching working systems, determine exactly how the completed Phase 0–28 architecture can support the new Campaign-first presentation.

No blind rewrite.

## Tasks

- [x] P29-T01 — Read the complete current repository.
- [x] P29-T02 — Confirm all Phase 0–28 systems currently present.
- [x] P29-T03 — Map current `Training` mechanics to the new `Battle Attack` fantasy.
- [x] P29-T04 — Map current Buildings to `Sect` presentation.
- [x] P29-T05 — Map current Tower combat logic that can be reused by Campaign.
- [x] P29-T06 — Map current Hero modifiers to visible Party combat.
- [x] P29-T07 — Map current Rank progression to Campaign unlocks.
- [x] P29-T08 — Map Reincarnation reset behavior to Campaign reset/fast-clear behavior.
- [x] P29-T09 — Identify UI components that can be reused.
- [x] P29-T10 — Identify UI components that should be retired.
- [x] P29-T11 — Identify systems that must remain untouched.
- [x] P29-T12 — Identify save fields affected by the Campaign pivot.
- [x] P29-T13 — Identify analytics events affected by the pivot.
- [x] P29-T14 — Identify balance assumptions affected by enemy kills and stage rewards.
- [x] P29-T15 — Create a migration map, not implementation yet.

## Deliverables

Create:

```text
docs/PHASE29_PIVOT_AUDIT.md
docs/CAMPAIGN_INTEGRATION_MAP.md
```

## Critical rule

Do not delete the existing Tower, Buildings, Training, Heroes or Reincarnation systems during this Phase.

We are introducing a new orchestration layer around them.

## Checkpoint 29

Before continuing, the project team must be able to answer:

1. Which existing engine calculates player power?
2. Which system currently calculates Tower combat?
3. Which systems can supply Campaign damage?
4. Which data survives Reincarnation?
5. What new state is actually required?
6. Which old UI becomes obsolete?
7. Can Campaign be added without duplicating economy formulas?

---

# PHASE 30 — CAMPAIGN DOMAIN MODEL

## Goal

Create a clean Campaign model independent of visual rendering.

Campaign is now the primary run progression.

## Campaign hierarchy

```text
Campaign
  World
    Stage
      Encounter
```

Recommended conceptual structure:

```text
World 1
  Stage 1-1
  Stage 1-2
  ...
  Stage 1-10 Boss

World 2
  Stage 2-1
  ...
```

Do not confuse displayed stage numbering with internal IDs.

## Required state

At minimum:

```text
currentWorldId
currentStageId
currentEncounter
highestWorldReached
highestStageReached
currentEnemyState
campaignMode
autoAdvance
bossRetryState
farmStage
```

## Campaign modes

### PROGRESS

Try to move forward automatically.

### FARM

Stay on a safe completed stage.

### BOSS_BLOCKED

Player cannot currently clear the boss.

### REINCARNATION_RUSH

Fast early-stage traversal after Prestige.

## Stage definition

Each Stage config should support:

```text
id
worldId
index
enemyPool
enemyCount / encounter pattern
difficulty
baseRewards
firstClearRewards
isBoss
bossId
unlockRequirements
specialModifiers
```

## Tasks

- [x] P30-T01 — Create Campaign types/interfaces.
- [x] P30-T02 — Create Campaign state.
- [x] P30-T03 — Create World config schema.
- [x] P30-T04 — Create Stage config schema.
- [x] P30-T05 — Create Enemy config schema.
- [x] P30-T06 — Create Boss config schema.
- [x] P30-T07 — Create Campaign progression service.
- [x] P30-T08 — Add highest-stage tracking.
- [x] P30-T09 — Add first-clear tracking.
- [x] P30-T10 — Add progress/farm mode.
- [x] P30-T11 — Add boss blocked state.
- [x] P30-T12 — Add deterministic stage generation support if desired.
- [x] P30-T13 — Tests for stage transitions.
- [x] P30-T14 — Tests for World transitions.
- [x] P30-T15 — Tests for boss gate transitions.

## Checkpoint 30

Campaign logic works headlessly without any pixel art.

---

# PHASE 31 — COMBAT ENGINE ADAPTER

## Goal

Use existing economy/Tower math rather than creating a second unrelated combat formula.

## Combat philosophy

The battle is visually rich but mathematically simple.

Under the hood:

```text
Party DPS
+
Manual Attack contribution
+
Skills / modifiers
vs
Enemy HP
```

We do NOT need:

- navigation mesh;
- physics combat;
- real-time enemy AI;
- complex collision systems;
- dozens of hitboxes.

## Player combat output

Campaign DPS should derive from existing game state.

Candidate architecture:

```text
BaseCombatPower
× RankCategory
× HeroCombatCategory
× SectCombatCategory
× UpgradeCategory
× SoulCategory
× RelicCategory
× TemporaryCategory
```

Do not invent a new uncontrolled exponential multiplier stack.

## Manual attack

The ATTACK button replaces the old purely abstract TRAIN experience.

When pressed:

```text
player strike animation
→ manualDamage
→ enemy HP decreases
→ Power/Training stats progress
→ combo feedback
```

Manual attack can still trigger:

- crit;
- combo;
- Spirit effects;
- quest progress.

## Auto attack

Auto attack must exist very early.

The game should become idle-capable rapidly.

Possible baseline:

```text
Start:
manual attack matters heavily

Within first 20–60 sec:
basic auto attack active

Later:
automation dominates
```

## Tasks

- [x] P31-T01 — Create CampaignCombatService.
- [x] P31-T02 — Reuse existing Tower/economy power calculation where possible.
- [x] P31-T03 — Add enemy HP calculation.
- [x] P31-T04 — Add player auto DPS.
- [x] P31-T05 — Add manual Attack damage.
- [x] P31-T06 — Integrate existing Crit.
- [x] P31-T07 — Integrate existing Combo.
- [x] P31-T08 — Integrate temporary boosts.
- [x] P31-T09 — Add encounter timer.
- [x] P31-T10 — Add enemy death transaction.
- [x] P31-T11 — Add player loss/stall state.
- [x] P31-T12 — Prevent negative enemy HP issues.
- [x] P31-T13 — Prevent multi-kill reward duplication.
- [x] P31-T14 — Test 30/60/144 FPS consistency.
- [x] P31-T15 — Test background tab throttling.

## Checkpoint 31

A headless hero can automatically defeat Campaign enemies using actual game economy values.

---

# PHASE 32 — MAIN BATTLE SCREEN V1

## Goal

Replace the static-home feeling with a visibly alive battlefield.

This Phase uses placeholders if final pixel assets do not yet exist.

## Mobile layout baseline

```text
┌─────────────────────────────┐
│ AVATAR  NAME        GOLD    │
│ RANK / XP           POWER   │
├─────────────────────────────┤
│        STAGE 1-7            │
│   ●━━●━━◆━━○━━○━━☠        │
├─────────────────────────────┤
│                             │
│       BATTLEFIELD           │
│                             │
│ HERO          ENEMIES       │
│ ███           ███ ███       │
│                             │
│    124   CRIT!  583         │
│                             │
├─────────────────────────────┤
│ +Gold     [ ⚔ ATTACK ]      │
├─────────────────────────────┤
│ Hero Sect Battle Heroes More│
└─────────────────────────────┘
```

## Desktop layout

Do NOT display a narrow phone rectangle in the center.

Desktop expands the battle.

Candidate layout:

```text
┌──────────────┬─────────────────────────────┬───────────────┐
│ HERO / PARTY │                             │ QUEST / NEXT  │
│ QUICK INFO   │        BATTLEFIELD          │ UPGRADES      │
│              │                             │               │
│              │     Campaign Stage          │ REWARDS       │
├──────────────┴─────────────────────────────┴───────────────┤
│                 contextual actions                         │
└────────────────────────────────────────────────────────────┘
```

## Tasks

- [x] P32-T01 — Create Battle screen shell.
- [x] P32-T02 — Integrate Account HUD.
- [x] P32-T03 — Integrate Rank.
- [x] P32-T04 — Integrate Gold/Power display.
- [x] P32-T05 — Integrate Campaign stage header.
- [x] P32-T06 — Create stage progress strip.
- [x] P32-T07 — Create battlefield viewport.
- [x] P32-T08 — Add hero placeholder entity.
- [x] P32-T09 — Add enemy placeholder entities.
- [x] P32-T10 — Add HP bars.
- [x] P32-T11 — Add ATTACK button.
- [x] P32-T12 — Add Auto state indicator.
- [x] P32-T13 — Add floating damage layer.
- [x] P32-T14 — Add reward feedback layer.
- [x] P32-T15 — Add boss UI variant.
- [x] P32-T16 — Responsive desktop composition.
- [x] P32-T17 — Responsive mobile composition.
- [x] P32-T18 — Tablet composition.

## UX rule

The battlefield receives visual priority over menus.

## Checkpoint 32

A user opening the game immediately understands:

> My character is fighting through stages.

---

# PHASE 33 — AUTO-BATTLE FLOW

## Goal

Make watching the game enjoyable even without interaction.

## Normal enemy flow

```text
enemy spawn
↓
hero auto-attacks
↓
damage numbers
↓
enemy dies
↓
reward flies to HUD
↓
brief transition
↓
next enemy
```

## Recommended pacing

Normal enemies should generally die fast when the player is appropriately powered.

Avoid 25-second sponge enemies as normal progression.

Target during healthy progression:

```text
normal enemy:
~1–4 sec

elite:
~3–8 sec

boss:
meaningful encounter
```

Exact values are balance-driven.

## Enemy group presentation

Visually support:

- 1 enemy;
- 2 enemies;
- 3 enemies;
- elite;
- boss.

Mathematically they may resolve through aggregate HP if necessary.

## Tasks

- [x] P33-T01 — Enemy spawn lifecycle.
- [x] P33-T02 — Attack animation events.
- [x] P33-T03 — Hit events.
- [x] P33-T04 — Damage number events.
- [x] P33-T05 — Enemy death animation.
- [x] P33-T06 — Reward animation.
- [x] P33-T07 — Encounter completion.
- [x] P33-T08 — Auto-advance delay.
- [x] P33-T09 — Auto-farm behavior.
- [x] P33-T10 — Boss transition.
- [x] P33-T11 — Pause when modal overlay requires it.
- [x] P33-T12 — Resume safely.
- [x] P33-T13 — Visibility/background behavior.
- [x] P33-T14 — Prevent stacked spawn bugs.
- [x] P33-T15 — Stress-test hours of auto battle.

---

# PHASE 34 — CAMPAIGN REWARD ECONOMY

## Goal

Campaign rewards reinforce the existing economy without destroying Buildings/Sect value.

## Important principle

Kills must feel rewarding, but Campaign must NOT become an infinite reward engine that makes the entire Sect economy irrelevant.

## Reward families

Normal enemies may provide:

- Gold;
- Power/Qi;
- minor temporary drops.

Bosses may provide:

- larger Gold;
- Crystals;
- Essence;
- first-clear chest;
- Relic chance later;
- unlock items if needed.

## Reward separation

### Repeatable rewards

Must be controlled.

### First-clear rewards

Can be much more generous.

### Boss rewards

Meaningful but rate-limited naturally by progression.

## Tasks

- [x] P34-T01 — Define normal kill rewards.
- [x] P34-T02 — Define elite rewards.
- [x] P34-T03 — Define boss rewards.
- [x] P34-T04 — Define first-clear reward tables.
- [x] P34-T05 — Integrate existing RewardService.
- [x] P34-T06 — Ensure one reward transaction per kill.
- [x] P34-T07 — Ensure first-clear reward once.
- [x] P34-T08 — Add campaign reward breakdown.
- [x] P34-T09 — Simulator comparison: Campaign vs Sect income.
- [x] P34-T10 — Detect reward dominance.
- [x] P34-T11 — Prevent reload/reward exploit.
- [x] P34-T12 — Add analytics for reward sources.

## Balance target

Normal run economy should ideally feel like:

```text
Sect = stable long-term production
Campaign = progression + active rewards
Quests = directional injections
Tower = meta rewards
```

---

# PHASE 35 — SECT REFRAMING

## Goal

Make existing Buildings feel like a physical fantasy Sect rather than a spreadsheet.

No economic rewrite unless simulation proves one is required.

## Rename/present building system as

# SECT

Examples:

- Dojo;
- Meditation Hall;
- Spirit Shrine;
- Warrior Academy;
- Arcane Forge;
- Mana Reactor;
- Celestial Temple;
- Dimensional Gate;
- Star Fortress;
- Infinite Core.

## Sect UI

Each building shows:

- artwork/icon;
- owned;
- Power/s;
- Gold/s;
- total contribution;
- next milestone;
- synergy;
- buy amount;
- affordability.

## Optional visual layer

Over time, Sect may receive a background scene/map where owned buildings visually appear.

This is secondary to functional UI.

## Tasks

- [x] P35-T01 — Rename presentation strings.
- [x] P35-T02 — Preserve internal IDs unless migration justified.
- [x] P35-T03 — Redesign Sect tab.
- [x] P35-T04 — Add building illustration slots.
- [x] P35-T05 — Add milestone evolution presentation.
- [x] P35-T06 — Add synergy display.
- [x] P35-T07 — Add contribution display.
- [x] P35-T08 — Add next best purchase hint only if desired.
- [x] P35-T09 — Integrate Campaign unlock messaging.
- [x] P35-T10 — Ensure BUY 1/10/100/MAX still works.

## Checkpoint 35

The player perceives:

> I am building my Sect, not buying abstract generators.

---

# PHASE 36 — PROTAGONIST RPG LAYER

## Goal

The protagonist must feel like a character, not only a Power number.

Do not create a huge equipment RPG.

## Character page launch scope

Show:

- protagonist portrait/pixel sprite;
- Rank;
- combat power;
- attack;
- crit;
- attack speed;
- key bonuses;
- current appearance/form;
- unlocked skills/upgrades.

## Training becomes

- combat mastery;
- meditation;
- weapon technique;
- aura cultivation.

These may remain existing Upgrades mechanically.

## Tasks

- [x] P36-T01 — Character stat view.
- [x] P36-T02 — Map existing Training upgrades to RPG terminology.
- [x] P36-T03 — Show combat breakdown.
- [x] P36-T04 — Show Rank effect.
- [x] P36-T05 — Show Sect contribution.
- [x] P36-T06 — Show Hero contribution.
- [x] P36-T07 — Show Soul contribution.
- [x] P36-T08 — Show Relic contribution.
- [x] P36-T09 — Add next Rank CTA.
- [x] P36-T10 — Add appearance/form slot.

---

# PHASE 37 — RANK VISUAL EVOLUTION

## Goal

Rank must visibly transform the protagonist.

Existing Rank economy remains controlled.

## Each major Rank may change

- aura color;
- clothing details;
- weapon effect;
- sprite VFX;
- portrait frame;
- combat trail;
- idle stance;
- battle background accents.

## Do not

Create a completely unrelated protagonist every Rank.

Maintain silhouette continuity.

## Tasks

- [x] P37-T01 — Define visual Rank tiers.
- [x] P37-T02 — Map economy Rank to visual form.
- [x] P37-T03 — Add Rank transition sequence.
- [x] P37-T04 — Add new aura hooks.
- [x] P37-T05 — Add portrait variation support.
- [x] P37-T06 — Add sprite variation support.
- [x] P37-T07 — Add fallback if art not yet present.
- [x] P37-T08 — Prevent huge asset load on initial game.
- [x] P37-T09 — Lazy-load future forms.

---

# PHASE 38 — HERO PARTY CONVERSION

## Goal

Turn the existing Hero collection into a visible AFK-style party without creating a full tactical combat simulator.

## Party baseline

4 slots:

```text
LEADER
+
3 SUPPORT / PARTY MEMBERS
```

or visually 3 characters if screen space/performance requires.

The exact visible count can differ from logical slots.

## Heroes contribute

- Party DPS;
- Power aura;
- Gold;
- Crit;
- attack speed;
- Offline;
- Campaign bonuses;
- Tower bonuses.

## Battlefield behavior

Hero sprites do not need complex tactical AI.

They can:

- idle;
- perform timed attacks;
- cast simple skills/VFX;
- contribute mathematically to shared DPS.

## Tasks

- [x] P38-T01 — Map existing squad state.
- [x] P38-T02 — Create visible party renderer.
- [x] P38-T03 — Add party formation anchors.
- [x] P38-T04 — Add hero attack event hooks.
- [x] P38-T05 — Add simple hero VFX.
- [x] P38-T06 — Keep mathematical aura system authoritative.
- [x] P38-T07 — Add party DPS breakdown.
- [x] P38-T08 — Faction synergy indicator on Battle screen.
- [x] P38-T09 — Party editing UX.
- [x] P38-T10 — Mobile formation test.
- [x] P38-T11 — Performance test 4 heroes + enemies + effects.
- [x] P38-T12 — No duplicate application of Hero bonuses.

## Checkpoint 38

Unlocking a Hero visibly changes both numbers and the battlefield.

---

# PHASE 39 — HERO SKILL PRESENTATION

## Goal

Give Heroes personality without adding huge combat complexity.

## Skill model

Each Hero can have:

### Passive Aura

Existing economic/meta modifier.

### Visual Combat Skill

Triggered on a simple interval or charge.

Examples:

- sword wave;
- fire burst;
- healing/light pulse;
- gold rain;
- critical mark.

The visual skill can correspond to a mathematically simple effect.

## Rules

- limited active skill count;
- deterministic enough for simulator;
- no dozens of buffs/debuffs at launch;
- readable on mobile.

## Tasks

- [x] P39-T01 — Add Hero skill config.
- [x] P39-T02 — Add cooldown/charge.
- [x] P39-T03 — Add skill trigger.
- [x] P39-T04 — Add skill VFX event.
- [x] P39-T05 — Add simple effect resolver.
- [x] P39-T06 — Add tooltip.
- [x] P39-T07 — Integrate Hero rarity.
- [x] P39-T08 — Add simulation model.
- [x] P39-T09 — Prevent skill stacking explosion.

---

# PHASE 40 — CAMPAIGN WORLDS

## Goal

Progression should feel like travel through a real adventure.

## Launch world baseline

### World 1 — Whispering Forest

Fantasy:

- green forest;
- goblins;
- wolves;
- forest spirits;
- first demon boss.

### World 2 — Sakura Empire

Fantasy:

- shrine roads;
- bamboo;
- sakura;
- rogue samurai;
- spirits.

### World 3 — Crimson Abyss

Fantasy:

- lava;
- demons;
- ruined fortress;
- heavy elite monsters.

### World 4 — Frozen Peak

Fantasy:

- snow;
- blue magic;
- ice beasts;
- frozen guardian boss.

### World 5 — Void Sanctuary

Fantasy:

- cosmic;
- dark violet;
- distorted ruins;
- sovereign bosses.

## World structure

Do not hand-author hundreds of unique gameplay levels.

Use data-driven combinations:

```text
background
enemy pool
elite pool
boss
reward modifier
difficulty curve
```

## Tasks

- [x] P40-T01 — Create five World configs.
- [x] P40-T02 — Stage ranges.
- [x] P40-T03 — Enemy pools.
- [x] P40-T04 — Boss mapping.
- [x] P40-T05 — Background mapping.
- [x] P40-T06 — Music mapping.
- [x] P40-T07 — World intro.
- [x] P40-T08 — World complete celebration.
- [x] P40-T09 — World transition.
- [x] P40-T10 — Lazy asset load.
- [x] P40-T11 — World-specific modifier support.
- [x] P40-T12 — Ensure modifiers do not break idle math.

---

# PHASE 41 — ENEMIES & BOSSES

## Goal

Create visual variety without requiring huge AI complexity.

## Normal enemy archetypes

At minimum:

- melee;
- ranged;
- tank;
- spirit/magic;
- elite.

Mechanically these may mostly differ by:

- HP;
- visual attack;
- attack timing;
- reward tags.

## Bosses

Boss must feel different through:

- larger sprite;
- entrance;
- name;
- HP bar;
- timer/pressure;
- unique VFX;
- unique reward;
- optional one simple mechanic.

## Simple boss mechanics allowed

Examples:

- temporary shield;
- enrage at low HP;
- short damage reduction;
- summoning visual adds;
- vulnerability window.

Do NOT implement complex raid mechanics.

## Tasks

- [x] P41-T01 — Enemy archetype schema.
- [x] P41-T02 — Spawn presentation.
- [x] P41-T03 — Elite variant.
- [x] P41-T04 — Boss schema.
- [x] P41-T05 — Boss intro.
- [x] P41-T06 — Boss health UI.
- [x] P41-T07 — Boss timer.
- [x] P41-T08 — One mechanic hook.
- [x] P41-T09 — Boss defeat reward chest.
- [x] P41-T10 — Boss failure flow.
- [x] P41-T11 — Farm fallback after boss failure.
- [x] P41-T12 — Boss retry CTA.
- [x] P41-T13 — Rewarded retry remains optional.

---

# PHASE 42 — INFINITE TOWER REPOSITIONING

## Goal

The Infinite Tower is no longer the primary adventure.

Campaign is primary.

Tower becomes a pure challenge/meta mode.

## Tower fantasy

```text
How far can my current build push?
```

## Tower differences from Campaign

Campaign:

- story/world progression;
- primary stage unlocks;
- core progression;
- first-clear rewards.

Tower:

- endless;
- faster;
- score/push focused;
- stronger meta rewards;
- leaderboard potential;
- special modifiers later.

## Tower unlock

Could remain around Rank C/B based on current implementation.

Do not force a redesign if current balance already supports a sensible unlock.

## Rewards

Prefer:

- Crystals;
- Essence;
- Relic materials;
- milestone chest;
- leaderboard status.

Avoid making Tower the dominant Gold generator.

## Tasks

- [x] P42-T01 — Remove Tower from "main adventure" presentation.
- [x] P42-T02 — Preserve existing Tower engine.
- [x] P42-T03 — Reframe UI as Challenge.
- [x] P42-T04 — Add current best floor.
- [x] P42-T05 — Add push/farm options if useful.
- [x] P42-T06 — Separate Campaign and Tower enemy curves.
- [x] P42-T07 — Separate reward tables.
- [x] P42-T08 — Add Tower milestone rewards.
- [x] P42-T09 — Analytics distinction.
- [x] P42-T10 — Regression test old Tower systems.

---

# PHASE 43 — SAMSARA CAMPAIGN EXPERIENCE

## Goal

Reincarnation must become one of the most satisfying visible moments in the game.

## Reincarnation sequence

```text
Run wall reached
↓
Samsara preview
↓
Souls preview
↓
player confirms
↓
visual transition
↓
Campaign returns to early World
↓
player is absurdly stronger
↓
old enemies die instantly
↓
fast acceleration toward previous progress
```

## Campaign reset policy

Recommended baseline:

Campaign stage returns to early progression after Reincarnation, but QoL prevents tedious replay.

## Samsara Rush

Add a fast-clear system.

Possible logic:

If:

```text
PlayerDPS >> EnemyRequiredDPS
```

then old stages can be:

- one-shot visually;
- completed at accelerated speed;
- multi-skipped after a threshold.

## Important

The player should SEE some early enemies explode after Reincarnation.

Do not instantly teleport from Stage 1 to Stage 40 without any power-fantasy feedback.

## Candidate flow

```text
Stage 1-1
ONE SHOT

Stage 1-2
ONE SHOT

Stage 1-3
ONE SHOT

...

after several trivial stages:
FAST CLEAR activates

→ skip groups of stages
```

## Tasks

- [x] P43-T01 — Define Campaign reset behavior.
- [x] P43-T02 — Add Reincarnation visual transition.
- [x] P43-T03 — Add Run reset transaction tests.
- [x] P43-T04 — Add Samsara Rush threshold.
- [x] P43-T05 — Add one-shot presentation.
- [x] P43-T06 — Add stage skip logic.
- [x] P43-T07 — Keep first-clear reward exploit impossible.
- [x] P43-T08 — Preserve highest-ever progress.
- [x] P43-T09 — Recalculate next-run ETA.
- [x] P43-T10 — Simulate Run 1–20.
- [x] P43-T11 — Confirm Run 2 is faster, not trivialized completely.
- [x] P43-T12 — Add Soul Tree interactions with Rush if appropriate.

## Checkpoint 43

Prestige visibly demonstrates increased strength.

---

# PHASE 44 — CAMPAIGN-AWARE QUEST REWRITE

## Goal

Existing Quest engine remains.

Quest content now guides the player through visible battle progression.

## Early chain example

### Journey Begins

- Attack 10 times.
- Defeat 5 enemies.
- Buy first Dojo.
- Reach Stage 1-3.

### First Cultivation

- Own 10 Dojos.
- Reach Rank D.
- Defeat first elite.
- Buy Meditation Hall.

### Into the Wild

- Reach Stage 1-10.
- Defeat first boss.
- Claim first boss chest.

### Tower Awakens

- Unlock Infinite Tower.
- Clear Tower Floor 10.

### Allies

- Unlock Hero Hall.
- Summon first Hero.
- Add Hero to Party.
- Activate first synergy.

### Samsara

- Reach Rank S.
- Reach Campaign wall target.
- Reincarnate.
- Buy first Soul perk.

## Tasks

- [x] P44-T01 — Add Campaign objective types.
- [x] P44-T02 — Add enemy kill tracking.
- [x] P44-T03 — Add stage tracking.
- [x] P44-T04 — Add boss kill tracking.
- [x] P44-T05 — Add World clear objective.
- [x] P44-T06 — Rebuild first-session Quest chain.
- [x] P44-T07 — Preserve existing useful objectives.
- [x] P44-T08 — Remove redundant old Training-only quests where needed.
- [x] P44-T09 — Check rewards against new Campaign economy.
- [x] P44-T10 — Full Quest progression test.

---

# PHASE 45 — ACHIEVEMENTS & LONG-TERM GOALS UPDATE

## Goal

The new visual progression must create new long-term objectives.

## Add achievement families

### Campaign

- clear World 1;
- clear World 5;
- defeat X bosses;
- highest Stage.

### Combat

- X kills;
- X crits;
- one-shot boss milestone;
- combo milestone.

### Party

- collect Heroes;
- full Party;
- faction synergy;
- 5★ Hero.

### Samsara

- Reincarnation count;
- return to previous World faster;
- Souls earned.

## Tasks

- [x] P45-T01 — Extend Achievement objective schema.
- [x] P45-T02 — Add Campaign achievements.
- [x] P45-T03 — Add combat achievements.
- [x] P45-T04 — Add Party achievements.
- [x] P45-T05 — Add Samsara achievements.
- [x] P45-T06 — Ensure lifetime stats survive reset.
- [x] P45-T07 — Prevent retroactive duplicate reward.

---

# PHASE 46 — PIXEL-ANIME ART PIPELINE

## Goal

Build a scalable art system suitable for AI-assisted production and web performance.

## Visual direction

### Battlefield

Pixel-art inspired.

Characteristics:

- readable silhouettes;
- strong color separation;
- simple loops;
- small sprite sheets;
- low animation frame counts;
- clear combat effects.

### Portraits / Summon / Hero collection

Higher-detail anime illustrations.

This creates:

```text
cheap scalable combat assets
+
premium collection presentation
```

## Protagonist assets

Need:

- idle;
- attack;
- crit/strong attack;
- hurt;
- victory;
- Rank aura overlays.

## Enemy assets

Need at minimum:

- idle;
- attack;
- hurt;
- death.

## Hero party assets

At launch, simple combat loops are sufficient.

## Sprite rules

- common scale;
- consistent pixel density;
- consistent outline philosophy;
- no interpolation blur;
- nearest-neighbor scaling where appropriate;
- predictable anchor points.

## Tasks

- [x] P46-T01 — Create art bible.
- [x] P46-T02 — Define sprite dimensions.
- [x] P46-T03 — Define animation frame budgets.
- [x] P46-T04 — Define battlefield coordinate anchors.
- [x] P46-T05 — Define portrait dimensions.
- [x] P46-T06 — Define rarity frame system.
- [x] P46-T07 — Create protagonist placeholder → production pipeline.
- [x] P46-T08 — Create enemy pipeline.
- [x] P46-T09 — Create boss pipeline.
- [x] P46-T10 — Create Hero combat sprite pipeline.
- [x] P46-T11 — Create anime portrait pipeline.
- [x] P46-T12 — Asset licensing/source log.
- [x] P46-T13 — Compression rules.
- [x] P46-T14 — Lazy-load rules.
- [x] P46-T15 — Pixel-perfect rendering QA.

---

# PHASE 47 — BATTLE ANIMATION SYSTEM

## Goal

Make simple math look satisfying.

## Required animation events

- hero idle;
- auto attack;
- manual attack;
- crit;
- enemy hit;
- enemy death;
- reward;
- stage transition;
- boss entrance;
- boss death;
- rank up;
- skill cast.

## Animation architecture

Gameplay math must not depend on animation completion.

Animation reacts to authoritative combat events.

Do not create:

```text
animation says enemy died
therefore game grants reward
```

Instead:

```text
combat engine resolves death
→ emits EnemyDefeated
→ UI animates
```

## Tasks

- [x] P47-T01 — Combat visual event bus.
- [x] P47-T02 — Attack state machine.
- [x] P47-T03 — Hit reaction.
- [x] P47-T04 — Death animation.
- [x] P47-T05 — Floating damage pool.
- [x] P47-T06 — Crit presentation.
- [x] P47-T07 — Reward flyout.
- [x] P47-T08 — Stage transition.
- [x] P47-T09 — Boss entrance.
- [x] P47-T10 — Victory pose.
- [x] P47-T11 — Animation skip/throttle.
- [x] P47-T12 — Reduced-motion mode.

---

# PHASE 48 — COMBAT SOUND & MUSIC PASS

## Goal

Battle screen needs strong game feel.

## SFX

At minimum:

- normal slash;
- heavy slash;
- crit;
- enemy hit;
- enemy death;
- coin;
- loot;
- stage clear;
- boss intro;
- boss defeat;
- Rank Ascension;
- Reincarnation.

## Music

Per World or grouped:

- World 1/early;
- World 2;
- World 3;
- World 4;
- Void/endgame;
- Boss;
- Samsara.

## Tasks

- [x] P48-T01 — Map combat events to SFX.
- [x] P48-T02 — Prevent audio spam from fast attacks.
- [x] P48-T03 — Voice limits.
- [x] P48-T04 — Boss music transition.
- [x] P48-T05 — World music transition.
- [x] P48-T06 — Background tab handling.
- [x] P48-T07 — Mobile audio test.

---

# PHASE 49 — UI NAVIGATION REDESIGN

## Goal

Make the new Battle-first game easy to understand.

## Mobile nav

Recommended:

```text
Hero
Sect
Battle
Heroes
More
```

Battle stays visually central.

## More contains

- Quests;
- Achievements;
- Relics;
- Expeditions;
- Samsara;
- Infinite Tower if not given a quick entry;
- Settings;
- Statistics.

## Quick overlays

Main Battle screen can surface:

- claimable quest;
- Rank ready;
- Summon available;
- boss chest;
- Reincarnation ready.

Do not turn Battle into dashboard clutter.

## Tasks

- [x] P49-T01 — Rebuild bottom nav.
- [x] P49-T02 — Preserve deep-link/tab state.
- [x] P49-T03 — Build More menu.
- [x] P49-T04 — Add notification badges.
- [x] P49-T05 — Add contextual Battle CTAs.
- [x] P49-T06 — Remove obsolete old Home entry.
- [x] P49-T07 — Desktop navigation layout.
- [x] P49-T08 — Back behavior mobile.
- [x] P49-T09 — Browser resize regression.

---

# PHASE 50 — BATTLE-FIRST DESKTOP EXPERIENCE

## Goal

Desktop must look like a PC browser game, not an enlarged phone UI.

## Desktop priorities

Use horizontal space for:

- battle viewport;
- party quick info;
- quests / next goal;
- Sect quick purchase;
- campaign progress.

## Possible layout

```text
┌──────────────┬───────────────────────────────────┬──────────────┐
│ PARTY        │          WORLD / STAGE            │ NEXT GOAL    │
│              │                                   │ QUESTS       │
│ HERO INFO    │           BATTLEFIELD             │              │
│              │                                   │ UPGRADES     │
│ BUFFS        │        ATTACK / AUTO STATE        │              │
├──────────────┴───────────────────────────────────┴──────────────┤
│ Hero | Sect | Battle | Heroes | Tower | More                  │
└────────────────────────────────────────────────────────────────┘
```

## Tasks

- [x] P50-T01 — Desktop Battle composition.
- [x] P50-T02 — Avoid over-wide battlefield.
- [x] P50-T03 — Side-panel priorities.
- [x] P50-T04 — Quick Sect purchase.
- [x] P50-T05 — Quick Quest state.
- [x] P50-T06 — Mouse hover tooltips.
- [x] P50-T07 — Keyboard shortcuts only if useful.
- [x] P50-T08 — 1280/1366/1920/2560 validation.

---

# PHASE 51 — SAVE SCHEMA MIGRATION FOR CAMPAIGN

## Goal

Add Campaign safely without destroying completed save architecture.

## New save data

Likely:

```text
campaign:
  currentWorld
  currentStage
  currentEncounter
  highestWorld
  highestStage
  firstClears
  farmStage
  campaignMode
```

Do not save transient animation state.

## Migration

Existing players without Campaign state need deterministic placement.

Candidate policy:

- derive initial Campaign stage from Rank / progress if safe;
- otherwise start at World 1 while preserving all economy/meta resources.

Do not silently erase Heroes/Souls/Buildings.

## Tasks

- [x] P51-T01 — Bump save version.
- [x] P51-T02 — Add Campaign defaults.
- [x] P51-T03 — Add migration.
- [x] P51-T04 — Add corrupted Campaign recovery.
- [x] P51-T05 — Test old save.
- [x] P51-T06 — Test midgame save.
- [x] P51-T07 — Test Reincarnation save.
- [x] P51-T08 — Test cloud/local conflict.
- [x] P51-T09 — Test save during battle transition.
- [x] P51-T10 — Test save during boss defeat.

---

# PHASE 52 — BALANCE V4: CAMPAIGN INTEGRATION

## Goal

Rebalance only where the Campaign layer changes economy pacing.

Do NOT throw away the completed balance foundation.

## New simulator variables

Add:

- stage progression;
- enemy HP;
- kill rewards;
- boss rewards;
- manual combat contribution;
- Party DPS;
- Campaign walls;
- Samsara Rush.

## Simulate strategies

### ACTIVE

Uses ATTACK often.

### AFK

Mostly watches autobattle.

### OPTIMAL

Optimizes Sect/upgrades/Party.

### CASUAL

Makes reasonable but imperfect purchases.

## Required horizons

- 1 min;
- 5 min;
- 15 min;
- 30 min;
- first boss;
- first World clear;
- first Reincarnation;
- Run 2;
- Run 3;
- Day 1;
- Day 3;
- Day 7.

## Metrics

- stage per minute;
- enemy time-to-kill;
- boss time-to-kill;
- percentage income from Campaign;
- percentage income from Sect;
- manual contribution;
- Hero contribution;
- first Reincarnation time;
- Run 2 speedup;
- stage wall duration.

## Rules

Campaign should not:

- make Sect useless;
- make manual clicking mandatory;
- allow infinite kill/reward feedback explosion;
- make Tower irrelevant;
- make Reincarnation unnecessary.

## Tasks

- [x] P52-T01 — Extend simulator.
- [x] P52-T02 — Add Campaign agent behavior.
- [x] P52-T03 — Add enemy scaling.
- [x] P52-T04 — Add boss scaling.
- [x] P52-T05 — Add Campaign rewards.
- [x] P52-T06 — Add Party DPS.
- [x] P52-T07 — Add Samsara Rush.
- [x] P52-T08 — Detect stage dead zones.
- [x] P52-T09 — Detect trivial campaign cascade.
- [x] P52-T10 — Detect Campaign income dominance.
- [x] P52-T11 — Tune first hour.
- [x] P52-T12 — Tune Runs 1–5.
- [x] P52-T13 — Produce `BALANCE_V4_CAMPAIGN.md`.

## Checkpoint 52

No campaign stage cascade analogous to the old Rank cascade.

---

# PHASE 53 — CAMPAIGN ANALYTICS

## Goal

Know exactly where players stop progressing.

## Events

Add:

```text
campaign_start
stage_start
stage_clear
stage_fail
boss_start
boss_clear
boss_fail
world_clear
auto_farm_enter
manual_attack
campaign_reward
samsara_rush_start
samsara_rush_end
```

## Important funnel points

Track:

- first enemy killed;
- Stage 1-3;
- first boss;
- World 1 complete;
- Tower unlock;
- first Hero;
- Rank S;
- first Reincarnation.

## Tasks

- [x] P53-T01 — Add event schema.
- [x] P53-T02 — Avoid event spam for every auto hit.
- [x] P53-T03 — Aggregate manual attacks where needed.
- [x] P53-T04 — Add stage funnel report.
- [x] P53-T05 — Add boss failure report.
- [x] P53-T06 — Add first-session progression report.

---

# PHASE 54 — MONETIZATION REPOSITIONING

## Goal

Ads should fit the new battle experience naturally.

## Good Rewarded placements

### Offline Meditation

Keep.

### Boss Retry Boost

After losing a boss:

```text
Retry normally
or
Watch → +20% temporary combat boost
```

Rewarded only.

### Temporary Battle Surge

```text
×2 Battle Power
for X minutes
```

### Bonus Boss Chest

After boss victory:

```text
Claim
or
Claim boosted
```

Must be balanced carefully.

### Free Hero Summon

Keep limited.

## Bad placements

Never interrupt:

- active battle;
- manual Attack combo;
- boss at 5% HP;
- Rank transformation;
- Summon reveal;
- Reincarnation sequence.

## Tasks

- [x] P54-T01 — Re-evaluate existing placements.
- [x] P54-T02 — Add boss retry placement.
- [x] P54-T03 — Add optional chest boost if balanced.
- [x] P54-T04 — Set cooldowns.
- [x] P54-T05 — Compare reward values.
- [x] P54-T06 — Analytics.
- [x] P54-T07 — Regression Yandex SDK callbacks.

---

# PHASE 55 — PERFORMANCE FOR LIVING BATTLEFIELD

## Goal

The new visual battle must still run on weak mobile devices.

## Performance budgets

Set actual budgets after profiling.

Track:

- active entities;
- particles;
- floating texts;
- sprite textures;
- memory;
- animation updates;
- DOM nodes if DOM UI;
- canvas draw calls if Canvas;
- asset download size.

## Requirements

- reuse entities;
- object pool floating numbers;
- object pool particles;
- unload old World assets;
- lazy-load future Worlds/Heroes;
- pause unnecessary VFX when tab hidden;
- reduce effects on low-performance mode.

## Tasks

- [x] P55-T01 — Profile baseline.
- [x] P55-T02 — Mobile low-end profile.
- [x] P55-T03 — Entity pool.
- [x] P55-T04 — Floating-number pool.
- [x] P55-T05 — Particle budget.
- [x] P55-T06 — Texture audit.
- [x] P55-T07 — World asset unloading.
- [x] P55-T08 — Long-session memory test.
- [x] P55-T09 — 30-minute battle soak test.
- [x] P55-T10 — 4 Hero + 3 Enemy + VFX stress test.
- [x] P55-T11 — Low-effects mode.

---

# PHASE 56 — ACCESSIBILITY / COMFORT REVALIDATION

## Goal

Existing Phase 30-style comfort work must be revalidated because the main screen changed dramatically.

## Re-test

- reduced motion;
- flashing;
- rapid VFX;
- contrast on pixel backgrounds;
- HP bar readability;
- damage text readability;
- sound spam;
- manual Attack accessibility;
- no mandatory high CPS;
- touch target sizing.

## Tasks

- [x] P56-T01 — Reduced battle VFX.
- [x] P56-T02 — Crit flash safety.
- [x] P56-T03 — Damage number scale.
- [x] P56-T04 — HP bar contrast.
- [x] P56-T05 — Manual Attack alternative input.
- [x] P56-T06 — Touch QA.
- [x] P56-T07 — Color-blind-independent rarity indicators.

---

# PHASE 57 — LOCALIZATION REVALIDATION

## Goal

New Campaign/Combat UI supports RU and EN cleanly.

## New strings

- World names;
- Stage;
- Boss;
- Auto Battle;
- Farm;
- Retry;
- Party;
- Sect;
- Campaign;
- Victory;
- Defeat;
- One Shot / Rush;
- World Clear.

## Tasks

- [x] P57-T01 — Add translation keys.
- [x] P57-T02 — Remove hardcoded Battle strings.
- [x] P57-T03 — Test RU.
- [x] P57-T04 — Test EN.
- [x] P57-T05 — Check stage header overflow.
- [x] P57-T06 — Boss name overflow.
- [x] P57-T07 — Mobile buttons.

---

# PHASE 58 — COMPLETE INTERACTION QA V2

## Goal

Re-run interaction testing for the new Campaign-first game.

## Battle

Test:

- Attack;
- Auto attack;
- normal kill;
- multi-enemy kill;
- stage clear;
- boss entry;
- boss loss;
- boss retry;
- auto farm;
- progress mode;
- World clear.

## Hero

- Party edit while battle active;
- Hero bonus refresh;
- skill trigger.

## Sect

- buy 1;
- buy 10;
- buy 100;
- buy max;
- milestone during battle.

## Quest

- kill objective;
- stage objective;
- boss objective;
- claim during battle.

## Reincarnation

- reset during valid state;
- campaign reset;
- Rush;
- first-clear safety.

## Tasks

- [x] P58-T01 — Interaction map V2.
- [x] P58-T02 — Browser automation where available.
- [x] P58-T03 — Rapid Attack.
- [x] P58-T04 — Rapid menu switching.
- [x] P58-T05 — Battle + purchase race.
- [x] P58-T06 — Battle + save race.
- [x] P58-T07 — Boss + ad race.
- [x] P58-T08 — Reincarnation + battle race.
- [x] P58-T09 — No dead buttons.
- [x] P58-T10 — Console clean.

---

# PHASE 59 — RESPONSIVE QA V2

## Goal

Revalidate new Battle layout.

## Mobile

Test:

- 360×640;
- 390×844;
- 412×915.

Must preserve:

- visible hero/enemies;
- usable Attack;
- readable HP;
- stage info;
- bottom nav.

## Tablet

- 768×1024.

## Desktop

- 1280×720;
- 1366×768;
- 1920×1080;
- 2560×1440.

## Special tests

- landscape phone;
- very short viewport;
- browser zoom;
- dynamic resize;
- safe-area devices.

## Tasks

- [x] P59-T01 — Screenshot matrix.
- [x] P59-T02 — Interaction matrix.
- [x] P59-T03 — No battlefield clipping.
- [x] P59-T04 — No enemy hidden under action bar.
- [x] P59-T05 — Modal test.
- [x] P59-T06 — Desktop not phone-stretched.
- [x] P59-T07 — Resize Battle safely.

---

# PHASE 60 — CONTENT PRODUCTION: LAUNCH CAMPAIGN

## Goal

Populate the system without hand-building an impossible amount of content.

## Launch target

### Worlds

5.

### Normal enemy families

3–5 per World.

### Elite variants

1–2 per World.

### Bosses

At least:

- regular stage bosses;
- one major World boss with distinctive presentation per World.

### Campaign stages

Use config/math generation.

Do NOT create hundreds of individually scripted levels.

## Tasks

- [x] P60-T01 — World 1 final content.
- [x] P60-T02 — World 2 final content.
- [x] P60-T03 — World 3 final content.
- [x] P60-T04 — World 4 final content.
- [x] P60-T05 — World 5 final content.
- [x] P60-T06 — Enemy naming.
- [x] P60-T07 — Boss naming/lore.
- [x] P60-T08 — Reward tables.
- [x] P60-T09 — World background assets.
- [x] P60-T10 — Enemy sprite assets.
- [x] P60-T11 — Boss assets.
- [x] P60-T12 — Music/SFX mapping.
- [x] P60-T13 — Campaign content validation script.

---

# PHASE 61 — CONTENT PRODUCTION: HEROES

## Goal

Make Hero collection visually compelling in the new style.

## Launch target

12–20 Heroes.

Each needs:

- anime portrait;
- pixel battle sprite;
- role;
- rarity;
- faction;
- aura;
- skill;
- star growth;
- summon data.

## Hero quality rule

Better:

```text
14 recognizable Heroes
```

than:

```text
40 generic Heroes
```

## Tasks

- [x] P61-T01 — Final launch roster.
- [x] P61-T02 — Role distribution.
- [x] P61-T03 — Faction distribution.
- [x] P61-T04 — Rarity distribution.
- [x] P61-T05 — Portraits.
- [x] P61-T06 — Pixel sprites.
- [x] P61-T07 — Skill VFX.
- [x] P61-T08 — Collection text.
- [x] P61-T09 — Summon presentation.
- [x] P61-T10 — Hero balance.
- [x] P61-T11 — Ensure no must-have single Hero dominates.

---

# PHASE 62 — GAME FEEL POLISH

## Goal

Turn a functional battle into a satisfying product.

## Polish checklist

### ATTACK

- button press;
- sword effect;
- damage pop;
- sound;
- crit escalation.

### Kill

- enemy reaction;
- death;
- coins;
- reward;
- stage pip.

### Boss

- entrance;
- name;
- music;
- HP bar;
- defeat;
- chest.

### Rank

- aura;
- screen effect;
- new title;
- unlock.

### Reincarnation

- unique full-screen moment;
- reset;
- early one-shots.

## Tasks

- [x] P62-T01 — Attack juice.
- [x] P62-T02 — Kill juice.
- [x] P62-T03 — Purchase juice.
- [x] P62-T04 — Stage clear juice.
- [x] P62-T05 — Boss juice.
- [x] P62-T06 — Rank juice.
- [x] P62-T07 — Hero summon juice.
- [x] P62-T08 — Reincarnation juice.
- [x] P62-T09 — Avoid animation overload.
- [x] P62-T10 — Low-effects fallback.

---

# PHASE 63 — YANDEX PLATFORM REVALIDATION

## Goal

Completed SDK work must be retested under the new continuous battle lifecycle.

## Important new lifecycle cases

Battle may be active while:

- ad opens;
- tab hides;
- user opens another menu;
- app loses focus.

## Required behavior

When ad begins:

- combat visual update pauses safely;
- economic state does not double-tick;
- audio pauses/mutes;
- Gameplay API state correct.

After ad:

- resume once;
- no duplicate enemy;
- no duplicate reward.

## Tasks

- [x] P63-T01 — LoadingAPI.ready re-test.
- [x] P63-T02 — Gameplay state re-test.
- [x] P63-T03 — Rewarded pause/resume.
- [x] P63-T04 — Fullscreen pause/resume.
- [x] P63-T05 — visibilitychange.
- [x] P63-T06 — Cloud save during Campaign.
- [x] P63-T07 — Mobile Yandex environment.
- [x] P63-T08 — Desktop Yandex environment.

---

# PHASE 64 — STORE CARD & MARKETING ASSETS V2

## Goal

Store presentation must reflect the new visual game.

## Required screenshots

1. Hero fighting enemies in pixel battlefield.
2. Boss battle.
3. Sect growth.
4. Anime Hero summon/collection.
5. Samsara / Rank evolution.

## Cover

Should communicate:

```text
anime hero
+
pixel battle world
+
power fantasy
```

not a generic UI dashboard.

## Tasks

- [x] P64-T01 — New icon.
- [x] P64-T02 — New cover.
- [x] P64-T03 — Battle screenshot.
- [x] P64-T04 — Boss screenshot.
- [x] P64-T05 — Hero screenshot.
- [x] P64-T06 — Sect screenshot.
- [x] P64-T07 — Samsara screenshot.
- [x] P64-T08 — Promotional text consistency.

---

# PHASE 65 — RELEASE BALANCE LOCK

## Goal

Freeze a mathematically stable release baseline.

## Before lock

Run:

- Campaign simulator;
- original economy simulator;
- Tower simulation;
- Hero summon simulation;
- Reincarnation simulation;
- Offline simulation.

## Required reports

```text
BALANCE_V4_CAMPAIGN.md
CAMPAIGN_SIMULATION.csv
RUN_SIMULATION.csv
TOWER_VS_CAMPAIGN_REWARDS.csv
HERO_EXPECTED_VALUE.csv
```

## Release balance acceptance

No:

- early campaign cascade;
- > several-minute unexplained dead zone in first session;
- prestige trap;
- reward duplication;
- Campaign making Sect obsolete;
- Tower making Campaign obsolete;
- one Hero breaking economy;
- required ad wall.

---

# PHASE 66 — PRE-RELEASE QA GATE V2

Do not release until all are true.

## Build

- [x] typecheck passes
- [x] tests pass
- [x] production build passes
- [x] no placeholder production UI
- [x] no missing production assets

## Battle

- [x] Attack works
- [x] Auto works
- [x] kills work
- [x] stage progression works
- [x] bosses work
- [x] failure works
- [x] farm works
- [x] World transitions work

## Economy

- [x] Sect works
- [x] Upgrades work
- [x] Quest rewards work
- [x] Campaign rewards sane
- [x] Rank progression sane

## Heroes

- [x] Summon works
- [x] Party works
- [x] Hero DPS works
- [x] skills work
- [x] duplicates work

## Prestige

- [x] Reincarnation works
- [x] Campaign resets correctly
- [x] Samsara Rush works
- [x] no first-clear exploit

## Persistence

- [x] local save works
- [x] cloud save works
- [x] migration works
- [x] reload during battle safe

## Platform

- [x] Yandex SDK works
- [x] ads work/fail safely
- [x] mobile works
- [x] desktop works

## Quality

- [x] no Critical
- [x] no known High blocker
- [x] no NaN
- [x] no Infinity
- [x] no duplicate rewards
- [x] no dead buttons
- [x] no console spam/errors

---

# PHASE 67 — SOFT LAUNCH

## Goal

Release to real users and measure.

## Do not immediately add features.

First inspect:

### First minute

- did player Attack?
- first enemy kill?
- first Dojo?
- quit point?

### First session

- first boss?
- first Rank?
- Tower unlock?
- Hero unlock?
- first World clear?
- first Reincarnation?

### Return

- did player return?
- offline reward claimed?
- session 2 progression?

## Key metrics

Track actual platform-appropriate metrics:

- onboarding completion;
- stage funnel;
- boss fail points;
- session duration;
- return behavior;
- ad opt-in;
- Reincarnation conversion.

Do not fabricate benchmark targets without real data.

---

# PHASE 68 — FIRST LIVE BALANCE PASS

## Process

1. Find biggest real drop.
2. Reproduce in simulator.
3. Confirm root cause.
4. Modify smallest set of values/systems.
5. Run full regression.
6. Release.
7. Compare.

Examples:

If players stop at first boss:

Do not immediately halve all enemy HP.

Check:

- boss HP;
- available upgrades;
- Sect affordability;
- quest guidance;
- Party unlock timing;
- boss UI clarity.

---

# PHASE 69 — LIVE CONTENT EXPANSION

Only after core metrics indicate a healthy game.

## Candidate order

1. More Campaign Worlds.
2. More Heroes.
3. More bosses.
4. More Relics.
5. Tower modifiers.
6. Expeditions expansion.
7. Daily challenges.
8. leaderboards.
9. themed events.
10. cosmetics.

---

# PHASE 70 — LIVEOPS

## Event design rule

Events reuse the existing engine.

Examples:

### Sakura Festival

- visual overlay;
- special enemy;
- temporary quest chain;
- cosmetic Hero portrait/frame.

### Void Invasion

- special boss ladder;
- Tower modifier;
- Relic rewards.

### Boss Rush

- sequential bosses;
- leaderboard;
- no new core combat engine.

Do NOT create a new independent game for every event.

---

# FINAL ARCHITECTURE AFTER PHASE 29+

The game should ultimately read as:

```text
                    ACCOUNT META
        Heroes / Souls / Relics / Achievements
                         │
                         ▼
                     CAMPAIGN
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
       Combat           Sect          Quests
          │              │              │
          └───────┬──────┴──────┬───────┘
                  ▼             ▼
                Rank          Party
                  │             │
                  └──────┬──────┘
                         ▼
                      Boss Wall
                         │
               ┌─────────┴─────────┐
               ▼                   ▼
          Improve Build        Infinite Tower
               │                   │
               └─────────┬─────────┘
                         ▼
                  Samsara Rebirth
                         │
                         ▼
                   Faster Campaign
```

---

# PRIORITY AFTER PHASE 28

If development time becomes limited, execute Phase 29+ in this exact priority:

```text
P29  Pivot Audit
P30  Campaign Domain
P31  Combat Adapter
P32  Battle Screen
P33  Auto Battle
P34  Campaign Rewards
P35  Sect Reframe
P38  Visible Hero Party
P40  Campaign Worlds
P41  Bosses
P43  Samsara Campaign Experience
P49  Navigation Redesign
P51  Save Migration
P52  Balance V4
P55  Performance
P58  Interaction QA
P59  Responsive QA
P60  Launch Content
P62  Game Feel
P63  Yandex Revalidation
P65  Balance Lock
P66  Release Gate
```

The remaining Phases enrich the product but must not delay fixing a broken core loop.

---

# AI AGENT EXECUTION RULES — PHASE 29+

When an AI coding agent works from this PLAN:

1. Treat Phases 0–28 as completed production foundation.
2. Do not casually rewrite those systems.
3. Read current repository before every major Phase.
4. Reuse existing economy/services whenever possible.
5. Campaign must orchestrate systems, not duplicate them.
6. Never create a second independent Power formula.
7. Never create a second Hero bonus calculation.
8. Never create a second save source of truth.
9. Every balance-impacting change must be reflected in simulator.
10. Every new UI interaction must be browser-tested.
11. Every Campaign state change that matters must be save-tested.
12. Every Reincarnation change must test old/new Run progression.
13. Do not mark a Phase complete because code compiles.
14. Complete the Phase checkpoint.
15. Do not begin future LiveOps/PvP/social scope during Campaign conversion.

---

# FINAL DEFINITION OF DONE

The Phase 29+ pivot is complete when a fresh player can:

1. launch the game;
2. immediately see their Hero fighting;
3. manually ATTACK;
4. watch Auto Battle continue without input;
5. defeat enemies;
6. receive visible Gold/Power rewards;
7. progress through Campaign stages;
8. fight a boss;
9. improve the Sect;
10. buy upgrades;
11. increase Rank;
12. see the protagonist visually evolve;
13. unlock Heroes;
14. summon a Hero;
15. place Heroes into a visible Party;
16. see Party DPS/skills affect battle;
17. unlock Infinite Tower as a challenge mode;
18. hit a meaningful Campaign wall;
19. Reincarnate;
20. return to early Campaign vastly stronger;
21. visually one-shot old enemies;
22. fast-clear old content;
23. reach further than the previous Run;
24. close the game;
25. return later;
26. receive Offline progress;
27. continue on mobile and desktop;
28. preserve progress through local/cloud save;
29. use optional rewarded ads without being forced;
30. experience the whole loop without a broken button, progression exploit or developer console.

The intended emotional loop is:

```text
WATCH
→ ATTACK
→ KILL
→ LOOT
→ UPGRADE
→ BUILD
→ ADVANCE
→ BOSS
→ COLLECT HERO
→ BUILD PARTY
→ ASCEND
→ HIT WALL
→ REINCARNATE
→ DESTROY OLD CONTENT
→ PUSH FURTHER
```

If this loop is fun, readable and mathematically stable, the pivot succeeded.

# END
