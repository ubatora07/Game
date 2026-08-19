import { store } from '../../core/GameState';
import { getRelicById } from '../../content/relics';
import { RelicSystem } from '../../systems/RelicSystem';
import { t } from '../../services/i18n/I18nService';

export class RelicsScreen {
  private el: HTMLElement;
  private unsubscribe: () => void;
  private lastKey: string = '';

  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'screen-container';
    this.el.style.padding = '16px';
    this.unsubscribe = store.subscribe(() => this.update());
  }

  public getElement(): HTMLElement {
    this.render();
    return this.el;
  }

  public destroy(): void {
    this.unsubscribe();
  }

  private update(): void {
    const state = store.get();
    const key = `${JSON.stringify(state.equippedRelics)}_${JSON.stringify(state.relics)}`;
    if (key !== this.lastKey) {
      this.lastKey = key;
      this.render();
    }
  }

  private render(): void {
    const state = store.get();
    this.el.innerHTML = `
      <h1 style="margin-bottom: var(--space-24); color: var(--color-gold); text-align: center;">🏺 ${t('nav.relics')}</h1>
      
      <div style="background: var(--bg-card); padding: var(--space-16); border-radius: var(--radius-lg); margin-bottom: var(--space-24);">
        <h2 style="margin-bottom: var(--space-16); font-size: 16px;">${t('relics.equipped')}</h2>
        <div style="display: flex; gap: var(--space-16); justify-content: center;">
          ${state.equippedRelics.map((rId, i) => this.renderSlot(rId, i)).join('')}
        </div>
      </div>

      <div style="background: var(--bg-card); padding: var(--space-16); border-radius: var(--radius-lg);">
        <h2 style="margin-bottom: var(--space-16); font-size: 16px;">${t('relics.inventory')}</h2>
        ${Object.keys(state.relics).length === 0 ? 
          `<div class="empty-state">${t('relics.empty')}</div>` :
          `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: var(--space-12);">
             ${Object.keys(state.relics).map(id => this.renderInventoryItem(id)).join('')}
           </div>`
        }
      </div>
    `;

    // Bind equip/unequip events
    this.el.querySelectorAll('.unequip-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const slot = parseInt((e.currentTarget as HTMLElement).dataset.slot!);
        RelicSystem.unequipRelic(slot);
      });
    });

    this.el.querySelectorAll('.equip-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.id!;
        // Find first empty slot
        const emptySlot = state.equippedRelics.findIndex(s => !s);
        if (emptySlot !== -1) {
          RelicSystem.equipRelic(id, emptySlot);
        } else {
          // If full, replace first slot for now (simple UX)
          RelicSystem.equipRelic(id, 0);
        }
      });
    });
  }

  private renderSlot(relicId: string | null, index: number): string {
    if (!relicId) {
      return `
        <div style="width: 80px; height: 80px; border: 2px dashed var(--border-subtle); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; color: var(--text-muted);">
          Slot ${index + 1}
        </div>
      `;
    }
    const def = getRelicById(relicId);
    if (!def) return '';
    const state = store.get().relics[relicId];

    return `
      <div style="width: 80px; height: 80px; background: var(--bg-surface-raised); border: 1px solid var(--border-highlight); border-radius: var(--radius-md); display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative;">
        <span style="font-size: 24px;">${def.icon}</span>
        <span style="font-size: 10px; color: var(--text-gold); font-weight: bold; margin-top: var(--space-04);">${t('common.level_short', { level: state.level })}</span>
        <button class="unequip-btn" data-slot="${index}" style="position: absolute; top: -8px; right: -8px; background: var(--color-crimson); color: white; width: 24px; height: 24px; border-radius: 50%; font-size: 12px; font-weight: bold; border: 1px solid white;">X</button>
      </div>
    `;
  }

  private renderInventoryItem(relicId: string): string {
    const def = getRelicById(relicId);
    if (!def) return '';
    const state = store.get().relics[relicId];
    const isEquipped = store.get().equippedRelics.includes(relicId);

    return `
      <div style="background: var(--bg-surface-raised); border: 1px solid ${isEquipped ? 'var(--color-cyan)' : 'var(--border-subtle)'}; border-radius: var(--radius-md); padding: var(--space-12); text-align: center; display: flex; flex-direction: column; align-items: center;">
        <span style="font-size: 32px; margin-bottom: var(--space-08);">${def.icon}</span>
        <span style="font-size: 12px; font-weight: bold; margin-bottom: var(--space-04); line-height: 1.2;">${t(def.nameKey)}</span>
        <span style="font-size: 10px; color: var(--text-gold); margin-bottom: var(--space-12);">${t('common.level_range', { current: state.level, max: def.maxLevel })}</span>
        
        <div style="font-size: 9px; color: var(--text-muted); margin-bottom: var(--space-12);">
          ${t('relics.dupes', { current: state.duplicates, needed: state.level * 2 })}
        </div>

        <button class="equip-btn" data-id="${relicId}" ${isEquipped ? 'disabled' : ''} style="background: ${isEquipped ? 'var(--bg-core)' : 'var(--color-cyan)'}; color: ${isEquipped ? 'var(--text-muted)' : '#000'}; padding: var(--space-06) var(--space-16); border-radius: var(--radius-full); font-size: 12px; font-weight: bold; transition: opacity 0.2s;">
          ${isEquipped ? t('relics.equipped_short') : t('relics.equip')}
        </button>
      </div>
    `;
  }
}
