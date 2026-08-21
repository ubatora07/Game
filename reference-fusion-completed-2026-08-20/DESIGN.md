# DESIGN.md — Anime Infinite Ascension
## Global UI / UX / Art Direction Bible

> **Status:** Master design document.
>
> This document defines the visual language, information architecture, responsive behavior, screen composition, interaction hierarchy, pixel-art presentation, UI component rules and implementation principles for the game.
>
> It is intended to be used together with the product/gameplay roadmap.
>
> **This file is the source of truth for how the game should LOOK and FEEL.**
>
> Gameplay systems may evolve, but UI work should not drift back into a generic SaaS/dashboard aesthetic.

---

# 1. DESIGN NORTH STAR

The game should visually communicate:

```text
Pixel Fantasy RPG
+
Incremental Autobattler
+
Buildcraft
+
Living Adventure
+
Long-Term World Progression
```

The player should never feel like they are using a spreadsheet or admin panel.

Even when viewing numbers, upgrades, classes or production, the interface should feel like part of a fantasy game world.

The target emotional impression:

> “This looks like a real pixel RPG with depth, not a web prototype with numbers.”

---

# 2. CORE VISUAL DIRECTION

## 2.1 Overall style

Locked direction:

```text
Dark Pixel Fantasy UI
+
Warm Bronze / Gold Frames
+
Colorful Pixel-Art Worlds
+
Readable RPG Panels
+
Anime-inspired character identity
```

The interface should combine:

- dark charcoal / brown-black panel backgrounds;
- bronze and warm-gold borders;
- parchment / leather / forged-metal hints;
- pixel-art landscapes;
- compact but readable RPG typography;
- colored accents for different systems;
- strong hover/pressed/selected states;
- small detailed icons;
- minimal modern SaaS visual language.

Do NOT use:

- generic glassmorphism;
- huge rounded SaaS cards;
- flat gray admin dashboard layouts;
- sterile blue-only panels;
- excessive neon;
- generic Material Design components;
- generic mobile app navigation without game personality.

---

# 3. PRODUCT UI PRINCIPLES

## 3.1 Battle remains the heart

The main visual center of the game is the battlefield.

At almost any moment, the player should be able to see:

- character;
- enemy;
- HP;
- damage;
- stage;
- world;
- progress;
- rewards;
- rhythm/auto state.

Even when other systems are opened, the player should still feel connected to the adventure.

---

## 3.2 Systems should feel connected

The UI must visually reinforce gameplay relationships.

Examples:

```text
Class choice
→ affects tree
→ affects combat
→ affects event opportunities
→ affects Pet synergies
```

```text
Karma
→ affects Event choices
→ affects Market access
→ affects Black Market
→ affects Titles
```

```text
Settlement
→ gives Forge
→ Blacksmith
→ Crafting
→ Equipment
→ stronger build
```

Do not design each system as a completely unrelated app.

---

## 3.3 Dense on PC, focused on mobile

Desktop can show several systems at once.

Mobile should never try to replicate the entire desktop composition in one viewport.

Desktop philosophy:

```text
information-rich
multi-panel
fast switching
hover support
contextual detail
```

Mobile philosophy:

```text
battle-first
vertical hierarchy
large touch controls
one primary focus at a time
stacked contextual systems
```

---

# 4. DESKTOP MASTER LAYOUT

## 4.1 Primary 16:9 composition

Target desktop viewport:

```text
1280×720 minimum supported
1366×768 common
1920×1080 preferred
2560×1440 high resolution
```

Recommended master structure:

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ PLAYER / LEVEL        GOLD     GEMS     POWER          MAIL TROPHY MENU   │
├───────────────────────────────┬────────────────────────────────────────────┤
│                               │                                            │
│                               │                                            │
│          PRIMARY GAME         │           CONTEXT / SYSTEM PANEL           │
│          BATTLE AREA          │                                            │
│                               │                                            │
│                               │                                            │
├───────────────────────────────┴────────────────────────────────────────────┤
│         SECONDARY / QUICK SYSTEM / CONTEXTUAL PROGRESSION                 │
├────────────────────────────────────────────────────────────────────────────┤
│ HERO | TEAM | BATTLE | SETTLEMENT | WORLD | MORE                         │
└────────────────────────────────────────────────────────────────────────────┘
```

Battle should usually occupy:

```text
~55–70% of primary content width
```

Contextual UI:

```text
~30–45%
```

depending on viewport and active system.

---

# 5. DESKTOP MODULARITY RULE

The desktop must NOT permanently display every system at once.

The concept mockup may show:

- Battle;
- Class Tree;
- Event;
- Settlement;
- Pet;
- Forge;
- Market;
- Team;
- World Map;

but production UI should dynamically choose which panels deserve screen space.

Default behavior:

```text
Battle
+
one major Context Panel
+
one lightweight Quick Panel
```

rather than:

```text
9 equally important panels visible simultaneously
```

This keeps the interface readable on 1366×768.

---

# 6. GLOBAL TOP HUD

## 6.1 Left block — player identity

Show:

- pixel portrait;
- player/main-character name;
- title;
- level;
- XP;
- current class icon when available;
- rank/status where appropriate.

Example:

```text
[portrait]
МАКВИН
Убийца гоблинов ☠
Lv. 23  ███████░░  4.85K / 8.20K
```

## 6.2 Center/right resources

Show only important always-visible resources.

Baseline:

- Gold;
- Gems / Crystals;
- Combat Power or Power/sec;
- optional current-life resource if essential.

Do NOT display every currency in the HUD.

Less common currencies belong in their relevant screens.

## 6.3 Utility icons

Possible:

- Achievements;
- Inbox;
- Settings;
- Menu;
- event notification.

On narrow desktop, collapse secondary icons.

---

# 7. GLOBAL BOTTOM NAVIGATION — DESKTOP

Recommended:

```text
Герой
Команда
Битва
Поселение
Мир
Ещё
```

## 7.1 Battle

- central;
- visually emphasized;
- larger active plate;
- sword icon;
- warm gold selection.

## 7.2 Hero

Contains:

- class;
- development tree;
- equipment;
- titles;
- character stats;
- build breakdown.

## 7.3 Team

Contains:

- second Main Character;
- collectible Heroes;
- active formation;
- Pet;
- Mercenaries.

## 7.4 Settlement

Contains:

- settlement overview;
- buildings;
- Forge;
- Tavern;
- Market;
- Pet House;
- residents;
- defense.

## 7.5 World

Contains:

- Campaign map;
- adventure history;
- Events;
- Karma;
- Infinite Tower;
- world unlocks.

## 7.6 More

Contains:

- Quests;
- Achievements;
- Relics;
- Expeditions;
- Samsara;
- Statistics;
- Settings;
- Help.

---

# 8. MOBILE MASTER LAYOUT

Mobile is NOT a compressed desktop.

Target widths:

```text
360
375
390
412
430
```

Master structure:

```text
┌──────────────────────────┐
│ PLAYER / GOLD / GEMS ⚙   │
├──────────────────────────┤
│ POWER / XP / RANK        │
├──────────────────────────┤
│ WORLD / STAGE / PROGRESS │
├──────────────────────────┤
│                          │
│       BATTLEFIELD        │
│                          │
│ HERO       ENEMIES       │
│                          │
├──────────────────────────┤
│ RHYTHM / AUTO            │
├──────────────────────────┤
│ +GOLD  [ ATTACK ]  +LOOT │
├──────────────────────────┤
│ contextual mini-panel    │
├──────────────────────────┤
│ Hero Sect Battle Team More│
└──────────────────────────┘
```

Primary button must remain thumb-friendly.

Do not allow:

- tiny 24px buttons;
- dense desktop grids;
- horizontal overflow;
- essential hover-only information.

---

# 9. MOBILE BOTTOM NAV

Recommended:

```text
Герой
Секта / Мир
Битва
Команда
Ещё
```

If Settlement is unlocked and becomes important, navigation can evolve to:

```text
Герой
Команда
Битва
Поселение
Ещё
```

World / Map then moves into More or contextual top navigation.

Battle remains center item.

---

# 10. BATTLE SCREEN — GLOBAL SPEC

Battle is the most important screen in the product.

## 10.1 Battlefield contents

Always support:

- player character;
- optional second Main Character;
- optional visible Heroes;
- active Pet;
- 1–3 normal enemies;
- elite;
- boss;
- HP bars;
- hit feedback;
- status/skill effects;
- floating numbers;
- stage/World.

## 10.2 Battlefield hierarchy

Visual importance:

```text
1. Player / enemy silhouettes
2. Enemy HP
3. damage
4. stage progress
5. rhythm
6. rewards
7. secondary stats
```

Do not put giant resource cards above the battlefield.

---

# 11. BATTLE HEADER

Show:

```text
Лес гоблинов
Этап 5-12

