export type FantasyTab = 'battle' | 'hero' | 'gear' | 'upgrades' | 'world';

export class BottomNav {
  private container: HTMLElement;
  private currentTab: FantasyTab = 'battle';
  private onTabSelect: (tab: FantasyTab) => void;

  constructor(onTabSelect: (tab: FantasyTab) => void) {
    this.onTabSelect = onTabSelect;
    this.container = document.createElement('nav');
    this.container.className = 'fantasy-bottom-nav';

    this.buildDOM();
  }

  public getElement(): HTMLElement {
    return this.container;
  }

  public setActiveTab(tab: FantasyTab): void {
    this.currentTab = tab;
    this.container.querySelectorAll('.nav-item-btn').forEach((btn) => {
      if (btn.getAttribute('data-tab') === tab) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  private buildDOM(): void {
    const tabs: Array<{ id: FantasyTab; label: string; icon: string }> = [
      { id: 'battle', label: 'BATTLE', icon: '⚔️' },
      { id: 'hero', label: 'HERO', icon: '👤' },
      { id: 'gear', label: 'GEAR', icon: '🎒' },
      { id: 'upgrades', label: 'UPGRADES', icon: '⚡' },
      { id: 'world', label: 'WORLD', icon: '🗺️' },
    ];

    tabs.forEach((t) => {
      const btn = document.createElement('button');
      btn.className = `nav-item-btn ${t.id === this.currentTab ? 'active' : ''}`;
      btn.setAttribute('data-tab', t.id);
      btn.innerHTML = `
        <span style="font-size:16px;">${t.icon}</span>
        <span>${t.label}</span>
      `;
      btn.addEventListener('click', () => {
        this.setActiveTab(t.id);
        this.onTabSelect(t.id);
      });
      this.container.appendChild(btn);
    });
  }
}
