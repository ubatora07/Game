# ⚔️ Anime Infinite Ascension (Anime: Infinite Ascension)

A high-performance, dark fantasy pixel incremental RPG web game written in TypeScript, powered by Vite and HTML5 Canvas / CSS tokens.

---

## 🎮 Overview

**Anime Infinite Ascension** combines idle incremental progression with deep RPG systems, tactical dual-hero party composition, settlement building, equipment forging, pets, infinite ascension towers, and narrative boss progression.

---

## 🏗 Architecture & Codebase Map

The project is structured as a single, decoupled, TypeScript-based web application:

```text
├── src/
│   ├── main.ts                    # Bootstrap entry & systems lifecycle coordinator
│   ├── content/                   # Typed static catalogs (classes, skills, enemies, bosses, items, buildings, quests, relics, pets, events)
│   ├── core/                      # GameState store, EventBus, damage formulas, modifiers, SaveSchema V7
│   ├── economy/                   # Economy simulation engine & mathematical curves
│   ├── services/                  # Platform, Ads, Analytics, Audio, I18n (EN/RU), Save (V7)
│   ├── systems/                   # Decoupled gameplay systems (Combat, Campaign, Settlement, Party, Pet, Tower, Rebirth, etc.)
│   └── ui/
│       ├── art/                   # Runtime pixel art renderers & sprite registries
│       ├── components/            # Viewports, HUDs, Headers, Navigation (IA V3), Modals manager
│       ├── design/                # CSS design tokens, opaque RPG surfaces, animations, layout
│       ├── modals/                # Contextual RPG modals (Forge, Market, Pet, Tavern, Codex, Story, etc.)
│       ├── navigation/            # 5 Primary domains & secondary progressive disclosure routing
│       ├── screens/               # Domain Hubs & Screen views (Battle, Settlement, Team, World, Hero, etc.)
│       └── vfx/                   # Particle engine & floating combat numbers
├── tests/                         # Vitest test suite covering systems, contracts, and progression
├── e2e/                           # Playwright end-to-end and responsive UI tests
├── scripts/                       # Automated release and QA audit gates
├── docs/                          # Architecture specs, Art Bible, Governance & Balance reports
├── public/                        # Static web assets
├── index.html                     # Application entry point
├── package.json                   # Dependencies & QA automation commands
└── vite.config.ts                 # Build & bundling configuration
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node.js 24+)
- npm 9+

### Installation
```bash
npm install
```

### Development
Start the local Vite development server:
```bash
npm run dev
```
Access the application in your browser at `http://localhost:5173`.

---

## 🧪 Testing & QA Gates

Run the automated test suite and regression audits:

```bash
# Run Vitest test suite
npm test

# Run all 9 automated QA release gates
npm run build
```

### QA Audit Scripts
- `npm run qa:governance` — Verifies roadmap precedence, historical banners, and safe release rules.
- `npm run qa:source-safety` — Scans source files to ensure no debug/cheat leaks in production.
- `npm run qa:terminology` — Enforces terminology regression lock against legacy terms.
- `npm run qa:i18n` — Validates 100% translation parity across Russian and English.
- `npm run qa:content-coherence` — Verifies centralized progression gates, mercenary tavern checks, and adventure event eligibility.
- `npm run qa:meta-content` — Ensures all tower relic effects have live consumers.
- `npm run qa:art-registry` — Verifies coverage for worlds, enemies, player classes, and pets in art registries.
- `npm run qa:ui-production` — Asserts tokenized CSS geometry, contrast, and 44px touch targets.
- `npm run qa:release-safety` — Scans production bundle to ensure no forbidden debug surfaces exist.

---

## 📦 Building & Packaging for Production

### Production Build
```bash
npm run build
```
Outputs minified, production-ready static assets to the `dist/` directory.

### Portal Release Package (Yandex Games / Web)
```bash
npm run package:release
```
Runs release safety checks and packages `dist/` into `anime-infinite-ascension.zip`.

---

## 🗺 Where Code & Assets Live

| Area | Directory | Description |
| :--- | :--- | :--- |
| **Core & State** | `src/core/` | `GameState.ts`, `EventBus.ts`, `SaveSchema.ts` (V7) |
| **Gameplay Systems**| `src/systems/` | `CampaignCombatService.ts`, `SettlementSystem.ts`, `PartyTeamSystem.ts`, etc. |
| **UI & Layout** | `src/ui/` | Screens, modals, components, navigation, design tokens (`tokens.css`, `layout.css`) |
| **Art Registries** | `src/ui/art/runtime/` | Pixel art & SVG sprite registries for worlds, enemies, heroes, pets, and icons |
| **Localization** | `src/services/i18n/` | English (`en.ts`) and Russian (`ru.ts`) translations |
| **Balance & Specs** | `docs/` | Balance spreadsheets, progression formulas, art specs, and design documentation |

---

## 📄 License
Private project. All rights reserved.
