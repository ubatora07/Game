import { CampaignWorld } from './campaignTypes';

export const CAMPAIGN_WORLDS: CampaignWorld[] = [
  {
    id: 1,
    nameKey: 'world.forest.name',
    defaultName: 'Whispering Forest',
    descriptionKey: 'world.forest.desc',
    theme: 'forest',
    emoji: '🌲',
    accentColor: '#4ade80',
    bgGradient: 'radial-gradient(circle at 50% 30%, rgba(20, 83, 45, 0.45), rgba(15, 23, 42, 0.98))',
    stageCount: 10,
    minRankIndex: 0, // Rank E
    bgAsset: 'bg_forest',
    musicTrack: 'bgm_world_1',
    worldModifier: { type: 'gold', bonusPct: 0.10, label: '+10% Gold' }
  },
  {
    id: 2,
    nameKey: 'world.sakura.name',
    defaultName: 'Thorncourt Marches',
    descriptionKey: 'world.sakura.desc',
    theme: 'sakura',
    emoji: '🌸',
    accentColor: '#f472b6',
    bgGradient: 'radial-gradient(circle at 50% 30%, rgba(190, 24, 93, 0.40), rgba(15, 23, 42, 0.98))',
    stageCount: 10,
    minRankIndex: 2, // Rank C
    bgAsset: 'bg_sakura',
    musicTrack: 'bgm_world_2',
    worldModifier: { type: 'power', bonusPct: 0.15, label: '+15% Power' }
  },
  {
    id: 3,
    nameKey: 'world.abyss.name',
    defaultName: 'Ashen Rift',
    descriptionKey: 'world.abyss.desc',
    theme: 'volcano',
    emoji: '🌋',
    accentColor: '#f87171',
    bgGradient: 'radial-gradient(circle at 50% 30%, rgba(185, 28, 28, 0.45), rgba(15, 23, 42, 0.98))',
    stageCount: 10,
    minRankIndex: 4, // Rank A
    bgAsset: 'bg_abyss',
    musicTrack: 'bgm_world_3',
    worldModifier: { type: 'crit', bonusPct: 0.05, label: '+5% Crit Rate' }
  },
  {
    id: 4,
    nameKey: 'world.frozen.name',
    defaultName: 'Frostspire Range',
    descriptionKey: 'world.frozen.desc',
    theme: 'ice',
    emoji: '❄️',
    accentColor: '#38bdf8',
    bgGradient: 'radial-gradient(circle at 50% 30%, rgba(14, 116, 144, 0.45), rgba(15, 23, 42, 0.98))',
    stageCount: 10,
    minRankIndex: 6, // Rank SS
    bgAsset: 'bg_frozen',
    musicTrack: 'bgm_world_4',
    worldModifier: { type: 'essence', bonusPct: 0.20, label: '+20% Essence' }
  },
  {
    id: 5,
    nameKey: 'world.void.name',
    defaultName: 'Umbral Sanctum',
    descriptionKey: 'world.void.desc',
    theme: 'void',
    emoji: '🌌',
    accentColor: '#c084fc',
    bgGradient: 'radial-gradient(circle at 50% 30%, rgba(88, 28, 135, 0.50), rgba(15, 23, 42, 0.98))',
    stageCount: 10,
    minRankIndex: 8, // Rank Awakened
    bgAsset: 'bg_void',
    musicTrack: 'bgm_world_5',
    worldModifier: { type: 'power', bonusPct: 0.25, label: '+25% Power' }
  },
];

export function getCampaignWorldById(worldId: number): CampaignWorld | undefined {
  return CAMPAIGN_WORLDS.find((w) => w.id === worldId);
}

export function getTotalCampaignWorlds(): number {
  return CAMPAIGN_WORLDS.length;
}
