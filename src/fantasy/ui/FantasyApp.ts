import { store } from '../core/FantasyState';
import { SaveEngine } from '../engine/SaveEngine';
import { OfflineEngine } from '../engine/OfflineEngine';
import { CombatEngine } from '../engine/CombatEngine';
import { TopHud } from './components/TopHud';
import { BottomNav, FantasyTab } from './components/BottomNav';
import { Modals } from './components/Modals';

import { BattleView } from './views/BattleView';
import { HeroView } from './views/HeroView';
import { GearView } from './views/GearView';
import { UpgradesView } from './views/UpgradesView';
import { WorldView } from './views/WorldView';

export class FantasyApp {
  private root: HTMLElement;
  private topHud!: TopHud;
  private bottomNav!: BottomNav;
  private viewportEl!: HTMLElement;

  private currentTab: FantasyTab = 'battle';
  private battleView!: BattleView;
  private heroView!: HeroView;
  private gearView!: GearView;
  private upgradesView!: UpgradesView;
  private worldView!: WorldView;

  private lastTime: number = performance.now();
  private isRunning: boolean = true;

  constructor(root: HTMLElement) {
    this.root = root;
    this.init();
  }

  private init(): void {
    // 1. Load Saved Game State
    const savedState = SaveEngine.load();
    if (savedState) {
      store.replace(savedState);
      
      // Calculate Offline Gains
      const offlineGains = OfflineEngine.calculateOfflineGains(savedState);
      if (offlineGains && offlineGains.goldGained > 0) {
        Modals.showOfflineRewards(offlineGains, () => {});
      }
    }

    // 2. Start Autosave
    SaveEngine.startAutoSave();

    // 3. Build DOM Shell
    this.root.innerHTML = '';
    const shell = document.createElement('div');
    shell.className = 'fantasy-shell';

    this.topHud = new TopHud(() => {
      Modals.showSettings(() => this.updateCurrentView());
    });
    shell.appendChild(this.topHud.getElement());

    this.viewportEl = document.createElement('main');
    this.viewportEl.className = 'fantasy-viewport';
    shell.appendChild(this.viewportEl);

    this.bottomNav = new BottomNav((tab) => {
      if (this.currentTab === tab && tab === 'battle') {
        this.battleView.handleAttackClick();
      } else {
        this.switchTab(tab);
      }
    });
    shell.appendChild(this.bottomNav.getElement());

    this.root.appendChild(shell);

    // 4. Instantiate Views
    this.battleView = new BattleView();
    this.heroView = new HeroView();
    this.gearView = new GearView();
    this.upgradesView = new UpgradesView();
    this.worldView = new WorldView();

    this.switchTab('battle');

    // 5. Window Resize Listener
    window.addEventListener('resize', () => {
      if (this.currentTab === 'battle') {
        this.battleView.resize();
      }
    });

    // 6. Start Loop
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  public switchTab(tab: FantasyTab): void {
    this.currentTab = tab;
    this.viewportEl.innerHTML = '';

    if (tab === 'battle') {
      this.viewportEl.appendChild(this.battleView.getElement());
      setTimeout(() => this.battleView.resize(), 20);
    } else if (tab === 'hero') {
      this.heroView.update();
      this.viewportEl.appendChild(this.heroView.getElement());
    } else if (tab === 'gear') {
      this.gearView.update();
      this.viewportEl.appendChild(this.gearView.getElement());
    } else if (tab === 'upgrades') {
      this.upgradesView.update();
      this.viewportEl.appendChild(this.upgradesView.getElement());
    } else if (tab === 'world') {
      this.worldView.update();
      this.viewportEl.appendChild(this.worldView.getElement());
    }
  }

  private updateCurrentView(): void {
    this.topHud.update();
    if (this.currentTab === 'hero') this.heroView.update();
    else if (this.currentTab === 'gear') this.gearView.update();
    else if (this.currentTab === 'upgrades') this.upgradesView.update();
    else if (this.currentTab === 'world') this.worldView.update();
  }

  private gameLoop(time: number): void {
    if (!this.isRunning) return;

    const dt = Math.min(0.1, (time - this.lastTime) / 1000);
    this.lastTime = time;

    // 1. Tick Combat Engine (Runs in background even when viewing other tabs!)
    CombatEngine.update(dt);

    // 2. Render View
    if (this.currentTab === 'battle') {
      this.battleView.update(dt);
    }
    this.topHud.update();

    requestAnimationFrame((t) => this.gameLoop(t));
  }
}