●━━●━━◆━━○━━○━━☠
```

Optional:

- Progress button;
- Auto toggle;
- boss marker;
- World modifier;
- current mode: Progress / Farm.

Desktop may place controls right-aligned.

Mobile places them in compact row.

---

# 12. BATTLE CHARACTER PRESENTATION

Character sprite must feel alive.

Required animation hooks:

- idle;
- auto attack;
- manual attack;
- crit;
- hurt;
- victory;
- special skill;
- Rank transformation.

When a second Main Character is unlocked:

- both may appear;
- visual positions remain readable;
- avoid covering each other;
- limit effects.

---

# 13. ENEMY PRESENTATION

Normal:

- readable silhouette;
- HP bar;
- name optional;
- small archetype icon optional.

Elite:

- enhanced frame;
- aura;
- stronger HP bar.

Boss:

- distinct entrance;
- larger sprite;
- nameplate;
- boss HP;
- optional timer;
- special visual effects.

---

# 14. ATTACK BUTTON

The Attack button is a core tactile element.

Visual:

- large golden/orange forged-metal button;
- sword icon;
- strong pressed state;
- subtle glow when rhythm window is ideal.

Desktop:

```text
large center-bottom battlefield button
```

Mobile:

```text
full-width or ~45–55% width
thumb-accessible
```

Never make Attack feel like a standard web form button.

---

# 15. AUTO-BATTLE CONTROL

States:

```text
AUTO OFF
AUTO ON
AUTO FARM
AUTO PROGRESS
```

Visual behavior:

- green active;
- muted inactive;
- small status dot;
- tooltip explaining current mode.

Avoid large toggle if space constrained.

---

# 16. RHYTHM SYSTEM UI

Rhythm must be readable visually.

Recommended:

```text
◇ — ◇ — ◆ — ◇ — ◆ — ◇
             ↑
          HIT WINDOW
```

or:

```text
─────────●─────────●─────────●────
              ◇
```

Show:

- current timing marker;
- ideal windows;
- streak;
- combo;
- rhythm duration;
- current bonus.

Feedback words:

```text
ХОРОШО
ОТЛИЧНО
ИДЕАЛЬНО
```

Do not show giant rhythm UI when player ignores rhythm.

Collapse after inactivity.

---

# 17. COMBO

Combo should feel exciting but not dominate the screen.

Examples:

```text
КОМБО
×18
```

Use left-side badge or floating meter.

At high combo:

- slight glow;
- extra VFX;
- no screen-wide flashing.

---

# 18. FLOATING DAMAGE

Use visual hierarchy.

Normal:

```text
-124
```

Crit:

```text
КРИТ!
-3.46K
```

Heal:

```text
+120
```

Special:

```text
EXECUTE
-18.2K
```

Rules:

- pooled elements;
- readable contrast;
- motion upward;
- fade quickly;
- avoid hundreds of overlapping numbers.

---

# 19. BATTLE QUICK STATS — DESKTOP

Optional narrow panel inside battlefield:

```text
DPS           8.72K
Total Damage  1.36M
Clicks        2,453
Crit Chance   24%
Crit Damage   150%
```

This panel may collapse.

Mobile should NOT permanently show this.

Use a stats popover.

---

# 20. BATTLE REWARD STRIP

Possible structure:

```text
[ +24 Gold ]     [ ⚔ ATTACK ]     [ +3 Crystal ]
```

But only show currencies that actually make sense.

Reward values should animate toward HUD after kill.

---

# 21. CHARACTER / HERO SCREEN

Main sections:

```text
Overview
Class
Tree
Equipment
Titles
Stats
```

Desktop may combine Overview + Tree.

Mobile uses tabs.

---

# 22. CLASS SELECTOR

Four base classes:

- Mage;
- Swordsman;
- Archer;
- Assassin.

Style:

- icon tile;
- strong selected state;
- class-specific accent.

Suggested accents:

```text
Mage       violet / indigo
Swordsman  gold / steel
Archer     green / emerald
Assassin   crimson / dark purple
```

Accent color should not override global bronze UI.

---

# 23. CLASS DEVELOPMENT TREE

The class tree should be one of the most visually attractive system screens.

Structure:

```text
          ◆
        /   \
       ◆     ◆
      / \   / \
     ◆  ◆  ◆  ◆
    ...
```

Support:

- locked;
- available;
- selected;
- owned;
- mutually exclusive;
- future branch preview.

Node states:

### Locked

- dark;
- reduced saturation;
- lock or requirement.

### Available

- glowing edge;
- pulsing subtle marker.

### Selected

- class-accent border;
- bright icon.

### Permanently excluded

- desaturated;
- crossed branch connector;
- explanatory tooltip.

---

# 24. CLASS NODE DETAIL PANEL

Desktop right-side detail panel:

```text
ТЁМНАЯ БРОНЯ

Passive Skill

+15% Defense
+5% Vampirism

Requires:
Dark Guard path

[ SELECT ]
```

Mobile:

- bottom sheet;
- large confirmation button.

---

# 25. RESPEC UI

Never hide consequences.

Show:

```text
Current path
New path
Cost
What will be refunded
What will be lost
```

Use confirmation modal.

---

# 26. TEAM SCREEN

Separate:

- Main Characters;
- collectible Heroes;
- Pet;
- Mercenaries.

Desktop card example:

```text
[portrait]
Маквин
Lv.23
Swordsman
Power 4.85K

