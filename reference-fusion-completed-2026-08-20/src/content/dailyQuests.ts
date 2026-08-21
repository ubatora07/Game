export type DailyQuestType = 'train' | 'summon' | 'tower' | 'upgrade';

export interface DailyQuestTemplate {
  id: string;
  type: DailyQuestType;
  descriptionKey: string;
  target: number;
  rewardCrystals: number;
}

export const DAILY_QUESTS: DailyQuestTemplate[] = [
  {
    id: 'daily_train_500',
    type: 'train',
    descriptionKey: 'quest.daily.train.500',
    target: 500,
    rewardCrystals: 50
  },
  {
    id: 'daily_summon_1',
    type: 'summon',
    descriptionKey: 'quest.daily.summon.1',
    target: 1,
    rewardCrystals: 100
  },
  {
    id: 'daily_tower_3',
    type: 'tower',
    descriptionKey: 'quest.daily.tower.3',
    target: 3,
    rewardCrystals: 75
  },
  {
    id: 'daily_upgrade_10',
    type: 'upgrade',
    descriptionKey: 'quest.daily.upgrade.10',
    target: 10,
    rewardCrystals: 50
  }
];

export function getDailyQuestTemplate(id: string): DailyQuestTemplate | undefined {
  return DAILY_QUESTS.find(q => q.id === id);
}
