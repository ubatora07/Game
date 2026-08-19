import { events } from '../../core/EventBus';
import { t } from '../../services/i18n/I18nService';
import { store } from '../../core/GameState';
import { getDailyQuestTemplate } from '../../content/dailyQuests';
import { sound } from '../../services/audio/SoundService';
import { AscensionSystem } from '../../systems/AscensionSystem';
import { QUESTS } from '../../content/quests';
import { QuestSystem } from '../../systems/QuestSystem';
import {
  PRIMARY_DOMAINS,
  PrimaryDomainDefinition,
  getPrimaryDomainForScreen,
} from '../navigation/PrimaryDomains';
import { resolveUIIcon } from '../art/runtime/UIIconRegistry';

export type NavTab = PrimaryDomainDefinition;

/** @deprecated Prefer PRIMARY_DOMAINS. Kept for compatibility with existing imports/tests. */
export const NAV_TABS = PRIMARY_DOMAINS;

export class Navigation {
  private el: HTMLElement;
  private currentScreen: string = 'battle';
  private badgeCheckInterval: number;

  constructor() {
    this.el = document.createElement('nav');
    this.el.className = 'app-bottom-nav';
    this.el.setAttribute('aria-label', t('nav.primary'));
    this.render();
    this.bind();

    // Periodically check for notification badges.
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
      this.el.setAttribute('aria-label', t('nav.primary'));
      this.render();
    });
  }

  private render(): void {
    const s = store.get();
    this.lastRankIndex = s.rankIndex;
    this.el.innerHTML = '';

    PRIMARY_DOMAINS.forEach((tab) => {
      const isUnlocked = s.rankIndex >= tab.minRankIndex;
      if (!isUnlocked) return;

      const isBattle = tab.id === 'battle';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `nav-tab-btn ${isBattle ? 'nav-tab-battle' : ''}`;
      btn.id = `navBtn_${tab.id}`;
      btn.style.position = 'relative';
      btn.setAttribute('aria-label', t(tab.labelKey));

      if (isBattle) {
        btn.style.background = 'linear-gradient(135deg, rgba(120, 53, 15, 0.72), rgba(127, 29, 29, 0.72))';
        btn.style.border = '1px solid rgba(245, 158, 11, 0.55)';
        btn.style.boxShadow = '0 0 12px rgba(245, 158, 11, 0.24)';
      }

      btn.innerHTML = `
        <span class="nav-icon" aria-hidden="true">${resolveUIIcon(tab.iconId).fallbackSvg}</span>
        <span class="nav-label">${t(tab.labelKey)}</span>
        <span class="nav-badge" aria-hidden="true"></span>
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

  private setBadge(tabId: string, visible: boolean): void {
    const button = this.el.querySelector(`#navBtn_${tabId}`);
    const badge = button?.querySelector('.nav-badge') as HTMLElement | null;
    if (badge) {
      badge.style.display = visible ? 'block' : 'none';
    }
  }

  private updateBadges(): void {
    const state = store.get();
    const now = Date.now();

    // Hero: advancement is available.
    this.setBadge('hero', AscensionSystem.canAscend());

    // Team: free recruitment is available.
    const isAdSummonReady = (now - (state.lastFreeSummonAdAt || 0)) >= (5 * 60 * 1000);
    this.setBadge('team', isAdSummonReady);

    // World: claimable quest or completed expedition.
    const hasClaimableQuest = QUESTS.some((quest) => QuestSystem.isQuestReadyToClaim(quest.id));
    const hasExpeditionDone = state.expeditions.some((expedition) => now >= expedition.startedAt + expedition.durationMs);
    this.setBadge('world', hasClaimableQuest || hasExpeditionDone);

    // More: daily/login meta reward is waiting.
    const hasDailyClaim = !state.loginRewardClaimed || state.dailyQuests.some((quest) => {
      if (quest.claimed) return false;
      const template = getDailyQuestTemplate(quest.templateId);
      return Boolean(template && quest.progress >= template.target);
    });
    this.setBadge('more', hasDailyClaim);
  }

  private updateActiveState(): void {
    this.el.querySelectorAll('.nav-tab-btn').forEach((btn) => {
      btn.classList.remove('active');
      btn.removeAttribute('aria-current');
    });

    const activeTabId = getPrimaryDomainForScreen(this.currentScreen);
    if (!activeTabId) return;

    const activeBtn = this.el.querySelector(`#navBtn_${activeTabId}`);
    if (activeBtn) {
      activeBtn.classList.add('active');
      activeBtn.setAttribute('aria-current', 'page');
    }
  }

  private updateVisibility(): void {
    const s = store.get();
    if (s.rankIndex !== this.lastRankIndex) {
      this.render();
    }
  }
}
