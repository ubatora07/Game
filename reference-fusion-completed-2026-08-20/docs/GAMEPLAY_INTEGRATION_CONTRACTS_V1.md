# Gameplay Integration Contracts V1

Status: **SOURCE + RUNTIME HARNESS VERIFIED** (2026-08-19)

This document defines the cross-system rules consolidated in Phase 10. It is intentionally about ownership and transaction boundaries, not balance tuning.

## Campaign reward transaction

- Encounter base rewards are granted per defeated encounter.
- A stage first-clear reward is granted **only on the encounter that actually clears the stage**.
- `campaign.firstClears` is updated only after stage completion.
- Campaign reward/progression mutation completes inside `GameStore.set` before campaign/combat reward events are emitted by the authoritative combat path.
- `CampaignCombatService.isResolvingDeath` is the authoritative duplicate-death guard. Manual, auto, hero-skill and pet damage all converge on the same death resolution path.

## Damage routing

- Manual attacks, auto attacks, hero direct-damage skills and pet actions use `CampaignCombatService.applyDamageToEnemy`.
- Boss shield and damage-reduction mechanics therefore apply consistently regardless of damage source.
- Damage sources do not grant campaign kill rewards directly; only enemy death resolution does.

## Party and active focus

- `PartyTeamSystem` owns the two-character party class state.
- Reapplying party modifiers is idempotent: class/skill-node sources are cleared before registration.
- `activeFocusCharId` is an **editing/loadout focus**, not a combat multiplier or an active/inactive combat toggle.
- Switching active focus must not change combined party modifiers or combat power.
- Equipment Inventory initializes from and writes back to the authoritative party focus.

## Pet synergy

- Pet class synergy can be satisfied by either unlocked party character.
- Synergy modifiers are registered once through the pet modifier source and are rebuilt when class/party state changes.

## Mercenary lifecycle

- Active contracts register `mercenary` modifier sources.
- Expired contracts are deleted before modifiers are reapplied.
- Deserialize checks expiry immediately; expired saved contracts cannot resurrect bonuses.

## Story and world consequences

- Settlement story path events are typed EventBus contracts.
- The existing compatibility path ID `lord` remains unchanged in saves.
- Choosing the settlement leadership path creates the permanent `sovereign_citadel_erected` world flag.
- Settlement consumes active world flags through a text-free visual overlay; WorldState is therefore no longer write-only narrative state.

## Modifier reload invariant

For stateful modifier systems, serialize → clear resolver → deserialize must reproduce the same resolved stats and modifier count. Re-deserializing the same save must not stack duplicate sources.

## Validation evidence

Independent Node runtime harness (CommonJS-compiled dependency graph, with Vite DEV constants replaced only in the temporary harness) passed 10/10 assertions:

1. first-clear only on final encounter;
2. hero damage skill cannot duplicate kill reward;
3. party modifiers idempotent + focus non-combat;
4. mercenary expiry clears modifiers;
5. story → world → visual consequence;
6. pet synergy sees second party character;
7. shared boss damage path applies shield;
8. duplicate death resolution guarded;
9. reward events follow store notification;
10. modifier sources stable across deserialize cycles.

Full Vitest/Vite/Playwright execution remains blocked in the supplied Linux sandbox because the uploaded `node_modules` contains Windows-only Rollup native packages. No browser/build pass is claimed here.
