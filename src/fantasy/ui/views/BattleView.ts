import { store } from '../../core/FantasyState';
import { WORLDS } from '../../content/worlds';
import { CombatEngine } from '../../engine/CombatEngine';
import { UpgradeEngine } from '../../engine/UpgradeEngine';
import { WorldRenderer } from '../canvas/WorldRenderer';
import { HeroRenderer } from '../canvas/HeroRenderer';
import { EnemyRenderer } from '../canvas/EnemyRenderer';
import { VfxRenderer } from '../canvas/VfxRenderer';
import { BigNumber } from '../../core/BigNumber';

export class BattleView {
  private container: HTMLElement;
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;

  private worldRenderer: WorldRenderer = new WorldRenderer();
  private heroRenderer: HeroRenderer = new HeroRenderer();

  private worldNameEl!: HTMLElement;
  private stageNumberEl!: HTMLElement;
  private waveNodesEl!: HTMLElement;
  private bossTimerContainerEl!: HTMLElement;
  private bossTimerFillEl!: HTMLElement;
  private bossTimerTextEl!: HTMLElement;
  private dpsEl!: HTMLElement;
  private comboEl!: HTMLElement;
  private autoToggleEl!: HTMLElement;
  private retryBossBtn!: HTMLElement;

  constructor() {
    this.container = document.createElement('div');
    this.container.style.cssText = 'position:relative; width:100%; height:100%; display:flex; flex-direction:column; overflow:hidden;';

    this.buildDOM();
    VfxRenderer.init();
  }

  public getElement(): HTMLElement {
    return this.container;
  }

