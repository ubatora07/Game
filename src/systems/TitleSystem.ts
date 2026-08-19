import { TitleDefinition, TitleSaveState } from '../core/titles/TitleTypes';
import { getTitleDef } from '../content/titlesCatalog';
import { modifierResolver } from '../core/modifiers/ModifierResolver';
import { events } from '../core/EventBus';
import { analytics } from '../services/analytics/AnalyticsService';
import { t } from '../services/i18n/I18nService';

export class TitleSystem {
  private static instance: TitleSystem;

  private state: TitleSaveState = {
    unlockedTitleIds: ['title_novice_traveler'],
    equippedTitleId: 'title_novice_traveler',
  };

  private constructor() {
    this.reapplyTitleModifiers();

    // Event hooks for automatic title unlocks
    events.on('settlement:unlocked' as any, () => {
      this.unlockTitle('title_pioneer_lord');
    });

    events.on('tower:floorCleared' as any, (data: any) => {
      if (data?.floor >= 10) {
        this.unlockTitle('title_tower_ascendant');
      }
    });

    events.on('karma:changed' as any, (data: any) => {
      if (data?.score >= 60) {
        this.unlockTitle('title_virtuous_champion');
      } else if (data?.score <= -60) {
        this.unlockTitle('title_dread_overlord');
      }
    });

    events.on('rhythm:easter_egg_unlocked' as any, () => {
      this.unlockTitle('title_rhythm_master');
    });

    events.on('crafting:item_crafted', (data) => {
      this.checkCraftingMilestones(data.totalCraftedCount);
    });

    events.on('market:purchased', (data) => {
      this.checkMarketMilestones(data.totalPurchasesCount);
    });
  }

  public static getInstance(): TitleSystem {
    if (!TitleSystem.instance) {
      TitleSystem.instance = new TitleSystem();
    }
    return TitleSystem.instance;
  }

  public getUnlockedTitles(): TitleDefinition[] {
    return this.state.unlockedTitleIds
      .map((id) => getTitleDef(id))
      .filter((t): t is TitleDefinition => Boolean(t));
  }

  public isTitleUnlocked(id: string): boolean {
    return this.state.unlockedTitleIds.includes(id);
  }

  public getEquippedTitle(): TitleDefinition | undefined {
    return this.state.equippedTitleId ? getTitleDef(this.state.equippedTitleId) : undefined;
  }

  public unlockTitle(id: string): boolean {
    if (this.isTitleUnlocked(id)) return false;
    const def = getTitleDef(id);
    if (!def) return false;

    this.state.unlockedTitleIds.push(id);

    events.emit('toast:show', {
      message: t('toast.title.unlocked', { name: t(def.nameKey) }),
      type: 'epic',
    });

    events.emit('title:unlocked' as any, { titleId: id });
    analytics.trackEvent('title_unlocked', { titleId: id, category: def.category });
    return true;
  }

  public equipTitle(id: string | null): boolean {
    if (id !== null && !this.isTitleUnlocked(id)) return false;

    this.state.equippedTitleId = id;
    this.reapplyTitleModifiers();

    const def = id ? getTitleDef(id) : undefined;
    events.emit('toast:show', {
      message: id ? `TITLE EQUIPPED: ${def?.defaultName}` : 'Title unequipped.',
      type: 'info',
    });

    events.emit('title:equipped' as any, { titleId: id });
    analytics.trackEvent('title_equipped', { titleId: id });
    return true;
  }

  public checkCraftingMilestones(totalCraftedCount: number): void {
    if (totalCraftedCount >= 5) {
      this.unlockTitle('title_master_artisan');
    }
  }

  public checkMarketMilestones(totalPurchasesCount: number): void {
    if (totalPurchasesCount >= 5) {
      this.unlockTitle('title_baron_of_commerce');
    }
  }

  public reapplyTitleModifiers(): void {
    modifierResolver.clearBySourceType('title' as any);
    if (!this.state.equippedTitleId) return;

    const def = getTitleDef(this.state.equippedTitleId);
    if (!def || !def.modifiers) return;

    for (const mod of def.modifiers) {
      modifierResolver.registerModifier({
        id: `title_${def.id}_${mod.target}`,
        target: mod.target,
        type: mod.type,
        value: mod.value,
        source: `Title: ${def.defaultName}`,
        sourceType: 'title' as any,
      });
    }
  }

  public resetAll(): void {
    this.state = {
      unlockedTitleIds: ['title_novice_traveler'],
      equippedTitleId: 'title_novice_traveler',
    };
    this.reapplyTitleModifiers();
  }

  public resetForSamsara(): void {
    // Samsara permanently preserves all earned Titles and identity
    this.reapplyTitleModifiers();
  }

  public serialize(): TitleSaveState {
    return {
      unlockedTitleIds: [...this.state.unlockedTitleIds],
      equippedTitleId: this.state.equippedTitleId,
    };
  }

  public deserialize(data?: Partial<TitleSaveState>): void {
    if (!data) return;
    this.state = {
      unlockedTitleIds: data.unlockedTitleIds || ['title_novice_traveler'],
      equippedTitleId: data.equippedTitleId !== undefined ? data.equippedTitleId : 'title_novice_traveler',
    };
    this.reapplyTitleModifiers();
  }
}

export const titleSystem = TitleSystem.getInstance();
