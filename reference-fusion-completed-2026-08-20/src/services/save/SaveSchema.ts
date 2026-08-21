import { GameStateData, createInitialState } from '../../core/GameState';
import { DualTeamSaveState, MainCharacterState, MainCharacterSlotId } from '../../core/characters/MainCharacterTypes';
import { PetEvolutionStage, PetInstance, PetSaveState } from '../../core/pets/PetTypes';
import { KarmaBand, KarmaState } from '../../core/karma/KarmaTypes';
import { WorldSaveState } from '../../core/world/WorldStateTypes';
import { CharacterClassId } from '../../content/classes';
import { getPetDefinition } from '../../content/petsCatalog';

export const CURRENT_SAVE_VERSION = 7;
export const SAVE_KEY = 'ANIME_ASCENSION_SAVE_V7';

const CLASS_IDS = new Set<CharacterClassId>(['mage', 'swordsman', 'archer', 'assassin']);
const WORLD_FLAG_IDS = new Set([
  'village_saved',
  'village_ruined',
  'refugees_accepted',
  'refugees_turned_away',
  'smuggler_alliance',
  'smuggler_syndicate_crushed',
  'kingdom_trusted',
  'dark_reputation',
  'sovereign_citadel_erected',
]);

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function safeNonNegativeNumber(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function safeInteger(value: unknown, fallback: number, min: number = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(min, Math.floor(parsed)) : fallback;
}

function sanitizeClassId(value: unknown): CharacterClassId | null {
  return typeof value === 'string' && CLASS_IDS.has(value as CharacterClassId)
    ? value as CharacterClassId
    : null;
}

function sanitizeCharacter(
  raw: unknown,
  slotId: MainCharacterSlotId,
  fallbackName: string,
  defaultUnlocked: boolean
): MainCharacterState {
  const data = isRecord(raw) ? raw : {};
  return {
    slotId,
    name: typeof data.name === 'string' && data.name.trim().length > 0 ? data.name.slice(0, 80) : fallbackName,
    isUnlocked: typeof data.isUnlocked === 'boolean' ? data.isUnlocked : defaultUnlocked,
    classId: sanitizeClassId(data.classId),
    level: safeInteger(data.level, 1, 1),
    xp: safeNonNegativeNumber(data.xp, 0),
    xpToNextLevel: Math.max(1, safeNonNegativeNumber(data.xpToNextLevel, 110)),
    skillPoints: safeInteger(data.skillPoints, 4),
    unlockedSkillNodeIds: Array.isArray(data.unlockedSkillNodeIds)
      ? Array.from(new Set(data.unlockedSkillNodeIds.filter((id: unknown): id is string => typeof id === 'string')))
      : [],
  };
}

function sanitizePartyTeam(raw: unknown): DualTeamSaveState | undefined {
  if (!isRecord(raw)) return undefined;
  const characters = isRecord(raw.characters) ? raw.characters : {};
  const char1 = sanitizeCharacter(characters.char_1, 'char_1', 'Ascendant Hero', true);
  const char2 = sanitizeCharacter(characters.char_2, 'char_2', 'Oathbound Companion', false);
  char1.isUnlocked = true;
  const requestedFocus = raw.activeFocusCharId === 'char_2' ? 'char_2' : 'char_1';
  return {
    characters: { char_1: char1, char_2: char2 },
    activeFocusCharId: requestedFocus === 'char_2' && !char2.isUnlocked ? 'char_1' : requestedFocus,
  };
}

function sanitizePetInstance(raw: unknown, petId: string): PetInstance | null {
  if (!isRecord(raw) || !getPetDefinition(petId)) return null;
  const stageRaw = safeInteger(raw.evolutionStage, 1, 1);
  const evolutionStage = Math.min(3, stageRaw) as PetEvolutionStage;
  const affection = Math.min(100, safeNonNegativeNumber(raw.affection, 0));
  return {
    id: petId,
    name: typeof raw.name === 'string' && raw.name.trim().length > 0
      ? raw.name.slice(0, 80)
      : getPetDefinition(petId)!.defaultName,
    level: safeInteger(raw.level, 1, 1),
    xp: safeNonNegativeNumber(raw.xp, 0),
    xpToNextLevel: Math.max(1, safeNonNegativeNumber(raw.xpToNextLevel, 100)),
    evolutionStage,
    affection,
    unlockedAt: Math.min(Date.now(), safeNonNegativeNumber(raw.unlockedAt, Date.now())),
  };
}

function sanitizePets(raw: unknown): PetSaveState | undefined {
  if (!isRecord(raw)) return undefined;
  const ownedPets: Record<string, PetInstance> = {};
  if (isRecord(raw.ownedPets)) {
    for (const [petId, petRaw] of Object.entries(raw.ownedPets)) {
      const pet = sanitizePetInstance(petRaw, petId);
      if (pet) ownedPets[petId] = pet;
    }
  }
  const activePetId = typeof raw.activePetId === 'string' && ownedPets[raw.activePetId]
    ? raw.activePetId
    : null;
  return { ownedPets, activePetId };
}

function karmaBandForScore(score: number): KarmaBand {
  if (score >= 50) return 'virtuous';
  if (score >= 15) return 'positive';
  if (score <= -50) return 'infamous';
  if (score <= -15) return 'negative';
  return 'neutral';
}

function sanitizeBooleanRecord(raw: unknown, allowedKeys?: Set<string>): Record<string, boolean> {
  if (!isRecord(raw)) return {};
  const result: Record<string, boolean> = {};
  for (const [key, value] of Object.entries(raw)) {
    if ((!allowedKeys || allowedKeys.has(key)) && typeof value === 'boolean') result[key] = value;
  }
  return result;
}

function sanitizeNumberRecord(raw: unknown): Record<string, number> {
  if (!isRecord(raw)) return {};
  const result: Record<string, number> = {};
  for (const [key, value] of Object.entries(raw)) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) result[key] = parsed;
  }
  return result;
}

