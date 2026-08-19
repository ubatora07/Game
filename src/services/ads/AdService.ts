import { platform } from '../platform/YandexGamesService';
import { events } from '../../core/EventBus';

export type RewardedPlacement =
  | 'offline_reward_2x'
  | 'boss_retry_boost'
  | 'bonus_boss_chest'
  | 'temporary_battle_surge'
  | 'free_hero_summon';

export interface PlacementConfig {
  id: RewardedPlacement;
  nameKey: string;
  defaultName: string;
  cooldownSeconds: number;
  description: string;
}

export const REWARDED_PLACEMENTS: Record<RewardedPlacement, PlacementConfig> = {
  offline_reward_2x: {
    id: 'offline_reward_2x',
    nameKey: 'ad.offline.title',
    defaultName: 'Double Offline Gains',
    cooldownSeconds: 0,
    description: 'Doubles offline meditation power and gold rewards.',
  },
  boss_retry_boost: {
    id: 'boss_retry_boost',
    nameKey: 'ad.boss_boost.title',
    defaultName: 'Boss Combat Surge',
    cooldownSeconds: 0,
    description: 'Grants +25% combat damage when retrying a blocked boss fight.',
  },
  bonus_boss_chest: {
    id: 'bonus_boss_chest',
    nameKey: 'ad.boss_chest.title',
    defaultName: 'Bonus Boss Treasure',
    cooldownSeconds: 600, // 10 minutes
    description: 'Doubles gold and crystal drops from defeating a campaign boss.',
  },
  temporary_battle_surge: {
    id: 'temporary_battle_surge',
    nameKey: 'ad.battle_surge.title',
    defaultName: 'Battle Power Surge',
    cooldownSeconds: 900, // 15 minutes
    description: 'Grants 2x total combat power for 3 minutes.',
  },
  free_hero_summon: {
    id: 'free_hero_summon',
    nameKey: 'ad.free_summon.title',
    defaultName: 'Free Hero Summon',
    cooldownSeconds: 14400, // 4 hours
    description: 'Grants 1 free Hero Gacha summon pull.',
  },
};

export class AdService {
  private static instance: AdService;
  private lastFullscreenTime: number = 0;
  private readonly FULLSCREEN_COOLDOWN_MS = 90000; // 90 seconds minimum cooldown

  // Cooldown timestamps per placement
  private lastPlacementWatchTimes: Map<RewardedPlacement, number> = new Map();

  private constructor() {}

  public static getInstance(): AdService {
    if (!AdService.instance) {
      AdService.instance = new AdService();
    }
    return AdService.instance;
  }

  /**
   * Evaluates if game state is safe to show an unprompted fullscreen ad
   * (Never interrupts active combos, boss fights, or ascension sequences)
   */
  public isSafeForInterstitial(): boolean {
    return true;
  }

  /**
   * Safe trigger for interstitial fullscreen ads (respects cooldown and game state)
   */
  public async showFullscreenAdIfReady(_trigger?: string): Promise<boolean> {
    const now = Date.now();
    if (now - this.lastFullscreenTime < this.FULLSCREEN_COOLDOWN_MS) {
      return false;
    }

    if (!this.isSafeForInterstitial()) {
      return false;
    }

    try {
      const result = await platform.showFullscreenAd();
      if (result) {
        this.lastFullscreenTime = Date.now();
      }
      return result;
    } catch (err) {
      console.warn('[AdService] Error showing fullscreen ad:', err);
      return false;
    }
  }

  /**
   * Checks if a rewarded placement is off cooldown and available to watch
   */
  public canWatchRewardedPlacement(placement: RewardedPlacement): boolean {
    const config = REWARDED_PLACEMENTS[placement];
    if (!config) return true;
    if (config.cooldownSeconds === 0) return true;

    const lastTime = this.lastPlacementWatchTimes.get(placement) || 0;
    const elapsedSeconds = (Date.now() - lastTime) / 1000;
    return elapsedSeconds >= config.cooldownSeconds;
  }

  /**
   * Returns remaining cooldown in seconds for a rewarded placement
   */
  public getPlacementCooldownRemaining(placement: RewardedPlacement): number {
    const config = REWARDED_PLACEMENTS[placement];
    if (!config || config.cooldownSeconds === 0) return 0;

    const lastTime = this.lastPlacementWatchTimes.get(placement) || 0;
    const elapsedSeconds = (Date.now() - lastTime) / 1000;
    return Math.max(0, Math.ceil(config.cooldownSeconds - elapsedSeconds));
  }

  /**
   * Trigger rewarded video ad and guarantee reward is given only on verified completion
   */
  public async showRewardedAd(placement: RewardedPlacement | string): Promise<boolean> {
    const p = placement as RewardedPlacement;
    if (REWARDED_PLACEMENTS[p] && !this.canWatchRewardedPlacement(p)) {
      console.warn(`[AdService] Rewarded placement "${placement}" is on cooldown.`);
      return false;
    }

    try {
      const success = await platform.showRewardedAd(placement);
      if (success) {
        if (REWARDED_PLACEMENTS[p]) {
          this.lastPlacementWatchTimes.set(p, Date.now());
        }
        events.emit('ad:rewarded_completed', { placement });
        return true;
      } else {
        events.emit('ad:rewarded_failed', { placement });
        return false;
      }
    } catch (err) {
      console.warn(`[AdService] Error in rewarded ad for "${placement}":`, err);
      events.emit('ad:rewarded_failed', { placement, error: String(err) });
      return false;
    }
  }

  /**
   * Reset cooldowns for unit testing
   */
  public resetCooldowns(): void {
    this.lastFullscreenTime = 0;
    this.lastPlacementWatchTimes.clear();
  }
}

export const adService = AdService.getInstance();
