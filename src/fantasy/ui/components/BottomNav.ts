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

  private ensureContainerPosition(): void {
    const el = this.container as HTMLElement;
    try {
      const style = getComputedStyle(el);
      if (style.position === 'static' || !style.position) {
        el.style.position = 'relative';
      }
    } catch (e) {
      // In non-browser or test environments, fallback to setting position directly
      el.style.position = 'relative';
    }
  }

  public setButtonCoordinates(
    coords: Partial<
      Record<
        FantasyTab,
        { left: number | string; top: number | string; center?: boolean }
      >
    >
  ): void {
    this.ensureContainerPosition();
    this.container.querySelectorAll('.nav-item-btn').forEach((btn) => {
      const tab = btn.getAttribute('data-tab') as FantasyTab | null;
      if (!tab) return;
      const c = coords[tab];
      const htmlBtn = btn as HTMLElement;
      if (c) {
        htmlBtn.style.position = 'absolute';
        // handle numeric (px) or string (e.g. '50%') values
        if (typeof c.left === 'number') htmlBtn.style.left = `${c.left}px`;
        else htmlBtn.style.left = String(c.left);

        if (typeof c.top === 'number') htmlBtn.style.top = `${c.top}px`;
        else htmlBtn.style.top = String(c.top);

        if (c.center) {
          htmlBtn.style.transform = 'translate(-50%, -50%)';
          // ensure transform-origin is center for consistent centering
          htmlBtn.style.transformOrigin = '50% 50%';
        } else {
          htmlBtn.style.transform = '';
          htmlBtn.style.transformOrigin = '';
        }
      } else {
        htmlBtn.style.position = '';
        htmlBtn.style.left = '';
        htmlBtn.style.top = '';
        htmlBtn.style.transform = '';
        htmlBtn.style.transformOrigin = '';
      }
    });
  }

  private buildDOM(): void {
    this.container.innerHTML = `
      <!-- Footer_frame (1954x256 at left:-12, top:842) -->
      <img src="/assets/fantasy/ui/Footer_frame.png" class="nav-footer-frame" alt="Footer Frame" />
    `;

    // Make sure container is positioned so absolute button coordinates are relative to it
    this.ensureContainerPosition();

    const defaultCoords: Partial<Record<FantasyTab, { left: number | string; top: number | string; center?: boolean }>> = {
      battle: { left: 20, top: 5 },
      hero: { left: 110, top: 12 },
      gear: { left: 200, top: 12 },
      upgrades: { left: 290, top: 12 },
      world: { left: 380, top: 12 },
    };

    // apply default coordinates so buttons are positioned immediately
    // this can be overridden later with `setButtonCoordinates` by the caller
    this.setButtonCoordinates(defaultCoords);

    const tabs: Array<{ id: FantasyTab; img: string; title: string; className: string }> = [
      { id: 'battle', img: '/assets/fantasy/ui/Battle_button.png', title: 'Battle', className: 'btn-battle' },
      { id: 'hero', img: '/assets/fantasy/ui/Hero_button.png', title: 'Hero', className: 'btn-hero' },
      { id: 'gear', img: '/assets/fantasy/ui/Gear_button.png', title: 'Gear', className: 'btn-gear' },
      { id: 'upgrades', img: '/assets/fantasy/ui/Upgrades_button.png', title: 'Upgrades', className: 'btn-upgrades' },
      { id: 'world', img: '/assets/fantasy/ui/World_button.png', title: 'World', className: 'btn-world' },
    ];

    tabs.forEach((t) => {
      const btn = document.createElement('button');
      btn.className = `nav-item-btn ${t.className} ${t.id === this.currentTab ? 'active' : ''}`;
      btn.setAttribute('data-tab', t.id);
      btn.setAttribute('title', t.title);
      btn.innerHTML = `
        <img src="${t.img}" class="nav-button-img" alt="${t.title}" />
      `;
      btn.addEventListener('click', () => {
        this.setActiveTab(t.id);
        this.onTabSelect(t.id);
      });
      this.container.appendChild(btn);
    });
  }
}
