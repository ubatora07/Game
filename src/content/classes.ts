export type CharacterClassId = 'mage' | 'swordsman' | 'archer' | 'assassin';

export interface ClassStatProfile {
  attackMultiplier: number;
  attackSpeedMultiplier: number;
  critChanceBonus: number;
  critDamageBonus: number;
  bossDamageBonus: number;
  lootBonus: number;
}

export interface CharacterClassDefinition {
  id: CharacterClassId;
  nameKey: string;
  descKey: string;
  defaultName: string;
  defaultDesc: string;
  themeColor: string;
  accentColor: string;
  iconSvg: string;
  baseStats: ClassStatProfile;
  starterPerks: string[];
}

export const CLASSES: Record<CharacterClassId, CharacterClassDefinition> = {
  mage: {
    id: 'mage',
    nameKey: 'class.mage.name',
    descKey: 'class.mage.desc',
    defaultName: 'Arcane Mage',
    defaultDesc: 'Master of elemental mana and explosive area burst. High burst damage and magical synergy.',
    themeColor: '#8b5cf6',
    accentColor: '#c084fc',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
    baseStats: {
      attackMultiplier: 1.30,
      attackSpeedMultiplier: 0.90,
      critChanceBonus: 0.02,
      critDamageBonus: 0.30,
      bossDamageBonus: 0.15,
      lootBonus: 0.05,
    },
    starterPerks: ['Arcane Resonance', 'Mana Shield', 'Elemental Surge'],
  },
  swordsman: {
    id: 'swordsman',
    nameKey: 'class.swordsman.name',
    descKey: 'class.swordsman.desc',
    defaultName: 'Blade Swordsman',
    defaultDesc: 'Unyielding melee warrior specializing in steady boss execution, sustained DPS, and high defense.',
    themeColor: '#3b82f6',
    accentColor: '#60a5fa',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 17.5 3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2"/></svg>`,
    baseStats: {
      attackMultiplier: 1.15,
      attackSpeedMultiplier: 1.05,
      critChanceBonus: 0.04,
      critDamageBonus: 0.25,
      bossDamageBonus: 0.30,
      lootBonus: 0.00,
    },
    starterPerks: ['Unyielding Will', 'Cleaving Slash', 'Iron Stance'],
  },
  archer: {
    id: 'archer',
    nameKey: 'class.archer.name',
    descKey: 'class.archer.desc',
    defaultName: 'Wind Archer',
    defaultDesc: 'Swift ranged sniper delivering rapid precision volleys with unmatched attack speed and rhythm synergy.',
    themeColor: '#10b981',
    accentColor: '#34d399',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 0 0-10 10c0 5.5 4.5 10 10 10M22 12A10 10 0 0 0 12 2M12 12l9-9M17 3l4 4"/></svg>`,
    baseStats: {
      attackMultiplier: 1.05,
      attackSpeedMultiplier: 1.35,
      critChanceBonus: 0.06,
      critDamageBonus: 0.40,
      bossDamageBonus: 0.10,
      lootBonus: 0.10,
    },
    starterPerks: ['Gale Quiver', 'Eagle Eye', 'Rhythm Precision'],
  },
  assassin: {
    id: 'assassin',
    nameKey: 'class.assassin.name',
    descKey: 'class.assassin.desc',
    defaultName: 'Shadow Assassin',
    defaultDesc: 'Lethal executioner hiding in darkness. Excels in extreme critical strikes, massive rhythm spikes, and rare loot.',
    themeColor: '#ec4899',
    accentColor: '#f472b6',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m2 2 20 20M15 4l5 5-11 11-5-1 1-5L15 4z"/></svg>`,
    baseStats: {
      attackMultiplier: 1.20,
      attackSpeedMultiplier: 1.15,
      critChanceBonus: 0.10,
      critDamageBonus: 0.75,
      bossDamageBonus: 0.05,
      lootBonus: 0.25,
    },
    starterPerks: ['Shadow Cloak', 'Fatal Ambush', 'Collector Instinct'],
  },
};

export function getClassById(id: CharacterClassId): CharacterClassDefinition | null {
  return CLASSES[id] || null;
}

export function getAllClasses(): CharacterClassDefinition[] {
  return Object.values(CLASSES);
}
