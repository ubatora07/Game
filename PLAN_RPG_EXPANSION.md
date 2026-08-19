# PLAN.md — Anime Infinite Ascension
## Continuation: Phase 71+ — Builds, Rhythm, Adventure, Karma, Settlement & World Systems

> **Project state:** all phases from the previous roadmap are considered completed unless the repository audit proves otherwise.
>
> **This continuation starts from Phase 71.**
>
> The purpose of Phase 71+ is to evolve the game from a strong incremental autobattler into a **living fantasy adventure with real build identity, class development, rhythm mastery, choices, karma, exploration, markets, pets, settlement management and crafting**.
>
> New systems must interact with existing systems instead of becoming isolated menus.

---

# 0. NEW PRODUCT DIRECTION

The main long-term fantasy becomes:

```text
I choose who I am
↓
I build my class
↓
I fight and master rhythm
↓
I travel
↓
unexpected events happen
↓
I make choices
↓
the world remembers those choices
↓
I meet companions
↓
I build a team
↓
I acquire equipment / pets / titles
↓
I unlock places and NPCs
↓
I obtain my own settlement
↓
I craft and improve gear
↓
my Karma / Class / Party open different opportunities
↓
I Reincarnate
↓
I explore the same world differently
```

The desired game should feel like:

```text
Incremental progression
+
simple autobattler
+
light RPG buildcraft
+
roguelite-like event variety
+
choice-driven adventure
+
AFK-style team growth
+
long-term settlement/meta progression
```

---

# 1. CORE DESIGN RULE — SYSTEMS MUST INTERACT

A feature is NOT considered complete if it exists only inside its own screen.

Examples of correct cross-system interactions:

```text
Negative Karma
→ Black Market unlock
→ Forbidden item
→ special Assassin/Necromancer build
→ unique event path
```

```text
Summoner specialization
→ Pet bonuses become stronger
→ special pet evolution
→ different Tower/Campaign build
```

```text
Village event
→ Help villagers
→ Positive Karma
→ later title / NPC / settlement discount
```

```text
Rare ore event
→ Blacksmith discovery
→ Forge upgrade
→ crafting recipe
→ new weapon
```

```text
Mercenary market offer
→ temporary party member
→ different team synergy
→ boss becomes beatable
```

Every Phase below should deliberately create links to existing systems.

---

# 2. SCOPE TIERS

## TIER A — MUST-HAVE NEW CORE

Implement first:

1. 4 base classes.
2. Class development trees.
3. 2-character active team.
4. Rhythm Attack system.
5. Simple random events.
6. Basic Karma.
7. Small Market.
8. Event-driven character recruitment.

## TIER B — META EXPANSION

Only after Tier A is stable:

1. Pets.
2. Settlement.
3. Settlement NPCs.
4. Crafting / Blacksmiths.
5. Expanded Market.
6. Mercenaries.
7. Titles.
8. Black Market.

## TIER C — LONG-TERM WORLD SYSTEMS

After core retention is proven:

1. advanced class specializations;
2. settlement raids;
3. political paths;
4. advanced narrative branches;
5. relationships/spouses if still desirable;
6. deeper Karma endings;
7. advanced pet evolution;
8. world-state consequences.

---

# PHASE 71 — CURRENT STATE AUDIT FOR THE RPG EXPANSION

## Goal

Map how the new RPG systems fit into the completed Campaign/Party/Economy architecture.

## Tasks

- [ ] P71-T01 — Audit current Hero / Party architecture.
- [ ] P71-T02 — Audit protagonist data model.
- [ ] P71-T03 — Audit manual Attack/Combo system.
- [ ] P71-T04 — Audit current Crit formula.
- [ ] P71-T05 — Audit Quest/Event hooks.
- [ ] P71-T06 — Audit Campaign stage transition hooks.
- [ ] P71-T07 — Audit current Market/Shop components if any.
- [ ] P71-T08 — Audit current inventory/equipment placeholders.
- [ ] P71-T09 — Audit save schema extensibility.
- [ ] P71-T10 — Audit analytics extensibility.
- [ ] P71-T11 — Audit simulator support for build-specific modifiers.
- [ ] P71-T12 — Identify existing systems that classes can modify.
- [ ] P71-T13 — Identify duplicated systems that must NOT be recreated.
- [ ] P71-T14 — Produce dependency graph for all Phase 71+ features.

## Deliverables

```text
docs/RPG_EXPANSION_AUDIT.md
docs/RPG_SYSTEM_DEPENDENCY_MAP.md
```

---

# PHASE 72 — UNIVERSAL MODIFIER / BUILD FRAMEWORK

## Goal

Create a safe framework so Classes, Pets, Gear, Karma and Titles can modify gameplay without each system inventing its own multiplier logic.

