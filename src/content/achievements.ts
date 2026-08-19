export interface AchievementDefinition {
  id: string;
  nameKey: string;
  descKey: string;
  icon: string;
  rewardCrystals: number;
  check: (state: any) => boolean;
}

export const ACHIEVEMENTS: readonly AchievementDefinition[] = [
  // 1. Training & Crits
  {
    id: 'first_training',
    nameKey: 'achieve.first_train.name',
    descKey: 'achieve.first_train.desc',
    icon: '👊',
    rewardCrystals: 20,
    check: (s) => s.stats.totalClicks >= 1
  },
  {
    id: 'train_100',
    nameKey: 'achieve.train_100.name',
    descKey: 'achieve.train_100.desc',
    icon: '🥋',
    rewardCrystals: 50,
    check: (s) => s.stats.totalClicks >= 100
  },
  {
    id: 'train_1000',
    nameKey: 'achieve.train_1000.name',
    descKey: 'achieve.train_1000.desc',
    icon: '⚡',
    rewardCrystals: 150,
    check: (s) => s.stats.totalClicks >= 1000
  },
  {
    id: 'crit_50',
    nameKey: 'achieve.crit_50.name',
    descKey: 'achieve.crit_50.desc',
    icon: '💥',
    rewardCrystals: 75,
    check: (s) => s.stats.totalCrits >= 50
  },
  {
    id: 'achieve_crits_100',
    nameKey: 'achieve.crits_100.name',
    descKey: 'achieve.crits_100.desc',
    icon: '💥',
    rewardCrystals: 100,
    check: (s) => (s.stats.totalCrits || 0) >= 100
  },
  {
    id: 'achieve_crits_1000',
    nameKey: 'achieve.crits_1000.name',
    descKey: 'achieve.crits_1000.desc',
    icon: '⚡',
    rewardCrystals: 300,
    check: (s) => (s.stats.totalCrits || 0) >= 1000
  },
  {
    id: 'achieve_combo_50',
    nameKey: 'achieve.combo_50.name',
    descKey: 'achieve.combo_50.desc',
    icon: '🌪️',
    rewardCrystals: 150,
    check: (s) => (s.combo?.count || 0) >= 50
  },

  // 2. Campaign Combat & Kills
  {
    id: 'achieve_kills_100',
    nameKey: 'achieve.kills_100.name',
    descKey: 'achieve.kills_100.desc',
    icon: '💀',
    rewardCrystals: 75,
    check: (s) => (s.stats.campaignEnemiesDefeated || 0) >= 100
  },
  {
    id: 'achieve_kills_500',
    nameKey: 'achieve.kills_500.name',
    descKey: 'achieve.kills_500.desc',
    icon: '🩸',
    rewardCrystals: 200,
    check: (s) => (s.stats.campaignEnemiesDefeated || 0) >= 500
  },
  {
    id: 'achieve_kills_2500',
    nameKey: 'achieve.kills_2500.name',
    descKey: 'achieve.kills_2500.desc',
    icon: '☠️',
    rewardCrystals: 500,
    check: (s) => (s.stats.campaignEnemiesDefeated || 0) >= 2500
  },
  {
    id: 'achieve_bosses_10',
    nameKey: 'achieve.bosses_10.name',
    descKey: 'achieve.bosses_10.desc',
    icon: '⚔️',
    rewardCrystals: 200,
    check: (s) => (s.stats.campaignBossesDefeated || 0) >= 10
  },
  {
    id: 'achieve_bosses_25',
    nameKey: 'achieve.bosses_25.name',
    descKey: 'achieve.bosses_25.desc',
    icon: '🗡️',
    rewardCrystals: 400,
    check: (s) => (s.stats.campaignBossesDefeated || 0) >= 25
  },
  {
    id: 'achieve_bosses_50',
    nameKey: 'achieve.bosses_50.name',
    descKey: 'achieve.bosses_50.desc',
    icon: '👑',
    rewardCrystals: 800,
    check: (s) => (s.stats.campaignBossesDefeated || 0) >= 50
  },

  // 3. Campaign World Clears
  {
    id: 'achieve_world_1',
    nameKey: 'achieve.world_1.name',
    descKey: 'achieve.world_1.desc',
    icon: '🌲',
    rewardCrystals: 150,
    check: (s) => (s.stats.campaignWorldsCleared || 0) >= 1
  },
  {
    id: 'achieve_world_3',
    nameKey: 'achieve.world_3.name',
    descKey: 'achieve.world_3.desc',
    icon: '🌋',
    rewardCrystals: 350,
    check: (s) => (s.stats.campaignWorldsCleared || 0) >= 3
  },
  {
    id: 'achieve_world_5',
    nameKey: 'achieve.world_5.name',
    descKey: 'achieve.world_5.desc',
    icon: '🌌',
    rewardCrystals: 750,
    check: (s) => (s.stats.campaignWorldsCleared || 0) >= 5
  },

  // 4. Buildings & Sect
  {
    id: 'first_building',
    nameKey: 'achieve.first_building.name',
    descKey: 'achieve.first_building.desc',
    icon: '🏗️',
    rewardCrystals: 30,
    check: (s) => Object.values(s.buildings || {}).some((v: any) => v > 0)
  },
  {
    id: 'buildings_50',
    nameKey: 'achieve.buildings_50.name',
    descKey: 'achieve.buildings_50.desc',
    icon: '🏯',
    rewardCrystals: 100,
    check: (s) => (Object.values(s.buildings || {}) as number[]).reduce((a: number, b: number) => a + b, 0) >= 50
  },
  {
    id: 'buildings_150',
    nameKey: 'achieve.buildings_150.name',
    descKey: 'achieve.buildings_150.desc',
    icon: '🌆',
    rewardCrystals: 250,
    check: (s) => (Object.values(s.buildings || {}) as number[]).reduce((a: number, b: number) => a + b, 0) >= 150
  },

  // 5. Ascension Ranks
  {
    id: 'rank_d',
    nameKey: 'achieve.rank_d.name',
    descKey: 'achieve.rank_d.desc',
    icon: '🌀',
    rewardCrystals: 50,
    check: (s) => s.rankIndex >= 1
  },
  {
    id: 'rank_c',
    nameKey: 'achieve.rank_c.name',
    descKey: 'achieve.rank_c.desc',
    icon: '🥉',
    rewardCrystals: 100,
    check: (s) => s.rankIndex >= 2
  },
  {
    id: 'rank_b',
    nameKey: 'achieve.rank_b.name',
    descKey: 'achieve.rank_b.desc',
    icon: '🥈',
    rewardCrystals: 150,
    check: (s) => s.rankIndex >= 3
  },
  {
    id: 'rank_a',
    nameKey: 'achieve.rank_a.name',
    descKey: 'achieve.rank_a.desc',
    icon: '🥇',
    rewardCrystals: 250,
    check: (s) => s.rankIndex >= 4
  },
  {
    id: 'rank_s',
    nameKey: 'achieve.rank_s.name',
    descKey: 'achieve.rank_s.desc',
    icon: '👑',
    rewardCrystals: 500,
    check: (s) => s.rankIndex >= 5
  },
  {
    id: 'rank_transcendent',
    nameKey: 'achieve.rank_trans.name',
    descKey: 'achieve.rank_trans.desc',
    icon: '🌌',
    rewardCrystals: 1500,
    check: (s) => s.rankIndex >= 9
  },

  // 6. Power Milestones
  {
    id: 'power_1m',
    nameKey: 'achieve.power_1m.name',
    descKey: 'achieve.power_1m.desc',
    icon: '🔥',
    rewardCrystals: 150,
    check: (s) => s.stats.lifetimePower >= 1000000
  },
  {
    id: 'power_1b',
    nameKey: 'achieve.power_1b.name',
    descKey: 'achieve.power_1b.desc',
    icon: '💫',
    rewardCrystals: 500,
    check: (s) => s.stats.lifetimePower >= 1000000000
  },

  // 7. Infinite Tower
  {
    id: 'tower_10',
    nameKey: 'achieve.tower_10.name',
    descKey: 'achieve.tower_10.desc',
    icon: '🏰',
    rewardCrystals: 100,
    check: (s) => s.towerFloor >= 10
  },
  {
    id: 'tower_50',
    nameKey: 'achieve.tower_50.name',
    descKey: 'achieve.tower_50.desc',
    icon: '🌸',
    rewardCrystals: 300,
    check: (s) => s.towerFloor >= 50
  },
  {
    id: 'tower_100',
    nameKey: 'achieve.tower_100.name',
    descKey: 'achieve.tower_100.desc',
    icon: '👹',
    rewardCrystals: 750,
    check: (s) => s.towerFloor >= 100
  },

  // 8. Heroes & Party Synergies
  {
    id: 'heroes_3',
    nameKey: 'achieve.heroes_3.name',
    descKey: 'achieve.heroes_3.desc',
    icon: '👥',
    rewardCrystals: 100,
    check: (s) => Object.keys(s.heroes || {}).length >= 3
  },
  {
    id: 'heroes_10',
    nameKey: 'achieve.heroes_10.name',
    descKey: 'achieve.heroes_10.desc',
    icon: '🌟',
    rewardCrystals: 500,
    check: (s) => Object.keys(s.heroes || {}).length >= 10
  },
  {
    id: 'achieve_hero_star_5',
    nameKey: 'achieve.hero_star_5.name',
    descKey: 'achieve.hero_star_5.desc',
    icon: '⭐',
    rewardCrystals: 600,
    check: (s) => Object.values(s.heroes || {}).some((h: any) => h.stars >= 5)
  },

  // 9. Samsara & Souls
  {
    id: 'first_reincarnation',
    nameKey: 'achieve.reincarnate_1.name',
    descKey: 'achieve.reincarnate_1.desc',
    icon: '🔄',
    rewardCrystals: 300,
    check: (s) => s.reincarnationCount >= 1
  },
  {
    id: 'achieve_reincarnate_5',
    nameKey: 'achieve.reincarnate_5.name',
    descKey: 'achieve.reincarnate_5.desc',
    icon: '🌀',
    rewardCrystals: 600,
    check: (s) => s.reincarnationCount >= 5
  },
  {
    id: 'achieve_souls_100',
    nameKey: 'achieve.souls_100.name',
    descKey: 'achieve.souls_100.desc',
    icon: '💎',
    rewardCrystals: 400,
    check: (s) => (s.souls || 0) >= 100
  }
];

export function getAchievementById(id: string): AchievementDefinition | undefined {
  return ACHIEVEMENTS.find(a => a.id === id);
}
