import { describe, it, expect, beforeEach } from 'vitest';
import { partyTeamSystem } from '../src/systems/PartyTeamSystem';
import { modifierResolver } from '../src/core/modifiers/ModifierResolver';

describe('Phase 80 — Two-Character Team Core Suite', () => {
  beforeEach(() => {
    modifierResolver.clearAll();
    partyTeamSystem.deserialize({
      characters: {
        char_1: {
          slotId: 'char_1',
          name: 'Hero 1',
          isUnlocked: true,
          classId: 'mage',
          level: 1,
          skillPoints: 4,
          unlockedSkillNodeIds: [],
        },
        char_2: {
          slotId: 'char_2',
          name: 'Partner 2',
          isUnlocked: false,
          classId: null,
          level: 1,
          skillPoints: 4,
          unlockedSkillNodeIds: [],
        },
      },
      activeFocusCharId: 'char_1',
    });
  });

  it('P80-01: Character 1 is unlocked from start while Character 2 is initially locked', () => {
    const char1 = partyTeamSystem.getCharacter('char_1');
    const char2 = partyTeamSystem.getCharacter('char_2');

    expect(char1.isUnlocked).toBe(true);
    expect(char2.isUnlocked).toBe(false);
    expect(partyTeamSystem.getActiveFocusSlot()).toBe('char_1');
  });

  it('P80-02: Unlocking second character activates slot 2 and registers into system', () => {
    const success = partyTeamSystem.unlockSecondCharacter('Kaelen the Blade', 'swordsman');
    expect(success).toBe(true);

    const char2 = partyTeamSystem.getCharacter('char_2');
    expect(char2.isUnlocked).toBe(true);
    expect(char2.name).toBe('Kaelen the Blade');
    expect(char2.classId).toBe('swordsman');

    // Attempting duplicate unlock returns false
    const duplicate = partyTeamSystem.unlockSecondCharacter('Duplicate');
    expect(duplicate).toBe(false);
  });

  it('P80-03: Both characters maintain independent classes and active modifiers', () => {
    partyTeamSystem.setCharacterClass('char_1', 'archer'); // 1.05x ATK, 1.35x SPD
    partyTeamSystem.unlockSecondCharacter('Valkyrie', 'swordsman'); // 1.15x ATK, +30% Boss DMG

    // Combined modifiers in modifierResolver
    const resolvedAtk = modifierResolver.resolve('attack', 100);
    // Base 100 * 1.05 (archer) * 1.15 (swordsman) = 120.75
    expect(resolvedAtk).toBeCloseTo(120.75, 2);

    const resolvedBoss = modifierResolver.resolve('bossDamage', 100, { isBoss: true });
    // Base 100 * (1 + 0.10 [archer] + 0.30 [swordsman]) = 140
    expect(resolvedBoss).toBe(140);
  });

  it('P80-04: Combined protagonist combat power scales with both active characters', () => {
    // With 1 char unlocked: 100 base
    const power1 = partyTeamSystem.getCombinedProtagonistPower();
    expect(power1).toBeGreaterThan(100);

    // Unlock 2nd char: 200 base
    partyTeamSystem.unlockSecondCharacter('Partner', 'assassin');
    const power2 = partyTeamSystem.getCombinedProtagonistPower();
    expect(power2).toBeGreaterThan(power1);
  });

  it('P80-05: State serialization preserves dual characters and focus selection', () => {
    partyTeamSystem.unlockSecondCharacter('Shadow Twin', 'assassin');
    partyTeamSystem.setActiveFocusSlot('char_2');

    const state = partyTeamSystem.serialize();
    expect(state.characters.char_2.isUnlocked).toBe(true);
    expect(state.characters.char_2.classId).toBe('assassin');
    expect(state.activeFocusCharId).toBe('char_2');

    // Deserialization restores state
    partyTeamSystem.deserialize(state);
    expect(partyTeamSystem.getActiveFocusSlot()).toBe('char_2');
    expect(partyTeamSystem.getCharacter('char_2').name).toBe('Shadow Twin');
  });
});
