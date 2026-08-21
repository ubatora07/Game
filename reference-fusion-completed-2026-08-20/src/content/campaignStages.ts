import { CampaignStage, CampaignRewards } from './campaignTypes';
import { CAMPAIGN_WORLDS } from './campaignWorlds';
import { getCampaignBossById } from './campaignBosses';

const STAGES_MAP: Record<string, CampaignStage> = {};
const STAGES_LIST: CampaignStage[] = [];

// World enemy pool mapping
const WORLD_ENEMY_POOLS: Record<number, { normal: string[]; elite: string[] }> = {
  1: {
    normal: ['forest_goblin', 'dire_wolf', 'corrupted_treant', 'forest_spirit'],
    elite: ['forest_alpha'],
  },
  2: {
    normal: ['rogue_ninja', 'bamboo_ronin', 'temple_guardian', 'kitsune_shade'],
    elite: ['corrupted_samurai'],
  },
  3: {
    normal: ['flame_imp', 'magma_beast', 'obsidian_golem', 'infernal_sorcerer'],
    elite: ['abyss_executioner'],
  },
  4: {
    normal: ['frost_wolf', 'ice_archer', 'glacier_elemental', 'blizzard_specter'],
    elite: ['frost_wyrm'],
  },
  5: {
    normal: ['void_crawler', 'cosmic_ray', 'astral_colossus', 'singularity_cultist'],
    elite: ['void_harbinger'],
  },
};

function calculateStageHp(globalIndex: number, isBoss: boolean, isMiniBoss: boolean): number {
  // Balanced progression curve starting at ~40 HP up to trillions
  const base = 40 * Math.pow(1.26, globalIndex - 1);
  if (isBoss) return Math.floor(base * 4.5);
  if (isMiniBoss) return Math.floor(base * 2.5);
  return Math.floor(base);
}

function calculateBaseRewards(globalIndex: number, isBoss: boolean): CampaignRewards {
  const gold = Math.floor(8 * Math.pow(1.22, globalIndex - 1));
  const power = Math.floor(12 * Math.pow(1.24, globalIndex - 1));
  
  if (isBoss) {
    return {
      gold: gold * 3,
      power: power * 3,
      crystals: Math.min(25, 2 + Math.floor(globalIndex / 2)),
      essence: Math.min(10, 1 + Math.floor(globalIndex / 5)),
    };
  }
  return { gold, power };
}

function calculateFirstClearRewards(globalIndex: number, worldId: number, stageNum: number, isBoss: boolean): CampaignRewards {
  const base = calculateBaseRewards(globalIndex, isBoss);
  const bossConfig = getCampaignBossById(`boss_${worldId}_${stageNum}`);

  if (bossConfig) {
    return bossConfig.firstClearRewards;
  }

  return {
    gold: base.gold * 5,
    power: base.power * 5,
    crystals: isBoss ? 50 : 5,
    essence: isBoss ? 10 : 0,
  };
}

// Build all 50 Stages
let globalIdx = 1;
for (const world of CAMPAIGN_WORLDS) {
  const pool = WORLD_ENEMY_POOLS[world.id] || WORLD_ENEMY_POOLS[1];

  for (let stageNum = 1; stageNum <= world.stageCount; stageNum++) {
    const stageId = `${world.id}-${stageNum}`;
    const isBoss = stageNum === world.stageCount;
    const isMiniBoss = stageNum === Math.floor(world.stageCount / 2);
    const bossId = (isBoss || isMiniBoss) ? `boss_${world.id}_${stageNum}` : undefined;

    // Stage enemy pool
    const stageEnemyPool = (isBoss || isMiniBoss)
      ? [bossId!]
      : stageNum % 3 === 0
      ? [...pool.normal, ...pool.elite]
      : pool.normal;

    const baseHp = calculateStageHp(globalIdx, isBoss, isMiniBoss);
    const baseRewards = calculateBaseRewards(globalIdx, isBoss);
    const firstClearRewards = calculateFirstClearRewards(globalIdx, world.id, stageNum, isBoss);

    const stage: CampaignStage = {
      id: stageId,
      worldId: world.id,
      stageNumber: stageNum,
      globalIndex: globalIdx,
      isBoss: isBoss || isMiniBoss,
      bossId,
      bossTimerSeconds: isBoss ? 45 : isMiniBoss ? 30 : undefined,
      enemyCount: (isBoss || isMiniBoss) ? 1 : (3 + (stageNum % 3)), // 3 to 5 enemies
      enemyPool: stageEnemyPool,
      difficulty: globalIdx,
      baseHp,
      baseRewards,
      firstClearRewards,
    };

    STAGES_MAP[stageId] = stage;
    STAGES_LIST.push(stage);
    globalIdx++;
  }
}

export function getCampaignStageById(stageId: string): CampaignStage | undefined {
  return STAGES_MAP[stageId];
}

export function getAllCampaignStages(): CampaignStage[] {
  return STAGES_LIST;
}

export function getStagesByWorldId(worldId: number): CampaignStage[] {
  return STAGES_LIST.filter((s) => s.worldId === worldId);
}

export function getNextStageId(currentStageId: string): string | undefined {
  const stage = getCampaignStageById(currentStageId);
  if (!stage) return undefined;

  const nextGlobal = stage.globalIndex + 1;
  const nextStage = STAGES_LIST.find((s) => s.globalIndex === nextGlobal);
  return nextStage?.id;
}

export function getPreviousStageId(currentStageId: string): string | undefined {
  const stage = getCampaignStageById(currentStageId);
  if (!stage || stage.globalIndex <= 1) return undefined;

  const prevGlobal = stage.globalIndex - 1;
  const prevStage = STAGES_LIST.find((s) => s.globalIndex === prevGlobal);
  return prevStage?.id;
}
