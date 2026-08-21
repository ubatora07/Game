# Phase 69: Live Content Expansion Roadmap (Worlds 6–10 & Meta Expansion)

## 1. Overview & Expansion Strategy

This roadmap details the modular content pipeline designed for post-launch expansion updates without altering the underlying core battle engine (`CampaignCombatService`, `EconomySimulator`, `SamsaraProgression`).

---

## 2. Expansion Worlds 6–10 (50 Additional Stages)

| World | Name (EN) | Name (RU) | Element Theme | Key Boss Mechanics |
| :--- | :--- | :--- | :--- | :--- |
| **World 6** | *Thundercloud Citadel* | *Цитадель Грозовых Облаков* | ⚡ Lightning | Chain lightning shield, stun interrupts |
| **World 7** | *Abyssal Underworld* | *Бездненное Подземелье* | 🌌 Void / Dark | Life drain pulse, shadow clones |
| **World 8** | *Solar Pantheon* | *Солярный Пантеон* | ✨ Light / Solar | Radiant flare shield, burst healing |
| **World 9** | *Dragon Sovereign Peak* | *Пик Повелителя Драконов* | 🔥 Dragon / Fire | Elemental resistance cycling, mega breath |
| **World 10** | *Celestial Void Realm* | *Небесное Царство Пустоты* | 🌟 Transcendent | True damage aura, Samsara rush resistance |

---

## 3. Additional Hero Roster Expansion

| Hero ID | Name | Rarity | Element | Skill Name | Skill Effect |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `susanoo` | **Susanoo** | Mythic (UR) | ⚡ Lightning | *Storm Wrath* | Deals $800\%$ ATK to all enemies with $35\%$ crit bonus |
| `tsukuyomi` | **Tsukuyomi** | Mythic (UR) | 🌌 Void | *Moonlit Domain* | Freezes enemy cooldowns for 4s, deals $750\%$ ATK |
| `ryujin` | **Ryujin** | Legendary (SSR)| 💧 Water | *Tidal Surge* | Grants party $+30\%$ ATK and cleanses debuffs |
| `kagutsuchi`| **Kagutsuchi** | Legendary (SSR)| 🔥 Fire | *Primordial Inferno* | Burns target for $40\%$ ATK/sec over 6s |

---

## 4. Tower of Eternity Modifiers (Floors 50–100)

1. **Elemental Attunement (Floor 50+)**:
   - Enemies absorb non-matching elemental attacks, requiring balanced party synergy.
2. **Speed Run Frenzy (Floor 75+)**:
   - Enrage timer reduced to 25s; bonus crystal drops increased by $+100\%$.
3. **Ascendant Trial (Floor 100 Boss)**:
   - Supreme Celestial Arbiter boss with 3-phase phase transitions.

---

## 5. Relics & Expeditions Expansion

- **New Relics**:
  - `relic_thunder_drum`: *Thunder God's Drum* ($+35\%$ Lightning party damage).
  - `relic_moon_mirror`: *Celestial Moon Mirror* ($+25\%$ crystals from bosses).
  - `relic_dragon_scale`: *Ancient Dragon Scale* ($+20\%$ gold from auto-farm).
- **Expeditions Expansion**:
  - Tier 4 (*Abyssal Rift*): 8-hour dispatch yielding 150 gems + 30 soul essence.
  - Tier 5 (*Celestial Nexus*): 12-hour dispatch yielding 300 gems + 75 soul essence.

---

## 6. Release Verification & Backward Compatibility

- **Save Migration:** `SaveMigrations` seamlessly parses saves from World 1–5 into expanded data structures without data loss.
- **Engine Reuse:** Leverages existing vector/sprite systems, Web Audio synthesized chords, and pure CSS layout.
