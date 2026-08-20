export type LegacyPerkId = 'veteran' | 'treasure_hunter' | 'swift_strikes' | 'idle_mastery';

export interface LegacyPerkDefinition {
  id: LegacyPerkId;
  name: string;
  description: string;
  baseCost: number;
  costGrowth: number;
  bonusPerLevel: number;
  unit: string;
}

export const LEGACY_PERKS: Record<LegacyPerkId, LegacyPerkDefinition> = {
  veteran: {
    id: 'veteran',
    name: 'Veteran Might',
    description: 'Increases all hero damage and DPS across every run.',
    baseCost: 1,
    costGrowth: 1.5,
    bonusPerLevel: 0.10, // +10%
    unit: '% DMG',
  },
  treasure_hunter: {
    id: 'treasure_hunter',
    name: 'Treasure King',
    description: 'Increases gold coins scavenged across all worlds and stages.',
    baseCost: 1,
    costGrowth: 1.5,
    bonusPerLevel: 0.10, // +10%
    unit: '% Gold',
  },
  swift_strikes: {
    id: 'swift_strikes',
    name: 'Swift Strikes',
    description: 'Increases base weapon attack speed and strike frequency.',
    baseCost: 2,
    costGrowth: 1.8,
    bonusPerLevel: 0.03, // +3%
    unit: '% Speed',
  },
  idle_mastery: {
    id: 'idle_mastery',
    name: 'Idle Mastery',
    description: 'Increases offline progress gold and item drop efficiency.',
    baseCost: 1,
    costGrowth: 1.5,
    bonusPerLevel: 0.10, // +10%
    unit: '% Offline',
  },
};

export function calculateLegacyPointsYield(lifetimeGold: number, highestWorld: number, highestStage: number): number {
  if (lifetimeGold < 1000 && highestWorld <= 1 && highestStage <= 2) {
    return 0;
  }
  const goldPart = Math.floor(Math.pow(lifetimeGold / 25000, 0.5));
  const worldPart = Math.max(0, (highestWorld - 1) * 20);
  const stagePart = Math.max(0, highestStage * 2);

  return Math.max(1, goldPart + worldPart + stagePart);
}
