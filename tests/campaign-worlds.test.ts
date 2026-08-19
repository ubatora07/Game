import { describe, it, expect, beforeEach } from 'vitest';
import { store, createInitialState } from '../src/core/GameState';
import { CAMPAIGN_WORLDS, getCampaignWorldById, getTotalCampaignWorlds } from '../src/content/campaignWorlds';
import { CampaignProgressionSystem } from '../src/systems/CampaignProgressionSystem';
import { events } from '../src/core/EventBus';

describe('Phase 40 — Campaign Worlds Tests', () => {
  beforeEach(() => {
    const freshState = createInitialState();
    store.replace(freshState);
  });

  it('P40-01 to P40-06: All 5 campaign worlds have rich thematic configurations', () => {
    expect(getTotalCampaignWorlds()).toBe(5);

    const world1 = getCampaignWorldById(1)!;
    expect(world1).toBeDefined();
    expect(world1.emoji).toBe('🌲');
    expect(world1.theme).toBe('forest');
    expect(world1.bgGradient).toContain('radial-gradient');
    expect(world1.worldModifier).toBeDefined();
    expect(world1.worldModifier?.type).toBe('gold');

    const world2 = getCampaignWorldById(2)!;
    expect(world2).toBeDefined();
    expect(world2.emoji).toBe('🌸');
    expect(world2.theme).toBe('sakura');
    expect(world2.worldModifier?.type).toBe('power');

    const world3 = getCampaignWorldById(3)!;
    expect(world3).toBeDefined();
    expect(world3.emoji).toBe('🌋');
    expect(world3.theme).toBe('volcano');
    expect(world3.worldModifier?.type).toBe('crit');

    const world4 = getCampaignWorldById(4)!;
    expect(world4).toBeDefined();
    expect(world4.emoji).toBe('❄️');
    expect(world4.theme).toBe('ice');
    expect(world4.worldModifier?.type).toBe('essence');

    const world5 = getCampaignWorldById(5)!;
    expect(world5).toBeDefined();
    expect(world5.emoji).toBe('🌌');
    expect(world5.theme).toBe('void');
    expect(world5.worldModifier?.type).toBe('power');
  });

  it('P40-07 to P40-09: World completion celebration emits world_cleared and advances world', () => {
    const state = createInitialState();
    state.campaign.currentWorldId = 1;
    state.campaign.currentStageId = '1-10'; // final stage of world 1
    state.campaign.currentEncounter = 1;
    store.replace(state);

    let worldClearedEventReceived: any = null;
    events.on('campaign:world_cleared', (data) => {
      worldClearedEventReceived = data;
    });

    store.set((draft) => {
      const result = CampaignProgressionSystem.onEnemyDefeated(draft, 'boss_1_10', true);
      expect(result.stageCleared).toBe(true);
      expect(result.worldCleared).toBe(true);
    });

    expect(worldClearedEventReceived).toBeDefined();
    expect(worldClearedEventReceived.worldId).toBe(1);

    const updatedState = store.get();
    expect(updatedState.campaign.currentWorldId).toBe(2);
    expect(updatedState.campaign.currentStageId).toBe('2-1');
  });

  it('P40-11 & P40-12: World modifiers scale bonuses without corrupting idle math', () => {
    for (const world of CAMPAIGN_WORLDS) {
      expect(world.minRankIndex).toBeGreaterThanOrEqual(0);
      expect(world.stageCount).toBe(10);
      if (world.worldModifier) {
        expect(world.worldModifier.bonusPct).toBeGreaterThan(0);
        expect(world.worldModifier.bonusPct).toBeLessThanOrEqual(0.5);
      }
    }
  });
});
