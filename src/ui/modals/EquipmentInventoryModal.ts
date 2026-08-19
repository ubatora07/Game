import { ModalInstance, modalManager } from '../components/ModalManager';
import { craftingEquipmentSystem } from '../../systems/CraftingEquipmentSystem';
import { EquipmentSlot } from '../../core/crafting/CraftingTypes';

export const EquipmentInventoryModal: ModalInstance = {
  id: 'equipment_inventory_modal',
  render: () => {
    let activeCharSlot: 'char_1' | 'char_2' = 'char_1';
    let currentSlotFilter: EquipmentSlot | 'all' = 'all';
    let selectedItemId: string | null = null;

    const el = document.createElement('div');
    el.className = 'equipment-inventory-modal-container pixel-fantasy-modal';
    el.style.cssText = 'max-width:580px; padding:16px; background:radial-gradient(ellipse at 50% 15%, #1c1917 0%, #0c0a09 100%); border:2px solid #d97706; border-radius:6px; box-shadow:0 0 35px rgba(0,0,0,0.9), inset 0 0 20px rgba(217,119,6,0.15);';

    const refresh = () => {
      const inventory = craftingEquipmentSystem.getInventory(
        currentSlotFilter === 'all' ? undefined : currentSlotFilter
      );

      const equippedWeapon = craftingEquipmentSystem.getEquippedItem(activeCharSlot, 'weapon');
      const equippedArmor = craftingEquipmentSystem.getEquippedItem(activeCharSlot, 'armor');
      const equippedAccessory = craftingEquipmentSystem.getEquippedItem(activeCharSlot, 'accessory');

      const selectedItem = selectedItemId ? craftingEquipmentSystem.getItemById(selectedItemId) : (inventory[0] || null);
      if (selectedItem) selectedItemId = selectedItem.id;

      // Find comparison item (what's currently equipped in that same slot for this character)
      const comparedItem = selectedItem ? craftingEquipmentSystem.getEquippedItem(activeCharSlot, selectedItem.slot) : undefined;
      const isCurrentlyEquipped = selectedItem && selectedItem.equippedCharacterSlot === activeCharSlot;

      el.innerHTML = `
        <!-- Header & Character Selector -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1.5px solid #78350f; padding-bottom:8px; flex-wrap:wrap; gap:8px;">
          <div>
            <div style="font-size:9px; color:#f59e0b; font-weight:bold; letter-spacing:0.5px; font-family:var(--font-display);">
              ✦ SOVEREIGN ARMORY & INVENTORY ✦
            </div>
            <h3 style="font-family:var(--font-display); font-size:17px; color:#fef08a; margin:1px 0 0 0;">
              Hero Equipment Loadout
            </h3>
          </div>

          <!-- Character Tab Switcher -->
          <div style="display:flex; gap:6px;">
            <button class="btn-char-slot" data-slot="char_1" style="padding:4px 10px; font-size:11px; font-weight:bold; font-family:var(--font-display); background:${activeCharSlot === 'char_1' ? '#d97706' : 'rgba(0,0,0,0.5)'}; border:1px solid #f59e0b; border-radius:3px; color:#ffffff; cursor:pointer;">
              Protagonist
            </button>
            <button class="btn-char-slot" data-slot="char_2" style="padding:4px 10px; font-size:11px; font-weight:bold; font-family:var(--font-display); background:${activeCharSlot === 'char_2' ? '#d97706' : 'rgba(0,0,0,0.5)'}; border:1px solid #f59e0b; border-radius:3px; color:#ffffff; cursor:pointer;">
              Partner
            </button>
          </div>
        </div>

        <!-- Currently Equipped 3 Slots Strip -->
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; margin-bottom:12px; background:rgba(0,0,0,0.4); padding:8px; border-radius:4px; border:1px solid #78350f;">
          <!-- Weapon Slot -->
          <div class="equipped-slot-card" data-slot="weapon" style="background:rgba(28,25,23,0.9); border:1px solid ${equippedWeapon ? '#38bdf8' : '#451a03'}; border-radius:4px; padding:6px; display:flex; align-items:center; gap:6px; cursor:pointer;">
            <div style="width:28px; height:28px; border-radius:3px; background:#0c0a09; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
              ${equippedWeapon ? equippedWeapon.iconSvg : '<span style="font-size:12px; color:#64748b;">⚔️</span>'}
            </div>
            <div style="overflow:hidden;">
              <div style="font-size:8px; color:#94a3b8; text-transform:uppercase;">WEAPON</div>
              <div style="font-size:10px; font-weight:bold; color:${equippedWeapon ? '#fef08a' : '#64748b'}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                ${equippedWeapon ? equippedWeapon.name : 'Empty Slot'}
              </div>
            </div>
          </div>

          <!-- Armor Slot -->
          <div class="equipped-slot-card" data-slot="armor" style="background:rgba(28,25,23,0.9); border:1px solid ${equippedArmor ? '#38bdf8' : '#451a03'}; border-radius:4px; padding:6px; display:flex; align-items:center; gap:6px; cursor:pointer;">
            <div style="width:28px; height:28px; border-radius:3px; background:#0c0a09; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
              ${equippedArmor ? equippedArmor.iconSvg : '<span style="font-size:12px; color:#64748b;">🛡️</span>'}
            </div>
            <div style="overflow:hidden;">
              <div style="font-size:8px; color:#94a3b8; text-transform:uppercase;">ARMOR</div>
              <div style="font-size:10px; font-weight:bold; color:${equippedArmor ? '#fef08a' : '#64748b'}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                ${equippedArmor ? equippedArmor.name : 'Empty Slot'}
              </div>
            </div>
          </div>

          <!-- Accessory Slot -->
          <div class="equipped-slot-card" data-slot="accessory" style="background:rgba(28,25,23,0.9); border:1px solid ${equippedAccessory ? '#38bdf8' : '#451a03'}; border-radius:4px; padding:6px; display:flex; align-items:center; gap:6px; cursor:pointer;">
            <div style="width:28px; height:28px; border-radius:3px; background:#0c0a09; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
              ${equippedAccessory ? equippedAccessory.iconSvg : '<span style="font-size:12px; color:#64748b;">💍</span>'}
            </div>
            <div style="overflow:hidden;">
              <div style="font-size:8px; color:#94a3b8; text-transform:uppercase;">ACCESSORY</div>
              <div style="font-size:10px; font-weight:bold; color:${equippedAccessory ? '#fef08a' : '#64748b'}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                ${equippedAccessory ? equippedAccessory.name : 'Empty Slot'}
              </div>
            </div>
          </div>
        </div>

        <!-- Filter Buttons -->
        <div style="display:flex; gap:4px; margin-bottom:10px;">
          ${(['all', 'weapon', 'armor', 'accessory'] as const)
            .map(
              (f) => `
            <button class="btn-slot-filter" data-filter="${f}" style="padding:4px 8px; font-size:10px; font-weight:bold; font-family:var(--font-display); background:${currentSlotFilter === f ? '#b45309' : 'rgba(0,0,0,0.5)'}; border:1px solid #78350f; border-radius:3px; color:#ffffff; cursor:pointer;">
              ${f.toUpperCase()}
            </button>
          `
            )
            .join('')}
        </div>

        <!-- Inventory List (Left) + Item Inspection & Comparison (Right) -->
        <div style="display:grid; grid-template-columns: 1fr 1.1fr; gap:10px; margin-bottom:12px;">
          <!-- Inventory Grid -->
          <div style="display:flex; flex-direction:column; gap:6px; max-height:220px; overflow-y:auto; padding-right:4px;">
            ${
              inventory.length > 0
                ? inventory
                    .map((item) => {
                      const isSel = item.id === selectedItemId;
                      const isEquippedThis = item.equippedCharacterSlot === activeCharSlot;
                      const isEquippedOther = item.equippedCharacterSlot && !isEquippedThis;
                      return `
                  <div class="inventory-item-card" data-item-id="${item.id}" style="background:${isSel ? 'rgba(217,119,6,0.25)' : 'rgba(12,10,9,0.7)'}; border:1.5px solid ${isSel ? '#f59e0b' : '#78350f'}; border-radius:4px; padding:6px 8px; cursor:pointer; display:flex; align-items:center; justify-content:space-between; transition:all 0.15s ease;">
                    <div style="display:flex; align-items:center; gap:6px; overflow:hidden;">
                      <div style="width:24px; height:24px; flex-shrink:0;">${item.iconSvg}</div>
                      <div style="overflow:hidden;">
                        <div style="font-size:10px; font-weight:bold; color:#fef08a; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.name}</div>
                        <div style="font-size:8px; color:#38bdf8;">Stage ${item.evolutionStage} • ${item.rarity.toUpperCase()}</div>
                      </div>
                    </div>
                    ${
                      isEquippedThis
                        ? '<span style="font-size:8px; background:#10b981; color:#000; padding:1px 4px; border-radius:2px; font-weight:bold;">EQUIPPED</span>'
                        : isEquippedOther
                        ? '<span style="font-size:8px; background:#64748b; color:#fff; padding:1px 4px; border-radius:2px;">ON PARTNER</span>'
                        : ''
                    }
                  </div>
                `;
                    })
                    .join('')
                : '<div style="color:#94a3b8; font-size:11px; text-align:center; padding:20px;">No items in this category. Visit the Forge to craft equipment!</div>'
            }
          </div>

          <!-- Comparison & Inspection Drawer -->
          ${
            selectedItem
              ? `
            <div style="background:rgba(28,25,23,0.9); border:1.5px solid #b45309; border-radius:4px; padding:10px; display:flex; flex-direction:column; justify-content:space-between;">
              <div>
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                  <div style="width:34px; height:34px; border-radius:4px; background:#0c0a09; border:1px solid #f59e0b; display:flex; align-items:center; justify-content:center;">
                    ${selectedItem.iconSvg}
                  </div>
                  <div>
                    <div style="font-size:12px; font-weight:bold; color:#fef08a; font-family:var(--font-display);">${selectedItem.name}</div>
                    <div style="font-size:9px; color:#38bdf8;">STAGE ${selectedItem.evolutionStage}/${selectedItem.maxEvolutionStage} • ${selectedItem.rarity.toUpperCase()}</div>
                  </div>
                </div>

                <!-- Stats & Comparison Delta -->
                <div style="font-size:10px; color:#cbd5e1; margin-bottom:8px; line-height:1.4;">
                  ${(() => {
                    const selAtk = selectedItem.baseStats.attack || 0;
                    const compAtk = comparedItem?.baseStats.attack || 0;
                    const deltaAtk = selAtk - compAtk;
                    return selAtk
                      ? `<div>⚔️ Attack: <b style="color:#fde047;">+${selAtk}</b> ${!isCurrentlyEquipped && comparedItem ? `<span style="color:${deltaAtk >= 0 ? '#34d399' : '#f43f5e'}; font-weight:bold;">(${deltaAtk >= 0 ? '+' : ''}${deltaAtk} Δ)</span>` : ''}</div>`
                      : '';
                  })()}

                  ${(() => {
                    const selDef = selectedItem.baseStats.defense || 0;
                    const compDef = comparedItem?.baseStats.defense || 0;
                    const deltaDef = selDef - compDef;
                    return selDef
                      ? `<div>🛡️ Defense: <b style="color:#38bdf8;">+${selDef}</b> ${!isCurrentlyEquipped && comparedItem ? `<span style="color:${deltaDef >= 0 ? '#34d399' : '#f43f5e'}; font-weight:bold;">(${deltaDef >= 0 ? '+' : ''}${deltaDef} Δ)</span>` : ''}</div>`
                      : '';
                  })()}

                  ${selectedItem.baseStats.speed ? `<div>⚡ Speed: <b style="color:#34d399;">+${Math.round(selectedItem.baseStats.speed * 100)}%</b></div>` : ''}
                  ${selectedItem.baseStats.critChance ? `<div>💥 Crit: <b style="color:#f472b6;">+${Math.round(selectedItem.baseStats.critChance * 100)}%</b></div>` : ''}

                  <!-- Affixes List -->
                  ${selectedItem.affixes
                    .map(
                      (a) => `
                    <div style="color:#34d399; font-weight:bold;">✦ ${a.label}</div>
                  `
                    )
                    .join('')}
                </div>
              </div>

              <!-- Action Buttons -->
              <div style="display:flex; gap:6px;">
                ${
                  isCurrentlyEquipped
                    ? `
                  <button id="btn-unequip-item" style="flex:1; padding:6px; background:#451a03; border:1px solid #78350f; border-radius:4px; color:#ffffff; font-family:var(--font-display); font-weight:bold; font-size:11px; cursor:pointer;">
                    UNEQUIP
                  </button>
                `
                    : `
                  <button id="btn-equip-item" style="flex:1; padding:6px; background:linear-gradient(135deg, #10b981, #059669); border:1px solid #34d399; border-radius:4px; color:#ffffff; font-family:var(--font-display); font-weight:bold; font-size:11px; cursor:pointer; box-shadow:0 0 10px rgba(16,185,129,0.4);">
                    EQUIP
                  </button>
                `
                }
                ${
                  selectedItem.evolutionStage < selectedItem.maxEvolutionStage
                    ? `
                  <button id="btn-open-evolution" style="flex:1; padding:6px; background:linear-gradient(135deg, #d97706, #b45309); border:1px solid #f59e0b; border-radius:4px; color:#ffffff; font-family:var(--font-display); font-weight:bold; font-size:11px; cursor:pointer; box-shadow:0 0 10px rgba(217,119,6,0.4);">
                    ⚡ EVOLVE
                  </button>
                `
                    : ''
                }
              </div>
            </div>
          `
              : '<div style="color:#94a3b8; font-size:11px;">Select an item to inspect.</div>'
          }
        </div>

        <button id="btn-close-inventory" style="width:100%; padding:8px; background:#1c1917; border:1px solid #78350f; border-radius:4px; color:#cbd5e1; font-family:var(--font-display); font-size:12px; cursor:pointer;">
          Close Armory
        </button>
      `;

      // Event listeners
      el.querySelectorAll('.btn-char-slot').forEach((btn) => {
        btn.addEventListener('click', () => {
          activeCharSlot = btn.getAttribute('data-slot') as any;
          refresh();
        });
      });

      el.querySelectorAll('.btn-slot-filter').forEach((btn) => {
        btn.addEventListener('click', () => {
          currentSlotFilter = btn.getAttribute('data-filter') as any;
          refresh();
        });
      });

      el.querySelectorAll('.inventory-item-card').forEach((card) => {
        card.addEventListener('click', () => {
          selectedItemId = card.getAttribute('data-item-id');
          refresh();
        });
      });

      el.querySelector('#btn-equip-item')?.addEventListener('click', () => {
        if (selectedItemId) {
          craftingEquipmentSystem.equipItem(selectedItemId, activeCharSlot);
          refresh();
        }
      });

      el.querySelector('#btn-unequip-item')?.addEventListener('click', () => {
        if (selectedItem) {
          craftingEquipmentSystem.unequipItem(activeCharSlot, selectedItem.slot);
          refresh();
        }
      });

      el.querySelector('#btn-open-evolution')?.addEventListener('click', () => {
        if (selectedItemId) {
          modalManager.open('equipment_evolution_modal', { itemId: selectedItemId });
        }
      });

      el.querySelector('#btn-close-inventory')?.addEventListener('click', () => {
        modalManager.close('equipment_inventory_modal');
      });
    };

    refresh();
    return el;
  },
};
