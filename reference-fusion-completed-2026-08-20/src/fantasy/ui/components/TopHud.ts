import { store } from '../../core/FantasyState';
import { BigNumber } from '../../core/BigNumber';
import { UpgradeEngine } from '../../engine/UpgradeEngine';
import { WORLDS } from '../../content/worlds';

export class TopHud {
  private container: HTMLElement;
  private levelEl!: HTMLElement;
  private heroNameEl!: HTMLElement;
  private worldNameEl!: HTMLElement;
  private stageTextEl!: HTMLElement;
  private waveDotsEl!: HTMLElement;
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
    const worldDef = WORLDS[s.world.currentWorldId] || WORLDS[1];

    this.levelEl.textContent = `LV.${s.hero.level}`;
    this.heroNameEl.textContent = s.hero.name || 'Knight';
    this.worldNameEl.textContent = worldDef.name.toUpperCase();
    this.stageTextEl.textContent = s.world.isBossActive
      ? `STAGE ${s.world.currentWorldId}-${s.world.currentStageNumber} [BOSS]`
      : `STAGE ${s.world.currentWorldId}-${s.world.currentStageNumber}`;

    this.goldEl.textContent = BigNumber.format(s.currencies.gold);
    this.gemsEl.textContent = BigNumber.format(s.currencies.gems);
    this.powerEl.textContent = BigNumber.format(stats.totalPower);

    // Update wave dots (4 waves + 1 boss)
    const waveCount = 5;
    let dotsHtml = '';
    for (let i = 0; i < waveCount; i++) {
      const isBossDot = i === waveCount - 1;
      const isCompleted = i < s.world.waveProgress;
      const isCurrent = i === s.world.waveProgress;

      if (isBossDot) {
        dotsHtml += `<span class="hud-wave-dot boss ${isCompleted ? 'completed' : ''} ${isCurrent ? 'active pulse' : ''}" title="Boss">💀</span>`;
      } else {
        dotsHtml += `<span class="hud-wave-dot ${isCompleted ? 'completed' : ''} ${isCurrent ? 'active' : ''}"></span>`;
      }
    }
    this.waveDotsEl.innerHTML = dotsHtml;
  }

  private buildDOM(onOpenSettings: () => void): void {
    this.container.innerHTML = `
      <div class="hud-inner-wrapper">
        <!-- Left: Hero Avatar & Level -->
        <div class="hud-left-hero" title="Hero Profile">
          <div class="hud-avatar-box">
            <img class="hud-avatar-icon" src="/assets/fantasy/hero/hero_knight.png" alt="Hero" />
          </div>
          <div class="hud-hero-info">
            <span class="hud-hero-name">Knight</span>
            <span class="hud-level-badge">LV.1</span>
          </div>
        </div>

        <!-- Center: Ornate Stage / Boss Banner -->
        <div class="hud-center-banner">
          <div class="hud-world-title">GREENVALE</div>
          <div class="hud-stage-title">STAGE 1-1</div>
          <div class="hud-wave-rail"></div>
        </div>

        <!-- Right: Currencies & Settings Button -->
        <div class="hud-right-panel">
          <div class="hud-currency-slot gold" title="Gold">
            <span class="hud-curr-icon">🪙</span>
            <span class="hud-gold-val">0</span>
          </div>
          <div class="hud-currency-slot gems" title="Gems">
            <span class="hud-curr-icon">💎</span>
            <span class="hud-gems-val">0</span>
          </div>
          <div class="hud-currency-slot power" title="Total Power">
            <span class="hud-curr-icon">⚔️</span>
            <span class="hud-power-val">10</span>
          </div>
          <button class="hud-settings-btn" title="Settings & Menu" aria-label="Settings">
            <span class="hud-gear-icon">⚙️</span>
          </button>
        </div>
      </div>
    `;

    this.heroNameEl = this.container.querySelector('.hud-hero-name')!;
    this.levelEl = this.container.querySelector('.hud-level-badge')!;
    this.worldNameEl = this.container.querySelector('.hud-world-title')!;
    this.stageTextEl = this.container.querySelector('.hud-stage-title')!;
    this.waveDotsEl = this.container.querySelector('.hud-wave-rail')!;
    this.goldEl = this.container.querySelector('.hud-gold-val')!;
    this.gemsEl = this.container.querySelector('.hud-gems-val')!;
    this.powerEl = this.container.querySelector('.hud-power-val')!;

    const settingsBtn = this.container.querySelector('.hud-settings-btn')!;
    settingsBtn.addEventListener('click', onOpenSettings);
  }
}
