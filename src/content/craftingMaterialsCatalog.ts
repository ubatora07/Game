import { CraftingMaterialDefinition, CraftingMaterialId } from '../core/crafting/CraftingTypes';

export const CRAFTING_MATERIALS: Record<CraftingMaterialId, CraftingMaterialDefinition> = {
  material_iron_ore: {
    id: 'material_iron_ore',
    nameKey: 'material.iron_ore.name',
    defaultName: 'Mountain Iron Ore',
    descKey: 'material.iron_ore.desc',
    defaultDesc: 'Solid crude iron smelted from mountain veins. Basic crafting stock for weapons and armor.',
    rarity: 'common',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M6 3h12l4 6-10 12L2 9z"/></svg>`,
    sourceDescription: 'Mined in Mountain Haven or dropped by common Forest minions.',
  },

  material_rare_meteorite: {
    id: 'material_rare_meteorite',
    nameKey: 'material.rare_meteorite.name',
    defaultName: 'Celestial Meteorite Ore',
    descKey: 'material.rare_meteorite.desc',
    defaultDesc: 'Fallen star fragments imbued with celestial density. Forges reinforced and runic gear.',
    rarity: 'rare',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
    sourceDescription: 'Found in Adventure Encounters, Expeditions, and Elite monster caches.',
  },

  material_arcane_essence: {
    id: 'material_arcane_essence',
    nameKey: 'material.arcane_essence.name',
    defaultName: 'Astral Arcane Essence',
    descKey: 'material.arcane_essence.desc',
    defaultDesc: 'Pure concentrated mana crystals glowing with elemental harmonics. Essential for staves and enchanted jewelry.',
    rarity: 'epic',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"/></svg>`,
    sourceDescription: 'Harvested in Tower Ascension floors and Mystic Shaman encounters.',
  },

  material_boss_dragon_scale: {
    id: 'material_boss_dragon_scale',
    nameKey: 'material.boss_dragon_scale.name',
    defaultName: 'Sovereign Dragon Scale',
    descKey: 'material.boss_dragon_scale.desc',
    defaultDesc: 'Impenetrable volcanic scale from Sovereign dragons and Goblin King Malgok. Forges mythic and legendary evolution stages.',
    rarity: 'legendary',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5"/></svg>`,
    sourceDescription: 'Dropped on World Boss and Tower Apex Boss conquests.',
  },
};

export function getCraftingMaterialDef(id: CraftingMaterialId): CraftingMaterialDefinition | undefined {
  return CRAFTING_MATERIALS[id];
}

export function getAllCraftingMaterialDefs(): CraftingMaterialDefinition[] {
  return Object.values(CRAFTING_MATERIALS);
}
