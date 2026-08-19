import { ModalInstance, modalManager } from '../components/ModalManager';
import { titleSystem } from '../../systems/TitleSystem';
import { getAllTitleDefs, getTitleDef } from '../../content/titlesCatalog';
import { TitleCategory } from '../../core/titles/TitleTypes';

export const TitleSelectionModal: ModalInstance = {
  id: 'title_selection_modal',
  render: () => {
    let currentCategory: TitleCategory | 'all' = 'all';
    let selectedTitleId: string | null = null;

    const el = document.createElement('div');
    el.className = 'title-selection-modal-container pixel-fantasy-modal';
    el.style.cssText = 'max-width:540px; padding:16px; background:radial-gradient(ellipse at 50% 15%, #1c1917 0%, #0c0a09 100%); border:2px solid #f59e0b; border-radius:6px; box-shadow:0 0 35px rgba(0,0,0,0.9), inset 0 0 20px rgba(245,158,11,0.2);';

    const refresh = () => {
      const allTitles = getAllTitleDefs();
      const filtered = allTitles.filter((t) => currentCategory === 'all' || t.category === currentCategory);
      const equipped = titleSystem.getEquippedTitle();

      const selected = selectedTitleId ? getTitleDef(selectedTitleId) : (filtered[0] || null);
      if (selected) selectedTitleId = selected.id;
      const isUnlocked = selected ? titleSystem.isTitleUnlocked(selected.id) : false;
      const isEquipped = selected && equipped && selected.id === equipped.id;

      el.innerHTML = `
        <!-- Header -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1.5px solid #78350f; padding-bottom:8px; flex-wrap:wrap; gap:8px;">
          <div>
            <div style="font-size:9px; color:#f59e0b; font-weight:bold; letter-spacing:0.5px; font-family:var(--font-display);">
              ✦ SOVEREIGN REPUTATION & TITLES ✦
            </div>
            <h3 style="font-family:var(--font-display); font-size:17px; color:#fef08a; margin:1px 0 0 0;">
              Player Titles Collection
            </h3>
          </div>

          <div style="font-size:11px; color:#38bdf8;">
            Equipped: <b style="color:#fde047;">${equipped ? equipped.defaultName : 'None'}</b>
          </div>
        </div>

        <!-- Category Tabs -->
        <div style="display:flex; gap:4px; margin-bottom:10px; flex-wrap:wrap;">
          ${(['all', 'settlement', 'karma', 'campaign', 'tower', 'achievement', 'social'] as const)
            .map(
              (cat) => `
            <button class="btn-title-cat" data-category="${cat}" style="padding:4px 8px; font-size:10px; font-weight:bold; font-family:var(--font-display); background:${currentCategory === cat ? 'linear-gradient(135deg, #d97706, #b45309)' : 'rgba(0,0,0,0.5)'}; border:1px solid ${currentCategory === cat ? '#f59e0b' : '#78350f'}; border-radius:3px; color:#ffffff; cursor:pointer;">
              ${cat.toUpperCase()}
            </button>
          `
            )
            .join('')}
        </div>

        <!-- Titles List (Left) + Inspection Panel (Right) -->
        <div style="display:grid; grid-template-columns: 1fr 1.1fr; gap:10px; margin-bottom:12px;">
          <!-- List -->
          <div style="display:flex; flex-direction:column; gap:6px; max-height:220px; overflow-y:auto; padding-right:4px;">
            ${filtered
              .map((t) => {
                const unl = titleSystem.isTitleUnlocked(t.id);
                const isEq = equipped && equipped.id === t.id;
                const isSel = t.id === selectedTitleId;

                return `
                <div class="title-card-tile" data-title-id="${t.id}" style="background:${isSel ? 'rgba(217,119,6,0.25)' : 'rgba(12,10,9,0.7)'}; border:1.5px solid ${isEq ? '#34d399' : isSel ? '#f59e0b' : '#78350f'}; border-radius:4px; padding:6px 8px; cursor:pointer; display:flex; align-items:center; justify-content:space-between;">
                  <div style="display:flex; align-items:center; gap:6px; overflow:hidden;">
                    <div style="width:20px; height:20px; flex-shrink:0;">${t.badgeSvg}</div>
                    <div style="font-size:10px; font-weight:bold; color:${unl ? '#fef08a' : '#64748b'}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                      ${t.defaultName}
                    </div>
                  </div>
                  ${isEq ? '<span style="font-size:8px; color:#34d399; font-weight:bold;">EQUIPPED</span>' : !unl ? '<span style="font-size:8px; color:#64748b;">🔒</span>' : ''}
                </div>
              `;
              })
              .join('')}
          </div>

          <!-- Inspection Panel -->
          ${
            selected
              ? `
            <div style="background:rgba(28,25,23,0.9); border:1.5px solid #b45309; border-radius:4px; padding:10px; display:flex; flex-direction:column; justify-content:space-between;">
              <div>
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                  <div style="width:34px; height:34px; border-radius:4px; background:#0c0a09; border:1px solid #f59e0b; display:flex; align-items:center; justify-content:center;">
                    ${selected.badgeSvg}
                  </div>
                  <div>
                    <div style="font-size:12px; font-weight:bold; color:#fef08a; font-family:var(--font-display);">${selected.defaultName}</div>
                    <div style="font-size:9px; color:#38bdf8;">CATEGORY: ${selected.category.toUpperCase()}</div>
                  </div>
                </div>

                <p style="font-size:10px; color:#cbd5e1; margin:0 0 8px 0; line-height:1.3;">
                  ${selected.description}
                </p>

                <!-- Modifiers -->
                ${
                  selected.modifiers && selected.modifiers.length > 0
                    ? `
                  <div style="background:rgba(0,0,0,0.4); padding:6px; border-radius:3px; font-size:10px; margin-bottom:8px;">
                    <div style="color:#34d399; font-weight:bold; font-size:9px;">TITLE ATTRIBUTES:</div>
                    ${selected.modifiers.map((m) => `<div style="color:#fde047;">✦ ${m.label}</div>`).join('')}
                  </div>
                `
                    : '<div style="font-size:9px; color:#94a3b8; margin-bottom:8px;">Honorary Social Title.</div>'
                }

                <div style="font-size:9px; color:#94a3b8;">
                  <b>Unlock Requirement:</b> ${selected.unlockCondition.description}
                </div>
              </div>

              ${
                isUnlocked
                  ? `
                <button id="btn-toggle-equip-title" style="width:100%; margin-top:8px; padding:8px; background:${isEquipped ? '#451a03' : 'linear-gradient(135deg, #10b981, #059669)'}; border:1px solid ${isEquipped ? '#78350f' : '#34d399'}; border-radius:4px; color:#ffffff; font-family:var(--font-display); font-weight:bold; font-size:11px; cursor:pointer;">
                  ${isEquipped ? 'UNEQUIP TITLE' : '✦ EQUIP TITLE ✦'}
                </button>
              `
                  : `
                <div style="text-align:center; padding:6px; background:#292524; border:1px solid #451a03; border-radius:4px; color:#78716c; font-size:10px; font-weight:bold; margin-top:8px;">
                  🔒 TITLE LOCKED
                </div>
              `
              }
            </div>
          `
              : '<div style="color:#94a3b8; font-size:11px;">Select a title to inspect.</div>'
          }
        </div>

        <button id="btn-close-titles" style="width:100%; padding:8px; background:#1c1917; border:1px solid #78350f; border-radius:4px; color:#cbd5e1; font-family:var(--font-display); font-size:12px; cursor:pointer;">
          Close Titles
        </button>
      `;

      // Event bindings
      el.querySelectorAll('.btn-title-cat').forEach((btn) => {
        btn.addEventListener('click', () => {
          currentCategory = btn.getAttribute('data-category') as any;
          const firstInCat = getAllTitleDefs().find((t) => currentCategory === 'all' || t.category === currentCategory);
          if (firstInCat) selectedTitleId = firstInCat.id;
          refresh();
        });
      });

      el.querySelectorAll('.title-card-tile').forEach((card) => {
        card.addEventListener('click', () => {
          selectedTitleId = card.getAttribute('data-title-id');
          refresh();
        });
      });

      el.querySelector('#btn-toggle-equip-title')?.addEventListener('click', () => {
        if (selectedTitleId) {
          if (isEquipped) {
            titleSystem.equipTitle(null);
          } else {
            titleSystem.equipTitle(selectedTitleId);
          }
          refresh();
        }
      });

      el.querySelector('#btn-close-titles')?.addEventListener('click', () => {
        modalManager.close('title_selection_modal');
      });
    };

    refresh();
    return el;
  },
};
