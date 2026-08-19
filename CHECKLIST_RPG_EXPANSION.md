# CHECKLIST_RPG_EXPANSION.md — Anime Infinite Ascension (Phase 71–124)
## RPG Expansion: Builds, Rhythm, Adventure, Karma, Settlement & World Systems

---

## 🎯 Tier A: Core RPG & Buildcraft (Phases 71–92)

- [x] **Phase 71 — Current State Audit for the RPG Expansion**
  - [x] P71-T01 — Audit current Hero / Party architecture.
  - [x] P71-T02 — Audit protagonist data model.
  - [x] P71-T03 — Audit manual Attack/Combo system.
  - [x] P71-T04 — Audit current Crit formula.
  - [x] P71-T05 — Audit Quest/Event hooks.
  - [x] P71-T06 — Audit Campaign stage transition hooks.
  - [x] P71-T07 — Audit current Market/Shop components if any.
  - [x] P71-T08 — Audit current inventory/equipment placeholders.
  - [x] P71-T09 — Audit save schema extensibility.
  - [x] P71-T10 — Audit analytics extensibility.
  - [x] P71-T11 — Audit simulator support for build-specific modifiers.
  - [x] P71-T12 — Identify existing systems that classes can modify.
  - [x] P71-T13 — Identify duplicated systems that must NOT be recreated.
  - [x] P71-T14 — Produce dependency graph (`docs/RPG_EXPANSION_AUDIT.md` & `docs/RPG_SYSTEM_DEPENDENCY_MAP.md`).

- [x] **Phase 72 — Universal Modifier / Build Framework**
  - [x] P72-T01 — Create modifier schema.
  - [x] P72-T02 — Create central modifier resolver.
  - [x] P72-T03 — Add conditional modifiers.
  - [x] P72-T04 — Add class tags.
  - [x] P72-T05 — Add source attribution.
  - [x] P72-T06 — Extend combat breakdown UI.
  - [x] P72-T07 — Extend debug breakdown.
  - [x] P72-T08 — Extend simulator.
  - [x] P72-T09 — Unit tests for stacking.
  - [x] P72-T10 — Regression tests for old Rank/Hero/Soul modifiers.
  - [x] P72-T11 — Prevent double-application.

- [x] **Phase 73 — Four Base Classes**
  - [x] P73-T01 — Create Class definition schema.
  - [x] P73-T02 — Create 4 base class configs (Mage, Swordsman, Archer, Assassin).
  - [x] P73-T03 — Add class selection flow.
  - [x] P73-T04 — Add class-specific stat profile.
  - [x] P73-T05 — Add class icons.
  - [x] P73-T06 — Add class description.
  - [x] P73-T07 — Add starter visual differentiation.
  - [x] P73-T08 — Add class to save.
  - [x] P73-T09 — Add class analytics.
  - [x] P73-T10 — Add class to simulator.
  - [x] P73-T11 — Prevent class switching exploit.
  - [x] P73-T12 — Decide respec policy.

- [x] **Phase 74 — Class Development Tree Engine**
  - [x] P74-T01 — Create skill tree schema (1→2→4→8 node branching).
  - [x] P74-T02 — Create node prerequisite engine.
  - [x] P74-T03 — Create exclusive branch handling.
  - [x] P74-T04 — Create skill tree UI.
  - [x] P74-T05 — Create preview-before-choice.
  - [x] P74-T06 — Create confirmation flow.
  - [x] P74-T07 — Add respec support architecture.
  - [x] P74-T08 — Add tree to save.
  - [x] P74-T09 — Add tree to combat simulator.
  - [x] P74-T10 — Add node unlock analytics.
  - [x] P74-T11 — Add test tree.
  - [x] P74-T12 — Verify 1→2→4→8 traversal.
  - [x] P74-T13 — Verify invalid branch cannot be selected.
  - [x] P74-T14 — Verify old save migration.

- [x] **Phase 75 — Class Trees: Mage**
  - [x] P75-T01 — Design full 15-node Mage tree.
  - [x] P75-T02 — Implement Arcane / Elemental modifiers.
  - [x] P75-T03 — Implement signature burst & summoning effects.
  - [x] P75-T04 — Add UI copy & descriptions.
  - [x] P75-T05 — Add simulator profiles for Mage.
  - [x] P75-T06 — Balance endpoints vs base progression.
  - [x] P75-T07 — Add future Pet hooks for Summoner.

