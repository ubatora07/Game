import { beforeEach, describe, expect, it } from 'vitest';
import { createInitialState, store } from '../src/core/GameState';
import { PROGRESSION_UNLOCKS } from '../src/content/progressionUnlocks';
import { getRankById } from '../src/content/ranks';
import { HeroSystem } from '../src/systems/HeroSystem';

describe('Hero roster progression contract', () => {
  beforeEach(() => {
    store.replace(createInitialState());
  });

  it('treats recruitment as a Rank E starter system with one starter summon funded', () => {
    const state = store.get();
    expect(state.rankId).toBe('E');
    expect(state.crystals).toBeGreaterThanOrEqual(100);
    expect(PROGRESSION_UNLOCKS.hero_roster).toMatchObject({ rankId: 'E', enforcement: 'runtime' });
    expect(HeroSystem.isRecruitmentUnlocked()).toBe(true);
  });

  it('does not advertise Heroes as a new Rank B feature after they are already available', () => {
    expect(getRankById('B').unlockedFeature).not.toBe('heroes');
  });
});
