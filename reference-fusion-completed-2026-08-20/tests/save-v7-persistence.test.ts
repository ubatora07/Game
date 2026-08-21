import { beforeEach, describe, expect, it } from 'vitest';
import { createInitialState, store } from '../src/core/GameState';
import { sanitizeGameState } from '../src/services/save/SaveSchema';
import { selectMostRecentSave } from '../src/services/save/SaveSelection';
import { RpgSaveAggregate } from '../src/services/save/RpgSaveAggregate';
import { modifierResolver } from '../src/core/modifiers/ModifierResolver';
import { partyTeamSystem } from '../src/systems/PartyTeamSystem';
import { petSystem } from '../src/systems/PetSystem';
import { karmaSystem } from '../src/systems/KarmaSystem';
import { worldStateManager } from '../src/systems/WorldStateManager';
import { adventureEventSystem } from '../src/systems/AdventureEventSystem';
import { settlementSystem } from '../src/systems/SettlementSystem';
import { craftingEquipmentSystem } from '../src/systems/CraftingEquipmentSystem';
import { marketSystem } from '../src/systems/MarketSystem';
import { mercenarySystem } from '../src/systems/MercenarySystem';
import { titleSystem } from '../src/systems/TitleSystem';
import { settlementDefenseSystem } from '../src/systems/SettlementDefenseSystem';
import { settlementStorySystem } from '../src/systems/SettlementStorySystem';
import { legacyEndingSystem } from '../src/systems/LegacyEndingSystem';

function hydrateRoundTrip() {
  const snapshot = createInitialState();
  RpgSaveAggregate.captureInto(snapshot);
  const persisted = sanitizeGameState(snapshot);
  RpgSaveAggregate.resetAll();
  RpgSaveAggregate.hydrate(persisted);
  return persisted;
}