  public resize(): void {
    if (!this.canvas) return;
    const rect = this.container.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  public update(dt: number): void {
    this.worldRenderer.update(dt);
    this.heroRenderer.update(dt);
    VfxRenderer.update(dt);

    this.renderCanvas();
    this.updateHUD();
  }

  private renderCanvas(): void {
    if (!this.ctx || !this.canvas) return;
    const w = this.canvas.width;
    const h = this.canvas.height;

    const shake = VfxRenderer.getShakeOffset();
    this.ctx.save();
    this.ctx.translate(shake.x, shake.y);

    this.ctx.clearRect(0, 0, w, h);

    // 1. Parallax World
    this.worldRenderer.render(this.ctx, w, h);

    // 2. Hero
    this.heroRenderer.render(this.ctx, w, h);

    // 3. Enemy
    EnemyRenderer.render(this.ctx, w, h);

    // 4. VFX & Particles
    VfxRenderer.render(this.ctx);

    this.ctx.restore();
  }

  private updateHUD(): void {
    const s = store.get();
    const worldDef = WORLDS[s.world.currentWorldId] || WORLDS[1];
    const stats = UpgradeEngine.calculateStats(s);

    this.worldNameEl.textContent = worldDef.name;
    this.stageNumberEl.textContent = s.world.isFarmMode 
      ? `STAGE ${s.world.currentStageNumber} (FARM MODE)` 
      : `STAGE ${s.world.currentStageNumber}-${worldDef.maxStages}`;

    // Wave Nodes
    this.waveNodesEl.innerHTML = '';
    for (let i = 0; i < worldDef.enemiesPerStage; i++) {
      const node = document.createElement('div');
      const isCompleted = i < s.world.waveProgress;
      const isBossNode = s.world.currentStageNumber === worldDef.maxStages;
      node.className = `wave-node ${isCompleted ? 'completed' : ''} ${isBossNode && i === worldDef.enemiesPerStage - 1 ? 'boss' : ''}`;
      this.waveNodesEl.appendChild(node);
    }

    // Boss Timer
    if (s.world.isBossActive) {
      this.bossTimerContainerEl.style.display = 'flex';
      const pct = Math.max(0, s.world.bossTimeRemaining / worldDef.bossTimerSeconds);
      this.bossTimerFillEl.style.width = `${pct * 100}%`;
      this.bossTimerTextEl.textContent = `BOSS ENCOUNTER: ${Math.ceil(s.world.bossTimeRemaining)}s`;
    } else {
      this.bossTimerContainerEl.style.display = 'none';
    }

    // Retry Boss Button
    if (s.world.isFarmMode) {
      this.retryBossBtn.style.display = 'block';
    } else {
      this.retryBossBtn.style.display = 'none';
    }

    // Meta chips
    this.dpsEl.textContent = `DPS: ${BigNumber.format(stats.dps)}`;
    const combo = CombatEngine.getCombo();
    if (combo.count > 1) {
      this.comboEl.textContent = `COMBO ×${combo.count} (+${Math.round((combo.multiplier - 1) * 100)}%)`;
      this.comboEl.style.color = '#fbbf24';
    } else {
      this.comboEl.textContent = 'COMBO ×1';
      this.comboEl.style.color = 'var(--f-text-dim)';
    }

    this.autoToggleEl.textContent = `AUTO: ${s.world.autoAdvance ? 'ON' : 'OFF'}`;
  }

  private buildDOM(): void {
    // 1. Canvas Layer
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; cursor:crosshair;';
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d')!;

    // Canvas click directly strikes enemy
    this.canvas.addEventListener('pointerdown', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      this.handleAttackClick(clickX, clickY);
    });

    // 2. Overlay Container
    const overlay = document.createElement('div');
    overlay.className = 'battle-overlay-container';

    // Top Stage Title Card
    const titleCard = document.createElement('div');
    titleCard.className = 'stage-title-card';
    titleCard.innerHTML = `
      <div class="stage-world-name">GREENVALE</div>
      <div class="stage-number">STAGE 1-1</div>
      <div class="wave-nodes-bar"></div>
      <div class="boss-timer-wrap" style="display:none; flex-direction:column; align-items:center; margin-top:6px;">
        <span class="boss-timer-text" style="font-size:11px; font-weight:800; color:#ef4444; margin-bottom:2px;">BOSS ENCOUNTER: 30s</span>
        <div style="width:140px; height:6px; background:rgba(0,0,0,0.5); border-radius:3px; overflow:hidden; border:1px solid #ef4444;">
          <div class="boss-timer-fill" style="width:100%; height:100%; background:#ef4444; transition:width 0.1s linear;"></div>
        </div>
      </div>
      <button id="btn-retry-boss" style="display:none; margin-top:8px; background:#ef4444; border:1px solid #f87171; color:#fff; font-size:11px; font-weight:800; padding:4px 12px; border-radius:4px; cursor:pointer;">
        ⚔️ RETRY BOSS
      </button>
    `;
    overlay.appendChild(titleCard);

    this.worldNameEl = titleCard.querySelector('.stage-world-name')!;
    this.stageNumberEl = titleCard.querySelector('.stage-number')!;
    this.waveNodesEl = titleCard.querySelector('.wave-nodes-bar')!;
    this.bossTimerContainerEl = titleCard.querySelector('.boss-timer-wrap')!;
    this.bossTimerFillEl = titleCard.querySelector('.boss-timer-fill')!;
    this.bossTimerTextEl = titleCard.querySelector('.boss-timer-text')!;
    this.retryBossBtn = titleCard.querySelector('#btn-retry-boss')!;

    this.retryBossBtn.addEventListener('click', () => {
      CombatEngine.retryBoss();
    });

    // Center-Bottom Attack Controls
    const controls = document.createElement('div');
    controls.className = 'battle-controls-bottom';
    controls.innerHTML = `
      <button class="attack-btn">ATTACK</button>
      <div class="battle-meta-chips">
        <span class="chip-auto" style="cursor:pointer;">AUTO: ON</span>
        <span class="chip-dps">DPS: 120</span>
        <span class="chip-combo">COMBO ×1</span>
      </div>
    `;
    overlay.appendChild(controls);

    this.autoToggleEl = controls.querySelector('.chip-auto')!;
    this.dpsEl = controls.querySelector('.chip-dps')!;
    this.comboEl = controls.querySelector('.chip-combo')!;

    const attackBtn = controls.querySelector('.attack-btn')!;
    attackBtn.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      this.handleAttackClick();
    });

    this.autoToggleEl.addEventListener('click', () => {
      store.set((draft) => {
        draft.world.autoAdvance = !draft.world.autoAdvance;
      });
    });

    this.container.appendChild(overlay);

    setTimeout(() => this.resize(), 50);
  }

  private handleAttackClick(screenX?: number, screenY?: number): void {
    this.heroRenderer.triggerAttack();
    CombatEngine.performPlayerClickAttack(screenX, screenY);
  }
}
