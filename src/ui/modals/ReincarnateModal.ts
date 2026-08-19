import { ModalInstance, modalManager } from '../components/ModalManager';
import { ReincarnationSystem } from '../../systems/ReincarnationSystem';
import { BigNumber } from '../../core/BigNumber';
import { t } from '../../services/i18n/I18nService';
import { adService } from '../../services/ads/AdService';

export const ReincarnateModal: ModalInstance = {
  id: 'reincarnate',
  render: () => {
    const soulsToGain = ReincarnationSystem.getPotentialSouls();
    const el = document.createElement('div');
    el.style.textAlign = 'center';

    el.innerHTML = `
      <div style="font-size:48px; margin-bottom:6px;">🔄</div>
      <h2 style="font-family:var(--font-display); font-size:22px; color:#f43f5e; margin-bottom:8px;">
        ${t('modal.reincarnate.title')}
      </h2>

      <p style="color:var(--text-muted); font-size:12px; margin-bottom:14px; line-height:1.5;">
        ${t('modal.reincarnate.warning')}
      </p>

      <div style="background:rgba(30,41,59,0.7); border:1px solid #f43f5e; border-radius:var(--radius-md); padding:16px; margin-bottom:18px; box-shadow:0 0 20px rgba(244,63,94,0.3);">
        <div style="font-size:12px; color:var(--text-muted);">${t('modal.reincarnate.souls_awarded')}</div>
        <div style="font-size:28px; font-weight:900; color:#f43f5e; font-family:var(--font-display);">
          +${BigNumber.format(soulsToGain)} ⚡
        </div>
      </div>

      <div style="display:flex; gap:10px;">
        <button id="cancelReincarnateBtn" style="flex:1; height:46px; background:rgba(30,41,59,0.8); border:1px solid var(--border-subtle); border-radius:var(--radius-md); color:var(--text-muted); font-weight:bold; cursor:pointer;">
          ${t('btn.cancel')}
        </button>
        <button id="confirmReincarnateBtn" style="flex:1; height:46px; background:linear-gradient(135deg, #e11d48, #be123c); border:1px solid #f43f5e; border-radius:var(--radius-md); color:#ffffff; font-weight:bold; cursor:pointer; box-shadow:0 0 15px rgba(225,29,72,0.4);">
          ${t('btn.confirm')}
        </button>
      </div>
    `;

    el.querySelector('#cancelReincarnateBtn')?.addEventListener('click', () => {
      modalManager.close('reincarnate');
    });

    el.querySelector('#confirmReincarnateBtn')?.addEventListener('click', () => {
      ReincarnationSystem.reincarnate();
      modalManager.close('reincarnate');
      adService.showFullscreenAdIfReady('reincarnation_checkpoint');
    });

    return el;
  }
};