describe('Save V7 stateful RPG aggregate', () => {
  beforeEach(() => {
    store.replace(createInitialState());
    RpgSaveAggregate.resetAll();
    modifierResolver.clearAll();
  });

  it('round-trips party, active focus, second character, evolved pet, karma and world flags', () => {
    partyTeamSystem.setCharacterClass('char_1', 'mage', false);
    expect(partyTeamSystem.unlockSecondCharacter('Lyra', 'archer')).toBe(true);
    partyTeamSystem.setActiveFocusSlot('char_2');

    petSystem.deserialize({
      ownedPets: {
        pet_ignis_drake: {
          id: 'pet_ignis_drake',
          name: 'Flame Wyvern',
          level: 14,
          xp: 125,
          xpToNextLevel: 500,
          evolutionStage: 2,
          affection: 72,
          unlockedAt: Date.now() - 10_000,
        },
      },
      activePetId: 'pet_ignis_drake',
    });

    karmaSystem.setScore(61);
    karmaSystem.setMajorChoiceFlag('refugees_sheltered', true);
    karmaSystem.modifyFactionReputation('mountain_haven', 17);
    worldStateManager.setFlag('village_saved', true);
    worldStateManager.setFlag('sovereign_citadel_erected', true);

    const persisted = hydrateRoundTrip();

    expect(persisted.partyTeam?.characters.char_2.isUnlocked).toBe(true);
    expect(partyTeamSystem.getCharacter('char_1').classId).toBe('mage');
    expect(partyTeamSystem.getCharacter('char_2').classId).toBe('archer');
    expect(partyTeamSystem.getActiveFocusSlot()).toBe('char_2');

    expect(petSystem.getActivePetId()).toBe('pet_ignis_drake');
    expect(petSystem.getPetInstance('pet_ignis_drake')?.evolutionStage).toBe(2);
    expect(petSystem.getPetInstance('pet_ignis_drake')?.level).toBe(14);

    expect(karmaSystem.getScore()).toBe(61);
    expect(karmaSystem.getMajorChoiceFlag('refugees_sheltered')).toBe(true);
    expect(karmaSystem.getFactionReputation('mountain_haven')).toBe(17);

    expect(worldStateManager.hasFlag('village_saved')).toBe(true);
    expect(worldStateManager.hasFlag('sovereign_citadel_erected')).toBe(true);
    expect(persisted.worldState?.legacyWorldChronicle.sovereign_citadel_erected).toBe(true);
  });

  it('does not double-apply pet or karma modifiers when the same save hydrates repeatedly', () => {
    partyTeamSystem.setCharacterClass('char_1', 'mage', false);
    petSystem.acquirePet('pet_ignis_drake');
    karmaSystem.setScore(60);

    const snapshot = createInitialState();
    RpgSaveAggregate.captureInto(snapshot);
    const persisted = sanitizeGameState(snapshot);

    modifierResolver.clearAll();
    RpgSaveAggregate.hydrate(persisted);
    const petFirst = modifierResolver.getBreakdown('attack', 100).appliedModifiers
      .filter((modifier) => modifier.sourceType === 'pet').length;
    const karmaFirst = modifierResolver.getBreakdown('powerMultiplier', 1).appliedModifiers
      .filter((modifier) => modifier.sourceType === 'karma').length;

    RpgSaveAggregate.hydrate(persisted);
    const petSecond = modifierResolver.getBreakdown('attack', 100).appliedModifiers
      .filter((modifier) => modifier.sourceType === 'pet').length;
    const karmaSecond = modifierResolver.getBreakdown('powerMultiplier', 1).appliedModifiers
      .filter((modifier) => modifier.sourceType === 'karma').length;

    expect(petFirst).toBeGreaterThan(0);
    expect(karmaFirst).toBeGreaterThan(0);
    expect(petSecond).toBe(petFirst);
    expect(karmaSecond).toBe(karmaFirst);
  });

  it('resetAll clears every external V7 domain back to its fresh-save contract', () => {
    settlementSystem.deserialize({ isOwned: true, wood: 999 });
    craftingEquipmentSystem.deserialize({ totalCraftedCount: 9, totalEvolvedCount: 3 });
    marketSystem.deserialize({ isBlackMarketDiscovered: true, totalPurchasesCount: 7, totalBlackMarketPurchasesCount: 2 });
    mercenarySystem.deserialize({ totalHiresCount: 6 });
    titleSystem.deserialize({ unlockedTitleIds: ['title_novice_traveler', 'title_pioneer_lord'], equippedTitleId: 'title_pioneer_lord' });
    settlementDefenseSystem.deserialize({ totalRaidsDefeated: 4, totalRaidsFailed: 2 });
    settlementStorySystem.deserialize({ currentChapterId: 'custom', completedChapterIds: ['custom'], chosenPath: 'lord' });
    legacyEndingSystem.deserialize({ totalEndingsCompleted: 3 });
    partyTeamSystem.unlockSecondCharacter('Lyra', 'archer');
    petSystem.acquirePet('pet_ignis_drake');
    karmaSystem.setScore(-70);
    karmaSystem.setMajorChoiceFlag('dark_route', true);
    adventureEventSystem.deserialize({ completedOnceOnly: ['event_once'], eventCooldowns: { event_once: Date.now() + 60_000 } });
    worldStateManager.setFlag('village_ruined', true);

    RpgSaveAggregate.resetAll();

    expect(settlementSystem.serialize().isOwned).toBe(false);
    expect(craftingEquipmentSystem.serialize().totalCraftedCount).toBe(0);
    expect(marketSystem.serialize().isBlackMarketDiscovered).toBe(false);
    expect(marketSystem.serialize().totalPurchasesCount).toBe(0);
    expect(mercenarySystem.serialize().totalHiresCount).toBe(0);
    expect(titleSystem.serialize()).toEqual({
      unlockedTitleIds: ['title_novice_traveler'],
      equippedTitleId: 'title_novice_traveler',
    });
    expect(settlementDefenseSystem.serialize().totalRaidsDefeated).toBe(0);
    expect(settlementStorySystem.serialize().chosenPath).toBeNull();
    expect(legacyEndingSystem.serialize().totalEndingsCompleted).toBe(0);
    expect(partyTeamSystem.getCharacter('char_2').isUnlocked).toBe(false);
    expect(petSystem.getOwnedPets()).toEqual([]);
    expect(karmaSystem.getScore()).toBe(0);
    expect(karmaSystem.getAllMajorChoiceFlags()).toEqual({});
    expect(adventureEventSystem.serialize()).toEqual({ completedOnceOnly: [], eventCooldowns: {} });
    expect(worldStateManager.serialize()).toEqual({ currentLifeFlags: {}, legacyWorldChronicle: {} });
  });

  it('prefers a strictly newer cloud V7 save and keeps local on timestamp ties', () => {
    const local = sanitizeGameState({ version: 7, lastSeenAt: 1_000, partyTeam: { characters: {} } });
    const cloud = sanitizeGameState({ version: 7, lastSeenAt: 2_000, karma: { score: 25 } });
    local.lastSeenAt = 1_000;
    cloud.lastSeenAt = 2_000;

    expect(selectMostRecentSave(local, cloud)).toBe(cloud);

    cloud.lastSeenAt = 1_000;
    expect(selectMostRecentSave(local, cloud)).toBe(local);
  });
});