[weapon] [armor] [accessory]
```

Formation area:

```text
[MAIN 1] [MAIN 2]
[HERO]   [HERO]
[PET]
```

Keep formation simple.

---

# 27. SECOND MAIN CHARACTER

Must look equally important, not like a small companion.

Support:

- separate class;
- separate tree;
- separate equipment;
- individual portrait;
- individual level/progression.

Team screen should make comparison easy.

---

# 28. HERO COLLECTION

Use higher-detail portraits where available.

Battlefield can use simplified pixel sprites.

Hero card:

- portrait;
- rarity;
- level/star;
- role;
- faction;
- aura;
- skill.

Avoid excessive gacha rainbow effects outside Summon.

---

# 29. PET SYSTEM UI

Pet identity should emphasize growth and attachment.

Example:

```text
ОГНЕННЫЙ ВОЛЧОНОК
Lv.12

♥ ♥ ♥ ♥ ♡
XP 320/500

+24% Crit Damage
Enemy Defense -10%

Baby → Young → Adult

[ FEED ]
```

## 29.1 Pet visual priorities

- large sprite;
- clear current stage;
- next evolution preview;
- emotional feedback;
- feeding animation;
- affection response.

Do not reduce Pet to a +% card.

---

# 30. PET IN BATTLE

Pet should appear beside or behind character.

It may:

- idle;
- assist attack;
- cast debuff;
- react on victory.

Do not overcrowd battlefield.

---

# 31. RANDOM EVENT PRESENTATION

Random Events should feel like adventure interruptions.

Desktop behavior:

Battle may shrink slightly while Event panel expands.

Example:

```text
┌──────────────┬────────────────────────────┐
│ BATTLE       │ RANDOM EVENT               │
│              │ Village illustration       │
│ continues    │ text                       │
│              │                            │
│              │ [HELP]   [RAID]            │
└──────────────┴────────────────────────────┘
```

Mobile:

- slide-up event card;
- pause optional;
- full-screen event only for major story event.

---

# 32. EVENT CARD ANATOMY

Show:

- illustration;
- event title;
- short text;
- 2–3 choices;
- known immediate consequence;
- unknown future consequence when intended.

Example:

```text
ДЕРЕВНЯ

Мирная деревня на вашем пути.

[ ПОМОЧЬ ЖИТЕЛЯМ ]
Karma +10

[ РАЗГРАБИТЬ ]
Gold +500
Karma -15
```

Do not reveal every hidden follow-up.

---

# 33. KARMA UI

Karma should be visible but not always giant.

Compact display:

```text
☀ +15 ━━━━━━━━╋━━━━━━━ ☠ -20
```

or:

```text
Karma: Respected
```

Full Karma screen/history can show:

- alignment;
- notable choices;
- faction consequences;
- unlocked paths;
- legacy across Samsara.

---

# 34. KARMA COLOR LANGUAGE

Positive:

- warm gold;
- ivory;
- sun icon.

Neutral:

- steel;
- gray;
- balanced scales.

Negative:

- purple;
- crimson;
- skull/moon icon.

Avoid simplistic green = good, red = evil everywhere.

---

# 35. SETTLEMENT SCREEN

Settlement should be visual, not only tabular.

Desktop:

```text
large pixel-art settlement scene
+
building labels
+
resource strip
+
quick build controls
```

Building examples:

- Throne Hall;
- Forge;
- Tavern;
- Barracks;
- Farm;
- Alchemy;
- Pet House;
- Market;
- Walls.

Buildings should exist physically in the scene.

---

# 36. SETTLEMENT INTERACTION

Click/tap building:

- highlight;
- tooltip;
- details panel;
- upgrade button;
- current level;
- current function;
- next unlock.

Example:

```text
КУЗНИЦА
Lv.7

Current:
Rare Equipment

Next:
Master Blacksmith slot

[ UPGRADE ]
```

---

# 37. SETTLEMENT GROWTH

Visual progression matters.

Level changes may:

- upgrade building sprite;
- add banners;
- add NPCs;
- expand walls;
- improve roads;
- add decoration;
- improve lighting.

Player must be able to SEE that their settlement grew.

---

# 38. SETTLEMENT NPCs

NPCs can be clickable.

Use:

- speech bubble;
- small portrait;
- service icon.

Example lines:

```text
Кузнец:
«Опять сломал меч?»
```

```text
Трактирщик:
«Сегодня скидка. Ну... почти скидка.»
```

Dialogue should be short in normal play.

---

# 39. SETTLEMENT NAVIGATION

Inside Settlement:

```text
Overview
Buildings
Residents
Defense
Pets
Decor
```

Forge/Market/Tavern may open dedicated screens.

---

# 40. FORGE / BLACKSMITH SCREEN

Forge should feel tactile.

Desktop structure:

```text
┌──────────────┬────────────────────┬──────────────┐
│ RECIPES      │ ITEM / FORGING     │ BLACKSMITH   │
│              │                    │              │
│ sword        │ metal slider       │ portrait     │
│ armor        │ impurities         │ mastery      │
│ accessory    │ temperature        │ bonuses      │
│              │ tempering          │              │
└──────────────┴────────────────────┴──────────────┘
```

---

# 41. FORGING INPUTS

Potential controls:

```text
Metal       ━━━━━●━━
Impurities  ━━━●━━━━
Temperature ━━━━━━●━
Tempering   ━●━━━━━━
```

But do not make manual forging mandatory.

Modes:

```text
Quick Forge
Manual Forge
```

Quick Forge:

- safe;
- automatic;
- average outcome.

Manual Forge:

- active;
- better optimization potential;
- slightly higher ceiling.

---

# 42. BLACKSMITH PRESENTATION

Blacksmith types should have strong personality.

Card:

```text
GRIMM
Master Blacksmith

Mastery 62
Success +18%
Risk -12%

Specialization:
Heavy Weapons
```

NPC portrait should be prominent.

---

# 43. EQUIPMENT UI

Launch slots:

- Weapon;
- Armor;
- Accessory.

Item card must show:

- name;
- rarity;
- level;
- attack/defense;
- affixes;
- class synergy;
- Karma tags where relevant.

Comparison:

```text
CURRENT      NEW
320 ATK  →   355 ATK
12% Crit →   8% Crit
```

Use green/red only for direct improvement/loss, not whole item identity.

---

# 44. ITEM RARITIES

Possible:

```text
Common
Rare
Epic
Legendary
Mythic
Forbidden
```

Forbidden is not necessarily stronger than Mythic.

Forbidden may have trade-offs.

Visual distinction:

- border;
- title text;
- subtle particles for top rarity;
- icon background.

Avoid excessive glow on everything.

---

# 45. MARKET SCREEN

Market should feel like a service hub.

Desktop:

```text
Categories left
Item list center
Special/Black Market panel right
```

Categories:

- All;
- Equipment;
- Consumables;
- Materials;
- Mercenaries;
- Titles;
- Settlement.

Each item row:

- icon;
- name;
- short function;
- price;
- purchase button.

---

# 46. BLACK MARKET UI

Black Market should have distinct atmosphere.

Visual:

- darker purple/black;
- subtle skull/moon icon;
- smoky panel texture;
- slightly different border;
- mysterious NPC portrait.

Do NOT redesign whole application.

It should still belong to same game.

---

# 47. BLACK MARKET TRADE-OFF DISPLAY

Example:

```text
FORBIDDEN BLADE

