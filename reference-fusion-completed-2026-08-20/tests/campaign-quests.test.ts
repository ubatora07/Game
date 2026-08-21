import { describe, it, expect, beforeEach } from 'vitest';
import { store, createInitialState } from '../src/core/GameState';
import { QUESTS } from '../src/content/quests';
import { QuestSystem } from '../src/systems/QuestSystem';

describe('Phase 44 — Campaign-Aware Quests Tests', () => {
  beforeEach(() => {
    const fresh = createInitialState();
    store.replace(fresh);
  });

  it('P44-01 & P44-07: All quests have valid schemas, non-empty text keys and functional getProgress getters', () => {
    const state = store.get();
    for (const q of QUESTS) {
      expect(q.id).toBeDefined();
      expect(q.nameKey).toBeTruthy();
      expect(q.descKey).toBeTruthy();
      expect(q.targetCount).toBeGreaterThan(0);
      const prog = q.getProgress(state);
      expect(typeof prog).toBe('number');
      expect(prog).toBeGreaterThanOrEqual(0);
    }
  });

  it('P44-02: Enemy and Elite kill quests track correctly from campaign stats', () => {
    const enemyQuest = QUESTS.find(q => q.id === 'quest_campaign_kill_5')!;
    const eliteQuest = QUESTS.find(q => q.id === 'quest_defeat_elite_1')!;

    expect(enemyQuest).toBeDefined();
    expect(eliteQuest).toBeDefined();

    store.set((draft) => {
      draft.stats.campaignEnemiesDefeated = 5;
      draft.stats.campaignElitesDefeated = 1;
    });

    const state = store.get();
    expect(enemyQuest.getProgress(state)).toBe(5);
    expect(eliteQuest.getProgress(state)).toBe(1);
    expect(QuestSystem.isQuestReadyToClaim(enemyQuest.id)).toBe(true);
    expect(QuestSystem.isQuestReadyToClaim(eliteQuest.id)).toBe(true);
  });

  it('P44-03 & P44-05: Stage and World progression quests evaluate correctly from highest records', () => {
    const stageQuest = QUESTS.find(q => q.id === 'quest_reach_stage_1_3')!;
    const worldQuest = QUESTS.find(q => q.id === 'quest_clear_world_1')!;

    expect(stageQuest).toBeDefined();
    expect(worldQuest).toBeDefined();

    store.set((draft) => {
      draft.campaign.highestStageReached = '1-3'; // global index 3
      draft.stats.campaignWorldsCleared = 1;
    });

    const state = store.get();
    expect(stageQuest.getProgress(state)).toBe(3);
    expect(worldQuest.getProgress(state)).toBe(1);
    expect(QuestSystem.isQuestReadyToClaim(stageQuest.id)).toBe(true);
    expect(QuestSystem.isQuestReadyToClaim(worldQuest.id)).toBe(true);
  });

  it('P44-04: Boss kill quests track correctly from defeated bosses stat', () => {
    const bossQuest1 = QUESTS.find(q => q.id === 'quest_defeat_boss_1')!;
    const bossQuest5 = QUESTS.find(q => q.id === 'quest_defeat_boss_5')!;

    store.set((draft) => {
      draft.stats.campaignBossesDefeated = 5;
    });

    const state = store.get();
    expect(bossQuest1.getProgress(state)).toBe(5);
    expect(bossQuest5.getProgress(state)).toBe(5);
    expect(QuestSystem.isQuestReadyToClaim(bossQuest1.id)).toBe(true);
    expect(QuestSystem.isQuestReadyToClaim(bossQuest5.id)).toBe(true);
  });

  it('P44-09 & P44-10: Claiming a completed quest grants rewards and marks it as completed', () => {
    store.set((draft) => {
      draft.stats.campaignEnemiesDefeated = 5;
      draft.crystals = 0;
      draft.gold = 0;
    });

    const success = QuestSystem.claimQuest('quest_campaign_kill_5');
    expect(success).toBe(true);

    const updated = store.get();
    expect(updated.completedQuests).toContain('quest_campaign_kill_5');
    expect(updated.gold).toBe(25);
    expect(updated.crystals).toBe(15);

    // Double claim is prevented
    expect(QuestSystem.claimQuest('quest_campaign_kill_5')).toBe(false);
  });
});
