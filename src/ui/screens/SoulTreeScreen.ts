import { store } from '../../core/GameState';
import { SOUL_TREE, calculateSoulSkillCost } from '../../content/soulTree';
import { ReincarnationSystem } from '../../systems/ReincarnationSystem';
import { events } from '../../core/EventBus';
import { t } from '../../services/i18n/I18nService';

export class SoulTreeScreen {
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
      <div style="padding:16px; max-width:680px; margin:0 auto; width:100%;">
        <!-- Reincarnation Banner Card -->
        <div style="
          background: radial-gradient(circle at center, rgba(225,29,72,0.2) 0%, rgba(15,23,42,0.9) 100%);
          border: 2px solid #f43f5e;
          border-radius: var(--radius-lg);
          padding: 16px;
          margin-bottom: 20px;
          box-shadow: 0 0 25px rgba(244,63,94,0.3);
          text-align: center;
        ">
          <h2 style="font-family:var(--font-display); font-size:22px; color:#f43f5e; margin-bottom:4px;">
            ⚡ ${t('soul.title')}
          </h2>
          <p style="color:var(--text-muted); font-size:12px; margin-bottom:12px;">
            ${t('soul.desc')}
          </p>

          <div style="display:flex; justify-content:space-around; align-items:center; margin-bottom:14px;">
            <div>
              <div style="font-size:11px; color:var(--text-muted);">${t('currency.souls')} (Owned)</div>
              <div id="soulOwnedDisplay" style="font-size:20px; font-weight:bold; color:#f43f5e;">0 ⚡</div>
            </div>
            <div>
              <div style="font-size:11px; color:var(--text-muted);">Reset Reward</div>
              <div id="soulPotentialDisplay" style="font-size:20px; font-weight:bold; color:#fde047;">+0 ⚡</div>
            </div>
          </div>

          <button id="openReincarnateModalBtn" style="
            width: 100%;
            max-width: 320px;
            height: 44px;
            background: rgba(51,65,85,0.5);
            border: 1px solid transparent;
            border-radius: var(--radius-md);
            color: #64748b;
            font-weight: bold;
            font-size: 14px;
            cursor: pointer;
          ">
            Requires Rank S (1M Power)
          </button>
        </div>

        <!-- Soul Skills List -->
        <h3 style="font-family:var(--font-display); font-size:18px; color:#fde047; margin-bottom:12px;">
          ✨ Permanent Soul Mastery
        </h3>

        <div id="soulSkillsList" style="display:flex; flex-direction:column; gap:10px;">
          ${SOUL_TREE.map((skill) => `
            <div class="soul-skill-card" id="scard_${skill.id}" style="
              background: rgba(17, 24, 39, 0.85);
              border: 1px solid var(--border-subtle);
              border-radius: var(--radius-md);
              padding: 12px;
              display: flex;
              align-items: center;
              justify-content: space-between;
            ">
              <div style="display:flex; align-items:center; gap:12px;">
                <div style="font-size:24px; width:40px; height:40px; border-radius:var(--radius-sm); background:rgba(30,41,59,0.7); display:flex; align-items:center; justify-content:center;">
                  ${skill.icon}
                </div>
                <div>
                  <div style="font-weight:bold; font-size:13px; color:var(--text-main);">
                    ${t(skill.nameKey)} <span class="s-lvl" style="color:#f43f5e; font-size:11px;">Lv.0 / ${skill.maxLevel}</span>
                  </div>
                  <div style="font-size:11px; color:var(--text-muted);">
                    ${t(skill.descKey)}
                  </div>
                </div>
              </div>

              <button class="buy-soul-action-btn" data-skill="${skill.id}" style="
                min-width: 80px;
                height: 38px;
                background: rgba(51,65,85,0.5);
                border: 1px solid transparent;
                border-radius: var(--radius-sm);
                color: #64748b;
                font-weight: bold;
                font-size: 12px;
                cursor: pointer;
              ">
                1 ⚡
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    this.el.querySelector('#openReincarnateModalBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      if (ReincarnationSystem.canReincarnate()) {
        events.emit('modal:open', { modalId: 'reincarnate' });
      }
    });

    this.el.querySelectorAll('.buy-soul-action-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const skillId = (e.currentTarget as HTMLElement).getAttribute('data-skill');
        if (skillId) {
          ReincarnationSystem.buySoulSkill(skillId);
        }
      });
    });

    this.isDOMBuilt = true;
    this.update();
  }

  private update(): void {
    if (!this.isDOMBuilt) return;
    const s = store.get();
    const potentialSouls = ReincarnationSystem.getPotentialSouls();
    const canReincarnate = ReincarnationSystem.canReincarnate();

    const ownedDisplay = this.el.querySelector('#soulOwnedDisplay');
    const potentialDisplay = this.el.querySelector('#soulPotentialDisplay');
    const reincarnateBtn = this.el.querySelector('#openReincarnateModalBtn') as HTMLElement;

    if (ownedDisplay) ownedDisplay.innerHTML = `${s.souls} ⚡`;
    if (potentialDisplay) potentialDisplay.innerHTML = `+${potentialSouls} ⚡`;

    if (reincarnateBtn) {
      if (canReincarnate) {
        reincarnateBtn.innerText = t('btn.reincarnate');
        reincarnateBtn.style.background = 'linear-gradient(135deg, #e11d48, #be123c)';
        reincarnateBtn.style.borderColor = '#f43f5e';
        reincarnateBtn.style.color = '#ffffff';
        reincarnateBtn.style.boxShadow = '0 0 15px rgba(225,29,72,0.4)';
      } else {
        reincarnateBtn.innerText = 'Requires Rank S (1M Power)';
        reincarnateBtn.style.background = 'rgba(51,65,85,0.5)';
        reincarnateBtn.style.borderColor = 'transparent';
        reincarnateBtn.style.color = '#64748b';
        reincarnateBtn.style.boxShadow = 'none';
      }
    }

    SOUL_TREE.forEach((skill) => {
      const card = this.el.querySelector(`#scard_${skill.id}`) as HTMLElement;
      if (!card) return;

      const currentLevel = s.soulSkills[skill.id] || 0;
      const cost = calculateSoulSkillCost(skill, currentLevel);
      const isMax = currentLevel >= skill.maxLevel;
      const canAfford = s.souls >= cost && !isMax;

      const lvlEl = card.querySelector('.s-lvl') as HTMLElement;
      const btn = card.querySelector('.buy-soul-action-btn') as HTMLElement;

      if (lvlEl) lvlEl.innerText = `Lv.${currentLevel} / ${skill.maxLevel}`;

      card.style.borderColor = canAfford ? 'rgba(244,63,94,0.6)' : 'var(--border-subtle)';

      if (btn) {
        btn.innerText = isMax ? 'MAX' : `${cost} ⚡`;
        btn.style.background = isMax ? 'rgba(30,41,59,0.5)' : canAfford ? 'linear-gradient(135deg, #e11d48, #be123c)' : 'rgba(51,65,85,0.5)';
        btn.style.borderColor = canAfford ? '#f43f5e' : 'transparent';
        btn.style.color = isMax ? '#64748b' : canAfford ? '#ffffff' : '#64748b';
      }
    });
  }
}
