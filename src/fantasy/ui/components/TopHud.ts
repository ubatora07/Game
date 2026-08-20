import { store } from '../../core/FantasyState';
import { BigNumber } from '../../core/BigNumber';
import { UpgradeEngine } from '../../engine/UpgradeEngine';

export class TopHud {
  private container: HTMLElement;
  private levelEl!: HTMLElement;
  private goldEl!: HTMLElement;
  private gemsEl!: HTMLElement;
  private powerEl!: HTMLElement;

  constructor(onOpenSettings: () => void) {
    this.container = document.createElement('header');
    this.container.className = 'fantasy-top-hud';

    this.buildDOM(onOpenSettings);
    this.update();
  }

  public getElement(): HTMLElement {
    return this.container;
  }

  public update(): void {
    const s = store.get();
    const stats = UpgradeEngine.calculateStats(s);

    this.levelEl.textContent = `HERO LV.${s.hero.level}`;
    this.goldEl.textContent = `${BigNumber.format(s.currencies.gold)} GOLD`;
    this.gemsEl.textContent = `${BigNumber.format(s.currencies.gems)} GEMS`;
    this.powerEl.textContent = `${BigNumber.format(stats.totalPower)} POWER`;
  }

  private buildDOM(onOpenSettings: () => void): void {
    this.container.innerHTML = `
      <div class="hud-hero-badge">
        <span style="font-size:16px;">🛡️</span>
        <span class="hud-level-text">HERO LV.1</span>
      </div>
      <div class="hud-currencies">
        <div class="hud-chip gold">
          <span>🟡</span>
          <span class="hud-gold-text">0 GOLD</span>
        </div>
        <div class="hud-chip gems">
          <span>💎</span>
          <span class="hud-gems-text">0 GEMS</span>
        </div>
        <div class="hud-chip power">
          <span>⚡</span>
          <span class="hud-power-text">10 POWER</span>
        </div>
        <button class="hud-menu-btn">MENU</button>
      </div>
    `;

    this.levelEl = this.container.querySelector('.hud-level-text')!;
    this.goldEl = this.container.querySelector('.hud-gold-text')!;
    this.gemsEl = this.container.querySelector('.hud-gems-text')!;
    this.powerEl = this.container.querySelector('.hud-power-text')!;

    const menuBtn = this.container.querySelector('.hud-menu-btn')!;
    menuBtn.addEventListener('click', onOpenSettings);
  }
}
