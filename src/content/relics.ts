export type RelicEffectType = 
  | 'auto_training'      // Simulates clicks per second
  | 'tower_skip'         // Chance to skip a floor after boss
  | 'spirit_lure'        // Multiplier to random spirit spawn rate
  | 'offline_forge'      // Reduces cost of unbought buildings offline (stubbed for future)
  | 'synergy_amp'        // Boosts existing synergy upgrades
  | 'quest_gold'         // Chance to get gold on quest complete
  | 'reincarnation_boost'// Increases souls earned slightly
  | 'crit_burst';        // Chance for a click to be a mega-crit

export interface RelicModifier {
  type: RelicEffectType;
  baseValue: number;
  growthPerLevel: number;
}

export interface RelicDefinition {
  id: string;
  nameKey: string;
  descriptionKey: string;
  maxLevel: number;
  modifier: RelicModifier;
  icon: string; // Emoji for now
}

export const RELICS: RelicDefinition[] = [
  {
    id: 'phantom_finger',
    nameKey: 'relic_phantom_finger',
    descriptionKey: 'relic_phantom_finger_desc',
    maxLevel: 5,
    icon: '☝️',
    modifier: {
      type: 'auto_training',
      baseValue: 1, // 1 click per second
      growthPerLevel: 1 // +1 click per second per level
    }
  },
  {
    id: 'wings_of_haste',
    nameKey: 'relic_wings_of_haste',
    descriptionKey: 'relic_wings_of_haste_desc',
    maxLevel: 5,
    icon: '🪽',
    modifier: {
      type: 'tower_skip',
      baseValue: 0.1, // 10% chance
      growthPerLevel: 0.05 // +5% per level
    }
  },
  {
    id: 'spirit_lantern',
    nameKey: 'relic_spirit_lantern',
    descriptionKey: 'relic_spirit_lantern_desc',
    maxLevel: 3,
    icon: '🏮',
    modifier: {
      type: 'spirit_lure',
      baseValue: 1.5, // 1.5x spawn rate
      growthPerLevel: 0.5 // +0.5x per level
    }
  },
  {
    id: 'karmic_hourglass',
    nameKey: 'relic_karmic_hourglass',
    descriptionKey: 'relic_karmic_hourglass_desc',
    maxLevel: 10,
    icon: '⏳',
    modifier: {
      type: 'reincarnation_boost',
      baseValue: 0.05, // +5% souls
      growthPerLevel: 0.01 // +1% per level
    }
  },
  {
    id: 'dragon_scale',
    nameKey: 'relic_dragon_scale',
    descriptionKey: 'relic_dragon_scale_desc',
    maxLevel: 5,
    icon: '🐉',
    modifier: {
      type: 'crit_burst',
      baseValue: 0.01, // 1% chance for mega-crit (5x normal crit)
      growthPerLevel: 0.01
    }
  },
  {
    id: 'harmonic_chime',
    nameKey: 'relic_harmonic_chime',
    descriptionKey: 'relic_harmonic_chime_desc',
    maxLevel: 5,
    icon: '🎐',
    modifier: {
      type: 'synergy_amp',
      baseValue: 1.1, // 10% increase to synergy upgrade effects
      growthPerLevel: 0.1
    }
  },
  {
    id: 'merchants_abacus',
    nameKey: 'relic_merchants_abacus',
    descriptionKey: 'relic_merchants_abacus_desc',
    maxLevel: 3,
    icon: '🧮',
    modifier: {
      type: 'quest_gold',
      baseValue: 0.25, // 25% chance to get extra gold equivalent to 1 min of prod
      growthPerLevel: 0.15
    }
  },
  {
    id: 'ethereal_hammer',
    nameKey: 'relic_ethereal_hammer',
    descriptionKey: 'relic_ethereal_hammer_desc',
    maxLevel: 3,
    icon: '🔨',
    modifier: {
      type: 'offline_forge',
      baseValue: 0.01, // 1% cost reduction per hour offline
      growthPerLevel: 0.01
    }
  }
];

export function getRelicById(id: string): RelicDefinition | undefined {
  return RELICS.find(r => r.id === id);
}

export function calculateRelicEffect(relicId: string, level: number): number {
  const relic = getRelicById(relicId);
  if (!relic) return 0;
  
  // Level is 1-indexed (Level 1 is base)
  const effectiveLevel = Math.max(1, Math.min(level, relic.maxLevel));
  return relic.modifier.baseValue + (effectiveLevel - 1) * relic.modifier.growthPerLevel;
}
