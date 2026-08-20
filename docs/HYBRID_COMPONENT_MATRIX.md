# Hybrid Component Decision Matrix

**Objective:** Map every gameplay and UI subsystem between our canonical production game (*Anime Infinite Ascension*) and the donor project (*Melvor Clone*).

---

## Decision Matrix Table

| Subsystem | Our Domain Authority | Our Current UI | Melvor Donor Equivalent | Hybrid Beta Decision | Rationale |
|---|---|---|---|---|---|
| **App Shell & Layout** | `GameApp.ts`, `layout.css` | 3-zone shell (Header, Viewport, Nav) | Top nav + tab panels + footer | **ADAPT MELVOR STRUCTURE** | Adopt Melvor's compact, responsive view container while keeping our background VFX canvas and modal layer. |
| **Header & Resource HUD** | `EconomyEngine.ts`, `GameState.ts` | `Header.ts` (Power, Gold, Crystals, Souls, Rank) | `#gold-display` + subtabs | **ADAPT MELVOR STRUCTURE** | Display our real currencies (Power, Gold, Crystals, Souls, Rank, Stage) in a clean, high-density HUD. |
| **Navigation** | `ScreenRouteRegistry.ts`, `PrimaryDomains.ts` | Bottom `Navigation.ts` (5 tabs + More modal) | Top `.nav-tab` buttons + subtabs | **ADAPT MELVOR STRUCTURE** | Hybrid two-tier navigation: Primary tabs (Battle, Hero, Inventory, Settlement, World, More) with subtabs ensuring all 15 screens are accessible. |
| **Battle / Combat** | `CampaignCombatService.ts`, `CampaignProgressionSystem.ts` | `BattleScreen.ts`, `BattlefieldViewport.ts` | `src/ui/combat-view.ts` (3 panels) | **ADAPT MELVOR COMPONENT** | Adopt 3-column combat presentation (Player Stats/Gear Card \| Center Battlefield Viewport \| Right Loot & Combat Log). Domain logic remains 100% ours. |
| **Equipment & Bank** | `CraftingEquipmentSystem.ts` | `EquipmentInventoryModal.ts` | `src/ui/bank-view.ts` (Grid + Context panel) | **ADAPT MELVOR COMPONENT** | Use Melvor Bank's item grid with rarity borders and slide-out context panel for equipping, unequipping, and inspecting stats. |
| **Hero & Classes** | `classes.ts`, `PlayerSpriteRegistry.ts` | `HeroHubScreen.ts`, `ClassSelectionModal.ts` | Combat skill / player stats panel | **KEEP OURS + ADAPT MELVOR CSS** | Our hero leveling, star upgrades, class passives, and titles remain authoritative, presented in Melvor-style stat cards. |
| **Settlement & Town** | `SettlementSystem.ts` | `SettlementScreen.ts`, `BuildingInspectionModal.ts` | `src/ui/town-view.ts` (Building grid) | **ADAPT MELVOR COMPONENT** | Adapt Melvor building cards (tier progress, level, production rate, upgrade button) bound directly to `SettlementSystem`. |
| **Forge & Crafting** | `CraftingEquipmentSystem.ts` | `ForgeCraftingModal.ts`, `EquipmentEvolutionModal.ts` | Smithing action cards | **ADAPT MELVOR STRUCTURE** | Recipe list and upgrade flow styled with donor card patterns, driven by our crafting engine. |
| **Market & Economy** | `MarketSystem.ts` | `MarketModal.ts` | Bank item selling | **KEEP OURS + ADAPT MELVOR CSS** | Our market rotations, item purchase, and sell prices remain authoritative. |
| **Team & Dual Roster** | `DualTeamSaveState.ts` | `TeamHubScreen.ts`, `PartnerAwakeningModal.ts` | None | **KEEP OURS + ADAPT MELVOR CSS** | Render front/back row team slots with hybrid styling. |
| **Pets System** | `PetSystem.ts`, `PetSpriteRegistry.ts` | `PetModal.ts` | None | **KEEP OURS + ADAPT MELVOR CSS** | Pet evolutions, active bonuses, and level-ups in hybrid card container. |
| **World & Tower** | `TowerSystem.ts`, `WorldStateTypes.ts` | `WorldHubScreen.ts`, `TowerScreen.ts` | Area selection cards (`.area-card`) | **ADAPT MELVOR STRUCTURE** | Present Tower floors and World expedition nodes with donor area card patterns. |
| **Quests & Dailies** | `QuestSystem.ts`, `DailySystem.ts` | `QuestsScreen.ts`, `DailyScreen.ts` | None | **KEEP OURS + ADAPT MELVOR CSS** | Quests and streak rewards formatted in hybrid cards. |
| **Soul Tree & Rebirth** | `EconomyEngine.ts`, `ReincarnationSystem.ts` | `SoulTreeScreen.ts`, `ReincarnateModal.ts` | None | **KEEP OURS + ADAPT MELVOR CSS** | Soul talent nodes and reincarnation multipliers formatted in hybrid cards. |
| **Relics & Codex** | `RelicSystem.ts`, `LegacyEndingTypes.ts` | `RelicsScreen.ts`, `LegacyCodexModal.ts` | None | **KEEP OURS + ADAPT MELVOR CSS** | 8 relic slots and legacy lore entries in hybrid grid. |
| **Expeditions & Mercenaries** | `MercenarySystem.ts` | `ExpeditionsScreen.ts`, `MercenaryGuildModal.ts` | None | **KEEP OURS + ADAPT MELVOR CSS** | Timer-based expeditions formatted in hybrid action bars. |
| **Notifications & Toasts** | `ToastManager.ts` | `ToastManager.ts` | `src/ui/notifications.ts` | **KEEP OURS** | Our `ToastManager` already supports colored toast queues and accessibility. |
| **Persistence / Save** | `SaveService.ts`, `RpgSaveAggregate.ts` | Save Schema V7 (Local + Cloud) | Rust JSON file (`storage.ts`) | **KEEP OURS (ZERO DONOR SAVE)** | Save V7 is the sole authoritative persistence schema. |
| **Design Tokens & Theme** | `tokens.css`, `animations.css` | Dark Cultivation Palette | Melvor Dark Idle Palette (`styles.css`) | **ADAPT MELVOR CSS** | Build namespaced `hybrid/` CSS combining Melvor's clean layout rules with our anime tokens. |

---

## 3. Strict Safety Boundaries
1. **No Melvor GameState:** All views connect through typed ViewModels to our `store.get()` and `events`.
2. **No Double Game Loop:** Our `GameLoop.ts` remains the single tick driver.
3. **No Missing Screens:** All 15 canonical routes remain reachable via primary or secondary navigation.
