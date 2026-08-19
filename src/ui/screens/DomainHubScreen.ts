import { events } from '../../core/EventBus';
import { t } from '../../services/i18n/I18nService';
import { sound } from '../../services/audio/SoundService';

export type DomainHubActionType = 'screen' | 'modal';

export interface DomainHubAction {
  id: string;
  targetId: string;
  type: DomainHubActionType;
  icon: string;
  labelKey: string;
  descriptionKey: string;
  accent: string;
}

export interface DomainHubConfig {
  id: string;
  icon: string;
  eyebrowKey: string;
  titleKey: string;
  subtitleKey: string;
  actions: readonly DomainHubAction[];
}

export class DomainHubScreen {
  private readonly el: HTMLElement;

  constructor(private readonly config: DomainHubConfig) {
    this.el = document.createElement('div');
    this.el.className = 'screen-container domain-hub-screen';
    this.render();
    document.addEventListener('i18n:change', () => this.render());
  }

  public getElement(): HTMLElement {
    return this.el;
  }

  private render(): void {
    this.el.id = `${this.config.id}DomainHub`;
    this.el.innerHTML = `
      <section class="domain-hub-shell" aria-labelledby="${this.config.id}DomainTitle">
        <header class="domain-hub-header">
          <div class="domain-hub-emblem" aria-hidden="true">${this.config.icon}</div>
          <div class="domain-hub-heading-copy">
            <div class="domain-hub-eyebrow">${t(this.config.eyebrowKey)}</div>
            <h2 id="${this.config.id}DomainTitle" class="domain-hub-title">${t(this.config.titleKey)}</h2>
            <p class="domain-hub-subtitle">${t(this.config.subtitleKey)}</p>
          </div>
        </header>

        <div class="domain-hub-grid">
          ${this.config.actions.map((action) => `
            <button
              type="button"
              class="domain-hub-action"
              data-domain-action="${action.id}"
              data-action-type="${action.type}"
              data-action-target="${action.targetId}"
              style="--domain-accent:${action.accent};"
            >
              <span class="domain-hub-action-icon" aria-hidden="true">${action.icon}</span>
              <span class="domain-hub-action-copy">
                <strong>${t(action.labelKey)}</strong>
                <small>${t(action.descriptionKey)}</small>
              </span>
              <span class="domain-hub-action-arrow" aria-hidden="true">›</span>
            </button>
          `).join('')}
        </div>
      </section>
    `;

    this.el.querySelectorAll<HTMLElement>('.domain-hub-action').forEach((button) => {
      button.addEventListener('click', () => {
        const actionType = button.dataset.actionType as DomainHubActionType | undefined;
        const targetId = button.dataset.actionTarget;
        if (!actionType || !targetId) return;

        sound.playTap();
        if (actionType === 'screen') {
          events.emit('screen:change', { screenId: targetId });
        } else {
          events.emit('modal:open', { modalId: targetId });
        }
      });
    });
  }
}
