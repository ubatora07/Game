import { store } from '../core/GameState';
import { EconomyEngine } from '../economy/EconomyEngine';
import { events } from '../core/EventBus';
import { sound } from '../services/audio/SoundService';

export class RandomEventSystem {
  private static nextSpawnTime: number = Date.now() + 60000; // First spawn in 60s

  public static update(now: number = Date.now()): void {
    const state = store.get();

    // Check if existing event expired
    if (state.randomEvent.active && now >= state.randomEvent.expiresAt) {
      store.set((draft) => {
        draft.randomEvent.active = false;
      });
      this.scheduleNext(now);
    }

    // Check spawn trigger
    if (!state.randomEvent.active && now >= this.nextSpawnTime) {
      this.spawnEvent(undefined, now);
    }
  }

  public static spawnEvent(forcedType?: 'instant_power' | 'frenzy', now: number = Date.now()): void {
    const type: 'instant_power' | 'frenzy' = forcedType || (Math.random() < 0.6 ? 'instant_power' : 'frenzy');
    const xPct = 15 + Math.random() * 70;
    const yPct = 25 + Math.random() * 50;

    store.set((draft) => {
      draft.randomEvent = {
        active: true,
        type,
        expiresAt: now + 15000, // 15 seconds lifespan
        xPct,
        yPct
      };
    });
  }

  public static claimEvent(): { type: string; rewardDesc: string } | null {
    const state = store.get();
    if (!state.randomEvent.active) return null;

    const now = Date.now();
    const type = state.randomEvent.type;
    const metrics = EconomyEngine.calculateMetrics(state, now);

    let rewardDesc = '';

    store.set((draft) => {
      draft.randomEvent.active = false;

      if (type === 'instant_power') {
        const bonusPower = Math.max(250, Math.floor(metrics.passivePowerPerSec * 60));
        draft.power += bonusPower;
        draft.crystals += 25;
        draft.stats.lifetimePower += bonusPower;
        rewardDesc = `+${bonusPower} Power & +25 Crystals!`;
      } else {
        draft.buffs.frenzyEndsAt = now + 30000; // 30s 3x frenzy
        rewardDesc = `CELESTIAL FRENZY! 3x Power for 30s!`;
      }
    });

    sound.playVictory();

    events.emit('toast:show', {
      message: `✨ Golden Spirit: ${rewardDesc}`,
      type: 'gold'
    });

    this.scheduleNext(now);
    return { type, rewardDesc };
  }

  private static scheduleNext(now: number): void {
    // 90s to 180s spawn interval
    let baseInterval = (90 + Math.random() * 90) * 1000;
    import('./RelicSystem').then(m => {
       const mult = m.RelicSystem.getEquippedEffectValue(store.get(), 'spirit_lure');
       const effectiveDivisor = mult > 0 ? mult : 1;
       RandomEventSystem.nextSpawnTime = now + baseInterval / effectiveDivisor;
    });
    // Fallback sync while promise resolves
    this.nextSpawnTime = now + baseInterval;
  }
}
