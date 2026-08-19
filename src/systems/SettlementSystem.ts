import {
  SettlementSaveState,
  SettlementBuildingId,
  SettlementBuildingState,
  SettlementNPCId,
} from '../core/settlement/SettlementTypes';
import {
  getSettlementBuildingDef,
  calculateBuildingUpgradeCost,
} from '../content/settlementCatalog';
import { getSettlementNPCDef } from '../content/settlementNPCs';
import { modifierResolver } from '../core/modifiers/ModifierResolver';
import { store } from '../core/GameState';
import { events } from '../core/EventBus';
import { analytics } from '../services/analytics/AnalyticsService';
import { t } from '../services/i18n/I18nService';
import { karmaSystem } from './KarmaSystem';

export class SettlementSystem {
  private static instance: SettlementSystem;

  private state: SettlementSaveState = {
    isOwned: false,
    settlementName: 'Mountain Haven',
    settlementLevel: 1,
    wood: 100,
    stone: 80,
    iron: 30,
    defenseRating: 10,
    prosperityRating: 15,
    buildings: {
      throne_hall: { id: 'throne_hall', plotSlotId: 'plot_1', level: 1, isConstructed: true },
      forge: { id: 'forge', plotSlotId: 'plot_2', level: 1, isConstructed: true },
      market: { id: 'market', plotSlotId: 'plot_3', level: 1, isConstructed: true },
      tavern: { id: 'tavern', plotSlotId: 'plot_4', level: 0, isConstructed: false },
      barracks: { id: 'barracks', plotSlotId: 'plot_5', level: 0, isConstructed: false },
      farm: { id: 'farm', plotSlotId: 'plot_6', level: 1, isConstructed: true },
      alchemy: { id: 'alchemy', plotSlotId: 'plot_7', level: 0, isConstructed: false },
      pet_house: { id: 'pet_house', plotSlotId: 'plot_8', level: 0, isConstructed: false },
    },
    npcs: {
      npc_elder_aldric: { id: 'npc_elder_aldric', isUnlocked: true, affinity: 10, dialogueHistory: [] },
      npc_blacksmith_goran: { id: 'npc_blacksmith_goran', isUnlocked: true, affinity: 5, dialogueHistory: [] },
      npc_merchant_lyanna: { id: 'npc_merchant_lyanna', isUnlocked: true, affinity: 5, dialogueHistory: [] },
      npc_captain_valerius: { id: 'npc_captain_valerius', isUnlocked: false, affinity: 0, dialogueHistory: [] },
      npc_alchemist_zara: { id: 'npc_alchemist_zara', isUnlocked: false, affinity: 0, dialogueHistory: [] },
      npc_innkeeper_milo: { id: 'npc_innkeeper_milo', isUnlocked: false, affinity: 0, dialogueHistory: [] },
    },
    unlockedPlotCount: 6,
    unlockedTitles: ['Pioneer Lord'],
    flags: {},
    lastHarvestTimestamp: Date.now(),
  };

  private constructor() {
    this.reapplySettlementModifiers();

    // Auto-unlock settlement when reaching Rank C or via adventure event
    events.on('ascension:rankUp', (data: any) => {
      if (data?.rankIndex >= 2 && !this.state.isOwned) {
        this.unlockSettlement('Haven of Ascendants');
      }
    });

    events.on('reincarnate:complete', () => {
      this.resetForSamsara();
    });
  }

  public static getInstance(): SettlementSystem {
    if (!SettlementSystem.instance) {
      SettlementSystem.instance = new SettlementSystem();
    }
    return SettlementSystem.instance;
  }

  public isSettlementOwned(): boolean {
    return this.state.isOwned;
  }

  public unlockSettlement(name: string = 'Mountain Haven'): boolean {
    if (this.state.isOwned) return false;

    this.state.isOwned = true;
    this.state.settlementName = name;
    this.recalculateRatings();
    this.reapplySettlementModifiers();

    events.emit('toast:show', {
      message: t('toast.settlement.claimed', { name }),
      type: 'epic',
    });

    events.emit('settlement:unlocked' as any, { name });
    analytics.trackEvent('settlement_unlocked', { name });
    return true;
  }

