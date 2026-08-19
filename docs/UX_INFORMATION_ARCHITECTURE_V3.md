# UX INFORMATION ARCHITECTURE V3 — Systems Unification & Interface Specification
## Anime Infinite Ascension Interface Design & Usability Guide

**Date**: 2026-08-19  
**Version**: 3.0.0  
**Authoritative Source**: `DESIGN.md`, `docs/ART_STYLE_V1.md`

---

### 1. Executive Summary & Core Objective
As *Anime Infinite Ascension* grew from a prototype clicker into an expansive 37-system RPG, interface complexity threatened player comprehension. Phase 114 establishes **UX Information Architecture V3**, organizing all systems into **6 coherent primary domains**, eliminating menu hunting through **Contextual Surfacing**, and enforcing **Progressive Disclosure** across early-game play.

---

### 2. Navigation Architecture Comparison & Evaluation

```
  ┌─────────────────────────────────────────────────────────────────────────────┐
  │                 CANDIDATE A: TASK-ORIENTED DOMAIN MODEL                     │
  │                                                                             │
  │   [ ⚔️ Hero ]  [ 👥 Team ]  [ 🔥 Battle ]  [ 🏰 Settlement ]  [ 🗺️ World ]  [ ⋯ More ] │
  └─────────────────────────────────────────────────────────────────────────────┘
```

#### Evaluation Matrix

| Criterion | Candidate A (Domain Model) | Candidate B (Legacy Action Split) | UX Evaluation / Winner |
| :--- | :--- | :--- | :--- |
| **Primary Tabs** | `Hero`, `Team`, `Battle`, `Settlement`, `World`, `More` (6) | `Battle`, `Hero`, `Sect`, `Ascension`, `Tower`, `More` (6) | **Candidate A** (Clear mental model) |
| **Hero vs Team Mental Model** | Single protagonist builds separated from party/companions. | Protagonist, 2nd Character, Pets, and Mercs scattered across 4 menus. | **Candidate A** (Zero hunting) |
| **Settlement Hub** | Unifies Town, Forge, Market, Raids, and Chronicles under 1 roof. | Blacksmith, Market, and Defense split across disparate modals. | **Candidate A** (Physical world fantasy) |
| **World & Exploration** | Groups Campaign Map, Tower, Expeditions, and Event sagas. | Tower is a main tab while Expeditions and Events are hidden. | **Candidate A** (Balanced density) |
| **Mobile Thumb Reach** | Battle is central; Hero & Team reachable with left/right thumb. | Battle is far left, causing thumb stretch on 390px screens. | **Candidate A** |

**Conclusion**: **Candidate A** is chosen as the official standard for Information Architecture V3.

---

### 3. Detailed Domain System Mapping

```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│     1. HERO     │ │     2. TEAM     │ │    3. BATTLE    │
├─────────────────┤ ├─────────────────┤ ├─────────────────┤
│ • Main Char (C1)│ │ • Partner (C2)  │ │ • Campaign Boss │
│ • Class Tree    │ │ • Companion Pet │ │ • Rhythm Flurry │
│ • Equipment/Arm │ │ • Hero Roster   │ │ • Auto-Battle   │
│ • Active Titles │ │ • Mercenary Bar │ │ • Stage Banner  │
└─────────────────┘ └─────────────────┘ └─────────────────┘
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  4. SETTLEMENT  │ │    5. WORLD     │ │     6. MORE     │
├─────────────────┤ ├─────────────────┤ ├─────────────────┤
│ • Haven Village │ │ • World Map     │ │ • Sect Dojo     │
│ • Goran's Forge │ │ • Infinite Tower│ │ • Samsara Wheel │
│ • Lyanna Market │ │ • Expeditions   │ │ • Soul Tree     │
│ • Raid Defense  │ │ • Story Sagas   │ │ • Legacy Codex  │
│ • Story Chapter │ │ • Random Events │ │ • Settings      │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

---

### 4. Progressive Disclosure Timeline (Fresh-Save UX Pacing)

> **Hero roster availability contract:** recruitment is technically available from the Rank E fresh-save state; the 5–15 minute band describes preferred onboarding/surfacing, not a hidden Rank B gate. Fresh saves intentionally include 150 Crystals for the first 100-Crystal summon.

To prevent cognitive overload, systems reveal themselves only when mechanically necessary:

| Playtime Band | Newly Unlocked Systems | First Explanation / Prompt | First Required Player Action | Where Player Finds It Later |
| :--- | :--- | :--- | :--- | :--- |
| **0–5 min** | Training, Manual Attack, Rhythm Attack, Stage 1 Boss | "Tap to train Chi and strike in rhythm with cosmic energy!" | Tap Training $\to$ Defeat First Goblin Scout | **Battle Screen** |
| **5–15 min** | Hero Summoning guidance, First Class Selection | "Your first recruit is ready — build a support roster while defining your own class." | Summon first Hero / Choose Class | **Team / Hero Tabs** |
| **15–30 min** | Partner Slot 2, Companion Pet Nest, First Event | "A lost egg stirs in the wilderness. Hatch your companion!" | Hatch starter Pet & equip in Team slot | **Team Tab** |
| **30–60 min** | Mountain Haven Settlement, First Equipment Forge | "Clear the mountain ruins and awaken Goran’s forge furnace." | Build Lumber Hut & Forge first weapon | **Settlement Tab** |
| **1–3 hours** | Expanded Market, Tavern Mercenaries, Raids, Karma Sagas | "Caravans and sellswords have arrived at Mountain Haven!" | Review first raid threat / Hire mercenary | **Settlement Tab** |
| **3h+ (Late)** | Samsara Rebirth, Infinite Tower 20+, Legacy Codex Boons | "The wheel of rebirth awaits. Transmute your soul into eternity." | Perform first Samsara Reincarnation | **More Tab** |

---

### 5. Contextual Surfacing & Smart Shortcuts

Instead of forcing players to search through 6 tabs and 15 modals, contextual prompts appear when relevant:

```
  [ ⛏️ Rare Star Ore Acquired ] ────────▶ [ Shortcut: Open Master Goran's Forge ]
  [ ⚔️ Raid Alarm Triggered  ] ────────▶ [ Shortcut: View Mountain Haven Garrison ]
  [ 🛡️ Mercenary Contract Done] ────────▶ [ Notice: Rehire or Dismiss in Tavern ]
  [ 🐾 Companion Evolution Ready] ───────▶ [ Indicator: Pulse on Team > Pet View ]
```

---

### 6. Responsive Viewport Specifications

#### A. Mobile First Layout (390px Minimum)
- **Viewport Constraints**: `390px × 844px` (iPhone 12/13/14 baseline).
- **Zero Horizontal Overflow**: All containers enforce `overflow-x: hidden` with `box-sizing: border-box`.
- **Touch Target Standard**: Minimum $44\text{px} \times 44\text{px}$ interactive click areas for thumbs.
- **Bottom Navigation**: Sticky bottom bar with 6 touch targets, high contrast icons, and active indicator glow.

#### B. Desktop Modular Layout (1366×768 & 1920×1080)
- **Dominant Focus Canvas** (65% width): Centered battle and rich pixel animated viewport.
- **Contextual Management Panel** (35% width): Live settlement statistics, active mercenary timers, companion resonance, and quest tracker without obstructing combat.

---
**UX Information Architecture V3 is formally established and ready for implementation.**
