import { describe, it, expect, beforeEach } from 'vitest';
import { rhythmAttackSystem } from '../src/systems/RhythmAttackSystem';
import { modifierResolver } from '../src/core/modifiers/ModifierResolver';

describe('Phase 83 — Rhythm Reward Curve Suite', () => {
  beforeEach(() => {
    modifierResolver.clearAll();
    rhythmAttackSystem.resetStreak();
    rhythmAttackSystem.setEnabled(true);
    rhythmAttackSystem.setConfig({
      bpm: 120,
      perfectWindowMs: 80,
      goodWindowMs: 160,
      minClickIntervalMs: 90,
      streakTimeoutMs: 1500,
    });
  });

  it('P83-01: Tier 1 (0-15s / Streak 30) delivers initial build-up bonuses', () => {
    const baseTime = 10000;
    rhythmAttackSystem.setStartTime(baseTime);

    for (let i = 0; i < 30; i++) {
      rhythmAttackSystem.evaluateHit(baseTime + i * 500);
    }

    expect(rhythmAttackSystem.getStreak()).toBe(30);

    // Crit Damage: 30 * 0.01 = +30%
    const resolvedCritDmg = modifierResolver.resolve('critDamage', 2.0);
    expect(resolvedCritDmg).toBeCloseTo(2.60, 2);

    // Crit Chance: 30 * 0.002 = +6%
    const resolvedCritCh = modifierResolver.resolve('critChance', 0.05);
    expect(resolvedCritCh).toBeCloseTo(0.11, 4);
  });

  it('P83-02: Tier 2 (15-60s / Streak 120) scales combat surge and attack speed', () => {
    const baseTime = 20000;
    rhythmAttackSystem.setStartTime(baseTime);

    for (let i = 0; i < 120; i++) {
      rhythmAttackSystem.evaluateHit(baseTime + i * 500);
    }

    expect(rhythmAttackSystem.getStreak()).toBe(120);

    // Crit Damage: 0.30 + (90 * 0.005) = +75%
    const resolvedCritDmg = modifierResolver.resolve('critDamage', 2.0);
    expect(resolvedCritDmg).toBeCloseTo(3.50, 2);

    // Attack Speed: +25%
    const resolvedSpd = modifierResolver.resolve('attackSpeed', 100);
    expect(resolvedSpd).toBeCloseTo(125, 2);
  });

  it('P83-03: Tier 3 (1-2 min / Streak 240) activates fortune resonance (Loot + Gold)', () => {
    const baseTime = 30000;
    rhythmAttackSystem.setStartTime(baseTime);

    for (let i = 0; i < 240; i++) {
      rhythmAttackSystem.evaluateHit(baseTime + i * 500);
    }

    expect(rhythmAttackSystem.getStreak()).toBe(240);

    // Loot Multiplier: +60%
    const resolvedLoot = modifierResolver.resolve('lootMultiplier', 1.0);
    expect(resolvedLoot).toBeCloseTo(1.60, 2);

    // Gold Multiplier: +50%
    const resolvedGold = modifierResolver.resolve('goldMultiplier', 1.0);
    expect(resolvedGold).toBeCloseTo(1.50, 2);
  });

  it('P83-04: Tier 4 (2-5 min / Streak 600) unlocks soul mastery (1.35x All Damage)', () => {
    const baseTime = 40000;
    rhythmAttackSystem.setStartTime(baseTime);

    for (let i = 0; i < 600; i++) {
      rhythmAttackSystem.evaluateHit(baseTime + i * 500);
    }

    expect(rhythmAttackSystem.getStreak()).toBe(600);

    // All damage multiplier: 1.35x
    const resolvedAtk = modifierResolver.resolve('attack', 100);
    expect(resolvedAtk).toBeCloseTo(135, 2);
  });

  it('P83-05: Tier 5 (5+ min / Streak 1000) enforces strict diminishing returns caps', () => {
    const baseTime = 50000;
    rhythmAttackSystem.setStartTime(baseTime);

    for (let i = 0; i < 1000; i++) {
      rhythmAttackSystem.evaluateHit(baseTime + i * 500);
    }

    expect(rhythmAttackSystem.getStreak()).toBe(1000);

    // Caps check
    const resolvedCritDmg = modifierResolver.resolve('critDamage', 2.0);
    // Base 2.0 * (1 + 1.20 max) = 4.40
    expect(resolvedCritDmg).toBeCloseTo(4.40, 2);

    const resolvedLoot = modifierResolver.resolve('lootMultiplier', 1.0);
    // Max +75% = 1.75
    expect(resolvedLoot).toBeCloseTo(1.75, 2);

    const resolvedAtk = modifierResolver.resolve('attack', 100);
    // Max 1.40x = 140
    expect(resolvedAtk).toBeCloseTo(140, 2);
  });
});
