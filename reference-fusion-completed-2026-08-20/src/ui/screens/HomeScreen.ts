import { store } from '../../core/GameState';
import { BUILDINGS, calculateBuildingCost, calculateMaxAffordableBuildings, getBuildingMilestoneMultiplier } from '../../content/buildings';
import { UPGRADES, calculateUpgradeCost } from '../../content/upgrades';
import { HeroStage } from '../components/HeroStage';
import { ParticleCanvas } from '../vfx/ParticleCanvas';
import { BigNumber } from '../../core/BigNumber';
import { EconomyEngine } from '../../economy/EconomyEngine';
import { t } from '../../services/i18n/I18nService';
import { events } from '../../core/EventBus';
import { sound } from '../../services/audio/SoundService';
import { resolveUIIcon } from '../art/runtime/UIIconRegistry';

export class HomeScreen {
  private el: HTMLElement;
  private heroStage: HeroStage;
  private buyMultiplier: 1 | 10 | 100 | 'max' = 1;
  private activeCategory: 'buildings' | 'upgrades' = 'buildings';
  private renderedCategory: string = '';
  private renderedRankIndex: number = -1;

  constructor(particleCanvas?: ParticleCanvas) {
    this.heroStage = new HeroStage(particleCanvas);
    this.el = document.createElement('div');
    this.el.className = 'screen-container';
    this.render();
    this.bind();
  }

  public getElement(): HTMLElement {
    return this.el;
  }

  private bind(): void {
    store.subscribe(() => this.updateList());
    document.addEventListener('i18n:change', () => {
      this.renderedCategory = '';
      this.renderedRankIndex = -1;
      this.render();
    });
  }

