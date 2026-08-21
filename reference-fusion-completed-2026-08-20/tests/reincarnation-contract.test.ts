import { beforeEach, describe, expect, it } from 'vitest';
import { createInitialState, store } from '../src/core/GameState';
import { sanitizeGameState } from '../src/services/save/SaveSchema';
import { RpgSaveAggregate } from '../src/services/save/RpgSaveAggregate';
import { ReincarnationSystem } from '../src/systems/ReincarnationSystem';
import { settlementSystem } from '../src/systems/SettlementSystem';
import { craftingEquipmentSystem } from '../src/systems/CraftingEquipmentSystem';
import { marketSystem } from '../src/systems/MarketSystem';
import { mercenarySystem } from '../src/systems/MercenarySystem';
import { titleSystem } from '../src/systems/TitleSystem';
import { settlementDefenseSystem } from '../src/systems/SettlementDefenseSystem';
import { settlementStorySystem } from '../src/systems/SettlementStorySystem';
import { legacyEndingSystem } from '../src/systems/LegacyEndingSystem';
import { karmaSystem } from '../src/systems/KarmaSystem';
import { worldStateManager } from '../src/systems/WorldStateManager';
import { partyTeamSystem } from '../src/systems/PartyTeamSystem';
import { petSystem } from '../src/systems/PetSystem';
import { campaignCombatService } from '../src/systems/CampaignCombatService';

function makeRebirthEligible(): void {
  store.set((draft) => {
    draft.rankId = 'S';
    draft.rankIndex = 5;
    draft.power = 2_000_000_000;
    draft.gold = 250_000;
    draft.stats.lifetimePower = 2_000_000_000;
  });
}

