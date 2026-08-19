import { describe, it, expect, beforeEach } from 'vitest';
import { createInitialState, GameStateData } from '../src/core/GameState';
import { CAMPAIGN_WORLDS, getCampaignWorldById } from '../src/content/campaignWorlds';
import {
  getAllCampaignStages,
  getCampaignStageById,
  getNextStageId,
  getPreviousStageId,
  getStagesByWorldId,
} from '../src/content/campaignStages';
import { getCampaignBossById } from '../src/content/campaignBosses';
import { CampaignProgressionSystem } from '../src/systems/CampaignProgressionSystem';

describe('Phase 30 — Campaign Domain Model', () => {
  let state: GameStateData;

  beforeEach(() => {
    state = createInitialState();
  });

  describe('World & Stage Configuration Integrity', () => {
    it('defines exactly 5 Campaign Worlds with correct progression', () => {
      expect(CAMPAIGN_WORLDS.length).toBe(5);
      expect(CAMPAIGN_WORLDS[0].id).toBe(1);
      expect(CAMPAIGN_WORLDS[0].defaultName).toBe('Whispering Forest');
      expect(CAMPAIGN_WORLDS[4].id).toBe(5);
      expect(CAMPAIGN_WORLDS[4].defaultName).toBe('Void Sanctuary');
    });

    it('generates exactly 50 total stages (10 per world)', () => {
      const stages = getAllCampaignStages();
      expect(stages.length).toBe(50);

      for (let worldId = 1; worldId <= 5; worldId++) {
        const worldStages = getStagesByWorldId(worldId);
        expect(worldStages.length).toBe(10);
      }
    });

    it('has monotonically increasing HP and difficulty across global index', () => {
      const stages = getAllCampaignStages();
      for (let i = 1; i < stages.length; i++) {
        expect(stages[i].globalIndex).toBe(stages[i - 1].globalIndex + 1);
        expect(stages[i].difficulty).toBeGreaterThan(stages[i - 1].difficulty);
      }
    });

    it('defines bosses at stage 5 and stage 10 of each world', () => {
      for (let worldId = 1; worldId <= 5; worldId++) {
        const miniBossStage = getCampaignStageById(`${worldId}-5`);
        const worldBossStage = getCampaignStageById(`${worldId}-10`);

        expect(miniBossStage?.isBoss).toBe(true);
        expect(miniBossStage?.bossId).toBe(`boss_${worldId}_5`);
        expect(getCampaignBossById(miniBossStage!.bossId!)).toBeDefined();

        expect(worldBossStage?.isBoss).toBe(true);
        expect(worldBossStage?.bossId).toBe(`boss_${worldId}_10`);
        expect(getCampaignBossById(worldBossStage!.bossId!)).toBeDefined();
      }
    });

    it('correctly maps next and previous stage IDs', () => {
      expect(getNextStageId('1-1')).toBe('1-2');
      expect(getNextStageId('1-10')).toBe('2-1');
      expect(getNextStageId('5-10')).toBeUndefined();

      expect(getPreviousStageId('1-1')).toBeUndefined();
      expect(getPreviousStageId('1-2')).toBe('1-1');
      expect(getPreviousStageId('2-1')).toBe('1-10');
    });
  });

  describe('Campaign Progression Business Logic', () => {
    it('starts with default campaign state at Stage 1-1', () => {
      const stage = CampaignProgressionSystem.getCurrentStage(state);
      expect(stage.id).toBe('1-1');
      expect(state.campaign.currentWorldId).toBe(1);
      expect(state.campaign.currentEncounter).toBe(1);
      expect(state.campaign.campaignMode).toBe('progress');
    });

    it('advances encounters within a stage upon enemy defeat', () => {
      const stage = CampaignProgressionSystem.getCurrentStage(state);
      const enemyCount = stage.enemyCount;

      // Defeat first enemy
      const res1 = CampaignProgressionSystem.onEnemyDefeated(state);
      if (enemyCount > 1) {
        expect(res1.stageCleared).toBe(false);
        expect(state.campaign.currentEncounter).toBe(2);
      }

      // Complete all remaining encounters in stage
      for (let i = 2; i <= enemyCount; i++) {
        CampaignProgressionSystem.onEnemyDefeated(state);
      }

      // Stage should now be cleared and advanced to 1-2
      expect(state.campaign.currentStageId).toBe('1-2');
      expect(state.campaign.highestStageReached).toBe('1-1');
      expect(state.campaign.firstClears).toContain('1-1');
    });

    it('grants first-clear rewards once, then falls back to base rewards', () => {
      const initialGold = state.gold;

      // Clear 1-1 first time
      const stage1 = getCampaignStageById('1-1')!;
      for (let i = 0; i < stage1.enemyCount; i++) {
        CampaignProgressionSystem.onEnemyDefeated(state);
      }

      const firstClearGoldGain = state.gold - initialGold;
      const expectedFirstClearGain = stage1.firstClearRewards.gold + stage1.baseRewards.gold * (stage1.enemyCount - 1);
      expect(firstClearGoldGain).toBe(expectedFirstClearGain);

      // Now set stage back to 1-1 for replay / farm
      state.campaign.currentStageId = '1-1';
      state.campaign.currentEncounter = 1;
      const goldBeforeFarm = state.gold;

      for (let i = 0; i < stage1.enemyCount; i++) {
        CampaignProgressionSystem.onEnemyDefeated(state);
      }

      const replayGoldGain = state.gold - goldBeforeFarm;
      expect(replayGoldGain).toBe(stage1.baseRewards.gold * stage1.enemyCount);
      expect(replayGoldGain).toBeLessThan(firstClearGoldGain);
    });

    it('handles boss defeat and world transition', () => {
      // Fast forward state to World 1 Boss (1-10)
      state.campaign.currentWorldId = 1;
      state.campaign.currentStageId = '1-10';
      state.campaign.currentEncounter = 1;

      const bossStage = getCampaignStageById('1-10')!;
      expect(bossStage.isBoss).toBe(true);

      const result = CampaignProgressionSystem.onEnemyDefeated(state);

      expect(result.stageCleared).toBe(true);
      expect(result.worldCleared).toBe(true);
      expect(state.campaign.currentStageId).toBe('2-1');
      expect(state.campaign.currentWorldId).toBe(2);
      expect(state.campaign.highestWorldReached).toBe(2);
      expect(state.campaign.highestStageReached).toBe('1-10');
    });

    it('handles boss failure by entering boss_blocked mode and falling back to farm stage', () => {
      state.campaign.currentStageId = '1-10';
      state.campaign.farmStageId = '1-9';

      CampaignProgressionSystem.onBossFailed(state);

      expect(state.campaign.campaignMode).toBe('boss_blocked');
      expect(state.campaign.currentStageId).toBe('1-9');
      expect(state.campaign.bossRetryState?.bossId).toBe('boss_1_10');

      // Retry boss
      const retried = CampaignProgressionSystem.retryBoss(state, true);
      expect(retried).toBe(true);
      expect(state.campaign.currentStageId).toBe('1-10');
      expect(state.campaign.campaignMode).toBe('progress');
      expect(state.campaign.bossRetryState?.retryBoostActive).toBe(true);
    });

    it('activates Samsara Rush when player DPS significantly exceeds stage HP', () => {
      state.reincarnationCount = 1;
      const stage = CampaignProgressionSystem.getCurrentStage(state);
      
      // Low DPS -> No Rush
      const lowDpsRush = CampaignProgressionSystem.checkSamsaraRush(state, 5);
      expect(lowDpsRush).toBe(false);
      expect(state.campaign.campaignMode).toBe('progress');

      // Huge DPS -> Rush Mode Active
      const highDps = stage.baseHp * 100;
      const highDpsRush = CampaignProgressionSystem.checkSamsaraRush(state, highDps);
      expect(highDpsRush).toBe(true);
      expect(state.campaign.campaignMode).toBe('rush');
    });

    it('preserves lifetime records and first-clears during Reincarnation reset', () => {
      state.campaign.currentWorldId = 3;
      state.campaign.currentStageId = '3-7';
      state.campaign.highestWorldReached = 3;
      state.campaign.highestStageReached = '3-6';
      state.campaign.firstClears = ['1-1', '1-2', '1-3', '2-1', '3-1'];

      CampaignProgressionSystem.onReincarnationReset(state);

      expect(state.campaign.currentWorldId).toBe(1);
      expect(state.campaign.currentStageId).toBe('1-1');
      expect(state.campaign.campaignMode).toBe('rush');
      // Preserved!
      expect(state.campaign.highestWorldReached).toBe(3);
      expect(state.campaign.highestStageReached).toBe('3-6');
      expect(state.campaign.firstClears).toEqual(['1-1', '1-2', '1-3', '2-1', '3-1']);
    });
  });
});
