import { store } from '../../core/GameState';
import { HeroSystem } from '../../systems/HeroSystem';
import { events } from '../../core/EventBus';
import { t } from '../../services/i18n/I18nService';

export class SummonScreen {
  private el: HTMLElement;
  private isDOMBuilt: boolean = false;

  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'screen-container';
    this.buildDOM();
    this.bind();
  }

  public getElement(): HTMLElement {
    return this.el;
  }

  private bind(): void {
    store.subscribe(() => this.update());
    document.addEventListener('i18n:change', () => {
      this.isDOMBuilt = false;
      this.buildDOM();
    });
  }

  private buildDOM(): void {
    this.el.innerHTML = `
      <div style="padding:16px; max-width:580px; margin:0 auto; width:100%; display:flex; flex-direction:column; align-items:center; height:100%; justify-content:space-between;">
        <!-- Header -->
        <div style="text-align:center;">
          <h2 style="font-family:var(--font-display); font-size:24px; color:#fde047;">
            🔮 ${t('nav.summon')}
          </h2>
          <p style="color:var(--text-muted); font-size:12px;">
            ${t('currency.crystals')}: <b id="summonCrystalsDisplay" style="color:#38bdf8;">0 💎</b>
          </p>
        </div>

        <!-- Portal Artwork Visual -->
        <div style="position:relative; width:220px; height:220px; display:flex; align-items:center; justify-content:center; margin:16px 0;">
          <svg style="position:absolute; width:100%; height:100%; animation:celestialRotate 12s linear infinite;" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="90" fill="none" stroke="#a855f7" stroke-width="2" stroke-dasharray="12 8" opacity="0.6" />
            <circle cx="100" cy="100" r="75" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="20 12" opacity="0.8" />
            <circle cx="100" cy="100" r="60" fill="none" stroke="#f59e0b" stroke-width="1.5" opacity="0.4" />
          </svg>
          <div style="width:140px; height:140px; border-radius:50%; background:radial-gradient(circle, #7c3aed 0%, #1e1b4b 70%, #030712 100%); display:flex; align-items:center; justify-content:center; box-shadow:0 0 35px rgba(168,85,247,0.6); animation:heroFloat 3s ease-in-out infinite;">
            <span style="font-size:64px;">🌌</span>
          </div>
        </div>

        <!-- Rates Table -->
        <div style="width:100%; background:rgba(30,41,59,0.5); border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:10px 14px; margin-bottom:16px;">
          <div style="font-size:11px; font-weight:bold; color:var(--text-muted); margin-bottom:6px; text-transform:uppercase;">
            Drop Probabilities & Essence:
          </div>
          <div style="display:flex; justify-content:space-between; font-size:11px;">
            <span style="color:#f43f5e; font-weight:bold;">Mythic: 0.5%</span>
            <span style="color:#fbbf24; font-weight:bold;">Legendary: 3.5%</span>
            <span style="color:#c084fc; font-weight:bold;">Epic: 11%</span>
            <span style="color:#38bdf8; font-weight:bold;">Rare: 30%</span>
            <span style="color:#94a3b8; font-weight:bold;">Common: 55%</span>
          </div>
        </div>

        <!-- Action Buttons (1x & 10x) -->
        <div style="display:flex; flex-direction:column; gap:12px; width:100%; margin-bottom:16px;">
          <div style="display:flex; gap:12px; width:100%;">
            <button id="summon1Btn" style="
              flex:1;
              height:50px;
              background: rgba(51,65,85,0.5);
              border: 1px solid transparent;
              border-radius: var(--radius-md);
              color: #64748b;
              font-weight: bold;
              font-size: 14px;
              cursor: pointer;
            ">
              <div>${t('btn.summon_1')}</div>
              <div style="font-size:11px; color:#38bdf8;">100 💎</div>
            </button>

            <button id="summon10Btn" style="
              flex:1;
              height:50px;
              background: rgba(51,65,85,0.5);
              border: 1px solid transparent;
              border-radius: var(--radius-md);
              color: #64748b;
              font-weight: bold;
              font-size: 14px;
              cursor: pointer;
            ">
              <div>${t('btn.summon_10')}</div>
              <div style="font-size:11px; color:#fde047;">900 💎 (10% OFF)</div>
            </button>
          </div>
          <button id="summonAdBtn" style="
            width:100%;
            height:44px;
            background: linear-gradient(135deg, #059669, #10b981);
            border: 2px solid #34d399;
            border-radius: var(--radius-md);
            color: #ffffff;
            font-weight: bold;
            font-size: 14px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            box-shadow: 0 4px 15px rgba(16,185,129,0.3);
          ">
            <span>🎬</span>
            <span>Free Summon</span>
            <span id="summonAdCooldown" style="font-size:11px; color:#a7f3d0; margin-left:8px;"></span>
          </button>
        </div>
      </div>
    `;

    this.el.querySelector('#summon1Btn')?.addEventListener('click', (e) => {
      e.preventDefault();
      const results = HeroSystem.summon(1);
      if (results) {
        events.emit('modal:open', { modalId: 'summon_result', data: { results } });
      }
    });

    this.el.querySelector('#summon10Btn')?.addEventListener('click', (e) => {
      e.preventDefault();
      const results = HeroSystem.summon(10);
      if (results) {
        events.emit('modal:open', { modalId: 'summon_result', data: { results } });
      }
    });

    this.el.querySelector('#summonAdBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.executeFreeAdSummon();
    });

    this.isDOMBuilt = true;
    this.update();
  }

  private async executeFreeAdSummon(): Promise<void> {
    const s = store.get();
    const now = Date.now();
    if (now - s.lastFreeSummonAdAt < 5 * 60 * 1000) return;

    import('../../services/ads/AdService').then(async (m) => {
      const watched = await m.adService.showRewardedAd('free_summon');
      if (watched) {
        store.set(draft => {
          draft.lastFreeSummonAdAt = Date.now();
        });
        // We use a bypass to HeroSystem to summon without crystals
        const results = HeroSystem.summon(1, true); // We will add a bypass flag to HeroSystem
        if (results) {
          events.emit('modal:open', { modalId: 'summon_result', data: { results } });
        }
      }
    });
  }

  private update(): void {
    if (!this.isDOMBuilt) return;
    const s = store.get();
    const canSummon1 = s.crystals >= 100;
    const canSummon10 = s.crystals >= 900;

    const display = this.el.querySelector('#summonCrystalsDisplay');
    if (display) display.innerHTML = `${s.crystals} 💎`;

    const btn1 = this.el.querySelector('#summon1Btn') as HTMLElement;
    const btn10 = this.el.querySelector('#summon10Btn') as HTMLElement;

    if (btn1) {
      btn1.style.background = canSummon1 ? 'linear-gradient(135deg, #7c3aed, #9333ea)' : 'rgba(51,65,85,0.5)';
      btn1.style.borderColor = canSummon1 ? '#c084fc' : 'transparent';
      btn1.style.color = canSummon1 ? '#ffffff' : '#64748b';
      btn1.style.boxShadow = canSummon1 ? '0 0 15px rgba(147,51,234,0.4)' : 'none';
    }

    if (btn10) {
      btn10.style.background = canSummon10 ? 'linear-gradient(135deg, #d97706, #f59e0b)' : 'rgba(51,65,85,0.5)';
      btn10.style.borderColor = canSummon10 ? '#fde047' : 'transparent';
      btn10.style.color = canSummon10 ? '#ffffff' : '#64748b';
      btn10.style.boxShadow = canSummon10 ? '0 0 15px rgba(245,158,11,0.4)' : 'none';
    }

    // Free Summon Ad Cooldown
    const adBtn = this.el.querySelector('#summonAdBtn') as HTMLButtonElement;
    const cooldownTxt = this.el.querySelector('#summonAdCooldown') as HTMLElement;
    if (adBtn && cooldownTxt) {
      const now = Date.now();
      const elapsed = now - s.lastFreeSummonAdAt;
      const cooldown = 5 * 60 * 1000;
      
      if (elapsed < cooldown) {
        adBtn.disabled = true;
        adBtn.style.filter = 'grayscale(100%)';
        adBtn.style.opacity = '0.5';
        
        const remaining = Math.ceil((cooldown - elapsed) / 1000);
        const m = Math.floor(remaining / 60);
        const sec = remaining % 60;
        cooldownTxt.innerText = `(${m}:${sec.toString().padStart(2, '0')})`;
        
        // Schedule next visual update if not already scheduled
        if (!this.timerId) {
          this.timerId = window.setInterval(() => this.update(), 1000);
        }
      } else {
        adBtn.disabled = false;
        adBtn.style.filter = 'none';
        adBtn.style.opacity = '1';
        cooldownTxt.innerText = '';
        if (this.timerId) {
          clearInterval(this.timerId);
          this.timerId = undefined;
        }
      }
    }
  }
  
  private timerId?: number;
}