## Supported target families

### Combat
- attack;
- attackSpeed;
- critChance;
- critDamage;
- bossDamage;
- eliteDamage;
- manualAttackDamage;
- autoAttackDamage.

### Economy
- Gold;
- Power;
- loot chance;
- offline reward;
- quest reward.

### Adventure
- event chance;
- rare event chance;
- merchant quality;
- Karma gain/loss multiplier.

### Team
- ally damage;
- specific class bonus;
- team synergy.

### Pets / Settlement
Future-ready hooks.

## Tasks

- [ ] P72-T01 — Create modifier schema.
- [ ] P72-T02 — Create central modifier resolver.
- [ ] P72-T03 — Add conditional modifiers.
- [ ] P72-T04 — Add class tags.
- [ ] P72-T05 — Add source attribution.
- [ ] P72-T06 — Extend combat breakdown UI.
- [ ] P72-T07 — Extend debug breakdown.
- [ ] P72-T08 — Extend simulator.
- [ ] P72-T09 — Unit tests for stacking.
- [ ] P72-T10 — Regression tests for old Rank/Hero/Soul modifiers.
- [ ] P72-T11 — Prevent double-application.

---

# PHASE 73 — FOUR BASE CLASSES

## Launch classes

### Mage
- magic damage;
- elemental effects;
- burst;
- future summoning/element specialization.

### Swordsman
- stable melee;
- defense;
- boss fighting;
- future Paladin / Dark Guard directions.

### Archer
- attack speed;
- precision;
- crit;
- future Crossbow / Hunter directions.

### Assassin
- crit;
- burst;
- loot;
- rhythm reward potential;
- future Tracker / dark specialization.

## Tasks

- [ ] P73-T01 — Create Class definition schema.
- [ ] P73-T02 — Create 4 base class configs.
- [ ] P73-T03 — Add class selection flow.
- [ ] P73-T04 — Add class-specific stat profile.
- [ ] P73-T05 — Add class icons.
- [ ] P73-T06 — Add class description.
- [ ] P73-T07 — Add starter visual differentiation.
- [ ] P73-T08 — Add class to save.
- [ ] P73-T09 — Add class analytics.
- [ ] P73-T10 — Add class to simulator.
- [ ] P73-T11 — Prevent class switching exploit.
- [ ] P73-T12 — Decide respec policy.

---

# PHASE 74 — CLASS DEVELOPMENT TREE ENGINE

## Goal

Support a branching structure:

```text
1
→ 2
→ 4
→ 8
```

Each class has 15 nodes across the structure, but only one path is active in a given run/build.

## Tasks

- [ ] P74-T01 — Create skill tree schema.
- [ ] P74-T02 — Create node prerequisite engine.
- [ ] P74-T03 — Create exclusive branch handling.
- [ ] P74-T04 — Create skill tree UI.
- [ ] P74-T05 — Create preview-before-choice.
- [ ] P74-T06 — Create confirmation flow.
- [ ] P74-T07 — Add respec support architecture.
- [ ] P74-T08 — Add tree to save.
- [ ] P74-T09 — Add tree to combat simulator.
- [ ] P74-T10 — Add node unlock analytics.
- [ ] P74-T11 — Add test tree.
- [ ] P74-T12 — Verify 1→2→4→8 traversal.
- [ ] P74-T13 — Verify invalid branch cannot be selected.
- [ ] P74-T14 — Verify old save migration.

---

# PHASE 75 — CLASS TREES: MAGE

Design one production-quality tree and use it as template.

Suggested direction:

```text
Arcane / Elemental
→ Summoning / Pure Arcana / Fire-Storm / Frost-Nature
→ 8 final specializations
```

Tasks:

- [ ] Design full tree.
- [ ] Implement modifiers.
- [ ] Implement signature effects.
- [ ] Add UI copy.
- [ ] Add simulator profiles.
- [ ] Balance endpoints.
- [ ] Add future Pet hooks for Summoner.

---

# PHASE 76 — CLASS TREES: SWORDSMAN

Possible identities:

- Paladin;
- Dark Guard;
- Duelist;
- Berserker;
- Guardian;
- Blade Master;
- support/team aura paths.

Tasks:

- [ ] Design tree.
- [ ] Implement.
- [ ] Add Party synergies.
- [ ] Add simulator.
- [ ] Balance vs Mage.
- [ ] Add future Settlement/Title hooks.

---

# PHASE 77 — CLASS TREES: ARCHER

Possible identities:

- attack speed;
- crit;
- Crossbow;
- Hunter;
- weak-point/boss damage;
- trap/utility;
- Pet-compatible path.

Tasks:

