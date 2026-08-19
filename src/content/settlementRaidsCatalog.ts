import { SettlementRaidDefinition } from '../core/settlement/SettlementDefenseTypes';

export const SETTLEMENT_RAIDS: Record<string, SettlementRaidDefinition> = {
  raid_goblin_scouts: {
    id: 'raid_goblin_scouts',
    nameKey: 'raid.goblin_scouts.name',
    defaultName: 'Goblin Ambush Vanguard',
    threatLevel: 'minor',
    requiredDefense: 30,
    attackerFaction: 'Greenwood Goblins',
    description: 'A band of cunning goblin marauders is probing Mountain Haven’s outer fences looking for easy loot.',
    bannerSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    rewardsOnWin: {
      gold: 1200,
      ironOre: 5,
      karmaDelta: 2,
    },
    penaltyOnLoss: {
      woodCost: 20,
      stoneCost: 10,
      goldCost: 400,
    },
  },

  raid_mountain_bandits: {
    id: 'raid_mountain_bandits',
    nameKey: 'raid.mountain_bandits.name',
    defaultName: 'Ironfang Bandit Siege',
    threatLevel: 'moderate',
    requiredDefense: 80,
    attackerFaction: 'Ironfang Bandits',
    description: 'Armored mountain outlaws armed with battering logs attempt to breach the settlement gates.',
    bannerSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2"/></svg>`,
    rewardsOnWin: {
      gold: 3000,
      ironOre: 12,
      meteoriteOre: 3,
      karmaDelta: 4,
    },
    penaltyOnLoss: {
      woodCost: 50,
      stoneCost: 30,
      goldCost: 1200,
    },
  },

  raid_undead_horde: {
    id: 'raid_undead_horde',
    nameKey: 'raid.undead_horde.name',
    defaultName: 'Bloodmoon Ghoul Horde',
    threatLevel: 'severe',
    requiredDefense: 160,
    attackerFaction: 'Nether Undead',
    description: 'Necrotic abominations claw at the palisades under a crimson eclipse.',
    bannerSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2"><path d="M12 2l4 7-4 13-4-13z"/></svg>`,
    rewardsOnWin: {
      gold: 7500,
      ironOre: 20,
      meteoriteOre: 8,
      karmaDelta: 6,
    },
    penaltyOnLoss: {
      woodCost: 100,
      stoneCost: 80,
      goldCost: 3000,
    },
  },

  raid_dragon_cultists: {
    id: 'raid_dragon_cultists',
    nameKey: 'raid.dragon_cultists.name',
    defaultName: 'Cult of the Wyrm Siege',
    threatLevel: 'boss_siege',
    requiredDefense: 280,
    attackerFaction: 'Sovereign Dragon Cult',
    description: 'Fanatic pyromancers and drakeblood brutes assault the domain with dragonfire siege engines.',
    bannerSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"/></svg>`,
    rewardsOnWin: {
      gold: 18000,
      ironOre: 35,
      meteoriteOre: 15,
      karmaDelta: 10,
    },
    penaltyOnLoss: {
      woodCost: 200,
      stoneCost: 150,
      goldCost: 8000,
    },
  },
};

export function getRaidDefinition(id: string): SettlementRaidDefinition | undefined {
  return SETTLEMENT_RAIDS[id];
}

export function getAllRaidDefinitions(): SettlementRaidDefinition[] {
  return Object.values(SETTLEMENT_RAIDS);
}
