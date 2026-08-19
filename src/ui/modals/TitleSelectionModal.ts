import { ModalInstance, modalManager } from '../components/ModalManager';
import { titleSystem } from '../../systems/TitleSystem';
import { getAllTitleDefs, getTitleDef } from '../../content/titlesCatalog';
import { TitleCategory } from '../../core/titles/TitleTypes';
import { t } from '../../services/i18n/I18nService';

export const TitleSelectionModal: ModalInstance = {
  id: 'title_selection_modal',
  render: () => {
    let currentCategory: TitleCategory | 'all' = 'all';
    let selectedTitleId: string | null = null;

    const el = document.createElement('div');
    el.className = 'title-selection-modal-container pixel-fantasy-modal';
    el.style.cssText = 'max-width:540px; padding:var(--space-16); background:radial-gradient(ellipse at 50% 15%, #1c1917 0%, #0c0a09 100%); border:2px solid #f59e0b; border-radius:var(--radius-06); box-shadow:var(--shadow-modal);';

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
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-12); border-bottom:1.5px solid #78350f; padding-bottom:var(--space-08); flex-wrap:wrap; gap:var(--space-08);">
          <div>
            <div style="font-size:9px; color:#f59e0b; font-weight:bold; letter-spacing:0.5px; font-family:var(--font-display);">
              ✦ ${t('titles.reputation_label')} ✦
            </div>
            <h3 style="font-family:var(--font-display); font-size:17px; color:#fef08a; margin:var(--space-01) 0 0 0;">
              ${t('titles.collection_title')}
            </h3>
          </div>

          <div style="font-size:11px; color:#38bdf8;">
            ${t('titles.equipped')}: <b style="color:#fde047;">${equipped ? t(equipped.nameKey) : t('common.none')}</b>
          </div>
        </div>

        <!-- Category Tabs -->
        <div style="display:flex; gap:var(--space-04); margin-bottom:var(--space-10); flex-wrap:wrap;">
          ${(['all', 'settlement', 'karma', 'campaign', 'tower', 'achievement', 'social'] as const)
            .map(
              (cat) => `
            <button class="btn-title-cat" data-category="${cat}" style="padding:var(--space-04) var(--space-08); font-size:10px; font-weight:bold; font-family:var(--font-display); background:${currentCategory === cat ? 'linear-gradient(135deg, #d97706, #b45309)' : 'rgba(0,0,0,0.5)'}; border:1px solid ${currentCategory === cat ? '#f59e0b' : '#78350f'}; border-radius:var(--radius-03); color:#ffffff; cursor:pointer;">
              ${t(`titles.category.${cat}`)}
            </button>
          `
            )
            .join('')}
        </div>

        <!-- Titles List (Left) + Inspection Panel (Right) -->
        <div style="display:grid; grid-template-columns: 1fr 1.1fr; gap:var(--space-10); margin-bottom:var(--space-12);">
          <!-- List -->
          <div style="display:flex; flex-direction:column; gap:var(--space-06); max-height:220px; overflow-y:auto; padding-right:var(--space-04);">
            ${filtered
              .map((titleDef) => {
                const unl = titleSystem.isTitleUnlocked(titleDef.id);
                const isEq = equipped && equipped.id === titleDef.id;
                const isSel = titleDef.id === selectedTitleId;

                return `
                <div class="title-card-tile" data-title-id="${titleDef.id}" style="background:${isSel ? 'rgba(217,119,6,0.25)' : 'rgba(12,10,9,0.7)'}; border:1.5px solid ${isEq ? '#34d399' : isSel ? '#f59e0b' : '#78350f'}; border-radius:var(--radius-04); padding:var(--space-06) var(--space-08); cursor:pointer; display:flex; align-items:center; justify-content:space-between;">
                  <div style="display:flex; align-items:center; gap:var(--space-06); overflow:hidden;">
                    <div style="width:20px; height:20px; flex-shrink:0;">${titleDef.badgeSvg}</div>
                    <div style="font-size:10px; font-weight:bold; color:${unl ? '#fef08a' : '#64748b'}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                      ${t(titleDef.nameKey)}
                    </div>
                  </div>
                  ${isEq ? `<span style="font-size:8px; color:#34d399; font-weight:bold;">${t('equipment.equipped')}</span>` : !unl ? '<span style="font-size:8px; color:#64748b;">🔒</span>' : ''}
                </div>
              `;
              })
              .join('')}
          </div>

          <!-- Inspection Panel -->
          ${
            selected
              ? `
            <div style="background:rgba(28,25,23,0.9); border:1.5px solid #b45309; border-radius:var(--radius-04); padding:var(--space-10); display:flex; flex-direction:column; justify-content:space-between;">
              <div>
                <div style="display:flex; align-items:center; gap:var(--space-08); margin-bottom:var(--space-06);">
                  <div style="width:34px; height:34px; border-radius:var(--radius-04); background:#0c0a09; border:1px solid #f59e0b; display:flex; align-items:center; justify-content:center;">
                    ${selected.badgeSvg}
                  </div>
                  <div>
                    <div style="font-size:12px; font-weight:bold; color:#fef08a; font-family:var(--font-display);">${t(selected.nameKey)}</div>
                    <div style="font-size:9px; color:#38bdf8;">${t('titles.category_label')}: ${t(`titles.category.${selected.category}`)}</div>
                  </div>
                </div>

                <p style="font-size:10px; color:#cbd5e1; margin:0 0 var(--space-08) 0; line-height:1.3;">
                  ${selected.descriptionKey ? t(selected.descriptionKey) : selected.description}
                </p>

                <!-- Modifiers -->
                ${
                  selected.modifiers && selected.modifiers.length > 0
                    ? `
                  <div style="background:rgba(0,0,0,0.4); padding:var(--space-06); border-radius:var(--radius-03); font-size:10px; margin-bottom:var(--space-08);">
                    <div style="color:#34d399; font-weight:bold; font-size:9px;">${t('titles.attributes')}:</div>
                    ${selected.modifiers.map((m) => `<div style="color:#fde047;">✦ ${m.labelKey ? t(m.labelKey) : m.label}</div>`).join('')}
                  </div>
                `
                    : `<div style="font-size:9px; color:#94a3b8; margin-bottom:var(--space-08);">${t('titles.honorary')}</div>`
                }

                <div style="font-size:9px; color:#94a3b8;">
                  <b>${t('titles.unlock_requirement')}:</b> ${selected.unlockCondition.descriptionKey ? t(selected.unlockCondition.descriptionKey) : selected.unlockCondition.description}
                </div>
              </div>

              ${
                isUnlocked
                  ? `
                <button id="btn-toggle-equip-title" style="width:100%; margin-top:var(--space-08); padding:var(--space-08); background:${isEquipped ? '#451a03' : 'linear-gradient(135deg, #10b981, #059669)'}; border:1px solid ${isEquipped ? '#78350f' : '#34d399'}; border-radius:var(--radius-04); color:#ffffff; font-family:var(--font-display); font-weight:bold; font-size:11px; cursor:pointer;">
                  ${isEquipped ? t('titles.unequip') : `✦ ${t('titles.equip')} ✦`}
                </button>
              `
                  : `
                <div style="text-align:center; padding:var(--space-06); background:#292524; border:1px solid #451a03; border-radius:var(--radius-04); color:#78716c; font-size:10px; font-weight:bold; margin-top:var(--space-08);">
                  🔒 ${t('titles.locked')}
                </div>
              `
              }
            </div>
          `
              : `<div style="color:#94a3b8; font-size:11px;">${t('titles.select_title')}</div>`
          }
        </div>

        <button id="btn-close-titles" style="width:100%; padding:var(--space-08); background:#1c1917; border:1px solid #78350f; border-radius:var(--radius-04); color:#cbd5e1; font-family:var(--font-display); font-size:12px; cursor:pointer;">
          ${t('titles.close')}
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
