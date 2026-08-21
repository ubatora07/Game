import { ModifierTarget, ModifierType } from '../modifiers/ModifierTypes';
import { CharacterClassId } from '../../content/classes';

export type PetId = string;

export type PetElement = 'fire' | 'water' | 'earth' | 'wind' | 'astral' | 'shadow';

export type PetEvolutionStage = 1 | 2 | 3;

export interface PetModifier {
  id: string;
  target: ModifierTarget;
  type: ModifierType;
  value: number;
}

export interface PetCombatAction {
  id: string;
  nameKey: string;
  descKey: string;
  defaultName: string;
  defaultDesc: string;
  intervalSeconds: number;
  damageMultiplier: number; // % of protagonist DPS or flat scale
  debuffType?: 'burn' | 'slow' | 'vulnerability' | 'armor_shred';
  debuffDurationSeconds?: number;
  debuffValue?: number; // e.g. 0.20 (+20% damage taken)
}

export interface PetEvolutionDefinition {
  stage: PetEvolutionStage;
  nameKey: string;
  defaultName: string;
  minLevel: number;
  soulCost: number;
  goldCost: number;
  iconSvg: string;
  modifiers: PetModifier[];
  combatAction: PetCombatAction;
}

export interface PetDefinition {
  id: PetId;
  nameKey: string;
  descKey: string;
  defaultName: string;
  defaultDesc: string;
  element: PetElement;
  preferredClass?: CharacterClassId; // Synergy class
  synergyTags?: string[];
  synergyModifiers?: PetModifier[];
  synergyDescKey?: string;
  defaultSynergyDesc?: string;
  themeColor: string;
  accentColor: string;
  evolutions: Record<PetEvolutionStage, PetEvolutionDefinition>;
}

export interface PetInstance {
  id: PetId;
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  evolutionStage: PetEvolutionStage;
  affection: number; // 0 to 100
  unlockedAt: number;
}

export interface PetSaveState {
  ownedPets: Record<PetId, PetInstance>;
  activePetId: PetId | null;
}
