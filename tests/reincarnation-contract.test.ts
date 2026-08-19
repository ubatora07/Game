import { beforeEach, describe, expect, it } from 'vitest';
import { createInitialState, store } from '../src/core/GameState';
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

describe('P0 reincarnation transaction contract', () => {
  beforeEach(() => {
    store.replace(createInitialState());
    settlementSystem.resetAll();
    craftingEquipmentSystem.resetAll();
    marketSystem.resetAll();
    mercenarySystem.resetAll();
    titleSystem.resetAll();
    settlementDefenseSystem.resetAll();
    settlementStorySystem.resetAll();
    legacyEndingSystem.resetAll();
    karmaSystem.resetAll();
    worldStateManager.resetAll();
  });

  it('uses Rank S data as the single player-facing rebirth requirement source', () => {
    const requiredRank = ReincarnationSystem.getRequiredRank();
    expect(requiredRank.id).toBe('S');
    expect(requiredRank.index).toBe(5);
    expect(requiredRank.reqPower).toBe(2_000_000_000);
  });

  it('applies subsystem Samsara policies atomically with the run reset', () => {
    store.set((draft) => {
      draft.rankId = 'S';
      draft.rankIndex = 5;
      draft.power = 2_000_000_000;
      draft.gold = 250_000;
      draft.stats.lifetimePower = 2_000_000_000;
    });
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
    expect(karmaSystem.getScore()).toBe(0);
    expect(worldStateManager.hasFlag('village_saved')).toBe(false);
    expect(worldStateManager.hasFlag('sovereign_citadel_erected')).toBe(true);
    expect(settlementSystem.getState().isOwned).toBe(true);
    expect(titleSystem.isTitleUnlocked('title_pioneer_lord')).toBe(true);
  });
});
