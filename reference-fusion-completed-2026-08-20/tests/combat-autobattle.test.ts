import { describe, it, expect, beforeEach } from 'vitest';
import { store, createInitialState } from '../src/core/GameState';
import { campaignCombatService } from '../src/systems/CampaignCombatService';
import { events } from '../src/core/EventBus';

describe('Phase 33 — Auto-Battle Flow System Tests', () => {
  beforeEach(() => {
    const freshState = createInitialState();
    freshState.power = 1000;
    freshState.gold = 500;
    freshState.buildings['dojo'] = 5; // Passive power for brisk progression
    store.replace(freshState);

    campaignCombatService.setPaused(false);
    campaignCombatService.setAutoAttackEnabled(true);
    campaignCombatService.resetToStage('1-1');
  });

  it('P33-01: Auto-battle damages and defeats enemy continuously without manual clicks', () => {
    const combat = campaignCombatService.getCombatState();
    expect(combat.activeEnemy).not.toBeNull();

    // Simulate 4 seconds of 60 FPS auto attack (240 frames of dt = 1/60)
    for (let f = 0; f < 240; f++) {
      campaignCombatService.update(1 / 60);
    }

    const state = store.get();
    expect(state.power).toBeGreaterThan(1000);
    expect(state.gold).toBeGreaterThan(500);
  });

  it('P33-02: Auto-attack damage is invariant across 30 FPS, 60 FPS, and 144 FPS', () => {
    // 0.5 second at 30 FPS
    campaignCombatService.resetToStage('1-1');
    for (let f = 0; f < 15; f++) {
      campaignCombatService.update(1 / 30);
    }
    const enemyHp30 = campaignCombatService.getCombatState().activeEnemy!.currentHp;

    // Reset and test 0.5 second at 60 FPS
    campaignCombatService.resetToStage('1-1');
    for (let f = 0; f < 30; f++) {
      campaignCombatService.update(1 / 60);
    }
    const enemyHp60 = campaignCombatService.getCombatState().activeEnemy!.currentHp;

    // Reset and test 0.5 second at 144 FPS
    campaignCombatService.resetToStage('1-1');
    for (let f = 0; f < 72; f++) {
      campaignCombatService.update(1 / 144);
    }
    const enemyHp144 = campaignCombatService.getCombatState().activeEnemy!.currentHp;

    // Allow margin of difference <= 2 HP due to discrete tick quantization
    expect(Math.abs(enemyHp30 - enemyHp60)).toBeLessThanOrEqual(2);
    expect(Math.abs(enemyHp60 - enemyHp144)).toBeLessThanOrEqual(2);
  });

  it('P33-03: Death transition cooldown allows visual feedback before spawning next encounter', () => {
    let killedEmitted = 0;
    let rewardEmitted = 0;
    let spawnedEmitted = 0;

    const un1 = events.on('combat:enemy_killed', () => killedEmitted++);
    const un2 = events.on('combat:reward_dropped', () => rewardEmitted++);
    const un3 = events.on('combat:enemy_spawned', () => spawnedEmitted++);

    campaignCombatService.resetToStage('1-1');
    spawnedEmitted = 0; // reset baseline

    // Deal fatal manual blow
    campaignCombatService.attack();
    
    // Give enough damage to kill
    while (campaignCombatService.getCombatState().activeEnemy!.currentHp > 0) {
      campaignCombatService.attack();
    }

    expect(killedEmitted).toBe(1);
    expect(rewardEmitted).toBe(1);

    // During transition delay (0.15s), no new enemy spawned yet
    campaignCombatService.update(0.15);
    expect(spawnedEmitted).toBe(0);

    // After remaining transition delay (0.2s), new enemy spawns
    campaignCombatService.update(0.2);
    expect(spawnedEmitted).toBe(1);

    un1();
    un2();
    un3();
  });

  it('P33-04: Normal enemy vs Elite pacing satisfies design specifications', () => {
    // Normal Stage 1-1 enemy
    campaignCombatService.resetToStage('1-1');
    const normalHp = campaignCombatService.getCombatState().activeEnemy!.maxHp;

    // Stage 1-5 Mini-boss / Elite
    campaignCombatService.resetToStage('1-5');
    const eliteHp = campaignCombatService.getCombatState().activeEnemy!.maxHp;

    expect(eliteHp).toBeGreaterThan(normalHp);
  });

  it('P33-05: Boss timeout triggers failure event, enters farm mode, and recovers gracefully', () => {
    let bossFailed = false;
    const unbind = events.on('campaign:boss_failed', () => {
      bossFailed = true;
    });

    campaignCombatService.resetToStage('1-10'); // World 1 Boss
    expect(campaignCombatService.getCombatState().activeEnemy?.isBoss).toBe(true);
    expect(campaignCombatService.getCombatState().isTimerActive).toBe(true);

    // Run out the 45s boss timer with 0 DPS
    campaignCombatService.setAutoAttackEnabled(false); // turn off auto attack
    for (let sec = 0; sec < 46; sec++) {
      campaignCombatService.update(1.0);
    }

    expect(bossFailed).toBe(true);
    expect(store.get().campaign.campaignMode).toBe('boss_blocked');

    // After transition, fallback farm encounter is spawned
    campaignCombatService.update(0.5);
    expect(campaignCombatService.getCombatState().activeEnemy?.isBoss).toBe(false);

    unbind();
  });

  it('P33-06: Stress-test 10,000 auto battle simulation frames across multiple worlds without NaN/Infinity', () => {
    store.set((draft) => {
      draft.buildings['dojo'] = 50;
      draft.buildings['spirit_well'] = 25;
      draft.rankId = 'C';
      draft.rankIndex = 2;
    });

    campaignCombatService.resetToStage('1-1');

    for (let frame = 0; frame < 10000; frame++) {
      campaignCombatService.update(0.016); // 16ms tick
    }

    const state = store.get();
    expect(state.power).not.toBeNaN();
    expect(state.gold).not.toBeNaN();
    expect(state.power).toBeGreaterThan(0);
    expect(state.campaign.firstClears.length).toBeGreaterThan(3);
    expect(state.campaign.currentWorldId).toBeGreaterThanOrEqual(1);
  });

  it('P33-07: Pause stops simulation and safe resume retains state', () => {
    campaignCombatService.resetToStage('1-1');
    const hpBefore = campaignCombatService.getCombatState().activeEnemy!.currentHp;

    campaignCombatService.setPaused(true);
    campaignCombatService.update(5.0); // 5 seconds while paused

    const hpPaused = campaignCombatService.getCombatState().activeEnemy!.currentHp;
    expect(hpPaused).toBe(hpBefore);

    campaignCombatService.setPaused(false);
    campaignCombatService.update(1.0); // 1 second active
    const hpResumed = campaignCombatService.getCombatState().activeEnemy!.currentHp;
    expect(hpResumed).toBeLessThan(hpBefore);
  });
});
