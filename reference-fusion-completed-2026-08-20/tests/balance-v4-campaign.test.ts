import { describe, it, expect } from 'vitest';
import { EconomySimulator } from '../src/economy/EconomySimulator';

describe('Phase 52 — Balance v4: Campaign Integration Simulation Suite', () => {
  it('P52-01: 1m Horizon — Clears initial World 1 encounters smoothly', () => {
    const res = EconomySimulator.simulate(60, 'ACTIVE');

    expect(res.finalPower).toBeGreaterThan(50);
    expect(res.enemiesDefeated).toBeGreaterThanOrEqual(3);
    expect(res.campaignGoldSharePct).toBeGreaterThan(0);
    expect(isFinite(res.finalPower)).toBe(true);
    expect(isNaN(res.finalPower)).toBe(false);
  });

  it('P52-02: 5m Horizon — Reaches early stages (1-2 / 1-3) with hero synergy', () => {
    const res = EconomySimulator.simulate(300, 'OPTIMAL');

    expect(res.finalPower).toBeGreaterThan(500);
    expect(res.stagesCleared).toBeGreaterThanOrEqual(1);
    expect(res.enemiesDefeated).toBeGreaterThanOrEqual(10);
    expect(res.totalBuildings).toBeGreaterThan(3);
  });

  it('P52-03: 15m & 30m Horizons — Smooth progression without dead zones or NaN stalls', () => {
    const res15m = EconomySimulator.simulate(900, 'ACTIVE');
    const res30m = EconomySimulator.simulate(1800, 'ACTIVE');

    expect(res15m.finalPower).toBeGreaterThan(5000);
    expect(res30m.finalPower).toBeGreaterThan(res15m.finalPower);
    expect(res30m.stagesCleared).toBeGreaterThanOrEqual(res15m.stagesCleared);
    expect(res30m.enemiesDefeated).toBeGreaterThan(res15m.enemiesDefeated);
  });

  it('P52-04: Income Distribution Check — Sect and Campaign coexist harmoniously', () => {
    const res5m = EconomySimulator.simulate(300, 'OPTIMAL');
    const res1h = EconomySimulator.simulate(3600, 'OPTIMAL');

    expect(res5m.campaignGoldSharePct).toBeGreaterThanOrEqual(10);
    expect(res1h.sectGoldSharePct).toBeGreaterThanOrEqual(50);
    expect(res1h.totalBuildings).toBeGreaterThan(10);
  });

  it('P52-05: Strategy Comparison — ACTIVE outperforms IDLE and CASUAL', () => {
    const active = EconomySimulator.simulate(600, 'ACTIVE');
    const casual = EconomySimulator.simulate(600, 'CASUAL');
    const idle = EconomySimulator.simulate(600, 'IDLE');

    expect(active.finalPower).toBeGreaterThan(casual.finalPower);
    expect(casual.finalPower).toBeGreaterThan(idle.finalPower);
    expect(active.stagesCleared).toBeGreaterThanOrEqual(idle.stagesCleared);
  });

  it('P52-06: Multi-Run Samsara Prestige — Run 3 demonstrates significant acceleration over Run 1', () => {
    const multiRun = EconomySimulator.simulateMultiRun(3, 1800); // 3 runs of 30m each

    expect(multiRun.length).toBe(3);
    expect(multiRun[0].soulsEarned).toBeGreaterThan(0);
    expect(multiRun[2].totalSouls).toBeGreaterThan(multiRun[0].totalSouls);
    expect(multiRun[2].finalPower).toBeGreaterThan(multiRun[0].finalPower);
  });
});