- [ ] Design tree.
- [ ] Implement.
- [ ] Add rhythm synergy.
- [ ] Add Pet hooks.
- [ ] Add Party synergies.
- [ ] Add simulator.
- [ ] Balance.

---

# PHASE 78 — CLASS TREES: ASSASSIN

Possible identities:

- crit;
- execute;
- poison;
- shadow;
- Tracker;
- rare loot;
- Black Market affinity.

Tasks:

- [ ] Design tree.
- [ ] Implement.
- [ ] Add loot/rhythm synergy.
- [ ] Add Karma/Black Market tags.
- [ ] Add simulator.
- [ ] Balance.
- [ ] Prevent crit explosion.

---

# PHASE 79 — CLASS BALANCE PASS

Compare:

- first 5 min;
- first 30 min;
- bosses;
- Campaign;
- Tower;
- Reincarnation timing;
- Gold;
- loot;
- manual vs idle.

No class may dominate every category.

Deliverable:

```text
CLASS_BALANCE_REPORT.md
```

---

# PHASE 80 — TWO-CHARACTER TEAM CORE

## Goal

Allow two buildable Main Characters simultaneously.

Clarify terminology:

- Main Characters = class/build characters.
- Heroes = existing collectible/meta characters.

Tasks:

- [ ] Create MainCharacter model.
- [ ] Migrate protagonist.
- [ ] Add second MainCharacter.
- [ ] Separate MainCharacter vs Hero.
- [ ] Add character switch UI.
- [ ] Add individual class tree.
- [ ] Add individual stats.
- [ ] Add shared vs individual resource rules.
- [ ] Save both builds.
- [ ] Add Reincarnation rules.
- [ ] Extend simulator.
- [ ] Adapt battlefield.

---

# PHASE 81 — SECOND CHARACTER UNLOCK

Unlock through a memorable gameplay event / quest rather than immediately.

Tasks:

- [ ] Design unlock event.
- [ ] Create quest.
- [ ] Add class selection for second character.
- [ ] Add onboarding.
- [ ] Prevent duplicate unlock.
- [ ] Balance unlock timing.

---

# PHASE 82 — RHYTHM ATTACK ENGINE

## Goal

Manual tapping remains simple, but rhythm adds optional mastery.

If timing is maintained:

- crit damage increases;
- crit chance may increase moderately;
- loot chance may increase;
- extra bonuses may trigger.

Rhythm must be visually readable and not audio-dependent.

Tasks:

- [ ] Define rhythm clock.
- [ ] Define timing windows.
- [ ] Add visual beat indicator.
- [ ] Add optional beat sound.
- [ ] Add streak.
- [ ] Add tolerance.
- [ ] Add break rules.
- [ ] Add accessibility mode.
- [ ] Add touch latency tolerance.
- [ ] Add mouse/keyboard support.
- [ ] Prevent multi-input exploit.
- [ ] Add analytics.
- [ ] Add simulator profile.

---

# PHASE 83 — RHYTHM REWARD CURVE

Candidate structure:

```text
0–15 sec
feedback/build-up

15–60 sec
combat bonus

1–2 min
loot improvement

2–5 min
mastery bonus

5+ min
soft diminishing returns
```

Tasks:

- [ ] Define curve.
- [ ] Add diminishing returns.
- [ ] Add class-specific hooks.
- [ ] Add Assassin synergy.
- [ ] Add Archer synergy.
- [ ] Add loot bonus.
- [ ] Compare active vs idle.
- [ ] Prevent loot economy collapse.

---

# PHASE 84 — LONG-RHYTHM EASTER EGG

Reward extreme persistence with personality, not raw power.

Possible reward:

- secret NPC;
- funny dialogue;
- unique title;
- cosmetic badge.

Tasks:

- [ ] Long-rhythm milestone tracker.
- [ ] Secret dialogue.
- [ ] Unique title/badge.
- [ ] Debug trigger.
- [ ] Save unlock.

---

# PHASE 85 — ADVENTURE EVENT FRAMEWORK

Event categories:

- chests;
- travelers;
- recruits;
- ambushes;
- villages;
- merchants;
- rare items;
- strange NPCs;
- story events;
- choice events.

Event data should support:

```text
weight
worldTags
classTags
karmaRequirements
partyRequirements
rankRequirements
cooldown
choices
outcomes
followUps
onceOnly
```

Tasks:

- [ ] Create Event schema.
- [ ] Event scheduler.
- [ ] Eligibility resolver.
- [ ] Weighted selection.
- [ ] Cooldowns.
- [ ] Once-only events.
- [ ] Event modal.
- [ ] Choice UI.
- [ ] Outcome transaction.
- [ ] Follow-up chains.
- [ ] Save history.
- [ ] Analytics.

