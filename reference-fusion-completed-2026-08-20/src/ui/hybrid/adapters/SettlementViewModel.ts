import { settlementSystem } from '../../../systems/SettlementSystem';
import { SettlementBuildingId } from '../../../core/settlement/SettlementTypes';
import { SETTLEMENT_BUILDINGS, calculateBuildingUpgradeCost } from '../../../content/settlementCatalog';
import { BigNumber } from '../../../core/BigNumber';

export interface SettlementBuildingDisplay {
  id: SettlementBuildingId;
  name: string;
  level: number;
  maxLevel: number;
  isConstructed: boolean;
  tierName: string;
  effectDescription: string;
  goldCost: number;
  woodCost: number;
  stoneCost: number;
  ironCost: number;
  canAfford: boolean;
  isMaxed: boolean;
}

export class SettlementViewModel {
  public static getBuildings(): SettlementBuildingDisplay[] {
    const state = settlementSystem.getState();
    const buildingIds: SettlementBuildingId[] = [
      'throne_hall',
      'forge',
      'market',
      'tavern',
      'barracks',
      'farm',
      'alchemy',
      'pet_house',
    ];

    return buildingIds.map((bId) => {
      const bState = state.buildings[bId];
      const def = SETTLEMENT_BUILDINGS[bId];
      const level = bState?.level || 0;
      const isConstructed = bState?.isConstructed || false;
      const isMaxed = level >= def.maxLevel;

      const costs = calculateBuildingUpgradeCost(def, level);
      const canAfford =
        state.wood >= costs.wood &&
        state.stone >= costs.stone &&
        state.iron >= costs.iron;

      return {
        id: bId,
        name: def.defaultName,
        level,
        maxLevel: def.maxLevel,
        isConstructed,
        tierName: `Tier ${Math.max(1, Math.ceil(level / 2))}`,
        effectDescription: def.defaultDesc,
        goldCost: costs.gold,
        woodCost: costs.wood,
        stoneCost: costs.stone,
        ironCost: costs.iron,
        canAfford: canAfford && !isMaxed,
        isMaxed,
      };
    });
  }

  public static getResources() {
    const state = settlementSystem.getState();
    return {
      name: state.settlementName,
      level: state.settlementLevel,
      wood: state.wood,
      formattedWood: BigNumber.format(state.wood),
      stone: state.stone,
      formattedStone: BigNumber.format(state.stone),
      iron: state.iron,
      formattedIron: BigNumber.format(state.iron),
      defense: state.defenseRating,
      prosperity: state.prosperityRating,
    };
  }

  public static upgradeBuilding(buildingId: SettlementBuildingId): boolean {
    return settlementSystem.upgradeBuilding(buildingId);
  }
}
