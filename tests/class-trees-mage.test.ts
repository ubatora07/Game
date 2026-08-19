import { describe, it, expect, beforeEach } from 'vitest';
import { MAGE_NODES } from '../src/content/skillTrees/mageTree';
import { validateTreeStructure } from '../src/content/skillTrees';
import { skillTreeSystem } from '../src/systems/SkillTreeSystem';
import { modifierResolver } from '../src/core/modifiers/ModifierResolver';

describe('Phase 75 — Class Trees: Mage Suite', () => {
  beforeEach(() => {
    skillTreeSystem.respecTree(MAGE_NODES);
    modifierResolver.clearAll();
  });

  it('P75-01: Mage tree has exact 15-node 1->2->4->8 structure and passes validation', () => {
    expect(MAGE_NODES.length).toBe(15);
    const validation = validateTreeStructure(MAGE_NODES);
    expect(validation.valid).toBe(true);
  });

  it('P75-02: Familiar Summoning path scales Pet damage and Party damage', () => {
    const t1 = MAGE_NODES.find((n) => n.id === 'mage_t1_catalyst')!;
    const t2Arc = MAGE_NODES.find((n) => n.id === 'mage_t2_arcane')!;
    const t3Sum = MAGE_NODES.find((n) => n.id === 'mage_t3_summoning')!;
    const t4Astral = MAGE_NODES.find((n) => n.id === 'mage_t4_astral_archmage')!;

    skillTreeSystem.unlockNode(t1, MAGE_NODES);
    skillTreeSystem.unlockNode(t2Arc, MAGE_NODES);
    skillTreeSystem.unlockNode(t3Sum, MAGE_NODES);
    skillTreeSystem.unlockNode(t4Astral, MAGE_NODES);

    // Pet damage: Base 100 * 2.0 (T3) * 3.0 (T4) = 600
    const resolvedPet = modifierResolver.resolve('petDamage', 100, { characterClass: 'mage' });
    expect(resolvedPet).toBe(600);

    // Ally damage: Base 100 * (1 + 0.15 + 0.35) = 150
    const resolvedAlly = modifierResolver.resolve('allyDamage', 100, { characterClass: 'mage' });
    expect(resolvedAlly).toBe(150);
  });

  it('P75-03: Void Annihilator path delivers massive raw ATK and Crit Damage', () => {
    const t1 = MAGE_NODES.find((n) => n.id === 'mage_t1_catalyst')!;
    const t2Arc = MAGE_NODES.find((n) => n.id === 'mage_t2_arcane')!;
    const t3Void = MAGE_NODES.find((n) => n.id === 'mage_t3_pure_arcana')!;
    const t4Void = MAGE_NODES.find((n) => n.id === 'mage_t4_void_annihilator')!;

    skillTreeSystem.unlockNode(t1, MAGE_NODES);
    skillTreeSystem.unlockNode(t2Arc, MAGE_NODES);
    skillTreeSystem.unlockNode(t3Void, MAGE_NODES);
    skillTreeSystem.unlockNode(t4Void, MAGE_NODES);

    // ATK: 100 * (1 + 0.20) * 1.25 * 1.30 * 1.50 = 120 * 1.25 * 1.3 * 1.5 = 292.5
    const resolvedAtk = modifierResolver.resolve('attack', 100, { characterClass: 'mage' });
    expect(resolvedAtk).toBeCloseTo(292.5, 2);

    // Crit Damage: Base 2.0 * (1 + 0.40 + 0.75) = 2.0 * 2.15 = 4.30
    const resolvedCritDmg = modifierResolver.resolve('critDamage', 2.0, { characterClass: 'mage' });
    expect(resolvedCritDmg).toBeCloseTo(4.30, 2);
  });

  it('P75-04: Pyromancy path specializes in boss execution and manual clicks', () => {
    const t1 = MAGE_NODES.find((n) => n.id === 'mage_t1_catalyst')!;
    const t2Elem = MAGE_NODES.find((n) => n.id === 'mage_t2_elemental')!;
    const t3Fire = MAGE_NODES.find((n) => n.id === 'mage_t3_fire_storm')!;
    const t4Solar = MAGE_NODES.find((n) => n.id === 'mage_t4_solar_pyrolord')!;

    skillTreeSystem.unlockNode(t1, MAGE_NODES);
    skillTreeSystem.unlockNode(t2Elem, MAGE_NODES);
    skillTreeSystem.unlockNode(t3Fire, MAGE_NODES);
    skillTreeSystem.unlockNode(t4Solar, MAGE_NODES);

    // Boss damage: Base 100 * (1 + 0.40) * 1.60 = 224
    const resolvedBoss = modifierResolver.resolve('bossDamage', 100, { characterClass: 'mage', isBoss: true });
    expect(resolvedBoss).toBe(224);

    // Manual attack: Base 100 * (1 + 0.30 + 0.50) = 180
    const resolvedManual = modifierResolver.resolve('manualAttackDamage', 100, { characterClass: 'mage', isManual: true });
    expect(resolvedManual).toBe(180);
  });

  it('P75-05: Gaia Sage path maximizes gold and power multipliers', () => {
    const t1 = MAGE_NODES.find((n) => n.id === 'mage_t1_catalyst')!;
    const t2Elem = MAGE_NODES.find((n) => n.id === 'mage_t2_elemental')!;
    const t3Frost = MAGE_NODES.find((n) => n.id === 'mage_t3_frost_nature')!;
    const t4Gaia = MAGE_NODES.find((n) => n.id === 'mage_t4_gaia_sage')!;

    skillTreeSystem.unlockNode(t1, MAGE_NODES);
    skillTreeSystem.unlockNode(t2Elem, MAGE_NODES);
    skillTreeSystem.unlockNode(t3Frost, MAGE_NODES);
    skillTreeSystem.unlockNode(t4Gaia, MAGE_NODES);

    const resolvedGold = modifierResolver.resolve('goldMultiplier', 1.0, { characterClass: 'mage' });
    expect(resolvedGold).toBe(1.50);

    const resolvedPower = modifierResolver.resolve('powerMultiplier', 1.0, { characterClass: 'mage' });
    // T1 +15% additive, T4 x1.50 mult => (1.0) * (1 + 0.15) * 1.50 = 1.725
    expect(resolvedPower).toBeCloseTo(1.725, 3);
  });
});
