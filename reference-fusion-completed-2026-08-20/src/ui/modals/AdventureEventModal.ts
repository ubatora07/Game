import { ModalInstance, modalManager } from '../components/ModalManager';
import { adventureEventSystem } from '../../systems/AdventureEventSystem';
import { AdventureEventDefinition } from '../../core/events/AdventureEventTypes';
import { t } from '../../services/i18n/I18nService';
import { adventureEventDirector } from '../../systems/AdventureEventDirector';

export const AdventureEventModal: ModalInstance = {
  id: 'adventure_event_modal',
  dismissible: false,
  onClose: () => adventureEventDirector.releasePresentationPause(),
  render: (data?: { event?: AdventureEventDefinition }) => {
    const evt = data?.event;
    const el = document.createElement('div');
    el.className = 'adventure-event-modal-container pixel-fantasy-event';
    el.style.cssText = 'text-align:center; max-width:460px; padding:var(--space-16); background:radial-gradient(ellipse at 50% 20%, #1c1917 0%, #0c0a09 100%); border:2px solid #d97706; border-radius:var(--radius-06); box-shadow:var(--shadow-modal); position:relative;';

    if (!evt) {
      el.innerHTML = `<p style="color:#94a3b8; font-family:var(--font-display);">${t('modal.adventure.no_active')}</p>`;
      return el;
    }

    el.innerHTML = `
      <!-- Gothic Seal / Icon Decal -->
      <div style="width:54px; height:54px; margin:0 auto var(--space-10) auto; border-radius:50%; background:radial-gradient(circle, rgba(217,119,6,0.3), rgba(12,10,9,0.9)); border:2px solid #f59e0b; display:flex; align-items:center; justify-content:center; box-shadow:var(--glow-gold);">
        <span style="font-size:26px;">${evt.icon}</span>
      </div>

      <!-- Category Ribbon -->
      <div style="display:inline-block; background:rgba(217,119,6,0.2); border:1px solid #d97706; border-radius:var(--radius-03); padding:var(--space-02) var(--space-10); font-size:10px; font-weight:bold; color:#fde047; text-transform:uppercase; letter-spacing:1px; margin-bottom:var(--space-08); font-family:var(--font-display);">
        ✦ ${t('modal.adventure.category', { category: t(`event.category.${evt.category}`) })} ✦
      </div>

      <h2 style="font-family:var(--font-display); font-size:19px; color:#f8fafc; margin-bottom:var(--space-08); letter-spacing:0.5px; text-shadow:0 2px 4px rgba(0,0,0,0.8);">
        ${t(evt.titleKey)}
      </h2>

      <!-- Story Parchment Container -->
      <div style="background:rgba(28,25,23,0.85); border:1px solid #78350f; border-radius:var(--radius-04); padding:var(--space-12); margin-bottom:var(--space-16); text-align:left; box-shadow:var(--shadow-inset-soft);">
        <p style="color:#cbd5e1; font-size:12px; line-height:1.5; margin:0; font-family:var(--font-sans);">
          ${t(evt.descKey)}
        </p>
      </div>

      <!-- Choices List with Bronze Borders -->
      <div class="adventure-choices-list" style="display:flex; flex-direction:column; gap:var(--space-08);">
        ${evt.choices
          .map((c) => {
            const eligible = adventureEventSystem.isChoiceEligible(c);
            return `
          <button class="btn-adventure-choice" data-choice-id="${c.id}" ${eligible ? '' : 'disabled aria-disabled="true"'} style="width:100%; padding:var(--space-10) var(--space-14); background:linear-gradient(180deg, #292524 0%, #1c1917 100%); border:1px solid ${eligible ? '#b45309' : '#57534e'}; border-radius:var(--radius-04); color:${eligible ? '#fef08a' : '#78716c'}; font-size:12px; font-weight:bold; cursor:${eligible ? 'pointer' : 'not-allowed'}; opacity:${eligible ? '1' : '0.62'}; text-align:left; display:flex; justify-content:space-between; align-items:center; transition:all 0.15s ease; font-family:var(--font-display); box-shadow:var(--shadow-sm);">
            <span>${t(c.labelKey)}</span>
            <span style="font-size:11px; color:${eligible ? '#f59e0b' : '#78716c'};">${eligible ? '➔' : '🔒'}</span>
          </button>
        `;
          })
          .join('')}
      </div>
    `;

    const choiceBtns = el.querySelectorAll<HTMLElement>('.btn-adventure-choice');
    choiceBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const choiceId = btn.getAttribute('data-choice-id');
        const choice = evt.choices.find((c) => c.id === choiceId);
        if (choice && adventureEventSystem.isChoiceEligible(choice)) {
          // Close the decision modal first so follow-up hero/pet modals can open cleanly.
          // onClose also releases the combat pause owned by AdventureEventDirector.
          modalManager.close('adventure_event_modal');
          adventureEventSystem.executeChoice(evt, choice);
        }
      });
    });

    return el;
  },
};
