export type HeroRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export type HeroModifierType = 
  | 'power_pct' 
  | 'gold_pct' 
  | 'crit_chance' 
  | 'crit_mult' 
  | 'offline_pct' 
  | 'tower_atk_pct' 
  | 'essence_pct' 
  | 'all_pct';

export interface HeroModifier {
  type: HeroModifierType;
  baseValue: number; // e.g. 0.20 for +20%
}

export type HeroSkillType = 'direct_damage' | 'gold_burst' | 'power_burst' | 'crit_mark';

export interface HeroSkill {
  nameKey: string;
  descKey: string;
  icon: string;
  type: HeroSkillType;
  cooldownSeconds: number; // e.g. 6 to 12s
  multiplier: number; // effect multiplier
}

export interface HeroDefinition {
  id: string;
  nameKey: string;
  titleKey: string;
  rarity: HeroRarity;
  descriptionKey: string;
  element: 'fire' | 'water' | 'wind' | 'lightning' | 'void' | 'light';
  modifier: HeroModifier;
  avatarSeed: string; // Used to generate or render distinct anime avatar
  icon: string;
  skill: HeroSkill;
}

export const HERO_RARITY_CONFIG: Record<HeroRarity, {
  color: string;
  glow: string;
  nameKey: string;
  pullRate: number; // Drop weight %
  duplicateEssence: number;
}> = {
  common: {
    color: '#94a3b8',
    glow: 'rgba(148, 163, 184, 0.4)',
    nameKey: 'rarity.common',
    pullRate: 55, // 55%
    duplicateEssence: 10
  },
  rare: {
    color: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.5)',
    nameKey: 'rarity.rare',
    pullRate: 28, // 28%
    duplicateEssence: 25
  },
  epic: {
    color: '#c084fc',
    glow: 'rgba(192, 132, 252, 0.6)',
    nameKey: 'rarity.epic',
    pullRate: 12, // 12%
    duplicateEssence: 75
  },
  legendary: {
    color: '#fbbf24',
    glow: 'rgba(251, 191, 36, 0.7)',
    nameKey: 'rarity.legendary',
    pullRate: 4, // 4%
    duplicateEssence: 250
  },
  mythic: {
    color: '#f43f5e',
    glow: 'rgba(244, 63, 94, 0.85)',
    nameKey: 'rarity.mythic',
    pullRate: 1, // 1%
    duplicateEssence: 1000
  }
};

