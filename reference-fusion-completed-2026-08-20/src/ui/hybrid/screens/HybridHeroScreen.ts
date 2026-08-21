import { HeroViewModel } from '../adapters/HeroViewModel';

export class HybridHeroScreen {
  private container: HTMLElement;

  constructor() {
    this.container = document.createElement('div');
    this.container.style.cssText = 'display:flex; flex-direction:column; height:100%; box-sizing:border-box; padding:var(--space-16); gap:var(--space-16); overflow-y:auto;';

    this.render();
  }

  public getElement(): HTMLElement {
    return this.container;
  }

  public update(): void {
    this.render();
  }

  private render(): void {
    this.container.innerHTML = '';
    const data = HeroViewModel.getHeroData();

    // 1. Protagonist Card
    const heroCard = document.createElement('div');
    heroCard.className = 'hybrid-panel';
    heroCard.innerHTML = `
      <div class="hybrid-panel-header">
        <span>👤 PROTAGONIST CULTIVATION</span>
        <span style="color:var(--hybrid-gold);">Rank ${data.rankId}</span>
      </div>
      <div style="display:flex; gap:var(--space-16); align-items:center; margin-bottom:var(--space-12);">
        <div style="font-size:40px; background:rgba(255,255,255,0.05); padding:var(--space-12); border-radius:var(--radius-08); border:1px solid var(--hybrid-border);">🥋</div>
        <div>
          <div style="font-size:18px; font-weight:800; color:var(--hybrid-text-main);">Immortal Aspirant</div>
          <div style="font-size:12px; color:var(--hybrid-accent); font-weight:600;">Realm: ${data.rankName}</div>
          <div style="font-size:13px; color:var(--hybrid-power); font-weight:700; margin-top:var(--space-04);">Total Power: ${data.formattedPower}</div>
        </div>
      </div>
    `;
    this.container.appendChild(heroCard);

    // 2. Hero Roster
    const rosterSection = document.createElement('div');
    rosterSection.className = 'hybrid-panel';
    rosterSection.innerHTML = `
      <div class="hybrid-panel-header">
        <span>🦸 HERO ROSTER (${data.unlockedHeroesCount} / ${data.totalHeroesCount} Unlocked)</span>
      </div>
      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(240px, 1fr)); gap:var(--space-12); margin-top:var(--space-08);">
        ${data.heroes
          .map(
            (h) => `
          <div style="background:var(--hybrid-bg-darker); border:1px solid var(--hybrid-border); border-radius:var(--radius-06); padding:var(--space-12); opacity:${h.isUnlocked ? '1' : '0.5'};">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-04);">
              <span style="font-weight:700; color:var(--hybrid-text-main);">${h.name}</span>
              <span style="color:var(--hybrid-gold); font-size:11px;">${'★'.repeat(h.stars)}</span>
            </div>
            <div style="font-size:11px; color:var(--hybrid-text-dim); margin-bottom:var(--space-04);">Status: ${h.isUnlocked ? 'Active in Roster' : 'Locked'}</div>
            <div style="font-size:11px; color:var(--hybrid-power); font-weight:600;">Power: +${h.powerContribution}</div>
          </div>
        `
          )
          .join('')}
      </div>
    `;
    this.container.appendChild(rosterSection);
  }
}
