import { WorldFlagId, WorldFlagDefinition, WorldSaveState } from '../core/world/WorldStateTypes';
import { events } from '../core/EventBus';
import { analytics } from '../services/analytics/AnalyticsService';

export const WORLD_FLAG_DEFINITIONS: Record<WorldFlagId, WorldFlagDefinition> = {
  village_saved: {
    id: 'village_saved',
    nameKey: 'world.flag.village_saved',
    defaultName: 'Mountain Haven Prosperous',
    description: 'The surrounding valleys were saved from goblin raiders, bringing flourishing trade to Mountain Haven.',
    source: 'Refugees & Story Sagas',
    persistsThroughSamsara: false,
    visualConsequence: {
      ambientBannerKey: 'Banners of the Golden Crest',
      npcReactionKey: 'Villagers celebrate your valor at the fountain.',
      townOverlayClass: 'town-flourishing',
    },
  },

  village_ruined: {
    id: 'village_ruined',
    nameKey: 'world.flag.village_ruined',
    defaultName: 'Ash & Desolation',
    description: 'The lower hamlets were left to burn, casting an ominous pall over the settlement.',
    source: 'Dark Choices',
    persistsThroughSamsara: false,
    visualConsequence: {
      ambientBannerKey: 'Smoldering Embers & Tattered Cloth',
      npcReactionKey: 'Survivors whisper with frightened, hollow gazes.',
      townOverlayClass: 'town-desolate',
    },
  },

  refugees_accepted: {
    id: 'refugees_accepted',
    nameKey: 'world.flag.refugees_accepted',
    defaultName: 'Sanctuary for the Displaced',
    description: 'Displaced artisans and craftsmen found a home in Haven, bustling through the market streets.',
    source: 'Refugees of Mountain Haven Saga',
    persistsThroughSamsara: false,
    visualConsequence: {
      npcReactionKey: 'Refugee craftsmen actively assist at Master Goran’s forge.',
      townOverlayClass: 'town-crowded-market',
    },
  },

  refugees_turned_away: {
    id: 'refugees_turned_away',
    nameKey: 'world.flag.refugees_turned_away',
    defaultName: 'Gates Sealed',
    description: 'The gates were barred to the wandering destitute.',
    source: 'Refugees of Mountain Haven Saga',
    persistsThroughSamsara: false,
    visualConsequence: {
      npcReactionKey: 'Guards stand rigid and suspicious at the gatehouse.',
    },
  },

  smuggler_alliance: {
    id: 'smuggler_alliance',
    nameKey: 'world.flag.smuggler_alliance',
    defaultName: 'Shadow Syndicate Pact',
    description: 'Vane and Malik’s smugglers operate beneath lanterns in the lower alleyways.',
    source: 'The Smuggler’s Debt Saga',
    persistsThroughSamsara: false,
    visualConsequence: {
      npcReactionKey: 'Cloaked shadow couriers linger near the tavern backdoors.',
      townOverlayClass: 'town-shadow-alley',
    },
  },

  smuggler_syndicate_crushed: {
    id: 'smuggler_syndicate_crushed',
    nameKey: 'world.flag.smuggler_syndicate_crushed',
    defaultName: 'Order Restored',
    description: 'The contraband networks were seized by the citadel garrison.',
    source: 'The Smuggler’s Debt Saga',
    persistsThroughSamsara: false,
    visualConsequence: {
      npcReactionKey: 'City guards proudly patrol the secure storehouses.',
    },
  },

  kingdom_trusted: {
    id: 'kingdom_trusted',
    nameKey: 'world.flag.kingdom_trusted',
    defaultName: 'Champion of the Realm',
    description: 'Royal envoys visit the settlement, treating the player with honored deference.',
    source: 'Positive Karma (Score >= 50)',
    persistsThroughSamsara: false,
    visualConsequence: {
      ambientBannerKey: 'Royal Lion Pennants',
      npcReactionKey: 'Guards salute with grounded spears upon your arrival.',
    },
  },

  dark_reputation: {
    id: 'dark_reputation',
    nameKey: 'world.flag.dark_reputation',
    defaultName: 'The Shadow Sovereign',
    description: 'Citizens speak your name with trembling reverence.',
    source: 'Negative Karma (Score <= -50)',
    persistsThroughSamsara: false,
    visualConsequence: {
      ambientBannerKey: 'Crimson Sigils of Dread',
      npcReactionKey: 'Citizens scatter quietly as you approach the square.',
    },
  },

  sovereign_citadel_erected: {
    id: 'sovereign_citadel_erected',
    nameKey: 'world.flag.sovereign_citadel',
    defaultName: 'Throne of Eldoria',
    description: 'The grand citadel stands as the permanent monument to sovereign rule.',
    source: 'Settlement Lord Path',
    persistsThroughSamsara: true, // Permanent legacy monument
    visualConsequence: {
      ambientBannerKey: 'Citadel Crest of Sovereignty',
      npcReactionKey: 'Heralds proclaim the decrees of the High Lord.',
    },
  },
};

