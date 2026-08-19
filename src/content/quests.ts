import { getCampaignStageById } from './campaignStages';

export interface QuestReward {
  gold?: number;
  goldSeconds?: number; // Grants X seconds of current passive gold production
  powerSeconds?: number; // Grants X seconds of current passive power production
  crystals?: number;
  essence?: number;
  souls?: number;
}

export interface QuestDefinition {
  id: string;
  nameKey: string;
  descKey: string;
  targetCount: number;
  reward: QuestReward;
  getProgress: (state: any) => number;
}

export const QUESTS: readonly QuestDefinition[] = [
  // 1. Chapter 1: Journey Begins (Путь Культиватора)
  {
    id: 'quest_train_10',
    nameKey: 'quest.train_10.name',
    descKey: 'quest.train_10.desc',
    targetCount: 10,
    reward: { gold: 15, crystals: 10 },
    getProgress: (s) => s.stats?.totalClicks || 0
  },
  {
    id: 'quest_campaign_kill_5',
    nameKey: 'quest.campaign_kill_5.name',
    descKey: 'quest.campaign_kill_5.desc',
    targetCount: 5,
    reward: { gold: 25, crystals: 15 },
    getProgress: (s) => s.stats?.campaignEnemiesDefeated || 0
  },
  {
    id: 'quest_build_1',
    nameKey: 'quest.build_1.name',
    descKey: 'quest.build_1.desc',
    targetCount: 1,
    reward: { gold: 50, crystals: 20 },
    getProgress: (s) => Object.values(s.buildings || {}).reduce((a: number, b: any) => a + (Number(b) || 0), 0)
  },
  {
    id: 'quest_reach_stage_1_3',
    nameKey: 'quest.reach_stage_1_3.name',
    descKey: 'quest.reach_stage_1_3.desc',
    targetCount: 3,
    reward: { gold: 80, crystals: 25 },
    getProgress: (s) => getCampaignStageById(s.campaign?.highestStageReached)?.globalIndex || 1
  },

  // 2. Chapter 2: First Cultivation (Первое Просветление)
  {
    id: 'quest_build_10_dojo',
    nameKey: 'quest.dojo_10.name',
    descKey: 'quest.dojo_10.desc',
    targetCount: 10,
    reward: { gold: 150, crystals: 30 },
    getProgress: (s) => s.buildings?.dojo || 0
  },
  {
    id: 'quest_rank_d',
    nameKey: 'quest.rank_d.name',
    descKey: 'quest.rank_d.desc',
    targetCount: 1,
    reward: { gold: 300, crystals: 40 },
    getProgress: (s) => s.rankIndex || 0
  },
  {
    id: 'quest_defeat_elite_1',
    nameKey: 'quest.defeat_elite_1.name',
    descKey: 'quest.defeat_elite_1.desc',
    targetCount: 1,
    reward: { gold: 250, crystals: 35 },
    getProgress: (s) => s.stats?.campaignElitesDefeated || 0
  },
  {
    id: 'quest_build_10_chamber',
    nameKey: 'quest.chamber_10.name',
    descKey: 'quest.chamber_10.desc',
    targetCount: 10,
    reward: { goldSeconds: 60, crystals: 40 },
    getProgress: (s) => s.buildings?.meditation_chamber || 0
  },

  // 3. Chapter 3: Into the Wild (Сердце Леса)
  {
    id: 'quest_reach_stage_1_5',
    nameKey: 'quest.reach_stage_1_5.name',
    descKey: 'quest.reach_stage_1_5.desc',
    targetCount: 5,
    reward: { gold: 500, crystals: 50 },
    getProgress: (s) => getCampaignStageById(s.campaign?.highestStageReached)?.globalIndex || 1
  },
  {
    id: 'quest_defeat_boss_1',
    nameKey: 'quest.defeat_boss_1.name',
    descKey: 'quest.defeat_boss_1.desc',
    targetCount: 1,
    reward: { gold: 1000, crystals: 75, essence: 25 },
    getProgress: (s) => s.stats?.campaignBossesDefeated || 0
  },
  {
    id: 'quest_reach_stage_1_10',
    nameKey: 'quest.reach_stage_1_10.name',
    descKey: 'quest.reach_stage_1_10.desc',
    targetCount: 10,
    reward: { gold: 2000, crystals: 100, essence: 50 },
    getProgress: (s) => getCampaignStageById(s.campaign?.highestStageReached)?.globalIndex || 1
  },
  {
    id: 'quest_clear_world_1',
    nameKey: 'quest.clear_world_1.name',
    descKey: 'quest.clear_world_1.desc',
    targetCount: 1,
    reward: { crystals: 500, essence: 150 },
    getProgress: (s) => s.stats?.campaignWorldsCleared || 0
  },

  // 4. Chapter 4: Tower & Sect (Башня и Орден)
  {
    id: 'quest_tower_5',
    nameKey: 'quest.tower_5.name',
    descKey: 'quest.tower_5.desc',
    targetCount: 5,
    reward: { crystals: 50, essence: 25 },
    getProgress: (s) => s.towerFloor || 1
  },
  {
    id: 'quest_tower_10',
    nameKey: 'quest.tower_10.name',
    descKey: 'quest.tower_10.desc',
    targetCount: 10,
    reward: { crystals: 100, essence: 50 },
    getProgress: (s) => s.towerFloor || 1
  },
  {
    id: 'quest_summon_1',
    nameKey: 'quest.summon_1.name',
    descKey: 'quest.summon_1.desc',
    targetCount: 1,
    reward: { crystals: 100, essence: 30 },
    getProgress: (s) => s.stats?.totalSummons || 0
  },
  {
    id: 'quest_heroes_3',
    nameKey: 'quest.heroes_3.name',
    descKey: 'quest.heroes_3.desc',
    targetCount: 3,
    reward: { essence: 60, crystals: 150 },
    getProgress: (s) => Object.keys(s.heroes || {}).length
  },

  // 5. Chapter 5: World Conquest (Покорение Миров)
  {
    id: 'quest_reach_stage_2_5',
    nameKey: 'quest.reach_stage_2_5.name',
    descKey: 'quest.reach_stage_2_5.desc',
    targetCount: 15,
    reward: { crystals: 300, essence: 100 },
    getProgress: (s) => getCampaignStageById(s.campaign?.highestStageReached)?.globalIndex || 1
  },
  {
    id: 'quest_defeat_boss_5',
    nameKey: 'quest.defeat_boss_5.name',
    descKey: 'quest.defeat_boss_5.desc',
    targetCount: 5,
    reward: { crystals: 600, essence: 200 },
    getProgress: (s) => s.stats?.campaignBossesDefeated || 0
  },
  {
    id: 'quest_rank_b',
    nameKey: 'quest.rank_b.name',
    descKey: 'quest.rank_b.desc',
    targetCount: 3,
    reward: { crystals: 400, essence: 150 },
    getProgress: (s) => s.rankIndex || 0
  },
  {
    id: 'quest_build_total_50',
    nameKey: 'quest.build_50.name',
    descKey: 'quest.build_50.desc',
    targetCount: 50,
    reward: { goldSeconds: 90, crystals: 200, essence: 100 },
    getProgress: (s) => Object.values(s.buildings || {}).reduce((a: number, b: any) => a + (Number(b) || 0), 0)
  },

  // 6. Chapter 6: Samsara (Круг Перерождений)
  {
    id: 'quest_rank_s',
    nameKey: 'quest.rank_s.name',
    descKey: 'quest.rank_s.desc',
    targetCount: 5,
    reward: { crystals: 800, essence: 300 },
    getProgress: (s) => s.rankIndex || 0
  },
  {
    id: 'quest_reincarnate_1',
    nameKey: 'quest.reincarnate_1.name',
    descKey: 'quest.reincarnate_1.desc',
    targetCount: 1,
    reward: { crystals: 1000, essence: 500, souls: 5 },
    getProgress: (s) => s.reincarnationCount || 0
  }
];
