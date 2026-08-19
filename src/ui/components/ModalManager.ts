import { events } from '../../core/EventBus';

export interface ModalInstance {
  id: string;
  render: (data?: any) => HTMLElement;
  onClose?: () => void;
}

export class ModalManager {
  private static instance: ModalManager;
  private container: HTMLElement | null = null;
  private registeredModals: Map<string, ModalInstance> = new Map();
  private activeModalId: string | null = null;

  private constructor() {
    this.bindKeyboard();
  }

  public static getInstance(): ModalManager {
    if (!ModalManager.instance) {
      ModalManager.instance = new ModalManager();
    }
    return ModalManager.instance;
  }

  public init(container: HTMLElement): void {
    this.container = container;

    events.on('modal:open', ({ modalId, data }) => {
      this.open(modalId, data);
    });

    events.on('modal:close', ({ modalId }) => {
      this.close(modalId);
    });
  }

  public register(modal: ModalInstance): void {
    this.registeredModals.set(modal.id, modal);
  }

  public open(modalId: string, data?: any): void {
    if (!this.container) return;
    const modalDef = this.registeredModals.get(modalId);
    if (!modalDef) return;

    this.activeModalId = modalId;
    this.container.innerHTML = '';
    this.container.style.display = 'flex';

    // Backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(4, 3, 2, 0.88);
      z-index: 100;
    `;
    backdrop.addEventListener('click', () => this.close(modalId));

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'modal-content-animated';
    contentWrapper.style.cssText = `
      position: relative;
      z-index: 101;
      max-width: 480px;
      width: 90%;
      max-height: 85vh;
      overflow-y: auto;
      background: var(--surface-stone);
      border: 1px solid var(--frame-bronze);
      box-shadow: var(--shadow-lg), var(--shadow-inset-frame);
      border-radius: var(--radius-md);
      padding: 24px;
    `;

    const renderedModal = modalDef.render(data);
    contentWrapper.appendChild(renderedModal);

    this.container.appendChild(backdrop);
    this.container.appendChild(contentWrapper);
  }

  public close(modalId?: string): void {
    if (!this.container) return;
    if (modalId && this.activeModalId !== modalId) return;

    if (this.activeModalId) {
      const modalDef = this.registeredModals.get(this.activeModalId);
      if (modalDef?.onClose) {
        modalDef.onClose();
      }
    }

    this.container.innerHTML = '';
    this.container.style.display = 'none';
    this.activeModalId = null;
  }

  private bindKeyboard(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.activeModalId) {
          this.close(this.activeModalId);
        }
      });
    }
  }
}

export const modalManager = ModalManager.getInstance();
