import { store } from '../../core/FantasyState';
import { HERO_UPGRADES, UpgradeId } from '../../content/upgrades';
import { UpgradeEngine } from '../../engine/UpgradeEngine';
import { BigNumber } from '../../core/BigNumber';
import { AudioEngine } from '../../engine/AudioEngine';

export class UpgradesView {
  private container: HTMLElement;
  private multiplierMode: '1' | '10' | '100' | 'max' = '1';

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
    const upgradeIds: UpgradeId[] = ['damage', 'click_damage', 'attack_speed', 'crit_chance', 'gold_find'];

    this.container.innerHTML = `
      <!-- Multiplier Bar -->
      <div style="display:flex; justify-content:space-between; align-items:center; background:var(--f-bg-panel); border:1px solid var(--f-border-subtle); border-radius:var(--f-radius-md); padding:6px 12px;">
        <span style="font-size:12px; font-weight:700; color:var(--f-gold-bright);">BUY MULTIPLIER:</span>
        <div style="display:flex; gap:6px;">
          ${['1', '10', '100', 'max'].map((m) => `
            <button class="btn-mult ${this.multiplierMode === m ? 'active' : ''}" data-mult="${m}" style="background:${this.multiplierMode === m ? 'var(--f-gold)' : 'var(--f-bg-card)'}; color:${this.multiplierMode === m ? '#000' : '#fff'}; border:1px solid var(--f-border-subtle); border-radius:4px; font-size:11px; font-weight:800; padding:4px 10px; cursor:pointer;">
              ${m === 'max' ? 'MAX' : `x${m}`}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Upgrades Cards List -->
      <div style="display:flex; flex-direction:column; gap:8px;">
        ${upgradeIds.map((id) => this.renderUpgradeCard(id)).join('')}
      </div>
    `;

    // Bind multiplier buttons
    this.container.querySelectorAll('.btn-mult').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.multiplierMode = btn.getAttribute('data-mult') as any;
        this.render();
      });
    });

    // Bind buy buttons
    this.container.querySelectorAll('.btn-buy-upgrade').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id') as UpgradeId;
        if (UpgradeEngine.buyUpgrade(id, this.multiplierMode)) {
          AudioEngine.playButtonClick();
          this.render();
        }
      });
    });
  }

  private renderUpgradeCard(id: UpgradeId): string {
    const s = store.get();
    const def = HERO_UPGRADES[id];
    const lvl = s.upgrades[id];

    let countToBuy = 1;
    if (this.multiplierMode === '10') countToBuy = 10;
    else if (this.multiplierMode === '100') countToBuy = 100;
    else if (this.multiplierMode === 'max') {
      const maxInfo = UpgradeEngine.calculateMaxAffordable(id, lvl, s.currencies.gold);
      countToBuy = maxInfo.count;
    }

    if (def.maxLevel) {
      countToBuy = Math.min(countToBuy, Math.max(1, def.maxLevel - lvl));
    }

    const cost = this.multiplierMode === 'max' 
      ? UpgradeEngine.calculateMaxAffordable(id, lvl, s.currencies.gold).cost
      : UpgradeEngine.calculateCost(id, lvl, countToBuy);

    const isMaxed = def.maxLevel && lvl >= def.maxLevel;
    const canAfford = !isMaxed && s.currencies.gold >= cost;

    // Next milestone calculation
    const nextMilestone = def.milestones.find((m) => m > lvl);
    const prevMilestone = [...def.milestones].reverse().find((m) => m <= lvl) || 0;
    const milestoneProgress = nextMilestone 
      ? Math.round(((lvl - prevMilestone) / (nextMilestone - prevMilestone)) * 100) 
      : 100;

    return `
      <div class="fantasy-card" style="display:flex; justify-content:space-between; align-items:center; padding:10px 14px;">
        <div style="flex:1; margin-right:12px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-weight:800; font-size:14px; color:var(--f-text-main);">${def.name}</span>
            <span style="font-size:12px; font-weight:700; color:var(--f-gold-bright);">Lv.${lvl}${def.maxLevel ? ` / ${def.maxLevel}` : ''}</span>
          </div>
          <div style="font-size:11px; color:var(--f-text-dim); margin-top:2px;">
            ${def.description}
          </div>
          ${nextMilestone ? `
            <div style="margin-top:6px; display:flex; align-items:center; gap:6px;">
              <div style="flex:1; height:4px; background:var(--f-bg-darker); border-radius:2px; overflow:hidden;">
                <div style="width:${milestoneProgress}%; height:100%; background:var(--f-gold-bright);"></div>
              </div>
              <span style="font-size:9px; color:var(--f-gold-bright); font-weight:700;">Lv.${nextMilestone} (2x BONUS)</span>
            </div>
          ` : ''}
        </div>

        <button class="btn-buy-upgrade attack-btn" data-id="${id}" style="padding:8px 14px; font-size:11px; min-width:96px; display:flex; flex-direction:column; align-items:center; justify-content:center; background:${isMaxed ? '#3f3f46' : canAfford ? 'linear-gradient(180deg, #15803d, #166534)' : '#3f3f46'}; border-color:${canAfford ? '#22c55e' : '#52525b'}; cursor:${canAfford ? 'pointer' : 'default'};">
          ${isMaxed 
            ? '<span>MAX</span>' 
            : `<span>BUY ${countToBuy > 1 ? `x${countToBuy}` : ''}</span>
               <span style="font-size:10px; color:#fbbf24; margin-top:2px;">${BigNumber.format(cost)} G</span>`
          }
        </button>
      </div>
    `;
  }
}
