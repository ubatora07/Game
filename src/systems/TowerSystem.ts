import { store } from '../core/GameState';
import { EconomyEngine } from '../economy/EconomyEngine';
import { calculateEnemyStats } from '../content/worlds';
import { events } from '../core/EventBus';
import { sound } from '../services/audio/SoundService';
import { RelicSystem } from './RelicSystem';
import { RELICS } from '../content/relics';
import { t } from '../services/i18n/I18nService';
import { isProgressionUnlocked } from '../content/progressionUnlocks';

export interface CombatState {
  currentFloor: number;
  enemyNameKey: string;
  enemyIcon: string;
  isBoss: boolean;
  enemyMaxHp: number;
  enemyCurrentHp: number;
  battleTimer: number; // 12 seconds per floor timer
  maxBattleTimer: number;
  lastAttackTimer: number;
  isAutoClimbing: boolean;
  isFarmMode: boolean;
}

export class TowerSystem {
  private static instance: TowerSystem;
  private combatState: CombatState;

  private constructor() {
    const floor = store.get().towerFloor || 1;
    const enemy = calculateEnemyStats(floor);
    this.combatState = {
      currentFloor: floor,
      enemyNameKey: enemy.nameKey,
      enemyIcon: enemy.icon,
      isBoss: enemy.isBoss,
      enemyMaxHp: enemy.maxHp,
      enemyCurrentHp: enemy.maxHp,
      battleTimer: 12,
      maxBattleTimer: 12,
      lastAttackTimer: 0,
      isAutoClimbing: true,
      isFarmMode: false,
    };
  }

  public static getInstance(): TowerSystem {
    if (!TowerSystem.instance) {
      TowerSystem.instance = new TowerSystem();
    }
    return TowerSystem.instance;
  }

  public getCombatState(): Readonly<CombatState> {
    return this.combatState;
  }

  public toggleAutoClimb(): void {
    this.combatState.isAutoClimbing = !this.combatState.isAutoClimbing;
  }

  public toggleFarmMode(): void {
    this.combatState.isFarmMode = !this.combatState.isFarmMode;
  }

  public slash(): number {
    const state = store.get();
    if (!isProgressionUnlocked('tower', state.rankIndex)) return 0;
    
    const metrics = EconomyEngine.calculateMetrics(state);
    // Manual slash deals 10% of DPS or a flat base damage if DPS is low
    const damage = Math.max(metrics.towerCombatPower * 0.2, 5); 
    
    this.combatState.enemyCurrentHp = Math.max(0, this.combatState.enemyCurrentHp - damage);
    if (this.combatState.enemyCurrentHp <= 0) {
      this.handleFloorVictory();
    }
    return damage;
  }

  public resetToFloor(floor: number): void {
    const enemy = calculateEnemyStats(floor);
    this.combatState.currentFloor = floor;
    this.combatState.enemyNameKey = enemy.nameKey;
    this.combatState.enemyIcon = enemy.icon;
    this.combatState.isBoss = enemy.isBoss;
    this.combatState.enemyMaxHp = enemy.maxHp;
    this.combatState.enemyCurrentHp = enemy.maxHp;
    this.combatState.battleTimer = 12;
  }

  /**
   * Tick tower combat simulation via delta time
   */
  public update(dt: number): void {
    if (!this.combatState.isAutoClimbing) return;

    // Rank gate comes from the shared progression contract.
    if (!isProgressionUnlocked('tower', store.get().rankIndex)) return;

    const state = store.get();
    const metrics = EconomyEngine.calculateMetrics(state);
    const dps = metrics.towerCombatPower;

    // Apply damage per second
    const damage = dps * dt;
    this.combatState.enemyCurrentHp = Math.max(0, this.combatState.enemyCurrentHp - damage);
    this.combatState.battleTimer -= dt;

    if (this.combatState.enemyCurrentHp <= 0) {
      this.handleFloorVictory();
    } else if (this.combatState.battleTimer <= 0) {
      this.handleFloorDefeat();
    }
  }

  private handleFloorVictory(): void {
    const floor = this.combatState.currentFloor;
    const isBoss = this.combatState.isBoss;
    const isMilestone = floor % 5 === 0;

    const soulTowerLvl = store.get().soulSkills['soul_tower'] || 0;
    const dropMultiplier = 1.0 + soulTowerLvl * 0.20;

    let goldReward = Math.floor(50 * Math.pow(1.09, floor) * (isBoss ? 4 : 1) * dropMultiplier);
    let crystalReward = Math.floor((isBoss ? 25 : 5) * dropMultiplier);
    let essenceReward = Math.floor((isBoss ? 15 : 2) * dropMultiplier);

    // Additional Milestone reward
    if (isMilestone) {
      crystalReward += Math.floor(25 * dropMultiplier);
      essenceReward += Math.floor(10 * dropMultiplier);
      events.emit('tower:milestoneClaimed', {
        floor,
        rewards: { crystals: 25, essence: 10 }
      });
    }

    store.set((draft) => {
      draft.gold += goldReward;
      draft.crystals += crystalReward;
      draft.essence += essenceReward;
      draft.stats.lifetimeGold += goldReward;
      if (!this.combatState.isFarmMode) {
        draft.towerFloor = floor + 1;
      }
      if (floor + 1 > draft.towerMaxFloor) {
        draft.towerMaxFloor = floor + 1;
      }
    });

    sound.playVictory();

    events.emit('tower:floorClear', {
      floor,
      rewards: { gold: goldReward, crystals: crystalReward, essence: essenceReward }
    });

    if (isBoss) {
      events.emit('tower:bossDefeat', {
        floor,
        bossName: this.combatState.enemyNameKey
      });
      // Boss drop (Relic) - 20% chance
      if (Math.random() < 0.20) {
        // Drop a random relic
        const randomRelic = RELICS[Math.floor(Math.random() * RELICS.length)];
        RelicSystem.grantRelic(randomRelic.id);
      }
      
      // Update Leaderboard
      import('../services/platform/YandexGamesService').then(({ platform }) => {
        platform.setLeaderboardScore('max_tower_floor', floor);
      });
    }

    if (this.combatState.isFarmMode) {
      // Repeat safe floor
      this.resetToFloor(floor);
      return;
    }

    // Check for Tower Skipper Relic
    let nextFloor = floor + 1;
    const skipChance = RelicSystem.getEquippedEffectValue(store.get(), 'tower_skip');
    if (skipChance > 0 && Math.random() < skipChance) {
      events.emit('toast:show', { message: t('toast.tower.relic_skip', { floor: nextFloor }), type: 'info' });
      nextFloor += 1;
    }
    
    // Spawn next floor enemy
    this.resetToFloor(nextFloor);
  }

  private handleFloorDefeat(): void {
    events.emit('tower:loss', { floor: this.combatState.currentFloor });
    // Reset floor and retry
    this.resetToFloor(this.combatState.currentFloor);
  }
}

export const towerSystem = TowerSystem.getInstance();
