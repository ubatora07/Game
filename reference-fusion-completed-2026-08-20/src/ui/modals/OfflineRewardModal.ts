import { ModalInstance, modalManager } from '../components/ModalManager';
import { OfflineGains } from '../../services/save/SaveService';
import { BigNumber } from '../../core/BigNumber';
import { store } from '../../core/GameState';
import { t } from '../../services/i18n/I18nService';
import { adService } from '../../services/ads/AdService';
import { sound } from '../../services/audio/SoundService';

export const OfflineRewardModal: ModalInstance = {
  id: 'offline_reward',
  render: (data: { gains: OfflineGains }) => {
    const gains = data.gains;
    const el = document.createElement('div');
    el.style.textAlign = 'center';

    el.innerHTML = `
      <div style="font-size:48px; margin-bottom:var(--space-08);">⏳</div>
      <h2 style="font-family:var(--font-display); font-size:22px; color:#fde047; margin-bottom:var(--space-04);">
        ${t('modal.offline.title')}
      </h2>
      <p style="color:var(--text-muted); font-size:12px; margin-bottom:var(--space-12);">
        ${t('modal.offline.time')} <b style="color:var(--color-cyan);">${BigNumber.formatTime(gains.seconds)}</b>
      </p>

      <div style="background:rgba(30,41,59,0.7); border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:var(--space-14); margin-bottom:var(--space-18); display:flex; justify-content:space-around;">
        <div>
          <div style="font-size:11px; color:var(--text-muted);">${t('currency.power')}</div>
          <div id="offlinePowerReward" style="font-size:18px; font-weight:bold; color:#fde047;">+${BigNumber.format(gains.powerGained)} ⚡</div>
        </div>
        <div>
          <div style="font-size:11px; color:var(--text-muted);">${t('currency.gold')}</div>
          <div id="offlineGoldReward" style="font-size:18px; font-weight:bold; color:#fde047;">+${BigNumber.format(gains.goldGained)} 🪙</div>
        </div>
      </div>

      <div style="display:flex; flex-direction:column; gap:var(--space-10);">
        <button id="claimOfflineAdBtn" style="height:50px; background:linear-gradient(135deg, #10b981, #059669); border:2px solid #6ee7b7; border-radius:var(--radius-md); color:#ffffff; font-weight:bold; font-size:16px; cursor:pointer; box-shadow:var(--glow-success); display:flex; align-items:center; justify-content:center; gap:var(--space-08);">
          <span>🎬</span>
          <span>${t('btn.claim_ad')}</span>
        </button>

        <button id="claimOfflineNormalBtn" style="height:44px; background:rgba(30,41,59,0.8); border:1px solid var(--border-subtle); border-radius:var(--radius-md); color:var(--text-main); font-weight:bold; font-size:14px; cursor:pointer;">
          ${t('btn.claim')} (1x)
        </button>
      </div>
    `;

    const applyRewards = (multiplier: number) => {
      store.set((draft) => {
        draft.power += gains.powerGained * multiplier;
        draft.gold += gains.goldGained * multiplier;
        draft.stats.lifetimePower += gains.powerGained * multiplier;
        draft.stats.lifetimeGold += gains.goldGained * multiplier;
      });
      sound.playVictory();
      modalManager.close('offline_reward');
    };

    el.querySelector('#claimOfflineNormalBtn')?.addEventListener('click', () => {
      applyRewards(1);
    });

    el.querySelector('#claimOfflineAdBtn')?.addEventListener('click', async () => {
      const watched = await adService.showRewardedAd('offline_claim_3x');
      if (watched) {
        applyRewards(3);
      } else {
        applyRewards(1);
      }
    });

    return el;
  }
};
