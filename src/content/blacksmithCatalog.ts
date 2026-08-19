import { BlacksmithDefinition, BlacksmithId } from '../core/crafting/CraftingTypes';

export const BLACKSMITHS: Record<BlacksmithId, BlacksmithDefinition> = {
  blacksmith_goran: {
    id: 'blacksmith_goran',
    nameKey: 'blacksmith.goran.name',
    defaultName: 'Master Goran',
    titleKey: 'blacksmith.goran.title',
    defaultTitle: 'Mountain Forge Guildmaster',
    archetype: 'common',
    masteryLevel: 1,
    specializationTags: ['swordsman', 'heavy_plate', 'balanced_weapon'],
    preferredSlots: ['weapon', 'armor'],
    qualityBonusMultiplier: 1.10, // +10% base stats to crafted weapons
    avatarSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
    dialogue: {
      greeting: 'Steel and fire never lie. Let us hammer out a blade fit for a Sovereign!',
      craftSuccess: 'A magnificent edge! This sword will bite deep into goblin armor.',
    },
    unlockCondition: {
      type: 'default',
      description: 'Available automatically when founding the Forge.',
    },
  },

  blacksmith_kazador: {
    id: 'blacksmith_kazador',
    nameKey: 'blacksmith.kazador.name',
    defaultName: 'Kazador Ironbreaker',
    titleKey: 'blacksmith.kazador.title',
    defaultTitle: 'Ancient Dwarf Rune-Artificer',
    archetype: 'dwarf',
    masteryLevel: 2,
    specializationTags: ['swordsman', 'armor', 'defense', 'shield'],
    preferredSlots: ['armor', 'weapon'],
    qualityBonusMultiplier: 1.15, // +15% armor defense & bonus durability
    avatarSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    dialogue: {
      greeting: 'By the ancestral anvil! You know true craftsmanship when you seek a dwarf!',
      craftSuccess: 'Runic warding embedded! No blade shall pierce this reinforced breastplate.',
    },
    unlockCondition: {
      type: 'adventure_event',
      requirement: 'event_mountain_miner_rescue',
      description: 'Discovered during the Mountain Cavern Adventure Encounter.',
    },
  },

  blacksmith_elenya: {
    id: 'blacksmith_elenya',
    nameKey: 'blacksmith.elenya.name',
    defaultName: 'Elenya Starwhisper',
    titleKey: 'blacksmith.elenya.title',
    defaultTitle: 'Astral Elf Enchantress',
    archetype: 'arcane',
    masteryLevel: 2,
    specializationTags: ['mage', 'archer', 'accessory', 'elemental'],
    preferredSlots: ['accessory', 'weapon'],
    qualityBonusMultiplier: 1.15, // +15% spell power & attack speed
    avatarSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2"><path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07l14.14-14.14"/></svg>`,
    dialogue: {
      greeting: 'The celestial stars guide my hammer. Let us infuse starlight into your implements.',
      craftSuccess: 'Harmonic resonance achieved! The arcane flow in this wand is flawless.',
    },
    unlockCondition: {
      type: 'tower_floor',
      requirement: 10,
      description: 'Recruited upon clearing Tower of Ascension Floor 10.',
    },
  },

  blacksmith_vane: {
    id: 'blacksmith_vane',
    nameKey: 'blacksmith.vane.name',
    defaultName: 'Vane the Shadowsmith',
    titleKey: 'blacksmith.vane.title',
    defaultTitle: 'Clandestine Poison & Dagger Artisan',
    archetype: 'shadow',
    masteryLevel: 3,
    specializationTags: ['assassin', 'crit', 'bleed', 'forbidden'],
    preferredSlots: ['weapon', 'accessory'],
    qualityBonusMultiplier: 1.20, // +20% crit damage
    avatarSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2"><path d="M12 2l4 7-4 13-4-13z"/></svg>`,
    dialogue: {
      greeting: 'Light reveals flaws; shadows hide the killing strike. What silent doom shall we forge?',
      craftSuccess: 'Razor-honed and dipped in shadow venom. One slice is all you will ever need.',
    },
    unlockCondition: {
      type: 'karma_negative',
      requirement: -20,
      description: 'Appears when Sovereign Karma reaches -20 (Dread/Shadow affinity).',
    },
  },
};

export function getBlacksmithDef(id: BlacksmithId): BlacksmithDefinition | undefined {
  return BLACKSMITHS[id];
}

export function getAllBlacksmithDefs(): BlacksmithDefinition[] {
  return Object.values(BLACKSMITHS);
}
