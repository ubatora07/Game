import { store } from '../../core/GameState';
import { getRankById, getNextRank } from '../../content/ranks';
import { BUILDINGS, calculateBuildingCost, getBuildingMilestoneMultiplier } from '../../content/buildings';
import { EconomyEngine } from '../../economy/EconomyEngine';
import { BigNumber } from '../../core/BigNumber';
import { adService } from '../../services/ads/AdService';
import { events } from '../../core/EventBus';
import { OfflineSystem } from '../../systems/OfflineSystem';
import { RandomEventSystem } from '../../systems/RandomEventSystem';

export class DevOverlay {
  private el: HTMLElement;
  private isExpanded: boolean = false;
  private fps: number = 60;
  private lastFpsUpdate: number = performance.now();
  private frames: number = 0;

  constructor() {
    this.el = document.createElement('div');
    this.el.id = 'devOverlay';
    this.el.style.cssText = `
      position: fixed;
      bottom: 74px;
      right: 12px;
      z-index: 999;
      font-family: monospace;
      font-size: 11px;
    `;
    this.render();
    this.bind();
  }

  public getElement(): HTMLElement {
    return this.el;
  }

  public updateFps(): void {
    this.frames++;
    const now = performance.now();
    if (now - this.lastFpsUpdate >= 1000) {
      this.fps = this.frames;
      this.frames = 0;
      this.lastFpsUpdate = now;
      const fpsEl = this.el.querySelector('#devFps');
      if (fpsEl) fpsEl.textContent = `${this.fps} FPS`;
    }
  }

  private bind(): void {
    store.subscribe(() => {
      if (this.isExpanded) {
        this.updateTelemetry();
      }
    });
  }

