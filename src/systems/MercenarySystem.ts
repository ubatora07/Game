import {
  ActiveMercenaryContract,
  MercenaryId,
  MercenarySaveState,
} from '../core/mercenaries/MercenaryTypes';
import { getMercenaryDef } from '../content/mercenariesCatalog';
import { modifierResolver } from '../core/modifiers/ModifierResolver';
import { store } from '../core/GameState';
import { events } from '../core/EventBus';
import { analytics } from '../services/analytics/AnalyticsService';
import { t } from '../services/i18n/I18nService';

export class MercenarySystem {
  private static instance: MercenarySystem;

  private state: MercenarySaveState = {
    activeContracts: {} as Record<MercenaryId, ActiveMercenaryContract>,
    totalHiresCount: 0,
  };

  private constructor() {
    this.reapplyMercenaryModifiers();

    // Check expiration every 5 seconds
    if (typeof window !== 'undefined') {
      window.setInterval(() => {
        this.checkExpirations();
      }, 5000);
    }
  }

  public static getInstance(): MercenarySystem {
    if (!MercenarySystem.instance) {
      MercenarySystem.instance = new MercenarySystem();
    }
    return MercenarySystem.instance;
  }

  public getActiveContracts(): ActiveMercenaryContract[] {
    this.checkExpirations();
    return Object.values(this.state.activeContracts);
  }

  public isMercenaryActive(id: MercenaryId): boolean {
    this.checkExpirations();
    const contract = this.state.activeContracts[id];
    return Boolean(contract && contract.expiresAtTimestamp > Date.now());
  }

  public getContract(id: MercenaryId): ActiveMercenaryContract | undefined {
    this.checkExpirations();
    return this.state.activeContracts[id];
  }

  public hireMercenary(id: MercenaryId): { success: boolean; reason?: string } {
    const def = getMercenaryDef(id);
    if (!def) return { success: false, reason: 'Mercenary not found' };

    const currentGold = store.get().gold;
    if (currentGold < def.costGold) {
      return { success: false, reason: 'Insufficient Gold' };
    }

    // Deduct Gold
    store.set((draft) => {
      draft.gold -= def.costGold;
    });

    const now = Date.now();
    const durationMs = def.contractDurationMinutes * 60 * 1000;
    const expiresAt = now + durationMs;

    this.state.activeContracts[id] = {
      mercId: id,
      hiredAtTimestamp: now,
      expiresAtTimestamp: expiresAt,
      durationMinutes: def.contractDurationMinutes,
    };

    this.state.totalHiresCount += 1;
    this.reapplyMercenaryModifiers();

    events.emit('toast:show', {
      message: t('toast.mercenary.hired', { name: t(def.nameKey), minutes: def.contractDurationMinutes }),
      type: 'success',
    });

    events.emit('mercenary:hired', { mercId: id, durationMinutes: def.contractDurationMinutes });
    analytics.trackEvent('mercenary_hired', { mercId: id, durationMinutes: def.contractDurationMinutes });

    return { success: true };
  }

  public checkExpirations(): void {
    const now = Date.now();
    let changed = false;

    for (const [id, contract] of Object.entries(this.state.activeContracts)) {
      if (contract.expiresAtTimestamp <= now) {
        delete this.state.activeContracts[id as MercenaryId];
        changed = true;

        const def = getMercenaryDef(id as MercenaryId);
        events.emit('toast:show', {
          message: t('toast.mercenary.expired', { name: def ? t(def.nameKey) : id }),
          type: 'info',
        });

        events.emit('mercenary:expired', { mercId: id });
      }
    }

    if (changed) {
      this.reapplyMercenaryModifiers();
    }
  }

  public reapplyMercenaryModifiers(): void {
    modifierResolver.clearBySourceType('mercenary');
    const now = Date.now();

    for (const contract of Object.values(this.state.activeContracts)) {
      if (contract.expiresAtTimestamp <= now) continue;

      const def = getMercenaryDef(contract.mercId);
      if (!def) continue;

      for (const mod of def.modifiers) {
        modifierResolver.registerModifier({
          id: `merc_${contract.mercId}_${mod.target}`,
          target: mod.target,
          type: mod.type,
          value: mod.value,
          source: `Mercenary: ${def.defaultName}`,
          sourceType: 'mercenary',
        });
      }
    }
  }

  public resetAll(): void {
    this.state = {
      activeContracts: {} as Record<MercenaryId, ActiveMercenaryContract>,
      totalHiresCount: 0,
    };
    this.reapplyMercenaryModifiers();
  }

  public resetForSamsara(): void {
    // Mercenary contracts naturally expire on rebirth
    this.state.activeContracts = {} as Record<MercenaryId, ActiveMercenaryContract>;
    this.reapplyMercenaryModifiers();
  }

  public serialize(): MercenarySaveState {
    return {
      activeContracts: { ...this.state.activeContracts },
      totalHiresCount: this.state.totalHiresCount,
    };
  }

  public deserialize(data?: Partial<MercenarySaveState>): void {
    if (!data) return;
    this.state = {
      activeContracts: (data.activeContracts || {}) as Record<MercenaryId, ActiveMercenaryContract>,
      totalHiresCount: data.totalHiresCount || 0,
    };
    this.checkExpirations();
    this.reapplyMercenaryModifiers();
  }
}

export const mercenarySystem = MercenarySystem.getInstance();
