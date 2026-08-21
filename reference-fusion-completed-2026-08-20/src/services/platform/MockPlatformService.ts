import { IPlatformService } from './PlatformService';
import { GameStateData } from '../../core/GameState';

export class MockPlatformService implements IPlatformService {
  private ready: boolean = false;

  public async init(): Promise<void> {
    this.ready = true;
    console.log('[MockPlatform] Initialized standalone mock platform.');
  }

  public isReady(): boolean {
    return this.ready;
  }

  public getLanguage(): 'ru' | 'en' {
    const navLang = navigator.language || (navigator as any).userLanguage || 'ru';
    return navLang.startsWith('ru') ? 'ru' : 'en';
  }

  public async showFullscreenAd(): Promise<boolean> {
    console.log('[MockPlatform] Fullscreen Ad requested (Simulated success).');
    return true;
  }

  public async showRewardedAd(placement: string): Promise<boolean> {
    console.log(`[MockPlatform] Rewarded Ad shown for "${placement}" (Simulated reward success).`);
    return true;
  }

  public async loadCloudSave(): Promise<GameStateData | null> {
    return null;
  }

  public async saveCloudSave(data: GameStateData): Promise<boolean> {
    console.log('[MockPlatform] saveCloudSave', data);
    return true;
  }

  public async setLeaderboardScore(leaderboardName: string, score: number): Promise<void> {
    console.log(`[MockPlatform] setLeaderboardScore: ${leaderboardName} = ${score}`);
  }

  public notifyGameReady(): void {
    console.log('[MockPlatform] notifyGameReady called.');
  }

  public notifyGameplayStart(): void {
    console.log('[MockPlatform] notifyGameplayStart.');
  }

  public notifyGameplayStop(): void {
    console.log('[MockPlatform] notifyGameplayStop.');
  }
}
