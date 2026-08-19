import { describe, it, expect, beforeEach } from 'vitest';
import { adventureEventSystem } from '../src/systems/AdventureEventSystem';
import { karmaSystem } from '../src/systems/KarmaSystem';
import { store, createInitialState } from '../src/core/GameState';
import { events } from '../src/core/EventBus';
import { AdventureEventContext } from '../src/core/events/AdventureEventTypes';

describe('Phase 89 — Event-Driven Character Recruitment Suite', () => {
  beforeEach(() => {
    store.replace(createInitialState());
    adventureEventSystem.loadDefaultEvents();
    adventureEventSystem.resetAll();
    karmaSystem.resetAll();
  });

  it('P89-01: First-time recruit unlocks hero in GameState heroes roster', () => {
    // Ensure 'hiro' is not in initial heroes roster for test
    store.set((draft) => {
      delete draft.heroes['hiro'];
    });
    expect(store.get().heroes['hiro']).toBeUndefined();

    const mercEvent = adventureEventSystem.getEventById('evt_recruit_mercenary')!;
    expect(mercEvent).toBeDefined();

    let modalOpened = false;
    let modalHeroId = '';
    const unsub = events.on('modal:open', (payload) => {
      if (payload.modalId === 'hero_recruitment_modal') {
        modalOpened = true;
        modalHeroId = payload.data?.hero?.id;
      }
    });

    const choice = mercEvent.choices.find((c) => c.id === 'hire_veteran')!;
    adventureEventSystem.executeChoice(mercEvent, choice);

    expect(store.get().heroes['hiro']).toBeDefined();
    expect(store.get().heroes['hiro'].stars).toBe(1);
    expect(store.get().heroes['hiro'].duplicates).toBe(0);
    expect(modalOpened).toBe(true);
    expect(modalHeroId).toBe('hiro');

    unsub();
  });

  it('P89-02: Duplicate recruitment awards +5 hero fragments without resetting stars', () => {
    // Setup existing hero with 2 stars and 3 duplicates
    store.set((draft) => {
      draft.heroes['hiro'] = { stars: 2, duplicates: 3 };
    });

    const mercEvent = adventureEventSystem.getEventById('evt_recruit_mercenary')!;
    const choice = mercEvent.choices.find((c) => c.id === 'hire_veteran')!;

    let isDuplicateRecruit = false;
    const unsub = events.on('modal:open', (payload) => {
      if (payload.modalId === 'hero_recruitment_modal') {
        isDuplicateRecruit = payload.data?.isDuplicate;
      }
    });

    adventureEventSystem.executeChoice(mercEvent, choice);

    expect(store.get().heroes['hiro'].stars).toBe(2);
    expect(store.get().heroes['hiro'].duplicates).toBe(8); // 3 + 5
    expect(isDuplicateRecruit).toBe(true);

    unsub();
  });

  it('P89-03: Karma-gated dark cultist recruit requires negative Karma and unlocks Kuro', () => {
    const cultistEvent = adventureEventSystem.getEventById('evt_recruit_dark_cultist')!;
    expect(cultistEvent).toBeDefined();

    // With positive karma, event is not eligible
    karmaSystem.setScore(30);
    const contextPositive: AdventureEventContext = {
      worldId: 1,
      activeClasses: ['swordsman'],
      currentKarma: 30,
      rank: 'E',
      gold: 5000,
    };
    expect(adventureEventSystem.isEventEligible(cultistEvent, contextPositive)).toBe(false);

    // With negative karma (-25), event is eligible
    karmaSystem.setScore(-25);
    const contextNegative: AdventureEventContext = {
      worldId: 1,
      activeClasses: ['assassin'],
      currentKarma: -25,
      rank: 'E',
      gold: 5000,
    };
    expect(adventureEventSystem.isEventEligible(cultistEvent, contextNegative)).toBe(true);

    const choice = cultistEvent.choices.find((c) => c.id === 'embrace_dark_pact')!;
    adventureEventSystem.executeChoice(cultistEvent, choice);

    expect(store.get().heroes['kuro']).toBeDefined();
    expect(karmaSystem.getScore()).toBe(-35); // -25 + -10
  });

  it('P89-04: Class-gated arcane familiar recruit requires Mage class and unlocks Seraphina', () => {
    const familiarEvent = adventureEventSystem.getEventById('evt_recruit_arcane_familiar')!;
    expect(familiarEvent).toBeDefined();

    // Swordsman context -> not eligible
    const contextSwordsman: AdventureEventContext = {
      worldId: 2,
      activeClasses: ['swordsman'],
      currentKarma: 0,
      rank: 'D',
      gold: 5000,
    };
    expect(adventureEventSystem.isEventEligible(familiarEvent, contextSwordsman)).toBe(false);

    // Mage context -> eligible
    const contextMage: AdventureEventContext = {
      worldId: 2,
      activeClasses: ['mage'],
      currentKarma: 0,
      rank: 'D',
      gold: 5000,
    };
    expect(adventureEventSystem.isEventEligible(familiarEvent, contextMage)).toBe(true);

    const choice = familiarEvent.choices.find((c) => c.id === 'summon_astral_familiar')!;
    adventureEventSystem.executeChoice(familiarEvent, choice);

    expect(store.get().heroes['seraphina']).toBeDefined();
  });
});
