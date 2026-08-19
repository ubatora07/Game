import { describe, it, expect, beforeEach, vi } from 'vitest';
import { YandexGamesService } from '../src/services/platform/YandexGamesService';
import { AdService, REWARDED_PLACEMENTS } from '../src/services/ads/AdService';
import { campaignCombatService } from '../src/systems/CampaignCombatService';
import { store, createInitialState } from '../src/core/GameState';
import { SaveService } from '../src/services/save/SaveService';

describe('Phase 63 — Yandex Platform & Lifecycle Revalidation Suite', () => {
  let mockYsdk: any;
  let yandexService: YandexGamesService;

  beforeEach(() => {
    store.replace(createInitialState());

    mockYsdk = {
      features: {
        LoadingAPI: {
          ready: vi.fn(),
        },
        GameplayAPI: {
          start: vi.fn(),
          stop: vi.fn(),
        },
      },
      environment: {
        i18n: { lang: 'ru' },
      },
      adv: {
        showFullscreenAdv: vi.fn(({ callbacks }) => {
          callbacks.onOpen?.();
          callbacks.onClose?.(true);
        }),
        showRewardedVideo: vi.fn(({ callbacks }) => {
          callbacks.onOpen?.();
          callbacks.onRewarded?.();
          callbacks.onClose?.();
        }),
      },
      getPlayer: vi.fn().mockResolvedValue({
        getData: vi.fn().mockResolvedValue({}),
        setData: vi.fn().mockResolvedValue({}),
      }),
      isAvailableMethod: vi.fn().mockReturnValue(true),
    };

    yandexService = new YandexGamesService();
    (yandexService as any).ysdk = mockYsdk;
    (yandexService as any).ready = true;
  });

  it('P63-01: LoadingAPI.ready() notification fires cleanly', () => {
    yandexService.notifyGameReady();
    expect(mockYsdk.features.LoadingAPI.ready).toHaveBeenCalledTimes(1);
  });

  it('P63-02: GameplayAPI start & stop lifecycle tracking', () => {
    yandexService.notifyGameplayStart();
    expect(mockYsdk.features.GameplayAPI.start).toHaveBeenCalledTimes(1);

    yandexService.notifyGameplayStop();
    expect(mockYsdk.features.GameplayAPI.stop).toHaveBeenCalledTimes(1);
  });

  it('P63-03: Rewarded Ad Pause & Resume Lifecycle during Active Battle', async () => {
    campaignCombatService.setPaused(false);
    expect(campaignCombatService.getCombatState().isPaused).toBe(false);

    const adResult = await yandexService.showRewardedAd('boss_retry_boost');
    expect(adResult).toBe(true);

    // Stop on open, start on close
    expect(mockYsdk.features.GameplayAPI.stop).toHaveBeenCalledTimes(1);
    expect(mockYsdk.features.GameplayAPI.start).toHaveBeenCalledTimes(1);
  });

  it('P63-04: Fullscreen Interstitial Ad Follows Safe Lifecycle & Cooldown', async () => {
    const fsResult = await yandexService.showFullscreenAd();
    expect(fsResult).toBe(true);

    expect(mockYsdk.features.GameplayAPI.stop).toHaveBeenCalledTimes(1);
    expect(mockYsdk.features.GameplayAPI.start).toHaveBeenCalledTimes(1);
  });

  it('P63-05: Cloud Save & Load round-trip through Yandex SDK Player Data', async () => {
    const mockPlayerData: Record<string, any> = {};
    const mockPlayer = {
      getData: vi.fn().mockImplementation(async (keys: string[]) => {
        const res: Record<string, any> = {};
        for (const k of keys) {
          if (mockPlayerData[k]) res[k] = mockPlayerData[k];
        }
        return res;
      }),
      setData: vi.fn().mockImplementation(async (obj: Record<string, any>) => {
        Object.assign(mockPlayerData, obj);
      }),
    };

    (yandexService as any).player = mockPlayer;

    const stateToSave = createInitialState();
    stateToSave.gold = 54321;
    stateToSave.power = 98765;

    const saveSuccess = await yandexService.saveCloudSave(stateToSave);
    expect(saveSuccess).toBe(true);
    expect(mockPlayer.setData).toHaveBeenCalledTimes(1);

    const loadedState = await yandexService.loadCloudSave();
    expect(loadedState).toBeDefined();
    expect(loadedState!.gold).toBe(54321);
    expect(loadedState!.power).toBe(98765);
  });

  it('P63-06: Language Detection (RU and EN)', () => {
    mockYsdk.environment.i18n.lang = 'ru-RU';
    expect(yandexService.getLanguage()).toBe('ru');

    mockYsdk.environment.i18n.lang = 'en-US';
    expect(yandexService.getLanguage()).toBe('en');
  });

  it('P63-07: Rewarded Placements Configuration Completeness', () => {
    const placements = Object.values(REWARDED_PLACEMENTS);
    expect(placements.length).toBe(5);

    for (const p of placements) {
      expect(p.id.length).toBeGreaterThan(0);
      expect(p.nameKey.length).toBeGreaterThan(0);
      expect(p.defaultName.length).toBeGreaterThan(0);
      expect(p.description.length).toBeGreaterThan(0);
      expect(p.cooldownSeconds).toBeGreaterThanOrEqual(0);
    }
  });
});
