import { ModalInstance, modalManager } from '../components/ModalManager';
import { HeroDefinition, HERO_RARITY_CONFIG } from '../../content/heroes';
import { t } from '../../services/i18n/I18nService';

export const HeroRecruitmentModal: ModalInstance = {
  id: 'hero_recruitment_modal',
  render: (data?: { hero?: HeroDefinition; isDuplicate?: boolean }) => {
    const hero = data?.hero;
    const isDuplicate = data?.isDuplicate ?? false;

    const el = document.createElement('div');
    el.className = 'hero-recruitment-modal-container';
    el.style.cssText = 'text-align:center; max-width:420px;';

    if (!hero) {
      el.innerHTML = `<p style="color:#94a3b8;">No hero recruitment data.</p>`;
      return el;
    }

    const rarityConfig = HERO_RARITY_CONFIG[hero.rarity];

    el.innerHTML = `
      <div style="font-size:56px; margin-bottom:8px; animation:bounce 1.5s infinite;">
        ${hero.icon}
      </div>
      <div style="display:inline-block; background:${rarityConfig.glow}; border:1px solid ${rarityConfig.color}; border-radius:12px; padding:3px 12px; font-size:11px; font-weight:bold; color:${rarityConfig.color}; text-transform:uppercase; margin-bottom:8px;">
        ${isDuplicate ? t('recruit.duplicate_badge') : t('recruit.new_hero_badge')} • ${t(rarityConfig.nameKey)}
      </div>
      <h2 style="font-family:var(--font-display); font-size:22px; color:#f8fafc; margin-bottom:4px;">
        ${t(hero.nameKey)}
      </h2>
      <div style="font-size:12px; color:#38bdf8; font-weight:bold; margin-bottom:12px;">
        ${t(hero.titleKey)}
      </div>

      <div style="background:rgba(15,23,42,0.9); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:12px; margin-bottom:16px; text-align:left;">
        <div style="font-size:11px; color:#cbd5e1; line-height:1.45; margin-bottom:10px;">
          "${t(hero.descriptionKey)}"
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:8px; font-size:11px;">
          <span style="color:#94a3b8;">Skill:</span>
          <span style="color:#fde047; font-weight:bold;">${hero.skill.icon} ${t(hero.skill.nameKey)}</span>
        </div>
      </div>

      <button id="btn-confirm-recruit" style="width:100%; height:44px; background:linear-gradient(135deg, ${rarityConfig.color}, #1e293b); border:1px solid ${rarityConfig.color}; border-radius:8px; color:#ffffff; font-weight:bold; font-size:14px; cursor:pointer; box-shadow:0 0 15px ${rarityConfig.glow};">
        ${t('recruit.confirm_btn')}
      </button>
    `;

    el.querySelector('#btn-confirm-recruit')?.addEventListener('click', () => {
      modalManager.close('hero_recruitment_modal');
    });

    return el;
  },
};
