import { describe, it, expect, beforeEach } from 'vitest';
import { partyTeamSystem } from '../src/systems/PartyTeamSystem';
import { PartnerAwakeningModal } from '../src/ui/modals/PartnerAwakeningModal';
import { modifierResolver } from '../src/core/modifiers/ModifierResolver';

describe('Phase 81 — Second Character Unlock Suite', () => {
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

  it('P81-01: PartnerAwakeningModal is registered with id partner_awakening', () => {
    expect(PartnerAwakeningModal.id).toBe('partner_awakening');
    expect(typeof PartnerAwakeningModal.render).toBe('function');
  });

  it('P81-02: Second character is unlocked upon completing awakening flow', () => {
    expect(partyTeamSystem.getCharacter('char_2').isUnlocked).toBe(false);

    const success = partyTeamSystem.unlockSecondCharacter('Lyra the Archer', 'archer');
    expect(success).toBe(true);

    const char2 = partyTeamSystem.getCharacter('char_2');
    expect(char2.isUnlocked).toBe(true);
    expect(char2.name).toBe('Lyra the Archer');
    expect(char2.classId).toBe('archer');

    // Modifiers active in Universal Modifier Resolver
    const resolvedSpd = modifierResolver.resolve('attackSpeed', 100);
    expect(resolvedSpd).toBeGreaterThan(100);
  });

  it('P81-03: Blocks duplicate unlocks and preserves partner state', () => {
    partyTeamSystem.unlockSecondCharacter('Kaelen', 'swordsman');
    expect(partyTeamSystem.getCharacter('char_2').isUnlocked).toBe(true);

    // Attempt re-unlock
    const duplicate = partyTeamSystem.unlockSecondCharacter('Imposter', 'mage');
    expect(duplicate).toBe(false);
    expect(partyTeamSystem.getCharacter('char_2').name).toBe('Kaelen');
    expect(partyTeamSystem.getCharacter('char_2').classId).toBe('swordsman');
  });
});
