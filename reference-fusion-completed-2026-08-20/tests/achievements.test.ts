import { describe, it, expect, beforeEach } from 'vitest';
import { store, createInitialState } from '../src/core/GameState';
import { ACHIEVEMENTS } from '../src/content/achievements';
import { QuestSystem } from '../src/systems/QuestSystem';

describe('Phase 45 — Achievements & Long-Term Goals Tests', () => {
  beforeEach(() => {
    const fresh = createInitialState();
    store.replace(fresh);
  });

  it('P45-01: All achievements have valid definitions and non-throwing check predicates', () => {
    const state = store.get();
    for (const ach of ACHIEVEMENTS) {
      expect(ach.id).toBeDefined();
      expect(ach.nameKey).toBeTruthy();
      expect(ach.descKey).toBeTruthy();
      expect(ach.icon).toBeTruthy();
      expect(ach.rewardCrystals).toBeGreaterThanOrEqual(20);
      expect(typeof ach.check(state)).toBe('boolean');
    }
  });

  it('P45-02: Campaign & World Clear achievements evaluate correctly', () => {
    const w1 = ACHIEVEMENTS.find(a => a.id === 'achieve_world_1')!;
    const w3 = ACHIEVEMENTS.find(a => a.id === 'achieve_world_3')!;
    const b10 = ACHIEVEMENTS.find(a => a.id === 'achieve_bosses_10')!;

    expect(w1).toBeDefined();
    expect(w3).toBeDefined();
    expect(b10).toBeDefined();

    store.set((draft) => {
      draft.stats.campaignWorldsCleared = 3;
      draft.stats.campaignBossesDefeated = 12;
    });

    const state = store.get();
    expect(w1.check(state)).toBe(true);
    expect(w3.check(state)).toBe(true);
    expect(b10.check(state)).toBe(true);
  });

  it('P45-03: Combat kills, crits, and combo achievements evaluate correctly', () => {
    const k100 = ACHIEVEMENTS.find(a => a.id === 'achieve_kills_100')!;
    const c100 = ACHIEVEMENTS.find(a => a.id === 'achieve_crits_100')!;
    const combo50 = ACHIEVEMENTS.find(a => a.id === 'achieve_combo_50')!;

    store.set((draft) => {
      draft.stats.campaignEnemiesDefeated = 150;
      draft.stats.totalCrits = 120;
      draft.combo.count = 55;
    });

    const state = store.get();
    expect(k100.check(state)).toBe(true);
    expect(c100.check(state)).toBe(true);
    expect(combo50.check(state)).toBe(true);
  });

  it('P45-04 & P45-05: Party 5-Star and Samsara achievements evaluate correctly', () => {
    const star5 = ACHIEVEMENTS.find(a => a.id === 'achieve_hero_star_5')!;
    const r5 = ACHIEVEMENTS.find(a => a.id === 'achieve_reincarnate_5')!;
    const s100 = ACHIEVEMENTS.find(a => a.id === 'achieve_souls_100')!;

    store.set((draft) => {
      draft.heroes['hiro'] = { stars: 5, duplicates: 0 };
      draft.reincarnationCount = 5;
      draft.souls = 120;
    });

    const state = store.get();
    expect(star5.check(state)).toBe(true);
    expect(r5.check(state)).toBe(true);
    expect(s100.check(state)).toBe(true);
  });

  it('P45-06 & P45-07: checkAchievements unlocks eligible achievements, awards crystals, and avoids double-claim', () => {
    const initialCrystals = store.get().crystals;

    store.set((draft) => {
      draft.stats.totalClicks = 1;
      draft.stats.campaignEnemiesDefeated = 100;
    });

    QuestSystem.checkAchievements();

    const state = store.get();
    expect(state.claimedAchievements).toContain('first_training');
    expect(state.claimedAchievements).toContain('achieve_kills_100');
    expect(state.crystals).toBeGreaterThan(initialCrystals);

    const crystalsAfter = state.crystals;
    // Running check again should not double grant crystals
    QuestSystem.checkAchievements();
    expect(store.get().crystals).toBe(crystalsAfter);
  });
});
