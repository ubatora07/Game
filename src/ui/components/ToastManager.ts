import { events } from '../../core/EventBus';

export class ToastManager {
  private static container: HTMLElement | null = null;

  public static init(container: HTMLElement): void {
    this.container = container;
    events.on('toast:show', ({ message, type }) => {
      this.show(message, type);
    });
  }

  public static show(message: string, type: 'info' | 'success' | 'warning' | 'gold' | 'epic' = 'info'): void {
    if (!this.container) return;

    const toast = document.createElement('div');
    toast.className = 'app-toast';
    
    let borderColor = '#94a3b8';
    let glowColor = 'rgba(148, 163, 184, 0.3)';

    if (type === 'gold') {
      borderColor = '#f59e0b';
      glowColor = 'rgba(245, 158, 11, 0.4)';
    } else if (type === 'epic') {
      borderColor = '#c084fc';
      glowColor = 'rgba(192, 132, 252, 0.5)';
    } else if (type === 'success') {
      borderColor = '#10b981';
      glowColor = 'rgba(16, 185, 129, 0.4)';
    }

    toast.style.cssText = `
      background: var(--surface-stone);
      border: 1px solid ${borderColor};
      box-shadow: 0 4px 20px ${glowColor};
      color: #ffffff;
      padding: 10px 18px;
      border-radius: var(--radius-sm);
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 8px;
      animation: modalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 8px;
      max-width: 320px;
    `;

    toast.innerHTML = message;
    this.container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 2800);
  }
}
