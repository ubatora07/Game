import type { GameStateData } from '../core/GameState';
import { EconomyEngine } from '../economy/EconomyEngine';
import { RelicSystem } from './RelicSystem';

export interface EconomySimulationOptions {
  startAtMs: number;
  efficiencyMultiplier?: number;
  maxStepSeconds?: number;
}

export interface EconomySimulationResult {
  elapsedSeconds: number;
  powerGained: number;
  goldGained: number;
  passivePowerGained: number;
  passiveGoldGained: number;
  autoTrainingPowerGained: number;
  autoTrainingGoldGained: number;
}

/**
 * Pure elapsed-time economy simulator shared by live and offline progression.
 *
 * It deliberately advances time in bounded chunks so temporary effects are sampled
 * against their actual expiry timestamps instead of being stretched across an entire
 * offline window. The function never mutates GameState.
 */
export class IdleProgressionSimulator {
  public static simulateEconomy(
    state: GameStateData,
    elapsedSeconds: number,
    options: EconomySimulationOptions,
  ): EconomySimulationResult {
    const totalSeconds = Math.max(0, elapsedSeconds);
    const efficiency = Math.max(0, options.efficiencyMultiplier ?? 1);
    const maxStep = Math.max(0.05, options.maxStepSeconds ?? 60);

    let remaining = totalSeconds;
    let cursorMs = options.startAtMs;
    let passivePowerGained = 0;
    let passiveGoldGained = 0;
    let autoTrainingPowerGained = 0;
    let autoTrainingGoldGained = 0;

    while (remaining > 1e-9) {
      let step = Math.min(maxStep, remaining);

      // Never let a simulation chunk cross a temporary-buff expiry. Splitting on
      // these boundaries makes a 60s offline chunk mathematically agree with live
      // time instead of stretching/shortening a temporary multiplier by ~30s.
      const chunkEndMs = cursorMs + step * 1000;
      const temporalBoundaries = [
        state.buffs.celestialSurgeEndsAt,
        state.buffs.adPowerSurgeEndsAt,
        state.buffs.frenzyEndsAt,
      ].filter((boundary) => Number.isFinite(boundary) && boundary > cursorMs + 1e-6 && boundary < chunkEndMs - 1e-6);
      if (temporalBoundaries.length > 0) {
        const nextBoundaryMs = Math.min(...temporalBoundaries);
        step = Math.min(step, Math.max(1e-6, (nextBoundaryMs - cursorMs) / 1000));
      }

      // Sample at the interval midpoint. Because expiry boundaries are split above,
      // the sample cannot accidentally represent both sides of a temporary effect.
      const sampleAtMs = cursorMs + step * 500;
      const metrics = EconomyEngine.calculateMetrics(state, sampleAtMs);

      passivePowerGained += metrics.passivePowerPerSec * step * efficiency;
      passiveGoldGained += metrics.passiveGoldPerSec * step * efficiency;

      const autoClicksPerSec = RelicSystem.getEquippedEffectValue(state, 'auto_training');
      if (autoClicksPerSec > 0) {
        autoTrainingPowerGained += metrics.clickPower * autoClicksPerSec * step * efficiency;
        autoTrainingGoldGained += metrics.clickGold * autoClicksPerSec * step * efficiency;
      }

      cursorMs += step * 1000;
      remaining -= step;
    }

    return {
      elapsedSeconds: totalSeconds,
      powerGained: passivePowerGained + autoTrainingPowerGained,
      goldGained: passiveGoldGained + autoTrainingGoldGained,
      passivePowerGained,
      passiveGoldGained,
      autoTrainingPowerGained,
      autoTrainingGoldGained,
    };
  }
}
