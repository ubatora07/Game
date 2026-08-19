import { store, GameStateData } from '../core/GameState';
import { EconomyEngine } from '../economy/EconomyEngine';
import { TrainingSystem, TrainResult } from './TrainingSystem';
import { CampaignProgressionSystem, DefeatEnemyResult } from './CampaignProgressionSystem';
import { getCampaignStageById } from '../content/campaignStages';
import { getCampaignEnemyById } from '../content/campaignEnemies';
import { getCampaignBossById } from '../content/campaignBosses';
import { events } from '../core/EventBus';
import { sound } from '../services/audio/SoundService';
import { HeroSystem } from './HeroSystem';
import { HeroDefinition, getHeroStarMultiplier } from '../content/heroes';

export interface ActiveCombatEntity {
  id: string;
  nameKey: string;
  defaultName: string;
  isBoss: boolean;
  bossTitleKey?: string;
  defaultBossTitle?: string;
  maxHp: number;
  currentHp: number;
  shieldHp?: number;
  maxShieldHp?: number;
  isEnraged?: boolean;
  isDamageReductionActive?: boolean;
  damageReductionTimer?: number;
  damageReductionUsed?: boolean;
  archetype: string;
  spriteId: string;
  specialMechanic?: string;
}

export interface CampaignCombatState {
  stageId: string;
  worldId: number;
  encounterIndex: number;
  totalEncounters: number;
  activeEnemy: ActiveCombatEntity | null;
  encounterTimer: number;
  maxEncounterTimer: number;
  isTimerActive: boolean;
  isPaused: boolean;
  autoAttackEnabled: boolean;
}

export interface AttackActionResult {
  damage: number;
  isCrit: boolean;
  powerGained: number;
  goldGained: number;
  enemyDied: boolean;
  remainingHp: number;
}

export class CampaignCombatService {
  private static instance: CampaignCombatService;
  private combatState: CampaignCombatState;
  private isResolvingDeath: boolean = false;
  private deathTransitionTimer: number = 0;
  private readonly deathTransitionDuration: number = 0.3; // 300ms transition
  private autoAttackTimer: number = 0;
  private readonly autoAttackCadence: number = 0.35; // Hero swings every 350ms
  private isSpawning: boolean = false;

  private constructor() {
    const state = store.get();
    CampaignProgressionSystem.ensureCampaignState(state);
    const stage = CampaignProgressionSystem.getCurrentStage(state);

    this.combatState = {
      stageId: stage.id,
      worldId: stage.worldId,
      encounterIndex: state.campaign.currentEncounter || 1,
      totalEncounters: stage.enemyCount,
      activeEnemy: null,
      encounterTimer: 0,
      maxEncounterTimer: 0,
      isTimerActive: false,
      isPaused: false,
      autoAttackEnabled: true,
    };

    this.spawnCurrentEncounter(state);
  }

  public static getInstance(): CampaignCombatService {
    if (!CampaignCombatService.instance) {
      CampaignCombatService.instance = new CampaignCombatService();
    }
    return CampaignCombatService.instance;
  }

  public getCombatState(): Readonly<CampaignCombatState> {
    return this.combatState;
  }

  public setPaused(paused: boolean): void {
    this.combatState.isPaused = paused;
  }

  public setAutoAttackEnabled(enabled: boolean): void {
    this.combatState.autoAttackEnabled = enabled;
  }

  public toggleAutoAttack(): boolean {
    this.combatState.autoAttackEnabled = !this.combatState.autoAttackEnabled;
    return this.combatState.autoAttackEnabled;
  }

