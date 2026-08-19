import { describe, it, expect, beforeEach } from 'vitest';
import { SWORDSMAN_NODES } from '../src/content/skillTrees/swordsmanTree';
import { validateTreeStructure } from '../src/content/skillTrees';
import { skillTreeSystem } from '../src/systems/SkillTreeSystem';
import { modifierResolver } from '../src/core/modifiers/ModifierResolver';

describe('Phase 76 — Class Trees: Swordsman Suite', () => {
  beforeEach(() => {
    skillTreeSystem.respecTree(SWORDSMAN_NODES);
    modifierResolver.clearAll();
  });

  it('P76-01: Swordsman tree has exact 15-node 1->2->4->8 structure and passes validation', () => {
    expect(SWORDSMAN_NODES.length).toBe(15);
    const validation = validateTreeStructure(SWORDSMAN_NODES);
    expect(validation.valid).toBe(true);
  });

  it('P76-02: Paladin path delivers massive Party synergy and Quest rewards', () => {
    const t1 = SWORDSMAN_NODES.find((n) => n.id === 'sword_t1_vanguard')!;
    const t2Pal = SWORDSMAN_NODES.find((n) => n.id === 'sword_t2_paladin')!;
    const t3Rad = SWORDSMAN_NODES.find((n) => n.id === 'sword_t3_radiant_aura')!;
    const t4Pal = SWORDSMAN_NODES.find((n) => n.id === 'sword_t4_high_paladin')!;

    skillTreeSystem.unlockNode(t1, SWORDSMAN_NODES);
    skillTreeSystem.unlockNode(t2Pal, SWORDSMAN_NODES);
    skillTreeSystem.unlockNode(t3Rad, SWORDSMAN_NODES);
    skillTreeSystem.unlockNode(t4Pal, SWORDSMAN_NODES);

    // Ally damage: Base 100 * (1 + 0.25 + 0.40 + 0.60) = 100 * 2.25 = 225
    const resolvedAlly = modifierResolver.resolve('allyDamage', 100, { characterClass: 'swordsman' });
    expect(resolvedAlly).toBe(225);

    // Quest crystal rewards: Base 100 * (1 + 0.50) = 150
    const resolvedQuest = modifierResolver.resolve('questRewardMultiplier', 100, { characterClass: 'swordsman' });
    expect(resolvedQuest).toBe(150);
  });

  it('P76-03: Berserker path (Crimson Dragon Warlord) maximizes raw Boss execution and ATK', () => {
    const t1 = SWORDSMAN_NODES.find((n) => n.id === 'sword_t1_vanguard')!;
    const t2Ber = SWORDSMAN_NODES.find((n) => n.id === 'sword_t2_berserker')!;
    const t3Rage = SWORDSMAN_NODES.find((n) => n.id === 'sword_t3_blood_rage')!;
    const t4Warlord = SWORDSMAN_NODES.find((n) => n.id === 'sword_t4_crimson_warlord')!;

    skillTreeSystem.unlockNode(t1, SWORDSMAN_NODES);
    skillTreeSystem.unlockNode(t2Ber, SWORDSMAN_NODES);
    skillTreeSystem.unlockNode(t3Rage, SWORDSMAN_NODES);
    skillTreeSystem.unlockNode(t4Warlord, SWORDSMAN_NODES);

    // ATK: 100 * (1 + 0.20) * 1.25 * 1.35 * 1.60 = 120 * 1.25 * 1.35 * 1.6 = 324
    const resolvedAtk = modifierResolver.resolve('attack', 100, { characterClass: 'swordsman' });
    expect(resolvedAtk).toBeCloseTo(324, 2);

    // Boss damage: Base 100 * (1 + 0.15 + 0.25) * 1.50 = 140 * 1.50 = 210
    const resolvedBoss = modifierResolver.resolve('bossDamage', 100, { characterClass: 'swordsman', isBoss: true });
    expect(resolvedBoss).toBe(210);
  });

  it('P76-04: Aegis Immortal Fortress path heavily buffs Settlement Defense', () => {
    const t1 = SWORDSMAN_NODES.find((n) => n.id === 'sword_t1_vanguard')!;
    const t2Pal = SWORDSMAN_NODES.find((n) => n.id === 'sword_t2_paladin')!;
    const t3Div = SWORDSMAN_NODES.find((n) => n.id === 'sword_t3_divine_guardian')!;
    const t4Aegis = SWORDSMAN_NODES.find((n) => n.id === 'sword_t4_aegis_immortal')!;

    skillTreeSystem.unlockNode(t1, SWORDSMAN_NODES);
    skillTreeSystem.unlockNode(t2Pal, SWORDSMAN_NODES);
    skillTreeSystem.unlockNode(t3Div, SWORDSMAN_NODES);
    skillTreeSystem.unlockNode(t4Aegis, SWORDSMAN_NODES);

    // Settlement defense: Base 100 * (1 + 0.30 + 0.50) * 2.0 = 180 * 2.0 = 360
    const resolvedDef = modifierResolver.resolve('settlementDefense', 100, { characterClass: 'swordsman' });
    expect(resolvedDef).toBe(360);
  });

  it('P76-05: Legendary Kenshi path empowers Crit Chance and Crit Damage', () => {
    const t1 = SWORDSMAN_NODES.find((n) => n.id === 'sword_t1_vanguard')!;
    const t2Ber = SWORDSMAN_NODES.find((n) => n.id === 'sword_t2_berserker')!;
    const t3Duel = SWORDSMAN_NODES.find((n) => n.id === 'sword_t3_blade_duelist')!;
    const t4Kenshi = SWORDSMAN_NODES.find((n) => n.id === 'sword_t4_legendary_kenshi')!;

    skillTreeSystem.unlockNode(t1, SWORDSMAN_NODES);
    skillTreeSystem.unlockNode(t2Ber, SWORDSMAN_NODES);
    skillTreeSystem.unlockNode(t3Duel, SWORDSMAN_NODES);
    skillTreeSystem.unlockNode(t4Kenshi, SWORDSMAN_NODES);

    // Crit Chance: Base 0.05 + 0.08 + 0.15 = 0.28
    const resolvedCritCh = modifierResolver.resolve('critChance', 0.05, { characterClass: 'swordsman' });
    expect(resolvedCritCh).toBeCloseTo(0.28, 4);

    // Speed: Base 100 * (1 + 0.30) = 130
    const resolvedSpd = modifierResolver.resolve('attackSpeed', 100, { characterClass: 'swordsman' });
    expect(resolvedSpd).toBe(130);
  });
});
