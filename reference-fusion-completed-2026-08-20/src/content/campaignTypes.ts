export type CampaignMode = 'progress' | 'farm' | 'boss_blocked' | 'rush';
export type EnemyArchetype = 'melee' | 'ranged' | 'tank' | 'magic' | 'elite';
export type BossSpecialMechanic = 'shield' | 'enrage' | 'damage_reduction';

export interface CampaignRewards {
  gold: number;
  power: number;
  crystals?: number;
  essence?: number;
  souls?: number;
}

export interface CampaignWorld {
  id: number;
  nameKey: string;
  defaultName: string;
  descriptionKey: string;
  theme: string;
  emoji: string;
  accentColor: string;
  bgGradient: string;
  stageCount: number;
  minRankIndex: number;
  bgAsset: string;
  musicTrack: string;
  worldModifier?: { type: 'gold' | 'power' | 'essence' | 'crit'; bonusPct: number; label: string };
}

export interface CampaignEnemy {
  id: string;
  nameKey: string;
  defaultName: string;
  archetype: EnemyArchetype;
  baseHpMultiplier: number;
  rewardMultiplier: number;
  spriteId: string;
}

export interface CampaignBoss {
  id: string;
  worldId: number;
  stageId: string;
  nameKey: string;
  defaultName: string;
  titleKey: string;
  defaultTitle: string;
  baseHpMultiplier: number;
  timerSeconds: number;
  spriteId: string;
  specialMechanic?: BossSpecialMechanic;
  firstClearRewards: CampaignRewards;
}

export interface CampaignStage {
  id: string; // e.g. "1-1", "1-10"
  worldId: number;
  stageNumber: number;
  globalIndex: number;
  isBoss: boolean;
  bossId?: string;
  bossTimerSeconds?: number;
  enemyCount: number;
  enemyPool: string[];
  difficulty: number;
  baseHp: number;
  baseRewards: CampaignRewards;
  firstClearRewards: CampaignRewards;
}

export interface BossRetryState {
  bossId: string;
  failedAt: number;
  retryBoostActive: boolean;
}

export interface CampaignState {
  currentWorldId: number;
  currentStageId: string;
  currentEncounter: number;
  highestWorldReached: number;
  highestStageReached: string;
  firstClears: string[];
  campaignMode: CampaignMode;
  autoAdvance: boolean;
  farmStageId: string;
  bossRetryState: BossRetryState | null;
}
