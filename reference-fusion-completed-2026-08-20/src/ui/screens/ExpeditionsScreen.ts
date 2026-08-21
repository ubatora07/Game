import { store } from '../../core/GameState';
import { EXPEDITIONS } from '../../content/expeditions';
import { ExpeditionSystem } from '../../systems/ExpeditionSystem';
import { t } from '../../services/i18n/I18nService';
import { getHeroById } from '../../content/heroes';
import { sound } from '../../services/audio/SoundService';

export class ExpeditionsScreen {
  private el: HTMLElement;
  private unsubscribe: () => void;
  private timer: number;
  private lastKey: string = '';

  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'screen-container';
    this.el.style.padding = '16px';
    this.unsubscribe = store.subscribe(() => this.update());
    
    // Refresh countdowns every second
    this.timer = window.setInterval(() => {
      this.updateTimers();
    }, 1000);
  }

  public getElement(): HTMLElement {
    this.render();
    return this.el;
  }

  public destroy(): void {
    this.unsubscribe();
    clearInterval(this.timer);
  }

  private update(): void {
    const state = store.get();
    const key = JSON.stringify(state.expeditions);
    if (key !== this.lastKey) {
      this.lastKey = key;
      this.render();
    }
  }

  private render(): void {
    const state = store.get();
    
    this.el.innerHTML = `
      <h1 style="margin-bottom: var(--space-24); color: var(--color-cyan); text-align: center;">🗺️ ${t('nav.expeditions')}</h1>
      
      <div style="background: var(--bg-card); padding: var(--space-16); border-radius: var(--radius-lg); margin-bottom: var(--space-24);">
        <h2 style="margin-bottom: var(--space-16); font-size: 16px;">${t('expeditions.active')}</h2>
        ${state.expeditions.length === 0 ? 
          `<div class="empty-state">${t('expeditions.empty_active')}</div>` :
          `<div style="display: flex; flex-direction: column; gap: var(--space-12);">
             ${state.expeditions.map(e => this.renderActive(e)).join('')}
           </div>`
        }
      </div>

      <div style="background: var(--bg-card); padding: var(--space-16); border-radius: var(--radius-lg);">
        <h2 style="margin-bottom: var(--space-16); font-size: 16px;">${t('expeditions.available')}</h2>
        <div style="display: flex; flex-direction: column; gap: var(--space-16);">
          ${EXPEDITIONS.map(exp => this.renderTemplate(exp)).join('')}
        </div>
      </div>
    `;

    // Bind Claims
    this.el.querySelectorAll('.claim-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.id!;
        ExpeditionSystem.claim(id);
        sound.playClaim();
      });
    });

    // Bind Dispatches
    this.el.querySelectorAll('.dispatch-select').forEach(select => {
      select.addEventListener('change', (e) => {
        const target = e.currentTarget as HTMLSelectElement;
        const templateId = target.dataset.template!;
        const heroId = target.value;
        if (heroId) {
          ExpeditionSystem.dispatch(templateId, heroId);
          target.value = ""; // Reset
        }
      });
    });
  }

  private updateTimers(): void {
    const now = Date.now();
    this.el.querySelectorAll('.exp-timer').forEach(el => {
      const start = parseInt((el as HTMLElement).dataset.start!);
      const duration = parseInt((el as HTMLElement).dataset.duration!);
      const end = start + duration;
      
      if (now >= end) {
        el.textContent = t('expeditions.complete');
        el.parentElement!.querySelector('.claim-btn')?.removeAttribute('disabled');
      } else {
        const remaining = Math.ceil((end - now) / 1000);
        const h = Math.floor(remaining / 3600);
        const m = Math.floor((remaining % 3600) / 60);
        const s = remaining % 60;
        el.textContent = `${h}h ${m}m ${s}s`;
      }
    });
  }

  private renderActive(exp: any): string {
    const template = EXPEDITIONS.find(t => t.id === exp.templateId);
    const hero = getHeroById(exp.heroId);
    if (!template || !hero) return '';

    const isComplete = Date.now() >= exp.startedAt + exp.durationMs;

    return `
      <div style="background: var(--bg-surface-raised); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: var(--space-12); display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: var(--space-12);">
          <div style="font-size: 24px;">${t(template.nameKey)}</div>
          <div>
            <div style="font-size: 14px; font-weight: bold;">${t(hero.nameKey)}</div>
            <div class="exp-timer" data-start="${exp.startedAt}" data-duration="${exp.durationMs}" style="font-size: 12px; color: var(--text-cyan);">
              ${isComplete ? t('expeditions.complete') : t('expeditions.calculating')}
            </div>
          </div>
        </div>
        <button class="claim-btn" data-id="${exp.id}" ${isComplete ? '' : 'disabled'} style="background: var(--color-cyan); color: #000; padding: var(--space-08) var(--space-16); border-radius: var(--radius-full); font-weight: bold; cursor: ${isComplete ? 'pointer' : 'not-allowed'}; opacity: ${isComplete ? 1 : 0.5};">
          ${t('btn.claim')}
        </button>
      </div>
    `;
  }

  private renderTemplate(exp: any): string {
    const state = store.get();
    
    // Build hero options
    let heroOptions = `<option value="">${t('expeditions.select_hero')}</option>`;
    Object.keys(state.heroes).forEach(hId => {
      const hDef = getHeroById(hId);
      if (!hDef) return;
      // Skip if busy
      if (state.expeditions.some(e => e.heroId === hId)) return;
      
      // Filter logic
      if (exp.requiredElement && hDef.element !== exp.requiredElement) return;
      
      const rarities: Record<string, number> = { 'common': 1, 'rare': 2, 'epic': 3, 'legendary': 4, 'mythic': 5 };
      if (exp.requiredRarity && (rarities[hDef.rarity] || 0) < (rarities[exp.requiredRarity] || 0)) return;

      heroOptions += `<option value="${hId}">${t(hDef.nameKey)} (${t(`equipment.rarity.${hDef.rarity}`)})</option>`;
    });

    return `
      <div style="background: var(--bg-surface-raised); border: 1px solid var(--border-highlight); border-radius: var(--radius-md); padding: var(--space-16);">
        <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-12);">
          <h3 style="font-size: 16px;">${t(exp.nameKey)}</h3>
          <span style="color: var(--text-muted); font-size: 12px;">⏱️ ${t('expeditions.hours', { hours: exp.durationHours })}</span>
        </div>
        
        <div style="display: flex; gap: var(--space-08); font-size: 12px; color: var(--text-gold); margin-bottom: var(--space-12);">
          <span>${t('expeditions.rewards')}:</span>
          <span>💎 ${exp.rewards.crystals}</span>
          <span>🧪 ${exp.rewards.essence}</span>
          <span>💰 ~${t('expeditions.gold_minutes', { minutes: exp.rewards.goldEquivalentMinutes })}</span>
        </div>

        <div style="font-size: 11px; color: var(--text-dim); margin-bottom: var(--space-12);">
          ${t('expeditions.requires')}: ${exp.requiredElement ? t(`element.${exp.requiredElement}`) : t('expeditions.any_element')} | ${exp.requiredRarity ? t(`equipment.rarity.${exp.requiredRarity}`) : t('expeditions.any_rarity')}
        </div>

        <select class="dispatch-select" data-template="${exp.id}" style="width: 100%; padding: var(--space-08); background: var(--bg-core); color: var(--text-main); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
          ${heroOptions}
        </select>
      </div>
    `;
  }
}
