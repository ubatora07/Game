import { ModalInstance, modalManager } from '../components/ModalManager';
import { ReincarnationSystem } from '../../systems/ReincarnationSystem';
import { BigNumber } from '../../core/BigNumber';
import { t } from '../../services/i18n/I18nService';
import { adService } from '../../services/ads/AdService';

export const ReincarnateModal: ModalInstance = {
  id: 'reincarnate',
  render: () => {
    const requirements = ReincarnationSystem.getRequirements();
    const soulsToGain = requirements.potentialSouls;
    const requiredRank = requirements.requiredRank;
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

      <div style="background:rgba(30,41,59,0.7); border:1px solid #f43f5e; border-radius:var(--radius-md); padding:16px; margin-bottom:10px; box-shadow:0 0 20px rgba(244,63,94,0.3);">
        <div style="font-size:12px; color:var(--text-muted);">${t('modal.reincarnate.souls_awarded')}</div>
        <div style="font-size:28px; font-weight:900; color:#f43f5e; font-family:var(--font-display);">
          +${BigNumber.format(soulsToGain)} ⚡
        </div>
      </div>

      ${requirements.canRebirth ? '' : `
        <div style="font-size:11px; color:var(--text-muted); margin-bottom:14px;">
          ${t(requiredRank.titleKey)} • ${t('rank.req')}: ${BigNumber.format(requiredRank.reqPower)} ⚡
        </div>
      `}

      <div style="display:flex; gap:10px;">
        <button id="cancelReincarnateBtn" style="flex:1; height:46px; background:rgba(30,41,59,0.8); border:1px solid var(--border-subtle); border-radius:var(--radius-md); color:var(--text-muted); font-weight:bold; cursor:pointer;">
          ${t('btn.cancel')}
        </button>
        <button id="confirmReincarnateBtn" ${requirements.canRebirth ? '' : 'disabled aria-disabled="true"'} style="flex:1; height:46px; background:${requirements.canRebirth ? 'linear-gradient(135deg, #e11d48, #be123c)' : 'rgba(51,65,85,0.5)'}; border:1px solid ${requirements.canRebirth ? '#f43f5e' : 'var(--border-subtle)'}; border-radius:var(--radius-md); color:${requirements.canRebirth ? '#ffffff' : '#64748b'}; font-weight:bold; cursor:${requirements.canRebirth ? 'pointer' : 'not-allowed'}; box-shadow:${requirements.canRebirth ? '0 0 15px rgba(225,29,72,0.4)' : 'none'};">
          ${t('btn.confirm')}
        </button>
      </div>
    `;

    el.querySelector('#cancelReincarnateBtn')?.addEventListener('click', () => {
      modalManager.close('reincarnate');
    });

    el.querySelector('#confirmReincarnateBtn')?.addEventListener('click', () => {
      if (!ReincarnationSystem.getRequirements().canRebirth) return;
      if (!ReincarnationSystem.reincarnate()) return;
      modalManager.close('reincarnate');
      adService.showFullscreenAdIfReady('reincarnation_checkpoint');
    });

    return el;
  }
};
