export interface RankDefinition {
  id: string;
  index: number;
  nameKey: string;
  titleKey: string;
  reqPower: number;
  multiplier: number;
  color: string;
  glowColor: string;
  auraStyle: 'aura-none' | 'aura-subtle' | 'aura-spirit' | 'aura-flame' | 'aura-void' | 'aura-celestial' | 'aura-godlike' | 'aura-infinite';
  avatarIcon: string;
  weaponVisual: string;
  trailColor: string;
  unlockedFeature?: string;
  descriptionKey: string;
  avatarIndex: number;
}

export const RANKS: readonly RankDefinition[] = [
  {
    id: 'E',
    index: 0,
    nameKey: 'rank.e.name',
    titleKey: 'rank.e.title',
    reqPower: 0,
    multiplier: 1.0,
    color: '#94a3b8',
    glowColor: 'rgba(148, 163, 184, 0.4)',
    auraStyle: 'aura-none',
    avatarIcon: '🥋',
    weaponVisual: 'Wooden Blade',
    trailColor: '#94a3b8',
    descriptionKey: 'rank.e.desc',
    avatarIndex: 0
  },
  {
    id: 'D',
    index: 1,
    nameKey: 'rank.d.name',
    titleKey: 'rank.d.title',
    reqPower: 1200,
    multiplier: 1.15,
    color: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.5)',
    auraStyle: 'aura-subtle',
    avatarIcon: '🧘',
    weaponVisual: 'Iron Katana',
    trailColor: '#38bdf8',
    unlockedFeature: 'upgrades_tier2',
    descriptionKey: 'rank.d.desc',
    avatarIndex: 1
  },
  {
    id: 'C',
    index: 2,
    nameKey: 'rank.c.name',
    titleKey: 'rank.c.title',
    reqPower: 25000,
    multiplier: 1.35,
    color: '#4ade80',
    glowColor: 'rgba(74, 222, 128, 0.5)',
    auraStyle: 'aura-spirit',
    avatarIcon: '⛩️',
    weaponVisual: 'Spirit Blade',
    trailColor: '#4ade80',
    unlockedFeature: 'tower',
    descriptionKey: 'rank.c.desc',
    avatarIndex: 2
  },
  {
    id: 'B',
    index: 3,
    nameKey: 'rank.b.name',
    titleKey: 'rank.b.title',
    reqPower: 750000,
    multiplier: 1.65,
    color: '#c084fc',
    glowColor: 'rgba(192, 132, 252, 0.6)',
    auraStyle: 'aura-spirit',
    avatarIcon: '⚔️',
    weaponVisual: 'Soul Greatsword',
    trailColor: '#c084fc',
    unlockedFeature: 'heroes',
    descriptionKey: 'rank.b.desc',
    avatarIndex: 3
  },
  {
    id: 'A',
    index: 4,
    nameKey: 'rank.a.name',
    titleKey: 'rank.a.title',
    reqPower: 30000000,
    multiplier: 2.00,
    color: '#fbbf24',
    glowColor: 'rgba(251, 191, 36, 0.6)',
    auraStyle: 'aura-flame',
    avatarIcon: '🏯',
    weaponVisual: 'Domain Glaive',
    trailColor: '#fbbf24',
    unlockedFeature: 'advanced_upgrades',
    descriptionKey: 'rank.a.desc',
    avatarIndex: 4
  },
  {
    id: 'S',
    index: 5,
    nameKey: 'rank.s.name',
    titleKey: 'rank.s.title',
    reqPower: 2000000000, // 2B
    multiplier: 2.50,
    color: '#f87171',
    glowColor: 'rgba(248, 113, 113, 0.7)',
    auraStyle: 'aura-flame',
    avatarIcon: '🔥',
    weaponVisual: 'Dragon Flamberge',
    trailColor: '#f87171',
    unlockedFeature: 'reincarnation',
    descriptionKey: 'rank.s.desc',
    avatarIndex: 5
  },
  {
    id: 'SS',
    index: 6,
    nameKey: 'rank.ss.name',
    titleKey: 'rank.ss.title',
    reqPower: 250000000000, // 250B
    multiplier: 3.25,
    color: '#ec4899',
    glowColor: 'rgba(236, 72, 153, 0.8)',
    auraStyle: 'aura-void',
    avatarIcon: '🌌',
    weaponVisual: 'Void Saber',
    trailColor: '#ec4899',
    unlockedFeature: 'hero_stars',
    descriptionKey: 'rank.ss.desc',
    avatarIndex: 6
  },
  {
    id: 'SSS',
    index: 7,
    nameKey: 'rank.sss.name',
    titleKey: 'rank.sss.title',
    reqPower: 50000000000000, // 50T
    multiplier: 4.25,
    color: '#e11d48',
    glowColor: 'rgba(225, 29, 72, 0.85)',
    auraStyle: 'aura-void',
    avatarIcon: '🔮',
    weaponVisual: 'Abyssal Scythe',
    trailColor: '#e11d48',
    unlockedFeature: 'soul_mastery',
    descriptionKey: 'rank.sss.desc',
    avatarIndex: 7
  },
  {
    id: 'AWAKENED',
    index: 8,
    nameKey: 'rank.awakened.name',
    titleKey: 'rank.awakened.title',
    reqPower: 15000000000000000, // 15 Qa
    multiplier: 5.75,
    color: '#818cf8',
    glowColor: 'rgba(129, 140, 248, 0.9)',
    auraStyle: 'aura-celestial',
    avatarIcon: '⚡',
    weaponVisual: 'Astral Lightning Lance',
    trailColor: '#818cf8',
    descriptionKey: 'rank.awakened.desc',
    avatarIndex: 8
  },
  {
    id: 'TRANSCENDENT',
    index: 9,
    nameKey: 'rank.transcendent.name',
    titleKey: 'rank.transcendent.title',
    reqPower: 5000000000000000000, // 5 Qi
    multiplier: 8.00,
    color: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.95)',
    auraStyle: 'aura-celestial',
    avatarIcon: '💫',
    weaponVisual: 'Ether Calamity',
    trailColor: '#38bdf8',
    descriptionKey: 'rank.transcendent.desc',
    avatarIndex: 9
  },
  {
    id: 'CELESTIAL',
    index: 10,
    nameKey: 'rank.celestial.name',
    titleKey: 'rank.celestial.title',
    reqPower: 1000000000000000000000, // 1 Sx
    multiplier: 10.00,
    color: '#facc15',
    glowColor: 'rgba(250, 204, 21, 1)',
    auraStyle: 'aura-godlike',
    avatarIcon: '👑',
    weaponVisual: 'Celestial Sol Sovereign',
    trailColor: '#facc15',
    descriptionKey: 'rank.celestial.desc',
    avatarIndex: 10
  },
  {
    id: 'IMMORTAL',
    index: 11,
    nameKey: 'rank.immortal.name',
    titleKey: 'rank.immortal.title',
    reqPower: 500000000000000000000000, // 500 Sx
    multiplier: 12.00,
    color: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 1)',
    auraStyle: 'aura-infinite',
    avatarIcon: '🌟',
    weaponVisual: 'Infinite Primordial Blade',
    trailColor: '#f43f5e',
    descriptionKey: 'rank.immortal.desc',
    avatarIndex: 11
  }
];

export function getRankById(id: string): RankDefinition {
  return RANKS.find(r => r.id === id) || RANKS[0];
}

export function getNextRank(currentRankId: string): RankDefinition | null {
  const current = getRankById(currentRankId);
  if (current.index < RANKS.length - 1) {
    return RANKS[current.index + 1];
  }
  return null;
}
