import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AdventureEventDefinition } from '../src/core/events/AdventureEventTypes';
import { createInitialState, store } from '../src/core/GameState';
import { events } from '../src/core/EventBus';
import { adventureEventDirector } from '../src/systems/AdventureEventDirector';
import { adventureEventSystem } from '../src/systems/AdventureEventSystem';
import { campaignCombatService } from '../src/systems/CampaignCombatService';
import { karmaSystem } from '../src/systems/KarmaSystem';
import { partyTeamSystem } from '../src/systems/PartyTeamSystem';

const FREE_EVENT: AdventureEventDefinition = {
  id: 'test_world_boss_adventure',
  titleKey: 'test.event.title',
  descKey: 'test.event.desc',
  icon: '!',
  category: 'choice',
  weight: 1,
  cooldownSeconds: 0,
  choices: [{ id: 'continue', labelKey: 'test.event.continue', outcome: { resultTextKey: 'test.event.result' } }],
};

const BLOCKED_EVENT: AdventureEventDefinition = {
  ...FREE_EVENT,
  id: 'test_blocked_adventure',
  weight: 1000,
  choices: [
    {
      id: 'expensive',
      labelKey: 'test.event.expensive',
      requiredGold: 999_999,
      outcome: { resultTextKey: 'test.event.expensive_result' },
    },
  ],
};

describe('AdventureEventDirector live campaign scheduling', () => {
  beforeEach(() => {
    store.replace(createInitialState());
    karmaSystem.resetAll();
    partyTeamSystem.resetAll();
    adventureEventSystem.resetAll();
    adventureEventSystem.clearEvents();
    adventureEventSystem.registerEvents([BLOCKED_EVENT, FREE_EVENT]);
    adventureEventDirector.releasePresentationPause();
    campaignCombatService.setPaused(false);
  });

  afterEach(() => {
    adventureEventDirector.releasePresentationPause();
    campaignCombatService.setPaused(false);
    adventureEventSystem.clearEvents();
    adventureEventSystem.loadDefaultEvents();
    adventureEventSystem.resetAll();
  });

  it('does not schedule on repeat clears or non-final stages', () => {
    expect(adventureEventDirector.tryScheduleForStageClear('1-10', false)).toBeNull();
    expect(adventureEventDirector.tryScheduleForStageClear('1-9', true)).toBeNull();
    expect(campaignCombatService.getCombatState().isPaused).toBe(false);
  });

  it('schedules one eligible adventure after the first clear of a world final stage', () => {
    let openedEventId: string | null = null;
    const off = events.on('modal:open', ({ modalId, data }) => {
      if (modalId === 'adventure_event_modal') openedEventId = data?.event?.id ?? null;
    });

    const selected = adventureEventDirector.tryScheduleForStageClear('1-10', true);

    expect(selected?.id).toBe(FREE_EVENT.id);
    expect(openedEventId).toBe(FREE_EVENT.id);
    expect(adventureEventDirector.isPresentationActive()).toBe(true);
    expect(campaignCombatService.getCombatState().isPaused).toBe(true);

    adventureEventDirector.releasePresentationPause();
    expect(adventureEventDirector.isPresentationActive()).toBe(false);
    expect(campaignCombatService.getCombatState().isPaused).toBe(false);
    off();
  });

  it('prevents a second presentation while an adventure decision is active', () => {
    expect(adventureEventDirector.tryScheduleForStageClear('1-10', true)).not.toBeNull();
    expect(adventureEventDirector.tryScheduleForStageClear('2-10', true)).toBeNull();
  });
});
