import { store, FantasyGameState, createInitialFantasyState } from '../core/FantasyState';

const SAVE_KEY = 'FANTASY_IDLE_BETA_SAVE_V1';
const memoryStore = new Map<string, string>();

export class SaveEngine {
  private static autoSaveTimer: any = null;

  public static save(): boolean {
    try {
      store.set((s) => {
        s.lastSaveTime = Date.now();
        s.lastActiveTime = Date.now();
      });
      const data = JSON.stringify(store.get());
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(SAVE_KEY, data);
      } else {
        memoryStore.set(SAVE_KEY, data);
      }
      return true;
    } catch (err) {
      console.error('[SaveEngine] Failed to save game state:', err);
      return false;
    }
  }

  public static load(): FantasyGameState | null {
    try {
      let raw: string | null = null;
      if (typeof localStorage !== 'undefined') {
        raw = localStorage.getItem(SAVE_KEY);
      } else {
        raw = memoryStore.get(SAVE_KEY) || null;
      }
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.version === 1) {
        return parsed as FantasyGameState;
      }
      return null;
    } catch (err) {
      console.error('[SaveEngine] Failed to parse save data:', err);
      return null;
    }
  }

  public static reset(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(SAVE_KEY);
    }
    memoryStore.delete(SAVE_KEY);
    store.replace(createInitialFantasyState());
  }

  public static startAutoSave(): () => void {
    if (this.autoSaveTimer) clearInterval(this.autoSaveTimer);

    this.autoSaveTimer = setInterval(() => {
      this.save();
    }, 10000);

    const onUnload = () => this.save();
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        this.save();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', onUnload);
      document.addEventListener('visibilitychange', onVisibilityChange);
    }

    return () => {
      if (this.autoSaveTimer) clearInterval(this.autoSaveTimer);
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeunload', onUnload);
        document.removeEventListener('visibilitychange', onVisibilityChange);
      }
    };
  }
}