  /**
   * Spawns the enemy for the current stage encounter
   */
  public spawnCurrentEncounter(state?: GameStateData): void {
    if (this.isSpawning) return;
    this.isSpawning = true;

    try {
      const currentState = state || store.get();
      CampaignProgressionSystem.ensureCampaignState(currentState);
      const stage = CampaignProgressionSystem.getCurrentStage(currentState);
      const encounterIdx = currentState.campaign.currentEncounter || 1;

      this.combatState.stageId = stage.id;
      this.combatState.worldId = stage.worldId;
      this.combatState.encounterIndex = encounterIdx;
      this.combatState.totalEncounters = stage.enemyCount;
      this.isResolvingDeath = false;
      this.deathTransitionTimer = 0;

      if (stage.isBoss && stage.bossId) {
        // Boss Encounter
        const boss = getCampaignBossById(stage.bossId);
        if (boss) {
          const hp = Math.max(10, Math.floor(stage.baseHp * boss.baseHpMultiplier));
          this.combatState.activeEnemy = {
            id: boss.id,
            nameKey: boss.nameKey,
            defaultName: boss.defaultName,
            isBoss: true,
            bossTitleKey: boss.titleKey,
            defaultBossTitle: boss.defaultTitle,
            maxHp: hp,
            currentHp: hp,
            archetype: 'boss',
            spriteId: boss.spriteId,
            specialMechanic: boss.specialMechanic,
          };
          this.combatState.isTimerActive = true;
          this.combatState.maxEncounterTimer = boss.timerSeconds || 45;
          this.combatState.encounterTimer = this.combatState.maxEncounterTimer;

          events.emit('combat:boss_warning', {
            bossName: boss.defaultName,
            stageId: stage.id,
          });
        }
      } else {
        // Normal / Elite Encounter
        const poolIndex = (encounterIdx - 1) % stage.enemyPool.length;
        const enemyId = stage.enemyPool[poolIndex] || stage.enemyPool[0] || 'forest_goblin';
        const enemy = getCampaignEnemyById(enemyId);
        const hp = Math.max(10, Math.floor(stage.baseHp * enemy.baseHpMultiplier));

        this.combatState.activeEnemy = {
          id: enemy.id,
          nameKey: enemy.nameKey,
          defaultName: enemy.defaultName,
          isBoss: false,
          maxHp: hp,
          currentHp: hp,
          archetype: enemy.archetype,
          spriteId: enemy.spriteId,
        };
        this.combatState.isTimerActive = false;
        this.combatState.encounterTimer = 0;
        this.combatState.maxEncounterTimer = 0;
      }

      events.emit('combat:enemy_spawned', {
        enemy: this.combatState.activeEnemy,
        stageId: stage.id,
        encounterIndex: encounterIdx,
      });
    } finally {
      this.isSpawning = false;
    }
  }

  public applyDamageToEnemy(rawDamage: number): { appliedHpDamage: number; appliedShieldDamage: number } {
    const enemy = this.combatState.activeEnemy;
    if (!enemy || enemy.currentHp <= 0) return { appliedHpDamage: 0, appliedShieldDamage: 0 };

    let dmg = rawDamage;

    // 1. Damage reduction mechanic (-50% damage taken)
    if (enemy.isDamageReductionActive) {
      dmg = Math.max(1, Math.floor(dmg * 0.5));
    }

    let shieldDmg = 0;
    // 2. Shield mechanic
    if (enemy.shieldHp && enemy.shieldHp > 0) {
      shieldDmg = Math.min(enemy.shieldHp, dmg);
      enemy.shieldHp -= shieldDmg;
      dmg -= shieldDmg;
    }

    const hpDmg = Math.min(enemy.currentHp, dmg);
    enemy.currentHp = Math.max(0, enemy.currentHp - hpDmg);

    // 3. Trigger boss mechanics if thresholds met
    if (enemy.isBoss && enemy.specialMechanic) {
      if (enemy.specialMechanic === 'shield' && enemy.currentHp <= enemy.maxHp * 0.5 && !enemy.maxShieldHp) {
        enemy.maxShieldHp = Math.max(10, Math.floor(enemy.maxHp * 0.25));
        enemy.shieldHp = enemy.maxShieldHp;
        events.emit('combat:boss_mechanic', { bossId: enemy.id, mechanic: 'shield', active: true });
      } else if (enemy.specialMechanic === 'enrage' && enemy.currentHp <= enemy.maxHp * 0.35 && !enemy.isEnraged) {
        enemy.isEnraged = true;
        events.emit('combat:boss_mechanic', { bossId: enemy.id, mechanic: 'enrage', active: true });
      } else if (enemy.specialMechanic === 'damage_reduction' && enemy.currentHp <= enemy.maxHp * 0.6 && !enemy.isDamageReductionActive && !enemy.damageReductionUsed) {
        enemy.isDamageReductionActive = true;
        enemy.damageReductionTimer = 3.0;
        enemy.damageReductionUsed = true;
        events.emit('combat:boss_mechanic', { bossId: enemy.id, mechanic: 'damage_reduction', active: true });
      }
    }

    return { appliedHpDamage: hpDmg, appliedShieldDamage: shieldDmg };
  }

