import { ModalInstance, modalManager } from '../components/ModalManager';
import { legacyEndingSystem } from '../../systems/LegacyEndingSystem';
import { getAllLegacyEndingDefs, getLegacyEndingDef } from '../../content/legacyEndingsCatalog';

export const LegacyCodexModal: ModalInstance = {
  id: 'legacy_codex_modal',
  render: () => {
    let selectedEndingId = legacyEndingSystem.getUnlockedEndings()[0]?.id || 'ending_savior_mountain_realm';

    const el = document.createElement('div');
    el.className = 'legacy-codex-modal-container pixel-fantasy-modal';
    el.style.cssText = 'max-width:560px; padding:16px; background:radial-gradient(ellipse at 50% 15%, #18181b 0%, #09090b 100%); border:2px solid #a855f7; border-radius:6px; box-shadow:0 0 35px rgba(168,85,247,0.3);';

    const refresh = () => {
      const allEndings = getAllLegacyEndingDefs();
      const currentDef = getLegacyEndingDef(selectedEndingId) || allEndings[0];
      const isUnlocked = legacyEndingSystem.isEndingUnlocked(currentDef.id);

      el.innerHTML = `
        <!-- Header -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1.5px solid #7c3aed; padding-bottom:8px;">
          <div>
            <div style="font-size:9px; color:#c084fc; font-weight:bold; letter-spacing:0.5px; font-family:var(--font-display);">
              ✦ SAMSARA SAGA CODEX & LEGACY ENDINGS ✦
            </div>
            <h3 style="font-family:var(--font-display); font-size:16px; color:#fef08a; margin:1px 0 0 0;">
              Pantheon of Ascendant Destinies
            </h3>
          </div>
          <button id="btn-close-codex" style="background:#18181b; border:1px solid #7c3aed; border-radius:4px; color:#c084fc; padding:4px 8px; font-family:var(--font-display); font-size:11px; cursor:pointer;">
            ✕ Close
          </button>
        </div>

        <!-- Endings Tab Grid -->
        <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:6px; margin-bottom:12px;">
          ${allEndings
            .map((def) => {
              const unlocked = legacyEndingSystem.isEndingUnlocked(def.id);
              const active = def.id === selectedEndingId;
              return `
              <button class="btn-ending-card" data-ending-id="${def.id}" style="display:flex; align-items:center; gap:8px; padding:8px; border-radius:4px; border:1.5px solid ${active ? '#c084fc' : unlocked ? '#581c87' : '#27272a'}; background:${active ? 'rgba(168,85,247,0.25)' : 'rgba(0,0,0,0.6)'}; text-align:left; cursor:pointer;">
                <div style="width:28px; height:28px; border-radius:4px; background:#09090b; border:1px solid ${unlocked ? '#a855f7' : '#52525b'}; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                  <div style="width:18px; height:18px; opacity:${unlocked ? '1' : '0.35'};">${def.iconSvg}</div>
                </div>
                <div style="overflow:hidden;">
                  <div style="font-size:11px; font-weight:bold; font-family:var(--font-display); color:${unlocked ? '#fef08a' : '#71717a'}; white-space:nowrap; text-overflow:ellipsis; overflow:hidden;">
                    ${def.defaultTitle}
                  </div>
                  <div style="font-size:8px; color:${unlocked ? '#34d399' : '#a1a1aa'}; font-weight:bold;">
                    ${unlocked ? '✓ LEGACY UNLOCKED' : '🔒 LOCKED DESTINY'}
                  </div>
                </div>
              </button>
            `;
            })
            .join('')}
        </div>

        <!-- Requirements & Epilogue Lore -->
        <div style="background:rgba(24,24,27,0.9); border:1.5px solid #7c3aed; border-radius:4px; padding:12px; margin-bottom:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <h4 style="font-size:13px; color:#fef08a; margin:0; font-family:var(--font-display);">
              ${currentDef.defaultTitle}
            </h4>
            <span style="font-size:9px; color:#c084fc; font-style:italic;">
              ${currentDef.subtitle}
            </span>
          </div>

          <!-- Requirements -->
          <div style="font-size:9px; color:#94a3b8; margin-bottom:8px; background:rgba(0,0,0,0.4); padding:4px 6px; border-radius:3px;">
            <b>Unlock Condition:</b> ${currentDef.requirementDesc}
          </div>

          <!-- Parchment Epilogue Lore -->
          <div style="font-style:italic; font-size:10.5px; color:${isUnlocked ? '#fef08a' : '#71717a'}; background:rgba(0,0,0,0.5); border-left:2px solid ${isUnlocked ? '#a855f7' : '#52525b'}; padding:8px; margin-bottom:10px; line-height:1.4;">
            ${isUnlocked ? `"${currentDef.epilogueText}"` : '« The pages of fate remain unwritten for this timeline. Meet the requirements in your journey to immortalize this destiny. »'}
          </div>

          <!-- Active Boon Banner & Equip Control -->
          <div style="display:flex; justify-content:space-between; align-items:center; background:${isUnlocked ? 'rgba(88,28,135,0.4)' : 'rgba(39,39,42,0.4)'}; border:1px dashed ${isUnlocked ? '#c084fc' : '#52525b'}; padding:8px 10px; border-radius:4px; font-size:10px; color:${isUnlocked ? '#a7f3d0' : '#71717a'};">
            <div>
              <div style="font-size:8.5px; color:#c084fc; font-weight:bold;">LEGACY BOON (EQUIP 1):</div>
              <span style="font-weight:bold;">${currentDef.permanentModifier.label}</span>
            </div>
            ${
              isUnlocked
                ? `<button id="btn-equip-boon" data-id="${currentDef.id}" style="
                    background:${legacyEndingSystem.getActiveBoon()?.id === currentDef.id ? 'linear-gradient(180deg, #10b981, #059669)' : 'linear-gradient(180deg, #8b5cf6, #6d28d9)'};
                    border:1px solid #c084fc;
                    border-radius:4px;
                    color:#fff;
                    font-size:10px;
                    font-weight:bold;
                    padding:4px 10px;
                    cursor:pointer;
                  ">
                    ${legacyEndingSystem.getActiveBoon()?.id === currentDef.id ? '✓ ACTIVE BOON' : 'EQUIP BOON'}
                  </button>`
                : `<span style="font-size:9px; color:#71717a; font-style:italic;">Locked</span>`
            }
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

      el.querySelector('#btn-close-codex')?.addEventListener('click', () => {
        modalManager.close('legacy_codex_modal');
      });
    };

    refresh();
    return el;
  },
};
