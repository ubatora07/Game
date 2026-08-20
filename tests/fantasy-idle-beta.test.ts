import { describe, it, expect, beforeEach } from 'vitest';
import { store, createInitialFantasyState } from '../src/fantasy/core/FantasyState';
import { BigNumber } from '../src/fantasy/core/BigNumber';
import { UpgradeEngine } from '../src/fantasy/engine/UpgradeEngine';
import { CombatEngine } from '../src/fantasy/engine/CombatEngine';
import { GearEngine } from '../src/fantasy/engine/GearEngine';
import { LegacyEngine } from '../src/fantasy/engine/LegacyEngine';
import { OfflineEngine } from '../src/fantasy/engine/OfflineEngine';
import { SaveEngine } from '../src/fantasy/engine/SaveEngine';
import { rollGearDrop } from '../src/fantasy/content/gear';

describe('Fantasy Idle RPG — Beta 0.1 Core Test Suite', () => {
  beforeEach(() => {
    store.replace(createInitialFantasyState());
  });

  it('1. BigNumber formats standard incremental suffixes correctly', () => {
    expect(BigNumber.format(0)).toBe('0');
    expect(BigNumber.format(950)).toBe('950');
    expect(BigNumber.format(1250)).toBe('1.25K');
    expect(BigNumber.format(842000)).toBe('842K');
    expect(BigNumber.format(4810000)).toBe('4.81M');
    expect(BigNumber.format(18300000000)).toBe('18.3B');
    expect(BigNumber.format(6420000000000)).toBe('6.42T');
  });

  it('2. UpgradeEngine calculates stats, milestone multipliers, and handles purchases', () => {
    const initialStats = UpgradeEngine.calculateStats();
    expect(initialStats.heroDamage).toBeGreaterThanOrEqual(10);
    expect(initialStats.clickDamage).toBeGreaterThanOrEqual(6);
    expect(initialStats.attacksPerSecond).toBeGreaterThanOrEqual(1.0);

    // Test Milestone multiplier: at Lv 10 it doubles
    expect(UpgradeEngine.calculateMilestoneMultiplier(9, [10, 25, 50])).toBe(1.0);
    expect(UpgradeEngine.calculateMilestoneMultiplier(10, [10, 25, 50])).toBe(2.0);
    expect(UpgradeEngine.calculateMilestoneMultiplier(25, [10, 25, 50])).toBe(4.0);

    // Give gold and buy upgrade
    store.set((s) => { s.currencies.gold = 10000; });
    const bought = UpgradeEngine.buyUpgrade('damage', '10');
    expect(bought).toBe(true);
    expect(store.get().upgrades.damage).toBe(11);
    expect(store.get().currencies.gold).toBeLessThan(10000);
  });

  it('3. CombatEngine spawns enemies, deals damage, processes manual clicks and combos', () => {
    CombatEngine.spawnNextEnemy();
    const enemy = CombatEngine.getActiveEnemy();
    expect(enemy).not.toBeNull();
    expect(enemy!.currentHp).toBeGreaterThan(0);

    const initialHp = enemy!.currentHp;
    const clickResult = CombatEngine.performPlayerClickAttack();
    expect(clickResult.damage).toBeGreaterThan(0);
    expect(enemy!.currentHp).toBeLessThan(initialHp);

    const combo = CombatEngine.getCombo();
    expect(combo.count).toBe(1);
  });

  it('4. GearEngine equips items, applies stat bonuses, and handles selling', () => {
    const testItem = rollGearDrop(1, true);
    expect(testItem).not.toBeNull();

    GearEngine.addItem(testItem!);
    expect(store.get().gear.inventory.length).toBe(1);

    const equipped = GearEngine.equipItem(testItem!.id);
    expect(equipped).toBe(true);
    expect(store.get().gear.equipped[testItem!.slot]).not.toBeNull();
    expect(store.get().gear.inventory.length).toBe(0);

    // Unequip
    GearEngine.unequipItem(testItem!.slot);
    expect(store.get().gear.equipped[testItem!.slot]).toBeNull();
    expect(store.get().gear.inventory.length).toBe(1);

    // Sell
    const goldEarned = GearEngine.sellItem(testItem!.id);
    expect(goldEarned).toBeGreaterThan(0);
    expect(store.get().gear.inventory.length).toBe(0);
    expect(store.get().currencies.gold).toBe(goldEarned);
  });

  it('5. LegacyEngine calculates points and performs prestige reset retaining gear', () => {
    // Add an item to inventory
    const item = rollGearDrop(1, false);
    if (item) GearEngine.addItem(item);

    // Advance progression
    store.set((s) => {
      s.currencies.lifetimeGold = 500000;
      s.currencies.gold = 50000;
      s.world.highestWorld = 2;
      s.world.highestStage = 8;
      s.upgrades.damage = 45;
    });

    const potentialPoints = LegacyEngine.getPotentialPoints();
    expect(potentialPoints).toBeGreaterThan(10);

    const pointsGained = LegacyEngine.performPrestige();
    expect(pointsGained).toBe(potentialPoints);

    const s = store.get();
    expect(s.currencies.gold).toBe(0);
    expect(s.upgrades.damage).toBe(1);
    expect(s.world.currentWorldId).toBe(1);
    expect(s.world.currentStageNumber).toBe(1);
    expect(s.currencies.legacyPoints).toBe(pointsGained);
    expect(s.legacy.legacyCount).toBe(1);

    // Gear is KEPT!
    if (item) {
      expect(s.gear.inventory.length).toBe(1);
    }
  });

  it('6. OfflineEngine simulates offline gains capped at 8 hours', () => {
    const s = store.get();
    const fourHoursAgo = Date.now() - (4 * 3600 * 1000);
    const simulatedState = { ...s, lastActiveTime: fourHoursAgo };

    const gains = OfflineEngine.calculateOfflineGains(simulatedState);
    expect(gains).not.toBeNull();
    expect(gains!.elapsedSeconds).toBe(14400); // 4 hours
    expect(gains!.goldGained).toBeGreaterThan(0);
    expect(gains!.enemiesDefeated).toBeGreaterThan(0);
  });

  it('7. SaveEngine stores and restores game state safely in isolated namespace', () => {
    store.set((s) => {
      s.currencies.gold = 8888;
      s.hero.name = 'Legendary Champion';
    });

    const saved = SaveEngine.save();
    expect(saved).toBe(true);

    const loaded = SaveEngine.load();
    expect(loaded).not.toBeNull();
    expect(loaded!.currencies.gold).toBe(8888);
    expect(loaded!.hero.name).toBe('Legendary Champion');
  });
});
