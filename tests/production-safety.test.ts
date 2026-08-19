import { describe, expect, it } from 'vitest';
declare function require(name: string): any;
declare const process: { cwd(): string };
const fs = require('fs');
const path = require('path');
import { UnavailablePlatformService } from '../src/services/platform/UnavailablePlatformService';
import { YandexGamesService } from '../src/services/platform/YandexGamesService';

const root = process.cwd();

describe('P0 production safety contracts', () => {
  it('keeps DevOverlay behind a DEV-only dynamic import', () => {
    const main = fs.readFileSync(path.join(root, 'src/main.ts'), 'utf8');
    expect(main).not.toMatch(/^import\s+\{?\s*DevOverlay\b/m);
    expect(main).toMatch(/if\s*\(import\.meta\.env\.DEV\)[\s\S]{0,350}await import\('\.\/ui\/components\/DevOverlay'\)/m);
  });

  it('fails closed when the production platform SDK is unavailable', async () => {
    const fallback = new UnavailablePlatformService();
    await fallback.init();
    expect(fallback.isReady()).toBe(false);
    expect(await fallback.showFullscreenAd()).toBe(false);
    expect(await fallback.showRewardedAd('test')).toBe(false);
    expect(await fallback.saveCloudSave({} as never)).toBe(false);
  });

  it('does not grant ad success from an uninitialized Yandex service', async () => {
    const yandex = new YandexGamesService();
    expect(yandex.isReady()).toBe(false);
    expect(await yandex.showFullscreenAd()).toBe(false);
    expect(await yandex.showRewardedAd('offline_reward_2x')).toBe(false);
  });
});