  /**
   * Manual Player Attack on the Active Enemy
   */
  public attack(x?: number, y?: number): AttackActionResult {
    if (this.combatState.isPaused) {
      return {
        damage: 0,
        isCrit: false,
        powerGained: 0,
        goldGained: 0,
        enemyDied: false,
        remainingHp: this.combatState.activeEnemy?.currentHp || 0,
      };
    }

    const coords = (x !== undefined && y !== undefined) ? { x, y } : undefined;
    const trainResult: TrainResult = TrainingSystem.train(coords);
    const state = store.get();

    if (!this.combatState.activeEnemy || this.isResolvingDeath) {
      return {
        damage: 0,
        isCrit: trainResult.isCrit,
        powerGained: trainResult.powerGained,
        goldGained: trainResult.goldGained,
        enemyDied: false,
        remainingHp: this.combatState.activeEnemy?.currentHp || 0,
      };
    }

    // Calculate manual combat damage (combines click power, combo and surge buffs)
    let damage = Math.max(trainResult.powerGained, 5);

    // Apply boss retry boost if active
    if (state.campaign.bossRetryState?.retryBoostActive && this.combatState.activeEnemy.isBoss) {
      damage = Math.floor(damage * 1.25);
    }

    // Apply damage through defense and mechanics
    const enemy = this.combatState.activeEnemy;
    this.applyDamageToEnemy(damage);

    events.emit('combat:player_attack', {
      damage,
      isCrit: trainResult.isCrit,
      remainingHp: enemy.currentHp,
      enemyId: enemy.id,
      x,
      y,
    });

    let enemyDied = false;
    if (enemy.currentHp <= 0 && !this.isResolvingDeath) {
      enemyDied = true;
      this.handleEnemyDefeat();
    }

    return {
      damage,
      isCrit: trainResult.isCrit,
      powerGained: trainResult.powerGained,
      goldGained: trainResult.goldGained,
      enemyDied,
      remainingHp: enemy.currentHp,
    };
  }

  /**
   * Calculate current player auto-attack DPS (Passive Power + Heroes + Auras)
   */
  public calculateAutoDps(state?: GameStateData): number {
    const currentState = state || store.get();
    const metrics = EconomyEngine.calculateMetrics(currentState);
    
    // Auto combat DPS derives directly from passive income power
    let dps = Math.max(metrics.passivePowerPerSec, 10);

    // Apply boss retry boost (+25%) if active
    if (currentState.campaign?.bossRetryState?.retryBoostActive && this.combatState.activeEnemy?.isBoss) {
      dps = Math.floor(dps * 1.25);
    }

    return dps;
  }

  /**
   * Ticks the combat simulation via delta time (called by GameLoop)
   */
  public update(rawDt: number): void {
    if (this.combatState.isPaused) {
      return;
    }

    const dt = Math.max(0, rawDt);

    // 0. Handle death transition cooldown
    if (this.isResolvingDeath) {
      if (this.deathTransitionTimer > 0) {
        this.deathTransitionTimer -= dt;
        if (this.deathTransitionTimer <= 0) {
          this.isResolvingDeath = false;
          this.spawnCurrentEncounter();
        }
      }
      return;
    }

    if (!this.combatState.activeEnemy) {
      this.spawnCurrentEncounter();
      return;
    }

    // Update damage reduction timer if active
    if (this.combatState.activeEnemy?.isDamageReductionActive && this.combatState.activeEnemy.damageReductionTimer) {
      this.combatState.activeEnemy.damageReductionTimer -= dt;
      if (this.combatState.activeEnemy.damageReductionTimer <= 0) {
        this.combatState.activeEnemy.isDamageReductionActive = false;
        events.emit('combat:boss_mechanic', { bossId: this.combatState.activeEnemy.id, mechanic: 'damage_reduction', active: false });
      }
    }

    // 1. Boss Timer Countdown
    if (this.combatState.isTimerActive) {
      this.combatState.encounterTimer -= dt;
      if (this.combatState.encounterTimer <= 0) {
        this.handleBossTimeout();
        return;
      }
    }

    // 2. Hero Party Active Skills Trigger
    if (this.combatState.activeEnemy && this.combatState.activeEnemy.currentHp > 0 && !this.isResolvingDeath) {
      this.updateHeroSkills(dt);
    }

    // 3. Auto DPS calculation and damage application
    if (this.combatState.autoAttackEnabled && this.combatState.activeEnemy && this.combatState.activeEnemy.currentHp > 0) {
      const state = store.get();
      const dps = this.calculateAutoDps(state);

      // Check Samsara Rush
      CampaignProgressionSystem.checkSamsaraRush(state, dps);

      const enemy = this.combatState.activeEnemy;

      // Samsara Rush fast-kill on trivial enemies
      if (state.campaign?.campaignMode === 'rush' && dps >= enemy.maxHp * 3) {
        enemy.currentHp = 0;
        this.deathTransitionTimer = 0.05;
        events.emit('combat:samsara_rush_kill', {
          enemyId: enemy.id,
          stageId: this.combatState.stageId,
        });
        this.handleEnemyDefeat();
        return;
      }

      const autoDamage = dps * dt;
      this.applyDamageToEnemy(autoDamage);

      // Auto-attack visual/event cadence (emits pulse every ~0.35s)
      this.autoAttackTimer += dt;
      if (this.autoAttackTimer >= this.autoAttackCadence) {
        this.autoAttackTimer -= this.autoAttackCadence;
        const tickDmg = Math.max(1, Math.floor(dps * this.autoAttackCadence));
        events.emit('combat:auto_attack', {
          damage: tickDmg,
          isCrit: false,
          remainingHp: enemy.currentHp,
          enemyId: enemy.id,
        });
      }

      // Check for death
      if (enemy.currentHp <= 0 && !this.isResolvingDeath) {
        this.handleEnemyDefeat();
      }
    }
  }

