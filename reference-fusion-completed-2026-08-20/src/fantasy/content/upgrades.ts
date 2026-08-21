export type UpgradeId = 'damage' | 'click_damage' | 'attack_speed' | 'crit_chance' | 'gold_find';

export interface UpgradeDefinition {
  id: UpgradeId;
  name: string;
  description: string;
  baseCost: number;
  costGrowth: number;
  baseValue: number;
  valuePerLevel: number;
  maxLevel?: number;
  milestones: number[];
  unit: string;
}

export const HERO_UPGRADES: Record<UpgradeId, UpgradeDefinition> = {
  damage: {
    id: 'damage',
    name: 'Hero Damage',
    description: 'Increases automatic base weapon strike damage.',
    baseCost: 10,
    costGrowth: 1.15,
    baseValue: 10,
    valuePerLevel: 3,
    milestones: [10, 25, 50, 100, 250],
    unit: 'DMG',
  },
  click_damage: {
    id: 'click_damage',
    name: 'Click Power',
    description: 'Empowers manual strike attacks dealt on tap / click.',
    baseCost: 15,
    costGrowth: 1.14,
    baseValue: 6,
    valuePerLevel: 2.5,
    milestones: [10, 25, 50, 100, 250],
    unit: 'CLICK',
  },
  attack_speed: {
    id: 'attack_speed',
    name: 'Attack Speed',
    description: 'Increases hero weapon swing rate and attacks per second.',
    baseCost: 50,
    costGrowth: 1.25,
    baseValue: 1.0,
    valuePerLevel: 0.02, // +2% per level
    maxLevel: 100,
    milestones: [10, 25, 50, 100],
    unit: 'ATK/s',
  },
  crit_chance: {
    id: 'crit_chance',
    name: 'Critical Strike',
    description: 'Raises chance to land massive critical strikes for 250% damage.',
    baseCost: 100,
    costGrowth: 1.28,
    baseValue: 0.05, // 5% base
    valuePerLevel: 0.01, // +1% per level
    maxLevel: 50,
    milestones: [10, 25, 50],
    unit: '%',
  },
  gold_find: {
    id: 'gold_find',
    name: 'Treasure Hunter',
    description: 'Increases gold coins scavenged from fallen monsters.',
    baseCost: 75,
    costGrowth: 1.20,
    baseValue: 1.0,
    valuePerLevel: 0.05, // +5% per level
    milestones: [10, 25, 50, 100, 250],
    unit: '%',
  },
};
