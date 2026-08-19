# Unlock Pacing Matrix — Game Consolidation V1

**Status:** active progression evidence for `P13-28`  
**Rule:** this document distinguishes what runtime actually enforces from timing that is only declared in older design content. It does not invent time gates.

## Runtime-enforced rank gates

| System | Gate | Player-facing pacing intent | Runtime source of truth | Status |
|---|---:|---|---|---|
| Battle / Hero / Team / World shell | Rank E | Fresh-save core | `PRIMARY_DOMAINS` | available from start |
| Settlement / Mountain Haven | Rank C | 30–60 min target | `PROGRESSION_UNLOCKS.settlement` | enforced in nav, direct claim, and rank-up unlock |
| Infinite Tower combat | Rank C | challenge layer after core loop | `PROGRESSION_UNLOCKS.tower` | enforced in `TowerSystem` |
| Rebirth | Rank S | late meta progression | `RebirthRequirements` + `PROGRESSION_UNLOCKS.rebirth` | enforced |

## State/event-gated systems

| System | Current discovery rule | Coherence note |
|---|---|---|
| Main class | explicit player selection | belongs to Hero; no extra rank gate added |
| Second character | World 1 final-boss oath story → persisted invitation | direct fresh-save access is blocked; Team reveals setup only after the invitation |
| Pets | first guaranteed Pet Nest at World 2 final boss; Market/events remain alternate sources | Team hides Pet management until `pet:acquired`; milestone is skipped if another source already granted a pet |
| Settlement services | settlement ownership/buildings/NPC state | Mercenary hiring/contracts require owned Settlement + constructed Tavern; other service surfacing still needs review |
| Adventure events / Karma | event-driven | should surface through play, not as a fresh-save management requirement |

## Hero roster timing — resolved to current runtime

Fresh saves start at **Rank E** with **150 starter Crystals**, explicitly enough for the 100-Crystal first summon. `PROGRESSION_UNLOCKS.hero_roster` now records Rank E with `enforcement: 'runtime'`, and `HeroSystem` consumes that contract.

The 5–15 minute UX band is a **surfacing/onboarding target**, not a hard unlock gate. The stale Rank B `unlockedFeature: 'heroes'` declaration was removed so the rank catalog no longer advertises a feature the player already owns.

## First-60-minute overload reduction applied in this batch

Before this contract, Settlement appeared in the primary navigation from Rank E and the direct Settlement screen could claim Mountain Haven immediately, despite the system itself describing Rank C as its unlock. The rank-up listener also read a nonexistent `rankIndex` event field, so the intended automatic Rank C path was dead.

Now:
- Settlement is progressively revealed at Rank C;
- direct-route claim cannot bypass Rank C;
- rank-up unlock consumes the actual typed `newRank` event value;
- Tower and Settlement no longer duplicate the magic rank index `2`;
- Mercenary hiring and mercenary Market contracts cannot bypass the constructed Tavern;
- unresolved Hero/Partner/Pet timing and the question of whether a locked Mercenary teaser is too early remain visible debt instead of being guessed away.


## Secondary navigation disclosure — BATCH-20

Fresh-save navigation now follows “show when mechanically relevant” instead of exposing empty/late screens:

| Surface | Reveal rule |
|---|---|
| Tower | shared Rank C progression gate |
| Expeditions | at least one recruited Hero |
| Relics | at least one owned Relic |
| Soul / Legacy Tree | at least one Soul or Rank S reached |
| Legacy Codex | at least one Reincarnation or unlocked Legacy Ending |
| Mercenary Guild | owned Settlement + constructed Tavern |

These are navigation/discovery rules only. They do not change reward math, prices, save ownership or underlying state APIs.
