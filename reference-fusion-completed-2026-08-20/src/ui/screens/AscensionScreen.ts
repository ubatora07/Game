import { store } from '../../core/GameState';
import { RANKS } from '../../content/ranks';
import { AscensionSystem } from '../../systems/AscensionSystem';
import { BigNumber } from '../../core/BigNumber';
import { t } from '../../services/i18n/I18nService';

export class AscensionScreen {
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
      this.update();
    });
  }

  private buildDOM(): void {
    this.el.innerHTML = `
      <div style="padding:var(--space-16); max-width:640px; margin:0 auto; width:100%;">
        <div style="text-align:center; margin-bottom:var(--space-20);">
          <h2 style="font-family:var(--font-display); font-size:24px; color:#fde047; letter-spacing:1px;">
            🌟 ${t('nav.ascension')}
          </h2>
          <p style="color:var(--text-muted); font-size:13px;">
            ${t('app.subtitle')}
          </p>
        </div>

        <div id="ascensionCardsList" style="display:flex; flex-direction:column; gap:var(--space-12);">
          ${RANKS.map((rank) => `
            <div class="ascension-card" id="ascCard_${rank.id}" style="
              background: rgba(17, 24, 39, 0.75);
              border: 1px solid var(--border-subtle);
              border-radius: var(--radius-md);
              padding: var(--space-14);
              display: flex;
              align-items: center;
              justify-content: space-between;
              transition: all 0.2s ease;
            ">
              <div style="display:flex; align-items:center; gap:var(--space-12);">
                <div class="asc-badge" style="
                  width: 44px;
                  height: 44px;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-weight: 900;
                  font-size: 18px;
                  border: 2px solid ${rank.color};
                  color: ${rank.color};
                  background: rgba(15,23,42,0.8);
                ">
                  ${rank.id}
                </div>

                <div>
                  <div style="font-weight:bold; font-size:14px; color:${rank.color};">
                    ${t(rank.titleKey)}
                  </div>
                  <div class="asc-desc" style="font-size:12px; color:var(--text-muted);">
                    ${t(rank.descriptionKey)}
                  </div>
                  <div style="font-size:11px; color:#fde047; font-weight:bold; margin-top:var(--space-02);">
                    ${t('rank.multiplier')}: ×${rank.multiplier}
                  </div>
                </div>
              </div>

              <div class="asc-action-slot">
                <!-- Dynamic status / button -->
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    this.isDOMBuilt = true;
    this.update();
  }

  private update(): void {
    if (!this.isDOMBuilt) return;
    const s = store.get();
    const currentRankIndex = s.rankIndex;

    RANKS.forEach((rank) => {
      const card = this.el.querySelector(`#ascCard_${rank.id}`) as HTMLElement;
      if (!card) return;

      const isCompleted = currentRankIndex > rank.index;
      const isCurrent = currentRankIndex === rank.index;
      const isNext = rank.index === currentRankIndex + 1;
      const isLocked = rank.index > currentRankIndex + 1;
      const canAscendNow = isNext && s.power >= rank.reqPower;

      // Card styling
      if (isCurrent) {
        card.style.border = `2px solid ${rank.color}`;
        card.style.background = `rgba(30, 41, 59, 0.9)`;
        card.style.setProperty('--ui-glow-color', rank.glowColor);
        card.style.boxShadow = 'var(--glow-dynamic-lg)';
        card.style.opacity = '1';
      } else if (canAscendNow) {
        card.style.border = `2px solid #fde047`;
        card.style.background = `rgba(245, 158, 11, 0.15)`;
        card.style.removeProperty('--ui-glow-color');
        card.style.boxShadow = 'none';
        card.style.opacity = '1';
      } else {
        card.style.border = `1px solid var(--border-subtle)`;
        card.style.background = `rgba(17, 24, 39, 0.75)`;
        card.style.removeProperty('--ui-glow-color');
        card.style.boxShadow = 'none';
        card.style.opacity = isLocked ? '0.5' : '1';
      }

      const badge = card.querySelector('.asc-badge') as HTMLElement;
      if (badge) {
        badge.style.color = isCurrent ? '#000' : rank.color;
        badge.style.background = isCurrent ? rank.color : 'rgba(15,23,42,0.8)';
      }

      const desc = card.querySelector('.asc-desc') as HTMLElement;
      if (desc) {
        desc.innerText = isLocked ? '???' : t(rank.descriptionKey);
      }

      const slot = card.querySelector('.asc-action-slot') as HTMLElement;
      if (slot) {
        if (isCompleted) {
          slot.innerHTML = `<span style="color:#10b981; font-weight:bold; font-size:12px;">✓ ${t('btn.claim')}</span>`;
        } else if (isCurrent) {
          slot.innerHTML = `<span style="color:#38bdf8; font-weight:bold; font-size:12px; border:1px solid #38bdf8; padding:var(--space-04) var(--space-08); border-radius:var(--radius-sm);">${t('rank.current')}</span>`;
        } else if (canAscendNow) {
          if (!slot.querySelector('.ascend-now-btn')) {
            slot.innerHTML = `
              <button class="ascend-now-btn" style="
                height: 40px;
                padding: 0 var(--space-16);
                background: linear-gradient(135deg, #d97706, #f59e0b);
                border: 1px solid #fde047;
                border-radius: var(--radius-sm);
                color: #fff;
                font-weight: bold;
                font-size: 13px;
                cursor: pointer;
                animation: buttonReadyGlow 1.5s infinite;
              ">
                ${t('btn.ascend')}
              </button>
            `;
            slot.querySelector('.ascend-now-btn')?.addEventListener('click', (e) => {
              e.preventDefault();
              AscensionSystem.ascend();
            });
          }
        } else {
          slot.innerHTML = `
            <div style="text-align:right;">
              <div style="font-size:10px; color:var(--text-muted);">${t('rank.req')}</div>
              <div style="font-size:12px; font-weight:bold; color:var(--color-gold);">
                ${BigNumber.format(rank.reqPower)} ⚡
              </div>
            </div>
          `;
        }
      }
    });
  }
}
