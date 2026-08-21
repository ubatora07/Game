import { ModifierTarget, ModifierType } from '../modifiers/ModifierTypes';
import { CharacterClassId } from '../../content/classes';
import { KarmaBand } from '../karma/KarmaTypes';

export type CraftingMaterialId =
  | 'material_iron_ore'
  | 'material_rare_meteorite'
  | 'material_arcane_essence'
  | 'material_boss_dragon_scale';

export interface CraftingMaterialDefinition {
  id: CraftingMaterialId;
  nameKey: string;
  defaultName: string;
  descKey: string;
  defaultDesc: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  iconSvg: string;
  sourceDescription: string;
}

export type EquipmentSlot = 'weapon' | 'armor' | 'accessory';

export type EquipmentRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export interface EquipmentAffix {
  id: string;
  target: ModifierTarget;
  type: ModifierType;
  value: number;
  label: string;
}

export interface EquipmentBaseStats {
  attack?: number;
  defense?: number;
  hp?: number;
  speed?: number;
  critChance?: number;
  critDamage?: number;
  bossDamage?: number;
}

export interface EquipmentItem {
  id: string;
  templateId: string;
  name: string;
  rarity: EquipmentRarity;
  slot: EquipmentSlot;
  evolutionStage: number; // 1 to 4
  maxEvolutionStage: number;
  level: number;
  baseStats: EquipmentBaseStats;
  affixes: EquipmentAffix[];
  classTags: CharacterClassId[];
  equippedCharacterSlot: 'char_1' | 'char_2' | null;
  iconSvg: string;
  evolutionChainId: string;
  flavorText: string;
}

export type BlacksmithId =
  | 'blacksmith_goran'
  | 'blacksmith_kazador'
  | 'blacksmith_elenya'
  | 'blacksmith_vane';

export interface BlacksmithDefinition {
  id: BlacksmithId;
  nameKey: string;
  defaultName: string;
  titleKey: string;
  defaultTitle: string;
  archetype: 'common' | 'dwarf' | 'arcane' | 'shadow';
  avatarSvg: string;
  masteryLevel: number;
  specializationTags: string[];
  qualityBonusMultiplier: number;
  preferredSlots: EquipmentSlot[];
  dialogue: {
    greeting: string;
    craftSuccess: string;
  };
  unlockCondition: {
    type: 'default' | 'adventure_event' | 'tower_floor' | 'karma_negative';
    requirement?: any;
    description: string;
  };
}

export interface CraftingRecipe {
  id: string;
  nameKey: string;
  defaultName: string;
  category: EquipmentSlot;
  resultTemplateId: string;
  requiredMaterials: Partial<Record<CraftingMaterialId, number>>;
  requiredGold: number;
  requiredWood?: number;
  requiredStone?: number;
  requiredIron?: number;
  requiredForgeLevel: number;
  requiredBlacksmithId?: BlacksmithId;
  requiredKarmaBand?: KarmaBand;
  unlockedByDefault: boolean;
}

export interface CraftingSaveState {
  materials: Record<CraftingMaterialId, number>;
  inventory: EquipmentItem[];
  unlockedRecipes: string[];
  unlockedBlacksmiths: Record<BlacksmithId, boolean>;
  activeBlacksmithId: BlacksmithId;
  totalCraftedCount: number;
  totalEvolvedCount: number;
}
