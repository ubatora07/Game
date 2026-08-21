import { beforeEach, describe, expect, it } from 'vitest';
import { events } from '../src/core/EventBus';
import { modifierResolver } from '../src/core/modifiers/ModifierResolver';
import { karmaSystem } from '../src/systems/KarmaSystem';
import { partyTeamSystem } from '../src/systems/PartyTeamSystem';

describe('P0 runtime contracts', () => {
  beforeEach(() => {
    modifierResolver.clearAll();
    karmaSystem.resetAll();
    partyTeamSystem.resetAll();
  });

  it('emits major-choice events so WorldStateManager can react', () => {
    let payload: { flagId: string; value: boolean } | null = null;
    const off = events.on('karma:major_choice_recorded', (data) => { payload = data; });
    karmaSystem.setMajorChoiceFlag('refugees_sheltered', true);
    expect(payload).toEqual({ flagId: 'refugees_sheltered', value: true });
    off();
  });

  it('rebuilds karma modifiers when current-life karma resets', () => {
    modifierResolver.clearAll();
    karmaSystem.setScore(-100);
    expect(modifierResolver.resolve('bossDamage', 1)).toBeCloseTo(1.15, 6);
    karmaSystem.resetCurrentLifeKarma();
    expect(karmaSystem.getScore()).toBe(0);
    expect(modifierResolver.resolve('bossDamage', 1)).toBeCloseTo(1, 6);
    expect(modifierResolver.resolve('attackSpeed', 1)).toBeCloseTo(1.12, 6);
  });

  it('emits party class changes for dependent systems such as pet synergy', () => {
    let payload: { slotId: string; classId: string } | null = null;
    const off = events.on('party:character_class_selected', (data) => { payload = data; });
    expect(partyTeamSystem.setCharacterClass('char_1', 'archer')).toBe(true);
    expect(payload).toEqual({ slotId: 'char_1', classId: 'archer' });
    off();
  });

  it('emits second-character unlocks for dependent systems', () => {
    let payload: { slotId: 'char_2'; name: string; classId?: string } | null = null;
    const off = events.on('party:second_character_unlocked', (data) => { payload = data; });
    expect(partyTeamSystem.unlockSecondCharacter('Rook', 'swordsman')).toBe(true);
    expect(payload).toEqual({ slotId: 'char_2', name: 'Rook', classId: 'swordsman' });
    off();
  });
});
