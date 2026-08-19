# ANALYTICS V3 SPECIFICATION — Product Telemetry & Retention Tracking
## Data Pipeline, Player Funnels, Archetype Tracking & Engagement Metrics

**Date**: 2026-08-19  
**Version**: 3.0.0  
**Authoritative Source**: `PLAN.md`, `DESIGN.md`, `src/services/analytics/AnalyticsService.ts`

---

### 1. Executive Summary
Analytics V3 shifts the telemetry architecture from raw click tracking to **high-signal product questions**:
- Where do new players drop off in the first 30 minutes?
- Which combat classes, Karma alignments, and Destiny paths produce the highest engagement?
- Are players actively participating in the Rhythm minigame, Blacksmithing, and Raids, or bypassing them?
- What are true D1, D7, and D30 return curves under real browser conditions?

---

### 2. New Player Conversion Funnel (0–60 Min)

```
[game_start] ──▶ [first_attack] ──▶ [first_kill] ──▶ [first_boss] ──▶ [first_class]
                                                                            │
┌───────────────────────────────────────────────────────────────────────────┘
▼
[first_pet] ──▶ [first_settlement] ──▶ [first_craft] ──▶ [first_samsara]
```

| Step Index | Event Name | Trigger Context | Target KPI Conversion Benchmark |
| :---: | :--- | :--- | :---: |
| **01** | `funnel_game_start` | App initialized, title loaded | 100% |
| **02** | `funnel_first_attack` | First manual or rhythm click | $\ge 96\%$ |
| **03** | `funnel_first_kill` | Stage 1-1 first mob eliminated | $\ge 92\%$ |
| **04** | `funnel_first_boss` | Stage 1-5 Boss Goblin Overlord defeated | $\ge 78\%$ |
| **05** | `funnel_first_class` | Rank E reached $\to$ Class selected | $\ge 68\%$ |
| **06** | `funnel_first_pet` | Nest event completed $\to$ Pet hatched | $\ge 58\%$ |
| **07** | `funnel_first_settlement`| Mountain Haven ruins unlocked | $\ge 48\%$ |
| **08** | `funnel_first_craft` | Master Goran's Forge armory item forged | $\ge 40\%$ |
| **09** | `funnel_first_samsara` | First Reincarnation transmuted | $\ge 25\%$ |

---

### 3. System Engagement & Feature Adoption Events

| Domain | Event Name | Parameters Tracked | Product Question Answered |
| :--- | :--- | :--- | :--- |
| **Rhythm Engine** | `rhythm_streak_milestone` | `streak: number`, `rating: 'PERFECT' \| 'GOOD'` | Do players engage with active timing or prefer idle? |
| **Companion Pets**| `pet_equipped` / `pet_fed` | `petId: string`, `level: number`, `element: string`| Which elemental companions have highest resonance? |
| **Settlement** | `settlement_building_upgrade` | `buildingId: string`, `newLevel: number` | Which buildings do players prioritize first? |
| **Settlement Raids**| `settlement_raid_resolved`| `raidId: string`, `won: boolean`, `defense: number` | Are raid defense thresholds balanced? |
| **Forge & Crafting**| `equipment_crafted` | `templateId: string`, `tier: number`, `rarity: string` | Are players engaging with crafting vs drop loot? |
| **Market & Contraband**| `market_purchased` | `offerId: string`, `isBlackMarket: boolean` | What is the adoption rate of Black Market goods? |
| **Tower of Ascension**| `tower_floor_cleared` | `floor: number`, `clearTimeMs: number` | Where do players hit vertical DPS walls? |
| **Narrative Chains**| `narrative_chain_resolved` | `chainEventId: string`, `choiceId: string`, `karmaDelta` | How do players branch across multi-stage sagas? |

---

### 4. Player Route & Archetype Attribution

| Metric Dimension | Tracked Values | Strategic Evaluation |
| :--- | :--- | :--- |
| **Combat Class** | `swordsman`, `mage`, `archer`, `assassin` | Balances class popularity and clears. |
| **Karma Alignment Band**| `virtuous` ($\ge 50$), `infamous` ($\le -50$), `neutral` ($-15$ to $15$) | Verifies whether the Neutral route is viable. |
| **Destiny Path** | `lord` (*High Lord of Eldoria*) vs `adventurer` (*Unbound Vanguard*) | Measures sovereign vs wanderer fantasy choices. |
| **Active Legacy Boon** | `ending_savior`, `ending_dread`, `ending_wanderer`, `ending_celestial` | Detects whether one legacy boon is dominant. |

---

### 5. Session & Retention Telemetry

- **Session Heartbeat**: Emits `session_heartbeat` every 60s of active play.
- **Session Duration**: Calculates total active foreground seconds upon `visibilitychange: hidden` and `beforeunload`.
- **Offline Return Attribution**: Logs `offline_return` with `offlineSeconds` and `gainsClaimed: boolean`.

---
**Analytics V3 Specification complete and aligned with product telemetry standards.**
