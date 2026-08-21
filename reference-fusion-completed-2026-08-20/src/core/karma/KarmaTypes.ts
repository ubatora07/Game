export type KarmaBand = 'virtuous' | 'positive' | 'neutral' | 'negative' | 'infamous';

export interface KarmaState {
  score: number;
  band: KarmaBand;
  majorChoiceFlags: Record<string, boolean>;
  factionReputation: Record<string, number>;
  lifetimeKarmaPositive: number;
  lifetimeKarmaNegative: number;
}

export interface KarmaBandInfo {
  band: KarmaBand;
  minScore: number;
  maxScore: number;
  titleKey: string;
  badge: string;
  color: string;
}

export const KARMA_BANDS: Record<KarmaBand, KarmaBandInfo> = {
  virtuous: {
    band: 'virtuous',
    minScore: 50,
    maxScore: 100,
    titleKey: 'karma.band.virtuous',
    badge: '👑',
    color: '#fbbf24', // Gold
  },
  positive: {
    band: 'positive',
    minScore: 15,
    maxScore: 49,
    titleKey: 'karma.band.positive',
    badge: '✨',
    color: '#38bdf8', // Light Blue / Cyan
  },
  neutral: {
    band: 'neutral',
    minScore: -14,
    maxScore: 14,
    titleKey: 'karma.band.neutral',
    badge: '⚖️',
    color: '#94a3b8', // Gray / Slate
  },
  negative: {
    band: 'negative',
    minScore: -49,
    maxScore: -15,
    titleKey: 'karma.band.negative',
    badge: '🗡️',
    color: '#fb923c', // Orange
  },
  infamous: {
    band: 'infamous',
    minScore: -100,
    maxScore: -50,
    titleKey: 'karma.band.infamous',
    badge: '💀',
    color: '#ef4444', // Crimson / Red
  },
};
