import { beforeEach, describe, expect, it } from 'vitest';
import { events } from '../src/core/EventBus';
import { titleSystem } from '../src/systems/TitleSystem';

describe('P1 title milestone integrity', () => {
  beforeEach(() => titleSystem.resetAll());

  it('does not grant Master Artisan before five crafted items', () => {
    events.emit('crafting:item_crafted', { item: {}, recipeId: 'test_recipe', totalCraftedCount: 4 });
    expect(titleSystem.isTitleUnlocked('title_master_artisan')).toBe(false);
    events.emit('crafting:item_crafted', { item: {}, recipeId: 'test_recipe', totalCraftedCount: 5 });
    expect(titleSystem.isTitleUnlocked('title_master_artisan')).toBe(true);
  });

  it('does not grant Baron of Commerce before five purchases', () => {
    events.emit('market:purchased', { offerId: 'test_offer', isBlackMarket: false, totalPurchasesCount: 4 });
    expect(titleSystem.isTitleUnlocked('title_baron_of_commerce')).toBe(false);
    events.emit('market:purchased', { offerId: 'test_offer', isBlackMarket: false, totalPurchasesCount: 5 });
    expect(titleSystem.isTitleUnlocked('title_baron_of_commerce')).toBe(true);
  });
});
