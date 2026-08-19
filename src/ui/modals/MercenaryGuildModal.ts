import { ModalInstance, modalManager } from '../components/ModalManager';
import { mercenarySystem } from '../../systems/MercenarySystem';
import { getAllMercenaryDefs } from '../../content/mercenariesCatalog';
import { store } from '../../core/GameState';
import { t } from '../../services/i18n/I18nService';

export const MercenaryGuildModal: ModalInstance = {
  id: 'mercenary_guild_modal',
  render: () => {
    const el = document.createElement('div');
    el.className = 'mercenary-guild-modal-container pixel-fantasy-modal';
    el.style.cssText = 'max-width:560px; padding:var(--space-16); background:radial-gradient(ellipse at 50% 15%, #1c1917 0%, #0c0a09 100%); border:2px solid #d97706; border-radius:var(--radius-06); box-shadow:var(--shadow-modal);';

    const refresh = () => {
      const mercs = getAllMercenaryDefs();
      const currentGold = store.get().gold;

      el.innerHTML = `
        <!-- Header -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-12); border-bottom:1.5px solid #78350f; padding-bottom:var(--space-08); flex-wrap:wrap; gap:var(--space-08);">
          <div>
            <div style="font-size:9px; color:#f59e0b; font-weight:bold; letter-spacing:0.5px; font-family:var(--font-display);">
              ✦ ${t('mercenary.guild_label')} ✦
            </div>
            <h3 style="font-family:var(--font-display); font-size:17px; color:#fef08a; margin:var(--space-01) 0 0 0;">
              ${t('mercenary.guild_title')}
            </h3>
          </div>

          <div style="background:rgba(0,0,0,0.5); padding:var(--space-03) var(--space-08); border-radius:var(--radius-04); border:1px solid #eab308; color:#fef08a; font-size:11px;">
            🪙 <b>${currentGold}</b>
          </div>
        </div>

        <p style="font-size:11px; color:#cbd5e1; margin:0 0 var(--space-12) 0;">
          ${t('mercenary.guild_desc')}
        </p>

        <!-- Mercenaries List -->
        <div style="display:flex; flex-direction:column; gap:var(--space-08); max-height:280px; overflow-y:auto; padding-right:var(--space-04); margin-bottom:var(--space-12);">
          ${mercs
            .map((m) => {
              const isActive = mercenarySystem.isMercenaryActive(m.id);
              const contract = mercenarySystem.getContract(m.id);
              const remainingMin = contract ? Math.max(1, Math.ceil((contract.expiresAtTimestamp - Date.now()) / 60000)) : 0;
              const canHire = currentGold >= m.costGold && !isActive;

              return `
              <div style="background:rgba(28,25,23,0.9); border:1.5px solid ${isActive ? '#34d399' : '#78350f'}; border-radius:var(--radius-04); padding:var(--space-08) var(--space-10); display:flex; justify-content:space-between; align-items:center; gap:var(--space-08);">
                <div style="display:flex; align-items:center; gap:var(--space-10);">
                  <div style="width:36px; height:36px; border-radius:50%; background:#0c0a09; border:1.5px solid ${isActive ? '#34d399' : '#f59e0b'}; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                    <div style="width:22px; height:22px;">${m.avatarSvg}</div>
                  </div>
                  <div>
                    <div style="font-size:12px; font-weight:bold; color:#fef08a; font-family:var(--font-display);">${t(m.nameKey)}</div>
                    <div style="font-size:9px; color:#38bdf8;">${t(m.titleKey)} • ${m.specialtyTag}</div>
                    <div style="font-size:10px; color:#34d399; margin-top:var(--space-02);">
                      ${m.modifiers.map((mod) => `<b>${mod.label}</b>`).join(' • ')}
                    </div>
                  </div>
                </div>

                <div style="text-align:right; flex-shrink:0;">
                  ${
                    isActive
                      ? `
                    <div style="font-size:10px; color:#34d399; font-weight:bold; margin-bottom:var(--space-04);">✓ ${t('mercenary.active_time', { minutes: remainingMin })}</div>
                    <button disabled style="padding:var(--space-04) var(--space-08); background:#064e3b; border:1px solid #059669; border-radius:var(--radius-03); color:#6ee7b7; font-size:10px; font-family:var(--font-display); font-weight:bold;">
                      ${t('mercenary.hired')}
                    </button>
                  `
                      : `
                    <div style="font-size:10px; color:#fde047; font-weight:bold; margin-bottom:var(--space-04);">🪙 ${t('mercenary.cost_time', { gold: m.costGold, minutes: m.contractDurationMinutes })}</div>
                    <button class="btn-hire-merc" data-merc-id="${m.id}" ${!canHire ? 'disabled' : ''} style="padding:var(--space-04) var(--space-10); background:${canHire ? 'linear-gradient(135deg, #10b981, #059669)' : '#292524'}; border:1px solid ${canHire ? '#34d399' : '#451a03'}; border-radius:var(--radius-03); color:${canHire ? '#ffffff' : '#78716c'}; font-size:10px; font-family:var(--font-display); font-weight:bold; cursor:${canHire ? 'pointer' : 'not-allowed'};">
                      ${t('mercenary.hire')}
                    </button>
                  `
                  }
                </div>
              </div>
            `;
            })
            .join('')}
        </div>

        <button id="btn-close-merc-guild" style="width:100%; padding:var(--space-08); background:#1c1917; border:1px solid #78350f; border-radius:var(--radius-04); color:#cbd5e1; font-family:var(--font-display); font-size:12px; cursor:pointer;">
          ${t('mercenary.exit')}
        </button>
      `;

      el.querySelectorAll('.btn-hire-merc').forEach((btn) => {
        btn.addEventListener('click', () => {
          const mercId = btn.getAttribute('data-merc-id') as any;
          if (mercenarySystem.hireMercenary(mercId).success) {
            refresh();
          }
        });
      });

      el.querySelector('#btn-close-merc-guild')?.addEventListener('click', () => {
        modalManager.close('mercenary_guild_modal');
      });
    };

    refresh();
    return el;
  },
};
