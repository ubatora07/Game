import { describe, it, expect, beforeEach } from 'vitest';
import { store, createInitialState } from '../src/core/GameState';
import { RelicSystem } from '../src/systems/RelicSystem';

describe('Relic System', () => {
  beforeEach(() => {
    store.replace(createInitialState());
  });

  it('should grant a relic and place it in inventory', () => {
    RelicSystem.grantRelic('phantom_finger');
    const state = store.get();
    expect(state.relics['phantom_finger']).toBeDefined();
    expect(state.relics['phantom_finger'].level).toBe(1);
    expect(state.relics['phantom_finger'].duplicates).toBe(0);
  });

  it('should level up a relic on enough duplicates', () => {
    RelicSystem.grantRelic('phantom_finger'); // lv 1
    // needs 2 dupes for lv 2
    RelicSystem.grantRelic('phantom_finger'); // dupe 1
    RelicSystem.grantRelic('phantom_finger'); // dupe 2 -> lv 2
    
    let state = store.get();
    expect(state.relics['phantom_finger'].level).toBe(2);
    expect(state.relics['phantom_finger'].duplicates).toBe(0);
  });

  it('should equip a relic into a slot', () => {
    RelicSystem.grantRelic('phantom_finger');
    RelicSystem.equipRelic('phantom_finger', 0);
    
    const state = store.get();
    expect(state.equippedRelics[0]).toBe('phantom_finger');
  });

  it('should unequip a relic from a slot', () => {
    RelicSystem.grantRelic('phantom_finger');
    RelicSystem.equipRelic('phantom_finger', 0);
    RelicSystem.unequipRelic(0);
    
    const state = store.get();
    expect(state.equippedRelics[0]).toBeNull();
  });

  it('should calculate equipped effect value correctly', () => {
    RelicSystem.grantRelic('phantom_finger'); // auto_training, level 1 -> 1.0 base
    RelicSystem.equipRelic('phantom_finger', 1);
    
    let state = store.get();
    let effectValue = RelicSystem.getEquippedEffectValue(state, 'auto_training');
    expect(effectValue).toBe(1);

    // Level up
    RelicSystem.grantRelic('phantom_finger');
    RelicSystem.grantRelic('phantom_finger');
    state = store.get();
    
    effectValue = RelicSystem.getEquippedEffectValue(state, 'auto_training');
    expect(effectValue).toBe(2); // Level 2 -> 1 + 1*1 = 2
  });
});