- [x] **Phase 76 — Class Trees: Swordsman**
  - [x] P76-T01 — Design full 15-node Swordsman tree.
  - [x] P76-T02 — Implement Paladin / Dark Guard / Berserker branches.
  - [x] P76-T03 — Add Party synergies and defense auras.
  - [x] P76-T04 — Add simulator profiles for Swordsman.
  - [x] P76-T05 — Balance vs Mage endpoints.
  - [x] P76-T06 — Add future Settlement/Title hooks.

- [x] **Phase 77 — Class Trees: Archer**
  - [x] P77-T01 — Design full 15-node Archer tree.
  - [x] P77-T02 — Implement Attack Speed / Crossbow / Hunter branches.
  - [x] P77-T03 — Add rhythm attack synergy.
  - [x] P77-T04 — Add Pet hooks for Hunter.
  - [x] P77-T05 — Add Party synergies.
  - [x] P77-T06 — Add simulator profiles for Archer.
  - [x] P77-T07 — Balance endpoints.

- [x] **Phase 78 — Class Trees: Assassin**
  - [x] P78-T01 — Design full 15-node Assassin tree.
  - [x] P78-T02 — Implement Crit / Execute / Poison / Shadow branches.
  - [x] P78-T03 — Add loot bonus & rhythm synergy.
  - [x] P78-T04 — Add Karma & Black Market affinity tags.
  - [x] P78-T05 — Add simulator profiles for Assassin.
  - [x] P78-T06 — Balance & prevent crit damage explosion.

- [x] **Phase 79 — Class Balance Pass**
  - [x] P79-T01 — Compare first 5m / 30m / bosses / campaign across all 4 classes.
  - [x] P79-T02 — Compare manual vs idle throughput.
  - [x] P79-T03 — Verify no single class dominates all categories.
  - [x] P79-T04 — Produce `docs/CLASS_BALANCE_REPORT.md`.

- [x] **Phase 80 — Two-Character Team Core**
  - [x] P80-T01 — Create MainCharacter data model.
  - [x] P80-T02 — Migrate single protagonist to Character 1.
  - [x] P80-T03 — Add second MainCharacter slot.
  - [x] P80-T04 — Separate MainCharacters (classes/builds) vs Heroes (gacha/synergies).
  - [x] P80-T05 — Add character switch UI & HUD indicator.
  - [x] P80-T06 — Add individual class tree for each character.
  - [x] P80-T07 — Add individual stat computation.
  - [x] P80-T08 — Define shared vs individual resource rules.
  - [x] P80-T09 — Save both builds cleanly.
  - [x] P80-T10 — Add Reincarnation reset & persistence rules.
  - [x] P80-T11 — Extend simulator for 2-character teams.
  - [x] P80-T12 — Adapt visual battlefield for dual main characters.

- [x] **Phase 81 — Second Character Unlock**
  - [x] P81-T01 — Design memorable unlock event / story quest.
  - [x] P81-T02 — Create unlock quest requirements (e.g. World 2 clear).
  - [x] P81-T03 — Add class selection for second character.
  - [x] P81-T04 — Add unlock onboarding flow.
  - [x] P81-T05 — Prevent duplicate unlock exploit.
  - [x] P81-T06 — Balance unlock timing and power spikes.

- [x] **Phase 82 — Rhythm Attack Engine**
  - [x] P82-T01 — Define rhythm clock (BPM sync).
  - [x] P82-T02 — Define timing windows (Perfect / Good / Miss).
  - [x] P82-T03 — Add visual beat indicator on combat screen.
  - [x] P82-T04 — Add optional synthesized beat SFX.
  - [x] P82-T05 — Add combo streak tracking.
  - [x] P82-T06 — Add timing tolerance & window scaling.
  - [x] P82-T07 — Add streak break rules.
  - [x] P82-T08 — Add accessibility mode (relaxed timing).
  - [x] P82-T09 — Add touch latency compensation.
  - [x] P82-T10 — Add mouse & keyboard (Space/Z) hotkey support.
  - [x] P82-T11 — Prevent multi-touch / macro autoclicker exploit.
  - [x] P82-T12 — Add rhythm analytics.
  - [x] P82-T13 — Add rhythm simulator profile.

