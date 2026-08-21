import { store } from '../../core/FantasyState';
import { BigNumber } from '../../core/BigNumber';
import { UpgradeEngine } from '../../engine/UpgradeEngine';
import { Modals } from '../components/Modals';

export class HeroView {
  private container: HTMLElement;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'fantasy-tab-screen';

    this.render();
  }

  public getElement(): HTMLElement {
    return this.container;
  }

  public update(): void {
    this.render();
  }

  private render(): void {
    const s = store.get();
    const stats = UpgradeEngine.calculateStats(s);

    const xpPct = Math.min(100, Math.round((s.hero.xp / s.hero.xpToNext) * 100));

    this.container.innerHTML = `
      <!-- Hero Summary Card -->
      <div class="fantasy-card gold-trim" style="display:flex; align-items:center; gap:var(--f-space-md);">
        <div style="width:64px; height:64px; background:var(--f-bg-darker); border:2px solid var(--f-border-gold); border-radius:var(--f-radius-md); display:flex; align-items:center; justify-content:center; font-size:32px;">
          🛡️
        </div>
        <div style="flex:1;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <h2 style="font-size:16px; color:var(--f-gold-bright);">${s.hero.name}</h2>
            <span style="font-size:13px; font-weight:800; color:var(--f-power);">${BigNumber.format(stats.totalPower)} POWER</span>
          </div>
          <div style="font-size:12px; color:var(--f-text-dim); margin-top:2px;">
            Level ${s.hero.level} Paladin
          </div>
          <!-- XP Bar -->
          <div style="margin-top:6px; width:100%; height:8px; background:var(--f-bg-darker); border-radius:4px; overflow:hidden; border:1px solid var(--f-border-subtle);">
            <div style="width:${xpPct}%; height:100%; background:linear-gradient(90deg, #3b82f6, #60a5fa); transition:width 0.2s;"></div>
          </div>
          <div style="font-size:10px; color:var(--f-text-muted); margin-top:2px; text-align:right;">
            XP: ${BigNumber.format(s.hero.xp)} / ${BigNumber.format(s.hero.xpToNext)} (${xpPct}%)
          </div>
        </div>
      </div>

      <!-- Attributes & Stats -->
      <div class="fantasy-card">
        <h3 style="font-size:14px; color:var(--f-gold-bright); margin-bottom:var(--f-space-sm); border-bottom:1px solid var(--f-border-subtle); padding-bottom:4px;">
          COMBAT ATTRIBUTES
        </h3>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:13px;">
          <div style="display:flex; justify-content:space-between;">
            <span style="color:var(--f-text-dim);">Hero Damage:</span>
            <span style="font-weight:700;">${BigNumber.format(stats.heroDamage)}</span>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span style="color:var(--f-text-dim);">Click Strike:</span>
            <span style="font-weight:700; color:var(--f-gold-bright);">${BigNumber.format(stats.clickDamage)}</span>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span style="color:var(--f-text-dim);">Attack Speed:</span>
            <span style="font-weight:700;">${stats.attacksPerSecond} /s</span>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span style="color:var(--f-text-dim);">Crit Chance:</span>
            <span style="font-weight:700; color:var(--f-gems);">${BigNumber.formatPercent(stats.critChance)}</span>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span style="color:var(--f-text-dim);">Gold Multiplier:</span>
            <span style="font-weight:700; color:var(--f-gold-bright);">${stats.goldFindMultiplier}x</span>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span style="color:var(--f-text-dim);">DPS:</span>
            <span style="font-weight:700; color:var(--f-power);">${BigNumber.format(stats.dps)}</span>
          </div>
        </div>
      </div>

      <!-- Lifetime Stats & Legacy Trigger -->
      <div class="fantasy-card" style="display:flex; flex-direction:column; gap:8px;">
        <h3 style="font-size:14px; color:var(--f-legacy); border-bottom:1px solid var(--f-border-subtle); padding-bottom:4px;">
          LIFETIME RECORD & LEGACY
        </h3>
        <div style="font-size:12px; color:var(--f-text-dim); display:flex; flex-direction:column; gap:4px;">
          <div style="display:flex; justify-content:space-between;">
            <span>Lifetime Gold Earned:</span>
            <span style="color:var(--f-gold-bright); font-weight:700;">${BigNumber.format(s.currencies.lifetimeGold)}</span>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span>Total Enemies Slain:</span>
            <span style="font-weight:700;">${BigNumber.format(s.currencies.lifetimeKills)}</span>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span>Bosses Defeated:</span>
            <span style="font-weight:700; color:var(--f-power);">${BigNumber.format(s.currencies.lifetimeBossKills)}</span>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span>Legacies Begun:</span>
            <span style="font-weight:700; color:var(--f-legacy);">${s.legacy.legacyCount}</span>
          </div>
        </div>
        <button id="btn-open-legacy-view" class="attack-btn" style="margin-top:8px; padding:10px 0; font-size:13px; background:linear-gradient(180deg, #7e22ce, #581c87); border-color:#a855f7;">
          👑 OPEN LEGACY PRESTIGE (${BigNumber.format(s.currencies.legacyPoints)} LP)
        </button>
      </div>
    `;

    this.container.querySelector('#btn-open-legacy-view')!.addEventListener('click', () => {
      Modals.showLegacyModal(() => this.render());
    });
  }
}
