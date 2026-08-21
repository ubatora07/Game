import { describe, it, expect, beforeEach } from 'vitest';
import { store, createInitialState } from '../src/core/GameState';
import { ReincarnationSystem } from '../src/systems/ReincarnationSystem';
import { CampaignProgressionSystem } from '../src/systems/CampaignProgressionSystem';
import { campaignCombatService } from '../src/systems/CampaignCombatService';

describe('Phase 43 — Samsara Campaign Experience Tests', () => {
  beforeEach(() => {
    const fresh = createInitialState();
    fresh.rankIndex = 5; // Rank S
    fresh.rankId = 'S';
    fresh.stats.lifetimePower = 5000000000; // 5 Billion lifetime power
    fresh.towerFloor = 30;
    fresh.campaign.highestStageReached = '2-5';
    fresh.campaign.highestWorldReached = 2;
    fresh.campaign.currentStageId = '2-5';
    fresh.campaign.firstClears = ['1-1', '1-2', '1-5', '2-1'];
    store.replace(fresh);
    campaignCombatService.setAutoAttackEnabled(false);
  });

  it('P43-01 to P43-03: Reincarnation resets run economy & current stage to 1-1, but preserves meta-progress', () => {
    const soulsBefore = store.get().souls;
    const canReincarnate = ReincarnationSystem.canReincarnate();
    expect(canReincarnate).toBe(true);

    const success = ReincarnationSystem.reincarnate();
    expect(success).toBe(true);

    const state = store.get();
    expect(state.reincarnationCount).toBe(1);
    expect(state.souls).toBeGreaterThan(soulsBefore);
    expect(state.power).toBe(0);
    expect(state.gold).toBe(0);
    expect(state.rankIndex).toBe(0);

    // Campaign reset behavior
    expect(state.campaign.currentStageId).toBe('1-1');
    expect(state.campaign.currentWorldId).toBe(1);
    expect(state.campaign.currentEncounter).toBe(1);

    // Meta records PRESERVED (No loss of achievements/progress)
    expect(state.campaign.highestStageReached).toBe('2-5');
    expect(state.campaign.highestWorldReached).toBe(2);
    expect(state.campaign.firstClears).toContain('1-1');
    expect(state.campaign.firstClears).toContain('2-1');
  });

  it('P43-04 to P43-06: Samsara Rush activates when DPS heavily exceeds stage requirement', () => {
    const state = store.get();
    state.reincarnationCount = 1;
    state.campaign.currentStageId = '1-1';
    store.replace(state);

    const isRushActive = CampaignProgressionSystem.checkSamsaraRush(state, 5000);
    expect(isRushActive).toBe(true);
    expect(store.get().campaign.campaignMode).toBe('rush');
  });

  it('P43-07: First-clear rewards cannot be duplicated on repeated runs', () => {
    const state = store.get();
    state.campaign.currentStageId = '1-1';
    state.campaign.firstClears = ['1-1', '1-2'];
    store.replace(state);

    const result = CampaignProgressionSystem.onEnemyDefeated(state, 'forest_goblin');
    // First clear bonus must be false because it was already claimed in previous run
    expect(result.isFirstClear).toBe(false);
  });

  it('P43-10 to P43-12: Multi-run simulation preserves Soul Tree and hero upgrades', () => {
    // Run 1 Reincarnation
    ReincarnationSystem.reincarnate();
    // Purchase a soul skill
    const bought = ReincarnationSystem.buySoulSkill('soul_power');
    expect(bought).toBe(true);
    expect(store.get().soulSkills['soul_power']).toBe(1);

    // Simulate achieving high power again in Run 2
    store.set((draft) => {
      draft.rankIndex = 5;
      draft.rankId = 'S';
      draft.stats.lifetimePower += 5000000000;
    });

    // Run 2 Reincarnation
    ReincarnationSystem.reincarnate();
    expect(store.get().reincarnationCount).toBe(2);
    // Soul skill persists across all reincarnations
    expect(store.get().soulSkills['soul_power']).toBe(1);
    expect(store.get().campaign.highestStageReached).toBe('2-5');
  });
});
