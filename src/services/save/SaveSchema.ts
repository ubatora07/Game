import { GameStateData, createInitialState } from '../../core/GameState';

export const CURRENT_SAVE_VERSION = 6;
export const SAVE_KEY = 'ANIME_ASCENSION_SAVE_V6';

export function sanitizeGameState(data: any): GameStateData {
  const initial = createInitialState();
  if (!data || typeof data !== 'object') {
    return initial;
  }

  // Safe number extraction
  const safeNumber = (val: any, fallback: number): number => {
    const n = Number(val);
    return isNaN(n) || !isFinite(n) || n < 0 ? fallback : n;
  };

  return {
    version: CURRENT_SAVE_VERSION,
    power: safeNumber(data.power, 0),
    gold: safeNumber(data.gold, 0),
    crystals: safeNumber(data.crystals, 150),
    essence: safeNumber(data.essence, 0),
    souls: safeNumber(data.souls, 0),

    rankId: typeof data.rankId === 'string' ? data.rankId : 'E',
    rankIndex: safeNumber(data.rankIndex, 0),

    buildings: typeof data.buildings === 'object' && data.buildings !== null ? data.buildings : {},
    upgrades: typeof data.upgrades === 'object' && data.upgrades !== null ? data.upgrades : {},
    heroes: typeof data.heroes === 'object' && data.heroes !== null ? data.heroes : {},
    soulSkills: typeof data.soulSkills === 'object' && data.soulSkills !== null ? data.soulSkills : {},
    
    relics: typeof data.relics === 'object' && data.relics !== null ? data.relics : {},
    equippedRelics: Array.isArray(data.equippedRelics) ? data.equippedRelics.slice(0, 3) : [null, null, null],
    
    expeditions: Array.isArray(data.expeditions) ? data.expeditions : [],

    lastDailyResetAt: safeNumber(data.lastDailyResetAt, 0),
    lastFreeSummonAdAt: safeNumber(data.lastFreeSummonAdAt, 0),
    loginStreak: safeNumber(data.loginStreak, 0),
    loginRewardClaimed: Boolean(data.loginRewardClaimed),
    dailyQuests: Array.isArray(data.dailyQuests) ? data.dailyQuests : [],

    towerFloor: Math.max(1, safeNumber(data.towerFloor, 1)),
    towerMaxFloor: Math.max(1, safeNumber(data.towerMaxFloor, 1)),
    reincarnationCount: safeNumber(data.reincarnationCount, 0),

    campaign: {
      currentWorldId: Math.max(1, safeNumber(data.campaign?.currentWorldId, 1)),
      currentStageId: typeof data.campaign?.currentStageId === 'string' ? data.campaign.currentStageId : '1-1',
      currentEncounter: Math.max(1, safeNumber(data.campaign?.currentEncounter, 1)),
      highestWorldReached: Math.max(1, safeNumber(data.campaign?.highestWorldReached, 1)),
      highestStageReached: typeof data.campaign?.highestStageReached === 'string' ? data.campaign.highestStageReached : '1-1',
      firstClears: Array.isArray(data.campaign?.firstClears) ? data.campaign.firstClears : [],
      campaignMode: ['progress', 'farm', 'boss_blocked', 'rush'].includes(data.campaign?.campaignMode) ? data.campaign.campaignMode : 'progress',
      autoAdvance: typeof data.campaign?.autoAdvance === 'boolean' ? data.campaign.autoAdvance : true,
      farmStageId: typeof data.campaign?.farmStageId === 'string' ? data.campaign.farmStageId : '1-1',
      bossRetryState: typeof data.campaign?.bossRetryState === 'object' && data.campaign.bossRetryState !== null ? data.campaign.bossRetryState : null,
    },

    completedQuests: Array.isArray(data.completedQuests) ? data.completedQuests : [],
    claimedAchievements: Array.isArray(data.claimedAchievements) ? data.claimedAchievements : [],

    combo: {
      count: 0,
      multiplier: 1.0,
      timer: 0
    },
    randomEvent: {
      active: false,
      type: 'instant_power',
      expiresAt: 0,
      xPct: 50,
      yPct: 50
    },

    stats: {
      totalClicks: safeNumber(data.stats?.totalClicks, 0),
      totalCrits: safeNumber(data.stats?.totalCrits, 0),
      totalBuildingsOwned: safeNumber(data.stats?.totalBuildingsOwned, 0),
      lifetimePower: safeNumber(data.stats?.lifetimePower, 0),
      lifetimeGold: safeNumber(data.stats?.lifetimeGold, 0),
      campaignGoldEarned: safeNumber(data.stats?.campaignGoldEarned, 0),
      campaignPowerEarned: safeNumber(data.stats?.campaignPowerEarned, 0),
      campaignCrystalsEarned: safeNumber(data.stats?.campaignCrystalsEarned, 0),
      campaignEnemiesDefeated: safeNumber(data.stats?.campaignEnemiesDefeated, 0),
      campaignElitesDefeated: safeNumber(data.stats?.campaignElitesDefeated, 0),
      campaignStagesCleared: safeNumber(data.stats?.campaignStagesCleared, 0),
      campaignBossesDefeated: safeNumber(data.stats?.campaignBossesDefeated, 0),
      campaignWorldsCleared: safeNumber(data.stats?.campaignWorldsCleared, 0),
      totalSummons: safeNumber(data.stats?.totalSummons, 0),
      playtimeSeconds: safeNumber(data.stats?.playtimeSeconds, 0),
      firstPlayedAt: safeNumber(data.stats?.firstPlayedAt, Date.now())
    },
    buffs: {
      celestialSurgeEndsAt: safeNumber(data.buffs?.celestialSurgeEndsAt, 0),
      adPowerSurgeEndsAt: safeNumber(data.buffs?.adPowerSurgeEndsAt, 0),
      frenzyEndsAt: safeNumber(data.buffs?.frenzyEndsAt, 0)
    },
    settings: {
      soundEnabled: typeof data.settings?.soundEnabled === 'boolean' ? data.settings.soundEnabled : true,
      musicEnabled: typeof data.settings?.musicEnabled === 'boolean' ? data.settings.musicEnabled : true,
      soundVolume: safeNumber(data.settings?.soundVolume, 0.7),
      musicVolume: safeNumber(data.settings?.musicVolume, 0.4),
      reducedMotion: Boolean(data.settings?.reducedMotion),
      screenShake: typeof data.settings?.screenShake === 'boolean' ? data.settings.screenShake : true,
      notation: data.settings?.notation === 'scientific' ? 'scientific' : 'standard',
      language: data.settings?.language === 'en' ? 'en' : 'ru'
    },
    lastSeenAt: Math.min(Date.now(), safeNumber(data.lastSeenAt, Date.now())), // Anti-clock manipulation forward clamp

    // RPG Expansion V3 Subdomains
    settlement: typeof data.settlement === 'object' && data.settlement !== null ? data.settlement : undefined,
    crafting: typeof data.crafting === 'object' && data.crafting !== null ? data.crafting : undefined,
    market: typeof data.market === 'object' && data.market !== null ? data.market : undefined,
    mercenaries: typeof data.mercenaries === 'object' && data.mercenaries !== null ? data.mercenaries : undefined,
    titles: typeof data.titles === 'object' && data.titles !== null ? data.titles : undefined,
    settlementDefense: typeof data.settlementDefense === 'object' && data.settlementDefense !== null ? data.settlementDefense : undefined,
    settlementStory: typeof data.settlementStory === 'object' && data.settlementStory !== null ? data.settlementStory : undefined,
    legacyEndings: typeof data.legacyEndings === 'object' && data.legacyEndings !== null ? data.legacyEndings : undefined,
    worldState: typeof data.worldState === 'object' && data.worldState !== null ? data.worldState : undefined,
  };
}
