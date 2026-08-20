export type EnemyType =
  // World 1
  | 'green_slime'
  | 'forest_wolf'
  | 'goblin_scavenger'
  | 'goblin_archer'
  | 'goblin_warrior'
  | 'boss_goblin_chieftain'
  // World 2
  | 'cavern_spider'
  | 'dire_wolf'
  | 'root_treant'
  | 'forest_wraith'
  | 'moss_golem'
  | 'boss_ancient_treant'
  // World 3
  | 'highland_orc'
  | 'armored_orc'
  | 'rock_golem'
  | 'shadow_wraith'
  | 'storm_drake'
  | 'boss_highland_dragon';

export interface EnemyDefinition {
  id: EnemyType;
  name: string;
  worldId: number;
  isBoss: boolean;
  hpMultiplier: number;
  goldMultiplier: number;
  xpReward: number;
  color: string;
  sizeMultiplier: number;
  attackSpeedSeconds: number;
}

export const ENEMIES: Record<EnemyType, EnemyDefinition> = {
  // World 1 — Greenvale
  green_slime: {
    id: 'green_slime',
    name: 'Green Slime',
    worldId: 1,
    isBoss: false,
    hpMultiplier: 0.7,
    goldMultiplier: 0.8,
    xpReward: 5,
    color: '#22c55e',
    sizeMultiplier: 0.85,
    attackSpeedSeconds: 1.8,
  },
  forest_wolf: {
    id: 'forest_wolf',
    name: 'Forest Wolf',
    worldId: 1,
    isBoss: false,
    hpMultiplier: 0.9,
    goldMultiplier: 1.0,
    xpReward: 8,
    color: '#71717a',
    sizeMultiplier: 1.0,
    attackSpeedSeconds: 1.5,
  },
  goblin_scavenger: {
    id: 'goblin_scavenger',
    name: 'Goblin Scavenger',
    worldId: 1,
    isBoss: false,
    hpMultiplier: 1.0,
    goldMultiplier: 1.1,
    xpReward: 10,
    color: '#84cc16',
    sizeMultiplier: 0.95,
    attackSpeedSeconds: 1.4,
  },
  goblin_archer: {
    id: 'goblin_archer',
    name: 'Goblin Archer',
    worldId: 1,
    isBoss: false,
    hpMultiplier: 1.1,
    goldMultiplier: 1.2,
    xpReward: 12,
    color: '#65a30d',
    sizeMultiplier: 0.95,
    attackSpeedSeconds: 1.3,
  },
  goblin_warrior: {
    id: 'goblin_warrior',
    name: 'Goblin Warrior',
    worldId: 1,
    isBoss: false,
    hpMultiplier: 1.3,
    goldMultiplier: 1.4,
    xpReward: 15,
    color: '#4d7c0f',
    sizeMultiplier: 1.1,
    attackSpeedSeconds: 1.6,
  },
  boss_goblin_chieftain: {
    id: 'boss_goblin_chieftain',
    name: 'Goblin Chieftain',
    worldId: 1,
    isBoss: true,
    hpMultiplier: 5.5,
    goldMultiplier: 6.0,
    xpReward: 80,
    color: '#dc2626',
    sizeMultiplier: 1.6,
    attackSpeedSeconds: 2.0,
  },

  // World 2 — Whisperwood
  cavern_spider: {
    id: 'cavern_spider',
    name: 'Cavern Spider',
    worldId: 2,
    isBoss: false,
    hpMultiplier: 0.9,
    goldMultiplier: 1.0,
    xpReward: 25,
    color: '#9333ea',
    sizeMultiplier: 0.9,
    attackSpeedSeconds: 1.3,
  },
  dire_wolf: {
    id: 'dire_wolf',
    name: 'Dire Wolf',
    worldId: 2,
    isBoss: false,
    hpMultiplier: 1.1,
    goldMultiplier: 1.1,
    xpReward: 35,
    color: '#38bdf8',
    sizeMultiplier: 1.15,
    attackSpeedSeconds: 1.4,
  },
  root_treant: {
    id: 'root_treant',
    name: 'Root Treant',
    worldId: 2,
    isBoss: false,
    hpMultiplier: 1.3,
    goldMultiplier: 1.3,
    xpReward: 45,
    color: '#15803d',
    sizeMultiplier: 1.25,
    attackSpeedSeconds: 1.8,
  },
  forest_wraith: {
    id: 'forest_wraith',
    name: 'Forest Wraith',
    worldId: 2,
    isBoss: false,
    hpMultiplier: 1.2,
    goldMultiplier: 1.4,
    xpReward: 55,
    color: '#06b6d4',
    sizeMultiplier: 1.0,
    attackSpeedSeconds: 1.2,
  },
  moss_golem: {
    id: 'moss_golem',
    name: 'Moss Golem',
    worldId: 2,
    isBoss: false,
    hpMultiplier: 1.5,
    goldMultiplier: 1.6,
    xpReward: 70,
    color: '#047857',
    sizeMultiplier: 1.35,
    attackSpeedSeconds: 2.1,
  },
  boss_ancient_treant: {
    id: 'boss_ancient_treant',
    name: 'Ancient Treant King',
    worldId: 2,
    isBoss: true,
    hpMultiplier: 6.0,
    goldMultiplier: 7.5,
    xpReward: 350,
    color: '#166534',
    sizeMultiplier: 1.8,
    attackSpeedSeconds: 2.2,
  },

  // World 3 — Broken Highlands
  highland_orc: {
    id: 'highland_orc',
    name: 'Highland Orc',
    worldId: 3,
    isBoss: false,
    hpMultiplier: 1.0,
    goldMultiplier: 1.1,
    xpReward: 120,
    color: '#ea580c',
    sizeMultiplier: 1.2,
    attackSpeedSeconds: 1.5,
  },
  armored_orc: {
    id: 'armored_orc',
    name: 'Armored Orc Bruiser',
    worldId: 3,
    isBoss: false,
    hpMultiplier: 1.3,
    goldMultiplier: 1.3,
    xpReward: 160,
    color: '#c2410c',
    sizeMultiplier: 1.3,
    attackSpeedSeconds: 1.7,
  },
  rock_golem: {
    id: 'rock_golem',
    name: 'Granite Golem',
    worldId: 3,
    isBoss: false,
    hpMultiplier: 1.6,
    goldMultiplier: 1.5,
    xpReward: 200,
    color: '#78716c',
    sizeMultiplier: 1.4,
    attackSpeedSeconds: 2.0,
  },
  shadow_wraith: {
    id: 'shadow_wraith',
    name: 'Shadow Wraith',
    worldId: 3,
    isBoss: false,
    hpMultiplier: 1.2,
    goldMultiplier: 1.4,
    xpReward: 220,
    color: '#a855f7',
    sizeMultiplier: 1.1,
    attackSpeedSeconds: 1.2,
  },
  storm_drake: {
    id: 'storm_drake',
    name: 'Storm Drake',
    worldId: 3,
    isBoss: false,
    hpMultiplier: 1.5,
    goldMultiplier: 1.7,
    xpReward: 280,
    color: '#3b82f6',
    sizeMultiplier: 1.45,
    attackSpeedSeconds: 1.4,
  },
  boss_highland_dragon: {
    id: 'boss_highland_dragon',
    name: 'Elder Highland Dragon',
    worldId: 3,
    isBoss: true,
    hpMultiplier: 7.0,
    goldMultiplier: 10.0,
    xpReward: 1500,
    color: '#b91c1c',
    sizeMultiplier: 2.0,
    attackSpeedSeconds: 1.8,
  },
};

export const WORLD_ENEMY_POOLS: Record<number, { normal: EnemyType[]; boss: EnemyType }> = {
  1: {
    normal: ['green_slime', 'forest_wolf', 'goblin_scavenger', 'goblin_archer', 'goblin_warrior'],
    boss: 'boss_goblin_chieftain',
  },
  2: {
    normal: ['cavern_spider', 'dire_wolf', 'root_treant', 'forest_wraith', 'moss_golem'],
    boss: 'boss_ancient_treant',
  },
  3: {
    normal: ['highland_orc', 'armored_orc', 'rock_golem', 'shadow_wraith', 'storm_drake'],
    boss: 'boss_highland_dragon',
  },
};
