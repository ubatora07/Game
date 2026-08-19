# Content Coherence Audit V1

**Scope:** structural coherence pass for Phase 13. This is not a declaration that all Phase 13 content is finished.

## Automated evidence

`npm run qa:content-coherence` scans player-facing content identities and live progression-gate usage. It currently proves:
- Rank-gated Settlement/Tower thresholds are centralized instead of duplicated as numeric literals;
- the Settlement primary route/direct-claim path cannot bypass its Rank C progression contract;
- mercenary hiring and mercenary Market contracts cannot bypass Settlement ownership + constructed Tavern progression;
- player-facing duplicate names across `src/content` fail the audit unless explicitly recognized as one intentional cross-system identity;
- the only current exact duplicate player name is **Master Goran**, intentionally represented by the Settlement NPC and Forge blacksmith service definitions;
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
5. **Intentional cross-system identity:** Master Goran is one character serving Settlement + Forge, not two unrelated NPCs.

### Still open
1. **Hero recruitment timing:** Rank B catalog declaration conflicts with UX V3's earlier 5–15 minute summoning target.
2. **Second-character timing:** Partner Awakening modal can be reached from Team and needs a validated discovery gate.
3. **Mercenary surfacing:** Team can still open the Guild as a locked teaser before Tavern construction, but no hire/purchase can bypass progression. Browser/onboarding validation must decide whether the teaser itself is too early.
4. **Pet discovery timing:** collection UI can be inspected before acquisition; whether that is teaser or overload needs browser/onboarding validation.
5. Remaining Phase 13 category audits need qualitative review of roles, progression chains and unlock pacing; they are intentionally left unchecked until that work is performed.
