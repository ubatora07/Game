import { karmaSystem } from '../../systems/KarmaSystem';
import { events } from '../../core/EventBus';
import { t } from '../../services/i18n/I18nService';

export class KarmaAlignmentHUD {
  private container: HTMLElement;
  private unsubscribe?: () => void;

  constructor() {
    if (typeof document !== 'undefined') {
      this.container = document.createElement('div');
      this.container.className = 'karma-alignment-hud';
      this.container.style.cssText = `
        display: flex;
        align-items: center;
        gap: var(--space-08);
        padding: var(--space-04) var(--space-10);
        background: rgba(15, 23, 42, 0.85);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: var(--radius-20);
        font-size: 11px;
        user-select: none;
        box-shadow: var(--shadow-sm);
      `;
      this.render();
      this.bindEvents();
    } else {
      this.container = { className: 'karma-alignment-hud' } as HTMLElement;
    }
  }

  public getElement(): HTMLElement {
    return this.container;
  }

  private bindEvents(): void {
    if (typeof document === 'undefined') return;
    this.unsubscribe = events.on('karma:changed', () => {
      this.render();
    });
  }

  public render(): void {
    if (typeof document === 'undefined' || !this.container) return;
    const score = karmaSystem.getScore();
    const bandInfo = karmaSystem.getKarmaBandInfo();

    // Map score -100..100 to 0%..100% position
    const fillPercent = ((score + 100) / 200) * 100;

    this.container.innerHTML = `
      <div style="display:flex; align-items:center; gap:var(--space-04);">
        <span style="font-size:14px;">${bandInfo.badge}</span>
        <span style="font-weight:bold; color:${bandInfo.color}; text-transform:capitalize;">
          ${t(bandInfo.titleKey)}
        </span>
        <span style="color:#94a3b8; font-size:10px; font-variant-numeric:tabular-nums;">
          (${score > 0 ? '+' : ''}${score})
        </span>
      </div>

      <!-- Karma Range Meter -->
      <div style="position:relative; width:64px; height:6px; background:rgba(30,41,59,0.9); border-radius:var(--radius-03); overflow:hidden; border:1px solid rgba(255,255,255,0.05);">
        <!-- Center Divider (Neutral 0) -->
        <div style="position:absolute; left:50%; top:0; bottom:0; width:1px; background:rgba(255,255,255,0.3); z-index:2;"></div>
        <!-- Indicator Fill -->
        <div style="position:absolute; left:${Math.min(50, fillPercent)}%; width:${Math.abs(fillPercent - 50)}%; top:0; bottom:0; background:${bandInfo.color}; transition:all 0.3s ease;"></div>
      </div>
    `;
  }

  public destroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}
