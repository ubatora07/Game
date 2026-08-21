import { SkillNodeDefinition, validateTreeStructure } from '../skillTrees';

export const SWORDSMAN_NODES: SkillNodeDefinition[] = [
  // ==========================================
  // TIER 1: Root Origin (1 Node)
  // ==========================================
  {
    id: 'sword_t1_vanguard',
    classId: 'swordsman',
    tier: 1,
    parentId: null,
    nameKey: 'tree.sword.t1_vanguard.name',
    descKey: 'tree.sword.t1_vanguard.desc',
    defaultName: 'Vanguard Stance',
    defaultDesc: 'Mastery of foundational sword kata. Increases Melee ATK by +20% and Boss Damage by +15%.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_sword_t1_atk', target: 'attack', type: 'percent_add', value: 0.20 },
      { id: 'mod_sword_t1_boss', target: 'bossDamage', type: 'percent_add', value: 0.15 },
    ],
  },

  // ==========================================
  // TIER 2: Major Specializations (2 Nodes)
  // ==========================================
  {
    id: 'sword_t2_paladin',
    classId: 'swordsman',
    tier: 2,
    parentId: 'sword_t1_vanguard',
    nameKey: 'tree.sword.t2_paladin.name',
    descKey: 'tree.sword.t2_paladin.desc',
    defaultName: 'Holy Paladin Order',
    defaultDesc: 'Swears oath of devotion. Increases Party Damage by +25% and Settlement Defense by +30%.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_sword_t2_pal_ally', target: 'allyDamage', type: 'percent_add', value: 0.25 },
      { id: 'mod_sword_t2_pal_def', target: 'settlementDefense', type: 'percent_add', value: 0.30 },
    ],
  },
  {
    id: 'sword_t2_berserker',
    classId: 'swordsman',
    tier: 2,
    parentId: 'sword_t1_vanguard',
    nameKey: 'tree.sword.t2_berserker.name',
    descKey: 'tree.sword.t2_berserker.desc',
    defaultName: 'Crimson Berserker',
    defaultDesc: 'Embraces the battle fury. Multiplies ATK by 1.25x and adds +25% Boss Damage.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_sword_t2_ber_atk', target: 'attack', type: 'multiplier', value: 1.25 },
      { id: 'mod_sword_t2_ber_boss', target: 'bossDamage', type: 'percent_add', value: 0.25 },
    ],
  },

  // ==========================================
  // TIER 3: Sub-Branches (4 Nodes)
  // ==========================================
  // Under Holy Paladin Order:
  {
    id: 'sword_t3_radiant_aura',
    classId: 'swordsman',
    tier: 3,
    parentId: 'sword_t2_paladin',
    nameKey: 'tree.sword.t3_radiant_aura.name',
    descKey: 'tree.sword.t3_radiant_aura.desc',
    defaultName: 'Radiant Commander Aura',
    defaultDesc: 'Inspires allies on the battlefield. Adds +40% Ally Damage and +25% Gold multiplier.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_sword_t3_rad_ally', target: 'allyDamage', type: 'percent_add', value: 0.40 },
      { id: 'mod_sword_t3_rad_gold', target: 'goldMultiplier', type: 'percent_add', value: 0.25 },
    ],
  },
  {
    id: 'sword_t3_divine_guardian',
    classId: 'swordsman',
    tier: 3,
    parentId: 'sword_t2_paladin',
    nameKey: 'tree.sword.t3_divine_guardian.name',
    descKey: 'tree.sword.t3_divine_guardian.desc',
    defaultName: 'Divine Shield Guardian',
    defaultDesc: 'Impenetrable holy ward. Adds +35% Boss Damage and +50% Settlement Defense.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_sword_t3_div_boss', target: 'bossDamage', type: 'percent_add', value: 0.35 },
      { id: 'mod_sword_t3_div_def', target: 'settlementDefense', type: 'percent_add', value: 0.50 },
    ],
  },
  // Under Crimson Berserker:
  {
    id: 'sword_t3_blood_rage',
    classId: 'swordsman',
    tier: 3,
    parentId: 'sword_t2_berserker',
    nameKey: 'tree.sword.t3_blood_rage.name',
    descKey: 'tree.sword.t3_blood_rage.desc',
    defaultName: 'Blood Rage',
    defaultDesc: 'Unbridled slaughter. Multiplies ATK by 1.35x and adds +40% Crit Damage.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_sword_t3_rage_atk', target: 'attack', type: 'multiplier', value: 1.35 },
      { id: 'mod_sword_t3_rage_crit', target: 'critDamage', type: 'percent_add', value: 0.40 },
    ],
  },
  {
    id: 'sword_t3_blade_duelist',
    classId: 'swordsman',
    tier: 3,
    parentId: 'sword_t2_berserker',
    nameKey: 'tree.sword.t3_blade_duelist.name',
    descKey: 'tree.sword.t3_blade_duelist.desc',
    defaultName: 'Blade Master Duelist',
    defaultDesc: 'Flawless swordplay precision. Increases Attack Speed by +30% and Crit Chance by +8%.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_sword_t3_duel_spd', target: 'attackSpeed', type: 'percent_add', value: 0.30 },
      { id: 'mod_sword_t3_duel_crit_ch', target: 'critChance', type: 'flat', value: 0.08 },
    ],
  },

  // ==========================================
  // TIER 4: Ultimate Mastery (8 Nodes)
  // ==========================================
  // Under Radiant Commander Aura:
  {
    id: 'sword_t4_high_paladin',
    classId: 'swordsman',
    tier: 4,
    parentId: 'sword_t3_radiant_aura',
    nameKey: 'tree.sword.t4_high_paladin.name',
    descKey: 'tree.sword.t4_high_paladin.desc',
    defaultName: 'High Paladin Marshal',
    defaultDesc: 'Supreme martial general. Adds +60% Party Damage and +50% Quest Crystal rewards.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_sword_t4_pal_ally', target: 'allyDamage', type: 'percent_add', value: 0.60 },
      { id: 'mod_sword_t4_pal_quest', target: 'questRewardMultiplier', type: 'percent_add', value: 0.50 },
    ],
  },
  {
    id: 'sword_t4_dawn_templar',
    classId: 'swordsman',
    tier: 4,
    parentId: 'sword_t3_radiant_aura',
    nameKey: 'tree.sword.t4_dawn_templar.name',
    descKey: 'tree.sword.t4_dawn_templar.desc',
    defaultName: 'Templar of the Dawn',
    defaultDesc: 'Holy blade of daylight. Multiplies ATK by 1.45x and adds +35% Rare Event chance.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_sword_t4_dawn_atk', target: 'attack', type: 'multiplier', value: 1.45 },
      { id: 'mod_sword_t4_dawn_rare', target: 'rareEventChance', type: 'percent_add', value: 0.35 },
    ],
  },

  // Under Divine Shield Guardian:
  {
    id: 'sword_t4_aegis_immortal',
    classId: 'swordsman',
    tier: 4,
    parentId: 'sword_t3_divine_guardian',
    nameKey: 'tree.sword.t4_aegis_immortal.name',
    descKey: 'tree.sword.t4_aegis_immortal.desc',
    defaultName: 'Aegis Immortal Fortress',
    defaultDesc: 'Unconquerable bastion. Multiplies ATK by 1.50x and doubles Settlement Defense (x2.0).',
    costPoints: 1,
    modifiers: [
      { id: 'mod_sword_t4_aegis_atk', target: 'attack', type: 'multiplier', value: 1.50 },
      { id: 'mod_sword_t4_aegis_def', target: 'settlementDefense', type: 'multiplier', value: 2.0 },
    ],
  },
  {
    id: 'sword_t4_sanctuary_arbiter',
    classId: 'swordsman',
    tier: 4,
    parentId: 'sword_t3_divine_guardian',
    nameKey: 'tree.sword.t4_sanctuary_arbiter.name',
    descKey: 'tree.sword.t4_sanctuary_arbiter.desc',
    defaultName: 'Sanctuary High Arbiter',
    defaultDesc: 'Protector of sacred ground. Multiplies Boss Damage by 1.60x and Offline Gains by +50%.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_sword_t4_sanc_boss', target: 'bossDamage', type: 'multiplier', value: 1.60 },
      { id: 'mod_sword_t4_sanc_off', target: 'offlineRewardMultiplier', type: 'percent_add', value: 0.50 },
    ],
  },

  // Under Blood Rage:
  {
    id: 'sword_t4_crimson_warlord',
    classId: 'swordsman',
    tier: 4,
    parentId: 'sword_t3_blood_rage',
    nameKey: 'tree.sword.t4_crimson_warlord.name',
    descKey: 'tree.sword.t4_crimson_warlord.desc',
    defaultName: 'Crimson Dragon Warlord',
    defaultDesc: 'Supreme draconic wrath. Multiplies total ATK by 1.60x and Boss Damage by 1.50x.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_sword_t4_warlord_atk', target: 'attack', type: 'multiplier', value: 1.60 },
      { id: 'mod_sword_t4_warlord_boss', target: 'bossDamage', type: 'multiplier', value: 1.50 },
    ],
  },
  {
    id: 'sword_t4_abyssal_dreadguard',
    classId: 'swordsman',
    tier: 4,
    parentId: 'sword_t3_blood_rage',
    nameKey: 'tree.sword.t4_abyssal_dreadguard.name',
    descKey: 'tree.sword.t4_abyssal_dreadguard.desc',
    defaultName: 'Abyssal Dark Guard',
    defaultDesc: 'Channels dark nether steel. Adds +80% Crit Damage and +25% Loot Drop bonus.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_sword_t4_dread_crit', target: 'critDamage', type: 'percent_add', value: 0.80 },
      { id: 'mod_sword_t4_dread_loot', target: 'lootChance', type: 'percent_add', value: 0.25 },
    ],
  },

  // Under Blade Master Duelist:
  {
    id: 'sword_t4_storm_swordmaster',
    classId: 'swordsman',
    tier: 4,
    parentId: 'sword_t3_blade_duelist',
    nameKey: 'tree.sword.t4_storm_swordmaster.name',
    descKey: 'tree.sword.t4_storm_swordmaster.desc',
    defaultName: 'Storm Blade Sovereign',
    defaultDesc: 'Lightning-fast strikes. Increases Attack Speed by +50% and Manual Click ATK by +45%.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_sword_t4_storm_spd', target: 'attackSpeed', type: 'percent_add', value: 0.50 },
      { id: 'mod_sword_t4_storm_man', target: 'manualAttackDamage', type: 'percent_add', value: 0.45 },
    ],
  },
  {
    id: 'sword_t4_legendary_kenshi',
    classId: 'swordsman',
    tier: 4,
    parentId: 'sword_t3_blade_duelist',
    nameKey: 'tree.sword.t4_legendary_kenshi.name',
    descKey: 'tree.sword.t4_legendary_kenshi.desc',
    defaultName: 'Legendary Kenshi Saint',
    defaultDesc: 'Attains sword enlightenment. Adds +15% Crit Chance and +70% Crit Damage.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_sword_t4_kenshi_crit_ch', target: 'critChance', type: 'flat', value: 0.15 },
      { id: 'mod_sword_t4_kenshi_crit_dmg', target: 'critDamage', type: 'percent_add', value: 0.70 },
    ],
  },
];

// Structural validation self-check
const validation = validateTreeStructure(SWORDSMAN_NODES);
if (!validation.valid) {
  console.error(`[SwordsmanTree] Tree validation error: ${validation.error}`);
}
