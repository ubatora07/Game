import { describe, it, expect, beforeEach } from 'vitest';
import { ASSASSIN_NODES } from '../src/content/skillTrees/assassinTree';
import { validateTreeStructure } from '../src/content/skillTrees';
import { skillTreeSystem } from '../src/systems/SkillTreeSystem';
import { modifierResolver } from '../src/core/modifiers/ModifierResolver';

describe('Phase 78 — Class Trees: Assassin Suite', () => {
  beforeEach(() => {
    skillTreeSystem.respecTree(ASSASSIN_NODES);
    modifierResolver.clearAll();
  });

  it('P78-01: Assassin tree has exact 15-node 1->2->4->8 structure and passes validation', () => {
    expect(ASSASSIN_NODES.length).toBe(15);
    const validation = validateTreeStructure(ASSASSIN_NODES);
    expect(validation.valid).toBe(true);
  });

  it('P78-02: Fatal Venom & Viper God path stacks extreme poison crit and manual click power', () => {
    const t1 = ASSASSIN_NODES.find((n) => n.id === 'assassin_t1_shadow')!;
    const t2Exec = ASSASSIN_NODES.find((n) => n.id === 'assassin_t2_lethal_execute')!;
    const t3Venom = ASSASSIN_NODES.find((n) => n.id === 'assassin_t3_fatal_venom')!;
    const t4Viper = ASSASSIN_NODES.find((n) => n.id === 'assassin_t4_corrosive_sovereign')!;

    skillTreeSystem.unlockNode(t1, ASSASSIN_NODES);
    skillTreeSystem.unlockNode(t2Exec, ASSASSIN_NODES);
    skillTreeSystem.unlockNode(t3Venom, ASSASSIN_NODES);
    skillTreeSystem.unlockNode(t4Viper, ASSASSIN_NODES);

    // Crit Damage: Base 2.0 * (1 + 0.30 + 0.60 + 1.00) = 2.0 * 2.90 = 5.80
    const resolvedCritDmg = modifierResolver.resolve('critDamage', 2.0, { characterClass: 'assassin' });
    expect(resolvedCritDmg).toBeCloseTo(5.80, 2);

    // Manual attack: Base 100 * (1 + 0.30 + 0.50) = 180
    const resolvedManual = modifierResolver.resolve('manualAttackDamage', 100, { characterClass: 'assassin', isManual: true });
    expect(resolvedManual).toBe(180);
  });

  it('P78-03: Abyssal Shadow Overlord path delivers massive raw ATK and Boss execution', () => {
    const t1 = ASSASSIN_NODES.find((n) => n.id === 'assassin_t1_shadow')!;
    const t2Exec = ASSASSIN_NODES.find((n) => n.id === 'assassin_t2_lethal_execute')!;
    const t3Mark = ASSASSIN_NODES.find((n) => n.id === 'assassin_t3_phantom_execution')!;
    const t4Over = ASSASSIN_NODES.find((n) => n.id === 'assassin_t4_shadow_overlord')!;

    skillTreeSystem.unlockNode(t1, ASSASSIN_NODES);
    skillTreeSystem.unlockNode(t2Exec, ASSASSIN_NODES);
    skillTreeSystem.unlockNode(t3Mark, ASSASSIN_NODES);
    skillTreeSystem.unlockNode(t4Over, ASSASSIN_NODES);

    // ATK: Base 100 * 1.35 * 1.60 = 216
    const resolvedAtk = modifierResolver.resolve('attack', 100, { characterClass: 'assassin' });
    expect(resolvedAtk).toBeCloseTo(216, 2);

    // Boss damage: Base 100 * (1 + 0.30 + 0.40) = 170
    const resolvedBoss = modifierResolver.resolve('bossDamage', 100, { characterClass: 'assassin', isBoss: true });
    expect(resolvedBoss).toBe(170);
  });

  it('P78-04: Black Market Syndicate King path doubles Gold and maximizes Rare Events', () => {
    const t1 = ASSASSIN_NODES.find((n) => n.id === 'assassin_t1_shadow')!;
    const t2Brok = ASSASSIN_NODES.find((n) => n.id === 'assassin_t2_shadow_broker')!;
    const t3Thief = ASSASSIN_NODES.find((n) => n.id === 'assassin_t3_master_thief')!;
    const t4Synd = ASSASSIN_NODES.find((n) => n.id === 'assassin_t4_syndicate_king')!;

    skillTreeSystem.unlockNode(t1, ASSASSIN_NODES);
    skillTreeSystem.unlockNode(t2Brok, ASSASSIN_NODES);
    skillTreeSystem.unlockNode(t3Thief, ASSASSIN_NODES);
    skillTreeSystem.unlockNode(t4Synd, ASSASSIN_NODES);

    // Gold: Base 1.0 * (1 + 0.50) * 2.0 = 3.0
    const resolvedGold = modifierResolver.resolve('goldMultiplier', 1.0, { characterClass: 'assassin' });
    expect(resolvedGold).toBe(3.0);

    // Rare Event Chance: Base 1.0 * (1 + 0.30 + 1.00) = 2.30
    const resolvedRare = modifierResolver.resolve('rareEventChance', 1.0, { characterClass: 'assassin' });
    expect(resolvedRare).toBeCloseTo(2.30, 2);
  });

  it('P78-05: Voidwalker Primordial Stalker delivers highest single-hit Crit Potential', () => {
    const t1 = ASSASSIN_NODES.find((n) => n.id === 'assassin_t1_shadow')!;
    const t2Brok = ASSASSIN_NODES.find((n) => n.id === 'assassin_t2_shadow_broker')!;
    const t3Veil = ASSASSIN_NODES.find((n) => n.id === 'assassin_t3_shadow_veil')!;
    const t4Void = ASSASSIN_NODES.find((n) => n.id === 'assassin_t4_voidwalker_god')!;

    skillTreeSystem.unlockNode(t1, ASSASSIN_NODES);
    skillTreeSystem.unlockNode(t2Brok, ASSASSIN_NODES);
    skillTreeSystem.unlockNode(t3Veil, ASSASSIN_NODES);
    skillTreeSystem.unlockNode(t4Void, ASSASSIN_NODES);

    // Crit Chance: Base 0.05 + 0.10 (T1) + 0.12 (T3) + 0.25 (T4) = 0.52 (52% Crit Chance)
    const resolvedCritCh = modifierResolver.resolve('critChance', 0.05, { characterClass: 'assassin' });
    expect(resolvedCritCh).toBeCloseTo(0.52, 4);

    // Crit Damage: Base 2.0 * (1 + 0.30 + 1.50) = 2.0 * 2.80 = 5.60
    const resolvedCritDmg = modifierResolver.resolve('critDamage', 2.0, { characterClass: 'assassin' });
    expect(resolvedCritDmg).toBeCloseTo(5.60, 2);
  });
});
