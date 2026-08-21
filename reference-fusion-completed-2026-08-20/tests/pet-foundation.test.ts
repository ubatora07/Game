import { describe, it, expect, beforeEach } from 'vitest';
import { petSystem } from '../src/systems/PetSystem';
import { store, createInitialState } from '../src/core/GameState';
import { modifierResolver } from '../src/core/modifiers/ModifierResolver';
import { getAllPets, getPetDefinition } from '../src/content/petsCatalog';

import { classSystem } from '../src/systems/ClassSystem';
import { partyTeamSystem } from '../src/systems/PartyTeamSystem';

describe('Phase 93 — Pet Foundation Suite', () => {
  beforeEach(() => {
    store.replace(createInitialState());
    modifierResolver.clearAll();
    classSystem.respec(true);
    partyTeamSystem.resetAll();
    petSystem.resetAll();
  });

  it('P93-01: Pet catalog is registered and acquiring pet sets initial state', () => {
    const catalog = getAllPets();
    expect(catalog.length).toBe(4);

    const acquired = petSystem.acquirePet('pet_ignis_drake');
    expect(acquired).toBe(true);

    const pet = petSystem.getPetInstance('pet_ignis_drake');
    expect(pet).toBeDefined();
    expect(pet!.level).toBe(1);
    expect(pet!.xp).toBe(0);
    expect(pet!.evolutionStage).toBe(1);
    expect(petSystem.getActivePetId()).toBe('pet_ignis_drake');

    // Duplicate acquisition blocked
    const duplicate = petSystem.acquirePet('pet_ignis_drake');
    expect(duplicate).toBe(false);
  });

  it('P93-02: Equipping and unequipping active pet manages ModifierResolver modifiers', () => {
    petSystem.acquirePet('pet_ignis_drake');
    expect(petSystem.getActivePetId()).toBe('pet_ignis_drake');

    // Ignis Stage 1 grants +10% attack
    const attackDps = modifierResolver.resolve('attack', 100);
    expect(attackDps).toBeCloseTo(110, 2);

    // Unequip
    petSystem.setActivePet(null);
    expect(petSystem.getActivePetId()).toBeNull();
    const cleanDps = modifierResolver.resolve('attack', 100);
    expect(cleanDps).toBeCloseTo(100, 2);
  });

  it('P93-03: Pet gains XP and levels up across progressive thresholds', () => {
    petSystem.acquirePet('pet_fenrir_wolf');
    const pet = petSystem.getPetInstance('pet_fenrir_wolf')!;

    const lvlResult1 = petSystem.addPetXp('pet_fenrir_wolf', 50);
    expect(lvlResult1.leveledUp).toBe(false);
    expect(pet.level).toBe(1);

    // Level up
    const lvlResult2 = petSystem.addPetXp('pet_fenrir_wolf', 60);
    expect(lvlResult2.leveledUp).toBe(true);
    expect(pet.level).toBe(2);
    expect(pet.xpToNextLevel).toBeGreaterThan(100);
  });

  it('P93-04: Evolution gates check level, gold, and souls before awakening higher stages', () => {
    petSystem.acquirePet('pet_ignis_drake');
    const pet = petSystem.getPetInstance('pet_ignis_drake')!;

    // Cannot evolve at Lv 1
    const check1 = petSystem.canEvolvePet('pet_ignis_drake');
    expect(check1.eligible).toBe(false);
    expect(check1.reason).toContain('Level 10');

    // Level up to 10
    pet.level = 10;
    store.set((draft) => {
      draft.gold = 50000;
      draft.souls = 100;
    });

    const check2 = petSystem.canEvolvePet('pet_ignis_drake');
    expect(check2.eligible).toBe(true);
    expect(check2.nextStage).toBe(2);

    const evolved = petSystem.evolvePet('pet_ignis_drake');
    expect(evolved).toBe(true);
    expect(pet.evolutionStage).toBe(2);
    expect(pet.name).toBe('Flame Wyvern');

    // Stage 2 modifiers applied
    const bossDmg = modifierResolver.resolve('bossDamage', 100);
    expect(bossDmg).toBeGreaterThan(100);
  });

  it('P93-05: Periodic combat action ticks execute on active pet cooldown timer', () => {
    petSystem.acquirePet('pet_sylph_sprite');
    
    // First tick before interval
    const tick1 = petSystem.tickCombat(1000);
    expect(tick1.triggered).toBe(false);

    // Accumulate time past 3s interval
    const tick2 = petSystem.tickCombat(2500);
    expect(tick2.triggered).toBe(true);
    expect(tick2.damage).toBeGreaterThan(0);
    expect(tick2.action?.defaultName).toBe('Zephyr Gust');
  });

  it('P93-06: State serialization preserves owned pets, levels, evolution, and active slot', () => {
    petSystem.acquirePet('pet_aegis_golem');
    petSystem.addPetXp('pet_aegis_golem', 300);

    const serialized = petSystem.serialize();
    expect(serialized.activePetId).toBe('pet_aegis_golem');
    expect(serialized.ownedPets['pet_aegis_golem'].level).toBeGreaterThan(1);

    petSystem.resetAll();
    expect(petSystem.getOwnedPets().length).toBe(0);

    petSystem.deserialize(serialized);
    expect(petSystem.getActivePetId()).toBe('pet_aegis_golem');
    expect(petSystem.getPetInstance('pet_aegis_golem')?.level).toBe(serialized.ownedPets['pet_aegis_golem'].level);
  });
});
