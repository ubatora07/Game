import { describe, it, expect, beforeEach } from 'vitest';
import { karmaSystem, KarmaSystem } from '../src/systems/KarmaSystem';
import { KarmaAlignmentHUD } from '../src/ui/components/KarmaAlignmentHUD';
import { events } from '../src/core/EventBus';

describe('Phase 87 — Karma System Suite', () => {
  beforeEach(() => {
    karmaSystem.resetAll();
  });

  it('P87-01: Correctly calculates Karma bands across all threshold boundaries', () => {
    expect(KarmaSystem.calculateBand(100)).toBe('virtuous');
    expect(KarmaSystem.calculateBand(50)).toBe('virtuous');
    expect(KarmaSystem.calculateBand(49)).toBe('positive');
    expect(KarmaSystem.calculateBand(15)).toBe('positive');
    expect(KarmaSystem.calculateBand(14)).toBe('neutral');
    expect(KarmaSystem.calculateBand(0)).toBe('neutral');
    expect(KarmaSystem.calculateBand(-14)).toBe('neutral');
    expect(KarmaSystem.calculateBand(-15)).toBe('negative');
    expect(KarmaSystem.calculateBand(-49)).toBe('negative');
    expect(KarmaSystem.calculateBand(-50)).toBe('infamous');
    expect(KarmaSystem.calculateBand(-100)).toBe('infamous');
  });

  it('P87-02: Modifies karma score atomically with clamping [-100, 100] and tracks lifetime totals', () => {
    karmaSystem.setScore(40);
    expect(karmaSystem.getScore()).toBe(40);
    expect(karmaSystem.getKarmaBand()).toBe('positive');

    // Add +20 -> score 60 -> becomes virtuous
    const res1 = karmaSystem.modifyKarma(20, 'saved_village');
    expect(res1.oldBand).toBe('positive');
    expect(res1.newBand).toBe('virtuous');
    expect(karmaSystem.getScore()).toBe(60);

    // Over-clamp positive
    karmaSystem.modifyKarma(80);
    expect(karmaSystem.getScore()).toBe(100);

    // Over-clamp negative
    karmaSystem.modifyKarma(-250);
    expect(karmaSystem.getScore()).toBe(-100);
    expect(karmaSystem.getKarmaBand()).toBe('infamous');
  });

  it('P87-03: Manages major choice historical flags and faction reputation', () => {
    expect(karmaSystem.hasMajorChoiceFlag('spared_bandit_king')).toBe(false);

    karmaSystem.setMajorChoiceFlag('spared_bandit_king', true);
    expect(karmaSystem.hasMajorChoiceFlag('spared_bandit_king')).toBe(true);

    karmaSystem.modifyFactionReputation('order_of_light', 25);
    karmaSystem.modifyFactionReputation('shadow_syndicate', -10);

    expect(karmaSystem.getFactionReputation('order_of_light')).toBe(25);
    expect(karmaSystem.getFactionReputation('shadow_syndicate')).toBe(-10);
  });

  it('P87-04: Samsara Reincarnation resets score to 0 but preserves Karma Legacy major choices', () => {
    karmaSystem.setScore(75);
    karmaSystem.setMajorChoiceFlag('destroyed_evil_altar', true);
    karmaSystem.modifyFactionReputation('order_of_light', 50);

    // Perform Samsara reset
    karmaSystem.resetCurrentLifeKarma();

    expect(karmaSystem.getScore()).toBe(0);
    expect(karmaSystem.getKarmaBand()).toBe('neutral');
    // Karma Legacy preserved
    expect(karmaSystem.hasMajorChoiceFlag('destroyed_evil_altar')).toBe(true);
    expect(karmaSystem.getFactionReputation('order_of_light')).toBe(50);
  });

  it('P87-05: Serialization and UI HUD component render without error', () => {
    karmaSystem.setScore(55);
    karmaSystem.setMajorChoiceFlag('blessed_by_goddess', true);

    const serialized = karmaSystem.serialize();
    expect(serialized.score).toBe(55);
    expect(serialized.band).toBe('virtuous');
    expect(serialized.majorChoiceFlags['blessed_by_goddess']).toBe(true);

    karmaSystem.resetAll();
    expect(karmaSystem.getScore()).toBe(0);

    karmaSystem.deserialize(serialized);
    expect(karmaSystem.getScore()).toBe(55);
    expect(karmaSystem.hasMajorChoiceFlag('blessed_by_goddess')).toBe(true);

    const hud = new KarmaAlignmentHUD();
    expect(hud.getElement().className).toBe('karma-alignment-hud');
    hud.destroy();
  });
});
