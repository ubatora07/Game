import { describe, it, expect, beforeEach } from 'vitest';
import {
  SkillNodeDefinition,
  validateTreeStructure,
} from '../src/content/skillTrees';
import { skillTreeSystem } from '../src/systems/SkillTreeSystem';
import { modifierResolver } from '../src/core/modifiers/ModifierResolver';

describe('Phase 74 — Class Development Tree Engine Suite', () => {
  // Construct a synthetic 15-node tree (1 -> 2 -> 4 -> 8)
  const testNodes: SkillNodeDefinition[] = [
    // Tier 1 (1 node)
    {
      id: 'mage_t1_root',
      classId: 'mage',
      tier: 1,
      parentId: null,
      nameKey: 'node.mage.t1',
      descKey: 'node.mage.t1.desc',
      defaultName: 'Arcane Spark',
      defaultDesc: 'Awaken primary mana pool.',
      costPoints: 1,
      modifiers: [{ id: 'mod_mage_t1', target: 'attack', type: 'percent_add', value: 0.15 }],
    },
    // Tier 2 (2 nodes)
    {
      id: 'mage_t2_fire',
      classId: 'mage',
      tier: 2,
      parentId: 'mage_t1_root',
      nameKey: 'node.mage.t2_fire',
      descKey: 'node.mage.t2_fire.desc',
      defaultName: 'Pyromancy',
      defaultDesc: 'Fire damage focus.',
      costPoints: 1,
      modifiers: [{ id: 'mod_mage_t2_fire', target: 'attack', type: 'multiplier', value: 1.25 }],
    },
    {
      id: 'mage_t2_frost',
      classId: 'mage',
      tier: 2,
      parentId: 'mage_t1_root',
      nameKey: 'node.mage.t2_frost',
      descKey: 'node.mage.t2_frost.desc',
      defaultName: 'Cryomancy',
      defaultDesc: 'Frost control and defense.',
      costPoints: 1,
      modifiers: [{ id: 'mod_mage_t2_frost', target: 'bossDamage', type: 'percent_add', value: 0.25 }],
    },
    // Tier 3 (4 nodes: 2 for fire, 2 for frost)
    {
      id: 'mage_t3_pyro_1',
      classId: 'mage',
      tier: 3,
      parentId: 'mage_t2_fire',
      nameKey: 'node.mage.t3_pyro_1',
      descKey: 'node.mage.t3_pyro_1.desc',
      defaultName: 'Inferno Nova',
      defaultDesc: 'Massive burst.',
      costPoints: 1,
      modifiers: [{ id: 'mod_mage_t3_pyro1', target: 'critDamage', type: 'percent_add', value: 0.5 }],
    },
    {
      id: 'mage_t3_pyro_2',
      classId: 'mage',
      tier: 3,
      parentId: 'mage_t2_fire',
      nameKey: 'node.mage.t3_pyro_2',
      descKey: 'node.mage.t3_pyro_2.desc',
      defaultName: 'Ignite Conflagration',
      defaultDesc: 'DoT burning.',
      costPoints: 1,
      modifiers: [{ id: 'mod_mage_t3_pyro2', target: 'attack', type: 'multiplier', value: 1.3 }],
    },
    {
      id: 'mage_t3_cryo_1',
      classId: 'mage',
      tier: 3,
      parentId: 'mage_t2_frost',
      nameKey: 'node.mage.t3_cryo_1',
      descKey: 'node.mage.t3_cryo_1.desc',
      defaultName: 'Glacial Barrier',
      defaultDesc: 'Shield barrier.',
      costPoints: 1,
      modifiers: [{ id: 'mod_mage_t3_cryo1', target: 'bossDamage', type: 'multiplier', value: 1.2 }],
    },
    {
      id: 'mage_t3_cryo_2',
      classId: 'mage',
      tier: 3,
      parentId: 'mage_t2_frost',
      nameKey: 'node.mage.t3_cryo_2',
      descKey: 'node.mage.t3_cryo_2.desc',
      defaultName: 'Blizzard Tempest',
      defaultDesc: 'AOE freeze.',
      costPoints: 1,
      modifiers: [{ id: 'mod_mage_t3_cryo2', target: 'lootChance', type: 'percent_add', value: 0.2 }],
    },
    // Tier 4 (8 nodes: 2 for each Tier 3 node)
    { id: 'mage_t4_1', classId: 'mage', tier: 4, parentId: 'mage_t3_pyro_1', nameKey: 'n4_1', descKey: 'd4_1', defaultName: 'Solar Flare Sovereign', defaultDesc: 'Ultimate solar burst', costPoints: 1, modifiers: [{ id: 'm4_1', target: 'attack', type: 'multiplier', value: 1.5 }] },
    { id: 'mage_t4_2', classId: 'mage', tier: 4, parentId: 'mage_t3_pyro_1', nameKey: 'n4_2', descKey: 'd4_2', defaultName: 'Hellfire Overlord', defaultDesc: 'Ultimate hellfire', costPoints: 1, modifiers: [{ id: 'm4_2', target: 'critChance', type: 'flat', value: 0.15 }] },
    { id: 'mage_t4_3', classId: 'mage', tier: 4, parentId: 'mage_t3_pyro_2', nameKey: 'n4_3', descKey: 'd4_3', defaultName: 'Phoenix Ascendant', defaultDesc: 'Rebirth flame', costPoints: 1, modifiers: [{ id: 'm4_3', target: 'goldMultiplier', type: 'multiplier', value: 1.4 }] },
    { id: 'mage_t4_4', classId: 'mage', tier: 4, parentId: 'mage_t3_pyro_2', nameKey: 'n4_4', descKey: 'd4_4', defaultName: 'Volcanic Tyrant', defaultDesc: 'Eruption mastery', costPoints: 1, modifiers: [{ id: 'm4_4', target: 'bossDamage', type: 'multiplier', value: 1.4 }] },
    { id: 'mage_t4_5', classId: 'mage', tier: 4, parentId: 'mage_t3_cryo_1', nameKey: 'n4_5', descKey: 'd4_5', defaultName: 'Absolute Zero Emperor', defaultDesc: 'Zero Kelvin shield', costPoints: 1, modifiers: [{ id: 'm4_5', target: 'attack', type: 'multiplier', value: 1.35 }] },
    { id: 'mage_t4_6', classId: 'mage', tier: 4, parentId: 'mage_t3_cryo_1', nameKey: 'n4_6', descKey: 'd4_6', defaultName: 'Frostbite Weaver', defaultDesc: 'Ice splinter spikes', costPoints: 1, modifiers: [{ id: 'm4_6', target: 'critDamage', type: 'percent_add', value: 0.8 }] },
    { id: 'mage_t4_7', classId: 'mage', tier: 4, parentId: 'mage_t3_cryo_2', nameKey: 'n4_7', descKey: 'd4_7', defaultName: 'Tidebringer Summoner', defaultDesc: 'Water familiar summon', costPoints: 1, modifiers: [{ id: 'm4_7', target: 'petDamage', type: 'multiplier', value: 2.0 }] },
    { id: 'mage_t4_8', classId: 'mage', tier: 4, parentId: 'mage_t3_cryo_2', nameKey: 'n4_8', descKey: 'd4_8', defaultName: 'Time Freeze Chronomancer', defaultDesc: 'Chrono distortion', costPoints: 1, modifiers: [{ id: 'm4_8', target: 'attackSpeed', type: 'multiplier', value: 1.3 }] },
  ];

  beforeEach(() => {
    skillTreeSystem.respecTree(testNodes);
    modifierResolver.clearAll();
  });

  it('P74-01: Correctly validates a 15-node 1->2->4->8 tree structure', () => {
    const validation = validateTreeStructure(testNodes);
    expect(validation.valid).toBe(true);
    expect(validation.error).toBeUndefined();
  });

  it('P74-02: Enforces prerequisite chain (Tier 1 -> Tier 2 -> Tier 3 -> Tier 4)', () => {
    // Cannot unlock Tier 2 directly without Tier 1
    const t2Fire = testNodes.find((n) => n.id === 'mage_t2_fire')!;
    const checkBeforeT1 = skillTreeSystem.canUnlockNode(t2Fire, testNodes);
    expect(checkBeforeT1.eligible).toBe(false);

    // Unlock Tier 1
    const t1 = testNodes.find((n) => n.id === 'mage_t1_root')!;
    const unlockedT1 = skillTreeSystem.unlockNode(t1, testNodes);
    expect(unlockedT1).toBe(true);

    // Now Tier 2 is unlockable
    const checkAfterT1 = skillTreeSystem.canUnlockNode(t2Fire, testNodes);
    expect(checkAfterT1.eligible).toBe(true);

    const unlockedT2 = skillTreeSystem.unlockNode(t2Fire, testNodes);
    expect(unlockedT2).toBe(true);

    // Unlock Tier 3 Pyro 1
    const t3Pyro1 = testNodes.find((n) => n.id === 'mage_t3_pyro_1')!;
    expect(skillTreeSystem.unlockNode(t3Pyro1, testNodes)).toBe(true);

    // Unlock Tier 4 Solar Flare
    const t4Solar = testNodes.find((n) => n.id === 'mage_t4_1')!;
    expect(skillTreeSystem.unlockNode(t4Solar, testNodes)).toBe(true);

    // Full 4-tier chain unlocked
    expect(skillTreeSystem.getUnlockedNodeIds().length).toBe(4);
  });

  it('P74-03: Enforces mutual exclusivity within the same tier', () => {
    const t1 = testNodes.find((n) => n.id === 'mage_t1_root')!;
    skillTreeSystem.unlockNode(t1, testNodes);

    const t2Fire = testNodes.find((n) => n.id === 'mage_t2_fire')!;
    const t2Frost = testNodes.find((n) => n.id === 'mage_t2_frost')!;

    // Choose Fire
    skillTreeSystem.unlockNode(t2Fire, testNodes);

    // Attempt to also choose Frost at Tier 2
    const checkFrost = skillTreeSystem.canUnlockNode(t2Frost, testNodes);
    expect(checkFrost.eligible).toBe(false);
    expect(checkFrost.reason).toContain('Exclusive branch already chosen');
  });

  it('P74-04: Skill node modifiers apply into ModifierResolver', () => {
    const t1 = testNodes.find((n) => n.id === 'mage_t1_root')!; // +15% ATK
    const t2Fire = testNodes.find((n) => n.id === 'mage_t2_fire')!; // x1.25 ATK

    skillTreeSystem.unlockNode(t1, testNodes);
    skillTreeSystem.unlockNode(t2Fire, testNodes);

    // Base 100 * (1 + 0.15) * 1.25 = 100 * 1.15 * 1.25 = 143.75
    const resolvedAtk = modifierResolver.resolve('attack', 100, { characterClass: 'mage' });
    expect(resolvedAtk).toBeCloseTo(143.75, 2);
  });

  it('P74-05: Respec refunds all skill points and clears node modifiers', () => {
    const t1 = testNodes.find((n) => n.id === 'mage_t1_root')!;
    const t2Fire = testNodes.find((n) => n.id === 'mage_t2_fire')!;

    skillTreeSystem.unlockNode(t1, testNodes);
    skillTreeSystem.unlockNode(t2Fire, testNodes);
    expect(skillTreeSystem.getAvailablePoints()).toBe(2);

    skillTreeSystem.respecTree(testNodes);
    expect(skillTreeSystem.getAvailablePoints()).toBe(4);
    expect(skillTreeSystem.getUnlockedNodeIds().length).toBe(0);

    // Modifier cleared
    expect(modifierResolver.resolve('attack', 100, { characterClass: 'mage' })).toBe(100);
  });
});
