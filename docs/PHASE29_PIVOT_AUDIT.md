# Phase 29: Pivot Audit & Architecture Freeze
## Anime Infinite Ascension — Pixel-Anime Campaign Autobattler

---

## 1. Executive Summary

This audit establishes the definitive architectural bridge between the completed **Phases 0–28 Foundation** and the **Phase 29+ Pixel-Anime Campaign Autobattler Pivot**.

The core objective is to transition from a static dashboard incremental RPG into an **always-living Campaign Autobattler**, while preserving **100% of the working economy, save, progression, SDK, and mathematical engines**.

---

## 2. Audit of Existing Modules (Phases 0–28 Status)

| Layer | Files | Current Status | Pivot Role |
| :--- | :--- | :---: | :--- |
| **Core Engine** | `GameState.ts`<br>`EconomyEngine.ts`<br>`GameLoop.ts`<br>`EventBus.ts`<br>`BigNumber.ts` | ✅ Production Ready | Authoritative source of truth for stats, multipliers, and ticker loop. |
| **Progression Content** | `buildings.ts`<br>`upgrades.ts`<br>`ranks.ts`<br>`soulTree.ts`<br>`relics.ts`<br>`heroes.ts`<br>`worlds.ts`<br>`quests.ts`<br>`achievements.ts`<br>`expeditions.ts`<br>`dailyQuests.ts` | ✅ Production Ready | Data definitions are preserved. Buildings are reframed as "Sect", Worlds are adapted into Campaign Worlds. |
| **Game Systems** | `TrainingSystem.ts`<br>`TowerSystem.ts`<br>`HeroSystem.ts`<br>`AscensionSystem.ts`<br>`ReincarnationSystem.ts`<br>`QuestSystem.ts`<br>`RelicSystem.ts`<br>`ExpeditionSystem.ts`<br>`DailySystem.ts`<br>`OfflineSystem.ts`<br>`RandomEventSystem.ts` | ✅ Production Ready | Integrated directly by the new orchestration layer (`CampaignCombatService`). |
| **Services** | `SaveService.ts`<br>`SaveMigrations.ts`<br>`YandexGamesService.ts`<br>`AdService.ts`<br>`AnalyticsService.ts`<br>`SoundService.ts`<br>`I18nService.ts` | ✅ Production Ready | Preserved. Save schema will be bumped to v6 to include `campaign` state without breaking v1–v5 loads. |
| **UI Components** | `Header.ts`<br>`Navigation.ts`<br>`ModalManager.ts`<br>`ToastManager.ts`<br>`ParticleCanvas.ts`<br>`FloatingNumbers.ts` | ✅ Production Ready | Reusable across screens. Navigation will be streamlined to 5 primary tabs (`Hero`, `Sect`, `Battle`, `Heroes`, `More`). |
| **Screens** | `HomeScreen.ts`<br>`TowerScreen.ts`<br>`AscensionScreen.ts`<br>`HeroesScreen.ts`<br>`SummonScreen.ts`<br>`SoulTreeScreen.ts`<br>`QuestsScreen.ts`<br>`RelicsScreen.ts`<br>`ExpeditionsScreen.ts`<br>`DailyScreen.ts` | ✅ Working | `HomeScreen` evolves into the main `BattleScreen`. Tower is reframed as a Challenge Mode. All secondary screens accessible via tabs or `More` drawer. |
| **Modals** | `AscensionModal.ts`<br>`OfflineRewardModal.ts`<br>`ReincarnateModal.ts`<br>`SettingsModal.ts`<br>`StatsModal.ts`<br>`SummonResultModal.ts` | ✅ Working | Preserved and integrated into the new battle UI flow. |
| **Simulations & Tests** | `EconomySimulator.ts`<br>`tests/*.test.ts`<br>`e2e/interaction-qa.spec.ts`<br>`e2e/responsive-qa.spec.ts` | ✅ 45 Unit / 26 E2E Passing | Extended with Campaign Autobattler simulation and QA test suites. |

---

## 3. Core System Mapping

### 3.1. Training $\to$ Battle Attack Fantasy
- **Previous:** Clicking a circular avatar icon in `HeroStage.ts` to generate Power/Gold.
- **New Pivot:** Clicking the primary `⚔️ ATTACK` button triggers protagonist attack animations on the active enemy group in the battlefield, dealing direct damage, generating loot numbers, maintaining combo multiplier, and triggering crits.
- **Formula Continuity:** Uses `TrainingSystem.train()` / `EconomyEngine.calculateMetrics().clickPower` and `clickGold`.

