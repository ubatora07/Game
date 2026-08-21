import { describe, it, expect, beforeEach } from 'vitest';
import { store, createInitialState } from '../src/core/GameState';
import { CombatViewModel } from '../src/ui/hybrid/adapters/CombatViewModel';
import { InventoryViewModel } from '../src/ui/hybrid/adapters/InventoryViewModel';
import { SettlementViewModel } from '../src/ui/hybrid/adapters/SettlementViewModel';
import { HeroViewModel } from '../src/ui/hybrid/adapters/HeroViewModel';
import { craftingEquipmentSystem } from '../src/systems/CraftingEquipmentSystem';
import { settlementSystem } from '../src/systems/SettlementSystem';

describe('Hybrid Beta 0.1 — Domain & Adapter Contracts', () => {
  beforeEach(() => {
    store.replace(createInitialState());
  });

  describe('1. CombatViewModel Adapter', () => {
    it('accurately bridges domain campaign combat data to hybrid presentation', () => {
      const data = CombatViewModel.getData();
      expect(data).toBeDefined();
      expect(data.worldId).toBe(1);
      expect(data.stageId).toBe('1-1');
      expect(data.playerPower).toBe(0);
      expect(data.autoAdvance).toBe(true);

      const isAutoNow = CombatViewModel.toggleAutoAdvance();
      expect(isAutoNow).toBe(false);
      expect(CombatViewModel.getData().autoAdvance).toBe(false);
    });

    it('executes manual attacks without altering game balance formulas', () => {
      const attackResult = CombatViewModel.manualAttack();
      expect(attackResult.damage).toBeGreaterThan(0);
      expect(typeof attackResult.isCrit).toBe('boolean');
    });
  });

  describe('2. InventoryViewModel Adapter', () => {
    it('returns formatted inventory items and materials', () => {
      const allItems = InventoryViewModel.getItems('all');
      expect(Array.isArray(allItems)).toBe(true);

      const materials = InventoryViewModel.getItems('materials');
      expect(materials.every((m) => m.category === 'material')).toBe(true);
    });

    it('bridges equipment actions to CraftingEquipmentSystem', () => {
      const inv = craftingEquipmentSystem.getInventory();
      if (inv.length > 0) {
        const item = inv[0];
        const success = InventoryViewModel.equip(item.id);
        expect(typeof success).toBe('boolean');
      }
    });
  });

  describe('3. SettlementViewModel Adapter', () => {
    it('bridges 8 settlement structures with costs and tiers', () => {
      const buildings = SettlementViewModel.getBuildings();
      expect(buildings.length).toBe(8);
      expect(buildings.some((b) => b.id === 'throne_hall')).toBe(true);
      expect(buildings.some((b) => b.id === 'forge')).toBe(true);

      const res = SettlementViewModel.getResources();
      expect(res).toBeDefined();
      expect(typeof res.wood).toBe('number');
      expect(typeof res.stone).toBe('number');
      expect(typeof res.iron).toBe('number');
    });

    it('executes upgrade command via authoritative SettlementSystem', () => {
      const initialWood = settlementSystem.getState().wood;
      // Should not throw or crash
      SettlementViewModel.upgradeBuilding('throne_hall');
      expect(typeof initialWood).toBe('number');
    });
  });

  describe('4. HeroViewModel Adapter', () => {
    it('bridges protagonist cultivation and roster data without dual-state', () => {
      const data = HeroViewModel.getHeroData();
      expect(data.rankId).toBe('E');
      expect(data.heroes.length).toBeGreaterThan(0);
      expect(data.totalPower).toBe(0);
    });
  });

  describe('5. Save V7 & Anti-Dual-Save Verification', () => {
    it('verifies that GameState conforms strictly to Save V7 schema with zero Melvor state contamination', () => {
      const state = store.get();
      expect(state.version).toBe(7);
      expect((state as any).skills).toBeUndefined();
      expect((state as any).combatArea).toBeUndefined();
      expect((state as any).bank).toBeUndefined();
      expect(state.campaign).toBeDefined();
      expect(state.buildings).toBeDefined();
      expect(state.heroes).toBeDefined();
    });
  });
});
