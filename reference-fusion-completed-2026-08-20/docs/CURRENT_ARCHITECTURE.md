# Current Architecture - Anime Infinite Ascension

## Stack & Environment
- **Build System:** Vite
- **Language:** TypeScript (v5.4.5)
- **Testing:** Vitest
- **Package Manager:** npm
- **No Heavy Frameworks:** Pure DOM and Canvas manipulation for UI and VFX.

## Entry Points
- `index.html`: Contains basic UI containers (app, loading splash) and imports `src/main.ts`.
- `src/main.ts`: Main bootstrap logic, setting up state, layout (Header, Nav, ModalManager, Canvas), initiating `GameLoop`, and subscribing to `store`.

## Core Systems (`src/core/`)
- `GameState.ts`: Central store implementation. Schema version: 2. Contains `PlayerStats`, `Settings`, `Buffs`, `ComboState`, and core properties (power, gold, etc.).
- `GameLoop.ts`: `requestAnimationFrame` loop that provides `dt` to `EconomyEngine` and specific update systems.
- `EventBus.ts`: Central event system for loose coupling between logic and UI (e.g. `events.emit('modal:open', ...)`).
- `BigNumber.ts`: Utility for safe big-number formatting and representation.

## Economy Engine (`src/economy/`)
- `EconomyEngine.ts`: Source of truth for all calculations. Fully decoupled manual clicking (Power/Gold) vs passive buildings.
- `EconomySimulator.ts`: Headless simulation capable of tracking active vs optimal vs idle play styles and multi-run horizons.

## Sub-Systems (`src/systems/`)
- Specific logic blocks corresponding to the roadmap: `TowerSystem`, `HeroSystem`, `TrainingSystem`, `OfflineSystem`, `QuestSystem`, `RandomEventSystem`, `AscensionSystem`, `ReincarnationSystem`.

## UI & Presentation (`src/ui/`)
- **Components:** Modular UI code (e.g. `Header`, `Navigation`, `ToastManager`).
- **Modals:** Popups for Ascension, Heroes, Offline rewards, etc.
- **Screens:** Individual tabs (Home, Tower, Heroes, Summon, SoulTree, Quests).
- **VFX:** `ParticleCanvas` and `FloatingNumbers` to supply "Game Juice" without heavy framework overhead.

## External Services (`src/services/`)
- **SaveSystem:** Handles serialization, version migration (`SaveMigrations`), and atomic saves.
- **Platform:** `YandexGamesService` and `MockPlatformService` providing abstract SDK endpoints for cloud saves and localization.
- **I18n:** Simple localization engine.

## Conclusion
The architecture is well structured, heavily decoupled, and currently running **Balance v2**. The application uses a single state tree, immutable updates, and deterministic simulation logic.
