import { SkillNodeDefinition, validateTreeStructure } from '../skillTrees';

export const ARCHER_NODES: SkillNodeDefinition[] = [
  // ==========================================
  // TIER 1: Root Origin (1 Node)
  // ==========================================
  {
    id: 'archer_t1_focus',
    classId: 'archer',
    tier: 1,
    parentId: null,
    nameKey: 'tree.archer.t1_focus.name',
    descKey: 'tree.archer.t1_focus.desc',
    defaultName: 'Wind Marksman Stance',
    defaultDesc: 'Attunes senses to air currents. Increases Attack Speed by +25% and Ranged ATK by +15%.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_archer_t1_spd', target: 'attackSpeed', type: 'percent_add', value: 0.25 },
      { id: 'mod_archer_t1_atk', target: 'attack', type: 'percent_add', value: 0.15 },
    ],
  },

  // ==========================================
  // TIER 2: Major Specializations (2 Nodes)
  // ==========================================
  {
    id: 'archer_t2_rapid_volley',
    classId: 'archer',
    tier: 2,
    parentId: 'archer_t1_focus',
    nameKey: 'tree.archer.t2_rapid_volley.name',
    descKey: 'tree.archer.t2_rapid_volley.desc',
    defaultName: 'Gale Tempest Volley',
    defaultDesc: 'Shoots rapid streams of arrows. Increases Attack Speed by +35% and Manual Click damage by +20%.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_archer_t2_vol_spd', target: 'attackSpeed', type: 'percent_add', value: 0.35 },
      { id: 'mod_archer_t2_vol_man', target: 'manualAttackDamage', type: 'percent_add', value: 0.20 },
    ],
  },
  {
    id: 'archer_t2_beast_hunter',
    classId: 'archer',
    tier: 2,
    parentId: 'archer_t1_focus',
    nameKey: 'tree.archer.t2_beast_hunter.name',
    descKey: 'tree.archer.t2_beast_hunter.desc',
    defaultName: 'Grand Beast Hunter',
    defaultDesc: 'Masters the hunt of mythical monsters. Adds +25% Boss Damage and +50% Pet damage.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_archer_t2_hunt_boss', target: 'bossDamage', type: 'percent_add', value: 0.25 },
      { id: 'mod_archer_t2_hunt_pet', target: 'petDamage', type: 'percent_add', value: 0.50 },
    ],
  },

  // ==========================================
  // TIER 3: Sub-Branches (4 Nodes)
  // ==========================================
  // Under Gale Tempest Volley:
  {
    id: 'archer_t3_phantom_barrage',
    classId: 'archer',
    tier: 3,
    parentId: 'archer_t2_rapid_volley',
    nameKey: 'tree.archer.t3_phantom_barrage.name',
    descKey: 'tree.archer.t3_phantom_barrage.desc',
    defaultName: 'Phantom Arrow Barrage',
    defaultDesc: 'Fires spectral arrows. Multiplies Attack Speed by 1.30x and adds +10% Crit Chance.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_archer_t3_phan_spd', target: 'attackSpeed', type: 'multiplier', value: 1.30 },
      { id: 'mod_archer_t3_phan_crit_ch', target: 'critChance', type: 'flat', value: 0.10 },
    ],
  },
  {
    id: 'archer_t3_heavy_crossbow',
    classId: 'archer',
    tier: 3,
    parentId: 'archer_t2_rapid_volley',
    nameKey: 'tree.archer.t3_heavy_crossbow.name',
    descKey: 'tree.archer.t3_heavy_crossbow.desc',
    defaultName: 'Heavy Siege Crossbow',
    defaultDesc: 'Armored heavy bolt launcher. Multiplies ATK by 1.30x and adds +50% Crit Damage.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_archer_t3_cross_atk', target: 'attack', type: 'multiplier', value: 1.30 },
      { id: 'mod_archer_t3_cross_crit_dmg', target: 'critDamage', type: 'percent_add', value: 0.50 },
    ],
  },
  // Under Grand Beast Hunter:
  {
    id: 'archer_t3_falcon_tamer',
    classId: 'archer',
    tier: 3,
    parentId: 'archer_t2_beast_hunter',
    nameKey: 'tree.archer.t3_falcon_tamer.name',
    descKey: 'tree.archer.t3_falcon_tamer.desc',
    defaultName: 'Falcon Sovereign Tamer',
    defaultDesc: 'Commands aerial raptors. Doubles Pet damage (2.0x) and adds +25% Loot Drop bonus.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_archer_t3_falc_pet', target: 'petDamage', type: 'multiplier', value: 2.0 },
      { id: 'mod_archer_t3_falc_loot', target: 'lootChance', type: 'percent_add', value: 0.25 },
    ],
  },
  {
    id: 'archer_t3_weakpoint_sniper',
    classId: 'archer',
    tier: 3,
    parentId: 'archer_t2_beast_hunter',
    nameKey: 'tree.archer.t3_weakpoint_sniper.name',
    descKey: 'tree.archer.t3_weakpoint_sniper.desc',
    defaultName: 'Deadeye Weakpoint Sniper',
    defaultDesc: 'Pinpoints vital enemy organs. Multiplies Boss Damage by 1.35x and adds +30% Crit Damage.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_archer_t3_snip_boss', target: 'bossDamage', type: 'multiplier', value: 1.35 },
      { id: 'mod_archer_t3_snip_crit', target: 'critDamage', type: 'percent_add', value: 0.30 },
    ],
  },

  // ==========================================
  // TIER 4: Ultimate Mastery (8 Nodes)
  // ==========================================
  // Under Phantom Arrow Barrage:
  {
    id: 'archer_t4_sonic_tempest',
    classId: 'archer',
    tier: 4,
    parentId: 'archer_t3_phantom_barrage',
    nameKey: 'tree.archer.t4_sonic_tempest.name',
    descKey: 'tree.archer.t4_sonic_tempest.desc',
    defaultName: 'Sonic Tempest Emperor',
    defaultDesc: 'Superluminal arrow speed. Increases Attack Speed by +60% and manual click DPS by +50%.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_archer_t4_sonic_spd', target: 'attackSpeed', type: 'percent_add', value: 0.60 },
      { id: 'mod_archer_t4_sonic_man', target: 'manualAttackDamage', type: 'percent_add', value: 0.50 },
    ],
  },
  {
    id: 'archer_t4_astral_rain',
    classId: 'archer',
    tier: 4,
    parentId: 'archer_t3_phantom_barrage',
    nameKey: 'tree.archer.t4_astral_rain.name',
    descKey: 'tree.archer.t4_astral_rain.desc',
    defaultName: 'Celestial Arrowfall',
    defaultDesc: 'Rains luminous starlight arrows. Multiplies ATK by 1.45x and adds +40% Party Damage.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_archer_t4_rain_atk', target: 'attack', type: 'multiplier', value: 1.45 },
      { id: 'mod_archer_t4_rain_ally', target: 'allyDamage', type: 'percent_add', value: 0.40 },
    ],
  },

  // Under Heavy Siege Crossbow:
  {
    id: 'archer_t4_siege_annihilator',
    classId: 'archer',
    tier: 4,
    parentId: 'archer_t3_heavy_crossbow',
    nameKey: 'tree.archer.t4_siege_annihilator.name',
    descKey: 'tree.archer.t4_siege_annihilator.desc',
    defaultName: 'Ballista Fortress Sovereign',
    defaultDesc: 'Cataclysmic siege weaponry. Multiplies ATK by 1.60x and Boss Damage by 1.60x.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_archer_t4_siege_atk', target: 'attack', type: 'multiplier', value: 1.60 },
      { id: 'mod_archer_t4_siege_boss', target: 'bossDamage', type: 'multiplier', value: 1.60 },
    ],
  },
  {
    id: 'archer_t4_fatal_puncture',
    classId: 'archer',
    tier: 4,
    parentId: 'archer_t3_heavy_crossbow',
    nameKey: 'tree.archer.t4_fatal_puncture.name',
    descKey: 'tree.archer.t4_fatal_puncture.desc',
    defaultName: 'Piercing Void Ballista',
    defaultDesc: 'Bolts pierce dimensional barriers. Adds +15% Crit Chance and +80% Crit Damage.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_archer_t4_punc_crit_ch', target: 'critChance', type: 'flat', value: 0.15 },
      { id: 'mod_archer_t4_punc_crit_dmg', target: 'critDamage', type: 'percent_add', value: 0.80 },
    ],
  },

  // Under Falcon Sovereign Tamer:
  {
    id: 'archer_t4_beastlord_apex',
    classId: 'archer',
    tier: 4,
    parentId: 'archer_t3_falcon_tamer',
    nameKey: 'tree.archer.t4_beastlord_apex.name',
    descKey: 'tree.archer.t4_beastlord_apex.desc',
    defaultName: 'Apex Primal Beastlord',
    defaultDesc: 'Supreme ruler of beasts. Triples Pet damage (3.0x) and adds +40% Party Damage.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_archer_t4_apex_pet', target: 'petDamage', type: 'multiplier', value: 3.0 },
      { id: 'mod_archer_t4_apex_ally', target: 'allyDamage', type: 'percent_add', value: 0.40 },
    ],
  },
  {
    id: 'archer_t4_celestial_tracker',
    classId: 'archer',
    tier: 4,
    parentId: 'archer_t3_falcon_tamer',
    nameKey: 'tree.archer.t4_celestial_tracker.name',
    descKey: 'tree.archer.t4_celestial_tracker.desc',
    defaultName: 'Celestial Safari Tracker',
    defaultDesc: 'Finds rare beast dens. Adds +50% Rare Event chance and +50% Loot Drop bonus.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_archer_t4_track_rare', target: 'rareEventChance', type: 'percent_add', value: 0.50 },
      { id: 'mod_archer_t4_track_loot', target: 'lootChance', type: 'percent_add', value: 0.50 },
    ],
  },

  // Under Deadeye Weakpoint Sniper:
  {
    id: 'archer_t4_world_sniper',
    classId: 'archer',
    tier: 4,
    parentId: 'archer_t3_weakpoint_sniper',
    nameKey: 'tree.archer.t4_world_sniper.name',
    descKey: 'tree.archer.t4_world_sniper.desc',
    defaultName: 'Continental God Sniper',
    defaultDesc: 'Strikes across planetary continents. Multiplies Boss Damage by 1.70x and Quest Crystals by +40%.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_archer_t4_world_boss', target: 'bossDamage', type: 'multiplier', value: 1.70 },
      { id: 'mod_archer_t4_world_quest', target: 'questRewardMultiplier', type: 'percent_add', value: 0.40 },
    ],
  },
  {
    id: 'archer_t4_infinite_trajectory',
    classId: 'archer',
    tier: 4,
    parentId: 'archer_t3_weakpoint_sniper',
    nameKey: 'tree.archer.t4_infinite_trajectory.name',
    descKey: 'tree.archer.t4_infinite_trajectory.desc',
    defaultName: 'Infinite Trajectory Saint',
    defaultDesc: 'Perfect arrow prediction. Adds +20% Crit Chance and +100% Crit Damage.',
    costPoints: 1,
    modifiers: [
      { id: 'mod_archer_t4_traj_crit_ch', target: 'critChance', type: 'flat', value: 0.20 },
      { id: 'mod_archer_t4_traj_crit_dmg', target: 'critDamage', type: 'percent_add', value: 1.00 },
    ],
  },
];

// Structural validation self-check
const validation = validateTreeStructure(ARCHER_NODES);
if (!validation.valid) {
  console.error(`[ArcherTree] Tree validation error: ${validation.error}`);
}
