import { describe, it, expect, beforeEach } from 'vitest';
import { ARCHER_NODES } from '../src/content/skillTrees/archerTree';
import { validateTreeStructure } from '../src/content/skillTrees';
import { skillTreeSystem } from '../src/systems/SkillTreeSystem';
import { modifierResolver } from '../src/core/modifiers/ModifierResolver';

describe('Phase 77 — Class Trees: Archer Suite', () => {
  beforeEach(() => {
    skillTreeSystem.respecTree(ARCHER_NODES);
    modifierResolver.clearAll();
  });

  it('P77-01: Archer tree has exact 15-node 1->2->4->8 structure and passes validation', () => {
    expect(ARCHER_NODES.length).toBe(15);
    const validation = validateTreeStructure(ARCHER_NODES);
    expect(validation.valid).toBe(true);
  });

  it('P77-02: Rapid Fire path (Sonic Tempest) delivers massive attack speed and click DPS', () => {
    const t1 = ARCHER_NODES.find((n) => n.id === 'archer_t1_focus')!;
    const t2Vol = ARCHER_NODES.find((n) => n.id === 'archer_t2_rapid_volley')!;
    const t3Phan = ARCHER_NODES.find((n) => n.id === 'archer_t3_phantom_barrage')!;
    const t4Sonic = ARCHER_NODES.find((n) => n.id === 'archer_t4_sonic_tempest')!;

    skillTreeSystem.unlockNode(t1, ARCHER_NODES);
    skillTreeSystem.unlockNode(t2Vol, ARCHER_NODES);
    skillTreeSystem.unlockNode(t3Phan, ARCHER_NODES);
    skillTreeSystem.unlockNode(t4Sonic, ARCHER_NODES);

    // Attack Speed: Base 100 * (1 + 0.25 + 0.35 + 0.60) * 1.30 = 100 * 2.20 * 1.30 = 286
    const resolvedSpd = modifierResolver.resolve('attackSpeed', 100, { characterClass: 'archer' });
    expect(resolvedSpd).toBeCloseTo(286, 2);

    // Manual attack: Base 100 * (1 + 0.20 + 0.50) = 170
    const resolvedManual = modifierResolver.resolve('manualAttackDamage', 100, { characterClass: 'archer', isManual: true });
    expect(resolvedManual).toBe(170);
  });

  it('P77-03: Heavy Crossbow path (Siege Annihilator) maximizes pure weapon impact and boss destruction', () => {
    const t1 = ARCHER_NODES.find((n) => n.id === 'archer_t1_focus')!;
    const t2Vol = ARCHER_NODES.find((n) => n.id === 'archer_t2_rapid_volley')!;
    const t3Cross = ARCHER_NODES.find((n) => n.id === 'archer_t3_heavy_crossbow')!;
    const t4Siege = ARCHER_NODES.find((n) => n.id === 'archer_t4_siege_annihilator')!;

    skillTreeSystem.unlockNode(t1, ARCHER_NODES);
    skillTreeSystem.unlockNode(t2Vol, ARCHER_NODES);
    skillTreeSystem.unlockNode(t3Cross, ARCHER_NODES);
    skillTreeSystem.unlockNode(t4Siege, ARCHER_NODES);

    // ATK: Base 100 * (1 + 0.15) * 1.30 * 1.60 = 115 * 1.30 * 1.60 = 239.2
    const resolvedAtk = modifierResolver.resolve('attack', 100, { characterClass: 'archer' });
    expect(resolvedAtk).toBeCloseTo(239.2, 2);

    // Boss damage: Base 100 * 1.60 = 160
    const resolvedBoss = modifierResolver.resolve('bossDamage', 100, { characterClass: 'archer', isBoss: true });
    expect(resolvedBoss).toBe(160);
  });

  it('P77-04: Beast Hunter path (Apex Beastlord) supercharges Pet Damage and Loot', () => {
    const t1 = ARCHER_NODES.find((n) => n.id === 'archer_t1_focus')!;
    const t2Hunt = ARCHER_NODES.find((n) => n.id === 'archer_t2_beast_hunter')!;
    const t3Falc = ARCHER_NODES.find((n) => n.id === 'archer_t3_falcon_tamer')!;
    const t4Apex = ARCHER_NODES.find((n) => n.id === 'archer_t4_beastlord_apex')!;

    skillTreeSystem.unlockNode(t1, ARCHER_NODES);
    skillTreeSystem.unlockNode(t2Hunt, ARCHER_NODES);
    skillTreeSystem.unlockNode(t3Falc, ARCHER_NODES);
    skillTreeSystem.unlockNode(t4Apex, ARCHER_NODES);

    // Pet damage: Base 100 * (1 + 0.50) * 2.0 * 3.0 = 150 * 6.0 = 900
    const resolvedPet = modifierResolver.resolve('petDamage', 100, { characterClass: 'archer' });
    expect(resolvedPet).toBe(900);

    // Party damage: Base 100 * (1 + 0.40) = 140
    const resolvedAlly = modifierResolver.resolve('allyDamage', 100, { characterClass: 'archer' });
    expect(resolvedAlly).toBe(140);
  });

  it('P77-05: Deadeye Weakpoint path (Infinite Trajectory) achieves extreme Crit and Boss scaling', () => {
    const t1 = ARCHER_NODES.find((n) => n.id === 'archer_t1_focus')!;
    const t2Hunt = ARCHER_NODES.find((n) => n.id === 'archer_t2_beast_hunter')!;
    const t3Snip = ARCHER_NODES.find((n) => n.id === 'archer_t3_weakpoint_sniper')!;
    const t4Traj = ARCHER_NODES.find((n) => n.id === 'archer_t4_infinite_trajectory')!;

    skillTreeSystem.unlockNode(t1, ARCHER_NODES);
    skillTreeSystem.unlockNode(t2Hunt, ARCHER_NODES);
    skillTreeSystem.unlockNode(t3Snip, ARCHER_NODES);
    skillTreeSystem.unlockNode(t4Traj, ARCHER_NODES);

    // Crit Chance: Base 0.05 + 0.20 = 0.25
    const resolvedCritCh = modifierResolver.resolve('critChance', 0.05, { characterClass: 'archer' });
    expect(resolvedCritCh).toBeCloseTo(0.25, 4);

    // Crit Damage: Base 2.0 * (1 + 0.30 + 1.00) = 2.0 * 2.30 = 4.60
    const resolvedCritDmg = modifierResolver.resolve('critDamage', 2.0, { characterClass: 'archer' });
    expect(resolvedCritDmg).toBeCloseTo(4.60, 2);

    // Boss Damage: Base 100 * (1 + 0.25) * 1.35 = 125 * 1.35 = 168.75
    const resolvedBoss = modifierResolver.resolve('bossDamage', 100, { characterClass: 'archer', isBoss: true });
    expect(resolvedBoss).toBeCloseTo(168.75, 2);
  });
});
