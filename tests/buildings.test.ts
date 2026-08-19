import { describe, it, expect } from 'vitest';
import { BUILDINGS, calculateBuildingCost, calculateMaxAffordableBuildings, getBuildingMilestoneMultiplier } from '../src/content/buildings';

describe('10-Tier Building System & Milestones', () => {
  it('should have 10 building tiers defined with scaling costs', () => {
    expect(BUILDINGS.length).toBe(10);
    expect(BUILDINGS[0].id).toBe('dojo');
    expect(BUILDINGS[9].id).toBe('infinite_core');

    for (let i = 1; i < BUILDINGS.length; i++) {
      expect(BUILDINGS[i].baseCost).toBeGreaterThan(BUILDINGS[i - 1].baseCost);
      expect(BUILDINGS[i].baseProduction).toBeGreaterThan(BUILDINGS[i - 1].baseProduction);
    }
  });

  it('should calculate exponential building costs correctly', () => {
    const dojo = BUILDINGS[0];
    const cost0 = calculateBuildingCost(dojo, 0, 1);
    const cost1 = calculateBuildingCost(dojo, 1, 1);
    const cost10 = calculateBuildingCost(dojo, 0, 10);
    const cost100 = calculateBuildingCost(dojo, 0, 100);

    expect(cost0).toBe(10);
    expect(cost1).toBeGreaterThan(cost0);
    expect(cost10).toBeGreaterThan(cost1 * 10);
    expect(cost100).toBeGreaterThan(cost10 * 10);
  });

  it('should apply multipliers for milestones (10, 25, 50, 100, 150, 200, 300, 400, 500, 750, 1000)', () => {
    expect(getBuildingMilestoneMultiplier(0)).toBe(1.0);
    expect(getBuildingMilestoneMultiplier(9)).toBe(1.0);
    expect(getBuildingMilestoneMultiplier(10)).toBe(2.0);
    expect(getBuildingMilestoneMultiplier(24)).toBe(2.0);
    expect(getBuildingMilestoneMultiplier(25)).toBe(4.0);
    expect(getBuildingMilestoneMultiplier(50)).toBe(8.0);
    expect(getBuildingMilestoneMultiplier(100)).toBe(16.0);
    expect(getBuildingMilestoneMultiplier(150)).toBe(24.0); // 16 * 1.5
    expect(getBuildingMilestoneMultiplier(200)).toBe(48.0); // 24 * 2
  });

  it('should accurately calculate max affordable buildings with geometric series', () => {
    const chamber = BUILDINGS[1]; // baseCost 100, growth 1.15
    const maxInfo = calculateMaxAffordableBuildings(chamber, 0, 500);

    expect(maxInfo.count).toBeGreaterThan(0);
    expect(maxInfo.totalCost).toBeLessThanOrEqual(500);

    // Verify purchasing 1 more is unaffordable
    const costPlusOne = calculateBuildingCost(chamber, 0, maxInfo.count + 1);
    expect(costPlusOne).toBeGreaterThan(500);
  });
});
