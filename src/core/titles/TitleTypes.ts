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
  description: string;
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
    description: string;
  };
}

export interface TitleSaveState {
  unlockedTitleIds: string[];
  equippedTitleId: string | null;
}
