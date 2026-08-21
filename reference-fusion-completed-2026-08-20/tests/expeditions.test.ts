import { describe, it, expect, beforeEach } from 'vitest';
import { store, createInitialState } from '../src/core/GameState';
import { ExpeditionSystem } from '../src/systems/ExpeditionSystem';

describe('Expedition System', () => {
  beforeEach(() => {
    const state = createInitialState();
    // Give player some heroes based on actual src/content/heroes.ts
    state.heroes['hiro'] = { stars: 1, duplicates: 0 }; // Common, wind
    state.heroes['ren'] = { stars: 3, duplicates: 0 }; // Epic, void
    store.replace(state);
  });

  it('should dispatch a hero if requirements are met', () => {
    // scout_forest requires nothing
    const success = ExpeditionSystem.dispatch('scout_forest', 'hiro');
    expect(success).toBe(true);
    
    const state = store.get();
    expect(state.expeditions.length).toBe(1);
    expect(state.expeditions[0].heroId).toBe('hiro');
  });

  it('should not dispatch if hero is already on expedition', () => {
    ExpeditionSystem.dispatch('scout_forest', 'hiro');
    const success = ExpeditionSystem.dispatch('explore_ruins', 'hiro');
    expect(success).toBe(false);
    expect(store.get().expeditions.length).toBe(1);
  });

  it('should not dispatch if rarity requirement is not met', () => {
    // abyssal_dive requires Epic
    const success = ExpeditionSystem.dispatch('abyssal_dive', 'hiro'); // Hiro is Common
    expect(success).toBe(false);
  });

  it('should dispatch if rarity requirement is met', () => {
    const success = ExpeditionSystem.dispatch('abyssal_dive', 'ren'); // Ren is Epic
    expect(success).toBe(true);
  });

  it('should not claim before duration ends', () => {
    ExpeditionSystem.dispatch('scout_forest', 'hiro');
    const expId = store.get().expeditions[0].id;
    
    const success = ExpeditionSystem.claim(expId);
    expect(success).toBe(false);
  });

  it('should claim after duration ends and grant rewards', () => {
    ExpeditionSystem.dispatch('scout_forest', 'hiro');
    const expId = store.get().expeditions[0].id;
    
    // Fast forward 3 hours
    store.set(draft => {
      draft.expeditions[0].startedAt -= (3 * 3600 * 1000);
    });

    const success = ExpeditionSystem.claim(expId);
    expect(success).toBe(true);
    
    const state = store.get();
    expect(state.expeditions.length).toBe(0);
    // Base rewards for scout_forest: 50 crystals, 10 essence
    expect(state.crystals).toBe(150 + 50); // 150 start + 50
    expect(state.essence).toBe(10);
  });

  it('should apply star multipliers to rewards', () => {
    ExpeditionSystem.dispatch('scout_forest', 'ren'); // 3 stars
    const expId = store.get().expeditions[0].id;
    
    store.set(draft => {
      draft.expeditions[0].startedAt -= (3 * 3600 * 1000);
    });

    ExpeditionSystem.claim(expId);
    const state = store.get();
    
    // 3 stars = 1.2x multiplier
    expect(state.crystals).toBe(150 + Math.floor(50 * 1.2));
    expect(state.essence).toBe(Math.floor(10 * 1.2));
  });
});