+40% Crit Damage
+20% Loot

Cost:
15K Gems

Consequence:
Karma -50
```

If consequence is hidden by design, use:

```text
Unknown consequence
```

not fake certainty.

---

# 48. MERCENARY UI

Mercenary listing:

```text
[portrait]
Ranger
Contract: 2h

+12% Party DPS
Special: Boss Weakness

Price: 5K Gold
```

Show expiration clearly.

---

# 49. TITLES UI

Titles belong in Hero/Profile.

Example:

```text
Knight
+5% Defense

Lord
Settlement unlock

Hero of the Kingdom
Story Title
```

Display currently equipped title under player name.

Cosmetic/roleplay identity is important.

---

# 50. WORLD MAP

World Map should be visually rich.

Use pixel-art regions/islands.

Example regions:

- Goblin Forest;
- Northern Mountains;
- Forgotten Desert;
- Kingdom Capital;
- Ancient Ruins;
- Dark Lands.

Map shows:

- current location;
- completed stars;
- locked region;
- event markers;
- settlement;
- Tower;
- special merchant.

---

# 51. WORLD MAP INTERACTION

Desktop:

- click region;
- region detail panel;
- travel button;
- stage summary.

Mobile:

- pan/zoom;
- tap region;
- bottom sheet.

Avoid tiny text baked into map art.

Use overlay labels.

---

# 52. WORLD PROGRESSION VISUALS

Region card:

```text
GOBLIN FOREST

★★★
Stage 5-12
Boss Defeated

Events Found: 7/12
```

Encourage completion without requiring 100%.

---

# 53. QUESTS

Quest UI should remain lightweight.

Types:

- main path;
- side;
- daily;
- event.

Compact right-panel widget:

```text
NEXT GOAL

