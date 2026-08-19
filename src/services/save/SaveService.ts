import { store, GameStateData } from '../../core/GameState';
import { SAVE_KEY } from './SaveSchema';
import { SaveMigrations } from './SaveMigrations';
import { events } from '../../core/EventBus';
import { platform } from '../platform/YandexGamesService';
import { RpgSaveAggregate } from './RpgSaveAggregate';

export interface OfflineGains {
  seconds: number;
  cappedSeconds: number;
  powerGained: number;
  goldGained: number;
}

export class SaveService {
  private static instance: SaveService;
  private autoSaveTimer: number | null = null;
  private isSaving: boolean = false;

  private constructor() {
    this.setupListeners();
  }

  public static getInstance(): SaveService {
    if (!SaveService.instance) {
      SaveService.instance = new SaveService();
    }
    return SaveService.instance;
  }

  public stopAutoSave(): void {
    if (this.autoSaveTimer !== null) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  private setupListeners(): void {
    // Auto-save every 15s
    this.autoSaveTimer = window.setInterval(() => {
      this.saveLocal();
    }, 15000);

    // Save on tab visibility change & page unload
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.saveLocal();
      }
    });

    window.addEventListener('beforeunload', () => {
      if (this.isSaveDisabledForTest()) return;
      this.saveLocal();
    });

    // Rebirth is a critical persistence boundary. The event is emitted only
    // after the reset transaction and combat respawn have completed.
    events.on('reincarnate:complete', () => {
      this.saveLocal();
    });
  }

  private isSaveDisabledForTest(): boolean {
    return import.meta.env.DEV && typeof window !== 'undefined' && (window as any).__DISABLE_SAVE__ === true;
  }

  public saveLocal(): void {
    if (this.isSaving || this.isSaveDisabledForTest()) return;
    this.isSaving = true;

    try {
      store.set((draft) => {
        draft.lastSeenAt = Date.now();
        RpgSaveAggregate.captureInto(draft);
      });

      const json = JSON.stringify(store.get());
      localStorage.setItem(SAVE_KEY, json);
      events.emit('save:saved', { timestamp: Date.now() });

      // Async cloud save backup (non-blocking)
      platform.saveCloudSave(store.get()).catch(() => {});
    } catch (err) {
      console.warn('Failed to save to localStorage:', err);
    } finally {
      this.isSaving = false;
    }
  }

  public loadLocal(): GameStateData | null {
    try {
      const keys = [
        SAVE_KEY,
        'ANIME_ASCENSION_SAVE_V6',
        'ANIME_ASCENSION_SAVE_V5',
        'ANIME_ASCENSION_SAVE_V4',
        'ANIME_ASCENSION_SAVE_V3',
        'ANIME_ASCENSION_SAVE_V2',
        'ANIME_ASCENSION_SAVE_V1',
        'ANIME_ASCENSION_SAVE'
      ];
      let raw: string | null = null;
      for (const k of keys) {
        raw = localStorage.getItem(k);
        if (raw) break;
      }
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return SaveMigrations.migrate(parsed);
    } catch (err) {
      console.error('Failed to parse save from localStorage:', err);
      return null;
    }
  }

  public clearSave(): void {
    try {
      const keys = [
        SAVE_KEY,
        'ANIME_ASCENSION_SAVE_V6',
        'ANIME_ASCENSION_SAVE_V5',
        'ANIME_ASCENSION_SAVE_V4',
        'ANIME_ASCENSION_SAVE_V3',
        'ANIME_ASCENSION_SAVE_V2',
        'ANIME_ASCENSION_SAVE_V1',
        'ANIME_ASCENSION_SAVE'
      ];
      for (const k of keys) {
        localStorage.removeItem(k);
      }

      // Reset every mutable subsystem outside GameStore before saveLocal()
      // serializes the fresh aggregate.
      RpgSaveAggregate.resetAll();

      const initial = SaveMigrations.migrate(null);
      store.replace(initial);
      this.saveLocal();
    } catch (err) {
      console.error('Failed to clear save:', err);
    }
  }
}

export const saveService = SaveService.getInstance();
