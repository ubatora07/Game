# Feature Inventory - Anime Infinite Ascension

Based on `PLAN.md` and codebase audit, here is the current state of features.

## Implemented & Working (Phase 1-11 functionality)
- ✅ **Decoupled Economy (Balance v2):** Click Power and Gold are decoupled from Buildings.
- ✅ **Buildings (10 Tiers):** Full geometric growth formula, from Dojo to Infinite Core.
- ✅ **Milestones:** Extended to 11 tiers (up to level 1000).
- ✅ **Upgrades:** 6 upgrade categories, including cross-building synergies.
- ✅ **Ascension Ranks (12 Ranks):** Implemented from Rank E to Rank Immortal. Non-compounding multipliers applied correctly.
- ✅ **Samsara Reincarnation:** Prestige reset is implemented. Soul Formula provides strategic reset scaling.
- ✅ **Soul Tree (4 Branches):** Fully operational 12-perk soul tree across Strength, Wealth, Spirit, Ascension.
- ✅ **Hero System & Gacha:** Pull system with fixed % rates, Star upgrade system via duplicates, Aura resolution.
- ✅ **Infinite Tower:** Auto-combat system, floors, scaling HP/Power logic, Bosses.
- ✅ **Offline Progression:** Time-based timestamp simulation, hard caps, efficiency modifiers.
- ✅ **Random Events:** Implemented (e.g. Golden Spirit logic in `RandomEventSystem.ts`).
- ✅ **Quests & Achievements:** Tracking in `GameState.ts` and evaluated periodically via `QuestSystem.ts`.

## Partial / Placeholder Features
- 🔄 **Yandex Games SDK Integration:** Has an abstraction (`YandexGamesService.ts`), but might need further testing in actual production.
- 🔄 **Visual Feedback / Game Juice:** Basic VFX implemented (`ParticleCanvas`, `FloatingNumbers`), but might require polishing based on UI demands.
- 🔄 **Monetization (Phase 22):** Buffs state (`adPowerSurgeEndsAt`) exists, but full ad integration might be stubbed.

## Not Yet Implemented (or Missing Details)
- ❌ **Relics (Phase 13):** No sign of `Relics` config in `src/content` and not mentioned in `GameState.ts`.
- ❌ **Hero Expeditions (Phase 14):** Not explicitly seen in `src/systems/`.
- ❌ **Daily/Returning Layer (Phase 16):** Lightweight daily reward logic is not immediately visible.
- ❌ **Audio (Phase 19):** Settings exist in `GameState.ts`, but no actual audio hooks visible in top-level systems.

## Summary
The game has successfully reached beyond its "Balance V2" objectives, implementing all primary progression mechanics (Training, Buildings, Upgrades, Tower, Heroes, Prestige). The next phases should focus on mid-to-late game meta-systems (Relics, Expeditions), Audio, and final platform polish.
