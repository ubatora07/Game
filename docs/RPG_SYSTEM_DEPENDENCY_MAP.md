# Phase 71: RPG System Dependency Map

## 1. Global System Dependency Architecture

```text
                               ┌─────────────────────────────┐
                               │     Universal Modifier      │
                               │      Framework (P72)        │
                               └──────────────┬──────────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    ▼                         ▼                         ▼
        ┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────────────┐
        │   4 Base Classes      │ │     Rhythm Attack     │ │   Adventure Events    │
        │    & Trees (P73-79)   │ │    Engine (P82-84)    │ │    & Karma (P85-89)   │
        └───────────┬───────────┘ └───────────┬───────────┘ └───────────┬───────────┘
                    │                         │                         │
                    └─────────────────┬───────┴─────────────────────────┘
                                      ▼
                        ┌───────────────────────────┐
                        │   Dual-Character Team     │
                        │      System (P80-81)      │
                        └─────────────┬─────────────┘
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │   Campaign Combat Loop    │
                        │ & World Stages (Existing) │
                        └─────────────┬─────────────┘
                                      │
           ┌──────────────────────────┼──────────────────────────┐
           ▼                          ▼                          ▼
┌────────────────────┐     ┌────────────────────┐     ┌────────────────────┐
│    Small Market    │     │   Pet Foundation   │     │ Settlement Hub     │
│       (P90)        │     │     (P93-95)       │     │     (P96-98)       │
└──────────┬─────────┘     └──────────┬─────────┘     └──────────┬─────────┘
           │                          │                          │
           └──────────────────────────┼──────────────────────────┘
                                      ▼
                           ┌────────────────────┐
                           │ Crafting & Forge   │
                           │     (P99-102)      │
                           └──────────┬─────────┘
                                      │
           ┌──────────────────────────┼──────────────────────────┐
           ▼                          ▼                          ▼
┌────────────────────┐     ┌────────────────────┐     ┌────────────────────┐
│   Expanded Market  │     │   Black Market     │     │ Settlement Defense │
│   & Titles (P103)  │     │   & Karma v2 (P106)│     │   & Raids (P107)   │
└──────────┬─────────┘     └──────────┬─────────┘     └──────────┬─────────┘
           │                          │                          │
           └──────────────────────────┼──────────────────────────┘
                                      ▼
                           ┌────────────────────┐
                           │ Narrative Chains   │
                           │ & Endings (109-111)│
                           └──────────┬─────────┘
                                      │
                                      ▼
                           ┌────────────────────┐
                           │      SAMSARA       │
                           │   Legacy Rebirth   │
                           └────────────────────┘
```

---

## 2. Phase-by-Phase Dependency Graph

| Phase | System / Component | Direct Prerequisites | Depended on by |
| :--- | :--- | :--- | :--- |
| **P71** | System Audit & Mapping | None | P72–P124 |
| **P72** | Universal Modifier Framework | P71 | P73, P74, P82, P87, P93, P101 |
| **P73** | 4 Base Classes (Mage, Sword, Archer, Assassin) | P72 | P74, P75–P78, P80 |
| **P74** | Class Tree Engine (1→2→4→8) | P73 | P75–P78, P80 |
| **P75–78**| Specific Class Trees | P74 | P79, P80, P95 |
| **P79** | Class Balance Pass | P75–P78 | P80, P91 |
| **P80–81**| Dual-Character Team Core & Unlock | P73, P79 | P91, P101 |
| **P82–84**| Rhythm Attack Engine & Reward Curve | P72 | P91, P119 |
| **P85–86**| Adventure Event Framework & Base Content | Existing EventBus | P87, P88, P89, P109 |
| **P87–88**| Karma System & Village Choices | P85 | P89, P106, P110 |
| **P89** | Event Character Recruitment | P85, P87 | P91, P110 |
| **P90** | Small Market MVP | Existing Economy | P91, P103 |
| **P91–92**| Tier A Playable Gate & Balance Pass | P71–P90 | P93–P106 (Tier B) |
| **P93–95**| Pets Foundation, Growth & Class Synergy | P72, P75–P78, P91 | P97, P117 |
| **P96–98**| Settlement Model, Buildings & NPCs | P91 | P99, P100, P107, P108 |
| **P99–102**| Crafting, Blacksmiths & Equipment Evolution | P72, P96, P97 | P103, P106, P117 |
| **P103–106**| Expanded Market, Mercenaries, Titles, Black Market| P87, P90, P99 | P108, P110 |
| **P107–111**| Settlement Defense, Story Chains, Endings | P87, P96, P103 | P113–P120 (Tier C) |
| **P112–114**| Relationship Gate, Matrix & UX v3 | P107–P111 | P115–P120 |
| **P115–118**| Save Schema v3, Analytics v3, Simulator v3, Tooling| P72–P114 | P119, P120 |
| **P119–120**| Full QA & RPG Release Gate | P115–P118 | Live Release |
