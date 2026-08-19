# XIANXIA LEGACY AUDIT V2

**Status:** Source audit complete; migration debt is now regression-locked.  
**Scanner scope:** Player-facing translation values plus content display fields (`defaultName`, `defaultDesc`, `description`, `title`, `subtitle`, hints, labels, etc.).  
**Out of scope here:** Hardcoded UI template literals are handled in Phase 7 localization consolidation.

## 1. Baseline

The AST terminology scanner currently evaluates **2,473 player-facing translation/content strings**.

| Tracked term | Baseline occurrences | Policy |
|---|---:|---|
| Sect | 5 | forbidden player-facing default |
| Cultivation/Cultivator | 16 | forbidden |
| Qi | 5 | forbidden |
| Samsara | 5 | forbidden |
| Ascension | 12 | migration term; app title temporarily exempt by baseline |
| Soul Tree | 3 | forbidden |
| Dojo | 5 | forbidden |
| Sakura | 6 | forbidden world identity |
| Ronin | 2 | forbidden world-2 identity |
| Kitsune | 2 | forbidden world-2 identity |
| Shogun | 2 | forbidden world-2 identity |
| Celestial | 39 | restricted endgame word |
| Cosmic | 20 | restricted |
| Astral | 25 | restricted |
| Sovereign | 44 | restricted / heavily overused |
| Immortal | 6 | restricted |
| Deity | 4 | restricted |
| God/Goddess/Godhood | 15 | restricted |
| Transcendent | 4 | restricted |

The baseline is intentionally **not zero yet**. `qa:terminology` fails only when a tracked term increases. As approved migrations land, the baseline must be reduced rather than reset upward.

## 2. Sect

Primary findings:
- `nav.sect`, `building.title`, `sect.title`, `sect.subtitle` still present in translations;
- quest copy still refers to Sect expansion;
- RPG breakdown calls the old economy cluster `Sect Buildings`;
- the old passive-economy screen is now correctly isolated behind the explicit `sect` deep route under More.

Migration target:
- navigation/display: **Training Grounds**;
- physical base context: **Stronghold**;
- organization context: **Order/Guild** if ever needed.

Internal building IDs remain unchanged.

## 3. Cultivation / Cultivator

Found in:
- Sect subtitle;
- hero skill descriptions;
- building quests/achievements;
- rank/identity copy;
- campaign solo label;
- Black Market prestige item copy;
- titles.

Target vocabulary: **training, mastery, combat power, growth, legacy** depending on context.

## 4. Qi

Player-facing debt is concentrated in:
- Meditation Chamber description;
- Rank D name/title/description;
- Rank-D achievement;
- one surge label.

Target vocabulary:
- **Focus** where a distinct concept is needed;
- otherwise use existing **Power** rather than inventing another currency.

## 5. Samsara

Found in:
- reincarnation achievement copy;
- Black Market prestige item description;
- Legacy Ending subtitle;
- Ancient Cultivator title description/unlock hint.

Target: **Rebirth / Legacy**.

Internal `ReincarnationSystem`, `reincarnate:complete`, save fields and IDs remain stable.

## 6. Ascension

Player-facing uses include:
- current game title;
- rank progression labels/modals;
- Soul/Legacy perk names;
- RPG breakdown labels;
- event/blacksmith/tower copy.

Target for ordinary progression: **Advancement / Rank Up**.

Exception:
- current store/game title remains unchanged until `P5-22/P5-23` is explicitly resolved.

Internal `AscensionSystem` and `ascension:*` events remain stable.

## 7. Soul Tree

Three player-facing occurrences remain in navigation/rank/RPG breakdown copy.

Target: **Legacy Tree**.

Internal `soulSkills` and skill IDs remain stable.

## 8. God / Immortal / Deity Escalation

Rank ladder is the most visible escalation problem:
- Awakened Deity;
- Transcendent God;
- Celestial Origin;
- Infinite Sovereign;
- near-immortality descriptions.

Additional debt appears in hero titles, skill trees and bosses.

Direction:
- rank names move toward adventurer/warden/champion/legend semantics;
- literal gods remain only when the fiction genuinely depicts a deity;
- “God” must not mean “tier 4 skill is stronger.”

## 9. Dojo / Meditation / Shrine Cultural Mix

Current passive building ladder mixes:
- Dojo;
- Meditation Chamber;
- Spirit Shrine;
- Warrior Academy;
- Celestial Temple;
- Mana Reactor;
- Dimensional Gate;
- Star Fortress;
- Infinite Core.

This is simultaneously xianxia, anime, western fantasy and sci-fi.

Target:
- Dojo → **Training Yard**;
- Meditation Chamber → **Focus Hall / Study**;
- Spirit Shrine → **Ancestral Shrine**;
- late sci-fi buildings receive grounded stronghold/runic replacements during content-copy migration.

IDs stay stable.

## 10. Sakura Empire

Current World 2 identity is explicitly Japanese-coded while the newer settlement/world layer is western frontier fantasy.

Migration target: **Thorncourt Marches**.

The existing red/pink/red-leaf palette can survive. The political/cultural identity changes, not necessarily the color family.

