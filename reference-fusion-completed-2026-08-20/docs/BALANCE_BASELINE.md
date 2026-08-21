# Balance Baseline - Anime Infinite Ascension

The initial baseline capture task (P0-T13, P0-T14) has been thoroughly executed via the `generate-deliverables.test.ts` script, which establishes **Balance v2**.

## Documentation Provided by Balance v2
1. **`BALANCE_V2_REPORT.md`**: Contains the full mathematical explanation, simulation metrics, ROI schedules, and differences from Balance v1.
2. **`balance-simulation-v2.csv`**: Headless simulation results across multiple player horizons and strategies.
3. **`building-roi-v2.csv`**: Time-to-payback metrics for every building tier at different purchase thresholds.
4. **`prestige-simulation-v2.csv`**: Growth curve for 20 continuous Reincarnations.
5. **`balance-v2.json`**: JSON export of all core config arrays for external tooling.

## Core Baseline Rules to Preserve
- **Rank Multipliers:** DO NOT compound previous ranks. Use the static tier multiplier (e.g. 1.15x for Rank D).
- **Decoupled Economy:** Do not link `Click Power` directly to total `Building Power/s`.
- **Tower Scaling:** Use fixed geometric formulas to prevent sudden unbeatable walls.
- **Save Integrity:** Always bump schema version in `SaveSchema.ts` when modifying the JSON shape.

**See `BALANCE_V2_REPORT.md` in root for the comprehensive mathematical baseline.**