  public getState(): SettlementSaveState {
    return { ...this.state };
  }

  public getMaterials(): { wood: number; stone: number; iron: number } {
    return {
      wood: this.state.wood,
      stone: this.state.stone,
      iron: this.state.iron,
    };
  }

  public addMaterials(wood: number, stone: number, iron: number): void {
    this.state.wood = Math.max(0, this.state.wood + wood);
    this.state.stone = Math.max(0, this.state.stone + stone);
    this.state.iron = Math.max(0, this.state.iron + iron);
  }

  public getBuildingState(buildingId: SettlementBuildingId): SettlementBuildingState | undefined {
    return this.state.buildings[buildingId];
  }

  public getSettlementLevel(): number {
    return this.state.isOwned ? this.state.settlementLevel : 0;
  }

  public getBuildings(): Record<SettlementBuildingId, SettlementBuildingState> {
    return { ...this.state.buildings };
  }

  public setLastHarvestTimestamp(ts: number): void {
    this.state.lastHarvestTimestamp = ts;
  }

  public setSettlementLevel(level: number): void {
    this.state.settlementLevel = level;
    this.state.unlockedPlotCount = Math.min(8, 5 + level);
  }

  public canConstructOrUpgrade(buildingId: SettlementBuildingId): {
    canUpgrade: boolean;
    cost: { gold: number; wood: number; stone: number; iron: number };
    reason?: string;
  } {
    const def = getSettlementBuildingDef(buildingId);
    const bState = this.state.buildings[buildingId];
    if (!def || !bState) return { canUpgrade: false, cost: { gold: 0, wood: 0, stone: 0, iron: 0 }, reason: 'Invalid building' };

    if (bState.level >= def.maxLevel) {
      return { canUpgrade: false, cost: { gold: 0, wood: 0, stone: 0, iron: 0 }, reason: 'Max level reached' };
    }

    if (this.state.settlementLevel < def.unlockedAtSettlementLevel) {
      return { canUpgrade: false, cost: { gold: 0, wood: 0, stone: 0, iron: 0 }, reason: `Requires Settlement Level ${def.unlockedAtSettlementLevel}` };
    }

    const cost = calculateBuildingUpgradeCost(def, bState.level);
    const currentGold = store.get().gold;

    if (currentGold < cost.gold) return { canUpgrade: false, cost, reason: 'Insufficient Gold' };
    if (this.state.wood < cost.wood) return { canUpgrade: false, cost, reason: 'Insufficient Wood' };
    if (this.state.stone < cost.stone) return { canUpgrade: false, cost, reason: 'Insufficient Stone' };
    if (this.state.iron < cost.iron) return { canUpgrade: false, cost, reason: 'Insufficient Iron' };

    return { canUpgrade: true, cost };
  }

  public upgradeBuilding(buildingId: SettlementBuildingId): boolean {
    const check = this.canConstructOrUpgrade(buildingId);
    if (!check.canUpgrade) {
      console.warn(`[SettlementSystem] Upgrade blocked: ${check.reason}`);
      return false;
    }

    const cost = check.cost;
    const bState = this.state.buildings[buildingId];
    const def = getSettlementBuildingDef(buildingId)!;

    // Deduct Gold and Materials
    store.set((draft) => {
      draft.gold -= cost.gold;
    });
    this.state.wood -= cost.wood;
    this.state.stone -= cost.stone;
    this.state.iron -= cost.iron;

    bState.level += 1;
    bState.isConstructed = true;

    // Unlock linked NPC if constructed for the first time
    if (def.linkedNPCId && this.state.npcs[def.linkedNPCId]) {
      this.state.npcs[def.linkedNPCId].isUnlocked = true;
    }

    // If upgrading Throne Hall, advance settlement level
    if (buildingId === 'throne_hall' && bState.level > this.state.settlementLevel) {
      this.state.settlementLevel = bState.level;
      this.state.unlockedPlotCount = Math.min(8, 5 + this.state.settlementLevel);
    }

    this.recalculateRatings();
    this.reapplySettlementModifiers();

    events.emit('toast:show', {
      message: t('settlement.construction_complete', { name: t(def.nameKey), level: bState.level }),
      type: 'success',
    });

    events.emit('settlement:building_upgraded' as any, { buildingId, level: bState.level });
    analytics.trackEvent('settlement_building_upgraded', { buildingId, level: bState.level });
    return true;
  }

