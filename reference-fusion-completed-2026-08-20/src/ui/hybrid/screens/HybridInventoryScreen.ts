import { InventoryViewModel, InventoryTabFilter } from '../adapters/InventoryViewModel';

export class HybridInventoryScreen {
  private container: HTMLElement;
  private currentFilter: InventoryTabFilter = 'all';
  private selectedItemId: string | null = null;
  private gridContainer!: HTMLElement;
  private contextPanel!: HTMLElement;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'hybrid-inventory-container';
    this.container.style.cssText = 'display:flex; height:100%; box-sizing:border-box; padding:var(--space-16); gap:var(--space-16);';

    this.buildDOM();
  }

  public getElement(): HTMLElement {
    return this.container;
  }

  public update(): void {
    this.renderGrid();
    this.renderContextPanel();
  }

  private buildDOM(): void {
    this.container.innerHTML = '';

    // Left main section: Filters + Grid
    const mainSection = document.createElement('div');
    mainSection.className = 'hybrid-panel';
    mainSection.style.cssText = 'flex: 1; display: flex; flex-direction: column; overflow: hidden;';

    // Filters Header
    const filterHeader = document.createElement('div');
    filterHeader.style.cssText = 'display: flex; gap: var(--space-06); margin-bottom: var(--space-12); overflow-x: auto; padding-bottom: var(--space-04);';

    const filterOptions: Array<{ id: InventoryTabFilter; label: string }> = [
      { id: 'all', label: 'All Items' },
      { id: 'weapon', label: 'Weapons' },
      { id: 'armor', label: 'Armor' },
      { id: 'accessory', label: 'Accessories' },
      { id: 'materials', label: 'Materials' },
    ];

    filterOptions.forEach((opt) => {
      const btn = document.createElement('button');
      btn.className = `hybrid-subtab-btn ${this.currentFilter === opt.id ? 'active' : ''}`;
      btn.textContent = opt.label;
      btn.addEventListener('click', () => {
        this.currentFilter = opt.id;
        filterHeader.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderGrid();
      });
      filterHeader.appendChild(btn);
    });

    mainSection.appendChild(filterHeader);

    this.gridContainer = document.createElement('div');
    this.gridContainer.className = 'hybrid-bank-grid';
    this.gridContainer.style.cssText = 'flex: 1; overflow-y: auto;';
    mainSection.appendChild(this.gridContainer);

    this.container.appendChild(mainSection);

    // Right Context Panel
    this.contextPanel = document.createElement('div');
    this.contextPanel.className = 'hybrid-panel hybrid-inventory-context';
    this.contextPanel.style.cssText = 'width: 280px; display: flex; flex-direction: column;';
    this.container.appendChild(this.contextPanel);

    this.renderGrid();
    this.renderContextPanel();
  }

  private renderGrid(): void {
    this.gridContainer.innerHTML = '';
    const items = InventoryViewModel.getItems(this.currentFilter);

    if (items.length === 0) {
      this.gridContainer.innerHTML = '<div style="grid-column:1/-1; padding:var(--space-32); text-align:center; color:var(--hybrid-text-muted);">No items found in this category.</div>';
      return;
    }

    // Auto-select first if none selected
    if (!this.selectedItemId || !items.some((i) => i.id === this.selectedItemId)) {
      this.selectedItemId = items[0].id;
    }

    items.forEach((item) => {
      const el = document.createElement('div');
      el.className = `hybrid-bank-item rarity-${item.rarity.toLowerCase()} ${item.id === this.selectedItemId ? 'selected' : ''}`;

      el.innerHTML = `
        <div style="font-size:20px; margin-bottom:var(--space-04);">${item.category === 'equipment' ? '⚔️' : '📦'}</div>
        <div style="font-size:11px; font-weight:600; color:var(--hybrid-text-main);">${item.name}</div>
        <div style="font-size:10px; color:var(--hybrid-gold); margin-top:var(--space-02);">x${item.quantity}</div>
        ${item.isEquipped ? '<div style="font-size:9px; background:var(--hybrid-green); color:#111; padding:var(--space-01) var(--space-04); border-radius:var(--radius-03); font-weight:700; margin-top:var(--space-04);">EQUIPPED</div>' : ''}
      `;

      el.addEventListener('click', () => {
        this.selectedItemId = item.id;
        this.renderGrid();
        this.renderContextPanel();
      });

      this.gridContainer.appendChild(el);
    });
  }

  private renderContextPanel(): void {
    const items = InventoryViewModel.getItems('all');
    const selected = items.find((i) => i.id === this.selectedItemId);

    if (!selected) {
      this.contextPanel.innerHTML = `
        <div class="hybrid-panel-header"><span>ITEM DETAILS</span></div>
        <div style="padding:var(--space-24) 0; text-align:center; color:var(--hybrid-text-muted);">Select an item from the bank to view stats and actions.</div>
      `;
      return;
    }

    this.contextPanel.innerHTML = `
      <div class="hybrid-panel-header">
        <span>ITEM DETAILS</span>
        <span style="font-size:10px; text-transform:uppercase; color:var(--hybrid-accent);">${selected.rarity}</span>
      </div>

      <div style="font-size:16px; font-weight:700; color:var(--hybrid-text-main); margin-bottom:var(--space-04);">${selected.name}</div>
      <div style="font-size:11px; color:var(--hybrid-text-dim); text-transform:capitalize; margin-bottom:var(--space-12);">Type: ${selected.category}${selected.slot ? ` (${selected.slot})` : ''}</div>

      <div style="background:rgba(0,0,0,0.3); border:1px solid var(--hybrid-border); border-radius:var(--radius-06); padding:var(--space-10); font-size:12px; color:#cbd5e1; line-height:1.5; margin-bottom:var(--space-16);">
        ${selected.statsDescription}
      </div>

      <div style="display:flex; flex-direction:column; gap:var(--space-08); margin-top:auto;">
        ${
          selected.category === 'equipment'
            ? selected.isEquipped
              ? `<button id="unequipBtn" style="padding:var(--space-10); background:#334155; color:#f8fafc; font-weight:700; font-size:12px; border:none; border-radius:var(--radius-06); cursor:pointer;">Unequip</button>`
              : `<button id="equipBtn" style="padding:var(--space-10); background:var(--hybrid-green); color:#111; font-weight:700; font-size:12px; border:none; border-radius:var(--radius-06); cursor:pointer;">Equip Item</button>`
            : ''
        }
      </div>
    `;

    this.contextPanel.querySelector('#equipBtn')?.addEventListener('click', () => {
      InventoryViewModel.equip(selected.id);
      this.update();
    });

    this.contextPanel.querySelector('#unequipBtn')?.addEventListener('click', () => {
      if (selected.slot) {
        InventoryViewModel.unequip(selected.slot);
        this.update();
      }
    });
  }
}