- [x] **Phase 83 — Rhythm Reward Curve**
  - [x] P83-T01 — Define progressive reward curve (0–15s build-up, 15–60s combat, 1–2m loot, 2–5m mastery).
  - [x] P83-T02 — Add soft diminishing returns after 5 minutes.
  - [x] P83-T03 — Add class-specific hooks.
  - [x] P83-T04 — Add Assassin rhythm burst synergy.
  - [x] P83-T05 — Add Archer attack speed rhythm synergy.
  - [x] P83-T06 — Add loot drop bonus.
  - [x] P83-T07 — Compare active rhythm vs idle baseline in simulator.
  - [x] P83-T08 — Prevent loot economy collapse.

- [x] **Phase 84 — Long-Rhythm Easter Egg**
  - [x] P84-T01 — Long-rhythm milestone tracker (e.g. 500 streak).
  - [x] P84-T02 — Secret humorous dialogue & Easter Egg encounter.
  - [x] P84-T03 — Unique cosmetic title & badge (*«Rhythm Master»*).
  - [x] P84-T04 — Debug trigger.
  - [x] P84-T05 — Save unlock persistence.

- [x] **Phase 85 — Adventure Event Framework**
  - [x] P85-T01 — Create Adventure Event schema (tags, conditions, choices, outcomes).
  - [x] P85-T02 — Event scheduler (triggers between encounters or timers).
  - [x] P85-T03 — Eligibility resolver (Karma, World, Class, Party requirements).
  - [x] P85-T04 — Weighted random selection.
  - [x] P85-T05 — Event cooldowns.
  - [x] P85-T06 — Once-only unique events.
  - [x] P85-T07 — Interactive Event Modal UI.
  - [x] P85-T08 — Multi-choice UI with requirement badges.
  - [x] P85-T09 — Atomic outcome transaction.
  - [x] P85-T10 — Follow-up event chains.
  - [x] P85-T11 — Save event history and flags.
  - [x] P85-T12 — Analytics tracking for event choices.

- [x] **Phase 86 — Basic Random Event Content**
  - [x] P86-T01 — Design 5 Chest/Loot events.
  - [x] P86-T02 — Design 5 Traveler/NPC encounters.
  - [x] P86-T03 — Design 4 Merchant encounters.
  - [x] P86-T04 — Design 4 Ambush/Combat events.
  - [x] P86-T05 — Design 4 Village choice events.
  - [x] P86-T06 — Design 3 Recruit events and 5 Rare/Weird encounters.

- [x] **Phase 87 — Karma System**
  - [x] P87-T01 — Karma state (`karmaScore`, `majorChoiceFlags`, `factionFlags`).
  - [x] P87-T02 — Atomic Karma transaction API (`addKarma`, `subtractKarma`).
  - [x] P87-T03 — Major choice historical flags.
  - [x] P87-T04 — Karma bands (Virtuous, Positive, Neutral, Negative, Infamous).
  - [x] P87-T05 — Karma UI meter & alignment indicator.
  - [x] P87-T06 — Event eligibility integration.
  - [x] P87-T07 — Quest integration.
  - [x] P87-T08 — Save persistence & Samsara Karma Legacy rules.
  - [x] P87-T09 — Analytics tracking for Karma shifts.
  - [x] P87-T10 — Unit tests for boundary conditions.

- [x] **Phase 88 — Village Choice Events**
  - [x] P88-T01 — Village encounter template.
  - [x] P88-T02 — Positive outcome branch (Help villagers $\to$ +Karma, future goodwill).
  - [x] P88-T03 — Negative outcome branch (Loot village $\to$ -Karma, high instant gold).
  - [x] P88-T04 — Neutral / Selfish outcome branch.
  - [x] P88-T05 — Delayed follow-up event trigger.
  - [x] P88-T06 — Visual & audio Karma feedback.
  - [x] P88-T07 — Choice history logging.
  - [x] P88-T08 — Economic balance verification.

