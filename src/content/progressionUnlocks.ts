import { getRankById } from './ranks';

export type ProgressionUnlockId = 'settlement' | 'tower' | 'hero_roster' | 'rebirth';

export interface ProgressionUnlockDefinition {
  id: ProgressionUnlockId;
  rankId: string;
  pacingBand: string;
  rationale: string;
  enforcement: 'runtime' | 'declared';
}

/**
 * Rank-gated progression milestones used across runtime systems and UX audits.
 *
 * `runtime` means the rank gate is actively enforced by code.
 * `declared` means the legacy rank catalog advertises the milestone but runtime
 * access still needs a separate product decision before it can be enforced.
 */
export const PROGRESSION_UNLOCKS: Readonly<Record<ProgressionUnlockId, ProgressionUnlockDefinition>> = {
  settlement: {
    id: 'settlement',
    rankId: 'C',
    pacingBand: '30–60 min target',
    rationale: 'Reveal Mountain Haven after the player understands the battle/hero/team core.',
    enforcement: 'runtime',
  },
  tower: {
    id: 'tower',
    rankId: 'C',
    pacingBand: 'Rank C+ challenge layer',
    rationale: 'Keep Infinite Tower out of the fresh-save combat loop until Rank C.',
    enforcement: 'runtime',
  },
  hero_roster: {
    id: 'hero_roster',
    rankId: 'E',
    pacingBand: 'starter / early-session system',
    rationale: 'Fresh saves begin at Rank E with 150 starter Crystals specifically reserved for an early Hero summon.',
    enforcement: 'runtime',
  },
  rebirth: {
    id: 'rebirth',
    rankId: 'S',
    pacingBand: 'late meta progression',
    rationale: 'Rebirth remains a late-run system after the core progression loop is understood.',
    enforcement: 'runtime',
  },
};

export function getProgressionUnlockRankIndex(id: ProgressionUnlockId): number {
  return getRankById(PROGRESSION_UNLOCKS[id].rankId).index;
}

export function isProgressionUnlocked(id: ProgressionUnlockId, rankIndex: number): boolean {
  return rankIndex >= getProgressionUnlockRankIndex(id);
}

export function isProgressionUnlockedForRankId(id: ProgressionUnlockId, rankId: string): boolean {
  return isProgressionUnlocked(id, getRankById(rankId).index);
}
