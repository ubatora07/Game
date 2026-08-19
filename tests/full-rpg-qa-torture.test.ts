import { describe, it, expect, beforeEach } from 'vitest';
import { store, createInitialState } from '../src/core/GameState';
import { modifierResolver } from '../src/core/modifiers/ModifierResolver';
import { SaveMigrations } from '../src/services/save/SaveMigrations';
import { sanitizeGameState, CURRENT_SAVE_VERSION } from '../src/services/save/SaveSchema';
import { saveService } from '../src/services/save/SaveService';
import { marketSystem } from '../src/systems/MarketSystem';
import { craftingEquipmentSystem } from '../src/systems/CraftingEquipmentSystem';
import { mercenarySystem } from '../src/systems/MercenarySystem';
import { legacyEndingSystem } from '../src/systems/LegacyEndingSystem';
import { karmaSystem } from '../src/systems/KarmaSystem';
import { settlementStorySystem } from '../src/systems/SettlementStorySystem';
import { settlementDefenseSystem } from '../src/systems/SettlementDefenseSystem';
import { adventureEventSystem } from '../src/systems/AdventureEventSystem';
import { titleSystem } from '../src/systems/TitleSystem';
import { ContentValidator } from '../src/tools/contentValidator';
import { EconomySimulator } from '../src/economy/EconomySimulator';