---

# PHASE 86 — BASIC RANDOM EVENT CONTENT

Initial content target:

- 5 chest/loot;
- 5 traveler/NPC;
- 4 merchant;
- 4 ambush;
- 4 village;
- 3 recruit;
- 5 weird/rare events.

Tasks:

- [ ] Design pool.
- [ ] Add World tags.
- [ ] Add balanced rewards.
- [ ] Add visuals/placeholders.
- [ ] Verify repetition rate.
- [ ] Verify no economy-breaking rewards.

---

# PHASE 87 — KARMA SYSTEM

Use:

```text
karmaScore
majorChoiceFlags
factionFlags
```

Karma bands may be:

```text
Virtuous
Positive
Neutral
Negative
Infamous
```

Initially Karma affects:

- event eligibility;
- merchant access;
- titles;
- dialogue.

Later:

- story branches;
- Black Market;
- unique characters;
- endings.

Recommended Samsara behavior:

```text
current-life Karma resets
Karma Legacy preserves major historical choices
```

Tasks:

- [ ] Karma state.
- [ ] Transaction API.
- [ ] Major-choice flags.
- [ ] Thresholds.
- [ ] UI.
- [ ] Event integration.
- [ ] Quest integration.
- [ ] Save.
- [ ] Analytics.
- [ ] Tests.

---

# PHASE 88 — VILLAGE CHOICE EVENTS

Example:

```text
Help inhabitants
→ positive Karma
→ lower immediate reward
→ future goodwill

Loot village
→ negative Karma
→ higher immediate reward
→ future consequences
```

Tasks:

- [ ] Village template.
- [ ] Positive outcomes.
- [ ] Negative outcomes.
- [ ] Neutral/selfish outcomes.
- [ ] Follow-up event.
- [ ] Karma feedback.
- [ ] Choice history.
- [ ] Reward balance.

---

# PHASE 89 — EVENT-DRIVEN CHARACTER RECRUITMENT

Preferred simplification:

Use existing Hero roster as destination for narrative recruits when possible.

Events can permanently unlock specific Heroes.

Tasks:

- [ ] Decide Hero/recruit integration.
- [ ] Add event unlock outcome.
- [ ] Add recruit presentation.
- [ ] Add roster update.
- [ ] Prevent duplicate unlock.
- [ ] Add Karma-gated recruit.
- [ ] Add class-gated recruit.
- [ ] Analytics.

---

# PHASE 90 — SMALL MARKET MVP

Launch categories:

- consumable boosts;
- resources;
- materials;
- selected equipment;
- services;
- occasional special offers.

Tasks:

- [ ] Market schema.
- [ ] Stock generator.
- [ ] Purchase transaction.
- [ ] Refresh rules.
- [ ] Price scaling.
- [ ] Market UI.
- [ ] World-based inventory.
- [ ] Starter goods.
- [ ] Anti-buy exploit.
- [ ] Simulator impact.
- [ ] Analytics.

---

# PHASE 91 — TIER A PLAYABLE GATE

At this point the game must include:

```text
4 Classes
+
branching development trees
+
2 Main Characters
+
Rhythm Attack
+
Random Events
+
Basic Karma
+
Event Recruitment
+
Small Market
```

Create:

```text
RPG_CORE_PLAYTEST_REPORT.md
```

Do not proceed to Pets/Settlement until this gate passes.

---

# PHASE 92 — RPG CORE BALANCE PASS

Simulate representative profiles:

- 4 classes;
- active/idle;
- single/dual character;
- rhythm/no rhythm;
- positive/negative Karma;
- Market use.

Measure:

- Campaign speed;
- Reincarnation timing;
- Gold;
- loot;
- Market value;
- event value;
- class endpoints;
- second-character contribution.

Deliverable:

```text
RPG_BALANCE_V1.md
```

---

# PHASE 93 — PET FOUNDATION

Pets should focus on growth and attachment rather than duplicating Heroes.

Pet features:

- growth;
- evolution;
- traits;
- combat bonus;
- debuff;
- class synergy.

Tasks:

- [ ] Pet schema.
- [ ] Ownership.
- [ ] Active Pet slot.
- [ ] Growth level.
- [ ] Evolution stage.
- [ ] Traits.
- [ ] Combat hooks.
- [ ] Debuff hooks.
- [ ] Save.
- [ ] Pet UI.
- [ ] Simulator support.

---

# PHASE 94 — PET ACQUISITION & GROWTH

Sources:

- event;
- quest;
- Market;
- rare boss;
- Pet House later.

Avoid too many maintenance meters.

Tasks:

- [ ] First Pet acquisition.
- [ ] Growth action.
- [ ] Evolution requirement.
- [ ] Trait unlocks.
- [ ] Visual growth.
- [ ] Pet events.
- [ ] Balance.

