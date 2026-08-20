export interface WorldDefinition {
  id: number;
  name: string;
  subtitle: string;
  theme: 'forest' | 'misty_wood' | 'highlands';
  skyGradient: [string, string];
  farHillsColor: string;
  midTreesColor: string;
  nearGroundColor: string;
  pathColor: string;
  maxStages: number;
  enemiesPerStage: number;
  bossTimerSeconds: number;
  baseHp: number;
  hpGrowth: number;
  baseGold: number;
  goldGrowth: number;
}

export const WORLDS: Record<number, WorldDefinition> = {
  1: {
    id: 1,
    name: 'Greenvale',
    subtitle: 'Sunlit Forest & Goblin Territory',
    theme: 'forest',
    skyGradient: ['#1e3a8a', '#3b82f6'],
    farHillsColor: '#1e40af',
    midTreesColor: '#047857',
    nearGroundColor: '#065f46',
    pathColor: '#78350f',
    maxStages: 10,
    enemiesPerStage: 5,
    bossTimerSeconds: 30,
    baseHp: 40,
    hpGrowth: 1.35,
    baseGold: 5,
    goldGrowth: 1.28,
  },
  2: {
    id: 2,
    name: 'Whisperwood',
    subtitle: 'Misty Glade of Ancient Treants',
    theme: 'misty_wood',
    skyGradient: ['#0f172a', '#1e293b'],
    farHillsColor: '#1e293b',
    midTreesColor: '#0f766e',
    nearGroundColor: '#115e59',
    pathColor: '#451a03',
    maxStages: 10,
    enemiesPerStage: 5,
    bossTimerSeconds: 30,
    baseHp: 1800,
    hpGrowth: 1.40,
    baseGold: 220,
    goldGrowth: 1.32,
  },
  3: {
    id: 3,
    name: 'Broken Highlands',
    subtitle: 'Stormy Crags of the Dragon Clan',
    theme: 'highlands',
    skyGradient: ['#18181b', '#3f3f46'],
    farHillsColor: '#27272a',
    midTreesColor: '#4b5563',
    nearGroundColor: '#374151',
    pathColor: '#292524',
    maxStages: 10,
    enemiesPerStage: 5,
    bossTimerSeconds: 30,
    baseHp: 85000,
    hpGrowth: 1.45,
    baseGold: 9500,
    goldGrowth: 1.36,
  },
};
