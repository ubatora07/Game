import {
  LegacyEndingDefinition,
  LegacyEndingId,
  LegacyEndingSaveState,
} from '../core/legacy/LegacyEndingTypes';
import { getLegacyEndingDef } from '../content/legacyEndingsCatalog';
import { modifierResolver } from '../core/modifiers/ModifierResolver';
import { karmaSystem } from './KarmaSystem';
import { settlementSystem } from './SettlementSystem';
import { marketSystem } from './MarketSystem';
import { store } from '../core/GameState';
import { events } from '../core/EventBus';
import { analytics } from '../services/analytics/AnalyticsService';
import { t } from '../services/i18n/I18nService';

export class LegacyEndingSystem {
  private static instance: LegacyEndingSystem;

  private state: LegacyEndingSaveState = {
    unlockedEndingIds: [],
    activeEndingId: null,
    totalEndingsCompleted: 0,
  };

  private constructor() {
    this.reapplyLegacyModifiers();
  }

  public static getInstance(): LegacyEndingSystem {
    if (!LegacyEndingSystem.instance) {
      LegacyEndingSystem.instance = new LegacyEndingSystem();
    }
    return LegacyEndingSystem.instance;
  }

  public getUnlockedEndings(): LegacyEndingDefinition[] {
    return this.state.unlockedEndingIds
      .map((id) => getLegacyEndingDef(id))
      .filter((d): d is LegacyEndingDefinition => !!d);
  }

  public isEndingUnlocked(id: LegacyEndingId): boolean {
    return this.state.unlockedEndingIds.includes(id);
  }

  public getActiveEnding(): LegacyEndingDefinition | null {
    if (!this.state.activeEndingId) return null;
    return getLegacyEndingDef(this.state.activeEndingId) || null;
  }

  public getActiveBoon(): LegacyEndingDefinition | null {
    return this.getActiveEnding();
  }

  public evaluateEndingEligibility(): LegacyEndingId[] {
    const eligible: LegacyEndingId[] = [];
    const karmaScore = karmaSystem.getScore();
    const settlementLevel = settlementSystem.getSettlementLevel();
    const isBlackMarket = marketSystem.isBlackMarketAvailable();
    const reincarnations = store.get().reincarnationCount || 0;

    // Savior of Mountain Realm: Virtuous + Citadel Level 3 (or Level 2+ in early world)
    if (karmaScore >= 50 && settlementLevel >= 2) {
      eligible.push('ending_savior_mountain_realm');
    }

    // Dread Sovereign: Infamous + Black Market Discovered
    if (karmaScore <= -50 && isBlackMarket) {
      eligible.push('ending_dread_sovereign_void');
    }

    // Eternal Wanderer: Neutral alignment + at least 1 adventure flag
    if (karmaScore >= -15 && karmaScore <= 15) {
      eligible.push('ending_eternal_wanderer');
    }

    // Celestial Ascendant: High Reincarnation
    if (Number(reincarnations) >= 3) {
      eligible.push('ending_celestial_ascendant');
    }

    return eligible;
  }

  public unlockEnding(id: LegacyEndingId): boolean {
    if (this.state.unlockedEndingIds.includes(id)) return false;

    this.state.unlockedEndingIds.push(id);
    this.state.totalEndingsCompleted += 1;

    // Default to this ending as active boon if none is currently selected
    if (!this.state.activeEndingId) {
      this.state.activeEndingId = id;
    }

    this.reapplyLegacyModifiers();

    const def = getLegacyEndingDef(id)!;
    events.emit('toast:show', {
      message: t('legacy.toast.ending_recorded', { title: t(def.titleKey) }),
      type: 'epic',
    });

    events.emit('legacy:ending_unlocked' as any, { endingId: id });
    analytics.trackEvent('legacy_ending_unlocked', { endingId: id });

    return true;
  }

  public setActiveEnding(id: LegacyEndingId | null): boolean {
    if (id !== null && !this.state.unlockedEndingIds.includes(id)) {
      return false;
    }

    this.state.activeEndingId = id;
    this.reapplyLegacyModifiers();

    if (id) {
      const def = getLegacyEndingDef(id);
      events.emit('toast:show', {
        message: t('legacy.toast.boon_equipped', { title: def ? t(def.titleKey) : id }),
        type: 'info',
      });
      analytics.trackEvent('legacy_boon_equipped', { endingId: id });
    }

    return true;
  }

  public setActiveBoon(id: LegacyEndingId | null): boolean {
    return this.setActiveEnding(id);
  }

  public reapplyLegacyModifiers(): void {
    // Unregister any previous active boon modifier
    modifierResolver.unregisterModifier('active_legacy_boon');

    // Only inject the single active legacy boon
    if (this.state.activeEndingId && this.state.unlockedEndingIds.includes(this.state.activeEndingId)) {
      const def = getLegacyEndingDef(this.state.activeEndingId);
      if (def) {
        modifierResolver.registerModifier({
          id: 'active_legacy_boon',
          target: def.permanentModifier.target,
          type: def.permanentModifier.type,
          value: def.permanentModifier.value,
          source: `Legacy: ${t(def.titleKey)}`,
          sourceType: 'permanent_passive',
        });
      }
    }
  }

  /* --------------------------------------------------------------------- */
  /* SERIALIZATION & SAMSARA (PERMANENT)                                   */
  /* --------------------------------------------------------------------- */
  public resetAll(): void {
    this.state = {
      unlockedEndingIds: [],
      activeEndingId: null,
      totalEndingsCompleted: 0,
    };
    this.reapplyLegacyModifiers();
  }

  public resetForSamsara(): void {
    // Permanent legacy across all lives
    this.reapplyLegacyModifiers();
  }

  public serialize(): LegacyEndingSaveState {
    return {
      unlockedEndingIds: [...this.state.unlockedEndingIds],
      activeEndingId: this.state.activeEndingId,
      totalEndingsCompleted: this.state.totalEndingsCompleted,
    };
  }

  public deserialize(data?: Partial<LegacyEndingSaveState>): void {
    if (!data) return;
    this.state = {
      unlockedEndingIds: [...(data.unlockedEndingIds || [])],
      activeEndingId: data.activeEndingId || null,
      totalEndingsCompleted: data.totalEndingsCompleted || 0,
    };
    this.reapplyLegacyModifiers();
  }
}

export const legacyEndingSystem = LegacyEndingSystem.getInstance();
