import {
  MarketCategory,
  MarketOfferDefinition,
  MarketSaveState,
} from '../core/market/MarketTypes';
import { getAllMarketOfferDefs, getMarketOfferDef } from '../content/marketCatalog';
import { store } from '../core/GameState';
import { modifierResolver } from '../core/modifiers/ModifierResolver';
import { settlementSystem } from './SettlementSystem';
import { craftingEquipmentSystem } from './CraftingEquipmentSystem';
import { mercenarySystem } from './MercenarySystem';
import { titleSystem } from './TitleSystem';
import { karmaSystem } from './KarmaSystem';
import { instantiateEquipment } from '../content/equipmentCatalog';
import { events } from '../core/EventBus';
import { analytics } from '../services/analytics/AnalyticsService';
import { CraftingMaterialId } from '../core/crafting/CraftingTypes';
import { MercenaryId } from '../core/mercenaries/MercenaryTypes';
import { petSystem } from './PetSystem';
import { PetId } from '../core/pets/PetTypes';

export class MarketSystem {
  private static instance: MarketSystem;

  private state: MarketSaveState = {
    currentStock: {},
    slots: [],
    lastRefreshTimestamp: Date.now(),
    isBlackMarketDiscovered: false,
    discoveredSmugglerContacts: [],
    totalPurchasesCount: 0,
    totalBlackMarketPurchasesCount: 0,
  };

  private constructor() {
    this.initDefaultStock();

    // Event hooks for Black Market discovery
    events.on('karma:changed' as any, (data: any) => {
      if (data?.score <= -20 && !this.state.isBlackMarketDiscovered) {
        this.discoverBlackMarket('vane_shadow_connection');
      }
    });

    events.on('crafting:blacksmith_unlocked' as any, (data: any) => {
      if (data?.blacksmithId === 'blacksmith_vane') {
        this.discoverBlackMarket('vane_shadowsmith');
      }
    });

    events.on('adventure:choice_executed' as any, (data: any) => {
      if (data?.choiceId === 'shadow_alley_deal' || data?.choiceId === 'bribe_smuggler') {
        this.discoverBlackMarket('smuggler_malik');
      }
    });
  }

  public static getInstance(): MarketSystem {
    if (!MarketSystem.instance) {
      MarketSystem.instance = new MarketSystem();
    }
    return MarketSystem.instance;
  }

  private initDefaultStock(): void {
    for (const def of getAllMarketOfferDefs()) {
      if (this.state.currentStock[def.id] === undefined) {
        this.state.currentStock[def.id] = def.stockMax;
      }
    }
  }

  /* --------------------------------------------------------------------- */
  /* STOCK & CATEGORY MANAGEMENT                                           */
  /* --------------------------------------------------------------------- */
  public getOffers(category: MarketCategory = 'all'): MarketOfferDefinition[] {
    const all = getAllMarketOfferDefs();
    return all.filter((o) => {
      if (category !== 'all' && o.category !== category) {
        // Special case: if category is 'black_market', only return black market items
        if (category === 'black_market' && !o.isBlackMarket) return false;
        if (category !== 'black_market' && o.category !== category) return false;
      }

      // If item is black market, verify Black Market eligibility
      if (o.isBlackMarket && !this.isBlackMarketAvailable()) {
        return false;
      }

      return true;
    });
  }

  public getAvailableStock(offerId: string): number {
    return this.state.currentStock[offerId] !== undefined
      ? this.state.currentStock[offerId]
      : (getMarketOfferDef(offerId)?.stockMax || 0);
  }

  public refreshStock(): void {
    for (const def of getAllMarketOfferDefs()) {
      this.state.currentStock[def.id] = def.stockMax;
    }
    this.state.lastRefreshTimestamp = Date.now();

    events.emit('toast:show', {
      message: 'Bazaar goods replenished with fresh caravan shipments!',
      type: 'info',
    });

    events.emit('market:refreshed' as any, {});
  }

