import { ModifierTarget, ModifierType } from '../modifiers/ModifierTypes';

export type MercenaryId =
  | 'merc_boran'
  | 'merc_sylas'
  | 'merc_kael'
  | 'merc_fiona'
  | 'merc_torin'
  | 'merc_zephyr';

export type MercenaryArchetype = 'swordsman' | 'assassin' | 'mage' | 'healer' | 'defender' | 'archer';

export interface MercenaryModifier {
  target: ModifierTarget;
  type: ModifierType;
  value: number;
  label: string;
}

export interface MercenaryDefinition {
  id: MercenaryId;
  nameKey: string;
  defaultName: string;
  titleKey: string;
  defaultTitle: string;
  archetype: MercenaryArchetype;
  avatarSvg: string;
  description: string;
  costGold: number;
  contractDurationMinutes: number; // e.g. 15, 30, 60
  modifiers: MercenaryModifier[];
  specialtyTag: string;
}

export interface ActiveMercenaryContract {
  mercId: MercenaryId;
  hiredAtTimestamp: number;
  expiresAtTimestamp: number;
  durationMinutes: number;
}

export interface MercenarySaveState {
  activeContracts: Record<MercenaryId, ActiveMercenaryContract>;
  totalHiresCount: number;
}
