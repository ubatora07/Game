import { ModifierTarget, ModifierType } from '../modifiers/ModifierTypes';
import { KarmaBand } from '../karma/KarmaTypes';

export type MarketCategory =
  | 'all'
  | 'equipment'
  | 'consumables'
  | 'materials'
  | 'settlement'
  | 'mercenaries'
  | 'services'
  | 'titles'
  | 'black_market';

export interface MarketOfferPrice {
  gold?: number;
  crystals?: number;
  karmaCost?: number;
  materials?: Partial<Record<string, number>>;
}

export interface MarketRewardPayload {
  type: 'equipment' | 'material' | 'buff' | 'mercenary' | 'title' | 'settlement_materials' | 'souls';
  templateId?: string;
  materialId?: string;
  count?: number;
  mercId?: string;
  titleId?: string;
  buffDurationMinutes?: number;
  targetModifier?: { target: ModifierTarget; type: ModifierType; value: number; label: string };
  settlementResources?: { wood?: number; stone?: number; iron?: number };
}

export interface MarketOfferDefinition {
  id: string;
  nameKey: string;
  defaultName: string;
  descKey: string;
  defaultDesc: string;
  category: MarketCategory;
  price: MarketOfferPrice;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'forbidden';
  iconSvg: string;
  stockMax: number;
  isBlackMarket: boolean;
  tradeOffDesc?: string;
  unlockCondition?: {
    minWorld?: number;
    minSettlementLevel?: number;
    requiredKarmaBand?: KarmaBand;
    maxKarma?: number;
    requiredNPC?: string;
    requiredClass?: string;
    description: string;
  };
  reward: MarketRewardPayload;
}

export interface MarketSlotItem {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  currency: 'gold' | 'crystals' | 'souls';
  effect: {
    powerGrant?: number;
    elixirStat?: string;
    petXpGrant?: number;
    acquirePetId?: string;
  };
}

export interface MarketSlot {
  slotId: string;
  item: MarketSlotItem;
  currency: 'gold' | 'crystals' | 'souls';
  price: number;
  remainingStock: number;
  isSoldOut: boolean;
}

export interface MarketSaveState {
  currentStock: Record<string, number>; // offerId -> remaining count
  slots: MarketSlot[];
  lastRefreshTimestamp: number;
  isBlackMarketDiscovered: boolean;
  discoveredSmugglerContacts: string[];
  totalPurchasesCount: number;
  totalBlackMarketPurchasesCount: number;
}
