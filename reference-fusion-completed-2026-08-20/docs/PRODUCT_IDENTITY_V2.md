# PRODUCT IDENTITY V2 — Dark Frontier Pixel Fantasy

**Status:** Implementation direction for player-facing content.  
**Scope:** Product identity, world tone, vocabulary, naming, art direction boundaries.  
**Compatibility rule:** This document does **not** authorize breaking internal IDs, save keys, analytics event names, or migration contracts.

## 1. North Star

The game is a **western/dark heroic pixel-fantasy incremental RPG** built around visible combat, party growth, a living frontier settlement, world progression, buildcraft, and long-term legacy progression.

The player fantasy is not “cultivate cosmic energy until becoming a god.” It is:

> Rise from an unknown frontier fighter into a legendary realm-defender whose victories change settlements, factions, companions, and future generations.

The mechanical foundation stays: manual attacks, autobattle, campaign stages, classes, equipment, companions, recruits, settlement growth, Tower, expeditions, alignment, titles, offline gains, and a prestige/legacy loop.

## 2. Role of Anime Influence

Anime influence is **visual and cinematic**, not the default cultural identity of the world.

Allowed anime influence:
- expressive portraits and readable silhouettes;
- strong attack poses and anticipation frames;
- dramatic boss introductions;
- stylized hair, capes, weapons and VFX;
- readable emotional reactions;
- high-contrast hero composition.

Anime influence must not automatically imply:
- Japanese/Chinese naming concentration;
- cultivation/Qi terminology;
- sect/dojo hierarchy;
- Sakura/ronin/kitsune/shogun worldbuilding;
- gacha-mobile presentation language;
- escalating deity/cosmic vocabulary as the main progression fantasy.

## 3. World Technology Ceiling

Default technology is **late-medieval / early renaissance fantasy** with magical craftsmanship.

Allowed:
- smithies, mills, keeps, caravans, guilds, siege defenses;
- alchemy, runes, enchanted steel, ritual magic;
- ancient portals as rare artifacts or ruins;
- magical constructs when they look forged, runic, alchemical or occult.

Avoid as normal infrastructure:
- mana reactors;
- orbital/star fortresses;
- dimensional generators;
- sci-fi cores;
- technological cosmic machinery.

If a portal or reality-breaking artifact exists, it should feel ancient, dangerous and exceptional rather than like a building upgrade in an industrial tech tree.

## 4. Magic Vocabulary

Preferred vocabulary:
- Arcane
- Rune / Runic
- Ember / Flame
- Frost
- Storm
- Shadow / Umbral
- Blood
- Oath
- Spirit
- Soul
- Relic
- Curse
- Ward
- Sanctum
- Wyrd / Fate (sparingly)
- Void (reserved for a specific late-game force/faction)

Avoid using as generic progression adjectives:
- Celestial
- Cosmic
- Astral
- Infinite
- Divine
- God / Deity
- Sovereign
- Transcendent

`Soul` and `Spirit` remain valid western-fantasy concepts. They should describe ghosts, ancestry, curses, legacy, companions or occult magic—not a cultivation ladder.

## 5. Factions and Social Vocabulary

Preferred structures:
- Kingdom
- Realm
- Crown
- House
- Order
- Guild
- Company
- Fellowship
- Clan (only where culturally appropriate)
- Wardens
- Rangers
- Free Companies
- Merchants / Caravan Houses
- Smugglers / Syndicates

Default replacement for **Sect** is context-dependent:
- Stronghold for the player base;
- Training Grounds for the old passive-progression building cluster;
- Order or Guild for an organization;
- School only when it is literally a school.

## 6. Protagonist Fantasy

The protagonist begins as an unknown combatant on the frontier, gains a combat class, equipment, titles, allies and territorial responsibility, and eventually becomes a legendary defender/conqueror whose choices persist through Legacy/Rebirth.

Core identity pillars:
1. **Fighter** — visible combat remains the heart.
2. **Builder** — character build, equipment and class choices matter.
3. **Leader** — companions, mercenaries and settlement matter.
4. **World Shaper** — alignment and story choices affect the world.
5. **Legacy Founder** — prestige is framed as a lasting legacy, not cosmic cultivation.

## 7. Settlement Fantasy

`Mountain Haven` is the anchor for the grounded world identity.

The settlement is:
- a vulnerable frontier stronghold;
- a place with named residents and services;
- a visible consequence layer for story choices;
- the physical home for Forge, Market, Tavern/Mercenaries, Raids and Chronicles;
- a progression surface that should feel inhabited, not like a second abstract building spreadsheet.

## 8. Rebirth / Prestige Fantasy

Player-facing prestige direction:

- **Samsara / Reincarnation** → **Rebirth** or **Legacy Reset**
- **Soul Tree** → **Legacy Tree**
- prestige currency → **Legacy Shards** (preferred working term)

