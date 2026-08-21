# Hardcoded Player Copy Audit — Localization V2

Date: 2026-08-19
Status: SOURCE-VERIFIED / BROWSER-OVERFLOW-PENDING

## Scope

This audit covers player-facing runtime copy in `src/ui` and player notifications emitted from `src/systems`.
It distinguishes production UI from developer-only and legacy/dead-route code.

## Enforced production contract

`scripts/i18n-audit.cjs` now enforces:

- exact EN/RU key parity;
- EN/RU placeholder parity;
- every literal `t('...')` call resolves in both dictionaries;
- dynamic content keys in strict content catalogs resolve in both dictionaries;
- migrated UI files cannot reintroduce obvious raw English copy;
- runtime player toasts in `src/systems` and `BattleScreen` cannot use literal `message: '...'` or template-literal copy.

Current source gate snapshot:

- EN keys: 1645
- RU keys: 1645
- literal `t()` keys checked: 428
- strict UI files: 25
- strict content catalogs: 11
- raw runtime toast literals: 0

## Migrated active runtime surfaces

The strict UI set currently covers Battle, HeroStage, Battlefield, Settlement, Soul/Legacy progression, Expeditions, Relics, Heroes, Summon, Tower, Rhythm feedback, Settings, Settlement visual labels, and the RPG modals for pets, equipment, market, titles, mercenaries, crafting, raids, story, NPCs and Legacy Codex.

Runtime notification systems are also migrated: pets, daily rewards, relics, party/classes, achievements, reputation, titles, tower, skill tree, random events, mercenaries, adventure events, settlement claim, expeditions, rhythm easter egg, market, crafting/equipment and boss surge.

## Remaining heuristic findings

The remaining high-confidence scan outside the strict set is intentionally classified rather than silently ignored:

- `src/ui/components/DevOverlay.ts` — developer-only telemetry/cheats. Production reachability is separately guarded by the release-safety gate.
- `src/ui/screens/HomeScreen.ts` — legacy screen retained only for compatibility/cleanup review; findings are numeric labels (`×count`, `+count`, `Lv.x/y`), not narrative copy.
- `src/ui/screens/QuestsScreen.ts` — numeric progress/count assignments only.

These findings do not represent unresolved English narrative copy in the active production UI.

## Known content follow-up

Localization correctness does not mean the entire world bible migration is complete. Large legacy content catalogs (hero names/lore, old building/rank/upgrades copy, world cultural terms, historical docs) remain governed by `scripts/terminology-audit.cjs` and the terminology migration backlog. Internal IDs remain intentionally untouched for save/event compatibility.

## Browser validation still required

Source checks cannot prove layout fit. The following remain open until a fresh Linux-compatible build can be produced:

- 390px Russian overflow pass;
- 1366px desktop Russian copy/layout pass;
- Playwright interaction/responsive pass.
