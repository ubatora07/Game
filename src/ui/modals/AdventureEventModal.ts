import { ModalInstance, modalManager } from '../components/ModalManager';
import { adventureEventSystem } from '../../systems/AdventureEventSystem';
import { AdventureEventDefinition } from '../../core/events/AdventureEventTypes';
import { t } from '../../services/i18n/I18nService';

export const AdventureEventModal: ModalInstance = {
  id: 'adventure_event_modal',
  render: (data?: { event?: AdventureEventDefinition }) => {
    const evt = data?.event;
    const el = document.createElement('div');
    el.className = 'adventure-event-modal-container pixel-fantasy-event';
    el.style.cssText = 'text-align:center; max-width:460px; padding:16px; background:radial-gradient(ellipse at 50% 20%, #1c1917 0%, #0c0a09 100%); border:2px solid #d97706; border-radius:6px; box-shadow:0 0 30px rgba(0,0,0,0.9), inset 0 0 20px rgba(217,119,6,0.2); position:relative;';

    if (!evt) {
      el.innerHTML = `<p style="color:#94a3b8; font-family:var(--font-display);">No active realm encounter.</p>`;
      return el;
    }

    el.innerHTML = `
      <!-- Gothic Seal / Icon Decal -->
      <div style="width:54px; height:54px; margin:0 auto 10px auto; border-radius:50%; background:radial-gradient(circle, rgba(217,119,6,0.3), rgba(12,10,9,0.9)); border:2px solid #f59e0b; display:flex; align-items:center; justify-content:center; box-shadow:0 0 15px rgba(245,158,11,0.4);">
        <span style="font-size:26px;">${evt.icon}</span>
      </div>

      <!-- Category Ribbon -->
      <div style="display:inline-block; background:rgba(217,119,6,0.2); border:1px solid #d97706; border-radius:3px; padding:2px 10px; font-size:10px; font-weight:bold; color:#fde047; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; font-family:var(--font-display);">
        ✦ ${evt.category} ENCOUNTER ✦
      </div>

      <h2 style="font-family:var(--font-display); font-size:19px; color:#f8fafc; margin-bottom:8px; letter-spacing:0.5px; text-shadow:0 2px 4px rgba(0,0,0,0.8);">
        ${t(evt.titleKey)}
      </h2>

      <!-- Story Parchment Container -->
      <div style="background:rgba(28,25,23,0.85); border:1px solid #78350f; border-radius:4px; padding:12px; margin-bottom:16px; text-align:left; box-shadow:inset 0 1px 4px rgba(0,0,0,0.8);">
        <p style="color:#cbd5e1; font-size:12px; line-height:1.5; margin:0; font-family:var(--font-sans);">
          ${t(evt.descKey)}
        </p>
      </div>

      <!-- Choices List with Bronze Borders -->
      <div class="adventure-choices-list" style="display:flex; flex-direction:column; gap:8px;">
        ${evt.choices
          .map(
            (c) => `
          <button class="btn-adventure-choice" data-choice-id="${c.id}" style="width:100%; padding:10px 14px; background:linear-gradient(180deg, #292524 0%, #1c1917 100%); border:1px solid #b45309; border-radius:4px; color:#fef08a; font-size:12px; font-weight:bold; cursor:pointer; text-align:left; display:flex; justify-content:space-between; align-items:center; transition:all 0.15s ease; font-family:var(--font-display); box-shadow:0 2px 5px rgba(0,0,0,0.6);">
            <span>${t(c.labelKey)}</span>
            <span style="font-size:11px; color:#f59e0b;">➔</span>
          </button>
        `
          )
          .join('')}
      </div>
    `;

    const choiceBtns = el.querySelectorAll<HTMLElement>('.btn-adventure-choice');
    choiceBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const choiceId = btn.getAttribute('data-choice-id');
        const choice = evt.choices.find((c) => c.id === choiceId);
        if (choice) {
          adventureEventSystem.executeChoice(evt, choice);
          modalManager.close('adventure_event_modal');
        }
      });
    });

    return el;
  },
};
