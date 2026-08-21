export type FantasyTab = 'battle' | 'hero' | 'gear' | 'upgrades' | 'world';

export class BottomNav {
  private container: HTMLElement;
  private footerFrame: HTMLElement;
  private currentTab: FantasyTab = 'battle';
  private onTabSelect: (tab: FantasyTab) => void;

  constructor(onTabSelect: (tab: FantasyTab) => void) {
    this.onTabSelect = onTabSelect;
    this.container = document.createElement('nav');
    this.container.className = 'fantasy-bottom-nav';

    this.footerFrame = document.createElement('div');
    this.footerFrame.className = 'fantasy-footer-frame';
    this.container.appendChild(this.footerFrame);

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
    const tabs: Array<{ id: FantasyTab; label: string; image: string }> = [
      { id: 'battle', label: 'BATTLE', image: 'battle.png' },
      { id: 'hero', label: 'HERO', image: 'hero.png' },
      { id: 'gear', label: 'GEAR', image: 'gear.png' },
      { id: 'upgrades', label: 'UPGRADES', image: 'upgrades.png' },
      { id: 'world', label: 'WORLD', image: 'world.png' },
    ];

    tabs.forEach((t) => {
      const btn = document.createElement('button');
      btn.className = `nav-item-btn ${t.id === this.currentTab ? 'active' : ''}`;
      btn.setAttribute('data-tab', t.id);
      btn.setAttribute('aria-label', t.label);
      btn.title = t.label;
      btn.innerHTML = `
        <img class="nav-btn-img" src="/assets/fantasy/ui/${t.image}" alt="${t.label}" draggable="false" />
      `;
      btn.addEventListener('click', () => {
        this.setActiveTab(t.id);
        this.onTabSelect(t.id);
      });
      this.footerFrame.appendChild(btn);
    });
  }
}
