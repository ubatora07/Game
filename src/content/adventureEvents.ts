import { AdventureEventDefinition } from '../core/events/AdventureEventTypes';
import { NARRATIVE_CHAIN_EVENTS } from './narrativeChainsCatalog';

export const ADVENTURE_EVENTS: AdventureEventDefinition[] = [
  // ==========================================
  // 1. CHESTS & LOOT (5 Events)
  // ==========================================
  {
    id: 'evt_chest_ancient_runic',
    titleKey: 'event.chest_ancient_runic.title',
    descKey: 'event.chest_ancient_runic.desc',
    icon: '📦',
    category: 'chest',
    weight: 100,
    cooldownSeconds: 60,
    requirements: { minWorldId: 1 },
    choices: [
      {
        id: 'open_carefully',
        labelKey: 'event.chest_ancient_runic.opt_open',
        outcome: { goldDelta: 2500, crystalsDelta: 15, resultTextKey: 'event.chest_ancient_runic.res_open' },
      },
      {
        id: 'disarm_runes',
        labelKey: 'event.chest_ancient_runic.opt_disarm',
        requiredClass: 'mage',
        outcome: { goldDelta: 4000, crystalsDelta: 30, powerDelta: 1000, resultTextKey: 'event.chest_ancient_runic.res_disarm' },
      },
    ],
  },
  {
    id: 'evt_chest_mimic_cache',
    titleKey: 'event.chest_mimic.title',
    descKey: 'event.chest_mimic.desc',
    icon: '🦷',
    category: 'chest',
    weight: 70,
    cooldownSeconds: 90,
    requirements: { minWorldId: 1 },
    choices: [
      {
        id: 'fight_mimic',
        labelKey: 'event.chest_mimic.opt_fight',
        outcome: { powerDelta: 3500, goldDelta: 1500, resultTextKey: 'event.chest_mimic.res_fight' },
      },
      {
        id: 'tame_mimic',
        labelKey: 'event.chest_mimic.opt_tame',
        requiredClass: 'archer',
        outcome: { powerDelta: 5000, soulsDelta: 10, karmaDelta: 2, resultTextKey: 'event.chest_mimic.res_tame' },
      },
    ],
  },
  {
    id: 'evt_chest_meteor_shard',
    titleKey: 'event.chest_meteor.title',
    descKey: 'event.chest_meteor.desc',
    icon: '☄️',
    category: 'chest',
    weight: 60,
    cooldownSeconds: 120,
    requirements: { minWorldId: 2 },
    choices: [
      {
        id: 'harvest_shard',
        labelKey: 'event.chest_meteor.opt_harvest',
        outcome: { crystalsDelta: 25, soulsDelta: 15, resultTextKey: 'event.chest_meteor.res_harvest' },
      },
    ],
  },
  {
    id: 'evt_chest_sunken_lockbox',
    titleKey: 'event.chest_sunken.title',
    descKey: 'event.chest_sunken.desc',
    icon: '🗝️',
    category: 'chest',
    weight: 80,
    cooldownSeconds: 90,
    requirements: { minWorldId: 1 },
    choices: [
      {
        id: 'dredge_lockbox',
        labelKey: 'event.chest_sunken.opt_dredge',
        outcome: { goldDelta: 3000, resultTextKey: 'event.chest_sunken.res_dredge' },
      },
    ],
  },
  {
    id: 'evt_chest_forgotten_vault',
    titleKey: 'event.chest_vault.title',
    descKey: 'event.chest_vault.desc',
    icon: '🏛️',
    category: 'chest',
    weight: 50,
    cooldownSeconds: 180,
    requirements: { minWorldId: 2, onceOnly: true },
    choices: [
      {
        id: 'plunder_vault',
        labelKey: 'event.chest_vault.opt_plunder',
        outcome: { goldDelta: 10000, crystalsDelta: 50, karmaDelta: -5, resultTextKey: 'event.chest_vault.res_plunder' },
      },
      {
        id: 'consecrate_vault',
        labelKey: 'event.chest_vault.opt_consecrate',
        outcome: { soulsDelta: 40, crystalsDelta: 25, karmaDelta: 10, resultTextKey: 'event.chest_vault.res_consecrate' },
      },
    ],
  },

  // ==========================================
  // 2. TRAVELERS & NPCS (5 Events)
  // ==========================================
  {
    id: 'evt_npc_wandering_scholar',
    titleKey: 'event.npc_scholar.title',
    descKey: 'event.npc_scholar.desc',
    icon: '📜',
    category: 'traveler',
    weight: 90,
    cooldownSeconds: 120,
    requirements: { minWorldId: 1 },
    choices: [
      {
        id: 'share_lore',
        labelKey: 'event.npc_scholar.opt_share',
        outcome: { powerDelta: 2000, crystalsDelta: 10, karmaDelta: 2, resultTextKey: 'event.npc_scholar.res_share' },
      },
    ],
  },
  {
    id: 'evt_npc_injured_paladin',
    titleKey: 'event.npc_paladin.title',
    descKey: 'event.npc_paladin.desc',
    icon: '🛡️',
    category: 'traveler',
    weight: 80,
    cooldownSeconds: 150,
    requirements: { minWorldId: 1 },
    choices: [
      {
        id: 'heal_paladin',
        labelKey: 'event.npc_paladin.opt_heal',
        outcome: { karmaDelta: 8, soulsDelta: 15, resultTextKey: 'event.npc_paladin.res_heal' },
      },
      {
        id: 'rob_paladin',
        labelKey: 'event.npc_paladin.opt_rob',
        outcome: { goldDelta: 4500, karmaDelta: -10, resultTextKey: 'event.npc_paladin.res_rob' },
      },
    ],
  },
  {
    id: 'evt_npc_mysterious_bard',
    titleKey: 'event.npc_bard.title',
    descKey: 'event.npc_bard.desc',
    icon: '🪕',
    category: 'traveler',
    weight: 75,
    cooldownSeconds: 120,
    requirements: { minWorldId: 1 },
    choices: [
      {
        id: 'listen_song',
        labelKey: 'event.npc_bard.opt_listen',
        outcome: { powerDelta: 1500, karmaDelta: 3, resultTextKey: 'event.npc_bard.res_listen' },
      },
    ],
  },
  {
    id: 'evt_npc_lost_apprentice',
    titleKey: 'event.npc_apprentice.title',
    descKey: 'event.npc_apprentice.desc',
    icon: '🔮',
    category: 'traveler',
    weight: 70,
    cooldownSeconds: 140,
    requirements: { minWorldId: 1 },
    choices: [
      {
        id: 'guide_home',
        labelKey: 'event.npc_apprentice.opt_guide',
        outcome: { crystalsDelta: 20, karmaDelta: 5, resultTextKey: 'event.npc_apprentice.res_guide' },
      },
    ],
  },
  {
    id: 'evt_npc_hermit_alchemist',
    titleKey: 'event.npc_alchemist.title',
    descKey: 'event.npc_alchemist.desc',
    icon: '🧪',
    category: 'traveler',
    weight: 65,
    cooldownSeconds: 160,
    requirements: { minWorldId: 2 },
    choices: [
      {
        id: 'drink_elixir',
        labelKey: 'event.npc_alchemist.opt_drink',
        outcome: { powerDelta: 4000, crystalsDelta: 15, resultTextKey: 'event.npc_alchemist.res_drink' },
      },
    ],
  },

  // ==========================================
  // 3. MERCHANTS (4 Events)
  // ==========================================
  {
    id: 'evt_merch_wandering_tinkerer',
    titleKey: 'event.merch_tinkerer.title',
    descKey: 'event.merch_tinkerer.desc',
    icon: '⚙️',
    category: 'merchant',
    weight: 85,
    cooldownSeconds: 100,
    requirements: { minWorldId: 1 },
    choices: [
      {
        id: 'buy_crystal_bundle',
        labelKey: 'event.merch_tinkerer.opt_buy',
        outcome: { crystalsDelta: 25, goldDelta: -1000, resultTextKey: 'event.merch_tinkerer.res_buy' },
      },
      {
        id: 'pass_by',
        labelKey: 'event.merch_tinkerer.opt_pass',
        outcome: { resultTextKey: 'event.merch_tinkerer.res_pass' },
      },
    ],
  },
  {
    id: 'evt_merch_black_market',
    titleKey: 'event.merch_black_market.title',
    descKey: 'event.merch_black_market.desc',
    icon: '🎭',
    category: 'merchant',
    weight: 50,
    cooldownSeconds: 180,
    requirements: { minWorldId: 2, maxKarma: 10 },
    choices: [
      {
        id: 'buy_forbidden_relic',
        labelKey: 'event.merch_black_market.opt_buy',
        outcome: { soulsDelta: 30, goldDelta: -2500, karmaDelta: -3, resultTextKey: 'event.merch_black_market.res_buy' },
      },
      {
        id: 'report_smuggler',
        labelKey: 'event.merch_black_market.opt_report',
        outcome: { karmaDelta: 6, goldDelta: 1000, resultTextKey: 'event.merch_black_market.res_report' },
      },
    ],
  },
  {
    id: 'evt_merch_silk_caravan',
    titleKey: 'event.merch_caravan.title',
    descKey: 'event.merch_caravan.desc',
    icon: '🐪',
    category: 'merchant',
    weight: 75,
    cooldownSeconds: 120,
    requirements: { minWorldId: 1 },
    choices: [
      {
        id: 'trade_gold_for_power',
        labelKey: 'event.merch_caravan.opt_trade',
        outcome: { powerDelta: 5000, goldDelta: -1500, resultTextKey: 'event.merch_caravan.res_trade' },
      },
    ],
  },
  {
    id: 'evt_merch_celestial_vendor',
    titleKey: 'event.merch_celestial.title',
    descKey: 'event.merch_celestial.desc',
    icon: '✨',
    category: 'merchant',
    weight: 40,
    cooldownSeconds: 240,
    requirements: { minWorldId: 3, minKarma: 15 },
    choices: [
      {
        id: 'astral_communion',
        labelKey: 'event.merch_celestial.opt_astral',
        outcome: { crystalsDelta: 50, soulsDelta: 25, resultTextKey: 'event.merch_celestial.res_astral' },
      },
    ],
  },

  // ==========================================
  // 4. AMBUSHES (4 Events)
  // ==========================================
  {
    id: 'evt_ambush_goblin_trap',
    titleKey: 'event.ambush_goblin.title',
    descKey: 'event.ambush_goblin.desc',
    icon: '👺',
    category: 'ambush',
    weight: 95,
    cooldownSeconds: 80,
    requirements: { minWorldId: 1 },
    choices: [
      {
        id: 'counter_attack',
        labelKey: 'event.ambush_goblin.opt_fight',
        outcome: { goldDelta: 1800, powerDelta: 1200, resultTextKey: 'event.ambush_goblin.res_fight' },
      },
    ],
  },
  {
    id: 'evt_ambush_shadow_assassin',
    titleKey: 'event.ambush_assassin.title',
    descKey: 'event.ambush_assassin.desc',
    icon: '🗡️',
    category: 'ambush',
    weight: 60,
    cooldownSeconds: 150,
    requirements: { minWorldId: 2 },
    choices: [
      {
        id: 'parry_and_slay',
        labelKey: 'event.ambush_assassin.opt_parry',
        outcome: { powerDelta: 4000, crystalsDelta: 15, resultTextKey: 'event.ambush_assassin.res_parry' },
      },
    ],
  },
  {
    id: 'evt_ambush_wolf_pack',
    titleKey: 'event.ambush_wolf.title',
    descKey: 'event.ambush_wolf.desc',
    icon: '🐺',
    category: 'ambush',
    weight: 80,
    cooldownSeconds: 100,
    requirements: { minWorldId: 1 },
    choices: [
      {
        id: 'dominate_pack',
        labelKey: 'event.ambush_wolf.opt_dominate',
        outcome: { soulsDelta: 12, powerDelta: 2000, resultTextKey: 'event.ambush_wolf.res_dominate' },
      },
    ],
  },
  {
    id: 'evt_ambush_void_anomaly',
    titleKey: 'event.ambush_void.title',
    descKey: 'event.ambush_void.desc',
    icon: '🌀',
    category: 'ambush',
    weight: 45,
    cooldownSeconds: 200,
    requirements: { minWorldId: 3 },
    choices: [
      {
        id: 'seal_void_rift',
        labelKey: 'event.ambush_void.opt_seal',
        outcome: { crystalsDelta: 35, soulsDelta: 30, karmaDelta: 5, resultTextKey: 'event.ambush_void.res_seal' },
      },
    ],
  },

  // ==========================================
  // 5. VILLAGES (4 Events)
  // ==========================================
  {
    id: 'evt_village_burning_hamlet',
    titleKey: 'event.village_burning.title',
    descKey: 'event.village_burning.desc',
    icon: '🔥',
    category: 'village',
    weight: 70,
    cooldownSeconds: 180,
    requirements: { minWorldId: 1 },
    choices: [
      {
        id: 'extinguish_and_rescue',
        labelKey: 'event.village_burning.opt_rescue',
        outcome: { karmaDelta: 12, crystalsDelta: 15, resultTextKey: 'event.village_burning.res_rescue' },
      },
      {
        id: 'hunt_arsonists',
        labelKey: 'event.village_burning.opt_hunt',
        outcome: { goldDelta: 3500, karmaDelta: -2, resultTextKey: 'event.village_burning.res_hunt' },
      },
    ],
  },
  {
    id: 'evt_village_harvest_fest',
    titleKey: 'event.village_festival.title',
    descKey: 'event.village_festival.desc',
    icon: '🎉',
    category: 'village',
    weight: 80,
    cooldownSeconds: 150,
    requirements: { minWorldId: 1 },
    choices: [
      {
        id: 'join_games',
        labelKey: 'event.village_festival.opt_join',
        outcome: { goldDelta: 2000, powerDelta: 1500, karmaDelta: 4, resultTextKey: 'event.village_festival.res_join' },
      },
    ],
  },
  {
    id: 'evt_village_plagued_outpost',
    titleKey: 'event.village_plague.title',
    descKey: 'event.village_plague.desc',
    icon: '☠️',
    category: 'village',
    weight: 65,
    cooldownSeconds: 180,
    requirements: { minWorldId: 2 },
    choices: [
      {
        id: 'purify_plague',
        labelKey: 'event.village_plague.opt_purify',
        outcome: { karmaDelta: 10, soulsDelta: 20, resultTextKey: 'event.village_plague.res_purify' },
      },
    ],
  },
  {
    id: 'evt_village_rebel_sanctuary',
    titleKey: 'event.village_rebel.title',
    descKey: 'event.village_rebel.desc',
    icon: '🚩',
    category: 'village',
    weight: 55,
    cooldownSeconds: 200,
    requirements: { minWorldId: 2 },
    choices: [
      {
        id: 'aid_rebels',
        labelKey: 'event.village_rebel.opt_aid',
        outcome: { powerDelta: 6000, karmaDelta: -4, resultTextKey: 'event.village_rebel.res_aid' },
      },
    ],
  },

  // ==========================================
  // 6. RECRUITS (Hero Recruits)
  // ==========================================
  {
    id: 'evt_recruit_mercenary',
    titleKey: 'event.recruit_merc.title',
    descKey: 'event.recruit_merc.desc',
    icon: '⚔️',
    category: 'recruit',
    weight: 60,
    cooldownSeconds: 240,
    requirements: { minWorldId: 1 },
    choices: [
      {
        id: 'hire_veteran',
        labelKey: 'event.recruit_merc.opt_hire',
        outcome: { powerDelta: 4500, goldDelta: -1000, unlockHeroId: 'hiro', resultTextKey: 'event.recruit_merc.res_hire' },
      },
    ],
  },
  {
    id: 'evt_recruit_sorceress',
    titleKey: 'event.recruit_sorceress.title',
    descKey: 'event.recruit_sorceress.desc',
    icon: '🧙‍♀️',
    category: 'recruit',
    weight: 50,
    cooldownSeconds: 240,
    requirements: { minWorldId: 2 },
    choices: [
      {
        id: 'welcome_sorceress',
        labelKey: 'event.recruit_sorceress.opt_welcome',
        outcome: { crystalsDelta: 30, powerDelta: 3000, unlockHeroId: 'lin', resultTextKey: 'event.recruit_sorceress.res_welcome' },
      },
    ],
  },
  {
    id: 'evt_recruit_beast_companion',
    titleKey: 'event.recruit_beast.title',
    descKey: 'event.recruit_beast.desc',
    icon: '🦅',
    category: 'recruit',
    weight: 55,
    cooldownSeconds: 220,
    requirements: { minWorldId: 2 },
    choices: [
      {
        id: 'bond_beast',
        labelKey: 'event.recruit_beast.opt_bond',
        outcome: { soulsDelta: 20, powerDelta: 3500, karmaDelta: 3, unlockHeroId: 'tatsu', resultTextKey: 'event.recruit_beast.res_bond' },
      },
    ],
  },
  {
    id: 'evt_recruit_dark_cultist',
    titleKey: 'event.recruit_cultist.title',
    descKey: 'event.recruit_cultist.desc',
    icon: '👤',
    category: 'recruit',
    weight: 45,
    cooldownSeconds: 300,
    requirements: { minWorldId: 1, maxKarma: -15, onceOnly: true },
    choices: [
      {
        id: 'embrace_dark_pact',
        labelKey: 'event.recruit_cultist.opt_embrace',
        outcome: { soulsDelta: 30, karmaDelta: -10, unlockHeroId: 'kuro', resultTextKey: 'event.recruit_cultist.res_embrace' },
      },
    ],
  },
  {
    id: 'evt_recruit_arcane_familiar',
    titleKey: 'event.recruit_familiar.title',
    descKey: 'event.recruit_familiar.desc',
    icon: '✨',
    category: 'recruit',
    weight: 45,
    cooldownSeconds: 300,
    requirements: { minWorldId: 2, requiredClasses: ['mage'], onceOnly: true },
    choices: [
      {
        id: 'summon_astral_familiar',
        labelKey: 'event.recruit_familiar.opt_summon',
        outcome: { crystalsDelta: 40, powerDelta: 6000, unlockHeroId: 'seraphina', resultTextKey: 'event.recruit_familiar.res_summon' },
      },
    ],
  },

  // ==========================================
  // 7. WEIRD & RARE (5 Events)
  // ==========================================
  {
    id: 'evt_rare_wishing_well',
    titleKey: 'event.rare_well.title',
    descKey: 'event.rare_well.desc',
    icon: '⛲',
    category: 'strange_npc',
    weight: 35,
    cooldownSeconds: 300,
    requirements: { minWorldId: 1 },
    choices: [
      {
        id: 'toss_gold_coin',
        labelKey: 'event.rare_well.opt_toss',
        outcome: { crystalsDelta: 35, goldDelta: -500, resultTextKey: 'event.rare_well.res_toss' },
      },
    ],
  },
  {
    id: 'evt_rare_time_clock',
    titleKey: 'event.rare_time.title',
    descKey: 'event.rare_time.desc',
    icon: '⏳',
    category: 'rare_item',
    weight: 30,
    cooldownSeconds: 360,
    requirements: { minWorldId: 2 },
    choices: [
      {
        id: 'wind_chronos_clock',
        labelKey: 'event.rare_time.opt_wind',
        outcome: { powerDelta: 10000, goldDelta: 5000, resultTextKey: 'event.rare_time.res_wind' },
      },
    ],
  },
  {
    id: 'evt_rare_speaking_blade',
    titleKey: 'event.rare_blade.title',
    descKey: 'event.rare_blade.desc',
    icon: '🗡️',
    category: 'strange_npc',
    weight: 25,
    cooldownSeconds: 400,
    requirements: { minWorldId: 2 },
    choices: [
      {
        id: 'humor_the_sword',
        labelKey: 'event.rare_blade.opt_humor',
        outcome: { powerDelta: 7500, karmaDelta: 2, resultTextKey: 'event.rare_blade.res_humor' },
      },
    ],
  },
  {
    id: 'evt_rare_mirror_rift',
    titleKey: 'event.rare_mirror.title',
    descKey: 'event.rare_mirror.desc',
    icon: '🪞',
    category: 'rare_item',
    weight: 20,
    cooldownSeconds: 450,
    requirements: { minWorldId: 3 },
    choices: [
      {
        id: 'gaze_into_mirror',
        labelKey: 'event.rare_mirror.opt_gaze',
        outcome: { soulsDelta: 50, crystalsDelta: 40, resultTextKey: 'event.rare_mirror.res_gaze' },
      },
    ],
  },
  {
    id: 'evt_rare_golden_goose',
    titleKey: 'event.rare_goose.title',
    descKey: 'event.rare_goose.desc',
    icon: '🪿',
    category: 'rare_item',
    weight: 15,
    cooldownSeconds: 500,
    requirements: { minWorldId: 1 },
    choices: [
      {
        id: 'catch_golden_bird',
        labelKey: 'event.rare_goose.opt_catch',
        outcome: { goldDelta: 15000, crystalsDelta: 25, resultTextKey: 'event.rare_goose.res_catch' },
      },
    ],
  },

  // ==========================================
  // 8. PET COMPANION ACQUISITION (Phase 94)
  // ==========================================
  {
    id: 'evt_pet_mystic_egg_nest',
    titleKey: 'event.pet_nest.title',
    descKey: 'event.pet_nest.desc',
    icon: '🥚',
    category: 'story',
    weight: 90,
    cooldownSeconds: 240,
    requirements: { minWorldId: 1 },
    choices: [
      {
        id: 'hatch_ignis',
        labelKey: 'event.pet_nest.opt_fire',
        outcome: {
          unlockPetId: 'pet_ignis_drake',
          powerDelta: 1000,
          resultTextKey: 'event.pet_nest.res_fire',
        },
      },
      {
        id: 'hatch_fenrir',
        labelKey: 'event.pet_nest.opt_water',
        outcome: {
          unlockPetId: 'pet_fenrir_wolf',
          crystalsDelta: 15,
          resultTextKey: 'event.pet_nest.res_water',
        },
      },
      {
        id: 'hatch_sylph',
        labelKey: 'event.pet_nest.opt_wind',
        outcome: {
          unlockPetId: 'pet_sylph_sprite',
          goldDelta: 2000,
          resultTextKey: 'event.pet_nest.res_wind',
        },
      },
      {
        id: 'hatch_aegis',
        labelKey: 'event.pet_nest.opt_earth',
        outcome: {
          unlockPetId: 'pet_aegis_golem',
          soulsDelta: 10,
          resultTextKey: 'event.pet_nest.res_earth',
        },
      },
    ],
  },
  ...NARRATIVE_CHAIN_EVENTS,
];
