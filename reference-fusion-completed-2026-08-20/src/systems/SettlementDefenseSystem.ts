import {
  ActiveRaidState,
  SettlementDefenseSaveState,
  SettlementRaidDefinition,
} from '../core/settlement/SettlementDefenseTypes';
import { getRaidDefinition, getAllRaidDefinitions } from '../content/settlementRaidsCatalog';
import { modifierResolver } from '../core/modifiers/ModifierResolver';
import { settlementSystem } from './SettlementSystem';
import { craftingEquipmentSystem } from './CraftingEquipmentSystem';
import { karmaSystem } from './KarmaSystem';
import { store } from '../core/GameState';
import { events } from '../core/EventBus';
import { analytics } from '../services/analytics/AnalyticsService';
import { t } from '../services/i18n/I18nService';

export class SettlementDefenseSystem {
  private static instance: SettlementDefenseSystem;

  private state: SettlementDefenseSaveState = {
    lastRaidTimestamp: Date.now(),
    totalRaidsDefeated: 0,
    totalRaidsFailed: 0,
    activeRaid: null,
  };

  private constructor() {}

  public static getInstance(): SettlementDefenseSystem {
    if (!SettlementDefenseSystem.instance) {
      SettlementDefenseSystem.instance = new SettlementDefenseSystem();
    }
    return SettlementDefenseSystem.instance;
  }

  /* --------------------------------------------------------------------- */
  /* TOTAL DEFENSE CALCULATION                                             */
  /* --------------------------------------------------------------------- */
  public getTotalDefense(): number {
    const base = 10;
    // Walls contribution from settlement buildings
    const settlementLvl = settlementSystem.getSettlementLevel();
    const wallsBonus = settlementLvl * 25;

    // Modifiers from ModifierResolver (Equipment, Mercenaries like Torin, Titles, Karma)
    const modifierBonus = modifierResolver.resolve('settlementDefense', 0);

    return Math.round(base + wallsBonus + modifierBonus);
  }

  public getActiveRaid(): ActiveRaidState | null {
    return this.state.activeRaid;
  }

  /* --------------------------------------------------------------------- */
  /* RAID DISPATCH & RESOLUTION                                            */
  /* --------------------------------------------------------------------- */
  public triggerRaid(raidId?: string): ActiveRaidState {
    const raids = getAllRaidDefinitions();
    const currentDefense = this.getTotalDefense();

    let def: SettlementRaidDefinition;
    if (raidId) {
      def = getRaidDefinition(raidId) || raids[0];
    } else {
      // Pick appropriate tier based on defense/settlement progression
      if (currentDefense < 60) def = raids[0];
      else if (currentDefense < 140) def = raids[1];
      else if (currentDefense < 240) def = raids[2];
      else def = raids[3];
    }

    const now = Date.now();
    const active: ActiveRaidState = {
      raidId: def.id,
      threatLevel: def.threatLevel,
      startTime: now,
      endsAt: now + 5000,
      settlementDefenseSnapshot: currentDefense,
      isResolved: false,
    };

    this.state.activeRaid = active;

    events.emit('toast:show', {
      message: t('raid.toast.incoming', { name: t(def.nameKey) }),
      type: 'warning',
    });

    events.emit('settlement:raid_triggered' as any, { raidId: def.id, threatLevel: def.threatLevel });
    analytics.trackEvent('settlement_raid_triggered', { raidId: def.id, threatLevel: def.threatLevel });

    return active;
  }

  public resolveRaid(raidId?: string): { won: boolean; raid: SettlementRaidDefinition; defense: number } {
    const targetId = raidId || this.state.activeRaid?.raidId || 'raid_goblin_scouts';
    const def = getRaidDefinition(targetId)!;
    const currentDefense = this.getTotalDefense();

    const won = currentDefense >= def.requiredDefense;

    if (won) {
      this.state.totalRaidsDefeated += 1;

      // Grant rewards
      store.set((draft) => {
        draft.gold += def.rewardsOnWin.gold;
      });

      if (def.rewardsOnWin.ironOre) {
        craftingEquipmentSystem.addMaterial('material_iron_ore', def.rewardsOnWin.ironOre);
      }
      if (def.rewardsOnWin.meteoriteOre) {
        craftingEquipmentSystem.addMaterial('material_rare_meteorite', def.rewardsOnWin.meteoriteOre);
      }
      if (def.rewardsOnWin.karmaDelta) {
        karmaSystem.modifyKarma(def.rewardsOnWin.karmaDelta, 'settlement_defense');
      }

      events.emit('toast:show', {
        message: t('raid.toast.repelled', { name: t(def.nameKey) }),
        type: 'epic',
      });

      events.emit('settlement:raid_won' as any, { raidId: def.id, defense: currentDefense });
      analytics.trackEvent('settlement_raid_won', { raidId: def.id, defense: currentDefense });
    } else {
      this.state.totalRaidsFailed += 1;

      // Penalties: deduct small repair costs from settlement materials & gold
      settlementSystem.addMaterials(
        -Math.min(def.penaltyOnLoss.woodCost, settlementSystem.getMaterials().wood),
        -Math.min(def.penaltyOnLoss.stoneCost, settlementSystem.getMaterials().stone),
        0
      );

      store.set((draft) => {
        draft.gold = Math.max(0, draft.gold - def.penaltyOnLoss.goldCost);
      });

      events.emit('toast:show', {
        message: t('raid.toast.breached', { name: t(def.nameKey) }),
        type: 'warning',
      });

      events.emit('settlement:raid_lost' as any, { raidId: def.id, defense: currentDefense });
      analytics.trackEvent('settlement_raid_lost', { raidId: def.id, defense: currentDefense });
    }

    if (this.state.activeRaid) {
      this.state.activeRaid.isResolved = true;
      this.state.activeRaid.won = won;
    }

    this.state.lastRaidTimestamp = Date.now();
    return { won, raid: def, defense: currentDefense };
  }

  /* --------------------------------------------------------------------- */
  /* SERIALIZATION & SAMSARA                                               */
  /* --------------------------------------------------------------------- */
  public resetAll(): void {
    this.state = {
      lastRaidTimestamp: Date.now(),
      totalRaidsDefeated: 0,
      totalRaidsFailed: 0,
      activeRaid: null,
    };
  }

  public resetForSamsara(): void {
    this.state.activeRaid = null;
  }

  public serialize(): SettlementDefenseSaveState {
    return {
      lastRaidTimestamp: this.state.lastRaidTimestamp,
      totalRaidsDefeated: this.state.totalRaidsDefeated,
      totalRaidsFailed: this.state.totalRaidsFailed,
      activeRaid: this.state.activeRaid ? { ...this.state.activeRaid } : null,
    };
  }

  public deserialize(data?: Partial<SettlementDefenseSaveState>): void {
    if (!data) return;
    this.state = {
      lastRaidTimestamp: data.lastRaidTimestamp || Date.now(),
      totalRaidsDefeated: data.totalRaidsDefeated || 0,
      totalRaidsFailed: data.totalRaidsFailed || 0,
      activeRaid: data.activeRaid ? { ...data.activeRaid } : null,
    };
  }
}

export const settlementDefenseSystem = SettlementDefenseSystem.getInstance();
