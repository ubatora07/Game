import { describe, it, expect, beforeEach } from 'vitest';
import { store, createInitialState } from '../src/core/GameState';
import { NAV_TABS, Navigation } from '../src/ui/components/Navigation';
import { MoreMenuModal } from '../src/ui/modals/MoreMenuModal';

// Node DOM mock
function createMockElement(tag: string = 'div'): any {
  return {
    tagName: tag.toUpperCase(),
    className: '',
    classList: {
      contains: function(c: string) { return this.className?.includes(c); },
      add: function(c: string) { this.className = (this.className || '') + ' ' + c; },
      remove: function(c: string) { this.className = this.className?.replace(c, ''); }
    },
    style: {} as Record<string, string>,
    innerHTML: '',
    textContent: '',
    children: [] as any[],
    appendChild: function(child: any) { this.children.push(child); return child; },
    removeChild: function(child: any) {
      this.children = this.children.filter((c: any) => c !== child);
      return child;
    },
    querySelector: function(selector: string) {
      return createMockElement('div');
    },
    querySelectorAll: function(selector: string) {
      return [createMockElement('div'), createMockElement('div')];
    },
    getAttribute: (attr: string) => attr === 'data-id' ? 'quests' : 'screen',
    setAttribute: () => {},
    addEventListener: () => {},
    removeEventListener: () => {}
  };
}

(globalThis as any).document = {
  createElement: (tag: string) => createMockElement(tag),
  addEventListener: () => {},
  removeEventListener: () => {},
  body: createMockElement('body')
};

(globalThis as any).window = {
  setInterval: () => 1,
  clearInterval: () => {}
};

describe('Phase 49 — UI Navigation Redesign Tests', () => {
  beforeEach(() => {
    const fresh = createInitialState();
    store.replace(fresh);
  });

  it('P49-01: NAV_TABS defines the 5 primary navigation tabs', () => {
    expect(NAV_TABS.length).toBe(5);
    const tabIds = NAV_TABS.map(t => t.id);
    expect(tabIds).toContain('ascension');
    expect(tabIds).toContain('home');
    expect(tabIds).toContain('battle');
    expect(tabIds).toContain('heroes');
    expect(tabIds).toContain('more');
  });

  it('P49-03: MoreMenuModal renders all 8 secondary game modes and subsystems', () => {
    expect(MoreMenuModal.id).toBe('more_menu');
    const modalEl = MoreMenuModal.render();
    expect(modalEl).toBeDefined();
    expect(modalEl.innerHTML).toContain('quests');
    expect(modalEl.innerHTML).toContain('tower');
    expect(modalEl.innerHTML).toContain('expeditions');
    expect(modalEl.innerHTML).toContain('relics');
    expect(modalEl.innerHTML).toContain('souls');
    expect(modalEl.innerHTML).toContain('dailies');
    expect(modalEl.innerHTML).toContain('stats');
    expect(modalEl.innerHTML).toContain('settings');
  });

  it('P49-04: Navigation instantiates with active badges checking loop', () => {
    const nav = new Navigation();
    expect(nav.getElement()).toBeDefined();
    expect(() => nav.destroy()).not.toThrow();
  });
});
