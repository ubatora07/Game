import { GameStateData } from '../core/GameState';
import { CampaignStage, CampaignRewards } from '../content/campaignTypes';
import {
  getCampaignStageById,
  getNextStageId,
  getPreviousStageId,
} from '../content/campaignStages';
import { getCampaignEnemyById } from '../content/campaignEnemies';
import { getCampaignWorldById } from '../content/campaignWorlds';
import { events } from '../core/EventBus';

export interface DefeatEnemyResult {
  rewards: CampaignRewards;
  isFirstClear: boolean;
  encounterFinished: boolean;
  stageCleared: boolean;
  worldCleared: boolean;
  nextStageId?: string;
  nextWorldId?: number;
}

export interface DefeatEnemyOptions {
  emitEvents?: boolean;
}

export interface BossFailureResult {
  bossId: string;
  failedStageId: string;
  fallbackStageId: string;
}

export interface BossFailureOptions {
  emitEvents?: boolean;
}

export class CampaignProgressionSystem {
  /**
   * Initializes or repairs campaign state defaults if missing.
   */
  public static ensureCampaignState(state: GameStateData): void {
    if (!state.campaign) {
      state.campaign = {
        currentWorldId: 1,
        currentStageId: '1-1',
        currentEncounter: 1,
        highestWorldReached: 1,
        highestStageReached: '1-1',
        firstClears: [],
        campaignMode: 'progress',
        autoAdvance: true,
        farmStageId: '1-1',
        bossRetryState: null,
      };
    }
  }

  /**
   * Returns the current stage config.
   */
  public static getCurrentStage(state: GameStateData): CampaignStage {
    this.ensureCampaignState(state);
    const stage = getCampaignStageById(state.campaign.currentStageId);
    if (!stage) {
      // Fallback to 1-1
      state.campaign.currentStageId = '1-1';
      state.campaign.currentWorldId = 1;
      return getCampaignStageById('1-1')!;
    }
    return stage;
  }

  /**
   * Check if the current stage is a first-time clear.
   */
  public static isFirstClear(state: GameStateData, stageId: string): boolean {
    this.ensureCampaignState(state);
    return !state.campaign.firstClears.includes(stageId);
  }

  /**
   * Returns a breakdown of cumulative campaign rewards for analytics and UI.
   */
  public static getCampaignRewardBreakdown(state: GameStateData): {
    totalGold: number;
    totalPower: number;
    totalCrystals: number;
    bossesDefeated: number;
    firstClearsCount: number;
  } {
    this.ensureCampaignState(state);
    return {
      totalGold: state.stats.campaignGoldEarned || 0,
      totalPower: state.stats.campaignPowerEarned || 0,
      totalCrystals: state.stats.campaignCrystalsEarned || 0,
      bossesDefeated: state.stats.campaignBossesDefeated || 0,
      firstClearsCount: state.campaign.firstClears.length,
    };
  }

