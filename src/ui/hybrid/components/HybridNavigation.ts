import { events } from '../../../core/EventBus';

export type HybridPrimaryTab = 'battle' | 'hero' | 'bank' | 'town' | 'world' | 'more';

export interface SubTabDefinition {
  id: string;
  label: string;
  targetScreen: string;
}

export const SUBTABS_MAP: Record<HybridPrimaryTab, SubTabDefinition[]> = {
  battle: [
    { id: 'campaign_stage', label: '⚔️ Campaign Combat', targetScreen: 'battle' },
  ],
  hero: [
    { id: 'hero_hub', label: '👤 Protagonist & Classes', targetScreen: 'hero' },
    { id: 'hero_roster', label: '🦸 Hero Roster', targetScreen: 'heroes' },
    { id: 'team_hub', label: '👥 Team Formations', targetScreen: 'team' },
  ],
  bank: [
    { id: 'inventory_all', label: '🎒 All Equipment', targetScreen: 'bank' },
  ],
  town: [
    { id: 'town_overview', label: '🏰 Settlement Buildings', targetScreen: 'settlement' },
  ],
  world: [
    { id: 'world_hub', label: '🗺️ World Exploration', targetScreen: 'world' },
    { id: 'tower', label: '🗼 Celestial Tower', targetScreen: 'tower' },
    { id: 'quests', label: '📜 Quests & Milestones', targetScreen: 'quests' },
    { id: 'expeditions', label: '🧭 Expeditions', targetScreen: 'expeditions' },
  ],
  more: [
    { id: 'sect', label: '⛩️ Sect Cultivation', targetScreen: 'sect' },
    { id: 'souls', label: '🌌 Soul Tree', targetScreen: 'souls' },
    { id: 'relics', label: '🏺 Relic Chamber', targetScreen: 'relics' },
    { id: 'dailies', label: '📅 Daily Training', targetScreen: 'dailies' },
    { id: 'summon', label: '🔮 Gacha Summon', targetScreen: 'summon' },
    { id: 'ascension', label: '⚡ Ascension', targetScreen: 'ascension' },
  ],
};

export class HybridNavigation {
  private container: HTMLElement;
  private primaryNavEl: HTMLElement;
  private subnavEl: HTMLElement;
  private activePrimaryTab: HybridPrimaryTab = 'battle';
  private activeSubtabId: string = 'campaign_stage';
  private onNavigateCallback: ((screenId: string) => void) | null = null;

  constructor() {
    this.container = document.createElement('nav');
    this.container.className = 'hybrid-nav-container';

    this.primaryNavEl = document.createElement('div');
    this.primaryNavEl.className = 'hybrid-primary-nav';

    this.subnavEl = document.createElement('div');
    this.subnavEl.className = 'hybrid-subnav';

    this.container.appendChild(this.primaryNavEl);
    this.container.appendChild(this.subnavEl);

    this.renderPrimaryNav();
    this.renderSubNav();
  }

  public getElement(): HTMLElement {
    return this.container;
  }

  public onNavigate(cb: (screenId: string) => void): void {
    this.onNavigateCallback = cb;
  }

  public setActiveScreen(screenId: string): void {
    // Find which primary tab and subtab match this screen
    for (const [primaryTab, subtabs] of Object.entries(SUBTABS_MAP)) {
      const match = subtabs.find((s) => s.targetScreen === screenId);
      if (match) {
        this.activePrimaryTab = primaryTab as HybridPrimaryTab;
        this.activeSubtabId = match.id;
        this.renderPrimaryNav();
        this.renderSubNav();
        return;
      }
    }
  }

  private renderPrimaryNav(): void {
    this.primaryNavEl.innerHTML = '';
    const tabs: Array<{ id: HybridPrimaryTab; label: string; icon: string }> = [
      { id: 'battle', label: 'Combat', icon: '⚔️' },
      { id: 'hero', label: 'Hero & Team', icon: '👤' },
      { id: 'bank', label: 'Inventory', icon: '🎒' },
      { id: 'town', label: 'Settlement', icon: '🏰' },
      { id: 'world', label: 'World & Tower', icon: '🗺️' },
      { id: 'more', label: 'More', icon: '📦' },
    ];

    tabs.forEach((tab) => {
      const btn = document.createElement('button');
      btn.className = `hybrid-nav-tab ${this.activePrimaryTab === tab.id ? 'active' : ''}`;
      btn.innerHTML = `<span>${tab.icon}</span> <span>${tab.label}</span>`;
      btn.addEventListener('click', () => {
        this.activePrimaryTab = tab.id;
        const defaultSubtab = SUBTABS_MAP[tab.id][0];
        this.activeSubtabId = defaultSubtab.id;
        this.renderPrimaryNav();
        this.renderSubNav();
        this.emitNavigation(defaultSubtab.targetScreen);
      });
      this.primaryNavEl.appendChild(btn);
    });
  }

  private renderSubNav(): void {
    this.subnavEl.innerHTML = '';
    const subtabs = SUBTABS_MAP[this.activePrimaryTab] || [];

    if (subtabs.length <= 1) {
      this.subnavEl.style.display = 'none';
      return;
    }

    this.subnavEl.style.display = 'flex';
    subtabs.forEach((sub) => {
      const btn = document.createElement('button');
      btn.className = `hybrid-subtab-btn ${this.activeSubtabId === sub.id ? 'active' : ''}`;
      btn.textContent = sub.label;
      btn.addEventListener('click', () => {
        this.activeSubtabId = sub.id;
        this.renderSubNav();
        this.emitNavigation(sub.targetScreen);
      });
      this.subnavEl.appendChild(btn);
    });
  }

  private emitNavigation(targetScreen: string): void {
    this.onNavigateCallback?.(targetScreen);
    events.emit('screen:change', { screenId: targetScreen });
  }
}
