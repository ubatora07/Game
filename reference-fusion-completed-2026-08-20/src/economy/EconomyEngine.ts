import { GameStateData } from '../core/GameState';
import { getRankById } from '../content/ranks';
import { BUILDINGS, getBuildingMilestoneMultiplier } from '../content/buildings';
import { UPGRADES } from '../content/upgrades';
import { getHeroById, getHeroStarMultiplier } from '../content/heroes';
import { SOUL_TREE } from '../content/soulTree';
import { RelicSystem } from '../systems/RelicSystem';
import { modifierResolver } from '../core/modifiers/ModifierResolver';

export interface BuildingProductionDetail {
  buildingId: string;
  owned: number;
  basePowerPerSec: number;
  baseGoldPerSec: number;
  milestoneMultiplier: number;
  upgradeMultiplier: number;
  totalBuildingPowerPerSec: number;
  totalBuildingGoldPerSec: number;
  contributionPct: number;
}

export interface ProductionBreakdown {
  rawBuildingsPower: number;
  rankMultiplier: number;
  heroPowerMultiplier: number;
  soulPowerMultiplier: number;
  globalUpgradesMultiplier: number;
  activeSurgeMultiplier: number;
  totalPowerPerSec: number;
  totalGoldPerSec: number;
}

export interface EconomyMetrics {
  clickPower: number;
  clickGold: number;
  critChance: number;
  critMultiplier: number;
  baseBuildingsPowerPerSec: number;
  baseBuildingsGoldPerSec: number;
  passivePowerPerSec: number;
  passiveGoldPerSec: number;
  towerCombatPower: number;
  rankMultiplier: number;
  globalUpgradesMultiplier: number;
  heroPowerMultiplier: number;
  heroGoldMultiplier: number;
  heroTowerMultiplier: number;
  soulPowerMultiplier: number;
  soulGoldMultiplier: number;
  activeSurgeMultiplier: number;
  comboMultiplier: number;
  maxOfflineSeconds: number;
  offlineEfficiency: number;
  buildingCostDiscount: number;
  breakdown: ProductionBreakdown;
  buildingDetails: Record<string, BuildingProductionDetail>;
}