  public harvestProduction(): { wood: number; stone: number; iron: number; minutes: number } {
    const now = Date.now();
    const elapsedMinutes = Math.min(120, Math.floor((now - this.state.lastHarvestTimestamp) / 60000));
    if (elapsedMinutes <= 0) return { wood: 0, stone: 0, iron: 0, minutes: 0 };

    const farmLevel = this.state.buildings.farm?.isConstructed ? this.state.buildings.farm.level : 0;
    const woodGain = Math.floor(elapsedMinutes * (2 + farmLevel * 1.5));
    const stoneGain = Math.floor(elapsedMinutes * (1.5 + farmLevel * 1.0));
    const ironGain = Math.floor(elapsedMinutes * (0.5 + farmLevel * 0.5));

    this.state.wood += woodGain;
    this.state.stone += stoneGain;
    this.state.iron += ironGain;
    this.state.lastHarvestTimestamp = now;

    events.emit('settlement:harvested' as any, { woodGain, stoneGain, ironGain, minutes: elapsedMinutes });
    return { wood: woodGain, stone: stoneGain, iron: ironGain, minutes: elapsedMinutes };
  }

  public interactWithNPC(npcId: SettlementNPCId): {
    line: string;
    affinityGained: number;
    serviceAction?: string;
  } {
    const def = getSettlementNPCDef(npcId);
    const npc = this.state.npcs[npcId];
    if (!def || !npc || !npc.isUnlocked) {
      return { line: t('settlement.npc.away'), affinityGained: 0 };
    }

    const karmaBand = karmaSystem.getKarmaBand();
    const karmaKey: 'virtuous' | 'infamous' | 'neutral' =
      karmaBand === 'virtuous' || karmaBand === 'infamous' ? karmaBand : 'neutral';
    const speechKey = def.karmaDialogueKeys[karmaKey] || def.dialogues[0]?.textKey;
    const fallbackSpeech = def.karmaDialogueVariants[karmaKey] || def.dialogues[0]?.text || '';
    const speech = speechKey ? t(speechKey) : fallbackSpeech;

    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const lastTimestamp = npc.lastAffinityGrantTimestamp || 0;

    // Reset daily counter if a day has passed
    if (now - lastTimestamp > oneDayMs) {
      npc.dailyAffinityGrantCount = 0;
    }

    let affinityGained = 0;
    const currentCount = npc.dailyAffinityGrantCount || 0;
    if (currentCount < 3) {
      affinityGained = 2;
      npc.affinity = Math.min(100, npc.affinity + affinityGained);
      npc.dailyAffinityGrantCount = currentCount + 1;
      npc.lastAffinityGrantTimestamp = now;
    }

    if (!npc.dialogueHistory.includes(speech)) {
      npc.dialogueHistory.push(speech);
    }

    const serviceAction = def.dialogues[0]?.serviceAction;

    events.emit('settlement:npc_interacted' as any, { npcId, affinity: npc.affinity, affinityGained });
    analytics.trackEvent('settlement_npc_interacted', { npcId, affinity: npc.affinity });

    return {
      line: speech,
      affinityGained,
      serviceAction,
    };
  }

  public recalculateRatings(): void {
    let defTotal = 10;
    let prospTotal = 15;

    for (const [bId, bState] of Object.entries(this.state.buildings)) {
      if (bState.isConstructed) {
        prospTotal += bState.level * 10;
        if (bId === 'barracks') defTotal += bState.level * 25;
        if (bId === 'throne_hall') defTotal += bState.level * 15;
      }
    }

    this.state.defenseRating = defTotal;
    this.state.prosperityRating = prospTotal;
  }