function sanitizeKarma(raw: unknown): KarmaState | undefined {
  if (!isRecord(raw)) return undefined;
  const scoreValue = Number(raw.score);
  const score = Number.isFinite(scoreValue) ? Math.max(-100, Math.min(100, Math.round(scoreValue))) : 0;
  return {
    score,
    band: karmaBandForScore(score),
    majorChoiceFlags: sanitizeBooleanRecord(raw.majorChoiceFlags),
    factionReputation: sanitizeNumberRecord(raw.factionReputation),
    lifetimeKarmaPositive: safeNonNegativeNumber(raw.lifetimeKarmaPositive, 0),
    lifetimeKarmaNegative: safeNonNegativeNumber(raw.lifetimeKarmaNegative, 0),
  };
}

function sanitizeWorldState(raw: unknown): WorldSaveState | undefined {
  if (!isRecord(raw)) return undefined;
  return {
    currentLifeFlags: sanitizeBooleanRecord(raw.currentLifeFlags, WORLD_FLAG_IDS),
    legacyWorldChronicle: sanitizeBooleanRecord(raw.legacyWorldChronicle, WORLD_FLAG_IDS),
  };
}

function sanitizeAdventureEventCooldowns(raw: unknown): Record<string, number> {
  if (!isRecord(raw)) return {};
  const result: Record<string, number> = {};
  for (const [eventId, timestamp] of Object.entries(raw)) {
    const parsed = Number(timestamp);
    if (Number.isFinite(parsed) && parsed >= 0) result[eventId] = parsed;
  }
  return result;
}

export function sanitizeGameState(data: any): GameStateData {
  const initial = createInitialState();
  if (!data || typeof data !== 'object') {
    return initial;
  }

  // Safe number extraction for the legacy/core non-negative numeric fields.
  const safeNumber = safeNonNegativeNumber;

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
    partyTeam: sanitizePartyTeam(data.partyTeam),
    pets: sanitizePets(data.pets),
    karma: sanitizeKarma(data.karma),
    adventureEvents: isRecord(data.adventureEvents)
      ? {
          completedOnceOnly: Array.isArray(data.adventureEvents.completedOnceOnly)
            ? Array.from(new Set(data.adventureEvents.completedOnceOnly.filter((id: unknown): id is string => typeof id === 'string')))
            : [],
          eventCooldowns: sanitizeAdventureEventCooldowns(data.adventureEvents.eventCooldowns),
        }
      : undefined,
    worldState: sanitizeWorldState(data.worldState),
  };
}