Reach Stage 5-15
Reward: 100 Gems
```

Claimable quest should visually pulse but not flash.

---

# 54. ACHIEVEMENTS

Use:

- trophy icon;
- progress;
- compact claim reward.

Do not give permanent huge panel space.

Show in context panel only when relevant.

---

# 55. SAMSARA / REINCARNATION

Samsara deserves a unique visual moment.

Screen:

- dark cosmic background;
- yin/yang or soul motif;
- current run summary;
- Souls gained;
- what resets;
- what remains;
- next-run estimated bonus.

CTA:

```text
[ REINCARNATE ]
```

After confirm:

- transition;
- reset;
- show early one-shot power fantasy.

---

# 56. INFINITE TOWER

Tower should feel like challenge mode.

Visual:

- tall vertical tower silhouette;
- floor;
- best record;
- modifiers;
- milestone rewards.

Do not duplicate Campaign UI exactly.

---

# 57. RELICS

Relic UI can use a cabinet/grid.

Relics should look like:

- artifacts;
- not generic stat cards.

Each relic:

- icon;
- name;
- mechanic;
- active slot if applicable.

---

# 58. EXPEDITIONS

Use map / parchment board.

Cards:

```text
2h
4h
8h
```

Show:

- selected Heroes;
- reward type;
- expected return;
- completion time.

---

# 59. CONTEXT PANEL — DESKTOP

The right-side Context Panel is dynamic.

Possible states:

### Normal

- Next Goal;
- Quest;
- Event preview;
- recommended action.

### Event

- event illustration;
- choices.

### Class

- selected node detail.

### Settlement

- building detail.

### Forge

- blacksmith/detail.

### Market

- selected product.

### World

- region detail.

This is critical to avoid permanent panel overload.

---

# 60. QUICK PANEL — DESKTOP

Optional lower/left secondary panel can show:

- Sect quick purchases;
- production;
- class summary;
- Party summary;
- settlement alert.

Never show more than one dense quick panel unless viewport is large.

---

# 61. PANEL STYLE

Panel anatomy:

```text
bronze border
dark warm background
subtle texture
section title
thin divider
content
```

Corner radius:

- small;
- mostly squared/forged;
- not pill-heavy.

Depth:

- subtle inner shadow;
- thin highlights;
- avoid giant drop shadows.

---

# 62. BUTTON SYSTEM

## Primary

Gold/orange.

Use for:

- Attack;
- Claim;
- Confirm;
- Build;
- Craft.

## Positive/Accept

Muted green.

Use for:

- Help;
- Auto On;
- Upgrade when contextual.

## Destructive/Dark

Muted red/purple.

Use for:

- Raid;
- dangerous action;
- Black Market consequences.

## Secondary

Dark bronze.

## Disabled

Low contrast, no glow.

---

# 63. BUTTON STATES

Every button must have:

- idle;
- hover;
- pressed;
- focus;
- disabled;
- loading;
- success if relevant.

Pixel UI should still feel responsive.

Pressed state:

- move content 1–2px downward;
- darken interior;
- reduce glow.

---

# 64. ICONOGRAPHY

Use pixel-style icons consistently.

Required visual families:

- sword;
- shield;
- bow;
- staff;
- skull;
- pet;
- tree;
- village;
- forge;
- bag;
- crown;
- market;
- map;
- Karma;
- Souls;
- gems;
- gold.

Do not mix:

- crisp vector icons;
- emoji;
- detailed 3D icons;
- pixel icons;

within the same primary UI.

Temporary dev placeholders are allowed only before production pass.

---

# 65. TYPOGRAPHY

UI type should feel game-like but remain highly readable.

Rules:

- headings may use stylized condensed pixel/RPG font;
- body text should use readable pixel-friendly sans or serif;
- numbers must be extremely legible;
- avoid overly decorative text for long descriptions.

Hierarchy:

```text
H1  Screen/System
H2  Panel title
H3  Item/Node title
Body
Meta
Micro
```

Numbers should often use tabular alignment.

---

# 66. TEXT SCALE

Desktop approximate hierarchy:

```text
Top player name:        20–26
Screen title:           18–24
Panel title:            14–18
Body:                   13–16
Meta:                   11–13
```

Mobile:

```text
Player name:            16–20
Screen title:           18–22
Panel title:            14–17
Body:                   13–16
Meta:                   11–13
```

Never go below ~11px for essential information.

---

# 67. COLOR SYSTEM

Base tokens:

```text
BG-0        near-black warm
BG-1        dark brown-charcoal
BG-2        panel dark
Border      bronze
BorderHi    warm gold
TextMain    warm ivory
TextMuted   desaturated beige/gray
Gold        amber
Gem         cyan-blue
Success     emerald
Danger      muted crimson
Magic       violet
KarmaDark   purple
```

Exact values must be established in implementation design tokens.

Avoid pure white on pure black.

---

# 68. SYSTEM ACCENTS

Recommended subtle accents:

```text
Battle      gold / orange / crimson
Mage        violet
Swordsman   steel / gold
Archer      green
Assassin    crimson / purple
Karma+      warm ivory / gold
Karma-      dark violet
Pets        green / warm orange
Settlement  earthy brown / gold
Forge       orange / steel
Market      gold
Black Market purple
Samsara     violet / cyan / cosmic
```

These accents should never replace global frame language.

---

# 69. PIXEL ART DIRECTION

## Battlefield

Pixel art should prioritize:

- clean silhouettes;
- readable proportions;
- strong value separation;
- simple backgrounds;
- low-noise ground area around characters.

## UI

Frames can be pixel-art inspired but should scale carefully.

Avoid blurry stretched bitmap borders.

Use:

- 9-slice assets;
- pixel-perfect scaling;
- vector/CSS where appropriate but styled consistently.

---

# 70. SPRITE SCALE SYSTEM

Establish one canonical pixel density.

Suggested workflow:

```text
logical sprite scale
→ nearest-neighbor rendering
→ integer scale whenever possible
```

Player character should appear visually larger than minor NPCs.

Boss can be 1.5–2.5× player height depending design.

---

# 71. PLAYER SPRITE REQUIRED SET

Minimum:

```text
idle
attack
crit/heavy attack
hurt
victory
skill
death/defeat if needed
```

Optional later:

- run;
- cast;
- block;
- special class animation.

---

# 72. CLASS VISUAL DIFFERENTIATION

Do not create 60 completely different sprites immediately.

Use layered differentiation:

```text
base silhouette
+
weapon
+
accent color
+
aura
+
small armor changes
+
high-tier form
```

This scales better.

---

# 73. PET SPRITES

Each Pet evolution should visibly change.

Minimum:

```text
Baby
Young
Adult
```

Animations:

- idle;
- attack;
- happy/feed;
- evolve.

---

# 74. ENEMY SPRITES

Minimum per enemy:

```text
idle
attack
hurt
death
```

Use reusable archetype timing.

Different enemies can share animation structure but not identical silhouettes.

---

# 75. BOSS ART

Boss must be memorable.

Use:

- larger sprite;
- unique color;
- entrance;
- unique death;
- VFX;
- special HP frame.

Each World should have at least one visually distinct major boss.

---

# 76. BACKGROUNDS

Background layers:

```text
sky
distant terrain
midground
trees/buildings
battle ground
foreground decoration
```

Parallax is optional but valuable on desktop.

Keep mobile performance in mind.

---

# 77. WORLD THEMES

Examples:

### Goblin Forest

- blue sky;
- pine forest;
- green field;
- warm dirt road.

### Sakura Empire

- pink-white flowers;
- shrines;
- bamboo;
- red accents.

### Crimson Abyss

- lava;
- dark rock;
- orange glow.

### Frozen Peak

- snow;
- blue ice;
- mist.

### Void Sanctuary

- dark purple;
- cosmic particles;
- floating ruins.

---

# 78. ANIMATION PRINCIPLES

Animation must reinforce gameplay.

Use:

- squash/anticipation;
- small hit-stop;
- screen shake only on heavy hit;
- flash on crit;
- enemy knockback only if readable.

Avoid:

- long unskippable animations;
- excessive particles;
- constant camera shaking.

---

# 79. MICROINTERACTIONS

Examples:

### Buy

- coin leaves HUD;
- purchase button depresses;
- building row pulses;
- new production number ticks.

### Level Up

- XP fills;
- badge flashes;
- small burst;
- short sound.

### Class Node Unlock

- connector lights;
- node glows;
- class emblem pulse.

### Pet Feed

- Pet reacts;
- affection heart;
- XP increment.

### Forge Complete

- metal spark;
- item reveal;
- rarity effect.

---

# 80. RESPONSIVE BREAKPOINT PHILOSOPHY

Suggested:

```text
<= 480      mobile
481–767     large mobile / small tablet
768–1023    tablet
1024–1279   compact desktop
1280–1599   standard desktop
1600+       wide desktop
```

Breakpoints are behavior targets, not arbitrary CSS-only values.

---

# 81. COMPACT DESKTOP

At 1024–1279:

- reduce side panel width;
- collapse quick stats;
- hide nonessential HUD labels;
- preserve battle width;
- allow system panel to become tabbed.

Do NOT shrink all text.

---

# 82. WIDE DESKTOP

At 1600+:

May show:

```text
left quick panel
+
large battle
+
right context panel
```

Potential:

- Party summary;
- Sect quick-buy;
- Quest panel.

Do not stretch battle background infinitely.

Use max content width.

---

# 83. MOBILE SCROLL RULE

Battle top should remain accessible.

Recommended:

- sticky top compact HUD;
- sticky bottom nav;
- battle occupies first viewport;
- secondary systems appear below or in dedicated tabs.

Avoid making user scroll through 20 building cards before reaching navigation.

---

# 84. MOBILE MODALS

Use:

- bottom sheets;
- slide-up panels;
- full-screen only for major systems.

Examples:

- Class node → bottom sheet;
- Item detail → bottom sheet;
- Event → large sheet;
- Samsara → full screen.

---

# 85. TOUCH TARGETS

Minimum practical:

```text
44×44 CSS px
```

Primary buttons larger.

Avoid tiny lock icons as only tap target.

---

# 86. HOVER / TOOLTIP — DESKTOP

Hover can enrich but not gate information.

Tooltips useful for:

- stats;
- buffs;
- class nodes;
- currency;
- equipment affixes.

Essential action must still work via click/tap.

---

# 87. LOCKED CONTENT STATE

Locked content must show WHY.

Bad:

```text
🔒
```

Good:

```text
ACADEMY
Locked

Unlock:
Reach Rank 2
```

For future feature:

```text
Coming Soon
```

Only if actually unavailable.

---

# 88. EMPTY STATES

Examples:

No Pet:

```text
You have not found a Pet yet.

Rare adventure events may lead to one.
```

No Settlement:

```text
You do not own a Settlement.

