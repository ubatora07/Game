import { store } from '../../core/GameState';
import { DailySystem } from '../../systems/DailySystem';
import { getDailyQuestTemplate } from '../../content/dailyQuests';
import { t } from '../../services/i18n/I18nService';
import { sound } from '../../services/audio/SoundService';

export class DailyScreen {
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
    const key = `${state.loginStreak}_${state.loginRewardClaimed}_${JSON.stringify(state.dailyQuests)}`;
    if (key !== this.lastKey) {
      this.lastKey = key;
      this.render();
    }
  }

  private render(): void {
    const state = store.get();

    // Streak logic
    const currentDay = (state.loginStreak - 1) % 30 + 1;
    let daysHtml = '';
    for (let i = 1; i <= 30; i++) {
      const isPast = i < currentDay;
      const isToday = i === currentDay;

      let baseReward = 50 + (i % 30) * 10;
      if (i === 7) baseReward += 500;
      if (i === 14) baseReward += 1500;
      if (i === 30) baseReward += 5000;

      const isMajor = i === 7 || i === 14 || i === 30;

      let border = 'var(--border-subtle)';
      if (isToday) border = 'var(--color-cyan)';
      if (isMajor) border = 'var(--color-gold)';

      daysHtml += `
        <div style="
          background: ${isPast ? 'rgba(0,0,0,0.5)' : 'var(--bg-surface-raised)'};
          border: 1px solid ${border};
          border-radius: var(--radius-sm);
          padding: var(--space-08) var(--space-04);
          text-align: center;
          position: relative;
          opacity: ${isPast ? 0.4 : 1};
        ">
          <div style="font-size: 10px; color: var(--text-muted); margin-bottom: var(--space-04);">Day ${i}</div>
          <div style="font-size: 12px; font-weight: bold; color: ${isMajor ? 'var(--color-gold)' : 'var(--text-main)'};">
            💎 ${baseReward}
          </div>
          ${isPast ? '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 24px; color: var(--color-emerald);">✓</div>' : ''}
        </div>
      `;
    }

    // Quests logic
    const questsHtml = state.dailyQuests.map(q => {
      const template = getDailyQuestTemplate(q.templateId);
      if (!template) return '';
      const isComplete = q.progress >= template.target;
      const pct = Math.min(100, Math.floor((q.progress / template.target) * 100));

      return `
        <div style="background: var(--bg-surface-raised); border: 1px solid ${q.claimed ? 'var(--border-subtle)' : isComplete ? 'var(--color-emerald)' : 'var(--border-subtle)'}; border-radius: var(--radius-md); padding: var(--space-12); margin-bottom: var(--space-08);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-08);">
            <div>
              <div style="font-size: 14px; font-weight: bold; color: ${q.claimed ? 'var(--text-muted)' : 'var(--text-main)'};">${t(template.descriptionKey)}</div>
              <div style="font-size: 12px; color: var(--text-gold);">💎 ${template.rewardCrystals}</div>
            </div>
            <button class="claim-quest-btn" data-id="${q.id}" ${(!isComplete || q.claimed) ? 'disabled' : ''} style="background: ${q.claimed ? 'transparent' : 'var(--color-emerald)'}; color: ${q.claimed ? 'var(--text-muted)' : '#000'}; padding: var(--space-06) var(--space-12); border-radius: var(--radius-full); font-weight: bold;">
              ${q.claimed ? 'Claimed' : 'Claim'}
            </button>
          </div>

          <!-- Progress bar -->
          <div style="height: 6px; background: var(--bg-core); border-radius: var(--radius-03); overflow: hidden; position: relative;">
            <div style="position: absolute; top: 0; left: 0; height: 100%; width: ${pct}%; background: ${isComplete ? 'var(--color-emerald)' : 'var(--color-cyan)'};"></div>
          </div>
          <div style="text-align: right; font-size: 10px; color: var(--text-muted); margin-top: var(--space-04);">
            ${q.progress} / ${template.target}
          </div>
        </div>
      `;
    }).join('');

    this.el.innerHTML = `
      <h1 style="margin-bottom: var(--space-24); color: var(--text-cyan); text-align: center;">📅 ${t('nav.dailies')}</h1>

      <div style="background: var(--bg-card); padding: var(--space-16); border-radius: var(--radius-lg); margin-bottom: var(--space-24);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-16);">
          <h2 style="font-size: 16px;">Login Calendar (Day ${currentDay})</h2>
          <button id="claimLoginBtn" ${state.loginRewardClaimed ? 'disabled' : ''} style="background: ${state.loginRewardClaimed ? 'var(--bg-core)' : 'var(--color-cyan)'}; color: ${state.loginRewardClaimed ? 'var(--text-muted)' : '#000'}; padding: var(--space-06) var(--space-16); border-radius: var(--radius-full); font-weight: bold;">
            ${state.loginRewardClaimed ? 'Claimed Today' : 'Claim Reward'}
          </button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: var(--space-06); max-height: 200px; overflow-y: auto; padding-right: var(--space-04);">
          ${daysHtml}
        </div>
      </div>

      <div style="background: var(--bg-card); padding: var(--space-16); border-radius: var(--radius-lg);">
        <h2 style="margin-bottom: var(--space-16); font-size: 16px;">Daily Quests</h2>
        ${questsHtml}
      </div>
    `;

    // Bindings
    const claimLoginBtn = this.el.querySelector('#claimLoginBtn');
    if (claimLoginBtn) {
      claimLoginBtn.addEventListener('click', () => {
        if (DailySystem.claimLoginReward()) {
          sound.playClaim();
        }
      });
    }

    this.el.querySelectorAll('.claim-quest-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.id!;
        if (DailySystem.claimQuest(id)) {
          sound.playClaim();
        }
      });
    });
  }
}