---

# PHASE 95 — PET / CLASS SYNERGY

Examples:

- Summoner amplifies Pets.
- Hunter/Archer gains tracking/loot synergy.
- Dark paths unlock unusual Pets.

Tasks:

- [ ] Class-pet tags.
- [ ] Summoner interaction.
- [ ] Hunter interaction.
- [ ] Dark future hooks.
- [ ] Balance.
- [ ] UI explanation.

---

# PHASE 96 — SETTLEMENT DOMAIN MODEL

Settlement is distinct from Sect.

- Sect = run/incremental production.
- Settlement = persistent world/social/crafting hub.

Settlement state:

```text
settlementOwned
settlementLevel
buildings
residents
npcUnlocks
titles
defense
decorations
flags
```

Tasks:

- [ ] Settlement schema.
- [ ] Unlock.
- [ ] Ownership/purchase path.
- [ ] Settlement screen.
- [ ] Building slots.
- [ ] Resident/NPC registry.
- [ ] Persistent save.
- [ ] Samsara persistence.
- [ ] Analytics.

---

# PHASE 97 — FIRST SETTLEMENT

Recommended MVP buildings:

- Forge;
- Market;
- Tavern;
- Barracks;
- Farm;
- Alchemy Workshop;
- Pet House;
- Throne Hall.

Each building should unlock functionality, not only +%.

Tasks:

- [ ] Building schema.
- [ ] Construct/upgrade flow.
- [ ] Forge.
- [ ] Market integration.
- [ ] Tavern.
- [ ] Barracks.
- [ ] Farm.
- [ ] Alchemy.
- [ ] Pet House.
- [ ] Throne Hall.
- [ ] Settlement progression UI.

---

# PHASE 98 — SETTLEMENT NPCs

NPCs can:

- speak short lines;
- open services;
- give quests/events;
- react to Karma;
- react to title;
- react to settlement state.

Tasks:

- [ ] NPC schema.
- [ ] Dialogue snippets.
- [ ] Context conditions.
- [ ] Click interaction.
- [ ] Service linkage.
- [ ] Karma variants.
- [ ] Quest hooks.
- [ ] Idle animation.

---

# PHASE 99 — CRAFTING FOUNDATION

Core chain:

```text
Find material
→ discover Blacksmith
→ build Forge
→ unlock recipe
→ craft item
→ improve item
```

Keep resource count small.

Tasks:

- [ ] Recipe schema.
- [ ] Material inventory.
- [ ] Forge service.
- [ ] Craft transaction.
- [ ] Recipe unlock.
- [ ] Item creation.
- [ ] Upgrade item.
- [ ] Save.
- [ ] UI.
- [ ] Economy simulation.

---

# PHASE 100 — BLACKSMITH DISCOVERY

Blacksmith types:

- Common;
- Master;
- Dwarf;
- Arcane.

Discovery through:

- event;
- Campaign;
- settlement quest;
- Karma.

Tasks:

- [ ] Blacksmith schema.
- [ ] Discovery event.
- [ ] Settlement recruitment.
- [ ] Craft specialization.
- [ ] NPC presentation.
- [ ] Unlock tracking.
- [ ] Balance.

---

# PHASE 101 — EQUIPMENT SYSTEM

Keep launch slots small:

```text
Weapon
Armor
Accessory
```

Item data:

```text
rarity
slot
baseStats
affixes
classTags
karmaTags
source
upgradeLevel
```

Tasks:

- [ ] Equipment schema.
- [ ] Equip/unequip.
- [ ] Per-character equipment.
- [ ] Compare UI.
- [ ] Affix resolver.
- [ ] Salvage.
- [ ] Save.
- [ ] Simulator.
- [ ] Balance.

---

# PHASE 102 — EQUIPMENT EVOLUTION

Support:

```text
Sword
→ Reinforced Sword
→ Enchanted Sword
→ Legendary Sword
```

Tasks:

- [ ] Upgrade chain.
- [ ] Material costs.
- [ ] Blacksmith requirement.
- [ ] Visual rarity evolution.
- [ ] Affix preservation.
- [ ] Upgrade preview.
- [ ] Balance.

---

# PHASE 103 — EXPANDED MARKET

Categories may include:

- weapons;
- armor;
- consumables;
- resources;
- materials;
- pets;
- settlement items;
- mercenaries;
- services;
- titles.

Unlock progressively.

Tasks:

- [ ] Category expansion.
- [ ] Settlement Market integration.
- [ ] Dynamic merchant quality.
- [ ] World/Karma stock.
- [ ] Rare offers.
- [ ] Inflation protection.
- [ ] Analytics.
- [ ] Balance.

