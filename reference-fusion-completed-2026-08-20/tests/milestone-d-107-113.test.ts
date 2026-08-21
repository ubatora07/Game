import { describe, it, expect, beforeEach } from 'vitest';
import { store, createInitialState } from '../src/core/GameState';
import { modifierResolver } from '../src/core/modifiers/ModifierResolver';
import { settlementSystem } from '../src/systems/SettlementSystem';
import { settlementDefenseSystem } from '../src/systems/SettlementDefenseSystem';
import { settlementStorySystem } from '../src/systems/SettlementStorySystem';
import { karmaSystem } from '../src/systems/KarmaSystem';
import { adventureEventSystem } from '../src/systems/AdventureEventSystem';
import { legacyEndingSystem } from '../src/systems/LegacyEndingSystem';
import { craftingEquipmentSystem } from '../src/systems/CraftingEquipmentSystem';
import { mercenarySystem } from '../src/systems/MercenarySystem';
import { titleSystem } from '../src/systems/TitleSystem';
import { marketSystem } from '../src/systems/MarketSystem';
import { petSystem } from '../src/systems/PetSystem';
import { getRaidDefinition } from '../src/content/settlementRaidsCatalog';
import { getChapterDefinition } from '../src/content/settlementStoryCatalog';
import { getLegacyEndingDef } from '../src/content/legacyEndingsCatalog';

