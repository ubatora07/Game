import { ModifierTarget, ModifierType } from '../modifiers/ModifierTypes';

export type SettlementBuildingId =
  | 'throne_hall'
  | 'forge'
  | 'market'
  | 'tavern'
  | 'barracks'
  | 'farm'
  | 'alchemy'
  | 'pet_house';

export type BuildingPlotSlotId =
  | 'plot_1'
  | 'plot_2'
  | 'plot_3'
  | 'plot_4'
  | 'plot_5'
  | 'plot_6'
  | 'plot_7'
  | 'plot_8';

export type SettlementNPCId =
  | 'npc_elder_aldric'
  | 'npc_blacksmith_goran'
  | 'npc_merchant_lyanna'
  | 'npc_captain_valerius'
  | 'npc_alchemist_zara'
  | 'npc_innkeeper_milo';

export interface SettlementBuildingModifier {
  id: string;
  target: ModifierTarget;
  type: ModifierType;
  valuePerLevel: number;
}

export interface SettlementBuildingDefinition {
  id: SettlementBuildingId;
  nameKey: string;
  descKey: string;
  defaultName: string;
  defaultDesc: string;
  plotSlotId: BuildingPlotSlotId;
  maxLevel: number;
  baseGoldCost: number;
  baseWoodCost: number;
  baseStoneCost: number;
  baseIronCost: number;
  costMultiplier: number;
  iconSvg: string;
  unlockedAtSettlementLevel: number;
  linkedNPCId?: SettlementNPCId;
  modifiers: SettlementBuildingModifier[];
  functionalityKey: string;
  functionalityDescription: string;
}

export interface SettlementBuildingState {
  id: SettlementBuildingId;
  plotSlotId: BuildingPlotSlotId;
  level: number;
  isConstructed: boolean;
  lastProductionTimestamp?: number;
}

export interface NPCDialogueLine {
  id: string;
  textKey: string;
  text: string;
  textRu: string;
  karmaCondition?: 'virtuous' | 'infamous' | 'neutral';
  minSettlementLevel?: number;
  serviceAction?: 'open_forge' | 'open_market' | 'open_tavern' | 'open_alchemy' | 'claim_daily_bounty';
}

export interface SettlementNPCDefinition {
  id: SettlementNPCId;
  nameKey: string;
  defaultName: string;
  titleKey: string;
  defaultTitle: string;
  roleKey: string;
  role: string;
  avatarSvg: string;
  linkedBuildingId: SettlementBuildingId;
  dialogues: NPCDialogueLine[];
  karmaDialogueKeys: {
    virtuous: string;
    infamous: string;
    neutral: string;
  };
  karmaDialogueVariants: {
    virtuous: string;
    infamous: string;
    neutral: string;
  };
}

export interface SettlementNPCState {
  id: SettlementNPCId;
  isUnlocked: boolean;
  affinity: number; // 0 to 100
  dialogueHistory: string[];
  lastAffinityGrantTimestamp?: number;
  dailyAffinityGrantCount?: number;
}

export interface SettlementSaveState {
  isOwned: boolean;
  settlementName: string;
  settlementLevel: number;
  wood: number;
  stone: number;
  iron: number;
  defenseRating: number;
  prosperityRating: number;
  buildings: Record<SettlementBuildingId, SettlementBuildingState>;
  npcs: Record<SettlementNPCId, SettlementNPCState>;
  unlockedPlotCount: number;
  unlockedTitles: string[];
  flags: Record<string, boolean>;
  lastHarvestTimestamp: number;
}
