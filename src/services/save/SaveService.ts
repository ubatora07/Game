import { store, GameStateData } from '../../core/GameState';
import { SAVE_KEY } from './SaveSchema';
import { SaveMigrations } from './SaveMigrations';
import { events } from '../../core/EventBus';
import { platform } from '../platform/YandexGamesService';
import { settlementSystem } from '../../systems/SettlementSystem';
import { craftingEquipmentSystem } from '../../systems/CraftingEquipmentSystem';
import { marketSystem } from '../../systems/MarketSystem';
import { mercenarySystem } from '../../systems/MercenarySystem';
import { titleSystem } from '../../systems/TitleSystem';
import { settlementDefenseSystem } from '../../systems/SettlementDefenseSystem';
import { settlementStorySystem } from '../../systems/SettlementStorySystem';
import { legacyEndingSystem } from '../../systems/LegacyEndingSystem';
import { worldStateManager } from '../../systems/WorldStateManager';
import { partyTeamSystem } from '../../systems/PartyTeamSystem';
import { petSystem } from '../../systems/PetSystem';
import { karmaSystem } from '../../systems/KarmaSystem';
import { adventureEventSystem } from '../../systems/AdventureEventSystem';

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
        draft.settlement = settlementSystem.serialize();
        draft.crafting = craftingEquipmentSystem.serialize();
        draft.market = marketSystem.serialize();
        draft.mercenaries = mercenarySystem.serialize();
        draft.titles = titleSystem.serialize();
        draft.settlementDefense = settlementDefenseSystem.serialize();
        draft.settlementStory = settlementStorySystem.serialize();
        draft.legacyEndings = legacyEndingSystem.serialize();
        draft.partyTeam = partyTeamSystem.serialize();
        draft.pets = petSystem.serialize();
        draft.karma = karmaSystem.serialize();
        draft.adventureEvents = adventureEventSystem.serialize();
        draft.worldState = worldStateManager.serialize();
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
      settlementSystem.resetAll();
      craftingEquipmentSystem.resetAll();
      marketSystem.resetAll();
      mercenarySystem.resetAll();
      titleSystem.resetAll();
      settlementDefenseSystem.resetAll();
      settlementStorySystem.resetAll();
      legacyEndingSystem.resetAll();
      partyTeamSystem.resetAll();
      petSystem.resetAll();
      adventureEventSystem.resetAll();
      karmaSystem.resetAll();
      worldStateManager.resetAll();

      const initial = SaveMigrations.migrate(null);
      store.replace(initial);
      this.saveLocal();
    } catch (err) {
      console.error('Failed to clear save:', err);
    }
  }
}

export const saveService = SaveService.getInstance();
