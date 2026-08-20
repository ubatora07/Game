import { store } from '../../../core/GameState';
import { BigNumber } from '../../../core/BigNumber';

export class HybridHeader {
  private container: HTMLElement;
  private rankChip: HTMLElement;
  private stageChip: HTMLElement;
  private powerChip: HTMLElement;
  private goldChip: HTMLElement;
  private crystalsChip: HTMLElement;
  private soulsChip: HTMLElement;

  constructor() {
    this.container = document.createElement('header');
    this.container.className = 'hybrid-header';

    const brand = document.createElement('div');
    brand.className = 'hybrid-header-brand';
    brand.innerHTML = '<span>🥋</span> <span>ANIME ASCENSION</span> <span style="font-size:10px; color:#3b82f6; background:rgba(59,130,246,0.15); padding:var(--space-02) var(--space-06); border-radius:var(--radius-04); border:1px solid #3b82f6;">HYBRID BETA</span>';
    this.container.appendChild(brand);

    const currencies = document.createElement('div');
    currencies.className = 'hybrid-header-currencies';

    this.rankChip = this.createChip('rank', '👑', 'Rank E');
    this.stageChip = this.createChip('stage', '🗺️', 'World 1-1');
    this.powerChip = this.createChip('power', '⚡', '0 Power');
    this.goldChip = this.createChip('gold', '🪙', '0 Gold');
    this.crystalsChip = this.createChip('crystals', '💎', '0');
    this.soulsChip = this.createChip('souls', '🌌', '0');

    currencies.appendChild(this.rankChip);
    currencies.appendChild(this.stageChip);
    currencies.appendChild(this.powerChip);
    currencies.appendChild(this.goldChip);
    currencies.appendChild(this.crystalsChip);
    currencies.appendChild(this.soulsChip);

    this.container.appendChild(currencies);
    this.update();
  }

  public getElement(): HTMLElement {
    return this.container;
  }

  public update(): void {
    const state = store.get();
    this.rankChip.querySelector('.chip-val')!.textContent = `Rank ${state.rankId}`;
    this.stageChip.querySelector('.chip-val')!.textContent = `Stage ${state.campaign.currentStageId}`;
    this.powerChip.querySelector('.chip-val')!.textContent = `${BigNumber.format(state.power)} Power`;
    this.goldChip.querySelector('.chip-val')!.textContent = `${BigNumber.format(state.gold)} GP`;
    this.crystalsChip.querySelector('.chip-val')!.textContent = `${BigNumber.format(state.crystals)} Crystals`;
    this.soulsChip.querySelector('.chip-val')!.textContent = `${BigNumber.format(state.souls)} Souls`;
  }

  private createChip(type: string, icon: string, initialVal: string): HTMLElement {
    const chip = document.createElement('div');
    chip.className = `hybrid-currency-chip ${type}`;
    chip.innerHTML = `<span>${icon}</span> <span class="chip-val">${initialVal}</span>`;
    return chip;
  }
}
