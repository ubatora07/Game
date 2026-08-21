import { describe, it, expect, beforeEach } from 'vitest';
import { CLASSES, getClassById, getAllClasses } from '../src/content/classes';
import { classSystem, ClassSystem } from '../src/systems/ClassSystem';
import { modifierResolver } from '../src/core/modifiers/ModifierResolver';

describe('Phase 73 — Four Base Classes Suite', () => {
  beforeEach(() => {
    classSystem.respec(true);
    modifierResolver.clearAll();
  });

  it('P73-01: All 4 base classes are properly registered with distinct archetypes', () => {
    const classes = getAllClasses();
    expect(classes.length).toBe(4);

    const mage = getClassById('mage');
    const swordsman = getClassById('swordsman');
    const archer = getClassById('archer');
    const assassin = getClassById('assassin');

    expect(mage).toBeDefined();
    expect(swordsman).toBeDefined();
    expect(archer).toBeDefined();
    expect(assassin).toBeDefined();

    // Stat differentiation
    expect(mage!.baseStats.attackMultiplier).toBeGreaterThan(archer!.baseStats.attackMultiplier);
    expect(archer!.baseStats.attackSpeedMultiplier).toBeGreaterThan(mage!.baseStats.attackSpeedMultiplier);
    expect(assassin!.baseStats.critChanceBonus).toBeGreaterThan(swordsman!.baseStats.critChanceBonus);
    expect(swordsman!.baseStats.bossDamageBonus).toBeGreaterThan(assassin!.baseStats.bossDamageBonus);
  });

  it('P73-02: Selecting a class applies modifiers into Universal Modifier Resolver', () => {
    expect(classSystem.getSelectedClass()).toBeNull();

    const success = classSystem.selectClass('mage');
    expect(success).toBe(true);
    expect(classSystem.getSelectedClassId()).toBe('mage');

    // Base 100 ATK -> Mage 1.30x multiplier -> 130 ATK
    const resolvedAtk = modifierResolver.resolve('attack', 100, { characterClass: 'mage' });
    expect(resolvedAtk).toBe(130);

    // Speed -> Mage 0.90x -> 90
    const resolvedSpd = modifierResolver.resolve('attackSpeed', 100, { characterClass: 'mage' });
    expect(resolvedSpd).toBe(90);
  });

  it('P73-03: Switching class without respec is blocked to prevent exploits', () => {
    classSystem.selectClass('swordsman');
    expect(classSystem.getSelectedClassId()).toBe('swordsman');

    // Attempt switch without force/respec
    const blocked = classSystem.selectClass('assassin', false);
    expect(blocked).toBe(false);
    expect(classSystem.getSelectedClassId()).toBe('swordsman');

    // After respec
    classSystem.respec();
    expect(classSystem.getSelectedClassId()).toBeNull();

    const allowed = classSystem.selectClass('assassin');
    expect(allowed).toBe(true);
    expect(classSystem.getSelectedClassId()).toBe('assassin');
  });

  it('P73-04: Assassin and Archer stat profiles reflect crit and attack speed identity', () => {
    classSystem.selectClass('assassin');

    // Assassin +10% flat crit chance, +75% crit damage
    const critChance = modifierResolver.resolve('critChance', 0.05, { characterClass: 'assassin' });
    expect(critChance).toBeCloseTo(0.15, 4);

    const lootChance = modifierResolver.resolve('lootChance', 1.0, { characterClass: 'assassin' });
    expect(lootChance).toBeCloseTo(1.25, 4);
  });
});
