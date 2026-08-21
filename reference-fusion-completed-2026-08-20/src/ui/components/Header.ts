import { store } from '../../core/GameState';
import { BigNumber } from '../../core/BigNumber';
import { getRankById } from '../../content/ranks';
import { events } from '../../core/EventBus';
import { t } from '../../services/i18n/I18nService';
import { titleSystem } from '../../systems/TitleSystem';

export class Header {
  private el: HTMLElement;

  constructor() {
    this.el = document.createElement('header');
    this.el.className = 'app-header';
    this.render();
    this.bind();
  }

  public getElement(): HTMLElement {
    return this.el;
  }

  private bind(): void {
    store.subscribe(() => this.update());
    document.addEventListener('i18n:change', () => this.update());
    events.on('title:equipped' as any, () => this.update());
  }

  private render(): void {
    const equippedTitle = titleSystem.getEquippedTitle();

    this.el.innerHTML = `
      <div class="header-rank-badge" id="headerRankBadge" style="display:flex; align-items:center; gap:var(--space-08); cursor:pointer; min-width:0; flex-shrink:1;">
        <div class="rank-icon-frame" id="headerRankFrame" style="width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:16px; border:2px solid #94a3b8; background:rgba(15,23,42,0.8); flex-shrink:0;">
          E
        </div>
        <div style="display:flex; flex-direction:column; min-width:0; overflow:hidden;">
          <div style="display:flex; align-items:center; gap:var(--space-04);">
            <span id="headerRankTitle" style="font-size:11px; color:var(--text-muted); font-weight:bold; text-transform:uppercase; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">Novice</span>
            <span id="headerPlayerTitle" style="font-size:9px; color:#fde047; font-weight:bold; border:1px solid rgba(253,224,71,0.3); padding:0 var(--space-03); border-radius:var(--radius-02); cursor:pointer;" title="Change Title">
              ${equippedTitle ? `✦ ${equippedTitle.defaultName}` : ''}
            </span>
          </div>
          <span id="headerPowerDisplay" style="font-size:13px; color:var(--color-gold); font-weight:bold; white-space:nowrap;">0 ⚡</span>
        </div>
      </div>

      <div class="header-currencies" style="display:flex; align-items:center; gap:var(--space-08); flex-shrink:0;">
        <div class="currency-pill" style="display:flex; align-items:center; gap:var(--space-04); background:rgba(30,41,59,0.7); padding:var(--space-04) var(--space-08); border-radius:var(--radius-full); border:1px solid var(--border-subtle); white-space:nowrap;">
          <span style="font-size:13px;">🪙</span>
          <span id="headerGold" style="font-weight:bold; color:#fde047; font-size:12px;">0</span>
        </div>

        <div class="currency-pill" style="display:flex; align-items:center; gap:var(--space-04); background:rgba(30,41,59,0.7); padding:var(--space-04) var(--space-08); border-radius:var(--radius-full); border:1px solid var(--border-subtle); white-space:nowrap;">
          <span style="font-size:13px;">💎</span>
          <span id="headerCrystals" style="font-weight:bold; color:#38bdf8; font-size:12px;">0</span>
        </div>

        <button id="headerStatsBtn" title="Statistics & Production Breakdown" style="width:32px; height:32px; border-radius:var(--radius-md); background:rgba(30,41,59,0.7); border:1px solid var(--border-subtle); display:flex; align-items:center; justify-content:center; color:var(--text-main); font-size:14px; cursor:pointer; flex-shrink:0;">
          📊
        </button>

        <button id="headerSettingsBtn" title="Settings" style="width:32px; height:32px; border-radius:var(--radius-md); background:rgba(30,41,59,0.7); border:1px solid var(--border-subtle); display:flex; align-items:center; justify-content:center; color:var(--text-main); font-size:14px; cursor:pointer; flex-shrink:0;">
          ⚙️
        </button>
      </div>
    `;

    this.el.querySelector('#headerStatsBtn')?.addEventListener('click', () => {
      events.emit('modal:open', { modalId: 'stats' });
    });

    this.el.querySelector('#headerSettingsBtn')?.addEventListener('click', () => {
      events.emit('modal:open', { modalId: 'settings' });
    });

    this.el.querySelector('#headerPlayerTitle')?.addEventListener('click', (e) => {
      e.stopPropagation();
      events.emit('modal:open', { modalId: 'title_selection_modal' });
    });

    this.el.querySelector('#headerRankBadge')?.addEventListener('click', () => {
      events.emit('screen:change', { screenId: 'ascension' });
    });
  }

  private lastGold: number = 0;
  private lastCrystals: number = 0;

  private update(): void {
    const s = store.get();
    const rank = getRankById(s.rankId);
    const equippedTitle = titleSystem.getEquippedTitle();

    const frame = this.el.querySelector('#headerRankFrame') as HTMLElement;
    const rankTitle = this.el.querySelector('#headerRankTitle') as HTMLElement;
    const playerTitle = this.el.querySelector('#headerPlayerTitle') as HTMLElement;
    const power = this.el.querySelector('#headerPowerDisplay') as HTMLElement;
    const gold = this.el.querySelector('#headerGold') as HTMLElement;
    const crystals = this.el.querySelector('#headerCrystals') as HTMLElement;

    if (frame) {
      frame.innerText = rank.id;
      frame.style.borderColor = rank.color;
      frame.style.color = rank.color;
      frame.style.setProperty('--ui-glow-color', `${rank.color}40`);
      frame.style.boxShadow = 'var(--glow-dynamic-sm)';
    }

    if (rankTitle) rankTitle.innerText = t(rank.nameKey);
    if (playerTitle) playerTitle.innerText = equippedTitle ? `✦ ${equippedTitle.defaultName}` : '';
    if (power) power.innerText = `${BigNumber.format(s.power, s.settings?.notation)} ⚡`;

    if (gold) {
      gold.innerText = BigNumber.format(s.gold, s.settings?.notation);
      if (s.gold > this.lastGold + 100) {
        gold.parentElement!.style.transform = 'scale(1.15)';
        gold.parentElement!.style.borderColor = 'var(--color-gold)';
        gold.parentElement!.style.transition = 'all 0.15s ease';
        setTimeout(() => {
          gold.parentElement!.style.transform = '';
          gold.parentElement!.style.borderColor = 'var(--border-subtle)';
        }, 150);
      }
      this.lastGold = s.gold;
    }
    
    if (crystals) {
      crystals.innerText = BigNumber.format(s.crystals, s.settings?.notation);
      if (s.crystals > this.lastCrystals) {
        crystals.parentElement!.style.transform = 'scale(1.2)';
        crystals.parentElement!.style.borderColor = 'var(--color-cyan)';
        crystals.parentElement!.style.transition = 'all 0.15s ease';
        setTimeout(() => {
          crystals.parentElement!.style.transform = '';
          crystals.parentElement!.style.borderColor = 'var(--border-subtle)';
        }, 150);
      }
      this.lastCrystals = s.crystals;
    }
  }
}
