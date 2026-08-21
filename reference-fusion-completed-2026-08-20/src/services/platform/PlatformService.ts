import { GameStateData } from '../../core/GameState';

export interface IPlatformService {
  init(): Promise<void>;
  isReady(): boolean;
  getLanguage(): 'ru' | 'en';
  showFullscreenAd(): Promise<boolean>;
  showRewardedAd(placement: string): Promise<boolean>;
  loadCloudSave(): Promise<GameStateData | null>;
  saveCloudSave(data: GameStateData): Promise<boolean>;
  setLeaderboardScore(leaderboardName: string, score: number): Promise<void>;
  notifyGameReady(): void;
  notifyGameplayStart(): void;
  notifyGameplayStop(): void;
}