describe('P0 reincarnation transaction contract', () => {
  beforeEach(() => {
    store.replace(createInitialState());
    RpgSaveAggregate.resetAll();
    campaignCombatService.resetToStage('1-1');
  });

  it('uses one structured Rank S / 2B requirement source for eligibility and reward preview', () => {
    const blocked = ReincarnationSystem.getRequirements();
    expect(blocked.requiredRank.id).toBe('S');
    expect(blocked.requiredRank.index).toBe(5);
    expect(blocked.requiredRank.reqPower).toBe(2_000_000_000);
    expect(blocked.minimumLifetimePower).toBe(2_000_000_000);
    expect(blocked.potentialSouls).toBe(0);
    expect(blocked.canRebirth).toBe(false);
    expect(blocked.reasons.map((reason) => reason.code)).toContain('required_rank');
    expect(blocked.reasons.map((reason) => reason.code)).toContain('lifetime_power');

    makeRebirthEligible();
    const eligible = ReincarnationSystem.getRequirements();
    expect(eligible.canRebirth).toBe(true);
    expect(eligible.reasons).toEqual([]);
    expect(eligible.potentialSouls).toBeGreaterThan(0);
  });

  it('applies subsystem rebirth policies once and rebuilds combat after the transaction', () => {
    makeRebirthEligible();
    campaignCombatService.resetToStage('2-1');
    settlementSystem.unlockSettlement();
    karmaSystem.setScore(60);
    worldStateManager.setFlag('village_saved', true);
    worldStateManager.setFlag('sovereign_citadel_erected', true);
    titleSystem.unlockTitle('title_pioneer_lord');

    expect(ReincarnationSystem.reincarnate()).toBe(true);
    expect(store.get().rankId).toBe('E');
    expect(store.get().power).toBe(0);
    expect(store.get().gold).toBe(0);
    expect(store.get().reincarnationCount).toBe(1);
    expect(store.get().campaign.currentStageId).toBe('1-1');
    expect(campaignCombatService.getCombatState().stageId).toBe('1-1');
    expect(campaignCombatService.getCombatState().encounterIndex).toBe(1);
    expect(karmaSystem.getScore()).toBe(0);
    expect(worldStateManager.hasFlag('village_saved')).toBe(false);
    expect(worldStateManager.hasFlag('sovereign_citadel_erected')).toBe(true);
    expect(settlementSystem.getState().isOwned).toBe(true);
    expect(titleSystem.isTitleUnlocked('title_pioneer_lord')).toBe(true);
  });

  it('preserves party, protagonist class, partner unlock and pets through rebirth', () => {
    makeRebirthEligible();
    partyTeamSystem.setCharacterClass('char_1', 'mage', false);
    partyTeamSystem.unlockSecondCharacter('Lyra', 'archer');
    partyTeamSystem.setActiveFocusSlot('char_2');
    petSystem.deserialize({
      ownedPets: {
        pet_ignis_drake: {
          id: 'pet_ignis_drake',
          name: 'Flame Wyvern',
          level: 12,
          xp: 0,
          xpToNextLevel: 500,
          evolutionStage: 2,
          affection: 70,
          unlockedAt: Date.now() - 1_000,
        },
      },
      activePetId: 'pet_ignis_drake',
    });

    expect(ReincarnationSystem.reincarnate()).toBe(true);
    expect(partyTeamSystem.getCharacter('char_1').classId).toBe('mage');
    expect(partyTeamSystem.getCharacter('char_2').isUnlocked).toBe(true);
    expect(partyTeamSystem.getCharacter('char_2').classId).toBe('archer');
    expect(partyTeamSystem.getActiveFocusSlot()).toBe('char_2');
    expect(petSystem.getActivePetId()).toBe('pet_ignis_drake');
    expect(petSystem.getPetInstance('pet_ignis_drake')?.evolutionStage).toBe(2);
  });

  it('captures and hydrates the post-rebirth state without reviving current-life progress', () => {
    makeRebirthEligible();
    partyTeamSystem.setCharacterClass('char_1', 'assassin', false);
    petSystem.acquirePet('pet_ignis_drake');
    worldStateManager.setFlag('village_saved', true);
    worldStateManager.setFlag('sovereign_citadel_erected', true);

    expect(ReincarnationSystem.reincarnate()).toBe(true);

    const postRebirth = createInitialState();
    Object.assign(postRebirth, store.get());
    RpgSaveAggregate.captureInto(postRebirth);
    const persisted = sanitizeGameState(postRebirth);

    store.replace(createInitialState());
    RpgSaveAggregate.resetAll();
    store.replace(persisted);
    RpgSaveAggregate.hydrate(persisted);

    expect(store.get().reincarnationCount).toBe(1);
    expect(store.get().rankId).toBe('E');
    expect(store.get().campaign.currentStageId).toBe('1-1');
    expect(partyTeamSystem.getCharacter('char_1').classId).toBe('assassin');
    expect(petSystem.getActivePetId()).toBe('pet_ignis_drake');
    expect(worldStateManager.hasFlag('village_saved')).toBe(false);
    expect(worldStateManager.hasFlag('sovereign_citadel_erected')).toBe(true);
  });

  it('is idempotent when rebirth is requested again without re-earning eligibility', () => {
    makeRebirthEligible();
    expect(ReincarnationSystem.reincarnate()).toBe(true);
    const soulsAfterFirst = store.get().souls;

    expect(ReincarnationSystem.reincarnate()).toBe(false);
    expect(store.get().reincarnationCount).toBe(1);
    expect(store.get().souls).toBe(soulsAfterFirst);
  });

  it('rebirths safely after corrupted optional V7 domains are sanitized', () => {
    const sanitized = sanitizeGameState({
      version: 7,
      rankId: 'S',
      rankIndex: 5,
      power: 2_000_000_000,
      stats: { lifetimePower: 2_000_000_000 },
      partyTeam: { characters: { char_1: { classId: 'not_a_class' } }, activeFocusCharId: 'char_2' },
      pets: { ownedPets: { bogus: { id: 'bogus', level: Infinity } }, activePetId: 'bogus' },
      karma: { score: Infinity, factionReputation: { bad: NaN } },
      worldState: { currentLifeFlags: { bogus: true }, legacyWorldChronicle: { bogus: true } },
    });

    // rankIndex is synchronized from rankId by GameStore.replace.
    store.replace(sanitized);
    RpgSaveAggregate.resetAll();
    RpgSaveAggregate.hydrate(sanitized);

    expect(ReincarnationSystem.reincarnate()).toBe(true);
    expect(store.get().rankId).toBe('E');
    expect(store.get().reincarnationCount).toBe(1);
    expect(petSystem.getOwnedPets()).toEqual([]);
    expect(karmaSystem.getScore()).toBe(0);
  });
});
