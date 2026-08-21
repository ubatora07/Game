import { describe, it, expect, beforeEach } from 'vitest';
import { store, createInitialState } from '../src/core/GameState';
import { calculateEnemyStats, isFloorBoss, getWorldForFloor } from '../src/content/worlds';
import { towerSystem } from '../src/systems/TowerSystem';
import { events } from '../src/core/EventBus';

describe('Infinite Tower & Challenge Mode Tests', () => {
  beforeEach(() => {
    const fresh = createInitialState();
    fresh.rankIndex = 2; // Unlock Tower
    fresh.towerFloor = 1;
    fresh.towerMaxFloor = 1;
    store.replace(fresh);
  });

  it('P42-01: identifies boss floors every 10 floors', () => {
    expect(isFloorBoss(1)).toBe(false);
    expect(isFloorBoss(9)).toBe(false);
    expect(isFloorBoss(10)).toBe(true);
    expect(isFloorBoss(20)).toBe(true);
    expect(isFloorBoss(50)).toBe(true);
  });

  it('P42-02: scales enemy stats smoothly with floor progression', () => {
    const floor1 = calculateEnemyStats(1);
    const floor5 = calculateEnemyStats(5);
    const floor10 = calculateEnemyStats(10); // Boss

    expect(floor5.maxHp).toBeGreaterThan(floor1.maxHp);
    expect(floor10.isBoss).toBe(true);
    expect(floor10.maxHp).toBeGreaterThan(floor5.maxHp * 2);
  });

  it('P42-03: maps floors to correct anime world themes', () => {
    const w1 = getWorldForFloor(1);
    const w2 = getWorldForFloor(55);
    const w3 = getWorldForFloor(105);

    expect(w1.worldIndex).toBe(1);
    expect(w2.worldIndex).toBe(2);
    expect(w3.worldIndex).toBe(3);
  });

  it('P42-04 & P42-08: Milestone floors grant bonus crystals & essence and emit milestone event', () => {
    store.set((draft) => {
      draft.rankIndex = 5;
      draft.rankId = 'RANK_A';
      draft.power = 10000000;
      draft.buildings['dojo'] = 100;
      draft.buildings['pagoda'] = 100;
    });

    towerSystem.resetToFloor(5); // Milestone floor
    const initialCrystals = store.get().crystals;
    const initialEssence = store.get().essence;

    let milestoneEventReceived: any = null;
    events.on('tower:milestoneClaimed', (data) => {
      milestoneEventReceived = data;
    });

    // Run auto-combat update with massive DPS
    towerSystem.update(1.0);

    expect(milestoneEventReceived).toBeDefined();
    expect(milestoneEventReceived.floor).toBe(5);
    expect(store.get().crystals).toBeGreaterThan(initialCrystals);
    expect(store.get().essence).toBeGreaterThan(initialEssence);
  });

  it('P42-05: Farm mode allows repeating safe floor without advancing floor number', () => {
    store.set((draft) => {
      draft.rankIndex = 5;
      draft.rankId = 'RANK_A';
      draft.power = 10000000;
      draft.buildings['dojo'] = 100;
      draft.buildings['pagoda'] = 100;
    });

    towerSystem.resetToFloor(4);
    if (!towerSystem.getCombatState().isFarmMode) {
      towerSystem.toggleFarmMode();
    }
    expect(towerSystem.getCombatState().isFarmMode).toBe(true);

    const initialFloor = store.get().towerFloor;
    towerSystem.update(1.0);

    // In farm mode, player repeats current floor
    expect(store.get().towerFloor).toBe(initialFloor);

    // Switch back to push mode
    towerSystem.toggleFarmMode();
    expect(towerSystem.getCombatState().isFarmMode).toBe(false);
  });
});
