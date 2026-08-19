import { store } from '../../core/GameState';
import { QUESTS } from '../../content/quests';
import { ACHIEVEMENTS } from '../../content/achievements';
import { QuestSystem } from '../../systems/QuestSystem';
import { t } from '../../services/i18n/I18nService';

export class QuestsScreen {
  private el: HTMLElement;
  private activeTab: 'quests' | 'achievements' = 'quests';
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
    const s = store.get();

    this.el.innerHTML = `
      <div style="padding:16px; max-width:640px; margin:0 auto; width:100%;">
        <!-- Tabs Header -->
        <div style="display:flex; gap:10px; margin-bottom:16px; border-bottom:1px solid var(--border-subtle); padding-bottom:10px;">
          <button id="tabQuestsBtn" style="
            flex:1;
            height:40px;
            background: ${this.activeTab === 'quests' ? 'rgba(245,158,11,0.2)' : 'rgba(30,41,59,0.5)'};
            border: 1px solid ${this.activeTab === 'quests' ? '#f59e0b' : 'var(--border-subtle)'};
            border-radius: var(--radius-md);
            color: ${this.activeTab === 'quests' ? '#fde047' : 'var(--text-muted)'};
            font-weight: bold;
            font-size: 13px;
            cursor: pointer;
          ">
            📜 ${t('quest.title')}
          </button>

          <button id="tabAchieveBtn" style="
            flex:1;
            height:40px;
            background: ${this.activeTab === 'achievements' ? 'rgba(56,189,248,0.2)' : 'rgba(30,41,59,0.5)'};
            border: 1px solid ${this.activeTab === 'achievements' ? '#38bdf8' : 'var(--border-subtle)'};
            border-radius: var(--radius-md);
            color: ${this.activeTab === 'achievements' ? '#7dd3fc' : 'var(--text-muted)'};
            font-weight: bold;
            font-size: 13px;
            cursor: pointer;
          ">
            🏆 ${t('achieve.title')} (<span id="achieveCount">${s.claimedAchievements.length}</span> / ${ACHIEVEMENTS.length})
          </button>
        </div>

        <!-- Tab Content -->
        <div id="questsContentList" style="display:flex; flex-direction:column; gap:10px;">
          <!-- Items populated here -->
        </div>
      </div>
    `;

    this.el.querySelector('#tabQuestsBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      if (this.activeTab !== 'quests') {
        this.activeTab = 'quests';
        this.buildDOM();
      }
    });

    this.el.querySelector('#tabAchieveBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      if (this.activeTab !== 'achievements') {
        this.activeTab = 'achievements';
        this.buildDOM();
      }
    });

    const list = this.el.querySelector('#questsContentList')!;
    if (this.activeTab === 'quests') {
      QUESTS.forEach((quest) => {
        const card = document.createElement('div');
        card.className = 'quest-card';
        card.id = `qcard_${quest.id}`;
        card.style.cssText = `
          background: rgba(17, 24, 39, 0.85);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        `;

        card.innerHTML = `
          <div style="flex:1; margin-right:12px;">
            <div style="font-weight:bold; font-size:13px; color:var(--text-main);">${t(quest.nameKey)}</div>
            <div style="font-size:11px; color:var(--text-muted); margin-bottom:4px;">${t(quest.descKey)}</div>
            
            <div style="display:flex; align-items:center; gap:8px;">
              <div style="flex:1; height:6px; background:rgba(30,41,59,0.8); border-radius:var(--radius-full); overflow:hidden;">
                <div class="q-bar" style="width:0%; height:100%; background:#f59e0b;"></div>
              </div>
              <span class="q-count" style="font-size:10px; color:var(--text-muted); font-weight:bold;">0 / ${quest.targetCount}</span>
            </div>
          </div>

          <button class="claim-quest-action-btn" data-quest="${quest.id}" style="
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
            0%
          </button>
        `;

        const btn = card.querySelector('.claim-quest-action-btn') as HTMLElement;
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          QuestSystem.claimQuest(quest.id);
        });

        list.appendChild(card);
      });
    } else {
      ACHIEVEMENTS.forEach((ach) => {
        const card = document.createElement('div');
        card.className = 'achievement-card';
        card.id = `acard_${ach.id}`;
        card.style.cssText = `
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          opacity: 0.5;
        `;

        card.innerHTML = `
          <div style="display:flex; align-items:center; gap:10px;">
            <div style="font-size:24px; width:38px; height:38px; border-radius:var(--radius-sm); background:rgba(30,41,59,0.7); display:flex; align-items:center; justify-content:center;">
              ${ach.icon}
            </div>
            <div>
              <div style="font-weight:bold; font-size:13px; color:var(--text-main);">${t(ach.nameKey)}</div>
              <div style="font-size:11px; color:var(--text-muted);">${t(ach.descKey)}</div>
            </div>
          </div>

          <div class="a-status" style="font-weight:bold; font-size:12px; color:#38bdf8;">
            +${ach.rewardCrystals} 💎
          </div>
        `;

        list.appendChild(card);
      });
    }

    this.isDOMBuilt = true;
    this.update();
  }

  private update(): void {
    if (!this.isDOMBuilt) return;
    const s = store.get();

    const countEl = this.el.querySelector('#achieveCount') as HTMLElement;
    if (countEl) countEl.innerText = `${s.claimedAchievements.length}`;

    if (this.activeTab === 'quests') {
      QUESTS.forEach((quest) => {
        const card = this.el.querySelector(`#qcard_${quest.id}`);
        if (!card) return;

        const isCompleted = s.completedQuests.includes(quest.id);
        const progress = Math.min(quest.targetCount, quest.getProgress(s));
        const pct = Math.floor((progress / quest.targetCount) * 100);
        const canClaim = !isCompleted && progress >= quest.targetCount;

        const bar = card.querySelector('.q-bar') as HTMLElement;
        const count = card.querySelector('.q-count') as HTMLElement;
        const btn = card.querySelector('.claim-quest-action-btn') as HTMLElement;

        if (bar) {
          bar.style.width = `${pct}%`;
          bar.style.background = isCompleted ? '#10b981' : '#f59e0b';
        }
        if (count) count.innerText = `${progress} / ${quest.targetCount}`;

        if (btn) {
          btn.innerText = isCompleted ? '✓ Done' : canClaim ? t('btn.claim') : `${pct}%`;
          btn.style.background = isCompleted ? 'rgba(30,41,59,0.5)' : canClaim ? 'linear-gradient(135deg, #d97706, #f59e0b)' : 'rgba(51,65,85,0.5)';
          btn.style.borderColor = canClaim ? '#fde047' : 'transparent';
          btn.style.color = isCompleted ? '#10b981' : canClaim ? '#ffffff' : '#64748b';
        }
      });
    } else {
      ACHIEVEMENTS.forEach((ach) => {
        const card = this.el.querySelector(`#acard_${ach.id}`) as HTMLElement;
        if (!card) return;

        const isClaimed = s.claimedAchievements.includes(ach.id);
        const isUnlocked = ach.check(s);
        const statusEl = card.querySelector('.a-status') as HTMLElement;

        card.style.opacity = isClaimed || isUnlocked ? '1' : '0.5';
        card.style.borderColor = isClaimed ? '#38bdf8' : 'var(--border-subtle)';

        if (statusEl) {
          statusEl.innerText = isClaimed ? '✓ Claimed' : `+${ach.rewardCrystals} 💎`;
          statusEl.style.color = isClaimed ? '#10b981' : '#38bdf8';
        }
      });
    }
  }
}
