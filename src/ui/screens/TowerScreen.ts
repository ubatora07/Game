import { store } from '../../core/GameState';
import { gameLoop } from '../../core/GameLoop';
import { towerSystem } from '../../systems/TowerSystem';
import { getWorldForFloor } from '../../content/worlds';
import { BigNumber } from '../../core/BigNumber';
import { EconomyEngine } from '../../economy/EconomyEngine';
import { t } from '../../services/i18n/I18nService';
import { events } from '../../core/EventBus';

export class TowerScreen {
  private el: HTMLElement;
  private renderedFloor: number = -1;

  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'screen-container';
    this.render();
    this.bind();
  }

  public getElement(): HTMLElement {
    return this.el;
  }

  private bind(): void {
    store.subscribe(() => this.update());
    gameLoop.addCallback(() => {
      if (this.el.isConnected) {
        this.update();
      }
    });
    document.addEventListener('i18n:change', () => this.render());
  }

  private render(): void {
    const combat = towerSystem.getCombatState();
    const world = getWorldForFloor(combat.currentFloor);
    this.renderedFloor = combat.currentFloor;

    const state = store.get();
    this.el.innerHTML = `
      <div style="padding:var(--space-16); max-width:640px; margin:0 auto; width:100%; display:flex; flex-direction:column; height:100%; justify-content:space-between;">
        <!-- Header / Challenge Info -->
        <div style="text-align:center; margin-bottom:var(--space-12);">
          <div style="display:flex; justify-content:center; align-items:center; gap:var(--space-08); margin-bottom:var(--space-04);">
            <span style="font-size:11px; background:rgba(234,179,8,0.15); border:1px solid rgba(234,179,8,0.4); color:#eab308; font-weight:bold; padding:var(--space-02) var(--space-08); border-radius:var(--radius-full);">
              🏆 ЧЕЛЛЕНДЖ-РЕЖИМ
            </span>
            <span style="font-size:11px; background:rgba(56,189,248,0.15); border:1px solid rgba(56,189,248,0.4); color:#38bdf8; font-weight:bold; padding:var(--space-02) var(--space-08); border-radius:var(--radius-full);">
              🏅 Рекорд: Этаж ${state.towerMaxFloor || 1}
            </span>
          </div>

          <div id="towerWorldName" style="font-size:12px; color:${world.accentColor}; font-weight:bold; text-transform:uppercase; letter-spacing:1px;">
            ${t(world.nameKey)}
          </div>
          <h2 style="font-family:var(--font-display); font-size:24px; color:#fde047; margin:var(--space-02) 0;">
            ${t('tower.title')} - ${t('tower.floor')} <span id="towerFloorNum">${combat.currentFloor}</span>
          </h2>
          <div id="towerBossBadge" style="display:${combat.isBoss ? 'inline-block' : 'none'}; background:#ef4444; color:#fff; font-weight:bold; font-size:11px; padding:var(--space-02) var(--space-08); border-radius:var(--radius-sm); animation:buttonReadyGlow 1s infinite;">🔥 ${t('tower.boss')}</div>
        </div>

        <!-- Meta Rewards & Milestone Banner -->
        <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(15,23,42,0.8); border:1px solid rgba(255,255,255,0.08); border-radius:var(--radius-md); padding:var(--space-06) var(--space-12); margin-bottom:var(--space-12); font-size:11px;">
          <div style="color:#94a3b8; display:flex; align-items:center; gap:var(--space-04);">
            <span>💎</span><span>Награды: Кристаллы & Эссенция</span>
          </div>
          <div style="color:#eab308; font-weight:bold;">
            🎁 Бонус каждые 5 эт.
          </div>
        </div>

        <!-- Combat Arena Stage -->
        <div id="towerArenaCard" style="
          background: ${world.bgGradient};
          border: 2px solid ${combat.isBoss ? '#ef4444' : 'var(--border-subtle)'};
          border-radius: var(--radius-lg);
          padding: var(--space-24) var(--space-16);
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          box-shadow: var(--shadow-lg);
          margin-bottom: var(--space-16);
        ">
          <!-- Combatants Row -->
          <div style="display:flex; justify-content:space-around; align-items:center; width:100%; margin-bottom:var(--space-18);">
            <!-- Player Avatar -->
            <div style="display:flex; flex-direction:column; align-items:center; gap:var(--space-06);">
              <div style="width:72px; height:72px; border-radius:50%; background:rgba(30,41,59,0.8); border:2px solid var(--color-cyan); display:flex; align-items:center; justify-content:center; font-size:36px; box-shadow:var(--glow-cyan); animation:heroFloat 3s infinite;">
                🥋
              </div>
              <div style="font-weight:bold; font-size:12px; color:var(--text-main);">${t('tower.you')}</div>
              <div id="towerPlayerDps" style="font-size:11px; color:var(--color-cyan); font-weight:bold;">${t('tower.dps_value', { value: 120 })}</div>
            </div>

            <!-- VS Badge -->
            <div style="font-family:var(--font-display); font-size:24px; color:#fde047; font-weight:900; text-shadow:0 0 10px rgba(245,158,11,0.6);">
              VS
            </div>

            <!-- Enemy Avatar -->
            <div style="display:flex; flex-direction:column; align-items:center; gap:var(--space-06);">
              <div id="towerEnemyIcon" style="width:72px; height:72px; border-radius:50%; background:rgba(30,41,59,0.8); border:2px solid ${combat.isBoss ? '#ef4444' : '#94a3b8'}; display:flex; align-items:center; justify-content:center; font-size:36px; --ui-glow-color:${combat.isBoss ? 'rgba(239,68,68,0.6)' : 'rgba(148,163,184,0.3)'}; box-shadow:var(--glow-dynamic-md); animation:heroFloat 3s infinite reverse;">
                ${combat.enemyIcon}
              </div>
              <div id="towerEnemyName" style="font-weight:bold; font-size:12px; color:var(--text-main);">${t(combat.enemyNameKey)}</div>
              <div id="towerEnemyStats" style="font-size:11px; color:#ef4444; font-weight:bold;">${t('tower.hp_value', { value: BigNumber.format(combat.enemyMaxHp) })}</div>
            </div>
          </div>

          <!-- Enemy Health Bar -->
          <div style="width:100%; max-width:400px; margin-bottom:var(--space-08);">
            <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:bold; margin-bottom:var(--space-03);">
              <span style="color:#ef4444;">${t('tower.enemy_hp')}</span>
              <span id="towerHpText" style="color:#fde047;">${BigNumber.format(combat.enemyCurrentHp)} / ${BigNumber.format(combat.enemyMaxHp)}</span>
            </div>
            <div style="width:100%; height:12px; background:rgba(15,23,42,0.9); border-radius:var(--radius-full); overflow:hidden; border:1px solid var(--border-subtle);">
              <div id="towerHpBar" style="width:${Math.max(0, (combat.enemyCurrentHp / combat.enemyMaxHp) * 100)}%; height:100%; background:linear-gradient(90deg, #ef4444, #f87171); transition:width 0.1s linear;"></div>
            </div>
          </div>

          <!-- Battle Timer -->
          <div style="font-size:11px; color:var(--text-muted);">
            Time Remaining: <span id="towerTimerText" style="color:#fde047; font-weight:bold;">12.0s</span>
          </div>
        </div>

        <!-- Controls (Auto-Climb + Farm/Push Mode) -->
        <div style="display:flex; gap:var(--space-10); margin-bottom:var(--space-16);">
          <button id="toggleAutoClimbBtn" style="
            flex:1;
            height:48px;
            background: ${combat.isAutoClimbing ? 'linear-gradient(135deg, #059669, #10b981)' : 'rgba(51,65,85,0.6)'};
            border: 1px solid ${combat.isAutoClimbing ? '#34d399' : 'var(--border-subtle)'};
            border-radius: var(--radius-md);
            color: #ffffff;
            font-weight: bold;
            font-size: 13px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--space-06);
          ">
            <span>⚔️</span>
            <span id="autoClimbText">${combat.isAutoClimbing ? t('tower.auto_climb') : 'Auto Paused'}</span>
          </button>

          <button id="toggleFarmModeBtn" style="
            flex:1;
            height:48px;
            background: ${combat.isFarmMode ? 'linear-gradient(135deg, #d97706, #f59e0b)' : 'rgba(51,65,85,0.6)'};
            border: 1px solid ${combat.isFarmMode ? '#fbbf24' : 'var(--border-subtle)'};
            border-radius: var(--radius-md);
            color: #ffffff;
            font-weight: bold;
            font-size: 13px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--space-06);
          ">
            <span>${combat.isFarmMode ? '🔄' : '🚀'}</span>
            <span id="farmModeText">${combat.isFarmMode ? 'Фарм этажа' : 'Штурм рекорда'}</span>
          </button>
        </div>
      </div>
    `;

    this.el.querySelector('#toggleAutoClimbBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      towerSystem.toggleAutoClimb();
      this.update();
    });

    this.el.querySelector('#toggleFarmModeBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      towerSystem.toggleFarmMode();
      this.update();
    });

    const enemyIcon = this.el.querySelector('#towerEnemyIcon') as HTMLElement;
    if (enemyIcon) {
      enemyIcon.style.cursor = 'pointer';
      enemyIcon.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        const damage = towerSystem.slash();
        if (damage > 0) {
          // Visual click response
          enemyIcon.style.transform = 'scale(0.8) translateY(10px)';
          setTimeout(() => {
            enemyIcon.style.transform = '';
          }, 80);

          // Spawn floating damage text
          const rect = enemyIcon.getBoundingClientRect();
          const cx = (e as MouseEvent).clientX || (rect.left + rect.width / 2);
          const cy = (e as MouseEvent).clientY || (rect.top + rect.height / 2);
          import('../vfx/FloatingNumbers').then(m => {
            m.FloatingNumbers.spawn(cx, cy, Math.floor(damage), false, '-');
          });
          
          import('../../services/audio/SoundService').then(m => m.sound.playSlash());

          this.update();
        }
      });
    }

    // Subscribe to boss events for juice
    events.on('tower:bossDefeat', () => {
      const card = this.el.querySelector('#towerArenaCard') as HTMLElement;
      if (card) {
        card.classList.add('shake-active');
        setTimeout(() => card.classList.remove('shake-active'), 200);
      }
    });
    
    events.on('tower:floorClear', () => {
      if (towerSystem.getCombatState().isBoss) {
        import('../../services/audio/SoundService').then(m => m.sound.playBossWarning());
      }
    });
  }

  public update(): void {
    const combat = towerSystem.getCombatState();
    const metrics = EconomyEngine.calculateMetrics(store.get());

    if (this.renderedFloor !== combat.currentFloor) {
      this.renderedFloor = combat.currentFloor;
      const world = getWorldForFloor(combat.currentFloor);
      const worldNameEl = this.el.querySelector('#towerWorldName') as HTMLElement;
      const bossBadgeEl = this.el.querySelector('#towerBossBadge') as HTMLElement;
      const arenaCardEl = this.el.querySelector('#towerArenaCard') as HTMLElement;

      if (worldNameEl) {
        worldNameEl.textContent = t(world.nameKey);
        worldNameEl.style.color = world.accentColor;
      }
      if (bossBadgeEl) {
        bossBadgeEl.style.display = combat.isBoss ? 'inline-block' : 'none';
      }
      if (arenaCardEl) {
        arenaCardEl.style.background = world.bgGradient;
        arenaCardEl.style.borderColor = combat.isBoss ? '#ef4444' : 'var(--border-subtle)';
      }
    }

    const floorNum = this.el.querySelector('#towerFloorNum');
    const playerDps = this.el.querySelector('#towerPlayerDps');
    const enemyIcon = this.el.querySelector('#towerEnemyIcon');
    const enemyName = this.el.querySelector('#towerEnemyName');
    const enemyStats = this.el.querySelector('#towerEnemyStats');
    const hpText = this.el.querySelector('#towerHpText');
    const hpBar = this.el.querySelector('#towerHpBar') as HTMLElement;
    const timerText = this.el.querySelector('#towerTimerText');

    if (floorNum) floorNum.textContent = String(combat.currentFloor);
    if (playerDps) playerDps.textContent = `${BigNumber.format(metrics.towerCombatPower)} DPS`;
    if (enemyIcon) enemyIcon.textContent = combat.enemyIcon;
    if (enemyName) enemyName.textContent = t(combat.enemyNameKey);
    if (enemyStats) enemyStats.textContent = t('tower.hp_value', { value: BigNumber.format(combat.enemyMaxHp) });
    if (hpText) hpText.textContent = `${BigNumber.format(combat.enemyCurrentHp)} / ${BigNumber.format(combat.enemyMaxHp)}`;

    if (hpBar) {
      const pct = Math.max(0, Math.min(100, (combat.enemyCurrentHp / combat.enemyMaxHp) * 100));
      hpBar.style.width = `${pct}%`;
    }

    if (timerText) {
      timerText.textContent = t('common.seconds_short', { seconds: combat.battleTimer.toFixed(1) });
    }

    const autoClimbBtn = this.el.querySelector('#toggleAutoClimbBtn') as HTMLElement;
    const autoClimbText = this.el.querySelector('#autoClimbText');
    if (autoClimbText) {
      autoClimbText.textContent = combat.isAutoClimbing ? t('tower.auto_climb') : 'Auto Paused';
    }
    if (autoClimbBtn) {
      autoClimbBtn.style.background = combat.isAutoClimbing ? 'linear-gradient(135deg, #059669, #10b981)' : 'rgba(51,65,85,0.6)';
      autoClimbBtn.style.borderColor = combat.isAutoClimbing ? '#34d399' : 'var(--border-subtle)';
    }
  }
}