export class WorldStateManager {
  private static instance: WorldStateManager;

  private state: WorldSaveState = {
    currentLifeFlags: {},
    legacyWorldChronicle: {},
  };

  private constructor() {
    this.setupListeners();
  }

  public static getInstance(): WorldStateManager {
    if (!WorldStateManager.instance) {
      WorldStateManager.instance = new WorldStateManager();
    }
    return WorldStateManager.instance;
  }

  private setupListeners(): void {
    events.on('karma:major_choice_recorded' as any, (data: any) => {
      if (data?.flagId === 'refugees_sheltered') {
        this.setFlag('refugees_accepted', true);
        this.setFlag('village_saved', true);
      } else if (data?.flagId === 'refugees_exploited') {
        this.setFlag('refugees_turned_away', true);
      } else if (data?.flagId === 'smuggler_debt_lawful') {
        this.setFlag('smuggler_syndicate_crushed', true);
      } else if (data?.flagId === 'smuggler_debt_shady') {
        this.setFlag('smuggler_alliance', true);
      }
    });

    events.on('settlement:story_path_chosen' as any, (data: any) => {
      if (data?.path === 'lord') {
        this.setFlag('sovereign_citadel_erected', true);
      }
    });

    events.on('karma:changed' as any, (data: any) => {
      if (data?.score >= 50) {
        this.setFlag('kingdom_trusted', true);
        this.setFlag('dark_reputation', false);
      } else if (data?.score <= -50) {
        this.setFlag('dark_reputation', true);
        this.setFlag('kingdom_trusted', false);
      }
    });
  }

  public setFlag(id: WorldFlagId, value: boolean): void {
    const def = WORLD_FLAG_DEFINITIONS[id];
    if (!def) return;

    this.state.currentLifeFlags[id] = value;
    if (value && def.persistsThroughSamsara) {
      this.state.legacyWorldChronicle[id] = true;
    }

    events.emit('world:flag_changed' as any, { flagId: id, value });
    analytics.trackEvent('world_flag_changed', { flagId: id, value });
  }

  public hasFlag(id: WorldFlagId): boolean {
    const def = WORLD_FLAG_DEFINITIONS[id];
    if (def?.persistsThroughSamsara && this.state.legacyWorldChronicle[id]) {
      return true;
    }
    return Boolean(this.state.currentLifeFlags[id]);
  }

  public getActiveVisualConsequences(): Array<{ flagId: WorldFlagId; def: WorldFlagDefinition }> {
    const active: Array<{ flagId: WorldFlagId; def: WorldFlagDefinition }> = [];
    for (const key of Object.keys(WORLD_FLAG_DEFINITIONS) as WorldFlagId[]) {
      if (this.hasFlag(key)) {
        active.push({ flagId: key, def: WORLD_FLAG_DEFINITIONS[key] });
      }
    }
    return active;
  }

  /* --------------------------------------------------------------------- */
  /* SAMSARA & SERIALIZATION                                               */
  /* --------------------------------------------------------------------- */
  public resetAll(): void {
    this.state = {
      currentLifeFlags: {},
      legacyWorldChronicle: {},
    };
  }

  public resetForSamsara(): void {
    // Current life resets; permanent legacy chronicle facts persist
    this.state.currentLifeFlags = {};
  }

  public serialize(): WorldSaveState {
    return {
      currentLifeFlags: { ...this.state.currentLifeFlags },
      legacyWorldChronicle: { ...this.state.legacyWorldChronicle },
    };
  }

  public deserialize(data?: Partial<WorldSaveState>): void {
    if (!data) return;
    this.state = {
      currentLifeFlags: { ...(data.currentLifeFlags || {}) },
      legacyWorldChronicle: { ...(data.legacyWorldChronicle || {}) },
    };
  }
}

export const worldStateManager = WorldStateManager.getInstance();
