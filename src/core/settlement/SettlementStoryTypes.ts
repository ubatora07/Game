export type StoryObjectiveType =
  | 'settlement_level'
  | 'buildings_count'
  | 'raids_defeated'
  | 'craft_equipment'
  | 'hire_mercenary'
  | 'reach_karma';

export interface StoryObjective {
  id: string;
  descKey: string;
  desc: string;
  type: StoryObjectiveType;
  targetValue: number;
}

export interface StoryChapterDefinition {
  id: string;
  chapterNumber: number;
  titleKey: string;
  defaultTitle: string;
  summaryKey: string;
  summary: string;
  loreIntroKey: string;
  loreIntro: string;
  loreOutroKey: string;
  loreOutro: string;
  npcSpeakerKey: string;
  npcSpeaker: string;
  objectives: StoryObjective[];
  rewards: {
    gold: number;
    crystals: number;
    titleId?: string;
    settlementWood?: number;
    settlementStone?: number;
    settlementIron?: number;
  };
}

export type SettlementStoryPath = 'lord' | 'adventurer';

export interface SettlementStorySaveState {
  currentChapterId: string;
  completedChapterIds: string[];
  chosenPath: SettlementStoryPath | null;
}
