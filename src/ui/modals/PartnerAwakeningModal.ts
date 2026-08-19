import { ModalInstance, modalManager } from '../components/ModalManager';
import { partyTeamSystem } from '../../systems/PartyTeamSystem';
import { getAllClasses, CharacterClassId } from '../../content/classes';
import { t } from '../../services/i18n/I18nService';

export const PartnerAwakeningModal: ModalInstance = {
  id: 'partner_awakening',
  render: (data?: { defaultClass?: CharacterClassId }) => {
    const classes = getAllClasses();
    let selectedClass: CharacterClassId = data?.defaultClass ?? 'swordsman';
    let partnerName = 'Ren the Shadow';

    const el = document.createElement('div');
    el.className = 'partner-awakening-container';
    el.style.cssText = 'text-align:center; max-width:460px;';

    el.innerHTML = `
      <div style="font-size:48px; margin-bottom:var(--space-08); animation:heroFloat 2s ease-in-out infinite;">
        ✨👥✨
      </div>
      <h2 style="font-family:var(--font-display); font-size:24px; color:#c084fc; letter-spacing:1px; text-shadow:0 0 15px rgba(192,132,252,0.6); margin-bottom:var(--space-06);">
        ${t('modal.partner_awakening.title')}
      </h2>
      <p style="color:var(--text-muted); font-size:12px; margin-bottom:var(--space-14); line-height:1.4;">
        ${t('modal.partner_awakening.desc')}
      </p>

      <!-- Name Input -->
      <div style="margin-bottom:var(--space-14); text-align:left;">
        <label style="font-size:11px; color:#cbd5e1; font-weight:bold; display:block; margin-bottom:var(--space-04);">
          ${t('modal.partner_awakening.name_label')}
        </label>
        <input id="partnerNameInput" type="text" value="${partnerName}" style="width:100%; height:36px; background:rgba(15,23,42,0.8); border:1px solid #c084fc; border-radius:var(--radius-06); padding:0 var(--space-10); color:#ffffff; font-size:13px; outline:none;" />
      </div>

      <!-- Class Selection Grid -->
      <div style="margin-bottom:var(--space-16); text-align:left;">
        <label style="font-size:11px; color:#cbd5e1; font-weight:bold; display:block; margin-bottom:var(--space-06);">
          ${t('modal.partner_awakening.class_label')}
        </label>
        <div class="partner-class-grid" style="display:grid; grid-template-columns:repeat(2, 1fr); gap:var(--space-08);">
          ${classes
            .map((c) => {
              const isSelected = c.id === selectedClass;
              return `
                <div class="partner-class-card ${isSelected ? 'selected' : ''}" data-class-id="${c.id}" style="border:2px solid ${isSelected ? c.themeColor : 'rgba(255,255,255,0.1)'}; background:rgba(15,23,42,0.9); border-radius:var(--radius-06); padding:var(--space-08); cursor:pointer; display:flex; align-items:center; gap:var(--space-08);">
                  <div style="font-size:18px; color:${c.themeColor};">${c.iconSvg}</div>
                  <div>
                    <div style="font-size:12px; font-weight:bold; color:${c.accentColor};">${t(c.nameKey)}</div>
                    <div style="font-size:9px; color:var(--text-muted);">${c.defaultName}</div>
                  </div>
                </div>
              `;
            })
            .join('')}
        </div>
      </div>

      <button id="btn-awaken-partner" style="width:100%; height:46px; background:linear-gradient(135deg, #9333ea, #c084fc); border:1px solid #f3e8ff; border-radius:var(--radius-08); color:#ffffff; font-weight:bold; font-size:16px; cursor:pointer; box-shadow:var(--glow-purple);">
        ${t('modal.partner_awakening.confirm_btn')}
      </button>
    `;

    const cards = el.querySelectorAll<HTMLElement>('.partner-class-card');
    cards.forEach((card) => {
      card.addEventListener('click', () => {
        const classId = card.getAttribute('data-class-id') as CharacterClassId;
        if (!classId) return;

        selectedClass = classId;
        cards.forEach((c) => {
          c.style.borderColor = 'rgba(255,255,255,0.1)';
          c.classList.remove('selected');
        });

        const chosen = classes.find((c) => c.id === classId);
        card.style.borderColor = chosen ? chosen.themeColor : '#c084fc';
        card.classList.add('selected');
      });
    });

    el.querySelector('#btn-awaken-partner')?.addEventListener('click', () => {
      const input = el.querySelector<HTMLInputElement>('#partnerNameInput');
      const finalName = input?.value.trim() || 'Ren the Shadow';

      partyTeamSystem.unlockSecondCharacter(finalName, selectedClass);
      modalManager.close('partner_awakening');
    });

    return el;
  },
};
