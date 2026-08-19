import { describe, it, expect, beforeEach } from 'vitest';
import { marketSystem } from '../src/systems/MarketSystem';
import { mercenarySystem } from '../src/systems/MercenarySystem';
import { titleSystem } from '../src/systems/TitleSystem';
import { karmaSystem } from '../src/systems/KarmaSystem';
import { craftingEquipmentSystem } from '../src/systems/CraftingEquipmentSystem';
import { modifierResolver } from '../src/core/modifiers/ModifierResolver';
import { store, createInitialState } from '../src/core/GameState';
import { events } from '../src/core/EventBus';
import { EconomySimulator } from '../src/economy/EconomySimulator';

describe('Milestone C — Expanded Market, Mercenaries, Titles & Black Market', () => {
  beforeEach(() => {
    store.replace(createInitialState());
    modifierResolver.clearAll();
    karmaSystem.resetAll();
    craftingEquipmentSystem.resetAll();
    marketSystem.resetAll();
    mercenarySystem.resetAll();
    titleSystem.resetAll();
  });

  /* --------------------------------------------------------------------- */
  /* PHASE 103 — EXPANDED MARKET TESTS                                     */
  /* --------------------------------------------------------------------- */
  describe('Phase 103 — Expanded Market', () => {
    it('P103-01: Displays contextual legal market stock with categories and stock limits', () => {
      const materialOffers = marketSystem.getOffers('materials');
      expect(materialOffers.length).toBeGreaterThanOrEqual(2);
      expect(materialOffers.some((o) => o.id === 'offer_iron_ore_pack')).toBe(true);

      const stock = marketSystem.getAvailableStock('offer_iron_ore_pack');
      expect(stock).toBe(5);
    });

    it('P103-02: Executes legal market purchase atomically, decrements stock, and awards items', () => {
      store.set((draft) => {
        draft.gold = 5000;
      });

      const initialOre = craftingEquipmentSystem.getMaterials()['material_iron_ore'];
      const res = marketSystem.buyOffer('offer_iron_ore_pack');

      expect(res.success).toBe(true);
      expect(store.get().gold).toBe(4000);
      expect(craftingEquipmentSystem.getMaterials()['material_iron_ore']).toBe(initialOre + 20);
      expect(marketSystem.getAvailableStock('offer_iron_ore_pack')).toBe(4);
    });

    it('P103-03: Blocks purchases on insufficient funds or when stock is depleted', () => {
      store.set((draft) => {
        draft.gold = 100; // Less than 1000 required
      });

      const res = marketSystem.buyOffer('offer_iron_ore_pack');
      expect(res.success).toBe(false);
      expect(res.reason).toContain('Insufficient Gold');

      // Give funds and deplete stock
      store.set((draft) => {
        draft.gold = 100000;
      });

      while (marketSystem.getAvailableStock('offer_iron_ore_pack') > 0) {
        marketSystem.buyOffer('offer_iron_ore_pack');
      }

      const outOfStockRes = marketSystem.buyOffer('offer_iron_ore_pack');
      expect(outOfStockRes.success).toBe(false);
      expect(outOfStockRes.reason).toContain('Out of stock');
    });

    it('P103-04: Stock refresh replenishes all market offers to max values', () => {
      store.set((draft) => {
        draft.gold = 50000;
      });

      marketSystem.buyOffer('offer_iron_ore_pack');
      expect(marketSystem.getAvailableStock('offer_iron_ore_pack')).toBe(4);

      marketSystem.refreshStock();
      expect(marketSystem.getAvailableStock('offer_iron_ore_pack')).toBe(5);
    });

    it('P103-05: Serialization and deserialization preserves stock and transaction stats', () => {
      store.set((draft) => {
        draft.gold = 10000;
      });
      marketSystem.buyOffer('offer_iron_ore_pack');

      const serialized = marketSystem.serialize();
      expect(serialized.currentStock['offer_iron_ore_pack']).toBe(4);
      expect(serialized.totalPurchasesCount).toBe(1);

      marketSystem.resetAll();
      expect(marketSystem.getAvailableStock('offer_iron_ore_pack')).toBe(5);

      marketSystem.deserialize(serialized);
      expect(marketSystem.getAvailableStock('offer_iron_ore_pack')).toBe(4);
      expect(marketSystem.serialize().totalPurchasesCount).toBe(1);
    });
  });

  /* --------------------------------------------------------------------- */
  /* PHASE 104 — MERCENARIES TESTS                                         */
  /* --------------------------------------------------------------------- */
  describe('Phase 104 — Mercenaries Guild & Contracts', () => {
    it('P104-01: Hires a mercenary contract, applies modifiers in ModifierResolver', () => {
      store.set((draft) => {
        draft.gold = 5000;
      });

      expect(mercenarySystem.isMercenaryActive('merc_boran')).toBe(false);
      const res = mercenarySystem.hireMercenary('merc_boran');

      expect(res.success).toBe(true);
      expect(store.get().gold).toBe(3800); // 5000 - 1200
      expect(mercenarySystem.isMercenaryActive('merc_boran')).toBe(true);

      // Verify ModifierResolver registration
      const bossDmgMultiplier = modifierResolver.resolve('bossDamage', 1.0);
      expect(bossDmgMultiplier).toBeCloseTo(1.15, 2); // +15% Boss Damage
    });

    it('P104-02: Handles contract expiration and cleanses modifiers cleanly', () => {
      store.set((draft) => {
        draft.gold = 5000;
      });
      mercenarySystem.hireMercenary('merc_boran');
      expect(mercenarySystem.isMercenaryActive('merc_boran')).toBe(true);

      // Artificially fast-forward contract expiration timestamp
      const contract = mercenarySystem.getContract('merc_boran')!;
      contract.expiresAtTimestamp = Date.now() - 1000;

      mercenarySystem.checkExpirations();
      expect(mercenarySystem.isMercenaryActive('merc_boran')).toBe(false);

      const bossDmgMultiplier = modifierResolver.resolve('bossDamage', 1.0);
      expect(bossDmgMultiplier).toBe(1.0); // Reset to base 1.0
    });

    it('P104-03: Multiple mercenaries apply stacked modifiers without conflict', () => {
      store.set((draft) => {
        draft.gold = 10000;
      });

      mercenarySystem.hireMercenary('merc_boran'); // +15% Boss Damage
      mercenarySystem.hireMercenary('merc_sylas'); // +22% Crit Damage, +8% Speed
      mercenarySystem.hireMercenary('merc_zephyr'); // +22% Speed

      const critDmg = modifierResolver.resolve('critDamage', 1.0);
      const speed = modifierResolver.resolve('attackSpeed', 1.0);

      expect(critDmg).toBeCloseTo(1.22, 2);
      expect(speed).toBeCloseTo(1.30, 2); // 1.0 + 0.08 + 0.22
    });
  });

  /* --------------------------------------------------------------------- */
  /* PHASE 105 — TITLES & REPUTATION TESTS                                 */
  /* --------------------------------------------------------------------- */
  describe('Phase 105 — Sovereign Titles', () => {
    it('P105-01: Automatically unlocks titles based on game milestone events', () => {
      expect(titleSystem.isTitleUnlocked('title_virtuous_champion')).toBe(false);

      // Shift Karma to +70
      karmaSystem.modifyKarma(70, 'event_choice');
      expect(titleSystem.isTitleUnlocked('title_virtuous_champion')).toBe(true);

      // Tower floor 10
      events.emit('tower:floorCleared' as any, { floor: 10 });
      expect(titleSystem.isTitleUnlocked('title_tower_ascendant')).toBe(true);
    });

    it('P105-02: Equips a title and injects minor modifiers into ModifierResolver', () => {
      karmaSystem.modifyKarma(70, 'event_choice');
      expect(titleSystem.isTitleUnlocked('title_virtuous_champion')).toBe(true);

      titleSystem.equipTitle('title_virtuous_champion');
      expect(titleSystem.getEquippedTitle()?.id).toBe('title_virtuous_champion');

      // +8% Power Multiplier from title + 15% Power Multiplier from Virtuous Karma V2
      const powerMult = modifierResolver.resolve('powerMultiplier', 1.0);
      const goldMult = modifierResolver.resolve('goldMultiplier', 1.0);

      expect(powerMult).toBeCloseTo(1.23, 2);
      expect(goldMult).toBeCloseTo(1.08, 2);
    });

    it('P105-03: Switching or unequipping titles removes old modifiers completely', () => {
      karmaSystem.modifyKarma(70, 'event_choice');
      titleSystem.equipTitle('title_virtuous_champion');
      expect(modifierResolver.resolve('powerMultiplier', 1.0)).toBeCloseTo(1.23, 2);

      titleSystem.equipTitle(null);
      expect(modifierResolver.resolve('powerMultiplier', 1.0)).toBeCloseTo(1.15, 2); // 1.0 + 15% Virtuous Karma V2
    });

    it('P105-04: Samsara preserves all earned titles and equipped state', () => {
      karmaSystem.modifyKarma(70, 'event_choice');
      titleSystem.equipTitle('title_virtuous_champion');

      titleSystem.resetForSamsara();
      expect(titleSystem.isTitleUnlocked('title_virtuous_champion')).toBe(true);
      expect(titleSystem.getEquippedTitle()?.id).toBe('title_virtuous_champion');
    });
  });

  /* --------------------------------------------------------------------- */
  /* PHASE 106 — BLACK MARKET & SMUGGLER NETWORK TESTS                     */
  /* --------------------------------------------------------------------- */
  describe('Phase 106 — Black Market & Smuggler Network', () => {
    it('P106-01: Black Market is initially hidden for lawful/neutral players', () => {
      expect(marketSystem.isBlackMarketAvailable()).toBe(false);
      const offers = marketSystem.getOffers('black_market');
      expect(offers.length).toBe(0);
    });

    it('P106-02: Unlocks Black Market via Negative Karma, Vane recruitment, or Smuggler Event', () => {
      // Route 1: Negative Karma <= -20
      karmaSystem.modifyKarma(-25, 'bandit_deal');
      expect(marketSystem.isBlackMarketAvailable()).toBe(true);

      const darkOffers = marketSystem.getOffers('black_market');
      expect(darkOffers.length).toBeGreaterThanOrEqual(4);
      expect(darkOffers.some((o) => o.id === 'offer_forbidden_bloodblade')).toBe(true);
    });

    it('P106-03: Purchases forbidden goods with real trade-offs and shifts Karma negatively', () => {
      karmaSystem.modifyKarma(-25, 'bandit_deal');
      store.set((draft) => {
        draft.gold = 20000;
      });

      const initialKarma = karmaSystem.getScore(); // -25
      const res = marketSystem.buyOffer('offer_forbidden_bloodblade');

      expect(res.success).toBe(true);
      expect(store.get().gold).toBe(12000); // 20000 - 8000
      expect(karmaSystem.getScore()).toBe(initialKarma - 5); // -30

      // Verify forbidden weapon added to equipment inventory
      const inv = craftingEquipmentSystem.getInventory();
      expect(inv.some((item) => item.templateId === 'wpn_dagger_s2')).toBe(true);
    });
  });

  /* --------------------------------------------------------------------- */
  /* END-TO-END ROUTES & SAMSARA SCALING VERIFICATION                      */
  /* --------------------------------------------------------------------- */
  describe('Milestone C End-to-End Progression & Safeguards', () => {
    it('Route A (Lawful): Normal Market -> Tavern -> Hire Merc -> Virtuous Title', () => {
      karmaSystem.modifyKarma(65, 'virtuous_path');
      store.set((draft) => {
        draft.gold = 10000;
      });

      // 1. Normal market buy
      expect(marketSystem.buyOffer('offer_iron_ore_pack').success).toBe(true);

      // 2. Hire legal merc
      expect(mercenarySystem.hireMercenary('merc_boran').success).toBe(true);

      // 3. Equip Virtuous Champion title
      expect(titleSystem.equipTitle('title_virtuous_champion')).toBe(true);

      // Modifiers stacked correctly (Boss DMG 1.15, Power Mult 1.08 + 15% Virtuous Karma V2 = 1.23)
      expect(modifierResolver.resolve('bossDamage', 1.0)).toBeCloseTo(1.15, 2);
      expect(modifierResolver.resolve('powerMultiplier', 1.0)).toBeCloseTo(1.23, 2);
    });

    it('Route B (Dark): Negative Karma -> Black Market -> Forbidden Gear -> Dread Overlord Title', () => {
      karmaSystem.modifyKarma(-65, 'shadow_path');
      store.set((draft) => {
        draft.gold = 30000;
      });

      // 1. Black market buy with karma cost
      expect(marketSystem.buyOffer('offer_forbidden_bloodblade').success).toBe(true);

      // 2. Hire dark merc
      expect(marketSystem.buyOffer('offer_merc_sylas_contract').success).toBe(true);
      expect(mercenarySystem.isMercenaryActive('merc_sylas')).toBe(true);

      // 3. Equip Dread Overlord title
      expect(titleSystem.equipTitle('title_dread_overlord')).toBe(true);

      // Combined crit damage from dark merc (+22%), title (+20%), and Infamous Karma V2 (+30%) = 1.72
      expect(modifierResolver.resolve('critDamage', 1.0)).toBeCloseTo(1.72, 2);
    });

    it('Safeguard 1: Runs 1-10 Samsara simulation proves persistent equipment scales smoothly without breaking early game', () => {
      const sim = EconomySimulator.simulateSamsaraEquipmentScaling(10);
      expect(sim.earlyCascadeDetected).toBe(false);
      expect(sim.scalingHealthy).toBe(true);
      expect(sim.runs.length).toBe(10);
      expect(sim.runs[0].stagesCleared).toBeLessThan(sim.runs[9].stagesCleared);
    });
  });
});
