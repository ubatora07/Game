import { IPlatformService } from './PlatformService';
import { MockPlatformService } from './MockPlatformService';
import { UnavailablePlatformService } from './UnavailablePlatformService';
import { GameStateData } from '../../core/GameState';
import { SaveMigrations } from '../save/SaveMigrations';

declare global {
  interface Window {
    YaGames?: {
      init: () => Promise<any>;
    };
    ysdk?: any;
  }
}

export class YandexGamesService implements IPlatformService {
  private ysdk: any = null;
  private player: any = null;
  private ready: boolean = false;

  public async init(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.YaGames) {
        this.ysdk = await window.YaGames.init();
        this.ready = true;

        try {
          // Initialize player safely
          this.player = await this.ysdk.getPlayer({ scopes: false });
        } catch (playerErr) {
          console.warn('[YandexSDK] Player initialization fallback to guest:', playerErr);
        }

        console.log('[YandexSDK] Successfully initialized Yandex Games SDK.');
      } else {
        console.warn('[YandexSDK] YaGames global not detected. Using fallback.');
      }
    } catch (err) {
      console.error('[YandexSDK] Init error:', err);
    }
  }

  public isReady(): boolean {
    return this.ready && this.ysdk !== null;
  }

  public getLanguage(): 'ru' | 'en' {
    if (this.ysdk?.environment?.i18n?.lang) {
      const lang = this.ysdk.environment.i18n.lang;
      return lang.startsWith('ru') ? 'ru' : 'en';
    }
    return 'ru';
  }

  public async showFullscreenAd(): Promise<boolean> {
    if (!this.isReady()) return false;

    return new Promise((resolve) => {
      this.ysdk.adv.showFullscreenAdv({
        callbacks: {
          onOpen: () => {
            this.notifyGameplayStop();
          },
          onClose: (_wasShown: boolean) => {
            this.notifyGameplayStart();
            resolve(true);
          },
          onError: (err: any) => {
            console.warn('[YandexSDK] Fullscreen ad error:', err);
            this.notifyGameplayStart();
            resolve(false);
          }
        }
      });
    });
  }

  public async showRewardedAd(placement: string): Promise<boolean> {
    if (!this.isReady()) return false;

    return new Promise((resolve) => {
      let rewardEarned = false;

      this.ysdk.adv.showRewardedVideo({
        callbacks: {
          onOpen: () => {
            this.notifyGameplayStop();
          },
          onRewarded: () => {
            rewardEarned = true;
          },
          onClose: () => {
            this.notifyGameplayStart();
            resolve(rewardEarned);
          },
          onError: (err: any) => {
            console.warn(`[YandexSDK] Rewarded ad error for "${placement}":`, err);
            this.notifyGameplayStart();
            resolve(false);
          }
        }
      });
    });
  }

  public async loadCloudSave(): Promise<GameStateData | null> {
    if (!this.player) return null;

    try {
      const data = await this.player.getData(['ANIME_ASCENSION_DATA']);
      if (data && data.ANIME_ASCENSION_DATA) {
        return SaveMigrations.migrate(data.ANIME_ASCENSION_DATA);
      }
    } catch (err) {
      console.warn('[YandexSDK] Failed to load cloud data:', err);
    }

    return null;
  }

  public async saveCloudSave(data: GameStateData): Promise<boolean> {
    if (!this.player) return false;

    try {
      await this.player.setData({
        ANIME_ASCENSION_DATA: data
      });
      return true;
    } catch (err) {
      console.warn('[YandexSDK] Failed to save cloud data:', err);
      return false;
    }
  }

  public async setLeaderboardScore(leaderboardName: string, score: number): Promise<void> {
    if (!this.isReady() || !this.ysdk.isAvailableMethod('leaderboards.setLeaderboardScore')) {
      return;
    }

    try {
      const lb = await this.ysdk.getLeaderboards();
      await lb.setLeaderboardScore(leaderboardName, score);
      console.log(`[YandexSDK] Set score ${score} to leaderboard ${leaderboardName}`);
    } catch (err) {
      console.warn('[YandexSDK] Failed to set leaderboard score:', err);
    }
  }

  public notifyGameReady(): void {
    if (this.ysdk?.features?.LoadingAPI) {
      try {
        this.ysdk.features.LoadingAPI.ready();
        console.log('[YandexSDK] LoadingAPI.ready() fired.');
      } catch (err) {
        console.warn('[YandexSDK] Error notifying ready:', err);
      }
    }
  }

  public notifyGameplayStart(): void {
    if (this.ysdk?.features?.GameplayAPI) {
      try {
        this.ysdk.features.GameplayAPI.start();
      } catch (_) {}
    }
  }

  public notifyGameplayStop(): void {
    if (this.ysdk?.features?.GameplayAPI) {
      try {
        this.ysdk.features.GameplayAPI.stop();
      } catch (_) {}
    }
  }
}

// Factory to resolve platform
export function createPlatformService(isDev: boolean = import.meta.env.DEV): IPlatformService {
  if (typeof window !== 'undefined' && window.YaGames) {
    return new YandexGamesService();
  }
  if (isDev) {
    return new MockPlatformService();
  }
  return new UnavailablePlatformService();
}

export const platform = createPlatformService();