- [x] **Phase 89 — Event-Driven Character Recruitment**
  - [x] P89-T01 — Hero / Recruit roster integration architecture.
  - [x] P89-T02 — Event unlock outcome handler.
  - [x] P89-T03 — Special recruitment presentation modal.
  - [x] P89-T04 — Dynamic roster update.
  - [x] P89-T05 — Prevent duplicate recruit exploits.
  - [x] P89-T06 — Add Karma-gated recruit (e.g. Dark Cultist for Negative Karma).
  - [x] P89-T07 — Add Class-gated recruit (e.g. Arcane Familiar for Mage).
  - [x] P89-T08 — Analytics tracking for event recruits.

- [x] **Phase 90 — Small Market MVP**
  - [x] P90-T01 — Market schema and item registry.
  - [x] P90-T02 — Stock generator (consumable boosts, materials, special items).
  - [x] P90-T03 — Secure purchase transaction.
  - [x] P90-T04 — Dynamic refresh rules & cooldown timers.
  - [x] P90-T05 — Price scaling based on current stage/world.
  - [x] P90-T06 — Market UI screen.
  - [x] P90-T07 — World-based inventory variation.
  - [x] P90-T08 — Starter goods configuration.
  - [x] P90-T09 — Anti-buy exploit guards.
  - [x] P90-T10 — Simulator impact integration.
  - [x] P90-T11 — Market telemetry analytics.

- [x] **Phase 91 — Tier A Playable Gate**
  - [x] P91-T01 — Verify all 4 Classes + 15-node trees playable.
  - [x] P91-T02 — Verify 2 Main Characters simultaneous builds.
  - [x] P91-T03 — Verify Rhythm Attack input & rewards.
  - [x] P91-T04 — Verify Random Events & Karma choices.
  - [x] P91-T05 — Verify Event Recruitment & Small Market.
  - [x] P91-T06 — Produce `docs/RPG_CORE_PLAYTEST_REPORT.md`.

- [x] **Phase 92 — RPG Core Balance Pass**
  - [x] P92-T01 — Run simulations across 4 classes, active/idle, rhythm/no-rhythm.
  - [x] P92-T02 — Measure Campaign speed, Reincarnation timing, and gold flow.
  - [x] P92-T03 — Verify 2nd character contribution.
  - [x] P92-T04 — Produce `docs/RPG_BALANCE_V1.md`.

---

## 🏰 Tier B: Meta Expansion (Phases 93–106)

- [x] **Phase 93 — Pet Foundation**
  - [x] P93-T01 — Pet schema & data model.
  - [x] P93-T02 — Pet ownership registry.
  - [x] P93-T03 — Active Pet slot in combat.
  - [x] P93-T04 — Growth level & XP mechanics.
  - [x] P93-T05 — Evolution stage tracking.
  - [x] P93-T06 — Passive traits & buffs.
  - [x] P93-T07 — Combat attack hooks.
  - [x] P93-T08 — Enemy debuff hooks.
  - [x] P93-T09 — Save persistence.
  - [x] P93-T10 — Pet UI screen.
  - [x] P93-T11 — Simulator integration.

- [x] **Phase 94 — Pet Acquisition & Growth**
  - [x] P94-T01 — First Pet acquisition event/quest.
  - [x] P94-T02 — Pet feeding/growth actions without tedious maintenance.
  - [x] P94-T03 — Evolution milestone requirements.
  - [x] P94-T04 — Trait unlock system.
  - [x] P94-T05 — Visual growth & sprite variants.
  - [x] P94-T06 — Pet-specific adventure events.
  - [x] P94-T07 — Growth economy balance.

- [x] **Phase 95 — Pet / Class Synergy**
  - [x] P95-T01 — Class-pet synergy tags.
  - [x] P95-T02 — Summoner Mage amplification.
  - [x] P95-T03 — Hunter Archer tracking & loot synergy.
  - [x] P95-T04 — Dark path unique pet hooks.
  - [x] P95-T05 — Mathematical balance verification.
  - [x] P95-T06 — UI synergy explanation.

- [x] **Phase 96 — Settlement Domain Model**
  - [x] P96-T01 — Settlement data model (distinct from Sect).
  - [x] P96-T02 — Settlement unlock quest/milestone.
  - [x] P96-T03 — Ownership/purchase path.
  - [x] P96-T04 — Settlement screen UI shell.
  - [x] P96-T05 — Building plot slots.
  - [x] P96-T06 — Resident & NPC registry.
  - [x] P96-T07 — Persistent save state.
  - [x] P96-T08 — Samsara persistence rules.
  - [x] P96-T09 — Settlement analytics.

