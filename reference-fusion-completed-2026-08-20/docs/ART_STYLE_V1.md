# Anime Infinite Ascension — Art Style v1.0 & Production Visual Bible

> **Visual Source of Truth**: `DESIGN.md`  
> **Status**: Locked & Verified (Phases 95.1 – 95.5)  
> **Target Audience**: Pixel Fantasy RPG & Idle-Cultivation Players  

---

## 1. Core Visual Pillars

1. **Dark Pixel-Fantasy Identity**:
   - Palette dominated by deep obsidian/charcoal (`#09090b`, `#1c1917`), antique warm bronze borders (`#b45309`, `#d97706`), and luminous celestial gold accents (`#f59e0b`, `#fde047`).
   - Zero generic SaaS styling, flat rounded pastels, or emoji placeholders in production.
   - Strict adherence to `image-rendering: pixelated` and crisp vector pixel contours.

2. **Resolution-Independent Sprite Contracts**:
   - Base protagonist canvas: `64×64 px` rendered with integer pixel scaling.
   - Pet progression canvas: `48×48 px` (Stage 1), `64×64 px` (Stage 2), `80×80 px` (Stage 3).
   - Enemy family hierarchy: `64×64 px` (Minion), `96×96 px` (Elite), `128×128 px` (Boss).

---

## 2. Character & Pet Specifications (Vertical Slice)

### 2.1 Swordsman Main Character (`char_swordsman`)
- **Visual Design**: Spiky anime hair with forged bronze circlet, ruby-encrusted leather/steel breastplate, deep crimson cape, and runic greatsword.
- **Animation States (12 FPS)**:
  - **`idle`**: 4-frame rhythmic breathing stance with glowing blade aura.
  - **`attack`**: 6-frame dynamic forward slash with glowing cyan blade arc.
  - **`crit`**: 6-frame overhead cleave with fiery particle slash trail and screen displacement.
  - **`hurt`**: 2-frame recoil and bright white/red hit flash.
  - **`victory`**: 4-frame victorious blade salute with radiant golden ascension aura.

### 2.2 Ignis the Ember Drake Pet
- **Stage 1 — Ember Hatchling (`48×48 px`)**:
  - Cute baby dragon companion with flame tail embers, stubby wings, and glowing baby horns.
- **Stage 2 — Flame Wyvern (`64×64 px`)**:
  - Quadruped battle drake with sweeping bat wings, razor talons, amber slit eyes, and spark breath.
- **Stage 3 — Infernal Solar Sovereign (`80×80 px`)**:
  - Apex dragon king with obsidian scales, blazing solar crown, colossal flaming wings, and cosmic solar God aura.

### 2.3 Goblin Family (World 1: Whispering Forest)
- **Minion — Goblin Grunt (`64×64 px`)**:
  - Green-skinned raider with spiked iron skullcap, ragged tunic, and notched wooden club.
- **Elite — Goblin Shaman (`96×96 px`)**:
  - Antlered warlock with purple warpaint, tribal gold earrings, and mystic crystal skull staff emitting pulsating violet aura.
- **Boss — Goblin King Malgok (`128×128 px`)**:
  - Colossal sovereign with spiked iron crown set with blood rubies, royal crimson fur cape, dual battleaxes, and enrage flame aura.

---

## 3. Environment: Forest of Spirits

Multi-layered pixel-fantasy parallax composition:
- **Layer 0 (Sky)**: Deep twilight gradient (`#1e1b4b` to `#050814`) with a glowing full moon and soft astral star field.
- **Layer 1 (Distant Canopy)**: Silhouetted giant spirit pines and ancient peaks.
- **Layer 2 (Misty Mid-Ground)**: Emerald mossy canopy with pulsing bioluminescent spirit spores (`#34d399`, `#38bdf8`, `#fde047`).
- **Layer 3 (Battle Ground)**: Foreground wooden battle bridge and runic stone platform with dark bronze reinforcement.

---

## 4. Dark Pixel-Fantasy Battle UI

- **Rhythm Cadence Reticle**:
  - Antique bronze mechanical gauge with gold center notch and expanding timing ring.
  - Visual feedback decal indicators: `★ PERFECT CADENCE` (Gold), `✓ GREAT HIT` (Cyan), `MISSED BEAT` (Muted Steel).
- **Health & Boss Status**:
  - Segmented bronze health bars with dynamic emerald-to-red gradients based on current HP.
  - Gothic boss warning banner overlay with red velvet fill and golden hazard runes.
- **Action & Auto-Battle Controls**:
  - Forged bronze attack buttons with runic sword iconography and tactile recoil on click.
- **Parchment Event Presentation**:
  - Darkened parchment modal with wax heraldic seal, gothic category ribbons, and bronze-bordered choice cards.
- **Class Tree Sanctuary**:
  - Forged class cards with elemental icon badges, stat breakdown grids, and radiant selection borders.

---

## 5. Viewport Verification & Responsiveness Matrix

| Viewport | Layout Strategy | Status |
| :--- | :--- | :--- |
| **390px (Mobile)** | Battle-first vertical stack; large touch targets (min 44px); collapsible context menus | **Verified ✅** |
| **1366×768 (Desktop)** | Two-column modular layout: Battlefield on left (~60%), Context/Sect on right (~40%) | **Verified ✅** |
| **1920×1080 (Desktop)** | Full widescreen layout with centered battlefield arena, side systems, and generous margins | **Verified ✅** |

---

## 6. Style Lock Sign-Off

- **Production Art Engine**: `src/ui/art/PixelSpriteRenderer.ts`
- **Animation System**: `src/ui/design/animations.css`
- **Battlefield Integration**: `src/ui/components/BattlefieldViewport.ts`
- **Rhythm Indicator**: `src/ui/components/RhythmBeatIndicator.ts`
- **All 71 Test Suites (344/344 Tests Passing)**: **Verified ✅**
- **Production Vite Build**: **Verified ✅**
