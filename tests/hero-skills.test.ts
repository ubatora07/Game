import { describe, it, expect, beforeEach } from 'vitest';
import { store, createInitialState } from '../src/core/GameState';
import { HEROES, getHeroById, getHeroStarMultiplier } from '../src/content/heroes';
import { campaignCombatService } from '../src/systems/CampaignCombatService';
import { events } from '../src/core/EventBus';

describe('Phase 39 — Hero Skill Presentation Tests', () => {
  beforeEach(() => {
    const freshState = createInitialState();
    store.replace(freshState);
  });

  it('P39-01: Every anime hero defines a signature combat skill', () => {
    for (const hero of HEROES) {
      expect(hero.skill).toBeDefined();
      expect(hero.skill.nameKey).toBeDefined();
      expect(hero.skill.descKey).toBeDefined();
      expect(hero.skill.icon).toBeDefined();
      expect(hero.skill.type).toMatch(/^(direct_damage|gold_burst|power_burst|crit_mark)$/);
      expect(hero.skill.cooldownSeconds).toBeGreaterThanOrEqual(6);
      expect(hero.skill.cooldownSeconds).toBeLessThanOrEqual(12);
      expect(hero.skill.multiplier).toBeGreaterThanOrEqual(2.0);
    }
  });

  it('P39-02: Hero skills scale with star upgrades', () => {
    const star1 = getHeroStarMultiplier(1);
    const star3 = getHeroStarMultiplier(3);
    const star5 = getHeroStarMultiplier(5);

    expect(star1).toBe(1.0);
    expect(star3).toBeGreaterThan(star1);
    expect(star5).toBeGreaterThan(star3);
  });

  it('P39-03 to P39-05: Active party heroes trigger skill events during combat update loop', () => {
    const state = createInitialState();
    state.heroes['hiro'] = { stars: 2, duplicates: 0 }; // Gale Slash direct damage (8s cd)
    state.campaign.currentWorldId = 1;
    state.campaign.currentStageId = 'w1_s1';
    state.campaign.currentEncounter = 1;
    store.replace(state);

    campaignCombatService.setAutoAttackEnabled(false);
    campaignCombatService.spawnCurrentEncounter();
    const combat = campaignCombatService.getCombatState();
    expect(combat.activeEnemy).toBeDefined();
    const initialHp = combat.activeEnemy!.currentHp;

    let skillEventReceived: any = null;
    events.on('combat:hero_skill', (data) => {
      skillEventReceived = data;
    });

    // Advance 8.5 seconds to trigger Hiro's skill
    campaignCombatService.update(8.5);

    expect(skillEventReceived).toBeDefined();
    expect(skillEventReceived.heroId).toBe('hiro');
    expect(skillEventReceived.type).toBe('direct_damage');
    expect(skillEventReceived.damage).toBeGreaterThan(0);
    expect(combat.activeEnemy!.currentHp).toBeLessThan(initialHp);
  });

  it('P39-09: Skill cooldowns reset after execution preventing stacking explosion', () => {
    const state = createInitialState();
    state.heroes['hiro'] = { stars: 1, duplicates: 0 };
    store.replace(state);

    campaignCombatService.setAutoAttackEnabled(false);
    campaignCombatService.spawnCurrentEncounter();

    let triggerCount = 0;
    events.on('combat:hero_skill', () => {
      triggerCount++;
    });

    // Advance 2 seconds (below 8s cd) -> 0 triggers
    campaignCombatService.update(2.0);
    expect(triggerCount).toBe(0);

    // Advance another 6.5 seconds (total 8.5s) -> 1 trigger
    campaignCombatService.update(6.5);
    expect(triggerCount).toBe(1);

    // Advance another 2.0s -> still 1 trigger (waiting for next 8s cycle)
    campaignCombatService.update(2.0);
    expect(triggerCount).toBe(1);
  });
});
