import { store, GearItem } from '../core/FantasyState';
import { events } from '../core/EventBus';
import { WORLDS } from '../content/worlds';
import { ENEMIES, WORLD_ENEMY_POOLS, EnemyDefinition } from '../content/enemies';
import { UpgradeEngine, CalculatedCombatStats } from './UpgradeEngine';
import { rollGearDrop } from '../content/gear';
import { AudioEngine } from './AudioEngine';

export type CombatPhase = 'RUNNING' | 'FIGHTING' | 'VICTORY' | 'BOSS_FAILED';
export type HeroAnimationState = 'IDLE' | 'RUN' | 'ATTACK' | 'ATTACK_2' | 'HURT' | 'CRIT' | 'VICTORY' | 'DEATH';
export type EnemyAnimationState = 'SPAWN' | 'IDLE' | 'ATTACK' | 'HURT' | 'DEATH';

export interface ActiveEnemyState {
  def: EnemyDefinition;
  currentHp: number;
  maxHp: number;
  goldReward: number;
  isElite: boolean;
  state: EnemyAnimationState;
  recoilOffset: number;
  flashTimer: number;
  attackTimer: number;
}

export class CombatEngine {
  private static phase: CombatPhase = 'RUNNING';
  private static heroState: HeroAnimationState = 'RUN';
  private static travelTimer: number = 0.8;
  private static autoAttackTimer: number = 0;
  private static activeEnemy: ActiveEnemyState | null = null;
  private static comboCount: number = 0;
  private static comboTimer: number = 0;
  private static stateTimer: number = 0;

  public static getPhase(): CombatPhase {
    return this.phase;
  }

  public static getHeroState(): HeroAnimationState {
    return this.heroState;
  }

  public static getActiveEnemy(): ActiveEnemyState | null {
    return this.activeEnemy;
  }

  public static getCombo(): { count: number; multiplier: number } {
    const mult = 1 + Math.min(20, this.comboCount) * (0.25 / 20);
    return { count: this.comboCount, multiplier: Number(mult.toFixed(2)) };
  }

  public static update(dt: number): void {
    const s = store.get();
    const stats = UpgradeEngine.calculateStats(s);

    // 1. Combo expiration timer
    if (this.comboCount > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.comboCount = 0;
        events.emit('combat:combo_reset');
      }
    }

    // 2. Hero state decay (transitions back to IDLE or RUN after attack/hurt)
    if (this.heroState === 'ATTACK' || this.heroState === 'ATTACK_2' || this.heroState === 'CRIT' || this.heroState === 'HURT') {
      this.stateTimer -= dt;
      if (this.stateTimer <= 0) {
        this.heroState = this.phase === 'RUNNING' ? 'RUN' : 'IDLE';
      }
    }

