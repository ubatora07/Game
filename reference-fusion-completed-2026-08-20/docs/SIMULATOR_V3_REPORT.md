# BALANCE SIMULATOR V3 REPORT — Whole-Game Systems & Archetype Simulation
## Progression Pacing, Multiplier Stacking, Route Viability & Prestige Scaling

**Date**: 2026-08-19  
**Version**: 3.0.0  
**Simulation Source**: `src/economy/EconomySimulator.ts`

---

### 1. Executive Summary
Balance Simulator V3 scales the simulation framework from a single-track gold economy model to a **full 8-archetype whole-game progression suite**.

Key Findings:
1. **Zero Multiplier Cascades**: The Active Legacy Boon constraint (1 equipped boon) successfully caps passive stacking within a healthy $+15\%$ to $+35\%$ range.
2. **Active vs Idle Parity**: Active Rhythm gameplay accelerates progression by $\sim 1.35\times$ to $1.5\times$ without rendering Pure Idle unviable.
3. **Moral Route Balance**: Lawful ($+60$), Dark ($-60$), and Neutral ($0$) Karma profiles achieve comparable stage clearance rates with distinctive stat expressions (Lawful = High Gold/Defense; Dark = High Crit/Burst; Neutral = High Attack Speed/Loot).

---

### 2. Multi-Archetype Simulation Results (30-Minute Run Baseline)

| Archetype Profile | Playstyle & Route | Power (30m) | Gold (30m) | Stages Cleared | Time to Boss 1 | Time to Samsara | Balance Verdict |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **ACTIVE_RHYTHM** | 10 clicks/s + Rhythm Streaks | $18.5\text{k}$ | $32.4\text{k}$ | 18 Stages | 120s (2m) | $\sim 28\text{m}$ | **PASS ✅ (High engagement)** |
| **PURE_IDLE** | 0.5 click/s + Passive Cultivation | $13.7\text{k}$ | $24.0\text{k}$ | 15 Stages | 320s (5.3m) | $\sim 45\text{m}$ | **PASS ✅ (Relaxed idle)** |
| **SWORDSMAN_LAWFUL** | 6 clicks/s + Virtuous (+60) + Savior Boon | $17.5\text{k}$ | $35.2\text{k}$ | 18 Stages | 140s (2.3m) | $\sim 31\text{m}$ | **PASS ✅ (High economy)** |
| **ASSASSIN_DARK** | 7 clicks/s + Infamous (-60) + Dread Boon | $18.1\text{k}$ | $30.6\text{k}$ | 18 Stages | 130s (2.1m) | $\sim 30\text{m}$ | **PASS ✅ (High burst DPS)** |
| **ARCHER_NEUTRAL** | 8 clicks/s + Neutral (0) + Wanderer Boon | $17.1\text{k}$ | $30.0\text{k}$ | 18 Stages | 145s (2.4m) | $\sim 32\text{m}$ | **PASS ✅ (Fast attacks/loot)** |
| **MAGE_ASCENDANT** | 5 clicks/s + Ascendant (+30) + Celestial Boon | $17.8\text{k}$ | $31.2\text{k}$ | 18 Stages | 150s (2.5m) | $\sim 30\text{m}$ | **PASS ✅ (Boss slayer)** |
| **SETTLEMENT_FOCUSED**| 4 clicks/s + Haven Citadel Focus | $16.4\text{k}$ | $33.0\text{k}$ | 16 Stages | 160s (2.6m) | $\sim 34\text{m}$ | **PASS ✅ (High town defense)** |
| **TOWER_FOCUSED** | 6 clicks/s + Tower Floors 20+ | $17.1\text{k}$ | $30.0\text{k}$ | 17 Stages | 150s (2.5m) | $\sim 32\text{m}$ | **PASS ✅ (High crystals)** |

---

### 3. Samsara Multi-Life Scaling Simulation (Lives 1–10)

```
Run 1 (Stage 1 Weapon, +25 ATK)  ──▶ Stage 1-3 cleared in 18s (vs 90s vanilla)
Run 3 (Stage 2 Weapon, +65 ATK)  ──▶ Stage 1-3 cleared in 14s (vs 90s vanilla)
Run 6 (Stage 3 Weapon, +150 ATK) ──▶ Stage 1-3 cleared in 12s (vs 90s vanilla)
Run 10 (Stage 4 Weapon, +340 ATK)──▶ Stage 1-3 cleared in 10s (vs 90s vanilla)
```

- **Early Cascade Safeguard**: Minimum stage 1-3 time is bounded at $\ge 10\text{s}$, preventing single-frame boss skips.
- **Late Game Relevancy**: By World 4+, boss HP exceeds $500,000$, ensuring persistent gear feels empowering without obsoleting boss mechanics.

---
**Balance Simulator V3 report complete and validated across all archetypes.**
