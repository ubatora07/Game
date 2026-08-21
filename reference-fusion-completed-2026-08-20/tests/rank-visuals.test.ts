import { describe, it, expect, beforeEach } from 'vitest';
import { store, createInitialState } from '../src/core/GameState';
import { getRankById, getNextRank, RANKS } from '../src/content/ranks';
import { AscensionSystem } from '../src/systems/AscensionSystem';
import { events } from '../src/core/EventBus';

describe('Phase 37 — Rank Visual Evolution Tests', () => {
  beforeEach(() => {
    const freshState = createInitialState();
    store.replace(freshState);
  });

  it('P37-01: Every Rank defines distinct visual tier properties', () => {
    for (const rank of RANKS) {
      expect(rank.id).toBeDefined();
      expect(rank.color).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(rank.glowColor).toBeDefined();
      expect(rank.auraStyle).toBeDefined();
      expect(rank.avatarIcon).toBeDefined();
      expect(rank.weaponVisual).toBeDefined();
      expect(rank.trailColor).toBeDefined();
    }
  });

  it('P37-02: Rank economy level directly maps to visual form', () => {
    const rankE = getRankById('E');
    expect(rankE.avatarIcon).toBe('🥋');
    expect(rankE.weaponVisual).toBe('Wooden Blade');

    const rankS = getRankById('S');
    expect(rankS.avatarIcon).toBe('🔥');
    expect(rankS.weaponVisual).toBe('Dragon Flamberge');

    const rankImmortal = getRankById('IMMORTAL');
    expect(rankImmortal.avatarIcon).toBe('🌟');
    expect(rankImmortal.weaponVisual).toBe('Infinite Primordial Blade');
  });

  it('P37-03 & P37-04: Ascension progression emits ascension:rankUp with new rank details', () => {
    const state = createInitialState();
    const nextRank = getNextRank('E')!;
    state.power = nextRank.reqPower + 5000;
    store.replace(state);

    let emittedEvent: any = null;
    events.on('ascension:rankUp', (data) => {
      emittedEvent = data;
    });

    const success = AscensionSystem.ascend();
    expect(success).toBe(true);
    expect(store.get().rankId).toBe('D');
    expect(emittedEvent).toBeDefined();
    expect(emittedEvent.newRank).toBe('D');
    expect(emittedEvent.oldRank).toBe('E');
  });

  it('P37-07 & P37-08: Fallback gracefully handles non-existent or corrupted rank ID', () => {
    const fallbackRank = getRankById('NON_EXISTENT_RANK');
    expect(fallbackRank).toBeDefined();
    expect(fallbackRank.id).toBe('E');
    expect(fallbackRank.avatarIcon).toBe('🥋');
    expect(fallbackRank.color).toBe('#94a3b8');
  });
});
