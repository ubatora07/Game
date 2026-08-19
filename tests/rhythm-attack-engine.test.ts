import { describe, it, expect, beforeEach } from 'vitest';
import { rhythmAttackSystem } from '../src/systems/RhythmAttackSystem';
import { modifierResolver } from '../src/core/modifiers/ModifierResolver';

describe('Phase 82 — Rhythm Attack Engine Suite', () => {
  beforeEach(() => {
    modifierResolver.clearAll();
    rhythmAttackSystem.resetStreak();
    rhythmAttackSystem.setEnabled(true);
    rhythmAttackSystem.setConfig({
      bpm: 120, // 500ms per beat
      perfectWindowMs: 80,
      goodWindowMs: 160,
      minClickIntervalMs: 90,
      streakTimeoutMs: 1500,
    });
  });

  it('P82-01: Rhythm clock calculates correct 500ms interval for 120 BPM', () => {
    expect(rhythmAttackSystem.getBeatIntervalMs()).toBe(500);
  });

  it('P82-02: Evaluates hits into PERFECT, GOOD, and MISS timing ratings', () => {
    const baseTime = 10000;
    rhythmAttackSystem.setStartTime(baseTime);

    // Exact on-beat hit (delta = 0ms) -> PERFECT
    const hit1 = rhythmAttackSystem.evaluateHit(baseTime);
    expect(hit1.rating).toBe('PERFECT');
    expect(hit1.streak).toBe(1);

    // Hit with 60ms offset (delta = 60ms <= 80ms) -> PERFECT
    const hit2 = rhythmAttackSystem.evaluateHit(baseTime + 560);
    expect(hit2.rating).toBe('PERFECT');
    expect(hit2.streak).toBe(2);

    // Hit with 120ms offset (delta = 120ms <= 160ms) -> GOOD
    const hit3 = rhythmAttackSystem.evaluateHit(baseTime + 1120);
    expect(hit3.rating).toBe('GOOD');
    expect(hit3.streak).toBe(3);

    // Hit with 250ms offset (delta = 250ms > 160ms) -> MISS
    const hit4 = rhythmAttackSystem.evaluateHit(baseTime + 1750);
    expect(hit4.rating).toBe('MISS');
    expect(hit4.streak).toBe(0);
  });

  it('P82-03: Combo streak dynamically registers crit and loot modifiers', () => {
    const baseTime = 20000;
    rhythmAttackSystem.setStartTime(baseTime);

    // Simulate 10 PERFECT hits
    for (let i = 0; i < 10; i++) {
      rhythmAttackSystem.evaluateHit(baseTime + i * 500);
    }

    expect(rhythmAttackSystem.getStreak()).toBe(10);

    // Crit Damage: 10 * 0.01 = +10%
    const resolvedCritDmg = modifierResolver.resolve('critDamage', 2.0);
    expect(resolvedCritDmg).toBeCloseTo(2.0 * 1.10, 2);

    // Crit Chance: 10 * 0.002 = +2% flat
    const resolvedCritCh = modifierResolver.resolve('critChance', 0.05);
    expect(resolvedCritCh).toBeCloseTo(0.07, 4);
  });

  it('P82-04: Streak timeout resets combo if player pauses longer than 1500ms', () => {
    const baseTime = 30000;
    rhythmAttackSystem.evaluateHit(baseTime);
    rhythmAttackSystem.evaluateHit(baseTime + 500);
    expect(rhythmAttackSystem.getStreak()).toBe(2);

    // Pause for 2000ms
    const timeoutHit = rhythmAttackSystem.evaluateHit(baseTime + 2500);
    expect(timeoutHit.streak).toBe(1); // Streak reset and restarted
  });

  it('P82-05: Rapid spam clicks (<90ms) are debounced without destroying streak', () => {
    const baseTime = 40000;
    rhythmAttackSystem.evaluateHit(baseTime);
    expect(rhythmAttackSystem.getStreak()).toBe(1);

    // Spam click after 40ms
    const spamHit = rhythmAttackSystem.evaluateHit(baseTime + 40);
    expect(spamHit.isDebouncedSpam).toBe(true);
    expect(rhythmAttackSystem.getStreak()).toBe(1); // streak preserved
  });
});