---

# PHASE 104 — MERCENARIES

Mercenaries should preferably be temporary contracts rather than duplicate permanent Heroes.

Types:

- swordsman;
- archer;
- mage;
- healer;
- heavy warrior.

Tasks:

- [ ] Mercenary schema.
- [ ] Contract duration.
- [ ] Market/Tavern source.
- [ ] Party integration.
- [ ] Combat bonus.
- [ ] Expiration.
- [ ] Save/time handling.
- [ ] Balance.

---

# PHASE 105 — TITLES

Sources:

- story;
- settlement;
- achievements;
- Market for selected social/comedic titles;
- Karma;
- secret easter eggs.

Tasks:

- [ ] Title schema.
- [ ] Equip title.
- [ ] Acquisition sources.
- [ ] Karma titles.
- [ ] Settlement titles.
- [ ] Secret titles.
- [ ] UI.
- [ ] Save.

---

# PHASE 106 — BLACK MARKET

Unlock by:

- negative Karma;
- specific event;
- certain class tags.

Goods:

- forbidden spells;
- dark relics;
- unusual Pets;
- rare materials;
- illicit services.

Black Market should offer trade-offs, not strictly superior goods.

Tasks:

- [ ] Eligibility.
- [ ] Unique stock.
- [ ] Karma costs.
- [ ] Class-tag offers.
- [ ] Dark Pet hooks.
- [ ] Forbidden equipment.
- [ ] Analytics.
- [ ] Balance.

---

# PHASE 107 — SETTLEMENT DEFENSE

Threats:

- goblins;
- bandits;
- undead;
- regional factions.

Never destroy weeks of progress for being offline.

Tasks:

- [ ] Raid schema.
- [ ] Defense score.
- [ ] Barracks contribution.
- [ ] Team contribution.
- [ ] Raid combat.
- [ ] Rewards.
- [ ] Failure policy.
- [ ] Offline handling.
- [ ] Balance.

---

# PHASE 108 — SETTLEMENT STORY PATH

Possible arc:

```text
Acquire settlement
↓
help residents
↓
gain title
↓
Kingdom notices player
↓
choose involvement
```

Player may:

- become Lord;
- remain Adventurer.

Tasks:

- [ ] Story flags.
- [ ] Lord path.
- [ ] Adventurer path.
- [ ] Kingdom NPC.
- [ ] Karma interactions.
- [ ] Titles.
- [ ] World consequences.

---

# PHASE 109 — NARRATIVE EVENT CHAINS

Example:

```text
Village attacked
↓
help villagers
↓
meet wounded guard later
↓
find bandit camp
↓
choose justice / bribe / join
↓
future Market/Karma/NPC changes
```

Tasks:

- [ ] Chain schema.
- [ ] Delayed follow-up.
- [ ] World flags.
- [ ] Branch resolution.
- [ ] Samsara replay behavior.
- [ ] Narrative testing.
- [ ] First 5 production chains.

---

# PHASE 110 — KARMA CONSEQUENCES V2

Positive possibilities:

- trusted merchants;
- specific Hero;
- settlement bonuses;
- kingdom titles.

Negative possibilities:

- Black Market;
- dark Hero;
- forbidden crafting;
- intimidation options.

Neutral must also have content.

Tasks:

- [ ] Positive thresholds.
- [ ] Negative thresholds.
- [ ] Neutral content.
- [ ] Event pools.
- [ ] Market pools.
- [ ] Hero recruits.
- [ ] Titles.
- [ ] Story hooks.

---

# PHASE 111 — ENDING / LEGACY FRAMEWORK

Use a `Legacy Ending` concept rather than hard game-over.

Possible outcomes:

- kingdom hero;
- tyrant/lord;
- wandering immortal;
- dark sovereign;
- master of the Sect.

After an ending, Samsara/continued progression remains possible.

Tasks:

- [ ] Ending conditions.
- [ ] Legacy record.
- [ ] Ending presentation.
- [ ] Permanent cosmetic/title reward.
- [ ] No hard game-over.
- [ ] Analytics.

---

# PHASE 112 — OPTIONAL RELATIONSHIP SYSTEM DESIGN GATE

Do NOT automatically implement relationships/spouses.

First create:

```text
RELATIONSHIP_SYSTEM_PROPOSAL.md
```

Evaluate:

- player value;
- content cost;
- narrative burden;
- age-rating implications;
- UI complexity;
- Karma/Settlement interactions.

Proceed only if justified.

---

# PHASE 113 — CROSS-SYSTEM CONTENT PASS

Analyze at minimum:

