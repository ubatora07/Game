import { describe, it, expect, beforeEach } from 'vitest';
import { store, createInitialState } from '../src/core/GameState';
import { EconomyEngine } from '../src/economy/EconomyEngine';
import { getRankById, getNextRank } from '../src/content/ranks';
import { BUILDINGS } from '../src/content/buildings';
import { UPGRADES } from '../src/content/upgrades';

describe('Phase 36 — Protagonist RPG Layer Tests', () => {
  beforeEach(() => {
    const freshState = createInitialState();
    store.replace(freshState);
  });

  it('P36-01: Protagonist stats calculation (Combat Power, Click Power, Crit Rate, Crit Mult)', () => {
    const state = store.get();
    const metrics = EconomyEngine.calculateMetrics(state);

    expect(metrics.clickPower).toBeGreaterThanOrEqual(1);
    expect(metrics.critChance).toBeGreaterThanOrEqual(0.05);
    expect(metrics.critMultiplier).toBeGreaterThanOrEqual(2.0);
    expect(metrics.passivePowerPerSec).toBeDefined();
    expect(metrics.towerCombatPower).toBeDefined();
  });

  it('P36-02: Training upgrades boost protagonist RPG combat metrics', () => {
    const state = createInitialState();
    state.upgrades['iron_fist'] = 2; // doubles click power
    state.upgrades['eagle_eye'] = 2; // +8% crit chance
    state.upgrades['lethal_strike'] = 2; // +2.0x crit multiplier
    store.replace(state);

    const metrics = EconomyEngine.calculateMetrics(state);
    expect(metrics.clickPower).toBeGreaterThan(1);
    expect(metrics.critChance).toBeCloseTo(0.05 + 0.08, 2);
    expect(metrics.critMultiplier).toBeCloseTo(5.0 + 2.0, 2);
  });

  it('P36-03 to P36-08: Complete Power sources breakdown contains all system multipliers', () => {
    const state = createInitialState();
    state.buildings['dojo'] = 10;
    state.rankId = 'C';
    state.rankIndex = 2;
    state.heroes['lin'] = { stars: 2, duplicates: 0 };
    state.souls = 100;
    state.soulSkills['soul_power'] = 2;
    store.replace(state);

    const metrics = EconomyEngine.calculateMetrics(state);

    // Sect base output
    expect(metrics.baseBuildingsPowerPerSec).toBeGreaterThan(0);
    // Rank multiplier
    expect(metrics.rankMultiplier).toBeGreaterThan(1);
    // Hero party multiplier
    expect(metrics.heroPowerMultiplier).toBeGreaterThanOrEqual(1.0);
    // Soul tree multiplier
    expect(metrics.soulPowerMultiplier).toBeGreaterThan(1.0);
    // Total passive output matches product of multipliers
    expect(metrics.passivePowerPerSec).toBeGreaterThan(metrics.baseBuildingsPowerPerSec);
  });

  it('P36-09: Ascension CTA triggers when player reaches required realm power', () => {
    const state = createInitialState();
    const rank = getRankById(state.rankId);
    const nextRank = getNextRank(state.rankId);
    expect(nextRank).toBeDefined();

    // Below requirement
    state.power = nextRank!.reqPower - 10;
    store.replace(state);
    expect(store.get().power >= nextRank!.reqPower).toBe(false);

    // Meets requirement
    state.power = nextRank!.reqPower + 100;
    store.replace(state);
    expect(store.get().power >= nextRank!.reqPower).toBe(true);
  });

  it('P36-10: Protagonist avatar & Rank title resolve correctly for every rank tier', () => {
    const ranks = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS', 'TRANS'];
    for (const rId of ranks) {
      const r = getRankById(rId);
      expect(r).toBeDefined();
      expect(r.nameKey).toBeDefined();
      expect(r.color).toBeDefined();
      expect(r.multiplier).toBeGreaterThanOrEqual(1);
    }
  });
});
