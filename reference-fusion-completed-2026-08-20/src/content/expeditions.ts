import { HeroRarity } from './heroes';

export type ExpeditionDuration = 2 | 4 | 8; // Hours

export interface ExpeditionReward {
  crystals: number;
  essence: number;
  goldEquivalentMinutes: number; // e.g. 30 means "grants 30 minutes worth of current passive gold"
}

export interface ExpeditionTemplate {
  id: string;
  nameKey: string;
  durationHours: ExpeditionDuration;
  requiredElement?: 'fire' | 'water' | 'wind' | 'lightning' | 'void' | 'light';
  requiredRarity?: HeroRarity;
  rewards: ExpeditionReward;
}

export const EXPEDITIONS: ExpeditionTemplate[] = [
  {
    id: 'scout_forest',
    nameKey: 'expedition_scout_forest',
    durationHours: 2,
    rewards: {
      crystals: 50,
      essence: 10,
      goldEquivalentMinutes: 15
    }
  },
  {
    id: 'explore_ruins',
    nameKey: 'expedition_explore_ruins',
    durationHours: 4,
    requiredElement: 'fire',
    rewards: {
      crystals: 150,
      essence: 25,
      goldEquivalentMinutes: 45
    }
  },
  {
    id: 'abyssal_dive',
    nameKey: 'expedition_abyssal_dive',
    durationHours: 8,
    requiredRarity: 'epic',
    rewards: {
      crystals: 400,
      essence: 70,
      goldEquivalentMinutes: 120
    }
  }
];

export function getExpeditionById(id: string): ExpeditionTemplate | undefined {
  return EXPEDITIONS.find(e => e.id === id);
}
