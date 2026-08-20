# Melvor Clone — Donor Architecture & UI Audit

**Source Repository:** `alperiox/melvor-clone`  
**Commit SHA:** `4340bd69937c2b3850696c41cbefc991e7fe1cbd`  
**License:** MIT License (Attribution in `docs/THIRD_PARTY_NOTICES.md`)  

---

## 1. Executive Summary

Melvor Clone is a lightweight, clean TypeScript idle RPG implementation inspired by Melvor Idle. It uses vanilla DOM manipulation (no frontend framework), CSS grid/flexbox layouts, and a component-driven structure.

Key findings:
- **Strong Donor Areas:** Bank / Inventory grid layout, Equipment slot popover/context panel, Town building upgrade cards with clean cost/tier meters, and Combat layout (3-column layout: Player Stats/Gear | Center Active Battle | Right Combat Log).
- **Incompatible / Reject Areas:** Donor state (`game/types.ts`), donor skills (woodcutting/mining/fishing timer tick loops), donor Rust file persistence (`src-tauri`), donor combat formulas (tick-based eating/evasion). Our TypeScript domain, Save V7, Combat engine, and RPG systems remain the sole authoritative logic.

---

## 2. Module-by-Module Audit Table

| Module Name | Source File | What It Does | UI Value | Architecture Value | Decision | License Note |
|---|---|---|---|---|---|---|
| **App Shell & Main Loop** | `src/main.ts` | Bootstraps UI, runs tick accumulator (0.1s throttled DOM updates), handles offline banner. | Medium (simple layout) | Low (Tauri desktop specific) | **ADAPT PATTERN ONLY** (our `main.ts` and `GameLoop` remain authoritative) | MIT |
| **Router & UI State** | `src/ui/router.ts` | Manages active tab (`skills`, `combat`, `town`, `bank`), subtabs, and bank filter. | High (clean, decoupled UI state) | Medium (typed event emitter) | **ADAPT PATTERN** (combine with our `ScreenRouteRegistry`) | MIT |
| **Navigation & Header** | `src/ui/nav.ts` | Renders top tab buttons, gold display, subtabs, active state toggling. | High (compact, responsive top nav) | Low | **ADAPT MELVOR STRUCTURE** (preserve all 15 our screen routes) | MIT |
| **Bank / Inventory View** | `src/ui/bank-view.ts` | Renders item grid, item selection state, context panel with item stats, equip/sell actions. | **Very High** (clean, readable tile grid + side drawer) | High (efficient DOM patch diffing) | **ADAPT MELVOR COMPONENT** (bind to `CraftingEquipmentSystem` & `EquipmentInventoryModal`) | MIT |
| **Combat View** | `src/ui/combat-view.ts` | 3-column layout: Left Player Stats & Equipment, Center Active Battle & HP bars, Right Loot Log. | **Very High** (standard idle RPG combat presentation) | High (dynamic patch updates vs DOM rebuild) | **ADAPT MELVOR COMPONENT** (bind to `CampaignCombatService` & `BattlefieldViewport`) | MIT |
| **Town / Building View** | `src/ui/town-view.ts` | Renders upgradeable building cards, level badges, passive income meters, cost requirements. | **Very High** (clear card structure & upgrade buttons) | Medium | **ADAPT MELVOR COMPONENT** (bind to `SettlementSystem` & `BuildingInspectionModal`) | MIT |
| **Notifications** | `src/ui/notifications.ts` | Floating toast notifications in top-right with animation in/out. | Medium | Low (our `ToastManager.ts` already handles this) | **KEEP OURS** (our ToastManager is already robust) | MIT |
| **Footer / Action Bar** | `src/ui/footer.ts` | Bottom bar showing active background action and progress bar. | Medium | Low | **ADAPT PATTERN** (optional status banner) | MIT |
| **Game Engine** | `src/game/engine.ts` | Fixed tick loop (100ms) driving active skill timers & combat. | Low | Low (our `GameLoop.ts` + `EconomyEngine.ts` are authoritative) | **DO NOT USE** | MIT |
| **Combat Logic** | `src/game/combat.ts` | Timer-based auto-attack, evasion, weapon speeds, food eating. | Zero (differs from our combat) | Zero (we have World/Stage/Encounter campaign) | **DO NOT USE** | MIT |
| **Bank Logic** | `src/game/bank.ts` | Item slot arrays, add/remove item, sell item. | Low | Low (our `EquipmentInventory` and `CraftingTypes` are authoritative) | **DO NOT USE** | MIT |
| **Equipment Logic** | `src/game/equipment.ts` | 6 slots (head, body, legs, feet, weapon, food) stat aggregation. | Low | Low (our `CraftingEquipmentSystem` handles weapon, armor, accessory, relic) | **DO NOT USE** | MIT |
| **Town Logic** | `src/game/town.ts` | 7 buildings cost scaling and passive multipliers. | Low | Low (our `SettlementSystem` handles 10 structures + NPC affinity + raids) | **DO NOT USE** | MIT |
| **Game State & Types** | `src/game/types.ts`, `state.ts` | Donor state schema (gold, bank, equipment, skills, combat, town). | Zero (incompatible with Save V7) | Zero | **DO NOT USE** | MIT |
| **Tauri Storage** | `src/game/storage.ts` | Rust backend JSON save/load. | Zero | Zero (our `SaveService` handles local/cloud Save V7) | **DO NOT USE** | MIT |
| **CSS Theme & Styles** | `src/styles.css` | Dark theme tokens, grid cards, progress bars, HP bars, equip slots, bank grid. | **Very High** (compact, polished CSS tokens) | High | **ADAPT MELVOR CSS** (extract into namespaced `src/ui/design/hybrid/`) | MIT |

---

## 3. Key Takeaways for Hybrid Beta

1. **Keep Our Domain Pure:** All data, progression, combat calculations, inventory storage, formulas, and Save V7 remain 100% untouched in `src/core/`, `src/systems/`, `src/content/`, `src/services/`.
2. **ViewModel Adapter Layer:** Create lightweight adapters (`InventoryViewModel`, `EquipmentViewModel`, `SettlementViewModel`, `CombatViewModel`) that transform our `GameState` and system states into the clean presentation contracts expected by the adapted donor UI views.
3. **Namespaced Hybrid UI:** Place adapted UI views in `src/ui/hybrid/` and styles in `src/ui/design/hybrid/` so existing faithful screens remain intact.
