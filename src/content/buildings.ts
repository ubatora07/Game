export interface BuildingDefinition {
  id: string;
  nameKey: string;
  descKey: string;
  icon: string;
  baseCost: number;
  costGrowth: number; // 1.15
  baseProduction: number; // Base Power/sec per building
  baseGoldProduction: number; // Base Gold/sec per building
  requiredRankIndex: number;
}

export interface MilestoneTier {
  count: number;
  multiplier: number;
}

export const BUILDING_MILESTONES: readonly MilestoneTier[] = [
  { count: 10, multiplier: 2.0 },
  { count: 25, multiplier: 2.0 },
  { count: 50, multiplier: 2.0 },
  { count: 100, multiplier: 2.0 },
  { count: 150, multiplier: 1.5 },
  { count: 200, multiplier: 2.0 },
  { count: 300, multiplier: 1.5 },
  { count: 400, multiplier: 1.5 },
  { count: 500, multiplier: 2.0 },
  { count: 750, multiplier: 2.0 },
  { count: 1000, multiplier: 3.0 }
] as const;

export const BUILDINGS: readonly BuildingDefinition[] = [
  {
    id: 'dojo',
    nameKey: 'building.dojo.name',
    descKey: 'building.dojo.desc',
    icon: '🥋',
    baseCost: 10,
    costGrowth: 1.15,
    baseProduction: 1,
    baseGoldProduction: 1,
    requiredRankIndex: 0
  },
  {
    id: 'meditation_chamber',
    nameKey: 'building.chamber.name',
    descKey: 'building.chamber.desc',
    icon: '🧘',
    baseCost: 100,
    costGrowth: 1.15,
    baseProduction: 8,
    baseGoldProduction: 4,
    requiredRankIndex: 0
  },
  {
    id: 'spirit_shrine',
    nameKey: 'building.shrine.name',
    descKey: 'building.shrine.desc',
    icon: '⛩️',
    baseCost: 1000,
    costGrowth: 1.15,
    baseProduction: 60,
    baseGoldProduction: 25,
    requiredRankIndex: 1
  },
  {
    id: 'warrior_academy',
    nameKey: 'building.academy.name',
    descKey: 'building.academy.desc',
    icon: '🏯',
    baseCost: 12000,
    costGrowth: 1.15,
    baseProduction: 450,
    baseGoldProduction: 160,
    requiredRankIndex: 1
  },
  {
    id: 'arcane_forge',
    nameKey: 'building.forge.name',
    descKey: 'building.forge.desc',
    icon: '⚒️',
    baseCost: 150000,
    costGrowth: 1.15,
    baseProduction: 3500,
    baseGoldProduction: 1100,
    requiredRankIndex: 2
  },
  {
    id: 'mana_reactor',
    nameKey: 'building.reactor.name',
    descKey: 'building.reactor.desc',
    icon: '🌀',
    baseCost: 2000000,
    costGrowth: 1.15,
    baseProduction: 30000,
    baseGoldProduction: 8500,
    requiredRankIndex: 3
  },
  {
    id: 'celestial_temple',
    nameKey: 'building.temple.name',
    descKey: 'building.temple.desc',
    icon: '✨',
    baseCost: 30000000,
    costGrowth: 1.15,
    baseProduction: 275000,
    baseGoldProduction: 70000,
    requiredRankIndex: 4
  },
  {
    id: 'dimensional_gate',
    nameKey: 'building.gate.name',
    descKey: 'building.gate.desc',
    icon: '🌌',
    baseCost: 500000000,
    costGrowth: 1.15,
    baseProduction: 2700000,
    baseGoldProduction: 600000,
    requiredRankIndex: 5
  },
  {
    id: 'star_fortress',
    nameKey: 'building.fortress.name',
    descKey: 'building.fortress.desc',
    icon: '🪐',
    baseCost: 10000000000,
    costGrowth: 1.15,
    baseProduction: 30000000,
    baseGoldProduction: 6000000,
    requiredRankIndex: 6
  },
  {
    id: 'infinite_core',
    nameKey: 'building.core.name',
    descKey: 'building.core.desc',
    icon: '🔮',
    baseCost: 250000000000,
    costGrowth: 1.15,
    baseProduction: 380000000,
    baseGoldProduction: 70000000,
    requiredRankIndex: 7
  }
];

export function getBuildingById(id: string): BuildingDefinition | undefined {
  return BUILDINGS.find(b => b.id === id);
}

/**
 * Calculate cumulative milestone multiplier for a building based on count owned
 */
export function getBuildingMilestoneMultiplier(owned: number): number {
  let mult = 1.0;
  for (const m of BUILDING_MILESTONES) {
    if (owned >= m.count) {
      mult *= m.multiplier;
    }
  }
  return mult;
}

/**
 * Get next milestone info for UI
 */
export function getNextBuildingMilestone(owned: number): { target: number; multiplier: number } | null {
  for (const m of BUILDING_MILESTONES) {
    if (owned < m.count) {
      return { target: m.count, multiplier: m.multiplier };
    }
  }
  return null;
}

/**
 * Calculate cost for buying count buildings starting at currentOwned with optional discount
 */
export function calculateBuildingCost(
  building: BuildingDefinition,
  currentOwned: number,
  count: number = 1,
  discount: number = 0
): number {
  if (count <= 0) return 0;
  const discountFactor = Math.max(0.1, 1 - discount);
  if (count === 1) {
    return Math.max(1, Math.floor(building.baseCost * Math.pow(building.costGrowth, currentOwned) * discountFactor));
  }

  // Geometric series sum: S = a * (r^n - 1) / (r - 1)
  const a = building.baseCost * Math.pow(building.costGrowth, currentOwned) * discountFactor;
  const r = building.costGrowth;
  const total = a * (Math.pow(r, count) - 1) / (r - 1);
  return Math.max(count, Math.floor(total));
}

/**
 * Calculate max affordable buildings with available gold and optional discount
 */
export function calculateMaxAffordableBuildings(
  building: BuildingDefinition,
  currentOwned: number,
  availableGold: number,
  discount: number = 0
): { count: number; totalCost: number } {
  if (availableGold < calculateBuildingCost(building, currentOwned, 1, discount)) {
    return { count: 0, totalCost: 0 };
  }

  let low = 1;
  let high = 5000;
  let bestCount = 0;
  let bestCost = 0;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const cost = calculateBuildingCost(building, currentOwned, mid, discount);
    if (cost <= availableGold) {
      bestCount = mid;
      bestCost = cost;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return { count: bestCount, totalCost: bestCost };
}
