# UI Production System V1

Status: **SOURCE CONTRACT ACTIVE** — browser visual QA still pending a Linux-compatible Vite build.

## Surface language

Primary UI must read as a fantasy game interface rather than a SaaS dashboard:

- **Forged bronze** — primary frames, headers, major navigation framing.
- **Stone** — general system panels and modal bodies.
- **Wood** — settlement/contextual utility surfaces.
- **Leather** — inventory/loadout contextual surfaces.
- **Parchment** — narrative/read-only lore surfaces.

Glass blur/backdrop-filter is prohibited in primary UI surfaces. Opaque/translucent color can be used for readability, but should not imitate web-app glassmorphism.

## Geometry

- spacing scale: 4 / 8 / 12 / 16 / 24 / 32 px;
- standard radii: 2 / 4 / 6 px;
- large pill radius is reserved for true badges/pills only;
- shadows use a small controlled token set rather than per-component soft glows.

## Interaction

- minimum touch target: **44px**;
- visible `:focus-visible` ring is mandatory for keyboard/controller-ready traversal;
- destructive, primary and secondary actions have distinct surface contracts;
- disabled controls must remain legible but visibly unavailable.

## Typography

No external font file is required for the source contract:

- body uses a highly readable local/system sans-serif stack;
- display headings use a characterful local serif stack;
- data/debug/numeric monospace has a separate local stack.

A packaged production font may be introduced later only if licensing, size and glyph coverage are verified; it must not be required for layout correctness.

## Iconography

Production navigation and major gameplay identity use semantic SVG registry icons instead of platform emoji.

Current registry-backed surfaces:

- 6 primary navigation domains;
- Hero/Team/World hub emblems and actions;
- More menu;
- 10 legacy economy buildings;
- 12 rank badges.

Legacy content fields may remain for compatibility until their data schema is migrated, but active UI must resolve the semantic icon registry.

## QA

`npm run qa:ui-production` fails if:

- backdrop-filter returns to primary layout/modal/toast surfaces;
- primary/domain/More sources reintroduce emoji;
- BattleScreen renders legacy `building.icon`;
- HeroStage restores its emoji rank array;
- any building/rank lacks registry coverage;
- responsive QA falls back to 36px targets;
- required surface/focus/touch tokens disappear.
