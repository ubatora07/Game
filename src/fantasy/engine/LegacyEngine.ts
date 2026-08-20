import { store } from '../core/FantasyState';
import { LEGACY_PERKS, LegacyPerkId, calculateLegacyPointsYield } from '../content/legacy';

export class LegacyEngine {
  public static getPotentialPoints(): number {
    const s = store.get();
    return calculateLegacyPointsYield(s.currencies.lifetimeGold, s.world.highestWorld, s.world.highestStage);
  }

  public static getPerkCost(perkId: LegacyPerkId, currentLevel: number): number {
    const def = LEGACY_PERKS[perkId];
    return Math.floor(def.baseCost * Math.pow(def.costGrowth, currentLevel));
  }

  public static buyPerk(perkId: LegacyPerkId): boolean {
    let bought = false;
    store.set((s) => {
      const currentLevel = s.legacy.upgrades[perkId];
      const cost = this.getPerkCost(perkId, currentLevel);
      if (s.currencies.legacyPoints >= cost) {
        s.currencies.legacyPoints -= cost;
        s.legacy.upgrades[perkId] += 1;
        bought = true;
      }
    });
    return bought;
  }

  public static performPrestige(): number {
    const pointsGained = this.getPotentialPoints();
    if (pointsGained <= 0) return 0;

    store.set((s) => {
      // 1. Grant Legacy Points
      s.currencies.legacyPoints += pointsGained;
      s.legacy.legacyCount += 1;

      // 2. Reset Temporary Progress
      s.currencies.gold = 0;
      s.world.currentWorldId = 1;
      s.world.currentStageNumber = 1;
      s.world.waveProgress = 0;
      s.world.isBossActive = false;
      s.world.bossTimeRemaining = 0;
      s.world.isFarmMode = false;

      // 3. Reset Hero Upgrades to base
      s.upgrades = {
        damage: 1,
        click_damage: 1,
        attack_speed: 1,
        crit_chance: 0,
        gold_find: 0,
      };

      // 4. Reset Hero Level to 1
      s.hero.level = 1;
      s.hero.xp = 0;
      s.hero.xpToNext = 20;

      // NOTE: Gear, Legacy Points, Legacy Perks, and Lifetime stats are KEPT!
    });

    return pointsGained;
  }
}
