import { events } from '../../core/EventBus';

export interface StageFunnelStats {
  stageId: string;
  starts: number;
  clears: number;
  failures: number;
  bossStarts: number;
  bossClears: number;
  bossFailures: number;
}

export interface FirstSessionFunnel {
  firstEnemyKilledAt: number | null;
  stage1_3ClearedAt: number | null;
  firstBossDefeatedAt: number | null;
  world1CompletedAt: number | null;
  towerUnlockedAt: number | null;
  firstHeroUnlockedAt: number | null;
  rankSReachedAt: number | null;
  firstReincarnationAt: number | null;
}

export interface AggregatedAttackBatch {
  clickCount: number;
  critCount: number;
  totalDamage: number;
  startTime: number;
  endTime: number;
}

export class AnalyticsService {
  private static instance: AnalyticsService;

  // In-memory telemetry aggregates
  private stageFunnels: Map<string, StageFunnelStats> = new Map();
  private bossFailures: Map<string, number> = new Map();
  private firstSession: FirstSessionFunnel = {
    firstEnemyKilledAt: null,
    stage1_3ClearedAt: null,
    firstBossDefeatedAt: null,
    world1CompletedAt: null,
    towerUnlockedAt: null,
    firstHeroUnlockedAt: null,
    rankSReachedAt: null,
    firstReincarnationAt: null,
  };

  // Manual attack aggregation
  private pendingAttackBatch: AggregatedAttackBatch | null = null;
  private attackFlushTimer: number | null = null;
  private trackedEventsList: { name: string; params: Record<string, any>; timestamp: number }[] = [];

