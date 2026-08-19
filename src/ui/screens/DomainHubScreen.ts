import { events } from '../../core/EventBus';
import { t } from '../../services/i18n/I18nService';
import { sound } from '../../services/audio/SoundService';
import { resolveUIIcon } from '../art/runtime/UIIconRegistry';

export type DomainHubActionType = 'screen' | 'modal';

export interface DomainHubAction {
  id: string;
  targetId: string;
  type: DomainHubActionType;
  iconId: string;
  labelKey: string;
  descriptionKey: string;
  accent: string;
}

export interface DomainHubConfig {
  id: string;
  iconId: string;
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
          <div class="domain-hub-emblem" aria-hidden="true">${resolveUIIcon(this.config.iconId).fallbackSvg}</div>
          <div class="domain-hub-heading-copy">
            <div class="domain-hub-eyebrow">${t(this.config.eyebrowKey)}</div>
            <h2 id="${this.config.id}DomainTitle" class="domain-hub-title">${t(this.config.titleKey)}</h2>
            <p class="domain-hub-subtitle">${t(this.config.subtitleKey)}</p>
          </div>
        </header>

        <div class="domain-hub-grid">
          ${this.config.actions.map((action, focusIndex) => `
            <button
              type="button"
              class="domain-hub-action"
              data-domain-action="${action.id}"
              data-action-type="${action.type}"
              data-action-target="${action.targetId}"
              data-focus-group="${this.config.id}-domain-actions"
              data-focus-order="${focusIndex}"
              tabindex="${focusIndex === 0 ? '0' : '-1'}"
              style="--domain-accent:${action.accent};"
            >
              <span class="domain-hub-action-icon" aria-hidden="true">${resolveUIIcon(action.iconId).fallbackSvg}</span>
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

    this.el.querySelectorAll<HTMLButtonElement>('.domain-hub-action').forEach((button) => {
      button.addEventListener('focus', () => this.setRovingFocus(button));
      button.addEventListener('keydown', (event) => this.handleActionKeydown(event, button));
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

  private getActionButtons(): HTMLButtonElement[] {
    return Array.from(this.el.querySelectorAll<HTMLButtonElement>('.domain-hub-action'));
  }

  private setRovingFocus(target: HTMLButtonElement): void {
    this.getActionButtons().forEach((button) => {
      button.tabIndex = button === target ? 0 : -1;
    });
  }

  private handleActionKeydown(event: KeyboardEvent, current: HTMLButtonElement): void {
    const buttons = this.getActionButtons();
    const currentIndex = buttons.indexOf(current);
    if (currentIndex < 0 || buttons.length === 0) return;

    let nextIndex = currentIndex;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % buttons.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = buttons.length - 1;
    else return;

    event.preventDefault();
    this.setRovingFocus(buttons[nextIndex]);
    buttons[nextIndex].focus();
  }
}
