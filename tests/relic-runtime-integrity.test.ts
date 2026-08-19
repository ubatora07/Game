import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createInitialState, store } from '../src/core/GameState';
import { EconomyEngine } from '../src/economy/EconomyEngine';
import { getRankById } from '../src/content/ranks';
import { QuestSystem } from '../src/systems/QuestSystem';
import { RelicSystem } from '../src/systems/RelicSystem';
import { TrainingSystem } from '../src/systems/TrainingSystem';
import { RebirthRequirements } from '../src/systems/rebirth/RebirthRequirements';

function ownAndEquip(relicId: string, slot = 0): void {
  RelicSystem.grantRelic(relicId);
  RelicSystem.equipRelic(relicId, slot);
}

describe('Relic runtime integrity', () => {
  beforeEach(() => {
    store.replace(createInitialState());
    vi.restoreAllMocks();
  });

  it('Karmic Hourglass changes the authoritative Rebirth reward preview', () => {
    const sRank = getRankById('S');
    store.set((draft) => {
      draft.rankId = sRank.id;
      draft.rankIndex = sRank.index;
      draft.stats.lifetimePower = sRank.reqPower * 10;
      draft.towerFloor = 25;
    });
    const base = RebirthRequirements.evaluate(store.get()).potentialSouls;
    ownAndEquip('karmic_hourglass');
    const boosted = RebirthRequirements.evaluate(store.get()).potentialSouls;
    expect(boosted).toBe(Math.floor(base * 1.05));
  });

  it('Dragon Scale can turn manual training into a 5x normal critical burst', () => {
    ownAndEquip('dragon_scale');
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = TrainingSystem.train();
    expect(result.isBurstCrit).toBe(true);
    expect(result.isCrit).toBe(true);
    expect(result.powerGained).toBe(25);
  });

  it('Harmonic Chime amplifies existing synergy-upgrade contribution', () => {
    store.set((draft) => {
      draft.buildings.meditation_chamber = 1;
      draft.buildings.warrior_academy = 10;
      draft.upgrades.spirit_education = 1;
    });
    const base = EconomyEngine.calculateMetrics(store.get()).buildingDetails.meditation_chamber.upgradeMultiplier;
    ownAndEquip('harmonic_chime');
    const boosted = EconomyEngine.calculateMetrics(store.get()).buildingDetails.meditation_chamber.upgradeMultiplier;
    expect(base).toBeCloseTo(1.3);
    expect(boosted).toBeCloseTo(1.33);
  });

  it("Merchant's Abacus adds one minute of current passive gold when its roll succeeds", () => {
    store.set((draft) => {
      draft.buildings.dojo = 10;
      draft.stats.campaignEnemiesDefeated = 5;
      draft.gold = 0;
    });
    ownAndEquip('merchants_abacus');
    const passiveGold = EconomyEngine.calculateMetrics(store.get()).passiveGoldPerSec;
    vi.spyOn(Math, 'random').mockReturnValue(0);
    expect(QuestSystem.claimQuest('quest_campaign_kill_5')).toBe(true);
    expect(store.get().gold).toBe(25 + Math.floor(passiveGold * 60));
  });

  it('Ethereal Hammer increases offline efficiency using its existing 1% value', () => {
    const base = EconomyEngine.calculateMetrics(store.get()).offlineEfficiency;
    ownAndEquip('ethereal_hammer');
    const boosted = EconomyEngine.calculateMetrics(store.get()).offlineEfficiency;
    expect(boosted).toBeCloseTo(base + 0.01);
  });
});
