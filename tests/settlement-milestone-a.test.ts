import { describe, it, expect, beforeEach } from 'vitest';
import { settlementSystem } from '../src/systems/SettlementSystem';
import { SETTLEMENT_BUILDINGS, getAllSettlementBuildingDefs, calculateBuildingUpgradeCost } from '../src/content/settlementCatalog';
import { SETTLEMENT_NPCS, getAllSettlementNPCDefs } from '../src/content/settlementNPCs';
import { SettlementVisualRenderer } from '../src/ui/art/SettlementVisualRenderer';
import { modifierResolver } from '../src/core/modifiers/ModifierResolver';
import { store, createInitialState } from '../src/core/GameState';
import { karmaSystem } from '../src/systems/KarmaSystem';

describe('Milestone A — Phases 96–98: Settlement Domain Model, Buildings, and NPCs Suite', () => {
  beforeEach(() => {
    store.replace(createInitialState());
    karmaSystem.resetAll();
    settlementSystem.resetAll();
  });

  /* --------------------------------------------------------------------- */
  /* PHASE 96: SETTLEMENT DOMAIN MODEL                                      */
  /* --------------------------------------------------------------------- */
  it('P96-01: Settlement domain model is distinct from Sect and has separate state lifecycle', () => {
    const sState = settlementSystem.getState();
    expect(sState.isOwned).toBe(false);
    expect(sState.settlementLevel).toBe(1);
    expect(sState.wood).toBeGreaterThanOrEqual(100);
    expect(sState.stone).toBeGreaterThanOrEqual(80);
    expect(sState.iron).toBeGreaterThanOrEqual(30);
    expect(sState.buildings.throne_hall).toBeDefined();
    expect(sState.npcs.npc_elder_aldric).toBeDefined();
  });

  it('P96-02: Unlocking settlement activates domain ownership, ratings, and modifiers', () => {
    expect(settlementSystem.isSettlementOwned()).toBe(false);
    const unlocked = settlementSystem.unlockSettlement('Elysian Citadel');
    expect(unlocked).toBe(true);
    expect(settlementSystem.isSettlementOwned()).toBe(true);
    expect(settlementSystem.getState().settlementName).toBe('Elysian Citadel');

    // Modifiers should now be registered in ModifierResolver
    const goldMod = modifierResolver.resolve('goldMultiplier', 1.0);
    expect(goldMod).toBeGreaterThan(1.0); // Throne hall + Farm
  });

  it('P96-03: Samsara reincarnation preserves settlement ownership and unlocked buildings', () => {
    settlementSystem.unlockSettlement('Elysian Citadel');
    settlementSystem.addMaterials(500, 400, 200);

    // Trigger Samsara reset
    settlementSystem.resetForSamsara();

    const stateAfter = settlementSystem.getState();
    expect(stateAfter.isOwned).toBe(true);
    expect(stateAfter.settlementName).toBe('Elysian Citadel');
    expect(stateAfter.wood).toBeGreaterThanOrEqual(150);
    expect(stateAfter.stone).toBeGreaterThanOrEqual(120);
    expect(stateAfter.iron).toBeGreaterThanOrEqual(50);
    expect(stateAfter.buildings.throne_hall.isConstructed).toBe(true);
  });

  it('P96-04: Serialization and deserialization maintain full domain fidelity', () => {
    settlementSystem.unlockSettlement('Valhalla Outpost');
    settlementSystem.addMaterials(50, 60, 70);

    const serialized = settlementSystem.serialize();
    expect(serialized.settlementName).toBe('Valhalla Outpost');
    expect(serialized.wood).toBe(150);

    settlementSystem.resetAll();
    expect(settlementSystem.isSettlementOwned()).toBe(false);

    settlementSystem.deserialize(serialized);
    expect(settlementSystem.isSettlementOwned()).toBe(true);
    expect(settlementSystem.getState().settlementName).toBe('Valhalla Outpost');
    expect(settlementSystem.getState().wood).toBe(150);
  });

  /* --------------------------------------------------------------------- */
  /* PHASE 97: FIRST SETTLEMENT BUILDINGS & VISUALS                         */
  /* --------------------------------------------------------------------- */
  it('P97-01: Building construction and upgrades validate multi-resource costs', () => {
    settlementSystem.unlockSettlement('Mountain Haven');

    // Give sufficient gold and materials
    store.set((draft) => {
      draft.gold = 50000;
    });
    settlementSystem.addMaterials(200, 200, 100);

    const canUpgradeForge = settlementSystem.canConstructOrUpgrade('forge');
    expect(canUpgradeForge.canUpgrade).toBe(true);
    expect(canUpgradeForge.cost.gold).toBeGreaterThan(0);
    expect(canUpgradeForge.cost.wood).toBeGreaterThan(0);

    const initialLevel = settlementSystem.getBuildingState('forge')!.level;
    const upgraded = settlementSystem.upgradeBuilding('forge');
    expect(upgraded).toBe(true);
    expect(settlementSystem.getBuildingState('forge')!.level).toBe(initialLevel + 1);
  });

  it('P97-02: Building upgrades register modifiers cleanly without duplication', () => {
    settlementSystem.unlockSettlement('Mountain Haven');
    store.set((draft) => {
      draft.gold = 100000;
    });
    settlementSystem.addMaterials(500, 500, 300);

    const initialAtk = modifierResolver.resolve('attack', 100);
    settlementSystem.upgradeBuilding('forge');
    const afterAtk = modifierResolver.resolve('attack', 100);
    expect(afterAtk).toBeGreaterThan(initialAtk);

    // Verify Forge Level 2 modifiers
    const bState = settlementSystem.getBuildingState('forge')!;
    expect(bState.level).toBe(2);
  });

  it('P97-03: Upgrading Throne Hall raises Settlement Level and expands Plot Capacity', () => {
    settlementSystem.unlockSettlement('Mountain Haven');
    store.set((draft) => {
      draft.gold = 100000;
    });
    settlementSystem.addMaterials(500, 500, 300);

    expect(settlementSystem.getState().settlementLevel).toBe(1);
    settlementSystem.upgradeBuilding('throne_hall');
    expect(settlementSystem.getState().settlementLevel).toBe(2);
    expect(settlementSystem.getState().unlockedPlotCount).toBe(7);
  });

  it('P97-04: Farm harvesting produces resources based on elapsed time and farm level', () => {
    settlementSystem.unlockSettlement('Mountain Haven');

    // Fast-forward last harvest timestamp by 10 minutes
    settlementSystem.setLastHarvestTimestamp(Date.now() - 10 * 60 * 1000);

    const beforeMats = settlementSystem.getMaterials();
    const harvest = settlementSystem.harvestProduction();
    expect(harvest.minutes).toBe(10);
    expect(harvest.wood).toBeGreaterThan(0);
    expect(harvest.stone).toBeGreaterThan(0);
    expect(harvest.iron).toBeGreaterThan(0);

    const afterMats = settlementSystem.getMaterials();
    expect(afterMats.wood).toBe(beforeMats.wood + harvest.wood);
  });

  it('P97-05: Visual Renderer generates pixel art structures across all building types and tiers', () => {
    const allDefs = getAllSettlementBuildingDefs();
    expect(allDefs.length).toBe(8);

    for (const def of allDefs) {
      const plotSvg = SettlementVisualRenderer.getBuildingStructureSvg(def.id, 0);
      expect(plotSvg).toContain('PLOT');

      const builtSvg = SettlementVisualRenderer.getBuildingStructureSvg(def.id, 1);
      expect(builtSvg).toContain('viewBox="0 0 64 64"');
      expect(builtSvg).toContain('image-rendering:pixelated');
    }

    const panoramaSvg = SettlementVisualRenderer.getSettlementPanoramaSvg(
      settlementSystem.getState().buildings,
      1
    );
    expect(panoramaSvg).toContain('settlement-panoramic-svg');
  });

  /* --------------------------------------------------------------------- */
  /* PHASE 98: SETTLEMENT NPCs & INTERACTIONS                              */
  /* --------------------------------------------------------------------- */
  it('P98-01: Constructing buildings unlocks their linked resident NPCs', () => {
    settlementSystem.unlockSettlement('Mountain Haven');
    settlementSystem.setSettlementLevel(2);
    store.set((draft) => {
      draft.gold = 50000;
    });
    settlementSystem.addMaterials(200, 200, 100);

    expect(settlementSystem.getState().npcs.npc_captain_valerius.isUnlocked).toBe(false);
    settlementSystem.upgradeBuilding('barracks');
    expect(settlementSystem.getState().npcs.npc_captain_valerius.isUnlocked).toBe(true);
  });

  it('P98-02: Interacting with NPCs scales affinity and reflects Karma alignment', () => {
    settlementSystem.unlockSettlement('Mountain Haven');

    // 1. Virtuous Hero interaction
    karmaSystem.modifyKarma(60, 'event_choice'); // Band -> virtuous
    const virtuousInteraction = settlementSystem.interactWithNPC('npc_elder_aldric');
    expect(virtuousInteraction.line).toContain('Blessings upon your path');
    expect(virtuousInteraction.affinityGained).toBe(2);

    // 2. Infamous Hero interaction
    karmaSystem.resetAll();
    karmaSystem.modifyKarma(-80, 'event_choice'); // Band -> infamous
    const infamousInteraction = settlementSystem.interactWithNPC('npc_elder_aldric');
    expect(infamousInteraction.line).toContain('I know the dread your blade commands');

    // 3. Neutral Hero interaction
    karmaSystem.resetAll(); // Band -> neutral
    const neutralInteraction = settlementSystem.interactWithNPC('npc_elder_aldric');
    expect(neutralInteraction.line).toContain('Greetings, Sovereign');
  });

  it('P98-03: NPC service linkages provide direct access to forge and market', () => {
    settlementSystem.unlockSettlement('Mountain Haven');
    const goran = settlementSystem.interactWithNPC('npc_blacksmith_goran');
    expect(goran.serviceAction).toBe('open_forge');

    const lyanna = settlementSystem.interactWithNPC('npc_merchant_lyanna');
    expect(lyanna.serviceAction).toBe('open_market');
  });
});