  /* --------------------------------------------------------------------- */
  /* BLACK MARKET DISCOVERY                                                */
  /* --------------------------------------------------------------------- */
  public isBlackMarketAvailable(): boolean {
    if (this.state.isBlackMarketDiscovered) return true;
    if (karmaSystem.getScore() <= -20) return true;
    if (craftingEquipmentSystem.isBlacksmithUnlocked('blacksmith_vane')) return true;
    return false;
  }

  public discoverBlackMarket(contactId: string = 'mysterious_broker'): boolean {
    if (this.state.isBlackMarketDiscovered) {
      if (!this.state.discoveredSmugglerContacts.includes(contactId)) {
        this.state.discoveredSmugglerContacts.push(contactId);
      }
      return false;
    }

    this.state.isBlackMarketDiscovered = true;
    if (!this.state.discoveredSmugglerContacts.includes(contactId)) {
      this.state.discoveredSmugglerContacts.push(contactId);
    }

    events.emit('toast:show', {
      message: 'CLANDESTINE ACCESS: The Smuggler Black Market is now accessible!',
      type: 'epic',
    });

    events.emit('market:black_market_unlocked' as any, { contactId });
    analytics.trackEvent('black_market_unlocked', { contactId });
    return true;
  }

  /* --------------------------------------------------------------------- */
  /* PURCHASE TRANSACTION ENGINE                                           */
  /* --------------------------------------------------------------------- */
  public canBuyOffer(offerId: string): { canBuy: boolean; reason?: string } {
    const offer = getMarketOfferDef(offerId);
    if (!offer) return { canBuy: false, reason: 'Offer not found' };

    const stock = this.getAvailableStock(offerId);
    if (stock <= 0) {
      return { canBuy: false, reason: 'Out of stock' };
    }

    if (offer.isBlackMarket && !this.isBlackMarketAvailable()) {
      return { canBuy: false, reason: 'Black Market route locked' };
    }

    // Check Gold
    if (offer.price.gold && store.get().gold < offer.price.gold) {
      return { canBuy: false, reason: 'Insufficient Gold' };
    }

    // Check Crystals
    if (offer.price.crystals && store.get().crystals < offer.price.crystals) {
      return { canBuy: false, reason: 'Insufficient Crystals' };
    }

    return { canBuy: true };
  }

  public buyOffer(offerId: string): { success: boolean; reason?: string } {
    const check = this.canBuyOffer(offerId);
    if (!check.canBuy) {
      return { success: false, reason: check.reason };
    }

    const offer = getMarketOfferDef(offerId)!;

    // Deduct Gold
    if (offer.price.gold) {
      store.set((draft) => {
        draft.gold -= offer.price.gold!;
      });
    }

    // Deduct Crystals
    if (offer.price.crystals) {
      store.set((draft) => {
        draft.crystals -= offer.price.crystals!;
      });
    }

    // Shift Karma if forbidden good
    if (offer.price.karmaCost) {
      karmaSystem.modifyKarma(offer.price.karmaCost, 'market_purchase');
    }

    // Deliver Reward
    this.grantReward(offer.reward);

    // Decrement stock
    this.state.currentStock[offerId] = (this.state.currentStock[offerId] || 1) - 1;
    this.state.totalPurchasesCount += 1;
    if (offer.isBlackMarket) {
      this.state.totalBlackMarketPurchasesCount += 1;
    }

    events.emit('toast:show', {
      message: `PURCHASED: ${offer.defaultName}!`,
      type: offer.isBlackMarket ? 'epic' : 'success',
    });

    events.emit('market:purchased', {
      offerId,
      isBlackMarket: offer.isBlackMarket,
      totalPurchasesCount: this.state.totalPurchasesCount,
    });
    analytics.trackEvent('market_purchased', { offerId, isBlackMarket: offer.isBlackMarket, rarity: offer.rarity });

    return { success: true };
  }

