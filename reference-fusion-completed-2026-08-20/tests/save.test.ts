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

  it('should migrate older save schemas cleanly to the current version', () => {
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

  it('should derive campaign placement from player rank when migrating from v5', () => {
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
    expect(migrated.version).toBe(CURRENT_SAVE_VERSION);
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

  it('should preserve v7 RPG subdomain payloads through sanitization', () => {
    const payload = sanitizeGameState({
      version: CURRENT_SAVE_VERSION,
      partyTeam: { characters: { char_1: { classId: 'archer' } }, activeFocusCharId: 'char_1' },
      pets: { ownedPets: { pet_1: { id: 'pet_1', level: 7 } }, activePetId: 'pet_1' },
      karma: { score: -25, majorChoiceFlags: { refugees_sheltered: true } },
      worldState: { currentLifeFlags: { village_saved: true }, legacyWorldChronicle: {} },
    });

    expect(payload.partyTeam).toBeDefined();
    expect(payload.pets).toBeDefined();
    expect(payload.karma).toBeDefined();
    expect(payload.worldState).toBeDefined();
  });

  it('should sanitize corrupted V7 RPG subdomains without leaking invalid state', () => {
    const sanitized = sanitizeGameState({
      version: 7,
      partyTeam: {
        characters: {
          char_1: { slotId: 'evil', name: '', isUnlocked: false, classId: 'necromancer', level: -2, skillPoints: -5, unlockedSkillNodeIds: [1, 'node_a', 'node_a'] },
          char_2: { slotId: 'char_2', name: 'Partner', isUnlocked: false, classId: 'archer', level: 3, skillPoints: 2, unlockedSkillNodeIds: [] },
        },
        activeFocusCharId: 'char_2',
      },
      pets: {
        ownedPets: {
          pet_ignis_drake: { id: 'spoofed', name: '', level: -1, xp: -5, xpToNextLevel: 0, evolutionStage: 99, affection: 999, unlockedAt: Infinity },
          pet_unknown: { id: 'pet_unknown', level: 99 },
        },
        activePetId: 'pet_unknown',
      },
      karma: {
        score: -999,
        band: 'virtuous',
        majorChoiceFlags: { valid: true, invalid: 'yes' },
        factionReputation: { guild: 10, broken: NaN },
        lifetimeKarmaPositive: -1,
        lifetimeKarmaNegative: 12,
      },
      worldState: {
        currentLifeFlags: { village_saved: true, bogus_flag: true, dark_reputation: 'yes' },
        legacyWorldChronicle: { sovereign_citadel_erected: true, bogus_flag: true },
      },
      adventureEvents: {
        completedOnceOnly: ['evt_a', 'evt_a', 123],
        eventCooldowns: { good: 12345, invalid: Infinity, negative: -1 },
      },
    });

    expect(sanitized.partyTeam?.characters.char_1.slotId).toBe('char_1');
    expect(sanitized.partyTeam?.characters.char_1.isUnlocked).toBe(true);
    expect(sanitized.partyTeam?.characters.char_1.classId).toBeNull();
    expect(sanitized.partyTeam?.characters.char_1.level).toBe(1);
    expect(sanitized.partyTeam?.characters.char_1.unlockedSkillNodeIds).toEqual(['node_a']);
    expect(sanitized.partyTeam?.activeFocusCharId).toBe('char_1');

    expect(Object.keys(sanitized.pets?.ownedPets ?? {})).toEqual(['pet_ignis_drake']);
    expect(sanitized.pets?.ownedPets.pet_ignis_drake.id).toBe('pet_ignis_drake');
    expect(sanitized.pets?.ownedPets.pet_ignis_drake.evolutionStage).toBe(3);
    expect(sanitized.pets?.ownedPets.pet_ignis_drake.affection).toBe(100);
    expect(sanitized.pets?.activePetId).toBeNull();

    expect(sanitized.karma?.score).toBe(-100);
    expect(sanitized.karma?.band).toBe('infamous');
    expect(sanitized.karma?.majorChoiceFlags).toEqual({ valid: true });
    expect(sanitized.karma?.factionReputation).toEqual({ guild: 10 });
    expect(sanitized.karma?.lifetimeKarmaPositive).toBe(0);

    expect(sanitized.worldState?.currentLifeFlags).toEqual({ village_saved: true });
    expect(sanitized.worldState?.legacyWorldChronicle).toEqual({ sovereign_citadel_erected: true });
    expect(sanitized.adventureEvents?.completedOnceOnly).toEqual(['evt_a']);
    expect(sanitized.adventureEvents?.eventCooldowns).toEqual({ good: 12345 });
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
