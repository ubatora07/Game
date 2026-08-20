# Reference Fusion & Integration Report

**Date:** 2026-08-20  
**Branch:** `feature/idle-rpg-reference-fusion`  
**Target Application:** `ubatora07/Game` (`fantasy.html` / `src/fantasy/`)  
**Lead Engineer:** Senior Game Systems & Engine Architect  

---

## 1. Executive Summary

Four open-source reference repositories were cloned, audited at source code level, and evaluated for architectural, mathematical, presentation, and UX patterns:
1. [`WhiteMinds/trial-tower`](https://github.com/WhiteMinds/trial-tower) (Hedra Engine)
2. [`pablodcruz/embervale-idle`](https://github.com/pablodcruz/embervale-idle)
3. [`MaxMusing/Incremental-RPG`](https://github.com/MaxMusing/Incremental-RPG)
4. [`jacobziemba-dev/bartimaeus-idle-rpg`](https://github.com/jacobziemba-dev/bartimaeus-idle-rpg)

Rather than writing an isolated toy project or copying third-party code verbatim, we extracted the **strongest design pillars** of each project and fused them into our core canonical TypeScript game engine.

---

## 2. Reference Studies & Concrete Adaptations

### A. WhiteMinds / trial-tower (Hedra Engine)
* **What Studied:** `MainStage`, `CombatStage`, `Entity` lifecycle, dynamic attribute modifiers, and plugin hooks (`onKill`, `onCombatEnd`).
* **What Taken / Adapted:** Entity attribute pipeline architecture in [`src/fantasy/engine/UpgradeEngine.ts`](file:///c:/Users/ubatora/Desktop/%D1%81%D0%BE%D1%81%D0%BE%D1%81%D0%BE%D1%81%D0%BE%D1%81%D0%BE%D1%81%D0%BE%D1%81%D0%BE%D1%81%D0%BE%D1%81/src/fantasy/engine/UpgradeEngine.ts) and stage event dispatcher hooks in [`src/fantasy/engine/CombatEngine.ts`](file:///c:/Users/ubatora/Desktop/%D1%81%D0%BE%D1%81%D0%BE%D1%81%D0%BE%D1%81%D0%BE%D1%81%D0%BE%D1%81%D0%BE%D1%81%D0%BE%D1%81/src/fantasy/engine/CombatEngine.ts).
* **Files Modified:**
  - [`src/fantasy/engine/CombatEngine.ts`](file:///c:/Users/ubatora/Desktop/%D1%81%D0%BE%D1%81%D0%BE%D1%81%D0%BE%D1%81%D0%BE%D1%81%D0%BE%D1%81%D0%BE%D1%81/src/fantasy/engine/CombatEngine.ts): State machine transitions with plugin hooks.
  - [`src/fantasy/engine/UpgradeEngine.ts`](file:///c:/Users/ubatora/Desktop/%D1%81%D0%BE%D1%81%D0%BE%D1%81%D0%BE%D1%81%D0%BE%D1%81%D0%BE%D1%81%D0%BE%D1%81/src/fantasy/engine/UpgradeEngine.ts): Aggregate stat multiplier pipeline.

### B. pablodcruz / embervale-idle
* **What Studied:** `simulation != presentation` core thesis in `scripts/idle_simulator.gd`. The mathematical simulation is strictly decoupled from visual tween durations and framerates.
* **What Taken / Adapted:** Pure mathematical time-slicing offline progression algorithm in [`src/fantasy/engine/OfflineEngine.ts`](file:///c:/Users/ubatora/Desktop/%D1%81%D0%BE%D1%81%D0%BE%D1%81%D0%BE%D1%81%D0%BE%D1%81%D0%BE%D1%81%D0%BE%D1%81/src/fantasy/engine/OfflineEngine.ts). Evaluates up to 8 hours of offline progression in `< 1ms` without UI freezes.
* **Files Modified:**
  - [`src/fantasy/engine/OfflineEngine.ts`](file:///c:/Users/ubatora/Desktop/%D1%81%D0%BE%D1%81%D0%BE%D1%81%D0%BE%D1%81%D0%BE%D1%81%D0%BE%D1%81%D0%BE%D1%81/src/fantasy/engine/OfflineEngine.ts): Mathematical aggregation of kills, gold, and gear drops.

### C. MaxMusing / Incremental-RPG
* **What Studied:** Character attributes (`strength`, `dexterity`, `constitution`), exponential monster HP scaling (`1.15^stage`), milestone multipliers (`2x at key thresholds`), and slot-based equipment stat generation.
* **What Taken / Adapted:** Milestone multiplier curves (2x at levels 10, 25, 50, 100, 250) for all hero upgrades and weighted equipment stat generation.
* **Files Modified:**
  - [`src/fantasy/content/upgrades.ts`](file:///c:/Users/ubatora/Desktop/%D1%81%D0%BE%D1%81%D0%BE%D1%81%D0%BE%D1%81%D0%BE%D1%81%D0%BE%D1%81%D0%BE%D1%81/src/fantasy/content/upgrades.ts): Upgrade definitions and milestone thresholds.
  - [`src/fantasy/content/gear.ts`](file:///c:/Users/ubatora/Desktop/%D1%81%D0%BE%D1%81%D0%BE%D1%81%D0%BE%D1%81%D0%BE%D1%81%D0%BE%D1%81%D0%BE%D1%81/src/fantasy/content/gear.ts): 18 weapons, armors, and rings across 5 rarities.

### D. jacobziemba-dev / bartimaeus-idle-rpg
* **What Studied:** 70–80% viewport canvas battle screen, floating damage text with vertical physics and alpha decay, top resource HUD, stage title cards, and active click combos.
* **What Taken / Adapted:** Cleanroom 2D Canvas battlefield layout with floating damage text, active click combo multiplier system (+1.25% per click up to +25%), and stage wave nodes.
* **Files Modified:**
  - [`src/fantasy/ui/views/BattleView.ts`](file:///c:/Users/ubatora/Desktop/%D1%81%D0%BE%D1%81%D0%BE%D1%81%D0%BE%D1%81%D0%BE%D1%81%D0%BE%D1%81%D0%BE%D1%81/src/fantasy/ui/views/BattleView.ts): 75% height battlefield view with wave nodes, live DPS, combo meter, and attack button.
  - [`src/fantasy/ui/canvas/VfxRenderer.ts`](file:///c:/Users/ubatora/Desktop/%D1%81%D0%BE%D1%81%D0%BE%D1%81%D0%BE%D1%81%D0%BE%D1%81%D0%BE%D1%81/src/fantasy/ui/canvas/VfxRenderer.ts): Floating numbers, slash arcs, and coin bursts.

---

## 3. Retained & Hidden Systems

* **Retained Core Systems:**
  - `FantasyStateStore` (`src/fantasy/core/FantasyState.ts`): Reactive immutable state with event emission.
  - `SaveEngine` (`src/fantasy/engine/SaveEngine.ts`): LocalStorage persistence (`FANTASY_IDLE_BETA_SAVE_V1`).
  - `AudioEngine` (`src/fantasy/engine/AudioEngine.ts`): Synthesized Web Audio API sound effects.
  - `GearEngine` & `LegacyEngine`: Equipment management and prestige resets.
* **Temporarily Hidden from Primary Flow:**
  - Complex sub-menus, secondary crafting tables, and deep talent trees are concealed behind modals or dedicated secondary tabs (`Gear`, `Hero`, `Upgrades`, `World`), keeping the battlefield as the absolute visual centerpiece.

---

## 4. Animation & Presentation State Machine

### Hero State Machine
* **`IDLE`:** Subtle breathing bob, sword upright, shield steady.
* **`RUN`:** Dynamic foot/cape bobbing and forward body lean during stage travel.
* **`ATTACK`:** Forward lunge (+25px) and weapon arc slash.
* **`ATTACK_2`:** Downward overhead strike.
* **`CRIT`:** Heavy forward thrust (+40px) with glowing runic trail and particle burst.
* **`HURT`:** Leftward knockback (-15px) and impact recoil.
* **`VICTORY`:** Triumphant jump and celebration sparkle effect.
* **`DEATH`:** Rotational fall.

### Enemy State Machine
* **`SPAWN`:** Scale-in transition with particle puff.
* **`IDLE`:** Hover/breathe bobbing.
* **`ATTACK`:** Counter-attack lunge toward the hero.
* **`HURT`:** Recoil offset and white impact flash.
* **`DEATH`:** Fade-out and coin burst explosion.

---

## 5. Verification & Test Suite

* **Unit Tests (`tests/fantasy-idle-beta.test.ts`):**
  - BigNumber formatting (`950`, `1.25K`, `4.81M`, `18.3B`, `6.42T`).
  - Exponential upgrade scaling & milestone multipliers.
  - Entity state machine transitions & click combo scaling.
  - Equipment attribute aggregation.
  - Time-sliced offline progression math.
  - Elite monster multipliers & boss retry flow.
* **All Tests Passed:** `6 / 6` tests passing in `3ms`.
* **TypeScript Check:** `tsc --noEmit` — 0 errors.
* **Progression Simulation:** 60-minute end-to-end idle simulation verified smooth progression curve (W1 Boss in 1m54s, W2 in 2m11s, W3 in 9m52s).

---

## 6. Acceptance Criteria Verification

- [x] Fantasy battle scene is primary visual focus (75% viewport).
- [x] Hero automatically travels with seamless parallax background.
- [x] Enemies spawn with distinct archetypes, elite variants, and boss encounters.
- [x] Combat flows continuously with auto attacks, manual click strikes, and enemy counter-attacks.
- [x] Floating damage numbers, critical hit effects, coin bursts, and health bars.
- [x] Stage progression advances automatically with boss timer and farm mode fallback.
- [x] Upgrades, gear drops, and legacy perks provide tangible, exponential power growth.
- [x] Offline progress calculates mathematically on resume.
- [x] All 4 reference projects studied at code level and comparative audit documented.