  private render(): void {
    this.el.innerHTML = `
      <button id="devToggleBtn" style="background:#ef4444; color:#fff; font-weight:bold; padding:var(--space-04) var(--space-08); border-radius:var(--radius-sm); border:1px solid #fff; cursor:pointer; opacity:0.85;">
        🛠️ BALANCE DEV (<span id="devFps">60 FPS</span>)
      </button>

      <div id="devPanel" style="display:none; margin-top:var(--space-06); background:rgba(15,23,42,0.96); border:1px solid #ef4444; border-radius:var(--radius-md); padding:var(--space-10); color:#fff; width:300px; max-height:480px; overflow-y:auto; box-shadow:var(--shadow-lg);">
        <div style="font-weight:bold; color:#ef4444; margin-bottom:var(--space-06); border-bottom:1px solid #333; padding-bottom:var(--space-03); display:flex; justify-content:space-between;">
          <span>⚡ LIVE BALANCE TELEMETRY</span>
        </div>

        <div id="devTelemetry" style="font-size:10px; color:#94a3b8; margin-bottom:var(--space-08); line-height:1.4; background:rgba(0,0,0,0.4); padding:var(--space-06); border-radius:var(--radius-04);">
          <!-- Populated in updateTelemetry -->
        </div>

        <div style="font-weight:bold; color:#fde047; margin-bottom:var(--space-04); font-size:10px;">⏩ TIME SKIP / FAST FORWARD</div>
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:var(--space-04); margin-bottom:var(--space-08);">
          <button id="devSkip1m" style="background:#1e293b; color:#38bdf8; border:1px solid #334155; padding:var(--space-03); border-radius:var(--radius-03); font-size:10px; cursor:pointer;">+1 Min</button>
          <button id="devSkip5m" style="background:#1e293b; color:#38bdf8; border:1px solid #334155; padding:var(--space-03); border-radius:var(--radius-03); font-size:10px; cursor:pointer;">+5 Min</button>
          <button id="devSkip15m" style="background:#1e293b; color:#38bdf8; border:1px solid #334155; padding:var(--space-03); border-radius:var(--radius-03); font-size:10px; cursor:pointer;">+15 Min</button>
          <button id="devSkip1h" style="background:#1e293b; color:#38bdf8; border:1px solid #334155; padding:var(--space-03); border-radius:var(--radius-03); font-size:10px; cursor:pointer;">+1 Hour</button>
          <button id="devSkip8h" style="background:#7c3aed; color:#fff; border:1px solid #a855f7; padding:var(--space-03); border-radius:var(--radius-03); font-size:10px; cursor:pointer;">+8h Offline</button>
          <button id="devTestAd" style="background:#059669; color:#fff; border:1px solid #10b981; padding:var(--space-03); border-radius:var(--radius-03); font-size:10px; cursor:pointer;">Test Ad</button>
        </div>

        <div style="font-weight:bold; color:#ef4444; margin-bottom:var(--space-04); font-size:10px;">🛠️ CHEATS</div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--space-04);">
          <button id="devAddGold" style="background:#334155; color:#fde047; padding:var(--space-03); border-radius:var(--radius-03); font-size:10px; cursor:pointer;">+10K Gold</button>
          <button id="devAddPower" style="background:#334155; color:#38bdf8; padding:var(--space-03); border-radius:var(--radius-03); font-size:10px; cursor:pointer;">+50K Power</button>
          <button id="devAddCrystals" style="background:#334155; color:#c084fc; padding:var(--space-03); border-radius:var(--radius-03); font-size:10px; cursor:pointer;">+500 Crystals</button>
          <button id="devAddSouls" style="background:#334155; color:#f43f5e; padding:var(--space-03); border-radius:var(--radius-03); font-size:10px; cursor:pointer;">+20 Souls</button>
          <button id="devAddEssence" style="background:#334155; color:#10b981; padding:var(--space-03); border-radius:var(--radius-03); font-size:10px; cursor:pointer;">+200 Essence</button>
          <button id="devAscendRank" style="background:#d97706; color:#fff; padding:var(--space-03); border-radius:var(--radius-03); font-size:10px; cursor:pointer;">Force Next Rank</button>
          <button id="devSpawnSpirit" style="background:#f59e0b; color:#000; font-weight:bold; padding:var(--space-03); border-radius:var(--radius-03); font-size:10px; cursor:pointer; grid-column:span 2;">✨ Spawn Spirit</button>
        </div>
      </div>
    `;

    const toggleBtn = this.el.querySelector('#devToggleBtn') as HTMLElement;
    const panel = this.el.querySelector('#devPanel') as HTMLElement;

    toggleBtn?.addEventListener('click', () => {
      this.isExpanded = !this.isExpanded;
      panel.style.display = this.isExpanded ? 'block' : 'none';
      if (this.isExpanded) this.updateTelemetry();
    });

    this.el.querySelector('#devSkip1m')?.addEventListener('click', () => this.fastForward(60));
    this.el.querySelector('#devSkip5m')?.addEventListener('click', () => this.fastForward(300));
    this.el.querySelector('#devSkip15m')?.addEventListener('click', () => this.fastForward(900));
    this.el.querySelector('#devSkip1h')?.addEventListener('click', () => this.fastForward(3600));

    this.el.querySelector('#devAddGold')?.addEventListener('click', () => {
      store.set(d => { d.gold += 10000; d.stats.lifetimeGold += 10000; });
    });

    this.el.querySelector('#devAddPower')?.addEventListener('click', () => {
      store.set(d => { d.power += 50000; d.stats.lifetimePower += 50000; });
    });

    this.el.querySelector('#devAddCrystals')?.addEventListener('click', () => {
      store.set(d => { d.crystals += 500; });
    });

    this.el.querySelector('#devAddSouls')?.addEventListener('click', () => {
      store.set(d => { d.souls += 20; });
    });

    this.el.querySelector('#devAddEssence')?.addEventListener('click', () => {
      store.set(d => { d.essence += 200; });
    });

    this.el.querySelector('#devAscendRank')?.addEventListener('click', () => {
      const next = getNextRank(store.get().rankId);
      if (next) {
        store.set(d => {
          d.rankId = next.id;
          d.rankIndex = next.index;
          d.power = Math.max(d.power, next.reqPower);
        });
      }
    });

    this.el.querySelector('#devSpawnSpirit')?.addEventListener('click', () => {
      RandomEventSystem.spawnEvent('instant_power');
    });

    this.el.querySelector('#devSkip8h')?.addEventListener('click', () => {
      const state = store.get();
      const fakeNow = state.lastSeenAt + (8 * 3600 * 1000);
      const gains = OfflineSystem.calculateOfflineGains(state, fakeNow);
      if (gains) {
        events.emit('modal:open', { modalId: 'offline_reward', data: { gains } });
      }
    });

    this.el.querySelector('#devTestAd')?.addEventListener('click', () => {
      adService.showRewardedAd('dev_test');
    });
  }

