import { getRankById } from '../content/ranks';
import { CampaignState } from '../content/campaignTypes';
import { DualTeamSaveState } from './characters/MainCharacterTypes';
import { PetSaveState } from './pets/PetTypes';
import { KarmaState } from './karma/KarmaTypes';
import { WorldSaveState } from './world/WorldStateTypes';
import { AdventureEventSaveState } from './events/AdventureEventTypes';

export interface PlayerStats {
  totalClicks: number;
  totalCrits: number;
  totalBuildingsOwned: number;
  lifetimePower: number;
  lifetimeGold: number;
  campaignGoldEarned: number;
  campaignPowerEarned: number;
  campaignCrystalsEarned: number;
  campaignEnemiesDefeated: number;
  campaignElitesDefeated: number;
  campaignStagesCleared: number;
  campaignBossesDefeated: number;
  campaignWorldsCleared: number;
  totalSummons: number;
  playtimeSeconds: number;
  firstPlayedAt: number;
}

export interface PlayerSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  soundVolume: number;
  musicVolume: number;
  reducedMotion: boolean;
  screenShake: boolean;
  notation: 'standard' | 'scientific';
  language: 'ru' | 'en';
}

export interface PlayerHeroData {
  stars: number;
  duplicates: number;
}

export interface ComboState {
  count: number;
  multiplier: number;
  timer: number;
}

export interface RandomEventState {
  active: boolean;
  type: 'instant_power' | 'frenzy';
  expiresAt: number;
  xPct: number;
  yPct: number;
}

export interface PlayerRelicData {
  level: number;
  duplicates: number;
}

export interface ActiveExpedition {
  id: string; // Unique instance id
  templateId: string;
  heroId: string;
  startedAt: number;
  durationMs: number;
}

export interface PlayerDailyQuest {
  id: string;
  templateId: string;
  progress: number;
  claimed: boolean;
}

export interface GameStateData {
  version: number;
  power: number;
  gold: number;
  crystals: number;
  essence: number;
  souls: number;

  rankId: string;
  rankIndex: number;

  buildings: Record<string, number>;
  upgrades: Record<string, number>;
  heroes: Record<string, PlayerHeroData>;
  soulSkills: Record<string, number>;
  
  relics: Record<string, PlayerRelicData>;
  equippedRelics: (string | null)[];
  
  expeditions: ActiveExpedition[];

  // Daily
  lastDailyResetAt: number;
  loginStreak: number;
  loginRewardClaimed: boolean;
  dailyQuests: PlayerDailyQuest[];

  towerFloor: number;
  towerMaxFloor: number;
  reincarnationCount: number;

  // Campaign
  campaign: CampaignState;

  completedQuests: string[];
  claimedAchievements: string[];
  lastFreeSummonAdAt: number;

  combo: ComboState;
  randomEvent: RandomEventState;

  stats: PlayerStats;
  buffs: {
    celestialSurgeEndsAt: number;
    adPowerSurgeEndsAt: number;
    frenzyEndsAt: number;
  };
  settings: PlayerSettings;
  lastSeenAt: number;
  settlement?: any;
  crafting?: any;
  market?: any;
  mercenaries?: any;
  titles?: any;
  settlementDefense?: any;
  settlementStory?: any;
  legacyEndings?: any;
  partyTeam?: DualTeamSaveState;
  pets?: PetSaveState;
  karma?: KarmaState;
  adventureEvents?: AdventureEventSaveState;
  worldState?: WorldSaveState;
}

export function createInitialState(): GameStateData {
  return {
    version: 7,
    power: 0,
    gold: 0,
    crystals: 150, // Starter crystals for early summon
    essence: 0,
    souls: 0,

    rankId: 'E',
    rankIndex: 0,

    buildings: {},
    upgrades: {},
    heroes: {},
    soulSkills: {},
    
    relics: {},
    equippedRelics: [null, null, null],
    
    expeditions: [],

    lastDailyResetAt: 0,
    loginStreak: 0,
    loginRewardClaimed: false,
    dailyQuests: [],

    towerFloor: 1,
    towerMaxFloor: 1,
    reincarnationCount: 0,

    campaign: {
      currentWorldId: 1,
      currentStageId: '1-1',
      currentEncounter: 1,
      highestWorldReached: 1,
      highestStageReached: '1-1',
      firstClears: [],
      campaignMode: 'progress',
      autoAdvance: true,
      farmStageId: '1-1',
      bossRetryState: null,
    },

    completedQuests: [],
    claimedAchievements: [],
    lastFreeSummonAdAt: 0,

    combo: {
      count: 0,
      multiplier: 1.0,
      timer: 0
    },
    randomEvent: {
      active: false,
      type: 'instant_power',
      expiresAt: 0,
      xPct: 50,
      yPct: 50
    },

    stats: {
      totalClicks: 0,
      totalCrits: 0,
      totalBuildingsOwned: 0,
      lifetimePower: 0,
      lifetimeGold: 0,
      campaignGoldEarned: 0,
      campaignPowerEarned: 0,
      campaignCrystalsEarned: 0,
      campaignEnemiesDefeated: 0,
      campaignElitesDefeated: 0,
      campaignStagesCleared: 0,
      campaignBossesDefeated: 0,
      campaignWorldsCleared: 0,
      totalSummons: 0,
      playtimeSeconds: 0,
      firstPlayedAt: Date.now()
    },
    buffs: {
      celestialSurgeEndsAt: 0,
      adPowerSurgeEndsAt: 0,
      frenzyEndsAt: 0
    },
    settings: {
      soundEnabled: true,
      musicEnabled: true,
      soundVolume: 0.7,
      musicVolume: 0.4,
      reducedMotion: false,
      screenShake: true,
      notation: 'standard',
      language: 'ru'
    },
    lastSeenAt: Date.now()
  };
}

export class GameStore {
  private state: GameStateData;
  private listeners: Set<(state: Readonly<GameStateData>) => void> = new Set();

  constructor(initialState?: GameStateData) {
    this.state = initialState ? { ...initialState } : createInitialState();
  }

  public get(): Readonly<GameStateData> {
    return this.state;
  }

  public set(updater: (draft: GameStateData) => void): void {
    updater(this.state);
    this.notify();
  }

  public replace(newState: GameStateData): void {
    this.state = { ...newState };
    // Ensure rankIndex is synchronized with rankId
    const rank = getRankById(this.state.rankId);
    this.state.rankIndex = rank.index;
    this.notify();
  }

  public subscribe(listener: (state: Readonly<GameStateData>) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.state);
      } catch (err) {
        console.error('Error in GameStore listener:', err);
      }
    });
  }
}

export const store = new GameStore();
