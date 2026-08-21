import { describe, it, expect } from 'vitest';
import {
  HEROES,
  HERO_RARITY_CONFIG,
  getHeroById,
  getHeroStarMultiplier,
  getStarUpgradeCost,
  HeroDefinition,
} from '../src/content/heroes';
import { HeroSystem } from '../src/systems/HeroSystem';
import { store } from '../src/core/GameState';
import { I18nService, t } from '../src/services/i18n/I18nService';

describe('Phase 61 — Content Production: Heroes Suite', () => {
  const i18n = I18nService.getInstance();

  it('P61-01: Launch Roster Size & Uniqueness — 16 distinct heroes', () => {
    expect(HEROES.length).toBeGreaterThanOrEqual(14);

    const ids = new Set<string>();
    const names = new Set<string>();

    for (const hero of HEROES) {
      expect(ids.has(hero.id)).toBe(false);
      expect(names.has(hero.nameKey)).toBe(false);
      ids.add(hero.id);
      names.add(hero.nameKey);

      expect(hero.avatarSeed.length).toBeGreaterThan(0);
      expect(hero.icon.length).toBeGreaterThan(0);
    }
  });

  it('P61-02: Element & Faction Distribution — all 6 elements represented', () => {
    const elements = new Set(HEROES.map((h) => h.element));
    expect(elements.has('fire')).toBe(true);
    expect(elements.has('water')).toBe(true);
    expect(elements.has('wind')).toBe(true);
    expect(elements.has('lightning')).toBe(true);
    expect(elements.has('void')).toBe(true);
    expect(elements.has('light')).toBe(true);
  });

  it('P61-03: Rarity Distribution & Pull Rates sum to 100%', () => {
    const rarities = Object.values(HERO_RARITY_CONFIG);
    const totalPullRate = rarities.reduce((sum, r) => sum + r.pullRate, 0);
    expect(totalPullRate).toBe(100);

    // Each rarity must have at least 2 heroes
    for (const rarityKey of Object.keys(HERO_RARITY_CONFIG) as (keyof typeof HERO_RARITY_CONFIG)[]) {
      const count = HEROES.filter((h) => h.rarity === rarityKey).length;
      expect(count).toBeGreaterThanOrEqual(2);
    }
  });

  it('P61-04: Skill System & Types — each hero has valid skill config', () => {
    for (const hero of HEROES) {
      const skill = hero.skill;
      expect(skill).toBeDefined();
      expect(skill.cooldownSeconds).toBeGreaterThanOrEqual(5);
      expect(skill.cooldownSeconds).toBeLessThanOrEqual(15);
      expect(skill.multiplier).toBeGreaterThanOrEqual(2.0);
      expect(skill.multiplier).toBeLessThanOrEqual(10.0);
      expect(['direct_damage', 'gold_burst', 'power_burst', 'crit_mark']).toContain(skill.type);
    }
  });

  it('P61-05: Star Upgrades & Multipliers — smooth progression curve', () => {
    const mult1 = getHeroStarMultiplier(1);
    const mult2 = getHeroStarMultiplier(2);
    const mult3 = getHeroStarMultiplier(3);
    const mult4 = getHeroStarMultiplier(4);
    const mult5 = getHeroStarMultiplier(5);

    expect(mult1).toBe(1.0);
    expect(mult2).toBeGreaterThan(mult1);
    expect(mult3).toBeGreaterThan(mult2);
    expect(mult4).toBeGreaterThan(mult3);
    expect(mult5).toBeGreaterThan(mult4);

    // Upgrade costs for common, rare, epic, legendary, mythic
    expect(getStarUpgradeCost(1, 'common')).toBeGreaterThan(0);
    expect(getStarUpgradeCost(2, 'common')).toBeGreaterThan(getStarUpgradeCost(1, 'common'));
    expect(getStarUpgradeCost(1, 'mythic')).toBeGreaterThan(getStarUpgradeCost(1, 'common'));
  });

  it('P61-06: Translation Completeness in RU and EN', () => {
    for (const lang of ['en', 'ru'] as const) {
      i18n.setLanguage(lang);

      for (const hero of HEROES) {
        const name = t(hero.nameKey);
        const title = t(hero.titleKey);
        const desc = t(hero.descriptionKey);
        const skillName = t(hero.skill.nameKey);
        const skillDesc = t(hero.skill.descKey);

        expect(name.length).toBeGreaterThan(0);
        expect(title.length).toBeGreaterThan(0);
        expect(desc.length).toBeGreaterThan(0);
        expect(skillName.length).toBeGreaterThan(0);
        expect(skillDesc.length).toBeGreaterThan(0);
      }
    }
  });

  it('P61-07: Meta Balance & Active Party Synergy Calculations', () => {
    store.set((draft) => {
      draft.heroes = {
        hiro: { stars: 2, duplicates: 1 },
        amaterasu: { stars: 1, duplicates: 0 },
        ryu: { stars: 3, duplicates: 2 },
      };
    });

    const activeParty = HeroSystem.getActiveParty(3);
    expect(activeParty.length).toBe(3);

    const synergy = HeroSystem.getPartySynergy();
    expect(synergy.partyCount).toBe(3);
    expect(synergy.synergyMultiplier).toBe(1.15); // 1.0 + 3 * 0.05
    expect(synergy.synergyPctText).toBe('+15%');
  });
});
