# FUTURE CLASS EXPANSION ARCHITECTURE & SPECIFICATION (PHASE 122)
## Specialization Trees, Mutual Exclusivity, Modifier Integration & Schema Evolution

**Date**: 2026-08-19  
**Version**: 3.0.0  
**Source**: `src/core/classes/SpecializationTypes.ts`

---

### 1. Executive Summary & Design Vision
Phase 122 prepares the architectural blueprint for advanced **Class Specializations** in *Anime Infinite Ascension*. Rather than adding dozens of detached classes, each of the four base classes bifurcates into two distinct thematic branches upon reaching Ascension Rank A / World 4.

```
                  ┌──▶ PALADIN (Radiant Defense & Boss Counter)
  ⚔️ SWORDSMAN ──┤
                  └──▶ DARK GUARD (Vampiric Slash & Negative Karma Synergy)

                  ┌──▶ SUMMONER (Pet Amplification & Spirit Minions)
  🔮 MAGE ───────┤
                  └──▶ ELEMENTALIST (Burst Crits & Screen-Clearing AoE)

                  ┌──▶ CROSSBOWMAN (Armor Piercing & Heavy Single-Target)
  🏹 ARCHER ─────┤
                  └──▶ TRAPPER (Bleed Dots & Expedition Loot Boosts)

                  ┌──▶ SHADOW STALKER (Extreme Crit Rate & Backstab Rhythm)
  🗡️ ASSASSIN ───┤
                  └──▶ REAPER (Soul Harvest & Execution Thresholds)
```

---

### 2. Architectural Principles & Safety Constraints

1. **Mutual Exclusivity**:
   - A player may select only **ONE active specialization branch** per character slot at a time.
   - Respec rules allow clearing specialization points alongside standard class tree respec.
2. **Namespace Isolation**:
   - Modifiers inject under `id: 'spec_node_<id>'` and `sourceType: 'skill_node'`, preventing collisions with titles, karma, or equipment.
3. **Save Compatibility**:
   - Specialization state is stored as a simple `unlockedSpecializationNodes: string[]` record inside `PlayerHeroData`, ensuring $100\%$ backward and forward compatibility.

---

### 3. Prototype Schema Fixture (Paladin Node Definition)

```typescript
export const PALADIN_NODE_FIXTURE: SpecializationNodeDefinition = {
  id: 'node_paladin_aegis',
  branchId: 'spec_paladin',
  baseClassId: 'swordsman',
  tier: 1,
  nameKey: 'spec.paladin.aegis.name',
  defaultName: 'Aegis of the Sun',
  iconSvg: '<svg>...</svg>',
  description: 'Infuses blade strikes with solar light, granting bonus boss damage and town defense.',
  modifiers: [
    { target: 'bossDamage', type: 'percent_add', value: 0.15, label: '+15% Boss Damage' },
    { target: 'settlementDefense', type: 'flat', value: 25, label: '+25 Settlement Defense' },
  ],
  requiredSkillPoints: 3,
};
```

---
**Future Class Expansion Guide complete.**
