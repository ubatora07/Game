import { describe, it, expect, beforeEach } from 'vitest';
import { FloatingNumbers } from '../src/ui/vfx/FloatingNumbers';
import { SoundService } from '../src/services/audio/SoundService';
import { events } from '../src/core/EventBus';
import { store, createInitialState } from '../src/core/GameState';

describe('Phase 62 — Game Feel Polish Suite', () => {
  const sound = SoundService.getInstance();

  beforeEach(() => {
    store.replace(createInitialState());
  });

  it('P62-01: Floating Numbers Initialization & Safeguards in Node/Browser', () => {
    const mockContainer = {
      appendChild: () => {},
      children: [],
    } as any;

    expect(() => {
      FloatingNumbers.init(mockContainer);
      FloatingNumbers.spawn(100, 100, 5000, false, '+');
      FloatingNumbers.spawn(100, 100, 25000, true, '💥 ');
    }).not.toThrow();
  });

  it('P62-02: Combat Sound Effects Trigger Cleanly Without Errors', () => {
    expect(() => {
      sound.playSlash();
      sound.playHeavySlash();
      sound.playEnemyHit();
      sound.playEnemyDeath();
      sound.playCrit();
      sound.playCoin();
      sound.playTap();
      sound.playUpgrade();
      sound.playAscension();
      sound.playSummon();
      sound.playBossWarning();
      sound.playVictory();
      sound.playDefeat();
      sound.playReincarnation();
    }).not.toThrow();
  });

  it('P62-03: Game Feel Events Bus Dispatching', () => {
    let bossWarningTriggered = false;
    let rankUpTriggered = false;
    let worldClearedTriggered = false;

    events.on('combat:boss_warning', () => {
      bossWarningTriggered = true;
    });

    events.on('ascension:rankUp', () => {
      rankUpTriggered = true;
    });

    events.on('campaign:world_cleared', () => {
      worldClearedTriggered = true;
    });

    events.emit('combat:boss_warning', { bossName: 'Demon Sovereign' });
    events.emit('ascension:rankUp', { rankIndex: 3, rankName: 'Rank B' });
    events.emit('campaign:world_cleared', { worldId: 1 });

    expect(bossWarningTriggered).toBe(true);
    expect(rankUpTriggered).toBe(true);
    expect(worldClearedTriggered).toBe(true);
  });

  it('P62-04: Audio Settings & Volume Control Integration', () => {
    expect(() => {
      store.set((draft) => {
        draft.settings.soundEnabled = false;
        draft.settings.musicEnabled = false;
        draft.settings.soundVolume = 0.5;
        draft.settings.musicVolume = 0.3;
      });
      sound.updateVolumes();
    }).not.toThrow();

    expect(store.get().settings.soundEnabled).toBe(false);
    expect(store.get().settings.soundVolume).toBe(0.5);
  });

  it('P62-05: Reduced Motion & Performance Settings Integration', () => {
    store.set((draft) => {
      draft.settings.reducedMotion = true;
      draft.settings.screenShake = false;
    });

    const settings = store.get().settings;
    expect(settings.reducedMotion).toBe(true);
    expect(settings.screenShake).toBe(false);
  });
});
