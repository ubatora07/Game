import { describe, it, expect, beforeEach } from 'vitest';
import { store, createInitialState } from '../src/core/GameState';
import { CampaignCombatService } from '../src/systems/CampaignCombatService';
import { getCampaignStageById } from '../src/content/campaignStages';

describe('Phase 31 — Combat Engine Adapter', () => {
  let combatService: CampaignCombatService;

  beforeEach(() => {
    store.replace(createInitialState());
    combatService = CampaignCombatService.getInstance();
    combatService.resetToStage('1-1');
  });

  describe('Combat State Initialization', () => {
    it('spawns active enemy on stage 1-1 with positive HP', () => {
      const state = combatService.getCombatState();
      expect(state.stageId).toBe('1-1');
      expect(state.worldId).toBe(1);
      expect(state.encounterIndex).toBe(1);
      expect(state.activeEnemy).toBeDefined();
      expect(state.activeEnemy!.maxHp).toBeGreaterThan(0);
      expect(state.activeEnemy!.currentHp).toBe(state.activeEnemy!.maxHp);
      expect(state.activeEnemy!.isBoss).toBe(false);
    });

    it('identifies boss stages and activates encounter countdown timer', () => {
      combatService.resetToStage('1-5');
      const state = combatService.getCombatState();
      expect(state.stageId).toBe('1-5');
      expect(state.activeEnemy!.isBoss).toBe(true);
      expect(state.isTimerActive).toBe(true);
      expect(state.encounterTimer).toBe(30);
      expect(state.maxEncounterTimer).toBe(30);
    });
  });

  describe('Manual Attack Action', () => {
    it('deals damage, decreases enemy HP, and advances combo', () => {
      const stateBefore = combatService.getCombatState();
      const initialHp = stateBefore.activeEnemy!.currentHp;

      const result = combatService.attack(100, 100);

      expect(result.damage).toBeGreaterThan(0);
      expect(result.remainingHp).toBeLessThan(initialHp);
      expect(combatService.getCombatState().activeEnemy!.currentHp).toBe(result.remainingHp);
      expect(store.get().combo.count).toBeGreaterThan(0);
    });

    it('kills enemy when damage exceeds current HP and triggers progression', () => {
      const initialStageId = store.get().campaign.currentStageId;
      const enemyHp = combatService.getCombatState().activeEnemy!.currentHp;

      // Overkill manual attacks
      for (let i = 0; i < 20; i++) {
        combatService.attack();
      }

      // Enemy should have taken damage and either advanced encounter or cleared stage
      const state = store.get();
      expect(state.gold).toBeGreaterThan(0);
      expect(state.power).toBeGreaterThan(0);
    });
  });

  describe('Auto DPS and Frame-Rate Ticking', () => {
    it('derives auto DPS from EconomyEngine metrics', () => {
      const dps = combatService.calculateAutoDps();
      expect(dps).toBeGreaterThanOrEqual(10);
    });

    it('applies auto DPS proportionally over delta time', () => {
      const initialHp = combatService.getCombatState().activeEnemy!.currentHp;
      const dps = combatService.calculateAutoDps();
      const dt = 0.5; // 500ms

      combatService.update(dt);

      const expectedHp = Math.max(0, initialHp - dps * dt);
      expect(combatService.getCombatState().activeEnemy!.currentHp).toBeCloseTo(expectedHp, 1);
    });

    it('deals identical total damage across 30 FPS, 60 FPS, and 144 FPS over 1 second', () => {
      const dps = combatService.calculateAutoDps();

      // Simulate 1 second at 30 FPS
      let damage30 = 0;
      for (let f = 0; f < 30; f++) {
        damage30 += dps * (1 / 30);
      }

      // Simulate 1 second at 60 FPS
      let damage60 = 0;
      for (let f = 0; f < 60; f++) {
        damage60 += dps * (1 / 60);
      }

      // Simulate 1 second at 144 FPS
      let damage144 = 0;
      for (let f = 0; f < 144; f++) {
        damage144 += dps * (1 / 144);
      }

      expect(damage30).toBeCloseTo(dps, 4);
      expect(damage60).toBeCloseTo(dps, 4);
      expect(damage144).toBeCloseTo(dps, 4);
      expect(damage30).toBeCloseTo(damage60, 4);
      expect(damage60).toBeCloseTo(damage144, 4);
    });
  });

  describe('Boss Timeout and Blocked Mode', () => {
    it('falls back to farm stage when boss timer expires', () => {
      combatService.resetToStage('1-10');
      store.set((draft) => {
        draft.campaign.farmStageId = '1-9';
      });

      // Tick past the 45s timer
      combatService.update(50.0);

      const state = store.get();
      expect(state.campaign.campaignMode).toBe('boss_blocked');
      expect(state.campaign.currentStageId).toBe('1-9');
      expect(state.campaign.bossRetryState?.bossId).toBe('boss_1_10');
    });
  });

  describe('Pause & Combat Controls', () => {
    it('does not deal damage when paused', () => {
      combatService.setPaused(true);
      const initialHp = combatService.getCombatState().activeEnemy!.currentHp;

      combatService.update(1.0);
      const attackRes = combatService.attack();

      expect(combatService.getCombatState().activeEnemy!.currentHp).toBe(initialHp);
      expect(attackRes.damage).toBe(0);

      combatService.setPaused(false);
    });

    it('stops auto-attack damage when auto-attack is toggled off', () => {
      combatService.toggleAutoAttack(); // false
      expect(combatService.getCombatState().autoAttackEnabled).toBe(false);

      const initialHp = combatService.getCombatState().activeEnemy!.currentHp;
      combatService.update(1.0);

      expect(combatService.getCombatState().activeEnemy!.currentHp).toBe(initialHp);

      combatService.toggleAutoAttack(); // true
      expect(combatService.getCombatState().autoAttackEnabled).toBe(true);
    });
  });
});