- [x] **Phase 97 — First Settlement Buildings**
  - [x] P97-T01 — Building definition schema.
  - [x] P97-T02 — Construct / upgrade flow.
  - [x] P97-T03 — Forge (crafting/blacksmith hub).
  - [x] P97-T04 — Market (expanded trading).
  - [x] P97-T05 — Tavern (mercenary recruitment).
  - [x] P97-T06 — Barracks (defense rating).
  - [x] P97-T07 — Farm (food / resource production).
  - [x] P97-T08 — Alchemy Workshop (potions/boosts).
  - [x] P97-T09 — Pet House (pet housing/breeding).
  - [x] P97-T10 — Throne Hall (settlement governance).
  - [x] P97-T11 — Settlement progression UI.

- [x] **Phase 98 — Settlement NPCs**
  - [x] P98-T01 — NPC definition schema.
  - [x] P98-T02 — Contextual dialogue snippets.
  - [x] P98-T03 — Interaction condition checks.
  - [x] P98-T04 — Click interaction & speech bubbles.
  - [x] P98-T05 — NPC service linkages.
  - [x] P98-T06 — Karma-reactive dialogue variants.
  - [x] P98-T07 — NPC quest triggers.
  - [x] P98-T08 — Idle animations.

- [x] **Phase 99 — Crafting Foundation**
  - [x] P99-T01 — Recipe schema.
  - [x] P99-T02 — Compact material inventory.
  - [x] P99-T03 — Forge crafting service.
  - [x] P99-T04 — Atomic craft transaction.
  - [x] P99-T05 — Recipe discovery & unlocking.
  - [x] P99-T06 — Item creation & affix roll.
  - [x] P99-T07 — Item enhancement / refinement.
  - [x] P99-T08 — Save persistence.
  - [x] P99-T09 — Crafting UI screen.
  - [x] P99-T10 — Economy simulation.

- [x] **Phase 100 — Blacksmith Discovery**
  - [x] P100-T01 — Blacksmith archetypes (Common, Master, Dwarf, Arcane).
  - [x] P100-T02 — Discovery events across worlds.
  - [x] P100-T03 — Settlement recruitment.
  - [x] P100-T04 — Crafting specialization perks.
  - [x] P100-T05 — NPC presentation.
  - [x] P100-T06 — Unlock tracking.
  - [x] P100-T07 — Balance.

- [x] **Phase 101 — Equipment System**
  - [x] P101-T01 — Equipment schema (Weapon, Armor, Accessory).
  - [x] P101-T02 — Equip / unequip transaction.
  - [x] P101-T03 — Per-character gear loadout.
  - [x] P101-T04 — Equipment compare UI.
  - [x] P101-T05 — Affix resolver & stat injection.
  - [x] P101-T06 — Salvage system.
  - [x] P101-T07 — Save state.
  - [x] P101-T08 — Simulator support.
  - [x] P101-T09 — Balance.

- [x] **Phase 102 — Equipment Evolution**
  - [x] P102-T01 — Evolution upgrade chains (Common $\to$ Reinforced $\to$ Enchanted $\to$ Legendary).
  - [x] P102-T02 — Material costs & scaling.
  - [x] P102-T03 — Blacksmith tier requirement.
  - [x] P102-T04 — Visual rarity evolution & frames.
  - [x] P102-T05 — Affix preservation & upgrade.
  - [x] P102-T06 — Upgrade preview UI.
  - [x] P102-T07 — Balance.

- [x] **Phase 103 — Expanded Market**
  - [x] P103-T01 — Category expansion (Weapons, Armor, Pets, Resources, Titles).
  - [x] P103-T02 — Settlement Market tier integration.
  - [x] P103-T03 — Dynamic merchant inventory quality.
  - [x] P103-T04 — World & Karma stock filtering.
  - [x] P103-T05 — Rare rotating offers.
  - [x] P103-T06 — Inflation protection.
  - [x] P103-T07 — Market analytics.
  - [x] P103-T08 — Balance.

- [x] **Phase 104 — Mercenaries**
  - [x] P104-T01 — Mercenary schema (temporary contracts).
  - [x] P104-T02 — Contract duration timer.
  - [x] P104-T03 — Tavern recruitment source.
  - [x] P104-T04 — Temporary party slot integration.
  - [x] P104-T05 — Combat bonuses.
  - [x] P104-T06 — Contract expiration handling.
  - [x] P104-T07 — Save & offline time handling.
  - [x] P104-T08 — Balance.

