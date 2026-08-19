import { TitleDefinition } from '../core/titles/TitleTypes';

export const TITLES: Record<string, TitleDefinition> = {
  title_novice_traveler: {
    id: 'title_novice_traveler',
    nameKey: 'title.novice_traveler.name',
    defaultName: 'Novice Traveler',
    category: 'social',
    badgeSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>`,
    descriptionKey: 'title.novice_traveler.desc',
    description: 'An aspiring soul setting foot on the path of cultivation.',
    unlockHintKey: 'title.novice_traveler.hint',
    unlockHint: 'Unlocked by default.',
    modifiers: [],
    unlockCondition: {
      type: 'default',
      descriptionKey: 'title.novice_traveler.requirement',
      description: 'Starting Title.',
    },
  },

  title_pioneer_lord: {
    id: 'title_pioneer_lord',
    nameKey: 'title.pioneer_lord.name',
    defaultName: 'Pioneer Lord',
    category: 'settlement',
    badgeSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`,
    descriptionKey: 'title.pioneer_lord.desc',
    description: 'Founder and sovereign of the Mountain Haven domain.',
    unlockHintKey: 'title.pioneer_lord.hint',
    unlockHint: 'Unlock the Settlement domain.',
    modifiers: [
      { target: 'goldMultiplier', type: 'percent_add', value: 0.05, labelKey: 'title.pioneer_lord.modifier.1', label: '+5% Domain Gold' },
    ],
    unlockCondition: {
      type: 'settlement_level',
      requirement: 1,
      descriptionKey: 'title.pioneer_lord.requirement',
      description: 'Unlock and claim Mountain Haven.',
    },
  },

  title_goblin_slayer: {
    id: 'title_goblin_slayer',
    nameKey: 'title.goblin_slayer.name',
    defaultName: 'Goblin Slayer',
    category: 'campaign',
    badgeSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><path d="M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2"/></svg>`,
    descriptionKey: 'title.goblin_slayer.desc',
    description: 'A terror to green-skinned raiding parties across the whispering woods.',
    unlockHintKey: 'title.goblin_slayer.hint',
    unlockHint: 'Defeat at least 50 campaign monsters.',
    modifiers: [
      { target: 'attack', type: 'flat', value: 15, labelKey: 'title.goblin_slayer.modifier.1', label: '+15 Base Attack' },
    ],
    unlockCondition: {
      type: 'kills',
      requirement: 50,
      descriptionKey: 'title.goblin_slayer.requirement',
      description: 'Slay 50 monsters in the campaign.',
    },
  },

  title_virtuous_champion: {
    id: 'title_virtuous_champion',
    nameKey: 'title.virtuous_champion.name',
    defaultName: 'Virtuous Champion',
    category: 'karma',
    badgeSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    descriptionKey: 'title.virtuous_champion.desc',
    description: 'A beacon of righteousness whose benevolent deeds inspire the realm.',
    unlockHintKey: 'title.virtuous_champion.hint',
    unlockHint: 'Attain +60 or higher Virtuous Karma.',
    modifiers: [
      { target: 'powerMultiplier', type: 'percent_add', value: 0.08, labelKey: 'title.virtuous_champion.modifier.1', label: '+8% Power Multiplier' },
      { target: 'goldMultiplier', type: 'percent_add', value: 0.08, labelKey: 'title.virtuous_champion.modifier.2', label: '+8% Gold Multiplier' },
    ],
    unlockCondition: {
      type: 'karma_score',
      requirement: 60,
      descriptionKey: 'title.virtuous_champion.requirement',
      description: 'Reach +60 Virtuous Karma.',
    },
  },

  title_dread_overlord: {
    id: 'title_dread_overlord',
    nameKey: 'title.dread_overlord.name',
    defaultName: 'Dread Overlord',
    category: 'karma',
    badgeSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2"><path d="M12 2l4 7-4 13-4-13z"/></svg>`,
    descriptionKey: 'title.dread_overlord.desc',
    description: 'Ruled by iron fear and ruthless ambition. Whispered with trembling respect.',
    unlockHintKey: 'title.dread_overlord.hint',
    unlockHint: 'Attain -60 or lower Infamous Karma.',
    modifiers: [
      { target: 'critDamage', type: 'percent_add', value: 0.20, labelKey: 'title.dread_overlord.modifier.1', label: '+20% Crit Damage' },
      { target: 'bossDamage', type: 'percent_add', value: 0.12, labelKey: 'title.dread_overlord.modifier.2', label: '+12% Boss Damage' },
    ],
    unlockCondition: {
      type: 'karma_score',
      requirement: -60,
      descriptionKey: 'title.dread_overlord.requirement',
      description: 'Reach -60 Infamous Karma.',
    },
  },

  title_rhythm_master: {
    id: 'title_rhythm_master',
    nameKey: 'title.rhythm_master.name',
    defaultName: 'Rhythm Master',
    category: 'secret',
    badgeSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`,
    descriptionKey: 'title.rhythm_master.desc',
    description: 'Has achieved perfect harmonic synchrony with the cosmic cadence of battle.',
    unlockHintKey: 'title.rhythm_master.hint',
    unlockHint: 'Unlock the secret 500 Rhythm Streak Easter Egg.',
    modifiers: [
      { target: 'attackSpeed', type: 'percent_add', value: 0.15, labelKey: 'title.rhythm_master.modifier.1', label: '+15% Attack Speed' },
      { target: 'clickDps', type: 'percent_add', value: 0.20, labelKey: 'title.rhythm_master.modifier.2', label: '+20% Click Impact' },
    ],
    unlockCondition: {
      type: 'easter_egg',
      requirement: 'rhythm_easter_egg_500',
      descriptionKey: 'title.rhythm_master.requirement',
      description: 'Achieve a 500 perfect rhythm combo streak.',
    },
  },

  title_tower_ascendant: {
    id: 'title_tower_ascendant',
    nameKey: 'title.tower_ascendant.name',
    defaultName: 'Tower Ascendant',
    category: 'tower',
    badgeSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5"/></svg>`,
    descriptionKey: 'title.tower_ascendant.desc',
    description: 'Conqueror of celestial trials atop the Tower of Ascension.',
    unlockHintKey: 'title.tower_ascendant.hint',
    unlockHint: 'Clear Floor 10 in the Tower of Ascension.',
    modifiers: [
      { target: 'spellAttack', type: 'percent_add', value: 0.10, labelKey: 'title.tower_ascendant.modifier.1', label: '+10% Spell Power' },
    ],
    unlockCondition: {
      type: 'tower_floor',
      requirement: 10,
      descriptionKey: 'title.tower_ascendant.requirement',
      description: 'Clear Tower Floor 10.',
    },
  },

  title_master_artisan: {
    id: 'title_master_artisan',
    nameKey: 'title.master_artisan.name',
    defaultName: 'Master Artisan',
    category: 'achievement',
    badgeSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
    descriptionKey: 'title.master_artisan.desc',
    description: 'A patron of the forge who has hammered out numerous masterwork armaments.',
    unlockHintKey: 'title.master_artisan.hint',
    unlockHint: 'Craft at least 5 equipment pieces.',
    modifiers: [
      { target: 'settlementDefense', type: 'flat', value: 25, labelKey: 'title.master_artisan.modifier.1', label: '+25 Settlement Defense' },
    ],
    unlockCondition: {
      type: 'craft_count',
      requirement: 5,
      descriptionKey: 'title.master_artisan.requirement',
      description: 'Craft 5 equipment items in the Forge.',
    },
  },

  title_ancient_cultivator: {
    id: 'title_ancient_cultivator',
    nameKey: 'title.ancient_cultivator.name',
    defaultName: 'Ancient Cultivator',
    category: 'achievement',
    badgeSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"/></svg>`,
    descriptionKey: 'title.ancient_cultivator.desc',
    description: 'Has passed through the wheel of Samsara multiple times, accumulating eons of wisdom.',
    unlockHintKey: 'title.ancient_cultivator.hint',
    unlockHint: 'Complete at least 3 Reincarnations.',
    modifiers: [
      { target: 'powerMultiplier', type: 'percent_add', value: 0.15, labelKey: 'title.ancient_cultivator.modifier.1', label: '+15% Power Multiplier' },
    ],
    unlockCondition: {
      type: 'reincarnations',
      requirement: 3,
      descriptionKey: 'title.ancient_cultivator.requirement',
      description: 'Complete 3 Samsara Reincarnations.',
    },
  },

  title_shadow_operative: {
    id: 'title_shadow_operative',
    nameKey: 'title.shadow_operative.name',
    defaultName: 'Shadow Operative',
    category: 'karma',
    badgeSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2"><circle cx="12" cy="12" r="8"/><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83"/></svg>`,
    descriptionKey: 'title.shadow_operative.desc',
    description: 'Trusted customer of the clandestine underworld market.',
    unlockHintKey: 'title.shadow_operative.hint',
    unlockHint: 'Purchase forbidden goods from the Black Market.',
    modifiers: [
      { target: 'critDamage', type: 'percent_add', value: 0.15, labelKey: 'title.shadow_operative.modifier.1', label: '+15% Crit Damage' },
    ],
    unlockCondition: {
      type: 'black_market_purchase',
      requirement: 1,
      descriptionKey: 'title.shadow_operative.requirement',
      description: 'Purchase an item from the Black Market.',
    },
  },

  title_baron_of_commerce: {
    id: 'title_baron_of_commerce',
    nameKey: 'title.baron_of_commerce.name',
    defaultName: 'Baron of Commerce',
    category: 'social',
    badgeSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M12 8v8M8 12h8"/></svg>`,
    descriptionKey: 'title.baron_of_commerce.desc',
    description: 'A distinguished patron of Lyanna’s merchant caravan bazaar.',
    unlockHintKey: 'title.baron_of_commerce.hint',
    unlockHint: 'Purchase at least 5 goods from the Market.',
    modifiers: [
      { target: 'goldMultiplier', type: 'percent_add', value: 0.10, labelKey: 'title.baron_of_commerce.modifier.1', label: '+10% Gold Multiplier' },
    ],
    unlockCondition: {
      type: 'market_purchase',
      requirement: 5,
      descriptionKey: 'title.baron_of_commerce.requirement',
      description: 'Purchase 5 items in the Market.',
    },
  },

  title_high_lord: {
    id: 'title_high_lord',
    nameKey: 'title.high_lord.name',
    defaultName: 'High Lord of Eldoria',
    category: 'settlement',
    badgeSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
    descriptionKey: 'title.high_lord.desc',
    description: 'Sworn sovereign who chose the mantle of lordship to lead Mountain Haven into an age of prosperity.',
    unlockHintKey: 'title.high_lord.hint',
    unlockHint: 'Choose the Path of the Sovereign Lord in the Settlement Chronicles.',
    modifiers: [
      { target: 'goldMultiplier', type: 'percent_add', value: 0.10, labelKey: 'title.high_lord.modifier.1', label: '+10% Gold Multiplier' },
      { target: 'settlementDefense', type: 'flat', value: 30, labelKey: 'title.high_lord.modifier.2', label: '+30 Settlement Defense' },
    ],
    unlockCondition: {
      type: 'settlement_level',
      requirement: 2,
      descriptionKey: 'title.high_lord.requirement',
      description: 'Swear the Oath of Lordship in Chapter III.',
    },
  },

  title_unbound_vanguard: {
    id: 'title_unbound_vanguard',
    nameKey: 'title.unbound_vanguard.name',
    defaultName: 'Unbound Vanguard',
    category: 'campaign',
    badgeSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M16.2 7.8l-2 6.4-6.4 2 2-6.4z"/></svg>`,
    descriptionKey: 'title.unbound_vanguard.desc',
    description: 'A free adventurer who champions Mountain Haven without the burden of a crown.',
    unlockHintKey: 'title.unbound_vanguard.hint',
    unlockHint: 'Choose the Path of the Independent Adventurer in the Settlement Chronicles.',
    modifiers: [
      { target: 'attackSpeed', type: 'percent_add', value: 0.10, labelKey: 'title.unbound_vanguard.modifier.1', label: '+10% Attack Speed' },
      { target: 'lootChance', type: 'percent_add', value: 0.10, labelKey: 'title.unbound_vanguard.modifier.2', label: '+10% Loot Chance' },
    ],
    unlockCondition: {
      type: 'default',
      descriptionKey: 'title.unbound_vanguard.requirement',
      description: 'Choose Independent Adventurer Path in Chapter III.',
    },
  },
};

export function getTitleDef(id: string): TitleDefinition | undefined {
  return TITLES[id];
}

export function getAllTitleDefs(): TitleDefinition[] {
  return Object.values(TITLES);
}
