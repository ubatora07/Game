import { GameStateData } from '../../core/GameState';
import { IPlatformService } from './PlatformService';

/**
 * Production-safe fallback used when the real platform SDK is unavailable.
 * It deliberately fails closed: ads never report success, cloud writes never
 * pretend to persist, and no debug/mock rewards are granted.
 */
export class UnavailablePlatformService implements IPlatformService {
  public async init(): Promise<void> {}

  public isReady(): boolean {
    return false;
  }

  public getLanguage(): 'ru' | 'en' {
    if (typeof navigator === 'undefined') return 'ru';
    const lang = navigator.language || (navigator as any).userLanguage || 'ru';
    return lang.startsWith('ru') ? 'ru' : 'en';
  }

  public async showFullscreenAd(): Promise<boolean> {
    return false;
  }

  public async showRewardedAd(_placement: string): Promise<boolean> {
    return false;
  }

  public async loadCloudSave(): Promise<GameStateData | null> {
    return null;
  }

  public async saveCloudSave(_data: GameStateData): Promise<boolean> {
    return false;
  }

  public async setLeaderboardScore(_leaderboardName: string, _score: number): Promise<void> {}

  public notifyGameReady(): void {}
  public notifyGameplayStart(): void {}
  public notifyGameplayStop(): void {}
}
