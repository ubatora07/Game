import { ModifierTarget, ModifierType } from '../modifiers/ModifierTypes';

export type TitleCategory =
  | 'achievement'
  | 'karma'
  | 'settlement'
  | 'campaign'
  | 'tower'
  | 'secret'
  | 'social';

export interface TitleModifier {
  labelKey?: string;
  target: ModifierTarget;
  type: ModifierType;
  value: number;
  label: string;
}

export interface TitleDefinition {
  id: string;
  nameKey: string;
  defaultName: string;
  category: TitleCategory;
  badgeSvg: string;
  descriptionKey?: string;
  description: string;
  unlockHintKey?: string;
  unlockHint: string;
  modifiers?: TitleModifier[];
  unlockCondition: {
    type:
      | 'default'
      | 'kills'
      | 'tower_floor'
      | 'settlement_level'
      | 'karma_score'
      | 'reincarnations'
      | 'craft_count'
      | 'easter_egg'
      | 'black_market_purchase'
      | 'market_purchase';
    requirement?: any;
    descriptionKey?: string;
    description: string;
  };
}

export interface TitleSaveState {
  unlockedTitleIds: string[];
  equippedTitleId: string | null;
}