  private grantReward(reward: MarketOfferDefinition['reward']): void {
    switch (reward.type) {
      case 'material':
        if (reward.materialId && reward.count) {
          craftingEquipmentSystem.addMaterial(reward.materialId as CraftingMaterialId, reward.count);
        }
        break;

      case 'equipment':
        if (reward.templateId) {
          const item = instantiateEquipment(reward.templateId);
          if (item) {
            craftingEquipmentSystem.addItemToInventory(item);
          }
        }
        break;

      case 'settlement_materials':
        if (reward.settlementResources) {
          settlementSystem.addMaterials(
            reward.settlementResources.wood || 0,
            reward.settlementResources.stone || 0,
            reward.settlementResources.iron || 0
          );
        }
        break;

      case 'mercenary':
        if (reward.mercId) {
          mercenarySystem.hireMercenary(reward.mercId as MercenaryId);
        }
        break;

      case 'title':
        if (reward.titleId) {
          titleSystem.unlockTitle(reward.titleId);
        }
        break;

      case 'souls':
        if (reward.count) {
          store.set((draft) => {
            draft.souls += reward.count!;
          });
        }
        break;
    }
  }

  /* --------------------------------------------------------------------- */
  /* LEGACY / MVP SLOTS API COMPATIBILITY (PHASES 90/91/94)               */
  /* --------------------------------------------------------------------- */
  public refreshMarket(_force: boolean = false, now: number = Date.now(), world: number = 1): void {
    const worldScale = Math.max(1, world);
    this.state.slots = [
      {
        slotId: 'slot_power_elixir',
        item: {
          id: 'mkt_potion_power_elixir',
          name: 'Power Elixir',
          description: 'Temporarily enhances attack power.',
          baseCost: 1000,
          currency: 'gold',
          effect: { powerGrant: 500, elixirStat: 'attack' },
        },
        currency: 'gold',
        price: 1000 * worldScale,
        remainingStock: 3,
        isSoldOut: false,
      },
      {
        slotId: 'slot_pet_treat',
        item: {
          id: 'mkt_pet_treat',
          name: 'Pet Treat',
          description: 'Nutritious treat granting +400 XP to your active companion.',
          baseCost: 800,
          currency: 'gold',
          effect: { petXpGrant: 400 },
        },
        currency: 'gold',
        price: 800 * worldScale,
        remainingStock: 5,
        isSoldOut: false,
      },
      {
        slotId: 'slot_pet_egg',
        item: {
          id: 'mkt_pet_incubator_egg',
          name: 'Pet Egg',
          description: 'Hatch a loyal Ignis Drake companion.',
          baseCost: 200,
          currency: 'crystals',
          effect: { acquirePetId: 'pet_ignis_drake' },
        },
        currency: 'crystals',
        price: 200,
        remainingStock: 1,
        isSoldOut: false,
      },
      {
        slotId: 'slot_gold_pouch',
        item: {
          id: 'mkt_gold_pouch',
          name: 'Gold Pouch',
          description: 'Instant cultivation power.',
          baseCost: 10,
          currency: 'crystals',
          effect: { powerGrant: 250 },
        },
        currency: 'crystals',
        price: 10,
        remainingStock: 10,
        isSoldOut: false,
      },
    ];

    this.state.lastRefreshTimestamp = now;
  }

  public getSlots(): any[] {
    if (!this.state.slots || this.state.slots.length === 0) {
      this.refreshMarket();
    }
    return this.state.slots;
  }

  public getSecondsUntilNextRefresh(): number {
    const nextRefresh = this.state.lastRefreshTimestamp + 3600 * 1000;
    return Math.max(0, Math.min(3600, Math.ceil((nextRefresh - Date.now()) / 1000)));
  }

