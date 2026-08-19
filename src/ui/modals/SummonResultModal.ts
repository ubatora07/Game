import { ModalInstance, modalManager } from '../components/ModalManager';
import { SummonResult } from '../../systems/HeroSystem';
import { HERO_RARITY_CONFIG } from '../../content/heroes';
import { getRarityFrameCss, RARITY_FRAME_STYLES } from '../../content/artPipeline';
import { t } from '../../services/i18n/I18nService';

export const SummonResultModal: ModalInstance = {
  id: 'summon_result',
  render: (data: { results: SummonResult[] }) => {
    const el = document.createElement('div');
    el.style.textAlign = 'center';

    const resultsHtml = data.results.map((res) => {
      const config = HERO_RARITY_CONFIG[res.hero.rarity];
      const frameStyle = RARITY_FRAME_STYLES[res.hero.rarity.toLowerCase()] || RARITY_FRAME_STYLES.common;
      const frameCss = getRarityFrameCss(res.hero.rarity);
      return `
        <div style="${frameCss} border-radius:var(--radius-md); padding:12px; display:flex; flex-direction:column; align-items:center; position:relative; min-width:110px;">
          ${res.isNew ? `<div style="position:absolute; top:-8px; right:-6px; background:#10b981; color:#fff; font-size:10px; font-weight:bold; padding:2px 6px; border-radius:var(--radius-full); box-shadow:0 0 8px #10b981;">NEW</div>` : ''}
          <div style="position:absolute; top:4px; left:6px; font-size:10px; font-weight:900; color:${frameStyle.badgeColor};">${frameStyle.badgeSymbol}</div>
          <div style="font-size:36px; margin:4px 0; filter:drop-shadow(0 0 8px ${frameStyle.glowColor});">🥋</div>
          <div style="font-size:13px; font-weight:bold; color:var(--text-main);">${t(res.hero.nameKey)}</div>
          <div style="font-size:11px; font-weight:bold; color:${config.color}; text-transform:uppercase;">${t(config.nameKey)}</div>
          ${!res.isNew ? `<div style="font-size:11px; color:#c084fc; margin-top:4px;">+${res.essenceGranted} ✨</div>` : ''}
        </div>
      `;
    }).join('');

    el.innerHTML = `
      <h2 style="font-family:var(--font-display); font-size:24px; color:#fde047; margin-bottom:12px;">
        ${t('modal.summon.title')}
      </h2>

      <div style="display:flex; flex-wrap:wrap; justify-content:center; gap:12px; max-height:55vh; overflow-y:auto; padding:8px 0; margin-bottom:16px;">
        ${resultsHtml}
      </div>

      <button id="closeSummonResultBtn" style="width:100%; height:46px; background:linear-gradient(135deg, #7c3aed, #a855f7); border:1px solid #c084fc; border-radius:var(--radius-md); color:#ffffff; font-weight:bold; font-size:15px; cursor:pointer;">
        ${t('btn.close')}
      </button>
    `;

    el.querySelector('#closeSummonResultBtn')?.addEventListener('click', () => {
      modalManager.close('summon_result');
    });

    return el;
  }
};
