import { store, GearSlot, GearItem } from '../../core/FantasyState';
import { GearEngine } from '../../engine/GearEngine';
import { BigNumber } from '../../core/BigNumber';

export class GearView {
  private container: HTMLElement;
  private selectedItem: GearItem | null = null;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'fantasy-tab-screen';

    this.render();
  }

  public getElement(): HTMLElement {
    return this.container;
  }

  public update(): void {
    this.render();
  }

  private render(): void {
    const s = store.get();
    const equipped = s.gear.equipped;

    this.container.innerHTML = `
      <!-- Equipped Gear Section -->
      <div class="fantasy-card gold-trim">
        <h3 style="font-size:14px; color:var(--f-gold-bright); margin-bottom:var(--f-space-sm); border-bottom:1px solid var(--f-border-subtle); padding-bottom:4px;">
          EQUIPPED GEAR
        </h3>
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px;">
          ${this.renderEquippedSlot('weapon', '🗡️ Weapon', equipped.weapon)}
          ${this.renderEquippedSlot('armor', '🛡️ Armor', equipped.armor)}
          ${this.renderEquippedSlot('ring', '💍 Ring', equipped.ring)}
        </div>
      </div>

      <!-- Inventory Section -->
      <div class="fantasy-card" style="flex:1; display:flex; flex-direction:column;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; border-bottom:1px solid var(--f-border-subtle); padding-bottom:4px;">
          <h3 style="font-size:14px; color:var(--f-gold-bright);">
            INVENTORY (${s.gear.inventory.length} / 24)
          </h3>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(64px, 1fr)); gap:6px; overflow-y:auto; max-height:220px; padding:4px;">
          ${s.gear.inventory.map((item) => {
            const isSelected = this.selectedItem && this.selectedItem.id === item.id;
            const rarityColor = `var(--f-rarity-${item.rarity})`;
            return `
              <div class="inventory-item-tile" data-id="${item.id}" style="height:64px; background:var(--f-bg-darker); border:1px solid ${isSelected ? 'var(--f-gold-bright)' : 'var(--f-border-subtle)'}; border-left:3px solid ${rarityColor}; border-radius:var(--f-radius-sm); display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer; position:relative;">
                <span style="font-size:20px;">${item.icon}</span>
                <span style="font-size:9px; color:var(--f-text-dim); margin-top:2px; text-align:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:58px;">${item.name}</span>
              </div>
            `;
          }).join('')}
          ${Array.from({ length: Math.max(0, 12 - s.gear.inventory.length) }).map(() => `
            <div style="height:64px; background:rgba(0,0,0,0.2); border:1px dashed var(--f-border-subtle); border-radius:var(--f-radius-sm);"></div>
          `).join('')}
        </div>
      </div>

      <!-- Item Inspection Details Card -->
      <div id="item-details-card" class="fantasy-card" style="min-height:120px; display:${this.selectedItem ? 'block' : 'none'};">
        ${this.renderDetailsCard()}
      </div>
    `;

    // Bind equipped slot clicks
    this.container.querySelectorAll('.equipped-slot-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const slot = btn.getAttribute('data-slot') as GearSlot;
        if (equipped[slot]) {
          this.selectedItem = equipped[slot];
          this.render();
        }
      });
    });

    // Bind inventory tile clicks
    this.container.querySelectorAll('.inventory-item-tile').forEach((tile) => {
      tile.addEventListener('click', () => {
        const id = tile.getAttribute('data-id');
        const item = s.gear.inventory.find((i) => i.id === id);
        if (item) {
          this.selectedItem = item;
          this.render();
        }
      });
    });

    // Bind Equip & Sell buttons
    const equipBtn = this.container.querySelector('#btn-item-equip');
    if (equipBtn) {
      equipBtn.addEventListener('click', () => {
        if (this.selectedItem) {
          GearEngine.equipItem(this.selectedItem.id);
          this.selectedItem = null;
          this.render();
        }
      });
    }

    const sellBtn = this.container.querySelector('#btn-item-sell');
    if (sellBtn) {
      sellBtn.addEventListener('click', () => {
        if (this.selectedItem) {
          GearEngine.sellItem(this.selectedItem.id);
          this.selectedItem = null;
          this.render();
        }
      });
    }

    const unequipBtn = this.container.querySelector('#btn-item-unequip');
    if (unequipBtn) {
      unequipBtn.addEventListener('click', () => {
        if (this.selectedItem) {
          GearEngine.unequipItem(this.selectedItem.slot);
          this.selectedItem = null;
          this.render();
        }
      });
    }
  }

  private renderEquippedSlot(slot: GearSlot, label: string, item: GearItem | null): string {
    const rarityColor = item ? `var(--f-rarity-${item.rarity})` : 'var(--f-border-subtle)';
    return `
      <div class="equipped-slot-btn" data-slot="${slot}" style="background:var(--f-bg-darker); border:1px solid ${rarityColor}; border-radius:var(--f-radius-sm); padding:8px; display:flex; flex-direction:column; align-items:center; cursor:pointer;">
        <span style="font-size:10px; color:var(--f-text-dim); text-transform:uppercase;">${label}</span>
        <span style="font-size:24px; margin:4px 0;">${item ? item.icon : '▫️'}</span>
        <span style="font-size:11px; font-weight:700; color:${item ? rarityColor : 'var(--f-text-muted)'}; text-align:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:100%;">
          ${item ? item.name : 'Empty'}
        </span>
      </div>
    `;
  }

  private renderDetailsCard(): string {
    if (!this.selectedItem) return '';
    const item = this.selectedItem;
    const s = store.get();
    const isEquipped = Object.values(s.gear.equipped).some((i) => i && i.id === item.id);
    const rarityColor = `var(--f-rarity-${item.rarity})`;

    const statsList: string[] = [];
    if (item.stats.damagePct) statsList.push(`+${Math.round(item.stats.damagePct * 100)}% All Damage`);
    if (item.stats.clickDamagePct) statsList.push(`+${Math.round(item.stats.clickDamagePct * 100)}% Click Damage`);
    if (item.stats.attackSpeedPct) statsList.push(`+${Math.round(item.stats.attackSpeedPct * 100)}% Attack Speed`);
    if (item.stats.critChance) statsList.push(`+${Math.round(item.stats.critChance * 100)}% Crit Chance`);
    if (item.stats.goldFindPct) statsList.push(`+${Math.round(item.stats.goldFindPct * 100)}% Gold Find`);
    if (item.stats.bossDamagePct) statsList.push(`+${Math.round(item.stats.bossDamagePct * 100)}% Boss Damage`);

    return `
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div>
          <h4 style="font-size:14px; color:${rarityColor}; font-weight:800;">${item.name}</h4>
          <div style="font-size:11px; color:var(--f-text-dim); text-transform:capitalize;">
            ${item.rarity} ${item.slot} (Item Lv.${item.level})
          </div>
        </div>
        <div style="font-size:11px; color:var(--f-gold-bright); font-weight:700;">
          Value: ${BigNumber.format(item.value)} Gold
        </div>
      </div>
      <div style="margin:8px 0; font-size:12px; color:var(--f-text-main); display:flex; flex-direction:column; gap:2px;">
        ${statsList.map((st) => `<div style="color:#60a5fa;">• ${st}</div>`).join('')}
      </div>
      <div style="display:flex; gap:8px; margin-top:8px;">
        ${isEquipped 
          ? `<button id="btn-item-unequip" class="attack-btn" style="flex:1; padding:8px 0; font-size:12px; background:#475569; border-color:#94a3b8;">UNEQUIP</button>`
          : `<button id="btn-item-equip" class="attack-btn" style="flex:1; padding:8px 0; font-size:12px;">EQUIP</button>
             <button id="btn-item-sell" style="background:#7f1d1d; border:1px solid #dc2626; color:#fff; border-radius:4px; padding:0 14px; font-weight:700; font-size:12px; cursor:pointer;">SELL</button>`
        }
      </div>
    `;
  }
}