Explore further to unlock this path.
```

No Mercenary:

```text
No active contract.
```

Empty states should teach next action.

---

# 89. NOTIFICATION BADGES

Use sparingly.

Red dot for:

- claimable;
- new unlock;
- completed construction;
- important event.

Do not place 9 red dots permanently.

Badges clear after relevant interaction.

---

# 90. SOUND UI PRINCIPLES

UI feedback:

- click;
- confirm;
- buy;
- error;
- claim;
- node unlock;
- tab change.

Different systems can have subtle variations.

No harsh repeated sound for rapid Attack.

---

# 91. ACCESSIBILITY

Provide:

- reduced motion;
- low effects;
- master volume;
- music volume;
- SFX volume;
- color-independent rarity;
- readable contrast;
- rhythm visual cue;
- no audio-only rhythm requirement;
- no mandatory high CPS.

---

# 92. PERFORMANCE RULES

Battle UI must remain performant.

Use:

- object pooling;
- sprite atlases;
- lazy loading;
- 9-slice UI;
- limited particle count;
- capped floating numbers;
- hidden-tab pause;
- low-effects mode.

Do not render 50 invisible panels behind active screen.

---

# 93. ASSET LOADING

Prioritize initial load:

1. player;
2. current World background;
3. current enemy pool;
4. essential UI;
5. top HUD;
6. current Pet/Hero.

Lazy load:

- future Worlds;
- future class art;
- locked settlement;
- Black Market;
- late bosses.

---

# 94. LOCALIZATION

Primary supported languages:

- Russian;
- English.

UI must tolerate longer translations.

Avoid fixed-width labels where text may overflow.

Use icon + short label when possible.

Never bake translatable text into image assets.

---

# 95. NUMBER FORMATTING

Use readable abbreviation:

```text
999
1.2K
15.4K
1.36M
8.2B
```

Exact values on hover/detail when useful.

Do not show:

```text
1364287.236482
```

in normal UI.

---

# 96. ECONOMY BREAKDOWN UI

Advanced players may inspect:

```text
Base
Class
Hero
Pet
Equipment
Rank
Soul
Relic
Temporary
Total
```

But this belongs in detail panel, not main battle HUD.

---

# 97. DEV UI SEPARATION

Development-only tools:

- FPS;
- BALANCE DEV;
- stat inspector;
- god mode;
- debug stage selector.

Must be removable from production.

Production must never display:

```text
BALANCE DEV (180 FPS)
```

unless debug flag enabled.

---

# 98. ART PRODUCTION PRIORITY

Order:

```text
1. Main Hero
2. 4 class variants
3. core battle UI
4. 3–5 common enemies
5. first boss
6. first Pet evolution line
7. World 1 background
8. top HUD
9. class tree icons
10. event illustration style
11. settlement base scene
12. forge/blacksmith
13. market
14. World map
15. later Heroes/Pets/Worlds
```

Do not create late-game art before core art style is validated.

---

# 99. FIRST VISUAL VERTICAL SLICE

Before mass production, create one polished slice containing:

```text
1 Hero
1 Class
1 Tree branch
1 Pet
3 enemies
1 boss
1 World background
1 Event
1 Market item
1 Settlement preview
1 Forge item
```

Run in actual game.

Validate:

- scale;
- readability;
- animation;
- palette;
- performance;
- desktop/mobile.

Only then expand asset production.

---

# 100. PC PAGE BEHAVIOR BY SYSTEM

## Battle selected

```text
Battle large
Context: Quest/Event/Class detail
```

## Hero selected

```text
Character overview left
Class Tree center
Detail right
```

## Team selected

```text
Formation center
Roster left
Detail right
```

## Settlement selected

```text
Settlement large center
Building/NPC detail right
Resource strip top
```

## World selected

```text
World Map center
Region detail right
Adventure log left/compact
```

## More selected

```text
grid/list of secondary systems
```

---

# 101. HERO SCREEN DESKTOP TEMPLATE

```text
┌─────────────────┬─────────────────────────────┬─────────────────┐
│ PORTRAIT / STAT │       CLASS TREE            │ NODE DETAIL     │
│                 │                             │                 │
│ EQUIPMENT       │                             │ TITLE / RESPEC  │
└─────────────────┴─────────────────────────────┴─────────────────┘
```

---

# 102. TEAM SCREEN DESKTOP TEMPLATE

```text
┌───────────────────┬──────────────────────────────┬────────────────┐
│ ROSTER            │ FORMATION / PREVIEW          │ DETAIL         │
│ Main Characters   │                              │ Hero/Pet       │
│ Heroes            │                              │ stats          │
│ Mercenaries       │                              │                │
└───────────────────┴──────────────────────────────┴────────────────┘
```

---

# 103. SETTLEMENT SCREEN DESKTOP TEMPLATE

```text
┌───────────────────────────────────────────────┬───────────────────┐
│                                               │ BUILDING DETAIL   │
│             PIXEL SETTLEMENT                  │                   │
│                                               │ Upgrade           │
│                                               │ NPCs              │
├───────────────────────────────────────────────┴───────────────────┤
│ Buildings | Residents | Defense | Pets | Decor                   │
└───────────────────────────────────────────────────────────────────┘
```

---

# 104. WORLD SCREEN DESKTOP TEMPLATE

```text
┌──────────────────────────────────────────────┬────────────────────┐
│                                              │ REGION DETAIL      │
│                WORLD MAP                     │                    │
│                                              │ Events             │
│                                              │ Rewards            │
└──────────────────────────────────────────────┴────────────────────┘
```

---

# 105. MARKET DESKTOP TEMPLATE

```text
┌──────────────┬─────────────────────────────┬────────────────────┐
│ CATEGORIES   │ MARKET LIST                 │ SELECTED ITEM      │
│              │                             │ / BLACK MARKET     │
└──────────────┴─────────────────────────────┴────────────────────┘
```

---

# 106. MOBILE HERO FLOW

Mobile:

```text
Hero Overview
↓
tabs:
Class | Tree | Gear | Titles
```

Tree scrolls/pans vertically.

Node detail uses bottom sheet.

---

# 107. MOBILE SETTLEMENT FLOW

Show settlement scene first.

Tap building:

```text
bottom sheet
```

Swipe up for details.

Do not show entire building list permanently.

---

# 108. MOBILE MARKET FLOW

Use category chips or top tabs.

Product card:

- icon;
- title;
- short benefit;
- price;
- Buy.

Black Market becomes special tab when unlocked.

---

# 109. MOBILE EVENT FLOW

Event appears as:

```text
large illustrated card
```

Choices are large full-width buttons.

Karma consequence appears below button.

---

# 110. MOBILE WORLD MAP

Allow pinch/zoom only if technically robust.

Otherwise use:

- drag;
- region cards;
- zoom buttons.

Do not require precision tapping on tiny locations.

---

# 111. CONTEXTUAL UI PRIORITY

When multiple things happen at once:

Priority:

```text
Critical boss/event decision
> Reincarnation/Rank unlock
> claimable major reward
> Quest
> Shop offer
> minor notification
```

Never show 4 competing modal dialogs.

Queue them.

---

# 112. MODAL POLICY

Major modal categories:

### Blocking

- destructive confirmation;
- Samsara;
- respec;
- major irreversible choice.

### Non-blocking

- achievement;
- reward;
- minor unlock.

Non-blocking should use toast/card.

---

# 113. TOASTS

Use for:

- item acquired;
- quest progress;
- new title;
- market refresh;
- building complete.

Keep max visible small.

Avoid covering Attack button.

---

# 114. EVENT TRANSITIONS

When random event triggers:

Desktop:

- Context panel animates;
- battle remains visible.

Mobile:

- event sheet rises;
- battle dimmed if needed.

Major event:

- short transition;
- illustrated full-screen card.

---

# 115. KARMA CONSEQUENCE FEEDBACK

When choice affects Karma:

```text
☀ Karma +10
```

or:

```text
☠ Karma -15
```

Animate near choice result.

If future consequence flag created:

```text
The world will remember this.
```

Use sparingly for important flags.

---

# 116. CLASS CHOICE FEEDBACK

Selecting class:

- emblem;
- short animation;
- starting weapon visual;
- short class fantasy text.

Do not show 12-stat spreadsheet first.

---

# 117. BUILD IDENTITY DISPLAY

Player should be able to see:

```text
Swordsman
→ Dark Guard
→ Blood Bastion
```

as a breadcrumb.

Display near Hero/Class screen.

---

# 118. EQUIPMENT ON CHARACTER

Where feasible, reflect:

- weapon;
- color;
- aura;

on battle sprite.

Full armor replacement is optional.

---

# 119. TITLES IN HUD

Equipped title appears under player name.

Example:

```text
МАКВИН
Убийца гоблинов ☠
```

This provides identity without opening profile.

---

# 120. SETTLEMENT STATUS IN HUD

Do not always show settlement resources globally.

Show notification:

```text
Forge complete
```

or:

```text
Settlement under attack
```

as contextual badge.

---

# 121. MARKET NOTIFICATION

Only notify for:

- rare stock;
- Black Market unlock;
- contract expiring.

Do not spam every refresh.

---

# 122. FORGE COMPLETION

When craft ends:

- anvil/hammer sound;
- small glow;
- item ready notification;
- open reveal.

If player is in battle, do not interrupt.

---

# 123. PET EVOLUTION PRESENTATION

Evolution should be celebratory.

Sequence:

```text
Pet glows
→ silhouette changes
→ new form reveal
→ new trait
```

Short and skippable.

---

# 124. SETTLEMENT UPGRADE PRESENTATION

After building upgrade:

- sprite changes;
- workers/NPC appear;
- new sign;
- short banner.

Make growth visible.

---

# 125. WORLD UNLOCK PRESENTATION

New region:

- map expands/brightens;
- path reveals;
- title;
- one-line fantasy.

Do not use plain toast only.

---

# 126. BOSS ENTRANCE

Sequence:

```text
battle pauses briefly
↓
boss name
↓
boss sprite enters
↓
music shift
↓
HP bar appears
```

Duration short.

---

# 127. BOSS VICTORY

Show:

- boss defeated;
- first-clear chest;
- World progress;
- next unlock.

Do not instantly dump player into next screen.

---

# 128. FIRST SESSION VISUAL FLOW

Target:

```text
Start
↓
Hero visible immediately
↓
Attack
↓
enemy dies
↓
reward
↓
class identity
↓
first upgrade
↓
stage progress
↓
first event
↓
first meaningful choice
```

Do not start with 5 setup menus.

---

# 129. FIRST 30 MINUTES — UI UNLOCK PACING

Avoid showing every locked tab immediately.

Reveal progressively.

Example:

```text
Start:
Hero
Battle
Sect

