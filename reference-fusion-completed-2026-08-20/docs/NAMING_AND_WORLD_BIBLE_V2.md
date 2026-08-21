# NAMING & WORLD BIBLE V2

**Identity:** Dark frontier / western heroic pixel fantasy.  
**Anchor location:** Mountain Haven.  
**Anchor realm:** Eldoria working continuity name where already established in content.

## 1. World Structure

The world should feel like connected physical territories, not unrelated genre biomes.

| Existing campaign world | Player-facing V2 direction | Core fantasy | Internal compatibility |
|---|---|---|---|
| Whispering Forest | **Whispering Forest** / Whisperwood Frontier | frontier woods, goblins, beasts, ruined watchposts | keep world ID 1 and `bg_forest` |
| Sakura Empire | **Thorncourt Marches** | fallen noble marches, duelists, cursed foxes, old fortresses | keep world ID 2 and `bg_sakura` until asset migration |
| Crimson Abyss | **Ashen Rift** | volcanic scar, demons, blackglass ruins | keep world ID 3 and `bg_abyss` |
| Frozen Peak | **Frostspire Range** | mountain passes, frostborn clans, wargs, ice ruins | keep world ID 4 and `bg_frozen` |
| Void Sanctuary | **Umbral Sanctum** | late-game occult stronghold of the Void force | keep world ID 5 and `bg_void` |

These are migration targets, not authorization to change persisted IDs.

## 2. World 1 — Mountain Haven / Whispering Forest

World 1 is the production vertical-slice anchor.

Player should understand within minutes:
- Mountain Haven is home;
- the Whispering Forest is the immediate threat zone;
- goblins and beasts threaten roads, farms and caravans;
- named NPCs depend on the player;
- the settlement physically improves as the player advances.

World 1 enemy vocabulary should stay grounded:
- Goblin Scout
- Goblin Raider
- Forest Brute
- Thorn Wolf
- Mossback Troll
- Goblin Chieftain

Avoid cosmic or divine enemies in the opening world.

## 3. World 2 — Thorncourt Marches

Purpose: replace the culturally isolated Sakura/Ronin/Shogun cluster without deleting the mechanical slot.

Visual direction:
- ruined rose gardens;
- red-leaf forests;
- stone bridges;
- abandoned keeps;
- banners of fallen noble houses.

Enemy migration direction:
- Ronin → Exiled Duelist / Thorn Duelist
- Kitsune → Gloam Fox / Hexfox
- Monk → Oathbreaker / Shrine Warden where appropriate
- Shogun → Thorn Regent / March Warlord

The red/pink palette may remain. The culture becomes part of Eldoria’s fallen marches instead of a detached Japanese empire.

## 4. World 3 — Ashen Rift

Identity:
- volcanic frontier scar;
- demon incursions;
- blackglass and iron;
- ruined mining settlements;
- fire and blood magic.

Naming examples:
- Ash Hound
- Rift Imp
- Cinder Knight
- Blackglass Golem
- Rift Tyrant

## 5. World 4 — Frostspire Range

Identity:
- dangerous mountain crossings;
- abandoned holds;
- frostborn beasts;
- ancient ward stones;
- survival rather than generic “ice level.”

Naming examples:
- Frost Warg
- Icebound Raider
- Rime Troll
- Pale Warden
- Frostspire Jarl

## 6. World 5 — Umbral Sanctum

`Void` becomes a specific late-game supernatural force.

Identity:
- reality scars;
- cult strongholds;
- corrupted relics;
- impossible shadows;
- final consequences of earlier world choices.

Avoid turning this into outer-space sci-fi. Architecture should still read as fortress, cathedral, ruin, crypt, gate and ritual site.

## 7. Factions

Preferred recurring factions:
- Crown of Eldoria
- Mountain Haven Wardens
- Caravan Houses
- Free Mercenary Companies
- Smuggler Syndicate
- Blacksmith Guild
- Frontier Rangers
- Umbral Cult / Voidbound (late game)

Faction names should imply social function or history, not power-level adjectives.

## 8. Character Naming Rules

Primary cast should avoid one-country concentration.

Current grounded anchor names already fit the direction:
- Goran
- Lyanna
- Aldric
- Milo
- Valerius
- Zara
- Torin
- Fiona

Legacy anime-style hero names can be migrated gradually. Internal hero IDs remain stable.

## 9. Item Naming Rules

Tier progression should be visible through material, craft, origin or legend.

Preferred progression texture:
- Apprentice Greatsword
- Reinforced Greatsword
- Warden Greatsword
- Blackglass Greatsword
- Crownfire Greatsword

Avoid converting every late item into `Cosmic/Astral/Sovereign/Infinite + noun`.

## 10. Pet Naming Rules

Species first, mythic epithet only at high evolution.

Example:
- Ignis Ember Drake
- Ember Drake
- Crownfire Drake

Avoid:
- Infernal Solar Sovereign
- Cosmic Eternal Godbeast

Pet identity should come from silhouette, element, combat action and relationship—not adjective count.

## 11. Titles

Good title families:
- civic office: Pioneer Lord, Warden of Mountain Haven;
- profession: Master Artisan;
- deed: Dragonbreaker, Riftwalker;
- reputation: Trusted of the Crown, Black Market Baron;
- legacy: Founder of the Lasting Keep.

Titles should sound like something NPCs could plausibly call the player.

## 12. Writing Tone

Default copy:
- concise;
- concrete;
- physical stakes;
- named places/people;
- restrained lore vocabulary.

Prefer:
> The eastern palisade is failing. Goran needs iron before nightfall.

Over:
> Channel transcendent celestial essence to awaken the infinite sovereign domain.
