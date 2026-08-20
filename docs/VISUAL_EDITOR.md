# Visual UI & Layout Editor — User & Developer Manual

The **Visual UI & Layout Editor** is a dedicated, dev-only visual layout and interface design tool for *Anime Infinite Ascension*. It allows the game owner and designers to visually inspect, move, resize, restyle, hide, swap PNG assets, configure responsive overrides, attach AI notes, save design drafts, and export clean AI-executable specifications without modifying or compromising the production HTML/CSS/TypeScript runtime.

---

## 1. Core Principles & Architecture

- **Dev-Only Isolation:** The editor is completely isolated from production builds. It runs strictly on the Vite development server (`npm run editor` / `editor.html`). Production builds (`npm run build`) produce clean artifacts in `dist/` with 0% editor overhead.
- **Real Screen Rendering:** Instead of rendering a synthetic mockup, the editor mounts the **real production screens and modals** (`BattleScreen`, `HeroHubScreen`, `SettlementScreen`, `TeamHubScreen`, `WorldHubScreen`, `ForgeCraftingModal`, `MarketModal`, etc.) in an isolated `iframe` preview sandbox.
- **Safe / Sandboxed Mode:** Preview interactions execute against a cloned snapshot (`MockStatePresets`). Real production saves (`Save V7`) and resources (Gold, Crystals, Souls) are never mutated.
- **Non-Destructive Design Drafts:** All layout tweaks, position offsets, and style overrides are persisted as non-destructive JSON drafts in `.editor/layouts/` and LocalStorage.
- **Export for AI Workflow:** When visual designing is complete, one click generates a clean AI implementation package in `.editor/exports/<ScreenName>/` with exact CSS diffs, element selectors, and formulation prompts.

---

## 2. Launching the Editor

Start the development server and open the Visual Editor:

```bash
# Option 1: Dedicated editor script
npm run editor

# Option 2: Start dev server and navigate to /editor.html
npm run dev
# Then open: http://localhost:3000/editor.html
```

---

## 3. Interface Overview

```
+---------------------------------------------------------------------------------------------------------------+
| 🥋 UI EDITOR | [Screen ▼] [Modal ▼] [State ▼] | [Device ▼] [Zoom ▼] [Grid ▼] [COMPARE] [PAUSE] [EDIT] | [Undo] [Redo] [Save] [🚀 EXPORT FOR AI] |
+----------------------+-----------------------------------------------------------------+----------------------+
| 🌳 Hierarchy / 🖼️ Assets|                            CANVAS                               |      INSPECTOR       |
|                      |                                                                 |                      |
| [Search elements...] |   +---------------------------------------------------------+   | [IDENTITY]           |
| ▶ 📦 shell.header    |   | Rulers / Guidelines                                     |   | Name, Tag, UI ID     |
| ▼ ⚔️ screen.battle    |   |                                                         |   | [POSITION & SIZE]    |
|   ▶ 📦 battlefield   |   |   [Selection Box + 8 Resize Handles]                    |   | Mode, X, Y, W, H     |
|   ▶ 👤 hero_stage    |   |   +-------------------------------------------------+   |   | [SPACING]            |
|   ▶ 👹 boss_avatar   |   |   |                                                 |   |   | Margin, Padding, Gap |
|   ▶ 🔘 action_btns   |   |   |           Live Game Screen Preview              |   |   | [FLEX / ALIGNMENT]   |
|                      |   |   |                                                 |   |   | Direction, Justify   |
| ➕ PALETTE           |   |   +-------------------------------------------------+   |   | [TYPOGRAPHY]         |
| [Panel] [Button]...  |   +---------------------------------------------------------+   | [IMAGE & SPRITES]    |
|                      |                                                                 | [AI NOTE & ART TODO] |
+----------------------+-----------------------------------------------------------------+----------------------+
```

### A. Top Toolbar
- **Screen Selector:** Switch between primary screens (`Battle`, `Hero Hub`, `Team Hub`, `Settlement`, `World Hub`) and deep routes (`Tower`, `Summon`, `Quests`, `Relics`, `Dailies`, etc.).
- **Modal Selector:** Overlay or standalone-inspect any of the 22 registered modals (`Settings`, `Stats`, `Inventory`, `Forge`, `Market`, `Pet Hub`, `Story & Lore`, etc.).
- **State Presets:** Switch between 6 isolated preview snapshots:
  - `Real Snapshot`: Clones current real save (read-only).
  - `Mock Normal`: Typical mid-game progress (Rank B, World 1-8, 2 heroes, unlocked dojo).
  - `Mock Rich`: Late-game economy (Rank S, 450M gold, 12.5k crystals).
  - `Mock Boss`: Active boss encounter on World 1-10 with boss timer active.
  - `Mock Empty`: Fresh game start (Rank E, 0 gold).
  - `Mock Maxed`: Transcendent endgame state (Rank Immortal, all buildings maxed).
- **Device Presets:**
  - `Desktop FHD` (1920 × 1080)
  - `Desktop HD` (1280 × 720)
  - `Tablet` (768 × 1024)
  - `iPhone` (390 × 844)
  - `Android` (412 × 915)