```text
Class ↔ Rhythm
Class ↔ Pet
Class ↔ Equipment
Class ↔ Market
Class ↔ Karma
Class ↔ Black Market

Karma ↔ Events
Karma ↔ Market
Karma ↔ Heroes
Karma ↔ Settlement
Karma ↔ Titles

Settlement ↔ Crafting
Settlement ↔ Pets
Settlement ↔ Market
Settlement ↔ Mercenaries
Settlement ↔ Quests

Events ↔ Heroes
Events ↔ Blacksmiths
Events ↔ Pets
Events ↔ Materials
Events ↔ Settlement
```

Tasks:

- [ ] Produce interaction matrix.
- [ ] Find isolated systems.
- [ ] Add meaningful links.
- [ ] Remove redundant links.
- [ ] Prevent circular unlock deadlocks.
- [ ] Update docs.

---

# PHASE 114 — UX INFORMATION ARCHITECTURE V3

Goal: prevent menu hell.

Candidate main navigation:

```text
Character
Battle
Team
Settlement
More
```

`More` may contain:

- Quests;
- Market;
- Pets;
- Crafting;
- Titles;
- Tower;
- Achievements;
- Samsara;
- Settings.

Tasks:

- [ ] Audit navigation.
- [ ] Reduce duplicate screens.
- [ ] Contextual CTA system.
- [ ] Notification badges.
- [ ] Mobile nav.
- [ ] Desktop nav.
- [ ] Back stack.
- [ ] Menu performance.

---

# PHASE 115 — SAVE SCHEMA V3

Persist:

- Main Characters;
- Classes;
- Class trees;
- rhythm milestones;
- event history;
- Karma;
- Market state;
- Pets;
- Settlement;
- Blacksmiths;
- Crafting;
- Equipment;
- Titles;
- Mercenaries;
- narrative flags.

Tasks:

- [ ] Bump save version.
- [ ] Migrate protagonist.
- [ ] Add class data.
- [ ] Add second character.
- [ ] Add event state.
- [ ] Add Karma.
- [ ] Add Pets.
- [ ] Add Settlement.
- [ ] Add Crafting.
- [ ] Add Equipment.
- [ ] Add Titles.
- [ ] Add narrative flags.
- [ ] Corruption recovery.
- [ ] Cloud conflict tests.
- [ ] Save-size audit.

---

# PHASE 116 — ANALYTICS V3

Add events for:

- class selection;
- tree nodes;
- respec;
- rhythm bands;
- events/choices;
- Karma thresholds;
- Market;
- Black Market;
- Pets;
- Settlement;
- crafting.

Do not log every tap/hit individually.

---

# PHASE 117 — COMPLETE BALANCE SIMULATOR V3

Add modeling for:

- class;
- branch;
- second character;
- rhythm activity;
- event expected value;
- Karma path;
- Market;
- Pet;
- equipment;
- settlement;
- crafting.

Use representative deterministic profiles where narrative randomness cannot be simulated directly.

Deliver reports:

```text
CLASS_BUILD_MATRIX.csv
RHYTHM_VALUE.csv
EVENT_EXPECTED_VALUE.csv
MARKET_VALUE.csv
PET_VALUE.csv
SETTLEMENT_VALUE.csv
CRAFTING_VALUE.csv
```

---

# PHASE 118 — CONTENT AUTHORING TOOLING

The game is now content-heavy.

Create:

- validated JSON/YAML or equivalent;
- schema validator;
- duplicate ID detector;
- broken reference detector;
- unreachable event detector;
- localization key validator.

Domains:

- Classes;
- Tree nodes;
- Events;
- NPCs;
- Market goods;
- Pets;
- Recipes;
- Equipment;
- Titles.

---

# PHASE 119 — FULL RPG QA

Required routes:

### Good Karma
- positive decisions;
- normal Market;
- settlement;
- positive recruit.

### Negative Karma
- dark choices;
- Black Market;
- dark equipment/event.

### Active Rhythm
- rhythm-benefiting class.

### Idle
- minimal manual input.

### Pet Build
- Summoner/Hunter.

### Crafting Build
- Settlement/Forge.

No route may softlock or require unavailable resources.

---

# PHASE 120 — RPG RELEASE GATE

A build passes when a fresh player can:

1. choose a class;
2. progress through its tree;
3. unlock a second Main Character;
4. use two builds;
5. tap normally;
6. use rhythm optionally;
7. encounter random events;
8. make a Karma choice;
9. see later consequences;
10. recruit through an event;
11. use Market;
12. continue Campaign;
13. Reincarnate safely.

Expanded release additionally supports:

14. Pet;
15. Pet evolution;
16. Settlement;
17. functional Settlement buildings;
18. NPC interaction;
19. Blacksmith discovery;
20. Crafting;
21. Equipment;
22. Titles;
23. Black Market;
24. Settlement defense;
25. at least one multi-event narrative chain.

