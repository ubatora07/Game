import { SettlementViewModel } from '../adapters/SettlementViewModel';
import { SettlementBuildingId } from '../../../core/settlement/SettlementTypes';

export class HybridSettlementScreen {
  private container: HTMLElement;

  constructor() {
    this.container = document.createElement('div');
    this.container.style.cssText = 'display:flex; flex-direction:column; height:100%; box-sizing:border-box; padding:var(--space-16); gap:var(--space-16); overflow-y:auto;';

    this.render();
  }

  public getElement(): HTMLElement {
    return this.container;
  }

  public update(): void {
    this.render();
  }

  private render(): void {
    this.container.innerHTML = '';
    const res = SettlementViewModel.getResources();
    const buildings = SettlementViewModel.getBuildings();

    // 1. Town Resources Header
    const headerPanel = document.createElement('div');
    headerPanel.className = 'hybrid-panel';
    headerPanel.style.cssText = 'display:flex; flex-direction:row; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:var(--space-12); padding:var(--space-12) var(--space-16);';

    headerPanel.innerHTML = `
      <div>
        <div style="font-size:16px; font-weight:800; color:var(--hybrid-gold);">🏰 ${res.name} (Town Lv ${res.level})</div>
        <div style="font-size:11px; color:var(--hybrid-text-dim);">Defense: ${res.defense} · Prosperity: ${res.prosperity}</div>
      </div>
      <div style="display:flex; gap:var(--space-12);">
        <div class="hybrid-currency-chip"><span>🪵</span> <span>${res.formattedWood} Wood</span></div>
        <div class="hybrid-currency-chip"><span>🪨</span> <span>${res.formattedStone} Stone</span></div>
        <div class="hybrid-currency-chip"><span>⛓️</span> <span>${res.formattedIron} Iron</span></div>
      </div>
    `;
    this.container.appendChild(headerPanel);

    // 2. Building Grid
    const grid = document.createElement('div');
    grid.className = 'hybrid-town-grid';

    buildings.forEach((b) => {
      const card = document.createElement('div');
      card.className = 'hybrid-building-card';

      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-06);">
          <span style="font-size:15px; font-weight:700; color:var(--hybrid-text-main);">${b.name}</span>
          <span style="font-size:11px; font-weight:700; color:var(--hybrid-gold); background:rgba(245,158,11,0.15); padding:var(--space-02) var(--space-06); border-radius:var(--radius-04);">
            Lv ${b.level} / ${b.maxLevel}
          </span>
        </div>

        <div style="font-size:11px; color:var(--hybrid-accent); font-weight:600; margin-bottom:var(--space-08);">${b.tierName}</div>
        <div style="font-size:12px; color:#cbd5e1; line-height:1.4; margin-bottom:var(--space-12); min-height:36px;">${b.effectDescription}</div>

        <div style="font-size:11px; color:var(--hybrid-text-dim); margin-top:auto; padding-top:var(--space-08); border-top:1px solid rgba(255,255,255,0.05);">
          ${
            b.isMaxed
              ? '<span style="color:var(--hybrid-gold); font-weight:700;">★ MAX LEVEL</span>'
              : `<span>Upgrade Cost: 🪵 ${b.woodCost} · 🪨 ${b.stoneCost} · ⛓️ ${b.ironCost}</span>`
          }
        </div>

        <button class="upgrade-building-btn" data-id="${b.id}" style="
          margin-top:var(--space-10);
          padding:var(--space-08);
          background:${b.isMaxed ? '#334155' : b.canAfford ? 'var(--hybrid-accent)' : '#1e293b'};
          color:${b.canAfford && !b.isMaxed ? '#ffffff' : '#64748b'};
          border:1px solid var(--hybrid-border);
          border-radius:var(--radius-06);
          font-weight:700;
          font-size:12px;
          cursor:${b.canAfford && !b.isMaxed ? 'pointer' : 'not-allowed'};
        " ${!b.canAfford || b.isMaxed ? 'disabled' : ''}>
          ${b.isMaxed ? 'Max Level Reached' : b.level === 0 ? '🔨 Construct Building' : '⬆️ Upgrade Building'}
        </button>
      `;

      card.querySelector('.upgrade-building-btn')?.addEventListener('click', () => {
        if (b.canAfford && !b.isMaxed) {
          SettlementViewModel.upgradeBuilding(b.id as SettlementBuildingId);
          this.render();
        }
      });

      grid.appendChild(card);
    });

    this.container.appendChild(grid);
  }
}
