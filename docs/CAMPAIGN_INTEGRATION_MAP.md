# Campaign Integration Map
## Architecture Blueprint for Phases 30–66 Execution

---

## 1. System Integration Flow

```text
                               ┌─────────────────────────────┐
                               │        GameState.ts         │
                               │   (v6: Includes Campaign)   │
                               └──────────────┬──────────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    ▼                         ▼                         ▼
        ┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────────────┐
        │   EconomyEngine.ts    │ │   TrainingSystem.ts   │ │     HeroSystem.ts     │
        │  (Authoritative DPS)  │ │    (Manual ATTACK)    │ │   (Party Formation)   │
        └───────────┬───────────┘ └───────────┬───────────┘ └───────────┬───────────┘
                    │                         │                         │
                    └─────────────────────────┼─────────────────────────┘
                                              ▼
                               ┌─────────────────────────────┐
                               │  CampaignCombatService.ts   │
                               │  (New Orchestration Layer)  │
                               └──────────────┬──────────────┘
                                              │
                    ┌─────────────────────────┴─────────────────────────┐
                    ▼                                                   ▼
        ┌───────────────────────┐                           ┌───────────────────────┐
        │   Combat State Loop   │                           │     UI Event Bus      │
        │ - Enemy HP Resolution │                           │ - Attack / Hit VFX    │
        │ - Boss Timers & Gates │                           │ - Damage Numbers Pool │
        │ - Stage Progression   │                           │ - Reward Flyouts      │
        │ - Death & Rewards     │                           │ - Stage Transitions   │
        └───────────────────────┘                           └───────────┬───────────┘
                                                                        ▼
                                                            ┌───────────────────────┐
                                                            │    BattleScreen.ts    │
                                                            │ (Zone A, B, C, D UI)  │
                                                            └───────────────────────┘
```

---

## 2. Component Migration Map

| Existing Component | Action | Replacement / Destination | Rationale |
| :--- | :---: | :--- | :--- |
| `src/ui/screens/HomeScreen.ts` | **Refactor** | `src/ui/screens/BattleScreen.ts` | Main tab becomes the live battlefield rather than static click stage. |
| `src/ui/components/HeroStage.ts` | **Retire** | `src/ui/components/BattlefieldViewport.ts` | Static SVG hero circle replaced with animated party & enemy entities. |
| `src/ui/components/Navigation.ts` | **Update** | 5-Tab Bar (`Hero \| Sect \| Battle \| Heroes \| More`) | Ergonomic mobile navigation with drawer for secondary features. |
| `src/ui/screens/TowerScreen.ts` | **Reframe** | `Challenge Mode` inside `More` or quick-link | Tower becomes an endless push challenge for meta crystals/relics. |
| `src/content/buildings.ts` | **Reframe** | Sect Cultivation Settlements (`content/buildings.ts`) | Preserves 100% of mathematical formulas with thematic martial arts naming. |
| `src/systems/TrainingSystem.ts`| **Extend** | Combat Attack Action (`TrainingSystem.ts`) | Manual clicking is directly connected to weapon slash animation and enemy damage. |
| `src/systems/ReincarnationSystem.ts`| **Extend** | `Samsara Rush` integration | Automatically enables fast-clear burst progression on runs 2+. |

---

## 3. Save Schema Evolution (v5 $\to$ v6)

```ts
// Existing Save Data (v5) is completely preserved:
export interface GameStateData {
  version: 6; // bumped from 5
  power: number;
  gold: number;
  crystals: number;
  essence: number;
  souls: number;
  rankId: string;
  rankIndex: number;
  buildings: Record<string, number>;
  upgrades: Record<string, number>;
  heroes: Record<string, HeroState>;
  squad: string[];
  relics: Record<string, RelicState>;
  equippedRelics: (string | null)[];
  expeditions: ActiveExpedition[];
  soulSkills: Record<string, number>;
  towerFloor: number;
  towerMaxFloor: number;
  reincarnationCount: number;
  claimedAchievements: string[];
  dailyQuests: DailyQuestProgress[];
  loginStreak: number;
  lastLoginDate: string;
  loginRewardClaimed: boolean;
  settings: GameSettings;
  stats: PlayerStats;
  buffs: ActiveBuffs;
  combo: ComboState;
  lastSeenAt: number;

  // NEW Phase 30+ Campaign State:
  campaign: {
    currentWorldId: number;       // default: 1
    currentStageId: number;       // default: 1
    currentEncounter: number;     // default: 1
    highestWorldReached: number;  // default: 1
    highestStageReached: number;  // default: 1
    firstClears: string[];        // default: []
    campaignMode: 'progress' | 'farm' | 'boss_blocked' | 'rush'; // default: 'progress'
    autoAdvance: boolean;         // default: true
    farmStageId: number;          // default: 1
    bossRetryState: {
      bossId: string;
      failedAt: number;
      retryBoostActive: boolean;
    } | null;
  };
}
```

