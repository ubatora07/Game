import { describe, it, expect } from 'vitest';
import { createInitialState } from '../src/core/GameState';
import { sanitizeGameState, CURRENT_SAVE_VERSION } from '../src/services/save/SaveSchema';
import { SaveMigrations } from '../src/services/save/SaveMigrations';
import { OfflineSystem } from '../src/systems/OfflineSystem';

describe('Save System & Migrations', () => {
  it('should sanitize corrupted or missing save payloads', () => {
    const sanitized = sanitizeGameState(null);
    expect(sanitized.version).toBe(CURRENT_SAVE_VERSION);
    expect(sanitized.power).toBe(0);
    expect(sanitized.rankId).toBe('E');
  });

  it('should sanitize NaN and negative numbers in saves', () => {
    const badData = {
      power: NaN,
      gold: -500,
      crystals: 'invalid'
    };

    const sanitized = sanitizeGameState(badData);
    expect(sanitized.power).toBe(0);
    expect(sanitized.gold).toBe(0);
    expect(sanitized.crystals).toBe(150); // fallback starter
  });

  it('should migrate older save schemas cleanly to v6', () => {
    const oldSave = {
      version: 0,
      power: 2500,
      gold: 800,
      rankId: 'D'
    };

    const migrated = SaveMigrations.migrate(oldSave);
    expect(migrated.version).toBe(CURRENT_SAVE_VERSION);
    expect(migrated.power).toBe(2500);
    expect(migrated.rankId).toBe('D');
    expect(migrated.campaign).toBeDefined();
    expect(migrated.campaign.currentWorldId).toBe(1);
    expect(migrated.campaign.currentStageId).toBe('1-1');
  });

  it('should derive campaign placement from player rank when migrating from v5 to v6', () => {
    const v5Save = {
      version: 5,
      power: 1000000,
      gold: 50000,
      rankId: 'B',
      rankIndex: 3,
      buildings: { dojo: 50, shrine: 20 },
      heroes: { hiro: { stars: 2, duplicates: 0 } },
      souls: 25
    };

    const migrated = SaveMigrations.migrate(v5Save);
    expect(migrated.version).toBe(6);
    expect(migrated.campaign.currentWorldId).toBe(3);
    expect(migrated.campaign.currentStageId).toBe('3-1');
    expect(migrated.campaign.highestWorldReached).toBe(3);
    expect(migrated.buildings.dojo).toBe(50);
    expect(migrated.heroes.hiro.stars).toBe(2);
    expect(migrated.souls).toBe(25);
  });

  it('should sanitize corrupted campaign state', () => {
    const corruptedSave = {
      version: 6,
      campaign: {
        currentWorldId: -1,
        currentStageId: 12345, // invalid type
        currentEncounter: 'boss',
        campaignMode: 'unsupported_mode',
        autoAdvance: 'yes',
        firstClears: null
      }
    };

    const sanitized = sanitizeGameState(corruptedSave);
    expect(sanitized.campaign.currentWorldId).toBe(1);
    expect(sanitized.campaign.currentStageId).toBe('1-1');
    expect(sanitized.campaign.currentEncounter).toBe(1);
    expect(sanitized.campaign.campaignMode).toBe('progress');
    expect(sanitized.campaign.autoAdvance).toBe(true);
    expect(Array.isArray(sanitized.campaign.firstClears)).toBe(true);
  });

  it('should accurately compute offline progress', () => {
    const state = createInitialState();
    state.buildings['dojo'] = 10; // 10 dojos = passive power
    state.lastSeenAt = Date.now() - (600 * 1000); // 10 minutes ago (600s)

    const gains = OfflineSystem.calculateOfflineGains(state);
    expect(gains).not.toBeNull();
    expect(gains!.seconds).toBeGreaterThanOrEqual(599);
    expect(gains!.powerGained).toBeGreaterThan(0);
  });
});
