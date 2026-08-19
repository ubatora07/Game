import { beforeEach, describe, expect, it } from 'vitest';
import { AdventureEventDefinition, AdventureEventContext } from '../src/core/events/AdventureEventTypes';
import { createInitialState, store } from '../src/core/GameState';
import { adventureEventSystem } from '../src/systems/AdventureEventSystem';
import { karmaSystem } from '../src/systems/KarmaSystem';
import { partyTeamSystem } from '../src/systems/PartyTeamSystem';

describe('Adventure event eligibility integrity', () => {
  const rankEvent: AdventureEventDefinition = {
    id: 'test_rank_event',
    titleKey: 'test.rank.title',
    descKey: 'test.rank.desc',
    icon: '!',
    category: 'choice',
    weight: 1,
    cooldownSeconds: 60,
    requirements: { minRank: 'C' },
    choices: [{ id: 'ok', labelKey: 'test.rank.ok', outcome: { resultTextKey: 'test.rank.result' } }],
  };

  beforeEach(() => {
    store.replace(createInitialState());
    karmaSystem.resetAll();
    partyTeamSystem.resetAll();
  });

  it('enforces event minRank instead of leaving the schema field inert', () => {
    const rankE: AdventureEventContext = { worldId: 1, activeClasses: [], currentKarma: 0, rank: 'E', gold: 0 };
    const rankC: AdventureEventContext = { ...rankE, rank: 'C' };
    expect(adventureEventSystem.isEventEligible(rankEvent, rankE)).toBe(false);
    expect(adventureEventSystem.isEventEligible(rankEvent, rankC)).toBe(true);
  });

  it('fails choice execution closed when Gold or Class requirements are not met', () => {
    const event: AdventureEventDefinition = {
      ...rankEvent,
      requirements: undefined,
      choices: [
        { id: 'pay', labelKey: 'pay', requiredGold: 3000, outcome: { goldDelta: -3000, resultTextKey: 'paid' } },
        { id: 'mage', labelKey: 'mage', requiredClass: 'mage', outcome: { powerDelta: 1, resultTextKey: 'cast' } },
      ],
    };

    expect(adventureEventSystem.isChoiceEligible(event.choices[0])).toBe(false);
    expect(() => adventureEventSystem.executeChoice(event, event.choices[0])).toThrow();
    expect(store.get().gold).toBe(0);

    expect(adventureEventSystem.isChoiceEligible(event.choices[1])).toBe(false);
    partyTeamSystem.setCharacterClass('char_1', 'mage');
    expect(adventureEventSystem.isChoiceEligible(event.choices[1])).toBe(true);
  });
});
