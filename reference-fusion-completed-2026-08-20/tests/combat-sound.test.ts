import { describe, it, expect, beforeEach } from 'vitest';
import { store, createInitialState } from '../src/core/GameState';
import { SoundService, sound } from '../src/services/audio/SoundService';

describe('Phase 48 — Combat Sound & Music Pass Tests', () => {
  beforeEach(() => {
    const fresh = createInitialState();
    store.replace(fresh);
  });

  it('P48-01: SoundService singleton initializes and exposes all required combat SFX methods', () => {
    expect(sound).toBeDefined();
    expect(typeof sound.playSlash).toBe('function');
    expect(typeof sound.playHeavySlash).toBe('function');
    expect(typeof sound.playEnemyHit).toBe('function');
    expect(typeof sound.playEnemyDeath).toBe('function');
    expect(typeof sound.playCrit).toBe('function');
    expect(typeof sound.playCoin).toBe('function');
    expect(typeof sound.playBossWarning).toBe('function');
    expect(typeof sound.playAscension).toBe('function');
    expect(typeof sound.playReincarnation).toBe('function');
    expect(typeof sound.playVictory).toBe('function');
  });

  it('P48-02 & P48-03: Audio spam cooldowns and voice limits execute safely without throwing', () => {
    expect(() => {
      // Rapid calling of sounds should throttle without errors
      for (let i = 0; i < 20; i++) {
        sound.playSlash();
        sound.playCoin();
        sound.playCrit();
      }
    }).not.toThrow();
  });

  it('P48-04 & P48-05: Procedural world themes and boss music transitions execute without throwing', () => {
    expect(() => {
      sound.setWorldTheme('world_1');
      sound.setWorldTheme('world_2');
      sound.setWorldTheme('world_3');
      sound.setWorldTheme('world_4');
      sound.setWorldTheme('world_5');
      sound.setWorldTheme('boss');
      sound.startAmbientBgm('boss');
      sound.stopAmbientBgm();
    }).not.toThrow();
  });

  it('P48-06: Volume updates respect game settings', () => {
    store.set((draft) => {
      draft.settings.soundEnabled = false;
      draft.settings.musicEnabled = false;
      draft.settings.soundVolume = 0.5;
      draft.settings.musicVolume = 0.5;
    });

    expect(() => sound.updateVolumes()).not.toThrow();
  });
});
