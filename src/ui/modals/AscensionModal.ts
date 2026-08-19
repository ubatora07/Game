import { ModalInstance, modalManager } from '../components/ModalManager';
import { RankDefinition } from '../../content/ranks';
import { t } from '../../services/i18n/I18nService';
import { adService } from '../../services/ads/AdService';

export const AscensionModal: ModalInstance = {
  id: 'ascension',
  render: (data: { rank: RankDefinition }) => {
    const rank = data.rank;
    const el = document.createElement('div');
    el.style.textAlign = 'center';

    el.innerHTML = `
      <div style="font-size:54px; margin-bottom:8px; animation:heroFloat 2s ease-in-out infinite;">
        🌟
      </div>
      <h2 style="font-family:var(--font-display); font-size:26px; color:#fde047; letter-spacing:1px; text-shadow:0 0 15px rgba(245,158,11,0.6); margin-bottom:6px;">
        ${t('modal.ascension.title')}
      </h2>
      <p style="color:var(--text-muted); font-size:13px; margin-bottom:16px;">
        ${t('modal.ascension.congrats')}
      </p>

      <div style="background:rgba(30,41,59,0.6); border:1px solid ${rank.color}; border-radius:var(--radius-md); padding:16px; margin-bottom:20px; box-shadow:0 0 20px ${rank.glowColor};">
        <div style="font-size:20px; font-weight:900; color:${rank.color}; margin-bottom:4px;">
          ${t(rank.titleKey)}
        </div>
        <div style="font-size:13px; color:var(--text-main); margin-bottom:8px;">
          ${t(rank.descriptionKey)}
        </div>
        <div style="font-size:16px; font-weight:bold; color:#fde047;">
          ${t('rank.multiplier')}: ×${rank.multiplier}
        </div>
      </div>

      <button id="closeAscensionModalBtn" style="width:100%; height:48px; background:linear-gradient(135deg, #d97706, #f59e0b); border:1px solid #fde047; border-radius:var(--radius-md); color:#ffffff; font-weight:bold; font-size:16px; cursor:pointer;">
        ${t('btn.claim')}
      </button>
    `;

    el.querySelector('#closeAscensionModalBtn')?.addEventListener('click', () => {
      modalManager.close('ascension');
      // Polite milestone ad trigger (respects cooldown)
      adService.showFullscreenAdIfReady('ascension_milestone');
    });

    return el;
  }
};
