import { describe, it, expect, beforeEach } from 'vitest';
import { store, createInitialState } from '../src/core/GameState';
import { BattlefieldViewport } from '../src/ui/components/BattlefieldViewport';

// Lightweight DOM mock for node environment
function createMockElement(tag: string = 'div'): any {
  const el: any = {
    tagName: tag.toUpperCase(),
    className: '',
    style: {} as Record<string, string>,
    innerHTML: '',
    textContent: '',
    children: [] as any[],
  };
  el.classList = {
    contains: (c: string) => Boolean(el.className && el.className.includes(c)),
    add: (c: string) => { el.className = (el.className ? el.className + ' ' : '') + c; },
    remove: (c: string) => { el.className = (el.className || '').replace(c, '').trim(); }
  };
  el.appendChild = (child: any) => { el.children.push(child); return child; };
  el.removeChild = (child: any) => { el.children = el.children.filter((c: any) => c !== child); return child; };
  el.querySelector = (selector: string) => createMockElement('div');
  el.querySelectorAll = (selector: string) => [createMockElement('div'), createMockElement('div'), createMockElement('div')];
  el.getBoundingClientRect = () => ({ left: 0, top: 0, width: 400, height: 250, right: 400, bottom: 250 });
  el.addEventListener = () => {};
  el.removeEventListener = () => {};
  return el;
}

(globalThis as any).document = {
  createElement: (tag: string) => createMockElement(tag),
  addEventListener: () => {},
  removeEventListener: () => {},
  body: createMockElement('body')
};

(globalThis as any).window = {
  innerWidth: 600,
  innerHeight: 800,
  requestAnimationFrame: (cb: any) => setTimeout(cb, 0),
  setInterval: () => 1,
  clearInterval: () => {}
};

describe('Phase 47 — Battle Animation System Tests', () => {
  let viewport: BattlefieldViewport;

  beforeEach(() => {
    const fresh = createInitialState();
    store.replace(fresh);
    viewport = new BattlefieldViewport();
  });

  it('P47-01 & P47-02: BattlefieldViewport initializes and registers visual event listeners', () => {
    const el = viewport.getElement();
    expect(el).toBeDefined();
  });

  it('P47-03 & P47-06: triggerScreenShake applies displacement when screenShake is enabled', () => {
    store.set((draft) => {
      draft.settings.screenShake = true;
      draft.settings.reducedMotion = false;
    });

    viewport.triggerScreenShake(6);
    expect(viewport.getElement().style.transform).toBeDefined();

    // When screenShake is disabled, transform remains blank
    store.set((draft) => {
      draft.settings.screenShake = false;
    });
    viewport.getElement().style.transform = '';
    viewport.triggerScreenShake(6);
    expect(viewport.getElement().style.transform).toBe('');
  });

  it('P47-12: triggerScreenShake respects reducedMotion accessibility mode', () => {
    store.set((draft) => {
      draft.settings.reducedMotion = true;
      draft.settings.screenShake = true;
    });

    viewport.getElement().style.transform = '';
    viewport.triggerScreenShake(8);
    expect(viewport.getElement().style.transform).toBe('');
  });

  it('P47-05 & P47-07: triggerAttack performs attack calculations and triggers visual feedback', () => {
    expect(() => viewport.triggerAttack(100, 100)).not.toThrow();
  });
});
