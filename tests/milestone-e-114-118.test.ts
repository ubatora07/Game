import { describe, it, expect, beforeEach } from 'vitest';
import { store, createInitialState } from '../src/core/GameState';
import { modifierResolver } from '../src/core/modifiers/ModifierResolver';
import { legacyEndingSystem } from '../src/systems/LegacyEndingSystem';
import { settlementStorySystem } from '../src/systems/SettlementStorySystem';
import { karmaSystem } from '../src/systems/KarmaSystem';
import { adventureEventSystem } from '../src/systems/AdventureEventSystem';
import { titleSystem } from '../src/systems/TitleSystem';
import { SaveMigrations } from '../src/services/save/SaveMigrations';
import { EconomySimulator } from '../src/economy/EconomySimulator';
import { ContentValidator } from '../src/tools/contentValidator';
import { getAllLegacyEndingDefs } from '../src/content/legacyEndingsCatalog';

describe('Milestone E (Phases 114–118) — UX V3, Save V3, Analytics V3, Simulator V3 & Tooling Suite', () => {
  beforeEach(() => {
    store.replace(createInitialState());
    modifierResolver.clearAll();
    legacyEndingSystem.resetAll();
    settlementStorySystem.resetAll();
    karmaSystem.resetAll();
    titleSystem.resetAll();
  });

  /* --------------------------------------------------------------------- */
  /* CORRECTION 1: ACTIVE LEGACY BOON ARCHITECTURE                         */
  /* --------------------------------------------------------------------- */
  describe('Correction 1: Active Legacy Boon Architecture', () => {
    it('C1-01: Only the single equipped active boon injects its modifier into ModifierResolver', () => {
      // Unlock all 4 endings
      legacyEndingSystem.unlockEnding('ending_savior_mountain_realm');
      legacyEndingSystem.unlockEnding('ending_dread_sovereign_void');
      legacyEndingSystem.unlockEnding('ending_eternal_wanderer');
      legacyEndingSystem.unlockEnding('ending_celestial_ascendant');

      expect(legacyEndingSystem.getUnlockedEndings().length).toBe(4);

      // Default active boon is the first unlocked (Savior: +15% Power Multiplier)
      legacyEndingSystem.setActiveBoon('ending_savior_mountain_realm');
      expect(legacyEndingSystem.getActiveBoon()?.id).toBe('ending_savior_mountain_realm');

      const powerResolved = modifierResolver.resolve('powerMultiplier', 1.0);
      const critResolved = modifierResolver.resolve('critDamage', 1.0);

      expect(powerResolved).toBeCloseTo(1.15, 2);
      // Dread Sovereign (+25% Crit) is NOT active because it is not equipped
      expect(critResolved).toBe(1.0);

      // Switch active boon to Dread Sovereign
      legacyEndingSystem.setActiveBoon('ending_dread_sovereign_void');
      expect(legacyEndingSystem.getActiveBoon()?.id).toBe('ending_dread_sovereign_void');

      const powerAfterSwitch = modifierResolver.resolve('powerMultiplier', 1.0);
      const critAfterSwitch = modifierResolver.resolve('critDamage', 1.0);

      expect(powerAfterSwitch).toBe(1.0); // Savior modifier removed
      expect(critAfterSwitch).toBeCloseTo(1.25, 2); // Dread modifier active
    });

    it('C1-02: Unequipping active boon clears legacy modifiers while preserving unlocked chronicles', () => {
      legacyEndingSystem.unlockEnding('ending_celestial_ascendant');
      expect(legacyEndingSystem.isEndingUnlocked('ending_celestial_ascendant')).toBe(true);

      legacyEndingSystem.setActiveBoon(null);
      expect(legacyEndingSystem.getActiveBoon()).toBeNull();
      expect(modifierResolver.resolve('bossDamage', 1.0)).toBe(1.0);

      // Unlocked chronicle still intact
      expect(legacyEndingSystem.getUnlockedEndings().length).toBe(1);
    });
  });

  /* --------------------------------------------------------------------- */
  /* CORRECTION 2: FIVE POLISHED NARRATIVE CHAINS                          */
  /* --------------------------------------------------------------------- */
  describe('Correction 2: Five Narrative Event Chains', () => {
    it('C2-01: Chain 4 (Refugees of Mountain Haven) executes branching shelter vs exploit choices', () => {
      const refugee1 = adventureEventSystem.getEventById('evt_chain_refugees_1')!;
      expect(refugee1).toBeDefined();

      const choiceShelter = refugee1.choices.find((c) => c.id === 'shelter_refugees')!;
      adventureEventSystem.executeChoice(refugee1, choiceShelter);

      expect(karmaSystem.getMajorChoiceFlag('refugees_sheltered')).toBe(true);
      expect(karmaSystem.getMajorChoiceFlag('followup_evt_chain_refugees_2')).toBe(true);

      // Step 2 is eligible
      const refugee2 = adventureEventSystem.getEventById('evt_chain_refugees_2')!;
      const context = { worldId: 1, activeClasses: ['swordsman' as any], currentKarma: karmaSystem.getScore(), rank: 'E', gold: 1000 };
      expect(adventureEventSystem.isEventEligible(refugee2, context)).toBe(true);

      const choiceArtisans = refugee2.choices.find((c) => c.id === 'enlist_craftsmen')!;
      adventureEventSystem.executeChoice(refugee2, choiceArtisans);
      expect(karmaSystem.getMajorChoiceFlag('refugees_saga_completed')).toBe(true);
    });

    it('C2-02: Chain 5 (The Smuggler’s Debt) executes lawful vs shadow syndicate branches', () => {
      const debt1 = adventureEventSystem.getEventById('evt_chain_smugglers_debt_1')!;
      expect(debt1).toBeDefined();

      const choiceLawful = debt1.choices.find((c) => c.id === 'expose_smuggler_ring')!;
      adventureEventSystem.executeChoice(debt1, choiceLawful);

      expect(karmaSystem.getMajorChoiceFlag('smuggler_debt_lawful')).toBe(true);
      expect(karmaSystem.getMajorChoiceFlag('followup_evt_chain_smugglers_debt_2')).toBe(true);

      const debt2 = adventureEventSystem.getEventById('evt_chain_smugglers_debt_2')!;
      const context = { worldId: 1, activeClasses: ['assassin' as any], currentKarma: karmaSystem.getScore(), rank: 'E', gold: 1000 };
      expect(adventureEventSystem.isEventEligible(debt2, context)).toBe(true);

      const choiceSeize = debt2.choices.find((c) => c.id === 'seize_warehouse')!;
      adventureEventSystem.executeChoice(debt2, choiceSeize);
      expect(karmaSystem.getMajorChoiceFlag('smuggler_saga_completed')).toBe(true);
    });
  });

  /* --------------------------------------------------------------------- */
  /* CORRECTION 3: LORD VS ADVENTURER DESTINY PATH DIVERGENCE              */
  /* --------------------------------------------------------------------- */
  describe('Correction 3: Lord vs Adventurer Path Choice', () => {
    it('C3-01: Swearing Oath of Lordship unlocks High Lord title and town production modifiers', () => {
      settlementStorySystem.choosePath('lord');
      expect(settlementStorySystem.getChosenPath()).toBe('lord');
      expect(titleSystem.isTitleUnlocked('title_high_lord')).toBe(true);

      const goldMult = modifierResolver.resolve('goldMultiplier', 1.0);
      const defFlat = modifierResolver.resolve('settlementDefense', 0);

      expect(goldMult).toBeCloseTo(1.10, 2);
      expect(defFlat).toBe(30);
    });

    it('C3-02: Choosing Independent Adventurer path unlocks Unbound Vanguard title and combat modifiers', () => {
      settlementStorySystem.choosePath('adventurer');
      expect(settlementStorySystem.getChosenPath()).toBe('adventurer');
      expect(titleSystem.isTitleUnlocked('title_unbound_vanguard')).toBe(true);

      const speedMult = modifierResolver.resolve('attackSpeed', 1.0);
      const lootMult = modifierResolver.resolve('lootChance', 1.0);

      expect(speedMult).toBeCloseTo(1.10, 2);
      expect(lootMult).toBeCloseTo(1.10, 2);
    });
  });

  /* --------------------------------------------------------------------- */
  /* PHASE 115: SAVE SCHEMA V3 SANITIZATION & MIGRATION                    */
  /* --------------------------------------------------------------------- */
  describe('Phase 115: Save Schema V3 Migration', () => {
    it('P115-01: Migrates legacy saves seamlessly while sanitizing newly added RPG subdomains', () => {
      const legacySave = {
        version: 5,
        power: 5000,
        gold: 12000,
        crystals: 250,
        rankId: 'C',
        rankIndex: 2,
        settlement: { isOwned: true, settlementLevel: 2, wood: 200, stone: 150, iron: 50 },
        legacyEndings: { unlockedEndingIds: ['ending_savior_mountain_realm'], activeEndingId: 'ending_savior_mountain_realm' },
      };

      const migrated = SaveMigrations.migrate(legacySave);
      expect(migrated.version).toBe(6);
      expect(migrated.power).toBe(5000);
      expect(migrated.settlement?.settlementLevel).toBe(2);
      expect(migrated.legacyEndings?.activeEndingId).toBe('ending_savior_mountain_realm');
    });
  });

  /* --------------------------------------------------------------------- */
  /* PHASE 117: BALANCE SIMULATOR V3 MULTI-ARCHETYPE TEST                  */
  /* --------------------------------------------------------------------- */
  describe('Phase 117: Balance Simulator V3 Whole-Game Suite', () => {
    it('P117-01: Simulates all 8 representative player profiles with zero dead progression', () => {
      const profiles = EconomySimulator.simulateWholeGameProfiles();
      const profileKeys = Object.keys(profiles);

      expect(profileKeys.length).toBe(8);
      for (const key of profileKeys) {
        const p = profiles[key];
        expect(p.balancePass).toBe(true);
        expect(p.finalPower).toBeGreaterThan(5000);
        expect(p.stagesCleared).toBeGreaterThan(10);
      }
    });
  });

  /* --------------------------------------------------------------------- */
  /* PHASE 118: CONTENT VALIDATION TOOLING                                 */
  /* --------------------------------------------------------------------- */
  describe('Phase 118: Content Authoring Tooling & Integrity', () => {
    it('P118-01: ContentValidator passes with 0 errors across all game content entities', () => {
      const report = ContentValidator.validateAll();
      expect(report.totalEntitiesChecked).toBeGreaterThan(50);
      expect(report.errorCount).toBe(0);
      expect(report.isValid).toBe(true);
    });
  });
});
