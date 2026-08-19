import { events } from '../../core/EventBus';
import { t } from '../../services/i18n/I18nService';
import { store } from '../../core/GameState';
import { getDailyQuestTemplate } from '../../content/dailyQuests';
import { sound } from '../../services/audio/SoundService';
import { AscensionSystem } from '../../systems/AscensionSystem';
import { QUESTS } from '../../content/quests';
import { QuestSystem } from '../../systems/QuestSystem';

export interface NavTab {
  id: string;
  icon: string;
  labelKey: string;
  minRankIndex: number;
}

export const NAV_TABS: readonly NavTab[] = [
  { id: 'ascension', icon: '🥋', labelKey: 'nav.hero', minRankIndex: 0 },
  { id: 'home', icon: '🏯', labelKey: 'nav.sect', minRankIndex: 0 },
  { id: 'battle', icon: '⚔️', labelKey: 'nav.battle', minRankIndex: 0 },
  { id: 'heroes', icon: '👥', labelKey: 'nav.heroes', minRankIndex: 0 },
  { id: 'more', icon: '✨', labelKey: 'nav.more', minRankIndex: 0 }
];

export class Navigation {
  private el: HTMLElement;
  private currentScreen: string = 'home';
  private badgeCheckInterval: number;

  constructor() {
    this.el = document.createElement('nav');
    this.el.className = 'app-bottom-nav';
    this.render();
    this.bind();

    // Periodically check for notification badges
    this.badgeCheckInterval = window.setInterval(() => this.updateBadges(), 1000);
  }

  public getElement(): HTMLElement {
    return this.el;
  }

  public destroy(): void {
    if (this.badgeCheckInterval) {
      clearInterval(this.badgeCheckInterval);
    }
  }

  private lastRankIndex: number = -1;

  private bind(): void {
    events.on('screen:change', ({ screenId }) => {
      this.currentScreen = screenId;
      this.updateActiveState();
    });

    store.subscribe(() => {
      this.updateVisibility();
      this.updateBadges();
    });

    document.addEventListener('i18n:change', () => {
      this.lastRankIndex = -1;
      this.render();
    });
  }

  private render(): void {
    const s = store.get();
    this.lastRankIndex = s.rankIndex;
    this.el.innerHTML = '';

    NAV_TABS.forEach((tab) => {
      const isUnlocked = s.rankIndex >= tab.minRankIndex;
      if (!isUnlocked) return;

      const isBattle = tab.id === 'battle';
      const btn = document.createElement('button');
      btn.className = `nav-tab-btn ${isBattle ? 'nav-tab-battle' : ''}`;
      btn.id = `navBtn_${tab.id}`;
      btn.style.position = 'relative';

      if (isBattle) {
        btn.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(245, 158, 11, 0.35))';
        btn.style.border = '1px solid rgba(245, 158, 11, 0.5)';
        btn.style.borderRadius = 'var(--radius-md)';
        btn.style.boxShadow = '0 0 12px rgba(245, 158, 11, 0.3)';
      }

      btn.innerHTML = `
        <span class="nav-icon" style="${isBattle ? 'font-size: 22px; filter: drop-shadow(0 0 6px #f59e0b);' : ''}">${tab.icon}</span>
        <span class="nav-label" style="${isBattle ? 'color: #fde047; font-weight: 900;' : ''}">${t(tab.labelKey)}</span>
        <div class="nav-badge" style="display:none; position:absolute; top:3px; right:10px; width:10px; height:10px; background:var(--color-crimson, #ef4444); border-radius:50%; box-shadow:0 0 8px #ef4444;"></div>
      `;

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        sound.playTap();

        if (tab.id === 'more') {
          events.emit('modal:open', { modalId: 'more_menu' });
        } else {
          events.emit('screen:change', { screenId: tab.id });
        }
      });

      this.el.appendChild(btn);
    });

    this.updateActiveState();
    this.updateBadges();
  }

  private updateBadges(): void {
    const state = store.get();
    const now = Date.now();

    // 1. Hero / Ascension badge
    const heroBtn = this.el.querySelector('#navBtn_ascension');
    if (heroBtn) {
      const badge = heroBtn.querySelector('.nav-badge') as HTMLElement;
      if (badge) {
        const canAscend = AscensionSystem.canAscend();
        badge.style.display = canAscend ? 'block' : 'none';
      }
    }

    // 2. Heroes / Summon badge (free summon ready)
    const heroesBtn = this.el.querySelector('#navBtn_heroes');
    if (heroesBtn) {
      const badge = heroesBtn.querySelector('.nav-badge') as HTMLElement;
      if (badge) {
        const isAdSummonReady = (now - (state.lastFreeSummonAdAt || 0)) >= (5 * 60 * 1000);
        badge.style.display = isAdSummonReady ? 'block' : 'none';
      }
    }

    // 3. More Menu badge (quests ready to claim, daily unclaimed, expeditions completed)
    const moreBtn = this.el.querySelector('#navBtn_more');
    if (moreBtn) {
      const badge = moreBtn.querySelector('.nav-badge') as HTMLElement;
      if (badge) {
        const hasClaimableQuest = QUESTS.some(q => QuestSystem.isQuestReadyToClaim(q.id));
        const hasDailyClaim = !state.loginRewardClaimed || state.dailyQuests.some(q => {
          if (q.claimed) return false;
          const template = getDailyQuestTemplate(q.templateId);
          return template && q.progress >= template.target;
        });
        const hasExpeditionDone = state.expeditions.some(e => now >= e.startedAt + e.durationMs);

        badge.style.display = (hasClaimableQuest || hasDailyClaim || hasExpeditionDone) ? 'block' : 'none';
      }
    }
  }

  private updateActiveState(): void {
    this.el.querySelectorAll('.nav-tab-btn').forEach((btn) => {
      btn.classList.remove('active');
    });

    let activeTabId = this.currentScreen;
    if (this.currentScreen === 'home' || this.currentScreen === 'battle') {
      activeTabId = 'battle';
    } else if (this.currentScreen === 'summon') {
      activeTabId = 'heroes';
    } else if (['quests', 'tower', 'expeditions', 'relics', 'souls', 'dailies'].includes(this.currentScreen)) {
      activeTabId = 'more';
    }

    const activeBtn = this.el.querySelector(`#navBtn_${activeTabId}`);
    if (activeBtn) {
      activeBtn.classList.add('active');
    }
  }

  private updateVisibility(): void {
    const s = store.get();
    if (s.rankIndex !== this.lastRankIndex) {
      this.render();
    }
  }
}
