import { describe, it, expect, beforeEach, vi } from 'vitest';
import { adService, REWARDED_PLACEMENTS } from '../src/services/ads/AdService';
import { platform } from '../src/services/platform/YandexGamesService';
import { events } from '../src/core/EventBus';

describe('Phase 54 — Monetization Repositioning Suite', () => {
  beforeEach(() => {
    adService.resetCooldowns();
  });

  it('P54-01: contains all balanced rewarded placement definitions', () => {
    expect(REWARDED_PLACEMENTS['offline_reward_2x']).toBeDefined();
    expect(REWARDED_PLACEMENTS['boss_retry_boost']).toBeDefined();
    expect(REWARDED_PLACEMENTS['bonus_boss_chest']).toBeDefined();
    expect(REWARDED_PLACEMENTS['temporary_battle_surge']).toBeDefined();
    expect(REWARDED_PLACEMENTS['free_hero_summon']).toBeDefined();

    expect(REWARDED_PLACEMENTS['bonus_boss_chest'].cooldownSeconds).toBe(600); // 10m
    expect(REWARDED_PLACEMENTS['temporary_battle_surge'].cooldownSeconds).toBe(900); // 15m
    expect(REWARDED_PLACEMENTS['free_hero_summon'].cooldownSeconds).toBe(14400); // 4h
  });

  it('P54-02: allows watching boss retry boost without artificial cooldown', async () => {
    vi.spyOn(platform, 'showRewardedAd').mockResolvedValue(true);

    const canWatch = adService.canWatchRewardedPlacement('boss_retry_boost');
    expect(canWatch).toBe(true);

    const success = await adService.showRewardedAd('boss_retry_boost');
    expect(success).toBe(true);
  });

  it('P54-03: enforces cooldowns on high-value rewarded placements', async () => {
    vi.spyOn(platform, 'showRewardedAd').mockResolvedValue(true);

    expect(adService.canWatchRewardedPlacement('bonus_boss_chest')).toBe(true);
    await adService.showRewardedAd('bonus_boss_chest');

    // Immediately after watch, should be on cooldown
    expect(adService.canWatchRewardedPlacement('bonus_boss_chest')).toBe(false);
    expect(adService.getPlacementCooldownRemaining('bonus_boss_chest')).toBeGreaterThan(500);

    // Attempting to watch while on cooldown should safely reject
    const secondWatch = await adService.showRewardedAd('bonus_boss_chest');
    expect(secondWatch).toBe(false);
  });

  it('P54-04: emits ad lifecycle events on completion and failure', async () => {
    let completedPlacement = '';
    let failedPlacement = '';

    const unbind1 = events.on('ad:rewarded_completed', (e) => {
      completedPlacement = e.placement;
    });
    const unbind2 = events.on('ad:rewarded_failed', (e) => {
      failedPlacement = e.placement;
    });

    vi.spyOn(platform, 'showRewardedAd').mockResolvedValue(true);
    await adService.showRewardedAd('offline_reward_2x');
    expect(completedPlacement).toBe('offline_reward_2x');

    vi.spyOn(platform, 'showRewardedAd').mockResolvedValue(false);
    await adService.showRewardedAd('temporary_battle_surge');
    expect(failedPlacement).toBe('temporary_battle_surge');

    unbind1();
    unbind2();
  });

  it('P54-05: respects interstitial fullscreen cooldowns and safety check', async () => {
    vi.spyOn(platform, 'showFullscreenAd').mockResolvedValue(true);

    const firstShow = await adService.showFullscreenAdIfReady('test_trigger');
    expect(firstShow).toBe(true);

    // Immediate second show should be throttled by 90s cooldown
    const secondShow = await adService.showFullscreenAdIfReady('test_trigger_2');
    expect(secondShow).toBe(false);
  });
});