  private constructor() {
    this.bindEvents();
    this.setupBatchFlushInterval();
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  private setupBatchFlushInterval(): void {
    if (typeof window !== 'undefined') {
      this.attackFlushTimer = window.setInterval(() => {
        this.flushManualAttacks();
      }, 5000);
    }
  }

  private getOrCreateStageStats(stageId: string): StageFunnelStats {
    if (!this.stageFunnels.has(stageId)) {
      this.stageFunnels.set(stageId, {
        stageId,
        starts: 0,
        clears: 0,
        failures: 0,
        bossStarts: 0,
        bossClears: 0,
        bossFailures: 0,
      });
    }
    return this.stageFunnels.get(stageId)!;
  }

  private bindEvents(): void {
    // 1. Core Progression Events
    events.on('ascension:rankUp', (e) => {
      this.trackEvent('ascension', { rank: e.newRank, multiplier: e.multiplier });
      if (e.newRank === 'S' && !this.firstSession.rankSReachedAt) {
        this.firstSession.rankSReachedAt = Date.now();
        this.trackEvent('funnel_rank_s', { timestamp: Date.now() });
      }
    });

    events.on('upgrade:buy', (e) => {
      this.trackEvent('upgrade_purchase', { upgradeId: e.upgradeId, level: e.newLevel });
    });

    events.on('tower:floorClear', (e) => {
      if (e.floor === 1 && !this.firstSession.towerUnlockedAt) {
        this.firstSession.towerUnlockedAt = Date.now();
        this.trackEvent('funnel_tower_unlock', { timestamp: Date.now() });
      }
    });

    events.on('tower:bossDefeat', (e) => {
      this.trackEvent('tower_boss_defeat', { floor: e.floor, boss: e.bossName });
    });

    events.on('hero:unlocked', (e) => {
      this.trackEvent('hero_unlock', { heroId: e.heroId, rarity: e.rarity, isNew: e.isNew });
      if (!this.firstSession.firstHeroUnlockedAt) {
        this.firstSession.firstHeroUnlockedAt = Date.now();
        this.trackEvent('funnel_first_hero', { heroId: e.heroId, timestamp: Date.now() });
      }
    });

    events.on('reincarnate:complete', (e) => {
      this.trackEvent('reincarnation', { souls: e.soulsGained, totalSouls: e.totalSouls });
      if (!this.firstSession.firstReincarnationAt) {
        this.firstSession.firstReincarnationAt = Date.now();
        this.trackEvent('funnel_first_reincarnation', { timestamp: Date.now() });
      }
    });

    events.on('achievement:unlocked', (e) => {
      this.trackEvent('achievement_unlocked', { id: e.achievementId });
    });

    events.on('game_start', (e) => {
      this.trackEvent('game_start', { saveVersion: e.saveVersion });
    });


    events.on('screen:change', (e) => {
      this.trackEvent('screen_change', { screenId: e.screenId });
    });

    events.on('building:buy', (e) => {
      this.trackEvent('building_buy', { buildingId: e.buildingId, count: e.count });
    });

    events.on('quest:completed', (e) => {
      this.trackEvent('quest_completed', { questId: e.questId });
    });

    events.on('ad:rewarded_completed', (e) => {
      this.trackEvent('ad_rewarded_completed', { placement: e.placement });
    });

    events.on('relic:grant', (e) => {
      this.trackEvent('relic_grant', { relicId: e.relicId });
    });

    // 2. Campaign Lifecycle & Funnel Events
    events.on('combat:enemy_spawned', (e) => {
      const stats = this.getOrCreateStageStats(e.stageId);
      if (e.encounterIndex === 1) {
        stats.starts++;
        this.trackEvent('stage_start', { stageId: e.stageId });
      }
      if (e.encounterIndex === 5) {
        stats.bossStarts++;
        this.trackEvent('boss_start', { stageId: e.stageId, bossId: e.enemy.id });
      }
    });

    events.on('combat:player_attack', (e) => {
      this.recordManualAttack(e.damage, e.isCrit);
    });

    events.on('combat:enemy_killed', (e) => {
      if (!this.firstSession.firstEnemyKilledAt) {
        this.firstSession.firstEnemyKilledAt = Date.now();
        this.trackEvent('funnel_first_enemy_killed', { enemyId: e.enemyId, timestamp: Date.now() });
      }
    });

    events.on('campaign:stage_cleared', (e) => {
      const stats = this.getOrCreateStageStats(e.stageId);
      stats.clears++;
      stats.bossClears++;
      this.trackEvent('stage_clear', { stageId: e.stageId, isFirstClear: e.isFirstClear, nextStageId: e.nextStageId });

      if (e.stageId === '1-3' && !this.firstSession.stage1_3ClearedAt) {
        this.firstSession.stage1_3ClearedAt = Date.now();
        this.trackEvent('funnel_stage_1_3_cleared', { timestamp: Date.now() });
      }
      if (e.stageId === '1-10' && !this.firstSession.firstBossDefeatedAt) {
        this.firstSession.firstBossDefeatedAt = Date.now();
        this.trackEvent('funnel_first_boss_cleared', { timestamp: Date.now() });
      }
    });

    events.on('campaign:world_cleared', (e) => {
      this.trackEvent('world_clear', { worldId: e.worldId });
      if (e.worldId === 1 && !this.firstSession.world1CompletedAt) {
        this.firstSession.world1CompletedAt = Date.now();
        this.trackEvent('funnel_world_1_cleared', { timestamp: Date.now() });
      }
    });

    events.on('campaign:boss_failed', (e) => {
      const stats = this.getOrCreateStageStats(e.failedStageId);
      stats.failures++;
      stats.bossFailures++;

      const count = (this.bossFailures.get(e.failedStageId) || 0) + 1;
      this.bossFailures.set(e.failedStageId, count);

      this.trackEvent('boss_fail', {
        bossId: e.bossId,
        failedStageId: e.failedStageId,
        fallbackStageId: e.fallbackStageId,
        totalFailsOnStage: count,
      });

      this.trackEvent('auto_farm_enter', {
        stageId: e.fallbackStageId,
        reason: 'boss_blocked',
      });
    });

    events.on('campaign:boss_retry', (e) => {
      this.trackEvent('boss_retry', { stageId: e.stageId, retryBoostActive: e.retryBoostActive });
    });

    events.on('campaign:rush_started', (e) => {
      this.trackEvent('samsara_rush_start', { stageId: e.stageId });
    });

    events.on('campaign:rush_ended', (e) => {
      this.trackEvent('samsara_rush_end', { stageId: e.stageId });
    });

    events.on('combat:reward_dropped', (e) => {
      this.trackEvent('campaign_reward', { rewards: e.rewards });
    });
  }

  /**
   * Aggregates rapid manual click events to prevent event bus and analytics rate limit spam
   */
  public recordManualAttack(damage: number, isCrit: boolean): void {
    const now = Date.now();
    if (!this.pendingAttackBatch) {
      this.pendingAttackBatch = {
        clickCount: 1,
        critCount: isCrit ? 1 : 0,
        totalDamage: damage,
        startTime: now,
        endTime: now,
      };
    } else {
      this.pendingAttackBatch.clickCount++;
      if (isCrit) this.pendingAttackBatch.critCount++;
      this.pendingAttackBatch.totalDamage += damage;
      this.pendingAttackBatch.endTime = now;
    }

    // Flush immediately if batch reaches 25 clicks
    if (this.pendingAttackBatch.clickCount >= 25) {
      this.flushManualAttacks();
    }
  }

  public flushManualAttacks(): void {
    if (!this.pendingAttackBatch || this.pendingAttackBatch.clickCount === 0) return;

    const batch = this.pendingAttackBatch;
    this.pendingAttackBatch = null;

    this.trackEvent('manual_attack_batch', {
      clicks: batch.clickCount,
      crits: batch.critCount,
      totalDamage: batch.totalDamage,
      durationMs: batch.endTime - batch.startTime,
    });
  }

  public trackEvent(eventName: string, params: Record<string, any> = {}): void {
    const entry = { name: eventName, params, timestamp: Date.now() };
    this.trackedEventsList.push(entry);

    if (import.meta.env?.DEV) {
      console.log(`[Analytics] ${eventName}:`, params);
    }

    if (typeof window !== 'undefined' && (window as any).ym) {
      try {
        (window as any).ym(99999999, 'reachGoal', eventName, params);
      } catch (err) {
        console.warn('[Analytics] Yandex Metrica error:', err);
      }
    }
  }

  public getStageFunnelReport(): Record<string, StageFunnelStats> {
    const report: Record<string, StageFunnelStats> = {};
    for (const [stageId, stats] of this.stageFunnels.entries()) {
      report[stageId] = { ...stats };
    }
    return report;
  }

  public getBossFailureReport(): Record<string, number> {
    const report: Record<string, number> = {};
    for (const [stageId, fails] of this.bossFailures.entries()) {
      report[stageId] = fails;
    }
    return report;
  }

  public getFirstSessionReport(): FirstSessionFunnel {
    return { ...this.firstSession };
  }

  public getTrackedEvents(): { name: string; params: Record<string, any>; timestamp: number }[] {
    return [...this.trackedEventsList];
  }

  public resetMetrics(): void {
    this.stageFunnels.clear();
    this.bossFailures.clear();
    this.trackedEventsList = [];
    this.pendingAttackBatch = null;
    this.firstSession = {
      firstEnemyKilledAt: null,
      stage1_3ClearedAt: null,
      firstBossDefeatedAt: null,
      world1CompletedAt: null,
      towerUnlockedAt: null,
      firstHeroUnlockedAt: null,
      rankSReachedAt: null,
      firstReincarnationAt: null,
    };
  }

  public destroy(): void {
    if (this.attackFlushTimer !== null) {
      clearInterval(this.attackFlushTimer);
      this.attackFlushTimer = null;
    }
  }
}

export const analytics = AnalyticsService.getInstance();
