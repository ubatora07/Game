import { ModifierTarget, ModifierType } from '../modifiers/ModifierTypes';

export type LegacyEndingId =
  | 'ending_savior_mountain_realm'
  | 'ending_dread_sovereign_void'
  | 'ending_eternal_wanderer'
  | 'ending_celestial_ascendant';

export interface LegacyEndingDefinition {
  id: LegacyEndingId;
  titleKey: string;
  defaultTitle: string;
  subtitleKey: string;
  subtitle: string;
  requirementKey: string;
  requirementDesc: string;
  epilogueKey: string;
  epilogueText: string;
  iconSvg: string;
  permanentModifier: {
    target: ModifierTarget;
    type: ModifierType;
    value: number;
    labelKey: string;
    label: string;
  };
}

export interface LegacyEndingSaveState {
  unlockedEndingIds: LegacyEndingId[];
  activeEndingId: LegacyEndingId | null; // Currently equipped active legacy boon (1 at a time)
  totalEndingsCompleted: number;
}