  public reapplySettlementModifiers(): void {
    modifierResolver.clearBySourceType('settlement' as any);

    if (!this.state.isOwned) return;

    for (const [bId, bState] of Object.entries(this.state.buildings)) {
      if (!bState.isConstructed || bState.level <= 0) continue;
      const def = getSettlementBuildingDef(bId as SettlementBuildingId);
      if (!def) continue;

      for (const mod of def.modifiers) {
        modifierResolver.registerModifier({
          id: `settlement_${mod.id}`,
          target: mod.target,
          type: mod.type,
          value: mod.valuePerLevel * bState.level,
          source: `Settlement: ${def.defaultName} Lv.${bState.level}`,
          sourceType: 'settlement' as any,
        });
      }
    }
  }

  public resetForSamsara(): void {
    // Samsara Persistence Rule:
    // Retains ownership & unlocked buildings, grants Samsara prestige material grant
    if (this.state.isOwned) {
      this.state.wood = Math.max(150, Math.floor(this.state.wood * 0.5));
      this.state.stone = Math.max(120, Math.floor(this.state.stone * 0.5));
      this.state.iron = Math.max(50, Math.floor(this.state.iron * 0.5));
      this.reapplySettlementModifiers();
    }
  }

  public resetAll(): void {
    this.state = {
      isOwned: false,
      settlementName: 'Mountain Haven',
      settlementLevel: 1,
      wood: 100,
      stone: 80,
      iron: 30,
      defenseRating: 10,
      prosperityRating: 15,
      buildings: {
        throne_hall: { id: 'throne_hall', plotSlotId: 'plot_1', level: 1, isConstructed: true },
        forge: { id: 'forge', plotSlotId: 'plot_2', level: 1, isConstructed: true },
        market: { id: 'market', plotSlotId: 'plot_3', level: 1, isConstructed: true },
        tavern: { id: 'tavern', plotSlotId: 'plot_4', level: 0, isConstructed: false },
        barracks: { id: 'barracks', plotSlotId: 'plot_5', level: 0, isConstructed: false },
        farm: { id: 'farm', plotSlotId: 'plot_6', level: 1, isConstructed: true },
        alchemy: { id: 'alchemy', plotSlotId: 'plot_7', level: 0, isConstructed: false },
        pet_house: { id: 'pet_house', plotSlotId: 'plot_8', level: 0, isConstructed: false },
      },
      npcs: {
        npc_elder_aldric: { id: 'npc_elder_aldric', isUnlocked: true, affinity: 10, dialogueHistory: [] },
        npc_blacksmith_goran: { id: 'npc_blacksmith_goran', isUnlocked: true, affinity: 5, dialogueHistory: [] },
        npc_merchant_lyanna: { id: 'npc_merchant_lyanna', isUnlocked: true, affinity: 5, dialogueHistory: [] },
        npc_captain_valerius: { id: 'npc_captain_valerius', isUnlocked: false, affinity: 0, dialogueHistory: [] },
        npc_alchemist_zara: { id: 'npc_alchemist_zara', isUnlocked: false, affinity: 0, dialogueHistory: [] },
        npc_innkeeper_milo: { id: 'npc_innkeeper_milo', isUnlocked: false, affinity: 0, dialogueHistory: [] },
      },
      unlockedPlotCount: 6,
      unlockedTitles: ['Pioneer Lord'],
      flags: {},
      lastHarvestTimestamp: Date.now(),
    };
    this.reapplySettlementModifiers();
  }

  public serialize(): SettlementSaveState {
    return { ...this.state };
  }

  public deserialize(data?: Partial<SettlementSaveState>): void {
    if (!data) return;
    this.state = {
      ...this.state,
      ...data,
      buildings: { ...this.state.buildings, ...(data.buildings || {}) },
      npcs: { ...this.state.npcs, ...(data.npcs || {}) },
    };
    this.recalculateRatings();
    this.reapplySettlementModifiers();
  }
}

export const settlementSystem = SettlementSystem.getInstance();
