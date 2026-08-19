export type SoulBranch = 'strength' | 'wealth' | 'spirit' | 'ascension';

export interface SoulSkillDefinition {
  id: string;
  branch: SoulBranch;
  nameKey: string;
  descKey: string;
  icon: string;
  baseCost: number;
  costGrowth: number;
  maxLevel: number;
  baseEffect: number; // e.g. 0.15 (+15%)
}

export const SOUL_TREE: readonly SoulSkillDefinition[] = [
  // 1. STRENGTH BRANCH
  {
    id: 'soul_power',
    branch: 'strength',
    nameKey: 'soul.power.name',
    descKey: 'soul.power.desc',
    icon: '⚡',
    baseCost: 1,
    costGrowth: 1.45,
    maxLevel: 50,
    baseEffect: 0.15 // +15% total power per level
  },
  {
    id: 'soul_train',
    branch: 'strength',
    nameKey: 'soul.train.name',
    descKey: 'soul.train.desc',
    icon: '👊',
    baseCost: 1,
    costGrowth: 1.45,
    maxLevel: 50,
    baseEffect: 0.25 // +25% click training power per level
  },
  {
    id: 'soul_building',
    branch: 'strength',
    nameKey: 'soul.building.name',
    descKey: 'soul.building.desc',
    icon: '🏯',
    baseCost: 2,
    costGrowth: 1.55,
    maxLevel: 50,
    baseEffect: 0.15 // +15% building production per level
  },

  // 2. WEALTH BRANCH
  {
    id: 'soul_gold',
    branch: 'wealth',
    nameKey: 'soul.gold.name',
    descKey: 'soul.gold.desc',
    icon: '💰',
    baseCost: 1,
    costGrowth: 1.45,
    maxLevel: 50,
    baseEffect: 0.20 // +20% gold per level
  },
  {
    id: 'soul_cost',
    branch: 'wealth',
    nameKey: 'soul.cost.name',
    descKey: 'soul.cost.desc',
    icon: '📐',
    baseCost: 3,
    costGrowth: 1.75,
    maxLevel: 15,
    baseEffect: 0.02 // -2% building costs per level (up to -30%)
  },
  {
    id: 'soul_quest',
    branch: 'wealth',
    nameKey: 'soul.quest.name',
    descKey: 'soul.quest.desc',
    icon: '📜',
    baseCost: 2,
    costGrowth: 1.6,
    maxLevel: 30,
    baseEffect: 0.15 // +15% quest rewards per level
  },

  // 3. SPIRIT BRANCH
  {
    id: 'soul_offline',
    branch: 'spirit',
    nameKey: 'soul.offline.name',
    descKey: 'soul.offline.desc',
    icon: '⏳',
    baseCost: 2,
    costGrowth: 1.65,
    maxLevel: 25,
    baseEffect: 0.15 // +15% offline efficiency & +1 hour max offline
  },
  {
    id: 'soul_crit',
    branch: 'spirit',
    nameKey: 'soul.crit.name',
    descKey: 'soul.crit.desc',
    icon: '💥',
    baseCost: 3,
    costGrowth: 1.8,
    maxLevel: 20,
    baseEffect: 0.02 // +2% crit chance & +25% crit damage
  },
  {
    id: 'soul_essence',
    branch: 'spirit',
    nameKey: 'soul.essence.name',
    descKey: 'soul.essence.desc',
    icon: '✨',
    baseCost: 4,
    costGrowth: 1.85,
    maxLevel: 20,
    baseEffect: 0.30 // +30% Hero Essence generation
  },

  // 4. ASCENSION BRANCH
  {
    id: 'soul_tower',
    branch: 'ascension',
    nameKey: 'soul.tower.name',
    descKey: 'soul.tower.desc',
    icon: '🏰',
    baseCost: 2,
    costGrowth: 1.65,
    maxLevel: 30,
    baseEffect: 0.25 // +25% Tower DPS & +20% Tower Rewards
  },
  {
    id: 'soul_rank',
    branch: 'ascension',
    nameKey: 'soul.rank.name',
    descKey: 'soul.rank.desc',
    icon: '👑',
    baseCost: 5,
    costGrowth: 1.95,
    maxLevel: 20,
    baseEffect: 0.10 // +10% effectiveness of rank multipliers
  },
  {
    id: 'soul_rebirth',
    branch: 'ascension',
    nameKey: 'soul.rebirth.name',
    descKey: 'soul.rebirth.desc',
    icon: '🔄',
    baseCost: 5,
    costGrowth: 1.95,
    maxLevel: 15,
    baseEffect: 0.15 // +15% extra souls gained on reincarnation
  }
];

export function getSoulSkillById(id: string): SoulSkillDefinition | undefined {
  return SOUL_TREE.find(s => s.id === id);
}

export function calculateSoulSkillCost(skill: SoulSkillDefinition, currentLevel: number): number {
  if (currentLevel >= skill.maxLevel) return Infinity;
  return Math.floor(skill.baseCost * Math.pow(skill.costGrowth, currentLevel));
}

/**
 * Formula for souls gained on Reincarnation
 */
export function calculateReincarnationSouls(
  totalLifetimePower: number,
  towerFloor: number = 1,
  soulRebirthLevel: number = 0
): number {
  const minReq = 1000000000; // Requires at least 1B lifetime power (Rank S region)
  if (totalLifetimePower < minReq) return 0;
  const base = Math.pow(totalLifetimePower / 15000000, 0.45);
  const towerBonus = 1 + Math.min(3.0, (towerFloor - 1) * 0.03);
  const rebirthBonus = 1 + soulRebirthLevel * 0.15;
  return Math.max(1, Math.floor(base * towerBonus * rebirthBonus));
}