Fantasy explanation:
The hero’s run ends or is willingly surrendered so a portion of accumulated mastery, chronicles, titles and world legacy empowers the next cycle.

This supports the existing mechanical reset without requiring Buddhist/Hindu reincarnation vocabulary in the main product identity.

## 9. Rank Ladder Fantasy

Internal rank IDs (`E`, `D`, `C`, `B`, `A`, `S`, `SS`, `SSS`, `AWAKENED`, `TRANSCENDENT`, `CELESTIAL`, `IMMORTAL`) remain stable until a migration is explicitly justified.

Player-facing rank names should progress through **adventurer / martial / heroic reputation**, not meridians, divinity or cosmic transcendence.

Target semantic ladder:
1. unknown / wanderer;
2. proven adventurer;
3. vanguard;
4. warden;
5. champion;
6. paragon;
7. realm-renowned hero;
8. mythic hero;
9. awakened legend;
10. living legend;
11. realm-forged legend;
12. eternal legacy figure.

Exact localized rank names are applied in Phase 6 after EN/RU copy review.

## 10. Legacy Resource Fantasy

Preferred player-facing system family:
- Rebirth
- Legacy
- Legacy Tree
- Legacy Shards
- Legacy Boons
- Chronicle

Avoid having three near-synonymous permanent currencies. Existing `souls`, `essence`, and other IDs can remain internal while the player-facing economy is rationalized later.

## 11. Naming Morphology

### Humans
- 1–3 syllables preferred.
- Western / pan-European fantasy phonetics are the baseline.
- Distinct names beat culturally random anime-name lists.
- Avoid every major hero having Japanese or Chinese phonology.

Examples of target texture: `Aldric`, `Lyanna`, `Goran`, `Milo`, `Valerius`, `Zara`, `Torin`, `Fiona`, `Kaelen`.

### Monsters
Use one clear identity noun, optionally one modifier:
- Ash Hound
- Thorn Warden
- Gloam Fox
- Frost Warg
- Rift Demon

Avoid three-adjective stacks such as “Infernal Solar Sovereign Drake.”

### Items
Prefer material/function/history:
- Ironbound Greatsword
- Hunter Shortbow
- Ashen Plate
- Warden’s Signet
- Blackglass Dagger

Legendary items may use two strong concepts, but should still be pronounceable and memorable.

### Locations
Prefer physical geography + cultural/legend identity:
- Mountain Haven
- Whispering Forest
- Thorncourt Marches
- Ashen Rift
- Frostspire Range
- Umbral Sanctum

### Titles
Titles should describe deeds, offices or reputation:
- Pioneer Lord
- Master Artisan
- Warden of the Pass
- Black Market Baron
- Dragonbreaker

## 12. Adjective Density Rule

Default content name:
- **0–1 adjective + 1 strong noun**.

Rare/legendary content:
- maximum **2 meaningful modifiers**.

Avoid adjective chains where each word only signals “more powerful.”

Bad: `Cosmic Sovereign Infernal Sunblade`  
Better: `Sunforged Blade` or `Crownfire Greatsword`

## 13. Restricted Power Words

`Sovereign`, `Celestial`, `Astral`, `Cosmic`, `Infinite`, `Divine`, `Immortal`, `Transcendent` are not globally forbidden internal strings, but they are **restricted player-facing words**.

Rules:
- no more than one restricted word in a content name;
- reserve them for genuinely exceptional endgame entities;
- do not use them as routine upgrade tiers;
- `Sovereign` should describe a specific ruler/title, not every third item/pet/boss;
- `Void` is allowed only as a coherent late-game faction/force, not a universal adjective.

## 14. Game Title Audit

Current title: **ANIME INFINITE ASCENSION**.

Problems:
- `Anime` describes rendering influence rather than world identity;
- `Infinite` is generic escalation language;
- `Ascension` directly reinforces the legacy cultivation layer;
- the title does not communicate settlement, companions, frontier adventure or world consequences;
- it risks framing the product as a generic mobile cultivation/gacha game.

### Working shortlist — not store/trademark checked

1. **Ashen Haven**
2. **Crownfall Legacy**
3. **Emberhold Chronicles**
4. **Ironbound Realms**
5. **Realmforge**
6. **The Last Stronghold**
7. **Mountain Haven: Legacy**
8. **Wardens of the Broken Realm**

No title is selected by this document. Store/trademark/search availability should be checked before `P5-22` is closed.

## 15. Compatibility Boundary

Player-facing retheme must **not** casually rename:
- `ANIME_ASCENSION_SAVE_V1..V7` keys;
- `ascension:*` event IDs;
- `ReincarnationSystem` class names;
- `rankId` values;
- `soulSkills` save field;
- content IDs referenced by saves;
- analytics identifiers used by historical dashboards.

Those are migration concerns, not branding concerns.
