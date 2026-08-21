# WORLD 1 — PRODUCTION VERTICAL SLICE ART SPEC

Status: **LOCKED AUTHORING CONTRACT / FINAL RASTER ASSETS PENDING**

World: Whispering Forest (World 1)
Runtime asset ID: `bg_forest`

## Palette

The World 1 battlefield uses a dark evergreen + warm bronze readability scheme. White/gray atmospheric fog is not part of the production palette.

| Role | Hex | Use |
|---|---:|---|
| Night canopy | `#07120E` | sky / deepest negative space |
| Distant pine | `#123522` | far silhouettes |
| Moss green | `#1F5B32` | midground readable foliage |
| Forest green | `#173F25` | near trunks / props |
| Ground black-green | `#08180F` | foreground footing |
| Warm bronze | `#B45309` | UI/environment warm anchors |
| Amber highlight | `#F59E0B` | interactable/readability accent |
| Spirit green | `#4ADE80` | world magic accent |
| Damage red | `#EF4444` | combat-only feedback |
| Ice/click blue | `#38BDF8` | combat-only secondary feedback |

Rules:
- no white fog wash over trees;
- no bloom halo that destroys pixel edges;
- no smooth airbrush gradients inside raster sprite silhouettes;
- reserve bright accents for gameplay readability, not background noise.

## Four seamless parallax layers

All production layers are **192 px wide seamless horizontal tiles** at authoring scale. Runtime may repeat them to viewport width.

1. `bg_forest_sky.png`
   - logical size: `192 × 128`
   - speed: `0.05`
   - opaque sky/canopy negative space
   - no foreground trunks

2. `bg_forest_far.png`
   - logical size: `192 × 128`
   - speed: `0.14`
   - transparent background
   - distant ridge / tree silhouette only

3. `bg_forest_mid.png`
   - logical size: `192 × 128`
   - speed: `0.32`
   - transparent background
   - readable tree masses, branches, ruins/props sparingly

4. `bg_forest_foreground.png`
   - logical size: `192 × 128`
   - speed: `0.68`
   - transparent background
   - ground, roots, near trunks/grass framing

Every left edge must continue exactly from the right edge. No unique prop may straddle only one edge unless it is completed on the opposite edge.

## Pixel rules

- nearest-neighbor only;
- integer-scale review at 1x / 2x / 3x;
- no semi-transparent antialias pixels around opaque sprite contours unless deliberately used for VFX;
- no subpixel transforms for idle sprite placement;
- VFX may use alpha, but sprite silhouettes retain hard readable edges.

## Protagonist atlas

First production class target: `swordsman`.

Logical frame: `64 × 64`.
Required animation rows:
- idle — 4 frames;
- attack — 6 frames;
- crit — 6 frames;
- hurt — 2 frames;
- victory — 4 frames.

Atlas metadata must use the Phase 8 `SpriteAtlasMetadata` contract so Battlefield code does not change when the raster atlas replaces the procedural fallback.

## World 1 enemy slice

Production targets:
- family A: `enemy_goblin`;
- family B: `enemy_wolf`;
- family C: `enemy_treant`;
- elite: `enemy_alpha_wolf`;
- boss: `boss_treant`.

Each must have a distinct silhouette at gameplay size. Recolor-only differentiation is insufficient for different families.

## Production pet

First production companion target: `pet_ignis_drake`.
All 3 evolution stages must remain visually related while changing silhouette/scale enough to read progression.

## VFX slice

Required authored VFX contracts:
- normal attack slash;
- critical strike;
- hit impact;
- enemy death burst;
- loot pickup/flyout;
- boss warning framing.

VFX must not bake gameplay numbers/text into raster assets.

## Acceptance gates still pending

The following are deliberately not marked complete until real raster assets exist and a fresh browser build is available:
- final layer asset creation;
- final character/enemy/pet sprite creation;
- pixel-edge visual QA at 1x/2x/3x;
- seamless-loop visual QA;
- 390px mobile readability;
- 1366/1920 desktop composition QA.
