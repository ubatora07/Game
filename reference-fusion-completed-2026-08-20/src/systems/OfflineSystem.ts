import { GameStateData } from '../core/GameState';
import { EconomyEngine } from '../economy/EconomyEngine';
import { OfflineGains } from '../services/save/SaveService';
import { modifierResolver } from '../core/modifiers/ModifierResolver';
import { IdleProgressionSimulator } from './IdleProgressionSimulator';

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

    const offlineContext = {
      currentWorld: state.campaign?.currentWorldId,
      currentStage: state.campaign?.currentStageId,
    };
    const offlineMultiplier = modifierResolver.resolve('offlineRewardMultiplier', 1, offlineContext);
    const simulated = IdleProgressionSimulator.simulateEconomy(state, cappedSeconds, {
      startAtMs: state.lastSeenAt,
      efficiencyMultiplier: metrics.offlineEfficiency * offlineMultiplier,
      maxStepSeconds: 60,
    });

    return {
      seconds: elapsedSeconds,
      cappedSeconds,
      powerGained: Math.floor(simulated.powerGained),
      goldGained: Math.floor(simulated.goldGained)
    };
  }
}
