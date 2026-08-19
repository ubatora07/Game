# Anime Infinite Ascension — Art Bible & Visual Pipeline Guide

## 1. Visual Direction & Aesthetic Philosophy

*Anime Infinite Ascension* combines:
1. **Dynamic Pixel-Art Combat:** Readable silhouettes, clean outline contrast, snappy frame budgets (12 FPS), and vivid elemental particle accents on the battlefield.
2. **High-Impact Anime Character Art:** Expressive portraits, rarity aura frames, star badges, and radiant burst VFX for collection and summon ceremonies.

---

## 2. Sprite Dimension Standards

| Entity Category | Base Canvas (px) | Render Scale | Usage |
| :--- | :--- | :--- | :--- |
| **Protagonist** | $64 \times 64$ | $1.0\times$ | Player avatar with dynamic Rank aura overlays |
| **Party Heroes** | $56 \times 56$ | $0.9\times$ | 3 deployed party support companions |
| **Regular Minion** | $64 \times 64$ | $1.0\times$ | Normal campaign & tower enemies |
| **Elite Monster** | $96 \times 96$ | $1.35\times$ | High-threat mobs with purple/golden outline |
| **Stage Boss** | $128 \times 128$ | $1.75\times$ | World rulers with boss crown, aura & enrage effects |

---

## 3. Coordinate Anchors & Battlefield Layout

- **Ground Line Horizon:** `72%` from viewport top.
- **Protagonist Anchor:** `22%` horizontal X.
- **Party Hero Slots:** `8%`, `13%`, `18%` horizontal X (behind protagonist).
- **Enemy Spawn Anchor:** `78%` horizontal X.
- **Boss Spawn Anchor:** `74%` horizontal X.

---

## 4. Animation Frame Budget (Authoritative 12 FPS)

- **Idle Loop:** 4 frames (subtle breath / floating loop).
- **Attack Motion:** 6 frames (wind-up, strike apex, slash arc, recovery).
- **Hurt / Flinch:** 2 frames (white flash & knockback displacement).
- **Death Dissolve:** 4 frames (shatter into essence particles).
- **Ultimate Skill:** 8 frames (full-screen aura burst & energy slash).

---

## 5. Rarity Framing & Color Palettes

| Rarity | Badge | Border Color | Glow Atmosphere | Gradient Background |
| :--- | :--- | :--- | :--- | :--- |
| **Common** | `C` | `#94a3b8` | Slate Grey ($20\%$) | Slate Dark |
| **Uncommon** | `UC` | `#22c55e` | Emerald Green ($35\%$) | Forest Jade |
| **Rare** | `R` | `#3b82f6` | Royal Sapphire ($45\%$) | Deep Blue |
| **Epic** | `SR` | `#a855f7` | Mystic Violet ($55\%$) | Amethyst Void |
| **Legendary** | `SSR` | `#eab308` | Solar Gold ($65\%$) | Radiant Amber |
| **Mythic** | `UR` | `#ec4899` | Prismatic Crimson ($75\%$) | Celestial Rose |

---

## 6. Rendering Performance & Scaling Rules

- **Pixel-Art Sharpness:**
  ```css
  image-rendering: -moz-crisp-edges;
  image-rendering: -webkit-crisp-edges;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  transform: translateZ(0);
  ```
- **Asset Formats:** Vector SVG and WebP for 60 FPS mobile performance with zero memory bloat.