  /**
   * Called when an enemy is defeated in the current encounter.
   */
  public static onEnemyDefeated(
    state: GameStateData,
    enemyId?: string,
    isBossEntity?: boolean,
    options: DefeatEnemyOptions = {},
  ): DefeatEnemyResult {
    this.ensureCampaignState(state);
    const currentStage = this.getCurrentStage(state);
    const stageId = currentStage.id;
    const stageWasUncleared = this.isFirstClear(state, stageId);
    const willClearStage = state.campaign.currentEncounter >= currentStage.enemyCount;

    // First-clear rewards belong to a completed stage, never to its first encounter.
    // Until the final encounter, first-time stages pay their normal encounter reward.
    let rewards: CampaignRewards;
    const enemyConfig = enemyId ? getCampaignEnemyById(enemyId) : null;
    const rewardMult = enemyConfig?.rewardMultiplier || 1.0;

    if (willClearStage && stageWasUncleared) {
      rewards = { ...currentStage.firstClearRewards };
    } else if (isBossEntity || currentStage.isBoss) {
      rewards = { ...currentStage.baseRewards };
    } else {
      rewards = {
        gold: Math.max(1, Math.floor(currentStage.baseRewards.gold * rewardMult)),
        power: Math.max(1, Math.floor(currentStage.baseRewards.power * rewardMult)),
      };
    }

    // Apply rewards directly to GameState
    state.gold += rewards.gold || 0;
    state.power += rewards.power || 0;
    if (rewards.crystals) state.crystals += rewards.crystals;
    if (rewards.essence) state.essence += rewards.essence;
    if (rewards.souls) state.souls += rewards.souls;

    // Track lifetime and campaign-specific statistics
    state.stats.lifetimeGold += rewards.gold || 0;
    state.stats.lifetimePower += rewards.power || 0;
    state.stats.campaignGoldEarned = (state.stats.campaignGoldEarned || 0) + (rewards.gold || 0);
    state.stats.campaignPowerEarned = (state.stats.campaignPowerEarned || 0) + (rewards.power || 0);
    state.stats.campaignEnemiesDefeated = (state.stats.campaignEnemiesDefeated || 0) + 1;
    if (enemyConfig?.archetype === 'elite') {
      state.stats.campaignElitesDefeated = (state.stats.campaignElitesDefeated || 0) + 1;
    }
    if (rewards.crystals) {
      state.stats.campaignCrystalsEarned = (state.stats.campaignCrystalsEarned || 0) + rewards.crystals;
    }
    if (isBossEntity || currentStage.isBoss) {
      state.stats.campaignBossesDefeated = (state.stats.campaignBossesDefeated || 0) + 1;
    }

    let stageCleared = false;
    let worldCleared = false;
    let firstClearAwarded = false;
    let nextStageId: string | undefined;
    let nextWorldId: number | undefined;

    // Advance encounter or clear stage
    if (willClearStage) {
      stageCleared = true;
      state.stats.campaignStagesCleared = (state.stats.campaignStagesCleared || 0) + 1;
      state.campaign.currentEncounter = 1;

      if (stageWasUncleared) {
        state.campaign.firstClears.push(stageId);
        firstClearAwarded = true;
      }

      // A successful boss clear consumes any retry state/temporary retry boost.
      // Without this, a boosted retry could leak +25% damage into later bosses.
      if (isBossEntity || currentStage.isBoss) {
        state.campaign.bossRetryState = null;
      }

      // Update highest stage tracking
      const currentHighest = getCampaignStageById(state.campaign.highestStageReached);
      if (!currentHighest || currentStage.globalIndex > currentHighest.globalIndex) {
        state.campaign.highestStageReached = currentStage.id;
        state.campaign.highestWorldReached = Math.max(state.campaign.highestWorldReached, currentStage.worldId);
      }

      // Check if world is cleared
      const world = getCampaignWorldById(currentStage.worldId);
      if (world && currentStage.stageNumber === world.stageCount) {
        worldCleared = true;
        state.stats.campaignWorldsCleared = (state.stats.campaignWorldsCleared || 0) + 1;
      }

      // Advance to next stage if in progress mode and autoAdvance enabled
      if (state.campaign.campaignMode === 'progress' && state.campaign.autoAdvance) {
        nextStageId = getNextStageId(stageId);
        if (nextStageId) {
          const nextStage = getCampaignStageById(nextStageId);
          if (nextStage) {
            state.campaign.currentStageId = nextStageId;
            state.campaign.currentWorldId = nextStage.worldId;
            state.campaign.highestWorldReached = Math.max(state.campaign.highestWorldReached, nextStage.worldId);
            nextWorldId = nextStage.worldId;
            state.campaign.farmStageId = stageId; // Last safe cleared stage
          }
        } else {
          // Reached end of available content! Switch to farm mode on final stage
          state.campaign.campaignMode = 'farm';
          state.campaign.farmStageId = stageId;
        }
      } else if (state.campaign.campaignMode === 'farm') {
        // Stay on current farm stage, reset encounter
        state.campaign.currentEncounter = 1;
      }
    } else {
      // Next encounter in the same stage
      state.campaign.currentEncounter++;
    }

    const result: DefeatEnemyResult = {
      rewards,
      isFirstClear: firstClearAwarded,
      encounterFinished: true,
      stageCleared,
      worldCleared,
      nextStageId,
      nextWorldId,
    };

    if (options.emitEvents !== false) {
      this.emitDefeatEvents(result, stageId, currentStage.worldId);
    }

    return result;
  }

  /**
   * Emits progression events after the caller's state transaction has completed.
   * CombatService uses this to prevent listeners from observing a half-mutated GameState.
   */
  public static emitDefeatEvents(result: DefeatEnemyResult, stageId: string, worldId: number): void {
    events.emit('campaign:enemy_defeated', {
      stageId,
      rewards: result.rewards,
      isFirstClear: result.isFirstClear,
      stageCleared: result.stageCleared,
      worldCleared: result.worldCleared,
    });

    if (result.stageCleared) {
      events.emit('campaign:stage_cleared', {
        stageId,
        isFirstClear: result.isFirstClear,
        nextStageId: result.nextStageId,
      });
    }

    if (result.worldCleared) {
      events.emit('campaign:world_cleared', { worldId });
    }
  }