Keep:
- world ID `2`;
- `bg_sakura` asset key until the art resolver migration is ready.

## 11. Ronin / Kitsune / Shogun Set

Current display set:
- Corrupted Ronin / Bamboo Ronin;
- Trickster Kitsune / Kitsune Shade;
- Shadow Shogun / Shogun Ghost Nobunaga.

Migration direction:
- Ronin → **Exiled Duelist / Thorn Duelist**;
- Kitsune → **Gloam Fox / Hexfox**;
- Shogun → **Thorn Regent / March Warlord**.

Enemy/boss IDs and sprite IDs stay stable until art migration.

## 12. Hero Naming Concentration

Legacy roster includes a high concentration of Japanese/Chinese/anime-coded names and titles (Hiro, Yuna, Hana, Ayaka, Amaterasu, etc.).

The newer grounded cast (Aldric, Lyanna, Goran, Milo, Valerius, Zara, Torin, Fiona) is a stronger anchor for the target world.

Migration rule:
- do not mass-rename IDs;
- display-name retheme can be gradual;
- future content defaults to western/pan-European fantasy morphology;
- anime influence remains visual/cinematic.

## 13. Rank Descriptions

All 12 rank display tiers need a copy pass. Current ladder moves from meridians/Qi into deities/cosmic omnipotence.

Target semantic progression is defined in `PRODUCT_IDENTITY_V2.md` and should be applied EN/RU together in Phase 7.

## 14. Building Descriptions

Building IDs are mechanically stable and save-sensitive. Display names/descriptions are migration-only.

Highest-priority copy debt:
- Dojo;
- Meditation Chamber;
- Celestial Temple;
- Mana Reactor;
- Dimensional Gate;
- Star Fortress;
- Infinite Core.

## 15. Upgrades

Upgrade copy contains:
- Dojo Discipline;
- Celestial Discipline;
- God Domain;
- Astral Slumber;
- other escalation vocabulary.

Mechanics can remain. Display names/descriptions should be rewritten around training, tactics, runes, endurance, logistics, and legacy.

## 16. Quests and Achievements

Current quest/achievement debt includes:
- Sect Expansion;
- cultivation buildings;
- Cultivator Empire;
- Renowned Cultivator;
- Dojo Order;
- Qi Initiate;
- Immortal Samsara;
- Sakura-specific achievements.

Quest IDs and completion logic remain stable.

## 17. Titles

Examples of legacy debt:
- Ancient Cultivator;
- Samsara descriptions;
- repeated Sovereign framing;
- cosmic cadence descriptions.

The title system itself is a strong fit. Only display copy needs migration.

## 18. Market / Black Market

The Black Market is target-fit mechanically.

Legacy copy debt:
- “stream of Samsara”;
- “Cultivation Souls”.

Target: occult/forbidden **Legacy Shards** framing while keeping offer IDs/rewards stable.

## 19. Pets

Strong mechanical system, but evolution names show adjective inflation:
- Infernal Solar Sovereign;
- Abyssal Frostfang Sovereign;
- Hurricane Sovereign.

Target: species/element/legend naming with at most one or two meaningful modifiers.

## 20. Equipment

Examples:
- Cosmic Sovereign Cleaver;
- Sonic Tempest Sovereign Bow;
- Bronze Sovereign Band.

Early equipment names are substantially stronger and should define the model: material/function/origin first.

## 21. Relics

Relic base naming is comparatively coherent (`Spirit Lantern`, `Karmic Hourglass`, `Dragon Scale`, etc.).

Action:
- preserve strong relic identities;
- audit descriptions for restricted adjective leakage during localization pass;
- no broad relic-system rename required.

## 22. NPC Dialogue / Settlement Story

The western cast is coherent, but `Sovereign` is overused as the player form of address.

Examples:
- settlement NPCs repeatedly call the player “Sovereign”;
- `Sovereign Mountain Citadel` story chapter;
- narrative choice mentions the `Sovereign Court`.

Target:
- Lord/Lady, Warden, Commander, Champion, Crown/Court depending on relationship and story state.

## 23. Analytics Labels

No player-facing analytics dashboard currently requires xianxia display terminology migration.

Rule:
- historical analytics event IDs should remain stable;
- only UI labels shown to players/designers should be rethemed later.

## 24. Stable Internal IDs

Preserve unless a migration is explicitly justified:
- save keys V1–V7;
- rank IDs;
- `AscensionSystem`;
- `ReincarnationSystem`;
- `ascension:rankUp`;
- `reincarnate:complete`;
- `soulSkills`;
- building IDs;
- hero/enemy/item IDs;
- world IDs and current asset keys.

## 25. Regression Gate

Added:
- `scripts/terminology-audit.cjs`;
- `scripts/terminology-baseline.json`;
- `npm run qa:terminology`;
- terminology audit as the first step in `npm run build`.

Behavior:
- scans player-facing translation/content strings through the TypeScript AST;
- compares tracked counts against the locked baseline;
- fails if any tracked forbidden/restricted term **increases**;
- allows debt to be reduced incrementally;
- baseline should never be increased merely to silence a failure.
