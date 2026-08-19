import { describe, it, expect, beforeEach } from 'vitest';
import { marketSystem } from '../src/systems/MarketSystem';
import { store, createInitialState } from '../src/core/GameState';
import { modifierResolver } from '../src/core/modifiers/ModifierResolver';

describe('Phase 90 — Small Market MVP Suite', () => {
  beforeEach(() => {
    store.replace(createInitialState());
    modifierResolver.clearAll();
    marketSystem.resetAll();
  });

  it('P90-01: Market generates active inventory slots across categories with world scaling', () => {
    marketSystem.refreshMarket(true, Date.now(), 1);
    const slotsWorld1 = marketSystem.getSlots();
    expect(slotsWorld1.length).toBeGreaterThanOrEqual(4);
    expect(slotsWorld1.every((s) => s.remainingStock > 0)).toBe(true);

    const firstItemWorld1 = slotsWorld1[0];

    marketSystem.refreshMarket(true, Date.now(), 3);
    const slotsWorld3 = marketSystem.getSlots();
    const sameItemWorld3 = slotsWorld3.find((s) => s.item.id === firstItemWorld1.item.id);
    if (sameItemWorld3) {
      // In World 3, price should be higher than World 1 base cost
      expect(sameItemWorld3.price).toBeGreaterThan(firstItemWorld1.item.baseCost);
    }
  });

  it('P90-02: Purchase transaction deducts currency and applies instant resource effect', () => {
    store.set((draft) => {
      draft.gold = 50000;
      draft.crystals = 100;
      draft.souls = 10;
      draft.power = 1000;
    });

    const slots = marketSystem.getSlots();
    const goldSlot = slots.find((s) => s.currency === 'gold' && s.item.effect.powerGrant);
    expect(goldSlot).toBeDefined();

    const initialGold = store.get().gold;
    const initialPower = store.get().power;
    const initialStock = goldSlot!.remainingStock;

    const result = marketSystem.purchaseItem(goldSlot!.slotId);
    expect(result.success).toBe(true);
    expect(store.get().gold).toBe(initialGold - goldSlot!.price);
    expect(store.get().power).toBe(initialPower + (goldSlot!.item.effect.powerGrant ?? 0));
    expect(goldSlot!.remainingStock).toBe(initialStock - 1);
  });

  it('P90-03: Anti-exploit guards block purchases on insufficient funds or sold out stock', () => {
    store.set((draft) => {
      draft.gold = 0;
      draft.crystals = 0;
      draft.souls = 0;
    });

    const slots = marketSystem.getSlots();
    const slot = slots[0];

    // Cannot buy with 0 funds
    const result1 = marketSystem.purchaseItem(slot.slotId);
    expect(result1.success).toBe(false);
    expect(result1.reason).toBe('Insufficient funds');

    // Give funds and buy until stock depleted
    store.set((draft) => {
      draft.gold = 1000000;
      draft.crystals = 10000;
      draft.souls = 1000;
    });

    while (slot.remainingStock > 0) {
      marketSystem.purchaseItem(slot.slotId);
    }

    expect(slot.isSoldOut).toBe(true);
    const resultSoldOut = marketSystem.purchaseItem(slot.slotId);
    expect(resultSoldOut.success).toBe(false);
    expect(resultSoldOut.reason).toBe('Out of stock');
  });

  it('P90-04: Consumable elixir registers temporary stat modifier into ModifierResolver', () => {
    store.set((draft) => {
      draft.gold = 50000;
    });

    // Ensure power elixir is in slots
    const slots = marketSystem.getSlots();
    const elixirSlot = slots.find((s) => s.item.id === 'mkt_potion_power_elixir');
    if (elixirSlot) {
      marketSystem.purchaseItem(elixirSlot.slotId);
      const attackPower = modifierResolver.resolve('attack', 100);
      expect(attackPower).toBeGreaterThan(100);
    }
  });

  it('P90-05: Serialization and countdown timers maintain integrity', () => {
    const serialized = marketSystem.serialize();
    expect(serialized.slots.length).toBeGreaterThanOrEqual(4);

    const secondsLeft = marketSystem.getSecondsUntilNextRefresh();
    expect(secondsLeft).toBeGreaterThan(0);
    expect(secondsLeft).toBeLessThanOrEqual(3600);

    marketSystem.deserialize(serialized);
    expect(marketSystem.getSlots().length).toBe(serialized.slots.length);
  });
});
