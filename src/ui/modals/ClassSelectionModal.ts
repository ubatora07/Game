import { ModalInstance, modalManager } from '../components/ModalManager';
import { getAllClasses, CharacterClassId } from '../../content/classes';
import { classSystem } from '../../systems/ClassSystem';
import { t } from '../../services/i18n/I18nService';

export const ClassSelectionModal: ModalInstance = {
  id: 'class_selection',
  render: () => {
    const classes = getAllClasses();
    let currentSelected: CharacterClassId = classSystem.getSelectedClassId() || 'swordsman';

    const el = document.createElement('div');
    el.className = 'class-selection-container pixel-fantasy-class-tree';
    el.style.cssText = 'max-width:540px; padding:16px; background:radial-gradient(ellipse at 50% 15%, #1c1917 0%, #0c0a09 100%); border:2px solid #d97706; border-radius:6px; box-shadow:0 0 35px rgba(0,0,0,0.9), inset 0 0 20px rgba(217,119,6,0.15);';

    el.innerHTML = `
      <div style="text-align:center; margin-bottom:12px;">
        <div style="font-size:10px; color:#f59e0b; font-weight:bold; letter-spacing:1px; text-transform:uppercase; font-family:var(--font-display);">
          ✦ SANCTUARY OF CLASS ASCENSION ✦
        </div>
        <h2 style="font-family:var(--font-display); font-size:20px; color:#fde047; margin:2px 0 4px 0; text-shadow:0 2px 6px rgba(0,0,0,0.8);">
          ${t('modal.class_selection.title')}
        </h2>
        <p style="color:#cbd5e1; font-size:11px; margin:0; line-height:1.4;">
          ${t('modal.class_selection.subtitle')}
        </p>
      </div>

      <!-- Class Cards Grid with Forged Plates -->
      <div class="class-cards-grid" style="display:grid; grid-template-columns:repeat(2, 1fr); gap:10px; margin-bottom:16px;">
        ${classes
          .map((c) => {
            const isSelected = c.id === currentSelected;
            return `
              <div class="class-card ${isSelected ? 'selected' : ''}" data-class-id="${c.id}" style="border:1.5px solid ${isSelected ? '#f59e0b' : '#451a03'}; background:${isSelected ? 'rgba(217,119,6,0.15)' : 'rgba(28,25,23,0.85)'}; border-radius:4px; padding:10px; cursor:pointer; transition:all 0.18s ease; box-shadow:${isSelected ? '0 0 12px rgba(245,158,11,0.4)' : 'inset 0 1px 3px rgba(0,0,0,0.8)'};">
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                  <div style="width:28px; height:28px; color:${c.themeColor}; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.5); border:1px solid ${c.themeColor}50; border-radius:3px;">${c.iconSvg}</div>
                  <div style="font-size:13px; font-weight:bold; color:${c.accentColor}; font-family:var(--font-display);">${t(c.nameKey)}</div>
                </div>

                <div style="font-size:10px; color:#94a3b8; margin-bottom:8px; min-height:30px; line-height:1.35;">
                  ${t(c.descKey)}
                </div>

                <div style="font-size:10px; display:grid; grid-template-columns:1fr 1fr; gap:4px; margin-bottom:8px; color:#cbd5e1; background:rgba(0,0,0,0.4); padding:6px; border-radius:3px;">
                  <div>ATK: <b style="color:#fde047;">+${Math.round((c.baseStats.attackMultiplier - 1) * 100)}%</b></div>
                  <div>SPD: <b style="color:#34d399;">+${Math.round((c.baseStats.attackSpeedMultiplier - 1) * 100)}%</b></div>
                  <div>CRIT: <b style="color:#f472b6;">+${Math.round(c.baseStats.critChanceBonus * 100)}%</b></div>
                  <div>BOSS: <b style="color:#60a5fa;">+${Math.round(c.baseStats.bossDamageBonus * 100)}%</b></div>
                </div>

                <div style="display:flex; flex-wrap:wrap; gap:3px;">
                  ${c.starterPerks.map((p) => `<span style="font-size:9px; background:rgba(217,119,6,0.12); border:1px solid rgba(217,119,6,0.25); color:#fde047; padding:1px 5px; border-radius:2px;">✦ ${p}</span>`).join('')}
                </div>
              </div>
            `;
          })
          .join('')}
      </div>

      <button id="btn-confirm-class" style="width:100%; height:44px; background:linear-gradient(135deg, #d97706, #b45309); border:1px solid #f59e0b; border-radius:4px; color:#ffffff; font-family:var(--font-display); font-weight:900; font-size:14px; letter-spacing:1px; cursor:pointer; box-shadow:0 0 15px rgba(217,119,6,0.5);">
        ${t('btn.confirm')}
      </button>
    `;

    const cards = el.querySelectorAll<HTMLElement>('.class-card');
    cards.forEach((card) => {
      card.addEventListener('click', () => {
        const classId = card.getAttribute('data-class-id') as CharacterClassId;
        if (!classId) return;

        currentSelected = classId;
        cards.forEach((c) => {
          c.style.borderColor = '#451a03';
          c.style.background = 'rgba(28,25,23,0.85)';
          c.style.boxShadow = 'inset 0 1px 3px rgba(0,0,0,0.8)';
          c.classList.remove('selected');
        });

        card.style.borderColor = '#f59e0b';
        card.style.background = 'rgba(217,119,6,0.15)';
        card.style.boxShadow = '0 0 12px rgba(245,158,11,0.4)';
        card.classList.add('selected');
      });
    });

    el.querySelector('#btn-confirm-class')?.addEventListener('click', () => {
      classSystem.selectClass(currentSelected, true);
      modalManager.close('class_selection');
    });

    return el;
  },
};
