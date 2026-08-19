export type RaidThreatLevel = 'minor' | 'moderate' | 'severe' | 'boss_siege';

export interface SettlementRaidDefinition {
  id: string;
  nameKey: string;
  defaultName: string;
  factionKey?: string;
  descKey?: string;
  threatLevel: RaidThreatLevel;
  requiredDefense: number;
  attackerFaction: string;
  description: string;
  bannerSvg: string;
  rewardsOnWin: {
    gold: number;
    ironOre?: number;
    meteoriteOre?: number;
    karmaDelta?: number;
  };
  penaltyOnLoss: {
    woodCost: number;
    stoneCost: number;
    goldCost: number;
  };
}

export interface ActiveRaidState {
  raidId: string;
  threatLevel: RaidThreatLevel;
  startTime: number;
  endsAt: number;
  settlementDefenseSnapshot: number;
  isResolved: boolean;
  won?: boolean;
}

export interface SettlementDefenseSaveState {
  lastRaidTimestamp: number;
  totalRaidsDefeated: number;
  totalRaidsFailed: number;
  activeRaid: ActiveRaidState | null;
}
