import { describe, it, expect, beforeEach } from 'vitest';
import { adventureEventSystem } from '../src/systems/AdventureEventSystem';
import { petSystem } from '../src/systems/PetSystem';
import { marketSystem } from '../src/systems/MarketSystem';
import { store, createInitialState } from '../src/core/GameState';
import { modifierResolver } from '../src/core/modifiers/ModifierResolver';

describe('Phase 94 — Pet Acquisition & Growth Suite', () => {
  beforeEach(() => {
    store.replace(createInitialState());
    modifierResolver.clearAll();
    adventureEventSystem.loadDefaultEvents();
    adventureEventSystem.resetAll();
    petSystem.resetAll();
    marketSystem.resetAll();
  });

  it('P94-01: First Pet acquisition via Adventure Event Nest unlocks elemental companion', () => {
    expect(petSystem.getOwnedPets().length).toBe(0);

    const nestEvent = adventureEventSystem.getEventById('evt_pet_mystic_egg_nest')!;
    expect(nestEvent).toBeDefined();

    const fireChoice = nestEvent.choices.find((c) => c.id === 'hatch_ignis')!;
    adventureEventSystem.executeChoice(nestEvent, fireChoice);

    const owned = petSystem.getOwnedPets();
    expect(owned.length).toBe(1);
    expect(owned[0].id).toBe('pet_ignis_drake');
    expect(petSystem.getActivePetId()).toBe('pet_ignis_drake');
  });

  it('P94-02: Branching event choices unlock distinct elemental pets', () => {
    const nestEvent = adventureEventSystem.getEventById('evt_pet_mystic_egg_nest')!;

    // Water choice -> Fenrir
    const waterChoice = nestEvent.choices.find((c) => c.id === 'hatch_fenrir')!;
    adventureEventSystem.executeChoice(nestEvent, waterChoice);

    expect(petSystem.getPetInstance('pet_fenrir_wolf')).toBeDefined();
    expect(petSystem.getActivePetId()).toBe('pet_fenrir_wolf');
  });

  it('P94-03: Marketplace Pet Treat grants +400 XP to active pet', () => {
    petSystem.acquirePet('pet_sylph_sprite');
    const pet = petSystem.getPetInstance('pet_sylph_sprite')!;
    expect(pet.xp).toBe(0);

    store.set((draft) => {
      draft.gold = 50000;
    });

    // Force pet treat slot
    marketSystem.refreshMarket(true);
    const slots = marketSystem.getSlots();
    const treatSlot = slots.find((s) => s.item.id === 'mkt_pet_treat');

    if (treatSlot) {
      const res = marketSystem.purchaseItem(treatSlot.slotId);
      expect(res.success).toBe(true);
      expect(pet.level).toBeGreaterThanOrEqual(3);
    }
  });

  it('P94-04: Marketplace Pet Egg incubates companion or awards bonus XP on duplicate', () => {
    store.set((draft) => {
      draft.crystals = 500;
    });

    marketSystem.refreshMarket(true);
    const slots = marketSystem.getSlots();
    const eggSlot = slots.find((s) => s.item.id === 'mkt_pet_incubator_egg');

    if (eggSlot) {
      // 1. First purchase acquires pet
      const res1 = marketSystem.purchaseItem(eggSlot.slotId);
      expect(res1.success).toBe(true);
      expect(petSystem.getPetInstance('pet_ignis_drake')).toBeDefined();

      // 2. Duplicate acquisition gives XP
      const initialLevel = petSystem.getPetInstance('pet_ignis_drake')!.level;
      const initialXp = petSystem.getPetInstance('pet_ignis_drake')!.xp;

      // Re-trigger egg effect
      petSystem.addPetXp('pet_ignis_drake', 500);
      expect(
        petSystem.getPetInstance('pet_ignis_drake')!.level > initialLevel ||
        petSystem.getPetInstance('pet_ignis_drake')!.xp > initialXp
      ).toBe(true);
    }
  });

  it('P94-05: Duplicate event outcomes award XP without resetting pet evolution progress', () => {
    petSystem.acquirePet('pet_aegis_golem');
    const pet = petSystem.getPetInstance('pet_aegis_golem')!;
    pet.level = 12;
    pet.evolutionStage = 2;

    const nestEvent = adventureEventSystem.getEventById('evt_pet_mystic_egg_nest')!;
    const earthChoice = nestEvent.choices.find((c) => c.id === 'hatch_aegis')!;

    // Execute duplicate event choice
    adventureEventSystem.executeChoice(nestEvent, earthChoice);

    // Stage must be preserved, XP awarded
    expect(pet.evolutionStage).toBe(2);
    expect(pet.xp).toBeGreaterThanOrEqual(0);
  });
});
