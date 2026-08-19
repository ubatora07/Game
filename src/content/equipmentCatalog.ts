import { EquipmentItem, EquipmentRarity, EquipmentSlot } from '../core/crafting/CraftingTypes';
import { CharacterClassId } from './classes';

export interface EquipmentTemplateDefinition {
  templateId: string;
  evolutionChainId: string;
  nameKey: string;
  defaultName: string;
  rarity: EquipmentRarity;
  slot: EquipmentSlot;
  evolutionStage: number; // 1..4
  maxEvolutionStage: number;
  baseStats: {
    attack?: number;
    defense?: number;
    hp?: number;
    speed?: number;
    critChance?: number;
    critDamage?: number;
    bossDamage?: number;
  };
  affixes: Array<{
    id: string;
    target: any;
    type: any;
    value: number;
    label: string;
  }>;
  classTags: CharacterClassId[];
  iconSvg: string;
  flavorText: string;
  evolutionCost?: {
    gold: number;
    materials: Record<string, number>;
    requiredForgeLevel: number;
  };
}

export const EQUIPMENT_TEMPLATES: Record<string, EquipmentTemplateDefinition> = {
  // -------------------------------------------------------------
  // 1. SWORDSMAN GREATSWORD CHAIN
  // -------------------------------------------------------------
  wpn_sword_s1: {
    templateId: 'wpn_sword_s1',
    evolutionChainId: 'chain_greatsword',
    nameKey: 'equip.wpn_sword_s1.name',
    defaultName: 'Apprentice Greatsword',
    rarity: 'common',
    slot: 'weapon',
    evolutionStage: 1,
    maxEvolutionStage: 4,
    baseStats: { attack: 25 },
    affixes: [],
    classTags: ['swordsman'],
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2"/></svg>`,
    flavorText: 'A sturdy iron blade honed in the Mountain Haven forge.',
    evolutionCost: {
      gold: 2500,
      materials: { material_iron_ore: 15, material_rare_meteorite: 5 },
      requiredForgeLevel: 1,
    },
  },

  wpn_sword_s2: {
    templateId: 'wpn_sword_s2',
    evolutionChainId: 'chain_greatsword',
    nameKey: 'equip.wpn_sword_s2.name',
    defaultName: 'Reinforced Runesword',
    rarity: 'rare',
    slot: 'weapon',
    evolutionStage: 2,
    maxEvolutionStage: 4,
    baseStats: { attack: 65, bossDamage: 0.08 },
    affixes: [
      { id: 'sword_s2_boss', target: 'bossDamage', type: 'percent_add', value: 0.08, label: '+8% Boss Damage' },
    ],
    classTags: ['swordsman'],
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2"/></svg>`,
    flavorText: 'Inscribed with ancient ward runes that shatter monster armor.',
    evolutionCost: {
      gold: 7500,
      materials: { material_iron_ore: 30, material_rare_meteorite: 15, material_arcane_essence: 5 },
      requiredForgeLevel: 2,
    },
  },

  wpn_sword_s3: {
    templateId: 'wpn_sword_s3',
    evolutionChainId: 'chain_greatsword',
    nameKey: 'equip.wpn_sword_s3.name',
    defaultName: 'Inferno Sunblade',
    rarity: 'epic',
    slot: 'weapon',
    evolutionStage: 3,
    maxEvolutionStage: 4,
    baseStats: { attack: 150, bossDamage: 0.15, critChance: 0.08 },
    affixes: [
      { id: 'sword_s3_boss', target: 'bossDamage', type: 'percent_add', value: 0.15, label: '+15% Boss Damage' },
      { id: 'sword_s3_crit', target: 'critChance', type: 'percent_add', value: 0.08, label: '+8% Crit Chance' },
    ],
    classTags: ['swordsman'],
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2"/></svg>`,
    flavorText: 'Radiates solar heat capable of melting glacial fiends.',
    evolutionCost: {
      gold: 20000,
      materials: { material_rare_meteorite: 30, material_arcane_essence: 20, material_boss_dragon_scale: 5 },
      requiredForgeLevel: 3,
    },
  },

  wpn_sword_s4: {
    templateId: 'wpn_sword_s4',
    evolutionChainId: 'chain_greatsword',
    nameKey: 'equip.wpn_sword_s4.name',
    defaultName: 'Cosmic Sovereign Cleaver',
    rarity: 'legendary',
    slot: 'weapon',
    evolutionStage: 4,
    maxEvolutionStage: 4,
    baseStats: { attack: 340, bossDamage: 0.25, critChance: 0.12 },
    affixes: [
      { id: 'sword_s4_boss', target: 'bossDamage', type: 'percent_add', value: 0.25, label: '+25% Boss Damage' },
      { id: 'sword_s4_crit', target: 'critChance', type: 'percent_add', value: 0.12, label: '+12% Crit Chance' },
      { id: 'sword_s4_power', target: 'powerMultiplier', type: 'percent_add', value: 0.20, label: '+20% Power Multiplier' },
    ],
    classTags: ['swordsman'],
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2"><path d="M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2"/></svg>`,
    flavorText: 'The ultimate blade of galactic supremacy. Cleaves astral space in twain.',
  },

  // -------------------------------------------------------------
  // 2. ARCHER BOW CHAIN
  // -------------------------------------------------------------
  wpn_bow_s1: {
    templateId: 'wpn_bow_s1',
    evolutionChainId: 'chain_bow',
    nameKey: 'equip.wpn_bow_s1.name',
    defaultName: 'Hunter Shortbow',
    rarity: 'common',
    slot: 'weapon',
    evolutionStage: 1,
    maxEvolutionStage: 4,
    baseStats: { attack: 20, speed: 0.05 },
    affixes: [],
    classTags: ['archer'],
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14z"/></svg>`,
    flavorText: 'Light yew bow strung with tempered silk.',
    evolutionCost: {
      gold: 2500,
      materials: { material_iron_ore: 12, material_rare_meteorite: 5 },
      requiredForgeLevel: 1,
    },
  },

  wpn_bow_s2: {
    templateId: 'wpn_bow_s2',
    evolutionChainId: 'chain_bow',
    nameKey: 'equip.wpn_bow_s2.name',
    defaultName: 'Gale Longbow',
    rarity: 'rare',
    slot: 'weapon',
    evolutionStage: 2,
    maxEvolutionStage: 4,
    baseStats: { attack: 52, speed: 0.12 },
    affixes: [
      { id: 'bow_s2_spd', target: 'attackSpeed', type: 'percent_add', value: 0.12, label: '+12% Attack Speed' },
    ],
    classTags: ['archer'],
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M12 2l8 8-8 8-8-8z"/></svg>`,
    flavorText: 'Draws on howling gale winds to double arrow velocity.',
    evolutionCost: {
      gold: 7500,
      materials: { material_iron_ore: 25, material_rare_meteorite: 15, material_arcane_essence: 5 },
      requiredForgeLevel: 2,
    },
  },

  wpn_bow_s3: {
    templateId: 'wpn_bow_s3',
    evolutionChainId: 'chain_bow',
    nameKey: 'equip.wpn_bow_s3.name',
    defaultName: 'Phantom Windpiercer',
    rarity: 'epic',
    slot: 'weapon',
    evolutionStage: 3,
    maxEvolutionStage: 4,
    baseStats: { attack: 125, speed: 0.20, critChance: 0.10 },
    affixes: [
      { id: 'bow_s3_spd', target: 'attackSpeed', type: 'percent_add', value: 0.20, label: '+20% Attack Speed' },
      { id: 'bow_s3_crit', target: 'critChance', type: 'percent_add', value: 0.10, label: '+10% Crit Chance' },
    ],
    classTags: ['archer'],
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9"/></svg>`,
    flavorText: 'Arrows split the air with supersonic sonic booms.',
    evolutionCost: {
      gold: 20000,
      materials: { material_rare_meteorite: 30, material_arcane_essence: 20, material_boss_dragon_scale: 5 },
      requiredForgeLevel: 3,
    },
  },

  wpn_bow_s4: {
    templateId: 'wpn_bow_s4',
    evolutionChainId: 'chain_bow',
    nameKey: 'equip.wpn_bow_s4.name',
    defaultName: 'Sonic Tempest Sovereign Bow',
    rarity: 'legendary',
    slot: 'weapon',
    evolutionStage: 4,
    maxEvolutionStage: 4,
    baseStats: { attack: 290, speed: 0.35, critChance: 0.15 },
    affixes: [
      { id: 'bow_s4_spd', target: 'attackSpeed', type: 'percent_add', value: 0.35, label: '+35% Attack Speed' },
      { id: 'bow_s4_crit', target: 'critChance', type: 'percent_add', value: 0.15, label: '+15% Crit Chance' },
      { id: 'bow_s4_click', target: 'clickDps', type: 'percent_add', value: 0.25, label: '+25% Click Impact' },
    ],
    classTags: ['archer'],
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2"><polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5"/></svg>`,
    flavorText: 'Fires storms of astral phantom light that pierce entire armies.',
  },

  // -------------------------------------------------------------
  // 3. MAGE STAFF CHAIN
  // -------------------------------------------------------------
  wpn_staff_s1: {
    templateId: 'wpn_staff_s1',
    evolutionChainId: 'chain_staff',
    nameKey: 'equip.wpn_staff_s1.name',
    defaultName: 'Arcane Focus Wand',
    rarity: 'common',
    slot: 'weapon',
    evolutionStage: 1,
    maxEvolutionStage: 4,
    baseStats: { attack: 22 },
    affixes: [],
    classTags: ['mage'],
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`,
    flavorText: 'Simple polished wand set with a glowing quartz focus.',
    evolutionCost: {
      gold: 2500,
      materials: { material_iron_ore: 10, material_rare_meteorite: 6 },
      requiredForgeLevel: 1,
    },
  },

  wpn_staff_s2: {
    templateId: 'wpn_staff_s2',
    evolutionChainId: 'chain_staff',
    nameKey: 'equip.wpn_staff_s2.name',
    defaultName: 'Prismatic Scepter',
    rarity: 'rare',
    slot: 'weapon',
    evolutionStage: 2,
    maxEvolutionStage: 4,
    baseStats: { attack: 58 },
    affixes: [
      { id: 'staff_s2_spell', target: 'spellAttack', type: 'percent_add', value: 0.15, label: '+15% Spell Attack' },
    ],
    classTags: ['mage'],
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"/></svg>`,
    flavorText: 'Channels pure spectrum mana into explosive magic missiles.',
    evolutionCost: {
      gold: 7500,
      materials: { material_rare_meteorite: 15, material_arcane_essence: 10 },
      requiredForgeLevel: 2,
    },
  },

  // -------------------------------------------------------------
  // 4. ASSASSIN DAGGER CHAIN
  // -------------------------------------------------------------
  wpn_dagger_s1: {
    templateId: 'wpn_dagger_s1',
    evolutionChainId: 'chain_dagger',
    nameKey: 'equip.wpn_dagger_s1.name',
    defaultName: 'Shadow Stiletto',
    rarity: 'common',
    slot: 'weapon',
    evolutionStage: 1,
    maxEvolutionStage: 4,
    baseStats: { attack: 18, critChance: 0.05 },
    affixes: [],
    classTags: ['assassin'],
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M12 2l4 7-4 13-4-13z"/></svg>`,
    flavorText: 'Concealed steel blade weighted for fatal backstabs.',
    evolutionCost: {
      gold: 2500,
      materials: { material_iron_ore: 12, material_rare_meteorite: 5 },
      requiredForgeLevel: 1,
    },
  },

  wpn_dagger_s2: {
    templateId: 'wpn_dagger_s2',
    evolutionChainId: 'chain_dagger',
    nameKey: 'equip.wpn_dagger_s2.name',
    defaultName: 'Nightstalker Fang',
    rarity: 'rare',
    slot: 'weapon',
    evolutionStage: 2,
    maxEvolutionStage: 4,
    baseStats: { attack: 50, critChance: 0.10, critDamage: 0.18 },
    affixes: [
      { id: 'dagger_s2_crit', target: 'critChance', type: 'percent_add', value: 0.10, label: '+10% Crit Chance' },
      { id: 'dagger_s2_cdmg', target: 'critDamage', type: 'percent_add', value: 0.18, label: '+18% Crit Damage' },
    ],
    classTags: ['assassin'],
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2"><path d="M12 2l4 7-4 13-4-13z"/></svg>`,
    flavorText: 'Dripping with lethal nightshade venom.',
    evolutionCost: {
      gold: 7500,
      materials: { material_rare_meteorite: 15, material_arcane_essence: 8 },
      requiredForgeLevel: 2,
    },
  },

  // -------------------------------------------------------------
  // 5. ARMOR CHAINS
  // -------------------------------------------------------------
  arm_plate_s1: {
    templateId: 'arm_plate_s1',
    evolutionChainId: 'chain_iron_plate',
    nameKey: 'equip.arm_plate_s1.name',
    defaultName: 'Vanguard Iron Hauberk',
    rarity: 'common',
    slot: 'armor',
    evolutionStage: 1,
    maxEvolutionStage: 4,
    baseStats: { defense: 25 },
    affixes: [],
    classTags: ['swordsman'],
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    flavorText: 'Solid interlocked iron rings absorbing bludgeoning blows.',
    evolutionCost: {
      gold: 2500,
      materials: { material_iron_ore: 18, material_rare_meteorite: 5 },
      requiredForgeLevel: 1,
    },
  },

  arm_plate_s2: {
    templateId: 'arm_plate_s2',
    evolutionChainId: 'chain_iron_plate',
    nameKey: 'equip.arm_plate_s2.name',
    defaultName: 'Granite Bulwark Cuirass',
    rarity: 'rare',
    slot: 'armor',
    evolutionStage: 2,
    maxEvolutionStage: 4,
    baseStats: { defense: 60 },
    affixes: [
      { id: 'plate_s2_def', target: 'settlementDefense', type: 'percent_add', value: 0.15, label: '+15% Settlement Defense' },
    ],
    classTags: ['swordsman'],
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    flavorText: 'Reinforced with granite plates and iron brackets.',
    evolutionCost: {
      gold: 7500,
      materials: { material_iron_ore: 35, material_rare_meteorite: 15, material_arcane_essence: 5 },
      requiredForgeLevel: 2,
    },
  },

  arm_leather_s1: {
    templateId: 'arm_leather_s1',
    evolutionChainId: 'chain_scout_tunic',
    nameKey: 'equip.arm_leather_s1.name',
    defaultName: 'Windrunner Scout Tunic',
    rarity: 'common',
    slot: 'armor',
    evolutionStage: 1,
    maxEvolutionStage: 4,
    baseStats: { defense: 18, speed: 0.05 },
    affixes: [],
    classTags: ['archer', 'assassin', 'mage'],
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>`,
    flavorText: 'Supple monster hide allowing unrestricted athletic combat movement.',
    evolutionCost: {
      gold: 2500,
      materials: { material_iron_ore: 10, material_rare_meteorite: 6 },
      requiredForgeLevel: 1,
    },
  },

  // -------------------------------------------------------------
  // 6. ACCESSORY CHAINS
  // -------------------------------------------------------------
  acc_ring_s1: {
    templateId: 'acc_ring_s1',
    evolutionChainId: 'chain_ring_power',
    nameKey: 'equip.acc_ring_s1.name',
    defaultName: 'Bronze Sovereign Band',
    rarity: 'common',
    slot: 'accessory',
    evolutionStage: 1,
    maxEvolutionStage: 4,
    baseStats: {},
    affixes: [
      { id: 'ring_s1_pwr', target: 'powerMultiplier', type: 'percent_add', value: 0.06, label: '+6% Power Multiplier' },
    ],
    classTags: ['swordsman', 'mage', 'archer', 'assassin'],
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/></svg>`,
    flavorText: 'An engraved brass ring focusing inner spiritual aura.',
    evolutionCost: {
      gold: 3000,
      materials: { material_iron_ore: 10, material_rare_meteorite: 8 },
      requiredForgeLevel: 1,
    },
  },

  acc_ring_s2: {
    templateId: 'acc_ring_s2',
    evolutionChainId: 'chain_ring_power',
    nameKey: 'equip.acc_ring_s2.name',
    defaultName: 'Ruby Warband of Might',
    rarity: 'rare',
    slot: 'accessory',
    evolutionStage: 2,
    maxEvolutionStage: 4,
    baseStats: {},
    affixes: [
      { id: 'ring_s2_pwr', target: 'powerMultiplier', type: 'percent_add', value: 0.14, label: '+14% Power Multiplier' },
      { id: 'ring_s2_cdmg', target: 'critDamage', type: 'percent_add', value: 0.10, label: '+10% Crit Damage' },
    ],
    classTags: ['swordsman', 'mage', 'archer', 'assassin'],
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/></svg>`,
    flavorText: 'Encrusted with an enraged blood ruby from the volcano depths.',
    evolutionCost: {
      gold: 8500,
      materials: { material_rare_meteorite: 20, material_arcane_essence: 10 },
      requiredForgeLevel: 2,
    },
  },

  acc_amulet_s1: {
    templateId: 'acc_amulet_s1',
    evolutionChainId: 'chain_amulet_prosperity',
    nameKey: 'equip.acc_amulet_s1.name',
    defaultName: 'Merchant Copper Locket',
    rarity: 'common',
    slot: 'accessory',
    evolutionStage: 1,
    maxEvolutionStage: 4,
    baseStats: {},
    affixes: [
      { id: 'amulet_s1_gold', target: 'goldMultiplier', type: 'percent_add', value: 0.10, label: '+10% Gold Multiplier' },
    ],
    classTags: ['swordsman', 'mage', 'archer', 'assassin'],
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    flavorText: 'Blessed by Lyanna’s caravan guild for fortune in battle.',
    evolutionCost: {
      gold: 3000,
      materials: { material_iron_ore: 10, material_rare_meteorite: 8 },
      requiredForgeLevel: 1,
    },
  },
};

export function getEquipmentTemplate(templateId: string): EquipmentTemplateDefinition | undefined {
  return EQUIPMENT_TEMPLATES[templateId];
}

export function getAllEquipmentTemplates(): EquipmentTemplateDefinition[] {
  return Object.values(EQUIPMENT_TEMPLATES);
}

export function instantiateEquipment(templateId: string): EquipmentItem | null {
  const def = getEquipmentTemplate(templateId);
  if (!def) return null;

  return {
    id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    templateId: def.templateId,
    name: def.defaultName,
    rarity: def.rarity,
    slot: def.slot,
    evolutionStage: def.evolutionStage,
    maxEvolutionStage: def.maxEvolutionStage,
    level: 1,
    baseStats: { ...def.baseStats },
    affixes: [...def.affixes],
    classTags: [...def.classTags],
    equippedCharacterSlot: null,
    iconSvg: def.iconSvg,
    evolutionChainId: def.evolutionChainId,
    flavorText: def.flavorText,
  };
}

export function getNextEvolutionTemplateId(currentTemplateId: string): string | null {
  const current = getEquipmentTemplate(currentTemplateId);
  if (!current) return null;

  const nextStage = current.evolutionStage + 1;
  if (nextStage > current.maxEvolutionStage) return null;

  const next = Object.values(EQUIPMENT_TEMPLATES).find(
    (t) => t.evolutionChainId === current.evolutionChainId && t.evolutionStage === nextStage
  );

  return next ? next.templateId : null;
}
