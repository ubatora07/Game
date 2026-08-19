import { ModalInstance, modalManager } from '../components/ModalManager';
import { t } from '../../services/i18n/I18nService';

export const RhythmMasterEasterEggModal: ModalInstance = {
  id: 'rhythm_master_easter_egg',
  render: (data?: { streak?: number }) => {
    const streak = data?.streak ?? 500;
    const el = document.createElement('div');
    el.className = 'easter-egg-modal-container';
    el.style.cssText = 'text-align:center; max-width:440px;';

    el.innerHTML = `
      <div style="font-size:52px; margin-bottom:var(--space-06); animation:spinPulse 3s linear infinite;">
        🪘🕺✨
      </div>
      <div style="display:inline-block; background:rgba(234,179,8,0.2); border:1px solid #eab308; border-radius:var(--radius-12); padding:var(--space-04) var(--space-12); font-size:11px; font-weight:bold; color:#fde047; margin-bottom:var(--space-08);">
        ${t('easter_egg.rhythm.badge')}
      </div>
      <h2 style="font-family:var(--font-display); font-size:22px; color:#fde047; text-shadow:0 0 15px rgba(250,204,21,0.6); margin-bottom:var(--space-08);">
        ${t('easter_egg.rhythm.title')}
      </h2>
      <div style="background:rgba(15,23,42,0.9); border:1px solid rgba(255,255,255,0.1); border-radius:var(--radius-08); padding:var(--space-12); margin-bottom:var(--space-14); text-align:left;">
        <div style="font-size:11px; font-weight:bold; color:#38bdf8; margin-bottom:var(--space-04);">
          🧙‍♂️ ${t('easter_egg.rhythm.npc_name')}:
        </div>
        <p style="color:#e2e8f0; font-size:12px; line-height:1.45; font-style:italic;">
          "${t('easter_egg.rhythm.dialogue', { streak })}"
        </p>
      </div>

      <div style="background:rgba(56,189,248,0.1); border:1px dashed #38bdf8; border-radius:var(--radius-08); padding:var(--space-08); margin-bottom:var(--space-16);">
        <div style="font-size:10px; color:#94a3b8; font-weight:bold; text-transform:uppercase;">${t('easter_egg.rhythm.reward_unlocked')}</div>
        <div style="font-size:13px; font-weight:bold; color:#38bdf8;">✨ ${t('easter_egg.rhythm.title_unlocked')} ✨</div>
        <div style="font-size:11px; color:#fde047; margin-top:var(--space-02);">💎 +500 Crystals</div>
      </div>

      <button id="btn-claim-rhythm-egg" style="width:100%; height:44px; background:linear-gradient(135deg, #eab308, #ca8a04); border:1px solid #fef08a; border-radius:var(--radius-08); color:#000000; font-weight:bold; font-size:15px; cursor:pointer; box-shadow:var(--glow-gold);">
        ${t('easter_egg.rhythm.claim_btn')}
      </button>
    `;

    el.querySelector('#btn-claim-rhythm-egg')?.addEventListener('click', () => {
      modalManager.close('rhythm_master_easter_egg');
    });

    return el;
  },
};
