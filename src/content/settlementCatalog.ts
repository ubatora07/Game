import { SettlementBuildingDefinition, SettlementBuildingId } from '../core/settlement/SettlementTypes';

export const SETTLEMENT_BUILDINGS: Record<SettlementBuildingId, SettlementBuildingDefinition> = {
  throne_hall: {
    id: 'throne_hall',
    nameKey: 'settlement.building.throne_hall.name',
    descKey: 'settlement.building.throne_hall.desc',
    defaultName: 'Stronghold Great Hall',
    defaultDesc: 'The seat of your domain. Governs taxes, unlocks building plots, and anchors prosperity.',
    plotSlotId: 'plot_1',
    maxLevel: 10,
    baseGoldCost: 5000,
    baseWoodCost: 50,
    baseStoneCost: 40,
    baseIronCost: 10,
    costMultiplier: 1.6,
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 10h6M9 14h6M9 18h6"/></svg>`,
    unlockedAtSettlementLevel: 1,
    linkedNPCId: 'npc_elder_aldric',
    modifiers: [
      { id: 'throne_gold', target: 'goldMultiplier', type: 'percent_add', valuePerLevel: 0.10 },
      { id: 'throne_power', target: 'powerMultiplier', type: 'percent_add', valuePerLevel: 0.08 },
    ],
    functionalityDescription: 'Increases Settlement Tier and raises Global Gold & Power multipliers.',
  },

  forge: {
    id: 'forge',
    nameKey: 'settlement.building.forge.name',
    descKey: 'settlement.building.forge.desc',
    defaultName: 'Master Blacksmith Forge',
    defaultDesc: 'High-temperature bellows and anvil for forging legendary weapons and armor.',
    plotSlotId: 'plot_2',
    maxLevel: 10,
    baseGoldCost: 3500,
    baseWoodCost: 40,
    baseStoneCost: 60,
    baseIronCost: 25,
    costMultiplier: 1.5,
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
    unlockedAtSettlementLevel: 1,
    linkedNPCId: 'npc_blacksmith_goran',
    modifiers: [
      { id: 'forge_atk', target: 'attack', type: 'percent_add', valuePerLevel: 0.08 },
      { id: 'forge_boss', target: 'bossDamage', type: 'percent_add', valuePerLevel: 0.06 },
    ],
    functionalityDescription: 'Unlocks Equipment Crafting, Weapon Enhancement, and Refinement loops.',
  },

  market: {
    id: 'market',
    nameKey: 'settlement.building.market.name',
    descKey: 'settlement.building.market.desc',
    defaultName: 'Caravan Grand Bazaar',
    defaultDesc: 'Open-air trade district where wandering merchants exchange rare materials and relics.',
    plotSlotId: 'plot_3',
    maxLevel: 10,
    baseGoldCost: 4000,
    baseWoodCost: 60,
    baseStoneCost: 30,
    baseIronCost: 15,
    costMultiplier: 1.45,
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"/></svg>`,
    unlockedAtSettlementLevel: 1,
    linkedNPCId: 'npc_merchant_lyanna',
    modifiers: [
      { id: 'market_loot', target: 'lootChance', type: 'percent_add', valuePerLevel: 0.05 },
      { id: 'market_gold', target: 'goldMultiplier', type: 'percent_add', valuePerLevel: 0.06 },
    ],
    functionalityDescription: 'Unlocks Material Trading, Currency Conversion, and Rare LiveOps stock.',
  },

  tavern: {
    id: 'tavern',
    nameKey: 'settlement.building.tavern.name',
    descKey: 'settlement.building.tavern.desc',
    defaultName: 'The Prancing Gryphon Tavern',
    defaultDesc: 'Cozy hearth where traveling mercenaries, bards, and bounty hunters gather.',
    plotSlotId: 'plot_4',
    maxLevel: 10,
    baseGoldCost: 4500,
    baseWoodCost: 70,
    baseStoneCost: 40,
    baseIronCost: 10,
    costMultiplier: 1.5,
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M17 11h1a3 3 0 0 1 0 6h-1M5 5h12v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5zM9 1v4M13 1v4"/></svg>`,
    unlockedAtSettlementLevel: 2,
    linkedNPCId: 'npc_innkeeper_milo',
    modifiers: [
      { id: 'tavern_crit_dmg', target: 'critDamage', type: 'percent_add', valuePerLevel: 0.08 },
    ],
    functionalityDescription: 'Unlocks Mercenary Hiring, Rumor Quests, and Karma-reactive NPC stories.',
  },

  barracks: {
    id: 'barracks',
    nameKey: 'settlement.building.barracks.name',
    descKey: 'settlement.building.barracks.desc',
    defaultName: 'Town Guard Barracks',
    defaultDesc: 'Fortified garrison and training yard ensuring peace and repelling monster incursions.',
    plotSlotId: 'plot_5',
    maxLevel: 10,
    baseGoldCost: 6000,
    baseWoodCost: 50,
    baseStoneCost: 80,
    baseIronCost: 35,
    costMultiplier: 1.55,
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    unlockedAtSettlementLevel: 2,
    linkedNPCId: 'npc_captain_valerius',
    modifiers: [
      { id: 'barracks_def', target: 'settlementDefense', type: 'percent_add', valuePerLevel: 0.15 },
      { id: 'barracks_elite', target: 'eliteDamage', type: 'percent_add', valuePerLevel: 0.08 },
    ],
    functionalityDescription: 'Provides Settlement Defense Rating and unlocks Garrison Defense Missions.',
  },

  farm: {
    id: 'farm',
    nameKey: 'settlement.building.farm.name',
    descKey: 'settlement.building.farm.desc',
    defaultName: 'Windmill & Harvest Fields',
    defaultDesc: 'Flourishing crops and timber yards generating persistent settlement resources.',
    plotSlotId: 'plot_6',
    maxLevel: 10,
    baseGoldCost: 3000,
    baseWoodCost: 30,
    baseStoneCost: 30,
    baseIronCost: 5,
    costMultiplier: 1.4,
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#a3e635" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
    unlockedAtSettlementLevel: 1,
    modifiers: [
      { id: 'farm_gold', target: 'goldMultiplier', type: 'percent_add', valuePerLevel: 0.05 },
    ],
    functionalityDescription: 'Passively produces Wood (+2/min), Stone (+1.5/min), and Iron (+0.5/min) per level.',
  },

  alchemy: {
    id: 'alchemy',
    nameKey: 'settlement.building.alchemy.name',
    descKey: 'settlement.building.alchemy.desc',
    defaultName: 'Apothecary & Herbal Lab',
    defaultDesc: 'Distills arcane reagents, battle elixirs, and temporary combat enhancement vials.',
    plotSlotId: 'plot_7',
    maxLevel: 10,
    baseGoldCost: 5500,
    baseWoodCost: 45,
    baseStoneCost: 55,
    baseIronCost: 20,
    costMultiplier: 1.5,
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2"><path d="M10 2v7.31L4.62 17.5A2 2 0 0 0 6.38 20.5h11.24a2 2 0 0 0 1.76-3L14 9.31V2"/></svg>`,
    unlockedAtSettlementLevel: 3,
    linkedNPCId: 'npc_alchemist_zara',
    modifiers: [
      { id: 'alchemy_crit', target: 'critChance', type: 'percent_add', valuePerLevel: 0.03 },
    ],
    functionalityDescription: 'Enables Potion Brewing, Combat Elixir synthesis, and buff duration scaling.',
  },

  pet_house: {
    id: 'pet_house',
    nameKey: 'settlement.building.pet_house.name',
    descKey: 'settlement.building.pet_house.desc',
    defaultName: 'Beast Companion Sanctuary',
    defaultDesc: 'Spacious elemental paddocks and nesting nests accelerating pet evolution and happiness.',
    plotSlotId: 'plot_8',
    maxLevel: 10,
    baseGoldCost: 5000,
    baseWoodCost: 50,
    baseStoneCost: 40,
    baseIronCost: 15,
    costMultiplier: 1.45,
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#fb923c" stroke-width="2"><path d="M10 5.172a2 2 0 0 0-3.414 0L3.707 8.05A2 2 0 0 0 3 9.464V19a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9.464a2 2 0 0 0-.707-1.414L17.414 5.172A2 2 0 0 0 14 5.172z"/></svg>`,
    unlockedAtSettlementLevel: 2,
    modifiers: [
      { id: 'pet_house_dmg', target: 'petDamage', type: 'percent_add', valuePerLevel: 0.10 },
    ],
    functionalityDescription: 'Boosts Pet Experience gains by +20% per level and unlocks Pet Sanctuary tasks.',
  },
};

export function getSettlementBuildingDef(id: SettlementBuildingId): SettlementBuildingDefinition | undefined {
  return SETTLEMENT_BUILDINGS[id];
}

export function getAllSettlementBuildingDefs(): SettlementBuildingDefinition[] {
  return Object.values(SETTLEMENT_BUILDINGS);
}

export function calculateBuildingUpgradeCost(
  def: SettlementBuildingDefinition,
  currentLevel: number
): { gold: number; wood: number; stone: number; iron: number } {
  const mult = Math.pow(def.costMultiplier, currentLevel);
  return {
    gold: Math.floor(def.baseGoldCost * mult),
    wood: Math.floor(def.baseWoodCost * mult),
    stone: Math.floor(def.baseStoneCost * mult),
    iron: Math.floor(def.baseIronCost * mult),
  };
}
