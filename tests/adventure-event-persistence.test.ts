import { beforeEach, describe, expect, it } from 'vitest';
import { createInitialState, store } from '../src/core/GameState';
import { adventureEventSystem } from '../src/systems/AdventureEventSystem';
import { karmaSystem } from '../src/systems/KarmaSystem';

describe('P0 adventure event persistence', () => {
  beforeEach(() => {
    store.replace(createInitialState());
    adventureEventSystem.resetAll();
    karmaSystem.resetAll();
  });

  it('preserves once-only completion and active cooldowns across deserialize', () => {
    const event = adventureEventSystem.getEventById('evt_village_oakhaven_dilemma');
    expect(event).toBeDefined();
    if (!event) return;

    const choice = event.choices[0];
    adventureEventSystem.executeChoice(event, choice);
    const saved = adventureEventSystem.serialize();

    adventureEventSystem.resetAll();
    adventureEventSystem.deserialize(saved, Date.now());

    expect(adventureEventSystem.serialize().completedOnceOnly).toEqual(saved.completedOnceOnly);
    expect(adventureEventSystem.serialize().eventCooldowns).toEqual(saved.eventCooldowns);
  });

  it('drops expired cooldowns during hydration', () => {
    adventureEventSystem.deserialize({
      completedOnceOnly: ['evt_once'],
      eventCooldowns: { expired: 100, active: 5000 },
    }, 1000);

    expect(adventureEventSystem.serialize()).toEqual({
      completedOnceOnly: ['evt_once'],
      eventCooldowns: { active: 5000 },
    });
  });
});
