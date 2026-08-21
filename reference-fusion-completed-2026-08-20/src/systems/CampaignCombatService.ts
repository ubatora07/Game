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
import { petSystem } from './PetSystem';
import { modifierResolver } from '../core/modifiers/ModifierResolver';
import { partyTeamSystem } from './PartyTeamSystem';
import { CombatPipeline } from './combat/CombatPipeline';
import { CampaignLootSystem } from './CampaignLootSystem';
import { craftingEquipmentSystem } from './CraftingEquipmentSystem';

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
  attackDamage: number;
  attacksPerSecond: number;
}

export interface ActiveHeroCombatEntity {
  maxHp: number;
  currentHp: number;
  defense: number;
}

export type CampaignCombatPhase = 'run' | 'combat' | 'reward' | 'boss_failed' | 'hero_defeated';

export interface CampaignCombatState {
  phase: CampaignCombatPhase;
  phaseTimer: number;
  stageId: string;
  worldId: number;
  encounterIndex: number;
  totalEncounters: number;
  activeEnemy: ActiveCombatEntity | null;
  hero: ActiveHeroCombatEntity;
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
  private readonly rewardTransitionDuration: number = 0.18;
  private readonly runTransitionDuration: number = 0.14;
  private autoAttackTimer: number = 0;
  private autoAttackSequence: number = 0;
  private readonly baseAutoAttacksPerSecond: number = 1 / 0.35;
  private readonly maxAutoAttackCatchUpSteps: number = 12;
  private enemyAttackTimer: number = 0;
  private enemyAttackSequence: number = 0;
  private heroSkillSequence: Record<string, number> = {};
  private readonly maxEnemyAttackCatchUpSteps: number = 8;
  private readonly maxHeroSkillCatchUpSteps: number = 4;
  private isSpawning: boolean = false;

