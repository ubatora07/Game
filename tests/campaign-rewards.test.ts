import { describe, it, expect, beforeEach } from 'vitest';
import { store, createInitialState } from '../src/core/GameState';
import { CampaignProgressionSystem } from '../src/systems/CampaignProgressionSystem';
import { campaignCombatService } from '../src/systems/CampaignCombatService';
import { getCampaignStageById } from '../src/content/campaignStages';
import { EconomyEngine } from '../src/economy/EconomyEngine';

describe('Phase 34 — Campaign Reward Economy Tests', () => {
  beforeEach(() => {
    const freshState = createInitialState();
    freshState.power = 1000;
    freshState.gold = 500;
    store.replace(freshState);
  });

  it('P34-01: Normal enemy kill grants base gold and power scaled by enemy multiplier', () => {
    const state = store.get();
    const stage = getCampaignStageById('1-1')!;
    const goldBefore = state.gold;
    const powerBefore = state.power;

    // A normal encounter pays base rewards, but does not consume the stage first-clear
    // until the final encounter actually completes the stage.
    let result: any;
    store.set((draft) => {
      result = CampaignProgressionSystem.onEnemyDefeated(draft, 'forest_goblin', false);
    });

    const stateAfter = store.get();
    expect(stateAfter.gold).toBeGreaterThan(goldBefore);
    expect(stateAfter.power).toBeGreaterThan(powerBefore);
    expect(stateAfter.stats.campaignGoldEarned).toBeGreaterThan(0);
    expect(stateAfter.stats.campaignPowerEarned).toBeGreaterThan(0);
    expect(result.isFirstClear).toBe(false);
    expect(stateAfter.campaign.firstClears).not.toContain(stage.id);
  });

  it('P34-02: Elite enemies grant boosted rewards compared to normal enemies', () => {
    // Stage 1-4 is a non-boss stage with normal & elite enemies
    // Defeat normal
    const normalState = createInitialState();
    normalState.campaign.currentStageId = '1-4';
    normalState.campaign.firstClears.push('1-4'); // make it repeat kill
    store.replace(normalState);

    store.set((draft) => {
      CampaignProgressionSystem.onEnemyDefeated(draft, 'forest_goblin', false);
    });
    const normalGold = store.get().gold;

    // Defeat elite
    const eliteState = createInitialState();
    eliteState.campaign.currentStageId = '1-4';
    eliteState.campaign.firstClears.push('1-4'); // make it repeat kill
    store.replace(eliteState);

    store.set((draft) => {
      CampaignProgressionSystem.onEnemyDefeated(draft, 'forest_alpha', false);
    });
    const eliteGold = store.get().gold;

    expect(eliteGold).toBeGreaterThan(normalGold);
  });

  it('P34-03: Boss kills award major Gold, Crystals, and track bosses defeated', () => {
    const freshState = createInitialState();
    freshState.campaign.currentStageId = '1-10';
    store.replace(freshState);

    const crystalsBefore = store.get().crystals;

    store.set((draft) => {
      CampaignProgressionSystem.onEnemyDefeated(draft, 'boss_1_10', true);
    });

    const stateAfter = store.get();
    expect(stateAfter.crystals).toBeGreaterThan(crystalsBefore);
    expect(stateAfter.stats.campaignBossesDefeated).toBe(1);
    expect(stateAfter.stats.campaignCrystalsEarned).toBeGreaterThan(0);
  });

  it('P34-04 & P34-07: First-clear reward is awarded on stage completion exactly once', () => {
    const freshState = createInitialState();
    freshState.campaign.currentStageId = '1-1';
    store.replace(freshState);
    const stage = getCampaignStageById('1-1')!;

    // All encounters before the final one pay normal rewards and must not consume first-clear.
    for (let encounter = 1; encounter < stage.enemyCount; encounter++) {
      let encounterResult: any;
      store.set((draft) => {
        encounterResult = CampaignProgressionSystem.onEnemyDefeated(draft, 'forest_goblin', false);
      });
      expect(encounterResult.isFirstClear).toBe(false);
      expect(encounterResult.stageCleared).toBe(false);
      expect(store.get().campaign.firstClears).not.toContain(stage.id);
    }

    // The final encounter atomically completes the stage and awards the first-clear table.
    let firstClearResult: any;
    store.set((draft) => {
      firstClearResult = CampaignProgressionSystem.onEnemyDefeated(draft, 'forest_goblin', false);
    });
    expect(firstClearResult.stageCleared).toBe(true);
    expect(firstClearResult.isFirstClear).toBe(true);
    expect(firstClearResult.rewards).toEqual(stage.firstClearRewards);
    expect(store.get().campaign.firstClears).toContain(stage.id);

    // Replay the same stage; no encounter can award first-clear again.
    store.set((draft) => {
      draft.campaign.currentStageId = stage.id;
      draft.campaign.currentWorldId = stage.worldId;
      draft.campaign.currentEncounter = 1;
      draft.campaign.campaignMode = 'farm';
    });

    let repeatResult: any;
    store.set((draft) => {
      repeatResult = CampaignProgressionSystem.onEnemyDefeated(draft, 'forest_goblin', false);
    });
    expect(repeatResult.isFirstClear).toBe(false);
    expect(repeatResult.rewards.gold).toBeLessThan(firstClearResult.rewards.gold);
  });

  it('P34-08: getCampaignRewardBreakdown returns accurate analytics breakdown', () => {
    const freshState = createInitialState();
    store.replace(freshState);

    store.set((draft) => {
      CampaignProgressionSystem.onEnemyDefeated(draft, 'boss_1_10', true);
    });

    const breakdown = CampaignProgressionSystem.getCampaignRewardBreakdown(store.get());
    expect(breakdown.totalGold).toBeGreaterThan(0);
    expect(breakdown.totalPower).toBeGreaterThan(0);
    expect(breakdown.totalCrystals).toBeGreaterThan(0);
    expect(breakdown.bossesDefeated).toBe(1);
    expect(breakdown.firstClearsCount).toBe(1);
  });

  it('P34-09 & P34-10: Economic balance check: Sect baseline vs Campaign active reward ratio', () => {
    const state = createInitialState();
    state.buildings['dojo'] = 20;
    state.buildings['spirit_well'] = 10;
    state.rankId = 'C';
    state.rankIndex = 2;
    store.replace(state);

    const metrics = EconomyEngine.calculateMetrics(state);
    const sectIncomePerMin = metrics.passivePowerPerSec * 60;

    // In 60 seconds, player defeats ~20 regular enemies in farm mode
    const stage = getCampaignStageById('1-5')!;
    const campaignIncomePerMin = (stage.baseRewards.power || 10) * 20;

    // Sect income should dominate passive long-term production (> 60% of total)
    const totalIncome = sectIncomePerMin + campaignIncomePerMin;
    const sectRatio = sectIncomePerMin / totalIncome;

    expect(sectRatio).toBeGreaterThan(0.60);
    expect(sectRatio).toBeLessThanOrEqual(0.99);
  });

  it('P34-11: Anti-exploit check: reload simulation retains firstClears state and prevents duplicate bonuses', () => {
    const state = createInitialState();
    state.campaign.currentStageId = '1-2';
    store.replace(state);

    // Clear the whole stage. First-clear must only become persistent after completion.
    const stage = getCampaignStageById('1-2')!;
    for (let encounter = 0; encounter < stage.enemyCount; encounter++) {
      store.set((draft) => {
        CampaignProgressionSystem.onEnemyDefeated(draft, 'forest_goblin', false);
      });
    }
    expect(store.get().campaign.firstClears).toContain(stage.id);

    // Simulate save/load round-trip
    const serialized = JSON.stringify(store.get());
    const restored = JSON.parse(serialized);
    store.replace(restored);

    expect(CampaignProgressionSystem.isFirstClear(store.get(), '1-2')).toBe(false);
  });
});
