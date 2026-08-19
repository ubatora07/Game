import { beforeEach, describe, expect, it } from 'vitest';
import { modifierResolver } from '../src/core/modifiers/ModifierResolver';
import { classSystem } from '../src/systems/ClassSystem';
import { partyTeamSystem } from '../src/systems/PartyTeamSystem';

describe('P0 class ownership consolidation', () => {
  beforeEach(() => {
    modifierResolver.clearAll();
    partyTeamSystem.resetAll();
  });

  it('uses PartyTeam char_1 as the single source of protagonist class truth', () => {
    expect(classSystem.getSelectedClassId()).toBeNull();
    expect(classSystem.selectClass('mage')).toBe(true);
    expect(classSystem.getSelectedClassId()).toBe('mage');
    expect(partyTeamSystem.getCharacter('char_1').classId).toBe('mage');
  });

  it('respec clears only protagonist class while preserving partner class modifiers', () => {
    classSystem.selectClass('mage', true);
    partyTeamSystem.unlockSecondCharacter('Rook', 'swordsman');
    const withBoth = modifierResolver.resolve('attack', 100);
    expect(classSystem.respec(true)).toBe(true);
    expect(classSystem.getSelectedClassId()).toBeNull();
    expect(partyTeamSystem.getCharacter('char_2').classId).toBe('swordsman');
    expect(modifierResolver.resolve('attack', 100)).toBeLessThan(withBoth);
    expect(modifierResolver.resolve('attack', 100)).toBeGreaterThan(100);
  });
});
