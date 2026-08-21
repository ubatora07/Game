export type RhythmRating = 'PERFECT' | 'GOOD' | 'MISS';

export interface RhythmEvaluation {
  rating: RhythmRating;
  deltaMs: number;
  streak: number;
  critDamageBonus: number;
  critChanceBonus: number;
  lootBonus: number;
  isDebouncedSpam: boolean;
}

export interface RhythmConfig {
  bpm: number;
  perfectWindowMs: number;
  goodWindowMs: number;
  minClickIntervalMs: number;
  streakTimeoutMs: number;
}