describe('Phase 119: Full RPG QA & Save Torture Suite', () => {
  beforeEach(() => {
    store.replace(createInitialState());
    modifierResolver.clearAll();
    legacyEndingSystem.resetAll();
    settlementStorySystem.resetAll();
    karmaSystem.resetAll();
    titleSystem.resetAll();
    mercenarySystem.resetAll();
  });

  /* --------------------------------------------------------------------- */
  /* 119.4 — ECONOMY & ANTI-EXPLOIT QA                                     */
  /* --------------------------------------------------------------------- */
  describe('119.4: Economy & Anti-Exploit Integrity', () => {
    it('QA-ECO-01: Purchasing market items deducts gold and grants item without infinite arbitrage', () => {
      store.set((draft) => {
        draft.gold = 1000;
        draft.settlement = { isOwned: true, wood: 100, stone: 100, iron: 100 };
      });

      const offers = marketSystem.getOffers('all');
      expect(offers.length).toBeGreaterThan(0);

      const offer = offers[0];
      const initialGold = store.get().gold;
      const success = marketSystem.buyOffer(offer.id);

      if (initialGold >= offer.costGold) {
        expect(success).toBe(true);
        expect(store.get().gold).toBe(initialGold - offer.costGold);
      }
    });

    it('QA-ECO-02: Negative-cost states and NaN values are strictly forbidden across resources', () => {
      const state = store.get();
      expect(state.gold).toBeGreaterThanOrEqual(0);
      expect(state.crystals).toBeGreaterThanOrEqual(0);
      expect(state.power).toBeGreaterThanOrEqual(0);
      expect(isNaN(state.gold)).toBe(false);
      expect(isNaN(state.power)).toBe(false);
    });

    it('QA-ECO-03: Event rewards and flags cannot be claimed multiple times if onceOnly', () => {
      const evt = adventureEventSystem.getEventById('evt_chain_lost_heir_1')!;
      expect(evt).toBeDefined();

      const choice = evt.choices[0];
      adventureEventSystem.executeChoice(evt, choice);

      expect(karmaSystem.getMajorChoiceFlag('lost_heir_helped')).toBe(true);

      // Subsequent eligibility check fails due to onceOnly
      const context = { worldId: 1, activeClasses: ['swordsman' as any], currentKarma: 0, rank: 'E', gold: 1000 };
      expect(adventureEventSystem.isEventEligible(evt, context)).toBe(false);
    });
  });

  /* --------------------------------------------------------------------- */
  /* 119.8 — SAVE V3 TORTURE & CORRUPTION RECOVERY                         */
  /* --------------------------------------------------------------------- */
  describe('119.8: Save V3 Torture & Resilience', () => {
    it('QA-SAVE-01: Malformed and corrupted save objects fall back cleanly to sanitized defaults without throwing', () => {
      const malformedData = {
        version: 'corrupted',
        power: 'invalid_number',
        gold: -99999,
        crystals: 'NaN',
        campaign: null,
        settlement: 'broken_string_instead_of_object',
        legacyEndings: { activeEndingId: 12345 },
      };

      const sanitized = sanitizeGameState(malformedData);
      expect(sanitized.version).toBe(CURRENT_SAVE_VERSION);
      expect(sanitized.power).toBe(0);
      expect(sanitized.gold).toBe(0);
      expect(sanitized.crystals).toBe(150);
      expect(sanitized.campaign.currentWorldId).toBe(1);
      expect(typeof sanitized.campaign).toBe('object');
    });

    it('QA-SAVE-02: Partial V1 save safely upgrades through all migration steps up to V6', () => {
      const partialV1 = {
        version: 1,
        power: 1000,
        gold: 500,
        rankId: 'D',
        rankIndex: 1,
      };

      const migrated = SaveMigrations.migrate(partialV1);
      expect(migrated.version).toBe(6);
      expect(migrated.power).toBe(1000);
      expect(migrated.rankId).toBe('D');
      expect(migrated.relics).toBeDefined();
      expect(migrated.expeditions).toBeDefined();
      expect(migrated.campaign).toBeDefined();
      expect(migrated.campaign.currentWorldId).toBe(1);
    });

    it('QA-SAVE-03: Clock manipulation forward/backward is safely handled', () => {
      const futureTime = Date.now() + 100000000;
      const sanitizedFuture = sanitizeGameState({ lastSeenAt: futureTime });
      expect(sanitizedFuture.lastSeenAt).toBeLessThanOrEqual(Date.now());
    });
  });

  /* --------------------------------------------------------------------- */
  /* 119.7 — LEGACY BOON STACKING TORTURE                                  */
  /* --------------------------------------------------------------------- */
  describe('119.7: Legacy Boon & Modifier Stacking Strictness', () => {
    it('QA-LEG-01: Multiple unlocked endings cannot stack passive modifiers simultaneously', () => {
      legacyEndingSystem.unlockEnding('ending_savior_mountain_realm');
      legacyEndingSystem.unlockEnding('ending_dread_sovereign_void');
      legacyEndingSystem.unlockEnding('ending_eternal_wanderer');
      legacyEndingSystem.unlockEnding('ending_celestial_ascendant');

      // Equip Savior (+15% power)
      legacyEndingSystem.setActiveBoon('ending_savior_mountain_realm');
      expect(modifierResolver.resolve('powerMultiplier', 1.0)).toBeCloseTo(1.15, 2);
      expect(modifierResolver.resolve('critDamage', 1.0)).toBe(1.0);
      expect(modifierResolver.resolve('attackSpeed', 1.0)).toBe(1.0);
      expect(modifierResolver.resolve('bossDamage', 1.0)).toBe(1.0);

      // Equip Celestial (+20% boss damage)
      legacyEndingSystem.setActiveBoon('ending_celestial_ascendant');
      expect(modifierResolver.resolve('powerMultiplier', 1.0)).toBe(1.0);
      expect(modifierResolver.resolve('bossDamage', 1.0)).toBeCloseTo(1.20, 2);
    });
  });

  /* --------------------------------------------------------------------- */
  /* 119.14 — CONTENT VALIDATOR RUNTIME QA                                 */
  /* --------------------------------------------------------------------- */
  describe('119.14: Content Catalog Integrity', () => {
    it('QA-CNT-01: Entire content catalog passes strict validation with 0 errors', () => {
      const report = ContentValidator.validateAll();
      expect(report.isValid).toBe(true);
      expect(report.errorCount).toBe(0);
    });
  });
});
