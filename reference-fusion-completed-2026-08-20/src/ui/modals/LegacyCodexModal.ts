import { ModalInstance, modalManager } from '../components/ModalManager';
import { legacyEndingSystem } from '../../systems/LegacyEndingSystem';
import { getAllLegacyEndingDefs, getLegacyEndingDef } from '../../content/legacyEndingsCatalog';
import { t } from '../../services/i18n/I18nService';

export const LegacyCodexModal: ModalInstance = {
  id: 'legacy_codex_modal',
  render: () => {
    let selectedEndingId = legacyEndingSystem.getUnlockedEndings()[0]?.id || 'ending_savior_mountain_realm';

    const el = document.createElement('div');
    el.className = 'legacy-codex-modal-container pixel-fantasy-modal';
    el.style.cssText = 'max-width:560px; padding:var(--space-16); background:radial-gradient(ellipse at 50% 15%, #18181b 0%, #09090b 100%); border:2px solid #a855f7; border-radius:var(--radius-06); box-shadow:var(--glow-purple-strong);';

    const refresh = () => {
      const allEndings = getAllLegacyEndingDefs();
      const currentDef = getLegacyEndingDef(selectedEndingId) || allEndings[0];
      const isUnlocked = legacyEndingSystem.isEndingUnlocked(currentDef.id);
      const activeBoonId = legacyEndingSystem.getActiveBoon()?.id;

      el.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-12); border-bottom:1.5px solid #7c3aed; padding-bottom:var(--space-08); gap:var(--space-08);">
          <div>
            <div style="font-size:9px; color:#c084fc; font-weight:bold; letter-spacing:0.5px; font-family:var(--font-display);">✦ ${t('legacy.codex.label')} ✦</div>
            <h3 style="font-family:var(--font-display); font-size:16px; color:#fef08a; margin:var(--space-01) 0 0 0;">${t('legacy.codex.title')}</h3>
          </div>
          <button id="btn-close-codex" style="background:#18181b; border:1px solid #7c3aed; border-radius:var(--radius-04); color:#c084fc; padding:var(--space-04) var(--space-08); font-family:var(--font-display); font-size:11px; cursor:pointer;">✕ ${t('btn.close')}</button>
        </div>

        <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:var(--space-06); margin-bottom:var(--space-12);">
          ${allEndings.map((endingDef) => {
            const unlocked = legacyEndingSystem.isEndingUnlocked(endingDef.id);
            const active = endingDef.id === selectedEndingId;
            return `
              <button class="btn-ending-card" data-ending-id="${endingDef.id}" style="display:flex; align-items:center; gap:var(--space-08); padding:var(--space-08); border-radius:var(--radius-04); border:1.5px solid ${active ? '#c084fc' : unlocked ? '#581c87' : '#27272a'}; background:${active ? 'rgba(168,85,247,0.25)' : 'rgba(0,0,0,0.6)'}; text-align:left; cursor:pointer;">
                <div style="width:28px; height:28px; border-radius:var(--radius-04); background:#09090b; border:1px solid ${unlocked ? '#a855f7' : '#52525b'}; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                  <div style="width:18px; height:18px; opacity:${unlocked ? '1' : '0.35'};">${endingDef.iconSvg}</div>
                </div>
                <div style="overflow:hidden;">
                  <div style="font-size:11px; font-weight:bold; font-family:var(--font-display); color:${unlocked ? '#fef08a' : '#71717a'}; white-space:nowrap; text-overflow:ellipsis; overflow:hidden;">${t(endingDef.titleKey)}</div>
                  <div style="font-size:8px; color:${unlocked ? '#34d399' : '#a1a1aa'}; font-weight:bold;">${unlocked ? `✓ ${t('legacy.codex.unlocked')}` : `🔒 ${t('legacy.codex.locked_destiny')}`}</div>
                </div>
              </button>
            `;
          }).join('')}
        </div>

        <div style="background:rgba(24,24,27,0.9); border:1.5px solid #7c3aed; border-radius:var(--radius-04); padding:var(--space-12); margin-bottom:var(--space-12);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-06); gap:var(--space-08);">
            <h4 style="font-size:13px; color:#fef08a; margin:0; font-family:var(--font-display);">${t(currentDef.titleKey)}</h4>
            <span style="font-size:9px; color:#c084fc; font-style:italic; text-align:right;">${t(currentDef.subtitleKey)}</span>
          </div>

          <div style="font-size:9px; color:#94a3b8; margin-bottom:var(--space-08); background:rgba(0,0,0,0.4); padding:var(--space-04) var(--space-06); border-radius:var(--radius-03);"><b>${t('legacy.codex.unlock_condition')}:</b> ${t(currentDef.requirementKey)}</div>

          <div style="font-style:italic; font-size:10.5px; color:${isUnlocked ? '#fef08a' : '#71717a'}; background:rgba(0,0,0,0.5); border-left:2px solid ${isUnlocked ? '#a855f7' : '#52525b'}; padding:var(--space-08); margin-bottom:var(--space-10); line-height:1.4;">
            ${isUnlocked ? `“${t(currentDef.epilogueKey)}”` : `“${t('legacy.codex.unwritten')}”`}
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; background:${isUnlocked ? 'rgba(88,28,135,0.4)' : 'rgba(39,39,42,0.4)'}; border:1px dashed ${isUnlocked ? '#c084fc' : '#52525b'}; padding:var(--space-08) var(--space-10); border-radius:var(--radius-04); font-size:10px; color:${isUnlocked ? '#a7f3d0' : '#71717a'}; gap:var(--space-08);">
            <div>
              <div style="font-size:8.5px; color:#c084fc; font-weight:bold;">${t('legacy.codex.boon_label')}</div>
              <span style="font-weight:bold;">${t(currentDef.permanentModifier.labelKey)}</span>
            </div>
            ${isUnlocked ? `
              <button id="btn-equip-boon" data-id="${currentDef.id}" style="background:${activeBoonId === currentDef.id ? 'linear-gradient(180deg, #10b981, #059669)' : 'linear-gradient(180deg, #8b5cf6, #6d28d9)'}; border:1px solid #c084fc; border-radius:var(--radius-04); color:#fff; font-size:10px; font-weight:bold; padding:var(--space-04) var(--space-10); cursor:pointer;">
                ${activeBoonId === currentDef.id ? `✓ ${t('legacy.codex.active_boon')}` : t('legacy.codex.equip_boon')}
              </button>
            ` : `<span style="font-size:9px; color:#71717a; font-style:italic;">${t('common.locked')}</span>`}
          </div>
        </div>
      `;

      el.querySelectorAll('.btn-ending-card').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          selectedEndingId = (e.currentTarget as HTMLElement).getAttribute('data-ending-id') as any;
          refresh();
        });
      });
      el.querySelector('#btn-equip-boon')?.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-id') as any;
        legacyEndingSystem.setActiveBoon(id);
        refresh();
      });
      el.querySelector('#btn-close-codex')?.addEventListener('click', () => modalManager.close('legacy_codex_modal'));
    };

    refresh();
    return el;
  },
};
