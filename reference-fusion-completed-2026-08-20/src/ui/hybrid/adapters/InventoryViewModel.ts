import { craftingEquipmentSystem } from '../../../systems/CraftingEquipmentSystem';
import { EquipmentItem, EquipmentSlot, CraftingMaterialId } from '../../../core/crafting/CraftingTypes';
import { CRAFTING_MATERIALS } from '../../../content/craftingMaterialsCatalog';

export type InventoryTabFilter = 'all' | 'weapon' | 'armor' | 'accessory' | 'materials';

export interface InventoryItemDisplay {
  id: string;
  name: string;
  category: 'equipment' | 'material';
  slot?: EquipmentSlot;
  rarity: string;
  tier?: number;
  level?: number;
  quantity: number;
  isEquipped: boolean;
  statsDescription: string;
  rawEquipment?: EquipmentItem;
}

export class InventoryViewModel {
  public static getItems(filter: InventoryTabFilter = 'all'): InventoryItemDisplay[] {
    const inventory = craftingEquipmentSystem.getInventory();
    const equippedWeapon = craftingEquipmentSystem.getEquippedItem('char_1', 'weapon');
    const equippedArmor = craftingEquipmentSystem.getEquippedItem('char_1', 'armor');
    const equippedAccessory = craftingEquipmentSystem.getEquippedItem('char_1', 'accessory');

    const equippedIds = new Set<string>();
    if (equippedWeapon) equippedIds.add(equippedWeapon.id);
    if (equippedArmor) equippedIds.add(equippedArmor.id);
    if (equippedAccessory) equippedIds.add(equippedAccessory.id);

    const list: InventoryItemDisplay[] = [];

    // 1. Equipment items
    inventory.forEach((item) => {
      if (filter !== 'all' && filter !== 'materials' && item.slot !== filter) {
        return;
      }
      if (filter === 'materials') return;

      const statParts: string[] = [];
      if (item.baseStats.attack) statParts.push(`ATK +${item.baseStats.attack}`);
      if (item.baseStats.defense) statParts.push(`DEF +${item.baseStats.defense}`);
      if (item.baseStats.hp) statParts.push(`HP +${item.baseStats.hp}`);
      if (item.baseStats.critChance) statParts.push(`CRIT +${item.baseStats.critChance}%`);

      list.push({
        id: item.id,
        name: item.name,
        category: 'equipment',
        slot: item.slot,
        rarity: item.rarity,
        tier: item.evolutionStage,
        level: item.level,
        quantity: 1,
        isEquipped: equippedIds.has(item.id),
        statsDescription: statParts.join(' · ') || 'No base stats',
        rawEquipment: item,
      });
    });

    // 2. Crafting materials
    if (filter === 'all' || filter === 'materials') {
      const materials = craftingEquipmentSystem.getMaterials();
      Object.entries(materials).forEach(([matId, qty]) => {
        if (qty <= 0) return;
        const matDef = CRAFTING_MATERIALS[matId as CraftingMaterialId];
        list.push({
          id: matId,
          name: matDef ? matDef.defaultName : matId,
          category: 'material',
          rarity: matDef ? matDef.rarity : 'common',
          quantity: qty,
          isEquipped: false,
          statsDescription: matDef ? matDef.defaultDesc : 'Crafting resource',
        });
      });
    }

    return list;
  }

  public static equip(itemId: string): boolean {
    return craftingEquipmentSystem.equipItem(itemId, 'char_1');
  }

  public static unequip(slot: EquipmentSlot): boolean {
    return craftingEquipmentSystem.unequipItem('char_1', slot);
  }
}
