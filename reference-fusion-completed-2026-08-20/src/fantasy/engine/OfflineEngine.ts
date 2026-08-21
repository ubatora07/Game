import { FantasyGameState, GearItem } from '../core/FantasyState';
import { UpgradeEngine } from './UpgradeEngine';
import { WORLDS } from '../content/worlds';
import { rollGearDrop } from '../content/gear';
import { LEGACY_PERKS } from '../content/legacy';

export interface OfflineGainsResult {
  elapsedSeconds: number;
  formattedTime: string;
  goldGained: number;
  enemiesDefeated: number;
  itemsGained: GearItem[];
}

export class OfflineEngine {
  public static calculateOfflineGains(state: FantasyGameState): OfflineGainsResult | null {
    const now = Date.now();
    const elapsedMs = now - (state.lastActiveTime || now);
    const elapsedSeconds = Math.floor(elapsedMs / 1000);

    // Minimum 10 seconds to trigger offline calculation
    if (elapsedSeconds < 10) return null;

    // Cap at 8 hours (28,800 seconds)
    const cappedSeconds = Math.min(28800, elapsedSeconds);

    const stats = UpgradeEngine.calculateStats(state);
    const worldDef = WORLDS[state.world.currentWorldId] || WORLDS[1];

    // Estimate average monster HP and gold yield at current stage
    const stageMultiplier = Math.pow(worldDef.hpGrowth, state.world.currentStageNumber - 1);
    const avgMonsterHp = Math.max(10, Math.floor(worldDef.baseHp * stageMultiplier));
    const avgMonsterGold = Math.max(1, Math.floor(worldDef.baseGold * Math.pow(worldDef.goldGrowth, state.world.currentStageNumber - 1) * stats.goldFindMultiplier));

    // Time to defeat one monster: (avgMonsterHp / stats.dps) + 1.2s travel time
    const timePerKill = Math.max(0.5, (avgMonsterHp / stats.dps) + 1.2);
    const idleMasteryMultiplier = 1 + state.legacy.upgrades.idle_mastery * LEGACY_PERKS.idle_mastery.bonusPerLevel;

    const enemiesDefeated = Math.floor((cappedSeconds / timePerKill) * idleMasteryMultiplier * 0.75); // 75% baseline efficiency
    const totalGoldGained = Math.max(0, enemiesDefeated * avgMonsterGold);

    // Roll occasional gear drops during long offline sessions
    const itemsGained: GearItem[] = [];
    const dropRollCount = Math.min(10, Math.floor(enemiesDefeated / 20));
    for (let i = 0; i < dropRollCount; i++) {
      const drop = rollGearDrop(state.world.currentWorldId, false);
      if (drop && itemsGained.length < 3) {
        itemsGained.push(drop);
      }
    }

    const hours = Math.floor(cappedSeconds / 3600);
    const minutes = Math.floor((cappedSeconds % 3600) / 60);
    const seconds = cappedSeconds % 60;
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    return {
      elapsedSeconds: cappedSeconds,
      formattedTime,
      goldGained: totalGoldGained,
      enemiesDefeated,
      itemsGained,
    };
  }
}
