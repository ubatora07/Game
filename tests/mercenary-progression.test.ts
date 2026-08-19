import { beforeEach, describe, expect, it } from 'vitest';
import { createInitialState, store } from '../src/core/GameState';
import { marketSystem } from '../src/systems/MarketSystem';
import { mercenarySystem } from '../src/systems/MercenarySystem';
import { settlementSystem } from '../src/systems/SettlementSystem';

describe('Mercenary progression contract', () => {
  beforeEach(() => {
    store.replace(createInitialState());
    settlementSystem.resetAll();
    mercenarySystem.resetAll();
    marketSystem.resetAll();
    store.set((draft) => {
      draft.gold = 10_000;
    });
  });

  it('blocks direct hiring and market contracts before the Tavern is constructed without spending gold', () => {
    expect(mercenarySystem.isGuildUnlocked()).toBe(false);
    expect(mercenarySystem.hireMercenary('merc_boran').success).toBe(false);

    const goldBefore = store.get().gold;
    expect(marketSystem.buyOffer('offer_merc_boran_contract').success).toBe(false);
    expect(store.get().gold).toBe(goldBefore);
    expect(mercenarySystem.isMercenaryActive('merc_boran')).toBe(false);
  });

  it('unlocks hiring only after Mountain Haven is owned and its Tavern is constructed', () => {
    const settlement = settlementSystem.serialize();
    settlement.isOwned = true;
    settlement.settlementLevel = 2;
    settlement.buildings.tavern = { ...settlement.buildings.tavern, level: 1, isConstructed: true };
    settlementSystem.deserialize(settlement);

    expect(mercenarySystem.isGuildUnlocked()).toBe(true);
    expect(marketSystem.buyOffer('offer_merc_boran_contract').success).toBe(true);
    expect(mercenarySystem.isMercenaryActive('merc_boran')).toBe(true);
  });
});
