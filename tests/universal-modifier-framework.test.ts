import { describe, it, expect, beforeEach } from 'vitest';
import { modifierResolver, ModifierResolver } from '../src/core/modifiers/ModifierResolver';
import { GameModifier } from '../src/core/modifiers/ModifierTypes';

describe('Phase 72 — Universal Modifier / Build Framework Suite', () => {
  beforeEach(() => {
    modifierResolver.clearAll();
  });

  it('P72-01: Correctly stacks flat, percent_add, and multiplier modifiers', () => {
    // Base ATK = 100
    // Flat +20
    // PercentAdd +50% (+0.5)
    // Multiplier x2.0
    // Expected: (100 + 20) * (1 + 0.5) * 2.0 = 120 * 1.5 * 2.0 = 360

    modifierResolver.registerModifier({
      id: 'mod_flat_atk',
      target: 'attack',
      type: 'flat',
      value: 20,
      source: 'Training Dojo',
      sourceType: 'skill_node',
    });

    modifierResolver.registerModifier({
      id: 'mod_pct_atk',
      target: 'attack',
      type: 'percent_add',
      value: 0.5,
      source: 'Relic: Dragon Horn',
      sourceType: 'relic',
    });

    modifierResolver.registerModifier({
      id: 'mod_mult_atk',
      target: 'attack',
      type: 'multiplier',
      value: 2.0,
      source: 'Rank S Aura',
      sourceType: 'class',
    });

    const result = modifierResolver.resolve('attack', 100);
    expect(result).toBe(360);

    const breakdown = modifierResolver.getBreakdown('attack', 100);
    expect(breakdown.baseValue).toBe(100);
    expect(breakdown.flatTotal).toBe(20);
    expect(breakdown.percentAddTotal).toBe(0.5);
    expect(breakdown.multiplierTotal).toBe(2.0);
    expect(breakdown.finalValue).toBe(360);
    expect(breakdown.appliedModifiers.length).toBe(3);
  });

  it('P72-02: Conditional modifiers evaluate context dynamically', () => {
    modifierResolver.registerModifier({
      id: 'mod_boss_slayer',
      target: 'attack',
      type: 'multiplier',
      value: 1.5,
      source: 'Passive: Boss Slayer',
      sourceType: 'skill_node',
      condition: (ctx) => ctx.isBoss === true,
    });

    // Against normal mob
    expect(modifierResolver.resolve('attack', 100, { isBoss: false })).toBe(100);

    // Against boss
    expect(modifierResolver.resolve('attack', 100, { isBoss: true })).toBe(150);
  });

  it('P72-03: Class tag modifiers filter by active character class', () => {
    modifierResolver.registerModifier({
      id: 'mod_mage_arcane_burst',
      target: 'attack',
      type: 'percent_add',
      value: 0.4,
      source: 'Mage Mastery',
      sourceType: 'class',
      classTag: 'mage',
    });

    // As Swordsman
    expect(modifierResolver.resolve('attack', 100, { characterClass: 'swordsman' })).toBe(100);

    // As Mage
    expect(modifierResolver.resolve('attack', 100, { characterClass: 'mage' })).toBe(140);
  });

  it('P72-04: Prevents double-application via unique modifier IDs', () => {
    const mod: GameModifier = {
      id: 'mod_unique_buff',
      target: 'critChance',
      type: 'percent_add',
      value: 0.1,
      source: 'Hero Aura',
      sourceType: 'hero',
    };

    modifierResolver.registerModifier(mod);
    modifierResolver.registerModifier(mod); // Register again
    modifierResolver.registerModifier(mod); // Register again

    expect(modifierResolver.getModifierCount()).toBe(1);
    expect(modifierResolver.resolve('critChance', 0.05)).toBeCloseTo(0.05 * 1.1, 4);
  });

  it('P72-05: Clears modifiers by source type cleanly', () => {
    modifierResolver.registerModifier({
      id: 'mod_temp_buff',
      target: 'goldMultiplier',
      type: 'multiplier',
      value: 2.0,
      source: 'Potion of Greed',
      sourceType: 'temporary',
    });

    modifierResolver.registerModifier({
      id: 'mod_relic_gold',
      target: 'goldMultiplier',
      type: 'multiplier',
      value: 1.25,
      source: 'Golden Coin Relic',
      sourceType: 'relic',
    });

    expect(modifierResolver.resolve('goldMultiplier', 1.0)).toBe(2.5);

    modifierResolver.clearBySourceType('temporary');
    expect(modifierResolver.resolve('goldMultiplier', 1.0)).toBe(1.25);
  });
});