export const HEROES: readonly HeroDefinition[] = [
  // COMMON (Base +10% to +15%)
  {
    id: 'hiro',
    nameKey: 'hero.hiro.name',
    titleKey: 'hero.hiro.title',
    rarity: 'common',
    descriptionKey: 'hero.hiro.desc',
    element: 'wind',
    modifier: { type: 'power_pct', baseValue: 0.10 },
    avatarSeed: 'hiro-blade',
    icon: '🗡️',
    skill: {
      nameKey: 'hero.hiro.skill_name',
      descKey: 'hero.hiro.skill_desc',
      icon: '🌪️',
      type: 'direct_damage',
      cooldownSeconds: 8,
      multiplier: 2.5
    }
  },
  {
    id: 'lin',
    nameKey: 'hero.lin.name',
    titleKey: 'hero.lin.title',
    rarity: 'common',
    descriptionKey: 'hero.lin.desc',
    element: 'water',
    modifier: { type: 'gold_pct', baseValue: 0.15 },
    avatarSeed: 'lin-staff',
    icon: '🌸',
    skill: {
      nameKey: 'hero.lin.skill_name',
      descKey: 'hero.lin.skill_desc',
      icon: '🌊',
      type: 'gold_burst',
      cooldownSeconds: 10,
      multiplier: 3.0
    }
  },
  {
    id: 'tatsu',
    nameKey: 'hero.tatsu.name',
    titleKey: 'hero.tatsu.title',
    rarity: 'common',
    descriptionKey: 'hero.tatsu.desc',
    element: 'fire',
    modifier: { type: 'offline_pct', baseValue: 0.15 },
    avatarSeed: 'tatsu-fist',
    icon: '🥊',
    skill: {
      nameKey: 'hero.tatsu.skill_name',
      descKey: 'hero.tatsu.skill_desc',
      icon: '🔥',
      type: 'direct_damage',
      cooldownSeconds: 8,
      multiplier: 2.8
    }
  },
  {
    id: 'mei',
    nameKey: 'hero.mei.name',
    titleKey: 'hero.mei.title',
    rarity: 'common',
    descriptionKey: 'hero.mei.desc',
    element: 'wind',
    modifier: { type: 'crit_chance', baseValue: 0.03 },
    avatarSeed: 'mei-bow',
    icon: '🏹',
    skill: {
      nameKey: 'hero.mei.skill_name',
      descKey: 'hero.mei.skill_desc',
      icon: '🎯',
      type: 'crit_mark',
      cooldownSeconds: 9,
      multiplier: 2.5
    }
  },

  // RARE (Base +15% to +25%)
  {
    id: 'kael',
    nameKey: 'hero.kael.name',
    titleKey: 'hero.kael.title',
    rarity: 'rare',
    descriptionKey: 'hero.kael.desc',
    element: 'void',
    modifier: { type: 'crit_mult', baseValue: 0.35 },
    avatarSeed: 'kael-daggers',
    icon: '🗡️',
    skill: {
      nameKey: 'hero.kael.skill_name',
      descKey: 'hero.kael.skill_desc',
      icon: '🌑',
      type: 'direct_damage',
      cooldownSeconds: 8,
      multiplier: 3.2
    }
  },
  {
    id: 'yuna',
    nameKey: 'hero.yuna.name',
    titleKey: 'hero.yuna.title',
    rarity: 'rare',
    descriptionKey: 'hero.yuna.desc',
    element: 'light',
    modifier: { type: 'offline_pct', baseValue: 0.20 },
    avatarSeed: 'yuna-orb',
    icon: '🔮',
    skill: {
      nameKey: 'hero.yuna.skill_name',
      descKey: 'hero.yuna.skill_desc',
      icon: '✨',
      type: 'power_burst',
      cooldownSeconds: 10,
      multiplier: 3.5
    }
  },
  {
    id: 'shin',
    nameKey: 'hero.shin.name',
    titleKey: 'hero.shin.title',
    rarity: 'rare',
    descriptionKey: 'hero.shin.desc',
    element: 'lightning',
    modifier: { type: 'tower_atk_pct', baseValue: 0.20 },
    avatarSeed: 'shin-katana',
    icon: '⚡',
    skill: {
      nameKey: 'hero.shin.skill_name',
      descKey: 'hero.shin.skill_desc',
      icon: '⚡',
      type: 'direct_damage',
      cooldownSeconds: 7,
      multiplier: 3.5
    }
  },
  {
    id: 'hana',
    nameKey: 'hero.hana.name',
    titleKey: 'hero.hana.title',
    rarity: 'rare',
    descriptionKey: 'hero.hana.desc',
    element: 'water',
    modifier: { type: 'power_pct', baseValue: 0.18 },
    avatarSeed: 'hana-bloom',
    icon: '🌺',
    skill: {
      nameKey: 'hero.hana.skill_name',
      descKey: 'hero.hana.skill_desc',
      icon: '🌸',
      type: 'power_burst',
      cooldownSeconds: 9,
      multiplier: 3.2
    }
  },

  // EPIC (Base +25% to +35%)
  {
    id: 'ren',
    nameKey: 'hero.ren.name',
    titleKey: 'hero.ren.title',
    rarity: 'epic',
    descriptionKey: 'hero.ren.desc',
    element: 'void',
    modifier: { type: 'power_pct', baseValue: 0.25 },
    avatarSeed: 'ren-reaper',
    icon: '🌑',
    skill: {
      nameKey: 'hero.ren.skill_name',
      descKey: 'hero.ren.skill_desc',
      icon: '💀',
      type: 'direct_damage',
      cooldownSeconds: 8,
      multiplier: 4.0
    }
  },
  {
    id: 'ayaka',
    nameKey: 'hero.ayaka.name',
    titleKey: 'hero.ayaka.title',
    rarity: 'epic',
    descriptionKey: 'hero.ayaka.desc',
    element: 'fire',
    modifier: { type: 'tower_atk_pct', baseValue: 0.30 },
    avatarSeed: 'ayaka-spear',
    icon: '🔥',
    skill: {
      nameKey: 'hero.ayaka.skill_name',
      descKey: 'hero.ayaka.skill_desc',
      icon: '💥',
      type: 'direct_damage',
      cooldownSeconds: 8,
      multiplier: 4.2
    }
  },
  {
    id: 'daiki',
    nameKey: 'hero.daiki.name',
    titleKey: 'hero.daiki.title',
    rarity: 'epic',
    descriptionKey: 'hero.daiki.desc',
    element: 'lightning',
    modifier: { type: 'gold_pct', baseValue: 0.30 },
    avatarSeed: 'daiki-hammer',
    icon: '🔨',
    skill: {
      nameKey: 'hero.daiki.skill_name',
      descKey: 'hero.daiki.skill_desc',
      icon: '⚡',
      type: 'direct_damage',
      cooldownSeconds: 9,
      multiplier: 4.5
    }
  },
  {
    id: 'sora',
    nameKey: 'hero.sora.name',
    titleKey: 'hero.sora.title',
    rarity: 'epic',
    descriptionKey: 'hero.sora.desc',
    element: 'wind',
    modifier: { type: 'crit_chance', baseValue: 0.05 },
    avatarSeed: 'sora-feathers',
    icon: '🦅',
    skill: {
      nameKey: 'hero.sora.skill_name',
      descKey: 'hero.sora.skill_desc',
      icon: '🌪️',
      type: 'crit_mark',
      cooldownSeconds: 8,
      multiplier: 4.0
    }
  },

  // LEGENDARY (Base +35% to +45%)
  {
    id: 'akari',
    nameKey: 'hero.akari.name',
    titleKey: 'hero.akari.title',
    rarity: 'legendary',
    descriptionKey: 'hero.akari.desc',
    element: 'light',
    modifier: { type: 'all_pct', baseValue: 0.25 },
    avatarSeed: 'akari-sun',
    icon: '☀️',
    skill: {
      nameKey: 'hero.akari.skill_name',
      descKey: 'hero.akari.skill_desc',
      icon: '☀️',
      type: 'power_burst',
      cooldownSeconds: 10,
      multiplier: 5.5
    }
  },
  {
    id: 'ryu',
    nameKey: 'hero.ryu.name',
    titleKey: 'hero.ryu.title',
    rarity: 'legendary',
    descriptionKey: 'hero.ryu.desc',
    element: 'fire',
    modifier: { type: 'power_pct', baseValue: 0.40 },
    avatarSeed: 'ryu-dragon',
    icon: '🐉',
    skill: {
      nameKey: 'hero.ryu.skill_name',
      descKey: 'hero.ryu.skill_desc',
      icon: '🐲',
      type: 'direct_damage',
      cooldownSeconds: 8,
      multiplier: 6.0
    }
  },
  {
    id: 'tsukiko',
    nameKey: 'hero.tsukiko.name',
    titleKey: 'hero.tsukiko.title',
    rarity: 'legendary',
    descriptionKey: 'hero.tsukiko.desc',
    element: 'void',
    modifier: { type: 'essence_pct', baseValue: 0.35 },
    avatarSeed: 'tsukiko-moon',
    icon: '🌙',
    skill: {
      nameKey: 'hero.tsukiko.skill_name',
      descKey: 'hero.tsukiko.skill_desc',
      icon: '🌙',
      type: 'gold_burst',
      cooldownSeconds: 10,
      multiplier: 6.0
    }
  },

  // MYTHIC (Base +50% to +60%)
  {
    id: 'kuro',
    nameKey: 'hero.kuro.name',
    titleKey: 'hero.kuro.title',
    rarity: 'mythic',
    descriptionKey: 'hero.kuro.desc',
    element: 'void',
    modifier: { type: 'all_pct', baseValue: 0.45 },
    avatarSeed: 'kuro-sovereign',
    icon: '👑',
    skill: {
      nameKey: 'hero.kuro.skill_name',
      descKey: 'hero.kuro.skill_desc',
      icon: '🌌',
      type: 'direct_damage',
      cooldownSeconds: 8,
      multiplier: 8.0
    }
  },
  {
    id: 'amaterasu',
    nameKey: 'hero.amaterasu.name',
    titleKey: 'hero.amaterasu.title',
    rarity: 'mythic',
    descriptionKey: 'hero.amaterasu.desc',
    element: 'light',
    modifier: { type: 'power_pct', baseValue: 0.50 },
    avatarSeed: 'amaterasu-sun',
    icon: '☀️',
    skill: {
      nameKey: 'hero.amaterasu.skill_name',
      descKey: 'hero.amaterasu.skill_desc',
      icon: '✨',
      type: 'power_burst',
      cooldownSeconds: 10,
      multiplier: 8.5
    }
  }
];

export function getHeroById(id: string): HeroDefinition | undefined {
  return HEROES.find(h => h.id === id);
}

/**
 * Calculate the star bonus multiplier (1 star = 1.0, 2 stars = 1.3, 3 stars = 1.6, 4 stars = 1.9, 5 stars = 2.2)
 */
export function getHeroStarMultiplier(stars: number): number {
  switch (stars) {
    case 1: return 1.0;
    case 2: return 1.3;
    case 3: return 1.6;
    case 4: return 1.9;
    case 5: return 2.2;
    default: return 1.0;
  }
}

/**
 * Essence required to upgrade hero from star -> star + 1
 */
export function getStarUpgradeCost(stars: number, rarity: HeroRarity): number {
  const base = HERO_RARITY_CONFIG[rarity].duplicateEssence;
  return Math.floor(base * Math.pow(2, stars - 1));
}
