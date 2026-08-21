import { LegacyEndingDefinition, LegacyEndingId } from '../core/legacy/LegacyEndingTypes';

export const LEGACY_ENDINGS: Record<LegacyEndingId, LegacyEndingDefinition> = {
  ending_savior_mountain_realm: {
    id: 'ending_savior_mountain_realm',
    titleKey: 'legacy.ending.savior.title',
    defaultTitle: 'Savior of the Mountain Realm',
    subtitleKey: 'legacy.ending.savior.subtitle',
    subtitle: 'The Golden Age of Mountain Haven',
    requirementKey: 'legacy.ending.savior.requirement',
    requirementDesc: 'Reach Virtuous Alignment (Karma ≥ 50) and upgrade Mountain Haven to Citadel Level 3.',
    epilogueKey: 'legacy.ending.savior.epilogue',
    epilogueText: 'Under your benevolent aegis, Mountain Haven blossomed into the crown jewel of the eastern peaks. Caravans traveled unharmed, the forge fires burned bright, and songs of your valor echoed across generation after generation.',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
    permanentModifier: {
      target: 'powerMultiplier',
      type: 'percent_add',
      value: 0.15,
      labelKey: 'legacy.ending.savior.boon',
      label: 'Savior’s Grace (+15% Power Multiplier while equipped)',
    },
  },

  ending_dread_sovereign_void: {
    id: 'ending_dread_sovereign_void',
    titleKey: 'legacy.ending.dread.title',
    defaultTitle: 'Dread Sovereign of the Void',
    subtitleKey: 'legacy.ending.dread.subtitle',
    subtitle: 'The Iron Fist of Shadow and Blood',
    requirementKey: 'legacy.ending.dread.requirement',
    requirementDesc: 'Reach Infamous Alignment (Karma ≤ -50) and complete the Black Market network expansion.',
    epilogueKey: 'legacy.ending.dread.epilogue',
    epilogueText: 'The realm whispers your name with terror. From subterranean caverns to mountain fortresses, no smuggler, lord, or warlord dared defy your shadow decree. You ruled supreme through fear, claiming dominion over life and death itself.',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2"><path d="M12 2l4 7-4 13-4-13z"/></svg>`,
    permanentModifier: {
      target: 'critDamage',
      type: 'percent_add',
      value: 0.25,
      labelKey: 'legacy.ending.dread.boon',
      label: 'Dread Sovereign Blood (+25% Crit Damage while equipped)',
    },
  },

  ending_eternal_wanderer: {
    id: 'ending_eternal_wanderer',
    titleKey: 'legacy.ending.wanderer.title',
    defaultTitle: 'The Eternal Wanderer',
    subtitleKey: 'legacy.ending.wanderer.subtitle',
    subtitle: 'Unbound Spirit of the Four Winds',
    requirementKey: 'legacy.ending.wanderer.requirement',
    requirementDesc: 'Maintain Neutral Balance (-15 ≤ Karma ≤ 15) and complete multi-stage adventure event sagas.',
    epilogueKey: 'legacy.ending.wanderer.epilogue',
    epilogueText: 'Refusing the shackles of crowns, thrones, and cults, you walked the misty highlands and boundless valleys with your companions. The world was your sanctuary, and your legacy remains the free wind that bows to no king.',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M16.2 7.8l-2 6.4-6.4 2 2-6.4z"/></svg>`,
    permanentModifier: {
      target: 'attackSpeed',
      type: 'percent_add',
      value: 0.15,
      labelKey: 'legacy.ending.wanderer.boon',
      label: 'Wanderer’s Swiftness (+15% Attack Speed while equipped)',
    },
  },

  ending_celestial_ascendant: {
    id: 'ending_celestial_ascendant',
    titleKey: 'legacy.ending.ascendant.title',
    defaultTitle: 'Celestial Ascendant',
    subtitleKey: 'legacy.ending.ascendant.subtitle',
    subtitle: 'Shatterer of the Samsara Wheel',
    requirementKey: 'legacy.ending.ascendant.requirement',
    requirementDesc: 'Conquer Tower Floor 50 and achieve 3 or more Reincarnation Ascensions.',
    epilogueKey: 'legacy.ending.ascendant.epilogue',
    epilogueText: 'Transcending the mortal coil, you pierced the ninth celestial heavens. The cycles of life and rebirth became mere threads in your hands as you ascended into cosmic immortality.',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
    permanentModifier: {
      target: 'bossDamage',
      type: 'percent_add',
      value: 0.20,
      labelKey: 'legacy.ending.ascendant.boon',
      label: 'Celestial Ascendant Aura (+20% Boss Damage while equipped)',
    },
  },
};

export function getLegacyEndingDef(id: LegacyEndingId): LegacyEndingDefinition | undefined {
  return LEGACY_ENDINGS[id];
}

export function getAllLegacyEndingDefs(): LegacyEndingDefinition[] {
  return Object.values(LEGACY_ENDINGS);
}