  private render(): void {
    this.el.innerHTML = `
      <div class="home-desktop-grid">
        <!-- Left Column: Buildings & Upgrades List -->
        <div class="home-col-left" id="homeLeftCol">
          <!-- Section Switcher & Multiplier Controls -->
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-10); border-bottom:1px solid var(--border-subtle); padding-bottom:var(--space-08);">
            <!-- Category Tabs -->
            <div style="display:flex; gap:var(--space-06);">
              <button id="tabBuildingsBtn" style="padding:var(--space-05) var(--space-12); font-size:12px; font-weight:bold; border-radius:var(--radius-sm); border:1px solid ${this.activeCategory === 'buildings' ? '#f59e0b' : 'var(--border-subtle)'}; background:${this.activeCategory === 'buildings' ? 'rgba(245,158,11,0.2)' : 'rgba(30,41,59,0.5)'}; color:${this.activeCategory === 'buildings' ? '#fde047' : 'var(--text-muted)'}; cursor:pointer;">
                🏯 ${t('building.title')}
              </button>
              <button id="tabUpgradesBtn" style="padding:var(--space-05) var(--space-12); font-size:12px; font-weight:bold; border-radius:var(--radius-sm); border:1px solid ${this.activeCategory === 'upgrades' ? '#38bdf8' : 'var(--border-subtle)'}; background:${this.activeCategory === 'upgrades' ? 'rgba(56,189,248,0.2)' : 'rgba(30,41,59,0.5)'}; color:${this.activeCategory === 'upgrades' ? '#7dd3fc' : 'var(--text-muted)'}; cursor:pointer;">
                ⚡ ${t('upgrade.title')}
              </button>
            </div>

            <!-- Buy Multiplier Toggles (1x / 10x / 100x / MAX) -->
            <div style="display:flex; gap:var(--space-03); background:rgba(15,23,42,0.9); padding:var(--space-02); border-radius:var(--radius-sm); border:1px solid var(--border-subtle);">
              <button class="buy-mult-btn ${this.buyMultiplier === 1 ? 'active' : ''}" data-mult="1" style="padding:var(--space-03) var(--space-07); font-size:11px; font-weight:bold; border-radius:var(--radius-04); cursor:pointer; color:${this.buyMultiplier === 1 ? '#000' : 'var(--text-muted)'}; background:${this.buyMultiplier === 1 ? '#f59e0b' : 'transparent'};">1x</button>
              <button class="buy-mult-btn ${this.buyMultiplier === 10 ? 'active' : ''}" data-mult="10" style="padding:var(--space-03) var(--space-07); font-size:11px; font-weight:bold; border-radius:var(--radius-04); cursor:pointer; color:${this.buyMultiplier === 10 ? '#000' : 'var(--text-muted)'}; background:${this.buyMultiplier === 10 ? '#f59e0b' : 'transparent'};">10x</button>
              <button class="buy-mult-btn ${this.buyMultiplier === 100 ? 'active' : ''}" data-mult="100" style="padding:var(--space-03) var(--space-07); font-size:11px; font-weight:bold; border-radius:var(--radius-04); cursor:pointer; color:${this.buyMultiplier === 100 ? '#000' : 'var(--text-muted)'}; background:${this.buyMultiplier === 100 ? '#f59e0b' : 'transparent'};">100x</button>
              <button class="buy-mult-btn ${this.buyMultiplier === 'max' ? 'active' : ''}" data-mult="max" style="padding:var(--space-03) var(--space-07); font-size:11px; font-weight:bold; border-radius:var(--radius-04); cursor:pointer; color:${this.buyMultiplier === 'max' ? '#000' : 'var(--text-muted)'}; background:${this.buyMultiplier === 'max' ? '#f59e0b' : 'transparent'};">${t('btn.max')}</button>
            </div>
          </div>

          <!-- Dynamic List Container -->
          <div id="homeListContainer" style="display:flex; flex-direction:column; gap:var(--space-08); padding-bottom:var(--space-16);">
            <!-- Rendered Items -->
          </div>
        </div>

        <!-- Center Column: Hero Stage & Core Action -->
        <div class="home-col-center" id="homeHeroCol">
          <!-- HeroStage attached here -->
        </div>

        <!-- Right Column: Quick Quests & Info -->
        <div class="home-col-right" id="homeRightCol" style="gap:var(--space-12);">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-subtle); padding-bottom:var(--space-06);">
            <div style="font-weight:bold; font-size:14px; color:#38bdf8;">
              📜 ${t('quest.title')}
            </div>
            <button id="viewAllQuestsBtn" style="font-size:11px; color:var(--color-gold); font-weight:bold; cursor:pointer;">
              View All ➔
            </button>
          </div>
          <div id="homeQuickQuests" style="display:flex; flex-direction:column; gap:var(--space-06);">
            <!-- Mini quest list -->
          </div>

          <div style="margin-top:auto; background:rgba(30,41,59,0.5); border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:var(--space-10); text-align:center;">
            <div style="font-size:11px; color:var(--text-muted);">${t('app.subtitle')}</div>
            <div style="font-size:10px; color:#94a3b8; margin-top:var(--space-02);">Yandex Games Edition</div>
          </div>
        </div>
      </div>
    `;

    // Attach Hero Stage
    const heroCol = this.el.querySelector('#homeHeroCol');
    if (heroCol) {
      heroCol.appendChild(this.heroStage.getElement());
    }

    // Bind Category switchers
    this.el.querySelector('#tabBuildingsBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      if (this.activeCategory !== 'buildings') {
        this.activeCategory = 'buildings';
        this.renderedCategory = '';
        this.render();
      }
    });

    this.el.querySelector('#tabUpgradesBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      if (this.activeCategory !== 'upgrades') {
        this.activeCategory = 'upgrades';
        this.renderedCategory = '';
        this.render();
      }
    });

    this.el.querySelector('#viewAllQuestsBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      events.emit('screen:change', { screenId: 'quests' });
    });

    // Bind buy multipliers
    this.el.querySelectorAll('.buy-mult-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const target = e.currentTarget as HTMLElement;
        const val = target.getAttribute('data-mult');
        this.buyMultiplier = val === 'max' ? 'max' : (Number(val) as 1 | 10 | 100);
        this.renderedCategory = '';
        this.render();
      });
    });

    this.buildListDOM();
    this.updateList();
  }

  private buildListDOM(): void {
    const list = this.el.querySelector('#homeListContainer');
    if (!list) return;

    const s = store.get();
    this.renderedCategory = this.activeCategory;
    this.renderedRankIndex = s.rankIndex;
    list.innerHTML = '';

    if (this.activeCategory === 'buildings') {
      BUILDINGS.forEach((building) => {
        if (s.rankIndex < building.requiredRankIndex) return;

        const card = document.createElement('div');
        card.className = 'building-card';
        card.id = `bcard_${building.id}`;
        card.style.cssText = `
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(17, 24, 39, 0.85);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: var(--space-08) var(--space-12);
          transition: all 0.15s ease;
        `;

        card.innerHTML = `
          <div style="display:flex; align-items:center; gap:var(--space-10); flex:1;">
            <div style="font-size:24px; width:38px; height:38px; display:flex; align-items:center; justify-content:center; background:rgba(30,41,59,0.7); border-radius:var(--radius-sm); border:1px solid var(--border-subtle);">
              ${resolveUIIcon(`building_${building.id}`).fallbackSvg}
            </div>
            <div style="flex:1;">
              <div style="display:flex; align-items:center; justify-content:space-between; margin-right:var(--space-08);">
                <span style="font-weight:bold; font-size:13px; color:var(--text-main);">
                  ${t(building.nameKey)} <span class="b-owned" style="font-size:12px; color:#fde047; font-weight:bold;">×0</span>
                </span>
                <span class="b-contrib" style="font-size:10px; color:#38bdf8; font-weight:bold;"></span>
              </div>
              <div style="font-size:11px; color:var(--text-muted); display:flex; gap:var(--space-06);">
                <span class="b-rate">+0/s</span>
                <span class="b-milestone" style="color:#10b981; font-weight:bold;"></span>
              </div>
            </div>
          </div>

          <button class="buy-building-action-btn" data-building-id="${building.id}" style="
            min-width: 84px;
            height: 38px;
            background: rgba(51, 65, 85, 0.5);
            border: 1px solid transparent;
            border-radius: var(--radius-sm);
            color: #64748b;
            font-weight: bold;
            font-size: 11px;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          ">
            <span class="btn-count">+1</span>
            <span class="btn-cost" style="font-size:10px;">🪙 0</span>
          </button>
        `;

        const btn = card.querySelector('.buy-building-action-btn') as HTMLElement;
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.executeBuildingPurchase(building.id);
        });

        list.appendChild(card);
      });
    } else {
      UPGRADES.forEach((upg) => {
        if (s.rankIndex < upg.requiredRankIndex) return;

        const card = document.createElement('div');
        card.className = 'upgrade-card';
        card.id = `ucard_${upg.id}`;
        card.style.cssText = `
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(17, 24, 39, 0.85);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: var(--space-08) var(--space-12);
        `;

        card.innerHTML = `
          <div style="display:flex; align-items:center; gap:var(--space-10);">
            <div style="font-size:22px; width:36px; height:36px; display:flex; align-items:center; justify-content:center; background:rgba(30,41,59,0.7); border-radius:var(--radius-sm);">
              ${upg.icon}
            </div>
            <div>
              <div style="font-weight:bold; font-size:12px; color:var(--text-main);">
                ${t(upg.nameKey)} <span class="u-lvl" style="font-size:11px; color:#38bdf8;">Lv.0/${upg.maxLevel}</span>
              </div>
              <div style="font-size:10px; color:var(--text-muted);">
                ${t(upg.descKey)}
              </div>
            </div>
          </div>

          <button class="buy-upg-action-btn" data-upgrade-id="${upg.id}" style="
            min-width: 80px;
            height: 36px;
            background: rgba(51, 65, 85, 0.5);
            border: 1px solid transparent;
            border-radius: var(--radius-sm);
            color: #64748b;
            font-weight: bold;
            font-size: 11px;
            cursor: pointer;
          ">
            <span class="u-cost">🪙 0</span>
          </button>
        `;

        const btn = card.querySelector('.buy-upg-action-btn') as HTMLElement;
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.executeUpgradePurchase(upg.id);
        });

        list.appendChild(card);
      });
    }
  }

  private executeBuildingPurchase(buildingId: string): void {
    const s = store.get();
    const b = BUILDINGS.find((item) => item.id === buildingId);
    if (!b) return;

    const metrics = EconomyEngine.calculateMetrics(s);
    const discount = metrics.buildingCostDiscount || 0;
    const currentOwned = s.buildings[b.id] || 0;
    let buyCount = 1;
    let totalCost = 0;

    if (this.buyMultiplier === 1) {
      buyCount = 1;
      totalCost = calculateBuildingCost(b, currentOwned, 1, discount);
    } else if (this.buyMultiplier === 10) {
      buyCount = 10;
      totalCost = calculateBuildingCost(b, currentOwned, 10, discount);
    } else if (this.buyMultiplier === 100) {
      buyCount = 100;
      totalCost = calculateBuildingCost(b, currentOwned, 100, discount);
    } else {
      const maxInfo = calculateMaxAffordableBuildings(b, currentOwned, s.gold, discount);
      buyCount = maxInfo.count;
      totalCost = maxInfo.totalCost;
    }

    if (buyCount > 0 && s.gold >= totalCost && totalCost > 0) {
      store.set((draft) => {
        draft.gold -= totalCost;
        draft.buildings[b.id] = (draft.buildings[b.id] || 0) + buyCount;
        draft.stats.totalBuildingsOwned += buyCount;
      });
      sound.playUpgrade();
      events.emit('building:buy', { buildingId: b.id, count: buyCount, totalCost });
    }
  }

  private executeUpgradePurchase(upgradeId: string): void {
    const s = store.get();
    const upg = UPGRADES.find((item) => item.id === upgradeId);
    if (!upg) return;

    const currentLvl = s.upgrades[upg.id] || 0;
    if (currentLvl >= upg.maxLevel) return;

    const cost = calculateUpgradeCost(upg, currentLvl);
    if (s.gold >= cost) {
      store.set((draft) => {
        draft.gold -= cost;
        draft.upgrades[upg.id] = currentLvl + 1;
      });
      sound.playUpgrade();
      events.emit('upgrade:buy', { upgradeId: upg.id, newLevel: currentLvl + 1, cost });
    }
  }

  private updateList(): void {
    const s = store.get();

    // If rank changed or category changed, rebuild list structure
    if (this.renderedCategory !== this.activeCategory || this.renderedRankIndex !== s.rankIndex) {
      this.buildListDOM();
    }

    const metrics = EconomyEngine.calculateMetrics(s);
    const discount = metrics.buildingCostDiscount || 0;

    if (this.activeCategory === 'buildings') {
      BUILDINGS.forEach((building) => {
        const card = this.el.querySelector(`#bcard_${building.id}`);
        if (!card) return;

        const currentOwned = s.buildings[building.id] || 0;
        let buyCount = 1;
        let totalCost = 0;

        if (this.buyMultiplier === 1) {
          buyCount = 1;
          totalCost = calculateBuildingCost(building, currentOwned, 1, discount);
        } else if (this.buyMultiplier === 10) {
          buyCount = 10;
          totalCost = calculateBuildingCost(building, currentOwned, 10, discount);
        } else if (this.buyMultiplier === 100) {
          buyCount = 100;
          totalCost = calculateBuildingCost(building, currentOwned, 100, discount);
        } else {
          const maxInfo = calculateMaxAffordableBuildings(building, currentOwned, s.gold, discount);
          buyCount = Math.max(1, maxInfo.count);
          totalCost = maxInfo.totalCost > 0 ? maxInfo.totalCost : calculateBuildingCost(building, currentOwned, 1, discount);
        }

        const canAfford = s.gold >= totalCost && totalCost > 0;
        const detail = metrics.buildingDetails[building.id];
        const milestoneMult = getBuildingMilestoneMultiplier(currentOwned);

        const ownedEl = card.querySelector('.b-owned') as HTMLElement;
        const contribEl = card.querySelector('.b-contrib') as HTMLElement;
        const rateEl = card.querySelector('.b-rate') as HTMLElement;
        const milestoneEl = card.querySelector('.b-milestone') as HTMLElement;
        const btnCountEl = card.querySelector('.btn-count') as HTMLElement;
        const btnCostEl = card.querySelector('.btn-cost') as HTMLElement;
        const btn = card.querySelector('.buy-building-action-btn') as HTMLElement;

        if (ownedEl) ownedEl.innerText = `×${currentOwned}`;
        if (contribEl) contribEl.innerText = detail && detail.contributionPct > 0 ? `${detail.contributionPct}%` : '';
        if (rateEl) rateEl.innerText = `+${BigNumber.format(detail ? detail.totalBuildingPowerPerSec : building.baseProduction * milestoneMult)}/s`;
        if (milestoneEl) milestoneEl.innerText = milestoneMult > 1 ? `(×${milestoneMult.toFixed(1)})` : '';
        if (btnCountEl) btnCountEl.innerText = `+${buyCount}`;
        if (btnCostEl) btnCostEl.innerText = `🪙 ${BigNumber.format(totalCost)}`;

        if (btn) {
          btn.style.background = canAfford ? 'linear-gradient(135deg, #d97706, #f59e0b)' : 'rgba(51, 65, 85, 0.5)';
          btn.style.borderColor = canAfford ? '#fde047' : 'transparent';
          btn.style.color = canAfford ? '#ffffff' : '#64748b';
          btn.style.animation = canAfford ? 'buttonReadyGlow 2s infinite' : 'none';
        }
      });
    } else {
      UPGRADES.forEach((upg) => {
        const card = this.el.querySelector(`#ucard_${upg.id}`);
        if (!card) return;

        const currentLvl = s.upgrades[upg.id] || 0;
        const isMax = currentLvl >= upg.maxLevel;
        const cost = calculateUpgradeCost(upg, currentLvl);
        const canAfford = !isMax && s.gold >= cost;

        const lvlEl = card.querySelector('.u-lvl') as HTMLElement;
        const costEl = card.querySelector('.u-cost') as HTMLElement;
        const btn = card.querySelector('.buy-upg-action-btn') as HTMLElement;

        if (lvlEl) lvlEl.innerText = `Lv.${currentLvl}/${upg.maxLevel}`;
        if (costEl) costEl.innerText = isMax ? 'MAX' : `🪙 ${BigNumber.format(cost)}`;

        if (btn) {
          btn.style.background = isMax ? 'rgba(30,41,59,0.5)' : canAfford ? 'linear-gradient(135deg, #0284c7, #38bdf8)' : 'rgba(51, 65, 85, 0.5)';
          btn.style.borderColor = canAfford ? '#7dd3fc' : 'transparent';
          btn.style.color = isMax ? '#64748b' : canAfford ? '#ffffff' : '#64748b';
          btn.style.animation = canAfford && !isMax ? 'buttonReadyGlow 2s infinite' : 'none';
        }
      });
    }
  }
}