describe('Milestone D (Phases 107–113) — Interconnected RPG Expansion Suite', () => {
  beforeEach(() => {
    store.replace(createInitialState());
    modifierResolver.clearAll();
    settlementSystem.resetAll();
    settlementDefenseSystem.resetAll();
    settlementStorySystem.resetAll();
    karmaSystem.resetAll();
    craftingEquipmentSystem.resetAll();
    mercenarySystem.resetAll();
    titleSystem.resetAll();
    marketSystem.resetAll();
    petSystem.resetAll();
    legacyEndingSystem.resetAll();
  });

  /* --------------------------------------------------------------------- */
  /* PHASE 107: SETTLEMENT DEFENSE & RAIDS                                 */
  /* --------------------------------------------------------------------- */
  describe('Phase 107 — Settlement Defense & Raids', () => {
    it('P107-01: Correctly calculates total settlement defense from walls, gear, and modifiers', () => {
      // Base defense with settlement level 0 = 10
      expect(settlementDefenseSystem.getTotalDefense()).toBe(10);

      // Unlock settlement Lv.1 (walls bonus = +25)
      settlementSystem.unlockSettlement();
      expect(settlementDefenseSystem.getTotalDefense()).toBe(35);

      // Register Torin Mercenary or gear defense modifier (+60)
      modifierResolver.registerModifier({
        id: 'test_defense_buff',
        target: 'settlementDefense',
        type: 'flat',
        value: 60,
        source: 'Test Vanguard',
        sourceType: 'mercenary',
      });
      expect(settlementDefenseSystem.getTotalDefense()).toBe(95);
    });

    it('P107-02: Resolves raid victory and grants gold, ores, and karma', () => {
      settlementSystem.unlockSettlement();
      // Total defense = 35, enough to beat raid_goblin_scouts (req 30)
      const initialGold = store.get().gold;
      const initialKarma = karmaSystem.getScore();

      const raidResult = settlementDefenseSystem.resolveRaid('raid_goblin_scouts');
      expect(raidResult.won).toBe(true);
      expect(store.get().gold).toBe(initialGold + 1200);
      expect(karmaSystem.getScore()).toBe(initialKarma + 2);
      expect(settlementDefenseSystem.serialize().totalRaidsDefeated).toBe(1);
    });

    it('P107-03: Resolves raid defeat with repair costs and no permanent state corruption', () => {
      // Base defense is 10, goblin raid requires 30 -> loss
      settlementSystem.addMaterials(50, 50, 0);
      const initialWood = settlementSystem.getMaterials().wood;

      const raidResult = settlementDefenseSystem.resolveRaid('raid_goblin_scouts');
      expect(raidResult.won).toBe(false);
      expect(settlementSystem.getMaterials().wood).toBeLessThan(initialWood);
      expect(settlementDefenseSystem.serialize().totalRaidsFailed).toBe(1);
    });
  });

  /* --------------------------------------------------------------------- */
  /* PHASE 108: SETTLEMENT STORY PATH                                      */
  /* --------------------------------------------------------------------- */
  describe('Phase 108 — Settlement Story Path', () => {
    it('P108-01: Tracks chapter objectives and unlocks chapter completion claim', () => {
      const chap1 = getChapterDefinition('chap_1_haven_reclaimed')!;
      expect(settlementStorySystem.canClaimChapter(chap1.id)).toBe(false);

      // Fulfill Chapter 1 objectives: unlock settlement & construct 2 buildings
      settlementSystem.unlockSettlement();
      expect(settlementStorySystem.canClaimChapter(chap1.id)).toBe(true);

      // Claim chapter
      const claimed = settlementStorySystem.claimChapter(chap1.id);
      expect(claimed).toBe(true);
      expect(settlementStorySystem.isChapterCompleted(chap1.id)).toBe(true);
      expect(titleSystem.isTitleUnlocked('title_pioneer_lord')).toBe(true);
      expect(settlementStorySystem.getCurrentChapter().id).toBe('chap_2_iron_vanguard');
    });
  });

  /* --------------------------------------------------------------------- */
  /* PHASE 109: NARRATIVE EVENT CHAINS                                     */
  /* --------------------------------------------------------------------- */
  describe('Phase 109 — Narrative Event Chains', () => {
    it('P109-01: Multi-stage Lost Heir chain progresses through historical flags and choices', () => {
      const step1 = adventureEventSystem.getEventById('evt_chain_lost_heir_1')!;
      expect(step1).toBeDefined();

      // Execute Step 1 virtuous choice
      const choice1 = step1.choices.find((c) => c.id === 'help_knight')!;
      adventureEventSystem.executeChoice(step1, choice1);

      expect(karmaSystem.getMajorChoiceFlag('lost_heir_helped')).toBe(true);
      expect(karmaSystem.getMajorChoiceFlag('followup_evt_chain_lost_heir_2')).toBe(true);

      // Step 2 is now eligible
      const context = {
        worldId: 1,
        activeClasses: ['swordsman' as any],
        currentKarma: karmaSystem.getScore(),
        rank: 'E',
        gold: store.get().gold,
      };

      const step2 = adventureEventSystem.getEventById('evt_chain_lost_heir_2')!;
      expect(adventureEventSystem.isEventEligible(step2, context)).toBe(true);

      // Execute Step 2 choice
      const choice2 = step2.choices.find((c) => c.id === 'reveal_to_court')!;
      adventureEventSystem.executeChoice(step2, choice2);
      expect(karmaSystem.getMajorChoiceFlag('followup_evt_chain_lost_heir_3')).toBe(true);
    });
  });

  /* --------------------------------------------------------------------- */
  /* PHASE 110: KARMA CONSEQUENCES V2                                      */
  /* --------------------------------------------------------------------- */
  describe('Phase 110 — Karma Consequences V2', () => {
    it('P110-01: Virtuous Karma grants power multiplier, merchant discount, and settlement defense', () => {
      karmaSystem.setScore(60); // Virtuous band
      expect(karmaSystem.getKarmaBand()).toBe('virtuous');

      const powerResolved = modifierResolver.resolve('powerMultiplier', 1.0);
      const discountResolved = modifierResolver.resolve('merchantDiscount', 0);
      const defenseResolved = modifierResolver.resolve('settlementDefense', 0);

      expect(powerResolved).toBeGreaterThan(1.0);
      expect(discountResolved).toBe(0.10);
      expect(defenseResolved).toBe(40);
    });

    it('P110-02: Infamous Karma grants high crit & boss damage with settlement defense penalty', () => {
      karmaSystem.setScore(-60); // Infamous band
      expect(karmaSystem.getKarmaBand()).toBe('infamous');

      const critDmg = modifierResolver.resolve('critDamage', 1.5);
      const bossDmg = modifierResolver.resolve('bossDamage', 1.0);
      const defenseResolved = modifierResolver.resolve('settlementDefense', 100);

      expect(critDmg).toBeGreaterThanOrEqual(1.8);
      expect(bossDmg).toBeGreaterThan(1.0);
      expect(defenseResolved).toBe(80); // 100 base - 20 defense penalty
    });

    it('P110-03: Neutral Karma grants attack speed and bonus loot chance', () => {
      karmaSystem.setScore(0); // Neutral band
      expect(karmaSystem.getKarmaBand()).toBe('neutral');

      const speed = modifierResolver.resolve('attackSpeed', 1.0);
      const loot = modifierResolver.resolve('lootChance', 1.0);

      expect(speed).toBeGreaterThan(1.0);
      expect(loot).toBeGreaterThan(1.0);
    });
  });

  /* --------------------------------------------------------------------- */
  /* PHASE 111: LEGACY ENDING FRAMEWORK                                    */
  /* --------------------------------------------------------------------- */
  describe('Phase 111 — Legacy Ending Framework', () => {
    it('P111-01: Evaluates ending eligibility and persists permanent Samsara modifiers', () => {
      // Setup Virtuous + Citadel Level 2
      karmaSystem.setScore(70);
      settlementSystem.unlockSettlement();
      settlementSystem.setSettlementLevel(2);

      const eligibleEndings = legacyEndingSystem.evaluateEndingEligibility();
      expect(eligibleEndings).toContain('ending_savior_mountain_realm');

      // Unlock Savior Ending
      legacyEndingSystem.unlockEnding('ending_savior_mountain_realm');
      expect(legacyEndingSystem.isEndingUnlocked('ending_savior_mountain_realm')).toBe(true);

      const powerBonus = modifierResolver.resolve('powerMultiplier', 1.0);
      expect(powerBonus).toBeGreaterThanOrEqual(1.25);

      // Verify permanent Samsara reset preservation
      legacyEndingSystem.resetForSamsara();
      expect(legacyEndingSystem.isEndingUnlocked('ending_savior_mountain_realm')).toBe(true);
    });
  });

  /* --------------------------------------------------------------------- */
  /* PHASE 113: CROSS-SYSTEM INTEGRATION PASS                              */
  /* --------------------------------------------------------------------- */
  describe('Phase 113 — Cross-System Content & Route Verification', () => {
    it('P113-01: Class & Pet specific choices check context and grant appropriate rewards', () => {
      petSystem.acquirePet('pet_sylph_sprite');
      petSystem.setActivePet('pet_sylph_sprite');

      const contextWithSylph = {
        worldId: 1,
        activeClasses: ['archer' as any],
        currentKarma: 0,
        rank: 'E',
        gold: 1000,
      };

      const beastEvent = adventureEventSystem.getEventById('evt_chain_runic_beast_1')!;
      expect(adventureEventSystem.isEventEligible(beastEvent, contextWithSylph)).toBe(true);
    });

    it('P113-02: Complete End-to-End Dark Route simulation (Negative Karma -> Black Market -> Dread Ending)', () => {
      // 1. Shift Karma to -60
      karmaSystem.setScore(-60);

      // 2. Discover Black Market
      expect(marketSystem.isBlackMarketAvailable()).toBe(true);

      // 3. Purchase Forbidden Bloodblade
      store.set((draft) => {
        draft.gold = 50000;
      });
      const buyResult = marketSystem.buyOffer('offer_forbidden_bloodblade');
      expect(buyResult.success).toBe(true);

      // 4. Evaluate and unlock Dread Sovereign Ending
      const eligible = legacyEndingSystem.evaluateEndingEligibility();
      expect(eligible).toContain('ending_dread_sovereign_void');

      legacyEndingSystem.unlockEnding('ending_dread_sovereign_void');
      expect(legacyEndingSystem.isEndingUnlocked('ending_dread_sovereign_void')).toBe(true);
    });
  });
});
