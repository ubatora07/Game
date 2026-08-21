import { store, GearSlot, GearItem } from '../core/FantasyState';

export class GearEngine {
  public static equipItem(itemId: string): boolean {
    let success = false;
    store.set((s) => {
      const idx = s.gear.inventory.findIndex((i) => i.id === itemId);
      if (idx === -1) return;

      const itemToEquip = s.gear.inventory[idx];
      const currentEquipped = s.gear.equipped[itemToEquip.slot];

      // Remove from inventory
      s.gear.inventory.splice(idx, 1);

      // If already has equipped item in this slot, return it to inventory
      if (currentEquipped) {
        s.gear.inventory.push(currentEquipped);
      }

      // Equip
      s.gear.equipped[itemToEquip.slot] = itemToEquip;
      success = true;
    });
    return success;
  }

  public static unequipItem(slot: GearSlot): boolean {
    let success = false;
    store.set((s) => {
      const currentEquipped = s.gear.equipped[slot];
      if (!currentEquipped) return;
      if (s.gear.inventory.length >= 24) return; // Inventory full

      s.gear.inventory.push(currentEquipped);
      s.gear.equipped[slot] = null;
      success = true;
    });
    return success;
  }

  public static sellItem(itemId: string): number {
    let earnedGold = 0;
    store.set((s) => {
      const idx = s.gear.inventory.findIndex((i) => i.id === itemId);
      if (idx === -1) return;

      const item = s.gear.inventory[idx];
      earnedGold = item.value || 25;
      s.currencies.gold += earnedGold;
      s.gear.inventory.splice(idx, 1);
    });
    return earnedGold;
  }

  public static addItem(item: GearItem): boolean {
    let added = false;
    store.set((s) => {
      if (s.gear.inventory.length < 24) {
        s.gear.inventory.push(item);
        added = true;
      }
    });
    return added;
  }
}
