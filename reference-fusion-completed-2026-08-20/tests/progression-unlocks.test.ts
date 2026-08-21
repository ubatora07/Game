import { describe, expect, it } from 'vitest';
import {
  PROGRESSION_UNLOCKS,
  getProgressionUnlockRankIndex,
  isProgressionUnlocked,
  isProgressionUnlockedForRankId,
} from '../src/content/progressionUnlocks';
import { PRIMARY_DOMAINS } from '../src/ui/navigation/PrimaryDomains';

describe('Phase 13 progression unlock coherence', () => {
  it('shares the Rank C gate between Settlement navigation and the progression contract', () => {
    expect(PROGRESSION_UNLOCKS.settlement.rankId).toBe('C');
    expect(getProgressionUnlockRankIndex('settlement')).toBe(2);
    expect(PRIMARY_DOMAINS.find((domain) => domain.id === 'settlement')?.minRankIndex).toBe(2);
    expect(isProgressionUnlocked('settlement', 1)).toBe(false);
    expect(isProgressionUnlocked('settlement', 2)).toBe(true);
  });

  it('keeps Tower at the same Rank C threshold', () => {
    expect(PROGRESSION_UNLOCKS.tower.rankId).toBe('C');
    expect(isProgressionUnlockedForRankId('tower', 'D')).toBe(false);
    expect(isProgressionUnlockedForRankId('tower', 'C')).toBe(true);
  });

  it('records the unresolved legacy Hero roster timing without enforcing a guessed gate', () => {
    expect(PROGRESSION_UNLOCKS.hero_roster.rankId).toBe('B');
    expect(PROGRESSION_UNLOCKS.hero_roster.enforcement).toBe('declared');
  });
});