- **Zoom:** 25%, 50%, 75%, 100%, 125%, 150%.
- **Grid & Snapping:** Off, 4px, 8px, 16px.
- **Compare Mode:** Toggle between `EDITED` draft and `ORIGINAL` production baseline.
- **Pause Animations:** Freezes combat loop and CSS animations for comfortable pixel-level inspection.
- **Mode Switch:** `EDIT` (select, drag, resize) vs `PREVIEW` (interact with UI buttons and tabs).
- **History:** Undo (`Ctrl+Z`) and Redo (`Ctrl+Shift+Z` / `Ctrl+Y`).
- **Save Draft:** Debounced auto-saving + explicit save button (`Ctrl+S`).
- **🚀 EXPORT FOR AI:** Generates the complete AI specification bundle.

---

### B. Left Sidebar: Hierarchy & Assets
- **Tab 1: Hierarchy Tree:**
  - Full DOM hierarchy of the preview screen.
  - Real-time search filter by tag, class, text, and `data-ui-id`.
  - Visibility toggle (👁️ / 🙈) to hide elements in draft.
  - Lock toggle (🔒 / 🔓) to prevent accidental drags.
  - Amber badge indicating elements modified in the current draft.
- **Tab 2: Assets & PNG Upload:**
  - **Drag & Drop Dropzone:** Upload PNG, WebP, or JPEG files directly. Files are stored in `public/assets/user/`.
  - **Asset Browser:** Categorized project assets (`Characters`, `Enemies`, `Pets`, `Backgrounds`, `UI / Icons`, `User Uploads`).
  - **One-Click Replace:** Select an element on screen and click any asset to instantly swap it.
  - **Reference Screenshot Overlay:** Upload a mockup screenshot, toggle visibility, and adjust opacity (0–100%) to trace over it.
- **Element Palette:**
  - Quick-add design placeholders: `Design Panel`, `Button`, `Text / Label`, `Image Slot`, `Progress Bar`, `Spacer / Divider`.

---

### C. Canvas & Overlay
- **Selection Box:** Solid blue outline with real-time dimensions badge ($W \times H$).
- **8 Resize Handles:** `NW`, `N`, `NE`, `E`, `SE`, `S`, `SW`, `W`.
  - Hold `Shift` while resizing to lock aspect ratio.
- **Interactive Drag:**
  - Live $\Delta X, \Delta Y$ positioning.
  - Snapping to grid and dynamic alignment guide lines.
- **Keyboard Nudge:**
  - Arrow keys: move 1px.
  - `Shift` + Arrow keys: move 10px.
- **Floating Quick Toolbar:**
  - Quick alignment: Align Left, Center Horizontal, Align Top, Center Vertical.
  - Hide/Show toggle.
  - Reset element to production baseline.

---

### D. Property Inspector (Right Sidebar)
- **Identity:** Semantic Name, Tag, Class, `data-ui-id`, Source component file (`BattleScreen.ts`, etc.).
- **Position & Size:** Position mode (Flow/Static, Relative, Absolute, Fixed), Left, Top, Width, Height, Auto / Fit / 100% presets.
- **Spacing:** Margin (T/R/B/L), Padding (T/R/B/L), Gap.
- **Flex & Layout:** Direction (Row / Column), Justify Content, Align Items.
- **Typography:** Font size, color, custom text content overriding.
- **Appearance:** Opacity, Background color, Border, Radius, Z-Index.
- **Image & Sprites:** Asset preview, Object Fit (`contain`, `cover`, `fill`), Pixel Art mode toggle (`image-rendering: pixelated`).
- **AI Note & Asset Tasks:**
  - Per-element AI instructions.
  - `NEEDS ASSET` checkbox with automatic target dimension calculator (1x CSS slot size $\to$ 2x Retina source dimensions).
- **Actions:** Reset Element, Hide Element.

---

## 4. "EXPORT FOR AI" Package Specification

Clicking **🚀 EXPORT FOR AI** writes the complete specification package to `.editor/exports/<ScreenName>/`:

1. `layout.json`: Clean, minimal JSON diff containing all modified styles and overrides.
2. `elements.json`: Array of affected elements with selectors, tags, source files, and style overrides.
3. `notes.md`: Consolidated screen guidelines and per-element design notes.
4. `assets.json`: Used assets manifest, new user uploads, and missing asset specifications.
5. `changes.md`: Human-readable Markdown changelog.
6. `source-map.json`: UI ID to source file mapping (`src/ui/screens/BattleScreen.ts`, etc.).
7. `AI_TASK.md`: Formatted, ready-to-use prompt for AI coding assistants to apply the changes into production source code without regressions.
8. `.editor/ART_TODO.md`: Centralized checklist of required art assets with recommended dimensions.

---

## 5. Keyboard Shortcuts Reference

| Shortcut | Action |
|---|---|
| `Ctrl + S` / `Cmd + S` | Save current layout draft |
| `Ctrl + Z` / `Cmd + Z` | Undo last action (up to 100 steps) |
| `Ctrl + Shift + Z` / `Ctrl + Y` | Redo action |
| `Arrow Keys` | Nudge selected element by 1px |
| `Shift + Arrow Keys` | Nudge selected element by 10px |
| `Shift + Drag Handle` | Resize preserving aspect ratio |
| `Escape` | Deselect current element |
| `Delete` / `Backspace` | Hide selected element in draft |
