import { CharacterClassId, getClassById } from '../content/classes';

export interface RPGSimulationProfile {
  name: string;
  primaryClass: CharacterClassId;
  secondaryClass?: CharacterClassId;
  playstyle: 'active' | 'idle';
  teamMode: 'single' | 'dual';
  rhythmEnabled: boolean;
  rhythmAccuracyPct?: number; // 0 to 100
  karmaAlignment: 'positive' | 'negative' | 'neutral';
  marketStrategy: 'none' | 'elixirs_only' | 'aggressive';
}

export interface RPGSimulationResult {
  profile: RPGSimulationProfile;
  simulationSeconds: number;
  stagesCleared: number;
  worldReached: number;
  totalGoldEarned: number;
  totalSoulsEarned: number;
  effectiveDps: number;
  reincarnationRecommendedAtSeconds: number;
  secondCharacterContributionPct: number;
  karmaValueMultiplier: number;
  marketBoostDpsPct: number;
}

export class RPGCoreSimulator {
  public static runSimulation(
    profile: RPGSimulationProfile,
    durationSeconds: number = 600
  ): RPGSimulationResult {
    const class1 = getClassById(profile.primaryClass);
    const baseAtkMult1 = class1?.baseStats.attackMultiplier ?? 1.0;
    const baseSpeed1 = class1?.baseStats.attackSpeedMultiplier ?? 1.0;
    const baseCrit1 = (class1?.baseStats.critChanceBonus ?? 0.05) + 0.05;
    const baseCritDmg1 = 1.5 + (class1?.baseStats.critDamageBonus ?? 0);

    let totalRawDps = 100 * baseAtkMult1 * baseSpeed1 * (1 + baseCrit1 * (baseCritDmg1 - 1));

    // Secondary Character contribution
    let secondCharDps = 0;
    if (profile.teamMode === 'dual' && profile.secondaryClass) {
      const class2 = getClassById(profile.secondaryClass);
      const baseAtkMult2 = class2?.baseStats.attackMultiplier ?? 1.0;
      const baseSpeed2 = class2?.baseStats.attackSpeedMultiplier ?? 1.0;
      const baseCrit2 = (class2?.baseStats.critChanceBonus ?? 0.05) + 0.05;
      const baseCritDmg2 = 1.5 + (class2?.baseStats.critDamageBonus ?? 0);
      secondCharDps = 100 * baseAtkMult2 * baseSpeed2 * (1 + baseCrit2 * (baseCritDmg2 - 1)) * 0.45; // 45% base partner share
      totalRawDps += secondCharDps;
    }

    const secondCharContributionPct =
      totalRawDps > 0 ? (secondCharDps / totalRawDps) * 100 : 0;

    // Active clicking & Rhythm multiplier
    let activeClickMultiplier = 1.0;
    if (profile.playstyle === 'active') {
      activeClickMultiplier = 1.8; // Active manual clicking adds ~80% baseline
      if (profile.rhythmEnabled) {
        const accuracy = (profile.rhythmAccuracyPct ?? 90) / 100;
        // Rhythm streak bonuses: +30% to +50% extra DPS + Gold bonus
        activeClickMultiplier += 0.5 * accuracy;
      }
    }

    // Market boosts
    let marketBoostDpsPct = 0;
    let marketGoldBoost = 1.0;
    if (profile.marketStrategy === 'elixirs_only') {
      marketBoostDpsPct = 20;
      marketGoldBoost = 1.15;
    } else if (profile.marketStrategy === 'aggressive') {
      marketBoostDpsPct = 45;
      marketGoldBoost = 1.35;
    }

    // Karma modifiers
    let karmaValueMultiplier = 1.0;
    let karmaGoldMultiplier = 1.0;
    if (profile.karmaAlignment === 'positive') {
      karmaValueMultiplier = 1.25; // Blessings & hero synergy
    } else if (profile.karmaAlignment === 'negative') {
      karmaGoldMultiplier = 1.35; // Plunder / extortion yield +35% gold
      karmaValueMultiplier = 0.9;
    }

    const effectiveDps =
      totalRawDps *
      activeClickMultiplier *
      (1 + marketBoostDpsPct / 100) *
      karmaValueMultiplier;

    // Simulate stage advancement
    // Base stage monster HP: 500 * (1.18 ^ stage)
    let currentStage = 1;
    let elapsed = 0;
    let totalGoldEarned = 0;

    while (elapsed < durationSeconds && currentStage < 250) {
      const monsterHp = 500 * Math.pow(1.15, currentStage - 1);
      const timeToKill = Math.max(0.2, monsterHp / effectiveDps);

      if (elapsed + timeToKill > durationSeconds) {
        break;
      }

      elapsed += timeToKill;
      const stageGold = 50 * Math.pow(1.14, currentStage - 1) * marketGoldBoost * karmaGoldMultiplier;
      totalGoldEarned += stageGold;
      currentStage += 1;
    }

    const stagesCleared = currentStage - 1;
    const worldReached = Math.floor(stagesCleared / 25) + 1;
    const totalSoulsEarned = Math.floor(Math.pow(stagesCleared / 10, 1.8) * 10);

    // Recommended Reincarnation timing: when stage clearance time exceeds 15 seconds per stage
    const optimalPrestigeStage = Math.max(
      15,
      Math.floor(Math.log(effectiveDps * 15 / 500) / Math.log(1.15))
    );
    const reincarnationRecommendedAtSeconds = Math.min(
      durationSeconds,
      Math.max(300, Math.floor((optimalPrestigeStage * 12) / (effectiveDps / 100)))
    );

    return {
      profile,
      simulationSeconds: durationSeconds,
      stagesCleared,
      worldReached,
      totalGoldEarned: Math.round(totalGoldEarned),
      totalSoulsEarned,
      effectiveDps: Math.round(effectiveDps * 10) / 10,
      reincarnationRecommendedAtSeconds,
      secondCharacterContributionPct: Math.round(secondCharContributionPct * 10) / 10,
      karmaValueMultiplier,
      marketBoostDpsPct,
    };
  }
}
