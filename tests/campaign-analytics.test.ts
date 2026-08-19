import { describe, it, expect, beforeEach } from 'vitest';
import { analytics } from '../src/services/analytics/AnalyticsService';
import { events } from '../src/core/EventBus';

describe('Phase 53 — Campaign Analytics & Telemetry Suite', () => {
  beforeEach(() => {
    analytics.resetMetrics();
  });

  it('P53-01: captures stage lifecycle events in sequence', () => {
    events.emit('combat:enemy_spawned', {
      enemy: { id: 'goblin_1' },
      stageId: '1-1',
      encounterIndex: 1
    });

    events.emit('combat:enemy_spawned', {
      enemy: { id: 'boss_treant' },
      stageId: '1-1',
      encounterIndex: 5
    });

    events.emit('campaign:stage_cleared', {
      stageId: '1-1',
      isFirstClear: true,
      nextStageId: '1-2'
    });

    const tracked = analytics.getTrackedEvents();
    const eventNames = tracked.map(e => e.name);

    expect(eventNames).toContain('stage_start');
    expect(eventNames).toContain('boss_start');
    expect(eventNames).toContain('stage_clear');

    const stageStats = analytics.getStageFunnelReport()['1-1'];
    expect(stageStats).toBeDefined();
    expect(stageStats.starts).toBe(1);
    expect(stageStats.bossStarts).toBe(1);
    expect(stageStats.clears).toBe(1);
  });

  it('P53-02: captures boss failures and auto-farm transition telemetry', () => {
    events.emit('campaign:boss_failed', {
      bossId: 'shadow_lord',
      failedStageId: '2-10',
      fallbackStageId: '2-9'
    });

    const tracked = analytics.getTrackedEvents();
    const failEvent = tracked.find(e => e.name === 'boss_fail');
    const farmEvent = tracked.find(e => e.name === 'auto_farm_enter');

    expect(failEvent).toBeDefined();
    expect(failEvent?.params.bossId).toBe('shadow_lord');
    expect(failEvent?.params.failedStageId).toBe('2-10');

    expect(farmEvent).toBeDefined();
    expect(farmEvent?.params.stageId).toBe('2-9');

    const bossFails = analytics.getBossFailureReport();
    expect(bossFails['2-10']).toBe(1);
  });

  it('P53-03: aggregates rapid manual clicks into batched telemetry', () => {
    for (let i = 0; i < 25; i++) {
      events.emit('combat:player_attack', {
        damage: 100,
        isCrit: i % 5 === 0,
        remainingHp: 500,
        enemyId: 'target_dummy'
      });
    }

    const tracked = analytics.getTrackedEvents();
    const batchEvent = tracked.find(e => e.name === 'manual_attack_batch');

    expect(batchEvent).toBeDefined();
    expect(batchEvent?.params.clicks).toBe(25);
    expect(batchEvent?.params.crits).toBe(5);
    expect(batchEvent?.params.totalDamage).toBe(2500);
  });

  it('P53-04: tracks first-session milestone funnel milestones', () => {
    events.emit('combat:enemy_killed', {
      enemyId: 'goblin_1',
      rewards: { gold: 10 },
      stageCleared: false,
      worldCleared: false
    });

    events.emit('campaign:stage_cleared', {
      stageId: '1-3',
      isFirstClear: true,
      nextStageId: '1-4'
    });

    events.emit('campaign:stage_cleared', {
      stageId: '1-10',
      isFirstClear: true,
      nextStageId: '2-1'
    });

    events.emit('campaign:world_cleared', {
      worldId: 1
    });

    events.emit('tower:floorClear', {
      floor: 1,
      rewards: { gold: 50, crystals: 5, essence: 1 }
    });

    events.emit('hero:unlocked', {
      heroId: 'hiro',
      rarity: 'epic',
      isNew: true
    });

    events.emit('ascension:rankUp', {
      oldRank: 'A',
      newRank: 'S',
      multiplier: 100
    });

    events.emit('reincarnate:complete', {
      soulsGained: 50,
      totalSouls: 50
    });

    const session = analytics.getFirstSessionReport();
    expect(session.firstEnemyKilledAt).not.toBeNull();
    expect(session.stage1_3ClearedAt).not.toBeNull();
    expect(session.firstBossDefeatedAt).not.toBeNull();
    expect(session.world1CompletedAt).not.toBeNull();
    expect(session.towerUnlockedAt).not.toBeNull();
    expect(session.firstHeroUnlockedAt).not.toBeNull();
    expect(session.rankSReachedAt).not.toBeNull();
    expect(session.firstReincarnationAt).not.toBeNull();
  });

  it('P53-05: tracks Samsara Rush events cleanly', () => {
    events.emit('campaign:rush_started', { stageId: '3-1' });
    events.emit('campaign:rush_ended', { stageId: '3-7' });

    const tracked = analytics.getTrackedEvents();
    expect(tracked.some(e => e.name === 'samsara_rush_start')).toBe(true);
    expect(tracked.some(e => e.name === 'samsara_rush_end')).toBe(true);
  });
});
