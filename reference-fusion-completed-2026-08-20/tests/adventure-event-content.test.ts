import { describe, it, expect, beforeEach } from 'vitest';
import { ADVENTURE_EVENTS } from '../src/content/adventureEvents';
import { adventureEventSystem } from '../src/systems/AdventureEventSystem';
import { AdventureEventCategory } from '../src/core/events/AdventureEventTypes';

describe('Phase 86 — Basic Random Event Content Suite', () => {
  beforeEach(() => {
    adventureEventSystem.loadDefaultEvents();
  });

  it('P86-01: Adventure event content pool contains all 30 production events across 7 categories', () => {
    expect(ADVENTURE_EVENTS.length).toBeGreaterThanOrEqual(30);

    const categories: AdventureEventCategory[] = [
      'chest',
      'traveler',
      'merchant',
      'ambush',
      'village',
      'recruit',
      'strange_npc',
      'rare_item',
    ];

    const foundCategories = new Set(ADVENTURE_EVENTS.map((e) => e.category));
    for (const cat of categories) {
      expect(foundCategories.has(cat)).toBe(true);
    }
  });

  it('P86-02: Events are distributed across progressive World tiers (World 1, 2, 3)', () => {
    const world1Events = ADVENTURE_EVENTS.filter((e) => !e.requirements?.minWorldId || e.requirements.minWorldId === 1);
    const world2Events = ADVENTURE_EVENTS.filter((e) => e.requirements?.minWorldId === 2);
    const world3Events = ADVENTURE_EVENTS.filter((e) => e.requirements?.minWorldId === 3);

    expect(world1Events.length).toBeGreaterThanOrEqual(10);
    expect(world2Events.length).toBeGreaterThanOrEqual(8);
    expect(world3Events.length).toBeGreaterThanOrEqual(3);
  });

  it('P86-03: Rewards are well-bounded and prevent economy-breaking exploits', () => {
    for (const evt of ADVENTURE_EVENTS) {
      expect(evt.cooldownSeconds).toBeGreaterThanOrEqual(60);
      for (const choice of evt.choices) {
        if (choice.outcome.goldDelta) {
          expect(choice.outcome.goldDelta).toBeLessThanOrEqual(20000);
        }
        if (choice.outcome.crystalsDelta) {
          expect(choice.outcome.crystalsDelta).toBeLessThanOrEqual(100);
        }
        if (choice.outcome.soulsDelta) {
          expect(choice.outcome.soulsDelta).toBeLessThanOrEqual(100);
        }
        if (choice.outcome.powerDelta) {
          expect(choice.outcome.powerDelta).toBeLessThanOrEqual(20000);
        }
      }
    }
  });

  it('P86-04: System loads default pool and resolves specific event choices', () => {
    const runicChest = adventureEventSystem.getEventById('evt_chest_ancient_runic');
    expect(runicChest).toBeDefined();
    expect(runicChest?.choices.length).toBe(2);
    expect(runicChest?.choices[1].requiredClass).toBe('mage');
  });
});