  private heroSkillTimers: Record<string, number> = {};

  private updateHeroSkills(dt: number): void {
    const party = HeroSystem.getActiveParty(3);
    const enemy = this.combatState.activeEnemy;
    if (!enemy || party.length === 0) return;

    for (const member of party) {
      const hero = member.hero;
      const skill = hero.skill;
      if (!skill) continue;

      this.heroSkillTimers[hero.id] = (this.heroSkillTimers[hero.id] || 0) + dt;

      if (this.heroSkillTimers[hero.id] >= skill.cooldownSeconds) {
        this.heroSkillTimers[hero.id] = 0;
        this.executeHeroSkill(hero, member.stars);
      }
    }
  }

  private executeHeroSkill(hero: HeroDefinition, stars: number): void {
    const enemy = this.combatState.activeEnemy;
    if (!enemy || enemy.currentHp <= 0 || this.isResolvingDeath) return;

    const skill = hero.skill;
    const starMult = getHeroStarMultiplier(stars);
    const state = store.get();
    const metrics = EconomyEngine.calculateMetrics(state);
    const dps = this.calculateAutoDps(state);

    let damage = 0;
    let gold = 0;
    let power = 0;

    switch (skill.type) {
      case 'direct_damage': {
        damage = Math.max(10, Math.floor(dps * skill.multiplier * starMult * 0.4));
        this.applyDamageToEnemy(damage);
        break;
      }
      case 'gold_burst': {
        gold = Math.max(5, Math.floor((metrics.passiveGoldPerSec || 10) * skill.multiplier * starMult * 2));
        store.set((draft) => { draft.gold += gold; });
        break;
      }
      case 'power_burst': {
        power = Math.max(5, Math.floor((metrics.passivePowerPerSec || 10) * skill.multiplier * starMult * 2));
        store.set((draft) => { draft.power += power; });
        break;
      }
      case 'crit_mark': {
        damage = Math.max(10, Math.floor(dps * skill.multiplier * starMult * 0.6));
        this.applyDamageToEnemy(damage);
        break;
      }
    }

    events.emit('combat:hero_skill', {
      heroId: hero.id,
      heroName: hero.nameKey,
      skillName: skill.nameKey,
      skillIcon: skill.icon,
      type: skill.type,
      damage,
      gold,
      power,
      remainingHp: enemy.currentHp
    });

    if (enemy.currentHp <= 0 && !this.isResolvingDeath) {
      this.handleEnemyDefeat();
    }
  }

  /**
   * Resolves enemy defeat atomically
   */
  private handleEnemyDefeat(immediate: boolean = false): void {
    if (this.isResolvingDeath) return;
    this.isResolvingDeath = true;

    const enemy = this.combatState.activeEnemy;
    if (enemy) {
      enemy.currentHp = 0;
    }

    sound.playEnemyHit();

    // Process progression rewards & stage advancement
    store.set((draft) => {
      const result: DefeatEnemyResult = CampaignProgressionSystem.onEnemyDefeated(draft, enemy?.id, enemy?.isBoss);

      events.emit('combat:reward_dropped', {
        rewards: result.rewards,
      });

      events.emit('combat:enemy_killed', {
        enemyId: enemy?.id || 'unknown',
        rewards: result.rewards,
        stageCleared: result.stageCleared,
        worldCleared: result.worldCleared,
      });
    });

    if (immediate) {
      this.isResolvingDeath = false;
      this.spawnCurrentEncounter();
    } else {
      // Set transition delay for death animation & reward flyout
      this.deathTransitionTimer = this.deathTransitionDuration;
    }
  }

  /**
   * Handles boss failure on timer expiry
   */
  private handleBossTimeout(): void {
    if (this.isResolvingDeath) return;
    this.isResolvingDeath = true;

    sound.playDefeat();

    store.set((draft) => {
      CampaignProgressionSystem.onBossFailed(draft);
    });

    // Fall back to farm encounter after brief transition
    this.deathTransitionTimer = this.deathTransitionDuration;
  }

  /**
   * Resets combat state to a specific stage (e.g. on load or test)
   */
  public resetToStage(stageId: string): void {
    store.set((draft) => {
      const stage = getCampaignStageById(stageId);
      if (stage) {
        draft.campaign.currentStageId = stage.id;
        draft.campaign.currentWorldId = stage.worldId;
        draft.campaign.currentEncounter = 1;
      }
    });
    this.isResolvingDeath = false;
    this.deathTransitionTimer = 0;
    this.spawnCurrentEncounter();
  }
}

export const campaignCombatService = CampaignCombatService.getInstance();
