# Phase 71: Current State Architecture Audit for RPG Expansion

## 1. Executive Summary

This document audits the entire existing codebase (`Anime Infinite Ascension`) to establish the architectural integration points for the **RPG Expansion (Phases 71–124)**. The objective is to evolve the incremental autobattler into a rich buildcraft adventure without duplicating existing logic or breaking legacy save data.

---

## 2. Component Audits

### 2.1 Hero & Party Architecture (`src/systems/HeroSystem.ts`, `src/content/heroes.ts`)
- **Current State:** The party system manages up to 3 active collectible Heroes (`activePartyIds`). Heroes possess element affinities, rarity tiers, star ratings, and auto-firing active skills.
- **RPG Expansion Integration:** 
  - **MainCharacters vs Heroes:** We distinguish *Main Characters* (the 1–2 protagonist avatars with chosen Classes, 15-node Skill Trees, and Equipment) from *Heroes* (the collectible roster providing passive party auras and burst skills).
  - Main characters will drive primary manual/auto damage, while Heroes occupy companion slots.

### 2.2 Protagonist & Cultivation Model (`src/systems/TrainingSystem.ts`, `src/systems/AscensionSystem.ts`)
- **Current State:** Base click power and cultivation rank multipliers scale click damage and passive production.
- **RPG Expansion Integration:** The protagonist will be refactored into `MainCharacter[0]`, holding class attributes (*Mage, Swordsman, Archer, Assassin*) and stat profiles that feed directly into the combat resolver.

### 2.3 Manual Attack & Combo System (`src/systems/CampaignCombatService.ts`)
- **Current State:** `playerAttack()` performs single-hit manual damage, checking critical hit chance and triggering screen shakes / slash VFX.
- **RPG Expansion Integration:** The **Rhythm Attack Engine** (Phase 82) hooks directly into `playerAttack()`, measuring input timestamp delta against a continuous BPM beat clock to award Perfect/Good/Miss accuracy and streak buffs.

### 2.4 Critical Hit Formula (`src/systems/CampaignCombatService.ts`)
- **Current State:** `isCrit = Math.random() < critChance; damage = isCrit ? baseDmg * critMultiplier : baseDmg`.
- **RPG Expansion Integration:** Will route through the **Universal Modifier Resolver** (Phase 72) with strict capping rules to prevent runaway crit multiplier exponential explosions.

### 2.5 Quest & Event Hooks (`src/systems/QuestSystem.ts`, `src/core/EventBus.ts`)
- **Current State:** Reactive event subscription (`train:click`, `campaign:enemy_defeated`, `tower:floorClear`).
- **RPG Expansion Integration:** Adventure Events (Phase 85) will subscribe to stage clear events, allowing random and deterministic narrative encounters (Chests, Travelers, Ambush, Village Dilemmas) to seamlessly trigger between combat waves.

### 2.6 Campaign Stage Transitions (`src/systems/CampaignCombatService.ts`)
- **Current State:** `advanceToNextStage()` and `advanceToNextEncounter()` control progression and boss enrage timers.
- **RPG Expansion Integration:** Provides non-intrusive event interceptors without disrupting auto-farm or Samsara Rush loops.

### 2.7 Market, Inventory & Equipment Placeholders
- **Current State:** Relics inventory and gacha summon screens exist, but no persistent player equipment grid or consumable market.
- **RPG Expansion Integration:** Phase 90 introduces `Small Market` and Phase 101 introduces the 3-slot equipment model (`Weapon`, `Armor`, `Accessory`).

### 2.8 Save Schema Extensibility (`src/services/save/SaveMigrations.ts`)
- **Current State:** `SaveData` version 5 with modular sub-states (`stats`, `buildings`, `upgrades`, `heroes`, `campaign`, `relics`).
- **RPG Expansion Integration:** Version 6 will introduce optional sub-objects: `characters`, `karma`, `settlement`, `pets`, `inventory`, `crafting`, ensuring 100% backward compatibility with V1–V5 saves.

### 2.9 Analytics Extensibility (`src/services/analytics/AnalyticsService.ts`)
- **Current State:** Batched attack reporting and first-session funnels.
- **RPG Expansion Integration:** Event tracking hooks for Class selection, Tree node unlocks, Karma shifts, Market purchases, and Pet evolution.

### 2.10 Simulator Support (`src/economy/EconomySimulator.ts`)
- **Current State:** Deterministic multi-tier simulation over 1h/8h/24h cycles.
- **RPG Expansion Integration:** Extended with Class stat multipliers, dual-character synergy, and rhythm mastery multipliers.

---

## 3. Systems That Classes Can Modify

1. **Combat Stats:** Manual ATK, Auto ATK, Crit Chance, Crit DMG, Boss DMG, Attack Speed.
2. **Economic Production:** Gold Multiplier, Sect Spirit Stones, Soul Essence.
3. **Adventure Dynamics:** Rare Event Trigger Rate, Merchant Discounts, Karma Gain/Loss Modifiers.
4. **Party Synergies:** Hero Skill Cooldown Reduction, Elemental Attunement Boosts.
5. **Pet & Crafting Buffs:** Pet growth speed, Forge critical crafting chance.

---

## 4. Systems That Must NOT Be Duplicated

1. **Do NOT duplicate Sect with Settlement:** Sect remains the instant-run gold generator; Settlement is the persistent meta world hub with NPCs, Forge, and Defense.
2. **Do NOT duplicate Heroes with MainCharacters:** Heroes are gacha/narrative companions; MainCharacters are custom player build avatars.
3. **Do NOT create separate combat loops for Events/LiveOps:** All activities leverage `CampaignCombatService` and `EventBus`.
