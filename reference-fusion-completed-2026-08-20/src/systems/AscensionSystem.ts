import { store } from '../core/GameState';
import { getNextRank, RankDefinition } from '../content/ranks';
import { events } from '../core/EventBus';
import { sound } from '../services/audio/SoundService';

export class AscensionSystem {
  public static canAscend(): boolean {
    const state = store.get();
    const nextRank = getNextRank(state.rankId);
    if (!nextRank) return false;
    return state.power >= nextRank.reqPower;
  }

  public static getNextRank(): RankDefinition | null {
    return getNextRank(store.get().rankId);
  }

  public static ascend(): boolean {
    const state = store.get();
    const nextRank = getNextRank(state.rankId);

    if (!nextRank || state.power < nextRank.reqPower) {
      return false;
    }

    const oldRank = state.rankId;

    store.set((draft) => {
      draft.rankId = nextRank.id;
      draft.rankIndex = nextRank.index;
    });

    sound.playAscension();

    events.emit('ascension:rankUp', {
      oldRank,
      newRank: nextRank.id,
      multiplier: nextRank.multiplier
    });

    // Trigger celebratory Ascension modal
    events.emit('modal:open', {
      modalId: 'ascension',
      data: {
        rank: nextRank
      }
    });

    return true;
  }
}
