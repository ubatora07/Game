import { GameStateData } from '../core/GameState';
import { EconomyEngine } from '../economy/EconomyEngine';
import { OfflineGains } from '../services/save/SaveService';

export class OfflineSystem {
  /**
   * Calculate offline progress gains mathematically without simulating step by step
   */
  public static calculateOfflineGains(state: GameStateData, now: number = Date.now()): OfflineGains | null {
    const elapsedSeconds = Math.floor((now - state.lastSeenAt) / 1000);

    // Only grant offline progress if away for at least 30 seconds
    if (elapsedSeconds < 30) {
      return null;
    }

    const metrics = EconomyEngine.calculateMetrics(state, state.lastSeenAt);
    const cappedSeconds = Math.min(elapsedSeconds, metrics.maxOfflineSeconds);

    const basePowerGained = metrics.passivePowerPerSec * cappedSeconds * metrics.offlineEfficiency;
    const baseGoldGained = metrics.passiveGoldPerSec * cappedSeconds * metrics.offlineEfficiency;

    return {
      seconds: elapsedSeconds,
      cappedSeconds,
      powerGained: Math.floor(basePowerGained),
      goldGained: Math.floor(baseGoldGained)
    };
  }
}
