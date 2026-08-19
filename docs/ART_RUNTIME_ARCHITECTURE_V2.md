# ART RUNTIME ARCHITECTURE V2

Status: **ACTIVE SOURCE-OF-TRUTH FOR RUNTIME ART RESOLUTION**

## Purpose

The battlefield must never hardcode a specific world, enemy family, protagonist class, or pet identity. Gameplay content owns stable IDs; the runtime art layer resolves those IDs into production assets or deterministic procedural fallbacks.

This phase intentionally does **not** claim that the procedural SVG/CSS fallbacks are final pixel art. Their job is to make the runtime architecture production-asset-ready without blocking gameplay while raster atlases are created.

## Runtime resolution boundaries

| Gameplay source | Runtime resolver | Current fallback |
|---|---|---|
| `CampaignWorld.bgAsset` | `WorldArtRegistry` | four-layer seamless procedural parallax |
| `ActiveCombatEntity.spriteId` | `EnemySpriteRegistry` | silhouette-specific procedural sprite |
| `PartyTeam.char_1.classId` | `PlayerSpriteRegistry` | class-specific procedural sprite |
| `PetInstance.id + evolutionStage` | `PetSpriteRegistry` | pet-specific procedural sprite |
| UI semantic icon ID | `UIIconRegistry` | vector line-icon fallback |

`BattlefieldViewport` consumes only these semantic identifiers. Direct calls to forest/goblin/swordsman/Ignis renderer functions are forbidden there and enforced by `scripts/art-registry-audit.cjs`.

## Production asset contract

`ArtAssetTypes.ts` defines:

- image/atlas/procedural source kinds;
- sprite atlas metadata;
- per-animation frame metadata;
- sprite presentation metadata;
- player/enemy/pet silhouette fallback metadata;
- four-layer world parallax metadata;
- UI icon metadata.

Existing `content/artPipeline.ts` remains the source of truth for logical sprite dimensions and frame budgets. `PIXEL_SCALE_RULES` adds nearest-neighbor/integer-scale requirements and a 192px seamless world-tile width.

## World parallax contract

Every campaign world resolves exactly four horizontal layers:

1. `sky` — speed `0.05`
2. `far` — speed `0.14`
3. `mid` — speed `0.32`
4. `foreground` — speed `0.68`

Every layer has:

- `repeatX: true`;
- `seamlessX: true`;
- an explicit asset ID;
- a pixel scale;
- a stable z-index;
- a fallback palette/pattern.

The procedural fallback tile is exactly 192px wide and the animation scrolls exactly `-192px` per loop, so the fallback loop is horizontally seamless by construction. Real raster layers introduced in Phase 9 must obey the same contract.

Reduced-motion mode disables parallax animation.

## Sprite resolution contract

### Enemy / boss

All 25 campaign enemy sprite IDs and all 10 boss sprite IDs are explicitly registered. The fallback renderer supports distinct silhouettes (`humanoid`, `wolf`, `tree`, `spirit`, `golem`, `demon`, `dragon`, `beast`, `void`) instead of rendering every entity as a goblin.

Boss definitions carry presentation metadata including role, logical size, render scale, shadow scale and aura color.

### Protagonist

The runtime reads `PartyTeam.char_1.classId`. Swordsman can still use the existing detailed fallback, while Mage, Archer and Assassin resolve to distinct class-specific silhouettes. No save or class ID is renamed.

### Pet

The runtime resolves `petId` first and evolution stage second. Ignis can still use the existing detailed fallback; Fenrir, Sylph and Aegis no longer render as Ignis.

## Audio / presentation hook

World art metadata exposes `ambienceTheme`. `BattlefieldViewport` synchronizes the active world theme through `SoundService.setWorldTheme()` and switches to the existing `boss` theme while a boss is active. This is a hook for authored audio replacement later; it does not claim the current oscillator BGM is production audio.

## Fallback policy

Missing IDs must never crash combat. Resolver behavior:

1. return a safe procedural fallback;
2. report the missing ID only in DEV;
3. deduplicate diagnostics;
4. never expose debug diagnostics as player UI.

## Automated gate

`npm run qa:art-registry` validates:

- all campaign worlds are registry-covered;
- all enemy/boss sprite IDs are registry-covered;
- all four class IDs are registry-covered;
- all four pet IDs are registry-covered;
- all six semantic primary-nav icon IDs are registry-covered;
- Battlefield does not bypass registries with direct legacy renderer calls;
- Battlefield actually binds `bgAsset`, `spriteId`, class ID and pet ID;
- world parallax is four-layer + seamless-repeat compliant;
- pixel-scale/seamless-width rules exist;
- class/pet/enemy non-generic fallback paths exist.

The gate runs automatically before `tsc` in `npm run build`.

## Phase 9 handoff

Phase 9 should replace fallback sources for **World 1 vertical slice first**, without changing Battlefield logic:

- 4 real seamless raster parallax layers;
- 1 real protagonist class animation atlas;
- 3 normal enemies;
- 1 elite;
- 1 boss;
- 1 pet;
- authored VFX/audio hooks.

The registry boundary is intentionally designed so those assets can replace procedural fallbacks by changing registry metadata rather than gameplay code.
