# TERMINOLOGY MIGRATION MAP — V2

**Purpose:** Separate player-facing retheme from internal compatibility.  
**Rule:** Internal IDs stay stable unless a specific migration proves the value of changing them.

## 1. Core Systems

| Current player-facing term | V2 target | Context / rule | Internal IDs |
|---|---|---|---|
| Sect | Stronghold / Training Grounds / Order | choose by context; never one blind global replacement | keep `sect`/building IDs where needed |
| Cultivation | Training / Mastery / Growth | remove cultivation-school framing | keep legacy analytics/internal comments until cleanup |
| Qi | Focus / Arcane Energy / Power | prefer existing `Power` when no distinct resource is required | stable save fields unchanged |
| Ascension | Advancement / Rank Up | player-facing rank progression | keep `AscensionSystem`, `ascension:*`, rank IDs |
| Samsara | Rebirth / Legacy Reset | prestige loop | keep `ReincarnationSystem` and historical event IDs |
| Reincarnation | Rebirth | default UI noun | internal class may remain |
| Soul Tree | Legacy Tree | permanent prestige perks | keep `soulSkills` field and skill IDs |
| Cultivation Souls | Legacy Shards | working player-facing prestige currency | keep `souls` save field |
| Sect Buildings | Training Grounds / Stronghold Facilities | merge conceptually with physical settlement over time | keep building IDs for save compatibility |
| Dojo | Training Yard | grounded facility | keep `dojo` building ID |
| Meditation Chamber | Focus Hall / Study | only if mechanic remains | keep building ID |
| Spirit Shrine | Ancestral Shrine / Shrine | `Spirit` itself is allowed | keep building ID |
| Celestial Temple | Sanctum | remove routine celestial escalation | keep building ID |
| Dimensional Gate | Ancient Gate | portal is rare/ancient, not industrial tech | keep building ID |
| Star Fortress | High Keep / Sky Keep only if fiction supports it | remove orbital/sci-fi implication | keep building ID |
| Infinite Core | Heartforge / Arcane Core | no sci-fi infinite generator language | keep building ID |

## 2. Rank / Progression Vocabulary

| Current concept | V2 semantic direction |
|---|---|
| Mortal Novice | Wanderer / Unknown fighter |
| Qi Initiate | Proven adventurer |
| Spirit Adept | Vanguard |
| Soul Master | Warden |
| Domain Lord | Champion |
| Celestial Champion | Paragon |
| Void Sovereign | Realm-renowned hero / Void-specific title only if narrative requires |
| Cosmic Monarch | Mythic hero |
| Awakened Deity | Awakened Legend |
| Transcendent God | Living Legend |
| Celestial Origin | Realm-forged Legend |
| Infinite Sovereign | Eternal Legacy / Founder-tier title |

Exact EN/RU names require a dedicated copy pass before application.

## 3. World 2 Cultural Migration

| Current | V2 target direction | Internal compatibility |
|---|---|---|
| Sakura Empire | Thorncourt Marches | keep world ID 2 and existing asset key until art swap |
| Ronin | Exiled Duelist / Thorn Duelist | keep enemy ID |
| Kitsune | Gloam Fox / Hexfox | keep enemy ID |
| Shogun | Thorn Regent / March Warlord | keep boss ID |
| Sakura visual palette | red-leaf / rose / thorncourt palette | palette may survive without Japanese state identity |

## 4. Restricted Adjective Migration

| Current pattern | Replace with |
|---|---|
| Cosmic Sovereign X | origin/material/deed-based name |
| Astral X | use only if genuinely star/astral magic; otherwise Rune/Shadow/Storm/etc. |
| Celestial X | Sanctum/Crown/Light/etc. when context actually requires it |
| Infinite X | remove unless system is literally endless (e.g. Infinite Tower may remain as a mode name) |
| Sovereign X | ruler-specific use only |
| Divine/God/Deity X | myth/religion-specific use only; not a generic tier |

## 5. UI Domain Migration

| Legacy destination | IA V3 destination |
|---|---|
| Ascension primary tab | Hero → Rank & Advancement |
| Heroes primary tab | Team → Hero Roster |
| Summon | Team → Recruitment |
| Pet | Team → Companion Pet |
| Mercenaries | Team / Settlement shortcut |
| Forge | Settlement |
| Market | Settlement |
| Raid Defense | Settlement |
| Settlement Story | Settlement → Chronicles |
| Tower | World |
| Expeditions | World |
| Quests | World Objectives |
| Sect | More → legacy Training Grounds during migration |
| Soul Tree / Rebirth | More → Legacy systems |
| Settings / Stats / Dailies | More |

## 6. Internal Identifiers Explicitly Allowed to Stay Legacy

Do not rename merely for aesthetics:
- `ANIME_ASCENSION_SAVE_V1` … `ANIME_ASCENSION_SAVE_V7`;
- `AscensionSystem`;
- `ReincarnationSystem`;
- `ascension:rankUp`;
- `reincarnate:complete`;
- `rankId` / rank enum IDs;
- `soulSkills`;
- building IDs such as `dojo`, `meditation_chamber`, `celestial_temple`;
- world asset IDs such as `bg_sakura` during staged art migration;
- hero/enemy/item IDs referenced by saves.

Changing these requires explicit migration tests and offers little player-facing value.

## 7. Migration Order

1. Lock vocabulary/bible.
2. Add regression scanner for forbidden player-facing terms.
3. Migrate translation dictionaries EN + RU.
4. Move hardcoded UI strings into i18n.
5. Migrate content display names/descriptions while keeping IDs stable.
6. Migrate world 2 display identity.
7. Migrate art assets/resolvers.
8. Only then consider internal cleanup of obsolete identifiers.