### Migration Policy
When loading a v1–v5 save without `campaign` object:
- `SaveMigrations.ts` injects clean `campaign` defaults.
- Sets `highestWorldReached` and `highestStageReached` derived safely from `rankIndex` and `towerMaxFloor` to respect legacy player accomplishments without breaking stage balance.

---

## 4. Phase-by-Phase Execution Roadmap (Phases 30–66)

```text
Phase 30: Campaign Domain Model (Types, Schemas, Progress/Farm State)
   │
Phase 31: Combat Engine Adapter (Party DPS + Manual Slash vs Enemy HP)
   │
Phase 32: Main Battle Screen v1 (4-Zone UI Layout: Mobile & Desktop)
   │
Phase 33: Auto-Battle Flow (Spawn, Auto-Attack, Death, Loot, Transitions)
   │
Phase 34: Campaign Reward Economy (Kill loot, Boss chests, Anti-inflation)
   │
Phase 35: Sect Reframing (Building list into martial Sect settlement)
   │
Phase 36: Protagonist RPG Layer (Stats, Mastery, Combat Power breakdown)
   │
Phase 37: Rank Visual Evolution (Auras, Sprites, Ascension celebration)
   │
Phase 38: Hero Party Conversion (4 visible heroes in combat formation)
   │
Phase 39: Hero Skill Presentation (Timed combat skills & visual VFX)
   │
Phase 40: Campaign Worlds (5 distinct worlds from Forest to Void)
   │
Phase 41: Enemies & Bosses (Archetypes, elite variants, boss timers)
   │
Phase 42: Infinite Tower Repositioning (Challenge mode & leaderboards)
   │
Phase 43: Samsara Campaign Experience (Rebirth sequence & Samsara Rush)
   │
Phase 44: Campaign-Aware Quest Rewrite (Kill & Stage progression quests)
   │
Phase 45: Achievements & Goals (Campaign, Combat, Party, Samsara counters)
   │
Phase 46: Pixel-Anime Art Pipeline (Combat sprites & high-res portraits)
   │
Phase 47: Battle Animation System (Event-driven combat visual bus)
   │
Phase 48: Sound & Music Pass (Combat SFX, world themes, boss fanfares)
   │
Phase 49: UI Navigation Redesign (5-tab navigation & More drawer)
   │
Phase 50: Battle-First Desktop Experience (3-column layout for PC)
   │
Phase 51: Save Schema Migration (v5 -> v6 migration & test suite)
   │
Phase 52: Balance v4 (Simulator runs for Campaign + Sect economy)
   │
Phase 53: Campaign Analytics (Stage funnel & boss fail tracking)
   │
Phase 54: Monetization Repositioning (Boss retry buff, surge ads)
   │
Phase 55: Performance Optimization (Object pools & 60 FPS mobile)
   │
Phase 56: Accessibility & Comfort (Reduced motion, high contrast HP)
   │
Phase 57: Localization Revalidation (RU / EN campaign keys)
   │
Phase 58: Complete Interaction QA v2 (Playwright E2E battle tests)
   │
Phase 59: Responsive QA v2 (360x640 to 2560x1440 layout verification)
   │
Phase 60: Launch Content Finalization (5 Worlds, enemy/boss data)
   │
Phase 61: Launch Heroes Finalization (12–20 Heroes roster)
   │
Phase 62: Game Feel Polish (Impact juice, crits, victory fanfares)
   │
Phase 63: Yandex Platform Revalidation (Ad pauses, cloud save sync)
   │
Phase 64: Store Card & Marketing Assets (Screenshots & Cover)
   │
Phase 65: Release Balance Lock (Final simulation freeze)
   │
Phase 66: Pre-Release QA Gate v2 (Production build approval)
```
