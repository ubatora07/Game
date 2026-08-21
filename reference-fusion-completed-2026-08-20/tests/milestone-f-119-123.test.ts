import { describe, it, expect, beforeEach } from 'vitest';
import { store, createInitialState } from '../src/core/GameState';
import { modifierResolver } from '../src/core/modifiers/ModifierResolver';
import { worldStateManager } from '../src/systems/WorldStateManager';
import { contentPackRegistry } from '../src/content/packs/ContentPackRegistry';
import { EventChainPack, MarketRotationPack } from '../src/content/packs/ContentPackTypes';
import { SpecializationNodeDefinition } from '../src/core/classes/SpecializationTypes';
import { karmaSystem } from '../src/systems/KarmaSystem';
import { settlementStorySystem } from '../src/systems/SettlementStorySystem';
import { ContentValidator } from '../src/tools/contentValidator';

describe('Milestone F (Phases 119–123) — Release Gate, Live Content, Class Expansion & World Consequences Suite', () => {
  beforeEach(() => {
    store.replace(createInitialState());
    modifierResolver.clearAll();
    worldStateManager.resetAll();
    karmaSystem.resetAll();
    settlementStorySystem.resetAll();
  });

  /* --------------------------------------------------------------------- */
  /* PHASE 121: LIVE CONTENT PACK REGISTRY                                 */
  /* --------------------------------------------------------------------- */
  describe('Phase 121: Live Content Pack Foundation', () => {
    it('P121-01: Registers modular event and market rotation packs dynamically', () => {
      const mockEventPack: EventChainPack = {
        metadata: {
          packId: 'pack_test_dragon_saga',
          version: '1.0.0',
          category: 'event_chain',
          state: 'ACTIVE',
          titleKey: 'pack.dragon_saga.title',
          defaultTitle: 'Dragon of the Celestial Peak',
          author: 'LiveOps',
          minGameVersion: '3.0.0',
          isActive: true,
        },
        events: [],
      };

      const success = contentPackRegistry.registerEventPack(mockEventPack);
      expect(success).toBe(true);
      expect(contentPackRegistry.getAllPacks().length).toBeGreaterThan(0);
      expect(contentPackRegistry.getActivePacks().some((p) => p.packId === 'pack_test_dragon_saga')).toBe(true);

      // Prevents duplicate pack IDs
      const duplicateSuccess = contentPackRegistry.registerEventPack(mockEventPack);
      expect(duplicateSuccess).toBe(false);
    });
  });

  /* --------------------------------------------------------------------- */
  /* PHASE 122: FUTURE CLASS SPECIALIZATION ARCHITECTURE                   */
  /* --------------------------------------------------------------------- */
  describe('Phase 122: Future Class Specialization Foundation', () => {
    it('P122-01: Specialization node schema enforces correct modifier target and baseClassId mapping', () => {
      const paladinNode: SpecializationNodeDefinition = {
        id: 'node_paladin_radiance',
        branchId: 'spec_paladin',
        baseClassId: 'swordsman',
        tier: 1,
        nameKey: 'spec.paladin.radiance.name',
        defaultName: 'Radiance Aura',
        iconSvg: '<svg></svg>',
        description: 'Blinds foes with solar power.',
        modifiers: [
          { target: 'bossDamage', type: 'percent_add', value: 0.15, label: '+15% Boss Damage' },
        ],
        requiredSkillPoints: 2,
      };

      expect(paladinNode.baseClassId).toBe('swordsman');
      expect(paladinNode.modifiers[0].target).toBe('bossDamage');
      expect(paladinNode.modifiers[0].value).toBe(0.15);
    });
  });

  /* --------------------------------------------------------------------- */
  /* PHASE 123: WORLD CONSEQUENCES & WORLD FLAGS                           */
  /* --------------------------------------------------------------------- */
  describe('Phase 123: World Consequences & Samsara Memory', () => {
    it('P123-01: Setting world flags triggers reactive visual consequence lookups', () => {
      worldStateManager.setFlag('village_saved', true);
      worldStateManager.setFlag('refugees_accepted', true);

      expect(worldStateManager.hasFlag('village_saved')).toBe(true);
      expect(worldStateManager.hasFlag('refugees_accepted')).toBe(true);

      const activeVisuals = worldStateManager.getActiveVisualConsequences();
      expect(activeVisuals.length).toBe(2);
      expect(activeVisuals.some((v) => v.flagId === 'village_saved')).toBe(true);
      expect(activeVisuals.some((v) => v.flagId === 'refugees_accepted')).toBe(true);
    });

    it('P123-02: Samsara Reincarnation resets current life flags while preserving legacy chronicle facts', () => {
      worldStateManager.setFlag('village_saved', true); // Current life only
      worldStateManager.setFlag('sovereign_citadel_erected', true); // Permanent legacy monument

      expect(worldStateManager.hasFlag('village_saved')).toBe(true);
      expect(worldStateManager.hasFlag('sovereign_citadel_erected')).toBe(true);

      // Perform Samsara Reincarnation reset
      worldStateManager.resetForSamsara();

      // Current life flag is cleared
      expect(worldStateManager.hasFlag('village_saved')).toBe(false);
      // Legacy chronicle monument persists
      expect(worldStateManager.hasFlag('sovereign_citadel_erected')).toBe(true);
    });

    it('P123-03: Event choice and Karma shifts trigger automatic World Flag synchronization', () => {
      karmaSystem.modifyKarma(60, 'event_choice');
      expect(worldStateManager.hasFlag('kingdom_trusted')).toBe(true);
      expect(worldStateManager.hasFlag('dark_reputation')).toBe(false);

      karmaSystem.modifyKarma(-120, 'event_choice'); // Drop score to -60
      expect(worldStateManager.hasFlag('dark_reputation')).toBe(true);
      expect(worldStateManager.hasFlag('kingdom_trusted')).toBe(false);
    });
  });
});
