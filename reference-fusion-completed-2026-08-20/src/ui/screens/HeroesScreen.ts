import { store } from '../../core/GameState';
import { HEROES, HERO_RARITY_CONFIG, getHeroStarMultiplier, getStarUpgradeCost } from '../../content/heroes';
import { HeroSystem } from '../../systems/HeroSystem';
import { BigNumber } from '../../core/BigNumber';
import { t } from '../../services/i18n/I18nService';

export class HeroesScreen {
  private el: HTMLElement;
  private isDOMBuilt: boolean = false;

  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'screen-container';
    this.buildDOM();
    this.bind();
  }

  public getElement(): HTMLElement {
    return this.el;
  }

  private bind(): void {
    store.subscribe(() => this.update());
    document.addEventListener('i18n:change', () => {
      this.isDOMBuilt = false;
      this.buildDOM();
    });
  }

  private buildDOM(): void {
    this.el.innerHTML = `
      <div style="padding:var(--space-16); max-width:760px; margin:0 auto; width:100%;">
        <!-- Header -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-16); border-bottom:1px solid var(--border-subtle); padding-bottom:var(--space-10);">
          <div>
            <h2 id="heroesHeaderTitle" style="font-family:var(--font-display); font-size:22px; color:#fde047;">
              👥 ${t('nav.heroes')} (0 / ${HEROES.length})
            </h2>
            <p style="color:var(--text-muted); font-size:12px;">
              ${t('currency.essence')}: <b id="heroesEssenceDisplay" style="color:#c084fc;">0 ✨</b>
            </p>
          </div>
        </div>

        <!-- Heroes Grid -->
        <div id="heroesGrid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(180px, 1fr)); gap:var(--space-12);">
          ${HEROES.map((hero) => {
            const rarity = HERO_RARITY_CONFIG[hero.rarity];
            return `
              <div class="hero-card" id="hcard_${hero.id}" style="
                background: rgba(15, 23, 42, 0.5);
                border: 2px solid var(--border-subtle);
                border-radius: var(--radius-md);
                padding: var(--space-12);
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
                opacity: 0.45;
                position: relative;
                transition: all 0.2s ease;
              ">
                <!-- Rarity Badge -->
                <div style="position:absolute; top:6px; left:8px; font-size:10px; font-weight:bold; color:${rarity.color}; text-transform:uppercase;">
                  ${t(rarity.nameKey)}
                </div>

                <!-- Avatar Artwork -->
                <div class="h-avatar" style="width:64px; height:64px; border-radius:50%; background:rgba(30,41,59,0.8); border:2px solid ${rarity.color}; display:flex; align-items:center; justify-content:center; font-size:32px; margin:var(--space-14) 0 var(--space-06) 0;">
                  ❓
                </div>

                <!-- Name & Title -->
                <div style="font-weight:bold; font-size:13px; color:var(--text-main);">${t(hero.nameKey)}</div>
                <div class="h-title" style="font-size:10px; color:var(--text-muted); margin-bottom:var(--space-06);">${t('btn.locked')}</div>

                <!-- Star Rating -->
                <div class="h-stars" style="font-size:12px; color:#fde047; margin-bottom:var(--space-06);">
                  ☆☆☆☆☆
                </div>

                <!-- Modifier description -->
                <div class="h-bonus" style="font-size:11px; color:#38bdf8; font-weight:bold; margin-bottom:var(--space-10);">
                  ???
                </div>

                <!-- Action Slot -->
                <div class="h-action" style="width:100%;">
                  <div style="font-size:11px; color:var(--text-dim);">${t('btn.locked')}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    this.isDOMBuilt = true;
    this.update();
  }

  private update(): void {
    if (!this.isDOMBuilt) return;
    const s = store.get();
    const ownedCount = Object.keys(s.heroes).length;

    const titleEl = this.el.querySelector('#heroesHeaderTitle');
    const essenceEl = this.el.querySelector('#heroesEssenceDisplay');

    if (titleEl) titleEl.innerHTML = `👥 ${t('nav.heroes')} (${ownedCount} / ${HEROES.length})`;
    if (essenceEl) essenceEl.innerHTML = `${BigNumber.format(s.essence)} ✨`;

    HEROES.forEach((hero) => {
      const card = this.el.querySelector(`#hcard_${hero.id}`) as HTMLElement;
      if (!card) return;

      const heroData = s.heroes[hero.id];
      const isOwned = Boolean(heroData);
      const rarity = HERO_RARITY_CONFIG[hero.rarity];
      const stars = heroData ? heroData.stars : 0;
      const starMult = getHeroStarMultiplier(stars);
      const effBonusPct = Math.floor(hero.modifier.baseValue * starMult * 100);

      const starCost = isOwned ? getStarUpgradeCost(stars, hero.rarity) : 0;
      const canStarUp = isOwned && stars < 5 && s.essence >= starCost;

      card.style.background = isOwned ? 'rgba(17, 24, 39, 0.9)' : 'rgba(15, 23, 42, 0.5)';
      card.style.borderColor = isOwned ? rarity.color : 'var(--border-subtle)';
      if (isOwned) {
        card.style.setProperty('--ui-glow-color', rarity.glow);
        card.style.boxShadow = 'var(--glow-dynamic-md)';
      } else {
        card.style.removeProperty('--ui-glow-color');
        card.style.boxShadow = 'none';
      }
      card.style.opacity = isOwned ? '1' : '0.45';

      const avatarEl = card.querySelector('.h-avatar') as HTMLElement;
      const titleTextEl = card.querySelector('.h-title') as HTMLElement;
      const starsEl = card.querySelector('.h-stars') as HTMLElement;
      const bonusEl = card.querySelector('.h-bonus') as HTMLElement;
      const actionEl = card.querySelector('.h-action') as HTMLElement;

      if (avatarEl) avatarEl.innerText = isOwned ? '🥋' : '❓';
      if (titleTextEl) titleTextEl.innerText = isOwned ? t(hero.titleKey) : t('btn.locked');
      if (starsEl) starsEl.innerText = isOwned ? '⭐'.repeat(stars) : '☆☆☆☆☆';
      if (bonusEl) bonusEl.innerText = isOwned ? `+${effBonusPct}% ${hero.modifier.type.replace('_pct', '').toUpperCase()}` : '???';

      if (actionEl) {
        if (isOwned && stars < 5) {
          if (!actionEl.querySelector('.star-up-btn')) {
            actionEl.innerHTML = `
              <button class="star-up-btn" style="
                width: 100%;
                height: 32px;
                background: ${canStarUp ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'rgba(51,65,85,0.5)'};
                border: 1px solid ${canStarUp ? '#c084fc' : 'transparent'};
                border-radius: var(--radius-sm);
                color: ${canStarUp ? '#fff' : '#64748b'};
                font-size: 11px;
                font-weight: bold;
                cursor: pointer;
              ">
                ${t('heroes.star_up', { cost: starCost })}
              </button>
            `;
            actionEl.querySelector('.star-up-btn')?.addEventListener('click', (e) => {
              e.preventDefault();
              HeroSystem.upgradeHeroStars(hero.id);
            });
          } else {
            const btn = actionEl.querySelector('.star-up-btn') as HTMLElement;
            btn.innerText = `${t('heroes.star_up', { cost: starCost })}`;
            btn.style.background = canStarUp ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'rgba(51,65,85,0.5)';
            btn.style.borderColor = canStarUp ? '#c084fc' : 'transparent';
            btn.style.color = canStarUp ? '#fff' : '#64748b';
          }
        } else if (isOwned) {
          actionEl.innerHTML = `<div style="font-size:11px; color:#fde047; font-weight:bold;">${t('heroes.max_stars')}</div>`;
        } else {
          actionEl.innerHTML = `<div style="font-size:11px; color:var(--text-dim);">${t('btn.locked')}</div>`;
        }
      }
    });
  }
}
