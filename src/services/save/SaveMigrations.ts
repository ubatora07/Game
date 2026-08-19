import { GameStateData } from '../../core/GameState';
import { sanitizeGameState, CURRENT_SAVE_VERSION } from './SaveSchema';
import { getRankById } from '../../content/ranks';

export class SaveMigrations {
  /**
   * Migrate raw save object through version upgrades
   */
  public static migrate(raw: any): GameStateData {
    if (!raw || typeof raw !== 'object') {
      return sanitizeGameState(raw);
    }

    const version = Number(raw.version) || 0;

    // v0 -> v1
    if (version < 1) {
      raw.version = 1;
    }

    // v1 -> v2 (Balance v2 Migration)
    if (version < 2) {
      // Ensure rankIndex is consistent with rankId
      if (raw.rankId) {
        const rank = getRankById(raw.rankId);
        raw.rankIndex = rank.index;
      }
      raw.version = 2;
    }

    // v2 -> v3 (Relics Migration)
    if (version < 3) {
      if (!raw.relics) raw.relics = {};
      if (!Array.isArray(raw.equippedRelics)) raw.equippedRelics = [null, null, null];
      raw.version = 3;
    }

    // v3 -> v4 (Expeditions Migration)
    if (version < 4) {
      if (!Array.isArray(raw.expeditions)) raw.expeditions = [];
      raw.version = 4;
    }

    // v4 -> v5 (Daily System Migration)
    if (version < 5) {
      raw.lastDailyResetAt = 0;
      raw.loginStreak = 0;
      raw.loginRewardClaimed = false;
      raw.dailyQuests = [];
      raw.version = 5;
    }

    // v5 -> v6 (Campaign Mode & Progression Migration)
    if (version < 6) {
      if (!raw.campaign || typeof raw.campaign !== 'object') {
        const rankIdx = Number(raw.rankIndex) || 0;
        let initialWorld = 1;
        if (rankIdx >= 5) initialWorld = 5;
        else if (rankIdx >= 4) initialWorld = 4;
        else if (rankIdx >= 3) initialWorld = 3;
        else if (rankIdx >= 2) initialWorld = 2;
        else initialWorld = 1;

        const initialStage = `${initialWorld}-1`;

        raw.campaign = {
          currentWorldId: initialWorld,
          currentStageId: initialStage,
          currentEncounter: 1,
          highestWorldReached: initialWorld,
          highestStageReached: initialStage,
          firstClears: [],
          campaignMode: 'progress',
          autoAdvance: true,
          farmStageId: initialStage,
          bossRetryState: null
        };
      }
      raw.version = CURRENT_SAVE_VERSION;
    }

    return sanitizeGameState(raw);
  }
}
