import { CharacterClassId } from '../../content/classes';

export type AdventureEventCategory =
  | 'chest'
  | 'traveler'
  | 'recruit'
  | 'ambush'
  | 'village'
  | 'merchant'
  | 'rare_item'
  | 'strange_npc'
  | 'story'
  | 'choice';

export interface AdventureEventOutcome {
  resultTextKey: string;
  goldDelta?: number;
  crystalsDelta?: number;
  powerDelta?: number;
  soulsDelta?: number;
  karmaDelta?: number;
  buffId?: string;
  followUpEventId?: string;
  unlockHeroId?: string;
  unlockPetId?: string;
  unlockTitleId?: string;
  materialId?: string;
  materialCount?: number;
  flagId?: string;
  flagValue?: boolean;
}

export interface AdventureEventChoice {
  id: string;
  labelKey: string;
  descKey?: string;
  requiredKarma?: number;
  requiredClass?: CharacterClassId;
  requiredPetId?: string;
  requiredTitleId?: string;
  requiredGold?: number;
  outcome: AdventureEventOutcome;
}

export interface AdventureEventRequirement {
  minWorldId?: number;
  maxWorldId?: number;
  requiredClasses?: CharacterClassId[];
  requiredPetId?: string;
  requiredFlag?: string;
  minKarma?: number;
  maxKarma?: number;
  minRank?: string;
  onceOnly?: boolean;
}

export interface AdventureEventDefinition {
  id: string;
  titleKey: string;
  descKey: string;
  icon: string;
  category: AdventureEventCategory;
  weight: number;
  cooldownSeconds: number;
  requirements?: AdventureEventRequirement;
  choices: AdventureEventChoice[];
}

export interface AdventureEventContext {
  worldId: number;
  activeClasses: CharacterClassId[];
  currentKarma: number;
  rank: string;
  gold: number;
}
