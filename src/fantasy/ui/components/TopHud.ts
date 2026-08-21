import { store } from '../../core/FantasyState';
import { BigNumber } from '../../core/BigNumber';
import { UpgradeEngine } from '../../engine/UpgradeEngine';
import { WORLDS } from '../../content/worlds';

export class TopHud {
  private container: HTMLElement;
  private levelEl!: HTMLElement;
  private goldEl!: HTMLElement;
  private gemsEl!: HTMLElement;
  private powerEl!: HTMLElement;
  private stageTitleEl!: HTMLElement;
  private worldTitleEl!: HTMLElement;
  private waveNodesEl!: HTMLElement;

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

    if (this.levelEl) this.levelEl.textContent = `LV.${s.hero.level}`;
    if (this.goldEl) this.goldEl.textContent = BigNumber.format(s.currencies.gold);
    if (this.gemsEl) this.gemsEl.textContent = BigNumber.format(s.currencies.gems);
    if (this.powerEl) this.powerEl.textContent = BigNumber.format(stats.totalPower);

    if (this.stageTitleEl) {
      this.stageTitleEl.textContent = s.world.isFarmMode
        ? `STAGE ${s.world.currentStageNumber} (FARM)`
        : `STAGE ${s.world.currentStageNumber}-${worldDef.maxStages}`;
    }
    if (this.worldTitleEl) {
      this.worldTitleEl.textContent = worldDef.name;
    }

    if (this.waveNodesEl) {
      this.waveNodesEl.innerHTML = '';
      for (let i = 0; i < worldDef.enemiesPerStage; i++) {
        const node = document.createElement('div');
        const isCompleted = i < s.world.waveProgress;
        const isBossNode = s.world.currentStageNumber === worldDef.maxStages;
        node.className = `wave-node ${isCompleted ? 'completed' : ''} ${isBossNode && i === worldDef.enemiesPerStage - 1 ? 'boss' : ''}`;
        this.waveNodesEl.appendChild(node);
      }
    }
  }

  private buildDOM(onOpenSettings: () => void): void {
    this.container.innerHTML = `
      <!-- BG: Rectangle 1 (1920x86 at left:0, top:0) -->
      <img src="/assets/fantasy/bg/Rectangle 1.png" class="hud-brown-bg" alt="Brown BG" />

      <!-- Header_frame (1920x300 at left:0, top:0) -->
      <img src="/assets/fantasy/ui/header1 1.png" class="hud-header-frame" alt="Header Frame" />

      <!-- Left Hero Avatar (Slop_Hero_icon: 127x127 at left:60, top:106) -->
      <div class="hud-hero-avatar-wrap">
        <img src="/assets/fantasy/ui/Slop_Hero_icon.png" class="hud-hero-avatar-img" alt="Hero Avatar" />
      </div>

      <!-- Hero Upper Slot: Level & Class (left:215, top:124, width:390, height:42) -->
      <div class="hud-slot-upper">
        <span class="hud-hero-level-text">HERO LV.1</span>
        <span class="hud-hero-class-text">SWORDSMAN</span>
      </div>

      <!-- Hero Lower Slot: Power & Stats (left:215, top:178, width:390, height:42) -->
      <div class="hud-slot-lower">
        <span class="hud-hero-power-label">POWER:</span>
        <span class="hud-hero-power-val">10</span>
      </div>

      <!-- Center Stage / World Info (Inside ornate center crest: left:750, top:90, width:420) -->
      <div class="hud-center-stage">
        <div class="hud-world-title">GREENVALE</div>
        <div class="hud-stage-title">STAGE 1-1</div>
        <div class="hud-wave-nodes"></div>
      </div>

      <!-- Resource: Coin (64x64 at left:1282, top:124) -->
      <div class="hud-resource-slot gold-slot">
        <img src="/assets/fantasy/ui/Coin.png" class="hud-res-icon coin-icon" alt="Gold" />
        <span class="hud-res-value hud-gold-text">0</span>
      </div>

      <!-- Resource: Sword_Power (51x51 at left:1455, top:130) -->
      <div class="hud-resource-slot power-slot">
        <img src="/assets/fantasy/ui/Sword_Power.png" class="hud-res-icon power-icon" alt="Power" />
        <span class="hud-res-value hud-power-text">10</span>
      </div>

      <!-- Resource: Diamond (64x64 at left:1606, top:124) -->
      <div class="hud-resource-slot gems-slot">
        <img src="/assets/fantasy/ui/Diamond.png" class="hud-res-icon diamond-icon" alt="Gems" />
        <span class="hud-res-value hud-gems-text">0</span>
      </div>

      <!-- Settings_gear (96x96 at left:1788, top:108) -->
      <button class="hud-settings-btn" title="Settings">
        <img src="/assets/fantasy/ui/Settings_gear.png" class="hud-gear-icon" alt="Settings" />
      </button>
    `;

    this.levelEl = this.container.querySelector('.hud-hero-level-text')!;
    this.powerEl = this.container.querySelector('.hud-hero-power-val')!;
    this.goldEl = this.container.querySelector('.hud-gold-text')!;
    this.gemsEl = this.container.querySelector('.hud-gems-text')!;
    this.stageTitleEl = this.container.querySelector('.hud-stage-title')!;
    this.worldTitleEl = this.container.querySelector('.hud-world-title')!;
    this.waveNodesEl = this.container.querySelector('.hud-wave-nodes')!;

    const settingsBtn = this.container.querySelector('.hud-settings-btn')!;
    settingsBtn.addEventListener('click', onOpenSettings);
  }
}
