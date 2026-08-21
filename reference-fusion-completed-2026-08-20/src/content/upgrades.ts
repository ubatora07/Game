export type UpgradeCategory = 'click' | 'building' | 'synergy' | 'global' | 'economy' | 'special';

export type UpgradeEffectType = 
  | 'click_power_mult' 
  | 'click_power_flat'
  | 'crit_chance' 
  | 'crit_mult' 
  | 'building_mult' 
  | 'synergy_boost'
  | 'global_power_mult' 
  | 'global_gold_mult'
  | 'building_cost_reduction'
  | 'offline_cap_hours' 
  | 'tower_dps_mult';

export interface UpgradeDefinition {
  id: string;
  nameKey: string;
  descKey: string;
  icon: string;
  category: UpgradeCategory;
  baseCost: number;
  costGrowth: number;
  targetBuildingId?: string; // If it's a building upgrade
  sourceBuildingId?: string; // If it's a synergy upgrade (boosts target per source owned)
  effectType: UpgradeEffectType;
  effectValue: number; // e.g. 2.0 for 2x, 0.05 for +5%
  maxLevel: number;
  requiredRankIndex: number;
  unlockCheck?: (state: any) => boolean;
}

export const UPGRADES: readonly UpgradeDefinition[] = [
  // 1. CLICK / TRAINING UPGRADES
  {
    id: 'iron_fist',
    nameKey: 'upgrade.iron_fist.name',
    descKey: 'upgrade.iron_fist.desc',
    icon: '👊',
    category: 'click',
    baseCost: 25,
    costGrowth: 2.5,
    effectType: 'click_power_mult',
    effectValue: 2.0, // 2x click power
    maxLevel: 10,
    requiredRankIndex: 0
  },
  {
    id: 'chi_flow',
    nameKey: 'upgrade.chi_flow.name',
    descKey: 'upgrade.chi_flow.desc',
    icon: '⚡',
    category: 'click',
    baseCost: 80,
    costGrowth: 2.8,
    effectType: 'click_power_flat',
    effectValue: 3, // +3 flat base training power
    maxLevel: 10,
    requiredRankIndex: 0
  },
  {
    id: 'eagle_eye',
    nameKey: 'upgrade.eagle_eye.name',
    descKey: 'upgrade.eagle_eye.desc',
    icon: '🎯',
    category: 'click',
    baseCost: 250,
    costGrowth: 3.0,
    effectType: 'crit_chance',
    effectValue: 0.04, // +4% crit chance
    maxLevel: 5,
    requiredRankIndex: 0
  },
  {
    id: 'lethal_strike',
    nameKey: 'upgrade.lethal_strike.name',
    descKey: 'upgrade.lethal_strike.desc',
    icon: '💥',
    category: 'click',
    baseCost: 1500,
    costGrowth: 3.0,
    effectType: 'crit_mult',
    effectValue: 1.0, // +1.0x crit damage
    maxLevel: 5,
    requiredRankIndex: 1
  },

  // 2. BUILDING UPGRADES
  {
    id: 'dojo_mastery',
    nameKey: 'upgrade.dojo_mastery.name',
    descKey: 'upgrade.dojo_mastery.desc',
    icon: '🥋',
    category: 'building',
    targetBuildingId: 'dojo',
    baseCost: 100,
    costGrowth: 3.0,
    effectType: 'building_mult',
    effectValue: 2.0,
    maxLevel: 5,
    requiredRankIndex: 0,
    unlockCheck: (s) => (s.buildings?.dojo || 0) >= 5
  },
  {
    id: 'chamber_zen',
    nameKey: 'upgrade.chamber_zen.name',
    descKey: 'upgrade.chamber_zen.desc',
    icon: '🧘',
    category: 'building',
    targetBuildingId: 'meditation_chamber',
    baseCost: 800,
    costGrowth: 3.0,
    effectType: 'building_mult',
    effectValue: 2.0,
    maxLevel: 5,
    requiredRankIndex: 0,
    unlockCheck: (s) => (s.buildings?.meditation_chamber || 0) >= 5
  },
  {
    id: 'shrine_blessing',
    nameKey: 'upgrade.shrine_blessing.name',
    descKey: 'upgrade.shrine_blessing.desc',
    icon: '⛩️',
    category: 'building',
    targetBuildingId: 'spirit_shrine',
    baseCost: 8000,
    costGrowth: 3.0,
    effectType: 'building_mult',
    effectValue: 2.0,
    maxLevel: 5,
    requiredRankIndex: 1,
    unlockCheck: (s) => (s.buildings?.spirit_shrine || 0) >= 5
  },
  {
    id: 'academy_drills',
    nameKey: 'upgrade.academy_drills.name',
    descKey: 'upgrade.academy_drills.desc',
    icon: '🏯',
    category: 'building',
    targetBuildingId: 'warrior_academy',
    baseCost: 90000,
    costGrowth: 3.0,
    effectType: 'building_mult',
    effectValue: 2.0,
    maxLevel: 5,
    requiredRankIndex: 1,
    unlockCheck: (s) => (s.buildings?.warrior_academy || 0) >= 5
  },
  {
    id: 'forge_pyro',
    nameKey: 'upgrade.forge_pyro.name',
    descKey: 'upgrade.forge_pyro.desc',
    icon: '⚒️',
    category: 'building',
    targetBuildingId: 'arcane_forge',
    baseCost: 1000000,
    costGrowth: 3.0,
    effectType: 'building_mult',
    effectValue: 2.0,
    maxLevel: 5,
    requiredRankIndex: 2,
    unlockCheck: (s) => (s.buildings?.arcane_forge || 0) >= 5
  },
  {
    id: 'reactor_overcharge',
    nameKey: 'upgrade.reactor_overcharge.name',
    descKey: 'upgrade.reactor_overcharge.desc',
    icon: '🌀',
    category: 'building',
    targetBuildingId: 'mana_reactor',
    baseCost: 15000000,
    costGrowth: 3.0,
    effectType: 'building_mult',
    effectValue: 2.0,
    maxLevel: 5,
    requiredRankIndex: 3,
    unlockCheck: (s) => (s.buildings?.mana_reactor || 0) >= 5
  },
  {
    id: 'temple_sanctity',
    nameKey: 'upgrade.temple_sanctity.name',
    descKey: 'upgrade.temple_sanctity.desc',
    icon: '✨',
    category: 'building',
    targetBuildingId: 'celestial_temple',
    baseCost: 250000000,
    costGrowth: 3.0,
    effectType: 'building_mult',
    effectValue: 2.0,
    maxLevel: 5,
    requiredRankIndex: 4,
    unlockCheck: (s) => (s.buildings?.celestial_temple || 0) >= 5
  },
  {
    id: 'gate_expansion',
    nameKey: 'upgrade.gate_expansion.name',
    descKey: 'upgrade.gate_expansion.desc',
    icon: '🌌',
    category: 'building',
    targetBuildingId: 'dimensional_gate',
    baseCost: 4000000000,
    costGrowth: 3.0,
    effectType: 'building_mult',
    effectValue: 2.0,
    maxLevel: 5,
    requiredRankIndex: 5,
    unlockCheck: (s) => (s.buildings?.dimensional_gate || 0) >= 5
  },

  // 3. SYNERGY UPGRADES (COOKIE-CLICKER PRINCIPLE)
  {
    id: 'spirit_education',
    nameKey: 'upgrade.spirit_education.name',
    descKey: 'upgrade.spirit_education.desc',
    icon: '📜',
    category: 'synergy',
    targetBuildingId: 'meditation_chamber',
    sourceBuildingId: 'warrior_academy',
    baseCost: 150000,
    costGrowth: 3.5,
    effectType: 'synergy_boost',
    effectValue: 0.03, // Each Warrior Academy increases Meditation Chamber output by +3%
    maxLevel: 5,
    requiredRankIndex: 2
  },
  {
    id: 'celestial_discipline',
    nameKey: 'upgrade.celestial_discipline.name',
    descKey: 'upgrade.celestial_discipline.desc',
    icon: '🌟',
    category: 'synergy',
    targetBuildingId: 'dojo',
    sourceBuildingId: 'celestial_temple',
    baseCost: 50000000,
    costGrowth: 3.5,
    effectType: 'synergy_boost',
    effectValue: 0.05, // Each Celestial Temple increases Dojo output by +5%
    maxLevel: 5,
    requiredRankIndex: 4
  },
  {
    id: 'dimensional_training',
    nameKey: 'upgrade.dimensional_training.name',
    descKey: 'upgrade.dimensional_training.desc',
    icon: '🌀',
    category: 'synergy',
    targetBuildingId: 'warrior_academy',
    sourceBuildingId: 'dimensional_gate',
    baseCost: 800000000,
    costGrowth: 3.5,
    effectType: 'synergy_boost',
    effectValue: 0.04, // Each Dimensional Gate increases Academy output by +4%
    maxLevel: 5,
    requiredRankIndex: 5
  },

  // 4. ECONOMY UPGRADES
  {
    id: 'golden_fortune',
    nameKey: 'upgrade.golden_fortune.name',
    descKey: 'upgrade.golden_fortune.desc',
    icon: '💰',
    category: 'economy',
    baseCost: 1000,
    costGrowth: 2.8,
    effectType: 'global_gold_mult',
    effectValue: 0.20, // +20% Gold production
    maxLevel: 5,
    requiredRankIndex: 1
  },
  {
    id: 'architect_wisdom',
    nameKey: 'upgrade.architect_wisdom.name',
    descKey: 'upgrade.architect_wisdom.desc',
    icon: '📐',
    category: 'economy',
    baseCost: 15000,
    costGrowth: 3.2,
    effectType: 'building_cost_reduction',
    effectValue: 0.03, // -3% Building costs
    maxLevel: 5,
    requiredRankIndex: 1
  },

  // 5. GLOBAL CULTIVATION UPGRADES
  {
    id: 'spirit_resonance',
    nameKey: 'upgrade.spirit_resonance.name',
    descKey: 'upgrade.spirit_resonance.desc',
    icon: '✨',
    category: 'global',
    baseCost: 5000,
    costGrowth: 3.5,
    effectType: 'global_power_mult',
    effectValue: 0.25, // +25% all power
    maxLevel: 5,
    requiredRankIndex: 1
  },
  {
    id: 'cosmic_flow',
    nameKey: 'upgrade.cosmic_flow.name',
    descKey: 'upgrade.cosmic_flow.desc',
    icon: '🌌',
    category: 'global',
    baseCost: 150000,
    costGrowth: 4.0,
    effectType: 'global_power_mult',
    effectValue: 0.50, // +50% all power
    maxLevel: 5,
    requiredRankIndex: 2
  },
  {
    id: 'god_domain_expansion',
    nameKey: 'upgrade.god_domain.name',
    descKey: 'upgrade.god_domain.desc',
    icon: '👑',
    category: 'global',
    baseCost: 50000000,
    costGrowth: 5.0,
    effectType: 'global_power_mult',
    effectValue: 1.0, // +100% all power
    maxLevel: 5,
    requiredRankIndex: 4
  },

  // 6. SPECIAL / META UPGRADES
  {
    id: 'astral_slumber',
    nameKey: 'upgrade.astral_slumber.name',
    descKey: 'upgrade.astral_slumber.desc',
    icon: '⏳',
    category: 'special',
    baseCost: 20000,
    costGrowth: 3.0,
    effectType: 'offline_cap_hours',
    effectValue: 2, // +2 hours offline cap
    maxLevel: 4,
    requiredRankIndex: 1
  },
  {
    id: 'tower_conqueror',
    nameKey: 'upgrade.tower_conqueror.name',
    descKey: 'upgrade.tower_conqueror.desc',
    icon: '🏰',
    category: 'special',
    baseCost: 100000,
    costGrowth: 3.0,
    effectType: 'tower_dps_mult',
    effectValue: 0.35, // +35% Tower Combat Power
    maxLevel: 5,
    requiredRankIndex: 2
  }
];

export function getUpgradeById(id: string): UpgradeDefinition | undefined {
  return UPGRADES.find(u => u.id === id);
}

export function calculateUpgradeCost(upgrade: UpgradeDefinition, currentLevel: number): number {
  if (currentLevel >= upgrade.maxLevel) return Infinity;
  return Math.floor(upgrade.baseCost * Math.pow(upgrade.costGrowth, currentLevel));
}
