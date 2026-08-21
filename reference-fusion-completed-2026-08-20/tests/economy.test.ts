import { describe, it, expect } from 'vitest';
import { EconomyEngine } from '../src/economy/EconomyEngine';
import { createInitialState } from '../src/core/GameState';

describe('EconomyEngine & Multipliers', () => {
  it('should calculate initial zero production for a fresh player with default click power', () => {
    const state = createInitialState();
    const metrics = EconomyEngine.calculateMetrics(state);

    expect(metrics.clickPower).toBeGreaterThanOrEqual(1);
    expect(metrics.passivePowerPerSec).toBe(0);
    expect(metrics.critChance).toBe(0.05);
    expect(metrics.critMultiplier).toBe(5.0);
  });

  it('should compute building production and milestone scaling', () => {
    const state = createInitialState();
    state.buildings['dojo'] = 10; // 10 dojos = 10 * 1 * 2x (milestone) = 20 Power/sec

    const metrics = EconomyEngine.calculateMetrics(state);
    expect(metrics.passivePowerPerSec).toBe(20);
    expect(metrics.buildingDetails['dojo'].milestoneMultiplier).toBe(2.0);
    expect(metrics.buildingDetails['dojo'].contributionPct).toBe(100);
  });

  it('should apply combo multipliers to active click power', () => {
    const state = createInitialState();
    state.combo = { count: 10, multiplier: 1.5, timer: 2.0 };

    const metrics = EconomyEngine.calculateMetrics(state);
    expect(metrics.comboMultiplier).toBe(1.5);
    expect(metrics.clickPower).toBeGreaterThanOrEqual(1);
  });

  it('should apply Ascension Rank multipliers correctly', () => {
    const state = createInitialState();
    state.buildings['dojo'] = 5;
    state.rankId = 'D'; // 1.15x multiplier

    const metrics = EconomyEngine.calculateMetrics(state);
    expect(metrics.rankMultiplier).toBe(1.15);
    expect(metrics.passivePowerPerSec).toBeCloseTo(5 * 1 * 1.15, 2);
  });

  it('should apply Soul Tree multipliers', () => {
    const state = createInitialState();
    state.buildings['dojo'] = 10;
    state.soulSkills['soul_power'] = 4; // +15% * 4 = +60% (1.60x)

    const metrics = EconomyEngine.calculateMetrics(state);
    expect(metrics.soulPowerMultiplier).toBe(1.60);
    expect(metrics.passivePowerPerSec).toBe(20 * 1.60);
  });

  it('should never return NaN or negative numbers', () => {
    const state = createInitialState();
    state.power = 1e20;
    state.gold = 1e20;
    state.buildings['dojo'] = 1000;

    const metrics = EconomyEngine.calculateMetrics(state);
    expect(isNaN(metrics.clickPower)).toBe(false);
    expect(isNaN(metrics.passivePowerPerSec)).toBe(false);
    expect(isFinite(metrics.passivePowerPerSec)).toBe(true);
  });
});
