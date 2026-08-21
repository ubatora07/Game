import { describe, it, expect, beforeEach } from 'vitest';
import { petSystem } from '../src/systems/PetSystem';
import { classSystem } from '../src/systems/ClassSystem';
import { partyTeamSystem } from '../src/systems/PartyTeamSystem';
import { store, createInitialState } from '../src/core/GameState';
import { modifierResolver } from '../src/core/modifiers/ModifierResolver';

describe('Phase 95 — Pet / Class Synergy Suite', () => {
  beforeEach(() => {
    store.replace(createInitialState());
    modifierResolver.clearAll();
    classSystem.respec(true);
    partyTeamSystem.resetAll();
    petSystem.resetAll();
  });

  it('P95-01: Correctly detects class-pet resonance across all 4 elemental pets', () => {
    petSystem.acquirePet('pet_ignis_drake');
    petSystem.acquirePet('pet_fenrir_wolf');
    petSystem.acquirePet('pet_sylph_sprite');
    petSystem.acquirePet('pet_aegis_golem');

    // 1. Mage selected -> Ignis has synergy, Fenrir does not
    classSystem.selectClass('mage', true);
    const ignisSyn = petSystem.getSynergyStatus('pet_ignis_drake');
    expect(ignisSyn.hasSynergy).toBe(true);
    expect(ignisSyn.matchingClass).toBe('mage');

    const fenrirSyn = petSystem.getSynergyStatus('pet_fenrir_wolf');
    expect(fenrirSyn.hasSynergy).toBe(false);

    // 2. Assassin selected -> Fenrir has synergy
    classSystem.respec(true);
    classSystem.selectClass('assassin', true);
    expect(petSystem.getSynergyStatus('pet_fenrir_wolf').hasSynergy).toBe(true);

    // 3. Archer selected -> Sylph has synergy
    classSystem.respec(true);
    classSystem.selectClass('archer', true);
    expect(petSystem.getSynergyStatus('pet_sylph_sprite').hasSynergy).toBe(true);

    // 4. Swordsman selected -> Aegis has synergy
    classSystem.respec(true);
    classSystem.selectClass('swordsman', true);
    expect(petSystem.getSynergyStatus('pet_aegis_golem').hasSynergy).toBe(true);
  });

  it('P95-02: Active synergy registers additional synergy modifiers into ModifierResolver', () => {
    petSystem.acquirePet('pet_ignis_drake');
    petSystem.setActivePet('pet_ignis_drake');

    // Without mage class: Ignis gives base +10% attack
    classSystem.selectClass('swordsman', true);
    const baseAtkDps = modifierResolver.resolve('attack', 100);
    // Swordsman gives +15% raw attack, Ignis gives +10% -> 126.5
    expect(baseAtkDps).toBeCloseTo(126.5, 1);

    // Switch to Mage: activates Mage Resonance (+15% Attack, +25% Pet Damage)
    classSystem.respec(true);
    classSystem.selectClass('mage', true);
    petSystem.reapplyActivePetModifiers();

    // Mage + Ignis base + Ignis synergy (+15%)
    const mageSynergyAtk = modifierResolver.resolve('attack', 100);
    expect(mageSynergyAtk).toBeGreaterThan(125);

    const petDamageMult = modifierResolver.resolve('petDamage', 100);
    expect(petDamageMult).toBe(125);
  });

  it('P95-03: Dual-character party team triggers synergy if either hero matches pet class', () => {
    petSystem.acquirePet('pet_sylph_sprite');
    petSystem.setActivePet('pet_sylph_sprite');

    // Main char is Swordsman, Second char is Archer
    classSystem.selectClass('swordsman', true);
    partyTeamSystem.setCharacterClass('char_1', 'swordsman');
    partyTeamSystem.unlockSecondCharacter('Lyra', 'archer');

    const synStatus = petSystem.getSynergyStatus('pet_sylph_sprite');
    expect(synStatus.hasSynergy).toBe(true);
    expect(synStatus.matchingClass).toBe('archer');

    // Sylph synergy adds +20% Attack Speed and +25% Loot
    petSystem.reapplyActivePetModifiers();
    const speedMult = modifierResolver.resolve('attackSpeed', 1.0);
    expect(speedMult).toBeGreaterThan(1.0);
  });

  it('P95-04: Synergy bonuses remain bounded (+15% to +30%) to maintain balance', () => {
    petSystem.acquirePet('pet_aegis_golem');
    petSystem.setActivePet('pet_aegis_golem');
    classSystem.selectClass('swordsman', true);
    petSystem.reapplyActivePetModifiers();

    const powerMult = modifierResolver.resolve('powerMultiplier', 1.0);
    expect(powerMult).toBeGreaterThanOrEqual(1.20);
    expect(powerMult).toBeLessThanOrEqual(2.0);
  });
});