Later:
Team
Events
Class Tree
Market

Later:
Pet
Settlement
Forge
World systems
```

This reduces intimidation.

---

# 130. LOCKED FEATURE DISCOVERY

When feature unlock approaches:

```text
Settlement
Unlock at World 2
```

or:

```text
Pet
Rumors speak of a strange creature nearby...
```

Use teaser copy.

---

# 131. MENU DENSITY RULE

Maximum primary nav items:

```text
6
```

Everything else nested/contextual.

Avoid 10-icon bottom bars.

---

# 132. PC MOUSE EFFICIENCY

Frequently used actions should require minimal travel.

Examples:

- Attack center-bottom;
- Buy quick actions near Sect;
- Claim quest in context panel;
- class node detail next to tree.

Do not place confirm button far away from selected item.

---

# 133. MOBILE THUMB ZONES

Important actions in lower half:

- Attack;
- Buy;
- Claim;
- Confirm choice;
- bottom nav.

Top only for information.

---

# 134. VISUAL CLUTTER BUDGET

At any time:

- one dominant focal point;
- max two strong accent colors;
- max one glowing CTA;
- limited badges;
- limited animated UI outside battle.

If everything glows, nothing is important.

---

# 135. PANEL PRIORITY ON DESKTOP

Default:

```text
Battle 60%
Context 40%
```

Hero screen:

```text
Tree 50%
Overview 25%
Detail 25%
```

Settlement:

```text
Scene 65%
Detail 35%
```

World:

```text
Map 70%
Detail 30%
```

---

# 136. DESKTOP MAX-WIDTH

Use centered max content width.

Suggested conceptual:

```text
~1600–1800 logical px max
```

Beyond that, add breathing room rather than stretching panels.

---

# 137. ART + UI CONSISTENCY CHECKLIST

Before accepting new asset:

- same pixel density?
- same outline?
- same lighting direction?
- same saturation philosophy?
- same perspective?
- same scale?
- same border language?
- same icon family?
- same text contrast?

Reject mismatched generative art.

---

# 138. AI-GENERATED ASSET RULES

AI can help create:

- concept backgrounds;
- NPC concepts;
- portrait concepts;
- item concepts.

But production assets require:

- consistency pass;
- pixel cleanup;
- palette normalization;
- scale normalization;
- animation preparation;
- legal/source tracking.

Do not ship random generated images with inconsistent styles.

---

# 139. DESIGN TOKENS

Implementation should centralize:

```text
colors
spacing
border thickness
panel background
font sizes
radii
shadows
z-index
animation durations
icon sizes
button heights
```

No per-component random values.

---

# 140. SPACING SYSTEM

Use base spacing scale:

```text
4
8
12
16
24
32
```

Pixel UI may use tighter 2px/6px adjustments, but major layout should remain systematic.

---

# 141. BORDER SYSTEM

Define:

```text
1px inner line
2–3px primary bronze frame
highlight edge
dark outside stroke
```

Use 9-slice asset for ornate panels.

Do not create unique border CSS for every screen.

---

# 142. SCROLLBARS

Custom themed scrollbar on desktop:

- dark track;
- bronze thumb;
- visible but unobtrusive.

Mobile uses native touch scrolling.

---

# 143. FOCUS STATES

Keyboard focus must be visible.

Use:

- thin gold outline;
- no browser-default blue when custom styled.

---

# 144. ERROR STATES

Game-styled error:

```text
Could not purchase.
Not enough Gold.
```

Show:

- reason;
- required amount;
- optional CTA.

Avoid raw exceptions.

---

# 145. LOADING STATES

Do not show generic spinner everywhere.

Possible:

- crossed swords;
- rotating rune;
- small animated crystal.

Long loads:

- fantasy loading card;
- tip.

---

# 146. SAVE STATES

Optional small indicator:

```text
Saving...
Saved
```

Do not distract.

Cloud conflict uses explicit modal with timestamps/progress comparison.

---

# 147. ADS / REWARDED UX

Rewarded offer must look optional.

Example:

```text
Claim 100 Gems