  private fastForward(seconds: number): void {
    const s = store.get();
    const metrics = EconomyEngine.calculateMetrics(s);
    const powerGained = Math.floor(metrics.passivePowerPerSec * seconds);
    const goldGained = Math.floor(metrics.passiveGoldPerSec * seconds);

    store.set((draft) => {
      draft.power += powerGained;
      draft.gold += goldGained;
      draft.stats.lifetimePower += powerGained;
      draft.stats.lifetimeGold += goldGained;
      draft.stats.playtimeSeconds += seconds;
    });
  }

  private updateTelemetry(): void {
    const s = store.get();
    const metrics = EconomyEngine.calculateMetrics(s);
    const rank = getRankById(s.rankId);
    const nextRank = getNextRank(s.rankId);

    let etaStr = 'MAX';
    if (nextRank) {
      const needed = Math.max(0, nextRank.reqPower - s.power);
      if (metrics.passivePowerPerSec > 0) {
        const secs = Math.ceil(needed / metrics.passivePowerPerSec);
        etaStr = secs < 60 ? `${secs}s` : secs < 3600 ? `${Math.floor(secs / 60)}m ${secs % 60}s` : `${(secs / 3600).toFixed(1)}h`;
      } else {
        etaStr = 'Manual click needed';
      }
    }

    // Find best ROI building
    let bestBuilding: string = 'None';
    let bestRoiVal: number = Infinity;

    for (const b of BUILDINGS) {
      if (s.rankIndex >= b.requiredRankIndex) {
        const currentOwned = s.buildings[b.id] || 0;
        const cost = calculateBuildingCost(b, currentOwned, 1, metrics.buildingCostDiscount);
        const milestoneMult = getBuildingMilestoneMultiplier(currentOwned);
        const addedPower = b.baseProduction * milestoneMult * metrics.rankMultiplier * metrics.heroPowerMultiplier * metrics.soulPowerMultiplier;
        const roi = cost / (addedPower || 1);
        if (roi < bestRoiVal) {
          bestRoiVal = roi;
          bestBuilding = `${b.nameKey} (ROI ${roi.toFixed(1)}s)`;
        }
      }
    }

    const telEl = this.el.querySelector('#devTelemetry');
    if (telEl) {
      telEl.innerHTML = `
        <div><strong>Power/s:</strong> ${BigNumber.format(metrics.passivePowerPerSec)} | <strong>Gold/s:</strong> ${BigNumber.format(metrics.passiveGoldPerSec)}</div>
        <div><strong>Click Power:</strong> ${BigNumber.format(metrics.clickPower)} | <strong>Click Gold:</strong> ${BigNumber.format(metrics.clickGold)}</div>
        <div><strong>Rank:</strong> ${rank.id} (×${metrics.rankMultiplier.toFixed(2)}) | <strong>Next ETA:</strong> ${etaStr}</div>
        <div><strong>Multipliers:</strong> Heroes ×${metrics.heroPowerMultiplier.toFixed(2)} | Souls ×${metrics.soulPowerMultiplier.toFixed(2)} | Upgrades ×${metrics.globalUpgradesMultiplier.toFixed(2)}</div>
        <div><strong>Next Best ROI:</strong> <span style="color:#10b981">${bestBuilding}</span></div>
      `;
    }
  }
}
