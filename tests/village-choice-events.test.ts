import { describe, it, expect, beforeEach } from 'vitest';
import { adventureEventSystem } from '../src/systems/AdventureEventSystem';
import { karmaSystem } from '../src/systems/KarmaSystem';
import { store, createInitialState } from '../src/core/GameState';
import { AdventureEventContext } from '../src/core/events/AdventureEventTypes';

describe('Phase 88 — Village Choice Events Suite', () => {
  beforeEach(() => {
    store.replace(createInitialState());
    adventureEventSystem.loadDefaultEvents();
    adventureEventSystem.resetAll();
    karmaSystem.resetAll();
  });

  it('P88-01: Positive branch grants positive Karma (+20) and records choice flag', () => {
    const oakhaven = adventureEventSystem.getEventById('evt_village_oakhaven_dilemma')!;
    expect(oakhaven).toBeDefined();

    const defendChoice = oakhaven.choices.find((c) => c.id === 'oakhaven_defend')!;
    const outcome = adventureEventSystem.executeChoice(oakhaven, defendChoice);

    expect(outcome.karmaDelta).toBe(20);
    expect(karmaSystem.getScore()).toBe(20);
    expect(karmaSystem.getKarmaBand()).toBe('positive');
    expect(karmaSystem.hasMajorChoiceFlag('evt_village_oakhaven_dilemma:oakhaven_defend')).toBe(true);
    expect(karmaSystem.hasMajorChoiceFlag('followup_evt_village_oakhaven_gratitude')).toBe(true);

    // Verifies follow-up event is now eligible
    const context: AdventureEventContext = {
      worldId: 1,
      activeClasses: ['swordsman'],
      currentKarma: karmaSystem.getScore(),
      rank: 'E',
      gold: store.get().gold,
    };

    const eligible = adventureEventSystem.getEligibleEvents(context);
    expect(eligible.some((e) => e.id === 'evt_village_oakhaven_gratitude')).toBe(true);
  });

  it('P88-02: Negative branch grants high instant Gold (+9000), negative Karma (-25), and retaliation trigger', () => {
    const oakhaven = adventureEventSystem.getEventById('evt_village_oakhaven_dilemma')!;
    const initialGold = store.get().gold;

    const plunderChoice = oakhaven.choices.find((c) => c.id === 'oakhaven_plunder')!;
    const outcome = adventureEventSystem.executeChoice(oakhaven, plunderChoice);

    expect(outcome.goldDelta).toBe(9000);
    expect(store.get().gold).toBe(initialGold + 9000);
    expect(karmaSystem.getScore()).toBe(-25);
    expect(karmaSystem.getKarmaBand()).toBe('negative');

    expect(karmaSystem.hasMajorChoiceFlag('evt_village_oakhaven_dilemma:oakhaven_plunder')).toBe(true);
    expect(karmaSystem.hasMajorChoiceFlag('followup_evt_village_oakhaven_bounty')).toBe(true);

    // Verifies retaliation encounter is now eligible for negative karma
    const context: AdventureEventContext = {
      worldId: 1,
      activeClasses: ['assassin'],
      currentKarma: karmaSystem.getScore(),
      rank: 'E',
      gold: store.get().gold,
    };

    const eligible = adventureEventSystem.getEligibleEvents(context);
    expect(eligible.some((e) => e.id === 'evt_village_oakhaven_bounty')).toBe(true);
  });

  it('P88-03: Neutral branch resolves without altering Karma score', () => {
    const oakhaven = adventureEventSystem.getEventById('evt_village_oakhaven_dilemma')!;
    const taxChoice = oakhaven.choices.find((c) => c.id === 'oakhaven_tax')!;

    const outcome = adventureEventSystem.executeChoice(oakhaven, taxChoice);
    expect(outcome.karmaDelta).toBe(0);
    expect(karmaSystem.getScore()).toBe(0);
    expect(karmaSystem.getKarmaBand()).toBe('neutral');
  });

  it('P88-04: Multi-world village crisis (Eldoria Dam) executes branching story rewards', () => {
    const eldoria = adventureEventSystem.getEventById('evt_village_eldoria_crisis')!;
    expect(eldoria).toBeDefined();

    const restoreChoice = eldoria.choices.find((c) => c.id === 'eldoria_restore_dam')!;
    adventureEventSystem.executeChoice(eldoria, restoreChoice);

    expect(karmaSystem.getScore()).toBe(22);
    expect(karmaSystem.hasMajorChoiceFlag('followup_evt_village_eldoria_blessing')).toBe(true);
  });
});
