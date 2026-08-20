import { store, FantasyGameState } from '../core/FantasyState';
import { HERO_UPGRADES, UpgradeId } from '../content/upgrades';
import { LEGACY_PERKS } from '../content/legacy';

export interface CalculatedCombatStats {
  heroDamage: number;
  clickDamage: number;
  attacksPerSecond: number;
  dps: number;
  critChance: number;
  critMultiplier: number;
  goldFindMultiplier: number;
  totalPower: number;
}

export class UpgradeEngine {
  public static calculateMilestoneMultiplier(level: number, milestones: number[]): number {
    let mult = 1.0;
    for (const m of milestones) {
      if (level >= m) {
        mult *= 2.0;
      }
    }
    return mult;
  }

  public static calculateStats(state?: FantasyGameState): CalculatedCombatStats {
    const s = state || store.get();

    // 1. Base Upgrade Calculations + Milestones
    const dmgDef = HERO_UPGRADES.damage;
    const dmgLvl = s.upgrades.damage;
    const dmgMilestone = this.calculateMilestoneMultiplier(dmgLvl, dmgDef.milestones);
    let baseDmg = (dmgDef.baseValue + dmgLvl * dmgDef.valuePerLevel) * dmgMilestone;

    const clickDef = HERO_UPGRADES.click_damage;
    const clickLvl = s.upgrades.click_damage;
    const clickMilestone = this.calculateMilestoneMultiplier(clickLvl, clickDef.milestones);
    let baseClick = (clickDef.baseValue + clickLvl * clickDef.valuePerLevel) * clickMilestone;

    const spdDef = HERO_UPGRADES.attack_speed;
    const spdLvl = s.upgrades.attack_speed;
    let baseSpeed = spdDef.baseValue + spdLvl * spdDef.valuePerLevel;

    const critDef = HERO_UPGRADES.crit_chance;
    const critLvl = s.upgrades.crit_chance;
    let baseCrit = Math.min(0.75, critDef.baseValue + critLvl * critDef.valuePerLevel);

    const goldDef = HERO_UPGRADES.gold_find;
    const goldLvl = s.upgrades.gold_find;
    let baseGold = goldDef.baseValue + goldLvl * goldDef.valuePerLevel;

    // 2. Apply Equipped Gear Modifiers
    const equipped = Object.values(s.gear.equipped);
    equipped.forEach((item) => {
      if (!item) return;
      if (item.stats.damagePct) baseDmg *= 1 + item.stats.damagePct;
      if (item.stats.clickDamagePct) baseClick *= 1 + item.stats.clickDamagePct;
      if (item.stats.attackSpeedPct) baseSpeed *= 1 + item.stats.attackSpeedPct;
      if (item.stats.critChance) baseCrit = Math.min(0.85, baseCrit + item.stats.critChance);
      if (item.stats.goldFindPct) baseGold *= 1 + item.stats.goldFindPct;
    });

    // 3. Apply Legacy Perks
    const vetBonus = s.legacy.upgrades.veteran * LEGACY_PERKS.veteran.bonusPerLevel;
    baseDmg *= 1 + vetBonus;
    baseClick *= 1 + vetBonus;

    const swiftBonus = s.legacy.upgrades.swift_strikes * LEGACY_PERKS.swift_strikes.bonusPerLevel;
    baseSpeed *= 1 + swiftBonus;

    const goldBonus = s.legacy.upgrades.treasure_hunter * LEGACY_PERKS.treasure_hunter.bonusPerLevel;
    baseGold *= 1 + goldBonus;

    // 4. Hero Level Growth (+3% per hero level)
    const heroLevelMultiplier = 1 + (s.hero.level - 1) * 0.03;
    baseDmg *= heroLevelMultiplier;
    baseClick *= heroLevelMultiplier;

    // 5. Compute DPS & Aggregate Power
    const critMultiplier = 2.5;
    const effectiveDamagePerHit = baseDmg * (1 - baseCrit) + (baseDmg * critMultiplier) * baseCrit;
    const dps = Math.round(effectiveDamagePerHit * baseSpeed);
    const totalPower = Math.round(dps + baseClick * 2 + baseGold * 50);

    return {
      heroDamage: Math.max(1, Math.round(baseDmg)),
      clickDamage: Math.max(1, Math.round(baseClick)),
      attacksPerSecond: Number(baseSpeed.toFixed(2)),
      dps: Math.max(1, dps),
      critChance: Number(baseCrit.toFixed(2)),
      critMultiplier,
      goldFindMultiplier: Number(baseGold.toFixed(2)),
      totalPower: Math.max(10, totalPower),
    };
  }

  public static calculateCost(id: UpgradeId, currentLevel: number, count: number): number {
    const def = HERO_UPGRADES[id];
    let totalCost = 0;
    for (let i = 0; i < count; i++) {
      totalCost += Math.floor(def.baseCost * Math.pow(def.costGrowth, currentLevel + i));
    }
    return totalCost;
  }

  public static calculateMaxAffordable(id: UpgradeId, currentLevel: number, availableGold: number): { count: number; cost: number } {
    const def = HERO_UPGRADES[id];
    let count = 0;
    let cost = 0;
    let nextCost = Math.floor(def.baseCost * Math.pow(def.costGrowth, currentLevel));

    while (cost + nextCost <= availableGold && count < 1000) {
      cost += nextCost;
      count++;
      if (def.maxLevel && currentLevel + count >= def.maxLevel) break;
      nextCost = Math.floor(def.baseCost * Math.pow(def.costGrowth, currentLevel + count));
    }

    return { count: Math.max(1, count), cost: Math.max(nextCost, cost) };
  }

  public static buyUpgrade(id: UpgradeId, multiplierMode: '1' | '10' | '100' | 'max'): boolean {
    const def = HERO_UPGRADES[id];
    let purchased = false;

    store.set((s) => {
      const currentLvl = s.upgrades[id];
      if (def.maxLevel && currentLvl >= def.maxLevel) return;

      let countToBuy = 1;
      if (multiplierMode === '10') countToBuy = 10;
      else if (multiplierMode === '100') countToBuy = 100;
      else if (multiplierMode === 'max') {
        const maxInfo = this.calculateMaxAffordable(id, currentLvl, s.currencies.gold);
        if (s.currencies.gold >= maxInfo.cost) {
          s.currencies.gold -= maxInfo.cost;
          s.upgrades[id] += maxInfo.count;
          purchased = true;
          return;
        }
      }

      if (def.maxLevel) {
        countToBuy = Math.min(countToBuy, def.maxLevel - currentLvl);
      }

      const totalCost = this.calculateCost(id, currentLvl, countToBuy);
      if (s.currencies.gold >= totalCost && countToBuy > 0) {
        s.currencies.gold -= totalCost;
        s.upgrades[id] += countToBuy;
        purchased = true;
      }
    });

    return purchased;
  }
}
