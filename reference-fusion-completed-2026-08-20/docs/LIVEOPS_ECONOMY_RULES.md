# LIVEOPS & LIMITED EVENT ECONOMY RULES (PHASE 124)
## Economic Safeguards, Reward Ceilings, Transaction Boundaries & Non-Inflation Policy

**Date**: 2026-08-19  
**Version**: 3.0.0  
**Authoritative Sources**: `PLAN.md`, `DESIGN.md`, `docs/SIMULATOR_V3_REPORT.md`

---

### 1. Executive Summary & Core Principle
Limited-time live events and content packs in *Anime Infinite Ascension* exist solely to provide **thematic narrative flavor, aesthetic variety, and optional discovery**. Under no circumstances may a temporary live event become the single optimal progression exploit or invalidate the permanent core progression loop (Campaign, Cultivation, Forge, Settlement, Samsara).

---

### 2. Strict Reward Ceilings & Bounds Matrix

| Resource Type | Maximum Single-Event Reward | Repeatable Limit | Exploit Protection / Rule |
| :--- | :---: | :---: | :--- |
| **Gold** | $\le 20,000$ Gold | Once per event run | Bounded by world rank multiplier. Zero infinite gold loops. |
| **Crystals** | $\le 100$ Crystals | Hard-capped per saga | Premium crystals are strictly capped to maintain gacha integrity. |
| **Souls (Prestige)** | **ZERO (0)** | Strictly Forbidden | **RULE**: Live events may NEVER award Souls. Souls come strictly from Reincarnation. |
| **Power (Chi)** | $\le 5\text{m}$ equivalent | Once per node | Instant power drops scale with current Power/sec, capped at 300s. |
| **Crafting Materials** | $\le 10$ Iron / $\le 3$ Meteorite | Stock-limited | Cannot bypass Master Goran’s forge tier requirements. |
| **Titles & Cosmetics**| 1 Title per pack | Permanent unlock | Cosmetic & modest stats ($+5\%$ Crit / $+8\%$ Loot maximum). |

---

### 3. Market & Discount Boundaries
1. **Merchant Discount Cap**: Temporary discounts in market rotation packs cannot exceed $20\%$ off baseline prices.
2. **Stock Limits**: All live event cargo packs enforce finite `stockMax` ($1$ to $3$ purchases per rotation).
3. **No Arbitrage**: Items purchased in limited events cannot be sold back for higher currency than their purchase cost.

---

### 4. Event Equipment & Samsara Rules
- Event equipment adheres to the universal 4-stage evolution model in [`EquipmentTypes.ts`](file:///c:/Users/ubatora/Desktop/сососососососососос/src/core/crafting/EquipmentTypes.ts).
- Event weapons must never possess higher raw base stats than standard crafted weapons of the same tier.
- If a content pack is disabled, already-earned equipment instances in player inventory remain permanently usable and evolve normally.

---

### 5. Summary of Prohibitions
> [!CAUTION]
> **STRICT PROHIBITIONS FOR LIVE CONTENT PACKS**:
> - NO direct state mutations bypassing `store.set()`.
> - NO infinite repeatable crystal farming loops.
> - NO Souls / Samsara multipliers granted directly.
> - NO pay-to-win temporary stat buffs exceeding $+10\%$.
> - NO mandatory online connectivity required for core game loops.