- [x] **Phase 105 — Titles**
  - [x] P105-T01 — Title schema and stat bonuses.
  - [x] P105-T02 — Equip / select title.
  - [x] P105-T03 — Acquisition sources (story, achievements, settlement).
  - [x] P105-T04 — Karma-specific titles (*«Saint»* / *«Tyrant»*).
  - [x] P105-T05 — Settlement Lord titles.
  - [x] P105-T06 — Secret Easter Egg titles.
  - [x] P105-T07 — Title UI.
  - [x] P105-T08 — Save persistence.

- [x] **Phase 106 — Black Market**
  - [x] P106-T01 — Black Market eligibility (-Karma, special event, dark class).
  - [x] P106-T02 — Unique forbidden stock.
  - [x] P106-T03 — Karma costs & penalties.
  - [x] P106-T04 — Class-tag specific dark offers.
  - [x] P106-T05 — Dark Pet hooks.
  - [x] P106-T06 — Forbidden equipment trade-offs.
  - [x] P106-T07 — Analytics tracking.
  - [x] P106-T08 — Balance.

---

## 🌍 Tier C: Long-Term World Systems & Polish (Phases 107–124)

- [x] **Phase 107 — Settlement Defense & Raids**
  - [x] P107-T01 — Raid threat schema.
  - [x] P107-T02 — Settlement Defense score calculation.
  - [x] P107-T03 — Barracks contribution.
  - [x] P107-T04 — Hero team defense contribution.
  - [x] P107-T05 — Raid auto-resolve & combat.
  - [x] P107-T06 — Victory defense loot.
  - [x] P107-T07 — Failure grace period (no progress destruction).
  - [x] P107-T08 — Safe offline handling.
  - [x] P107-T09 — Balance.

- [x] **Phase 108 — Settlement Story Path**
  - [x] P108-T01 — Narrative story flags.
  - [x] P108-T02 — Lord of the Realm path.
  - [x] P108-T03 — Wandering Adventurer path.
  - [x] P108-T04 — Kingdom emissary NPC.
  - [x] P108-T05 — Karma interactions.
  - [x] P108-T06 — Realm titles.
  - [x] P108-T07 — World consequences.

- [x] **Phase 109 — Narrative Event Chains**
  - [x] P109-T01 — Multi-step Event Chain schema.
  - [x] P109-T02 — Delayed follow-up scheduler.
  - [x] P109-T03 — World consequence flags.
  - [x] P109-T04 — Branch resolution.
  - [x] P109-T05 — Samsara replay behavior.
  - [x] P109-T06 — Narrative testing.
  - [x] P109-T07 — First 5 production event chains.

- [x] **Phase 110 — Karma Consequences v2**
  - [x] P110-T01 — Positive alignment rewards & trusted merchants.
  - [x] P110-T02 — Negative alignment Black Market perks.
  - [x] P110-T03 — Neutral alignment unique content.
  - [x] P110-T04 — Event pool filtering.
  - [x] P110-T05 — Market stock adjustments.
  - [x] P110-T06 — Unique Karma Hero recruits.
  - [x] P110-T07 — Titles.
  - [x] P110-T08 — Story hooks.

- [x] **Phase 111 — Ending / Legacy Framework**
  - [x] P111-T01 — Legacy ending conditions.
  - [x] P111-T02 — Legacy chronicle record.
  - [x] P111-T03 — Ending narrative presentation.
  - [x] P111-T04 — Permanent cosmetic / title reward.
  - [x] P111-T05 — Seamless Samsara continuation (no hard game-over).
  - [x] P111-T06 — Legacy analytics.

- [x] **Phase 112 — Relationship System Proposal Gate**
  - [x] P112-T01 — Create `docs/RELATIONSHIP_SYSTEM_PROPOSAL.md`.
  - [x] P112-T02 — Evaluate player value, narrative cost, and UI complexity.

- [x] **Phase 113 — Cross-System Content Pass**
  - [x] P113-T01 — Produce cross-system interaction matrix.
  - [x] P113-T02 — Identify and connect isolated systems.
  - [x] P113-T03 — Add meaningful cross-system synergies.
  - [x] P113-T04 — Remove redundant links.
  - [x] P113-T05 — Prevent circular unlock deadlocks.
  - [x] P113-T06 — Update architecture documentation.

