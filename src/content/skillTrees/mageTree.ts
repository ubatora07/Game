import { SkillNodeDefinition, validateTreeStructure } from '../skillTrees';

export const MAGE_NODES: SkillNodeDefinition[] = [
  // ==========================================
  // TIER 1: Root Origin (1 Node)
  // ==========================================
  {
    id: 'mage_t1_catalyst',
    classId: 'mage',
    tier: 1,
    parentId: null,
    nameKey: 'tree.mage.t1_catalyst.name',
    descKey: 'tree.mage.t1_catalyst.desc',
    defaultName: 'Arcane Catalyst',
    defaultDesc: 'Awakens primordial mana conduits. Increases base Magic ATK by +20% and Power by +15%.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_mage_t1_atk', target: 'attack', type: 'percent_add', value: 0.20 },
      { id: 'mod_mage_t1_pwr', target: 'powerMultiplier', type: 'percent_add', value: 0.15 },
    ],
  },

  // ==========================================
  // TIER 2: Major Specializations (2 Nodes)
  // ==========================================
  {
    id: 'mage_t2_arcane',
    classId: 'mage',
    tier: 2,
    parentId: 'mage_t1_catalyst',
    nameKey: 'tree.mage.t2_arcane.name',
    descKey: 'tree.mage.t2_arcane.desc',
    defaultName: 'Cosmic Arcana',
    defaultDesc: 'Channels astral mysteries. Multiplies total ATK by 1.25x and boosts Ally Party damage by +15%.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_mage_t2_arc_atk', target: 'attack', type: 'multiplier', value: 1.25 },
      { id: 'mod_mage_t2_arc_ally', target: 'allyDamage', type: 'percent_add', value: 0.15 },
    ],
  },
  {
    id: 'mage_t2_elemental',
    classId: 'mage',
    tier: 2,
    parentId: 'mage_t1_catalyst',
    nameKey: 'tree.mage.t2_elemental.name',
    descKey: 'tree.mage.t2_elemental.desc',
    defaultName: 'Prismatic Elements',
    defaultDesc: 'Fuses fire, storm, and frost. Grants +30% Elemental Burst and +5% Crit Chance.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_mage_t2_elem_atk', target: 'attack', type: 'percent_add', value: 0.30 },
      { id: 'mod_mage_t2_elem_crit', target: 'critChance', type: 'flat', value: 0.05 },
    ],
  },

  // ==========================================
  // TIER 3: Sub-Branches (4 Nodes)
  // ==========================================
  // Under Cosmic Arcana:
  {
    id: 'mage_t3_summoning',
    classId: 'mage',
    tier: 3,
    parentId: 'mage_t2_arcane',
    nameKey: 'tree.mage.t3_summoning.name',
    descKey: 'tree.mage.t3_summoning.desc',
    defaultName: 'Familiar Summoning',
    defaultDesc: 'Summons astral companions. Doubles Pet damage (+100%) and increases Gold gain by +25%.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_mage_t3_pet_dmg', target: 'petDamage', type: 'multiplier', value: 2.0 },
      { id: 'mod_mage_t3_gold', target: 'goldMultiplier', type: 'percent_add', value: 0.25 },
    ],
  },
  {
    id: 'mage_t3_pure_arcana',
    classId: 'mage',
    tier: 3,
    parentId: 'mage_t2_arcane',
    nameKey: 'tree.mage.t3_pure_arcana.name',
    descKey: 'tree.mage.t3_pure_arcana.desc',
    defaultName: 'Singularity Void',
    defaultDesc: 'Condenses raw space-time mana. Multiplies ATK by 1.30x and adds +40% Crit Damage.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_mage_t3_void_atk', target: 'attack', type: 'multiplier', value: 1.30 },
      { id: 'mod_mage_t3_void_crit', target: 'critDamage', type: 'percent_add', value: 0.40 },
    ],
  },
  // Under Prismatic Elements:
  {
    id: 'mage_t3_fire_storm',
    classId: 'mage',
    tier: 3,
    parentId: 'mage_t2_elemental',
    nameKey: 'tree.mage.t3_fire_storm.name',
    descKey: 'tree.mage.t3_fire_storm.desc',
    defaultName: 'Inferno Tempest',
    defaultDesc: 'Combines blazing fire and raging lightning. Adds +40% Boss Damage and +30% Manual Click damage.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_mage_t3_fire_boss', target: 'bossDamage', type: 'percent_add', value: 0.40 },
      { id: 'mod_mage_t3_fire_man', target: 'manualAttackDamage', type: 'percent_add', value: 0.30 },
    ],
  },
  {
    id: 'mage_t3_frost_nature',
    classId: 'mage',
    tier: 3,
    parentId: 'mage_t2_elemental',
    nameKey: 'tree.mage.t3_frost_nature.name',
    descKey: 'tree.mage.t3_frost_nature.desc',
    defaultName: 'Glacial Gaia Domain',
    defaultDesc: 'Infuses freezing frost and earthly vital essence. Adds +35% Auto-attack damage and +20% Loot Drop.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_mage_t3_frost_auto', target: 'autoAttackDamage', type: 'percent_add', value: 0.35 },
      { id: 'mod_mage_t3_frost_loot', target: 'lootChance', type: 'percent_add', value: 0.20 },
    ],
  },

  // ==========================================
  // TIER 4: Ultimate Mastery (8 Nodes)
  // ==========================================
  // Under Familiar Summoning:
  {
    id: 'mage_t4_astral_archmage',
    classId: 'mage',
    tier: 4,
    parentId: 'mage_t3_summoning',
    nameKey: 'tree.mage.t4_astral_archmage.name',
    descKey: 'tree.mage.t4_astral_archmage.desc',
    defaultName: 'Astral Familiar Sovereign',
    defaultDesc: 'Ultimate summoning mastery. Triples Pet damage (x3.0) and boosts entire Party damage by +35%.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_mage_t4_astral_pet', target: 'petDamage', type: 'multiplier', value: 3.0 },
      { id: 'mod_mage_t4_astral_ally', target: 'allyDamage', type: 'percent_add', value: 0.35 },
    ],
  },
  {
    id: 'mage_t4_beast_conjurer',
    classId: 'mage',
    tier: 4,
    parentId: 'mage_t3_summoning',
    nameKey: 'tree.mage.t4_beast_conjurer.name',
    descKey: 'tree.mage.t4_beast_conjurer.desc',
    defaultName: 'Beastmaster Conjurer',
    defaultDesc: 'Attracts celestial beasts and mythical creatures. Increases Rare Event chance by +50% and Loot by +35%.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_mage_t4_beast_rare', target: 'rareEventChance', type: 'percent_add', value: 0.50 },
      { id: 'mod_mage_t4_beast_loot', target: 'lootChance', type: 'percent_add', value: 0.35 },
    ],
  },

  // Under Singularity Void:
  {
    id: 'mage_t4_void_annihilator',
    classId: 'mage',
    tier: 4,
    parentId: 'mage_t3_pure_arcana',
    nameKey: 'tree.mage.t4_void_annihilator.name',
    descKey: 'tree.mage.t4_void_annihilator.desc',
    defaultName: 'Void Annihilator',
    defaultDesc: 'Supreme arcane obliteration. Multiplies total ATK by 1.50x and increases Crit Damage by +75%.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_mage_t4_void_atk', target: 'attack', type: 'multiplier', value: 1.50 },
      { id: 'mod_mage_t4_void_crit', target: 'critDamage', type: 'percent_add', value: 0.75 },
    ],
  },
  {
    id: 'mage_t4_chrono_weaver',
    classId: 'mage',
    tier: 4,
    parentId: 'mage_t3_pure_arcana',
    nameKey: 'tree.mage.t4_chrono_weaver.name',
    descKey: 'tree.mage.t4_chrono_weaver.desc',
    defaultName: 'Chrono Time-Weaver',
    defaultDesc: 'Distorts battle time. Increases Attack Speed by +40% and Quest Crystal rewards by +30%.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_mage_t4_chrono_spd', target: 'attackSpeed', type: 'percent_add', value: 0.40 },
      { id: 'mod_mage_t4_chrono_qst', target: 'questRewardMultiplier', type: 'percent_add', value: 0.30 },
    ],
  },

  // Under Inferno Tempest:
  {
    id: 'mage_t4_solar_pyrolord',
    classId: 'mage',
    tier: 4,
    parentId: 'mage_t3_fire_storm',
    nameKey: 'tree.mage.t4_solar_pyrolord.name',
    descKey: 'tree.mage.t4_solar_pyrolord.desc',
    defaultName: 'Solar Flare Sovereign',
    defaultDesc: 'Ignites celestial supernovae. Multiplies Boss Damage by 1.60x and manual click ATK by +50%.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_mage_t4_solar_boss', target: 'bossDamage', type: 'multiplier', value: 1.60 },
      { id: 'mod_mage_t4_solar_man', target: 'manualAttackDamage', type: 'percent_add', value: 0.50 },
    ],
  },
  {
    id: 'mage_t4_thundergod_scion',
    classId: 'mage',
    tier: 4,
    parentId: 'mage_t3_fire_storm',
    nameKey: 'tree.mage.t4_thundergod_scion.name',
    descKey: 'tree.mage.t4_thundergod_scion.desc',
    defaultName: 'Thundergod Incarnation',
    defaultDesc: 'Calls continuous lightning strikes. Adds +12% Crit Chance and +60% Crit Damage.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_mage_t4_thun_crit_ch', target: 'critChance', type: 'flat', value: 0.12 },
      { id: 'mod_mage_t4_thun_crit_dmg', target: 'critDamage', type: 'percent_add', value: 0.60 },
    ],
  },

  // Under Glacial Gaia Domain:
  {
    id: 'mage_t4_blizzard_monarch',
    classId: 'mage',
    tier: 4,
    parentId: 'mage_t3_frost_nature',
    nameKey: 'tree.mage.t4_blizzard_monarch.name',
    descKey: 'tree.mage.t4_blizzard_monarch.desc',
    defaultName: 'Blizzard Absolute Monarch',
    defaultDesc: 'Envelops the realm in eternal ice. Multiplies Auto-attack by 1.50x and Offline Rewards by +50%.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_mage_t4_bliz_auto', target: 'autoAttackDamage', type: 'multiplier', value: 1.50 },
      { id: 'mod_mage_t4_bliz_off', target: 'offlineRewardMultiplier', type: 'percent_add', value: 0.50 },
    ],
  },
  {
    id: 'mage_t4_gaia_sage',
    classId: 'mage',
    tier: 4,
    parentId: 'mage_t3_frost_nature',
    nameKey: 'tree.mage.t4_gaia_sage.name',
    descKey: 'tree.mage.t4_gaia_sage.desc',
    defaultName: 'Gaia Sage Ascendant',
    defaultDesc: 'Harmonizes with planetary life force. Multiplies Gold by 1.50x and Spirit Power by 1.50x.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_mage_t4_gaia_gold', target: 'goldMultiplier', type: 'multiplier', value: 1.50 },
      { id: 'mod_mage_t4_gaia_pwr', target: 'powerMultiplier', type: 'multiplier', value: 1.50 },
    ],
  },
];

// Structural validation self-check
const validation = validateTreeStructure(MAGE_NODES);
if (!validation.valid) {
  console.error(`[MageTree] Tree validation error: ${validation.error}`);
}
