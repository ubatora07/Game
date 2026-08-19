import { AdventureEventDefinition } from '../../core/events/AdventureEventTypes';
import { EquipmentTemplateDefinition } from '../equipmentCatalog';
import { CraftingRecipe } from '../../core/crafting/CraftingTypes';
import { MercenaryDefinition } from '../../core/mercenaries/MercenaryTypes';
import { MarketOfferDefinition } from '../../core/market/MarketTypes';
import { SettlementRaidDefinition } from '../../core/settlement/SettlementDefenseTypes';
import { TitleDefinition } from '../../core/titles/TitleTypes';

export type ContentPackCategory =
  | 'event_chain'
  | 'equipment'
  | 'mercenary'
  | 'market_rotation'
  | 'raid'
  | 'world_encounter'
  | 'themed_event';

export type ContentRolloutState = 'DRAFT' | 'TEST' | 'ACTIVE' | 'EXPIRED' | 'DISABLED';

export interface ContentPackMetadata {
  packId: string;
  version: string;
  category: ContentPackCategory;
  state: ContentRolloutState;
  titleKey: string;
  defaultTitle: string;
  author: string;
  minGameVersion: string;
  startDate?: number; // epoch ms
  endDate?: number;   // epoch ms
  isActive: boolean;
}

export interface EventChainPack {
  metadata: ContentPackMetadata;
  events: AdventureEventDefinition[];
}

export interface EquipmentPack {
  metadata: ContentPackMetadata;
  equipmentTemplates: EquipmentTemplateDefinition[];
  recipes: CraftingRecipe[];
}

export interface MercenaryPack {
  metadata: ContentPackMetadata;
  mercenaries: MercenaryDefinition[];
}

export interface MarketRotationPack {
  metadata: ContentPackMetadata;
  rotationId: string;
  durationDays: number;
  offers: MarketOfferDefinition[];
}

export interface RaidPack {
  metadata: ContentPackMetadata;
  raids: SettlementRaidDefinition[];
}

export interface ThemedLiveEventPack {
  metadata: ContentPackMetadata;
  events: AdventureEventDefinition[];
  raids?: SettlementRaidDefinition[];
  marketOffers?: MarketOfferDefinition[];
  mercenaries?: MercenaryDefinition[];
  titles?: TitleDefinition[];
}
