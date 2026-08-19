export type ModifierTarget =
  // Combat
  | 'attack'
  | 'attackSpeed'
  | 'critChance'
  | 'critDamage'
  | 'bossDamage'
  | 'eliteDamage'
  | 'manualAttackDamage'
  | 'autoAttackDamage'
  | 'spellAttack'
  | 'clickDps'
  // Economy
  | 'goldMultiplier'
  | 'powerMultiplier'
  | 'lootChance'
  | 'lootMultiplier'
  | 'offlineRewardMultiplier'
  | 'questRewardMultiplier'
  // Adventure
  | 'eventChance'
  | 'rareEventChance'
  | 'merchantDiscount'
  | 'karmaMultiplier'
  // Team & Meta
  | 'allyDamage'
  | 'classDamageBonus'
  | 'petDamage'
  | 'settlementDefense';

export type ModifierType = 'flat' | 'percent_add' | 'multiplier';

export type ModifierSourceType =
  | 'class'
  | 'skill_node'
  | 'relic'
  | 'hero'
  | 'pet'
  | 'equipment'
  | 'karma'
  | 'title'
  | 'mercenary'
  | 'settlement'
  | 'rhythm'
  | 'temporary'
  | 'permanent_passive';

export interface ModifierContext {
  characterClass?: 'mage' | 'swordsman' | 'archer' | 'assassin' | string;
  isBoss?: boolean;
  isElite?: boolean;
  isManual?: boolean;
  isRhythmHit?: boolean;
  karmaScore?: number;
  currentWorld?: number;
  currentStage?: string;
  [key: string]: any;
}

export interface GameModifier {
  id: string;
  target: ModifierTarget;
  type: ModifierType;
  value: number;
  source: string;
  sourceType: ModifierSourceType;
  classTag?: 'mage' | 'swordsman' | 'archer' | 'assassin' | string;
  condition?: (context: ModifierContext) => boolean;
}

export interface ModifierBreakdown {
  target: ModifierTarget;
  baseValue: number;
  flatTotal: number;
  percentAddTotal: number;
  multiplierTotal: number;
  finalValue: number;
  appliedModifiers: {
    id: string;
    source: string;
    sourceType: ModifierSourceType;
    type: ModifierType;
    value: number;
  }[];
}