  /**
   * Called when the player fails to beat a boss (e.g. boss timer expires).
   */
  public static onBossFailed(
    state: GameStateData,
    options: BossFailureOptions = {},
  ): BossFailureResult {
    this.ensureCampaignState(state);
    const currentStage = this.getCurrentStage(state);

    state.campaign.campaignMode = 'boss_blocked';
    state.campaign.bossRetryState = {
      bossId: currentStage.bossId || `boss_${currentStage.id}`,
      failedAt: Date.now(),
      retryBoostActive: false,
    };

    // Fall back to the farm stage (or previous stage).
    const fallbackStage = state.campaign.farmStageId || getPreviousStageId(currentStage.id) || '1-1';
    state.campaign.currentStageId = fallbackStage;
    state.campaign.currentWorldId = getCampaignStageById(fallbackStage)?.worldId || state.campaign.currentWorldId;
    state.campaign.currentEncounter = 1;

    const result: BossFailureResult = {
      bossId: state.campaign.bossRetryState.bossId,
      failedStageId: currentStage.id,
      fallbackStageId: fallbackStage,
    };
    if (options.emitEvents !== false) {
      this.emitBossFailedEvent(result);
    }
    return result;
  }

  public static emitBossFailedEvent(result: BossFailureResult): void {
    events.emit('campaign:boss_failed', result);
  }

  /**
   * Retries the boss stage when the player is ready.
   */
  public static retryBoss(state: GameStateData, applyBoost = false): boolean {
    this.ensureCampaignState(state);
    if (!state.campaign.bossRetryState) return false;

    const highestStage = getCampaignStageById(state.campaign.highestStageReached);
    if (!highestStage) return false;

    // Check if next stage after highest stage is the boss stage
    const bossStageId = getNextStageId(state.campaign.farmStageId) || state.campaign.highestStageReached;
    const bossStage = getCampaignStageById(bossStageId);

    if (!bossStage || !bossStage.isBoss) return false;

    state.campaign.currentStageId = bossStage.id;
    state.campaign.currentWorldId = bossStage.worldId;
    state.campaign.currentEncounter = 1;
    state.campaign.campaignMode = 'progress';
    
    if (state.campaign.bossRetryState) {
      state.campaign.bossRetryState.retryBoostActive = applyBoost;
    }

    events.emit('campaign:boss_retry', {
      stageId: bossStage.id,
      retryBoostActive: applyBoost,
    });

    return true;
  }

  /**
   * Manually changes campaign mode ('progress' vs 'farm').
   */
  public static setCampaignMode(state: GameStateData, mode: 'progress' | 'farm'): void {
    this.ensureCampaignState(state);
    state.campaign.campaignMode = mode;
    if (mode === 'farm') {
      state.campaign.currentEncounter = 1;
    }
    events.emit('campaign:mode_changed', { mode });
  }

  /**
   * Toggles auto-advance to next stages.
   */
  public static toggleAutoAdvance(state: GameStateData): boolean {
    this.ensureCampaignState(state);
    state.campaign.autoAdvance = !state.campaign.autoAdvance;
    events.emit('campaign:auto_advance_toggled', { autoAdvance: state.campaign.autoAdvance });
    return state.campaign.autoAdvance;
  }

  /**
   * Evaluates if Samsara Rush should be enabled after Reincarnation.
   */
  public static shouldSamsaraRush(state: GameStateData, playerDps: number): boolean {
    this.ensureCampaignState(state);
    const currentStage = this.getCurrentStage(state);
    return playerDps >= currentStage.baseHp * 15 && state.reincarnationCount > 0;
  }

  public static checkSamsaraRush(state: GameStateData, playerDps: number): boolean {
    const isRush = this.shouldSamsaraRush(state, playerDps);
    const currentStage = this.getCurrentStage(state);

    if (isRush && state.campaign.campaignMode !== 'rush') {
      state.campaign.campaignMode = 'rush';
      events.emit('campaign:rush_started', { stageId: currentStage.id });
    } else if (!isRush && state.campaign.campaignMode === 'rush') {
      state.campaign.campaignMode = 'progress';
      events.emit('campaign:rush_ended', { stageId: currentStage.id });
    }

    return isRush;
  }

  /**
   * Resets campaign stage progression on Reincarnation while preserving records.
   */
  public static onReincarnationReset(state: GameStateData): void {
    this.ensureCampaignState(state);
    state.campaign.currentWorldId = 1;
    state.campaign.currentStageId = '1-1';
    state.campaign.currentEncounter = 1;
    state.campaign.campaignMode = 'rush'; // Start in Rush mode for fast early traversal
    state.campaign.farmStageId = '1-1';
    state.campaign.bossRetryState = null;
    // Note: highestWorldReached, highestStageReached, and firstClears are PRESERVED!
  }
}