  public purchaseItem(slotId: string): { success: boolean; reason?: string } {
    const slot = this.getSlots().find((s) => s.slotId === slotId);
    if (!slot) return { success: false, reason: 'Slot not found' };

    if (slot.remainingStock <= 0 || slot.isSoldOut) {
      return { success: false, reason: 'Out of stock' };
    }

    const currentGold = store.get().gold;
    const currentCrystals = store.get().crystals;

    if (slot.currency === 'gold' && currentGold < slot.price) {
      return { success: false, reason: 'Insufficient funds' };
    }
    if (slot.currency === 'crystals' && currentCrystals < slot.price) {
      return { success: false, reason: 'Insufficient funds' };
    }

    // Deduct cost
    if (slot.currency === 'gold') {
      store.set((draft) => {
        draft.gold -= slot.price;
      });
    } else if (slot.currency === 'crystals') {
      store.set((draft) => {
        draft.crystals -= slot.price;
      });
    }

    // Apply effect
    if (slot.item.effect.powerGrant) {
      store.set((draft) => {
        draft.power += slot.item.effect.powerGrant!;
      });
    }
    if (slot.item.effect.elixirStat) {
      modifierResolver.registerModifier({
        id: 'market_potion_power',
        target: 'attack',
        type: 'percent_add',
        value: 0.25,
        source: 'Market Elixir',
        sourceType: 'temporary',
      });
    }
    if (slot.item.effect.petXpGrant) {
      const activeId = petSystem.getActivePet()?.id || 'pet_sylph_sprite';
      petSystem.addPetXp(activeId as PetId, slot.item.effect.petXpGrant);
    }
    if (slot.item.effect.acquirePetId) {
      petSystem.acquirePet(slot.item.effect.acquirePetId as PetId);
    }

    slot.remainingStock -= 1;
    if (slot.remainingStock <= 0) {
      slot.isSoldOut = true;
    }

    return { success: true };
  }

  /* --------------------------------------------------------------------- */
  /* SERIALIZATION & SAMSARA RESET                                         */
  /* --------------------------------------------------------------------- */
  public resetAll(): void {
    this.state = {
      currentStock: {},
      slots: [],
      lastRefreshTimestamp: Date.now(),
      isBlackMarketDiscovered: false,
      discoveredSmugglerContacts: [],
      totalPurchasesCount: 0,
      totalBlackMarketPurchasesCount: 0,
    };
    this.initDefaultStock();
    this.refreshMarket();
  }

  public resetForSamsara(): void {
    // Rebirth preserves Black Market contacts & refreshes stock
    this.refreshStock();
    this.refreshMarket();
  }

  public serialize(): MarketSaveState {
    return {
      currentStock: { ...this.state.currentStock },
      slots: (this.state.slots || []).map((s) => ({ ...s, item: { ...s.item, effect: { ...s.item.effect } } })),
      lastRefreshTimestamp: this.state.lastRefreshTimestamp,
      isBlackMarketDiscovered: this.state.isBlackMarketDiscovered,
      discoveredSmugglerContacts: [...this.state.discoveredSmugglerContacts],
      totalPurchasesCount: this.state.totalPurchasesCount,
      totalBlackMarketPurchasesCount: this.state.totalBlackMarketPurchasesCount,
    };
  }

  public deserialize(data?: Partial<MarketSaveState>): void {
    if (!data) return;
    this.state = {
      currentStock: { ...(data.currentStock || {}) },
      slots: (data.slots || []).map((s) => ({ ...s, item: { ...s.item, effect: { ...s.item.effect } } })),
      lastRefreshTimestamp: data.lastRefreshTimestamp || Date.now(),
      isBlackMarketDiscovered: Boolean(data.isBlackMarketDiscovered),
      discoveredSmugglerContacts: [...(data.discoveredSmugglerContacts || [])],
      totalPurchasesCount: data.totalPurchasesCount || 0,
      totalBlackMarketPurchasesCount: data.totalBlackMarketPurchasesCount || 0,
    };
    this.initDefaultStock();
    if (!this.state.slots || this.state.slots.length === 0) {
      this.refreshMarket();
    }
  }
}

export const marketSystem = MarketSystem.getInstance();

