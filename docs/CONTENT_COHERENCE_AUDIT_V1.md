# Content Coherence Audit V1

**Scope:** structural coherence pass for Phase 13. This is not a declaration that all Phase 13 content is finished.

## Automated evidence

`npm run qa:content-coherence` scans player-facing content identities and live progression-gate usage. It currently proves:
- Rank-gated Settlement/Tower thresholds are centralized instead of duplicated as numeric literals;
- the Settlement primary route/direct-claim path cannot bypass its Rank C progression contract;
- mercenary hiring and mercenary Market contracts cannot bypass Settlement ownership + constructed Tavern progression;
- player-facing duplicate names across `src/content` fail the audit unless explicitly recognized as one intentional cross-system identity;
- the only current exact duplicate player name is **Master Goran**, intentionally represented by the Settlement NPC and Forge blacksmith service definitions;
- Adventure event `minRank` and choice-level requirements are enforced instead of existing as inert schema fields;
- the unresolved Hero roster timing conflict remains explicit rather than silently changing balance/onboarding.

## Current content inventory snapshot

The repository contains a broad RPG stack: protagonist + second character, four classes and class trees, gacha heroes, pets, mercenaries, settlement NPCs/buildings, equipment/evolution, crafting materials/recipes, market/black-market offers, titles, Karma, narrative/world-state/legacy endings, relics, expeditions, Tower, quests, achievements, dailies and content packs.

The automated audit scans **222 `defaultName`/`name` fields** in `src/content`; a broader preliminary names+titles scan saw 257 fields. Both passes found only one exact duplicate-name group (`Master Goran`). This means the main coherence risk is not accidental duplicate naming; it is **too many systems surfacing before the player needs them** and old role/timing contracts disagreeing with newer UX documents.

## Concrete findings

### Fixed now
1. **Settlement timing contradiction:** declared Rank C system was visible/claimable from Rank E.
2. **Dead Settlement rank-up hook:** listener expected `rankIndex`, but `ascension:rankUp` emits `newRank`.
3. **Duplicate rank threshold literals:** Tower and Settlement each hardcoded index `2`.
4. **Mercenary progression bypass:** Tavern claimed to unlock mercenary hiring, but Team/Market could hire before the Tavern existed. Direct hiring and mercenary contract purchases are now fail-closed until Mountain Haven is owned and the Tavern is constructed; existing loaded contracts are allowed to expire normally.
5. **Adventure requirement bypasses:** event `minRank` plus choice Gold/Class/Pet/Title/Karma requirements existed in schema but were not enforced. Runtime execution and modal availability now fail closed.
6. **Intentional cross-system identity:** Master Goran is one character serving Settlement + Forge, not two unrelated NPCs.

### Still open
1. **Adventure scheduler disconnect:** the event pool, resolver, cooldowns and modal exist, but no live gameplay system currently calls weighted selection/opening. This is now tracked as `P13-29` and must be wired without inventing an unvalidated event cadence.
2. **Hero recruitment timing:** RESOLVED — current runtime intent wins: Rank E fresh saves receive 150 starter Crystals and recruitment is an early system; Rank B no longer falsely advertises the unlock.
3. **Second-character timing:** RESOLVED — first World 1 boss clear presents a dedicated oath story; accepting it persists the invitation and reveals the Partner setup in Team.
4. **Mercenary surfacing:** Team can still open the Guild as a locked teaser before Tavern construction, but no hire/purchase can bypass progression. Browser/onboarding validation must decide whether the teaser itself is too early.
5. **Pet discovery timing:** collection UI can be inspected before acquisition; whether that is teaser or overload needs browser/onboarding validation.
6. Remaining Phase 13 category audits need qualitative review of roles, progression chains and unlock pacing; they are intentionally left unchecked until that work is performed.


## Adventure live cadence contract — BATCH-16

- Scheduling opportunity occurs only on `campaign:stage_cleared` where `isFirstClear === true`.
- The cleared stage must be the world final stage (`stageNumber === world.stageCount`).
- Weighted selection still respects event eligibility, once-only history and cooldowns.
- Events with no currently eligible choice are excluded from selection to prevent decision deadlocks.
- Adventure presentation pauses campaign combat and the modal is non-dismissible by backdrop/Escape.
- Choosing an outcome closes the Adventure modal first, releases its pause, then executes the outcome so hero/pet follow-up modals can open cleanly.
- No arbitrary timer/probability cadence was invented; cadence expansion remains a future browser/onboarding balance decision.


## Partner Awakening milestone contract — BATCH-17

- Fresh saves cannot awaken the second Main Character directly.
- The first clear of World 1 final stage (`1-10`) prioritizes the dedicated `evt_story_oathbound_partner` Adventure story instead of a random encounter.
- Accepting the oath persists `story_partner_oath_invitation` in Karma major-choice history and opens the Partner class/name setup.
- The Team Partner action is progressively disclosed only while the invitation is available and the Partner is still locked.
- `PartnerUnlockSystem.completeAwakening` is the production completion path and fails closed without the invitation.
- The invitation survives save/reload through the existing Karma V7 domain, so dismissing the setup cannot permanently lose the unlock.
- Player-facing identity was moved from legacy “Soul Resonance / Soul Partner” language to an oathbound frontier companion without renaming stable internal slot IDs.


## Hero roster timing contract — BATCH-18

- Current source is authoritative: fresh saves begin at Rank E with 150 Crystals explicitly reserved for an early Hero summon.
- `PROGRESSION_UNLOCKS.hero_roster` is therefore a Rank E runtime contract, not a deferred Rank B declaration.
- `HeroSystem.isRecruitmentUnlocked()` consumes the shared progression contract before paid or rewarded-ad summons.
- Rank B no longer advertises `heroes` as a newly unlocked feature; its player-facing description is a rank/power identity only.
- UX V3 keeps 5–15 minutes as a preferred **guidance/surfacing** band, not an invisible balance gate.
- No Crystal prices, pull rates or combat balance values changed.


## First Pet discovery contract — BATCH-19

- The existing `evt_pet_mystic_egg_nest` is the canonical first-pet story; no duplicate pet-acquisition content was added.
- If the collection is still empty, the first clear of World 2 final stage (`2-10`) prioritizes that Pet Nest over ordinary Adventure selection.
- If a pet was already acquired through Market/another event, the milestone is skipped and ordinary Adventure selection proceeds.
- Team hides the Pet-management action until `PetSystem` owns at least one pet, then refreshes on `pet:acquired`.
- The existing Pet Nest still offers all four pet choices and `PetSystem` auto-equips the first owned pet.
- Exact 15–30 minute wall-clock timing remains browser/balance evidence, not a hard timer in source.


## First-hour secondary disclosure — BATCH-20

- World starts with Campaign/Quests; Tower appears at its canonical Rank C gate and Expeditions after the first owned Hero.
- More keeps always-relevant run/settings surfaces while hiding empty Relics, Soul/Legacy Tree and Legacy Codex until their existing state makes them meaningful.
- Team hides Mercenary Guild until Mountain Haven owns a constructed Tavern, matching the already enforced transaction gate.
- Disclosure reacts to live state (`rankId`, Hero ownership, pet/partner events, settlement construction) without adding new balance thresholds.
- `P13-27` is closed for source-level overload reduction; exact 390px/browser pacing remains covered by separate Phase 11/15 QA tasks.
