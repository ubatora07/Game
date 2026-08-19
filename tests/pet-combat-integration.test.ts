import { beforeEach, describe, expect, it } from 'vitest';
import { createInitialState, store } from '../src/core/GameState';
import { events } from '../src/core/EventBus';
import { campaignCombatService } from '../src/systems/CampaignCombatService';
import { petSystem } from '../src/systems/PetSystem';

describe('P1 pet combat integration', () => {
  beforeEach(() => {
    store.replace(createInitialState());
    petSystem.resetAll();
    campaignCombatService.resetToStage('1-1');
    campaignCombatService.setAutoAttackEnabled(false);
  });

  it('executes the active pet action from the real campaign update loop', () => {
    petSystem.acquirePet('pet_ignis_drake');
    let action: { petId: string; actionName: string; damage: number; remainingHp: number } | null = null;
    const off = events.on('combat:pet_action', (data) => { action = data; });
    campaignCombatService.update(4.1);
    expect(action).not.toBeNull();
    expect(action!.petId).toBe('pet_ignis_drake');
    expect(action!.damage).toBeGreaterThan(0);
    off();
  });
});