- [x] **Phase 114 — UX Information Architecture v3**
  - [x] P114-T01 — Audit main navigation shell.
  - [x] P114-T02 — Consolidate duplicate screens.
  - [x] P114-T03 — Contextual CTA system.
  - [x] P114-T04 — Unified notification badge system.
  - [x] P114-T05 — Mobile navigation UX.
  - [x] P114-T06 — Desktop sidebar navigation UX.
  - [x] P114-T07 — Back-stack management.
  - [x] P114-T08 — Menu rendering performance.

- [x] **Phase 115 — Save Schema v3**
  - [x] P115-T01 — Bump save version to V6.
  - [x] P115-T02 — Migrate protagonist to MainCharacter 1.
  - [x] P115-T03 — Add Class and Class tree state.
  - [x] P115-T04 — Add second MainCharacter state.
  - [x] P115-T05 — Add Event & Karma history.
  - [x] P115-T06 — Add Pets.
  - [x] P115-T07 — Add Settlement state.
  - [x] P115-T08 — Add Crafting & Materials.
  - [x] P115-T09 — Add Equipment loadouts.
  - [x] P115-T10 — Add Titles.
  - [x] P115-T11 — Add narrative flags.
  - [x] P115-T12 — Save corruption recovery.
  - [x] P115-T13 — Cloud conflict tests.
  - [x] P115-T14 — Save payload size audit.

- [x] **Phase 116 — Analytics v3**
  - [x] P116-T01 — Track class selection & tree nodes.
  - [x] P116-T02 — Track rhythm streaks.
  - [x] P116-T03 — Track events, choices, and Karma shifts.
  - [x] P116-T04 — Track Market, Black Market, Pets, and Settlement milestones.

- [x] **Phase 117 — Complete Balance Simulator v3**
  - [x] P117-T01 — Extend simulator for classes, rhythm, events, pets, and gear.
  - [x] P117-T02 — Generate `CLASS_BUILD_MATRIX.csv`.
  - [x] P117-T03 — Generate `RHYTHM_VALUE.csv`.
  - [x] P117-T04 — Generate `EVENT_EXPECTED_VALUE.csv`.
  - [x] P117-T05 — Generate `MARKET_VALUE.csv`.
  - [x] P117-T06 — Generate `PET_VALUE.csv`.
  - [x] P117-T07 — Generate `SETTLEMENT_VALUE.csv`.
  - [x] P117-T08 — Generate `CRAFTING_VALUE.csv`.

- [x] **Phase 118 — Content Authoring Tooling**
  - [x] P118-T01 — Schema validators for classes, trees, events, NPCs, market, recipes.
  - [x] P118-T02 — Duplicate ID detector.
  - [x] P118-T03 — Broken reference & unreachable event detector.
  - [x] P118-T04 — Localization key completeness validator.

- [x] **Phase 119 — Full RPG QA**
  - [x] P119-T01 — Good Karma route verification.
  - [x] P119-T02 — Negative Karma & Black Market route verification.
  - [x] P119-T03 — Active Rhythm route verification.
  - [x] P119-T04 — Idle AFK route verification.
  - [x] P119-T05 — Pet Summoner/Hunter route verification.
  - [x] P119-T06 — Crafting Forge route verification.

- [x] **Phase 120 — RPG Release Gate**
  - [x] P120-T01 — Full test suite pass (Unit & E2E).
  - [x] P120-T02 — Clean TypeScript compilation.
  - [x] P120-T03 — Production build bundle optimization.
  - [x] P120-T04 — Zero softlocks, zero missing assets, zero NaN/Infinity.

- [x] **Phase 121 — Live Content Strategy**
  - [x] P121-T01 — Finalize live expansion priority order.

- [x] **Phase 122 — Future Class Expansion**
  - [x] P122-T01 — Architecture ready for advanced specializations.

- [x] **Phase 123 — World Consequence Expansion**
  - [x] P123-T01 — World flag framework ready for live expansions.

- [x] **Phase 124 — LiveOps Integration**
  - [x] P124-T01 — LiveOps event integration across RPG expansion systems.
