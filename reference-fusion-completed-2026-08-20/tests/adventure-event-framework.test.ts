import { describe, it, expect, beforeEach } from 'vitest';
import { adventureEventSystem } from '../src/systems/AdventureEventSystem';
import { AdventureEventDefinition, AdventureEventContext } from '../src/core/events/AdventureEventTypes';
import { store, createInitialState } from '../src/core/GameState';
import { karmaSystem } from '../src/systems/KarmaSystem';

describe('Phase 85 — Adventure Event Framework Suite', () => {
  const sampleEvents: AdventureEventDefinition[] = [
    {
      id: 'event_ancient_chest',
      titleKey: 'event.ancient_chest.title',
      descKey: 'event.ancient_chest.desc',
      icon: '📦',
      category: 'chest',
      weight: 100,
      cooldownSeconds: 60,
      requirements: { minWorldId: 1, maxWorldId: 3 },
      choices: [
        {
          id: 'open_carefully',
          labelKey: 'event.ancient_chest.open',
          outcome: { goldDelta: 1000, crystalsDelta: 10, resultTextKey: 'event.ancient_chest.open_res' },
        },
        {
          id: 'leave_alone',
          labelKey: 'event.ancient_chest.leave',
          outcome: { resultTextKey: 'event.ancient_chest.leave_res' },
        },
      ],
    },
    {
      id: 'event_shadow_assassin_altar',
      titleKey: 'event.shadow_altar.title',
      descKey: 'event.shadow_altar.desc',
      icon: '🗡️',
      category: 'choice',
      weight: 50,
      cooldownSeconds: 120,
      requirements: { minWorldId: 2, requiredClasses: ['assassin'], minKarma: -10 },
      choices: [
        {
          id: 'sacrifice_blood',
          labelKey: 'event.shadow_altar.sacrifice',
          outcome: { powerDelta: 5000, karmaDelta: -5, resultTextKey: 'event.shadow_altar.sac_res' },
        },
      ],
    },
    {
      id: 'event_holy_pilgrim',
      titleKey: 'event.holy_pilgrim.title',
      descKey: 'event.holy_pilgrim.desc',
      icon: '✨',
      category: 'traveler',
      weight: 80,
      cooldownSeconds: 300,
      requirements: { onceOnly: true, minKarma: 10 },
      choices: [
        {
          id: 'bless_pilgrim',
          labelKey: 'event.holy_pilgrim.bless',
          outcome: { soulsDelta: 25, karmaDelta: 5, resultTextKey: 'event.holy_pilgrim.bless_res' },
        },
      ],
    },
  ];

  beforeEach(() => {
    store.replace(createInitialState());
    adventureEventSystem.clearEvents();
    adventureEventSystem.resetAll();
    karmaSystem.resetAll();
    adventureEventSystem.registerEvents(sampleEvents);
  });

  it('P85-01: Registers adventure events into system', () => {
    expect(adventureEventSystem.getAllEvents().length).toBe(3);
    expect(adventureEventSystem.getEventById('event_ancient_chest')?.category).toBe('chest');
  });

  it('P85-02: Eligibility resolver filters by World ID, Class, Karma, and Cooldown', () => {
    const context1: AdventureEventContext = {
      worldId: 1,
      activeClasses: ['mage'],
      currentKarma: 0,
      rank: 'F',
      gold: 500,
    };

    // In World 1 with Mage, only ancient chest is eligible
    const eligible1 = adventureEventSystem.getEligibleEvents(context1);
    expect(eligible1.map((e) => e.id)).toEqual(['event_ancient_chest']);

    // In World 2 with Assassin and Karma -5, both chest and shadow altar are eligible
    const context2: AdventureEventContext = {
      worldId: 2,
      activeClasses: ['assassin'],
      currentKarma: -5,
      rank: 'D',
      gold: 1500,
    };
    const eligible2 = adventureEventSystem.getEligibleEvents(context2);
    expect(eligible2.map((e) => e.id)).toContain('event_ancient_chest');
    expect(eligible2.map((e) => e.id)).toContain('event_shadow_assassin_altar');
    expect(eligible2.map((e) => e.id)).not.toContain('event_holy_pilgrim');
  });

  it('P85-03: Weighted random selector returns an eligible event', () => {
    const context: AdventureEventContext = {
      worldId: 1,
      activeClasses: ['mage'],
      currentKarma: 0,
      rank: 'F',
      gold: 500,
    };

    const selected = adventureEventSystem.selectWeightedEvent(context);
    expect(selected).toBeDefined();
    expect(selected?.id).toBe('event_ancient_chest');
  });

  it('P85-04: Atomic choice execution updates currencies, karma, and sets cooldown', () => {
    const chestEvt = adventureEventSystem.getEventById('event_ancient_chest')!;
    const choice = chestEvt.choices[0]; // +1000 Gold, +10 Crystals

    const initialGold = store.get().gold;
    const initialCrystals = store.get().crystals;

    const outcome = adventureEventSystem.executeChoice(chestEvt, choice);
    expect(outcome.goldDelta).toBe(1000);

    expect(store.get().gold).toBe(initialGold + 1000);
    expect(store.get().crystals).toBe(initialCrystals + 10);

    // Verifies event is now on cooldown
    const context: AdventureEventContext = {
      worldId: 1,
      activeClasses: ['mage'],
      currentKarma: 0,
      rank: 'F',
      gold: 500,
    };
    const eligibleAfter = adventureEventSystem.getEligibleEvents(context);
    expect(eligibleAfter.length).toBe(0);
  });

  it('P85-05: Once-only events and karma persist through serialization', () => {
    adventureEventSystem.setKarma(20);
    const pilgrimEvt = adventureEventSystem.getEventById('event_holy_pilgrim')!;
    adventureEventSystem.executeChoice(pilgrimEvt, pilgrimEvt.choices[0]);

    expect(adventureEventSystem.getKarma()).toBe(25);

    const saved = adventureEventSystem.serialize();
    const savedKarma = karmaSystem.serialize();
    expect(saved.completedOnceOnly).toContain('event_holy_pilgrim');
    expect(savedKarma.score).toBe(25);

    // Adventure history and Karma are separate V7 save domains.
    adventureEventSystem.resetAll();
    karmaSystem.resetAll();
    expect(adventureEventSystem.getKarma()).toBe(0);

    adventureEventSystem.deserialize(saved);
    karmaSystem.deserialize(savedKarma);
    expect(adventureEventSystem.getKarma()).toBe(25);

    // Once-only event remains ineligible
    const context: AdventureEventContext = {
      worldId: 1,
      activeClasses: ['mage'],
      currentKarma: 25,
      rank: 'F',
      gold: 500,
    };
    expect(adventureEventSystem.isEventEligible(pilgrimEvt, context)).toBe(false);
  });
});
