import { MercenaryDefinition, MercenaryId } from '../core/mercenaries/MercenaryTypes';

export const MERCENARIES: Record<MercenaryId, MercenaryDefinition> = {
  merc_boran: {
    id: 'merc_boran',
    nameKey: 'merc.boran.name',
    defaultName: 'Boran Ironshield',
    titleKey: 'merc.boran.title',
    defaultTitle: 'Veteran Heavy Vanguard',
    archetype: 'swordsman',
    avatarSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    description: 'A battle-hardened knight with impenetrable armor. Taunts elite bosses and reinforces party defenses.',
    costGold: 1200,
    contractDurationMinutes: 30,
    specialtyTag: 'Boss Damage & Defense',
    modifiers: [
      { target: 'bossDamage', type: 'percent_add', value: 0.15, label: '+15% Boss Damage' },
      { target: 'settlementDefense', type: 'flat', value: 30, label: '+30 Settlement Defense' },
    ],
  },

  merc_sylas: {
    id: 'merc_sylas',
    nameKey: 'merc.sylas.name',
    defaultName: 'Sylas the Whisper',
    titleKey: 'merc.sylas.title',
    defaultTitle: 'Shadow Assassin for Hire',
    archetype: 'assassin',
    avatarSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2"><path d="M12 2l4 7-4 13-4-13z"/></svg>`,
    description: 'Strikes from the dark with poisoned blades. Greatly elevates critical strike lethality.',
    costGold: 1500,
    contractDurationMinutes: 30,
    specialtyTag: 'Crit Damage & Speed',
    modifiers: [
      { target: 'critDamage', type: 'percent_add', value: 0.22, label: '+22% Crit Damage' },
      { target: 'attackSpeed', type: 'percent_add', value: 0.08, label: '+8% Attack Speed' },
    ],
  },

  merc_kael: {
    id: 'merc_kael',
    nameKey: 'merc.kael.name',
    defaultName: 'Kaelen Sunspark',
    titleKey: 'merc.kael.title',
    defaultTitle: 'Pyromancer Adept',
    archetype: 'mage',
    avatarSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`,
    description: 'Channels explosive flame storms that burn through waves of campaign minions.',
    costGold: 1400,
    contractDurationMinutes: 30,
    specialtyTag: 'Spell Attack & Wave Burst',
    modifiers: [
      { target: 'spellAttack', type: 'percent_add', value: 0.18, label: '+18% Spell Attack' },
      { target: 'powerMultiplier', type: 'percent_add', value: 0.08, label: '+8% Power Multiplier' },
    ],
  },

  merc_fiona: {
    id: 'merc_fiona',
    nameKey: 'merc.fiona.name',
    defaultName: 'Lady Fiona the Blessed',
    titleKey: 'merc.fiona.title',
    defaultTitle: 'Radiant War-Cleric',
    archetype: 'healer',
    avatarSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2"><path d="M12 2v20M2 12h20"/></svg>`,
    description: 'Chants celestial wards that enrich fortune and bolster team morale.',
    costGold: 1600,
    contractDurationMinutes: 45,
    specialtyTag: 'Fortune & Stability',
    modifiers: [
      { target: 'goldMultiplier', type: 'percent_add', value: 0.15, label: '+15% Gold Multiplier' },
      { target: 'powerMultiplier', type: 'percent_add', value: 0.06, label: '+6% Power Multiplier' },
    ],
  },

  merc_torin: {
    id: 'merc_torin',
    nameKey: 'merc.torin.name',
    defaultName: 'Torin Mountainfist',
    titleKey: 'merc.torin.title',
    defaultTitle: 'Dwarf Fortress Sentinel',
    archetype: 'defender',
    avatarSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    description: 'A heavy dwarven bulwark whose presence reinforces settlement garrison security.',
    costGold: 1800,
    contractDurationMinutes: 60,
    specialtyTag: 'Settlement Defense & Iron Wall',
    modifiers: [
      { target: 'settlementDefense', type: 'flat', value: 60, label: '+60 Settlement Defense' },
    ],
  },

  merc_zephyr: {
    id: 'merc_zephyr',
    nameKey: 'merc.zephyr.name',
    defaultName: 'Zephyr Windstrider',
    titleKey: 'merc.zephyr.title',
    defaultTitle: 'Gale Valley Ranger',
    archetype: 'archer',
    avatarSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2"><polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9"/></svg>`,
    description: 'Unleashes rapid volleys from afar and spots hidden loot caches in enemy caravans.',
    costGold: 1500,
    contractDurationMinutes: 30,
    specialtyTag: 'Attack Speed & Drop Rates',
    modifiers: [
      { target: 'attackSpeed', type: 'percent_add', value: 0.22, label: '+22% Attack Speed' },
      { target: 'clickDps', type: 'percent_add', value: 0.12, label: '+12% Click Impact' },
    ],
  },
};

export function getMercenaryDef(id: MercenaryId): MercenaryDefinition | undefined {
  return MERCENARIES[id];
}

export function getAllMercenaryDefs(): MercenaryDefinition[] {
  return Object.values(MERCENARIES);
}
