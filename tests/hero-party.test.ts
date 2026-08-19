import { describe, it, expect, beforeEach } from 'vitest';
import { store, createInitialState } from '../src/core/GameState';
import { HeroSystem } from '../src/systems/HeroSystem';
import { EconomyEngine } from '../src/economy/EconomyEngine';
import { getHeroById, HEROES } from '../src/content/heroes';

describe('Phase 38 — Hero Party Conversion Tests', () => {
  beforeEach(() => {
    const freshState = createInitialState();
    store.replace(freshState);
  });

  it('P38-01: Empty party starts with 0 supports and Solo Cultivator synergy', () => {
    const party = HeroSystem.getActiveParty(3);
    expect(party.length).toBe(0);

    const synergy = HeroSystem.getPartySynergy();
    expect(synergy.partyCount).toBe(0);
    expect(synergy.synergyMultiplier).toBe(1.0);
    expect(synergy.synergyPctText).toBe('+0%');
  });

  it('P38-02: Unlocking heroes assigns them to active party ordered by rarity & stars', () => {
    const state = createInitialState();
    state.heroes['lin'] = { stars: 1, duplicates: 0 }; // Common
    state.heroes['kael'] = { stars: 2, duplicates: 0 }; // Rare
    state.heroes['kuro'] = { stars: 1, duplicates: 0 }; // Mythic
    state.heroes['akari'] = { stars: 3, duplicates: 0 }; // Legendary
    store.replace(state);

    const party = HeroSystem.getActiveParty(3);
    expect(party.length).toBe(3);
    // 1st slot should be Kuro (Mythic)
    expect(party[0].hero.id).toBe('kuro');
    // 2nd slot should be Akari (Legendary)
    expect(party[1].hero.id).toBe('akari');
    // 3rd slot should be Kael (Rare)
    expect(party[2].hero.id).toBe('kael');
  });

  it('P38-03: Party Synergy scales with active support hero count (+5% per member)', () => {
    const state = createInitialState();
    state.heroes['lin'] = { stars: 1, duplicates: 0 };
    state.heroes['ren'] = { stars: 1, duplicates: 0 };
    store.replace(state);

    const synergy = HeroSystem.getPartySynergy();
    expect(synergy.partyCount).toBe(2);
    expect(synergy.synergyMultiplier).toBeCloseTo(1.10, 2);
    expect(synergy.synergyPctText).toBe('+10%');
  });

  it('P38-04: Hero icons and element metadata are defined for every anime hero', () => {
    for (const h of HEROES) {
      expect(h.icon).toBeDefined();
      expect(h.element).toBeDefined();
      expect(h.rarity).toBeDefined();
      expect(h.modifier).toBeDefined();
    }
  });

  it('P38-05 & P38-06: Mathematical aura system is authoritative with 0 duplicate bonus', () => {
    const state = createInitialState();
    state.heroes['lin'] = { stars: 1, duplicates: 0 }; // +15% gold
    store.replace(state);

    const metrics1 = EconomyEngine.calculateMetrics(state);
    expect(metrics1.heroGoldMultiplier).toBeCloseTo(1.15, 2);

    // Star-up Lin to 2 stars (1.3x multiplier on 15% = +19.5%)
    state.heroes['lin'].stars = 2;
    store.replace(state);
    const metrics2 = EconomyEngine.calculateMetrics(state);
    expect(metrics2.heroGoldMultiplier).toBeCloseTo(1.0 + 0.15 * 1.3, 2);
  });
});