export class EconomyEngine {
  public static calculateMetrics(state: GameStateData, now: number = Date.now()): EconomyMetrics {
    // 1. Ascension Rank Multiplier (non-compounding, direct multiplier)
    const rank = getRankById(state.rankId);
    const soulRankLevel = state.soulSkills['soul_rank'] || 0;
    const rankBonusFactor = 1.0 + soulRankLevel * 0.10;
    const effectiveRankMult = 1.0 + (rank.multiplier - 1.0) * rankBonusFactor;

    // 2. Soul Tree Multipliers (4 Branches: Strength, Wealth, Spirit, Ascension)
    let soulPowerMult = 1.0;
    let soulTrainMult = 1.0;
    let soulBuildingMult = 1.0;

    let soulGoldMult = 1.0;
    let soulCostReduction = 0;

    let soulOfflineBonus = 0;
    let extraOfflineHours = 0;
    let soulCritChanceBonus = 0;
    let soulCritDmgBonus = 0;

    let soulTowerMult = 1.0;

    for (const skill of SOUL_TREE) {
      const level = state.soulSkills[skill.id] || 0;
      if (level > 0) {
        switch (skill.id) {
          case 'soul_power':
            soulPowerMult += level * skill.baseEffect;
            break;
          case 'soul_train':
            soulTrainMult += level * skill.baseEffect;
            break;
          case 'soul_building':
            soulBuildingMult += level * skill.baseEffect;
            break;
          case 'soul_gold':
            soulGoldMult += level * skill.baseEffect;
            break;
          case 'soul_cost':
            soulCostReduction += level * skill.baseEffect;
            break;
          case 'soul_offline':
            soulOfflineBonus += level * skill.baseEffect;
            extraOfflineHours += level * 1;
            break;
          case 'soul_crit':
            soulCritChanceBonus += level * skill.baseEffect;
            soulCritDmgBonus += level * 0.25;
            break;
          case 'soul_tower':
            soulTowerMult += level * skill.baseEffect;
            break;
        }
      }
    }

    soulCostReduction = Math.min(0.35, soulCostReduction); // Cap at -35%

    // 3. Hero Modifiers (Controlled additive stacking within category)
    let heroPowerAdd = 0;
    let heroGoldAdd = 0;
    let heroCritChanceAdd = 0;
    let heroCritMultAdd = 0;
    let heroOfflineAdd = 0;
    let heroTowerAdd = 0;

    for (const [heroId, heroData] of Object.entries(state.heroes || {})) {
      const heroDef = getHeroById(heroId);
      if (heroDef && heroData.stars > 0) {
        const starMult = getHeroStarMultiplier(heroData.stars);
        const effValue = heroDef.modifier.baseValue * starMult;

        switch (heroDef.modifier.type) {
          case 'power_pct':
            heroPowerAdd += effValue;
            break;
          case 'gold_pct':
            heroGoldAdd += effValue;
            break;
          case 'crit_chance':
            heroCritChanceAdd += effValue;
            break;
          case 'crit_mult':
            heroCritMultAdd += effValue;
            break;
          case 'offline_pct':
            heroOfflineAdd += effValue;
            break;
          case 'tower_atk_pct':
            heroTowerAdd += effValue;
            break;
          case 'all_pct':
            heroPowerAdd += effValue;
            heroGoldAdd += effValue;
            heroTowerAdd += effValue;
            heroOfflineAdd += effValue;
            break;
        }
      }
    }

    const heroPowerMultiplier = 1.0 + heroPowerAdd;
    const heroGoldMultiplier = 1.0 + heroGoldAdd;
    const heroTowerMultiplier = 1.0 + heroTowerAdd;

    // 4. Temporary Buffs
    let activeSurgeMultiplier = 1.0;
    if (state.buffs.celestialSurgeEndsAt > now) {
      activeSurgeMultiplier *= 2.0;
    }
    if (state.buffs.adPowerSurgeEndsAt > now) {
      activeSurgeMultiplier *= 2.0;
    }
    if (state.buffs.frenzyEndsAt > now) {
      activeSurgeMultiplier *= 3.0;
    }

    // 5. Upgrades Evaluation (Training, Building, Synergy, Global, Economy, Meta)
    let flatTrainingPower = 1;
    let clickPowerMult = 1.0;
    let upgradeCritChanceAdd = 0;
    let upgradeCritMultAdd = 0;
    let globalPowerUpgradesMult = 1.0;
    let globalGoldUpgradesMult = 1.0;
    let upgradeBuildingCostReduction = 0;
    let upgradeTowerMult = 1.0;
    let extraOfflineCapFromUpgrades = 0;

    const buildingUpgradeMultipliers: Record<string, number> = {};
    const relicSynergyMultiplier = RelicSystem.getEquippedEffectValue(state, 'synergy_amp') || 1.0;

    for (const upg of UPGRADES) {
      const lvl = state.upgrades[upg.id] || 0;
      if (lvl > 0) {
        if (upg.effectType === 'click_power_flat') {
          flatTrainingPower += lvl * upg.effectValue;
        } else if (upg.effectType === 'click_power_mult') {
          clickPowerMult *= Math.pow(upg.effectValue, lvl);
        } else if (upg.effectType === 'crit_chance') {
          upgradeCritChanceAdd += lvl * upg.effectValue;
        } else if (upg.effectType === 'crit_mult') {
          upgradeCritMultAdd += lvl * upg.effectValue;
        } else if (upg.effectType === 'building_mult' && upg.targetBuildingId) {
          buildingUpgradeMultipliers[upg.targetBuildingId] = 
            (buildingUpgradeMultipliers[upg.targetBuildingId] || 1.0) * Math.pow(upg.effectValue, lvl);
        } else if (upg.effectType === 'synergy_boost' && upg.targetBuildingId && upg.sourceBuildingId) {
          // Cross-tier synergy (e.g. Celestial Temples boosting Dojos)
          const sourceOwned = state.buildings[upg.sourceBuildingId] || 0;
          const synergyMult = 1.0 + sourceOwned * (lvl * upg.effectValue) * relicSynergyMultiplier;
          buildingUpgradeMultipliers[upg.targetBuildingId] = 
            (buildingUpgradeMultipliers[upg.targetBuildingId] || 1.0) * synergyMult;
        } else if (upg.effectType === 'global_power_mult') {
          globalPowerUpgradesMult += lvl * upg.effectValue;
        } else if (upg.effectType === 'global_gold_mult') {
          globalGoldUpgradesMult += lvl * upg.effectValue;
        } else if (upg.effectType === 'building_cost_reduction') {
          upgradeBuildingCostReduction += lvl * upg.effectValue;
        } else if (upg.effectType === 'tower_dps_mult') {
          upgradeTowerMult += lvl * upg.effectValue;
        } else if (upg.effectType === 'offline_cap_hours') {
          extraOfflineCapFromUpgrades += lvl * upg.effectValue;
        }
      }
    }

    const totalBuildingCostDiscount = Math.min(0.50, soulCostReduction + upgradeBuildingCostReduction);

    // 6. Buildings Breakdown & Raw Production
    let rawBuildingsPowerPerSec = 0;
    let rawBuildingsGoldPerSec = 0;
    const buildingDetails: Record<string, BuildingProductionDetail> = {};

    for (const b of BUILDINGS) {
      const owned = state.buildings[b.id] || 0;
      const milestoneMult = getBuildingMilestoneMultiplier(owned);
      const upgMult = buildingUpgradeMultipliers[b.id] || 1.0;

      const singleBuildingPower = b.baseProduction * milestoneMult * upgMult * soulBuildingMult;
      const singleBuildingGold = b.baseGoldProduction * milestoneMult * upgMult;

      const totalPowerForTier = owned * singleBuildingPower;
      const totalGoldForTier = owned * singleBuildingGold;

      rawBuildingsPowerPerSec += totalPowerForTier;
      rawBuildingsGoldPerSec += totalGoldForTier;

      buildingDetails[b.id] = {
        buildingId: b.id,
        owned,
        basePowerPerSec: b.baseProduction,
        baseGoldPerSec: b.baseGoldProduction,
        milestoneMultiplier: milestoneMult,
        upgradeMultiplier: upgMult,
        totalBuildingPowerPerSec: totalPowerForTier,
        totalBuildingGoldPerSec: totalGoldForTier,
        contributionPct: 0
      };
    }

    // Calculate contribution percentages
    if (rawBuildingsPowerPerSec > 0) {
      for (const b of BUILDINGS) {
        buildingDetails[b.id].contributionPct = 
          Math.floor((buildingDetails[b.id].totalBuildingPowerPerSec / rawBuildingsPowerPerSec) * 100);
      }
    }

    // 7. Global Multiplier Aggregation
    const totalGlobalPowerMult = effectiveRankMult * heroPowerMultiplier * soulPowerMult * globalPowerUpgradesMult * activeSurgeMultiplier;
    const totalGlobalGoldMult = heroGoldMultiplier * soulGoldMult * globalGoldUpgradesMult * activeSurgeMultiplier;

    const modifierContext = {
      currentWorld: state.campaign?.currentWorldId,
      currentStage: state.campaign?.currentStageId,
    };

    // Central modifier layers are resolved after the legacy economy categories. This
    // makes equipment/classes/titles/pets that register power/gold modifiers actually
    // participate in production without duplicating their source-specific formulas here.
    const passivePowerPerSec = modifierResolver.resolve(
      'powerMultiplier',
      rawBuildingsPowerPerSec * totalGlobalPowerMult,
      modifierContext,
    );
    const passiveGoldPerSec = modifierResolver.resolve(
      'goldMultiplier',
      rawBuildingsGoldPerSec * totalGlobalGoldMult,
      modifierContext,
    );

    // 8. Decoupled Active Click / Manual Training Economy
    const comboMult = state.combo?.multiplier || 1.0;
    const baseClickPower = Math.max(1,
      flatTrainingPower * clickPowerMult * effectiveRankMult * heroPowerMultiplier * soulTrainMult * comboMult * (activeSurgeMultiplier > 1 ? 2.0 : 1.0)
    );
    const baseClickGold = Math.max(1,
      1 * (1 + (flatTrainingPower - 1) * 0.5) * heroGoldMultiplier * soulGoldMult * (activeSurgeMultiplier > 1 ? 2.0 : 1.0)
    );
    const clickPower = Math.max(1, Math.floor(modifierResolver.resolve('powerMultiplier', baseClickPower, modifierContext)));
    const clickGold = Math.max(1, Math.floor(modifierResolver.resolve('goldMultiplier', baseClickGold, modifierContext)));

    const critChance = Math.min(0.75, 0.05 + heroCritChanceAdd + soulCritChanceBonus + upgradeCritChanceAdd);
    const critMultiplier = 5.0 + heroCritMultAdd + soulCritDmgBonus + upgradeCritMultAdd;

    // 9. Tower Combat Power
    const baseCombatPower = Math.max(10, Math.floor(passivePowerPerSec * 0.75 + clickPower * 3));
    const towerCombatPower = Math.floor(baseCombatPower * heroTowerMultiplier * soulTowerMult * upgradeTowerMult);

    // 10. Offline Configuration
    const maxOfflineSeconds = (8 + extraOfflineHours + extraOfflineCapFromUpgrades) * 3600;
    const relicOfflineEfficiency = RelicSystem.getEquippedEffectValue(state, 'offline_efficiency');
    const offlineEfficiency = Math.min(1.0, 0.50 + heroOfflineAdd + soulOfflineBonus + relicOfflineEfficiency);

    // 11. Breakdown
    const breakdown: ProductionBreakdown = {
      rawBuildingsPower: rawBuildingsPowerPerSec,
      rankMultiplier: effectiveRankMult,
      heroPowerMultiplier,
      soulPowerMultiplier: soulPowerMult,
      globalUpgradesMultiplier: globalPowerUpgradesMult,
      activeSurgeMultiplier,
      totalPowerPerSec: passivePowerPerSec,
      totalGoldPerSec: passiveGoldPerSec
    };

    return {
      clickPower,
      clickGold,
      critChance,
      critMultiplier,
      baseBuildingsPowerPerSec: rawBuildingsPowerPerSec,
      baseBuildingsGoldPerSec: rawBuildingsGoldPerSec,
      passivePowerPerSec,
      passiveGoldPerSec,
      towerCombatPower,
      rankMultiplier: effectiveRankMult,
      globalUpgradesMultiplier: globalPowerUpgradesMult,
      heroPowerMultiplier,
      heroGoldMultiplier,
      heroTowerMultiplier,
      soulPowerMultiplier: soulPowerMult,
      soulGoldMultiplier: soulGoldMult,
      activeSurgeMultiplier,
      comboMultiplier: comboMult,
      maxOfflineSeconds,
      offlineEfficiency,
      buildingCostDiscount: totalBuildingCostDiscount,
      breakdown,
      buildingDetails
    };
  }
}
