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
    this.canvas.width = 1920;
    this.canvas.height = 1080;
  }

  public update(dt: number): void {
    this.worldRenderer.update(dt);
    this.heroRenderer.update(dt);
    VfxRenderer.update(dt);

    this.render();
    this.updateHUD();
  }

  private render(): void {
    if (!this.ctx) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const shake = VfxRenderer.getShakeOffset();
    this.ctx.save();
    this.ctx.translate(shake.x, shake.y);

    this.worldRenderer.render(this.ctx, this.canvas.width, this.canvas.height);
    this.heroRenderer.render(this.ctx, this.canvas.width, this.canvas.height);
    EnemyRenderer.render(this.ctx, this.canvas.width, this.canvas.height);
    VfxRenderer.render(this.ctx);

    this.ctx.restore();
  }

  private updateHUD(): void {
    const s = store.get();
    const worldDef = WORLDS[s.world.currentWorldId] || WORLDS[1];
    const stats = UpgradeEngine.calculateStats(s);

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
    this.canvas.id = 'fantasyCanvas';
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

    // 2. Overlay Container (Boss timer and controls only)
    const overlay = document.createElement('div');
    overlay.className = 'battle-overlay-container';

    // Boss Timer & Retry
    const bossCard = document.createElement('div');
    bossCard.className = 'boss-status-wrap';
    bossCard.innerHTML = `
      <div class="boss-timer-wrap" style="display:none; flex-direction:column; align-items:center;">
        <span class="boss-timer-text" style="font-size:11px; font-weight:800; color:#ef4444; margin-bottom:2px;">BOSS ENCOUNTER: 30s</span>
        <div style="width:140px; height:6px; background:rgba(0,0,0,0.5); border-radius:3px; overflow:hidden; border:1px solid #ef4444;">
          <div class="boss-timer-fill" style="width:100%; height:100%; background:#ef4444; transition:width 0.1s linear;"></div>
        </div>
      </div>
      <button id="btn-retry-boss" style="display:none; margin-top:8px; background:#ef4444; border:1px solid #f87171; color:#fff; font-size:11px; font-weight:800; padding:4px 12px; border-radius:4px; cursor:pointer;">
        ⚔️ RETRY BOSS
      </button>
    `;
    overlay.appendChild(bossCard);

    this.bossTimerContainerEl = bossCard.querySelector('.boss-timer-wrap')!;
    this.bossTimerFillEl = bossCard.querySelector('.boss-timer-fill')!;
    this.bossTimerTextEl = bossCard.querySelector('.boss-timer-text')!;
    this.retryBossBtn = bossCard.querySelector('#btn-retry-boss')!;

    this.retryBossBtn.addEventListener('click', () => {
      CombatEngine.retryBoss();
    });

    // Center-Bottom Attack Controls
    const controls = document.createElement('div');
    controls.className = 'battle-controls-bottom';
    controls.innerHTML = `
      <button id="fantasyAttackBtn" class="attack-btn">ATTACK</button>
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

  public handleAttackClick(screenX?: number, screenY?: number): void {
    this.heroRenderer.triggerAttack();
    CombatEngine.performPlayerClickAttack(screenX, screenY);
  }
}
