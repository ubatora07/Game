import { SkillNodeDefinition, validateTreeStructure } from '../skillTrees';

export const ASSASSIN_NODES: SkillNodeDefinition[] = [
  // ==========================================
  // TIER 1: Root Origin (1 Node)
  // ==========================================
  {
    id: 'assassin_t1_shadow',
    classId: 'assassin',
    tier: 1,
    parentId: null,
    nameKey: 'tree.assassin.t1_shadow.name',
    descKey: 'tree.assassin.t1_shadow.desc',
    defaultName: 'Shadow Ambush Stance',
    defaultDesc: 'Hides in dark silhouettes. Adds +10% Crit Chance, +30% Crit Damage, and +15% Loot Drop bonus.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_assassin_t1_crit_ch', target: 'critChance', type: 'flat', value: 0.10 },
      { id: 'mod_assassin_t1_crit_dmg', target: 'critDamage', type: 'percent_add', value: 0.30 },
      { id: 'mod_assassin_t1_loot', target: 'lootChance', type: 'percent_add', value: 0.15 },
    ],
  },

  // ==========================================
  // TIER 2: Major Specializations (2 Nodes)
  // ==========================================
  {
    id: 'assassin_t2_lethal_execute',
    classId: 'assassin',
    tier: 2,
    parentId: 'assassin_t1_shadow',
    nameKey: 'tree.assassin.t2_lethal_execute.name',
    descKey: 'tree.assassin.t2_lethal_execute.desc',
    defaultName: 'Lethal Executioner',
    defaultDesc: 'Strikes for instant kills. Adds +15% Crit Chance and +30% Boss Damage.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_assassin_t2_exec_crit', target: 'critChance', type: 'flat', value: 0.15 },
      { id: 'mod_assassin_t2_exec_boss', target: 'bossDamage', type: 'percent_add', value: 0.30 },
    ],
  },
  {
    id: 'assassin_t2_shadow_broker',
    classId: 'assassin',
    tier: 2,
    parentId: 'assassin_t1_shadow',
    nameKey: 'tree.assassin.t2_shadow_broker.name',
    descKey: 'tree.assassin.t2_shadow_broker.desc',
    defaultName: 'Night Market Broker',
    defaultDesc: 'Affiliation with underground syndicates. Adds +35% Loot Drop and +30% Rare Event chance.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_assassin_t2_brok_loot', target: 'lootChance', type: 'percent_add', value: 0.35 },
      { id: 'mod_assassin_t2_brok_rare', target: 'rareEventChance', type: 'percent_add', value: 0.30 },
    ],
  },

  // ==========================================
  // TIER 3: Sub-Branches (4 Nodes)
  // ==========================================
  // Under Lethal Executioner:
  {
    id: 'assassin_t3_fatal_venom',
    classId: 'assassin',
    tier: 3,
    parentId: 'assassin_t2_lethal_execute',
    nameKey: 'tree.assassin.t3_fatal_venom.name',
    descKey: 'tree.assassin.t3_fatal_venom.desc',
    defaultName: 'Nether Venom Specialist',
    defaultDesc: 'Coats blades in lethal toxin. Adds +60% Crit Damage and +30% Manual Click damage.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_assassin_t3_venom_crit', target: 'critDamage', type: 'percent_add', value: 0.60 },
      { id: 'mod_assassin_t3_venom_man', target: 'manualAttackDamage', type: 'percent_add', value: 0.30 },
    ],
  },
  {
    id: 'assassin_t3_phantom_execution',
    classId: 'assassin',
    tier: 3,
    parentId: 'assassin_t2_lethal_execute',
    nameKey: 'tree.assassin.t3_phantom_execution.name',
    descKey: 'tree.assassin.t3_phantom_execution.desc',
    defaultName: 'Phantom Death Mark',
    defaultDesc: 'Marks target souls for demise. Multiplies ATK by 1.35x and adds +40% Boss Damage.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_assassin_t3_mark_atk', target: 'attack', type: 'multiplier', value: 1.35 },
      { id: 'mod_assassin_t3_mark_boss', target: 'bossDamage', type: 'percent_add', value: 0.40 },
    ],
  },
  // Under Night Market Broker:
  {
    id: 'assassin_t3_master_thief',
    classId: 'assassin',
    tier: 3,
    parentId: 'assassin_t2_shadow_broker',
    nameKey: 'tree.assassin.t3_master_thief.name',
    descKey: 'tree.assassin.t3_master_thief.desc',
    defaultName: 'Phantom Master Thief',
    defaultDesc: 'Steals boss valuables. Adds +50% Gold multiplier and +40% Loot Drop bonus.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_assassin_t3_thief_gold', target: 'goldMultiplier', type: 'percent_add', value: 0.50 },
      { id: 'mod_assassin_t3_thief_loot', target: 'lootChance', type: 'percent_add', value: 0.40 },
    ],
  },
  {
    id: 'assassin_t3_shadow_veil',
    classId: 'assassin',
    tier: 3,
    parentId: 'assassin_t2_shadow_broker',
    nameKey: 'tree.assassin.t3_shadow_veil.name',
    descKey: 'tree.assassin.t3_shadow_veil.desc',
    defaultName: 'Umbral Mirage Stalker',
    defaultDesc: 'Vanishes in combat smoke. Increases Attack Speed by +35% and Crit Chance by +12%.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_assassin_t3_veil_spd', target: 'attackSpeed', type: 'percent_add', value: 0.35 },
      { id: 'mod_assassin_t3_veil_crit', target: 'critChance', type: 'flat', value: 0.12 },
    ],
  },

  // ==========================================
  // TIER 4: Ultimate Mastery (8 Nodes)
  // ==========================================
  // Under Nether Venom Specialist:
  {
    id: 'assassin_t4_corrosive_sovereign',
    classId: 'assassin',
    tier: 4,
    parentId: 'assassin_t3_fatal_venom',
    nameKey: 'tree.assassin.t4_corrosive_sovereign.name',
    descKey: 'tree.assassin.t4_corrosive_sovereign.desc',
    defaultName: 'Viper God Sovereign',
    defaultDesc: 'Supreme venom avatar. Adds +100% Crit Damage and +50% Manual Click damage.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_assassin_t4_viper_crit', target: 'critDamage', type: 'percent_add', value: 1.00 },
      { id: 'mod_assassin_t4_viper_man', target: 'manualAttackDamage', type: 'percent_add', value: 0.50 },
    ],
  },
  {
    id: 'assassin_t4_soul_reaper',
    classId: 'assassin',
    tier: 4,
    parentId: 'assassin_t3_fatal_venom',
    nameKey: 'tree.assassin.t4_soul_reaper.name',
    descKey: 'tree.assassin.t4_soul_reaper.desc',
    defaultName: 'Spectral Reaper of Souls',
    defaultDesc: 'Reaps demonic vitality. Multiplies ATK by 1.50x and Boss Damage by 1.50x.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_assassin_t4_reaper_atk', target: 'attack', type: 'multiplier', value: 1.50 },
      { id: 'mod_assassin_t4_reaper_boss', target: 'bossDamage', type: 'multiplier', value: 1.50 },
    ],
  },

  // Under Phantom Death Mark:
  {
    id: 'assassin_t4_shadow_overlord',
    classId: 'assassin',
    tier: 4,
    parentId: 'assassin_t3_phantom_execution',
    nameKey: 'tree.assassin.t4_shadow_overlord.name',
    descKey: 'tree.assassin.t4_shadow_overlord.desc',
    defaultName: 'Abyssal Shadow Sovereign',
    defaultDesc: 'Supreme darkness ruler. Multiplies total ATK by 1.60x and adds +120% Crit Damage.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_assassin_t4_over_atk', target: 'attack', type: 'multiplier', value: 1.60 },
      { id: 'mod_assassin_t4_over_crit', target: 'critDamage', type: 'percent_add', value: 1.20 },
    ],
  },
  {
    id: 'assassin_t4_fatal_guillotine',
    classId: 'assassin',
    tier: 4,
    parentId: 'assassin_t3_phantom_execution',
    nameKey: 'tree.assassin.t4_fatal_guillotine.name',
    descKey: 'tree.assassin.t4_fatal_guillotine.desc',
    defaultName: 'Divine Execution Guillotine',
    defaultDesc: 'Severing blade of fate. Multiplies Boss Damage by 1.70x and adds +20% Crit Chance.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_assassin_t4_guill_boss', target: 'bossDamage', type: 'multiplier', value: 1.70 },
      { id: 'mod_assassin_t4_guill_crit', target: 'critChance', type: 'flat', value: 0.20 },
    ],
  },

  // Under Phantom Master Thief:
  {
    id: 'assassin_t4_syndicate_king',
    classId: 'assassin',
    tier: 4,
    parentId: 'assassin_t3_master_thief',
    nameKey: 'tree.assassin.t4_syndicate_king.name',
    descKey: 'tree.assassin.t4_syndicate_king.desc',
    defaultName: 'Black Market Syndicate King',
    defaultDesc: 'Controls all world trade. Doubles Gold (2.0x) and adds +100% Rare Event chance.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_assassin_t4_synd_gold', target: 'goldMultiplier', type: 'multiplier', value: 2.0 },
      { id: 'mod_assassin_t4_synd_rare', target: 'rareEventChance', type: 'percent_add', value: 1.00 },
    ],
  },
  {
    id: 'assassin_t4_celestial_heist',
    classId: 'assassin',
    tier: 4,
    parentId: 'assassin_t3_master_thief',
    nameKey: 'tree.assassin.t4_celestial_heist.name',
    descKey: 'tree.assassin.t4_celestial_heist.desc',
    defaultName: 'Celestial Treasury Infiltrator',
    defaultDesc: 'Infiltrates astral vaults. Adds +80% Loot Drop and +50% Quest Crystals.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_assassin_t4_heist_loot', target: 'lootChance', type: 'percent_add', value: 0.80 },
      { id: 'mod_assassin_t4_heist_quest', target: 'questRewardMultiplier', type: 'percent_add', value: 0.50 },
    ],
  },

  // Under Umbral Mirage Stalker:
  {
    id: 'assassin_t4_mirage_ascendant',
    classId: 'assassin',
    tier: 4,
    parentId: 'assassin_t3_shadow_veil',
    nameKey: 'tree.assassin.t4_mirage_ascendant.name',
    descKey: 'tree.assassin.t4_mirage_ascendant.desc',
    defaultName: 'Mirage Shadow Ascendant',
    defaultDesc: 'Creates clones in combat. Increases Attack Speed by +55% and Party Damage by +45%.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_assassin_t4_mirage_spd', target: 'attackSpeed', type: 'percent_add', value: 0.55 },
      { id: 'mod_assassin_t4_mirage_ally', target: 'allyDamage', type: 'percent_add', value: 0.45 },
    ],
  },
  {
    id: 'assassin_t4_voidwalker_god',
    classId: 'assassin',
    tier: 4,
    parentId: 'assassin_t3_shadow_veil',
    nameKey: 'tree.assassin.t4_voidwalker_god.name',
    descKey: 'tree.assassin.t4_voidwalker_god.desc',
    defaultName: 'Voidwalker Primordial Stalker',
    defaultDesc: 'Transfers through void realms. Adds +25% Crit Chance and +150% Crit Damage.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_assassin_t4_void_crit_ch', target: 'critChance', type: 'flat', value: 0.25 },
      { id: 'mod_assassin_t4_void_crit_dmg', target: 'critDamage', type: 'percent_add', value: 1.50 },
    ],
  },
];

// Structural validation self-check
const validation = validateTreeStructure(ASSASSIN_NODES);
if (!validation.valid) {
  console.error(`[AssassinTree] Tree validation error: ${validation.error}`);
}