[ CLAIM ]
[ WATCH ×2 ]
```

Never visually disguise rewarded option as mandatory primary path.

---

# 148. YANDEX DESKTOP / MOBILE

UI must tolerate:

- browser chrome;
- embedded frames;
- resize;
- mobile orientation;
- safe areas.

No essential content at extreme edges.

---

# 149. LANDSCAPE MOBILE

If supported:

- battle wide left;
- contextual controls right;
- bottom nav remains reachable.

If not optimized, prevent broken layout.

---

# 150. CONTENT AUTHORING DESIGN

New content should plug into consistent templates.

Examples:

```text
Event template
Class Node template
Pet card template
Market item template
Settlement building template
Equipment card template
Title template
```

Do not custom-design every single content instance.

---

# 151. PRODUCTION ART FILE NAMING

Example:

```text
hero_swordsman_idle_01.png
hero_swordsman_attack_01.png
enemy_goblin_scout_idle.png
pet_firewolf_stage_01.png
world_forest_bg_layer_01.png
ui_icon_market.png
ui_frame_panel_large.png
```

Keep predictable naming.

---

# 152. SPRITE ATLAS GROUPS

Possible atlases:

```text
hero
enemies_world_01
enemies_world_02
pets
ui_icons
battle_vfx
settlement
```

Avoid one giant atlas for all content.

---

# 153. VISUAL QA VIEWPORTS

Mandatory screenshots:

```text
360×640
390×844
412×915
768×1024
1024×768
1280×720
1366×768
1920×1080
2560×1440
```

---

# 154. VISUAL REGRESSION CHECKS

Verify:

- no cropped Hero;
- no enemy under UI;
- Attack always accessible;
- class tree not clipped;
- event choices visible;
- settlement labels readable;
- Market prices aligned;
- Black Market unlock state correct;
- Pet evolution visible;
- map labels not overlapping.

---

# 155. UX SUCCESS CRITERIA

A new player should understand without instructions:

1. where their Hero is;
2. who the enemies are;
3. how to Attack;
4. whether Auto Battle is on;
5. what Stage they are on;
6. where to improve character;
7. where to manage team;
8. what Event is asking;
9. what Karma consequence means;
10. where Settlement systems live.

---

# 156. ART SUCCESS CRITERIA

The final game should be recognizable in a screenshot.

If someone sees one frame, they should identify:

```text
dark bronze pixel RPG UI
+
colorful fantasy battle
+
gold Attack button
+
dense but readable progression systems
```

The product should not resemble a generic web dashboard.

---

# 157. DESKTOP REFERENCE COMPOSITION — FINAL

Preferred normal gameplay:

```text
┌───────────────────────────────────────────────────────────────────────┐
│ [Hero] Name/Title/XP       Gold      Gems      Power      ⚙          │
├───────────────────────────────────────────┬───────────────────────────┤
│ WORLD / STAGE                             │ CONTEXT                   │
│ ●━━●━━◆━━○━━☠                           │ Next Goal / Event / Node  │
│                                           │                           │
│                BATTLEFIELD                │                           │
│                                           │                           │
│ Hero/Pet        Enemy Enemy               │                           │
│                                           │                           │
│ Combo / Rhythm / Auto                     │                           │
│          [ +Gold ] [ ATTACK ] [ +Loot ]   │                           │
├───────────────────────────────────────────┴───────────────────────────┤
│ Hero | Team | Battle | Settlement | World | More                    │
└───────────────────────────────────────────────────────────────────────┘
```

---

# 158. MOBILE REFERENCE COMPOSITION — FINAL

```text
┌──────────────────────────────┐
│ Hero Name   Gold Gems   ⚙    │
│ Lv / XP / Title              │
├──────────────────────────────┤
│ WORLD / STAGE     AUTO       │
│ ●━━●━━◆━━○━━☠              │
├──────────────────────────────┤
│                              │
│         BATTLEFIELD          │
│                              │
│ Hero/Pet        Enemy        │
│                              │
├──────────────────────────────┤
│ Combo   Rhythm    Bonus      │
├──────────────────────────────┤
│ +Gold    [ ATTACK ]    +Loot │
├──────────────────────────────┤
│ contextual content           │
├──────────────────────────────┤
│ Hero | Team | Battle | Settl.| More │
└──────────────────────────────┘
```

---

# 159. IMPLEMENTATION ORDER — VISUAL

Recommended:

```text
1. Design Tokens
2. Global HUD
3. Battle Frame
4. Attack / Auto / Rhythm
5. Bottom Navigation
6. Desktop Context Panel
7. Hero/Class Tree
8. Team
9. Random Events / Karma
10. Pet
11. Settlement
12. Forge
13. Equipment
14. Market / Black Market
15. World Map
16. Secondary systems
17. animation polish
18. responsive polish
19. visual QA
```

---

# 160. AI AGENT DESIGN RULES

Any AI agent implementing UI must:

1. Read this DESIGN.md first.
2. Inspect current components before adding new ones.
3. Reuse shared UI primitives.
4. Never reintroduce generic SaaS cards.
5. Preserve Battle as visual priority.
6. Keep desktop dense but readable.
7. Keep mobile focused and touch-friendly.
8. Use central design tokens.
9. Add all component states.
10. Test 390px and 1366px minimum.
11. Do not hardcode layout to one screenshot.
12. Avoid giant single components.
13. Separate game state from animation state.
14. Keep pixel art scale consistent.
15. Maintain accessibility.
16. Do not ship placeholder emoji.
17. Remove debug UI from production.
18. Use contextual panels instead of showing all systems simultaneously.
19. Treat Settlement, Pet, Forge, Market and Events as parts of one world.
20. Do not claim UI complete until responsive QA passes.

---

# 161. DEFINITION OF DONE — GLOBAL DESIGN

The design transformation is complete when:

- current blue/modern dev dashboard no longer defines the product;
- the game uses dark bronze/gold pixel-fantasy UI consistently;
- Battle feels like a real game scene;
- desktop uses space intelligently;
- mobile is not a shrunken desktop;
- Class Tree is readable and attractive;
- Events feel like adventure moments;
- Karma has visible feedback;
- Pet feels alive;
- Settlement visually grows;
- Forge feels tactile;
- Market feels integrated;
- Black Market feels different without becoming a separate app;
- World Map feels like travel;
- all primary screens share the same design system;
- all key states work on mobile and desktop;
- art assets share one coherent style;
- game remains readable at 1366×768 and 390px width;
- player always understands what to do next.

---

# FINAL DESIGN STATEMENT

The UI should make the player feel that they are **living inside a growing pixel-fantasy world**, not navigating a collection of menus.

The desired perception is:

```text
I am fighting.
I am building a character.
I am making choices.
I am raising a Pet.
I am developing a Settlement.
I am forging equipment.
I am exploring a World.
```

All of that should look like one coherent game.

The interface is successful when the player can move from:

```text
Battle
→ Class
→ Event
→ Karma
→ Settlement
→ Forge
→ Market
→ World
```

without ever feeling that they left the same fantasy universe.

# END OF DESIGN.md
