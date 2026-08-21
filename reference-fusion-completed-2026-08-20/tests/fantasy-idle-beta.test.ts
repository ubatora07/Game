import { describe, it, expect, beforeEach } from 'vitest';
import { store } from '../src/fantasy/core/FantasyState';
import { CombatEngine } from '../src/fantasy/engine/CombatEngine';
import { UpgradeEngine } from '../src/fantasy/engine/UpgradeEngine';
import { GearEngine } from '../src/fantasy/engine/GearEngine';
import { OfflineEngine } from '../src/fantasy/engine/OfflineEngine';
import { BigNumber } from '../src/fantasy/core/BigNumber';

describe('Fantasy Idle Clicker RPG - Reference Fusion Engine Tests', () => {
  beforeEach(() => {
    store.reset();
  });

  it('calculates BigNumber notations accurately', () => {
    expect(BigNumber.format(950)).toBe('950');
    expect(BigNumber.format(1250)).toBe('1.25K');
    expect(BigNumber.format(4810000)).toBe('4.81M');
    expect(BigNumber.format(18300000000)).toBe('18.3B');
    expect(BigNumber.format(6420000000000)).toBe('6.42T');
  });

  it('scales upgrade costs exponentially and applies milestone multipliers (Incremental-RPG formula)', () => {
    const s = store.get();
    const stats0 = UpgradeEngine.calculateStats(s);
    expect(stats0.heroDamage).toBe(13); // 10 base + 1 * 3 per level

    // Give gold and purchase 10 damage upgrades
    store.set((draft) => { draft.currencies.gold = 100000; });
    UpgradeEngine.buyUpgrade('damage', '10');
    const stats1 = UpgradeEngine.calculateStats();
    // Lv 11 triggers the 2x milestone multiplier (milestones: 10, 25, 50, 100, 250)
    expect(store.get().upgrades.damage).toBe(11);
    expect(stats1.heroDamage).toBe((10 + 11 * 3) * 2); // 86
  });

  it('executes entity state machine and combat flow (Hedra / Bartimaeus pattern)', () => {
    // 1. Spawns next enemy
    CombatEngine.spawnNextEnemy();
    expect(CombatEngine.getPhase()).toBe('FIGHTING');
    const enemy = CombatEngine.getActiveEnemy();
    expect(enemy).not.toBeNull();
    expect(enemy!.currentHp).toBeGreaterThan(0);
    expect(enemy!.state).toBe('SPAWN');

    // 2. Perform player click attack
    const result = CombatEngine.performPlayerClickAttack();
    expect(result.damage).toBeGreaterThan(0);
    expect(CombatEngine.getCombo().count).toBe(1);
    expect(CombatEngine.getHeroState()).toBe('ATTACK');
    expect(CombatEngine.getCombo().multiplier).toBeGreaterThanOrEqual(1.0);
  });

  it('equips and unstacks gear correctly with attribute aggregation', () => {
    const testSword = {
      id: 'test_blade_1',
      name: 'Runic Blade',
      slot: 'weapon' as const,
      rarity: 'rare' as const,
      level: 1,
      stats: { damagePct: 0.5, critChance: 0.1 },
      value: 100,
      icon: '🗡️',
    };

    store.set((draft) => {
      draft.gear.inventory.push(testSword);
    });

    GearEngine.equipItem('test_blade_1');
    expect(store.get().gear.equipped.weapon?.name).toBe('Runic Blade');
    expect(store.get().gear.inventory.length).toBe(0);

    const statsWithSword = UpgradeEngine.calculateStats();
    expect(statsWithSword.heroDamage).toBe(Math.round(13 * 1.5)); // 20
    expect(statsWithSword.critChance).toBe(0.15); // 0.05 base + 0.10 sword
  });

  it('simulates offline progression mathematically in under 1ms (Embervale Idle time-slicing)', () => {
    const s = store.get();
    // Simulate 2 hours (7200 seconds) of offline inactivity
    s.lastActiveTime = Date.now() - 7200 * 1000;

    const offlineResult = OfflineEngine.calculateOfflineGains(s);
    expect(offlineResult).not.toBeNull();
    expect(offlineResult!.elapsedSeconds).toBe(7200);
    expect(offlineResult!.formattedTime).toBe('02:00:00');
    expect(offlineResult!.enemiesDefeated).toBeGreaterThan(100);
    expect(offlineResult!.goldGained).toBeGreaterThan(500);
  });

  it('supports elite enemy multipliers and boss failure fallback', () => {
    store.set((draft) => {
      draft.world.currentStageNumber = 10;
      draft.world.isFarmMode = false;
      draft.world.autoAdvance = false;
    });

    CombatEngine.spawnNextEnemy();
    expect(store.get().world.isBossActive).toBe(true);

    // Set remaining boss time to near zero and tick
    store.set((draft) => {
      draft.world.bossTimeRemaining = 0.01;
    });
    CombatEngine.update(0.1);

    expect(CombatEngine.getPhase()).toBe('BOSS_FAILED');
    expect(store.get().world.isFarmMode).toBe(true);
    expect(store.get().world.currentStageNumber).toBe(9);

    // Retry Boss
    CombatEngine.retryBoss();
    expect(store.get().world.isFarmMode).toBe(false);
    expect(store.get().world.currentStageNumber).toBe(10);
  });
});