    // 3. Phase state machine
    if (this.phase === 'RUNNING') {
      this.heroState = 'RUN';
      this.travelTimer -= dt;
      if (this.travelTimer <= 0) {
        this.spawnNextEnemy();
      }
    } else if (this.phase === 'FIGHTING' && this.activeEnemy) {
      // Enemy animation decay
      if (this.activeEnemy.state === 'SPAWN' || this.activeEnemy.state === 'HURT' || this.activeEnemy.state === 'ATTACK') {
        this.activeEnemy.flashTimer -= dt;
        if (this.activeEnemy.flashTimer <= 0) {
          this.activeEnemy.state = 'IDLE';
        }
      }
      if (this.activeEnemy.recoilOffset > 0) {
        this.activeEnemy.recoilOffset = Math.max(0, this.activeEnemy.recoilOffset - dt * 60);
      }

      // Boss timer countdown
      if (s.world.isBossActive) {
        store.set((draft) => {
          draft.world.bossTimeRemaining = Math.max(0, draft.world.bossTimeRemaining - dt);
        });
        if (store.get().world.bossTimeRemaining <= 0) {
          this.handleBossFailed();
          return;
        }
      }

      // Hero Auto-Attack Cadence
      if (s.world.autoAdvance) {
        this.autoAttackTimer += dt;
        const cadence = 1 / Math.max(0.2, stats.attacksPerSecond);
        if (this.autoAttackTimer >= cadence) {
          this.autoAttackTimer = 0;
          this.performHeroAutoAttack(stats);
        }
      }

      // Enemy Counter-Attack Cadence
      this.activeEnemy.attackTimer += dt;
      if (this.activeEnemy.attackTimer >= this.activeEnemy.def.attackSpeedSeconds) {
        this.activeEnemy.attackTimer = 0;
        this.performEnemyAttack();
      }
    } else if (this.phase === 'VICTORY') {
      this.stateTimer -= dt;
      if (this.stateTimer <= 0) {
        this.phase = 'RUNNING';
        this.heroState = 'RUN';
        this.travelTimer = 0.8;
        this.activeEnemy = null;
      }
    } else if (this.phase === 'BOSS_FAILED') {
      this.stateTimer -= dt;
      if (this.stateTimer <= 0) {
        this.phase = 'RUNNING';
        this.heroState = 'RUN';
        this.travelTimer = 1.0;
        this.activeEnemy = null;
      }
    }
  }

  public static spawnNextEnemy(): void {
    const s = store.get();
    const worldDef = WORLDS[s.world.currentWorldId] || WORLDS[1];
    const isBossStage = s.world.currentStageNumber === worldDef.maxStages;
    const pool = WORLD_ENEMY_POOLS[s.world.currentWorldId] || WORLD_ENEMY_POOLS[1];

    let enemyDef: EnemyDefinition;
    let isBoss = false;
    let isElite = false;

    if (isBossStage && !s.world.isFarmMode) {
      enemyDef = ENEMIES[pool.boss];
      isBoss = true;
      AudioEngine.playBossWarning();
      store.set((draft) => {
        draft.world.isBossActive = true;
        draft.world.bossTimeRemaining = worldDef.bossTimerSeconds;
      });
    } else {
      const normalId = pool.normal[Math.floor(Math.random() * pool.normal.length)];
      enemyDef = ENEMIES[normalId];
      isBoss = false;
      // 20% chance for Elite monster on stages > 3
      if (s.world.currentStageNumber >= 3 && Math.random() < 0.20) {
        isElite = true;
      }
      store.set((draft) => {
        draft.world.isBossActive = false;
        draft.world.bossTimeRemaining = 0;
      });
    }

    // Compute Stage Scaled HP and Gold with Elite multipliers
    const stageMultiplier = Math.pow(worldDef.hpGrowth, s.world.currentStageNumber - 1);
    const eliteHpMult = isElite ? 2.5 : 1.0;
    const eliteGoldMult = isElite ? 3.0 : 1.0;

    const hp = Math.max(10, Math.floor(worldDef.baseHp * stageMultiplier * enemyDef.hpMultiplier * eliteHpMult));
    const stats = UpgradeEngine.calculateStats(s);
    const gold = Math.max(1, Math.floor(worldDef.baseGold * Math.pow(worldDef.goldGrowth, s.world.currentStageNumber - 1) * enemyDef.goldMultiplier * eliteGoldMult * stats.goldFindMultiplier));

    this.activeEnemy = {
      def: enemyDef,
      currentHp: hp,
      maxHp: hp,
      goldReward: gold,
      isElite,
      state: 'SPAWN',
      recoilOffset: 0,
      flashTimer: 0.2,
      attackTimer: 0,
    };

    this.phase = 'FIGHTING';
    this.heroState = 'IDLE';
    this.autoAttackTimer = 0;
    events.emit('combat:enemy_spawned', { enemy: this.activeEnemy, isBoss, isElite });
  }

  public static performHeroAutoAttack(stats: CalculatedCombatStats): void {
    if (!this.activeEnemy || this.phase !== 'FIGHTING') return;

    const isCrit = Math.random() < stats.critChance;
    const rawDmg = isCrit ? stats.heroDamage * stats.critMultiplier : stats.heroDamage;
    const dmg = Math.max(1, Math.round(rawDmg));

    this.heroState = isCrit ? 'CRIT' : (Math.random() > 0.5 ? 'ATTACK' : 'ATTACK_2');
    this.stateTimer = 0.18;

    this.applyDamageToEnemy(dmg, isCrit, false);
  }

  public static performPlayerClickAttack(screenX?: number, screenY?: number): { damage: number; isCrit: boolean } {
    if (!this.activeEnemy || this.phase !== 'FIGHTING') {
      return { damage: 0, isCrit: false };
    }

    const stats = UpgradeEngine.calculateStats();
    const isCrit = Math.random() < stats.critChance;

    this.comboCount += 1;
    this.comboTimer = 1.25;
    const comboMult = 1 + Math.min(20, this.comboCount) * (0.25 / 20);

    const baseClick = stats.clickDamage * comboMult;
    const rawDmg = isCrit ? baseClick * stats.critMultiplier : baseClick;
    const dmg = Math.max(1, Math.round(rawDmg));

    this.heroState = isCrit ? 'CRIT' : 'ATTACK';
    this.stateTimer = 0.15;

    this.applyDamageToEnemy(dmg, isCrit, true, screenX, screenY);
    return { damage: dmg, isCrit };
  }

  private static performEnemyAttack(): void {
    if (!this.activeEnemy || this.phase !== 'FIGHTING') return;

    this.activeEnemy.state = 'ATTACK';
    this.activeEnemy.flashTimer = 0.15;

    this.heroState = 'HURT';
    this.stateTimer = 0.12;

    AudioEngine.playHit();
    events.emit('combat:hero_hit');
  }

  private static applyDamageToEnemy(damage: number, isCrit: boolean, isManualClick: boolean, screenX?: number, screenY?: number): void {
    if (!this.activeEnemy) return;

    this.activeEnemy.currentHp = Math.max(0, this.activeEnemy.currentHp - damage);
    this.activeEnemy.recoilOffset = isCrit ? 16 : 8;
    this.activeEnemy.state = 'HURT';
    this.activeEnemy.flashTimer = 0.12;

    if (isCrit) {
      AudioEngine.playCrit();
    } else {
      AudioEngine.playHit();
    }

    events.emit('combat:damage_dealt', {
      damage,
      isCrit,
      isManualClick,
      remainingHp: this.activeEnemy.currentHp,
      maxHp: this.activeEnemy.maxHp,
      screenX,
      screenY,
    });

    if (this.activeEnemy.currentHp <= 0) {
      this.handleEnemyDefeat();
    }
  }

  private static handleEnemyDefeat(): void {
    if (!this.activeEnemy) return;

    this.phase = 'VICTORY';
    this.heroState = 'VICTORY';
    this.stateTimer = 0.40;
    this.activeEnemy.state = 'DEATH';

    AudioEngine.playCoin();

    const enemy = this.activeEnemy;
    const s = store.get();
    const worldDef = WORLDS[s.world.currentWorldId] || WORLDS[1];
    const isBoss = enemy.def.isBoss;

    // 1. Grant Rewards, Gold, and XP
    let droppedItem: GearItem | null = null;
    store.set((draft) => {
      draft.currencies.gold += enemy.goldReward;
      draft.currencies.lifetimeGold += enemy.goldReward;
      draft.currencies.lifetimeKills += 1;
      if (isBoss) draft.currencies.lifetimeBossKills += 1;

      // Hero XP
      draft.hero.xp += enemy.def.xpReward;
      while (draft.hero.xp >= draft.hero.xpToNext) {
        draft.hero.xp -= draft.hero.xpToNext;
        draft.hero.level += 1;
        draft.hero.xpToNext = Math.round(draft.hero.xpToNext * 1.35 + 15);
      }

      // Roll Gear Drop (increased chance for Elite/Boss)
      const itemDrop = rollGearDrop(draft.world.currentWorldId, isBoss || enemy.isElite);
      if (itemDrop && draft.gear.inventory.length < 24) {
        draft.gear.inventory.push(itemDrop);
        droppedItem = itemDrop;
      }

      // 2. Stage Progression
      if (isBoss) {
        draft.world.isBossActive = false;
        draft.world.isFarmMode = false;
        draft.world.waveProgress = 0;

        if (draft.world.currentWorldId < 3) {
          draft.world.currentWorldId += 1;
          draft.world.currentStageNumber = 1;
          draft.world.highestWorld = Math.max(draft.world.highestWorld, draft.world.currentWorldId);
          draft.world.highestStage = Math.max(draft.world.highestStage, 1);
          events.emit('world:completed', { newWorldId: draft.world.currentWorldId });
        } else {
          draft.world.currentStageNumber = 10;
        }
      } else {
        draft.world.waveProgress += 1;
        if (draft.world.waveProgress >= worldDef.enemiesPerStage) {
          draft.world.waveProgress = 0;
          if (draft.world.currentStageNumber < worldDef.maxStages) {
            draft.world.currentStageNumber += 1;
            draft.world.highestStage = Math.max(draft.world.highestStage, draft.world.currentStageNumber);
          }
        }
      }
    });

    if (droppedItem) {
      AudioEngine.playItemDrop();
      events.emit('gear:item_dropped', { item: droppedItem });
    }

    events.emit('combat:enemy_defeated', {
      goldGained: enemy.goldReward,
      xpGained: enemy.def.xpReward,
      isBoss,
      isElite: enemy.isElite,
      droppedItem,
    });
  }

  private static handleBossFailed(): void {
    this.phase = 'BOSS_FAILED';
    this.heroState = 'IDLE';
    this.stateTimer = 0.5;

    store.set((draft) => {
      draft.world.isBossActive = false;
      draft.world.isFarmMode = true;
      draft.world.currentStageNumber = Math.max(1, draft.world.currentStageNumber - 1);
      draft.world.waveProgress = 0;
    });

    events.emit('combat:boss_failed');
  }

  public static retryBoss(): void {
    store.set((draft) => {
      const worldDef = WORLDS[draft.world.currentWorldId] || WORLDS[1];
      draft.world.isFarmMode = false;
      draft.world.currentStageNumber = worldDef.maxStages;
      draft.world.waveProgress = 0;
    });
    this.phase = 'RUNNING';
    this.heroState = 'RUN';
    this.travelTimer = 0.2;
    this.activeEnemy = null;
  }
}