### 3.2. Buildings $\to$ Sect Cultivation Settlement
- **Previous:** Abstract list of income buildings.
- **New Pivot:** Cultivation Sect facilities (Dojo, Meditation Hall, Spirit Shrine, Warrior Academy...) generating passive Qi & Gold, with visual milestone upgrades and sector synergy bonuses displayed as Sect expansion.
- **Formula Continuity:** 100% preserves existing geometric cost curve, bulk-purchase formulas, and ROI calculations from `buildings.ts`.

### 3.3. Tower Combat $\to$ Campaign Autobattler
- **Previous:** Auto-climb battle isolated in the `TowerScreen` tab.
- **New Pivot:** Continuous Campaign Autobattler becomes the **default main screen**. Infinite Tower becomes a dedicated **Endless Challenge Mode** for meta rewards and leaderboards.
- **Formula Continuity:** `CampaignCombatService` reuses the ticker-based DPS vs Enemy HP structure pioneered in `TowerSystem.ts`.

### 3.4. Hero Collection $\to$ Visible 4-Slot Battle Party
- **Previous:** Static grid of cards giving mathematical passive multipliers.
- **New Pivot:** Unlocked heroes appear on the battlefield in party formation, attacking enemies, displaying skill animations, and contributing visible Party DPS.
- **Formula Continuity:** Faction synergies, aura stacking, and star upgrades from `HeroSystem.ts` remain the authoritative mathematical layer.

### 3.5. Samsara Reincarnation $\to$ Samsara Rush
- **Previous:** Reset run progress $\to$ grant Souls $\to$ restart at zero Power.
- **New Pivot:** Reset run progress $\to$ grant Souls $\to$ return to Stage 1-1 with **Samsara Rush**, where the player's retained meta power visibly one-shots and fast-clears early stages with intense visual satisfaction.
- **Formula Continuity:** Retains `ReincarnationSystem.ts` soul formulas, Soul Tree bonuses, and persistent account meta counters.

---

## 4. Architectural Checkpoint 29 Answers

1. **Which existing engine calculates player power?**
   - `EconomyEngine.calculateMetrics(state)` in `src/economy/EconomyEngine.ts`.
2. **Which system currently calculates Tower combat?**
   - `TowerSystem` in `src/systems/TowerSystem.ts`.
3. **Which systems can supply Campaign damage?**
   - Base DPS from `EconomyEngine.calculateMetrics().passivePowerPerSec`.
   - Manual Attack from `TrainingSystem.train()` (`clickPower`, crits, combo).
   - Hero multipliers and party aura buffs from `HeroSystem.ts`.
   - Soul Tree perks from `soulTree.ts` and Relics from `relics.ts`.
4. **Which data survives Reincarnation?**
   - Persistent: `heroes`, `relics`, `equippedRelics`, `soulSkills`, `souls`, `crystals`, `essence`, `claimedAchievements`, `settings`, `stats.lifetime*`, `campaign.highestStageReached`, `campaign.firstClears`.
   - Reset: `power`, `gold`, `rankId` ('E'), `rankIndex` (0), `buildings`, `upgrades`, `towerFloor`, `combo`, active surge buffs, `campaign.currentStageId` (resets to 1 with Rush enabled).
5. **What new state is actually required?**
   - A single cohesive `campaign` object in `GameStateData`:
     ```ts
     campaign: {
       currentWorldId: number;
       currentStageId: number;
       currentEncounter: number;
       highestWorldReached: number;
       highestStageReached: number;
       firstClears: string[];
       campaignMode: 'progress' | 'farm' | 'boss_blocked' | 'rush';
       autoAdvance: boolean;
       bossRetryState: { bossId: string; failedAt: number; retryBoostActive: boolean } | null;
       farmStageId: number;
     }
     ```
6. **Which old UI becomes obsolete?**
   - Static `HeroStage.ts` (circular avatar widget) is replaced by `BattleScreen.ts` and `BattlefieldViewport.ts`.
   - Old 10-button navigation bar is replaced by modern 5-button bar (`Hero`, `Sect`, `Battle`, `Heroes`, `More`).
7. **Can Campaign be added without duplicating economy formulas?**
   - **Yes.** `CampaignCombatService` directly consumes outputs from `EconomyEngine` and `TrainingSystem` on every frame tick of `GameLoop.ts`.
