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

  private titleCardEl!: HTMLElement;
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

    const isBossActive = s.world.isBossActive;
    const isFarmMode = s.world.isFarmMode;

    if (isBossActive || isFarmMode) {
      this.titleCardEl.style.display = 'block';
    } else {
      this.titleCardEl.style.display = 'none';
    }

    // Boss Timer
    if (isBossActive) {
      this.bossTimerContainerEl.style.display = 'flex';
      const pct = Math.max(0, s.world.bossTimeRemaining / worldDef.bossTimerSeconds);
      this.bossTimerFillEl.style.width = `${pct * 100}%`;
      this.bossTimerTextEl.textContent = `⚠️ BOSS ENCOUNTER: ${Math.ceil(s.world.bossTimeRemaining)}s`;
    } else {
      this.bossTimerContainerEl.style.display = 'none';
    }

    // Retry Boss Button
    if (isFarmMode) {
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

    // Boss Alert & Retry Card
    const titleCard = document.createElement('div');
    titleCard.className = 'stage-title-card';
    titleCard.style.display = 'none';
    titleCard.innerHTML = `
      <div class="boss-timer-wrap" style="display:none; flex-direction:column; align-items:center;">
        <span class="boss-timer-text" style="font-size:12px; font-weight:900; color:#ef4444; margin-bottom:4px; text-shadow:0 2px 4px #000;">⚠️ BOSS ENCOUNTER: 30s</span>
        <div style="width:220px; height:8px; background:rgba(0,0,0,0.8); border-radius:4px; overflow:hidden; border:1.5px solid #ef4444; box-shadow:0 0 10px rgba(239,68,68,0.5);">
          <div class="boss-timer-fill" style="width:100%; height:100%; background:linear-gradient(90deg, #ef4444, #fbbf24); transition:width 0.1s linear;"></div>
        </div>
      </div>
      <button id="btn-retry-boss" style="display:none; margin-top:6px; background:linear-gradient(180deg, #dc2626, #991b1b); border:1.5px solid #f87171; color:#fff; font-size:12px; font-weight:800; padding:6px 16px; border-radius:6px; cursor:pointer; box-shadow:0 4px 12px rgba(0,0,0,0.8);">
        ⚔️ RETRY BOSS
      </button>
    `;
    overlay.appendChild(titleCard);

    this.titleCardEl = titleCard;
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
