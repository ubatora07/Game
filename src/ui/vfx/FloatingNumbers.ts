import { BigNumber } from '../../core/BigNumber';

export class FloatingNumbers {
  private static container: HTMLElement | null = null;
  private static pool: HTMLElement[] = [];
  private static active: { el: HTMLElement; timeoutId: number }[] = [];
  private static readonly MAX_ACTIVE = 20;
  private static readonly MAX_POOL = 30;

  public static init(container: HTMLElement): void {
    this.container = container;
    // Pre-populate pool
    if (typeof document !== 'undefined') {
      while (this.pool.length < 15) {
        const el = document.createElement('div');
        el.className = 'floating-number';
        el.style.display = 'none';
        this.pool.push(el);
      }
    }
  }

  public static spawn(x: number, y: number, value: number | string, isCrit: boolean = false, prefix: string = '+'): void {
    if (!this.container) return;

    // Skip VFX when reduced motion is requested or tab is hidden
    if (typeof document !== 'undefined' && document.hidden) return;

    // Check maximum active budget
    if (this.active.length >= this.MAX_ACTIVE) {
      const oldest = this.active.shift();
      if (oldest) {
        clearTimeout(oldest.timeoutId);
        this.recycle(oldest.el);
      }
    }

    const el: HTMLElement = this.pool.pop() || (typeof document !== 'undefined'
      ? document.createElement('div')
      : ({ style: {}, className: '', innerHTML: '' } as any));

    el.className = `floating-number ${isCrit ? 'crit' : ''}`;
    el.style.display = 'block';

    // Position near coordinates with slight jitter
    const jitterX = (Math.random() - 0.5) * 36;
    const jitterY = (Math.random() - 0.5) * 18;

    el.style.left = `${x + jitterX}px`;
    el.style.top = `${y + jitterY}px`;

    const formatted = typeof value === 'number' ? BigNumber.format(value) : value;
    el.innerHTML = isCrit
      ? `💥 CRITICAL<br/><span style="font-size:1.15em">${prefix}${formatted}</span>`
      : `${prefix}${formatted}`;

    if (!el.parentNode) {
      this.container.appendChild(el);
    }

    const timeoutId = (setTimeout(() => {
      this.recycle(el!);
      const idx = this.active.findIndex(a => a.el === el);
      if (idx !== -1) {
        this.active.splice(idx, 1);
      }
    }, 700) as unknown) as number;

    this.active.push({ el, timeoutId });
  }

  private static recycle(el: HTMLElement): void {
    el.style.display = 'none';
    if (this.pool.length < this.MAX_POOL) {
      this.pool.push(el);
    } else if (el.parentNode) {
      el.parentNode.removeChild(el);
    }
  }

  public static clear(): void {
    for (const item of this.active) {
      clearTimeout(item.timeoutId);
      this.recycle(item.el);
    }
    this.active = [];
  }

  public static getPoolStats(): { pooled: number; active: number } {
    return {
      pooled: this.pool.length,
      active: this.active.length,
    };
  }
}
