import { CraftingRecipe } from '../core/crafting/CraftingTypes';

export const CRAFTING_RECIPES: Record<string, CraftingRecipe> = {
  recipe_wpn_sword_s1: {
    id: 'recipe_wpn_sword_s1',
    nameKey: 'recipe.wpn_sword_s1.name',
    defaultName: 'Forge Apprentice Greatsword',
    category: 'weapon',
    resultTemplateId: 'wpn_sword_s1',
    requiredMaterials: {
      material_iron_ore: 10,
    },
    requiredGold: 500,
    requiredWood: 15,
    requiredIron: 5,
    requiredForgeLevel: 1,
    unlockedByDefault: true,
  },

  recipe_wpn_bow_s1: {
    id: 'recipe_wpn_bow_s1',
    nameKey: 'recipe.wpn_bow_s1.name',
    defaultName: 'Craft Hunter Shortbow',
    category: 'weapon',
    resultTemplateId: 'wpn_bow_s1',
    requiredMaterials: {
      material_iron_ore: 8,
      material_rare_meteorite: 2,
    },
    requiredGold: 500,
    requiredWood: 20,
    requiredForgeLevel: 1,
    unlockedByDefault: true,
  },

  recipe_wpn_staff_s1: {
    id: 'recipe_wpn_staff_s1',
    nameKey: 'recipe.wpn_staff_s1.name',
    defaultName: 'Carve Arcane Focus Wand',
    category: 'weapon',
    resultTemplateId: 'wpn_staff_s1',
    requiredMaterials: {
      material_iron_ore: 6,
      material_rare_meteorite: 3,
    },
    requiredGold: 500,
    requiredWood: 15,
    requiredForgeLevel: 1,
    unlockedByDefault: true,
  },

  recipe_wpn_dagger_s1: {
    id: 'recipe_wpn_dagger_s1',
    nameKey: 'recipe.wpn_dagger_s1.name',
    defaultName: 'Hone Shadow Stiletto',
    category: 'weapon',
    resultTemplateId: 'wpn_dagger_s1',
    requiredMaterials: {
      material_iron_ore: 8,
      material_rare_meteorite: 2,
    },
    requiredGold: 500,
    requiredIron: 5,
    requiredForgeLevel: 1,
    unlockedByDefault: true,
  },

  recipe_arm_plate_s1: {
    id: 'recipe_arm_plate_s1',
    nameKey: 'recipe.arm_plate_s1.name',
    defaultName: 'Smelt Vanguard Iron Hauberk',
    category: 'armor',
    resultTemplateId: 'arm_plate_s1',
    requiredMaterials: {
      material_iron_ore: 12,
    },
    requiredGold: 600,
    requiredStone: 10,
    requiredIron: 8,
    requiredForgeLevel: 1,
    unlockedByDefault: true,
  },

  recipe_arm_leather_s1: {
    id: 'recipe_arm_leather_s1',
    nameKey: 'recipe.arm_leather_s1.name',
    defaultName: 'Stitch Windrunner Scout Tunic',
    category: 'armor',
    resultTemplateId: 'arm_leather_s1',
    requiredMaterials: {
      material_iron_ore: 8,
      material_rare_meteorite: 2,
    },
    requiredGold: 600,
    requiredWood: 15,
    requiredForgeLevel: 1,
    unlockedByDefault: true,
  },

  recipe_acc_ring_s1: {
    id: 'recipe_acc_ring_s1',
    nameKey: 'recipe.acc_ring_s1.name',
    defaultName: 'Inscribe Bronze Sovereign Band',
    category: 'accessory',
    resultTemplateId: 'acc_ring_s1',
    requiredMaterials: {
      material_iron_ore: 6,
      material_rare_meteorite: 4,
    },
    requiredGold: 800,
    requiredStone: 10,
    requiredForgeLevel: 1,
    unlockedByDefault: true,
  },

  recipe_acc_amulet_s1: {
    id: 'recipe_acc_amulet_s1',
    nameKey: 'recipe.acc_amulet_s1.name',
    defaultName: 'Fashion Merchant Copper Locket',
    category: 'accessory',
    resultTemplateId: 'acc_amulet_s1',
    requiredMaterials: {
      material_iron_ore: 6,
      material_rare_meteorite: 4,
    },
    requiredGold: 800,
    requiredWood: 10,
    requiredForgeLevel: 1,
    unlockedByDefault: true,
  },

  recipe_wpn_sword_s2_direct: {
    id: 'recipe_wpn_sword_s2_direct',
    nameKey: 'recipe.wpn_sword_s2.name',
    defaultName: 'Forge Reinforced Runesword',
    category: 'weapon',
    resultTemplateId: 'wpn_sword_s2',
    requiredMaterials: {
      material_iron_ore: 25,
      material_rare_meteorite: 12,
      material_arcane_essence: 4,
    },
    requiredGold: 5000,
    requiredWood: 25,
    requiredIron: 15,
    requiredForgeLevel: 2,
    requiredBlacksmithId: 'blacksmith_goran',
    unlockedByDefault: false,
  },

  recipe_arm_plate_s2_direct: {
    id: 'recipe_arm_plate_s2_direct',
    nameKey: 'recipe.arm_plate_s2.name',
    defaultName: 'Forge Granite Bulwark Cuirass',
    category: 'armor',
    resultTemplateId: 'arm_plate_s2',
    requiredMaterials: {
      material_iron_ore: 30,
      material_rare_meteorite: 12,
      material_arcane_essence: 4,
    },
    requiredGold: 5000,
    requiredStone: 30,
    requiredIron: 15,
    requiredForgeLevel: 2,
    requiredBlacksmithId: 'blacksmith_kazador',
    unlockedByDefault: false,
  },
};

export function getCraftingRecipe(id: string): CraftingRecipe | undefined {
  return CRAFTING_RECIPES[id];
}

export function getAllCraftingRecipes(): CraftingRecipe[] {
  return Object.values(CRAFTING_RECIPES);
}