  private constructor() {
    const state = store.get();
    CampaignProgressionSystem.ensureCampaignState(state);
    const stage = CampaignProgressionSystem.getCurrentStage(state);

    this.combatState = {
      phase: 'combat',
      phaseTimer: 0,
      stageId: stage.id,
      worldId: stage.worldId,
      encounterIndex: state.campaign.currentEncounter || 1,
      totalEncounters: stage.enemyCount,
      activeEnemy: null,
      hero: { maxHp: 120, currentHp: 120, defense: 0 },
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
      this.autoAttackTimer = 0;
      this.autoAttackSequence = 0;
      this.enemyAttackTimer = 0;
      this.enemyAttackSequence = 0;
      this.combatState.hero = this.createHeroCombatEntity(currentState, stage.globalIndex);
      this.setPhase('combat', 0);

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
            ...this.createEnemyAttackProfile(hp, stage.globalIndex, 'boss', true),
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
        // Normal / Elite Encounter. Stages that author an elite in their pool reserve
        // the final encounter for it; otherwise a short enemyCount could make appended
        // elites unreachable forever (e.g. 3 encounters vs a 5-entry pool).
        const authoredEnemies = stage.enemyPool.map((id) => getCampaignEnemyById(id));
        const eliteCandidates = authoredEnemies.filter((candidate) => candidate.archetype === 'elite');
        const normalCandidates = authoredEnemies.filter((candidate) => candidate.archetype !== 'elite');
        const shouldSpawnElite = eliteCandidates.length > 0 && encounterIdx >= stage.enemyCount;
        const candidates = shouldSpawnElite ? eliteCandidates : (normalCandidates.length > 0 ? normalCandidates : authoredEnemies);
        const candidateIndex = Math.max(0, encounterIdx - 1) % Math.max(1, candidates.length);
        const enemy = candidates[candidateIndex] || getCampaignEnemyById('forest_goblin');
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
          ...this.createEnemyAttackProfile(hp, stage.globalIndex, enemy.archetype, false),
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


  private createHeroCombatEntity(state: GameStateData, globalStageIndex: number): ActiveHeroCombatEntity {
    const metrics = EconomyEngine.calculateMetrics(state);
    // Keep campaign durability lightweight and derived from existing progression.
    // Equipment/title/pet/etc. HP and defense are layered through ModifierResolver.
    const primaryLevel = Math.max(1, partyTeamSystem.getCharacter('char_1').level || 1);
    const progressionHp = 120
      + state.rankIndex * 60
      + (primaryLevel - 1) * 12
      + Math.sqrt(Math.max(0, metrics.towerCombatPower)) * 18
      + Math.max(0, globalStageIndex - 1) * 2;
    const context = {
      characterClass: this.getPrimaryCharacterClass(),
      currentWorld: this.combatState.worldId,
      currentStage: this.combatState.stageId,
    };
    const maxHp = Math.max(1, Math.floor(modifierResolver.resolve('maxHp', progressionHp, context)));
    const defense = Math.max(0, modifierResolver.resolve('defense', 0, context));
    return { maxHp, currentHp: maxHp, defense };
  }

  private createEnemyAttackProfile(
    enemyMaxHp: number,
    globalStageIndex: number,
    archetype: string,
    isBoss: boolean,
  ): Pick<ActiveCombatEntity, 'attackDamage' | 'attacksPerSecond'> {
    const archetypeSpeed: Record<string, number> = {
      melee: 0.8,
      ranged: 0.7,
      tank: 0.55,
      magic: 0.65,
      elite: 0.9,
      boss: 0.72,
    };
    const archetypeDamage: Record<string, number> = {
      melee: 1.0,
      ranged: 0.9,
      tank: 1.25,
      magic: 1.08,
      elite: 1.18,
      boss: 1.3,
    };
    const baseDamage = Math.max(2, Math.sqrt(Math.max(1, enemyMaxHp)) * 0.55 + globalStageIndex * 0.7);
    const damageMultiplier = archetypeDamage[archetype] ?? (isBoss ? 1.3 : 1.0);
    return {
      attackDamage: Math.max(1, baseDamage * damageMultiplier),
      attacksPerSecond: Math.max(0.35, archetypeSpeed[archetype] ?? (isBoss ? 0.72 : 0.75)),
    };
  }

  private executeEnemyAttack(): boolean {
    const enemy = this.combatState.activeEnemy;
    const hero = this.combatState.hero;
    if (!enemy || enemy.currentHp <= 0 || hero.currentHp <= 0 || this.isResolvingDeath) return false;

    this.enemyAttackSequence += 1;
    const enragedMultiplier = enemy.isEnraged ? 1.45 : 1;
    const rawDamage = enemy.attackDamage * enragedMultiplier;
    const stage = getCampaignStageById(this.combatState.stageId);
    const defenseScale = 100 + (stage?.globalIndex || 1) * 5;
    const mitigation = Math.min(0.75, hero.defense / Math.max(1, hero.defense + defenseScale));
    const damage = Math.max(1, Math.min(hero.currentHp, Math.floor(rawDamage * (1 - mitigation))));
    hero.currentHp = Math.max(0, hero.currentHp - damage);

    events.emit('combat:enemy_attack', {
      enemyId: enemy.id,
      damage,
      remainingHeroHp: hero.currentHp,
      heroMaxHp: hero.maxHp,
    });

    if (hero.currentHp <= 0) {
      this.handleHeroDefeat();
      return true;
    }
    return false;
  }

  private handleHeroDefeat(): void {
    if (this.isResolvingDeath) return;
    this.isResolvingDeath = true;
    this.combatState.hero.currentHp = 0;
    const enemy = this.combatState.activeEnemy;
    const defeatedOnBoss = Boolean(enemy?.isBoss);

    sound.playDefeat();
    if (defeatedOnBoss) {
      let failureResult: ReturnType<typeof CampaignProgressionSystem.onBossFailed> | null = null;
      store.set((draft) => {
        failureResult = CampaignProgressionSystem.onBossFailed(draft, { emitEvents: false });
      });
      if (failureResult) CampaignProgressionSystem.emitBossFailedEvent(failureResult);
    }

    events.emit('combat:hero_defeated', {
      enemyId: enemy?.id || 'unknown',
      stageId: this.combatState.stageId,
      isBoss: defeatedOnBoss,
    });

    this.deathTransitionTimer = 0.45;
    this.setPhase('hero_defeated', this.deathTransitionTimer);
  }

  public applyDamageToEnemy(rawDamage: number): { appliedHpDamage: number; appliedShieldDamage: number } {
    const enemy = this.combatState.activeEnemy;
    if (!enemy || enemy.currentHp <= 0 || !Number.isFinite(rawDamage) || rawDamage <= 0) {
      return { appliedHpDamage: 0, appliedShieldDamage: 0 };
    }

    let dmg = rawDamage;

    // 1. Damage reduction mechanic (-50% damage taken). Rendering never decides
    // mitigation; every damage source reaches this exact simulation path.
    if (enemy.isDamageReductionActive) {
      dmg = Math.max(1, Math.floor(dmg * 0.5));
    }

    let shieldDmg = 0;
    let hpDmg = 0;

    // 2. Existing shield absorbs damage before HP.
    if ((enemy.shieldHp || 0) > 0) {
      const absorbed = Math.min(enemy.shieldHp || 0, dmg);
      enemy.shieldHp = Math.max(0, (enemy.shieldHp || 0) - absorbed);
      shieldDmg += absorbed;
      dmg -= absorbed;
    }

    // 3. A shield boss cannot be one-shot through its authored threshold. When an
    // attack crosses 50%, clamp HP to the threshold, raise the shield, and route the
    // remaining damage from that same action into the new shield (without HP spill).
    if (
      dmg > 0
      && enemy.isBoss
      && enemy.specialMechanic === 'shield'
      && !enemy.maxShieldHp
    ) {
      const thresholdHp = Math.max(1, Math.ceil(enemy.maxHp * 0.5));
      if (enemy.currentHp > thresholdHp && enemy.currentHp - dmg <= thresholdHp) {
        const toThreshold = enemy.currentHp - thresholdHp;
        hpDmg += toThreshold;
        enemy.currentHp = thresholdHp;
        dmg = Math.max(0, dmg - toThreshold);

        enemy.maxShieldHp = Math.max(10, Math.floor(enemy.maxHp * 0.25));
        enemy.shieldHp = enemy.maxShieldHp;
        events.emit('combat:boss_mechanic', { bossId: enemy.id, mechanic: 'shield', active: true });

        if (dmg > 0) {
          const absorbed = Math.min(enemy.shieldHp, dmg);
          enemy.shieldHp -= absorbed;
          shieldDmg += absorbed;
          dmg -= absorbed;
        }

        return { appliedHpDamage: hpDmg, appliedShieldDamage: shieldDmg };
      }
    }

    // 4. Any damage left after shields reaches HP.
    if (dmg > 0) {
      const applied = Math.min(enemy.currentHp, dmg);
      enemy.currentHp = Math.max(0, enemy.currentHp - applied);
      hpDmg += applied;
    }

    // 5. Trigger threshold mechanics after the resolved HP hit.
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

    const enemy = this.combatState.activeEnemy;
    const primaryLevel = Math.max(1, partyTeamSystem.getCharacter('char_1').level || 1);
    let baseDamage = Math.max(trainResult.powerGained, 5) * (1 + (primaryLevel - 1) * 0.03);

    // Retry boost belongs to the action pipeline rather than the renderer.
    if (state.campaign.bossRetryState?.retryBoostActive && enemy.isBoss) {
      baseDamage *= 1.25;
    }

    // TrainingSystem has already rolled/applied the click critical hit. We preserve
    // that outcome and apply the shared attack/source/target modifier layers once.
    const resolution = CombatPipeline.resolveAttack({
      source: 'manual',
      baseDamage,
      target: this.toTargetContext(enemy),
      stageId: this.combatState.stageId,
      worldId: this.combatState.worldId,
      characterClass: this.getPrimaryCharacterClass(),
      forceCrit: trainResult.isCrit,
      attackAlreadyIncludesCrit: true,
    });
    const applied = this.applyDamageToEnemy(resolution.damage);
    const damage = Math.floor(applied.appliedHpDamage + applied.appliedShieldDamage);

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

  private getPrimaryCharacterClass(): string | undefined {
    return partyTeamSystem.getCharacter('char_1').classId || undefined;
  }

  private toTargetContext(enemy: ActiveCombatEntity): { id: string; isBoss: boolean; isElite: boolean } {
    return {
      id: enemy.id,
      isBoss: enemy.isBoss,
      isElite: !enemy.isBoss && enemy.archetype === 'elite',
    };
  }

  private getBaseAutoDps(state: GameStateData): number {
    const primaryLevel = Math.max(1, partyTeamSystem.getCharacter('char_1').level || 1);
    const levelMultiplier = 1 + (primaryLevel - 1) * 0.03;
    let dps = Math.max(EconomyEngine.calculateMetrics(state).passivePowerPerSec, 10) * levelMultiplier;
    if (state.campaign?.bossRetryState?.retryBoostActive && this.combatState.activeEnemy?.isBoss) {
      dps *= 1.25;
    }
    return dps;
  }

  public getAutoAttacksPerSecond(): number {
    const enemy = this.combatState.activeEnemy;
    const context = {
      characterClass: this.getPrimaryCharacterClass(),
      isBoss: enemy?.isBoss ?? false,
      isElite: enemy?.archetype === 'elite',
      currentWorld: this.combatState.worldId,
      currentStage: this.combatState.stageId,
    };
    return Math.min(8, Math.max(0.5, modifierResolver.resolve('attackSpeed', this.baseAutoAttacksPerSecond, context)));
  }

  /**
   * Expected sustained auto-attack DPS. Damage is still applied as discrete attack
   * actions, so this value is a tooltip/balance metric rather than a per-frame tick.
   */
  public calculateAutoDps(state?: GameStateData): number {
    const currentState = state || store.get();
    const enemy = this.combatState.activeEnemy;
    if (!enemy) return this.getBaseAutoDps(currentState);

    const metrics = EconomyEngine.calculateMetrics(currentState);
    const attacksPerSecond = this.getAutoAttacksPerSecond();
    const baseDamagePerHit = this.getBaseAutoDps(currentState) / this.baseAutoAttacksPerSecond;
    const resolution = CombatPipeline.resolveAttack({
      source: 'auto',
      baseDamage: baseDamagePerHit,
      target: this.toTargetContext(enemy),
      stageId: this.combatState.stageId,
      worldId: this.combatState.worldId,
      characterClass: this.getPrimaryCharacterClass(),
      critChance: metrics.critChance,
      critMultiplier: metrics.critMultiplier,
      canCrit: false,
    });
    const expectedCritFactor = CombatPipeline.expectedCritFactor(resolution.critChance, resolution.critMultiplier);
    return Math.max(0, resolution.preCritDamage * attacksPerSecond * expectedCritFactor);
  }

  private setPhase(phase: CampaignCombatPhase, timer: number): void {
    const changed = this.combatState.phase !== phase;
    this.combatState.phase = phase;
    this.combatState.phaseTimer = Math.max(0, timer);
    if (changed) {
      events.emit('combat:phase_changed', {
        phase,
        stageId: this.combatState.stageId,
        encounterIndex: this.combatState.encounterIndex,
      });
    }
  }

  private advanceTransition(dt: number): void {
    let remaining = dt;
    let safety = 0;

    while (this.isResolvingDeath && remaining >= 0 && safety < 4) {
      safety += 1;
      if (this.deathTransitionTimer > remaining) {
        this.deathTransitionTimer -= remaining;
        this.combatState.phaseTimer = this.deathTransitionTimer;
        return;
      }

      remaining = Math.max(0, remaining - this.deathTransitionTimer);
      this.deathTransitionTimer = 0;
      this.combatState.phaseTimer = 0;

      if (this.combatState.phase === 'reward' || this.combatState.phase === 'boss_failed' || this.combatState.phase === 'hero_defeated') {
        this.combatState.activeEnemy = null;
        this.combatState.isTimerActive = false;
        this.deathTransitionTimer = this.runTransitionDuration;
        this.setPhase('run', this.deathTransitionTimer);
        if (remaining <= 0) return;
        continue;
      }

      if (this.combatState.phase === 'run') {
        this.isResolvingDeath = false;
        this.spawnCurrentEncounter();
      }
      return;
    }
  }

  private executeAutoAttack(state: GameStateData): boolean {
    const enemy = this.combatState.activeEnemy;
    if (!enemy || enemy.currentHp <= 0 || this.isResolvingDeath) return false;

    const metrics = EconomyEngine.calculateMetrics(state);
    const baseDamagePerHit = this.getBaseAutoDps(state) / this.baseAutoAttacksPerSecond;
    const sequence = this.autoAttackSequence;
    this.autoAttackSequence += 1;
    const roll = CombatPipeline.deterministicRoll(
      `${this.combatState.stageId}:${this.combatState.encounterIndex}:${enemy.id}:${sequence}`,
    );
    const resolution = CombatPipeline.resolveAttack({
      source: 'auto',
      baseDamage: baseDamagePerHit,
      target: this.toTargetContext(enemy),
      stageId: this.combatState.stageId,
      worldId: this.combatState.worldId,
      characterClass: this.getPrimaryCharacterClass(),
      critChance: metrics.critChance,
      critMultiplier: metrics.critMultiplier,
      roll,
    });
    const applied = this.applyDamageToEnemy(Math.max(1, resolution.damage));
    const appliedDamage = Math.floor(applied.appliedHpDamage + applied.appliedShieldDamage);

    events.emit('combat:auto_attack', {
      damage: appliedDamage,
      isCrit: resolution.isCrit,
      remainingHp: enemy.currentHp,
      enemyId: enemy.id,
    });

    if (enemy.currentHp <= 0 && !this.isResolvingDeath) {
      this.handleEnemyDefeat();
      return true;
    }
    return false;
  }

  /**
   * Ticks the combat simulation via delta time (called by GameLoop)
   */
  public update(rawDt: number): void {
    if (this.combatState.isPaused) {
      return;
    }

    const dt = Math.max(0, rawDt);

    // 0. Reward/death -> short run -> next encounter. The transition consumes the
    // full dt so coarse simulation steps behave the same as high-FPS updates.
    if (this.isResolvingDeath) {
      this.advanceTransition(dt);
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

    // 2b. Active companion combat action. PetSystem tracks cooldown in ms.
    if (this.combatState.activeEnemy && this.combatState.activeEnemy.currentHp > 0 && !this.isResolvingDeath) {
      const petResult = petSystem.tickCombat(dt * 1000);
      if (petResult.triggered && petResult.damage && petResult.damage > 0) {
        const activePet = petSystem.getActivePet();
        const enemy = this.combatState.activeEnemy;
        const resolved = CombatPipeline.resolveAttack({
          source: 'pet',
          baseDamage: petResult.damage,
          target: this.toTargetContext(enemy),
          stageId: this.combatState.stageId,
          worldId: this.combatState.worldId,
          characterClass: this.getPrimaryCharacterClass(),
          canCrit: false,
        });
        const applied = this.applyDamageToEnemy(resolved.damage);
        const appliedDamage = Math.floor(applied.appliedHpDamage + applied.appliedShieldDamage);
        events.emit('combat:pet_action', {
          petId: activePet?.id || 'unknown_pet',
          actionName: petResult.action?.defaultName || 'Companion Attack',
          damage: appliedDamage,
          remainingHp: enemy.currentHp,
        });
        if (enemy.currentHp <= 0 && !this.isResolvingDeath) {
          this.handleEnemyDefeat();
          return;
        }
      }
    }

    // 3. Discrete auto attacks. Simulation damage and animation events now share
    // the exact same action cadence; no visual-only pseudo hits and no frame DPS.
    if (this.combatState.autoAttackEnabled && this.combatState.activeEnemy && this.combatState.activeEnemy.currentHp > 0) {
      const state = store.get();
      const dps = this.calculateAutoDps(state);

      const shouldRush = CampaignProgressionSystem.shouldSamsaraRush(state as GameStateData, dps);
      const rushModeNeedsUpdate = shouldRush
        ? state.campaign?.campaignMode !== 'rush'
        : state.campaign?.campaignMode === 'rush';
      if (rushModeNeedsUpdate) {
        store.set((draft) => {
          CampaignProgressionSystem.checkSamsaraRush(draft, dps);
        });
      }
      const currentState = store.get();
      const enemy = this.combatState.activeEnemy;

      if (currentState.campaign?.campaignMode === 'rush' && dps >= enemy.maxHp * 3) {
        enemy.currentHp = 0;
        events.emit('combat:samsara_rush_kill', {
          enemyId: enemy.id,
          stageId: this.combatState.stageId,
        });
        this.handleEnemyDefeat();
        return;
      }

      const cadence = 1 / this.getAutoAttacksPerSecond();
      this.autoAttackTimer += dt;
      let steps = 0;
      while (this.autoAttackTimer + 1e-9 >= cadence && steps < this.maxAutoAttackCatchUpSteps) {
        this.autoAttackTimer -= cadence;
        steps += 1;
        if (this.executeAutoAttack(state)) return;
      }

      // Prevent an extreme suspended-tab delta from causing an unbounded catch-up
      // storm. Normal live/offline progression remains time-based and FPS invariant.
      if (steps >= this.maxAutoAttackCatchUpSteps) {
        this.autoAttackTimer = Math.min(this.autoAttackTimer, cadence);
      }
    }

    // 4. Enemy AI uses the same time-based action model. Player actions resolve
    // first, so an enemy killed on this update cannot land a post-mortem hit.
    const enemy = this.combatState.activeEnemy;
    if (enemy && enemy.currentHp > 0 && this.combatState.hero.currentHp > 0 && !this.isResolvingDeath) {
      const cadence = 1 / Math.max(0.1, enemy.attacksPerSecond);
      this.enemyAttackTimer += dt;
      let steps = 0;
      while (this.enemyAttackTimer + 1e-9 >= cadence && steps < this.maxEnemyAttackCatchUpSteps) {
        this.enemyAttackTimer -= cadence;
        steps += 1;
        if (this.executeEnemyAttack()) return;
      }
      if (steps >= this.maxEnemyAttackCatchUpSteps) {
        this.enemyAttackTimer = Math.min(this.enemyAttackTimer, cadence);
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

      const cooldown = Math.max(0.05, skill.cooldownSeconds);
      this.heroSkillTimers[hero.id] = (this.heroSkillTimers[hero.id] || 0) + dt;

      let steps = 0;
      while (this.heroSkillTimers[hero.id] + 1e-9 >= cooldown && steps < this.maxHeroSkillCatchUpSteps) {
        this.heroSkillTimers[hero.id] -= cooldown;
        steps += 1;
        this.executeHeroSkill(hero, member.stars);
        if (this.isResolvingDeath || !this.combatState.activeEnemy || this.combatState.activeEnemy.currentHp <= 0) return;
      }

      if (steps >= this.maxHeroSkillCatchUpSteps) {
        this.heroSkillTimers[hero.id] = Math.min(this.heroSkillTimers[hero.id], cooldown);
      }
    }
  }

  private nextHeroSkillSequence(heroId: string): number {
    const next = this.heroSkillSequence[heroId] || 0;
    this.heroSkillSequence[heroId] = next + 1;
    return next;
  }

  private executeHeroSkill(hero: HeroDefinition, stars: number): void {
    const enemy = this.combatState.activeEnemy;
    if (!enemy || enemy.currentHp <= 0 || this.isResolvingDeath) return;

    const skill = hero.skill;
    const starMult = getHeroStarMultiplier(stars);
    const state = store.get();
    const metrics = EconomyEngine.calculateMetrics(state);
    let damage = 0;
    let gold = 0;
    let power = 0;

    switch (skill.type) {
      case 'direct_damage': {
        const resolved = CombatPipeline.resolveAttack({
          source: 'skill',
          baseDamage: Math.max(10, this.getBaseAutoDps(state) * skill.multiplier * starMult * 0.4),
          target: this.toTargetContext(enemy),
          stageId: this.combatState.stageId,
          worldId: this.combatState.worldId,
          characterClass: this.getPrimaryCharacterClass(),
          critChance: metrics.critChance,
          critMultiplier: metrics.critMultiplier,
          roll: CombatPipeline.deterministicRoll(
            `${this.combatState.stageId}:${this.combatState.encounterIndex}:${enemy.id}:${hero.id}:skill:${this.nextHeroSkillSequence(hero.id)}`,
          ),
        });
        const applied = this.applyDamageToEnemy(resolved.damage);
        damage = Math.floor(applied.appliedHpDamage + applied.appliedShieldDamage);
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
        const resolved = CombatPipeline.resolveAttack({
          source: 'skill',
          baseDamage: Math.max(10, this.getBaseAutoDps(state) * skill.multiplier * starMult * 0.6),
          target: this.toTargetContext(enemy),
          stageId: this.combatState.stageId,
          worldId: this.combatState.worldId,
          characterClass: this.getPrimaryCharacterClass(),
          critChance: metrics.critChance,
          critMultiplier: metrics.critMultiplier,
          forceCrit: true,
        });
        const applied = this.applyDamageToEnemy(resolved.damage);
        damage = Math.floor(applied.appliedHpDamage + applied.appliedShieldDamage);
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

  private calculateCombatXpReward(globalStageIndex: number, enemy: ActiveCombatEntity, stageCleared: boolean): number {
    const base = 10 * Math.pow(1.11, Math.max(0, globalStageIndex - 1));
    const enemyMultiplier = enemy.isBoss ? 4 : enemy.archetype === 'elite' ? 2.25 : 1;
    const clearMultiplier = stageCleared ? 1.2 : 1;
    return Math.max(1, Math.floor(base * enemyMultiplier * clearMultiplier));
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

    // Process the full reward/progression transaction first. Events are emitted only
    // after GameStore has committed/notified, so listeners never observe partial state.
    const defeatedStageId = this.combatState.stageId;
    const defeatedWorldId = this.combatState.worldId;
    const defeatedEncounterIndex = this.combatState.encounterIndex;
    const defeatedStage = getCampaignStageById(defeatedStageId);
    let resolvedResult!: DefeatEnemyResult;
    store.set((draft) => {
      resolvedResult = CampaignProgressionSystem.onEnemyDefeated(
        draft,
        enemy?.id,
        enemy?.isBoss,
        { emitEvents: false },
      );
    });
    const result = resolvedResult;

    CampaignProgressionSystem.emitDefeatEvents(result, defeatedStageId, defeatedWorldId);

    if (enemy && defeatedStage) {
      const xpReward = this.calculateCombatXpReward(defeatedStage.globalIndex, enemy, result.stageCleared);
      partyTeamSystem.grantCombatExperience(xpReward);
      const loot = CampaignLootSystem.rollEquipmentDrop({
        stageId: defeatedStageId,
        worldId: defeatedWorldId,
        globalStageIndex: defeatedStage.globalIndex,
        encounterIndex: defeatedEncounterIndex,
        enemyId: enemy.id,
        isBoss: enemy.isBoss,
        isElite: !enemy.isBoss && enemy.archetype === 'elite',
        isFirstClear: result.isFirstClear,
        stageCleared: result.stageCleared,
        characterClass: this.getPrimaryCharacterClass(),
        killSequence: store.get().stats.campaignEnemiesDefeated || 0,
      });
      if (loot.item) {
        craftingEquipmentSystem.addItemToInventory(loot.item);
        events.emit('combat:loot_dropped', {
          item: loot.item,
          stageId: defeatedStageId,
          enemyId: enemy.id,
        });
      }
    }

    events.emit('combat:reward_dropped', { rewards: result.rewards });
    events.emit('combat:enemy_killed', {
      enemyId: enemy?.id || 'unknown',
      rewards: result.rewards,
      stageCleared: result.stageCleared,
      worldCleared: result.worldCleared,
    });

    if (immediate) {
      this.isResolvingDeath = false;
      this.spawnCurrentEncounter();
    } else {
      this.deathTransitionTimer = this.rewardTransitionDuration;
      this.setPhase('reward', this.deathTransitionTimer);
    }
  }

  /**
   * Handles boss failure on timer expiry
   */
  private handleBossTimeout(): void {
    if (this.isResolvingDeath) return;
    this.isResolvingDeath = true;

    sound.playDefeat();

    let failureResult: ReturnType<typeof CampaignProgressionSystem.onBossFailed> | null = null;
    store.set((draft) => {
      failureResult = CampaignProgressionSystem.onBossFailed(draft, { emitEvents: false });
    });
    if (failureResult) CampaignProgressionSystem.emitBossFailedEvent(failureResult);

    // Failure feedback is followed by the same short travel phase before the
    // fallback farming encounter is spawned.
    this.deathTransitionTimer = this.rewardTransitionDuration;
    this.setPhase('boss_failed', this.deathTransitionTimer);
  }

  /**
   * Rebuilds the ephemeral combat state after a progression reset/rebirth.
   * The persisted campaign state is already authoritative at this point.
   */
  public resetAfterProgressionReset(): void {
    this.isResolvingDeath = false;
    this.deathTransitionTimer = 0;
    this.autoAttackTimer = 0;
    this.autoAttackSequence = 0;
    this.enemyAttackTimer = 0;
    this.enemyAttackSequence = 0;
    this.heroSkillSequence = {};
    this.heroSkillTimers = {};
    this.isSpawning = false;
    this.spawnCurrentEncounter();
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
    this.autoAttackTimer = 0;
    this.autoAttackSequence = 0;
    this.enemyAttackTimer = 0;
    this.enemyAttackSequence = 0;
    this.heroSkillSequence = {};
    this.heroSkillTimers = {};
    this.spawnCurrentEncounter();
  }
}

export const campaignCombatService = CampaignCombatService.getInstance();
