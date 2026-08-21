import { beforeEach, describe, expect, it } from 'vitest';
import { createInitialState, store } from '../src/core/GameState';
import { FIRST_PET_EVENT_ID } from '../src/content/petUnlock';
import { adventureEventDirector } from '../src/systems/AdventureEventDirector';
import { adventureEventSystem } from '../src/systems/AdventureEventSystem';
import { campaignCombatService } from '../src/systems/CampaignCombatService';
import { karmaSystem } from '../src/systems/KarmaSystem';
import { partyTeamSystem } from '../src/systems/PartyTeamSystem';
import { petSystem } from '../src/systems/PetSystem';

describe('First Pet progressive disclosure contract', () => {
  beforeEach(() => {
    store.replace(createInitialState());
    karmaSystem.resetAll();
    partyTeamSystem.resetAll();
    petSystem.resetAll();
    adventureEventSystem.resetAll();
    adventureEventSystem.clearEvents();
    adventureEventSystem.loadDefaultEvents();
    adventureEventDirector.releasePresentationPause();
    campaignCombatService.setPaused(false);
  });

  it('starts with no owned pet and guarantees the existing Pet Nest on World 2 final clear', () => {
    expect(petSystem.getOwnedPets()).toHaveLength(0);
    const selected = adventureEventDirector.tryScheduleForStageClear('2-10', true);
    expect(selected?.id).toBe(FIRST_PET_EVENT_ID);
    expect(campaignCombatService.getCombatState().isPaused).toBe(true);
  });

  it('does not force the discovery milestone when a pet was acquired through another valid source', () => {
    const petNest = adventureEventSystem.getEventById(FIRST_PET_EVENT_ID)!;
    adventureEventSystem.clearEvents();
    adventureEventSystem.registerEvents([{ ...petNest, weight: 0 }]);

    expect(petSystem.acquirePet('pet_ignis_drake')).toBe(true);
    adventureEventDirector.releasePresentationPause();
    const selected = adventureEventDirector.tryScheduleForStageClear('2-10', true);

    // With only a zero-weight ordinary event registered, a non-null result could only come from the forced milestone path.
    expect(selected).toBeNull();
    expect(petSystem.getOwnedPets()).toHaveLength(1);
  });
});
