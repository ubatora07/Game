# Save V7 & Rebirth Preservation Contract

This document is the source-of-truth contract for mutable RPG state owned outside `GameStore`.

## Save ownership

`GameStore` owns the persisted aggregate snapshot. Runtime subsystem singletons own live state and derived modifiers. `RpgSaveAggregate` is the only orchestration layer that captures, hydrates, and clear-resets those external domains.

| Domain | Save V7 | Clear Save | Rebirth |
|---|---|---|---|
| Settlement | persist | reset to fresh | ownership/buildings retained; materials reduced by existing policy |
| Crafting / equipment | persist | reset to fresh | equipment/recipes retained; raw materials reduced by existing policy |
| Market | persist | reset to fresh | contacts retained; stock refreshed |
| Mercenaries | persist | reset to fresh | active contracts expire; historical hire count retained |
| Titles | persist | reset to fresh | titles/equipped identity retained |
| Settlement defense | persist | reset to fresh | active raid cleared |
| Settlement story | persist | reset to fresh | completed chronicle/path retained |
| Legacy endings | persist | reset to fresh | permanent |
| Party / partner | persist | reset to fresh | partner unlock, classes, focus, levels and skill nodes retained |
| Pets | persist | reset to fresh | ownership, level, evolution and active pet retained |
| Karma | persist | reset to fresh | current-life score resets; historical major-choice flags/reputation remain owned by Karma policy unless explicitly changed |
| Adventure events | persist once-only/cooldowns | reset to fresh | no additional reset policy beyond current-life design |
| World state | persist | reset to fresh | current-life flags clear; permanent legacy chronicle remains |

## Class authority

`PartyTeamSystem.characters.char_1.classId` is the authoritative protagonist class. `ClassSystem` is a compatibility facade and must not serialize a second class source of truth.

## Hydration order

1. Stable legacy RPG domains.
2. Party/class state.
3. Karma.
4. Pets (so class synergy sees final party state).
5. Adventure event persistence.
6. World state.

Every modifier-owning subsystem clears its own `sourceType` before re-registering modifiers. Rehydrating the same payload repeatedly must therefore be idempotent.

## Rebirth eligibility

Rebirth has one structured requirement source: `RebirthRequirements`.

- Required rank: Rank S.
- Rank S power requirement: 2,000,000,000 Power.
- Minimum lifetime power for the Legacy Shard formula: also 2,000,000,000.
- The old 1,000,000,000 reward floor was inconsistent with the real Rank S gate and has been aligned without changing the reward formula at the actual rebirth point.

## Rebirth transaction order

1. Evaluate structured requirements and potential reward.
2. Apply the core `GameStore` run reset exactly once.
3. Execute each subsystem's explicit `resetForSamsara` policy exactly once.
4. Rebuild ephemeral campaign combat from the reset campaign state.
5. Play rebirth feedback.
6. Emit `reincarnate:complete`.
7. `SaveService` immediately captures and persists the completed transaction from that event.

`reincarnate:complete` is a post-transaction notification; subsystems must not use it to perform a second copy of their reset policy.
