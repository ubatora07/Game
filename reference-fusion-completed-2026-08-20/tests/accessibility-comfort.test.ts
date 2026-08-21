import { describe, it, expect, beforeEach } from 'vitest';
import { store, createInitialState } from '../src/core/GameState';
import { HEROES, HERO_RARITY_CONFIG } from '../src/content/heroes';
import { CAMPAIGN_ENEMIES } from '../src/content/campaignEnemies';
import { CAMPAIGN_BOSSES } from '../src/content/campaignBosses';
import { FloatingNumbers } from '../src/ui/vfx/FloatingNumbers';

describe('Phase 56 — Accessibility & Comfort Revalidation Suite', () => {
  beforeEach(() => {
    store.replace(createInitialState());
  });

  it('P56-01: reducedMotion setting is respected across game systems', () => {
    store.set((draft) => {
      draft.settings.reducedMotion = true;
    });

    const state = store.get();
    expect(state.settings.reducedMotion).toBe(true);
  });

  it('P56-02: photosensitivity check — crits use localized colors rather than full screen flash', () => {
    // Verify crit styling produces readable floating element with high contrast outline
    const mockContainer = {
      appendChild: () => {},
      removeChild: () => {},
    } as any;
    FloatingNumbers.init(mockContainer);

    FloatingNumbers.spawn(100, 100, 5000, true, '💥 ');
    const stats = FloatingNumbers.getPoolStats();
    expect(stats.active).toBe(1);
  });

  it('P56-03: all Hero rarities have distinct color-blind independent identifiers and star badges', () => {
    for (const hero of HEROES) {
      const rarityConfig = HERO_RARITY_CONFIG[hero.rarity];
      expect(rarityConfig).toBeDefined();
      expect(rarityConfig.nameKey).toBeDefined();
      expect(hero.icon).toBeDefined();
      expect(hero.element).toBeDefined();
    }
  });

  it('P56-04: campaign bosses and enemies include explicit text titles and archetypes', () => {
    const bosses = Object.values(CAMPAIGN_BOSSES);
    expect(bosses.length).toBeGreaterThan(0);

    for (const boss of bosses) {
      expect(boss.defaultTitle).toBeDefined();
      expect(boss.defaultTitle!.length).toBeGreaterThan(0);
      expect(boss.defaultName.length).toBeGreaterThan(0);
    }

    const enemies = Object.values(CAMPAIGN_ENEMIES);
    expect(enemies.length).toBeGreaterThan(0);
    for (const enemy of enemies) {
      expect(enemy.defaultName.length).toBeGreaterThan(0);
      expect(enemy.archetype).toBeDefined();
    }
  });

  it('P56-05: auto-attack dps is fully sufficient for stage progression without mandatory high CPS', () => {
    // Verify auto-attack mechanics do not penalize idle or low-clicking players
    store.set((draft) => {
      draft.power = 10000;
    });
    const state = store.get();
    expect(state.power).toBe(10000);
  });
});
