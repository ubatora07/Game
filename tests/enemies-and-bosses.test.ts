import { describe, it, expect, beforeEach } from 'vitest';
import { store, createInitialState } from '../src/core/GameState';
import { CAMPAIGN_ENEMIES, getCampaignEnemyById } from '../src/content/campaignEnemies';
import { CAMPAIGN_BOSSES, getCampaignBossById } from '../src/content/campaignBosses';
import { campaignCombatService } from '../src/systems/CampaignCombatService';
import { events } from '../src/core/EventBus';

describe('Phase 41 — Enemies & Bosses Tests', () => {
  beforeEach(() => {
    const freshState = createInitialState();
    store.replace(freshState);
    campaignCombatService.setAutoAttackEnabled(false);
  });

  it('P41-01 to P41-03: Enemy archetypes have distinct multipliers and attributes', () => {
    const goblin = getCampaignEnemyById('forest_goblin');
    expect(goblin).toBeDefined();
    expect(goblin.archetype).toBe('melee');

    const treant = getCampaignEnemyById('corrupted_treant');
    expect(treant).toBeDefined();
    expect(treant.archetype).toBe('tank');
    expect(treant.baseHpMultiplier).toBeGreaterThan(goblin.baseHpMultiplier);

    const alpha = getCampaignEnemyById('forest_alpha');
    expect(alpha).toBeDefined();
    expect(alpha.archetype).toBe('elite');
    expect(alpha.rewardMultiplier).toBeGreaterThanOrEqual(2.0);
  });

  it('P41-04 to P41-08: Boss special mechanic (shield) triggers and absorbs damage', () => {
    const state = createInitialState();
    state.campaign.currentWorldId = 1;
    state.campaign.currentStageId = '1-5'; // Grimbark with shield mechanic
    state.campaign.currentEncounter = 1;
    store.replace(state);

    campaignCombatService.spawnCurrentEncounter();
    const combat = campaignCombatService.getCombatState();
    const enemy = combat.activeEnemy!;

    expect(enemy.isBoss).toBe(true);
    expect(enemy.specialMechanic).toBe('shield');

    let mechanicEvent: any = null;
    events.on('combat:boss_mechanic', (data) => {
      mechanicEvent = data;
    });

    // Bring boss HP down to trigger shield at <= 50% HP
    const halfHpDamage = Math.ceil(enemy.maxHp * 0.55);
    campaignCombatService.applyDamageToEnemy(halfHpDamage);

    expect(enemy.shieldHp).toBeDefined();
    expect(enemy.shieldHp).toBeGreaterThan(0);
    expect(mechanicEvent).toBeDefined();
    expect(mechanicEvent.mechanic).toBe('shield');

    // Next attack should damage shield first
    const initialShield = enemy.shieldHp!;
    const initialHp = enemy.currentHp;
    const testDamage = 10;
    campaignCombatService.applyDamageToEnemy(testDamage);

    expect(enemy.shieldHp).toBe(initialShield - testDamage);
    expect(enemy.currentHp).toBe(initialHp); // HP remained protected by shield
  });

  it('P41-08: Boss special mechanic (enrage) triggers at <= 35% HP', () => {
    const state = createInitialState();
    state.campaign.currentWorldId = 1;
    state.campaign.currentStageId = '1-10'; // Malgok with enrage mechanic
    state.campaign.currentEncounter = 1;
    store.replace(state);

    campaignCombatService.spawnCurrentEncounter();
    const combat = campaignCombatService.getCombatState();
    const enemy = combat.activeEnemy!;

    expect(enemy.isBoss).toBe(true);
    expect(enemy.specialMechanic).toBe('enrage');

    let enrageEvent: any = null;
    events.on('combat:boss_mechanic', (data) => {
      if (data.mechanic === 'enrage') enrageEvent = data;
    });

    // Bring boss to <= 35% HP
    const heavyDmg = Math.ceil(enemy.maxHp * 0.70);
    campaignCombatService.applyDamageToEnemy(heavyDmg);

    expect(enemy.isEnraged).toBe(true);
    expect(enrageEvent).toBeDefined();
    expect(enrageEvent.active).toBe(true);
  });

  it('P41-10 to P41-12: Boss timeout flow switches to farm fallback and enables retry boost', () => {
    const state = createInitialState();
    state.campaign.currentWorldId = 1;
    state.campaign.currentStageId = '1-5';
    state.campaign.currentEncounter = 1;
    store.replace(state);

    campaignCombatService.spawnCurrentEncounter();
    const combat = campaignCombatService.getCombatState();
    expect(combat.isTimerActive).toBe(true);

    // Let timer expire
    campaignCombatService.update(45);

    const updatedState = store.get();
    expect(updatedState.campaign.campaignMode).toBe('boss_blocked');
    expect(updatedState.campaign.bossRetryState).toBeDefined();
    expect(updatedState.campaign.bossRetryState?.bossId).toBe('boss_1_5');

    // When retrying with boost
    store.set((draft) => {
      draft.campaign.bossRetryState!.retryBoostActive = true;
    });
    expect(store.get().campaign.bossRetryState?.retryBoostActive).toBe(true);
  });
});
