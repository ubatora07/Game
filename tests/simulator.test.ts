import { describe, it, expect } from 'vitest';
import { EconomySimulator } from '../src/economy/EconomySimulator';

describe('Headless Economy Simulation Tests', () => {
  it('should make meaningful progress in the first 60 seconds (1m)', () => {
    const res = EconomySimulator.simulate(60, 2);

    expect(res.finalPower).toBeGreaterThan(50);
    expect(res.finalGold).toBeGreaterThanOrEqual(0);
    expect(res.totalBuildings).toBeGreaterThanOrEqual(1);
    expect(res.powerPerSec).toBeGreaterThan(0);
  });

  it('should reach higher ranks and buildings in 5 minutes (300s)', () => {
    const res = EconomySimulator.simulate(300, 2);

    expect(res.finalPower).toBeGreaterThan(500);
    expect(res.totalBuildings).toBeGreaterThan(3);
  });

  it('should scale smoothly over 15m, 30m, 1h without NaN or stalled progression', () => {
    const res15m = EconomySimulator.simulate(900, 1.5);
    const res30m = EconomySimulator.simulate(1800, 1.5);
    const res1h = EconomySimulator.simulate(3600, 1.5);

    expect(res15m.finalPower).toBeGreaterThan(5000);
    expect(res30m.finalPower).toBeGreaterThan(res15m.finalPower);
    expect(res1h.finalPower).toBeGreaterThan(res30m.finalPower);
    expect(isFinite(res1h.finalPower)).toBe(true);
    expect(isNaN(res1h.finalPower)).toBe(false);
  });

  it('should simulate long-term progression (24h) with prestige acceleration', () => {
    const res24h = EconomySimulator.simulate(86400, 0.5);

    expect(res24h.finalPower).toBeGreaterThan(1e6);
    expect(res24h.totalBuildings).toBeGreaterThan(15);
    expect(isFinite(res24h.finalPower)).toBe(true);
  });
});
