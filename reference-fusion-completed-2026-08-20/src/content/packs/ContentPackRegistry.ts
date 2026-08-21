import {
  ContentPackMetadata,
  ContentRolloutState,
  EventChainPack,
  EquipmentPack,
  MercenaryPack,
  MarketRotationPack,
  RaidPack,
  ThemedLiveEventPack,
} from './ContentPackTypes';
import { MOONLIT_HUNT_PACK } from './moonlitHuntPack';
import { events } from '../../core/EventBus';
import { analytics } from '../../services/analytics/AnalyticsService';

export class ContentPackRegistry {
  private static instance: ContentPackRegistry;

  private registeredPacks: Map<string, ContentPackMetadata> = new Map();
  private eventPacks: Map<string, EventChainPack> = new Map();
  private equipmentPacks: Map<string, EquipmentPack> = new Map();
  private mercenaryPacks: Map<string, MercenaryPack> = new Map();
  private marketPacks: Map<string, MarketRotationPack> = new Map();
  private raidPacks: Map<string, RaidPack> = new Map();
  private themedPacks: Map<string, ThemedLiveEventPack> = new Map();

  private constructor() {
    // Automatically register default reference pack
    this.registerThemedEventPack(MOONLIT_HUNT_PACK);
  }

  public static getInstance(): ContentPackRegistry {
    if (!ContentPackRegistry.instance) {
      ContentPackRegistry.instance = new ContentPackRegistry();
    }
    return ContentPackRegistry.instance;
  }

  public registerEventPack(pack: EventChainPack): boolean {
    if (this.registeredPacks.has(pack.metadata.packId)) return false;
    this.registeredPacks.set(pack.metadata.packId, pack.metadata);
    this.eventPacks.set(pack.metadata.packId, pack);
    return true;
  }

  public registerEquipmentPack(pack: EquipmentPack): boolean {
    if (this.registeredPacks.has(pack.metadata.packId)) return false;
    this.registeredPacks.set(pack.metadata.packId, pack.metadata);
    this.equipmentPacks.set(pack.metadata.packId, pack);
    return true;
  }

  public registerMercenaryPack(pack: MercenaryPack): boolean {
    if (this.registeredPacks.has(pack.metadata.packId)) return false;
    this.registeredPacks.set(pack.metadata.packId, pack.metadata);
    this.mercenaryPacks.set(pack.metadata.packId, pack);
    return true;
  }

  public registerMarketPack(pack: MarketRotationPack): boolean {
    if (this.registeredPacks.has(pack.metadata.packId)) return false;
    this.registeredPacks.set(pack.metadata.packId, pack.metadata);
    this.marketPacks.set(pack.metadata.packId, pack);
    return true;
  }

  public registerRaidPack(pack: RaidPack): boolean {
    if (this.registeredPacks.has(pack.metadata.packId)) return false;
    this.registeredPacks.set(pack.metadata.packId, pack.metadata);
    this.raidPacks.set(pack.metadata.packId, pack);
    return true;
  }

  public registerThemedEventPack(pack: ThemedLiveEventPack): boolean {
    if (this.registeredPacks.has(pack.metadata.packId)) return false;
    this.registeredPacks.set(pack.metadata.packId, pack.metadata);
    this.themedPacks.set(pack.metadata.packId, pack);
    return true;
  }

  public setPackState(packId: string, newState: ContentRolloutState): boolean {
    const meta = this.registeredPacks.get(packId);
    if (!meta) return false;

    meta.state = newState;
    meta.isActive = newState === 'ACTIVE';

    events.emit('liveops:pack_state_changed' as any, { packId, state: newState });
    analytics.trackEvent('liveops_pack_state_changed', { packId, state: newState });
    return true;
  }

  public isPackActive(packId: string): boolean {
    const meta = this.registeredPacks.get(packId);
    if (!meta) return false;

    if (!meta.isActive || meta.state !== 'ACTIVE') return false;

    const now = Date.now();
    if (meta.startDate && now < meta.startDate) return false;
    if (meta.endDate && now > meta.endDate) return false;

    return true;
  }

  public getThemedPack(packId: string): ThemedLiveEventPack | undefined {
    return this.themedPacks.get(packId);
  }

  public getAllPacks(): ContentPackMetadata[] {
    return Array.from(this.registeredPacks.values());
  }

  public getActivePacks(): ContentPackMetadata[] {
    return Array.from(this.registeredPacks.values()).filter((p) => this.isPackActive(p.packId));
  }

  public resetAll(): void {
    this.registeredPacks.clear();
    this.eventPacks.clear();
    this.equipmentPacks.clear();
    this.mercenaryPacks.clear();
    this.marketPacks.clear();
    this.raidPacks.clear();
    this.themedPacks.clear();
    this.registerThemedEventPack(MOONLIT_HUNT_PACK);
  }
}

export const contentPackRegistry = ContentPackRegistry.getInstance();
