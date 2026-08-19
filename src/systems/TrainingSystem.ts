import { store } from '../core/GameState';
import { EconomyEngine } from '../economy/EconomyEngine';
import { events } from '../core/EventBus';
import { sound } from '../services/audio/SoundService';

export interface TrainResult {
  powerGained: number;
  goldGained: number;
  isCrit: boolean;
  comboMult: number;
}

export class TrainingSystem {
  public static train(clickCoords?: { x: number; y: number }): TrainResult {
    const state = store.get();

    // Increment combo before calculating metrics
    const currentCombo = state.combo || { count: 0, multiplier: 1.0, timer: 0 };
    const newComboCount = currentCombo.count + 1;
    const newComboMult = 1.0 + Math.min(1.0, newComboCount * 0.05); // Up to 2.0x at 20 combo

    store.set((draft) => {
      draft.combo.count = newComboCount;
      draft.combo.multiplier = newComboMult;
      draft.combo.timer = 2.0; // 2 seconds decay window
    });

    const metrics = EconomyEngine.calculateMetrics(store.get());
    const isCrit = Math.random() < metrics.critChance;
    const powerGained = Math.floor(isCrit ? metrics.clickPower * metrics.critMultiplier : metrics.clickPower);
    const goldGained = Math.floor(isCrit ? metrics.clickGold * 2 : metrics.clickGold);

    store.set((draft) => {
      draft.power += powerGained;
      draft.gold += goldGained;
      draft.stats.lifetimePower += powerGained;
      draft.stats.lifetimeGold += goldGained;
      draft.stats.totalClicks += 1;
      if (isCrit) {
        draft.stats.totalCrits += 1;
      }
    });

    if (isCrit) {
      sound.playCrit();
    } else {
      sound.playClick();
    }

    events.emit('train:click', {
      powerGained,
      goldGained,
      isCrit,
      x: clickCoords?.x,
      y: clickCoords?.y
    });

    return { powerGained, goldGained, isCrit, comboMult: newComboMult };
  }

  public static updateCombo(dt: number): void {
    const state = store.get();
    if (state.combo && state.combo.timer > 0) {
      const newTimer = state.combo.timer - dt;
      if (newTimer <= 0) {
        store.set((draft) => {
          draft.combo.count = 0;
          draft.combo.multiplier = 1.0;
          draft.combo.timer = 0;
        });
      } else {
        store.set((draft) => {
          draft.combo.timer = newTimer;
        });
      }
    }
  }
}
