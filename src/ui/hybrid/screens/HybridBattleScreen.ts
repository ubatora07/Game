import { CombatViewModel } from '../adapters/CombatViewModel';
import { craftingEquipmentSystem } from '../../../systems/CraftingEquipmentSystem';
import { FloatingNumbers } from '../../vfx/FloatingNumbers';

export class HybridBattleScreen {
  private container: HTMLElement;
  private playerStatsEl!: HTMLElement;
  private centerBattleEl!: HTMLElement;
  private combatLogEl!: HTMLElement;
  private logs: string[] = [];

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'hybrid-combat-layout';

    this.buildDOM();
    this.bindEvents();
  }

  public getElement(): HTMLElement {
    return this.container;
  }

  public update(): void {
    const data = CombatViewModel.getData();
    this.updatePlayerStats(data);
    this.updateCenterBattle(data);
  }

  public addLogEntry(entry: string): void {
    this.logs.unshift(entry);
    if (this.logs.length > 50) this.logs.pop();
    this.renderLog();
  }

  private buildDOM(): void {
    this.container.innerHTML = '';

    // Left Panel: Player Combat Stats & Equipment
    this.playerStatsEl = document.createElement('div');
    this.playerStatsEl.className = 'hybrid-panel';
    this.container.appendChild(this.playerStatsEl);

    // Center Panel: Battlefield, Monsters, Boss, Controls
    this.centerBattleEl = document.createElement('div');
    this.centerBattleEl.className = 'hybrid-panel';
    this.centerBattleEl.style.position = 'relative';
    this.container.appendChild(this.centerBattleEl);

    // Right Panel: Combat & Loot Log
    this.combatLogEl = document.createElement('div');
    this.combatLogEl.className = 'hybrid-panel';
    this.container.appendChild(this.combatLogEl);

    const data = CombatViewModel.getData();
    this.updatePlayerStats(data);
    this.updateCenterBattle(data);
    this.renderLog();
  }

  private updatePlayerStats(data: any): void {
    const equippedWeapon = craftingEquipmentSystem.getEquippedItem('char_1', 'weapon');
    const equippedArmor = craftingEquipmentSystem.getEquippedItem('char_1', 'armor');
    const equippedAccessory = craftingEquipmentSystem.getEquippedItem('char_1', 'accessory');

    this.playerStatsEl.innerHTML = `
      <div class="hybrid-panel-header">
        <span>👤 PROTAGONIST</span>
        <span style="color:var(--hybrid-gold);">World ${data.worldId}</span>
      </div>
      <div class="hybrid-stat-row">
        <span class="hybrid-stat-label">Total Power</span>
        <span class="hybrid-stat-value" style="color:var(--hybrid-power);">${data.playerFormattedPower}</span>
      </div>
      <div class="hybrid-stat-row">
        <span class="hybrid-stat-label">Current World</span>
        <span class="hybrid-stat-value">${data.worldName}</span>
      </div>
      <div class="hybrid-stat-row">
        <span class="hybrid-stat-label">Stage</span>
        <span class="hybrid-stat-value" style="color:var(--hybrid-gold);">${data.stageId}</span>
      </div>

      <div style="margin-top: var(--space-16);">
        <div class="hybrid-panel-header"><span>⚔️ EQUIPPED GEAR</span></div>
        <div class="hybrid-stat-row">
          <span class="hybrid-stat-label">Weapon</span>
          <span class="hybrid-stat-value" style="color:var(--hybrid-accent);">${equippedWeapon ? equippedWeapon.name : '<i style="color:var(--hybrid-text-muted);">None</i>'}</span>
        </div>
        <div class="hybrid-stat-row">
          <span class="hybrid-stat-label">Armor</span>
          <span class="hybrid-stat-value" style="color:var(--hybrid-accent);">${equippedArmor ? equippedArmor.name : '<i style="color:var(--hybrid-text-muted);">None</i>'}</span>
        </div>
        <div class="hybrid-stat-row">
          <span class="hybrid-stat-label">Accessory</span>
          <span class="hybrid-stat-value" style="color:var(--hybrid-accent);">${equippedAccessory ? equippedAccessory.name : '<i style="color:var(--hybrid-text-muted);">None</i>'}</span>
        </div>
      </div>
    `;
  }

  private updateCenterBattle(data: any): void {
    const progressPct = Math.round((data.enemiesDefeatedInStage / Math.max(1, data.totalEnemiesInStage)) * 100);

    let contentHtml = `
      <div class="hybrid-panel-header">
        <span>⚔️ BATTLEFIELD — ${data.worldName} (STAGE ${data.stageId})</span>
        <span>${data.isBossStage ? '👹 BOSS STAGE' : '🌱 REGULAR STAGE'}</span>
      </div>

      <!-- Stage Progress -->
      <div style="font-size:12px; display:flex; justify-content:space-between; margin-bottom:var(--space-04);">
        <span style="color:var(--hybrid-text-dim);">Wave Progress</span>
        <span style="font-weight:600;">${data.enemiesDefeatedInStage} / ${data.totalEnemiesInStage}</span>
      </div>
      <div class="hybrid-bar-container">
        <div class="hybrid-bar-fill timer-bar" style="width: ${progressPct}%"></div>
      </div>
    `;

    if (data.isBossEncounter && data.bossName) {
      const bossHpPct = Math.round((data.bossHp / Math.max(1, data.bossMaxHp)) * 100);
      contentHtml += `
        <div style="background:rgba(239,68,68,0.1); border:1px solid #ef4444; border-radius:var(--radius-06); padding:var(--space-12); margin-bottom:var(--space-12);">
          <div style="font-size:14px; font-weight:700; color:#f87171; display:flex; justify-content:space-between;">
            <span>👹 ${data.bossName}</span>
            <span>⏱️ ${data.bossTimerRemaining.toFixed(1)}s</span>
          </div>
          <div class="hybrid-bar-container" style="margin-top:var(--space-06);">
            <div class="hybrid-bar-fill boss-hp" style="width: ${bossHpPct}%"></div>
          </div>
        </div>
      `;
    }

    // Tap Arena Zone
    contentHtml += `
      <div id="hybridTapArea" style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; background:rgba(0,0,0,0.3); border:2px dashed var(--hybrid-border); border-radius:var(--radius-08); cursor:pointer; min-height:180px; margin-bottom:var(--space-12); transition:border-color 0.15s;">
        <div style="font-size:36px; animation:heroFloat 2s infinite ease-in-out;">🥋</div>
        <div style="font-weight:700; font-size:14px; color:#f8fafc; margin-top:var(--space-08);">CLICK / TAP TO STRIKE</div>
        <div style="font-size:11px; color:var(--hybrid-text-muted);">Deal instant manual strike damage</div>
      </div>

      <!-- Controls -->
      <div style="display:flex; gap:var(--space-08);">
        <button id="toggleAutoAdvanceBtn" style="flex:1; padding:var(--space-10); background:${data.autoAdvance ? 'var(--hybrid-green)' : 'var(--hybrid-bg-secondary)'}; color:${data.autoAdvance ? '#111' : '#cbd5e1'}; font-weight:700; font-size:12px; border:1px solid var(--hybrid-border); border-radius:var(--radius-06); cursor:pointer;">
          ${data.autoAdvance ? '⚡ Auto-Advance: ON' : '⏸️ Auto-Advance: OFF'}
        </button>
        ${data.isBossFailed ? `<button id="retryBossBtn" style="flex:1; padding:var(--space-10); background:var(--hybrid-gold); color:#111; font-weight:700; font-size:12px; border:none; border-radius:var(--radius-06); cursor:pointer;">🔁 Retry Boss</button>` : ''}
      </div>
    `;

    this.centerBattleEl.innerHTML = contentHtml;
  }

  private renderLog(): void {
    let logContent = `
      <div class="hybrid-panel-header">
        <span>📜 COMBAT & LOOT LOG</span>
        <span style="font-size:10px; color:var(--hybrid-text-muted);">${this.logs.length} entries</span>
      </div>
      <div style="flex:1; overflow-y:auto; display:flex; flex-direction:column; gap:var(--space-04); font-size:11px;">
    `;

    if (this.logs.length === 0) {
      logContent += `<div style="color:var(--hybrid-text-muted); padding:var(--space-16) 0; text-align:center;">Engage combat to record loot and progress...</div>`;
    } else {
      this.logs.forEach((log) => {
        logContent += `<div style="padding:var(--space-04) var(--space-06); border-bottom:1px solid rgba(255,255,255,0.03); color:var(--hybrid-text-dim);">${log}</div>`;
      });
    }

    logContent += `</div>`;
    this.combatLogEl.innerHTML = logContent;
  }

  private bindEvents(): void {
    this.container.addEventListener('click', (e) => {
      const tapArea = (e.target as HTMLElement).closest('#hybridTapArea');
      if (tapArea) {
        const attackResult = CombatViewModel.manualAttack(e.clientX, e.clientY);
        FloatingNumbers.spawn(e.clientX || 200, e.clientY || 300, attackResult.damage, attackResult.isCrit);
        this.addLogEntry(`⚡ Struck enemy for <span style="color:var(--hybrid-gold); font-weight:600;">+${attackResult.damage}</span> damage!`);
        return;
      }

      const autoBtn = (e.target as HTMLElement).closest('#toggleAutoAdvanceBtn');
      if (autoBtn) {
        const isAuto = CombatViewModel.toggleAutoAdvance();
        this.addLogEntry(`ℹ️ Auto-Advance set to <strong>${isAuto ? 'ON' : 'OFF'}</strong>`);
        this.update();
        return;
      }

      const retryBtn = (e.target as HTMLElement).closest('#retryBossBtn');
      if (retryBtn) {
        CombatViewModel.retryBoss();
        this.addLogEntry(`🔁 Re-entering Boss encounter!`);
        this.update();
        return;
      }
    });
  }
}