---

# PHASE 121 — LIVE CONTENT STRATEGY

Prioritize future content:

1. class endpoints;
2. event chains;
3. companions;
4. Pets;
5. equipment;
6. Settlement NPCs;
7. Black Market goods;
8. titles;
9. endings.

Do not add a new foundational system every update.

---

# PHASE 122 — FUTURE CLASS EXPANSION

Possible future specialization families:

### Mage
- Summoner;
- Elementalist.

### Swordsman
- Paladin;
- Dark Guard.

### Archer
- Crossbow specialist;
- Hunter.

### Assassin
- Tracker;
- deeper shadow paths.

Extend existing tree architecture rather than creating a second class system.

---

# PHASE 123 — WORLD CONSEQUENCE EXPANSION

Use choices to alter:

- merchants;
- dialogue;
- recruit options;
- Settlement residents;
- factions;
- bosses;
- endings.

Prefer targeted consequences over an expensive fully simulated world.

---

# PHASE 124 — LIVEOPS INTEGRATION

Examples:

```text
Bandit Week
→ increased ambush events
→ special mercenary
→ temporary title

Pet Festival
→ pet event chain
→ cosmetic evolution

Dark Moon
→ Black Market stock
→ rare forbidden item
```

Events should remix existing systems.

---

# FINAL SYSTEM MAP

```text
                         MAIN CHARACTERS
                     Classes / Build Trees
                             │
                ┌────────────┴────────────┐
                ▼                         ▼
             RHYTHM                    PARTY
                │                         │
                └────────────┬────────────┘
                             ▼
                          CAMPAIGN
                             │
                     Random Adventures
                             │
                      Choices / Karma
                 ┌───────────┼───────────┐
                 ▼           ▼           ▼
              Market       Heroes     World Flags
                 │                       │
          ┌──────┴──────┐                │
          ▼             ▼                ▼
      Black Market   Materials       Settlement
          │             │                │
          ▼             ▼       ┌────────┼────────┐
       Dark Gear      Crafting   ▼        ▼        ▼
                              NPCs     Pets     Mercenaries
                                │        │
                                └────┬───┘
                                     ▼
                                  Builds
                                     │
                                     ▼
                                  SAMSARA
                                     │
                                     ▼
                           New Life / New Route
```

---

# PRIORITY ORDER

If time is limited:

```text
71  Audit
72  Build Framework
73  Base Classes
74  Tree Engine
75–78  Class Trees
79  Class Balance
80  Two-Character Team
81  Second Character Unlock
82  Rhythm
83  Rhythm Balance
85  Adventure Events
86  Event Content
87  Karma
88  Village Choices
89  Event Recruitment
90  Market MVP
91  PLAYABLE GATE
92  BALANCE GATE
```

Only then:

```text
93–95  Pets
96–98  Settlement
99–102 Crafting / Equipment
103–106 Market / Mercenaries / Titles / Black Market
107–111 World / Narrative consequences
```

---

# AI AGENT EXECUTION RULES

1. Treat previous completed phases as production foundation.
2. Do not rewrite Campaign/Economy/Hero systems without proven necessity.
3. New systems must use the universal Modifier framework.
4. No duplicate stat calculation.
5. Every feature must declare:
   - source of truth;
   - save state;
   - analytics;
   - simulator impact;
   - UI entry point;
   - cross-system links.
6. Class nodes need gameplay identity.
7. Avoid meaningless +5% node spam.
8. Rhythm stays optional.
9. Karma must create consequences.
10. Market must not invalidate loot/crafting.
11. Pets must not duplicate Heroes.
12. Settlement must not duplicate Sect.
13. Crafting must not become inventory bloat.
14. Black Market must offer trade-offs, not strictly better items.
15. Stop at Phase 91 for manual playtest before expansion.
16. Do not implement relationships/politics before core RPG expansion is proven fun.

---

# FINAL DESIGN PRINCIPLE

The target is a run the player can describe as a story:

```text
I started as an Archer.
I chose an attack-speed branch.
I recruited a Mage after helping a traveler.
I learned to hold rhythm during bosses.
I saved a village and became respected.
Later I bought my own settlement.
I found a Dwarf blacksmith.
He crafted my first legendary weapon.
My pet evolved because of my Hunter specialization.
On another Samsara I played an Assassin,
robbed the village instead,
opened the Black Market
and found a completely different route.
```

The game should no longer feel like:

```text
I clicked numbers until numbers got bigger.
```

It should feel like:

```text
My numbers got bigger because I made a build,
made choices,
found things,
met characters
and created my own version of the adventure.
```

# END OF PLAN
