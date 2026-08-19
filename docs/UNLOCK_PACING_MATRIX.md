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
| Second character | `PartyTeamSystem.unlockSecondCharacter(...)` | event/UI timing remains a Phase 13 onboarding review item |
| Pets | acquired through PetSystem/event content | Team may show the pet collection before first acquisition; acquisition itself remains stateful |
| Settlement services | settlement ownership/buildings/NPC state | Mercenary hiring/contracts require owned Settlement + constructed Tavern; other service surfacing still needs review |
| Adventure events / Karma | event-driven | should surface through play, not as a fresh-save management requirement |

## Known timing conflict — intentionally unresolved

`RANKS` still declares **Heroes** as the Rank B unlocked feature, while UX Information Architecture V3 describes first Hero Summoning in the 5–15 minute band. Current runtime recruitment is not consistently rank-gated.

This is recorded as `PROGRESSION_UNLOCKS.hero_roster` with `enforcement: 'declared'`. Do **not** silently gate or ungate the system until the onboarding/balance decision is made and validated against the fresh-save progression curve.

## First-60-minute overload reduction applied in this batch

Before this contract, Settlement appeared in the primary navigation from Rank E and the direct Settlement screen could claim Mountain Haven immediately, despite the system itself describing Rank C as its unlock. The rank-up listener also read a nonexistent `rankIndex` event field, so the intended automatic Rank C path was dead.

Now:
- Settlement is progressively revealed at Rank C;
- direct-route claim cannot bypass Rank C;
- rank-up unlock consumes the actual typed `newRank` event value;
- Tower and Settlement no longer duplicate the magic rank index `2`;
- Mercenary hiring and mercenary Market contracts cannot bypass the constructed Tavern;
- unresolved Hero/Partner/Pet timing and the question of whether a locked Mercenary teaser is too early remain visible debt instead of being guessed away.
