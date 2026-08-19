import { describe, it, expect, beforeEach } from 'vitest';
import { SaveMigrations } from '../src/services/save/SaveMigrations';
import { sanitizeGameState, CURRENT_SAVE_VERSION } from '../src/services/save/SaveSchema';
import { createInitialState } from '../src/core/GameState';

describe('Phase 51 — Campaign Save Schema & Migration Tests', () => {
  it('P51-01: bumps current save version to 6', () => {
    expect(CURRENT_SAVE_VERSION).toBe(6);
  });

  it('P51-02: generates valid campaign defaults for blank save', () => {
    const state = sanitizeGameState(null);
    expect(state.version).toBe(6);
    expect(state.campaign).toBeDefined();
    expect(state.campaign.currentWorldId).toBe(1);
    expect(state.campaign.currentStageId).toBe('1-1');
    expect(state.campaign.currentEncounter).toBe(1);
    expect(state.campaign.highestWorldReached).toBe(1);
    expect(state.campaign.highestStageReached).toBe('1-1');
    expect(state.campaign.campaignMode).toBe('progress');
    expect(state.campaign.autoAdvance).toBe(true);
  });

  it('P51-03: safely migrates legacy v1 save without data loss', () => {
    const v1Save = {
      version: 1,
      power: 50000,
      gold: 12000,
      crystals: 300,
      rankId: 'D',
      rankIndex: 1,
      buildings: { dojo: 25 },
      upgrades: { focus_strike: 3 },
      stats: { totalClicks: 150 }
    };

    const migrated = SaveMigrations.migrate(v1Save);
    expect(migrated.version).toBe(6);
    expect(migrated.power).toBe(50000);
    expect(migrated.gold).toBe(12000);
    expect(migrated.crystals).toBe(300);
    expect(migrated.buildings.dojo).toBe(25);
    expect(migrated.upgrades.focus_strike).toBe(3);
    expect(migrated.stats.totalClicks).toBe(150);
    expect(migrated.campaign.currentWorldId).toBe(1);
    expect(migrated.campaign.currentStageId).toBe('1-1');
  });

  it('P51-04: migrates midgame and endgame saves deriving appropriate starting worlds', () => {
    const rankBSave = {
      version: 4,
      rankId: 'B',
      rankIndex: 3,
      power: 10_000_000,
      gold: 500_000
    };
    const migratedB = SaveMigrations.migrate(rankBSave);
    expect(migratedB.campaign.currentWorldId).toBe(3);
    expect(migratedB.campaign.currentStageId).toBe('3-1');

    const rankSSave = {
      version: 5,
      rankId: 'S',
      rankIndex: 5,
      power: 1_000_000_000,
      gold: 50_000_000
    };
    const migratedS = SaveMigrations.migrate(rankSSave);
    expect(migratedS.campaign.currentWorldId).toBe(5);
    expect(migratedS.campaign.currentStageId).toBe('5-1');
  });

  it('P51-05: preserves reincarnation, soul tree, and relics across migration', () => {
    const samsaraSave = {
      version: 5,
      rankId: 'E',
      rankIndex: 0,
      souls: 450,
      soulSkills: { spirit_mastery: 5, iron_will: 3 },
      reincarnationCount: 2,
      relics: { dragon_jade: { level: 2, count: 2 } },
      equippedRelics: ['dragon_jade', null, null]
    };

    const migrated = SaveMigrations.migrate(samsaraSave);
    expect(migrated.souls).toBe(450);
    expect(migrated.soulSkills.spirit_mastery).toBe(5);
    expect(migrated.soulSkills.iron_will).toBe(3);
    expect(migrated.reincarnationCount).toBe(2);
    expect(migrated.relics.dragon_jade.level).toBe(2);
    expect(migrated.equippedRelics[0]).toBe('dragon_jade');
  });

  it('P51-06: does not save transient animation or combat interval timers', () => {
    const initial = createInitialState();
    expect((initial as any).attackAnimation).toBeUndefined();
    expect((initial as any).shakeTimer).toBeUndefined();
    expect((initial as any).soundVoice).toBeUndefined();
  });
});
