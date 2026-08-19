import { describe, it, expect } from 'vitest';
import { RPGCoreSimulator, RPGSimulationProfile } from '../src/economy/RPGCoreSimulator';

describe('Phase 92 — RPG Core Balance Pass Suite', () => {
  it('P92-01: Simulates 4 Classes across active/idle profiles and maintains balanced DPS parity', () => {
    const classes: ('mage' | 'swordsman' | 'archer' | 'assassin')[] = [
      'mage',
      'swordsman',
      'archer',
      'assassin',
    ];

    const results = classes.map((c) =>
      RPGCoreSimulator.runSimulation({
        name: `Test_${c}`,
        primaryClass: c,
        playstyle: 'active',
        teamMode: 'single',
        rhythmEnabled: true,
        karmaAlignment: 'neutral',
        marketStrategy: 'none',
      }, 600)
    );

    // Verify all 4 classes achieve meaningful progression in 10 minutes
    results.forEach((res) => {
      expect(res.stagesCleared).toBeGreaterThanOrEqual(25);
      expect(res.effectiveDps).toBeGreaterThan(150);
      expect(res.totalGoldEarned).toBeGreaterThan(1000);
      expect(res.totalSoulsEarned).toBeGreaterThan(0);
    });

    // DPS spread across classes should be within healthy +/- 35% balance corridor
    const dpsValues = results.map((r) => r.effectiveDps);
    const maxDps = Math.max(...dpsValues);
    const minDps = Math.min(...dpsValues);
    expect(maxDps / minDps).toBeLessThan(1.5);
  });

  it('P92-02: Active Rhythm Playstyle yields significant but bounded advantage over Pure Idle', () => {
    const idleRes = RPGCoreSimulator.runSimulation({
      name: 'Idle Swordsman',
      primaryClass: 'swordsman',
      playstyle: 'idle',
      teamMode: 'single',
      rhythmEnabled: false,
      karmaAlignment: 'neutral',
      marketStrategy: 'none',
    }, 600);

    const rhythmRes = RPGCoreSimulator.runSimulation({
      name: 'Active Rhythm Swordsman',
      primaryClass: 'swordsman',
      playstyle: 'active',
      teamMode: 'single',
      rhythmEnabled: true,
      rhythmAccuracyPct: 95,
      karmaAlignment: 'neutral',
      marketStrategy: 'none',
    }, 600);

    // Active Rhythm should clear more stages and earn more gold
    expect(rhythmRes.stagesCleared).toBeGreaterThan(idleRes.stagesCleared);
    expect(rhythmRes.effectiveDps).toBeGreaterThan(idleRes.effectiveDps * 1.8);
    expect(rhythmRes.effectiveDps).toBeLessThan(idleRes.effectiveDps * 3.5); // Bounded, anti-runaway
  });

  it('P92-03: Second Character Awakening provides balanced DPS contribution without breaking early curve', () => {
    const singleCharRes = RPGCoreSimulator.runSimulation({
      name: 'Single Mage',
      primaryClass: 'mage',
      playstyle: 'idle',
      teamMode: 'single',
      rhythmEnabled: false,
      karmaAlignment: 'neutral',
      marketStrategy: 'none',
    }, 600);

    const dualCharRes = RPGCoreSimulator.runSimulation({
      name: 'Dual Mage + Swordsman',
      primaryClass: 'mage',
      secondaryClass: 'swordsman',
      playstyle: 'idle',
      teamMode: 'dual',
      rhythmEnabled: false,
      karmaAlignment: 'neutral',
      marketStrategy: 'none',
    }, 600);

    expect(dualCharRes.secondCharacterContributionPct).toBeGreaterThanOrEqual(25);
    expect(dualCharRes.secondCharacterContributionPct).toBeLessThanOrEqual(40);
    expect(dualCharRes.effectiveDps).toBeGreaterThan(singleCharRes.effectiveDps);
    expect(dualCharRes.stagesCleared).toBeGreaterThanOrEqual(singleCharRes.stagesCleared);
  });

  it('P92-04: Karma Alignment and Market Elixirs establish distinct strategic tradeoffs', () => {
    const positiveKarmaRes = RPGCoreSimulator.runSimulation({
      name: 'Virtuous Mage',
      primaryClass: 'mage',
      playstyle: 'active',
      teamMode: 'single',
      rhythmEnabled: true,
      karmaAlignment: 'positive',
      marketStrategy: 'elixirs_only',
    }, 600);

    const negativeKarmaRes = RPGCoreSimulator.runSimulation({
      name: 'Infamous Mage',
      primaryClass: 'mage',
      playstyle: 'active',
      teamMode: 'single',
      rhythmEnabled: true,
      karmaAlignment: 'negative',
      marketStrategy: 'none',
    }, 600);

    // Virtuous has higher DPS boost from blessings
    expect(positiveKarmaRes.effectiveDps).toBeGreaterThan(negativeKarmaRes.effectiveDps);
    // Infamous has high raw gold extraction from plunder
    expect(negativeKarmaRes.totalGoldEarned).toBeGreaterThan(0);
  });
});
